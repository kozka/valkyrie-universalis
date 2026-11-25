// The selected component, on the left of the map as Valkyrie's panel is: its name (renamed as Valkyrie renames it), its
// file, its place on the board, its comment, what it leads to and what leads to it, and what the checks find in it,
// or, in text mode, its .ini lines (TextMode.tsx); for the quest itself, what it is. Each part folds, and the ones an
// author seldom needs (its file and comment, what it is) start folded. What each field does to the quest is the engine's
// (QuestEditor/EditorComponent.ts, QuestEditorData.ts, ComponentText.ts); the fields of each type come with E.5
// (docs/plan-editor.md). Not ported from Valkyrie's panels, which are drawn with Unity.
import { useEffect, useState } from 'react';
import { CommonStringKeys, EditorComponent, Game, QUEST_SELECTION, QuestData, QuestEditorData, ReorderComponents, StringKey, floatToString, type Problem } from '@universalis/engine';
import { RichText } from '../ui/RichText.tsx';
import { run } from '../ui/run.ts';
import { val } from '../ui/text.ts';
import { Fold, Tool } from './chrome.tsx';
import { Icon, typeIcon } from './Icon.tsx';
import { setLayout, toggle, useLayout } from './layout.ts';
import { useEditor } from './editorState.ts';
import { ProblemLine } from './ProblemLine.tsx';
import { back, change, currentSession, isIgnored, questHeading, select } from './session.ts';
import { edi } from './text.ts';
import { EventPanel } from './EventPanel.tsx';
import { ItemPanel } from './ItemPanel.tsx';
import { MonsterPanel } from './MonsterPanel.tsx';
import { PiecePanel } from './PiecePanel.tsx';
import { PuzzlePanel } from './PuzzlePanel.tsx';
import { QuestPanel } from './QuestPanel.tsx';
import { SpawnPanel } from './SpawnPanel.tsx';
import { TextMode } from './TextMode.tsx';
import { UIPanel } from './UIPanel.tsx';

/** An event with a place on the board (EditorComponentEvent.AddPosition): where the camera goes or what is highlighted. */
function located(component: QuestData.QuestComponent): component is QuestData.Event {
  if (!(component instanceof QuestData.Event) || component instanceof QuestData.UI || component instanceof QuestData.Puzzle) return false;
  // A token and a door are where the map draws them, and are dragged there
  if (component instanceof QuestData.Token || component instanceof QuestData.Door) return false;
  return component.locationSpecified || component.minCam || component.maxCam;
}

function ProblemsOf({ where }: { where: (p: Problem) => boolean }) {
  const found = currentSession().problems.filter((p) => where(p) && !isIgnored(p));
  if (found.length === 0) return null;
  return (
    <Fold id="problems" title={edi('EDITOR_PROBLEMS')} count={found.length} className="editor-props-problems">
      <ul>
        {found.map((p, i) => (
          <li key={i} className={`editor-problem-${p.level}`}>
            <ProblemLine problem={p} where={false} texts />
          </li>
        ))}
      </ul>
    </Fold>
  );
}

/** What leads to this component and what it leads to, each a link to the other one. */
function Links({ name }: { name: string }) {
  const graph = currentSession().graph;
  if (graph === null) return null;
  const outgoing = graph.outgoing.get(name) ?? [];
  const incoming = graph.incoming.get(name) ?? [];
  const link = (other: string, kind: string, exists: boolean, i: number) => (
    <li key={`${kind}-${other}-${i}`}>
      <button type="button" className="editor-link" disabled={!exists} onClick={() => run(() => select(other))}>
        <span className="quiet">{edi(`EDITOR_LINK_${kind.toUpperCase()}`)}</span> {other}
      </button>
    </li>
  );
  return (
    <>
      {outgoing.length > 0 && (
        <Fold id="leads-to" title={edi('EDITOR_LEADS_TO')} count={outgoing.length}>
          <ul className="editor-links">{outgoing.map((l, i) => link(l.to, l.kind, l.exists, i))}</ul>
        </Fold>
      )}
      {incoming.length > 0 && (
        <Fold id="reached-from" title={edi('EDITOR_REACHED_FROM')} count={incoming.length}>
          <ul className="editor-links">{incoming.map((l, i) => link(l.from, l.kind, true, i))}</ul>
        </Fold>
      )}
    </>
  );
}

