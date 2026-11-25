// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/PuzzleTowerWindow.cs
// The tower puzzle's rules: the puzzle played, the move shown while a block is dragged over another tower and made
// when it is dropped, and closing or finishing. Valkyrie's IUpdateListener (Click and Update) becomes click, hover
// and release, which the app calls with the tower under the pointer (game.ui.puzzleTowerWindow).
import type { QuestData } from '../Content/QuestData.ts';
import { StringKey } from '../Content/StringKey.ts';
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { listGet } from '../platform/CSharp.ts';
import type { EventManager } from './EventManager.ts';
import { PuzzleTower } from './PuzzleTower.ts';

// Valkyrie: PuzzleTowerWindow.cs PuzzleTowerWindow
export class PuzzleTowerWindow {
  eventData: EventManager.Event;
  questPuzzle: QuestData.Puzzle;
  puzzle: PuzzleTower;
  lastMoves = 0;
  protected windowClosed = false;
  startDragTower = -1;
  hoverTower = -1;
  /** The towers as drawn: the puzzle, or the move being dragged. */
  puzzleDisplay: number[][];
  /** Not in Valkyrie: the finish button's text, the event's first button, as CreateWindow reads it each time it draws. */
  finishLabel: StringKey = StringKey.NULL;

  constructor(e: EventManager.Event) {
    this.eventData = e;
    const game = Game.get();

    this.questPuzzle = e.qEvent as QuestData.Puzzle;

    if (game.currentQuest!.puzzle.has(this.questPuzzle.sectionName)) {
      const kept = game.currentQuest!.puzzle.get(this.questPuzzle.sectionName);
      // `as PuzzleTower` gives null for another kind of puzzle, and reading its moves throws
      if (!(kept instanceof PuzzleTower)) throw new TypeError("Cannot read properties of null (reading 'moves')");
      this.puzzle = kept;
      this.lastMoves = this.puzzle.moves;
    } else {
      this.puzzle = new PuzzleTower(this.questPuzzle.puzzleLevel);
    }

    this.puzzleDisplay = this.puzzle.copyState(this.puzzle.puzzle);

    this.createWindow();
  }

  // Valkyrie: PuzzleTowerWindow.cs PuzzleTowerWindow.CreateWindow
  createWindow(): void {
    Destroyer.dialog();
    // GetButtons()[0] throws without buttons, and can log a missing event
    this.finishLabel = listGet(this.eventData.getButtons(), 0).getLabel();
    Game.get().ui.puzzleTowerWindow(this);
  }

  // Valkyrie: PuzzleTowerWindow.cs PuzzleTowerWindow.Close
  close(): void {
    Destroyer.dialog();
    const game = Game.get();
    // Remove then Add puts the key back in its slot of the .NET Dictionary, as set does
    game.currentQuest!.puzzle.set(this.questPuzzle.sectionName, this.puzzle);

    game.currentQuest!.eManager.currentEvent = null;
    game.currentQuest!.eManager.currentEvent = null;

    this.windowClosed = true;
    game.currentQuest!.eManager.triggerEvent();
  }

  // Valkyrie: PuzzleTowerWindow.cs PuzzleTowerWindow.Finished
  finished(): void {
    Destroyer.dialog();
    const game = Game.get();
    game.currentQuest!.puzzle.delete(this.questPuzzle.sectionName);
    this.windowClosed = true;
    game.currentQuest!.eManager.endEvent();
  }

  /** The pointer went down over a tower (0 to 2): its top block starts to move. */
  // Valkyrie: PuzzleTowerWindow.cs PuzzleTowerWindow.IUpdateListener.Click
  click(tower: number): void {
    if (this.windowClosed || this.puzzle.solved()) return;
    if (tower < 0 || tower > 2) return;
    this.startDragTower = tower;
    this.hoverTower = tower;
  }

  /** While a block moves, the pointer is over this tower (or over none, -1): the block is shown there if it can go. */
  // Valkyrie: PuzzleTowerWindow.cs PuzzleTowerWindow.IUpdateListener.Update
  hover(newHover: number): void {
    if (this.startDragTower < 0) return;

    if (this.hoverTower !== newHover) {
      this.hoverTower = newHover;
      this.puzzleDisplay = this.puzzle.copyState(this.puzzle.puzzle);
      if (this.hoverTower >= 0) {
        this.puzzle.move(this.startDragTower, this.hoverTower, this.puzzleDisplay);
      }
      this.createWindow();
    }
  }

  /** The pointer went up: the move is made if it is legal, and counted. */
  // Valkyrie: PuzzleTowerWindow.cs PuzzleTowerWindow.IUpdateListener.Update (the mouse button released)
  release(): void {
    if (this.startDragTower < 0) return;

    if (this.puzzle.moveOK(this.startDragTower, this.hoverTower)) {
      this.puzzle.moves++;
      this.puzzle.move(this.startDragTower, this.hoverTower);
    }
    this.puzzleDisplay = this.puzzle.copyState(this.puzzle.puzzle);
    this.startDragTower = -1;
    this.createWindow();
  }
}
