// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/PuzzleTests.cs
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PuzzleImage, PuzzleSlide, PuzzleTower, ValkyrieDebug } from '../src/index.ts';

/** Creates a tower state from arrays of disc sizes */
function createTowerState(tower0: number[], tower1: number[], tower2: number[]): number[][] {
  return [[...tower0], [...tower1], [...tower2]];
}

/** Creates a PuzzleTower from a given state using the dictionary constructor */
function createPuzzleTowerFromState(state: number[][]): PuzzleTower {
  const data = new Map<string, string>([['moves', '0']]);

  for (let i = 0; i < state.length; i++) {
    if (state[i]!.length > 0) {
      data.set(i.toString(), state[i]!.join(' '));
    } else {
      data.set(i.toString(), '');
    }
  }

  return new PuzzleTower(data);
}

/**
 * Unit tests for Puzzle classes - PuzzleSlide, PuzzleTower, and PuzzleImage
 * Tests cover pure logic methods avoiding Unity-dependent code paths
 */
describe('PuzzleTests', () => {
  beforeEach(() => {
    // Disable ValkyrieDebug to prevent Unity logging during tests
    ValkyrieDebug.enabled = false;
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
  });

  // PuzzleSlide.Block Tests

  it('Block_ConstructFromString_ParsesAllFieldsCorrectly', () => {
    const block = new PuzzleSlide.Block('True,2,1,3,4,False');

    expect(block.rotation).toBe(true);
    expect(block.xlen).toBe(2);
    expect(block.ylen).toBe(1);
    expect(block.xpos).toBe(3);
    expect(block.ypos).toBe(4);
    expect(block.target).toBe(false);
  });

  it('Block_ConstructFromString_TargetBlockParsesCorrectly', () => {
    const block = new PuzzleSlide.Block('False,1,0,0,2,True');

    expect(block.rotation).toBe(false);
    expect(block.xlen).toBe(1);
    expect(block.ylen).toBe(0);
    expect(block.xpos).toBe(0);
    expect(block.ypos).toBe(2);
    expect(block.target).toBe(true);
  });

  it('Block_ToString_ProducesCorrectFormat', () => {
    const block = new PuzzleSlide.Block('True,2,1,3,4,False');

    expect(block.toString()).toBe('True,2,1,3,4,False');
  });

  it('Block_CopyConstructor_CreatesIndependentCopy', () => {
    const original = new PuzzleSlide.Block('True,2,1,3,4,False');

    const copy = new PuzzleSlide.Block(original);
    copy.xpos = 99;

    expect(original.xpos).toBe(3);
    expect(copy.xpos).toBe(99);
    expect(copy.rotation).toBe(original.rotation);
    expect(copy.xlen).toBe(original.xlen);
    expect(copy.ylen).toBe(original.ylen);
  });

  it('Block_Blocks_SingleCell_ReturnsTrueForOverlappingPosition', () => {
    // 1x1 block at position (2, 2)
    const block = new PuzzleSlide.Block('False,0,0,2,2,False');

    expect(block.blocks(2, 2)).toBe(true);
    expect(block.blocks(1, 2)).toBe(false);
    expect(block.blocks(3, 2)).toBe(false);
    expect(block.blocks(2, 1)).toBe(false);
    expect(block.blocks(2, 3)).toBe(false);
  });

  it('Block_Blocks_HorizontalBlock_ReturnsTrueForAllCoveredPositions', () => {
    // 3x1 horizontal block (xlen=2) at position (1, 3)
    const block = new PuzzleSlide.Block('False,2,0,1,3,False');

    expect(block.blocks(1, 3)).toBe(true);
    expect(block.blocks(2, 3)).toBe(true);
    expect(block.blocks(3, 3)).toBe(true);
    expect(block.blocks(0, 3)).toBe(false);
    expect(block.blocks(4, 3)).toBe(false);
    expect(block.blocks(2, 2)).toBe(false);
  });

  it('Block_Blocks_VerticalBlock_ReturnsTrueForAllCoveredPositions', () => {
    // 1x3 vertical block (ylen=2) at position (4, 1)
    const block = new PuzzleSlide.Block('True,0,2,4,1,False');

    expect(block.blocks(4, 1)).toBe(true);
    expect(block.blocks(4, 2)).toBe(true);
    expect(block.blocks(4, 3)).toBe(true);
    expect(block.blocks(4, 0)).toBe(false);
    expect(block.blocks(4, 4)).toBe(false);
    expect(block.blocks(3, 2)).toBe(false);
  });

  it('Block_BlocksOtherBlock_ReturnsTrueWhenOverlapping', () => {
    const block1 = new PuzzleSlide.Block('False,2,0,1,2,False'); // Horizontal at (1,2) spanning to (3,2)
    const block2 = new PuzzleSlide.Block('True,0,2,2,1,False'); // Vertical at (2,1) spanning to (2,3)

    // they overlap at (2,2)
    expect(block1.blocks(block2)).toBe(true);
    expect(block2.blocks(block1)).toBe(true);
  });

  it('Block_BlocksOtherBlock_ReturnsFalseWhenNotOverlapping', () => {
    const block1 = new PuzzleSlide.Block('False,1,0,0,0,False'); // Horizontal at (0,0) to (1,0)
    const block2 = new PuzzleSlide.Block('False,1,0,3,3,False'); // Horizontal at (3,3) to (4,3)

    expect(block1.blocks(block2)).toBe(false);
    expect(block2.blocks(block1)).toBe(false);
  });

  it('Block_BlocksList_ReturnsTrueIfAnyBlockOverlaps', () => {
    const testBlock = new PuzzleSlide.Block('False,1,0,2,2,False'); // At (2,2) to (3,2)
    const blockList = [
      new PuzzleSlide.Block('False,0,0,0,0,False'), // At (0,0)
      new PuzzleSlide.Block('False,0,0,3,2,False'), // At (3,2) - overlaps!
      new PuzzleSlide.Block('False,0,0,5,5,False'), // At (5,5)
    ];

    expect(testBlock.blocks(blockList)).toBe(true);
  });

  it('Block_BlocksList_ReturnsFalseIfNoBlockOverlaps', () => {
    const testBlock = new PuzzleSlide.Block('False,0,0,2,2,False'); // At (2,2)
    const blockList = [
      new PuzzleSlide.Block('False,0,0,0,0,False'), // At (0,0)
      new PuzzleSlide.Block('False,0,0,4,4,False'), // At (4,4)
      new PuzzleSlide.Block('False,0,0,5,5,False'), // At (5,5)
    ];

    expect(testBlock.blocks(blockList)).toBe(false);
  });

  // PuzzleSlide Static Methods Tests

  it('PuzzleSlide_Empty_ReturnsFalseForNegativeCoordinates', () => {
    const emptyState: PuzzleSlide.Block[] = [];

    expect(PuzzleSlide.empty(emptyState, -1, 0)).toBe(false);
    expect(PuzzleSlide.empty(emptyState, 0, -1)).toBe(false);
    expect(PuzzleSlide.empty(emptyState, -1, -1)).toBe(false);
  });

  it('PuzzleSlide_Empty_ReturnsFalseForOutOfBoundsY', () => {
    const emptyState: PuzzleSlide.Block[] = [];

    expect(PuzzleSlide.empty(emptyState, 0, 6)).toBe(false); // y > 5
    expect(PuzzleSlide.empty(emptyState, 0, 5)).toBe(true); // y = 5 is valid
  });

  it('PuzzleSlide_Empty_AllowsExitOnlyOnRow2', () => {
    const emptyState: PuzzleSlide.Block[] = [];

    // x > 5 only allowed when y == 2 (exit row)
    expect(PuzzleSlide.empty(emptyState, 6, 0)).toBe(false); // y != 2
    expect(PuzzleSlide.empty(emptyState, 6, 1)).toBe(false); // y != 2
    expect(PuzzleSlide.empty(emptyState, 6, 2)).toBe(true); // y == 2, exit allowed
    expect(PuzzleSlide.empty(emptyState, 7, 2)).toBe(true); // y == 2, still in exit
    expect(PuzzleSlide.empty(emptyState, 8, 2)).toBe(false); // x > 7, beyond exit
    expect(PuzzleSlide.empty(emptyState, 6, 3)).toBe(false); // y != 2
  });

  it('PuzzleSlide_Empty_ReturnsFalseWhenBlockOccupiesPosition', () => {
    const state = [
      new PuzzleSlide.Block('False,1,0,2,2,True'), // Block at (2,2) to (3,2)
    ];

    expect(PuzzleSlide.empty(state, 2, 2)).toBe(false);
    expect(PuzzleSlide.empty(state, 3, 2)).toBe(false);
    expect(PuzzleSlide.empty(state, 1, 2)).toBe(true);
    expect(PuzzleSlide.empty(state, 4, 2)).toBe(true);
  });

  it('PuzzleSlide_HardCodedPuzzle_ReturnsValidPuzzleData', () => {
    const puzzleData = PuzzleSlide.hardCodedPuzzle();

    expect(puzzleData).not.toBeNullable();
    expect(puzzleData.has('moves')).toBe(true);
    expect(puzzleData.has('block0')).toBe(true);
    expect(puzzleData.get('moves')).toBe('0');
    expect(puzzleData.get('block0')).toBe('False,1,0,0,2,True'); // Target block
  });

  // PuzzleSlide Instance Tests

  it('PuzzleSlide_Loadpuzzle_LoadsBlocksAndMoves', () => {
    const data = new Map([
      ['moves', '5'],
      ['block0', 'False,1,0,0,2,True'],
      ['block1', 'True,0,1,3,0,False'],
    ]);

    const puzzle = new PuzzleSlide(data);

    expect(puzzle.moves).toBe(5);
    expect(puzzle.puzzle.length).toBe(2);
  });

  it('PuzzleSlide_Solved_ReturnsTrueWhenTargetAtExit', () => {
    // Target block at x=6 (exit position)
    const data = new Map([
      ['moves', '0'],
      ['block0', 'False,1,0,6,2,True'], // Target at exit
    ]);

    const puzzle = new PuzzleSlide(data);

    expect(puzzle.solved()).toBe(true);
  });

  it('PuzzleSlide_Solved_ReturnsFalseWhenTargetNotAtExit', () => {
    // Target block not at exit
    const data = new Map([
      ['moves', '0'],
      ['block0', 'False,1,0,0,2,True'], // Target at x=0
    ]);

    const puzzle = new PuzzleSlide(data);

    expect(puzzle.solved()).toBe(false);
  });

  it('PuzzleSlide_ToString_ProducesValidSaveFormat', () => {
    const data = new Map([
      ['moves', '3'],
      ['block0', 'False,1,0,0,2,True'],
    ]);
    const puzzle = new PuzzleSlide(data);

    const result = puzzle.toString('TestPuzzle');

    expect(result).toContain('[PuzzleSlideTestPuzzle]');
    expect(result).toContain('moves=3');
    expect(result).toContain('block0=');
  });

  // PuzzleTower Tests

  it('PuzzleTower_MoveOK_ReturnsFalseForInvalidFromTower', () => {
    const puzzle = createPuzzleTowerFromState(createTowerState([3, 2, 1], [], []));

    expect(puzzle.moveOK(-1, 1)).toBe(false);
    expect(puzzle.moveOK(3, 1)).toBe(false);
    expect(puzzle.moveOK(10, 1)).toBe(false);
  });

  it('PuzzleTower_MoveOK_ReturnsFalseForInvalidToTower', () => {
    const puzzle = createPuzzleTowerFromState(createTowerState([3, 2, 1], [], []));

    expect(puzzle.moveOK(0, -1)).toBe(false);
    expect(puzzle.moveOK(0, 3)).toBe(false);
    expect(puzzle.moveOK(0, 10)).toBe(false);
  });

  it('PuzzleTower_MoveOK_ReturnsFalseForEmptyFromTower', () => {
    const puzzle = createPuzzleTowerFromState(createTowerState([], [3, 2, 1], []));

    expect(puzzle.moveOK(0, 1)).toBe(false); // Tower 0 is empty
  });

  it('PuzzleTower_MoveOK_ReturnsTrueForMoveToEmptyTower', () => {
    const puzzle = createPuzzleTowerFromState(createTowerState([3, 2, 1], [], []));

    expect(puzzle.moveOK(0, 1)).toBe(true); // Move from tower with discs to empty tower
    expect(puzzle.moveOK(0, 2)).toBe(true);
  });

  it('PuzzleTower_MoveOK_ReturnsTrueForSmallerOntoLarger', () => {
    // Tower 0 has disc 1 (small), Tower 1 has disc 3 (large)
    const puzzle = createPuzzleTowerFromState(createTowerState([1], [3], []));

    expect(puzzle.moveOK(0, 1)).toBe(true); // Small (1) onto large (3)
  });

  it('PuzzleTower_MoveOK_ReturnsFalseForLargerOntoSmaller', () => {
    // Tower 0 has disc 3 (large), Tower 1 has disc 1 (small)
    const puzzle = createPuzzleTowerFromState(createTowerState([3], [1], []));

    expect(puzzle.moveOK(0, 1)).toBe(false); // Large (3) onto small (1)
  });

  it('PuzzleTower_Move_MovesDiscCorrectly', () => {
    const puzzle = createPuzzleTowerFromState(createTowerState([3, 2, 1], [], []));

    puzzle.move(0, 1);

    expect(puzzle.puzzle[0]!.length).toBe(2);
    expect(puzzle.puzzle[1]!.length).toBe(1);
    expect(puzzle.puzzle[1]![0]).toBe(1); // Disc 1 moved to tower 1
  });

  it('PuzzleTower_Move_DoesNothingForInvalidMove', () => {
    // Tower 0 has large disc, Tower 1 has small disc
    const puzzle = createPuzzleTowerFromState(createTowerState([3], [1], []));

    puzzle.move(0, 1); // Invalid: larger onto smaller

    // state unchanged
    expect(puzzle.puzzle[0]!.length).toBe(1);
    expect(puzzle.puzzle[0]![0]).toBe(3);
    expect(puzzle.puzzle[1]!.length).toBe(1);
    expect(puzzle.puzzle[1]![0]).toBe(1);
  });

  it('PuzzleTower_Solved_ReturnsTrueWhenAllDiscsOnOneTowerInOrder', () => {
    // All 8 discs on tower 0, largest to smallest
    const puzzle = createPuzzleTowerFromState(createTowerState([7, 6, 5, 4, 3, 2, 1, 0], [], []));

    expect(puzzle.solved()).toBe(true);
  });

  it('PuzzleTower_Solved_ReturnsFalseWhenDiscsSpreadAcrossTowers', () => {
    const puzzle = createPuzzleTowerFromState(createTowerState([7, 6, 5, 4], [3, 2, 1, 0], []));

    expect(puzzle.solved()).toBe(false);
  });

  it('PuzzleTower_Solved_ReturnsFalseWhenDiscsOutOfOrder', () => {
    // Discs on one tower but out of order (larger on smaller)
    const puzzle = createPuzzleTowerFromState(createTowerState([1, 2, 3], [], []));

    expect(puzzle.solved()).toBe(false);
  });

  it('PuzzleTower_CopyState_CreatesIndependentCopy', () => {
    const puzzle = createPuzzleTowerFromState(createTowerState([3, 2, 1], [5, 4], []));

    const copy = puzzle.copyState(puzzle.puzzle);
    copy[0]!.push(99);
    copy[1]!.splice(0, 1);

    // original unchanged
    expect(puzzle.puzzle[0]!.length).toBe(3);
    expect(puzzle.puzzle[1]!.length).toBe(2);
  });

  it('PuzzleTower_ReverseMoveOK_ReturnsFalseForInvalidTower', () => {
    const puzzle = createPuzzleTowerFromState(createTowerState([3, 2, 1], [], []));

    expect(puzzle.reverseMoveOK(-1, puzzle.puzzle)).toBe(false);
    expect(puzzle.reverseMoveOK(3, puzzle.puzzle)).toBe(false);
  });

  it('PuzzleTower_ReverseMoveOK_ReturnsFalseForEmptyTower', () => {
    const puzzle = createPuzzleTowerFromState(createTowerState([], [3, 2, 1], []));

    expect(puzzle.reverseMoveOK(0, puzzle.puzzle)).toBe(false);
  });

  it('PuzzleTower_ReverseMoveOK_ReturnsTrueForSingleDisc', () => {
    const puzzle = createPuzzleTowerFromState(createTowerState([3], [], []));

    expect(puzzle.reverseMoveOK(0, puzzle.puzzle)).toBe(true);
  });

  it('PuzzleTower_ReverseMoveOK_ReturnsTrueWhenTopSmallerThanBase', () => {
    // Properly stacked: 3 (bottom), 1 (top)
    const puzzle = createPuzzleTowerFromState(createTowerState([3, 1], [], []));

    expect(puzzle.reverseMoveOK(0, puzzle.puzzle)).toBe(true);
  });

  it('PuzzleTower_ToString_ProducesValidSaveFormat', () => {
    const puzzle = createPuzzleTowerFromState(createTowerState([3, 2, 1], [5, 4], []));
    puzzle.moves = 7;

    const result = puzzle.toString('TestTower');

    expect(result).toContain('[PuzzleTowerTestTower]');
    expect(result).toContain('moves=7');
    expect(result).toContain('0=3 2 1');
    expect(result).toContain('1=5 4');
  });

  it('PuzzleTower_Loadpuzzle_RestoresStateCorrectly', () => {
    const data = new Map([
      ['moves', '15'],
      ['0', '7 6 5'],
      ['1', '4 3'],
      ['2', '2 1 0'],
    ]);

    const puzzle = new PuzzleTower(data);

    expect(puzzle.moves).toBe(15);
    expect(puzzle.puzzle[0]!.length).toBe(3);
    expect(puzzle.puzzle[0]![0]).toBe(7);
    expect(puzzle.puzzle[1]!.length).toBe(2);
    expect(puzzle.puzzle[2]!.length).toBe(3);
  });

  // PuzzleImage.TilePosition Tests

  it('TilePosition_ConstructFromInts_SetsCoordinatesCorrectly', () => {
    const pos = new PuzzleImage.TilePosition(3, 5);

    expect(pos.x).toBe(3);
    expect(pos.y).toBe(5);
  });

  it('TilePosition_ConstructFromString_ParsesCorrectly', () => {
    const pos = new PuzzleImage.TilePosition('4 7');

    expect(pos.x).toBe(4);
    expect(pos.y).toBe(7);
  });

  it('TilePosition_ToString_ProducesCorrectFormat', () => {
    const pos = new PuzzleImage.TilePosition(2, 8);

    expect(pos.toString()).toBe('2 8');
  });

  it('TilePosition_RoundTrip_PreservesValues', () => {
    const original = new PuzzleImage.TilePosition(6, 3);

    const serialized = original.toString();
    const restored = new PuzzleImage.TilePosition(serialized);

    expect(restored.x).toBe(original.x);
    expect(restored.y).toBe(original.y);
  });

  // PuzzleImage Tests

  it('PuzzleImage_Solved_ReturnsTrueWhenAllTilesInPlace', () => {
    // Create a solved puzzle state manually
    const data = new Map([
      ['moves', '0'],
      ['state', '0 0,0 0:0 1,0 1:1 0,1 0:1 1,1 1'],
    ]);

    const puzzle = new PuzzleImage(data);

    expect(puzzle.solved()).toBe(true);
  });

  it('PuzzleImage_Solved_ReturnsFalseWhenTilesSwapped', () => {
    // Create puzzle with swapped tiles
    const data = new Map([
      ['moves', '5'],
      ['state', '0 0,0 1:0 1,0 0:1 0,1 0:1 1,1 1'], // First two tiles swapped
    ]);

    const puzzle = new PuzzleImage(data);

    expect(puzzle.solved()).toBe(false);
  });

  it('PuzzleImage_LoadFromDictionary_RestoresMoves', () => {
    const data = new Map([
      ['moves', '42'],
      ['state', '0 0,0 0'],
    ]);

    const puzzle = new PuzzleImage(data);

    expect(puzzle.moves).toBe(42);
  });

  it('PuzzleImage_ToString_ProducesValidSaveFormat', () => {
    const data = new Map([
      ['moves', '10'],
      ['state', '0 0,0 0:0 1,0 1'],
    ]);
    const puzzle = new PuzzleImage(data);

    const result = puzzle.toString('TestImage');

    expect(result).toContain('[PuzzleImageTestImage]');
    expect(result).toContain('moves=10');
    expect(result).toContain('state=');
  });
});
