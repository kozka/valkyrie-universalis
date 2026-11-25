// The pictures of PVR files, which browsers cannot draw: the two ETC2 formats that Valkyrie's importer writes on
// Android and its ContentData.PvrToTexture reads, decoded to RGBA as the OpenGL ES 3.0 specification describes them
// (annex C.1). As with DDS (dds.ts), the importer keeps Unity's rows, so the first row of the file is the bottom of the
// picture. Not ported from Valkyrie, which hands the data to Unity (LoadRawTextureData).
import type { Pixels } from './dds.ts';

const HEADER_SIZE = 52;
/** PVR's pixel formats that Valkyrie reads: ETC2 RGB, and ETC2 RGBA with EAC alpha. */
const ETC2_RGB = 22;
const ETC2_RGBA = 23;

/** The picture of a PVR file as Valkyrie draws it, or null for a format it cannot draw or a file too short. */
// Valkyrie: ContentData.cs ContentData.PvrToTexture (the header; the pixels as Unity reads them)
export function decodePvr(bytes: Uint8Array): Pixels | null {
  if (bytes.length < HEADER_SIZE) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  // Valkyrie reads the pixel format as a 64-bit number; both of its formats fit the low half
  const format = view.getUint32(12, true) === 0 ? view.getUint32(8, true) : -1;
  const height = view.getInt32(24, true);
  const width = view.getInt32(28, true);
  if (format !== ETC2_RGB && format !== ETC2_RGBA) return null;
  const blockSize = format === ETC2_RGBA ? 16 : 8;
  const across = Math.ceil(width / 4);
  const down = Math.ceil(height / 4);
  // Smaller copies (mipmaps) may follow the picture: LoadRawTextureData reads the first, without them
  if (width <= 0 || height <= 0 || bytes.length - HEADER_SIZE < across * down * blockSize) return null;
  const data = bytes.subarray(HEADER_SIZE);
  const pixels = new Uint8ClampedArray(width * height * 4);
  const block = new Uint8ClampedArray(64);
  for (let by = 0; by < down; by++) {
    for (let bx = 0; bx < across; bx++) {
      const at = (by * across + bx) * blockSize;
      decodeColours(data, format === ETC2_RGBA ? at + 8 : at, block);
      if (format === ETC2_RGBA) decodeAlpha(data, at, block);
      for (let y = 0; y < 4 && by * 4 + y < height; y++) {
        const row = (height - 1 - (by * 4 + y)) * width;
        for (let x = 0; x < 4 && bx * 4 + x < width; x++) {
          const from = (y * 4 + x) * 4;
          const to = (row + bx * 4 + x) * 4;
          pixels[to] = block[from]!;
          pixels[to + 1] = block[from + 1]!;
          pixels[to + 2] = block[from + 2]!;
          pixels[to + 3] = block[from + 3]!;
        }
      }
    }
  }
  return { width, height, data: pixels };
}

/** ETC's intensity modifiers by table codeword, then by pixel index (C.1.1). */
const MODIFIERS = [
  [2, 8, -2, -8],
  [5, 17, -5, -17],
  [9, 29, -9, -29],
  [13, 42, -13, -42],
  [18, 60, -18, -60],
  [24, 80, -24, -80],
  [33, 106, -33, -106],
  [47, 183, -47, -183],
];

/** The distances of the T and H modes. */
const DISTANCES = [3, 6, 11, 16, 23, 32, 41, 64];

/** EAC's alpha modifiers, by table index. */
const ALPHA_MODIFIERS = [
  [-3, -6, -9, -15, 2, 5, 8, 14],
  [-3, -7, -10, -13, 2, 6, 9, 12],
  [-2, -5, -8, -13, 1, 4, 7, 12],
  [-2, -4, -6, -13, 1, 3, 5, 12],
  [-3, -6, -8, -12, 2, 5, 7, 11],
  [-3, -7, -9, -11, 2, 6, 8, 10],
  [-4, -7, -8, -11, 3, 6, 7, 10],
  [-3, -5, -8, -11, 2, 4, 7, 10],
  [-2, -6, -8, -10, 1, 5, 7, 9],
  [-2, -5, -8, -10, 1, 4, 7, 9],
  [-2, -4, -8, -10, 1, 3, 7, 9],
  [-2, -5, -7, -10, 1, 4, 6, 9],
  [-3, -4, -7, -10, 2, 3, 6, 9],
  [-1, -2, -3, -10, 0, 1, 2, 9],
  [-4, -6, -8, -9, 3, 5, 7, 8],
  [-3, -5, -7, -9, 2, 4, 6, 8],
];

