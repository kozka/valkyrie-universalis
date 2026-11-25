// Whether downloaded bytes are a whole zip (host/zipSignature.ts), before they replace a package. Not ported from Valkyrie.
import { zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { endsAsZip } from '../src/host/zipSignature.ts';

describe('a downloaded package', () => {
  it('is a zip when it ends as one, with or without a comment', () => {
    expect(endsAsZip(zipSync({ 'quest.ini': new TextEncoder().encode('[Quest]') }))).toBe(true);
    expect(endsAsZip(new Uint8Array([0x50, 0x4b, 0x05, 0x06, ...new Array<number>(18).fill(0)]))).toBe(true);
    const commented = new Uint8Array(22 + 0xffff);
    commented.set([0x50, 0x4b, 0x05, 0x06]);
    expect(endsAsZip(commented)).toBe(true);
  });

  it('is not one when it is a web page, empty, or cut short', () => {
    expect(endsAsZip(new TextEncoder().encode('<!DOCTYPE html><html><body>Not found</body></html>'))).toBe(false);
    expect(endsAsZip(new Uint8Array(0))).toBe(false);
    const zip = zipSync({ 'quest.ini': new Uint8Array(1000).fill(65) });
    expect(endsAsZip(zip.subarray(0, zip.length - 30))).toBe(false);
    const tooFar = new Uint8Array(23 + 0xffff);
    tooFar.set([0x50, 0x4b, 0x05, 0x06]);
    expect(endsAsZip(tooFar)).toBe(false);
  });
});
