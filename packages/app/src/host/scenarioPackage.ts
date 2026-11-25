// Not in Valkyrie: what the app checks in a scenario file the player adds (QuestSelectionScreen addScenario), so that
// they hear why it does not open instead of «not a scenario» (16 October 2026). A zip whose scenario sits inside one
// folder, as a player makes by zipping the folder itself, is taken out of it; the rest are the author mistakes that stop
// Valkyrie from opening it, and a few it opens but plays badly. No DOM, so that Vitest can test it.
import { IniRead, QuestData, copyZipEntries, readZipDirectory, readZipEntry, type ZipEntry } from '@universalis/engine';

/** Something to tell the player: one of the app's texts and its parameters. */
export interface Problem {
  key: string;
  params: string[];
}

export type PackageCheck =
  | { kind: 'not-zip' }
  | { kind: 'no-quest-ini' }
  | {
      kind: 'scenario';
      /** The package to keep: as given, or taken out of its folder. */
      bytes: Uint8Array;
      /** The [Quest] section of its quest.ini. */
      quest: Map<string, string>;
      /** The folder it was taken out of, or null. */
      fixedFrom: string | null;
      /** What stops it from opening (the list leaves it out). */
      errors: Problem[];
      /** What it opens with but plays badly. */
      warnings: Problem[];
    };

/** At most this many warnings of one kind, so that the window stays short. */
const MAX_OF_A_KIND = 5;

const decoder = new TextDecoder();

function isMacMetadata(name: string): boolean {
  return name.startsWith('__MACOSX/') || name.split('/').some((part) => part === '.DS_Store' || part.startsWith('._'));
}

/** The one folder that holds quest.ini, when the zip has none at its top and only that folder. */
function wrappingFolder(entries: readonly ZipEntry[]): string | null {
  const files = entries.filter((e) => !e.isDirectory && !isMacMetadata(e.name));
  if (files.some((e) => e.name.toLowerCase() === 'quest.ini')) return null;
  const tops = new Set(files.map((e) => e.name.split('/')[0]!));
  if (tops.size !== 1) return null;
  const folder = [...tops][0]!;
  return files.some((e) => e.name.toLowerCase() === `${folder.toLowerCase()}/quest.ini`) ? folder : null;
}

/** Reads, checks and, if it only needs taking out of a folder, mends a scenario package. */
export function checkScenarioPackage(given: Uint8Array): PackageCheck {
  let entries: ZipEntry[];
  try {
    entries = readZipDirectory(given);
  } catch {
    return { kind: 'not-zip' };
  }
  let bytes = given;
  const folder = wrappingFolder(entries);
  if (folder !== null) {
    const prefix = folder + '/';
    const copies = entries
      .filter((e) => e.name.startsWith(prefix) && e.name.length > prefix.length && !isMacMetadata(e.name))
      .map((entry) => ({ name: entry.name.substring(prefix.length), archive: given, entry }));
    try {
      bytes = copyZipEntries(copies);
      entries = readZipDirectory(bytes);
    } catch {
      return { kind: 'not-zip' };
    }
  }
  const byName = new Map(entries.filter((e) => !e.isDirectory).map((e) => [e.name.toLowerCase().replace(/\\/g, '/'), e]));
  const read = (name: string): string | null => {
    const entry = byName.get(name.toLowerCase().replace(/\\/g, '/'));
    if (entry === undefined) return null;
    try {
      return decoder.decode(readZipEntry(bytes, entry));
    } catch {
      return null;
    }
  };
  const questText = read('quest.ini');
  if (questText === null) return { kind: 'no-quest-ini' };

  const errors: Problem[] = [];
  const warnings: Problem[] = [];
  const blankLine = (file: string, text: string) => {
    // IniRead reads l.Trim()[0]: a line of only spaces or tabs stops the whole file
    const lines = text.split(/\r\n|\r|\n/);
    const at = lines.findIndex((line) => line.length > 0 && line.trim().length === 0);
    if (at >= 0) errors.push({ key: 'CHECK_BLANK_LINE', params: [file, String(at + 1)] });
    return at < 0;
  };
  if (!blankLine('quest.ini', questText)) return { kind: 'scenario', bytes, quest: new Map(), fixedFrom: folder, errors, warnings };

  const parse = (file: string, text: string) => {
    try {
      return IniRead.readFromString(text);
    } catch (e) {
      errors.push({ key: 'CHECK_UNREADABLE', params: [file, e instanceof Error ? e.message : String(e)] });
      return null;
    }
  };
  const ini = parse('quest.ini', questText);
  if (ini === null) return { kind: 'scenario', bytes, quest: new Map(), fixedFrom: folder, errors, warnings };
  const quest = ini.data.get('Quest') ?? new Map<string, string>();
  const format = Number.parseInt(quest.get('format') ?? '0', 10);
  const { minumumFormat, currentFormat } = QuestData.Quest;
  if (!(format >= minumumFormat && format <= currentFormat)) {
    errors.push({ key: 'CHECK_FORMAT', params: [quest.get('format') ?? '', String(minumumFormat), String(currentFormat)] });
  }
  const textFiles = ini.data.get('QuestText');
  if (textFiles === undefined) errors.push({ key: 'CHECK_NO_QUESTTEXT', params: [] });
  for (const file of textFiles?.keys() ?? []) {
    const text = read(file);
    if (text === null) {
      warnings.push({ key: 'CHECK_MISSING_FILE', params: [file] });
      continue;
    }
    // DictionaryI18n reads the language after the first line's comma
    const first = (text.includes('\r') ? text.split('\r') : text.split('\n'))[0] ?? '';
    if (!first.includes(',')) errors.push({ key: 'CHECK_LOCALIZATION_HEADER', params: [file] });
  }

  // The components of every data file, and the events their buttons name
  const sections = new Map<string, Map<string, string>>();
  for (const file of ini.data.get('QuestData')?.keys() ?? []) {
    const text = read(file);
    if (text === null) {
      warnings.push({ key: 'CHECK_MISSING_FILE', params: [file] });
      continue;
    }
    if (!blankLine(file, text)) continue;
    for (const [name, data] of parse(file, text)?.data ?? []) if (!sections.has(name)) sections.set(name, data);
  }
  let missingEvents = 0;
  for (const [name, data] of sections) {
    for (const [key, value] of data) {
      if (!/^event\d+$/i.test(key)) continue;
      for (const target of value.split(/\s+/)) {
        if (target === '' || sections.has(target) || target.toLowerCase().endsWith('.ini')) continue;
        if (missingEvents++ < MAX_OF_A_KIND) warnings.push({ key: 'CHECK_MISSING_EVENT', params: [name, target] });
      }
    }
  }
  if (missingEvents > MAX_OF_A_KIND) warnings.push({ key: 'CHECK_MORE', params: [String(missingEvents - MAX_OF_A_KIND)] });
  return { kind: 'scenario', bytes, quest, fixedFrom: folder, errors, warnings };
}
