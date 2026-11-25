// Tests of the editor's checks and of its graph of what leads to what (packages/engine/src/QuestEditor/checks), on
// small Mansions quests written here. Not ported from Valkyrie, whose Validate button does nothing; the checks come
// from the skills' validators, and tools/battery/checks-compare.ts compares them on every downloaded scenario.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Application, Directory, File, ValkyrieDebug } from '@universalis/engine';
import { checkPackage } from '../packages/engine/src/QuestEditor/checks/PackageChecks.ts';
import { checkQuest, lookups, readQuestForChecks } from '../packages/engine/src/QuestEditor/checks/QuestChecks.ts';
import { QuestGraph } from '../packages/engine/src/QuestEditor/checks/QuestGraph.ts';
import type { Problem } from '../packages/engine/src/QuestEditor/checks/Problem.ts';
import { createEnvironment, type Environment } from '../tools/battery/environment.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const QUEST = '/AppData/Valkyrie/MoM/Editor/CheckTest';
const NL = '\r\n';

let env: Environment;
let stopLog: () => void;

/** A quest of a game with these data files (name to sections) and English texts. */
function write(files: Record<string, string[]>, english: string[], quest: string[] = [], game: 'MoM' | 'D2E' = 'MoM'): string {
  const folder = game === 'MoM' ? QUEST : '/AppData/Valkyrie/D2E/Editor/CheckTest';
  if (Directory.exists(folder)) Directory.delete(folder, true);
  const data = Object.keys(files);
  const questIni = ['[Quest]', 'format=21', 'type=' + game, 'defaultlanguage=English', 'image=cover.jpg', 'lengthmin=60', 'lengthmax=90', ...quest, '', '[QuestText]', 'Localization.English.txt', '', '[QuestData]', ...data, ''];
  File.writeAllText(folder + '/quest.ini', questIni.join(NL));
  for (const [name, lines] of Object.entries(files)) File.writeAllText(folder + '/' + name, lines.join(NL));
  File.writeAllText(folder + '/Localization.English.txt', ['.,English', 'quest.name,Check test', 'quest.description,A test', 'quest.synopsys,Test', 'quest.authors,Claude', ...english, ''].join(NL));
  File.writeAllBytes(folder + '/cover.jpg', new Uint8Array([0xff, 0xd8, 0xff, 0xd9]));
  return folder + '/quest.ini';
}

function problems(path: string): Problem[] {
  const { files, qd } = readQuestForChecks(path);
  return checkQuest({ game: env.game, files, qd });
}

const codes = (list: Problem[]) => list.map((p) => `${p.level} ${p.code} ${p.where}`);

/** A quest that starts, can end in victory, defeat and time, and has nothing wrong. */
const GOOD_EVENTS = [
  '[EventStart]', 'trigger=EventStart', 'display=false', 'buttons=1', 'event1=EventIntro', 'add=TileHall TokenLook', 'operations=$mythosMinor,=,1', '',
  '[EventIntro]', 'buttons=1', 'event1=EventNothing', '',
  '[EventNothing]', 'display=false', '',
  '[TokenLook]', 'type=TokenSearch', 'xposition=1.75', 'yposition=1.75', 'buttons=1', 'event1=EventWin', '',
  '[EventWin]', 'buttons=1', 'remove=TokenLook', 'operations=$end,=,1', '',
  '[EventDead]', 'trigger=Eliminated', 'buttons=1', 'operations=$end,=,1', '',
  '[EventTime]', 'trigger=EndRound', 'vartests=VarOperation:#round,>=,10', 'buttons=1', 'operations=$end,=,1', '',
];
const GOOD_TEXTS = ['EventIntro.text,Welcome', 'EventIntro.button1,Go', 'TokenLook.text,A desk', 'TokenLook.button1,Search', 'EventWin.text,You win', 'EventWin.button1,End', 'EventDead.text,Dead', 'EventDead.button1,End', 'EventTime.text,Too late', 'EventTime.button1,End'];
const TILES = ['[TileHall]', 'side=TileSideAlley1', 'xposition=0', 'yposition=0', ''];

