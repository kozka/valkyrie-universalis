// Tests of the layout of quest UI elements (board/questUI.ts), written from Valkyrie's Quest.UI constructor, which has
// no NUnit tests. Not ported from Valkyrie.
import { describe, expect, it } from 'vitest';
import { Vector2 } from '@universalis/engine';
import { questUIBorder, questUIFontSize, questUIRect, type QuestUILayout, type ScreenRect } from '../src/board/questUI.ts';

const screen = { width: 1000, height: 600 };

/** Locations are 32-bit floats (Vector2), so positions come out a hair away from round numbers. */
function expectRect(actual: ScreenRect, expected: ScreenRect): void {
  for (const key of ['left', 'top', 'width', 'height'] as const) expect(actual[key], key).toBeCloseTo(expected[key], 3);
}

function element(change: Partial<QuestUILayout>): QuestUILayout {
  return { size: 1, verticalUnits: false, hAlign: 0, vAlign: 0, location: new Vector2(0, 0), ...change };
}

describe('Quest.UI layout', () => {
  it('centres an element by default, sized in screen widths', () => {
    expectRect(questUIRect(element({ size: 0.5 }), 2, screen), { left: 250, top: 175, width: 500, height: 250 });
  });

  it('measures the offset from the left and top edges', () => {
    const qUI = element({ size: 0.2, hAlign: -1, vAlign: -1, location: new Vector2(0.1, 0.05) });
    expectRect(questUIRect(qUI, 1, screen), { left: 100, top: 50, width: 200, height: 200 });
  });

  it('measures the offset from the right and bottom edges', () => {
    const qUI = element({ size: 0.2, hAlign: 1, vAlign: 1, location: new Vector2(0.1, 0.05) });
    expectRect(questUIRect(qUI, 1, screen), { left: 700, top: 350, width: 200, height: 200 });
  });

  it('sizes and moves in screen heights with vertical units', () => {
    const qUI = element({ size: 0.5, verticalUnits: true, location: new Vector2(0.1, 0.1) });
    expectRect(questUIRect(qUI, 2, screen), { left: 260, top: 210, width: 600, height: 300 });
  });

  it('writes in thirtieths of the screen height, rounded as Mathf.RoundToInt', () => {
    expect(questUIFontSize(1.5, screen)).toBe(30);
    // 12.5 rounds to the even 12
    expect(questUIFontSize(0.75, { width: 800, height: 500 })).toBe(12);
  });

  it('draws borders 0.05 units thick', () => {
    expect(questUIBorder(screen)).toBeCloseTo(1, 6);
  });
});
