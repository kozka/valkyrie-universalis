// Round trip of the scenario editor over every downloaded scenario: each quest Valkyrie's editor can open is opened as
// QuestEditor.Reload does, saved as QuestEditor.Save does, and opened again. What Valkyrie loads must not change
// (components in the same order with the same data, the same texts in every language); the files may change only as
// Valkyrie's own editor changes them. With --edit, each quest that comes back the same is then edited as an author
// would: its components renamed (all of them, or a sample of a big quest), the renaming undone and redone, saved and
// opened again, then some of them deleted, saved and opened again (in a package of more than 40 quests, 40 of them).
// Every reference must follow a rename, a delete must take away only the component, its texts and the references to
// it, and nothing else may change. Every save also reads its files back, as Reload would, and they must save the same
// (QuestEditor.lastSaveUnstable). Not ported from Valkyrie.
//
//   node tools/battery/roundtrip.ts                    every quest of both games; exit code 1 if anything changed
//   node tools/battery/roundtrip.ts --edit             the same, editing them too
//   node tools/battery/roundtrip.ts --game MoM --filter Lynch --show 5 --extra <folder with .valkyrie files>
//
// Outcomes: identical (only the "; Saved by version" lines change), same-load (the files change, what loads does
// not), rounded (positions or sizes with more than 7 significant digits, which Valkyrie's float.ToString() rounds
// too), changed, cannot-open (Valkyrie's editor stops on it too: a fatal error while opening), error, skipped (not a
// quest the editor lists: not valid or of the other game).
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import {
  Application,
  ContentData,
  Directory,
  EditorComponent,
  ExtractManager,
  Game,
  LocalizationRead,
  Path,
  QuestData,
  QuestEditor,
  QuestEditorData,
  QuestEditorHistory,
  SearchOption,
  ValkyrieDebug,
} from '../../packages/engine/src/index.ts';
import { floatToString } from '../../packages/engine/src/platform/CSharp.ts';
import { decodeText } from '../../packages/engine/src/platform/TextDecoding.ts';
import { createEnvironment, type Environment, type GameName } from './environment.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dataDir = join(root, 'packages', 'engine', 'data');
const downloads = join(root, 'referencias', 'descargas');
const reportPath = join(root, 'tests', 'battery', 'roundtrip-report.json');

const { values: args } = parseArgs({
  options: {
    game: { type: 'string', multiple: true },
    filter: { type: 'string' },
    show: { type: 'string', default: '10' },
    extra: { type: 'string', multiple: true },
    edit: { type: 'boolean', default: false },
  },
});

/** A big quest has a sample of its components renamed and deleted, spread over it, so that a run ends in minutes. */
const RENAME_LIMIT = 250;
const DELETE_LIMIT = 40;
/** A package with more quests (the TLE campaigns: up to 777, much alike) has a sample of them edited. */
const EDITED_PER_PACKAGE = 40;

const OUTCOMES = ['identical', 'same-load', 'rounded', 'changed', 'cannot-open', 'error', 'skipped'] as const;
type Outcome = (typeof OUTCOMES)[number];

interface FileChange {
  file: string;
  /** new: the file did not exist; header: only the "; Saved by version" lines; line-endings; text: anything else. */
  kind: 'new' | 'header' | 'line-endings' | 'text';
  /** For text: the first line that differs, before and after. */
  line?: number;
  before?: string;
  after?: string;
}

interface QuestResult {
  id: string;
  outcome: Outcome;
  reason?: string;
  /** What Valkyrie would load differently after the save. */
  differences?: string[];
  /** Numbers rounded to 7 significant digits, as Valkyrie's own save rounds them. */
  rounded?: number;
  files?: FileChange[];
  formatBefore?: number;
  edit?: EditResult;
  ms: number;
}

interface EditResult {
  renamed: number;
  deleted: number;
  /** What an edit changed that it should not have, or left behind. */
  problems?: string[];
  /** Numbers rounded again to 7 significant digits on the way. */
  rounded?: number;
  ms: number;
}

