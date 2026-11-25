// What the Universalis theme's illustrated backdrops share (mansionArt.ts, lavaArt.ts, fortressArt.ts): kozka's
// picture whole, with the layers he cut from it on top, drawn with PixiJS over the still picture (Backdrop.tsx). A slow
// camera goes once from one view of the picture to another and stays there, barely drifting; mists drift and swirl,
// the nearer shifting more with the camera; lights breathe or flicker; cloth sways and hanging things swing. Each
// scene says what it has and how it moves. Not ported from Valkyrie.
import { Container, DisplacementFilter, MeshPlane, Sprite, Texture, TilingSprite, type Ticker, type Application } from 'pixi.js';
import { noiseTexture, textureOf } from '../../screens/menuArt.ts';
import { destroyApplication, newApplication } from '../../board/pixiApps.ts';

export type Corner = readonly [number, number];

/** A view of the picture: one of its sides at that x of the picture against the screen's same side, this close. */
export interface View {
  edge: 'left' | 'right';
  at: number;
  zoom: number;
}

/** How long the camera takes to go from its first view to its last, in seconds. */
const TRAVEL = 45;

interface Mist {
  sprite: TilingSprite;
  speed: number;
  phase: number;
  depth: number;
  alpha: number;
}

interface Haze {
  sprite: Sprite;
  x: number;
  reach: number;
  phase: number;
  alpha: number;
}

interface Light {
  sprite: Sprite;
  /** Its alpha at a time of the drawing. */
  alpha: (t: number) => number;
}

interface Bending {
  mesh: MeshPlane;
  rest: Float32Array;
  move: (x: number, y: number, t: number) => [number, number];
}

interface Swinging {
  sprite: Sprite;
  angle: (t: number) => number;
}

/** A light that flickers like fire, from about 0.8 to 1. */
export function fire(t: number, phase = 0): number {
  return 0.86 + 0.07 * Math.sin(t * 7.1 + phase) + 0.05 * Math.sin(t * 12.7 + phase * 2) + 0.03 * Math.sin(t * 3.3 + phase);
}

export abstract class Scene<K extends string> {
  private readonly host: HTMLElement;
  private app: Application | null = null;
  private destroyed = false;
  private readonly textures: Texture[] = [];
  /** Parts of those pictures, which share them. */
  protected readonly parts: Texture[] = [];
  private readonly filters: DisplacementFilter[] = [];
  protected readonly scene = new Container();
  private time = 0;
  private resizing: ResizeObserver | null = null;
  private readonly mists: Mist[] = [];
  private readonly hazes: Haze[] = [];
  private readonly lights: Light[] = [];
  private readonly bending: Bending[] = [];
  private readonly swinging: Swinging[] = [];
  private swirl: Sprite | null = null;
  private swirling: DisplacementFilter | null = null;
  /** How far the camera has gone, from 0 at its first view to 1 at its last. */
  private travel = 0;

  /** The picture's size; every layer is a part of it, placed at its corner. */
  protected abstract readonly width: number;
  protected abstract readonly height: number;
  /** The camera's first and last views, and how high it looks, from 0 at the top to 1 at the bottom. */
  protected abstract readonly from: View;
  protected abstract readonly to: View;
  protected abstract readonly look: number;

  constructor(host: HTMLElement) {
    this.host = host;
  }

  /** Its pictures, by what they are; the first is the whole picture. */
  protected abstract pictures(): Record<K, string>;
  /** Puts its layers on the scene, the whole picture already there. */
  protected abstract build(pictures: Record<K, Texture>): void;
  /** What else moves, every frame. */
  protected animate(_t: number, _seconds: number): void {}

