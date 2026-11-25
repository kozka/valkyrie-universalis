// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/DictionaryI18nTests.cs
// The "logic" tests re-implement Valkyrie's string handling in the test itself, as the original does;
// here they call the .NET string helpers (split, trim) that the port relies on, so they check those too.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DictionaryI18n, ValkyrieConstants, ValkyrieDebug } from '../src/index.ts';
import { split, trim, trimEnd } from '../src/platform/CSharp.ts';

const TRIPLE = '|||';

function parseEntryLogic(entry: string): string {
  let result = entry.split('\\n').join('\n');
  if (result.length >= TRIPLE.length * 2 && result.startsWith(TRIPLE) && trim(result).endsWith(TRIPLE)) {
    result = result.substring(TRIPLE.length, result.length - TRIPLE.length);
  }
  if (result.length > 1 && result[0] === '"' && result[result.length - 1] === '"') {
    result = result.substring(1, result.length - 1);
    result = result.split('""').join('"');
  }
  return result;
}

function serializeLogic(value: string): string {
  const rawValue = value.split('\r\n').join('\n').split('\r').join('\n').split('\n').join('\\n');
  if (rawValue.includes('"') && !rawValue.includes(TRIPLE)) return 'KEY,' + TRIPLE + rawValue + TRIPLE;
  if (rawValue.includes('"') || rawValue.includes(TRIPLE) || rawValue.includes('\\n')) {
    return 'KEY,' + '"' + rawValue.split('"').join('""') + '"';
  }
  return 'KEY,' + rawValue;
}

function isOldFormatLogic(rawLine: string): boolean {
  const components = split(rawLine, [','], 2);
  const isNotOldFormat = components.length > 1 && components[1]!.length > 0 && components[1]![0] === '"';
  return !isNotOldFormat;
}

function combineLogic(mainLanguageValue: string, secondLanguageValue: string | null): string {
  if (secondLanguageValue === null || secondLanguageValue === mainLanguageValue) return mainLanguageValue;
  return `${mainLanguageValue} [${secondLanguageValue}]`;
}

// Helper: build a multi-language dictionary without needing Game.Get()
function buildMultiLangDict(currentLang: string, fallbackLang = '', defaultLang = 'English'): DictionaryI18n {
  // Build with English data first (acts as scenario default)
  const dict = new DictionaryI18n(['.,English', 'KEY,English value'], defaultLang);
  dict.addData(['.,Polish', 'KEY,Polish value']);
  dict.addData(['.,French', 'KEY,French value']);

  // Manually set language properties (avoids needing Game.Get())
  dict.defaultLanguage = defaultLang;
  dict.currentLanguage = currentLang;
  dict.fallbackLanguage = fallbackLang;
  return dict;
}

