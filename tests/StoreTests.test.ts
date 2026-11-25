// Characterization tests of the store lists (HTTPManager, QuestsManager online, StatsManager, RemoteContentPackManager
// and QuestAndContentPackDownload), written from Valkyrie's C#, which has no NUnit tests for them. Not ported from
// Valkyrie. They use the battery's setting and a stand-in for the network: nothing leaves the computer.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { strToU8, zipSync } from 'fflate';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  ContentData,
  Directory,
  File,
  Game,
  HTTPManager,
  HeadlessUI,
  IniRead,
  QuestAndContentPackDownload,
  QuestListMode,
  QuestsManager,
  RemoteContentPackListMode,
  RemoteContentPackManager,
  ValkyrieDebug,
  type HTTPReply,
} from '@universalis/engine';
import { createEnvironment } from '../tools/battery/environment.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const MOM_LIST = 'https://raw.githubusercontent.com/NPBruce/valkyrie-store/master/MoM/manifestDownload.ini';
const MOM_PACKS = 'https://raw.githubusercontent.com/NPBruce/valkyrie-store/refs/heads/master/MoM/contentPacksManifestDownload.ini';

const LIST = `# Generated with 5 scenarios
[Alpha]
format=18
hidden=False
type=MoM
defaultlanguage=English
difficulty=0.4
lengthmin=60
lengthmax=90
image=alpha.jpg
version=AA
name.English=Zeta Mystery
name.Spanish=Abismo Z
synopsys.English=Find the meteorite.
authors_short.English=Alice
url=https://raw.githubusercontent.com/someone/alpha/master/
latest_update=2026-09-01T10:00:00Z
rating=7.5
play_count=12
duration=95.5
win_ratio=0.25

[Beta]
format=18
type=MoM
defaultlanguage=English
difficulty=0.8
lengthmax=120
version=BB
name.English=Alpha Night
authors_short.English=Bob
url=https://raw.githubusercontent.com/someone/beta/master/
latest_update=2025-06-11T16:44:26Z
rating=5.664172535211268
play_count=2272
duration=108.0459587955626
win_ratio=0.8648648648648649

[Gamma]
format=18
type=MoM
defaultlanguage=English
version=CC
name.English=Middle
url=https://raw.githubusercontent.com/someone/gamma/master/
latest_update=2020-01-01T00:00:00Z

[Delta]
format=18
type=MoM
defaultlanguage=English
version=DD
name.English=Delta
url=https://raw.githubusercontent.com/someone/delta/master/
latest_update=2024-01-01T00:00:00Z

[Broken]
format=99
type=MoM
defaultlanguage=English
version=EE
name.English=Broken
url=https://raw.githubusercontent.com/someone/broken/master/
`;

const PACK_LIST = `# Generated with 1 content packs
[TLE]
type=MoMCustom
defaultlanguage=Spanish
image="contentpackicon.png"
version=3
name.Spanish=Expediciones perdidas
name.English=Lost expeditions
description.Spanish=Expansión de losetas y monstruos.
url=https://raw.githubusercontent.com/xehnlp/TLE/main/
latest_update=2026-03-09T11:50:46Z
`;

/** Lets the stand-in network answer, as Unity's coroutines do on a later frame. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const requests: string[] = [];

/** The network: each address answers its text, null a network error, and anything else 404. */
function serve(files: Record<string, string | null>): void {
  HTTPManager.send = async (url: string): Promise<HTTPReply> => {
    requests.push(url);
    const file = files[url];
    if (file === undefined) return { status: 404, error: 'HTTP 404 Not Found' };
    if (file === null) return null;
    return { text: file };
  };
}

let game: Game;
let ui: HeadlessUI;

beforeAll(() => {
  game = createEnvironment('MoM', join(root, 'packages/engine/data'), []).game;
});

beforeEach(() => {
  Game.game = game;
  ui = new HeadlessUI();
  game.ui = ui;
  game.currentLang = 'English';
  game.stats.scenarios_stats = null;
  requests.length = 0;
  for (const folder of [ContentData.downloadPath(), ContentData.tempValkyriePath]) {
    if (Directory.exists(folder)) Directory.delete(folder, true);
  }
});

