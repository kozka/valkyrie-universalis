// Runs what a click asks of the engine. An exception stops the game with a message instead of leaving the screen
// half drawn; Valkyrie's fatal errors (Application.quit) arrive through Application.onQuit (main.tsx).
// Not ported from Valkyrie.
import { update } from './store.ts';

export function run(action: () => void): void {
  try {
    action();
  } catch (e) {
    console.error(e);
    update({ stop: { message: e instanceof Error ? e.message : String(e), detail: e instanceof Error ? (e.stack ?? '') : '' } });
  }
}
