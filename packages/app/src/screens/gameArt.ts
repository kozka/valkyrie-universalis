// The game selection's buttons drawn with PixiJS (GameSelectionScreen.tsx): each game's frame, kozka's art
// (brand/README.md), with its picture inside, fading in from the left; a little alive while the menu is open, and more
// so under the pointer or the focus. The buttons stay HTML over the canvas, with their texts, focus and clicks, and
// without WebGL their stylesheet draws them still. Not ported from Valkyrie, whose buttons are plain text.
import { Container, Rectangle, Sprite, Texture, type Ticker, type Application } from 'pixi.js';
import d2eFrame from '../assets/game-d2e-frame.webp';
import d2ePicture from '../assets/game-d2e-picture.webp';
import doomFrame from '../assets/game-doom-frame.webp';
import doomPicture from '../assets/game-doom-picture.webp';
import momFrame from '../assets/game-mom-frame.webp';
import momPicture from '../assets/game-mom-picture.webp';
import { destroyApplication, newApplication } from '../board/pixiApps.ts';

/** A box in a frame's pixels: x, y, width and height. */
type Box = readonly [number, number, number, number];
/** A point in a picture, as fractions of its width and height. */
type Spot = readonly [number, number];

/** How a game's button is drawn. */
interface Look {
  frame: string;
  picture: string;
  /** Inside the frame's border: where the picture shows, and where the frame's panel is cut away from its ornaments. */
  inside: Box;
  /** The brightness, from 0 to 255, where the panel ends and the ornaments over it begin. */
  cut: readonly [number, number];
  /** What of the frame lights up under the pointer: pixels at least this much redder than blue, and this bright. */
  flare: readonly [number, number];
  /** The emblem on the left, which glows in the frame's colour. */
  emblem: Box;
  glow: number;
  /** The point the picture zooms into, and its light (the moon, a burning door) with its colour. */
  focus: Spot;
  light: Spot;
  lightColour: number;
  /** What floats over the picture: mist and motes over the mansion, embers over the lava, smoke over hell. */
  air: 'mist' | 'embers' | 'smoke';
  /** Whether a gleam runs along the frame when the pointer comes: gold shines, stone does not. */
  gleam: boolean;
  /** Energy cells in the frame, each of BARS bars from the bottom up, which charge; their pixels are the lit ones. */
  cells?: readonly Box[];
  /** Whether the frame's glow beats like a heart instead of flickering like fire. */
  beat?: boolean;
  /** Whether its light is cold: the frame flares where it is bluer than red, and its embers are blue sparks. */
  cold?: boolean;
}

/** How many bars an energy cell has. */
const BARS = 4;

const LOOKS: Record<string, Look> = {
  mom: {
    frame: momFrame,
    picture: momPicture,
    inside: [17, 12, 712, 127],
    cut: [34, 72],
    flare: [70, 165],
    emblem: [34, 16, 106, 108],
    glow: 0xffc65a,
    focus: [0.74, 0.55],
    light: [0.81, 0.21],
    lightColour: 0xffe2a0,
    air: 'mist',
    gleam: true,
  },
  // Descent's runestone (2 November 2026): stone and silver, its runes and crystals blue, the hall's rune gate inside
  d2e: {
    frame: d2eFrame,
    picture: d2ePicture,
    inside: [151, 55, 806, 142],
    cut: [6, 20],
    flare: [70, 110],
    emblem: [0, 22, 178, 206],
    glow: 0x4ab8ff,
    focus: [0.75, 0.38],
    light: [0.75, 0.45],
    lightColour: 0x6fd0ff,
    air: 'embers',
    gleam: true,
    cold: true,
  },
  doom: {
    frame: doomFrame,
    picture: doomPicture,
    inside: [22, 19, 611, 97],
    cut: [40, 90],
    flare: [140, 80],
    emblem: [0, 0, 150, 136],
    glow: 0xff3a10,
    focus: [0.75, 0.3],
    light: [0.776, 0.255],
    lightColour: 0xff2a10,
    air: 'smoke',
    gleam: false,
    cells: [
      [6, 53, 16, 32],
      [640, 53, 16, 32],
    ],
    beat: true,
  },
};

/** How far the drawn shadows and glows reach beyond what casts them, in a frame's pixels. */
const SPREAD = 10;
/** How many specks float over a picture at most. */
const SPECKS = 36;

