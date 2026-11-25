// Blue magical fire for Descent's runestone look in the Universalis theme (2 November 2026): the braziers of the menu's
// hall (runeHallArt.ts) and of the hero selection (descentRoomArt.ts). Each fire is many soft licks of flame born at the
// bowl, rising, narrowing to a point and cooling from white through ice blue to deep blue as they go, swaying in their
// own heat; over them a few long tongues that stretch and lean, a bright core at the root, and a glow that breathes. All
// added light, drawn with PixiJS. Not ported from Valkyrie.
import { Container, Sprite, Texture } from 'pixi.js';
import { glowTexture, painted, wobble } from './candles.ts';

/** A fire: the middle of its root, how tall it burns and how wide its root is, in its parent's pixels. */
export interface FireSite {
  x: number;
  y: number;
  height: number;
  width: number;
}

interface Lick {
  sprite: Sprite;
  age: number;
  life: number;
  /** Where it started across the root, from -1 to 1, and its own sway. */
  start: number;
  phase: number;
  size: number;
}

interface Fire {
  site: FireSite;
  /** How bright each lick is, less where many overlap, so that a big fire is not a white blob. */
  each: number;
  licks: Lick[];
  tongues: { sprite: Sprite; phase: number; side: number }[];
  core: Sprite;
  glow: Sprite;
  phase: number;
}

/** A lick of flame: a soft drop, round below and pointed above, white. */
function lickTexture(): Texture {
  return painted(48, 80, (c) => {
    c.filter = 'blur(4px)';
    c.beginPath();
    c.moveTo(24, 6);
    c.bezierCurveTo(32, 30, 42, 46, 40, 60);
    c.bezierCurveTo(38, 74, 10, 74, 8, 60);
    c.bezierCurveTo(6, 46, 16, 30, 24, 6);
    const g = c.createRadialGradient(24, 58, 1, 24, 52, 30);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.6)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fill();
  });
}

/** A long tongue of flame, ragged at its tip, white at its root and fading up. */
function tongueTexture(): Texture {
  return painted(64, 200, (c) => {
    c.filter = 'blur(4px)';
    c.beginPath();
    c.moveTo(32, 6);
    c.bezierCurveTo(42, 50, 22, 80, 48, 128);
    c.bezierCurveTo(62, 158, 54, 192, 32, 194);
    c.bezierCurveTo(10, 192, 2, 158, 16, 128);
    c.bezierCurveTo(34, 96, 22, 50, 32, 6);
    const g = c.createLinearGradient(0, 194, 0, 6);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.75)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fill();
  });
}

/** The colour of flame at an age from 0 (just born) to 1: white, ice, blue, deep blue. */
const RAMP = [
  [0, 0xf4ffff],
  [0.18, 0xa8ecff],
  [0.45, 0x4ab4ff],
  [0.75, 0x2066e8],
  [1, 0x1a2a9a],
] as const;

function colourAt(age: number): number {
  for (let i = 1; i < RAMP.length; i++) {
    const [to, b] = RAMP[i]!;
    const [from, a] = RAMP[i - 1]!;
    if (age <= to) {
      const k = (age - from) / (to - from);
      const mix = (shift: number) => Math.round(((a >> shift) & 255) * (1 - k) + ((b >> shift) & 255) * k);
      return (mix(16) << 16) | (mix(8) << 8) | mix(0);
    }
  }
  return RAMP[RAMP.length - 1]![1];
}

export class BlueFire {
  /** Its textures, for its drawing to destroy with the rest. */
  readonly textures: Texture[];
  private readonly fires: Fire[] = [];

