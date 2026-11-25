// The start screen and the app's own options in a real browser: the games, open without their official import; the
// version under the title; the app's colour, the felt under the board and the board's lean chosen in Options, kept in
// config.ini and laid again when the app starts; the languages, named in the language being read, and the app's own
// texts following them; the sizes of the text and of the tokens and the advanced switches (docs/peticiones.md); and the
// backup of what the app keeps, downloaded and put back. Options are reached through a
// game, in the tests' schematic mode (?schematic).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import { strToU8, unzipSync, zipSync } from 'fflate';
import { pick } from './fixtures/options.ts';

const app = join(dirname(fileURLToPath(import.meta.url)), '..');
const version = (JSON.parse(readFileSync(join(app, 'package.json'), 'utf8')) as { version: string }).version;

test.use({ locale: 'es-ES' });

// Nothing here needs the network: the store and Valkyrie's pictures stay out of reach
test.beforeEach(async ({ page }) => {
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
});

async function openOptions(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Opciones' }).click();
  await expect(page.getByRole('heading', { name: 'Opciones', exact: true })).toBeVisible();
}

/** The size of a file the app keeps in the browser (host/storage.ts), or 0 while it is not there. */
async function keptSize(page: Page, path: string): Promise<number> {
  return page.evaluate(`(async () => {
    const names = ${JSON.stringify(['vfs', ...path.split('/')])};
    try {
      let dir = await navigator.storage.getDirectory();
      for (const name of names.slice(0, -1)) dir = await dir.getDirectoryHandle(name);
      return (await (await dir.getFileHandle(names[names.length - 1])).getFile()).size;
    } catch {
      return 0;
    }
  })()`);
}

/** Adds a scenario file, as a player copies one into Valkyrie's Download folder: one Valkyrie would read (scenarioPackage.ts). */
async function addScenario(page: Page, name: string): Promise<void> {
  await page.getByRole('button', { name: 'Volver', exact: true }).click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await page.locator('.list-tools input[type=file]').setInputFiles({ name, mimeType: 'application/zip', buffer: Buffer.from(zipSync({ 'quest.ini': strToU8('[Quest]\nformat=21\ntype=MoM\n\n[QuestText]\n') })) });
  await expect.poll(() => keptSize(page, `AppData/Valkyrie/Download/${name}`)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Volver', exact: true }).click();
  await page.getByRole('button', { name: 'Opciones' }).click();
}

test("draws the games' buttons in their frames", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  // Drawn with PixiJS on a canvas under the buttons, which keep their texts
  const games = page.locator('nav.games');
  await expect(games).toHaveAttribute('data-art', 'drawn');
  await expect(games.locator('.games-art canvas')).toHaveCount(1);
  // Behind them, kozka's picture: alive on a wide screen, still on a phone
  await expect(page.locator('.backdrop canvas')).toHaveCount(testInfo.project.name === 'desktop' ? 1 : 0);
  const mom = page.getByRole('button', { name: 'Las Mansiones de la Locura: Segunda Edición' });
  const d2e = page.getByRole('button', { name: /Descent/ });
  // DooM's, Descent's with its pack, named by its title drawing
  const doom = page.getByRole('button', { name: 'DooM', exact: true });
  // Not as in Valkyrie, which greys them: open without their official import, which only playing asks for (ImportGate.tsx)
  await expect(mom).toBeEnabled();
  await expect(d2e).toBeEnabled();
  await expect(doom).toBeEnabled();
  // Each frame keeps its picture's shape
  const box = (await mom.boundingBox())!;
  expect(box.width / box.height).toBeCloseTo(746 / 150, 1);
  const box2 = (await d2e.boundingBox())!;
  expect(box2.width / box2.height).toBeCloseTo(1000 / 248, 1);
  const box3 = (await doom.boundingBox())!;
  expect(box3.width / box3.height).toBeCloseTo(661 / 136, 1);
  await page.waitForTimeout(500);
  await page.screenshot({ path: testInfo.outputPath('01-games-no-import.png') });

  // The tests' schematic mode, which plays them without it
  await page.goto('/?schematic');
  await expect(games).toHaveAttribute('data-art', 'drawn');
  await expect(mom).toBeEnabled();
  await expect(d2e).toBeEnabled();
  await expect(doom).toBeEnabled();
  await mom.hover();
  await page.waitForTimeout(800);
  await page.screenshot({ path: testInfo.outputPath('01-games.png') });
  // DooM's cells charged under the pointer
  await doom.hover();
  await page.waitForTimeout(800);
  await page.screenshot({ path: testInfo.outputPath('01-games-doom.png') });
  // Leaving the screen takes the drawing with it
  await mom.click();
  await expect(page.getByRole('button', { name: 'Opciones' })).toBeVisible();
  await expect(page.locator('.games-art canvas')).toHaveCount(0);
  expect(errors).toEqual([]);
});

