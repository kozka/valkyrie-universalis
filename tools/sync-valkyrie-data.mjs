// Copies Valkyrie's base data from the pinned commit into packages/engine/data: the .ini and .txt files of
// StreamingAssets/content/MoM, content/D2E and text, byte for byte, and the text assets of unity/Assets/Resources that
// game rules load (Resources/, which the app mounts under StreamingAssets too). Images are not copied (some are FFG
// art); manifest.json lists them so the app can fetch them from the same commit on first use.
// Usage: node tools/sync-valkyrie-data.mjs   (needs referencias/valkyrie at the pinned commit: node referencias/clonar.mjs valkyrie)
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const clone = join(root, 'referencias', 'valkyrie');
const streamingAssets = join(clone, 'unity', 'Assets', 'StreamingAssets');
const target = join(root, 'packages', 'engine', 'data');
const sources = [join('content', 'MoM'), join('content', 'D2E'), 'text'];
const copied = new Set(['.ini', '.txt']);
// Resources.Load(name) as TextAsset in game rules: PuzzleSlide's puzzles
const textAssets = ['slidepuzzles.txt'];

// The pinned commit lives in referencias/clonar.mjs, next to the other reference repositories.
const clonar = readFileSync(join(root, 'referencias', 'clonar.mjs'), 'utf8');
const pinned = /dir: 'valkyrie', url: '[^']+', commit: '([0-9a-f]{40})'/.exec(clonar)?.[1];
if (!pinned) {
  console.error('Could not find the pinned Valkyrie commit in referencias/clonar.mjs.');
  process.exit(1);
}
if (!existsSync(join(clone, '.git'))) {
  console.error('Missing referencias/valkyrie: run node referencias/clonar.mjs valkyrie first.');
  process.exit(1);
}
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: clone }).toString().trim();
if (head !== pinned) {
  console.error(`referencias/valkyrie is at ${head.slice(0, 7)}, not at the pinned ${pinned.slice(0, 7)}: run node referencias/clonar.mjs valkyrie.`);
  process.exit(1);
}

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else if (!name.endsWith('.meta')) files.push(path);
  }
  return files;
}

const extension = (path) => (path.lastIndexOf('.') > path.lastIndexOf(sep) ? path.slice(path.lastIndexOf('.')).toLowerCase() : '');
const toPosix = (path) => path.split(sep).join('/');

/** Width and height of a PNG or JPEG, from its header, so stand-ins have the size Valkyrie reads. */
function pictureSize(data) {
  if (data.length >= 24 && data.readUInt32BE(0) === 0x89504e47) return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  if (data[0] === 0xff && data[1] === 0xd8) {
    for (let i = 2; i + 8 < data.length; ) {
      const marker = data[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { width: data.readUInt16BE(i + 7), height: data.readUInt16BE(i + 5) };
      }
      i += 2 + data.readUInt16BE(i + 2);
    }
  }
  return null;
}

for (const dir of ['content', 'text', 'Resources']) rmSync(join(target, dir), { recursive: true, force: true });

// Game.Awake reads Valkyrie's version from Resources/version.txt; saves record it
const version = readFileSync(join(clone, 'unity', 'Assets', 'Resources', 'version.txt'), 'utf8').trim().replaceAll('\r\n', ' ').replaceAll('\n', ' ');

const manifest = { valkyrieCommit: pinned, valkyrieVersion: version, files: [], images: [] };
for (const source of sources) {
  for (const file of walk(join(streamingAssets, source))) {
    const path = toPosix(relative(streamingAssets, file));
    const data = readFileSync(file);
    if (copied.has(extension(file))) {
      mkdirSync(dirname(join(target, path)), { recursive: true });
      copyFileSync(file, join(target, path));
      manifest.files.push({ path, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') });
    } else {
      const size = pictureSize(data);
      if (size === null) {
        console.error(`Unknown picture format: ${path}`);
        process.exit(1);
      }
      manifest.images.push({ path, bytes: data.length, ...size });
    }
  }
}

for (const name of textAssets) {
  const file = join(clone, 'unity', 'Assets', 'Resources', name);
  const path = `Resources/${name}`;
  const data = readFileSync(file);
  mkdirSync(join(target, 'Resources'), { recursive: true });
  copyFileSync(file, join(target, path));
  manifest.files.push({ path, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') });
}

writeFileSync(join(target, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
const total = (list) => (list.reduce((sum, f) => sum + f.bytes, 0) / 1e6).toFixed(2);
console.log(`Valkyrie ${pinned.slice(0, 7)}: copied ${manifest.files.length} files (${total(manifest.files)} MB) to packages/engine/data;`);
console.log(`${manifest.images.length} images (${total(manifest.images)} MB) are listed in manifest.json and fetched from that commit when used.`);
