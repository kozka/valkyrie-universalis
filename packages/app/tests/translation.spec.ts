// The player's own translation of a scenario (screens/CustomTranslation.tsx, host/customTranslation.ts): loaded from
// its details, what was found in it is said, it is kept, and a game started in its language shows its texts. Not in
// Valkyrie. Needs the downloaded scenarios (node referencias/descargar-escenarios.mjs).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { strToU8, zipSync } from 'fflate';

const scenario = join(import.meta.dirname, '../../../referencias/descargas/MoM/escenarios/ExoticMaterial.valkyrie');

test.use({ locale: 'es-ES' });
test.skip(!existsSync(scenario), 'Missing referencias/descargas: run node referencias/descargar-escenarios.mjs');

const TRANSLATION = zipSync({
  'Mi traduccion/Localization.Spanish.txt': strToU8('.,Spanish\nEventStart.text,Un texto de la traducción propia.\nCONTINUE,Seguir adelante\nOld.key,Nada\n'),
  'Mi traduccion/emlogo.jpg': strToU8('not really a picture'),
  'Mi traduccion/audio/thunder.ogg': strToU8('nor a sound'),
});

test("loads the player's translation of a scenario and plays with it", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One run is enough: the window is the same on a phone');
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await page.locator('input[type=file]').setInputFiles(scenario);
  await page.getByRole('button', { name: /Material exótico/ }).click();

  await page.getByRole('button', { name: 'Mi traducción' }).click();
  const window = page.getByRole('dialog', { name: 'Tu traducción de este escenario' });
  await expect(window).toContainText('No tienes ninguna traducción propia');
  await window.locator('input[type=file]').setInputFiles({ name: 'mi-traduccion.zip', mimeType: 'application/zip', buffer: Buffer.from(TRANSLATION) });
  const report = window.locator('.translation-report');
  await expect(report).toContainText('Lo que se ha encontrado en mi-traduccion.zip');
  await expect(report).toContainText(/Textos traducidos: 2 de \d+\./);
  await expect(report).toContainText('Imágenes que sustituye: 1.');
  await expect(report).toContainText('Sonidos que sustituye: 0.');
  await expect(report).toContainText('1 textos no existen en el escenario');
  await expect(report).toContainText('1 ficheros no sustituyen a ninguno del escenario y no se usarán: audio/thunder.ogg');
  await expect(report).toContainText('El escenario ya viene en español');
  await expect(report).toContainText('Guardada en este dispositivo');
  await expect(window.locator('.translation-kept')).toContainText(/Español: 2 de \d+ textos, 1 imágenes y 0 sonidos \(mi-traduccion\.zip\)/);
  await testInfo.attach('report', { body: await page.screenshot(), contentType: 'image/png' });
  await window.getByRole('button', { name: 'Cerrar' }).click();

  // A game in Spanish shows the translation's texts where the scenario had its own
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await page.locator('.hero-choice').nth(0).click();
  await page.locator('.hero-choice').nth(1).click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  await expect(page.getByRole('heading', { name: 'Objetos' })).toBeVisible();
  await page.getByRole('button', { name: 'Terminado' }).click();
  await expect(page.locator('.event-text')).toContainText('Un texto de la traducción propia.');
  await expect(page.locator('.event-button')).toHaveText('Seguir adelante');
  expect(errors).toEqual([]);
});

test('offers to switch to the language of a translation into another one', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One run is enough: the window is the same on a phone');
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await page.locator('input[type=file]').setInputFiles(scenario);
  await page.getByRole('button', { name: /Material exótico/ }).click();

  await page.getByRole('button', { name: 'Mi traducción' }).click();
  const window = page.getByRole('dialog', { name: 'Tu traducción de este escenario' });
  const french = zipSync({ 'Localization.French.txt': strToU8('.,French\nEventStart.text,Un texte de ma traduction.\n') });
  await window.locator('input[type=file]').setInputFiles({ name: 'francais.zip', mimeType: 'application/zip', buffer: Buffer.from(french) });
  await expect(window.locator('.translation-report')).toContainText('Está en francés y juegas en español');
  const offer = window.locator('.translation-switch');
  await expect(offer).toContainText('¿Cambiar ahora la app al francés?');
  // Not now: the offer goes, the app stays in Spanish, and the kept translation keeps its own button
  await offer.getByRole('button', { name: 'Seguir en español' }).click();
  await expect(offer).toHaveCount(0);
  await expect(window.locator('.translation-kept').getByRole('button', { name: 'Cambiar a francés' })).toBeVisible();

  // Now: the app and the window turn French, kept in config.ini as the Options would
  await window.locator('.translation-kept').getByRole('button', { name: 'Cambiar a francés' }).click();
  const fenetre = page.getByRole('dialog', { name: 'Votre traduction de ce scénario' });
  await expect(fenetre).toBeVisible();
  await expect(fenetre.locator('.translation-kept').getByRole('button')).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  expect(errors).toEqual([]);
});
