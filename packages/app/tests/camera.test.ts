// Tests of the board camera (board/camera.ts), written from Valkyrie's CameraController.cs and its scene, which have no
// NUnit tests. Not ported from Valkyrie.
import { describe, expect, it } from 'vitest';
import { CameraController, Vector3 } from '@universalis/engine';
import {
  boardToScreen,
  boardToScreenMatrix,
  drag,
  eye,
  followTarget,
  keepBoardInReach,
  limit,
  moveTowards,
  panKeys,
  pixelsPerUnit,
  screenToBoard,
  viewCentre,
  wheelAxis,
  wheelZoom,
  zoom,
} from '../src/board/camera.ts';

const view = { width: 1280, height: 800 };
const tan10 = Math.tan((10 * Math.PI) / 180);

function camera(x = 0, y = 0, z = -8): CameraController {
  const cc = new CameraController();
  cc.position = new Vector3(x, y, z);
  return cc;
}

describe('the scene camera', () => {
  it('looks at the board above its position, tilted ten degrees', () => {
    const c = viewCentre(new Vector3(2, 3, -8));
    expect(c.x).toBeCloseTo(2, 5);
    expect(c.y).toBeCloseTo(3 + 8 * tan10, 5);
  });

  it('shows less of the board when it comes closer', () => {
    // Vertical field of view of 60 degrees, at the distance along the tilted view
    const distance = 8 / Math.cos((10 * Math.PI) / 180);
    expect(pixelsPerUnit(-8, view)).toBeCloseTo(800 / (2 * distance * Math.tan(Math.PI / 6)), 5);
    expect(pixelsPerUnit(-2, view)).toBeGreaterThan(pixelsPerUnit(-8, view));
  });

  it('puts the point it looks at in the middle of the screen, and back', () => {
    const position = new Vector3(4, -2, -8);
    const c = viewCentre(position);
    expect(boardToScreen(c, position, view)).toEqual({ x: 640, y: 400 });
    const p = screenToBoard(100, 700, position, view);
    const back = boardToScreen(p, position, view);
    expect(back.x).toBeCloseTo(100, 6);
    expect(back.y).toBeCloseTo(700, 6);
    // Board y goes up, screen y goes down
    expect(p.y).toBeLessThan(c.y);
    expect(p.x).toBeLessThan(c.x);
  });
});

