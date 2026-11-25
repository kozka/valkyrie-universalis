// Tests for the stand-in pictures of the battery and the schematic mode (not ported from Valkyrie).
import { strToU8, zlibSync } from 'fflate';
import { beforeEach, describe, expect, it } from 'vitest';
import { ContentData, File, VirtualFileSystem, isStandIn, setFileSystem, standInFile } from '../../src/index.ts';

/** A real 1×1 PNG: signature, IHDR, IDAT and IEND. */
function onePixelPng(): Uint8Array {
  const chunk = (type: string, data: Uint8Array): Uint8Array => {
    const out = new Uint8Array(12 + data.length);
    new DataView(out.buffer).setUint32(0, data.length);
    out.set(strToU8(type), 4);
    out.set(data, 8);
    return out; // the CRC is not checked here
  };
  const ihdr = new Uint8Array([0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0]);
  const idat = zlibSync(new Uint8Array([0, 255, 255, 255, 255]));
  const parts = [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', new Uint8Array(0))];
  const png = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    png.set(p, at);
    at += p.length;
  }
  return png;
}

describe('standInFile', () => {
  beforeEach(() => {
    setFileSystem(new VirtualFileSystem());
    ContentData.textureCache = null;
  });

  it('gives the engine the size it is asked for', () => {
    for (const extension of ['.dds', '.png', '.jpg', '.pvr']) {
      File.writeAllBytes('/import/img/Tile' + extension, standInFile('Tile' + extension, 2048, 1024));
      const texture = ContentData.fileToTexture('/import/img/Tile' + extension)!;
      expect([extension, texture.width, texture.height]).toEqual([extension, 2048, 1024]);
    }
  });

  it('is 4096 pixels square by default', () => {
    File.writeAllBytes('/import/img/Token.dds', standInFile('Token.dds'));
    const texture = ContentData.fileToTexture('/import/img/Token')!;
    expect([texture.width, texture.height]).toEqual([4096, 4096]);
  });

  it('tells a stand-in from a picture', () => {
    expect(isStandIn('a.dds', standInFile('a.dds', 10, 20))).toBe(true);
    expect(isStandIn('a.png', standInFile('a.png'))).toBe(true);
    expect(isStandIn('a.png', onePixelPng())).toBe(false);
    expect(isStandIn('a.dds', new Uint8Array(4096))).toBe(false);
  });
});
