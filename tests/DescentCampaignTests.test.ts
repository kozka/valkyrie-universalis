// Characterization tests of Descent's shop and campaigns, written from Valkyrie's C# (ShopInterface.cs,
// EventManager.StartQuestEvent, Quest.ChangeQuest, VarManager.TrimQuest and SaveManager.cs), which has no NUnit tests
// for them. Not ported from Valkyrie. They use the battery's setting (every Descent pack Valkyrie has) and a small
// campaign written here: a blacksmith that sells two items, and a second quest it leads to. As in the scenarios, the
// events that leave the shop remove it (remove=#shop): Valkyrie closes it nowhere else, not even on a quest change.
// Then the base game's campaign, The Shadow Rune (referencias/descargas), from its first quest to its second.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  Application,
  ContentData,
  Directory,
  ExtractManager,
  File,
  Game,
  GameStateManager,
  HeadlessUI,
  ItemData,
  Quest,
  QuestData,
  Random,
  RoundController,
  SaveManager,
  ShopInterface,
  ValkyrieDebug,
} from '@universalis/engine';
import { createEnvironment, type Environment } from '../tools/battery/environment.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CAMPAIGN = '/AppData/Valkyrie/D2E/Editor/CampaignTest';
const TSR = join(root, 'referencias/descargas/D2E/escenarios/TSR.valkyrie');

const questIni = (name: string) => `[Quest]
format=21
type=D2E
defaultlanguage=English
minhero=2
maxhero=4

[QuestText]
Localization.English.txt

[QuestData]
events.ini
${name}`;

const TEXT = `.,English
quest.name,Campaign test
EventStart.text,The heroes reach the town.
EventStart.button1,Continue
EventShop.text,The blacksmith's wares.
EventShop.button1,Leave the smithy
EventShop.button2,Travel on
EventLeave.text,You leave.
EventLeave.button1,Continue
`;

const EVENTS = `[EventStart]
trigger=EventStart
buttons=1
event1=EventShop
operations=$%gold,=,100 counter,=,5

[EventShop]
buttons=2
event1=EventLeave
buttoncolor1="green"
event2=EventTravel
add=QItemSword QItemRing

[EventLeave]
buttons=1
event1=
remove=#shop

[EventTravel]
display=false
buttons=1
event1=act2/quest.ini
remove=#shop

[QItemSword]
itemname=ItemSteelGreatsword

[QItemRing]
itemname=ItemRingOfPower
`;

const ACT2_TEXT = `.,English
quest.name,Campaign test, act II
EventStart.text,The second quest begins.
EventStart.button1,Continue
`;

const ACT2_EVENTS = `[EventStart]
trigger=EventStart
buttons=1
event1=
`;

/** A PNG header, as the app's picture of the screen would start. */
const PICTURE = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52, 0, 0, 0, 8, 0, 0, 0, 8, 8, 2, 0, 0, 0]);

/** HeadlessUI with a picture of the screen, as the app takes it. */
class PictureUI extends HeadlessUI {
  override takeScreenshot(done: (png: Uint8Array | null) => void): void {
    this.screenshots++;
    done(PICTURE);
  }
}

let env: Environment;
let ui: HeadlessUI;
let stopLog: () => void;

/** The two healers with their classes, the quest started and its first dialog answered: the shop is open. */
function startCampaign(): Quest {
  File.writeAllText(CAMPAIGN + '/quest.ini', questIni(''));
  File.writeAllText(CAMPAIGN + '/Localization.English.txt', TEXT);
  File.writeAllText(CAMPAIGN + '/events.ini', EVENTS);
  File.writeAllText(CAMPAIGN + '/act2/quest.ini', questIni(''));
  File.writeAllText(CAMPAIGN + '/act2/Localization.English.txt', ACT2_TEXT);
  File.writeAllText(CAMPAIGN + '/act2/events.ini', ACT2_EVENTS);

  GameStateManager.Quest.start(new QuestData.Quest(CAMPAIGN));
  const game = Game.get();
  game.heroCanvas.heroSelection!.select('HeroAshrian');
  game.heroCanvas.heroSelection!.select('HeroAvricAlbright');
  game.endSelection();
  const classes = ui.lastClassSelection!;
  classes.select(0, 'ClassDisciple');
  classes.select(1, 'ClassSpiritSpeaker');
  classes.finished();
  ui.lastDialog!.onButton(0);
  return game.currentQuest!;
}