/** Valkyrie's Rename: the type stays, the rest is typed; F2 goes to it. */
function Rename({ component }: { component: QuestData.QuestComponent }) {
  const [value, setValue] = useState(EditorComponent.renameValue(component));
  useEffect(() => setValue(EditorComponent.renameValue(component)), [component]);
  const rename = () =>
    run(() => {
      const before = component.sectionName;
      change(edi('EDITOR_RENAME_STEP', before), () => {
        EditorComponent.renameFinished(component, value);
      });
    });
  const same = value === '' || component.typeDynamic + value === component.sectionName;
  return (
    <form
      className="editor-rename"
      onSubmit={(e) => {
        e.preventDefault();
        rename();
      }}
    >
      <span className="editor-rename-type">{component.typeDynamic}</span>
      <input
        aria-label={CommonStringKeys.RENAME.translate()}
        title={`${CommonStringKeys.RENAME.translate()} (F2)`}
        data-editor-rename=""
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/[^A-Za-z0-9_]/g, ''))}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setValue(EditorComponent.renameValue(component));
        }}
      />
      <button type="submit" className="editor-tool" aria-label={CommonStringKeys.RENAME.translate()} title={CommonStringKeys.RENAME.translate()} disabled={same}>
        <Icon name="check" />
      </button>
    </form>
  );
}

/** Where an event or a monster place is: a press on the map puts it there, as Valkyrie's Position button does. */
// Valkyrie: EditorComponent.cs EditorComponent.GetPosition
function PlaceOnMap({ component }: { component: QuestData.Event | QuestData.MPlace }) {
  const placing = useEditor((s) => s.placing) === component.sectionName;
  return (
    <div className="editor-row-field editor-place">
      <span>{val('POSITION')}</span>
      <span className="editor-inline">
        <code>
          {floatToString(component.location.x)}, {floatToString(component.location.y)}
        </code>
        <button type="button" className="button" aria-pressed={placing} onClick={() => useEditor.setState({ placing: placing ? null : component.sectionName })}>
          <Icon name="locate" /> {edi(placing ? 'EDITOR_PLACING' : 'EDITOR_PLACE_ON_MAP')}
        </button>
      </span>
    </div>
  );
}