interface Speck {
  sprite: Sprite;
  /** Where it is and where it goes, in fractions of the inside's height. */
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  /** Where its sway and its twinkle start. */
  phase: number;
}

interface Wisp {
  sprite: Sprite;
  /** Where it starts across the picture, from 0 to 1. */
  phase: number;
}

interface Drawn {
  button: HTMLElement;
  look: Look;
  root: Container;
  frame: Sprite;
  /** The picture and what floats over it, seen through the fade. */
  inside: Container;
  picture: Sprite;
  light: Sprite;
  mist: Wisp[];
  specks: Speck[];
  fade: Sprite;
  shadow: Sprite;
  ornaments: Sprite;
  flare: Sprite;
  emblem: Sprite;
  gleam: Sprite;
  gleamMask: Sprite;
  textures: Texture[];
  /** Parts of those textures, which share their pictures. */
  parts: Texture[];
  /** How much the pointer is over it, from 0 to 1, and how much it is pressed. */
  hover: number;
  press: number;
  over: boolean;
  /** Where the gleam has run, from 0 to 1; more when it is not running. */
  sweep: number;
  /** Embers owed, and where the pointer is over the button, as fractions. */
  owed: number;
  pointer: { x: number; y: number };
  /** The energy cells' bars, bottom first in each cell; how many are charged, from 0 to BARS; and the surge when full. */
  bars: Sprite[][];
  charge: number;
  surge: number;
}

function canvasOf(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return [canvas, canvas.getContext('2d', { willReadFrequently: true })!];
}

function textureOf(canvas: HTMLCanvasElement, mipmaps = false): Texture {
  const texture = Texture.from(canvas, true);
  if (mipmaps) texture.source.autoGenerateMipmaps = true;
  return texture;
}

function smoothstep(from: number, to: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
}

/** A grey as a tint: 1 leaves the colours as they are, less darkens them. */
function grey(level: number): number {
  const v = Math.round(Math.min(1, Math.max(0, level)) * 255);
  return (v << 16) | (v << 8) | v;
}

/** One pass of a box blur along the rows or the columns of a map of alphas; outside it counts as nothing. */
function boxBlur(source: Float32Array, width: number, height: number, radius: number, rows: boolean): Float32Array {
  const out = new Float32Array(source.length);
  const lines = rows ? height : width;
  const length = rows ? width : height;
  const step = rows ? 1 : width;
  const size = radius * 2 + 1;
  for (let line = 0; line < lines; line++) {
    const start = rows ? line * width : line;
    let sum = 0;
    for (let i = 0; i <= radius && i < length; i++) sum += source[start + i * step]!;
    for (let i = 0; i < length; i++) {
      out[start + i * step] = sum / size;
      if (i + radius + 1 < length) sum += source[start + (i + radius + 1) * step]!;
      if (i - radius >= 0) sum -= source[start + (i - radius) * step]!;
    }
  }
  return out;
}

/** A blur close to a Gaussian one: three box blurs each way. */
function blur(alpha: Float32Array, width: number, height: number, radius: number): Float32Array {
  let blurred = alpha;
  for (let pass = 0; pass < 3; pass++) blurred = boxBlur(boxBlur(blurred, width, height, radius, true), width, height, radius, false);
  return blurred;
}

/** White with these alphas, to be tinted: black for a shadow, a colour for a glow. */
function whiteOf(alpha: Float32Array, width: number, height: number, gain: number): HTMLCanvasElement {
  const [canvas, context] = canvasOf(width, height);
  const image = context.createImageData(width, height);
  for (let i = 0; i < alpha.length; i++) {
    image.data[i * 4] = 255;
    image.data[i * 4 + 1] = 255;
    image.data[i * 4 + 2] = 255;
    image.data[i * 4 + 3] = Math.min(255, alpha[i]! * gain * 255);
  }
  context.putImageData(image, 0, 0);
  return canvas;
}

/** The alphas of a box of a map, with room around it for a blur to spread. */
function padded(alpha: Float32Array, width: number, box: Box, pad: number): Float32Array {
  const [x, y, w, h] = box;
  const out = new Float32Array((w + pad * 2) * (h + pad * 2));
  for (let row = 0; row < h; row++) {
    for (let column = 0; column < w; column++) out[(row + pad) * (w + pad * 2) + column + pad] = alpha[(y + row) * width + x + column]!;
  }
  return out;
}

/** What a frame gives: itself, its ornaments without the panel between them, the shadow and glows they cast, and its
 * energy cells lit, which the frame and the ornaments keep dark. */
