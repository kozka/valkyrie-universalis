// The editor with Descent and DooM: a test of a Descent scenario, whose heroes take their classes next and whose class
// selection's Back goes back to the editor, as Valkyrie's does (ToolsButton.StartTest, ClassSelectionScreen.
// BackButtonAction); and, not in Valkyrie, a test that keeps the events of each quest a campaign goes through, a test
// of one of a campaign's adventures, whose changes of quest go from the campaign's folder, the heroes a test chooses
// among (DooM's marines), and the check of a spawn whose group joins another (EventManager.TriggerEvent). With the
// community pack DooM from referencias/descargas.
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  Application,
  ClassSelectionScreen,
  Directory,
  File,
  Game,
  HeadlessUI,
  HeroData,
  QuestEditSelection,
  QuestEditor,
  Random,
  RoundController,
  ToolsButton,
  ValkyrieDebug,
  checkQuest,
  readQuestForChecks,
} from '@universalis/engine';
import { createEnvironment, type Environment } from '../tools/battery/environment.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOOM = join(root, 'referencias/descargas/D2E/packs/DooM.valkyrieContentPack');
const EDITOR = '/AppData/Valkyrie/D2E/Editor';
const CAMPAIGN = EDITOR + '/Camp';
const NL = '\r\n';

const lines = (...l: string[]) => l.join(NL) + NL;

/** A campaign of two adventures: its own start goes to the first, whose button goes to the second. */
function writeCampaign(): void {
  if (Directory.exists(CAMPAIGN)) Directory.delete(CAMPAIGN, true);
  const quest = (hidden: boolean) =>
    lines('[Quest]', 'format=21', ...(hidden ? ['hidden=True'] : []), 'type=D2E', 'defaultlanguage=English', 'minhero=1', '', '[QuestText]', 'Localization.English.txt', '', '[QuestData]', 'events.ini');
  File.writeAllText(CAMPAIGN + '/quest.ini', quest(false));
  File.writeAllText(CAMPAIGN + '/Localization.English.txt', lines('.,English', 'quest.name,Camp'));
  File.writeAllText(CAMPAIGN + '/events.ini', lines('[EventStart]', 'trigger=EventStart', 'display=false', 'buttons=1', 'event1=First/quest.ini'));
  File.writeAllText(CAMPAIGN + '/First/quest.ini', quest(true));
  File.writeAllText(CAMPAIGN + '/First/Localization.English.txt', lines('.,English', 'EventStart.text,First', 'EventStart.button1,On'));
  File.writeAllText(CAMPAIGN + '/First/events.ini', lines('[EventStart]', 'trigger=EventStart', 'buttons=1', 'event1=Second/quest.ini'));
  File.writeAllText(CAMPAIGN + '/Second/quest.ini', quest(true));
  File.writeAllText(CAMPAIGN + '/Second/Localization.English.txt', lines('.,English', 'EventStart.text,Second', 'EventStart.button1,End'));
  File.writeAllText(CAMPAIGN + '/Second/events.ini', lines('[EventStart]', 'trigger=EventStart', 'buttons=1', 'event1=EventEnd', '', '[EventEnd]', 'display=false', 'buttons=1'));
}

let env: Environment;
let ui: HeadlessUI;
let stopLog: () => void;

