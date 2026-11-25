// Characterization tests of Descent's hero screens, written from Valkyrie's C# (HeroCanvas.cs, ClassSelectionScreen.cs,
// HeroDialog.cs, MoraleDisplay.cs, Quest.AdjustMorale, RoundController.HeroActivated, SkillWindow.cs and
// InventoryWindow.cs), which has no NUnit tests for them. Not ported from Valkyrie. They use the battery's setting (every Descent pack Valkyrie has) and a small quest
// written here, with a goblin archer and a defeat when morale runs out.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  ActivateDialog,
  Application,
  ClassSelectionScreen,
  Destroyer,
  File,
  Game,
  GameMenu,
  GameStateManager,
  HeadlessUI,
  HeroDialog,
  InventoryWindow,
  LogWindow,
  Quest,
  QuestData,
  Random,
  RoundController,
  SkillWindow,
  ValkyrieDebug,
  type DialogWindow,
} from '@universalis/engine';
import { createEnvironment, type Environment } from '../tools/battery/environment.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const QUEST = '/AppData/Valkyrie/D2E/Editor/DescentTest';

const QUEST_INI = `[Quest]
format=21
type=D2E
defaultlanguage=English
minhero=2
maxhero=4

[QuestText]
Localization.English.txt

[QuestData]
events.ini
`;

const TEXT = `.,English
quest.name,Descent test
EventStart.text,The goblins wait.
EventStart.button1,Continue
SpawnGoblin.text,A goblin archer appears.
SpawnGoblin.button1,Continue
EventNoMorale.text,The heroes flee.
EventNoMorale.button1,Continue
`;

const EVENTS = `[EventStart]
trigger=EventStart
buttons=1
event1=SpawnGoblin
add=TileStart

[SpawnGoblin]
monster=MonsterGoblinArcher
buttons=1
event1=

[EventNoMorale]
trigger=NoMorale
buttons=1
event1=

[TileStart]
side=TileSide1A
xposition=0
yposition=0
`;

let env: Environment;
let ui: HeadlessUI;
let stopLog: () => void;

/** Starts the quest: the hero selection waits. */
function startHeroSelection(): void {
  File.writeAllText(QUEST + '/quest.ini', QUEST_INI);
  File.writeAllText(QUEST + '/Localization.English.txt', TEXT);
  File.writeAllText(QUEST + '/events.ini', EVENTS);
  GameStateManager.Quest.start(new QuestData.Quest(QUEST));
}

/** Starts the quest and chooses two healers, Ashrian and Avric Albright: the class selection follows. */
function chooseHeroes(): ClassSelectionScreen {
  startHeroSelection();
  const game = Game.get();
  game.heroCanvas.heroSelection!.select('HeroAshrian');
  game.heroCanvas.heroSelection!.select('HeroAvricAlbright');
  game.endSelection();
  return ui.lastClassSelection!;
}

/** Chooses their classes, starts the quest and answers its first two dialogs: the goblin archer is on the board. */
function startQuest(): Quest {
  const screen = chooseHeroes();
  screen.select(0, 'ClassDisciple');
  screen.select(1, 'ClassSpiritSpeaker');
  ui.lastClassSelection!.finished();
  dialog().onButton(0);
  dialog().onButton(0);
  return Game.get().currentQuest!;
}

function dialog(): DialogWindow {
  return ui.lastDialog!;
}

/** The class names DrawHero lists for a hero, with what each shows: free, taken or the hero's own. */
function listed(screen: ClassSelectionScreen, hero: number): Map<string, string> {
  return new Map(screen.classOptions(hero).options.map((o) => [o.className, o.picked ? 'picked' : o.available ? 'free' : 'taken']));
}

