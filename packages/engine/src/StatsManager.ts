// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/StatsManager.cs
// The statistics of each scenario (scenarios_stats): Valkyrie downloads them from Google Drive, which allows no CORS;
// the store copies the same figures into its scenario lists every hour (manifest_sync.py: rating, play_count, duration
// and win_ratio), so they are read from the list QuestsManager downloads. Publishing the result of a game (PrepareStats
// and PublishData) goes to Valkyrie's Google Form, as in Valkyrie (with Quantumrunner's permission, October 2026).
import { Game } from './Game.ts';
import { HTTPManager } from './HTTPManager.ts';
import type { IniData } from './ValkyrieTools/IniRead.ts';
import { Path } from './platform/SystemIO.ts';
import { floatToString, floatTryParse, remove } from './platform/CSharp.ts';
import { ValkyrieConstants } from './ValkyrieConstants.ts';

/** Valkyrie's Google Form, whose answers become the store's statistics. */
export const STATS_FORM_URL =
  'https://docs.google.com/forms/u/1/d/e/1FAIpQLSfiFPuQOTXJI54LI-WNvn1K6qCkM5xErxJdUUJRhCZthaIqcA/formResponse?hl=en';

/*
 * We gather the following information for each scenario:
 *    scenario_name
 *    scenario_play_count
 *    scenario_avg_rating  from 1 (awful) to 1O (amazing)
 *    scenario_avg_duration  in minutes
 *    scenario_avg_win_ratio from 0 to 1 (in percent)
 */
// Valkyrie: StatsManager.cs ScenarioStats
export interface ScenarioStats {
  scenario_name: string;
  scenario_play_count: number;
  scenario_avg_rating: number;
  scenario_avg_duration: number;
  scenario_avg_win_ratio: number;
}

/*
 * Google Form is waiting for the following datas
 *
 *    Scenario ID/name (automatic)
 *    Victory (manual)
 *    Your rating for this scenario (1-10)  (manual)
 *    Optional: Comments / issue report / suggestion (manual)
 *    Game duration (automatic)
 *    Number of players (automatic)
 *    List of investigators (automatic)
 *    List of Events activated (automatic)
 */
// Valkyrie: StatsManager.cs PublishedGameStats
export class PublishedGameStats {
  scenario_name = '';
  quest_name = '';
  victory = '';
  rating = '';
  comments = '';
  duration = 0;
  players_count = 0;
  investigators_list = '';
  language_selected = '';
  events_list = '';
  vars_list = '';

  // Valkyrie: StatsManager.cs PublishedGameStats.Reset (quest_name is not reset)
  reset(): void {
    this.scenario_name = '';
    this.victory = '';
    this.rating = '';
    this.comments = '';
    this.duration = 0;
    this.players_count = 0;
    this.investigators_list = '';
    this.language_selected = '';
    this.events_list = '';
    this.vars_list = '';
  }
}

/** The keys under which the store list carries the statistics of a scenario. */
const LIST_KEYS = ['rating', 'play_count', 'duration', 'win_ratio'];

// This class provides functions to submit game stats download game stats
// Valkyrie: StatsManager.cs StatsManager
export class StatsManager {
  scenarios_stats: Map<string, ScenarioStats> | null = null;

  error_download = false;
  error_download_description = '';
  download_ongoing = false;

  // stats for current scenario, to be submitted
  gameStats: PublishedGameStats | null = null;

