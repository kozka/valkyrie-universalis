// Mansions' main menu backdrop in the Universalis theme (themes.ts): kozka's mansion behind its gates (brand/mansion/),
// brought a little to life (scene.ts). The camera comes slowly from the left, close, with the woods, to the house, whole
// on the right, and stays; mists drift and swirl at three depths; the moon glows; the door's light and its reflection
// flicker; now and then a window goes dark for a while and is lit again; and the storm the menu sounds (audio/
// menuAmbience.ts) lights the clouds to the left of the house, behind the trees, each lightning a little before its
// thunder. His cut-outs of the trees and the gates
// take in the sky behind them, and the parts they hide were never painted, so they stay in the picture, still. Not
// ported from Valkyrie.
import { Container, Graphics, Rectangle, Sprite, Texture } from 'pixi.js';
import { onLightning, type Lightning } from '../../audio/menuAmbience.ts';
import baseUrl from '../../assets/mansion-base.webp';
import doorUrl from '../../assets/mansion-door.webp';
import fog1Url from '../../assets/mansion-fog-1.webp';
import fog2Url from '../../assets/mansion-fog-2.webp';
import fog3Url from '../../assets/mansion-fog-3.webp';
import glowUrl from '../../assets/mansion-glow.webp';
import moonUrl from '../../assets/mansion-moon.webp';
import reflectionUrl from '../../assets/mansion-reflection.webp';
import skyUrl from '../../assets/mansion-sky.webp';
import windowsOffUrl from '../../assets/mansion-windows-off.webp';
import windowsOnUrl from '../../assets/mansion-windows-on.webp';
import { Scene, fire, type View } from './scene.ts';

/** The windows' pictures, lit and dark, cut from this corner of the picture. */
const WINDOWS_AT = [1000, 140] as const;
/** The lit windows of the house, as boxes of the picture: x, y, width, height. */
const WINDOWS = [
  [1008, 158, 18, 28],
  [1008, 205, 18, 35],
  [1117, 163, 24, 24],
  [1119, 188, 24, 33],
  [1182, 202, 15, 34],
  [1220, 200, 18, 32],
  [1355, 218, 16, 32],
  [1060, 205, 18, 32],
  [1060, 272, 18, 36],
  [1124, 145, 14, 16],
] as const;

const PICTURES = {
  base: baseUrl,
  sky: skyUrl,
  moon: moonUrl,
  fog1: fog1Url,
  fog2: fog2Url,
  fog3: fog3Url,
  windowsOff: windowsOffUrl,
  windowsOn: windowsOnUrl,
  glow: glowUrl,
  door: doorUrl,
  reflection: reflectionUrl,
};

/** Where lightning falls, in the picture: left of the house, in the sky. */
const STORM = { left: 520, right: 940, top: 30, bottom: 110 } as const;
const LIGHTNING_COLOUR = 0xc4d4ff;

/** A lightning being seen: its light on the clouds and, when it is not far, its bolt. */
interface Flash {
  /** Seconds since it fell (negative for an afterflash still to come), and how long it lasts. */
  age: number;
  lasts: number;
  /** How bright at most, from 0 to 1, and how much of that the bolt takes. */
  bright: number;
  bolt: number;
}

/** A soft round light, white in the middle. */
function glowTexture(): Texture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d')!;
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.45)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  return Texture.from(canvas);
}

interface Pane {
  /** Its window dark, and lit a little more, over the picture. */
  dark: Sprite;
  bright: Sprite;
  /** How lit it is, from 0 to 1, and how lit it is going to be. */
  lit: number;
  target: number;
  /** When it changes again, in seconds of the drawing. */
  until: number;
}

