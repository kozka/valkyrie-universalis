// Characterization tests of saved games, written from Valkyrie's C# (SaveManager.cs, ZipManager.WriteZipAsync and
// CameraController.TakeScreenshot), which has no NUnit tests for them. Not ported from Valkyrie. They use the battery's
// setting (all MoM base packs) and a small quest written here.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { strToU8, zipSync } from 'fflate';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  ActivateDialogMoM,
  Application,
  ContentData,
  Directory,
  ExtractManager,
  File,
  Game,
  GameMenu,
  GameStateManager,
  HeadlessUI,
  IniRead,
  QuestData,
  Random,
  SaveManager,
  ValkyrieDebug,
  readZipDirectory,
  readZipEntry,
  type Quest,
} from '@universalis/engine';
import { RoundControllerMoM } from '@universalis/module-mom';
import { createEnvironment, type Environment } from '../tools/battery/environment.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const QUEST = '/AppData/Valkyrie/MoM/Editor/SaveTest';

const QUEST_INI = `[Quest]
format=21
type=MoM
defaultlanguage=English
minhero=1
maxhero=5

[QuestText]
Localization.English.txt

[QuestData]
events.ini
`;

const TEXT = `.,English
quest.name,Save test
EventStart.text,The cultist waits.
EventStart.button1,Continue
SpawnCultist.text,A cultist appears.
SpawnCultist.button1,Continue
`;

const EVENTS = `[EventStart]
trigger=EventStart
buttons=1
event1=SpawnCultist
add=TileHall

[SpawnCultist]
monster=MonsterCultist
buttons=1
event1=
operations=counter,=,5

[TileHall]
side=TileSideAlley1
xposition=0
yposition=0
`;

/** A PNG header of 128 by 85 pixels, as the app's picture of the screen would start. */
const PICTURE = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52, 0, 0, 0, 128, 0, 0, 0, 85, 8, 2, 0, 0, 0,
]);

let env: Environment;
let ui: HeadlessUI;
let logs: string[];
let stopLog: () => void;

/** HeadlessUI with a picture of the screen, as the app takes it. */
class PictureUI extends HeadlessUI {
  override takeScreenshot(done: (png: Uint8Array | null) => void): void {
    this.screenshots++;
    done(PICTURE);
  }
}

/** Starts the quest with two investigators and answers its first two dialogs: the cultist is on the list. */
function startQuest(): Quest {
  File.writeAllText(QUEST + '/quest.ini', QUEST_INI);
  File.writeAllText(QUEST + '/Localization.English.txt', TEXT);
  File.writeAllText(QUEST + '/events.ini', EVENTS);

  GameStateManager.Quest.start(new QuestData.Quest(QUEST));
  const game = Game.get();
  game.heroCanvas.heroSelection!.select('HeroRitaYoung');
  game.heroCanvas.heroSelection!.select('HeroAgathaCrane');
  game.endSelection();
  game.questStartEvent();
  ui.lastDialog!.onButton(0);
  ui.lastDialog!.onButton(0);
  return game.currentQuest!;
}

function saveFolder(): string {
  return ContentData.gameTypePath + '/Save';
}

/** The files of a save and its save.ini. */
function readSave(num: number): { names: string[]; ini: ReturnType<typeof IniRead.readFromString>; picture: Uint8Array } {
  const data = File.readAllBytes(SaveManager.getSaveFilePath(num));
  const entries = readZipDirectory(data).filter((e) => !e.isDirectory);
  const text = new TextDecoder().decode(readZipEntry(data, entries.find((e) => e.name === 'save.ini')!));
  return { names: entries.map((e) => e.name), ini: IniRead.readFromString(text), picture: readZipEntry(data, entries.find((e) => e.name === 'image.png')!) };
}

