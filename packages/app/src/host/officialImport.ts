// The official import, kept in the origin private file system by importWorker.ts and answered from there. The engine
// sees its files in the virtual file system: pictures by their header, which holds their size, and the texts it reads
// at once in full. The app reads pictures and sounds from storage when it draws or plays them. Without a usable import
// (FetchContent.NeedImport), the game cannot be chosen, as in Valkyrie, and the schematic mode's stand-ins answer for
// the tests (schematicMode). Not ported from Valkyrie, whose import is a folder on disk.
import { FFGImport, Game, ValkyrieConstants, normalizePath, pathKey, type VirtualFileSystem } from '@universalis/engine';
import {
  IMPORT_FOLDER,
  fromBase64,
  isReadAtOnce,
  type ImportGame,
  type ImportIndex,
  type ImportProblem,
  type ImportReply,
  type ImportRequest,
  type ImportedFile,
} from './importSource.ts';
import { devLog } from './devLog.ts';
import { readOpfsFile, removeOpfsEntry } from './opfs.ts';
import type { PictureReply, PictureRequest } from './pictureWorker.ts';

const GAMES: ImportGame[] = [ValkyrieConstants.typeMom as ImportGame, ValkyrieConstants.typeDescent as ImportGame];

/** The usable import of each game, by the key of each file's path in it; null for the schematic mode. */
const imports = new Map<ImportGame, Map<string, ImportedFile> | null>();
let mountedOn: VirtualFileSystem | null = null;

/** Not in Valkyrie: how many times a game's import was read again, so that the screens' pictures ask again (ui/Picture.tsx). */
let importsRead = 0;
const importListeners = new Set<() => void>();

export function importsVersion(): number {
  return importsRead;
}

export function onImportsChanged(listener: () => void): () => void {
  importListeners.add(listener);
  return () => importListeners.delete(listener);
}

function importsChanged(): void {
  importsRead++;
  for (const listener of importListeners) listener();
}

/**
 * Whether a game without its import may be played with the schematic mode's stand-ins: only in development, with
 * `?schematic` in the address, for the automatic tests, which cannot carry official content. Players import first.
 */
export function schematicMode(): boolean {
  return import.meta.env.DEV && new URLSearchParams(location.search).has('schematic');
}

/** ContentData.ImportPath() of a game, without a game chosen. */
export function importFolder(game: string): string {
  return `${Game.defaultAppData()}/${game}/import`;
}

/** Whether the virtual file system's path is inside an import folder, which storage.ts leaves to this store. */
export function isInImportFolder(path: string): boolean {
  const key = pathKey(normalizePath(path));
  return GAMES.some((game) => {
    const folder = pathKey(normalizePath(importFolder(game)));
    return key === folder || key.startsWith(folder + '/');
  });
}

/**
 * Puts each game's import folder in the virtual file system: the kept import when it is usable, else the schematic
 * mode's stand-ins (`standIn` gives one for any picture of a game's import).
 */
export async function mountImports(vfs: VirtualFileSystem, standIn: (game: ImportGame, relative: string) => Uint8Array): Promise<void> {
  mountedOn = vfs;
  for (const game of GAMES) {
    await loadImport(game);
    vfs.mountVirtualTree(
      importFolder(game),
      (relative) => {
        const files = imports.get(game);
        return files ? files.has(pathKey(relative)) : /\.(dds|ogg)$/i.test(relative);
      },
      (relative) => {
        const files = imports.get(game);
        if (!files) return standIn(game, relative);
        const head = files.get(pathKey(relative))?.head;
        return head === undefined ? new Uint8Array(0) : fromBase64(head);
      },
    );
  }
}

/** Reads a game's kept import into the virtual file system, or leaves the schematic mode when there is none to use. */
async function loadImport(game: ImportGame): Promise<void> {
  const vfs = mountedOn!;
  const folder = importFolder(game);
  imports.set(game, null);
  markFonts(game, false);
  vfs.deleteDirectory(folder);
  const stored = await readOpfsFile([IMPORT_FOLDER, `${game}.json`]);
  if (stored === null) {
    devLog('import', game, 'none');
    return;
  }
  const index = parseIndex(stored);
  if (index === null) {
    // Not in Valkyrie: an index cut short or damaged is taken for no import, and goes
    devLog('import', game, 'unreadable index');
    console.warn(`The ${game} import's index cannot be read: it needs importing again`);
    await removeOpfsEntry([IMPORT_FOLDER, `${game}.json`], false).catch(() => undefined);
    return;
  }
  for (const file of index.files) {
    if (!isReadAtOnce(file.path)) continue;
    const bytes = await readOpfsFile([IMPORT_FOLDER, game, ...file.path.split('/')]);
    if (bytes !== null) vfs.writeFile(`${folder}/${file.path}`, bytes);
  }
  // Valkyrie: GameSelectionScreen.cs GameSelectionScreen.DrawMoMSection (ImportManager.NeedImport)
  if (new FFGImport(game, Game.defaultAppData() + '/').needImport()) {
    devLog('import', game, 'kept, but it needs importing again');
    vfs.deleteDirectory(folder);
    return;
  }
  imports.set(game, new Map(index.files.map((file) => [pathKey(file.path), file])));
  devLog('import', game, `${index.files.length} files`, index.files.slice(0, 3).map((file) => file.path));
}

