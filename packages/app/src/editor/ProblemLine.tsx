// A problem the checks found, in words (problemText.ts): where it is, what happens, and the key that holds it; in a
// component of the scenario open on the workbench, pressing it selects that component, and in the texts of a
// language, it shows their table. Not ported from Valkyrie, whose Validate does nothing.
import type { Problem } from '@universalis/engine';
import { run } from '../ui/run.ts';
import { showTab } from './editorState.ts';
import { problemText } from './problemText.ts';
import { problemWhere } from './problems.ts';
import { select } from './session.ts';

interface ProblemLineProps {
  problem: Problem;
  /** Whether to say where it is: not in the panel of the component it is in. */
  where?: boolean;
  /** Whether pressing it selects its component. */
  selectable?: boolean;
  /** Whether pressing one in the texts of a language shows the table of texts (on the workbench). */
  texts?: boolean;
}

export function ProblemLine({ problem, where = true, selectable = false, texts = false }: ProblemLineProps) {
  const text = problemText(problem);
  // The key, unless the text says it already
  const key = problem.key !== undefined && problem.key !== '' && !text.includes(problem.key) ? problem.key : null;
  const inner = (
    <>
      {where && <strong className="editor-problem-where">{problemWhere(problem)}</strong>}
      <span className="editor-problem-text">{text}</span>
      {key !== null && <code className="editor-problem-key">{key}</code>}
    </>
  );
  if (selectable) {
    return (
      <button type="button" className="editor-link editor-problem" data-code={problem.code} onClick={() => run(() => select(problem.where))}>
        {inner}
      </button>
    );
  }
  // In the texts of a language: their table, with what is missing when that is the problem, or the text it is in
  if (texts && problem.where.startsWith('texts ')) {
    return (
      <button type="button" className="editor-link editor-problem" data-code={problem.code} onClick={() => showTab('texts', { onlyMissing: problem.code === 'texts-missing-language', search: problem.key?.includes('.') ? problem.key : '' })}>
        {inner}
      </button>
    );
  }
  return (
    <span className="editor-problem" data-code={problem.code}>
      {inner}
    </span>
  );
}