afterEach(() => {
  HTTPManager.send = null;
});

describe('HTTPManager.Get', () => {
  it('gives the text of the file', async () => {
    serve({ 'https://example.org/a.ini': '[A]\nb=c\n' });
    const answers: [string, boolean, string][] = [];
    HTTPManager.get('https://example.org/a.ini', (data, error, uri) => answers.push([data, error, uri]));
    expect(answers).toEqual([]);
    await flush();
    expect(answers).toEqual([['[A]\nb=c\n', false, 'https://example.org/a.ini']]);
  });

  it('reports a network error as Valkyrie does', async () => {
    serve({ 'https://example.org/a.ini': null });
    const answers: [string, boolean][] = [];
    HTTPManager.get('https://example.org/a.ini', (data, error) => answers.push([data, error]));
    await flush();
    expect(answers).toEqual([['ERROR NETWORK', true]]);
  });

  it('reports an HTTP error with its code after the error text', async () => {
    serve({});
    const answers: [string, boolean][] = [];
    HTTPManager.get('https://example.org/missing.ini', (data, error) => answers.push([data, error]));
    await flush();
    expect(answers).toEqual([['HTTP 404 Not Found 404', true]]);
  });

  it('ends every request as a network error when the host gives no way to send it', async () => {
    HTTPManager.send = null;
    const answers: [string, boolean][] = [];
    HTTPManager.get('https://example.org/a.ini', (data, error) => answers.push([data, error]));
    await flush();
    expect(answers).toEqual([['ERROR NETWORK', true]]);
  });

  it('takes a failed send for a network error', async () => {
    HTTPManager.send = () => Promise.reject(new TypeError('Failed to fetch'));
    const answers: [string, boolean][] = [];
    HTTPManager.get('https://example.org/a.ini', (data, error) => answers.push([data, error]));
    await flush();
    expect(answers).toEqual([['ERROR NETWORK', true]]);
  });
});

