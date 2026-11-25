// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/GameTypeTests.cs (D2EGameType region)
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ContentData, ValkyrieDebug } from '@universalis/engine';
import { D2EGameType } from '../src/index.ts';

describe('GameTypeTests', () => {
  beforeEach(() => {
    // Disable ValkyrieDebug to prevent Unity logging during tests
    ValkyrieDebug.enabled = false;
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
  });

  // D2EGameType Tests

  it('D2EGameType_DataDirectory_ReturnsD2EPath', () => {
    const result = new D2EGameType().dataDirectory();
    expect(result).not.toBeNullable();
    expect(result.endsWith('D2E/')).toBe(true);
    expect(result).toBe(ContentData.contentPath() + 'D2E/');
  });

  it('D2EGameType_HeroName_ReturnsD2EHeroNameKey', () => {
    const result = new D2EGameType().heroName();
    expect(result).not.toBeNullable();
    expect(result.dict).toBe('val');
    expect(result.key).toBe('D2E_HERO_NAME');
  });

  it('D2EGameType_HeroesName_ReturnsD2EHeroesNameKey', () => {
    const result = new D2EGameType().heroesName();
    expect(result).not.toBeNullable();
    expect(result.dict).toBe('val');
    expect(result.key).toBe('D2E_HEROES_NAME');
  });

  it('D2EGameType_MaxHeroes_ReturnsFour', () => {
    expect(new D2EGameType().maxHeroes()).toBe(4);
  });

  it('D2EGameType_DefaultHeroes_ReturnsFour', () => {
    expect(new D2EGameType().defaultHeroes()).toBe(4);
  });

  it('D2EGameType_TilePixelPerSquare_Returns105', () => {
    expect(new D2EGameType().tilePixelPerSquare()).toBe(105);
  });

  it('D2EGameType_TypeName_ReturnsD2E', () => {
    expect(new D2EGameType().typeName()).toBe('D2E');
  });

  it('D2EGameType_TileOnGrid_ReturnsTrue', () => {
    expect(new D2EGameType().tileOnGrid()).toBe(true);
  });

  it('D2EGameType_DisplayMorale_ReturnsTrue', () => {
    expect(new D2EGameType().displayMorale()).toBe(true);
  });

  it('D2EGameType_MonstersGrouped_ReturnsTrue', () => {
    expect(new D2EGameType().monstersGrouped()).toBe(true);
  });

  it('D2EGameType_SelectionRound_ReturnsOne', () => {
    expect(new D2EGameType().selectionRound()).toBe(1);
  });

  it('D2EGameType_TileRound_ReturnsOne', () => {
    expect(new D2EGameType().tileRound()).toBe(1);
  });

  it('D2EGameType_DisplayHeroes_ReturnsTrue', () => {
    expect(new D2EGameType().displayHeroes()).toBe(true);
  });

  it('D2EGameType_QuestName_ReturnsD2EQuestNameKey', () => {
    const result = new D2EGameType().questName();
    expect(result).not.toBeNullable();
    expect(result.dict).toBe('val');
    expect(result.key).toBe('D2E_QUEST_NAME');
  });
});
