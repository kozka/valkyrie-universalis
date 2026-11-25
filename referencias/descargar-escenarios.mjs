// Downloads every scenario and content pack listed in valkyrie-store, as Valkyrie does, into referencias/descargas/.
// Like Valkyrie, it remembers the `version` listed at download time and skips files whose listed version is unchanged.
// Needs referencias/valkyrie-store (run clonar.mjs first).
// Usage: node referencias/descargar-escenarios.mjs [MoM|D2E|todo] [escenarios|packs|todo]   (about 3.3 GB for everything)
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const store = join(here, 'valkyrie-store');
const PARALLEL = 6;
const TIMEOUT_MS = 15 * 60_000;
const BOM = String.fromCharCode(0xfeff);

const [gameArg = 'todo', kindArg = 'todo', ...extra] = process.argv.slice(2);
if (!['MoM', 'D2E', 'todo'].includes(gameArg) || !['escenarios', 'packs', 'todo'].includes(kindArg) || extra.length) {
  console.error('Usage: node referencias/descargar-escenarios.mjs [MoM|D2E|todo] [escenarios|packs|todo]');
  process.exit(2);
}
const games = gameArg === 'todo' ? ['MoM', 'D2E'] : [gameArg];
const kinds = kindArg === 'todo' ? ['escenarios', 'packs'] : [kindArg];

if (!existsSync(store)) {
  console.error('Missing referencias/valkyrie-store: run node referencias/clonar.mjs first.');
  process.exit(1);
}

// Same rules as Valkyrie's IniRead for these lists: first section and first key win.
function readIni(path) {
  const sections = Object.create(null);
  let current = null;
  let text = readFileSync(path, 'utf8');
  if (text.startsWith(BOM)) text = text.slice(1);
  for (const raw of text.split(/\r\n|\n|\r/)) {
    const line = raw.trim();
    if (!line || line[0] === '#' || line[0] === ';') continue;
    if (line[0] === '[') {
      const name = line.replace(/^\[+|\]+$/g, '');
      current = Object.hasOwn(sections, name) ? null : (sections[name] = Object.create(null));
      continue;
    }
    const eq = raw.indexOf('=');
    const key = (eq < 0 ? raw : raw.slice(0, eq)).trim();
    if (current && !Object.hasOwn(current, key)) current[key] = eq < 0 ? '' : raw.slice(eq + 1).trim().replace(/^"+|"+$/g, '');
  }
  return sections;
}

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const listedHash = (version) => (version ?? '').replace(/-/g, '').toLowerCase();

const jobs = [];
for (const game of games) {
  if (kinds.includes('escenarios')) {
    for (const [name, entry] of Object.entries(readIni(join(store, game, 'manifestDownload.ini')))) {
      if (entry.url) jobs.push({ game, kind: 'scenario', name, url: `${entry.url}${name}.valkyrie`, version: entry.version ?? '', file: join(here, 'descargas', game, 'escenarios', `${name}.valkyrie`) });
    }
  }
  if (kinds.includes('packs')) {
    for (const [id, entry] of Object.entries(readIni(join(store, game, 'contentPacksManifestDownload.ini')))) {
      if (entry.url) jobs.push({ game, kind: 'pack', name: id, url: `${entry.url}${id}.valkyrieContentPack`, version: entry.version ?? '', file: join(here, 'descargas', game, 'packs', `${id}.valkyrieContentPack`) });
    }
  }
}

const result = { downloaded: [], upToDate: [], failed: [], hashMismatch: [] };

function noteHash(job, hash) {
  if (job.kind === 'scenario' && hash !== listedHash(job.version)) result.hashMismatch.push(`${job.game}/${job.name}`);
}

async function run(job) {
  const stamp = `${job.file}.version`;
  const hashFile = `${job.file}.sha256`;
  if (existsSync(job.file) && existsSync(stamp) && readFileSync(stamp, 'utf8') === job.version) {
    result.upToDate.push(`${job.game}/${job.name}`);
    noteHash(job, existsSync(hashFile) ? readFileSync(hashFile, 'utf8') : sha256(readFileSync(job.file)));
    return;
  }
  try {
    const response = await fetch(job.url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = Buffer.from(await response.arrayBuffer());
    const hash = sha256(data);
    mkdirSync(dirname(job.file), { recursive: true });
    writeFileSync(job.file, data);
    writeFileSync(hashFile, hash);
    writeFileSync(stamp, job.version);
    result.downloaded.push(`${job.game}/${job.name}`);
    noteHash(job, hash);
  } catch (error) {
    const cause = error.cause?.code ?? error.cause?.message;
    result.failed.push(`${job.game}/${job.name}: ${error.message}${cause ? ` (${cause})` : ''}`);
  }
}

const queue = [...jobs];
await Promise.all(Array.from({ length: PARALLEL }, async () => {
  while (queue.length) await run(queue.shift());
}));

mkdirSync(join(here, 'descargas'), { recursive: true });
const report = join(here, 'descargas', `informe-${gameArg}-${kindArg}.json`);
writeFileSync(report, JSON.stringify({ date: new Date().toISOString(), games, kinds, ...result }, null, 2) + '\n');
console.log(`${jobs.length} files: ${result.downloaded.length} downloaded, ${result.upToDate.length} up to date, ${result.failed.length} failed, ${result.hashMismatch.length} with a SHA-256 different from the list.`);
for (const line of result.failed) console.log(`  failed ${line}`);
console.log(`Report: ${report}`);
process.exitCode = result.failed.length ? 1 : 0;