describe('QuestsManager, the store list', () => {
  it('downloads the list of the game chosen and goes online with it', async () => {
    serve({ [MOM_LIST]: LIST });
    const manager = new QuestsManager();
    expect(requests).toEqual([MOM_LIST]);
    expect(manager.quest_list_mode).toBe(QuestListMode.DOWNLOADING);
    const calls: boolean[] = [];
    manager.register_cb_download((available) => calls.push(available));
    await flush();
    expect(manager.quest_list_mode).toBe(QuestListMode.ONLINE);
    expect(calls).toEqual([true]);
    expect([...manager.remote_quests_data!.keys()]).toEqual(['Alpha', 'Beta', 'Gamma', 'Delta', 'Broken']);
    const alpha = manager.remote_quests_data!.get('Alpha')!;
    expect(alpha.identifier).toBe('alpha');
    expect(alpha.package_url).toBe('https://raw.githubusercontent.com/someone/alpha/master/');
    expect(alpha.version).toBe('AA');
    expect(alpha.image).toBe('alpha.jpg');
    expect([...alpha.languages_name!.keys()]).toEqual(['English', 'Spanish']);
    expect(manager.remote_quests_data!.get('Broken')!.valid).toBe(false);
  });

  it('marks the quests already downloaded, and offers an update when the list has another version', async () => {
    File.writeAllText(ContentData.downloadPath() + '/manifest.ini', '[Alpha]\nversion=AA\n\n[Beta]\nversion=OLD\n');
    serve({ [MOM_LIST]: LIST });
    const manager = new QuestsManager();
    await flush();
    const quest = (key: string) => manager.remote_quests_data!.get(key)!;
    expect([quest('Alpha').downloaded, quest('Alpha').update_available]).toEqual([true, false]);
    expect([quest('Beta').downloaded, quest('Beta').update_available]).toEqual([true, true]);
    expect([quest('Gamma').downloaded, quest('Gamma').update_available]).toEqual([false, false]);
  });

  it('stays offline when the player chose it while the list was downloading', async () => {
    serve({ [MOM_LIST]: LIST });
    const manager = new QuestsManager();
    manager.setMode(QuestListMode.LOCAL);
    await flush();
    expect(manager.quest_list_mode).toBe(QuestListMode.LOCAL);
    expect(manager.remote_quests_data!.size).toBe(5);
  });

  it('goes offline on a network error and tells the screen', async () => {
    serve({ [MOM_LIST]: null });
    const manager = new QuestsManager();
    const calls: boolean[] = [];
    manager.register_cb_download((available) => calls.push(available));
    await flush();
    expect(manager.quest_list_mode).toBe(QuestListMode.ERROR_DOWNLOAD);
    expect(manager.error_download).toBe(true);
    expect(manager.error_download_description).toBe('ERROR NETWORK');
    expect(calls).toEqual([false]);
  });

  it('takes an empty list for an error, but stays online as Valkyrie does', async () => {
    serve({ [MOM_LIST]: '# Generated with 0 scenarios\n' });
    const manager = new QuestsManager();
    const calls: boolean[] = [];
    manager.register_cb_download((available) => calls.push(available));
    await flush();
    expect(manager.error_download).toBe(true);
    expect(manager.error_download_description).toBe('ERROR: Quest list is empty');
    expect(calls).toEqual([false]);
    expect(manager.quest_list_mode).toBe(QuestListMode.ONLINE);
  });

  it('gives the data of the list while online', async () => {
    serve({ [MOM_LIST]: LIST });
    const manager = new QuestsManager();
    await flush();
    expect(manager.getQuestData('Beta')).toBe(manager.remote_quests_data!.get('Beta'));
  });

  it('sorts by the statistics of the list, from small to high, leaving out invalid quests', async () => {
    serve({ [MOM_LIST]: LIST });
    game.questsList = new QuestsManager();
    await flush();
    game.questsList.sortQuests();
    // Gamma and Delta have no statistics (0); Delta comes later in the list, so it goes first
    expect(game.questsList.getList('rating')).toEqual(['Delta', 'Gamma', 'Beta', 'Alpha']);
    expect(game.questsList.getList('average_win_ratio')).toEqual(['Delta', 'Gamma', 'Alpha', 'Beta']);
    expect(game.questsList.getList('average_duration')).toEqual(['Delta', 'Gamma', 'Alpha', 'Beta']);
    expect(game.questsList.getList('date')).toEqual(['Gamma', 'Delta', 'Beta', 'Alpha']);
    expect(game.questsList.getList('difficulty')).toEqual(['Delta', 'Gamma', 'Alpha', 'Beta']);
    expect(game.questsList.getList('duration')).toEqual(['Delta', 'Gamma', 'Alpha', 'Beta']);
  });

  it('sorts by name in the player language, or the default one, and by short author', async () => {
    serve({ [MOM_LIST]: LIST });
    game.questsList = new QuestsManager();
    await flush();
    game.questsList.sortQuests();
    expect(game.questsList.getList('name')).toEqual(['Beta', 'Delta', 'Gamma', 'Alpha']);
    // Without authors_short, the author is unknown, which sorts after Alice and Bob
    expect(game.questsList.getList('author')).toEqual(['Alpha', 'Beta', 'Delta', 'Gamma']);
    game.currentLang = 'Spanish';
    game.questsList.sortQuests();
    expect(game.questsList.getList('name')).toEqual(['Alpha', 'Beta', 'Delta', 'Gamma']);
  });

  it('sorts nothing online until there are statistics, as Valkyrie waits for them', async () => {
    serve({ [MOM_LIST]: LIST });
    game.questsList = new QuestsManager();
    await flush();
    game.stats.scenarios_stats = null;
    game.questsList.sortQuests();
    expect(game.questsList.getList('rating')).toEqual([]);
  });

  it('records a downloaded quest in the manifest with the version of the list', async () => {
    serve({ [MOM_LIST]: LIST });
    const manager = new QuestsManager();
    await flush();
    manager.setQuestAvailability('Gamma', true);
    const manifest = IniRead.readFromIni(ContentData.downloadPath() + '/manifest.ini')!;
    expect(manifest.get('Gamma', 'version')).toBe('CC');
    expect(manifest.get('Gamma', 'url')).toBe('https://raw.githubusercontent.com/someone/gamma/master/');
    expect(manifest.get('Gamma', 'name.English')).toBe('Middle');
    const gamma = manager.remote_quests_data!.get('Gamma')!;
    expect([gamma.downloaded, gamma.update_available]).toEqual([true, false]);
  });
});

