// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/UI/Screens/QuestSelectionScreen.cs
// The list of scenarios: the store's (online) or the ones on this device (offline), sorted, searched and filtered as
// Valkyrie does, with the same configuration keys. The store's covers come straight from the authors' repositories:
// ImgAsyncLoader is the browser's lazy <img>. Adding a .valkyrie file is the app's: it is what copying it into
// Valkyrie's Download folder does. The filter window keeps its settings in config.ini, as Valkyrie's does.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  CommonStringKeys,
  ContentData,
  Destroyer,
  Directory,
  ExtractManager,
  File,
  Game,
  GameStateManager,
  LocalizationRead,
  Path,
  QuestListMode,
  QuestLoader,
  SearchOption,
  StringKey,
  ValkyrieConstants,
  ValkyrieDebug,
  boolToString,
  isNullOrWhiteSpace,
  type QuestData,
} from '@universalis/engine';
import { listingKeptFiles, listingPackages } from '../host/storage.ts';
import { Picture, RemotePicture } from '../ui/Picture.tsx';
import { run } from '../ui/run.ts';
import { show, update, useUI } from '../ui/store.ts';
import { checkScenarioPackage } from '../host/scenarioPackage.ts';
import { gameName, uni, val } from '../ui/text.ts';
import { Difficulty } from './Difficulty.tsx';
import { openQuestDetails } from './QuestDetailsScreen.tsx';
import { isDoomQuest, playingDoom } from './doom.ts';
import { newScreens } from '../themes/themes.ts';
import { downloadPackage, updateAll } from './QuestAndContentPackDownload.ts';
import './QuestSelectionScreen.css';
import '../themes/universalis/scenarios.css';
import { MarkBadges } from '../ui/MarkButtons.tsx';
import { CATEGORIES, guideOf, hasGuide, type GuideTag } from '../guide/guide.ts';
import {
  DOWNLOAD_FILTERS,
  MARK_FILTERS,
  PLAYED_FILTERS,
  downloadFilter,
  markFilter,
  marksOf,
  playedFilter,
  playersFilter,
  categoriesFilter,
  setCategoriesFilter,
  shownByCategories,
  setDownloadFilter,
  setMarkFilter,
  setPlayedFilter,
  setPlayersFilter,
  shownByDownload,
  shownByMarks,
  shownByPlayers,
  type DownloadFilter,
  type MarkFilter,
  type PlayedFilter,
} from '../ui/marks.ts';
import { plainText, RichText } from '../ui/RichText.tsx';

// filters
// Valkyrie: QuestSelectionScreen.cs QuestSelectionScreen.langs
const LANGS = 'English,Spanish,French,German,Italian,Portuguese,Polish,Russian,Chinese,Czech,Korean,Japanese,Ukrainian'.split(',');

/** Valkyrie draws a flag for each language; the app writes its code. */
const LANGUAGE_CODES: Record<string, string> = {
  English: 'EN',
  Spanish: 'ES',
  French: 'FR',
  German: 'DE',
  Italian: 'IT',
  Portuguese: 'PT',
  Polish: 'PL',
  Russian: 'RU',
  Chinese: 'ZH',
  Czech: 'CS',
  Korean: 'KO',
  Japanese: 'JA',
  Ukrainian: 'UK',
};

/** The sort options (QuestSelectionScreen.Start), by config name and text key. */
const SORT_OPTIONS_OFFLINE: [string, string][] = [
  ['author', 'SORT_BY_AUTHOR'],
  ['name', 'SORT_BY_NAME'],
  ['difficulty', 'SORT_BY_DIFFICULTY'],
  ['duration', 'SORT_BY_DURATION'],
];
const SORT_OPTIONS_ONLINE: [string, string][] = [
  ['rating', 'SORT_BY_RATING'],
  ['date', 'SORT_BY_DATE'],
  ['average_win_ratio', 'SORT_BY_WIN_RATIO'],
  ['average_duration', 'SORT_BY_AVERAGE_DURATION'],
];

/** The headings of the list sorted by date, by days since the update (QuestSelectionScreen.Start, nbDays_durationText). */
const NB_DAYS_DURATION_TEXT: [number, string][] = [
  [7, 'UPDATED_THIS_WEEK'],
  [30, 'UPDATED_THIS_MONTH'],
  [90, 'UPDATED_THIS_TRIMESTER'],
  [180, 'UPDATED_THIS_SEMESTER'],
  [356, 'UPDATED_THIS_YEAR'],
  [700, 'UPDATED_TWO_YEARS_AGO'],
  [999999, 'UPDATE_OLDER_THAN_TWO_YEAR'],
];

// Valkyrie: QuestSelectionScreen.cs QuestSelectionScreen.Show (the part before drawing)
export function openQuestSelection(): void {
  const game = Game.get();
  // If a dialog window is open we force it closed (this shouldn't happen)
  game.ui.destroyTag(Game.DIALOG);
  // Clean up downloader if present
  game.ui.destroyTag(Game.QUESTUI);
  show({ name: 'quest-selection' });
}

function online(): boolean {
  return Game.get().questsList.quest_list_mode === QuestListMode.ONLINE;
}

/** Not in Valkyrie: a downloaded package stays on disk until the engine reads it (host/storage.ts). */
function packagePath(key: string): string {
  return Path.combine(ContentData.downloadPath(), key + ValkyrieConstants.ScenarioDownloadContainerExtension);
}

let readingPackages = false;

/**
 * Whether the list of this device's quests can be drawn. Not in Valkyrie: LoadAllLocalQuests extracts every package's
 * quest.ini, translations and picture, so the packages are read from disk first, one at a time (host/storage.ts); until
 * then the list says it is loading.
 */
function localQuestsReady(): boolean {
  const game = Game.get();
  if (online() || game.questsList.local_quests_data !== null) return true;
  if (!readingPackages) {
    readingPackages = true;
    const download = ContentData.downloadPath();
    const packages = Directory.exists(download) ? Directory.getFiles(download, ValkyrieConstants.ContentPackDownloadContainerExtensionAllFileReference, SearchOption.AllDirectories) : [];
    void listingPackages(
      packages,
      // What ExtractManager.ExtractPackages does for each
      (path) => run(() => ExtractManager.extractSinglePackagePartial(path)),
      () => run(() => game.questsList.loadAllLocalQuests()),
    ).finally(() => {
      readingPackages = false;
      // A list that failed shows what it has, rather than trying again and again
      game.questsList.local_quests_data ??= new Map();
      update();
    });
  }
  return false;
}

