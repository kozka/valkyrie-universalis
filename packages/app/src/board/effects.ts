// Not in Valkyrie: what the board adds so that changes are seen (docs/peticiones.md). A token just placed shines for a
// moment under a warm halo, with two faint rings growing from it, as the official app outlines what it places (Valkyrie
// issues 696 and 256), and while the event that placed it is still on screen a fainter halo stays under it, so that it
// can be found once the window is read (29 October 2026); a token taken
// away does not vanish at once but swells, reddens and fades. Neither changes the game: only the drawing.
import { Container, Texture } from 'pixi.js';
import type { GameObject } from '@universalis/engine';
import { createQuad, destroyQuad, placeQuad, type Quad } from './perspective.ts';

/** How long the halo of a new token lasts, and how long a token takes to go. */
const SHINE = 3;
const VANISH = 0.6;

/** How bright the halo stays, slowly breathing, while a window is open, and how long it takes to go once it closes. */
const LINGER = 0.38;
const LINGER_GO = 0.8;

/** The window event that asks the board to light again what was just placed (play/Windows.tsx, folding a window). */
export const SHOW_PLACED = 'universalis:show-placed';

/** How long one ring takes to grow and go, and how many follow each other. */
const RIPPLE = 1.4;
const RIPPLES = 2;

let halo: Texture | null = null;
let ring: Texture | null = null;

/** A thin, soft, see-through ring, drawn once: the circle that grows from what was placed, as Valkyrie's highlight
 * (SpritePulser on sprites/target) draws attention to a place. */
function ringTexture(): Texture {
  if (ring !== null) return ring;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext('2d')!;
  const gradient = g.createRadialGradient(size / 2, size / 2, size * 0.36, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 240, 210, 0)');
  gradient.addColorStop(0.7, 'rgba(255, 240, 210, 0.55)');
  gradient.addColorStop(1, 'rgba(255, 240, 210, 0)');
  g.fillStyle = gradient;
  g.fillRect(0, 0, size, size);
  ring = Texture.from(canvas);
  return ring;
}

/** A soft round light, drawn once. */
function haloTexture(): Texture {
  if (halo !== null) return halo;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext('2d')!;
  const gradient = g.createRadialGradient(size / 2, size / 2, size * 0.18, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 214, 120, 0.6)');
  gradient.addColorStop(0.55, 'rgba(255, 180, 60, 0.26)');
  gradient.addColorStop(1, 'rgba(255, 160, 40, 0)');
  g.fillStyle = gradient;
  g.fillRect(0, 0, size, size);
  halo = Texture.from(canvas);
  return halo;
}

interface Shine {
  quad: Quad;
  of: GameObject;
  age: number;
  /** How long it has been going since it stopped lingering, or null while it shines or lingers. */
  going: number | null;
  /** How bright it was when it began to go. */
  from: number;
  /** The window of the event that placed it: it lingers while that window is open, and only that one. */
  key: unknown;
}

interface TileGlow {
  quad: Quad;
  /** Where the tile lies (x, y, rotation, width, height). */
  place: number[];
  age: number;
}

/** How long a tile's light takes, in two breaths. */
const TILE_GLOW = 1.8;

let frame: Texture | null = null;

/** A soft lit edge with a faint inside, drawn once: laid over a tile to show it. */
function frameTexture(): Texture {
  if (frame !== null) return frame;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext('2d')!;
  g.fillStyle = 'rgba(255, 225, 160, 0.1)';
  g.fillRect(12, 12, size - 24, size - 24);
  g.shadowColor = 'rgba(255, 200, 110, 0.9)';
  g.shadowBlur = 16;
  g.strokeStyle = 'rgba(255, 236, 190, 0.85)';
  g.lineWidth = 5;
  g.strokeRect(14, 14, size - 28, size - 28);
  frame = Texture.from(canvas);
  return frame;
}

interface Ripple {
  quad: Quad;
  /** The piece it grows from, or else a place of the board and the size it starts at. */
  of: GameObject | null;
  at?: { x: number; y: number; size: number };
  age: number;
}

interface Vanish {
  quad: Quad;
  place: number[];
  baked: Texture | null;
  age: number;
}

export class BoardEffects {
  /** Under the tokens: the halos. */
  readonly under = new Container();
  /** Over the tokens: the ones going away. */
  readonly over = new Container();
  private shines: Shine[] = [];
  private vanishes: Vanish[] = [];
  private ripples: Ripple[] = [];
  private tileGlows: TileGlow[] = [];

  /** A token has just been placed, while `key`'s window is open: a halo under it, and rings that grow from it. */
  placed(of: GameObject, key: unknown = null): void {
    const quad = createQuad(haloTexture());
    quad.blendMode = 'add';
    this.under.addChild(quad);
    this.shines.push({ quad, of, age: 0, going: null, from: 0, key });
    for (let i = 0; i < RIPPLES; i++) {
      const circle = createQuad(ringTexture());
      circle.alpha = 0;
      this.over.addChild(circle);
      // Each one a little after the one before
      this.ripples.push({ quad: circle, of, age: -i * RIPPLE * 0.45 });
    }
  }

