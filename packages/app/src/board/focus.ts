// Not in Valkyrie (29 October 2026): where on the screen the camera brings the place an event points at. Valkyrie
// (CameraController.SetCamera) puts it in the middle of the screen, where the event's own window often covers it, above
// all on a phone; players could not see where to put what the event placed. This finds the largest part of the screen
// that the windows and the bars leave free, and the camera position that shows the place in its middle. Only the
// drawing changes: the engine's target stays Valkyrie's, and with no window open the camera goes where Valkyrie's goes.
import { Vector3 } from '@universalis/engine';
import { boardToScreen, pixelsPerUnit, type BoardPoint, type ViewSize } from './camera.ts';

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Narrower or lower than this, in pixels, a free part of the screen is not worth moving the camera for. */
const SMALLEST = 110;

/**
 * The middle of the largest part of the screen beside the windows (above, below, left or right of all of them),
 * inside the bounds the bars leave; null when there is no window, or no part of the screen is wide and tall enough.
 */
export function freeCentre(bounds: Box, windows: Box[]): BoardPoint | null {
  if (windows.length === 0) return null;
  const covered: Box = {
    left: Math.min(...windows.map((w) => w.left)),
    top: Math.min(...windows.map((w) => w.top)),
    right: Math.max(...windows.map((w) => w.right)),
    bottom: Math.max(...windows.map((w) => w.bottom)),
  };
  const parts: Box[] = [
    { ...bounds, bottom: Math.min(bounds.bottom, covered.top) },
    { ...bounds, top: Math.max(bounds.top, covered.bottom) },
    { ...bounds, right: Math.min(bounds.right, covered.left) },
    { ...bounds, left: Math.max(bounds.left, covered.right) },
  ];
  let best: Box | null = null;
  let bestScore = 0;
  for (const part of parts) {
    const width = part.right - part.left;
    const height = part.bottom - part.top;
    if (width < SMALLEST || height < SMALLEST) continue;
    // The roundest part shows a place with what is around it; between two as round, the bigger
    const score = Math.min(width, height) * 1e6 + width * height;
    if (score > bestScore) {
      best = part;
      bestScore = score;
    }
  }
  if (best === null) return null;
  return { x: (best.left + best.right) / 2, y: (best.top + best.bottom) / 2 };
}

/** The camera position that shows this board point at this point of the screen, at this height. */
export function positionShowingAt(place: BoardPoint, at: BoardPoint, z: number, view: ViewSize): Vector3 {
  let x = place.x;
  let y = place.y;
  const ppu = pixelsPerUnit(z, view);
  // The perspective is nearly flat around the middle: a few steps are enough
  for (let i = 0; i < 4; i++) {
    const seen = boardToScreen(place, new Vector3(x, y, z), view);
    // Board y goes up, screen y down
    x += (seen.x - at.x) / ppu;
    y += (at.y - seen.y) / ppu;
  }
  return new Vector3(x, y, z);
}
