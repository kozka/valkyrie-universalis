// Not ported from Valkyrie: the SHA-256 that EditorTools.CreatePackage writes as a package's version.
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { bitConverterToString, sha256 } from '../../src/platform/Sha256.ts';

const hex = (bytes: Uint8Array) => Buffer.from(bytes).toString('hex');

describe('Sha256', () => {
  it('KnownDigests', () => {
    const text = (s: string) => new TextEncoder().encode(s);
    expect(hex(sha256(text('')))).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(hex(sha256(text('abc')))).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(hex(sha256(text('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')))).toBe(
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
    );
  });

  it('EveryLengthAroundTheBlockEdgesMatchesNode', () => {
    const data = new Uint8Array(300).map((_, i) => (i * 37 + 11) & 0xff);
    for (let length = 0; length <= 300; length++) {
      const part = data.subarray(0, length);
      expect(hex(sha256(part))).toBe(createHash('sha256').update(part).digest('hex'));
    }
  });

  it('APartOfABiggerBufferHashesOnlyThatPart', () => {
    const data = new Uint8Array(1000).map((_, i) => i & 0xff);
    const part = data.subarray(123, 900);
    expect(hex(sha256(part))).toBe(createHash('sha256').update(part).digest('hex'));
  });

  it('BitConverterToString_UpperCaseHexWithDashes', () => {
    expect(bitConverterToString(new Uint8Array([0, 10, 255, 171]))).toBe('00-0A-FF-AB');
  });
});
