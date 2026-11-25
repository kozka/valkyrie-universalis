// DooM: Descent played with the community's DooM content pack, under a button of its own on the game selection and with
// a list of only its missions; Descent's list leaves them out. Not in Valkyrie, where DooM is one of Descent's packs.
import { Game, HeroData } from '@universalis/engine';

/** The pack's id, which its missions list in their packs. */
export const DOOM_PACK = 'DooM';

let doom = false;

/** Whether Descent is being played as DooM. */
export function playingDoom(): boolean {
  return doom;
}

/** Descent as DooM or not: DooM always loads its pack, plain Descent never, whatever the collection says. */
export function playDoom(on: boolean): void {
  doom = on;
  const game = Game.get();
  game.packsLeftOut = on ? [] : [DOOM_PACK];
  game.packsAdded = on ? [DOOM_PACK] : [];
}

/** Whether a scenario is one of DooM's missions: it needs DooM's pack. */
export function isDoomQuest(packs: readonly string[]): boolean {
  return packs.includes(DOOM_PACK);
}

/** Whether DooM's pack is on this device, downloaded from the store. */
export function hasDoomPack(): boolean {
  return Game.get().cd.allPacks.some((pack) => pack.id === DOOM_PACK);
}

/**
 * The heroes a player chooses among: DooM's marines only when playing DooM, without Descent's own heroes, which its
 * missions are not made for (16 October 2026); if DooM's pack brings none, all of them, as Valkyrie lists them. The
 * editor's test chooses among them too (editor/test.ts).
 */
export function heroesToChoose(game: Game): string[] {
  const all = game.cd.keys(HeroData);
  if (!playingDoom()) return all;
  const marines = all.filter((hero) => game.cd.get(HeroData, hero).sets.includes(DOOM_PACK));
  return marines.length > 0 ? marines : all;
}
