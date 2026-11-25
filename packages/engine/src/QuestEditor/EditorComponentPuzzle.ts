// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/EditorComponentPuzzle.cs
// Only what the puzzle's panel does to it, and the choices its selection windows offer; the panel is the app's
// (editor/PuzzlePanel.tsx). The parts of the event a puzzle keeps are the event panel's.
import { PuzzleData } from '../Content/ContentTypes.ts';
import type { QuestData } from '../Content/QuestData.ts';
import { Game } from '../Game.ts';
import { intTryParse } from '../platform/CSharp.ts';
import { questPictures } from './EditorComponent.ts';
import { contentItem, fileItem, type SelectionItem } from './SelectionTraits.ts';

export const EditorComponentPuzzle = {
  /** The kinds of puzzle, as written. */
  // Valkyrie: EditorComponentPuzzle.cs EditorComponentPuzzle.Class
  classChoices(): string[] {
    return ['slide', 'code', 'image', 'tower'];
  },

  /** Another kind loses the picture of the one before. */
  // Valkyrie: EditorComponentPuzzle.cs EditorComponentPuzzle.SelectClass
  selectClass(puzzle: QuestData.Puzzle, className: string): void {
    if (puzzle.puzzleClass !== className) puzzle.imageType = '';
    puzzle.puzzleClass = className;
  },

  /** The skills a puzzle tests, as written. */
  // Valkyrie: EditorComponentPuzzle.cs EditorComponentPuzzle.Skill
  skillChoices(): string[] {
    return ['{will}', '{strength}', '{agility}', '{lore}', '{influence}', '{observation}'];
  },

  // Valkyrie: EditorComponentPuzzle.cs EditorComponentPuzzle.SelectSkill
  selectSkill(puzzle: QuestData.Puzzle, skill: string): void {
    puzzle.skill = skill;
  },

  /** What is not a whole number is 0. */
  // Valkyrie: EditorComponentPuzzle.cs EditorComponentPuzzle.UpdateLevel
  updateLevel(puzzle: QuestData.Puzzle, text: string): void {
    puzzle.puzzleLevel = intTryParse(text).value;
  },

  // Valkyrie: EditorComponentPuzzle.cs EditorComponentPuzzle.UpdateAltLevel
  updateAltLevel(puzzle: QuestData.Puzzle, text: string): void {
    puzzle.puzzleAltLevel = intTryParse(text).value;
  },

  /** A code's solution as the example Valkyrie writes in grey: 1, 2… up to the alternatives, as long as the level. */
  // Valkyrie: EditorComponentPuzzle.cs EditorComponentPuzzle.ProvidePuzzleSolutionExample
  solutionExample(puzzle: QuestData.Puzzle): string {
    const parts: string[] = [];
    for (let i = 0; i < puzzle.puzzleLevel; i++) parts.push(String((i % puzzle.puzzleAltLevel) + 1));
    return parts.join(' ');
  },

  /**
   * A code's solution typed: as many numbers as the level, each from 1 to the alternatives. One that is not drops
   * the solution and says so (false), as Valkyrie colours the box red.
   */
  // Valkyrie: EditorComponentPuzzle.cs EditorComponentPuzzle.UpdatePuzzleSolution
  updatePuzzleSolution(puzzle: QuestData.Puzzle, text: string): boolean {
    const parts = text.split(' ');
    let invalid = parts.length !== puzzle.puzzleLevel;
    for (const part of parts) {
      const parsed = intTryParse(part);
      if (!parsed.ok) invalid = true;
      if (parsed.value === 0 || parsed.value > puzzle.puzzleAltLevel) invalid = true;
    }
    if (invalid) {
      puzzle.puzzleSolution = '';
      return false;
    }
    puzzle.puzzleSolution = text;
    return true;
  },

  /** A code puzzle's pictures: numbers (''), symbols or elements. */
  // Valkyrie: EditorComponentPuzzle.cs EditorComponentPuzzle.Image (code)
  codeImageChoices(): string[] {
    return ['', 'symbol', 'element'];
  },

  /** The other puzzles' pictures: the scenario's, then the content's puzzles. */
  // Valkyrie: EditorComponentPuzzle.cs EditorComponentPuzzle.Image
  imageChoices(): SelectionItem[] {
    return [...questPictures().map(fileItem), ...Game.get().cd.values(PuzzleData).map((data) => contentItem(data))];
  },

  // Valkyrie: EditorComponentPuzzle.cs EditorComponentPuzzle.SelectImage
  selectImage(puzzle: QuestData.Puzzle, image: string): void {
    puzzle.imageType = image;
  },
};
