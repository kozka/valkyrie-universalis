// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/GameMenu.cs
// The in-quest menu: undo, save, back to the main menu, or to the editor in a test. The app draws it (game.ui.gameMenu)
// and takes the save's picture.
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { GameStateManager } from '../GameStateManager.ts';
import { SaveManager } from '../SaveManager.ts';

// In quest game menu
// Valkyrie: GameMenu.cs GameMenu
export const GameMenu = {
  // Open the menu
  // Valkyrie: GameMenu.cs GameMenu.Create
  create(): void {
    const game = Game.get();
    if (game.ui.findTag(Game.DIALOG)) {
      return;
    }

    if (game.ui.findTag(Game.ACTIVATION)) {
      return;
    }

    // The screenshot for the save is taken when saving
    game.ui.gameMenu();
  },

  // Valkyrie: GameMenu.cs GameMenu.Undo
  undo(): void {
    const game = Game.get();
    Destroyer.dialog();
    game.currentQuest!.undo();
  },

  // Valkyrie: GameMenu.cs GameMenu.Save
  save(): void {
    Destroyer.dialog();
    Game.get().ui.saveSelectScreen(true);
  },

  // Valkyrie: GameMenu.cs GameMenu.Quit
  quit(): void {
    Destroyer.dialog();
    SaveManager.save(0, true);
  },

  // Valkyrie: GameMenu.cs GameMenu.Editor
  editor(): void {
    GameStateManager.Editor.editCurrentQuest();
  },
};
