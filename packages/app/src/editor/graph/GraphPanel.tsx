// The scenario as a graph, in the panel below the map (model.ts lays it out): tokens as circles with their picture,
// tiles as small squares, events as dashed boxes (they are not on the board) with their buttons in a solid square, each
// in its colour, conditions in pink (a button's lit by what it does to the button), what an event adds (+) and takes
// away (−), braces where a button starts several events, and a row for each event a trigger starts. It is edited in
// place: a node is chosen (the map and the panel on the left follow), moved, deleted; a button's port makes a new
// event or, dragged onto another, links it; an event's + port puts a new piece on the board or, dragged, adds one;
// a link is chosen to take it away or to put a new event in the middle. Every change goes through the session, so
// Undo takes it back. Not in Valkyrie, whose editor has no graph.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { ColorUtil, CommonStringKeys, EditorComponentEvent, Game, QUEST_SELECTION, QuestData, StringKey } from '@universalis/engine';
import { RichText } from '../../ui/RichText.tsx';
import { Picture } from '../../ui/Picture.tsx';
import { run } from '../../ui/run.ts';
import { val } from '../../ui/text.ts';
import { Tool } from '../chrome.tsx';
import { choicePicture } from '../Chooser.tsx';
import { useEditor } from '../editorState.ts';
import { Icon, typeIcon, type IconName } from '../Icon.tsx';
import { change, currentSession, select, worstAt } from '../session.ts';
import { edi } from '../text.ts';
import { keepMoves, moveNode, openGraph, resetMoves, useGraph } from './graphStore.ts';
import { SIZES, buildGraph, circled, type Graph, type GraphButton, type GraphEdge, type GraphNode, type GraphWords } from './model.ts';
import './GraphPanel.css';

interface View {
  tx: number;
  ty: number;
  k: number;
}

const MIN_ZOOM = 0.08;
const MAX_ZOOM = 2.5;
/** Drawn around the visible part, so that a small pan does not show empty space. */
const MARGIN = 400;

function words(): GraphWords {
  return {
    and: CommonStringKeys.AND.translate(),
    or: CommonStringKeys.OR.translate(),
    dialog: (event) => EditorComponentEvent.shown(event.text.translate(true) || event.text.translate()),
    label: (button) => {
      const own = button.label.translate(true);
      return own === '' ? edi('EDITOR_GRAPH_NO_LABEL') : EditorComponentEvent.shown(own);
    },
    picture: (c) => {
      if (c instanceof QuestData.Token) return choicePicture(c.customImage !== '' ? c.customImage : c.tokenName);
      if (c instanceof QuestData.Tile) return choicePicture(c.customImage !== '' ? c.customImage : c.tileSideName);
      return null;
    },
  };
}

/** Where a node is drawn: where the graph put it, moved by the author. */
function placed(node: GraphNode, offsets: Record<string, { dx: number; dy: number }>): { x: number; y: number } {
  const o = offsets[node.id];
  return o === undefined ? { x: node.x, y: node.y } : { x: node.x + o.dx, y: node.y + o.dy };
}

const E = SIZES.event;

/** How far down a node its parts start: the condition, the heading or picture, the text, what it sets, the buttons. */
function layoutOf(node: GraphNode) {
  const condition = node.condition !== null && !node.copy ? E.condition : 0;
  if (node.kind === 'tile' || node.kind === 'token' || node.kind === 'door') {
    const picture = condition;
    const buttons = picture + SIZES.piece + SIZES.pieceLabel;
    return { condition, entry: picture + SIZES.piece / 2, effects: picture + SIZES.piece / 2, buttons };
  }
  if (node.copy || node.w === SIZES.small.w) return { condition: 0, entry: node.h / 2, effects: node.h / 2, buttons: node.h };
  const head = condition;
  const text = head + E.head;
  const operations = text + (node.text !== '' ? E.text : 0);
  const buttons = operations + (node.operations.length > 0 ? E.operations : 0);
  return { condition, entry: head + E.head / 2, effects: head + E.head / 2, buttons };
}

/** Where a button's port is, from the node's top. */
function buttonPortY(node: GraphNode, number: number): number {
  return layoutOf(node).buttons + 4 + (number - 0.5) * E.button;
}

function curve(x1: number, y1: number, x2: number, y2: number): string {
  const bend = Math.max(40, Math.abs(x2 - x1) / 2);
  return `M${x1},${y1} C${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2}`;
}

/** A brace from top to bottom, its point to the left at the middle. */
function brace(x: number, top: number, bottom: number): string {
  const mid = (top + bottom) / 2;
  const w = 10;
  return `M${x + w},${top} C${x},${top} ${x + w},${mid} ${x},${mid} C${x + w},${mid} ${x},${bottom} ${x + w},${bottom}`;
}

function colourOf(name: string): string {
  return ColorUtil.fromName(name);
}

function iconOf(node: GraphNode): IconName {
  if (node.kind === 'missing') return 'alert';
  if (node.kind === 'item') return 'qitem';
  if (node.kind === 'mplace') return 'mplace';
  if (node.kind === 'monster') return 'monster';
  if (node.kind === 'activation') return 'activation';
  const c = Game.get().currentQuest?.qd.components.get(node.name);
  return c === undefined ? 'event' : typeIcon(c.typeDynamic);
}

/** The row's heading: what starts it. */
function rowTitle(trigger: string): string {
  if (trigger === 'start') return edi('EDITOR_GRAPH_ROW_ITEMS');
  if (trigger === 'loose') return edi('EDITOR_GRAPH_ROW_LOOSE');
  if (trigger === 'EventStart') return edi('EDITOR_GRAPH_ROW_START');
  return edi('EDITOR_GRAPH_ROW', trigger);
}

