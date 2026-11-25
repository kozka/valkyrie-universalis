// The app's own texts (src/i18n), as the engine reads them (DictionaryI18n): one file for each of Valkyrie's
// languages, each with every key of the English one and the same {0}, {1}… in it; what they fill of Valkyrie's own texts
// (src/i18n/valkyrie), only where Valkyrie's are missing or empty; and the languages' names in the Options, in the
// language being read. Not ported from Valkyrie.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DictionaryI18n } from '@universalis/engine';
import { LANGUAGE_CODES, languageName } from '../src/ui/languages.ts';

const folder = path.join(import.meta.dirname, '..', 'src', 'i18n');
const gapsFolder = path.join(folder, 'valkyrie');
const valkyrieFolder = path.join(import.meta.dirname, '..', '..', 'engine', 'data', 'text');
const languages = Object.keys(LANGUAGE_CODES);

function lines(language: string, from = folder): string[] {
  return readFileSync(path.join(from, `Localization.${language}.txt`), 'utf8').split('\n');
}

/** A file's keys, in order. */
function keys(language: string, from = folder): string[] {
  return lines(language, from)
    .slice(1)
    .filter((line) => line !== '' && !line.startsWith('//'))
    .map((line) => line.split(',')[0]!);
}

/** A file's texts, by key: the first of each, as DictionaryI18n reads them. */
function texts(file: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const line of readFileSync(file, 'utf8').split(/\r\n|\n|\r/).slice(1)) {
    const comma = line.indexOf(',');
    if (comma > 0 && !line.startsWith('//') && !found.has(line.slice(0, comma))) found.set(line.slice(0, comma), line.slice(comma + 1));
  }
  return found;
}

function parameters(text: string): string[] {
  return [...text.matchAll(/\{\d+\}/g)].map((match) => match[0]).sort();
}

describe("the app's texts", () => {
  it("come in each of Valkyrie's languages", () => {
    const files = readdirSync(folder, { withFileTypes: true }).filter((entry) => entry.isFile());
    expect(files.map((file) => file.name).sort()).toEqual(languages.map((language) => `Localization.${language}.txt`).sort());
    for (const language of languages) expect(lines(language)[0]).toBe(`.,${language}`);
  });

  it('have every key of the English ones, once and in the same order', () => {
    const english = keys('English');
    expect(new Set(english).size).toBe(english.length);
    for (const language of languages) expect(keys(language), language).toEqual(english);
  });

  it('read in every language, with the parameters of the English ones', () => {
    const dictionary = new DictionaryI18n();
    for (const language of languages) dictionary.addData(lines(language));
    for (const key of keys('English')) {
      const values = dictionary.extractAllMatches(key);
      expect([...values.keys()].sort(), key).toEqual([...languages].sort());
      for (const [language, value] of values) {
        expect(value.trim(), `${language} ${key}`).not.toBe('');
        expect(parameters(value), `${language} ${key}`).toEqual(parameters(values.get('English')!));
      }
    }
  });
});

describe("what the app fills of Valkyrie's texts", () => {
  it('is only what its own files leave out or empty, with the parameters of its English ones', () => {
    const english = texts(path.join(valkyrieFolder, 'Localization.English.txt'));
    for (const file of readdirSync(gapsFolder)) {
      const language = /^Localization\.(\w+)\.txt$/.exec(file)![1]!;
      expect(languages, file).toContain(language);
      expect(lines(language, gapsFolder)[0]).toBe(`.,${language}`);
      const own = texts(path.join(valkyrieFolder, file));
      for (const [key, value] of texts(path.join(gapsFolder, file))) {
        expect(english.has(key), `${language} ${key} is one of Valkyrie's keys`).toBe(true);
        expect(own.get(key)?.trim() ?? '', `${language} ${key} is not translated in Valkyrie`).toBe('');
        expect(parameters(value), `${language} ${key}`).toEqual(parameters(english.get(key)!));
      }
    }
  });

  it('comes before what Valkyrie leaves empty', () => {
    const dictionary = new DictionaryI18n();
    dictionary.addData(lines('Spanish', gapsFolder));
    dictionary.addData(readFileSync(path.join(valkyrieFolder, 'Localization.Spanish.txt'), 'utf8').split('\n'));
    dictionary.addData(readFileSync(path.join(valkyrieFolder, 'Localization.English.txt'), 'utf8').split('\n'));
    dictionary.currentLanguage = 'Spanish';
    expect(dictionary.getValue('DOWNLOAD_PACKAGE')).toBe('Descargando el paquete');
    expect(dictionary.getValue('MENU')).toBe(texts(path.join(valkyrieFolder, 'Localization.Spanish.txt')).get('MENU'));
  });
});

describe("the languages' names", () => {
  it('are in the language being read, with a capital', () => {
    expect(languageName('German', 'Spanish')).toBe('Alemán');
    expect(languageName('Spanish', 'Spanish')).toBe('Español');
    expect(languageName('Spanish', 'French')).toBe('Espagnol');
    expect(languageName('Japanese', 'Japanese')).toBe('日本語');
  });
});
