// Valkyrie's import folder as the player hands it to the app: the folder itself, chosen in the browser, or a zip of it.
// A zip is never loaded whole: its central directory is read from the end, then each entry is streamed. Also what the
// app keeps of each file to answer the engine at once. Not ported from Valkyrie, whose ZIP import extracts everything
// to a temporary folder (ImportManager.ImportZipFromPath).
import { Inflate } from 'fflate';
import { ZipFormatError, locateZipDirectory, readCentralDirectory, readZip64Record, type ZipEntry } from '@universalis/engine';

/**
 * A stream that inflates a zip entry: the browser's own where it reads raw deflate (Chrome 103 and later), fflate's
 * otherwise (19 October 2026: an old tablet's Chrome 101 could not import).
 */
function rawInflater(): TransformStream<Uint8Array, Uint8Array> {
  try {
    return new DecompressionStream('deflate-raw') as unknown as TransformStream<Uint8Array, Uint8Array>;
  } catch {
    let inflate: Inflate;
    return new TransformStream<Uint8Array, Uint8Array>({
      start(controller) {
        inflate = new Inflate((chunk) => controller.enqueue(chunk));
      },
      transform(chunk) {
        inflate.push(chunk);
      },
      flush() {
        inflate.push(new Uint8Array(0), true);
      },
    });
  }
}

/** A file as the player gave it. */
export interface SourceFile {
  /** Where it is in what the player gave, with '/': 'import/img/MAD21.dds'. */
  name: string;
  size: number;
  stream(): Promise<ReadableStream<Uint8Array>>;
}

/** The files of a folder the player chose (an input with webkitdirectory names them from the chosen folder). */
export function folderFiles(files: readonly File[]): SourceFile[] {
  return files.map((file) => {
    // The DOM's File has webkitRelativePath; Node's, where this is tested, does not
    const relative = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
    return { name: (relative || file.name).replace(/\\/g, '/'), size: file.size, stream: async () => file.stream() };
  });
}

/** The files of a zip, from its central directory. */
export async function zipFiles(zip: Blob): Promise<SourceFile[]> {
  const tail = new Uint8Array(await zip.slice(Math.max(0, zip.size - 22 - 0xffff)).arrayBuffer());
  let location = locateZipDirectory(tail);
  if (location.zip64Record !== null) {
    location = readZip64Record(new Uint8Array(await zip.slice(location.zip64Record, location.zip64Record + 56).arrayBuffer()));
  }
  const directory = new Uint8Array(await zip.slice(location.offset, location.offset + location.size).arrayBuffer());
  return readCentralDirectory(directory, location.count)
    .filter((entry) => !entry.isDirectory)
    .map((entry) => ({ name: entry.name, size: entry.size, stream: () => entryStream(zip, entry) }));
}

async function entryStream(zip: Blob, entry: ZipEntry): Promise<ReadableStream<Uint8Array>> {
  if (entry.encrypted) throw new ZipFormatError(`Encrypted zip entry: ${entry.name}`);
  const header = new DataView(await zip.slice(entry.localHeaderOffset, entry.localHeaderOffset + 30).arrayBuffer());
  if (header.byteLength < 30 || header.getUint32(0, true) !== 0x04034b50) throw new ZipFormatError(`Bad local header: ${entry.name}`);
  const start = entry.localHeaderOffset + 30 + header.getUint16(26, true) + header.getUint16(28, true);
  const data = zip.slice(start, start + entry.compressedSize).stream();
  if (entry.method === 0) return data;
  if (entry.method === 8) return data.pipeThrough(rawInflater());
  throw new ZipFormatError(`Unsupported compression method ${entry.method}: ${entry.name}`);
}

/**
 * The folder, in what the player gave, that holds the import: the one with import.ini. ImportManager wants it at the top
 * of the zip; the app also takes it one level down (a zip or a choice of the import folder itself) or in the game's
 * folder (a choice of Valkyrie's user folder). Null when there is none.
 */
export function importRoot(names: readonly string[], game: string): string | null {
  const roots = names.filter((name) => /(^|\/)import\.ini$/i.test(name)).map((name) => name.slice(0, -'import.ini'.length));
  const depth = (root: string) => root.split('/').length - 1;
  const shallow = roots.filter((root) => depth(root) <= 1).sort((a, b) => depth(a) - depth(b));
  if (shallow.length > 0) return shallow[0]!;
  const ofGame = roots.filter((root) => root.toLowerCase().endsWith(`${game.toLowerCase()}/import/`)).sort((a, b) => depth(a) - depth(b));
  return ofGame[0] ?? null;
}

/**
 * What a Mac adds to a zip or a folder (__MACOSX with an AppleDouble ._ copy of each file, .DS_Store): never part of an
 * import. Valkyrie extracts it and never reads it; the app does not copy it.
 */
export function isMacMetadata(name: string): boolean {
  return /(^|\/)__MACOSX\//.test(name) || /(^|\/)\._[^/]*$/.test(name) || /(^|\/)\.DS_Store$/.test(name);
}

/** The official app's own files, which Valkyrie imports from (resources.assets, Android's .obb), not its import folder. */
export function hasRawAssets(names: readonly string[]): boolean {
  return names.some((name) => /(^|\/)resources\.assets$/i.test(name) || /\.obb$/i.test(name));
}

/** What the app keeps of an imported file to answer the engine at once, in import/<game>.json. */
export interface ImportedFile {
  /** Its path in the import folder: 'img/MAD21.dds'. */
  path: string;
  size: number;
  /** For DDS and PVR pictures, their header in base64: where ContentData.FileToTexture reads their size and format. */
  head?: string;
}

/** How many bytes of each picture the engine reads: DdsToTexture's 128-byte header, PvrToTexture's 52. */
export function headSize(path: string): number {
  const extension = path.substring(path.lastIndexOf('.')).toLowerCase();
  return extension === '.dds' ? 128 : extension === '.pvr' ? 52 : 0;
}

export function toBase64(bytes: Uint8Array): string {
  let text = '';
  for (const b of bytes) text += String.fromCharCode(b);
  return btoa(text);
}

export function fromBase64(text: string): Uint8Array {
  const raw = atob(text);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/**
 * The import's texts the engine reads at once, kept in the virtual file system: import.ini (FetchContent.NeedImport) and
 * those GameSelectionScreen.loadLocalization lists. The other texts stay in storage, as Valkyrie never reads them.
 */
export function isReadAtOnce(path: string): boolean {
  if (path.toLowerCase() === 'import.ini') return true;
  const match = /^text\/([^/]+)$/i.exec(path);
  if (match === null) return false;
  const name = match[1]!;
  return (/^Localization_.*\.txt$/i.test(name) && !/\p{Nd}/u.test(name)) || /^SCENARIO_CULT_OF_SENTINEL_HILL_MAD22_.*\.txt$/i.test(name);
}

/** The origin private file system's folder for imports. */
export const IMPORT_FOLDER = 'import';

export type ImportGame = 'MoM' | 'D2E';
export type ImportRequest = { game: ImportGame; folder: File[] } | { game: ImportGame; zip: File };

/** Why an import could not be made: the import screen says it in the player's language. */
export type ImportProblem = 'no-import-ini' | 'raw-assets' | 'no-space' | 'unreadable' | 'failed';

export type ImportReply =
  | { kind: 'progress'; done: number; total: number }
  | { kind: 'done'; files: number; bytes: number }
  | { kind: 'problem'; problem: ImportProblem; detail: string };

/** import/<game>.json */
export interface ImportIndex {
  version: 1;
  files: ImportedFile[];
}
