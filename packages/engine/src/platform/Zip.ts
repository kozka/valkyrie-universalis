// Reading .valkyrie and .valkyrieContentPack files (zip) as Valkyrie's DotNetZip does, and writing a zip of entries
// copied from others as they are stored, as DotNetZip saves the entries it did not change.
// Not ported from Valkyrie. Only the central directory is read up front; entries inflate when a file is read.
import { inflateSync } from 'fflate';

export interface ZipEntry {
  /** Name as stored, with '\' turned into '/' as DotNetZip does. */
  name: string;
  isDirectory: boolean;
  method: number;
  /** CRC-32 of the uncompressed data. */
  crc32: number;
  /** MS-DOS time (low half) and date (high half) of the last change. */
  dosTime: number;
  compressedSize: number;
  size: number;
  localHeaderOffset: number;
  encrypted: boolean;
}

// DotNetZip reads names without the UTF-8 flag as IBM437, its default encoding.
const CP437_HIGH =
  'ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ';

function decodeCp437(bytes: Uint8Array): string {
  let text = '';
  for (const b of bytes) text += b < 0x80 ? String.fromCharCode(b) : CP437_HIGH[b - 0x80];
  return text;
}

const utf8 = new TextDecoder('utf-8');

export class ZipFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ZipFormatError';
  }
}

function findEndOfCentralDirectory(view: DataView): number {
  const min = Math.max(0, view.byteLength - 22 - 0xffff);
  for (let i = view.byteLength - 22; i >= min; i--) {
    if (view.getUint32(i, true) === 0x06054b50) return i;
  }
  throw new ZipFormatError('Not a zip file: end of central directory not found');
}

/** Where a zip file's central directory starts and how many entries it has, from the bytes at its end. */
export interface ZipDirectoryLocation {
  offset: number;
  size: number;
  count: number;
  /** Where the ZIP64 end of central directory record is, when the classic fields overflow and it must be read. */
  zip64Record: number | null;
}

/** Reads the end of central directory record from the last bytes of a zip file (64 KiB and 22 bytes are enough). */
export function locateZipDirectory(tail: Uint8Array): ZipDirectoryLocation {
  const view = new DataView(tail.buffer, tail.byteOffset, tail.byteLength);
  const eocd = findEndOfCentralDirectory(view);
  const count = view.getUint16(eocd + 10, true);
  const size = view.getUint32(eocd + 12, true);
  const offset = view.getUint32(eocd + 16, true);
  // ZIP64 end of central directory, when the classic fields overflow
  if ((count === 0xffff || offset === 0xffffffff) && eocd >= 20 && view.getUint32(eocd - 20, true) === 0x07064b50) {
    return { offset, size, count, zip64Record: Number(view.getBigUint64(eocd - 12, true)) };
  }
  return { offset, size, count, zip64Record: null };
}

/** The central directory's place from a ZIP64 end of central directory record (56 bytes). */
export function readZip64Record(record: Uint8Array): ZipDirectoryLocation {
  const view = new DataView(record.buffer, record.byteOffset, record.byteLength);
  if (view.getUint32(0, true) !== 0x06064b50) throw new ZipFormatError('Bad ZIP64 end of central directory');
  return {
    count: Number(view.getBigUint64(32, true)),
    size: Number(view.getBigUint64(40, true)),
    offset: Number(view.getBigUint64(48, true)),
    zip64Record: null,
  };
}

/** Lists the entries of a zip file from its central directory. */
export function readZipDirectory(data: Uint8Array): ZipEntry[] {
  let location = locateZipDirectory(data);
  if (location.zip64Record !== null) location = readZip64Record(data.subarray(location.zip64Record, location.zip64Record + 56));
  return readCentralDirectory(data.subarray(location.offset), location.count);
}

/** Lists the entries of a central directory, given its bytes (from its start) and its number of entries. */
export function readCentralDirectory(data: Uint8Array, count: number): ZipEntry[] {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const entries: ZipEntry[] = [];
  let p = 0;
  for (let i = 0; i < count; i++) {
    if (p + 46 > data.length || view.getUint32(p, true) !== 0x02014b50) throw new ZipFormatError('Bad central directory entry');
    const flags = view.getUint16(p + 8, true);
    const method = view.getUint16(p + 10, true);
    const dosTime = view.getUint32(p + 12, true);
    const crc32 = view.getUint32(p + 16, true);
    let compressedSize = view.getUint32(p + 20, true);
    let size = view.getUint32(p + 24, true);
    const nameLength = view.getUint16(p + 28, true);
    const extraLength = view.getUint16(p + 30, true);
    const commentLength = view.getUint16(p + 32, true);
    let localHeaderOffset = view.getUint32(p + 42, true);
    const nameBytes = data.subarray(p + 46, p + 46 + nameLength);
    const rawName = flags & 0x800 ? utf8.decode(nameBytes) : decodeCp437(nameBytes);

    // ZIP64 extended information extra field
    let e = p + 46 + nameLength;
    const extraEnd = e + extraLength;
    while (e + 4 <= extraEnd) {
      const id = view.getUint16(e, true);
      const length = view.getUint16(e + 2, true);
      if (id === 0x0001) {
        let q = e + 4;
        if (size === 0xffffffff) {
          size = Number(view.getBigUint64(q, true));
          q += 8;
        }
        if (compressedSize === 0xffffffff) {
          compressedSize = Number(view.getBigUint64(q, true));
          q += 8;
        }
        if (localHeaderOffset === 0xffffffff) {
          localHeaderOffset = Number(view.getBigUint64(q, true));
        }
      }
      e += 4 + length;
    }

    const name = rawName.replace(/\\/g, '/');
    entries.push({
      name,
      isDirectory: name.endsWith('/'),
      method,
      crc32,
      dosTime,
      compressedSize,
      size,
      localHeaderOffset,
      encrypted: (flags & 1) !== 0,
    });
    p = extraEnd + commentLength;
  }
  return entries;
}