describe('the perspective', () => {
  /** Screen pixels a board unit takes across, at this board point. */
  const across = (x: number, y: number, position: Vector3, v: typeof view & { tilt?: number }) =>
    boardToScreen({ x: x + 0.5, y }, position, v).x - boardToScreen({ x: x - 0.5, y }, position, v).x;

  it('is drawn by Valkyrie\'s own camera when it leans ten degrees', () => {
    const position = new Vector3(3, -1, -8);
    const e = eye(position, view);
    expect(e.x).toBeCloseTo(3, 6);
    expect(e.y).toBeCloseTo(-1, 6);
    expect(e.z).toBeCloseTo(-8, 6);
  });

  it('makes the far side of the board smaller, as a board on a table', () => {
    const position = new Vector3(0, 0, -8);
    const top = screenToBoard(640, 100, position, view);
    const bottom = screenToBoard(640, 700, position, view);
    expect(top.y).toBeGreaterThan(bottom.y);
    expect(across(0, top.y, position, view)).toBeLessThan(across(0, bottom.y, position, view));
  });

  it('finds the board point under the pointer by casting the ray, wherever it is on the screen', () => {
    const position = new Vector3(-2, 5, -12);
    for (const [x, y] of [
      [0, 0],
      [1280, 800],
      [640, 400],
      [200, 650],
    ] as const) {
      const p = screenToBoard(x, y, position, view);
      const back = boardToScreen(p, position, view);
      expect(back.x).toBeCloseTo(x, 6);
      expect(back.y).toBeCloseTo(y, 6);
    }
  });

  it('leaning more keeps the middle of the screen and its scale, and makes the far side smaller still', () => {
    const position = new Vector3(1, 2, -8);
    const steep = { ...view, tilt: 35 };
    const c = viewCentre(position);
    const centre = boardToScreen(c, position, steep);
    expect(centre.x).toBeCloseTo(640, 6);
    expect(centre.y).toBeCloseTo(400, 6);
    expect(across(c.x, c.y, position, steep)).toBeCloseTo(pixelsPerUnit(-8, steep), 4);
    const ratio = (v: typeof steep) => across(0, screenToBoard(640, 80, position, v).y, position, v) / across(0, screenToBoard(640, 720, position, v).y, position, v);
    expect(ratio(steep)).toBeLessThan(ratio({ ...view, tilt: 10 }));
  });

  it('gives the shader the same perspective, with the depth to clip what is behind the camera', () => {
    const position = new Vector3(2, -3, -6);
    const steep = { ...view, tilt: 30 };
    const m = boardToScreenMatrix(position, steep);
    const apply = (x: number, y: number) => [0, 1, 2, 3].map((row) => m[row]! * x + m[4 + row]! * y + m[12 + row]!);
    for (const [x, y] of [
      [2, 1],
      [-4, 6],
      [7, -1],
    ] as const) {
      const [px, py, z, w] = apply(x, y) as [number, number, number, number];
      const screen = boardToScreen({ x, y }, position, steep);
      expect(w).toBeGreaterThan(0);
      expect(px / w).toBeCloseTo(screen.x, 4);
      expect(py / w).toBeCloseTo(screen.y, 4);
      expect(Math.abs(z)).toBeLessThanOrEqual(w);
    }
    // Far below the camera, the board is behind it: the near plane cuts it
    const [, , zBehind, wBehind] = apply(2, -40) as [number, number, number, number];
    expect(zBehind < -wBehind || wBehind < 0).toBe(true);
  });
});

describe('CameraController', () => {
  it('zooms with the wheel, fifteen units per unit of axis, and stops following its target', () => {
    const cc = camera();
    cc.targetSet = true;
    zoom(cc, wheelZoom(wheelAxis(-100, 0)));
    expect(cc.position.z).toBeCloseTo(-6.5, 5);
    expect(cc.targetSet).toBe(false);
  });

  it('reads one wheel notch as 0.1 of axis, in pixels or in lines', () => {
    expect(wheelAxis(-100, 0)).toBeCloseTo(0.1, 6);
    expect(wheelAxis(3, 1)).toBeCloseTo(-0.1, 6);
  });

  it('keeps the zoom between -25 and -1', () => {
    const cc = camera();
    zoom(cc, 10);
    expect(cc.position.z).toBe(-1);
    zoom(cc, -20);
    zoom(cc, -20);
    expect(cc.position.z).toBe(-25);
  });

  it('moves fifteen units a second with the arrow keys', () => {
    const cc = camera();
    cc.targetSet = true;
    panKeys(cc, new Set(['right', 'down']), 0.5);
    expect(cc.position.x).toBeCloseTo(7.5, 5);
    expect(cc.position.y).toBeCloseTo(-7.5, 5);
    expect(cc.targetSet).toBe(false);
  });

  it('stops following its target with opposite keys, without moving', () => {
    const cc = camera();
    cc.targetSet = true;
    panKeys(cc, new Set(['left', 'right']), 1);
    expect(cc.position.x).toBe(0);
    expect(cc.targetSet).toBe(false);
  });

  it('does not move with the keys while panning is disabled', () => {
    const cc = camera();
    CameraController.panDisable = true;
    try {
      panKeys(cc, new Set(['right']), 1);
    } finally {
      CameraController.panDisable = false;
    }
    expect(cc.position.x).toBe(0);
  });

  it('keeps the point grabbed under the pointer while dragging', () => {
    const cc = camera(1, 1, -8);
    const grabbed = screenToBoard(300, 200, cc.position, view);
    drag(cc, grabbed, screenToBoard(500, 260, cc.position, view));
    const under = screenToBoard(500, 260, cc.position, view);
    expect(under.x).toBeCloseTo(grabbed.x, 5);
    expect(under.y).toBeCloseTo(grabbed.y, 5);
  });

  it('applies the pan limits the quest sets', () => {
    const cc = camera(-80, 90);
    limit(cc);
    expect([cc.position.x, cc.position.y]).toEqual([-80, 90]);
    cc.minLimit = true;
    cc.minPanX = -10;
    cc.minPanY = -5;
    cc.maxLimit = true;
    cc.maxPanX = 20;
    cc.maxPanY = 6;
    limit(cc);
    expect([cc.position.x, cc.position.y]).toEqual([-10, 6]);
  });

  it('moves towards its target at twelve units a second and stops close to it', () => {
    const cc = camera(0, 0, -8);
    cc.targetSet = true;
    cc.camTarget = new Vector3(6, 0, -8);
    followTarget(cc, 0.25);
    expect(cc.position.x).toBeCloseTo(3, 5);
    followTarget(cc, 0.25);
    expect(cc.position.x).toBeCloseTo(6, 5);
    expect(cc.targetSet).toBe(true);
    followTarget(cc, 0.25);
    expect(cc.targetSet).toBe(false);
  });

  it('stops without reaching a target closer than 0.1', () => {
    const cc = camera(0, 0, -8);
    cc.targetSet = true;
    cc.camTarget = new Vector3(0.05, 0, -8);
    followTarget(cc, 1);
    expect(cc.position.x).toBe(0);
    expect(cc.targetSet).toBe(false);
  });

  it('moves in a straight line, as Vector3.MoveTowards', () => {
    const p = moveTowards(new Vector3(0, 0, 0), new Vector3(3, 4, 0), 1);
    expect(p.x).toBeCloseTo(0.6, 5);
    expect(p.y).toBeCloseTo(0.8, 5);
    expect(moveTowards(new Vector3(0, 0, 0), new Vector3(3, 4, 0), 5)).toEqual(new Vector3(3, 4, 0));
  });
});

