// Not ported from Valkyrie: the store list with a scenario that has no name in its default language.
import { afterEach, describe, expect, it } from 'vitest';
import { Game, QuestData, QuestListMode, QuestsManager } from '../src/index.ts';

/** A manager with the store list already downloaded, without downloading it. */
function onlineManager(entries: [string, Map<string, string>][]): QuestsManager {
  const manager = Object.create(QuestsManager.prototype) as QuestsManager;
  Object.assign(manager, {
    quests_sorted_by_author: null,
    quest_list_mode: QuestListMode.ONLINE,
    force_local_quest: false,
    remote_quests_data: new Map(entries.map(([key, data]) => [key, new QuestData.Quest(key, data)])),
  });
  return manager;
}

function entry(lines: Record<string, string>): Map<string, string> {
  return new Map(Object.entries({ format: '21', type: 'MoM', latest_update: '2026-10-15T07:48:18Z', ...lines }));
}

describe('QuestsManager.sortQuests', () => {
  const saved = (Game as unknown as { game: unknown }).game;
  afterEach(() => {
    (Game as unknown as { game: unknown }).game = saved;
  });

  it('keeps the list when a scenario has no name in its default language (ElHorrorDeAylesbury, 15 October 2026)', () => {
    const game = {
      currentLang: 'Spanish',
      stats: { scenarios_stats: new Map() },
      gameType: { typeName: () => 'MoM', maxHeroes: () => 5, defaultHeroes: () => 2 },
      questsList: { quest_list_mode: QuestListMode.ONLINE },
    };
    (Game as unknown as { game: unknown }).game = game;
    const manager = onlineManager([
      ['ElHorrorDeAylesbury', entry({ defaultlanguage: 'Spanish', 'name.Italiano': "L' orrore di Aylesbury", 'name.Italian': "L' orrore di Aylesbury" })],
      ['Otro', entry({ defaultlanguage: 'English', 'name.English': 'Another', 'name.Spanish': 'Otro' })],
    ]);
    expect(() => manager.sortQuests()).not.toThrow();
    expect(manager.getList('name')).toEqual(['ElHorrorDeAylesbury', 'Otro']);
  });

  it('puts a difficulty that is not a number first, as float.CompareTo does (16 October 2026)', () => {
    (Game as unknown as { game: unknown }).game = {
      currentLang: 'English',
      stats: { scenarios_stats: new Map() },
      gameType: { typeName: () => 'MoM', maxHeroes: () => 5, defaultHeroes: () => 2 },
      questsList: { quest_list_mode: QuestListMode.ONLINE },
    };
    const manager = onlineManager(
      (
        [
          ['A', '0.5'],
          ['B', 'NaN'],
          ['C', '0.2'],
          ['D', 'NaN'],
        ] as const
      ).map(([key, difficulty]) => [key, entry({ defaultlanguage: 'English', 'name.English': key, difficulty })]),
    );
    manager.sortQuests();
    expect(manager.getList('difficulty')).toEqual(['D', 'B', 'C', 'A']);
  });
});