// Valkyrie: QuestSelectionScreen.cs QuestSelectionScreen.SetOnlineMode
function setOnlineMode(go_online: boolean): void {
  const game = Game.get();
  if (go_online) {
    ValkyrieDebug.log('INFO: Set online mode for quests');
    game.questsList.setMode(QuestListMode.ONLINE);
  } else {
    ValkyrieDebug.log('INFO: Set offline mode for quests');
    game.questsList.setMode(QuestListMode.LOCAL);
  }
  // DrawOnlineModeButton and ReloadQuestList
  update();
}

/** The languages the player reads (UserConfig filterLangs), or Valkyrie's default: all but Japanese. */
function selectedLangs(): Set<string> {
  const config = Game.get().config.data.get('UserConfig') ?? new Map<string, string>();
  const saved = config.get('filterLangs');
  if (saved !== undefined) return new Set(saved.split(';').filter((lang) => LANGS.includes(lang)));
  return new Set(LANGS.filter((lang) => lang !== 'Japanese'));
}

/** Whether the scenarios whose expansions are missing are hidden (UserConfig filterMissingExpansions). */
function missingExpansionsHidden(): boolean {
  // bool.TryParse ignores letter case
  return Game.get().config.data.get('UserConfig', 'filterMissingExpansions').toLowerCase() === 'true';
}

// Valkyrie: QuestSelectionScreen.cs QuestSelectionScreen.SetFilterLang
function setFilterLang(lang: string): void {
  const game = Game.get();
  // update configuration
  const langs_selected = new Map(LANGS.map((l) => [l, selectedLangs().has(l)]));
  langs_selected.set(lang, !langs_selected.get(lang));

  // count active langs
  let list_langs = '';
  for (const [l, selected] of langs_selected) {
    if (selected) list_langs += l + ';';
  }

  // ignore last flag deactivation
  if (list_langs.length === 0) return;

  // save filter configuration
  list_langs = list_langs.substring(0, list_langs.length - 1);
  game.config.data.add('UserConfig', 'filterLangs', list_langs);
  game.config.save();
}

// Valkyrie: QuestSelectionScreen.cs QuestSelectionScreen.SetFilterMissingExpansions
function setFilterMissingExpansions(): void {
  const game = Game.get();
  // save filter configuration
  game.config.data.add('UserConfig', 'filterMissingExpansions', boolToString(!missingExpansionsHidden()));
  game.config.save();
}

// check if the quest proposes at least one selected language
// Valkyrie: QuestSelectionScreen.cs QuestSelectionScreen.HasSelectedLanguage
function hasSelectedLanguage(q: QuestData.Quest, langs: Set<string>): boolean {
  for (const lang of LANGS) {
    // check if lang is selected in filters
    if (!langs.has(lang)) continue;

    if (!online()) {
      // check list of languages when offline
      if (q.localizationDict === null) {
        ValkyrieDebug.log('WARNING: Scenario ' + q.package_url + ' does not have dictionary, this should not happen');
        return false;
      }
      if (q.localizationDict.serializeMultiple().has(lang)) return true;
    } else {
      // check list of languages when online
      if (q.languages_name !== null && q.languages_name.size <= 0) {
        ValkyrieDebug.log('WARNING: Scenario ' + q.package_url + ' does not have a name, this should not happen');
        return false;
      }
      if (q.languages_name!.has(lang)) return true;
    }
  }
  return false;
}

/** The name and synopsys of a quest in the player's language, or its default one. */
// Valkyrie: QuestSelectionScreen.cs QuestSelectionScreen.QuestGetTranslations
function questGetTranslations(q: QuestData.Quest): [string, string] {
  const game = Game.get();
  let name_translation = '';
  let synopsys_translation = '';
  if (online()) {
    // quest name is local language, or default language
    if (q.languages_name !== null) {
      const value = q.languages_name.get(game.currentLang);
      name_translation = value ?? '';
      if (value === undefined || isNullOrWhiteSpace(value)) name_translation = q.languages_name.get(q.defaultLanguage) ?? '';
    }
    // same thing for synopsys: local language, or default language
    if (q.languages_synopsys !== null) {
      const value = q.languages_synopsys.get(game.currentLang);
      synopsys_translation = value ?? '';
      if (value === undefined || isNullOrWhiteSpace(value)) synopsys_translation = q.languages_synopsys.get(q.defaultLanguage) ?? '';
    }
  } else {
    LocalizationRead.removeDictionary('qst');
    LocalizationRead.addDictionary('qst', q.localizationDict);
    name_translation = q.name.translate();
    synopsys_translation = q.synopsys.translate(true);
  }
  return [name_translation, synopsys_translation];
}

/** Whole days from the update to today, as .NET subtracts local DateTimes (wall-clock times, whatever the offsets). */
function daysSince(date: Date): number {
  const wall = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.trunc((wall(today) - wall(date)) / 86_400_000);
}

/** What the action button of a quest does (UpdateButtonVisuals). */
type QuestAction = 'no-entry' | 'play' | 'update' | 'download';

interface QuestStats {
  playCount: number;
  winRatio: number;
  avgDuration: number;
  rating: number;
}

interface ListedQuest {
  key: string;
  quest: QuestData.Quest;
  name: string;
  synopsys: string;
  packs: { id: string; missing: boolean }[];
  languages: string[];
  stats: QuestStats | null;
  /** The heading DrawSortInfo puts before it, sorted by author or by date. */
  heading: string | null;
  action: QuestAction;
}

// Valkyrie: QuestSelectionScreen.cs QuestSelectionScreen.UpdateButtonVisuals
function questAction(q: QuestData.Quest, is_expansion_missing: boolean): QuestAction {
  if (is_expansion_missing) return 'no-entry';
  if (!online()) return 'play';
  if (q.downloaded) return q.update_available ? 'update' : 'play';
  return 'download';
}

// Valkyrie: QuestSelectionScreen.cs QuestSelectionScreen.QuestRenderLanguageFlags
function questLanguages(q: QuestData.Quest): string[] {
  if ((q.languages_name !== null && q.languages_name.size > 0) || (q.localizationDict !== null && !online())) {
    return q.languages_name!.size > 0 ? [...q.languages_name!.keys()] : q.localizationDict!.getLanguagesList();
  }
  return [];
}

