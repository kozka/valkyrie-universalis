// Characterization tests of the local quest list (QuestsManager and the offline part of QuestSelectionScreen),
// written from Valkyrie's C#, which has no NUnit tests for it. Not ported from Valkyrie. They use the battery's
// setting and a few small packages written here.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { strToU8, zipSync } from 'fflate';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  ContentData,
  Directory,
  File,
  Game,
  GameStateManager,
  HeadlessUI,
  IniRead,
  Path,
  QuestData,
  QuestsManager,
  ValkyrieDebug,
} from '@universalis/engine';
import { createEnvironment, type Environment } from '../tools/battery/environment.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const EDITOR = '/AppData/Valkyrie/MoM/Editor/Local';

function questIni(extra: string): string {
  return `[Quest]\nformat=21\ntype=MoM\ndefaultlanguage=English\n${extra}\n\n[QuestText]\nLocalization.English.txt\n`;
}

function text(name: string, author: string): string {
  return `.,English\nquest.name,${name}\nquest.authors_short,${author}\n`;
}

function writePackage(id: string, ini: string, localization: string): void {
  const zip = zipSync({ 'quest.ini': strToU8(ini), 'Localization.English.txt': strToU8(localization) });
  File.writeAllBytes(ContentData.downloadPath() + '/' + id + '.valkyrie', zip);
}

function extracted(id: string): string {
  return Path.combine(ContentData.tempValkyriePath, id + '.valkyrie');
}

describe('QuestsManager, local quests', () => {
  let env: Environment;
  let game: Game;

  beforeAll(() => {
    env = createEnvironment('MoM', join(root, 'packages/engine/data'), []);
    game = env.game;
  });

  beforeEach(() => {
    Game.game = game;
    game.ui = new HeadlessUI();
    for (const folder of [ContentData.downloadPath(), '/AppData/Valkyrie/MoM/Editor', ContentData.tempValkyriePath]) {
      if (Directory.exists(folder)) Directory.delete(folder, true);
    }
    writePackage('Alpha', questIni('difficulty=0.4\nlengthmin=60\nlengthmax=90'), text('Zeta Mystery', 'Alice'));
    writePackage('Beta', questIni('difficulty=0.8\nlengthmin=90\nlengthmax=120'), text('Alpha Night', 'Bob'));
    writePackage('Secret', questIni('hidden=True'), text('Secret', 'Carol'));
    writePackage('Descent', questIni('').replace('type=MoM', 'type=D2E'), text('Dungeon', 'Dave'));
    File.writeAllText(EDITOR + '/quest.ini', questIni('difficulty=0.6\nlengthmin=30\nlengthmax=45'));
    File.writeAllText(EDITOR + '/Localization.English.txt', text('Middle', 'Alice'));
    File.writeAllText(
      ContentData.downloadPath() + '/manifest.ini',
      '[Alpha]\nurl=https://raw.githubusercontent.com/someone/alpha/master/\nversion=abc\n\n[Gamma]\nversion=def\n',
    );
    game.questsList = new QuestsManager();
  });

  it('loads the downloaded packages and the editor quests of this game, without hidden ones', () => {
    game.questsList.loadAllLocalQuests();
    expect([...game.questsList.local_quests_data!.keys()].sort()).toEqual([EDITOR, extracted('Alpha'), extracted('Beta')].sort());
  });

  it('takes the package url from the download manifest', () => {
    game.questsList.loadAllLocalQuests();
    expect(game.questsList.local_quests_data!.get(extracted('Alpha'))!.package_url).toBe('https://raw.githubusercontent.com/someone/alpha/master/');
    expect(game.questsList.local_quests_data!.get(extracted('Beta'))!.package_url).toBe('');
  });

  it('sorts by translated name, difficulty and duration from small to high', () => {
    game.questsList.loadAllLocalQuests();
    game.questsList.sortQuests();
    expect(game.questsList.getList('name')).toEqual([extracted('Beta'), EDITOR, extracted('Alpha')]);
    expect(game.questsList.getList('difficulty')).toEqual([extracted('Alpha'), EDITOR, extracted('Beta')]);
    expect(game.questsList.getList('duration')).toEqual([EDITOR, extracted('Alpha'), extracted('Beta')]);
  });

  it('puts a quest whose sort value repeats before the ones added earlier', () => {
    game.questsList.loadAllLocalQuests();
    game.questsList.sortQuests();
    // Both Alice: the editor quest is added after the package, and SortedList's comparer puts it first
    expect(game.questsList.getList('author')).toEqual([EDITOR, extracted('Alpha'), extracted('Beta')]);
  });

  it('sorts again from scratch', () => {
    game.questsList.loadAllLocalQuests();
    game.questsList.sortQuests();
    game.questsList.sortQuests();
    expect(game.questsList.getList('name')).toHaveLength(3);
  });

  it('logs and gives the rating list for an unknown sort order', () => {
    game.questsList.loadAllLocalQuests();
    game.questsList.sortQuests();
    const log: string[] = [];
    const stop = ValkyrieDebug.onLog((m) => log.push(m ?? ''));
    try {
      expect(game.questsList.getList('colour')).toEqual([]);
    } finally {
      stop();
    }
    expect(log).toContain('Setting an unknown sort type, this should not happen');
  });

  it('gives the local data of a quest while offline', () => {
    game.questsList.loadAllLocalQuests();
    expect(game.questsList.getQuestData(EDITOR)).toBe(game.questsList.local_quests_data!.get(EDITOR));
  });

  it('forgets a deleted package in the manifest and unloads the list', () => {
    game.questsList.loadAllLocalQuests();
    File.delete(ContentData.downloadPath() + '/Alpha.valkyrie');
    game.questsList.setQuestAvailability('Alpha', false);
    const manifest = IniRead.readFromIni(ContentData.downloadPath() + '/manifest.ini')!;
    expect([...manifest.data.keys()]).toEqual(['Gamma']);
    expect(game.questsList.local_quests_data).toBeNull();
    expect(Directory.exists(ContentData.tempValkyriePath)).toBe(false);

    game.questsList.loadAllLocalQuests();
    expect([...game.questsList.local_quests_data!.keys()].sort()).toEqual([EDITOR, extracted('Beta')].sort());
  });

  it('keeps the list loaded until it is unloaded', () => {
    game.questsList.loadAllLocalQuests();
    const first = game.questsList.local_quests_data;
    game.questsList.loadAllLocalQuests();
    expect(game.questsList.local_quests_data).toBe(first);
    game.questsList.unloadLocalQuests();
    expect(game.questsList.local_quests_data).toBeNull();
  });
});

