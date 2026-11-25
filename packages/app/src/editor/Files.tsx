// The files in a scenario's folder, with their sizes. Not ported from Valkyrie.
import { useMemo } from 'react';
import { Directory, SearchOption, fileSystem } from '@universalis/engine';
import { useEditor } from './editorState.ts';
import { edi } from './text.ts';

export function Files({ folder }: { folder: string }) {
  const revision = useEditor((s) => s.revision);
  const files = useMemo(
    () =>
      Directory.getFiles(folder, '*', SearchOption.AllDirectories)
        .map((f) => ({ name: f.substring(folder.length + 1), size: fileSystem().fileSize(f) ?? 0 }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [folder, revision],
  );
  return (
    <ul className="editor-files">
      {files.map((f) => (
        <li key={f.name}>
          <span>{f.name}</span>
          <span className="quiet">{edi('EDITOR_FILE_SIZE', Math.max(1, Math.round(f.size / 1024)))}</span>
        </li>
      ))}
    </ul>
  );
}
