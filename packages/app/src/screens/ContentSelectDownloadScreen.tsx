// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/UI/Screens/ContentSelectDownloadScreen.cs
// The community content packs of the store: download, update or delete them. Its logic follows Valkyrie; the drawing
// is the app's, with each cover from its pack's repository (ImgAsyncLoader is the browser's lazy <img>).
import { useEffect, useRef } from 'react';
import {
  ContentData,
  ContentLoader,
  Destroyer,
  File,
  Game,
  Path,
  RemoteContentPackListMode,
  ValkyrieConstants,
  ValkyrieDebug,
  isNullOrWhiteSpace,
  type RemoteContentPack,
} from '@universalis/engine';
import { Picture, RemotePicture } from '../ui/Picture.tsx';
import { run } from '../ui/run.ts';
import { show, update, useUI } from '../ui/store.ts';
import { uni, val } from '../ui/text.ts';
import { openContentSelect } from './ContentSelectScreen.tsx';
import { downloadPackage } from './QuestAndContentPackDownload.ts';
import { addContentPack, deletePackFromFile, packsFromFiles } from './addContentPack.ts';
import { ScenarioReport } from './QuestSelectionScreen.tsx';
import './ContentSelectScreen.css';
import './QuestSelectionScreen.css';
import { plainText, RichText } from '../ui/RichText.tsx';

// Create page
// Valkyrie: ContentSelectDownloadScreen.cs ContentSelectDownloadScreen.ContentSelectDownloadScreen
export function openContentSelectDownload(): void {
  const game = Game.get();
  // CleanUpDialogs: if a dialog window is open we force it closed (this shouldn't happen)
  game.ui.destroyTag(Game.DIALOG);
  game.ui.destroyTag(Game.CONTENTPACKLIST);

  // Clean everything up
  Destroyer.destroy();
  show({ name: 'content-download' });
}

// Valkyrie: ContentSelectDownloadScreen.cs ContentSelectDownloadScreen.Delete
function deletePack(key: string): void {
  if (isNullOrWhiteSpace(key)) {
    ValkyrieDebug.log('Could not delete content pack because of invalid key.');
    return;
  }

  const game = Game.get();
  try {
    const filePath = ContentData.customContentPackPath() + Path.DirectorySeparatorChar + key + ValkyrieConstants.ContentPackDownloadContainerExtension;
    if (File.exists(filePath)) {
      File.delete(filePath);
      game.remoteContentPackManager.setContentPackAvailability(key, false);
      ContentLoader.removeContentPack(game, key);
    } else {
      ValkyrieDebug.log('Could not find file: ' + key);
    }
  } catch {
    ValkyrieDebug.log('Failed to delete content pack: ' + key);
  }

  openContentSelectDownload();
}

// Valkyrie: ContentSelectDownloadScreen.cs ContentSelectDownloadScreen.Download
function download(key: string): void {
  Destroyer.dialog();

  // Download / Update
  ValkyrieDebug.log('INFO: ... and download quest');
  downloadPackage(key, true);
}

// Valkyrie: ContentSelectDownloadScreen.cs ContentSelectDownloadScreen.Quit
function quit(): void {
  ValkyrieDebug.log('INFO: Accessing content selection screen');
  openContentSelect();
}

// Valkyrie: ContentSelectDownloadScreen.cs ContentSelectDownloadScreen.DrawOnlineModeButton
function ConnectionStatus() {
  const mode = Game.get().remoteContentPackManager.content_pack_list_Mode;
  // error download (no connection, timeout, of file not available)
  if (mode === RemoteContentPackListMode.ERROR_DOWNLOAD) return <span className="connection error">{val('OFFLINE_DUE_TO_ERROR')}</span>;
  // Download ongoing
  if (mode === RemoteContentPackListMode.DOWNLOADING) return <span className="connection">{val('DOWNLOAD_ONGOING')}</span>;
  // Download done, we are online
  if (mode === RemoteContentPackListMode.ONLINE) return <span className="connection online">{val('ONLINE')}</span>;
  // Download done, user has switched offline modline
  return <span className="connection error">{val('OFFLINE')}</span>;
}