describe.skipIf(!existsSync(DOOM))('QuestEditorDescentTests', () => {
  beforeAll(() => {
    env = createEnvironment('D2E', join(root, 'packages', 'engine', 'data'), [DOOM]);
  }, 120_000);

  beforeEach(() => {
    ui = new HeadlessUI();
    env.game.ui = ui;
    env.game.roundControl = new RoundController();
    env.game.moraleDisplay = null;
    Application.fatalErrors.length = 0;
    Random.initState(1);
    stopLog = ValkyrieDebug.onLog(() => {});
    writeCampaign();
  });

  afterEach(() => {
    stopLog();
  });

  it('StartTest_TheClassesComeNextAndTheirBackGoesToTheEditor', () => {
    QuestEditor.begin(CAMPAIGN);
    expect(ui.editorScreens).toBe(1);
    ToolsButton.startTest(2);
    const game = Game.get();
    expect(game.testMode).toBe(true);
    // Descent's heroes take their classes next (ToolsButton.StartTest: new ClassSelectionScreen)
    expect(ui.lastClassSelection).not.toBeNull();
    // whose Back, in a test, goes back to the editor (ClassSelectionScreen.BackButtonAction)
    ClassSelectionScreen.backButtonAction()();
    expect(game.editMode).toBe(true);
    expect(game.testMode).toBe(false);
    expect(ui.editorScreens).toBe(2);
    expect(game.currentQuest!.originalPath).toBe(CAMPAIGN);
  });

  /** The test's one hero takes its first class, and the classes are done: the quest starts. */
  function chooseClass(): void {
    const screen = ui.lastClassSelection!;
    screen.select(0, screen.classOptions(0).options[0]!.className);
    screen.finished();
  }

  it('StartTest_KeepsTheEventsOfEachQuestACampaignGoesThrough', () => {
    // Not in Valkyrie: Quest.ChangeQuest makes a new EventManager, and the test's panel would forget what came before
    QuestEditor.begin(CAMPAIGN);
    ToolsButton.startTest(1);
    chooseClass();
    const game = Game.get();
    // The campaign's start changed quest to its first adventure, whose start waits for its button
    expect(game.currentQuest!.qd.questPath).toBe(CAMPAIGN + '/First/quest.ini');
    ui.lastDialog!.onButton(0);
    expect(game.currentQuest!.qd.questPath).toBe(CAMPAIGN + '/Second/quest.ini');
    const started = game.currentQuest!.eManager.started.map((s) => [s.name, s.quest, s.cause.kind]);
    expect(started).toEqual([
      ['EventStart', CAMPAIGN + '/quest.ini', 'trigger'],
      ['First/quest.ini', CAMPAIGN + '/quest.ini', 'button'],
      ['EventStart', CAMPAIGN + '/First/quest.ini', 'trigger'],
      ['Second/quest.ini', CAMPAIGN + '/First/quest.ini', 'button'],
      ['EventStart', CAMPAIGN + '/Second/quest.ini', 'trigger'],
    ]);
  });

  it('StartTest_AnAdventureChangesQuestFromItsCampaignsFolder', () => {
    // Not in Valkyrie, whose test of an adventure looks for its changes of quest in the adventure's own folder, and misses them
    QuestEditor.begin(CAMPAIGN + '/First');
    ToolsButton.startTest(1, { root: CAMPAIGN });
    const game = Game.get();
    expect(game.currentQuest!.qd.questPath).toBe(CAMPAIGN + '/First/quest.ini');
    expect(game.currentQuest!.originalPath).toBe(CAMPAIGN);
    chooseClass();
    ui.lastDialog!.onButton(0);
    expect(game.currentQuest!.qd.questPath).toBe(CAMPAIGN + '/Second/quest.ini');
    expect(Application.fatalErrors).toEqual([]);
    // Back to the editor goes to the campaign (GameStateManager.Editor.EditCurrentQuest), and the app opens the adventure
    ClassSelectionScreen.backButtonAction()();
    expect(game.currentQuest!.originalPath).toBe(CAMPAIGN);
  });

  it('StartTest_ChoosesTheHeroesAmongThoseItIsGiven', () => {
    // Not in Valkyrie: the app's DooM, which always loads its pack, gives its marines only, as its hero selection does
    QuestEditor.begin(CAMPAIGN);
    const game = Game.get();
    game.packsAdded = ['DooM'];
    try {
      const marines = (g: Game) => g.cd.keys(HeroData).filter((hero) => g.cd.get(HeroData, hero).sets.includes('DooM'));
      ToolsButton.startTest(4, { heroes: marines });
    } finally {
      game.packsAdded = [];
    }
    const chosen = game.currentQuest!.heroes.map((h) => h.heroData?.sectionName).sort();
    expect(chosen).toEqual(['HeroAlpha', 'HeroBravo', 'HeroCharlie', 'HeroDelta']);
  });

  it('NewAdventure_MakesAHiddenQuestInTheCampaignsFolder', () => {
    // Not in Valkyrie: QuestEditSelection.NewQuest in a campaign's folder, for a new adventure of it
    expect(QuestEditSelection.newQuestError('First', CAMPAIGN)!.key).toBe('NEW_QUEST_FOLDER_EXISTS');
    expect(QuestEditSelection.newQuestError('First')).toBeNull();
    const made = new QuestEditSelection().tryCreateQuest('Third', 'The third', CAMPAIGN);
    expect(made).toBe(CAMPAIGN + '/Third');
    expect(File.readAllText(CAMPAIGN + '/Third/quest.ini')).toBe(lines('[Quest]', 'type=D2E', 'format=21', 'hidden=True', 'defaultlanguage=English', '', '[QuestText]', 'Localization.English.txt'));
    expect(File.readAllText(CAMPAIGN + '/Third/Localization.English.txt')).toBe(['.,English', 'quest.name,The third', 'quest.description,The third...'].join(NL));
    // Valkyrie's editor lists it with the scenarios, as it lists every quest below its folder (QuestLoader.GetUserUnpackedQuests)
    expect([...new QuestEditSelection().questList.keys()].filter((key) => key.startsWith(CAMPAIGN)).sort()).toEqual([CAMPAIGN, CAMPAIGN + '/First', CAMPAIGN + '/Second', CAMPAIGN + '/Third']);
  });

  it('Checks_ADefeatedTriggerOfASpawnWhoseGroupJoinsAnother', () => {
    // EventManager.TriggerEvent: in Descent a spawn of a monster already on the board joins its group, which keeps the
    // first spawn's name, so Defeated<second spawn> does not run while the first group is there
    const folder = EDITOR + '/Groups';
    const files = new Map([
      ['quest.ini', lines('[Quest]', 'format=21', 'type=D2E', 'defaultlanguage=English', '', '[QuestText]', 'Localization.English.txt', '', '[QuestData]', 'events.ini')],
      ['Localization.English.txt', lines('.,English', 'quest.name,Groups')],
      [
        'events.ini',
        lines(
          '[EventStart]', 'trigger=EventStart', 'display=false', 'buttons=1', 'event1=SpawnA', '',
          '[SpawnA]', 'monster=MonsterGoblinArcher', 'buttons=1', 'event1=SpawnB', '',
          '[SpawnB]', 'monster=MonsterGoblinArcher', 'unique=true', 'buttons=1', 'event1=SpawnC', '',
          '[SpawnC]', 'monster=MonsterZombie', 'buttons=1', '',
          // The first group's own trigger runs: the later spawn joins it
          '[EventA]', 'trigger=DefeatedSpawnA', 'buttons=1', '',
          '[EventB]', 'trigger=DefeatedUniqueSpawnB', 'buttons=1', '',
          '[EventC]', 'trigger=DefeatedSpawnC', 'buttons=1',
        ),
      ],
    ]);
    for (const [name, text] of files) File.writeAllText(folder + '/' + name, text);
    const problems = checkQuest({ game: Game.get(), ...readQuestForChecks(folder + '/quest.ini') }).filter((p) => p.code === 'trigger-defeated-joined');
    expect(problems).toEqual([{ level: 'hint', code: 'trigger-defeated-joined', where: 'EventB', key: 'trigger', params: { trigger: 'DefeatedUniqueSpawnB', spawn: 'SpawnA', monster: 'MonsterGoblinArcher' } }]);
  });
});
