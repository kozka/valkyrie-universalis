// The scenario's events as a tree, to read it and find things in it (QuestGraph): from the start, each trigger with
// its events in the order Valkyrie runs them; from the chosen component, what it leads to or what leads to it. Under
// an event: what its buttons start, with their text and condition, what it adds and takes away, a change of quest, and
// the events that a defeat or a variable it sets starts. A component already on the way is not opened again (a
// loop); what nothing reaches is listed apart, without alarm, as an author may start it some other way; and the tree
// can keep only the way to an ending. In Descent, the events that open the shop and those that close it are marked. Not
// ported from Valkyrie, whose editor has no tree.
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { EditorComponentEvent, Game, QUEST_SELECTION, QuestData, StringKey, ValkyrieConstants, endsGame, type QuestButtonData, type QuestGraph } from '@universalis/engine';
import { RichText } from '../ui/RichText.tsx';
import { run } from '../ui/run.ts';
import { conditionText } from './conditions.ts';
import { useEditor } from './editorState.ts';
import { currentSession, select } from './session.ts';
import { edi } from './text.ts';

type Mode = 'start' | 'down' | 'up';

/** A branch of the tree: the component it goes to, and how. */
interface Edge {
  to: string;
  label: ReactNode;
  /** Not a component: a change of quest names a quest.ini. */
  outside?: boolean;
  /** Shown but not followed: what an event takes away or where a group is placed. */
  leaf?: boolean;
}

interface Tree {
  graph: QuestGraph;
  mode: Mode;
  /** Only the branches from which the game can end (QuestGraph.leadsToEnd). */
  toEnd: boolean;
  ends: Map<string, boolean>;
}

const TreeContext = createContext<Tree | null>(null);

/** Kinds of link that are shown and not followed. */
const LEAVES = new Set(['remove', 'placement', 'hero', 'item', 'quest']);

function components(): ReadonlyMap<string, QuestData.QuestComponent> {
  return Game.get().currentQuest!.qd.components;
}

/** A button as the tree says it: its number and text, and its condition. */
function ButtonLabel({ number, button }: { number: number; button: QuestButtonData | undefined }) {
  const condition = conditionText(button?.condition ?? null);
  return (
    <>
      <span>{edi('EDITOR_TREE_BUTTON', number)}</span>
      {button !== undefined && (
        <span className="editor-tree-button">
          <RichText text={button.label.translate().replace(/\\n/g, ' ')} />
        </span>
      )}
      {condition !== '' && <span className="editor-tree-if">{edi('EDITOR_TREE_IF', condition)}</span>}
    </>
  );
}

function linkLabel(kind: string): string {
  return edi('EDITOR_LINK_' + kind.toUpperCase());
}

/** What a component leads to. */
function down(graph: QuestGraph, name: string): Edge[] {
  const component = components().get(name);
  const edges: Edge[] = [];
  for (const link of graph.outgoing.get(name) ?? []) {
    if (link.kind === 'text' || link.kind === 'defeated') continue;
    if (link.kind === 'button') {
      const button = component instanceof QuestData.Event ? component.buttons[link.button! - 1] : undefined;
      edges.push({ to: link.to, label: <ButtonLabel number={link.button!} button={button} /> });
    } else {
      edges.push({ to: link.to, label: linkLabel(link.kind), outside: link.kind === 'quest', leaf: LEAVES.has(link.kind) });
    }
  }
  // The events its defeat starts (trigger=Defeated<name>), and those a variable it sets starts (@name: trigger=Varname)
  for (const link of graph.incoming.get(name) ?? []) if (link.kind === 'defeated') edges.push({ to: link.from, label: linkLabel('defeated') });
  for (const op of component?.operations ?? []) {
    if (op.var.startsWith('@')) for (const e of graph.triggered('Var' + op.var.substring(1))) edges.push({ to: e, label: edi('EDITOR_TREE_SETS', op.var) });
  }
  return edges;
}

/** What leads to a component. */
function up(graph: QuestGraph, name: string): Edge[] {
  const edges: Edge[] = [];
  for (const link of graph.incoming.get(name) ?? []) {
    if (link.kind === 'text' || link.kind === 'defeated') continue;
    if (link.kind === 'button') {
      const from = components().get(link.from);
      const button = from instanceof QuestData.Event ? from.buttons[link.button! - 1] : undefined;
      edges.push({ to: link.from, label: <ButtonLabel number={link.button!} button={button} /> });
    } else {
      edges.push({ to: link.from, label: linkLabel(link.kind) });
    }
  }
  for (const link of graph.outgoing.get(name) ?? []) if (link.kind === 'defeated') edges.push({ to: link.to, label: linkLabel('defeated') });
  const component = components().get(name);
  if (component instanceof QuestData.Event && component.trigger.startsWith('Var')) {
    const variable = '@' + component.trigger.substring(3);
    for (const use of graph.written.get(variable) ?? []) edges.push({ to: use.component, label: edi('EDITOR_TREE_SETS', variable) });
  }
  return edges;
}

