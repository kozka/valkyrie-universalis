// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/CameraController.cs
// The per-frame part of CameraController (FixedUpdate and Update: wheel, pinch, arrow keys, dragging, limits and the move
// to the target) and the scene's camera, a perspective camera that leans over the board as over a table. The state
// (position, target, limits) is the engine's CameraController. The app may lean the camera more than Valkyrie does: it
// turns around the point Valkyrie's camera looks at, at the same distance, so the middle of the screen shows the same.
import { CameraController, Vector3 } from '@universalis/engine';

// How fast to move the screen when arrows used (per FixedUpdate)
const keyScrollRate = 0.3;
// How much to zoom in/out with wheel
const mouseWheelScrollRate = 15;
// Max zoom in
const maxZoom = -1;
// Max zoom out
const minZoom = -25;
// Pinch zoom speed
const pinchZoomSpeed = 0.05;
/** Unity's Time.fixedDeltaTime: FixedUpdate runs 50 times a second. */
const fixedDeltaTime = 0.02;

/** The scene's camera: rotation (-10, 0, 0), so it looks a little up the board, and a vertical field of view of 60°. */
export const VALKYRIE_TILT = 10;
const TILT = (VALKYRIE_TILT * Math.PI) / 180;
const HALF_FIELD_OF_VIEW = Math.PI / 6;
/** The camera's clipping planes: nothing nearer than this is drawn. */
const NEAR_CLIP = 0.3;
const FAR_CLIP = 10000;

export interface ViewSize {
  width: number;
  height: number;
  /** How far the camera leans from looking straight down, in degrees: Valkyrie's when not given. */
  tilt?: number;
}

export interface BoardPoint {
  x: number;
  y: number;
}

export type ArrowKey = 'up' | 'down' | 'left' | 'right';

/** The point of the board at the middle of the screen, where the camera looks. */
export function viewCentre(position: Vector3): BoardPoint {
  return { x: position.x, y: position.y + Math.abs(position.z) * Math.tan(TILT) };
}

/** Not in Valkyrie: where the camera goes to show this point in the middle of the screen at this height (the editor's map). */
export function positionShowing(centre: BoardPoint, z: number): Vector3 {
  const height = Math.min(maxZoom, Math.max(minZoom, z));
  return new Vector3(centre.x, centre.y - Math.abs(height) * Math.tan(TILT), height);
}

/** Screen pixels per board unit at the middle of the screen, for a camera at this height. */
export function pixelsPerUnit(z: number, view: ViewSize): number {
  const distance = Math.abs(z) / Math.cos(TILT);
  return view.height / (2 * distance * Math.tan(HALF_FIELD_OF_VIEW));
}

/** The camera that draws the board: where it is and how it leans. With Valkyrie's tilt it is Valkyrie's camera. */
interface Lens {
  /** In doubles: Vector3 keeps Unity's floats. */
  eye: { x: number; y: number; z: number };
  sin: number;
  cos: number;
  /** Pixels per unit of the view plane at distance 1. */
  focal: number;
}

function lens(position: Vector3, view: ViewSize): Lens {
  const tilt = ((view.tilt ?? VALKYRIE_TILT) * Math.PI) / 180;
  const centre = viewCentre(position);
  // The distance from Valkyrie's camera to the point it looks at
  const distance = Math.abs(position.z) / Math.cos(TILT);
  const sin = Math.sin(tilt);
  const cos = Math.cos(tilt);
  return {
    eye: { x: centre.x, y: centre.y - distance * sin, z: -distance * cos },
    sin,
    cos,
    focal: view.height / 2 / Math.tan(HALF_FIELD_OF_VIEW),
  };
}

/** Where the camera that draws the board is: Valkyrie's position when it leans as Valkyrie's. */
export function eye(position: Vector3, view: ViewSize): { x: number; y: number; z: number } {
  return lens(position, view).eye;
}

/** Where a board point is on the screen (pixels from the top left; board y goes up, screen y down), in perspective. */
export function boardToScreen(point: BoardPoint, position: Vector3, view: ViewSize): BoardPoint {
  const { eye, sin, cos, focal } = lens(position, view);
  const rx = point.x - eye.x;
  const ry = point.y - eye.y;
  const rz = -eye.z;
  // The camera's right is the board's x; its up and its forward lean by the tilt
  const up = ry * cos - rz * sin;
  const depth = ry * sin + rz * cos;
  return { x: view.width / 2 + (focal * rx) / depth, y: view.height / 2 - (focal * up) / depth };
}

