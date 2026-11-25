// Makes and restores the backup of what the app keeps (backup.ts): the kept folder of the origin private file system
// (Valkyrie's user folder: config.ini, the collection, the downloaded scenarios and packs, the saves) to one zip, and
// a zip back to it. A worker, because only workers can write there with createSyncAccessHandle, and so that a big copy
// does not stop the page. Not ported from Valkyrie.
import { Zip, ZipDeflate, ZipPassThrough } from 'fflate';
import { ZipFormatError } from '@universalis/engine';
import { zipFiles, type SourceFile } from './importSource.ts';
import { BACKUP_FILE, BACKUP_FOLDER, KEPT_FOLDER, RESTORE_FOLDER, openForWriting, opfsFiles, opfsFolder, removeOpfsEntry } from './opfs.ts';

export type BackupRequest = { op: 'make' } | { op: 'restore'; zip: File } | { op: 'finish' };

/** Why a backup could not be made or put back; 'unfinished': it is copied, and takes its place when the app starts again. */
export type BackupProblem = 'not-a-backup' | 'no-space' | 'unreadable' | 'failed' | 'unfinished';

export type BackupReply =
  | { kind: 'progress'; done: number; total: number }
  | { kind: 'made'; bytes: number }
  | { kind: 'restored'; files: number }
  | { kind: 'problem'; problem: BackupProblem; detail: string };

/** The first entry of a backup, which says what it is. */
const INFO = 'universalis-backup.json';
const APP = 'Valkyrie Universalis';
/** Written in RESTORE_FOLDER once a backup is copied there whole: from then on it takes the kept folder's place. */
const COMPLETE = 'complete';
/** Written in RESTORE_FOLDER once the kept folder is gone: its files are moving in, and a stop goes on from there. */
const MOVING = 'moving';
/** One window at a time makes, puts back or finishes a backup, and a window starting waits for it (finish). */
const LOCK = 'universalis-backup';

interface BackupInfo {
  app: string;
  version: string;
  made: string;
  files: number;
}

/** A file whose bytes do not add up: a damaged zip. */
class DamagedFile extends Error {}

const scope = self as unknown as { onmessage: ((event: MessageEvent<BackupRequest>) => void) | null; postMessage(reply: BackupReply): void };

/** Runs the task while no other window runs one (Web Locks; without them, at once). */
function exclusive(task: () => Promise<BackupReply>): Promise<BackupReply> {
  const locks = (navigator as { locks?: LockManager }).locks;
  return locks === undefined ? task() : locks.request(LOCK, task);
}

scope.onmessage = (event) => {
  const request = event.data;
  exclusive(() => (request.op === 'make' ? make() : request.op === 'restore' ? restore(request.zip) : finish())).then(
    (reply) => scope.postMessage(reply),
    (e: unknown) => {
      const problem = e instanceof ZipFormatError || e instanceof DamagedFile ? 'unreadable' : 'failed';
      scope.postMessage({ kind: 'problem', problem, detail: e instanceof Error ? e.message : String(e) });
    },
  );
};

let shown = 0;
function progress(done: number, total: number): void {
  if (Date.now() - shown < 150 && done < total) return;
  shown = Date.now();
  scope.postMessage({ kind: 'progress', done, total });
}

/** The kept folder as one zip, in BACKUP_FOLDER: texts deflated, the rest (zips already) stored. */
async function make(): Promise<BackupReply> {
  const files = await opfsFiles([KEPT_FOLDER]);
  await removeOpfsEntry([BACKUP_FOLDER], true);
  const handle = await openForWriting([BACKUP_FOLDER, BACKUP_FILE]);
  let at = 0;
  let failure: unknown = null;
  // The zip hands its chunks over as it makes them: each is written after the one before
  let written = Promise.resolve();
  try {
    const zip = new Zip((error, chunk) => {
      if (error !== null) {
        failure = error;
        return;
      }
      const position = at;
      at += chunk.length;
      written = written.then(() => handle.write(chunk, position)).catch((e: unknown) => void (failure ??= e));
    });
    const info: BackupInfo = { app: APP, version: __APP_VERSION__, made: new Date().toISOString(), files: files.length };
    const head = new ZipDeflate(INFO, { level: 6 });
    zip.add(head);
    head.push(new TextEncoder().encode(JSON.stringify(info, null, 2)), true);
    for (const [i, { path, file }] of files.entries()) {
      const name = path.join('/');
      const entry = /\.(ini|txt|json)$/i.test(name) ? new ZipDeflate(name, { level: 6 }) : new ZipPassThrough(name);
      zip.add(entry);
      const reader = (await file.getFile()).stream().getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        entry.push(value);
        // Not more than one piece of a file waiting to be written at a time
        await written;
        if (failure !== null) throw failure;
      }
      entry.push(new Uint8Array(0), true);
      progress(i + 1, files.length);
    }
    zip.end();
    await written;
    if (failure !== null) throw failure;
  } finally {
    await written;
    await handle.close();
  }
  return { kind: 'made', bytes: at };
}

