// What the app checks in a scenario the player adds (host/scenarioPackage.ts). Not ported from Valkyrie.
import { strToU8, unzipSync, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { checkScenarioPackage, type PackageCheck } from '../src/host/scenarioPackage.ts';

const QUEST = '[Quest]\nformat=21\ntype=MoM\ndefaultlanguage=English\n\n[QuestText]\nLocalization.English.txt\n\n[QuestData]\nevents.ini\n';
const TEXT = '.,English\nquest.name,Made here\n';
const EVENTS = '[EventStart]\ntrigger=EventStart\nbuttons=1\nevent1=EventNext\n\n[EventNext]\nbuttons=1\n';

function zip(files: Record<string, string>): Uint8Array {
  return zipSync(Object.fromEntries(Object.entries(files).map(([name, text]) => [name, strToU8(text)])));
}

function scenario(check: PackageCheck): Extract<PackageCheck, { kind: 'scenario' }> {
  if (check.kind !== 'scenario') throw new Error(`Not a scenario: ${check.kind}`);
  return check;
}

describe('a scenario the player adds', () => {
  it('is kept as it is when it is right', () => {
    const bytes = zip({ 'quest.ini': QUEST, 'Localization.English.txt': TEXT, 'events.ini': EVENTS });
    const check = scenario(checkScenarioPackage(bytes));
    expect(check.bytes).toBe(bytes);
    expect(check.fixedFrom).toBeNull();
    expect(check.quest.get('type')).toBe('MoM');
    expect(check.errors).toEqual([]);
    expect(check.warnings).toEqual([]);
  });

  it('is not a zip, or has no quest.ini', () => {
    expect(checkScenarioPackage(strToU8('Rar!')).kind).toBe('not-zip');
    expect(checkScenarioPackage(zip({ 'readme.txt': 'x' })).kind).toBe('no-quest-ini');
  });

  it('is taken out of the one folder a player zipped, leaving out what a Mac adds', () => {
    const bytes = zip({
      'MyScenario/quest.ini': QUEST,
      'MyScenario/Localization.English.txt': TEXT,
      'MyScenario/events.ini': EVENTS,
      '__MACOSX/MyScenario/._quest.ini': 'x',
    });
    const check = scenario(checkScenarioPackage(bytes));
    expect(check.fixedFrom).toBe('MyScenario');
    expect(Object.keys(unzipSync(check.bytes)).sort()).toEqual(['Localization.English.txt', 'events.ini', 'quest.ini']);
    expect(check.errors).toEqual([]);
  });

  it('tells what stops Valkyrie from opening it', () => {
    const blank = scenario(checkScenarioPackage(zip({ 'quest.ini': QUEST, 'Localization.English.txt': TEXT, 'events.ini': '[EventStart]\n  \nbuttons=1\n' })));
    expect(blank.errors).toEqual([{ key: 'CHECK_BLANK_LINE', params: ['events.ini', '2'] }]);
    const header = scenario(checkScenarioPackage(zip({ 'quest.ini': QUEST, 'Localization.English.txt': '\nquest.name,x\n', 'events.ini': EVENTS })));
    expect(header.errors).toEqual([{ key: 'CHECK_LOCALIZATION_HEADER', params: ['Localization.English.txt'] }]);
    const format = scenario(checkScenarioPackage(zip({ 'quest.ini': QUEST.replace('format=21', 'format=99'), 'Localization.English.txt': TEXT, 'events.ini': EVENTS })));
    expect(format.errors.map((e) => e.key)).toEqual(['CHECK_FORMAT']);
    const noText = scenario(checkScenarioPackage(zip({ 'quest.ini': '[Quest]\nformat=21\ntype=MoM\n' })));
    expect(noText.errors.map((e) => e.key)).toEqual(['CHECK_NO_QUESTTEXT']);
  });

  it('warns of files that are missing and of buttons to events that do not exist', () => {
    const check = scenario(checkScenarioPackage(zip({ 'quest.ini': QUEST, 'events.ini': EVENTS.replace('event1=EventNext', 'event1=EventNxt') })));
    expect(check.errors).toEqual([]);
    expect(check.warnings).toEqual([
      { key: 'CHECK_MISSING_FILE', params: ['Localization.English.txt'] },
      { key: 'CHECK_MISSING_EVENT', params: ['EventStart', 'EventNxt'] },
    ]);
  });
});