interface FrameParts {
  frame: HTMLCanvasElement;
  ornaments: HTMLCanvasElement;
  shadow: HTMLCanvasElement;
  flare: HTMLCanvasElement;
  emblem: HTMLCanvasElement;
  cells: HTMLCanvasElement;
}

/** Whether a pixel is in one of these boxes. */
function inBoxes(boxes: readonly Box[], x: number, y: number): boolean {
  return boxes.some(([bx, by, bw, bh]) => x >= bx && x < bx + bw && y >= by && y < by + bh);
}

/** Cuts the panel away from a frame's ornaments by brightness, inside its border. */
function cutFrame(image: CanvasImageSource & { width: number; height: number }, look: Look): FrameParts {
  const { width, height } = image;
  const [frame, context] = canvasOf(width, height);
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, width, height).data;
  const [ornaments, ornamentsContext] = canvasOf(width, height);
  const cut = ornamentsContext.createImageData(width, height);
  const [cells, cellsContext] = canvasOf(width, height);
  const lit = cellsContext.createImageData(width, height);
  const dark = context.getImageData(0, 0, width, height);
  const kept = new Float32Array(width * height);
  const bright = new Float32Array(width * height);
  const flared = new Float32Array(width * height);
  const [ix, iy, iw, ih] = look.inside;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      let r = pixels[i * 4]!;
      let g = pixels[i * 4 + 1]!;
      let b = pixels[i * 4 + 2]!;
      const a = pixels[i * 4 + 3]! / 255;
      // An energy cell: lit apart, and spent in the frame, a dull ember
      if (look.cells !== undefined && inBoxes(look.cells, x, y)) {
        lit.data.set([r, g, b, pixels[i * 4 + 3]!], i * 4);
        r = Math.round(r * 0.25);
        g = Math.round(g * 0.12);
        b = Math.round(b * 0.12);
        dark.data.set([r, g, b], i * 4);
      }
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      const inside = x >= ix && x < ix + iw && y >= iy && y < iy + ih;
      const keep = a * (inside ? smoothstep(look.cut[0], look.cut[1], luminance) : 1);
      cut.data.set([r, g, b, keep * 255], i * 4);
      kept[i] = keep;
      bright[i] = keep * (luminance / 255) ** 1.5;
      flared[i] = a * smoothstep(look.flare[0] * 0.7, look.flare[0], look.cold === true ? b - r : r - b) * smoothstep(look.flare[1] * 0.7, look.flare[1], luminance);
    }
  }
  ornamentsContext.putImageData(cut, 0, 0);
  context.putImageData(dark, 0, 0);
  cellsContext.putImageData(lit, 0, 0);
  const all: Box = [0, 0, width, height];
  const spread = (box: Box, alpha: Float32Array, radius: number) => blur(padded(alpha, width, box, SPREAD), box[2] + SPREAD * 2, box[3] + SPREAD * 2, radius);
  return {
    frame,
    ornaments,
    shadow: whiteOf(spread(all, kept, 3), width + SPREAD * 2, height + SPREAD * 2, 0.95),
    flare: whiteOf(spread(all, flared, 2), width + SPREAD * 2, height + SPREAD * 2, 1.6),
    emblem: whiteOf(spread(look.emblem, bright, 4), look.emblem[2] + SPREAD * 2, look.emblem[3] + SPREAD * 2, 1.8),
    cells,
  };
}

