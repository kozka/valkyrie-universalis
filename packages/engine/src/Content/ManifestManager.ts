// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/ManifestManager.cs
import { isNullOrWhiteSpace } from '../platform/CSharp.ts';
import { File } from '../platform/SystemIO.ts';
import { IniRead, type IniData } from '../ValkyrieTools/IniRead.ts';
import { ValkyrieConstants } from '../ValkyrieConstants.ts';

// Valkyrie: ManifestManager.cs ManifestManager
export class ManifestManager {
  readonly path: string | null;

  constructor(path: string | null) {
    this.path = path;
  }

  // Valkyrie: ManifestManager.cs ManifestManager.GetLocalQuestManifestIniData
  getLocalQuestManifestIniData(): IniData {
    if (isNullOrWhiteSpace(this.path)) {
      throw new Error('ArgumentNullException: Path');
    }

    let localManifest: IniData | null = IniRead.readFromString('');
    if (File.exists(this.path! + ValkyrieConstants.ScenarioManifestPath)) {
      localManifest = IniRead.readFromIni(this.path! + ValkyrieConstants.ScenarioManifestPath);
    }

    return localManifest as IniData;
  }

  // Valkyrie: ManifestManager.cs ManifestManager.GetLocalContentPackManifestIniData
  getLocalContentPackManifestIniData(): IniData {
    if (isNullOrWhiteSpace(this.path)) {
      throw new Error('ArgumentNullException: Path');
    }

    let localManifest: IniData | null = IniRead.readFromString('');
    if (File.exists(this.path! + ValkyrieConstants.ContentPackManifestPath)) {
      localManifest = IniRead.readFromIni(this.path! + ValkyrieConstants.ContentPackManifestPath);
    }

    return localManifest as IniData;
  }
}