describe('QuestChecksTests', () => {
  beforeAll(() => {
    env = createEnvironment('MoM', join(root, 'packages', 'engine', 'data'), []);
  }, 120_000);

  beforeEach(() => {
    Application.fatalErrors.length = 0;
    stopLog = ValkyrieDebug.onLog(() => {});
  });

  afterEach(() => {
    stopLog();
  });

  it('Graph_LinksReachEndingsAndLoops', () => {
    const path = write(
      {
        'events.ini': [
          ...GOOD_EVENTS,
          '[EventLoopA]', 'trigger=StartRound', 'buttons=1', 'event1=EventLoopB', '',
          '[EventLoopB]', 'buttons=1', 'event1=EventLoopA', '',
          '[EventAlone]', 'buttons=1', '',
        ],
        'tiles.ini': TILES,
      },
      GOOD_TEXTS,
    );
    const { qd, files } = readQuestForChecks(path);
    const graph = new QuestGraph(qd!.components, files.texts);
    expect(graph.outgoing.get('EventStart')!.map((l) => `${l.kind} ${l.to}`)).toEqual(['button EventIntro', 'add TileHall', 'add TokenLook']);
    expect(graph.incoming.get('EventWin')!.map((l) => l.from)).toEqual(['TokenLook']);
    const reached = graph.reachable();
    expect([...reached].sort()).toEqual(['EventDead', 'EventIntro', 'EventLoopA', 'EventLoopB', 'EventNothing', 'EventStart', 'EventTime', 'EventWin', 'TileHall', 'TokenLook']);
    expect(reached.has('EventAlone')).toBe(false);
    expect(graph.endings()).toEqual(['EventWin', 'EventDead', 'EventTime']);
    expect(graph.leadsToEnd('TokenLook')).toBe(true);
    expect(graph.leadsToEnd('EventIntro')).toBe(false);
    expect(graph.loops()).toEqual([['EventLoopA', 'EventLoopB']]);
    expect(graph.written.get('$end')!.map((u) => u.component)).toEqual(['EventWin', 'EventDead', 'EventTime']);
    expect(graph.read.get('#round')!.map((u) => `${u.component} ${u.how}`)).toEqual(['EventTime test']);
  });

  it('Graph_VariablesShownInTexts', () => {
    const path = write({ 'events.ini': [...GOOD_EVENTS, '[EventCount]', 'buttons=1', 'operations=clues,+,1', ''] }, [
      ...GOOD_TEXTS,
      'EventCount.text,You have {var:clues} clues',
      'EventCount.button1,{var:clues}',
      'EventWin.button2,{var:clues} and {var:#round}',
    ]);
    const { qd, files } = readQuestForChecks(path);
    const graph = new QuestGraph(qd!.components, files.texts);
    expect([...graph.shown.get('clues')!]).toEqual(['EventCount', 'EventWin']);
    expect([...graph.shown.get('#round')!]).toEqual(['EventWin']);
    // A text that shows a variable does not test it
    expect(graph.read.has('clues')).toBe(false);
  });

  it('Graph_EventsOfATriggerRunLastFirst', () => {
    const path = write({ 'events.ini': ['[EventA]', 'trigger=StartRound', '', '[EventB]', 'trigger=StartRound', ''] }, []);
    const { qd } = readQuestForChecks(path);
    expect(new QuestGraph(qd!.components).triggered('StartRound')).toEqual(['EventB', 'EventA']);
  });

  it('Graph_ReadingOrder_TheTreeOpenedAllTheWay', () => {
    const path = write(
      {
        'events.ini': [
          '[EventStart]', 'trigger=EventStart', 'buttons=2', 'event1=EventLeft', 'event2=EventRight', 'add=TokenLook', '',
          '[EventLeft]', 'buttons=1', 'event1=EventEnd', 'operations=@door,=,1', '',
          '[EventRight]', 'buttons=1', 'event1=EventLeft', '',
          '[EventEnd]', 'buttons=1', 'operations=$end,=,1', '',
          '[TokenLook]', 'type=TokenSearch', 'xposition=1', 'yposition=1', 'buttons=1', 'event1=EventRight', '',
          '[EventOpens]', 'trigger=Vardoor', 'buttons=1', '',
          '[EventRound]', 'trigger=StartRound', 'buttons=1', 'add=SpawnCultist', '',
          '[SpawnCultist]', 'monster=MonsterCultist', 'buttons=1', '',
          '[EventDefeated]', 'trigger=DefeatedSpawnCultist', 'buttons=1', '',
          '[EventAfter]', 'buttons=1', '',
          '[EventAlone]', 'buttons=1', 'event1=EventAfter', '',
        ],
        'tiles.ini': TILES,
      },
      [],
    );
    const { qd } = readQuestForChecks(path);
    const order = new QuestGraph(qd!.components).readingOrder();
    // Each trigger's events, EventStart's first, each followed by what it leads to: its buttons' events, what it adds,
    // the events a variable it sets starts and those its defeat starts; each once
    expect(order.reached).toEqual(['EventStart', 'EventLeft', 'EventEnd', 'EventOpens', 'EventRight', 'TokenLook', 'EventRound', 'SpawnCultist', 'EventDefeated']);
    // Then what nothing reaches, in the quest's order but those that nothing leads to first
    expect(order.loose).toEqual(['EventAlone', 'EventAfter', 'TileHall']);
    expect(order.reached.length + order.loose.length).toBe(qd!.components.size);
  });

  it('GoodQuest_HasNothingButHints', () => {
    const found = problems(write({ 'events.ini': GOOD_EVENTS, 'tiles.ini': TILES }, GOOD_TEXTS));
    expect(found.filter((p) => p.level !== 'hint')).toEqual([]);
  });

  it('AddOfAMissingComponent_BreaksValkyrie', () => {
    const events = GOOD_EVENTS.map((l) => (l === 'add=TileHall TokenLook' ? 'add=TileHall TokenLook TokenNope' : l));
    const found = problems(write({ 'events.ini': events, 'tiles.ini': TILES }, GOOD_TEXTS));
    expect(found).toContainEqual({ level: 'breaks', code: 'add-missing', where: 'EventStart', key: 'add', params: { target: 'TokenNope' } });
  });

  it('ButtonWithoutLabelAndEventWithoutText', () => {
    const texts = GOOD_TEXTS.filter((t) => !t.startsWith('EventIntro.'));
    const found = codes(problems(write({ 'events.ini': GOOD_EVENTS, 'tiles.ini': TILES }, texts)));
    expect(found).toContain('wrong button-no-label EventIntro');
    expect(found).toContain('hint event-no-text EventIntro');
  });

  it('KeyInOtherLetterCase_IsLostOnSaving', () => {
    const events = GOOD_EVENTS.map((l) => (l === 'type=TokenSearch' ? 'type=TokenSearch\r\ntokenSize=small' : l));
    const found = problems(write({ 'events.ini': events, 'tiles.ini': TILES }, GOOD_TEXTS));
    expect(found).toContainEqual({ level: 'breaks', code: 'key-letter-case', where: 'TokenLook', key: 'tokenSize', params: { key: 'tokenSize', fix: 'tokensize' } });
  });

  it('UIThatNeverGoes_BlocksThePhase_UnlessItEndsTheGame', () => {
    const ui = ['[UIBanner]', 'image=cover.jpg', 'buttons=1', 'event1=EventNothing', ''];
    const events = GOOD_EVENTS.map((l) => (l === 'add=TileHall TokenLook' ? 'add=TileHall TokenLook UIBanner' : l));
    expect(codes(problems(write({ 'events.ini': events, 'tiles.ini': TILES, 'ui.ini': ui }, [...GOOD_TEXTS, 'UIBanner.button1,Close'])))).toContain('wrong ui-stays UIBanner');
    const ending = GOOD_EVENTS.map((l) => (l === 'remove=TokenLook' ? 'remove=TokenLook\r\nadd=UIBanner' : l));
    expect(codes(problems(write({ 'events.ini': ending, 'tiles.ini': TILES, 'ui.ini': ui }, [...GOOD_TEXTS, 'UIBanner.button1,Close'])))).not.toContain('wrong ui-stays UIBanner');
  });

  it('Files_AComponentInTwoFilesAndALineOfSpaces', () => {
    const found = codes(problems(write({ 'events.ini': GOOD_EVENTS, 'tiles.ini': TILES, 'more.ini': ['[EventIntro]', '   ', 'buttons=1', ''] }, GOOD_TEXTS)));
    expect(found).toContain('breaks component-twice EventIntro');
    expect(found).toContain('breaks ini-space-line more.ini');
  });

  it('Texts_MixedLineEndingsAndAComponentMarkThatIsNotThere', () => {
    const path = write({ 'events.ini': GOOD_EVENTS, 'tiles.ini': TILES }, [...GOOD_TEXTS, 'EventNothing.text,See {c:TileNope}']);
    const text = File.readAllText(QUEST + '/Localization.English.txt');
    File.writeAllText(QUEST + '/Localization.English.txt', text.replace('EventWin.text,You win\r\n', 'EventWin.text,You win\n'));
    const found = codes(problems(path));
    expect(found).toContain('breaks text-line-endings-mixed Localization.English.txt');
    expect(found).toContain('wrong text-component-missing texts English');
  });

  it('QuestSection_FormatTypeAndLanguage', () => {
    const path = write({ 'events.ini': GOOD_EVENTS, 'tiles.ini': TILES }, GOOD_TEXTS);
    File.writeAllText(QUEST + '/quest.ini', File.readAllText(QUEST + '/quest.ini').replace('format=21', 'format=30').replace('type=MoM', 'type=D2E').replace('defaultlanguage=English', 'defaultlanguage=Klingon'));
    const found = codes(problems(path));
    expect(found).toContain('breaks format-out-of-range [Quest]');
    expect(found).toContain('breaks type-wrong [Quest]');
    expect(found).toContain('breaks default-language-unknown [Quest]');
    expect(found).toContain('breaks default-language-no-file [Quest]');
  });

  it('Variables_TriggersAndNamesThatOnlyDifferInCase', () => {
    const events = [...GOOD_EVENTS, '[EventSet]', 'buttons=1', 'operations=@door,=,1 counter,+,1 Counter,+,1', '', '[EventLook]', 'buttons=1', 'vartests=VarOperation:flag,==,1', ''];
    const found = problems(write({ 'events.ini': events, 'tiles.ini': TILES }, GOOD_TEXTS));
    expect(found).toContainEqual({ level: 'wrong', code: 'var-trigger-none', where: '', params: { variable: '@door' } });
    expect(found).toContainEqual({ level: 'wrong', code: 'var-letter-case', where: '', params: { variables: 'Counter counter' } });
    expect(found).toContainEqual({ level: 'hint', code: 'var-never-set', where: '', params: { variable: 'flag', where: 'EventLook' } });
  });

  it('Texts_LookupsAsValkyrieReadsThem', () => {
    const dictionaries = ['ffg', 'val', 'qst'];
    // DictQuery: with brackets inside, the key is what comes before the first ':' outside them
    expect(lookups('A {qst:EventIntro.text} and {qst:Count:{0}:{var:x}}, {ffg:X}', dictionaries)).toEqual([
      { dict: 'qst', key: 'EventIntro.text' },
      { dict: 'qst', key: 'Count' },
      { dict: 'ffg', key: 'X' },
    ]);
    // DictLookup looks for the end from the second character on, so "{qst:}" is never closed; "{qst" is no lookup
    expect(lookups('{qst:}', dictionaries)).toEqual([{ dict: 'qst', key: null }]);
    expect(lookups('Lost {qst', dictionaries)).toEqual([]);
    const texts = [...GOOD_TEXTS.filter((t) => !t.startsWith('EventTime.text')), 'EventTime.text,Too late {qst:EventDead.text', 'EventNothing.text,{qst:EventWin.text} {qst:EventNope.text}'];
    const found = problems(write({ 'events.ini': GOOD_EVENTS, 'tiles.ini': TILES }, texts));
    expect(found).toContainEqual({ level: 'breaks', code: 'text-mark-unclosed', where: 'texts English', key: 'EventTime.text', params: { key: 'EventTime.text', dict: 'qst' } });
    expect(found.filter((p) => p.code === 'text-key-missing')).toEqual([
      { level: 'hint', code: 'text-key-missing', where: 'texts English', key: 'EventNothing.text', params: { key: 'EventNothing.text', name: 'EventNope.text' } },
    ]);
  });

  it('Tiles_BothSidesOfOnePiece', () => {
    // TileSideAlley1 is printed on the back of TileSideBedroom1
    const tiles = [...TILES, '[TileBedroom]', 'side=TileSideBedroom1', 'xposition=10', 'yposition=0', ''];
    const found = problems(write({ 'events.ini': GOOD_EVENTS, 'tiles.ini': tiles }, GOOD_TEXTS));
    expect(found).toContainEqual({ level: 'hint', code: 'tile-both-sides', where: '', params: { side: 'TileSideAlley1', reverse: 'TileSideBedroom1' } });
    expect(found.filter((p) => p.code === 'tile-both-sides')).toHaveLength(1);
  });

  it('Puzzle_APictureCutForAnotherGrid', () => {
    const puzzle = (level: number, alt: number) => ['[PuzzleSuspects]', 'class=image', 'image=PuzzleTheUsualSuspects', `puzzlelevel=${level}`, `puzzlealtlevel=${alt}`, 'buttons=1', ''];
    const texts = [...GOOD_TEXTS, 'PuzzleSuspects.text,Put it together', 'PuzzleSuspects.button1,Done'];
    const wrong = problems(write({ 'events.ini': [...GOOD_EVENTS, ...puzzle(3, 3)], 'tiles.ini': TILES }, texts));
    expect(wrong).toContainEqual({ level: 'hint', code: 'puzzle-image-grid', where: 'PuzzleSuspects', key: 'puzzlelevel', params: { image: 'PuzzleTheUsualSuspects', grid: '4x2', used: '3x3' } });
    const right = problems(write({ 'events.ini': [...GOOD_EVENTS, ...puzzle(4, 2)], 'tiles.ini': TILES }, texts));
    expect(codes(right).filter((c) => c.includes('puzzle-image-grid'))).toEqual([]);
  });
});

