// Writes and deletes files in the origin private file system for storage.ts, one change at a time. A worker, because
// createSyncAccessHandle, the way to write that Safari has, only works in one (openForWriting).
// Not ported from Valkyrie.
import { TMP_SUFFIX, isNoRoom, isWrittenWhole, openForWriting, opfsFolder, removeOpfsEntry, type WriteWay } from './opfs.ts';

export type StorageRequest =
  | { id: number; op: 'write'; path: string[]; bytes: ArrayBuffer }
  | { id: number; op: 'delete'; path: string[]; directory: boolean };

export interface StorageReply {
  id: number;
  error?: string;
}

/** Whether this browser renames files (FileSystemHandle.move); false after a rename fails. */
let canRename = typeof (globalThis as { FileSystemHandle?: { prototype: { move?: unknown } } }).FileSystemHandle?.prototype.move === 'function';

async function write(path: string[], bytes: ArrayBuffer): Promise<void> {
  if (canRename && isWrittenWhole(path.at(-1)!)) {
    try {
      await writeWhole(path, bytes);
      return;
    } catch (e) {
      canRename = false;
      console.warn(`Cannot replace ${path.join('/')} whole, writing over it from now on: ${String(e)}`);
      await removeOpfsEntry([...path.slice(0, -1), path.at(-1)! + TMP_SUFFIX], false).catch(() => undefined);
    }
  }
  await writeOver(path, bytes);
}

/** How files are written: with createWritable from the first time a sync access handle finds no room (isNoRoom). */
let way: WriteWay = 'any';

async function writeOver(path: string[], bytes: ArrayBuffer): Promise<void> {
  try {
    await writeOnce(path, bytes, way);
  } catch (e) {
    if (way === 'writable' || !isNoRoom(e)) throw e;
    way = 'writable';
    console.warn(`No room writing ${path.join('/')} with a sync access handle, trying with createWritable: ${String(e)}`);
    await writeOnce(path, bytes, way);
  }
}

async function writeOnce(path: string[], bytes: ArrayBuffer, how: WriteWay): Promise<void> {
  const handle = await openForWriting(path, how);
  try {
    await handle.write(new Uint8Array(bytes), 0);
  } finally {
    await handle.close();
  }
}

/** Not in Valkyrie: writes beside the file and then renames over it, so that a write cut short leaves the old one. */
async function writeWhole(path: string[], bytes: ArrayBuffer): Promise<void> {
  const name = path.at(-1)!;
  const tmp = [...path.slice(0, -1), name + TMP_SUFFIX];
  await writeOver(tmp, bytes);
  const dir = (await opfsFolder(path.slice(0, -1), false))!;
  const file = (await dir.getFileHandle(name + TMP_SUFFIX)) as unknown as { move(name: string): Promise<void> };
  await file.move(name);
}

const scope = self as unknown as { onmessage: ((event: MessageEvent<StorageRequest>) => void) | null; postMessage(reply: StorageReply): void };
let queue = Promise.resolve();

scope.onmessage = (event) => {
  const request = event.data;
  queue = queue.then(async () => {
    try {
      if (request.op === 'write') await write(request.path, request.bytes);
      else await removeOpfsEntry(request.path, request.directory);
      scope.postMessage({ id: request.id });
    } catch (e) {
      scope.postMessage({ id: request.id, error: String(e) });
    }
  });
};
