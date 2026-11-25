// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/PuzzleSlide.cs
// The nested Block class is a module class exposed as a static member, as in QuestData.ts. The puzzles come from
// Valkyrie's Resources/slidepuzzles.txt, copied with the base data (Resources.loadText).
import { Application } from '../platform/Application.ts';
import { NewLine, boolToString, boolTryParse, dictGet, intTryParse, listGet, split } from '../platform/CSharp.ts';
import { Random } from '../platform/Random.ts';
import { Resources } from '../platform/Resources.ts';
import { Vector2 } from '../platform/Vector2.ts';
import { IniRead } from '../ValkyrieTools/IniRead.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { Puzzle } from './Puzzle.ts';

// Valkyrie: PuzzleSlide.cs PuzzleSlide.Block
class Block {
  rotation = false;
  // Length is 0 based (1x1 is len 0)
  xlen = 1;
  ylen = 0;
  xpos = 0;
  ypos = 2;
  target = true;

  /** Block() is the target block; Block(seed) a random one; Block(data) reads a saved one; Block(b) copies b. */
  // Valkyrie: PuzzleSlide.cs Block.Block
  constructor(from?: number | string | Block) {
    if (typeof from === 'number') {
      const seed = from;
      this.target = false;

      this.rotation = (seed & 0x01) === 0;
      let rndData = seed >> 1;

      const length = (rndData % 4) + 1;
      rndData = Math.trunc(rndData / 4);

      const stillpos = rndData % 6;
      rndData = Math.trunc(rndData / 6);

      const movPos = rndData % (6 - length);

      if (this.rotation) {
        this.xpos = stillpos;
        this.ypos = movPos;
        this.xlen = 0;
        this.ylen = length;
      } else {
        this.ypos = stillpos;
        this.xpos = movPos;
        this.xlen = length;
        this.ylen = 0;
      }
    } else if (typeof from === 'string') {
      const vars = split(from, ',');
      this.rotation = boolTryParse(listGet(vars, 0)).value;
      this.xlen = intTryParse(listGet(vars, 1)).value;
      this.ylen = intTryParse(listGet(vars, 2)).value;
      this.xpos = intTryParse(listGet(vars, 3)).value;
      this.ypos = intTryParse(listGet(vars, 4)).value;
      this.target = boolTryParse(listGet(vars, 5)).value;
    } else if (from !== undefined) {
      this.rotation = from.rotation;
      this.xlen = from.xlen;
      this.ylen = from.ylen;
      this.xpos = from.xpos;
      this.ypos = from.ypos;
      this.target = from.target;
    }
  }

  /** Blocks(x, y): whether the block covers that square; Blocks(b) or Blocks(list): whether it overlaps them. */
  // Valkyrie: PuzzleSlide.cs Block.Blocks
  blocks(xOrBlocks: number | Block | readonly Block[], y = 0): boolean {
    if (typeof xOrBlocks === 'number') {
      const x = xOrBlocks;
      if (y < this.ypos) return false;
      if (x < this.xpos) return false;
      if (y > this.ypos + this.ylen) return false;
      if (x > this.xpos + this.xlen) return false;
      return true;
    }
    if (Array.isArray(xOrBlocks)) {
      for (const b of xOrBlocks) {
        if (this.blocks(b)) {
          return true;
        }
      }
      return false;
    }
    const b = xOrBlocks as Block;
    if (b.ypos + b.ylen < this.ypos) return false;
    if (b.xpos + b.xlen < this.xpos) return false;
    if (b.ypos > this.ypos + this.ylen) return false;
    if (b.xpos > this.xpos + this.xlen) return false;
    return true;
  }

  // Valkyrie: PuzzleSlide.cs Block.GetMove
  getMove(dir: number, distance = 1): Vector2 {
    let x = this.xpos;
    let y = this.ypos;
    if (dir > 0) {
      if (this.rotation) {
        y += this.ylen + distance;
      } else {
        x += this.xlen + distance;
      }
    } else {
      if (this.rotation) {
        y -= distance;
      } else {
        x -= distance;
      }
    }

    return new Vector2(x, y);
  }

