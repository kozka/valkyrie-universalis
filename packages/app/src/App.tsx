// Which screen is showing, the message when the game stops, and short notices. Not ported from Valkyrie.
import { Component, Suspense, lazy, useEffect, useState, type ReactNode } from 'react';
import { Application, Game, GameMenu, GameStateManager, ValkyrieConstants } from '@universalis/engine';
import { chooseUpright, lockLandscape, unlockOrientation, uprightChosen } from './host/orientation.ts';
import { reloadNewVersion } from './host/pwa.ts';
import { AboutScreen } from './screens/AboutScreen.tsx';
import { ContentImportScreen } from './screens/ContentImportScreen.tsx';
import { ContentSelectDownloadScreen } from './screens/ContentSelectDownloadScreen.tsx';
import { ContentSelectScreen } from './screens/ContentSelectScreen.tsx';
import { GameSelectionScreen, drawGameSelection } from './screens/GameSelectionScreen.tsx';
import { MainMenuScreen } from './screens/MainMenuScreen.tsx';
import { OptionsScreen } from './screens/OptionsScreen.tsx';
import { QuestDetailsScreen } from './screens/QuestDetailsScreen.tsx';
import { QuestScreen } from './screens/QuestScreen.tsx';
import { LoadingScreen } from './screens/LoadingScreen.tsx';
import { QuestLoadErrorScreen, QuestSelectionScreen } from './screens/QuestSelectionScreen.tsx';
import { playingDoom } from './screens/doom.ts';
import { SaveSelectScreen } from './screens/SaveSelectScreen.tsx';
import { languageCode } from './ui/languages.ts';
import { MusicCredits } from './ui/MusicCredits.tsx';
import { run } from './ui/run.ts';
import { AppGuards } from './ui/AppGuards.tsx';
import { technicalData } from './ui/Feedback.tsx';
import { Splash } from './ui/Splash.tsx';
import { update, useUI } from './ui/store.ts';
import { uni, val } from './ui/text.ts';

/**
 * The scenario editor, in development builds until kozka says it is ready (docs/plan-editor.md), and in the published
 * app while it is open to try (packages/app/editorPreview.ts); otherwise a production build drops this branch, and with
 * it the editor's code.
 */
const EditorScreen = import.meta.env.DEV || __EDITOR_PREVIEW__ ? lazy(() => import('./editor/EditorScreen.tsx')) : null;

function Screen() {
  const screen = useUI((s) => s.screen);
  switch (screen.name) {
    case 'loading':
      // At the start the splash covers it (ui/Splash.tsx)
      return <p className="loading quiet">{Game.game === null ? '' : uni('LOADING')}</p>;
    case 'game-selection':
      return <GameSelectionScreen />;
    case 'content-import':
      return <ContentImportScreen game={screen.game} resume={screen.resume} />;
    case 'main-menu':
      return <MainMenuScreen />;
    case 'options':
      return <OptionsScreen />;
    case 'about':
      return <AboutScreen />;
    case 'quest-selection':
      return <QuestSelectionScreen />;
    case 'quest-load-error':
      return <QuestLoadErrorScreen questName={screen.questName} packageUrl={screen.packageUrl} questKey={screen.key} />;
    case 'content-select':
      return <ContentSelectScreen type={screen.type} />;
    case 'content-download':
      return <ContentSelectDownloadScreen />;
    case 'quest-details':
      return <QuestDetailsScreen quest={screen.quest} />;
    case 'saves':
      return <SaveSelectScreen saves={screen.saves} />;
    case 'quest':
      return <QuestScreen />;
    case 'editor':
      return EditorScreen === null ? null : (
        <Suspense fallback={<p className="loading quiet">{uni('LOADING')}</p>}>
          <EditorScreen />
        </Suspense>
      );
  }
}

/** Back to where the player can choose again: the main menu, or the game selection when no game is chosen. */
function leave(): void {
  Application.fatalErrors.length = 0;
  update({ stop: null });
  // Not in Valkyrie: with no game (the start failed) there is nowhere to go back to but a fresh start
  if (Game.game === null) {
    location.reload();
    return;
  }
  const typeName = Game.get().gameType.typeName();
  if (typeName === ValkyrieConstants.typeMom || typeName === ValkyrieConstants.typeDescent) GameStateManager.mainMenu();
  else drawGameSelection();
}

/**
 * Not in Valkyrie: after an exception in a game, as Unity logs it and keeps the scene, the player can go on playing,
 * or save and go to the menu (GameMenu.quit, the game menu's own); a fatal error of Valkyrie still only goes back.
 */
function goOn(): void {
  update({ stop: null, revision: useUI.getState().revision + 1 });
}

function saveAndQuit(): void {
  Application.fatalErrors.length = 0;
  update({ stop: null });
  GameMenu.quit();
}

/** Not in Valkyrie: what the stop window says and what helps to find why, for the player to send (ui/Feedback.tsx). */
function CopyDiagnostics({ message, detail }: { message: string; detail: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const text = [message, detail, '', technicalData()].join('\n');
    void navigator.clipboard?.writeText(text).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };
  if (typeof navigator.clipboard?.writeText !== 'function') return null;
  return (
    <button type="button" className="button" onClick={copy}>
      {uni(copied ? 'DIAGNOSTICS_COPIED' : 'COPY_DIAGNOSTICS')}
    </button>
  );
}

