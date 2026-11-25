// Not ported from Valkyrie (7 November 2026): the editor's analysis of a Mansions scenario. It plays it many times with
// made-up investigators (simulate.ts), for each number of investigators it allows and each kind of table, and turns
// what happened into figures and advice: how long it lasts against what it says, how much of the time goes in walking,
// in looking at what gives nothing or in waiting, the rounds where nothing new happens, how it ends, and the tokens
// nobody reaches. A guide for the author, never a verdict: a table plays otherwise. Pure: no DOM.
import { LocalizationRead, QuestData } from '@universalis/engine';
import { buildMap } from './mapModel.ts';
import { blockers, endingEvents } from './blockers.ts';
import { writingAdvice } from './writing.ts';
import { investigationAdvice } from './investigation.ts';
import { interesting, KINDS, simulate, type Ending, type Kind, type Profile, type RunResult, type Spend } from './simulate.ts';

export interface HeroesFigures {
  heroes: number;
  runs: number;
  /** The simulated games' own minutes (the table's time as simulate.ts counts it). */
  minutes: { low: number; median: number; high: number };
  /** What a real table is likely to take, from the scenario's words and the simulated minutes, as the store's games show
   * (ESTIMATE), with the range two in three games fall in. */
  estimate: { low: number; likely: number; high: number };
  rounds: number;
  endings: Record<Ending, number>;
  /** Shares of all actions. */
  walking: number;
  wasted: number;
  idle: number;
  fighting: number;
  carrying: number;
  /** Mean new things a round, for the first rounds reached by most games. */
  curve: number[];
  /** Rounds (1-based) where most games met nothing new. */
  deadRounds: number[];
  /** The pacing sheet: for each of those rounds, what the games still playing met, on average, and who had nothing. */
  pace: PaceRow[];
  /** Actions an investigator takes for each that gives them something (the mean), and the longest stretch without one in a typical game. */
  beats: { mean: number; longest: number };
  /** Choices of where the story goes met in a game, on average. */
  decisions: number;
  /** A game's minutes by what they went on, on average. */
  spent: Record<Spend, number>;
  /** Rounds a game lasts, on average. */
  meanRounds: number;
  /** How games ended: the event that led to the end (or the end event itself), in how many, and in how many of those the
   * investigators were eliminated. */
  endEvents: { name: string; runs: number; eliminated: number }[];
}

export interface PaceRow {
  round: number;
  /** Share of the games still playing it. */
  playing: number;
  kinds: Record<Kind, number>;
  idleHeroes: number;
  monsters: number;
}

export interface Advice {
  level: 'wrong' | 'hint';
  key: string;
  params: (string | number)[];
  /** Components it is about, to go to them. */
  components: string[];
}

export interface Analysis {
  profile: Profile;
  figures: HeroesFigures[];
  advice: Advice[];
  /** Declared length, in minutes. */
  declared: { min: number; max: number };
  /** Where the way to an ending stopped in the games that never ended, the most frequent first. */
  blocked: { event: string; from: string | null; needs: string[]; share: number }[];
  /** Tokens on the board in some games but pressed in few of them, and tokens never on the board. */
  unreached: string[];
  neverShown: string[];
}

/** A small seeded generator, so that the same scenario gives the same figures. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]!;
}

export interface AnalyzeOptions {
  profile: Profile;
  runs: number;
  /** Told after each batch, from 0 to 1; returning false stops. */
  progress?: (done: number) => boolean | void;
}

