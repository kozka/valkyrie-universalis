// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/QuestEditor.cs
// The editor's buttons (MenuButton, ToolsButton) are drawn by the app's editor screen. Save is split in two, what it
// writes (filesToSave) and the writing, so that the files can be checked first; what reaches the disk is the same.
// Not in Valkyrie: before writing, Save keeps the files as they were (QuestEditorVersions), and afterwards it reads
// them back as Reload would; when they would not save the same, it puts the old ones back.
import { DictionaryI18n } from '../Content/DictionaryI18n.ts';
import { LocalizationRead } from '../Content/LocalizationRead.ts';
import { PerilData } from '../Content/PerilData.ts';
import { QuestData } from '../Content/QuestData.ts';
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { Application } from '../platform/Application.ts';
import { NewLine } from '../platform/CSharp.ts';
import { Directory, File, Path } from '../platform/SystemIO.ts';
import { Quest } from '../Quest/Quest.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { QUEST_SELECTION, QuestEditorData } from './QuestEditorData.ts';
import { QuestEditorVersions } from './QuestEditorVersions.ts';

/** The texts Save writes, by file name relative to the quest folder. */
export interface QuestFiles {
  /** Localization.<language>.txt, written first. */
  localization: Map<string, string>;
  /** quest.ini and the other .ini files, in the order Save writes them. */
  data: Map<string, string>;
  /** Not in Valkyrie: texts that no way of writing them reads back the same ("<file>: <key>"); then nothing is saved. */
  unreadable: string[];
}

/** What DictionaryI18n reads back from a localization file written with these lines. */
function readBack(language: string, lines: string[]): Map<string, string> {
  const text = lines.join(NewLine);
  const dictionary = new DictionaryI18n(text.includes('\r') ? text.split('\r') : text.split('\n'));
  return dictionary.allEntries().get(language) ?? new Map();
}

/** A text as it comes back from a file: SerializeMultiple writes a new line as \n, and a typed \n reads back as one too. */
function asReadBack(value: string): string {
  return value.replace(/\r\n|\r/g, '\n').split('\\n').join('\n');
}

function readsBack(language: string, lines: string[], texts: ReadonlyMap<string, string>): boolean {
  const got = readBack(language, lines);
  if (got.size !== texts.size) return false;
  for (const [key, value] of texts) if (got.get(key) !== asReadBack(value)) return false;
  return true;
}

/**
 * Not in Valkyrie: the lines of a language, as SerializeMultiple writes them, checked against the texts they come from.
 * A few texts do not read back the same: one that holds ",|||" swallows the lines after it, and one in quotes loses
 * them. Each of those lines is written in the first way that reads back right; the others stay as Valkyrie writes them.
 * Returns the keys that cannot be written at all.
 */
function makeReadable(language: string, lines: string[], texts: ReadonlyMap<string, string>): string[] {
  if (readsBack(language, lines, texts)) return [];
  const header = lines[0]!;
  const sentinel = new Map([['UniversalisCheck', 'x']]);
  const unreadable: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const comma = lines[i]!.indexOf(',');
    const key = lines[i]!.substring(0, comma);
    const value = texts.get(key);
    if (comma < 1 || value === undefined) continue;
    const alone = new Map([[key, value], ...sentinel]);
    if (readsBack(language, [header, lines[i]!, 'UniversalisCheck,x'], alone)) continue;
    const raw = asReadBack(value).split('\n').join('\\n');
    const ways = [key + ',|||' + raw + '|||', key + ',"' + raw.split('"').join('""') + '"', key + ',' + raw];
    const way = ways.find((line) => readsBack(language, [header, line, 'UniversalisCheck,x'], alone));
    if (way === undefined) unreadable.push(key);
    else lines[i] = way;
  }
  if (unreadable.length === 0 && !readsBack(language, lines, texts)) unreadable.push('*');
  return unreadable;
}

// Quest editor static helper class
// Valkyrie: QuestEditor.cs QuestEditor
export class QuestEditor {
  /** Not in Valkyrie: the files the last save could not write. */
  static lastSaveProblems: string[] = [];
  /** Not in Valkyrie: the files that, read back after the last save, would not save the same; it put the old ones back. */
  static lastSaveUnstable: string[] = [];

