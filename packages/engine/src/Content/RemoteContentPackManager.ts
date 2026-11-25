// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/RemoteContentPackManager.cs
// Valkyrie keeps sorted lists of packs and their GetList, but their sorting is commented out, so they stay empty: they
// are left out.
import { Game } from '../Game.ts';
import { HTTPManager } from '../HTTPManager.ts';
import { dictAdd, dictGet } from '../platform/CSharp.ts';
import { File } from '../platform/SystemIO.ts';
import { IniRead } from '../ValkyrieTools/IniRead.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { ValkyrieConstants } from '../ValkyrieConstants.ts';
import { ContentData } from './ContentData.ts';
import { ExtractManager } from './ExtractManager.ts';
import { ManifestManager } from './ManifestManager.ts';
import { RemoteContentPack } from './RemoteContentPack.ts';

// Valkyrie: RemoteContentPackManager.cs RemoteContentPackManager.RemoteContentPackListMode
export const RemoteContentPackListMode = {
  ONLINE: 0,
  LOCAL: 1,
  DOWNLOADING: 2,
  ERROR_DOWNLOAD: 3,
} as const;
export type RemoteContentPackListMode = number;

// Valkyrie: RemoteContentPackManager.cs RemoteContentPackManager
export class RemoteContentPackManager {
  static readonly RemoteContentPackListMode = RemoteContentPackListMode;

  // Ini content for all remote content packs
  //   key : content pack id
  //   value : RemoteContentPack object
  remote_RemoteContentPack_data: Map<string, RemoteContentPack> | null = null;

  // Ini content for all local content packs (Valkyrie never fills it)
  local_RemoteContentPack_data: Map<string, RemoteContentPack> | null = null;

  // status of download of quest list
  error_download = false;
  error_download_description = '';

  // Callback when download is done
  private cb_download: ((available: boolean) => void) | null = null;

  // Current mode to get quest list
  // Default is local, it changes when file has been downloaded
  // It can also be set by user
  content_pack_list_Mode: RemoteContentPackListMode = RemoteContentPackListMode.LOCAL;
  private force_local_RemoteContentPack = false;

  // Valkyrie: RemoteContentPackManager.cs RemoteContentPackManager.GetCustomCategory
  static getCustomCategory(): string {
    return Game.get().gameType.typeName() + ValkyrieConstants.customCategoryName;
  }

  // Valkyrie: RemoteContentPackManager.cs RemoteContentPackManager.RemoteContentPackManager
  constructor() {
    this.remote_RemoteContentPack_data = new Map();

    const game = Game.get();

    // -- Download remote content pack list INI file --
    if (game.gameType.typeName() === ValkyrieConstants.typeMom) {
      HTTPManager.get(
        'https://raw.githubusercontent.com/NPBruce/valkyrie-store/refs/heads/master/MoM/contentPacksManifestDownload.ini',
        (data, error, uri) => this.remoteContentPackDownload_callback(data, error, uri),
      );
      this.content_pack_list_Mode = RemoteContentPackListMode.DOWNLOADING;
    } else if (game.gameType.typeName() === ValkyrieConstants.typeDescent) {
      HTTPManager.get(
        'https://raw.githubusercontent.com/NPBruce/valkyrie-store/refs/heads/master/D2E/contentPacksManifestDownload.ini',
        (data, error, uri) => this.remoteContentPackDownload_callback(data, error, uri),
      );
      this.content_pack_list_Mode = RemoteContentPackListMode.DOWNLOADING;
    } else {
      ValkyrieDebug.log('ERROR: DownloadQuests is called when no game type has been selected');
      return;
    }
  }

  // Valkyrie: RemoteContentPackManager.cs RemoteContentPackManager.Register_cb_download
  register_cb_download(cb_download_p: (available: boolean) => void): void {
    this.cb_download = cb_download_p;
  }

  // This is called by a user action
  // Valkyrie: RemoteContentPackManager.cs RemoteContentPackManager.SetMode
  setMode(qlm: RemoteContentPackListMode): void {
    this.content_pack_list_Mode = qlm;

    if (qlm === RemoteContentPackListMode.ONLINE) {
      this.force_local_RemoteContentPack = false;
    } else {
      this.force_local_RemoteContentPack = true;
    }
  }

