// The scenario open in the editor: its undo history, whether it changed since it was saved, what the checks find in
// it as it is now, before saving (and in the quests of its package, from their files), and its draft: what it holds
// and has not saved, kept a moment after each change (QuestEditorVersions.keepDraft), so that it can be taken up again
// if the editor closes without saving it. Not ported from Valkyrie, whose editor has neither undo nor checks.
import {
  CameraController,
  Directory,
  EditorComponent,
  Game,
  LocalizationRead,
  Path,
  QuestData,
  QuestEditor,
  QuestEditorData,
  QuestEditorHistory,
  QuestEditorVersions,
  QuestGraph,
  QUEST_SELECTION,
  ScenarioFiles,
  SearchOption,
  checkPackage,
  checkQuest,
  problemSignature,
  readQuestForChecks,
  type Problem,
  type QuestVersion,
  type TextsByLanguage,
} from '@universalis/engine';
import { adventuresOf, campaignOf, pathFrom, questChanges, questTitle, samePath, type Adventure } from './campaign.ts';
import { useEditor } from './editorState.ts';

interface Session {
  /** The scenario's folder: one of the Editor folder's, or an adventure of a campaign below one (campaign.ts). */
  folder: string;
  /** The Editor folder's scenario it belongs to: the folder itself, or the adventure's campaign. */
  root: string;
  /** The campaign's name and adventures, and the quest.ini a change of quest can go to: read once, when it opens. */
  campaign: { name: string; adventures: Adventure[]; questChanges: string[] };
  history: QuestEditorHistory;
  /** Changed since it was opened or last saved. */
  dirty: boolean;
  problems: Problem[];
  /** What leads to what, as the checks last saw it. */
  graph: QuestGraph | null;
  /** Changes not saved that a past session left (its draft), until they are taken up again or thrown away. */
  draft: QuestVersion | null;
  /** The problems its author asked not to be told about again (problemSignature), kept beside its versions. */
  ignored: Set<string>;
}

let session: Session = { folder: '', root: '', campaign: { name: '', adventures: [], questChanges: [] }, history: new QuestEditorHistory(), dirty: false, problems: [], graph: null, draft: null, ignored: new Set() };
let recheckTimer: ReturnType<typeof setTimeout> | null = null;
let draftTimer: ReturnType<typeof setTimeout> | null = null;
/** How long after the last change the draft is kept. */
const DRAFT_DELAY_MS = 1500;

/** Draws the editor again. */
function redraw(): void {
  useEditor.setState((s) => ({ revision: s.revision + 1 }));
}

/**
 * A scenario has just been opened (QuestEditor.Begin): a new history, or the one it had before a test from the editor,
 * which saved it first; its checks; and a draft a past session left.
 */
export function beginSession(folder: string, history = new QuestEditorHistory()): void {
  if (draftTimer !== null) clearTimeout(draftTimer);
  draftTimer = null;
  const root = campaignOf(folder);
  const campaign = { name: questTitle(new QuestData.Quest(root)) ?? Path.getFileName(root)!, adventures: adventuresOf(root), questChanges: questChanges(root, folder) };
  session = { folder, root, campaign, history, dirty: false, problems: [], graph: null, draft: null, ignored: new Set(QuestEditorVersions.ignored(folder)) };
  const draft = QuestEditorVersions.draft(folder);
  if (draft !== null) {
    // One that holds what the files hold has nothing to take up
    const now = QuestEditor.filesToSave();
    const held = QuestEditorVersions.draftFiles(draft.path);
    const same = (a: Map<string, string>, b: Map<string, string>) => a.size === b.size && [...a].every(([k, v]) => b.get(k) === v);
    if (same(now.localization, held.localization) && same(now.data, held.data)) QuestEditorVersions.dropDraft(folder);
    else session.draft = draft;
  }
  recheck();
}

/** Takes up the changes a past session did not save, as a change that Undo takes back. */
export function recoverDraft(label: string): boolean {
  const draft = session.draft;
  if (draft === null) return false;
  session.draft = null;
  let loaded = false;
  change(label, () => {
    loaded = QuestEditorHistory.loadFiles(QuestEditorVersions.draftFiles(draft.path));
  });
  return loaded;
}

/** Throws away what was not saved: the draft of a past session, or of this one when its changes are left behind. */
export function dropDraft(): void {
  if (draftTimer !== null) clearTimeout(draftTimer);
  draftTimer = null;
  session.draft = null;
  QuestEditorVersions.dropDraft(session.folder);
  redraw();
}

export function currentSession(): Readonly<Session> {
  return session;
}

/** The open quest's name, as the workbench heads it: an adventure of a campaign without one, its folder in the campaign. */
export function questHeading(): string {
  const name = Game.get().currentQuest!.qd.quest.name;
  const own = name.translate(true);
  if (own !== '' || samePath(session.root, session.folder)) return own || name.translate();
  return pathFrom(session.root, session.folder);
}

/**
 * Selects a component, or the quest itself (QuestEditorData.SelectComponent), and draws the editor again. Chosen
 * away from the map, the camera goes to it, as Valkyrie's editor does for what has a place on the board.
 */
export function select(name: string, fromMap = false): void {
  QuestEditorData.selectComponent(name);
  if (!fromMap) centreOn(name);
  redraw();
}

/** Goes back to what was selected before it (QuestEditorData.Back, the ⇦ of Valkyrie's panels). */
export function back(): void {
  QuestEditorData.back();
  centreOn(Game.get().qed?.selection ?? '');
  redraw();
}

/** The camera goes where the component's panel puts it in Valkyrie (EditorComponent.highlightOf). */
function centreOn(name: string): void {
  const component = Game.get().currentQuest?.qd.components.get(name);
  const place = component === undefined ? null : EditorComponent.highlightOf(component);
  if (place !== null) CameraController.setCamera(place.location);
}