  async start(): Promise<void> {
    const app = newApplication();
    const urls = this.pictures();
    let pictures: Record<K, Texture>;
    try {
      const loaded = await Promise.all(Object.values<string>(urls).map(textureOf));
      pictures = Object.fromEntries(Object.keys(urls).map((key, i) => [key, loaded[i]!])) as Record<K, Texture>;
      await app.init({
        resizeTo: this.host,
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 1.5),
        preference: ['webgl', 'webgpu'],
      });
    } catch (error) {
      console.warn('The backdrop stays still:', error);
      destroyApplication(app);
      return;
    }
    if (this.destroyed) {
      destroyApplication(app);
      return;
    }
    this.app = app;
    this.textures.push(...Object.values<Texture>(pictures));
    this.scene.addChild(new Sprite(Object.values<Texture>(pictures)[0]!));

    // The mists swirl as they drift: one warp for all, stretched along them
    const streaks = noiseTexture(true);
    this.textures.push(streaks);
    this.swirl = new Sprite(streaks);
    this.swirl.renderable = false;
    this.swirl.scale.set(3, 1.6);
    this.scene.addChild(this.swirl);
    this.swirling = new DisplacementFilter({ sprite: this.swirl, scale: { x: 24, y: 8 } });
    this.filters.push(this.swirling);

    this.build(pictures);

