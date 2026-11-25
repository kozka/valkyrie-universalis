// Tests of the PVR decoder (host/pvr.ts), written from Valkyrie's ContentData.PvrToTexture, which has no NUnit test,
// and from the ETC2 formats as Unity loads them with LoadRawTextureData. The pixels of random blocks of every mode
// come from a reference decoder (fixtures/make-etc2.py). Not ported from Valkyrie.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { decodePvr } from '../src/host/pvr.ts';

interface Reference {
  width: number;
  height: number;
  /** ETC2 blocks, in base64. */
  blocks: string;
  /** Their pixels as RGBA, in the order of the data: the first row is the bottom of the picture. */
  pixels: string;
}

const fixture = JSON.parse(readFileSync(new URL('./fixtures/etc2.json', import.meta.url), 'utf8')) as {
  modes: Record<string, number>;
  rgb: Reference;
  rgba: Reference;
};

const fromBase64 = (text: string) => new Uint8Array(Buffer.from(text, 'base64'));

/** A PVR file as Valkyrie's importer writes it on Android: the 52-byte header of PVR 3, then Unity's data. */
function pvr(format: number, width: number, height: number, data: Uint8Array, mipmaps = 1): Uint8Array {
  const bytes = new Uint8Array(52 + data.length);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x03525650, true);
  view.setBigUint64(8, BigInt(format), true);
  view.setUint32(24, height, true);
  view.setUint32(28, width, true);
  view.setUint32(32, 1, true);
  view.setUint32(36, 1, true);
  view.setUint32(40, 1, true);
  view.setUint32(44, mipmaps, true);
  bytes.set(data, 52);
  return bytes;
}

/** The reference pixels with the rows from the top. */
function fromTop(reference: Reference): number[] {
  const pixels = fromBase64(reference.pixels);
  const row = reference.width * 4;
  const rows: number[] = [];
  for (let y = reference.height - 1; y >= 0; y--) rows.push(...pixels.subarray(y * row, (y + 1) * row));
  return rows;
}

/** An individual-mode ETC2 block of one colour of four bits a channel: every pixel adds the smallest modifier, 2. */
function solid(r: number, g: number, b: number): number[] {
  return [(r << 4) | r, (g << 4) | g, (b << 4) | b, 0, 0, 0, 0, 0];
}

describe('decodePvr', () => {
  it('reads ETC2 RGB blocks of every mode as the reference decoder does', () => {
    expect(fixture.modes).toEqual({ individual: 16, differential: 16, T: 16, H: 16, planar: 16 });
    const { width, height, blocks } = fixture.rgb;
    const picture = decodePvr(pvr(22, width, height, fromBase64(blocks)))!;
    expect([picture.width, picture.height]).toEqual([width, height]);
    expect([...picture.data]).toEqual(fromTop(fixture.rgb));
  });

  it('reads ETC2 RGBA, its alpha in EAC blocks, as the reference decoder does', () => {
    const { width, height, blocks } = fixture.rgba;
    const picture = decodePvr(pvr(23, width, height, fromBase64(blocks)))!;
    expect([...picture.data]).toEqual(fromTop(fixture.rgba));
  });

  it('puts the first rows of the file at the bottom of the picture, as Unity keeps them', () => {
    // Two blocks one above the other: the first one stored is the bottom one
    const picture = decodePvr(pvr(22, 4, 8, new Uint8Array([...solid(15, 0, 0), ...solid(0, 0, 15)])))!;
    expect([...picture.data.subarray(0, 4)]).toEqual([2, 2, 255, 255]);
    expect([...picture.data.subarray((7 * 4 + 3) * 4, (7 * 4 + 3) * 4 + 4)]).toEqual([255, 2, 2, 255]);
  });

  it('reads the picture and not the smaller copies after it', () => {
    const picture = decodePvr(pvr(22, 4, 4, new Uint8Array([...solid(0, 15, 0), ...solid(15, 15, 15)]), 2))!;
    expect([picture.width, picture.height]).toEqual([4, 4]);
    expect([...picture.data.subarray(0, 4)]).toEqual([2, 255, 2, 255]);
  });

  it('gives nothing for a format Valkyrie does not read or a file without all its data, as Valkyrie gives no texture', () => {
    const block = new Uint8Array(solid(15, 15, 15));
    // PVRTC 4 bits: Valkyrie logs an unknown pixel format
    expect(decodePvr(pvr(2, 4, 4, block))).toBeNull();
    expect(decodePvr(pvr(23, 4, 4, block))).toBeNull();
    expect(decodePvr(new Uint8Array(40))).toBeNull();
  });
});
