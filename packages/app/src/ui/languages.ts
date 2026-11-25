// Valkyrie's languages as the page names them: their BCP 47 codes, for the page's lang attribute (screen readers,
// hyphenation), and their names in the language being read. Not ported from Valkyrie, whose list shows the English
// names (OptionsScreen.OpenLanguageSelection).

/** Valkyrie's languages, by the names its texts and config.ini give them, with their codes. */
export const LANGUAGE_CODES: Record<string, string> = {
  English: 'en',
  Spanish: 'es',
  French: 'fr',
  German: 'de',
  Italian: 'it',
  Portuguese: 'pt',
  Polish: 'pl',
  Russian: 'ru',
  Chinese: 'zh',
  Korean: 'ko',
  Czech: 'cs',
  Japanese: 'ja',
  Ukrainian: 'uk',
};

export function languageCode(language: string): string {
  return LANGUAGE_CODES[language] ?? 'en';
}

/** A language's name in another one as a sentence says it (español, English); the English name where the browser has none. */
export function languageInSentence(language: string, readIn: string): string {
  try {
    const name = new Intl.DisplayNames([languageCode(readIn)], { type: 'language' }).of(languageCode(language));
    if (name !== undefined && name !== '') return name;
  } catch {
    // A browser without Intl.DisplayNames
  }
  return language;
}

/** A language's name in another one, with a capital, as a list shows it; the English name where the browser has none. */
export function languageName(language: string, readIn: string): string {
  const code = languageCode(readIn);
  try {
    const name = new Intl.DisplayNames([code], { type: 'language' }).of(languageCode(language));
    if (name !== undefined && name !== '') return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
  } catch {
    // A browser without Intl.DisplayNames
  }
  return language;
}