function StopWindow() {
  const stop = useUI((s) => s.stop);
  const playing = useUI((s) => s.screen.name === 'quest');
  if (stop === null) return null;
  const inGame = playing && stop.kind === undefined && Game.game?.currentQuest != null;
  return (
    <div className="window-layer stop-layer">
      <section className="window panel stop-window" role="alertdialog" aria-modal="true" aria-labelledby="stop-title">
        <h2 id="stop-title">{uni('STOPPED', stop.message)}</h2>
        {stop.detail !== '' && <p className="quiet stop-detail">{stop.detail}</p>}
        <div className="stop-actions">
          {inGame && (
            <>
              <button type="button" className="button primary" onClick={goOn}>
                {uni('GO_ON_PLAYING')}
              </button>
              <button type="button" className="button" onClick={() => run(saveAndQuit)}>
                {uni('SAVE_AND_QUIT')}
              </button>
            </>
          )}
          <button type="button" className={inGame ? 'button' : 'button primary'} onClick={() => run(leave)}>
            {Game.game === null ? uni('RELOAD_APP') : val('BACK')}
          </button>
          <CopyDiagnostics message={stop.message} detail={stop.detail} />
        </div>
      </section>
    </div>
  );
}

function Notice() {
  const notice = useUI((s) => s.notice);
  useEffect(() => {
    if (notice === null) return;
    const timer = setTimeout(() => update({ notice: null }), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  if (notice === null) return null;
  return (
    <p className="notice" role="status">
      {notice}
    </p>
  );
}

/** A new version of the app, offered outside a game, where reloading loses nothing (host/pwa.ts). */
function NewVersion() {
  const ready = useUI((s) => s.appUpdate);
  const playing = useUI((s) => s.screen.name === 'quest');
  if (!ready || playing) return null;
  return (
    <div className="notice new-version" role="status">
      <span>{uni('NEW_VERSION')}</span>
      <button type="button" className="button primary" onClick={() => void reloadNewVersion()}>
        {uni('RELOAD_APP')}
      </button>
    </div>
  );
}

function PageLanguage() {
  useUI((s) => s.revision);
  const language = Game.game?.currentLang;
  useEffect(() => {
    document.documentElement.lang = languageCode(language ?? '');
  }, [language]);
  return null;
}

/**
 * The game being played, which picks its look (theme.css); none on the game selection. DooM is Descent's game, with
 * a look of its own (data-look: MoM, D2E or DooM; screens/doom.ts).
 */
function PageGame() {
  useUI((s) => s.revision);
  const game = Game.game?.gameType.typeName() ?? '';
  const look = game === ValkyrieConstants.typeDescent && playingDoom() ? 'DooM' : game;
  useEffect(() => {
    const root = document.documentElement.dataset;
    if (game === '') {
      delete root.game;
      delete root.look;
    } else {
      root.game = game;
      root.look = look;
    }
  }, [game, look]);
  return null;
}

/** A game in landscape, the menus as the phone is held (host/orientation.ts). */
function PageOrientation() {
  const playing = useUI((s) => s.screen.name === 'quest');
  const [upright, setUpright] = useState(uprightChosen);
  useEffect(() => {
    if (!playing) return;
    lockLandscape();
    return unlockOrientation;
  }, [playing]);
  if (!playing || upright) return null;
  // Shown by its stylesheet only on a phone held upright
  return (
    <div className="turn-phone" role="dialog" aria-modal="true" aria-labelledby="turn-phone-text">
      <svg className="turn-phone-icon" viewBox="0 0 64 64" aria-hidden="true">
        <rect x="22" y="8" width="20" height="36" rx="3" />
        <path d="M14 50a22 22 0 0 0 30 6M44 56l-1-6M44 56l-6 1" />
      </svg>
      <p id="turn-phone-text">{uni('TURN_PHONE')}</p>
      <button
        type="button"
        className="button"
        onClick={() => {
          chooseUpright();
          setUpright(true);
        }}
      >
        {uni('PLAY_UPRIGHT')}
      </button>
    </div>
  );
}

/** A screen that fails to draw stops the game with a message, as an exception in a click does (run.ts). */
class DrawingStop extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  override componentDidCatch(error: unknown): void {
    console.error(error);
    update({ stop: { message: error instanceof Error ? error.message : String(error), detail: '' } });
  }

  override componentDidUpdate(): void {
    // Drawing again once the player has left the stop window
    if (this.state.failed && useUI.getState().stop === null) this.setState({ failed: false });
  }

  override render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}

function DrawingStopReset({ children }: { children: ReactNode }) {
  // A new revision lets the boundary try again after the player left the stop window
  useUI((s) => s.revision);
  return <DrawingStop>{children}</DrawingStop>;
}

export function App() {
  return (
    <>
      <PageLanguage />
      <PageGame />
      <AppGuards />
      <DrawingStopReset>
        <Screen />
      </DrawingStopReset>
      <LoadingScreen />
      <PageOrientation />
      <StopWindow />
      <MusicCredits />
      <Notice />
      <NewVersion />
      <Splash />
    </>
  );
}
