// .NET (Mono, as shipped with Unity 2019.4) string and number semantics that ported code relies on.
// Not ported from Valkyrie: these replace the base class library calls that Valkyrie's C# makes.

/** Environment.NewLine on Windows, where Valkyrie's authors write their files. */
export const NewLine = '\r\n';

/** bool.ToString(): "True" or "False". */
export function boolToString(value: boolean): string {
  return value ? 'True' : 'False';
}

/** float.ToString() as .NET Framework and Mono write it: "G" with 7 significant digits, invariant culture. */
export function floatToString(value: number): string {
  if (Number.isNaN(value)) return 'NaN';
  if (value === Number.POSITIVE_INFINITY) return 'Infinity';
  if (value === Number.NEGATIVE_INFINITY) return '-Infinity';
  if (value === 0) return '0';
  const [mantissa, expText] = Math.fround(value).toExponential(6).split('e') as [string, string];
  const exp = Number(expText);
  const negative = mantissa.startsWith('-');
  const digits = mantissa.replace('-', '').replace('.', '');
  let text: string;
  if (exp > -5 && exp < 7) {
    if (exp >= 0) {
      const integer = digits.substring(0, exp + 1).padEnd(exp + 1, '0');
      const fraction = digits.substring(exp + 1).replace(/0+$/, '');
      text = fraction.length > 0 ? integer + '.' + fraction : integer;
    } else {
      text = '0.' + '0'.repeat(-exp - 1) + digits.replace(/0+$/, '');
    }
  } else {
    const fraction = digits.substring(1).replace(/0+$/, '');
    const absExp = Math.abs(exp);
    text = digits[0] + (fraction.length > 0 ? '.' + fraction : '') + 'E' + (exp < 0 ? '-' : '+') + (absExp < 10 ? '0' : '') + absExp;
  }
  return negative ? '-' + text : text;
}

/** DateTime.ToString() with the invariant culture, which Valkyrie runs with: "MM/dd/yyyy HH:mm:ss", local time. */
export function dateTimeToString(date: Date): string {
  const two = (n: number) => String(n).padStart(2, '0');
  return (
    two(date.getMonth() + 1) + '/' + two(date.getDate()) + '/' + String(date.getFullYear()).padStart(4, '0') + ' ' +
    two(date.getHours()) + ':' + two(date.getMinutes()) + ':' + two(date.getSeconds())
  );
}

/** char.IsNumber: Unicode categories Nd, Nl and No. */
export function isNumber(c: string | undefined): boolean {
  return c !== undefined && /^\p{N}/u.test(c);
}

/**
 * Enum.TryParse(value, ignoreCase): a member name, a comma-separated list of names (OR-ed), or an integer
 * (which .NET accepts even when no member has that value). Leading and trailing white space is ignored.
 */
export function enumTryParse<T extends Record<string, number>>(
  enumObject: T,
  value: string | null | undefined,
  ignoreCase: boolean,
): { ok: boolean; value: number } {
  if (value === null || value === undefined) return { ok: false, value: 0 };
  const text = trim(value);
  if (text.length === 0) return { ok: false, value: 0 };
  if (/^[+-]?[0-9]/.test(text)) {
    const parsed = intTryParse(text);
    return parsed.ok ? parsed : { ok: false, value: 0 };
  }
  let result = 0;
  for (const part of text.split(',')) {
    const name = trim(part);
    const key = Object.keys(enumObject).find((k) => (ignoreCase ? k.toUpperCase() === name.toUpperCase() : k === name));
    if (key === undefined) return { ok: false, value: 0 };
    result |= enumObject[key]!;
  }
  return { ok: true, value: result };
}

/** Enum.ToString(): the member name, or the number when no member has that value. */
export function enumToString<T extends Record<string, number>>(enumObject: T, value: number): string {
  return Object.keys(enumObject).find((k) => enumObject[k] === value) ?? String(value);
}

/** .NET char.IsWhiteSpace: categories Zs, Zl and Zp plus U+0009-U+000D, U+0085 and U+00A0. Unlike JS trim, U+FEFF is not white space. */
export function isWhiteSpace(c: string): boolean {
  const code = c.charCodeAt(0);
  if (code <= 0xff) {
    return code === 0x20 || (code >= 0x09 && code <= 0x0d) || code === 0xa0 || code === 0x85;
  }
  return (
    code === 0x1680 ||
    (code >= 0x2000 && code <= 0x200a) ||
    code === 0x2028 ||
    code === 0x2029 ||
    code === 0x202f ||
    code === 0x205f ||
    code === 0x3000
  );
}

/** String.Trim() / Trim(params char[]): with no chars, trims .NET white space; with chars, removes every listed char from both ends. */
export function trim(s: string, ...chars: string[]): string {
  return trimEnd(trimStart(s, ...chars), ...chars);
}

/** String.TrimStart() / TrimStart(params char[]). */
export function trimStart(s: string, ...chars: string[]): string {
  const test = chars.length === 0 ? isWhiteSpace : (c: string) => chars.includes(c);
  let start = 0;
  while (start < s.length && test(s[start]!)) start++;
  return s.substring(start);
}

