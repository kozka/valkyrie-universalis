// Ported from Valkyrie (Apache-2.0), modified: libraries/FFGAppImport/AssetImport/FetchContent.cs
// Partial: whether an import is needed (NeedImport) and its version checks. Finding the official app and reading its
// Unity assets (Import, ExportTexture…) are not ported: the player brings Valkyrie's import folder instead.
import { File, Path } from '../../platform/SystemIO.ts';
import { intTryParse } from '../../platform/CSharp.ts';
import { IniRead } from '../../ValkyrieTools/IniRead.ts';
import { ValkyrieDebug } from '../../ValkyrieTools/ValkyrieDebug.ts';
import { FFGImport } from '../FFGAppImport.ts';

/** The oldest version of each official app Valkyrie imports from. */
// Valkyrie: MoMFinder.cs MoMFinder.RequiredFFGVersion and RtLFinder.cs RtLFinder.RequiredFFGVersion
const REQUIRED_FFG_VERSION: Record<FFGImport['type'], string> = {
  MoM: '1.5.0',
  D2E: '1.5.2',
};

// Used to import content from FFG apps
// Valkyrie: FetchContent.cs FetchContent
export class FetchContent {
  private readonly importData: FFGImport;
  private readonly contentPath: string;

  constructor(importData: FFGImport) {
    this.importData = importData;
    this.contentPath = importData.path;
  }

  // Check if an import is required
  // Valkyrie: FetchContent.cs FetchContent.NeedImport
  needImport(): boolean {
    // Read the import log
    const logFile = Path.combine(this.contentPath, 'import.ini');
    ValkyrieDebug.log('Import log file: ' + logFile);
    // If no import log, import is required
    if (!File.exists(logFile)) {
      return true;
    }
    const log = IniRead.readFromIni(logFile);
    // If no import log, import is required
    if (log === null) {
      return true;
    }

    // Check that the FFG app version in import is new enough
    const lastImport = log.get('Import', 'FFG');
    const appVersionOK = FetchContent.versionNewerOrEqual(REQUIRED_FFG_VERSION[this.importData.type], lastImport);

    // Check that the Valkyrie version in import is new enough
    const lastValkVersion = intTryParse(log.get('Import', 'Valkyrie')).value;
    const valkVersionOK = FFGImport.version === lastValkVersion;
    return !appVersionOK || !valkVersionOK;
  }

  // Test version of the form a.b.c is newer or equal
  // Valkyrie: FetchContent.cs FetchContent.VersionNewerOrEqual
  static versionNewerOrEqual(oldVersion: string, newVersion: string): boolean {
    const oldS = oldVersion.replace(/[^0-9]/g, '');
    const newS = newVersion.replace(/[^0-9]/g, '');
    // If numbers are the same they are equal
    if (oldS === newS) return true;
    return FetchContent.versionNewer(oldVersion, newVersion);
  }

  // Test version of the form a.b.c is newer
  // Valkyrie: FetchContent.cs FetchContent.VersionNewer
  static versionNewer(oldVersion: string, newVersion: string): boolean {
    if (newVersion === '') return false;
    if (oldVersion === '') return true;

    // Split into components
    const oldV = oldVersion.split('.');
    const newV = newVersion.split('.');

    // Different number of components
    if (oldV.length !== newV.length) return true;

    // Check each component
    for (let i = 0; i < oldV.length; i++) {
      // Strip for only numbers; int.Parse throws on an empty or too large number, and the catch counts it as newer
      const oldS = intTryParse(oldV[i]!.replace(/[^0-9]/g, ''));
      const newS = intTryParse(newV[i]!.replace(/[^0-9]/g, ''));
      if (!oldS.ok || !newS.ok) return true;
      if (oldS.value < newS.value) return true;
      if (oldS.value > newS.value) return false;
    }
    return false;
  }
}