/** A colour role of the theme as the page has it now. */
async function role(page: Page, name: string): Promise<string> {
  return page.evaluate(`getComputedStyle(document.documentElement).getPropertyValue(${JSON.stringify(name)}).trim()`);
}

test('shows the version and keeps the theme, the felt and the board tilt', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const themes = page.getByRole('combobox', { name: 'Tema' });
  const felts = page.getByRole('combobox', { name: 'Tapete del tablero' });
  const tilts = page.getByRole('combobox', { name: 'Inclinación del tablero' });

  await page.goto('/?schematic');
  await expect(page.getByText(`Versión ${version}`)).toBeVisible();
  // The Universalis theme, on black, with the felt pure black and the board leaning as Valkyrie's, until the player
  // chooses otherwise
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'universalis');
  await expect(page.locator('html')).toHaveAttribute('data-felt', 'pure');
  expect(await role(page, '--table')).toBe('#000000');
  expect(await role(page, '--table-grain')).toBe('0');
  const black = await role(page, '--background');

  await openOptions(page);
  await expect(themes.locator('option:checked')).toHaveText('Universalis (ilustrado)');
  await expect(felts.locator('option:checked')).toHaveText('Negro puro');
  await expect(tilts.locator('option:checked')).toHaveText('Como en Valkyrie (10°)');
  // The felt is the board's only: the app keeps its colour
  await pick(felts, 'Verde');
  await pick(tilts, 'Como una mesa (30°)');
  await expect(page.locator('html')).toHaveAttribute('data-felt', 'green');
  expect(await role(page, '--background')).toBe(black);
  expect(await role(page, '--table')).not.toBe(black);
  expect(await role(page, '--table-grain')).toBe('1');
  // And the app's colour is not the felt's
  await pick(themes, 'Azul');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'blue');
  expect(await role(page, '--background')).not.toBe(black);
  await expect(page.locator('meta[name=theme-color]')).toHaveAttribute('content', await role(page, '--background'));
  await expect(themes.locator('option:checked')).toHaveText('Azul');
  await expect(felts.locator('option:checked')).toHaveText('Verde');
  await expect(tilts.locator('option:checked')).toHaveText('Como una mesa (30°)');
  await page.screenshot({ path: testInfo.outputPath('01-options.png'), fullPage: true });

  // Written to the browser's storage in the background, and laid again when the app starts
  await page.waitForTimeout(1000);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'blue');
  await expect(page.locator('html')).toHaveAttribute('data-felt', 'green');
  await openOptions(page);
  await expect(themes.locator('option:checked')).toHaveText('Azul');
  await expect(felts.locator('option:checked')).toHaveText('Verde');
  await expect(tilts.locator('option:checked')).toHaveText('Como una mesa (30°)');
  expect(errors).toEqual([]);
});

