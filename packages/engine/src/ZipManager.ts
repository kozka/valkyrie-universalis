// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/ZipManager.cs
// Extracting means mounting the entries into the virtual file system; they inflate when read. A partial extraction
// (the few files that list a quest or a save) inflates them at once instead, so that the archive need not stay in
// memory. Saving writes the zip at once instead of in a thread, so there is never a previous save to wait for; to keep
// that quick, a file that is still the entry it was mounted from is copied as the zip stores it, as DotNetZip copies
// the entries it did not change. New files are compressed: texts deflated, pictures and sounds, which are compressed
// already, stored as they are.
import { zipSync, type Zippable } from 'fflate';
import { Directory, File, Path, SearchOption, fileSystem } from './platform/SystemIO.ts';
import { canCopyZipEntry, copyZipEntries, readZipDirectory, readZipEntry, type ZipEntry } from './platform/Zip.ts';
import { IniRead } from './ValkyrieTools/IniRead.ts';
import { ValkyrieDebug } from './ValkyrieTools/ValkyrieDebug.ts';
import { ValkyrieConstants } from './ValkyrieConstants.ts';

// Valkyrie: ZipManager.cs ZipManager.Extract_mode
export const Extract_mode = {
  ZIPMANAGER_EXTRACT_FULL: 0,
  ZIPMANAGER_EXTRACT_INI_TXT: 1,
  ZIPMANAGER_EXTRACT_INI_TXT_PIC: 2,
  ZIPMANAGER_EXTRACT_SAVE_INI_PIC: 3,
} as const;
export type Extract_mode = (typeof Extract_mode)[keyof typeof Extract_mode];

