// Copies Valkyrie's import folder, as the player gives it (importSource.ts), into the origin private file system: every
// file as it is under import/<game>/, then import/<game>.json with what the app keeps of each. The old import goes
// first, as ImportManager deletes it before copying. A worker, so that a big import does not stop the page.
// Not ported from Valkyrie.
import { ZipFormatError } from '@universalis/engine';
import {
  IMPORT_FOLDER,
  folderFiles,
  hasRawAssets,
  headSize,
  importRoot,
  isMacMetadata,
  toBase64,
  zipFiles,
  type ImportIndex,
  type ImportReply,
  type ImportRequest,
  type ImportedFile,
  type SourceFile,
} from './importSource.ts';
import { isNoRoom, openForWriting, opfsSize, readOpfsFile, removeOpfsEntry, type WriteWay } from './opfs.ts';

/** A file whose bytes do not add up: a damaged zip. */
class DamagedFile extends Error {}

const scope = self as unknown as { onmessage: ((event: MessageEvent<ImportRequest>) => void) | null; postMessage(reply: ImportReply): void };

scope.onmessage = (event) => {
  run(event.data).then(
    (reply) => scope.postMessage(reply),
    (e: unknown) => {
      const problem = e instanceof ZipFormatError || e instanceof DamagedFile ? 'unreadable' : 'failed';
      scope.postMessage({ kind: 'problem', problem, detail: e instanceof Error ? e.message : String(e) });
    },
  );
};

async function run(request: ImportRequest): Promise<ImportReply> {
  const { game } = request;
  const sources = ('zip' in request ? await zipFiles(request.zip) : folderFiles(request.folder)).filter((s) => !isMacMetadata(s.name));
  const names = sources.map((s) => s.name);
  if (hasRawAssets(names)) return { kind: 'problem', problem: 'raw-assets', detail: '' };
  const root = importRoot(names, game);
  if (root === null) return { kind: 'problem', problem: 'no-import-ini', detail: '' };
  const files = sources
    .filter((s) => s.name.length > root.length && s.name.slice(0, root.length).toLowerCase() === root.toLowerCase())
    .map((source) => ({ source, path: source.name.slice(root.length) }));

  // Room for it, counting what the old import frees
  const total = files.reduce((n, f) => n + f.source.size, 0);
  // Not by the old import's index: an import cut short (no room, the page closed) left its files without one
  const old = await readOpfsFile([IMPORT_FOLDER, `${game}.json`]);
  const freed = (await opfsSize([IMPORT_FOLDER, game])) + (old?.length ?? 0);
  // Safari before 17 cannot say how much room there is
  const { quota, usage } = (await navigator.storage.estimate?.()) ?? {};
  if (quota !== undefined && usage !== undefined && quota - usage + freed < total) {
    return { kind: 'problem', problem: 'no-space', detail: `${megabytes(total)}|${megabytes(quota - usage + freed)}` };
  }

  // Without its index first, so that an import cut short is not taken for one
  await removeOpfsEntry([IMPORT_FOLDER, `${game}.json`], false);
  await removeOpfsEntry([IMPORT_FOLDER, game], true);
  const index: ImportIndex = { version: 1, files: [] };
  let shown = 0;
  let way: WriteWay = 'any';
  for (const [i, { source, path }] of files.entries()) {
    const target = [IMPORT_FOLDER, game, ...path.split('/')];
    let file: ImportedFile;
    try {
      file = await copy(source, target, path, way);
    } catch (e) {
      if (!isNoRoom(e)) throw e;
      if (way === 'writable') return noRoom(game, total);
      // A sync access handle may find no room where the browser has it (isNoRoom): the rest, with createWritable
      way = 'writable';
      console.warn(`No room writing ${path} with a sync access handle, trying with createWritable: ${String(e)}`);
      try {
        file = await copy(source, target, path, way);
      } catch (again) {
        if (!isNoRoom(again)) throw again;
        return noRoom(game, total);
      }
    }
    index.files.push(file);
    if (Date.now() - shown > 150) {
      shown = Date.now();
      scope.postMessage({ kind: 'progress', done: i + 1, total: files.length });
    }
  }
  const handle = await openForWriting([IMPORT_FOLDER, `${game}.json`]);
  try {
    await handle.write(new TextEncoder().encode(JSON.stringify(index)), 0);
  } finally {
    await handle.close();
  }
  return { kind: 'done', files: files.length, bytes: total };
}

/**
 * The import ran out of room halfway: what it copied goes, so that it takes no room the player needs to try again, and
 * the player hears how much it needs and how much the browser says is free, as when there is no room from the start.
 */
async function noRoom(game: string, total: number): Promise<ImportReply> {
  await removeOpfsEntry([IMPORT_FOLDER, game], true).catch(() => undefined);
  const { quota, usage } = (await navigator.storage.estimate?.().catch(() => undefined)) ?? {};
  const free = quota !== undefined && usage !== undefined ? megabytes(Math.max(0, quota - usage)) : '?';
  return { kind: 'problem', problem: 'no-space', detail: `${megabytes(total)}|${free}` };
}

/** Writes one file as it comes, keeping the head of pictures. */
async function copy(source: SourceFile, target: string[], path: string, how: WriteWay): Promise<ImportedFile> {
  const want = headSize(path);
  const head = new Uint8Array(want);
  let headLength = 0;
  let at = 0;
  const handle = await openForWriting(target, how);
  try {
    const reader = (await source.stream()).getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      await handle.write(value, at);
      if (headLength < want) {
        const n = Math.min(want - headLength, value.length);
        head.set(value.subarray(0, n), headLength);
        headLength += n;
      }
      at += value.length;
    }
  } finally {
    await handle.close();
  }
  if (at !== source.size) throw new DamagedFile(`${path}: ${at} bytes instead of ${source.size}`);
  return want > 0 ? { path, size: at, head: toBase64(head.subarray(0, headLength)) } : { path, size: at };
}

function megabytes(bytes: number): string {
  return String(Math.ceil(bytes / 1048576));
}
