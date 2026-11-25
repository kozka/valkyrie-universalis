// A community content pack added from a file (17 November 2026, screens/addContentPack.ts), as a pack's author does to
// try it before it is in the store: the app checks it and says what is wrong; one with errors is not kept, one with
// warnings is, and is listed below the store's packs and in the collection, to choose and to delete. Its own pack, so it
// needs no download.
import { expect, test, type Page } from '@playwright/test';
import { strToU8, zipSync } from 'fflate';

test.use({ locale: 'es-ES' });
test.beforeEach(async ({ page }) => {
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
});

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

function pack(contentPack: string, tiles: string): Buffer {
  return Buffer.from(
    zipSync({
      'content_pack.ini': strToU8(`[ContentPack]\n${contentPack}\n\n[ContentPackData]\ntiles.ini\n`),
      'tiles.ini': strToU8(tiles),
      'img/portada.png': new Uint8Array(png),
      'img/sala.png': new Uint8Array(png),
    }),
  );
}

async function addPack(page: Page, name: string, bytes: Buffer): Promise<void> {
  await page.locator('input[type=file]').setInputFiles({ name, mimeType: 'application/octet-stream', buffer: bytes });
}

test('adds a content pack from a file, telling its author what is wrong', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The same screens on a phone');
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Mi Colección' }).click();
  await page.getByRole('button', { name: 'Descarga de contenidos' }).click();
  await expect(page.getByRole('button', { name: 'Añadir un pack desde un fichero' })).toBeVisible();

  // Without an id it cannot be kept, and the author hears why
  await addPack(page, 'sin-id.valkyrieContentPack', pack('name=Mis salas\ntype=MoMCustom', '[TileSideMiSala]\nimage=img/sala\n'));
  const report = page.getByRole('dialog');
  await expect(report.getByRole('heading')).toHaveText('Mis salas no se puede añadir');
  await expect(report).toContainText('no tiene id');
  await page.screenshot({ path: testInfo.outputPath('01-errors.png') });
  await report.getByRole('button').click();
  await expect(page.locator('.packs-from-files')).toHaveCount(0);

  // A scenario given here by mistake
  await addPack(page, 'escenario.valkyrie', Buffer.from(zipSync({ 'quest.ini': strToU8('[Quest]\n') })));
  await expect(page.getByText('es un escenario, no un pack de contenido')).toBeVisible();

  // With a picture missing it is kept, with the warning
  await addPack(
    page,
    'MisSalas.valkyrieContentPack',
    pack('name=Mis salas\ndescription=Salas de prueba\nimage=img/portada\nid=MisSalas\ntype=MoMCustom', '[TileSideMiSala]\nimage=img/sala\n[TileSideOtra]\nimage=img/otra\n'),
  );
  await expect(report.getByRole('heading')).toHaveText('Mis salas añadido, con avisos');
  await expect(report).toContainText('la imagen img/otra no está en el pack');
  await page.screenshot({ path: testInfo.outputPath('02-warnings.png') });
  await report.getByRole('button').click();
  const fromFiles = page.locator('.packs-from-files');
  await expect(fromFiles).toContainText('Mis salas');
  await expect(fromFiles).toContainText('Salas de prueba');
  await page.screenshot({ path: testInfo.outputPath('03-listed.png') });

  // In the collection, among the community packs, to choose
  await page.getByRole('button', { name: 'Volver' }).click();
  await page.locator('.pack-type', { hasText: 'Paquetes de contenidos comunitarios' }).click();
  await expect(page.locator('.pack-row', { hasText: 'Mis salas' })).toBeVisible();

  // Kept after the page is opened again, and deleted from the list
  await page.reload();
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Mi Colección' }).click();
  await page.getByRole('button', { name: 'Descarga de contenidos' }).click();
  await expect(fromFiles).toContainText('Mis salas');
  await fromFiles.getByRole('button', { name: 'Eliminar' }).click();
  await expect(fromFiles).toHaveCount(0);
});