/** The pictures every button shares: a soft dot, a wisp of mist, a halo, the fade's ramp and the gleam's band. */
function sharedTextures(): Record<'dot' | 'mist' | 'halo' | 'ramp' | 'band', Texture> {
  const radial = (size: number, stops: [number, number][]) => {
    const [canvas, context] = canvasOf(size, size);
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    for (const [at, alpha] of stops) gradient.addColorStop(at, `rgba(255,255,255,${alpha})`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    return textureOf(canvas);
  };
  // A wisp: a few soft blobs side by side, the same every time
  const [mist, mistContext] = canvasOf(256, 96);
  for (const [x, y, r, alpha] of [
    [70, 52, 44, 0.55],
    [120, 44, 52, 0.6],
    [175, 54, 46, 0.5],
    [215, 50, 34, 0.4],
    [40, 56, 30, 0.4],
  ] as const) {
    const gradient = mistContext.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    mistContext.fillStyle = gradient;
    mistContext.fillRect(0, 0, 256, 96);
  }
  // The fade: nothing at the left, all from a little past the middle on
  const [ramp, rampContext] = canvasOf(256, 1);
  const rampImage = rampContext.createImageData(256, 1);
  for (let x = 0; x < 256; x++) rampImage.data.set([255, 255, 255, smoothstep(0, 0.55, x / 255) * 255], x * 4);
  rampContext.putImageData(rampImage, 0, 0);
  const [band, bandContext] = canvasOf(64, 4);
  const bandGradient = bandContext.createLinearGradient(0, 0, 64, 0);
  bandGradient.addColorStop(0, 'rgba(255,255,255,0)');
  bandGradient.addColorStop(0.5, 'rgba(255,255,255,1)');
  bandGradient.addColorStop(1, 'rgba(255,255,255,0)');
  bandContext.fillStyle = bandGradient;
  bandContext.fillRect(0, 0, 64, 4);
  return {
    dot: radial(32, [
      [0, 1],
      [0.35, 0.6],
      [1, 0],
    ]),
    mist: textureOf(mist),
    halo: radial(128, [
      [0, 0.9],
      [0.25, 0.45],
      [0.6, 0.12],
      [1, 0],
    ]),
    ramp: textureOf(ramp),
    band: textureOf(band),
  };
}

/** A heartbeat from 0 to 1: two thumps every 1.3 of t, lub and dub, and a rest. */
function heartbeat(t: number): number {
  const phase = t % 1.3;
  const thump = (at: number, strength: number) => strength * Math.exp(-(((phase - at) / 0.07) ** 2));
  return Math.min(1, thump(0.1, 1) + thump(0.36, 0.7));
}

async function bitmapOf(url: string): Promise<ImageBitmap> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return createImageBitmap(await response.blob());
}

export class GameArt {
  /** The element whose buttons are drawn, those with a data-look of LOOKS. */
  private readonly host: HTMLElement;
  /** The element that holds the canvas, a little bigger than the host. */
  private readonly canvasHost: HTMLElement;
  private app: Application | null = null;
  private destroyed = false;
  private readonly drawn: Drawn[] = [];
  private shared: ReturnType<typeof sharedTextures> | null = null;
  private time = 0;
  private readonly still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  private pointer: { x: number; y: number } | null = null;
  private resizing: ResizeObserver | null = null;

  constructor(host: HTMLElement, canvasHost: HTMLElement) {
    this.host = host;
    this.canvasHost = canvasHost;
  }

  /** Draws the buttons, or leaves them to their stylesheet when the browser cannot. */
  async start(): Promise<void> {
    const buttons = [...this.host.querySelectorAll<HTMLElement>('[data-look]')].filter((button) => LOOKS[button.dataset.look!] !== undefined);
    const app = newApplication();
    let pictures: [ImageBitmap, ImageBitmap][];
    try {
      pictures = await Promise.all(buttons.map((button) => Promise.all([bitmapOf(LOOKS[button.dataset.look!]!.frame), bitmapOf(LOOKS[button.dataset.look!]!.picture)])));
      await app.init({
        resizeTo: this.canvasHost,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        // Not Pixi's Canvas 2D renderer, which cannot fade the picture: the stylesheet's still version is better
        preference: ['webgl', 'webgpu'],
      });
    } catch (error) {
      console.warn('The game buttons are drawn without their effects:', error);
      destroyApplication(app);
      return;
    }
    if (this.destroyed) {
      for (const bitmap of pictures.flat()) bitmap.close();
      destroyApplication(app);
      return;
    }
    this.app = app;
    this.shared = sharedTextures();
    buttons.forEach((button, i) => {
      const [frame, picture] = pictures[i]!;
      this.drawn.push(this.make(button, LOOKS[button.dataset.look!]!, frame, picture));
      frame.close();
      picture.close();
    });
    for (const drawn of this.drawn) app.stage.addChild(drawn.root);
    this.canvasHost.append(app.canvas);
    window.addEventListener('pointermove', this.moved);
    this.resizing = new ResizeObserver(() => app.resize());
    this.resizing.observe(this.canvasHost);
    app.ticker.add(this.tick);
    // Drawn before the stylesheet's still version goes, so that nothing blinks
    this.tick(app.ticker);
    app.render();
    this.host.dataset.art = 'drawn';
  }