  // start editing a quest
  // Valkyrie: QuestEditor.cs QuestEditor.Begin
  static begin(path: string): void {
    const game = Game.get();
    // We load all packs for the editor, not just those selected
    for (const pack of game.cd.getPacks()) {
      game.contentLoader.loadContent(pack);
    }

    game.editMode = true;

    // new MenuButton() and new ToolsButton(): the app's editor screen draws them
    game.ui.questEditorScreen();

    // re-read quest data
    QuestEditor.reload(path);
  }

  // Reload a quest from file
  // Valkyrie: QuestEditor.cs QuestEditor.Reload
  static reload(path: string): void {
    Destroyer.dialog();

    const game = Game.get();

    // Remove all current components
    if (game.currentQuest !== null) game.currentQuest.removeAll();

    // Clean up everything marked as 'editor'
    game.ui.destroyTag(Game.EDITOR);

    // Read from file
    game.currentQuest = new Quest(new QuestData.Quest(path));

    // Is this needed?
    game.currentQuest.removeAll();

    // Add all components to the quest
    for (const name of game.currentQuest.qd.components.keys()) {
      game.currentQuest.add(name);
    }
    // Set all components to mostly transparent
    game.currentQuest.changeAlphaAll();

    // Create a new QED
    game.qed = new QuestEditorData(game.qed);
  }

  /**
   * What Save writes for the current quest (or for another one loaded, with its texts); sections, not in Valkyrie,
   * gives some components' sections (or the quest's own, by QUEST_SELECTION) as the text mode has them instead.
   */
  // Valkyrie: QuestEditor.cs QuestEditor.Save (building the texts)
  static filesToSave(
    qd: QuestData = Game.get().currentQuest!.qd,
    qst: DictionaryI18n | null = LocalizationRead.selectDictionary('qst'),
    sections: ReadonlyMap<string, string> = new Map(),
  ): QuestFiles {
    const game = Game.get();
    const nl = NewLine;
    const files: QuestFiles = { localization: new Map(), data: new Map(), unreadable: [] };
    // Add a comment at the start of the quest with the editor version
    let questData = '; Saved by version: ' + game.version + nl;

    // Save quest meta content to a string
    questData += (sections.get(QUEST_SELECTION) ?? qd.quest.toString()) + nl;

    // first we serialize dictionary to know the available languages
    if (qst !== null) {
      const localizationFiles = qst.serializeMultiple();
      const texts = qst.allEntries();

      // Append to the end of the content file the languages files
      questData += nl + '[QuestText]' + nl;

      for (const [language, serialized] of localizationFiles) {
        const lines = [...serialized];
        const file = 'Localization.' + language + '.txt';
        for (const key of makeReadable(language, lines, texts.get(language) ?? new Map())) files.unreadable.push(file + ': ' + key);
        questData += file + nl;
        files.localization.set(file, lines.join(nl));
      }

      questData += nl;
    }

    questData += '[QuestData]' + nl;

    for (const qc of qd.components.values()) {
      let source = qc.source;
      if (source.length === 0) {
        source = 'quest.ini';
      }

      if (!files.data.has(source)) {
        let thisFile = '';
        if (source !== 'quest.ini') {
          thisFile += '; Saved by version: ' + game.version + nl;
          questData += source + nl;
        }
        files.data.set(source, thisFile);
      }
      if (!(qc instanceof PerilData)) {
        files.data.set(source, files.data.get(source)! + nl + (sections.get(qc.sectionName) ?? qc.toString()));
      }
    }

    if (files.data.has('quest.ini')) {
      files.data.set('quest.ini', questData + files.data.get('quest.ini')!);
    } else {
      files.data.set('quest.ini', questData);
    }
    return files;
  }

