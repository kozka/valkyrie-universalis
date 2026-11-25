// The library behind a scenario's details in the Universalis theme for Mansions (QuestDetailsScreen.tsx,
// questDetails.css): kozka's picture (brand/scenario-details/), drawn with PixiJS so that its candles burn
// (candles.ts) and light what is near them, the picture as painted showing through round each group and breathing
// with their flames over a darker copy. The picture fills the screen as a cover. Not ported from Valkyrie.
import { Container, Sprite, type Texture, type Ticker, type Application } from 'pixi.js';
import darkUrl from '../../assets/details-library.webp';
import litUrl from '../../assets/details-library-lit.webp';
import { destroyApplication, newApplication } from '../../board/pixiApps.ts';
import { textureOf } from '../../screens/menuArt.ts';
import { CandleFlames, painted, wobble, type Candle } from './candles.ts';

/** The picture's size. */
const WIDTH = 1448;
const HEIGHT = 1086;

/** Its candles, measured in it: each one's pale painted tip is where its flame burns, sized to cover it. */
const CANDLES: readonly Candle[] = [
  { x: 12, top: 119, size: 1.2 },
  { x: 45.7, top: 97.5, size: 1.3 },
  { x: 92.5, top: 122.5, size: 1.25 },
  { x: 114.5, top: 138.75, size: 1.2 },
  { x: 431.25, top: 297, size: 1 },
  { x: 903, top: 230, size: 0.75 },
  { x: 922, top: 225, size: 1.1 },
  { x: 940, top: 230, size: 0.65 },
  { x: 1137.5, top: 330, size: 0.65 },
  { x: 1344.5, top: 310, size: 0.85 },
  { x: 1385, top: 305, size: 1.2 },
  { x: 1410.75, top: 281, size: 1.05 },
  { x: 1419.5, top: 268, size: 0.6 },
  // The big one on the desk, in front
  { x: 250, top: 812.5, size: 2.1 },
];

/** The light map's width: drawn small and stretched to the picture, as light is soft anyway. */
const LIGHT_MAP_WIDTH = 362;

/** Where the candles light the library, as alpha: a warm pool round each group, stronger close to each flame. */
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
    pool(70, 150, 260, 0.6);
    pool(430, 320, 170, 0.45);
    pool(920, 250, 200, 0.45);
    pool(1137, 345, 130, 0.4);
    pool(1385, 310, 230, 0.5);
    pool(250, 830, 330, 0.65);
    for (const { x, top, size } of CANDLES) pool(x, top - 10, 80 * size, 0.4);
  });
}

export class LibraryArt {
  private readonly host: HTMLElement;
  private app: Application | null = null;
  private destroyed = false;
  private readonly textures: Texture[] = [];
  private readonly world = new Container();
  private candleLight: Sprite | null = null;
  private candles: CandleFlames | null = null;
  private resizing: ResizeObserver | null = null;
  private time = 0;

  constructor(host: HTMLElement) {
    this.host = host;
  }

  async start(): Promise<void> {
    const app = newApplication();
    let dark: Texture;
    let lit: Texture;
    try {
      [dark, lit] = await Promise.all([textureOf(darkUrl), textureOf(litUrl)]);
      await app.init({
        resizeTo: this.host,
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 1.5),
        preference: ['webgl', 'webgpu'],
      });
    } catch (error) {
      console.warn('The library stays still:', error);
      destroyApplication(app);
      return;
    }
    if (this.destroyed) {
      destroyApplication(app);
      return;
    }
    this.app = app;
    this.textures.push(dark, lit);
    this.world.addChild(new Sprite(dark));
    this.candleLight = new Sprite(lit);
    const map = lightMapTexture();
    this.textures.push(map);
    const lightMap = new Sprite(map);
    lightMap.scale.set(WIDTH / LIGHT_MAP_WIDTH);
    this.world.addChild(lightMap, this.candleLight);
    this.candleLight.setMask({ mask: lightMap, channel: 'alpha' });
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
    this.destroyed = true;
    this.resizing?.disconnect();
    delete this.host.dataset.art;
    (this.app?.renderer.filter as unknown as { _globalFilterBindGroup?: { destroy(): void } } | undefined)?._globalFilterBindGroup?.destroy();
    if (this.app !== null) destroyApplication(this.app);
    this.app = null;
    for (const texture of this.textures) texture.destroy(true);
    this.textures.length = 0;
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
    // The candles' light on the shelves breathes with their flames
    this.candleLight!.alpha = 0.86 + 0.07 * wobble(t * 0.8, 1.3) + 0.05 * this.candles!.gust;
  };
}
