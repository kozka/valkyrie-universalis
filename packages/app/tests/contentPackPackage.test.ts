// What the app checks in a content pack added from a file (host/contentPackPackage.ts), so that its author hears what is
// wrong: built packs for each mistake, and the community packs of the store when they are downloaded. Not ported from
// Valkyrie.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { strToU8, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { checkContentPack, manifestEntry, type ContentPackCheck, type ContentPackContext } from '../src/host/contentPackPackage.ts';

const mom: ContentPackContext = { gameType: 'MoM', officialIds: new Set(['MoMBase', 'HJ']), storeIds: new Set(['TLE']), knownNames: new Map([['TileSideHall1', 'MoMBase']]) };
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

const packIni = (fields: string) => `[ContentPack]\n${fields}\n\n[ContentPackData]\ntiles.ini\n\n[LanguageData]\npck Localization.English.txt\n`;
const good = {
  'content_pack.ini': strToU8(packIni('name=Mis losetas\ndescription=Prueba\nimage="img/cover"\nid=MisLosetas\ntype=MoMCustom')),
  'tiles.ini': strToU8('[TileSideMiSala]\nname={pck:TileSideMiSala}\nimage="img/sala"\n'),
  'Localization.English.txt': strToU8('.,English\nTileSideMiSala,My room\n'),
  'img/cover.png': png,
  'img/sala.png': png,
};

function check(files: Record<string, Uint8Array>, context = mom): ContentPackCheck {
  return checkContentPack(zipSync(files), context);
}

function problems(result: ContentPackCheck): { errors: string[]; warnings: string[] } {
  if (result.kind !== 'pack') throw new Error(result.kind);
  const keys = (list: { key: string; params: string[] }[]) => list.map((p) => [p.key, ...p.params].join('|'));
  return { errors: keys(result.errors), warnings: keys(result.warnings) };
}