/** A colour channel of 4, 5, 6 or 7 bits as 8 bits. */
const expand4 = (c: number) => c * 17;
const expand5 = (c: number) => (c << 3) | (c >> 2);
const expand6 = (c: number) => (c << 2) | (c >> 4);
const expand7 = (c: number) => (c << 1) | (c >> 6);

/** A three-bit two's complement number. */
const signed3 = (c: number) => (c >= 4 ? c - 8 : c);

/** The colours a block's pixels pick by index, three channels each: four, then four more for the second half. */
const paint = new Int32Array(24);

/** An ETC2 RGB block (8 bytes, the first holding the highest bits) as 4×4 RGBA pixels, row by row: C.1.1 to C.1.5. */
function decodeColours(data: Uint8Array, at: number, out: Uint8ClampedArray): void {
  const b0 = data[at]!;
  const b1 = data[at + 1]!;
  const b2 = data[at + 2]!;
  const b3 = data[at + 3]!;
  let halves = true;
  if ((b3 & 2) === 0) {
    // Individual mode: two colours of four bits a channel
    const first = [expand4(b0 >> 4), expand4(b1 >> 4), expand4(b2 >> 4)] as const;
    paintHalves(...first, expand4(b0 & 15), expand4(b1 & 15), expand4(b2 & 15), b3);
  } else {
    const r = (b0 >> 3) + signed3(b0 & 7);
    const g = (b1 >> 3) + signed3(b1 & 7);
    const b = (b2 >> 3) + signed3(b2 & 7);
    if (r < 0 || r > 31) {
      // T mode: one colour, and three around another
      halves = false;
      const d = DISTANCES[(((b3 >> 2) & 3) << 1) | (b3 & 1)]!;
      const r2 = expand4(b2 >> 4);
      const g2 = expand4(b2 & 15);
      const bl2 = expand4(b3 >> 4);
      setPaint(0, expand4((((b0 >> 3) & 3) << 2) | (b0 & 3)), expand4(b1 >> 4), expand4(b1 & 15));
      setPaint(1, r2 + d, g2 + d, bl2 + d);
      setPaint(2, r2, g2, bl2);
      setPaint(3, r2 - d, g2 - d, bl2 - d);
    } else if (g < 0 || g > 31) {
      // H mode: two colours, each with two around it
      halves = false;
      const r1 = (b0 >> 3) & 15;
      const g1 = ((b0 & 7) << 1) | ((b1 >> 4) & 1);
      const bl1 = (((b1 >> 3) & 1) << 3) | ((b1 & 3) << 1) | (b2 >> 7);
      const r2 = (b2 >> 3) & 15;
      const g2 = ((b2 & 7) << 1) | (b3 >> 7);
      const bl2 = (b3 >> 3) & 15;
      const order = ((r1 << 8) | (g1 << 4) | bl1) >= ((r2 << 8) | (g2 << 4) | bl2) ? 1 : 0;
      const d = DISTANCES[(((b3 >> 2) & 1) << 2) | ((b3 & 1) << 1) | order]!;
      setPaint(0, expand4(r1) + d, expand4(g1) + d, expand4(bl1) + d);
      setPaint(1, expand4(r1) - d, expand4(g1) - d, expand4(bl1) - d);
      setPaint(2, expand4(r2) + d, expand4(g2) + d, expand4(bl2) + d);
      setPaint(3, expand4(r2) - d, expand4(g2) - d, expand4(bl2) - d);
    } else if (b < 0 || b > 31) {
      decodePlanar(data, at, out);
      return;
    } else {
      // Differential mode: a colour of five bits a channel, and another three bits away
      paintHalves(expand5(b0 >> 3), expand5(b1 >> 3), expand5(b2 >> 3), expand5(r), expand5(g), expand5(b), b3);
    }
  }
  // Each pixel's two-bit index: its high bit in the first two of the last four bytes, its low bit in the other two,
  // counted down the columns (bit x * 4 + y); in two halves, side by side or one over the other
  const high = (data[at + 4]! << 8) | data[at + 5]!;
  const low = (data[at + 6]! << 8) | data[at + 7]!;
  const flip = (b3 & 1) === 1;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const bit = x * 4 + y;
      let i = (((high >> bit) & 1) << 1) | ((low >> bit) & 1);
      if (halves && (flip ? y >= 2 : x >= 2)) i += 4;
      const p = (y * 4 + x) * 4;
      out[p] = paint[i * 3]!;
      out[p + 1] = paint[i * 3 + 1]!;
      out[p + 2] = paint[i * 3 + 2]!;
      out[p + 3] = 255;
    }
  }
}

