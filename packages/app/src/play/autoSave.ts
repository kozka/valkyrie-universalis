// Not in Valkyrie (7 November 2026): besides the autosave at each round, as Valkyrie's, the game is kept a moment after
// the table goes calm (no window open, no event waiting), at most once a minute, so that a browser closed mid-round (a
// phone without battery) loses little. Not when nothing changed since the autosave (15 November 2026, saveState.ts).
import { useEffect } from 'react';
import { Game, SaveManager, ZipManager } from '@universalis/engine';
import { run } from '../ui/run.ts';
import { saveState } from './saveState.ts';

/** At most one calm autosave this often. */
const EVERY_MS = 60_000;
/** How long the table must stay calm first. */
const CALM_MS = 1500;

let lastSave = performance.now();

/** What the autosave (save 0) last wrote, by saveState; null before the first one. */
let autoSaved: string | null = null;

function extraFiles(): Map<string, Uint8Array> {
  return ZipManager.extraSaveFiles?.() ?? new Map<string, Uint8Array>();
}

SaveManager.onSaved = (num, saveIni) => {
  if (num === 0) autoSaved = saveState(saveIni, extraFiles());
};

export function useCalmAutoSave(calm: boolean): void {
  useEffect(() => {
    if (!calm) return;
    const timer = setTimeout(() => {
      const game = Game.get();
      const quest = game.currentQuest;
      if (quest === null || game.testMode || game.editMode) return;
      if (quest.eManager.eventStack.count > 0 || quest.eManager.currentEvent !== null) return;
      if (performance.now() - lastSave < EVERY_MS) return;
      if (autoSaved !== null && saveState(quest.toString(), extraFiles()) === autoSaved) return;
      lastSave = performance.now();
      run(() => SaveManager.save(0));
    }, CALM_MS);
    return () => clearTimeout(timer);
  }, [calm]);
}
