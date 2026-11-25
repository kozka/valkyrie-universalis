// The official import in a real browser: without it, not as in Valkyrie, the game opens and only playing asks for it,
// coming back to the scenario afterwards. A zip of Valkyrie's import folder, made up here with no official content (a
// free font stands in for the official ones), is refused without its import.ini, then copied into the browser, kept
// after a reload and used: its texts name the investigators, its pictures show them and the board's tiles, and its
// fonts set the titles. An import made on Android, with PVR pictures, draws them too.
// Needs the downloaded scenarios (node referencias/descargar-escenarios.mjs).
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import type { BoardProbe } from '../src/board/probe.ts';
import { dds, importZip, pvr, zip } from './fixtures/madeUpImport.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const scenario = join(root, 'referencias/descargas/MoM/escenarios/ExoticMaterial.valkyrie');
const valkyrie = join(root, 'referencias/valkyrie');

test.use({ locale: 'es-ES' });
test.skip(!existsSync(scenario), 'Missing referencias/descargas: run node referencias/descargar-escenarios.mjs');

// Valkyrie's own pictures are not what these tests look at: the board draws them as schematics. Its fonts are served
// from the local clone, as Valkyrie loads them from its Resources
test.beforeEach(async ({ page }) => {
  await page.route('https://raw.githubusercontent.com/**', async (route) => {
    const path = decodeURIComponent(new URL(route.request().url()).pathname.split('/').slice(4).join('/'));
    const file = join(valkyrie, path);
    if (path.includes('/Resources/Fonts/') && existsSync(file)) await route.fulfill({ path: file, headers: { 'access-control-allow-origin': '*' } });
    else await route.abort();
  });
});

/** The tiles Exotic Material shows, as the official import names their pictures. */
const TILES = ['Basement', 'Park_Pond', 'Root_Cellar', 'Storefront', 'Street_Corner_1', 'Town_Square', 'Warehouse', 'Yard_2'].map((name) => `Tile_${name}_MAD20`);

type Probed = { universalisBoard?: BoardProbe };

/** From the investigators of Exotic Material to its board: two of them, the starting items and its first events. */
async function playToBoard(page: Page): Promise<void> {
  const heroes = page.locator('.hero-choice');
  await heroes.nth(0).click();
  await heroes.nth(1).click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  for (let i = 0; i < 10 && (await page.locator('.dialog-layer .event-button:enabled').count()) > 0; i++) {
    await page.locator('.dialog-layer .event-button:enabled').first().click();
  }
}

/** Whether every tile on the board shows its picture, not a schematic. */
const tilesPictured = (page: Page) =>
  page.evaluate(() => {
    const board = (globalThis as unknown as Probed).universalisBoard;
    const tiles = board?.tiles() ?? [];
    return tiles.length > 0 && tiles.every((tile) => board!.pictured().includes(tile));
  });

