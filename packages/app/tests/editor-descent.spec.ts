// The scenario editor with Descent and DooM in a real browser (step E.9), in development builds only, or while it is
// open to try (packages/app/editorPreview.ts). A campaign, the skill descent-valkyrie's La campana de Vadoscuro: its
// adventures, which Valkyrie lists as scenarios of their own, under it; one opened, checked with the whole campaign,
// packaged only with it, and tested with Descent's class selection, whose Back goes back to the editor as in Valkyrie;
// the campaign tested from its own quest through its change of quest, with the test panel saying where each event is
// and opening an adventure's event in the editor; a button's change of quest chosen among the campaign's quests; the
// tree marking the shop; and a new adventure, hidden as a campaign's are. And DooM's editor, under DooM's button: only
// its missions, a new one asking for its pack, the places for one marine, and a test with its marines. In the tests'
// schematic mode (?schematic). Needs the clones and the downloads (node referencias/clonar.mjs, node
// referencias/descargar-escenarios.mjs).
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import { zipSync } from 'fflate';
import { EDITOR_PREVIEW } from '../editorPreview.ts';
import { pressEditor } from './fixtures/editor.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const valkyrie = join(root, 'referencias/valkyrie');
const storeLists = join(root, 'referencias/valkyrie-store/D2E');
const downloads = join(root, 'referencias/descargas/D2E');
const CAMPAIGN = join(root, 'herramientas/descent-valkyrie/assets/ejemplo/LaCampanaDeVadoscuro');
const MISSION = join(root, 'herramientas/doom-valkyrie/assets/ejemplo/FugaEnHesperia');

test.use({ locale: 'es-ES' });
test.skip(
  ![join(storeLists, 'contentPacksManifestDownload.ini'), join(downloads, 'packs/DooM.valkyrieContentPack'), CAMPAIGN, MISSION].every((p) => existsSync(p)),
  'Missing referencias: run node referencias/clonar.mjs and descargar-escenarios.mjs',
);

const CORS = { 'access-control-allow-origin': '*' };
/** A 1×1 PNG, for every cover and for Valkyrie's own pictures. */
const PICTURE = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

// Descent's store: its lists and DooM's pack, from the clone and the downloads, and Valkyrie's own files from its clone
test.beforeEach(async ({ page }, testInfo) => {
  // While the editor is open to try, a phone does not open it (editor-preview.spec.ts)
  test.skip(testInfo.project.name === 'phone' && EDITOR_PREVIEW, 'While it is open to try, the editor opens on a computer only');
  await page.route('https://raw.githubusercontent.com/**', async (route) => {
    const url = route.request().url();
    const own = /\/NPBruce\/valkyrie\/[0-9a-f]{40}\/(.+)$/.exec(url);
    if (own !== null && existsSync(join(valkyrie, decodeURIComponent(own[1]!)))) return route.fulfill({ path: join(valkyrie, decodeURIComponent(own[1]!)), headers: CORS });
    const list = /valkyrie-store\/(?:refs\/heads\/)?master\/D2E\/(manifestDownload|contentPacksManifestDownload)\.ini$/.exec(url);
    if (list !== null) return route.fulfill({ body: readFileSync(join(storeLists, `${list[1]}.ini`)), headers: CORS });
    const file = decodeURIComponent(url.split('/').pop()!);
    if (file === 'DooM.valkyrieContentPack') return route.fulfill({ path: join(downloads, 'packs', file), headers: CORS });
    if (/\.(png|jpe?g)$/i.test(file)) return route.fulfill({ body: PICTURE, contentType: 'image/png', headers: CORS });
    return route.abort();
  });
});

/** A folder of the skills' examples, zipped with its own name on top, as a player zips a scenario's folder. */
function zipFolder(folder: string): Buffer {
  const entries: Record<string, Uint8Array> = {};
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else entries[relative(dirname(folder), path).replaceAll('\\', '/')] = new Uint8Array(readFileSync(path));
    }
  };
  walk(folder);
  return Buffer.from(zipSync(entries));
}

async function importFolder(page: Page, folder: string): Promise<void> {
  const name = folder.split(/[\\/]/).pop()!;
  await page.locator('input[type=file][accept=".valkyrie,.zip"]').setInputFiles({ name: name + '.zip', mimeType: 'application/zip', buffer: zipFolder(folder) });
  await expect(page.getByRole('status')).toContainText(name);
}

async function descentEditor(page: Page): Promise<void> {
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Descent/ }).click();
  await pressEditor(page, 'Editar Aventura');
  await expect(page.getByRole('heading', { name: 'Editar Aventura' })).toBeVisible();
}

/** Valkyrie's window: how many heroes (it starts at the last test's number), then Start. */
async function startTest(page: Page, heroes: number): Promise<void> {
  await page.getByRole('button', { name: 'Guardar y Probar' }).click();
  const ask = page.getByRole('group', { name: 'Número de Héroes' });
  const count = ask.locator('output');
  while (Number(await count.textContent()) < heroes) await ask.getByRole('button', { name: 'Más: Número de Héroes' }).click();
  while (Number(await count.textContent()) > heroes) await ask.getByRole('button', { name: 'Menos: Número de Héroes' }).click();
  await expect(count).toHaveText(String(heroes));
  await ask.getByRole('button', { name: 'Iniciar' }).click();
}

