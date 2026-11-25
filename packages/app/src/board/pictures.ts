// The pictures of the board: the file each of the engine's textures comes from (host/pictureFiles.ts), and the part an
// atlas entry cuts out of it (Texture2D.cutFrom), or the sprite of Valkyrie's Resources an object shows. When there is
// no picture, the board draws a schematic. Not ported from Valkyrie.
import { Rectangle, Texture } from 'pixi.js';
import { Resources, type Texture2D } from '@universalis/engine';
import { pictureBitmap, pictureBlob, resourceBitmap } from '../host/pictureFiles.ts';

/** Decoded files, by the file the engine read, and the parts atlas entries cut out of them: the same picture is drawn
 * many times. Kept while the board is on screen, as Valkyrie keeps its texture cache until Destroyer.Destroy. */
const wholes = new Map<string, Promise<Texture | null>>();
const cuts = new Map<string, Texture>();
/** Object URLs of the pictures the quest's UI elements show, by file. */
const urls = new Map<string, Promise<string | null>>();
/** How the decoded pictures name a sprite of Valkyrie's Resources, apart from the files of the file system. */
const RESOURCE = 'resource:';

async function decode(file: string): Promise<Texture | null> {
  const bitmap = await (file.startsWith(RESOURCE) ? resourceBitmap(file.substring(RESOURCE.length)) : pictureBitmap(file));
  if (bitmap === null) return null;
  const texture = Texture.from(bitmap, true);
  // The bitmap is premultiplied already (host/pictureFiles.ts PREMULTIPLIED): Pixi must not ask for it again
  texture.source.alphaMode = 'premultiplied-alpha';
  // The board leans away from the camera: smaller copies and anisotropic filtering keep the far side clean
  texture.source.autoGenerateMipmaps = true;
  texture.source.style.maxAnisotropy = 8;
  return texture;
}

/** A picture decoded once for every piece that shows it. */
function whole(file: string): Promise<Texture | null> {
  let picture = wholes.get(file);
  if (picture === undefined) {
    const decoding = decode(file);
    picture = decoding;
    wholes.set(file, decoding);
    // Not in Valkyrie: one that did not come (the network, the decoder) is tried again by the next piece that shows it
    void decoding.then(
      (t) => t === null && wholes.get(file) === decoding && wholes.delete(file),
      () => wholes.get(file) === decoding && wholes.delete(file),
    );
  }
  return picture;
}

/** What Resources.Load(name) shows (Image.resource), or null when it is not one of Valkyrie's or cannot be fetched. */
export async function resourceTexture(name: string): Promise<Texture | null> {
  const path = Resources.load(name);
  if (path === null) return null;
  const decoded = await whole(RESOURCE + path);
  return decoded === null || decoded.destroyed ? null : decoded;
}

/** What Sprite.Create(texture, …) shows: the whole file, or the part of it the texture was cut from. */
export async function boardTexture(texture: Texture2D): Promise<Texture | null> {
  const cut = texture.cutFrom;
  const file = (cut?.texture ?? texture).name;
  if (file === '') return null;
  const decoded = await whole(file);
  // Null too when the pictures were released while this one was decoding: the board that asked for it is gone
  if (decoded === null || decoded.destroyed) return null;
  if (cut === null) return decoded;
  const key = `${file}|${cut.x}|${cut.y}|${cut.width}|${cut.height}`;
  let part = cuts.get(key);
  if (part === undefined) {
    // Unity counts the rows of GetPixels from the bottom of the picture; a picture decoded smaller (an imported one on a
    // phone) has the part at its scale
    const sx = decoded.width / cut.texture.width;
    const sy = decoded.height / cut.texture.height;
    part = new Texture({ source: decoded.source, frame: new Rectangle(cut.x * sx, decoded.height - (cut.y + cut.height) * sy, cut.width * sx, cut.height * sy) });
    cuts.set(key, part);
  }
  return part;
}

/** An object URL for a picture, for the quest's UI elements, or null when it is not here. */
export function pictureUrl(file: string): Promise<string | null> {
  let url = urls.get(file);
  if (url === undefined) {
    url = pictureBlob(file).then((blob) => (blob === null ? null : URL.createObjectURL(blob)));
    urls.set(file, url);
  }
  return url;
}

/** Forgets every picture, when the board goes: the next quest may come from a scenario imported again. */
export function releasePictures(): void {
  for (const part of cuts.values()) part.destroy();
  cuts.clear();
  for (const whole of wholes.values()) void whole.then((texture) => texture?.destroy(true));
  wholes.clear();
  for (const url of urls.values()) void url.then((u) => u !== null && URL.revokeObjectURL(u));
  urls.clear();
}
