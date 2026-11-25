// The parts of Unity's GameObject, Transform and UI Image that Valkyrie's board code sets, so the app can draw them.
// Not ported from Valkyrie. Positions are in board units with y up, as in Unity; rotations are degrees around z.
import { Color } from './Color.ts';
import type { Texture2D } from './Texture2D.ts';
import { Vector2 } from './Vector2.ts';
import { Vector3 } from './Vector3.ts';

export class Transform {
  position = new Vector3();
  /** Rotation around the z axis, in degrees. */
  rotation = 0;

  /** Transform.Translate(translation, Space.World) */
  translate(x: number, y: number): void {
    this.position = new Vector3(this.position.x + x, this.position.y + y, this.position.z);
  }

  /** Transform.RotateAround(point, Vector3.forward, angle): moves the position around point and turns the object. */
  rotateAround(point: Vector3, angle: number): void {
    const radians = (angle * Math.PI) / 180;
    const dx = this.position.x - point.x;
    const dy = this.position.y - point.y;
    this.position = new Vector3(
      point.x + dx * Math.cos(radians) - dy * Math.sin(radians),
      point.y + dx * Math.sin(radians) + dy * Math.cos(radians),
      this.position.z,
    );
    this.rotation = Math.fround(this.rotation + angle);
  }
}

/** UnityEngine.UI.Image with its RectTransform size. */
export class Image {
  color: Color = Color.white;
  /** Sprite.Create(texture, …) */
  sprite: Texture2D | null = null;
  /** A sprite from Valkyrie's own Resources folder (Resources.Load), such as "sprites/target". */
  resource: string | null = null;
  /** RectTransform.sizeDelta */
  sizeDelta: Vector2 = new Vector2(100, 100);
}

export class GameObject {
  readonly name: string;
  tag = 'Untagged';
  readonly transform = new Transform();
  /** AddComponent<Image>() */
  image: Image | null = null;
  /** AddComponent<SpritePulser>(): the image pulses. */
  pulser = false;

  constructor(name: string) {
    this.name = name;
  }

  /** gameObject.AddComponent<Image>() */
  addImage(): Image {
    this.image = new Image();
    return this.image;
  }
}
