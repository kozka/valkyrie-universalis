// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/UI/Screens/OptionsScreen.cs
// Partial: the language (OpenLanguageSelection and SelectLang) and the sound (CreateAudioElements, UpdateMusic,
// UpdateEffects and PlayTestSound), and the advanced options' camera lock (AdvancedOptionsScreen.cs). Fallback language,
// resolution and the user folder come later. The drawing is the app's, and so are the languages' names
// (ui/languages.ts), the app's own options (ui/preferences.ts) and the backup (host/backup.ts).
import { useEffect, useState, type ReactNode } from 'react';
import { CommonStringKeys, Destroyer, Game, GameStateManager, LocalizationRead, NewLine, ValkyrieDebug, floatToString, floatTryParse } from '@universalis/engine';
import { audioPlayer } from '../audio/webAudio.ts';
import { downloadBackup, restoreBackup } from '../host/backup.ts';
import type { BackupReply } from '../host/backupWorker.ts';
import { languageCode, languageName } from '../ui/languages.ts';
import {
  FELTS,
  ITEM_SIZES,
  MONSTER_PLACES,
  PIECE_SIZES,
  TEXT_SIZES,
  THEMES,
  TILTS,
  felt,
  itemSize,
  monsterPlace,
  setMonsterPlace,
  pieceSize,
  resetOptions,
  setFelt,
  setItemSize,
  setPieceSize,
  setSwitch,
  setTextSize,
  setTheme,
  setTilt,
  switchOn,
  textSize,
  theme,
  tilt,
  type PieceSize,
  type TextSize,
  type Tilt,
  ownVolume,
  setOwnVolume,
} from '../ui/preferences.ts';
import { run } from '../ui/run.ts';
import { TranslateOptions } from '../ui/TranslateOptions.tsx';
import { VoiceOptions } from '../ui/VoiceOptions.tsx';
import { show, update, useUI } from '../ui/store.ts';
import { uni, val } from '../ui/text.ts';
import './OptionsScreen.css';

const TILT_TEXT: Record<Tilt, string> = { table: 'BOARD_TILT_TABLE', valkyrie: 'BOARD_TILT_VALKYRIE' };
const SIZE_TEXT: Record<TextSize, string> = { normal: 'SIZE_NORMAL', large: 'SIZE_LARGE', larger: 'SIZE_LARGER' };

// Valkyrie: OptionsScreen.cs OptionsScreen.OptionsScreen
export function openOptions(): void {
  Destroyer.destroy();
  show({ name: 'options' });
}

// Valkyrie: OptionsScreen.cs OptionsScreen.OpenLanguageSelection
const LANGUAGES = 'English,Spanish,French,German,Italian,Portuguese,Polish,Russian,Chinese,Korean,Czech,Japanese,Ukrainian'.split(',').sort();

/** Select current language to specified */
// Valkyrie: OptionsScreen.cs OptionsScreen.SelectLang (exported: a scenario's translation offers its language too)
export function selectLang(lang: string): void {
  const game = Game.get();
  const newLang = lang;

  // If fallback is the same as the new main language, reset it to None (it would be redundant)
  if (game.fallbackLang === newLang) {
    game.fallbackLang = '';
    game.config.data.add('UserConfig', 'fallbackLang', '');
  }

  game.config.data.add('UserConfig', 'currentLang', newLang);
  game.config.save();
  game.currentLang = newLang;
  LocalizationRead.changeCurrentLangTo(newLang);
  ValkyrieDebug.log('new current language stablished:' + newLang + NewLine);

  // new OptionsScreen() draws it again
  update();

  // clear list of local quests to make sure we take the latest changes
  Game.get().questsList.unloadLocalQuests();
}

/** A volume as the options read it from the user's config: 1 when it was never set. */
// Valkyrie: OptionsScreen.cs OptionsScreen.CreateAudioElements
function savedVolume(setting: string): number {
  const vSet = Game.get().config.data.get('UserConfig', setting);
  let volume = floatTryParse(vSet).value;
  if (vSet.length === 0) volume = 1;
  return volume;
}

