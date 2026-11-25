// Pixi's shared pools go with the last drawing alive (board/pixiApps.ts). Not ported from Valkyrie.
import { describe, expect, it, vi } from 'vitest';

const release = vi.fn();
vi.mock('pixi.js', () => ({
  GlobalResourceRegistry: { release },
  Application: class {
    renderer: unknown = undefined;
    destroy = vi.fn();
  },
}));

const { destroyApplication, newApplication } = await import('../src/board/pixiApps.ts');

describe('the drawings sharing Pixi', () => {
  it('release the shared pools only with the last one alive', () => {
    const board = newApplication();
    const room = newApplication();
    (board as unknown as { renderer: unknown }).renderer = {};
    // The board goes first, as when a game is left from the investigators: the room still draws
    destroyApplication(board);
    expect(board.destroy).toHaveBeenCalledOnce();
    expect(release).not.toHaveBeenCalled();
    // A drawing whose start failed has nothing to destroy, but still counts
    destroyApplication(room);
    expect(room.destroy).not.toHaveBeenCalled();
    expect(release).toHaveBeenCalledOnce();
  });
});