test('sizes the text and the tokens, and keeps the advanced switches', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const sizes = page.getByRole('combobox', { name: 'Tamaño del texto' });
  const pieces = page.getByRole('combobox', { name: 'Tamaño de las fichas del tablero' });
  const items = page.getByRole('combobox', { name: 'Tamaño de los objetos' });
  const confirm = page.getByRole('switch', { name: 'Preguntar antes de terminar la fase de investigadores' });
  const cursor = page.getByRole('switch', { name: 'Ocultar el puntero del ratón' });
  const rootSize = () => page.evaluate<string>('getComputedStyle(document.documentElement).fontSize');

  await page.goto('/?schematic');
  await openOptions(page);
  const normal = await rootSize();
  await expect(sizes.locator('option:checked')).toHaveText('Normal');
  await expect(items.locator('option:checked')).toHaveText('Normal');
  // The text grows everywhere, as every size is in rem
  await pick(sizes, 'Muy grande');
  expect(parseFloat(await rootSize())).toBeCloseTo(parseFloat(normal) * 1.3, 1);
  // The items large, with the name beside the picture
  await pick(items, 'Grande');
  await expect(page.locator('html')).toHaveAttribute('data-item-size', 'large');

  // The advanced options are folded, and all off: a game plays as in Valkyrie
  await expect(confirm).toBeHidden();
  await page.getByText('Opciones avanzadas').click();
  await expect(pieces.locator('option:checked')).toHaveText('Normal');
  await pick(pieces, 'Grande (+30 %)');
  await expect(confirm).not.toBeChecked();
  await confirm.check();
  await cursor.check();
  await expect(page.locator('html')).toHaveAttribute('data-hide-cursor', '');
  if (testInfo.project.name === 'desktop') {
    // Two columns on a wide screen: the look beside the language
    const language = await page.getByRole('combobox', { name: 'Idioma' }).boundingBox();
    const theme = await page.getByRole('combobox', { name: 'Tema' }).boundingBox();
    expect(theme!.x).toBeGreaterThan(language!.x + 200);
    expect(Math.abs(theme!.y - language!.y)).toBeLessThan(20);
  }
  await page.screenshot({ path: testInfo.outputPath('02-options-sizes.png'), fullPage: true });

  await page.waitForTimeout(1000);
  await page.reload();
  await expect.poll(async () => parseFloat(await rootSize())).toBeCloseTo(parseFloat(normal) * 1.3, 1);
  await openOptions(page);
  await expect(items.locator('option:checked')).toHaveText('Grande');
  await page.getByText('Opciones avanzadas').click();
  await expect(pieces.locator('option:checked')).toHaveText('Grande (+30 %)');
  await expect(confirm).toBeChecked();
  await cursor.uncheck();
  await expect(page.locator('html')).not.toHaveAttribute('data-hide-cursor');

  // The voice: the browser's, or off, and then the cards have no speaker
  const voice = page.getByRole('combobox', { name: 'Voz para leer en voz alta' });
  await expect(voice.locator('option:checked')).toHaveText('La del navegador');
  await pick(voice, 'Desactivada');
  await expect(page.getByRole('button', { name: 'Probar la voz' })).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('03-options-voice.png'), fullPage: true });
  await pick(voice, 'La del navegador');

  // Everything back as it came, once confirmed
  await page.getByRole('button', { name: 'Restablecer opciones predeterminadas' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Restablecer opciones predeterminadas' }).click();
  await expect(sizes.locator('option:checked')).toHaveText('Normal');
  await expect(items.locator('option:checked')).toHaveText('Normal');
  await expect(confirm).not.toBeChecked();
  expect(parseFloat(await rootSize())).toBeCloseTo(parseFloat(normal), 1);
  expect(errors).toEqual([]);
});

