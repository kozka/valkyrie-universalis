// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/LocalizationRead.cs
import { charAt } from '../platform/CSharp.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import type { DictionaryI18n } from './DictionaryI18n.ts';
import type { StringKey } from './StringKey.ts';

const RECURSIVE_LIMIT = 20;

const regexCache = new Map<string, RegExp>();

function countMatches(s: string, token: string): number {
  return s.split(token).length - 1;
}

/** Splits "KEY:{A}:x:{B}:y" at the colons that are outside braces. */
function splitElements(input: string): string[] {
  let bracketLevel = 0;
  let lastSection = 0;
  const elements: string[] = [];

  // Separate the input into sections
  for (let index = 0; index < input.length; index++) {
    if (input[index] === '{') {
      bracketLevel++;
    }
    if (input[index] === '}') {
      bracketLevel--;
    }
    // Section divider
    if (input[index] === ':') {
      // Not in brackets
      if (bracketLevel === 0) {
        // Add previous element
        elements.push(input.substring(lastSection, index));
        lastSection = index + 1;
      }
    }
  }
  // Add previous element
  elements.push(input.substring(lastSection));
  return elements;
}

// Helper class to read a localization file into a nested dictionary
// Valkyrie: LocalizationRead.cs LocalizationRead
export class LocalizationRead {
  static dicts = new Map<string, DictionaryI18n | null>();

  /** Change all dictionary languages */
  // Valkyrie: LocalizationRead.cs LocalizationRead.ChangeCurrentLangTo
  static changeCurrentLangTo(newLang: string): void {
    for (const d of LocalizationRead.dicts.values()) {
      d!.currentLanguage = newLang;
    }
  }

  /** Add language that needs to be loaded */
  // Valkyrie: LocalizationRead.cs LocalizationRead.AddRequiredLanguage
  static addRequiredLanguage(newLang: string): void {
    for (const d of LocalizationRead.dicts.values()) {
      d!.addRequiredLanguage(newLang);
    }
  }

  /** Replaces a FFG key with his current text. {ffg:XXXX} like input, returns translation to current language. */
  // Valkyrie: LocalizationRead.cs LocalizationRead.DictLookup
  static dictLookup(input: StringKey): string {
    let output = input.fullKey;
    // While there are more lookups

    // Count the number of replaces. One lookup should not replace more than RECURSIVE_LIMIT elements.
    let recursiveCount = 0;

    const lookupRegexKey = LocalizationRead.lookupRegex();
    let matchResult = lookupRegexKey.exec(output);

    while (matchResult !== null && recursiveCount < RECURSIVE_LIMIT) {
      const pos = matchResult.index;
      // Can be nested
      let bracketLevel = 1;
      // Start of lookup
      // ffg val and qst has the same length
      const lookupStart = pos + '{ffg:'.length;

      // Loop to find end of lookup
      let lookupEnd = lookupStart;
      while (bracketLevel > 0) {
        lookupEnd++;
        if (charAt(output, lookupEnd) === '{') {
          bracketLevel++;
        }
        if (charAt(output, lookupEnd) === '}') {
          bracketLevel--;
        }
      }

      // Extract lookup key
      const lookup = output.substring(lookupStart, lookupEnd);

      // dict
      const dict = output.substring(pos + 1, pos + 4);

      // Get key result
      let result = LocalizationRead.dictQuery(dict, lookup);

      // We (unity) don't support underlines
      // Unity uses <> not []
      result = result.split('[u]').join('<b>').split('[/u]').join('</b>');
      result = result.split('[i]').join('<i>').split('[/i]').join('</i>');
      result = result.split('[b]').join('<b>').split('[/b]').join('</b>');

      // Some FFG text doesn't close b/i like it should
      while (countMatches(result, '<b>') > countMatches(result, '</b>')) {
        result += '</b>';
      }
      while (countMatches(result, '<i>') > countMatches(result, '</i>')) {
        result += '</i>';
      }

      // Replace the lookup
      output = output.split('{' + dict + ':' + lookup + '}').join(result);
      // Increase the recursive count
      recursiveCount++;

      matchResult = lookupRegexKey.exec(output);
    }

    if (recursiveCount === RECURSIVE_LIMIT) {
      ValkyrieDebug.log('ERROR Recursive loop limit reached translating ' + input.fullKey + '. Dictionary entry must be fixed.');
    }

    return output;
  }

  // Valkyrie: LocalizationRead.cs LocalizationRead.CheckLookup
  static checkLookup(input: StringKey): boolean {
    const output = input.fullKey;
    // While there are more lookups

    const match = LocalizationRead.lookupRegex().exec(output);
    if (match === null) return false;

    const pos = match.index;
    // Can be nested
    let bracketLevel = 1;
    // Start of lookup
    // ffg val and qst has the same length
    const lookupStart = pos + '{ffg:'.length;

    // Loop to find end of lookup
    let lookupEnd = lookupStart;
    while (bracketLevel > 0) {
      lookupEnd++;
      if (charAt(output, lookupEnd) === '{') {
        bracketLevel++;
      }
      if (charAt(output, lookupEnd) === '}') {
        bracketLevel--;
      }
    }

    // Extract lookup key
    const lookup = output.substring(lookupStart, lookupEnd);

    // dict
    const dict = output.substring(pos + 1, pos + 4);

    // Get key result
    return LocalizationRead.checkDictQuery(dict, lookup);
  }

