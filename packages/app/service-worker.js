// The app's service worker: it keeps the built app in the browser, so that it opens without a connection. vite.config.ts
// writes it into the build with the list of files and a version made from their contents; in development there is
// none. Requests to other sites (the store, the authors' repositories, Valkyrie's pictures) go to the network as
// always. A new version waits until the page asks it to take over (host/pwa.ts). Not ported from Valkyrie.
const VERSION = '__VERSION__';
const FILES = __FILES__;
const CACHE = 'app-' + VERSION;
// The app's music, kept across versions: its files are named by their contents. Not 'app-', which activate clears
const MUSIC_CACHE = 'universalis-music';
const INDEX = new URL('index.html', self.location).href;

// The fonts' alphabets left out of the list (vite.config.ts), kept the first time a page needs them. Named by their
// contents and the same across versions: not 'app-', which activate clears
const FONT_CACHE = 'universalis-fonts';
// The Ogg decoder, left out of the list too: only browsers that cannot read Ogg (Safari before 26) ask for it
const DECODER_CACHE = 'universalis-decoders';

/** Whether a file is named by its contents: Vite writes all of assets/ that way (name-hash.ext), so the same name is the same file. */
function named(file) {
  return file.startsWith('assets/');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // A new version only downloads what changed: a file named by its contents that a version before keeps is copied
      // from it. The others (index.html, base-data.zip, the icons) are downloaded again, as always
      const before = (await caches.keys()).filter((key) => key.startsWith('app-') && key !== CACHE).reverse();
      const download = [];
      for (const file of FILES) {
        const url = new URL(file, self.location).href;
        let kept;
        if (named(file)) {
          for (const key of before) {
            kept = await (await caches.open(key)).match(url, { ignoreVary: true });
            if (kept !== undefined) break;
          }
        }
        if (kept !== undefined) await cache.put(url, kept);
        else download.push(url);
      }
      await cache.addAll(download);
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        // The version before stays, for the windows still running it, whose scripts load parts of it later
        const old = keys.filter((key) => key.startsWith('app-') && key !== CACHE);
        return Promise.all(old.slice(0, -1).map((key) => caches.delete(key)));
      })
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'take-over') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      // Whatever the server's Vary says: these files are the same for every request (Vite's preview varies by Origin,
      // which module scripts send and the worker's own requests do not)
      const options = { ignoreVary: true };
      // The app has one page: any address of it opens this version's index.html
      if (request.mode === 'navigate') return (await cache.match(INDEX, options)) ?? fetch(request);
      const kept = (await cache.match(request, options)) ?? (await caches.match(request, options));
      if (kept !== undefined) return kept;
      const response = await fetch(request);
      // The app's music, the fonts' other alphabets and the Ogg decoder are left out of the list (vite.config.ts): kept
      // the first time they are needed
      const path = new URL(request.url).pathname;
      if (response.status === 200 && path.endsWith('.mp3')) await (await caches.open(MUSIC_CACHE)).put(request, response.clone());
      if (response.ok && path.endsWith('.woff2')) await (await caches.open(FONT_CACHE)).put(request, response.clone());
      if (response.ok && /\/assets\/oggDecoder-[^/]*\.js$/.test(path)) {
        await (await caches.open(DECODER_CACHE)).put(request, response.clone());
      }
      return response;
    })(),
  );
});
