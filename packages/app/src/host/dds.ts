// The pictures of DDS files, which browsers cannot draw: the formats Valkyrie's importer writes and its
// ContentData.DdsToTexture reads, decoded to RGBA, and halved for smaller copies. Unity keeps the rows of a texture
// from the bottom, and the importer writes them as Unity has them, so the first row of the file is the bottom of the
// picture. Not ported from Valkyrie, which hands the data to Unity (LoadRawTextureData).

/** A decoded picture: its size, and its pixels as RGBA with the rows from the top, as ImageData has them. */
export interface Pixels {
  width: number;
  height: number;
  data: Uint8ClampedArray<ArrayBuffer>;
}

type Format = 'DXT1' | 'DXT5' | 'BGRA32' | 'RGBA32' | 'RGB24';

const HEADER_SIZE = 128;

/** The picture of a DDS file as Valkyrie draws it, or null for a format it cannot draw or a file too short. */
// Valkyrie: ContentData.cs ContentData.DdsToTexture (the header; the pixels as Unity reads them)
export function decodeDds(bytes: Uint8Array): Pixels | null {
  if (bytes.length < HEADER_SIZE || bytes[4] !== 124) return null;
  // Valkyrie reads two bytes of each size
  const height = bytes[13]! * 256 + bytes[12]!;
  const width = bytes[17]! * 256 + bytes[16]!;
  let format: Format;
  if (bytes[87] === 0x35 /* '5' */) format = 'DXT5';
  else if (bytes[87] === 0x31 /* '1' */) format = 'DXT1';
  else if (bytes[88] === 32) format = bytes[92] === 0 ? 'BGRA32' : 'RGBA32';
  else if (bytes[88] === 24) format = 'RGB24';
  else return null;
  const data = bytes.subarray(HEADER_SIZE);
  if (width === 0 || height === 0 || data.length < dataSize(format, width, height)) return null;
  const pixels = new Uint8ClampedArray(width * height * 4);
  if (format === 'DXT1' || format === 'DXT5') decodeBlocks(format, data, width, height, pixels);
  else decodeRows(format, data, width, height, pixels);
  return { width, height, data: pixels };
}

/** What LoadRawTextureData needs for the picture without smaller copies. */
function dataSize(format: Format, width: number, height: number): number {
  const blocks = Math.ceil(width / 4) * Math.ceil(height / 4);
  if (format === 'DXT1') return blocks * 8;
  if (format === 'DXT5') return blocks * 16;
  return width * height * (format === 'RGB24' ? 3 : 4);
}

/** Uncompressed rows, from the bottom. */
function decodeRows(format: Format, data: Uint8Array, width: number, height: number, out: Uint8ClampedArray): void {
  const size = format === 'RGB24' ? 3 : 4;
  for (let row = 0; row < height; row++) {
    const to = (height - 1 - row) * width * 4;
    for (let x = 0; x < width; x++) {
      const from = (row * width + x) * size;
      const at = to + x * 4;
      if (format === 'BGRA32') {
        out[at] = data[from + 2]!;
        out[at + 1] = data[from + 1]!;
        out[at + 2] = data[from]!;
      } else {
        out[at] = data[from]!;
        out[at + 1] = data[from + 1]!;
        out[at + 2] = data[from + 2]!;
      }
      out[at + 3] = size === 4 ? data[from + 3]! : 255;
    }
  }
}