function filesWithExtension(folder: string, extension: string): string[] {
  if (!existsSync(folder)) return [];
  const found: string[] = [];
  for (const name of readdirSync(folder).sort()) {
    const path = join(folder, name);
    if (statSync(path).isDirectory()) found.push(...filesWithExtension(path, extension));
    else if (name.toLowerCase().endsWith(extension.toLowerCase())) found.push(path);
  }
  return found;
}

/** A plain copy of what a quest component holds, for comparing two loads: no pictures, functions or cycles. */
function plain(value: unknown, seen = new WeakSet<object>(), depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'function') return undefined;
  if (typeof value !== 'object') return value;
  if (value instanceof Game) return '<game>';
  if (seen.has(value) || depth > 10) return '<seen>';
  seen.add(value);
  if (value instanceof Map) return [...value].map(([k, v]) => [k, plain(v, seen, depth + 1)]);
  if (value instanceof Set) return [...value].map((v) => plain(v, seen, depth + 1));
  if (Array.isArray(value)) return value.map((v) => plain(v, seen, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    if (k === 'image' || typeof v === 'function') continue;
    out[k] = plain(v, seen, depth + 1);
  }
  return out;
}

interface LoadedQuest {
  order: string[];
  components: Map<string, unknown>;
  quest: Record<string, unknown>;
  texts: Map<string, Map<string, string>>;
}

/** What Valkyrie has loaded for the current quest. */
function loaded(): LoadedQuest {
  const qd = Game.get().currentQuest!.qd;
  const components = new Map<string, unknown>();
  for (const [name, c] of qd.components) components.set(name, plain(c));
  const quest = plain(qd.quest) as Record<string, unknown>;
  // Not what the quest says: where it was read from, and its format, which a save brings to the current one
  for (const key of ['localizationDict', 'context', 'format']) delete quest[key];
  return { order: [...qd.components.keys()], components, quest, texts: LocalizationRead.selectDictionary('qst')?.allEntries() ?? new Map() };
}

interface Found {
  changed: string[];
  rounded: number;
}

const short = (v: unknown) => {
  const text = JSON.stringify(v) ?? String(v);
  return text.length > 80 ? text.substring(0, 77) + '…' : text;
};

/** Compares two plain values; a number that Valkyrie's float.ToString() and float.Parse() would give is only rounded. */
function compare(a: unknown, b: unknown, path: string, found: Found): void {
  if (Object.is(a, b) || (a === 0 && b === 0)) return;
  if (typeof a === 'number' && typeof b === 'number') {
    if (Math.fround(Number(floatToString(a))) === b) found.rounded++;
    else found.changed.push(`${path}: ${a} -> ${b}`);
    return;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      found.changed.push(`${path}: ${short(a)} -> ${short(b)}`);
      return;
    }
    a.forEach((v, i) => compare(v, b[i], `${path}[${i}]`, found));
    return;
  }
  if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) compare((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], `${path}.${key}`, found);
    return;
  }
  found.changed.push(`${path}: ${short(a)} -> ${short(b)}`);
}

function differences(before: LoadedQuest, after: LoadedQuest): Found {
  const found: Found = { changed: [], rounded: 0 };
  if (before.order.join(' ') !== after.order.join(' ')) {
    const at = before.order.findIndex((name, i) => after.order[i] !== name);
    found.changed.push(`order from ${before.order[at]} (${before.order.length} -> ${after.order.length} components)`);
  }
  for (const [name, data] of before.components) {
    if (!after.components.has(name)) found.changed.push(`${name}: gone`);
    else compare(data, after.components.get(name), name, found);
  }
  for (const name of after.components.keys()) if (!before.components.has(name)) found.changed.push(`${name}: new`);
  compare(before.quest, after.quest, '[Quest]', found);
  for (const [language, entries] of before.texts) {
    const now = after.texts.get(language);
    if (now === undefined) {
      found.changed.push(`texts ${language}: gone`);
      continue;
    }
    for (const [key, value] of entries) {
      if (!now.has(key)) found.changed.push(`texts ${language} ${key}: gone`);
      else if (now.get(key) !== value) found.changed.push(`texts ${language} ${key}: ${short(value)} -> ${short(now.get(key))}`);
    }
    for (const key of now.keys()) if (!entries.has(key)) found.changed.push(`texts ${language} ${key}: new`);
  }
  for (const language of after.texts.keys()) if (!before.texts.has(language)) found.changed.push(`texts ${language}: new language`);
  return found;
}

