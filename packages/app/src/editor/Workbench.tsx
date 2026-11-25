// The open scenario's workbench, laid out as Valkyrie's editor is: the selected component's panel on the left, the map
// in the middle and, here, the list of components on the right; below, what the checks find, the tree of events, the
// texts by language, the scenario read as a book, the variables, its files and the versions its saves kept. Each
// panel folds to a strip and is sized by dragging its edge, as the author leaves it on this device (layout.ts). Above,
// what is used all the time (undo and redo, which Valkyrie does not have, Save, Save & Test) and a menu with the rest
// of Valkyrie's editor menu (Reload, Main Menu) and of its Tools (Create Package); below, a line with what the checks
// found, the language the fields write in and what was just done. Keys: Ctrl+S saves, Ctrl+Z and Ctrl+Y undo and
// redo, Ctrl+K goes to the search box, R turns the selected tile, token or door, Delete deletes it after asking, and
// the rest are in the keys' window (?). Not ported from Valkyrie, whose editor draws its panels with Unity; what each
// button does is the engine's. Not in Valkyrie either: a campaign's quests, its own and its adventures, to go from one
// to another (campaign.ts); an adventure's package and export are the campaign's.
import { useEffect, useState, type CSSProperties } from 'react';
import { CommonStringKeys, Destroyer, EditorComponent, Game, GameStateManager, Path, QUEST_SELECTION, QuestEditor, ToolsButton, ValkyrieConstants } from '@universalis/engine';
import { languageInSentence } from '../ui/languages.ts';
import { RichText } from '../ui/RichText.tsx';
import { run } from '../ui/run.ts';
import { val } from '../ui/text.ts';
import { AnalysisPanel } from './AnalysisPanel.tsx';
import { BookPanel } from './BookPanel.tsx';
import { pathFrom, samePath } from './campaign.ts';
import { Menu, Splitter, Tool, type MenuEntry } from './chrome.tsx';
import { EditorMap, showAllPieces, turnSelected } from './EditorMap.tsx';
import { openQuest } from './EditorScreen.tsx';
import { go, openInCampaign, say, showTab, useEditor, type BottomTab } from './editorState.ts';
import { downloadPackage, exportScenario } from './files.ts';
import { Files } from './Files.tsx';
import { EventTree } from './EventTree.tsx';
import { GraphPanel } from './graph/GraphPanel.tsx';
import { Icon, typeIcon } from './Icon.tsx';
import { writeIn } from './language.ts';
import { EDITOR_THEMES, LIMITS, setLayout, toggle, useLayout } from './layout.ts';
import { ProblemsPanel } from './ProblemsPanel.tsx';
import { VariablesPanel } from './VariablesPanel.tsx';
import { Properties } from './Properties.tsx';
import { RightPanel } from './RightPanel.tsx';
import { back, currentSession, dropDraft, isIgnored, questHeading, recoverDraft, redo, reloaded, saved, textsNow, undo } from './session.ts';
import { startTest } from './test.ts';
import { TextsPanel } from './TextsPanel.tsx';
import { edi, keptAt } from './text.ts';
import { Versions } from './Versions.tsx';
import { toggleFullscreen, useFullscreen } from '../ui/fullscreen.ts';

/** The tabs of the panel below; the last two are seldom needed, and stand apart. */
const TABS: [BottomTab, string][] = [
  ['graph', 'EDITOR_GRAPH'],
  ['problems', 'EDITOR_PROBLEMS'],
  ['tree', 'EDITOR_TREE'],
  ['texts', 'EDITOR_TEXTS'],
  ['book', 'EDITOR_BOOK'],
  ['variables', 'EDITOR_VARIABLES'],
  ['analysis', 'EDITOR_ANALYSIS'],
];
const SECONDARY_TABS: [BottomTab, string][] = [
  ['files', 'EDITOR_FILES'],
  ['versions', 'EDITOR_VERSIONS'],
];

