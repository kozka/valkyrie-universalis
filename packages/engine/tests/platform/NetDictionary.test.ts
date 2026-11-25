// Not ported from Valkyrie: the order of a .NET Dictionary after removals, which Valkyrie's editor files follow.
import { describe, expect, it } from 'vitest';
import { netAdd, netRemove, netSet } from '../../src/platform/NetDictionary.ts';

const keys = (map: Map<string, number>) => [...map.keys()];

describe('NetDictionary', () => {
  it('Add_WithoutRemovalsAppends', () => {
    const map = new Map<string, number>();
    netAdd(map, 'a', 1);
    netAdd(map, 'b', 2);
    netSet(map, 'c', 3);
    expect(keys(map)).toEqual(['a', 'b', 'c']);
  });

  it('Add_AfterARemovalTakesTheFreedSlot', () => {
    const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
    netRemove(map, 'b');
    netAdd(map, 'd', 4);
    expect(keys(map)).toEqual(['a', 'd', 'c']);
    expect(map.get('d')).toBe(4);
  });

  it('Add_TakesTheSlotFreedLast', () => {
    const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
    netRemove(map, 'a');
    netRemove(map, 'c');
    netAdd(map, 'e', 5);
    expect(keys(map)).toEqual(['b', 'e']);
    netAdd(map, 'f', 6);
    expect(keys(map)).toEqual(['f', 'b', 'e']);
    netAdd(map, 'g', 7);
    expect(keys(map)).toEqual(['f', 'b', 'e', 'g']);
  });

  it('RemoveThenAddTheSameKey_KeepsItsPlace', () => {
    const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
    netRemove(map, 'b');
    netAdd(map, 'b', 9);
    expect(keys(map)).toEqual(['a', 'b', 'c']);
  });

  it('Set_OnAnExistingKeyKeepsItsPlace', () => {
    const map = new Map([['a', 1], ['b', 2]]);
    netSet(map, 'a', 5);
    expect([...map]).toEqual([['a', 5], ['b', 2]]);
  });

  it('Add_ExistingKeyThrowsAsDictionaryAdd', () => {
    const map = new Map([['a', 1]]);
    expect(() => netAdd(map, 'a', 2)).toThrow(/same key/);
  });

  it('MapChangedDirectly_StartsAgainFromItsOrder', () => {
    const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
    netRemove(map, 'b');
    map.set('x', 0);
    netAdd(map, 'd', 4);
    expect(keys(map)).toEqual(['a', 'c', 'x', 'd']);
  });

  it('Remove_MissingKeyIsFalse', () => {
    expect(netRemove(new Map([['a', 1]]), 'z')).toBe(false);
  });
});
