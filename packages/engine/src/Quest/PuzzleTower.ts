// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/PuzzleTower.cs
// The overloads of MoveOK and Move take the state as an optional last argument.
import { NewLine, intTryParse, listGet, split, substring } from '../platform/CSharp.ts';
import { Random } from '../platform/Random.ts';
import { Puzzle } from './Puzzle.ts';

// Valkyrie: PuzzleTower.cs PuzzleTower
export class PuzzleTower extends Puzzle {
  puzzle: number[][] = [];
  moves = 0;

  /** PuzzleTower(depth) builds a puzzle that takes that many moves at least; PuzzleTower(data) restores one from a save. */
  // Valkyrie: PuzzleTower.cs PuzzleTower.PuzzleTower
  constructor(depthOrData: number | Map<string, string>) {
    super();
    if (typeof depthOrData !== 'number') {
      this.loadpuzzle(depthOrData);
      return;
    }
    // Not in Valkyrie (16 October 2026): eight blocks are never more than 255 moves from solved, so a puzzlelevel outside
    // 0-255 had no puzzle and threw; it is clamped
    const options = this.buildPuzzles(Math.min(Math.max(depthOrData, 0), 255));
    const p = listGet(options, Random.range(0, options.length));

    // Randomise tower order
    this.puzzle = [];
    let pos = Random.range(0, 3);
    this.puzzle.push(listGet(p, pos));
    p.splice(pos, 1);
    pos = Random.range(0, 2);
    this.puzzle.push(listGet(p, pos));
    p.splice(pos, 1);
    this.puzzle.push(listGet(p, 0));
  }

  /** The puzzles that take `depth` moves at least to solve. */
  // Valkyrie: PuzzleTower.cs PuzzleTower.BuildPuzzles
  protected buildPuzzles(depth: number): number[][][] {
    // End puzzle state
    const end: number[][] = [[], [], []];

    for (let i = 0; i < 8; i++) {
      end[0]!.push(7 - i);
    }

    const allStates: number[][][][] = [];
    allStates.push([]);
    allStates[0]!.push(end);

    for (let currentLevel = 0; currentLevel < depth; currentLevel++) {
      allStates.push([]);
      for (const state of allStates[currentLevel]!) {
        this.addStates(state, allStates);
      }
    }

    return listGet(allStates, depth);
  }

  // Valkyrie: PuzzleTower.cs PuzzleTower.AddStates
  protected addStates(state: number[][], allStates: number[][][][]): void {
    for (let i = 0; i < state.length; i++) {
      if (!this.reverseMoveOK(i, state)) continue;

      for (let j = 0; j < state.length; j++) {
        if (j === i) continue;

        const newState = this.copyState(state);
        newState[j]!.push(listGet(state[i]!, state[i]!.length - 1));
        newState[i]!.splice(state[i]!.length - 1, 1);
        let uniqueState = true;
        for (const level of allStates) {
          for (const oldState of level) {
            if (this.equal(newState, oldState)) {
              uniqueState = false;
            }
          }
        }
        if (uniqueState) {
          allStates[allStates.length - 1]!.push(newState);
        }
      }
    }
  }

  // Valkyrie: PuzzleTower.cs PuzzleTower.CopyState
  copyState(state: readonly (readonly number[])[]): number[][] {
    const copy: number[][] = [];
    for (let i = 0; i < state.length; i++) {
      copy.push([]);
      for (let j = 0; j < state[i]!.length; j++) {
        copy[i]!.push(state[i]![j]!);
      }
    }
    return copy;
  }

  // Valkyrie: PuzzleTower.cs PuzzleTower.Equal (which compares the first state's count with itself)
  protected equal(state: number[][], stateTwo: number[][]): boolean {
    for (let i = 0; i < state.length; i++) {
      if (state[i]!.length !== listGet(stateTwo, i).length) return false;
      for (let j = 0; j < state[i]!.length; j++) {
        if (state[i]![j] !== stateTwo[i]![j]) return false;
      }
    }
    return true;
  }

  // Valkyrie: PuzzleTower.cs PuzzleTower.Loadpuzzle
  protected loadpuzzle(data: Map<string, string>): void {
    this.puzzle = [[], [], []];

    for (const [key, value] of data) {
      if (key === 'moves') {
        this.moves = intTryParse(value).value;
      } else {
        const tower = intTryParse(key).value;

        for (const s of split(value, ' ', undefined, true)) {
          const size = intTryParse(s).value;
          listGet(this.puzzle, tower).push(size);
        }
      }
    }
  }

  // Valkyrie: PuzzleTower.cs PuzzleTower.Solved
  solved(): boolean {
    for (const list of this.puzzle) {
      if (list.length > 0 && list.length < 8) return false;
      let lastSize = 10;
      for (const size of list) {
        if (size > lastSize) return false;
        lastSize = size;
      }
    }

    return true;
  }

  /** Whether moving the top block of one tower onto another is legal, in the puzzle or in the state given. */
  // Valkyrie: PuzzleTower.cs PuzzleTower.MoveOK
  moveOK(fromTower: number, toTower: number, p: readonly (readonly number[])[] = this.puzzle): boolean {
    if (p.length <= fromTower) return false;
    if (fromTower < 0) return false;
    if (p[fromTower]!.length === 0) return false;
    if (p.length <= toTower) return false;
    if (toTower < 0) return false;
    if (p[toTower]!.length === 0) return true;

    const fromSize = p[fromTower]![p[fromTower]!.length - 1]!;
    const toSize = p[toTower]![p[toTower]!.length - 1]!;
    return fromSize < toSize;
  }

  // Valkyrie: PuzzleTower.cs PuzzleTower.ReverseMoveOK
  reverseMoveOK(fromTower: number, p: readonly (readonly number[])[]): boolean {
    if (p.length <= fromTower) return false;
    if (fromTower < 0) return false;
    if (p[fromTower]!.length === 0) return false;
    if (p[fromTower]!.length === 1) return true;

    const moveSize = p[fromTower]![p[fromTower]!.length - 1]!;
    const baseSize = p[fromTower]![p[fromTower]!.length - 2]!;
    return moveSize < baseSize;
  }

  /** Moves the top block of one tower onto another if that is legal, in the puzzle or in the state given. */
  // Valkyrie: PuzzleTower.cs PuzzleTower.Move
  move(fromTower: number, toTower: number, p: number[][] = this.puzzle): void {
    if (!this.moveOK(fromTower, toTower, p)) return;

    p[toTower]!.push(p[fromTower]![p[fromTower]!.length - 1]!);
    p[fromTower]!.splice(p[fromTower]!.length - 1, 1);
  }

  // Valkyrie: PuzzleTower.cs PuzzleTower.ToString
  override toString(id: string): string {
    const nl = NewLine;
    // General quest state block
    let r = '[PuzzleTower' + id + ']' + nl;
    r += 'moves=' + this.moves + nl;
    for (let i = 0; i < this.puzzle.length; i++) {
      r += i + '=';
      for (const size of this.puzzle[i]!) {
        r += size + ' ';
      }
      r = substring(r, 0, r.length - 1) + nl;
    }
    return r + nl;
  }
}
