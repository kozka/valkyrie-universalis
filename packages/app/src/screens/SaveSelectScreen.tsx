// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/UI/Screens/SaveSelectScreen.cs
// The saved games: one to continue from the main menu, or a slot to save in from the game menu (the first is the
// autosave, which the game menu does not offer). Its logic follows Valkyrie; the drawing is the app's.
import { useEffect, useState } from 'react';
import { CommonStringKeys, Destroyer, Game, GameStateManager, SaveData, SaveManager } from '@universalis/engine';
import { eachKeptFile, startingFromKeptFiles } from '../host/storage.ts';
import { enterFullscreen } from '../ui/fullscreen.ts';
import { run } from '../ui/run.ts';
import { openWindow, show } from '../ui/store.ts';
import { val } from '../ui/text.ts';
import './SaveSelectScreen.css';
import { RichText } from '../ui/RichText.tsx';
import { canPlayGame, ImportGate } from './ImportGate.tsx';

// Valkyrie: SaveSelectScreen.cs SaveSelectScreen.SaveSelectScreen
export function openSaveSelect(performSave = false): void {
  const save = performSave;
  if (!save) {
    // This will destroy all, because we shouldn't have anything left at the main menu
    Destroyer.destroy();
  }

  // SaveManager.GetSaves, with each save read from storage in turn, as they stay there until listed (host/storage.ts)
  const saves: SaveData[] = [];
  void eachKeptFile(
    [0, 1, 2, 3].map((num) => SaveManager.getSaveFilePath(num)),
    (_, num) => run(() => saves.push(new SaveData(num))),
  ).then(() =>
    run(() => {
      // Create elements for the screen
      if (save) openWindow({ kind: 'saves', tag: Game.DIALOG, saves });
      else show({ name: 'saves', saves });
    }),
  );
}

// Valkyrie: SaveSelectScreen.cs SaveSelectScreen.Select
function select(save: boolean, saves: SaveData[], num: number): void {
  if (save) {
    SaveManager.save(num);
    Destroyer.dialog();
  } else {
    if (saves[num]!.valid) {
      void startingFromKeptFiles([SaveManager.getSaveFilePath(num)], () => run(() => SaveManager.load(num)));
    }
  }
}

/** The picture of the board kept with the save. */
function SavePicture({ data }: { data: Uint8Array }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const made = URL.createObjectURL(new Blob([data.slice()], { type: 'image/png' }));
    setUrl(made);
    return () => URL.revokeObjectURL(made);
  }, [data]);
  return url === null ? null : <img className="save-picture" src={url} alt="" draggable={false} />;
}

function slotName(i: number): string {
  return i === 0 ? val('AUTOSAVE') : val('SAVE') + ' ' + i;
}

// Valkyrie: SaveSelectScreen.cs SaveSelectScreen.CreateElements
function SaveList({ save, saves, askImport }: { save: boolean; saves: SaveData[]; askImport?: () => void }) {
  const time = new Intl.DateTimeFormat(document.documentElement.lang || undefined, { dateStyle: 'medium', timeStyle: 'short' });
  return (
    <ul className="save-list">
      {saves.map((s, i) => {
        if (i === 0 && save) return null;
        return (
          <li key={i}>
            <button
              type="button"
              className={`save-slot ${s.valid ? '' : 'free'}`}
              disabled={!s.valid && !save}
              onClick={() => {
                // Not in Valkyrie: going on with a game needs its import, as starting one does (ImportGate.tsx)
                if (!save && !canPlayGame()) return askImport?.();
                if (!save) enterFullscreen();
                run(() => select(save, saves, i));
              }}
            >
              {s.valid && s.imageData !== null && <SavePicture data={s.imageData} />}
              <span className="save-name">{slotName(i)}</span>
              {s.valid && (
                <>
                  <span className="save-time">{time.format(s.saveTime)}</span>
                  <span className="save-quest">
                    <RichText text={s.quest_name} />
                  </span>
                </>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** From the main menu: continue a saved game. */
export function SaveSelectScreen({ saves }: { saves: SaveData[] }) {
  const [askImport, setAskImport] = useState(false);
  return (
    <main className="screen saves">
      <header className="screen-head">
        <h1>{val('SELECT_SAVE')}</h1>
      </header>
      <SaveList save={false} saves={saves} askImport={() => setAskImport(true)} />
      <footer className="screen-foot">
        <button type="button" className="button back" onClick={() => run(() => GameStateManager.mainMenu())}>
          {CommonStringKeys.BACK.translate()}
        </button>
      </footer>
      {askImport && <ImportGate scenario={null} close={() => setAskImport(false)} />}
    </main>
  );
}

/** From the game menu: save in a slot. */
export function SaveSelectWindow({ saves }: { saves: SaveData[] }) {
  return (
    <div className="window-layer">
      <section className="window panel saves-window" role="dialog" aria-modal="true" aria-labelledby="saves-title">
        <h2 id="saves-title">{val('SELECT_SAVE')}</h2>
        <SaveList save saves={saves} />
        <button type="button" className="button" onClick={() => run(() => Destroyer.dialog())}>
          {CommonStringKeys.CANCEL.translate()}
        </button>
      </section>
    </div>
  );
}
