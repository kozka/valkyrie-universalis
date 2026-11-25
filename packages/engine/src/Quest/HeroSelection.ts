// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/HeroSelection.cs
// The app draws the list of heroes (game.ui.heroSelection) and calls select when one is clicked.
import { HeroData } from '../Content/ContentTypes.ts';
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';

// Hero selection options
// This comes up when selection a hero icon to pick hero
// Valkyrie: HeroSelection.cs HeroSelection
export class HeroSelection {
  // Create page of options
  constructor() {
    this.draw();
  }

  // Valkyrie: HeroSelection.cs HeroSelection.Draw
  draw(): void {
    // Clean up
    Destroyer.dialog();
    Game.get().ui.heroSelection(this);
  }

  // Valkyrie: HeroSelection.cs HeroSelection.Select
  select(name: string): void {
    const game = Game.get();
    let hData: HeroData | null = null;
    for (const hd of game.cd.values(HeroData)) {
      if (hd.sectionName === name) {
        hData = hd;
        break;
      }
    }
    for (const h of game.currentQuest!.heroes) {
      if (hData === h.heroData) {
        return;
      }
    }
    for (const h of game.currentQuest!.heroes) {
      if (h.heroData === null) {
        h.heroData = hData;
        game.heroCanvas.updateImages();
        // The app greys the buttons of the selected hero when it draws again
        game.ui.heroSelection(this);
        return;
      }
    }
  }

  // Valkyrie: HeroSelection.cs HeroSelection.Update
  update(): void {
    Game.get().ui.heroSelection(this);
  }
}