describe('StatsManager, from the store list', () => {
  it('keeps the statistics of each scenario under its package name, as Valkyrie keys the ones it downloads', async () => {
    expect(game.stats.scenarios_stats).toBeNull();
    serve({ [MOM_LIST]: LIST });
    new QuestsManager();
    await flush();
    const stats = game.stats.scenarios_stats!;
    expect([...stats.keys()]).toEqual(['alpha.valkyrie', 'beta.valkyrie']);
    expect(stats.get('beta.valkyrie')).toEqual({
      scenario_name: 'beta.valkyrie',
      scenario_play_count: 2272,
      scenario_avg_rating: Math.fround(5.664172535211268),
      scenario_avg_duration: Math.fround(108.0459587955626),
      scenario_avg_win_ratio: Math.fround(0.8648648648648649),
    });
  });
});

describe('RemoteContentPackManager', () => {
  it('downloads the content pack list of the game chosen', async () => {
    serve({ [MOM_PACKS]: PACK_LIST });
    const manager = new RemoteContentPackManager();
    expect(requests).toEqual([MOM_PACKS]);
    expect(manager.content_pack_list_Mode).toBe(RemoteContentPackListMode.DOWNLOADING);
    await flush();
    expect(manager.content_pack_list_Mode).toBe(RemoteContentPackListMode.ONLINE);
    const tle = manager.remote_RemoteContentPack_data!.get('TLE')!;
    expect(tle.identifier).toBe('TLE');
    expect(tle.type).toBe('MoMCustom');
    expect(tle.image).toBe('contentpackicon.png');
    expect(tle.version).toBe('3');
    expect(tle.package_url).toBe('https://raw.githubusercontent.com/xehnlp/TLE/main/');
    // The list names Spanish as its default, but RemoteContentPack keeps English, Valkyrie's
    expect(tle.getTitle('French')).toBe('Lost expeditions');
    expect(tle.getDescription('French')).toBe('');
    expect(RemoteContentPackManager.getCustomCategory()).toBe('MoMCustom');
  });

  it('marks a downloaded pack, and offers an update when the list has another version', async () => {
    File.writeAllText(ContentData.customContentPackPath() + '/manifest.ini', '[TLE]\nversion=2\n');
    serve({ [MOM_PACKS]: PACK_LIST });
    const manager = new RemoteContentPackManager();
    await flush();
    const tle = manager.remote_RemoteContentPack_data!.get('TLE')!;
    expect([tle.downloaded, tle.update_available]).toEqual([true, true]);
  });

  it('records a downloaded pack in its manifest, and forgets it when deleted', async () => {
    serve({ [MOM_PACKS]: PACK_LIST });
    const manager = new RemoteContentPackManager();
    await flush();
    manager.setContentPackAvailability('TLE', true);
    let manifest = IniRead.readFromIni(ContentData.customContentPackPath() + '/manifest.ini')!;
    expect(manifest.get('TLE', 'identifier')).toBe('TLE');
    // ToString writes type twice, the pack's and the game's; the first one wins
    expect(manifest.get('TLE', 'type')).toBe('MoMCustom');
    expect(manifest.get('TLE', 'version')).toBe('3');
    expect(manifest.get('TLE', 'image')).toBe('contentpackicon.png');
    const tle = manager.remote_RemoteContentPack_data!.get('TLE')!;
    expect([tle.downloaded, tle.update_available]).toEqual([true, false]);

    manager.setContentPackAvailability('TLE', false);
    manifest = IniRead.readFromIni(ContentData.customContentPackPath() + '/manifest.ini')!;
    expect(manifest.data.has('TLE')).toBe(false);
    expect(tle.downloaded).toBe(false);
  });

  it('goes offline on a network error', async () => {
    serve({ [MOM_PACKS]: null });
    const manager = new RemoteContentPackManager();
    await flush();
    expect(manager.content_pack_list_Mode).toBe(RemoteContentPackListMode.ERROR_DOWNLOAD);
    expect(manager.error_download_description).toBe('ERROR NETWORK');
  });
});

