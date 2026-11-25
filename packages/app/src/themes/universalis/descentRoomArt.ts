// The hall behind Descent's hero selection in the Universalis theme (DescentHeroRoom.tsx), "Dwarven Runestone"
// (2 November 2026): kozka's dwarven hall (brand/d2e-hero-room/), drawn with PixiJS so that it lives. The two braziers
// burn with blue fire (blueFire.ts), breathing light on the stone; the runes on the columns pulse; the
// banners sway in a draught from the arch; lanterns and candles flicker; cold motes of light drift up and a mist creeps
// along the floor. The room is dark, lit only where its lights reach (the lit picture through a map of their pools), as
// Mansions' study is. The picture fills the screen as a cover. Not ported from Valkyrie.
import { BlurFilter, Container, MeshPlane, Sprite, Texture, TilingSprite, type Application, type Ticker } from 'pixi.js';
import roomUrl from '../../assets/d2e-heroes-room.webp';
import litUrl from '../../assets/d2e-heroes-room-lit.webp';
import runesLeftUrl from '../../assets/d2e-heroes-runes-left.webp';
import runesRightUrl from '../../assets/d2e-heroes-runes-right.webp';
import bannerLeftUrl from '../../assets/d2e-heroes-banner-left.webp';
import bannerRightUrl from '../../assets/d2e-heroes-banner-right.webp';
import { textureOf } from '../../screens/menuArt.ts';
import { BlueFire } from './blueFire.ts';
import { destroyApplication, newApplication } from '../../board/pixiApps.ts';
import { CandleFlames, glowTexture, painted, wobble } from './candles.ts';
import { cloudTexture } from './heroRoomArt.ts';

/** The picture's size. */
const WIDTH = 1672;
const HEIGHT = 941;

/** Each layer's corner in the picture (make_pieces.py cut them there). */
/** The braziers' fires: the middle of each bowl's rim, and how tall and wide each burns. */
const FLAMES = [
  { base: { x: 376, y: 438 }, height: 150, width: 95, phase: 0 },
  { base: { x: 1352, y: 504 }, height: 125, width: 75, phase: 2.4 },
] as const;
const RUNES = [
  { url: runesLeftUrl, x: 240, y: 5, phase: 0 },
  { url: runesRightUrl, x: 1269, y: 159, phase: 1.9 },
] as const;
const BANNERS = [
  { url: bannerLeftUrl, x: 123, y: 72, phase: 0 },
  { url: bannerRightUrl, x: 1401, y: 229, phase: 1.3 },
] as const;

/** The lanterns, which flicker blue. */
const LANTERNS = [
  { x: 1300, y: 94 },
  { x: 1439, y: 136 },
] as const;

/** The candles, small and warm: the middle of each flame's foot, and its size. */
const CANDLES = [
  { x: 25, top: 186, size: 0.5 },
  { x: 44, top: 203, size: 0.42 },
  { x: 221, top: 290, size: 0.42 },
  { x: 232, top: 298, size: 0.36 },
  { x: 62, top: 515, size: 0.45 },
  { x: 44, top: 528, size: 0.36 },
  { x: 479, top: 620, size: 0.34 },
  { x: 491, top: 626, size: 0.3 },
  { x: 1281, top: 657, size: 0.34 },
  { x: 1291, top: 653, size: 0.3 },
] as const;

/** Where the room's light falls: x, y, radius and strength (the still picture is lit by the same, make_pieces.py). */
const POOLS = [
  [285, 190, 180, 0.55],
  [1307, 320, 190, 0.55],
  [1300, 94, 150, 0.55],
  [1439, 136, 150, 0.5],
  [1530, 110, 260, 0.45],
  [40, 205, 120, 0.55],
  [225, 300, 90, 0.45],
  [55, 525, 110, 0.5],
  [485, 628, 80, 0.4],
  [1286, 662, 80, 0.4],
  [390, 560, 90, 0.35],
  [1368, 597, 80, 0.35],
] as const;
/** The braziers' own pools, which follow their fires. */
const BRAZIER_POOLS = [
  [375, 400, 300, 0.9],
  [1352, 470, 260, 0.85],
] as const;

