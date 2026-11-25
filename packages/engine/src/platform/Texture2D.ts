// UnityEngine.Texture2D as Valkyrie's game code uses it: a size, read from the file header. Not ported from Valkyrie.
// The engine never decodes pixels; the app draws `name` (the file), or the part of `cutFrom` that the texture holds.

/** What GetPixels returns: a part of a texture, counted from its bottom-left corner as Unity does. */
export interface TexturePixels {
  texture: Texture2D;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Texture2D {
  width: number;
  height: number;
  /** Unity's Object.name; ContentData.fileToTexture sets it to the file the texture comes from. */
  name = '';
  /** Set by setPixels when the texture is a part cut from another one. */
  cutFrom: TexturePixels | null = null;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /** ImageConversion.LoadImage: PNG or JPEG data; false for anything else. */
  loadImage(data: Uint8Array): boolean {
    const size = pngSize(data) ?? jpegSize(data);
    if (size === null) return false;
    this.width = size.width;
    this.height = size.height;
    return true;
  }

  /** LoadRawTextureData: the app decodes the file itself. */
  loadRawTextureData(_data: Uint8Array): void {}

  apply(): void {}

  /** GetPixels(x, y, blockWidth, blockHeight); throws when the block is outside the texture, as Unity does. */
  getPixels(x: number, y: number, blockWidth: number, blockHeight: number): TexturePixels {
    if (x < 0 || y < 0 || blockWidth < 0 || blockHeight < 0 || x + blockWidth > this.width || y + blockHeight > this.height) {
      throw new Error('UnityException: Texture rectangle is out of bounds');
    }
    return { texture: this, x, y, width: blockWidth, height: blockHeight };
  }

  setPixels(pixels: TexturePixels): void {
    this.cutFrom = pixels;
  }
}

function pngSize(data: Uint8Array): { width: number; height: number } | null {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (data.length < 24 || signature.some((b, i) => data[i] !== b)) return null;
  // IHDR is the first chunk: length, "IHDR", then width and height, big-endian
  if (String.fromCharCode(data[12]!, data[13]!, data[14]!, data[15]!) !== 'IHDR') return null;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

function jpegSize(data: Uint8Array): { width: number; height: number } | null {
  if (data.length < 4 || data[0] !== 0xff || data[1] !== 0xd8) return null;
  let i = 2;
  while (i + 3 < data.length) {
    if (data[i] !== 0xff) return null;
    const marker = data[i + 1]!;
    if (marker === 0xff) {
      i++;
      continue;
    }
    // Markers without a length
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const length = (data[i + 2]! << 8) | data[i + 3]!;
    // Start of frame (SOF0 to SOF15, except DHT, JPG and DAC): precision, height, width
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      if (i + 8 >= data.length) return null;
      return { height: (data[i + 5]! << 8) | data[i + 6]!, width: (data[i + 7]! << 8) | data[i + 8]! };
    }
    i += 2 + length;
  }
  return null;
}