/** A kept import's index, or null when it cannot be read. */
function parseIndex(stored: Uint8Array): ImportIndex | null {
  try {
    const index = JSON.parse(new TextDecoder().decode(stored)) as ImportIndex;
    return Array.isArray(index?.files) ? index : null;
  } catch {
    return null;
  }
}

/**
 * The games whose official fonts the page has, in its data-official-fonts: theme.css and Symbols.tsx use them. They are
 * Valkyrie's own, from its Resources (gameFonts.ts), as it loads them: not the import's, which one made on Android lacks.
 */
export function markFonts(game: string, loaded: boolean): void {
  const games = new Set((document.documentElement.dataset.officialFonts ?? '').split(' ').filter((g) => g !== ''));
  if (loaded) games.add(game);
  else games.delete(game);
  document.documentElement.dataset.officialFonts = [...games].join(' ');
}

/** Whether the page has the official fonts of this game, with the glyphs of its symbols. */
export function hasOfficialFonts(game: string): boolean {
  return (document.documentElement.dataset.officialFonts ?? '').split(' ').includes(game);
}

/** Where a virtual file system path of a usable import is kept, or null when it is not one. */
function storedPath(path: string): string[] | null {
  const key = pathKey(normalizePath(path));
  for (const [game, files] of imports) {
    if (files === null) continue;
    const folder = pathKey(normalizePath(importFolder(game)));
    if (!key.startsWith(folder + '/')) continue;
    const file = files.get(key.substring(folder.length + 1));
    return file === undefined ? null : [IMPORT_FOLDER, game, ...file.path.split('/')];
  }
  return null;
}

/** The bytes of a file of a usable import, from storage, or null when the path is not one. */
export async function importedFile(path: string): Promise<Uint8Array<ArrayBuffer> | null> {
  const stored = storedPath(path);
  return stored === null ? null : readOpfsFile(stored);
}

/** Whether the path is a DDS or PVR picture of a usable import, which importedPicture decodes. */
export function isImportedPicture(path: string): boolean {
  return /\.(dds|pvr)$/i.test(path) && storedPath(path) !== null;
}

let pictureWorker: Worker | null = null;
let nextPicture = 1;
const waiting = new Map<
  number,
  { path: string; since: number; late: ReturnType<typeof setTimeout>; resolve: (picture: ImageBitmap | Blob | null) => void }
>();

/** The worker that decodes the pictures, made again after it fails, which leaves its pictures undrawn. */
function decoder(): Worker {
  if (pictureWorker !== null) return pictureWorker;
  const worker = new Worker(new URL('./pictureWorker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = (event: MessageEvent<PictureReply>) => {
    const { id, picture, problem } = event.data;
    const asked = waiting.get(id);
    waiting.delete(id);
    if (asked !== undefined) {
      clearTimeout(asked.late);
      devLog('picture', asked.path, picture === null ? 'none' : 'decoded', `${Math.round(performance.now() - asked.since)} ms`);
    }
    if (problem !== undefined) console.warn(`Picture not drawn, ${asked?.path}: ${problem}`);
    asked?.resolve(picture);
  };
  worker.onerror = (event) => {
    console.error(`The picture decoder failed: ${event.message}`);
    worker.terminate();
    pictureWorker = null;
    for (const asked of waiting.values()) {
      clearTimeout(asked.late);
      asked.resolve(null);
    }
    waiting.clear();
  };
  pictureWorker = worker;
  return worker;
}

/**
 * A DDS or PVR picture of a usable import, decoded away from the page (pictureWorker.ts) with no side over `maxSize`
 * pixels: a bitmap for the board or a PNG for the screens. Null when it cannot be read.
 */
export function importedPicture(path: string, maxSize: number, want: 'bitmap'): Promise<ImageBitmap | null>;
export function importedPicture(path: string, maxSize: number, want: 'png'): Promise<Blob | null>;
export function importedPicture(path: string, maxSize: number, want: 'bitmap' | 'png'): Promise<ImageBitmap | Blob | null> {
  const stored = storedPath(path);
  if (stored === null) return Promise.resolve(null);
  const worker = decoder();
  const id = nextPicture++;
  return new Promise((resolve) => {
    const late = setTimeout(() => console.warn(`Picture still not decoded after 15 s: ${path}`), 15_000);
    waiting.set(id, { path, since: performance.now(), late, resolve });
    const request: PictureRequest = { id, path: stored, maxSize, want };
    worker.postMessage(request);
  });
}

/** An import that could not be made, and what the import worker said. */
export interface ImportFailure {
  problem: ImportProblem;
  detail: string;
}

/**
 * Copies the import folder the player gave into the browser and starts using it; null when it worked. `progress` hears
 * how many files are copied.
 */
export async function importOfficialContent(request: ImportRequest, progress: (done: number, total: number) => void): Promise<ImportFailure | null> {
  // Ask the browser not to clear it when space runs short
  await navigator.storage.persist?.().catch(() => false);
  const worker = new Worker(new URL('./importWorker.ts', import.meta.url), { type: 'module' });
  const reply = await new Promise<ImportReply>((resolve) => {
    worker.onmessage = (event: MessageEvent<ImportReply>) => {
      if (event.data.kind === 'progress') progress(event.data.done, event.data.total);
      else resolve(event.data);
    };
    worker.onerror = (event) => resolve({ kind: 'problem', problem: 'failed', detail: event.message });
    worker.postMessage(request);
  });
  worker.terminate();
  await loadImport(request.game);
  importsChanged();
  return reply.kind === 'problem' ? { problem: reply.problem, detail: reply.detail } : null;
}
