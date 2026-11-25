// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/QuestsManager.cs
// The store list comes through HTTPManager, whose sending is the host's. Its statistics, which Valkyrie downloads
// apart, come with it (StatsManager).
import { Game } from '../Game.ts';
import { HTTPManager } from '../HTTPManager.ts';
import { dictAdd, dictGet } from '../platform/CSharp.ts';
import { File, Path } from '../platform/SystemIO.ts';
import { IniRead } from '../ValkyrieTools/IniRead.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { ValkyrieConstants } from '../ValkyrieConstants.ts';
import { ContentData } from './ContentData.ts';
import { ExtractManager } from './ExtractManager.ts';
import { LocalizationRead } from './LocalizationRead.ts';
import { ManifestManager } from './ManifestManager.ts';
import { QuestData } from './QuestData.ts';
import { QuestLoader } from './QuestLoader.ts';

// Valkyrie: QuestsManager.cs QuestsManager.QuestListMode
export const QuestListMode = {
  ONLINE: 0,
  LOCAL: 1,
  DOWNLOADING: 2,
  ERROR_DOWNLOAD: 3,
} as const;
export type QuestListMode = number;

/** string.CompareTo with the invariant culture, which Valkyrie runs with: letter case only breaks ties (a < B < b). */
const invariantCollator = new Intl.Collator('en-US', { usage: 'sort', sensitivity: 'variant', caseFirst: 'lower' });

/**
 * SortedList<TKey, string> with Valkyrie's DuplicateKeyComparer, which counts equal keys as greater. Array.BinarySearch
 * compares each stored key with the new one, so a new key goes before the equal keys already there.
 */
// Valkyrie: QuestsManager.cs QuestsManager.DuplicateKeyComparer
class DuplicateKeySortedList<TKey> {
  private readonly keys: TKey[] = [];
  private readonly values: string[] = [];
  private readonly compareTo: (x: TKey, y: TKey) => number;

  constructor(compareTo: (x: TKey, y: TKey) => number) {
    this.compareTo = compareTo;
  }

  add(key: TKey, value: string): void {
    let lo = 0;
    let hi = this.keys.length - 1;
    while (lo <= hi) {
      const i = lo + ((hi - lo) >> 1);
      const result = this.compareTo(this.keys[i]!, key);
      // Handle equality as beeing greater
      const order = result === 0 ? 1 : result;
      if (order < 0) lo = i + 1;
      else hi = i - 1;
    }
    this.keys.splice(lo, 0, key);
    this.values.splice(lo, 0, value);
  }

  clear(): void {
    this.keys.length = 0;
    this.values.length = 0;
  }

  /** Values.ToList() */
  valuesList(): string[] {
    return [...this.values];
  }
}

/** float.CompareTo, which Valkyrie's sorted lists use: NaN is smaller than any number and equal to itself. */
const compareNumbers = (x: number, y: number): number =>
  x < y ? -1 : x > y ? 1 : x === y ? 0 : Number.isNaN(x) ? (Number.isNaN(y) ? 0 : -1) : 1;
const compareStrings = (x: string, y: string): number => invariantCollator.compare(x, y);
const compareDates = (x: Date, y: Date): number => compareNumbers(x.getTime(), y.getTime());

// Valkyrie: QuestsManager.cs QuestsManager
export class QuestsManager {
  static readonly QuestListMode = QuestListMode;

  // Ini content for all remote quests
  //   key : quest name
  //   value : Quest object
  remote_quests_data: Map<string, QuestData.Quest> | null = null;

  // Ini content for all local quests (only required when offline)
  //   key : quest name
  //   value : Quest object
  local_quests_data: Map<string, QuestData.Quest> | null = null;

  // List of all quests sorted from small to high (should be displayed the other way)
  //   key : sort value
  //   value : Quest package name
  private quests_sorted_by_author: DuplicateKeySortedList<string> | null = null;
  private quests_sorted_by_name: DuplicateKeySortedList<string> | null = null;
  private quests_sorted_by_difficulty: DuplicateKeySortedList<number> | null = null;
  private quests_sorted_by_duration: DuplicateKeySortedList<number> | null = null;

  private quests_sorted_by_rating: DuplicateKeySortedList<number> | null = null;
  private quests_sorted_by_date: DuplicateKeySortedList<Date> | null = null;
  private quests_sorted_by_win_ratio: DuplicateKeySortedList<number> | null = null;
  private quests_sorted_by_avg_duration: DuplicateKeySortedList<number> | null = null;

  // status of download of quest list
  error_download = false;
  error_download_description = '';

  // Callback when download is done
  private cb_download: ((available: boolean) => void) | null = null;

