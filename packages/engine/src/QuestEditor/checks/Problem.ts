// A problem the editor's checks find in a scenario. Not ported from Valkyrie, whose Validate button does nothing in
// 3.28: the checks come from the validators of the skills mansiones-valkyrie and descent-valkyrie (validar.py), which
// were checked against Valkyrie's code, and they say what Valkyrie does with each thing.

/**
 * breaks: Valkyrie stops, does not list the scenario or plays it broken. wrong: it plays, but something will not do what
 * the author expects. hint: a suggestion.
 */
export type ProblemLevel = 'breaks' | 'wrong' | 'hint';

export interface Problem {
  level: ProblemLevel;
  /** What was found, in words of its own (kebab-case): the app shows the text of that code in the player's language. */
  code: string;
  /** The component it is in; '[Quest]' for the quest's own section, a file name for a whole file, '' for the scenario. */
  where: string;
  /** The key of the component, or the text key, that holds it. */
  key?: string;
  /** What the text of the code shows: names, values, counts. */
  params?: Record<string, string | number>;
}

/** Collects problems as the checks find them. */
export class Problems {
  readonly list: Problem[] = [];

  add(level: ProblemLevel, code: string, where: string, params?: Problem['params'], key?: string): void {
    const problem: Problem = { level, code, where };
    if (key !== undefined) problem.key = key;
    if (params !== undefined) problem.params = params;
    this.list.push(problem);
  }

  breaks(code: string, where: string, params?: Problem['params'], key?: string): void {
    this.add('breaks', code, where, params, key);
  }

  wrong(code: string, where: string, params?: Problem['params'], key?: string): void {
    this.add('wrong', code, where, params, key);
  }

  hint(code: string, where: string, params?: Problem['params'], key?: string): void {
    this.add('hint', code, where, params, key);
  }
}

/**
 * The same problem in a later check, to ignore it (QuestEditorVersions.ignored): its code, where and key, and its
 * names and numbers, so that a problem that changes comes back.
 */
export function problemSignature(p: Problem): string {
  return `${p.code}|${p.where}|${p.key ?? ''}|${JSON.stringify(p.params ?? {})}`;
}
