// The bridge behind DooM's hero selection in the Universalis theme (DoomHeroRoom.tsx): kozka's ship's room over hell
// (brand/doom-hero-room/room.png), drawn with PixiJS so that it lives as a ship does. Its monitors work, each with its
// program: a hologram of the planet turning among scrolling figures, a terminal writing lines, a radar sweeping and
// a row of gauges; they boot one after another (a line, then a loading bar), now and then one glitches, and once in a
// while one dies slowly and boots again. The panels' pilot lights blink, breathe, load in columns, flicker or take
// their time to go out. Through the great window the burning city: its sigil throbs, its beams flicker, embers rise,
// smoke drifts and red lightning breaks over it. The picture fills the screen as a cover; the screen's frames sit
// over it. Not ported from Valkyrie.
import { Container, Graphics, PerspectiveMesh, Rectangle, Sprite, Texture, TilingSprite, type Application, type Ticker } from 'pixi.js';
import roomUrl from '../../assets/doom-heroes-room.webp';
import windowUrl from '../../assets/doom-heroes-window.webp';
import { textureOf } from '../../screens/menuArt.ts';
import { destroyApplication, newApplication } from '../../board/pixiApps.ts';
import { glowTexture, painted } from './candles.ts';
import { cloudTexture } from './heroRoomArt.ts';

/** The picture's size. */
const WIDTH = 1672;
const HEIGHT = 941;

type Program = 'planet' | 'terminal' | 'radar' | 'gauges';
type Quad = readonly [number, number, number, number, number, number, number, number];

/** Each monitor: its screen's corners in the picture (top left, top right, bottom right, bottom left), what it shows. */
const MONITORS: readonly { quad: Quad; program: Program; width: number; height: number; colour: number }[] = [
  { quad: [32, 138, 214, 202, 198, 330, 16, 290], program: 'planet', width: 320, height: 224, colour: 0xff7a26 },
  { quad: [47, 326, 134, 345, 137, 406, 50, 399], program: 'terminal', width: 176, height: 120, colour: 0x52ff8a },
  { quad: [155, 420, 240, 434, 250, 505, 172, 500], program: 'radar', width: 176, height: 140, colour: 0x52ff8a },
  { quad: [238.2, 211.2, 259.9, 219.5, 252.6, 258.2, 231.8, 250.9], program: 'gauges', width: 64, height: 100, colour: 0xffb02a },
];

/**
 * How a light goes: breathing slowly; one after another along its group (a wave or a load); on for long, then out for
 * a while, going out slowly; pressed now and then, as keys are typed; or a slow warning blink.
 */
type Mode = 'pulse' | 'wave' | 'load' | 'rest' | 'typed' | 'blink';
/** A light of the room's own: where it is painted (its middle and size, in the picture), its group's mode and period. */
interface Lamp {
  x: number;
  y: number;
  w: number;
  h: number;
  mode: Mode;
  period: number;
}

const lamp = (mode: Mode, period: number, w: number, h: number) => (x: number, y: number): Lamp => ({ x, y, w, h, mode, period });

/**
 * The lights painted on the panels, found in the picture (brand/doom-hero-room/README.md): the keypad left of the
 * console's screen, the two right of it, the status panel's labels, the lamps of the left panel, the small displays
 * and the lamps on the pillar. Each lights its own pixels, so it stays exactly where it is painted.
 */
