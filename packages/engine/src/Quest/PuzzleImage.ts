// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/PuzzleImage.cs
// The nested TilePosition class is a module class exposed as a static member, as in QuestData.ts. Its objects are the
// keys of the state, compared by reference as in C#, which does not override Equals.
import { NewLine, dictAdd, intTryParse, listGet, split, substring } from '../platform/CSharp.ts';
import { Random } from '../platform/Random.ts';
import { Puzzle } from './Puzzle.ts';

// Valkyrie: PuzzleImage.cs PuzzleImage.TilePosition
class TilePosition {
  x = 0;
  y = 0;

  /** TilePosition(x, y), or TilePosition(s) from a saved "x y". */
  // Valkyrie: PuzzleImage.cs TilePosition.TilePosition
  constructor(xIn: number | string, yIn = 0) {
    if (typeof xIn === 'number') {
      this.x = xIn;
      this.y = yIn;
      return;
    }
    const parts = split(xIn, ' ');
    this.x = intTryParse(listGet(parts, 0)).value;
    this.y = intTryParse(listGet(parts, 1)).value;
  }

  // Valkyrie: PuzzleImage.cs TilePosition.ToString
  toString(): string {
    return this.x + ' ' + this.y;
  }
}

// Valkyrie: PuzzleImage.cs PuzzleImage
export class PuzzleImage extends Puzzle {
  static readonly TilePosition = TilePosition;

  /** Where each piece is on the screen (key) and which part of the picture it shows (value). */
  state: Map<TilePosition, TilePosition>;
  moves = 0;

  /** PuzzleImage(x, y) shuffles a picture of x columns and y rows; PuzzleImage(data) restores one from a save. */
  // Valkyrie: PuzzleImage.cs PuzzleImage.PuzzleImage
  constructor(xOrData: number | Map<string, string>, y = 0) {
    super();
    this.state = new Map();
    if (typeof xOrData !== 'number') {
      for (const [key, value] of xOrData) {
        if (key === 'moves') {
          this.moves = intTryParse(value).value;
        }
        if (key === 'state') {
          for (const s of split(value, ':')) {
            const parts = split(s, ',');
            dictAdd(this.state, new TilePosition(listGet(parts, 0)), new TilePosition(listGet(parts, 1)));
          }
        }
      }
      return;
    }
    const x = xOrData;

    const list: TilePosition[] = [];
    for (let i = 0; i < x; i++) {
      for (let j = 0; j < y; j++) {
        list.splice(Random.range(0, list.length), 0, new TilePosition(i, j));
      }
    }

    let count = 0;
    for (let i = 0; i < x; i++) {
      for (let j = 0; j < y; j++) {
        dictAdd(this.state, new TilePosition(i, j), listGet(list, count++));
      }
    }
  }

  // Valkyrie: PuzzleImage.cs PuzzleImage.Solved
  solved(): boolean {
    for (const [key, value] of this.state) {
      if (key.x !== value.x) {
        return false;
      }
      if (key.y !== value.y) {
        return false;
      }
    }
    return true;
  }

  // Valkyrie: PuzzleImage.cs PuzzleImage.ToString
  override toString(id: string): string {
    const nl = NewLine;
    let r = '[PuzzleImage' + id + ']' + nl;
    r += 'moves=' + this.moves.toString() + nl;

    r += 'state=';
    for (const [key, value] of this.state) {
      r += key.toString() + ',' + value.toString() + ':';
    }
    r = substring(r, 0, r.length - 1) + nl;

    return r + nl;
  }
}

type _TilePosition = TilePosition;
export declare namespace PuzzleImage {
  type TilePosition = _TilePosition;
}
