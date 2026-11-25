// The store in a real browser, with the network stood in for: the Mansions list is the store's own (the clone in
// referencias), its scenarios come from referencias/descargas, and its one community pack is a small one made here.
// The list shows covers and statistics, and its filters hide what needs a missing expansion or is in no chosen language;
// Exotic Material is downloaded, kept after a reload, opened and also listed offline; the pack is downloaded, added to
// the collection and deleted; and without the store the list is the local one. Without official content, in the tests'
// schematic mode (?schematic).
// Needs the clones and the downloaded scenarios (node referencias/clonar.mjs, node referencias/descargar-escenarios.mjs).
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import { strToU8, unzipSync, zipSync } from 'fflate';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const storeList = join(root, 'referencias/valkyrie-store/MoM/manifestDownload.ini');
const scenarios = join(root, 'referencias/descargas/MoM/escenarios');

const LIST = 'https://raw.githubusercontent.com/NPBruce/valkyrie-store/master/MoM/manifestDownload.ini';
const PACK_LIST = 'https://raw.githubusercontent.com/NPBruce/valkyrie-store/refs/heads/master/MoM/contentPacksManifestDownload.ini';
const PACK_URL = 'https://raw.githubusercontent.com/someone/test-pack/main/';

test.use({ locale: 'es-ES' });
test.skip(!existsSync(storeList) || !existsSync(scenarios), 'Missing referencias: run node referencias/clonar.mjs and descargar-escenarios.mjs');

/** A 1×1 PNG, for every cover. */
const COVER = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

/** A community pack of tiles for Mansions, the way TLE is made, with nothing in it. */
const PACK = zipSync({
  'content_pack.ini': strToU8('[ContentPack]\nname=Test pack\nid=TST\ntype=MoMCustom\ndescription=A pack for the tests\n'),
});

const CORS = { 'access-control-allow-origin': '*' };

/** The store: its lists, the scenarios of referencias/descargas, the test pack, and a picture for every cover. */
async function serveStore(page: Page): Promise<string[]> {
  const downloads: string[] = [];
  await page.route('https://raw.githubusercontent.com/**', async (route) => {
    const url = route.request().url();
    const file = decodeURIComponent(url.split('/').pop()!);
    if (url === LIST) return route.fulfill({ body: readFileSync(storeList), headers: CORS });
    if (url === PACK_LIST) {
      const list = `[TST]\ntype=MoMCustom\ndefaultlanguage=English\nimage=icon.png\nversion=2\nname.English=Test pack\nname.Spanish=Pack de prueba\ndescription.English=A pack for the tests.\ndescription.Spanish=Un pack para las pruebas.\nurl=${PACK_URL}\n`;
      return route.fulfill({ body: list, headers: CORS });
    }
    if (url === PACK_URL + 'TST.valkyrieContentPack') {
      downloads.push(file);
      return route.fulfill({ body: Buffer.from(PACK), headers: CORS });
    }
    if (file.endsWith('.valkyrie') && existsSync(join(scenarios, file))) {
      downloads.push(file);
      return route.fulfill({ path: join(scenarios, file), headers: CORS });
    }
    if (/\.(png|jpe?g)$/i.test(file)) return route.fulfill({ body: COVER, contentType: 'image/png', headers: CORS });
    return route.abort();
  });
  return downloads;
}

async function openQuestList(page: Page): Promise<void> {
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await expect(page.getByRole('heading', { name: 'Selección de Escenario' })).toBeVisible();
}

