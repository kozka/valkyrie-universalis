// The app's start: what Valkyrie's Game.Awake does, in the browser. Not ported from Valkyrie; each step names the
// Valkyrie code it follows. Game.Start then shows GameSelectionScreen, which the app does once this resolves.
import { keepNotesInSaves } from '../play/notes.ts';
import {
  Application,
  ContentData,
  Directory,
  DictionaryI18n,
  Game,
  HTTPManager,
  LocalizationRead,
  RoundController,
  ValkyrieConstants,
  VirtualFileSystem,
  floatTryParse,
  setFileSystem,
  standInFile,
  type GameUI,
} from '@universalis/engine';
import { descentTile } from '../board/descentTiles.ts';
import { tilePictureSize } from '../board/schematicTiles.ts';
import { LANGUAGE_CODES } from '../ui/languages.ts';
import { finishBackups } from './backup.ts';
import { addPlayersTranslation } from './customTranslation.ts';
import { mountBaseData } from './baseData.ts';
import { postForm, sendText } from './network.ts';
import { mountImports } from './officialImport.ts';
import { pruneOldPictureCaches } from './pictureFiles.ts';
import { PersistentFolder } from './storage.ts';

/** The app's own texts, next to Valkyrie's (StreamingAssets/text), for the 'uni' dictionary: one file per language. */
const UNIVERSALIS_TEXT = Application.streamingAssetsPath + '/universalis';
const UNIVERSALIS_TEXTS = import.meta.glob<string>('../i18n/Localization.*.txt', { query: '?raw', import: 'default', eager: true });
/** Valkyrie's own texts that its files leave out or empty in some languages and the app shows (src/i18n/valkyrie). */
const VALKYRIE_GAPS = import.meta.glob<string>('../i18n/valkyrie/Localization.*.txt', { query: '?raw', import: 'default', eager: true });

export interface Host {
  game: Game;
  vfs: VirtualFileSystem;
  /** Null when this browser keeps no files. */
  storage: PersistentFolder | null;
  /** What went wrong putting back a backup, which goes on next time (host/backup.ts). */
  backupProblem: string | null;
  valkyrieCommit: string;
}

/** The first of the browser's languages that Valkyrie has (OptionsScreen.OpenLanguageSelection), or English, its default. */
function browserLanguage(): string {
  for (const code of navigator.languages ?? [navigator.language]) {
    const language = Object.keys(LANGUAGE_CODES).find((name) => LANGUAGE_CODES[name] === code.toLowerCase().split('-')[0]);
    if (language !== undefined) return language;
  }
  return ValkyrieConstants.DefaultLanguage;
}

export async function boot(ui: GameUI): Promise<Host> {
  const vfs = new VirtualFileSystem();
  setFileSystem(vfs);
  const manifest = await mountBaseData(vfs);
  // Not in Valkyrie: the pictures kept for another commit of Valkyrie are not drawn any more
  void pruneOldPictureCaches();
  for (const [file, text] of Object.entries(UNIVERSALIS_TEXTS)) vfs.writeFile(UNIVERSALIS_TEXT + '/' + file.split('/').pop()!, new TextEncoder().encode(text));

  // Valkyrie's user folder (config.ini, downloads, import), kept in the browser; a backup put back in Options first
  const storage = await PersistentFolder.open(vfs);
  let backupProblem: string | null = null;
  if (storage !== null) {
    backupProblem = await finishBackups();
    await storage.load();
    storage.watch();
  }

  // The official import kept in the browser, or the schematic mode: its pictures and sounds are stand-ins, and tiles
  // have their size
  await mountImports(vfs, (game, relative) => {
    const tile = game === ValkyrieConstants.typeDescent ? descentTile(relative) : undefined;
    const size = tile !== undefined ? { width: tile.w, height: tile.h } : game === ValkyrieConstants.typeMom ? tilePictureSize(relative) : null;
    return size === null ? standInFile(relative) : standInFile(relative, size.width, size.height);
  });

  // HTTPManager's requests go out through the browser
  HTTPManager.send = sendText;
  HTTPManager.post = postForm;
  keepNotesInSaves();
  // Not in Valkyrie: the player's own translation of a scenario goes into its copy when a game starts
  Game.onQuestExtracted = (q) => addPlayersTranslation(q, Game.get().currentLang);

  // Game.Awake (its ConfigFile reads config.ini; its StatsManager is filled by the store list)
  const game = new Game();
  Game.game = game;
  game.ui = ui;

  if (game.config.data.get('UserConfig') === null) {
    // English is Valkyrie's default current language; the app starts in the browser's language instead
    game.config.data.add('UserConfig', 'currentLang', browserLanguage());
    game.config.save();
  }
  game.currentLang = game.config.data.get('UserConfig', 'currentLang');
  game.fallbackLang = game.config.data.get('UserConfig', 'fallbackLang');
  game.userRoot = game.config.data.get('UserConfig', 'UserRoot');

  const vSet = game.config.data.get('UserConfig', 'editorTransparency');
  game.editorTransparency = vSet === '' ? 0.3 : floatTryParse(vSet, true).value;

  let debugTests = game.config.data.get('Debug', 'tests');
  if (debugTests !== '') {
    debugTests = debugTests.toLowerCase();
    if (debugTests === 'true' || debugTests === '1') game.debugTests = true;
  }

  const valDict = new DictionaryI18n();
  // Not in Valkyrie: first what its own files leave empty, so that their empty lines do not hide it
  for (const text of Object.values(VALKYRIE_GAPS)) valDict.addData(text.split('\n'));
  for (const file of Directory.getFiles(ContentData.contentPath() + '../text', 'Localization*.txt')) {
    valDict.addDataFromFile(file);
  }
  LocalizationRead.addDictionary('val', valDict);

  const uniDict = new DictionaryI18n();
  for (const file of Directory.getFiles(UNIVERSALIS_TEXT, 'Localization*.txt')) {
    uniDict.addDataFromFile(file);
  }
  LocalizationRead.addDictionary('uni', uniDict);

  game.roundControl = new RoundController();

  // Read the version (Resources/version.txt, recorded in the base data)
  game.version = manifest.valkyrieVersion;

  return { game, vfs, storage, backupProblem, valkyrieCommit: manifest.valkyrieCommit };
}
