// The app's start: kozka's logo fades in over black while the app boots, a light sweeps across it, and it fades out
// on the game selection; then, until the player hides it, a welcome. Not ported from Valkyrie, whose start shows its
// own logo while it loads.
import { useEffect, useState, type CSSProperties } from 'react';
import logo from '../assets/logo.webp';
import { useUI } from './store.ts';
import { uni } from './text.ts';
import './Splash.css';

/** How long the logo shows at least, and how long it takes to fade out, in milliseconds (Splash.css). */
const SHOWN = 2200;
const FADE_OUT = 900;
const WELCOME_KEY = 'universalis.welcome';

function welcomeHidden(): boolean {
  try {
    return localStorage.getItem(WELCOME_KEY) === 'hidden';
  } catch {
    return false;
  }
}

function hideWelcome(): void {
  try {
    localStorage.setItem(WELCOME_KEY, 'hidden');
  } catch {
    // Without storage it shows again next time
  }
}

export function Splash() {
  // A start that failed shows its stop window (App.tsx), which the splash must not hide
  const booted = useUI((s) => s.screen.name !== 'loading' || s.stop !== null);
  const [phase, setPhase] = useState<'in' | 'out' | 'done'>('in');
  const [shownLongEnough, setShownLongEnough] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShownLongEnough(true), SHOWN);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (phase === 'in' && booted && shownLongEnough) setPhase('out');
  }, [phase, booted, shownLongEnough]);
  useEffect(() => {
    if (phase !== 'out') return;
    const timer = setTimeout(() => setPhase('done'), FADE_OUT);
    return () => clearTimeout(timer);
  }, [phase]);
  if (phase === 'done') return <Welcome />;
  return (
    <div className={`splash splash-${phase}`} aria-hidden="true" style={{ '--splash-logo': `url(${logo})` } as CSSProperties}>
      <div className="splash-logo">
        <img src={logo} alt="" width={1200} height={412} />
        <span className="splash-shine" />
      </div>
    </div>
  );
}

/** What this version is, in the player's language, over the game selection. */
function Welcome() {
  const onGameSelection = useUI((s) => s.screen.name === 'game-selection');
  useUI((s) => s.revision);
  const [open, setOpen] = useState(() => !welcomeHidden());
  const [dontShow, setDontShow] = useState(false);
  if (!open || !onGameSelection) return null;
  const close = () => {
    if (dontShow) hideWelcome();
    setOpen(false);
  };
  return (
    <div className="window-layer welcome-layer" onKeyDown={(e) => e.key === 'Escape' && close()}>
      <section className="window panel welcome-window" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
        <h2 id="welcome-title">{uni('WELCOME_TITLE')}</h2>
        {uni('WELCOME_TEXT')
          .split('\\n')
          .join('\n')
          .split(/\n\s*\n/)
          .map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        <div className="welcome-actions">
          <label className="welcome-hide">
            <input type="checkbox" checked={dontShow} onChange={(e) => setDontShow(e.target.checked)} />
            {uni('WELCOME_HIDE')}
          </label>
          <button type="button" className="button primary" autoFocus onClick={close}>
            {uni('WELCOME_START')}
          </button>
        </div>
      </section>
    </div>
  );
}
