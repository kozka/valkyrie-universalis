// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/DictionaryI18n.cs
import { Game } from '../Game.ts';
import { dictAdd, isNullOrEmpty, isNullOrWhiteSpace, listGet, replace, split, trim, trimEnd } from '../platform/CSharp.ts';
import { netAdd, netRemove, netSet } from '../platform/NetDictionary.ts';
import { File, IOException } from '../platform/SystemIO.ts';
import { ValkyrieConstants } from '../ValkyrieConstants.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';

const COMMA = ',';
const DOUBLE_QUOTE = '"';
const TRIPLE_ENCLOSING = '|||';

/** Class to define a dictionary of KEYS, Strings in all available languages */
// Valkyrie: DictionaryI18n.cs DictionaryI18n
export class DictionaryI18n {
  private keyToGroup = new Map<string, string>();
  private groupToLanguage = new Map<string, string>();
  private requiredLanguages = new Set<string>([ValkyrieConstants.DefaultLanguage]);

  // Each language has it's own dictionary
  private data: Map<string, Map<string, string>>;

  // And each language has it's own raw data
  private rawData: Map<string, string[]>;

  // must be loaded to Dictionaries and not raw for edit
  protected loadedForEdit = false;
  private _defaultLanguage: string = ValkyrieConstants.DefaultLanguage;
  private _currentLanguage: string = ValkyrieConstants.DefaultLanguage;
  private _fallbackLanguage = '';

  /** DictionaryI18n() */
  constructor();
  /** DictionaryI18n(string newDefaultLanguage): Valkyrie ignores the language here. */
  constructor(newDefaultLanguage: string);
  /** DictionaryI18n(string[] languageData) */
  constructor(languageData: string[]);
  /** DictionaryI18n(string[] languageData, string newDefaultLanguage) */
  constructor(languageData: string[], newDefaultLanguage: string);
  // Valkyrie: DictionaryI18n.cs DictionaryI18n constructors
  constructor(languageData?: string[] | string, newDefaultLanguage?: string) {
    this.data = new Map();
    this.rawData = new Map();
    if (Array.isArray(languageData) && newDefaultLanguage !== undefined) {
      this.defaultLanguage = newDefaultLanguage;
    }
    this.initCurrentLanguage();
    if (Array.isArray(languageData)) {
      this.addData(languageData);
    }
  }

  /** Default initial language is English */
  get defaultLanguage(): string {
    return this._defaultLanguage;
  }

  set defaultLanguage(value: string) {
    this.addRequiredLanguage(value);
    this._defaultLanguage = value;
  }

  get currentLanguage(): string {
    return this._currentLanguage;
  }

  set currentLanguage(value: string) {
    this.addRequiredLanguage(value);
    this._currentLanguage = value;
  }

  get fallbackLanguage(): string {
    return this._fallbackLanguage;
  }

  set fallbackLanguage(value: string) {
    if (!isNullOrEmpty(value)) this.addRequiredLanguage(value);
    this._fallbackLanguage = value;
  }

  // Valkyrie: DictionaryI18n.cs DictionaryI18n.InitCurrentLanguage
  private initCurrentLanguage(): void {
    if (Game.get() != null) {
      this.currentLanguage = Game.get().currentLang;
      this.fallbackLanguage = Game.get().fallbackLang ?? '';
    } else {
      this.currentLanguage = 'English';
      this.fallbackLanguage = '';
    }
  }

  /** Add language data to dictionary from file path. */
  // Valkyrie: DictionaryI18n.cs DictionaryI18n.AddDataFromFile
  addDataFromFile(file: string): void {
    let lines: string[];
    let text: string;

    // Read the whole file
    try {
      text = File.readAllText(file);
      if (text.includes('\r')) {
        lines = text.split('\r');
      } else {
        lines = text.split('\n');
      }
      this.addData(lines);
    } catch (e) {
      if (!(e instanceof IOException)) throw e;
      ValkyrieDebug.log('Error loading localization file ' + file + ':' + e.message);
    }
  }

