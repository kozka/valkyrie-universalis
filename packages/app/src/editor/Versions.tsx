// The versions of the open scenario that its saves kept (QuestEditorVersions), the newest first, each one to go back
// to after asking; what it replaces is kept as a version too. Not in Valkyrie, whose editor keeps none.
import { useState } from 'react';
import { CommonStringKeys, Game, QuestEditor, QuestEditorVersions } from '@universalis/engine';
import { run } from '../ui/run.ts';
import { say, useEditor } from './editorState.ts';
import { currentSession, reloaded } from './session.ts';
import { edi, keptAt as when } from './text.ts';

export function Versions({ folder }: { folder: string }) {
  useEditor((s) => s.revision);
  const [asking, setAsking] = useState<string | null>(null);
  const versions = QuestEditorVersions.list(folder);
  if (versions.length === 0) return <p className="quiet">{edi('EDITOR_NO_VERSIONS')}</p>;
  const restore = (path: string, time: number) =>
    run(() => {
      setAsking(null);
      QuestEditorVersions.restore(folder, path);
      // Valkyrie: EditorMenu.cs EditorMenu.Create (Reload)
      QuestEditor.reload(Game.get().currentQuest!.originalPath);
      reloaded();
      say(edi('EDITOR_RESTORED', when(time)));
    });
  return (
    <ul className="editor-versions">
      {versions.map(({ path, time }) => (
        <li key={path}>
          <span>{when(time)}</span>
          {asking === path ? (
            <span className="editor-confirm" role="alert">
              <span>{edi(currentSession().dirty ? 'EDITOR_RESTORE_UNSAVED' : 'EDITOR_RESTORE_CONFIRM', when(time))}</span>
              <button type="button" className="button back" onClick={() => restore(path, time)}>
                {edi('EDITOR_RESTORE')}
              </button>
              <button type="button" className="button" onClick={() => setAsking(null)}>
                {CommonStringKeys.CANCEL.translate()}
              </button>
            </span>
          ) : (
            <button type="button" className="button" onClick={() => setAsking(path)}>
              {edi('EDITOR_RESTORE')}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