/** An entry's data as the zip stores it, compressed or not. */
function storedData(data: Uint8Array, entry: ZipEntry): Uint8Array {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const p = entry.localHeaderOffset;
  if (view.getUint32(p, true) !== 0x04034b50) throw new ZipFormatError(`Bad local header: ${entry.name}`);
  const start = p + 30 + view.getUint16(p + 26, true) + view.getUint16(p + 28, true);
  return data.subarray(start, start + entry.compressedSize);
}

/** Inflates one entry. */
export function readZipEntry(data: Uint8Array, entry: ZipEntry): Uint8Array {
  if (entry.encrypted) throw new ZipFormatError(`Encrypted zip entry: ${entry.name}`);
  const raw = storedData(data, entry);
  if (entry.method === 0) return raw;
  if (entry.method === 8) return inflateSync(raw, { out: new Uint8Array(entry.size) });
  throw new ZipFormatError(`Unsupported compression method ${entry.method}: ${entry.name}`);
}

/** An entry of a zip (`archive`) to put in another under `name`. */
export interface ZipCopy {
  name: string;
  archive: Uint8Array;
  entry: ZipEntry;
}

/** Whether copyZipEntries can copy this entry: stored or deflated, and not encrypted. */
export function canCopyZipEntry(entry: ZipEntry): boolean {
  return !entry.encrypted && (entry.method === 0 || entry.method === 8);
}

const utf8Encoder = new TextEncoder();

/**
 * Writes a zip of entries taken from other zips, each as it is stored there: nothing is inflated or compressed again.
 * Names are written in UTF-8; there is no ZIP64, so the zip must stay under 4 GiB and 65,535 entries.
 */
export function copyZipEntries(copies: readonly ZipCopy[]): Uint8Array<ArrayBuffer> {
  const parts = copies.map((c) => {
    if (!canCopyZipEntry(c.entry)) throw new ZipFormatError(`Cannot copy zip entry: ${c.entry.name}`);
    return { entry: c.entry, name: utf8Encoder.encode(c.name), data: storedData(c.archive, c.entry) };
  });
  let size = 22;
  for (const p of parts) size += 76 + 2 * p.name.length + p.data.length;
  if (size > 0xffffffff || parts.length > 0xffff || parts.some((p) => p.entry.size > 0xffffffff)) throw new ZipFormatError('Too big for a zip without ZIP64');

  const out = new Uint8Array(size);
  const view = new DataView(out.buffer);
  // Local header and central directory header share these fields, from "version needed" on
  const common = (at: number, p: (typeof parts)[number]) => {
    view.setUint16(at, 20, true);
    view.setUint16(at + 2, 0x800, true);
    view.setUint16(at + 4, p.entry.method, true);
    view.setUint32(at + 6, p.entry.dosTime, true);
    view.setUint32(at + 10, p.entry.crc32, true);
    view.setUint32(at + 14, p.data.length, true);
    view.setUint32(at + 18, p.entry.size, true);
    view.setUint16(at + 22, p.name.length, true);
  };
  let offset = 0;
  const offsets: number[] = [];
  for (const p of parts) {
    offsets.push(offset);
    view.setUint32(offset, 0x04034b50, true);
    common(offset + 4, p);
    out.set(p.name, offset + 30);
    out.set(p.data, offset + 30 + p.name.length);
    offset += 30 + p.name.length + p.data.length;
  }
  const directory = offset;
  parts.forEach((p, i) => {
    view.setUint32(offset, 0x02014b50, true);
    view.setUint16(offset + 4, 20, true);
    common(offset + 6, p);
    view.setUint32(offset + 42, offsets[i]!, true);
    out.set(p.name, offset + 46);
    offset += 46 + p.name.length;
  });
  view.setUint32(offset, 0x06054b50, true);
  view.setUint16(offset + 8, parts.length, true);
  view.setUint16(offset + 10, parts.length, true);
  view.setUint32(offset + 12, offset - directory, true);
  view.setUint32(offset + 16, directory, true);
  return out;
}