describe('QuestChecksTests (Descent)', () => {
  beforeAll(() => {
    env = createEnvironment('D2E', join(root, 'packages', 'engine', 'data'), []);
  }, 120_000);

  beforeEach(() => {
    Application.fatalErrors.length = 0;
    stopLog = ValkyrieDebug.onLog(() => {});
  });

  afterEach(() => {
    stopLog();
  });

  const START = ['[EventStart]', 'trigger=EventStart', 'display=false', 'buttons=1', 'add=TileOne', ''];
  const PLACES = ['[MPlaceA]', 'xposition=0', 'yposition=0', '', '[MPlaceB]', 'xposition=1', 'yposition=0', ''];

  it('Spawn_APlacementForEveryNumberOfHeroes_ButForALieutenant', () => {
    const spawns = [
      '[SpawnGoblins]', 'monster=MonsterGoblinArcher', 'xposition=0', 'yposition=0', 'placement2=MPlaceA', 'placement3=MPlaceA MPlaceB', 'buttons=1', '',
      '[SpawnQuiet]', 'monster=MonsterGoblinArcher', 'display=false', 'placement2=MPlaceA', 'buttons=1', '',
      '[SpawnSplig]', 'monster=MonsterSplig', 'xposition=2', 'yposition=0', 'placement2=MPlaceB', 'buttons=1', '',
    ];
    const tiles = ['[TileOne]', 'side=TileSide1A', 'xposition=0', 'yposition=0', ''];
    const found = problems(write({ 'events.ini': [...START, ...spawns], 'mplaces.ini': PLACES, 'tiles.ini': tiles }, [], ['minhero=1', 'maxhero=4'], 'D2E'));
    expect(found.filter((p) => p.code === 'spawn-placement-heroes')).toEqual([
      { level: 'hint', code: 'spawn-placement-heroes', where: 'SpawnGoblins', key: 'placement1', params: { heroes: 1 } },
      { level: 'hint', code: 'spawn-placement-heroes', where: 'SpawnGoblins', key: 'placement4', params: { heroes: 4 } },
    ]);
  });

  it('Tiles_OnlyANumberedPieceIsUnique', () => {
    const tiles = [
      '[TileOne]', 'side=TileSide1A', 'xposition=0', 'yposition=0', '',
      '[TileBack]', 'side=1B', 'xposition=10', 'yposition=0', '',
      '[TileCap1]', 'side=TileSideCapA', 'xposition=20', 'yposition=0', '',
      '[TileCap2]', 'side=TileSideCapA', 'xposition=30', 'yposition=0', '',
      '[TileCap3]', 'side=TileSideCapB', 'xposition=40', 'yposition=0', '',
    ];
    const found = problems(write({ 'events.ini': START, 'tiles.ini': tiles }, [], [], 'D2E'));
    expect(found.filter((p) => p.code.startsWith('tile-both') || p.code === 'tile-side-twice')).toEqual([
      { level: 'hint', code: 'tile-both-sides', where: '', params: { side: 'TileSide1A', reverse: 'TileSide1B' } },
    ]);
  });

  it('Package_WhatAChangeOfQuestReachesAndTheFameOfItems', () => {
    const package_ = (start: string[]) => {
      const events = ['[EventStart]', 'trigger=EventStart', 'buttons=1', 'event1=Second/quest.ini', ...start, '', '[QItemShop]', 'traits=act1', 'starting=False', ''];
      const path = write({ 'events.ini': events }, ['EventStart.text,Go', 'EventStart.button1,On'], [], 'D2E');
      const folder = path.substring(0, path.length - '/quest.ini'.length);
      const sub = (name: string, language: string) => {
        File.writeAllText(`${folder}/${name}/quest.ini`, ['[Quest]', 'format=21', 'type=D2E', `defaultlanguage=${language}`, 'hidden=True', '', '[QuestText]', `Localization.${language}.txt`, '', '[QuestData]', 'events.ini', ''].join(NL));
        File.writeAllText(`${folder}/${name}/events.ini`, ['[EventStart]', 'trigger=EventStart', 'buttons=1', 'operations=$end,=,1', ''].join(NL));
        File.writeAllText(`${folder}/${name}/Localization.${language}.txt`, [`.,${language}`, 'EventStart.text,Fin', 'EventStart.button1,Fin', ''].join(NL));
        return `${folder}/${name}/quest.ini`;
      };
      const quests = [path, sub('Second', 'Spanish'), sub('Unused', 'English')].map((q) => ({ game: env.game, ...readQuestForChecks(q), root: folder }));
      return checkPackage(env.game, quests);
    };
    // Quest.ChangeQuest reads the player's language and English, not Second's Spanish; and with no fame threshold set,
    // the items drawn by traits come from the legendary ones only
    expect(package_([])).toEqual([
      { level: 'hint', code: 'package-not-reached', where: 'Unused' },
      { level: 'wrong', code: 'package-english', where: '', params: { count: 1, example: 'Second', language: 'Spanish' } },
      { level: 'wrong', code: 'package-fame', where: '', params: { items: 'QItemShop' } },
    ]);
    // The thresholds come after the main quest drew its items, until $restock draws them again
    expect(package_(['operations=$%famenoteworthy,=,5']).filter((p) => p.code.startsWith('package-fame'))).toEqual([
      { level: 'wrong', code: 'package-fame-load', where: '', params: { items: 'QItemShop', events: 'EventStart' } },
    ]);
    expect(package_(['operations=$%famenoteworthy,=,5 $restock,=,1']).filter((p) => p.code.startsWith('package-fame'))).toEqual([]);
  });

  it('Variables_AOneLetterNameBreaksAChangeOfQuest', () => {
    const events = (start: string) => ['[EventStart]', 'trigger=EventStart', 'buttons=1', start, 'operations=x,=,1', ''];
    const found = (start: string) => problems(write({ 'events.ini': events(start) }, ['EventStart.text,Go', 'EventStart.button1,On'], [], 'D2E'));
    expect(found('event1=Second/quest.ini')).toContainEqual({ level: 'breaks', code: 'var-one-char', where: '', params: { variable: 'x' } });
    expect(found('event1=')).toContainEqual({ level: 'hint', code: 'var-one-char', where: '', params: { variable: 'x' } });
  });
});
