// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/PuzzleCode.cs
// The nested Answer and CodeGuess classes are module classes exposed as static members, as in QuestData.ts.
import { NewLine, intTryParse, listGet, split, substring } from '../platform/CSharp.ts';
import { Random } from '../platform/Random.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { Puzzle } from './Puzzle.ts';

// Valkyrie: PuzzleCode.cs PuzzleCode.Answer
class Answer {
  state: number[];

  /** Answer(items, options) draws a random code; Answer(s) reads a saved one, such as "1 3 5 4". */
  // Valkyrie: PuzzleCode.cs Answer.Answer
  constructor(itemsOrS: number | string, options = 0) {
    this.state = [];
    if (typeof itemsOrS === 'number') {
      for (let i = 0; i < itemsOrS; i++) {
        this.state.push(Random.range(0, options) + 1);
      }
      return;
    }
    // Not in Valkyrie (16 October 2026): empty parts (a double or trailing space in puzzlesolution) are left out, not read as 0
    for (const part of split(itemsOrS, ' ', undefined, true)) {
      this.state.push(intTryParse(part).value);
    }
  }

  // Valkyrie: PuzzleCode.cs Answer.ToString
  toString(): string {
    let r = '';
    for (const i of this.state) {
      r += i + ' ';
    }
    // Not in Valkyrie (16 October 2026): an empty code (puzzlelevel=0) gives "" instead of throwing
    if (r.length > 0) r = substring(r, 0, r.length - 1);
    return r;
  }
}

// Valkyrie: PuzzleCode.cs PuzzleCode.CodeGuess
class CodeGuess {
  private readonly answer: Answer;
  guess: number[];

  /** CodeGuess(a, g) keeps the list it is given; CodeGuess(a, "4 5 6") reads a saved guess. */
  // Valkyrie: PuzzleCode.cs CodeGuess.CodeGuess
  constructor(a: Answer, g: number[] | string) {
    this.answer = a;
    if (typeof g !== 'string') {
      this.guess = g;
      return;
    }
    this.guess = [];
    for (const s of split(g, ' ')) {
      this.guess.push(intTryParse(s).value);
    }
  }

  // Not in Valkyrie (16 October 2026): below, a guess and a solution of different lengths compare as different instead of throwing
  // Valkyrie: PuzzleCode.cs CodeGuess.Correct
  correct(): boolean {
    for (let i = 0; i < this.answer.state.length; i++) {
      if (this.answer.state[i] !== this.guess[i]) {
        return false;
      }
    }
    return true;
  }

  // Valkyrie: PuzzleCode.cs CodeGuess.CorrectSpot
  correctSpot(): number {
    let r = 0;
    for (let i = 0; i < this.answer.state.length; i++) {
      if (this.answer.state[i] === this.guess[i]) {
        r++;
      }
    }
    return r;
  }

  // Valkyrie: PuzzleCode.cs CodeGuess.CorrectType
  correctType(): number {
    let r = 0;
    const used = new Array<boolean>(this.answer.state.length).fill(false);

    for (let i = 0; i < this.guess.length; i++) {
      if (this.guess[i] === this.answer.state[i]) continue;

      for (let j = 0; j < this.answer.state.length; j++) {
        if (i === j) continue;
        if (used[j]) continue;
        if (this.answer.state[j] === this.guess[j]) continue;

        if (this.answer.state[j] === this.guess[i]) {
          r++;
          used[j] = true;
          break;
        }
      }
    }
    return r;
  }

  // Valkyrie: PuzzleCode.cs CodeGuess.ToString
  toString(): string {
    let r = '';
    for (const i of this.guess) {
      r += i + ' ';
    }
    // Not in Valkyrie (16 October 2026): an empty guess (puzzlelevel=0) gives "" instead of throwing
    if (r.length > 0) r = substring(r, 0, r.length - 1);
    return r;
  }
}

// Valkyrie: PuzzleCode.cs PuzzleCode
export class PuzzleCode extends Puzzle {
  static readonly Answer = Answer;
  static readonly CodeGuess = CodeGuess;

  answer: Answer = null as unknown as Answer;
  guess: CodeGuess[];

  /** PuzzleCode(items, options, solution) starts a puzzle; PuzzleCode(data) restores one from a save. */
  // Valkyrie: PuzzleCode.cs PuzzleCode.PuzzleCode
  constructor(itemsOrData: number | Map<string, string>, options = 0, solution = '') {
    super();
    this.guess = [];
    if (typeof itemsOrData === 'number') {
      // Initialize puzzle answer depending on whether we have a pre-determined solution or not.
      if (solution.length > 0) {
        ValkyrieDebug.log('Setting solution to ' + solution);
        this.answer = new Answer(solution);
      } else {
        this.answer = new Answer(itemsOrData, options);
      }
      return;
    }

    const guessString: string[] = [];
    for (const [key, value] of itemsOrData) {
      if (key === 'answer') {
        this.answer = new Answer(value);
      }
      if (key === 'guess') {
        for (const s of split(value, ',')) {
          guessString.push(s);
        }
      }
    }
    for (const s of guessString) {
      this.guess.push(new CodeGuess(this.answer, s));
    }
  }

  // Valkyrie: PuzzleCode.cs PuzzleCode.AddGuess
  addGuess(g: number[]): void {
    this.guess.push(new CodeGuess(this.answer, g));
  }

  // Valkyrie: PuzzleCode.cs PuzzleCode.Solved
  solved(): boolean {
    if (this.guess.length === 0) {
      return false;
    }
    if (listGet(this.guess, this.guess.length - 1).correct()) {
      return true;
    }
    return false;
  }

  // Valkyrie: PuzzleCode.cs PuzzleCode.ToString
  override toString(id: string): string {
    const nl = NewLine;
    let r = '[PuzzleCode' + id + ']' + nl;
    r += 'answer=' + this.answer.toString() + nl;

    r += 'guess=';
    for (const g of this.guess) {
      r += g.toString() + ',';
    }
    r = substring(r, 0, r.length - 1) + nl;

    return r + nl;
  }
}

type _Answer = Answer;
type _CodeGuess = CodeGuess;
export declare namespace PuzzleCode {
  type Answer = _Answer;
  type CodeGuess = _CodeGuess;
}
