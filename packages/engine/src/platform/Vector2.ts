// UnityEngine.Vector2: two 32-bit floats. Not ported from Valkyrie.

export class Vector2 {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = Math.fround(x);
    this.y = Math.fround(y);
  }

  static get zero(): Vector2 {
    return new Vector2(0, 0);
  }
}
