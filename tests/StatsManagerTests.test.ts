// Characterization tests of what a game publishes when the players rate it, written from Valkyrie's C#
// (StatsManager.cs PrepareStats and PublishData, HTTPManager.cs Upload), which has no NUnit tests for them. Not ported
// from Valkyrie. They use the battery's setting (all MoM base packs) and a small quest written here.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Application, File, Game, GameStateManager, HTTPManager, HeadlessUI, QuestData, Random, STATS_FORM_URL, ValkyrieDebug } from '@universalis/engine';
import { RoundControllerMoM } from '@universalis/module-mom';
import { createEnvironment, type Environment } from '../tools/battery/environment.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const QUEST = '/AppData/Valkyrie/MoM/Editor/StatsTest';

const QUEST_INI = `[Quest]
format=21
type=MoM
defaultlanguage=English
minhero=1
maxhero=5

[QuestText]
Localization.English.txt

[QuestData]
events.ini
`;

const TEXT = `.,English
quest.name,Stats test
EventStart.text,It begins.
EventStart.button1,Continue
EventNext.text,It goes on.
EventNext.button1,Continue
`;

const EVENTS = `[EventStart]
trigger=EventStart
buttons=1
event1=EventNext
operations=clues,=,2.5 zero,=,0

[EventNext]
buttons=1
event1=
`;

let env: Environment;
let ui: HeadlessUI;
let stopLog: () => void;

function startQuest(): void {
  File.writeAllText(QUEST + '/quest.ini', QUEST_INI);
  File.writeAllText(QUEST + '/Localization.English.txt', TEXT);
  File.writeAllText(QUEST + '/events.ini', EVENTS);
  GameStateManager.Quest.start(new QuestData.Quest(QUEST));
  const game = Game.get();
  game.heroCanvas.heroSelection!.select('HeroRitaYoung');
  game.heroCanvas.heroSelection!.select('HeroAgathaCrane');
  game.endSelection();
  game.questStartEvent();
  ui.lastDialog!.onButton(0);
  ui.lastDialog!.onButton(0);
}

describe('StatsManager', () => {
  beforeAll(() => {
    env = createEnvironment('MoM', join(root, 'packages', 'engine', 'data'), []);
  }, 120_000);

  beforeEach(() => {
    ui = new HeadlessUI();
    env.game.ui = ui;
    env.game.roundControl = new RoundControllerMoM();
    Application.fatalErrors.length = 0;
    Random.initState(1);
    stopLog = ValkyrieDebug.onLog(() => {});
  });

  afterEach(() => {
    HTTPManager.post = null;
    stopLog();
  });

  it('PrepareStats_GathersTheGame', () => {
    startQuest();
    const stats = Game.get().stats;
    stats.prepareStats('true', 8, 'Great fun');
    const s = stats.gameStats!;

    expect(s.scenario_name).toBe('StatsTest');
    expect(s.quest_name).toBe('Stats test');
    expect(s.victory).toBe('true');
    expect(s.rating).toBe('8');
    expect(s.comments).toBe('Great fun');
    expect(s.language_selected).toBe(Game.get().currentLang);
    expect(s.players_count).toBe(2);
    expect(s.investigators_list).toBe('RitaYoung;AgathaCrane;');
    expect(s.events_list).toBe('EventStart;EventNext;');
    // Only the variables that are not 0, as float.ToString writes them
    expect(s.vars_list).toContain('clues=2.5;');
    expect(s.vars_list).not.toContain('zero=');
    expect(s.duration).toBe(0);
  });

  it('PrepareStats_NoRatingIsNotSet', () => {
    startQuest();
    const stats = Game.get().stats;
    stats.prepareStats('false', 0, '');
    expect(stats.gameStats!.rating).toBe('not set');
  });

  it('PrepareStats_LongEventListThrowsAsValkyrie', () => {
    startQuest();
    const quest = Game.get().currentQuest!;
    for (let i = 0; i < 5000; i++) quest.eventList.push('EventWithAName');
    // String.Remove(88 + extra, 50000) reaches past the end of the string
    expect(() => Game.get().stats.prepareStats('true', 5, '')).toThrow();
  });

  it('PublishData_PostsTheFormInValkyriesOrder', async () => {
    startQuest();
    const stats = Game.get().stats;
    stats.prepareStats('true', 10, 'A comment, with a comma');
    const posted: { url: string; fields: [string, string][] }[] = [];
    HTTPManager.post = (url, fields) => {
      posted.push({ url, fields });
      return Promise.resolve({ text: '' });
    };
    const error = await new Promise<boolean>((resolve) => stats.publishData(resolve));

    expect(error).toBe(false);
    expect(posted).toHaveLength(1);
    expect(posted[0]!.url).toBe(STATS_FORM_URL);
    expect(posted[0]!.fields.map(([k]) => k)).toEqual([
      'entry.1875990408',
      'entry.989998412',
      'entry.84574628',
      'entry.227102998',
      'entry.2125749314',
      'entry.170795919',
      'entry.376629889',
      'entry.1150567176',
      'entry.2106598722',
      'entry.1047979960',
      'entry.571357850',
    ]);
    expect(posted[0]!.fields.map(([, v]) => v).slice(0, 7)).toEqual(['StatsTest', 'Stats test', 'true', '10', 'A comment, with a comma', '0', '2']);
  });

  it('PublishData_WithoutNetworkIsAnError', async () => {
    startQuest();
    const stats = Game.get().stats;
    stats.prepareStats('true', 3, '');
    const error = await new Promise<boolean>((resolve) => stats.publishData(resolve));
    expect(error).toBe(true);
  });
});