/** What a button's condition does, for its colour and its words. */
function effectWords(button: GraphButton): string {
  return edi(button.effect === 'hide' ? 'EDITOR_GRAPH_SHOWS_IF' : button.effect === 'disable' ? 'EDITOR_GRAPH_GREYS_IF' : 'EDITOR_GRAPH_IGNORES');
}

function ButtonRows({ node, onPort }: { node: GraphNode; onPort: (e: ReactPointerEvent, button: number) => void }) {
  if (node.buttons.length === 0) return null;
  return (
    <div className="graph-buttons" style={{ height: 8 + node.buttons.length * E.button }}>
      {node.buttons.map((b) => (
        <div key={b.number} className="graph-button" style={{ height: E.button }}>
          {b.condition !== null && (
            <span className={`graph-button-condition graph-effect-${b.effect}`} title={`${effectWords(b)}: ${b.condition}`}>
              {b.condition}
            </span>
          )}
          <span className="graph-swatch" style={{ background: colourOf(b.colour) }} />
          <span className="graph-button-label" style={{ color: colourOf(b.colour) }}>
            <RichText text={b.label} />
          </span>
          <span
            className="graph-port"
            role="button"
            aria-label={edi('EDITOR_GRAPH_PORT', b.number)}
            title={edi('EDITOR_GRAPH_PORT', b.number)}
            data-graph-port=""
            onPointerDown={(e) => onPort(e, b.number)}
          />
        </div>
      ))}
    </div>
  );
}

function Condition({ text }: { text: string }) {
  return (
    <div className="graph-condition" style={{ height: E.condition }} title={text}>
      <span>{text}</span>
    </div>
  );
}

function Mark({ node }: { node: GraphNode }) {
  if (node.mark === 0) return null;
  return (
    <span className="graph-mark" title={edi('EDITOR_GRAPH_REPEATED', node.mark)}>
      {circled(node.mark)}
    </span>
  );
}

function ProblemDot({ name }: { name: string }) {
  const worst = worstAt(name);
  if (worst === null || worst === 'hint') return null;
  return <span className={`editor-dot editor-dot-${worst}`} aria-label={edi(worst === 'breaks' ? 'EDITOR_DOT_BREAKS' : 'EDITOR_DOT_WRONG')} role="img" />;
}

/** One node, drawn as what it is. */
function NodeView({
  node,
  at,
  selected,
  starts,
  onDown,
  onPort,
  onEffects,
  onOpen,
  far,
}: {
  node: GraphNode;
  at: { x: number; y: number };
  selected: boolean;
  /** Seen from so far that its words could not be read: only its shape is drawn. */
  far: boolean;
  /** The row's first event: the trigger that starts it. */
  starts: string | null;
  onDown: (e: ReactPointerEvent, node: GraphNode) => void;
  onPort: (e: ReactPointerEvent, node: GraphNode, button: number) => void;
  onEffects: (e: ReactPointerEvent, node: GraphNode) => void;
  /** A double press: a copy goes to where it is drawn whole; the rest comes to the middle. */
  onOpen: (node: GraphNode) => void;
}) {
  const layout = layoutOf(node);
  const style = { left: at.x, top: at.y, width: node.w, height: node.h };
  const common = {
    'data-graph-node': node.name,
    'data-graph-id': node.id,
    'aria-label': node.name,
    'aria-current': selected,
    title: node.text !== '' ? `${node.name}\n${node.text}` : undefined,
    onPointerDown: (e: ReactPointerEvent) => onDown(e, node),
    onDoubleClick: () => onOpen(node),
  };
  const cls = (kind: string) => `graph-node graph-${kind}${selected ? ' graph-selected' : ''}${node.copy ? ' graph-copy' : ''}${node.onMap ? ' graph-onmap' : ''}`;
  if (far) {
    if (!node.copy && (node.kind === 'token' || node.kind === 'tile' || node.kind === 'door')) {
      return (
        <div className={cls('piece') + ' graph-far'} style={style} {...common}>
          <div className={`graph-picture ${node.kind === 'token' ? 'graph-circle' : 'graph-square'}`} style={{ width: SIZES.piece, height: SIZES.piece, marginTop: layout.condition }} />
        </div>
      );
    }
    return <div className={cls(node.copy || node.w === SIZES.small.w ? 'small' : node.kind === 'ui' ? 'ui' : 'event') + ' graph-far'} style={style} {...common} />;
  }
  const effects = node.kind !== 'tile' && !node.copy && Game.get().currentQuest?.qd.components.get(node.name) instanceof QuestData.Event && (
    <span
      className="graph-effects-port"
      role="button"
      style={{ top: layout.effects - 9 }}
      aria-label={edi('EDITOR_GRAPH_ADD_PIECE')}
      title={edi('EDITOR_GRAPH_ADD_PIECE')}
      data-graph-port=""
      onPointerDown={(e) => onEffects(e, node)}
    >
      +
    </span>
  );

  if (node.copy || node.w === SIZES.small.w) {
    return (
      <div className={cls('small')} style={style} {...common} title={node.copy ? edi('EDITOR_GRAPH_COPY', node.name) : node.name}>
        <Icon name={iconOf(node)} />
        <span className="graph-name">{node.name}</span>
        <Mark node={node} />
      </div>
    );
  }

  if (node.kind === 'tile' || node.kind === 'token' || node.kind === 'door') {
    const shape = node.kind === 'token' ? 'graph-circle' : 'graph-square';
    return (
      <div className={cls('piece')} style={style} {...common}>
        {node.condition !== null && <Condition text={node.condition} />}
        <div className={`graph-picture ${shape}`} style={{ width: SIZES.piece, height: SIZES.piece }}>
          {node.picture !== null ? <Picture file={node.picture} name={node.name} decorative /> : <Icon name={iconOf(node)} />}
          <Mark node={node} />
        </div>
        <div className="graph-piece-name" style={{ height: SIZES.pieceLabel }}>
          {node.name}
          <ProblemDot name={node.name} />
        </div>
        <ButtonRows node={node} onPort={(e, b) => onPort(e, node, b)} />
        {effects}
      </div>
    );
  }

  return (
    <div className={cls(node.kind === 'ui' ? 'ui' : 'event')} style={style} {...common}>
      {node.condition !== null && <Condition text={node.condition} />}
      <div className="graph-head" style={{ height: E.head }}>
        <Icon name={iconOf(node)} />
        <span className="graph-name">{node.name}</span>
        {starts !== null && <span className="graph-badge graph-badge-trigger">{starts}</span>}
        {node.random && <span className="graph-badge">{edi('EDITOR_GRAPH_RANDOM_SHORT')}</span>}
        {node.ends && <span className="graph-badge graph-badge-end">{edi('EDITOR_GRAPH_END')}</span>}
        <ProblemDot name={node.name} />
        <Mark node={node} />
      </div>
      {node.text !== '' && (
        <div className="graph-text" style={{ height: E.text }}>
          <RichText text={node.text} />
        </div>
      )}
      {node.operations.length > 0 && (
        <div className="graph-operations" style={{ height: E.operations }} title={node.operations.join(', ')}>
          {node.operations.join(' · ')}
        </div>
      )}
      <ButtonRows node={node} onPort={(e, b) => onPort(e, node, b)} />
      {effects}
    </div>
  );
}