/** Whether the game can end from a component, through the buttons on the way. */
function leadsToEnd(tree: Tree, name: string): boolean {
  let known = tree.ends.get(name);
  if (known === undefined) tree.ends.set(name, (known = tree.graph.leadsToEnd(name) || down(tree.graph, name).some((e) => !e.leaf && !e.outside && tree.graph.leadsToEnd(e.to))));
  return known;
}

/**
 * Descent: how many quest items an event adds, which open the shop when they are more than one, and whether it closes
 * the shop (EventManager.TriggerEvent counts the names that start with QItem; ShopInterface closes on remove=#shop).
 */
function shopOf(component: QuestData.QuestComponent | undefined): { items: number; closes: boolean } {
  if (!(component instanceof QuestData.Event) || Game.get().gameType.typeName() !== ValkyrieConstants.typeDescent) return { items: 0, closes: false };
  return { items: component.addComponents.filter((n) => n.startsWith('QItem')).length, closes: component.removeComponents.includes('#shop') };
}

/** The first line of an event's dialog, as a game shows it. */
function dialogLine(component: QuestData.QuestComponent | undefined): string {
  if (!(component instanceof QuestData.Event) || !component.display || component instanceof QuestData.Puzzle) return '';
  const text = EditorComponentEvent.preview(component).text.replace(/\s*\n\s*/g, ' ').trim();
  return text.length > 110 ? text.substring(0, 107).trimEnd() + '…' : text;
}

function Node({ name, edge, path, open: openFirst = false, underTrigger = false }: { name: string; edge?: Edge; path: readonly string[]; open?: boolean; underTrigger?: boolean }) {
  const tree = useContext(TreeContext)!;
  const [open, setOpen] = useState(openFirst);
  const component = edge?.outside ? undefined : components().get(name);
  const loop = path.includes(name);
  const follow = component !== undefined && !loop && !edge?.leaf;
  let edges = follow ? (tree.mode === 'up' ? up(tree.graph, name) : down(tree.graph, name)) : [];
  if (tree.toEnd && tree.mode !== 'up') edges = edges.filter((e) => !e.leaf && !e.outside && leadsToEnd(tree, e.to));
  // Under its trigger's heading, the trigger is said already
  const trigger = component instanceof QuestData.Event && !underTrigger ? component.trigger : '';
  const condition = conditionText(component?.tests ?? null);
  const line = dialogLine(component);
  const shop = shopOf(component);
  return (
    <li className="editor-tree-item">
      <span className="editor-tree-node">
        {edges.length > 0 ? (
          <button type="button" className="editor-tree-toggle" aria-expanded={open} aria-label={edi(open ? 'EDITOR_TREE_CLOSE' : 'EDITOR_TREE_OPEN', name)} onClick={() => setOpen(!open)}>
            {open ? '▾' : '▸'}
          </button>
        ) : (
          <span className="editor-tree-toggle" aria-hidden="true" />
        )}
        {edge !== undefined && <span className="editor-tree-edge">{edge.label}</span>}
        {component !== undefined ? (
          <button type="button" className="editor-link" onClick={() => run(() => select(name))}>
            {name}
          </button>
        ) : edge?.outside ? (
          <code>{name}</code>
        ) : (
          <span className="editor-tree-missing">{edi('EDITOR_TREE_MISSING', name)}</span>
        )}
        {component !== undefined && <span className="quiet">{new StringKey('val', component.typeDynamic.toUpperCase()).translate()}</span>}
        {trigger !== '' && <span className="editor-tree-badge">{edi('EDITOR_TREE_TRIGGER', trigger)}</span>}
        {condition !== '' && <span className="editor-tree-if">{edi('EDITOR_TREE_IF', condition)}</span>}
        {component !== undefined && endsGame(component) && <span className="editor-tree-badge editor-tree-final">{edi('EDITOR_TREE_FINAL')}</span>}
        {shop.items > 1 && <span className="editor-tree-badge">{edi('EDITOR_TREE_SHOP', shop.items)}</span>}
        {shop.closes && <span className="editor-tree-badge">{edi('EDITOR_TREE_SHOP_CLOSES')}</span>}
        {loop && <span className="editor-tree-badge">{edi('EDITOR_TREE_LOOP')}</span>}
        {line !== '' && (
          <span className="editor-tree-text">
            <RichText text={line} />
          </span>
        )}
      </span>
      {open && edges.length > 0 && (
        <ul className="editor-tree-list">
          {edges.map((e, i) => (
            <Node key={i} name={e.to} edge={e} path={[...path, name]} />
          ))}
        </ul>
      )}
    </li>
  );
}

