// The order of a .NET Dictionary<TKey, TValue> on a Map. In .NET a removed key frees its slot, and the next new key
// takes the slot freed last, where a Map appends it; enumeration then follows the slots. Not ported from Valkyrie: its
// editor writes files in that order (QuestEditor.Save), and the order of components decides which of two events with
// the same trigger runs first (EventManager.EventTriggerType). Code that removes keys and adds new ones goes through
// netSet and netRemove; a Map changed directly in between starts again from its own order.

const HOLE = Symbol('free slot');

interface Slots<K> {
  order: (K | typeof HOLE)[];
  free: number[];
}

const slotsOf = new WeakMap<Map<unknown, unknown>, Slots<unknown>>();

function slots<K, V>(map: Map<K, V>): Slots<K> {
  const known = slotsOf.get(map as Map<unknown, unknown>) as Slots<K> | undefined;
  if (known !== undefined) {
    // Still in step with the map: the same keys in the same order
    let i = 0;
    let inStep = true;
    for (const key of map.keys()) {
      while (i < known.order.length && known.order[i] === HOLE) i++;
      if (known.order[i] !== key) {
        inStep = false;
        break;
      }
      i++;
    }
    while (inStep && i < known.order.length && known.order[i] === HOLE) i++;
    if (inStep && i === known.order.length) return known;
  }
  const fresh: Slots<K> = { order: [...map.keys()], free: [] };
  slotsOf.set(map as Map<unknown, unknown>, fresh as Slots<unknown>);
  return fresh;
}

/** Dictionary.Add, or the indexer's set: a new key goes into the slot freed last, if any; an existing key keeps its place. */
export function netSet<K, V>(map: Map<K, V>, key: K, value: V): void {
  if (map.has(key)) {
    map.set(key, value);
    return;
  }
  const s = slots(map);
  const slot = s.free.pop();
  if (slot === undefined) {
    s.order.push(key);
    map.set(key, value);
    return;
  }
  s.order[slot] = key;
  const values = new Map(map);
  values.set(key, value);
  map.clear();
  for (const k of s.order) if (k !== HOLE) map.set(k, values.get(k)!);
}

/** Dictionary.Add: throws on a duplicate key, like dictAdd. */
export function netAdd<K, V>(map: Map<K, V>, key: K, value: V): void {
  if (map.has(key)) throw new Error(`ArgumentException: An item with the same key has already been added. Key: ${String(key)}`);
  netSet(map, key, value);
}

/** Dictionary.Remove: frees the key's slot for the next new key. */
export function netRemove<K, V>(map: Map<K, V>, key: K): boolean {
  if (!map.has(key)) return false;
  const s = slots(map);
  const slot = s.order.indexOf(key);
  s.order[slot] = HOLE;
  s.free.push(slot);
  map.delete(key);
  return true;
}
