// Tests for copying zip entries as they are stored (not ported from Valkyrie): what saves use, as DotNetZip copies
// the entries it did not change.
import { Zip, ZipDeflate, strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { ZipFormatError, canCopyZipEntry, copyZipEntries, locateZipDirectory, readZipDirectory, readZipEntry, type ZipEntry } from '../../src/index.ts';

const TEXT = 'The cultist waits. '.repeat(50);
const PICTURE = new Uint8Array(300).map((_, i) => (i * 7919) % 251);

function entry(data: Uint8Array, name: string): ZipEntry {
  return readZipDirectory(data).find((e) => e.name === name)!;
}

/** A zip written as a stream, so that its entries carry a data descriptor instead of sizes in their local headers. */
function streamedZip(): Uint8Array {
  const chunks: Uint8Array[] = [];
  const zip = new Zip((error, chunk) => {
    if (error) throw error;
    chunks.push(chunk);
  });
  const file = new ZipDeflate('streamed.txt', { level: 9 });
  zip.add(file);
  file.push(strToU8(TEXT), true);
  zip.end();
  const out = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  return out;
}

describe('copyZipEntries', () => {
  it('copies deflated and stored entries as they are, under new names', () => {
    const source = zipSync({ 'events.ini': [strToU8(TEXT), { level: 9 }], 'image.png': [PICTURE, { level: 0 }] });
    const copied = copyZipEntries([
      { name: 'quest/events.ini', archive: source, entry: entry(source, 'events.ini') },
      { name: 'quest/Imágenes/image.png', archive: source, entry: entry(source, 'image.png') },
    ]);

    const entries = readZipDirectory(copied);
    expect(entries.map((e) => e.name)).toEqual(['quest/events.ini', 'quest/Imágenes/image.png']);
    for (const [name, original] of [
      ['quest/events.ini', 'events.ini'],
      ['quest/Imágenes/image.png', 'image.png'],
    ] as const) {
      const copy = entry(copied, name);
      const from = entry(source, original);
      expect([copy.method, copy.crc32, copy.compressedSize, copy.size, copy.dosTime]).toEqual([from.method, from.crc32, from.compressedSize, from.size, from.dosTime]);
    }
    expect(strFromU8(readZipEntry(copied, entry(copied, 'quest/events.ini')))).toBe(TEXT);
    // Another reader, which checks the CRC, reads it the same
    const unzipped = unzipSync(copied);
    expect(strFromU8(unzipped['quest/events.ini']!)).toBe(TEXT);
    expect(unzipped['quest/Imágenes/image.png']).toEqual(PICTURE);
  });

  it('copies an entry whose sizes come after its data', () => {
    const source = streamedZip();
    const copied = copyZipEntries([{ name: 'streamed.txt', archive: source, entry: entry(source, 'streamed.txt') }]);
    expect(strFromU8(unzipSync(copied)['streamed.txt']!)).toBe(TEXT);
    expect(strFromU8(readZipEntry(copied, entry(copied, 'streamed.txt')))).toBe(TEXT);
  });

  it('writes an empty zip', () => {
    expect(readZipDirectory(copyZipEntries([]))).toEqual([]);
  });

  it('refuses an encrypted entry', () => {
    const source = zipSync({ 'secret.txt': strToU8(TEXT) });
    // Set the encryption flag in the central directory
    source[locateZipDirectory(source).offset + 8]! |= 1;
    const secret = entry(source, 'secret.txt');
    expect(canCopyZipEntry(secret)).toBe(false);
    expect(() => copyZipEntries([{ name: 'secret.txt', archive: source, entry: secret }])).toThrow(ZipFormatError);
  });
});
