// Not in Valkyrie (15 November 2026): when the browser takes the board's WebGL context away, the board is drawn again
// on a new canvas. iPadOS does it when a page runs short of memory (an iPad Air 4 with Strain on Reality, 170 MB): the map
// went black and stayed so, and Pixi only gets a context back when it was the one that let it go. The board draws what
// the game holds each frame, so a new one shows the same table. Not ported from Valkyrie.

/** How many times the board is drawn again within LOSS_WINDOW_MS before the player is told instead. */
export const MAX_REBUILDS = 3;
export const LOSS_WINDOW_MS = 60_000;
/** How long after the loss the new board is made, so that the browser has let go of the old one. */
export const REBUILD_DELAY_MS = 500;

/** Counts the boards drawn again after a loss, so that a page that keeps losing its context does not loop. */
export class LossCounter {
  private times: number[] = [];

  /** Whether the board may be drawn again now; counts it when it may. */
  allow(now: number): boolean {
    this.times = this.times.filter((time) => now - time < LOSS_WINDOW_MS);
    if (this.times.length >= MAX_REBUILDS) return false;
    this.times.push(now);
    return true;
  }
}
