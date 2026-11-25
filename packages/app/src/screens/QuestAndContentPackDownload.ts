// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/QuestAndContentPackDownload.cs
// The app's part: the Download coroutine, which downloads the package while its LoadingScreen shows the progress, then
// calls Save. What to download and what Save does are the engine's (QuestAndContentPackDownload).
import { Destroyer, QuestAndContentPackDownload, ValkyrieDebug } from '@universalis/engine';
import { downloadBytes } from '../host/network.ts';
import { endsAsZip } from '../host/zipSignature.ts';
import { run } from '../ui/run.ts';
import { update } from '../ui/store.ts';
import { uni, val } from '../ui/text.ts';
import { loadingProgress, openLoadingScreen } from './LoadingScreen.tsx';

/** What Selection and ContentSelectDownloadScreen.Download start: a downloader with its key, which Unity then starts. */
export function downloadPackage(key: string, isContentPack: boolean): void {
  const qd = new QuestAndContentPackDownload();
  qd.download(key, isContentPack);
  const file = qd.start();
  if (file === null) return;
  void download(qd, key, isContentPack, file);
}

/** Download and call Save on completion. */
// Valkyrie: QuestAndContentPackDownload.cs QuestAndContentPackDownload.Download(string, UnityAction)
async function download(qd: QuestAndContentPackDownload, key: string, isContentPack: boolean, file: string): Promise<void> {
  const cancel = openLoadingScreen(val('DOWNLOAD_PACKAGE'));
  const data = await downloadPackageBytes(file, cancel);
  if (cancel.aborted) {
    // Not in Valkyrie: the player cancelled; back to the list
    run(() => {
      Destroyer.dialog();
      update();
    });
    return;
  }
  if (data === null) {
    // fixme not fatal
    ValkyrieDebug.log('Error while downloading :' + file);
  }

  run(() => {
    qd.save(key, isContentPack, data);
    if (data === null || data.length === 0) {
      // Not in Valkyrie, whose loading screen stays up: back to the list, with a message
      Destroyer.dialog();
      update({ notice: uni('DOWNLOAD_FAILED', key) });
    }
  });
}

/**
 * Not in Valkyrie: downloads every scenario of the list that has a newer version, one after another, each as Selection
 * downloads one, with the loading screen saying which (Valkyrie issues 1448 and 1151). The list stays where it was.
 */
export async function updateAll(keys: readonly string[]): Promise<void> {
  const failed: string[] = [];
  for (const [i, key] of keys.entries()) {
    const qd = new QuestAndContentPackDownload();
    qd.download(key, false);
    const file = qd.start();
    if (file === null) continue;
    const cancel = openLoadingScreen(uni('UPDATING_ALL', i + 1, keys.length, key));
    const data = await downloadPackageBytes(file, cancel);
    // Not in Valkyrie: the player cancelled; what is left is not downloaded
    if (cancel.aborted) break;
    if (data === null || data.length === 0) failed.push(key);
    run(() => qd.save(key, false, data));
  }
  run(() => {
    Destroyer.dialog();
    if (failed.length > 0) update({ notice: uni('DOWNLOAD_FAILED', failed.join(', ')) });
    else update();
  });
}

/** Not in Valkyrie: the package's bytes, or null when the download failed or what came is not a whole zip. */
async function downloadPackageBytes(file: string, cancel: AbortSignal): Promise<Uint8Array | null> {
  const data = await downloadBytes(file, loadingProgress, cancel);
  if (data === null || data.length === 0 || endsAsZip(data)) return data;
  ValkyrieDebug.log('Downloaded file is not a zip: ' + file);
  return null;
}