const LAMPS: readonly (readonly Lamp[])[] = [
  // The console's left keypad: a wave running down its rows
  [
    [129.5, 428.5], [135.5, 428.5], [142, 429], [131, 433], [138, 433.5], [143.5, 434], [132, 437.5], [138.5, 438], [144, 438],
    [133, 442], [139.5, 442], [145, 442.5], [134, 446], [140, 446], [146, 447], [135, 450], [140.5, 450], [147, 450.5],
  ].map(([x, y]) => lamp('wave', 3.6, 5, 4)(x!, y!)),
  // Its right keypads: the upper one's keys out a while now and then, the lower one typed on
  [
    [254, 445], [259, 445], [263.5, 445], [255, 449.5], [260, 449.5], [264.5, 449.5], [256, 453.5], [261, 453.5], [265, 453.5], [257, 457], [262, 457], [266, 457],
  ].map(([x, y]) => lamp('rest', 11, 5, 4)(x!, y!)),
  [
    [261, 471], [266, 471], [262, 475.5], [267, 475.5], [263, 480], [268, 480], [264, 484.5], [269, 484.5], [264.5, 489], [269.5, 489], [265, 493.5], [270, 493.5],
  ].map(([x, y]) => lamp('typed', 0.7, 5, 4)(x!, y!)),
  // The status panel's labels, lighting one after another, then all out and again
  [
    [216, 376], [216, 380], [216, 384], [216, 388], [234, 375], [234, 379], [234, 383], [234, 387],
  ].map(([x, y]) => lamp('load', 6, 9, 3)(x!, y!)),
  // The left panel: its lamps, a row of red ones going along slowly, and a slow warning
  [lamp('pulse', 4.2, 5, 5)(6, 323), lamp('rest', 13, 5, 5)(12, 332), lamp('blink', 2.6, 6, 6)(14, 346), lamp('rest', 9, 6, 5)(11, 389)],
  [[4.5, 362], [9, 362], [14, 362], [19, 362]].map(([x, y]) => lamp('wave', 4.8, 5, 5)(x!, y!)),
  // The small displays: the orange one and the amber one on the pillar breathe, the indicator by the big screen rests
  [lamp('pulse', 5.5, 10, 7)(163, 365), lamp('pulse', 4.4, 6, 6)(163, 386)],
  [lamp('rest', 15, 9, 11)(236, 267), lamp('blink', 3.1, 5, 5)(228, 307)],
  [lamp('pulse', 6.5, 17, 15)(328, 317)],
  // The lamps on the pillar, each out a while now and then
  [lamp('rest', 12, 5, 5)(296, 279), lamp('rest', 10, 5, 5)(315, 295), lamp('rest', 14, 5, 5)(351, 284), lamp('rest', 9, 5, 5)(316, 367)],
];
/** The beacon high on the left wall, which turns slowly. */
const BEACON = { x: 366, y: 133 } as const;

/** The window: where its mask goes in the picture, the sigil, the beams, and the fires along the lava. */
const WINDOW = { x: 1235, y: 0, width: 437, height: 640 } as const;
const SIGIL = { x: 1540, y: 293 } as const;
const BEAMS = [1413, 1421] as const;
const FIRES = [
  [1320, 470],
  [1400, 430],
  [1480, 470],
  [1560, 440],
  [1640, 480],
  [1360, 540],
  [1600, 545],
] as const;
const EMBERS = 40;

/** A gibberish of codes for the monitors, the same in every language. */
const GLYPHS = '0123456789ABCDEF';
function code(length: number): string {
  let s = '';
  for (let i = 0; i < length; i++) s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  return s;
}
function line(): string {
  const words = Math.floor(2 + Math.random() * 4);
  return Array.from({ length: words }, () => (Math.random() < 0.3 ? '>' : '') + code(2 + Math.floor(Math.random() * 6))).join(' ');
}

const css = (colour: number, alpha = 1) => `rgba(${colour >> 16},${(colour >> 8) & 255},${colour & 255},${alpha})`;

/** A monitor: its canvas, what it shows and in which state it is. */
class Monitor {
  readonly canvas = document.createElement('canvas');
  readonly context: CanvasRenderingContext2D;
  readonly texture: Texture;
  readonly mesh: PerspectiveMesh;
  readonly light: Sprite;
  /** off, booting (a line, then a loading bar), on, glitching for a moment, or dying slowly. */
  state: 'off' | 'boot' | 'on' | 'dying' = 'off';
  since = 0;
  next: number;
  glitch = 0;
  brightness = 0;
  private lines: string[] = [];
  private blips: { a: number; r: number; life: number }[] = [];
  private levels: number[] = [];
  private scroll = 0;

  readonly spec: (typeof MONITORS)[number];

  constructor(spec: (typeof MONITORS)[number], glow: Texture, start: number) {
    this.spec = spec;
    this.canvas.width = spec.width;
    this.canvas.height = spec.height;
    this.context = this.canvas.getContext('2d')!;
    this.texture = Texture.from(this.canvas);
    const [x0, y0, x1, y1, x2, y2, x3, y3] = spec.quad;
    this.mesh = new PerspectiveMesh({ texture: this.texture, verticesX: 6, verticesY: 6, x0, y0, x1, y1, x2, y2, x3, y3 });
    this.mesh.blendMode = 'add';
    this.light = new Sprite(glow);
    this.light.anchor.set(0.5);
    this.light.position.set((x0 + x1 + x2 + x3) / 4, (y0 + y1 + y2 + y3) / 4);
    this.light.scale.set((Math.max(x1, x2) - Math.min(x0, x3)) / 55, (Math.max(y2, y3) - Math.min(y0, y1)) / 55);
    this.light.tint = spec.colour;
    this.light.blendMode = 'add';
    this.light.alpha = 0;
    this.next = start;
    this.levels = Array.from({ length: 5 }, () => Math.random());
    for (let i = 0; i < 14; i++) this.lines.push(line());
  }