/** Where an edge starts and ends, in graph units. */
function ends(edge: GraphEdge, graph: Graph, offsets: Record<string, { dx: number; dy: number }>): { x1: number; y1: number; x2: number; y2: number } | null {
  const from = graph.byId.get(edge.from);
  const to = graph.byId.get(edge.to);
  if (from === undefined || to === undefined) return null;
  const a = placed(from, offsets);
  const b = placed(to, offsets);
  const y1 = a.y + (edge.kind === 'button' && edge.button !== undefined ? buttonPortY(from, edge.button) : layoutOf(from).effects);
  return { x1: a.x + from.w, y1, x2: b.x, y2: b.y + layoutOf(to).entry };
}

interface LinkDrag {
  from: GraphNode;
  /** A button's number, or 0 for the event's + port. */
  button: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  moved: boolean;
  start: { x: number; y: number };
}

interface Menu {
  x: number;
  y: number;
  items: { label: string; icon: IconName; act: () => void; danger?: boolean }[];
}

/** Makes a change Undo takes back, then selects what it made. */
function act(label: string, action: () => string | void): void {
  run(() => {
    let made: string | void = undefined;
    change(label, () => {
      made = action();
    });
    if (typeof made === 'string' && made !== '') select(made);
  });
}

function eventOf(name: string): QuestData.Event | null {
  const c = Game.get().currentQuest?.qd.components.get(name);
  return c instanceof QuestData.Event ? c : null;
}

/** A new event at the end of a button's list (EditorComponentEvent.SelectAddEvent with {NEW:Event}). */
function newEventFrom(from: string, button: number): void {
  act(edi('EDITOR_GRAPH_NEW_EVENT_STEP', from), () => {
    const event = eventOf(from);
    if (event === null) return;
    return EditorComponentEvent.selectAddEvent(event, event.buttons[button - 1]!.eventNames.length, button, false, '{NEW:Event}');
  });
}

/** A button leads to an event already there. */
function linkTo(from: string, button: number, to: string): void {
  const event = eventOf(from);
  const target = Game.get().currentQuest?.qd.components.get(to);
  if (event === null || !(target instanceof QuestData.Event)) return;
  act(edi('EDITOR_GRAPH_LINK_STEP', from, to), () => {
    EditorComponentEvent.selectAddEvent(event, event.buttons[button - 1]!.eventNames.length, button, false, to);
  });
}

/** An event puts a piece already there on the board, or gives an item. */
function addTo(from: string, piece: string): void {
  const event = eventOf(from);
  if (event === null || !EditorComponentEvent.visibilityChoices(true).some((c) => c.value === piece)) return;
  act(edi('EDITOR_GRAPH_ADD_STEP', from, piece), () => EditorComponentEvent.selectAddVisibility(event, true, -1, piece));
}

/** An event puts a new piece on the board (it shows on the map where the camera is), or gives a new item. */
function addNew(from: string, type: string): void {
  const event = eventOf(from);
  if (event === null) return;
  act(edi('EDITOR_GRAPH_ADD_STEP', from, typeLabel(type)), () => {
    EditorComponentEvent.selectAddVisibility(event, true, -1, '{NEW:' + type + '}');
    return event.addComponents.at(-1);
  });
}

function typeLabel(type: string): string {
  return new StringKey('val', type.toUpperCase()).translate();
}

/** Takes a link away: a button's event, or what an event adds or takes away. */
function unlink(edge: GraphEdge, graph: Graph): void {
  const from = graph.byId.get(edge.from);
  const to = graph.byId.get(edge.to);
  const event = from === undefined ? null : eventOf(from.name);
  if (event === null || to === undefined) return;
  act(edi('EDITOR_GRAPH_UNLINK_STEP', from!.name, to.name), () => {
    if (edge.kind === 'button' && edge.button !== undefined && edge.index !== undefined) EditorComponentEvent.removeEvent(event, edge.index, edge.button);
    else if ((edge.kind === 'add' || edge.kind === 'remove') && edge.listIndex !== undefined) EditorComponentEvent.removeVisibility(event, edge.listIndex, edge.kind === 'add');
  });
}

