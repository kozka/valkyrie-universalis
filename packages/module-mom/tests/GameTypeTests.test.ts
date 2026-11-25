// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/GameTypeTests.cs (MoMGameType region)
// Valkyrie reaches the internal MoMGameType by reflection; here the module exports it.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ContentData, ValkyrieDebug, type GameType } from '@universalis/engine';
import { MoMGameType } from '../src/index.ts';

function createMoMGameType(): GameType {
  return new MoMGameType();
}

describe('GameTypeTests', () => {
  beforeEach(() => {
    // Disable ValkyrieDebug to prevent Unity logging during tests
    ValkyrieDebug.enabled = false;
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
  });

  // MoMGameType Tests (via Reflection)

  it('MoMGameType_DataDirectory_ReturnsMoMPath', () => {
    const result = createMoMGameType().dataDirectory();
    expect(result).not.toBeNullable();
    expect(result.endsWith('MoM/')).toBe(true);
    expect(result).toBe(ContentData.contentPath() + 'MoM/');
  });

  it('MoMGameType_HeroName_ReturnsMoMHeroNameKey', () => {
    const result = createMoMGameType().heroName();
    expect(result).not.toBeNullable();
    expect(result.dict).toBe('val');
    expect(result.key).toBe('MOM_HERO_NAME');
  });

  it('MoMGameType_HeroesName_ReturnsMoMHeroesNameKey', () => {
    const result = createMoMGameType().heroesName();
    expect(result).not.toBeNullable();
    expect(result.dict).toBe('val');
    expect(result.key).toBe('MOM_HEROES_NAME');
  });

  it('MoMGameType_MaxHeroes_ReturnsTen', () => {
    expect(createMoMGameType().maxHeroes()).toBe(10);
  });

  it('MoMGameType_DefaultHeroes_ReturnsFive', () => {
    expect(createMoMGameType().defaultHeroes()).toBe(5);
  });

  it('MoMGameType_TilePixelPerSquare_ReturnsExpectedValue', () => {
    const result = createMoMGameType().tilePixelPerSquare();
    // On non-Android platforms, should return 1024f / 3.5f
    const expectedNonAndroid = Math.fround(1024 / 3.5);
    // On Android, should return 512f / 3.5f
    const expectedAndroid = Math.fround(512 / 3.5);
    // Result should be one of these values
    expect(result === expectedNonAndroid || result === expectedAndroid).toBe(true);
  });

  it('MoMGameType_TypeName_ReturnsMoM', () => {
    expect(createMoMGameType().typeName()).toBe('MoM');
  });

  it('MoMGameType_TileOnGrid_ReturnsFalse', () => {
    expect(createMoMGameType().tileOnGrid()).toBe(false);
  });

  it('MoMGameType_DisplayMorale_ReturnsFalse', () => {
    expect(createMoMGameType().displayMorale()).toBe(false);
  });

  it('MoMGameType_MonstersGrouped_ReturnsFalse', () => {
    expect(createMoMGameType().monstersGrouped()).toBe(false);
  });

  it('MoMGameType_SelectionRound_Returns1Point75', () => {
    expect(createMoMGameType().selectionRound()).toBe(1.75);
  });

  it('MoMGameType_TileRound_Returns3Point5', () => {
    expect(createMoMGameType().tileRound()).toBe(3.5);
  });

  it('MoMGameType_DisplayHeroes_ReturnsFalse', () => {
    expect(createMoMGameType().displayHeroes()).toBe(false);
  });

  it('MoMGameType_QuestName_ReturnsMoMQuestNameKey', () => {
    const result = createMoMGameType().questName();
    expect(result).not.toBeNullable();
    expect(result.dict).toBe('val');
    expect(result.key).toBe('MOM_QUEST_NAME');
  });
});
