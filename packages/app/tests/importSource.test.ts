// Tests of how the app reads Valkyrie's import folder as the player gives it (host/importSource.ts). Not ported from
// Valkyrie; the rules for import.ini follow ImportManager.ImportZipFromPath.
import { Zip, ZipDeflate, ZipPassThrough, strToU8, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { folderFiles, fromBase64, hasRawAssets, headSize, importRoot, isMacMetadata, isReadAtOnce, toBase64, zipFiles, type SourceFile } from '../src/host/importSource.ts';

async function text(file: SourceFile): Promise<string> {
  return new Response(await file.stream()).text();
}

/** A zip made in pieces, with each entry's sizes after its data, as zips made by streaming are. */
function streamedZip(files: Record<string, string>): Uint8Array {
  const parts: Uint8Array[] = [];
  const zip = new Zip((error, chunk) => {
    if (error) throw error;
    parts.push(chunk);
  });
  for (const [name, content] of Object.entries(files)) {
    const entry = name.endsWith('.dds') ? new ZipPassThrough(name) : new ZipDeflate(name);
    zip.add(entry);
    entry.push(strToU8(content), true);
  }
  zip.end();
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/** The same zip with ZIP64 end records, and the classic one saying to read them, as big zips have. */
function asZip64(zip: Uint8Array): Uint8Array {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  const eocd = zip.length - 22;
  const count = view.getUint16(eocd + 10, true);
  const size = view.getUint32(eocd + 12, true);
  const offset = view.getUint32(eocd + 16, true);
  const out = new Uint8Array(eocd + 56 + 20 + 22);
  out.set(zip.subarray(0, eocd));
  const o = new DataView(out.buffer);
  o.setUint32(eocd, 0x06064b50, true);
  o.setBigUint64(eocd + 4, 44n, true);
  o.setBigUint64(eocd + 24, BigInt(count), true);
  o.setBigUint64(eocd + 32, BigInt(count), true);
  o.setBigUint64(eocd + 40, BigInt(size), true);
  o.setBigUint64(eocd + 48, BigInt(offset), true);
  o.setUint32(eocd + 56, 0x07064b50, true);
  o.setBigUint64(eocd + 64, BigInt(eocd), true);
  o.setUint32(eocd + 72, 1, true);
  const classic = eocd + 76;
  o.setUint32(classic, 0x06054b50, true);
  o.setUint16(classic + 8, 0xffff, true);
  o.setUint16(classic + 10, 0xffff, true);
  o.setUint32(classic + 12, 0xffffffff, true);
  o.setUint32(classic + 16, 0xffffffff, true);
  return out;
}

describe('zipFiles', () => {
  it('lists the files of a zip and streams each one, stored or deflated', async () => {
    const zip = zipSync({ 'import/import.ini': strToU8('[Import]\nValkyrie=2'), 'import/img/': new Uint8Array(0), 'import/img/A.dds': [strToU8('DDS data'), { level: 0 }] });
    const files = await zipFiles(new Blob([zip]));
    expect(files.map((f) => [f.name, f.size])).toEqual([
      ['import/import.ini', 19],
      ['import/img/A.dds', 8],
    ]);
    expect(await text(files[0]!)).toBe('[Import]\nValkyrie=2');
    expect(await text(files[1]!)).toBe('DDS data');
  });

  it('takes the sizes from the central directory when the entries carry them after their data', async () => {
    const files = await zipFiles(new Blob([streamedZip({ 'import.ini': '[Import]', 'img/B.dds': 'pixels' })]));
    expect(files.map((f) => [f.name, f.size])).toEqual([
      ['import.ini', 8],
      ['img/B.dds', 6],
    ]);
    expect(await text(files[1]!)).toBe('pixels');
  });

  it('reads the ZIP64 records of big zips', async () => {
    const files = await zipFiles(new Blob([asZip64(zipSync({ 'import.ini': strToU8('[Import]'), 'audio/x.ogg': strToU8('sound') }))]));
    expect(files.map((f) => f.name)).toEqual(['import.ini', 'audio/x.ogg']);
    expect(await text(files[1]!)).toBe('sound');
  });

  it('refuses what is not a zip', async () => {
    await expect(zipFiles(new Blob([strToU8('not a zip at all, just text')]))).rejects.toThrow(/Not a zip file/);
  });
});

describe('the files of what the player gave', () => {
  it("names a chosen folder's files from the folder", () => {
    const file = new File(['x'], 'import.ini');
    Object.defineProperty(file, 'webkitRelativePath', { value: 'import/import.ini' });
    expect(folderFiles([file]).map((f) => [f.name, f.size])).toEqual([['import/import.ini', 1]]);
  });

  it("finds the import where import.ini is: at the top, one level down, or in the game's folder", () => {
    expect(importRoot(['import.ini', 'img/A.dds'], 'MoM')).toBe('');
    expect(importRoot(['import/import.ini', 'import/img/A.dds'], 'MoM')).toBe('import/');
    expect(importRoot(['Valkyrie/D2E/import/import.ini', 'Valkyrie/MoM/import/import.ini'], 'MoM')).toBe('Valkyrie/MoM/import/');
    expect(importRoot(['Valkyrie/D2E/import/import.ini'], 'MoM')).toBeNull();
    expect(importRoot(['img/A.dds'], 'MoM')).toBeNull();
  });

  it("tells the official app's files from an import folder", () => {
    expect(hasRawAssets(['Mansions of Madness_Data/resources.assets', 'import.ini'])).toBe(true);
    expect(hasRawAssets(['main.123.com.fantasyflightgames.mom.obb'])).toBe(true);
    expect(hasRawAssets(['import.ini', 'img/A.dds'])).toBe(false);
  });

  it('leaves out what a Mac adds to a zip it makes: __MACOSX, the ._ copies and .DS_Store', () => {
    // A Descent import made on Android and zipped on a Mac carries one ._ copy of each file under __MACOSX
    const names = ['import.ini', '__MACOSX/._import.ini', 'img/001A.pvr', '__MACOSX/img/._001A.pvr', 'img/._002A.pvr', 'import/.DS_Store', 'audio/Song.ogg'];
    expect(names.filter((name) => !isMacMetadata(name))).toEqual(['import.ini', 'img/001A.pvr', 'audio/Song.ogg']);
    expect(importRoot(names.filter((name) => !isMacMetadata(name)), 'D2E')).toBe('');
  });
});

describe('what the app keeps of the import', () => {
  it('keeps the texts the engine reads at once: the log and the localization Valkyrie lists', () => {
    expect(['import.ini', 'text/Localization_English.txt', 'text/SCENARIO_CULT_OF_SENTINEL_HILL_MAD22_English.txt'].every(isReadAtOnce)).toBe(true);
    // Names with digits are left out, as loadLocalization leaves them out, and so are other texts and other folders
    expect(['text/Localization_2.txt', 'text/SCENARIO_RISING_TIDE_MAD20_English.txt', 'img/Localization_x.txt', 'text/sub/Localization_x.txt'].some(isReadAtOnce)).toBe(false);
  });

  it("keeps the headers where the engine reads a picture's size", () => {
    expect([headSize('img/A.dds'), headSize('img/B.PVR'), headSize('audio/x.ogg')]).toEqual([128, 52, 0]);
    const header = new Uint8Array([0x44, 0x44, 0x53, 0x20, 124, 0, 255]);
    expect([...fromBase64(toBase64(header))]).toEqual([...header]);
  });
});