/** Each trigger with its events (EventStart first), the starting items and, apart, what nothing reaches. */
function FromStart() {
  const tree = useContext(TreeContext)!;
  const graph = tree.graph;
  const triggers = graph.triggers().sort((a, b) => Number(b === 'EventStart') - Number(a === 'EventStart'));
  const all = [...components().values()];
  const starting = all.filter((c) => c instanceof QuestData.QItem && c.starting).map((c) => c.sectionName);
  const reached = graph.reachable();
  const loose = all.filter((c) => c instanceof QuestData.Event && !reached.has(c.sectionName)).map((c) => c.sectionName);
  return (
    <>
      <ul className="editor-tree-list editor-tree-roots">
        {triggers.map((trigger) => (
          <li key={trigger}>
            <span className="editor-tree-trigger">{edi('EDITOR_TREE_TRIGGER', trigger)}</span>
            <ul className="editor-tree-list">
              {graph.triggered(trigger).map((name) => (
                <Node key={name} name={name} path={[]} open={trigger === 'EventStart'} underTrigger />
              ))}
            </ul>
          </li>
        ))}
        {starting.length > 0 && (
          <li>
            <span className="editor-tree-trigger">{edi('EDITOR_TREE_STARTING_ITEMS')}</span>
            <ul className="editor-tree-list">
              {starting.map((name) => (
                <Node key={name} name={name} path={[]} />
              ))}
            </ul>
          </li>
        )}
      </ul>
      {triggers.length === 0 && starting.length === 0 && <p className="quiet">{edi('EDITOR_TREE_NO_START')}</p>}
      {loose.length > 0 && !tree.toEnd && (
        <details className="editor-tree-loose">
          <summary>{edi('EDITOR_TREE_LOOSE', loose.length)}</summary>
          <ul className="editor-tree-list">
            {loose.map((name) => (
              <Node key={name} name={name} path={[]} />
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

export function EventTree() {
  const revision = useEditor((s) => s.revision);
  const graph = currentSession().graph;
  const selection = Game.get().qed?.selection ?? QUEST_SELECTION;
  const [mode, setMode] = useState<Mode>('start');
  const [toEnd, setToEnd] = useState(false);
  const tree = useMemo<Tree | null>(() => (graph === null ? null : { graph, mode, toEnd, ends: new Map() }), [graph, mode, toEnd, revision]);
  if (tree === null) return null;
  const chosen = selection !== QUEST_SELECTION && components().has(selection);
  const modes: [Mode, string][] = [
    ['start', edi('EDITOR_TREE_FROM_START')],
    ['down', edi('EDITOR_TREE_DOWN', chosen ? selection : '…')],
    ['up', edi('EDITOR_TREE_UP', chosen ? selection : '…')],
  ];
  return (
    <TreeContext.Provider value={tree}>
      <div className="editor-tree">
        <div className="editor-tree-bar">
          <div className="editor-segments" role="radiogroup" aria-label={edi('EDITOR_TREE')}>
            {modes.map(([m, label]) => (
              <button key={m} type="button" role="radio" aria-checked={mode === m} disabled={m !== 'start' && !chosen} onClick={() => setMode(m)}>
                {label}
              </button>
            ))}
          </div>
          {mode !== 'up' && (
            <label className="editor-inline editor-check">
              <input type="checkbox" checked={toEnd} onChange={() => setToEnd(!toEnd)} />
              {edi('EDITOR_TREE_TO_END')}
            </label>
          )}
        </div>
        {mode === 'start' ? (
          <FromStart />
        ) : chosen ? (
          <ul className="editor-tree-list editor-tree-roots">
            <Node key={`${mode}-${selection}`} name={selection} path={[]} open />
          </ul>
        ) : (
          <p className="quiet">{edi('EDITOR_TREE_CHOOSE')}</p>
        )}
      </div>
    </TreeContext.Provider>
  );
}
