// UnityEngine.Color: four 32-bit floats from 0 to 1. Not ported from Valkyrie.

export class Color {
  r: number;
  g: number;
  b: number;
  a: number;

  constructor(r: number, g: number, b: number, a = 1) {
    this.r = Math.fround(r);
    this.g = Math.fround(g);
    this.b = Math.fround(b);
    this.a = Math.fround(a);
  }

  static get white(): Color {
    return new Color(1, 1, 1, 1);
  }

  static get clear(): Color {
    return new Color(0, 0, 0, 0);
  }
}
