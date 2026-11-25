// The built app as an installable app (a PWA): its manifest and icons, the service worker that keeps it so that it
// opens without a connection (a game too, with a made-up import of its official content), and a new version that waits
// until the player reloads; and the scenario editor left out, until it is ready, but while it is open to try
// (packages/app/editorPreview.ts), kept too. Runs on the production build (playwright.config.ts serves it with vite
// preview), the only one with a service worker.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import { EDITOR_PREVIEW } from '../editorPreview.ts';
import { importZip, zip } from './fixtures/madeUpImport.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const serviceWorker = join(root, 'dist', 'sw.js');

// Under BASE_PATH when the build is GitHub Pages' (vite.config.ts): BASE_PATH=/valkyrie-universalis/ npm run test:app
test.use({ baseURL: `http://localhost:5197${process.env.BASE_PATH || '/'}`, locale: 'es-ES' });

// Nothing here needs the store or Valkyrie's pictures
test.beforeEach(async ({ context }) => {
  await context.route('https://raw.githubusercontent.com/**', (route) => route.abort());
});

/** Waits until the service worker keeps the app and answers for the page. */
async function kept(page: Page): Promise<void> {
  await page.waitForFunction('navigator.serviceWorker.controller !== null && navigator.serviceWorker.controller.state === "activated"');
}

test('can be installed and opens without a connection', async ({ page, context, isMobile }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Valkyrie Universalis' })).toBeVisible();

  // The manifest the browser installs from, with its icons
  const href = await page.locator('link[rel=manifest]').getAttribute('href');
  const manifest = (await (await page.request.get(href!)).json()) as { name: string; display: string; start_url: string; icons: { src: string; purpose?: string }[] };
  expect(manifest).toMatchObject({ name: 'Valkyrie Universalis', display: 'standalone', start_url: './' });
  expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true);
  for (const icon of manifest.icons) expect((await page.request.get(icon.src)).status()).toBe(200);
  expect((await page.request.get('favicon.ico')).status()).toBe(200);

  // Without a connection, the app the service worker keeps, and a game: imported, as the production build asks
  await importZip(page, 'mom', 'import.zip', zip({ 'import.ini': '[Import]\r\nValkyrie=2\r\nFFG=2.0.3\r\n', 'text/Localization_es.txt': 'KEY,Spanish\r\n' }));
  await kept(page);
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await expect(page.getByRole('button', { name: 'Partida nueva' })).toBeVisible();
  // The scenario editor is only in development builds (App.tsx), until kozka says it is ready, or while it is open to
  // try, and then it opens without a connection too, on a computer
  await expect(page.getByRole('button', { name: 'Editar Escenario' })).toHaveCount(EDITOR_PREVIEW ? 1 : 0);
  if (EDITOR_PREVIEW && !isMobile) {
    await page.getByRole('button', { name: 'Editar Escenario' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Entendido, entrar' }).click();
    await expect(page.getByRole('heading', { name: 'Editar Escenario' })).toBeVisible();
  }
  await context.setOffline(false);
});

test('leaves the scenario editor out until it is ready, unless it is open to try', () => {
  // Neither its code nor its styles nor its texts (editor/): a development build loads them apart, a production one drops
  // them; while it is open to try, it has them
  const assets = join(root, 'dist', 'assets');
  const built = readdirSync(assets).filter((file) => /\.(js|css)$/.test(file));
  expect(built.length).toBeGreaterThan(0);
  const marked = built.filter((file) => ['EDITOR_DEV_ONLY', 'editor-row', 'Importar una carpeta'].some((mark) => readFileSync(join(assets, file), 'utf8').includes(mark)));
  if (EDITOR_PREVIEW) expect(marked.length).toBeGreaterThan(0);
  else expect(marked).toEqual([]);
});

test('offers a new version and reloads into it', async ({ page }) => {
  const original = readFileSync(serviceWorker, 'utf8');
  try {
    await page.goto('./');
    await kept(page);
    // A new build: the same service worker with another version
    writeFileSync(serviceWorker, original.replace(/const VERSION = "([^"]+)"/, 'const VERSION = "$1-new"'));
    await page.evaluate('navigator.serviceWorker.getRegistration().then((registration) => registration.update())');
    await expect(page.getByText('Hay una versión nueva de la app.')).toBeVisible();
    await page.getByRole('button', { name: 'Recargar' }).click();
    await expect(page.getByRole('button', { name: /Las Mansiones de la Locura/ })).toBeVisible();
    await expect(page.getByText('Hay una versión nueva de la app.')).toHaveCount(0);
    // The version before stays, for windows still running it
    const versions = ((await page.evaluate('caches.keys()')) as string[]).filter((key) => key.startsWith('app-'));
    expect(versions).toHaveLength(2);
    expect(versions.at(-1)).toMatch(/-new$/);
  } finally {
    writeFileSync(serviceWorker, original);
  }
});