  /** Every frame: the state's changes, by the clock. */
  step(t: number, seconds: number): void {
    if (this.glitch > 0) this.glitch -= seconds;
    if (t >= this.next) {
      if (this.state === 'off') this.go('boot', t, 2.4 + Math.random() * 1.5);
      else if (this.state === 'boot') this.go('on', t, 18 + Math.random() * 40);
      else if (this.state === 'dying') this.go('off', t, 1.5 + Math.random() * 3);
      else if (Math.random() < 0.25) this.go('dying', t, 2.2);
      else {
        this.glitch = 0.25 + Math.random() * 0.5;
        this.next = t + 8 + Math.random() * 25;
      }
    }
    const target = this.state === 'off' ? 0 : this.state === 'dying' ? Math.max(0, 1 - (t - this.since) / 2.2) : 1;
    // A screen lights at once and dims slowly, as old tubes do
    this.brightness += (target - this.brightness) * Math.min(1, seconds * (target > this.brightness ? 12 : 1.5));
  }

  private go(state: Monitor['state'], t: number, lasts: number): void {
    this.state = state;
    this.since = t;
    this.next = t + lasts;
  }

  /** Draws the screen again (a few times a second is enough). */
  draw(t: number, dt: number): void {
    const c = this.context;
    const { width: w, height: h, colour } = this.spec;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, w, h);
    const age = t - this.since;
    if (this.state === 'off') {
      this.texture.source.update();
      return;
    }
    // The screen's own faint glow
    const back = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
    back.addColorStop(0, css(colour, 0.16));
    back.addColorStop(1, css(colour, 0.04));
    c.fillStyle = back;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = css(colour, 0.9);
    c.fillStyle = css(colour, 0.9);
    c.lineWidth = Math.max(1, w / 200);
    c.font = `${Math.max(7, Math.round(h / 13))}px monospace`;
    c.textBaseline = 'top';

    if (this.state === 'boot') {
      if (age < 0.5) {
        // The tube warming: a line opening from the middle
        const open = age / 0.5;
        c.fillStyle = css(0xffffff, 0.85);
        c.fillRect(w * (0.5 - open / 2), h / 2 - 1, w * open, 2 + open * 2);
      } else {
        const done = Math.min(1, (age - 0.5) / 1.6);
        c.strokeRect(w * 0.15, h * 0.55, w * 0.7, h * 0.09);
        c.fillRect(w * 0.15 + 2, h * 0.55 + 2, (w * 0.7 - 4) * done, h * 0.09 - 4);
        c.fillText(`${code(4)}  ${Math.floor(done * 100)}%`, w * 0.15, h * 0.38);
      }
    } else if (this.spec.program === 'planet') this.planet(c, w, h, t, dt);
    else if (this.spec.program === 'terminal') this.terminal(c, w, h, t, dt);
    else if (this.spec.program === 'radar') this.radar(c, w, h, t, dt);
    else this.gauges(c, w, h, t, dt);