/** A new event in the middle of a button's link: the button leads to it, and its own button to where the link went. */
function insertBetween(edge: GraphEdge, graph: Graph): void {
  const from = graph.byId.get(edge.from);
  const to = graph.byId.get(edge.to);
  const event = from === undefined ? null : eventOf(from.name);
  if (event === null || to === undefined || edge.kind !== 'button' || edge.button === undefined || edge.index === undefined) return;
  act(edi('EDITOR_GRAPH_INSERT_STEP', from!.name, to.name), () => {
    const made = EditorComponentEvent.selectAddEvent(event, edge.index!, edge.button!, true, '{NEW:Event}');
    const middle = eventOf(made)!;
    if (middle.buttons.length === 0) EditorComponentEvent.addButton(middle);
    EditorComponentEvent.selectAddEvent(middle, 0, 1, false, to.name);
    return made;
  });
}

/** A new component with nothing leading to it yet (the {New …} of the list). */
function makeLoose(type: string): void {
  act(edi('EDITOR_NEW_COMPONENT', typeLabel(type)), () => {
    Game.get().qed!.newComponent(type);
    return Game.get().qed!.selection ?? undefined;
  });
}

function Minimap({ graph, offsets, view, size, onGo }: { graph: Graph; offsets: Record<string, { dx: number; dy: number }>; view: View; size: { w: number; h: number }; onGo: (x: number, y: number) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const W = 180;
  const H = 110;
  const scale = Math.min(W / Math.max(graph.width, 1), H / Math.max(graph.height, 1));
  useEffect(() => {
    const context = canvas.current?.getContext('2d');
    if (context === null || context === undefined) return;
    const style = getComputedStyle(canvas.current!);
    context.clearRect(0, 0, W, H);
    context.fillStyle = style.getPropertyValue('--graph-edge').trim() || 'gray';
    for (const n of graph.nodes) {
      const p = placed(n, offsets);
      context.fillRect(p.x * scale, p.y * scale, Math.max(1, n.w * scale), Math.max(1, n.h * scale));
    }
    context.strokeStyle = style.getPropertyValue('--accent').trim() || 'white';
    context.lineWidth = 1;
    context.strokeRect((-view.tx / view.k) * scale, (-view.ty / view.k) * scale, (size.w / view.k) * scale, (size.h / view.k) * scale);
  });
  return (
    <canvas
      ref={canvas}
      className="graph-minimap"
      width={W}
      height={H}
      aria-hidden="true"
      onPointerDown={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        onGo((e.clientX - r.left) / scale, (e.clientY - r.top) / scale);
      }}
    />
  );
}

function Legend() {
  const rows: [ReactNode, string][] = [
    [<span className="graph-legend-circle" />, 'EDITOR_GRAPH_LEGEND_TOKEN'],
    [<span className="graph-legend-square" />, 'EDITOR_GRAPH_LEGEND_TILE'],
    [<span className="graph-legend-event" />, 'EDITOR_GRAPH_LEGEND_EVENT'],
    [<span className="graph-legend-buttons" />, 'EDITOR_GRAPH_LEGEND_BUTTONS'],
    [<span className="graph-legend-condition" />, 'EDITOR_GRAPH_LEGEND_CONDITION'],
    [<span className="graph-legend-effect graph-effect-hide" />, 'EDITOR_GRAPH_SHOWS_IF'],
    [<span className="graph-legend-effect graph-effect-disable" />, 'EDITOR_GRAPH_GREYS_IF'],
    [<span className="graph-legend-effect graph-effect-none" />, 'EDITOR_GRAPH_IGNORES'],
    [<span className="graph-legend-sign graph-add">+</span>, 'EDITOR_GRAPH_LEGEND_ADD'],
    [<span className="graph-legend-sign graph-remove">−</span>, 'EDITOR_GRAPH_LEGEND_REMOVE'],
    [<span className="graph-legend-brace">{'{'}</span>, 'EDITOR_GRAPH_LEGEND_BRACE'],
    [<span className="graph-mark">①</span>, 'EDITOR_GRAPH_LEGEND_MARK'],
  ];
  return (
    <div className="graph-legend" role="note" aria-label={edi('EDITOR_GRAPH_LEGEND')}>
      {rows.map(([sign, key]) => (
        <div key={key}>
          {sign}
          <span>{edi(key)}</span>
        </div>
      ))}
    </div>
  );
}