test('imports a zip of Valkyrie\'s import folder, keeps it and uses it', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  const mom = page.getByRole('button', { name: /Las Mansiones de la Locura/ });
  const momImport = page.locator('[data-section=mom]').getByRole('button', { name: /Importar datos|Reimportar datos/ });
  // Not as in Valkyrie, which greys it: without its import the game opens, and its scenarios can be looked at
  await expect(momImport).toHaveText('Importar datos');
  await mom.click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await page.locator('input[type=file]').setInputFiles(scenario);
  await page.getByRole('button', { name: /Material exótico/ }).click();

  // Playing asks for it
  const start = page.getByRole('button', { name: 'Iniciar' });
  await start.click();
  const gate = page.getByRole('alertdialog');
  await expect(gate).toContainText('Para jugar, Universalis necesita el contenido que Valkyrie importó');
  await gate.getByRole('button', { name: 'Cancelar' }).click();
  await expect(gate).toHaveCount(0);
  await start.click();
  await gate.getByRole('button', { name: 'Importar datos' }).click();

  // A zip without import.ini is not an import, and Back goes back to the scenario
  await expect(page.getByRole('heading', { name: 'Importar contenido del juego' })).toBeVisible();
  await page.locator('input[accept*=zip]').setInputFiles({ name: 'otro.zip', mimeType: 'application/zip', buffer: zip({ 'readme.txt': 'x' }) });
  await expect(page.getByRole('alert')).toContainText('No hay ningún import.ini');
  await page.getByRole('button', { name: 'Volver' }).click();
  await expect(page.getByRole('heading', { name: 'Material exótico' })).toBeVisible();

  // The import, and back to the scenario, which now starts
  const official = zip({
    'import/import.ini': '[Import]\r\nValkyrie=2\r\nFFG=2.0.3\r\n',
    'import/text/Localization_es.txt': 'KEY,Spanish\r\nINVESTIGATOR_AGATHA_CRANE,Agatha Crane (importada)\r\n',
    'import/text/Localization_en.txt': 'KEY,English\r\nINVESTIGATOR_AGATHA_CRANE,Agatha Crane (imported)\r\n',
    'import/img/Circle_Investigator_Agatha_Crane.dds': dds(64),
    ...Object.fromEntries(TILES.map((tile) => [`import/img/${tile}.dds`, dds(64)])),
  });
  await start.click();
  await gate.getByRole('button', { name: 'Importar datos' }).click();
  await page.locator('input[accept*=zip]').setInputFiles({ name: 'import.zip', mimeType: 'application/zip', buffer: official });
  await expect(page.getByText('Importación completada con éxito.')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await start.click();
  await expect(page.locator('.hero-choice').filter({ hasText: 'Agatha Crane (importada)' })).toBeVisible();

  // Kept in the browser, and only this game's
  await page.reload();
  await expect(momImport).toHaveText('Reimportar datos');
  await expect(page.locator('[data-section=d2e]').getByRole('button', { name: 'Importar datos' })).toBeVisible();

  // Its texts and pictures are the import's; its fonts, Valkyrie's own, from its Resources (an import made on Android
  // has none), with the glyphs of its skills
  await mom.click();
  await expect(page.locator('html')).toHaveAttribute('data-official-fonts', /MoM/);
  await expect(page.getByRole('heading').first()).toHaveCSS('font-family', /Old Newspaper Types/);
  // The scenario added before the import is kept too
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await page.getByRole('button', { name: /Material exótico/ }).click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await expect(page.locator('.hero-choice').filter({ hasText: 'Agatha Crane (importada)' }).locator('img')).toBeVisible();
  await playToBoard(page);
  await expect.poll(() => tilesPictured(page)).toBe(true);
  expect(errors).toEqual([]);
});

test('draws the pictures of an import made on Android, in PVR', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  const android = zip({
    'import/import.ini': '[Import]\r\nValkyrie=2\r\nFFG=2.0.3\r\n',
    'import/text/Localization_es.txt': 'KEY,Spanish\r\nINVESTIGATOR_AGATHA_CRANE,Agatha Crane\r\n',
    'import/img/Circle_Investigator_Agatha_Crane.pvr': pvr(64),
    ...Object.fromEntries(TILES.map((tile) => [`import/img/${tile}.pvr`, pvr(64)])),
  });
  await importZip(page, 'mom', 'import_mom.zip', android);
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await page.locator('input[type=file]').setInputFiles(scenario);
  await page.getByRole('button', { name: /Material exótico/ }).click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await expect(page.locator('.hero-choice').filter({ hasText: 'Agatha Crane' }).locator('img')).toBeVisible();
  await playToBoard(page);
  await expect.poll(() => tilesPictured(page)).toBe(true);
  expect(errors).toEqual([]);
});

test('imports the import folder itself, chosen on a computer', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Phones and tablets give a zip');
  const folder = join(mkdtempSync(join(tmpdir(), 'universalis-')), 'import');
  mkdirSync(join(folder, 'img'), { recursive: true });
  writeFileSync(join(folder, 'import.ini'), '[Import]\r\nValkyrie=2\r\nFFG=2.0.3\r\n');
  writeFileSync(join(folder, 'img', 'Circle_Investigator_Agatha_Crane.dds'), dds(64));
  await page.goto('/');
  const momImport = page.locator('[data-section=mom]').getByRole('button', { name: /Importar datos|Reimportar datos/ });
  await momImport.click();
  await page.locator('input[webkitdirectory]').setInputFiles(folder);
  await expect(page.getByText('Importación completada con éxito.')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(momImport).toHaveText('Reimportar datos');
  await expect(page.getByRole('button', { name: /Las Mansiones de la Locura/ })).toBeEnabled();
});