/**
 * Puts a backup back: it is copied whole into RESTORE_FOLDER first, so that a damaged one leaves the kept folder as it
 * was, and then takes its place (finish).
 */
async function restore(zip: File): Promise<BackupReply> {
  // One put back before and not finished takes its place first, rather than being lost
  if ((await markers()).has(COMPLETE)) await finish();
  const sources = await zipFiles(zip);
  const head = sources.find((source) => source.name === INFO);
  const files = sources.filter((source) => source !== head);
  if (head === undefined || files.some((source) => !source.name.startsWith('AppData/') || source.name.split('/').includes('..'))) {
    return { kind: 'problem', problem: 'not-a-backup', detail: '' };
  }
  const info = JSON.parse(await new Response(await head.stream()).text()) as Partial<BackupInfo>;
  if (info.app !== APP) return { kind: 'problem', problem: 'not-a-backup', detail: '' };

  // Room for it next to the kept folder, which goes only once the backup is copied (Safari before 17 cannot say)
  const total = files.reduce((n, f) => n + f.size, 0);
  const estimate = await navigator.storage.estimate?.();
  if (estimate?.quota !== undefined && estimate.usage !== undefined && estimate.quota - estimate.usage < total) {
    return { kind: 'problem', problem: 'no-space', detail: `${megabytes(total)}|${megabytes(estimate.quota - estimate.usage)}` };
  }

  await removeOpfsEntry([RESTORE_FOLDER], true);
  for (const [i, source] of files.entries()) {
    await copy(source, [RESTORE_FOLDER, KEPT_FOLDER, ...source.name.split('/')]);
    progress(i + 1, files.length * 2);
  }
  await mark(COMPLETE);
  try {
    return await finish();
  } catch {
    return { kind: 'problem', problem: 'unfinished', detail: '' };
  }
}

/** The markers in RESTORE_FOLDER. */
async function markers(): Promise<Set<string>> {
  return new Set((await opfsFiles([RESTORE_FOLDER])).filter(({ path }) => path.length === 1).map(({ path }) => path[0]!));
}

async function mark(name: string): Promise<void> {
  const handle = await openForWriting([RESTORE_FOLDER, name]);
  await handle.close();
}

/**
 * A backup copied whole takes the kept folder's place, its files moved in; one cut short while being copied goes. Also
 * when the app starts, so that a stop at any point goes on from where it was.
 */
async function finish(): Promise<BackupReply> {
  const done = await markers();
  if (!done.has(COMPLETE)) {
    await removeOpfsEntry([RESTORE_FOLDER], true);
    return { kind: 'restored', files: 0 };
  }
  if (!done.has(MOVING)) {
    await removeOpfsEntry([KEPT_FOLDER], true);
    await mark(MOVING);
  }
  const staged = await opfsFiles([RESTORE_FOLDER, KEPT_FOLDER]);
  for (const [i, { path, file }] of staged.entries()) {
    await move(file, [RESTORE_FOLDER, KEPT_FOLDER, ...path], [KEPT_FOLDER, ...path]);
    progress(staged.length + i + 1, staged.length * 2);
  }
  await removeOpfsEntry([RESTORE_FOLDER], true);
  return { kind: 'restored', files: staged.length };
}

/** Moves a file within the origin private file system; where the browser cannot (move() is newer), copies it and removes it. */
async function move(file: FileSystemFileHandle, from: string[], to: string[]): Promise<void> {
  await removeOpfsEntry(to, false);
  const moveTo = (file as unknown as { move?: (folder: FileSystemDirectoryHandle, name: string) => Promise<void> }).move;
  if (typeof moveTo === 'function') {
    try {
      await moveTo.call(file, (await opfsFolder(to.slice(0, -1), true))!, to.at(-1)!);
      return;
    } catch {
      // Copied instead
    }
  }
  const contents = await file.getFile();
  await copy({ name: to.join('/'), size: contents.size, stream: async () => contents.stream() }, to);
  await removeOpfsEntry(from, false);
}

/** Writes one file as it comes. */
async function copy(source: SourceFile, target: string[]): Promise<void> {
  let at = 0;
  const handle = await openForWriting(target);
  try {
    const reader = (await source.stream()).getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      await handle.write(value, at);
      at += value.length;
    }
  } finally {
    await handle.close();
  }
  if (at !== source.size) throw new DamagedFile(`${source.name}: ${at} bytes instead of ${source.size}`);
}

function megabytes(bytes: number): string {
  return String(Math.ceil(bytes / 1048576));
}
