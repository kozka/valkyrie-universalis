// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/StringKeyTests.cs
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DictionaryI18n, LocalizationRead, StringKey, ValkyrieDebug } from '../src/index.ts';

describe('StringKeyTests', () => {
  beforeEach(() => {
    // Disable ValkyrieDebug to prevent Unity logging during tests
    ValkyrieDebug.enabled = false;

    // Add a test dictionary to LocalizationRead so regex pattern works
    // This allows the StringKey constructor to recognize valid key formats
    LocalizationRead.dicts.set('tst', null);
    LocalizationRead.dicts.set('ffg', null);
    LocalizationRead.dicts.set('qst', null);
    LocalizationRead.dicts.set('val', null);
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
    // Clean up test dictionaries
    LocalizationRead.dicts.clear();
  });

  // Constructor Tests - Single String Parameter

  it('Constructor_ValidKeyFormat_ParsesDictCorrectly', () => {
    const result = new StringKey('{tst:MY_KEY}');
    expect(result.dict).toBe('tst');
  });

  it('Constructor_ValidKeyFormat_ParsesKeyCorrectly', () => {
    const result = new StringKey('{tst:MY_KEY}');
    expect(result.key).toBe('MY_KEY');
  });

  it('Constructor_ValidKeyWithParameters_ParsesParametersCorrectly', () => {
    const result = new StringKey('{tst:MY_KEY:param1}');
    expect(result.dict).toBe('tst');
    expect(result.key).toBe('MY_KEY');
    expect(result.fullKey).toBe('{tst:MY_KEY:param1}');
  });

  it('Constructor_ValidKeyWithMultipleColonParameters_ParsesCorrectly', () => {
    const result = new StringKey('{tst:MY_KEY:param1:param2:param3}');
    expect(result.dict).toBe('tst');
    expect(result.key).toBe('MY_KEY');
    // Parameters should contain everything after the second colon
    expect(result.fullKey).toBe('{tst:MY_KEY:param1:param2:param3}');
  });

  it('Constructor_PlainTextNotKey_SetsKeyAsInput', () => {
    const result = new StringKey('This is plain text');
    expect(result.dict).toBeNull();
    expect(result.key).toBe('This is plain text');
  });

  it('Constructor_InvalidKeyFormat_TreatsAsPlainText', () => {
    const result = new StringKey('{invalid}');
    expect(result.dict).toBeNull();
    expect(result.key).toBe('{invalid}');
  });

  it('Constructor_MixedTextAndKeyFormat_TreatsAsMixedKey', () => {
    const result = new StringKey('{tst:MY_KEY} (MIXED)');
    expect(result.dict).toBeNull();
    expect(result.key).toBe('{tst:MY_KEY} (MIXED)');
  });

  // Constructor Tests - Dict and Key Parameters

  it('Constructor_DictAndKey_SetsPropertiesCorrectly', () => {
    const result = new StringKey('qst', 'MONSTER_NAME');
    expect(result.dict).toBe('qst');
    expect(result.key).toBe('MONSTER_NAME');
  });

  it('Constructor_DictAndKeyWithDoLookupFalse_SetsPreventLookup', () => {
    const result = new StringKey('qst', 'MONSTER_NAME', false);
    expect(result.dict).toBe('qst');
    expect(result.key).toBe('MONSTER_NAME');
    // isKey() should still return true since dict is set
    expect(result.isKey()).toBe(true);
  });

  it('Constructor_DictAndKeyWithStringParam_SetsParameterFormat', () => {
    const result = new StringKey('qst', 'MY_KEY', 'paramValue');
    expect(result.dict).toBe('qst');
    expect(result.key).toBe('MY_KEY');
    expect(result.fullKey).toBe('{qst:MY_KEY:{0}:paramValue}');
  });

  it('Constructor_DictAndKeyWithIntParam_SetsParameterFormat', () => {
    const result = new StringKey('qst', 'MY_KEY', 42);
    expect(result.dict).toBe('qst');
    expect(result.key).toBe('MY_KEY');
    expect(result.fullKey).toBe('{qst:MY_KEY:{0}:42}');
  });

  it('Constructor_DictAndKeyWithStringKeyParam_UsesFullKeyOfParam', () => {
    const paramKey = new StringKey('val', 'PARAM_KEY');
    const result = new StringKey('qst', 'MY_KEY', paramKey);
    expect(result.dict).toBe('qst');
    expect(result.key).toBe('MY_KEY');
    expect(result.fullKey).toBe('{qst:MY_KEY:{0}:{val:PARAM_KEY}}');
  });

  it('Constructor_TemplateWithTwoParams_SetsParametersCorrectly', () => {
    const template = new StringKey('qst', 'TEMPLATE_KEY');
    const result = new StringKey(template, 'first', 'second');
    expect(result.dict).toBe('qst');
    expect(result.key).toBe('TEMPLATE_KEY');
    expect(result.fullKey).toBe('{qst:TEMPLATE_KEY:first:second}');
  });

  // isKey Tests

  it('IsKey_ValidKeyFormat_ReturnsTrue', () => {
    expect(new StringKey('{qst:MY_KEY}').isKey()).toBe(true);
  });

  it('IsKey_PlainText_ReturnsFalse', () => {
    expect(new StringKey('plain text').isKey()).toBe(false);
  });

  it('IsKey_NullDict_ReturnsFalse', () => {
    expect(new StringKey(null, 'key', false).isKey()).toBe(false);
  });

  // fullKey Property Tests

  it('FullKey_NullDict_ReturnsKeyOnly', () => {
    expect(new StringKey(null, 'plain_key', false).fullKey).toBe('plain_key');
  });

  it('FullKey_WithDict_ReturnsFormattedKey', () => {
    expect(new StringKey('ffg', 'SOME_KEY').fullKey).toBe('{ffg:SOME_KEY}');
  });

  it('FullKey_WithDictAndParameters_ReturnsFullFormat', () => {
    expect(new StringKey('val', 'MSG', 'replacement').fullKey).toBe('{val:MSG:{0}:replacement}');
  });

  // Translate Tests

  it('Translate_MixedTextAndKeyFormat_TranslatesEmbeddedKey', () => {
    LocalizationRead.dicts.set('tst', new DictionaryI18n());
    LocalizationRead.dicts.get('tst')!.addEntry('SANDS_KEY', 'Sands of the Past');

    const sut = new StringKey('{tst:SANDS_KEY} (SOTP)');
    expect(sut.translate()).toBe('Sands of the Past (SOTP)');
  });

  // ToString Tests

  it('ToString_PlainKey_ReturnsKey', () => {
    const key = new StringKey('plain text with\\nnewline');
    // ToString should escape newlines
    expect(key.toString()).toBe('plain text with\\nnewline');
  });

  it('ToString_FormattedKey_ReturnsFullKey', () => {
    expect(new StringKey('{qst:MY_KEY}').toString()).toBe('{qst:MY_KEY}');
  });

  // NULL Static Field Test

  it('NULL_StaticField_HasNullDictAndEmptyKey', () => {
    const nullKey = StringKey.NULL;
    expect(nullKey.dict).toBeNull();
    expect(nullKey.key).toBe('');
    expect(nullKey.isKey()).toBe(false);
  });
});
