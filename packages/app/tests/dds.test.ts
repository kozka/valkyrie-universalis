// Tests of the DDS decoder (host/dds.ts), written from Valkyrie's ContentData.DdsToTexture, which has no NUnit test, and
// from the DXT1 and DXT5 formats as Unity loads them with LoadRawTextureData. Not ported from Valkyrie.
import { describe, expect, it } from 'vitest';
import { decodeDds, halfSize } from '../src/host/dds.ts';

/** A DDS file as Valkyrie's importer writes it: the 128-byte header, then Unity's data, rows from the bottom. */
function dds(width: number, height: number, format: { fourCC?: string; bits?: number; redMask?: number }, data: number[]): Uint8Array {
  const bytes = new Uint8Array(128 + data.length);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x20534444, true);
  view.setUint32(4, 124, true);
  view.setUint32(12, height, true);
  view.setUint32(16, width, true);
  view.setUint32(76, 32, true);
  if (format.fourCC !== undefined) {
    view.setUint32(80, 4, true);
    for (let i = 0; i < 4; i++) bytes[84 + i] = format.fourCC.charCodeAt(i);
  } else {
    view.setUint32(80, 0x41, true);
    view.setUint32(88, format.bits ?? 0, true);
    view.setUint32(92, format.redMask ?? 0, true);
  }
  bytes.set(data, 128);
  return bytes;
}

