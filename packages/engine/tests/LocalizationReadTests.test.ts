// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/LocalizationReadTests.cs
// The "logic" tests that re-implement Valkyrie's loops in the test itself are kept, as in the original.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DictionaryI18n, LocalizationRead, StringKey, ValkyrieDebug } from '../src/index.ts';

function countMatches(s: string, pattern: string): number {
  return (s.match(new RegExp(pattern, 'g')) ?? []).length;
}

function parseElements(input: string): string[] {
  let bracketLevel = 0;
  let lastSection = 0;
  const elements: string[] = [];
  for (let index = 0; index < input.length; index++) {
    if (input[index] === '{') bracketLevel++;
    if (input[index] === '}') bracketLevel--;
    if (input[index] === ':') {
      if (bracketLevel === 0) {
        elements.push(input.substring(lastSection, index));
        lastSection = index + 1;
      }
    }
  }
  elements.push(input.substring(lastSection));
  return elements;
}

function replaceParameters(fetched: string, elements: string[]): string {
  for (let i = 2; i < elements.length; i += 2) {
    fetched = fetched.split(elements[i - 1]!).join(elements[i]!);
  }
  return fetched;
}

function convertBbCode(input: string): string {
  let result = input.split('[u]').join('<b>').split('[/u]').join('</b>');
  result = result.split('[i]').join('<i>').split('[/i]').join('</i>');
  return result.split('[b]').join('<b>').split('[/b]').join('</b>');
}

