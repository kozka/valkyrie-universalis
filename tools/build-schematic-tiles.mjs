// Builds the data the app needs to draw Mansions tiles in schematic mode (no official import): each tile picture's
// size, its edges with doors and openings, its spaces with their names, and the objects drawn on it.
// Source: ValkyrieMCP (MIT), as the mansiones-valkyrie skill keeps it in herramientas/mansiones-valkyrie/assets.
// Usage: node tools/build-schematic-tiles.mjs   (writes packages/app/src/board/schematic-tiles.json)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'herramientas', 'mansiones-valkyrie', 'assets');
const geometry = JSON.parse(readFileSync(join(assets, 'geometria_losetas.json'), 'utf8'));
const content = JSON.parse(readFileSync(join(assets, 'contenido_losetas.json'), 'utf8')).losetas;

const round = (n) => Math.round(n * 100) / 100;
const point = ([x, y]) => [round(x), round(y)];
const KIND = { door: 'd', open: 'o' };

const tiles = {};
for (const [side, g] of Object.entries(geometry)) {
  const c = content[side] ?? {};
  const edges = {};
  for (const name of ['N', 'E', 'S', 'W']) {
    edges[name] = (g[name] ?? []).map((s) => [round(s.frm), round(s.to), KIND[s.kind] ?? 'o']);
  }
  tiles[g.image] = {
    side,
    w: g.w,
    h: g.h,
    edges,
    spaces: (c.spaces ?? []).map((s) => ({
      outline: s.outline.map(point),
      anchor: point(s.anchor),
      en: s.label ?? '',
      es: s.label_es ?? s.label ?? '',
    })),
    features: (c.features ?? []).filter((f) => Array.isArray(f.box)).map((f) => ({ box: f.box.map(round), kind: f.kind })),
  };
}

const out = {
  source: 'ValkyrieMCP (https://github.com/thijs-hakkenberg/ValkyrieMCP), MIT licence, via herramientas/mansiones-valkyrie/assets',
  coordinates: 'Tile units (one space is 3.5), x east from the west edge and y south from the north edge of the unturned tile',
  tiles,
};
const target = join(root, 'packages', 'app', 'src', 'board', 'schematic-tiles.json');
writeFileSync(target, JSON.stringify(out) + '\n');
console.log(`${Object.keys(tiles).length} tiles written to packages/app/src/board/schematic-tiles.json`);