  // Current mode to get quest list
  // Default is local, it changes when file has been downloaded
  // It can also be set by user
  quest_list_mode: QuestListMode = QuestListMode.LOCAL;
  private force_local_quest = false;

  // Valkyrie: QuestsManager.cs QuestsManager.QuestsManager
  constructor() {
    this.remote_quests_data = new Map();

    const game = Game.get();

    // -- Download remote quests list INI file --
    if (game.gameType.typeName() === ValkyrieConstants.typeMom) {
      HTTPManager.get('https://raw.githubusercontent.com/NPBruce/valkyrie-store/master/MoM/manifestDownload.ini', (data, error, uri) =>
        this.questsDownload_callback(data, error, uri),
      );
      this.quest_list_mode = QuestListMode.DOWNLOADING;
    } else if (game.gameType.typeName() === ValkyrieConstants.typeDescent) {
      HTTPManager.get('https://raw.githubusercontent.com/NPBruce/valkyrie-store/master/D2E/manifestDownload.ini', (data, error, uri) =>
        this.questsDownload_callback(data, error, uri),
      );
      this.quest_list_mode = QuestListMode.DOWNLOADING;
    } else {
      ValkyrieDebug.log('ERROR: DownloadQuests is called when no game type has been selected');
      return;
    }
  }

  // Valkyrie: QuestsManager.cs QuestsManager.Register_cb_download
  register_cb_download(cb_download_p: (available: boolean) => void): void {
    this.cb_download = cb_download_p;
  }

  // This is called by a user action
  // Valkyrie: QuestsManager.cs QuestsManager.SetMode
  setMode(qlm: QuestListMode): void {
    this.quest_list_mode = qlm;

    if (qlm === QuestListMode.ONLINE) {
      this.force_local_quest = false;
    } else {
      this.force_local_quest = true;
    }
  }

  // Valkyrie: QuestsManager.cs QuestsManager.QuestsDownload_callback
  private questsDownload_callback(data: string, error: boolean, _uri: string): void {
    if (error) {
      this.error_download = true;
      this.error_download_description = data;
      // Callback to display screen
      if (this.cb_download !== null) this.cb_download(false);

      this.quest_list_mode = QuestListMode.ERROR_DOWNLOAD;

      return;
    }

    if (!this.force_local_quest) this.quest_list_mode = QuestListMode.ONLINE;

    // Not in Valkyrie (16 October 2026): a list that cannot be read ends as a download error, so the local quests show
    try {
      // Parse ini
      const remoteManifest = IniRead.readFromString(data)!;
      for (const [key, value] of remoteManifest.data) {
        // Not in Valkyrie (16 October 2026): an entry that throws is logged and left out of the list
        try {
          dictAdd(this.remote_quests_data!, key, new QuestData.Quest(key, value));
        } catch (e) {
          ValkyrieDebug.log('Warning: Skipping quest of the store list: ' + key + '\nException: ' + String(e));
        }
      }
      // Not in Valkyrie: the list carries the statistics that Valkyrie downloads apart (StatsManager)
      Game.game?.stats.readListStats(remoteManifest);

      if (this.remote_quests_data!.size > 0) this.checkLocalAvailability();
    } catch (e) {
      ValkyrieDebug.log('ERROR: Unable to read the quest list\nException: ' + String(e));
      this.remote_quests_data = new Map();
      this.questsDownload_callback('ERROR: Unable to read the quest list: ' + String(e), true, _uri);
      return;
    }

    if (this.remote_quests_data!.size === 0) {
      ValkyrieDebug.log('ERROR: Quest list is empty\n');
      this.error_download = true;
      this.error_download_description = 'ERROR: Quest list is empty';
      if (this.cb_download !== null) this.cb_download(false);
      return;
    }

    if (this.cb_download !== null) this.cb_download(true);
  }

  // Valkyrie: QuestsManager.cs QuestsManager.CheckLocalAvailability
  private checkLocalAvailability(): void {
    const saveLocation = ContentData.downloadPath();
    const manager = new ManifestManager(saveLocation);
    const localManifest = manager.getLocalQuestManifestIniData();
    if (localManifest === null) return;

    // Update download status for each questData and check if update is available
    for (const [key, quest] of this.remote_quests_data!) {
      if (localManifest.data.has(key)) {
        quest.downloaded = true;
        // Not in Valkyrie (16 October 2026): an entry without version offers the update instead of throwing
        quest.update_available = localManifest.data.get(key)!.get('version') !== quest.version;
      }
    }
  }

