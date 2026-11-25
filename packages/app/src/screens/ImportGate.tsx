// Not in Valkyrie (6 November 2026), where a game without its official import cannot be chosen: here it opens, so that
// its menus, scenarios and collection can be looked at, and the import is asked for only to play, when a scenario
// starts (before the investigators or heroes are chosen) or a saved game goes on. After the import, or without it, the
// player comes back to the game and to the scenario they were starting.
import { CommonStringKeys, Destroyer, Game, ValkyrieConstants } from '@universalis/engine';
import { schematicMode } from '../host/officialImport.ts';
import { run } from '../ui/run.ts';
import { show } from '../ui/store.ts';
import { gameName, uni, val } from '../ui/text.ts';
import { playingDoom } from './doom.ts';
import { d2e, mom } from './GameSelectionScreen.tsx';
import { ImportManager } from './ImportManager.ts';
import { openScenarioWhenListed } from './QuestSelectionScreen.tsx';
import './ImportGate.css';

/** Where the import screen goes back to when it was asked for to play: the game, and the scenario being started. */
export interface ImportResume {
  doom: boolean;
  scenario: string | null;
}

/** Whether a game can be played: with its import, or in the tests' schematic mode. */
export function canPlay(type: string): boolean {
  return !ImportManager.needImport(type) || schematicMode();
}

/** Whether the game being looked at can be played now. */
export function canPlayGame(): boolean {
  return canPlay(Game.get().gameType.typeName());
}

/** Back to the game, read again with its import, and to the scenario's details when one was being started. */
export function backToGame(type: string, resume: ImportResume): void {
  if (resume.doom || type === ValkyrieConstants.typeDescent) d2e(resume.doom);
  else mom();
  if (resume.scenario === null) return;
  openScenarioWhenListed(resume.scenario);
  Destroyer.dialog();
  Game.get().selectQuest();
}

/** Asks for the game's import before it is played; `scenario` is the one being started, if any. */
export function ImportGate({ scenario, close }: { scenario: string | null; close: () => void }) {
  const type = Game.get().gameType.typeName();
  return (
    <div className="window-layer" onKeyDown={(e) => e.key === 'Escape' && close()}>
      <section className="window panel import-gate" role="alertdialog" aria-labelledby="import-gate-text">
        <p id="import-gate-text">{uni('IMPORT_TO_PLAY', gameName(type))}</p>
        <div className="choices">
          {ImportManager.canImport() && (
            <button type="button" className="button primary" autoFocus onClick={() => run(() => show({ name: 'content-import', game: type, resume: { doom: playingDoom(), scenario } }))}>
              {val('IMPORT_GAME_DATA')}
            </button>
          )}
          <button type="button" className="button" onClick={close}>
            {CommonStringKeys.CANCEL.translate()}
          </button>
        </div>
      </section>
    </div>
  );
}
