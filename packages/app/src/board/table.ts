// The table under the board: one large quad of felt in the theme's colour, with a fine grain, so that it reads as a
// surface in perspective and the board lies on it, unless it is the pure black one, the default. Not ported from
// Valkyrie, whose camera clears to black.
import { Texture } from 'pixi.js';

/** How many board units one copy of the grain covers. */
export const TABLE_GRAIN = 4;
/** How far the table reaches each way from the middle of the board, in board units. */
export const TABLE_SIZE = 2000;

/** A square of felt that repeats without seams: the colour with light and dark specks, the same ones every time, or
 * none for a plain felt. */
export function tableTexture(colour: string, grain = true): Texture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d')!;
  context.fillStyle = colour;
  context.fillRect(0, 0, size, size);
  const pixels = context.getImageData(0, 0, size, size);
  const data = pixels.data;
  // Park and Miller's minimal generator, so that screenshots of the board can be compared
  let seed = 1;
  for (let i = 0; grain && i < data.length; i += 4) {
    seed = (seed * 16807) % 2147483647;
    const grain = (seed / 2147483647 - 0.5) * 14;
    data[i] = data[i]! + grain;
    data[i + 1] = data[i + 1]! + grain;
    data[i + 2] = data[i + 2]! + grain;
  }
  context.putImageData(pixels, 0, 0);
  const texture = Texture.from(canvas, true);
  texture.source.autoGenerateMipmaps = true;
  texture.source.style.addressMode = 'repeat';
  texture.source.style.maxAnisotropy = 8;
  return texture;
}