  destroy(): void {
    this.destroyed = true;
    window.removeEventListener('pointermove', this.moved);
    this.resizing?.disconnect();
    delete this.host.dataset.art;
    // Pixi 8.22's filters keep listening to the last texture they drew from, which the shared pool of such textures
    // destroys with the renderer, and then warn: they let go of it first
    (this.app?.renderer.filter as unknown as { _globalFilterBindGroup?: { destroy(): void } } | undefined)?._globalFilterBindGroup?.destroy();
    // The renderer before the pictures, so that none goes while it is still drawn with
    if (this.app !== null) destroyApplication(this.app);
    this.app = null;
    for (const drawn of this.drawn) for (const texture of drawn.parts) texture.destroy();
    for (const drawn of this.drawn) for (const texture of drawn.textures) texture.destroy(true);
    this.drawn.length = 0;
    if (this.shared !== null) for (const texture of Object.values(this.shared)) texture.destroy(true);
    this.shared = null;
  }

  private readonly moved = (event: PointerEvent): void => {
    this.pointer = { x: event.clientX, y: event.clientY };
  };

  private make(button: HTMLElement, look: Look, frameImage: ImageBitmap, pictureImage: ImageBitmap): Drawn {
    const shared = this.shared!;
    const parts = cutFrame(frameImage, look);
    const [pictureCanvas, pictureContext] = canvasOf(pictureImage.width, pictureImage.height);
    pictureContext.drawImage(pictureImage, 0, 0);
    const textures = {
      frame: textureOf(parts.frame, true),
      ornaments: textureOf(parts.ornaments, true),
      shadow: textureOf(parts.shadow),
      flare: textureOf(parts.flare),
      emblem: textureOf(parts.emblem),
      picture: textureOf(pictureCanvas, true),
      cells: textureOf(parts.cells),
    };
    const root = new Container();
    const frame = new Sprite(textures.frame);
    const picture = new Sprite(textures.picture);
    const light = new Sprite(shared.halo);
    light.anchor.set(0.5);
    light.blendMode = 'add';
    light.tint = look.lightColour;
    const mist: Wisp[] = [];
    const specks: Speck[] = [];
    const inside = new Container();
    inside.addChild(picture, light);
    if (look.air !== 'embers') {
      for (let i = 0; i < 5; i++) {
        const sprite = new Sprite(shared.mist);
        sprite.anchor.set(0.5);
        sprite.tint = look.air === 'smoke' ? 0x6a4a42 : 0xd8cfbb;
        mist.push({ sprite, phase: i / 5 });
        inside.addChild(sprite);
      }
    }
    for (let i = 0; i < (look.air === 'mist' ? 12 : look.air === 'embers' ? SPECKS : 0); i++) {
      const sprite = new Sprite(shared.dot);
      sprite.anchor.set(0.5);
      sprite.blendMode = 'add';
      sprite.visible = false;
      inside.addChild(sprite);
      specks.push({ sprite, x: 0, y: 0, vx: 0, vy: 0, age: 0, life: 0, size: 0, phase: 0 });
    }
    const fade = new Sprite(shared.ramp);
    inside.setMask({ mask: fade, channel: 'alpha' });
    const shadow = new Sprite(textures.shadow);
    shadow.tint = 0x000000;
    const ornaments = new Sprite(textures.ornaments);
    const flare = new Sprite(textures.flare);
    flare.blendMode = 'add';
    flare.tint = look.glow;
    const emblem = new Sprite(textures.emblem);
    emblem.blendMode = 'add';
    emblem.tint = look.glow;
    const gleam = new Sprite(shared.band);
    gleam.anchor.set(0.5);
    gleam.blendMode = 'add';
    gleam.tint = 0xfff0c8;
    const gleamMask = new Sprite(textures.ornaments);
    gleam.setMask({ mask: gleamMask, channel: 'alpha' });
    gleam.visible = look.gleam;
    // Each cell's bars, cut from its lit pixels, bottom first
    const pieces: Texture[] = [];
    const bars = (look.cells ?? []).map(([x, y, w, h]) =>
      Array.from({ length: BARS }, (_, i) => {
        const piece = new Texture({ source: textures.cells.source, frame: new Rectangle(x, y + ((BARS - 1 - i) * h) / BARS, w, h / BARS) });
        pieces.push(piece);
        const bar = new Sprite(piece);
        bar.blendMode = 'add';
        return bar;
      }),
    );
    root.addChild(frame, inside, fade, shadow, ornaments, flare, emblem, gleamMask, gleam, ...bars.flat());
    return {
      button,
      look,
      root,
      frame,
      inside,
      picture,
      light,
      mist,
      specks,
      fade,
      shadow,
      ornaments,
      flare,
      emblem,
      gleam,
      gleamMask,
      textures: Object.values(textures),
      parts: pieces,
      hover: 0,
      press: 0,
      over: false,
      sweep: 1,
      owed: 0,
      pointer: { x: 0.5, y: 0.5 },
      bars,
      charge: 0,
      surge: 0,
    };
  }