/** String.TrimEnd() / TrimEnd(params char[]). */
export function trimEnd(s: string, ...chars: string[]): string {
  const test = chars.length === 0 ? isWhiteSpace : (c: string) => chars.includes(c);
  let end = s.length;
  while (end > 0 && test(s[end - 1]!)) end--;
  return s.substring(0, end);
}

/** string.IsNullOrEmpty. */
export function isNullOrEmpty(s: string | null | undefined): s is null | undefined | '' {
  return s === null || s === undefined || s.length === 0;
}

/** string.IsNullOrWhiteSpace. */
export function isNullOrWhiteSpace(s: string | null | undefined): boolean {
  if (s === null || s === undefined) return true;
  for (const c of s) if (!isWhiteSpace(c)) return false;
  return true;
}

/**
 * String.Split with .NET Framework semantics (referencesource String.SplitInternal).
 * `separators` are chars (1-char strings) or strings; null or empty means white space.
 * `count` is the maximum number of parts: the last one keeps the rest of the string, unlike JS split.
 */
export function split(
  s: string,
  separators: readonly string[] | string | null,
  count: number = Number.MAX_SAFE_INTEGER,
  removeEmptyEntries = false,
): string[] {
  if (count < 0) throw new RangeError('Count cannot be less than zero.');
  if (count === 0 || (removeEmptyEntries && s.length === 0)) return [];
  if (count === 1) return [s];

  const seps = typeof separators === 'string' ? [separators] : (separators ?? []).filter((sep) => sep.length > 0);
  const sepList: number[] = [];
  const lengthList: number[] = [];
  if (seps.length === 0) {
    for (let i = 0; i < s.length; i++) {
      if (isWhiteSpace(s[i]!)) {
        sepList.push(i);
        lengthList.push(1);
      }
    }
  } else {
    for (let i = 0; i < s.length; i++) {
      for (const sep of seps) {
        if (s[i] === sep[0] && sep.length <= s.length - i && (sep.length === 1 || s.startsWith(sep, i))) {
          sepList.push(i);
          lengthList.push(sep.length);
          i += sep.length - 1;
          break;
        }
      }
    }
  }
  const numReplaces = sepList.length;
  if (numReplaces === 0) return [s];

  if (removeEmptyEntries) {
    const result: string[] = [];
    let currIndex = 0;
    for (let i = 0; i < numReplaces && currIndex < s.length; i++) {
      if (sepList[i]! - currIndex > 0) result.push(s.substring(currIndex, sepList[i]!));
      currIndex = sepList[i]! + lengthList[i]!;
      if (result.length === count - 1) {
        // If all the remaining entries at the end are empty, skip them
        while (i < numReplaces - 1 && currIndex === sepList[++i]) currIndex += lengthList[i]!;
        break;
      }
    }
    if (currIndex < s.length) result.push(s.substring(currIndex));
    return result;
  }

  const numActualReplaces = Math.min(numReplaces, count - 1);
  const result: string[] = [];
  let currIndex = 0;
  for (let i = 0; i < numActualReplaces && currIndex < s.length; i++) {
    result.push(s.substring(currIndex, sepList[i]!));
    currIndex = sepList[i]! + lengthList[i]!;
  }
  result.push(currIndex < s.length ? s.substring(currIndex) : '');
  return result;
}

/** String.Replace(string, string): ordinal, every occurrence; an empty oldValue throws as in .NET. */
export function replace(s: string, oldValue: string, newValue: string): string {
  if (oldValue.length === 0) throw new RangeError('String cannot be of zero length.');
  return s.split(oldValue).join(newValue);
}

/** String.Substring(start, length) that throws on out-of-range arguments, as .NET does. */
export function substring(s: string, start: number, length?: number): string {
  const len = length ?? s.length - start;
  if (start < 0 || start > s.length || len < 0 || start + len > s.length) {
    throw new RangeError(`Index and length must refer to a location within the string (${start}, ${len}, ${s.length}).`);
  }
  return s.substring(start, start + len);
}

/** String.IndexOf(value, startIndex): a start outside the string throws, as in .NET, instead of being clamped. */
export function indexOf(s: string, value: string, startIndex = 0): number {
  if (startIndex < 0 || startIndex > s.length) {
    throw new RangeError(`ArgumentOutOfRangeException: Index was out of range (${startIndex}, ${s.length}).`);
  }
  return s.indexOf(value, startIndex);
}

/** String.Remove(startIndex, count). */
export function remove(s: string, startIndex: number, count?: number): string {
  if (count === undefined) return substring(s, 0, startIndex);
  substring(s, startIndex, count);
  return s.substring(0, startIndex) + s.substring(startIndex + count);
}

// .NET number parsing treats only these as white space (Number.IsWhite).
function isNumberWhite(c: string): boolean {
  const code = c.charCodeAt(0);
  return code === 0x20 || (code >= 0x09 && code <= 0x0d);
}

