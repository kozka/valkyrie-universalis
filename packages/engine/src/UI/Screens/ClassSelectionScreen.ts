// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/UI/Screens/ClassSelectionScreen.cs
// Descent's class choice after hero selection. The rules stay here (which classes each hero may take, picking one,
// finishing, going back); the app draws the screen (game.ui.classSelectionScreen) from classOptions and calls select,
// finished and backButtonAction.
import { ContentData } from '../../Content/ContentData.ts';
import { ClassData } from '../../Content/ContentTypes.ts';
import { Destroyer } from '../../Destroyer.ts';
import { Game } from '../../Game.ts';
import { GameStateManager } from '../../GameStateManager.ts';
import { listGet } from '../../platform/CSharp.ts';
import { MoraleDisplay } from '../../Quest/MoraleDisplay.ts';

/** A class DrawHero lists for a hero: available ones can be picked; picked is the hero's own class. */
export interface ClassOption {
  className: string;
  available: boolean;
  picked: boolean;
}

// Valkyrie: ClassSelectionScreen.cs ClassSelectionScreen
export class ClassSelectionScreen {
  constructor() {
    this.draw();
  }

  // Valkyrie: ClassSelectionScreen.cs ClassSelectionScreen.Draw
  draw(): void {
    // Clean up
    Destroyer.dialog();
    const game = Game.get();
    game.ui.destroyTag(Game.HEROSELECT);

    // Get all heros
    let heroCount = 0;
    // Count number of selected heroes
    for (const h of game.currentQuest!.heroes) {
      if (h.heroData !== null) heroCount++;
    }

    // DrawHero: the class lists, then the hero picture (Sprite.Create throws on a missing one, as in C#)
    for (let i = 0; i < heroCount; i++) {
      this.classOptions(i);
      const heroTex = ContentData.fileToTexture(listGet(game.currentQuest!.heroes, i).heroData!.image);
      if (heroTex === null) throw new TypeError("Cannot read properties of null (reading 'width')");
    }

    game.ui.classSelectionScreen(this);
  }

  // What the back button does: choose the heroes again
  // Valkyrie: ClassSelectionScreen.cs ClassSelectionScreen.BackButtonAction
  static backButtonAction(): () => void {
    const game = Game.get();
    if (game.testMode) {
      return GameStateManager.Editor.editCurrentQuest;
    }
    return GameStateManager.Quest.restartFromHeroSelection;
  }

  /** Not in Valkyrie: the hybrid class a hero holds, if any, and the classes DrawHero lists for it. */
  // Valkyrie: ClassSelectionScreen.cs ClassSelectionScreen.DrawHero
  classOptions(hero: number): { hybridClass: string; options: ClassOption[] } {
    const game = Game.get();
    const heroes = game.currentQuest!.heroes;

    let archetype = listGet(heroes, hero).heroData!.archetype;
    const hybridClass = listGet(heroes, hero).hybridClass;

    if (hybridClass.length > 0) {
      const classData = game.cd.get(ClassData, hybridClass);
      archetype = classData.hybridArchetype;
    }

    const options: ClassOption[] = [];
    for (const cd of game.cd.values(ClassData)) {
      if (cd.archetype !== archetype) continue;
      if (cd.hybridArchetype.length > 0 && hybridClass.length > 0) continue;

      const className = cd.sectionName;
      let available = true;
      let pick = false;

      for (let i = 0; i < heroes.length; i++) {
        if (heroes[i]!.className === className) {
          available = false;
          if (hero === i) {
            pick = true;
          }
        }
        if (heroes[i]!.hybridClass === className) {
          available = false;
        }
      }

      options.push({ className, available, picked: pick });
    }
    return { hybridClass, options };
  }

  // Valkyrie: ClassSelectionScreen.cs ClassSelectionScreen.Select
  select(hero: number, className: string): void {
    const game = Game.get();
    const h = listGet(game.currentQuest!.heroes, hero);
    if (game.cd.get(ClassData, className).hybridArchetype.length > 0) {
      h.className = '';
      if (h.hybridClass.length > 0) {
        h.hybridClass = '';
      } else {
        h.hybridClass = className;
      }
    } else {
      h.className = className;
    }
    this.draw();
  }

  // Valkyrie: ClassSelectionScreen.cs ClassSelectionScreen.Finished
  finished(): void {
    const game = Game.get();
    const quest = game.currentQuest!;

    const items = new Set<string>();
    for (const h of quest.heroes) {
      if (h.heroData === null) continue;
      if (h.className.length === 0) return;

      quest.vars.setValue('#' + h.className, 1);

      for (const s of game.cd.get(ClassData, h.className).items) {
        items.add(s);
      }

      if (h.hybridClass.length === 0) continue;
      for (const s of game.cd.get(ClassData, h.hybridClass).items) {
        items.add(s);
      }
    }
    for (const item of items) quest.items.add(item);

    game.ui.destroyTag(Game.HEROSELECT);
    game.moraleDisplay = new MoraleDisplay();
    game.questStartEvent();
  }
}
