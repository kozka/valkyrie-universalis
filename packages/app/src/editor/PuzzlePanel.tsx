// The fields of a puzzle beside the map, as Valkyrie's panel for it has them (EditorComponentPuzzle): its kind, the
// skill it tests, its level, and for a code or a picture its alternatives and picture, and a code's solution. What
// each does is the engine's (QuestEditor/EditorComponentPuzzle.ts); the parts of the event a puzzle keeps are
// EventPanel's. Not ported from Valkyrie's panel, which is drawn with Unity.
import { useEffect, useState } from 'react';
import { EditorComponentPuzzle, type QuestData, type SelectionItem } from '@universalis/engine';
import { val } from '../ui/text.ts';
import { Chooser } from './Chooser.tsx';
import { Field, TypedText } from './fields.tsx';
import { edit } from './PiecePanel.tsx';
import { edi } from './text.ts';

/** How the code puzzle's picture window names its choices. */
function codeImageLabel(image: string): string {
  if (image === '') return '{NUMBERS}';
  return val(image.toUpperCase());
}

export function PuzzlePanel({ puzzle }: { puzzle: QuestData.Puzzle }) {
  const [choosing, setChoosing] = useState<SelectionItem[] | null>(null);
  const [wrong, setWrong] = useState(false);
  useEffect(() => setWrong(false), [puzzle]);
  const kind = puzzle.puzzleClass;
  const classes = EditorComponentPuzzle.classChoices();
  const skills = EditorComponentPuzzle.skillChoices();
  return (
    <div className="editor-piece">
      <div className="editor-pair">
        <Field label={val('PUZZLE_CLASS')}>
          <select aria-label={val('PUZZLE_CLASS')} value={kind} onChange={(e) => edit(puzzle, () => EditorComponentPuzzle.selectClass(puzzle, e.target.value))}>
            {!classes.includes(kind) && <option value={kind}>{kind}</option>}
            {classes.map((c) => (
              <option key={c} value={c}>
                {val(c)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={val('SKILL')}>
          <select aria-label={val('SKILL')} value={puzzle.skill} onChange={(e) => edit(puzzle, () => EditorComponentPuzzle.selectSkill(puzzle, e.target.value))}>
            {!skills.includes(puzzle.skill) && <option value={puzzle.skill}>{puzzle.skill}</option>}
            {skills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="editor-pair">
        <Field label={val('PUZZLE_LEVEL')}>
          <TypedText label={val('PUZZLE_LEVEL')} number={{ min: 0, step: 1 }} value={String(puzzle.puzzleLevel)} onDone={(text) => edit(puzzle, () => EditorComponentPuzzle.updateLevel(puzzle, text))} />
        </Field>
        {(kind === 'image' || kind === 'code') && (
          <Field label={val('PUZZLE_ALT_LEVEL')}>
            <TypedText label={val('PUZZLE_ALT_LEVEL')} number={{ min: 0, step: 1 }} value={String(puzzle.puzzleAltLevel)} onDone={(text) => edit(puzzle, () => EditorComponentPuzzle.updateAltLevel(puzzle, text))} />
          </Field>
        )}
      </div>
      {kind === 'code' && (
        <Field label={val('IMAGE')}>
          <select aria-label={val('IMAGE')} value={puzzle.imageType} onChange={(e) => edit(puzzle, () => EditorComponentPuzzle.selectImage(puzzle, e.target.value))}>
            {!EditorComponentPuzzle.codeImageChoices().includes(puzzle.imageType) && <option value={puzzle.imageType}>{puzzle.imageType}</option>}
            {EditorComponentPuzzle.codeImageChoices().map((image) => (
              <option key={image} value={image}>
                {codeImageLabel(image)}
              </option>
            ))}
          </select>
        </Field>
      )}
      {kind === 'image' && (
        <Field label={val('IMAGE')}>
          <button type="button" className="editor-picked" aria-label={val('IMAGE')} onClick={() => setChoosing(EditorComponentPuzzle.imageChoices())}>
            <span>{puzzle.imageType.length === 0 ? val('NONE') : puzzle.imageType}</span>
          </button>
        </Field>
      )}
      {kind === 'code' && (
        <Field label={val('PUZZLE_SOLUTION')}>
          <TypedText
            label={val('PUZZLE_SOLUTION')}
            placeholder={EditorComponentPuzzle.solutionExample(puzzle)}
            value={puzzle.puzzleSolution}
            onDone={(text) => {
              let ok = true;
              edit(puzzle, () => {
                ok = EditorComponentPuzzle.updatePuzzleSolution(puzzle, text);
              });
              setWrong(!ok && text !== '');
            }}
          />
          {wrong && (
            <p className="editor-error" role="alert">
              {edi('EDITOR_SOLUTION_WRONG', puzzle.puzzleLevel, puzzle.puzzleAltLevel)}
            </p>
          )}
        </Field>
      )}
      {choosing !== null && (
        <Chooser
          title={val('SELECT_IMAGE')}
          items={choosing}
          current={puzzle.imageType}
          excludeExpansions
          pictures
          onPick={(key) => {
            setChoosing(null);
            edit(puzzle, () => EditorComponentPuzzle.selectImage(puzzle, key));
          }}
          onClose={() => setChoosing(null)}
        />
      )}
    </div>
  );
}
