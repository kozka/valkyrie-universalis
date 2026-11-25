// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/MonsterCanvas.cs
// The list of monsters on the right of the screen: its scroll position and what a click on a monster opens. The app
// draws the icons (game.ui.monsterCanvasUpdateList and UpdateStatus).
import { ContentData } from '../Content/ContentData.ts';
import { Game } from '../Game.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { MonsterDialog } from './MonsterDialog.ts';
import { MonsterDialogMoM } from './MonsterDialogMoM.ts';
import type { Quest } from './Quest.ts';

// This class controls the list of monsters
// Valkyrie: MonsterCanvas.cs MonsterCanvas
export class MonsterCanvas {
  // offset stores the scoll position, reset at creation
  offset = 0;
  // This is assumed in a few places, can't just be changed
  static monsterSize = 4;

  // Call to update list of monsters
  // Valkyrie: MonsterCanvas.cs MonsterCanvas.UpdateList
  updateList(): void {
    // Clean up everything marked as 'monsters'
    const game = Game.get();
    game.ui.destroyTag(Game.MONSTERS);

    // Create icons (not drawn): MonsterIcon reads the size of each monster's picture
    // Not in Valkyrie (16 October 2026): a missing one threw (NullReferenceException); it is logged and the app draws a placeholder
    for (const m of game.currentQuest!.monsters) {
      if (ContentData.fileToTexture(m.monsterData.image) === null) ValkyrieDebug.log('Warning: Missing monster picture: ' + m.monsterData.image);
    }

    if (game.currentQuest!.monsters.length - this.offset < 5) {
      this.offset = game.currentQuest!.monsters.length - 5;
      if (this.offset < 0) {
        this.offset = 0;
      }
    }

    // The icons and the scroll buttons are drawn by the app
    game.ui.monsterCanvasUpdateList();
  }

  // Called by scroll up/down
  // Valkyrie: MonsterCanvas.cs MonsterCanvas.Move
  static move(index = 1): void {
    const game = Game.get();
    // Update offset and redraw
    game.monsterCanvas.offset += index;
    game.monsterCanvas.updateList();
  }

  // Valkyrie: MonsterCanvas.cs MonsterCanvas.UpdateStatus
  updateStatus(): void {
    Game.get().ui.monsterCanvasUpdateStatus();
  }

  // Function when monster icon pressed
  // Valkyrie: MonsterCanvas.cs MonsterIcon.MonsterDiag
  static monsterDiag(m: Quest.Monster): void {
    // If there are any other dialogs open just finish
    if (Game.get().ui.findTag(Game.DIALOG)) return;

    const game = Game.get();
    if (game.gameType.typeName() === 'MoM') {
      new MonsterDialogMoM(m);
    } else {
      new MonsterDialog(m);
    }
  }
}
