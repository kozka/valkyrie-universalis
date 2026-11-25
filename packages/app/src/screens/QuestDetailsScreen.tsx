// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/UI/Screens/QuestDetailsScreen.cs
// A scenario before it starts: its picture, description, authors, difficulty and duration, with Back, Start and, for
// a downloaded package, Delete. The logic follows Valkyrie; the drawing is the app's.
import { useState } from 'react';
import {
  CommonStringKeys,
  ContentData,
  Destroyer,
  Directory,
  File,
  Game,
  GameStateManager,
  LocalizationRead,
  Path,
  ValkyrieConstants,
  ValkyrieDebug,
  type QuestData,
} from '@universalis/engine';
import { startingFromKeptFiles } from '../host/storage.ts';
import { enterFullscreen } from '../ui/fullscreen.ts';
import { Picture } from '../ui/Picture.tsx';
import { MarkButtons } from '../ui/MarkButtons.tsx';
import { rememberStarted } from '../ui/marks.ts';
import { plainText, RichText } from '../ui/RichText.tsx';
import { run } from '../ui/run.ts';
import { show, useUI } from '../ui/store.ts';
import { uni, val } from '../ui/text.ts';
import { Difficulty } from './Difficulty.tsx';
import { canPlayGame, ImportGate } from './ImportGate.tsx';
import { openQuestSelection } from './QuestSelectionScreen.tsx';
import { QuestTilesButton } from './QuestTiles.tsx';
import { QuestHealth } from './QuestHealth.tsx';
import { clearGameNotes } from '../play/notes.ts';
import { CustomTranslationButton } from './CustomTranslation.tsx';
import { translationFile } from '../host/customTranslation.ts';
import { newScreens } from '../themes/themes.ts';
import { Library } from '../themes/universalis/Library.tsx';
import '../themes/universalis/scenarios.css';
import './QuestDetailsScreen.css';

// Valkyrie: QuestDetailsScreen.cs QuestDetailsScreen.QuestDetailsScreen
export function openQuestDetails(q: QuestData.Quest | null): void {
  if (q === null) {
    ValkyrieDebug.log('ERROR: QuestDetailsScreen received null quest, returning to quest list');
    GameStateManager.Quest.list();
    return;
  }

  LocalizationRead.removeDictionary('qst');
  LocalizationRead.addDictionary('qst', q.localizationDict);
  // If a dialog window is open we force it closed (this shouldn't happen)
  Game.get().ui.destroyTag(Game.DIALOG);

  show({ name: 'quest-details', quest: q });
}

function isPackage(q: QuestData.Quest): boolean {
  return Path.getExtension(Path.getFileName(q.path) ?? '') === ValkyrieConstants.ScenarioDownloadContainerExtension;
}

/** Select to delete */
// Valkyrie: QuestDetailsScreen.cs QuestDetailsScreen.Delete
function deleteQuest(q: QuestData.Quest): void {
  ValkyrieDebug.log('INFO: Delete quest');

  const game = Game.get();
  if (isPackage(q)) {
    const toDelete = ContentData.downloadPath() + Path.DirectorySeparatorChar + Path.getFileName(q.path);
    File.delete(toDelete);

    // update quest status : downloaded/updated
    game.questsList.setQuestAvailability(Path.getFileNameWithoutExtension(q.path), false);
  } else {
    // this is not an archive, it is a local quest within a directory
    Directory.delete(q.path, true);

    game.questsList.unloadLocalQuests();
  }

  Destroyer.dialog();

  // Pull up the quest selection page
  openQuestSelection();
}

// Valkyrie: QuestDetailsScreen.cs QuestDetailsScreen.ReportIssue
function reportIssue(q: QuestData.Quest): void {
  if (q.package_url.length === 0) return;
  const url = q.package_url.replace('https://raw.githubusercontent.com', 'https://github.com');
  const parts = url.split('/');
  if (parts.length >= 5 && parts[2]!.includes('github.com')) {
    window.open(`${parts[0]}//${parts[2]}/${parts[3]}/${parts[4]}/issues`, '_blank', 'noopener');
  }
}