function setPaint(i: number, r: number, g: number, b: number): void {
  paint[i * 3] = r;
  paint[i * 3 + 1] = g;
  paint[i * 3 + 2] = b;
}

/** Individual and differential modes: each half's colour with the four modifiers of its table. */
function paintHalves(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number, b3: number): void {
  const first = MODIFIERS[b3 >> 5]!;
  const second = MODIFIERS[(b3 >> 2) & 7]!;
  for (let i = 0; i < 4; i++) {
    setPaint(i, r1 + first[i]!, g1 + first[i]!, b1 + first[i]!);
    setPaint(i + 4, r2 + second[i]!, g2 + second[i]!, b2 + second[i]!);
  }
}

/** Planar mode: a colour at the origin and the colours across and down, blended over the block. */
function decodePlanar(data: Uint8Array, at: number, out: Uint8ClampedArray): void {
  const b0 = data[at]!;
  const b1 = data[at + 1]!;
  const b2 = data[at + 2]!;
  const b3 = data[at + 3]!;
  const b4 = data[at + 4]!;
  const b5 = data[at + 5]!;
  const b6 = data[at + 6]!;
  const b7 = data[at + 7]!;
  const origin = [
    expand6((b0 >> 1) & 63),
    expand7(((b0 & 1) << 6) | ((b1 >> 1) & 63)),
    expand6(((b1 & 1) << 5) | (((b2 >> 3) & 3) << 3) | ((b2 & 3) << 1) | (b3 >> 7)),
  ];
  const across = [expand6((((b3 >> 2) & 31) << 1) | (b3 & 1)), expand7(b4 >> 1), expand6(((b4 & 1) << 5) | (b5 >> 3))];
  const down = [expand6(((b5 & 7) << 3) | (b6 >> 5)), expand7(((b6 & 31) << 2) | (b7 >> 6)), expand6(b7 & 63)];
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const p = (y * 4 + x) * 4;
      for (let c = 0; c < 3; c++) {
        out[p + c] = (x * (across[c]! - origin[c]!) + y * (down[c]! - origin[c]!) + 4 * origin[c]! + 2) >> 2;
      }
      out[p + 3] = 255;
    }
  }
}

/** The EAC alpha block (8 bytes) in front of an ETC2 RGBA block, into the pixels' fourth channel: C.1.6. */
function decodeAlpha(data: Uint8Array, at: number, out: Uint8ClampedArray): void {
  const base = data[at]!;
  const multiplier = data[at + 1]! >> 4;
  const table = ALPHA_MODIFIERS[data[at + 1]! & 15]!;
  // Sixteen three-bit indices from the highest bit, counted down the columns
  const high = (data[at + 2]! << 16) | (data[at + 3]! << 8) | data[at + 4]!;
  const low = (data[at + 5]! << 16) | (data[at + 6]! << 8) | data[at + 7]!;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const i = x * 4 + y;
      const bits = i < 8 ? high : low;
      out[(y * 4 + x) * 4 + 3] = base + table[(bits >> (21 - (i % 8) * 3)) & 7]! * multiplier;
    }
  }
}
