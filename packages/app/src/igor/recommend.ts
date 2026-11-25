// How Igor chooses: at most three questions, each the one that best splits what is left, and then the three
// adventures that best fit the answers, among those the player has not played and can play with their collection.
// It reads only the scenario guide (guide/guide.ts), so it works offline too. Not in Valkyrie.
import type { GuideScenario, GuideTag } from '../guide/guide.ts';

export type QuestionId = 'players' | 'experience' | 'time' | 'style' | 'format';

/** Each question's answers, in the order Igor offers them. */
export const OPTIONS: Record<QuestionId, readonly string[]> = {
  players: ['1', '2', '3', '4', '5'],
  experience: ['new', 'some', 'veteran'],
  time: ['short', 'evening', 'night'],
  style: ['story', 'action', 'mystery', 'surprise'],
  format: ['oneNight', 'saga'],
};

/** The most questions Igor asks before he answers (kozka, 23 October 2026). */
export const MOST_QUESTIONS = 3;

export type Answers = Partial<Record<QuestionId, string>>;

/** How much each answer likes (more than 0) or dislikes (less than 0) each tag of the guide. */
const WEIGHTS: Record<string, Partial<Record<GuideTag, number>>> = {
  'experience:new': { beginners: 3, hard: -2.5, long: -1, short: 0.5, chooseDifficulty: 0.5 },
  'experience:some': { beginners: -0.5, hard: -0.5 },
  'experience:veteran': { beginners: -2, hard: 1.5, long: 0.5, puzzles: 0.3 },
  'time:short': { short: 3, long: -3 },
  'time:evening': { short: -0.5, long: -1.5 },
  'time:night': { long: 2, short: -2 },
  'style:story': { narrative: 2.5, littleCombat: 0.5, combat: -0.5 },
  'style:action': { combat: 2.5, littleCombat: -2, narrative: -0.5 },
  'style:mystery': { deduction: 2.5, puzzles: 1, narrative: 0.5 },
  'style:surprise': { replayable: 1, multipleEndings: 0.8, escapeRoom: 0.5, humour: 0.3 },
  'format:oneNight': { campaign: -2.5 },
  'format:saga': { campaign: 3 },
};

/** The player's situation: what they have played, the packs of their collection, their language. */
export interface Player {
  played: (key: string) => boolean;
  packs: ReadonlySet<string>;
  lang: string;
}

/** A sequel or a later part, by what the guide's notes say of it: Igor would rather offer the first part. */
const LATER_PART = /\b(segunda|tercera|cuarta|[uú]ltima) parte|\bparte [2-4]\b|parte (ii|iii|iv)\b|\bsecuela\b|\bcontinuaci[oó]n\b|\bepisodio 2\b|\bcontin[uú]a\b/i;

/** Whether the player can and should be offered a scenario at all, by the answers that are hard limits. */
function admissible(s: GuideScenario, answers: Answers, player: Player): boolean {
  if (player.played(s.key)) return false;
  if (s.store.packs.some((p) => !player.packs.has(p))) return false;
  const n = answers.players === undefined ? null : Number(answers.players);
  if (n !== null) {
    const [min, max] = s.store.players;
    if (n >= 5 ? max < 5 : n < min || n > max) return false;
  }
  return true;
}

/** The scenarios Igor may still offer, by the answers so far. */
export function candidates(all: readonly GuideScenario[], answers: Answers, player: Player): GuideScenario[] {
  return all.filter((s) => admissible(s, answers, player));
}

/** How much an answer likes a scenario. */
function liking(s: GuideScenario, question: QuestionId, option: string): number {
  const weights = WEIGHTS[`${question}:${option}`] ?? {};
  let sum = 0;
  for (const [tag, weight] of Object.entries(weights)) if (s.tags.has(tag as GuideTag)) sum += weight;
  return sum;
}

/** How good a scenario is for the answers: its own worth, its fit, and whether the player can read it. */
export function score(s: GuideScenario, answers: Answers, player: Player): number {
  const rating = s.store.rating ?? 6.5;
  let total = (rating / 10) * 2 + Math.min(1, Math.log10(s.store.plays + 1) / 3.3);
  for (const [question, option] of Object.entries(answers) as [QuestionId, string][]) total += liking(s, question, option);
  const languages = s.files?.languages ?? [];
  if (languages.includes(player.lang)) total += 0.6;
  else if (languages.includes('English')) total -= player.lang === 'English' ? 0 : 0.4;
  else total -= 2;
  if (LATER_PART.test(s.judged.notes)) total -= 1.2;
  if (s.review.reviewed) total += 0.1;
  return total;
}

/**
 * The next question, or null when Igor has asked enough or there is little left to choose from. How many players
 * comes first, as it rules out the most; then the question whose answers split the rest most evenly, so that each
 * answer matters, with a little chance among the best two, so that he does not always ask in the same order.
 */
export function nextQuestion(all: readonly GuideScenario[], answers: Answers, player: Player, random: () => number = Math.random): QuestionId | null {
  const asked = Object.keys(answers).length;
  if (asked >= MOST_QUESTIONS) return null;
  if (answers.players === undefined) return 'players';
  const left = candidates(all, answers, player);
  if (left.length <= 3) return null;
  const spread = (q: QuestionId) => {
    let sum = 0;
    for (const option of OPTIONS[q]) {
      const liked = left.filter((s) => liking(s, q, option) > 0).length;
      sum += Math.min(liked, left.length - liked) / left.length;
    }
    return sum / OPTIONS[q].length;
  };
  const ranked = (Object.keys(OPTIONS) as QuestionId[])
    .filter((q) => answers[q] === undefined)
    .map((q) => ({ q, value: spread(q) }))
    .sort((a, b) => b.value - a.value);
  if (ranked.length === 0) return null;
  const pick = ranked.length > 1 && ranked[1]!.value > ranked[0]!.value * 0.8 && random() < 0.35 ? ranked[1]! : ranked[0]!;
  return pick.q;
}

/** The adventures Igor offers: the best by score, a little shuffled, and not three of the same place or author. */
export function recommend(all: readonly GuideScenario[], answers: Answers, player: Player, count = 3, random: () => number = Math.random): GuideScenario[] {
  const scored = candidates(all, answers, player).map((s) => ({ s, value: score(s, answers, player) + random() * 0.6 }));
  const chosen: GuideScenario[] = [];
  while (chosen.length < count && scored.length > 0) {
    let best = -1;
    let bestValue = -Infinity;
    scored.forEach(({ s, value }, i) => {
      let v = value;
      if (chosen.some((c) => c.store.author !== '' && c.store.author === s.store.author)) v -= 0.8;
      if (chosen.some((c) => c.judged.setting !== null && c.judged.setting === s.judged.setting)) v -= 0.3;
      if (v > bestValue) {
        bestValue = v;
        best = i;
      }
    });
    chosen.push(scored[best]!.s);
    scored.splice(best, 1);
  }
  return chosen;
}

/** The tags of a scenario that the answers asked for, to tell the player why Igor chose it. */
export function reasons(s: GuideScenario, answers: Answers): GuideTag[] {
  const out: GuideTag[] = [];
  for (const [question, option] of Object.entries(answers) as [QuestionId, string][]) {
    for (const [tag, weight] of Object.entries(WEIGHTS[`${question}:${option}`] ?? {})) {
      if (weight > 0 && s.tags.has(tag as GuideTag) && !out.includes(tag as GuideTag)) out.push(tag as GuideTag);
    }
  }
  return out;
}