  /** Add language data to dictionary, or merge another DictionaryI18n's raw data (for packs sharing a namespace). */
  addData(languageData: string[]): void;
  addData(other: DictionaryI18n | null): void;
  // Valkyrie: DictionaryI18n.cs DictionaryI18n.AddData
  addData(languageData: string[] | DictionaryI18n | null): void {
    if (!Array.isArray(languageData)) {
      this.addDataFromDictionary(languageData);
      return;
    }
    const rawDataToAdd: string[] = [];

    let currentEntry: string[] = [];
    let endOfLine = false;
    let tripleQuoteMode = false;
    // Remove extra new lines
    for (const rawLine of languageData) {
      const rawLineTrimmed = trim(rawLine, '\r', '\n');
      const sections = rawLineTrimmed.split('"').length;
      const isFirstLine = currentEntry.length === 0;
      currentEntry.push(rawLineTrimmed);

      // Contains triple quotes
      const startsNewLineWithTripleQuotes = isFirstLine && rawLineTrimmed.indexOf(`,${TRIPLE_ENCLOSING}`) !== -1;
      if (startsNewLineWithTripleQuotes || tripleQuoteMode) {
        tripleQuoteMode = !trimEnd(rawLineTrimmed).endsWith(TRIPLE_ENCLOSING);
        endOfLine = !tripleQuoteMode;
      }
      // Even number of " characters, self contained line
      // Or middle of quote block
      else if (sections % 2 === 1) {
        // If first line - end the line (single line)
        // Otherwise it's the middle of the block
        endOfLine = isFirstLine && !tripleQuoteMode;
      }
      // Odd number of quotes *should* mean start or end of multi line block
      else if (!isFirstLine || DictionaryI18n.isOldFormat(rawLineTrimmed)) {
        // Single line or does not have triple quotes
        endOfLine = !tripleQuoteMode;
      }

      if (endOfLine) {
        const combinedValue = currentEntry.join('\n');
        rawDataToAdd.push(combinedValue);

        currentEntry = [];
        endOfLine = false;
        tripleQuoteMode = false;
      }
    }

    if (currentEntry.length > 0) {
      const combinedValue = currentEntry.join('\\n');
      ValkyrieDebug.log('Failed to parse language data properly, remaining values: ' + combinedValue);
      rawDataToAdd.push(combinedValue);
    }

    const newLanguage = trim(listGet(split(listGet(languageData, 0), COMMA), 1), '"');

    let languageRaw = this.rawData.get(newLanguage);
    if (!languageRaw) {
      languageRaw = [];
      this.rawData.set(newLanguage, languageRaw);
    }
    languageRaw.push(...rawDataToAdd);
  }

  // Valkyrie: DictionaryI18n.cs DictionaryI18n.AddData(DictionaryI18n)
  private addDataFromDictionary(other: DictionaryI18n | null): void {
    if (other === null || other === undefined || other.rawData === null) return;

    // Loop over every language in the other dictionary's rawData
    for (const [language, lines] of other.rawData) {
      let languageRaw = this.rawData.get(language);
      if (!languageRaw) {
        languageRaw = [];
        this.rawData.set(language, languageRaw);
      }
      languageRaw.push(...lines);
    }
  }

  // Valkyrie: DictionaryI18n.cs DictionaryI18n.isOldFormat
  private static isOldFormat(rawLine: string): boolean {
    const components = split(rawLine, [','], 2);
    // Text starts with ", it is a normal multi line block
    const isNotOldFormat = components.length > 1 && components[1]!.length > 0 && components[1]![0] === '"';
    return !isNotOldFormat;
  }

  /** Loads all raw data into Dictionaries. Must be called before any edits are made. */
  // Valkyrie: DictionaryI18n.cs DictionaryI18n.MakeEditable
  protected makeEditable(): void {
    // Already loaded
    if (this.loadedForEdit) return;

    this.forceLoadAllLanguages();

    // Remove all existing entries (helps maintain order)
    this.data = new Map();

    // For all languages
    for (const [language, lines] of this.rawData) {
      // Create a Dictionary for each language
      const languageData = new Map<string, string>();
      dictAdd(this.data, language, languageData);
      // Check each line
      for (let i = 1; i < lines.length; i++) {
        // Ignore comments
        if (trim(lines[i]!).indexOf('//') === 0) continue;

        // Split out key
        const components = split(lines[i]!, [','], 2);
        if (components.length !== 2) continue;

        // Only store the first occurance of a key
        if (!languageData.has(components[0]!)) {
          languageData.set(components[0]!, this.parseEntry(components[1]!));
        }
      }
    }
    this.loadedForEdit = true;
  }

