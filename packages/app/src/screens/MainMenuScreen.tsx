// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/UI/Screens/MainMenuScreen.cs
// The main menu. Its logic follows Valkyrie; the drawing is the app's. The editor is only in development builds until
// it is ready (docs/plan-editor.md), or open to try behind a warning (packages/app/editorPreview.ts), and exiting is not
// here (a page is closed by the browser).
import { useState } from 'react';
import { Destroyer, Game, NoGameType, SaveManager, ValkyrieDebug } from '@universalis/engine';
import { playMenuSound } from '../audio/menuAmbience.ts';
import doomTitle from '../assets/game-doom-title.webp';
import logo from '../assets/logo.webp';
import { EditorWarning } from '../ui/EditorWarning.tsx';
import { enterFullscreen } from '../ui/fullscreen.ts';
import { RulesHelp, openRulesHelp } from '../ui/RulesHelp.tsx';
import { run } from '../ui/run.ts';
import { show, useUI } from '../ui/store.ts';
import { uni, val } from '../ui/text.ts';
import { openContentSelect } from './ContentSelectScreen.tsx';
import { openContentSelectDownload } from './ContentSelectDownloadScreen.tsx';
import { hasDoomPack, playingDoom } from './doom.ts';
import { Backdrop } from '../themes/Backdrop.tsx';
import { IgorButton } from '../igor/Igor.tsx';
import { openScenarioWhenListed } from './QuestSelectionScreen.tsx';
import { drawGameSelection } from './GameSelectionScreen.tsx';
import { openOptions } from './OptionsScreen.tsx';
import { openSaveSelect } from './SaveSelectScreen.tsx';
import './MainMenuScreen.css';

// Create a menu which will take up the whole screen and have options
// Valkyrie: MainMenuScreen.cs MainMenuScreen.MainMenuScreen
export function openMainMenu(): void {
  // This will destroy all, because we shouldn't have anything left at the main menu
  Destroyer.destroy();
  const game = Game.get();

  // Not in Valkyrie (10 November 2026): the menus have the app's own sound, an ambience and the game's music over it
  // (audio/menuAmbience.ts); the music of the game that was played, if any, fades out
  game.audioControl.playDefaultQuestMusic([]);
  playMenuSound(playingDoom() ? 'DooM' : game.gameType.typeName() === 'D2E' ? 'D2E' : 'MoM');

  show({ name: 'main-menu' });
}

// Start quest
// Valkyrie: MainMenuScreen.cs MainMenuScreen.Start
function start(): void {
  ValkyrieDebug.log('INFO: Accessing quests');

  const game = Game.get();

  // Remove the main menu
  Destroyer.dialog();

  game.selectQuest();
}

// Valkyrie: MainMenuScreen.cs MainMenuScreen.Content
function content(): void {
  ValkyrieDebug.log('INFO: Accessing content selection screen');
  openContentSelect();
}

// Valkyrie: MainMenuScreen.cs MainMenuScreen.Editor (Game.SelectEditQuest opens QuestEditSelection, the editor's screen)
function editor(): void {
  ValkyrieDebug.log('INFO: Accessing editor selection screen');
  show({ name: 'editor' });
}

/** Not in Valkyrie: the editor wants the whole screen. */
function enterEditor(): void {
  enterFullscreen();
  run(editor);
}

// Valkyrie: MainMenuScreen.cs MainMenuScreen.Config
function config(): void {
  ValkyrieDebug.log('INFO: Accessing config');
  openOptions();
}

// Valkyrie: MainMenuScreen.cs MainMenuScreen.GameSelection
function gameSelection(): void {
  ValkyrieDebug.log('INFO: Return to game selection');
  // Clean up everything
  Destroyer.destroy();
  Game.get().gameType = new NoGameType();
  drawGameSelection();
}

// Create the about dialog
// Valkyrie: MainMenuScreen.cs MainMenuScreen.About
function about(): void {
  ValkyrieDebug.log('INFO: Accessing about');

  // This will destroy all, because we shouldn't have anything left at the main menu
  Destroyer.destroy();
  show({ name: 'about' });
}

