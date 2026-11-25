// Not in Valkyrie (7 November 2026): the window of the players' notes on a game of Mansions (play/notes.ts), opened
// from the phase bar's notebook.
import { useState } from 'react';
import { CommonStringKeys } from '@universalis/engine';
import { uni } from '../ui/text.ts';
import { gameNotes, openNotes, setGameNotes, useNotesOpen } from './notes.ts';

export function NotesWindow() {
  return useNotesOpen() ? <OpenNotes /> : null;
}

function OpenNotes() {
  const [text, setText] = useState(gameNotes);
  return (
    <div className="window-layer notes-layer" onKeyDown={(e) => e.key === 'Escape' && openNotes(false)}>
      <section className="window panel notes-window" role="dialog" aria-modal="true" aria-labelledby="notes-title">
        <h2 id="notes-title">{uni('NOTES')}</h2>
        <textarea
          className="notes-text"
          autoFocus
          value={text}
          placeholder={uni('NOTES_HINT')}
          aria-labelledby="notes-title"
          onChange={(e) => {
            setText(e.target.value);
            setGameNotes(e.target.value);
          }}
        />
        <p className="notes-note">{uni('NOTES_KEPT')}</p>
        <button type="button" className="button primary" onClick={() => openNotes(false)}>
          {CommonStringKeys.CLOSE.translate()}
        </button>
      </section>
    </div>
  );
}