  // Valkyrie: PuzzleSlide.cs Block.ToString
  toString(): string {
    return boolToString(this.rotation) + ',' + this.xlen + ',' + this.ylen + ',' + this.xpos + ',' + this.ypos + ',' + boolToString(this.target);
  }
}

// Valkyrie: PuzzleSlide.cs PuzzleSlide
export class PuzzleSlide extends Puzzle {
  static readonly Block = Block;

  puzzle: Block[] = [];
  moves = 0;

  /** PuzzleSlide(depth) picks a puzzle of that many moves; PuzzleSlide(data) restores one from a save. */
  // Valkyrie: PuzzleSlide.cs PuzzleSlide.PuzzleSlide
  constructor(depthOrData: number | Map<string, string>) {
    super();
    if (typeof depthOrData !== 'number') {
      this.loadpuzzle(depthOrData);
      return;
    }
    let depth = depthOrData;
    if (depth < 1) {
      depth = 1;
    }
    const options: Map<string, string>[] = [];
    const textAsset = Resources.loadText('slidepuzzles');
    // A missing TextAsset is a NullReferenceException in C#
    if (textAsset === null) throw new TypeError("Cannot read properties of null (reading 'text')");
    const puzzles = IniRead.readFromString(textAsset);

    while (options.length === 0) {
      for (const p of puzzles.data.values()) {
        const moves = intTryParse(dictGet(p, 'moves')).value;
        if (moves === depth) {
          options.push(p);
        }
      }
      depth--;
      if (depth === 0) {
        ValkyrieDebug.log('Error: Unable to find puzzle.');
        Application.quit('slide-puzzle-missing', 'PuzzleSlide', 'Error: Unable to find puzzle.');
      }
    }
    this.loadpuzzle(listGet(options, Random.range(0, options.length)));
    this.moves = 0;
  }

  // Valkyrie: PuzzleSlide.cs PuzzleSlide.Loadpuzzle
  loadpuzzle(data: Map<string, string>): void {
    this.puzzle = [];
    for (const [key, value] of data) {
      if (key === 'moves') {
        this.moves = intTryParse(value).value;
      } else {
        this.puzzle.push(new Block(value));
      }
    }
  }

  // Valkyrie: PuzzleSlide.cs PuzzleSlide.Solved
  solved(): boolean {
    return listGet(this.puzzle, 0).xpos === 6;
  }

  // Valkyrie: PuzzleSlide.cs PuzzleSlide.Empty
  static empty(state: readonly Block[], x: number, y: number): boolean {
    if (x < 0 || y < 0 || y > 5) {
      return false;
    }
    if (x > 5 && y !== 2) {
      return false;
    }
    if (x > 7) {
      return false;
    }
    for (const b of state) {
      if (b.blocks(x, y)) {
        return false;
      }
    }
    return true;
  }

  // Valkyrie: PuzzleSlide.cs PuzzleSlide.ToString
  override toString(id: string): string {
    const nl = NewLine;
    // General quest state block
    let r = '[PuzzleSlide' + id + ']' + nl;
    r += 'moves=' + this.moves + nl;
    for (let i = 0; i < this.puzzle.length; i++) {
      r += 'block' + i + '=' + this.puzzle[i]!.toString() + nl;
    }
    return r + nl;
  }

  // Valkyrie: PuzzleSlide.cs PuzzleSlide.HardCodedPuzzle
  static hardCodedPuzzle(): Map<string, string> {
    const content = new Map<string, string>();
    content.set('moves', '0');
    content.set('block0', 'False,1,0,0,2,True');
    content.set('block1', 'False,2,0,0,1,False');
    content.set('block2', 'True,0,1,5,0,False');
    content.set('block3', 'True,0,1,4,1,False');
    content.set('block4', 'False,3,0,0,5,False');
    content.set('block5', 'False,2,0,0,4,False');
    content.set('block6', 'False,1,0,2,0,False');
    content.set('block7', 'False,4,0,0,3,False');
    content.set('block8', 'True,0,1,5,2,False');
    content.set('block9', 'False,1,0,4,4,False');
    return content;
  }
}

type _Block = Block;
export declare namespace PuzzleSlide {
  type Block = _Block;
}
