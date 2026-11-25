// The board without the official pictures (schematic mode): each piece drawn from what the app knows of it, in board
// units and centred on its position, as Unity centres an Image. Mansions tiles show their walls, doorways, spaces with
// their names and furniture (schematicTiles.ts), and Descent tiles their squares (descentTiles.ts); tokens, monsters
// and items show their name. White parts take the tint of the piece (a door's colour, a red highlight). Not ported
// from Valkyrie, which always has the pictures.
import { Container, Graphics, Text } from 'pixi.js';
import type { DescentTile } from './descentTiles.ts';
import type { Piece } from './pieces.ts';
import type { SchematicTile } from './schematicTiles.ts';

/** The roles of the theme (theme.css) the schematic is drawn with, read when the board starts. */
export interface SchematicLook {
  font: string;
  ink: string;
  inkSoft: string;
  paper: string;
  paperShade: string;
  trim: string;
  panel: string;
  alert: string;
  floorInside: string;
  floorOutside: string;
}

/** The schematic's look in the page's theme, which follows the game being played. */
export function schematicLook(theme: CSSStyleDeclaration): SchematicLook {
  const role = (name: string) => theme.getPropertyValue(`--${name}`).trim();
  return {
    font: role('font'),
    ink: role('plan-ink'),
    inkSoft: role('plan-ink-soft'),
    paper: role('plan-paper'),
    paperShade: role('plan-paper-shade'),
    trim: role('trim'),
    panel: role('panel'),
    alert: role('alert'),
    floorInside: role('floor-inside'),
    floorOutside: role('floor-outside'),
  };
}

/** Labels are drawn this big and scaled down to board units, so they stay sharp when the camera comes close. */
const LABEL_PIXELS = 64;
/** Drawing units in a board unit: curves are drawn smooth for their size in drawing units, not for the zoom. */
const S = 100;

/** Furniture colours by kind, as a map's legend; anything else is plain. */
const FEATURE_COLOURS: [RegExp, number][] = [
  [/water|well|fountain|bathtub|sink|toilet|dock|boat/, 0x8fb3bf],
  [/tree|bush|plant/, 0x8fae7f],
  [/stairs|ladder|trapdoor|hole/, 0x9c8f7a],
  [/rug|ritual|altar/, 0xb98f7f],
];

function featureColour(kind: string): number {
  for (const [pattern, colour] of FEATURE_COLOURS) {
    if (pattern.test(kind)) return colour;
  }
  return 0xbfb197;
}

/**
 * The schematic of a piece of this size (sizeDelta), centred on 0,0. `rotation` is the piece's, in degrees: labels
 * turn back by it so they can be read.
 */
export function drawSchematic(piece: Piece, width: number, height: number, rotation: number, spanish: boolean, look: SchematicLook): Container {
  const drawing = draw(piece, width * S, height * S, rotation, spanish, look);
  drawing.scale.set(drawing.scale.x / S, drawing.scale.y / S);
  return new Container({ children: [drawing] });
}

function draw(piece: Piece, w: number, h: number, rotation: number, spanish: boolean, look: SchematicLook): Container {
  switch (piece.kind) {
    case 'tile':
      return piece.tile !== undefined ? drawTile(piece.tile, piece.outside, w, h, rotation, spanish, look) : drawPlain(piece.label, w, h, rotation, look);
    case 'squares':
      return drawSquares(piece.tile, piece.outside, piece.label, w, h, rotation, look);
    case 'token':
      return drawDisc(piece.label, w, h, rotation, look.panel, look.trim, look.paper, look.font);
    case 'door':
      return drawDoor(w, h);
    case 'target':
      return drawTarget(w, h, look.ink);
    case 'frame':
      return drawFrame(w, h, piece.oval, look);
    case 'pill':
      return new Container({ children: [new Graphics().roundRect(-w / 2, -h / 2, w, h, Math.min(w, h) / 2).fill(0xffffff)] });
    case 'monster':
      return drawCard(piece.label, w, h, rotation, look.alert, look.ink, look.paper, look.font);
    case 'item':
      return drawCard(piece.label, w, h, rotation, look.paperShade, look.trim, look.ink, look.font);
    case 'picture':
      return drawCard(piece.label, w, h, rotation, look.panel, look.trim, look.paper, look.font);
  }
}