const HEADER = /^; Saved by version: .*$/gm;

function fileChange(file: string, before: string | null, after: string): FileChange | null {
  if (before === null) return { file, kind: 'new' };
  if (before === after) return null;
  if (before.replace(HEADER, '') === after.replace(HEADER, '')) return { file, kind: 'header' };
  const lines = (s: string) => s.replace(HEADER, '').split(/\r\n|\r|\n/);
  const a = lines(before);
  const b = lines(after);
  if (a.join('\n') === b.join('\n')) return { file, kind: 'line-endings' };
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return { file, kind: 'text', line: i + 1, before: a[i], after: b[i] };
}

let env: Environment | null = null;

function readText(path: string): string | null {
  const data = env!.vfs.readFile(path);
  return data === null ? null : decodeText(data);
}

// ---- Editing ----

/** Every string in a plain value, with where it is. */
function eachString(value: unknown, path: string, visit: (s: string, path: string) => void): void {
  if (typeof value === 'string') visit(value, path);
  else if (Array.isArray(value)) value.forEach((v, i) => eachString(v, `${path}[${i}]`, visit));
  else if (value !== null && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) eachString(v, `${path}.${k}`, visit);
  }
}

/** A plain value with every string passed through a function. */
function mapStrings(value: unknown, f: (s: string) => string): unknown {
  if (typeof value === 'string') return f(value);
  if (Array.isArray(value)) return value.map((v) => mapStrings(v, f));
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapStrings(v, f)]));
  }
  return value;
}

