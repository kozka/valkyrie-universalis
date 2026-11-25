// Bugs and ideas: a small window the players write in, sent to kozka's own Google Form (a sheet he reads, which
// mails him each answer), with what helps to reproduce a bug: version, browser, screen, game, scenario and the last
// warnings and errors. A no-cors POST, as the statistics (host/network.ts postForm). Not ported from Valkyrie.
import { useState, useSyncExternalStore } from 'react';
import { Game, Path } from '@universalis/engine';
import { audioState } from '../audio/webAudio.ts';
import { recentProblems } from '../host/devLog.ts';
import { postForm } from '../host/network.ts';
import { installed } from '../host/pwa.ts';
import { speechState } from './speech.ts';
import { useUI } from './store.ts';
import { uni } from './text.ts';
import './Feedback.css';

/** kozka's form, «Valkyrie Universalis – errores e ideas», and its questions' entries. */
export const FEEDBACK_FORM = {
  url: 'https://docs.google.com/forms/d/e/1FAIpQLSeaxdCbCPjbfaA8qQTwyq0dk23-VABnWR-W3PYdvySchi_cUg/formResponse',
  kind: 'entry.1554930256',
  comment: 'entry.1922982981',
  email: 'entry.624337130',
  technical: 'entry.1001353303',
};

const KINDS = [
  { value: 'error', text: 'FEEDBACK_BUG' },
  { value: 'idea', text: 'FEEDBACK_IDEA' },
  { value: 'otro', text: 'FEEDBACK_OTHER' },
] as const;

/** What the report carries besides the player's words. */
export function technicalData(): string {
  const game = Game.game;
  const quest = game?.currentQuest;
  const lines = [
    `Versión: ${__APP_VERSION__}`,
    `Navegador: ${navigator.userAgent}`,
    `Pantalla: ${innerWidth}×${innerHeight} (×${devicePixelRatio})${installed() ? ', instalada' : ''}`,
    `Sonido: ${audioState()}`,
    `Voz: ${speechState()}`,
    `Idioma: ${game?.currentLang ?? navigator.language}`,
    `Juego: ${game?.gameType.typeName() || '-'}`,
    `Pantalla de la app: ${useUI.getState().screen.name}`,
    // Its package, as the statistics name it (EndGameScreen.tsx): a quest being played has no identifier of its own
    `Escenario: ${quest ? `${Path.getFileName(quest.originalPath) ?? ''} (ronda ${quest.vars.getValue('#round')})` : '-'}`,
  ];
  const problems = recentProblems();
  if (problems.length > 0) lines.push('', 'Últimos avisos y errores:', ...problems);
  return lines.join('\n');
}

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="button feedback-button" onClick={() => setOpen(true)}>
        {uni('FEEDBACK_BUTTON')}
      </button>
      {open && <FeedbackWindow close={() => setOpen(false)} />}
    </>
  );
}

let openInGame = false;
const listeners = new Set<() => void>();

/** The window opened from the game's menu (GameMenuWindow), so that the report carries the game, scenario and round. */
export function openFeedback(on = true): void {
  openInGame = on;
  for (const listener of listeners) listener();
}

export function FeedbackInGame() {
  const shown = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => openInGame,
  );
  return shown ? <FeedbackWindow close={() => openFeedback(false)} /> : null;
}

function FeedbackWindow({ close }: { close: () => void }) {
  const [kind, setKind] = useState<(typeof KINDS)[number]['value']>('error');
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'writing' | 'sending' | 'sent'>('writing');
  const [error, setError] = useState('');
  const [technical] = useState(technicalData);

  const send = async () => {
    if (comment.trim() === '') {
      setError(uni('FEEDBACK_EMPTY'));
      return;
    }
    setState('sending');
    setError('');
    const reply = await postForm(FEEDBACK_FORM.url, [
      [FEEDBACK_FORM.kind, kind],
      [FEEDBACK_FORM.comment, comment.trim()],
      [FEEDBACK_FORM.email, email.trim()],
      [FEEDBACK_FORM.technical, technical],
    ]);
    if (reply === null) {
      setState('writing');
      setError(uni('FEEDBACK_FAILED'));
    } else setState('sent');
  };

  return (
    <div className="window-layer feedback-layer" onKeyDown={(e) => e.key === 'Escape' && close()}>
      <section className="window panel feedback-window" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
        <h2 id="feedback-title">{uni('FEEDBACK_TITLE')}</h2>
        {state === 'sent' ? (
          <>
            <p role="status">{uni('FEEDBACK_SENT')}</p>
            <button type="button" className="button primary feedback-close" autoFocus onClick={close}>
              {uni('FEEDBACK_CLOSE')}
            </button>
          </>
        ) : (
          <>
            <p className="feedback-intro">{uni('FEEDBACK_INTRO')}</p>
            <div className="feedback-kinds" role="radiogroup" aria-label={uni('FEEDBACK_KIND')}>
              {KINDS.map((k) => (
                <label key={k.value} className="feedback-kind">
                  <input type="radio" name="feedback-kind" checked={kind === k.value} onChange={() => setKind(k.value)} />
                  {uni(k.text)}
                </label>
              ))}
            </div>
            <label className="feedback-field">
              <span>{uni('FEEDBACK_COMMENT')}</span>
              <textarea
                rows={6}
                maxLength={5000}
                value={comment}
                autoFocus
                onChange={(e) => {
                  setComment(e.target.value);
                  setError('');
                }}
              />
            </label>
            <label className="feedback-field">
              <span>{uni('FEEDBACK_EMAIL')}</span>
              <input type="email" maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <details className="feedback-technical">
              <summary>{uni('FEEDBACK_TECHNICAL')}</summary>
              <pre>{technical}</pre>
            </details>
            {error !== '' && (
              <p className="feedback-error" role="alert">
                {error}
              </p>
            )}
            <div className="feedback-actions">
              <button type="button" className="button" onClick={close}>
                {uni('FEEDBACK_CANCEL')}
              </button>
              <button type="button" className="button primary" disabled={state === 'sending'} onClick={() => void send()}>
                {uni('FEEDBACK_SEND')}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
