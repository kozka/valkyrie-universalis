// UnityEngine.Random with an injectable seed, so tests and the battery repeat.
// Not ported from Valkyrie, which draws without a seed; the sequence is not Unity's (xorshift128 here too, seeded differently).

let s0 = 0;
let s1 = 0;
let s2 = 0;
let s3 = 0;

function next(): number {
  // xorshift128
  let t = s3;
  const s = s0;
  s3 = s2;
  s2 = s1;
  s1 = s;
  t ^= t << 11;
  t ^= t >>> 8;
  s0 = (t ^ s ^ (s >>> 19)) >>> 0;
  return s0;
}

export const Random = {
  /** Random.InitState: same seed, same sequence. */
  initState(seed: number): void {
    // splitmix32 to spread the seed over the four words
    let z = seed >>> 0;
    const mix = () => {
      z = (z + 0x9e3779b9) >>> 0;
      let x = z;
      x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0;
      x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0;
      return (x ^ (x >>> 16)) >>> 0;
    };
    s0 = mix();
    s1 = mix();
    s2 = mix();
    s3 = mix() || 1;
  },

  /** Random.Range(int min, int max): an integer from min (included) to max (excluded); min when max <= min. */
  range(min: number, max: number): number {
    if (max <= min) return min;
    return min + (next() % (max - min));
  },

  /** Random.Range(float min, float max): a float from min to max, both included. */
  rangeFloat(min: number, max: number): number {
    return Math.fround(min + (max - min) * Random.value());
  },

  /** Random.value: a float from 0 to 1, both included. */
  value(): number {
    return Math.fround(next() / 0xffffffff);
  },
};

Random.initState(Date.now());
