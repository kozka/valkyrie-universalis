// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/QuestEditSelection.cs
// The scenario editor's first screen: the scenarios of the Editor folder, to open, copy, delete or start anew, and, not
// in Valkyrie, to import from a file or a folder and to export. Not in Valkyrie either: a campaign's adventures, which
// Valkyrie lists as scenarios of their own, under their campaign, with a new one made there (campaign.ts); and DooM's
// missions edited under DooM's button only, a new one there asking for its pack (screens/doom.ts). What each choice
// does to the files is the engine's (QuestEditor/QuestEditSelection.ts); the drawing is the app's. Only in
// development builds until kozka says the editor is ready, or open to try (packages/app/editorPreview.ts): App.tsx
// loads it apart, so otherwise the built app has none of it.
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  Application,
  CommonStringKeys,
  ContentData,
  Destroyer,
  Directory,
  ExtractManager,
  File,
  Game,
  GameStateManager,
  LocalizationRead,
  NewLine,
  Path,
  QuestData,
  QuestEditSelection,
  SearchOption,
  ValkyrieConstants,
  ValkyrieDebug,
  type QuestEditorHistory,
} from '@universalis/engine';
import { folderFiles, zipFiles } from '../host/importSource.ts';
import { DOOM_PACK, isDoomQuest, playingDoom } from '../screens/doom.ts';
import { listingKeptFiles, listingPackages } from '../host/storage.ts';
import { run } from '../ui/run.ts';
import { update } from '../ui/store.ts';
import { uni, val } from '../ui/text.ts';
import { byCampaign, type Adventure } from './campaign.ts';
import { go, say, setFilter, useEditor } from './editorState.ts';
import { exportScenario, importScenario } from './files.ts';
import { QuestView } from './QuestView.tsx';
import { beginSession } from './session.ts';
import { edi } from './text.ts';
import './EditorScreen.css';

/** A scenario's name in its own texts, as Valkyrie's lists read it (with the scenario's dictionary as 'qst'). */
function questName(q: QuestData.Quest): string {
  LocalizationRead.removeDictionary('qst');
  LocalizationRead.addDictionary('qst', q.localizationDict);
  return q.name.translate();
}

/** Not in Valkyrie: DooM's missions are edited under DooM's button only, and Descent's other scenarios under Descent's. */
function apart(quest: QuestData.Quest): boolean {
  return Game.get().gameType.typeName() === ValkyrieConstants.typeDescent && isDoomQuest(quest.packs) !== playingDoom();
}

interface Listed {
  key: string;
  quest: QuestData.Quest;
  name: string;
}

/**
 * The quests of a list that match a search, by their translated names (QuestEditSelection.PerformEditSearch), each
 * campaign with its adventures, which match through its name or theirs; and how many campaigns are left out as DooM's
 * or Descent's, which the campaign's own quest decides.
 */
function matching(list: Map<string, QuestData.Quest>, filter: string): { found: { entry: Listed; adventures: Adventure[] }[]; apart: number } {
  const all: Listed[] = [...list].map(([key, quest]) => ({ key, quest, name: questName(quest) }));
  const needle = filter.toLowerCase();
  const found: { entry: Listed; adventures: Adventure[] }[] = [];
  let away = 0;
  for (const row of byCampaign(all)) {
    if (apart(row.entry.quest)) {
      away++;
      continue;
    }
    if (needle !== '' && !row.entry.name.toLowerCase().includes(needle) && !row.adventures.some((a) => a.name.toLowerCase().includes(needle))) continue;
    found.push(row);
  }
  return { found, apart: away };
}

/** How many scenarios this list leaves out, which are edited from the other button: DooM's or Descent's. */
function Apart({ count }: { count: number }) {
  if (count === 0) return null;
  return <p className="quiet">{edi(playingDoom() ? 'EDITOR_APART_DESCENT' : 'EDITOR_APART_DOOM', count)}</p>;
}

function DevBanner() {
  return <p className="editor-dev">{edi(__EDITOR_PREVIEW__ ? 'EDITOR_PREVIEW_NOTE' : 'EDITOR_DEV_ONLY')}</p>;
}

function Message() {
  const message = useEditor((s) => s.message);
  if (message === null) return null;
  return (
    <p className="editor-message" role="status">
      {message}
    </p>
  );
}

function Search({ which }: { which: 'editFilter' | 'copyFilter' }) {
  const value = useEditor((s) => s[which]);
  return (
    <input
      className="editor-search"
      type="search"
      value={value}
      placeholder={val('SEARCH_BY_NAME')}
      aria-label={val('SEARCH_BY_NAME')}
      onChange={(e) => setFilter(which, e.target.value)}
    />
  );
}

