// What the scenario editor gives the game's screens while it tests a scenario (Valkyrie's Save & Test): a panel beside
// the game, and the way back to the editor, with the scenario's history, which the engine's own ways back take
// (GameMenu.Editor, the class selection's Back: ReactUI.questEditorScreen) and a test that ends takes instead of the
// main menu. The editor, only in development builds, sets it when a test starts and clears it when it goes back, so
// the built app never has one. Not ported from Valkyrie.
import type { ComponentType } from 'react';

export interface EditorTest {
  /** Drawn beside the game while it is tested. */
  Panel: ComponentType;
  /** Back to the editor, on the scenario tested, with a component of it chosen there. */
  back(select?: string): void;
}

let current: EditorTest | null = null;

/** The test running, or null. */
export function editorTest(): EditorTest | null {
  return current;
}

export function setEditorTest(test: EditorTest | null): void {
  current = test;
}
