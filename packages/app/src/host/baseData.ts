// Valkyrie's base data in the virtual file system, where Valkyrie has StreamingAssets: the .ini and .txt files from
// base-data.zip (built by vite.config.ts), and stand-ins of the right size for its pictures, which the app fetches from
// Valkyrie's repository at the same commit when it draws them (some are FFG art, so they are not bundled).
// Not ported from Valkyrie.
import { unzipSync } from 'fflate';
import { Application, normalizePath, standInFile, type VirtualFileSystem } from '@universalis/engine';

export interface BaseDataManifest {
  valkyrieCommit: string;
  valkyrieVersion: string;
  files: { path: string; bytes: number }[];
  /** Valkyrie's own pictures, with their size in pixels. */
  images: { path: string; bytes: number; width: number; height: number }[];
}

/** Where each of Valkyrie's own pictures is, by its path in the file system in lower case. */
const imageUrls = new Map<string, string>();
/** Valkyrie's unity/Assets folder in its repository, at the commit the base data comes from. */
let assetsUrl = '';
/** The commit of Valkyrie the base data comes from. */
let commit = '';

/** The commit of Valkyrie the base data and its pictures come from; empty before mountBaseData. */
export function baseDataCommit(): string {
  return commit;
}

export async function mountBaseData(vfs: VirtualFileSystem): Promise<BaseDataManifest> {
  const response = await fetch(`${import.meta.env.BASE_URL}base-data.zip`);
  if (!response.ok) throw new Error(`base-data.zip: HTTP ${response.status}`);
  const files = unzipSync(new Uint8Array(await response.arrayBuffer()));
  const manifest = JSON.parse(new TextDecoder().decode(files['manifest.json'])) as BaseDataManifest;
  for (const file of manifest.files) {
    vfs.writeFile(`${Application.streamingAssetsPath}/${file.path}`, files[file.path]!);
  }
  commit = manifest.valkyrieCommit;
  assetsUrl = `https://raw.githubusercontent.com/NPBruce/valkyrie/${manifest.valkyrieCommit}/unity/Assets/`;
  const repository = `${assetsUrl}StreamingAssets/`;
  for (const image of manifest.images) {
    const path = `${Application.streamingAssetsPath}/${image.path}`;
    vfs.writeFile(path, standInFile(image.path, image.width, image.height), image.bytes);
    imageUrls.set(normalizePath(path).toLowerCase(), repository + image.path.split('/').map(encodeURIComponent).join('/'));
  }
  return manifest;
}

/** The address of one of Valkyrie's own pictures in its repository, at the commit the base data comes from. */
export function baseImageUrl(path: string): string | null {
  return imageUrls.get(normalizePath(path).toLowerCase()) ?? null;
}

/** The address of a picture of Valkyrie's Resources folder, as Resources.load names it (Resources/Sprites/…). */
export function resourceUrl(path: string): string {
  return assetsUrl + path.split('/').map(encodeURIComponent).join('/');
}