  // Valkyrie: QuestsManager.cs QuestsManager.SetQuestAvailability
  setQuestAvailability(key: string, isAvailable: boolean): void {
    const saveLocation = ContentData.downloadPath();
    const manager = new ManifestManager(saveLocation);
    const localManifest = manager.getLocalQuestManifestIniData();

    if (isAvailable) {
      const downloaded_quest = IniRead.readFromString(dictGet(this.remote_quests_data!, key).toString())!;
      localManifest.remove(key);
      localManifest.add(key, dictGet(downloaded_quest.data, 'Quest'));

      // Update local cache if it exists
      if (this.local_quests_data !== null) {
        // Constructing a QuestData.Quest from IniData:
        const newQuest = new QuestData.Quest(key, dictGet(downloaded_quest.data, 'Quest'));
        newQuest.valid = true; // Assume valid if downloaded successfully

        this.local_quests_data.set(key, newQuest);
      }
    } else {
      if (localManifest.get(key) !== null) localManifest.remove(key);
      // we need to delete /temp and reload list
      this.unloadLocalQuests();
    }

    if (File.exists(saveLocation + ValkyrieConstants.ScenarioManifestPath)) {
      File.delete(saveLocation + ValkyrieConstants.ScenarioManifestPath);
    }
    File.writeAllText(saveLocation + ValkyrieConstants.ScenarioManifestPath, localManifest.toString());

    // update status quest
    const remote = this.remote_quests_data!.get(key);
    if (remote !== undefined) {
      remote.downloaded = isAvailable;
      remote.update_available = false;
    }
  }

  // Build sorted lists
  // Valkyrie: QuestsManager.cs QuestsManager.SortQuests
  sortQuests(): void {
    if (this.quests_sorted_by_author === null) {
      this.quests_sorted_by_author = new DuplicateKeySortedList(compareStrings);
      this.quests_sorted_by_name = new DuplicateKeySortedList(compareStrings);
      this.quests_sorted_by_difficulty = new DuplicateKeySortedList(compareNumbers);
      this.quests_sorted_by_duration = new DuplicateKeySortedList(compareNumbers);

      this.quests_sorted_by_rating = new DuplicateKeySortedList(compareNumbers);
      this.quests_sorted_by_date = new DuplicateKeySortedList(compareDates);
      this.quests_sorted_by_avg_duration = new DuplicateKeySortedList(compareNumbers);
      this.quests_sorted_by_win_ratio = new DuplicateKeySortedList(compareNumbers);
    } else {
      this.quests_sorted_by_author.clear();
      this.quests_sorted_by_name!.clear();
      this.quests_sorted_by_difficulty!.clear();
      this.quests_sorted_by_duration!.clear();

      this.quests_sorted_by_rating!.clear();
      this.quests_sorted_by_date!.clear();
      this.quests_sorted_by_avg_duration!.clear();
      this.quests_sorted_by_win_ratio!.clear();
    }

    if (this.quest_list_mode !== QuestListMode.ONLINE || this.force_local_quest) {
      if (this.local_quests_data === null) {
        ValkyrieDebug.log('INFO: No list of local quests available');
        return;
      }
      ValkyrieDebug.log('INFO: Sorting through ' + this.local_quests_data.size + ' local quests');

      for (const [key, quest] of this.local_quests_data) {
        LocalizationRead.removeDictionary('qst');
        LocalizationRead.addDictionary('qst', quest.localizationDict);
        this.quests_sorted_by_author.add(quest.getShortAuthor(), key);
        this.quests_sorted_by_name!.add(quest.name.translate(), key);
        this.quests_sorted_by_difficulty!.add(quest.difficulty, key);
        this.quests_sorted_by_duration!.add(quest.lengthMax, key);
      }
    } else {
      const game = Game.get();
      if (game.stats !== null && game.stats.scenarios_stats !== null) {
        // we should wait for stats to be available
        if (this.remote_quests_data === null) {
          ValkyrieDebug.log('INFO: No list of external quests available');
          return;
        }

        ValkyrieDebug.log('INFO: Sorting through stats data available for ' + this.remote_quests_data.size + ' scenarios');

        for (const [key, quest] of this.remote_quests_data) {
          if (!quest.valid) {
            ValkyrieDebug.log(`Skipping quest ${key} because of it was marked as invalid.`);
            continue;
          }

          const pkg_name = key.toLowerCase() + ValkyrieConstants.ScenarioDownloadContainerExtension;
          const stats = game.stats.scenarios_stats.get(pkg_name);
          if (stats !== undefined) {
            this.quests_sorted_by_rating!.add(stats.scenario_avg_rating, key);
            this.quests_sorted_by_avg_duration!.add(stats.scenario_avg_duration, key);
            this.quests_sorted_by_win_ratio!.add(stats.scenario_avg_win_ratio, key);
          } else {
            this.quests_sorted_by_rating!.add(0, key);
            this.quests_sorted_by_avg_duration!.add(0, key);
            this.quests_sorted_by_win_ratio!.add(0, key);
          }

          // Use player selected language or scenario default language for sort by name
          if (quest.languages_name!.has(game.currentLang)) {
            this.quests_sorted_by_name!.add(quest.languages_name!.get(game.currentLang)!, key);
          } else if (quest.languages_name!.has(quest.defaultLanguage)) {
            this.quests_sorted_by_name!.add(quest.languages_name!.get(quest.defaultLanguage)!, key);
          } else {
            // A scenario without a name in its default language (ElHorrorDeAylesbury in the store on 15 October 2026,
            // defaultlanguage=Spanish with only name.Italian): Valkyrie throws here and the whole list stays empty.
            // Its first name, or its key, as RemoteContentPack.getName does
            this.quests_sorted_by_name!.add(quest.languages_name!.values().next().value ?? key, key);
          }
          this.quests_sorted_by_difficulty!.add(quest.difficulty, key);
          this.quests_sorted_by_duration!.add(quest.lengthMax, key);
          this.quests_sorted_by_date!.add(quest.latest_update, key);
          this.quests_sorted_by_author.add(quest.getShortAuthor(), key);
        }
      }
    }
  }