// Valkyrie: OptionsScreen.cs OptionsScreen.UpdateMusic
function updateMusic(value: number): void {
  const game = Game.get();
  game.config.data.add('UserConfig', 'music', floatToString(value));
  game.config.save();
  // Not in Valkyrie: this one is the official import's music; a scenario's own has its volume (updateCustomMusic)
  audioPlayer().setMusicVolumes(value, ownVolume('customMusic'));
  update();
}

/** Not in Valkyrie: the volume of a scenario's or a pack's own music, apart from the import's. */
function updateCustomMusic(value: number): void {
  setOwnVolume('customMusic', value);
  audioPlayer().setMusicVolumes(savedVolume('music'), value);
}

// Valkyrie: OptionsScreen.cs OptionsScreen.UpdateEffects
function updateEffects(value: number): void {
  const game = Game.get();
  game.config.data.add('UserConfig', 'effects', floatToString(value));
  game.config.save();
  audioPlayer().effectVolume = value;
  update();
}

// Valkyrie: OptionsScreen.cs OptionsScreen.PlayTestSound
function playTestSound(): void {
  void audioPlayer().playTest();
}

export function OptionsScreen() {
  useUI((s) => s.revision);
  const current = Game.get().currentLang;
  return (
    <main className="screen options">
      <header className="screen-head">
        <h1>{val('OPTIONS')}</h1>
      </header>

      {/* Not as in Valkyrie: two columns where the screen is wide, the reading on the left and the look on the right */}
      <div className="options-columns">
        <div className="options-column">
          {/* Not as in Valkyrie, which shows the English names: each in the language being read, and in its own */}
          <Choices
            id="language"
            title={val('LANGUAGE')}
            choices={LANGUAGES.map((lang) => ({ lang, name: languageName(lang, current), own: languageName(lang, lang) }))
              .sort((a, b) => a.name.localeCompare(b.name, languageCode(current)))
              .map(({ lang, name, own }) => ({ value: lang, label: own !== name ? `${name} · ${own}` : name }))}
            chosen={current}
            choose={(lang) => selectLang(lang)}
          />

          {/* Not in Valkyrie: the size of the app's text (Valkyrie issue 1222) */}
          <TextSizeChoice />
          {/* Not in Valkyrie: bigger, bolder and darker for a television across the room (7 November 2026) */}
          <OnOff id="tv-mode" title={uni('TV_MODE')} on={switchOn('tvMode')} choose={(on) => setSwitch('tvMode', on)} />

          <Volumes menus />
        </div>

        {/* Not in Valkyrie: the app's theme, the felt under the board in a game, how far the board leans and how big its
            tokens are */}
        <div className="options-column" role="group" aria-label={uni('OPTIONS_LOOK')}>
          <Tones id="theme" title={uni('THEME')} tones={THEMES} chosen={theme()} choose={setTheme} />
          <Tones id="felt" title={uni('FELT')} tones={FELTS} chosen={felt()} choose={setFelt} />
          <Choices id="tilt" title={uni('BOARD_TILT')} choices={(Object.keys(TILTS) as Tilt[]).map((value) => ({ value, label: uni(TILT_TEXT[value]) }))} chosen={tilt()} choose={setTilt} />
          <ItemSizeChoice />
          <MonsterPlaceChoice />
          <Backup />
        </div>
      </div>

      <Advanced />

      <footer className="screen-foot">
        <button type="button" className="button back" onClick={() => run(() => GameStateManager.mainMenu())}>
          {val('BACK')}
        </button>
        <ResetOptions />
      </footer>
    </main>
  );
}

/**
 * Valkyrie's advanced options screen holds the camera lock (AdvancedOptionsScreen.CreateViewLockElements); the app adds
 * its own switches there, all off by default (ui/preferences.ts, docs/peticiones.md).
 */
