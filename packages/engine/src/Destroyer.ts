// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Destroyer.cs
// Destroying objects by tag goes to the app (game.ui.destroyTag); the state that Destroy clears stays here.
import { ContentData } from './Content/ContentData.ts';
import { Game } from './Game.ts';
import { CameraController } from './Quest/CameraController.ts';

// This is a helper class because we often need to clean things up.
// Valkyrie: Destroyer.cs Destroyer
export const Destroyer = {
  // Destroy everything.  This still keeps game type, Valkyrie must be restarted to swap games
  // Valkyrie: Destroyer.cs Destroyer.Destroy
  destroy(): void {
    ContentData.textureCache = null;
    // Clean up everything marked as 'dialog'
    Destroyer.dialog();

    const game = Game.get();
    for (const tag of [
      Game.MONSTERS,
      Game.SHOP,
      Game.HEROSELECT,
      Game.BOARD,
      Game.QUESTUI,
      Game.QUESTLIST,
      Game.CONTENTPACKUI,
      Game.CONTENTPACKLIST,
      Game.EDITOR,
      Game.UIPHASE,
      Game.ENDGAME,
    ]) {
      game.ui.destroyTag(tag);
    }

    game.audioControl.stopAudioEffect();

    game.heroCanvas.clean();
    game.cc.maxLimit = false;
    game.cc.minLimit = false;

    // Clear up all data
    game.currentQuest = null;
    game.moraleDisplay = null;
    game.tokenBoard.tc = [];

    game.editMode = false;
    game.testMode = false;
  },

  // Close logs
  // Valkyrie: Destroyer.cs Destroyer.Logs
  logs(): void {
    Game.get().ui.destroyTag(Game.LOGS);
  },

  // Valkyrie: Destroyer.cs Destroyer.Tag
  tag(tag: string): void {
    Game.get().ui.destroyTag(tag);
  },

  // All dialogs that are to be acknoledged/cancled are marked as 'dialog' and are often destroyed
  // Valkyrie: Destroyer.cs Destroyer.Dialog
  dialog(): void {
    // Clean up everything marked as 'dialog'
    Game.get().ui.destroyTag(Game.DIALOG);
    Game.get().ui.destroyTag(Game.DIALOG_PART);

    CameraController.panDisable = false;
    Game.get().logWindow = null;
  },

  // Smaller part of dialogs that should be refreshed on their own
  // Valkyrie: Destroyer.cs Destroyer.DialogParts
  dialogParts(): void {
    Game.get().ui.destroyTag(Game.DIALOG_PART);
  },

  // Valkyrie: Destroyer.cs Destroyer.SetWindow
  setWindow(): void {
    Game.get().ui.destroyTag(Game.SETWINDOW);
    CameraController.panDisable = false;
    Game.get().logWindow = null;
  },

  // Remove transition screen between phases
  // Valkyrie: Destroyer.cs Destroyer.Transition
  transition(): void {
    Game.get().ui.destroyTag(Game.TRANSITION);
  },
};
