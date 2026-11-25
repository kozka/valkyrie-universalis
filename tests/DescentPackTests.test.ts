// Characterization tests of Descent's community content packs, written from Valkyrie's C# (ContentData.cs,
// ContentTypes.cs, ClassSelectionScreen.DrawHero, Quest.Tile and RoundController.ActivateMonster), which has no NUnit
// tests for them. Not ported from Valkyrie. They take the three packs of Valkyrie's store (DooM, D1ED and SOTP) and
// DooM's first mission from referencias/descargas, as a player who downloaded and selected them: the packs' components
// and texts, then the mission, whose marines take DooM's classes, whose tiles keep the pack's 100 pixels a square on
// Descent's grid, and whose imps come out of a portal and activate with the pack's actions.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  ActivateDialog,
  ActivationData,
  Application,
  ClassData,
  ContentData,
  ExtractManager,
  File,
  Game,
  GameStateManager,
  HeadlessUI,
  HeroData,
  HeroDialog,
  MonsterData,
  Quest,
  QuestData,
  Random,
  RoundController,
  TileSideData,
  ValkyrieDebug,
  type ClassSelectionScreen,
} from '@universalis/engine';
import { createEnvironment, type Environment } from '../tools/battery/environment.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const downloads = join(root, 'referencias/descargas/D2E');
const PACKS = ['DooM', 'D1ED', 'SOTP'].map((id) => join(downloads, 'packs', `${id}.valkyrieContentPack`));
const MISSION = join(downloads, 'escenarios/Doom_Mission_1.valkyrie');

let env: Environment;
let ui: HeadlessUI;
let stopLog: () => void;

/** DooM's first mission, from its package, with two marines chosen: the class selection follows. */
function chooseMarines(): ClassSelectionScreen {
  const download = ContentData.downloadPath() + '/Doom_Mission_1.valkyrie';
  env.vfs.writeFile(download, () => readFileSync(MISSION), statSync(MISSION).size);
  GameStateManager.Quest.start(new QuestData.Quest(ExtractManager.extractSinglePackageFull(download)));
  const game = Game.get();
  game.heroCanvas.heroSelection!.select('HeroAlpha');
  game.heroCanvas.heroSelection!.select('HeroBravo');
  game.endSelection();
  return ui.lastClassSelection!;
}

/** Answers the dialogs on screen with their first button. */
function answer(): void {
  for (let i = 0; i < 20 && ui.lastDialog !== null; i++) ui.lastDialog.onButton(0);
}

/** The marines with a shotgun and a rifle, without the threat cards, through the intro: they wait at the entrance. */
function startMission(): Quest {
  const screen = chooseMarines();
  screen.select(0, 'ClassMarine1');
  screen.select(1, 'ClassMarine2');
  screen.finished();
  // Its first question, whether to play with the threat cards: no, the second button
  ui.lastDialog!.onButton(1);
  answer();
  return Game.get().currentQuest!;
}

/** The size in pixels of a picture of a pack, from its PNG header. */
function pictureSize(image: string): [number, number] {
  const png = new DataView(File.readAllBytes(ContentData.resolveTextureFile(image)!).buffer);
  return [png.getUint32(16), png.getUint32(20)];
}

/** Where a pixel of a tile's picture lies on the board, from where Quest.Tile put the picture (y up). */
function onBoard(tile: Quest.Tile, x: number, y: number): [number, number] {
  const { position, rotation } = tile.unityObject!.transform;
  const pps = tile.cTile.pxPerSquare;
  const size = tile.image!.sizeDelta;
  const u = x / pps - size.x / 2;
  const v = size.y / 2 - y / pps;
  const radians = (rotation * Math.PI) / 180;
  return [position.x + u * Math.cos(radians) - v * Math.sin(radians), position.y + u * Math.sin(radians) + v * Math.cos(radians)];
}

