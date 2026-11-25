// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/SetWindow.cs
// The rules of the window that sets fire and an eliminated investigator; the app draws it (game.ui.setWindow).
import { Game } from '../Game.ts';

// Next stage button is used by MoM to move between investigators and monsters
// Valkyrie: SetWindow.cs SetWindow
export class SetWindow {
  // Construct and display
  constructor() {
    const game = Game.get();
    game.ui.destroyTag(Game.SETWINDOW);
    game.ui.setWindow(this);
  }

  /** Not in Valkyrie: whether the first button clears the fire ($fire is set) or sets it. */
  fire(): boolean {
    return Game.get().currentQuest!.vars.getValue('$fire') > 0;
  }

  /** Not in Valkyrie: whether an investigator is eliminated (#eliminated), which changes the second button. */
  eliminated(): boolean {
    return Game.get().currentQuest!.vars.getValue('#eliminated') > 0;
  }

  /** Not in Valkyrie: whether the elimination is over (#eliminatedcomplete), which Uneliminate no longer undoes. */
  eliminatedComplete(): boolean {
    return Game.get().currentQuest!.vars.getValue('#eliminatedcomplete') > 0.1;
  }

  // Valkyrie: SetWindow.cs SetWindow.SetFire
  setFire(): void {
    Game.get().currentQuest!.vars.setValue('$fire', 1);
    new SetWindow();
  }

  // Valkyrie: SetWindow.cs SetWindow.ClearFire
  clearFire(): void {
    Game.get().currentQuest!.vars.setValue('$fire', 0);
    new SetWindow();
  }

  // Valkyrie: SetWindow.cs SetWindow.Eliminate
  eliminate(): void {
    Game.get().currentQuest!.vars.setValue('#eliminated', 1);
    new SetWindow();
  }

  // Valkyrie: SetWindow.cs SetWindow.Uneliminate
  uneliminate(): void {
    const game = Game.get();
    if (game.currentQuest!.vars.getValue('#eliminatedcomplete') > 0.1) {
      return;
    }

    game.currentQuest!.vars.setValue('#eliminated', 0);
    game.currentQuest!.vars.setValue('#eliminatedprev', 0);
    new SetWindow();
  }
}
