// What the scenario editor takes in and hands out as files: a scenario imported from a .valkyrie, a zip or a folder,
// one exported as a zip of its folder, and its package as Valkyrie's editor makes it. Not ported from Valkyrie, whose
// editor works on the folders of the computer it runs on.
import { Directory, EditorTools, File, Path, QuestEditSelection, QuestEditor, ZipManager } from '@universalis/engine';
import { isMacMetadata, type SourceFile } from '../host/importSource.ts';

/** Path.GetInvalidFileNameChars on Windows, as QuestEditSelection checks a new scenario's folder. */
const INVALID_FILE_NAME_CHARS = /[\u0000-\u001f"<>|:*?\\/]/g;

/** Where the scenario is in what the player gave: the folder of its shallowest quest.ini ('' at the top), or null. */
export function scenarioRoot(names: readonly string[]): string | null {
  const roots = names.filter((n) => /(^|\/)quest\.ini$/i.test(n) && !isMacMetadata(n)).map((n) => n.slice(0, -'quest.ini'.length));
  roots.sort((a, b) => a.split('/').length - b.split('/').length || a.length - b.length);
  return roots[0] ?? null;
}

/** A folder of the Editor that is not taken, after a name: the name itself, then name2, name3… as CreatePackage does. */
export function freeFolder(name: string): string {
  const base = name.replace(INVALID_FILE_NAME_CHARS, '').trim() || 'Scenario';
  const editor = QuestEditSelection.editorLocation();
  let folder = base;
  for (let n = 2; Directory.exists(editor + '/' + folder); n++) folder = base + n;
  return folder;
}

/**
 * Puts a scenario the player gave (a .valkyrie or a zip, or a folder) into the Editor folder, named after the folder it
 * was in or else after the file. Returns the folder's name, or null when there is no quest.ini in it.
 */
export async function importScenario(files: readonly SourceFile[], fileName: string): Promise<string | null> {
  const root = scenarioRoot(files.map((f) => f.name));
  if (root === null) return null;
  const named = root.split('/').filter((s) => s.length > 0).pop() ?? fileName.replace(/\.(valkyrie|zip)$/i, '');
  const folder = freeFolder(named);
  const target = QuestEditSelection.editorLocation() + '/' + folder;
  for (const f of files) {
    if (!f.name.startsWith(root) || isMacMetadata(f.name)) continue;
    const bytes = new Uint8Array(await new Response(await f.stream()).arrayBuffer());
    File.writeAllBytes(target + '/' + f.name.substring(root.length), bytes);
  }
  return folder;
}

/** Hands a file to the browser to download. */
export function download(bytes: Uint8Array, name: string): void {
  const url = URL.createObjectURL(new Blob([bytes.slice()], { type: 'application/zip' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** A scenario's folder as a zip, to keep or to open in Valkyrie's editor. */
export function exportScenario(folder: string): void {
  download(ZipManager.zipDirectory(folder), Path.getFileName(folder) + '.zip');
}

/** Not kept: a package is made here, handed to the player, and taken away. */
const PACKAGE_FOLDER = '/editor-package';

/**
 * The open scenario's package (EditorTools.CreatePackage, which saves it first): its folder, with the .valkyrie, its
 * manifest and its cover, zipped for the player to put in a repository for the store. Not in Valkyrie, which packages
 * the files as they are: when the save did not go through, nothing is handed over ('not-saved').
 */
export function downloadPackage(): 'ready' | 'failed' | 'not-saved' {
  if (Directory.exists(PACKAGE_FOLDER)) Directory.delete(PACKAGE_FOLDER, true);
  Directory.createDirectory(PACKAGE_FOLDER);
  try {
    const destination = EditorTools.createPackage(PACKAGE_FOLDER);
    if (QuestEditor.lastSaveProblems.length > 0 || QuestEditor.lastSaveUnstable.length > 0) return 'not-saved';
    if (destination === null) return 'failed';
    download(ZipManager.zipDirectory(PACKAGE_FOLDER), Path.getFileName(destination) + '-package.zip');
    return 'ready';
  } finally {
    Directory.delete(PACKAGE_FOLDER, true);
  }
}
