// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/PuzzleSlideWindow.cs
// The slide puzzle's rules: the puzzle played, where BlockSlider lets a block go while it is dragged and where it
// stays when it is dropped, and closing or finishing. The app draws it and drags the blocks (game.ui.puzzleSlideWindow).
import type { QuestData } from '../Content/QuestData.ts';
import { StringKey } from '../Content/StringKey.ts';
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { listGet } from '../platform/CSharp.ts';
import { Mathf } from '../platform/Mathf.ts';
import type { EventManager } from './EventManager.ts';
import { PuzzleSlide } from './PuzzleSlide.ts';

// Valkyrie: PuzzleSlideWindow.cs PuzzleSlideWindow
export class PuzzleSlideWindow {
  eventData: EventManager.Event;
  questPuzzle: QuestData.Puzzle;
  puzzle: PuzzleSlide;
  lastMoves = 0;
  /** Not in Valkyrie: the finish button's text, the event's first button, as CreateWindow reads it each time it draws. */
  finishLabel: StringKey = StringKey.NULL;

  constructor(e: EventManager.Event) {
    this.eventData = e;
    const game = Game.get();

    this.questPuzzle = e.qEvent as QuestData.Puzzle;

    if (game.currentQuest!.puzzle.has(this.questPuzzle.sectionName)) {
      const kept = game.currentQuest!.puzzle.get(this.questPuzzle.sectionName);
      // `as PuzzleSlide` gives null for another kind of puzzle, and reading its moves throws
      if (!(kept instanceof PuzzleSlide)) throw new TypeError("Cannot read properties of null (reading 'moves')");
      this.puzzle = kept;
      this.lastMoves = this.puzzle.moves;
    } else {
      this.puzzle = new PuzzleSlide(this.questPuzzle.puzzleLevel);
    }

    this.createWindow();
  }

  // Valkyrie: PuzzleSlideWindow.cs PuzzleSlideWindow.CreateWindow
  createWindow(): void {
    Destroyer.dialog();
    // GetButtons()[0] throws without buttons, and can log a missing event
    this.finishLabel = listGet(this.eventData.getButtons(), 0).getLabel();
    Game.get().ui.puzzleSlideWindow(this);
  }

  // Valkyrie: PuzzleSlideWindow.cs PuzzleSlideWindow.Close
  close(): void {
    Destroyer.dialog();
    const game = Game.get();
    // Remove then Add puts the key back in its slot of the .NET Dictionary, as set does
    game.currentQuest!.puzzle.set(this.questPuzzle.sectionName, this.puzzle);

    game.currentQuest!.eManager.currentEvent = null;
    game.currentQuest!.eManager.currentEvent = null;
    game.currentQuest!.eManager.triggerEvent();
  }

  // Valkyrie: PuzzleSlideWindow.cs PuzzleSlideWindow.Finished
  finished(): void {
    Destroyer.dialog();
    const game = Game.get();
    game.currentQuest!.puzzle.delete(this.questPuzzle.sectionName);

    game.currentQuest!.eManager.endEvent();
  }

  /**
   * Where a block goes while it is dragged `delta` squares along its axis (down for an upright block): within its
   * limits, and onto the nearest square when it is within a third of one. Valkyrie's upright blocks never snap.
   */
  // Valkyrie: PuzzleSlideWindow.cs BlockSlider.Update
  dragPosition(block: PuzzleSlide.Block, delta: number): number {
    if (block.rotation) {
      let yTargetSq = block.ypos + delta;
      const yNegative = this.getNegativeLimit(block);
      if (yTargetSq < yNegative) {
        yTargetSq = yNegative;
      }
      const yPositive = this.getPositiveLimit(block);
      if (yTargetSq > yPositive) {
        yTargetSq = yPositive;
      }
      return yTargetSq;
    }
    let xTargetSq = block.xpos + delta;
    const xNegative = this.getNegativeLimit(block);
    if (xTargetSq < xNegative) {
      xTargetSq = xNegative;
    }
    const xPositive = this.getPositiveLimit(block);
    if (xTargetSq > xPositive) {
      xTargetSq = xPositive;
    }
    const nearestFit = Mathf.roundToInt(xTargetSq);
    // Within one UI unit of a square, which is three units wide
    if (Math.abs(xTargetSq - nearestFit) * 3 < 1) {
      return nearestFit;
    }
    return xTargetSq;
  }

  /** The block dropped at `position` (a dragPosition) stays on the nearest square; a new square counts a move. */
  // Valkyrie: PuzzleSlideWindow.cs BlockSlider.Update (the mouse button released)
  release(block: PuzzleSlide.Block, position: number): void {
    const newXPos = block.rotation ? block.xpos : Mathf.roundToInt(position);
    const newYPos = block.rotation ? Mathf.roundToInt(position) : block.ypos;
    if (newXPos !== block.xpos || newYPos !== block.ypos) {
      this.puzzle.moves++;
      block.xpos = newXPos;
      block.ypos = newYPos;
    }
    // Update
    this.createWindow();
  }

  // Valkyrie: PuzzleSlideWindow.cs BlockSlider.GetNegativeLimit
  getNegativeLimit(block: PuzzleSlide.Block): number {
    let posx = block.xpos;
    let posy = block.ypos;

    do {
      if (block.rotation) {
        posy--;
      } else {
        posx--;
      }
    } while (PuzzleSlide.empty(this.puzzle.puzzle, posx, posy));

    if (block.rotation) {
      return posy + 1;
    }
    if (block.target && posx === 4) {
      return 6;
    }
    return posx + 1;
  }

  // Valkyrie: PuzzleSlideWindow.cs BlockSlider.GetPositiveLimit
  getPositiveLimit(block: PuzzleSlide.Block): number {
    let posx = block.xpos;
    let posy = block.ypos;

    if (block.rotation) {
      posy += block.ylen + 1;
    } else {
      posx += block.xlen + 1;
    }

    while (PuzzleSlide.empty(this.puzzle.puzzle, posx, posy)) {
      if (block.rotation) {
        posy++;
      } else {
        posx++;
      }
    }

    if (block.rotation) {
      return posy - (1 + block.ylen);
    }
    return posx - (1 + block.xlen);
  }
}