/** The names a string uses: as it is, in a Defeated trigger, as a text key's prefix, in {c:…} and {qst:….}. */
function namesIn(s: string): string[] {
  const found = [s];
  for (const prefix of ['DefeatedUnique', 'Defeated']) if (s.startsWith(prefix)) found.push(s.substring(prefix.length));
  const dot = s.indexOf('.');
  if (dot > 0) found.push(s.substring(0, dot));
  for (const m of s.matchAll(/\{c:([^{}]*?)\}/g)) found.push(m[1]!);
  for (const m of s.matchAll(/\{qst:([^.{}:]*)\./g)) found.push(m[1]!);
  return found;
}

/** A string with the names a renaming gave put back: back maps each new name to the old one. */
function nameBack(s: string, back: Map<string, string>): string {
  const exact = back.get(s);
  if (exact !== undefined) return exact;
  for (const prefix of ['DefeatedUnique', 'Defeated']) {
    const old = s.startsWith(prefix) ? back.get(s.substring(prefix.length)) : undefined;
    if (old !== undefined) return prefix + old;
  }
  const dot = s.indexOf('.');
  const old = dot > 0 ? back.get(s.substring(0, dot)) : undefined;
  if (old !== undefined) return old + s.substring(dot);
  return s
    .replace(/\{c:([^{}]*?)\}/g, (m, name: string) => (back.has(name) ? `{c:${back.get(name)}}` : m))
    .replace(/\{qst:([^.{}:]*)\./g, (m, name: string) => (back.has(name) ? `{qst:${back.get(name)}.` : m));
}

/** What loaded() gives with the new names put back. */
function namesBack(quest: LoadedQuest, back: Map<string, string>): LoadedQuest {
  const components = new Map<string, unknown>();
  for (const [name, data] of quest.components) components.set(back.get(name) ?? name, mapStrings(data, (s) => nameBack(s, back)));
  const texts = new Map<string, Map<string, string>>();
  for (const [language, entries] of quest.texts) {
    texts.set(language, new Map([...entries].map(([k, v]) => [nameBack(k, back), nameBack(v, back)])));
  }
  return { order: quest.order.map((n) => back.get(n) ?? n), components, quest: mapStrings(quest.quest, (s) => nameBack(s, back)) as Record<string, unknown>, texts };
}

/**
 * Fields that hold a name of the game's data, a variable, or a picture or sound an author may name after a component,
 * never a component's name (as a trigger, only Defeated…).
 */
const NOT_COMPONENTS = new Set(['tokenName', 'tileSideName', 'baseMonster', 'typeDynamic', 'source', 'var', 'operation', 'value', 'audio', 'music', 'customImage', 'imageName', 'imageType', 'imagePath', 'imagePlace']);

/** Names of a quest that are gone, still used somewhere: in a component or in a text. */
function leftBehind(quest: LoadedQuest, gone: Set<string>): string[] {
  const found: string[] = [];
  const check = (s: string, where: string) => {
    const field = where.substring(where.lastIndexOf('.') + 1).replace(/\[\d+\]/g, '');
    if (NOT_COMPONENTS.has(field) || (field === 'trigger' && !s.startsWith('Defeated'))) return;
    const names = field === 'trigger' ? namesIn(s).slice(1) : namesIn(s);
    for (const name of names) if (gone.has(name)) found.push(`${where}: ${short(s)}`);
  };
  for (const [name, data] of quest.components) eachString(data, name, check);
  for (const [language, entries] of quest.texts) for (const [k, v] of entries) check(k + ',' + v, `texts ${language}`);
  return found;
}

/** Spread over the list: all of it when it is short. */
function sample<T>(list: readonly T[], limit: number, offset = 0): T[] {
  if (list.length <= limit) return [...list];
  const step = list.length / limit;
  return Array.from({ length: limit }, (_, i) => list[Math.floor(offset + i * step) % list.length]!);
}

/** Saves and opens the quest again, as the editor's Save then Reload do. */
function saveAndReload(questDir: string, step: string): void {
  QuestEditor.save();
  if (QuestEditor.lastSaveProblems.length > 0) throw new Error(`${step}: not saved: ${QuestEditor.lastSaveProblems.join(' ')}`);
  if (QuestEditor.lastSaveUnstable.length > 0) throw new Error(`${step}: saved files that read back otherwise: ${QuestEditor.lastSaveUnstable.join(' ')}`);
  QuestEditor.reload(questDir);
  if (Application.fatalErrors.length > 0) throw new Error(`${step}: fatal after saving: ${Application.fatalErrors[0]!.message}`);
}

/** A delete takes the component away and, in the others, what pointed at it: compares what is left with what was. */
function compareAfterDelete(a: unknown, b: unknown, path: string, deleted: Set<string>, found: Found): void {
  if (typeof a === 'string' && typeof b === 'string') {
    if (deleted.has(a) && b === '') return;
    for (const prefix of ['DefeatedUnique', 'Defeated']) if (a.startsWith(prefix) && deleted.has(a.substring(prefix.length)) && b === prefix) return;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    const kept = a.filter((v) => !(typeof v === 'string' && deleted.has(v)));
    if (kept.length !== b.length) {
      found.changed.push(`${path}: ${short(a)} -> ${short(b)}`);
      return;
    }
    kept.forEach((v, i) => compareAfterDelete(v, b[i], `${path}[${i}]`, deleted, found));
    return;
  }
  if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) compareAfterDelete((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], `${path}.${key}`, deleted, found);
    return;
  }
  compare(a, b, path, found);
}

