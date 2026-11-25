// Not in Valkyrie (12 November 2026, kozka): how hard a monster that comes onto the board is, so that a tough one is
// marked as it comes (Hud.tsx EpicSpawn): 0 for a common one, 1 a tough one (its icon glows longer), 2 a very tough one
// (the board shakes too) and 3 a boss (its picture fills the screen a moment, in red). Mansions goes by its health for
// two investigators, as its cards print it; Descent by its traits (lieutenants and agents, huge monsters); DooM, whose
// demons have no such traits, by its names. A unique monster (a scenario's own boss) is one higher, up to 3.
// No DOM, so that its unit test runs in Node.

export type EpicTier = 0 | 1 | 2 | 3;

/** What epicTier reads of a monster: the engine's MonsterData and Monster.unique. */
export interface EpicMonster {
  game: string;
  sectionName: string;
  derivedType?: string;
  healthBase: number;
  healthPerHero: number;
  traits: readonly string[];
  unique: boolean;
}

/** DooM's demons by their pack's names: the Cyberdemon is its boss. */
const DOOM: Readonly<Record<string, EpicTier>> = {
  MonsterCyberDemon: 3,
  MonsterBaron_of_Hell: 2,
  MonsterMancubus: 2,
  MonsterCacoDemon: 1,
  MonsterRevenant: 1,
  MonsterPinky: 1,
};

export function epicTier(m: EpicMonster): EpicTier {
  const kind = m.sectionName.startsWith('CustomMonster') && m.derivedType ? m.derivedType : m.sectionName;
  const traits = new Set(m.traits.map((t) => t.toLowerCase()));
  let tier = 0;
  if (m.game === 'MoM') {
    const health = m.healthBase + 2 * m.healthPerHero;
    tier = health >= 16 ? 3 : health >= 10 ? 2 : health >= 8 ? 1 : 0;
  } else if (kind in DOOM) {
    tier = DOOM[kind]!;
  } else if (traits.has('lieutenant') || traits.has('agent')) {
    tier = 3;
  } else if (traits.has('huge')) {
    tier = 2;
  }
  if (m.unique) tier += 1;
  return Math.min(3, tier) as EpicTier;
}