// Not in Valkyrie (16 November 2026): the board cannot be lost from view
describe('the board kept in reach', () => {
  // The two tiles of a Strain on Reality game on an iPad held upright, with its camera where the player's save had it
  const pond = { left: -14 - 3, right: 0 + 3, bottom: -3.5 - 3, top: -3.5 + 3 };
  const ipad = { width: 820, height: 1148 };

  it('brings a camera saved far from every piece back to them', () => {
    const cc = camera(-36.96879, -70.18026, -23.93919);
    keepBoardInReach(cc, pond, ipad);
    // A piece's edge is on the screen: within REACH of half a screen of its middle
    const corner = boardToScreen({ x: pond.left, y: pond.bottom }, cc.position, ipad);
    expect(corner.x).toBeGreaterThan(0);
    expect(corner.x).toBeLessThan(ipad.width);
    expect(corner.y).toBeGreaterThan(0);
    expect(corner.y).toBeLessThan(ipad.height);
    // The zoom stays the player's
    expect(cc.position.z).toBeCloseTo(-23.93919);
  });

  it('leaves alone a camera that shows the board, one heading for a target, and an empty board', () => {
    const near = camera(-7, -5, -10);
    keepBoardInReach(near, pond, ipad);
    expect([near.position.x, near.position.y]).toEqual([-7, -5]);

    const heading = camera(-40, -70, -10);
    heading.targetSet = true;
    keepBoardInReach(heading, pond, ipad);
    expect([heading.position.x, heading.position.y]).toEqual([-40, -70]);

    const empty = camera(-40, -70, -10);
    keepBoardInReach(empty, null, ipad);
    expect([empty.position.x, empty.position.y]).toEqual([-40, -70]);
  });

  it('lets the camera go further when zoomed out', () => {
    const close = camera(100, -3.5, -5);
    keepBoardInReach(close, pond, view);
    const far = camera(100, -3.5, -25);
    keepBoardInReach(far, pond, view);
    expect(far.position.x).toBeGreaterThan(close.position.x);
    expect(close.position.x).toBeGreaterThan(pond.right);
  });
});
