// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/UI/Screens/GameSelectionScreen.cs
// The first screen: which game to play, and the import of its official content. Its logic follows Valkyrie (Draw,
// DrawD2ESection, DrawMoMSection, MoM, D2E, loadLocalization); the drawing is the app's, with each game's button drawn
// by gameArt.ts. Not as in Valkyrie, a game opens without its import, which is asked for only to play (ImportGate.tsx).
import { useEffect, useRef } from 'react';
import {
  Application,
  ContentData,
  ContentLoader,
  Destroyer,
  DictionaryI18n,
  Directory,
  Game,
  GameStateManager,
  LocalizationRead,
  NewLine,
  NoGameType,
  Path,
  QuestsManager,
  RemoteContentPackManager,
  RoundController,
  ValkyrieConstants,
  ValkyrieDebug,
} from '@universalis/engine';
import { D2EGameType } from '@universalis/module-d2e';
import doomTitle from '../assets/game-doom-title.webp';
import logo from '../assets/logo.webp';
import { MoMGameType, RoundControllerMoM } from '@universalis/module-mom';
import { loadGameFonts } from '../host/gameFonts.ts';
import { appleMobile, install, installed } from '../host/pwa.ts';
import { addSchematicNames } from '../host/schematicNames.ts';
import { playDoom } from './doom.ts';
import { GameArt } from './gameArt.ts';
import { ImportManager } from './ImportManager.ts';
import { Backdrop } from '../themes/Backdrop.tsx';
import { FeedbackButton } from '../ui/Feedback.tsx';
import { run } from '../ui/run.ts';
import { show, update, useUI } from '../ui/store.ts';
import { uni, val } from '../ui/text.ts';
import './GameSelectionScreen.css';

// Valkyrie: GameSelectionScreen.cs GameSelectionScreen.Draw
export function drawGameSelection(): void {
  // This will destroy all
  Destroyer.destroy();

  const game = Game.get();

  game.gameType = new NoGameType();

  ImportManager.inspect();

  show({ name: 'game-selection' });
}

// Valkyrie: GameSelectionScreen.cs GameSelectionScreen.D2E
export function d2e(asDoom = false): void {
  ValkyrieDebug.log('INFO: Start game as D2E');

  const game = Game.get();

  game.gameType = new D2EGameType();
  // Not in Valkyrie: Descent or DooM, each with its own missions and packs (doom.ts)
  playDoom(asDoom);

  // Clean up any old localization
  LocalizationRead.removeDictionary('ffg');
  LocalizationRead.removeDictionary('csh');
  // Clean up texture cache
  ContentData.textureCache?.clear();

  // Load localization before content
  loadLocalization();

  // Loading list of content - doing this later is not required
  ContentLoader.getContentData(game);
  // Not in Valkyrie: without the import, the official names read as words (schematic mode)
  addSchematicNames(game);
  // Not in Valkyrie, which has them in its Resources: its fonts for Descent, from its repository (host/gameFonts.ts)
  void loadGameFonts('D2E').then((loaded) => {
    if (loaded) update();
  });

  // Download quests list
  game.questsList = new QuestsManager();
  game.remoteContentPackManager = new RemoteContentPackManager();
  game.roundControl = new RoundController();

  GameStateManager.mainMenu();
}

// Start game as MoM
// Valkyrie: GameSelectionScreen.cs GameSelectionScreen.MoM
export function mom(): void {
  ValkyrieDebug.log('INFO: Start game as MoM');

  const game = Game.get();
  game.gameType = new MoMGameType();
  playDoom(false);

  // Clean up any old localization
  LocalizationRead.removeDictionary('ffg');
  LocalizationRead.removeDictionary('csh');
  // Clean up texture cache
  ContentData.textureCache?.clear();

  // Load localization before content
  loadLocalization();

  // Loading list of content - doing this later is not required
  ContentLoader.getContentData(game);
  // Not in Valkyrie: without the import, the official names read as words (schematic mode)
  addSchematicNames(game);
  // Not in Valkyrie, which has them in its Resources: its fonts for Mansions, from its repository (host/gameFonts.ts)
  void loadGameFonts('MoM').then((loaded) => {
    if (loaded) update();
  });
  // Check if we found anything
  if (game.cd.getPacks().length === 0) {
    const message = 'Error: Failed to find any content packs, please check that you have them present in: ' + game.gameType.dataDirectory() + NewLine;
    ValkyrieDebug.log(message);
    Application.quit('no-content-packs', game.gameType.dataDirectory(), message);
  }

  // Download quests list
  game.questsList = new QuestsManager();
  game.remoteContentPackManager = new RemoteContentPackManager();
  // MoM also has a special reound controller (the cursor stays the browser's)
  game.roundControl = new RoundControllerMoM();

  GameStateManager.mainMenu();
}

/**
 * After selecting game, we load the localization file. Depends on the gameType selected. There are two Localization
 * files from ffg, one for D2E and one for MoM. Without the import they are empty.
 */
