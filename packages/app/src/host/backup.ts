// The backup of what the app keeps in this browser (Options): Valkyrie's user folder (config.ini, the collection, the
// downloaded scenarios and packs, the saves) as one zip to download, and such a zip put back in its place. The
// official import stays out: it is big, and each player imports it again. backupWorker.ts does the copying.
// Not ported from Valkyrie.
// The worker's types only: importing its values would run it in the page
import type { BackupReply, BackupRequest } from './backupWorker.ts';
import { BACKUP_FILE, BACKUP_FOLDER, RESTORE_FOLDER, opfsFolder, removeOpfsEntry } from './opfs.ts';
import { keptFolder } from './storage.ts';

function inWorker(request: BackupRequest, progress: (done: number, total: number) => void): Promise<BackupReply> {
  const worker = new Worker(new URL('./backupWorker.ts', import.meta.url), { type: 'module' });
  return new Promise<BackupReply>((resolve) => {
    worker.onmessage = (event: MessageEvent<BackupReply>) => {
      if (event.data.kind === 'progress') progress(event.data.done, event.data.total);
      else resolve(event.data);
    };
    worker.onerror = (event) => resolve({ kind: 'problem', problem: 'failed', detail: event.message });
    worker.postMessage(request);
  }).finally(() => worker.terminate());
}

/** Makes the backup and hands it to the browser to download, named after today's date. */
export async function downloadBackup(progress: (done: number, total: number) => void): Promise<BackupReply> {
  // Every change on disk first
  await keptFolder()?.whenIdle();
  const reply = await inWorker({ op: 'make' }, progress);
  if (reply.kind !== 'made') return reply;
  const folder = await opfsFolder([BACKUP_FOLDER], false);
  const file = await (await folder!.getFileHandle(BACKUP_FILE)).getFile();
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = `valkyrie-universalis-${new Date().toISOString().slice(0, 10)}.zip`;
  link.click();
  // The browser has the file by then; the copy in storage goes when the app starts again
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return reply;
}

/** Puts a backup in place of what the app keeps. The app must start again afterwards, to read it. */
export async function restoreBackup(zip: File, progress: (done: number, total: number) => void): Promise<BackupReply> {
  const folder = keptFolder();
  await folder?.whenIdle();
  // Nothing the app writes now may land in the folder being replaced
  folder?.stop();
  const reply = await inWorker({ op: 'restore', zip }, progress);
  // Left as it was: the app goes on keeping what it writes
  if (reply.kind === 'problem' && reply.problem !== 'unfinished') folder?.watch();
  return reply;
}

/**
 * When the app starts, before it reads what it keeps: a backup being put back takes its place, or goes if it was cut
 * short while being copied (the worker waits for another window putting one back), and one made to download goes once
 * it is old. Says what went wrong, if anything.
 */
export async function finishBackups(): Promise<string | null> {
  await removeOldDownload();
  if ((await opfsFolder([RESTORE_FOLDER], false)) === null) return null;
  const reply = await inWorker({ op: 'finish' }, () => {});
  return reply.kind === 'problem' ? reply.detail || reply.problem : null;
}

async function removeOldDownload(): Promise<void> {
  const folder = await opfsFolder([BACKUP_FOLDER], false);
  if (folder === null) return;
  try {
    // Another window may still be handing a recent one to the browser
    if (Date.now() - (await (await folder.getFileHandle(BACKUP_FILE)).getFile()).lastModified < 3_600_000) return;
  } catch {
    // Being made by another window
    return;
  }
  await removeOpfsEntry([BACKUP_FOLDER], true);
}