test("edits a campaign's adventures under it, checks them with the whole campaign, and tests it through its change of quest", async ({ page }) => {
  test.setTimeout(120_000);
  await descentEditor(page);
  await importFolder(page, CAMPAIGN);

  // Its adventures under it, not as scenarios of their own as Valkyrie lists them
  const row = page.locator('.editor-row', { hasText: 'La campana de Vadoscuro' });
  await expect(page.locator('.editor-list > li')).toHaveCount(1);
  const adventures = row.getByRole('list', { name: 'Las aventuras de La campana de Vadoscuro' });
  await expect(adventures.getByRole('button')).toHaveText(['Aventura1', 'Aventura2', 'Interludio']);

  // One opened: checked with its campaign, which changes quest to it, so nothing is wrong; packaged only with it
  await adventures.getByRole('button', { name: 'Aventura1' }).click();
  const workbench = page.locator('.editor-workbench');
  await expect(workbench.getByRole('heading', { name: 'Aventura1', level: 1 })).toBeVisible();
  await expect(workbench.getByText('Carpeta: LaCampanaDeVadoscuro/Aventura1')).toBeVisible();
  await expect(workbench.getByLabel('Campaña:')).toHaveValue(/Aventura1$/);
  await expect(page.locator('.editor-bottom')).not.toContainText('Rompen Valkyrie');
  await expect(page.locator('.editor-bottom')).not.toContainText('No harán lo que quería el autor');
  // An adventure's package is its campaign's: the File menu says so, without a Create Package of its own
  await page.getByRole('button', { name: 'Archivo', exact: true }).click();
  await expect(page.getByRole('menuitem', { name: 'Crear Paquete' })).toHaveCount(0);
  await expect(page.getByRole('menuitem', { name: 'Una aventura se empaqueta y se exporta con su campaña.' })).toBeDisabled();
  await page.keyboard.press('Escape');

  // Tested: Descent's heroes take their classes, and that screen's Back goes back to the editor, as in Valkyrie
  await startTest(page, 2);
  const classes = page.locator('.class-selection');
  await expect(classes.locator('.class-hero')).toHaveCount(2);
  // The test's panel waits for the game, which it would cover
  await expect(page.getByRole('complementary', { name: 'Prueba' })).toHaveCount(0);
  await classes.getByRole('button', { name: 'Volver' }).click();
  await expect(workbench.getByRole('heading', { name: 'Aventura1', level: 1 })).toBeVisible();

  // The campaign's own quest, from the campaign's list of its quests; its button goes to an adventure, chosen among them
  await workbench.getByLabel('Campaña:').selectOption({ label: 'La campana de Vadoscuro' });
  await expect(workbench.getByRole('heading', { name: 'La campana de Vadoscuro', level: 1 })).toBeVisible();
  await page.locator('.editor-components').getByRole('button', { name: /^EventNormal/ }).click();
  const next = page.locator('.editor-props').getByRole('combobox', { name: 'Evento del botón 1' }).first();
  await expect(next).toHaveValue('Aventura1/quest.ini');
  await expect(next.locator('optgroup[label="Pasar a otra aventura de la campaña"] option')).toHaveText(['Aventura1/quest.ini', 'Aventura2/quest.ini', 'Interludio/quest.ini']);

  // Tested from the campaign's quest: through its introduction to its first adventure, which the panel says
  await startTest(page, 2);
  for (let i = 0; i < 2; i++) await classes.locator('.class-hero').nth(i).locator('.class-choice:enabled').first().click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  const dialog = page.locator('.dialog-layer');
  await dialog.getByRole('button', { name: 'Continuar' }).click();
  await dialog.getByRole('button', { name: 'Continuar' }).click();
  await dialog.getByRole('button', { name: 'Normal' }).click();
  const panel = page.getByRole('complementary', { name: 'Prueba' });
  if (await page.locator('.test-panel-open').isVisible()) await page.locator('.test-panel-open').click();
  await expect(panel.getByRole('heading', { level: 2 })).toContainText('La campana de Vadoscuro');
  const events = panel.locator('.test-events li');
  await expect(panel.locator('.test-change')).toHaveText(/Pasa a Aventura1\/quest\.ini\s*botón 1 de EventNormal/);
  await expect(events.first()).toContainText('en Aventura1');
  // An adventure's event, pressed, opens that adventure in the editor with the event chosen
  const name = await events.first().getByRole('button').innerText();
  await events.first().getByRole('button').click();
  await expect(workbench.getByRole('heading', { name: 'Aventura1', level: 1 })).toBeVisible();
  await expect(page.locator('#editor-props-title')).toHaveText(name);
});