function Advanced() {
  const [open, setOpen] = useState(false);
  return (
    <details className="option advanced" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        <h2>{val('ADVANCED_OPTIONS')}</h2>
      </summary>
      <p className="advanced-text">{uni('OPTIONS_ADVANCED_TEXT')}</p>
      <div className="advanced-switches">
        <PieceSizeChoice />
        <OnOff id="view-lock" title={val('VIEW_LOCK')} on={viewLocked()} choose={setViewLock} />
        <OnOff id="keep-zoom" title={uni('KEEP_ZOOM')} on={switchOn('keepZoom')} choose={(on) => setSwitch('keepZoom', on)} />
        <OnOff id="confirm-phase" title={uni('CONFIRM_PHASE')} on={switchOn('confirmPhase')} choose={(on) => setSwitch('confirmPhase', on)} />
        <OnOff id="hide-cursor" title={uni('HIDE_CURSOR')} on={switchOn('hideCursor')} choose={(on) => setSwitch('hideCursor', on)} />
        <OnOff id="horror-reminder" title={uni('HORROR_REMINDER')} on={switchOn('horrorReminder')} choose={(on) => setSwitch('horrorReminder', on)} />
        <OnOff id="blank-tiles" title={uni('BLANK_TILES')} on={switchOn('blankTiles')} choose={(on) => setSwitch('blankTiles', on)} />
        <OnOff id="auto-read" title={uni('AUTO_READ')} on={switchOn('autoRead')} choose={(on) => setSwitch('autoRead', on)} />
        <OnOff id="button-hints" title={uni('BUTTON_HINTS')} on={switchOn('buttonHints')} choose={(on) => setSwitch('buttonHints', on)} />
        <OnOff id="game-timer" title={uni('GAME_TIMER')} on={switchOn('gameTimer')} choose={(on) => setSwitch('gameTimer', on)} />
        <OnOff id="click-sound" title={uni('CLICK_SOUND')} on={switchOn('clickSound')} choose={(on) => setSwitch('clickSound', on)} />
        <OnOff id="scenario-faults" title={uni('SCENARIO_FAULTS')} on={switchOn('scenarioFaults')} choose={(on) => setSwitch('scenarioFaults', on)} />
        <OnOff id="buttons-apart" title={uni('BUTTONS_APART')} on={switchOn('buttonsApart')} choose={(on) => setSwitch('buttonsApart', on)} />
        <OnOff id="epic-spawns" title={uni('EPIC_SPAWNS')} on={switchOn('epicSpawns')} choose={(on) => setSwitch('epicSpawns', on)} />
      </div>
      <VoiceOptions />
      <TranslateOptions />
      <StorageInfo />
    </details>
  );
}

/** Not in Valkyrie: how much the browser keeps for the app, and whether it may clear it when short of room. */
function StorageInfo() {
  const storage = typeof navigator === 'undefined' ? undefined : navigator.storage;
  const [usage, setUsage] = useState<{ used: number; quota: number } | null>(null);
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [refused, setRefused] = useState(false);
  useEffect(() => {
    if (typeof storage?.estimate === 'function') {
      storage.estimate().then(
        ({ usage: used, quota }) => {
          if (used !== undefined && quota !== undefined) setUsage({ used, quota });
        },
        () => undefined,
      );
    }
    if (typeof storage?.persisted === 'function') storage.persisted().then(setPersisted, () => undefined);
  }, [storage]);
  if (usage === null && persisted === null) return null;
  const persist = () => {
    void storage!.persist().then(
      (granted) => {
        setPersisted(granted);
        setRefused(!granted);
      },
      () => setRefused(true),
    );
  };
  const mb = (bytes: number) => Math.round(bytes / 1048576);
  return (
    <section className="option storage-info" aria-labelledby="storage-label">
      <h2 id="storage-label">{uni('STORAGE')}</h2>
      {usage !== null && <p>{uni('STORAGE_USED', mb(usage.used), mb(usage.quota))}</p>}
      {persisted !== null && <p className="option-note">{uni(persisted ? 'STORAGE_PERSISTED' : 'STORAGE_NOT_PERSISTED')}</p>}
      {persisted === false && typeof storage?.persist === 'function' && (
        <button type="button" className="button" onClick={persist}>
          {uni('STORAGE_PERSIST')}
        </button>
      )}
      {refused && <p className="option-note">{uni('STORAGE_PERSIST_REFUSED')}</p>}
    </section>
  );
}

