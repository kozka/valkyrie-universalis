// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/UI/Screens/LoadingScreen.cs
// Partial: the screen of a download, with its message and its progress (the constructor that takes a UnityWebRequest,
// and ProgressBar). Its log lines (UpdateDisplay) are the importer's, which has a screen of its own. Valkyrie draws its
// pulsing logo; the drawing is the app's.
import { Destroyer, Game } from '@universalis/engine';
import { openWindow, useUI } from '../ui/store.ts';
import { val } from '../ui/text.ts';
import './LoadingScreen.css';

/** Not in Valkyrie: what the Cancel button aborts, the download the screen shows. */
let cancelling: AbortController | null = null;

/** new LoadingScreen(download, display): closes the dialogs, then covers the screen. Gives what Cancel aborts. */
// Valkyrie: LoadingScreen.cs LoadingScreen.LoadingScreen(UnityWebRequest, string)
export function openLoadingScreen(display: string): AbortSignal {
  Destroyer.dialog();
  cancelling = new AbortController();
  openWindow({ kind: 'loading', tag: Game.DIALOG, text: display, progress: 0 });
  return cancelling.signal;
}

/** ProgressBar: how far the download got, from 0 to 1, or null while its size is unknown. */
export function loadingProgress(progress: number | null): void {
  const window = useUI.getState().windows.find((w) => w.kind === 'loading');
  if (window?.kind !== 'loading') return;
  // Whole percents only, so that a large download does not draw the screen thousands of times
  const percent = (p: number | null) => (p === null ? null : Math.floor(p * 100));
  if (percent(progress) === percent(window.progress)) return;
  openWindow({ ...window, progress });
}

export function LoadingScreen() {
  const window = useUI((s) => s.windows.find((w) => w.kind === 'loading'));
  if (window?.kind !== 'loading') return null;
  return (
    <div className="window-layer loading-layer">
      <section className="loading-screen" role="status" aria-live="polite">
        <p className="loading-text">{window.text}</p>
        <progress className="loading-bar" max={1} value={window.progress ?? undefined} aria-label={window.text} />
        {cancelling !== null && (
          <button type="button" className="button" onClick={() => cancelling?.abort()}>
            {val('CANCEL')}
          </button>
        )}
      </section>
    </div>
  );
}
