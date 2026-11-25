// Not in Valkyrie: what each game's menus sound like (menuAmbience.ts plays it): an ambience that never repeats itself,
// made of a bed of wind and of sounds now and then, each time another file at another pitch, loudness and side; and
// over it the game's list of music (appMusic.ts). kozka's choices, 10 November 2026.
import type { PieceName } from './appMusic.ts';
import type { MusicTiming, Range } from './menuSchedule.ts';

const FILES = import.meta.glob<string>('../assets/sound/*.mp3', { eager: true, query: '?url', import: 'default' });

/** The address of one of the app's sounds, by its file's name in assets/sound/ without .mp3. */
export function soundUrl(name: string): string {
  return FILES[`../assets/sound/${name}.mp3`]!;
}

export type MenuGame = 'MoM' | 'D2E' | 'DooM';

/** How near a lightning falls: far ones only light the clouds. */
export type Plane = 'far' | 'mid' | 'near';

/** The wind under everything: its files cross-fade one into another, each at another speed, and it comes in gusts. */
export interface Bed {
  files: readonly string[];
  level: number;
  /** The speed each file plays at (lower is deeper), and where its low-pass filter wanders, in Hz. */
  rate: Range;
  lowpass: Range;
}

/** A sound now and then. */
export interface Sometimes {
  files: readonly string[];
  /** Seconds between two, and before the first. */
  every: Range;
  first: Range;
  volume: Range;
  rate: Range;
  /** The side it comes from, from -1 at the left to 1 at the right. */
  pan: Range;
  /** A low-pass filter, in Hz, that makes it sound farther away. */
  lowpass?: Range;
  /** Seconds it takes to come in and to go, for a sound without a start of its own. */
  fade?: number;
  /** A lightning that is seen first (onLightning), and the seconds its thunder takes to come. */
  lightning?: Plane;
  delay?: Range;
}

export interface MenuSound {
  music: readonly PieceName[];
  timing: MusicTiming & { fadeIn: number };
  bed?: Bed;
  sometimes: readonly Sometimes[];
  /** A cave's echo on the sounds now and then: how long it rings, in seconds, and how loud. */
  echo?: { seconds: number; level: number };
}

const WINDS = ['wind-1', 'wind-2', 'wind-3', 'wind-4', 'wind-5', 'wind-6'];
const FAR_THUNDER = ['thunder-far-1', 'thunder-far-2', 'thunder-far-3', 'thunder-far-4', 'thunder-far-5', 'thunder-far-6'];
const NEAR_THUNDER = ['thunder-near-1', 'thunder-near-2', 'thunder-near-3', 'thunder-near-4', 'thunder-near-5', 'thunder-near-6', 'thunder-near-7'];

/** The music waits 5 s after the ambience, fades in, and leaves 35 s of ambience alone after each piece. */
const OVER_AMBIENCE = { firstAfter: 5, gap: 35, fadeIn: 4 };

export const MENU_SOUNDS: Record<MenuGame, MenuSound> = {
  // A draught through the dwarven halls, and now and then stones falling, somewhere
  D2E: {
    music: ['descent-a-new-earth', 'descent-kingsfall', 'descent-dungeons-and-dragons'],
    timing: OVER_AMBIENCE,
    bed: { files: WINDS, level: 0.55, rate: [0.65, 0.95], lowpass: [260, 620] },
    echo: { seconds: 2.8, level: 0.4 },
    sometimes: [
      { files: ['cave-debris-1', 'cave-debris-2', 'cave-debris-3', 'cave-debris-4'], every: [9, 26], first: [4, 10], volume: [0.1, 0.3], rate: [0.7, 1.1], pan: [-0.9, 0.9], lowpass: [900, 4000] },
      { files: ['cave-stone-1', 'cave-stone-2', 'cave-stone-3'], every: [14, 40], first: [8, 20], volume: [0.07, 0.2], rate: [0.6, 1], pan: [-0.9, 0.9] },
      { files: ['cave-rockfall'], every: [70, 160], first: [30, 70], volume: [0.2, 0.4], rate: [0.6, 0.9], pan: [-0.7, 0.7], lowpass: [500, 1500] },
      { files: ['cave-water'], every: [40, 90], first: [12, 30], volume: [0.12, 0.28], rate: [0.85, 1.1], pan: [-0.8, 0.8], fade: 2 },
    ],
  },
  // A breeze before the mansion, and a storm far away, to the left of the house: mostly behind the clouds
  MoM: {
    music: ['mansions-ghost-town', 'mansions-the-carnival-tape'],
    timing: OVER_AMBIENCE,
    bed: { files: WINDS, level: 0.4, rate: [0.8, 1.1], lowpass: [700, 2200] },
    sometimes: [
      { files: FAR_THUNDER, every: [16, 42], first: [6, 14], volume: [0.22, 0.45], rate: [0.8, 1.05], pan: [-0.8, -0.15], lowpass: [500, 1600], lightning: 'far', delay: [1.4, 3] },
      { files: FAR_THUNDER, every: [50, 110], first: [25, 50], volume: [0.4, 0.65], rate: [0.85, 1.1], pan: [-0.7, -0.1], lowpass: [1500, 5000], lightning: 'mid', delay: [0.6, 1.2] },
      { files: NEAR_THUNDER, every: [140, 300], first: [70, 140], volume: [0.45, 0.7], rate: [0.9, 1.05], pan: [-0.6, -0.1], lightning: 'near', delay: [0.15, 0.4] },
    ],
  },
  // DooM has no ambience yet: its music at once, with a breath between pieces
  DooM: {
    music: ['doom-menu', 'doom-torn-flesh'],
    timing: { firstAfter: 0, gap: 6, fadeIn: 0 },
    sometimes: [],
  },
};

/** The app's screens where a game's menu sound plays, and its music's credits show. */
export const MENU_SCREENS: ReadonlySet<string> = new Set(['main-menu', 'content-import', 'options', 'about', 'quest-selection', 'quest-load-error', 'content-select', 'content-download', 'quest-details', 'saves']);