  // Save the quest
  // Valkyrie: QuestEditor.cs QuestEditor.Save
  static save(): void {
    const game = Game.get();
    const folder = Path.getDirectoryName(game.currentQuest!.qd.questPath)!;
    QuestEditor.lastSaveProblems = [];
    QuestEditor.lastSaveUnstable = [];
    const files = QuestEditor.filesToSave();
    // Not in Valkyrie: a text that would come back otherwise keeps the files as they were
    if (files.unreadable.length > 0) {
      ValkyrieDebug.log('Error: texts that cannot be saved: ' + files.unreadable.join(', '));
      QuestEditor.lastSaveProblems = files.unreadable;
      return;
    }

    // Not in Valkyrie: the files as they are, kept as a version and to put back if the save goes wrong
    const written = new Map([...files.localization, ...files.data]);
    const before = new Map<string, Uint8Array | null>();
    for (const file of written.keys()) {
      const path = Path.combine(folder, file);
      before.set(path, File.exists(path) ? File.readAllBytes(path) : null);
    }
    QuestEditorVersions.beforeSave(folder, written);

    // Write to disk
    try {
      for (const [file, text] of files.localization) {
        File.writeAllText(folder + '/' + file, text);
      }
    } catch {
      ValkyrieDebug.log('Error: Failed to save quest in editor.');
      QuestEditor.lastSaveProblems.push(...files.localization.keys());
      Application.quit('editor-save-failed', folder, 'Error: Failed to save quest in editor.');
    }

    for (const [file, text] of files.data) {
      const outFile = Path.combine(folder, file);
      // Write to disk
      try {
        Directory.createDirectory(Path.getDirectoryName(outFile)!);
        File.writeAllText(outFile, text);
      } catch {
        ValkyrieDebug.log('Error: Failed to write to ' + outFile + ', components lost');
        QuestEditor.lastSaveProblems.push(file);
        Application.quit('editor-save-failed', outFile, 'Error: Failed to write to ' + outFile + ', components lost');
      }
    }

    // Not in Valkyrie: what was written, read back as Reload reads it, must save the same, or the old files go back
    if (QuestEditor.lastSaveProblems.length === 0) {
      QuestEditor.lastSaveUnstable = QuestEditor.readBack(folder, files);
      if (QuestEditor.lastSaveUnstable.length > 0) ValkyrieDebug.log('Error: saved files that do not read back the same: ' + QuestEditor.lastSaveUnstable.join(', '));
    }
    if (QuestEditor.lastSaveProblems.length > 0 || QuestEditor.lastSaveUnstable.length > 0) {
      for (const [path, bytes] of before) {
        if (bytes !== null) File.writeAllBytes(path, bytes);
        else if (File.exists(path)) File.delete(path);
      }
    }

    Destroyer.dialog();
  }

  /**
   * Not in Valkyrie: the files that the quest in this folder, loaded from its files as Reload loads it, would save
   * otherwise than these ('quest.ini' when it does not load). The quest open and its texts stay as they are.
   */
  static readBack(folder: string, written: QuestFiles): string[] {
    const fatalBefore = Application.fatalErrors.length;
    const qst = LocalizationRead.dicts.get('qst') ?? null;
    try {
      const loaded = new QuestData(folder + '/quest.ini');
      if (Application.fatalErrors.length > fatalBefore) return ['quest.ini'];
      const again = QuestEditor.filesToSave(loaded, LocalizationRead.selectDictionary('qst'));
      const differ: string[] = [];
      for (const kind of ['localization', 'data'] as const) {
        for (const file of new Set([...written[kind].keys(), ...again[kind].keys()])) {
          if (written[kind].get(file) !== again[kind].get(file)) differ.push(file);
        }
      }
      return differ;
    } catch {
      return ['quest.ini'];
    } finally {
      Application.fatalErrors.length = fatalBefore;
      LocalizationRead.removeDictionary('qst');
      if (qst !== null) LocalizationRead.dicts.set('qst', qst);
    }
  }

  /** Find each stringkey in dictionary inside the ini file. If doesn't appear, it is unused, can be removed (no caller in Valkyrie 3.28) */
  // Valkyrie: QuestEditor.cs QuestEditor.removeUnusedStringKeys
  static removeUnusedStringKeys(localization_file: string[], ini_file: string): void {
    // Search each line except first one
    for (let pos = localization_file.length - 1; pos > 0; pos--) {
      const key = '{qst:' + localization_file[pos]!.split(',')[0] + '}';
      if (!ini_file.includes(key)) {
        localization_file.splice(pos, 1);
      }
    }
  }
}
