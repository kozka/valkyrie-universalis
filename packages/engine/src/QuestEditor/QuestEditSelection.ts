// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/QuestEditSelection.cs
// The lists, the search boxes and the new scenario dialog are the app's; this keeps what each choice does to the files.
import { ContentData } from '../Content/ContentData.ts';
import { DictionaryI18n } from '../Content/DictionaryI18n.ts';
import { ExtractManager } from '../Content/ExtractManager.ts';
import { QuestData } from '../Content/QuestData.ts';
import { QuestLoader } from '../Content/QuestLoader.ts';
import { StringKey } from '../Content/StringKey.ts';
import { Game } from '../Game.ts';
import { GameStateManager } from '../GameStateManager.ts';
import { Application } from '../platform/Application.ts';
import { NewLine } from '../platform/CSharp.ts';
import { Directory, File, Path } from '../platform/SystemIO.ts';
import { ValkyrieConstants } from '../ValkyrieConstants.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { QuestEditorVersions } from './QuestEditorVersions.ts';

const NEW_QUEST_FOLDER_EXISTS = new StringKey('val', 'NEW_QUEST_FOLDER_EXISTS');
const NEW_QUEST_INVALID_NAME = new StringKey('val', 'NEW_QUEST_INVALID_NAME');

/** Path.GetInvalidFileNameChars on Windows, where Valkyrie's editor runs and scenarios are written. */
const INVALID_FILE_NAME_CHARS = /[\u0000-\u001f"<>|:*?\\/]/;

/** File.WriteAllLines: every line followed by a line break. */
function writeAllLines(path: string, lines: readonly string[]): void {
  File.writeAllText(path, lines.map((line) => line + NewLine).join(''));
}

/** Copy a directory (DirectoryCopy): its files, then its subdirectories. */
// Valkyrie: QuestEditSelection.cs QuestEditSelection.DirectoryCopy
function directoryCopy(sourceDirName: string, destDirName: string, copySubDirs: boolean): void {
  if (!Directory.exists(sourceDirName)) {
    throw new Error('DirectoryNotFoundException: Source directory does not exist or could not be found: ' + sourceDirName);
  }
  const dirs = Directory.getDirectories(sourceDirName);
  // If the destination directory doesn't exist, create it.
  if (!Directory.exists(destDirName)) {
    Directory.createDirectory(destDirName);
  }
  // Get the files in the directory and copy them to the new location.
  for (const file of Directory.getFiles(sourceDirName)) {
    const temppath = Path.combine(destDirName, Path.getFileName(file));
    if (File.exists(temppath)) throw new Error(`IOException: The file '${temppath}' already exists.`);
    File.writeAllBytes(temppath, File.readAllBytes(file));
  }
  // If copying subdirectories, copy them and their contents to new location.
  if (copySubDirs) {
    for (const subdir of dirs) {
      directoryCopy(subdir, Path.combine(destDirName, Path.getFileName(subdir)), copySubDirs);
    }
  }
}

// Valkyrie: QuestEditSelection.cs QuestEditSelection
export class QuestEditSelection {
  questList: Map<string, QuestData.Quest>;

  // Create a pack with list of quests to edit
  // Valkyrie: QuestEditSelection.cs QuestEditSelection.QuestEditSelection
  constructor() {
    const game = Game.get();

    // clear list of local quests to make sure we take the latest changes
    game.questsList.unloadLocalQuests();

    // Get list of unpacked quest in user location (editable)
    this.questList = QuestLoader.getUserUnpackedQuests();
  }

  /** Where Valkyrie's editor creates and copies scenarios: <AppData>/<game>/Editor. */
  static editorLocation(): string {
    return Game.appData() + Path.DirectorySeparatorChar + Game.get().gameType.typeName() + '/Editor';
  }

  // Delete quest
  // Valkyrie: QuestEditSelection.cs QuestEditSelection.Delete(string)
  delete(key: string): void {
    try {
      Directory.delete(key, true);
      // Not in Valkyrie: the versions its editor kept go with it
      QuestEditorVersions.forget(key);
    } catch {
      ValkyrieDebug.log('Failed to delete quest: ' + key);
    }
    this.questList = new QuestEditSelection().questList;
  }

  /** The quests that can be copied: all of them, not just the user's (a package's key is its extracted folder). */
  // Valkyrie: QuestEditSelection.cs QuestEditSelection.Copy()
  static copyList(): Map<string, QuestData.Quest> {
    return QuestLoader.getQuests(true);
  }

  /** Copy a quest (a key of copyList) into Editor<Scenario><n>; returns where it went. */
  // Valkyrie: QuestEditSelection.cs QuestEditSelection.Copy(string)
  copy(key: string): string {
    const game = Game.get();
    const dataLocation = QuestEditSelection.editorLocation();
    if (!Directory.exists(dataLocation)) {
      Directory.createDirectory(dataLocation);
    }

    // Find a new unique directory name
    let uniqueDirectoryValue = 1;
    while (Directory.exists(dataLocation + '/Editor' + game.gameType.questName().translate() + uniqueDirectoryValue)) {
      uniqueDirectoryValue++;
    }
    const targetLocation = dataLocation + '/Editor' + game.gameType.questName().translate() + uniqueDirectoryValue;

    // Fully extract this scenario before copy if this is a package
    if (Path.getExtension(Path.getFileName(key)) === ValkyrieConstants.ScenarioDownloadContainerExtension) {
      // extract the full package
      ExtractManager.extractSinglePackageFull(ContentData.downloadPath() + Path.DirectorySeparatorChar + Path.getFileName(key));
    }

    // Copy files
    QuestEditSelection.copyFiles(key, targetLocation);

    // Back to selection
    this.questList = new QuestEditSelection().questList;
    return targetLocation;
  }

  // Valkyrie: QuestEditSelection.cs QuestEditSelection.CopyFiles
  private static copyFiles(key: string, targetLocation: string): void {
    try {
      directoryCopy(key, targetLocation, true);
      // read new quest file
      const questData = File.readAllLines(targetLocation + ValkyrieConstants.QuestIniFilePath);

      // Search for quest section
      let questFound = false;
      for (let i = 0; i < questData.length; i++) {
        if (questData[i] === '[Quest]') {
          // Inside quest section
          questFound = true;
        }
        if (questFound && questData[i]!.indexOf('name=') === 0) {
          // Add copy to name
          questFound = false;
          questData[i] = questData[i] + ' (Copy)';
        }
      }
      // Write back to ini file
      writeAllLines(targetLocation + ValkyrieConstants.QuestIniFilePath, questData);
    } catch {
      ValkyrieDebug.log('Error: Failed to copy quest.');
      Application.quit('editor-copy-failed', key, 'Error: Failed to copy quest.');
    }
  }

  /**
   * The error the new scenario dialog shows for these names, or null when they are fine. Not in Valkyrie: in a campaign's
   * folder, for a new adventure of it.
   */
  // Valkyrie: QuestEditSelection.cs QuestEditSelection.TryCreateQuest (the checks)
  static newQuestError(folderName: string, campaign: string | null = null): StringKey | null {
    const folder = folderName.trim();
    if (folder.length === 0 || INVALID_FILE_NAME_CHARS.test(folder)) {
      return NEW_QUEST_INVALID_NAME;
    }
    if (Directory.exists((campaign ?? QuestEditSelection.editorLocation()) + '/' + folder)) {
      return NEW_QUEST_FOLDER_EXISTS;
    }
    return null;
  }

  /**
   * Creates the scenario if the names are fine; returns its folder, or null when newQuestError says why not. Not in
   * Valkyrie, whose New makes a scenario only in the Editor folder: given a campaign's folder, a new adventure of it.
   */
  // Valkyrie: QuestEditSelection.cs QuestEditSelection.TryCreateQuest
  tryCreateQuest(folderName: string, displayName: string, campaign: string | null = null): string | null {
    const folder = folderName.trim();
    let display = displayName.trim();
    if (QuestEditSelection.newQuestError(folder, campaign) !== null) return null;

    if (display.length === 0) display = folder;

    return this.newQuest(folder, display, campaign);
  }

  // Valkyrie: QuestEditSelection.cs QuestEditSelection.NewQuest
  private newQuest(folderName: string, displayName: string, campaign: string | null): string {
    const game = Game.get();
    const dataLocation = campaign ?? QuestEditSelection.editorLocation();
    if (!Directory.exists(dataLocation)) {
      Directory.createDirectory(dataLocation);
    }

    const targetLocation = dataLocation + '/' + folderName;

    try {
      Directory.createDirectory(targetLocation);

      const questData: string[] = [];
      questData.push('[Quest]');
      questData.push('type=' + game.gameType.typeName());
      questData.push('format=' + QuestData.Quest.currentFormat);
      // Not in Valkyrie: a campaign's adventure is hidden, as only the campaign is listed (QuestLoader.GetQuests)
      if (campaign !== null) questData.push('hidden=True');
      questData.push('defaultlanguage=' + game.currentLang);
      questData.push('');
      questData.push('[QuestText]');
      questData.push('Localization.' + game.currentLang + '.txt');

      writeAllLines(targetLocation + ValkyrieConstants.QuestIniFilePath, questData);

      const newScenarioDict = new DictionaryI18n(['.,' + game.currentLang], game.currentLang);
      newScenarioDict.addEntry('quest.name', displayName);
      newScenarioDict.addEntry('quest.description', displayName + '...');

      const localizationFiles = newScenarioDict.serializeMultiple();
      for (const [oneLang, lines] of localizationFiles) {
        File.writeAllText(targetLocation + '/Localization.' + oneLang + '.txt', lines.join(NewLine));
      }
    } catch (e) {
      ValkyrieDebug.log('Error: Failed to create new quest: ' + (e instanceof Error ? e.message : String(e)));
      Application.quit('editor-new-failed', targetLocation, 'Error: Failed to create new quest');
    }
    this.questList = new QuestEditSelection().questList;
    return targetLocation;
  }

  // Back to the main menu
  // Valkyrie: QuestEditSelection.cs QuestEditSelection.Cancel
  static cancel(): void {
    GameStateManager.mainMenu();
  }
}