  // Valkyrie: QuestsManager.cs QuestsManager.GetList
  getList(sortOrder: string): string[] {
    let ret: string[];

    switch (sortOrder) {
      case 'author':
        ret = this.quests_sorted_by_author!.valuesList();
        break;

      case 'name':
        ret = this.quests_sorted_by_name!.valuesList();
        break;

      case 'difficulty':
        ret = this.quests_sorted_by_difficulty!.valuesList();
        break;

      case 'duration':
        ret = this.quests_sorted_by_duration!.valuesList();
        break;

      case 'rating':
        ret = this.quests_sorted_by_rating!.valuesList();
        break;

      case 'date':
        ret = this.quests_sorted_by_date!.valuesList();
        break;

      case 'average_win_ratio':
        ret = this.quests_sorted_by_win_ratio!.valuesList();
        break;

      case 'average_duration':
        ret = this.quests_sorted_by_avg_duration!.valuesList();
        break;

      default:
        ValkyrieDebug.log('Setting an unknown sort type, this should not happen');
        ret = this.quests_sorted_by_rating!.valuesList();
        break;
    }

    return ret;
  }

  // Valkyrie: QuestsManager.cs QuestsManager.GetQuestData
  getQuestData(key: string): QuestData.Quest {
    if (this.quest_list_mode === QuestListMode.ONLINE && !this.force_local_quest) return dictGet(this.remote_quests_data!, key);
    else return dictGet(this.local_quests_data!, key);
  }

  // --- Management of local quests, when offline ---
  // Valkyrie: QuestsManager.cs QuestsManager.LoadAllLocalQuests
  loadAllLocalQuests(): void {
    if (this.local_quests_data === null) {
      // Clean up temporary files
      this.unloadLocalQuests();
      // extract and load local quest
      this.local_quests_data = QuestLoader.getQuests();
      this.applyLocalManifestData(this.local_quests_data);
    }
  }

  /** The virtual file system answers synchronously, so the list is loaded before the callback, as LoadAllLocalQuests. */
  // Valkyrie: QuestsManager.cs QuestsManager.LoadAllLocalQuestsAsync
  loadAllLocalQuestsAsync(callback: (() => void) | null): void {
    this.loadAllLocalQuests();
    callback?.();
  }

  // Valkyrie: QuestsManager.cs QuestsManager.UnloadLocalQuests
  unloadLocalQuests(): void {
    if (this.local_quests_data !== null) {
      // Clean up temporary files
      ExtractManager.cleanTemp();
      this.local_quests_data = null;
    }
  }

  // Valkyrie: QuestsManager.cs QuestsManager.ApplyLocalManifestData
  private applyLocalManifestData(quests: Map<string, QuestData.Quest>): void {
    const saveLocation = ContentData.downloadPath();
    const manager = new ManifestManager(saveLocation);
    const localManifest = manager.getLocalQuestManifestIniData();
    if (localManifest === null) return;

    for (const [key, quest] of quests) {
      let shortKey = Path.getFileName(key) ?? '';
      if (shortKey.endsWith(ValkyrieConstants.ScenarioDownloadContainerExtension)) {
        shortKey = shortKey.substring(0, shortKey.length - ValkyrieConstants.ScenarioDownloadContainerExtension.length);
      }
      if (shortKey.length === 0) continue;

      const manifestEntry = localManifest.data.get(shortKey);
      if (manifestEntry !== undefined) {
        const url = manifestEntry.get('url');
        if (url !== undefined) {
          quest.package_url = url;
        }
      }
    }
  }
}