/** A label that fits in this box, upright whatever the piece's rotation. */
function label(text: string, maxWidth: number, maxHeight: number, colour: string, rotation: number, font: string): Text {
  const t = new Text({
    text,
    anchor: 0.5,
    resolution: 2,
    style: { fontFamily: font, fontSize: LABEL_PIXELS, fontWeight: '500', fill: colour, align: 'center' },
  });
  t.scale.set(Math.min(maxHeight / LABEL_PIXELS, maxWidth / Math.max(t.width, 1)));
  t.rotation = (rotation * Math.PI) / 180;
  return t;
}

function capitalise(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.substring(1);
}

function drawTile(tile: SchematicTile, outside: boolean, width: number, height: number, rotation: number, spanish: boolean, look: SchematicLook): Container {
  const floor = outside ? look.floorOutside : look.floorInside;
  const g = new Graphics();
  g.rect(0, 0, tile.w * S, tile.h * S).fill(floor);
  for (const space of tile.spaces) {
    g.poly(space.outline.flatMap(([x, y]) => [x * S, y * S])).stroke({ width: 3, color: look.inkSoft, alpha: 0.5 });
  }
  for (const feature of tile.features) {
    const [x1, y1, x2, y2] = feature.box.map((v) => v * S) as [number, number, number, number];
    g.roundRect(x1, y1, x2 - x1, y2 - y1, Math.min(8, (x2 - x1) / 3, (y2 - y1) / 3))
      .fill({ color: featureColour(feature.kind), alpha: 0.55 })
      .stroke({ width: 1.5, color: look.inkSoft, alpha: 0.45 });
  }
  drawWalls(g, tile, look);
  const tileContent = new Container();
  tileContent.addChild(g);
  for (const space of tile.spaces) {
    const text = spanish ? space.es : space.en;
    if (text.length === 0) continue;
    const xs = space.outline.map((p) => p[0]);
    const t = label(capitalise(text), (Math.max(...xs) - Math.min(...xs)) * S * 0.85, 34, look.inkSoft, rotation, look.font);
    t.position.set(space.anchor[0] * S, space.anchor[1] * S);
    tileContent.addChild(t);
  }
  // Tile units have their origin at the top left corner; the piece is centred and as big as Valkyrie sizes it
  tileContent.position.set((-tile.w * S) / 2, (-tile.h * S) / 2);
  const piece = new Container({ children: [tileContent] });
  piece.scale.set(width / (tile.w * S), height / (tile.h * S));
  return piece;
}

/** Walls along the tile's edges, except at its doorways (with a brass threshold) and open sides. */
function drawWalls(g: Graphics, tile: SchematicTile, look: SchematicLook): void {
  const w = tile.w * S;
  const h = tile.h * S;
  const edges: [keyof SchematicTile['edges'], number, (along: number) => [number, number]][] = [
    ['N', w, (a) => [a, 0]],
    ['S', w, (a) => [a, h]],
    ['W', h, (a) => [0, a]],
    ['E', h, (a) => [w, a]],
  ];
  for (const [name, length, at] of edges) {
    const gaps = tile.edges[name].map(([start, end, kind]) => [start * S, end * S, kind] as const).sort((a, b) => a[0] - b[0]);
    let from = 0;
    for (const [start, end, kind] of [...gaps, [length, length, 'o'] as const]) {
      if (start > from) g.moveTo(...at(from)).lineTo(...at(start)).stroke({ width: 10, color: look.ink, cap: 'square' });
      if (kind === 'd' && end > start) g.moveTo(...at(start)).lineTo(...at(end)).stroke({ width: 5, color: look.trim });
      from = Math.max(from, end);
    }
  }
}

/**
 * A Descent tile: its squares on the floor, with thin lines between them and a wall around them, and its name. The
 * squares lie on its side's grid, from the first space's corner in the picture (as Quest.Tile places the picture).
 */
function drawSquares(tile: DescentTile, outside: boolean, text: string, width: number, height: number, rotation: number, look: SchematicLook): Container {
  const left = -width / 2 + (tile.left / tile.pps + tile.x) * S;
  const top = -height / 2 + (tile.top / tile.pps + tile.y) * S;
  const has = (i: number, j: number) => tile.rows[j]?.[i] === '#';
  const squares = tile.rows.flatMap((row, j) => [...row].flatMap((c, i) => (c === '#' ? [[left + i * S, top + j * S, i, j] as const] : [])));
  const g = new Graphics();
  for (const [x, y] of squares) g.rect(x, y, S, S);
  g.fill(outside ? look.floorOutside : look.floorInside);
  for (const [x, y, i, j] of squares) {
    if (has(i + 1, j)) g.moveTo(x + S, y).lineTo(x + S, y + S);
    if (has(i, j + 1)) g.moveTo(x, y + S).lineTo(x + S, y + S);
  }
  g.stroke({ width: 2, color: look.inkSoft, alpha: 0.5 });
  for (const [x, y, i, j] of squares) {
    if (!has(i, j - 1)) g.moveTo(x, y).lineTo(x + S, y);
    if (!has(i + 1, j)) g.moveTo(x + S, y).lineTo(x + S, y + S);
    if (!has(i, j + 1)) g.moveTo(x, y + S).lineTo(x + S, y + S);
    if (!has(i - 1, j)) g.moveTo(x, y).lineTo(x, y + S);
  }
  g.stroke({ width: 8, color: look.ink, cap: 'square' });
  const across = Math.max(1, ...tile.rows.map((row) => row.length));
  const name = label(text, across * S * 0.8, 0.45 * S, look.inkSoft, rotation, look.font);
  name.position.set(left + (across * S) / 2, top + (Math.max(1, tile.rows.length) * S) / 2);
  return new Container({ children: [g, name] });
}