    // Scan lines over all of it
    c.fillStyle = css(0x000000, 0.28);
    for (let y = 0; y < h; y += 3) c.fillRect(0, y, w, 1);
    // A glitch: bands of the picture thrown sideways
    if (this.glitch > 0) {
      for (let i = 0; i < 3; i++) {
        const y = Math.random() * h;
        const band = 4 + Math.random() * h * 0.15;
        c.drawImage(this.canvas, 0, y, w, band, (Math.random() - 0.5) * w * 0.2, y, w, band);
      }
      c.fillStyle = css(0xffffff, 0.08 + Math.random() * 0.1);
      c.fillRect(0, 0, w, h);
    }
    // Dying: the picture collapsing to a line
    if (this.state === 'dying') {
      const squash = Math.min(1, age / 2.2);
      c.fillStyle = css(0x000000, squash * 0.9);
      c.fillRect(0, 0, w, h * 0.5 * squash);
      c.fillRect(0, h - h * 0.5 * squash, w, h * 0.5 * squash);
    }
    this.texture.source.update();
  }

  /** The planet turning in wireframe, its moon on its orbit, figures scrolling at the left, a sigil at the right. */
  private planet(c: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number): void {
    const { colour } = this.spec;
    const cx = w * 0.56;
    const cy = h * 0.54;
    const r = h * 0.28;
    const sphere = c.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
    sphere.addColorStop(0, css(colour, 0.55));
    sphere.addColorStop(1, css(colour, 0.12));
    c.fillStyle = sphere;
    c.beginPath();
    c.arc(cx, cy, r, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = css(colour, 0.75);
    c.stroke();
    // Parallels, and meridians that turn
    for (let i = -2; i <= 2; i++) {
      const y = cy + (i / 3) * r;
      const rx = Math.sqrt(1 - (i / 3) ** 2) * r;
      c.beginPath();
      c.ellipse(cx, y, rx, rx * 0.18, 0, 0, Math.PI * 2);
      c.stroke();
    }
    for (let i = 0; i < 6; i++) {
      const a = ((t * 0.4 + (i * Math.PI) / 6) % Math.PI) - Math.PI / 2;
      c.beginPath();
      c.ellipse(cx, cy, Math.abs(Math.sin(a)) * r, r, 0, 0, Math.PI * 2);
      c.strokeStyle = css(colour, 0.25 + 0.4 * Math.abs(Math.cos(a)));
      c.stroke();
    }
    // The orbit and its moon
    c.strokeStyle = css(colour, 0.5);
    c.beginPath();
    c.ellipse(cx, cy, r * 1.55, r * 0.45, -0.25, 0, Math.PI * 2);
    c.stroke();
    const m = t * 0.9;
    c.fillStyle = css(0xffffff, 0.9);
    c.beginPath();
    c.arc(cx + Math.cos(m) * r * 1.55 * Math.cos(-0.25) - Math.sin(m) * r * 0.45 * Math.sin(-0.25), cy + Math.cos(m) * r * 1.55 * Math.sin(-0.25) + Math.sin(m) * r * 0.45 * Math.cos(-0.25), 2.5, 0, Math.PI * 2);
    c.fill();
    // Figures scrolling up at the left
    this.scroll += dt * 14;
    const step = h / 13;
    if (this.scroll >= step) {
      this.scroll -= step;
      this.lines.shift();
      this.lines.push(line());
    }
    c.fillStyle = css(colour, 0.85);
    c.font = `${Math.round(h / 17)}px monospace`;
    this.lines.slice(0, 12).forEach((text, i) => c.fillText(text.slice(0, 7), 8, 22 + i * step - this.scroll));
    // The header, and a sigil that pulses at the right
    c.fillStyle = css(colour, 0.9);
    c.fillRect(0, 0, w, h * 0.07);
    c.fillStyle = css(0x000000, 0.8);
    c.fillText(`UAC-${code(3)}  ${code(6)}`, 6, 2);
    const p = 0.5 + 0.5 * Math.sin(t * 3);
    c.strokeStyle = css(colour, 0.4 + 0.6 * p);
    c.lineWidth = 2;
    const tx = w * 0.86;
    const ty = h * 0.6;
    c.beginPath();
    c.moveTo(tx, ty - 22);
    c.lineTo(tx + 20, ty + 14);
    c.lineTo(tx - 20, ty + 14);
    c.closePath();
    c.stroke();
    c.beginPath();
    c.arc(tx, ty + 2, 6, 0, Math.PI * 2);
    c.stroke();
    // Levels at the bottom right
    for (let i = 0; i < 5; i++) {
      this.levels[i] = Math.max(0.1, Math.min(1, this.levels[i]! + (Math.random() - 0.5) * dt * 2));
      c.fillStyle = css(colour, 0.7);
      c.fillRect(w * 0.76 + i * 9, h * 0.95 - this.levels[i]! * h * 0.18, 6, this.levels[i]! * h * 0.18);
    }
  }

  /** A terminal writing lines, the last one as it is typed, with its cursor. */
  private terminal(c: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number): void {
    const step = h / 9;
    this.scroll += dt * (Math.sin(t * 0.3) > 0.6 ? 0 : 1.8);
    if (this.scroll >= 1) {
      this.scroll -= 1;
      this.lines.shift();
      this.lines.push(line());
    }
    const shown = this.lines.slice(-8);
    shown.forEach((text, i) => {
      const last = i === shown.length - 1;
      const typed = last ? text.slice(0, Math.floor(text.length * this.scroll)) : text;
      c.fillText(typed, 5, 4 + i * step);
      if (last && Math.sin(t * 8) > 0) c.fillRect(8 + c.measureText(typed).width, 4 + i * step, 6, step * 0.8);
    });
  }

  /** A radar: its rings, a sweep with its fading trail, and blips that light as it passes and fade. */
  private radar(c: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number): void {
    const { colour } = this.spec;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.44;
    c.strokeStyle = css(colour, 0.45);
    for (let i = 1; i <= 3; i++) {
      c.beginPath();
      c.arc(cx, cy, (r * i) / 3, 0, Math.PI * 2);
      c.stroke();
    }
    c.beginPath();
    c.moveTo(cx - r, cy);
    c.lineTo(cx + r, cy);
    c.moveTo(cx, cy - r);
    c.lineTo(cx, cy + r);
    c.stroke();
    const a = (t * 1.6) % (Math.PI * 2);
    for (let i = 0; i < 24; i++) {
      const b = a - i * 0.04;
      c.strokeStyle = css(colour, 0.8 * (1 - i / 24));
      c.beginPath();
      c.moveTo(cx, cy);
      c.lineTo(cx + Math.cos(b) * r, cy + Math.sin(b) * r);
      c.stroke();
    }
    if (Math.random() < dt * 1.2) this.blips.push({ a: a + 0.05, r: r * (0.2 + Math.random() * 0.75), life: 1 });
    this.blips = this.blips.filter((blip) => (blip.life -= dt * 0.35) > 0);
    for (const blip of this.blips) {
      c.fillStyle = css(colour, blip.life);
      c.beginPath();
      c.arc(cx + Math.cos(blip.a) * blip.r, cy + Math.sin(blip.a) * blip.r, 2.5, 0, Math.PI * 2);
      c.fill();
    }
  }

  /** A row of gauges rising and falling. */
  private gauges(c: CanvasRenderingContext2D, w: number, h: number, _t: number, dt: number): void {
    const { colour } = this.spec;
    const bars = 3;
    for (let i = 0; i < bars; i++) {
      this.levels[i] = Math.max(0.05, Math.min(1, this.levels[i]! + (Math.random() - 0.5) * dt * 3));
      const bw = w / bars - 6;
      const level = this.levels[i]!;
      for (let s = 0; s < 10; s++) {
        const on = s / 10 < level;
        c.fillStyle = css(s > 7 ? 0xff3010 : colour, on ? 0.9 : 0.15);
        c.fillRect(3 + i * (bw + 6), h - 6 - (s + 1) * (h / 11), bw, h / 11 - 2);
      }
    }
  }
}

