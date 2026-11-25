// Every PixiJS drawing of the app (the board, the screens' drawings, the themes') is made and destroyed here, because
// they share Pixi's global pools. Releasing those destroys the batches that a living drawing still holds, which it later
// gives back to the pool: from then on every drawing on the page crashes (17 October 2026). So the pools go with the
// last drawing alive, never before. Not ported from Valkyrie.
import { Application, GlobalResourceRegistry } from 'pixi.js';

let alive = 0;

/** A new drawing, counted until it is destroyed. */
export function newApplication(): Application {
  alive++;
  return new Application();
}

/** Destroys a drawing (also one whose start failed) and, with the last one, Pixi's shared pools. */
export function destroyApplication(app: Application): void {
  try {
    // Before its start ends, a drawing has no renderer to destroy
    if ((app as { renderer?: unknown }).renderer !== undefined) app.destroy({ removeView: true }, { children: true });
  } finally {
    alive--;
    if (alive === 0) GlobalResourceRegistry.release();
  }
}
