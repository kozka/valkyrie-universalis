// The game selection's backdrop, kozka's picture (brand/menu/) brought a little to life with PixiJS: over the picture
// without them, the knight's cape stirs, the black sun warps and turns, the tentacles writhe, the red light breathes and
// the picture's own mist flows, all slowly. Only on wide screens that move freely: a phone, or a player who asks for less motion, gets the whole
// picture still, from the stylesheet, which stays under the canvas so that nothing blinks. Not ported from Valkyrie.
import { Container, DisplacementFilter, MeshPlane, Sprite, Texture, type Ticker, type Application } from 'pixi.js';
import baseUrl from '../assets/menu-base.webp';
import capeUrl from '../assets/menu-cape.webp';
import mistUrl from '../assets/menu-mist.webp';
import lightUrl from '../assets/menu-light.webp';
import sunUrl from '../assets/menu-sun.webp';
import tentacle1Url from '../assets/menu-tentacle-1.webp';
import tentacle2Url from '../assets/menu-tentacle-2.webp';
import tentacle3Url from '../assets/menu-tentacle-3.webp';
import { destroyApplication, newApplication } from '../board/pixiApps.ts';

/** The picture's size; every layer is a part of it, placed at its corner in the picture. */
const WIDTH = 1729;
const HEIGHT = 910;
/** The centre of the black sun, in the picture. */
const SUN = [1470, 126] as const;
/** The point of the picture kept in view when a wide screen cuts it, as fractions; the stylesheet's background-position. */
export const FOCUS = [0, 0.4] as const;

type Corner = readonly [number, number];

/** A layer that bends: its picture, where it goes, and how far each of its points moves at a time, in picture pixels. */
interface Bending {
  mesh: MeshPlane;
  rest: Float32Array;
  move: (x: number, y: number, t: number) => [number, number];
}

export async function textureOf(url: string): Promise<Texture> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  // Premultiplied here and not on upload, which WebGL ignores for a bitmap (host/pictureFiles.ts PREMULTIPLIED)
  const texture = Texture.from(await createImageBitmap(await response.blob(), { premultiplyAlpha: 'premultiply' }));
  texture.source.alphaMode = 'premultiplied-alpha';
  texture.source.autoGenerateMipmaps = true;
  return texture;
}

/** Smooth noise that tiles, red and green apart, for a warp: round for the sun, stretched across for the mist. */
export function noiseTexture(across: boolean): Texture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d')!;
  const image = context.createImageData(size, size);
  // A sum of a few waves that repeat across the square, so that it tiles without a seam
  const waves = Array.from({ length: 6 }, (_, i) => ({ kx: across ? 1 + (i % 2) : 1 + (i % 3), ky: across ? 2 + (i % 3) * 2 : 1 + ((i * 2) % 3), phase: i * 1.7, channel: i % 2 }));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const value = [0, 0];
      for (const w of waves) value[w.channel]! += Math.sin(((w.kx * x + w.ky * y) / size) * 2 * Math.PI + w.phase) / 3;
      image.data.set([128 + 127 * value[0]!, 128 + 127 * value[1]!, 128, 255], (y * size + x) * 4);
    }
  }
  context.putImageData(image, 0, 0);
  const texture = Texture.from(canvas);
  texture.source.addressMode = 'repeat';
  return texture;
}

export class MenuArt {
  private readonly host: HTMLElement;
  private app: Application | null = null;
  private destroyed = false;
  private readonly textures: Texture[] = [];
  private readonly filters: DisplacementFilter[] = [];
  private readonly scene = new Container();
  private readonly bending: Bending[] = [];
  private sun: Sprite | null = null;
  private warp: Sprite | null = null;
  private light: Sprite | null = null;
  private mist: Sprite[] = [];
  private flow: Sprite | null = null;
  private time = 0;
  private resizing: ResizeObserver | null = null;

  constructor(host: HTMLElement) {
    this.host = host;
  }

