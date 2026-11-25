// The panel on the right of the map: the list of components, the history of changes (each one a step to go back or
// forward to) and what was selected, the latest first, to go back to it. Not in Valkyrie, whose editor lists the
// components in a window and has no history.
import { Game, QUEST_SELECTION, StringKey } from '@universalis/engine';
import { run } from '../ui/run.ts';
import { val } from '../ui/text.ts';
import { Tool } from './chrome.tsx';
import { ComponentList } from './ComponentList.tsx';
import { useEditor } from './editorState.ts';
import { Icon, typeIcon, type IconName } from './Icon.tsx';
import { setLayout, toggle, useLayout, type RightTab } from './layout.ts';
import { currentSession, recentSelections, redoSteps, select, undoSteps } from './session.ts';
import { edi } from './text.ts';

const TABS: [RightTab, IconName, string][] = [
  ['components', 'tile', 'EDITOR_COMPONENTS_LIST'],
  ['history', 'history', 'EDITOR_HISTORY'],
  ['selections', 'back', 'EDITOR_SELECTIONS'],
];

/** The changes Undo and Redo go through: what Redo would make again, greyed, above; now; what Undo takes back, below. */
function HistoryList() {
  useEditor((s) => s.revision);
  const history = currentSession().history;
  const undo = history.undoLabels;
  const redo = history.redoLabels;
  return (
    <ol className="editor-steps" aria-label={edi('EDITOR_HISTORY')}>
      {[...redo].reverse().map((label, i) => (
        <li key={`r${i}`}>
          <button type="button" className="editor-step editor-step-undone" title={edi('EDITOR_HISTORY_REDO_TO', label)} onClick={() => run(() => redoSteps(redo.length - i))}>
            <Icon name="redo" />
            <span>{label}</span>
          </button>
        </li>
      ))}
      <li>
        <span className="editor-step editor-step-now" aria-current="step">
          <Icon name="check" />
          <span>{edi('EDITOR_HISTORY_NOW')}</span>
        </span>
      </li>
      {undo.map((label, i) => (
        <li key={`u${i}`}>
          <button type="button" className="editor-step" title={edi('EDITOR_HISTORY_UNDO_TO', label)} onClick={() => run(() => undoSteps(i + 1))}>
            <Icon name="undo" />
            <span>{label}</span>
          </button>
        </li>
      ))}
      {undo.length === 0 && redo.length === 0 && <li className="quiet editor-empty">{edi('EDITOR_HISTORY_EMPTY')}</li>}
    </ol>
  );
}

/** What was selected, the latest first: the first is where the panel is now. */
function SelectionList() {
  useEditor((s) => s.revision);
  const recent = recentSelections();
  const components = Game.get().currentQuest!.qd.components;
  return (
    <ol className="editor-steps" aria-label={edi('EDITOR_SELECTIONS')}>
      {recent.map((name, i) => {
        const c = name === QUEST_SELECTION ? undefined : components.get(name);
        return (
          <li key={name}>
            <button type="button" className={'editor-step' + (i === 0 ? ' editor-step-now' : '')} aria-current={i === 0 ? 'true' : undefined} onClick={() => run(() => select(name))}>
              <Icon name={c === undefined ? 'quest' : typeIcon(c.typeDynamic)} />
              <span>{c === undefined ? val('QUEST') : name}</span>
              {c !== undefined && <span className="quiet editor-step-type">{new StringKey('val', c.typeDynamic.toUpperCase()).translate()}</span>}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function RightPanel() {
  const tab = useLayout((s) => s.rightTab);
  return (
    <aside className="editor-side editor-right" aria-label={edi('EDITOR_PANEL_RIGHT')}>
      <div className="editor-side-head editor-side-tabs" role="tablist">
        {TABS.map(([t, icon, key]) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} title={edi(key)} onClick={() => setLayout({ rightTab: t })}>
            <Icon name={icon} />
            {tab === t ? <span>{edi(key)}</span> : <span className="editor-sr">{edi(key)}</span>}
          </button>
        ))}
        <span className="editor-tabs-gap" />
        <Tool icon="panelRight" label={edi('EDITOR_HIDE_LIST')} keys="Alt+2" onClick={() => toggle('right')} />
      </div>
      {tab === 'components' ? (
        <ComponentList />
      ) : (
        <div className="editor-side-body">{tab === 'history' ? <HistoryList /> : <SelectionList />}</div>
      )}
    </aside>
  );
}
