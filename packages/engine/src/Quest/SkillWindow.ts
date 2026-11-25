// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/SkillWindow.cs
// Descent's skills window: which skills each hero is offered, by its class, its hybrid class and its experience, and
// choosing them; the app draws it (game.ui.skillWindow).
import { ContentData } from '../Content/ContentData.ts';
import { SkillData } from '../Content/ContentTypes.ts';
import type { StringKey } from '../Content/StringKey.ts';
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import type { Quest } from './Quest.ts';

/** A skill the window shows for its hero. */
export interface SkillOption {
  skill: string;
  name: StringKey;
  xp: number;
  /** In the row of the hero's hybrid class, rather than the row of its cost. */
  hybrid: boolean;
  /** As Valkyrie colours its button: green if the hero has it, white if its experience pays for it, grey otherwise. */
  state: 'picked' | 'affordable' | 'locked';
}

// Next stage button is used by MoM to move between investigators and monsters
// Valkyrie: SkillWindow.cs SkillWindow
export class SkillWindow {
  /** The hero whose skills are shown. */
  hero = 0;

  // Construct and display
  constructor() {
    this.update();
  }

  // Valkyrie: SkillWindow.cs SkillWindow.Update
  update(hero = 0): void {
    Destroyer.dialog();
    this.hero = hero;
    // Each hero's picture is read for its size: a missing one throws, as the NullReferenceException in C#
    for (const { hero: h } of this.heroes()) {
      if (ContentData.fileToTexture(h.heroData!.image) === null) throw new TypeError("Cannot read properties of null (reading 'width')");
    }
    Game.get().ui.skillWindow(this);
  }

  /** Not in Valkyrie: the heroes the window shows, as many from the first as are chosen, with the experience they have left. */
  heroes(): { hero: Quest.Hero; availableXP: number }[] {
    const heroes = Game.get().currentQuest!.heroes;
    // Count number of selected heroes
    let heroCount = 0;
    for (const h of heroes) {
      if (h.heroData !== null) heroCount++;
    }
    return heroes.slice(0, heroCount).map((hero) => ({ hero, availableXP: hero.availableXP() }));
  }

  /** Not in Valkyrie: the skills the window shows for its hero, in the order of the content, as Update lays them out. */
  skills(): SkillOption[] {
    const game = Game.get();
    const hero = game.currentQuest!.heroes[this.hero]!;
    const hybridClass = hero.hybridClass;
    const availableXP = hero.availableXP();
    const options: SkillOption[] = [];
    for (const s of game.cd.values(SkillData)) {
      if (s.xp === 0) continue;
      if (hero.className.length === 0) continue;

      let state: SkillOption['state'] = 'locked';
      if (hero.skills.includes(s.sectionName)) {
        state = 'picked';
      } else if (s.xp <= availableXP) {
        state = 'affordable';
      }

      if (s.sectionName.indexOf('Skill' + hero.className.substring('Class'.length)) === 0) {
        if (hybridClass.length > 0 && s.xp === 3) continue;
        options.push({ skill: s.sectionName, name: s.name, xp: s.xp, hybrid: false, state });
        continue;
      }

      if (hybridClass.length === 0) continue;
      if (s.sectionName.indexOf('Skill' + hybridClass.substring('Class'.length)) !== 0) continue;
      options.push({ skill: s.sectionName, name: s.name, xp: s.xp, hybrid: true, state });
    }
    return options;
  }

  // Valkyrie: SkillWindow.cs SkillWindow.SelectSkill
  selectSkill(hero: number, skill: string): void {
    const game = Game.get();
    const skills = game.currentQuest!.heroes[hero]!.skills;

    if (skills.includes(skill)) {
      skills.splice(skills.indexOf(skill), 1);
    } else {
      if (game.currentQuest!.heroes[hero]!.availableXP() < game.cd.get(SkillData, skill).xp) return;
      skills.push(skill);
    }
    this.update(hero);
  }
}
