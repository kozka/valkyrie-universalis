// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/ContentDataTests.cs
// FormatterServices.GetUninitializedObject becomes Object.create(ContentData.prototype): no constructor runs.
import { beforeEach, describe, expect, it } from 'vitest';
import { ContentData, ContentPack, DictionaryI18n, LocalizationRead } from '../src/index.ts';

describe('ContentDataTests', () => {
  beforeEach(() => {
    // Clear existing dictionaries to avoid side effects
    LocalizationRead.dicts.clear();

    // Set up a dummy pck dictionary
    const pckDict = new DictionaryI18n();
    pckDict.addEntry('BOXED', 'Boxed Content');
    LocalizationRead.addDictionary('pck', pckDict);
  });

  it('GetContentName_CustomContentPack_NoTranslation_ReturnsTranslatedOrPlain', () => {
    // Arrange
    const cd = Object.create(ContentData.prototype) as ContentData;
    cd.allPacks = [];

    const cp = new ContentPack();
    cp.id = 'SOTP';
    cp.name = 'Sands ofthe Past Content Pack';
    cd.allPacks.push(cp);

    // Act
    const name = cd.getContentName('SOTP');

    // Assert
    expect(name).toBe('Sands ofthe Past Content Pack');
  });

  it('GetContentName_OfficialPack_WithTranslation_ReturnsTranslated', () => {
    // Arrange
    const cd = Object.create(ContentData.prototype) as ContentData;
    cd.allPacks = [];

    const cp = new ContentPack();
    cp.id = 'BOX';
    cp.name = '{pck:BOXED}';
    cd.allPacks.push(cp);

    // Act
    const name = cd.getContentName('BOX');

    // Assert
    expect(name).toBe('Boxed Content');
  });
});
