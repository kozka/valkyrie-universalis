// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/ToolsButton.cs
// The buttons and the window that asks how many heroes are the app's; this keeps the count and starting the test.
import { HeroData } from '../Content/ContentTypes.ts';
import { ContentData } from '../Content/ContentData.ts';
import { QuestData } from '../Content/QuestData.ts';
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { intTryParse } from '../platform/CSharp.ts';
import { Random } from '../platform/Random.ts';
import { InvestigatorItems } from '../Quest/InvestigatorItems.ts';
import { Quest } from '../Quest/Quest.ts';
import { ClassSelectionScreen } from '../UI/Screens/ClassSelectionScreen.ts';
import { ValkyrieConstants } from '../ValkyrieConstants.ts';
import { QuestEditor } from './QuestEditor.ts';

/** Not in Valkyrie: what the app's test changes. */
export interface TestOptions {
  /** The heroes chosen among, by name, once the test's packs are loaded: all of them by default. */
  heroes?: (game: Game) => readonly string[];
  /** The campaign's folder, when the quest tested is one of its adventures: its changes of quest go from there. */
  root?: string;
}

// Valkyrie: ToolsButton.cs ToolsButton
export const ToolsButton = {
  /** The number of heroes the test window starts at: the last one used, within the quest's minimum and maximum. */
  // Valkyrie: ToolsButton.cs ToolsButton.Test
  test(): number {
    const game = Game.get();
    const min = game.currentQuest!.qd.quest.minHero;
    const max = game.currentQuest!.qd.quest.maxHero;

    let val = '';
    const savedData = game.config.data.get('Valkyrie');
    if (savedData !== null && savedData.has('QuestEditorHeroCount')) {
      val = savedData.get('QuestEditorHeroCount')!;
    }

    const parsed = intTryParse(val);
    let heroCount = parsed.ok ? parsed.value : min;

    if (heroCount < min) heroCount = min;
    if (heroCount > max) heroCount = max;
    return heroCount;
  },

  /** Saves the quest and plays it in test mode with that many heroes, chosen at random. */
  // Valkyrie: ToolsButton.cs ToolsButton.StartTest
  startTest(heroCount: number, options: TestOptions = {}): void {
    const game = Game.get();
    Destroyer.dialog();

    game.config.data.add('Valkyrie', 'QuestEditorHeroCount', heroCount.toString());
    game.config.save();

    QuestEditor.save();

    const path = game.currentQuest!.questPath;
    const questPacks = [...game.currentQuest!.qd.quest.packs];
    Destroyer.destroy();

    // All content data has been loaded by editor, cleanup everything
    game.cd = new ContentData(game.gameType.dataDirectory());
    // Load the base content
    game.contentLoader.loadContentID(game.gameType.baseContentPackId());

    // Load current configuration; not in Valkyrie: the packs the app leaves out or adds, as Game.selectQuest
    const packs = game.config.data.get(game.gameType.typeName() + 'Packs');
    if (packs !== null) {
      for (const key of packs.keys()) {
        if (!game.packsLeftOut.includes(key)) game.contentLoader.loadContentID(key);
      }
    }
    for (const key of game.packsAdded) game.contentLoader.loadContentID(key);
    // Not in Valkyrie: and those the scenario asks for, which a game of it has, or a tile or monster of a pack the
    // player has not chosen stops the test
    for (const key of questPacks) game.contentLoader.loadContentID(key);

    game.testMode = true;
    // Fetch all of the quest data and initialise the quest
    game.currentQuest = new Quest(new QuestData.Quest(path));
    // Not in Valkyrie, whose test of a campaign's adventure looks for its changes of quest in the adventure's own folder:
    // they go from the campaign's, as when it is played
    if (options.root !== undefined) game.currentQuest.originalPath = options.root;
    game.heroCanvas.setupUI();

    // Not in Valkyrie: the heroes the app lets choose (DooM's marines), or all of them
    const hOptions = options.heroes === undefined ? [...game.cd.values(HeroData)] : options.heroes(game).map((hero) => game.cd.get(HeroData, hero));
    for (let i = 0; i < heroCount; i++) {
      const hero = game.currentQuest.heroes[i]!;
      hero.heroData = hOptions[Random.range(0, hOptions.length)]!;
      game.currentQuest.vars.setValue('#' + hero.heroData.sectionName, 1);
      hOptions.splice(hOptions.indexOf(hero.heroData), 1);
    }

    // Starting morale is number of heros
    game.currentQuest.vars.setValue('$%morale', heroCount);
    // Set quest flag based on hero count
    game.currentQuest.vars.setValue('#heroes', heroCount);
    game.currentQuest.heroesSelected = true;

    // Clear off heros if not required
    if (!game.gameType.displayHeroes()) {
      game.heroCanvas.clean();
    } else {
      game.heroCanvas.updateImages();
      game.heroCanvas.updateStatus();
    }

    // Draw morale if required
    // Valkyrie: game.gameType is D2EGameType
    if (game.gameType.typeName() === ValkyrieConstants.typeDescent) {
      new ClassSelectionScreen();
    } else {
      new InvestigatorItems();
    }
  },
};
