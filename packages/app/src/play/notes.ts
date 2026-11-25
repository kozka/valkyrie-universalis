// Not in Valkyrie (7 November 2026): the players' own notes on a game of Mansions («the key is Agatha's»), kept with
// the game in its save as universalis-notes.txt, which Valkyrie leaves alone (ZipManager.extraSaveFiles). They stay
// across a change of quest (TLE), start empty in a new game and come back with a saved one.
import { useSyncExternalStore } from 'react';
import { File, Path, SaveManager, ZipManager } from '@universalis/engine';

export const NOTES_FILE = 'universalis-notes.txt';

let notes = '';
let open = false;
const listeners = new Set<() => void>();

function changed(): void {
  for (const listener of listeners) listener();
}

export function gameNotes(): string {
  return notes;
}

export function setGameNotes(text: string): void {
  notes = text;
  changed();
}

/** A new game starts with no notes. */
export function clearGameNotes(): void {
  setGameNotes('');
}

export function openNotes(on = true): void {
  open = on;
  changed();
}

export function useNotesOpen(): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => open,
  );
}

/** Saves carry the notes, and a save read gives them back (host/boot.ts sets this up once). */
export function keepNotesInSaves(): void {
  // Always written, so that notes emptied do not come back from an earlier autosave of the same zip
  ZipManager.extraSaveFiles = () => new Map([[NOTES_FILE, new TextEncoder().encode(notes)]]);
  SaveManager.onLoad = (folder) => {
    const file = Path.combine(folder, NOTES_FILE);
    notes = File.exists(file) ? File.readAllText(file) : '';
    open = false;
    changed();
  };
}
