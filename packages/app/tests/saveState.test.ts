// The calm autosave is skipped when nothing but the clock changed (play/saveState.ts); the board is drawn again a few
// times after losing its WebGL context, and then the player is told (board/contextLoss.ts). Not ported from Valkyrie.
import { describe, expect, it } from 'vitest';
import { LOSS_WINDOW_MS, LossCounter, MAX_REBUILDS } from '../src/board/contextLoss.ts';
import { saveState } from '../src/play/saveState.ts';

const ini = (time: string, duration: number, round: number) =>
  `[Quest]\r\ntime=${time}\r\nduration=${duration}\r\nvalkyrie=3.13\r\nround=${round}\r\n[Vars]\r\ntime=7\r\n`;
const notes = (text: string) => new Map([['universalis-notes.txt', new TextEncoder().encode(text)]]);

describe('what a save keeps of the game', () => {
  it('leaves out the clock', () => {
    expect(saveState(ini('11/15/2026 22:00:00', 30, 18), new Map())).toBe(saveState(ini('11/15/2026 22:01:00', 31, 18), new Map()));
  });

  it('keeps everything else, also a variable called time', () => {
    expect(saveState(ini('a', 30, 18), new Map())).not.toBe(saveState(ini('a', 30, 19), new Map()));
    expect(saveState(ini('a', 30, 18), new Map())).toContain('time=7');
  });

  it('keeps the files saved beside it, such as the notes', () => {
    expect(saveState(ini('a', 30, 18), notes('one'))).not.toBe(saveState(ini('a', 30, 18), notes('two')));
    expect(saveState(ini('a', 30, 18), notes('one'))).toBe(saveState(ini('b', 31, 18), notes('one')));
  });
});

describe('the board lost again and again', () => {
  it('is drawn again a few times a minute, then not', () => {
    const losses = new LossCounter();
    for (let i = 0; i < MAX_REBUILDS; i++) expect(losses.allow(i * 1000)).toBe(true);
    expect(losses.allow(MAX_REBUILDS * 1000)).toBe(false);
    // A minute after the first, one more may go
    expect(losses.allow(LOSS_WINDOW_MS)).toBe(true);
  });
});
