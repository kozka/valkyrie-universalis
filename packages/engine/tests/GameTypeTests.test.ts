// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/GameTypeTests.cs (NoGameType region)
// The D2EGameType and MoMGameType regions live in their modules' tests; the cross-type region in tests/ at the root.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ContentData, NoGameType, ValkyrieDebug } from '../src/index.ts';

describe('GameTypeTests', () => {
  beforeEach(() => {
    // Disable ValkyrieDebug to prevent Unity logging during tests
    ValkyrieDebug.enabled = false;
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
  });

  // NoGameType Tests

  it('NoGameType_DataDirectory_ReturnsContentPath', () => {
    const result = new NoGameType().dataDirectory();
    expect(result).not.toBeNullable();
    expect(result).toBe(ContentData.contentPath());
  });

  it('NoGameType_HeroName_ReturnsD2EHeroNameKey', () => {
    const result = new NoGameType().heroName();
    expect(result).not.toBeNullable();
    expect(result.dict).toBe('val');
    expect(result.key).toBe('D2E_HERO_NAME');
  });

  it('NoGameType_HeroesName_ReturnsD2EHeroesNameKey', () => {
    const result = new NoGameType().heroesName();
    expect(result).not.toBeNullable();
    expect(result.dict).toBe('val');
    expect(result.key).toBe('D2E_HEROES_NAME');
  });

  it('NoGameType_MaxHeroes_ReturnsZero', () => {
    expect(new NoGameType().maxHeroes()).toBe(0);
  });

  it('NoGameType_DefaultHeroes_ReturnsZero', () => {
    expect(new NoGameType().defaultHeroes()).toBe(0);
  });

  it('NoGameType_TilePixelPerSquare_ReturnsOne', () => {
    expect(new NoGameType().tilePixelPerSquare()).toBe(1);
  });

  it('NoGameType_TypeName_ReturnsEmptyString', () => {
    expect(new NoGameType().typeName()).toBe('');
  });

  it('NoGameType_TileOnGrid_ReturnsTrue', () => {
    expect(new NoGameType().tileOnGrid()).toBe(true);
  });

  it('NoGameType_DisplayMorale_ReturnsFalse', () => {
    expect(new NoGameType().displayMorale()).toBe(false);
  });

  it('NoGameType_MonstersGrouped_ReturnsTrue', () => {
    expect(new NoGameType().monstersGrouped()).toBe(true);
  });

  it('NoGameType_SelectionRound_ReturnsOne', () => {
    expect(new NoGameType().selectionRound()).toBe(1);
  });

  it('NoGameType_TileRound_ReturnsOne', () => {
    expect(new NoGameType().tileRound()).toBe(1);
  });

  it('NoGameType_DisplayHeroes_ReturnsTrue', () => {
    expect(new NoGameType().displayHeroes()).toBe(true);
  });
});
