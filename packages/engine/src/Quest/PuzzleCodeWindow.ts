// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/PuzzleCodeWindow.cs
// The code puzzle's rules: the guess being built, the guesses made, and closing or finishing it. The app draws it
// (game.ui.puzzleCodeWindow). The guess field is guessList, because camelCase makes it collide with Guess().
import type { QuestData } from '../Content/QuestData.ts';
import { StringKey } from '../Content/StringKey.ts';
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { listGet } from '../platform/CSharp.ts';
import { Resources } from '../platform/Resources.ts';
import type { EventManager } from './EventManager.ts';
import { PuzzleCode } from './PuzzleCode.ts';

// Valkyrie: PuzzleCodeWindow.cs PuzzleCodeWindow.ButtonInfo
export class ButtonInfo {
  /** The sprite of Valkyrie's Resources (Resources.load), drawn instead of the label. */
  image: string | null = null;
  label: StringKey = StringKey.NULL;

  constructor(imageOrLabel: string | StringKey) {
    if (typeof imageOrLabel === 'string') this.image = imageOrLabel;
    else this.label = imageOrLabel;
  }
}

// Valkyrie: PuzzleCodeWindow.cs PuzzleCodeWindow
export class PuzzleCodeWindow {
  static readonly ButtonInfo = ButtonInfo;

  eventData: EventManager.Event;
  questPuzzle: QuestData.Puzzle;
  puzzle: PuzzleCode;
  guessList: number[];
  previousMoves = 0;
  buttons: ButtonInfo[];
  /** Not in Valkyrie: the finish button's text, the event's first button, as CreateWindow reads it each time it draws. */
  finishLabel: StringKey = StringKey.NULL;

  constructor(e: EventManager.Event) {
    this.eventData = e;
    const game = Game.get();

    this.guessList = [];
    this.questPuzzle = e.qEvent as QuestData.Puzzle;
    this.buttons = this.getButtons();

    if (game.currentQuest!.puzzle.has(this.questPuzzle.sectionName)) {
      // This puzzle was played before. Load up the previous moves.
      this.puzzle = game.currentQuest!.puzzle.get(this.questPuzzle.sectionName) as PuzzleCode;
      this.previousMoves = this.puzzle.guess.length;
    } else {
      // Initialize a new puzzle
      this.puzzle = new PuzzleCode(this.questPuzzle.puzzleLevel, this.questPuzzle.puzzleAltLevel, this.questPuzzle.puzzleSolution);
    }

    this.createWindow();
  }

  // Valkyrie: PuzzleCodeWindow.cs PuzzleCodeWindow.CreateWindow
  createWindow(): void {
    Destroyer.dialog();
    // GetButtons()[0] throws without buttons, and can log a missing event
    this.finishLabel = listGet(this.eventData.getButtons(), 0).getLabel();
    Game.get().ui.puzzleCodeWindow(this);
  }

  // Valkyrie: PuzzleCodeWindow.cs PuzzleCodeWindow.GuessAdd (draws the new symbol over the open window)
  guessAdd(symbolType: number): void {
    if (this.guessList.length >= this.questPuzzle.puzzleLevel) {
      return;
    }
    this.guessList.push(symbolType);
    Game.get().ui.puzzleCodeWindow(this);
  }

  // Valkyrie: PuzzleCodeWindow.cs PuzzleCodeWindow.GuessRemove
  guessRemove(symbolPos: number): void {
    this.guessList.splice(symbolPos, 1);
    this.createWindow();
  }

  // Valkyrie: PuzzleCodeWindow.cs PuzzleCodeWindow.GetButtons
  getButtons(): ButtonInfo[] {
    const buttons: ButtonInfo[] = [];
    for (let i = 0; i <= this.questPuzzle.puzzleAltLevel; i++) {
      if (this.questPuzzle.imageType === 'symbol') {
        const dupeTex = Resources.load('sprites/monster_duplicate_' + i);
        buttons.push(dupeTex !== null ? new ButtonInfo(dupeTex) : new ButtonInfo(new StringKey(null, i.toString(), false)));
      } else if (this.questPuzzle.imageType === 'element') {
        const dupeTex = Resources.load('sprites/element' + i);
        buttons.push(dupeTex !== null ? new ButtonInfo(dupeTex) : new ButtonInfo(new StringKey(null, i.toString(), false)));
      } else {
        buttons.push(new ButtonInfo(new StringKey(null, i.toString(), false)));
      }
    }
    return buttons;
  }

  // Valkyrie: PuzzleCodeWindow.cs PuzzleCodeWindow.Guess
  guess(): void {
    if (this.guessList.length < this.questPuzzle.puzzleLevel) {
      return;
    }
    this.puzzle.addGuess(this.guessList);
    this.guessList = [];
    this.createWindow();
  }

  // Valkyrie: PuzzleCodeWindow.cs PuzzleCodeWindow.Close
  close(): void {
    Destroyer.dialog();
    const game = Game.get();
    // Remove then Add puts the key back in its slot of the .NET Dictionary, as set does
    game.currentQuest!.puzzle.set(this.questPuzzle.sectionName, this.puzzle);

    game.currentQuest!.eManager.currentEvent = null;
    game.currentQuest!.eManager.currentEvent = null;
    game.currentQuest!.eManager.triggerEvent();
  }

  // Valkyrie: PuzzleCodeWindow.cs PuzzleCodeWindow.Finished
  finished(): void {
    Destroyer.dialog();
    const game = Game.get();
    game.currentQuest!.puzzle.delete(this.questPuzzle.sectionName);

    game.currentQuest!.eManager.endEvent();
  }
}

type _ButtonInfo = ButtonInfo;
export declare namespace PuzzleCodeWindow {
  type ButtonInfo = _ButtonInfo;
}
