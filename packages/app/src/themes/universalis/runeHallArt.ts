// Descent's main menu backdrop in the Universalis theme, "Dwarven Runestone" (2 November 2026, themes.ts): kozka's
// dwarven hall under the mountain (brand/d2e-menu/), brought to life (scene.ts). The camera comes slowly from the bridge
// on the left, close, to the rune gate on the right, and stays. The braziers burn with blue fire, flickering, throwing
// their glow and cold sparks; the gate's runes breathe, and now and then a wave of light runs up them; the banners sway
// in the draught of the falls; the falls run; a cold mist creeps over the chasm in two layers; and the warm windows of
// the far halls flicker. Not ported from Valkyrie.
import { Container, Sprite, TilingSprite, type Texture } from 'pixi.js';
import baseUrl from '../../assets/d2e-menu-base.webp';
import fallsUrl from '../../assets/d2e-menu-falls.webp';
import firesUrl from '../../assets/d2e-menu-fires.webp';
import runesUrl from '../../assets/d2e-menu-runes.webp';
import bannerLeftUrl from '../../assets/d2e-menu-banner-left.webp';
import bannerRedUrl from '../../assets/d2e-menu-banner-red.webp';
import bannerSmallUrl from '../../assets/d2e-menu-banner-small.webp';
import bannerRightUrl from '../../assets/d2e-menu-banner-right.webp';
import { Scene, fire, type View } from './scene.ts';
import { glowTexture, painted, wobble } from './candles.ts';
import { BlueFire } from './blueFire.ts';
import { cloudTexture } from './heroRoomArt.ts';

const PICTURES = {
  base: baseUrl,
  falls: fallsUrl,
  fires: firesUrl,
  runes: runesUrl,
  bannerLeft: bannerLeftUrl,
  bannerRed: bannerRedUrl,
  bannerSmall: bannerSmallUrl,
  bannerRight: bannerRightUrl,
};

/** Each layer's corner in the picture (brand/d2e-menu/make_layers.py cut them there). */
const AT = {
  falls: [860, 70],
  fires: [449, 442],
  runes: [1185, 130],
  bannerLeft: [387, 0],
  bannerRed: [707, 91],
  bannerSmall: [878, 170],
  bannerRight: [1528, 0],
} as const;

/** The braziers' flames: where each burns. */
const BRAZIERS = [
  [461, 478],
  [793, 513],
  [901, 522],
  [1020, 518],
  [1124, 514],
  [1205, 494],
  [1431, 492],
  [1491, 607],
] as const;
/** Each brazier's fire: the middle of its bowl's rim and how tall it burns (the far ones smaller). */
const FIRES = [
  [461, 489, 30],
  [793, 520, 22],
  [901, 528, 20],
  [1020, 526, 24],
  [1124, 523, 26],
  [1205, 505, 30],
  [1431, 504, 32],
  [1491, 624, 48],
] as const;

/** The warm windows of the far halls. */
const WINDOWS = [
  [566, 488, 0.5],
  [718, 493, 0.45],
  [637, 690, 0.4],
  [270, 447, 0.55],
  [1323, 28, 0.5],
] as const;

const SPARKS = 36;

/** Cloth hanging from its pole, `pole` pixels down, stirring more towards its foot, by up to `amount` pixels. */
function cloth(height: number, pole: number, amount: number, phase: number) {
  return (_x: number, y: number, t: number): [number, number] => {
    const down = Math.max(0, (y - pole) / (height - pole)) ** 1.5;
    const gust = 0.6 + 0.4 * Math.sin(t * 0.21 + phase);
    return [amount * gust * down * (Math.sin(t * 0.8 + y * 0.025 + phase) + 0.35 * Math.sin(t * 1.9 - y * 0.05 + phase)), -0.6 * amount * down * Math.abs(Math.sin(t * 0.8 + phase))];
  };
}

/** A band, opaque across its middle rows and fading to nothing above and below. */
function bandTexture(): Texture {
  return painted(4, 128, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 4, 128);
  });
}