/** DotNetZip "name = pattern" selection: case-insensitive wildcards on the file name, or on the full path if the pattern has a slash. */
function selectEntries(entries: ZipEntry[], pattern: string): ZipEntry[] {
  const regex = new RegExp(
    '^' + pattern.replace(/\\/g, '/').replace(/[.+^${}()|[\]]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
    'i',
  );
  const onPath = pattern.includes('/') || pattern.includes('\\');
  return entries.filter((e) => !e.isDirectory && regex.test(onPath ? e.name : e.name.substring(e.name.lastIndexOf('/') + 1)));
}

/** The zip entry behind each mounted file's source, for as long as the file keeps that source. */
const mountedEntries = new WeakMap<object, { archive: Uint8Array; entry: ZipEntry }>();

function mountEntry(data: Uint8Array, entry: ZipEntry, targetPath: string): void {
  if (entry.isDirectory) {
    Directory.createDirectory(Path.combine(targetPath, entry.name));
    return;
  }
  // .ini and .txt files are read again by every quest that shares them, so they stay inflated; pictures and sounds do not
  let inflated: Uint8Array | null = null;
  const source = /\.(ini|txt)$/i.test(entry.name) ? () => (inflated ??= readZipEntry(data, entry)) : () => readZipEntry(data, entry);
  if (canCopyZipEntry(entry)) mountedEntries.set(source, { archive: data, entry });
  fileSystem().writeFile(Path.combine(targetPath, entry.name), source, entry.size);
}

/**
 * Writes an entry inflated, as Valkyrie's extraction does on disk: for the few files a partial extraction takes, so that
 * the archive is not kept in memory for them once it is read. Not in Valkyrie: an entry whose path leaves the target
 * folder is skipped, as the full extraction does (a package's quest.ini names the picture taken, and could name a save).
 */
function extractEntry(data: Uint8Array, entry: ZipEntry, targetPath: string): void {
  let basePath = Path.getFullPath(targetPath);
  if (!basePath.endsWith('/')) basePath += '/';
  if (!(Path.getFullPath(Path.combine(basePath, entry.name)) + '/').startsWith(basePath)) {
    ValkyrieDebug.log(`Warning: Path traversal attempt blocked for entry: ${entry.name}`);
    return;
  }
  if (entry.isDirectory) Directory.createDirectory(Path.combine(targetPath, entry.name));
  else fileSystem().writeFile(Path.combine(targetPath, entry.name), readZipEntry(data, entry));
}

/** A file of a zip being written: new bytes, or an entry of another zip to copy as it is stored. */
type ZipItem = { name: string; data: Uint8Array } | { name: string; archive: Uint8Array; entry: ZipEntry };

/** An entry of a zip being written: text is deflated, everything else stored. */
function zipEntry(name: string, data: Uint8Array): Zippable[string] {
  return [data, { level: /\.(ini|txt)$/i.test(name) ? 6 : 0 }];
}

/** Writes the items in their order: the new ones compressed as zipEntry says, the others copied as they are stored. */
function writeZip(items: ZipItem[]): Uint8Array {
  const fresh: Zippable = {};
  for (const item of items) if ('data' in item) fresh[item.name] = zipEntry(item.name, item.data);
  const freshZip = zipSync(fresh);
  const freshEntries = new Map(readZipDirectory(freshZip).map((e) => [e.name, e]));
  return copyZipEntries(items.map((item) => ('data' in item ? { name: item.name, archive: freshZip, entry: freshEntries.get(item.name)! } : item)));
}

/** DotNetZip ZipFile.AddDirectory(path, directoryPathInArchive): every file below the folder. */
function addDirectory(items: ZipItem[], path: string, directoryPathInArchive: string): void {
  const base = Path.getFullPath(path);
  const prefix = directoryPathInArchive === '' ? '' : directoryPathInArchive + '/';
  for (const file of Directory.getFiles(path, '*', SearchOption.AllDirectories)) {
    const name = prefix + Path.getFullPath(file).substring(base.length).replace(/^\/+/, '');
    const source = fileSystem().fileSource(file);
    const mounted = source === null ? undefined : mountedEntries.get(source);
    items.push(mounted !== undefined ? { name, ...mounted } : { name, data: File.readAllBytes(file) });
  }
}

// Valkyrie: ZipManager.cs ZipManager
export class ZipManager {
  // Valkyrie: ZipManager.cs ZipManager._Execute
  /**
   * Not in Valkyrie (7 November 2026): files of the app's own that a save carries beside save.ini, such as the players'
   * notes (universalis-notes.txt); Valkyrie leaves a file it does not know in a save alone.
   */
  static extraSaveFiles: (() => Map<string, Uint8Array>) | null = null;

  private static execute(local_tempPath: string, local_quest_path: string, local_archive_path: string, local_update: boolean): boolean {
    ZipManager.lastError = null;
    try {
      const extra = ZipManager.extraSaveFiles?.() ?? new Map<string, Uint8Array>();
      if (!local_update) {
        // New savefile with quest
        const items: ZipItem[] = [];
        items.push({ name: 'save.ini', data: File.readAllBytes(Path.combine(local_tempPath, 'save.ini')) });
        items.push({ name: 'image.png', data: File.readAllBytes(Path.combine(local_tempPath, 'image.png')) });
        for (const [name, data] of extra) items.push({ name, data });
        addDirectory(items, local_quest_path, 'quest');
        File.writeAllBytes(local_archive_path, writeZip(items));
      } else {
        // Update savefile without quest
        const data = File.readAllBytes(local_archive_path);
        const updated = new Map(['save.ini', 'image.png'].map((name) => [name, File.readAllBytes(Path.combine(local_tempPath, name))]));
        for (const [name, data] of extra) updated.set(name, data);
        const items: ZipItem[] = [];
        for (const e of readZipDirectory(data)) {
          if (e.isDirectory) continue;
          const replaced = updated.get(e.name);
          updated.delete(e.name);
          // The files it does not update are copied as the zip stores them, as DotNetZip does
          items.push(replaced !== undefined ? { name: e.name, data: replaced } : canCopyZipEntry(e) ? { name: e.name, archive: data, entry: e } : { name: e.name, data: readZipEntry(data, e) });
        }
        for (const [name, replaced] of updated) items.push({ name, data: replaced });
        File.writeAllBytes(local_archive_path, writeZip(items));
      }
    } catch (e) {
      ValkyrieDebug.log('Warning: Unable to create/update container file: ' + local_archive_path + '\nException: ' + String(e));
      ZipManager.lastError = String(e);
      return false;
    }
    return true;
  }

  /**
   * Not in Valkyrie (15 November 2026): why the last write failed, for SaveManager.lastSaveError, which tells the player
   * (an iPad out of memory saving a 170 MB scenario only said "Unable to create/update container file").
   */
  static lastError: string | null = null;

  /** Not in Valkyrie (16 October 2026): returns false when the save could not be written, for SaveManager.lastSaveError. */
  // Valkyrie: ZipManager.cs ZipManager.WriteZipAsync
  static writeZipAsync(tempPath: string, quest_path: string, archive_path: string, update: boolean): boolean {
    return ZipManager.execute(tempPath, quest_path, archive_path, update);
  }

  // Valkyrie: ZipManager.cs ZipManager.Wait4PreviousSave
  static wait4PreviousSave(): void {}

  /** Not in Valkyrie's ZipManager: what EditorTools.CreatePackage does with DotNetZip, AddDirectory(path) and Save. */
  static zipDirectory(path: string): Uint8Array {
    const items: ZipItem[] = [];
    addDirectory(items, path, '');
    return writeZip(items);
  }

  // Valkyrie: ZipManager.cs ZipManager.Extract
  static extract(target_path: string, archive_name: string, mode: Extract_mode): void {
    try {
      if (!Directory.exists(target_path)) {
        Directory.createDirectory(target_path);
      }

      const data = File.readAllBytes(archive_name);
      const entries = readZipDirectory(data);

      if (mode === Extract_mode.ZIPMANAGER_EXTRACT_FULL) {
        let basePath = Path.getFullPath(target_path);
        if (!basePath.endsWith('/')) basePath += '/';

        for (const e of entries) {
          // GetFullPath keeps a trailing separator, so the folder itself ("./") passes the check
          const destinationPath = Path.getFullPath(Path.combine(basePath, e.name)) + '/';
          if (!destinationPath.startsWith(basePath)) {
            ValkyrieDebug.log(`Warning: Path traversal attempt blocked for entry: ${e.name}`);
            continue;
          }
          mountEntry(data, e, target_path);
        }
      }

      if (mode === Extract_mode.ZIPMANAGER_EXTRACT_INI_TXT || mode === Extract_mode.ZIPMANAGER_EXTRACT_INI_TXT_PIC) {
        for (const e of selectEntries(entries, 'quest.ini')) extractEntry(data, e, target_path);
        for (const e of selectEntries(entries, 'Localization.*.txt')) extractEntry(data, e, target_path);

        if (mode === Extract_mode.ZIPMANAGER_EXTRACT_INI_TXT_PIC) {
          const iniData = IniRead.readFromIniSection(target_path + ValkyrieConstants.QuestIniFilePath, 'Quest');
          const image = iniData?.get('image');
          if (image !== undefined) {
            for (const e of selectEntries(entries, image)) extractEntry(data, e, target_path);
          }
        }
      }

      if (mode === Extract_mode.ZIPMANAGER_EXTRACT_SAVE_INI_PIC) {
        for (const e of selectEntries(entries, 'save.ini')) extractEntry(data, e, target_path);
        for (const e of selectEntries(entries, 'image.png')) extractEntry(data, e, target_path);

        // search in subfolder (* before filename is required for Android)
        for (const e of selectEntries(entries, '*quest.ini')) extractEntry(data, e, target_path);
        for (const e of selectEntries(entries, '*Localization.*.txt')) extractEntry(data, e, target_path);
      }
    } catch (e) {
      ValkyrieDebug.log('Warning: Error while extracting container file: ' + archive_name + '\nException' + String(e));
    }
  }
}