// Get mouse position in board space coordinates: the ray from the camera through the pointer meets the board
// Valkyrie: CameraController.cs CameraController.GetMouseBoardPlane
export function screenToBoard(x: number, y: number, position: Vector3, view: ViewSize): BoardPoint {
  const { eye, sin, cos, focal } = lens(position, view);
  const a = (x - view.width / 2) / focal;
  const b = -(y - view.height / 2) / focal;
  // Ray direction: right * a + up * b + forward
  const dy = b * cos + sin;
  const dz = -b * sin + cos;
  const distance = -eye.z / dz;
  return { x: eye.x + distance * a, y: eye.y + distance * dy };
}

/**
 * The perspective as a matrix for the board's shader (column-major): a board point (x, y, 0, 1) becomes
 * (px·w, py·w, z, w), with (px, py) its pixel on the screen as boardToScreen gives it, w its depth, and z clipping it
 * at the camera's near and far planes.
 */
export function boardToScreenMatrix(position: Vector3, view: ViewSize, out = new Float32Array(16)): Float32Array {
  const { eye, sin, cos, focal } = lens(position, view);
  const halfWidth = view.width / 2;
  const halfHeight = view.height / 2;
  // depth = sin·y + depthOffset; up = cos·y + upOffset
  const depthOffset = -eye.y * sin - eye.z * cos;
  const upOffset = -eye.y * cos + eye.z * sin;
  const zScale = (FAR_CLIP + NEAR_CLIP) / (FAR_CLIP - NEAR_CLIP);
  const zOffset = (-2 * FAR_CLIP * NEAR_CLIP) / (FAR_CLIP - NEAR_CLIP);
  // Column 0: x
  out[0] = focal;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  // Column 1: y
  out[4] = halfWidth * sin;
  out[5] = halfHeight * sin - focal * cos;
  out[6] = zScale * sin;
  out[7] = sin;
  // Column 2: z, always 0 on the board
  out[8] = 0;
  out[9] = 0;
  out[10] = 0;
  out[11] = 0;
  // Column 3: the constant part
  out[12] = halfWidth * depthOffset - focal * eye.x;
  out[13] = halfHeight * depthOffset - focal * upOffset;
  out[14] = zScale * depthOffset + zOffset;
  out[15] = depthOffset;
  return out;
}

/** Input.GetAxis("Mouse ScrollWheel") for a wheel event: 0.1 a notch, positive away from the player. */
export function wheelAxis(deltaY: number, deltaMode: number): number {
  // A notch is 100 pixels, 3 lines or a page
  const pixels = deltaMode === 1 ? (deltaY * 100) / 3 : deltaMode === 2 ? deltaY * 100 : deltaY;
  return -pixels / 1000;
}

/** How far the wheel moves the camera. */
export function wheelZoom(axis: number): number {
  return axis * mouseWheelScrollRate;
}

/** How far a pinch moves the camera: the change of the distance between the touches, in device pixels. */
export function pinchZoom(distanceChange: number): number {
  return distanceChange * pinchZoomSpeed;
}

// The wheel and the pinch move the camera up or down
// Valkyrie: CameraController.cs CameraController.FixedUpdate (zoomed)
export function zoom(cc: CameraController, dz: number): void {
  // Translate the camera up/down
  let z = cc.position.z + dz;
  // disable automatic translating to avoid loops
  cc.targetSet = false;

  // Limit how high/low the camera can go
  if (z > maxZoom) z = maxZoom;
  if (z < minZoom) z = minZoom;
  cc.position = new Vector3(cc.position.x, cc.position.y, z);
}

// Check for arrow keys and move camera around (keyScrollRate each FixedUpdate)
// Valkyrie: CameraController.cs CameraController.FixedUpdate (arrow keys)
export function panKeys(cc: CameraController, held: ReadonlySet<ArrowKey>, deltaTime: number): void {
  if (CameraController.panDisable || held.size === 0) return;
  const rate = (keyScrollRate / fixedDeltaTime) * deltaTime;
  let { x, y } = cc.position;
  if (held.has('up')) y += rate;
  if (held.has('down')) y -= rate;
  if (held.has('left')) x -= rate;
  if (held.has('right')) x += rate;
  // disable automatic translating to avoid loops
  cc.targetSet = false;
  cc.position = new Vector3(x, y, cc.position.z);
}