  // Valkyrie: StatsManager.cs StatsManager.PrepareStats
  prepareStats(victory: string, rating: number, comments: string): void {
    this.gameStats ??= new PublishedGameStats();
    const gameStats = this.gameStats;

    gameStats.reset();

    gameStats.victory = victory;

    if (rating === 0) gameStats.rating = 'not set';
    else gameStats.rating = rating.toString();

    gameStats.comments = comments;

    const game = Game.get();
    const quest = game.currentQuest!;

    // quest filename is the unique id
    gameStats.scenario_name = Path.getFileName(game.currentQuest!.originalPath);

    // language is required to see the quality of translations
    gameStats.language_selected = game.currentLang;

    // Get number of heroes
    for (const h of quest.heroes) {
      if (h.heroData !== null) {
        gameStats.players_count++;
        // remove leading 'hero' before hero name
        gameStats.investigators_list += remove(h.heroData.sectionName, 0, 4) + ';';
      }
    }

    // Get the list of events
    if (quest.eventList !== null) {
      for (const event_name of game.currentQuest!.eventList) {
        gameStats.events_list += event_name + ';';
      }
    } else {
      gameStats.events_list = 'no event (old save?)';
    }

    // max cell size of Google sheet is 50k characters (Valkyrie's Remove keeps nothing, and throws: its range ends
    // past the string)
    if (gameStats.events_list.length > 50000) {
      remove(gameStats.events_list, 88 + (gameStats.events_list.length - 50000), 50000);
      gameStats.events_list = '---Beginning of event list is not included to avoid exceeding google sheet max size---' + gameStats.events_list;
    }

    // Get the list of vars
    if (quest.vars !== null) {
      for (const [key, value] of quest.vars.vars) {
        if (value !== 0) {
          gameStats.vars_list += key + '=' + floatToString(value) + ';';
        }
      }
    } else {
      gameStats.events_list = 'no vars (old save?)';
    }
    // max cell size of Google sheet is 50k characters
    if (gameStats.vars_list.length > 50000) {
      remove(gameStats.vars_list, 88 + (gameStats.vars_list.length - 50000), 50000);
      gameStats.vars_list = '---Beginning of vars list is not included to avoid exceeding google sheet max size---' + gameStats.events_list;
    }

    if (quest.duration >= 0) {
      const current_duration = Date.now() - quest.start_time.getTime();
      gameStats.duration = quest.duration + Math.trunc(current_duration / 60000);
    } else {
      gameStats.duration = 0;
    }

    gameStats.quest_name = quest.qd.quest.name.translate();
  }

  /** send data to google forms; done (not in Valkyrie, whose callback does nothing) says whether it went out. */
  // Valkyrie: StatsManager.cs StatsManager.PublishData
  publishData(done: (error: boolean) => void = () => {}): void {
    const gameStats = this.gameStats!;
    const formFields: [string, string][] = [
      ['entry.1875990408', gameStats.scenario_name],
      ['entry.989998412', gameStats.quest_name],
      ['entry.84574628', gameStats.victory],
      ['entry.227102998', gameStats.rating],
      ['entry.2125749314', gameStats.comments],
      ['entry.170795919', gameStats.duration.toString()],
      ['entry.376629889', gameStats.players_count.toString()],
      ['entry.1150567176', gameStats.investigators_list],
      ['entry.2106598722', gameStats.language_selected],
      ['entry.1047979960', gameStats.events_list],
      ['entry.571357850', gameStats.vars_list],
    ];

    // submit async
    HTTPManager.upload(STATS_FORM_URL, formFields, (_data, error) => done(error));
  }

  /**
   * Not in Valkyrie: the statistics a store list carries, kept as StatsDownload_callback keeps the downloaded ones,
   * under the package file name in lower case. A list without them for a scenario leaves it without statistics.
   */
  readListStats(remoteManifest: IniData): void {
    this.scenarios_stats ??= new Map();

    // one entry per scenario
    for (const [section, data] of remoteManifest.data) {
      if (!LIST_KEYS.some((key) => data.has(key))) continue;
      const scenario_name = section.toLowerCase() + ValkyrieConstants.ScenarioDownloadContainerExtension;
      const number = (key: string) => floatTryParse(data.get(key) ?? '').value;
      this.scenarios_stats.set(scenario_name, {
        scenario_name,
        scenario_play_count: Math.trunc(number('play_count')),
        scenario_avg_rating: number('rating'),
        scenario_avg_duration: number('duration'),
        scenario_avg_win_ratio: number('win_ratio'),
      });
    }
  }
}
