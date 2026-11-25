// A scenario chosen in the editor: its workbench (Workbench.tsx) once QuestEditor.Begin opened it, or, not in Valkyrie,
// whose editor closes on a scenario it cannot load (a TileSide that is not there, say), what the checks find in its
// files, with nothing that would write them.
import { useMemo } from 'react';
import { CommonStringKeys, Game, Path, type Problem } from '@universalis/engine';
import { run } from '../ui/run.ts';
import { val } from '../ui/text.ts';
import { go, useEditor } from './editorState.ts';
import { exportScenario } from './files.ts';
import { Files } from './Files.tsx';
import { ProblemLine } from './ProblemLine.tsx';
import { checkScenario } from './problems.ts';
import { edi } from './text.ts';
import { Workbench } from './Workbench.tsx';

const LEVELS: { level: Problem['level']; title: string }[] = [
  { level: 'breaks', title: 'EDITOR_BREAKS' },
  { level: 'wrong', title: 'EDITOR_WRONG' },
  { level: 'hint', title: 'EDITOR_HINTS' },
];

/** What the checks find in the scenario's files. */
function Problems({ folder }: { folder: string }) {
  const revision = useEditor((s) => s.revision);
  const { problems } = useMemo(() => checkScenario(folder), [folder, revision]);
  return (
    <section className="editor-problems panel" aria-labelledby="editor-problems-title">
      <h2 id="editor-problems-title">{edi('EDITOR_PROBLEMS')}</h2>
      {problems.length === 0 && <p className="quiet">{edi('EDITOR_NO_PROBLEMS')}</p>}
      {LEVELS.map(({ level, title }) => {
        const found = problems.filter((p) => p.level === level);
        if (found.length === 0) return null;
        return (
          <details key={level} className={`editor-level editor-level-${level}`} open={level !== 'hint'}>
            <summary>{edi(title, found.length)}</summary>
            <ul>
              {found.map((p, i) => (
                <li key={i}>
                  <ProblemLine problem={p} />
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </section>
  );
}

function CannotOpen({ path, error }: { path: string; error: string }) {
  return (
    <main className="screen editor editor-quest">
      <header className="screen-head">
        <h1>{Path.getFileName(path)}</h1>
      </header>
      <p className="editor-dev">{edi(__EDITOR_PREVIEW__ ? 'EDITOR_PREVIEW_NOTE' : 'EDITOR_DEV_ONLY')}</p>
      <p className="editor-error" role="alert">
        {edi('EDITOR_CANNOT_OPEN', error)}
      </p>
      <nav className="editor-toolbar" aria-label={val('TOOLS')}>
        <button type="button" className="button" onClick={() => run(() => exportScenario(path))}>
          {edi('EDITOR_EXPORT')}
        </button>
      </nav>
      <div className="editor-columns">
        <Problems folder={path} />
        <section className="editor-files-panel panel" aria-labelledby="editor-files-title">
          <h2 id="editor-files-title">{edi('EDITOR_FILES')}</h2>
          <Files folder={path} />
        </section>
      </div>
      <footer className="screen-foot">
        <button type="button" className="button back" onClick={() => run(() => go({ name: 'list' }))}>
          {CommonStringKeys.BACK.translate()}
        </button>
      </footer>
    </main>
  );
}

export function QuestView({ path, error }: { path: string; error?: string }) {
  useEditor((s) => s.revision);
  if (error !== undefined) return <CannotOpen path={path} error={error} />;
  if (Game.get().currentQuest === null) return null;
  return <Workbench path={path} />;
}