function stripNumberWhite(s: string): string | null {
  let start = 0;
  let end = s.length;
  while (start < end && isNumberWhite(s[start]!)) start++;
  // Trailing null chars are accepted (Number.TrailingZeros), then trailing white space.
  while (end > start && s[end - 1] === '\0') end--;
  while (end > start && isNumberWhite(s[end - 1]!)) end--;
  return start < end ? s.substring(start, end) : null;
}

const INT_PATTERN = /^[+-]?[0-9]+$/;

/** int.TryParse(string) with NumberStyles.Integer: returns 0 on failure, as the out parameter would be. */
export function intTryParse(s: string | null | undefined): { ok: boolean; value: number } {
  if (s === null || s === undefined) return { ok: false, value: 0 };
  const body = stripNumberWhite(s);
  if (body === null || !INT_PATTERN.test(body)) return { ok: false, value: 0 };
  const value = Number(body);
  if (!Number.isFinite(value) || value > 2147483647 || value < -2147483648) return { ok: false, value: 0 };
  return { ok: true, value: value === 0 ? 0 : value };
}

/** Convenience for `int.TryParse(s, out x)` when only x matters. */
export function parseIntOrZero(s: string | null | undefined): number {
  return intTryParse(s).value;
}

const FLOAT_PATTERN = /^[+-]?(?:[0-9]+\.?[0-9]*|\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/;
// With AllowThousands, ',' may follow any digit of the integer part ("1,5" reads as 15)
const FLOAT_THOUSANDS_PATTERN = /^[+-]?(?:[0-9][0-9,]*\.?[0-9]*|\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/;

/**
 * float.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture): parses to double and rounds to 32 bits;
 * fails (value 0) on bad syntax or when the result overflows a float, as in .NET Framework.
 * allowThousands gives float.TryParse(s), whose default styles add AllowThousands (Valkyrie runs with the invariant culture).
 */
export function floatTryParse(s: string | null | undefined, allowThousands = false): { ok: boolean; value: number } {
  if (s === null || s === undefined) return { ok: false, value: 0 };
  const body = stripNumberWhite(s);
  if (body !== null && (allowThousands ? FLOAT_THOUSANDS_PATTERN : FLOAT_PATTERN).test(body)) {
    const value = Math.fround(Number(allowThousands ? body.replace(/,/g, '') : body));
    if (Number.isFinite(value)) return { ok: true, value };
    return { ok: false, value: 0 };
  }
  // InvariantCulture symbols, matched after trimming as in Single.TryParse
  const trimmed = trim(s);
  if (trimmed === 'Infinity') return { ok: true, value: Number.POSITIVE_INFINITY };
  if (trimmed === '-Infinity') return { ok: true, value: Number.NEGATIVE_INFINITY };
  if (trimmed === 'NaN') return { ok: true, value: Number.NaN };
  return { ok: false, value: 0 };
}

/** Convenience for `float.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture, out x)` when only x matters. */
export function parseFloatOrZero(s: string | null | undefined): number {
  return floatTryParse(s).value;
}

/** bool.TryParse: "True" or "False" in any letter case, then the same after trimming white space and null chars. */
export function boolTryParse(s: string | null | undefined): { ok: boolean; value: boolean } {
  if (s === null || s === undefined) return { ok: false, value: false };
  for (const candidate of [s, trimWhiteSpaceAndNull(s)]) {
    if (/^true$/i.test(candidate)) return { ok: true, value: true };
    if (/^false$/i.test(candidate)) return { ok: true, value: false };
  }
  return { ok: false, value: false };
}

function trimWhiteSpaceAndNull(s: string): string {
  let start = 0;
  let end = s.length - 1;
  while (start < s.length && (isWhiteSpace(s[start]!) || s[start] === '\0')) start++;
  while (end >= start && (isWhiteSpace(s[end]!) || s[end] === '\0')) end--;
  return s.substring(start, end + 1);
}

/** Dictionary.Add: throws on a duplicate key like .NET does. */
export function dictAdd<K, V>(map: Map<K, V>, key: K, value: V): void {
  if (map.has(key)) throw new Error(`ArgumentException: An item with the same key has already been added. Key: ${String(key)}`);
  map.set(key, value);
}

/** String indexer: out of range throws like .NET does, instead of giving undefined (which can loop forever). */
export function charAt(s: string, index: number): string {
  if (index < 0 || index >= s.length) throw new RangeError('IndexOutOfRangeException: Index was outside the bounds of the array.');
  return s[index]!;
}

/** Dictionary indexer get: throws when the key is missing like .NET does. */
export function dictGet<K, V>(map: Map<K, V>, key: K): V {
  if (!map.has(key)) throw new Error(`KeyNotFoundException: The given key '${String(key)}' was not present in the dictionary.`);
  return map.get(key) as V;
}

/** List indexer: throws when the index is out of range like .NET does. */
export function listGet<T>(list: readonly T[], index: number): T {
  if (index < 0 || index >= list.length || !Number.isInteger(index)) {
    throw new RangeError(`ArgumentOutOfRangeException: Index ${index} was out of range (count ${list.length}).`);
  }
  return list[index] as T;
}