    app.stage.addChild(this.scene);
    this.host.append(app.canvas);
    this.resizing = new ResizeObserver(() => this.tick(app.ticker));
    this.resizing.observe(this.host);
    app.ticker.maxFPS = 30;
    app.ticker.add(this.tick);
    this.tick(app.ticker);
    app.render();
    this.host.dataset.art = 'drawn';
  }

  destroy(): void {
    this.destroyed = true;
    this.resizing?.disconnect();
    delete this.host.dataset.art;
    (this.app?.renderer.filter as unknown as { _globalFilterBindGroup?: { destroy(): void } } | undefined)?._globalFilterBindGroup?.destroy();
    // Its filters and meshes before the renderer and the pictures, or Pixi warns that those are still bound
    for (const filter of this.filters) filter.destroy();
    this.filters.length = 0;
    for (const { mesh } of this.bending) {
      const { geometry, shader } = mesh;
      mesh.destroy();
      shader?.destroy();
      geometry.destroy(true);
    }
    this.bending.length = 0;
    if (this.app !== null) destroyApplication(this.app);
    this.app = null;
    for (const texture of this.parts) texture.destroy();
    for (const texture of this.textures) texture.destroy(true);
    this.parts.length = 0;
    this.textures.length = 0;
  }

  protected place<T extends Container>(item: T, corner: Corner): T {
    item.position.set(corner[0], corner[1]);
    this.scene.addChild(item);
    return item;
  }

  /** A light, added over what is below, whose alpha changes with time. */
  protected light(texture: Texture, corner: Corner, alpha: (t: number) => number, add = true): Sprite {
    const sprite = this.place(new Sprite(texture), corner);
    if (add) sprite.blendMode = 'add';
    this.lights.push({ sprite, alpha });
    return sprite;
  }

  /**
   * A band of mist across the picture, made to repeat, drifting this many pixels a second and shifting by up to
   * `depth` more as the camera goes, the nearer the more; at most this opaque.
   */
  protected mist(texture: Texture, top: number, speed: number, depth: number, alpha = 1): void {
    const sprite = new TilingSprite({ texture, width: this.width, height: texture.height });
    sprite.filters = [this.swirling!];
    this.place(sprite, [0, top]);
    this.mists.push({ sprite, speed, phase: this.mists.length * 2, depth, alpha });
  }

  /** Smoke over part of the picture, swirling and wandering by up to `reach` pixels each way; at most this opaque. */
  protected haze(texture: Texture, corner: Corner, reach: number, alpha = 1): void {
    const sprite = this.place(new Sprite(texture), corner);
    sprite.filters = [this.swirling!];
    this.hazes.push({ sprite, x: corner[0], reach, phase: this.hazes.length * 1.7, alpha });
  }

  /** A cut-out as a mesh of points that move on their own, by picture pixels. */
  protected bend(texture: Texture, corner: Corner, columns: number, rows: number, move: Bending['move']): void {
    const mesh = new MeshPlane({ texture, verticesX: columns, verticesY: rows });
    mesh.autoResize = false;
    this.place(mesh, corner);
    this.bending.push({ mesh, rest: new Float32Array(mesh.geometry.positions), move });
  }

  /** A cut-out hanging from a point of the picture, turning about it by an angle in radians. */
  protected swing(texture: Texture, corner: Corner, from: Corner, angle: (t: number) => number): void {
    const sprite = new Sprite(texture);
    sprite.pivot.set(from[0] - corner[0], from[1] - corner[1]);
    this.place(sprite, from);
    this.swinging.push({ sprite, angle });
  }

  /** Where a view puts the picture's left side, at this scale. */
  private leftOf(view: View, seenWidth: number): number {
    const left = view.edge === 'left' ? view.at : view.at - seenWidth;
    return Math.min(Math.max(left, 0), Math.max(this.width - seenWidth, 0));
  }

  private readonly tick = (ticker: Ticker): void => {
    const seconds = Math.min(ticker.deltaMS / 1000, 0.1);
    this.time += seconds;
    const t = this.time;

    // The camera goes once, easing in and out, then stays, barely drifting and breathing
    this.travel = Math.min(1, t / TRAVEL);
    const go = this.travel * this.travel * (3 - 2 * this.travel);
    const settled = smooth((t - TRAVEL) / 8);
    const width = this.host.clientWidth;
    const height = this.host.clientHeight;
    const zoom = (this.from.zoom + (this.to.zoom - this.from.zoom) * go) * (1 + 0.01 * settled * Math.sin(t * 0.07));
    const scale = Math.max(width / this.width, height / this.height) * zoom;
    const seenWidth = width / scale;
    const seenHeight = height / scale;
    const sway = 0.015 * seenWidth * settled * Math.sin(t * 0.05);
    const left = Math.min(Math.max(this.leftOf(this.from, seenWidth) + (this.leftOf(this.to, seenWidth) - this.leftOf(this.from, seenWidth)) * go + sway, 0), Math.max(this.width - seenWidth, 0));
    this.scene.scale.set(scale);
    this.scene.position.set(-left * scale, -(this.height - seenHeight) * this.look * scale);
    // Over the still picture, which shows where the camera ends, it fades in where the camera starts
    this.scene.alpha = smooth(t / 1.5);

    // Mists drifting, the nearer shifting more as the camera goes, each breathing
    for (const { sprite, speed, phase, depth, alpha } of this.mists) {
      sprite.tilePosition.x = speed * t - (go - 0.5) * 2 * depth;
      sprite.alpha = alpha * (0.8 + 0.2 * Math.sin(t * 0.15 + phase));
    }
    for (const { sprite, x, reach, phase, alpha } of this.hazes) {
      sprite.x = x + reach * Math.sin(t * 0.06 + phase);
      sprite.alpha = alpha * (0.8 + 0.2 * Math.sin(t * 0.17 + phase));
    }
    this.swirl!.position.set(-t * 10, this.height * 0.4 + 20 * Math.sin(t * 0.08));

    for (const { sprite, alpha } of this.lights) sprite.alpha = alpha(t);
    for (const { sprite, angle } of this.swinging) sprite.rotation = angle(t);
    for (const { mesh, rest, move } of this.bending) {
      const positions = mesh.geometry.positions;
      for (let i = 0; i < rest.length; i += 2) {
        const [dx, dy] = move(rest[i]!, rest[i + 1]!, t);
        positions[i] = rest[i]! + dx;
        positions[i + 1] = rest[i + 1]! + dy;
      }
      mesh.geometry.getBuffer('aPosition').update();
    }
    this.animate(t, seconds);
  };
}

function smooth(x: number): number {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
}