// Valkyrie: ContentSelectDownloadScreen.cs ContentSelectDownloadScreen.DrawContentPackList
function PackCard({ pack }: { pack: RemoteContentPack }) {
  const game = Game.get();
  const title = pack.getTitle(game.currentLang);
  const name = plainText(title);
  // RenderContentPackNameAndDescription
  let description = pack.getDescription(game.currentLang);
  if (plainText(description).length >= 400) description = plainText(description).substring(0, 395) + '(...)';
  // RenderImage
  const image = pack.image ?? '';
  return (
    <article className="pack-download card">
      <span className="photo">
        {image.length > 0 ? (
          <RemotePicture url={pack.package_url + image} name={name} decorative />
        ) : (
          <Picture file="" name={name} decorative />
        )}
      </span>
      <span className="pack-text">
        <h2 className="pack-name">
          <RichText text={title} />
        </h2>
        {description !== '' && (
          <span className="synopsys">
            <RichText text={description} links />
          </span>
        )}
      </span>
      <span className="pack-actions">
        {/* RenderActionButton: download, or update when the list has another version */}
        {(pack.update_available || !pack.downloaded) && (
          <button type="button" className="button primary" onClick={() => run(() => download(pack.identifier))}>
            {val(pack.downloaded ? 'UPDATE' : 'DOWNLOAD')}
          </button>
        )}
        {/* RenderDeleteButton */}
        {pack.downloaded && (
          <button type="button" className="button" onClick={() => run(() => deletePack(pack.identifier))}>
            {val('DELETE')}
          </button>
        )}
      </span>
    </article>
  );
}

/** Not in Valkyrie (17 November 2026): a pack this device keeps that the store's list does not have (addContentPack.ts). */
function FilePackCard({ pack }: { pack: { id: string; name: string; description: string } }) {
  const local = Game.get().cd.allPacks.find((p) => p.id === pack.id);
  const title = local !== undefined ? Game.get().cd.getContentName(pack.id) : pack.name;
  return (
    <article className="pack-download card">
      <span className="photo">
        <Picture file={local?.image ?? ''} name={plainText(title)} decorative />
      </span>
      <span className="pack-text">
        <h2 className="pack-name">
          <RichText text={title} />
        </h2>
        {pack.description !== '' && (
          <span className="synopsys">
            <RichText text={pack.description} links />
          </span>
        )}
      </span>
      <span className="pack-actions">
        <button type="button" className="button" onClick={() => run(() => deletePackFromFile(pack.id))}>
          {val('DELETE')}
        </button>
      </span>
    </article>
  );
}

export function ContentSelectDownloadScreen() {
  useUI((s) => s.revision);
  const input = useRef<HTMLInputElement>(null);
  const fromFiles = packsFromFiles();
  const game = Game.get();
  const manager = game.remoteContentPackManager;
  const mode = manager.content_pack_list_Mode;

  // RemoteQuestsListDownload_cb: draw again once the list arrives (or fails)
  useEffect(() => {
    if (mode === RemoteContentPackListMode.DOWNLOADING) manager.register_cb_download(() => update());
  }, [mode, manager]);

  return (
    <main className="screen content-select content-download">
      <header className="screen-head">
        <button type="button" className="button back" onClick={() => run(quit)}>
          {val('BACK')}
        </button>
        <h1>{val('CONTENTPACK_DOWNLOAD_HEADER')}</h1>
        <ConnectionStatus />
        {/* Not in Valkyrie (17 November 2026): a pack from a file, to try it before it is in the store */}
        <button type="button" className="button add-pack" onClick={() => input.current?.click()}>
          {uni('ADD_CONTENT_PACK')}
        </button>
        {/* No accept filter: Android greys out an extension it does not know, such as .valkyrieContentPack */}
        <input
          ref={input}
          className="visually-hidden"
          type="file"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) void addContentPack(file);
          }}
        />
      </header>
      <ul className="pack-downloads">
        {[...manager.remote_RemoteContentPack_data!.values()].map((pack) => (
          <li key={pack.identifier}>
            <PackCard pack={pack} />
          </li>
        ))}
      </ul>
      {fromFiles.length > 0 && (
        <section className="packs-from-files" aria-labelledby="packs-from-files">
          <h2 id="packs-from-files">{uni('PACKS_FROM_FILES')}</h2>
          <ul className="pack-downloads">
            {fromFiles.map((pack) => (
              <li key={pack.id}>
                <FilePackCard pack={pack} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <ScenarioReport />
    </main>
  );
}
