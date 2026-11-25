// A scenario's files as Valkyrie reads them (QuestData.LoadQuestData with IniRead, the localization with
// DictionaryI18n), kept as the files say them, for the editor's checks. Not ported from Valkyrie. What reading finds
// (a duplicate section, a line of spaces, a file that is not there) goes into `problems`.
import { DictionaryI18n } from '../../Content/DictionaryI18n.ts';
import { split, trim } from '../../platform/CSharp.ts';
import { decodeText } from '../../platform/TextDecoding.ts';
import { File, fileSystem, Path } from '../../platform/SystemIO.ts';
import { normalizePath } from '../../platform/VirtualFileSystem.ts';
import { IniRead, type IniData } from '../../ValkyrieTools/IniRead.ts';
import { ValkyrieDebug } from '../../ValkyrieTools/ValkyrieDebug.ts';
import type { QuestFiles } from '../QuestEditor.ts';
import { Problems } from './Problem.ts';

/** QuestData.AddData's types, by the start of the section's name, in its order. */
const TYPES = ['Tile', 'Door', 'Token', 'UI', 'Event', 'Spawn', 'MPlace', 'QItem', 'StartingItem', 'Puzzle', 'CustomMonster', 'Activation'];

/** The type Valkyrie gives a section by its name, or null when it ignores the section. StartingItem is a QItem. */
export function componentType(name: string): string | null {
  for (const type of TYPES) if (name.indexOf(type) === 0) return type === 'StartingItem' ? 'QItem' : type;
  return null;
}

/** The types that are events in Valkyrie (QuestData.Event and the classes that extend it). */
export const EVENT_TYPES: ReadonlySet<string> = new Set(['Event', 'Door', 'Token', 'UI', 'Spawn', 'Puzzle']);

export interface RawComponent {
  name: string;
  type: string | null;
  /** The file it is in, as [QuestData] names it ('quest.ini' for the quest file). */
  source: string;
  data: Map<string, string>;
}

/** Where to read from: the folder on the virtual file system, or texts by file name (QuestEditor.filesToSave). */
type Reader = (file: string) => Uint8Array | null;

export class ScenarioFiles {
  /** The quest's folder. */
  readonly folder: string;
  readonly quest = new Map<string, string>();
  readonly questTextFiles: string[] = [];
  readonly questDataFiles: string[] = [];
  /** Every section of the data files in Valkyrie's order (quest.ini, then [QuestData]), the ignored ones too. */
  readonly components = new Map<string, RawComponent>();
  /** Every text by language: the files of one language merged, the first time a key appears winning. */
  readonly texts = new Map<string, Map<string, string>>();
  /** The language each localization file says it is (its first line). */
  readonly textFileLanguage = new Map<string, string>();
  readonly problems = new Problems();

  private constructor(folder: string) {
    this.folder = folder;
  }

  /** The files of the quest folder holding this quest.ini. */
  static read(questIni: string): ScenarioFiles {
    const folder = Path.getDirectoryName(questIni)!;
    const scenario = new ScenarioFiles(folder);
    scenario.load((file) => {
      const path = Path.combine(folder, file);
      return File.exists(path) ? File.readAllBytes(path) : null;
    });
    return scenario;
  }

  /** What the editor would save (QuestEditor.filesToSave), with the quest folder for everything else. */
  static fromFiles(folder: string, files: QuestFiles): ScenarioFiles {
    const scenario = new ScenarioFiles(folder);
    const encoder = new TextEncoder();
    scenario.load((file) => {
      const text = files.data.get(file) ?? files.localization.get(file);
      if (text !== undefined) return encoder.encode(text);
      const path = Path.combine(folder, file);
      return File.exists(path) ? File.readAllBytes(path) : null;
    });
    return scenario;
  }

  get defaultLanguage(): string {
    return this.quest.get('defaultlanguage') ?? 'English';
  }

  /** A text as Valkyrie finds it for the player: the default language, else any language that has it, not blank. */
  text(key: string, language: string = this.defaultLanguage): string | null {
    for (const lang of [language, this.defaultLanguage, ...this.texts.keys()]) {
      const value = this.texts.get(lang)?.get(key);
      if (value !== undefined && value.trim() !== '') return value;
    }
    return null;
  }

  /** The names of the components of these types, in order. */
  ofType(...types: string[]): string[] {
    return [...this.components.values()].filter((c) => c.type !== null && types.includes(c.type)).map((c) => c.name);
  }

  /** Whether a file of the folder exists, and its name as it is on disk when its letter case differs. */
  fileOnDisk(file: string): { exists: boolean; actual?: string } {
    const requested = normalizePath(Path.combine(this.folder, file));
    const actual = fileSystem().actualFilePath(requested);
    if (actual === null) return { exists: false };
    if (actual === requested) return { exists: true };
    // Only what the scenario names counts, not the letter case of the folder it was put in
    const folder = normalizePath(this.folder);
    const inside = requested.startsWith(folder + '/');
    const named = inside ? requested.substring(folder.length + 1) : requested;
    const real = inside ? actual.substring(folder.length + 1) : actual;
    return named === real ? { exists: true } : { exists: true, actual: real };
  }

