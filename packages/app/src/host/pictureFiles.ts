// The picture files the app draws, read from the virtual file system: PNG and JPEG as they are, and DDS and PVR decoded
// by the app (dds.ts, pvr.ts), as ContentData.FileToTexture reads them. The official import's come from its store
// (officialImport.ts); Valkyrie's own pictures, which the app does not bundle, are fetched from its repository and kept
// in the browser's cache, those of its Resources folder too. Not ported from Valkyrie.
import { Path, fileSystem, isStandIn } from '@universalis/engine';
import { baseDataCommit, baseImageUrl, resourceUrl } from './baseData.ts';
import { decodeDds, type Pixels } from './dds.ts';
import { devLog } from './devLog.ts';
import { importedFile, importedPicture, isImportedPicture, isInImportFolder } from './officialImport.ts';
import { decodePvr } from './pvr.ts';

const TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.webp': 'image/webp',
};

/** The browser cache that keeps Valkyrie's own pictures, one per commit of the base data, which their addresses name. */
const CACHE = 'valkyrie-pictures';

function pictureCache(): string {
  return `${CACHE}-${baseDataCommit()}`;
}

/** Not in Valkyrie: deletes the pictures kept for other commits of the base data (and the one before commits named it). */
export async function pruneOldPictureCaches(): Promise<void> {
  if (typeof caches === 'undefined' || baseDataCommit() === '') return;
  try {
    const current = pictureCache();
    for (const name of await caches.keys()) {
      if (name.startsWith(CACHE) && name !== current) await caches.delete(name);
    }
  } catch (e) {
    console.warn(`Cannot clear old pictures: ${String(e)}`);
  }
}

/**
 * Bitmaps for the board are made with their colours already multiplied by their alpha, as the board draws them (Pixi's
 * premultiplied blending, board/pictures.ts). WebGL ignores UNPACK_PREMULTIPLY_ALPHA for an ImageBitmap, and with the
 * 'default' option Chrome premultiplies but Firefox and Safari do not: there the see-through parts of a tile whose
 * hidden colour is white (the connectors, the margins) came out as white patches (18 October 2026, a player's report).
 */
export const PREMULTIPLIED: ImageBitmapOptions = { premultiplyAlpha: 'premultiply' };

/** The biggest side of the official import's pictures on this device: a phone holds fewer and smaller ones. */
const MAX_PICTURE = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches ? 1024 : 2048;

/** The picture in this file, ready to draw, or null when it is not here or cannot be drawn. */
export async function pictureBitmap(file: string): Promise<ImageBitmap | null> {
  if (isImportedPicture(file)) return importedPicture(file, MAX_PICTURE, 'bitmap');
  const picture = await read(file);
  if (picture === null) return null;
  try {
    return await createImageBitmap(picture instanceof Blob ? picture : new ImageData(picture.data, picture.width, picture.height), PREMULTIPLIED);
  } catch {
    return null;
  }
}

/**
 * A picture of Valkyrie's Resources folder (the path Resources.load gives), ready to draw, or null when its repository
 * cannot be reached. Its DDS keep Unity's rows, as the import's do.
 */
export async function resourceBitmap(path: string): Promise<ImageBitmap | null> {
  const bytes = await fetchCached(resourceUrl(path));
  if (bytes === null) return null;
  const extension = Path.getExtension(path).toLowerCase();
  const picture = extension === '.dds' ? decodeDds(bytes) : new Blob([bytes], { type: TYPES[extension] ?? 'image/png' });
  if (picture === null) return null;
  try {
    return await createImageBitmap(picture instanceof Blob ? picture : new ImageData(picture.data, picture.width, picture.height), PREMULTIPLIED);
  } catch {
    return null;
  }
}

/** The picture in this file as an image the browser shows by itself (a DDS as PNG), or null. */
export async function pictureBlob(file: string): Promise<Blob | null> {
  if (isImportedPicture(file)) return importedPicture(file, MAX_PICTURE, 'png');
  const picture = await read(file);
  if (picture === null || picture instanceof Blob) return picture;
  try {
    const canvas = new OffscreenCanvas(picture.width, picture.height);
    canvas.getContext('2d')!.putImageData(new ImageData(picture.data, picture.width, picture.height), 0, 0);
    return await canvas.convertToBlob({ type: 'image/png' });
  } catch {
    return null;
  }
}

/** The file as the browser reads it, or its pixels when the app decodes it. */
async function read(file: string): Promise<Blob | Pixels | null> {
  if (isInImportFolder(file)) devLog('picture', file, 'not in the import');
  const extension = Path.getExtension(file).toLowerCase();
  const type = TYPES[extension];
  if (type === undefined && extension !== '.dds' && extension !== '.pvr') return null;
  const bytes = await fileBytes(file);
  if (bytes === null) return null;
  if (type !== undefined) return new Blob([bytes], { type });
  return extension === '.pvr' ? decodePvr(bytes) : decodeDds(bytes);
}

async function fileBytes(file: string): Promise<Uint8Array<ArrayBuffer> | null> {
  const imported = await importedFile(file);
  if (imported !== null) return imported;
  const bytes = fileSystem().readFile(file);
  if (bytes === null) return null;
  if (!isStandIn(file, bytes)) return bytes.slice();
  const url = baseImageUrl(file);
  return url === null ? null : fetchCached(url);
}

async function fetchCached(url: string): Promise<Uint8Array<ArrayBuffer> | null> {
  try {
    const cache = typeof caches === 'undefined' ? null : await caches.open(pictureCache());
    let response = await cache?.match(url);
    if (response === undefined) {
      response = await fetch(url);
      if (!response.ok) return null;
      await cache?.put(url, response.clone());
    }
    return new Uint8Array(await response.arrayBuffer());
  } catch {
    // Offline, or the repository cannot be reached: the board draws a schematic and the screens a placeholder
    return null;
  }
}