// Valkyrie: OptionsScreen.cs OptionsScreen.CreateAudioElements (the music and effects volumes)
// Not in Valkyrie: the music has two volumes, the official import's and a scenario's own (a player may want his own
// music instead of the game's, and still hear what an author put in), and the menus' sound has its own, in the options
export function Volumes({ menus = false }: { menus?: boolean }) {
  return (
    <section className="option volumes" aria-labelledby="sound-label">
      <h2 id="sound-label" className="visually-hidden">
        {val('MUSIC')}, {val('EFFECTS')}
      </h2>
      <label className="volume">
        <span>{uni('MUSIC_IMPORTED')}</span>
        <input type="range" min={0} max={1} step={0.01} value={savedVolume('music')} onChange={(e) => run(() => updateMusic(Number(e.currentTarget.value)))} />
      </label>
      <label className="volume">
        <span>{uni('MUSIC_CUSTOM')}</span>
        <input type="range" min={0} max={1} step={0.01} value={ownVolume('customMusic')} onChange={(e) => run(() => updateCustomMusic(Number(e.currentTarget.value)))} />
      </label>
      <label className="volume">
        <span>{val('EFFECTS')}</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={savedVolume('effects')}
          onChange={(e) => run(() => updateEffects(Number(e.currentTarget.value)))}
          onPointerUp={() => run(playTestSound)}
          onKeyUp={() => run(playTestSound)}
        />
      </label>
      {menus && (
        <label className="volume">
          <span>{uni('MENU_SOUND')}</span>
          <input type="range" min={0} max={1} step={0.01} value={ownVolume('menuSound')} onChange={(e) => run(() => setOwnVolume('menuSound', Number(e.currentTarget.value)))} />
        </label>
      )}
    </section>
  );
}