describe('a content pack added from a file', () => {
  it('takes a good one as it is, with the entry its manifest needs', () => {
    const result = check(good);
    expect(problems(result)).toEqual({ errors: [], warnings: [] });
    expect(result.kind === 'pack' && result.id).toBe('MisLosetas');
    expect(result.kind === 'pack' && [...manifestEntry(result.pack)]).toEqual([
      ['name', 'Mis losetas'],
      ['description', 'Prueba'],
      ['image', 'img/cover'],
      ['id', 'MisLosetas'],
      ['type', 'MoMCustom'],
    ]);
  });

  it('finds it inside a folder of the zip, as Valkyrie does', () => {
    const inFolder = Object.fromEntries(Object.entries(good).map(([name, data]) => [`MisLosetas/${name}`, data]));
    expect(problems(check(inFolder))).toEqual({ errors: [], warnings: [] });
  });

  it('tells a zip from what is not one, and a scenario from a pack', () => {
    expect(checkContentPack(strToU8('not a zip'), mom).kind).toBe('not-zip');
    expect(check({ 'quest.ini': strToU8('[Quest]\n') }).kind).toBe('scenario');
    expect(check({ 'readme.txt': strToU8('hola') }).kind).toBe('no-pack-ini');
  });

  it('stops what Valkyrie cannot load or the app cannot keep', () => {
    const withIni = (fields: string) => check({ ...good, 'content_pack.ini': strToU8(packIni(fields)) });
    expect(problems(withIni('id=A\ntype=MoMCustom')).errors).toEqual(['PACK_NO_NAME']);
    expect(problems(withIni('name=A\ntype=MoMCustom')).errors).toEqual(['PACK_NO_ID']);
    expect(problems(withIni('name=A\nid=Mis Losetas\ntype=MoMCustom')).errors).toEqual(['PACK_BAD_ID|Mis Losetas']);
    expect(problems(withIni('name=A\nid=HJ\ntype=MoMCustom')).errors).toEqual(['PACK_OFFICIAL_ID|HJ']);
    expect(problems(withIni('name=A\nid=A')).errors).toEqual(['PACK_NO_TYPE|MoM']);
    expect(problems(withIni('name=A\nid=A\ntype=D2ECustom')).errors).toEqual(['PACK_OTHER_GAME|D2ECustom|D2E']);
    expect(problems(withIni('name=A\nid=A\ntype=Custom')).errors).toEqual(['PACK_BAD_TYPE|Custom|MoM']);
    // A data file that is not there: Valkyrie stops loading the pack at it
    const { 'tiles.ini': _, ...noTiles } = good;
    expect(problems(check(noTiles)).errors).toEqual(['PACK_MISSING_DATA|tiles.ini']);
    // A line of only spaces stops IniRead
    expect(problems(check({ ...good, 'tiles.ini': strToU8('[TileSideMiSala]\n  \nimage=img/sala\n') })).errors).toEqual(['CHECK_BLANK_LINE|tiles.ini|2']);
  });

  it('warns of what loads but shows badly, or not on every device', () => {
    const result = check({
      ...good,
      'content_pack.ini': strToU8(packIni('name=A\nimage=img/portada\nicon=img/Icon.png\nid=TLE\ntype=MoM')),
      'tiles.ini': strToU8(
        '[TileSideMiSala]\nimage=img/Sala\n[TileSideOtra]\nimage=img/nada\n[TileSideHall1]\nimage=img/sala\n[EventoRaro]\ntext=x\n[TileSideRaiz]\nimage=/img/sala\n',
      ),
      'more.ini': strToU8('[TileSideMiSala]\nimage=img/sala\n'),
      'img/icon.png': png,
    });
    expect(problems(result)).toEqual({
      errors: [],
      warnings: [
        'PACK_STORE_ID|TLE',
        'PACK_NOT_CUSTOM|MoM|MoMCustom',
        'PACK_NO_IMAGE|img/portada',
        'PACK_CASE|img/Icon.png|img/icon.png',
        'PACK_CASE|img/Sala|img/sala.png',
        'PACK_MISSING_IMAGE|tiles.ini|TileSideOtra|img/nada',
        'PACK_NAME_TAKEN|TileSideHall1|MoMBase',
        'PACK_UNKNOWN_SECTION|tiles.ini|EventoRaro',
        'PACK_IMAGE_ROOTED|tiles.ini|TileSideRaiz|/img/sala',
      ],
    });
  });

  it('warns of texts it cannot read, and keeps each kind of warning short', () => {
    const many = Array.from({ length: 8 }, (_, i) => `[TileSideFalta${i}]\nimage=img/falta${i}\n`).join('');
    const result = check({
      ...good,
      'content_pack.ini': strToU8(packIni('name=A\nid=A\ntype=MoMCustom') + 'pck Localization.Spanish.txt\nsolo\n'),
      'tiles.ini': strToU8(many),
      'Localization.English.txt': strToU8('English\nA,B\n'),
    });
    expect(problems(result).warnings).toEqual([
      'CHECK_LOCALIZATION_HEADER|Localization.English.txt',
      'PACK_MISSING_LANGUAGE|Localization.Spanish.txt',
      'PACK_LANGUAGE_LINE|solo',
      ...Array.from({ length: 5 }, (_, i) => `PACK_MISSING_IMAGE|tiles.ini|TileSideFalta${i}|img/falta${i}`),
      'CHECK_MORE|3',
    ]);
  });
});

// The community packs of the store, when referencias/descargas has them: none has an error; what the check finds in
// them is real (DooM's Gauss Cannon names a picture that is spelt GaussCannon in the pack)
describe('the community packs of the store', () => {
  const root = join(import.meta.dirname, '../../../referencias/descargas');
  const none: Omit<ContentPackContext, 'gameType'> = { officialIds: new Set(), storeIds: new Set(), knownNames: new Map() };
  for (const [game, file, warnings] of [
    ['D2E', 'D2E/packs/D1ED', []],
    ['D2E', 'D2E/packs/DooM', ['PACK_MISSING_IMAGE|items.ini|ItemGaussCannon|img/Tokens/GaussCannan']],
    ['D2E', 'D2E/packs/SOTP', []],
    ['MoM', 'MoM/packs/TLE', ['PACK_UNKNOWN_SECTION|activations.ini|EventPenguinHorror', 'PACK_UNKNOWN_SECTION|activations.ini|EventPenguinEvade']],
  ] as const) {
    const path = join(root, `${file}.valkyrieContentPack`);
    it.skipIf(!existsSync(path))(`reads ${file}`, () => {
      expect(problems(checkContentPack(new Uint8Array(readFileSync(path)), { gameType: game, ...none }))).toEqual({ errors: [], warnings });
    });
  }
});
