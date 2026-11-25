// The room behind Mansions' investigator selection in the Universalis theme (HeroRoom.tsx): kozka's study
// (brand/hero-room/), drawn with PixiJS so that it lives. The candles burn, each flame its own, with a warm glow on
// the wall that breathes with them; behind the window a storm: low clouds driving by, rain slanting down, and now and
// then lightning, a bolt in the sky and its flash in the room. The picture fills the screen as a cover; the screen's
// frames sit over it (HeroRoom.tsx). Not ported from Valkyrie.
import { BlurFilter, Container, Graphics, Sprite, Texture, TilingSprite, type Ticker, type Application } from 'pixi.js';
import roomUrl from '../../assets/hero-room.webp';
import litUrl from '../../assets/hero-room-lit.webp';
import glassUrl from '../../assets/hero-room-glass.webp';
import { ownStorm, thunders } from '../../audio/menuAmbience.ts';
import { textureOf } from '../../screens/menuArt.ts';
import { destroyApplication, newApplication } from '../../board/pixiApps.ts';
import { CandleFlames, glowTexture, painted, wobble } from './candles.ts';

/** The picture's size. */
const WIDTH = 1536;
const HEIGHT = 1024;

/** Where the window's glass mask sits in the picture (hero-room-glass.webp is cut to it), and its size. */
const GLASS = { x: 1323, y: 13, width: 181, height: 464 } as const;

/** Each candle: the middle of its top and where its wax ends, in the picture, and how big its flame is. */
const CANDLES = [
  { x: 44.5, top: 315, size: 1 },
  { x: 89, top: 377, size: 0.95 },
  { x: 126, top: 337, size: 1 },
  { x: 154.5, top: 398, size: 0.95 },
  { x: 1264, top: 427, size: 0.9 },
  { x: 1296, top: 457, size: 0.85 },
  { x: 1330, top: 387, size: 0.95 },
  { x: 1491, top: 387, size: 0.95 },
  { x: 1514, top: 417, size: 0.9 },
] as const;

/** How many raindrops fall behind the glass, and how many drops sit on it. */
const DROPS = 140;
const BEADS = 26;

interface Drop {
  sprite: Sprite;
  speed: number;
}

interface Bead {
  sprite: Sprite;
  /** How fast it slides now, in pixels a second, and how long it rests before it slides again. */
  speed: number;
  rest: number;
}

/** The light map's width: drawn small and stretched to the picture, as light is soft anyway. */
const LIGHT_MAP_WIDTH = 384;

/**
 * Where the candles light the room: a warm pool round each group, stronger close to each flame, fading into the dark;
 * as alpha, for a mask over the room as painted.
 */