  private readonly tick = (ticker: Ticker): void => {
    const seconds = Math.min(ticker.deltaMS / 1000, 0.1);
    this.time += seconds;
    const host = this.canvasHost.getBoundingClientRect();
    for (const drawn of this.drawn) this.place(drawn, host, seconds);
    // Every frame while something answers the pointer; otherwise fewer, for the battery
    const busy = this.drawn.some((d) => d.over || d.hover > 0.002 || d.press > 0.002 || d.sweep < 1);
    ticker.maxFPS = busy ? 0 : this.still ? 10 : 30;
  };

  /** Puts a button's drawing where the button is, and moves what moves. */
  private place(d: Drawn, host: DOMRect, seconds: number): void {
    const box = d.button.getBoundingClientRect();
    d.root.visible = box.width > 0 && box.height > 0;
    if (!d.root.visible) return;
    const look = d.look;
    const still = this.still;
    const t = this.time;
    const w = box.width;
    const h = box.height;
    const fw = d.frame.texture.width;
    const fh = d.frame.texture.height;
    const sx = w / fw;
    const sy = h / fh;

    // Under the pointer or the focus: it comes up quickly and goes slowly
    const over = d.button.matches(':hover, :focus-visible');
    const pressed = d.button.matches(':active:not(:disabled)');
    d.hover += ((over ? 1 : 0) - d.hover) * (1 - Math.exp(-seconds * (over ? 7 : 3.5)));
    d.press += ((pressed ? 1 : 0) - d.press) * (1 - Math.exp(-seconds * 18));
    if (over && !d.over && !still) {
      d.sweep = 0;
      d.owed += look.air === 'embers' ? 10 : 0;
    }
    d.over = over;
    if (this.pointer !== null && over) {
      const px = Math.min(1, Math.max(0, (this.pointer.x - box.left) / w));
      const py = Math.min(1, Math.max(0, (this.pointer.y - box.top) / h));
      d.pointer.x += (px - d.pointer.x) * (1 - Math.exp(-seconds * 4));
      d.pointer.y += (py - d.pointer.y) * (1 - Math.exp(-seconds * 4));
    }
    const hover = d.hover;

    // Pressed, it sinks a little
    const scale = 1 - 0.015 * d.press;
    d.root.pivot.set(w / 2, h / 2);
    const jolt = still ? 0 : d.surge * d.surge * 2.5;
    d.root.position.set(box.left - host.left + w / 2 + (Math.random() - 0.5) * jolt, box.top - host.top + h / 2 + (Math.random() - 0.5) * jolt);
    d.root.scale.set(scale);
    d.frame.setSize(w, h);
    d.ornaments.setSize(w, h);
    d.gleamMask.setSize(w, h);
    d.shadow.position.set(-SPREAD * sx, -SPREAD * sy);
    d.shadow.setSize((fw + SPREAD * 2) * sx, (fh + SPREAD * 2) * sy);
    d.flare.position.set(-SPREAD * sx, -SPREAD * sy);
    d.flare.setSize((fw + SPREAD * 2) * sx, (fh + SPREAD * 2) * sy);
    const [ex, ey, ew, eh] = look.emblem;
    d.emblem.position.set((ex - SPREAD) * sx, (ey - SPREAD) * sy);
    d.emblem.setSize((ew + SPREAD * 2) * sx, (eh + SPREAD * 2) * sy);

    // The picture, as tall as the inside and against its right, breathing slowly and zooming in under the pointer
    const [ix, iy, iw, ih] = look.inside;
    const left = ix * sx;
    const top = iy * sy;
    const right = (ix + iw) * sx;
    const height = ih * sy;
    const pw = d.picture.texture.width;
    const ph = d.picture.texture.height;
    const fit = height / ph;
    const [fx, fy] = look.focus;
    const breath = still ? 0 : 0.5 - 0.5 * Math.cos((t * 2 * Math.PI) / 18);
    const zoom = 1.06 + 0.03 * breath + (still ? 0 : 0.08 * hover);
    const k = fit * zoom;
    const pull = still ? 0 : hover;
    const shiftX = (d.pointer.x - 0.5) * -0.02 * w * pull;
    const shiftY = (d.pointer.y - 0.5) * -0.05 * h * pull;
    const pictureX = right - (1 - fx) * pw * fit - fx * pw * k + shiftX;
    const pictureY = top + fy * ph * fit - fy * ph * k + shiftY;
    d.picture.scale.set(k);
    d.picture.position.set(pictureX, pictureY);
    d.picture.tint = grey(0.7 + 0.3 * hover);

    // The fade: from the picture's left, reaching further in under the pointer
    const width = pw * fit;
    const start = Math.max(left, pictureX, right - width + width * (0.02 - 0.22 * hover));
    d.fade.position.set(start, top);
    d.fade.setSize(right - start, height);

    // Its light, breathing
    const [lx, ly] = look.light;
    const flicker = look.air === 'embers' ? 0.8 + 0.12 * Math.sin(t * 7.3) + 0.08 * Math.sin(t * 13.1) : 0.88 + 0.12 * Math.sin(t * 1.7);
    d.light.position.set(pictureX + lx * pw * k, pictureY + ly * ph * k);
    d.light.setSize(height * (look.air === 'embers' ? 1.3 : look.air === 'smoke' ? 0.45 : 0.9));
    d.light.alpha = (0.3 + 0.55 * hover) * (still ? 1 : flicker);

    this.air(d, { left: start, top, right, height }, seconds, hover);

    // The frame: its ornaments' shadow over the picture, a little darker until the pointer comes, then lit
    d.ornaments.tint = grey(0.9 + 0.1 * hover);
    d.frame.tint = grey(0.9 + 0.1 * hover);
    // A heart beats twice and rests: the frame's lava throbs with it, harder under the pointer
    const pulse = look.beat === true && !still ? heartbeat(t * (1 + 0.6 * hover)) : 0;
    const surge = still ? 0 : d.surge;
    if (look.beat === true) d.flare.alpha = 0.2 + 0.35 * hover + (0.25 + 0.2 * hover) * pulse + 0.8 * surge;
    else d.flare.alpha = (look.air === 'embers' ? 0.25 + 0.55 * hover : 0.45 * hover) * (still ? 1 : flicker);
    d.emblem.alpha = (still ? 0.25 : 0.15 + 0.1 * breath + 0.15 * pulse) + 0.55 * hover * (still ? 1 : 0.85 + 0.15 * Math.sin(t * 3)) + surge;

    this.cells(d, seconds, over, still, sx, sy);

    // The gleam along the gold, once each time the pointer comes
    d.sweep += seconds / 0.9;
    d.gleam.visible = look.gleam && d.sweep < 1;
    if (d.gleam.visible) {
      d.gleam.position.set(-0.15 * w + d.sweep * 1.3 * w, h / 2);
      d.gleam.rotation = 0.5;
      d.gleam.setSize(Math.max(24, 0.07 * w), h * 2.4);
      d.gleam.alpha = Math.sin(Math.PI * d.sweep) * 0.9;
    }
  }