/** The scenarios the player gave the app to import: a .valkyrie or a zip, or a folder. */
async function importGiven(files: FileList | null, folder: boolean): Promise<void> {
  if (files === null || files.length === 0) return;
  const given = [...files];
  const label = folder ? ((given[0] as File & { webkitRelativePath?: string }).webkitRelativePath ?? '').split('/')[0] || given[0]!.name : given[0]!.name;
  try {
    const sources = folder ? folderFiles(given) : await zipFiles(given[0]!);
    const imported = await importScenario(sources, given[0]!.name);
    run(() => say(imported === null ? edi('EDITOR_IMPORT_NO_QUEST', label) : edi('EDITOR_IMPORTED', imported)));
  } catch (e) {
    run(() => say(edi('EDITOR_IMPORT_FAILED', label, e instanceof Error ? e.message : String(e))));
  }
}

/** More adventures than this are folded (The Lost Expedition's packages have a hundred maps). */
const FOLDED_ADVENTURES = 12;

/** A campaign's adventures, to open each, under its row. */
function Adventures({ campaign, adventures }: { campaign: string; adventures: Adventure[] }) {
  const list = (
    <ul aria-label={edi('EDITOR_ADVENTURES_OF', campaign)}>
      {adventures.map((a) => (
        <li key={a.path}>
          <button type="button" className="button" title={edi('EDITOR_FOLDER', a.folder)} onClick={() => run(() => openQuest(a.path))}>
            {a.name}
          </button>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="editor-adventures">
      {adventures.length > FOLDED_ADVENTURES ? (
        <details>
          <summary className="quiet">{edi('EDITOR_ADVENTURES_N', adventures.length)}</summary>
          {list}
        </details>
      ) : (
        <>
          <span className="quiet">{edi('EDITOR_ADVENTURES')}</span>
          {list}
        </>
      )}
    </div>
  );
}

function QuestRow({ entry, adventures, selection }: { entry: Listed; adventures: Adventure[]; selection: QuestEditSelection }) {
  const [confirming, setConfirming] = useState(false);
  const folder = Path.getFileName(entry.quest.path);
  return (
    <li className="editor-row">
      <button type="button" className="editor-open" onClick={() => run(() => openQuest(entry.quest.path))}>
        <span className="editor-name">{entry.name}</span>
        <span className="editor-folder quiet">{edi('EDITOR_FOLDER', folder)}</span>
      </button>
      {confirming ? (
        <span className="editor-confirm" role="alert">
          <span>{edi('EDITOR_DELETE_CONFIRM', entry.name)}</span>
          <button
            type="button"
            className="button back"
            onClick={() =>
              run(() => {
                selection.delete(entry.key);
                say(edi('EDITOR_DELETED', entry.name));
              })
            }
          >
            {CommonStringKeys.DELETE.translate()}
          </button>
          <button type="button" className="button" onClick={() => setConfirming(false)}>
            {CommonStringKeys.CANCEL.translate()}
          </button>
        </span>
      ) : (
        <span className="editor-row-tools">
          <button type="button" className="button" onClick={() => run(() => go({ name: 'new', campaign: entry.quest.path }))}>
            {edi('EDITOR_NEW_ADVENTURE')}
          </button>
          <button type="button" className="button" onClick={() => run(() => exportScenario(entry.quest.path))}>
            {edi('EDITOR_EXPORT')}
          </button>
          <button type="button" className="button back" onClick={() => setConfirming(true)}>
            {CommonStringKeys.DELETE.translate()}
          </button>
        </span>
      )}
      {/* Not in Valkyrie, which lists them apart, each as a scenario */}
      {adventures.length > 0 && <Adventures campaign={entry.name} adventures={adventures} />}
    </li>
  );
}

/**
 * Opens a scenario in the editor (QuestEditSelection.Selection), with a new history or, after a test, the one it had.
 * Not in Valkyrie: one that Valkyrie's editor cannot load (it stops, or throws) is shown with what the checks find
 * instead of stopping the app.
 */
export function openQuest(path: string, history?: QuestEditorHistory): void {
  ValkyrieDebug.log('INFO: Select quest ' + path + ' for editing');
  const fatal = Application.fatalErrors.length;
  let error: string | null = null;
  try {
    GameStateManager.Editor.editQuest(path);
    if (Application.fatalErrors.length > fatal) error = Application.fatalErrors.at(-1)!.message;
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  if (error === null) {
    beginSession(path, history);
    go({ name: 'quest', path });
    return;
  }
  // Unity runs on after Application.Quit until the frame ends: what was half made goes, and so does the stop window
  // Application.quit opened (main.tsx), as the view says why
  Application.fatalErrors.length = fatal;
  Destroyer.destroy();
  update({ stop: null });
  go({ name: 'quest', path, error });
}

// Valkyrie: QuestEditSelection.cs QuestEditSelection.QuestEditSelection
function QuestList() {
  const revision = useEditor((s) => s.revision);
  const filter = useEditor((s) => s.editFilter);
  const selection = useMemo(() => new QuestEditSelection(), [revision]);
  const { found: rows, apart: away } = matching(selection.questList, filter);
  const fileInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);
  const game = Game.get();
  return (
    <main className="screen editor">
      <header className="screen-head">
        <h1>{val('QUEST_NAME_EDITOR', game.gameType.questName())}</h1>
        <Search which="editFilter" />
      </header>
      <DevBanner />
      <Message />
      <Apart count={away} />
      {rows.length === 0 && filter === '' ? (
        <p className="editor-empty quiet">{edi('EDITOR_NONE')}</p>
      ) : (
        <ul className="editor-list">
          {rows.map(({ entry, adventures }) => (
            <QuestRow key={entry.key} entry={entry} adventures={adventures} selection={selection} />
          ))}
        </ul>
      )}
      <footer className="screen-foot">
        <button type="button" className="button back" onClick={() => run(cancel)}>
          {CommonStringKeys.BACK.translate()}
        </button>
        <span className="editor-tools">
          <button type="button" className="button" onClick={() => fileInput.current?.click()}>
            {edi('EDITOR_IMPORT_FILE')}
          </button>
          <button type="button" className="button" onClick={() => folderInput.current?.click()}>
            {edi('EDITOR_IMPORT_FOLDER')}
          </button>
          <button type="button" className="button" onClick={() => run(() => go({ name: 'copy' }))}>
            {CommonStringKeys.COPY.translate()}
          </button>
          <button type="button" className="button primary" onClick={() => run(() => go({ name: 'new' }))}>
            {CommonStringKeys.NEW.translate()}
          </button>
        </span>
        <input
          ref={fileInput}
          className="visually-hidden"
          type="file"
          accept=".valkyrie,.zip"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const files = e.target.files;
            void importGiven(files, false).then(() => (e.target.value = ''));
          }}
        />
        <input
          ref={(input) => {
            folderInput.current = input;
            input?.setAttribute('webkitdirectory', '');
          }}
          className="visually-hidden"
          type="file"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const files = e.target.files;
            void importGiven(files, true).then(() => (e.target.value = ''));
          }}
        />
      </footer>
    </main>
  );
}