interface Pilot {
  /** The lamp's own pixels, added over themselves to light it, and what darkens it when it is out. */
  light: Sprite;
  shade: Sprite;
  halo: Sprite;
  mode: Mode;
  period: number;
  phase: number;
  /** Its place in its group and the group's size, for lights that go one after another. */
  index: number;
  count: number;
  level: number;
}

interface Ember {
  sprite: Sprite;
  vx: number;
  vy: number;
  life: number;
  age: number;
  phase: number;
}

/** A soft dark spot, to put a painted light out. */
function shadeTexture(): Texture {
  return painted(16, 16, (c) => {
    const g = c.createRadialGradient(8, 8, 0, 8, 8, 8);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.6, 'rgba(0,0,0,0.8)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 16, 16);
  });
}

/** A beam of light: bright down its middle, soft to its sides. */
function beamTexture(): Texture {
  return painted(16, 4, (c) => {
    const g = c.createLinearGradient(0, 0, 16, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 16, 4);
  });
}

function emberTexture(): Texture {
  return painted(16, 16, (c) => {
    const g = c.createRadialGradient(8, 8, 0, 8, 8, 8);
    g.addColorStop(0, 'rgba(255,240,200,1)');
    g.addColorStop(0.3, 'rgba(255,140,50,0.9)');
    g.addColorStop(1, 'rgba(255,40,0,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 16, 16);
  });
}

export class DoomRoomArt {
  private readonly host: HTMLElement;
  private app: Application | null = null;
  private destroyed = false;
  private readonly textures: Texture[] = [];
  private readonly parts: Texture[] = [];
  private readonly world = new Container();
  private resizing: ResizeObserver | null = null;
  private time = 0;
  private drawn = 0;
  private readonly monitors: Monitor[] = [];
  private readonly pilots: Pilot[] = [];
  private readonly embers: Ember[] = [];
  private readonly fires: Sprite[] = [];
  private beacon: Sprite | null = null;
  private sigil: Sprite | null = null;
  private beams: Sprite[] = [];
  private smoke: TilingSprite | null = null;
  private lightning: Sprite | null = null;
  private bolt: Graphics | null = null;
  private nextStrike = 6;
  private strikeAt = -10;

  constructor(host: HTMLElement) {
    this.host = host;
  }

  async start(): Promise<void> {
    const app = newApplication();
    let room: Texture;
    let window: Texture;
    try {
      [room, window] = await Promise.all([textureOf(roomUrl), textureOf(windowUrl)]);
      await app.init({
        resizeTo: this.host,
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: true,
        resolution: Math.min(globalThis.devicePixelRatio || 1, 1.5),
        preference: ['webgl', 'webgpu'],
      });
    } catch (error) {
      console.warn('The bridge stays still:', error);
      destroyApplication(app);
      return;
    }
    if (this.destroyed) {
      destroyApplication(app);
      return;
    }
    this.app = app;
    this.textures.push(room, window);
    this.world.addChild(new Sprite(room));
    this.buildWindow(window);
    this.buildMonitors();
    this.buildPilots(room);

    app.stage.addChild(this.world);
    this.host.append(app.canvas);
    this.resizing = new ResizeObserver(() => this.fit());
    this.resizing.observe(this.host);
    this.fit();
    app.ticker.maxFPS = 40;
    app.ticker.add(this.tick);
    this.host.dataset.art = 'drawn';
  }

  destroy(): void {
    this.destroyed = true;
    this.resizing?.disconnect();
    delete this.host.dataset.art;
    (this.app?.renderer.filter as unknown as { _globalFilterBindGroup?: { destroy(): void } } | undefined)?._globalFilterBindGroup?.destroy();
    if (this.app !== null) destroyApplication(this.app);
    this.app = null;
    for (const texture of this.parts) texture.destroy(false);
    this.parts.length = 0;
    for (const texture of this.textures) texture.destroy(true);
    this.textures.length = 0;
  }

  /** A part of a picture kept above, destroyed without its picture's source. */
  private part(texture: Texture): Texture {
    this.parts.push(texture);
    return texture;
  }

  private keep(texture: Texture): Texture {
    this.textures.push(texture);
    return texture;
  }

  /** The burning city through the window: smoke, fires, the sigil, the beams, lightning and embers, inside its glass. */
  private buildWindow(mask: Texture): void {
    const glow = this.keep(glowTexture());
    const outside = new Container();
    // Smoke drifting over the city
    this.smoke = new TilingSprite({ texture: this.keep(cloudTexture()), width: WINDOW.width, height: WINDOW.height });
    this.smoke.position.set(WINDOW.x, WINDOW.y);
    this.smoke.tileScale.set(2.4, 1.4);
    this.smoke.tint = 0x5a1a0a;
    this.smoke.alpha = 0.35;
    outside.addChild(this.smoke);
    // The lightning's flash over the sky, and its bolt
    this.lightning = new Sprite(Texture.WHITE);
    this.lightning.position.set(WINDOW.x, WINDOW.y);
    this.lightning.width = WINDOW.width;
    this.lightning.height = WINDOW.height * 0.7;
    this.lightning.tint = 0xff5030;
    this.lightning.blendMode = 'add';
    this.lightning.alpha = 0;
    this.bolt = new Graphics();
    this.bolt.blendMode = 'add';
    outside.addChild(this.lightning, this.bolt);
    // The fires along the lava
    for (const [x, y] of FIRES) {
      const fire = new Sprite(glow);
      fire.anchor.set(0.5);
      fire.position.set(x, y);
      fire.scale.set(1.4, 0.8);
      fire.tint = 0xff5a10;
      fire.blendMode = 'add';
      outside.addChild(fire);
      this.fires.push(fire);
    }
    // The beams, and the sigil on the cathedral
    const beam = this.keep(beamTexture());
    this.beams = BEAMS.map((x) => {
      const sprite = new Sprite(beam);
      sprite.anchor.set(0.5, 0);
      sprite.position.set(x, 0);
      sprite.scale.set(0.9, 28);
      sprite.tint = 0xff4a1a;
      sprite.blendMode = 'add';
      outside.addChild(sprite);
      return sprite;
    });
    this.sigil = new Sprite(glow);
    this.sigil.anchor.set(0.5);
    this.sigil.position.set(SIGIL.x, SIGIL.y);
    this.sigil.tint = 0xff3010;
    this.sigil.blendMode = 'add';
    outside.addChild(this.sigil);
    // Embers rising out of the city
    const ember = this.keep(emberTexture());
    for (let i = 0; i < EMBERS; i++) {
      const sprite = new Sprite(ember);
      sprite.anchor.set(0.5);
      sprite.blendMode = 'add';
      outside.addChild(sprite);
      const e = { sprite, vx: 0, vy: 0, life: 1, age: 0, phase: Math.random() * 10 };
      this.respawn(e);
      e.age = Math.random() * e.life;
      this.embers.push(e);
    }
    const glass = new Sprite(mask);
    glass.position.set(WINDOW.x, WINDOW.y);
    this.world.addChild(glass, outside);
    outside.setMask({ mask: glass, channel: 'alpha' });
  }

  private respawn(e: Ember): void {
    e.sprite.position.set(WINDOW.x + 30 + Math.random() * (WINDOW.width - 30), 420 + Math.random() * 160);
    e.vx = (Math.random() - 0.3) * 16;
    e.vy = -(20 + Math.random() * 45);
    e.life = 4 + Math.random() * 6;
    e.age = 0;
    e.sprite.scale.set(0.2 + Math.random() * 0.3);
  }

  private buildMonitors(): void {
    const glow = this.keep(glowTexture());
    MONITORS.forEach((spec, i) => {
      const monitor = new Monitor(spec, glow, 0.4 + i * 0.7 + Math.random() * 0.5);
      this.textures.push(monitor.texture);
      this.world.addChild(monitor.light, monitor.mesh);
      this.monitors.push(monitor);
    });
  }

  private buildPilots(room: Texture): void {
    const shade = this.keep(shadeTexture());
    const glow = this.keep(glowTexture());
    const pixels = room.source.width / WIDTH;
    for (const group of LAMPS) {
      group.forEach((l, index) => {
        const frame = new Rectangle((l.x - l.w / 2) * pixels, (l.y - l.h / 2) * pixels, l.w * pixels, l.h * pixels);
        const light = new Sprite(this.part(new Texture({ source: room.source, frame })));
        light.position.set(l.x - l.w / 2, l.y - l.h / 2);
        light.scale.set(1 / pixels);
        light.blendMode = 'add';
        const off = new Sprite(shade);
        off.anchor.set(0.5);
        off.position.set(l.x, l.y);
        off.width = l.w * 1.3;
        off.height = l.h * 1.3;
        const halo = new Sprite(glow);
        halo.anchor.set(0.5);
        halo.position.set(l.x, l.y);
        halo.scale.set(Math.max(l.w, l.h) / 40);
        halo.tint = 0xff8a30;
        halo.blendMode = 'add';
        this.world.addChild(off, light, halo);
        this.pilots.push({ light, shade: off, halo, mode: l.mode, period: l.period * (0.85 + Math.random() * 0.3), phase: Math.random() * 20, index, count: group.length, level: 1 });
      });
    }
    this.beacon = new Sprite(glow);
    this.beacon.anchor.set(0.5);
    this.beacon.position.set(BEACON.x, BEACON.y);
    this.beacon.tint = 0xff3a10;
    this.beacon.blendMode = 'add';
    this.world.addChild(this.beacon);
  }

  /** The picture as a cover of the screen, centred, as the screen's frames are placed over it. */
  private fit(): void {
    const width = this.host.clientWidth;
    const height = this.host.clientHeight;
    const scale = Math.max(width / WIDTH, height / HEIGHT);
    this.world.scale.set(scale);
    this.world.position.set((width - WIDTH * scale) / 2, (height - HEIGHT * scale) / 2);
  }

  /** How bright a light is now, from 0 (out) to 1; none of them flashes. */
  private pilot(p: Pilot, t: number, seconds: number): number {
    const cycle = (((t + p.phase) / p.period) % 1 + 1) % 1;
    const smooth = (v: number) => v * v * (3 - 2 * v);
    switch (p.mode) {
      case 'pulse':
        return 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(cycle * Math.PI * 2));
      case 'blink':
        // A slow warning, soft at its edges
        return 0.2 + 0.8 * smooth(Math.min(1, Math.max(0, Math.sin(cycle * Math.PI * 2) * 2.5 + 0.5)));
      case 'wave': {
        // A wave going along the group, one after another
        const at = ((t / p.period) % 1) * (p.count + 3) - 1.5;
        return 0.3 + 0.7 * Math.max(0, 1 - Math.abs(p.index - at) / 1.6);
      }
      case 'load': {
        // One after another until all are lit, a while so, then all out a moment
        const lit = ((t / p.period) % 1) * (p.count * 1.6);
        if (lit > p.count * 1.45) return 0.15;
        return 0.15 + 0.85 * smooth(Math.min(1, Math.max(0, lit - p.index)));
      }
      case 'rest':
        // On for long, going out slowly, out a while, then on again
        return cycle < 0.7 ? 1 : cycle < 0.8 ? 1 - smooth((cycle - 0.7) / 0.1) * 0.9 : cycle < 0.96 ? 0.1 : 0.1 + 0.9 * smooth((cycle - 0.96) / 0.04);
      case 'typed':
        // Now and then a key pressed: it lights and fades
        if (Math.random() < seconds / (p.period * p.count * 0.5)) p.level = 1;
        p.level = Math.max(0.35, p.level - seconds * 1.6);
        return p.level;
    }
  }

  private drawBolt(): void {
    const bolt = this.bolt!;
    bolt.clear();
    let x = WINDOW.x + 120 + Math.random() * (WINDOW.width - 160);
    let y = 0;
    bolt.moveTo(x, y);
    const end = 120 + Math.random() * 160;
    while (y < end) {
      x += (Math.random() - 0.5) * 28;
      y += 12 + Math.random() * 14;
      bolt.lineTo(x, y);
    }
    bolt.stroke({ width: 5, color: 0xff6040, alpha: 0.35 });
    bolt.stroke({ width: 1.6, color: 0xffe0c0, alpha: 1 });
  }

  private readonly tick = (ticker: Ticker): void => {
    const seconds = Math.min(ticker.deltaMS / 1000, 0.1);
    this.time += seconds;
    const t = this.time;

    // The monitors: their states every frame, their pictures some fifteen times a second
    for (const m of this.monitors) {
      m.step(t, seconds);
      m.mesh.alpha = m.brightness * (m.glitch > 0 ? 0.6 + Math.random() * 0.4 : 1) * (0.94 + 0.06 * Math.sin(t * 50));
      m.light.alpha = m.brightness * 0.35;
    }
    if (t - this.drawn >= 1 / 15) {
      const dt = t - this.drawn;
      this.drawn = t;
      for (const m of this.monitors) m.draw(t, dt);
    }

    for (const p of this.pilots) {
      const on = this.pilot(p, t, seconds);
      p.light.alpha = on * 1.1;
      p.halo.alpha = on * 0.28;
      p.shade.alpha = (1 - on) * 0.55;
    }
    this.beacon!.alpha = 0.08 + 0.14 * Math.max(0, Math.sin(t * 1.1)) ** 2;
    this.beacon!.scale.set(0.9 + 0.2 * Math.max(0, Math.sin(t * 1.1)));

    // The city: its sigil throbbing, its beams flickering, its fires, its smoke and its embers
    const throb = 0.5 + 0.5 * Math.sin(t * 1.7) * Math.sin(t * 0.43 + 1);
    this.sigil!.alpha = 0.35 + 0.55 * throb;
    this.sigil!.scale.set(0.8 + 0.35 * throb);
    this.beams.forEach((beam, i) => {
      beam.alpha = 0.35 + 0.25 * Math.sin(t * 13 + i * 2) + (Math.random() < 0.03 ? 0.4 : 0);
    });
    this.fires.forEach((fire, i) => {
      fire.alpha = 0.2 + 0.12 * Math.sin(t * 5.1 + i * 1.7) + 0.08 * Math.sin(t * 11.3 + i);
    });
    this.smoke!.tilePosition.x -= seconds * 10;
    this.smoke!.tilePosition.y -= seconds * 3;
    for (const e of this.embers) {
      e.age += seconds;
      if (e.age >= e.life) this.respawn(e);
      e.sprite.x += (e.vx + Math.sin(t * 0.9 + e.phase) * 10) * seconds;
      e.sprite.y += e.vy * seconds;
      e.sprite.alpha = Math.min(1, e.age * 1.5) * (1 - e.age / e.life) * (0.6 + 0.4 * Math.sin(t * 6 + e.phase));
    }
    // Red lightning over the city now and then
    if (t >= this.nextStrike) {
      this.strikeAt = t;
      this.nextStrike = t + 9 + Math.random() * 14;
      this.drawBolt();
    }
    const since = t - this.strikeAt;
    const light = since < 0 ? 0 : Math.exp(-since * 7) + (since > 0.12 ? 0.6 * Math.exp(-(since - 0.12) * 9) : 0);
    this.lightning!.alpha = Math.min(1, light) * 0.25;
    this.bolt!.alpha = since < 0.5 ? Math.min(1, light) : 0;
  };
}