function editQuest(questDir: string): EditResult {
  const started = performance.now();
  const game = Game.get();
  const result: EditResult = { renamed: 0, deleted: 0, ms: 0 };
  const problems: string[] = [];
  let rounded = 0;
  const note = (step: string, found: Found) => {
    rounded += found.rounded;
    for (const c of found.changed) problems.push(`${step}: ${c}`);
  };

  // The quest as the round trip left it: saved once by the editor
  QuestEditor.reload(questDir);
  const base = loaded();

  // Rename, as the component panel does, then undo and redo it
  const history = new QuestEditorHistory();
  history.record('rename');
  const back = new Map<string, string>();
  const qd = game.currentQuest!.qd;
  for (const name of sample([...qd.components.keys()], RENAME_LIMIT)) {
    const component = qd.components.get(name)!;
    const now = EditorComponent.renameFinished(component, EditorComponent.renameValue(component) + 'Rn');
    if (now !== name) back.set(now, name);
  }
  result.renamed = back.size;
  const gone = new Set([...back.values()].filter((old) => !qd.components.has(old)));
  // An activation can be named without its type (CustomMonster.ChangeReference)
  for (const [now, old] of [...back]) {
    if (now.startsWith('Activation') && old.startsWith('Activation')) back.set(now.substring(10), old.substring(10));
  }
  const renamed = loaded();
  note('rename', differences(base, namesBack(renamed, back)));
  for (const left of leftBehind(renamed, gone)) problems.push(`rename left ${left}`);

  if (!history.undo()) problems.push('undo: not restored');
  else note('undo', differences(base, loaded()));
  if (!history.redo()) problems.push('redo: not restored');
  saveAndReload(questDir, 'rename');
  note('rename saved', differences(base, namesBack(loaded(), back)));

  // Delete, as the panel's Delete button does
  const before = loaded();
  const deleted = new Set(sample(before.order, DELETE_LIMIT, 1));
  for (const name of deleted) {
    game.qed!.selection = name;
    QuestEditorData.deleteCurrentComponent();
  }
  result.deleted = deleted.size;
  saveAndReload(questDir, 'delete');
  const after = loaded();
  const found: Found = { changed: [], rounded: 0 };
  const kept = before.order.filter((n) => !deleted.has(n));
  if (kept.join(' ') !== after.order.join(' ')) found.changed.push(`order: ${kept.length} -> ${after.order.length} components`);
  const deletedNames = new Set(deleted);
  for (const name of deleted) if (name.startsWith('Activation')) deletedNames.add(name.substring(10));
  for (const name of kept) {
    if (after.components.has(name)) compareAfterDelete(before.components.get(name), after.components.get(name), name, deletedNames, found);
  }
  compare(before.quest, after.quest, '[Quest]', found);
  for (const [language, entries] of before.texts) {
    const left = new Map([...entries].filter(([k]) => !deleted.has(k.substring(0, k.indexOf('.')))));
    compare([...left], [...(after.texts.get(language) ?? [])], `texts ${language}`, found);
  }
  note('delete', found);
  for (const left of leftBehind({ ...after, texts: new Map() }, deleted)) problems.push(`delete left ${left}`);

  if (problems.length > 0) result.problems = problems;
  if (rounded > 0) result.rounded = rounded;
  result.ms = Math.round(performance.now() - started);
  return result;
}

