// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/QuestLoader.cs
// Game-type checks become TypeName() comparisons; GetQuestsAsync runs synchronously on the virtual file system.
import { Game } from '../Game.ts';
import { Directory, File, Path } from '../platform/SystemIO.ts';
import { ValkyrieConstants } from '../ValkyrieConstants.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { ContentData } from './ContentData.ts';
import { ExtractManager } from './ExtractManager.ts';
import { QuestData } from './QuestData.ts';

// Class for getting lists of quest with details
// Valkyrie: QuestLoader.cs QuestLoader
export class QuestLoader {
  // Return a dictionary of all available quests
  // Valkyrie: QuestLoader.cs QuestLoader.GetQuests
  static getQuests(getHidden = false): Map<string, QuestData.Quest> {
    const quests = new Map<string, QuestData.Quest>();

    const game = Game.get();
    // Look in the user application data directory
    let dataLocation = Game.appData();
    ExtractManager.mkDir(dataLocation);
    ExtractManager.mkDir(ContentData.downloadPath());

    // Get a list of downloaded quest not packed
    const questDirectories = QuestLoader.getUnpackedQuests(ContentData.downloadPath());

    // Extract only required files from downloaded packages
    ExtractManager.extractPackages(ContentData.downloadPath());

    // Get the list of extracted packages
    questDirectories.push(...QuestLoader.getUnpackedQuests(ContentData.tempValkyriePath));

    // Add the list of editor quest
    if (game.gameType.typeName() === ValkyrieConstants.typeMom) {
      dataLocation += '/MoM/Editor';
    }
    if (game.gameType.typeName() === ValkyrieConstants.typeDescent) {
      dataLocation += '/D2E/Editor';
    }

    questDirectories.push(...QuestLoader.getUnpackedQuests(dataLocation));

    // Go through all directories
    for (const p of questDirectories) {
      // load quest
      const q = QuestLoader.readQuest(p);
      // Check quest is valid and of the right type
      if (q !== null && q.valid && q.type === game.gameType.typeName()) {
        // Is the quest hidden?
        if (!q.hidden || getHidden) {
          // Add quest to quest list
          QuestLoader.add(quests, p, q);
        }
      }
    }

    // Return list of available quests
    return quests;
  }

  // Valkyrie: QuestLoader.cs QuestLoader.GetQuestsAsync
  static async getQuestsAsync(context: QuestData.QuestLoaderContext, getHidden = false): Promise<Map<string, QuestData.Quest>> {
    const quests = new Map<string, QuestData.Quest>();

    // Look in the user application data directory
    let dataLocation = Game.appData();
    ExtractManager.mkDir(dataLocation);
    ExtractManager.mkDir(ContentData.downloadPath());

    // Get a list of downloaded quest not packed
    const questDirectories = QuestLoader.getUnpackedQuests(ContentData.downloadPath());

    // Extract only required files from downloaded packages
    ExtractManager.extractPackages(ContentData.downloadPath());

    // Get the list of extracted packages
    questDirectories.push(...QuestLoader.getUnpackedQuests(ContentData.tempValkyriePath));

    // Add the list of editor quest
    if (context.isMoM) {
      dataLocation += '/MoM/Editor';
    }
    // Logic for other game types based on string check if needed
    if (context.gameType === 'D2E') {
      dataLocation += '/D2E/Editor';
    }

    questDirectories.push(...QuestLoader.getUnpackedQuests(dataLocation));

    // Go through all directories
    for (const p of questDirectories) {
      // load quest with context
      const q = QuestLoader.readQuest(p, context);
      // Check quest is valid and of the right type
      if (q !== null && q.valid && q.type === context.gameType) {
        // Is the quest hidden?
        if (!q.hidden || getHidden) {
          // Add quest to quest list
          QuestLoader.add(quests, p, q);
        }
      }
    }

    // Return list of available quests
    return quests;
  }