describe('DictionaryI18nTests', () => {
  beforeEach(() => {
    // Disable ValkyrieDebug to prevent Unity logging during tests
    ValkyrieDebug.enabled = false;
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
  });

  // CSV Parsing Logic Tests

  it('ParseEntryLogic_SimpleValue_ReturnedUnchanged', () => {
    expect('simple value'.split('\\n').join('\n')).toBe('simple value');
  });

  it('ParseEntryLogic_ValueWithEscapedNewline_ConvertsToRealNewline', () => {
    expect('line one\\nline two'.split('\\n').join('\n')).toBe('line one\nline two');
  });

  it('ParseEntryLogic_MultipleEscapedNewlines_AllConverted', () => {
    expect('line1\\nline2\\nline3\\nline4'.split('\\n').join('\n')).toBe('line1\nline2\nline3\nline4');
  });

  it('ParseEntryLogic_QuotedValue_TrimmsQuotes', () => {
    expect(parseEntryLogic('"quoted value"')).toBe('quoted value');
  });

  it('ParseEntryLogic_QuotedValueWithEscapedQuotes_HandlesCorrectly', () => {
    // escaped quotes in CSV are represented as ""
    expect(parseEntryLogic('"value with ""quotes"" inside"')).toBe('value with "quotes" inside');
  });

  it('ParseEntryLogic_TripleQuotedValue_TrimsTripleQuotes', () => {
    expect(parseEntryLogic('|||some complex value|||')).toBe('some complex value');
  });

  it('ParseEntryLogic_TripleQuotedWithInternalQuotes_PreservesInternalQuotes', () => {
    expect(parseEntryLogic('|||value with "internal" quotes|||')).toBe('value with "internal" quotes');
  });

  it('ParseEntryLogic_EmptyQuotedString_ReturnsEmpty', () => {
    expect(parseEntryLogic('""')).toBe('');
  });

  it('ParseEntryLogic_SingleCharacter_ReturnedUnchanged', () => {
    expect(parseEntryLogic('X')).toBe('X');
  });

  it('ParseEntryLogic_EmptyString_ReturnsEmpty', () => {
    expect(parseEntryLogic('')).toBe('');
  });

  // CSV Line Splitting Tests

  it('CsvSplitLogic_SimpleKeyValue_SplitsCorrectly', () => {
    const components = split('KEY,value', [','], 2);
    expect(components.length).toBe(2);
    expect(components[0]).toBe('KEY');
    expect(components[1]).toBe('value');
  });

  it('CsvSplitLogic_KeyValueWithCommaInValue_ValuePreserved', () => {
    // split with limit 2 should preserve commas in value
    const components = split('KEY,value with, commas, inside', [','], 2);
    expect(components.length).toBe(2);
    expect(components[0]).toBe('KEY');
    expect(components[1]).toBe('value with, commas, inside');
  });

  it('CsvSplitLogic_KeyOnly_SingleComponent', () => {
    const components = split('KEYONLY', [','], 2);
    expect(components.length).toBe(1);
    expect(components[0]).toBe('KEYONLY');
  });

  it('CsvSplitLogic_KeyWithEmptyValue_TwoComponents', () => {
    const components = split('KEY,', [','], 2);
    expect(components.length).toBe(2);
    expect(components[0]).toBe('KEY');
    expect(components[1]).toBe('');
  });

  it('CsvSplitLogic_QuotedValueWithComma_SplitsAtFirstComma', () => {
    // note: this is raw split, not full CSV parsing
    const components = split('KEY,"value, with, commas"', [','], 2);
    expect(components.length).toBe(2);
    expect(components[0]).toBe('KEY');
    expect(components[1]).toBe('"value, with, commas"');
  });

  // Quote Counting Logic Tests

  it('QuoteCountLogic_EvenQuotes_IsSelfContained', () => {
    const sections = split('KEY,"quoted value"', '"').length;
    // 3 sections means 2 quotes (even)
    expect(sections % 2 === 0).toBe(false);
  });

  it('QuoteCountLogic_OddQuotes_MayBeMultiline', () => {
    const sections = split('KEY,"quoted value without closing', '"').length;
    // 2 sections means 1 quote (odd)
    expect(sections % 2 === 0).toBe(true);
  });

  it('QuoteCountLogic_NoQuotes_IsSelfContained', () => {
    const sections = split('KEY,simple value', '"').length;
    // 1 section means 0 quotes (even), self-contained
    expect(sections % 2 === 1).toBe(true);
  });

  it('QuoteCountLogic_FourQuotes_IsSelfContained', () => {
    const sections = split('KEY,"value ""with"" escaped quotes"', '"').length;
    // 5 sections means 4 quotes
    expect(sections % 2 === 1).toBe(true);
  });

  // Triple Quote Mode Tests

  it('TripleQuoteDetection_StartsWithTripleQuote_Detected', () => {
    expect('KEY,|||multi line content'.indexOf(`,${TRIPLE}`) !== -1).toBe(true);
  });

  it('TripleQuoteDetection_EndsWithTripleQuote_EndDetected', () => {
    expect(trimEnd('end of content|||').endsWith(TRIPLE)).toBe(true);
  });

  it('TripleQuoteDetection_MiddleLine_NoTripleQuoteStart', () => {
    const line = 'middle line content';
    expect(line.indexOf(`,${TRIPLE}`) !== -1).toBe(false);
    expect(trimEnd(line).endsWith(TRIPLE)).toBe(false);
  });

  it('TripleQuoteDetection_SelfContainedTripleQuote_BothDetected', () => {
    const line = 'KEY,|||single line|||';
    expect(line.indexOf(`,${TRIPLE}`) !== -1).toBe(true);
    expect(trimEnd(line).endsWith(TRIPLE)).toBe(true);
  });

  // Old Format Detection Tests

  it('OldFormatDetection_StartsWithQuote_IsNotOldFormat', () => {
    expect(isOldFormatLogic('KEY,"quoted value"')).toBe(false);
  });

  it('OldFormatDetection_DoesNotStartWithQuote_IsOldFormat', () => {
    expect(isOldFormatLogic('KEY,unquoted value')).toBe(true);
  });

  it('OldFormatDetection_EmptyValue_IsOldFormat', () => {
    // empty value means length is 0, so treated as old format
    expect(isOldFormatLogic('KEY,')).toBe(true);
  });

  it('OldFormatDetection_KeyOnly_IsOldFormat', () => {
    // no value component, so treated as old format
    expect(isOldFormatLogic('KEYONLY')).toBe(true);
  });

  // Comment Detection Tests

  it('CommentDetection_LineStartsWithDoubleSlash_IsComment', () => {
    expect(trim('// This is a comment').indexOf('//') === 0).toBe(true);
  });

  it('CommentDetection_LineStartsWithSpacesThenDoubleSlash_IsComment', () => {
    expect(trim('   // This is a comment with leading spaces').indexOf('//') === 0).toBe(true);
  });

  it('CommentDetection_LineContainsDoubleSlashNotAtStart_IsNotComment', () => {
    expect(trim('KEY,value with // in middle').indexOf('//') === 0).toBe(false);
  });

  it('CommentDetection_RegularLine_IsNotComment', () => {
    expect(trim('KEY,regular value').indexOf('//') === 0).toBe(false);
  });

  // Line Trimming Tests

  it('LineTrimming_RemovesCarriageReturn', () => {
    expect(trim('KEY,value\r', '\r', '\n')).toBe('KEY,value');
  });

  it('LineTrimming_RemovesLineFeed', () => {
    expect(trim('KEY,value\n', '\r', '\n')).toBe('KEY,value');
  });

  it('LineTrimming_RemovesBothCRLF', () => {
    expect(trim('KEY,value\r\n', '\r', '\n')).toBe('KEY,value');
  });

  it('LineTrimming_PreservesInternalWhitespace', () => {
    expect(trim('KEY,value with spaces\r\n', '\r', '\n')).toBe('KEY,value with spaces');
  });

  // Serialization Logic Tests

  it('SerializationLogic_SimpleValue_NoQuotesAdded', () => {
    expect(serializeLogic('simple value')).toBe('KEY,simple value');
  });

  it('SerializationLogic_ValueWithNewlines_GetsQuoted', () => {
    expect(serializeLogic('line1\nline2')).toBe('KEY,"line1\\nline2"');
  });

  it('SerializationLogic_ValueWithQuotes_GetsTripleQuoted', () => {
    expect(serializeLogic('value with "quotes"')).toBe('KEY,|||value with "quotes"|||');
  });

  it('SerializationLogic_ValueWithTripleQuotes_GetsDoubleQuoted', () => {
    expect(serializeLogic('value with ||| in it')).toBe('KEY,"value with ||| in it"');
  });

  // Language Header Parsing Tests

  it('LanguageHeaderParsing_ExtractsLanguageName', () => {
    expect(trim(split('.,English', ',')[1]!, '"')).toBe('English');
  });

  it('LanguageHeaderParsing_QuotedLanguageName_TrimmsQuotes', () => {
    expect(trim(split('.,"Spanish"', ',')[1]!, '"')).toBe('Spanish');
  });

  it('LanguageHeaderParsing_LanguageWithSpaces_Preserved', () => {
    expect(trim(split('.,"Chinese Simplified"', ',')[1]!, '"')).toBe('Chinese Simplified');
  });

  // Key Search Pattern Tests

  it('KeySearchPattern_KeyWithComma_MatchesCorrectly', () => {
    expect('MY_KEY,some value'.startsWith('MY_KEY' + ',')).toBe(true);
  });

  it('KeySearchPattern_DifferentKey_DoesNotMatch', () => {
    expect('OTHER_KEY,some value'.startsWith('MY_KEY' + ',')).toBe(false);
  });

  it('KeySearchPattern_PartialKeyMatch_DoesNotMatchIncorrectly', () => {
    expect('KEY_EXTENDED,some value'.startsWith('KEY' + ',')).toBe(false);
  });

  it('KeySearchPattern_ExtractValueAfterMatch', () => {
    const key = 'MY_KEY';
    const rawLine = 'MY_KEY,the value part';
    const value = rawLine.startsWith(key + ',') ? rawLine.substring(key.length + 1) : null;
    expect(value).toBe('the value part');
  });

  // Combine Logic Tests

  it('CombineLogic_NoSecondLanguage_ReturnsMainOnly', () => {
    expect(combineLogic('Hello', null)).toBe('Hello');
  });

  it('CombineLogic_SameValue_ReturnsMainOnly', () => {
    expect(combineLogic('Hello', 'Hello')).toBe('Hello');
  });

  it('CombineLogic_DifferentValues_ReturnsCombined', () => {
    expect(combineLogic('Hello', 'Hola')).toBe('Hello [Hola]');
  });

  // Required Language HashSet Tests

  it('RequiredLanguages_DefaultContainsEnglish', () => {
    const requiredLanguages = new Set([ValkyrieConstants.DefaultLanguage]);
    expect(requiredLanguages.has('English')).toBe(true);
  });

  it('RequiredLanguages_AddNew_ReturnsTrue', () => {
    const requiredLanguages = new Set([ValkyrieConstants.DefaultLanguage]);
    const added = !requiredLanguages.has('Spanish');
    requiredLanguages.add('Spanish');
    expect(added).toBe(true);
    expect(requiredLanguages.has('Spanish')).toBe(true);
  });

  it('RequiredLanguages_AddExisting_ReturnsFalse', () => {
    const requiredLanguages = new Set([ValkyrieConstants.DefaultLanguage]);
    expect(!requiredLanguages.has('English')).toBe(false);
  });

  it('RequiredLanguages_MultipleLanguages_AllPresent', () => {
    const requiredLanguages = new Set([ValkyrieConstants.DefaultLanguage]);
    requiredLanguages.add('Spanish');
    requiredLanguages.add('German');
    requiredLanguages.add('French');
    expect(requiredLanguages.size).toBe(4);
    for (const language of ['English', 'Spanish', 'German', 'French']) expect(requiredLanguages.has(language)).toBe(true);
  });

  // Dictionary Data Structure Tests

  it('DictionaryStructure_AddLanguage_CreatesEntry', () => {
    const data = new Map<string, Map<string, string>>();
    data.set('English', new Map());
    data.get('English')!.set('KEY', 'value');
    expect(data.has('English')).toBe(true);
    expect(data.get('English')!.get('KEY')).toBe('value');
  });

  it('DictionaryStructure_MultipleLanguages_Isolated', () => {
    const data = new Map<string, Map<string, string>>();
    data.set('English', new Map([['GREETING', 'Hello']]));
    data.set('Spanish', new Map([['GREETING', 'Hola']]));
    expect(data.get('English')!.get('GREETING')).toBe('Hello');
    expect(data.get('Spanish')!.get('GREETING')).toBe('Hola');
  });

  it('DictionaryStructure_ReplaceValue_Works', () => {
    const data = new Map([['English', new Map([['KEY', 'original']])]]);
    data.get('English')!.set('KEY', 'updated');
    expect(data.get('English')!.get('KEY')).toBe('updated');
  });

  it('DictionaryStructure_RemoveKey_Works', () => {
    const data = new Map([['English', new Map([['KEY1', 'value1'], ['KEY2', 'value2']])]]);
    data.get('English')!.delete('KEY1');
    expect(data.get('English')!.has('KEY1')).toBe(false);
    expect(data.get('English')!.has('KEY2')).toBe(true);
  });

  // Raw Data List Tests

  it('RawDataList_AddRange_AppendsData', () => {
    const rawData = new Map([['English', ['.,English', 'KEY1,value1']]]);
    rawData.get('English')!.push(...['KEY2,value2', 'KEY3,value3']);
    expect(rawData.get('English')!.length).toBe(4);
    expect(rawData.get('English')![3]).toBe('KEY3,value3');
  });

  it('RawDataList_NewLanguage_CreatedIfNotExists', () => {
    const rawData = new Map<string, string[]>();
    if (!rawData.has('Spanish')) rawData.set('Spanish', []);
    rawData.get('Spanish')!.push('.,Spanish');
    expect(rawData.has('Spanish')).toBe(true);
    expect(rawData.get('Spanish')!.length).toBe(1);
  });

  // Key To Group Mapping Tests

  it('KeyToGroup_SetAndRetrieve_Works', () => {
    const keyToGroup = new Map<string, string>();
    keyToGroup.set('KEY1', 'GroupA');
    keyToGroup.set('KEY2', 'GroupB');
    keyToGroup.set('KEY3', 'GroupA');
    expect(keyToGroup.get('KEY1')).toBe('GroupA');
    expect(keyToGroup.get('KEY2')).toBe('GroupB');
    expect(keyToGroup.get('KEY3')).toBe('GroupA');
  });

  it('GroupToLanguage_SetAndRetrieve_Works', () => {
    const groupToLanguage = new Map<string, string>();
    groupToLanguage.set('GroupA', 'Spanish');
    groupToLanguage.set('GroupB', 'German');
    expect(groupToLanguage.get('GroupA')).toBe('Spanish');
    expect(groupToLanguage.get('GroupB')).toBe('German');
  });

  it('GroupToLanguage_RemoveWithEmptyString_Works', () => {
    const groupToLanguage = new Map([['GroupA', 'Spanish']]);
    const language = '';
    if (trim(language).length === 0) groupToLanguage.delete('GroupA');
    expect(groupToLanguage.has('GroupA')).toBe(false);
  });

  // Prefix Removal Logic Tests

  it('PrefixRemoval_MatchingPrefix_RemovedFromList', () => {
    const languageData = new Map([
      ['QUEST_ITEM1', 'Item 1'],
      ['QUEST_ITEM2', 'Item 2'],
      ['OTHER_KEY', 'Other'],
    ]);
    const toRemove = [...languageData.keys()].filter((key) => key.indexOf('QUEST_') === 0);
    for (const key of toRemove) languageData.delete(key);
    expect(languageData.has('QUEST_ITEM1')).toBe(false);
    expect(languageData.has('QUEST_ITEM2')).toBe(false);
    expect(languageData.has('OTHER_KEY')).toBe(true);
  });

  it('PrefixRename_MatchingPrefix_KeysRenamed', () => {
    const languageData = new Map([
      ['OLD_ITEM1', 'Item 1'],
      ['OLD_ITEM2', 'Item 2'],
      ['OTHER_KEY', 'Other'],
    ]);
    const toRename = new Map<string, string>();
    for (const key of languageData.keys()) {
      if (key.indexOf('OLD_') === 0) toRename.set(key, 'NEW_' + key.substring('OLD_'.length));
    }
    for (const [oldKey, newKey] of toRename) {
      languageData.set(newKey, languageData.get(oldKey)!);
      languageData.delete(oldKey);
    }
    expect(languageData.has('OLD_ITEM1')).toBe(false);
    expect(languageData.has('OLD_ITEM2')).toBe(false);
    expect(languageData.has('NEW_ITEM1')).toBe(true);
    expect(languageData.has('NEW_ITEM2')).toBe(true);
    expect(languageData.get('NEW_ITEM1')).toBe('Item 1');
    expect(languageData.get('NEW_ITEM2')).toBe('Item 2');
  });

  // AddData(DictionaryI18n) Tests

  it('AddData_MergesRawDataFromOtherDictionary_Successfully', () => {
    const dict1 = new DictionaryI18n(['.,English', 'KEY1,Value1']);
    const dict2 = new DictionaryI18n(['.,English', 'KEY2,Value2']);

    dict1.addData(dict2);

    // The data is stored in rawData, which is private. However, we can use ExtractAllMatches to verify.
    const matches1 = dict1.extractAllMatches('KEY1');
    const matches2 = dict1.extractAllMatches('KEY2');
    expect(matches1.has('English')).toBe(true);
    expect(matches1.get('English')).toBe('Value1');
    expect(matches2.has('English')).toBe(true);
    expect(matches2.get('English')).toBe('Value2');
  });

  it('AddData_NullOtherDictionary_DoesNothing', () => {
    const dict1 = new DictionaryI18n(['.,English', 'KEY1,Value1']);

    // should not throw
    dict1.addData(null);

    const matches1 = dict1.extractAllMatches('KEY1');
    expect(matches1.has('English')).toBe(true);
    expect(matches1.get('English')).toBe('Value1');
  });

  // Fallback Language Tests

  it('GetValue_CurrentLanguagePresent_ReturnsCurrentLanguage', () => {
    const dict = buildMultiLangDict('Polish', 'French');
    expect(dict.getValue('KEY')).toBe('Polish value');
  });

  it('GetValue_CurrentLanguageMissing_FallbackPresent_ReturnsFallback', () => {
    // Ukrainian is not in the dict, French is the fallback
    const dict = buildMultiLangDict('Ukrainian', 'French');
    expect(dict.getValue('KEY')).toBe('French value');
  });

  it('GetValue_CurrentAndFallbackMissing_ReturnsDefaultLanguage', () => {
    // Ukrainian current, German fallback (neither in dict), English is default
    const dict = buildMultiLangDict('Ukrainian', 'German');
    expect(dict.getValue('KEY')).toBe('English value');
  });

  it('GetValue_EmptyFallback_SkipsFallbackAndUsesDefault', () => {
    // Ukrainian current, no fallback set, English is default
    const dict = buildMultiLangDict('Ukrainian', '');
    // should fall straight to English (defaultLanguage)
    expect(dict.getValue('KEY')).toBe('English value');
  });

  it('GetValue_FallbackSameAsCurrentLanguage_NotCheckedTwice_ReturnsDefault', () => {
    // fallback = current (both Ukrainian, not in dict)
    const dict = buildMultiLangDict('Ukrainian', 'Ukrainian');
    // fallback skipped (same as current), falls to English default
    expect(dict.getValue('KEY')).toBe('English value');
  });

  it('GetValue_FallbackSameAsDefault_FallbackUsedCorrectly', () => {
    // current = Ukrainian (missing), fallback = English (same as defaultLang)
    const dict = buildMultiLangDict('Ukrainian', 'English');
    // fallback finds English value directly
    expect(dict.getValue('KEY')).toBe('English value');
  });
});