describe('QuestAndContentPackDownload', () => {
  function packZip(id: string): Uint8Array {
    return zipSync({ 'content_pack.ini': strToU8(`[ContentPack]\nname=Test pack\nid=${id}\ntype=MoMCustom\n`) });
  }

  it('downloads a quest from the url of the list, and a pack from its own', async () => {
    serve({ [MOM_LIST]: LIST, [MOM_PACKS]: PACK_LIST });
    game.questsList = new QuestsManager();
    game.remoteContentPackManager = new RemoteContentPackManager();
    await flush();
    const quest = new QuestAndContentPackDownload();
    quest.download('Beta', false);
    expect(quest.start()).toBe('https://raw.githubusercontent.com/someone/beta/master/Beta.valkyrie');
    const pack = new QuestAndContentPackDownload();
    pack.download('TLE', true);
    expect(pack.start()).toBe('https://raw.githubusercontent.com/xehnlp/TLE/main/TLE.valkyrieContentPack');
  });

  it('downloads nothing without a key, or for a pack the list does not have', async () => {
    serve({ [MOM_PACKS]: PACK_LIST });
    game.remoteContentPackManager = new RemoteContentPackManager();
    await flush();
    const log: string[] = [];
    const stop = ValkyrieDebug.onLog((m) => log.push(m ?? ''));
    try {
      expect(new QuestAndContentPackDownload().start()).toBeNull();
      const pack = new QuestAndContentPackDownload();
      pack.download('DooM', true);
      expect(pack.start()).toBeNull();
    } finally {
      stop();
    }
    expect(log).toEqual(['Download key is not set, this should not happen', 'Could not find package DooM locally.']);
  });

  it('saves a quest to the download folder, records it and updates its button', async () => {
    serve({ [MOM_LIST]: LIST });
    game.questsList = new QuestsManager();
    await flush();
    const download = new QuestAndContentPackDownload();
    download.download('Gamma', false);
    download.start();
    ui.tags.add('dialog');
    download.save('Gamma', false, new Uint8Array([1, 2, 3]));
    expect([...File.readAllBytes(ContentData.downloadPath() + '/Gamma.valkyrie')]).toEqual([1, 2, 3]);
    expect(IniRead.readFromIni(ContentData.downloadPath() + '/manifest.ini')!.get('Gamma', 'version')).toBe('CC');
    expect(game.questsList.remote_quests_data!.get('Gamma')!.downloaded).toBe(true);
    expect(ui.findTag('dialog')).toBe(false);
    expect(ui.questButtonUpdates).toEqual(['Gamma']);
  });

  it('saves a pack to the content pack folder, adds it to the content and shows the pack list again', async () => {
    serve({ [MOM_PACKS]: PACK_LIST });
    game.remoteContentPackManager = new RemoteContentPackManager();
    await flush();
    const download = new QuestAndContentPackDownload();
    download.download('TLE', true);
    download.start();
    download.save('TLE', true, packZip('TLE'));
    expect(File.exists(ContentData.customContentPackPath() + '/TLE.valkyrieContentPack')).toBe(true);
    expect(IniRead.readFromIni(ContentData.customContentPackPath() + '/manifest.ini')!.get('TLE', 'version')).toBe('3');
    expect(game.cd.allPacks.some((p) => p.id === 'TLE')).toBe(true);
    expect(ui.contentSelectDownloads).toBe(1);
  });

  it('does nothing when the download failed', async () => {
    serve({ [MOM_LIST]: LIST });
    game.questsList = new QuestsManager();
    await flush();
    const download = new QuestAndContentPackDownload();
    download.download('Gamma', false);
    download.start();
    download.save('Gamma', false, null);
    download.save('Gamma', false, new Uint8Array(0));
    expect(File.exists(ContentData.downloadPath() + '/Gamma.valkyrie')).toBe(false);
    expect(ui.questButtonUpdates).toEqual([]);
  });
});