function shop(quest: Quest): ShopInterface {
  return quest.boardItems.get('#shop') as ShopInterface;
}

/**
 * Plays as the battery does until the quest running is another: a dialog's first button a dialog lets press, an open
 * shop's first button, or else the quest's topmost clickable UI element. Gives the new quest's file, or null.
 */
function playToAnotherQuest(steps: number): string | null {
  const game = Game.get();
  const from = game.currentQuest!.qd.questPath;
  for (let i = 0; i < steps && game.currentQuest!.qd.questPath === from; i++) {
    const dialog = ui.lastDialog;
    if (dialog !== null) {
      const button = dialog.buttons.find((b) => b.enabled);
      if (button === undefined) return null;
      dialog.onButton(button.num);
    } else if (ui.findTag(Game.SHOP)) {
      shop(game.currentQuest!).onButton(0);
    } else {
      const top = game.tokenBoard.tc.filter((c) => c.clickable && c.c instanceof Quest.UI && c.c.unityObject !== null).at(-1);
      if (top === undefined) return null;
      top.startEvent();
    }
  }
  const to = game.currentQuest!.qd.questPath;
  return to === from ? null : to;
}

describe('DescentCampaignTests', () => {
  beforeAll(() => {
    env = createEnvironment('D2E', join(root, 'packages', 'engine', 'data'), []);
  }, 120_000);

  beforeEach(() => {
    ui = new PictureUI();
    env.game.ui = ui;
    env.game.roundControl = new RoundController();
    env.game.moraleDisplay = null;
    Application.fatalErrors.length = 0;
    Random.initState(1);
    stopLog = ValkyrieDebug.onLog(() => {});
    if (Directory.exists(ContentData.gameTypePath + '/Save')) Directory.delete(ContentData.gameTypePath + '/Save', true);
  });

  afterEach(() => {
    stopLog();
  });

  it('Shop_SellsTheItemsOfItsEventForGoldAndBuysThePartys', () => {
    const quest = startCampaign();
    const game = Game.get();
    const smithy = shop(quest);
    expect(smithy).toBeInstanceOf(ShopInterface);
    expect(ui.findTag(Game.SHOP)).toBe(true);
    expect(quest.activeShop).toBe('EventShop');
    expect(quest.shops.get('EventShop')).toEqual(['ItemSteelGreatsword', 'ItemRingOfPower']);
    // The event's buttons, in their colours: DrawButtons puts their bytes in a Color, whose channels Unity clamps to 1,
    // so green (#008000) is drawn #00FF00
    expect(smithy.buttons.map((b) => [b.colour.r, b.colour.g, b.colour.b, b.colour.a])).toEqual([
      [0, 1, 0, 1],
      [1, 1, 1, 1],
    ]);

    // Prices: an item's own, or 25 for a class's
    const ring = game.cd.get(ItemData, 'ItemRingOfPower');
    expect(smithy.getPurchasePrice(ring)).toBe(150);
    expect(smithy.getPurchasePrice(game.cd.get(ItemData, 'ItemIronMace'))).toBe(25);

    // Not enough gold: nothing; enough: it goes to the party
    smithy.buy('ItemRingOfPower');
    expect(quest.items.has('ItemRingOfPower')).toBe(false);
    quest.vars.setValue('$%gold', 200);
    smithy.buy('ItemRingOfPower');
    expect(quest.items.has('ItemRingOfPower')).toBe(true);
    expect(quest.vars.getValue('$%gold')).toBe(50);
    expect(quest.shops.get('EventShop')).toEqual(['ItemSteelGreatsword']);

    // Sold, at its price, or at the quest's sell ratio; a class item always for 25
    smithy.sell('ItemRingOfPower');
    expect(quest.vars.getValue('$%gold')).toBe(200);
    expect(quest.shops.get('EventShop')).toEqual(['ItemSteelGreatsword', 'ItemRingOfPower']);
    quest.vars.setValue('$%sellratio', 0.5);
    expect(smithy.getSellPrice(game.cd.get(ItemData, 'ItemSteelGreatsword'))).toBe(88);
    smithy.sell('ItemIronMace');
    expect(quest.vars.getValue('$%gold')).toBe(225);
    expect(quest.items.has('ItemIronMace')).toBe(false);

    // With a window open its buttons do nothing; then they end the event, whose next event removes the shop
    ui.tags.add(Game.DIALOG);
    smithy.onButton(0);
    expect(ui.findTag(Game.SHOP)).toBe(true);
    ui.tags.delete(Game.DIALOG);
    smithy.onButton(0);
    expect(ui.findTag(Game.SHOP)).toBe(false);
    expect(quest.activeShop).toBe('');
    expect(ui.lastDialog!.eventData.qEvent.sectionName).toBe('EventLeave');
  });

  it('ChangeQuest_KeepsTheHeroesWithTheirClassesSkillsAndItemsAndTheExperienceAndGold', () => {
    const quest = startCampaign();
    quest.vars.setValue('$%gold', 200);
    shop(quest).buy('ItemRingOfPower');
    quest.vars.setValue('$%xp', 3);
    quest.heroes[0]!.skills.push('SkillDiscipleTimeOfNeed');
    quest.heroes[0]!.activated = true;

    // Its second button leaves the shop for the next quest of the campaign
    shop(quest).onButton(1);
    const next = Game.get().currentQuest!;
    expect(next.qd.questPath).toBe(CAMPAIGN + '/act2/quest.ini');
    expect(ui.findTag(Game.SHOP)).toBe(false);
    expect(ui.lastDialog!.text).toContain('The second quest begins.');

    // The heroes, their classes and skills, the party's items, and the variables of the campaign ($%) go on
    expect(next.heroes.filter((h) => h.heroData !== null).map((h) => [h.heroData!.sectionName, h.className])).toEqual([
      ['HeroAshrian', 'ClassDisciple'],
      ['HeroAvricAlbright', 'ClassSpiritSpeaker'],
    ]);
    expect(next.heroes[0]!.skills).toEqual(['SkillDiscipleTimeOfNeed']);
    expect(next.heroes[0]!.activated).toBe(false);
    expect([...next.items].sort()).toEqual(['ItemIronMace', 'ItemOakStaff', 'ItemRingOfPower', 'ItemWoodenShieldDisciple']);
    expect(next.vars.getValue('$%xp')).toBe(3);
    expect(next.vars.getValue('$%gold')).toBe(50);
    expect(next.heroes[0]!.availableXP()).toBe(1);
    // The quest's own variables and shops do not
    expect(next.vars.getValue('counter')).toBe(0);
    expect(next.shops.size).toBe(0);
    expect(next.vars.getValue('#round')).toBe(1);
    expect(next.vars.getValue('#ClassDisciple')).toBe(1);
  });

  it('Load_RestoresTheHeroesSkillsTheGoldAndTheOpenShop', () => {
    const quest = startCampaign();
    quest.vars.setValue('$%gold', 200);
    shop(quest).buy('ItemRingOfPower');
    quest.vars.setValue('$%xp', 2);
    quest.heroes[1]!.skills.push('SkillSpiritSpeakerStoneskin');
    SaveManager.save(1);

    // Things change after saving
    quest.vars.setValue('$%gold', 0);
    quest.items.clear();
    quest.heroes[1]!.skills.length = 0;

    SaveManager.load(1);
    const loaded = Game.get().currentQuest!;
    expect(loaded).not.toBe(quest);
    expect(loaded.vars.getValue('$%gold')).toBe(50);
    expect(loaded.vars.getValue('$%xp')).toBe(2);
    expect(loaded.items.has('ItemRingOfPower')).toBe(true);
    expect(loaded.heroes[1]!.className).toBe('ClassSpiritSpeaker');
    expect(loaded.heroes[1]!.skills).toContain('SkillSpiritSpeakerStoneskin');
    expect(loaded.vars.getValue('$%morale')).toBe(2);
    // The shop is open again, with what it still sells
    expect(loaded.activeShop).toBe('EventShop');
    expect(loaded.shops.get('EventShop')).toEqual(['ItemSteelGreatsword']);
    expect(ui.findTag(Game.SHOP)).toBe(true);
    expect(shop(loaded)).toBeInstanceOf(ShopInterface);
    expect(Application.fatalErrors).toEqual([]);
  });

  it.skipIf(!existsSync(TSR))('TheShadowRune_GoesFromItsFirstQuestThroughTheCampaignPhaseToTheNext', () => {
    const download = ContentData.downloadPath() + '/TSR.valkyrie';
    env.vfs.writeFile(download, () => readFileSync(TSR), statSync(TSR).size);
    const campaign = ExtractManager.extractSinglePackageFull(download);
    GameStateManager.Quest.start(new QuestData.Quest(campaign));
    const game = Game.get();
    game.heroCanvas.heroSelection!.select('HeroAshrian');
    game.heroCanvas.heroSelection!.select('HeroAvricAlbright');
    game.endSelection();
    ui.lastClassSelection!.select(0, 'ClassDisciple');
    ui.lastClassSelection!.select(1, 'ClassSpiritSpeaker');
    ui.lastClassSelection!.finished();

    // Its title screen's Start leads to its first quest, The First Blood
    expect(playToAnotherQuest(10)).toBe(campaign + '/01_FB/quest.ini');
    // Won (as when its Mauler is defeated): the rewards, and the campaign phase, with the heroes and the campaign's
    // variables (% and $%)
    game.currentQuest!.eManager.queueEvent('EventWin');
    expect(playToAnotherQuest(10)).toBe(campaign + '/CP/quest.ini');
    const phase = game.currentQuest!;
    expect(phase.vars.getValue('%PlayedQuestFirstBlood')).toBe(1);
    expect(phase.vars.getValue('%QuestAmountPlayed')).toBe(1);
    expect(phase.vars.getValue('$%gold')).toBe(50);
    expect(phase.vars.getValue('$%xp')).toBe(1);
    expect(phase.heroes.filter((h) => h.heroData !== null).map((h) => h.className)).toEqual(['ClassDisciple', 'ClassSpiritSpeaker']);

    // The map, the city with its shop, the map again with the act's quests, one of them chosen and the journey to it
    const next = playToAnotherQuest(60);
    // One of the five quests of the first act: 02_AFG to 06_TMB
    expect(next!.substring(0, campaign.length + 1)).toBe(campaign + '/');
    expect(next!.substring(campaign.length + 1)).toMatch(/^0[2-6]_[A-Z]+\/quest\.ini$/);
    const quest = game.currentQuest!;
    expect(quest.vars.getValue('%PlayedQuestFirstBlood')).toBe(1);
    expect(quest.vars.getValue('$%xp')).toBe(1);
    expect(quest.heroes.filter((h) => h.heroData !== null).map((h) => h.heroData!.sectionName)).toEqual(['HeroAshrian', 'HeroAvricAlbright']);
    expect(Application.fatalErrors).toEqual([]);
  });
});
