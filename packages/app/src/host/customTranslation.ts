// Not in Valkyrie (17 October 2026, kozka's request): the player's own translation of a scenario. A zip with a
// Localization.<Language>.txt, as Valkyrie's scenarios have them, and the pictures and sounds that go with it under the
// names the scenario gives them. It is checked against the scenario and kept in this browser, one per scenario and
// language (another of the same language replaces it); when a game starts in that language, it goes into the copy of
// the package the engine has just extracted (Game.onQuestExtracted): its texts in place of the scenario's own for that
// language, and its pictures and sounds in the language's folder, where Valkyrie looks for localised media
// (Quest.findLocalisedMultimediaFile). The package itself is never changed, and saves carry the copy as it is.
import { strFromU8, unzipSync } from 'fflate';
import { ContentData, DictionaryI18n, Directory, File, Path, type QuestData } from '@universalis/engine';
import { LANGUAGE_CODES } from '../ui/languages.ts';
import type { Problem } from './scenarioPackage.ts';

/** Valkyrie's languages, as its files name them. */
const LANGUAGES = Object.keys(LANGUAGE_CODES);

const IMAGE = /\.(png|jpe?g|dds|pvr|bmp|gif|webp|tga)$/i;
const SOUND = /\.(ogg|wav|mp3)$/i;
const LOCALIZATION = /^localization\.([a-z]+)\.txt$/i;

/** What a scenario has for a translation to be checked against: its files and its texts' keys. */
export interface ScenarioTexts {
  /** Every file of the package, from its root. */
  files: string[];
  /** The keys of its texts in its own language (what a translation should cover), and those of every language. */
  keys: Set<string>;
  allKeys: Set<string>;
  /** The languages it comes in. */
  languages: string[];
}

/** A picture, sound or other file of a translation, from the scenario's root, and whether the scenario has it. */
export interface TranslationMedia {
  path: string;
  kind: 'image' | 'sound' | 'other';
  replaces: boolean;
}

export interface TranslationCheck {
  language: string | null;
  translated: number;
  total: number;
  media: TranslationMedia[];
  errors: Problem[];
  warnings: Problem[];
}

/** What is kept beside a translation, to show it without reading it. */
export interface TranslationSummary {
  language: string;
  file: string;
  translated: number;
  total: number;
  images: number;
  sounds: number;
  date: string;
}

function isMacMetadata(name: string): boolean {
  return name.startsWith('__MACOSX/') || name.split('/').some((part) => part === '.DS_Store' || part.startsWith('._'));
}

/** The files of a zip, without a Mac's, and out of the one folder a player may have zipped; null if it is not a zip. */
function zipFiles(zip: Uint8Array): Map<string, Uint8Array> | null {
  let entries: Record<string, Uint8Array>;
  try {
    entries = unzipSync(zip);
  } catch {
    return null;
  }
  const files = new Map<string, Uint8Array>();
  for (const [name, bytes] of Object.entries(entries)) {
    const path = name.split('\\').join('/');
    if (path.endsWith('/') || isMacMetadata(path)) continue;
    files.set(path, bytes);
  }
  // One folder holding everything, which is not a language's: its insides
  const tops = new Set([...files.keys()].map((p) => (p.includes('/') ? p.split('/')[0]! : '')));
  if (tops.size === 1 && !tops.has('') && !LANGUAGES.some((l) => l.toLowerCase() === [...tops][0]!.toLowerCase())) {
    const top = [...tops][0]! + '/';
    return new Map([...files].map(([p, b]) => [p.substring(top.length), b]));
  }
  return files;
}

function text(bytes: Uint8Array): string {
  return strFromU8(bytes).replace(/^\uFEFF/, '');
}

