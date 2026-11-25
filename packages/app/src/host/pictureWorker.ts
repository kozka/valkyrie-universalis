// Decodes the official import's pictures (DDS, dds.ts, and Android's PVR, pvr.ts) from the origin private file
// system, away from the page, at no more than the size the device can hold: each halving averages four pixels, as a
// smaller copy (mipmap) does. Gives a bitmap for the board, or a PNG for the screens. Not ported from Valkyrie, whose
// pictures Unity loads.
import { decodeDds, halfSize } from './dds.ts';
import { readOpfsFile } from './opfs.ts';
import { decodePvr } from './pvr.ts';

export interface PictureRequest {
  id: number;
  /** The file's path of names in the origin private file system. */
  path: string[];
  /** The biggest side, in pixels. */
  maxSize: number;
  want: 'bitmap' | 'png';
}

export interface PictureReply {
  id: number;
  picture: ImageBitmap | Blob | null;
  /** Why there is no picture, for the console. */
  problem?: string;
}

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<PictureRequest>) => void) | null;
  postMessage(reply: PictureReply, transfer?: Transferable[]): void;
};

scope.onmessage = (event) => {
  const request = event.data;
  decode(request).then(
    (picture) => scope.postMessage({ id: request.id, picture }, picture instanceof ImageBitmap ? [picture] : []),
    (e: unknown) => scope.postMessage({ id: request.id, picture: null, problem: String(e) }),
  );
};

async function decode(request: PictureRequest): Promise<ImageBitmap | Blob> {
  const bytes = await readOpfsFile(request.path);
  if (bytes === null) throw new Error('not in the browser storage');
  // As ContentData.FileToTexture, by the file's extension
  let pixels = /\.pvr$/i.test(request.path.at(-1)!) ? decodePvr(bytes) : decodeDds(bytes);
  if (pixels === null) throw new Error('not a picture the app can read');
  while (Math.max(pixels.width, pixels.height) > request.maxSize && pixels.width > 1 && pixels.height > 1) pixels = halfSize(pixels);
  const image = new ImageData(pixels.data, pixels.width, pixels.height);
  // Premultiplied, as the board draws it (pictureFiles.ts PREMULTIPLIED; not imported here, to keep the worker small)
  if (request.want === 'bitmap') return createImageBitmap(image, { premultiplyAlpha: 'premultiply' });
  const canvas = new OffscreenCanvas(pixels.width, pixels.height);
  canvas.getContext('2d')!.putImageData(image, 0, 0);
  return canvas.convertToBlob({ type: 'image/png' });
}
