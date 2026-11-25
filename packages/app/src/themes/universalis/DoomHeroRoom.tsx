// DooM's hero selection in the Universalis theme (kozka's design, 31 October 2026): the ship's bridge over hell
// behind (doomRoomArt.ts: its panels' lights, its monitors working, the burning city through the window) and his steel
// frames over it, laid out as in his mock, at 0.8 of his picture (brand/doom-hero-room/). The screen is Descent's
// (DescentHeroRoom.tsx FramedHeroRoom), with this look. Not ported from Valkyrie.
import type { HeroSelection, Quest } from '@universalis/engine';
import roomUrl from '../../assets/doom-heroes-room.webp';
import titleUrl from '../../assets/doom-heroes-title.webp';
import titleGlowUrl from '../../assets/doom-heroes-title-glow.webp';
import ringsUrl from '../../assets/doom-heroes-rings.webp';
import ringsGlowUrl from '../../assets/doom-heroes-rings-glow.webp';
import holeUrl from '../../assets/doom-heroes-hole.webp';
import previousUrl from '../../assets/doom-heroes-previous.webp';
import nextUrl from '../../assets/doom-heroes-next.webp';
import backUrl from '../../assets/doom-heroes-back.webp';
import backGlowUrl from '../../assets/doom-heroes-back-glow.webp';
import confirmUrl from '../../assets/doom-heroes-confirm.webp';
import confirmGlowUrl from '../../assets/doom-heroes-confirm-glow.webp';
import plateUrl from '../../assets/doom-heroes-plate.webp';
import circleLitUrl from '../../assets/doom-heroes-circle-lit.webp';
import circleDarkUrl from '../../assets/doom-heroes-circle-dark.webp';
import ringLitUrl from '../../assets/doom-heroes-ring-lit.webp';
import ringDarkUrl from '../../assets/doom-heroes-ring-dark.webp';
import diamondUrl from '../../assets/doom-heroes-diamond.webp';
import { FramedHeroRoom, type Box, type RoomLook, type Tile } from './DescentHeroRoom.tsx';
import { DoomRoomArt } from './doomRoomArt.ts';

const S = 0.8;
/** A box of kozka's frames (1671×941) on the stage, its middle (835.5) under the stage's and its top at `top`. */
function placed(x: number, y: number, w: number, h: number, from: number, top: number): Box {
  return [836 + (x - 835.5) * S, top + (y - from) * S, w * S, h * S];
}

/** The rings' sheet: the frames from (259, 194), 1152×571; each frame (its box in the frames) and its hole. */
const SHEET_X = 259;
const SHEET_Y = 194;
const FRAMES = [
  [259, 194, 279, 281, 310, 237],
  [547, 195, 282, 280, 599, 237],
  [842, 195, 281, 279, 893, 236],
  [1133, 195, 278, 279, 1184, 236],
  [263, 487, 279, 278, 314, 529],
  [548, 487, 279, 277, 599, 529],
  [839, 487, 281, 277, 892, 529],
  [1130, 487, 280, 278, 1181, 529],
] as const;
/** A hole's size in the frames, and its picture's, which reaches 6 pixels under the steel all round. */
const HOLE_W = 177;
const HOLE_H = 170;
const RINGS_TOP = 226;

const TILES: readonly Tile[] = FRAMES.map(([x, y, w, h, hx, hy]) => ({
  box: placed(x, y, w, h, SHEET_Y, RINGS_TOP),
  sheet: [x - SHEET_X, y - SHEET_Y, w, h] as const,
  hole: placed(hx - 6, hy - 6, HOLE_W + 12, HOLE_H + 12, SHEET_Y, RINGS_TOP),
  plate: placed(hx + 2, hy + 180, HOLE_W - 4, 32, SHEET_Y, RINGS_TOP),
}));

/** The bar, from row 767 of the frames, at 752. */
const bar = (x: number, y: number, w: number, h: number) => placed(x, y, w, h, 767, 752);

const DOOM: RoomLook = {
  look: 'doom',
  Art: DoomRoomArt,
  still: roomUrl,
  title: { url: titleUrl, glow: titleGlowUrl, box: placed(316, 10, 1034, 168, 10, 40), text: placed(470, 58, 698, 76, 10, 40) },
  dots: [736, 196, 200, 16],
  sheet: { url: ringsUrl, glow: ringsGlowUrl, width: 1152, height: 571 },
  tiles: TILES,
  holeMask: holeUrl,
  previous: { url: previousUrl, box: [277, 362, 96, 192] },
  next: { url: nextUrl, box: [1299, 362, 94.4, 192] },
  back: { url: backUrl, glow: backGlowUrl, box: bar(8, 767, 458, 169), text: bar(100, 800, 325, 100) },
  confirm: { url: confirmUrl, glow: confirmGlowUrl, box: bar(1205, 767, 458, 169), text: bar(1245, 800, 325, 100) },
  plate: { url: plateUrl, box: bar(455, 767, 761, 169) },
  circles: {
    x: 836 + (830.4 - 835.5) * S,
    y: 752 + (850 - 767) * S,
    room: 582,
    step: 114,
    size: 136 * S,
    dark: 91.2,
    inset: 15.4,
    diamond: 36 * S,
    lit: circleLitUrl,
    darkUrl: circleDarkUrl,
    ringLit: ringLitUrl,
    ringDark: ringDarkUrl,
    diamondUrl,
  },
  gems: [],
};

export function DoomHeroRoom(props: { quest: Quest; selection: HeroSelection | null; heroes: string[] }) {
  return <FramedHeroRoom look={DOOM} {...props} />;
}
