// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/StringKey.cs
// The six C# constructors become one, dispatched on its arguments as C# overload resolution would.
import { listGet, split } from '../platform/CSharp.ts';
import { LocalizationRead } from './LocalizationRead.ts';

/** Represents a string corresponding to a Localization string key. */
// Valkyrie: StringKey.cs StringKey
export class StringKey {
  /** Empty string Key */
  static NULL: StringKey;

  private _dict: string | null = null;

  readonly key: string;

  private parameters: string | null = null;

  private preventLookup = false;

  /** StringKey(string unknownKey) */
  constructor(unknownKey: string | null);
  /** StringKey(string newDict, string newKey, bool doLookup = true) */
  constructor(newDict: string | null, newKey: string, doLookup?: boolean);
  /** StringKey(string newDict, string newKey, StringKey numberZeroKeyParam) */
  constructor(newDict: string | null, newKey: string, numberZeroKeyParam: StringKey);
  /** StringKey(string newDict, string newKey, string numberZeroParam) */
  constructor(newDict: string | null, newKey: string, numberZeroParam: string);
  /** StringKey(string newDict, string newKey, int numberZeroNumParam) */
  constructor(newDict: string | null, newKey: string, numberZeroNumParam: number);
  /** StringKey(StringKey templateStringKey, string param1, string param2) */
  constructor(templateStringKey: StringKey, param1: string, param2: string);
  // Valkyrie: StringKey.cs StringKey constructors
  constructor(a: string | null | StringKey, b?: string, c?: boolean | StringKey | string | number) {
    if (a instanceof StringKey) {
      this._dict = a.dict;
      this.key = a.key;
      this.parameters = b + ':' + (c as string);
      return;
    }
    if (b === undefined) {
      // StringKey(string unknownKey)
      const unknownKey = a as string;
      let matchSuccess = false;
      try {
        matchSuccess = unknownKey !== null && LocalizationRead.lookupRegex().test(unknownKey);
      } catch {
        matchSuccess = false;
      }

      if (matchSuccess && unknownKey.startsWith('{') && unknownKey.endsWith('}') && unknownKey.indexOf('}') === unknownKey.length - 1) {
        const parts = split(unknownKey.substring(1, unknownKey.length - 1), [':'], 3, true);

        this._dict = listGet(parts, 0);
        this.key = listGet(parts, 1);
        if (parts.length === 3) {
          this.parameters = parts[2]!;
        }
        this.preventLookup = false;
      } else {
        this._dict = null;
        this.key = unknownKey;
        this.preventLookup = !matchSuccess;
      }
      return;
    }
    this._dict = a;
    this.key = b;
    if (c === undefined || typeof c === 'boolean') {
      this.preventLookup = !(c ?? true);
    } else if (c instanceof StringKey) {
      this.parameters = '{0}:' + c.fullKey;
    } else {
      // int.ToString() for the int overload
      this.parameters = '{0}:' + String(c);
    }
  }

  /** Complete key. IE: {qst:MONSTER_NAME} */
  get fullKey(): string {
    if (this.dict === null) {
      return this.key;
    }
    let result = '{' + this.dict + ':' + this.key;
    if (this.parameters !== null) {
      result += ':' + this.parameters;
    }
    return result + '}';
  }

  get dict(): string | null {
    return this._dict;
  }

  /** Check if the StringKey object is a localization key */
  // Valkyrie: StringKey.cs StringKey.isKey
  isKey(): boolean {
    return this.dict !== null;
  }

  /** Search in current dictionary the text translated to the current language. If emptyIfNotFound, return "" on a missing key. */
  // Valkyrie: StringKey.cs StringKey.Translate
  translate(emptyIfNotFound = false): string {
    if (!this.preventLookup) {
      if (emptyIfNotFound && this.isKey() && !this.keyExists()) return '';
      return LocalizationRead.dictLookup(this);
    } else {
      if (this.fullKey !== null) {
        //non heys can have newline characters
        return this.fullKey.split('\\n').join('\n');
      } else {
        return null as unknown as string;
      }
    }
  }

  // Valkyrie: StringKey.cs StringKey.KeyExists
  keyExists(): boolean {
    if (this.isKey() && !this.preventLookup) {
      return LocalizationRead.checkLookup(this);
    }
    return false;
  }

  /** toString returns the key */
  // Valkyrie: StringKey.cs StringKey.ToString
  toString(): string {
    return this.fullKey.split('\n').join('\\n');
  }
}

StringKey.NULL = new StringKey(null, '', false);
