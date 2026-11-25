// Text decoding as .NET's StreamReader does it by default (File.ReadAllText, File.ReadAllLines):
// UTF-8 unless a byte order mark says UTF-16 or UTF-32, and the mark itself is dropped.
// Not ported from Valkyrie.

// ignoreBOM keeps any further mark in the text, as .NET does; the first one is removed by hand.
const utf8 = new TextDecoder('utf-8', { ignoreBOM: true });
const utf16le = new TextDecoder('utf-16le', { ignoreBOM: true });
const utf16be = new TextDecoder('utf-16be', { ignoreBOM: true });

function decodeUtf32(bytes: Uint8Array, littleEndian: boolean): string {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let text = '';
  for (let i = 0; i + 3 < bytes.length; i += 4) {
    const codePoint = view.getUint32(i, littleEndian);
    text += codePoint <= 0x10ffff && (codePoint < 0xd800 || codePoint > 0xdfff) ? String.fromCodePoint(codePoint) : '�';
  }
  return text;
}

/** Which text encoding a byte order mark announces, if any. */
export function detectBom(bytes: Uint8Array): 'utf-8' | 'utf-16le' | 'utf-16be' | 'utf-32le' | 'utf-32be' | null {
  const [b0, b1, b2, b3] = bytes;
  if (b0 === 0xfe && b1 === 0xff) return 'utf-16be';
  if (b0 === 0xff && b1 === 0xfe) return bytes.length >= 4 && b2 === 0 && b3 === 0 ? 'utf-32le' : 'utf-16le';
  if (b0 === 0xef && b1 === 0xbb && b2 === 0xbf) return 'utf-8';
  if (b0 === 0 && b1 === 0 && b2 === 0xfe && b3 === 0xff) return 'utf-32be';
  return null;
}

/** File.ReadAllText: decoded text without the byte order mark. */
export function decodeText(bytes: Uint8Array): string {
  switch (detectBom(bytes)) {
    case 'utf-8':
      return utf8.decode(bytes.subarray(3));
    case 'utf-16le':
      return utf16le.decode(bytes.subarray(2));
    case 'utf-16be':
      return utf16be.decode(bytes.subarray(2));
    case 'utf-32le':
      return decodeUtf32(bytes.subarray(4), true);
    case 'utf-32be':
      return decodeUtf32(bytes.subarray(4), false);
    default:
      return utf8.decode(bytes);
  }
}

/** StreamReader.ReadLine splitting: CR LF, LF or CR end a line; a final terminator adds no empty line. */
export function splitLines(text: string): string[] {
  const lines: string[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c === 0x0d || c === 0x0a) {
      lines.push(text.substring(start, i));
      if (c === 0x0d && text.charCodeAt(i + 1) === 0x0a) i++;
      start = i + 1;
    }
  }
  if (start < text.length) lines.push(text.substring(start));
  return lines;
}

/** UTF-8 encoding, as File.WriteAllText writes it (without a byte order mark). */
export function encodeText(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}
