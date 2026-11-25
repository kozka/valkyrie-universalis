// The graph of a scenario as the editor draws it (GraphPanel.tsx): one row for each event a trigger starts (EventStart's
// first), the items given at the start, and, apart, what nothing reaches. Each row reads left to right as a game plays
// it: an event, its buttons, the events each button starts (a brace when there are several: the first that can, or one
// at random), and what it puts on the board (+) or takes away (−). A component is drawn whole the first time it comes;
// later it comes again as a copy with the same circled number, so that the graph stays a tree. Each column of a row
// fills from the top, so that what an event leads to sits beside it; the author's moves are kept apart (graphStore.ts). Not in Valkyrie, whose editor has no graph.
import { QuestButtonAction, QuestData, VarOperation, VarTestsLogicalOperator, VarTestsParenthesis, endsGame, type VarTests } from '@universalis/engine';

export type NodeKind = 'event' | 'token' | 'tile' | 'door' | 'ui' | 'spawn' | 'puzzle' | 'item' | 'mplace' | 'monster' | 'activation' | 'missing';

/** What a button does when its condition fails: shown (the condition changes nothing), greyed or hidden. */
export type ConditionEffect = 'none' | 'disable' | 'hide';

export interface GraphButton {
  /** From 1, as Valkyrie numbers them. */
  number: number;
  label: string;
  /** The colour as Valkyrie names it (white, red, #RRGGBB…). */
  colour: string;
  condition: string | null;
  effect: ConditionEffect;
  targets: string[];
}

export interface GraphNode {
  /** The component and which time it is drawn: unique in the graph and the same after a rebuild. */
  id: string;
  name: string;
  kind: NodeKind;
  /** A copy of a component drawn whole somewhere else: not opened again. */
  copy: boolean;
  /** The circled number of a component the graph shows more than once, or 0. */
  mark: number;
  row: number;
  depth: number;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Shown on the board (a tile, a token, a door) or on the screen (a UI element); the rest are drawn dashed. */
  onMap: boolean;
  /** The event's own conditions (vartests), as words. */
  condition: string | null;
  /** The dialog, cut short. */
  text: string;
  buttons: GraphButton[];
  /** What it sets: `pistas + 1`… */
  operations: string[];
  ends: boolean;
  random: boolean;
  /** The picture to draw in a token's circle or on a tile. */
  picture: string | null;
}

export type EdgeKind = 'button' | 'add' | 'remove' | 'monster' | 'activation' | 'inspect';

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  kind: EdgeKind;
  /** The button it comes from, for a button edge, and its place in that button's list. */
  button?: number;
  index?: number;
  /** For add and remove, the place in the event's list. */
  listIndex?: number;
}

export interface GraphBrace {
  id: string;
  from: string;
  button: number;
  /** The nodes it holds, top to bottom. */
  nodes: string[];
  random: boolean;
}

export interface GraphRow {
  index: number;
  /** What starts it: the trigger's name, 'start' for the items given at the start, 'loose' for what nothing reaches. */
  trigger: string;
  root: string | null;
  top: number;
  height: number;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  braces: GraphBrace[];
  rows: GraphRow[];
  byId: Map<string, GraphNode>;
  /** Every node drawn for each component, the whole one first. */
  byName: Map<string, GraphNode[]>;
  width: number;
  height: number;
}

/** The sizes the view draws at, in graph units (CSS pixels at zoom 1). */
export const SIZES = {
  column: 360,
  gap: 26,
  rowGap: 70,
  /** A row's heading, left of its first column. */
  rowHead: 150,
  event: { w: 250, head: 26, text: 34, button: 22, condition: 22, operations: 18 },
  piece: 64,
  pieceLabel: 18,
  small: { w: 170, h: 34 },
} as const;

/** A test list in words: `#heroes ≥ 2 Y clues > 0`. */
export function testsText(tests: VarTests | null | undefined, and: string, or: string): string | null {
  const parts: string[] = [];
  for (const c of tests?.varTestsComponents ?? []) {
    if (c instanceof VarOperation) parts.push(`${c.var} ${operationSign(c.operation)} ${c.value}`);
    else if (c instanceof VarTestsLogicalOperator) parts.push(c.op === 'OR' ? or : and);
    else if (c instanceof VarTestsParenthesis) parts.push(c.parenthesis);
  }
  return parts.length === 0 ? null : parts.join(' ').replace(/\( /g, '(').replace(/ \)/g, ')');
}

