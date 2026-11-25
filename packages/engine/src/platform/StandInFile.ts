// Stand-ins for pictures that are not here: Valkyrie's own (fetched later) and the official import (schematic mode).
// Not ported from Valkyrie. ContentData.FileToTexture reads only the size from a picture's header, so a header is
// enough for the engine to run as Valkyrie would; the app draws a placeholder where it finds one.

/** Size of every stand-in picture whose real size is not known: big enough for any part an atlas entry cuts out of it. */
export const STAND_IN_SIZE = 4096;

/** A picture that holds only the header Valkyrie reads, with this size in pixels. Other files are empty. */
export function standInFile(path: string, width = STAND_IN_SIZE, height = STAND_IN_SIZE): Uint8Array {
  const extension = path.substring(path.lastIndexOf('.')).toLowerCase();
  if (extension === '.dds') {
    const header = new Uint8Array(128);
    header.set([0x44, 0x44, 0x53, 0x20, 124]); // "DDS " and the header size
    header[12] = height & 0xff;
    header[13] = height >> 8;
    header[16] = width & 0xff;
    header[17] = width >> 8;
    header.set([0x44, 0x58, 0x54, 0x35], 84); // DXT5
    return header;
  }
  if (extension === '.png') {
    const png = new Uint8Array(33);
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
    const view = new DataView(png.buffer);
    view.setUint32(16, width);
    view.setUint32(20, height);
    png.set([8, 6], 24);
    return png;
  }
  if (extension === '.jpg' || extension === '.jpeg') {
    return new Uint8Array([0xff, 0xd8, 0xff, 0xc0, 0, 11, 8, height >> 8, height & 0xff, width >> 8, width & 0xff, 1, 1, 0x11, 0, 0xff, 0xd9]);
  }
  if (extension === '.pvr') {
    const pvr = new Uint8Array(52);
    const view = new DataView(pvr.buffer);
    view.setUint32(8, 22, true); // ETC2_RGB4
    view.setInt32(24, height, true);
    view.setInt32(28, width, true);
    return pvr;
  }
  return new Uint8Array(0);
}

/** Whether these bytes, read from this path, are a stand-in: the header alone, with no picture after it. */
export function isStandIn(path: string, bytes: Uint8Array): boolean {
  const standIn = standInFile(path);
  if (bytes.length !== standIn.length) return false;
  // The magic number and, for PNG, the IHDR chunk name: everything before the size
  const prefix = standIn.length === 128 ? 5 : standIn.length === 33 ? 16 : standIn.length === 17 ? 4 : standIn.length === 52 ? 12 : 0;
  for (let i = 0; i < prefix; i++) {
    if (bytes[i] !== standIn[i]) return false;
  }
  return true;
}