  /**
   * The energy cells: idle, they charge a bar at a time, hold and drain; under the pointer they fill at once and, full,
   * the button surges. Without the import they stay spent.
   */
  private cells(d: Drawn, seconds: number, over: boolean, still: boolean, sx: number, sy: number): void {
    if (d.bars.length === 0) return;
    d.bars.forEach((cell, c) => {
      const [x, y, w, h] = d.look.cells![c]!;
      cell.forEach((bar, i) => {
        bar.position.set(x * sx, (y + ((BARS - 1 - i) * h) / BARS) * sy);
        bar.setSize(w * sx, (h / BARS) * sy);
      });
    });
    const t = this.time;
    if (still) d.charge = BARS;
    else if (over) {
      const was = d.charge;
      d.charge = Math.min(BARS, d.charge + seconds * 9);
      if (was < BARS && d.charge >= BARS) d.surge = 1;
    } else {
      // A cycle of 4.8 s: a bar every 0.55 s, full for a while, then spent quickly
      const cycle = t % 4.8;
      const target = cycle < 2.2 ? Math.floor(cycle / 0.55) + 1 : cycle < 3.8 ? BARS : 0;
      d.charge += (Math.min(BARS, target) - d.charge) * (1 - Math.exp(-seconds * (target === 0 ? 6 : 14)));
    }
    d.surge = Math.max(0, d.surge - seconds * 2.2);
    const full = d.charge >= BARS - 0.01;
    for (const cell of d.bars) {
      cell.forEach((bar, i) => {
        const level = Math.min(1, Math.max(0, d.charge - i));
        const hum = still ? 1 : full ? 0.82 + 0.18 * Math.sin(t * (over ? 22 : 9) + i * 0.7) : 0.9 + 0.1 * Math.sin(t * 31 + i);
        bar.alpha = level * hum + d.surge * 0.6 + 0.6 * d.press;
      });
    }
  }

