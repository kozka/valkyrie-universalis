// In-memory file system that answers synchronously, like the System.IO calls in Valkyrie's C#.
// Not ported from Valkyrie. Paths behave as on Windows, where scenarios are written:
// letter case is ignored, '\' is a separator, and '..', '.' and doubled separators are resolved.

/** Lazily produced file contents, so a package can be mounted without inflating every entry. */
export type FileSource = Uint8Array | (() => Uint8Array);

interface FileEntry {
  /** Normalized path with the letter case it was created with. */
  path: string;
  source: FileSource;
  size: number;
}

interface DirEntry {
  path: string;
  dirs: Map<string, DirEntry>;
  files: Map<string, FileEntry>;
}

/** A lookup that only succeeded by ignoring letter case; the battery and the validator report these. */
export interface CaseMismatch {
  requested: string;
  actual: string;
}

/** Turns any path into an absolute one with '/' separators and no '.', '..' or empty segments. */
export function normalizePath(path: string): string {
  const parts: string[] = [];
  for (const segment of path.replace(/\\/g, '/').split('/')) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') parts.pop();
    else parts.push(segment);
  }
  return '/' + parts.join('/');
}

/** Case-insensitive key, using one-to-one upper-case mapping like NTFS (no 'ß' to 'SS'). */
export function pathKey(normalizedPath: string): string {
  // Upper-casing never shortens a string, so the same length means every character mapped to one character
  const upper = normalizedPath.toUpperCase();
  if (upper.length === normalizedPath.length) return upper;
  let key = '';
  for (const c of normalizedPath) {
    const upper = c.toUpperCase();
    key += upper.length === c.length ? upper : c;
  }
  return key;
}

function lastSegment(normalizedPath: string): string {
  return normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1);
}

