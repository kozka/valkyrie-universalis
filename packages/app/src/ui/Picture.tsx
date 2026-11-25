// A picture the engine names (a hero, an item, a scenario's cover), found as ContentData.FileToTexture finds it and
// read as the board reads its pictures (host/pictureFiles.ts). Without the file, while it loads, or with a stand-in
// that cannot be fetched, it draws a placeholder. Not ported from Valkyrie.
import { useEffect, useState, useSyncExternalStore } from 'react';
import { ContentData } from '@universalis/engine';
import { devLog } from '../host/devLog.ts';
import { importsVersion, onImportsChanged } from '../host/officialImport.ts';
import { pictureBlob } from '../host/pictureFiles.ts';
import { initials } from './text.ts';

/** Object URLs by resolved file, kept while the app runs: the same picture is drawn many times. */
const urls = new Map<string, Promise<string | null>>();
/** The URLs already made, so that a picture seen before draws at once. */
const made = new Map<string, string | null>();

function pictureUrl(file: string): Promise<string | null> {
  const resolved = ContentData.resolveTextureFile(file);
  if (resolved === null) return Promise.resolve(null);
  let url = urls.get(resolved);
  if (url === undefined) {
    url = pictureBlob(resolved)
      .catch((e: unknown) => {
        console.warn(`Picture not read, ${resolved}: ${String(e)}`);
        return null;
      })
      .then((blob) => {
        const u = blob === null ? null : URL.createObjectURL(blob);
        // Not there yet (offline, or before the import): tried again next time
        if (u === null) urls.delete(resolved);
        else made.set(resolved, u);
        return u;
      });
    urls.set(resolved, url);
  }
  return url;
}

/** Forgets every picture, after an import replaced the files they came from. */
export function forgetPictures(): void {
  for (const url of made.values()) if (url !== null) URL.revokeObjectURL(url);
  made.clear();
  urls.clear();
}

function madeUrl(file: string): string | null {
  if (file.length === 0) return null;
  const resolved = ContentData.resolveTextureFile(file);
  return resolved === null ? null : (made.get(resolved) ?? null);
}

interface PictureProps {
  /** The file as the engine has it, often without extension. */
  file: string;
  /** What it shows, for the placeholder and for screen readers. */
  name: string;
  className?: string;
  /** Next to the name in text, so screen readers skip it. */
  decorative?: boolean;
}

/**
 * A picture on the web, such as a store cover in its author's repository (Valkyrie's ImgAsyncLoader): the browser loads
 * it once it is near the screen, and keeps it in its cache. Until then, or when it cannot be loaded, a placeholder.
 */
export function RemotePicture({ url, name, className, decorative = false }: { url: string } & Omit<PictureProps, 'file'>) {
  const [failed, setFailed] = useState<string | null>(null);
  if (failed !== url) {
    return (
      <img
        className={className}
        src={url}
        alt={decorative ? '' : name}
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={() => {
          devLog('cover', url, 'not loaded');
          setFailed(url);
        }}
      />
    );
  }
  return <Picture file="" name={name} className={className} decorative={decorative} />;
}

/**
 * How long to wait before asking again for a picture that did not come: right after an import, or with the picture
 * decoder busy or restarted, a first try can fail where the next one works (players saw the collection's pictures only
 * after reopening the app, 16 October 2026).
 */
const RETRIES_MS = [1500, 5000];

export function Picture({ file, name, className, decorative = false }: PictureProps) {
  const [url, setUrl] = useState(() => madeUrl(file));
  // A new import changes what the files are: ask again
  const imports = useSyncExternalStore(onImportsChanged, importsVersion);
  useEffect(() => {
    let live = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    setUrl(madeUrl(file));
    const ask = (attempt: number) => {
      void Promise.resolve()
        .then(() => pictureUrl(file))
        .catch(() => null)
        .then((u) => {
          if (!live) return;
          setUrl(u);
          const wait = RETRIES_MS[attempt];
          if (u === null && wait !== undefined) timer = setTimeout(() => ask(attempt + 1), wait);
        });
    };
    if (file.length > 0) ask(0);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [file, imports]);
  if (url !== null) return <img className={className} src={url} alt={decorative ? '' : name} draggable={false} />;
  return (
    <span
      className={`placeholder ${className ?? ''}`}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative ? true : undefined}
    >
      {initials(name)}
    </span>
  );
}
