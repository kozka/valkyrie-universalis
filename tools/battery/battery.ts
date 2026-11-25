// Scenario battery (.agent/rules/porting.md): v1 loads every quest.ini of every scenario package downloaded in
// referencias/descargas, with Valkyrie's built-in packs and the community packs; v2 starts every quest the quest list
// shows and runs its start events (start.ts). The outcome of each quest is compared with tests/battery/baseline.json.
// Not ported from Valkyrie.
//
//   node tools/battery/battery.ts                     run and compare; exit code 1 if any quest got worse
//   node tools/battery/battery.ts --update-baseline   run and save the outcome as the new baseline
//   node tools/battery/battery.ts --game MoM --filter Lynch --extra <folder with .valkyrie files>
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import {
  Application,
  ContentData,
  Directory,
  ExtractManager,
  Path,
  QuestData,
  SearchOption,
  ValkyrieDebug,
} from '../../packages/engine/src/index.ts';
import { checkComponents, checkLineEndings, warningsFromLog, type Warning } from './checks.ts';
import { createEnvironment, readBaseDataManifest, type Environment, type GameName } from './environment.ts';
import { START_STATUSES, startQuest, type StartResult, type StartStatus } from './start.ts';

const STATUSES = ['ok', 'warnings', 'missing-packs', 'invalid', 'fatal', 'crash'] as const;
type Status = (typeof STATUSES)[number];
const rank = (status: Status) => STATUSES.indexOf(status);
const startRank = (status: StartStatus) => START_STATUSES.indexOf(status);

interface QuestResult {
  id: string;
  status: Status;
  /** How Valkyrie reaches this quest.ini: from the quest list, or only through an event that changes quest. */
  loadedAs: 'quest' | 'sub-quest';
  /** Why the quest is invalid, which packs are missing, or the reason of the fatal error. */
  reason?: string;
  detail?: string;
  warnings: Warning[];
  /** Battery v2, for a quest the list shows: starting it and running its start events. */
  start?: StartResult;
  ms: number;
}

interface BaselineEntry {
  status: Status;
  warnings?: Record<string, number>;
  start?: StartStatus;
  startWarnings?: Record<string, number>;
}

