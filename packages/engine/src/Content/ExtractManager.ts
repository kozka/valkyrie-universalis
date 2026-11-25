// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/ExtractManager.cs
import { Application } from '../platform/Application.ts';
import { Directory, Path, SearchOption } from '../platform/SystemIO.ts';
import { ValkyrieConstants } from '../ValkyrieConstants.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { Extract_mode, ZipManager } from '../ZipManager.ts';
import { ContentData } from './ContentData.ts';

// Valkyrie: ExtractManager.cs ExtractManager
export class ExtractManager {
  /** Fully extract one single package, before starting a quest, and return where it went */
  // Valkyrie: ExtractManager.cs ExtractManager.ExtractSinglePackageFull
  static extractSinglePackageFull(path: string): string {
    // Extract into temp
    const tempValkyriePath = ContentData.tempValkyriePath;
    ExtractManager.mkDir(tempValkyriePath);

    const extractedPath = Path.combine(tempValkyriePath, Path.getFileName(path));
    ZipManager.extract(extractedPath, path, Extract_mode.ZIPMANAGER_EXTRACT_FULL);
    return extractedPath;
  }

  /** Partial extract of a single package: only the quest.ini and translations, to validate the quest and get its name */
  // Valkyrie: ExtractManager.cs ExtractManager.ExtractSinglePackagePartial
  static extractSinglePackagePartial(path: string): void {
    // Extract into temp
    const extractedPath = Path.combine(ContentData.tempValkyriePath, Path.getFileName(path));
    ZipManager.extract(extractedPath, path, Extract_mode.ZIPMANAGER_EXTRACT_INI_TXT_PIC);
  }

  /** Partial extract of all packages in a directory, to list quests */
  // Valkyrie: ExtractManager.cs ExtractManager.ExtractPackages
  static extractPackages(path: string): void {
    // Find all packages at path
    const archives = Directory.getFiles(path, ValkyrieConstants.ContentPackDownloadContainerExtensionAllFileReference, SearchOption.AllDirectories);

    // Extract all packages
    for (const f of archives) {
      const extractedPath = Path.combine(ContentData.tempValkyriePath, Path.getFileName(f));
      ZipManager.extract(extractedPath, f, Extract_mode.ZIPMANAGER_EXTRACT_INI_TXT_PIC);
    }
  }

  // Attempt to create a directory
  // Valkyrie: ExtractManager.cs ExtractManager.mkDir
  static mkDir(p: string): void {
    if (!Directory.exists(p)) {
      try {
        Directory.createDirectory(p);
      } catch {
        ValkyrieDebug.log('Error: Unable to create directory: ' + p);
        Application.quit('cannot-create-directory', p, 'Error: Unable to create directory: ' + p);
      }
    }
  }

  /** Return a list of directories at a path (recursive), each one after its own subdirectories */
  // Valkyrie: ExtractManager.cs ExtractManager.DirList
  static dirList(path: string, l: readonly string[] = []): string[] {
    let list = [...l];

    for (const s of Directory.getDirectories(path)) {
      list = ExtractManager.dirList(s, list);
      list.push(s);
    }

    return list;
  }

  // Valkyrie: ExtractManager.cs ExtractManager.CleanTemp
  static cleanTemp(): void {
    // Nothing to do if no temporary files
    const tempValkyriePath = ContentData.tempValkyriePath;
    if (!Directory.exists(tempValkyriePath)) {
      return;
    }

    try {
      Directory.delete(tempValkyriePath, true);
    } catch {
      ValkyrieDebug.log('Warning: Unable to remove temporary files.');
    }
  }
}
