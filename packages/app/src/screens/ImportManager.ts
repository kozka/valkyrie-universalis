// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/UI/Screens/ImportManager.cs
// Partial: whether each game needs an import (Inspect, NeedImport) and the ZIP import, which in the browser also takes
// the import folder itself. Importing from the official app (Import, ImportAvailable) is not ported, nor are the zip
// names Valkyrie expects: the player brings Valkyrie's own import folder, under any name (officialImport.ts).
import { FFGImport, Game, ValkyrieConstants } from '@universalis/engine';
import type { ImportGame } from '../host/importSource.ts';
import { importOfficialContent, type ImportFailure } from '../host/officialImport.ts';

let fcD2E: FFGImport | null = null;
let fcMoM: FFGImport | null = null;

// Valkyrie: ImportManager.cs ImportManager
export const ImportManager = {
  // Valkyrie: ImportManager.cs ImportManager.Inspect
  inspect(): void {
    if (fcD2E !== null && fcMoM !== null) return;
    fcD2E = new FFGImport('D2E', Game.appData() + '/');
    fcMoM = new FFGImport('MoM', Game.appData() + '/');
  },

  // Valkyrie: ImportManager.cs ImportManager.NeedImport
  needImport(type: string): boolean {
    if (fcD2E === null || fcMoM === null) return false;
    if (type === ValkyrieConstants.typeDescent) return fcD2E.needImport();
    if (type === ValkyrieConstants.typeMom) return fcMoM.needImport();
    return false;
  },

  /** Not in Valkyrie: whether this browser can keep an import (it needs the origin private file system). */
  canImport(): boolean {
    return typeof navigator.storage?.getDirectory === 'function';
  },

  /** ImportZip, for a zip or the folder itself; null when the copy worked. `progress` hears how many files are copied. */
  // Valkyrie: ImportManager.cs ImportManager.ImportZip and ImportZipFromPath
  importFrom(type: string, source: { folder: File[] } | { zip: File }, progress: (done: number, total: number) => void): Promise<ImportFailure | null> {
    const game = type as ImportGame;
    return importOfficialContent('zip' in source ? { game, zip: source.zip } : { game, folder: source.folder }, progress);
  },
};