interface Baseline {
  valkyrieCommit: string;
  quests: Record<string, BaselineEntry>;
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dataDir = join(root, 'packages', 'engine', 'data');
const downloads = join(root, 'referencias', 'descargas');
const baselinePath = join(root, 'tests', 'battery', 'baseline.json');
const reportPath = join(root, 'tests', 'battery', 'report.json');

const { values: args } = parseArgs({
  options: {
    'update-baseline': { type: 'boolean', default: false },
    game: { type: 'string', multiple: true },
    filter: { type: 'string' },
    extra: { type: 'string', multiple: true },
  },
});

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

function invalidReason(log: readonly string[]): string {
  if (log.some((m) => m.includes('has an unknown format'))) return 'unknown-format';
  if (log.some((m) => m.includes('is not compatible with the current game type'))) return 'wrong-type';
  if (log.some((m) => m.startsWith('Could not load the quest.ini file'))) return 'unreadable';
  return 'invalid';
}

/** Loads one quest.ini the way Valkyrie reaches it, and runs the checks on what was loaded. */
function runQuest(env: Environment, questDir: string, packageRoot: string, id: string): QuestResult {
  const started = performance.now();
  Application.fatalErrors.length = 0;
  const log: string[] = [];
  const stopLog = ValkyrieDebug.onLog((message) => {
    if (message) log.push(message);
  });
  const caseMismatches = new Map<string, string>();
  const rootKey = packageRoot.toUpperCase() + '/';
  const stopCase = env.vfs.onCaseMismatch(({ requested, actual }) => {
    if (requested.toUpperCase().startsWith(rootKey)) caseMismatches.set(requested, actual);
  });

  const result: QuestResult = { id, status: 'ok', loadedAs: 'quest', warnings: [], ms: 0 };
  let listedRoot = false;
  let error: unknown = null;
  try {
    // QuestLoader.GetQuests lists a folder if its quest is valid, of this game and not hidden
    const q = new QuestData.Quest(questDir);
    const listed = q.valid && q.type === env.game.gameType.typeName() && !q.hidden;
    listedRoot = listed && questDir === packageRoot;
    let qd: QuestData | null = null;
    if (listed) {
      const missing = q.getMissingPacks(env.game.cd.getLoadedPackIDs());
      if (missing.length > 0) {
        result.status = 'missing-packs';
        result.reason = missing.join(' ');
      }
      // Game.StartQuest, then new Quest(q)
      qd = new QuestData(q);
    } else if (questDir === packageRoot) {
      result.status = 'invalid';
      result.reason = !q.valid ? invalidReason(log) : q.hidden ? 'hidden' : 'no-type';
    } else {
      // Only an event can lead here: Quest.ChangeQuest loads the file without checking it
      result.loadedAs = 'sub-quest';
      qd = new QuestData(questDir + '/quest.ini');
    }
    if (qd !== null && Application.fatalErrors.length === 0) {
      result.warnings.push(...checkComponents(env.game, qd, questDir), ...checkLineEndings(questDir));
    }
  } catch (e) {
    error = e;
  } finally {
    stopLog();
    stopCase();
  }

  result.warnings.push(...warningsFromLog(log));
  const relative = (path: string) => path.substring(packageRoot.length + 1);
  for (const [requested, actual] of caseMismatches) {
    result.warnings.push({ kind: 'letter-case', detail: `${relative(requested)} -> ${relative(actual)}` });
  }
  // One warning per kind and detail, in a stable order
  const unique = new Map(result.warnings.map((w) => [`${w.kind}\u0000${w.detail}`, w]));
  result.warnings = [...unique.values()].sort((a, b) => (a.kind + a.detail < b.kind + b.detail ? -1 : 1));

  const fatal = Application.fatalErrors[0];
  if (fatal) {
    result.status = 'fatal';
    result.reason = fatal.reason;
    result.detail = fatal.message + (error ? ` (then ${String(error)})` : '');
  } else if (error) {
    result.status = 'crash';
    result.reason = error instanceof Error ? error.name : 'Error';
    result.detail = error instanceof Error ? (error.stack ?? error.message).split('\n').slice(0, 4).join(' | ') : String(error);
  } else if (result.warnings.length > 0 && rank(result.status) < rank('warnings')) {
    result.status = 'warnings';
  }
  // Battery v2: a quest of the list that loads is started as a player would
  if (listedRoot && rank(result.status) <= rank('warnings')) {
    result.start = startQuest(env, questDir);
  }
  result.ms = Math.round(performance.now() - started);
  return result;
}

/** Game.StartQuest for a downloaded package: full extraction into the temporary folder, then every quest.ini in it. */
function runPackage(env: Environment, file: string, idPrefix: string): QuestResult[] {
  const download = ContentData.downloadPath() + '/' + basename(file);
  env.vfs.writeFile(download, () => readFileSync(file), statSync(file).size);
  const extractLog: string[] = [];
  const stopLog = ValkyrieDebug.onLog((message) => {
    if (message) extractLog.push(message);
  });
  const extracted = ExtractManager.extractSinglePackageFull(download);
  stopLog();

  const results: QuestResult[] = [];
  const questFiles = Directory.getFiles(extracted, 'quest.ini', SearchOption.AllDirectories);
  if (questFiles.length === 0) {
    results.push({ id: idPrefix, status: 'invalid', loadedAs: 'quest', reason: 'no-quest-ini', detail: extractLog.join(' | '), warnings: [], ms: 0 });
  }
  for (const questFile of questFiles) {
    const questDir = Path.getDirectoryName(questFile)!;
    const id = questDir === extracted ? idPrefix : idPrefix + '/' + questDir.substring(extracted.length + 1);
    results.push(runQuest(env, questDir, extracted, id));
  }

  env.vfs.deleteDirectory(extracted);
  env.vfs.deleteFile(download);
  return results;
}

function packageName(file: string): string {
  return basename(file).replace(/\.valkyrie$/i, '');
}

function compare(results: QuestResult[], baseline: Baseline | null) {
  const worse: string[] = [];
  const better: string[] = [];
  const added: string[] = [];
  if (baseline === null) return { worse, better, added: results.map((r) => r.id), notRun: [] as string[] };
  for (const r of results) {
    const before = baseline.quests[r.id];
    if (!before) {
      added.push(r.id);
      continue;
    }
    const now = toBaselineEntry(r);
    if (rank(now.status) !== rank(before.status)) {
      (rank(now.status) > rank(before.status) ? worse : better).push(`${r.id}: ${before.status} -> ${now.status}`);
      continue;
    }
    if (now.start !== undefined && before.start !== undefined && startRank(now.start) !== startRank(before.start)) {
      (startRank(now.start) > startRank(before.start) ? worse : better).push(`${r.id}: start ${before.start} -> ${now.start}`);
      continue;
    }
    if (now.start !== undefined && before.start === undefined) added.push(`${r.id} (start)`);
    const changes = (nowCounts: Record<string, number> | undefined, beforeCounts: Record<string, number> | undefined) => {
      const kinds = new Set([...Object.keys(nowCounts ?? {}), ...Object.keys(beforeCounts ?? {})]);
      return {
        grew: [...kinds].filter((k) => (nowCounts?.[k] ?? 0) > (beforeCounts?.[k] ?? 0)),
        shrank: [...kinds].filter((k) => (nowCounts?.[k] ?? 0) < (beforeCounts?.[k] ?? 0)),
      };
    };
    const loading = changes(now.warnings, before.warnings);
    const starting = before.start === undefined ? { grew: [], shrank: [] } : changes(now.startWarnings, before.startWarnings);
    const grew = [...loading.grew, ...starting.grew.map((k) => `${k} (start)`)];
    const shrank = [...loading.shrank, ...starting.shrank.map((k) => `${k} (start)`)];
    if (grew.length > 0) worse.push(`${r.id}: more ${grew.join(', ')}`);
    else if (shrank.length > 0) better.push(`${r.id}: fewer ${shrank.join(', ')}`);
  }
  const ran = new Set(results.map((r) => r.id));
  const notRun = Object.keys(baseline.quests).filter((id) => !ran.has(id));
  return { worse, better, added, notRun };
}

function toBaselineEntry(r: QuestResult): BaselineEntry {
  const entry: BaselineEntry = { status: r.status };
  if (r.warnings.length > 0) {
    entry.warnings = {};
    for (const w of r.warnings) entry.warnings[w.kind] = (entry.warnings[w.kind] ?? 0) + 1;
  }
  if (r.start !== undefined) {
    entry.start = r.start.status;
    if (r.start.warnings.length > 0) {
      entry.startWarnings = {};
      for (const w of r.start.warnings) entry.startWarnings[w.kind] = (entry.startWarnings[w.kind] ?? 0) + 1;
    }
  }
  return entry;
}

function countBy<T>(items: readonly T[], key: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) counts[key(item)] = (counts[key(item)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]));
}

