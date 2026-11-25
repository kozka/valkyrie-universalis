// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/SaveManager.cs
// Saves keep Valkyrie's layout (a zip with save.ini, image.png and the scenario in quest/) inside the virtual file
// system, which the app keeps in the browser. The app takes the picture (CameraController.takeScreenshot) already at
// the size ResizeScreenShotTexture gives it.
import { ContentData } from './Content/ContentData.ts';
import { QuestData } from './Content/QuestData.ts';
import { Destroyer } from './Destroyer.ts';
import { Game } from './Game.ts';
import { GameStateManager } from './GameStateManager.ts';
import { Application } from './platform/Application.ts';
import { NewLine, replace } from './platform/CSharp.ts';
import { Directory, File, IOException, Path } from './platform/SystemIO.ts';
import type { Texture2D } from './platform/Texture2D.ts';
import { MoraleDisplay } from './Quest/MoraleDisplay.ts';
import { NextStageButton } from './Quest/NextStageButton.ts';
import { Quest } from './Quest/Quest.ts';
import { IniRead } from './ValkyrieTools/IniRead.ts';
import { ValkyrieDebug } from './ValkyrieTools/ValkyrieDebug.ts';
import { VersionManager } from './VersionManager.ts';
import { Extract_mode, ZipManager } from './ZipManager.ts';

/** DateTime.Parse of the time Quest.ToString writes ("MM/dd/yyyy HH:mm:ss", invariant culture); throws on anything else. */
function parseSaveTime(s: string): Date {
  const m = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2}):(\d{2})\s*$/.exec(s);
  if (m === null) throw new Error('FormatException: String was not recognized as a valid DateTime.');
  return new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]), Number(m[4]), Number(m[5]), Number(m[6]));
}

// Valkyrie: SaveManager.cs SaveManager.SaveData
export class SaveData {
  valid = false;
  quest_name = '';
  saveTime = new Date(0);
  image: Texture2D | null = null;
  /** Not in Valkyrie: Unity's texture keeps its pixels, so the app draws these bytes of image.png. */
  imageData: Uint8Array | null = null;

  constructor(num = 0) {
    const game = Game.get();
    const saveFilePath = SaveManager.getSaveFilePath(num);
    if (!File.exists(saveFilePath)) {
      return;
    }

    try {
      if (!Directory.exists(ContentData.tempValkyriePath)) {
        Directory.createDirectory(ContentData.tempValkyriePath);
      }
      const valkyrieLoadPath = Path.combine(ContentData.tempValkyriePath, 'Preload');
      if (!Directory.exists(valkyrieLoadPath)) {
        Directory.createDirectory(valkyrieLoadPath);
      }

      ZipManager.extract(valkyrieLoadPath, SaveManager.getSaveFilePath(num), Extract_mode.ZIPMANAGER_EXTRACT_SAVE_INI_PIC);

      this.image = ContentData.fileToTexture(Path.combine(valkyrieLoadPath, 'image.png'));
      if (this.image !== null) this.imageData = File.readAllBytes(Path.combine(valkyrieLoadPath, 'image.png'));

      const data = File.readAllText(Path.combine(valkyrieLoadPath, 'save.ini'));
      const saveData = IniRead.readFromString(data);

      // when loading a quest, path should always be $TMP/load/quest/$subquest/quest.ini
      // Make sure it is when loading a quest saved for the first time, as in that case it is the original load path
      let questLoadPath = Path.getDirectoryName(saveData.get('Quest', 'path'))!;
      const questOriginalPath = saveData.get('Quest', 'originalpath');

      // loading a quest saved for the first time
      if (questLoadPath.includes(questOriginalPath)) {
        questLoadPath = replace(questLoadPath, questOriginalPath, ContentData.valkyrieLoadQuestPath);
      }

      // use preload path rather than load
      questLoadPath = replace(questLoadPath, ContentData.valkyrieLoadPath, ContentData.valkyriePreloadPath);
      const q = new QuestData.Quest(questLoadPath);
      if (!q.valid) {
        ValkyrieDebug.log('Warning: Save ' + num + ' contains unsupported quest version.' + NewLine);
        return;
      }

      this.quest_name = saveData.get('Quest', 'questname');

      if (VersionManager.versionNewer(game.version, saveData.get('Quest', 'valkyrie'))) {
        ValkyrieDebug.log('Warning: Save ' + num + ' is from a future version.' + NewLine);
        return;
      }

      if (!VersionManager.versionNewerOrEqual(SaveManager.minValkyieVersion, saveData.get('Quest', 'valkyrie'))) {
        ValkyrieDebug.log('Warning: Save ' + num + ' is from an old unsupported version.' + NewLine);
        return;
      }

      this.saveTime = parseSaveTime(saveData.get('Quest', 'time'));

      this.valid = true;
    } catch (e) {
      ValkyrieDebug.log('Warning: Unable to open save file: ' + SaveManager.getSaveFilePath(num) + '\nException: ' + String(e));
    }
  }
}

