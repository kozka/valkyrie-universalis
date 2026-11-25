// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/QuestLog.cs
import type { Quest } from './Quest.ts';

// Valkyrie: QuestLog.cs QuestLog
export class QuestLog implements Iterable<Quest.LogEntry> {
  private readonly log: Quest.LogEntry[] = [];

  // Valkyrie: QuestLog.cs QuestLog.Add
  add(logEntry: Quest.LogEntry): void {
    this.log.push(logEntry);
  }

  // Valkyrie: QuestLog.cs QuestLog.GetEnumerator
  [Symbol.iterator](): Iterator<Quest.LogEntry> {
    return this.log[Symbol.iterator]();
  }
}
