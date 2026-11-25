// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/ConfigFileTests.cs
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IniData, IniRead, ValkyrieDebug } from '../src/index.ts';
import { boolTryParse, intTryParse } from '../src/platform/CSharp.ts';

/** bool.Parse: like bool.TryParse, but a value that is not a boolean throws. */
function boolParse(value: string): boolean {
  const parsed = boolTryParse(value);
  if (!parsed.ok) throw new Error(`FormatException: String '${value}' was not recognized as a valid Boolean.`);
  return parsed.value;
}

/** int.Parse: like int.TryParse, but a value that is not an integer throws. */
function intParse(value: string): number {
  const parsed = intTryParse(value);
  if (!parsed.ok) throw new Error('FormatException: Input string was not in a correct format.');
  return parsed.value;
}

/**
 * Unit tests for ConfigFile-related functionality
 * Tests focus on IniData parsing and manipulation which is the core of ConfigFile
 * without depending on Game.Get() or file system operations
 */
describe('ConfigFileTests', () => {
  beforeEach(() => {
    // Disable ValkyrieDebug to prevent Unity logging during tests
    ValkyrieDebug.enabled = false;
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
  });

  // Boolean Value Parsing Tests

  it('BooleanParsing_TrueString_ParsesAsTrue', () => {
    const data = IniRead.readFromString('[Settings]\nenabled=True');
    const value = data.get('Settings', 'enabled');
    const result = boolParse(value);
    expect(result).toBe(true);
  });

  it('BooleanParsing_FalseString_ParsesAsFalse', () => {
    const data = IniRead.readFromString('[Settings]\nenabled=False');
    const value = data.get('Settings', 'enabled');
    const result = boolParse(value);
    expect(result).toBe(false);
  });

  it('BooleanParsing_LowercaseTrue_ParsesAsTrue', () => {
    const data = IniRead.readFromString('[Settings]\nenabled=true');
    const value = data.get('Settings', 'enabled');
    const result = boolParse(value);
    expect(result).toBe(true);
  });

  it('BooleanParsing_MissingKey_ReturnsEmptyString', () => {
    const data = IniRead.readFromString('[Settings]\nother=value');
    const value = data.get('Settings', 'enabled');
    expect(value).toBe('');
  });

  // Integer Value Parsing Tests

  it('IntegerParsing_ValidInteger_ParsesCorrectly', () => {
    const data = IniRead.readFromString('[Settings]\nvolume=75');
    const value = data.get('Settings', 'volume');
    const result = intParse(value);
    expect(result).toBe(75);
  });

  it('IntegerParsing_NegativeInteger_ParsesCorrectly', () => {
    const data = IniRead.readFromString('[Settings]\noffset=-10');
    const value = data.get('Settings', 'offset');
    const result = intParse(value);
    expect(result).toBe(-10);
  });

  it('IntegerParsing_Zero_ParsesCorrectly', () => {
    const data = IniRead.readFromString('[Settings]\ncount=0');
    const value = data.get('Settings', 'count');
    const result = intParse(value);
    expect(result).toBe(0);
  });

  // String Value Handling Tests

  it('StringValue_SimpleString_ReturnsAsIs', () => {
    const data = IniRead.readFromString('[Settings]\nlanguage=English');
    const result = data.get('Settings', 'language');
    expect(result).toBe('English');
  });

  it('StringValue_StringWithSpaces_ReturnsWithSpaces', () => {
    const data = IniRead.readFromString('[Settings]\npath=my game path');
    const result = data.get('Settings', 'path');
    expect(result).toBe('my game path');
  });

  it('StringValue_QuotedString_QuotesRemoved', () => {
    const data = IniRead.readFromString('[Settings]\nmessage="Hello World"');
    const result = data.get('Settings', 'message');
    expect(result).toBe('Hello World');
  });

  // Default Value Handling Tests

  it('DefaultValue_MissingSection_ReturnsEmptyString', () => {
    const data = new IniData();
    const result = data.get('NonExistent', 'key');
    expect(result).toBe('');
  });

  it('DefaultValue_MissingKey_ReturnsEmptyString', () => {
    const data = IniRead.readFromString('[Settings]\nexisting=value');
    const result = data.get('Settings', 'nonexistent');
    expect(result).toBe('');
  });

  it('DefaultValue_EmptyData_ReturnsEmptyString', () => {
    const data = new IniData();
    const result = data.get('Any', 'key');
    expect(result).toBe('');
  });

  // Pack Management Tests (simulating ConfigFile behavior)

  it('GetPacks_ExistingPacks_ReturnsPackKeys', () => {
    // simulating D2EPacks section
    const data = IniRead.readFromString('[D2EPacks]\nbase_game=\nconversion_kit=\nmanor_of_ravens=');

    // Act
    const packs = [...(data.get('D2EPacks')?.keys() ?? [])];

    // Assert
    expect(packs.length).toBe(3);
    expect(packs.includes('base_game')).toBe(true);
    expect(packs.includes('conversion_kit')).toBe(true);
    expect(packs.includes('manor_of_ravens')).toBe(true);
  });

  it('GetPacks_NoPacks_ReturnsEmpty', () => {
    const data = new IniData();
    const packs = [...(data.get('D2EPacks')?.keys() ?? [])];
    expect(packs.length).toBe(0);
  });

  it('AddPack_NewPack_AddsToSection', () => {
    // Arrange
    const data = new IniData();
    const gameType = 'D2E';
    const pack = 'new_expansion';

    // Act
    data.add(gameType + 'Packs', pack, '');

    // Assert
    const packs = data.get(gameType + 'Packs')?.keys();
    expect(packs).not.toBeNullable();
    expect([...packs!].includes(pack)).toBe(true);
  });

  it('RemovePack_ExistingPack_RemovesFromSection', () => {
    // Arrange
    const data = new IniData();
    const section = 'D2EPacks';
    data.add(section, 'pack1', '');
    data.add(section, 'pack2', '');

    // Act
    data.remove(section, 'pack1');

    // Assert
    const packs = data.get(section)?.keys();
    expect(packs).not.toBeNullable();
    const keys = [...packs!];
    expect(keys.includes('pack1')).toBe(false);
    expect(keys.includes('pack2')).toBe(true);
  });

  it('GetPackLanguages_PacksWithLanguages_ReturnsDictionary', () => {
    // Arrange
    const data = IniRead.readFromString('[MoMPacks]\nbase_game=English\nexpansion1=French\nexpansion2=');

    // Act
    const packLanguages = data.get('MoMPacks') ?? new Map<string, string>();

    // Assert
    expect(packLanguages.size).toBe(3);
    expect(packLanguages.get('base_game')).toBe('English');
    expect(packLanguages.get('expansion1')).toBe('French');
    expect(packLanguages.get('expansion2')).toBe('');
  });
});