  // Return a single quest, quest name is without file extension
  // Valkyrie: QuestLoader.cs QuestLoader.GetSingleQuest
  static getSingleQuest(questName: string, getHidden = false): QuestData.Quest | null {
    let quest: QuestData.Quest | null = null;

    const game = Game.get();
    // Look in the user application data directory
    const dataLocation = Game.appData();
    ExtractManager.mkDir(dataLocation);
    ExtractManager.mkDir(ContentData.downloadPath());

    const path = ContentData.downloadPath() + Path.DirectorySeparatorChar + questName + ValkyrieConstants.ScenarioDownloadContainerExtension;
    ExtractManager.extractSinglePackagePartial(path);

    // load quest
    const q = QuestLoader.readQuest(Path.combine(ContentData.tempValkyriePath, Path.getFileName(path)));
    // Check quest is valid and of the right type
    if (q !== null && q.valid && q.type === game.gameType.typeName()) {
      // Is the quest hidden?
      if (!q.hidden || getHidden) {
        // Add quest to quest list
        quest = q;
      }
    }

    // Return list of available quests
    return quest;
  }

  // Return list of quests available in the user path (includes packages)
  // Valkyrie: QuestLoader.cs QuestLoader.GetUserQuests
  static getUserQuests(): Map<string, QuestData.Quest> {
    const quests = new Map<string, QuestData.Quest>();

    // Read user application data for quests
    const dataLocation = Game.appData();
    ExtractManager.mkDir(dataLocation);
    const questDirectories = QuestLoader.getUnpackedQuests(dataLocation);

    // Read extracted packages
    questDirectories.push(...QuestLoader.getUnpackedQuests(ContentData.tempValkyriePath));

    // go through all found quests
    for (const p of questDirectories) {
      // read quest
      const q = QuestLoader.readQuest(p);
      // Check if valid and correct type
      if (q !== null && q.valid && q.type === Game.get().gameType.typeName()) {
        QuestLoader.add(quests, p, q);
      }
    }

    return quests;
  }

  // Return list of quests available in the user path unpackaged (editable)
  // Valkyrie: QuestLoader.cs QuestLoader.GetUserUnpackedQuests
  static getUserUnpackedQuests(): Map<string, QuestData.Quest> {
    const quests = new Map<string, QuestData.Quest>();

    // Read user application data for quests
    const dataLocation = Game.appData();
    ExtractManager.mkDir(dataLocation);
    const questDirectories = QuestLoader.getUnpackedQuests(dataLocation);

    const tempPath = ContentData.tempPath;
    const gameType = Game.get().gameType.typeName();
    // go through all found quests
    for (const p of questDirectories) {
      // Android stores the temp path in the data dir, we don't want the extracted scenarios from there
      if (p.toLowerCase().startsWith(tempPath.toLowerCase())) {
        continue;
      }
      // read quest
      const q = QuestLoader.readQuest(p);
      // Check if valid and correct type
      if (q !== null && q.valid && q.type === gameType) {
        QuestLoader.add(quests, p, q);
      }
    }

    return quests;
  }

  /** Get list of directories with quests at a path (unpacked quests); the path itself is not included. */
  // Valkyrie: QuestLoader.cs QuestLoader.GetUnpackedQuests
  static getUnpackedQuests(path: string): string[] {
    const quests: string[] = [];

    if (!Directory.exists(path)) {
      return quests;
    }

    // Get all directories at path
    const questDirectories = ExtractManager.dirList(path);
    for (const p of questDirectories) {
      // All packs must have a quest.ini, otherwise ignore
      if (File.exists(p + ValkyrieConstants.QuestIniFilePath)) {
        quests.push(p);
      }
    }

    return quests;
  }

  /** Not in Valkyrie (16 October 2026): a quest whose data throws is logged and left out, instead of stopping the whole list. */
  private static readQuest(path: string, context?: QuestData.QuestLoaderContext): QuestData.Quest | null {
    try {
      return context === undefined ? new QuestData.Quest(path) : new QuestData.Quest(path, context);
    } catch (e) {
      ValkyrieDebug.log('Warning: Skipping quest that could not be read: ' + path + '\nException: ' + String(e));
      return null;
    }
  }

  /** Dictionary.Add, which throws on a duplicate path. */
  private static add(quests: Map<string, QuestData.Quest>, path: string, quest: QuestData.Quest): void {
    if (quests.has(path)) throw new Error(`ArgumentException: An item with the same key has already been added. Key: ${path}`);
    quests.set(path, quest);
  }
}