/** A 16-bit colour of a DXT block, little endian. */
function rgb565(r: number, g: number, b: number): number[] {
  const c = ((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3);
  return [c & 0xff, c >> 8];
}

/** A DXT1 block of one colour: both end colours the same, every pixel the first. */
function solidDxt1(r: number, g: number, b: number): number[] {
  return [...rgb565(r, g, b), ...rgb565(r, g, b), 0, 0, 0, 0];
}

/** The pixel at x, y counted from the top, as RGBA. */
function pixel(picture: { width: number; data: Uint8ClampedArray }, x: number, y: number): number[] {
  const i = (y * picture.width + x) * 4;
  return [...picture.data.subarray(i, i + 4)];
}

describe('decodeDds', () => {
  it('reads DXT1, whose first rows are the bottom of the picture, as Unity keeps them', () => {
    // Two blocks one above the other: the first one stored is the bottom one
    const picture = decodeDds(dds(4, 8, { fourCC: 'DXT1' }, [...solidDxt1(255, 0, 0), ...solidDxt1(0, 0, 255)]))!;
    expect([picture.width, picture.height]).toEqual([4, 8]);
    expect(pixel(picture, 0, 0)).toEqual([0, 0, 255, 255]);
    expect(pixel(picture, 3, 3)).toEqual([0, 0, 255, 255]);
    expect(pixel(picture, 0, 4)).toEqual([255, 0, 0, 255]);
    expect(pixel(picture, 3, 7)).toEqual([255, 0, 0, 255]);
  });

  it('mixes the two colours of a DXT1 block, and draws its fourth in a three-colour block as black', () => {
    // Indices, two bits a pixel from the first: 0, 1, 2, 3 on every row
    const indices = [0b11100100, 0b11100100, 0b11100100, 0b11100100];
    const four = decodeDds(dds(4, 4, { fourCC: 'DXT1' }, [...rgb565(255, 255, 255), ...rgb565(0, 0, 0), ...indices]))!;
    expect([0, 1, 2, 3].map((x) => pixel(four, x, 0))).toEqual([
      [255, 255, 255, 255],
      [0, 0, 0, 255],
      [170, 170, 170, 255],
      [85, 85, 85, 255],
    ]);
    // The first colour no greater than the second: a half-way colour and black
    const three = decodeDds(dds(4, 4, { fourCC: 'DXT1' }, [...rgb565(0, 0, 0), ...rgb565(255, 255, 255), ...indices]))!;
    expect([0, 1, 2, 3].map((x) => pixel(three, x, 0))).toEqual([
      [0, 0, 0, 255],
      [255, 255, 255, 255],
      [128, 128, 128, 255],
      [0, 0, 0, 255],
    ]);
  });

  it('reads the alpha of DXT5 with eight levels, or six with clear and opaque', () => {
    // Alpha indices, three bits a pixel from the first: 0, 1, 2, 3 then 4, 5, 6, 7 on the first two rows
    const alphaIndices = [0b10001000, 0b11000110, 0b11111010, 0, 0, 0];
    const colour = [...rgb565(255, 255, 255), ...rgb565(255, 255, 255), 0, 0, 0, 0];
    const eight = decodeDds(dds(4, 4, { fourCC: 'DXT5' }, [255, 0, ...alphaIndices, ...colour]))!;
    // Rows are stored from the bottom, so the first two stored rows are the last two drawn
    expect([0, 1, 2, 3].map((x) => pixel(eight, x, 3)[3])).toEqual([255, 0, 219, 182]);
    expect([0, 1, 2, 3].map((x) => pixel(eight, x, 2)[3])).toEqual([146, 109, 73, 36]);
    const six = decodeDds(dds(4, 4, { fourCC: 'DXT5' }, [0, 255, ...alphaIndices, ...colour]))!;
    expect([0, 1, 2, 3].map((x) => pixel(six, x, 3)[3])).toEqual([0, 255, 51, 102]);
    expect([0, 1, 2, 3].map((x) => pixel(six, x, 2)[3])).toEqual([153, 204, 0, 255]);
  });

  it('tells BGRA from RGBA by the red mask, as Valkyrie does', () => {
    const data = [10, 20, 30, 40, 50, 60, 70, 80];
    const bgra = decodeDds(dds(1, 2, { bits: 32, redMask: 0x00ff0000 }, data))!;
    expect([pixel(bgra, 0, 0), pixel(bgra, 0, 1)]).toEqual([
      [70, 60, 50, 80],
      [30, 20, 10, 40],
    ]);
    const rgba = decodeDds(dds(1, 2, { bits: 32, redMask: 0x000000ff }, data))!;
    expect([pixel(rgba, 0, 0), pixel(rgba, 0, 1)]).toEqual([
      [50, 60, 70, 80],
      [10, 20, 30, 40],
    ]);
  });

  it('reads 24-bit RGB', () => {
    const picture = decodeDds(dds(2, 1, { bits: 24 }, [1, 2, 3, 4, 5, 6]))!;
    expect([pixel(picture, 0, 0), pixel(picture, 1, 0)]).toEqual([
      [1, 2, 3, 255],
      [4, 5, 6, 255],
    ]);
  });

  it('reads the size from its two lower bytes, as Valkyrie does', () => {
    const picture = decodeDds(dds(0x10004, 4, { fourCC: 'DXT1' }, solidDxt1(0, 255, 0)))!;
    expect([picture.width, picture.height]).toEqual([4, 4]);
  });

  it('draws nothing that Valkyrie cannot draw', () => {
    // DXT3, a header of another size, too little data, and no data at all
    expect(decodeDds(dds(4, 4, { fourCC: 'DXT3' }, new Array<number>(16).fill(0)))).toBeNull();
    const otherHeader = dds(4, 4, { fourCC: 'DXT1' }, solidDxt1(0, 0, 0));
    otherHeader[4] = 100;
    expect(decodeDds(otherHeader)).toBeNull();
    expect(decodeDds(dds(8, 8, { fourCC: 'DXT1' }, solidDxt1(0, 0, 0)))).toBeNull();
    expect(decodeDds(new Uint8Array(20))).toBeNull();
  });
});

describe('halfSize', () => {
  it('averages four pixels into one, weighing colours by their alpha so clear pixels do not darken edges', () => {
    const red = [255, 0, 0, 255];
    const clear = [0, 0, 0, 0];
    const small = halfSize({ width: 2, height: 2, data: new Uint8ClampedArray([...red, ...clear, ...clear, ...red]) });
    expect([small.width, small.height, ...small.data]).toEqual([1, 1, 255, 0, 0, 128]);
  });

  it('drops an odd last row or column', () => {
    const grey = (v: number) => [v, v, v, 255];
    const data = new Uint8ClampedArray([...grey(10), ...grey(20), ...grey(99), ...grey(30), ...grey(40), ...grey(99), ...grey(99), ...grey(99), ...grey(99)]);
    const small = halfSize({ width: 3, height: 3, data });
    expect([small.width, small.height, ...small.data]).toEqual([1, 1, 25, 25, 25, 255]);
  });
});