// This class provides functions to load and save games.
// Valkyrie: SaveManager.cs SaveManager
export const SaveManager = {
  minValkyieVersion: '0.7.3',

  /** Not in Valkyrie (16 October 2026): why the last save failed, or null when it was written; Valkyrie only logs it. */
  lastSaveError: null as string | null,

  // This gets the path to the save game file.  Only one file is used/supported per game type.
  // Valkyrie: SaveManager.cs SaveManager.GetSaveFilePath
  getSaveFilePath(num = 0): string {
    let number = String(num);
    if (num === 0) number = 'Auto';
    return Path.combine(ContentData.gameTypePath, 'Save') + Path.DirectorySeparatorChar + 'save' + number + '.vSave';
  },

  // This saves the current game to disk.  Will overwrite any previous saves
  // Valkyrie: SaveManager.cs SaveManager.Save
  /** Not in Valkyrie (7 November 2026): told the folder a save was extracted to, before the game is loaded from it. */
  onLoad: null as ((folder: string) => void) | null,
  /** Not in Valkyrie (15 November 2026): told each save written, with the save.ini it holds (play/autoSave.ts). */
  onSaved: null as ((num: number, saveIni: string) => void) | null,

  save(num = 0, quit = false): void {
    // wait to not overwrite save.ini and screen capture
    ZipManager.wait4PreviousSave();
    Game.get().cc.takeScreenshot(() => {
      SaveManager.saveWithScreen(num, quit);
    });
  },

  // Valkyrie: SaveManager.cs SaveManager.SaveWithScreen
  saveWithScreen(num: number, quit = false): void {
    const game = Game.get();
    SaveManager.lastSaveError = null;
    try {
      if (!Directory.exists(Game.appData())) {
        Directory.createDirectory(Game.appData());
      }
      if (!Directory.exists(ContentData.gameTypePath)) {
        Directory.createDirectory(ContentData.gameTypePath);
      }
      if (!Directory.exists(Path.combine(ContentData.gameTypePath, 'Save'))) {
        Directory.createDirectory(Path.combine(ContentData.gameTypePath, 'Save'));
      }
      const tempValkyriePath = ContentData.tempValkyriePath;
      if (!Directory.exists(tempValkyriePath)) {
        Directory.createDirectory(tempValkyriePath);
      }
      const saveIni = game.currentQuest!.toString();
      File.writeAllText(Path.combine(tempValkyriePath, 'save.ini'), saveIni);

      // The app made the picture at 4/30 of the screen's size (ResizeScreenShotTexture), as a PNG
      File.writeAllBytes(Path.combine(tempValkyriePath, 'image.png'), game.cc.screenShot ?? new Uint8Array(0));

      // Check if we should update the zip file or write a new one with quest content
      // first autosave is a new zip file, following autosave just update the zip
      let zip_update = false;
      if (num === 0 && game.currentQuest!.firstAutoSaveDone) {
        zip_update = true;
      } else if (num === 0) {
        game.currentQuest!.firstAutoSaveDone = true;
      }

      // Quest content can be in original path, or savegame path
      let quest_content_path: string;
      if (game.currentQuest!.fromSavegame) {
        quest_content_path = ContentData.valkyrieLoadQuestPath;
      } else {
        quest_content_path = game.currentQuest!.originalPath;
      }

      // zip in a separate thread
      if (!ZipManager.writeZipAsync(tempValkyriePath, quest_content_path, SaveManager.getSaveFilePath(num), zip_update)) {
        // Not in Valkyrie (15 November 2026): with the reason, which Valkyrie only logs
        const reason = ZipManager.lastError === null ? '' : ' (' + ZipManager.lastError + ')';
        SaveManager.lastSaveError = 'Unable to create/update container file: ' + SaveManager.getSaveFilePath(num) + reason;
      } else {
        SaveManager.onSaved?.(num, saveIni);
      }
    } catch (e) {
      SaveManager.lastSaveError = e instanceof Error ? e.message : String(e);
      if (e instanceof IOException) {
        ValkyrieDebug.log('Warning: Unable to write to save file. ' + e.message);
      } else {
        ValkyrieDebug.log('Warning: Unable to save game. ' + (e instanceof Error ? e.message : String(e)));
      }
    }

    if (quit) {
      try {
        ZipManager.wait4PreviousSave();
      } catch (e) {
        ValkyrieDebug.log('Warning: Unable to finalize save file before quitting. ' + String(e));
      }

      GameStateManager.mainMenu();
    }
  },

  // Check if a save game exists for the current game type
  // Valkyrie: SaveManager.cs SaveManager.SaveExists
  saveExists(): boolean {
    for (let i = 0; i < 4; i++) {
      if (File.exists(SaveManager.getSaveFilePath(i))) {
        return true;
      }
    }
    return false;
  },

  // Load a saved game, does nothing if file does not exist
  // Valkyrie: SaveManager.cs SaveManager.Load
  load(num = 0): void {
    const game = Game.get();
    try {
      if (File.exists(SaveManager.getSaveFilePath(num))) {
        if (!Directory.exists(ContentData.tempValkyriePath)) {
          Directory.createDirectory(ContentData.tempValkyriePath);
        }
        const valkyrieLoadPath = Path.combine(ContentData.tempValkyriePath, 'Load');

        if (!Directory.exists(valkyrieLoadPath)) {
          Directory.createDirectory(valkyrieLoadPath);
        }

        Directory.delete(valkyrieLoadPath, true);
        ZipManager.extract(valkyrieLoadPath, SaveManager.getSaveFilePath(num), Extract_mode.ZIPMANAGER_EXTRACT_FULL);

        // Not in Valkyrie: the app reads its own files of the save (ZipManager.extraSaveFiles)
        SaveManager.onLoad?.(valkyrieLoadPath);
        const savefile_content = File.readAllText(Path.combine(valkyrieLoadPath, 'save.ini'));
        const saveData = IniRead.readFromString(savefile_content);

        // when loading a quest, path should always be $TMP/load/quest/$subquest/quest.ini
        // Make sure it is when loading a quest saved for the first time, as in that case it is the original load path
        let questLoadPath = Path.getDirectoryName(saveData.get('Quest', 'path'))!;
        const questOriginalPath = saveData.get('Quest', 'originalpath');

        // loading a quest saved for the first time
        if (questLoadPath.includes(questOriginalPath)) {
          questLoadPath = replace(questLoadPath, questOriginalPath, ContentData.valkyrieLoadQuestPath);
        }

        // Check that quest in save is valid
        const q = new QuestData.Quest(questLoadPath);
        if (!q.valid) {
          ValkyrieDebug.log('Error: save contains unsupported quest version.' + NewLine);
          GameStateManager.mainMenu();
          return;
        }
        saveData.data.get('Quest')!.set('path', Path.combine(questLoadPath, 'quest.ini'));

        if (VersionManager.versionNewer(game.version, saveData.get('Quest', 'valkyrie'))) {
          ValkyrieDebug.log('Error: save is from a future version.' + NewLine);
          GameStateManager.mainMenu();
          return;
        }

        if (!VersionManager.versionNewerOrEqual(SaveManager.minValkyieVersion, saveData.get('Quest', 'valkyrie'))) {
          ValkyrieDebug.log('Error: save is from an old unsupported version.' + NewLine);
          GameStateManager.mainMenu();
          return;
        }

        Destroyer.dialog();

        // Load content that the save game uses
        const packs = saveData.get('Packs')!;
        for (const key of packs.keys()) {
          // Support for save games from 1.2 and older
          if (key === 'FA') {
            game.contentLoader.loadContentID('FAI');
            game.contentLoader.loadContentID('FAM');
            game.contentLoader.loadContentID('FAT');
          }
          if (key === 'CotW') {
            game.contentLoader.loadContentID('CotWI');
            game.contentLoader.loadContentID('CotWM');
            game.contentLoader.loadContentID('CotWT');
          }
          if (key === 'MoM1E') {
            game.contentLoader.loadContentID('MoM1EI');
            game.contentLoader.loadContentID('MoM1EM');
            game.contentLoader.loadContentID('MoM1ET');
          } else {
            game.contentLoader.loadContentID(key);
          }
        }

        // This loads the game
        new Quest(saveData);

        // Draw things on the screen
        game.heroCanvas.setupUI();
        game.heroCanvas.updateImages();
        game.heroCanvas.updateStatus();

        if (game.gameType.displayMorale()) {
          game.moraleDisplay = new MoraleDisplay();
        }
        if (!game.gameType.displayHeroes()) {
          game.heroCanvas.clean();
        }

        // Create the menu button (MenuButton, LogButton, SkillButton and InventoryButton)
        game.ui.questButtons();
        game.stageUI = new NextStageButton();
      }
    } catch (e) {
      if (e instanceof IOException) {
        ValkyrieDebug.log('Error: Unable to open save file: ' + SaveManager.getSaveFilePath(num) + ' ' + e.message);
        Application.quit('save-unreadable', SaveManager.getSaveFilePath(num), 'Error: Unable to open save file: ' + e.message);
      } else {
        const message = e instanceof Error ? e.message : String(e);
        ValkyrieDebug.log('Error: Unable to load save game: ' + message);
        Application.quit('save-unloadable', SaveManager.getSaveFilePath(num), 'Error: Unable to load save game: ' + message);
      }
    }
  },

  // Valkyrie: SaveManager.cs SaveManager.GetSaves
  getSaves(): SaveData[] {
    const saves: SaveData[] = [];
    for (let i = 0; i < 4; i++) {
      saves.push(new SaveData(i));
    }
    return saves;
  },
};
