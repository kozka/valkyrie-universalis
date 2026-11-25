// The scenario guide: what the app knows about each scenario of Valkyrie's store for Mansions beyond the store itself
// (MoM.json), for the list's category filter, the +18 badge and Igor. It is made and kept as docs/guia-escenarios.md
// says (herramientas/guia-escenarios). Only Mansions has one; DooM's and Descent's lists go without. Not in Valkyrie.
import { Game, ValkyrieConstants } from '@universalis/engine';
import { playingDoom } from '../screens/doom.ts';
import data from './MoM.json';

/** The tags a scenario can have: by rules over its numbers ("computed") or read by a person ("judged"). */
export type GuideTag =
  | 'solo'
  | 'sixPlus'
  | 'short'
  | 'long'
  | 'hard'
  | 'combat'
  | 'littleCombat'
  | 'puzzles'
  | 'narrative'
  | 'beginners'
  | 'deduction'
  | 'replayable'
  | 'timer'
  | 'campaign'
  | 'chooseDifficulty'
  | 'multipleEndings'
  | 'hiddenRoles'
  | 'competitive'
  | 'escapeRoom'
  | 'humour'
  | 'fixedInvestigator'
  | 'adult';

/** Where a scenario mostly takes place. */
export type GuideSetting = 'mansion' | 'city' | 'town' | 'building' | 'coast' | 'ship' | 'forest' | 'jungle' | 'train' | 'otherWorld' | 'various';

export interface GuideScenario {
  /** The store's key, as the store lists the package (its identifier in any case). */
  key: string;
  store: {
    names: Record<string, string>;
    synopsis: Record<string, string>;
    author: string;
    players: [number, number];
    authorLength: [number | null, number | null];
    realLength: number | null;
    plays: number;
    rating: number | null;
    winRatio: number | null;
    difficulty: number | null;
    packs: string[];
    updated: string;
    /** The cover, as the store's list draws it: the package's address and the picture's name in it. */
    url: string;
    image: string;
  };
  files: { languages: string[]; quests: number; events: number; tiles: number; spawns: number; puzzles: number; words: number } | null;
  computed: GuideTag[];
  judged: { setting: GuideSetting | null; tags: GuideTag[]; remove?: GuideTag[]; idealPlayers: string | null; notes: string };
  review: { reviewed: boolean; comments: string };
  /** Its tags, all told: by rules, plus the judged ones, less those a reviewer took away. */
  tags: Set<GuideTag>;
}

/** The categories of the list's filter, in their order there (chosen by kozka, 23 October 2026). */
export const CATEGORIES: readonly GuideTag[] = ['beginners', 'short', 'narrative', 'combat', 'campaign', 'replayable'];

const scenarios = new Map<string, GuideScenario>();
for (const [key, raw] of Object.entries(data.scenarios as unknown as Record<string, Omit<GuideScenario, 'key' | 'tags'>>)) {
  const judged = raw.judged;
  const tags = new Set<GuideTag>([...raw.computed, ...judged.tags]);
  for (const t of judged.remove ?? []) tags.delete(t);
  // Combat said by the author wins over few spawns counted
  if (tags.has('combat')) tags.delete('littleCombat');
  scenarios.set(key.toLowerCase(), { ...raw, key, tags });
}

/** Whether the game being played has a guide: Mansions, not Descent nor DooM. */
export function hasGuide(): boolean {
  return Game.game?.gameType.typeName() === ValkyrieConstants.typeMom && !playingDoom();
}

/** What the guide says of a scenario, by its identifier, or null (not in the store when the guide was made). */
export function guideOf(identifier: string): GuideScenario | null {
  return hasGuide() ? (scenarios.get(identifier.toLowerCase()) ?? null) : null;
}

/** Every scenario of the guide. */
export function guideScenarios(): GuideScenario[] {
  return [...scenarios.values()];
}

/** A scenario's name or synopsis in the player's language, else English, else what there is. */
export function guideText(texts: Record<string, string>, lang: string): string {
  return texts[lang] ?? texts.English ?? Object.values(texts)[0] ?? '';
}
