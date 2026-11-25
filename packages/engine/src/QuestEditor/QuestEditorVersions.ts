// The versions of a scenario that the editor keeps. Not in Valkyrie, whose editor writes over the files: before a save
// changes them, the scenario's .ini and Localization.*.txt files (those it lists and those the save writes; never its
// pictures or sounds) go as they are into a zip of their own, beside the Editor folder
// (<game>/EditorVersions/<scenario>/<time>.zip), so that a save that went wrong can be taken back, also after the
// browser was closed. The newest KEEP versions stay. Beside them, the draft: what the editor holds and has not saved,
// kept while it changes (draft-<time>.zip), so that it can be taken up again when the editor closed without saving it;
// and the problems its author asked not to be told about again (ignored.txt).
import { unzipSync, zipSync, type Zippable } from 'fflate';
import { IniRead } from '../ValkyrieTools/IniRead.ts';
import { Game } from '../Game.ts';
import { Directory, File, Path } from '../platform/SystemIO.ts';
import type { QuestFiles } from './QuestEditor.ts';

/** A version kept of a scenario. */
export interface QuestVersion {
  /** Its zip. */
  path: string;
  /** When it was kept, in milliseconds since 1970. */
  time: number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const DRAFT = /^draft-(\d+)\.zip$/;
const IGNORED = 'ignored.txt';

function same(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export class QuestEditorVersions {
  /** How many versions of a scenario are kept. */
  static keep = 20;
  /** The clock, which tests set. */
  static now: () => number = () => Date.now();

  /** Where the versions of the scenario in this folder are kept: named as it is inside the Editor folder. */
  static folderOf(questFolder: string): string {
    // QuestEditSelection.editorLocation
    const editor = Game.appData() + Path.DirectorySeparatorChar + Game.get().gameType.typeName() + '/Editor';
    const inEditor = questFolder.toLowerCase().startsWith(editor.toLowerCase() + '/');
    const name = inEditor ? questFolder.substring(editor.length + 1) : Path.getFileName(questFolder);
    return Path.combine(Path.getDirectoryName(editor)!, 'EditorVersions', name);
  }

  /**
   * Before a save writes these texts (by file, relative to the quest's folder): keeps the scenario's files as they
   * are, unless none of them would change. Returns the version's zip, or null.
   */
  static beforeSave(questFolder: string, texts: ReadonlyMap<string, string>): string | null {
    const names = new Set(texts.keys());
    // The files the quest.ini on disk lists, so that the version is the whole scenario as it was
    const questIni = Path.combine(questFolder, 'quest.ini');
    if (File.exists(questIni)) {
      const ini = IniRead.readFromIni(questIni);
      for (const section of ['QuestData', 'QuestText']) {
        for (const file of ini?.get(section)?.keys() ?? []) if (file.length > 0) names.add(file);
      }
    }
    const kept: Zippable = {};
    let changes = false;
    for (const name of names) {
      const path = Path.combine(questFolder, name);
      const text = texts.get(name);
      if (!File.exists(path)) {
        if (text !== undefined) changes = true;
        continue;
      }
      const bytes = File.readAllBytes(path);
      kept[name] = bytes;
      if (text !== undefined && !same(bytes, encoder.encode(text))) changes = true;
    }
    if (!changes || Object.keys(kept).length === 0) return null;
    return QuestEditorVersions.store(questFolder, kept);
  }

  /** The versions kept of the scenario in this folder, the newest first. */
  static list(questFolder: string): QuestVersion[] {
    const folder = QuestEditorVersions.folderOf(questFolder);
    if (!Directory.exists(folder)) return [];
    return Directory.getFiles(folder, '*.zip')
      .map((path) => ({ path, time: Number(Path.getFileNameWithoutExtension(path)) }))
      .filter((v) => Number.isInteger(v.time))
      .sort((a, b) => b.time - a.time);
  }

  /** The names of the files a version holds, relative to the quest's folder. */
  static filesOf(version: string): string[] {
    return Object.keys(unzipSync(File.readAllBytes(version))).sort();
  }

  /** Writes a version's files back into the scenario's folder; the files it replaces are kept first as a version. */
  static restore(questFolder: string, version: string): void {
    const files = unzipSync(File.readAllBytes(version));
    const now: Zippable = {};
    for (const name of Object.keys(files)) {
      const path = Path.combine(questFolder, name);
      if (File.exists(path)) now[name] = File.readAllBytes(path);
    }
    if (Object.keys(now).length > 0) QuestEditorVersions.store(questFolder, now);
    for (const [name, bytes] of Object.entries(files)) {
      const path = Path.combine(questFolder, name);
      Directory.createDirectory(Path.getDirectoryName(path)!);
      File.writeAllBytes(path, bytes);
    }
  }

  /** Keeps what the editor holds and has not saved (the texts Save would write), in place of the last draft. */
  static keepDraft(questFolder: string, files: QuestFiles): void {
    const entries: Zippable = {};
    for (const [name, text] of files.localization) entries['text/' + name] = encoder.encode(text);
    for (const [name, text] of files.data) entries['data/' + name] = encoder.encode(text);
    QuestEditorVersions.dropDraft(questFolder);
    const folder = QuestEditorVersions.folderOf(questFolder);
    Directory.createDirectory(folder);
    File.writeAllBytes(Path.combine(folder, 'draft-' + QuestEditorVersions.now() + '.zip'), zipSync(entries));
  }

  /** The draft of the scenario in this folder, or null. */
  static draft(questFolder: string): QuestVersion | null {
    const folder = QuestEditorVersions.folderOf(questFolder);
    if (!Directory.exists(folder)) return null;
    for (const path of Directory.getFiles(folder, '*.zip')) {
      const name = DRAFT.exec(Path.getFileName(path));
      if (name !== null) return { path, time: Number(name[1]) };
    }
    return null;
  }

  /** The texts a draft holds, as Save would write them. */
  static draftFiles(draft: string): QuestFiles {
    const files: QuestFiles = { localization: new Map(), data: new Map(), unreadable: [] };
    for (const [entry, bytes] of Object.entries(unzipSync(File.readAllBytes(draft)))) {
      const text = decoder.decode(bytes);
      if (entry.startsWith('text/')) files.localization.set(entry.substring(5), text);
      else if (entry.startsWith('data/')) files.data.set(entry.substring(5), text);
    }
    return files;
  }

  /** Forgets the draft: it was saved, or thrown away. */
  static dropDraft(questFolder: string): void {
    const folder = QuestEditorVersions.folderOf(questFolder);
    if (!Directory.exists(folder)) return;
    for (const path of Directory.getFiles(folder, '*.zip')) if (DRAFT.test(Path.getFileName(path))) File.delete(path);
  }

  /** The problems of the scenario its author asked not to be told about again (problemSignature), kept beside its versions. */
  static ignored(questFolder: string): string[] {
    const path = Path.combine(QuestEditorVersions.folderOf(questFolder), IGNORED);
    if (!File.exists(path)) return [];
    return File.readAllText(path)
      .split('\n')
      .filter((line) => line !== '');
  }

  static setIgnored(questFolder: string, signatures: readonly string[]): void {
    const folder = QuestEditorVersions.folderOf(questFolder);
    const path = Path.combine(folder, IGNORED);
    if (signatures.length === 0) {
      if (File.exists(path)) File.delete(path);
      return;
    }
    Directory.createDirectory(folder);
    File.writeAllText(path, signatures.join('\n') + '\n');
  }

  /** Forgets the versions of a scenario, as when it is deleted. */
  static forget(questFolder: string): void {
    const folder = QuestEditorVersions.folderOf(questFolder);
    if (Directory.exists(folder)) Directory.delete(folder, true);
  }

  private static store(questFolder: string, files: Zippable): string {
    const folder = QuestEditorVersions.folderOf(questFolder);
    Directory.createDirectory(folder);
    let time = QuestEditorVersions.now();
    while (File.exists(Path.combine(folder, time + '.zip'))) time++;
    const path = Path.combine(folder, time + '.zip');
    File.writeAllBytes(path, zipSync(files));
    for (const old of QuestEditorVersions.list(questFolder).slice(QuestEditorVersions.keep)) File.delete(old.path);
    return path;
  }
}
