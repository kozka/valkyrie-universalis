// Keeps what Valkyrie writes in its user folder (AppData/Valkyrie: config.ini, Download with its manifest, saves) in
// the browser's origin private file system, so it is there next time, and mirrors every change. When the app starts,
// the small files go into the virtual file system; the scenario packages and the saves, which can be tens of MB each,
// stay on disk until the app reads them, one step at a time, before the engine needs them (listingKeptFiles,
// eachKeptFile, listingPackages, startingFromKeptFiles), so that a phone does not hold every download in memory. The
// official import has its own store (officialImport.ts). Not ported from Valkyrie.
import { Game, type VirtualFileSystem } from '@universalis/engine';
import { isInImportFolder } from './officialImport.ts';
import { KEPT_FOLDER, TMP_SUFFIX, isWrittenWhole, opfsFiles } from './opfs.ts';
import type { StorageReply, StorageRequest } from './opfsWorker.ts';

function segments(path: string): string[] {
  return [KEPT_FOLDER, ...path.split('/').filter((s) => s.length > 0)];
}

/** A zip with nothing in it: the end of its central directory. */
const EMPTY_ZIP = new Uint8Array([0x50, 0x4b, 0x05, 0x06, ...new Array<number>(18).fill(0)]);

/** The kept files that stay on disk until needed: scenario packages, saves and the players' translations. */
function staysOnDisk(path: string): boolean {
  return /\.(valkyrie|vsave)$/i.test(path) || /\/Translations\/[^/]+\/[^/]+\.zip$/i.test(path);
}

let kept: PersistentFolder | null = null;

/** Not in Valkyrie: who hears of a problem writing to storage, so that the app can tell the player. */
const errorListeners = new Set<(error: string) => void>();

/** Calls the listener with each problem writing to storage; returns the way to stop. */
export function onStorageError(listener: (error: string) => void): () => void {
  errorListeners.add(listener);
  return () => errorListeners.delete(listener);
}

/** How long whenIdle waits without a word from the worker before it gives up. */
const IDLE_WAIT_MS = 10_000;

/** The kept folder, or null when this browser keeps no files. */
export function keptFolder(): PersistentFolder | null {
  return kept;
}

export class PersistentFolder {
  /** Game.DefaultAppData(): everything below it is kept. */
  readonly root = Game.defaultAppData();
  private readonly vfs: VirtualFileSystem;
  private readonly worker: Worker;
  private nextId = 1;
  private readonly pending = new Map<number, () => void>();
  private stopWatching: (() => void) | null = null;
  /** The files that stay on disk, by their path in the virtual file system, and those read while the app needs them. */
  private readonly onDisk = new Map<string, FileSystemFileHandle>();
  private readonly read = new Map<string, Uint8Array>();
  /** Problems writing, kept so the app can tell the player. */
  readonly errors: string[] = [];

  private constructor(vfs: VirtualFileSystem) {
    this.vfs = vfs;
    this.worker = new Worker(new URL('./opfsWorker.ts', import.meta.url), { type: 'module' });
    this.worker.onmessage = (event: MessageEvent<StorageReply>) => {
      if (event.data.error !== undefined) this.failed(event.data.error);
      this.lastHeard = Date.now();
      this.pending.get(event.data.id)?.();
      this.pending.delete(event.data.id);
    };
    // The worker failed as a whole: what it was writing will not be written
    this.worker.onerror = (event) => {
      this.failed(`Storage worker: ${event.message}`);
      for (const done of this.pending.values()) done();
      this.pending.clear();
    };
  }

  private failed(error: string): void {
    this.errors.push(error);
    console.warn(`Cannot write to storage: ${error}`);
    for (const listener of errorListeners) listener(error);
  }

  /** When the worker last finished a change, so that whenIdle waits while it works. */
  private lastHeard = 0;

  /** Null when this browser has no origin private file system (then nothing is kept). */
  static async open(vfs: VirtualFileSystem): Promise<PersistentFolder | null> {
    if (typeof navigator.storage?.getDirectory !== 'function') return null;
    try {
      await navigator.storage.getDirectory();
    } catch {
      return null;
    }
    kept = new PersistentFolder(vfs);
    return kept;
  }

  /**
   * Puts the kept files into the virtual file system: the small ones whole, the others by their size, to be read when
   * the app needs them. Call before watch, so loading writes nothing back.
   */
  async load(): Promise<void> {
    for (const { path, file } of await opfsFiles([KEPT_FOLDER])) {
      const vfsPath = '/' + path.join('/');
      // Not in Valkyrie: a write cut short beside its file (opfsWorker.ts)
      if (vfsPath.endsWith(TMP_SUFFIX) && isWrittenWhole(path.at(-1)!.slice(0, -TMP_SUFFIX.length))) continue;
      try {
        const contents = await file.getFile();
        if (staysOnDisk(vfsPath)) {
          this.onDisk.set(vfsPath, file);
          this.vfs.writeFile(vfsPath, () => this.bytes(vfsPath), contents.size);
        } else {
          this.vfs.writeFile(vfsPath, new Uint8Array(await contents.arrayBuffer()));
        }
      } catch (e) {
        // Not in Valkyrie: one unreadable file must not stop the app starting
        console.warn(`Cannot read ${vfsPath} from storage: ${String(e)}`);
      }
    }
  }

  private bytes(path: string): Uint8Array {
    const bytes = this.read.get(path);
    // The app must read it first (need): the engine reads files at once
    if (bytes === undefined) throw new Error(`Not read from storage yet: ${path}`);
    return bytes;
  }

