// A problem the editor's checks found, said in words in the editor's language: the text of its code with its names and
// numbers in place (PROBLEM_<CODE> in editor/i18n). Not ported from Valkyrie, whose Validate does nothing.
import type { Problem } from '@universalis/engine';
import { edi } from './edi.ts';

/** A check that would stop Valkyrie in a component no game reaches yet (QuestChecks.crash, in Descent). */
const UNREACHED = '-unreached';

/** The text of a problem's code: PROBLEM_ and the code in capitals (never-added: PROBLEM_NEVER_ADDED). */
export function problemKey(code: string): string {
  const base = code.endsWith(UNREACHED) ? code.substring(0, code.length - UNREACHED.length) : code;
  return 'PROBLEM_' + base.toUpperCase().replace(/-/g, '_');
}

/** A problem in words: its code's text with its names and numbers in place. */
export function problemText(p: Problem): string {
  let text = edi(problemKey(p.code));
  for (const [name, value] of Object.entries(p.params ?? {})) text = text.split(`{${name}}`).join(String(value));
  if (p.code.endsWith(UNREACHED)) {
    text += ' ' + edi('EDITOR_PROBLEM_UNREACHED');
    const more = Number(p.params?.['more'] ?? 0);
    if (more > 0) text += ' ' + edi('EDITOR_PROBLEM_MORE', more);
  }
  return text;
}
