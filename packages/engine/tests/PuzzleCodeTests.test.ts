// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/PuzzleCodeTests.cs
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PuzzleCode, ValkyrieDebug } from '../src/index.ts';

/**
 * Unit tests for PuzzleCode, PuzzleCode.Answer, and PuzzleCode.CodeGuess classes.
 * Tests cover puzzle creation, guess validation, and solution checking.
 */
describe('PuzzleCodeTests', () => {
  beforeEach(() => {
    // Disable ValkyrieDebug to prevent Unity logging during tests
    ValkyrieDebug.enabled = false;
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
  });

  // PuzzleCode.Answer Tests

  it('Answer_StringConstructor_ParsesSingleValue', () => {
    const answer = new PuzzleCode.Answer('5');

    expect(answer.state.length).toBe(1);
    expect(answer.state[0]).toBe(5);
  });

  it('Answer_StringConstructor_ParsesMultipleValues', () => {
    const answer = new PuzzleCode.Answer('1 3 5 4');

    expect(answer.state.length).toBe(4);
    expect(answer.state[0]).toBe(1);
    expect(answer.state[1]).toBe(3);
    expect(answer.state[2]).toBe(5);
    expect(answer.state[3]).toBe(4);
  });

  it('Answer_StringConstructor_HandlesInvalidValue', () => {
    // Invalid values should parse to 0
    const answer = new PuzzleCode.Answer('abc');

    expect(answer.state.length).toBe(1);
    expect(answer.state[0]).toBe(0);
  });

  it('Answer_ToString_ReturnsSpaceSeparatedValues', () => {
    const answer = new PuzzleCode.Answer('1 2 3');

    const result = answer.toString();

    expect(result).toBe('1 2 3');
  });

  // PuzzleCode.CodeGuess Tests

  it('CodeGuess_ListConstructor_StoresGuess', () => {
    const answer = new PuzzleCode.Answer('1 2 3');
    const guessValues = [1, 2, 3];

    const guess = new PuzzleCode.CodeGuess(answer, guessValues);

    expect(guess.guess.length).toBe(3);
    expect(guess.guess[0]).toBe(1);
    expect(guess.guess[1]).toBe(2);
    expect(guess.guess[2]).toBe(3);
  });

  it('CodeGuess_StringConstructor_ParsesGuess', () => {
    const answer = new PuzzleCode.Answer('1 2 3');

    const guess = new PuzzleCode.CodeGuess(answer, '4 5 6');

    expect(guess.guess.length).toBe(3);
    expect(guess.guess[0]).toBe(4);
    expect(guess.guess[1]).toBe(5);
    expect(guess.guess[2]).toBe(6);
  });

  it('CodeGuess_Correct_AllMatch_ReturnsTrue', () => {
    const answer = new PuzzleCode.Answer('1 2 3');
    const guess = new PuzzleCode.CodeGuess(answer, [1, 2, 3]);

    expect(guess.correct()).toBe(true);
  });

  it('CodeGuess_Correct_OneMismatch_ReturnsFalse', () => {
    const answer = new PuzzleCode.Answer('1 2 3');
    const guess = new PuzzleCode.CodeGuess(answer, [1, 2, 4]);

    expect(guess.correct()).toBe(false);
  });

  it('CodeGuess_Correct_AllMismatch_ReturnsFalse', () => {
    const answer = new PuzzleCode.Answer('1 2 3');
    const guess = new PuzzleCode.CodeGuess(answer, [4, 5, 6]);

    expect(guess.correct()).toBe(false);
  });

  it('CodeGuess_CorrectSpot_AllCorrect_ReturnsCount', () => {
    const answer = new PuzzleCode.Answer('1 2 3');
    const guess = new PuzzleCode.CodeGuess(answer, [1, 2, 3]);

    expect(guess.correctSpot()).toBe(3);
  });

  it('CodeGuess_CorrectSpot_NoneCorrect_ReturnsZero', () => {
    const answer = new PuzzleCode.Answer('1 2 3');
    const guess = new PuzzleCode.CodeGuess(answer, [4, 5, 6]);

    expect(guess.correctSpot()).toBe(0);
  });

  it('CodeGuess_CorrectSpot_SomeCorrect_ReturnsPartialCount', () => {
    const answer = new PuzzleCode.Answer('1 2 3');
    const guess = new PuzzleCode.CodeGuess(answer, [1, 5, 3]);

    expect(guess.correctSpot()).toBe(2);
  });

  it('CodeGuess_CorrectType_AllWrongSpotRightType_ReturnsCount', () => {
    // Answer is 1,2,3 - guess has same values in wrong positions
    const answer = new PuzzleCode.Answer('1 2 3');
    const guess = new PuzzleCode.CodeGuess(answer, [3, 1, 2]);

    expect(guess.correctType()).toBe(3);
  });

  it('CodeGuess_CorrectType_NoMatchingTypes_ReturnsZero', () => {
    const answer = new PuzzleCode.Answer('1 2 3');
    const guess = new PuzzleCode.CodeGuess(answer, [4, 5, 6]);

    expect(guess.correctType()).toBe(0);
  });

  it('CodeGuess_CorrectType_MixedCorrectSpotAndType_CountsOnlyWrongSpot', () => {
    // Answer is 1,2,3, guess is 1,3,2: 1 is in the correct spot (not counted), 3 and 2 are in wrong spots
    const answer = new PuzzleCode.Answer('1 2 3');
    const guess = new PuzzleCode.CodeGuess(answer, [1, 3, 2]);

    expect(guess.correctType()).toBe(2);
  });

  it('CodeGuess_CorrectType_DuplicateValuesInGuess_CountsOnce', () => {
    // Answer is 1,2,3, guess is 2,2,4: first 2 is wrong spot but right type, second 2 should not be counted
    const answer = new PuzzleCode.Answer('1 2 3');
    const guess = new PuzzleCode.CodeGuess(answer, [2, 2, 4]);

    expect(guess.correctType()).toBe(0);
  });

  it('CodeGuess_ToString_ReturnsSpaceSeparatedValues', () => {
    const answer = new PuzzleCode.Answer('1 2 3');
    const guess = new PuzzleCode.CodeGuess(answer, [4, 5, 6]);

    expect(guess.toString()).toBe('4 5 6');
  });

  // PuzzleCode Constructor Tests

  it('PuzzleCode_DictionaryConstructor_ParsesAnswer', () => {
    const data = new Map([['answer', '1 2 3']]);

    const puzzle = new PuzzleCode(data);

    expect(puzzle.answer).not.toBeNullable();
    expect(puzzle.answer.state.length).toBe(3);
    expect(puzzle.answer.state[0]).toBe(1);
  });

  it('PuzzleCode_DictionaryConstructor_ParsesGuesses', () => {
    const data = new Map([
      ['answer', '1 2 3'],
      ['guess', '4 5 6,1 2 3'],
    ]);

    const puzzle = new PuzzleCode(data);

    expect(puzzle.guess.length).toBe(2);
  });

  it('PuzzleCode_DictionaryConstructor_EmptyGuess_CreatesEmptyList', () => {
    const data = new Map([['answer', '1 2 3']]);

    const puzzle = new PuzzleCode(data);

    expect(puzzle.guess).not.toBeNullable();
    expect(puzzle.guess.length).toBe(0);
  });

  // PuzzleCode Methods Tests

  it('PuzzleCode_Solved_NoGuesses_ReturnsFalse', () => {
    const puzzle = new PuzzleCode(new Map([['answer', '1 2 3']]));

    expect(puzzle.solved()).toBe(false);
  });

  it('PuzzleCode_Solved_LastGuessCorrect_ReturnsTrue', () => {
    const puzzle = new PuzzleCode(
      new Map([
        ['answer', '1 2 3'],
        ['guess', '4 5 6,1 2 3'],
      ]),
    );

    expect(puzzle.solved()).toBe(true);
  });

  it('PuzzleCode_Solved_LastGuessIncorrect_ReturnsFalse', () => {
    const puzzle = new PuzzleCode(
      new Map([
        ['answer', '1 2 3'],
        ['guess', '1 2 3,4 5 6'],
      ]),
    );

    expect(puzzle.solved()).toBe(false);
  });

  it('PuzzleCode_AddGuess_AddsToGuessList', () => {
    const puzzle = new PuzzleCode(new Map([['answer', '1 2 3']]));

    puzzle.addGuess([4, 5, 6]);

    expect(puzzle.guess.length).toBe(1);
  });

  it('PuzzleCode_ToString_ContainsAnswerAndGuess', () => {
    const puzzle = new PuzzleCode(
      new Map([
        ['answer', '1 2 3'],
        ['guess', '4 5 6'],
      ]),
    );

    const result = puzzle.toString('Test');

    expect(result).toContain('[PuzzleCodeTest]');
    expect(result).toContain('answer=1 2 3');
    expect(result).toContain('guess=4 5 6');
  });
});
