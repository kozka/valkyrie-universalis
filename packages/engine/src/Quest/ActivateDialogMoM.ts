// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/ActivateDialogMoM.cs
// A monster's activation in Mansions: its ability, then its attack or its move. The app draws each step
// (game.ui.activateDialogMoM, with step 'ability', 'attack' or 'move').
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { replace } from '../platform/CSharp.ts';
import { ActivateDialog } from './ActivateDialog.ts';
import { LogEntry } from './LogEntry.ts';
import { MonsterDialogMoM } from './MonsterDialogMoM.ts';
import type { Quest } from './Quest.ts';

export type ActivationStep = 'ability' | 'attack' | 'move';

// Window with Monster activation
// Valkyrie: ActivateDialogMoM.cs ActivateDialogMoM
export class ActivateDialogMoM extends ActivateDialog {
  // Create an activation window, if master is false then it is for minions
  constructor(m: Quest.Monster) {
    super(m, true);
  }

  /** Not in Valkyrie: which of the windows below is showing (set by CreateWindow, CreateAttackWindow and CreateMoveWindow). */
  declare step: ActivationStep;

  // Valkyrie: ActivateDialogMoM.cs ActivateDialogMoM.CreateWindow
  override createWindow(): void {
    // If a dialog window is open we force it closed (this shouldn't happen)
    Game.get().ui.destroyTag(Game.DIALOG);

    if (this.monster.currentActivation!.effect.length > 0) {
      // ability text
      const textKey = replace(this.monster.currentActivation!.effect, '\\n', '\n');
      // Add this to the log
      Game.get().currentQuest!.log.add(new LogEntry(replace(textKey, '\n', '\\n')));
    }

    // The name, the ability, and the attack and move buttons
    this.step = 'ability';
    Game.get().ui.activateDialogMoM(this);

    MonsterDialogMoM.drawMonster(this.monster, true);
  }

  // Valkyrie: ActivateDialogMoM.cs ActivateDialogMoM.CreateAttackWindow
  createAttackWindow(): void {
    Destroyer.dialog();

    this.step = 'attack';
    Game.get().ui.activateDialogMoM(this);

    // Add this to the log
    Game.get().currentQuest!.log.add(new LogEntry(replace(this.monster.currentActivation!.masterActions, '\n', '\\n')));

    MonsterDialogMoM.drawMonster(this.monster, true);
  }

  // Valkyrie: ActivateDialogMoM.cs ActivateDialogMoM.CreateMoveWindow
  createMoveWindow(): void {
    if (this.monster.currentActivation!.ad.move.fullKey.length === 0) {
      this.activated();
      return;
    }

    Destroyer.dialog();
    this.step = 'move';
    Game.get().ui.activateDialogMoM(this);

    // Add this to the log
    Game.get().currentQuest!.log.add(new LogEntry(replace(this.monster.currentActivation!.move!, '\n', '\\n')));

    MonsterDialogMoM.drawMonster(this.monster);
  }

  // Valkyrie: ActivateDialogMoM.cs ActivateDialogMoM.activated
  override activated(): void {
    Destroyer.dialog();
    Game.get().roundControl.monsterActivated();
  }
}
