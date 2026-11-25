// DooM's main menu backdrop in the Universalis theme (themes.ts): kozka's slayer before the fortress of hell
// (brand/fortress/), brought a little to life (scene.ts). The camera comes slowly from the burning gate on the right,
// close, to the slayer on the left, whole, and stays, the menu beside him; the gate, its sign, the volcano and the
// fortress's fires burn; mists drift at three depths; embers glint. The slayer and the rocks stay in the picture, still:
// the picture without him is only a rough reconstruction. Not ported from Valkyrie.
import type { Texture } from 'pixi.js';
import baseUrl from '../../assets/fortress-base.webp';
import embersUrl from '../../assets/fortress-embers.webp';
import firesUrl from '../../assets/fortress-fires.webp';
import fogFarUrl from '../../assets/fortress-fog-far.webp';
import fogMidUrl from '../../assets/fortress-fog-mid.webp';
import fogNearUrl from '../../assets/fortress-fog-near.webp';
import glowPortalUrl from '../../assets/fortress-glow-portal.webp';
import glowVolcanoUrl from '../../assets/fortress-glow-volcano.webp';
import signUrl from '../../assets/fortress-sign.webp';
import { Scene, fire, type View } from './scene.ts';

const PICTURES = {
  base: baseUrl,
  glowVolcano: glowVolcanoUrl,
  fires: firesUrl,
  glowPortal: glowPortalUrl,
  sign: signUrl,
  fogFar: fogFarUrl,
  fogMid: fogMidUrl,
  fogNear: fogNearUrl,
  embers: embersUrl,
};

export class FortressArt extends Scene<keyof typeof PICTURES> {
  protected readonly width = 1536;
  protected readonly height = 658;
  // From the gate, closer, to the slayer, the whole picture's left at the screen's
  protected readonly from: View = { edge: 'right', at: 1536, zoom: 1.12 };
  protected readonly to: View = { edge: 'left', at: 0, zoom: 1 };
  protected readonly look = 0.45;

  protected pictures() {
    return PICTURES;
  }

  protected build(p: Record<keyof typeof PICTURES, Texture>): void {
    this.light(p.glowVolcano, [0, 0], (t) => 0.6 + 0.3 * Math.sin(t * 0.4));
    this.light(p.fires, [676, 0], (t) => fire(t, 2));
    this.light(p.glowPortal, [1026, 9], (t) => 0.7 * fire(t) + 0.2 * Math.sin(t * 0.5));
    // The gate's sign throbs, slowly
    this.light(p.sign, [1169, 210], (t) => 0.5 + 0.5 * Math.sin(t * 0.8) ** 2);
    this.mist(p.fogFar, 219, -4, 4);
    this.mist(p.fogMid, 242, 6, 12);
    this.light(p.embers, [92, 44], (t) => 0.5 + 0.35 * Math.sin(t * 1.7) * Math.sin(t * 0.6));
    this.mist(p.fogNear, 348, -9, 22, 0.9);
  }
}