/** A Localization file's language (its first line, `.,Language`) and its keys, as Valkyrie reads them. */
export function localizationKeys(contents: string): { language: string | null; keys: Set<string> } {
  const lines = contents.includes('\r') ? contents.split('\r') : contents.split('\n');
  const first = (lines[0] ?? '').trim();
  const language = first.startsWith('.,') ? first.substring(2).trim() : null;
  const keys = new Set<string>();
  if (language === null) return { language, keys };
  // Valkyrie: DictionaryI18n.AddData, which joins an entry's lines
  const raw = new DictionaryI18n(lines).serializeMultiple().get(language) ?? [];
  for (const entry of raw) {
    const comma = entry.indexOf(',');
    const key = comma < 0 ? entry : entry.substring(0, comma);
    if (key !== '.' && key.trim() !== '') keys.add(key);
  }
  return { language, keys };
}

/** The files a quest.ini lists under [QuestText]. */
function questTextFiles(questIni: string): string[] {
  const files: string[] = [];
  let inSection = false;
  for (const raw of questIni.split(/\r?\n|\r/)) {
    const line = raw.trim();
    if (line.startsWith('[')) inSection = line.toLowerCase() === '[questtext]';
    else if (inSection && line !== '' && !line.startsWith(';') && !line.startsWith('#')) files.push(line.split('=')[0]!.trim());
  }
  return files;
}

function defaultLanguage(questIni: string): string {
  return /^\s*defaultlanguage\s*=\s*(\S+)/im.exec(questIni)?.[1] ?? 'English';
}

/** A scenario's files and texts, from its package. */
export function scenarioTextsFromPackage(bytes: Uint8Array): ScenarioTexts {
  const names: string[] = [];
  unzipSync(bytes, {
    filter: (file) => {
      names.push(file.name.split('\\').join('/'));
      return false;
    },
  });
  const wanted = new Set(names.filter((n) => /quest\.ini$/i.test(n) || /\.txt$/i.test(n)));
  const entries = unzipSync(bytes, { filter: (file) => wanted.has(file.name.split('\\').join('/')) });
  const read = (name: string) => {
    const key = Object.keys(entries).find((k) => k.split('\\').join('/').toLowerCase() === name.toLowerCase());
    return key === undefined ? null : text(entries[key]!);
  };
  return scenarioTexts(
    names.filter((n) => !n.endsWith('/')),
    read,
  );
}

/** A scenario's files and texts, from a folder of the virtual file system. */
export function scenarioTextsFromFolder(folder: string): ScenarioTexts {
  const files = Directory.getFiles(folder, '*', 1).map((f) => f.substring(folder.length + 1).split('\\').join('/'));
  return scenarioTexts(files, (name) => {
    const path = Path.combine(folder, name);
    return File.exists(path) ? File.readAllText(path).replace(/^\uFEFF/, '') : null;
  });
}

function scenarioTexts(files: string[], read: (name: string) => string | null): ScenarioTexts {
  const ini = read('quest.ini') ?? '';
  const own = defaultLanguage(ini);
  const keys = new Set<string>();
  const allKeys = new Set<string>();
  const languages: string[] = [];
  for (const name of questTextFiles(ini)) {
    const contents = read(name);
    if (contents === null) continue;
    const found = localizationKeys(contents);
    if (found.language === null) continue;
    if (!languages.includes(found.language)) languages.push(found.language);
    for (const k of found.keys) allKeys.add(k);
    if (found.language.toLowerCase() === own.toLowerCase()) for (const k of found.keys) keys.add(k);
  }
  return { files, keys: keys.size > 0 ? keys : allKeys, allKeys, languages };
}

/** Where a picture or sound of a translation goes, from the scenario's root, without its language's folder. */
function mediaPath(path: string, language: string | null): string {
  const first = path.split('/')[0]!;
  return language !== null && path.includes('/') && first.toLowerCase() === language.toLowerCase() ? path.substring(first.length + 1) : path;
}