  /**
   * Not in Valkyrie (29 October 2026): what the event on screen (`key`) placed shines again, the tokens with their
   * rings as when they were placed, the tiles (where each lies) under a light that breathes twice; or, when it placed
   * nothing, the place it marks (`place`), with rings. Asked when its window is folded away to find them on the board.
   * The piece pressed to open it (`pressed`, 7 November 2026) rings too, as a monster placed does, to tell which it was.
   */
  showAgain(key: unknown, tiles: number[][], place?: { x: number; y: number }, pressed: GameObject | null = null): void {
    for (const tile of tiles) {
      const quad = createQuad(frameTexture());
      quad.blendMode = 'add';
      quad.alpha = 0;
      this.over.addChild(quad);
      this.tileGlows.push({ quad, place: tile, age: 0 });
    }
    let lit = tiles.length > 0;
    for (const s of this.shines) {
      if (s.going !== null || s.key !== key) continue;
      // From the lingering glow back up, softly
      s.age = 0.1;
      this.ring(s.of);
      lit = true;
    }
    // The place the event marks, only when it placed nothing to light: an event's place is often just where its
    // author points the camera, away from what it places (a ring there showed nothing, 29 October 2026)
    if (pressed !== null) this.ring(pressed);
    else if (place !== undefined && !lit) this.ring(null, { ...place, size: 1 });
  }

  private ring(of: GameObject | null, at?: { x: number; y: number; size: number }): void {
    for (let i = 0; i < RIPPLES; i++) {
      const circle = createQuad(ringTexture());
      circle.alpha = 0;
      this.over.addChild(circle);
      this.ripples.push({ quad: circle, of, ...(at !== undefined ? { at } : {}), age: -i * RIPPLE * 0.45 - 0.15 });
    }
  }

  /** A token has been taken away: its quad stays a moment to go, then it and its baked picture are destroyed. */
  removed(quad: Quad, place: number[], baked: Texture | null): void {
    quad.removeFromParent();
    this.over.addChild(quad);
    this.vanishes.push({ quad, place, baked, age: 0 });
  }

  /** `key`: the window of the event on screen, if any; what that event placed keeps a fainter halo while it is open. */
  update(deltaTime: number, scale: number, key: unknown = null): void {
    this.tileGlows = this.tileGlows.filter((g) => {
      g.age += deltaTime;
      if (g.age >= TILE_GLOW) {
        destroyQuad(g.quad);
        return false;
      }
      const [x, y, rotation, width, height] = g.place as [number, number, number, number, number];
      placeQuad(g.quad, x, y, rotation, width * 1.02, height * 1.02);
      g.quad.alpha = 0.55 * (0.5 - 0.5 * Math.cos((g.age / TILE_GLOW) * Math.PI * 4));
      return true;
    });
    this.shines = this.shines.filter((s) => {
      s.age += deltaTime;
      const lingering = key !== null && s.key === key;
      const image = s.of.image;
      if (image === null) {
        destroyQuad(s.quad);
        return false;
      }
      // Two slow breaths, then it fades, down to the lingering glow while a window is open, or out
      const fading = Math.max(0, s.age - SHINE * 0.6) / (SHINE * 0.4);
      let alpha = Math.min(1, s.age * 4) * (1 - Math.min(1, fading) * (1 - (lingering ? LINGER : 0)));
      if (s.age >= SHINE) {
        if (lingering && s.going === null) alpha = LINGER * (0.8 + 0.2 * Math.cos((s.age - SHINE) * 1.6));
        else {
          if (s.going === null) {
            s.going = 0;
            s.from = s.quad.alpha;
          }
          s.going += deltaTime;
          if (s.going >= LINGER_GO) {
            destroyQuad(s.quad);
            return false;
          }
          alpha = s.from * (1 - s.going / LINGER_GO);
        }
      }
      const { position } = s.of.transform;
      const breath = 1 + 0.08 * Math.sin((Math.min(s.age, SHINE) / SHINE) * Math.PI * 4);
      const size = Math.max(image.sizeDelta.x, image.sizeDelta.y) * scale * 1.65 * breath;
      placeQuad(s.quad, position.x, position.y, 0, size, size);
      s.quad.alpha = alpha;
      return true;
    });
    this.ripples = this.ripples.filter((r) => {
      r.age += deltaTime;
      const image = r.of?.image ?? null;
      if (r.age >= RIPPLE || (r.of !== null && image === null)) {
        destroyQuad(r.quad);
        return false;
      }
      if (r.age < 0) return true;
      const t = r.age / RIPPLE;
      const position = r.of !== null ? r.of.transform.position : r.at!;
      const start = image !== null ? Math.max(image.sizeDelta.x, image.sizeDelta.y) * scale : r.at!.size;
      const size = start * (0.9 + 1.6 * t);
      placeQuad(r.quad, position.x, position.y, 0, size, size);
      r.quad.alpha = 0.7 * (1 - t) * Math.min(1, t * 6);
      return true;
    });
    this.vanishes = this.vanishes.filter((v) => {
      v.age += deltaTime;
      if (v.age >= VANISH) {
        destroyQuad(v.quad);
        v.baked?.destroy(true);
        return false;
      }
      const t = v.age / VANISH;
      const [x, y, rotation, width, height] = v.place as [number, number, number, number, number];
      const grow = 1 + 0.35 * t;
      placeQuad(v.quad, x, y, rotation, width * grow, height * grow);
      v.quad.alpha = 1 - t * t;
      v.quad.tint = (0xff << 16) | (Math.round(255 * (1 - 0.7 * t)) << 8) | Math.round(255 * (1 - 0.8 * t));
      return true;
    });
  }

  destroy(): void {
    for (const g of this.tileGlows) destroyQuad(g.quad);
    this.tileGlows = [];
    for (const s of this.shines) destroyQuad(s.quad);
    for (const r of this.ripples) destroyQuad(r.quad);
    this.ripples = [];
    for (const v of this.vanishes) {
      destroyQuad(v.quad);
      v.baked?.destroy(true);
    }
    this.shines = [];
    this.vanishes = [];
    this.under.destroy();
    this.over.destroy();
  }
}
