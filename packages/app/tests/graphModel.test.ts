// The editor's graph (src/editor/graph/model.ts): a row for each event a trigger starts, each event followed by what its
// buttons start (a brace when a button starts several) and what it adds (+) or takes away (−), a component drawn
// whole once and then as a copy with the same circled number, and apart what nothing reaches. Not ported from Valkyrie.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { File, Game, QuestData, VirtualFileSystem, setFileSystem } from '@universalis/engine';
import { MoMGameType } from '@universalis/module-mom';
import { buildGraph, circled, type GraphWords } from '../src/editor/graph/model.ts';

const QUEST = '/Quest';

const words: GraphWords = {
  and: 'Y',
  or: 'O',
  dialog: (event) => (event.display ? 'text of ' + event.sectionName : ''),
  label: (button) => button.label.key,
  picture: () => null,
};

function quest(events: string): ReadonlyMap<string, QuestData.QuestComponent> {
  File.writeAllText(`${QUEST}/quest.ini`, '[Quest]\r\nformat=21\r\ntype=MoM\r\ndefaultlanguage=English\r\n\r\n[QuestData]\r\nevents.ini\r\n');
  File.writeAllText(`${QUEST}/events.ini`, events);
  return new QuestData(`${QUEST}/quest.ini`).components;
}

describe('graph model', () => {
  beforeEach(() => {
    setFileSystem(new VirtualFileSystem());
    // Only the language: what QuestData reads of a game to load the quest
    Game.game = { currentLang: 'English', gameType: new MoMGameType(), questsList: {} } as unknown as Game;
  });

  afterEach(() => {
    Game.game = null as unknown as Game;
  });

  it('Rows_OneForEachStartedEvent_EventStartFirst_ThenWhatNothingReaches', () => {
    const graph = buildGraph(
      quest(
        [
          '[EventRound]', 'trigger=EndRound', 'buttons=1', '',
          '[EventStart]', 'trigger=EventStart', 'display=true', 'buttons=2', 'event1=EventA EventB', 'event2=EventB', 'add=TokenLook TileHall', 'remove=TokenLook', '',
          '[EventA]', 'buttons=1', 'vartests=VarOperation:clues,>=,2 VarTestsLogicalOperator:OR VarOperation:#round,>,3', 'operations=clues,+,1', '',
          '[EventB]', 'buttons=1', 'event1Condition=VarOperation:clues,>,0 ', 'event1ConditionAction=hide', 'event1=EventA', '',
          '[EventLoose]', 'buttons=1', '',
          '[TokenLook]', 'type=TokenSearch', 'xposition=0', 'yposition=0', 'buttons=1', 'event1=EventA', '',
          '[TileHall]', 'side=TileSideHall', '',
        ].join('\r\n'),
      ),
      words,
    );
    expect(graph.rows.map((r) => [r.trigger, r.root])).toEqual([
      ['EventStart', 'EventStart'],
      ['EndRound', 'EventRound'],
      ['loose', null],
    ]);
    // EventStart's button 1 starts two events: a brace, the first that can
    expect(graph.braces).toEqual([{ id: 'EventStart#0{1', from: 'EventStart#0', button: 1, nodes: ['EventA#0', 'EventB#0'], random: false }]);
    const start = graph.byId.get('EventStart#0')!;
    expect(start.text).toBe('text of EventStart');
    expect(graph.edges.filter((e) => e.from === 'EventStart#0').map((e) => [e.kind, e.to, e.button ?? e.listIndex])).toEqual([
      ['button', 'EventA#0', 1],
      ['button', 'EventB#0', 1],
      ['button', 'EventB#1', 2],
      ['add', 'TokenLook#0', 0],
      ['add', 'TileHall#0', 1],
      ['remove', 'TokenLook#1', 0],
    ]);
    // Drawn whole once, then copies with the same circled number
    expect(graph.byName.get('EventB')!.map((n) => [n.id, n.copy, n.mark])).toEqual([
      ['EventB#0', false, 2],
      ['EventB#1', true, 2],
    ]);
    expect(graph.byId.get('EventA#0')!.condition).toBe('clues ≥ 2 O #round > 3');
    expect(graph.byId.get('EventA#0')!.operations).toEqual(['clues + 1']);
    expect(graph.byId.get('EventB#0')!.buttons[0]).toMatchObject({ condition: 'clues > 0', effect: 'hide', targets: ['EventA'] });
    // Pieces on the board, and what they lead to under them
    expect(graph.byId.get('TokenLook#0')!.kind).toBe('token');
    expect(graph.byId.get('TokenLook#0')!.onMap).toBe(true);
    expect(graph.byId.get('TileHall#0')!.kind).toBe('tile');
    expect(graph.byId.get('EventLoose#0')!.row).toBe(2);
    // Columns by depth, and no two nodes of a row overlap
    expect(graph.byId.get('EventA#0')!.x).toBeGreaterThan(start.x);
    const row0 = graph.nodes.filter((n) => n.row === 0 && n.depth === 1).sort((a, b) => a.y - b.y);
    for (let i = 1; i < row0.length; i++) expect(row0[i]!.y).toBeGreaterThanOrEqual(row0[i - 1]!.y + row0[i - 1]!.h);
  });

  it('Circled_NumbersAComponentDrawnSeveralTimes', () => {
    expect(circled(1)).toBe('①');
    expect(circled(20)).toBe('⑳');
    expect(circled(21)).toBe('(21)');
  });
});
