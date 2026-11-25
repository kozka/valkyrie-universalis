// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/HeroCanvas.cs
// The rules stay here (what a click on a hero does, how hero selection ends); the app draws the hero icons when the
// engine calls game.ui.heroCanvas*, and calls heroDiag when one is clicked. The game-type checks read typeName().
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { ValkyrieConstants } from '../ValkyrieConstants.ts';
import { ClassSelectionScreen } from '../UI/Screens/ClassSelectionScreen.ts';
import { HeroDialog } from './HeroDialog.ts';
import type { HeroSelection } from './HeroSelection.ts';
import { InvestigatorItems } from './InvestigatorItems.ts';
import type { Quest } from './Quest.ts';

// This class is for drawing hero images on the screen
// Valkyrie: HeroCanvas.cs HeroCanvas
export class HeroCanvas {
  heroSelection: HeroSelection | null = null;

  // Called when a quest is started, draws to screen
  // Valkyrie: HeroCanvas.cs HeroCanvas.SetupUI
  setupUI(): void {
    Game.get().ui.heroCanvasSetupUI();
  }

  // Called when existing quest, cleans up
  // Valkyrie: HeroCanvas.cs HeroCanvas.Clean
  clean(): void {
    Game.get().ui.heroCanvasClean();
  }

  // Update hero image state
  // Valkyrie: HeroCanvas.cs HeroCanvas.UpdateStatus
  updateStatus(): void {
    Game.get().ui.heroCanvasUpdateStatus();
  }

  // Redraw images
  // Valkyrie: HeroCanvas.cs HeroCanvas.UpdateImages
  updateImages(): void {
    Game.get().ui.heroCanvasUpdateImages();
  }

  // Called when hero pressed
  // Valkyrie: HeroCanvas.cs HeroCanvas.HeroDiag
  heroDiag(id: number): void {
    const game = Game.get();
    const quest = game.currentQuest!;
    let target: Quest.Hero | null = null;

    // Find the pressed hero
    for (const h of quest.heroes) {
      if (h.id === id) {
        target = h;
        break;
      }
    }

    // Game hasn't started, remove any selected hero
    if (!quest.heroesSelected) {
      target!.heroData = null;
      this.updateImages();
      if (this.heroSelection !== null) this.heroSelection.update();
      return;
    }

    // If there are any other dialogs
    if (game.ui.findTag(Game.DIALOG)) {
      // Check if we are in a hero selection dialog
      if (quest.eManager.currentEvent !== null && quest.eManager.currentEvent.qEvent.maxHeroes !== 0) {
        // Invert hero selection
        target!.selected = !target!.selected;
        this.updateStatus();
      }
      // Non hero selection dialog, do nothing
      return;
    }

    // We are in game and a valid hero was selected
    if (quest.heroesSelected && target!.heroData !== null) {
      if (!quest.uiItemsPresent()) {
        new HeroDialog(target!);
      }
    }
  }

  // End hero selection and reorder heroselect
  // FIXME: bad name
  // FIXME: why is this even here?
  // Valkyrie: HeroCanvas.cs HeroCanvas.EndSection
  endSection(): void {
    let heroCount = 0;

    Destroyer.dialog();

    // Count number of selected heroes
    const game = Game.get();
    const quest = game.currentQuest!;
    for (const h of quest.heroes) {
      if (h.heroData !== null) {
        heroCount++;
        // Create variable to value 1 for each selected Hero
        quest.vars.setValue('#' + h.heroData.sectionName, 1);
      }
    }

    // Check for validity
    if (heroCount < quest.qd.quest.minHero) return;

    game.ui.destroyTag(Game.HEROSELECT);
    this.heroSelection = null;

    // Reorder heros so that selected heroes are first
    for (let i = 0; i < quest.heroes.length - 1; i++) {
      let j = i;

      while (quest.heroes[i]!.heroData === null && j < quest.heroes.length) {
        quest.heroes[i]!.heroData = quest.heroes[j]!.heroData;
        quest.heroes[j]!.heroData = null;
        j++;
      }
    }

    // Set quest flag based on hero count
    quest.vars.setValue('#heroes', heroCount);

    quest.heroesSelected = true;

    this.updateImages();
    this.updateStatus();

    // Clear off heros if not required
    if (!game.gameType.displayHeroes()) {
      this.clean();
      new InvestigatorItems();
    } else {
      // Pick class
    }

    // Draw morale if required
    if (game.gameType.typeName() === ValkyrieConstants.typeDescent) {
      new ClassSelectionScreen();
    } else {
      new InvestigatorItems();
    }
  }
}