describe('SaveGameTests', () => {
  beforeAll(() => {
    env = createEnvironment('MoM', join(root, 'packages', 'engine', 'data'), []);
  }, 120_000);

  beforeEach(() => {
    ui = new PictureUI();
    env.game.ui = ui;
    env.game.roundControl = new RoundControllerMoM();
    Application.fatalErrors.length = 0;
    Random.initState(1);
    logs = [];
    stopLog = ValkyrieDebug.onLog((m) => logs.push(m ?? ''));
    if (Directory.exists(saveFolder())) Directory.delete(saveFolder(), true);
  });

  afterEach(() => {
    stopLog();
  });

  it('Save_WritesTheStateThePictureAndTheScenario', () => {
    const quest = startQuest();
    expect(SaveManager.saveExists()).toBe(false);

    SaveManager.save(1);

    const save = readSave(1);
    expect(save.names.sort()).toEqual(['image.png', 'quest/Localization.English.txt', 'quest/events.ini', 'quest/quest.ini', 'save.ini']);
    expect(save.ini.get('Quest', 'path')).toBe(QUEST + '/quest.ini');
    expect(save.ini.get('Quest', 'originalpath')).toBe(QUEST);
    expect(save.ini.get('Quest', 'questname')).toBe('Save test');
    expect(save.ini.get('Quest', 'valkyrie')).toBe(Game.get().version);
    expect(save.ini.get('Vars', 'counter')).toBe('5');
    expect(save.picture).toEqual(PICTURE);
    expect(SaveManager.saveExists()).toBe(true);
    expect(quest.firstAutoSaveDone).toBe(false);
  });

  it('Autosave_TheFirstWritesTheScenarioTheNextOnlyTheStateAndThePicture', () => {
    const quest = startQuest();
    const game = Game.get();

    // The end of the round saves automatically (RoundControllerMoM.EndRound): the cultist activates, then the horror step
    game.stageUI!.next();
    const activation = ui.lastWindow as ActivateDialogMoM;
    activation.createAttackWindow();
    activation.activated();
    game.stageUI!.next();
    expect(quest.firstAutoSaveDone).toBe(true);
    // VarManager writes '\#' so that the line is not a comment
    expect(readSave(0).ini.get('Vars', '\\#round')).toBe('2');

    // The scenario's own files are not read again: a change to them does not reach the save
    File.writeAllText(QUEST + '/events.ini', '; changed');
    quest.vars.setValue('counter', 7);
    SaveManager.save(0);
    const save = readSave(0);
    expect(save.ini.get('Vars', 'counter')).toBe('7');
    const data = File.readAllBytes(SaveManager.getSaveFilePath(0));
    const events = readZipDirectory(data).find((e) => e.name === 'quest/events.ini')!;
    expect(new TextDecoder().decode(readZipEntry(data, events))).toBe(EVENTS);
  });

  it('Load_RestoresTheGameWithTheScenarioOfTheSave', () => {
    const quest = startQuest();
    const game = Game.get();
    quest.monsters[0]!.damage = 2;
    SaveManager.save(1);

    // Things change after saving, and the scenario's folder goes away
    quest.monsters[0]!.damage = 0;
    quest.vars.setValue('counter', 9);
    Directory.delete(QUEST, true);

    SaveManager.load(1);

    const loaded = game.currentQuest!;
    expect(loaded).not.toBe(quest);
    expect(loaded.fromSavegame).toBe(true);
    expect(loaded.qd.questPath).toBe(ContentData.valkyrieLoadQuestPath + '/quest.ini');
    expect(loaded.originalPath).toBe(QUEST);
    expect(loaded.vars.getValue('counter')).toBe(5);
    expect(loaded.monsters[0]!.damage).toBe(2);
    expect(loaded.heroes.filter((h) => h.heroData !== null).map((h) => h.heroData!.sectionName)).toEqual(['HeroRitaYoung', 'HeroAgathaCrane']);
    expect(ui.findTag(Game.QUESTUI)).toBe(true);
    expect(game.stageUI).not.toBeNull();
    expect(Application.fatalErrors).toEqual([]);

    // Saved again, it takes the scenario from the loaded save, and loads the same way
    loaded.vars.setValue('counter', 6);
    SaveManager.save(2);
    expect(readSave(2).ini.get('Quest', 'path')).toBe(ContentData.valkyrieLoadQuestPath + '/quest.ini');
    SaveManager.load(2);
    expect(game.currentQuest!.vars.getValue('counter')).toBe(6);
    expect(game.currentQuest!.qd.questPath).toBe(ContentData.valkyrieLoadQuestPath + '/quest.ini');
  });

  it('GetSaves_ListsTheFourSlotsWithTheValidOnes', () => {
    startQuest();
    SaveManager.save(0);
    SaveManager.save(2);

    const saves = SaveManager.getSaves();
    expect(saves.map((s) => s.valid)).toEqual([true, false, true, false]);
    expect(saves[2]!.quest_name).toBe('Save test');
    expect(Math.abs(saves[2]!.saveTime.getTime() - Date.now())).toBeLessThan(5000);
    expect([saves[2]!.image!.width, saves[2]!.image!.height]).toEqual([128, 85]);
    expect(saves[2]!.imageData).toEqual(PICTURE);
  });

  it('Load_RefusesASaveFromAFutureVersion', () => {
    startQuest();
    SaveManager.save(1);
    const game = Game.get();
    const version = game.version;
    game.version = '0.8.0';
    const menus = ui.mainMenus;
    try {
      expect(SaveManager.getSaves()[1]!.valid).toBe(false);
      SaveManager.load(1);
    } finally {
      game.version = version;
    }
    expect(ui.mainMenus).toBe(menus + 1);
    expect(logs).toContain('Error: save is from a future version.\r\n');
  });

  it('Save_CopiesTheFilesOfAPackageAsThePackageStoresThem', () => {
    // A downloaded package that stores events.ini without compressing it, extracted as Game.StartQuest extracts it
    const archive = ContentData.downloadPath() + '/SaveTest.valkyrie';
    File.writeAllBytes(
      archive,
      zipSync({
        'quest.ini': strToU8(QUEST_INI),
        'Localization.English.txt': strToU8(TEXT),
        'events.ini': [strToU8(EVENTS), { level: 0 }],
      }),
    );
    const extracted = ExtractManager.extractSinglePackageFull(archive);
    GameStateManager.Quest.start(new QuestData.Quest(extracted));
    const game = Game.get();
    game.heroCanvas.heroSelection!.select('HeroRitaYoung');
    game.endSelection();
    game.questStartEvent();

    SaveManager.save(1);
    const stored = (num: number, name: string) => readZipDirectory(File.readAllBytes(SaveManager.getSaveFilePath(num))).find((e) => e.name === name)!;
    // A new zip would deflate a text: this one is the package's entry, copied as it is
    expect(stored(1, 'quest/events.ini').method).toBe(0);
    expect(stored(1, 'quest/Localization.English.txt').crc32).toBe(readZipDirectory(File.readAllBytes(archive)).find((e) => e.name === 'Localization.English.txt')!.crc32);

    // A file written after the package was extracted is saved with what it has now
    File.writeAllText(extracted + '/events.ini', EVENTS + '; changed\n');
    SaveManager.save(2);
    const data = File.readAllBytes(SaveManager.getSaveFilePath(2));
    expect(new TextDecoder().decode(readZipEntry(data, stored(2, 'quest/events.ini')))).toBe(EVENTS + '; changed\n');
    expect(stored(2, 'quest/events.ini').method).toBe(8);
  });

  it('Quit_SavesAutomaticallyAndGoesToTheMainMenu', () => {
    startQuest();
    const menus = ui.mainMenus;
    GameMenu.quit();
    expect(ui.mainMenus).toBe(menus + 1);
    expect(readSave(0).ini.get('Quest', 'questname')).toBe('Save test');
  });
});