function Source({ component }: { component: QuestData.QuestComponent }) {
  const sources = ReorderComponents.sources();
  const [adding, setAdding] = useState('');
  const setSource = (source: string) =>
    run(() =>
      change(edi('EDITOR_SOURCE_STEP', component.sectionName), () => {
        EditorComponent.setSource(component, source);
      }),
    );
  return (
    <label className="editor-field">
      <span>{CommonStringKeys.SOURCE.translate()}</span>
      <select
        value={component.source}
        onChange={(e) => {
          if (e.target.value === '') return;
          setSource(e.target.value);
        }}
      >
        {sources.includes(component.source) ? null : <option value={component.source}>{component.source}</option>}
        {sources.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <span className="editor-inline">
        <input value={adding} placeholder={edi('EDITOR_NEW_FILE')} aria-label={edi('EDITOR_NEW_FILE')} onChange={(e) => setAdding(e.target.value.replace(/[^A-Za-z0-9_.\-/]/g, ''))} />
        <button
          type="button"
          className="button"
          disabled={adding.length === 0}
          onClick={() => {
            setSource(EditorComponent.newSource(adding));
            setAdding('');
          }}
        >
          {CommonStringKeys.NEW.translate()}
        </button>
      </span>
    </label>
  );
}

function Comment({ component }: { component: QuestData.QuestComponent }) {
  const text = EditorComponent.commentText(component);
  return (
    <label className="editor-field">
      <span>{val('COMMENT')}</span>
      <textarea
        defaultValue={text}
        key={component.sectionName + text}
        rows={4}
        onBlur={(e) => {
          if (e.target.value === text) return;
          const value = e.target.value;
          run(() => change(edi('EDITOR_COMMENT_STEP', component.sectionName), () => EditorComponent.setComment(component, value)));
        }}
      />
    </label>
  );
}

/** Valkyrie's Delete, which asks first; the Delete key asks too. */
function DeleteButton() {
  return <Tool icon="trash" label={CommonStringKeys.DELETE.translate()} keys={edi('EDITOR_KEY_DELETE')} className="editor-tool-danger" onClick={() => useEditor.setState({ deleting: true })} />;
}

function DeleteAsk() {
  const deleting = useEditor((s) => s.deleting);
  const name = Game.get().qed?.selection ?? '';
  useEffect(() => () => useEditor.setState({ deleting: false }), [name]);
  if (!deleting) return null;
  return (
    <div className="editor-confirm editor-confirm-block" role="alert">
      <span>{edi('EDITOR_DELETE_COMPONENT_CONFIRM', name)}</span>
      <span className="editor-inline">
        <button
          type="button"
          className="button back"
          autoFocus
          onClick={() =>
            run(() => {
              useEditor.setState({ deleting: false });
              change(edi('EDITOR_DELETE_STEP', name), () => QuestEditorData.deleteCurrentComponent());
            })
          }
        >
          {CommonStringKeys.DELETE.translate()}
        </button>
        <button type="button" className="button" onClick={() => useEditor.setState({ deleting: false })}>
          {CommonStringKeys.CANCEL.translate()}
        </button>
      </span>
    </div>
  );
}

/** The panel's parts with their headings, folding, or all one after another. */
function FlatToggle() {
  const flat = useLayout((s) => s.flat);
  return <Tool icon="menu" label={edi('EDITOR_FLAT')} pressed={flat} onClick={() => setLayout({ flat: !flat })} />;
}

/** Shows the selection as its .ini lines, or as fields. */
function TextModeToggle({ on }: { on: boolean }) {
  return <Tool icon="code" label={edi('EDITOR_TEXT_MODE')} keys="Alt+T" pressed={on} onClick={() => useEditor.setState({ textMode: !on })} />;
}

/** Valkyrie's ⇦: back to what was selected before. */
function Back() {
  return <Tool icon="back" label={edi('EDITOR_PREVIOUS')} keys="Alt+←" onClick={() => run(back)} />;
}

function HidePanel() {
  return <Tool icon="panelLeft" label={edi('EDITOR_HIDE_PANEL')} keys="Alt+1" onClick={() => toggle('left')} />;
}

/** The quest itself: its fields (QuestPanel.tsx, EditorComponentQuest) or its lines, and its format, game and languages. */
function QuestProperties({ textMode }: { textMode: boolean }) {
  const quest = Game.get().currentQuest!;
  const q = quest.qd.quest;
  const languages = q.localizationDict?.getLanguagesList() ?? [];
  return (
    <section className="editor-props editor-side" aria-labelledby="editor-props-title">
      <div className="editor-props-head editor-side-head">
        <Back />
        <Icon name="quest" />
        <h2 id="editor-props-title">
          <RichText text={questHeading()} />
        </h2>
        <FlatToggle />
        <TextModeToggle on={textMode} />
        <HidePanel />
      </div>
      <div className="editor-side-body">
        <ProblemsOf where={(p) => p.where === '' || p.where === '[Quest]' || !quest.qd.components.has(p.where)} />
        {textMode ? <TextMode component={q} /> : <QuestPanel />}
        <Fold id="quest-facts" title={edi('EDITOR_ABOUT')} open={false}>
          <dl className="editor-facts">
            <dt>{val('TYPE')}</dt>
            <dd>{q.type}</dd>
            <dt>{edi('EDITOR_FORMAT')}</dt>
            <dd>{q.format}</dd>
            <dt>{edi('EDITOR_LANGUAGES')}</dt>
            <dd>{languages.join(', ')}</dd>
            <dt>{edi('EDITOR_DEFAULT_LANGUAGE')}</dt>
            <dd>{q.defaultLanguage}</dd>
          </dl>
        </Fold>
      </div>
    </section>
  );
}

export function Properties() {
  useEditor((s) => s.revision);
  const textMode = useEditor((s) => s.textMode);
  const game = Game.get();
  const selection = game.qed?.selection ?? QUEST_SELECTION;
  const component = selection === QUEST_SELECTION ? undefined : game.currentQuest!.qd.components.get(selection);
  if (component === undefined) return <QuestProperties textMode={textMode} />;
  return (
    <section className="editor-props editor-side" aria-labelledby="editor-props-title">
      <div className="editor-props-head editor-side-head">
        <Back />
        <Icon name={typeIcon(component.typeDynamic)} />
        <h2 id="editor-props-title" title={new StringKey('val', component.typeDynamic.toUpperCase()).translate()}>
          {component.sectionName}
        </h2>
        <FlatToggle />
        <TextModeToggle on={textMode} />
        <DeleteButton />
        <HidePanel />
      </div>
      <div className="editor-side-body">
        <DeleteAsk />
        <Rename component={component} />
        <ProblemsOf where={(p) => p.where === component.sectionName} />
        {textMode ? (
          <TextMode component={component} />
        ) : (
          <>
            {(located(component) || component instanceof QuestData.MPlace) && <PlaceOnMap component={component} />}
            <PiecePanel component={component} />
            {component instanceof QuestData.UI && <UIPanel ui={component} />}
            {component instanceof QuestData.Spawn && <SpawnPanel spawn={component} />}
            {component instanceof QuestData.Puzzle && <PuzzlePanel puzzle={component} />}
            {component instanceof QuestData.QItem && <ItemPanel item={component} />}
            <MonsterPanel component={component} />
            {component instanceof QuestData.Event && <EventPanel event={component} />}
            <Fold id="file-comment" title={edi('EDITOR_FILE_AND_COMMENT')} open={EditorComponent.commentText(component) !== ''} part>
              <Source component={component} />
              <Comment component={component} />
            </Fold>
          </>
        )}
        <Links name={component.sectionName} />
      </div>
    </section>
  );
}