  /** Add an entry to a language (the current one by default), replace if exists */
  // Valkyrie: DictionaryI18n.cs DictionaryI18n.AddEntry
  addEntry(key: string, value: string, language: string = this.currentLanguage): void {
    this.makeEditable();

    // Create language Dictionary if missing
    let languageData = this.data.get(language);
    if (!languageData) {
      languageData = new Map();
      this.data.set(language, languageData);
    }

    netSet(languageData, key, value);
  }

  /** Remove an entry from all languages */
  // Valkyrie: DictionaryI18n.cs DictionaryI18n.Remove
  remove(key: string): void {
    this.makeEditable();
    for (const languageData of this.data.values()) {
      netRemove(languageData, key);
    }
  }

  /**
   * Not in Valkyrie, whose Remove takes an entry from every language: takes it from one only. A language left with no
   * entry is not written any more, but for the default one, which Valkyrie needs.
   */
  removeEntry(key: string, language: string): void {
    this.makeEditable();
    const languageData = this.data.get(language);
    if (languageData === undefined) return;
    netRemove(languageData, key);
    if (languageData.size === 0 && language !== this.defaultLanguage) this.data.delete(language);
  }

  /** Remove all entries starting with prefix from all languages */
  // Valkyrie: DictionaryI18n.cs DictionaryI18n.RemoveKeyPrefix
  removeKeyPrefix(prefix: string): void {
    this.makeEditable();

    for (const languageData of this.data.values()) {
      // Build list of keys to remove
      const toRemove: string[] = [];
      for (const key of languageData.keys()) {
        if (key.indexOf(prefix) === 0) {
          toRemove.push(key);
        }
      }

      // Remove all keys
      for (const key of toRemove) {
        netRemove(languageData, key);
      }
    }
  }

  /** Rename key for all entries starting with prefix from all languages */
  // Valkyrie: DictionaryI18n.cs DictionaryI18n.RenamePrefix
  renamePrefix(oldPrefix: string, newPrefix: string): void {
    this.makeEditable();

    for (const languageData of this.data.values()) {
      // Build list of keys to rename
      const toRename = new Map<string, string>();
      for (const key of languageData.keys()) {
        if (key.indexOf(oldPrefix) === 0) {
          dictAdd(toRename, key, newPrefix + key.substring(oldPrefix.length));
        }
      }

      // Replace with new key name
      for (const [oldKey, newKey] of toRename) {
        netAdd(languageData, newKey, languageData.get(oldKey)!);
        netRemove(languageData, oldKey);
      }
    }
  }

  /**
   * Not in Valkyrie: every entry of every language as MakeEditable loads them (the first occurrence of a key wins,
   * comments left out), without making the data editable, for the editor's table of texts.
   */
  allEntries(): Map<string, Map<string, string>> {
    if (this.loadedForEdit) return new Map([...this.data].map(([language, entries]) => [language, new Map(entries)]));
    const all = new Map<string, Map<string, string>>();
    for (const [language, lines] of this.rawData) {
      const languageData = new Map<string, string>();
      all.set(language, languageData);
      for (let i = 1; i < lines.length; i++) {
        if (trim(lines[i]!).indexOf('//') === 0) continue;
        const components = split(lines[i]!, [','], 2);
        if (components.length !== 2) continue;
        if (!languageData.has(components[0]!)) languageData.set(components[0]!, this.parseEntry(components[1]!));
      }
    }
    return all;
  }

  /** Not in Valkyrie: replaces a text in every value of every language, keeping each key in its place. */
  replaceInValues(oldText: string, newText: string): void {
    this.makeEditable();
    for (const languageData of this.data.values()) {
      for (const [key, value] of languageData) {
        if (value.includes(oldText)) languageData.set(key, replace(value, oldText, newText));
      }
    }
  }

  /** Not in Valkyrie: whether a key of any language starts with the prefix; like RenamePrefix, it makes the data editable. */
  hasKeyWithPrefix(prefix: string): boolean {
    this.makeEditable();
    for (const languageData of this.data.values()) {
      for (const key of languageData.keys()) {
        if (key.indexOf(prefix) === 0) return true;
      }
    }
    return false;
  }