/** Not in Valkyrie, which deletes at once: a tap by mistake on a phone would mean downloading it all again. */
function DeleteButton({ quest, name }: { quest: QuestData.Quest; name: string }) {
  const [asking, setAsking] = useState(false);
  return (
    <>
      <button type="button" className="button back delete" onClick={() => setAsking(true)}>
        {val('DELETE')}
      </button>
      {asking && (
        <div className="window-layer">
          <section className="window panel delete-confirm" role="alertdialog" aria-labelledby="delete-confirm-text">
            <p id="delete-confirm-text">{uni('DELETE_SCENARIO_CONFIRM', name)}</p>
            <div className="choices">
              <button
                type="button"
                className="button primary"
                onClick={() => {
                  setAsking(false);
                  run(() => deleteQuest(quest));
                }}
              >
                {val('DELETE')}
              </button>
              <button type="button" className="button" onClick={() => setAsking(false)}>
                {CommonStringKeys.CANCEL.translate()}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export function QuestDetailsScreen({ quest: q }: { quest: QuestData.Quest }) {
  useUI((s) => s.revision);
  const [askImport, setAskImport] = useState(false);
  const title = q.name.translate();
  const name = plainText(title);
  // Not in Valkyrie (17 October 2026): Universalis' details for Mansions stand in kozka's library, its candles lit
  const library = newScreens() && Game.get().gameType.typeName() === ValkyrieConstants.typeMom;
  return (
    <main className="screen quest-details">
      {library && <Library />}
      <header className="screen-head">
        <h1>
          <RichText text={title} />
        </h1>
        {q.package_url.includes('github') && (
          <button type="button" className="button report-issue" onClick={() => reportIssue(q)}>
            {val('REPORT_ISSUE')}
          </button>
        )}
        {isPackage(q) && <DeleteButton quest={q} name={name} />}
      </header>

      <div className="details">
        {q.image.length > 0 && (
          <div className="photo">
            <Picture file={Path.combine(q.path, q.image)} name={name} />
          </div>
        )}
        <div className="details-text">
          {/* Not in Valkyrie: the player's marks (ui/marks.ts) */}
          <div className="details-actions">
            <MarkButtons identifier={q.identifier} />
            {/* Not in Valkyrie: the tiles the scenario uses, behind a spoiler warning (QuestTiles.tsx) */}
            <QuestTilesButton quest={q} />
            {/* Not in Valkyrie: the player's own translation of the scenario (CustomTranslation.tsx) */}
            <CustomTranslationButton quest={q} />
          </div>
          {/* Not in Valkyrie: a word when the author left a mistake that stops a game (QuestHealth.tsx) */}
          <QuestHealth quest={q} />
          <div className="card description">
            <RichText text={q.description.translate()} links />
          </div>
          <dl className="details-facts">
            {q.difficulty !== 0 && (
              <div data-fact="difficulty">
                <dt>{val('DIFFICULTY').replace(/:$/, '')}</dt>
                <dd>
                  <Difficulty value={q.difficulty} />
                </dd>
              </div>
            )}
            {q.lengthMax !== 0 && (
              <div data-fact="duration">
                <dt>{val('DURATION').replace(/:$/, '')}</dt>
                <dd>{`${q.lengthMin}–${q.lengthMax}`}</dd>
              </div>
            )}
            <div className="authors">
              <dt>{val('AUTHORS')}</dt>
              <dd>
                <RichText text={q.authors.translate()} links />
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <footer className="screen-foot">
        <button type="button" className="button back" onClick={() => run(() => GameStateManager.Quest.list())}>
          {val('BACK')}
        </button>
        <button
          type="button"
          className="button primary"
          onClick={() => {
            // Not in Valkyrie: a game without its import is only looked at, and playing asks for it (ImportGate.tsx)
            if (!canPlayGame()) {
              setAskImport(true);
              return;
            }
            enterFullscreen();
            rememberStarted(q.identifier);
            // Not in Valkyrie: a new game's notes start empty (play/notes.ts)
            clearGameNotes();
            // Not in Valkyrie: a downloaded package stays on disk until Game.StartQuest extracts it (host/storage.ts)
            const name = Path.getFileName(q.path) ?? '';
            const packages = Path.getExtension(name) === ValkyrieConstants.ScenarioDownloadContainerExtension ? [Path.combine(ContentData.downloadPath(), name)] : [];
            // Not in Valkyrie: the player's own translation into the language being played, read with it
            const translation = translationFile(q.identifier, Game.get().currentLang);
            if (packages.length > 0 && File.exists(translation)) packages.push(translation);
            void startingFromKeptFiles(packages, () => run(() => GameStateManager.Quest.start(q)));
          }}
        >
          {val('START')}
        </button>
      </footer>
      {askImport && <ImportGate scenario={q.identifier} close={() => setAskImport(false)} />}
    </main>
  );
}
