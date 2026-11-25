// Not in Valkyrie, whose Validate does nothing: the problems the editor mends at a press, where the mend is certain
// and leaves what Valkyrie reads: a picture's path written with \, which only Windows finds; a pack whose content the
// scenario uses without asking for it; a main quest that is hidden. What only the author can decide has none.
import { QuestData } from '../Content/QuestData.ts';
import { Game } from '../Game.ts';
import type { Problem } from './checks/Problem.ts';
import { EditorComponentQuest } from './EditorComponentQuest.ts';

export interface ProblemFix {
  /** What it does: slashes for \, add-pack (params: the pack), unhide. */
  kind: 'slashes' | 'add-pack' | 'unhide';
  params: string[];
  apply: () => void;
}

/** A picture's path with / for \. */
function slashed(path: string): string {
  return path.replace(/\\/g, '/');
}

export const ProblemFixes = {
  /** How a problem is mended, or null when it cannot be at a press (or already is). */
  fixOf(problem: Problem): ProblemFix | null {
    const game = Game.get();
    const quest = game.currentQuest!.qd;
    const component = quest.components.get(problem.where);
    switch (problem.code) {
      case 'custom-image-backslash':
      case 'custom-image-backslash-tile': {
        // Tiles and tokens keep customImage as written (QuestData.cs), and a custom monster its imageplace
        if ((component instanceof QuestData.Tile || component instanceof QuestData.Token) && component.customImage.includes('\\')) {
          return { kind: 'slashes', params: [], apply: () => (component.customImage = slashed(component.customImage)) };
        }
        if (component instanceof QuestData.CustomMonster && problem.key === 'imageplace' && component.imagePlace.includes('\\')) {
          return { kind: 'slashes', params: [], apply: () => (component.imagePlace = slashed(component.imagePlace)) };
        }
        return null;
      }
      // Content of a pack the scenario does not ask for: a player without it misses it; one it tests for (#pack) is
      // left out on purpose
      case 'pack-undeclared':
      case 'pack-undeclared-content': {
        const pack = String(problem.params?.['pack'] ?? '');
        if (pack === '' || quest.quest.packs.includes(pack) || !game.cd.allPacks.some((p) => p.id === pack)) return null;
        return { kind: 'add-pack', params: [pack], apply: () => EditorComponentQuest.selectQuestAddPack(pack) };
      }
      case 'hidden':
        if (!quest.quest.hidden) return null;
        return { kind: 'unhide', params: [], apply: () => EditorComponentQuest.toggleHidden() };
      default:
        return null;
    }
  },
};
