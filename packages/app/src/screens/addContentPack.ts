// Not in Valkyrie (17 November 2026): a community content pack added from a file, so that its author can try it before
// it is in the store, on any device. Valkyrie's wiki (Create Custom Content Packs) has the author copy the
// .valkyrieContentPack into Download/ContentPacks and write its entry in that folder's manifest.ini; the app does both,
// after checking it (host/contentPackPackage.ts), so Valkyrie's own loading (ContentData.GetCustomContentPacks) reads it
// as it would there. Packs added so are listed below the store's (ContentSelectDownloadScreen), to replace or delete.
import {
  ContentData,
  ContentLoader,
  ExtractManager,
  File,
  Game,
  IniRead,
  ManifestManager,
  Path,
  RemoteContentPackManager,
  ValkyrieConstants,
  ValkyrieDebug,
  type IniData,
} from '@universalis/engine';
import { checkContentPack, manifestEntry, type ContentPackContext } from '../host/contentPackPackage.ts';
import { addSchematicNames } from '../host/schematicNames.ts';
import { run } from '../ui/run.ts';
import { update, useUI } from '../ui/store.ts';
import { gameName, uni, val } from '../ui/text.ts';

function packFile(id: string): string {
  return ContentData.customContentPackPath() + Path.DirectorySeparatorChar + id + ValkyrieConstants.ContentPackDownloadContainerExtension;
}

function localManifest(): IniData {
  return new ManifestManager(ContentData.customContentPackPath()).getLocalContentPackManifestIniData();
}

function writeManifest(manifest: IniData): void {
  File.writeAllText(ContentData.customContentPackPath() + ValkyrieConstants.ContentPackManifestPath, manifest.toString());
}

/** The game's content read again, as GameStateManager.MainMenu does, so that a pack replaced shows its new content. */
function reloadContent(): void {
  const game = Game.get();
  ContentData.textureCache?.clear();
  ContentLoader.getContentData(game);
  game.contentLoader.loadContentID(game.gameType.baseContentPackId());
  addSchematicNames(game);
}

/** What the check compares a pack with: this game's official packs, the store's, and every name they define. */
function packContext(): ContentPackContext {
  const game = Game.get();
  const custom = RemoteContentPackManager.getCustomCategory();
  const knownNames = new Map<string, string>();
  for (const pack of game.cd.allPacks) {
    for (const file of pack.iniFiles ?? []) {
      if (Path.getFileName(file) === ValkyrieConstants.ContentPackIniFile) continue;
      try {
        for (const section of IniRead.readFromIni(file)?.data.keys() ?? []) if (!knownNames.has(section)) knownNames.set(section, pack.id ?? '');
      } catch {
        // A file of another pack that cannot be read names nothing
      }
    }
  }
  return {
    gameType: game.gameType.typeName(),
    officialIds: new Set(game.cd.allPacks.filter((p) => p.type !== custom && p.id).map((p) => p.id!)),
    storeIds: new Set(game.remoteContentPackManager.remote_RemoteContentPack_data?.keys() ?? []),
    knownNames,
  };
}

/** Checks a pack file the player chose and, unless it has errors, keeps it as Valkyrie keeps a downloaded one. */
export async function addContentPack(file: globalThis.File): Promise<void> {
  const given = file.name;
  const bytes = new Uint8Array(await file.arrayBuffer());
  run(() => {
    const check = checkContentPack(bytes, packContext());
    if (check.kind === 'not-zip') return update({ notice: uni('PACK_NOT_ZIP', given) });
    if (check.kind === 'scenario') return update({ notice: uni('PACK_IS_SCENARIO', given, uni('ADD_SCENARIO')) });
    if (check.kind === 'no-pack-ini') return update({ notice: uni('PACK_NO_INI', given) });
    // The other game by its name, in the player's language
    const lines = [...check.errors, ...check.warnings].map((p) => uni(p.key, ...(p.key === 'PACK_OTHER_GAME' ? [p.params[0]!, gameName(p.params[1]!)] : p.params)));
    const shown = check.pack.get('name') || given;
    if (check.errors.length > 0) {
      useUI.setState({ scenarioReport: { title: uni('PACK_CHECK_TITLE_ERRORS', shown), lines } });
      return;
    }
    const id = check.id;
    const game = Game.get();
    ExtractManager.mkDir(ContentData.customContentPackPath());
    File.writeAllBytes(packFile(id), bytes);
    const manifest = localManifest();
    manifest.remove(id);
    manifest.add(id, manifestEntry(check.pack));
    writeManifest(manifest);
    // A pack of the store's list with the same id is now this one
    const remote = game.remoteContentPackManager.remote_RemoteContentPack_data?.get(id);
    if (remote !== undefined) {
      remote.downloaded = true;
      remote.update_available = false;
    }
    reloadContent();
    ValkyrieDebug.log('INFO: Content pack added from a file: ' + id);
    if (lines.length > 0) useUI.setState({ scenarioReport: { title: uni('PACK_CHECK_TITLE', shown), lines } });
    update({ notice: uni('PACK_ADDED', shown, val('SELECT_CONTENT'), val('CONTENTPACK_CATEGORY_CUSTOM')) });
  });
}

/** The packs this device keeps that the store's list does not have: those added from a file. */
export function packsFromFiles(): { id: string; name: string; description: string }[] {
  const game = Game.get();
  const store = game.remoteContentPackManager.remote_RemoteContentPack_data;
  const out: { id: string; name: string; description: string }[] = [];
  for (const [id, entry] of localManifest().data) {
    if (store?.has(id) || !File.exists(packFile(id))) continue;
    out.push({ id, name: entry.get('name') ?? id, description: entry.get('description') ?? '' });
  }
  return out;
}

/** Deletes a pack added from a file: its file and its entry in the manifest, as ContentSelectDownloadScreen.Delete. */
export function deletePackFromFile(id: string): void {
  if (File.exists(packFile(id))) File.delete(packFile(id));
  const manifest = localManifest();
  manifest.remove(id);
  writeManifest(manifest);
  ContentLoader.removeContentPack(Game.get(), id);
  reloadContent();
  update();
}