function operationSign(op: string): string {
  return { '>=': '≥', '<=': '≤', '!=': '≠', '==': '=' }[op] ?? op;
}

function kindOf(c: QuestData.QuestComponent | undefined): NodeKind {
  if (c === undefined) return 'missing';
  if (c instanceof QuestData.Token) return 'token';
  if (c instanceof QuestData.Door) return 'door';
  if (c instanceof QuestData.UI) return 'ui';
  if (c instanceof QuestData.Spawn) return 'spawn';
  if (c instanceof QuestData.Puzzle) return 'puzzle';
  if (c instanceof QuestData.Event) return 'event';
  if (c instanceof QuestData.Tile) return 'tile';
  if (c instanceof QuestData.QItem) return 'item';
  if (c instanceof QuestData.MPlace) return 'mplace';
  if (c instanceof QuestData.CustomMonster) return 'monster';
  if (c instanceof QuestData.Activation) return 'activation';
  return 'missing';
}

function effectOf(action: QuestButtonAction): ConditionEffect {
  return action === QuestButtonAction.HIDE ? 'hide' : action === QuestButtonAction.DISABLE ? 'disable' : 'none';
}

/** Words the model needs from the app's dictionary. */
export interface GraphWords {
  and: string;
  or: string;
  /** The text of a component's dialog and of a button's label, as the editor shows them. */
  dialog: (event: QuestData.Event) => string;
  label: (button: QuestData.Event['buttons'][number]) => string;
  picture: (c: QuestData.QuestComponent) => string | null;
}

/** The components a component leads to, in the order the graph lays them out. */
interface Out {
  kind: EdgeKind;
  to: string;
  button?: number;
  index?: number;
  listIndex?: number;
}

function outOf(c: QuestData.QuestComponent | undefined, components: ReadonlyMap<string, QuestData.QuestComponent>): Out[] {
  const out: Out[] = [];
  if (c instanceof QuestData.Event) {
    c.buttons.forEach((b, i) => b.eventNames.forEach((to, index) => !to.endsWith('quest.ini') && out.push({ kind: 'button', to, button: i + 1, index })));
    c.addComponents.forEach((to, listIndex) => out.push({ kind: 'add', to, listIndex }));
    c.removeComponents.forEach((to, listIndex) => !to.startsWith('#') && out.push({ kind: 'remove', to, listIndex }));
  }
  if (c instanceof QuestData.Spawn) for (const to of c.mTypes) if (components.has(to)) out.push({ kind: 'monster', to });
  if (c instanceof QuestData.CustomMonster) {
    for (const a of c.activations) out.push({ kind: 'activation', to: components.has('Activation' + a) ? 'Activation' + a : a });
    if (c.evadeEvent !== '') out.push({ kind: 'activation', to: c.evadeEvent });
    if (c.horrorEvent !== '') out.push({ kind: 'activation', to: c.horrorEvent });
  }
  if (c instanceof QuestData.QItem && c.inspect !== '') out.push({ kind: 'inspect', to: c.inspect });
  return out;
}

/** A starting point of a row, in the order the rows go. */
interface Start {
  trigger: string;
  names: string[];
}

function starts(components: ReadonlyMap<string, QuestData.QuestComponent>): Start[] {
  const byTrigger = new Map<string, string[]>();
  for (const [name, c] of components) {
    if (!(c instanceof QuestData.Event) || c.trigger === '') continue;
    let list = byTrigger.get(c.trigger);
    if (list === undefined) byTrigger.set(c.trigger, (list = []));
    list.push(name);
  }
  const triggers = [...byTrigger.keys()].sort((a, b) => Number(b === 'EventStart') - Number(a === 'EventStart'));
  const rows: Start[] = [];
  // Valkyrie queues a trigger's events in the quest's order and runs the last first (QuestGraph.triggered)
  for (const t of triggers) for (const name of byTrigger.get(t)!.reverse()) rows.push({ trigger: t, names: [name] });
  const starting = [...components].filter(([, c]) => c instanceof QuestData.QItem && c.starting).map(([n]) => n);
  if (starting.length > 0) rows.push({ trigger: 'start', names: starting });
  return rows;
}

