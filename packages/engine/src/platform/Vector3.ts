// UnityEngine.Vector3: three 32-bit floats. Not ported from Valkyrie.

export class Vector3 {
  x: number;
  y: number;
  z: number;

  constructor(x = 0, y = 0, z = 0) {
    this.x = Math.fround(x);
    this.y = Math.fround(y);
    this.z = Math.fround(z);
  }
}
