// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/MoraleDisplay.cs
// The number to show is worked out here; the app draws it.
import { Game } from '../Game.ts';
import { Mathf } from '../platform/Mathf.ts';

// Used to display remaining morale
// Valkyrie: MoraleDisplay.cs MoraleDisplay
export class MoraleDisplay {
  morale = 0;

  // Construct and display
  constructor() {
    this.update();
  }

  // Update must be called if the morale is changed
  // Valkyrie: MoraleDisplay.cs MoraleDisplay.Update
  update(): void {
    const game = Game.get();
    let morale = Mathf.roundToInt(game.currentQuest!.vars.getValue('$%morale'));
    if (morale < 0) {
      morale = 0;
    }
    this.morale = morale;
    game.ui.moraleDisplay(this);
  }
}
