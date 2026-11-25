// System.Collections.Generic.Stack<T>, which EventManager uses for its queue of events and Quest for undo.
// Not ported from Valkyrie. Enumeration and ToArray go from the top, as in .NET, which matters for saves.

export class Stack<T> implements Iterable<T> {
  private readonly items: T[] = [];

  get count(): number {
    return this.items.length;
  }

  push(item: T): void {
    this.items.push(item);
  }

  /** Removes and returns the top item; an empty stack throws, as in .NET. */
  pop(): T {
    if (this.items.length === 0) throw new Error('InvalidOperationException: Stack empty.');
    return this.items.pop()!;
  }

  /** Returns the top item without removing it; an empty stack throws, as in .NET. */
  peek(): T {
    if (this.items.length === 0) throw new Error('InvalidOperationException: Stack empty.');
    return this.items[this.items.length - 1]!;
  }

  clear(): void {
    this.items.length = 0;
  }

  contains(item: T): boolean {
    return this.items.includes(item);
  }

  /** The items from the top down, as Stack.ToArray gives them. */
  toArray(): T[] {
    return [...this.items].reverse();
  }

  [Symbol.iterator](): Iterator<T> {
    return this.toArray()[Symbol.iterator]();
  }
}