describe('Game.SelectQuest and GameStateManager.Quest.List', () => {
  let game: Game;

  beforeAll(() => {
    game = createEnvironment('MoM', join(root, 'packages/engine/data'), []).game;
  });

  it('loads the packs the configuration selects and shows the quest list', () => {
    Game.game = game;
    const ui = new HeadlessUI();
    game.ui = ui;
    // The main menu reloads the content data with only the base pack
    GameStateManager.mainMenu();
    expect(game.cd.getLoadedPackIDs()).not.toContain('BtT');

    game.config.data.add('MoMPacks', 'BtT', '');
    GameStateManager.Quest.list();
    expect(ui.questSelections).toBe(1);
    expect(game.cd.getLoadedPackIDs()).toContain('BtT');
    expect(game.cd.getLoadedPackIDs()).not.toContain('HJ');
  });

  it('goes back from the hero selection to the details of the quest, read again', () => {
    Game.game = game;
    const ui = new HeadlessUI();
    game.ui = ui;
    File.writeAllText(EDITOR + '/quest.ini', questIni('lengthmax=45'));
    File.writeAllText(EDITOR + '/Localization.English.txt', text('Middle', 'Alice'));
    const quest = new QuestData.Quest(EDITOR);
    GameStateManager.Quest.start(quest);
    expect(game.currentQuest).not.toBeNull();

    GameStateManager.Quest.restart();
    expect(game.currentQuest).toBeNull();
    expect(ui.lastQuestDetails).not.toBe(quest);
    expect(ui.lastQuestDetails!.path).toBe(EDITOR);
    expect(ui.lastQuestDetails!.lengthMax).toBe(45);
  });

  it('goes to the quest list when there is no quest to restart', () => {
    Game.game = game;
    const ui = new HeadlessUI();
    game.ui = ui;
    game.currentQuest = null;
    GameStateManager.Quest.restart();
    expect(ui.lastQuestDetails).toBeNull();
    expect(ui.questSelections).toBe(1);
  });
});