describe('LocalizationReadTests', () => {
  let originalDicts: Map<string, DictionaryI18n | null>;

  beforeEach(() => {
    // Disable ValkyrieDebug to prevent Unity logging during tests
    ValkyrieDebug.enabled = false;

    // Save original dicts state
    originalDicts = LocalizationRead.dicts;
    // Reset dicts to empty state for controlled testing
    LocalizationRead.dicts = new Map();
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
    // Restore original dicts
    LocalizationRead.dicts = originalDicts;
  });

  // LookupRegexKey Tests

  it('LookupRegexKey_EmptyDicts_ReturnsMinimalPattern', () => {
    LocalizationRead.dicts = new Map();
    LocalizationRead.dicts.set('ffg', null);
    const result = LocalizationRead.lookupRegexKey();
    expect(result).not.toBeNullable();
    expect(result).toBe('{(ffg):');
  });

  it('LookupRegexKey_SingleDictionary_ReturnsCorrectPattern', () => {
    LocalizationRead.dicts.set('qst', null);
    expect(LocalizationRead.lookupRegexKey()).toBe('{(qst):');
  });

  it('LookupRegexKey_MultipleDictionaries_ReturnsAlternationPattern', () => {
    LocalizationRead.dicts.set('ffg', null);
    LocalizationRead.dicts.set('qst', null);
    const result = LocalizationRead.lookupRegexKey();
    // Pattern should contain alternation for both dictionary keys
    expect(result.includes('ffg')).toBe(true);
    expect(result.includes('qst')).toBe(true);
    expect(result.includes('|')).toBe(true);
    expect(result.startsWith('{(')).toBe(true);
    expect(result.endsWith('):')).toBe(true);
  });

  it('LookupRegexKey_ThreeDictionaries_ReturnsCorrectAlternationPattern', () => {
    LocalizationRead.dicts.set('ffg', null);
    LocalizationRead.dicts.set('qst', null);
    LocalizationRead.dicts.set('val', null);
    const result = LocalizationRead.lookupRegexKey();
    expect(result.includes('ffg')).toBe(true);
    expect(result.includes('qst')).toBe(true);
    expect(result.includes('val')).toBe(true);
    // Should have 2 pipe characters for 3 alternatives
    expect(result.split('|').length - 1).toBe(2);
  });

  it('LookupRegexKey_ResultIsValidRegex_MatchesExpectedKeys', () => {
    LocalizationRead.dicts.set('ffg', null);
    LocalizationRead.dicts.set('qst', null);
    const regexPattern = LocalizationRead.lookupRegexKey();
    // verify pattern is valid regex and matches expected strings
    expect(() => new RegExp(regexPattern).exec('test')).not.toThrow();
    expect(new RegExp(regexPattern).test('{ffg:TEST}')).toBe(true);
    expect(new RegExp(regexPattern).test('{qst:MONSTER_NAME}')).toBe(true);
    expect(new RegExp(regexPattern).test('{xyz:TEST}')).toBe(false);
  });

  it('LookupRegexKey_PatternMatchesNestedBraces', () => {
    LocalizationRead.dicts.set('ffg', null);
    const regexPattern = LocalizationRead.lookupRegexKey();
    // pattern should match start of nested lookups
    expect(new RegExp(regexPattern).test('{ffg:KEY{nested}}')).toBe(true);
  });

  // selectDictionary Tests

  it('SelectDictionary_NullDictName_ReturnsNull', () => {
    expect(LocalizationRead.selectDictionary(null)).toBeNull();
  });

  it('SelectDictionary_NonExistentDictName_ReturnsNull', () => {
    LocalizationRead.dicts.set('ffg', null);
    expect(LocalizationRead.selectDictionary('nonexistent')).toBeNull();
  });

  it('SelectDictionary_ExistingDictName_ReturnsDictionary', () => {
    // we use null since DictionaryI18n requires Game.Get()
    LocalizationRead.dicts.set('qst', null);
    // Returns the null we stored
    expect(LocalizationRead.selectDictionary('qst')).toBeNull();
  });

  it('SelectDictionary_EmptyString_ReturnsNull', () => {
    expect(LocalizationRead.selectDictionary('')).toBeNull();
  });

  // AddDictionary Tests

  it('AddDictionary_NewDictionary_AddsToDicts', () => {
    LocalizationRead.addDictionary('test', null);
    expect(LocalizationRead.dicts.has('test')).toBe(true);
  });

  it('AddDictionary_MergesWithExistingDictionary', () => {
    const existingDict = new DictionaryI18n(['.,English', 'KEY1,Value1']);
    LocalizationRead.dicts.set('test', existingDict);
    const newDict = new DictionaryI18n(['.,English', 'KEY2,Value2']);

    // should merge without error
    LocalizationRead.addDictionary('test', newDict);

    expect(LocalizationRead.dicts.has('test')).toBe(true);
    expect(LocalizationRead.dicts.size).toBe(1);
    expect(LocalizationRead.dicts.get('test')!.keyExists('KEY1')).toBe(true);
    expect(LocalizationRead.dicts.get('test')!.keyExists('KEY2')).toBe(true);
  });

  it('AddDictionary_MultipleAdds_AllPersist', () => {
    LocalizationRead.addDictionary('dict1', null);
    LocalizationRead.addDictionary('dict2', null);
    LocalizationRead.addDictionary('dict3', null);
    expect(LocalizationRead.dicts.size).toBe(3);
    expect(LocalizationRead.dicts.has('dict1')).toBe(true);
    expect(LocalizationRead.dicts.has('dict2')).toBe(true);
    expect(LocalizationRead.dicts.has('dict3')).toBe(true);
  });

  // BBCode to HTML Conversion Tests (String Replace Logic)

  it('BbCodeConversion_UnderlineToHtml_ConvertsToBold', () => {
    expect(convertBbCode('[u]underlined text[/u]')).toBe('<b>underlined text</b>');
  });

  it('BbCodeConversion_ItalicToHtml_ConvertsToItalic', () => {
    expect(convertBbCode('[i]italic text[/i]')).toBe('<i>italic text</i>');
  });

  it('BbCodeConversion_BoldToHtml_ConvertsToBold', () => {
    expect(convertBbCode('[b]bold text[/b]')).toBe('<b>bold text</b>');
  });

  it('BbCodeConversion_MixedTags_AllConverted', () => {
    expect(convertBbCode('[b]bold[/b] and [i]italic[/i] and [u]underline[/u]')).toBe(
      '<b>bold</b> and <i>italic</i> and <b>underline</b>',
    );
  });

  it('BbCodeConversion_NestedTags_AllConverted', () => {
    expect(convertBbCode('[b][i]bold italic[/i][/b]')).toBe('<b><i>bold italic</i></b>');
  });

  it('BbCodeConversion_NoTags_UnchangedText', () => {
    expect(convertBbCode('plain text without tags')).toBe('plain text without tags');
  });

  it('BbCodeConversion_EmptyString_ReturnsEmpty', () => {
    expect(convertBbCode('')).toBe('');
  });

  // Unclosed Tag Handling Tests

  it('UnclosedTagHandling_OneBoldUnclosed_AddsClosingTag', () => {
    let input = '<b>unclosed bold';
    while (countMatches(input, '<b>') > countMatches(input, '</b>')) input += '</b>';
    expect(input).toBe('<b>unclosed bold</b>');
  });

  it('UnclosedTagHandling_TwoBoldUnclosed_AddsTwoClosingTags', () => {
    let input = '<b><b>double unclosed';
    while (countMatches(input, '<b>') > countMatches(input, '</b>')) input += '</b>';
    expect(input).toBe('<b><b>double unclosed</b></b>');
  });

  it('UnclosedTagHandling_OneItalicUnclosed_AddsClosingTag', () => {
    let input = '<i>unclosed italic';
    while (countMatches(input, '<i>') > countMatches(input, '</i>')) input += '</i>';
    expect(input).toBe('<i>unclosed italic</i>');
  });

  it('UnclosedTagHandling_MixedUnclosed_AllClosed', () => {
    let input = '<b>bold <i>italic';
    while (countMatches(input, '<b>') > countMatches(input, '</b>')) input += '</b>';
    while (countMatches(input, '<i>') > countMatches(input, '</i>')) input += '</i>';
    expect(input.endsWith('</b></i>') || input.endsWith('</i></b>') || (input.includes('</b>') && input.includes('</i>'))).toBe(true);
    expect(countMatches(input, '<b>')).toBe(countMatches(input, '</b>'));
    expect(countMatches(input, '<i>')).toBe(countMatches(input, '</i>'));
  });

  it('UnclosedTagHandling_ProperlyClosedTags_NoChange', () => {
    let input = '<b>bold</b>';
    const original = input;
    while (countMatches(input, '<b>') > countMatches(input, '</b>')) input += '</b>';
    expect(input).toBe(original);
  });

  it('UnclosedTagHandling_MoreClosingThanOpening_NoChange', () => {
    let input = 'text</b></b>';
    const original = input;
    while (countMatches(input, '<b>') > countMatches(input, '</b>')) input += '</b>';
    // loop doesn't run because opening count is not greater
    expect(input).toBe(original);
  });

  // Recursive Limit Tests (RECURSIVE_LIMIT = 20)

  it('RecursiveLimit_ConstantValue_IsTwenty', () => {
    // This tests our understanding of the recursive limit
    const expectedLimit = 20;
    expect(expectedLimit).toBe(20);
  });

  it('RecursiveCountLogic_IncrementsProperly', () => {
    let recursiveCount = 0;
    const recursiveLimit = 20;
    for (let i = 0; i < 5; i++) recursiveCount++;
    expect(recursiveCount).toBe(5);
    expect(recursiveCount < recursiveLimit).toBe(true);
  });

  it('RecursiveCountLogic_StopsAtLimit', () => {
    let recursiveCount = 0;
    const recursiveLimit = 20;
    let iterations = 0;
    while (recursiveCount < recursiveLimit) {
      recursiveCount++;
      iterations++;
      if (iterations > 100) break; // safety
    }
    expect(recursiveCount).toBe(recursiveLimit);
    expect(iterations).toBe(recursiveLimit);
  });

  // DictQuery Element Parsing Tests

  it('DictQueryParsing_SimpleKey_NoColons', () => {
    const elements = parseElements('SIMPLE_KEY');
    expect(elements.length).toBe(1);
    expect(elements[0]).toBe('SIMPLE_KEY');
  });

  it('DictQueryParsing_KeyWithOneParameter_TwoElements', () => {
    // FORMAT: KEY:{param1}:value1
    const elements = parseElements('MESSAGE_KEY:{A}:Hero');
    expect(elements.length).toBe(3);
    expect(elements[0]).toBe('MESSAGE_KEY');
    expect(elements[1]).toBe('{A}');
    expect(elements[2]).toBe('Hero');
  });

  it('DictQueryParsing_KeyWithTwoParameters_FiveElements', () => {
    // FORMAT: KEY:{param1}:value1:{param2}:value2
    const elements = parseElements('A_GOES_B_MESSAGE:{A}:Peter:{B}:Dining Room');
    expect(elements).toEqual(['A_GOES_B_MESSAGE', '{A}', 'Peter', '{B}', 'Dining Room']);
  });

  it('DictQueryParsing_NestedBrackets_ColonInsideIgnored', () => {
    // colon inside brackets should not be treated as separator
    const elements = parseElements('KEY:{nested:value}:replacement');
    expect(elements).toEqual(['KEY', '{nested:value}', 'replacement']);
  });

  it('DictQueryParsing_EmptyInput_SingleEmptyElement', () => {
    const elements = parseElements('');
    expect(elements.length).toBe(1);
    expect(elements[0]).toBe('');
  });

  // Parameter Replacement Tests

  it('ParameterReplacement_SingleParameter_Replaced', () => {
    expect(replaceParameters('{A} goes to the store', ['KEY', '{A}', 'Peter'])).toBe('Peter goes to the store');
  });

  it('ParameterReplacement_TwoParameters_BothReplaced', () => {
    expect(replaceParameters('{A} goes to {B}', ['KEY', '{A}', 'Peter', '{B}', 'the store'])).toBe('Peter goes to the store');
  });

  it('ParameterReplacement_MultipleOccurrences_AllReplaced', () => {
    expect(replaceParameters('{A} met {A} at the {B}', ['KEY', '{A}', 'John', '{B}', 'park'])).toBe('John met John at the park');
  });

  it('ParameterReplacement_NoMatchingPlaceholder_NoChange', () => {
    expect(replaceParameters('No placeholders here', ['KEY', '{A}', 'Value'])).toBe('No placeholders here');
  });

  // DictLookup and StringKey Tests

  it('DictLookup_NumericParameter_ReplacesCorrectly', () => {
    const dict = new DictionaryI18n();
    dict.addEntry('KEY', 'Value: {0}', 'English');
    LocalizationRead.dicts.set('val', dict);

    // This mirrors the fix: passing int directly to StringKey constructor
    const sk = new StringKey('val', 'KEY', 5);
    expect(LocalizationRead.dictLookup(sk)).toBe('Value: 5');
  });

  it('DictLookup_StringParameter_ReplacedCorrectly', () => {
    const dict = new DictionaryI18n();
    dict.addEntry('KEY_S', 'Hello {0}', 'English');
    LocalizationRead.dicts.set('val', dict);

    const sk = new StringKey('val', 'KEY_S', 'World');
    expect(LocalizationRead.dictLookup(sk)).toBe('Hello World');
  });

  it('DictLookup_MultipleParameters_ReplacedCorrectly', () => {
    const dict = new DictionaryI18n();
    dict.addEntry('KEY_M', '{0} met {1}', 'English');
    LocalizationRead.dicts.set('val', dict);

    // We construct parameters manually: "{0}:Alice:{1}:Bob", passing "Alice:{1}:Bob"
    // because the constructor prepends "{0}:"
    const sk = new StringKey('val', 'KEY_M', 'Alice:{1}:Bob');
    expect(LocalizationRead.dictLookup(sk)).toBe('Alice met Bob');
  });

  it('DictLookup_IncorrectParameterFormat_FailsToReplace', () => {
    const dict = new DictionaryI18n();
    dict.addEntry('KEY_ERR', 'Count: {0}', 'English');
    LocalizationRead.dicts.set('val', dict);

    // The StringKey constructor adds "{0}:", so we get "{0}:{0}:5" in the parameters string
    // DictQuery parses elements: KEY_ERR, {0}, {0}, 5
    // It replaces "{0}" with "{0}", leaving the string unchanged.
    const sk = new StringKey('val', 'KEY_ERR', '{0}:' + 5);
    expect(LocalizationRead.dictLookup(sk)).toBe('Count: {0}');
  });
});
