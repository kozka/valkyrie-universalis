// The scenario editor's own texts, the dictionary 'edi' (editor/i18n), which only development builds load. Not ported
// from Valkyrie; its editor's own words are Valkyrie's keys ('val'), which ui/text.ts reads.
import { DictionaryI18n, LocalizationRead } from '@universalis/engine';

export { edi } from './edi.ts';

const FILES = import.meta.glob<string>('./i18n/Localization.*.txt', { query: '?raw', import: 'default', eager: true });

if (LocalizationRead.selectDictionary('edi') === null) {
  const dict = new DictionaryI18n();
  for (const text of Object.values(FILES)) dict.addData(text.split('\n').map((line) => line.replace(/\r$/, '')));
  LocalizationRead.addDictionary('edi', dict);
}

/** When a version or a draft was kept, in the language of the page, as the list of saved games shows a date. */
export function keptAt(time: number): string {
  return new Intl.DateTimeFormat(document.documentElement.lang || undefined, { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(time));
}