/** Thin bright streaks down a tile, for running water. */
function streaksTexture(): Texture {
  return painted(64, 256, (c) => {
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 256;
      const g = c.createLinearGradient(0, y, 0, y + 60);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, `rgba(255,255,255,${0.35 + Math.random() * 0.5})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g;
      for (const dy of [0, -256, 256]) c.fillRect(x, y + dy, 1 + Math.random() * 1.5, 60);
    }
  });
}

/** A cold spark. */
function sparkTexture(): Texture {
  return painted(16, 16, (c) => {
    const g = c.createRadialGradient(8, 8, 0, 8, 8, 8);
    g.addColorStop(0, 'rgba(235,250,255,1)');
    g.addColorStop(0.3, 'rgba(120,200,255,0.85)');
    g.addColorStop(1, 'rgba(40,120,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 16, 16);
  });
}

interface Spark {
  sprite: Sprite;
  vx: number;
  vy: number;
  life: number;
  age: number;
  phase: number;
}

export class RuneHallArt extends Scene<keyof typeof PICTURES> {
  protected readonly width = 1672;
  protected readonly height = 940;
  // From the bridge, closer, to the rune gate, whole at the screen's right, past the menu on the left
  protected readonly from: View = { edge: 'left', at: 120, zoom: 1.15 };
  protected readonly to: View = { edge: 'right', at: 1672, zoom: 1.02 };
  protected readonly look = 0.45;

  private readonly made: Texture[] = [];
  private water: TilingSprite[] = [];
  private chasmMists: TilingSprite[] = [];
  private fires: Sprite | null = null;
  private fire: BlueFire | null = null;
  private runes: Sprite | null = null;
  private wave: Sprite | null = null;
  private runesLit: Sprite | null = null;
  private readonly speeds: number[] = [];
  private glows: Sprite[] = [];
  private windows: Sprite[] = [];
  private readonly sparks: Spark[] = [];

  protected override pictures() {
    return PICTURES;
  }

  private make(texture: Texture): Texture {
    this.made.push(texture);
    return texture;
  }

  override destroy(): void {
    super.destroy();
    for (const texture of this.made) texture.destroy(true);
    this.made.length = 0;
  }

  protected override build(p: Record<keyof typeof PICTURES, Texture>): void {
    const glow = this.make(glowTexture());

    // The falls run: bright streaks scrolling down, seen only where the water is
    const streaks = this.make(streaksTexture());
    const water = new Container();
    for (const [speed, scale, alpha] of [
      [140, 1, 0.35],
      [90, 1.6, 0.25],
    ] as const) {
      const sprite = new TilingSprite({ texture: streaks, width: p.falls.width, height: p.falls.height });
      sprite.tileScale.set(scale);
      sprite.alpha = alpha;
      sprite.tint = 0xcfe8ff;
      sprite.blendMode = 'add';
      this.speeds.push(speed);
      water.addChild(sprite);
      this.water.push(sprite);
    }
    const fallsMask = this.place(new Sprite(p.falls), AT.falls);
    this.place(water, AT.falls);
    water.setMask({ mask: fallsMask, channel: 'alpha' });

    // The warm windows of the far halls
    for (const [x, y, size] of WINDOWS) {
      const sprite = this.place(new Sprite(glow), [x, y]);
      sprite.anchor.set(0.5);
      sprite.scale.set(size);
      sprite.tint = 0xffa24a;
      sprite.blendMode = 'add';
      this.windows.push(sprite);
    }

    // The banners in the draught
    this.bend(p.bannerSmall, AT.bannerSmall, 5, 12, cloth(p.bannerSmall.height, 40, 2.2, 2.4));
    this.bend(p.bannerRed, AT.bannerRed, 6, 14, cloth(p.bannerRed.height, 45, 3.2, 0.7));
    this.bend(p.bannerLeft, AT.bannerLeft, 5, 14, cloth(p.bannerLeft.height, 20, 3.6, 0));
    this.bend(p.bannerRight, AT.bannerRight, 6, 14, cloth(p.bannerRight.height, 70, 3.4, 1.6));

    // The gate's runes, and a wave of light that runs up them now and then
    this.runes = this.place(new Sprite(p.runes), AT.runes);
    const runesLit = (this.runesLit = this.place(new Sprite(p.runes), AT.runes));
    runesLit.blendMode = 'add';
    this.wave = this.place(new Sprite(this.make(bandTexture())), [AT.runes[0], AT.runes[1]]);
    this.wave.width = p.runes.width;
    this.wave.height = 150;
    runesLit.setMask({ mask: this.wave, channel: 'alpha' });

    // The braziers: their painted fire, a blue glow over each, and sparks
    this.fires = this.place(new Sprite(p.fires), AT.fires);
    this.fire = new BlueFire(this.scene, FIRES.map(([x, y, height]) => ({ x, y, height, width: height * 0.75 })), 26);
    this.made.push(...this.fire.textures);
    for (const [x, y] of BRAZIERS) {
      const sprite = this.place(new Sprite(glow), [x, y - 8]);
      sprite.anchor.set(0.5);
      sprite.scale.set(0.75, 0.9);
      sprite.tint = 0x3aa8ff;
      sprite.blendMode = 'add';
      this.glows.push(sprite);
    }
    const spark = this.make(sparkTexture());
    for (let i = 0; i < SPARKS; i++) {
      const sprite = this.place(new Sprite(spark), [0, 0]);
      sprite.anchor.set(0.5);
      sprite.blendMode = 'add';
      const s = { sprite, vx: 0, vy: 0, life: 1, age: 0, phase: Math.random() * 10 };
      this.respawn(s);
      s.age = Math.random() * s.life;
      this.sparks.push(s);
    }

    // A cold mist creeping over the chasm, two layers at their own pace, fading above and below
    const cloud = this.make(cloudTexture());
    for (const [top, height, scale, alpha] of [
      [560, 260, 3.2, 0.2],
      [660, 280, 2.2, 0.16],
    ] as const) {
      const mist = new TilingSprite({ texture: cloud, width: this.width, height });
      mist.tileScale.set(scale, scale * 0.45);
      mist.tint = 0x9cb8e6;
      mist.alpha = alpha;
      const mask = this.place(new Sprite(this.make(bandTexture())), [0, top]);
      mask.width = this.width;
      mask.height = height;
      this.place(mist, [0, top]);
      mist.setMask({ mask, channel: 'alpha' });
      this.chasmMists.push(mist);
    }
  }

  private respawn(s: Spark): void {
    const [x, y] = BRAZIERS[Math.floor(Math.random() * BRAZIERS.length)]!;
    s.sprite.position.set(x + (Math.random() - 0.5) * 14, y - 22);
    s.vx = (Math.random() - 0.5) * 12;
    s.vy = -(25 + Math.random() * 45);
    s.life = 1.5 + Math.random() * 2.5;
    s.age = 0;
    s.sprite.scale.set(0.15 + Math.random() * 0.22);
  }

  protected override animate(t: number, seconds: number): void {
    this.water.forEach((sprite, i) => (sprite.tilePosition.y += this.speeds[i]! * seconds));
    this.chasmMists[0]!.tilePosition.x -= seconds * 7;
    this.chasmMists[1]!.tilePosition.x += seconds * 11;
    this.chasmMists[1]!.tilePosition.y = Math.sin(t * 0.08) * 12;

    // The fires flicker together, each glow on its own
    // The painted fires only as the light in the bowls; the flames are drawn
    this.fires!.alpha = 0.3 + 0.08 * fire(t * 1.3);
    this.fire!.update(t, seconds);
    this.glows.forEach((glow, i) => {
      glow.alpha = 0.22 + 0.12 * wobble(t * 0.9, i * 1.7);
    });
    for (const s of this.sparks) {
      s.age += seconds;
      if (s.age >= s.life) this.respawn(s);
      s.sprite.x += (s.vx + Math.sin(t * 2 + s.phase) * 10) * seconds;
      s.sprite.y += s.vy * seconds;
      s.sprite.alpha = Math.min(1, s.age * 4) * (1 - s.age / s.life) * (0.6 + 0.4 * Math.sin(t * 9 + s.phase));
    }

    // The runes breathe; every 9 seconds a wave of light climbs the gate
    this.runes!.alpha = 0.65 + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.8));
    const climb = (t % 9) / 3;
    this.wave!.y = AT.runes[1] + 440 - climb * 590;
    this.runesLit!.visible = climb < 1;

    this.windows.forEach((sprite, i) => {
      sprite.alpha = 0.18 + 0.08 * fire(t, i * 2.3);
    });
  }
}