/**
 * Not in Valkyrie: the game's name as its button in the game selection sets it (GameSelectionScreen.css): the title
 * large, and under it Descent's subtitle and, quieter, the edition.
 */
function GameTitle({ type }: { type: string }) {
  const d2e = type === 'D2E';
  return (
    <h1 className="game-heading" data-look={d2e ? 'd2e' : 'mom'}>
      <span className="game-heading-name">{uni(d2e ? 'D2E_TITLE' : 'MOM_TITLE')}</span>{' '}
      <span className="game-heading-more">
        {d2e && (
          <>
            <span className="game-heading-subtitle">{uni('D2E_SUBTITLE')}</span>{' '}
          </>
        )}
        <span className="game-heading-edition">{uni(d2e ? 'D2E_EDITION' : 'MOM_EDITION')}</span>
      </span>
    </h1>
  );
}

export function MainMenuScreen() {
  useUI((s) => s.revision);
  const [editorWarning, setEditorWarning] = useState(false);
  const game = Game.get();
  return (
    <main className="screen main-menu">
      {/* Not in Valkyrie: the theme's picture behind (themes/themes.ts) */}
      <Backdrop place={playingDoom() ? 'DooM' : game.gameType.typeName() === 'D2E' ? 'D2E' : 'MoM'} />
      <header className="title-block">
        {/* Not in Valkyrie: the app's logo, small, over the game's name */}
        <img className="app-name" src={logo} alt={uni('APP_NAME')} width={1200} height={412} />
        {playingDoom() ? (
          <h1 className="doom-title">
            <img src={doomTitle} alt={uni('DOOM_NAME')} width={257} height={96} />
          </h1>
        ) : (
          <GameTitle type={game.gameType.typeName()} />
        )}
      </header>

      {/* Not in Valkyrie: DooM's missions need its pack, from the store (doom.ts) */}
      {playingDoom() && !hasDoomPack() && (
        <div className="doom-pack">
          <p>{uni('DOOM_NEEDS_PACK')}</p>
          <button type="button" className="button primary" onClick={() => run(() => openContentSelectDownload())}>
            {uni('DOOM_DOWNLOAD_PACK')}
          </button>
        </div>
      )}

      <nav className="menu">
        <button type="button" className="menu-entry" onClick={() => run(start)}>
          {val('START_QUEST')}
        </button>
        <button type="button" className="menu-entry" disabled={!SaveManager.saveExists()} onClick={() => run(() => openSaveSelect())}>
          {val('LOAD_QUEST')}
        </button>
        <button type="button" className="menu-entry" onClick={() => run(content)}>
          {val('SELECT_CONTENT')}
        </button>
        {(import.meta.env.DEV || __EDITOR_PREVIEW__) && (
          // Not in Valkyrie: while it is open to try, a warning first
          <button type="button" className="menu-entry" onClick={() => (__EDITOR_PREVIEW__ ? setEditorWarning(true) : enterEditor())}>
            {val('QUEST_NAME_EDITOR', game.gameType.questName())}
          </button>
        )}
        <button type="button" className="menu-entry" onClick={() => run(config)}>
          {val('OPTIONS')}
        </button>
        {/* Not in Valkyrie: the game's help, to refresh the rules before a game (ui/RulesHelp.tsx) */}
        <button type="button" className="menu-entry" onClick={() => openRulesHelp()}>
          {uni('RULES_HELP')}
        </button>
        <button type="button" className="menu-entry" onClick={() => run(about)}>
          {val('ABOUT')}
        </button>
        <button type="button" className="menu-entry" onClick={() => run(gameSelection)}>
          {val('SELECT_GAME_TYPE')}
        </button>
      </nav>

      <footer className="screen-foot">
        <p className="fan-made">{uni('UNOFFICIAL')}</p>
      </footer>
      <RulesHelp />
      {editorWarning && <EditorWarning enter={enterEditor} back={() => setEditorWarning(false)} />}
      {/* Not in Valkyrie: Igor, who recommends adventures and tells the news, for Mansions (igor/Igor.tsx) */}
      <IgorButton
        go={(key) => {
          openScenarioWhenListed(key);
          run(start);
        }}
      />
    </main>
  );
}