function main(): number {
  if (!existsSync(downloads)) {
    console.error('Missing referencias/descargas: run node referencias/descargar-escenarios.mjs first.');
    return 2;
  }
  const valkyrieCommit = readBaseDataManifest(dataDir).valkyrieCommit;
  const games = (args.game ?? ['MoM', 'D2E']) as GameName[];
  const extras = (args.extra ?? []).flatMap((folder) => filesWithExtension(folder, '.valkyrie'));
  const results: QuestResult[] = [];
  const environments: Record<string, { packs: string[]; setupWarnings: string[] }> = {};
  const started = performance.now();

  for (const game of games) {
    const packs = filesWithExtension(join(downloads, game, 'packs'), '.valkyrieContentPack');
    const env = createEnvironment(game, dataDir, packs);
    environments[game] = {
      packs: env.packIds,
      setupWarnings: [...env.setupLog.filter((m) => m.startsWith('Warning') || m.startsWith('Error')), ...Application.fatalErrors.map((e) => e.message)],
    };
    const scenarios = filesWithExtension(join(downloads, game, 'escenarios'), '.valkyrie').map((file) => ({ file, id: `${game}/${packageName(file)}` }));
    scenarios.push(...extras.map((file) => ({ file, id: `extra/${game}/${packageName(file)}` })));
    const selected = scenarios.filter((s) => !args.filter || s.id.toLowerCase().includes(args.filter.toLowerCase()));
    let done = 0;
    for (const { file, id } of selected) {
      const packageResults = runPackage(env, file, id);
      // An extra package whose main quest is for the other game is left to that game's run
      if (id.startsWith('extra/') && packageResults.some((r) => r.id === id && r.reason === 'wrong-type')) continue;
      results.push(...packageResults);
      if (++done % 25 === 0) console.log(`  ${game}: ${done}/${selected.length} packages`);
    }
    console.log(`${game}: ${selected.length} packages, ${results.filter((r) => r.id.startsWith(game) || r.id.startsWith(`extra/${game}`)).length} quests`);
  }
  results.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const baseline = existsSync(baselinePath) ? (JSON.parse(readFileSync(baselinePath, 'utf8')) as Baseline) : null;
  const comparison = compare(results, baseline);
  const summary = {
    seconds: Math.round((performance.now() - started) / 100) / 10,
    byStatus: Object.fromEntries(STATUSES.map((s) => [s, results.filter((r) => r.status === s).length])),
    warningsByKind: countBy(results.flatMap((r) => r.warnings), (w) => w.kind),
    fatalByReason: countBy(results.filter((r) => r.status === 'fatal'), (r) => r.reason ?? ''),
    invalidByReason: countBy(results.filter((r) => r.status === 'invalid'), (r) => r.reason ?? ''),
    subQuests: results.filter((r) => r.loadedAs === 'sub-quest').length,
    started: results.filter((r) => r.start !== undefined).length,
    startByStatus: Object.fromEntries(START_STATUSES.map((s) => [s, results.filter((r) => r.start?.status === s).length])),
    startWarningsByKind: countBy(results.flatMap((r) => r.start?.warnings ?? []), (w) => w.kind),
    startScreens: countBy(results.filter((r) => r.start?.screen !== undefined), (r) => r.start!.screen!.split(' ')[0]!),
    startChangedQuest: results.filter((r) => r.start?.changedTo !== undefined).length,
    startProblemsByReason: countBy(
      results.filter((r) => r.start !== undefined && r.start.status !== 'ok'),
      (r) => `${r.start!.status} ${r.start!.reason ?? ''}`,
    ),
  };

  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(
    reportPath,
    JSON.stringify({ date: new Date().toISOString(), valkyrieCommit, environments, summary, comparison, quests: results }, null, 1) + '\n',
  );

  console.log(`\nBattery v1, Valkyrie ${valkyrieCommit.slice(0, 7)}: ${results.length} quests in ${summary.seconds} s (${summary.subQuests} reached only by changing quest)`);
  console.log('  ' + STATUSES.map((s) => `${s} ${summary.byStatus[s]}`).join(', '));
  const line = (label: string, counts: Record<string, number>) => {
    if (Object.keys(counts).length > 0) console.log(`  ${label}: ` + Object.entries(counts).map(([k, n]) => `${k} ${n}`).join(', '));
  };
  line('Warnings by kind', summary.warningsByKind);
  line('Invalid by reason', summary.invalidByReason);
  line('Fatal by reason', summary.fatalByReason);
  for (const r of results.filter((r) => r.status === 'crash').slice(0, 5)) console.log(`  crash ${r.id}: ${r.detail}`);
  console.log(`\nBattery v2: ${summary.started} quests of the list started (${summary.startChangedQuest} changed quest on the way)`);
  console.log('  ' + START_STATUSES.map((s) => `${s} ${summary.startByStatus[s]}`).join(', '));
  line('Waiting on', summary.startScreens);
  line('Warnings by kind', summary.startWarningsByKind);
  line('Problems', summary.startProblemsByReason);
  for (const r of results.filter((r) => r.start?.status === 'crash').slice(0, 5)) console.log(`  crash ${r.id}: ${r.start!.detail}`);
  for (const [game, env] of Object.entries(environments)) {
    if (env.setupWarnings.length > 0) console.log(`  ${game} packs logged ${env.setupWarnings.length} warnings while loading`);
  }
  console.log(`  Report: ${reportPath}`);

  if (args['update-baseline']) {
    const quests: Record<string, BaselineEntry> = {};
    // Keep what this run did not cover (another game, a filter, a package missing here)
    for (const id of comparison.notRun) quests[id] = baseline!.quests[id]!;
    for (const r of results) quests[r.id] = toBaselineEntry(r);
    // One quest per line, so that a diff of the baseline shows exactly which quests changed
    const lines = Object.entries(quests)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([id, entry]) => `  ${JSON.stringify(id)}: ${JSON.stringify(entry)}`);
    writeFileSync(baselinePath, `{\n "valkyrieCommit": ${JSON.stringify(valkyrieCommit)},\n "quests": {\n${lines.join(',\n')}\n }\n}\n`);
    console.log(`\nBaseline saved: ${lines.length} quests.`);
    return 0;
  }
  if (baseline === null) {
    console.log('\nNo baseline yet: run with --update-baseline to save this one.');
    return 0;
  }
  console.log(
    `\nAgainst the baseline: ${comparison.worse.length} worse, ${comparison.better.length} better, ${comparison.added.length} new, ${comparison.notRun.length} not run here`,
  );
  for (const w of comparison.worse.slice(0, 20)) console.log(`  worse ${w}`);
  if (comparison.better.length > 0) console.log('  Better results: update the baseline in the same commit (--update-baseline).');
  return comparison.worse.length > 0 ? 1 : 0;
}

process.exitCode = main();
