// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/UI/Screens/ContentImportScreen.cs
// The import screen: the player gives Valkyrie's import folder, or a zip of it, and the app copies it into the
// browser. Its steps follow Valkyrie (Draw, OnBack, OnImportFromZip, OnImportComplete, ShowImportError,
// ShowImportSuccess); the drawing is the app's. Importing from the official app is not ported: the folder takes its
// card, on computers only, as Valkyrie leaves that card out on Android.
import { useState, type ChangeEvent } from 'react';
import { CommonStringKeys } from '@universalis/engine';
import type { ImportFailure } from '../host/officialImport.ts';
import { appleMobile, installed } from '../host/pwa.ts';
import { forgetPictures } from '../ui/Picture.tsx';
import { run } from '../ui/run.ts';
import { gameName, uni, val } from '../ui/text.ts';
import { drawGameSelection } from './GameSelectionScreen.tsx';
import { backToGame, type ImportResume } from './ImportGate.tsx';
import { ImportManager } from './ImportManager.ts';
import './ContentImportScreen.css';

type Step = { step: 'choose' } | { step: 'importing'; done: number; total: number } | { step: 'error'; message: string } | { step: 'done' };

/** Choosing a folder is for computers; phones and tablets give a zip. */
const FOLDERS = typeof matchMedia === 'function' && !matchMedia('(pointer: coarse)').matches;

function failureText(failure: ImportFailure): string {
  switch (failure.problem) {
    case 'no-import-ini':
      return uni('IMPORT_NO_INI');
    case 'raw-assets':
      return uni('IMPORT_RAW_ASSETS');
    case 'no-space': {
      const [need, free] = failure.detail.split('|');
      return uni('IMPORT_NO_SPACE', need ?? '', free ?? '');
    }
    case 'unreadable':
      return uni('IMPORT_UNREADABLE', failure.detail);
    case 'failed':
      return uni('IMPORT_FAILED', failure.detail);
  }
}

// Valkyrie: ContentImportScreen.cs ContentImportScreen
export function ContentImportScreen({ game, resume }: { game: string; resume?: ImportResume }) {
  const [state, setState] = useState<Step>({ step: 'choose' });
  const name = gameName(game);

  // Valkyrie: ContentImportScreen.cs ContentImportScreen.OnImportFromZip and OnImportComplete
  const start = (source: { folder: File[] } | { zip: File }) => {
    setState({ step: 'importing', done: 0, total: 0 });
    void ImportManager.importFrom(game, source, (done, total) => setState({ step: 'importing', done, total })).then((failure) => {
      forgetPictures();
      if (failure !== null) setState({ step: 'error', message: failureText(failure) });
      // Not in Valkyrie: an import it would ask to make again is not used, and the player is told why
      else if (ImportManager.needImport(game)) setState({ step: 'error', message: uni('IMPORT_OLD') });
      else setState({ step: 'done' });
    }, (e: unknown) => setState({ step: 'error', message: uni('IMPORT_FAILED', String(e)) }));
  };
  const onFolder = (e: ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.currentTarget.files ?? [])];
    e.currentTarget.value = '';
    if (files.length > 0) start({ folder: files });
  };
  const onZip = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    e.currentTarget.value = '';
    if (file !== undefined) start({ zip: file });
  };
  // Valkyrie: ContentImportScreen.cs ContentImportScreen.OnBack (not in Valkyrie: to the game, when asked for to play)
  const back = () => run(() => (resume === undefined ? drawGameSelection() : backToGame(game, resume)));

  return (
    <main className="screen content-import">
      <header className="screen-head">
        <h1>{val('IMPORT_SCREEN_TITLE')}</h1>
      </header>
      <p className="import-subtitle">{uni('IMPORT_SUBTITLE', name)}</p>
      {/* Not in Valkyrie: on an iPhone or iPad the installed app keeps its files apart from Safari's (host/pwa.ts) */}
      {state.step === 'choose' && appleMobile() && !installed() && <p className="import-install-first">{uni('IMPORT_INSTALL_FIRST')}</p>}

      {state.step === 'choose' && (
        <div className="import-cards">
          {FOLDERS && (
            <label className="import-card card">
              <span className="import-card-title">{uni('IMPORT_FROM_FOLDER')}</span>
              <span className="import-card-text">{uni('IMPORT_FOLDER_DESC', game)}</span>
              <input type="file" className="visually-hidden" ref={(input) => input?.setAttribute('webkitdirectory', '')} onChange={onFolder} />
            </label>
          )}
          <label className="import-card card">
            <span className="import-card-title">{val('IMPORT_FROM_ZIP')}</span>
            <span className="import-card-text">{uni('IMPORT_ZIP_DESC')}</span>
            <input type="file" className="visually-hidden" accept=".zip,application/zip" onChange={onZip} />
          </label>
        </div>
      )}

      {state.step === 'importing' && (
        <div className="import-progress" role="status">
          <p>{val('CONTENT_IMPORTING').split('\\n').join(' ')}</p>
          <progress max={Math.max(1, state.total)} value={state.done} />
          {state.total > 0 && <p className="quiet">{uni('IMPORT_PROGRESS', state.done, state.total)}</p>}
        </div>
      )}

      {/* Valkyrie: ContentImportScreen.cs ContentImportScreen.ShowImportError */}
      {state.step === 'error' && (
        <section className="window panel import-result" role="alert">
          <h2 className="import-error">{val('ERROR')}</h2>
          <p>{state.message}</p>
          <button type="button" className="button" onClick={back}>
            {CommonStringKeys.BACK.translate()}
          </button>
        </section>
      )}

      {/* Valkyrie: ContentImportScreen.cs ContentImportScreen.ShowImportSuccess */}
      {state.step === 'done' && (
        <section className="window panel import-result" role="status">
          <p>{val('IMPORT_SUCCESS')}</p>
          <button type="button" className="button primary" onClick={back}>
            {CommonStringKeys.CONTINUE.translate()}
          </button>
        </section>
      )}

      <footer className="screen-foot">
        {state.step === 'choose' && (
          <button type="button" className="button back" onClick={back}>
            {CommonStringKeys.BACK.translate()}
          </button>
        )}
      </footer>
    </main>
  );
}
