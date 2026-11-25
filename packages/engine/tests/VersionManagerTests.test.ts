// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/VersionManagerTests.cs
import { describe, expect, it } from 'vitest';
import { VersionManager } from '../src/index.ts';

/**
 * Unit tests for VersionManager class
 */
describe('VersionManagerTests', () => {
  it('IsBeta_NormalVersion_ReturnsFalse', () => {
    expect(VersionManager.isBeta('3.12')).toBe(false);
    expect(VersionManager.isBeta('1.0')).toBe(false);
    expect(VersionManager.isBeta('0.1')).toBe(false);
  });

  it('IsBeta_BetaVersion_ReturnsTrue', () => {
    expect(VersionManager.isBeta('3.12.0')).toBe(true);
    expect(VersionManager.isBeta('3.12.1')).toBe(true);
    expect(VersionManager.isBeta('3.12.1.5')).toBe(true);
    expect(VersionManager.isBeta('0.0.1')).toBe(true);
    expect(VersionManager.isBeta('1.0.0.0')).toBe(true);
  });

  it('IsBeta_StringWithBeta_ReturnsTrue', () => {
    expect(VersionManager.isBeta('3.12 BETA')).toBe(true);
    expect(VersionManager.isBeta('3.12\nBETA')).toBe(true);
    expect(VersionManager.isBeta('3.14  beta')).toBe(true);
  });

  it('IsBeta_StringWithMajor_ReturnsFalse', () => {
    expect(VersionManager.isBeta('3.12 MAJOR')).toBe(false);
    expect(VersionManager.isBeta('3.12\nMAJOR')).toBe(false);
    expect(VersionManager.isBeta('3.14  major')).toBe(false);
  });

  it('IsBeta_EmptyVersion_ReturnsFalse', () => {
    expect(VersionManager.isBeta('')).toBe(false);
  });

  it('VersionNewer_BasicComparison_ReturnsCorrectResult', () => {
    expect(VersionManager.versionNewer('3.19', '3.20')).toBe(true);
    expect(VersionManager.versionNewer('3.21', '3.20')).toBe(false);
    expect(VersionManager.versionNewer('3.20', '3.20')).toBe(false);
  });

  it('VersionNewer_BetaToStableUpdate_ReturnsTrue', () => {
    // Case where local is Beta and online is the final Stable release
    expect(VersionManager.versionNewer('3.20 BETA', '3.20')).toBe(true);
    expect(VersionManager.versionNewer('3.20.0', '3.20')).toBe(true); // 3.20.0 is Beta, 3.20 is Stable
    expect(VersionManager.versionNewer('3.20-beta', '3.20')).toBe(true);
  });

  it('VersionNewer_StableToMajorUpdate_ReturnsTrue', () => {
    // Case where stable is released and then a MAJOR version is released
    expect(VersionManager.versionNewer('3.20', '3.20 MAJOR')).toBe(true);
    expect(VersionManager.versionNewer('3.20.0', '3.20 MAJOR')).toBe(true);
  });

  it('VersionNewer_NumericPrecedenceOverSuffix_ReturnsCorrectResult', () => {
    // 3.20 BETA is numerically newer than 3.15 MAJOR, so it should be true (3.15 MAJOR -> 3.20 BETA)
    expect(VersionManager.versionNewer('3.15 MAJOR', '3.20 BETA')).toBe(true);

    // Conversely, 3.20 BETA is NOT newer than 3.21 (stable)
    expect(VersionManager.versionNewer('3.20 BETA', '3.21')).toBe(true);

    // 3.20 MAJOR is NOT newer than 3.21 (even if 3.21 is stable)
    expect(VersionManager.versionNewer('3.20 MAJOR', '3.21')).toBe(true);

    // 3.21 is NOT newer than 3.20 MAJOR
    expect(VersionManager.versionNewer('3.21', '3.20 MAJOR')).toBe(false);
  });

  it('VersionNewer_StableToNewerBeta_ReturnsTrue', () => {
    // Case where stable is installed but a newer version (in Beta) is available
    expect(VersionManager.versionNewer('3.20', '3.21 BETA')).toBe(true);
    expect(VersionManager.versionNewer('3.20', '3.20.1')).toBe(true); // 3.20.1 is a newer beta
  });

  it('VersionNewer_EqualVersions_ReturnsFalse', () => {
    expect(VersionManager.versionNewer('3.20', '3.20')).toBe(false);
    expect(VersionManager.versionNewer('3.20 BETA', '3.20 BETA')).toBe(false);
  });

  it('VersionNewerOrEqual_BasicComparison_ReturnsCorrectResult', () => {
    expect(VersionManager.versionNewerOrEqual('3.19', '3.20')).toBe(true);
    expect(VersionManager.versionNewerOrEqual('3.20', '3.20')).toBe(true);
    expect(VersionManager.versionNewerOrEqual('3.21', '3.20')).toBe(false);
  });

  it('VersionNewerOrEqual_BetaToStable_ReturnsTrue', () => {
    expect(VersionManager.versionNewerOrEqual('3.20 BETA', '3.20')).toBe(true);
  });

  it('VersionNewer_ComplexSuffixes_HandledCorrectly', () => {
    // VersionNewer removes non-digits within components
    expect(VersionManager.versionNewer('3.20a', '3.20')).toBe(false);
    expect(VersionManager.versionNewer('3.20', '3.20a')).toBe(false);
  });

  it('IsBeta_NullVersion_ThrowsException', () => {
    // NullReferenceException in C#
    expect(() => VersionManager.isBeta(null as unknown as string)).toThrow(TypeError);
  });
});
