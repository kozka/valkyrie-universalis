// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/GameStateManager.cs
import { ContentLoader } from './Content/ContentLoader.ts';
import { QuestData } from './Content/QuestData.ts';
import { Destroyer } from './Destroyer.ts';
import { Game } from './Game.ts';
import { NewLine } from './platform/CSharp.ts';
import { QuestEditor } from './QuestEditor/QuestEditor.ts';
import { ValkyrieDebug } from './ValkyrieTools/ValkyrieDebug.ts';

// Valkyrie: GameStateManager.cs GameStateManager.Quest
const QuestState = {
  // This takes us to the quest select screen
  // Valkyrie: GameStateManager.cs GameStateManager.Quest.List
  list(): void {
    // Destroy everything
    Destroyer.destroy();
    const game = Game.get();
    game.selectQuest();
  },

  // Starts the provided quest
  // Valkyrie: GameStateManager.cs GameStateManager.Quest.Start
  start(quest: QuestData.Quest): void {
    ValkyrieDebug.log('INFO: Moving to hero selection screen');
    Destroyer.destroy();
    Game.get().startQuest(quest);
  },

  // Restarts the current quest
  // Valkyrie: GameStateManager.cs GameStateManager.Quest.Restart
  restart(): void {
    const game = Game.get();
    const currentQuest = getCurrentQuest(game);
    if (currentQuest === null) {
      // Failsafe. Go to quest selection if there's no valid quest loaded
      QuestState.list();
      return;
    }

    // Go back to quest details
    Destroyer.destroy();
    game.ui.questDetailsScreen(currentQuest);
  },

  // Restarts the current quest from Hero Selection
  // Valkyrie: GameStateManager.cs GameStateManager.Quest.RestartFromHeroSelection
  restartFromHeroSelection(): void {
    const game = Game.get();

    const currentQuest = getCurrentQuest(game);
    if (currentQuest === null) {
      // Failsafe. Go to quest selection if there's no valid quest loaded
      QuestState.list();
      return;
    }

    QuestState.start(currentQuest);
  },
};

// Valkyrie: GameStateManager.cs GameStateManager.Editor
const EditorState = {
  // Valkyrie: GameStateManager.cs GameStateManager.Editor.EditQuest
  editQuest(path: string): void {
    ValkyrieDebug.log('Starting Editor' + NewLine);

    Destroyer.destroy();

    Game.get().audioControl.stopMusic();
    QuestEditor.begin(path);
  },

  // Valkyrie: GameStateManager.cs GameStateManager.Editor.EditCurrentQuest
  editCurrentQuest(): void {
    const game = Game.get();
    const currentQuestPath = game.currentQuest?.originalPath ?? null;
    if (currentQuestPath === null) {
      // Failsafe. Go to main menu if there's no valid quest loaded
      GameStateManager.mainMenu();
      return;
    }

    ValkyrieDebug.log('Starting Editor' + NewLine);

    Destroyer.destroy();

    game.audioControl.stopMusic();
    QuestEditor.begin(currentQuestPath);
  },
};

// Valkyrie: GameStateManager.cs GameStateManager.GetCurrentQuest
function getCurrentQuest(game: Game): QuestData.Quest | null {
  const questPath = game.currentQuest?.originalPath ?? null;
  if (questPath === null) {
    return null;
  }

  return new QuestData.Quest(questPath);
}

// Valkyrie: GameStateManager.cs GameStateManager
export const GameStateManager = {
  Quest: QuestState,
  Editor: EditorState,

  // This function takes us back to the main menu
  // Valkyrie: GameStateManager.cs GameStateManager.MainMenu
  mainMenu(): void {
    // Destroy everything
    Destroyer.destroy();

    const game = Game.get();
    // All content data has been loaded by editor, cleanup everything
    ContentLoader.getContentData(game);

    const baseContentPackId = game.gameType.baseContentPackId();

    // Load the base content - pack will be loaded later if required
    game.contentLoader.loadContentID(baseContentPackId);

    game.ui.mainMenuScreen();
  },
};