function sizeOf(node: GraphNode): void {
  const s = SIZES.event;
  if (node.kind === 'tile' || node.kind === 'token' || node.kind === 'door') {
    const own = node.kind === 'token' || node.kind === 'door';
    const buttons = own && !node.copy ? node.buttons.length : 0;
    node.w = s.w;
    node.h = SIZES.piece + SIZES.pieceLabel + (node.condition !== null && !node.copy ? s.condition : 0) + (buttons > 0 ? 8 + buttons * s.button : 0);
    return;
  }
  if (node.kind === 'item' || node.kind === 'mplace' || node.kind === 'monster' || node.kind === 'activation' || node.kind === 'missing' || node.copy) {
    node.w = SIZES.small.w;
    node.h = SIZES.small.h;
    return;
  }
  node.w = s.w;
  node.h =
    s.head +
    (node.text !== '' ? s.text : 0) +
    (node.condition !== null ? s.condition : 0) +
    (node.operations.length > 0 ? s.operations : 0) +
    (node.buttons.length > 0 ? 8 + node.buttons.length * s.button : 0);
}

export function buildGraph(components: ReadonlyMap<string, QuestData.QuestComponent>, words: GraphWords): Graph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const braces: GraphBrace[] = [];
  const rows: GraphRow[] = [];
  const byId = new Map<string, GraphNode>();
  const byName = new Map<string, GraphNode[]>();
  const opened = new Set<string>();

  const make = (name: string, row: number, depth: number): GraphNode => {
    const c = components.get(name);
    const times = byName.get(name)?.length ?? 0;
    const copy = false;
    const kind = kindOf(c);
    const event = c instanceof QuestData.Event ? c : null;
    const node: GraphNode = {
      id: `${name}#${times}`,
      name,
      kind,
      copy,
      mark: 0,
      row,
      depth,
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      onMap: kind === 'tile' || kind === 'token' || kind === 'door' || kind === 'ui',
      condition: c === undefined ? null : testsText(c.tests, words.and, words.or),
      text: event !== null && event.display && !copy ? words.dialog(event).replace(/\s+/g, ' ').trim() : '',
      buttons:
        event === null || copy
          ? []
          : event.buttons.map((b, i) => ({
              number: i + 1,
              label: words.label(b),
              colour: b.color,
              condition: testsText(b.condition, words.and, words.or),
              effect: b.hasCondition ? effectOf(b.conditionFailedAction) : 'none',
              targets: [...b.eventNames],
            })),
      operations: copy || c === undefined ? [] : (c.operations ?? []).map((op) => `${op.var} ${op.operation} ${op.value}`),
      ends: c !== undefined && endsGame(c),
      random: event?.randomEvents ?? false,
      picture: c === undefined ? null : words.picture(c),
    };
    sizeOf(node);
    nodes.push(node);
    byId.set(node.id, node);
    let list = byName.get(name);
    if (list === undefined) byName.set(name, (list = []));
    list.push(node);
    return node;
  };

  // Lays a tree out from a node: its column by depth, its place in the row by the leaves under it
  // Each column of a row fills from the top: a node goes as high as its parent and the nodes above it in its column
  // allow, so that what an event adds or takes away sits beside it, not under everything the event before it opened
  let cursor = 0;
  let bottoms: number[] = [];
  const place = (node: GraphNode, want: number) => {
    node.x = SIZES.rowHead + node.depth * SIZES.column;
    node.y = Math.max(want, bottoms[node.depth] ?? cursor);
    bottoms[node.depth] = node.y + node.h + SIZES.gap;
  };
  const grow = (root: GraphNode) => {
    // Iterative: a long chain of events would overflow a recursive walk
    interface Frame {
      node: GraphNode;
      children: GraphNode[];
      next: number;
    }
    const open = (node: GraphNode): GraphNode[] => {
      const children: GraphNode[] = [];
      // Drawn whole somewhere before: a copy, which opens nothing
      if (opened.has(node.name)) {
        node.copy = true;
        node.buttons = [];
        node.text = '';
        node.operations = [];
        sizeOf(node);
        return children;
      }
      if (!components.has(node.name)) return children;
      opened.add(node.name);
      // Buttons' events grouped per button, for the braces
      const group = new Map<number, string[]>();
      for (const out of outOf(components.get(node.name), components)) {
        const child = make(out.to, node.row, node.depth + 1);
        const edge: GraphEdge = { id: `${node.id}>${child.id}`, from: node.id, to: child.id, kind: out.kind };
        if (out.button !== undefined) edge.button = out.button;
        if (out.index !== undefined) edge.index = out.index;
        if (out.listIndex !== undefined) edge.listIndex = out.listIndex;
        edges.push(edge);
        children.push(child);
        if (out.kind === 'button') {
          let ids = group.get(out.button!);
          if (ids === undefined) group.set(out.button!, (ids = []));
          ids.push(child.id);
        }
      }
      for (const [button, ids] of group) if (ids.length > 1) braces.push({ id: `${node.id}{${button}`, from: node.id, button, nodes: ids, random: node.random });
      return children;
    };
    const rootChildren = open(root);
    place(root, cursor);
    const stack: Frame[] = [{ node: root, children: rootChildren, next: 0 }];
    while (stack.length > 0) {
      const frame = stack.at(-1)!;
      if (frame.next >= frame.children.length) {
        stack.pop();
        continue;
      }
      const child = frame.children[frame.next++]!;
      const children = open(child);
      place(child, frame.node.y);
      stack.push({ node: child, children, next: 0 });
    }
  };
  const rowBottom = () => Math.max(cursor, ...bottoms.filter((b) => b !== undefined));

  const addRow = (trigger: string, names: string[]) => {
    const index = rows.length;
    const top = cursor;
    bottoms = [];
    for (const name of names) {
      if (opened.has(name) && trigger !== 'loose') continue;
      grow(make(name, index, 0));
    }
    const bottom = rowBottom();
    if (bottom === top) return;
    rows.push({ index, trigger, root: names[0] ?? null, top: top - SIZES.rowGap / 2, height: bottom - top + SIZES.rowGap - SIZES.gap });
    cursor = bottom + SIZES.rowGap;
  };

  for (const start of starts(components)) addRow(start.trigger, start.names);
  // What nothing reaches: those that nothing leads to first, so that each opens what hangs from it
  const led = new Set<string>();
  for (const c of components.values()) for (const out of outOf(c, components)) led.add(out.to);
  const rest = [...components.keys()].filter((name) => !opened.has(name) && !(components.get(name) instanceof QuestData.Activation && led.has(name)));
  const loose = [...rest.filter((name) => !led.has(name)), ...rest.filter((name) => led.has(name))].filter((name) => kindOf(components.get(name)) !== 'missing');
  if (loose.length > 0) {
    const index = rows.length;
    const top = cursor;
    bottoms = [];
    for (const name of loose) if (!opened.has(name)) grow(make(name, index, 0));
    const bottom = rowBottom();
    if (bottom > top) {
      rows.push({ index, trigger: 'loose', root: null, top: top - SIZES.rowGap / 2, height: bottom - top + SIZES.rowGap - SIZES.gap });
      cursor = bottom + SIZES.rowGap;
    }
  }

  // A circled number for what is drawn more than once, in the order they first come
  let mark = 0;
  for (const node of nodes) {
    const all = byName.get(node.name)!;
    if (all.length < 2 || node.mark !== 0) continue;
    mark++;
    for (const n of all) n.mark = mark;
  }
  // The whole one first
  for (const all of byName.values()) all.sort((a, b) => Number(a.copy) - Number(b.copy));

  let width = 0;
  for (const n of nodes) width = Math.max(width, n.x + n.w);
  return { nodes, edges, braces, rows, byId, byName, width: width + SIZES.column / 2, height: Math.max(cursor, 1) };
}

/** ①…⑳, then the number in brackets. */
export function circled(n: number): string {
  if (n >= 1 && n <= 20) return String.fromCodePoint(0x2460 + n - 1);
  return `(${n})`;
}
