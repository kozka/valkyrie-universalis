// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/QuestLogTests.cs
// NUnit runs these tests inside the Unity editor, so Application.isEditor is true while they run.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Application, Quest, QuestLog, ValkyrieDebug } from '../src/index.ts';
import { split, trimEnd } from '../src/platform/CSharp.ts';

/**
 * Unit tests for QuestLog class and Quest.LogEntry class - Quest logging functionality
 */
describe('QuestLogTests', () => {
  beforeEach(() => {
    // Disable ValkyrieDebug to prevent Unity logging during tests
    ValkyrieDebug.enabled = false;
    Application.isEditor = true;
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
    Application.isEditor = false;
  });

  // QuestLog Constructor Tests

  it('Constructor_Default_CreatesEmptyLog', () => {
    const questLog = new QuestLog();
    expect(questLog).not.toBeNullable();
    expect([...questLog].length).toBe(0);
  });

  // QuestLog.Add Tests

  it('Add_SingleEntry_IncreasesCount', () => {
    // Arrange
    const questLog = new QuestLog();
    const entry = new Quest.LogEntry('Test message');

    // Act
    questLog.add(entry);

    // Assert
    expect([...questLog].length).toBe(1);
  });

  it('Add_MultipleEntries_IncreasesCountCorrectly', () => {
    // Arrange
    const questLog = new QuestLog();

    // Act
    questLog.add(new Quest.LogEntry('Entry 1'));
    questLog.add(new Quest.LogEntry('Entry 2'));
    questLog.add(new Quest.LogEntry('Entry 3'));

    // Assert
    expect([...questLog].length).toBe(3);
  });

  it('Add_MultipleEntries_MaintainsOrder', () => {
    // Arrange
    const questLog = new QuestLog();

    // Act
    questLog.add(new Quest.LogEntry('First'));
    questLog.add(new Quest.LogEntry('Second'));
    questLog.add(new Quest.LogEntry('Third'));

    // Assert
    const entries = [...questLog];
    expect(entries[0]!.getEntry()).toBe('First\n\n');
    expect(entries[1]!.getEntry()).toBe('Second\n\n');
    expect(entries[2]!.getEntry()).toBe('Third\n\n');
  });

  // QuestLog Enumeration Tests

  it('GetEnumerator_EmptyLog_ReturnsEmptyEnumerator', () => {
    // Arrange
    const questLog = new QuestLog();

    // Act
    const entries: Quest.LogEntry[] = [];
    for (const entry of questLog) {
      entries.push(entry);
    }

    // Assert
    expect(entries.length).toBe(0);
  });

  it('GetEnumerator_WithEntries_EnumeratesAllEntries', () => {
    // Arrange
    const questLog = new QuestLog();
    questLog.add(new Quest.LogEntry('One'));
    questLog.add(new Quest.LogEntry('Two'));

    // Act
    const entries: Quest.LogEntry[] = [];
    for (const entry of questLog) {
      entries.push(entry);
    }

    // Assert
    expect(entries.length).toBe(2);
  });

  it('IEnumerableGetEnumerator_WithEntries_EnumeratesAllEntries', () => {
    // Arrange
    const questLog = new QuestLog();
    questLog.add(new Quest.LogEntry('Test'));

    // Act - Using the iterable protocol explicitly
    const enumerable: Iterable<unknown> = questLog;
    let count = 0;
    for (const _entry of enumerable) {
      count++;
    }

    // Assert
    expect(count).toBe(1);
  });

  it('ToList_WithMultipleEntries_ReturnsAllEntries', () => {
    // Arrange
    const questLog = new QuestLog();
    questLog.add(new Quest.LogEntry('A'));
    questLog.add(new Quest.LogEntry('B'));
    questLog.add(new Quest.LogEntry('C'));

    // Act
    const list = [...questLog];

    // Assert
    expect(list.length).toBe(3);
  });

  // LogEntry Constructor Tests

  it('LogEntry_SimpleConstructor_CreatesQuestEntry', () => {
    const entry = new Quest.LogEntry('Simple message');
    expect(entry.getEntry()).toBe('Simple message\n\n');
  });

  it('LogEntry_WithEditorFlag_CreatesEditorEntry', () => {
    // Arrange & Act
    const entry = new Quest.LogEntry('Editor message', true);

    // Editor entries are hidden by default
    expect(entry.getEntry(false)).toBe('');
    // Visible when editor mode is enabled
    expect(entry.getEntry(true)).toBe('Editor message\n\n');
  });

  it('LogEntry_WithValkyrieFlag_CreatesValkyrieEntry', () => {
    // Arrange & Act
    const entry = new Quest.LogEntry('Valkyrie message', false, true);

    // Valkyrie entries are visible in editor (Test runs in editor)
    expect(entry.getEntry()).toBe('Valkyrie message\n\n');
  });

  it('LogEntry_TypeStringConstructor_QuestType_CreatesQuestEntry', () => {
    const entry = new Quest.LogEntry('quest0', 'Quest message');
    expect(entry.getEntry()).toBe('Quest message\n\n');
  });

  it('LogEntry_TypeStringConstructor_EditorType_CreatesEditorEntry', () => {
    const entry = new Quest.LogEntry('editor0', 'Editor message');
    expect(entry.getEntry(false)).toBe('');
    expect(entry.getEntry(true)).toBe('Editor message\n\n');
  });

  it('LogEntry_TypeStringConstructor_ValkyrieType_CreatesValkyrieEntry', () => {
    const entry = new Quest.LogEntry('valkyrie0', 'Valkyrie message');
    expect(entry.getEntry()).toBe('Valkyrie message\n\n');
  });

  // LogEntry.ToString Tests

  it('LogEntry_ToString_QuestEntry_FormatsCorrectly', () => {
    const entry = new Quest.LogEntry('Test message');
    const result = entry.toString(5);
    expect(result).toBe('quest5=Test message\r\n');
  });

  it('LogEntry_ToString_EditorEntry_FormatsCorrectly', () => {
    const entry = new Quest.LogEntry('Editor message', true);
    const result = entry.toString(3);
    expect(result).toBe('editor3=Editor message\r\n');
  });

  it('LogEntry_ToString_ValkyrieEntry_FormatsCorrectly', () => {
    const entry = new Quest.LogEntry('Valkyrie message', false, true);
    const result = entry.toString(7);
    expect(result).toBe('valkyrie7=Valkyrie message\r\n');
  });

  it('LogEntry_ToString_WithNewlines_EscapesNewlines', () => {
    const entry = new Quest.LogEntry('Line1\nLine2\nLine3');
    const result = entry.toString(0);
    expect(result.includes('Line1\\nLine2\\nLine3')).toBe(true);
  });

  // LogEntry.GetEntry Tests

  it('LogEntry_GetEntry_WithNewlines_UnescapesNewlines', () => {
    // Arrange - Entry stored with escaped newlines
    const entry = new Quest.LogEntry('quest0', 'Line1\\nLine2');

    // Act
    const result = entry.getEntry();

    // Should unescape \n to actual newlines
    expect(result).toBe('Line1\nLine2\n\n');
  });

  it('LogEntry_GetEntry_EditorFalse_HidesEditorEntries', () => {
    const entry = new Quest.LogEntry('Notice: Debug info', true);
    const result = entry.getEntry(false);
    expect(result).toBe('');
  });

  it('LogEntry_GetEntry_EditorTrue_ShowsEditorEntries', () => {
    const entry = new Quest.LogEntry('Notice: Debug info', true);
    const result = entry.getEntry(true);
    expect(result).toBe('Notice: Debug info\n\n');
  });

  it('LogEntry_GetEntry_QuestEntry_AlwaysVisible', () => {
    // Arrange
    const entry = new Quest.LogEntry('Important quest message');

    // Act
    const resultWithoutEditor = entry.getEntry(false);
    const resultWithEditor = entry.getEntry(true);

    // Assert
    expect(resultWithoutEditor).toBe('Important quest message\n\n');
    expect(resultWithEditor).toBe('Important quest message\n\n');
  });

  // Integration Tests

  it('QuestLog_AddAndEnumerate_WorksCorrectly', () => {
    // Arrange
    const questLog = new QuestLog();
    const messages = ['Start quest', 'Found item', 'Defeated monster', 'Quest complete'];

    // Act
    for (const msg of messages) {
      questLog.add(new Quest.LogEntry(msg));
    }

    // Assert
    const entries = [...questLog];
    expect(entries.length).toBe(4);
    for (let i = 0; i < messages.length; i++) {
      expect(entries[i]!.getEntry()).toBe(messages[i] + '\n\n');
    }
  });

  it('QuestLog_MixedEntryTypes_FiltersCorrectly', () => {
    // Arrange
    const questLog = new QuestLog();
    questLog.add(new Quest.LogEntry('Quest entry'));
    questLog.add(new Quest.LogEntry('Editor entry', true));
    questLog.add(new Quest.LogEntry('Another quest entry'));

    // Act - Get visible entries without editor mode
    let visibleCount = 0;
    for (const entry of questLog) {
      if (entry.getEntry(false).length > 0) {
        visibleCount++;
      }
    }

    // Assert
    expect(visibleCount).toBe(2);
  });

  it('QuestLog_SerializationRoundTrip_MaintainsData', () => {
    // Arrange
    const entry = new Quest.LogEntry('Test message for roundtrip');

    // Act - Serialize
    const serialized = entry.toString(0);

    // Parse the serialized string to extract type and message
    const parts = split(serialized, ['=']);
    const type = parts[0]!;
    const message = trimEnd(parts[1]!, '\r', '\n');

    // Create new entry from parsed data
    const newEntry = new Quest.LogEntry(type, message);

    // Assert
    expect(newEntry.getEntry()).toBe(entry.getEntry());
  });
});
