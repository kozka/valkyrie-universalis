// The event's dialog as a game shows it, over the map: its card, its text and its buttons in their colours, in the
// look the game has now (the theme's window). What a game alone knows (a variable's value, a random hero) stays as it
// is typed (EditorComponentEvent.preview). Not in Valkyrie, whose editor shows a dialog only by playing the scenario.
import { useEffect } from 'react';
import { CommonStringKeys, EditorComponentEvent, Game, QuestData } from '@universalis/engine';
import { RichText } from '../ui/RichText.tsx';
import { ButtonRow } from '../play/ButtonRow.tsx';
import { useEditor } from './editorState.ts';
import { edi } from './text.ts';
import '../screens/QuestScreen.css';
import '../play/play.css';
import '../themes/universalis/play.css';

/** The selected event's dialog; choosing another event shows its own. */
export function DialogShow() {
  useEditor((s) => s.revision);
  const game = Game.get();
  const event = game.currentQuest?.qd.components.get(game.qed?.selection ?? '');
  const close = () => useEditor.setState({ showing: false });
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      close();
    };
    window.addEventListener('keydown', key, true);
    return () => window.removeEventListener('keydown', key, true);
  }, []);
  if (!(event instanceof QuestData.Event) || !event.display) return null;
  const preview = EditorComponentEvent.preview(event);
  return (
    <div className="quest-screen editor-show" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="window-layer editor-show-layer" onClick={(e) => e.target === e.currentTarget && close()}>
        <section className="window panel event-window" role="dialog" aria-label={edi('EDITOR_SHOW_IN_GAME')}>
          <div className="card event-text">
            <RichText text={preview.text} />
          </div>
          <ButtonRow>
            {preview.buttons.map((button, i) => (
              <button key={i} type="button" className="button event-button" style={{ color: button.colour }} onClick={close}>
                <RichText text={button.label} />
              </button>
            ))}
            {event.cancelable && (
              <button type="button" className="button event-button" onClick={close}>
                {CommonStringKeys.CANCEL.translate()}
              </button>
            )}
          </ButtonRow>
        </section>
      </div>
      <button type="button" className="editor-tool editor-show-close" aria-label={CommonStringKeys.CLOSE.translate()} title={CommonStringKeys.CLOSE.translate()} onClick={close}>
        ✕
      </button>
    </div>
  );
}