export function GraphPanel() {
  const revision = useEditor((s) => s.revision);
  const { offsets, row, follow, legend, edge: chosenEdge } = useGraph();
  const game = Game.get();
  const quest = game.currentQuest!;
  const selection = game.qed?.selection ?? QUEST_SELECTION;
  const folder = currentSession().folder;
  useEffect(() => openGraph(folder), [folder]);

  const graph = useMemo(() => buildGraph(quest.qd.components, words()), [revision, quest]);
  const box = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const lines = useRef<SVGGElement>(null);
  const view = useRef<View>({ tx: 40, ty: 30, k: 0.85 });
  const [size, setSize] = useState({ w: 800, h: 300 });
  // Counts the view's changes, so that what is drawn follows the visible part
  const [frame, setFrame] = useState(0);
  const pending = useRef(false);
  const [link, setLink] = useState<LinkDrag | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [search, setSearch] = useState('');

  const apply = () => {
    const { tx, ty, k } = view.current;
    if (world.current !== null) world.current.style.transform = `translate(${tx}px, ${ty}px) scale(${k})`;
    lines.current?.setAttribute('transform', `translate(${tx} ${ty}) scale(${k})`);
    if (pending.current) return;
    pending.current = true;
    requestAnimationFrame(() => {
      pending.current = false;
      setFrame((f) => f + 1);
    });
  };
  useLayoutEffect(apply);

  useEffect(() => {
    const element = box.current;
    if (element === null || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => setSize({ w: element.clientWidth, h: element.clientHeight }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const visibleRows = row === null ? null : new Set([row]);
  const shown = (n: GraphNode) => visibleRows === null || visibleRows.has(n.row);

  /** Shows a rectangle of the graph whole, as close as it fits. */
  const fit = (x: number, y: number, w: number, h: number) => {
    const k = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(size.w / (w + 80), size.h / (h + 60))));
    view.current = { k, tx: size.w / 2 - (x + w / 2) * k, ty: size.h / 2 - (y + h / 2) * k };
    apply();
  };
  const fitAll = () => {
    const nodes = graph.nodes.filter(shown);
    if (nodes.length === 0) return;
    let x1 = Infinity;
    let y1 = Infinity;
    let x2 = -Infinity;
    let y2 = -Infinity;
    for (const n of nodes) {
      const p = placed(n, offsets);
      x1 = Math.min(x1, p.x);
      y1 = Math.min(y1, p.y);
      x2 = Math.max(x2, p.x + n.w);
      y2 = Math.max(y2, p.y + n.h);
    }
    fit(x1 - SIZES.rowHead, y1, x2 - x1 + SIZES.rowHead, y2 - y1);
  };
  /** Brings a node into the middle, keeping the zoom unless it is too far. */
  const centre = (node: GraphNode) => {
    const p = placed(node, offsets);
    const k = Math.max(view.current.k, 0.6);
    view.current = { k, tx: size.w / 2 - (p.x + node.w / 2) * k, ty: size.h / 2 - (p.y + node.h / 2) * k };
    apply();
  };

  // The first time, and when the row changes: all of it in view
  const fitted = useRef<string>('');
  useEffect(() => {
    const key = `${folder}|${row}|${size.w > 0}`;
    if (fitted.current === key || size.w === 0) return;
    fitted.current = key;
    if (row === null) {
      // Opens at the start, readable
      view.current = { tx: 30, ty: 40, k: 0.85 };
      apply();
    } else fitAll();
  }, [folder, row, size.w]);

  // What is selected elsewhere comes into view
  const lastSelection = useRef(selection);
  useEffect(() => {
    if (lastSelection.current === selection) return;
    lastSelection.current = selection;
    if (!follow) return;
    const node = graph.byName.get(selection)?.[0];
    if (node === undefined) return;
    if (!shown(node)) useGraph.setState({ row: null });
    const p = placed(node, offsets);
    const { tx, ty, k } = view.current;
    const sx = p.x * k + tx;
    const sy = p.y * k + ty;
    if (sx < 0 || sy < 0 || sx + node.w * k > size.w || sy + node.h * k > size.h) centre(node);
  }, [selection]);

  // Panning and zooming
  const pan = useRef<{ x: number; y: number; tx: number; ty: number; id: number } | null>(null);
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const rect = box.current!.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { tx, ty, k } = view.current;
    if (e.shiftKey && !e.ctrlKey) {
      view.current = { k, tx: tx - (e.deltaY || e.deltaX), ty };
    } else {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, k * Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0015))));
      view.current = { k: next, tx: px - ((px - tx) / k) * next, ty: py - ((py - ty) / k) * next };
    }
    apply();
  };
  useEffect(() => {
    const element = box.current;
    if (element === null) return;
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  });

  const toGraph = (clientX: number, clientY: number) => {
    const rect = box.current!.getBoundingClientRect();
    const { tx, ty, k } = view.current;
    return { x: (clientX - rect.left - tx) / k, y: (clientY - rect.top - ty) / k };
  };

  const onBackgroundDown = (e: ReactPointerEvent) => {
    if (e.button === 2) return;
    setMenu(null);
    if (chosenEdge !== null) useGraph.setState({ edge: null });
    box.current!.setPointerCapture(e.pointerId);
    pan.current = { x: e.clientX, y: e.clientY, tx: view.current.tx, ty: view.current.ty, id: e.pointerId };
  };
  const onMove = (e: ReactPointerEvent) => {
    if (pan.current !== null && pan.current.id === e.pointerId) {
      view.current = { ...view.current, tx: pan.current.tx + e.clientX - pan.current.x, ty: pan.current.ty + e.clientY - pan.current.y };
      apply();
      return;
    }
    if (drag.current !== null && drag.current.id === e.pointerId) {
      const d = drag.current;
      const dx = (e.clientX - d.x) / view.current.k;
      const dy = (e.clientY - d.y) / view.current.k;
      if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 5) return;
      d.moved = true;
      moveNode(d.node.id, d.dx + dx, d.dy + dy);
      return;
    }
    if (link !== null) {
      const p = toGraph(e.clientX, e.clientY);
      setLink({ ...link, x2: p.x, y2: p.y, moved: link.moved || Math.hypot(e.clientX - link.start.x, e.clientY - link.start.y) > 5 });
    }
  };
  const onUp = (e: ReactPointerEvent) => {
    if (pan.current !== null && pan.current.id === e.pointerId) pan.current = null;
    if (drag.current !== null && drag.current.id === e.pointerId) {
      const d = drag.current;
      drag.current = null;
      if (d.moved) keepMoves();
      else run(() => select(d.node.name));
    }
    if (link !== null) {
      const l = link;
      setLink(null);
      const under = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-graph-node]');
      const target = under?.dataset.graphNode;
      if (l.moved && target !== undefined && target !== '') {
        if (l.button > 0) linkTo(l.from.name, l.button, target);
        else addTo(l.from.name, target);
      } else if (!l.moved) {
        if (l.button > 0) newEventFrom(l.from.name, l.button);
        else openAddMenu(l.from, e.clientX, e.clientY);
      }
    }
  };

  const drag = useRef<{ node: GraphNode; x: number; y: number; dx: number; dy: number; moved: boolean; id: number } | null>(null);
  const onNodeDown = (e: ReactPointerEvent, node: GraphNode) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setMenu(null);
    useGraph.setState({ edge: null });
    box.current!.setPointerCapture(e.pointerId);
    const o = offsets[node.id] ?? { dx: 0, dy: 0 };
    drag.current = { node, x: e.clientX, y: e.clientY, dx: o.dx, dy: o.dy, moved: false, id: e.pointerId };
  };
  const startLink = (e: ReactPointerEvent, node: GraphNode, button: number) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    box.current!.setPointerCapture(e.pointerId);
    const p = placed(node, offsets);
    const y1 = p.y + (button > 0 ? buttonPortY(node, button) : layoutOf(node).effects);
    setLink({ from: node, button, x1: p.x + node.w, y1, x2: p.x + node.w, y2: y1, moved: false, start: { x: e.clientX, y: e.clientY } });
  };

  const openAddMenu = (node: GraphNode, clientX: number, clientY: number) => {
    const rect = box.current!.getBoundingClientRect();
    const types = ['Token', 'Tile', 'UI', 'QItem', ...(game.gameType.typeName() === 'D2E' ? ['Door'] : [])];
    setMenu({
      x: clientX - rect.left,
      y: clientY - rect.top,
      items: types.map((type) => ({ label: edi('EDITOR_GRAPH_ADD_NEW', typeLabel(type)), icon: typeIcon(type), act: () => addNew(node.name, type) })),
    });
  };
  const openNodeMenu = (e: React.MouseEvent, node: GraphNode | null) => {
    e.preventDefault();
    const rect = box.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (node === null) {
      const types = ['Event', 'Token', 'Tile', 'UI', 'Spawn', 'QItem', ...(game.gameType.typeName() === 'D2E' ? ['Door', 'MPlace'] : ['Puzzle'])];
      setMenu({ x, y, items: types.map((type) => ({ label: val('NEW_X', new StringKey('val', type.toUpperCase())), icon: typeIcon(type), act: () => makeLoose(type) })) });
      return;
    }
    run(() => select(node.name));
    const event = eventOf(node.name);
    const items: Menu['items'] = [];
    if (event !== null) {
      items.push({ label: edi('EDITOR_ADD_BUTTON'), icon: 'plus', act: () => act(edi('EDITOR_EDIT_STEP', node.name), () => EditorComponentEvent.addButton(event)) });
      event.buttons.forEach((_, i) => items.push({ label: edi('EDITOR_GRAPH_NEW_EVENT_FROM', i + 1), icon: 'event', act: () => newEventFrom(node.name, i + 1) }));
      items.push({ label: edi('EDITOR_GRAPH_ADD_PIECE'), icon: 'token', act: () => openAddMenu(node, e.clientX, e.clientY) });
    }
    if (node.kind === 'ui') items.push({ label: edi('EDITOR_UI_STAGE_OPEN'), icon: 'ui', act: () => useEditor.setState({ stage: true }) });
    const whole = graph.byName.get(node.name)?.[0];
    if (node.copy && whole !== undefined) items.push({ label: edi('EDITOR_GRAPH_GO_WHOLE'), icon: 'locate', act: () => centre(whole) });
    items.push({ label: CommonStringKeys.DELETE.translate(), icon: 'trash', danger: true, act: () => useEditor.setState({ deleting: true }) });
    setMenu({ x, y, items });
  };

  // The graph's own keys, while it has the focus: they do not reach the workbench's
  const onKey = (e: React.KeyboardEvent) => {
    if (e.target instanceof Element && e.target.closest('input, select, textarea')) return;
    if (e.key === 'Delete' && chosenEdge !== null) {
      e.stopPropagation();
      const edge = graph.edges.find((x) => x.id === chosenEdge);
      useGraph.setState({ edge: null });
      if (edge !== undefined) unlink(edge, graph);
    } else if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.altKey) {
      e.stopPropagation();
      fitAll();
    } else if (e.key === 'Escape') {
      setMenu(null);
      useGraph.setState({ edge: null });
    }
  };

  // Only what is near the visible part is drawn: a scenario can have thousands of nodes
  void frame;
  const { tx, ty, k } = view.current;
  const vx1 = -tx / k - MARGIN;
  const vy1 = -ty / k - MARGIN;
  const vx2 = vx1 + size.w / k + 2 * MARGIN;
  const vy2 = vy1 + size.h / k + 2 * MARGIN;
  const near = (x: number, y: number, w: number, h: number) => x + w >= vx1 && x <= vx2 && y + h >= vy1 && y <= vy2;
  const visible = graph.nodes.filter((n) => {
    if (!shown(n)) return false;
    const p = placed(n, offsets);
    return near(p.x, p.y, n.w, n.h);
  });
  const visibleIds = new Set(visible.map((n) => n.id));
  const braced = new Set<string>();
  for (const b of graph.braces) for (const id of b.nodes) braced.add(`${b.from}|${b.button}|${id}`);
  const lower = search.trim().toLowerCase();
  const found = lower === '' ? null : new Set(graph.nodes.filter((n) => n.name.toLowerCase().includes(lower)).map((n) => n.id));
  const rowStarts = new Map<string, string>();
  for (const r of graph.rows) if (r.root !== null && r.trigger !== 'start') rowStarts.set(`${r.root}#0`, r.trigger);

  const edgeViews: ReactNode[] = [];
  for (const edge of graph.edges) {
    const from = graph.byId.get(edge.from)!;
    if (!shown(from)) continue;
    const at = ends(edge, graph, offsets);
    if (at === null) continue;
    // A long line crosses the view with both its ends out of it
    if (!visibleIds.has(edge.from) && !visibleIds.has(edge.to) && !near(Math.min(at.x1, at.x2), Math.min(at.y1, at.y2), Math.abs(at.x2 - at.x1), Math.abs(at.y2 - at.y1))) continue;
    const inBrace = edge.kind === 'button' && braced.has(`${edge.from}|${edge.button}|${edge.to}`);
    let path: string;
    if (inBrace) {
      // To the brace's point; the brace reaches each event
      const b = graph.braces.find((x) => x.from === edge.from && x.button === edge.button)!;
      if (b.nodes[0] !== edge.to) continue;
      const nodes = b.nodes.map((id) => graph.byId.get(id)!);
      const top = Math.min(...nodes.map((n) => placed(n, offsets).y));
      const bottom = Math.max(...nodes.map((n) => placed(n, offsets).y + n.h));
      const x = Math.min(...nodes.map((n) => placed(n, offsets).x)) - 28;
      path = curve(at.x1, at.y1, x, (top + bottom) / 2);
    } else path = curve(at.x1, at.y1, at.x2, at.y2);
    const button = edge.kind === 'button' && edge.button !== undefined ? from.buttons[edge.button - 1] : undefined;
    const chosen = chosenEdge === edge.id;
    const touching = from.name === selection || graph.byId.get(edge.to)?.name === selection;
    const mx = (at.x1 + (inBrace ? at.x2 - 28 : at.x2)) / 2;
    const my = (at.y1 + at.y2) / 2;
    edgeViews.push(
      <g key={edge.id} className={`graph-edge graph-edge-${edge.kind}${chosen ? ' graph-edge-chosen' : ''}${touching ? ' graph-edge-near' : ''}`}>
        <path d={path} className="graph-edge-line" style={button !== undefined ? { stroke: colourOf(button.colour) } : undefined} />
        <path
          d={path}
          className="graph-edge-hit"
          onPointerDown={(e) => {
            e.stopPropagation();
            setMenu(null);
            useGraph.setState({ edge: edge.id });
            box.current?.focus();
          }}
        />
        {(edge.kind === 'add' || edge.kind === 'remove') && !inBrace && (
          <g transform={`translate(${mx} ${my})`} className={edge.kind === 'add' ? 'graph-add' : 'graph-remove'}>
            <circle r="9" />
            <text textAnchor="middle" dy="4">
              {edge.kind === 'add' ? '+' : '−'}
            </text>
          </g>
        )}
      </g>,
    );
  }
  const braceViews: ReactNode[] = [];
  for (const b of graph.braces) {
    const nodes = b.nodes.map((id) => graph.byId.get(id)!);
    if (!nodes.some((n) => visibleIds.has(n.id)) || !shown(nodes[0]!)) continue;
    const top = Math.min(...nodes.map((n) => placed(n, offsets).y));
    const bottom = Math.max(...nodes.map((n) => placed(n, offsets).y + n.h));
    const x = Math.min(...nodes.map((n) => placed(n, offsets).x)) - 28;
    braceViews.push(
      <g key={b.id} className="graph-brace">
        <path d={brace(x, top, bottom)} />
        {nodes.map((n) => {
          const p = placed(n, offsets);
          const y = p.y + layoutOf(n).entry;
          return <path key={n.id} d={`M${x + 10},${y} L${p.x},${y}`} className="graph-brace-stub" />;
        })}
        <text x={x - 4} y={(top + bottom) / 2 - 8} textAnchor="end" className="graph-brace-label">
          {edi(b.random ? 'EDITOR_GRAPH_RANDOM' : 'EDITOR_GRAPH_FIRST')}
        </text>
      </g>,
    );
  }

  const chosen = chosenEdge === null ? undefined : graph.edges.find((x) => x.id === chosenEdge);
  const chosenAt = chosen === undefined ? null : ends(chosen, graph, offsets);

  return (
    <div className="graph-panel">
      <div className="graph-toolbar" role="toolbar" aria-label={edi('EDITOR_GRAPH')}>
        <label className="graph-rows" title={edi('EDITOR_GRAPH_ROWS')}>
          <span className="editor-sr">{edi('EDITOR_GRAPH_ROWS')}</span>
          <select value={row === null ? '' : String(row)} onChange={(e) => useGraph.setState({ row: e.target.value === '' ? null : Number(e.target.value) })}>
            <option value="">{edi('EDITOR_GRAPH_ALL_ROWS', graph.rows.length)}</option>
            {graph.rows.map((r) => (
              <option key={r.index} value={r.index}>
                {rowTitle(r.trigger) + (r.root !== null && r.trigger !== 'start' ? ` · ${r.root}` : '')}
              </option>
            ))}
          </select>
        </label>
        <label className="editor-search-box graph-search">
          <Icon name="search" />
          <input
            className="editor-search"
            type="search"
            value={search}
            placeholder={val('SEARCH_BY_NAME')}
            aria-label={edi('EDITOR_GRAPH_SEARCH')}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' || found === null) return;
              const list = graph.nodes.filter((n) => found.has(n.id) && shown(n));
              if (list.length === 0) return;
              const at = list.findIndex((n) => n.name === selection);
              const next = list[(at + 1) % list.length]!;
              centre(next);
              run(() => select(next.name));
            }}
          />
        </label>
        <span className="graph-tools-gap" />
        <Tool icon="zoomOut" label={edi('EDITOR_ZOOM_OUT')} onClick={() => {
          const { tx: x, ty: y, k: z } = view.current;
          const next = Math.max(MIN_ZOOM, z / 1.25);
          view.current = { k: next, tx: size.w / 2 - ((size.w / 2 - x) / z) * next, ty: size.h / 2 - ((size.h / 2 - y) / z) * next };
          apply();
        }} />
        <span className="graph-zoom" aria-live="polite">{Math.round(view.current.k * 100)}%</span>
        <Tool icon="zoomIn" label={edi('EDITOR_ZOOM_IN')} onClick={() => {
          const { tx: x, ty: y, k: z } = view.current;
          const next = Math.min(MAX_ZOOM, z * 1.25);
          view.current = { k: next, tx: size.w / 2 - ((size.w / 2 - x) / z) * next, ty: size.h / 2 - ((size.h / 2 - y) / z) * next };
          apply();
        }} />
        <Tool icon="focus" label={edi('EDITOR_GRAPH_FIT')} keys="F" onClick={fitAll} />
        <Tool icon="locate" label={edi('EDITOR_GRAPH_FOLLOW')} pressed={follow} onClick={() => useGraph.setState({ follow: !follow })} />
        <Tool icon="reload" label={edi('EDITOR_GRAPH_REORDER')} disabled={Object.keys(offsets).length === 0} onClick={resetMoves} />
        <Tool icon="keyboard" label={edi('EDITOR_GRAPH_LEGEND')} pressed={legend} onClick={() => useGraph.setState({ legend: !legend })} />
      </div>
      <div
        className={'graph-view' + (link !== null ? ' graph-linking' : '')}
        ref={box}
        tabIndex={0}
        role="application"
        aria-label={edi('EDITOR_GRAPH')}
        onPointerDown={onBackgroundDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onContextMenu={(e) => {
          const under = (e.target as Element).closest<HTMLElement>('[data-graph-node]');
          const node = under === null ? null : (graph.byId.get(under.dataset.graphId ?? '') ?? null);
          openNodeMenu(e, node);
        }}
        onKeyDown={onKey}
      >
        <svg className={'graph-lines' + (graph.byName.has(selection) ? ' graph-focus' : '')} width={size.w} height={size.h} aria-hidden="true">
          <g ref={lines}>
            {graph.rows
              .filter((r) => visibleRows === null || visibleRows.has(r.index))
              .map((r) => (
                <g key={r.index} className="graph-row">
                  {r.index > 0 && visibleRows === null && <line x1={0} x2={graph.width} y1={r.top} y2={r.top} />}
                </g>
              ))}
            {braceViews}
            {edgeViews}
            {link !== null && <path d={curve(link.x1, link.y1, link.x2, link.y2)} className="graph-link-drag" />}
          </g>
        </svg>
        <div className="graph-world" ref={world}>
          {graph.rows
            .filter((r) => visibleRows === null || visibleRows.has(r.index))
            .filter((r) => near(0, r.top, SIZES.rowHead, r.height))
            .map((r) => (
              <div key={r.index} className="graph-row-head" style={{ top: r.top + SIZES.rowGap / 2, height: Math.max(40, r.height - SIZES.rowGap) }}>
                <span>{rowTitle(r.trigger)}</span>
              </div>
            ))}
          {visible.map((n) => (
            <NodeView
              key={n.id}
              node={n}
              at={placed(n, offsets)}
              selected={n.name === selection || (found !== null && found.has(n.id))}
              starts={rowStarts.get(n.id) ?? null}
              onDown={onNodeDown}
              onPort={startLink}
              onEffects={(e, node) => startLink(e, node, 0)}
              onOpen={(node) => centre(node.copy ? (graph.byName.get(node.name)?.[0] ?? node) : node)}
              far={k < 0.22}
            />
          ))}
          {chosen !== undefined && chosenAt !== null && (
            <div className="graph-edge-tools" style={{ left: (chosenAt.x1 + chosenAt.x2) / 2, top: (chosenAt.y1 + chosenAt.y2) / 2 }} onPointerDown={(e) => e.stopPropagation()}>
              {chosen.kind === 'button' && <Tool icon="plus" label={edi('EDITOR_GRAPH_INSERT')} onClick={() => insertBetween(chosen, graph)} />}
              <Tool icon="close" label={edi('EDITOR_GRAPH_UNLINK')} keys={edi('EDITOR_KEY_DELETE')} onClick={() => {
                useGraph.setState({ edge: null });
                unlink(chosen, graph);
              }} />
            </div>
          )}
        </div>
        {graph.nodes.length === 0 && <p className="graph-empty quiet">{edi('EDITOR_GRAPH_EMPTY')}</p>}
        {legend && <Legend />}
        <Minimap
          graph={graph}
          offsets={offsets}
          view={view.current}
          size={size}
          onGo={(x, y) => {
            view.current = { ...view.current, tx: size.w / 2 - x * view.current.k, ty: size.h / 2 - y * view.current.k };
            apply();
          }}
        />
        {menu !== null && (
          <div className="editor-menu-list graph-menu" role="menu" style={{ left: menu.x, top: menu.y }} onPointerDown={(e) => e.stopPropagation()}>
            {menu.items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={item.danger === true ? 'editor-menu-danger' : undefined}
                onClick={() => {
                  setMenu(null);
                  item.act();
                }}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