/** What the checks found, not counting what the author asked not to be told about again. */
function problemCounts(): { breaks: number; wrong: number; hint: number } {
  const counts = { breaks: 0, wrong: 0, hint: 0 };
  for (const p of currentSession().problems) if (!isIgnored(p)) counts[p.level]++;
  return counts;
}

function BottomPanel({ folder }: { folder: string }) {
  const tab = useEditor((s) => s.tab);
  const open = useLayout((s) => s.bottom);
  const tall = useLayout((s) => s.tall);
  const height = useLayout((s) => s.bottomHeight);
  const counts = problemCounts();
  const tabButton = ([t, title]: [BottomTab, string], quiet = false) => (
    <button
      key={t}
      type="button"
      role="tab"
      className={quiet ? 'editor-tab-quiet' : undefined}
      aria-selected={open && tab === t}
      onClick={() => {
        if (open && tab === t) return toggle('bottom');
        showTab(t);
        // The graph needs room: at least half the window
        if (t === 'graph') setLayout({ bottomHeight: Math.max(useLayout.getState().bottomHeight, Math.min(LIMITS.bottomHeight[1], Math.round(window.innerHeight * 0.5))) });
      }}
    >
      {edi(title)}
      {t === 'problems' && counts.breaks + counts.wrong > 0 && (
        <span className={'editor-count ' + (counts.breaks > 0 ? 'editor-count-breaks' : 'editor-count-wrong')} aria-hidden="true">
          {counts.breaks + counts.wrong}
        </span>
      )}
    </button>
  );
  return (
    <section
      className={'editor-bottom panel' + (open ? '' : ' editor-bottom-folded') + (open && tall ? ' editor-bottom-tall' : '') + (tab === 'graph' ? ' editor-bottom-graph' : '')}
      style={open && !tall ? ({ height: `${height}px` } as CSSProperties) : undefined}
    >
      <div className="editor-tabs" role="tablist">
        {TABS.map((t) => tabButton(t))}
        <span className="editor-tabs-gap" />
        {SECONDARY_TABS.map((t) => tabButton(t, true))}
        <span className="editor-tabs-end">
          {open && (
            <Tool icon={tall ? 'minimize' : 'maximize'} label={edi(tall ? 'EDITOR_PANEL_SHORTER' : 'EDITOR_PANEL_TALLER')} pressed={tall} className="editor-tabs-size" onClick={() => toggle('tall')} />
          )}
          <Tool icon="panelBottom" label={edi(open ? 'EDITOR_HIDE_BOTTOM' : 'EDITOR_SHOW_BOTTOM')} keys="Alt+3" pressed={open} onClick={() => toggle('bottom')} />
        </span>
      </div>
      {open && (
        <div className="editor-tab-body" role="tabpanel">
          {tab === 'graph' ? (
            <GraphPanel />
          ) : tab === 'problems' ? (
            <ProblemsPanel />
          ) : tab === 'tree' ? (
            <EventTree />
          ) : tab === 'texts' ? (
            <TextsPanel />
          ) : tab === 'book' ? (
            <BookPanel />
          ) : tab === 'variables' ? (
            <VariablesPanel />
          ) : tab === 'analysis' ? (
            <AnalysisPanel folder={folder} />
          ) : tab === 'files' ? (
            <Files folder={folder} />
          ) : (
            <Versions folder={folder} />
          )}
        </div>
      )}
    </section>
  );
}

/** Not in Valkyrie: the language the fields write in, and the default one when it is another. */
function WritingNote() {
  const game = Game.get();
  const writing = game.currentLang;
  const defaultLanguage = game.currentQuest!.qd.quest.defaultLanguage;
  const name = (language: string) => languageInSentence(language, writing);
  return (
    <button type="button" className="editor-status-item editor-writing-note" onClick={() => showTab('texts')}>
      {writing === defaultLanguage ? edi('EDITOR_WRITING_BAR', name(writing)) : edi('EDITOR_WRITING_BAR_DEFAULT', name(writing), name(defaultLanguage))}
    </button>
  );
}