/** The configured sort, online or offline (GetQuestList). */
function sortOf(): { criteria: string; order: string } {
  const config = Game.get().config.data.get('UserConfig') ?? new Map<string, string>();
  // check if connected on internet, and display scenario list accordingly (local or online)
  if (online()) return { criteria: config.get('sortCriteria') ?? 'rating', order: config.get('sortOrder') ?? 'descending' };
  // check offline sort option is available
  return { criteria: config.get('offlineSortCriteria') ?? 'name', order: config.get('offlineSortOrder') ?? 'descending' };
}

/** What DrawListItems shows, in order, and how many it leaves out. */
// Valkyrie: QuestSelectionScreen.cs QuestSelectionScreen.DrawQuestList and DrawListItems
function listQuests(criteria: string, order: string, search: string): { shown: ListedQuest[]; total: number; filtered: number; added: AddedState | null; updatable: string[] } {
  const game = Game.get();
  if (!online()) {
    // Only need to load from disk if offline
    game.questsList.loadAllLocalQuests();
  }
  // Valkyrie: QuestSelectionScreen.cs QuestSelectionScreen.GetQuestList
  game.questsList.sortQuests();
  const questList = game.questsList.getList(criteria);
  if (order === 'descending') questList.reverse();

  const filterMissingExpansions = missingExpansionsHidden();
  const langs = selectedLangs();
  const loaded = game.cd.getLoadedPackIDs();
  const shown: ListedQuest[] = [];
  // Not in Valkyrie: the downloaded scenarios with a newer version in the store, whatever the filters (Update all)
  const updatable: string[] = [];
  let filtered = 0;
  let invalid = 0;
  let apart = 0;
  const doom = playingDoom();
  // reset sort information
  let last_author = '';
  let last_update_info: string | null = null;
  // Not in Valkyrie: what became of the scenario just added (addScenario)
  let added: AddedState | null = justAdded === null ? null : 'invalid';
  const isAdded = (key: string) => justAdded !== null && (Path.getFileName(key) ?? '').toLowerCase() === justAdded.toLowerCase();
  for (const key of questList) {
    const q = game.questsList.getQuestData(key);
    if (isAdded(key)) added = !q.valid ? 'invalid' : 'filtered';

    //skip the quest if it was marked as invalid
    if (!q.valid) {
      ValkyrieDebug.log('WARNING: Scenario ' + key + ' is not valid, skipping it');
      invalid++;
      continue;
    }

    // Not in Valkyrie: DooM's missions are listed under DooM's button only (doom.ts)
    if (isDoomQuest(q.packs) !== doom) {
      apart++;
      continue;
    }

    if (online() && q.downloaded && q.update_available) updatable.push(key);

    // Filter langs
    if (!hasSelectedLanguage(q, langs)) {
      filtered++;
      continue;
    }

    // Filter packages
    const missing = q.getMissingPacks(loaded);
    if (filterMissingExpansions && missing.length !== 0) {
      filtered++;
      continue;
    }

    // Not in Valkyrie: the player's marks (ui/marks.ts)
    if (!shownByMarks(marksOf(q.identifier))) {
      filtered++;
      continue;
    }

    // Not in Valkyrie: for how many investigators (ui/marks.ts)
    if (!shownByPlayers(q.minHero, q.maxHero)) {
      filtered++;
      continue;
    }

    // Not in Valkyrie: the scenario guide's categories, for Mansions (ui/marks.ts, guide/guide.ts)
    if (!shownByCategories(q.identifier)) {
      filtered++;
      continue;
    }

    // Not in Valkyrie: online, downloaded or not (ui/marks.ts)
    if (online() && !shownByDownload(q.downloaded)) {
      filtered++;
      continue;
    }

    // Filter search
    const [name, synopsys] = questGetTranslations(q);
    if (search !== '' && !name.toLowerCase().includes(search.toLowerCase())) {
      filtered++;
      continue;
    }

    try {
      // Statistics data preparation for this quest
      const filename = key.toLowerCase() + ValkyrieConstants.ScenarioDownloadContainerExtension;
      const q_stats = game.stats.scenarios_stats?.get(filename);
      const stats =
        q_stats === undefined
          ? null
          : {
              playCount: q_stats.scenario_play_count,
              winRatio: Math.trunc(Math.fround(q_stats.scenario_avg_win_ratio * 100)),
              avgDuration: Math.trunc(q_stats.scenario_avg_duration),
              rating: Math.fround(q_stats.scenario_avg_rating / 10),
            };

      // Text information displayed depending on sort option (DrawSortInfo)
      let heading: string | null = null;
      if (criteria === 'author') {
        const current_author = q.getShortAuthor();
        if (current_author !== last_author) {
          heading = current_author;
          last_author = current_author;
        }
      } else if (criteria === 'date') {
        const nb_days_since_update = daysSince(q.latest_update);
        const current_update_information = NB_DAYS_DURATION_TEXT.find(([days]) => nb_days_since_update < days)?.[1] ?? null;
        if (current_update_information !== last_update_info) {
          heading = current_update_information === null ? null : val(current_update_information);
          last_update_info = current_update_information;
        }
      }

      if (isAdded(key)) added = 'shown';
      shown.push({
        key,
        quest: q,
        name,
        synopsys,
        packs: q.packs.map((id) => ({ id, missing: missing.includes(id) })),
        languages: questLanguages(q),
        stats,
        heading,
        action: questAction(q, missing.length !== 0),
      });
    } catch (e) {
      ValkyrieDebug.log('ERROR: Error while processing quest ' + key + ': ' + (e instanceof Error ? e.message : String(e)));
    }
  }
  return { shown, total: questList.length - invalid - apart, filtered, added, updatable };
}

/** The address GitHub takes issues for a scenario at, or null. */
// Valkyrie: QuestSelectionScreen.cs QuestSelectionScreen.BuildGitHubIssueUrl
function buildGitHubIssueUrl(packageUrl: string): string | null {
  if (packageUrl === '') return null;
  const url = packageUrl.replaceAll('https://raw.githubusercontent.com', 'https://github.com');
  const parts = url.split('/');
  if (parts.length >= 5 && parts[2]!.includes('github.com')) return `${parts[0]}//${parts[2]}/${parts[3]}/${parts[4]}/issues`;
  return null;
}

