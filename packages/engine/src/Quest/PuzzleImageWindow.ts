// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/PuzzleImageWindow.cs
// The picture puzzle's rules: the puzzle played, its picture and the part of it each piece shows, how far BlockSlider
// lets a piece follow a drag and the swap when it is dropped, and closing or finishing. The app draws it and drags the
// pieces (game.ui.puzzleImageWindow).
import { ContentData } from '../Content/ContentData.ts';
import { PuzzleData } from '../Content/ContentTypes.ts';
import type { QuestData } from '../Content/QuestData.ts';
import { StringKey } from '../Content/StringKey.ts';
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { listGet } from '../platform/CSharp.ts';
import { Mathf } from '../platform/Mathf.ts';
import { Path } from '../platform/SystemIO.ts';
import type { Texture2D } from '../platform/Texture2D.ts';
import type { EventManager } from './EventManager.ts';
import { PuzzleImage } from './PuzzleImage.ts';

/** A part of the picture, in its pixels, counted from its bottom left as Unity's Rect. */
export interface PieceRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Valkyrie: PuzzleImageWindow.cs PuzzleImageWindow
export class PuzzleImageWindow {
  eventData: EventManager.Event;
  questPuzzle: QuestData.Puzzle;
  puzzle: PuzzleImage;
  previousMoves = 0;
  /** The picture the pieces are cut from (Valkyrie keeps its sprites in imageSprite): the app draws its pixels. */
  texture: Texture2D;
  /** A piece's size in UI units. */
  width = 1;
  height = 1;
  /** Not in Valkyrie: the finish button's text, the event's first button, as CreateWindow reads it each time it draws. */
  finishLabel: StringKey = StringKey.NULL;

  constructor(e: EventManager.Event) {
    this.eventData = e;
    const game = Game.get();

    this.questPuzzle = e.qEvent as QuestData.Puzzle;

    if (game.currentQuest!.puzzle.has(this.questPuzzle.sectionName)) {
      const kept = game.currentQuest!.puzzle.get(this.questPuzzle.sectionName);
      // `as PuzzleImage` gives null for another kind of puzzle, and reading its moves throws
      if (!(kept instanceof PuzzleImage)) throw new TypeError("Cannot read properties of null (reading 'moves')");
      this.puzzle = kept;
      this.previousMoves = this.puzzle.moves;
    } else {
      this.puzzle = new PuzzleImage(this.questPuzzle.puzzleLevel, this.questPuzzle.puzzleAltLevel);
    }

    this.height = Math.fround(19 / this.questPuzzle.puzzleAltLevel);
    this.width = Math.fround(19 / this.questPuzzle.puzzleLevel);

    let newTex: Texture2D | null;
    const puzzleData = game.cd.tryGet(PuzzleData, this.questPuzzle.imageType);
    if (puzzleData !== undefined) {
      newTex = ContentData.fileToTexture(puzzleData.image);
    } else {
      newTex = ContentData.fileToTexture(Path.getDirectoryName(game.currentQuest!.qd.questPath) + Path.DirectorySeparatorChar + this.questPuzzle.imageType);
    }
    // A missing picture is a NullReferenceException in C#: the event stops here
    if (newTex === null) throw new TypeError("Cannot read properties of null (reading 'width')");
    this.texture = newTex;
    if (newTex.width > newTex.height) {
      this.height = Math.fround(Math.fround(this.height * newTex.height) / newTex.width);
    } else {
      this.width = Math.fround(Math.fround(this.width * newTex.width) / newTex.height);
    }

    this.createWindow();
  }

  /** The part of the picture of the piece in column x and row y, as Valkyrie cuts its sprites. */
  // Valkyrie: PuzzleImageWindow.cs PuzzleImageWindow.PuzzleImageWindow (imageSprite)
  pieceRect(x: number, y: number): PieceRect {
    const level = this.questPuzzle.puzzleLevel;
    const altLevel = this.questPuzzle.puzzleAltLevel;
    const tex = this.texture;
    return {
      x: Math.trunc((x * tex.width) / level),
      y: Math.trunc(((altLevel - (y + 1)) * tex.height) / altLevel),
      width: Math.trunc(tex.width / level),
      height: Math.trunc(tex.height / altLevel),
    };
  }

