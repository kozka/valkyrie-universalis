// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/QuestAndContentPackDownload.cs
// Partial: what Start downloads and what Save does with it. The download itself and its LoadingScreen (the Download
// coroutine) are the host's: it asks start() for the address, downloads it and hands the bytes to save().
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { File, Path } from '../platform/SystemIO.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { ValkyrieConstants } from '../ValkyrieConstants.ts';
import { ContentData } from './ContentData.ts';
import { ContentLoader } from './ContentLoader.ts';
import { ExtractManager } from './ExtractManager.ts';

// Valkyrie: QuestAndContentPackDownload.cs QuestAndContentPackDownload
export class QuestAndContentPackDownload {
  game: Game | null = null;
  private key = '';
  private isContentPack = false;

  /** Unity's Start: the address of the package to download, or null when there is none. */
  // Valkyrie: QuestAndContentPackDownload.cs QuestAndContentPackDownload.Start
  start(): string | null {
    this.game = Game.get();

    if (this.key === '') {
      ValkyrieDebug.log('Download key is not set, this should not happen');
      return null;
    }

    if (this.isContentPack) {
      const q = [...this.game.remoteContentPackManager.remote_RemoteContentPack_data!.values()].find((p) => p.identifier === this.key);
      if (q === undefined) {
        ValkyrieDebug.log(`Could not find package ${this.key} locally.`);
        return null;
      }

      return q.package_url + this.key + ValkyrieConstants.ContentPackDownloadContainerExtension;
    } else {
      const q = this.game.questsList.getQuestData(this.key);

      return q.package_url + this.key + ValkyrieConstants.ScenarioDownloadContainerExtension;
    }
  }

  /** Set download key so it's available when start is called (after following Unity cycle) */
  // Valkyrie: QuestAndContentPackDownload.cs QuestAndContentPackDownload.Download(string, bool)
  download(p_key: string, p_isContainer: boolean): void {
    this.key = p_key;
    this.isContentPack = p_isContainer;
  }

  /** Called after download finished to save to disk; data is null when the download failed. */
  // Valkyrie: QuestAndContentPackDownload.cs QuestAndContentPackDownload.Save
  save(key: string, isContentPack: boolean, data: Uint8Array | null): void {
    // in case of error during download, do nothing
    if (data === null || data.length <= 0) return;

    const game = this.game!;

    // Write to disk
    const path = isContentPack ? ContentData.customContentPackPath() : ContentData.downloadPath();

    ExtractManager.mkDir(path);

    const filePath = isContentPack
      ? path + Path.DirectorySeparatorChar + key + ValkyrieConstants.ContentPackDownloadContainerExtension
      : path + Path.DirectorySeparatorChar + key + ValkyrieConstants.ScenarioDownloadContainerExtension;

    File.writeAllBytes(filePath, data);

    //TODO update local list of content packs and current status
    if (isContentPack) {
      game.remoteContentPackManager.setContentPackAvailability(key, true);
    } else {
      game.questsList.setQuestAvailability(key, true);
    }

    // cleanup screen and go back to parent screen
    Destroyer.dialog();
    if (isContentPack) {
      ContentLoader.addNewContentPack(game, filePath);
      game.ui.contentSelectDownloadScreen();
    } else {
      game.ui.updateQuestButton(key);
    }
  }
}
