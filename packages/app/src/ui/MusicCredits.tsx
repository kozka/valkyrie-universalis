// Not in Valkyrie: who made the app's own music, small in a corner of the menus where it plays (audio/appMusic.ts);
// an author with no channel is only named.
import { useEffect } from 'react';
import { menuMusicCredits, stopMenuSound } from '../audio/menuAmbience.ts';
import { MENU_SCREENS } from '../audio/menuSound.ts';
import { useUI } from './store.ts';
import { uni } from './text.ts';
import './MusicCredits.css';

export function MusicCredits() {
  const screen = useUI((s) => s.screen.name);
  useUI((s) => s.revision);
  // A game's menu sound goes on while the heroes and their classes are chosen, and ends where the menus do: at the
  // game selection, when the game starts, in the editor
  const choosing = useUI((s) => s.screen.name === 'quest' && (s.heroSelectionScreen || s.classSelection !== null));
  useEffect(() => {
    if (!MENU_SCREENS.has(screen) && !choosing) stopMenuSound();
  }, [screen, choosing]);
  const credits = MENU_SCREENS.has(screen) ? menuMusicCredits() : [];
  if (credits.length === 0) return null;
  return (
    <aside className="music-credits" aria-label={uni('MUSIC_CREDIT_LABEL')}>
      {credits.map((c) => (
        <p key={c.author}>
          <span>{uni('MUSIC_CREDIT', c.author)}</span>
          {c.channel !== undefined && (
            <a href={c.channel} target="_blank" rel="noreferrer" aria-label={uni('MUSIC_CREDIT_CHANNEL', c.author)} title={uni('MUSIC_CREDIT_CHANNEL', c.author)}>
              <svg viewBox="0 0 28 20" width="17" height="12" aria-hidden="true">
                <rect className="video-mark" width="28" height="20" rx="5" />
                <path className="video-play" d="M11 5.5v9l8-4.5z" />
              </svg>
            </a>
          )}
        </p>
      ))}
    </aside>
  );
}