export async function analyze(qd: QuestData, options: AnalyzeOptions): Promise<Analysis> {
  const quest = qd.quest;
  const min = Math.max(1, quest.minHero || 1);
  const max = Math.max(min, Math.min(5, quest.maxHero || 5));
  const map = buildMap(qd);
  const words = scenarioWords(quest.defaultLanguage);
  // The texts in the scenario's own language, as Game.currentQuest makes them readable when a quest is played or edited
  LocalizationRead.addRequiredLanguage(quest.defaultLanguage);
  const figures: HeroesFigures[] = [];
  const shownIn = new Map<string, number>();
  const pressedIn = new Map<string, number>();
  let games = 0;
  const ran = new Set<string>();
  const blockedIn = new Map<string, { event: string; from: string | null; needs: string[]; games: number }>();
  let unfinished = 0;
  const total = (max - min + 1) * options.runs;
  let seed = 1;
  for (let heroes = min; heroes <= max; heroes++) {
    const results: RunResult[] = [];
    for (let i = 0; i < options.runs; i++) {
      results.push(simulate(qd, map, { heroes, profile: options.profile, random: seeded(seed++) }));
      games++;
      if (games % 10 === 0) {
        if (options.progress?.(games / total) === false) throw new Error('stopped');
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
    for (const r of results) {
      for (const t of r.shown) shownIn.set(t, (shownIn.get(t) ?? 0) + 1);
      for (const t of r.pressed) pressedIn.set(t, (pressedIn.get(t) ?? 0) + 1);
    }
    const minutes = results.map((r) => r.minutes).sort((a, b) => a - b);
    const rounds = results.map((r) => r.rounds).sort((a, b) => a - b);
    const endings: Record<Ending, number> = { end: 0, eliminated: 0, stuck: 0, rounds: 0, 'quest-change': 0 };
    for (const r of results) endings[r.ending]++;
    const sum = (f: (r: RunResult) => number) => results.reduce((s, r) => s + f(r), 0);
    const actions = Math.max(
      1,
      sum((r) => r.actions.total),
    );
    const reached = quantile(rounds, 0.5);
    const curve: number[] = [];
    const deadRounds: number[] = [];
    const pace: PaceRow[] = [];
    for (let i = 0; i < reached; i++) {
      const at = results.filter((r) => r.perRound.length > i);
      if (at.length < results.length / 2) break;
      curve.push(at.reduce((s, r) => s + r.perRound[i]!.novelties, 0) / at.length);
      if (at.filter((r) => r.perRound[i]!.novelties === 0).length > at.length * 0.6) deadRounds.push(i + 1);
      const mean = (f: (x: RunResult['perRound'][number]) => number) => at.reduce((s, r) => s + f(r.perRound[i]!), 0) / at.length;
      const kinds = Object.fromEntries(KINDS.map((k) => [k, mean((x) => x.kinds[k] ?? 0)])) as Record<Kind, number>;
      pace.push({ round: i + 1, playing: at.length / results.length, kinds, idleHeroes: mean((x) => x.idleHeroes), monsters: mean((x) => x.monsters) });
    }
    const endEvents = new Map<string, { name: string; runs: number; eliminated: number }>();
    for (const r of results) {
      for (const e of r.firstRound.keys()) ran.add(e);
      if (r.endEvent === null) {
        if (r.ending !== 'stuck' && r.ending !== 'rounds') continue;
        // What held this game back on its way to an ending
        unfinished++;
        for (const b of blockers(qd, new Set(r.firstRound.keys()), r.vars, 3)) {
          const key = `${b.event} ${b.from ?? ''}`;
          const seen = blockedIn.get(key) ?? { event: b.event, from: b.from, needs: b.needs, games: 0 };
          seen.games++;
          blockedIn.set(key, seen);
        }
        continue;
      }
      const name = r.endVia ?? r.endEvent;
      const entry = endEvents.get(name) ?? { name, runs: 0, eliminated: 0 };
      entry.runs++;
      if (r.ending === 'eliminated') entry.eliminated++;
      endEvents.set(name, entry);
    }
    figures.push({
      heroes,
      runs: results.length,
      minutes: { low: quantile(minutes, 0.1), median: quantile(minutes, 0.5), high: quantile(minutes, 0.9) },
      estimate: estimateMinutes(words, quantile(minutes, 0.5)),
      rounds: reached,
      endings,
      walking: sum((r) => r.actions.move) / actions,
      wasted: sum((r) => r.actions.wasted) / actions,
      idle: sum((r) => r.actions.idle) / actions,
      fighting: sum((r) => r.actions.fight) / actions,
      carrying: sum((r) => r.actions.carry) / actions,
      curve,
      deadRounds,
      pace,
      spent: Object.fromEntries(Object.keys(results[0]!.spent).map((k) => [k, sum((r) => r.spent[k as Spend]) / results.length])) as Record<Spend, number>,
      meanRounds: sum((r) => r.rounds) / results.length,
      beats: {
        // Actions a beat takes, its own included
        mean:
          1 +
          sum((r) => r.gaps.reduce((a, b) => a + b, 0)) /
            Math.max(
              1,
              sum((r) => r.gaps.length),
            ),
        longest: quantile(
          results.map((r) => Math.max(0, ...r.gaps)).sort((a, b) => a - b),
          0.5,
        ),
      },
      decisions: sum((r) => r.perRound.reduce((a, x) => a + (x.kinds.decision ?? 0), 0)) / Math.max(1, results.length),
      endEvents: [...endEvents.values()].sort((a, b) => b.runs - a.runs),
    });
  }
  const tokens = [...qd.components.values()].filter((c): c is QuestData.Token => c instanceof QuestData.Token && c.enableClick && interesting(c)).map((c) => c.sectionName);
  const unreached = tokens.filter((t) => (shownIn.get(t) ?? 0) > games * 0.2 && (pressedIn.get(t) ?? 0) < (shownIn.get(t) ?? 0) * 0.15);
  const neverShown = tokens.filter((t) => !shownIn.has(t));
  const declared = { min: quest.lengthMin, max: quest.lengthMax };
  const blocked = [...blockedIn.values()]
    .filter((b) => b.games >= unfinished * 0.2)
    .sort((a, b) => b.games - a.games)
    .slice(0, 4)
    .map((b) => ({ event: b.event, from: b.from, needs: b.needs, share: b.games / Math.max(1, unfinished) }));
  // The ways into an ending that no game took (a victory nobody reaches), when the ending can come several ways
  const ways = new Map<string, string[]>();
  for (const c of qd.components.values()) {
    if (c instanceof QuestData.Event) for (const b of c.buttons) for (const n of b.eventNames) ways.set(n, [...(ways.get(n) ?? []), c.sectionName]);
  }
  // (a defeat by elimination that never came is no fault)
  const defeat = (name: string) => (qd.components.get(name) as QuestData.Event | undefined)?.trigger === 'Eliminated';
  const untaken = endingEvents(qd)
    .flatMap((e) => (ran.has(e) ? (ways.get(e) ?? []).filter((w) => !ran.has(w)) : [e]))
    .filter((e) => !defeat(e));
  const advice = [...advise(figures, declared, unreached, neverShown, blocked, untaken), ...writingAdvice(qd), ...investigationAdvice(qd)];
  return { profile: options.profile, figures, advice, declared, blocked, unreached, neverShown };
}

const percent = (x: number) => Math.round(x * 100);

/** Real games' minutes against what the analysis knows of a scenario, fitted on 127 scenarios of the store with 40 games or
 * more each (8 November 2026, tests/analysis-calibration.test.ts): ln(minutes) = 0.26 ln(1 + words) + 0.19 ln(1 + simulated
 * minutes) + 1.59, two in three of them within a factor of 1.34. The author's own length, where playtested, does better
 * (within 1.26); the simulated minutes alone, worse (1.45). */
export const ESTIMATE = { words: 0.26, simulated: 0.19, constant: 1.59, spread: 1.34 };

export function estimateMinutes(words: number, simulated: number): { low: number; likely: number; high: number } {
  const likely = Math.exp(ESTIMATE.words * Math.log1p(words) + ESTIMATE.simulated * Math.log1p(simulated) + ESTIMATE.constant);
  return { low: likely / ESTIMATE.spread, likely, high: likely * ESTIMATE.spread };
}

/** The words of all the scenario's texts in its own language, as the fit counted them (a line's key counts as one). */
function scenarioWords(language: string): number {
  const entries = LocalizationRead.dicts.get('qst')?.allEntries().get(language);
  let n = 0;
  for (const [, text] of entries ?? [])
    n +=
      1 +
      text
        .replace(/<[^>]*>|\{[^}]*\}/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 0).length;
  return n;
}

/** What the figures suggest to the author, the most telling first. */
function advise(figures: HeroesFigures[], declared: { min: number; max: number }, unreached: string[], neverShown: string[], blocked: Analysis['blocked'], untaken: string[]): Advice[] {
  const out: Advice[] = [];
  const all = figures.reduce((s, f) => s + f.runs, 0);
  const ends = figures.reduce((s, f) => s + f.endings.end, 0);
  const defeats = figures.flatMap((f) => f.endEvents).filter((e) => e.eliminated > 0);
  // Games that ended only in a defeat are not games with no ending: say which, and that none was won
  if (ends === 0 && defeats.length > 0)
    out.push({ level: 'wrong', key: 'ANALYSIS_ONLY_DEFEATS', params: [[...new Set(defeats.map((e) => e.name))].join(', ')], components: [...new Set(defeats.map((e) => e.name))] });
  else if (ends === 0) out.push({ level: 'wrong', key: 'ANALYSIS_NO_END', params: [], components: [] });
  const stuck = figures.reduce((s, f) => s + f.endings.stuck, 0);
  if (stuck > all * 0.2) out.push({ level: 'wrong', key: 'ANALYSIS_STUCK', params: [percent(stuck / all)], components: [] });
  // Where the games that never ended stopped, when they are not a few
  const unfinished = figures.reduce((s, f) => s + f.endings.stuck + f.endings.rounds, 0);
  for (const b of unfinished > all * 0.1 ? blocked : []) {
    const params = [percent(b.share), b.event, b.from ?? '', b.needs.join(', ')];
    const key = b.from === null ? 'ANALYSIS_BLOCKED_TRIGGER' : b.needs.length > 0 ? 'ANALYSIS_BLOCKED' : 'ANALYSIS_BLOCKED_UNCHOSEN';
    out.push({ level: 'wrong', key, params, components: [b.event, ...(b.from !== null ? [b.from] : [])] });
  }
  if (untaken.length > 0) out.push({ level: 'hint', key: 'ANALYSIS_ENDING_UNTAKEN', params: [untaken.length], components: untaken });
  if (declared.max > 0) {
    // Only when what it says lies outside the range real tables are likely to take: the estimate is rough
    const longest = Math.max(...figures.map((f) => f.estimate.low));
    const shortest = Math.min(...figures.map((f) => f.estimate.high));
    if (longest > declared.max) out.push({ level: 'hint', key: 'ANALYSIS_LONGER', params: [Math.round(longest), declared.min, declared.max], components: [] });
    if (shortest < declared.min) out.push({ level: 'hint', key: 'ANALYSIS_SHORTER', params: [Math.round(shortest), declared.min, declared.max], components: [] });
  }
  const mean = (f: (x: HeroesFigures) => number) => figures.reduce((s, x) => s + f(x), 0) / figures.length;
  if (mean((f) => f.walking) > 0.45) out.push({ level: 'hint', key: 'ANALYSIS_WALKING', params: [percent(mean((f) => f.walking))], components: [] });
  if (mean((f) => f.wasted) > 0.25) out.push({ level: 'hint', key: 'ANALYSIS_WASTED', params: [percent(mean((f) => f.wasted))], components: [] });
  if (mean((f) => f.idle) > 0.12) out.push({ level: 'hint', key: 'ANALYSIS_IDLE', params: [percent(mean((f) => f.idle))], components: [] });
  if (mean((f) => f.carrying) > 0.05) out.push({ level: 'hint', key: 'ANALYSIS_CARRYING', params: [percent(mean((f) => f.carrying))], components: [] });
  const dead = figures.at(-1)?.deadRounds ?? [];
  if (dead.length >= 2) out.push({ level: 'hint', key: 'ANALYSIS_DEAD', params: [dead.join(', ')], components: [] });
  const fewest = figures[0];
  const most = figures.at(-1);
  if (fewest !== undefined && fewest.runs > 0 && fewest.endings.eliminated > fewest.runs * 0.4)
    out.push({ level: 'hint', key: 'ANALYSIS_HARD_FEW', params: [fewest.heroes, percent(fewest.endings.eliminated / fewest.runs)], components: [] });
  if (most !== undefined && most !== fewest && most.endings.eliminated === 0 && most.fighting < 0.03) out.push({ level: 'hint', key: 'ANALYSIS_EASY_MANY', params: [most.heroes], components: [] });
  // One ending that most games reach, with the fewest and with the most investigators, when it is the investigators'
  // elimination: most store scenarios are won by most tables (half of them by four in five or more), so a victory is no news
  for (const f of new Set([figures[0], figures.at(-1)])) {
    const top = f?.endEvents[0];
    if (f !== undefined && top !== undefined && top.runs > f.runs * 0.6 && top.eliminated > top.runs / 2)
      out.push({ level: 'hint', key: 'ANALYSIS_ONE_ENDING', params: [f.heroes, percent(top.runs / f.runs), top.name], components: [top.name] });
  }
  // The pacing: a beat for each investigator every 3 or 4 actions, nobody long without anything, and choices to make
  const slowest = [...figures].sort((a, b) => b.beats.mean - a.beats.mean)[0];
  if (slowest !== undefined && slowest.beats.mean > 4) out.push({ level: 'hint', key: 'ANALYSIS_BEAT_SLOW', params: [slowest.heroes, slowest.beats.mean.toFixed(1)], components: [] });
  const longest = [...figures].sort((a, b) => b.beats.longest - a.beats.longest)[0];
  if (longest !== undefined && longest.beats.longest >= 10)
    out.push({ level: 'hint', key: 'ANALYSIS_BEAT_LONG', params: [longest.heroes, longest.beats.longest, Math.round(longest.beats.longest / 2)], components: [] });
  if (figures.length > 0 && mean((f) => f.decisions) < 1) out.push({ level: 'hint', key: 'ANALYSIS_FEW_DECISIONS', params: [mean((f) => f.decisions).toFixed(1)], components: [] });
  if (unreached.length > 0) out.push({ level: 'hint', key: 'ANALYSIS_UNREACHED', params: [unreached.length], components: unreached });
  if (neverShown.length > 0) out.push({ level: 'hint', key: 'ANALYSIS_NEVER_SHOWN', params: [neverShown.length], components: neverShown });
  return out;
}
