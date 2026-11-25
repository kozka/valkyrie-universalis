// The editor's analysis (editor/analysis) on the skill's example scenario, La casa del relojero: the map has its
// spaces joined, the made-up games end, and the figures and advice come out. Not ported from Valkyrie.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { QuestData } from '@universalis/engine';
import { createEnvironment } from '../../../tools/battery/environment.ts';
import { analyze } from '../src/editor/analysis/analyze.ts';
import { blockers, endingEvents } from '../src/editor/analysis/blockers.ts';
import { investigationAdvice } from '../src/editor/analysis/investigation.ts';
import { buildMap } from '../src/editor/analysis/mapModel.ts';
import { simulate } from '../src/editor/analysis/simulate.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const example = join(root, 'herramientas/mansiones-valkyrie/assets/ejemplo/LaCasaDelRelojero');

function loadExample(): QuestData {
  const env = createEnvironment('MoM', join(root, 'packages/engine/data'), []);
  const folder = '/Editor/LaCasaDelRelojero';
  for (const file of readdirSync(example)) env.vfs.writeFile(`${folder}/${file}`, () => readFileSync(join(example, file)), readFileSync(join(example, file)).length);
  return new QuestData(`${folder}/quest.ini`);
}

describe('analysis of a scenario', () => {
  it('joins the spaces of its tiles', () => {
    const qd = loadExample();
    const map = buildMap(qd);
    expect(map.spaces.length).toBeGreaterThan(6);
    expect(map.near.filter((n) => n.length > 0).length).toBeGreaterThan(map.spaces.length * 0.8);
  });

  it('plays it to an end and gives figures and advice', async () => {
    const qd = loadExample();
    const result = await analyze(qd, { profile: 'normal', runs: 30 });
    expect(result.figures.length).toBeGreaterThan(0);
    expect(result.figures.some((f) => f.endings.end > 0)).toBe(true);
  });

  // A door whose way on asks for a flag nothing sets, and a defeat that ends the game too, through the same end event
  const tiny = `[Quest]
format=21
type=MoM
defaultlanguage=English
minhero=1
maxhero=2

[QuestData]
events.ini
`;
  const tinyEvents = `[EventStart]
trigger=EventStart
buttons=1
event1=
add=Tile1 TokenDoor

[Tile1]
xposition=0
yposition=0
side=TileSideCellar2

[TokenDoor]
xposition=0
yposition=0
type=TokenSearch
buttons=1
event1=EventOpen

[EventOpen]
buttons=2
event1=EventWin
event1Condition=VarOperation:hasKey,==,1
event1ConditionAction=hide
event2=

[EventWin]
buttons=1
event1=EventThanks

[EventLost]
trigger=Eliminated
buttons=1
event1=EventThanks

[EventThanks]
operations=$end,=,1
buttons=0
`;

  it('says where the way to an ending stops, and through which event each game ended', () => {
    const env = createEnvironment('MoM', join(root, 'packages/engine/data'), []);
    env.vfs.writeFile('/Editor/Tiny/quest.ini', () => new TextEncoder().encode(tiny), tiny.length);
    env.vfs.writeFile('/Editor/Tiny/events.ini', () => new TextEncoder().encode(tinyEvents), tinyEvents.length);
    const qd = new QuestData('/Editor/Tiny/quest.ini');
    expect(endingEvents(qd)).toEqual(['EventThanks']);
    let seed = 7;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const r = simulate(qd, buildMap(qd), { heroes: 1, profile: 'normal', random });
    expect(r.ending).not.toBe('end');
    if (r.endEvent !== null) expect(r.endVia).toBe('EventLost');
    const found = blockers(qd, new Set(r.firstRound.keys()), r.vars);
    expect(found.find((b) => b.event === 'EventWin')).toMatchObject({ from: 'EventOpen', needs: ['hasKey==1 (0)'] });
  });
  // A room placed without a word, three tokens that change nothing, a clue nobody uses (investigacion.md)
  it('tells when the table would have to press everything', () => {
    const events = `[EventStart]
trigger=EventStart
buttons=1
event1=
add=Tile1 TokenA TokenB TokenC TokenD

[Tile1]
xposition=0
yposition=0
side=TileSideCellar2

${['A', 'B', 'C'].map((t) => `[Token${t}]\nxposition=0\nyposition=0\ntype=TokenSearch\nbuttons=1\nevent1=EventNothing${t}\n\n[EventNothing${t}]\nbuttons=1\nevent1=\n`).join('\n')}
[TokenD]
xposition=0
yposition=0
type=TokenSight
buttons=1
event1=EventClue

[EventClue]
buttons=1
event1=
operations=sawStain,=,1
`;
    const env = createEnvironment('MoM', join(root, 'packages/engine/data'), []);
    env.vfs.writeFile('/Editor/Rooms/quest.ini', () => new TextEncoder().encode(tiny), tiny.length);
    env.vfs.writeFile('/Editor/Rooms/events.ini', () => new TextEncoder().encode(events), events.length);
    const advice = investigationAdvice(new QuestData('/Editor/Rooms/quest.ini'));
    expect(advice.find((a) => a.key === 'ANALYSIS_ROOMS_UNSAID')?.components).toEqual(['EventStart']);
    expect(advice.find((a) => a.key === 'ANALYSIS_DULL_TOKENS')?.params).toEqual([3, 4]);
    expect(advice.find((a) => a.key === 'ANALYSIS_UNREAD')).toMatchObject({ params: [1, 'sawStain'], components: ['EventClue'] });
  });
});