export class MansionArt extends Scene<keyof typeof PICTURES> {
  protected readonly width = 1536;
  protected readonly height = 480;
  // From the woods, closer, to the house, whole at the screen's right, past the menu on the left
  protected readonly from: View = { edge: 'right', at: 1100, zoom: 1.12 };
  protected readonly to: View = { edge: 'right', at: 1425, zoom: 1 };
  protected readonly look = 0.55;
  private readonly panes: Pane[] = [];
  /** When the next window goes dark. */
  private nextDark = 8;
  /** The storm: what it lights, only where the picture is sky, and the lightnings being seen. */
  private readonly storm = new Container();
  private readonly cloudLight = new Sprite();
  private readonly bolt = new Graphics();
  private readonly flashes: Flash[] = [];
  private round: Texture | null = null;
  private stopListening: (() => void) | null = null;

  protected pictures() {
    return PICTURES;
  }

  protected build(p: Record<keyof typeof PICTURES, Texture>): void {
    // The storm's light, behind everything else: the sky's cut-out keeps it off the trees, which stay dark before it
    const sky = this.place(new Sprite(p.sky), [0, 0]);
    this.round = glowTexture();
    this.cloudLight.texture = this.round;
    this.cloudLight.anchor.set(0.5);
    this.cloudLight.tint = LIGHTNING_COLOUR;
    this.storm.addChild(this.cloudLight, this.bolt);
    this.storm.setMask({ mask: sky, channel: 'alpha' });
    this.storm.visible = false;
    this.place(this.storm, [0, 0]);
    this.stopListening = onLightning((lightning) => this.strike(lightning));

    // The moon's halo, breathing
    this.light(p.moon, [1173, 51], (t) => 0.25 + 0.15 * Math.sin(t * 0.3));
    // The far mist, behind the gates
    this.mist(p.fog1, 176, -5, 4);

    // The windows: each can go dark, and each flickers a little when lit
    const part = (texture: Texture, [x, y, w, h]: readonly number[]) => {
      const piece = new Texture({ source: texture.source, frame: new Rectangle(x! - WINDOWS_AT[0], y! - WINDOWS_AT[1], w!, h!) });
      this.parts.push(piece);
      return piece;
    };
    for (const box of WINDOWS) {
      const dark = this.place(new Sprite(part(p.windowsOff, box)), [box[0], box[1]]);
      const bright = this.place(new Sprite(part(p.windowsOn, box)), [box[0], box[1]]);
      bright.blendMode = 'add';
      dark.alpha = 0;
      this.panes.push({ dark, bright, lit: 1, target: 1, until: Infinity });
    }

    // The house's warm light, and the door's with its reflection on the wet path, flickering like fire
    this.light(p.glow, [844, 0], (t) => 0.7 + 0.3 * Math.sin(t * 0.5));
    this.light(p.door, [1054, 159], (t) => fire(t));
    this.light(p.reflection, [1043, 367], (t) => fire(t));

    // The near mist and the ground mist
    this.mist(p.fog2, 182, 4, 12);
    this.mist(p.fog3, 294, -9, 24);
  }

  override destroy(): void {
    this.stopListening?.();
    super.destroy();
    this.round?.destroy(true);
  }