  /** Check if a key exists in any language, also ensures all matching values are loaded into Dictionary objects */
  // Valkyrie: DictionaryI18n.cs DictionaryI18n.KeyExists
  keyExists(key: string): boolean {
    // Check loaded Dictionary data
    for (const language of this.requiredLanguages) {
      if (this.data.get(language)?.has(key)) {
        return true;
      }
    }

    // If in edit mode don't check raw data, may be outdated
    if (this.loadedForEdit) return false;

    // Check raw data
    let found = false;
    // Check all languages
    for (const [language, lines] of this.rawData) {
      // skip languages that are not used
      if (!this.requiredLanguages.has(language)) continue;

      found = this.lookInOneLanguage(language, lines, key) || found;
    }

    if (!found) ValkyrieDebug.log('Key not found: ' + key);

    return found;
  }

  /** Check if a key exists in one language and load it */
  // Valkyrie: DictionaryI18n.cs DictionaryI18n.LookInOneLanguage
  private lookInOneLanguage(language: string, lines: string[], key: string): boolean {
    // Add this language to Dictionary data
    let languageData = this.data.get(language);
    if (!languageData) {
      languageData = new Map();
      this.data.set(language, languageData);
    }

    if (languageData.has(key)) {
      ValkyrieDebug.log('Duplicate Key in ' + language + ' Dictionary: ' + key);
      return true;
    }

    const keySearched = key + ',';
    for (const raw of lines) {
      if (raw.startsWith(keySearched)) {
        const parsedRaw = this.parseEntry(raw.substring(key.length + 1));

        // If already present log warning
        dictAdd(languageData, key, parsedRaw);

        // stop searching here, won't find duplicate
        return true;
      }
    }

    return false;
  }

  /** Get the value for a key. First check current language, then fallback, then default, then any. Returns key if not found. */
  // Valkyrie: DictionaryI18n.cs DictionaryI18n.GetValue
  getValue(key: string): string {
    // KeyExists ensures any matches are loaded to Dictionary data
    if (!this.keyExists(key)) return key;

    let additionalLanguage: string | undefined;
    if (this.groupToLanguage.size > 0) {
      const group = this.keyToGroup.get(key);
      if (group !== undefined) {
        additionalLanguage = this.groupToLanguage.get(group);
      }
    }

    let secondLanguageValue: string | null = null;
    if (additionalLanguage !== undefined && this.data.has(additionalLanguage)) {
      const value = this.data.get(additionalLanguage)!.get(key);
      if (value !== undefined) {
        secondLanguageValue = value.length === 0 ? null : value;
      }
    }

    // Check current language first
    const currentLanguageValue = this.data.get(this.currentLanguage)?.get(key);
    if (currentLanguageValue !== undefined && !isNullOrWhiteSpace(currentLanguageValue)) {
      return this.combine(currentLanguageValue, secondLanguageValue);
    }

    // Then check user-configured fallback language
    if (!isNullOrEmpty(this.fallbackLanguage) && this.fallbackLanguage !== this.currentLanguage) {
      const fallbackLanguageValue = this.data.get(this.fallbackLanguage)?.get(key);
      if (fallbackLanguageValue !== undefined && !isNullOrWhiteSpace(fallbackLanguageValue)) {
        return this.combine(fallbackLanguageValue, secondLanguageValue);
      }
    }

    // Then check default language
    const defaultLanguageValue = this.data.get(this.defaultLanguage)?.get(key);
    if (defaultLanguageValue !== undefined && !isNullOrWhiteSpace(defaultLanguageValue)) {
      return this.combine(defaultLanguageValue, secondLanguageValue);
    }

    // Not in current or default, find any match
    for (const languageData of this.data.values()) {
      const languageValue = languageData.get(key);
      if (languageValue !== undefined) {
        return this.combine(languageValue, secondLanguageValue);
      }
    }
    // Should never happen
    return '';
  }

  // Valkyrie: DictionaryI18n.cs DictionaryI18n.Combine
  private combine(mainLanguageValue: string, secondLanguageValue: string | null): string {
    if (secondLanguageValue === null || secondLanguageValue === mainLanguageValue) {
      return mainLanguageValue;
    }
    return `${mainLanguageValue} [${secondLanguageValue}]`;
  }