/** Keys are already upper case, so code unit order is NTFS's directory order. */
function sortedKeys(map: Map<string, unknown>): string[] {
  return [...map.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

interface VirtualTree {
  path: string;
  key: string;
  exists: (relativePath: string) => boolean;
  content: ((relativePath: string) => Uint8Array) | null;
}

const EMPTY = new Uint8Array(0);

/** A file written or deleted, or a folder deleted, with the path as stored (its letter case may differ from the call's). */
export interface FileSystemChange {
  kind: 'write' | 'delete-file' | 'delete-directory';
  path: string;
}

export class VirtualFileSystem {
  private readonly root: DirEntry = { path: '/', dirs: new Map(), files: new Map() };
  private readonly caseMismatchListeners = new Set<(mismatch: CaseMismatch) => void>();
  private readonly changeListeners = new Set<(change: FileSystemChange) => void>();
  private readonly virtualTrees: VirtualTree[] = [];

  /** Reports each change after it is made, so a host can keep some folders on disk; returns a function that removes the listener. */
  onChange(listener: (change: FileSystemChange) => void): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  private noteChange(kind: FileSystemChange['kind'], path: string): void {
    for (const listener of this.changeListeners) listener({ kind, path });
  }

  /**
   * Under `path`, a file exists whenever `exists(relativePath)` says so, empty or with what `content` gives. Stands in
   * for official content that is not there, such as the import folder in the battery or the schematic mode; such files
   * cannot be listed.
   */
  mountVirtualTree(path: string, exists: (relativePath: string) => boolean, content?: (relativePath: string) => Uint8Array): void {
    const normalized = normalizePath(path);
    this.virtualTrees.push({ path: normalized, key: pathKey(normalized), exists, content: content ?? null });
  }

  private findVirtual(normalizedPath: string): FileEntry | null {
    const key = pathKey(normalizedPath);
    for (const tree of this.virtualTrees) {
      const relative = normalizedPath.substring(tree.path.length + 1);
      if (key.startsWith(tree.key + '/') && tree.exists(relative)) {
        const content = tree.content;
        return content === null ? { path: normalizedPath, source: EMPTY, size: 0 } : { path: normalizedPath, source: () => content(relative), size: -1 };
      }
    }
    return null;
  }

  private isInVirtualTree(normalizedPath: string): boolean {
    const key = pathKey(normalizedPath);
    return this.virtualTrees.some((tree) => key === tree.key || key.startsWith(tree.key + '/'));
  }

  /** Reports lookups that only matched by ignoring letter case; returns a function that removes the listener. */
  onCaseMismatch(listener: (mismatch: CaseMismatch) => void): () => void {
    this.caseMismatchListeners.add(listener);
    return () => this.caseMismatchListeners.delete(listener);
  }

  private noteCase(requested: string, actual: string): void {
    if (requested !== actual && this.caseMismatchListeners.size > 0) {
      for (const listener of this.caseMismatchListeners) listener({ requested, actual });
    }
  }

  private findDir(normalizedPath: string, create: boolean): DirEntry | null {
    let dir = this.root;
    if (normalizedPath === '/') return dir;
    let current = '';
    for (const segment of normalizedPath.substring(1).split('/')) {
      current += '/' + segment;
      const key = pathKey(segment);
      let next = dir.dirs.get(key);
      if (!next) {
        if (!create || dir.files.has(key)) return null;
        next = { path: current, dirs: new Map(), files: new Map() };
        dir.dirs.set(key, next);
      }
      current = next.path;
      dir = next;
    }
    return dir;
  }

  private findFile(path: string): FileEntry | null {
    const normalized = normalizePath(path);
    if (normalized === '/') return null;
    const slash = normalized.lastIndexOf('/');
    const dir = this.findDir(slash === 0 ? '/' : normalized.substring(0, slash), false);
    const entry = dir?.files.get(pathKey(normalized.substring(slash + 1))) ?? null;
    if (entry) this.noteCase(normalized, entry.path);
    return entry ?? (this.virtualTrees.length > 0 ? this.findVirtual(normalized) : null);
  }

  /** Creates or replaces a file, creating its folders. */
  writeFile(path: string, source: FileSource, size?: number): void {
    const normalized = normalizePath(path);
    if (normalized === '/') throw new Error('Cannot write a file at the root path');
    const slash = normalized.lastIndexOf('/');
    const dir = this.findDir(slash === 0 ? '/' : normalized.substring(0, slash), true);
    if (!dir) throw new Error(`Cannot create folder for ${normalized}: a file is in the way`);
    const name = normalized.substring(slash + 1);
    const key = pathKey(name);
    if (dir.dirs.has(key)) throw new Error(`Cannot write ${normalized}: a folder has that name`);
    const existing = dir.files.get(key);
    const entryPath = (dir.path === '/' ? '' : dir.path) + '/' + (existing ? lastSegment(existing.path) : name);
    dir.files.set(key, { path: entryPath, source, size: size ?? (source instanceof Uint8Array ? source.length : -1) });
    this.noteChange('write', entryPath);
  }

  createDirectory(path: string): void {
    if (!this.findDir(normalizePath(path), true)) throw new Error(`Cannot create folder ${path}: a file is in the way`);
  }

  fileExists(path: string): boolean {
    return this.findFile(path) !== null;
  }

  directoryExists(path: string): boolean {
    const normalized = normalizePath(path);
    const dir = this.findDir(normalized, false);
    if (dir) this.noteCase(normalized, dir.path);
    return dir !== null || (this.virtualTrees.length > 0 && this.isInVirtualTree(normalized));
  }

  /** Returns the file bytes, or null if the file does not exist. */
  readFile(path: string): Uint8Array | null {
    const entry = this.findFile(path);
    if (!entry) return null;
    return typeof entry.source === 'function' ? entry.source() : entry.source;
  }

  /** What the file was written with (its bytes, or the function that gives them), or null if it does not exist. */
  fileSource(path: string): FileSource | null {
    return this.findFile(path)?.source ?? null;
  }

  /** File path with its stored letter case, or null. */
  actualFilePath(path: string): string | null {
    return this.findFile(path)?.path ?? null;
  }

  /** Size in bytes, or -1 when unknown, or null if the file does not exist. */
  fileSize(path: string): number | null {
    return this.findFile(path)?.size ?? null;
  }

  /** Full paths of the files in a folder, optionally recursive (depth first), in NTFS order: by upper-case name. */
  listFiles(path: string, recursive: boolean): string[] {
    const dir = this.findDir(normalizePath(path), false);
    if (!dir) return [];
    const result: string[] = [];
    const walk = (d: DirEntry) => {
      for (const key of sortedKeys(d.files)) result.push(d.files.get(key)!.path);
      if (recursive) for (const key of sortedKeys(d.dirs)) walk(d.dirs.get(key)!);
    };
    walk(dir);
    return result;
  }

  /** Full paths of the subfolders of a folder, optionally recursive (parents before children), in NTFS order. */
  listDirectories(path: string, recursive: boolean): string[] {
    const dir = this.findDir(normalizePath(path), false);
    if (!dir) return [];
    const result: string[] = [];
    const walk = (d: DirEntry) => {
      for (const key of sortedKeys(d.dirs)) {
        const sub = d.dirs.get(key)!;
        result.push(sub.path);
        if (recursive) walk(sub);
      }
    };
    walk(dir);
    return result;
  }

  deleteFile(path: string): boolean {
    const entry = this.findFile(path);
    if (!entry) return false;
    const slash = entry.path.lastIndexOf('/');
    const dir = this.findDir(slash === 0 ? '/' : entry.path.substring(0, slash), false);
    const deleted = dir?.files.delete(pathKey(entry.path.substring(slash + 1))) ?? false;
    if (deleted) this.noteChange('delete-file', entry.path);
    return deleted;
  }

  /** Removes a folder and everything inside it. */
  deleteDirectory(path: string): boolean {
    const normalized = normalizePath(path);
    if (normalized === '/') {
      this.root.dirs.clear();
      this.root.files.clear();
      this.noteChange('delete-directory', '/');
      return true;
    }
    const slash = normalized.lastIndexOf('/');
    const parent = this.findDir(slash === 0 ? '/' : normalized.substring(0, slash), false);
    const key = pathKey(normalized.substring(slash + 1));
    const dir = parent?.dirs.get(key);
    if (!parent || !dir) return false;
    parent.dirs.delete(key);
    this.noteChange('delete-directory', dir.path);
    return true;
  }
}