describe.skipIf(![...PACKS, MISSION].every((file) => existsSync(file)))('DescentPackTests', () => {
  beforeAll(() => {
    env = createEnvironment('D2E', join(root, 'packages', 'engine', 'data'), PACKS);
  }, 120_000);

  beforeEach(() => {
    ui = new HeadlessUI();
    env.game.ui = ui;
    env.game.roundControl = new RoundController();
    env.game.moraleDisplay = null;
    Application.fatalErrors.length = 0;
    Random.initState(1);
    stopLog = ValkyrieDebug.onLog(() => {});
  });

  afterEach(() => {
    stopLog();
  });

  it('ContentPacks_LoadTheirComponentsWithTheirTexts', () => {
    const cd = env.game.cd;
    // Each found in Download/ContentPacks, DooM's one folder down in its zip
    for (const id of ['DooM', 'D1ED', 'SOTP']) expect(cd.allPacks.find((p) => p.id === id)?.type).toBe('D2ECustom');
    expect(cd.getContentName('DooM')).toBe('DooM 2016 Ver 1.0');

    // DooM: tiles of 100 pixels a square, marines with their own archetype and classes, demons and their activations
    const tile = cd.get(TileSideData, 'TileSideDooM_01_A');
    expect([tile.pxPerSquare, tile.top, tile.left]).toEqual([100, 14, 0]);
    expect(tile.image).toMatch(/\/DooM\/img\/Tiles\/01_A$/);
    expect(cd.get(HeroData, 'HeroAlpha').name.translate()).toBe('Alpha');
    expect(cd.get(HeroData, 'HeroAlpha').archetype).toBe('DooM');
    expect(cd.get(ClassData, 'ClassMarine1').items).toEqual(['ItemSuperShotgun', 'ItemCombatShotgun']);
    const imp = cd.get(MonsterData, 'MonsterImp');
    expect(imp.name.translate()).toBe('Imp');
    expect(imp.activations).toEqual(['LongShot', 'ChargedShot']);
    const charged = cd.get(ActivationData, 'MonsterActivationChargedShot');
    expect(charged.minionFirst).toBe(true);
    expect(charged.masterActions.fullKey).toBe('');
    // Its texts, with each \n of the file as a new line (DictionaryI18n.ParseEntry)
    expect(charged.ability.translate()).toBe("Charged Shot\nThe demon's attack gains 1 Red Dice.");

    // D1ED: the first edition's tiles, each with its own pixels a square
    expect(cd.get(TileSideData, 'TileSideD1CRN').pxPerSquare).toBe(104);
    expect(cd.get(TileSideData, 'TileSideD1X').pxPerSquare).toBe(101);
    // SOTP: its heroes and monsters, named by its texts
    expect(cd.get(HeroData, 'HeroElgaThePilgrim').name.translate()).toBe('Elga the Pilgrim');
    expect(cd.get(HeroData, 'HeroElgaThePilgrim').archetype).toBe('healer');
    expect(cd.get(MonsterData, 'MonsterSarcophagusGuard').name.translate()).toBe('Sarcophagus Guard');
    expect(Application.fatalErrors).toEqual([]);
  });

  it('DooMMission_MarinesChooseAmongTheClassesOfTheirArchetype', () => {
    const screen = chooseMarines();
    // DrawHero lists the classes of the hero's archetype: DooM's four, none of Descent's
    for (const hero of [0, 1]) {
      expect(screen.classOptions(hero).options.map((o) => o.className)).toEqual(['ClassMarine1', 'ClassMarine2', 'ClassMarine3', 'ClassMarine4']);
    }
    screen.select(0, 'ClassMarine1');
    expect(screen.classOptions(1).options.find((o) => o.className === 'ClassMarine1')!.available).toBe(false);
    screen.select(1, 'ClassMarine2');
    screen.finished();
    // Their classes' weapons go to the party
    const quest = Game.get().currentQuest!;
    expect([...quest.items].sort()).toEqual(['ItemBurstRifle', 'ItemCombatShotgun', 'ItemHeavyAssaultRifle', 'ItemSuperShotgun']);
  });

  it('DooMMission_PutsThePacksTilesOnTheGridWithTheirOwnPixelsASquare', () => {
    const quest = startMission();
    const tiles = [...quest.boardItems.values()].filter((c) => c instanceof Quest.Tile);
    expect(tiles.map((t) => t.qTile.sectionName).sort()).toEqual(['Tile_01_Entry', 'Tile_01_Room_01', 'Tile_01_Room_02']);
    for (const tile of tiles) {
      // The pack's picture at 100 pixels a square, not Descent's 105
      const [width, height] = pictureSize(tile.cTile.image);
      expect(tile.cTile.pxPerSquare).toBe(100);
      expect(tile.image!.sizeDelta).toMatchObject({ x: Math.fround(width / 100), y: Math.fround(height / 100) });
      // The centre of its top left square, which the TileSide gives in pixels, on the tile's place of the grid
      const [x, y] = onBoard(tile, tile.cTile.left + 50, tile.cTile.top + 50);
      expect(Math.abs(x - tile.qTile.location.x), tile.qTile.sectionName).toBeLessThan(0.01);
      expect(Math.abs(y - tile.qTile.location.y), tile.qTile.sectionName).toBeLessThan(0.01);
    }
  });

  it('DooMMission_ImpsComeOutOfAPortalAndActivateWithThePacksActions', () => {
    const quest = startMission();
    const game = Game.get();
    // The first portal, pressed on the board, brings a group of imps
    const portal = game.tokenBoard.tc.find((t) => t.c instanceof Quest.Token && t.c.qToken.sectionName === 'Token_01_Portal_1')!;
    expect(portal.clickable).toBe(true);
    portal.startEvent();
    answer();
    expect(quest.monsters.map((m) => m.monsterData.sectionName)).toEqual(['MonsterImp']);
    expect(quest.boardItems.has('Token_01_Portal_1')).toBe(false);

    // After a marine's turn they activate: one of their own three activations or the two they share
    new HeroDialog(quest.heroes[0]!).activated();
    const window = ui.lastWindow as ActivateDialog;
    expect(window).toBeInstanceOf(ActivateDialog);
    const activation = window.monster.currentActivation!;
    expect(['MonsterActivationImp1', 'MonsterActivationImp2', 'MonsterActivationImp3', 'MonsterActivationLongShot', 'MonsterActivationChargedShot']).toContain(
      activation.ad.sectionName,
    );
    // DooM's demons have no master: their actions come in one step, with the action symbol of Descent's font
    expect(window.singleStep).toBe(true);
    expect(window.master).toBe(false);
    expect(activation.minionActions).toMatch(/^∞/);
    expect(activation.minionActions).toContain('marine');
    window.activated();
    expect(ui.findTag(Game.ACTIVATION)).toBe(false);
    expect(Application.fatalErrors).toEqual([]);
  });

  // Not in Valkyrie: the app's DooM button loads DooM's pack whatever the collection says, and Descent's leaves it out
  it('SelectQuest_LeavesOutAndAddsTheAppsPacks', () => {
    const game = Game.get();
    game.config.addPack('D2E', 'DooM');
    game.config.addPack('D2E', 'SOTP');
    try {
      GameStateManager.mainMenu();
      game.packsLeftOut = ['DooM'];
      game.selectQuest();
      expect(game.cd.getLoadedPackIDs()).toContain('SOTP');
      expect(game.cd.getLoadedPackIDs()).not.toContain('DooM');

      game.config.removePack('D2E', 'DooM');
      GameStateManager.mainMenu();
      game.packsLeftOut = [];
      game.packsAdded = ['DooM'];
      game.selectQuest();
      expect(game.cd.getLoadedPackIDs()).toContain('DooM');
      expect(game.cd.get(HeroData, 'HeroAlpha').archetype).toBe('DooM');
    } finally {
      game.packsLeftOut = [];
      game.packsAdded = [];
      game.config.removePack('D2E', 'DooM');
      game.config.removePack('D2E', 'SOTP');
      for (const pack of game.cd.allPacks) game.contentLoader.loadContentID(pack.id!);
    }
  });
});
