// The app's themes: how its screens look, beyond Valkyrie's rules. Universalis, the default, has kozka's pictures
// behind the screens (here), and will bring for each game its own frames for windows, buttons and icons; the plain
// colours keep the screens flat, on the colour chosen (theme.css); and a Valkyrie classic theme, with its colours and
// its look for the nostalgic, is to come. A theme is chosen in Options (ui/preferences.ts). Not ported from Valkyrie.
import fullKnight from '../assets/menu-full.webp';
import fortressBase from '../assets/fortress-base.webp';
import runeHallFull from '../assets/d2e-menu-full.webp';
import mansionBase from '../assets/mansion-base.webp';
import { MenuArt } from '../screens/menuArt.ts';
import { theme } from '../ui/preferences.ts';
import { FortressArt } from './universalis/fortressArt.ts';
import { RuneHallArt } from './universalis/runeHallArt.ts';
import { MansionArt } from './universalis/mansionArt.ts';

/** Where a backdrop goes: the game selection, or a game's main menu. */
export type Place = 'start' | 'MoM' | 'D2E' | 'DooM';

/** A drawing that moves over a backdrop's picture, on wide screens (Backdrop.tsx). */
export interface Art {
  start(): Promise<void>;
  destroy(): void;
}

/** A picture behind a screen: still on phones, moving on wide screens when it has an art. */
export interface Backdrop {
  /** The whole picture, and the point of it kept in view when the screen cuts it, on wide screens and on phones. */
  still: string;
  position: string;
  phonePosition: string;
  art?: new (host: HTMLElement) => Art;
}

const UNIVERSALIS: Partial<Record<Place, Backdrop>> = {
  // The winged knight before the castle, with the black sun (brand/menu/)
  start: { still: fullKnight, position: '0% 40%', phonePosition: '42% 40%', art: MenuArt },
  // The mansion behind its gates, in the mist (brand/mansion/)
  MoM: { still: mansionBase, position: '100% 55%', phonePosition: '74% 50%', art: MansionArt },
  // The dwarven hall under the mountain, before the rune gate (brand/d2e-menu/; the halls of lava, brand/lava/, before
  // 2 November 2026)
  D2E: { still: runeHallFull, position: '100% 45%', phonePosition: '78% 45%', art: RuneHallArt },
  // The slayer before the fortress of hell (brand/fortress/)
  DooM: { still: fortressBase, position: '0% 45%', phonePosition: '33% 45%', art: FortressArt },
};

/** The backdrop of a place in the theme chosen, if it has one. */
export function backdropOf(place: Place): Backdrop | undefined {
  return illustrated() ? UNIVERSALIS[place] : undefined;
}

/** Whether the theme has kozka's pictures: Universalis, or its classic screens. */
export function illustrated(): boolean {
  const chosen = theme();
  return chosen === 'universalis' || chosen === 'classic';
}

/** Whether the screens are Universalis' new ones (HeroRoom.tsx), not the classic ones. */
export function newScreens(): boolean {
  return theme() === 'universalis';
}