/** Checks a translation against its scenario: what it covers, what it brings, and what is wrong with it. */
export function checkTranslation(zip: Uint8Array, scenario: ScenarioTexts, playerLanguage: string): TranslationCheck {
  const check: TranslationCheck = { language: null, translated: 0, total: scenario.keys.size, media: [], errors: [], warnings: [] };
  const files = zipFiles(zip);
  if (files === null) {
    check.errors.push({ key: 'TRANSLATION_NOT_ZIP', params: [] });
    return check;
  }
  const localizations = [...files.keys()].filter((p) => LOCALIZATION.test(Path.getFileName(p) ?? ''));
  if (localizations.length === 0) {
    check.errors.push({ key: 'TRANSLATION_NO_TEXTS_FILE', params: [] });
    return check;
  }
  const read = localizations.map((p) => ({ path: p, ...localizationKeys(text(files.get(p)!)) }));
  const languages = [...new Set(read.map((r) => r.language ?? ''))];
  if (languages.length > 1) {
    check.errors.push({ key: 'TRANSLATION_SEVERAL_LANGUAGES', params: [localizations.join(', ')] });
    return check;
  }
  const { path, language, keys } = read[0]!;
  if (language === null) {
    check.errors.push({ key: 'CHECK_LOCALIZATION_HEADER', params: [path] });
    return check;
  }
  const known = LANGUAGES.find((l) => l.toLowerCase() === language.toLowerCase());
  if (known === undefined) {
    check.errors.push({ key: 'TRANSLATION_UNKNOWN_LANGUAGE', params: [language, LANGUAGES.join(', ')] });
    return check;
  }
  check.language = known;
  const named = LOCALIZATION.exec(Path.getFileName(path) ?? '')![1]!;
  if (named.toLowerCase() !== known.toLowerCase()) check.warnings.push({ key: 'TRANSLATION_NAME_LANGUAGE', params: [path, known] });

  check.translated = [...scenario.keys].filter((k) => keys.has(k)).length;
  const unknown = [...keys].filter((k) => !scenario.allKeys.has(k));
  if (check.translated === 0) check.warnings.push({ key: 'TRANSLATION_NOTHING_TRANSLATED', params: [] });
  else if (unknown.length > 0) check.warnings.push({ key: 'TRANSLATION_UNKNOWN_TEXTS', params: [String(unknown.length), unknown.slice(0, 5).join(', ')] });

  const scenarioFiles = new Set(scenario.files.map((f) => f.toLowerCase()));
  for (const file of files.keys()) {
    if (localizations.includes(file)) continue;
    const media = mediaPath(file, known);
    check.media.push({ path: media, kind: IMAGE.test(file) ? 'image' : SOUND.test(file) ? 'sound' : 'other', replaces: scenarioFiles.has(media.toLowerCase()) });
  }
  const unused = check.media.filter((m) => !m.replaces);
  if (unused.length > 0) check.warnings.push({ key: 'TRANSLATION_UNUSED_FILES', params: [String(unused.length), unused.slice(0, 5).map((m) => m.path).join(', ')] });

  if (scenario.languages.some((l) => l.toLowerCase() === known.toLowerCase())) check.warnings.push({ key: 'TRANSLATION_REPLACES_OWN', params: [known] });
  if (known.toLowerCase() !== playerLanguage.toLowerCase()) check.warnings.push({ key: 'TRANSLATION_OTHER_LANGUAGE', params: [known, playerLanguage] });
  return check;
}

/** Where a scenario's translations are kept: beside Valkyrie's own folders for the game, never inside its package. */
function folder(identifier: string): string {
  return Path.combine(ContentData.gameTypePath, 'Translations', identifier.toLowerCase());
}

/** The kept translation of a scenario into a language (a zip that stays on disk until a game needs it). */
export function translationFile(identifier: string, language: string): string {
  return Path.combine(folder(identifier), language + '.zip');
}