  /** The mist and the motes over the mansion, or the embers over the lava. */
  private air(d: Drawn, area: { left: number; top: number; right: number; height: number }, seconds: number, hover: number): void {
    const width = area.right - area.left;
    const { top, height } = area;
    const t = this.time;
    if (this.still) {
      for (const wisp of d.mist) wisp.sprite.visible = false;
      for (const speck of d.specks) speck.sprite.visible = false;
      return;
    }
    // Mist drifting left along the bottom, coming back at the right; over hell, thick smoke rising from below
    const smoke = d.look.air === 'smoke';
    d.mist.forEach(({ sprite, phase }, i) => {
      const u = ((((phase - t * (smoke ? 0.008 + 0.003 * i : 0.012 + 0.004 * i)) % 1.4) + 1.4) % 1.4) - 0.2;
      sprite.position.set(area.left + u * width, top + height * ((smoke ? 0.8 : 0.62) + 0.09 * Math.sin(i * 2.1 + t * 0.2)));
      sprite.setSize(height * (1.5 + 0.3 * (i % 3)), height * (smoke ? 0.8 : 0.55));
      sprite.alpha = ((smoke ? 0.3 : 0.1) + 0.12 * hover) * Math.sin((Math.PI * (u + 0.2)) / 1.4);
      sprite.visible = true;
    });

    const embers = d.look.air === 'embers';
    // Embers keep rising from the lava; motes drift slowly in the moonlight, most under the pointer
    d.owed += seconds * (embers ? 3 + 14 * hover : 4);
    for (const speck of d.specks) {
      if (speck.age >= speck.life && d.owed >= 1) {
        d.owed -= 1;
        speck.age = 0;
        speck.phase = Math.random() * Math.PI * 2;
        speck.x = 0.05 + Math.random() * 0.95;
        if (embers) {
          speck.y = 0.92 + Math.random() * 0.08;
          speck.vx = (Math.random() - 0.5) * 0.08;
          speck.vy = -(0.28 + Math.random() * 0.4);
          speck.life = 1.2 + Math.random() * 1.4;
          speck.size = 0.025 + Math.random() * 0.03;
        } else {
          speck.y = 0.2 + Math.random() * 0.7;
          speck.vx = (Math.random() - 0.5) * 0.02;
          speck.vy = -(0.02 + Math.random() * 0.05);
          speck.life = 3 + Math.random() * 3;
          speck.size = 0.018 + Math.random() * 0.02;
        }
      }
      const alive = speck.age < speck.life;
      speck.sprite.visible = alive;
      if (!alive) continue;
      speck.age += seconds;
      const life = speck.age / speck.life;
      speck.x += (speck.vx + Math.sin(t * 3 + speck.phase) * (embers ? 0.04 : 0.01)) * seconds * (height / width);
      speck.y += speck.vy * seconds;
      speck.sprite.position.set(area.left + speck.x * width, top + speck.y * height);
      speck.sprite.setSize(speck.size * height * (embers ? 1 - 0.5 * life : 1));
      const glow = Math.sin(Math.PI * Math.min(1, life));
      if (embers) {
        speck.sprite.tint = d.look.cold === true ? (life < 0.4 ? 0xe8f8ff : life < 0.75 ? 0x8fd4ff : 0x3a9cff) : life < 0.4 ? 0xffd27a : life < 0.75 ? 0xff8a3a : 0xff3b1a;
        speck.sprite.alpha = glow;
      } else {
        speck.sprite.tint = 0xffe7b0;
        speck.sprite.alpha = glow * (0.3 + 0.7 * hover) * (0.6 + 0.4 * Math.sin(t * 5 + speck.phase));
      }
    }
    d.owed = Math.min(d.owed, 12);
  }
}