test('names the languages in the one being read, and its own texts follow it', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?schematic');
  await openOptions(page);
  const languages = page.getByRole('combobox', { name: 'Idioma' });
  // Each in Spanish, and in its own language too
  await expect(languages.locator('option:checked')).toHaveText('Español');
  await expect(languages.locator('option', { hasText: 'Alemán · Deutsch' })).toHaveCount(1);
  await expect(languages.locator('option', { hasText: 'Japonés · 日本語' })).toHaveCount(1);

  // Valkyrie's texts and the app's change together, in every language Valkyrie has
  await pick(languages, /^Francés/);
  await expect(page.getByRole('combobox', { name: 'Langue' })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Tapis du plateau' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Télécharger une sauvegarde' })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Langue' }).locator('option:checked')).toHaveText('Français');
  await pick(page.getByRole('combobox', { name: 'Langue' }), /^Allemand/);
  await expect(page.getByRole('combobox', { name: 'Sprache' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sicherung' })).toBeVisible();
  await pick(page.getByRole('combobox', { name: 'Sprache' }), /^Spanisch/);
  await expect(page.getByRole('heading', { name: 'Copia de seguridad' })).toBeVisible();
  // The page says its language, and asks browsers not to translate it: a translator changing React's texts under it
  // broke the page at the next change of language (Firefox, 19 October 2026)
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('html')).toHaveAttribute('translate', 'no');
  await expect(page.locator('meta[name=google]')).toHaveAttribute('content', 'notranslate');
  expect(errors).toEqual([]);
});

test('downloads a backup of what it keeps and puts it back', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const felts = page.getByRole('combobox', { name: 'Tapete del tablero' });
  await page.goto('/?schematic');
  await openOptions(page);
  await pick(felts, 'Verde');
  await addScenario(page, 'Kept.valkyrie');

  // The backup: what it is for, and a zip that says what it is first
  await expect(page.getByText(/Una copia de seguridad lo reúne en un fichero/)).toBeVisible();
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar una copia' }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toMatch(/^valkyrie-universalis-\d{4}-\d\d-\d\d\.zip$/);
  const backup = testInfo.outputPath('backup.zip');
  await download.saveAs(backup);
  await expect(page.getByText(/^Copia descargada: \d+ MB\.$/)).toBeVisible();
  const entries = Object.keys(unzipSync(readFileSync(backup)));
  expect(entries[0]).toBe('universalis-backup.json');
  expect(entries).toEqual(expect.arrayContaining(['AppData/Valkyrie/config.ini', 'AppData/Valkyrie/Download/Kept.valkyrie']));
  await page.screenshot({ path: testInfo.outputPath('01-backup.png'), fullPage: true });

  // Changes after the backup go when it is put back, and the app starts again with what it kept
  await pick(felts, 'Azul');
  await addScenario(page, 'Later.valkyrie');
  await page.locator('.backup input[type=file]').setInputFiles(backup);
  await expect(page.getByText('Todo lo que guarda la app en este navegador se sustituirá por lo que hay en backup.zip. ¿Seguimos?')).toBeVisible();
  await page.getByRole('button', { name: 'Restaurar', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-felt', 'green');
  await expect(page.getByRole('button', { name: /Las Mansiones de la Locura/ })).toBeVisible();
  expect(await keptSize(page, 'AppData/Valkyrie/Download/Kept.valkyrie')).toBeGreaterThan(0);
  expect(await keptSize(page, 'AppData/Valkyrie/Download/Later.valkyrie')).toBe(0);

  // A zip that is not a backup changes nothing
  await openOptions(page);
  await page.locator('.backup input[type=file]').setInputFiles({ name: 'other.zip', mimeType: 'application/zip', buffer: Buffer.from(zipSync({ 'notes.txt': strToU8('hi') })) });
  await page.getByRole('button', { name: 'Restaurar', exact: true }).click();
  await expect(page.getByText('Este fichero no es una copia de Valkyrie Universalis.')).toBeVisible();
  expect(await keptSize(page, 'AppData/Valkyrie/Download/Kept.valkyrie')).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