  private load(read: Reader): void {
    const ini = this.readIni('quest.ini', read);
    if (ini === null) {
      this.problems.breaks('quest-file-missing', 'quest.ini');
      return;
    }
    const quest = ini.data.get('Quest');
    if (quest === undefined) this.problems.breaks('quest-section-missing', 'quest.ini');
    else for (const [k, v] of quest) this.quest.set(k, v);
    for (const file of ini.data.get('QuestData')?.keys() ?? []) if (file.length > 0) this.questDataFiles.push(file);
    for (const file of ini.data.get('QuestText')?.keys() ?? []) if (file.length > 0) this.questTextFiles.push(file);

    // QuestData.LoadQuestData: the texts first, all in one dictionary
    const all = new DictionaryI18n();
    for (const file of this.questTextFiles) {
      const bytes = read(file);
      if (bytes === null) {
        this.problems.wrong('text-file-missing', 'quest.ini', { file }, 'QuestText');
        continue;
      }
      this.checkCase(file, 'QuestText');
      const text = decodeText(bytes);
      const lines = text.includes('\r') ? text.split('\r') : text.split('\n');
      // DictionaryI18n.AddData takes the first line's second part as the language, whatever the line is
      if (!/^\s*\.\s*,/.test(lines[0] ?? '')) this.problems.wrong('text-file-header', file, { line: (lines[0] ?? '').substring(0, 60) });
      const logged = ScenarioFiles.logged(() => {
        all.addData(lines);
        const one = new DictionaryI18n(lines);
        for (const [language, raw] of one.serializeMultiple()) {
          this.textFileLanguage.set(file, language);
          const seen = new Set<string>();
          for (const line of raw.slice(1)) {
            if (trim(line).indexOf('//') === 0) continue;
            const parts = split(line, [','], 2);
            if (parts.length !== 2) {
              // DictionaryI18n leaves out a line without a comma
              if (trim(line) !== '') this.problems.hint('text-line-no-comma', file, { line: line.substring(0, 60) });
              continue;
            }
            if (seen.has(parts[0]!)) this.problems.wrong('text-key-repeated', file, { key: parts[0]! });
            seen.add(parts[0]!);
          }
        }
      });
      if (logged.some((m) => m.startsWith('Failed to parse language data properly'))) this.problems.breaks('text-file-unclosed', file);
      this.checkLineEndings(file, bytes);
    }
    for (const [language, entries] of all.allEntries()) this.texts.set(language, entries);

    // Then quest.ini and the [QuestData] files, each section in order
    for (const file of ['quest.ini', ...this.questDataFiles]) {
      const data = file === 'quest.ini' ? ini : this.readIni(file, read);
      if (data === null) {
        this.problems.breaks('data-file-missing', 'quest.ini', { file }, 'QuestData');
        continue;
      }
      if (file !== 'quest.ini') this.checkCase(file, 'QuestData');
      for (const [name, section] of data.data) {
        if (file === 'quest.ini' && (name === 'Quest' || name === 'QuestText' || name === 'QuestData')) continue;
        const known = this.components.get(name);
        if (known !== undefined) {
          this.problems.breaks('component-twice', name, { first: known.source, second: file });
          continue;
        }
        const type = componentType(name);
        if (type === null) this.problems.hint('section-unknown', name, { file });
        this.components.set(name, { name, type, source: file, data: section });
      }
    }
  }

  /** A data file read as IniRead reads it, with what it logs; null when it is not there or cannot be read. */
  private readIni(file: string, read: Reader): IniData | null {
    const bytes = read(file);
    if (bytes === null) return null;
    const lines = decodeText(bytes).split(/\r\n|\r|\n/);
    let data: IniData | null = null;
    const logged = ScenarioFiles.logged(() => {
      try {
        data = IniRead.readFromStringArray(lines, file);
      } catch {
        // IniRead reads a line of only spaces with s.Trim()[0], which throws: Valkyrie stops; the checks read on without it
        const line = lines.findIndex((l) => l.length > 0 && l.trim().length === 0);
        this.problems.breaks('ini-space-line', file, { line: line + 1 });
        data = IniRead.readFromStringArray(lines.filter((l) => !(l.length > 0 && l.trim().length === 0)), file);
      }
    });
    for (const message of logged) {
      const section = /^Warning: duplicate section "(.*)" in /s.exec(message);
      const key = /^Warning: duplicate "(.*)" data in section "(.*)" in /s.exec(message);
      if (section) this.problems.wrong('ini-section-repeated', file, { section: section[1]! });
      else if (key) this.problems.wrong('ini-key-repeated', key[2]!, { file, key: key[1]! });
      else if (message.startsWith('Warning: empty section')) this.problems.hint('ini-section-empty-name', file);
      else if (/^Warning: data .* without section in /s.test(message)) this.problems.hint('ini-data-outside', file);
    }
    return data;
  }

  /** Valkyrie runs on Windows, Linux, macOS and Android: a name with other letter case only works on Windows. */
  private checkCase(file: string, section: string): void {
    const onDisk = this.fileOnDisk(file);
    if (onDisk.actual !== undefined) this.problems.breaks('file-letter-case', 'quest.ini', { file, actual: onDisk.actual }, section);
  }

  /** DictionaryI18n splits on '\r' alone as soon as a file has one, so lines ended by '\n' alone join the one before. */
  private checkLineEndings(file: string, bytes: Uint8Array): void {
    let crlf = 0;
    let cr = 0;
    let lf = 0;
    for (let i = bytes.indexOf(0x0d); i !== -1; i = bytes.indexOf(0x0d, i + 1)) {
      if (bytes[i + 1] === 0x0a) crlf++;
      else cr++;
    }
    for (let i = bytes.indexOf(0x0a); i !== -1; i = bytes.indexOf(0x0a, i + 1)) lf++;
    lf -= crlf;
    if ((crlf > 0 ? 1 : 0) + (cr > 0 ? 1 : 0) + (lf > 0 ? 1 : 0) > 1) this.problems.breaks('text-line-endings-mixed', file, { crlf, lf, cr });
  }

  private static logged(f: () => void): string[] {
    const messages: string[] = [];
    const stop = ValkyrieDebug.onLog((message) => {
      if (message) messages.push(message);
    });
    try {
      f();
    } finally {
      stop();
    }
    return messages;
  }
}
