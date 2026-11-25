import { createHash } from 'node:crypto';
import { appendFileSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { zipSync } from 'fflate';
import { defineConfig, type Plugin } from 'vite';
import { EDITOR_PREVIEW } from './editorPreview.ts';

const appDir = dirname(fileURLToPath(import.meta.url));
const dataDir = join(appDir, '..', 'engine', 'data');
/** The app's version, shown on its first screen. */
const version = (JSON.parse(readFileSync(join(appDir, 'package.json'), 'utf8')) as { version: string }).version;

/**
 * Valkyrie's base data (the .ini and .txt files that tools/sync-valkyrie-data.mjs copied, Apache-2.0) as one zip
 * that the app reads when it starts: base-data.zip, with manifest.json. Its pictures are not in it.
 */
function baseData(): Plugin {
  const build = (): Uint8Array => {
    const manifestBytes = readFileSync(join(dataDir, 'manifest.json'));
    const manifest = JSON.parse(manifestBytes.toString('utf8')) as { files: { path: string }[] };
    const files: Record<string, Uint8Array> = { 'manifest.json': manifestBytes };
    for (const file of manifest.files) files[file.path] = readFileSync(join(dataDir, ...file.path.split('/')));
    return zipSync(files, { level: 9 });
  };
  return {
    name: 'valkyrie-base-data',
    configureServer(server) {
      server.middlewares.use('/base-data.zip', (_request, response) => {
        response.setHeader('Content-Type', 'application/zip');
        response.end(build());
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'base-data.zip', source: build() });
    },
  };
}

/** In development, where host/devLog.ts writes: packages/app/dev.log, which git ignores. */
function devLog(): Plugin {
  const file = join(dirname(fileURLToPath(import.meta.url)), 'dev.log');
  return {
    name: 'universalis-dev-log',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__dev-log', (request, response) => {
        let body = '';
        request.setEncoding('utf8');
        request.on('data', (chunk: string) => (body += chunk));
        request.on('end', () => {
          appendFileSync(file, `${new Date().toISOString()} ${body}\n`);
          response.end();
        });
      });
    },
  };
}

/** The files below a folder, as paths relative to it with '/'. */
function filesBelow(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split('\\').join('/'));
}

/**
 * Whether the service worker keeps a built file from the start, so that the app opens without a connection: all but
 * the .woff fonts, since every browser with service workers reads .woff2; the font's alphabets other than Latin
 * (Cyrillic, Greek, Vietnamese), which the browser only asks for when a text needs them (their @font-face unicode-range)
 * and the service worker keeps then; the app's music (.mp3, several MB), kept the first time it plays; and the Ogg
 * decoder (audio/oggDecoder.ts), which only browsers that cannot read Ogg load, kept then.
 */
function precached(file: string): boolean {
  if (file === 'sw.js' || file.endsWith('.woff') || file.endsWith('.mp3')) return false;
  if (/^assets\/oggDecoder-/.test(file)) return false;
  return !file.endsWith('.woff2') || /-latin(-ext)?-/.test(file);
}

/**
 * The service worker (service-worker.js), written into the build as sw.js with the files it keeps (precached). Its
 * version comes from their contents, so any change makes a new one; a new version only downloads the files that changed.
 */
function serviceWorker(): Plugin {
  let outDir = '';
  return {
    name: 'universalis-service-worker',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const files = filesBelow(outDir).filter(precached).sort();
      const hash = createHash('sha256');
      for (const file of files) hash.update(file).update(readFileSync(join(outDir, ...file.split('/'))));
      const worker = readFileSync(join(appDir, 'service-worker.js'), 'utf8')
        .replace("'__VERSION__'", JSON.stringify(`${version}-${hash.digest('hex').slice(0, 12)}`))
        .replace('__FILES__', JSON.stringify(files));
      writeFileSync(join(outDir, 'sw.js'), worker);
    },
  };
}

export default defineConfig({
  // Where the app lives: / on Vercel and in development, /<repository>/ on GitHub Pages (.github/workflows/pages.yml)
  base: process.env.BASE_PATH || '/',
  plugins: [react(), baseData(), devLog(), serviceWorker()],
  define: { __APP_VERSION__: JSON.stringify(version), __EDITOR_PREVIEW__: JSON.stringify(EDITOR_PREVIEW) },
  // Always the same address: the browser keeps the player's data (OPFS) per origin, port included
  server: { port: 5173, strictPort: true },
  // The built site goes to the repository's dist/, where Vercel looks for it whatever its settings say. The app is one
  // script of about 1 MB (PixiJS, React and the engine), which the service worker keeps: no warning for its size
  build: { outDir: join(appDir, '..', '..', 'dist'), emptyOutDir: true, chunkSizeWarningLimit: 1500 },
});