  // Valkyrie: RemoteContentPackManager.cs RemoteContentPackManager.RemoteContentPackDownload_callback
  private remoteContentPackDownload_callback(data: string, error: boolean, _uri: string): void {
    if (error) {
      this.error_download = true;
      this.error_download_description = data;
      // Callback to display screen
      if (this.cb_download !== null) this.cb_download(false);

      this.content_pack_list_Mode = RemoteContentPackListMode.ERROR_DOWNLOAD;

      return;
    }

    if (!this.force_local_RemoteContentPack) this.content_pack_list_Mode = RemoteContentPackListMode.ONLINE;

    // Not in Valkyrie (16 October 2026): a list that cannot be read ends as a download error, so the local packs show
    try {
      // Parse ini
      const remoteManifest = IniRead.readFromString(data)!;
      for (const [key, value] of remoteManifest.data) {
        // Not in Valkyrie (16 October 2026): an entry that throws is logged and left out of the list
        try {
          const remoteContentPack = new RemoteContentPack(key, value);
          dictAdd(this.remote_RemoteContentPack_data!, remoteContentPack.identifier, remoteContentPack);
        } catch (e) {
          ValkyrieDebug.log('Warning: Skipping content pack of the store list: ' + key + '\nException: ' + String(e));
        }
      }

      if (this.remote_RemoteContentPack_data!.size > 0) this.checkLocalAvailability();
    } catch (e) {
      ValkyrieDebug.log('ERROR: Unable to read the content pack list\nException: ' + String(e));
      this.remote_RemoteContentPack_data = new Map();
      this.remoteContentPackDownload_callback('ERROR: Unable to read the content pack list: ' + String(e), true, _uri);
      return;
    }

    if (this.remote_RemoteContentPack_data!.size === 0) {
      ValkyrieDebug.log('ERROR: RemoteContentPack list is empty\n');
      this.error_download = true;
      this.error_download_description = 'ERROR: Quest list is empty';
      if (this.cb_download !== null) this.cb_download(false);
      return;
    }

    if (this.cb_download !== null) this.cb_download(true);
  }

  // Valkyrie: RemoteContentPackManager.cs RemoteContentPackManager.CheckLocalAvailability
  private checkLocalAvailability(): void {
    const manager = new ManifestManager(ContentData.customContentPackPath());
    const localManifest = manager.getLocalContentPackManifestIniData();

    if (localManifest === null) return;

    // Update download status for each RemoteContentPackData and check if update is available
    for (const [key, pack] of this.remote_RemoteContentPack_data!) {
      if (localManifest.data.has(key)) {
        pack.downloaded = true;
        // Not in Valkyrie (16 October 2026): an entry without version offers the update instead of throwing
        pack.update_available = localManifest.data.get(key)!.get('version') !== pack.version;
      }
    }
  }

  // Valkyrie: RemoteContentPackManager.cs RemoteContentPackManager.SetContentPackAvailability
  setContentPackAvailability(key: string, isAvailable: boolean): void {
    const saveLocation = ContentData.customContentPackPath();

    const manager = new ManifestManager(saveLocation);
    const localManifest = manager.getLocalContentPackManifestIniData();

    if (isAvailable) {
      if (dictGet(this.remote_RemoteContentPack_data!, key) === null) {
        throw new Error(`ArgumentNullException: Could not find key ${key} in remote content pack data.`);
      }

      const remoteContentPackString = dictGet(this.remote_RemoteContentPack_data!, key).toString();
      const downloaded_RemoteContentPack = IniRead.readFromString(remoteContentPackString)!;
      localManifest.remove(key);
      localManifest.add(key, dictGet(downloaded_RemoteContentPack.data, ValkyrieConstants.RemoteContentPackIniType));
    } else {
      if (localManifest.get(key) !== null) localManifest.remove(key);
      // we need to delete /temp and reload list
      this.unloadLocalRemoteContentPacks();
    }

    if (File.exists(saveLocation + ValkyrieConstants.ContentPackManifestPath)) {
      File.delete(saveLocation + ValkyrieConstants.ContentPackManifestPath);
    }
    File.writeAllText(saveLocation + ValkyrieConstants.ContentPackManifestPath, localManifest.toString());

    // update status quest
    dictGet(this.remote_RemoteContentPack_data!, key).downloaded = isAvailable;
    dictGet(this.remote_RemoteContentPack_data!, key).update_available = false;
  }

  // Valkyrie: RemoteContentPackManager.cs RemoteContentPackManager.GetContentPackData
  getContentPackData(key: string): RemoteContentPack {
    if (this.content_pack_list_Mode === RemoteContentPackListMode.ONLINE && !this.force_local_RemoteContentPack) {
      return dictGet(this.remote_RemoteContentPack_data!, key);
    } else {
      return dictGet(this.local_RemoteContentPack_data!, key);
    }
  }

  // Valkyrie: RemoteContentPackManager.cs RemoteContentPackManager.UnloadLocalRemoteContentPacks
  unloadLocalRemoteContentPacks(): void {
    if (this.local_RemoteContentPack_data !== null) {
      // Clean up temporary files
      ExtractManager.cleanTemp();
      this.local_RemoteContentPack_data = null;
    }
  }
}
