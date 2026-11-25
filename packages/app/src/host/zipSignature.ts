// Whether downloaded bytes are a whole zip, before they replace a package that works. Not ported from Valkyrie.

/** The end of a zip's central directory: its signature, its smallest size, and the longest comment after it. */
const END_SIGNATURE = [0x50, 0x4b, 0x05, 0x06];
const END_SIZE = 22;
const MAX_COMMENT = 0xffff;

/** Whether the bytes end as a zip does: the end of its central directory within its last 64 KB and 22 bytes. */
export function endsAsZip(bytes: Uint8Array): boolean {
  const from = Math.max(0, bytes.length - END_SIZE - MAX_COMMENT);
  for (let at = bytes.length - END_SIZE; at >= from; at--) {
    if (END_SIGNATURE.every((b, i) => bytes[at + i] === b)) return true;
  }
  return false;
}
