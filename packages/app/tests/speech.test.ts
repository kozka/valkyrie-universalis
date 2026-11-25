// What the app says when it reads a text aloud (ui/spokenText.ts): no formatting tags, the symbols by name, the lines as
// pauses. Not ported from Valkyrie.
import { describe, expect, it } from 'vitest';
import { spokenParts, spokenText } from '../src/ui/spokenText.ts';

describe('a text read aloud', () => {
  it('leaves out the tags and says the lines as pauses', () => {
    expect(spokenText('<b>Look</b> around.\n\n<color=#ff0000>Run!</color>')).toBe('Look around. Run!');
    expect(spokenText('A line\nanother')).toBe('A line. another');
  });

  it("says Mansions' symbols by name and leaves no symbol character", () => {
    const said = spokenText('Test  and gain 1 ');
    expect(said).not.toMatch(/[-]/);
    expect(said).toMatch(/^Test \S+ and gain 1 \S+$/);
  });
});

describe('a long text read aloud', () => {
  it('goes in parts by sentences, none longer than the limit', () => {
    const sentence = 'The old door creaks open and something waits in the dark. ';
    const said = spokenText(sentence.repeat(12));
    const parts = spokenParts(said);
    expect(parts.length).toBeGreaterThan(1);
    for (const part of parts) {
      expect(part.length).toBeLessThanOrEqual(200);
      expect(part).toMatch(/\.$/);
    }
    expect(parts.join(' ')).toBe(said);
  });

  it('keeps a short text whole and numbers with a point in them', () => {
    expect(spokenParts('Roll 3.5 dice. Then run!')).toEqual(['Roll 3.5 dice. Then run!']);
    expect(spokenParts('')).toEqual([]);
  });

  it('cuts a sentence by its clauses, its words, and a text without spaces by length', () => {
    const clauses = spokenParts(Array.from({ length: 10 }, (_, i) => `clause number ${i} goes on for a while`).join(', '), 100);
    expect(clauses.every((p) => p.length <= 100)).toBe(true);
    expect(clauses[0]).toMatch(/,$/);
    const words = spokenParts('word '.repeat(100).trim(), 50);
    expect(words.every((p) => p.length <= 50)).toBe(true);
    expect(words.join(' ')).toBe('word '.repeat(100).trim());
    expect(spokenParts('字'.repeat(450))).toEqual(['字'.repeat(200), '字'.repeat(200), '字'.repeat(50)]);
    expect(spokenParts('一つ目。二つ目！', 4)).toEqual(['一つ目。', '二つ目！']);
  });
});