function runQuest(questDir: string, id: string, edit: boolean): QuestResult {
  const started = performance.now();
  const game = Game.get();
  const result: QuestResult = { id, outcome: 'identical', ms: 0 };
  Application.fatalErrors.length = 0;
  const stopLog = ValkyrieDebug.onLog(() => {});
  // What the save replaces, put back afterwards: the package's other quests (and a campaign's shared files) stay as they were
  const replaced: { path: string; source: ReturnType<Environment['vfs']['fileSource']>; size: number | null }[] = [];
  let opened = false;
  try {
    // QuestLoader.GetUserUnpackedQuests lists a quest if it is valid and of this game, hidden or not
    const q = new QuestData.Quest(questDir);
    if (!q.valid || q.type !== game.gameType.typeName()) {
      result.outcome = 'skipped';
      result.reason = !q.valid ? 'not-valid' : 'other-game';
      return result;
    }
    result.formatBefore = q.format;

    game.qed = null;
    game.editMode = true;
    QuestEditor.reload(questDir);
    if (Application.fatalErrors.length > 0) {
      result.outcome = 'cannot-open';
      result.reason = Application.fatalErrors[0]!.message;
      return result;
    }
    opened = true;
    const before = loaded();

    const toSave = QuestEditor.filesToSave();
    const written = [...toSave.localization.keys(), ...toSave.data.keys()];
    const originals = new Map<string, string | null>();
    for (const f of written) {
      const path = Path.combine(questDir, f);
      replaced.push({ path, source: env!.vfs.fileSource(path), size: env!.vfs.fileSize(path) });
      originals.set(f, readText(path));
    }
    QuestEditor.save();
    if (QuestEditor.lastSaveProblems.length > 0) throw new Error('not saved: ' + QuestEditor.lastSaveProblems.join(' '));
    // Save reads its files back as Reload does: what would save otherwise is put back, and counts as changed
    if (QuestEditor.lastSaveUnstable.length > 0) {
      result.outcome = 'changed';
      result.differences = ['saved files that read back otherwise: ' + QuestEditor.lastSaveUnstable.join(' ')];
      return result;
    }

    const files: FileChange[] = [];
    for (const f of written) {
      const change = fileChange(f, originals.get(f) ?? null, readText(Path.combine(questDir, f)) ?? '');
      if (change) files.push(change);
    }
    if (files.length > 0) result.files = files;

    QuestEditor.reload(questDir);
    if (Application.fatalErrors.length > 0) throw new Error('fatal after saving: ' + Application.fatalErrors[0]!.message);
    const found = differences(before, loaded());
    if (found.rounded > 0) result.rounded = found.rounded;
    if (found.changed.length > 0) {
      result.outcome = 'changed';
      result.differences = found.changed;
    } else if (found.rounded > 0) {
      result.outcome = 'rounded';
    } else if (files.some((f) => f.kind !== 'header')) {
      result.outcome = 'same-load';
    }
    if (edit && result.outcome !== 'changed') {
      try {
        result.edit = editQuest(questDir);
      } catch (e) {
        result.edit = { renamed: 0, deleted: 0, problems: ['error: ' + (e instanceof Error ? (e.stack ?? e.message).split('\n').slice(0, 3).join(' | ') : String(e))], ms: 0 };
      }
    }
  } catch (e) {
    result.outcome = opened ? 'error' : 'cannot-open';
    result.reason = e instanceof Error ? (e.stack ?? e.message).split('\n').slice(0, 3).join(' | ') : String(e);
  } finally {
    stopLog();
    game.editMode = false;
    for (const { path, source, size } of replaced.reverse()) {
      if (source === null) env!.vfs.deleteFile(path);
      else env!.vfs.writeFile(path, source, size ?? undefined);
    }
    result.ms = Math.round(performance.now() - started);
  }
  return result;
}

function runPackage(file: string, idPrefix: string): QuestResult[] {
  const download = ContentData.downloadPath() + '/' + basename(file);
  env!.vfs.writeFile(download, () => readFileSync(file), statSync(file).size);
  const extracted = ExtractManager.extractSinglePackageFull(download);
  const results: QuestResult[] = [];
  const questFiles = Directory.getFiles(extracted, 'quest.ini', SearchOption.AllDirectories);
  const edited = new Set(sample(questFiles, EDITED_PER_PACKAGE));
  for (const questFile of questFiles) {
    const questDir = Path.getDirectoryName(questFile)!;
    const id = questDir === extracted ? idPrefix : idPrefix + '/' + questDir.substring(extracted.length + 1);
    results.push(runQuest(questDir, id, args.edit === true && edited.has(questFile)));
  }
  env!.vfs.deleteDirectory(extracted);
  env!.vfs.deleteFile(download);
  // The versions the saves kept (QuestEditorVersions), which nothing reads here
  const versions = Game.appData() + '/' + Game.get().gameType.typeName() + '/EditorVersions';
  if (Directory.exists(versions)) Directory.delete(versions, true);
  return results;
}

