// Rewritten from Valkyrie (Apache-2.0): unity/Assets/Scripts/UI/Screens/MainMenuScreen.cs MainMenuScreen.About
// What Universalis is and whose work it builds on, with Valkyrie's version, and the way back to the main menu.
import { Game, GameStateManager } from '@universalis/engine';
import { run } from '../ui/run.ts';
import { useUI } from '../ui/store.ts';
import { uni, val } from '../ui/text.ts';

export function AboutScreen() {
  useUI((s) => s.revision);
  return (
    <main className="screen about">
      <header className="title-block">
        <h1 className="app-title">{uni('APP_NAME')}</h1>
        <p className="fan-made">{uni('UNOFFICIAL')}</p>
      </header>
      <div className="about-text">
        <p>{uni('ABOUT_TEXT')}</p>
        <p className="quiet">{uni('ABOUT_CODE', Game.get().version)}</p>
      </div>
      <footer className="screen-foot">
        <button type="button" className="button back" onClick={() => run(() => GameStateManager.mainMenu())}>
          {val('BACK')}
        </button>
      </footer>
    </main>
  );
}