const LIGHT_MAP_WIDTH = 418;
const MOTES = 40;

interface Mote {
  sprite: Sprite;
  vx: number;
  vy: number;
  life: number;
  age: number;
  phase: number;
}

interface Bending {
  mesh: MeshPlane;
  rest: Float32Array;
  height: number;
  phase: number;
}

/** A light map: soft white pools on transparent, as alpha, for a mask over the room as painted. */
function lightMap(pools: readonly (readonly [number, number, number, number])[]): Texture {
  const scale = LIGHT_MAP_WIDTH / WIDTH;
  return painted(LIGHT_MAP_WIDTH, Math.round(HEIGHT * scale), (c) => {
    c.globalCompositeOperation = 'lighter';
    for (const [x, y, radius, strength] of pools) {
      const g = c.createRadialGradient(x * scale, y * scale, 0, x * scale, y * scale, radius * scale);
      g.addColorStop(0, `rgba(255,255,255,${strength})`);
      g.addColorStop(0.45, `rgba(255,255,255,${strength * 0.45})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, LIGHT_MAP_WIDTH, HEIGHT * scale);
    }
  });
}

/** A mote of cold light. */
function moteTexture(): Texture {
  return painted(16, 16, (c) => {
    const g = c.createRadialGradient(8, 8, 0, 8, 8, 8);
    g.addColorStop(0, 'rgba(235,250,255,1)');
    g.addColorStop(0.3, 'rgba(140,210,255,0.85)');
    g.addColorStop(1, 'rgba(60,140,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 16, 16);
  });
}

/** The floor's mist as an alpha mask: thickest low down, fading upward and to the sides. */
function floorMask(): Texture {
  return painted(64, 64, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.7)');
    g.addColorStop(1, 'rgba(255,255,255,1)');
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
  });
}

export class DescentRoomArt {
  private readonly host: HTMLElement;
  private app: Application | null = null;
  private destroyed = false;
  private readonly textures: Texture[] = [];
  private readonly filters: BlurFilter[] = [];
  private fire: BlueFire | null = null;
  private readonly world = new Container();
  private resizing: ResizeObserver | null = null;
  private time = 0;
  private candles: CandleFlames | null = null;
  private candleLight: Sprite | null = null;
  private readonly brazierLights: Sprite[] = [];
  private readonly runes: { sprite: Sprite; glow: Sprite; phase: number }[] = [];
  private readonly lanterns: Sprite[] = [];
  private readonly banners: Bending[] = [];
  private readonly motes: Mote[] = [];
  private mist: TilingSprite | null = null;

  constructor(host: HTMLElement) {
    this.host = host;
  }

  async start(): Promise<void> {
    const app = newApplication();
    let pictures: Texture[];
    try {
      pictures = await Promise.all([roomUrl, litUrl, ...RUNES.map((r) => r.url), ...BANNERS.map((b) => b.url)].map(textureOf));
      await app.init({
        resizeTo: this.host,
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 1.5),
        preference: ['webgl', 'webgpu'],
      });
    } catch (error) {
      console.warn('The hall stays still:', error);
      destroyApplication(app);
      return;
    }
    if (this.destroyed) {
      destroyApplication(app);
      return;
    }
    this.app = app;
    this.textures.push(...pictures);
    const [room, lit, runesLeft, runesRight, bannerLeft, bannerRight] = pictures as [Texture, Texture, Texture, Texture, Texture, Texture];

    // The hall in the dark; its lights show the picture as it was painted where they reach
    this.world.addChild(new Sprite(room));
    this.candleLight = this.litBy(lit, lightMap(POOLS));
    for (const pool of BRAZIER_POOLS) this.brazierLights.push(this.litBy(lit, lightMap([pool])));
    this.buildMist();
    this.buildBanners([bannerLeft, bannerRight]);
    this.buildRunes([runesLeft, runesRight]);
    this.fire = new BlueFire(this.world, FLAMES.map(({ base, height, width }) => ({ x: base.x, y: base.y, height, width })), 70);
    this.textures.push(...this.fire.textures);
    this.buildLanterns();
    this.candles = new CandleFlames(this.world, CANDLES);
    this.textures.push(...this.candles.textures);
    this.buildMotes();

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
    for (const filter of this.filters) filter.destroy();
    this.filters.length = 0;
    if (this.app !== null) destroyApplication(this.app);
    this.app = null;
    for (const texture of this.textures) texture.destroy(true);
    this.textures.length = 0;
  }

  private keep(texture: Texture): Texture {
    this.textures.push(texture);
    return texture;
  }

  /** The room as painted, seen through a light map. */
  private litBy(lit: Texture, map: Texture): Sprite {
    const mask = new Sprite(this.keep(map));
    mask.scale.set(WIDTH / LIGHT_MAP_WIDTH);
    const shown = new Sprite(lit);
    this.world.addChild(mask, shown);
    shown.setMask({ mask, channel: 'alpha' });
    return shown;
  }

  /** The banners, hanging from their poles, bending more the lower they hang, in a slow draught. */
  private buildBanners(textures: Texture[]): void {
    BANNERS.forEach(({ x, y, phase }, i) => {
      const texture = textures[i]!;
      const mesh = new MeshPlane({ texture, verticesX: 4, verticesY: 12 });
      mesh.autoResize = false;
      mesh.position.set(x, y);
      this.world.addChild(mesh);
      this.banners.push({ mesh, rest: new Float32Array(mesh.geometry.positions), height: texture.height, phase });
    });
  }

  /** The runes on the columns, pulsing, with a glow that spills round them when they flare. */
  private buildRunes(textures: Texture[]): void {
    RUNES.forEach(({ x, y, phase }, i) => {
      const sprite = new Sprite(textures[i]!);
      sprite.position.set(x, y);
      const glow = new Sprite(textures[i]!);
      glow.position.set(x, y);
      glow.blendMode = 'add';
      const blur = new BlurFilter({ strength: 7, quality: 3 });
      this.filters.push(blur);
      glow.filters = [blur];
      this.world.addChild(sprite, glow);
      this.runes.push({ sprite, glow, phase });
    });
  }

  private buildLanterns(): void {
    const glowTex = this.keep(glowTexture());
    for (const { x, y } of LANTERNS) {
      const glow = new Sprite(glowTex);
      glow.anchor.set(0.5);
      glow.position.set(x, y);
      glow.scale.set(1.1);
      glow.tint = 0x5ec8ff;
      glow.blendMode = 'add';
      this.world.addChild(glow);
      this.lanterns.push(glow);
    }
  }

  /** A cold mist creeping along the floor. */
  private buildMist(): void {
    const layer = new Container();
    this.mist = new TilingSprite({ texture: this.keep(cloudTexture()), width: WIDTH, height: 300 });
    this.mist.position.set(0, HEIGHT - 300);
    this.mist.tileScale.set(3, 1.2);
    this.mist.tint = 0x7fa6d8;
    this.mist.alpha = 0.16;
    layer.addChild(this.mist);
    const mask = new Sprite(this.keep(floorMask()));
    mask.position.set(0, HEIGHT - 300);
    mask.width = WIDTH;
    mask.height = 300;
    this.world.addChild(mask, layer);
    layer.setMask({ mask, channel: 'alpha' });
  }

  /** Motes of cold light drifting up from the braziers and through the whole hall. */
  private buildMotes(): void {
    const texture = this.keep(moteTexture());
    for (let i = 0; i < MOTES; i++) {
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.blendMode = 'add';
      this.world.addChild(sprite);
      const mote = { sprite, vx: 0, vy: 0, life: 1, age: 0, phase: Math.random() * 10 };
      this.respawn(mote, i % 3 === 0);
      mote.age = Math.random() * mote.life;
      this.motes.push(mote);
    }
  }

  private respawn(m: Mote, fromBrazier = Math.random() < 0.4): void {
    if (fromBrazier) {
      const { base, height } = FLAMES[Math.random() < 0.5 ? 0 : 1];
      m.sprite.position.set(base.x + (Math.random() - 0.5) * 40, base.y - height * 0.7);
      m.vy = -(30 + Math.random() * 50);
      m.life = 2 + Math.random() * 3;
    } else {
      m.sprite.position.set(Math.random() * WIDTH, HEIGHT - Math.random() * 200);
      m.vy = -(10 + Math.random() * 20);
      m.life = 8 + Math.random() * 10;
    }
    m.vx = (Math.random() - 0.5) * 10;
    m.age = 0;
    m.sprite.scale.set(0.18 + Math.random() * 0.3);
  }

  /** The picture as a cover of the screen, centred. */
  private fit(): void {
    const width = this.host.clientWidth;
    const height = this.host.clientHeight;
    const scale = Math.max(width / WIDTH, height / HEIGHT);
    this.world.scale.set(scale);
    this.world.position.set((width - WIDTH * scale) / 2, (height - HEIGHT * scale) / 2);
  }

  private readonly tick = (ticker: Ticker): void => {
    const seconds = Math.min(ticker.deltaMS / 1000, 0.1);
    this.time += seconds;
    const t = this.time;

    this.candles!.update(t, seconds);
    this.candleLight!.alpha = 0.88 + 0.06 * wobble(t * 0.7, 1.3) + 0.04 * this.candles!.gust;

    // The braziers: their fires, and the light they throw on the stone, breathing with them
    this.fire!.update(t, seconds);
    FLAMES.forEach(({ phase }, i) => {
      this.brazierLights[i]!.alpha = 0.8 + 0.2 * wobble(t * 0.7, phase);
    });

    // The runes breathe out of step, and their glow spills when they flare
    for (const { sprite, glow, phase } of this.runes) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.9 + phase) * Math.sin(t * 0.31 + phase * 2);
      sprite.alpha = 0.55 + 0.45 * pulse;
      glow.alpha = 0.15 + 0.55 * pulse * pulse;
    }

    this.lanterns.forEach((glow, i) => {
      glow.alpha = 0.22 + 0.08 * wobble(t * 0.8, i * 3.1);
    });

    // The banners: a slow sway, a ripple running down them, more the lower
    for (const { mesh, rest, height, phase } of this.banners) {
      const positions = mesh.geometry.positions;
      const sway = Math.sin(t * 0.55 + phase) * 0.7 + Math.sin(t * 1.3 + phase * 2) * 0.3;
      for (let i = 0; i < rest.length; i += 2) {
        const y = rest[i + 1]! / height;
        const reach = y * y;
        positions[i] = rest[i]! + reach * (sway * 6 + Math.sin(t * 2.3 - y * 5 + phase) * 1.6);
        positions[i + 1] = rest[i + 1]! - reach * Math.abs(sway) * 1.2;
      }
      mesh.geometry.getBuffer('aPosition').update();
    }

    this.mist!.tilePosition.x -= seconds * 12;
    this.mist!.tilePosition.y = Math.sin(t * 0.1) * 10;

    for (const m of this.motes) {
      m.age += seconds;
      if (m.age >= m.life) this.respawn(m);
      m.sprite.x += (m.vx + Math.sin(t * 0.9 + m.phase) * 8) * seconds;
      m.sprite.y += m.vy * seconds;
      const left = 1 - m.age / m.life;
      m.sprite.alpha = Math.min(1, m.age * 1.2) * left * (0.55 + 0.45 * Math.sin(t * 3 + m.phase * 3));
    }
  };
}