/** Valkyrie's monster frames (sprites/borders/Frame_Monster_…): a dark red ring in a grey rim, round or oval. */
function drawFrame(width: number, height: number, oval: boolean, look: SchematicLook): Container {
  const m = Math.min(width, height);
  const inset = m * 0.06;
  const ring = (g: Graphics) =>
    oval ? g.ellipse(0, 0, width / 2 - inset, height / 2 - inset) : g.roundRect(-width / 2 + inset, -height / 2 + inset, width - 2 * inset, height - 2 * inset, m / 2 - inset);
  const g = new Graphics();
  ring(g).stroke({ width: m * 0.1, color: 0x8c8c8c });
  ring(g).stroke({ width: m * 0.05, color: look.alert });
  return new Container({ children: [g] });
}

function drawPlain(text: string, width: number, height: number, rotation: number, look: SchematicLook): Container {
  const g = new Graphics()
    .rect(-width / 2, -height / 2, width, height)
    .fill(look.floorInside)
    .stroke({ width: Math.min(width, height) * 0.03, color: look.ink });
  return new Container({ children: [g, label(text, width * 0.8, Math.min(0.5 * S, height * 0.3), look.inkSoft, rotation, look.font)] });
}

function drawDisc(text: string, width: number, height: number, rotation: number, fill: string, edge: string, ink: string, font: string): Container {
  const g = new Graphics();
  const r = (Math.min(width, height) / 2) * 0.94;
  if (Math.abs(width - height) < 0.01) g.circle(0, 0, r);
  else g.roundRect(-width / 2 + r * 0.06, -height / 2 + r * 0.06, width - r * 0.12, height - r * 0.12, r * 0.5);
  g.fill(fill).stroke({ width: r * 0.1, color: edge });
  return new Container({ children: [g, label(text, Math.min(width, height) * 0.8 + Math.abs(width - height), r * 0.42, ink, rotation, font)] });
}

function drawCard(text: string, width: number, height: number, rotation: number, fill: string, edge: string, ink: string, font: string): Container {
  const m = Math.min(width, height);
  const g = new Graphics()
    .roundRect(-width / 2 + m * 0.04, -height / 2 + m * 0.04, width - m * 0.08, height - m * 0.08, m * 0.1)
    .fill(fill)
    .stroke({ width: m * 0.05, color: edge });
  return new Container({ children: [g, label(text, width * 0.82, m * 0.22, ink, rotation, font)] });
}

/** Valkyrie's sprites/door: a bevelled white bar, which takes the door's colour. */
function drawDoor(width: number, height: number): Container {
  const g = new Graphics()
    .roundRect(-width / 2, -height / 2, width, height, width * 0.2)
    .fill(0xffffff)
    .stroke({ width: width * 0.14, color: 0x9a9a9a, alignment: 1 })
    .moveTo(-width * 0.18, -height / 2 + width * 0.3)
    .lineTo(-width * 0.18, height / 2 - width * 0.3)
    .stroke({ width: width * 0.08, color: 0xd8d8d8 });
  return new Container({ children: [g] });
}

/** Valkyrie's sprites/target: two white rings, with a dark edge so they show on pale tiles. */
function drawTarget(width: number, height: number, ink: string): Container {
  const r = Math.min(width, height) / 2;
  const g = new Graphics();
  for (const radius of [r * 0.9, r * 0.28]) {
    g.circle(0, 0, radius).stroke({ width: r * 0.17, color: ink, alpha: 0.55 });
    g.circle(0, 0, radius).stroke({ width: r * 0.09, color: 0xffffff });
  }
  return new Container({ children: [g] });
}
