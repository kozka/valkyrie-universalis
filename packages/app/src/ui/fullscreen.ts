// A game fills the screen while it is played: starting or continuing one asks the browser for full screen, and the
// browser's Escape, or a phone's back gesture, leaves it. Not ported from Valkyrie.
import { useSyncExternalStore } from 'react';
import { lockLandscape } from '../host/orientation.ts';

/** Fills the screen with the app, where the browser allows it: during a click, and not in an iPhone's Safari. */
export function enterFullscreen(): void {
  if (!document.fullscreenEnabled || document.fullscreenElement !== null) return;
  document.documentElement
    .requestFullscreen({ navigationUI: 'hide' })
    // Full screen, Android's browsers let a game turn to landscape too (host/orientation.ts)
    .then(lockLandscape)
    .catch(() => {});
}

/** Leaves full screen, or fills it, from a button of the game's options or the editor's bar. */
export function toggleFullscreen(): void {
  if (document.fullscreenElement !== null) void document.exitFullscreen().catch(() => {});
  else enterFullscreen();
}

/** Whether the app fills the screen now, for a switch that shows it. */
export function useFullscreen(): boolean {
  return useSyncExternalStore(
    (listener) => {
      document.addEventListener('fullscreenchange', listener);
      return () => document.removeEventListener('fullscreenchange', listener);
    },
    () => document.fullscreenElement !== null,
  );
}