/** The translations kept for a scenario, by what was found when each was loaded. */
export function savedTranslations(identifier: string): TranslationSummary[] {
  const at = folder(identifier);
  if (!Directory.exists(at)) return [];
  return Directory.getFiles(at, '*.json')
    .flatMap((f) => {
      try {
        const summary = JSON.parse(File.readAllText(f)) as TranslationSummary;
        return File.exists(translationFile(identifier, summary.language)) ? [summary] : [];
      } catch {
        return [];
      }
    })
    .sort((a, b) => a.language.localeCompare(b.language));
}

/** Keeps a translation that passed its check; true when it replaces one of the same language. */
export function saveTranslation(identifier: string, zip: Uint8Array, fileName: string, check: TranslationCheck): boolean {
  const language = check.language!;
  const replaced = File.exists(translationFile(identifier, language));
  Directory.createDirectory(folder(identifier));
  File.writeAllBytes(translationFile(identifier, language), zip);
  const summary: TranslationSummary = {
    language,
    file: fileName,
    translated: check.translated,
    total: check.total,
    images: check.media.filter((m) => m.kind === 'image' && m.replaces).length,
    sounds: check.media.filter((m) => m.kind === 'sound' && m.replaces).length,
    date: new Date().toISOString(),
  };
  File.writeAllText(Path.combine(folder(identifier), language + '.json'), JSON.stringify(summary));
  return replaced;
}

export function removeTranslation(identifier: string, language: string): void {
  for (const file of [translationFile(identifier, language), Path.combine(folder(identifier), language + '.json')]) if (File.exists(file)) File.delete(file);
}

/**
 * Puts a translation into a scenario's extracted copy (questPath): its texts in place of the scenario's own files for
 * its language, or as a new file its quest.ini lists, and its other files in the language's folder.
 */
export function applyTranslation(questPath: string, zip: Uint8Array, language: string): void {
  const files = zipFiles(zip);
  if (files === null) return;
  const localization = [...files.keys()].find((p) => LOCALIZATION.test(Path.getFileName(p) ?? ''));
  if (localization === undefined) return;
  const contents = files.get(localization)!;
  const iniPath = Path.combine(questPath, 'quest.ini');
  const ini = File.readAllText(iniPath);
  // The scenario's own files in that language: the translation in the first, the others emptied, so that its texts win
  const own = questTextFiles(ini).filter((name) => {
    const path = Path.combine(questPath, name);
    return File.exists(path) && localizationKeys(File.readAllText(path).replace(/^\uFEFF/, '')).language?.toLowerCase() === language.toLowerCase();
  });
  if (own.length > 0) {
    File.writeAllBytes(Path.combine(questPath, own[0]!), contents);
    for (const name of own.slice(1)) File.writeAllText(Path.combine(questPath, name), '.,' + language + '\n');
  } else {
    let name = `Localization.${language}.txt`;
    for (let i = 2; File.exists(Path.combine(questPath, name)); i++) name = `Localization.${language}.${i}.txt`;
    File.writeAllBytes(Path.combine(questPath, name), contents);
    const section = /^\s*\[QuestText\]\s*$/im.exec(ini);
    const eol = ini.includes('\r\n') ? '\r\n' : '\n';
    File.writeAllText(iniPath, section === null ? `${ini}${eol}[QuestText]${eol}${name}${eol}` : ini.substring(0, section.index + section[0].length) + eol + name + ini.substring(section.index + section[0].length));
  }
  for (const [path, bytes] of files) {
    if (path === localization) continue;
    File.writeAllBytes(Path.combine(questPath, language, mediaPath(path, language)), bytes);
  }
}

/** Game.onQuestExtracted: the player's translation into the language being played, if they keep one. */
export function addPlayersTranslation(q: QuestData.Quest, language: string): void {
  const file = translationFile(q.identifier, language);
  if (!File.exists(file)) return;
  try {
    applyTranslation(q.path, File.readAllBytes(file), language);
  } catch (e) {
    // A translation that cannot be used must not stop the game: it starts as the scenario comes
    console.warn(`The translation of ${q.identifier} into ${language} was not used: ${String(e)}`);
  }
}