  async start(): Promise<void> {
    const app = newApplication();
    let textures: Texture[];
    try {
      textures = await Promise.all([baseUrl, capeUrl, sunUrl, lightUrl, mistUrl, tentacle1Url, tentacle2Url, tentacle3Url].map(textureOf));
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
    this.textures.push(...textures);
    const [base, cape, sun, light, mist, tentacle1, tentacle2, tentacle3] = textures as [Texture, Texture, Texture, Texture, Texture, Texture, Texture, Texture];

    this.scene.addChild(new Sprite(base));

    // The picture's own mist, cut from it, flowing over itself: warped by noise that drifts along the valleys, and a
    // lighter copy of it that wanders the other way
    const streaks = noiseTexture(true);
    this.textures.push(streaks);
    this.flow = new Sprite(streaks);
    this.flow.renderable = false;
    this.flow.scale.set(4, 2.5);
    const flowing = this.place(new Sprite(mist), [0, 365]);
    flowing.filters = [this.keep(new DisplacementFilter({ sprite: this.flow, scale: { x: 30, y: 10 } }))];
    const lighter = this.place(new Sprite(mist), [0, 365]);
    lighter.blendMode = 'add';
    this.mist = [flowing, lighter];
    this.scene.addChild(this.flow, flowing, lighter);

    // The black sun, warped by noise that turns round it, and the whole of it turning a little to and fro
    const noise = noiseTexture(false);
    this.textures.push(noise);
    this.warp = new Sprite(noise);
    this.warp.renderable = false;
    this.warp.scale.set(2.6);
    this.sun = new Sprite(sun);
    this.sun.pivot.set(SUN[0] - 1150, SUN[1]);
    this.sun.position.set(SUN[0], SUN[1]);
    this.sun.filters = [this.keep(new DisplacementFilter({ sprite: this.warp, scale: 10 }))];
    this.scene.addChild(this.warp, this.sun);

    // The tentacles, writhing from where they leave the ground: a wave runs up each, its tip moving most
    for (const [texture, corner, root, phase] of [
      [tentacle1, [1452, 339], [1463, 473], 0],
      [tentacle2, [1579, 426], [1634, 493], 2.1],
      [tentacle3, [1570, 353], [1580, 388], 4.2],
    ] as const) {
      const height = texture.height;
      const amount = Math.max(4, 0.08 * height);
      this.bend(texture, corner, 6, 14, (_x, y, t) => {
        const reach = Math.max(0, (root[1] - corner[1] - y) / height);
        return [
          amount * reach ** 1.6 * Math.sin(t * 0.9 + reach * 3.5 + phase),
          0.35 * amount * reach * reach * Math.cos(t * 0.7 + reach * 2.5 + phase),
        ];
      });
    }

    // The red light, breathing
    this.light = this.place(new Sprite(light), [1320, 319]);
    this.light.blendMode = 'add';
    this.scene.addChild(this.light);

    // The cape, hanging from the knight's shoulders on its right and stirring more the further from them
    this.bend(cape, [580, 205], 14, 12, (x, y, t) => {
      const free = Math.min(1, Math.hypot(790 - 580 - x, 0.6 * (y - 15)) / 210);
      const wave = Math.sin(t * 1.3 - x * 0.035 + y * 0.01) + 0.5 * Math.sin(t * 2.1 - x * 0.06);
      return [2.5 * free * Math.sin(t * 0.8 + y * 0.025), wave * 6 * free * free];
    });

    app.stage.addChild(this.scene);
    this.host.append(app.canvas);
    this.resizing = new ResizeObserver(() => this.fit());
    this.resizing.observe(this.host);
    this.fit();
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
    // The meshes before the renderer, with their geometries, so that none keeps a picture bound
    for (const { mesh } of this.bending) {
      const { geometry, shader } = mesh;
      mesh.destroy();
      shader?.destroy();
      geometry.destroy(true);
    }
    this.bending.length = 0;
    // Its filters before the renderer and the pictures they draw from, or Pixi warns that those are still bound
    for (const filter of this.filters) filter.destroy();
    this.filters.length = 0;
    if (this.app !== null) destroyApplication(this.app);
    this.app = null;
    for (const texture of this.textures) texture.destroy(true);
    this.textures.length = 0;
  }

  private keep(filter: DisplacementFilter): DisplacementFilter {
    this.filters.push(filter);
    return filter;
  }

  private place<T extends Container>(item: T, corner: Corner): T {
    item.position.set(corner[0], corner[1]);
    return item;
  }

  /** A layer as a mesh of points that move on their own. */
  private bend(texture: Texture, corner: Corner, columns: number, rows: number, move: Bending['move']): void {
    const mesh = this.place(new MeshPlane({ texture, verticesX: columns, verticesY: rows }), corner);
    mesh.autoResize = false;
    this.bending.push({ mesh, rest: new Float32Array(mesh.geometry.positions), move });
    this.scene.addChild(mesh);
  }

  /** The picture covering the screen, as the stylesheet's background-size: cover, around FOCUS. */
  private fit(): void {
    const width = this.host.clientWidth;
    const height = this.host.clientHeight;
    const scale = Math.max(width / WIDTH, height / HEIGHT);
    this.scene.scale.set(scale);
    this.scene.position.set((width - WIDTH * scale) * FOCUS[0], (height - HEIGHT * scale) * FOCUS[1]);
  }

  private readonly tick = (ticker: Ticker): void => {
    this.time += Math.min(ticker.deltaMS / 1000, 0.1);
    const t = this.time;
    for (const { mesh, rest, move } of this.bending) {
      const positions = mesh.geometry.positions;
      for (let i = 0; i < rest.length; i += 2) {
        const [dx, dy] = move(rest[i]!, rest[i + 1]!, t);
        positions[i] = rest[i]! + dx;
        positions[i + 1] = rest[i + 1]! + dy;
      }
      mesh.geometry.getBuffer('aPosition').update();
    }
    // The warp turns round the sun; the sun sways and swells a little
    this.warp!.position.set(SUN[0] + 90 * Math.cos(t * 0.25), SUN[1] + 90 * Math.sin(t * 0.25));
    this.sun!.rotation = 0.045 * Math.sin(t * 0.21);
    this.sun!.scale.set(1 + 0.02 * Math.sin(t * 0.33));
    this.light!.alpha = 0.6 + 0.25 * Math.sin(t * 0.9) + 0.1 * Math.sin(t * 2.3);
    // The mist's warp drifts along the valleys
    this.flow!.position.set(-t * 14, 365 + 10 * Math.sin(t * 0.1));
    const [flowing, lighter] = this.mist as [Sprite, Sprite];
    flowing.x = 8 * Math.sin(t * 0.07);
    lighter.x = -14 * Math.sin(t * 0.05 + 1);
    lighter.alpha = 0.16 + 0.08 * Math.sin(t * 0.17);
  };
}
