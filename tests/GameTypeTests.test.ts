// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/GameTypeTests.cs (cross-type region)
// Here at the root because it compares the engine's NoGameType with both game modules.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NoGameType, ValkyrieDebug, type GameType } from '@universalis/engine';
import { D2EGameType } from '@universalis/module-d2e';
import { MoMGameType } from '@universalis/module-mom';

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

  // Cross-GameType Comparison Tests

  it('GameTypes_MoM_HasHigherMaxHeroesThanOthers', () => {
    const mom = createMoMGameType();
    const d2e = new D2EGameType();
    expect(mom.maxHeroes() > d2e.maxHeroes()).toBe(true);
  });

  it('GameTypes_OnlyMoM_HasTileOnGridFalse', () => {
    const no = new NoGameType();
    const d2e = new D2EGameType();
    const mom = createMoMGameType();
    expect(no.tileOnGrid()).toBe(true);
    expect(d2e.tileOnGrid()).toBe(true);
    expect(mom.tileOnGrid()).toBe(false);
  });

  it('GameTypes_TypeNames_AreUnique', () => {
    const typeNames = [new NoGameType().typeName(), new D2EGameType().typeName(), createMoMGameType().typeName()];
    // all should be unique (NoGameType returns empty string)
    expect(typeNames[0]).toBe('');
    expect(typeNames[1]).toBe('D2E');
    expect(typeNames[2]).toBe('MoM');
  });

  it('GameTypes_DataDirectories_ContainTypeName', () => {
    const d2e = new D2EGameType();
    const mom = createMoMGameType();
    expect(d2e.dataDirectory().includes(d2e.typeName())).toBe(true);
    expect(mom.dataDirectory().includes(mom.typeName())).toBe(true);
  });
});
