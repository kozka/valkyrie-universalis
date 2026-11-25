// Folders and files of the browser's origin private file system: written by the workers (opfsWorker.ts,
// importWorker.ts), read by the app. Not ported from Valkyrie.

/** The folder that keeps Valkyrie's user folder, under the virtual file system's paths (storage.ts). */
export const KEPT_FOLDER = 'vfs';
/** Where a backup is made before it is downloaded, and where one is put back before it takes the kept folder's place (backupWorker.ts). */
export const BACKUP_FOLDER = 'backup';
export const RESTORE_FOLDER = 'restore';
export const BACKUP_FILE = 'valkyrie-universalis.zip';

/** Not in Valkyrie: the files written beside themselves first (opfsWorker.ts), so a write cut short keeps the old one. */
export const TMP_SUFFIX = '.tmp';

/** Whether a kept file is written beside itself first: config.ini and the saves. */
export function isWrittenWhole(name: string): boolean {
  return /^config\.ini$|\.vsave$/i.test(name);
}

/**
 * What createSyncAccessHandle gives, the way to write that Safari has (createWritable came later to it). Chrome 102 to
 * 107 had it with truncate, flush and close returning promises, which have to be waited for (writing while one is
 * pending throws), and Chrome before 102 does not have it.
 */
interface SyncAccessHandle {
  truncate(size: number): void | Promise<void>;
  write(buffer: Uint8Array, options: { at: number }): number;
  flush(): void | Promise<void>;
  close(): void | Promise<void>;
}

/** A file open for writing (openForWriting): its bytes written at a place, then closed, which keeps them. */
export interface OpfsWriter {
  write(bytes: Uint8Array, at: number): Promise<void>;
  close(): Promise<void>;
}

/** The folder at this path of names, made when `create` asks; null when it is not there. */
export async function opfsFolder(path: readonly string[], create: boolean): Promise<FileSystemDirectoryHandle | null> {
  let dir = await navigator.storage.getDirectory();
  for (const name of path) {
    try {
      dir = await dir.getDirectoryHandle(name, { create });
    } catch (e) {
      if (e instanceof DOMException && (e.name === 'NotFoundError' || e.name === 'TypeMismatchError')) return null;
      throw e;
    }
  }
  return dir;
}

/** A file's bytes, or null when it is not there. */
export async function readOpfsFile(path: readonly string[]): Promise<Uint8Array<ArrayBuffer> | null> {
  const dir = await opfsFolder(path.slice(0, -1), false);
  if (dir === null) return null;
  try {
    const file = await (await dir.getFileHandle(path.at(-1)!)).getFile();
    return new Uint8Array(await file.arrayBuffer());
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'NotFoundError' || e.name === 'TypeMismatchError')) return null;
    throw e;
  }
}

/**
 * How openForWriting writes: 'any' with a sync access handle where the browser has one, 'writable' always with
 * createWritable (after a sync access handle said there was no room, isNoRoom).
 */
export type WriteWay = 'any' | 'writable';

/**
 * Whether an error is the browser saying there is no room: a QuotaExceededError. A sync access handle says it with
 * "No space available for this operation", even with room left in the origin (Chrome on an old Android tablet,
 * 30 October 2026), so the writers try once more with createWritable before telling the player (importWorker.ts).
 */
export function isNoRoom(e: unknown): boolean {
  return (e instanceof DOMException && e.name === 'QuotaExceededError') || /QuotaExceeded|No space available/i.test(String(e));
}

/** How many bytes the files below a folder take; 0 when it is not there. */
export async function opfsSize(path: readonly string[]): Promise<number> {
  let size = 0;
  for (const { file } of await opfsFiles(path)) {
    try {
      size += (await file.getFile()).size;
    } catch {
      // Gone meanwhile: it takes nothing
    }
  }
  return size;
}

/**
 * A file emptied and opened for writing, its folders made. Only workers can open one. With a sync access handle where
 * the browser has one and `how` allows it; otherwise (Chrome before 102, 19 October 2026: an old tablet could not keep
 * anything) with createWritable, which Chrome has had since 86 and which keeps what was written when it closes.
 */
export async function openForWriting(path: readonly string[], how: WriteWay = 'any'): Promise<OpfsWriter> {
  const dir = (await opfsFolder(path.slice(0, -1), true))!;
  const file = (await dir.getFileHandle(path.at(-1)!, { create: true })) as unknown as {
    createSyncAccessHandle?(): Promise<SyncAccessHandle>;
    createWritable(options: { keepExistingData: boolean }): Promise<{ write(data: { type: 'write'; position: number; data: Uint8Array }): Promise<void>; close(): Promise<void> }>;
  };
  if (how === 'any' && typeof file.createSyncAccessHandle === 'function') {
    const handle = await file.createSyncAccessHandle();
    await handle.truncate(0);
    return {
      write: async (bytes, at) => {
        if (handle.write(bytes, { at }) !== bytes.length) throw new Error(`${path.join('/')}: a write was cut short`);
      },
      close: async () => {
        try {
          await handle.flush();
        } finally {
          await handle.close();
        }
      },
    };
  }
  const writable = await file.createWritable({ keepExistingData: false });
  return {
    write: (bytes, at) => writable.write({ type: 'write', position: at, data: bytes }),
    close: () => writable.close(),
  };
}

/** Every file below a folder, by the names of its path below it; none when the folder is not there. */
export async function opfsFiles(path: readonly string[]): Promise<{ path: string[]; file: FileSystemFileHandle }[]> {
  const found: { path: string[]; file: FileSystemFileHandle }[] = [];
  const walk = async (dir: FileSystemDirectoryHandle, below: string[]): Promise<void> => {
    for await (const [name, handle] of (dir as unknown as { entries(): AsyncIterable<[string, FileSystemHandle]> }).entries()) {
      if (handle.kind === 'directory') await walk(handle as FileSystemDirectoryHandle, [...below, name]);
      else found.push({ path: [...below, name], file: handle as FileSystemFileHandle });
    }
  };
  const dir = await opfsFolder(path, false);
  if (dir !== null) await walk(dir, []);
  return found;
}

/** Removes a file, or a folder with everything in it; nothing happens when it is not there. */
export async function removeOpfsEntry(path: readonly string[], directory: boolean): Promise<void> {
  const dir = await opfsFolder(path.slice(0, -1), false);
  if (dir === null) return;
  try {
    await dir.removeEntry(path.at(-1)!, { recursive: directory });
  } catch (e) {
    if (!(e instanceof DOMException && e.name === 'NotFoundError')) throw e;
  }
}
