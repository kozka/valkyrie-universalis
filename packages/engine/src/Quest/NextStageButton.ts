// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/NextStageButton.cs
// The app draws the button bar (game.ui.nextStageButton) with the phase it had when Update ran; its buttons call
// items(), set(), log() and next().
import { StringKey } from '../Content/StringKey.ts';
import { Game } from '../Game.ts';
import { InventoryWindowMoM } from './InventoryWindowMoM.ts';
import { LogWindow } from './LogWindow.ts';
import { Quest } from './Quest.ts';
import { SetWindow } from './SetWindow.ts';

// Next stage button is used by MoM to move between investigators and monsters
// Valkyrie: NextStageButton.cs NextStageButton
export class NextStageButton {
  // Construct and display
  constructor() {
    if (Game.get().gameType.displayHeroes()) return;

    this.update();
  }

  // Valkyrie: NextStageButton.cs NextStageButton.Update
  update(): void {
    // do not display the button bar when we reach the end of the game screen
    if (Game.get().currentQuest!.questHasEnded) return;

    // First tile has not been displayed, button bar is not required yet
    if (!Game.get().currentQuest!.firstTileDisplayed) return;

    // do not display the button bar when we are in the editor
    if (Game.get().editMode) return;

    // Clean up everything marked as 'uiphase'
    Game.get().ui.destroyTag(Game.UIPHASE);

    this.phase = Game.get().currentQuest!.phase;
    Game.get().ui.nextStageButton(this);
  }

  /** Not in Valkyrie: the phase the bar shows, as it was when Update drew it. */
  phase: Quest.MoMPhase = Quest.MoMPhase.investigator;

  // Button pressed
  // Valkyrie: NextStageButton.cs NextStageButton.Next
  next(): void {
    if (Game.get().ui.findTag(Game.DIALOG)) {
      return;
    }

    const game = Game.get();

    if (game.currentQuest!.uiItemsPresent()) return;

    // Add to undo stack
    game.currentQuest!.save();

    if (game.currentQuest!.phase === Quest.MoMPhase.monsters) {
      game.audioControl.playTrait('horror');
      game.currentQuest!.phase = Quest.MoMPhase.horror;
      return;
    }

    if (game.currentQuest!.phase === Quest.MoMPhase.horror) {
      game.roundControl.endRound();
    } else {
      game.currentQuest!.log.add(new Quest.LogEntry(new StringKey('val', 'PHASE_MYTHOS').translate()));
      game.roundControl.heroActivated();
    }
  }

  // Valkyrie: NextStageButton.cs NextStageButton.Items
  items(): void {
    if (Game.get().ui.findTag(Game.DIALOG)) {
      return;
    }
    new InventoryWindowMoM();
  }

  // Valkyrie: NextStageButton.cs NextStageButton.Log
  log(): void {
    // log window should always be available, do not test for Dialog existence

    new LogWindow();
  }

  // Valkyrie: NextStageButton.cs NextStageButton.Set
  set(): void {
    if (Game.get().ui.findTag(Game.SETWINDOW)) {
      return;
    }
    new SetWindow();
  }
}