/** DXT1 and DXT5: blocks of 4×4 pixels, row by row from the bottom, each with its rows from the bottom too. */
function decodeBlocks(format: 'DXT1' | 'DXT5', data: Uint8Array, width: number, height: number, out: Uint8ClampedArray): void {
  const blockSize = format === 'DXT1' ? 8 : 16;
  const across = Math.ceil(width / 4);
  const colours = new Uint8Array(16);
  const alphas = new Uint8Array(8);
  for (let by = 0; by < Math.ceil(height / 4); by++) {
    for (let bx = 0; bx < across; bx++) {
      const block = (by * across + bx) * blockSize;
      const colourAt = format === 'DXT1' ? block : block + 8;
      // DXT5's colours always have four values; Unity's DXT1 has no alpha, so its fourth is black
      readColours(data, colourAt, format === 'DXT1', colours);
      if (format === 'DXT5') readAlphas(data[block]!, data[block + 1]!, alphas);
      for (let py = 0; py < 4; py++) {
        const row = by * 4 + py;
        if (row >= height) break;
        const indices = data[colourAt + 4 + py]!;
        for (let px = 0; px < 4; px++) {
          const x = bx * 4 + px;
          if (x >= width) break;
          const colour = ((indices >> (px * 2)) & 3) * 4;
          const at = ((height - 1 - row) * width + x) * 4;
          out[at] = colours[colour]!;
          out[at + 1] = colours[colour + 1]!;
          out[at + 2] = colours[colour + 2]!;
          out[at + 3] = format === 'DXT5' ? alphas[alphaIndex(data, block, py * 4 + px)]! : 255;
        }
      }
    }
  }
}

/** The four colours of a block as RGBA: its two ends and two in between, or one half way and black. */
function readColours(data: Uint8Array, at: number, threeWhenOrdered: boolean, out: Uint8Array): void {
  const c0 = data[at]! | (data[at + 1]! << 8);
  const c1 = data[at + 2]! | (data[at + 3]! << 8);
  expand(c0, out, 0);
  expand(c1, out, 4);
  for (let channel = 0; channel < 3; channel++) {
    const a = out[channel]!;
    const b = out[4 + channel]!;
    if (threeWhenOrdered && c0 <= c1) {
      out[8 + channel] = (a + b + 1) >> 1;
      out[12 + channel] = 0;
    } else {
      out[8 + channel] = ((2 * a + b + 1) / 3) | 0;
      out[12 + channel] = ((a + 2 * b + 1) / 3) | 0;
    }
  }
}

/** A 5-6-5 colour as 8-bit channels. */
function expand(c: number, out: Uint8Array, at: number): void {
  const r = (c >> 11) & 31;
  const g = (c >> 5) & 63;
  const b = c & 31;
  out[at] = (r << 3) | (r >> 2);
  out[at + 1] = (g << 2) | (g >> 4);
  out[at + 2] = (b << 3) | (b >> 2);
}

/** The eight alpha values of a DXT5 block: its two ends and six in between, or four in between, clear and opaque. */
function readAlphas(a0: number, a1: number, out: Uint8Array): void {
  out[0] = a0;
  out[1] = a1;
  if (a0 > a1) {
    for (let k = 2; k < 8; k++) out[k] = (((8 - k) * a0 + (k - 1) * a1 + 3) / 7) | 0;
  } else {
    for (let k = 2; k < 6; k++) out[k] = (((6 - k) * a0 + (k - 1) * a1 + 2) / 5) | 0;
    out[6] = 0;
    out[7] = 255;
  }
}

/** The three-bit alpha index of a pixel of a DXT5 block (0 to 15, row by row). */
function alphaIndex(data: Uint8Array, block: number, pixel: number): number {
  const bit = pixel * 3;
  const at = block + 2 + (bit >> 3);
  const pair = data[at]! | ((data[at + 1] ?? 0) << 8);
  return (pair >> (bit & 7)) & 7;
}

/**
 * The picture at half its size, as a smaller copy (mipmap) is made: each pixel the average of four, its colour weighed
 * by their alpha so that clear pixels do not darken the edges. An odd last row or column is dropped.
 */
export function halfSize(source: Pixels): Pixels {
  const width = source.width >> 1;
  const height = source.height >> 1;
  const data = new Uint8ClampedArray(width * height * 4);
  const s = source.data;
  const row = source.width * 4;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = (y * 2 * source.width + x * 2) * 4;
      const corners = [a, a + 4, a + row, a + row + 4];
      const at = (y * width + x) * 4;
      let alpha = 0;
      for (const p of corners) alpha += s[p + 3]!;
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (const p of corners) sum += s[p + c]! * s[p + 3]!;
        data[at + c] = alpha === 0 ? 0 : Math.floor((sum + (alpha >> 1)) / alpha);
      }
      data[at + 3] = (alpha + 2) >> 2;
    }
  }
  return { width, height, data };
}