  /** Fires at these sites, each of about `licks` licks of flame, on `parent`. */
  constructor(parent: Container, sites: readonly FireSite[], licks = 60) {
    const lick = lickTexture();
    const tongue = tongueTexture();
    const glow = glowTexture();
    this.textures = [lick, tongue, glow];
    sites.forEach((site, n) => {
      const layer = new Container();
      parent.addChild(layer);
      const halo = new Sprite(glow);
      halo.anchor.set(0.5);
      halo.position.set(site.x, site.y - site.height * 0.35);
      halo.tint = 0x2f8cff;
      halo.blendMode = 'add';
      layer.addChild(halo);
      const tongues = [-0.5, 0, 0.5].map((side, i) => {
        const sprite = new Sprite(tongue);
        sprite.anchor.set(0.5, 0.97);
        sprite.position.set(site.x + side * site.width * 0.3, site.y);
        sprite.tint = 0x5ab8ff;
        sprite.blendMode = 'add';
        layer.addChild(sprite);
        return { sprite, phase: n * 1.7 + i * 2.3, side };
      });
      const count = Math.max(8, Math.round(licks * Math.min(1, site.height / 100) + licks * 0.25));
      const fire: Fire = { site, each: 0.7 * Math.sqrt(14 / count), licks: [], tongues, core: new Sprite(glow), glow: halo, phase: n * 2.9 };
      for (let i = 0; i < count; i++) {
        const sprite = new Sprite(lick);
        sprite.anchor.set(0.5, 0.75);
        sprite.blendMode = 'add';
        layer.addChild(sprite);
        const l = { sprite, age: 0, life: 1, start: 0, phase: 0, size: 1 };
        this.born(l, site);
        l.age = Math.random() * l.life;
        fire.licks.push(l);
      }
      fire.core.anchor.set(0.5);
      fire.core.position.set(site.x, site.y - site.height * 0.08);
      fire.core.tint = 0xcff4ff;
      fire.core.blendMode = 'add';
      layer.addChild(fire.core);
      this.fires.push(fire);
    });
  }

  private born(l: Lick, site: FireSite): void {
    l.age = 0;
    l.life = 0.45 + Math.random() * 0.5;
    l.start = (Math.random() * 2 - 1) * (0.4 + 0.6 * Math.random());
    l.phase = Math.random() * 10;
    l.size = 0.7 + Math.random() * 0.6;
    l.sprite.visible = true;
    void site;
  }

  /** Every frame: `t` seconds since the drawing started, `seconds` since the last frame. */
  update(t: number, seconds: number): void {
    for (const { site, each, licks, tongues, core, glow, phase } of this.fires) {
      // How strongly it burns now, and the draught that leans it
      const blaze = 0.85 + 0.15 * wobble(t * 0.7, phase);
      const lean = 0.18 * wobble(t * 0.35, phase + 4);
      const h = site.height * blaze;
      const k = site.height / 160;
      for (const l of licks) {
        l.age += seconds / l.life;
        if (l.age >= 1) this.born(l, site);
        const a = l.age;
        // Rising faster as it goes, drawn in towards the middle to a point, swaying in its own heat
        const rise = h * (a * 0.65 + a * a * 0.45);
        const narrow = 1 - 0.75 * a;
        const sway = site.width * 0.12 * Math.sin(t * 7 + l.phase + a * 6) * a;
        l.sprite.position.set(site.x + l.start * site.width * 0.5 * narrow + sway + lean * rise, site.y - rise);
        const s = k * l.size * (1.15 - 0.85 * a);
        l.sprite.scale.set(s * (0.6 + 0.15 * Math.sin(t * 11 + l.phase)), s * (1.1 + 0.9 * a));
        l.sprite.rotation = lean * 0.6 + 0.25 * Math.sin(t * 5 + l.phase) * a;
        l.sprite.tint = colourAt(a);
        l.sprite.alpha = Math.min(1, a * 8) * (1 - a) ** 1.3 * each;
      }
      tongues.forEach(({ sprite, phase: p, side }) => {
        const w = wobble(t * 1.1, p);
        sprite.scale.set(k * (0.55 + 0.08 * w) * (1 - 0.3 * Math.abs(side)), k * (0.65 + 0.2 * w) * blaze * (1 - 0.35 * Math.abs(side)));
        sprite.skew.x = -lean * 1.2 + 0.18 * wobble(t * 0.9, p + 3);
        sprite.alpha = 0.35 + 0.2 * (0.5 + 0.5 * w);
      });
      core.scale.set(k * 0.4 * (0.9 + 0.1 * blaze), k * 0.28);
      core.alpha = 0.3 + 0.15 * wobble(t * 1.5, phase + 1);
      glow.scale.set(k * 2.6, k * 2.4);
      glow.alpha = 0.2 + 0.12 * blaze;
    }
  }
}
