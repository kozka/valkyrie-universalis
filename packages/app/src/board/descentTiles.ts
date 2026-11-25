// What the app knows of each Descent tile without the official import: the size of its picture and its squares
// (schematic-tiles-d2e.json, written by tools/build-schematic-tiles-d2e.mjs where a Descent import is; only sizes and
// squares, never the pictures). Not ported from Valkyrie.
import data from './schematic-tiles-d2e.json';

export interface DescentTile {
  /** The picture's size in pixels. */
  w: number;
  h: number;
  /** The grid of its tile side: the corner of the first space in the picture, and its pixels per square. */
  left: number;
  top: number;
  pps: number;
  /** The tile's squares, as rows of # (a square) and . (none), from square (x, y) of that grid. */
  x: number;
  y: number;
  rows: string[];
}

/** By the picture's file name in lower case, as tiles.ini names it in the import's img folder. */
const byName = new Map<string, DescentTile>();
for (const [picture, tile] of Object.entries(data.tiles)) byName.set(fileName(picture), tile);

function fileName(path: string): string {
  const file = path.substring(Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\')) + 1);
  const dot = file.lastIndexOf('.');
  return (dot > 0 ? file.substring(0, dot) : file).toLowerCase();
}

/** The Descent tile this picture of the import draws (any path or extension), if it is one. */
export function descentTile(picture: string): DescentTile | undefined {
  return byName.get(fileName(picture));
}