/** Not in Valkyrie: puts back the default options, once the player confirms (preferences.ts resetOptions). */
function ResetOptions() {
  const [asking, setAsking] = useState(false);
  const reset = () => {
    setAsking(false);
    run(() => {
      resetOptions();
      // Valkyrie's volumes are 1 when never set (CreateAudioElements)
      audioPlayer().setMusicVolumes(1, 1);
      audioPlayer().effectVolume = 1;
    });
  };
  return (
    <>
      <button type="button" className="button" onClick={() => setAsking(true)}>
        {uni('OPTIONS_RESET')}
      </button>
      {asking && (
        <div className="window-layer">
          <section className="window panel reset-confirm" role="alertdialog" aria-labelledby="reset-confirm-text">
            <p id="reset-confirm-text">{uni('OPTIONS_RESET_CONFIRM')}</p>
            <div className="choices">
              <button type="button" className="button primary" onClick={reset}>
                {uni('OPTIONS_RESET')}
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

/** Not in Valkyrie: the size of the app's text. */
export function TextSizeChoice() {
  return (
    <Choices
      id="text-size"
      title={val('TEXT_SIZE')}
      choices={(Object.keys(TEXT_SIZES) as TextSize[]).map((value) => ({ value, label: uni(SIZE_TEXT[value]) }))}
      chosen={textSize()}
      choose={setTextSize}
    />
  );
}

/** Not in Valkyrie: the items' pictures in the windows, small as Valkyrie's or large with the name beside them. */
export function ItemSizeChoice() {
  return (
    <Choices id="item-size" title={uni('ITEM_SIZE')} choices={ITEM_SIZES.map((value) => ({ value, label: uni(value === 'large' ? 'SIZE_LARGE' : 'SIZE_NORMAL') }))} chosen={itemSize()} choose={setItemSize} />
  );
}

/** Not in Valkyrie: the monsters' list on the right, as Valkyrie, or along the bottom, as the official app. */
export function MonsterPlaceChoice() {
  return (
    <Choices
      id="monster-place"
      title={uni('MONSTER_PLACE')}
      choices={MONSTER_PLACES.map((value) => ({ value, label: uni(value === 'bottom' ? 'MONSTER_PLACE_BOTTOM' : 'MONSTER_PLACE_RIGHT') }))}
      chosen={monsterPlace()}
      choose={setMonsterPlace}
    />
  );
}

/** Not in Valkyrie: the tokens on the board, as the scenario places them or 30 % bigger. */
export function PieceSizeChoice() {
  return (
    <Choices
      id="piece-size"
      title={uni('PIECE_SIZE')}
      choices={(Object.keys(PIECE_SIZES) as PieceSize[]).map((value) => ({ value, label: uni(value === 'large' ? 'PIECE_SIZE_LARGE' : 'SIZE_NORMAL') }))}
      chosen={pieceSize()}
      choose={setPieceSize}
    />
  );
}

/** One of the advanced switches, with Valkyrie's ON and OFF. */
/** Not in Valkyrie (12 November 2026): an option that is on or off, a switch on its line. */
export function OnOff({ id, title, on, choose, disabled = false }: { id: string; title: string; on: boolean; choose: (on: boolean) => void; disabled?: boolean }) {
  return (
    <section className="option option-line">
      <label htmlFor={id}>{title}</label>
      <input id={id} type="checkbox" role="switch" className="switch" checked={on} disabled={disabled} onChange={(e) => run(() => choose(e.target.checked))} />
    </section>
  );
}

/** A setting with a few choices, the chosen one lit. */
/** Not in Valkyrie (12 November 2026): a choice among several, in a drop-down list, so that each option takes one line. */
export function Choices<T extends string>({ id, title, choices, chosen, choose, before }: { id: string; title: string; choices: { value: T; label: string }[]; chosen: T; choose: (value: T) => void; before?: ReactNode }) {
  return (
    <section className="option option-line">
      <label htmlFor={id}>{title}</label>
      <span className="option-control">
        {before}
        <span className="select">
          <select id={id} value={chosen} onChange={(e) => run(() => choose(e.target.value as T))}>
            {choices.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </span>
      </span>
    </section>
  );
}

// Valkyrie: AdvancedOptionsScreen.cs AdvancedOptionsScreen.CreateViewLockElements
function viewLocked(): boolean {
  return Game.get().config.data.get('UserConfig', 'viewLock') === '1';
}

function setViewLock(on: boolean): void {
  const game = Game.get();
  game.config.data.add('UserConfig', 'viewLock', on ? '1' : '0');
  game.config.save();
  update();
}

/** Not in Valkyrie: the themes of the app or the felts, with a square of the one chosen. */
function Tones<T extends string>({ id, title, tones, chosen, choose }: { id: string; title: string; tones: readonly T[]; chosen: T; choose: (tone: T) => void }) {
  return (
    <Choices
      id={id}
      title={title}
      choices={tones.map((t) => ({ value: t, label: uni(`COLOUR_${t.toUpperCase()}`) }))}
      chosen={chosen}
      choose={choose}
      before={<span className="swatch" data-tone={chosen} aria-hidden="true" />}
    />
  );
}

type BackupStep =
  | { step: 'idle' }
  | { step: 'working'; text: string; done: number; total: number }
  | { step: 'made'; megabytes: number }
  | { step: 'confirm'; zip: globalThis.File }
  | { step: 'problem'; message: string }
  // Put back but not in its place yet: nothing more until the app starts again
  | { step: 'reload'; message: string };

function problemText(reply: Extract<BackupReply, { kind: 'problem' }>): string {
  switch (reply.problem) {
    case 'not-a-backup':
      return uni('BACKUP_NOT_ONE');
    case 'no-space': {
      const [need, free] = reply.detail.split('|');
      return uni('IMPORT_NO_SPACE', need ?? '', free ?? '');
    }
    case 'unreadable':
      return uni('BACKUP_UNREADABLE', reply.detail);
    case 'unfinished':
      return uni('BACKUP_UNFINISHED');
    case 'failed':
      return uni('BACKUP_FAILED', reply.detail);
  }
}

/** Not in Valkyrie: a copy of what the app keeps in this browser, to download and to put back (host/backup.ts). */
function Backup() {
  const [state, setState] = useState<BackupStep>({ step: 'idle' });
  const working = state.step === 'working';
  const download = () => {
    const progress = (done: number, total: number) => setState({ step: 'working', text: 'BACKUP_MAKING', done, total });
    progress(0, 0);
    void downloadBackup(progress).then(
      (reply) =>
        setState(reply.kind === 'made' ? { step: 'made', megabytes: Math.max(1, Math.round(reply.bytes / 1048576)) } : reply.kind === 'problem' ? { step: 'problem', message: problemText(reply) } : { step: 'idle' }),
      (e: unknown) => setState({ step: 'problem', message: uni('BACKUP_FAILED', String(e)) }),
    );
  };
  const restore = (zip: globalThis.File) => {
    const progress = (done: number, total: number) => setState({ step: 'working', text: 'BACKUP_RESTORING', done, total });
    progress(0, 0);
    void restoreBackup(zip, progress).then((reply) => {
      // The app starts again, with what the backup kept
      if (reply.kind === 'restored') location.reload();
      else if (reply.kind === 'problem') setState({ step: reply.problem === 'unfinished' ? 'reload' : 'problem', message: problemText(reply) });
    }, (e: unknown) => setState({ step: 'problem', message: uni('BACKUP_FAILED', String(e)) }));
  };
  const busy = working || state.step === 'reload';
  return (
    <section className="option backup" aria-labelledby="backup-label">
      <h2 id="backup-label">{uni('BACKUP')}</h2>
      <p className="backup-text">{uni('BACKUP_TEXT')}</p>
      <div className="choices">
        <button type="button" className="button" disabled={busy} onClick={download}>
          {uni('BACKUP_DOWNLOAD')}
        </button>
        <label className={`button ${busy ? 'disabled' : ''}`}>
          {uni('BACKUP_RESTORE')}
          <input
            type="file"
            className="visually-hidden"
            accept=".zip,application/zip"
            disabled={busy}
            onChange={(e) => {
              const zip = e.currentTarget.files?.[0];
              e.currentTarget.value = '';
              if (zip !== undefined) setState({ step: 'confirm', zip });
            }}
          />
        </label>
      </div>
      {/* Over the whole screen while it works: nothing the player does meanwhile could be kept */}
      {state.step === 'working' && (
        <div className="window-layer">
          <section className="window panel backup-working" role="status">
            <p>{uni(state.text, state.done, state.total)}</p>
            <progress max={Math.max(1, state.total)} value={state.done} />
          </section>
        </div>
      )}
      {state.step === 'reload' && (
        <div className="backup-confirm card" role="alert">
          <p>{state.message}</p>
          <button type="button" className="button primary" onClick={() => location.reload()}>
            {uni('RELOAD_APP')}
          </button>
        </div>
      )}
      {state.step === 'made' && (
        <p className="backup-status" role="status">
          {uni('BACKUP_MADE', state.megabytes)}
        </p>
      )}
      {state.step === 'problem' && (
        <p className="backup-status problem" role="alert">
          {state.message}
        </p>
      )}
      {state.step === 'confirm' && (
        <div className="backup-confirm card" role="alertdialog" aria-labelledby="backup-confirm-text">
          <p id="backup-confirm-text">{uni('BACKUP_CONFIRM', state.zip.name)}</p>
          <div className="choices">
            <button type="button" className="button primary" onClick={() => restore(state.zip)}>
              {uni('BACKUP_RESTORE_GO')}
            </button>
            <button type="button" className="button" onClick={() => setState({ step: 'idle' })}>
              {CommonStringKeys.CANCEL.translate()}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
