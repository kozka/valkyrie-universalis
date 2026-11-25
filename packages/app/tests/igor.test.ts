// Igor's choices (src/igor/recommend.ts) over the real scenario guide (src/guide/MoM.json): at most three questions,
// players first, and adventures that fit the players, are not played and need only the player's packs.
import { describe, expect, it } from 'vitest';
import guide from '../src/guide/MoM.json';
import type { GuideScenario, GuideTag } from '../src/guide/guide.ts';
import { igorLines } from '../src/igor/lines.ts';
import { candidates, MOST_QUESTIONS, nextQuestion, OPTIONS, recommend, type Answers, type Player, type QuestionId } from '../src/igor/recommend.ts';

// The guide as guide.ts reads it, without the game (guide.ts asks the game which one is played)
const all: GuideScenario[] = Object.entries(guide.scenarios as unknown as Record<string, Omit<GuideScenario, 'key' | 'tags'>>).map(([key, raw]) => {
  const tags = new Set<GuideTag>([...raw.computed, ...raw.judged.tags]);
  for (const t of raw.judged.remove ?? []) tags.delete(t);
  return { ...raw, key, tags };
});
const everyPack = new Set(all.flatMap((s) => s.store.packs));
const player = (played: string[] = [], packs: Set<string> = everyPack): Player => ({ played: (k) => played.includes(k), packs, lang: 'Spanish' });
/** A fixed sequence instead of chance, so that a test sees the same each time. */
const fixed = () => 0.5;

describe('Igor', () => {
  it('asks how many play first, and never more than three questions', () => {
    let answers: Answers = {};
    const asked: string[] = [];
    for (;;) {
      const q = nextQuestion(all, answers, player(), fixed);
      if (q === null) break;
      asked.push(q);
      answers = { ...answers, [q]: OPTIONS[q][0] };
    }
    expect(asked[0]).toBe('players');
    expect(asked.length).toBeLessThanOrEqual(MOST_QUESTIONS);
    expect(new Set(asked).size).toBe(asked.length);
  });

  it('offers three adventures for the players, none played', () => {
    const played = ['Possessed', 'DisturbanceAtTheDocks'];
    const picks = recommend(all, { players: '3', style: 'mystery' }, player(played), 3, fixed);
    expect(picks).toHaveLength(3);
    for (const s of picks) {
      expect(played).not.toContain(s.key);
      expect(s.store.players[0]).toBeLessThanOrEqual(3);
      expect(s.store.players[1]).toBeGreaterThanOrEqual(3);
    }
  });

  it('only offers what the collection can play', () => {
    const base = new Set(['MoMBase']);
    for (const s of candidates(all, {}, player([], base))) expect(s.store.packs.every((p) => base.has(p))).toBe(true);
  });

  it('prefers beginners for new players and short ones when time is short', () => {
    const picks = recommend(all, { players: '2', experience: 'new', time: 'short' }, player(), 3, fixed);
    expect(picks.filter((s) => s.tags.has('beginners') || s.tags.has('short')).length).toBeGreaterThanOrEqual(2);
  });

  it('speaks Valkyrie\'s 13 languages, each with every kind of line and every answer', () => {
    const english = igorLines('English');
    const langs = ['Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Polish', 'Czech', 'Russian', 'Ukrainian', 'Chinese', 'Japanese', 'Korean'];
    for (const lang of langs) {
      const lines = igorLines(lang);
      expect(lines, lang).not.toBe(english);
      for (const [key, value] of Object.entries(english)) {
        const own = (lines as unknown as Record<string, unknown>)[key];
        if (Array.isArray(value)) expect((own as string[]).length, `${lang} ${key}`).toBeGreaterThan(0);
        else expect(own, `${lang} ${key}`).toBeTruthy();
      }
      for (const q of Object.keys(OPTIONS) as QuestionId[]) {
        expect(lines.questions[q].ask.length, `${lang} ${q}`).toBeGreaterThan(0);
        for (const option of OPTIONS[q]) expect(lines.questions[q].options[option], `${lang} ${q}:${option}`).toBeTruthy();
      }
      expect(Object.keys(lines.acks).sort(), lang).toEqual(Object.keys(english.acks).sort());
      expect(Object.keys(lines.why.tags).sort(), lang).toEqual(Object.keys(english.why.tags).sort());
      for (const text of [...lines.newsIntro, lines.why.players, lines.why.minutes]) expect(text, lang).toContain('{0}');
    }
  });
});