function main(): number {
  if (!existsSync(downloads)) {
    console.error('Missing referencias/descargas: run node referencias/descargar-escenarios.mjs first.');
    return 2;
  }
  const games = (args.game ?? ['MoM', 'D2E']) as GameName[];
  const extras = (args.extra ?? []).flatMap((folder) => filesWithExtension(folder, '.valkyrie'));
  const results: QuestResult[] = [];
  const started = performance.now();
  for (const gameName of games) {
    env = createEnvironment(gameName, dataDir, filesWithExtension(join(downloads, gameName, 'packs'), '.valkyrieContentPack'));
    const scenarios = filesWithExtension(join(downloads, gameName, 'escenarios'), '.valkyrie').map((file) => ({ file, id: `${gameName}/${basename(file, '.valkyrie')}` }));
    scenarios.push(...extras.map((file) => ({ file, id: `extra/${gameName}/${basename(file, '.valkyrie')}` })));
    const selected = scenarios.filter((s) => !args.filter || s.id.toLowerCase().includes(args.filter.toLowerCase()));
    let done = 0;
    for (const { file, id } of selected) {
      const packageStarted = performance.now();
      const packageResults = runPackage(file, id);
      results.push(...packageResults.filter((r) => !(id.startsWith('extra/') && r.outcome === 'skipped' && r.reason === 'other-game')));
      const seconds = Math.round((performance.now() - packageStarted) / 1000);
      if (seconds >= 30) console.log(`  ${id}: ${packageResults.length} quest.ini in ${seconds} s`);
      if (++done % 25 === 0) console.log(`  ${gameName}: ${done}/${selected.length} packages`);
    }
  }
  results.sort((a, b) => (a.id < b.id ? -1 : 1));

  const count = (o: Outcome) => results.filter((r) => r.outcome === o).length;
  const fileKinds: Record<string, number> = {};
  for (const r of results) for (const f of r.files ?? []) fileKinds[f.kind] = (fileKinds[f.kind] ?? 0) + 1;
  writeFileSync(reportPath, JSON.stringify({ date: new Date().toISOString(), results }, null, 1) + '\n');

  const seconds = Math.round((performance.now() - started) / 100) / 10;
  console.log(`\nEditor round trip: ${results.length} quest.ini in ${seconds} s`);
  console.log('  ' + OUTCOMES.map((o) => `${o} ${count(o)}`).join(', '));
  console.log('  Files rewritten: ' + Object.entries(fileKinds).map(([k, n]) => `${k} ${n}`).join(', '));
  const show = Number(args.show);
  for (const r of results.filter((r) => r.outcome === 'changed').slice(0, show)) {
    console.log(`  changed ${r.id}: ${r.differences!.slice(0, 3).join(' ; ')}${r.differences!.length > 3 ? ` (+${r.differences!.length - 3})` : ''}`);
  }
  for (const r of results.filter((r) => r.outcome === 'error' || r.outcome === 'cannot-open').slice(0, show)) console.log(`  ${r.outcome} ${r.id}: ${r.reason}`);
  const edited = results.filter((r) => r.edit !== undefined);
  const withProblems = edited.filter((r) => r.edit!.problems !== undefined);
  if (args.edit) {
    const sum = (f: (e: EditResult) => number) => edited.reduce((n, r) => n + f(r.edit!), 0);
    console.log(`  Edited: ${edited.length} quests, ${sum((e) => e.renamed)} renamed and ${sum((e) => e.deleted)} deleted components; with problems ${withProblems.length}`);
    for (const r of withProblems.slice(0, show)) {
      const p = r.edit!.problems!;
      console.log(`  edit ${r.id}: ${p.slice(0, 3).join(' ; ')}${p.length > 3 ? ` (+${p.length - 3})` : ''}`);
    }
  }
  console.log(`  Report: ${reportPath}`);
  return count('changed') + count('error') + withProblems.length > 0 ? 1 : 0;
}

process.exitCode = main();