  // Valkyrie: PuzzleImageWindow.cs PuzzleImageWindow.CreateWindow
  createWindow(): void {
    Destroyer.dialog();
    // GetButtons()[0] throws without buttons, and can log a missing event
    this.finishLabel = listGet(this.eventData.getButtons(), 0).getLabel();
    Game.get().ui.puzzleImageWindow(this);
  }

  /** How fast each piece fades in when the window is drawn, in alpha a second, or null when it shows at once. */
  // Valkyrie: PuzzleImageWindow.cs PuzzleImageWindow.Draw (FadeIn)
  fadeSpeed(solved: boolean): number | null {
    if (this.questPuzzle.imageType.length > 0 && !solved && this.questPuzzle.fadeSpeed !== 'instant') {
      return this.questPuzzle.fadeSpeed === 'slow' ? 0.5 : 1;
    }
    return null;
  }

  /**
   * How far the piece at screenPos follows a drag of x and y UI units (y down), in UI units: not off the picture, at
   * most one piece, and only along the axis it moved most.
   */
  // Valkyrie: PuzzleImageWindow.cs BlockSlider.Update (in pixels, which are UI units times UIScaler.GetPixelsPerUnit)
  dragOffset(screenPos: PuzzleImage.TilePosition, x: number, y: number): { x: number; y: number } {
    // Valkyrie measures with y up
    let xDiff = x;
    let yDiff = -y;

    if (screenPos.x === 0 && xDiff < 0) {
      xDiff = 0;
    }
    if (screenPos.y === 0 && yDiff > 0) {
      yDiff = 0;
    }
    if (screenPos.x === this.questPuzzle.puzzleLevel - 1 && xDiff > 0) {
      xDiff = 0;
    }
    if (screenPos.y === this.questPuzzle.puzzleAltLevel - 1 && yDiff < 0) {
      yDiff = 0;
    }

    if (xDiff > this.width) {
      xDiff = this.width;
    }
    if (xDiff < -this.width) {
      xDiff = -this.width;
    }

    if (yDiff > this.height) {
      yDiff = this.height;
    }
    if (yDiff < -this.height) {
      yDiff = -this.height;
    }
    if (Math.abs(yDiff) > Math.abs(xDiff)) {
      xDiff = 0;
    } else {
      yDiff = 0;
    }
    return { x: xDiff, y: 0 - yDiff };
  }

  /** The piece at screenPos dropped at offset (a dragOffset) swaps places with the piece there, counting a move. */
  // Valkyrie: PuzzleImageWindow.cs BlockSlider.Update (the mouse button released)
  release(screenPos: PuzzleImage.TilePosition, offset: { x: number; y: number }): void {
    const xShift = Mathf.roundToInt(Math.fround(offset.x / this.width));
    const yShift = -Mathf.roundToInt(Math.fround(-offset.y / this.height));
    if (yShift !== 0 || xShift !== 0) {
      this.puzzle.moves++;
      let swap: PuzzleImage.TilePosition | null = null;
      for (const key of this.puzzle.state.keys()) {
        if (key.x === screenPos.x + xShift && key.y === screenPos.y + yShift) {
          swap = key;
        }
      }
      // No piece there is a NullReferenceException in C#
      if (swap === null) throw new TypeError("Cannot set properties of null (setting 'x')");
      swap.x = screenPos.x;
      swap.y = screenPos.y;
      screenPos.x += xShift;
      screenPos.y += yShift;
      this.createWindow();
    }
  }

  // Valkyrie: PuzzleImageWindow.cs PuzzleImageWindow.Close
  close(): void {
    Destroyer.dialog();
    const game = Game.get();
    // Remove then Add puts the key back in its slot of the .NET Dictionary, as set does
    game.currentQuest!.puzzle.set(this.questPuzzle.sectionName, this.puzzle);

    game.currentQuest!.eManager.currentEvent = null;
    game.currentQuest!.eManager.currentEvent = null;
    game.currentQuest!.eManager.triggerEvent();
  }

  // Valkyrie: PuzzleImageWindow.cs PuzzleImageWindow.Finished
  finished(): void {
    Destroyer.dialog();
    const game = Game.get();
    game.currentQuest!.puzzle.delete(this.questPuzzle.sectionName);

    game.currentQuest!.eManager.endEvent();
  }
}
