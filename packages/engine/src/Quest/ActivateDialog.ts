// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/ActivateDialog.cs
// A monster's activation in Descent (Mansions' is ActivateDialogMoM). The app draws it (game.ui.activateDialog), tagged
// 'activation' as Valkyrie's is; its finished button calls activated().
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import type { Quest } from './Quest.ts';

// Window with Monster activation
// Valkyrie: ActivateDialog.cs ActivateDialog
export class ActivateDialog {
  // The monster that raises this dialog
  monster: Quest.Monster;
  master: boolean;
  /** Not in Valkyrie: whether the window shows the only step of the activation (CreateWindow's singleStep). */
  singleStep = false;

  // Create an activation window, if master is false then it is for minions
  constructor(m: Quest.Monster, masterIn: boolean, singleStep = false) {
    this.monster = m;
    this.master = masterIn;
    this.createWindow(singleStep);
  }

  // Valkyrie: ActivateDialog.cs ActivateDialog.CreateWindow
  createWindow(singleStep = false): void {
    // If a dialog window is open we force it closed (this shouldn't happen)
    Destroyer.dialog();
    this.singleStep = singleStep;
    Game.get().ui.activateDialog(this);
  }

  // Valkyrie: ActivateDialog.cs ActivateDialog.activated
  activated(): void {
    // Disable if there is a menu open
    if (Game.get().ui.findTag(Game.DIALOG)) return;

    Game.get().ui.destroyTag(Game.ACTIVATION);
    Game.get().roundControl.monsterActivated();
  }
}
