import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/eb-garamond/400.css';
import '@fontsource/eb-garamond/400-italic.css';
import '@fontsource/eb-garamond/500.css';
// The theme first, so that each component's stylesheet can refine it
import './theme/theme.css';
import { Application } from '@universalis/engine';
import { App } from './App.tsx';
import { installUiSounds } from './audio/uiSounds.ts';
import { boot } from './host/boot.ts';
import { devLog, forwardConsoleToDevLog } from './host/devLog.ts';
import { startPwa } from './host/pwa.ts';
import { drawGameSelection } from './screens/GameSelectionScreen.tsx';
import { applyPreferences, resetThemeOnce } from './ui/preferences.ts';
import { ReactUI } from './ui/ReactUI.ts';
import { update } from './ui/store.ts';
import { uni } from './ui/text.ts';

forwardConsoleToDevLog();
devLog('page', location.href, navigator.userAgent);
// The service worker, and the browser's offer to install, which may come before the app has started
startPwa();

// Valkyrie's fatal errors (Application.Quit) stop the scenario with a message instead of closing the app
Application.onQuit((error) => update({ stop: { message: error.message, detail: error.component, kind: 'fatal' } }));

// Not in Valkyrie: the buttons' own sounds
installUiSounds();

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

// Game.Awake, then Game.Start: the game selection
boot(new ReactUI())
  .then((host) => {
    // The colour, felt and board's lean the player chose (config.ini), before the first screen
    resetThemeOnce();
    applyPreferences();
    drawGameSelection();
    if (host.storage === null) update({ notice: uni('STORAGE_OFF') });
    else if (host.backupProblem !== null) update({ notice: uni('BACKUP_NOT_FINISHED', host.backupProblem) });
  })
  .catch((error: unknown) => {
    console.error(error);
    update({ stop: { message: error instanceof Error ? error.message : String(error), detail: error instanceof Error ? (error.stack ?? '') : '', kind: 'boot' } });
  });
