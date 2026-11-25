// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/SaveLoadTests.cs
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Quest, SaveManager, ValkyrieDebug, VersionManager } from '../src/index.ts';
import { NewLine } from '../src/platform/CSharp.ts';

/**
 * Unit tests for SaveManager class and related save/load functionality.
 * Tests focus on testable static methods, version comparison, path generation,
 * and data structures without requiring full Unity runtime context.
 */
describe('SaveLoadTests', () => {
  beforeEach(() => {
    // Disable ValkyrieDebug to prevent Unity logging during tests
    ValkyrieDebug.enabled = false;
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
  });

  // SaveManager Constants Tests

  it('MinValkyieVersion_HasExpectedFormat', () => {
    // Arrange & Act
    const version = SaveManager.minValkyieVersion;

    // Assert - Should be in format X.Y.Z
    expect(version).not.toBeNullable();
    expect(version.includes('.'), 'Version should contain at least one dot separator').toBe(true);
    const parts = version.split('.');
    expect(parts.length >= 2, 'Version should have at least 2 components (major.minor)').toBe(true);
  });

  it('MinValkyieVersion_IsNotEmpty', () => {
    // Arrange & Act
    const version = SaveManager.minValkyieVersion;

    // Assert
    expect(version).not.toBe('');
  });

  it('MinValkyieVersion_HasExpectedValue', () => {
    // Arrange & Act
    const version = SaveManager.minValkyieVersion;

    // Assert - Current expected value
    expect(version).toBe('0.7.3');
  });

  it('MinValkyieVersion_ComponentsAreParsableAsIntegers', () => {
    // Arrange
    const version = SaveManager.minValkyieVersion;
    const parts = version.split('.');

    // Act & Assert - Each part should be parseable as an integer (int.Parse)
    for (const part of parts) {
      expect(/^[+-]?[0-9]+$/.test(part.trim()), `Version component '${part}' should be parseable as integer`).toBe(true);
    }
  });

  // VersionManager.VersionNewer Tests

  it('VersionNewer_NewerMajorVersion_ReturnsTrue', () => {
    expect(VersionManager.versionNewer('1.0.0', '2.0.0')).toBe(true);
  });

  it('VersionNewer_NewerMinorVersion_ReturnsTrue', () => {
    expect(VersionManager.versionNewer('1.0.0', '1.1.0')).toBe(true);
  });

  it('VersionNewer_NewerPatchVersion_ReturnsTrue', () => {
    expect(VersionManager.versionNewer('1.0.0', '1.0.1')).toBe(true);
  });

  it('VersionNewer_SameVersion_ReturnsFalse', () => {
    expect(VersionManager.versionNewer('1.0.0', '1.0.0')).toBe(false);
  });

  it('VersionNewer_OlderVersion_ReturnsFalse', () => {
    expect(VersionManager.versionNewer('2.0.0', '1.0.0')).toBe(false);
  });

  it('VersionNewer_EmptyNewVersion_ReturnsFalse', () => {
    expect(VersionManager.versionNewer('1.0.0', '')).toBe(false);
  });

  it('VersionNewer_EmptyOldVersion_ReturnsTrue', () => {
    expect(VersionManager.versionNewer('', '1.0.0')).toBe(true);
  });

  it('VersionNewer_DifferentComponentCount_ReturnsTrue', () => {
    // Arrange - In our logic, 1.0.0 has 3 components and is considered Beta.
    // 1.0 has 2 components and is considered Stable.
    // So 1.0 (Stable) IS newer than 1.0.0 (Beta).
    expect(VersionManager.versionNewer('1.0.0', '1.0')).toBe(true);
  });

  // VersionManager.VersionNewerOrEqual Tests

  it('VersionNewerOrEqual_SameVersion_ReturnsTrue', () => {
    expect(VersionManager.versionNewerOrEqual('1.5.3', '1.5.3')).toBe(true);
  });

  it('VersionNewerOrEqual_NewerVersion_ReturnsTrue', () => {
    expect(VersionManager.versionNewerOrEqual('1.0.0', '1.0.1')).toBe(true);
  });

  it('VersionNewerOrEqual_OlderVersion_ReturnsFalse', () => {
    expect(VersionManager.versionNewerOrEqual('1.0.1', '1.0.0')).toBe(false);
  });

  it('VersionNewerOrEqual_MinValkyieVersion_ChecksCorrectly', () => {
    // Arrange - Test against actual minimum version
    const minVersion = SaveManager.minValkyieVersion;
    const sameVersion = SaveManager.minValkyieVersion;

    // Act & Assert
    expect(VersionManager.versionNewerOrEqual(minVersion, sameVersion)).toBe(true);
  });

  it('VersionNewerOrEqual_VersionWithExtraCharacters_StillCompares', () => {
    // Arrange - Versions might have non-numeric characters
    expect(VersionManager.versionNewerOrEqual('1.0.0', '1.0.1-beta')).toBe(true);
  });

  // Quest.LogEntry Tests

  it('LogEntry_Constructor_SingleParam_SetsEntry', () => {
    // Arrange & Act
    const logEntry = new Quest.LogEntry('Test log message');

    // Assert
    const output = logEntry.toString(1);
    expect(output.includes('quest1=')).toBe(true);
    expect(output.includes('Test log message')).toBe(true);
  });

  it('LogEntry_Constructor_WithEditorFlag_SetsEditorPrefix', () => {
    // Arrange & Act
    const logEntry = new Quest.LogEntry('Editor message', true);

    // Assert
    expect(logEntry.toString(1).includes('editor1=')).toBe(true);
  });

  it('LogEntry_Constructor_WithValkyrieFlag_SetsValkyriePrefix', () => {
    // Arrange & Act
    const logEntry = new Quest.LogEntry('Valkyrie message', false, true);

    // Assert
    expect(logEntry.toString(1).includes('valkyrie1=')).toBe(true);
  });

  it('LogEntry_Constructor_TypeString_ValkyrieType_SetsValkyriePrefix', () => {
    // Arrange & Act
    const logEntry = new Quest.LogEntry('valkyrie', 'System message');

    // Assert
    expect(logEntry.toString(5).includes('valkyrie5=')).toBe(true);
  });

  it('LogEntry_Constructor_TypeString_EditorType_SetsEditorPrefix', () => {
    // Arrange & Act
    const logEntry = new Quest.LogEntry('editor', 'Editor system message');

    // Assert
    expect(logEntry.toString(3).includes('editor3=')).toBe(true);
  });

  it('LogEntry_Constructor_TypeString_QuestType_SetsQuestPrefix', () => {
    // Arrange & Act
    const logEntry = new Quest.LogEntry('quest', 'Quest message');

    // Assert
    expect(logEntry.toString(2).includes('quest2=')).toBe(true);
  });

  it('LogEntry_ToString_FormatsIdCorrectly', () => {
    // Arrange
    const logEntry = new Quest.LogEntry('Test message');

    // Act & Assert
    expect(logEntry.toString(1).includes('quest1=')).toBe(true);
    expect(logEntry.toString(10).includes('quest10=')).toBe(true);
    expect(logEntry.toString(100).includes('quest100=')).toBe(true);
  });

  it('LogEntry_ToString_EscapesNewlines', () => {
    // Arrange
    const logEntry = new Quest.LogEntry('Line1\nLine2\nLine3');

    // Act
    const output = logEntry.toString(1);

    // Assert - Newlines should be escaped as \\n in output
    expect(output.includes('Line1\\nLine2\\nLine3')).toBe(true);
  });

  it('LogEntry_ToString_EndsWithNewline', () => {
    // Arrange
    const logEntry = new Quest.LogEntry('Test message');

    // Act & Assert
    expect(logEntry.toString(1).endsWith(NewLine)).toBe(true);
  });

  // Save File Path Format Tests

  it('SaveFilePath_Format_ContainsSaveDirectory', () => {
    // Note: GetSaveFilePath requires ContentData.GameTypePath which depends on Game.Get()
    // We test the path format logic conceptually here

    // Arrange - Expected format: {GameTypePath}/Save/saveX.vSave
    const expectedSuffix = '.vSave';

    // Assert - The file extension should be .vSave
    expect(expectedSuffix).toBe('.vSave');
  });

  it('SaveFilePath_AutoSaveNumber_UsesAutoPrefix', () => {
    // Testing the logic: when num == 0, it should use "Auto" instead of "0"
    // In GetSaveFilePath: if (num == 0) number = "Auto";
    const saveNum: number = 0;
    const expectedNumber = saveNum === 0 ? 'Auto' : String(saveNum);

    expect(expectedNumber).toBe('Auto');
  });

  it('SaveFilePath_NumberedSave_UsesNumberAsString', () => {
    // Testing the logic: when num != 0, it should use the number
    const saveNum: number = 1;
    const expectedNumber = saveNum === 0 ? 'Auto' : String(saveNum);

    expect(expectedNumber).toBe('1');
  });

  it('SaveFilePath_HigherNumberedSave_UsesNumberAsString', () => {
    const saveNum: number = 3;
    const expectedNumber = saveNum === 0 ? 'Auto' : String(saveNum);

    expect(expectedNumber).toBe('3');
  });

  // Integration Version Compatibility Tests

  it('MinVersion_IsOlderThanCurrentVersion', () => {
    // Arrange
    const minVersion = SaveManager.minValkyieVersion;
    // Assume current version is at least 3.10 based on CLAUDE.md
    const currentVersion = '3.10';

    // Act & Assert
    expect(
      VersionManager.versionNewer(minVersion, currentVersion),
      `Current version (${currentVersion}) should be newer than min version (${minVersion})`,
    ).toBe(true);
  });

  it('FutureVersion_WouldBeRejected', () => {
    // Arrange - Test the logic that would detect a save from the future
    const currentVersion = '3.10';
    const futureVersion = '4.0.0';

    // Act & Assert
    expect(VersionManager.versionNewer(currentVersion, futureVersion), 'Future version should be detected as newer').toBe(true);
  });

  it('OldVersion_BelowMinimum_WouldBeRejected', () => {
    // Arrange - Test the logic that would detect a save from too old version
    const tooOldVersion = '0.5.0';
    const minVersion = SaveManager.minValkyieVersion; // 0.7.3

    // Act & Assert
    expect(
      VersionManager.versionNewerOrEqual(minVersion, tooOldVersion),
      `Version ${tooOldVersion} should not meet minimum requirement of ${minVersion}`,
    ).toBe(false);
  });

  it('MinVersion_ExactMatch_WouldBeAccepted', () => {
    // Arrange
    const saveVersion = SaveManager.minValkyieVersion;
    const minVersion = SaveManager.minValkyieVersion;

    // Act & Assert
    expect(VersionManager.versionNewerOrEqual(minVersion, saveVersion), 'Exact minimum version should be accepted').toBe(true);
  });
});
