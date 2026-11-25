// Descent's main menu backdrop in the Universalis theme (themes.ts): kozka's halls of lava (brand/lava/), brought a
// little to life (scene.ts). The camera comes slowly from the falls of lava on the left, close, to the burning gate on
// the right, and stays; the lava's glow breathes and the gate's flickers; smoke wanders and swirls; embers glint; the
// banners stir and the cages swing a little. The picture is his whole, with his rough reconstruction only under the
// banners and the cages, which move. Not ported from Valkyrie.
import type { Texture } from 'pixi.js';
import bannerCentreUrl from '../../assets/lava-banner-centre.webp';
import bannerRightUrl from '../../assets/lava-banner-right.webp';
import baseUrl from '../../assets/lava-base.webp';
import cageBackUrl from '../../assets/lava-cage-back.webp';
import cageLeftUrl from '../../assets/lava-cage-left.webp';
import embersUrl from '../../assets/lava-embers.webp';
import glowCracksUrl from '../../assets/lava-glow-cracks.webp';
import glowFallsUrl from '../../assets/lava-glow-falls.webp';
import glowPortalUrl from '../../assets/lava-glow-portal.webp';
import smokeFrontUrl from '../../assets/lava-smoke-front.webp';
import smokePortalUrl from '../../assets/lava-smoke-portal.webp';
import smokeValleyUrl from '../../assets/lava-smoke-valley.webp';
import { Scene, fire, type View } from './scene.ts';

const PICTURES = {
  base: baseUrl,
  smokeValley: smokeValleyUrl,
  cageBack: cageBackUrl,
  cageLeft: cageLeftUrl,
  bannerCentre: bannerCentreUrl,
  bannerRight: bannerRightUrl,
  glowFalls: glowFallsUrl,
  glowCracks: glowCracksUrl,
  glowPortal: glowPortalUrl,
  smokePortal: smokePortalUrl,
  embers: embersUrl,
  smokeFront: smokeFrontUrl,
};

/** Cloth hanging from its top, stirring more towards its foot, by up to `amount` pixels. */
function cloth(height: number, amount: number, phase: number) {
  return (_x: number, y: number, t: number): [number, number] => {
    const down = Math.max(0, y / height) ** 1.6;
    return [amount * down * (Math.sin(t * 0.9 + y * 0.03 + phase) + 0.4 * Math.sin(t * 1.7 + phase)), 0];
  };
}

export class LavaArt extends Scene<keyof typeof PICTURES> {
  protected readonly width = 1536;
  protected readonly height = 480;
  // From the falls of lava, closer, to the gate, whole at the screen's right, past the menu on the left
  protected readonly from: View = { edge: 'left', at: 0, zoom: 1.12 };
  protected readonly to: View = { edge: 'right', at: 1536, zoom: 1 };
  protected readonly look = 0.5;

  protected pictures() {
    return PICTURES;
  }

  protected build(p: Record<keyof typeof PICTURES, Texture>): void {
    this.haze(p.smokeValley, [0, 158], 12);
    this.swing(p.cageBack, [203, 60], [226, 62], (t) => 0.02 * Math.sin(t * 0.55 + 1));
    this.swing(p.cageLeft, [86, 68], [113, 70], (t) => 0.025 * Math.sin(t * 0.48));
    this.bend(p.bannerCentre, [755, 136], 6, 12, cloth(p.bannerCentre.height, 2.5, 0));
    this.bend(p.bannerRight, [1395, 0], 6, 14, cloth(p.bannerRight.height, 3.5, 2));
    // The lava breathes; the gate burns
    this.light(p.glowFalls, [45, 51], (t) => 0.55 + 0.25 * Math.sin(t * 0.6));
    this.light(p.glowCracks, [65, 265], (t) => 0.5 + 0.25 * Math.sin(t * 0.45 + 1.3));
    this.light(p.glowPortal, [1130, 94], (t) => 0.75 * fire(t));
    this.haze(p.smokePortal, [963, 133], 10);
    this.light(p.embers, [80, 160], (t) => 0.55 + 0.3 * Math.sin(t * 1.9) * Math.sin(t * 0.7));
    this.haze(p.smokeFront, [1, 284], 16, 0.9);
  }
}
