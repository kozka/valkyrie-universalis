// Tests for the .NET semantics helpers (not ported from Valkyrie). Expected values are what .NET Framework returns.
import { describe, expect, it } from 'vitest';
import {
  boolTryParse,
  enumTryParse,
  floatToString,
  floatTryParse,
  intTryParse,
  split,
  trim,
} from '../../src/platform/CSharp.ts';

describe('CSharp', () => {
  it('split keeps the rest of the string in the last part', () => {
    expect(split('a,b,c,d', [','], 2)).toEqual(['a', 'b,c,d']);
    expect(split('a,,b', [','])).toEqual(['a', '', 'b']);
    expect(split('', [','])).toEqual(['']);
  });

  it('split with RemoveEmptyEntries skips empty parts, also before the count is reached', () => {
    expect(split('  a  b ', [' '], undefined, true)).toEqual(['a', 'b']);
    expect(split('', [' '], undefined, true)).toEqual([]);
    expect(split('{tst::KEY:p1:p2}'.slice(1, -1), [':'], 3, true)).toEqual(['tst', 'KEY', 'p1:p2']);
    expect(split('a\r\n\r\nb', ['\r', '\n'], undefined, true)).toEqual(['a', 'b']);
  });

  it('trim uses .NET white space, which does not include the BOM', () => {
    expect(trim('﻿ key \u0085')).toBe('﻿ key');
    expect(trim('""quoted""', '"')).toBe('quoted');
  });

  it('int.TryParse accepts white space and a sign, and fails on decimals', () => {
    expect(intTryParse(' -12 ')).toEqual({ ok: true, value: -12 });
    expect(intTryParse('1.5')).toEqual({ ok: false, value: 0 });
    expect(intTryParse('2147483648')).toEqual({ ok: false, value: 0 });
    expect(intTryParse('')).toEqual({ ok: false, value: 0 });
  });

  it('float.TryParse rounds to 32 bits and rejects overflow', () => {
    expect(floatTryParse('0.1').value).toBe(Math.fround(0.1));
    expect(floatTryParse('5.').value).toBe(5);
    expect(floatTryParse('.5').value).toBe(0.5);
    expect(floatTryParse('1e40')).toEqual({ ok: false, value: 0 });
    expect(floatTryParse('1,5')).toEqual({ ok: false, value: 0 });
    expect(floatTryParse('1,5', true).value).toBe(15);
  });

  it('bool.TryParse ignores case and surrounding white space', () => {
    expect(boolTryParse('True')).toEqual({ ok: true, value: true });
    expect(boolTryParse(' false\0')).toEqual({ ok: true, value: false });
    expect(boolTryParse('1')).toEqual({ ok: false, value: false });
  });

  it('float.ToString writes up to 7 significant digits', () => {
    expect(floatToString(Math.fround(10.5))).toBe('10.5');
    expect(floatToString(Math.fround(-5.5))).toBe('-5.5');
    expect(floatToString(Math.fround(1 / 3))).toBe('0.3333333');
    expect(floatToString(Math.fround(1024 / 3.5))).toBe('292.5714');
    expect(floatToString(1e7)).toBe('1E+07');
    expect(floatToString(Math.fround(0.0001))).toBe('0.0001');
    expect(floatToString(Math.fround(0.00001))).toBe('1E-05');
    expect(floatToString(100)).toBe('100');
  });

  it('Enum.TryParse accepts names in any case and numbers', () => {
    const E = { NONE: 0, DISABLE: 1, HIDE: 2 };
    expect(enumTryParse(E, 'hide', true)).toEqual({ ok: true, value: 2 });
    expect(enumTryParse(E, ' 1 ', true)).toEqual({ ok: true, value: 1 });
    expect(enumTryParse(E, '7', true)).toEqual({ ok: true, value: 7 });
    expect(enumTryParse(E, 'hidden', true).ok).toBe(false);
  });
});
