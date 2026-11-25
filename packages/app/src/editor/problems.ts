// The checks of a scenario open in the editor: the quest's own and those of its package, its quests together
// (QuestEditor/checks), and where each problem is, as a reader names it (what it says is problemText.ts's). Not ported
// from Valkyrie, whose Validate does nothing.
import { Directory, Game, SearchOption, checkPackage, checkQuest, readQuestForChecks, type Problem } from '@universalis/engine';
import { languageName } from '../ui/languages.ts';
import { edi } from './text.ts';

export interface ScenarioCheck {
  problems: Problem[];
  /** Why Valkyrie cannot load the quest, when it cannot. */
  error: string | null;
}

/** The problems of the quest in this folder and of the quests below it. */
export function checkScenario(folder: string): ScenarioCheck {
  const game = Game.get();
  const main = readQuestForChecks(folder + '/quest.ini');
  const problems = checkQuest({ game, ...main });
  const quests = Directory.getFiles(folder, 'quest.ini', SearchOption.AllDirectories).sort((a, b) => a.length - b.length);
  // One quest at a time: a campaign can hold a hundred, with large texts
  const each = function* () {
    for (const q of quests) yield { game, ...readQuestForChecks(q), root: folder };
  };
  problems.push(...checkPackage(game, each()));
  return { problems, error: main.error ?? null };
}

/** Where a problem is, as a reader names it: a component, a file or folder, the texts of a language, or the scenario. */
export function problemWhere(p: Problem): string {
  if (p.where === '') return edi('EDITOR_WHERE_SCENARIO');
  if (p.where === '[Quest]') return 'quest.ini [Quest]';
  const texts = /^texts (\w+)$/.exec(p.where);
  if (texts !== null) return edi('EDITOR_WHERE_TEXTS', languageName(texts[1]!, Game.get().currentLang));
  return p.where;
}