test('downloads a scenario of the store and keeps it', async ({ page }, testInfo) => {
  const shot = (name: string) => page.screenshot({ path: testInfo.outputPath(`${name}.png`) });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const downloads = await serveStore(page);

  await openQuestList(page);
  // The store's list, online, sorted by rating from high to low
  await expect(page.getByRole('button', { name: 'DESCONECTARSE' })).toBeVisible();
  await expect(page.locator('.count')).toHaveText(/^\d+ escenarios$/);
  const count = Number((await page.locator('.count').textContent())!.split(' ')[0]);
  expect(count).toBeGreaterThan(150);
  await expect(page.locator('.quest img').first()).toBeVisible();
  await shot('01-store');

  // The filter window, as Valkyrie's: each choice kept in config.ini, the list drawn again with Ok. With no expansion
  // in the collection, hiding what needs a missing one leaves part of the list, also after a reload
  const filters = page.getByRole('dialog', { name: 'Seleccionar filtros' });
  const filtered = /^(\d+) escenarios \(\+(\d+) escenarios filtrados\)$/;
  await page.getByRole('button', { name: 'Seleccionar filtros' }).click();
  await filters.getByRole('button', { name: /^Ocultar escenarios con ampliaciones que faltan/ }).click();
  await expect(filters.locator('.filter-missing')).toHaveAttribute('aria-pressed', 'true');
  await shot('01-filters');
  await filters.getByRole('button', { name: 'Ok' }).click();
  await expect(filters).toHaveCount(0);
  await expect(page.locator('.count')).toHaveText(filtered);
  const [, shown, hidden] = (await page.locator('.count').textContent())!.match(filtered)!.map(Number);
  expect(shown! + hidden!).toBe(count);
  // Written to the browser's storage in the background
  await page.waitForTimeout(1000);
  await openQuestList(page);
  await expect(page.locator('.count')).toHaveText(`${shown} escenarios (+${hidden} escenarios filtrados)`);
  // Without English, the scenarios only in English go too
  await page.getByRole('button', { name: 'Seleccionar filtros' }).click();
  await filters.locator('.filter-missing').click();
  await filters.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(filters.getByRole('button', { name: 'EN', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await filters.getByRole('button', { name: 'Ok' }).click();
  await expect(page.locator('.count')).toHaveText(filtered);
  await page.getByRole('button', { name: 'Seleccionar filtros' }).click();
  await filters.getByRole('button', { name: 'EN', exact: true }).click();
  await filters.getByRole('button', { name: 'Ok' }).click();
  await expect(page.locator('.count')).toHaveText(`${count} escenarios`);

  // The search applies when the player ends editing, trimmed, as Valkyrie's
  await page.getByRole('searchbox').fill(' Material ');
  await page.getByRole('searchbox').press('Enter');
  await expect(page.locator('.count')).toHaveText(/^1 escenarios \(/);
  const exotic = page.locator('.quest', { hasText: 'Material exótico' });
  // The list's own statistics, which the store updates every hour
  const section = readFileSync(storeList, 'utf8').split(/^(?=\[)/m).find((s) => s.startsWith('[ExoticMaterial]'))!;
  const plays = /^play_count=(\d+)/m.exec(section)![1];
  await expect(exotic).toContainText(`${plays} reseñas`);
  await expect(exotic).toContainText('Duración Media');
  await expect(exotic.locator('.quest-action')).toHaveText('Descargar');

  await exotic.click();
  await expect(exotic.locator('.quest-action')).toHaveText('Jugar');
  expect(downloads).toEqual(['ExoticMaterial.valkyrie']);
  await shot('02-downloaded');

  // Kept after a reload, as the manifest of the download folder says
  await openQuestList(page);
  await page.getByRole('searchbox').fill('Material');
  await page.getByRole('searchbox').press('Enter');
  await expect(page.locator('.quest', { hasText: 'Material exótico' }).locator('.quest-action')).toHaveText('Jugar');
  await page.locator('.quest', { hasText: 'Material exótico' }).click();
  await expect(page.getByRole('heading', { name: 'Material exótico' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Iniciar' })).toBeVisible();
  await shot('03-details');

  // Offline, the list is the one in the browser
  await page.getByRole('button', { name: 'Volver' }).click();
  await page.getByRole('button', { name: 'DESCONECTARSE' }).click();
  await expect(page.getByRole('button', { name: 'IR EN LÍNEA' })).toBeVisible();
  await expect(page.locator('.count')).toHaveText('1 escenarios');
  await expect(page.locator('.quest', { hasText: 'Material exótico' }).locator('.quest-action')).toHaveText('Jugar');
  expect(downloads).toEqual(['ExoticMaterial.valkyrie']);
  expect(errors).toEqual([]);
});

test('downloads a community pack into the collection and deletes it', async ({ page }, testInfo) => {
  const shot = (name: string) => page.screenshot({ path: testInfo.outputPath(`${name}.png`) });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const downloads = await serveStore(page);

  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Mi Colección' }).click();
  await expect(page.getByRole('heading', { name: 'Elige Colección de Expansiones' })).toBeVisible();
  await page.getByRole('button', { name: 'Descarga de contenidos' }).click();

  const pack = page.locator('.pack-download', { hasText: 'Pack de prueba' });
  await expect(pack).toContainText('Un pack para las pruebas.');
  await pack.getByRole('button', { name: 'Descargar' }).click();
  await expect(pack.getByRole('button', { name: 'Eliminar' })).toBeVisible();
  expect(downloads).toEqual(['TST.valkyrieContentPack']);
  await shot('01-downloaded');

  // In the collection, among the community packs, until the player chooses it
  await page.getByRole('button', { name: 'Volver' }).click();
  await page.locator('.pack-type', { hasText: 'Paquetes de contenidos comunitarios' }).click();
  const row = page.locator('.pack-row', { hasText: 'Test pack' });
  await expect(row).not.toHaveClass(/chosen/);
  await row.locator('.pack-choice').click();
  await expect(row).toHaveClass(/chosen/);
  await row.locator('.pack-choice').click();
  await expect(row).not.toHaveClass(/chosen/);
  // Choosing the language of its texts, Base included, also chooses the pack (ContentSelectScreen.UpdateLanguage)
  await row.getByRole('combobox').selectOption('BASE');
  await expect(row).toHaveClass(/chosen/);
  await shot('02-chosen');

  // Still there after a reload, then deleted
  await page.reload();
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Mi Colección' }).click();
  await page.locator('.pack-type', { hasText: 'Paquetes de contenidos comunitarios' }).click();
  await expect(page.locator('.pack-row.chosen', { hasText: 'Test pack' })).toBeVisible();
  await page.getByRole('button', { name: 'Volver' }).click();
  await page.getByRole('button', { name: 'Descarga de contenidos' }).click();
  await page.locator('.pack-download', { hasText: 'Pack de prueba' }).getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.locator('.pack-download', { hasText: 'Pack de prueba' }).getByRole('button', { name: 'Descargar' })).toBeVisible();
  await page.getByRole('button', { name: 'Volver' }).click();
  await page.locator('.pack-type', { hasText: 'Paquetes de contenidos comunitarios' }).click();
  await expect(page.locator('.pack-row')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('lists the scenarios in the browser when the store cannot be reached', async ({ page }) => {
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
  await openQuestList(page);
  await expect(page.getByText('OFFLINE (error de red)')).toBeVisible();
  await expect(page.getByText(/Todavía no hay escenarios/)).toBeVisible();
});

test('says when a download fails, and lets the player try again', async ({ page }) => {
  await page.route('https://raw.githubusercontent.com/**', async (route) => {
    if (route.request().url() === LIST) return route.fulfill({ body: readFileSync(storeList), headers: CORS });
    return route.fulfill({ status: 404, body: 'Not Found', headers: CORS });
  });
  await openQuestList(page);
  await page.getByRole('searchbox').fill('Material');
  await page.getByRole('searchbox').press('Enter');
  const exotic = page.locator('.quest', { hasText: 'Material exótico' });
  await exotic.click();
  await expect(page.getByRole('status').filter({ hasText: 'No se pudo descargar ExoticMaterial' })).toBeVisible();
  await expect(page.locator('.loading-screen')).toHaveCount(0);
  await expect(exotic.locator('.quest-action')).toHaveText('Descargar');
});

/** A scenario made here, not in the store: a quest.ini for a game and a description with a web address and an email. */
function madeUpScenario(type: string, name: string): Buffer {
  return Buffer.from(
    zipSync({
      'quest.ini': strToU8(`[Quest]\nformat=21\ntype=${type}\ndefaultlanguage=English\n\n[QuestText]\nLocalization.English.txt\n`),
      'Localization.English.txt': strToU8(
        `.,English\nquest.name,${name} <i>here</i>\nquest.synopsys,Made <b>here</b>\nquest.description,See www.example.com/quest or write to someone@example.com.\nquest.authors,Someone\n`,
      ),
    }),
  );
}

test('lists a scenario added while online with those of this device, and links its addresses', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await serveStore(page);
  await openQuestList(page);
  await expect(page.getByRole('button', { name: 'DESCONECTARSE' })).toBeVisible();
  const input = page.locator('.list-tools input[type=file]');

  // A Descent scenario added from Mansions goes to Descent's list, and the player is told
  await input.setInputFiles({ name: 'Elsewhere.valkyrie', mimeType: 'application/zip', buffer: madeUpScenario('D2E', 'Elsewhere') });
  await expect(page.getByRole('status').filter({ hasText: 'Elsewhere.valkyrie es un escenario de Descent: Viaje a las Tinieblas' })).toBeVisible();

  // One of Mansions: the list goes to this device's scenarios, where it is, its name formatted rather than tagged
  await input.setInputFiles({ name: 'MadeHere.valkyrie', mimeType: 'application/zip', buffer: madeUpScenario('MoM', 'Made') });
  await expect(page.getByRole('button', { name: 'IR EN LÍNEA' })).toBeVisible();
  const card = page.locator('.quest', { hasText: 'Made here' });
  await expect(card).toBeVisible();
  await expect(card.locator('.quest-name em')).toHaveText('here');
  await expect(card).not.toContainText('<i>');
  await card.click();
  await expect(page.getByRole('link', { name: 'www.example.com/quest' })).toHaveAttribute('href', 'https://www.example.com/quest');
  await expect(page.getByRole('link', { name: 'someone@example.com' })).toHaveAttribute('href', 'mailto:someone@example.com');
  expect(errors).toEqual([]);
});

// Not in Valkyrie: a scenario zipped as its folder, the usual mistake, is taken out of it and played; one that Valkyrie
// cannot open says why (host/scenarioPackage.ts)
test('takes a scenario out of the folder it was zipped in, and says why another cannot be opened', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await serveStore(page);
  await openQuestList(page);
  const input = page.locator('.list-tools input[type=file]');
  const inFolder = Buffer.from(
    zipSync(Object.fromEntries(Object.entries(unzipSync(madeUpScenario('MoM', 'Folded'))).map(([name, data]) => [`Folded/${name}`, data]))),
  );
  await input.setInputFiles({ name: 'Folded.zip', mimeType: 'application/zip', buffer: inFolder });
  const report = page.getByRole('dialog', { name: 'Folded.valkyrie añadido, con avisos' });
  await expect(report).toContainText('dentro de la carpeta «Folded»');
  await report.getByRole('button').click();
  await expect(page.locator('.quest', { hasText: 'Folded here' })).toBeVisible();

  const blank = Buffer.from(
    zipSync({ 'quest.ini': strToU8('[Quest]\nformat=21\ntype=MoM\n \n[QuestText]\nLocalization.English.txt\n'), 'Localization.English.txt': strToU8('.,English\n') }),
  );
  await input.setInputFiles({ name: 'Blank.valkyrie', mimeType: 'application/zip', buffer: blank });
  await expect(page.getByRole('dialog', { name: 'Blank.valkyrie no se puede abrir' })).toContainText('quest.ini, línea 4');
  expect(errors).toEqual([]);
});

test("keeps the player's marks on a scenario and filters the list by them", async ({ page }) => {
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
  await openQuestList(page);
  const input = page.locator('.list-tools input[type=file]');
  await input.setInputFiles({ name: 'MarkedOne.valkyrie', mimeType: 'application/zip', buffer: madeUpScenario('MoM', 'Marked') });
  await input.setInputFiles({ name: 'OtherOne.valkyrie', mimeType: 'application/zip', buffer: madeUpScenario('MoM', 'Other') });
  await expect(page.locator('.count')).toHaveText('2 escenarios');

  // Marked in its details, shown on its card
  await page.locator('.quest', { hasText: 'Marked here' }).click();
  const marks = page.getByRole('group', { name: 'Tus marcas' });
  await marks.getByRole('button', { name: 'Favorita' }).click();
  await expect(marks.getByRole('button', { name: 'Favorita' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Volver', exact: true }).click();
  await expect(page.locator('.quest', { hasText: 'Marked here' }).getByRole('img', { name: 'Favorita' })).toBeVisible();

  // The filter shows only the favourites, then only the pending, and is kept after a reload
  const filters = page.getByRole('dialog', { name: 'Seleccionar filtros' });
  await page.getByRole('button', { name: 'Seleccionar filtros' }).click();
  await filters.getByRole('radiogroup', { name: 'Marcadas' }).getByRole('radio', { name: 'Favoritas' }).click();
  await filters.getByRole('button', { name: 'Ok' }).click();
  await expect(page.locator('.count')).toHaveText('1 escenarios (+1 escenarios filtrados)');
  await expect(page.locator('.quest', { hasText: 'Marked here' })).toBeVisible();
  await page.waitForTimeout(1000);
  await openQuestList(page);
  await expect(page.locator('.count')).toHaveText('1 escenarios (+1 escenarios filtrados)');
  await page.getByRole('button', { name: 'Seleccionar filtros' }).click();
  await filters.getByRole('radiogroup', { name: 'Jugadas o no' }).getByRole('radio', { name: 'Jugadas' }).click();
  await filters.getByRole('radiogroup', { name: 'Marcadas' }).getByRole('radio', { name: 'Todas' }).click();
  await filters.getByRole('button', { name: 'Ok' }).click();
  await expect(page.locator('.count')).toHaveText('0 escenarios (+2 escenarios filtrados)');
});