describe('DescentPlayTests', () => {
  beforeAll(() => {
    env = createEnvironment('D2E', join(root, 'packages', 'engine', 'data'), []);
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

  it('ClassSelection_ListsTheClassesOfEachHerosArchetypeAndATakenOneIsNotFree', () => {
    const screen = chooseHeroes();
    const game = Game.get();

    // Both heroes are healers: the healer classes of every pack, the hybrid ones too while none is chosen
    expect(ui.findTag(Game.HEROSELECT)).toBe(true);
    const first = listed(screen, 0);
    expect(first.get('ClassDisciple')).toBe('free');
    expect(first.get('ClassSpiritSpeaker')).toBe('free');
    expect(first.get('ClassWatchman')).toBe('free');
    expect(first.has('ClassKnight')).toBe(false);

    // A class one hero takes is the other's no more
    screen.select(0, 'ClassDisciple');
    expect(game.currentQuest!.heroes[0]!.className).toBe('ClassDisciple');
    expect(listed(ui.lastClassSelection!, 0).get('ClassDisciple')).toBe('picked');
    expect(listed(ui.lastClassSelection!, 1).get('ClassDisciple')).toBe('taken');
  });

  it('ClassSelection_AHybridClassListsTheClassesOfItsOtherArchetypeAndIsDroppedWhenChosenAgain', () => {
    const screen = chooseHeroes();
    const hero = Game.get().currentQuest!.heroes[0]!;

    // The Watchman is a healer that takes a scout's class
    screen.select(0, 'ClassWatchman');
    expect(hero.hybridClass).toBe('ClassWatchman');
    expect(hero.className).toBe('');
    const hybrid = ui.lastClassSelection!.classOptions(0);
    expect(hybrid.hybridClass).toBe('ClassWatchman');
    const scouts = new Map(hybrid.options.map((o) => [o.className, o.available]));
    expect(scouts.get('ClassThief')).toBe(true);
    expect(scouts.has('ClassDisciple')).toBe(false);
    // No other hybrid class goes with one
    expect(scouts.has('ClassMonk')).toBe(false);
    // Nor can the other hero take it
    expect(listed(ui.lastClassSelection!, 1).get('ClassWatchman')).toBe('taken');

    ui.lastClassSelection!.select(0, 'ClassThief');
    expect(hero.className).toBe('ClassThief');
    ui.lastClassSelection!.select(0, 'ClassWatchman');
    expect(hero.hybridClass).toBe('');
    expect(hero.className).toBe('');
  });

  it('Finished_WaitsForEveryClassThenGivesTheirItemsAndTheMoraleAndStartsTheQuest', () => {
    const screen = chooseHeroes();
    const game = Game.get();
    const quest = game.currentQuest!;

    // Not until every hero has a class
    screen.select(0, 'ClassDisciple');
    ui.lastClassSelection!.finished();
    expect(ui.findTag(Game.HEROSELECT)).toBe(true);
    expect(game.moraleDisplay).toBeNull();

    ui.lastClassSelection!.select(1, 'ClassSpiritSpeaker');
    ui.lastClassSelection!.finished();
    expect(ui.findTag(Game.HEROSELECT)).toBe(false);
    expect(quest.vars.getValue('#ClassDisciple')).toBe(1);
    expect(quest.vars.getValue('#ClassSpiritSpeaker')).toBe(1);
    expect([...quest.items].sort()).toEqual(['ItemIronMace', 'ItemOakStaff', 'ItemWoodenShieldDisciple']);
    // The morale starts at the number of heroes (Game.QuestStartEvent), shown as it changes
    expect(quest.vars.getValue('$%morale')).toBe(2);
    expect(game.moraleDisplay!.morale).toBe(2);
    expect(dialog().eventData.qEvent.sectionName).toBe('EventStart');
  });

  it('EndSelection_SetsTheVariableOfEachChosenHeroEvenWithTooFewAndKeepsIt', () => {
    startHeroSelection();
    const game = Game.get();
    const quest = game.currentQuest!;

    // Ashrian alone: Finished does not start the quest (two heroes at least), but HeroCanvas.EndSection has already set
    // her variable, which scenarios test to know whether a healer plays
    game.heroCanvas.heroSelection!.select('HeroAshrian');
    game.endSelection();
    expect(ui.findTag(Game.HEROSELECT)).toBe(true);
    expect(quest.vars.getValue('#HeroAshrian')).toBe(1);

    // Taken off again and replaced by two other heroes, she keeps it, as in Valkyrie
    game.heroCanvas.heroDiag(quest.heroes[0]!.id);
    game.heroCanvas.heroSelection!.select('HeroGrisbantheThirsty');
    game.heroCanvas.heroSelection!.select('HeroSyndrael');
    game.endSelection();
    expect(quest.heroes.flatMap((h) => (h.heroData !== null ? [h.heroData.sectionName] : []))).toEqual(['HeroGrisbantheThirsty', 'HeroSyndrael']);
    expect(quest.vars.getValue('#HeroAshrian')).toBe(1);
    expect(quest.vars.getValue('#HeroSyndrael')).toBe(1);
  });

  it('BackButton_GoesBackToTheHeroSelection', () => {
    chooseHeroes();
    const game = Game.get();

    ClassSelectionScreen.backButtonAction()();
    expect(game.currentQuest!.heroesSelected).toBe(false);
    expect(game.currentQuest!.heroes.every((h) => h.heroData === null)).toBe(true);
    expect(ui.findTag(Game.HEROSELECT)).toBe(true);
    expect(game.heroCanvas.heroSelection).not.toBeNull();
  });

  it('HeroDiag_OpensTheHeroWindowOnlyWithoutADialogAndGreysEndTurnOnceTheHeroActed', () => {
    const quest = startQuest();
    const game = Game.get();
    const hero = quest.heroes[0]!;

    game.heroCanvas.heroDiag(hero.id);
    const window = ui.lastWindow as HeroDialog;
    expect(window).toBeInstanceOf(HeroDialog);
    expect(window.hero).toBe(hero);
    expect(window.canEndTurn).toBe(true);
    expect(ui.findTag(Game.DIALOG)).toBe(true);
    window.onCancel();
    expect(ui.findTag(Game.DIALOG)).toBe(false);

    hero.activated = true;
    game.heroCanvas.heroDiag(hero.id);
    expect((ui.lastWindow as HeroDialog).canEndTurn).toBe(false);

    // Over another window, nothing
    ui.lastWindow = null;
    game.heroCanvas.heroDiag(quest.heroes[1]!.id);
    expect(ui.lastWindow).toBeNull();
  });

  it('Defeated_TakesOneMoraleAndRecoverBringsTheHeroBack', () => {
    const quest = startQuest();
    const hero = quest.heroes[0]!;
    const undo = quest.undoStack.count;

    new HeroDialog(hero).defeated();
    expect(hero.defeated).toBe(true);
    expect(quest.vars.getValue('$%morale')).toBe(1);
    expect(Game.get().moraleDisplay!.morale).toBe(1);
    expect(ui.findTag(Game.DIALOG)).toBe(false);
    expect(quest.undoStack.count).toBe(undo + 1);

    new HeroDialog(hero).restored();
    expect(hero.defeated).toBe(false);
    expect(quest.vars.getValue('$%morale')).toBe(1);
  });

  it('Defeated_WithoutMoraleLeftTriggersNoMorale', () => {
    const quest = startQuest();
    quest.vars.setValue('$%morale', 0);

    new HeroDialog(quest.heroes[1]!).defeated();
    expect(quest.vars.getValue('$%morale')).toBe(-1);
    expect(Game.get().moraleDisplay!.morale).toBe(0);
    expect(dialog().eventData.qEvent.sectionName).toBe('EventNoMorale');
  });

  it('Activated_EndsTheHerosTurnAndAMonsterGroupActivates', () => {
    const quest = startQuest();
    const hero = quest.heroes[0]!;

    new HeroDialog(hero).activated();
    expect(hero.activated).toBe(true);
    // RoundController.HeroActivated: after each hero, a monster group
    const activation = ui.lastWindow as ActivateDialog;
    expect(activation).toBeInstanceOf(ActivateDialog);
    expect(ui.findTag(Game.ACTIVATION)).toBe(true);

    // While it is open a hero's window still opens, to knock the hero out, but its turn cannot end
    Game.get().heroCanvas.heroDiag(quest.heroes[1]!.id);
    const window = ui.lastWindow as HeroDialog;
    expect(window).toBeInstanceOf(HeroDialog);
    expect(window.canEndTurn).toBe(false);
    // Knocked out then, a defeat for lack of morale waits for the activation (Quest.AdjustMorale with delay)
    quest.vars.setValue('$%morale', 0);
    window.defeated();
    expect(quest.vars.getValue('$%morale')).toBe(-1);
    expect(ui.findTag(Game.DIALOG)).toBe(false);
    expect(ui.findTag(Game.ACTIVATION)).toBe(true);
  });
  it('LogWindow_ItsLinesCountAsADialogUntilItCloses', () => {
    const quest = startQuest();
    const game = Game.get();
    const hero = quest.heroes[0]!;

    // LogWindow.Update draws each line with UIElement's default tag, dialog: the heroes and the menu wait for it
    const log = new LogWindow();
    expect(log.entries()).toEqual(['The goblins wait.', 'A goblin archer appears.']);
    expect(ui.findTag(Game.LOGS)).toBe(true);
    expect(ui.findTag(Game.DIALOG)).toBe(true);
    game.heroCanvas.heroDiag(hero.id);
    GameMenu.create();
    expect(ui.lastWindow).toBe(log);

    // Destroyer.Dialog takes its lines away and leaves its frame and Close
    Destroyer.dialog();
    expect(ui.findTag(Game.LOGS)).toBe(true);
    expect(ui.findTag(Game.DIALOG)).toBe(false);

    // Closed, the hero's window opens
    new LogWindow();
    Destroyer.logs();
    expect(ui.findTag(Game.DIALOG)).toBe(false);
    game.heroCanvas.heroDiag(hero.id);
    expect(ui.lastWindow).toBeInstanceOf(HeroDialog);
  });

  it('SkillWindow_OffersEachHeroTheSkillsOfItsClassThatCostExperience', () => {
    const quest = startQuest();
    quest.vars.setValue('$%xp', 2);
    const window = new SkillWindow();
    expect(ui.lastWindow).toBe(window);
    expect(ui.findTag(Game.DIALOG)).toBe(true);

    // The heroes, with the experience each has to spend; the first one's skills
    expect(window.hero).toBe(0);
    expect(window.heroes().map((h) => [h.hero.heroData!.sectionName, h.availableXP])).toEqual([
      ['HeroAshrian', 2],
      ['HeroAvricAlbright', 2],
    ]);
    const skills = new Map(window.skills().map((s) => [s.skill, `${s.hybrid ? 'hybrid ' : ''}${s.xp} ${s.state}`]));
    // Its class's, by their cost: within its experience, or out of reach
    expect(skills.get('SkillDiscipleBlessedStrike')).toBe('1 affordable');
    expect(skills.get('SkillDiscipleTimeOfNeed')).toBe('2 affordable');
    expect(skills.get('SkillDiscipleRadiantLight')).toBe('3 locked');
    expect(skills.size).toBe(8);
    // Not the one it starts with, which costs nothing, nor another class's
    expect(skills.has('SkillDisciplePrayerOfHealing')).toBe(false);
    expect([...skills.keys()].every((skill) => skill.startsWith('SkillDisciple'))).toBe(true);

    // The other hero's
    window.update(1);
    expect(window.hero).toBe(1);
    expect(window.skills().length).toBeGreaterThan(0);
    expect(window.skills().every((s) => s.skill.startsWith('SkillSpiritSpeaker'))).toBe(true);
  });

  it('SelectSkill_SpendsExperienceAndGivesItBack', () => {
    const quest = startQuest();
    quest.vars.setValue('$%xp', 2);
    const window = new SkillWindow();
    const hero = quest.heroes[0]!;
    const state = (skill: string) => window.skills().find((s) => s.skill === skill)!.state;

    window.selectSkill(0, 'SkillDiscipleTimeOfNeed');
    expect(hero.skills).toEqual(['SkillDiscipleTimeOfNeed']);
    expect(hero.availableXP()).toBe(0);
    expect(state('SkillDiscipleTimeOfNeed')).toBe('picked');
    expect(state('SkillDiscipleBlessedStrike')).toBe('locked');
    expect(window.heroes()[0]!.availableXP).toBe(0);

    // Without experience left, nothing
    window.selectSkill(0, 'SkillDiscipleBlessedStrike');
    expect(hero.skills).toEqual(['SkillDiscipleTimeOfNeed']);

    // Chosen again, it is given back
    window.selectSkill(0, 'SkillDiscipleTimeOfNeed');
    expect(hero.skills).toEqual([]);
    expect(hero.availableXP()).toBe(2);
  });

  it('SkillWindow_AHybridHeroTakesItsHybridClassAndItsOtherClassUpToTwo', () => {
    const screen = chooseHeroes();
    screen.select(0, 'ClassWatchman');
    ui.lastClassSelection!.select(0, 'ClassThief');
    ui.lastClassSelection!.select(1, 'ClassSpiritSpeaker');
    ui.lastClassSelection!.finished();
    const window = new SkillWindow();

    const skills = window.skills();
    expect(skills.filter((s) => s.hybrid).map((s) => [s.skill, s.xp])).toEqual([
      ['SkillWatchmanQuickRecovery', 1],
      ['SkillWatchmanTrailblazer', 2],
      ['SkillWatchmanUnity', 3],
    ]);
    const thief = skills.filter((s) => !s.hybrid);
    expect(thief.length).toBeGreaterThan(0);
    expect(thief.every((s) => s.skill.startsWith('SkillThief') && s.xp < 3)).toBe(true);
  });

  it('InventoryWindow_ListsTheItemsAndTheGold', () => {
    const quest = startQuest();
    quest.vars.setValue('$%gold', 25.4);
    const window = new InventoryWindow();
    expect(ui.lastWindow).toBe(window);
    expect(ui.findTag(Game.DIALOG)).toBe(true);
    expect([...window.items()].sort()).toEqual(['ItemIronMace', 'ItemOakStaff', 'ItemWoodenShieldDisciple']);
    expect(window.gold()).toBe(25);
  });
});