/**
 * Not in Valkyrie: when the scenario has no texts in the language the fields write in, a text written there goes into
 * a language of its own, and the default one keeps what it had.
 */
function WritingWarning() {
  const game = Game.get();
  const writing = game.currentLang;
  const defaultLanguage = game.currentQuest!.qd.quest.defaultLanguage;
  const texts = textsNow();
  const name = (language: string) => languageInSentence(language, writing);
  if (texts.size === 0 || texts.has(writing)) return null;
  return (
    <p className="editor-draft editor-writing" role="alert">
      <span>{edi('EDITOR_WRITING_NEW', name(writing), name(defaultLanguage))}</span>
      <button type="button" className="button primary" onClick={() => run(() => writeIn(defaultLanguage))}>
        {edi('EDITOR_WRITE_IN', name(defaultLanguage))}
      </button>
      <button type="button" className="button" onClick={() => showTab('texts')}>
        {edi('EDITOR_SEE_TEXTS')}
      </button>
    </p>
  );
}

/** After a save: says why it did not go through, with the files as they were, or that nothing is left to save. */
function afterSave(): boolean {
  if (QuestEditor.lastSaveProblems.length > 0) {
    say(edi('EDITOR_SAVE_REFUSED', QuestEditor.lastSaveProblems.join(', ')));
    return false;
  }
  if (QuestEditor.lastSaveUnstable.length > 0) {
    say(edi('EDITOR_SAVE_UNSTABLE', QuestEditor.lastSaveUnstable.join(', ')));
    return false;
  }
  saved();
  return true;
}

// Valkyrie: EditorMenu.cs EditorMenu.Create (Save)
function save(): void {
  QuestEditor.save();
  if (afterSave()) say(edi('EDITOR_SAVED'));
}

// Valkyrie: EditorTools.cs EditorTools.CreatePackage, which saves first
function createPackage(name: string): void {
  const made = downloadPackage();
  if (!afterSave()) return;
  say(made === 'ready' ? edi('EDITOR_PACKAGE_READY', name) : edi('EDITOR_PACKAGE_FAILED'));
}

/** Saves and, if it went through, plays the scenario with that many heroes (ToolsButton.StartTest). */
function saveAndTest(heroes: number): void {
  QuestEditor.save();
  if (afterSave()) startTest(heroes);
}

/** How many heroes the test has, as Valkyrie's window asks it (ToolsButton.DrawHeroSelection): the last one, within the scenario's limits. */
function TestAsk({ onClose }: { onClose: () => void }) {
  const game = Game.get();
  const { minHero, maxHero } = game.currentQuest!.qd.quest;
  const [heroes, setHeroes] = useState(() => ToolsButton.test());
  const label = val(game.gameType.typeName() === ValkyrieConstants.typeMom ? 'QUEST_EDITOR_INVESTIGATOR_COUNT_LABEL' : 'QUEST_EDITOR_HERO_COUNT_LABEL');
  return (
    <span className="editor-confirm editor-popover editor-test-ask" role="group" aria-label={label}>
      <span>{label}</span>
      <button type="button" className="button" disabled={heroes <= minHero} aria-label={edi('EDITOR_FEWER', label)} onClick={() => setHeroes(heroes - 1)}>
        {CommonStringKeys.MINUS.translate()}
      </button>
      <output className="editor-test-count" aria-live="polite">
        {heroes}
      </output>
      <button type="button" className="button" disabled={heroes >= maxHero} aria-label={edi('EDITOR_MORE', label)} onClick={() => setHeroes(heroes + 1)}>
        {CommonStringKeys.PLUS.translate()}
      </button>
      <button
        type="button"
        className="button primary"
        onClick={() =>
          run(() => {
            onClose();
            saveAndTest(heroes);
          })
        }
      >
        {val('START')}
      </button>
      <button type="button" className="button" onClick={onClose}>
        {CommonStringKeys.CANCEL.translate()}
      </button>
    </span>
  );
}

