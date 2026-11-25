// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/VersionManager.cs
// Partial: the version comparisons. Checking Valkyrie's latest release online (GetLatestVersionAsync) is not ported.
import { intTryParse } from './platform/CSharp.ts';

// This class provides functions to manage the versions of the app
// Valkyrie: VersionManager.cs VersionManager
export const VersionManager = {
  // Test version of the form a.b.c is newer or equal
  // Valkyrie: VersionManager.cs VersionManager.VersionNewerOrEqual
  versionNewerOrEqual(oldVersion: string, newVersion: string): boolean {
    const oldS = oldVersion.replace(/[^0-9]/g, '');
    const newS = newVersion.replace(/[^0-9]/g, '');
    // If numbers are the same they are equal
    if (oldS === newS) return true;
    return VersionManager.versionNewer(oldVersion, newVersion);
  },

  // Test version of the form a.b.c is newer
  // Valkyrie: VersionManager.cs VersionManager.VersionNewer
  versionNewer(oldVersion: string, newVersion: string): boolean {
    // Split into components
    const oldV = oldVersion.split('.');
    const newV = newVersion.split('.');

    if (newVersion === '') return false;
    if (oldVersion === '') return true;

    const maxLen = Math.max(oldV.length, newV.length);
    let numericOlder = false;
    let numericNewer = false;

    // Check each component
    for (let i = 0; i < maxLen; i++) {
      let oldInt = 0;
      let newInt = 0;

      if (i < oldV.length) {
        oldInt = intTryParse(oldV[i]!.replace(/[^0-9]/g, '')).value;
      }
      if (i < newV.length) {
        newInt = intTryParse(newV[i]!.replace(/[^0-9]/g, '')).value;
      }

      if (oldInt < newInt) {
        numericNewer = true;
        break;
      }
      if (oldInt > newInt) {
        numericOlder = true;
        break;
      }
    }

    if (numericNewer) return true;
    if (numericOlder) return false;

    // If numeric parts are identical (e.g. 3.20.0 vs 3.20, or 3.20 vs 3.20 BETA), check priority
    return getVersionPriority(newVersion) > getVersionPriority(oldVersion);
  },

  /**
   * Checks if the provided version string indicates a beta version: more than 2 components (e.g. 3.12.1)
   * or containing the string "beta".
   */
  // Valkyrie: VersionManager.cs VersionManager.IsBeta
  isBeta(version: string): boolean {
    return version.split('.').length > 2 || version.toLowerCase().includes('beta');
  },
};

/** A priority score for the version's release type: Beta = 1, Stable/Normal = 2, Major = 3. */
// Valkyrie: VersionManager.cs VersionManager.GetVersionPriority
function getVersionPriority(version: string): number {
  const vLower = version.toLowerCase();
  if (vLower.includes('major')) return 3;
  if (VersionManager.isBeta(version)) return 1;
  return 2; // Default for normal releases
}