function lightMapTexture(): Texture {
  const scale = LIGHT_MAP_WIDTH / WIDTH;
  return painted(LIGHT_MAP_WIDTH, Math.round(HEIGHT * scale), (c) => {
    const pool = (x: number, y: number, radius: number, strength: number) => {
      const g = c.createRadialGradient(x * scale, y * scale, 0, x * scale, y * scale, radius * scale);
      g.addColorStop(0, `rgba(255,255,255,${strength})`);
      g.addColorStop(0.45, `rgba(255,255,255,${strength * 0.45})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, LIGHT_MAP_WIDTH, HEIGHT * scale);
    };
    c.globalCompositeOperation = 'lighter';
    // Each group of candles, then each flame
    pool(100, 380, 330, 0.55);
    pool(1300, 440, 260, 0.45);
    pool(1500, 420, 240, 0.45);
    for (const { x, top } of CANDLES) pool(x, top - 10, 110, 0.4);
  });
}

/** The night behind the glass: a storm sky, darker above. */
function skyTexture(): Texture {
  return painted(4, 256, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#05080d');
    g.addColorStop(0.55, '#121a26');
    g.addColorStop(1, '#1d2633');
    c.fillStyle = g;
    c.fillRect(0, 0, 4, 256);
  });
}

/** The sky lit by lightning: brightest high up, where the bolt starts. */
function flashTexture(): Texture {
  return painted(4, 256, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0.2)');
    c.fillStyle = g;
    c.fillRect(0, 0, 4, 256);
  });
}

/** A streak of rain, brightest in its middle. */
function dropTexture(): Texture {
  return painted(2, 48, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 48);
    g.addColorStop(0, 'rgba(210,225,255,0)');
    g.addColorStop(0.6, 'rgba(210,225,255,0.85)');
    g.addColorStop(1, 'rgba(210,225,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 2, 48);
  });
}

/** Storm clouds: grey billows that tile, lighter where they are thick, a few octaves of smooth noise. */
export function cloudTexture(): Texture {
  const size = 256;
  // A grid of random heights per octave, wrapping, smoothly interpolated
  const octave = (cells: number, seed: number) => {
    const grid = Array.from({ length: cells * cells }, (_, i) => {
      const s = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
      return s - Math.floor(s);
    });
    return (x: number, y: number) => {
      const gx = (x / size) * cells;
      const gy = (y / size) * cells;
      const x0 = Math.floor(gx);
      const y0 = Math.floor(gy);
      const fx = gx - x0;
      const fy = gy - y0;
      const sx = fx * fx * (3 - 2 * fx);
      const sy = fy * fy * (3 - 2 * fy);
      const v = (cx: number, cy: number) => grid[((cy % cells) * cells + (cx % cells)) % grid.length]!;
      const top = v(x0, y0) + (v(x0 + 1, y0) - v(x0, y0)) * sx;
      const bottom = v(x0, y0 + 1) + (v(x0 + 1, y0 + 1) - v(x0, y0 + 1)) * sx;
      return top + (bottom - top) * sy;
    };
  };
  const octaves = [octave(4, 1), octave(8, 2), octave(16, 3), octave(32, 4)];
  return painted(size, size, (c) => {
    const image = c.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const n = octaves.reduce((sum, f, i) => sum + f(x, y) / 2 ** i, 0) / 1.875;
        const cloud = Math.min(1, Math.max(0, (n - 0.38) * 2.2));
        const at = (y * size + x) * 4;
        image.data[at] = image.data[at + 1] = image.data[at + 2] = 255;
        image.data[at + 3] = Math.round(cloud * 255);
      }
    }
    c.putImageData(image, 0, 0);
  });
}

/** A drop of water on the glass: a small bright bead with a darker rim. */
function beadTexture(): Texture {
  return painted(16, 16, (c) => {
    const g = c.createRadialGradient(7, 6, 0, 8, 8, 8);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(0.35, 'rgba(200,215,240,0.5)');
    g.addColorStop(0.8, 'rgba(20,30,45,0.45)');
    g.addColorStop(1, 'rgba(20,30,45,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 16, 16);
  });
}

export class HeroRoomArt {
  private readonly host: HTMLElement;
  private app: Application | null = null;
  private destroyed = false;
  private readonly textures: Texture[] = [];
  private readonly filters: BlurFilter[] = [];
  private readonly world = new Container();
  private readonly drops: Drop[] = [];
  private readonly beads: Bead[] = [];
  private clouds: TilingSprite | null = null;
  private flash: Sprite | null = null;
  private roomFlash: Sprite | null = null;
  /** The room as painted, seen where the candles light it, and all of it when lightning strikes. */
  private candleLight: Sprite | null = null;
  private lightningLight: Sprite | null = null;
  private bolt: Graphics | null = null;
  private resizing: ResizeObserver | null = null;
  private time = 0;
  /** When the next storm light comes, and the strikes of the one going on: their times, from its start. */
  private nextStrike = 4;
  private strikeAt = -10;
  private strikes: number[] = [];
  private candles: CandleFlames | null = null;

  constructor(host: HTMLElement) {
    this.host = host;
    // The storm here is this room's: the menu's sound leaves its own lightnings out meanwhile
    ownStorm(true);
  }

  async start(): Promise<void> {
    const app = newApplication();
    let room: Texture;
    let lit: Texture;
    let glass: Texture;
    try {
      [room, lit, glass] = await Promise.all([textureOf(roomUrl), textureOf(litUrl), textureOf(glassUrl)]);
      await app.init({
        resizeTo: this.host,
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 1.5),
        preference: ['webgl', 'webgpu'],
      });
    } catch (error) {
      console.warn('The room stays still:', error);
      destroyApplication(app);
      return;
    }
    if (this.destroyed) {
      destroyApplication(app);
      return;
    }
    this.app = app;
    this.textures.push(room, lit, glass);
    // The room in the dark, as kozka wants it (17 October 2026); the candles light what is near them, showing the
    // picture as it was painted there, and the lightning all of it for an instant
    this.world.addChild(new Sprite(room));
    this.candleLight = new Sprite(lit);
    const lightMap = new Sprite(this.keep(lightMapTexture()));
    lightMap.scale.set(WIDTH / LIGHT_MAP_WIDTH);
    this.world.addChild(lightMap, this.candleLight);
    this.candleLight.setMask({ mask: lightMap, channel: 'alpha' });
    this.lightningLight = new Sprite(lit);
    this.lightningLight.tint = 0xc4d0ff;
    this.lightningLight.alpha = 0;
    this.world.addChild(this.lightningLight);
    this.buildStorm(glass);
    this.candles = new CandleFlames(this.world, CANDLES);
    this.textures.push(...this.candles.textures);
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
    if (!this.destroyed) ownStorm(false);
    this.destroyed = true;
    this.resizing?.disconnect();
    delete this.host.dataset.art;
    (this.app?.renderer.filter as unknown as { _globalFilterBindGroup?: { destroy(): void } } | undefined)?._globalFilterBindGroup?.destroy();
    for (const filter of this.filters) filter.destroy();
    this.filters.length = 0;
    if (this.app !== null) destroyApplication(this.app);
    this.app = null;
    for (const texture of this.textures) texture.destroy(true);
    this.textures.length = 0;
  }

  /** The window: the night, its clouds, the rain and the lightning, seen only through the glass. */
  private buildStorm(glass: Texture): void {
    const storm = new Container();
    storm.position.set(GLASS.x, GLASS.y);
    const sky = new Sprite(this.keep(skyTexture()));
    sky.width = GLASS.width;
    sky.height = GLASS.height;
    storm.addChild(sky);

    // The sky lit by the lightning, behind the clouds
    this.flash = new Sprite(this.keep(flashTexture()));
    this.flash.width = GLASS.width;
    this.flash.height = GLASS.height;
    this.flash.tint = 0xb9c8ff;
    this.flash.alpha = 0;
    storm.addChild(this.flash);

    // Low clouds driving by, dark until the lightning lights them
    this.clouds = new TilingSprite({ texture: this.keep(cloudTexture()), width: GLASS.width, height: GLASS.height });
    this.clouds.tileScale.set(1.4, 0.9);
    this.clouds.tint = 0x2a3240;
    this.clouds.alpha = 0.8;
    storm.addChild(this.clouds);

    // The bolt, a jagged line with its glow, in front of the clouds, drawn again at each strike
    this.bolt = new Graphics();
    this.bolt.blendMode = 'add';
    const blur = new BlurFilter({ strength: 1.5, quality: 2 });
    this.filters.push(blur);
    this.bolt.filters = [blur];
    storm.addChild(this.bolt);

    // The rain, slanting a little
    const drop = this.keep(dropTexture());
    for (let i = 0; i < DROPS; i++) {
      const sprite = new Sprite(drop);
      sprite.anchor.set(0.5);
      sprite.rotation = 0.18;
      const near = Math.random();
      sprite.scale.set(0.6 + near * 0.6, 0.5 + near * 0.9);
      sprite.alpha = 0.18 + near * 0.32;
      sprite.position.set(Math.random() * (GLASS.width + 80) - 20, Math.random() * GLASS.height);
      storm.addChild(sprite);
      this.drops.push({ sprite, speed: 380 + near * 420 });
    }

    // Drops on the glass, sliding down now and then
    const bead = this.keep(beadTexture());
    for (let i = 0; i < BEADS; i++) {
      const sprite = new Sprite(bead);
      sprite.anchor.set(0.5);
      sprite.scale.set(0.25 + Math.random() * 0.35);
      sprite.position.set(Math.random() * GLASS.width, Math.random() * GLASS.height);
      sprite.alpha = 0.35;
      storm.addChild(sprite);
      this.beads.push({ sprite, speed: 0, rest: Math.random() * 6 });
    }

    // The old glass still shows a little of itself
    storm.alpha = 0.93;
    const mask = new Sprite(glass);
    mask.position.set(GLASS.x, GLASS.y);
    this.world.addChild(mask);
    storm.setMask({ mask, channel: 'alpha' });
    this.world.addChild(storm);

    // The lightning's flash in the room, from the window
    this.roomFlash = new Sprite(this.keep(glowTexture()));
    this.roomFlash.anchor.set(0.5);
    this.roomFlash.position.set(GLASS.x + GLASS.width / 2, GLASS.y + GLASS.height * 0.55);
    this.roomFlash.scale.set(14, 12);
    this.roomFlash.tint = 0xaabbff;
    this.roomFlash.blendMode = 'add';
    this.roomFlash.alpha = 0;
    this.world.addChild(this.roomFlash);
  }

  private keep(texture: Texture): Texture {
    this.textures.push(texture);
    return texture;
  }

  /** The picture as a cover of the screen, centred. */
  private fit(): void {
    const width = this.host.clientWidth;
    const height = this.host.clientHeight;
    const scale = Math.max(width / WIDTH, height / HEIGHT);
    this.world.scale.set(scale);
    this.world.position.set((width - WIDTH * scale) / 2, (height - HEIGHT * scale) / 2);
  }

  /** A bolt from the top of the window down, forking once, as a path of jagged steps. */
  private drawBolt(): void {
    const bolt = this.bolt!;
    bolt.clear();
    const line = (x: number, y: number, length: number, steps: number): [number, number][] => {
      const points: [number, number][] = [[x, y]];
      for (let i = 1; i <= steps; i++) {
        x += (Math.random() - 0.5) * 26;
        y += length / steps;
        points.push([x, y]);
      }
      return points;
    };
    const main = line(GLASS.width * (0.25 + Math.random() * 0.5), -10, GLASS.height * (0.55 + Math.random() * 0.3), 14);
    const at = main[5 + Math.floor(Math.random() * 4)]!;
    const fork = line(at[0], at[1], GLASS.height * 0.25, 6);
    for (const [path, width] of [
      [main, 1],
      [fork, 0.6],
    ] as const) {
      bolt.moveTo(path[0]![0], path[0]![1]);
      for (const [x, y] of path.slice(1)) bolt.lineTo(x, y);
      bolt.stroke({ width: 7 * width, color: 0x8fa8ff, alpha: 0.35 });
      bolt.moveTo(path[0]![0], path[0]![1]);
      for (const [x, y] of path.slice(1)) bolt.lineTo(x, y);
      bolt.stroke({ width: 2 * width, color: 0xffffff, alpha: 1 });
    }
  }

  private readonly tick = (ticker: Ticker): void => {
    const seconds = Math.min(ticker.deltaMS / 1000, 0.1);
    this.time += seconds;
    const t = this.time;

    this.candles!.update(t, seconds);
    // The candles' light on the room breathes with their flames
    this.candleLight!.alpha = 0.88 + 0.06 * wobble(t * 0.8, 1.3) + 0.04 * this.candles!.gust;

    // The storm: clouds and rain
    this.clouds!.tilePosition.x -= seconds * 22;
    this.clouds!.tilePosition.y = Math.sin(t * 0.05) * 20;
    for (const drop of this.drops) {
      const { sprite, speed } = drop;
      sprite.y += speed * seconds;
      sprite.x -= speed * seconds * 0.18;
      if (sprite.y > GLASS.height + 30) {
        sprite.y = -30 - Math.random() * 40;
        sprite.x = Math.random() * (GLASS.width + 80) - 20;
      }
    }

    for (const bead of this.beads) {
      if (bead.rest > 0) {
        bead.rest -= seconds;
        if (bead.rest <= 0) bead.speed = 25 + Math.random() * 60;
        continue;
      }
      bead.sprite.y += bead.speed * seconds;
      bead.sprite.x += Math.sin(t * 3 + bead.sprite.y * 0.05) * 0.15;
      // It stops on the way, or runs off the bottom and another forms at the top
      if (Math.random() < seconds * 0.6) bead.rest = 1 + Math.random() * 5;
      if (bead.sprite.y > GLASS.height + 10) {
        bead.sprite.position.set(Math.random() * GLASS.width, Math.random() * GLASS.height * 0.4);
        bead.rest = 1 + Math.random() * 4;
      }
    }

    // Lightning: a few strikes close together, then a long wait
    if (t >= this.nextStrike) {
      this.strikeAt = t;
      this.strikes = [0, 0.09 + Math.random() * 0.08, ...(Math.random() < 0.5 ? [0.32 + Math.random() * 0.2] : [])];
      this.nextStrike = t + 7 + Math.random() * 11;
      this.drawBolt();
      // Its thunder, from the menu's sound, which goes on in this room (audio/menuAmbience.ts)
      thunders('mid');
    }
    const since = t - this.strikeAt;
    let light = 0;
    for (const at of this.strikes) {
      const d = since - at;
      if (d >= 0) light = Math.max(light, Math.exp(-d * 9) * (d < 0.04 ? d / 0.04 : 1));
    }
    this.flash!.alpha = light * 0.7;
    // The clouds go from their night colour to the lightning's, with the light
    const mix = (dark: number, lit: number) => Math.round(dark + (lit - dark) * Math.min(1, light * 1.4));
    this.clouds!.tint = (mix(0x2a, 0x9a) << 16) | (mix(0x32, 0xa6) << 8) | mix(0x40, 0xc4);
    this.bolt!.alpha = since < 0.6 ? light : 0;
    this.roomFlash!.alpha = light * 0.12;
    this.lightningLight!.alpha = light * 0.75;
  };
}