/** Not in Valkyrie: changes a past session did not save, left when the editor closed, to take up or throw away. */
function Draft() {
  const draft = currentSession().draft;
  if (draft === null) return null;
  return (
    <p className="editor-draft" role="alert">
      <span>{edi('EDITOR_DRAFT', keptAt(draft.time))}</span>
      <button
        type="button"
        className="button primary"
        onClick={() =>
          run(() => {
            if (!recoverDraft(edi('EDITOR_RECOVER_STEP'))) say(edi('EDITOR_DRAFT_FAILED'));
          })
        }
      >
        {edi('EDITOR_DRAFT_RECOVER')}
      </button>
      <button type="button" className="button" onClick={() => run(dropDraft)}>
        {edi('EDITOR_DRAFT_DROP')}
      </button>
    </p>
  );
}

/**
 * What asks first, not in Valkyrie, which goes ahead: what would lose the changes not saved (Reload, which reads the
 * files again, and leaving), and a package of a scenario with problems that break Valkyrie.
 */
type Asked = 'reload' | 'list' | 'menu' | 'package' | 'open';

function Ask({ what, onYes, onNo }: { what: Asked; onYes: () => void; onNo: () => void }) {
  const breaks = currentSession().problems.filter((p) => p.level === 'breaks').length;
  const text = what === 'reload' ? edi('EDITOR_RELOAD_UNSAVED') : what === 'package' ? edi('EDITOR_PACKAGE_BREAKS', breaks) : edi('EDITOR_LEAVE_UNSAVED');
  return (
    <span className="editor-confirm editor-popover" role="alert">
      <span>{text}</span>
      <button type="button" className="button back" onClick={onYes}>
        {what === 'reload' ? val('RELOAD') : what === 'package' ? val('CREATE_PACKAGE') : edi('EDITOR_LEAVE')}
      </button>
      <button type="button" className="button" onClick={onNo}>
        {CommonStringKeys.CANCEL.translate()}
      </button>
    </span>
  );
}

/** Not in Valkyrie, which lists a campaign's adventures as scenarios apart: the campaign's quests, to open another (campaign.ts). */
function CampaignQuests({ folder, root }: { folder: string; root: string }) {
  const { adventures, name } = currentSession().campaign;
  if (adventures.length === 0) return null;
  // The campaign's own quest open: its name as it is being written
  const campaign = samePath(folder, root) ? questHeading() : name;
  const current = adventures.find((a) => samePath(a.path, folder))?.path ?? root;
  return (
    <label className="editor-campaign" title={edi('EDITOR_CAMPAIGN')}>
      <span className="editor-sr">{edi('EDITOR_CAMPAIGN')}</span>
      <Icon name="folder" />
      <select value={current} onChange={(e) => openInCampaign(e.target.value)}>
        <option value={root}>{campaign}</option>
        {adventures.map((a) => (
          <option key={a.path} value={a.path}>
            {a.name}
          </option>
        ))}
      </select>
    </label>
  );
}

/** What each key does, for the keys' window. */
function keys(): [string, string][] {
  const shift = edi('EDITOR_KEY_SHIFT');
  return [
    ['Ctrl+S', val('SAVE')],
    ['Ctrl+Z', val('UNDO')],
    ['Ctrl+Y', edi('EDITOR_REDO')],
    ['Ctrl+K', val('SEARCH_BY_NAME')],
    ['F2', CommonStringKeys.RENAME.translate()],
    [edi('EDITOR_KEY_DELETE'), CommonStringKeys.DELETE.translate()],
    ['Alt+←', edi('EDITOR_PREVIOUS')],
    ['Alt+T', edi('EDITOR_TEXT_MODE')],
    ['R · ' + shift + '+R', edi('EDITOR_TURN_KEYS')],
    [edi('EDITOR_KEY_WHEEL_TURN'), edi('EDITOR_TURN_KEYS')],
    [edi('EDITOR_KEY_DRAG_FREE', shift), edi('EDITOR_SNAP_OFF_KEYS')],
    ['G · M', edi('EDITOR_GRID') + ' · ' + edi('EDITOR_SNAP')],
    ['+ · − · F', edi('EDITOR_ZOOM_KEYS')],
    [edi('EDITOR_KEY_ARROWS'), edi('EDITOR_PAN_KEYS')],
    ['Alt+1 · Alt+2 · Alt+3', edi('EDITOR_PANEL_KEYS')],
  ];
}