// Select a quest: its details offline, or online the downloaded one, or its download
// Valkyrie: QuestSelectionScreen.cs QuestSelectionScreen.Selection
export function selection(key: string): void {
  ValkyrieDebug.log('INFO: Select quest ' + key);
  const game = Game.get();
  const q = game.questsList.getQuestData(key);

  if (!online()) {
    // Play
    Destroyer.dialog();
    // Clean up quest UI (header, filters, etc)
    game.ui.destroyTag(Game.QUESTUI);
    ValkyrieDebug.log('INFO: ... and launch offline quest');
    openQuestDetails(q);
  } else if (q.downloaded && !q.update_available) {
    // Play
    Destroyer.dialog();
    // Clean up quest UI (header, filters, etc)
    game.ui.destroyTag(Game.QUESTUI);
    ValkyrieDebug.log('INFO: ... and launch online quest');
    const localQ = QuestLoader.getSingleQuest(key);
    if (localQ === null) {
      ValkyrieDebug.log('ERROR: Failed to read quest file for: ' + key + ' (file may be corrupt or invalid)');
      let [displayName] = questGetTranslations(q);
      if (displayName === '') displayName = key;
      show({ name: 'quest-load-error', questName: displayName, packageUrl: q.package_url, key });
      return;
    }
    localQ.package_url = q.package_url;
    openQuestDetails(localQ);
  } else {
    // Download / Update
    ValkyrieDebug.log('INFO: ... and download quest');
    downloadPackage(key, false);
  }
}

/** A click on a quest: online, a downloaded one is read from disk first, as GetSingleQuest lists it. Not in Valkyrie. */
function select(key: string): Promise<void> {
  const q = Game.get().questsList.getQuestData(key);
  const reads = online() && q.downloaded && !q.update_available ? [packagePath(key)] : [];
  return listingKeptFiles(reads, () => run(() => selection(key)));
}

// Valkyrie: QuestSelectionScreen.cs QuestSelectionScreen.SetSort
function setSort(criteria: string, order: string): void {
  const game = Game.get();
  if (online()) {
    // save sort configuration
    game.config.data.add('UserConfig', 'sortCriteria', criteria);
    game.config.data.add('UserConfig', 'sortOrder', order);
  } else {
    // save sort configuration
    game.config.data.add('UserConfig', 'offlineSortCriteria', criteria);
    game.config.data.add('UserConfig', 'offlineSortOrder', order);
  }
  game.config.save();
  update();
}

/** What became of a scenario just added, once the list is drawn: listed, hidden by the filters, or not valid. */
type AddedState = 'shown' | 'filtered' | 'invalid';

/** The file name of the scenario just added, until the list says what became of it. */
let justAdded: string | null = null;

/**
 * Copies a .valkyrie file into Valkyrie's Download folder, as a player would on the desktop, and lists it. Not in
 * Valkyrie: the list goes to this device's scenarios, where an added one is (the store's list shows only the store's),
 * and the player is told when it belongs to another game or the filters hide it.
 */
async function addScenario(file: globalThis.File): Promise<void> {
  const given = file.name;
  // Not in Valkyrie: a zip is taken as well, kept with Valkyrie's extension, and checked (host/scenarioPackage.ts)
  if (!/\.(valkyrie|zip)$/i.test(given)) {
    update({ notice: uni('NOT_A_SCENARIO', given) });
    return;
  }
  const name = given.replace(/\.zip$/i, '.valkyrie');
  const check = checkScenarioPackage(new Uint8Array(await file.arrayBuffer()));
  if (check.kind === 'not-zip') {
    update({ notice: uni('NOT_A_ZIP', given) });
    return;
  }
  if (check.kind === 'no-quest-ini') {
    update({ notice: uni('NOT_A_SCENARIO', given) });
    return;
  }
  const { bytes, quest } = check;
  const report = [
    ...(check.fixedFrom !== null ? [uni('CHECK_FIXED_FOLDER', check.fixedFrom)] : []),
    ...check.errors.map((p) => uni(p.key, ...p.params)),
    ...check.warnings.map((p) => uni(p.key, ...p.params)),
  ];
  if (report.length > 0) {
    const title = uni(check.errors.length > 0 ? 'CHECK_TITLE_ERRORS' : 'CHECK_TITLE', name);
    useUI.setState({ scenarioReport: { title, lines: report } });
  }
  if (check.errors.length > 0) return;
  run(() => {
    const game = Game.get();
    File.writeAllBytes(Path.combine(ContentData.downloadPath(), name), bytes);
    game.questsList.unloadLocalQuests();
    // Valkyrie lists only the quests of the game being played; the Download folder is the same for both
    const type = quest.get('type') ?? '';
    const doom = isDoomQuest((quest.get('packs') ?? '').split(' '));
    // Without a type, Valkyrie lists it in neither game
    if (type === '') {
      update({ notice: uni('SCENARIO_INVALID', name) });
      return;
    }
    if (type !== game.gameType.typeName()) {
      update({ notice: uni('SCENARIO_OTHER_GAME', name, type === ValkyrieConstants.typeDescent || type === ValkyrieConstants.typeMom ? gameName(type) : type) });
      return;
    }
    if (type === ValkyrieConstants.typeDescent && doom !== playingDoom()) {
      update({ notice: uni('SCENARIO_OTHER_GAME', name, doom ? uni('DOOM_NAME') : gameName(type)) });
      return;
    }
    if (online()) game.questsList.setMode(QuestListMode.LOCAL);
    justAdded = name;
    update({ notice: uni('SCENARIO_ADDED', name) });
  });
}

