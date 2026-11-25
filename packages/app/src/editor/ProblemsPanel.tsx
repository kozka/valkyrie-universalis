// What the checks find in the open scenario as it is now, in words (ProblemLine.tsx), by how much it matters: pressing
// one in a component selects it; a problem whose mend is certain has a button that mends it (ProblemFixes, a change
// Undo takes back); and one that does not break Valkyrie can be left untold, listed apart until it is told again.
// Not ported from Valkyrie, whose Validate does nothing.
import { Game, ProblemFixes, QuestData, type Problem, type ProblemFix } from '@universalis/engine';
import { run } from '../ui/run.ts';
import { redrawOnBoard } from './EditorMap.tsx';
import { useEditor } from './editorState.ts';
import { ProblemLine } from './ProblemLine.tsx';
import { change, currentSession, ignore, isIgnored } from './session.ts';
import { edi } from './text.ts';

const LEVELS: { level: Problem['level']; title: string }[] = [
  { level: 'breaks', title: 'EDITOR_BREAKS' },
  { level: 'wrong', title: 'EDITOR_WRONG' },
  { level: 'hint', title: 'EDITOR_HINTS' },
];

/** What a fix does, as its button says it. */
function fixText(fix: ProblemFix): string {
  if (fix.kind === 'add-pack') return edi('EDITOR_FIX_ADD_PACK', fix.params[0]!);
  return edi(fix.kind === 'slashes' ? 'EDITOR_FIX_SLASHES' : 'EDITOR_FIX_UNHIDE');
}

/** Mends a problem, unless it was mended already (the checks see it a moment later), and draws its piece again. */
function mend(problem: Problem): void {
  const fix = ProblemFixes.fixOf(problem);
  if (fix === null) return;
  change(fixText(fix), () => {
    fix.apply();
    const component = Game.get().currentQuest!.qd.components.get(problem.where);
    if (component instanceof QuestData.Tile || component instanceof QuestData.Token) redrawOnBoard(problem.where);
  });
}

function Actions({ problem }: { problem: Problem }) {
  const fix = ProblemFixes.fixOf(problem);
  if (fix === null && problem.level === 'breaks') return null;
  return (
    <span className="editor-problem-actions">
      {fix !== null && (
        <button type="button" className="button" onClick={() => run(() => mend(problem))}>
          {fixText(fix)}
        </button>
      )}
      {problem.level !== 'breaks' && (
        <button type="button" className="editor-link editor-problem-ignore" onClick={() => run(() => ignore(problem, true))}>
          {edi('EDITOR_IGNORE')}
        </button>
      )}
    </span>
  );
}

export function ProblemsPanel() {
  useEditor((s) => s.revision);
  const all = currentSession().problems;
  const components = Game.get().currentQuest!.qd.components;
  const told = all.filter((p) => !isIgnored(p));
  const ignored = all.filter(isIgnored);
  return (
    <>
      {told.length === 0 && <p className="quiet">{edi('EDITOR_NO_PROBLEMS')}</p>}
      {LEVELS.map(({ level, title }) => {
        const found = told.filter((p) => p.level === level);
        if (found.length === 0) return null;
        return (
          <details key={level} className={`editor-level editor-level-${level}`} open={level !== 'hint'}>
            <summary>{edi(title, found.length)}</summary>
            <ul>
              {found.map((p, i) => (
                <li key={i}>
                  <ProblemLine problem={p} selectable={components.has(p.where)} texts />
                  <Actions problem={p} />
                </li>
              ))}
            </ul>
          </details>
        );
      })}
      {ignored.length > 0 && (
        <details className="editor-level editor-level-ignored">
          <summary>{edi('EDITOR_IGNORED', ignored.length)}</summary>
          <ul>
            {ignored.map((p, i) => (
              <li key={i}>
                <ProblemLine problem={p} selectable={components.has(p.where)} texts />
                <span className="editor-problem-actions">
                  <button type="button" className="editor-link editor-problem-ignore" onClick={() => run(() => ignore(p, false))}>
                    {edi('EDITOR_UNIGNORE')}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}
