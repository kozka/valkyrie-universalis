// The System.IO calls that Valkyrie's C# makes (File, Directory, Path), answered by the current virtual file system.
// Not ported from Valkyrie. The host (app, battery or test) loads packages into the file system first.
import { decodeText, encodeText, splitLines } from './TextDecoding.ts';
import { VirtualFileSystem, normalizePath } from './VirtualFileSystem.ts';

/** System.IO.IOException, so ported `catch (IOException)` blocks keep their meaning. */
export class IOException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IOException';
  }
}

export class FileNotFoundException extends IOException {
  constructor(path: string) {
    super(`Could not find file "${path}"`);
    this.name = 'FileNotFoundException';
  }
}

export class DirectoryNotFoundException extends IOException {
  constructor(path: string) {
    super(`Could not find a part of the path "${path}"`);
    this.name = 'DirectoryNotFoundException';
  }
}

let current = new VirtualFileSystem();

/** The file system that File, Directory and Path work on. */
export function fileSystem(): VirtualFileSystem {
  return current;
}

/** Replaces the file system (each test, battery run or game session installs its own). */
export function setFileSystem(vfs: VirtualFileSystem): VirtualFileSystem {
  current = vfs;
  return vfs;
}

function readBytes(path: string): Uint8Array {
  const bytes = current.readFile(path);
  if (bytes === null) {
    const dir = Path.getDirectoryName(path);
    if (dir && !current.directoryExists(dir)) throw new DirectoryNotFoundException(path);
    throw new FileNotFoundException(path);
  }
  return bytes;
}

export const File = {
  exists(path: string | null | undefined): boolean {
    if (path === null || path === undefined || path.length === 0) return false;
    return current.fileExists(path);
  },
  readAllBytes(path: string): Uint8Array {
    return readBytes(path);
  },
  readAllText(path: string): string {
    return decodeText(readBytes(path));
  },
  readAllLines(path: string): string[] {
    return splitLines(decodeText(readBytes(path)));
  },
  writeAllText(path: string, text: string): void {
    current.writeFile(path, encodeText(text));
  },
  writeAllBytes(path: string, bytes: Uint8Array): void {
    current.writeFile(path, bytes);
  },
  delete(path: string): void {
    current.deleteFile(path);
  },
};

/** SearchOption */
export const SearchOption = { TopDirectoryOnly: 0, AllDirectories: 1 } as const;
export type SearchOption = (typeof SearchOption)[keyof typeof SearchOption];

function wildcardToRegExp(pattern: string): RegExp {
  const body = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
  return new RegExp(`^${body}$`, 'i');
}

export const Directory = {
  exists(path: string | null | undefined): boolean {
    if (path === null || path === undefined || path.length === 0) return false;
    return current.directoryExists(path);
  },
  createDirectory(path: string): void {
    current.createDirectory(path);
  },
  delete(path: string, recursive = false): void {
    if (!current.directoryExists(path)) throw new DirectoryNotFoundException(path);
    if (!recursive && (current.listFiles(path, false).length > 0 || current.listDirectories(path, false).length > 0)) {
      throw new IOException(`The directory is not empty: "${path}"`);
    }
    current.deleteDirectory(path);
  },
  /** Directory.GetFiles(path[, searchPattern[, searchOption]]) */
  getFiles(path: string, searchPattern = '*', searchOption: SearchOption = SearchOption.TopDirectoryOnly): string[] {
    if (!current.directoryExists(path)) throw new DirectoryNotFoundException(path);
    const match = wildcardToRegExp(searchPattern);
    return current
      .listFiles(path, searchOption === SearchOption.AllDirectories)
      .filter((file) => match.test(file.substring(file.lastIndexOf('/') + 1)));
  },
  /** Directory.GetDirectories(path) */
  getDirectories(path: string): string[] {
    if (!current.directoryExists(path)) throw new DirectoryNotFoundException(path);
    return current.listDirectories(path, false);
  },
};

const SEPARATORS = ['/', '\\'];

export const Path = {
  DirectorySeparatorChar: '/',
  AltDirectorySeparatorChar: '\\',

  /** Path.Combine: a rooted later part replaces what came before. */
  combine(...parts: string[]): string {
    let result = '';
    for (const part of parts) {
      if (part === null || part === undefined) throw new Error('ArgumentNullException: path');
      if (part.length === 0) continue;
      if (Path.isPathRooted(part) || result.length === 0) result = part;
      else result += SEPARATORS.includes(result[result.length - 1]!) ? part : '/' + part;
    }
    return result;
  },

  isPathRooted(path: string): boolean {
    return SEPARATORS.includes(path[0] ?? '') || /^[A-Za-z]:/.test(path);
  },

  /** Path.GetDirectoryName: null for a root, '' for a bare file name; separators are cleaned like Mono's CleanPath. */
  getDirectoryName(path: string | null): string | null {
    if (path === null || path === undefined) return null;
    if (path.length === 0) throw new Error('ArgumentException: The path is not of a legal form.');
    if (/^[/\\]+$/.test(path)) return null;
    let last = -1;
    for (const sep of SEPARATORS) last = Math.max(last, path.lastIndexOf(sep));
    if (last === 0) last++;
    if (last > 0) return path.substring(0, last).replace(/[/\\]+/g, '/');
    return '';
  },

  getFileName(path: string): string {
    let last = -1;
    for (const sep of SEPARATORS) last = Math.max(last, path.lastIndexOf(sep));
    return path.substring(last + 1);
  },

  getFileNameWithoutExtension(path: string): string {
    const name = Path.getFileName(path);
    const dot = name.lastIndexOf('.');
    return dot === -1 ? name : name.substring(0, dot);
  },

  /** Path.GetExtension: includes the dot; '' when there is none or the name ends with a dot. */
  getExtension(path: string): string {
    const name = Path.getFileName(path);
    const dot = name.lastIndexOf('.');
    if (dot === -1 || dot === name.length - 1) return '';
    return name.substring(dot);
  },

  /** Path.GetFullPath: an absolute, normalized path. */
  getFullPath(path: string): string {
    return normalizePath(path);
  },
};
