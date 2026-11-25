// Not ported from Valkyrie (7 November 2026): the spaces of a Mansions scenario's map, for the editor's analysis
// (simulate.ts). Each tile's spaces come from what the app knows of the official tiles (board/schematicTiles.ts, from
// ValkyrieMCP), placed as Quest.Tile places the tile's picture (its anchor square, rotation and place); two spaces are
// neighbours when a stretch of their outlines lies together, which on a tile's edge needs an opening (a door or open
// side). A tile the app does not know (a custom picture) is one space of its size. Pure: no DOM, testable in Node.
import { Game, QuestData, TileSideData } from '@universalis/engine';
import { schematicTile, TILE_PIXELS_PER_UNIT, type EdgeGap } from '../../board/schematicTiles.ts';

export interface Space {
  id: number;
  /** The tile component it belongs to. */
  tile: string;
  /** Its outline on the board, in board units, y up. */
  outline: [number, number][];
  centre: [number, number];
}

export interface MapModel {
  spaces: Space[];
  /** Neighbours of each space, by id. */
  near: number[][];
  /** The spaces of each tile component. */
  byTile: Map<string, number[]>;
}

/** How long a stretch of two outlines must lie together, in board units, for a person to pass. */
const PASSAGE = 0.7;
/** How close two outlines must be to count as touching. */
const TOUCH = 0.3;
/** One space is this many board units across (MoM: a square tile of 2×2 spaces is 7). */
export const SPACE_UNITS = 3.5;

type Point = [number, number];

/** The tile side of a tile component, as Quest.Tile looks it up. */
function tileSide(tile: QuestData.Tile): TileSideData | undefined {
  const cd = Game.get().cd;
  return cd.tryGet(TileSideData, tile.tileSideName) ?? cd.tryGet(TileSideData, 'TileSide' + tile.tileSideName);
}

