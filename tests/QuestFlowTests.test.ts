// Characterization tests of how a quest starts and runs, written from Valkyrie's C# (Game.cs, Quest.cs,
// EventManager.cs, DialogWindow.cs, HeroCanvas.cs and InvestigatorItems.cs), which has no NUnit tests for it.
// Not ported from Valkyrie. They use the battery's setting (all MoM base packs, stand-ins for official pictures)
// and a small quest written here; it changes quest in a button, as the TLE scenarios do.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  Application,
  EventManager,
  File,
  Game,
  GameStateManager,
  HeadlessUI,
  Quest,
  QuestData,
  Random,
  ValkyrieDebug,
} from '@universalis/engine';
import { RoundControllerMoM } from '@universalis/module-mom';
import { createEnvironment, type Environment } from '../tools/battery/environment.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const QUEST = '/AppData/Valkyrie/MoM/Editor/FlowTest';

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
quest.name,Flow test
EventStart.text,Welcome {rnd:hero}. Keep {var:%keep}, local {var:local}.
EventStart.button1,Next
EventStart.button2,Change
EventSecond.text,Second {c:TokenLook} {will}
EventSecond.button1,Close
`;

const EVENTS = `[EventStart]
trigger=EventStart
buttons=2
event1=EventSecond
event2=sub/quest.ini
add=TileHall TokenLook
operations=%keep,=,3 local,=,5

[EventSecond]
buttons=1
event1=

[TileHall]
side=TileSideAlley1
xposition=0
yposition=0

[TokenLook]
type=TokenSearch
xposition=2
yposition=1
buttons=1
event1=EventSecond
`;

const SUB_QUEST_INI = `[Quest]
format=21
type=MoM
defaultlanguage=English
hidden=True

[QuestText]
Localization.English.txt

