// The setting in which the battery loads quests, as Valkyrie has it once a game is chosen and every pack is selected:
// base data, the import folder and the community packs in a virtual file system, and a Game with all packs loaded.
// Not ported from Valkyrie; each step names the Valkyrie code it follows.
import { readFileSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import {
  Application,
  ContentData,
  ContentLoader,
  DictionaryI18n,
  Directory,
  Game,
  LocalizationRead,
  QuestsManager,
  RoundController,
  ValkyrieDebug,
  VirtualFileSystem,
  setFileSystem,
  standInFile,
} from '../../packages/engine/src/index.ts';
import { D2EGameType } from '../../packages/module-d2e/src/index.ts';
import { MoMGameType, RoundControllerMoM } from '../../packages/module-mom/src/index.ts';

export type GameName = 'MoM' | 'D2E';

export interface Environment {
  game: Game;
  gameName: GameName;
  vfs: VirtualFileSystem;
  /** Ids of every pack found (built-in and community), all of them loaded. */
  packIds: string[];
  /** Messages logged while loading the base data and the packs. */
  setupLog: string[];
}

interface BaseDataManifest {
  valkyrieCommit: string;
  valkyrieVersion: string;
  files: { path: string; bytes: number }[];
  images: { path: string; bytes: number; width: number; height: number }[];
}

export function readBaseDataManifest(dataDir: string): BaseDataManifest {
  return JSON.parse(readFileSync(join(dataDir, 'manifest.json'), 'utf8')) as BaseDataManifest;
}

/** StreamingAssets: the copied .ini and .txt files, read on demand, and stand-ins of the right size for the images listed. */
function mountBaseData(vfs: VirtualFileSystem, dataDir: string): void {
  const manifest = readBaseDataManifest(dataDir);
  for (const file of manifest.files) {
    const real = join(dataDir, ...file.path.split('/'));
    vfs.writeFile(`${Application.streamingAssetsPath}/${file.path}`, () => readFileSync(real), file.bytes);
  }
  for (const image of manifest.images) {
    vfs.writeFile(`${Application.streamingAssetsPath}/${image.path}`, () => standInFile(image.path, image.width, image.height), image.bytes);
  }
}

/** Download/ContentPacks with its manifest.ini, as RemoteContentPackManager leaves them after downloading. */
function installCommunityPacks(vfs: VirtualFileSystem, packFiles: string[]): void {
  const folder = ContentData.customContentPackPath();
  let manifest = '';
  for (const file of packFiles) {
    const id = basename(file, '.valkyrieContentPack');
    vfs.writeFile(`${folder}/${id}.valkyrieContentPack`, () => readFileSync(file), statSync(file).size);
    manifest += `[${id}]\r\n`;
  }
  vfs.writeFile(`${folder}/manifest.ini`, new TextEncoder().encode(manifest));
}

/** `importPicture` gives a stand-in for a picture of the import folder by its path there; by default they are all square. */
export function createEnvironment(
  gameName: GameName,
  dataDir: string,
  communityPacks: string[],
  importPicture: (relative: string) => Uint8Array = (relative) => standInFile(relative),
): Environment {
  const vfs = new VirtualFileSystem();
  setFileSystem(vfs);
  LocalizationRead.dicts.clear();
  ContentData.textureCache = null;
  Application.fatalErrors.length = 0;

  const setupLog: string[] = [];
  const stopLog = ValkyrieDebug.onLog((message) => {
    if (message) setupLog.push(message);
  });
  try {
    mountBaseData(vfs, dataDir);
    const game = new Game();
    Game.game = game;
    // Game.Awake reads Valkyrie's version, which saves record
    game.version = readBaseDataManifest(dataDir).valkyrieVersion;

    // Game.Awake: Valkyrie's own texts
    const valDict = new DictionaryI18n();
    for (const file of Directory.getFiles(ContentData.contentPath() + '../text', 'Localization*.txt')) {
      valDict.addDataFromFile(file);
    }
    LocalizationRead.addDictionary('val', valDict);

    // GameSelectionScreen.MoM() and D2E()
    game.gameType = gameName === 'MoM' ? new MoMGameType() : new D2EGameType();
    // The official import is not available here: every image and sound it would hold is taken as present
    vfs.mountVirtualTree(ContentData.importPath(), (relative) => /\.(dds|ogg)$/i.test(relative), importPicture);
    installCommunityPacks(vfs, communityPacks);
    // GameSelectionScreen.loadLocalization, with an import that has no text files
    LocalizationRead.addDictionary('ffg', new DictionaryI18n());
    LocalizationRead.addDictionary('csh', new DictionaryI18n());
    ContentLoader.getContentData(game);
    game.questsList = new QuestsManager();
    // MoM also has a special round controller
    game.roundControl = gameName === 'MoM' ? new RoundControllerMoM() : new RoundController();

    // GameStateManager.MainMenu: content data again, then the base pack
    ContentLoader.getContentData(game);
    game.contentLoader.loadContentID(game.gameType.baseContentPackId());

    // Game.SelectQuest, with every pack selected
    for (const pack of game.cd.allPacks) game.contentLoader.loadContentID(pack.id!);

    return { game, gameName, vfs, packIds: game.cd.allPacks.map((p) => p.id!), setupLog };
  } finally {
    stopLog();
  }
}
