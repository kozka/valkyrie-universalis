// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/IniReadTests.cs
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IniData, IniRead } from '../src/ValkyrieTools/IniRead.ts';
import { ValkyrieDebug } from '../src/ValkyrieTools/ValkyrieDebug.ts';

describe('IniReadTests', () => {
  beforeEach(() => {
    // Disable ValkyrieDebug to prevent Unity logging during tests
    ValkyrieDebug.enabled = false;
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
  });

  it('ReadFromString_SimpleSingleSection_ParsesCorrectly', () => {
    const iniContent = '[Section1]\nkey1=value1\nkey2=value2';
    const result = IniRead.readFromString(iniContent);
    expect(result).not.toBeNullable();
    expect(result.get('Section1', 'key1')).toBe('value1');
    expect(result.get('Section1', 'key2')).toBe('value2');
  });

  it('ReadFromString_MultipleSections_ParsesAllSections', () => {
    const iniContent = '[Section1]\nkey1=value1\n\n[Section2]\nkey2=value2';
    const result = IniRead.readFromString(iniContent);
    expect(result).not.toBeNullable();
    expect(result.get('Section1', 'key1')).toBe('value1');
    expect(result.get('Section2', 'key2')).toBe('value2');
  });

  it('ReadFromString_CommentsIgnored_OnlyParsesData', () => {
    const iniContent = '# This is a comment\n[Section1]\n; This is also a comment\nkey1=value1';
    const result = IniRead.readFromString(iniContent);
    expect(result).not.toBeNullable();
    expect(result.get('Section1', 'key1')).toBe('value1');
  });

  it('ReadFromString_KeyWithoutValue_ParsesAsEmptyValue', () => {
    const iniContent = '[Section1]\nkeyonly';
    const result = IniRead.readFromString(iniContent);
    expect(result).not.toBeNullable();
    expect(result.get('Section1', 'keyonly')).toBe('');
  });

  it('ReadFromString_QuotedValue_TrimsQuotes', () => {
    const iniContent = '[Section1]\nkey="quoted value"';
    const result = IniRead.readFromString(iniContent);
    expect(result).not.toBeNullable();
    expect(result.get('Section1', 'key')).toBe('quoted value');
  });

  it('ReadFromString_EmptyInput_ReturnsEmptyData', () => {
    const result = IniRead.readFromString('');
    expect(result).not.toBeNullable();
  });

  it('ReadFromString_WhitespaceAroundValues_TrimsProperly', () => {
    const iniContent = '[Section1]\n  key1  =  value1  ';
    const result = IniRead.readFromString(iniContent);
    expect(result).not.toBeNullable();
    expect(result.get('Section1', 'key1')).toBe('value1');
  });

  it('IniData_Add_AddsNewSection', () => {
    const data = new IniData();
    data.add('NewSection', 'key', 'value');
    expect(data.get('NewSection', 'key')).toBe('value');
  });

  it('IniData_Remove_RemovesEntry', () => {
    const data = new IniData();
    data.add('Section', 'key', 'value');
    data.remove('Section', 'key');
    expect(data.get('Section', 'key')).toBe('');
  });

  it('IniData_RemoveSection_RemovesEntireSection', () => {
    const data = new IniData();
    data.add('Section', 'key1', 'value1');
    data.add('Section', 'key2', 'value2');
    data.remove('Section');
    expect(data.get('Section')).toBeNull();
  });

  it('IniData_GetNonExistentSection_ReturnsNull', () => {
    const data = new IniData();
    expect(data.get('NonExistent')).toBeNull();
  });

  it('IniData_GetNonExistentKey_ReturnsEmptyString', () => {
    const data = new IniData();
    data.add('Section', 'key', 'value');
    expect(data.get('Section', 'nonexistent')).toBe('');
  });

  it('IniData_ToString_OutputsValidIniFormat', () => {
    const data = new IniData();
    data.add('Section', 'key', 'value');
    const result = data.toString();
    expect(result.includes('[Section]')).toBe(true);
    expect(result.includes('key=value')).toBe(true);
  });

  it('IniData_AddDuplicateKey_ReplacesValue', () => {
    const data = new IniData();
    data.add('Section', 'key', 'value1');
    data.add('Section', 'key', 'value2');
    expect(data.get('Section', 'key')).toBe('value2');
  });

  it('ReadFromString_DuplicateSections_IgnoresSecondOccurrence', () => {
    const iniContent = '[Section1]\nkey1=value1\n\n[Section1]\nkey2=value2';
    const result = IniRead.readFromString(iniContent);
    expect(result).not.toBeNullable();
    expect(result.get('Section1', 'key1')).toBe('value1');
    // Second section is ignored, so key2 should not exist
    expect(result.get('Section1', 'key2')).toBe('');
  });
});
