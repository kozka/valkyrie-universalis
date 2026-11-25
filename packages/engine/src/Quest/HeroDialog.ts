// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/HeroDialog.cs
// Descent's window for a hero in play: end its turn, knock it out or recover it. The rules stay here; the app draws it
// (game.ui.heroDialog) with what CreateWindow decides, and calls activated, defeated, restored and onCancel.
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import type { Quest } from './Quest.ts';

// Class for creation of hero control button menu
// Valkyrie: HeroDialog.cs HeroDialog
export class HeroDialog {
  hero: Quest.Hero;
  /** Whether End turn can be pressed: not for a hero that has acted, nor while a monster activates. */
  canEndTurn = false;

  constructor(h: Quest.Hero) {
    this.hero = h;
    this.createWindow();
  }

  // Valkyrie: HeroDialog.cs HeroDialog.CreateWindow
  createWindow(): void {
    const game = Game.get();
    // Has this hero been activated?
    this.canEndTurn = !(this.hero.activated || game.ui.findTag(Game.ACTIVATION));
    // Is this hero defeated? The app shows Recover or KO from hero.defeated
    game.ui.heroDialog(this);
  }

  // Hero defeated
  // Valkyrie: HeroDialog.cs HeroDialog.defeated
  defeated(): void {
    Destroyer.dialog();
    const game = Game.get();
    // Save to undo stack
    game.currentQuest!.save();
    this.hero.defeated = true;
    this.updateDisplay();
    // This can trigger events, delay events if activation present
    if (game.ui.findTag(Game.ACTIVATION)) {
      game.currentQuest!.adjustMorale(-1, true);
    } else {
      game.currentQuest!.adjustMorale(-1);
    }
  }

  // Hero restored
  // Valkyrie: HeroDialog.cs HeroDialog.restored
  restored(): void {
    Destroyer.dialog();
    const game = Game.get();
    // Save to undo stack
    game.currentQuest!.save();
    this.hero.defeated = false;
    this.updateDisplay();
  }

  // Activated hero
  // Valkyrie: HeroDialog.cs HeroDialog.activated
  activated(): void {
    Destroyer.dialog();
    const game = Game.get();
    // Save state to undo stack
    game.currentQuest!.save();
    this.hero.activated = true;
    // Let the game know that a hero has activated
    game.roundControl.heroActivated();
    // Should this be before the roundControl?
    this.updateDisplay();
  }

  // Cancel cleans up
  // Valkyrie: HeroDialog.cs HeroDialog.onCancel
  onCancel(): void {
    Destroyer.dialog();
  }

  // Valkyrie: HeroDialog.cs HeroDialog.updateDisplay
  updateDisplay(): void {
    Game.get().heroCanvas.updateStatus();
  }
}