// Valkyrie: GameSelectionScreen.cs GameSelectionScreen.loadLocalization
function loadLocalization(): void {
  // After content import, we load the localization file
  if (LocalizationRead.selectDictionary('ffg') === null) {
    const ffgDict = new DictionaryI18n();
    const localizationFilesRaw = Directory.getFiles(ContentData.importPath() + '/text', 'Localization_*.txt');
    const localizationFiles = localizationFilesRaw.filter((x) => !/\p{Nd}/u.test(Path.getFileName(x) ?? ''));

    for (const file of localizationFiles) {
      ffgDict.addDataFromFile(file);
    }
    LocalizationRead.addDictionary('ffg', ffgDict);

    // CoSH used for Dunwich Horror data
    const cshDict = new DictionaryI18n();
    for (const file of Directory.getFiles(ContentData.importPath() + '/text', 'SCENARIO_CULT_OF_SENTINEL_HILL_MAD22_*.txt')) {
      cshDict.addDataFromFile(file);
    }
    LocalizationRead.addDictionary('csh', cshDict);

    const game = Game.get();
    for (const [pack, language] of game.config.getPackLanguages(game.gameType.typeName())) {
      if (language.trim().length > 0) LocalizationRead.setGroupTranslationLanguage(pack, language);
    }
  }
}

/**
 * A game's button and, under it, the import of its official content, which says Import instead of Reimport while
 * there is none. Not as in Valkyrie, which greys the game's button then, it opens the game all the same.
 */
// Valkyrie: GameSelectionScreen.cs GameSelectionScreen.DrawD2ESection and DrawMoMSection
/** A game's name on its button, in the app's words: its title large, then what follows it and its edition quieter. */
interface Naming {
  title: string;
  subtitle?: string;
  edition: string;
}

function GameSection({ type, look, name, naming, title, start }: { type: string; look: string; name: string; naming?: Naming; title?: string; start: () => void }) {
  const needImport = ImportManager.needImport(type);
  return (
    <div className="game-section" data-section={look}>
      {/* Named as Valkyrie names the game; DooM by its title drawing */}
      <button type="button" className="game" data-look={look} aria-label={title === undefined ? val(name) : undefined} onClick={() => run(start)}>
        <span className="game-text">
          {title !== undefined ? (
            <img className="game-title" src={title} alt={uni(name)} />
          ) : naming !== undefined ? (
            <>
              <span className="game-name">{uni(naming.title)}</span>
              <span className="game-more">
                {naming.subtitle !== undefined && <span className="game-subtitle">{uni(naming.subtitle)}</span>}
                <span className="game-edition">{uni(naming.edition)}</span>
              </span>
            </>
          ) : (
            <span className="game-name">{val(name)}</span>
          )}
        </span>
      </button>
      {/* Not in Valkyrie: DooM is Descent's, imported with it */}
      {ImportManager.canImport() && title === undefined && (
        <div className="game-import">
          <button type="button" className="button" onClick={() => run(() => show({ name: 'content-import', game: type }))}>
            {val(needImport ? 'IMPORT_GAME_DATA' : 'REIMPORT_GAME_DATA')}
          </button>
        </div>
      )}
    </div>
  );
}

export function GameSelectionScreen() {
  useUI((s) => s.revision);
  const canInstall = useUI((s) => s.canInstall);
  const games = useRef<HTMLElement>(null);
  const art = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const drawing = new GameArt(games.current!, art.current!);
    void drawing.start();
    return () => drawing.destroy();
  }, []);
  return (
    <main className="screen game-selection">
      {/* Not in Valkyrie: the theme's picture behind (themes/themes.ts) */}
      <Backdrop place="start" />
      <header className="title-block">
        <h1 className="app-title">
          <img className="app-logo" src={logo} alt={uni('APP_NAME')} width={1200} height={412} />
        </h1>
        <p className="fan-made">{uni('UNOFFICIAL')}</p>
        <p className="app-version">{uni('VERSION', __APP_VERSION__)}</p>
      </header>

      <nav className="games" aria-label={val('SELECT_GAME_TYPE')} ref={games}>
        <div className="games-art" aria-hidden="true" ref={art} />
        <GameSection type={ValkyrieConstants.typeMom} look="mom" name="MOM_NAME" naming={{ title: 'MOM_TITLE', edition: 'MOM_EDITION' }} start={mom} />
        <GameSection type={ValkyrieConstants.typeDescent} look="d2e" name="D2E_NAME" naming={{ title: 'D2E_TITLE', subtitle: 'D2E_SUBTITLE', edition: 'D2E_EDITION' }} start={() => d2e()} />
        {/* Not in Valkyrie: DooM, Descent with the community's DooM pack (doom.ts) */}
        <GameSection type={ValkyrieConstants.typeDescent} look="doom" name="DOOM_NAME" title={doomTitle} start={() => d2e(true)} />
      </nav>

      {/* Not in Valkyrie: installing the app (host/pwa.ts), and the players' bugs and ideas (ui/Feedback.tsx) */}
      <div className="start-actions">
        {canInstall && (
          <button type="button" className="button install-app" onClick={() => void install()}>
            {uni('INSTALL_APP')}
          </button>
        )}
        <FeedbackButton />
      </div>
      {!canInstall && appleMobile() && !installed() && <p className="install-hint">{uni('INSTALL_APPLE')}</p>}
    </main>
  );
}
