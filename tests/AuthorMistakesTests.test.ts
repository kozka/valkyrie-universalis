// Not ported from Valkyrie: one author mistake in a scenario, a pack or a store entry breaks only that item (16 October
// 2026), where Valkyrie's C# throws or quits. They use the battery's setting (all MoM base packs) and small packages and a
// quest written here.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { strToU8, zipSync } from 'fflate';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Application,
  ContentData,
  ContentPack,
  Directory,
  File,
  Game,
  GameStateManager,
  HTTPManager,
  HeadlessUI,
  InventoryWindowMoM,
  IniRead,
  ItemData,
  ManifestManager,
  MonsterData,
  MonsterDialogMoM,
  PuzzleTowerWindow,
  QuestData,
  QuestListMode,
  QuestLoader,
  QuestsManager,
  Random,
  RemoteContentPack,
  RemoteContentPackListMode,
  RemoteContentPackManager,
  SaveManager,
  ShopInterface,
  ValkyrieDebug,
  type HTTPReply,
  type Quest,
} from '@universalis/engine';
import { RoundControllerMoM } from '@universalis/module-mom';
import { createEnvironment, type Environment } from '../tools/battery/environment.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const EDITOR = '/AppData/Valkyrie/MoM/Editor';
const QUEST = EDITOR + '/MistakesTest';

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
quest.name,Mistakes test
EventStart.text,Start.
EventStart.button1,Continue
SpawnNothing.text,A {type} appears.
SpawnNothing.button1,Continue
PuzzleOdd.text,A riddle.
PuzzleOdd.button1,Answer
`;

const EVENTS = `[EventStart]
trigger=EventStart
buttons=1
event1=
add=TileHall

[EventGift]
buttons=1
event1=
add=QItemKey

[QItemKey]
traits=lightsource
inspect=EventOpened

[EventColour]
buttons=2
event1=
event2=
buttoncolor1=#GG0000
buttoncolor2=#12

[EventBoard]
buttons=1
event1=
add=DoorBad UIText UIBroken UIGood

[DoorBad]
xposition=1
yposition=1
color=notacolour

[UIText]
xposition=0
yposition=0
textcolor=#1
textbackgroundcolor=#XYZXYZ

[UIBroken]
xposition=1
yposition=0
image=missing.png

[UIGood]
xposition=2
yposition=0

[UIButtons]
xposition=3
yposition=0
buttons=1
event1=EventMissing EventOpened

[EventOpened]
buttons=1
event1=

[PuzzleOdd]
buttons=1
event1=EventOpened
class=riddle

[PuzzleTowers]
display=false
buttons=1
event1=EventOpened
class=tower
puzzlelevel=1

[SpawnNothing]
monster=MonsterNotThere
buttons=1
event1=

[EventOps]
buttons=1
event1=
operations=$broken,= $good,+,1

[UIChange]
xposition=4
yposition=0
trigger=CustomTrigger
buttons=1
event1=other/quest.ini

[EventLater]
trigger=CustomTrigger
buttons=1
event1=