function KeysWindow({ onClose }: { onClose: () => void }) {
  return (
    <div className="editor-keys editor-popover" role="dialog" aria-label={edi('EDITOR_KEYS')}>
      <div className="editor-side-head">
        <h2>{edi('EDITOR_KEYS')}</h2>
        <Tool icon="close" label={CommonStringKeys.CLOSE.translate()} onClick={onClose} />
      </div>
      <dl>
        {keys().map(([key, what]) => (
          <div key={key}>
            <dt>
              <kbd>{key}</kbd>
            </dt>
            <dd>{what}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** A folded side panel: a strip that opens it again, with its name and, for the selected component's, what is selected. */
function Rail({ side, label, title, icon }: { side: 'left' | 'right'; label: string; title: string; icon: Parameters<typeof Icon>[0]['name'] }) {
  return (
    <button type="button" className={`editor-rail editor-rail-${side}`} aria-label={label} title={`${label} (${side === 'left' ? 'Alt+1' : 'Alt+2'})`} onClick={() => toggle(side)}>
      <Icon name={side === 'left' ? 'panelLeft' : 'panelRight'} />
      <Icon name={icon} />
      <span>{title}</span>
    </button>
  );
}

/** What the checks found, each level a button to the problems below. */
function ProblemCounts() {
  const counts = problemCounts();
  const level = (kind: 'breaks' | 'wrong' | 'hint', key: string) => (
    <button
      type="button"
      className={`editor-status-item editor-status-${kind}`}
      disabled={counts[kind] === 0}
      title={edi(key, counts[kind])}
      aria-label={edi(key, counts[kind])}
      onClick={() => showTab('problems')}
    >
      <span className={`editor-dot editor-dot-${kind}`} aria-hidden="true" />
      {counts[kind]}
    </button>
  );
  if (counts.breaks + counts.wrong + counts.hint === 0) {
    return (
      <span className="editor-status-item editor-status-clear">
        <Icon name="check" />
        {edi('EDITOR_ALL_CLEAR')}
      </span>
    );
  }
  return (
    <span className="editor-status-group">
      {level('breaks', 'EDITOR_BREAKS')}
      {level('wrong', 'EDITOR_WRONG')}
      {level('hint', 'EDITOR_HINTS')}
    </span>
  );
}

export function Workbench({ path }: { path: string }) {
  const revision = useEditor((s) => s.revision);
  const message = useEditor((s) => s.message);
  const opening = useEditor((s) => s.opening);
  const layout = useLayout();
  const game = Game.get();
  const quest = game.currentQuest!;
  const selection = game.qed?.selection ?? QUEST_SELECTION;
  const folder = Path.getDirectoryName(quest.qd.questPath)!;
  const session = currentSession();
  const adventure = !samePath(session.root, path);
  const [keysShown, setKeysShown] = useState(false);
  const full = useFullscreen();

  // As each panel of Valkyrie's editor is drawn: the map cleaned and dimmed, the selected piece solid and its place marked
  useEffect(() => {
    run(() => EditorComponent.drawOnMap(selection));
  }, [quest, selection, revision]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const typing = e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable="true"]') !== null;
      // A selection window open over the workbench takes the keys (Chooser.tsx)
      if (document.querySelector('[role="dialog"][aria-modal="true"]') !== null) return;
      const ctrl = e.ctrlKey || e.metaKey;
      const lower = e.key.toLowerCase();
      if (ctrl && lower === 's') {
        e.preventDefault();
        // A field being typed in takes its value when it loses the focus, as when Save is pressed
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        run(save);
      } else if (ctrl && !typing && lower === 'z') {
        e.preventDefault();
        run(e.shiftKey ? redo : undo);
      } else if (ctrl && !typing && lower === 'y') {
        e.preventDefault();
        run(redo);
      } else if (ctrl && lower === 'k') {
        e.preventDefault();
        if (!useLayout.getState().right) setLayout({ right: true });
        setTimeout(() => document.querySelector<HTMLInputElement>('[data-editor-search]')?.focus());
      } else if (e.altKey && !ctrl && ['Digit1', 'Digit2', 'Digit3'].includes(e.code)) {
        e.preventDefault();
        toggle(e.code === 'Digit1' ? 'left' : e.code === 'Digit2' ? 'right' : 'bottom');
      } else if (e.altKey && !ctrl && e.code === 'KeyT') {
        e.preventDefault();
        useEditor.setState((s) => ({ textMode: !s.textMode }));
      } else if (e.altKey && !ctrl && e.key === 'ArrowLeft' && !typing) {
        e.preventDefault();
        run(back);
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (!useLayout.getState().left) setLayout({ left: true });
        setTimeout(() => document.querySelector<HTMLInputElement>('[data-editor-rename]')?.select());
      } else if (ctrl || e.altKey || typing) {
        return;
      } else if (lower === 'r') {
        run(() => turnSelected(e.shiftKey));
      } else if (lower === 'g') {
        toggle('grid');
      } else if (lower === 'm') {
        toggle('snap');
      } else if (lower === 'f') {
        showAllPieces();
      } else if (e.key === 'Delete') {
        if ((Game.get().qed?.selection ?? QUEST_SELECTION) !== QUEST_SELECTION) useEditor.setState({ deleting: true });
      } else if (e.key === '?') {
        setKeysShown((shown) => !shown);
      } else if (e.key === 'Escape') {
        setKeysShown(false);
        useEditor.setState({ placing: null });
      }
    };
    // Closing the page with changes not saved asks first, as leaving the workbench does
    const unload = (e: BeforeUnloadEvent) => {
      if (!currentSession().dirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('keydown', key);
    window.addEventListener('beforeunload', unload);
    return () => {
      window.removeEventListener('keydown', key);
      window.removeEventListener('beforeunload', unload);
    };
  }, []);

  const [asking, setAsking] = useState<Asked | null>(null);
  const [testing, setTesting] = useState(false);
  const act = (what: Asked) =>
    run(() => {
      setAsking(null);
      if (what === 'package') {
        createPackage(Path.getFileName(folder));
      } else if (what === 'open') {
        const target = useEditor.getState().opening;
        openInCampaign(null);
        if (target === null) return;
        // Left on purpose: what was not saved goes with it
        if (currentSession().dirty) dropDraft();
        openQuest(target);
      } else if (what === 'reload') {
        // Valkyrie: EditorMenu.cs EditorMenu.Create (Reload)
        QuestEditor.reload(quest.originalPath);
        reloaded();
      } else {
        // Left on purpose: what was not saved goes with it
        if (currentSession().dirty) dropDraft();
        if (what === 'menu') {
          GameStateManager.mainMenu();
        } else {
          // The list does not need the scenario: it goes, as GameStateManager.MainMenu would take it
          Destroyer.destroy();
          go({ name: 'list' });
        }
      }
    });
  const ask = (what: Asked) => {
    const asks = what === 'package' ? currentSession().problems.some((p) => p.level === 'breaks') : currentSession().dirty;
    if (asks) setAsking(what);
    else act(what);
  };
  // Another quest of the campaign, asked for by its list or a panel (openInCampaign); not asked for any more once the
  // workbench is left some other way
  useEffect(() => {
    if (opening === null) return;
    if (samePath(opening, path)) openInCampaign(null);
    else ask('open');
  }, [opening]);
  useEffect(() => () => openInCampaign(null), []);

  // The rest of Valkyrie's editor menu and of its Tools, and what Universalis adds there
  const menu: MenuEntry[] = [
    { label: val('SAVE'), icon: 'save', keys: 'Ctrl+S', onSelect: () => run(save) },
    { label: val('RELOAD'), icon: 'reload', onSelect: () => ask('reload') },
    { label: edi('EDITOR_VERSIONS'), icon: 'history', onSelect: () => showTab('versions') },
    { label: edi('EDITOR_FILES'), icon: 'file', onSelect: () => showTab('files') },
    'separator',
    // An adventure goes in its campaign's package
    ...(adventure
      ? [{ label: edi('EDITOR_ADVENTURE_PACKAGE'), disabled: true, onSelect: () => {} }]
      : [
          { label: val('CREATE_PACKAGE'), icon: 'package' as const, onSelect: () => ask('package') },
          { label: edi('EDITOR_EXPORT'), icon: 'download' as const, onSelect: () => run(() => exportScenario(folder)) },
        ]),
    'separator',
    { label: edi('EDITOR_BACK_TO_LIST'), icon: 'back', onSelect: () => ask('list') },
    { label: val('MAIN_MENU'), icon: 'home', onSelect: () => ask('menu') },
  ];

  const component = selection === QUEST_SELECTION ? undefined : quest.qd.components.get(selection);
  const style = { '--editor-left': layout.left ? `${layout.leftWidth}px` : undefined, '--editor-right': layout.right ? `${layout.rightWidth}px` : undefined } as CSSProperties;

  return (
    <main className="editor-workbench" data-editor-theme={layout.theme} style={style}>
      <header className="editor-bar">
        <div className="editor-bar-group editor-bar-title">
          <Tool icon="back" label={CommonStringKeys.BACK.translate()} onClick={() => ask('list')} />
          <Menu icon="menu" label={edi('EDITOR_MENU')} entries={menu} />
          <h1 title={edi('EDITOR_FOLDER', adventure ? Path.getFileName(session.root) + '/' + pathFrom(session.root, path) : Path.getFileName(path))}>
            <RichText text={questHeading()} />
          </h1>
          <span className="quiet editor-bar-folder">{edi('EDITOR_FOLDER', adventure ? Path.getFileName(session.root) + '/' + pathFrom(session.root, path) : Path.getFileName(path))}</span>
          <CampaignQuests folder={path} root={session.root} />
        </div>
        <div className="editor-bar-group" role="group" aria-label={edi('EDITOR_HISTORY')}>
          <Tool icon="undo" label={val('UNDO')} title={session.history.undoLabel ?? undefined} keys="Ctrl+Z" disabled={!session.history.canUndo} onClick={() => run(undo)} />
          <Tool icon="redo" label={edi('EDITOR_REDO')} title={session.history.redoLabel ?? undefined} keys="Ctrl+Y" disabled={!session.history.canRedo} onClick={() => run(redo)} />
        </div>
        <div className="editor-bar-group">
          <button
            type="button"
            className={'editor-tool editor-tool-text editor-save' + (session.dirty ? ' editor-dirty' : '')}
            aria-label={val('SAVE')}
            title={`${val('SAVE')} (Ctrl+S)`}
            onClick={() => run(save)}
          >
            <Icon name="save" />
            <span>{val('SAVE')}</span>
          </button>
          {session.dirty && <span className="editor-unsaved">{edi('EDITOR_UNSAVED')}</span>}
          <Tool icon="play" label={val('SAVE_TEST')} text={edi('EDITOR_TEST_SHORT')} className="editor-test" expanded={testing} onClick={() => setTesting(!testing)} />
        </div>
        <div className="editor-bar-group editor-bar-view" role="group" aria-label={edi('EDITOR_VIEW')}>
          <Tool icon="panelLeft" label={edi('EDITOR_PANEL_LEFT')} keys="Alt+1" pressed={layout.left} onClick={() => toggle('left')} />
          <Tool icon="panelBottom" label={edi('EDITOR_PANEL_BOTTOM')} keys="Alt+3" pressed={layout.bottom} onClick={() => toggle('bottom')} />
          <Tool icon="panelRight" label={edi('EDITOR_PANEL_RIGHT')} keys="Alt+2" pressed={layout.right} onClick={() => toggle('right')} />
          <Tool icon="keyboard" label={edi('EDITOR_KEYS')} keys="?" pressed={keysShown} onClick={() => setKeysShown(!keysShown)} />
          {document.fullscreenEnabled && <Tool icon={full ? 'minimize' : 'maximize'} label={edi('EDITOR_FULLSCREEN')} keys="F11" pressed={full} onClick={toggleFullscreen} />}
          <Menu
            icon="palette"
            label={edi('EDITOR_THEME')}
            entries={EDITOR_THEMES.map((theme) => ({ label: edi('EDITOR_THEME_' + theme.toUpperCase()), checked: layout.theme === theme, onSelect: () => setLayout({ theme }) }))}
          />
        </div>
        {asking !== null && (
          <Ask
            what={asking}
            onYes={() => act(asking)}
            onNo={() => {
              if (asking === 'open') openInCampaign(null);
              setAsking(null);
            }}
          />
        )}
        {testing && <TestAsk onClose={() => setTesting(false)} />}
        {keysShown && <KeysWindow onClose={() => setKeysShown(false)} />}
      </header>
      <Draft />
      <WritingWarning />
      <div className={'editor-panes' + (layout.left ? '' : ' editor-no-left') + (layout.right ? '' : ' editor-no-right')}>
        {layout.left ? (
          <Properties />
        ) : (
          <Rail side="left" label={edi('EDITOR_SHOW_PANEL')} title={component?.sectionName ?? val('QUEST')} icon={component === undefined ? 'quest' : typeIcon(component.typeDynamic)} />
        )}
        {!layout.left && <span />}
        {layout.left && (
          <Splitter
            label={edi('EDITOR_SIZE_PANEL')}
            vertical
            size={layout.leftWidth}
            limits={LIMITS.leftWidth}
            grows={1}
            onSize={(leftWidth) => setLayout({ leftWidth })}
            onFold={() => toggle('left')}
          />
        )}
        <EditorMap />
        {layout.right && (
          <Splitter
            label={edi('EDITOR_SIZE_LIST')}
            vertical
            size={layout.rightWidth}
            limits={LIMITS.rightWidth}
            grows={-1}
            onSize={(rightWidth) => setLayout({ rightWidth })}
            onFold={() => toggle('right')}
          />
        )}
        {!layout.right && <span />}
        {layout.right ? <RightPanel /> : <Rail side="right" label={edi('EDITOR_SHOW_LIST')} title={edi('EDITOR_COMPONENTS_LIST')} icon="tile" />}
      </div>
      {layout.bottom && !layout.tall && (
        <Splitter
          label={edi('EDITOR_SIZE_BOTTOM')}
          vertical={false}
          size={layout.bottomHeight}
          limits={LIMITS.bottomHeight}
          grows={-1}
          onSize={(bottomHeight) => setLayout({ bottomHeight })}
          onFold={() => toggle('bottom')}
        />
      )}
      <BottomPanel folder={folder} />
      <footer className="editor-status">
        <ProblemCounts />
        <p className="editor-message" role="status">
          {message}
        </p>
        <WritingNote />
        <span className="editor-status-item editor-dev-chip" title={edi(__EDITOR_PREVIEW__ ? 'EDITOR_PREVIEW_NOTE' : 'EDITOR_DEV_ONLY')}>
          {edi(__EDITOR_PREVIEW__ ? 'EDITOR_PREVIEW_CHIP' : 'EDITOR_DEV_CHIP')}
        </span>
      </footer>
    </main>
  );
}
