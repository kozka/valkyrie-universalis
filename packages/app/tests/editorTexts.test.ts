// The scenario editor's own texts (src/editor/i18n, the dictionary 'edi'), as the engine reads them: English and
// Spanish while the editor is only in development, with the same keys in the same order and the same parameters, and
// a text for every problem the checks can report (packages/engine/src/QuestEditor/checks), said with its names and
// numbers in place. Not ported from Valkyrie.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DictionaryI18n, LocalizationRead } from '@universalis/engine';
import { problemKey, problemText } from '../src/editor/problemText.ts';

const folder = path.join(import.meta.dirname, '..', 'src', 'editor', 'i18n');
const checks = path.join(import.meta.dirname, '..', '..', 'engine', 'src', 'QuestEditor', 'checks');
const LANGUAGES = ['English', 'Spanish'];

function lines(language: string): string[] {
  return readFileSync(path.join(folder, `Localization.${language}.txt`), 'utf8').split('\n');
}

/** A file's keys, in order, each time it gives one (comments left out). */
function keys(language: string): string[] {
  return lines(language)
    .slice(1)
    .filter((line) => line.indexOf(',') > 0 && !line.startsWith('//'))
    .map((line) => line.slice(0, line.indexOf(',')));
}

/** A file's texts by key, in order, as DictionaryI18n reads them: the first time a key comes wins. */
function texts(language: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const line of lines(language).slice(1)) {
    const comma = line.indexOf(',');
    if (comma > 0 && !line.startsWith('//') && !found.has(line.slice(0, comma))) found.set(line.slice(0, comma), line.slice(comma + 1));
  }
  return found;
}

/** The {0} and {name} a text fills in, each once: a language may say one twice. */
function parameters(text: string): string[] {
  return [...new Set([...text.matchAll(/\{(\d+|[a-z]+)\}/g)].map((m) => m[0]))].sort();
}

/**
 * The codes the checks report. Every kebab-case string of their files is one (a new string of that shape that is not
 * a code goes in NOT_CODES), and so is a one-word code given to breaks, wrong, hint or crash.
 */
const NOT_CODES = new Set<string>();
function reportedCodes(): Set<string> {
  const found = new Set<string>();
  for (const file of ['QuestChecks.ts', 'PackageChecks.ts', 'ScenarioFiles.ts']) {
    const source = readFileSync(path.join(checks, file), 'utf8');
    for (const m of source.matchAll(/'([a-z0-9]+(?:-[a-z0-9]+)+)'/g)) if (!NOT_CODES.has(m[1]!)) found.add(m[1]!);
    for (const m of source.matchAll(/\.(?:breaks|wrong|hint|crash)\(\s*'([a-z0-9]+)'/g)) found.add(m[1]!);
  }
  return found;
}

describe("the editor's texts", () => {
  it('come in English and Spanish, with the same keys in the same order', () => {
    for (const language of LANGUAGES) expect(lines(language)[0]).toBe(`.,${language}`);
    // A key given twice is read once, its first text, so the second would never be seen
    const english = keys('English');
    expect(english.filter((key, i) => english.indexOf(key) !== i)).toEqual([]);
    expect(keys('Spanish')).toEqual(english);
  });

  it('read in both languages, with the parameters of the English ones', () => {
    const dictionary = new DictionaryI18n();
    for (const language of LANGUAGES) dictionary.addData(lines(language));
    const english = texts('English');
    for (const [key, text] of english) {
      const values = dictionary.extractAllMatches(key);
      expect([...values.keys()].sort(), key).toEqual(LANGUAGES);
      for (const [language, value] of values) {
        expect(value.trim(), `${language} ${key}`).not.toBe('');
        expect(parameters(value), `${language} ${key}`).toEqual(parameters(text));
      }
    }
  });

  it('say every problem the checks can report, and no other', () => {
    const codes = reportedCodes();
    expect(codes.size).toBeGreaterThan(200);
    const english = texts('English');
    for (const code of codes) expect(english.has(problemKey(code)), code).toBe(true);
    const keys = new Set([...codes].map(problemKey));
    for (const key of english.keys()) if (key.startsWith('PROBLEM_')) expect(keys.has(key), key).toBe(true);
  });

  it('put the names and numbers of a problem in its text', () => {
    // The dictionary as the app's editor/text.ts loads it, in English
    const dictionary = new DictionaryI18n();
    for (const language of LANGUAGES) dictionary.addData(lines(language));
    LocalizationRead.removeDictionary('edi');
    LocalizationRead.addDictionary('edi', dictionary);
    expect(problemText({ level: 'wrong', code: 'event-missing', where: 'EventA', params: { target: 'EventB' } })).toBe('It goes on to EventB, which does not exist: Valkyrie skips it.');
    expect(problemText({ level: 'wrong', code: 'text-mark-unclosed', where: 'texts English', params: { key: 'EventA.text', dict: 'qst' } })).toBe(
      'EventA.text opens a {qst: lookup that is never closed: Valkyrie stops when it shows the text.',
    );
    // A crash in a component no game reaches yet (Descent): said as not happening today, with how many more like it
    expect(problemText({ level: 'wrong', code: 'add-missing-unreached', where: 'EventA', params: { target: 'TokenX', more: 2 } })).toBe(
      'It adds TokenX, which does not exist: Valkyrie stops when the event runs. Today nothing reaches it, so it does not happen yet. And 2 more like it.',
    );
  });
});