[EventSubStart]
trigger=EventStart
buttons=1
event1=
operations=$%seen,=,1
`;

const SUB_TEXT = `.,English
EventSubStart.text,In the second quest
`;

let env: Environment;
let ui: HeadlessUI;
let log: (string | undefined)[];
let stopLog: () => void;

/**
 * Writes the quest (with other events if given), starts it, picks two investigators and closes the starting items;
 * in test mode, as a test from the editor plays it, if asked.
 */
function startQuest(events = EVENTS, testMode = false): Quest {
  File.writeAllText(QUEST + '/quest.ini', QUEST_INI);
  File.writeAllText(QUEST + '/Localization.English.txt', TEXT);
  File.writeAllText(QUEST + '/events.ini', events);
  File.writeAllText(QUEST + '/sub/quest.ini', SUB_QUEST_INI);
  File.writeAllText(QUEST + '/sub/Localization.English.txt', SUB_TEXT);

  GameStateManager.Quest.start(new QuestData.Quest(QUEST));
  const game = Game.get();
  game.heroCanvas.heroSelection!.select('HeroRitaYoung');
  game.heroCanvas.heroSelection!.select('HeroAgathaCrane');
  game.endSelection();
  game.testMode = testMode;
  // The finished button of the starting items
  game.questStartEvent();
  return game.currentQuest!;
}

function dialogEvent(): string {
  return ui.lastDialog!.eventData.qEvent.sectionName;
}

describe('QuestFlowTests', () => {
  beforeAll(() => {
    env = createEnvironment('MoM', join(root, 'packages', 'engine', 'data'), []);
  }, 120_000);

  beforeEach(() => {
    ui = new HeadlessUI();
    env.game.ui = ui;
    env.game.roundControl = new RoundControllerMoM();
    Application.fatalErrors.length = 0;
    Random.initState(1);
    log = [];
    stopLog = ValkyrieDebug.onLog((message) => log.push(message));
  });

  afterEach(() => {
    stopLog();
  });

  it('StartQuest_HeroSelectionStartsTheQuestWithTheHeroesFirst', () => {
    GameStateManager.Quest.start(new QuestData.Quest(writeAndPath()));
    const game = Game.get();
    const quest = game.currentQuest!;

    // Game.StartQuest: one empty slot per hero allowed, the round and the loaded packs as variables
    expect(quest.heroes.map((h) => h.id)).toEqual([1, 2, 3, 4, 5]);
    expect(quest.heroes.every((h) => h.heroData === null)).toBe(true);
    expect(quest.vars.getValue('#round')).toBe(1);
    expect(quest.vars.getValue('#MoMBase')).toBe(1);
    expect(ui.lastHeroSelection).toBe(game.heroCanvas.heroSelection);

    // HeroSelection.Select fills the first empty slot, once per hero
    game.heroCanvas.heroSelection!.select('HeroAgathaCrane');
    game.heroCanvas.heroSelection!.select('HeroAgathaCrane');
    // HeroCanvas.HeroDiag before the quest starts empties a slot
    game.heroCanvas.heroSelection!.select('HeroRitaYoung');
    game.heroCanvas.heroDiag(1);
    game.heroCanvas.heroSelection!.select('HeroFatherMateo');
    expect(quest.heroes.map((h) => h.heroData?.sectionName ?? null)).toEqual(['HeroFatherMateo', 'HeroRitaYoung', null, null, null]);

    // Game.EndSelection: morale is the number of heroes, then HeroCanvas.EndSection
    game.endSelection();
    expect(quest.vars.getValue('$%morale')).toBe(2);
    expect(quest.vars.getValue('#heroes')).toBe(2);
    expect(quest.vars.getValue('#HeroRitaYoung')).toBe(1);
    expect(quest.heroesSelected).toBe(true);
    // MoM shows the starting items, whose finished button starts the quest
    expect(ui.lastInvestigatorItems).not.toBeNull();
    expect(ui.lastDialog).toBeNull();
  });

  it('QuestStartEvent_TriggersEventStartWithItsComponentsAndDialog', () => {
    const quest = startQuest();
    const game = Game.get();

    expect(dialogEvent()).toBe('EventStart');
    // The operations ran before the dialog text was made
    expect(ui.lastDialog!.text).toContain('Keep 3, local 5.');
    expect(ui.lastDialog!.text).not.toContain('{rnd:hero}');
    // Quest.Add: a tile and a token on the board, in order
    expect(quest.ordered_boardItems).toEqual(['TileHall', 'TokenLook']);
    expect(quest.boardItems.get('TileHall')).toBeInstanceOf(Quest.Tile);
    expect(quest.firstTileDisplayed).toBe(true);
    expect(game.tokenBoard.tc.map((c) => c.c?.getEvent()?.sectionName)).toEqual(['TokenLook']);
    // DialogWindow.CreateWindow: both buttons, enabled
    expect(ui.lastDialog!.buttons.map((b) => [b.num, b.enabled])).toEqual([
      [0, true],
      [1, true],
    ]);
    expect(Application.fatalErrors).toEqual([]);
  });

  it('OnButton_LogsTheTextAndTriggersTheNextEvent', () => {
    const quest = startQuest();
    const text = ui.lastDialog!.text;

    ui.lastDialog!.onButton(0);

    expect(dialogEvent()).toBe('EventSecond');
    expect(quest.eventList).toEqual(['EventStart']);
    // What the log window shows: editor entries (such as "Adding quest var") are left out
    expect([...quest.log].map((e) => e.getEntry()).filter((entry) => entry !== '')).toEqual([text + '\n\n']);
    // {c:Token} is the component name for a token, and {will} the MoM symbol
    expect(ui.lastDialog!.text).toBe('Second TokenLook ');
  });

  it('TokenClick_QueuesItsEventOnlyWhenNoDialogIsOpen', () => {
    const quest = startQuest();
    const control = Game.get().tokenBoard.tc[0]!;

    control.startEvent();
    expect(quest.eManager.eventStack.count).toBe(0);

    ui.lastDialog!.onButton(0);
    ui.lastDialog!.onButton(0);
    expect(ui.findTag(Game.DIALOG)).toBe(false);
    control.startEvent();
    expect(dialogEvent()).toBe('TokenLook');
  });

  it('StartQuestEvent_ChangesQuestKeepingOnlyPercentVariablesAndHeroes', () => {
    const quest = startQuest();
    const game = Game.get();
    const saves = ui.screenshots;

    ui.lastDialog!.onButton(1);

    // EventManager.EndEvent finds the quest file and adds a StartQuestEvent; TriggerEvent calls Quest.ChangeQuest
    expect(game.currentQuest).toBe(quest);
    expect(quest.qd.questPath).toBe(QUEST + '/sub/quest.ini');
    expect(quest.originalPath).toBe(QUEST);
    expect(quest.questPath).toBe(QUEST + '/sub');
    expect(quest.eManager.events.has('sub/quest.ini')).toBe(false);
    // VarManager.TrimQuest keeps % and $% variables only, then the quest sets its own
    expect(quest.vars.getValue('%keep')).toBe(3);
    expect(quest.vars.getValue('$%morale')).toBe(2);
    expect(quest.vars.vars.has('local')).toBe(false);
    expect(quest.vars.getValue('#heroes')).toBe(2);
    expect(quest.vars.getValue('#round')).toBe(1);
    expect(quest.vars.getValue('$%seen')).toBe(1);
    // The board, the selections and the undo stack start again; heroes, items and the log stay
    expect(quest.ordered_boardItems).toEqual([]);
    expect(game.tokenBoard.tc).toEqual([]);
    expect(quest.undoStack.count).toBe(0);
    expect(quest.heroes.filter((h) => h.heroData !== null).length).toBe(2);
    expect(quest.eventList).toEqual(['EventStart']);
    // The new quest's EventStart is on screen and the game is saved
    expect(dialogEvent()).toBe('EventSubStart');
    expect(ui.lastDialog!.text).toBe('In the second quest');
    expect(ui.screenshots).toBe(saves + 1);
  });

  it('ChangeQuest_VariableWithOneCharacterThrowsAsInValkyrie', () => {
    startQuest(EVENTS.replace('operations=%keep,=,3 local,=,5', 'operations=%keep,=,3 x,=,1'));

    // VarManager.TrimQuest reads two characters of every name: Valkyrie stops this button with an exception
    expect(() => ui.lastDialog!.onButton(1)).toThrow(/out of range|Index and length/);
  });

  it('EndEvent_MissingEventIsLoggedAndSkipped', () => {
    const quest = startQuest(EVENTS.replace('event1=EventSecond\nevent2', 'event1=EventMissing\nevent2'));

    ui.lastDialog!.onButton(0);

    expect(log).toContain('Warning: Missing event called: EventMissing');
    expect([...quest.log].map((e) => e.toString(0))).toContain('editor0=Warning: Missing event called: EventMissing\r\n');
    expect(quest.eManager.currentEvent).toBeNull();
    expect(ui.lastDialog).toBeNull();
  });

  it('EndEvent_EndVariableEndsTheQuestAndGoesToTheMenuOutsideAPackage', () => {
    const quest = startQuest(EVENTS.replace('operations=%keep,=,3 local,=,5', 'operations=$end,=,1'));

    ui.lastDialog!.onButton(0);

    // Not a .valkyrie package, so GameStateManager.MainMenu instead of the end screen
    expect(quest.questHasEnded).toBe(true);
    expect(ui.mainMenus).toBe(1);
    expect(ui.endGames).toBe(0);
    expect(Game.get().currentQuest).toBeNull();
  });

  it('Undo_RestoresTheSavedStateAndKeepsTheLog', () => {
    const quest = startQuest();
    const game = Game.get();
    quest.save();
    ui.lastDialog!.onButton(0);
    quest.vars.setValue('%keep', 9);

    quest.undo();

    const restored = game.currentQuest!;
    expect(restored).not.toBe(quest);
    expect(restored.vars.getValue('%keep')).toBe(3);
    expect(restored.ordered_boardItems).toEqual(['TileHall', 'TokenLook']);
    expect(restored.heroes.map((h) => h.heroData?.sectionName)).toEqual(['HeroRitaYoung', 'HeroAgathaCrane']);
    expect(restored.heroesSelected).toBe(true);
    expect(restored.log).toBe(quest.log);
    expect(restored.undoStack).toBe(quest.undoStack);
    // The saved event is open again
    expect(restored.eManager.currentEvent!.qEvent.sectionName).toBe('EventStart');
    expect(dialogEvent()).toBe('EventStart');
  });

  it('TestMode_KeepsWhyEachEventStarted', () => {
    // Not in Valkyrie: what the editor's test panel shows, in a test only
    expect(startQuest().eManager.started).toEqual([]);
    const quest = startQuest(EVENTS, true);
    const started = quest.eManager.started;
    // A trigger
    expect(started).toEqual([{ name: 'EventStart', cause: { kind: 'trigger', trigger: 'EventStart' }, round: 1, quest: QUEST + '/quest.ini' }]);
    // A button of an event
    ui.lastDialog!.onButton(0);
    expect(started.at(-1)).toEqual({ name: 'EventSecond', cause: { kind: 'button', event: 'EventStart', button: 1, random: false }, round: 1, quest: QUEST + '/quest.ini' });
    // A token pressed on the board, once no dialog is open, and its button
    ui.lastDialog!.onButton(0);
    Game.get().tokenBoard.tc[0]!.startEvent();
    expect(started.at(-1)).toEqual({ name: 'TokenLook', cause: { kind: 'board' }, round: 1, quest: QUEST + '/quest.ini' });
    ui.lastDialog!.onButton(0);
    expect(started.map((s) => s.name)).toEqual(['EventStart', 'EventSecond', 'TokenLook', 'EventSecond']);
    expect(started.at(-1)!.cause).toEqual({ kind: 'button', event: 'TokenLook', button: 1, random: false });
  });

  it('ToString_WritesTheSaveSections', () => {
    const quest = startQuest();

    const save = quest.toString();

    expect(save.startsWith('[Quest]\r\n')).toBe(true);
    expect(save).toContain('path=' + QUEST + '/quest.ini\r\n');
    expect(save).toContain('heroesSelected=True\r\n');
    expect(save).toContain('[Board]\r\n\\TileHall\r\n\\TokenLook\r\n');
    expect(save).toContain('%keep=3\r\n');
    expect(save).toContain('[EventManager]\r\nqueue=\r\ncurrentevent=EventStart\r\n');
    expect(save).toContain('[Hero1]\r\nid=1\r\nactivated=False\r\ndefeated=False\r\ntype=HeroRitaYoung\r\n');
  });

  it('OutputSymbolReplace_InvalidVarClauseIsLogged', () => {
    const quest = startQuest();

    expect(EventManager.outputSymbolReplace('{var:%keep}{clue}')).toBe('3');
    expect(EventManager.outputSymbolReplace('broken {var:%keep')).toBe('broken {var:%keep');
    expect([...quest.log].map((e) => e.toString(0))).toContain('editor0=Warning: Invalid var clause in text: broken {var:%keep\r\n');
    expect(EventManager.inputSymbolReplace('')).toBe('{MAD06}{MAD09}');
  });
});

/** The quest folder, written, for tests that start it step by step. */
function writeAndPath(): string {
  File.writeAllText(QUEST + '/quest.ini', QUEST_INI);
  File.writeAllText(QUEST + '/Localization.English.txt', TEXT);
  File.writeAllText(QUEST + '/events.ini', EVENTS);
  return QUEST;
}