  /** Get the raw language data for this dictionary */
  // Valkyrie: DictionaryI18n.cs DictionaryI18n.SerializeMultiple
  serializeMultiple(): Map<string, string[]> {
    // If we haven't edited can return what we were given
    if (!this.loadedForEdit) return this.rawData;

    // If we have edited we can replace the rawData
    this.rawData = new Map();
    for (const [language, entries] of this.data) {
      const lines = ['.,' + language];
      dictAdd(this.rawData, language, lines);
      for (const [entryKey, entryValue] of entries) {
        const rawValue = entryValue.split('\r\n').join('\n').split('\r').join('\n').split('\n').join('\\n');
        if (rawValue.includes(DOUBLE_QUOTE) && !rawValue.includes(TRIPLE_ENCLOSING)) {
          lines.push(entryKey + ',' + TRIPLE_ENCLOSING + rawValue + TRIPLE_ENCLOSING);
        } else if (rawValue.includes(DOUBLE_QUOTE) || rawValue.includes(TRIPLE_ENCLOSING) || rawValue.includes('\\n')) {
          const quotedLine = DOUBLE_QUOTE + rawValue.split(DOUBLE_QUOTE).join('""') + DOUBLE_QUOTE;
          lines.push(entryKey + ',' + quotedLine);
        } else {
          lines.push(entryKey + ',' + rawValue);
        }
      }
    }

    return this.rawData;
  }

  /** Parse raw value entry: newlines and quotes handled */
  // Valkyrie: DictionaryI18n.cs DictionaryI18n.ParseEntry
  protected parseEntry(entry: string): string {
    let parsedReturn = entry.split('\\n').join('\n');
    // If entry is in triple quotes
    if (
      parsedReturn.length >= TRIPLE_ENCLOSING.length * 2 &&
      parsedReturn.startsWith(TRIPLE_ENCLOSING) &&
      trim(parsedReturn).endsWith(TRIPLE_ENCLOSING)
    ) {
      parsedReturn = parsedReturn.substring(TRIPLE_ENCLOSING.length, parsedReturn.length - TRIPLE_ENCLOSING.length);
    }
    // If entry is in quotes
    if (parsedReturn.length > 1 && parsedReturn[0] === '"' && parsedReturn[parsedReturn.length - 1] === '"') {
      // Trim leading and trailing quotes
      parsedReturn = parsedReturn.substring(1, parsedReturn.length - 1);
      // Handle escaped quotes
      parsedReturn = parsedReturn.split('""').join(DOUBLE_QUOTE);
    }
    return parsedReturn;
  }

  /** Get matches to a key for all languages */
  // Valkyrie: DictionaryI18n.cs DictionaryI18n.ExtractAllMatches
  extractAllMatches(key: string): Map<string, string> {
    this.forceLoadAllLanguages();

    // Load into data
    this.keyExists(key);

    const returnData = new Map<string, string>();
    for (const [language, languageData] of this.data) {
      const value = languageData.get(key);
      if (value !== undefined) {
        returnData.set(language, value);
      }
    }
    return returnData;
  }

  /** Get list of languages */
  // Valkyrie: DictionaryI18n.cs DictionaryI18n.GetLanguagesList
  getLanguagesList(): string[] {
    return [...this.rawData.keys()];
  }

  // Valkyrie: DictionaryI18n.cs DictionaryI18n.SetKeyToGroup
  setKeyToGroup(key: string, groupId: string): void {
    this.keyToGroup.set(key, groupId);
  }

  // Valkyrie: DictionaryI18n.cs DictionaryI18n.SetGroupTranslationLanguage
  setGroupTranslationLanguage(groupId: string, language: string | null): void {
    if (isNullOrWhiteSpace(language)) {
      this.groupToLanguage.delete(groupId);
      return;
    }

    this.groupToLanguage.set(groupId, language!);
    this.addRequiredLanguage(language!);
  }

  // Valkyrie: DictionaryI18n.cs DictionaryI18n.ForceLoadAllLanguages
  protected forceLoadAllLanguages(): void {
    this.getLanguagesList().forEach((language) => this.addRequiredLanguage(language));
  }

  // Valkyrie: DictionaryI18n.cs DictionaryI18n.AddRequiredLanguage
  addRequiredLanguage(value: string): void {
    if (!this.requiredLanguages.has(value)) {
      this.requiredLanguages.add(value);
      // reset loaded data - this won't happen when the data is editable as all languages are already loaded
      // Not in Valkyrie: it does for a language the scenario lacks, and the data then holds the edits (Valkyrie's
      // editor never meets one, as its language changes only in the options; Universalis' editor changes it)
      if (!this.loadedForEdit) this.data = new Map();
    }
  }
}
