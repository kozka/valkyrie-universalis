// Not ported from Valkyrie: one author mistake in a store entry or a puzzle must not throw (16 October 2026), where
// Valkyrie's C# does.
import { afterEach, describe, expect, it } from 'vitest';
import { Game, PuzzleCode, PuzzleTower, Random, RemoteContentPack, VarOperation } from '../src/index.ts';

describe('RemoteContentPack', () => {
  const saved = (Game as unknown as { game: unknown }).game;
  afterEach(() => {
    (Game as unknown as { game: unknown }).game = saved;
  });

  it('ToString_WithoutImageWritesNoImageLine', () => {
    (Game as unknown as { game: unknown }).game = { gameType: { typeName: () => 'MoM' } };
    const pack = new RemoteContentPack('TLE', new Map([['version', '3']]));
    expect(pack.image).toBeNull();
    expect(pack.toString()).not.toContain('image=');
    expect(pack.toString()).toContain('version=3');
  });
});

describe('PuzzleCode', () => {
  it('Answer_LeavesOutEmptyParts', () => {
    expect(new PuzzleCode(3, 4, '1  2 3 ').answer.state).toEqual([1, 2, 3]);
  });

  it('Answer_WithoutSymbolsWritesAnEmptyCode', () => {
    const puzzle = new PuzzleCode(0, 4, '');
    expect(puzzle.answer.toString()).toBe('');
    puzzle.addGuess([]);
    expect(puzzle.guess[0]!.toString()).toBe('');
    expect(() => puzzle.toString('Lock')).not.toThrow();
  });

  it('Guess_OfAnotherLengthThanTheSolutionIsWrong', () => {
    const puzzle = new PuzzleCode(2, 4, '1 2 3');
    puzzle.addGuess([1, 2]);
    expect(puzzle.solved()).toBe(false);
    expect(puzzle.guess[0]!.correctSpot()).toBe(2);
    expect(puzzle.guess[0]!.correctType()).toBe(0);
    puzzle.addGuess([3, 1, 2, 4]);
    expect(puzzle.solved()).toBe(false);
    expect(puzzle.guess[1]!.correctType()).toBe(3);
  });
});

describe('PuzzleTower', () => {
  it('Level_BelowZeroGivesASolvedPuzzle', () => {
    Random.initState(1);
    const tower = new PuzzleTower(-2);
    expect(tower.puzzle.map((t) => t.length).sort()).toEqual([0, 0, 8]);
  });
});

describe('VarOperation', () => {
  it('Constructor_WithMissingPartsLeavesThemEmpty', () => {
    const op = new VarOperation('$x');
    expect([op.var, op.operation, op.value]).toEqual(['$x', '', '']);
    const op2 = new VarOperation('$x,=');
    expect([op2.var, op2.operation, op2.value]).toEqual(['$x', '=', '']);
  });
});
