// Builds the folder the editor's analysis is calibrated with (packages/app/tests/analysis-calibration.test.ts): for every
// Mansions scenario of the store list with at least --games games (40 by default) whose package is in
// referencias/descargas, its .ini and .txt files, and stats.tsv with the list's figures (name, games, mean minutes, share
// won, declared minimum and maximum). Reads only what exists; writes only into the folder given.
// Usage: node tools/analysis-calibration-data.mjs <folder> [--games 40]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unzipSync } from 'fflate';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2];
if (out === undefined) {
  console.error('Usage: node tools/analysis-calibration-data.mjs <folder> [--games 40]');
  process.exit(1);
}
const at = process.argv.indexOf('--games');
const least = at > 0 ? Number(process.argv[at + 1]) : 40;

const list = readFileSync(join(root, 'referencias', 'valkyrie-store', 'MoM', 'manifestDownload.ini'), 'utf8');
const rows = [];
let section = null;
let keys = {};
const flush = () => {
  if (section !== null && Number(keys.play_count ?? 0) >= least) rows.push([section, keys.play_count, keys.duration, keys.win_ratio, keys.lengthmin, keys.lengthmax]);
};
for (const line of list.split(/\r?\n/)) {
  const head = /^\[(.+)\]$/.exec(line);
  if (head !== null) {
    flush();
    section = head[1];
    keys = {};
    continue;
  }
  const eq = line.indexOf('=');
  if (eq > 0 && !(line.slice(0, eq) in keys)) keys[line.slice(0, eq)] = line.slice(eq + 1);
}
flush();

mkdirSync(out, { recursive: true });
let found = 0;
for (const [name] of rows) {
  const pkg = join(root, 'referencias', 'descargas', 'MoM', 'escenarios', `${name}.valkyrie`);
  if (!existsSync(pkg)) continue;
  found++;
  const files = unzipSync(readFileSync(pkg), { filter: (f) => /\.(ini|txt)$/i.test(f.name) });
  for (const [path, data] of Object.entries(files)) {
    const target = join(out, name, ...path.split('/'));
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, data);
  }
}
writeFileSync(join(out, 'stats.tsv'), rows.map((r) => r.join('\t')).join('\n'));
console.log(`${rows.length} scenarios with ${least} games or more; ${found} packages found and written to ${out}`);