  /** Reads from disk the files the engine is about to read; those already in memory are left alone. */
  async need(paths: readonly string[]): Promise<void> {
    for (const path of paths) {
      const actual = this.vfs.actualFilePath(path);
      const handle = actual === null ? undefined : this.onDisk.get(actual);
      if (actual === null || handle === undefined || this.read.has(actual)) continue;
      try {
        this.read.set(actual, new Uint8Array(await (await handle.getFile()).arrayBuffer()));
      } catch (e) {
        // Gone, as another window may delete it: the engine reads it as it would a damaged file
        console.warn(`Cannot read ${actual} from storage: ${String(e)}`);
      }
    }
  }

  /** Makes each of these files that stays on disk, and is not read, an empty zip until released (listingPackages). */
  standEmpty(paths: readonly string[]): string[] {
    const standing: string[] = [];
    for (const path of paths) {
      const actual = this.vfs.actualFilePath(path);
      if (actual === null || !this.onDisk.has(actual) || this.read.has(actual)) continue;
      this.read.set(actual, EMPTY_ZIP);
      standing.push(actual);
    }
    return standing;
  }

  /** Lets go of files need read, once the engine has what it keeps of them (a partial extraction copies it). */
  release(paths: readonly string[]): void {
    for (const path of paths) {
      const actual = this.vfs.actualFilePath(path);
      if (actual !== null) this.read.delete(actual);
    }
  }

  releaseAll(): void {
    this.read.clear();
  }

  /** From now on, every change below the root is written to the origin private file system too. */
  watch(): void {
    const rootKey = this.root.toLowerCase();
    this.stopWatching = this.vfs.onChange((change) => {
      const key = change.path.toLowerCase();
      const below = key.startsWith(rootKey + '/');
      const above = change.kind === 'delete-directory' && (key === rootKey || rootKey.startsWith(key + '/'));
      if ((!below && !above) || isInImportFolder(change.path)) return;
      // A file written or deleted no longer comes from disk
      for (const path of [...this.onDisk.keys()]) {
        const pathKey = path.toLowerCase();
        if (pathKey === key || (change.kind === 'delete-directory' && pathKey.startsWith(key === '/' ? '/' : key + '/'))) {
          this.onDisk.delete(path);
          this.read.delete(path);
        }
      }
      if (change.kind === 'write') {
        const bytes = this.vfs.readFile(change.path);
        if (bytes === null) return;
        this.send({ id: this.nextId++, op: 'write', path: segments(change.path), bytes: bytes.slice().buffer });
      } else if (change.path !== '/') {
        this.send({ id: this.nextId++, op: 'delete', path: segments(change.path), directory: change.kind === 'delete-directory' });
      }
    });
  }

  /** Stops mirroring, before a backup takes the kept folder's place (backup.ts). */
  stop(): void {
    this.stopWatching?.();
    this.stopWatching = null;
  }

  /** Resolves when every change so far is on disk, or when the worker has said nothing for IDLE_WAIT_MS. */
  whenIdle(): Promise<void> {
    if (this.pending.size === 0) return Promise.resolve();
    const last = Math.max(...this.pending.keys());
    return new Promise((resolve) => {
      const asked = Date.now();
      let timer = 0;
      const previous = this.pending.get(last)!;
      this.pending.set(last, () => {
        previous();
        clearTimeout(timer);
        resolve();
      });
      const check = (): void => {
        const quiet = Date.now() - Math.max(this.lastHeard, asked);
        if (quiet < IDLE_WAIT_MS) {
          timer = window.setTimeout(check, IDLE_WAIT_MS - quiet);
          return;
        }
        console.warn('Storage is still writing; going on without waiting for it');
        resolve();
      };
      check();
    });
  }

  private send(request: StorageRequest): void {
    this.pending.set(request.id, () => {});
    if (request.op === 'write') this.worker.postMessage(request, [request.bytes]);
    else this.worker.postMessage(request);
  }
}

/** The steps on kept files run one after another, so that none lets go of what another still reads. */
let turn: Promise<unknown> = Promise.resolve();

function inTurn(task: () => Promise<void>): Promise<void> {
  const next = turn.then(task, task);
  turn = next.catch(() => undefined);
  return next;
}

/** Runs an engine step that lists these kept files (GetSingleQuest), reading them first and letting them go after. */
export function listingKeptFiles(paths: readonly string[], step: () => void): Promise<void> {
  return inTurn(async () => {
    await kept?.need(paths);
    try {
      step();
    } finally {
      kept?.release(paths);
    }
  });
}

/** Runs a step on each of these kept files, reading one at a time and letting it go before the next. */
export function eachKeptFile(paths: readonly string[], step: (path: string, index: number) => void): Promise<void> {
  return inTurn(async () => {
    for (const [index, path] of paths.entries()) {
      await kept?.need([path]);
      try {
        step(path, index);
      } finally {
        kept?.release([path]);
      }
    }
  });
}

/**
 * Lists the kept packages without holding them all in memory at once: each is read, partly extracted (`extract`) and let
 * go, one at a time; then `step` (LoadAllLocalQuests) extracts them again, each standing as an empty zip, so that what
 * was extracted stays and nothing is read twice.
 */
export function listingPackages(paths: readonly string[], extract: (path: string) => void, step: () => void): Promise<void> {
  return inTurn(async () => {
    for (const path of paths) {
      await kept?.need([path]);
      try {
        extract(path);
      } finally {
        kept?.release([path]);
      }
    }
    const standing = kept?.standEmpty(paths) ?? [];
    try {
      step();
    } finally {
      kept?.release(standing);
    }
  });
}

/**
 * Runs an engine step that starts a game from these kept files (a package, a save), reading them first. They stay read,
 * as a quest restarted from its heroes extracts its package again; whatever was read before goes.
 */
export function startingFromKeptFiles(paths: readonly string[], step: () => void): Promise<void> {
  return inTurn(async () => {
    kept?.releaseAll();
    await kept?.need(paths);
    step();
  });
}