// If mouse is held down update camera: the point grabbed stays under the pointer
// Valkyrie: CameraController.cs CameraController.Update (dragging)
export function drag(cc: CameraController, grabbed: BoardPoint, under: BoardPoint): void {
  cc.position = new Vector3(cc.position.x + grabbed.x - under.x, cc.position.y + grabbed.y - under.y, cc.position.z);
  // dragging disables target moving
  cc.targetSet = false;
}

// Limit camera movement
// Valkyrie: CameraController.cs CameraController.FixedUpdate and Update (limit camera position)
export function limit(cc: CameraController): void {
  let { x, y } = cc.position;
  if (cc.minLimit) {
    if (x < cc.minPanX) x = cc.minPanX;
    if (y < cc.minPanY) y = cc.minPanY;
  }
  if (cc.maxLimit) {
    if (x > cc.maxPanX) x = cc.maxPanX;
    if (y > cc.maxPanY) y = cc.maxPanY;
  }
  if (x !== cc.position.x || y !== cc.position.y) cc.position = new Vector3(x, y, cc.position.z);
}

// If we are moving to a target position
// Valkyrie: CameraController.cs CameraController.Update (targetSet)
// Not in Valkyrie: keepZoom (an advanced option, Valkyrie issue #466) moves only across the board, at the player's zoom
export function followTarget(cc: CameraController, deltaTime: number, keepZoom = false): void {
  if (!cc.targetSet) return;
  if (keepZoom && cc.camTarget.z !== cc.position.z) cc.camTarget = new Vector3(cc.camTarget.x, cc.camTarget.y, cc.position.z);
  // Calculate distance to target
  const camJumpDist = distance(cc.position, cc.camTarget);
  // Are we close?
  if (camJumpDist > 0.1) {
    // How many units to move this frame
    const moveDist = deltaTime * CameraController.autoPanSpeed;
    cc.position = moveTowards(cc.position, cc.camTarget, moveDist);
  } else {
    // Close enough to target, finish move
    cc.targetSet = false;
  }
}

/** Vector3.MoveTowards */
export function moveTowards(current: Vector3, target: Vector3, maxDistanceDelta: number): Vector3 {
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  const dz = target.z - current.z;
  const sqdist = dx * dx + dy * dy + dz * dz;
  if (sqdist === 0 || (maxDistanceDelta >= 0 && sqdist <= maxDistanceDelta * maxDistanceDelta)) return target;
  const dist = Math.sqrt(sqdist);
  return new Vector3(current.x + (dx / dist) * maxDistanceDelta, current.y + (dy / dist) * maxDistanceDelta, current.z + (dz / dist) * maxDistanceDelta);
}

function distance(a: Vector3, b: Vector3): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

/** A box on the board, in board units: what the pieces on it cover. */
export interface BoardBox {
  left: number;
  right: number;
  bottom: number;
  top: number;
}

/**
 * Not in Valkyrie (16 November 2026): how far from the pieces the middle of the screen may go, as a share of half the
 * screen, so that some piece always stays in view.
 */
export const REACH = 0.5;

/**
 * Not in Valkyrie (16 November 2026), whose camera goes anywhere unless the scenario limits it: the middle of the screen
 * stays within REACH of half a screen from the pieces on the board, so the board cannot be lost. On an iPad whose map had
 * gone black, a player dragged blindly and saved with the camera sixty units away from every tile: the map then stayed
 * black. A game saved like that comes back to its board on its first frame. Nothing moves while the camera heads for an
 * event's target, nor without pieces.
 */
export function keepBoardInReach(cc: CameraController, pieces: BoardBox | null, view: ViewSize): void {
  if (pieces === null || cc.targetSet || view.width <= 0 || view.height <= 0) return;
  const perUnit = pixelsPerUnit(cc.position.z, view);
  const reachX = (view.width / 2 / perUnit) * REACH;
  const reachY = (view.height / 2 / perUnit) * REACH;
  const centre = viewCentre(cc.position);
  const x = Math.min(pieces.right + reachX, Math.max(pieces.left - reachX, centre.x));
  const y = Math.min(pieces.top + reachY, Math.max(pieces.bottom - reachY, centre.y));
  if (x === centre.x && y === centre.y) return;
  cc.position = new Vector3(x, cc.position.y + y - centre.y, cc.position.z);
}
