// The player's own translation of a scenario (host/customTranslation.ts): what its check finds, and how it goes into the
// scenario's extracted copy. Not ported from Valkyrie.
import { strToU8, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { File, Path } from '@universalis/engine';
import { applyTranslation, checkTranslation, localizationKeys, scenarioTextsFromFolder, scenarioTextsFromPackage } from '../src/host/customTranslation.ts';

const QUEST = '[Quest]\nformat=21\ntype=MoM\ndefaultlanguage=English\n\n[QuestText]\nLocalization.English.txt\nLocalization.Spanish.txt\n';
const ENGLISH = '.,English\nquest.name,The House\nEventStart.text,"A long text,\nover two lines"\nEventEnd.text,The end\n';
const SPANISH = '.,Spanish\nquest.name,La casa\n';

function zip(files: Record<string, string>): Uint8Array {
  return zipSync(Object.fromEntries(Object.entries(files).map(([name, text]) => [name, strToU8(text)])));
}

const scenario = scenarioTextsFromPackage(
  zip({ 'quest.ini': QUEST, 'Localization.English.txt': ENGLISH, 'Localization.Spanish.txt': SPANISH, 'img/hall.png': 'x', 'audio/door.ogg': 'x' }),
);

describe('a translation of a scenario', () => {
  it('reads a Localization file as Valkyrie does, an entry over two lines as one', () => {
    expect([...localizationKeys(ENGLISH).keys]).toEqual(['quest.name', 'EventStart.text', 'EventEnd.text']);
    expect(localizationKeys('quest.name,x\n').language).toBeNull();
  });

  it('knows the scenario: its texts in its own language, its languages and its files', () => {
    expect(scenario.keys.size).toBe(3);
    expect(scenario.languages).toEqual(['English', 'Spanish']);
    expect(scenario.files).toContain('img/hall.png');
  });

  it('says what it translates and what it replaces, warning of what will not be used', () => {
    const check = checkTranslation(
      zip({
        'MyTranslation/Localization.French.txt': '.,French\nquest.name,La maison\nEventEnd.text,La fin\nOld.text,Vieux\n',
        'MyTranslation/img/hall.png': 'y',
        'MyTranslation/French/audio/door.ogg': 'y',
        'MyTranslation/img/garden.png': 'y',
        '__MACOSX/MyTranslation/._img': 'x',
      }),
      scenario,
      'Spanish',
    );
    expect(check.errors).toEqual([]);
    expect(check.language).toBe('French');
    expect([check.translated, check.total]).toEqual([2, 3]);
    expect(check.media).toEqual([
      { path: 'img/hall.png', kind: 'image', replaces: true },
      { path: 'audio/door.ogg', kind: 'sound', replaces: true },
      { path: 'img/garden.png', kind: 'image', replaces: false },
    ]);
    expect(check.warnings.map((w) => w.key)).toEqual(['TRANSLATION_UNKNOWN_TEXTS', 'TRANSLATION_UNUSED_FILES', 'TRANSLATION_OTHER_LANGUAGE']);
    expect(check.warnings[0]!.params).toEqual(['1', 'Old.text']);
  });

  it('says when it replaces the scenario’s own language, and refuses what cannot be used', () => {
    const own = checkTranslation(zip({ 'Localization.Spanish.txt': '.,Spanish\nquest.name,La mansión\n' }), scenario, 'Spanish');
    expect(own.warnings.map((w) => w.key)).toEqual(['TRANSLATION_REPLACES_OWN']);
    expect(checkTranslation(strToU8('not a zip'), scenario, 'Spanish').errors[0]!.key).toBe('TRANSLATION_NOT_ZIP');
    expect(checkTranslation(zip({ 'img/hall.png': 'y' }), scenario, 'Spanish').errors[0]!.key).toBe('TRANSLATION_NO_TEXTS_FILE');
    expect(checkTranslation(zip({ 'Localization.Klingon.txt': '.,Klingon\nquest.name,x\n' }), scenario, 'Spanish').errors[0]!.key).toBe('TRANSLATION_UNKNOWN_LANGUAGE');
    expect(checkTranslation(zip({ 'Localization.French.txt': 'quest.name,x\n' }), scenario, 'Spanish').errors[0]!.key).toBe('CHECK_LOCALIZATION_HEADER');
    const several = zip({ 'Localization.French.txt': '.,French\na,b\n', 'Localization.German.txt': '.,German\na,b\n' });
    expect(checkTranslation(several, scenario, 'Spanish').errors[0]!.key).toBe('TRANSLATION_SEVERAL_LANGUAGES');
  });

  it('goes into the extracted copy: in place of the scenario’s own texts, or listed as a new file, its media in the language’s folder', () => {
    const folder = '/temp/Valkyrie/House.valkyrie';
    const extract = () => {
      File.writeAllText(Path.combine(folder, 'quest.ini'), QUEST);
      File.writeAllText(Path.combine(folder, 'Localization.English.txt'), ENGLISH);
      File.writeAllText(Path.combine(folder, 'Localization.Spanish.txt'), SPANISH);
    };
    extract();
    applyTranslation(folder, zip({ 'Localization.Spanish.txt': '.,Spanish\nquest.name,La mansión\n', 'img/hall.png': 'y' }), 'Spanish');
    expect(File.readAllText(Path.combine(folder, 'Localization.Spanish.txt'))).toContain('La mansión');
    expect(File.readAllText(Path.combine(folder, 'Spanish/img/hall.png'))).toBe('y');
    expect(File.readAllText(Path.combine(folder, 'quest.ini'))).toBe(QUEST);

    extract();
    applyTranslation(folder, zip({ 'Localization.French.txt': '.,French\nquest.name,La maison\n' }), 'French');
    expect(File.readAllText(Path.combine(folder, 'quest.ini'))).toContain('[QuestText]\nLocalization.French.txt\nLocalization.English.txt');
    expect(scenarioTextsFromFolder(folder).languages).toEqual(['French', 'English', 'Spanish']);
  });
});
