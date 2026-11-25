// What the app knows of each Mansions tile without the official import: its size, edges, spaces and furniture
// (schematic-tiles.json, written by tools/build-schematic-tiles.mjs from ValkyrieMCP's data, MIT). Not ported from Valkyrie.
import data from './schematic-tiles.json';

/** A stretch of a tile edge, from and to in tile units, that is a door ('d') or open ('o'). */
export type EdgeGap = [number, number, 'd' | 'o'];

export interface SchematicTile {
  side: string;
  /** Size in board units (one space is 3.5). */
  w: number;
  h: number;
  edges: Record<'N' | 'E' | 'S' | 'W', EdgeGap[]>;
  spaces: { outline: [number, number][]; anchor: [number, number]; en: string; es: string }[];
  features: { box: [number, number, number, number]; kind: string }[];
}

/** MoMGameType.TilePixelPerSquare: the pixels of one board unit in the official tile pictures. */
export const TILE_PIXELS_PER_UNIT = Math.fround(1024 / 3.5);

const byName = new Map<string, SchematicTile>();
for (const [image, tile] of Object.entries(data.tiles)) byName.set(image.toLowerCase(), tile as SchematicTile);

/** The tile drawn by this picture (any path or extension), by its file name as tiles.ini gives it. */
export function schematicTile(picture: string): SchematicTile | undefined {
  const file = picture.substring(Math.max(picture.lastIndexOf('/'), picture.lastIndexOf('\\')) + 1);
  const dot = file.lastIndexOf('.');
  return byName.get((dot > 0 ? file.substring(0, dot) : file).toLowerCase());
}

/** The size in pixels of the official picture of this tile, or null for pictures that are not tiles. */
export function tilePictureSize(picture: string): { width: number; height: number } | null {
  const tile = schematicTile(picture);
  if (tile === undefined) return null;
  return { width: Math.round(tile.w * TILE_PIXELS_PER_UNIT), height: Math.round(tile.h * TILE_PIXELS_PER_UNIT) };
}