/** Not in Valkyrie: what the app found in a scenario (or a content pack, addContentPack.ts) the player added, until they close it. */
export function ScenarioReport() {
  const report = useUI((s) => s.scenarioReport);
  if (report === null) return null;
  const close = () => useUI.setState({ scenarioReport: null });
  return (
    <div className="window-layer" onKeyDown={(e) => e.key === 'Escape' && close()}>
      <section className="window panel scenario-report" role="dialog" aria-modal="true" aria-labelledby="scenario-report-title">
        <h2 id="scenario-report-title">{report.title}</h2>
        <ul>
          {report.lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
        <button type="button" className="button primary" autoFocus onClick={close}>
          {CommonStringKeys.CLOSE.translate()}
        </button>
      </section>
    </div>
  );
}

/** Tells the player what became of the scenario just added, once the list has it. */
function reportAdded(added: AddedState | null): void {
  if (added === null || justAdded === null) return;
  const name = justAdded;
  justAdded = null;
  if (added === 'filtered') update({ notice: uni('SCENARIO_FILTERED', name) });
  else if (added === 'invalid') update({ notice: uni('SCENARIO_INVALID', name) });
}

// Valkyrie: QuestSelectionScreen.cs QuestSelectionScreen.DrawOnlineModeButton
function OnlineModeButton() {
  const mode = Game.get().questsList.quest_list_mode;
  if (mode === QuestListMode.ERROR_DOWNLOAD) {
    // error download (no connection, timeout, of file not available)
    return <span className="connection error">{val('OFFLINE_DUE_TO_ERROR')}</span>;
  }
  if (mode === QuestListMode.DOWNLOADING) {
    // Download ongoing
    return (
      <span className="connection" role="status">
        {val('DOWNLOAD_ONGOING')}
      </span>
    );
  }
  // Download done: online, or the player has switched offline
  const goOffline = mode === QuestListMode.ONLINE;
  return (
    <button type="button" className={`button connection ${goOffline ? 'offline' : 'online'}`} onClick={() => run(() => setOnlineMode(!goOffline))}>
      {val(goOffline ? 'GO_OFFLINE' : 'GO_ONLINE')}
    </button>
  );
}

/** The rating as Valkyrie draws it: five marks, covered from the right by what is missing to 10 (QuestRenderRating). */
function Rating({ value }: { value: number }) {
  const lit = Math.max(0, Math.min(1, value));
  return (
    <span className="rating" role="img" aria-label={uni('RATING', (lit * 10).toFixed(1))}>
      <span className="marks">★★★★★</span>
      <span className="marks lit" style={{ width: `${lit * 100}%` }}>
        ★★★★★
      </span>
    </span>
  );
}

const ACTION_TEXT: Record<QuestAction, () => string> = {
  'no-entry': () => val('MISSING_EXPANSIONS').replace(/:$/, ''),
  play: () => uni('PLAY_SCENARIO'),
  update: () => val('UPDATE'),
  download: () => val('DOWNLOAD'),
};

function QuestCard({ listed, highlighted = false }: { listed: ListedQuest; highlighted?: boolean }) {
  const game = Game.get();
  const { key, quest, synopsys, packs, languages, stats, action } = listed;
  const heroes = game.gameType.heroesName().translate();
  // QuestRenderName and QuestRenderShortDescription
  // Not in Valkyrie: cut without the rich text tags, so that none is left half-written
  const plainName = plainText(listed.name);
  const plainSynopsys = plainText(synopsys);
  const name = plainName.length >= 70 ? plainName.substring(0, 65) + '(...)' : listed.name;
  const shortSynopsys = plainSynopsys.length >= 105 ? plainSynopsys.substring(0, 100) + '(...)' : synopsys;
  // QuestRenderImage: offline the picture in the quest folder, online the cover in its repository
  const cover =
    quest.image.length === 0 ? null : online() ? (
      <RemotePicture url={quest.package_url + quest.image} name={plainName} decorative />
    ) : (
      <Picture file={Path.combine(quest.path, quest.image)} name={plainName} decorative />
    );
  // Not in Valkyrie (17 October 2026): Universalis' list for Mansions shows the cover again behind the card, faded
  // Not in Valkyrie: Universalis' list (Mansions, Descent and DooM) shows the cover again behind the card (themes/universalis/scenarios.css)
  const backdrop = newScreens() && cover !== null;
  return (
    // QuestRenderActionButton: a quest whose expansions are missing cannot be chosen
    <button
      type="button"
      className={`quest card action-${action}`}
      disabled={action === 'no-entry'}
      data-key={key}
      data-highlight={highlighted ? '' : undefined}
      onClick={() => void select(key)}
    >
      <span className="photo">{cover ?? <Picture file="" name={plainName} decorative />}</span>
      <span className="quest-text">
        <span className="quest-head">
          <span className="quest-name">
            <RichText text={name} />
          </span>
          <MarkBadges identifier={quest.identifier} />
          {/* Not in Valkyrie: the scenario guide says it is for adults (guide/guide.ts) */}
          {guideOf(quest.identifier)?.tags.has('adult') && (
            <span className="adult-badge" role="img" aria-label={uni('ADULT_CONTENT')} title={uni('ADULT_CONTENT')}>
              +18
            </span>
          )}
          {languages.length > 0 && (
            <span className="quest-languages" role="img" aria-label={uni('LANGUAGES', languages.join(', '))}>
              {languages.map((lang) => (
                <span key={lang} className="quest-language" title={lang}>
                  {LANGUAGE_CODES[lang] ?? lang.substring(0, 2).toUpperCase()}
                </span>
              ))}
            </span>
          )}
        </span>
        {shortSynopsys !== '' && (
          <span className="synopsys">
            <RichText text={shortSynopsys} />
          </span>
        )}
        <span className="facts">
          <span className="fact" data-fact="heroes">
            <span className="fact-value">{`${quest.minHero}–${quest.maxHero}`}</span> <span className="fact-label">{heroes}</span>
          </span>
          {quest.lengthMax !== 0 && (
            <span className="fact" data-fact="duration">
              <span className="fact-label">{val('DURATION').replace(/:$/, '')}</span> <span className="fact-value">{`${quest.lengthMin}–${quest.lengthMax}`}</span>
            </span>
          )}
          {quest.difficulty !== 0 && (
            <span className="fact" data-fact="difficulty">
              <span className="fact-label">{val('DIFFICULTY').replace(/:$/, '')}</span> <Difficulty value={quest.difficulty} />
            </span>
          )}
          {packs.length > 0 && (
            <span className="fact" data-fact="packs">
              <span className="fact-label">{val('REQUIRED_EXPANSIONS').replace(/:$/, '')}</span>{' '}
              {packs.map((p) => (
                <span key={p.id} className={p.missing ? 'pack missing' : 'pack'}>
                  {game.cd.getContentAcronym(p.id).trim() || p.id}
                </span>
              ))}
            </span>
          )}
        </span>
        {stats !== null && (
          <span className="facts stats">
            <span className="fact" data-fact="average-duration">
              {stats.avgDuration > 0 ? val('STATS_AVERAGE_DURATION', stats.avgDuration) : val('STATS_NO_AVERAGE_DURATION')}
            </span>
            <span className="fact" data-fact="win-ratio">
              {stats.winRatio >= 0 ? val('STATS_AVERAGE_WIN_RATIO', stats.winRatio) : val('STATS_NO_AVERAGE_WIN_RATIO')}
            </span>
            <span className="fact" data-fact="rating">
              <Rating value={stats.rating} /> <span className="reviews">{val('STATS_NB_USER_REVIEWS', stats.playCount)}</span>
            </span>
          </span>
        )}
      </span>
      <span className="quest-action">{ACTION_TEXT[action]()}</span>
      {backdrop && <span className="quest-backdrop">{cover}</span>}
    </button>
  );
}

/** The guide's categories as the filter window names them. */
const CATEGORY_TEXT: Partial<Record<GuideTag, string>> = {
  beginners: 'CATEGORY_BEGINNERS',
  short: 'CATEGORY_SHORT',
  narrative: 'CATEGORY_NARRATIVE',
  combat: 'CATEGORY_COMBAT',
  campaign: 'CATEGORY_CAMPAIGN',
  replayable: 'CATEGORY_REPLAYABLE',
};

/**
 * Not in Valkyrie: the filters that leave scenarios out now, in words, so that the list says plainly that it is
 * filtered and by what (a player who forgot a filter thought scenarios were missing, 23 October 2026).
 */
function activeFilters(search: string): string[] {
  const labels: string[] = [];
  if (search !== '') labels.push(uni('FILTER_SEARCH_ON', search));
  const langs = selectedLangs();
  const defaults = LANGS.filter((lang) => lang !== 'Japanese');
  if (langs.size !== defaults.length || defaults.some((lang) => !langs.has(lang))) {
    labels.push(uni('FILTER_LANGS_ON', LANGS.filter((lang) => langs.has(lang)).map((lang) => LANGUAGE_CODES[lang]).join(' ')));
  }
  if (missingExpansionsHidden()) labels.push(uni('FILTER_EXPANSIONS_ON'));
  const players = playersFilter();
  if (players !== null) labels.push(uni('FILTER_PLAYERS_ON', players));
  if (playedFilter() !== 'all') labels.push(uni(PLAYED_FILTER_TEXT[playedFilter()]));
  if (online() && downloadFilter() !== 'all') labels.push(uni(DOWNLOAD_FILTER_TEXT[downloadFilter()]));
  if (markFilter() !== 'all') labels.push(uni(MARK_FILTER_TEXT[markFilter()]));
  if (hasGuide()) for (const category of categoriesFilter()) labels.push(uni(CATEGORY_TEXT[category]!));
  return labels;
}

/** Not in Valkyrie: every filter back to how a new player finds it (the languages to Valkyrie's default). */
function clearFilters(): void {
  const game = Game.get();
  game.config.data.remove('UserConfig', 'filterLangs');
  game.config.data.add('UserConfig', 'filterMissingExpansions', boolToString(false));
  game.config.save();
  setPlayedFilter('all');
  setMarkFilter('all');
  setDownloadFilter('all');
  setPlayersFilter(null);
  setCategoriesFilter(new Set());
}

/** Not in Valkyrie: Igor (igor/Igor.tsx) asks the list to open a scenario once it is drawn: its identifier. */
let openWhenListed: string | null = null;

export function openScenarioWhenListed(identifier: string): void {
  openWhenListed = identifier.toLowerCase();
}

const PLAYED_FILTER_TEXT: Record<PlayedFilter, string> = { all: 'FILTER_ALL', played: 'FILTER_PLAYED_ONLY', unplayed: 'FILTER_UNPLAYED' };
const MARK_FILTER_TEXT: Record<MarkFilter, string> = { all: 'FILTER_ALL', favorite: 'FILTER_FAVORITES', pending: 'FILTER_PENDING' };
const DOWNLOAD_FILTER_TEXT: Record<DownloadFilter, string> = { all: 'FILTER_ALL', downloaded: 'FILTER_DOWNLOADED_ONLY', notDownloaded: 'FILTER_NOT_DOWNLOADED' };

/** The investigators' icon, as the list's facts show it (themes/universalis/scenarios.css, data-fact heroes). */
function PlayersIcon() {
  return (
    <svg className="filter-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM1 21c0-4.2 3.6-7 8-7s8 2.8 8 7zm17.2 0c0-2.1-.7-3.9-1.9-5.3 3.4.3 6.7 2.4 6.7 5.3z" />
    </svg>
  );
}

/** Not in Valkyrie: a choice of the filter window about the player's marks, saved at once as Valkyrie's are. */
function FilterChoice<T extends string>({ id, title, icon, choices, chosen, text, choose }: { id: string; title: string; icon?: ReactNode; choices: readonly T[]; chosen: T; text: (value: T) => string; choose: (value: T) => void }) {
  return (
    <div className="filter-choice">
      <p id={id}>
        {icon}
        {title}
      </p>
      <div className="filter-options" role="radiogroup" aria-labelledby={id}>
        {choices.map((c) => (
          <button key={c} type="button" role="radio" aria-checked={c === chosen} className="filter-option" onClick={() => run(() => choose(c))}>
            {text(c)}
          </button>
        ))}
      </div>
    </div>
  );
}

// Valkyrie: QuestSelectionScreen.cs QuestSelectionScreen.FilterPopup and DrawFlags
function FilterPopup({ close }: { close: () => void }) {
  // Each choice is saved at once, as in Valkyrie; the list behind is drawn again with OK
  const [, redraw] = useState(0);
  const langs = selectedLangs();
  const hidden = missingExpansionsHidden();
  // Not in Valkyrie: from one investigator to as many as the game takes (Mansions 10, Descent 4)
  const players = ['all', ...Array.from({ length: Game.get().gameType.maxHeroes() }, (_, i) => String(i + 1))];
  const categories = categoriesFilter();
  return (
    <div className="window-layer filter-layer">
      <section className="window panel filter-popup" role="dialog" aria-modal="true" aria-labelledby="filter-title">
        <h2 id="filter-title">{val('FILTER_TITLE')}</h2>
        <p id="filter-langs">{val('FILTER_SELECT_LANG')}</p>
        {/* Valkyrie's flags, as language codes, darkened when not chosen */}
        <div className="filter-langs" role="group" aria-labelledby="filter-langs">
          {LANGS.map((lang) => (
            <button
              key={lang}
              type="button"
              className="filter-lang"
              aria-pressed={langs.has(lang)}
              title={lang}
              onClick={() =>
                run(() => {
                  setFilterLang(lang);
                  redraw((n) => n + 1);
                })
              }
            >
              {LANGUAGE_CODES[lang]}
            </button>
          ))}
        </div>
        {/* Not in Valkyrie: the player's marks (ui/marks.ts) */}
        <FilterChoice
          id="filter-players"
          title={uni('FILTER_PLAYERS')}
          icon={<PlayersIcon />}
          choices={players}
          chosen={String(playersFilter() ?? 'all')}
          text={(v) => (v === 'all' ? uni('FILTER_ALL') : v)}
          choose={(v) => { setPlayersFilter(v === 'all' ? null : Number(v)); redraw((n) => n + 1); }}
        />
        {/* Not in Valkyrie: the scenario guide's categories, several at once (guide/guide.ts) */}
        {hasGuide() && (
          <div className="filter-choice">
            <p id="filter-categories">{uni('FILTER_CATEGORIES')}</p>
            <div className="filter-options" role="group" aria-labelledby="filter-categories">
              {CATEGORIES.map((category) => {
                const on = categories.has(category);
                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={on}
                    className="filter-option filter-category"
                    onClick={() =>
                      run(() => {
                        const next = new Set(categories);
                        if (on) next.delete(category);
                        else next.add(category);
                        setCategoriesFilter(next);
                        redraw((n) => n + 1);
                      })
                    }
                  >
                    {uni(CATEGORY_TEXT[category]!)}
                  </button>
                );
              })}
            </div>
            <p className="filter-note">{uni('FILTER_CATEGORIES_NOTE')}</p>
          </div>
        )}
        <FilterChoice id="filter-played" title={uni('FILTER_PLAYED')} choices={PLAYED_FILTERS} chosen={playedFilter()} text={(v) => uni(PLAYED_FILTER_TEXT[v])} choose={(v) => { setPlayedFilter(v); redraw((n) => n + 1); }} />
        {online() && (
          <FilterChoice id="filter-downloaded" title={uni('FILTER_DOWNLOADED')} choices={DOWNLOAD_FILTERS} chosen={downloadFilter()} text={(v) => uni(DOWNLOAD_FILTER_TEXT[v])} choose={(v) => { setDownloadFilter(v); redraw((n) => n + 1); }} />
        )}
        <FilterChoice id="filter-mark" title={uni('FILTER_MARKS')} choices={MARK_FILTERS} chosen={markFilter()} text={(v) => uni(MARK_FILTER_TEXT[v])} choose={(v) => { setMarkFilter(v); redraw((n) => n + 1); }} />
        <button
          type="button"
          className="filter-missing"
          aria-pressed={hidden}
          onClick={() =>
            run(() => {
              setFilterMissingExpansions();
              redraw((n) => n + 1);
            })
          }
        >
          {val(hidden ? 'FILTER_MISSING_EXPANSIONS_ON' : 'FILTER_MISSING_EXPANSIONS_OFF')}
        </button>
        {/* OK button closes popup and refresh quest list */}
        <button
          type="button"
          className="button primary"
          onClick={() =>
            run(() => {
              close();
              update();
            })
          }
        >
          {CommonStringKeys.OK.translate()}
        </button>
      </section>
    </div>
  );
}