  /** Look up a key in the FFG text Localization. Can have parameters divided by ":", e.g. A_GOES_B_MESSAGE:{A}:Peter:{B}:Dinning Room */
  // Valkyrie: LocalizationRead.cs LocalizationRead.DictQuery
  private static dictQuery(dict: string, input: string): string {
    // Fast translation if nothing to transform
    if (input.indexOf('{') === -1) return LocalizationRead.dictKeyLookup(dict, input);

    const elements = splitElements(input);

    // Look up the first element (key)
    let fetched = LocalizationRead.dictKeyLookup(dict, elements[0]!);

    // Find and replace with other elements
    for (let i = 2; i < elements.length; i += 2) {
      // String.Replace throws on an empty old value
      if (elements[i - 1]!.length === 0) throw new RangeError('ArgumentException: String cannot be of zero length.');
      fetched = fetched.split(elements[i - 1]!).join(elements[i]!);
    }
    return fetched;
  }

  // Valkyrie: LocalizationRead.cs LocalizationRead.CheckDictQuery
  private static checkDictQuery(dict: string, input: string): boolean {
    const elements = splitElements(input);

    const currentDict = LocalizationRead.selectDictionary(dict);
    if (currentDict === null) return false;
    return currentDict.keyExists(elements[0]!);
  }

  /** Sets a dictionary entry for key and text. Creates or replaces. */
  // Valkyrie: LocalizationRead.cs LocalizationRead.updateScenarioText
  static updateScenarioText(key: string, text: string): void {
    LocalizationRead.dicts.get('qst')!.addEntry(key, text);
  }

  /** Transform a ffg key (without ffg prefig), into current language text */
  // Valkyrie: LocalizationRead.cs LocalizationRead.DictKeyLookup
  private static dictKeyLookup(dict: string, key: string): string {
    const currentDict = LocalizationRead.selectDictionary(dict);

    if (currentDict === null) {
      ValkyrieDebug.log('Error: current dictionary not loaded');
      return key;
    }
    return currentDict.getValue(key);
  }

  /** dictionary selection from string */
  // Valkyrie: LocalizationRead.cs LocalizationRead.selectDictionary
  static selectDictionary(dict: string | null): DictionaryI18n | null {
    if (dict === null || !LocalizationRead.dicts.has(dict)) return null;

    return LocalizationRead.dicts.get(dict) ?? null;
  }

  /** Add a new dictionary, merges into it if it exists */
  // Valkyrie: LocalizationRead.cs LocalizationRead.AddDictionary
  static addDictionary(name: string, dict: DictionaryI18n | null): void {
    const existing = LocalizationRead.dicts.get(name);
    if (existing) {
      existing.addData(dict);
    } else {
      LocalizationRead.dicts.set(name, dict);
    }
  }

  /** Remove a dictionary */
  // Valkyrie: LocalizationRead.cs LocalizationRead.RemoveDictionary
  static removeDictionary(name: string): void {
    LocalizationRead.dicts.delete(name);
  }

  /** Get a regex pattern to check if is it a valid lookup key */
  // Valkyrie: LocalizationRead.cs LocalizationRead.LookupRegexKey
  static lookupRegexKey(): string {
    if (LocalizationRead.dicts.size === 0) return '(?!)';
    let regexKey = '{(';
    for (const key of LocalizationRead.dicts.keys()) {
      regexKey += key + '|';
    }
    return regexKey.substring(0, regexKey.length - 1) + '):';
  }

  /** LookupRegexKey compiled; .NET reads a lone '{' as a literal, as JS does outside unicode mode. */
  static lookupRegex(): RegExp {
    const pattern = LocalizationRead.lookupRegexKey();
    let regex = regexCache.get(pattern);
    if (!regex) {
      regex = new RegExp(pattern);
      regexCache.set(pattern, regex);
    }
    return regex;
  }

  // Valkyrie: LocalizationRead.cs LocalizationRead.RegisterKeyInGroup
  static registerKeyInGroup(translationKey: StringKey, groupId: string): void {
    LocalizationRead.selectDictionary(translationKey.dict)?.setKeyToGroup(translationKey.key, groupId);
  }

  // Valkyrie: LocalizationRead.cs LocalizationRead.SetGroupTranslationLanguage
  static setGroupTranslationLanguage(groupId: string, language: string): void {
    for (const dictionary of LocalizationRead.dicts.values()) {
      dictionary!.setGroupTranslationLanguage(groupId, language);
    }
  }
}
