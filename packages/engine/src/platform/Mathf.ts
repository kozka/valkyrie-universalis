// UnityEngine.Mathf: the functions Valkyrie's game code uses. Not ported from Valkyrie.

const INT_MIN = -2147483648;
// Mathf.Epsilon: the smallest positive float
const FLOAT_EPSILON = 1.401298e-45;

export const Mathf = {
  /** Mathf.RoundToInt: the nearest integer, a half to the even one, as .NET's Math.Round; NaN or overflow give int.MinValue. */
  roundToInt(f: number): number {
    if (!Number.isFinite(f)) return INT_MIN;
    const floor = Math.floor(f);
    const diff = f - floor;
    let r: number;
    if (diff > 0.5) r = floor + 1;
    else if (diff < 0.5) r = floor;
    else r = floor % 2 === 0 ? floor : floor + 1;
    return r > 2147483647 || r < INT_MIN ? INT_MIN : r;
  },

  /** Mathf.Round: the nearest whole number, a half to the even one, as .NET's Math.Round. */
  round(f: number): number {
    const floor = Math.floor(f);
    const diff = f - floor;
    if (diff > 0.5) return floor + 1;
    if (diff < 0.5) return floor;
    return floor % 2 === 0 ? floor : floor + 1;
  },

  /** Mathf.Approximately: equal within a millionth of the larger value. */
  approximately(a: number, b: number): boolean {
    return Math.abs(b - a) < Math.max(0.000001 * Math.max(Math.abs(a), Math.abs(b)), FLOAT_EPSILON * 8);
  },
};