export function QuestSelectionScreen() {
  const revision = useUI((s) => s.revision);
  const [filtering, setFiltering] = useState(false);
  // The text in the search box, and the search applied when the player ends editing it (Enter, or leaving the box)
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  // Valkyrie: QuestSelectionScreen.cs QuestSelectionScreen.PerformSearch
  const performSearch = () => {
    const newFilter = searchText.trim();
    if (newFilter !== search) setSearch(newFilter);
  };
  const input = useRef<HTMLInputElement>(null);
  const game = Game.get();
  const mode = game.questsList.quest_list_mode;

  // RemoteQuestsListDownload_cb: draw again once the store list arrives (or fails)
  useEffect(() => {
    if (mode === QuestListMode.DOWNLOADING) game.questsList.register_cb_download(() => update());
  }, [mode, game]);

  const { criteria, order } = sortOf();
  // Wait for the quest list to be downloaded (if online and still downloading), or offline for the packages to be read
  const loading = mode === QuestListMode.DOWNLOADING || !localQuestsReady();
  const { shown, total, filtered, added, updatable } = useMemo(
    () => (loading ? { shown: [], total: 0, filtered: 0, added: null, updatable: [] } : listQuests(criteria, order, search)),
    [loading, criteria, order, search, revision],
  );
  useEffect(() => reportAdded(added), [added]);
  // Igor's scenario, once the list has it: its details, or its download (openScenarioWhenListed)
  useEffect(() => {
    if (loading || openWhenListed === null) return;
    const wanted = openWhenListed;
    openWhenListed = null;
    const key = game.questsList.getList(criteria).find((k) => game.questsList.getQuestData(k).identifier.toLowerCase() === wanted);
    if (key === undefined) {
      update({ notice: uni('IGOR_NOT_LISTED') });
      return;
    }
    // One ready to play opens; one still to download is shown in the list, lit, for the player to decide
    const q = game.questsList.getQuestData(key);
    if (!online() || (q.downloaded && !q.update_available)) void select(key);
    else setHighlight(key);
  }, [loading]);
  // The scenario Igor brought the player to, in view and lit for a while; or why it is not there
  const [highlight, setHighlight] = useState<string | null>(null);
  useEffect(() => {
    if (highlight === null) return;
    const card = document.querySelector(`.quest.card[data-key="${CSS.escape(highlight)}"]`);
    if (card === null) {
      update({ notice: uni('IGOR_FILTERED') });
      setHighlight(null);
      return;
    }
    card.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const timer = setTimeout(() => setHighlight(null), 6000);
    return () => clearTimeout(timer);
  }, [highlight]);
  const filters = loading ? [] : activeFilters(search);
  const count =
    filtered > 0
      ? val('FILTER_TEXT_TOTAL_AND_FILTERED').split('{0}').join(String(total - filtered)).split('{1}').join(String(filtered))
      : val('FILTER_TEXT_TOTAL_ONLY', total);

  return (
    <main className="screen quest-selection">
      <header className="screen-head">
        <button type="button" className="button back" onClick={() => run(() => GameStateManager.mainMenu())}>
          {val('BACK')}
        </button>
        <h1>{val('SELECT', game.gameType.questName())}</h1>
        <OnlineModeButton />
      </header>

      <div className="list-tools">
        <p className="count quiet" aria-live="polite">
          {loading ? '' : count}
        </p>
        <label className="search">
          <span className="visually-hidden">{val('SEARCH_BY_NAME')}</span>
          <input
            type="search"
            value={searchText}
            placeholder={val('SEARCH_BY_NAME')}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && performSearch()}
            onBlur={performSearch}
          />
        </label>
        <button
          type="button"
          className="button filter-button"
          aria-haspopup="dialog"
          title={val('FILTER_TITLE')}
          data-active={filters.length > 0 ? '' : undefined}
          onClick={() => setFiltering(true)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3.5 5h17l-6.5 7.5v5.5l-4 2v-7.5z" />
          </svg>
          <span className="visually-hidden">{val('FILTER_TITLE')}</span>
          {/* Not in Valkyrie: how many filters are on, on the button itself */}
          {filters.length > 0 && <span className="filter-count">{filters.length}</span>}
        </button>
        <div className="sort">
          <label>
            {/* Not Valkyrie's own SORT_TITLE: some of its languages call it classify or filter (Spanish "Clasificar") */}
            <span>{uni('SORT_TITLE')}</span>{' '}
            <span className="select">
              <select value={criteria} onChange={(e) => run(() => setSort(e.target.value, order))}>
                {SORT_OPTIONS_OFFLINE.map(([option, key]) => (
                  <option key={option} value={option}>
                    {val(key)}
                  </option>
                ))}
                {/* The store's statistics sort the list only online (DrawSortCriteriaButtons) */}
                {SORT_OPTIONS_ONLINE.map(([option, key]) => (
                  <option key={option} value={option} disabled={!online()}>
                    {val(key)}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <span className="select">
            <select value={order} onChange={(e) => run(() => setSort(criteria, e.target.value))} aria-label={val('SORT_SELECT_ORDER')}>
              <option value="ascending">{val('SORT_ASCENDING')}</option>
              <option value="descending">{val('SORT_DESCENDING')}</option>
            </select>
          </span>
        </div>
        <button
          type="button"
          className="button reload"
          onClick={() =>
            run(() => {
              // The reload button
              game.questsList.unloadLocalQuests();
              update();
            })
          }
        >
          {uni('RELOAD_LIST')}
        </button>
        <button type="button" className="button add-scenario" onClick={() => input.current?.click()}>
          {uni('ADD_SCENARIO')}
        </button>
        {/* Not in Valkyrie: every downloaded scenario with a newer version, one after another (issues 1448 and 1151) */}
        {updatable.length > 0 && (
          <button type="button" className="button primary" onClick={() => updateAll(updatable)}>
            {uni('UPDATE_ALL', updatable.length)}
          </button>
        )}
        <input
          ref={input}
          className="visually-hidden"
          type="file"
          accept=".valkyrie,.zip"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) void addScenario(file);
          }}
        />
      </div>

      {/* Not in Valkyrie: what the list is filtered by, and a way to show it all again */}
      {filters.length > 0 && (
        <div className="active-filters" role="status">
          <span className="active-filters-title">{uni('FILTERS_ON', total - filtered, total)}</span>
          <span className="active-filters-list">
            {filters.map((label, i) => (
              <span key={i} className="active-filter">
                {label}
              </span>
            ))}
          </span>
          <button
            type="button"
            className="button active-filters-clear"
            onClick={() =>
              run(() => {
                clearFilters();
                setSearchText('');
                setSearch('');
                update();
              })
            }
          >
            {uni('FILTERS_CLEAR')}
          </button>
        </div>
      )}
      {filtering && <FilterPopup close={() => setFiltering(false)} />}
      <ScenarioReport />

      {loading ? (
        <p className="empty" role="status">
          {val('LOADINGSCENARIOS')}
        </p>
      ) : shown.length === 0 && total === 0 && !online() ? (
        <p className="empty">{uni('NO_SCENARIOS')}</p>
      ) : shown.length === 0 && filtered > 0 ? (
        <p className="empty">{uni('FILTERS_HIDE_ALL')}</p>
      ) : (
        <ul className="quests">
          {shown.map((listed) => (
            <li key={listed.key}>
              {listed.heading !== null && <h2 className="sort-heading">{listed.heading}</h2>}
              <QuestCard listed={listed} highlighted={listed.key === highlight} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

// Valkyrie: QuestSelectionScreen.cs QuestSelectionScreen.ShowQuestLoadError
export function QuestLoadErrorScreen({ questName, packageUrl, questKey }: { questName: string; packageUrl: string; questKey: string }) {
  // Report error button (only shown when a GitHub issues URL can be built)
  const reportUrl = buildGitHubIssueUrl(packageUrl);
  return (
    <main className="screen quest-load-error">
      <section className="panel load-error" role="alertdialog" aria-labelledby="load-error-title">
        <h1 id="load-error-title">{val('QUEST_LOAD_ERROR_TITLE')}</h1>
        <p>{new StringKey(new StringKey('val', 'QUEST_LOAD_ERROR_CANNOT_OPEN'), '{0}', questName).translate()}</p>
        <p className="quiet">{val('QUEST_LOAD_ERROR_DETAIL')}</p>
        <div className="load-error-actions">
          <button
            type="button"
            className="button primary"
            onClick={() =>
              run(() => {
                // Re-download button (primary action)
                const game = Game.get();
                const filePath = Path.combine(ContentData.downloadPath(), questKey + ValkyrieConstants.ScenarioDownloadContainerExtension);
                if (File.exists(filePath)) File.delete(filePath);
                game.questsList.setQuestAvailability(questKey, false);
                GameStateManager.Quest.list();
                selection(questKey);
              })
            }
          >
            {val('QUEST_LOAD_ERROR_REDOWNLOAD')}
          </button>
          {reportUrl !== null && (
            <a className="button" href={reportUrl} target="_blank" rel="noopener noreferrer">
              {val('QUEST_LOAD_ERROR_REPORT')}
            </a>
          )}
          <button type="button" className="button" onClick={() => run(() => GameStateManager.Quest.list())}>
            {val('QUEST_LOAD_ERROR_RETURN')}
          </button>
        </div>
      </section>
    </main>
  );
}