  /** A lightning falls: far ones only light the clouds from within; nearer ones show their bolt, thin. */
  private strike({ plane, at, power }: Lightning): void {
    const x = STORM.left + (STORM.right - STORM.left) * at;
    const y = STORM.top + (STORM.bottom - STORM.top) * Math.random();
    const reach = plane === 'far' ? 260 + 160 * Math.random() : plane === 'mid' ? 380 + 160 * Math.random() : 560;
    this.cloudLight.position.set(x, y);
    this.cloudLight.width = reach * 2;
    this.cloudLight.height = reach * (0.9 + 0.5 * Math.random());
    this.bolt.clear();
    if (plane !== 'far') {
      const width = plane === 'mid' ? 1.1 : 1.8;
      const step = plane === 'mid' ? 0.7 : 1;
      const lines: [number, number][][] = [[[x, -4]]];
      const main = lines[0]!;
      const ends = y + 40 + 90 * Math.random() * step;
      while (main.at(-1)![1] < ends) {
        const [px, py] = main.at(-1)!;
        main.push([px + (Math.random() * 2 - 1) * 22 * step, py + (12 + 20 * Math.random()) * step]);
        if (main.length > 2 && Math.random() < 0.3) {
          const branch: [number, number][] = [main.at(-1)!];
          for (let k = 0; k < 3; k++) branch.push([branch[k]![0] + (Math.random() * 2 - 1) * 26 * step, branch[k]![1] + (8 + 14 * Math.random()) * step]);
          lines.push(branch);
        }
      }
      lines.forEach((line, i) => {
        this.bolt.moveTo(line[0]![0], line[0]![1]);
        for (const [px, py] of line) this.bolt.lineTo(px, py);
        this.bolt.stroke({ width: (i === 0 ? width : width * 0.55) * 4, color: LIGHTNING_COLOUR, alpha: 0.18, cap: 'round', join: 'round' });
        this.bolt.moveTo(line[0]![0], line[0]![1]);
        for (const [px, py] of line) this.bolt.lineTo(px, py);
        this.bolt.stroke({ width: i === 0 ? width : width * 0.55, color: 0xf2f6ff, alpha: 0.9, cap: 'round', join: 'round' });
      });
    }
    const bright = (plane === 'far' ? 0.3 : plane === 'mid' ? 0.5 : 0.65) + 0.15 * power;
    const bolt = plane === 'far' ? 0 : plane === 'mid' ? 0.55 : 1;
    this.flashes.length = 0;
    this.flashes.push({ age: 0, lasts: 0.3 + 0.3 * Math.random(), bright, bolt });
    // Often it flashes again, weaker, a moment later
    if (Math.random() < 0.45) this.flashes.push({ age: -(0.25 + 0.5 * Math.random()), lasts: 0.2 + 0.25 * Math.random(), bright: bright * 0.6, bolt: 0 });
  }

  /** The lightnings being seen: none goes out evenly, each gives two or three beats. */
  private lightens(seconds: number): void {
    let light = 0;
    let bolt = 0;
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const flash = this.flashes[i]!;
      flash.age += seconds;
      if (flash.age > flash.lasts) this.flashes.splice(i, 1);
      else if (flash.age >= 0) {
        const done = flash.age / flash.lasts;
        const beat = Math.min(1, Math.abs(Math.sin(done * 9)) * (1 - done) * 1.6) * flash.bright;
        light = Math.max(light, beat);
        bolt = Math.max(bolt, beat * flash.bolt);
      }
    }
    this.storm.visible = this.flashes.length > 0;
    this.cloudLight.alpha = light;
    this.bolt.alpha = bolt;
  }

  /** Now and then a window goes dark for a while; lit, each flickers a little. */
  protected override animate(t: number, seconds: number): void {
    this.lightens(seconds);
    if (t >= this.nextDark) {
      const lit = this.panes.filter((pane) => pane.target === 1 && pane.lit > 0.99);
      const pane = lit[Math.floor(Math.random() * lit.length)];
      if (pane !== undefined) {
        pane.target = 0;
        pane.until = t + 6 + Math.random() * 12;
      }
      this.nextDark = t + 9 + Math.random() * 12;
    }
    this.panes.forEach((pane, i) => {
      if (t >= pane.until) {
        pane.target = 1;
        pane.until = Infinity;
      }
      // Out in a breath, lit again more slowly
      pane.lit += (pane.target - pane.lit) * (1 - Math.exp(-seconds * (pane.target === 0 ? 2.5 : 1.2)));
      const flicker = 0.5 + 0.5 * Math.sin(t * (2.3 + i * 0.37) + i) * Math.sin(t * (5.1 + i * 0.21));
      pane.dark.alpha = 1 - pane.lit;
      pane.bright.alpha = pane.lit * 0.18 * flicker;
    });
  }
}