// Valkyrie: QuestEditSelection.cs QuestEditSelection.Cancel
function cancel(): void {
  setFilter('editFilter', '');
  go({ name: 'list' });
  QuestEditSelection.cancel();
}

/** The downloaded packages, read one at a time to list their quests (QuestLoader.GetQuests extracts them). */
function readPackages(then: () => void): void {
  const download = ContentData.downloadPath();
  const packages = Directory.exists(download) ? Directory.getFiles(download, '*' + ValkyrieConstants.ScenarioDownloadContainerExtension, SearchOption.TopDirectoryOnly) : [];
  void listingPackages(packages, (path) => run(() => ExtractManager.extractSinglePackagePartial(path)), () => run(then));
}

// Valkyrie: QuestEditSelection.cs QuestEditSelection.Copy()
function CopyList() {
  const revision = useEditor((s) => s.revision);
  const filter = useEditor((s) => s.copyFilter);
  const [list, setList] = useState<Map<string, QuestData.Quest> | null>(null);
  useEffect(() => readPackages(() => setList(QuestEditSelection.copyList())), [revision]);
  const game = Game.get();
  const { found: rows, apart: away } = list === null ? { found: [], apart: 0 } : matching(list, filter);
  return (
    <main className="screen editor">
      <header className="screen-head">
        <h1>{val('SELECT_TO_COPY', game.gameType.questName())}</h1>
        <Search which="copyFilter" />
      </header>
      <DevBanner />
      <Apart count={away} />
      {list === null ? (
        <p className="quiet">{uni('LOADING')}</p>
      ) : (
        <ul className="editor-list">
          {/* Not in Valkyrie, which lists a campaign's adventures apart: a campaign is copied whole */}
          {rows.map(({ entry, adventures }) => (
            <li key={entry.key} className="editor-row">
              <button type="button" className="editor-open" onClick={() => copy(entry.key)}>
                <span className="editor-name">{entry.name}</span>
                <span className="editor-folder quiet">{Path.getFileName(entry.key)}</span>
                {adventures.length > 0 && <span className="editor-folder quiet">{edi('EDITOR_ADVENTURES_COUNT', adventures.length)}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      <footer className="screen-foot">
        <button
          type="button"
          className="button back"
          onClick={() =>
            run(() => {
              setFilter('copyFilter', '');
              go({ name: 'list' });
            })
          }
        >
          {CommonStringKeys.BACK.translate()}
        </button>
      </footer>
    </main>
  );
}

/** Copies a scenario into the Editor folder; a package is read from storage first, which its copy extracts whole. */
function copy(key: string): void {
  const isPackage = Path.getExtension(Path.getFileName(key)) === ValkyrieConstants.ScenarioDownloadContainerExtension;
  const paths = isPackage ? [ContentData.downloadPath() + Path.DirectorySeparatorChar + Path.getFileName(key)] : [];
  void listingKeptFiles(paths, () =>
    run(() => {
      const target = new QuestEditSelection().copy(key);
      setFilter('copyFilter', '');
      go({ name: 'list' }, edi('EDITOR_COPIED', Path.getFileName(target)));
    }),
  );
}

/** Not in Valkyrie: a new scenario's quest.ini asks for a pack, as the scenario's panel would add it (packs=). */
function askForPack(folder: string, pack: string): void {
  const questIni = folder + '/quest.ini';
  const lines = File.readAllText(questIni).split(NewLine);
  const at = lines.findIndex((line) => line.startsWith('defaultlanguage='));
  lines.splice(at < 0 ? 1 : at + 1, 0, 'packs=' + pack);
  File.writeAllText(questIni, lines.join(NewLine));
}

// Valkyrie: QuestEditSelection.cs QuestEditSelection.NewQuestDialog
// Not in Valkyrie: given a campaign, a new adventure of it, in its folder
function NewQuest({ campaign }: { campaign?: string }) {
  const [folder, setFolder] = useState('');
  const [display, setDisplay] = useState('');
  const [error, setError] = useState('');
  const game = Game.get();
  const of = campaign ?? null;
  const campaignName = useMemo(() => (of === null ? '' : questName(new QuestData.Quest(of))), [of]);
  // Valkyrie: QuestEditSelection.cs QuestEditSelection.TryCreateQuest
  const create = (e: FormEvent) => {
    e.preventDefault();
    run(() => {
      const problem = QuestEditSelection.newQuestError(folder, of);
      if (problem !== null) {
        setError(problem.translate());
        return;
      }
      const made = new QuestEditSelection().tryCreateQuest(folder, display, of);
      // Not in Valkyrie: a mission made under DooM's button asks for its pack, or DooM's list would leave it out
      if (made !== null && of === null && playingDoom()) askForPack(made, DOOM_PACK);
      setFilter('editFilter', '');
      go({ name: 'list' });
    });
  };
  return (
    <main className="screen editor">
      <header className="screen-head">
        <h1>{of === null ? CommonStringKeys.NEW.translate() + ' ' + game.gameType.questName().translate() : edi('EDITOR_NEW_ADVENTURE_OF', campaignName)}</h1>
      </header>
      <DevBanner />
      <form className="editor-form panel" onSubmit={create}>
        <label>
          <span>{val('SCENARIO_FOLDER_NAME')}</span>
          {/* UIElementEditable.SetAlphanumericOnly */}
          <input value={folder} onChange={(e) => setFolder(e.target.value.replace(/[^A-Za-z0-9]/g, ''))} autoFocus />
        </label>
        <label>
          <span>{val('SCENARIO_DISPLAY_NAME')}</span>
          <input value={display} onChange={(e) => setDisplay(e.target.value)} />
        </label>
        {error !== '' && (
          <p className="editor-error" role="alert">
            {error}
          </p>
        )}
        <div className="editor-form-buttons">
          <button type="button" className="button back" onClick={() => run(() => go({ name: 'list' }))}>
            {CommonStringKeys.BACK.translate()}
          </button>
          <button type="submit" className="button primary">
            {val('CREATE')}
          </button>
        </div>
      </form>
    </main>
  );
}

export default function EditorScreen() {
  const view = useEditor((s) => s.view);
  switch (view.name) {
    case 'list':
      return <QuestList />;
    case 'copy':
      return <CopyList />;
    case 'new':
      return <NewQuest {...(view.campaign === undefined ? {} : { campaign: view.campaign })} />;
    case 'quest':
      return <QuestView path={view.path} {...(view.error === undefined ? {} : { error: view.error })} />;
  }
}
