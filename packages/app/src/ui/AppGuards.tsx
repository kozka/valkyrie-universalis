// Not in Valkyrie: what a web page needs that a desktop app does not, while the app runs (16 October 2026).
// - During a game: the screen stays on, a refresh or close asks first, and Android's back gesture opens the game menu
//   instead of leaving the app.
// - Always: sound and speech pause while the app is hidden; a save the browser refused is said; a second window of the
//   app is warned that the two would overwrite each other's data; a save that failed is said.
import { useEffect } from 'react';
import { GameMenu, SaveManager } from '@universalis/engine';
import { pauseWhileHidden } from '../audio/webAudio.ts';
import { onStorageError } from '../host/storage.ts';
import { run } from './run.ts';
import { stopSpeaking } from './speech.ts';
import { update, useUI } from './store.ts';
import { uni } from './text.ts';

/** How often, at most, a refused save is said. */
const STORAGE_NOTICE_EVERY_MS = 30_000;

interface WakeLockSentinelLike {
  release(): Promise<void>;
}

function useWakeLock(on: boolean): void {
  useEffect(() => {
    const wakeLock = (navigator as Navigator & { wakeLock?: { request(type: 'screen'): Promise<WakeLockSentinelLike> } }).wakeLock;
    if (!on || wakeLock === undefined) return;
    let lock: WakeLockSentinelLike | null = null;
    let live = true;
    const request = () => {
      if (document.visibilityState !== 'visible') return;
      wakeLock.request('screen').then(
        (l) => {
          if (live) lock = l;
          else void l.release().catch(() => undefined);
        },
        () => undefined,
      );
    };
    // The browser lets the lock go when the page hides: ask again when it shows
    request();
    document.addEventListener('visibilitychange', request);
    return () => {
      live = false;
      document.removeEventListener('visibilitychange', request);
      void lock?.release().catch(() => undefined);
    };
  }, [on]);
}

function useAskBeforeLeaving(on: boolean): void {
  useEffect(() => {
    if (!on) return;
    const ask = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', ask);
    return () => window.removeEventListener('beforeunload', ask);
  }, [on]);
}

/** The steps back the app takes itself, which must not open the menu, and what a step back of the player does. */
let ownSteps = 0;
let onBack: (() => void) | null = null;
let listening = false;

/** Back (Android's gesture or button, the browser's arrow) opens the game menu, as Valkyrie's Escape does. */
function useBackOpensMenu(on: boolean): void {
  useEffect(() => {
    if (!on) return;
    if (!listening) {
      listening = true;
      window.addEventListener('popstate', () => {
        if (ownSteps > 0) ownSteps--;
        else onBack?.();
      });
    }
    const marker = { universalisGame: true };
    history.pushState(marker, '');
    onBack = () => {
      history.pushState(marker, '');
      run(() => GameMenu.create());
    };
    return () => {
      onBack = null;
      // Leave the history as it was before the game
      if ((history.state as typeof marker | null)?.universalisGame) {
        ownSteps++;
        history.back();
      }
    };
  }, [on]);
}

function usePauseWhileHidden(): void {
  useEffect(() => {
    const change = () => {
      const hidden = document.visibilityState === 'hidden';
      pauseWhileHidden(hidden);
      if (hidden) stopSpeaking();
    };
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
}

function useStorageErrors(): void {
  useEffect(() => {
    let said = 0;
    return onStorageError((error) => {
      if (Date.now() - said < STORAGE_NOTICE_EVERY_MS) return;
      said = Date.now();
      update({ notice: uni('STORAGE_WRITE_FAILED', error) });
    });
  }, []);
}

/** A save Valkyrie would only log (SaveManager.lastSaveError) is said, once each time it fails. */
function useSaveErrors(): void {
  useEffect(() => {
    let said: string | null = null;
    const timer = setInterval(() => {
      const error = SaveManager.lastSaveError;
      if (error !== null && error !== said) update({ notice: uni('SAVE_FAILED', error) });
      said = error;
    }, 2000);
    return () => clearInterval(timer);
  }, []);
}

/** The first window holds a lock while it lives; one opened beside it is told. */
function useOneWindow(): void {
  useEffect(() => {
    const locks = (navigator as Navigator & { locks?: LockManager }).locks;
    if (locks === undefined) return;
    let release: (() => void) | null = null;
    let live = true;
    locks
      .request('universalis-window', { ifAvailable: true }, (lock) => {
        if (lock === null) {
          if (live) update({ notice: uni('OTHER_WINDOW') });
          return undefined;
        }
        return new Promise<void>((resolve) => {
          release = resolve;
          if (!live) resolve();
        });
      })
      .catch(() => undefined);
    return () => {
      live = false;
      release?.();
    };
  }, []);
}

export function AppGuards() {
  const playing = useUI((s) => s.screen.name === 'quest');
  useWakeLock(playing);
  useAskBeforeLeaving(playing);
  useBackOpensMenu(playing);
  usePauseWhileHidden();
  useStorageErrors();
  useSaveErrors();
  useOneWindow();
  return null;
}