/** Makes a change the history can take back, named for Undo's tooltip, then checks the scenario again. */
export function change(label: string, action: () => void): void {
  session.history.record(label);
  action();
  changed();
}

/** After a change made some other way (Reload forgets the history instead). */
export function changed(): void {
  session.dirty = true;
  recheckSoon();
  keepDraftSoon();
  redraw();
}

function keepDraftSoon(): void {
  if (draftTimer !== null) clearTimeout(draftTimer);
  const folder = session.folder;
  draftTimer = setTimeout(() => {
    draftTimer = null;
    if (!session.dirty || session.folder !== folder || Game.get().currentQuest === null) return;
    QuestEditorVersions.keepDraft(folder, QuestEditor.filesToSave());
  }, DRAFT_DELAY_MS);
}

export function undo(): void {
  if (session.history.undo()) changed();
}

export function redo(): void {
  if (session.history.redo()) changed();
}

/** Takes back that many changes at once (the history panel): the quest is checked once, at the end. */
export function undoSteps(count: number): void {
  let done = false;
  for (let i = 0; i < count && session.history.undo(); i++) done = true;
  if (done) changed();
}

export function redoSteps(count: number): void {
  let done = false;
  for (let i = 0; i < count && session.history.redo(); i++) done = true;
  if (done) changed();
}

/** What was selected, the latest first and each once, from the selection stack of Valkyrie's ⇦ (QuestEditorData). */
export function recentSelections(): string[] {
  const qed = Game.get().qed;
  if (qed === null) return [];
  const quest = Game.get().currentQuest;
  const all = [qed.selection ?? QUEST_SELECTION, ...[...qed.selectionStack].reverse()];
  const seen = new Set<string>();
  return all.filter((name) => {
    if (seen.has(name)) return false;
    seen.add(name);
    return name === QUEST_SELECTION || (quest?.qd.components.has(name) ?? false);
  });
}

/** The quest was saved: nothing is left to save. */
export function saved(): void {
  session.dirty = false;
  dropDraft();
  recheck();
  redraw();
}

/** Reload read the files again: what was undone before belongs to another version, and what was not saved is gone. */
export function reloaded(): void {
  session.history.clear();
  session.dirty = false;
  dropDraft();
  recheck();
  redraw();
}

function recheckSoon(): void {
  if (recheckTimer !== null) clearTimeout(recheckTimer);
  recheckTimer = setTimeout(() => {
    recheckTimer = null;
    recheck();
    redraw();
  }, 300);
}

/**
 * What the checks find in the quest as the editor holds it, and in the other quests of its package as their files are:
 * for an adventure, the whole campaign's, the campaign's own quest first.
 */
function recheck(): void {
  const game = Game.get();
  const quest = game.currentQuest;
  if (quest === null) return;
  const files = ScenarioFiles.fromFiles(session.folder, QuestEditor.filesToSave());
  const { folder, root } = session;
  const problems = checkQuest({ game, files, qd: quest.qd, root });
  const quests = Directory.getFiles(root, 'quest.ini', SearchOption.AllDirectories).sort((a, b) => a.length - b.length);
  const each = function* () {
    for (const q of quests) yield samePath(Path.getDirectoryName(q)!, folder) ? { game, files, qd: quest.qd, root } : { game, ...readQuestForChecks(q), root };
  };
  problems.push(...checkPackage(game, each()));
  session.problems = problems;
  session.graph = new QuestGraph(quest.qd.components, files.texts);
}

/** Whether the author asked not to be told about this problem again. */
export function isIgnored(p: Problem): boolean {
  return session.ignored.has(problemSignature(p));
}

/** Not in Valkyrie: a problem not to be told about again, or to be told about again; never one that breaks Valkyrie. */
export function ignore(p: Problem, on: boolean): void {
  if (p.level === 'breaks') return;
  const signature = problemSignature(p);
  if (on) session.ignored.add(signature);
  else session.ignored.delete(signature);
  QuestEditorVersions.setIgnored(session.folder, [...session.ignored]);
  redraw();
}

let texts: { revision: number; texts: TextsByLanguage } | null = null;

/** The scenario's texts by language as the editor holds them (DictionaryI18n.allEntries), read once a redraw. */
export function textsNow(): TextsByLanguage {
  const revision = useEditor.getState().revision;
  if (texts?.revision !== revision) texts = { revision, texts: LocalizationRead.selectDictionary('qst')?.allEntries() ?? new Map() };
  return texts.texts;
}

/**
 * The language a text is shown in when the language the editor writes in lacks it, as DictionaryI18n.GetValue looks
 * for it (the fallback language, the default one, then any), or null when it has it or no language does.
 */
export function shownFrom(key: string): string | null {
  const all = textsNow();
  const game = Game.get();
  const has = (language: string) => (all.get(language)?.get(key) ?? '').trim() !== '';
  if (has(game.currentLang)) return null;
  const order = [game.fallbackLang ?? '', game.currentQuest?.qd.quest.defaultLanguage ?? '', ...all.keys()];
  return order.find((language) => language !== '' && language !== game.currentLang && has(language)) ?? null;
}

/** The worst level of what the checks find in a component, for the dot by its name; what is ignored does not count. */
export function worstAt(name: string): Problem['level'] | null {
  let worst: Problem['level'] | null = null;
  for (const p of session.problems) {
    if (p.where !== name || isIgnored(p)) continue;
    if (p.level === 'breaks') return 'breaks';
    if (p.level === 'wrong') worst = 'wrong';
    else worst ??= 'hint';
  }
  return worst;
}
