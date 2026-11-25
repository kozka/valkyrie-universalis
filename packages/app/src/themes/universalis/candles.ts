// The Universalis theme's candles, drawn with PixiJS over kozka's pictures where his candles stand: each flame its
// own, a drop of light that flickers, grows and leans, with a warm halo on the wall, and a gust now and then that
// bends them all together. The investigators' study (heroRoomArt.ts) and the library behind a scenario's details
// (libraryArt.ts) light theirs with it. Not ported from Valkyrie.
import { Container, Sprite, Texture } from 'pixi.js';

/** A candle in its picture: the middle of its top, where its wax ends, and how big its flame is. */
export interface Candle {
  x: number;
  top: number;
  size: number;
}

interface Flame {
  outer: Sprite;
  core: Sprite;
  halo: Sprite;
  phase: number;
  size: number;
}

/** A canvas drawn by `paint`, as a texture. */
export function painted(width: number, height: number, paint: (c: CanvasRenderingContext2D) => void): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  paint(canvas.getContext('2d')!);
  return Texture.from(canvas);
}

/** A candle's flame: a drop of light, white at its root, gold, then orange at its tip and edges, soft all round. */
function flameTexture(core: boolean): Texture {
  return painted(64, 160, (c) => {
    c.filter = 'blur(3px)';
    c.beginPath();
    c.moveTo(32, 8);
    c.bezierCurveTo(44, 50, 56, 96, 52, 124);
    c.bezierCurveTo(48, 148, 16, 148, 12, 124);
    c.bezierCurveTo(8, 96, 20, 50, 32, 8);
    const g = c.createRadialGradient(32, 122, 2, 32, 110, core ? 44 : 96);
    if (core) {
      g.addColorStop(0, 'rgba(255,255,248,1)');
      g.addColorStop(0.45, 'rgba(255,244,205,0.95)');
      g.addColorStop(1, 'rgba(255,214,140,0)');
    } else {
      g.addColorStop(0, 'rgba(255,250,225,1)');
      g.addColorStop(0.25, 'rgba(255,214,120,0.98)');
      g.addColorStop(0.6, 'rgba(255,140,40,0.85)');
      g.addColorStop(1, 'rgba(200,60,10,0)');
    }
    c.fillStyle = g;
    c.fill();
    if (!core) {
      // The faint blue at the wick, as a real flame has
      const blue = c.createRadialGradient(32, 136, 1, 32, 136, 14);
      blue.addColorStop(0, 'rgba(120,150,255,0.55)');
      blue.addColorStop(1, 'rgba(120,150,255,0)');
      c.fillStyle = blue;
      c.fillRect(0, 110, 64, 50);
    }
  });
}

/** A round soft light, white in the middle. */
export function glowTexture(): Texture {
  return painted(128, 128, (c) => {
    const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.45)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 128, 128);
  });
}

/** A smooth wobble from -1 to 1, a sum of unrelated waves. */
export function wobble(t: number, phase: number): number {
  return Math.sin(t * 9.1 + phase) * 0.5 + Math.sin(t * 15.7 + phase * 1.7) * 0.3 + Math.sin(t * 4.3 + phase * 0.6) * 0.2;
}

/** The flames of a picture's candles, on `parent` (in the picture's pixels): their halos, then the flames over them. */
export class CandleFlames {
  /** Its textures, for its drawing to destroy with the rest. */
  readonly textures: Texture[];
  /** A gust that bends every flame a little, from -1 to 1. */
  gust = 0;
  private readonly flames: Flame[] = [];

  constructor(parent: Container, candles: readonly Candle[]) {
    const outer = flameTexture(false);
    const core = flameTexture(true);
    const glow = glowTexture();
    this.textures = [outer, core, glow];
    const halos = new Container();
    const flames = new Container();
    parent.addChild(halos, flames);
    candles.forEach(({ x, top, size }, i) => {
      // Its light on the wall and the wax
      const halo = new Sprite(glow);
      halo.anchor.set(0.5);
      halo.position.set(x, top - 12 * size);
      halo.scale.set(1.2 * size);
      halo.tint = 0xffa448;
      halo.blendMode = 'add';
      halos.addChild(halo);
      const flame = new Sprite(outer);
      flame.anchor.set(0.5, 0.88);
      flame.position.set(x, top - 2);
      flame.blendMode = 'add';
      const inner = new Sprite(core);
      inner.anchor.set(0.5, 0.88);
      inner.position.set(x, top - 2);
      inner.blendMode = 'add';
      flames.addChild(flame, inner);
      this.flames.push({ outer: flame, core: inner, halo, phase: i * 2.37, size });
    });
  }

  /** Every frame: `t` seconds since the drawing started, `seconds` since the last frame. */
  update(t: number, seconds: number): void {
    // A gust now and then bends the flames together
    this.gust += (Math.sin(t * 0.37) * Math.sin(t * 0.23) - this.gust) * Math.min(1, seconds * 2);
    for (const { outer, core, halo, phase, size } of this.flames) {
      const w = wobble(t, phase);
      const tall = 1 + 0.14 * w + 0.05 * Math.sin(t * 2.1 + phase);
      const scale = 0.17 * size;
      outer.scale.set(scale * (1 - 0.08 * w), scale * tall);
      core.scale.set(scale * 0.62 * (1 - 0.05 * w), scale * 0.7 * tall);
      const lean = 0.1 * wobble(t * 0.6, phase + 4) + 0.12 * this.gust;
      outer.skew.x = lean;
      core.skew.x = lean * 0.7;
      outer.alpha = 0.88 + 0.12 * w;
      halo.alpha = 0.32 + 0.1 * w;
      halo.scale.set((1.15 + 0.06 * w) * size);
    }
  }
}
