// The browser's side of the store: HTTPManager's requests and the downloads of packages, as simple GET requests with
// no headers of ours, because raw.githubusercontent.com refuses CORS preflights (OPTIONS answers 403). GitLab's /-/raw/
// sends no CORS headers, so its files are read through GitLab's repository files API, which does. Nothing goes through
// a server of ours. Not ported from Valkyrie.
import type { HTTPReply } from '@universalis/engine';
import { devLog } from './devLog.ts';
import { readableUrl } from './storeAddress.ts';

/** Not in Valkyrie: how long a list or text may take in all, and a download without a byte, before they are given up. */
const TEXT_TIMEOUT_MS = 30_000;
const DOWNLOAD_IDLE_MS = 45_000;

/** HTTPManager.send: the text of a file, an HTTP error, or null when nothing came back. */
export async function sendText(url: string): Promise<HTTPReply> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TEXT_TIMEOUT_MS);
  try {
    const response = await fetch(readableUrl(url), { signal: controller.signal });
    if (response.status >= 400) {
      devLog('store', url, 'HTTP', response.status);
      return { status: response.status, error: 'HTTP ' + response.status + (response.statusText === '' ? '' : ' ' + response.statusText) };
    }
    const text = await response.text();
    devLog('store', url, text.length, 'characters');
    return { text };
  } catch (error) {
    devLog('store', url, 'network error', String(error));
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * HTTPManager.post: the form of a game's statistics to Valkyrie's Google Form, as Unity's WWWForm sends it
 * (application/x-www-form-urlencoded). Google Forms sends no CORS headers, so the request goes as no-cors, a simple
 * request with no preflight whose reply the page cannot read: only a network error can be told.
 */
export async function postForm(url: string, fields: [string, string][]): Promise<HTTPReply> {
  try {
    await fetch(url, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(fields) });
    devLog('stats', url, 'posted');
    return { text: '' };
  } catch (error) {
    devLog('stats', url, 'network error', String(error));
    return null;
  }
}

/**
 * Downloads a package and tells how far it got: a fraction from 0 to 1, or null while its size is unknown. Gives null
 * when the download failed, as UnityWebRequest's isNetworkError or isHttpError, and, not in Valkyrie, when it came
 * short, stalled for DOWNLOAD_IDLE_MS or `cancel` aborted it.
 */
export async function downloadBytes(
  url: string,
  progress: (fraction: number | null) => void,
  cancel?: AbortSignal,
): Promise<Uint8Array | null> {
  const controller = new AbortController();
  const abort = (): void => controller.abort();
  cancel?.addEventListener('abort', abort);
  if (cancel?.aborted) abort();
  let timer = setTimeout(abort, DOWNLOAD_IDLE_MS);
  try {
    const response = await fetch(readableUrl(url), { signal: controller.signal });
    if (response.status >= 400 || response.body === null) {
      devLog('download', url, 'HTTP', response.status);
      return null;
    }
    const total = Number(response.headers.get('content-length') ?? '');
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
      clearTimeout(timer);
      timer = setTimeout(abort, DOWNLOAD_IDLE_MS);
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      progress(total > 0 ? Math.min(received / total, 1) : null);
    }
    if (total > 0 && received < total) {
      devLog('download', url, 'cut short', received, 'of', total, 'bytes');
      return null;
    }
    const bytes = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    devLog('download', url, received, 'bytes');
    return bytes;
  } catch (error) {
    devLog('download', url, 'network error', String(error));
    return null;
  } finally {
    clearTimeout(timer);
    cancel?.removeEventListener('abort', abort);
  }
}