test("marks the shop in a campaign's tree of events, and makes a new adventure of a campaign, hidden as its others", async ({ page }) => {
  await descentEditor(page);
  await importFolder(page, CAMPAIGN);
  const row = page.locator('.editor-row', { hasText: 'La campana de Vadoscuro' });

  // Descent's shop, in the tree: the event that opens it, with its items, and the one that closes it
  await row.getByRole('button', { name: 'Interludio' }).click();
  await page.locator('.editor-components').getByRole('button', { name: /^EventMercado/ }).click();
  await page.getByRole('tab', { name: 'Árbol' }).click();
  const tree = page.locator('.editor-tree');
  await tree.getByRole('radio', { name: 'Adónde lleva EventMercado' }).click();
  await expect(tree.locator('.editor-tree-roots > li > .editor-tree-node')).toContainText('Abre la tienda (5 objetos)');
  await expect(tree.locator('.editor-tree-list .editor-tree-list .editor-tree-node').first()).toContainText('Cierra la tienda');
  await page.getByRole('button', { name: 'Volver', exact: true }).click();

  // A new adventure, in the campaign's folder
  await row.getByRole('button', { name: 'Nueva aventura' }).click();
  await expect(page.getByRole('heading', { name: 'Nueva aventura de La campana de Vadoscuro' })).toBeVisible();
  await page.getByLabel('Nombre de carpeta del escenario').fill('Aventura1');
  await page.getByRole('button', { name: 'Crear' }).click();
  await expect(page.getByRole('alert')).toHaveText('El nombre de carpeta ya existe');
  await page.getByLabel('Nombre de carpeta del escenario').fill('Aventura3');
  await page.getByLabel('Nombre para mostrar del escenario').fill('La cripta');
  await page.getByRole('button', { name: 'Crear' }).click();
  await expect(row.getByRole('list', { name: 'Las aventuras de La campana de Vadoscuro' }).getByRole('button')).toHaveText(['Aventura1', 'Aventura2', 'La cripta', 'Interludio']);
  await row.getByRole('button', { name: 'La cripta' }).click();
  await expect(page.getByRole('heading', { name: 'La cripta', level: 1 })).toBeVisible();
  // Hidden, as a campaign's adventures are, which only the campaign lists
  await page.getByRole('button', { name: 'Modo texto' }).click();
  await expect(page.locator('.editor-text-mode textarea').first()).toHaveValue(/\nhidden=True(\n|$)/);
});

test("edits DooM's missions under DooM's button: a new one asks for its pack, and a test plays it with its marines", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/?schematic');
  await page.getByRole('button', { name: 'DooM', exact: true }).click();
  await page.getByRole('button', { name: 'Descargar DooM' }).click();
  const download = page.locator('.pack-download', { hasText: 'DooM' });
  await download.getByRole('button', { name: 'Descargar' }).click();
  await expect(download.getByRole('button', { name: 'Eliminar' })).toBeVisible();
  await page.getByRole('button', { name: 'Volver' }).click();
  await page.getByRole('button', { name: 'Volver' }).click();
  await pressEditor(page, 'Editar Aventura');

  // Only DooM's missions; Descent's adventures are edited from Descent's menu
  await importFolder(page, MISSION);
  await importFolder(page, CAMPAIGN);
  await expect(page.locator('.editor-list > li')).toHaveCount(1);
  await expect(page.locator('.editor-list')).toContainText('Fuga en Hesperia');
  await expect(page.getByText('Aventuras de Descent, que se editan desde su menú: 1.')).toBeVisible();

  // A new mission asks for DooM's pack, so it stays in DooM's list
  await page.getByRole('button', { name: 'Nuevo' }).click();
  await page.getByLabel('Nombre de carpeta del escenario').fill('Nueva');
  await page.getByRole('button', { name: 'Crear' }).click();
  await page.locator('.editor-open', { hasText: 'Carpeta: Nueva' }).click();
  await page.getByRole('button', { name: 'Modo texto' }).click();
  await expect(page.locator('.editor-text-mode textarea').first()).toHaveValue(/\npacks=DooM(\n|$)/);
  await page.getByRole('button', { name: 'Modo texto' }).click();
  await page.getByRole('button', { name: 'Volver', exact: true }).click();

  // A mission for one marine: its spawns' places for one, which Valkyrie's panel leaves out
  await page.locator('.editor-row', { hasText: 'Fuga en Hesperia' }).locator('.editor-open').click();
  const spawn = page.locator('.editor-components').getByRole('button', { name: /^Spawn/ }).first();
  await spawn.click();
  await expect(page.locator('.editor-props').getByRole('button', { name: 'Añadir una casilla para 1 héroe' })).toBeVisible();

  // Tested with DooM's marines, who take DooM's classes
  await startTest(page, 1);
  const classes = page.locator('.class-selection');
  await expect(classes.locator('.class-hero')).toHaveCount(1);
  await expect(classes.locator('.class-choice')).toHaveText(['Especialista en escopeta', 'Especialista en fusil', 'Especialista en apoyo', 'Especialista en asalto pesado']);
  await classes.getByRole('button', { name: 'Volver' }).click();
  await expect(page.getByRole('heading', { name: 'Fuga en Hesperia', level: 1 })).toBeVisible();
});
