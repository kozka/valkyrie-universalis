// Not in Valkyrie: while the scenario editor is open to try (packages/app/editorPreview.ts), the warning on entering
// it, large: it is not ready, only to try it out; and it opens on a computer only, never on a phone or a tablet.
import { useEffect, useRef } from 'react';
import { uni, val } from './text.ts';
import './EditorWarning.css';

/** A computer: its main pointer is a mouse or a touchpad, which can hover. A phone's or a tablet's is a finger. */
function onComputer(): boolean {
  return matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function EditorWarning({ enter, back }: { enter: () => void; back: () => void }) {
  const computer = onComputer();
  const first = useRef<HTMLButtonElement>(null);
  // Into the window without scrolling it, so that a short screen shows its title first
  useEffect(() => first.current?.focus({ preventScroll: true }), []);
  return (
    <div className="window-layer editor-warning-layer" onKeyDown={(e) => e.key === 'Escape' && back()}>
      <section
        className="window panel editor-warning"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="editor-warning-title"
        aria-describedby={computer ? 'editor-warning-text' : 'editor-warning-text editor-warning-computer'}
      >
        <h2 id="editor-warning-title">{uni('EDITOR_NOT_READY')}</h2>
        <p id="editor-warning-text">{uni('EDITOR_EARLY')}</p>
        {!computer && (
          <p id="editor-warning-computer" className="editor-warning-computer">
            {uni('EDITOR_COMPUTER_ONLY')}
          </p>
        )}
        <div className="editor-warning-actions">
          <button type="button" className="button" ref={computer ? undefined : first} onClick={back}>
            {val('BACK')}
          </button>
          {computer && (
            <button type="button" className="button primary" ref={first} onClick={enter}>
              {uni('EDITOR_ENTER')}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