[TileHall]
side=TileSideAlley1
xposition=0
yposition=0
`;

let env: Environment;
let game: Game;
let ui: HeadlessUI;
let stopLog: () => void;
let log: string[];

function packZip(lines: string): Uint8Array {
  return zipSync({ 'content_pack.ini': strToU8(`[ContentPack]\n${lines}\n`) });
}

/** Starts the quest with two investigators and answers its first dialog. */
function startQuest(): Quest {
  File.writeAllText(QUEST + '/quest.ini', QUEST_INI);
  File.writeAllText(QUEST + '/Localization.English.txt', TEXT);
  File.writeAllText(QUEST + '/events.ini', EVENTS);
  File.writeAllText(QUEST + '/other/quest.ini', QUEST_INI);
  GameStateManager.Quest.start(new QuestData.Quest(QUEST));
  game.heroCanvas.heroSelection!.select('HeroRitaYoung');
  game.heroCanvas.heroSelection!.select('HeroAgathaCrane');
  game.endSelection();
  game.questStartEvent();
  ui.lastDialog!.onButton(0);
  return game.currentQuest!;
}

/** The quest log, as the editor's log window shows it. */
function logOf(quest: Quest): string {
  return [...quest.log].map((e) => e.getEntry(true)).join('');
}

beforeAll(() => {
  env = createEnvironment('MoM', join(root, 'packages', 'engine', 'data'), []);
  game = env.game;
}, 120_000);

beforeEach(() => {
  Game.game = game;
  ui = new HeadlessUI();
  game.ui = ui;
  game.roundControl = new RoundControllerMoM();
  game.currentLang = 'English';
  Application.fatalErrors.length = 0;
  Random.initState(1);
  log = [];
  stopLog = ValkyrieDebug.onLog((m) => log.push(m ?? ''));
});

afterEach(() => {
  stopLog();
  vi.restoreAllMocks();
  HTTPManager.send = null;
});

describe('Lists and loading', () => {
  it('ContentData_SkipsABrokenPackAndOneWithoutNameAndListsTheRest', () => {
    const folder = ContentData.customContentPackPath();
    const manifest = File.readAllText(folder + '/manifest.ini');
    File.writeAllBytes(folder + '/Good.valkyrieContentPack', packZip('name=Good pack\nid=GoodPack\ntype=MoMCustom'));
    File.writeAllBytes(folder + '/NoName.valkyrieContentPack', packZip('id=NoNamePack\ntype=MoMCustom'));
    File.writeAllBytes(folder + '/Broken.valkyrieContentPack', packZip('name=Broken pack\nid=BrokenPack\ntype=MoMCustom'));
    File.writeAllText(folder + '/manifest.ini', '[Broken]\n\n[NoName]\n\n[Good]\n');
    const readFromIni = IniRead.readFromIni.bind(IniRead);
    // An unreadable content_pack.ini: GetPackData reads it before checking it, as in C#
    vi.spyOn(IniRead, 'readFromIni').mockImplementation((path: string) => (path.includes('Broken') ? null : readFromIni(path)));
    try {
      const cd = new ContentData(game.gameType.dataDirectory());
      const ids = cd.allPacks.map((p) => p.id);
      expect(ids).toContain('GoodPack');
      expect(ids).not.toContain('NoNamePack');
      expect(ids).not.toContain('BrokenPack');
      expect(ids).toContain(game.gameType.baseContentPackId());
      expect(Application.fatalErrors).toEqual([]);
    } finally {
      File.writeAllText(folder + '/manifest.ini', manifest);
      for (const name of ['Good', 'NoName', 'Broken']) File.delete(folder + '/' + name + '.valkyrieContentPack');
    }
  });

  it('QuestLoader_SkipsAQuestThatThrowsAndListsTheRest', () => {
    File.writeAllText(EDITOR + '/Broken/quest.ini', QUEST_INI);
    File.writeAllText(EDITOR + '/Fine/quest.ini', QUEST_INI);
    const populate = QuestData.Quest.prototype.populate;
    vi.spyOn(QuestData.Quest.prototype, 'populate').mockImplementation(function (this: QuestData.Quest, data: Map<string, string>) {
      if (this.identifier === 'broken') throw new Error('broken');
      return populate.call(this, data);
    });
    File.writeAllText(EDITOR + '/Fine/Localization.English.txt', TEXT);
    try {
      const quests = QuestLoader.getQuests();
      expect(quests.has(EDITOR + '/Fine')).toBe(true);
      expect(quests.has(EDITOR + '/Broken')).toBe(false);
      expect(log.some((m) => m.startsWith('Warning: Skipping quest that could not be read: ' + EDITOR + '/Broken'))).toBe(true);
    } finally {
      Directory.delete(EDITOR + '/Broken', true);
      Directory.delete(EDITOR + '/Fine', true);
    }
  });

  it('SelectQuest_APackThatThrowsDoesNotStopTheOthers', () => {
    const calls: string[] = [];
    const loadContentID = game.contentLoader.loadContentID.bind(game.contentLoader);
    vi.spyOn(game.contentLoader, 'loadContentID').mockImplementation((id: string) => {
      calls.push(id);
      if (id === 'BrokenPack') throw new Error('broken');
      loadContentID(id);
    });
    const added = game.packsAdded;
    game.packsAdded = ['BrokenPack', 'FA'];
    try {
      expect(() => game.selectQuest()).not.toThrow();
    } finally {
      game.packsAdded = added;
    }
    expect(calls.slice(-2)).toEqual(['BrokenPack', 'FA']);
    expect(ui.questSelections).toBe(1);
  });

  it('LoadContentPack_AnIniFileThatThrowsDoesNotStopTheOthers', () => {
    const folder = '/AppData/AuthorPack';
    File.writeAllText(folder + '/a.ini', '[MonsterAuthorBroken]\nname=Broken\n');
    File.writeAllText(folder + '/b.ini', '[MonsterAuthorGood]\nname=Good\n');
    const pack = new ContentPack();
    pack.id = 'AuthorPack';
    pack.name = 'Author pack';
    pack.iniFiles = [folder + '/a.ini', folder + '/b.ini'];
    pack.localizationFiles = new Map();
    pack.clone = [];
    game.cd.allPacks.push(pack);
    const addContent = game.cd.addContent.bind(game.cd);
    vi.spyOn(game.cd, 'addContent').mockImplementation((type, name, content) => {
      if (name === 'MonsterAuthorBroken') throw new Error('broken');
      return addContent(type, name, content);
    });
    try {
      expect(() => game.contentLoader.loadContentID('AuthorPack')).not.toThrow();
      expect(game.cd.containsKey(MonsterData, 'MonsterAuthorGood')).toBe(true);
      expect(game.cd.loadedPacks.has('AuthorPack')).toBe(true);
    } finally {
      game.cd.allPacks.splice(game.cd.allPacks.indexOf(pack), 1);
    }
  });
});

describe('Store lists', () => {
  const MOM_LIST = 'https://raw.githubusercontent.com/NPBruce/valkyrie-store/master/MoM/manifestDownload.ini';
  const MOM_PACKS = 'https://raw.githubusercontent.com/NPBruce/valkyrie-store/refs/heads/master/MoM/contentPacksManifestDownload.ini';
  const LIST = '[Alpha]\nformat=18\ntype=MoM\nversion=AA\nname.English=Alpha\n\n[Bad]\nformat=18\ntype=MoM\nversion=BB\nname.English=Bad\n';
  const PACKS = '[TLE]\ntype=MoMCustom\nversion=3\nname.English=Lost\n\n[Bad]\ntype=MoMCustom\nversion=1\nname.English=Bad\n';
  const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
  const serve = (files: Record<string, string>) => {
    HTTPManager.send = async (url: string): Promise<HTTPReply> => ({ text: files[url]! });
  };

  beforeEach(() => {
    for (const folder of [ContentData.downloadPath() + '/manifest.ini', ContentData.customContentPackPath() + '/manifest.ini']) {
      if (File.exists(folder) && folder.startsWith(ContentData.downloadPath() + '/manifest')) File.delete(folder);
    }
    game.stats.scenarios_stats = null;
  });

  it('QuestsManager_ALocalEntryWithoutVersionOffersTheUpdate', async () => {
    File.writeAllText(ContentData.downloadPath() + '/manifest.ini', '[Alpha]\nurl=https://example.org/\n');
    serve({ [MOM_LIST]: LIST });
    const manager = new QuestsManager();
    const calls: boolean[] = [];
    manager.register_cb_download((available) => calls.push(available));
    await flush();
    File.delete(ContentData.downloadPath() + '/manifest.ini');
    expect(calls).toEqual([true]);
    expect(manager.quest_list_mode).toBe(QuestListMode.ONLINE);
    const alpha = manager.remote_quests_data!.get('Alpha')!;
    expect([alpha.downloaded, alpha.update_available]).toEqual([true, true]);
  });

  it('QuestsManager_AnEntryThatThrowsIsLeftOut', async () => {
    const populate = QuestData.Quest.prototype.populate;
    vi.spyOn(QuestData.Quest.prototype, 'populate').mockImplementation(function (this: QuestData.Quest, data: Map<string, string>) {
      if (data.get('name.English') === 'Bad') throw new Error('broken');
      return populate.call(this, data);
    });
    serve({ [MOM_LIST]: LIST });
    const manager = new QuestsManager();
    await flush();
    expect([...manager.remote_quests_data!.keys()]).toEqual(['Alpha']);
    expect(manager.quest_list_mode).toBe(QuestListMode.ONLINE);
  });

  it('QuestsManager_AListThatCannotBeReadEndsAsADownloadError', async () => {
    vi.spyOn(game.stats, 'readListStats').mockImplementation(() => {
      throw new Error('broken');
    });
    serve({ [MOM_LIST]: LIST });
    const manager = new QuestsManager();
    const calls: boolean[] = [];
    manager.register_cb_download((available) => calls.push(available));
    await flush();
    expect(calls).toEqual([false]);
    expect(manager.error_download).toBe(true);
    expect(manager.quest_list_mode).toBe(QuestListMode.ERROR_DOWNLOAD);
    expect(manager.remote_quests_data!.size).toBe(0);
  });

  it('RemoteContentPackManager_ALocalEntryWithoutVersionAndAnEntryThatThrows', async () => {
    const folder = ContentData.customContentPackPath();
    const manifest = File.readAllText(folder + '/manifest.ini');
    File.writeAllText(folder + '/manifest.ini', '[TLE]\nidentifier=TLE\n');
    const populate = RemoteContentPack.prototype.populate;
    vi.spyOn(RemoteContentPack.prototype, 'populate').mockImplementation(function (this: RemoteContentPack, data: Map<string, string>) {
      if (data.get('name.English') === 'Bad') throw new Error('broken');
      return populate.call(this, data);
    });
    serve({ [MOM_PACKS]: PACKS });
    try {
      const manager = new RemoteContentPackManager();
      await flush();
      expect([...manager.remote_RemoteContentPack_data!.keys()]).toEqual(['TLE']);
      const tle = manager.remote_RemoteContentPack_data!.get('TLE')!;
      expect([tle.downloaded, tle.update_available]).toEqual([true, true]);
      expect(manager.content_pack_list_Mode).toBe(RemoteContentPackListMode.ONLINE);
    } finally {
      File.writeAllText(folder + '/manifest.ini', manifest);
    }
  });

  it('RemoteContentPackManager_AListThatCannotBeReadEndsAsADownloadError', async () => {
    vi.spyOn(ManifestManager.prototype, 'getLocalContentPackManifestIniData').mockImplementation(() => {
      throw new Error('broken');
    });
    serve({ [MOM_PACKS]: PACKS });
    const manager = new RemoteContentPackManager();
    const calls: boolean[] = [];
    manager.register_cb_download((available) => calls.push(available));
    await flush();
    expect(calls).toEqual([false]);
    expect(manager.error_download).toBe(true);
    expect(manager.content_pack_list_Mode).toBe(RemoteContentPackListMode.ERROR_DOWNLOAD);
    expect(manager.remote_RemoteContentPack_data!.size).toBe(0);
  });
});

describe('In game', () => {
  it('MissingPictures_MonsterAndItemWindowsOpenWithoutThem', () => {
    const quest = startQuest();
    quest.eManager.queueEvent('EventGift');
    ui.lastDialog!.onButton(0);
    vi.spyOn(ContentData, 'fileToTexture').mockReturnValue(null);
    expect(() => quest.eManager.queueEvent('EventGift')).not.toThrow();
    expect(ui.lastDialog!.eventData.qEvent.sectionName).toBe('EventGift');
    ui.lastDialog!.onButton(0);
    const inventory = new InventoryWindowMoM();
    expect(ui.lastWindow).toBe(inventory);
    expect(() => game.monsterCanvas.updateList()).not.toThrow();
    const monster = { monsterData: { image: 'missing.png' } } as Quest.Monster;
    expect(() => MonsterDialogMoM.drawMonster(monster)).not.toThrow();
    expect(ui.lastMonsterDrawn).toBe(monster);
    const item = { image: 'missing.png' } as ItemData;
    expect(() => (ShopInterface as unknown as { itemTexture(i: ItemData): void }).itemTexture(item)).not.toThrow();
  });

  it('ButtonsPresent_AMissingEventDoesNotHideTheNextOne', () => {
    const quest = startQuest();
    expect(quest.eManager.events.get('UIButtons')!.buttonsPresent()).toBe(true);
    expect(logOf(quest)).toContain('Warning: Missing event called: EventMissing');
  });

  it('Colours_UnreadableOnesAreWhite', () => {
    const quest = startQuest();
    const buttons = quest.eManager.events.get('EventColour')!.getButtons();
    expect(buttons.map((b) => [b.colour.r, b.colour.g, b.colour.b, b.colour.a])).toEqual([
      [1, 1, 1, 1],
      [1, 1, 1, 1],
    ]);
    expect(() => quest.eManager.queueEvent('EventBoard')).not.toThrow();
    const door = quest.boardItems.get('DoorBad')!;
    expect([door.getColor().r, door.getColor().g, door.getColor().b]).toEqual([1, 1, 1]);
    const text = quest.boardItems.get('UIText') as Quest.UI;
    expect([text.textColor!.r, text.textBackground!.r]).toEqual([1, 1]);
  });

  it('UI_AMissingImageDrawsNothingAndTheRestOfTheListIsAdded', () => {
    const quest = startQuest();
    expect(() => quest.eManager.queueEvent('EventBoard')).not.toThrow();
    expect(quest.boardItems.has('UIBroken')).toBe(true);
    expect((quest.boardItems.get('UIBroken') as Quest.UI).image).toBeNull();
    expect(quest.boardItems.has('UIGood')).toBe(true);
    expect(ui.lastDialog!.eventData.qEvent.sectionName).toBe('EventBoard');
  });

  it('Puzzle_OfAnUnknownClassShowsAsAPlainEvent', () => {
    const quest = startQuest();
    quest.eManager.queueEvent('PuzzleOdd');
    expect(ui.lastDialog!.eventData.qEvent.sectionName).toBe('PuzzleOdd');
    ui.lastDialog!.onButton(0);
    expect(ui.lastDialog!.eventData.qEvent.sectionName).toBe('EventOpened');
  });

  it('ResumeEvent_ReopensATowerPuzzle', () => {
    const quest = startQuest();
    quest.eManager.currentEvent = quest.eManager.events.get('PuzzleTowers')!;
    quest.eManager.resumeEvent();
    expect(ui.lastWindow).toBeInstanceOf(PuzzleTowerWindow);
  });

  it('Spawn_WithoutAMonsterGoesOnAsAPlainEvent', () => {
    const quest = startQuest();
    const before = quest.monsters.length;
    expect(() => quest.eManager.queueEvent('SpawnNothing')).not.toThrow();
    expect(quest.monsters.length).toBe(before);
    expect(ui.lastDialog!.eventData.qEvent.sectionName).toBe('SpawnNothing');
    expect(ui.lastDialog!.eventData.getText()).toBe('A {type} appears.');
  });

  it('EventTriggerType_GoesOnWhenAnEventAddsAQuestChange', () => {
    const quest = startQuest();
    const events = quest.eManager.events.size;
    expect(() => quest.eManager.eventTriggerType('CustomTrigger')).not.toThrow();
    // The window of UIChange added its quest change to the events, which made .NET stop
    expect(quest.eManager.events.size).toBe(events + 1);
    expect(ui.lastDialog!.eventData.qEvent.sectionName).toBe('UIChange');
    expect(quest.eManager.eventStack.count).toBe(1);
    expect(quest.eManager.eventStack.peek()).toBe(quest.eManager.events.get('EventLater'));
  });

  it('VarOperation_AMalformedOneIsSkipped', () => {
    const quest = startQuest();
    expect(() => quest.eManager.queueEvent('EventOps')).not.toThrow();
    expect(quest.vars.getValue('$good')).toBe(1);
    expect(quest.vars.getValue('$broken')).toBe(0);
    expect(logOf(quest)).toContain('Warning: Invalid var operation skipped: $broken,=,');
  });

  it('Save_AFailureIsKeptInLastSaveError', () => {
    startQuest();
    SaveManager.saveWithScreen(1);
    expect(SaveManager.lastSaveError).toBeNull();
    const writeAllBytes = File.writeAllBytes.bind(File);
    vi.spyOn(File, 'writeAllBytes').mockImplementation((path: string, data: Uint8Array) => {
      if (path.endsWith('save1.vSave')) throw new Error('QuotaExceededError');
      writeAllBytes(path, data);
    });
    SaveManager.saveWithScreen(1);
    // With the reason, which Valkyrie only logs (15 November 2026)
    expect(SaveManager.lastSaveError).toMatch(/^Unable to create\/update container file: .*save1\.vSave \(Error: QuotaExceededError\)$/);
    vi.restoreAllMocks();
    SaveManager.saveWithScreen(1);
    expect(SaveManager.lastSaveError).toBeNull();
  });
});