/** Where a point of a tile (tile units, x east from the west edge, y south from the north edge) lies on the board. */
function placer(tile: QuestData.Tile, side: TileSideData, w: number, h: number): (x: number, y: number) => Point {
  // Valkyrie: Quest.cs Tile.Tile (the picture's size, its anchor square and its rotation about the tile's place)
  const pps = side.pxPerSquare > 0 ? side.pxPerSquare : TILE_PIXELS_PER_UNIT;
  const texW = Math.round(w * TILE_PIXELS_PER_UNIT);
  const texH = Math.round(h * TILE_PIXELS_PER_UNIT);
  let cx = (Math.trunc(texW / 2) - side.left) / pps;
  let cy = -(Math.trunc(texH / 2) - side.top) / pps;
  if (Game.get().gameType.tileOnGrid()) {
    cx -= 0.5;
    cy += 0.5;
  }
  const pw = texW / pps;
  const ph = texH / pps;
  const r = (tile.rotation * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  return (x, y) => {
    const ox = cx + (x / w) * pw - pw / 2;
    const oy = cy - ((y / h) * ph - ph / 2);
    return [ox * cos - oy * sin + tile.location.x, ox * sin + oy * cos + tile.location.y];
  };
}

function centreOf(points: Point[]): Point {
  const x = points.reduce((s, p) => s + p[0], 0) / points.length;
  const y = points.reduce((s, p) => s + p[1], 0) / points.length;
  return [x, y];
}

/** Points every quarter unit along an outline, each with whether it lies on an opening of its tile's edge. */
function samples(outline: Point[], open: (p: Point) => boolean): { at: Point; open: boolean }[] {
  const out: { at: Point; open: boolean }[] = [];
  for (let i = 0; i < outline.length; i++) {
    const a = outline[i]!;
    const b = outline[(i + 1) % outline.length]!;
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const steps = Math.max(1, Math.round(length / 0.25));
    for (let s = 0; s < steps; s++) {
      const at: Point = [a[0] + ((b[0] - a[0]) * s) / steps, a[1] + ((b[1] - a[1]) * s) / steps];
      out.push({ at, open: open(at) });
    }
  }
  return out;
}

function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

function distanceToOutline(p: Point, outline: Point[]): number {
  let best = Infinity;
  for (let i = 0; i < outline.length; i++) best = Math.min(best, distanceToSegment(p, outline[i]!, outline[(i + 1) % outline.length]!));
  return best;
}

export function inside(p: Point, outline: Point[]): boolean {
  let hit = false;
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const [xi, yi] = outline[i]!;
    const [xj, yj] = outline[j]!;
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** Whether a tile point lies on an opening of the tile's edge (a door or an open side), or inside the tile. */
function onOpening(x: number, y: number, w: number, h: number, edges: Record<'N' | 'E' | 'S' | 'W', EdgeGap[]>): boolean {
  const near = 0.05;
  const within = (gaps: EdgeGap[], t: number) => gaps.some(([from, to]) => t >= from - 0.1 && t <= to + 0.1);
  if (Math.abs(y) < near) return within(edges.N, x);
  if (Math.abs(y - h) < near) return within(edges.S, x);
  if (Math.abs(x) < near) return within(edges.W, y);
  if (Math.abs(x - w) < near) return within(edges.E, y);
  // Inside the tile: between two of its own spaces
  return true;
}

/** The spaces of every tile of the quest, wherever it lies; which are walked depends on which tiles are down. */
export function buildMap(qd: QuestData): MapModel {
  const spaces: Space[] = [];
  const sampled: { at: Point; open: boolean }[][] = [];
  const byTile = new Map<string, number[]>();
  for (const component of qd.components.values()) {
    if (!(component instanceof QuestData.Tile)) continue;
    const ids: number[] = [];
    const side = component.customImage.length > 0 ? undefined : tileSide(component);
    const known = side !== undefined ? schematicTile(side.image) : undefined;
    if (side !== undefined && known !== undefined) {
      const place = placer(component, side, known.w, known.h);
      for (const s of known.spaces) {
        const outline = s.outline.map(([x, y]) => place(x, y));
        const id = spaces.length;
        spaces.push({ id, tile: component.sectionName, outline, centre: place(s.anchor[0], s.anchor[1]) });
        // Points every quarter unit along the outline, each knowing whether it lies on an opening of the tile's edge
        const along: { at: Point; open: boolean }[] = [];
        for (let i = 0; i < s.outline.length; i++) {
          const a = s.outline[i]!;
          const b = s.outline[(i + 1) % s.outline.length]!;
          const steps = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.25));
          for (let k = 0; k < steps; k++) {
            const tx = a[0] + ((b[0] - a[0]) * k) / steps;
            const ty = a[1] + ((b[1] - a[1]) * k) / steps;
            along.push({ at: place(tx, ty), open: onOpening(tx, ty, known.w, known.h, known.edges) });
          }
        }
        sampled.push(along);
        ids.push(id);
      }
    } else {
      // A tile the app does not know: one square space of a tile's usual size, round its place
      const c: Point = [component.location.x, component.location.y];
      const half = SPACE_UNITS;
      const outline: Point[] = [
        [c[0] - half, c[1] - half],
        [c[0] + half, c[1] - half],
        [c[0] + half, c[1] + half],
        [c[0] - half, c[1] + half],
      ];
      const id = spaces.length;
      spaces.push({ id, tile: component.sectionName, outline, centre: c });
      sampled.push(samples(outline, () => true));
      ids.push(id);
    }
    byTile.set(component.sectionName, ids);
  }
  const near: number[][] = spaces.map(() => []);
  for (let a = 0; a < spaces.length; a++) {
    for (let b = a + 1; b < spaces.length; b++) {
      const sa = spaces[a]!;
      const sb = spaces[b]!;
      if (Math.hypot(sa.centre[0] - sb.centre[0], sa.centre[1] - sb.centre[1]) > 4 * SPACE_UNITS) continue;
      const same = sa.tile === sb.tile;
      let together = 0;
      for (const s of sampled[a]!) {
        if (!same && !s.open) continue;
        if (distanceToOutline(s.at, sb.outline) < TOUCH) together += 0.25;
      }
      if (together >= PASSAGE) {
        near[a]!.push(b);
        near[b]!.push(a);
      }
    }
  }
  return { spaces, near, byTile };
}

/** The space of the given ones where a point lies, or the nearest of them. */
export function spaceAt(map: MapModel, p: Point, among: Iterable<number>): number | null {
  let best: number | null = null;
  let bestDistance = Infinity;
  for (const id of among) {
    const s = map.spaces[id]!;
    if (inside(p, s.outline)) return id;
    const d = Math.hypot(s.centre[0] - p[0], s.centre[1] - p[1]);
    if (d < bestDistance) {
      bestDistance = d;
      best = id;
    }
  }
  return best;
}

/** Steps between spaces, walking only the open ones (breadth first); Infinity when one cannot reach the other. */
export function distances(map: MapModel, from: number, open: Set<number>): Map<number, number> {
  const seen = new Map<number, number>([[from, 0]]);
  const queue = [from];
  while (queue.length > 0) {
    const at = queue.shift()!;
    const d = seen.get(at)!;
    for (const next of map.near[at]!) {
      if (!open.has(next) || seen.has(next)) continue;
      seen.set(next, d + 1);
      queue.push(next);
    }
  }
  return seen;
}
