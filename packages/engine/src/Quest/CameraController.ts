// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/CameraController.cs
// Partial: the camera state and the static calls that game code makes. Panning, zoom, dragging and the move towards
// the target each frame are the app's: it reads position, camTarget and targetSet, and applies the limits below.
// Valkyrie's scene starts the camera at (0, 0, -8), tilted -10 degrees around x.
import { Game } from '../Game.ts';
import { Mathf } from '../platform/Mathf.ts';
import type { Vector2 } from '../platform/Vector2.ts';
import { Vector3 } from '../platform/Vector3.ts';

// Class to control the game camera
// Used to pan/zoom around the board
// Valkyrie: CameraController.cs CameraController
export class CameraController {
  minLimit = false;
  maxLimit = false;
  // These are defaults, replaced by the quest
  minPanX = -50;
  minPanY = -50;
  maxPanX = 50;
  maxPanY = 50;

  // Units to move per second
  static autoPanSpeed = 12;
  // camera pan disable
  static panDisable = false;

  /** gameObject.transform.position */
  position = new Vector3(0, 0, -8);

  // Are we moving to a target position?
  targetSet = false;

  // Target position
  camTarget = new Vector3(0, 0, -8);

  /** The last picture of the screen, a PNG already at the size SaveManager stores; null when there is none. */
  screenShot: Uint8Array | null = null;

  // Update minimum camera pan
  // Valkyrie: CameraController.cs CameraController.SetCameraMin
  static setCameraMin(min: Vector2): void {
    const cc = Game.get().cc;
    cc.minPanX = Mathf.roundToInt(min.x);
    cc.minPanY = Mathf.roundToInt(min.y);
    cc.minLimit = true;
  }

  // Update maximum camera pan
  // Valkyrie: CameraController.cs CameraController.SetCameraMax
  static setCameraMax(max: Vector2): void {
    const cc = Game.get().cc;
    cc.maxPanX = Mathf.roundToInt(max.x);
    cc.maxPanY = Mathf.roundToInt(max.y);
    cc.maxLimit = true;
  }

  // Set camera target position
  // Valkyrie: CameraController.cs CameraController.SetCamera
  static setCamera(pos: Vector2): void {
    if (Game.get().config.data.get('UserConfig', 'viewLock') === '1' && !Game.get().editMode) {
      return;
    }

    const cc = Game.get().cc;
    cc.targetSet = true;

    let x = pos.x;
    let y = pos.y;
    let z = cc.position.z;

    // If not in editor reset zoom
    if (!Game.get().editMode) {
      z = -8;
    }

    if (cc.minLimit) {
      if (x < cc.minPanX) x = cc.minPanX;
      if (y < cc.minPanY) y = cc.minPanY;
    }
    if (cc.maxLimit) {
      if (x > cc.maxPanX) x = cc.maxPanX;
      if (y > cc.maxPanY) y = cc.maxPanY;
    }
    cc.camTarget = new Vector3(x, y, z);
  }

  /** The app takes the picture once the frame is drawn (IETakeScreenshot waits for its end), then calls back. */
  // Valkyrie: CameraController.cs CameraController.TakeScreenshot
  takeScreenshot(call: () => void): void {
    Game.get().ui.takeScreenshot((png) => {
      this.screenShot = png;
      call();
    });
  }
}
