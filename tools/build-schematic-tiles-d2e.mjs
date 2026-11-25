// Builds the data the app needs to draw Descent tiles in schematic mode (the tests' mode, without the official import):
// the size of each tile picture of a Descent import, and the squares of the tile, where the picture is opaque at the
// square's centre, on the grid its TileSide gives (first space at left, top; pps pixels per square). Run it where a
// Descent import is: the pictures never leave that computer, only these sizes and squares.
// Usage: node tools/build-schematic-tiles-d2e.mjs <import folder, or a zip of it> [output]
//   (writes packages/app/src/board/schematic-tiles-d2e.json by default)
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unzipSync } from 'fflate';
import { decodeDds } from '../packages/app/src/host/dds.ts';
import { decodePvr } from '../packages/app/src/host/pvr.ts';
import { IniRead } from '../packages/engine/src/ValkyrieTools/IniRead.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [source, output = join(root, 'packages', 'app', 'src', 'board', 'schematic-tiles-d2e.json')] = process.argv.slice(2);
if (source === undefined) {
  console.error('Usage: node tools/build-schematic-tiles-d2e.mjs <import folder, or a zip of it> [output]');
  process.exit(1);
}

/** D2EGameType.TilePixelPerSquare */
const PPS = 105;
const IMPORT = '{import}/';

/** The tile sides of Valkyrie's Descent data whose picture comes from the import, by picture (lower case). */
const pictures = new Map();
function readSides(folder) {
  for (const name of readdirSync(folder)) {
    const path = join(folder, name);
    if (statSync(path).isDirectory()) readSides(path);
    else if (name === 'tiles.ini') {
      const ini = IniRead.readFromString(readFileSync(path, 'utf8'));
      for (const [section, values] of ini.data) {
        const image = values.get('image') ?? '';
        if (!section.startsWith('TileSide') || !image.startsWith(IMPORT)) continue;
        const pps = values.get('pps');
        const grid = {
          left: Number(values.get('left') ?? 0),
          top: Number(values.get('top') ?? 0),
          pps: pps === undefined ? PPS : pps.startsWith('*') ? Number(pps.substring(1)) * PPS : Number(pps),
        };
        const key = image.substring(IMPORT.length).toLowerCase();
        const known = pictures.get(key);
        if (known === undefined) pictures.set(key, { image: image.substring(IMPORT.length), grid, sides: [section] });
        else if (known.grid.left !== grid.left || known.grid.top !== grid.top || known.grid.pps !== grid.pps) {
          console.warn(`${section} draws ${image} on another grid than ${known.sides[0]}; kept the first`);
        } else if (!known.sides.includes(section)) known.sides.push(section);
      }
    }
  }
}
readSides(join(root, 'packages', 'engine', 'data', 'content', 'D2E'));

/** The import's files, by their path below the folder that holds import.ini, in lower case: a reader for each. */
function importFiles() {
  const files = new Map();
  const add = (path, read) => {
    if (!/(^|\/)__MACOSX\//.test(path) && !/(^|\/)\._[^/]*$/.test(path)) files.set(path.replace(/\\/g, '/'), read);
  };
  if (statSync(source).isDirectory()) {
    const walk = (folder, prefix) => {
      for (const name of readdirSync(folder)) {
        const path = join(folder, name);
        if (statSync(path).isDirectory()) walk(path, `${prefix}${name}/`);
        else add(`${prefix}${name}`, () => readFileSync(path));
      }
    };
    walk(source, '');
  } else {
    const zip = readFileSync(source);
    const names = [];
    unzipSync(zip, { filter: (file) => (names.push(file.name), false) });
    const wanted = new Set(names.filter((name) => /\.(pvr|dds)$/i.test(name) || /(^|\/)import\.ini$/i.test(name)));
    const entries = unzipSync(zip, { filter: (file) => wanted.has(file.name) });
    for (const [name, bytes] of Object.entries(entries)) add(name, () => bytes);
  }
  const ini = [...files.keys()].filter((path) => /(^|\/)import\.ini$/i.test(path)).sort((a, b) => a.length - b.length)[0];
  if (ini === undefined) throw new Error(`No import.ini in ${source}`);
  const base = ini.substring(0, ini.length - 'import.ini'.length);
  const below = new Map();
  for (const [path, read] of files) if (path.startsWith(base)) below.set(path.substring(base.length).toLowerCase(), read);
  return below;
}

/** The picture's squares: those whose centre is opaque, as rows of # and . from the square (x, y) of the grid. */
function squares(pixels, { left, top, pps }) {
  const { width, height, data } = pixels;
  const reach = Math.max(1, Math.floor(pps / 6));
  const opaque = (cx, cy) => {
    let sum = 0;
    let count = 0;
    for (let y = Math.round(cy) - reach; y <= Math.round(cy) + reach; y++) {
      for (let x = Math.round(cx) - reach; x <= Math.round(cx) + reach; x++) {
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        sum += data[(y * width + x) * 4 + 3];
        count++;
      }
    }
    return count > 0 && sum / count >= 128;
  };
  const covered = [];
  for (let j = Math.ceil(-top / pps - 0.5); top + pps * (j + 0.5) < height; j++) {
    for (let i = Math.ceil(-left / pps - 0.5); left + pps * (i + 0.5) < width; i++) {
      if (opaque(left + pps * (i + 0.5), top + pps * (j + 0.5))) covered.push([i, j]);
    }
  }
  if (covered.length === 0) return { x: 0, y: 0, rows: [] };
  const x = Math.min(...covered.map(([i]) => i));
  const y = Math.min(...covered.map(([, j]) => j));
  const across = Math.max(...covered.map(([i]) => i)) - x + 1;
  const rows = Array.from({ length: Math.max(...covered.map(([, j]) => j)) - y + 1 }, () => Array(across).fill('.'));
  for (const [i, j] of covered) rows[j - y][i - x] = '#';
  return { x, y, rows: rows.map((row) => row.join('')) };
}

const files = importFiles();
const version = /^FFG=(.*)$/m.exec(new TextDecoder().decode(files.get('import.ini')?.() ?? new Uint8Array()))?.[1]?.trim() ?? '?';
const tiles = {};
let missing = 0;
for (const [key, { image, grid, sides }] of [...pictures].sort(([a], [b]) => a.localeCompare(b))) {
  const pvr = files.get(`${key}.pvr`);
  const dds = files.get(`${key}.dds`);
  const pixels = pvr !== undefined ? decodePvr(pvr()) : dds !== undefined ? decodeDds(dds()) : null;
  if (pixels === null) {
    console.warn(`Not in the import, or unreadable: ${image} (${sides.join(', ')})`);
    missing++;
    continue;
  }
  tiles[image] = { w: pixels.width, h: pixels.height, ...grid, ...squares(pixels, grid) };
}
writeFileSync(output, JSON.stringify({ import: `Road to Legend ${version}`, tiles }) + '\n');
console.log(`${Object.keys(tiles).length} tile pictures written to ${output}; ${missing} missing`);
