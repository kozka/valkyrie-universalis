// The editor's analysis against real games: for each scenario of a folder (its .ini and .txt files, one folder each)
// and the store's figures in stats.tsv (name, games, mean minutes, share won, declared minimum and maximum), it plays
// the analysis and prints both. Not part of the usual run: CALIB=<folder> npx vitest run analysis-calibration.
// Not ported from Valkyrie.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { it } from 'vitest';
import { QuestData } from '@universalis/engine';
import { createEnvironment } from '../../../tools/battery/environment.ts';
import { analyze } from '../src/editor/analysis/analyze.ts';

const folder = process.env.CALIB ?? '';
const only = process.env.CALIB_ONLY?.split(',') ?? null;
const runs = Number(process.env.CALIB_RUNS ?? 20);

function walk(d: string): string[] {
  return readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
}

it.skipIf(folder.length === 0)("compares the analysis with the store's figures", { timeout: 3_600_000 }, async () => {
  const env = createEnvironment('MoM', join(process.cwd(), 'packages/engine/data'), []);
  const rows: Record<string, unknown>[] = [];
  for (const line of readFileSync(join(folder, 'stats.tsv'), 'utf8').split('\n')) {
    const [name, games, duration, won] = line.split('\t');
    if (name === undefined || (only !== null && !only.includes(name))) continue;
    const dir = join(folder, name);
    if (!existsSync(join(dir, 'quest.ini'))) continue;
    const at = `/Editor/${name}`;
    for (const f of walk(dir)) env.vfs.writeFile(`${at}/${relative(dir, f).replace(/\\/g, '/')}`, () => readFileSync(f), statSync(f).size);
    const started = Date.now();
    try {
      const qd = new QuestData(`${at}/quest.ini`);
      const a = await analyze(qd, { profile: 'normal', runs });
      const all = a.figures.reduce((s, f) => s + f.runs, 0);
      const count = (k: 'end' | 'eliminated' | 'stuck' | 'rounds' | 'quest-change') => a.figures.reduce((s, f) => s + f.endings[k], 0) / Math.max(1, all);
      const minutes = a.figures.map((f) => f.minutes.median).sort((x, y) => x - y);
      const row = {
        name,
        games: Number(games),
        realMinutes: Math.round(Number(duration)),
        simMinutes: Math.round(minutes[Math.floor(minutes.length / 2)] ?? 0),
        estimate: Math.round(a.figures.map((f) => f.estimate.likely).sort((x, y) => x - y)[Math.floor(a.figures.length / 2)] ?? 0),
        realWon: Number(Number(won).toFixed(2)),
        simEnd: Number(count('end').toFixed(2)),
        simEliminated: Number(count('eliminated').toFixed(2)),
        simStuck: Number(count('stuck').toFixed(2)),
        simRounds: Number(count('rounds').toFixed(2)),
        simChange: Number(count('quest-change').toFixed(2)),
        endings: a.figures
          .flatMap((f) => f.endEvents.map((e) => e.name))
          .filter((n, i, l) => l.indexOf(n) === i)
          .slice(0, 4)
          .join(' '),
        blocked: a.blocked
          .slice(0, 2)
          .map((b) => `${b.event}<-${b.from ?? 'trigger'} ${b.needs.join('&')}`)
          .join(' | '),
        rounds: Number((a.figures.reduce((s, f) => s + f.meanRounds, 0) / a.figures.length).toFixed(1)),
        spent: Object.fromEntries(Object.keys(a.figures[0]!.spent).map((k) => [k, Math.round(a.figures.reduce((s, f) => s + f.spent[k as keyof typeof f.spent], 0) / a.figures.length)])),
        seconds: Math.round((Date.now() - started) / 1000),
      };
      rows.push(row);
      console.log(JSON.stringify(row));
    } catch (e) {
      console.log(JSON.stringify({ name, error: String(e).slice(0, 200) }));
    }
  }
  writeFileSync(join(folder, 'calibration.json'), JSON.stringify(rows, null, 1));
});
