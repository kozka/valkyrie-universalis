// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/ChangePhaseWindow.cs
// The screen shown for a few seconds between Mansions' phases; the app draws it and closes it after transitionDuration.
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import type { Quest } from './Quest.ts';

// Valkyrie: ChangePhaseWindow.cs ChangePhaseWindow
export const ChangePhaseWindow = {
  // Object default configuration
  heroSize: 5,
  offsetSize: 6,
  transitionDuration: 3,

  // Valkyrie: ChangePhaseWindow.cs ChangePhaseWindow.DisplayTransitionWindow
  displayTransitionWindow(phase: Quest.MoMPhase): void {
    // do NOT delete dialog, they are hidden behing the mythos phase
    const game = Game.get();

    // dot NOT display transition screen while we are in Editor mode
    if (game.testMode) return;

    game.ui.displayTransitionWindow(phase);
  },

  // Valkyrie: ChangePhaseWindow.cs ChangePhaseWindow.Close
  close(): void {
    Destroyer.transition();
  },
};
