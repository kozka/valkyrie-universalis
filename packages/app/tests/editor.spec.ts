// The scenario editor in a real browser, in development builds only, or while it is open to try past its warning and on
// a computer only (packages/app/editorPreview.ts; pwa.spec.ts checks that the built app has it only then): the
// scenarios of the Editor folder, a new one made, opened with what the checks find, saved, packaged as Valkyrie's
// editor packages it and exported; one imported from a file; a downloaded one copied; one deleted after asking; and the
// workbench, where components are made, chosen on the list or the map, moved, turned, renamed and deleted, with undo
// and redo. Without official content, in the tests' schematic mode (?schematic).
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import { strToU8, unzipSync, zipSync } from 'fflate';
import type { BoardProbe } from '../src/board/probe.ts';
import { EDITOR_PREVIEW } from '../editorPreview.ts';
import { pressEditor } from './fixtures/editor.ts';

type Probed = { universalisBoard?: BoardProbe };

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
/** The engine as the development server hands it to the app, so that the page's own is reached. */
const engineUrl = `/@fs/${join(root, 'packages/engine/src/index.ts').replaceAll('\\', '/').replace(/^\//, '')}`;

test.use({ locale: 'es-ES' });

// Nothing here needs the network: the store and Valkyrie's pictures stay out of reach
test.beforeEach(async ({ page }, testInfo) => {
  // While the editor is open to try, a phone does not open it (editor-preview.spec.ts)
  test.skip(testInfo.project.name === 'phone' && EDITOR_PREVIEW, 'While it is open to try, the editor opens on a computer only');
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
});

/** A small Mansions scenario, as a .valkyrie holds it: a start, a hall and an ending. */
function scenario(name: string): Buffer {
  return Buffer.from(
    zipSync({
      'quest.ini': strToU8(`[Quest]\r\nformat=21\r\ntype=MoM\r\ndefaultlanguage=English\r\n\r\n[QuestText]\r\nLocalization.English.txt\r\n\r\n[QuestData]\r\nevents.ini\r\n`),
      'events.ini': strToU8('[EventStart]\r\ntrigger=EventStart\r\nbuttons=1\r\noperations=$end,=,1\r\n'),
      'Localization.English.txt': strToU8(`.,English\r\nquest.name,${name}\r\nEventStart.text,The end\r\nEventStart.button1,Close\r\n`),
    }),
  );
}

async function openEditor(page: Page): Promise<void> {
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await pressEditor(page);
  await expect(page.getByRole('heading', { name: 'Editar Escenario' })).toBeVisible();
}

/** Where a point of the board is on the page, once the map shows it (BoardProbe.pointOnPage). */
async function onPage(page: Page, x: number, y: number): Promise<{ x: number; y: number }> {
  await expect.poll(() => page.evaluate(() => (globalThis as unknown as Probed).universalisBoard !== undefined)).toBe(true);
  return page.evaluate(([bx, by]) => (globalThis as unknown as Probed).universalisBoard!.pointOnPage(bx!, by!), [x, y]);
}

/** Opens the workbench's File menu, which holds the rest of Valkyrie's editor menu and its Tools. */
async function fileMenu(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Archivo', exact: true }).click();
  await expect(page.getByRole('menu')).toBeVisible();
}

/** The names of the files in a zip the page handed to the browser. */
async function zipNames(download: import('@playwright/test').Download): Promise<string[]> {
  const path = await download.path();
  const { readFileSync } = await import('node:fs');
  return Object.keys(unzipSync(new Uint8Array(readFileSync(path)))).sort();
}

test('makes, checks, saves, packages and exports a new scenario', async ({ page }) => {
  await openEditor(page);
  // What it says of itself: only in development, or open to try
  await expect(page.getByText(EDITOR_PREVIEW ? 'Fase muy temprana: el editor aún no está listo.' : 'Solo en desarrollo')).toBeVisible();
  await expect(page.getByText('Aún no hay escenarios en el editor.')).toBeVisible();

  // QuestEditSelection.NewQuestDialog: the folder takes letters and numbers only
  await page.getByRole('button', { name: 'Nuevo' }).click();
  await page.getByLabel('Nombre de carpeta del escenario').fill('Mi prueba!');
  await expect(page.getByLabel('Nombre de carpeta del escenario')).toHaveValue('Miprueba');
  await page.getByLabel('Nombre para mostrar del escenario').fill('La casa del reloj');
  await page.getByRole('button', { name: 'Crear' }).click();
  await expect(page.getByRole('button', { name: /La casa del reloj/ })).toBeVisible();

  // A folder that is taken is refused, as in Valkyrie
  await page.getByRole('button', { name: 'Nuevo' }).click();
  await page.getByLabel('Nombre de carpeta del escenario').fill('Miprueba');
  await page.getByRole('button', { name: 'Crear' }).click();
  await expect(page.getByRole('alert')).toHaveText('El nombre de carpeta ya existe');
  await page.getByRole('button', { name: 'Volver' }).click();

  // Opened: what the checks find in a scenario with nothing in it yet, and its files
  await page.getByRole('button', { name: /La casa del reloj/ }).click();
  await expect(page.getByRole('heading', { name: 'La casa del reloj', level: 1 })).toBeVisible();
  const problems = page.locator('.editor-bottom');
  await expect(problems.getByText('Rompen Valkyrie (1)')).toBeVisible();
  // Each problem said in words, with where it is (ProblemLine.tsx)
  await expect(problems.locator('[data-code="start-none"]')).toContainText('El escenario');
  await expect(problems.locator('[data-code="start-none"]')).toContainText('Ningún evento empieza el escenario (EventStart): no pasa nada al empezar.');
  await page.getByRole('tab', { name: 'Ficheros' }).click();
  await expect(page.locator('.editor-files')).toContainText('quest.ini');
  await expect(page.locator('.editor-files')).toContainText('Localization.Spanish.txt');

  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Guardado.');

  // EditorTools.CreatePackage: the folder with the .valkyrie and its manifest, as Valkyrie leaves it on the desktop.
  // With a problem that breaks Valkyrie (no start), it asks first
  await fileMenu(page);
  await page.getByRole('menuitem', { name: 'Crear Paquete' }).click();
  await expect(page.getByRole('alert')).toContainText('Problemas que rompen Valkyrie: 1.');
  const [made] = await Promise.all([page.waitForEvent('download'), page.getByRole('alert').getByRole('button', { name: 'Crear Paquete' }).click()]);
  expect(made.suggestedFilename()).toBe('Miprueba-package.zip');
  expect(await zipNames(made)).toEqual(['Miprueba/Miprueba.ini', 'Miprueba/Miprueba.valkyrie']);
  await fileMenu(page);
  const [exported] = await Promise.all([page.waitForEvent('download'), page.getByRole('menuitem', { name: 'Exportar' }).click()]);
  expect(exported.suggestedFilename()).toBe('Miprueba.zip');
  expect(await zipNames(exported)).toEqual(['Localization.Spanish.txt', 'quest.ini']);

  // Kept in the browser: there after a reload
  await page.getByRole('button', { name: 'Volver', exact: true }).click();
  await openEditor(page);
  await expect(page.getByRole('button', { name: /La casa del reloj/ })).toBeVisible();
});

test('imports a scenario, copies a downloaded one and deletes after asking', async ({ page }) => {
  // A scenario in Valkyrie's Download folder, as the list's own button adds one
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await page.locator('.list-tools input[type=file]').setInputFiles({ name: 'Downloaded.valkyrie', mimeType: 'application/zip', buffer: scenario('A downloaded one') });
  await expect(page.getByText('A downloaded one')).toBeVisible();
  await page.getByRole('button', { name: 'Volver', exact: true }).click();
  await pressEditor(page);

  // Imported from a file: named after it
  await page.locator('input[type=file][accept=".valkyrie,.zip"]').setInputFiles({ name: 'Imported.valkyrie', mimeType: 'application/zip', buffer: scenario('An imported one') });
  await expect(page.getByRole('status')).toHaveText('Imported añadido al editor.');
  await expect(page.getByRole('button', { name: /An imported one/ })).toBeVisible();
  // A zip with no scenario in it
  await page.locator('input[type=file][accept=".valkyrie,.zip"]').setInputFiles({ name: 'Nothing.zip', mimeType: 'application/zip', buffer: Buffer.from(zipSync({ 'readme.txt': strToU8('Hello') })) });
  await expect(page.getByRole('status')).toHaveText('Nothing.zip no tiene quest.ini: no es un escenario.');

  // QuestEditSelection.Copy: every scenario, the downloaded ones too, into Editor<Scenario><n>
  await page.getByRole('button', { name: 'Copiar' }).click();
  await expect(page.getByRole('heading', { name: 'Selección de Escenario a Copiar' })).toBeVisible();
  await page.getByRole('button', { name: /A downloaded one/ }).click();
  await expect(page.getByRole('status')).toHaveText('Copiado en EditorEscenario1.');
  await expect(page.getByRole('button', { name: /A downloaded one/ })).toBeVisible();

  // Deleting asks first, and Cancel keeps it
  const row = page.locator('.editor-row', { hasText: 'An imported one' });
  await row.getByRole('button', { name: 'Eliminar' }).click();
  await expect(row.getByRole('alert')).toContainText('¿Borrar «An imported one»');
  await row.getByRole('button', { name: 'Cancelar' }).click();
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: 'Eliminar' }).click();
  await row.getByRole('alert').getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.getByRole('status')).toHaveText('An imported one borrado.');
  await expect(page.getByRole('button', { name: /An imported one/ })).toHaveCount(0);

  // The search box finds by name
  await page.getByRole('searchbox').fill('downloaded');
  await expect(page.locator('.editor-row')).toHaveCount(1);
});

test('shows what is wrong with a scenario that Valkyrie cannot open, without opening it', async ({ page }) => {
  await openEditor(page);
  // A tile on a side no pack has: Valkyrie stops loading it, its editor too
  const broken = zipSync({
    'quest.ini': strToU8('[Quest]\r\nformat=21\r\ntype=MoM\r\ndefaultlanguage=English\r\n\r\n[QuestText]\r\nLocalization.English.txt\r\n\r\n[QuestData]\r\ntiles.ini\r\n'),
    'tiles.ini': strToU8('[TileHall]\r\nside=TileSideNowhere\r\nxposition=0\r\nyposition=0\r\n'),
    'Localization.English.txt': strToU8('.,English\r\nquest.name,A broken one\r\n'),
  });
  await page.locator('input[type=file][accept=".valkyrie,.zip"]').setInputFiles({ name: 'Broken.valkyrie', mimeType: 'application/zip', buffer: Buffer.from(broken) });
  await page.getByRole('button', { name: /A broken one/ }).click();
  await expect(page.getByRole('alert')).toContainText('Tampoco lo abre el editor de Valkyrie');
  await expect(page.locator('.editor-problems [data-code="tile-side-unknown"]')).toContainText('no es un lado de loseta de los packs: Valkyrie se para al colocar la loseta.');
  // Nothing that would write it: no Save, no package
  await expect(page.getByRole('button', { name: 'Guardar', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Archivo', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Volver' }).click();
  await expect(page.getByRole('button', { name: /A broken one/ })).toBeVisible();
});

test('makes components on the workbench, chooses them on the map, moves, turns, renames and deletes them', async ({ page }) => {
  await openEditor(page);
  await page.getByRole('button', { name: 'Nuevo' }).click();
  await page.getByLabel('Nombre de carpeta del escenario').fill('Mesa');
  await page.getByRole('button', { name: 'Crear' }).click();
  await page.getByRole('button', { name: /Mesa/ }).click();
  const list = page.locator('.editor-components');
  const title = page.locator('#editor-props-title');
  // The panel shows no numbers for the place, which the map sets; it keeps them for the tests
  const piece = page.locator('.editor-piece');
  const turn = page.locator('.editor-props').getByLabel('Rotación');

  // QuestEditorData.NewTile: Tile0, at 0,0, selected; never added by an event, so it will not show in a game
  await list.getByRole('button', { name: '{Nuevo Tablero}' }).click();
  await expect(title).toHaveText('Tile0');
  await expect(piece).toHaveAttribute('data-x', '0');
  await expect(list.getByRole('button', { name: 'Tile0' }).getByRole('img', { name: 'No hará lo que quería el autor' })).toBeVisible();
  const neverAdded = page.locator('.editor-bottom [data-code="never-added"]');
  await expect(neverAdded.locator('.editor-problem-where')).toHaveText('Tile0');
  await expect(neverAdded.locator('.editor-problem-text')).toHaveText('Ningún evento lo pone en el tablero: nunca se ve.');
  await expect(page.getByText('Sin guardar')).toBeVisible();

  // Pressed on the map where the tile lies (its corner at 0,0, so its squares go right and down): it is chosen again
  await list.getByRole('button', { name: 'Escenario', exact: true }).click();
  await expect(title).toHaveText('Mesa');
  await page.locator('.editor-map').scrollIntoViewIfNeeded();
  const at = await onPage(page, 1.75, -1.75);
  await page.mouse.move(at.x, at.y);
  await expect(page.locator('.editor-map-status')).toHaveText('x 1.75 · y -1.75 · Tile0');
  await page.mouse.click(at.x, at.y);
  await expect(title).toHaveText('Tile0');

  // Dragged a little over two squares to the right: it snaps to a tile's step, 3.5 in Mansions (MoMGameType.TileRound)
  const to = await onPage(page, 1.75 + 2.4, -1.75);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(at.x + ((to.x - at.x) * i) / 10, at.y + ((to.y - at.y) * i) / 10);
  await expect(page.locator('.editor-map-status')).toHaveText('x 3.5 · y 0 · Tile0');
  await page.mouse.up();
  await expect(piece).toHaveAttribute('data-x', '3.5');
  await expect(piece).toHaveAttribute('data-y', '0');
  await expect(page.getByRole('button', { name: 'Deshacer' })).toHaveAttribute('title', 'Mover Tile0');
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(piece).toHaveAttribute('data-x', '0');
  await page.keyboard.press('Control+y');
  await expect(piece).toHaveAttribute('data-x', '3.5');

  // R turns it a quarter, and the field takes a turn too
  await page.keyboard.press('r');
  await expect(turn).toHaveValue('90');
  await turn.selectOption('180');
  await expect(turn).toHaveValue('180');
  await page.keyboard.press('Control+z');
  await expect(turn).toHaveValue('90');

  // Renamed as Valkyrie renames: the type stays in front
  await page.locator('.editor-props form input').fill('Hall');
  await page.locator('.editor-props form').getByRole('button', { name: 'Renombrar' }).click();
  await expect(title).toHaveText('TileHall');
  await expect(list.getByRole('button', { name: 'TileHall' })).toBeVisible();

  // A token, then back to what was chosen before it
  await list.getByRole('button', { name: '{Nuevo Marcador}' }).click();
  await expect(title).toHaveText('Token0');
  await page.getByRole('button', { name: 'Volver a lo elegido antes' }).click();
  await expect(title).toHaveText('TileHall');

  // Deleted after asking, and then what was chosen before it is (QuestEditorData.DeleteCurrentComponent)
  await list.getByRole('button', { name: 'Token0' }).click();
  await page.locator('.editor-props').getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.locator('.editor-props').getByRole('alert')).toContainText('¿Borrar Token0?');
  await page.locator('.editor-props').getByRole('alert').getByRole('button', { name: 'Eliminar' }).click();
  await expect(list.getByRole('button', { name: 'Token0' })).toHaveCount(0);
  await expect(title).toHaveText('TileHall');

  // Leaving with changes not saved asks first
  await page.getByRole('button', { name: 'Volver', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Hay cambios sin guardar');
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await page.keyboard.press('Control+s');
  await expect(page.getByRole('status')).toHaveText('Guardado.');
  await expect(page.getByText('Sin guardar')).toHaveCount(0);
  await page.getByRole('tab', { name: 'Ficheros' }).click();
  await expect(page.locator('.editor-files')).toContainText('tiles.ini');
  await expect(page.locator('.editor-files')).not.toContainText('tokens.ini');

  // Reload reads the files again: with changes not saved, it asks first, and then they are gone
  await list.getByRole('button', { name: '{Nuevo Evento}' }).click();
  await expect(title).toHaveText('Event0');
  await fileMenu(page);
  await page.getByRole('menuitem', { name: 'Recargar' }).click();
  await expect(page.getByRole('alert')).toContainText('Recargar vuelve a leer los ficheros');
  await page.getByRole('alert').getByRole('button', { name: 'Recargar' }).click();
  await expect(list.getByRole('button', { name: 'Event0' })).toHaveCount(0);
  await expect(page.getByText('Sin guardar')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Deshacer' })).toBeDisabled();

  // Saved as it was left: opened again, the tile is where it was put
  await page.getByRole('button', { name: 'Volver', exact: true }).click();
  await page.getByRole('button', { name: /Mesa/ }).click();
  await list.getByRole('button', { name: 'TileHall' }).click();
  await expect(piece).toHaveAttribute('data-x', '3.5');
  await expect(turn).toHaveValue('90');
});

test('keeps a version of the files at each save, and goes back to one', async ({ page }) => {
  await openEditor(page);
  await page.getByRole('button', { name: 'Nuevo' }).click();
  await page.getByLabel('Nombre de carpeta del escenario').fill('Versiones');
  await page.getByRole('button', { name: 'Crear' }).click();
  await page.getByRole('button', { name: /Versiones/ }).click();
  const list = page.locator('.editor-components');
  const versions = page.locator('.editor-versions li');
  await page.getByRole('tab', { name: 'Versiones' }).click();
  await expect(page.getByText('Aún no hay versiones')).toBeVisible();

  // The first save rewrites Valkyrie's starter files: they are kept as they were
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(versions).toHaveCount(1);
  // Saved again with nothing changed: nothing new to keep
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Guardado.');
  await expect(versions).toHaveCount(1);

  // A tile, saved: the files without it are the newest version
  await list.getByRole('button', { name: '{Nuevo Tablero}' }).click();
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(versions).toHaveCount(2);
  await page.getByRole('tab', { name: 'Ficheros' }).click();
  await expect(page.locator('.editor-files')).toContainText('tiles.ini');

  // Going back to it asks first, keeps the files of now as another version and opens it again without the tile
  await page.getByRole('tab', { name: 'Versiones' }).click();
  await versions.first().getByRole('button', { name: 'Restaurar' }).click();
  await expect(versions.first().getByRole('alert')).toContainText('Los ficheros de ahora se guardan antes como otra versión');
  await versions.first().getByRole('alert').getByRole('button', { name: 'Restaurar' }).click();
  await expect(page.getByRole('status')).toContainText('De vuelta a la versión del');
  await expect(list.getByRole('button', { name: 'Tile0' })).toHaveCount(0);
  await expect(versions).toHaveCount(3);
  await expect(page.getByText('Sin guardar')).toHaveCount(0);

  // And the newest of them has the tile: going back to it brings it back
  await versions.first().getByRole('button', { name: 'Restaurar' }).click();
  await versions.first().getByRole('alert').getByRole('button', { name: 'Restaurar' }).click();
  await expect(list.getByRole('button', { name: 'Tile0' })).toBeVisible();

  // A package of a scenario that breaks Valkyrie (it has no start) asks first, and Cancel makes none
  await fileMenu(page);
  await page.getByRole('menuitem', { name: 'Crear Paquete' }).click();
  await expect(page.getByRole('alert')).toContainText('Quien juegue el paquete se los encontrará');
  await page.getByRole('alert').getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('takes up the changes the editor closed without saving', async ({ page, context }) => {
  await openEditor(page);
  await page.getByRole('button', { name: 'Nuevo' }).click();
  await page.getByLabel('Nombre de carpeta del escenario').fill('Borrador');
  await page.getByRole('button', { name: 'Crear' }).click();
  await page.getByRole('button', { name: /Borrador/ }).click();
  await page.locator('.editor-components').getByRole('button', { name: '{Nuevo Tablero}' }).click();
  await expect(page.getByText('Sin guardar')).toBeVisible();

  // A moment after a change, what is not saved is kept apart, and the browser's storage writes it
  await expect
    .poll(() =>
      page.evaluate(async (url) => {
        const engine = (await import(url)) as { QuestEditorVersions: { draft(folder: string): unknown } };
        return engine.QuestEditorVersions.draft('/AppData/Valkyrie/MoM/Editor/Borrador') !== null;
      }, engineUrl),
    )
    .toBe(true);
  await page.evaluate(async () => {
    const storage = (await import('/src/host/storage.ts' as string)) as { keptFolder(): { whenIdle(): Promise<void> } | null };
    await storage.keptFolder()?.whenIdle();
  });

  // Closed without saving, as when a tab is closed or the browser stops
  await page.close({ runBeforeUnload: false });
  const again = await context.newPage();
  await again.route('https://raw.githubusercontent.com/**', (route) => route.abort());
  await openEditor(again);
  await again.getByRole('button', { name: /Borrador/ }).click();
  const list = again.locator('.editor-components');
  await expect(list.getByRole('button', { name: 'Tile0' })).toHaveCount(0);
  await expect(again.locator('.editor-draft')).toContainText('Hay cambios sin guardar del');
  await again.getByRole('button', { name: 'Recuperarlos' }).click();
  await expect(list.getByRole('button', { name: 'Tile0' })).toBeVisible();
  await expect(again.getByText('Sin guardar')).toBeVisible();
  // Taking them up is a change that Undo takes back
  await expect(again.getByRole('button', { name: 'Deshacer' })).toHaveAttribute('title', 'Recuperar los cambios sin guardar');

  // Saved, it is not offered again
  await again.getByRole('button', { name: 'Guardar', exact: true }).click();
  await again.getByRole('button', { name: 'Volver', exact: true }).click();
  await again.getByRole('button', { name: /Borrador/ }).click();
  await expect(list.getByRole('button', { name: 'Tile0' })).toBeVisible();
  await expect(again.locator('.editor-draft')).toHaveCount(0);
});

test('changes a component as the lines of its file, in text mode', async ({ page }) => {
  await openEditor(page);
  await page.getByRole('button', { name: 'Nuevo' }).click();
  await page.getByLabel('Nombre de carpeta del escenario').fill('Lineas');
  await page.getByRole('button', { name: 'Crear' }).click();
  await page.getByRole('button', { name: /Lineas/ }).click();
  await page.locator('.editor-components').getByRole('button', { name: '{Nuevo Evento}' }).click();
  await page.getByRole('button', { name: 'Modo texto' }).click();
  const section = page.getByLabel('Su sección del .ini');
  const texts = page.locator('.editor-text-mode textarea').nth(1);
  // QuestEditorData.NewEvent, as Valkyrie writes it
  await expect(section).toHaveValue('[Event0]\ndisplay=false\nbuttons=0');
  await expect(texts).toHaveValue('');

  // The start of the scenario, written by hand: read as Valkyrie reads its files, and written back as it writes them
  await section.fill('[Event0]\ntrigger=EventStart\nbuttons=1');
  await texts.fill('Event0.text,Bienvenidos\nEvent0.button1,Entrar');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(section).toHaveValue('[Event0]\nbuttons=1\nevent1=\ntrigger=EventStart');
  await expect(texts).toHaveValue('Event0.text,Bienvenidos\nEvent0.button1,Entrar');
  await expect(page.locator('.editor-bottom [data-code="start-none"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Deshacer' })).toHaveAttribute('title', 'Texto de Event0');

  // Lines of another component are refused, and nothing changes
  await section.fill('[Event1]\nbuttons=1');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.locator('.editor-text-mode').getByRole('alert')).toContainText('La primera línea tiene que ser [Event0]');
  await page.getByRole('button', { name: 'Volver a como está' }).click();
  await expect(section).toHaveValue('[Event0]\nbuttons=1\nevent1=\ntrigger=EventStart');

  // Undone and done again, then saved
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(section).toHaveValue('[Event0]\ndisplay=false\nbuttons=0');
  await page.getByRole('button', { name: 'Rehacer' }).click();
  await expect(section).toHaveValue('[Event0]\nbuttons=1\nevent1=\ntrigger=EventStart');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Guardado.');
  await page.getByRole('tab', { name: 'Ficheros' }).click();
  await expect(page.locator('.editor-files')).toContainText('events.ini');

  // The quest itself: its [Quest] section and its quest.* texts
  await page.locator('.editor-components').getByRole('button', { name: 'Escenario', exact: true }).click();
  await expect(section).toHaveValue(/^\[Quest\]\nformat=21\n/);
  await expect(texts).toHaveValue('quest.name,Lineas\nquest.description,Lineas...');
  await texts.fill('quest.name,Las líneas\nquest.description,Una prueba');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Las líneas');
  // Its game is not changed here: Save writes it
  await section.fill((await section.inputValue()).replace('type=MoM', 'type=D2E'));
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.locator('.editor-text-mode').getByRole('alert')).toContainText('lo pone el editor al guardar');
});

test("fills an event as Valkyrie's event panel does, and writes it as Valkyrie would", async ({ page }) => {
  await openEditor(page);
  await page.getByRole('button', { name: 'Nuevo' }).click();
  await page.getByLabel('Nombre de carpeta del escenario').fill('Panel');
  await page.getByRole('button', { name: 'Crear' }).click();
  await page.getByRole('button', { name: /Panel/ }).click();
  const list = page.locator('.editor-components');
  const undo = page.getByRole('button', { name: 'Deshacer' });
  const part = (title: string) => page.locator('.editor-event-part').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
  await list.getByRole('button', { name: '{Nuevo Evento}' }).click();

  // EditorComponentEvent.UpdateText: a dialog shows the event, with a button to go on
  const dialog = page.getByRole('textbox', { name: 'Diálogo', exact: true });
  await dialog.fill('Bienvenidos');
  await dialog.blur();
  await expect(undo).toHaveAttribute('title', 'Cambiar Event0');
  await expect(page.getByRole('textbox', { name: 'Texto del botón 1' })).toHaveText('Continuar');

  // The row of symbols over the box puts a symbol where the caret was (UIElementEditablePaneled.InsertCharacter), drawn as the symbol
  const symbols = page.locator('.editor-paneled').filter({ has: dialog }).getByRole('group', { name: 'Insertar un símbolo' });
  await expect(symbols.getByRole('button')).toHaveCount(10);
  await symbols.getByRole('button', { name: '{lore}' }).click();
  await expect(dialog.locator('[data-code="{lore}"]')).toHaveCount(1);
  await expect(dialog).toBeFocused();
  await dialog.blur();
  // Its look in a game, over the map: the symbol drawn, and its button
  await part('Diálogo').getByRole('button', { name: 'Verlo como en la partida' }).click();
  const shown = page.locator('.editor-show');
  await expect(shown.locator('.event-text')).toContainText('Bienvenidos');
  await expect(shown.locator('.event-text')).not.toContainText('{lore}');
  await expect(shown.locator('.event-button')).toHaveText('Continuar');
  await page.keyboard.press('Escape');
  await expect(shown).toHaveCount(0);

  // The start of the scenario
  await page.getByLabel('Activador', { exact: true }).selectOption('EventStart');
  await expect(page.locator('.editor-bottom [data-code="start-none"]')).toHaveCount(0);

  // The button goes on to a new event, which its arrow opens
  const button = page.locator('.editor-button').first();
  await button.locator('select.editor-add').selectOption('{NEW:Event}');
  await expect(list.getByRole('button', { name: 'Event1' })).toBeVisible();
  await button.getByRole('button', { name: 'Ir a Event1' }).click();
  await expect(page.locator('.editor-props h2')).toHaveText('Event1');
  await page.getByRole('button', { name: 'Volver a lo elegido antes' }).click();
  await expect(page.locator('.editor-props h2')).toHaveText('Event0');

  // A condition on the button, hidden when it fails, in a window of its own (EditorWindowQuestButtonEdit)
  await button.getByRole('button', { name: 'Condición' }).click();
  const condition = page.getByRole('dialog', { name: 'Condición del botón 1 de Event0' });
  await condition.locator('select.editor-add').selectOption('#round');
  await condition.getByRole('radio', { name: 'Ocultar' }).click();
  await expect(condition.getByRole('radio', { name: 'Ocultar' })).toHaveAttribute('aria-checked', 'true');
  await condition.getByRole('button', { name: 'Ok' }).click();
  await expect(condition).toHaveCount(0);
  await expect(button.getByRole('button', { name: 'Condición' })).toHaveClass(/editor-condition-hide/);

  // A test of the event: how many heroes, at least a number typed
  const tests = part('Pruebas');
  await tests.locator('select.editor-add').selectOption('#heroes');
  await tests.locator('select.editor-op').selectOption('>=');
  await tests.locator('select.editor-value').selectOption('{NUMBER}');
  await tests.getByLabel('Número').fill('2');
  await tests.getByLabel('Número').press('Enter');
  await expect(tests.locator('select.editor-value')).toHaveValue('2');

  // An assignment to a new variable, its name as Valkyrie takes it (EditorComponentVarTestsUtil.NewVar)
  const assign = part('Asignar');
  await assign.locator('select.editor-add').selectOption('{NEW}');
  await assign.getByLabel('Nombre Variable:').fill('pistas encontradas!');
  await assign.getByRole('button', { name: 'Ok' }).click();
  await expect(assign.locator('code')).toHaveText('pistasencontradas');
  await assign.locator('select.editor-op').selectOption('+');
  await assign.locator('select.editor-value').selectOption('{NUMBER}');
  await assign.getByLabel('Número').fill('1');
  await assign.getByLabel('Número').press('Enter');

  // Written as Valkyrie writes it
  await page.getByRole('button', { name: 'Modo texto' }).click();
  await expect(page.getByLabel('Su sección del .ini')).toHaveValue(
    [
      '[Event0]',
      'operations=pistasencontradas,+,1',
      'vartests=VarOperation:#heroes,>=,2 ',
      'buttons=1',
      'event1=Event1',
      'event1Condition=VarOperation:#round,>,0 ',
      'event1ConditionAction=hide',
      'trigger=EventStart',
    ].join('\n'),
  );
  await expect(page.locator('.editor-text-mode textarea').nth(1)).toHaveValue('Event0.text,Bienvenidos{lore}\nEvent0.button1,Continuar');
  await page.getByRole('button', { name: 'Modo texto' }).click();

  // Each change is one step back
  await undo.click();
  await expect(part('Asignar').locator('select.editor-value')).toHaveValue('0');
  await page.getByRole('button', { name: 'Rehacer' }).click();
  await expect(part('Asignar').locator('select.editor-value')).toHaveValue('1');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Guardado.');
});

test("sets the scenario's fields and those of tiles, tokens and doors as Valkyrie's panels do", async ({ page }) => {
  await openEditor(page);
  await page.getByRole('button', { name: 'Nuevo' }).click();
  await page.getByLabel('Nombre de carpeta del escenario').fill('Fichas');
  await page.getByRole('button', { name: 'Crear' }).click();
  await page.getByRole('button', { name: /Fichas/ }).click();
  const list = page.locator('.editor-components');
  const props = page.locator('.editor-props');
  const section = page.getByLabel('Su sección del .ini');
  const textMode = page.getByRole('button', { name: 'Modo texto' });

  // The scenario itself (EditorComponentQuest): its name, hidden, a pack it needs, its heroes and its difficulty
  await props.getByLabel('Nombre', { exact: true }).fill('La casa de las fichas');
  await props.getByLabel('Nombre', { exact: true }).press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('La casa de las fichas');
  await props.getByLabel('Oculto').check();
  await props.getByLabel('Selección de Paquetes').selectOption('SoA');
  await expect(props.getByRole('button', { name: 'Quitar SoA' })).toBeVisible();
  await props.getByLabel('Max Investigadores').fill('4');
  await props.getByLabel('Max Investigadores').blur();
  await props.getByLabel('Dificultad', { exact: true }).fill('0.5');
  await props.getByLabel('Dificultad', { exact: true }).blur();
  await expect(page.getByRole('button', { name: 'Deshacer' })).toHaveAttribute('title', 'Cambiar Escenario');
  await textMode.click();
  await expect(section).toHaveValue(/\nhidden=True(\n|$)/);
  await expect(section).toHaveValue(/\npacks=SoA(\n|$)/);
  await expect(section).toHaveValue(/\nmaxhero=4(\n|$)/);
  await expect(section).toHaveValue(/\ndifficulty=0\.5(\n|$)/);
  await textMode.click();

  // A tile's side, from the window with the packs, as ChangeTileSide opens it: on the side's own pack
  await list.getByRole('button', { name: '{Nuevo Tablero}' }).click();
  await props.getByRole('button', { name: 'Imagen', exact: true }).click();
  const window = page.getByRole('dialog');
  await expect(window.getByRole('heading', { name: 'Selección de Tablero' })).toBeVisible();
  await expect(window.getByRole('button', { name: /^MoMBase/ })).toHaveAttribute('aria-pressed', 'true');
  // A pack the scenario does not ask for starts left out; one it asks for does not
  await expect(window.getByRole('button', { name: /^Dejar fuera BtT/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(window.getByRole('button', { name: /^Dejar fuera SoA/ })).toHaveAttribute('aria-pressed', 'false');
  await window.getByLabel('Buscar por nombre o ID').fill('alley2');
  await window.getByRole('button', { name: /TileSideAlley2/ }).click();
  await expect(window).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Deshacer' })).toHaveAttribute('title', 'Cambiar Tile0');
  // R turns it as Valkyrie's tile button does
  await list.getByRole('button', { name: 'Tile0' }).click();
  await page.keyboard.press('r');
  await textMode.click();
  await expect(section).toHaveValue(/\nside=TileSideAlley2(\n|$)/);
  await expect(section).toHaveValue(/\nrotation=90(\n|$)/);
  await textMode.click();

  // A token's type, size and click; Escape closes the window and changes nothing
  await list.getByRole('button', { name: '{Nuevo Marcador}' }).click();
  await props.getByRole('button', { name: 'Tipo', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await props.getByRole('button', { name: 'Tipo', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Buscar por nombre o ID').fill('TokenInteract');
  await page.getByRole('dialog').getByLabel('Buscar por nombre o ID').press('Enter');
  await props.getByLabel('Tamaño').selectOption('huge');
  await props.getByLabel('Comportamiento al hacer clic').selectOption('false');
  await textMode.click();
  await expect(section).toHaveValue(/\ntype=TokenInteract(\n|$)/);
  await expect(section).toHaveValue(/\ntokensize=huge(\n|$)/);
  await expect(section).toHaveValue(/\nclickeffect=false(\n|$)/);
  await textMode.click();

  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Guardado.');
});

test("sets UI elements, spawns, quest items, puzzles and custom monsters as Valkyrie's panels do", async ({ page }) => {
  await openEditor(page);
  await page.getByRole('button', { name: 'Nuevo' }).click();
  await page.getByLabel('Nombre de carpeta del escenario').fill('Partes');
  await page.getByRole('button', { name: 'Crear' }).click();
  await page.getByRole('button', { name: /Partes/ }).click();
  const list = page.locator('.editor-components');
  const props = page.locator('.editor-props');
  const section = page.getByLabel('Su sección del .ini');
  const texts = page.locator('.editor-text-mode textarea').nth(1);
  const textMode = page.getByRole('button', { name: 'Modo texto' });

  // A UI element's text, placed at the top left, smaller and red (EditorComponentUI)
  await list.getByRole('button', { name: '{Nuevo Interfaz}' }).click();
  await props.getByLabel('Texto', { exact: true }).fill('Hola');
  await props.getByLabel('Texto', { exact: true }).blur();
  await props.getByRole('button', { name: 'Arriba · Izquierda' }).click();
  await expect(props.getByRole('button', { name: 'Arriba · Izquierda' })).toHaveAttribute('aria-pressed', 'true');
  await props.getByLabel('Tamaño', { exact: true }).fill('0.3');
  await props.getByLabel('Tamaño', { exact: true }).blur();
  await props.getByLabel('Color', { exact: true }).selectOption('red');
  await textMode.click();
  await expect(section).toHaveValue(/\nsize=0\.3(\n|$)/);
  await expect(section).toHaveValue(/\ntextcolor=red(\n|$)/);
  await expect(section).toHaveValue(/\nhalign=left(\n|$)/);
  await expect(section).toHaveValue(/\nvalign=top(\n|$)/);
  await expect(texts).toHaveValue('UI0.uitext,Hola');
  await textMode.click();

  // A spawn: activated, with health, a second monster from the window and a trait it is drawn by (EditorComponentSpawn)
  await list.getByRole('button', { name: '{Nuevo Generar}' }).click();
  await props.getByLabel('Activado', { exact: true }).check();
  await props.getByLabel('Salud', { exact: true }).fill('5');
  await props.getByLabel('Salud', { exact: true }).blur();
  await props.getByRole('button', { name: 'Añadir un monstruo' }).click();
  await page.getByRole('dialog').getByLabel('Buscar por nombre o ID').fill('MonsterDeepOne');
  await page.getByRole('dialog').getByRole('button', { name: /MonsterDeepOne$/ }).click();
  await props.locator('select.editor-add[aria-label="Atributos Req."]').selectOption({ index: 1 });
  await textMode.click();
  await expect(section).toHaveValue(/\nmonster=MonsterCultist MonsterDeepOne(\n|$)/);
  await expect(section).toHaveValue(/\nuniquehealth=5(\n|$)/);
  await expect(section).toHaveValue(/\nactivated=true(\n|$)/);
  await expect(section).toHaveValue(/\ntraits=\S+(\n|$)/);
  await textMode.click();

  // A starting item, from the window, shown by a new event when inspected (EditorComponentItem)
  await list.getByRole('button', { name: '{Nuevo Objeto de Escenario}' }).click();
  await props.getByLabel('Objeto Inicial').check();
  await props.getByRole('button', { name: 'Añadir un objeto' }).click();
  await page.getByRole('dialog').getByLabel('Buscar por nombre o ID').fill('ItemCommon2x4');
  await page.getByRole('dialog').getByLabel('Buscar por nombre o ID').press('Enter');
  await props.getByRole('button', { name: 'Inspeccionar' }).click();
  await page.getByRole('dialog').getByRole('button', { name: /^\{Nuevo Evento\}/ }).click();
  await expect(list.getByRole('button', { name: 'Event0' })).toBeVisible();
  await textMode.click();
  await expect(section).toHaveValue(/\nitemname=ItemCommon2x4(\n|$)/);
  await expect(section).toHaveValue(/\nstarting=True(\n|$)/);
  await expect(section).toHaveValue(/\ninspect=Event0(\n|$)/);
  await textMode.click();

  // A code puzzle, and a solution that does not fit its level, refused as Valkyrie refuses it (EditorComponentPuzzle)
  await list.getByRole('button', { name: '{Nuevo Puzzle}' }).click();
  await props.getByLabel('Tipo', { exact: true }).selectOption('code');
  await props.getByLabel('Dificultad', { exact: true }).fill('3');
  await props.getByLabel('Dificultad', { exact: true }).blur();
  await props.getByLabel('Dificultad Alt.').fill('4');
  await props.getByLabel('Dificultad Alt.').blur();
  await expect(props.getByLabel('Solución')).toHaveAttribute('placeholder', '1 2 3');
  await props.getByLabel('Solución').fill('9 9 9');
  await props.getByLabel('Solución').blur();
  await expect(props.getByRole('alert')).toContainText('Tienen que ser 3 números del 1 al 4');
  await props.getByLabel('Solución').fill('4 1 2');
  await props.getByLabel('Solución').blur();
  await textMode.click();
  await expect(section).toHaveValue(/\nclass=code(\n|$)/);
  await expect(section).toHaveValue(/\npuzzlelevel=3(\n|$)/);
  await expect(section).toHaveValue(/\npuzzlesolution=4 1 2(\n|$)/);
  await textMode.click();

  // A custom monster on a base, with a name and health of its own and an event as its activation (EditorComponentCustomMonster)
  await list.getByRole('button', { name: '{Nuevo Monstruo Personalizado}' }).click();
  await props.getByRole('button', { name: 'Base', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Buscar por nombre o ID').fill('MonsterCultist');
  await page.getByRole('dialog').getByLabel('Buscar por nombre o ID').press('Enter');
  // A new monster's name is already its own (QuestData.CustomMonster gives it its section's name); its health is the base's until set
  await expect(props.getByRole('button', { name: 'Restablecer' })).toHaveCount(1);
  await props.getByLabel('Nombre', { exact: true }).fill('El sectario');
  await props.getByLabel('Nombre', { exact: true }).blur();
  await props.getByRole('button', { name: 'Salud', exact: true }).click();
  await props.getByLabel('Salud', { exact: true }).fill('3');
  await props.getByLabel('Salud', { exact: true }).blur();
  await props.getByRole('button', { name: 'Activaciones', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Buscar por nombre o ID').press('Enter');
  await textMode.click();
  await expect(section).toHaveValue(/\nbase=MonsterCultist(\n|$)/);
  await expect(section).toHaveValue(/\nhealth=3(\n|$)/);
  await expect(section).toHaveValue(/\nactivation=Event1(\n|$)/);
  await expect(texts).toHaveValue(/CustomMonster0\.monstername,El sectario/);
  await textMode.click();

  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Guardado.');
});

test("makes Descent's doors, spawns' places, monster places and activations as Valkyrie's panels do", async ({ page }) => {
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Descent/ }).click();
  // Descent's menu says adventure (D2E_QUEST_NAME)
  await pressEditor(page, 'Editar Aventura');
  await page.getByRole('button', { name: 'Nuevo' }).click();
  await page.getByLabel('Nombre de carpeta del escenario').fill('Puertas');
  await page.getByRole('button', { name: 'Crear' }).click();
  await page.getByRole('button', { name: /Puertas/ }).click();
  const props = page.locator('.editor-props');
  const section = page.getByLabel('Su sección del .ini');
  const textMode = page.getByRole('button', { name: 'Modo texto' });
  // Doors and monster places are Descent's (QuestEditorData.TypeSelect)
  await page.locator('.editor-components').getByRole('button', { name: '{Nuevo Puerta}' }).click();
  await expect(props.getByLabel('Rotación').locator('option')).toHaveText(['0°', '90°']);
  await props.getByLabel('Rotación').selectOption('90');
  await page.keyboard.press('r');
  // A door's colour is a small square that opens a palette
  await props.getByRole('button', { name: /^Color:/ }).click();
  await page.getByRole('dialog', { name: 'Color' }).getByRole('button', { name: 'red', exact: true }).click();
  await textMode.click();
  await expect(section).toHaveValue(/\ncolor=red(\n|$)/);
  // R after 90 turns it back, as EditorComponentDoor.Rotate does
  await expect(section).not.toHaveValue(/rotation=/);
  await textMode.click();

  // A spawn's places for two heroes: a new monster place made from the window (EditorComponentSpawn), and its own fields (EditorComponentMPlace)
  const list = page.locator('.editor-components');
  await list.getByRole('button', { name: '{Nuevo Generar}' }).click();
  await props.getByRole('button', { name: 'Añadir una casilla para 2 héroes' }).click();
  await page.getByRole('dialog').getByLabel('Buscar por nombre o ID').press('Enter');
  await expect(list.getByRole('button', { name: /^MPlace0/ })).toBeVisible();
  await textMode.click();
  await expect(section).toHaveValue(/\nplacement2=MPlace0(\n|$)/);
  await textMode.click();
  await props.getByRole('button', { name: 'Ir a MPlace0' }).click();
  await expect(props.getByRole('heading', { level: 2 })).toHaveText('MPlace0');
  await props.getByLabel('Maestro').check();
  await props.getByLabel('Tamaño').selectOption('huge');
  await textMode.click();
  await expect(section).toHaveValue(/\nmaster=true(\n|$)/);
  await expect(section).toHaveValue(/\ntokensize=huge(\n|$)/);
  await textMode.click();

  // A custom monster's activation, new from its window, with its ability and its master first (EditorComponentActivation)
  await list.getByRole('button', { name: '{Nuevo Monstruo Personalizado}' }).click();
  await props.getByRole('button', { name: 'Añadir una activación' }).click();
  await page.getByRole('dialog').getByLabel('Buscar por nombre o ID').press('Enter');
  await props.getByRole('button', { name: 'Ir a Activation0' }).click();
  await props.getByLabel('Capacidad', { exact: true }).fill('Ataca');
  await props.getByLabel('Capacidad', { exact: true }).blur();
  await props.getByLabel('Maestro: Primero').check();
  await textMode.click();
  await expect(section).toHaveValue(/\nmasterfirst=True(\n|$)/);
  await expect(page.locator('.editor-text-mode textarea').nth(1)).toHaveValue('Activation0.ability,Ataca');
  await textMode.click();

  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Guardado.');

  // A test: Descent's heroes take their classes next, and that screen's Back goes back to the editor, as in Valkyrie
  // (ClassSelectionScreen.BackButtonAction), with the history
  await page.getByRole('button', { name: 'Guardar y Probar' }).click();
  await page.getByRole('group', { name: 'Número de Héroes' }).getByRole('button', { name: 'Iniciar' }).click();
  const classes = page.locator('.class-selection');
  await expect(classes.locator('.class-hero')).toHaveCount(2);
  await classes.getByRole('button', { name: 'Volver' }).click();
  await expect(page.getByRole('heading', { name: 'Puertas', level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Deshacer' })).toBeEnabled();
});

test("marks on the map where the chosen component is, as Valkyrie's panels do, without hiding the piece under the mark", async ({ page }) => {
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Descent/ }).click();
  await pressEditor(page, 'Editar Aventura');
  await page.getByRole('button', { name: 'Nuevo' }).click();
  await page.getByLabel('Nombre de carpeta del escenario').fill('Marcas');
  await page.getByRole('button', { name: 'Crear' }).click();
  await page.getByRole('button', { name: /Marcas/ }).click();
  const list = page.locator('.editor-components');
  const title = page.locator('#editor-props-title');
  const piece = page.locator('.editor-piece');
  const marks = () =>
    page.evaluate(() =>
      (globalThis as unknown as Probed)
        .universalisBoard!.tokenObjects()
        .filter((o) => o.tag === 'editor')
        .map((o) => `${o.name} ${o.x} ${o.y}`),
    );

  // A tile marks its anchor (EditorComponentTile), a door its place (EditorComponentEvent.Highlight)
  await list.getByRole('button', { name: '{Nuevo Tablero}' }).click();
  await expect(title).toHaveText('Tile0');
  await expect.poll(marks).toEqual(['HighlightTileAnchor 0 0']);
  await list.getByRole('button', { name: '{Nuevo Puerta}' }).click();
  await expect(title).toHaveText('Door0');
  const doorX = Number(await piece.getAttribute('data-x'));
  const doorY = Number(await piece.getAttribute('data-y'));
  await expect.poll(marks).toEqual([`HighlightEventLoc ${doorX} ${doorY}`]);

  // Where the mark lies over the door, the door is what is pressed (over the tile under it): dragged a square to the right, it moves, and its mark with it
  await list.getByRole('button', { name: 'Escenario', exact: true }).click();
  await page.locator('.editor-map').scrollIntoViewIfNeeded();
  const at = await onPage(page, doorX - 0.4, doorY + 0.1);
  await page.mouse.move(at.x, at.y);
  await expect(page.locator('.editor-map-status')).toContainText('· Door0');
  await page.mouse.click(at.x, at.y);
  await expect(title).toHaveText('Door0');
  const to = await onPage(page, doorX + 0.6, doorY + 0.1);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(at.x + ((to.x - at.x) * i) / 10, at.y + ((to.y - at.y) * i) / 10);
  await page.mouse.up();
  await expect(piece).toHaveAttribute('data-x', String(doorX + 1));
  await expect.poll(marks).toEqual([`HighlightEventLoc ${doorX + 1} ${doorY}`]);

  // A token only moves the camera (EditorComponentToken.Highlight); an event marks its place once it has one
  await list.getByRole('button', { name: '{Nuevo Marcador}' }).click();
  await expect(title).toHaveText('Token0');
  await expect.poll(marks).toEqual([]);
  await list.getByRole('button', { name: '{Nuevo Evento}' }).click();
  await expect(title).toHaveText('Event0');
  await expect.poll(marks).toEqual([]);
  await page.locator('.editor-props').getByLabel('Posición').selectOption({ index: 1 });
  await expect.poll(async () => (await marks()).map((mark) => mark.split(' ')[0])).toEqual(['HighlightEventLoc']);

  // The adventure itself: none
  await list.getByRole('button', { name: 'Escenario', exact: true }).click();
  await expect.poll(marks).toEqual([]);
});

/** A scenario to read: a start that sets a variable and adds a token, a way to the end, a variable's trigger and an event nothing reaches. */
function readable(): Buffer {
  const events = [
    '[EventStart]', 'trigger=EventStart', 'buttons=1', 'event1=EventA', 'add=TokenLook', 'operations=@go,=,1', '',
    '[EventA]', 'buttons=2', 'event1=EventWin', 'event1Condition=VarOperation:clues,>=,2 ', 'event2=EventA', '',
    '[EventWin]', 'buttons=1', 'operations=$end,=,1', '',
    '[EventGo]', 'trigger=Vargo', 'buttons=1', 'operations=clues,+,1', '',
    '[EventLoose]', 'buttons=1', '',
    '[TokenLook]', 'type=TokenSearch', 'xposition=0', 'yposition=0', 'buttons=1', 'event1=EventA', '',
  ];
  const texts = [
    '.,English', 'quest.name,Readable', 'EventStart.text,You have {var:clues} clues', 'EventStart.button1,Go on', 'EventA.text,A choice',
    'EventA.button1,Open the door', 'EventA.button2,Wait', 'EventWin.text,You win', 'EventWin.button1,End', 'EventGo.text,Go',
    'EventGo.button1,Ok', 'EventLoose.text,Alone', 'EventLoose.button1,Ok', 'TokenLook.text,A desk', 'TokenLook.button1,Search', '',
  ];
  return Buffer.from(
    zipSync({
      'quest.ini': strToU8('[Quest]\r\nformat=21\r\ntype=MoM\r\nhidden=True\r\ndefaultlanguage=English\r\n\r\n[QuestText]\r\nLocalization.English.txt\r\n\r\n[QuestData]\r\nevents.ini\r\n'),
      'events.ini': strToU8(events.join('\r\n')),
      'Localization.English.txt': strToU8(texts.join('\r\n')),
    }),
  );
}

test('says each problem in words, and shows the tree of events and the variables', async ({ page }) => {
  await openEditor(page);
  await page.locator('input[type=file][accept=".valkyrie,.zip"]').setInputFiles({ name: 'Readable.valkyrie', mimeType: 'application/zip', buffer: readable() });
  await page.getByRole('button', { name: /Readable/ }).click();
  const bottom = page.locator('.editor-bottom');
  const title = page.locator('#editor-props-title');

  // A problem in words, where it is; pressing it chooses that component
  const neverRun = bottom.locator('[data-code="never-run"]');
  await expect(neverRun.locator('.editor-problem-where')).toHaveText('EventLoose');
  await expect(neverRun.locator('.editor-problem-text')).toHaveText('Nada lo lanza: no llega a él ningún activador, botón ni ficha.');
  await neverRun.click();
  await expect(title).toHaveText('EventLoose');

  // A problem whose mend is certain has a button that mends it, a change Undo takes back: a main scenario that is hidden
  const hidden = bottom.locator('li:has([data-code="hidden"])');
  await expect(hidden.locator('.editor-problem-where')).toHaveText('quest.ini [Quest]');
  await hidden.getByRole('button', { name: 'Que salga en la lista' }).click();
  await expect(hidden).toHaveCount(0);
  const undo = page.getByRole('button', { name: 'Deshacer' });
  await expect(undo).toHaveAttribute('title', 'Que salga en la lista');
  await undo.click();
  await expect(hidden).toHaveCount(1);
  // One that does not break Valkyrie can be left untold: apart, until it is told again
  const loose = page.locator('.editor-components').getByRole('button', { name: 'EventLoose' });
  await expect(loose.getByRole('img', { name: 'No hará lo que quería el autor' })).toBeVisible();
  await bottom.locator('li:has([data-code="never-run"])').getByRole('button', { name: 'No avisar más' }).click();
  const untold = bottom.locator('.editor-level-ignored');
  await expect(untold.locator('summary')).toHaveText('Sin avisar (1)');
  await expect(loose.getByRole('img')).toHaveCount(0);
  await untold.locator('summary').click();
  await untold.getByRole('button', { name: 'Volver a avisar' }).click();
  await expect(untold).toHaveCount(0);
  await expect(bottom.locator('[data-code="never-run"]')).toBeVisible();

  // The tree from the start: the start opened, with its button, what it adds and the event its variable starts (the
  // arrow between how and where is drawn by the stylesheet)
  await bottom.getByRole('tab', { name: 'Árbol' }).click();
  const tree = bottom.locator('.editor-tree');
  await expect(tree.locator('.editor-tree-trigger').first()).toHaveText('Activador: EventStart');
  const start = tree.locator('.editor-tree-item').filter({ has: page.getByRole('button', { name: 'EventStart', exact: true }) }).first();
  await expect(start).toContainText('Botón 1Go onEventA');
  await expect(start).toContainText('añadeTokenLook');
  await expect(start).toContainText('pone @goEventGo');
  // Opened, EventA says its buttons with their conditions, the way to the end and its loop
  await start.getByRole('button', { name: 'Abrir EventA' }).first().click();
  const a = start.locator('.editor-tree-item').filter({ has: page.getByRole('button', { name: 'EventA', exact: true }) }).first();
  await expect(a).toContainText('Botón 1Open the doorsi clues >= 2EventWin');
  await expect(a.locator('.editor-tree-item', { hasText: 'EventWin' })).toContainText('Termina la partida');
  await expect(a.locator('.editor-tree-item', { hasText: 'Botón 2' })).toContainText('otra vez: un bucle');
  // What nothing reaches, apart
  await expect(tree.locator('.editor-tree-loose summary')).toHaveText('Sueltos (1): no llega nada a ellos, lo que no siempre es un error');
  // Only the way to an ending: the variable's event and the loop go
  await tree.getByLabel('Solo el camino a un final').check();
  await expect(start).not.toContainText('pone @go');
  await expect(tree.locator('.editor-tree-loose')).toHaveCount(0);
  await tree.getByLabel('Solo el camino a un final').uncheck();

  // What leads to the chosen component: EventA's first button, which the start and the token lead to
  await page.locator('.editor-components').getByRole('button', { name: 'EventWin', exact: true }).click();
  await tree.getByRole('radio', { name: 'Qué lleva a EventWin' }).click();
  const win = tree.locator('.editor-tree-roots > .editor-tree-item');
  await expect(win).toContainText('Botón 1Open the doorsi clues >= 2EventA');
  await win.getByRole('button', { name: 'Abrir EventA' }).click();
  await expect(win).toContainText('Botón 1Go onEventStart');
  await expect(win).toContainText('Botón 1SearchTokenLook');

  // The variables: where each is changed, read and shown
  await bottom.getByRole('tab', { name: 'Variables' }).click();
  const row = (name: string) => bottom.locator('.editor-var-table tbody tr').filter({ has: page.locator('code', { hasText: new RegExp(`^${name.replace('$', '\\$')}$`) }) });
  await expect(row('clues')).toContainText('Del escenario');
  await expect(row('clues').locator('td').nth(0)).toHaveText('EventGo');
  await expect(row('clues').locator('td').nth(1)).toHaveText('EventA (condición de un botón)');
  await expect(row('clues').locator('td').nth(2)).toHaveText('EventStart');
  await expect(row('@go')).toContainText('Lanza los eventos de su activador Var');
  await expect(row('$end')).toContainText('De Valkyrie');
  await bottom.getByLabel('Buscar variables').fill('end');
  await expect(bottom.locator('.editor-var-table tbody tr')).toHaveCount(1);
  await row('$end').locator('td').nth(0).getByRole('button', { name: 'EventWin' }).click();
  await expect(title).toHaveText('EventWin');
});

/** A scenario in English, its default language, and in French, which lacks most texts; none in Spanish, the tests' language. */
function translated(): Buffer {
  const events = [
    '[EventStart]', 'trigger=EventStart', 'buttons=1', 'event1=EventCheck', '',
    '[EventCheck]', 'display=false', 'buttons=1', 'event1=EventA', '',
    '[EventA]', 'buttons=2', 'event1=EventWin', 'event2=EventStart', '',
    '[EventWin]', 'buttons=1', 'operations=$end,=,1', '',
    '[EventLoose]', 'buttons=1', '',
  ];
  const english = [
    '.,English', 'quest.name,Translated', 'quest.synopsys,A test of texts', 'EventStart.text,Welcome', 'EventStart.button1,Go on', 'EventA.text,A choice',
    'EventA.button1,Win', 'EventA.button2,Again', 'EventWin.text,You win', 'EventWin.button1,End', 'EventLoose.text,Alone', 'EventLoose.button1,Ok', '',
  ];
  const french = ['.,French', 'quest.name,Traduit', 'EventStart.text,Bienvenue', 'EventStart.button1,Continuer', ''];
  return Buffer.from(
    zipSync({
      'quest.ini': strToU8('[Quest]\r\nformat=21\r\ntype=MoM\r\ndefaultlanguage=English\r\n\r\n[QuestText]\r\nLocalization.English.txt\r\nLocalization.French.txt\r\n\r\n[QuestData]\r\nevents.ini\r\n'),
      'events.ini': strToU8(events.join('\r\n')),
      'Localization.English.txt': strToU8(english.join('\r\n')),
      'Localization.French.txt': strToU8(french.join('\r\n')),
    }),
  );
}

test('shows the texts by language and writes each in its own, says where the fields write, and reads the scenario as a book', async ({ page }) => {
  await openEditor(page);
  await page.locator('input[type=file][accept=".valkyrie,.zip"]').setInputFiles({ name: 'Translated.valkyrie', mimeType: 'application/zip', buffer: translated() });
  await page.getByRole('button', { name: /Translated/ }).click();
  const bottom = page.locator('.editor-bottom');

  // The fields write in Spanish, the app's language, which the scenario lacks: said, with a way to its default one
  await expect(page.locator('.editor-status')).toContainText('Escribes en español; idioma por defecto: inglés');
  const warning = page.locator('.editor-writing');
  await expect(warning).toContainText('Escribes en español y el escenario no tiene textos en español');
  await expect(warning).toContainText('quien juegue en inglés seguirá leyendo lo que había');
  // A field shows the English text, says so, and the browser checks its spelling in Spanish
  await page.locator('.editor-components').getByRole('button', { name: 'EventA', exact: true }).click();
  const dialog = page.getByRole('textbox', { name: 'Diálogo' });
  await expect(dialog).toHaveText('A choice');
  await expect(dialog).toHaveAttribute('lang', 'es');
  await expect(dialog).toHaveAttribute('spellcheck', 'true');
  await expect(page.locator('.editor-paneled', { has: dialog }).locator('.editor-text-from')).toHaveText('Falta en español: es el texto en inglés.');

  // What French lacks is a problem whose line opens the table of texts with only what is missing
  await bottom.locator('summary', { hasText: 'Sugerencias' }).click();
  await bottom.locator('[data-code="texts-missing-language"]').click();
  await expect(bottom.getByRole('tab', { name: 'Textos' })).toHaveAttribute('aria-selected', 'true');
  await expect(bottom.getByLabel('Solo lo que falta')).toBeChecked();
  await bottom.getByLabel('Solo lo que falta').uncheck();
  await bottom.getByRole('button', { name: 'Panel más alto' }).click();
  await expect(bottom.getByRole('button', { name: 'Panel más bajo' })).toHaveAttribute('aria-pressed', 'true');

  // A column for each language, the default one first, then the one the fields write in, with what each lacks
  const heads = bottom.locator('.editor-texts-table thead th');
  await expect(heads).toHaveCount(4);
  await expect(heads.nth(0)).toHaveText('Clave (11 textos)');
  await expect(heads.nth(1)).toContainText('Inglés');
  await expect(heads.nth(1)).toContainText('por defecto');
  await expect(heads.nth(2)).toContainText('Francés');
  await expect(heads.nth(2)).toContainText('faltan 8');
  await expect(heads.nth(3)).toContainText('Español');
  await expect(heads.nth(3)).toContainText('faltan 11');
  await expect(bottom.locator('.editor-texts-table tbody th')).toHaveText(['quest.name', 'quest.synopsys', 'EventStart.text', 'EventStart.button1', 'EventA.text', 'EventA.button1', 'EventA.button2', 'EventWin.text', 'EventWin.button1', 'EventLoose.text', 'EventLoose.button1']);

  // A text written in one language, a change Undo takes back; Escape leaves it as it was
  await bottom.getByRole('button', { name: 'EventA.text en Francés' }).click();
  await bottom.getByRole('textbox', { name: 'EventA.text en Francés' }).fill('Un choix');
  await bottom.getByRole('textbox', { name: 'EventA.text en Francés' }).press('Control+Enter');
  await expect(bottom.getByRole('button', { name: 'EventA.text en Francés' })).toHaveText('Un choix');
  await expect(heads.nth(2)).toContainText('faltan 7');
  await expect(page.getByRole('button', { name: 'Deshacer' })).toHaveAttribute('title', 'Texto EventA.text en Francés');
  await bottom.getByRole('button', { name: 'EventWin.text en Francés' }).click();
  await bottom.getByRole('textbox', { name: 'EventWin.text en Francés' }).fill('Gagné');
  await bottom.getByRole('textbox', { name: 'EventWin.text en Francés' }).press('Escape');
  await expect(bottom.getByRole('button', { name: 'EventWin.text en Francés' })).toHaveText('falta');
  // Emptied, it goes from that language only
  await bottom.getByRole('button', { name: 'EventStart.text en Francés' }).click();
  await bottom.getByRole('textbox', { name: 'EventStart.text en Francés' }).fill('');
  await bottom.getByRole('textbox', { name: 'EventStart.text en Francés' }).press('Control+Enter');
  await expect(bottom.getByRole('button', { name: 'EventStart.text en Francés' })).toHaveText('falta');
  await expect(bottom.getByRole('button', { name: 'EventStart.text en Inglés' })).toHaveText('Welcome');
  // Only the default language and the one written in
  await bottom.getByLabel('Solo el idioma por defecto y el que escribes').check();
  await expect(heads).toHaveCount(3);
  await bottom.getByLabel('Solo el idioma por defecto y el que escribes').uncheck();

  // The default language, what a player whose language the scenario lacks reads, among those it has
  await bottom.getByRole('combobox', { name: /Idioma por defecto/ }).selectOption('French');
  await expect(page.locator('.editor-status')).toContainText('idioma por defecto: francés');
  await expect(warning).toContainText('quien juegue en francés seguirá leyendo lo que había');
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(page.locator('.editor-status')).toContainText('idioma por defecto: inglés');

  // Writing in English, the app's language, as the options change it: the warning goes and the field is English's own
  await bottom.getByRole('combobox', { name: /Escribes en/ }).selectOption('English');
  await expect(page.getByRole('status')).toHaveText('Now writing in English.');
  await expect(warning).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Dialog', exact: true })).toHaveAttribute('lang', 'en');
  await expect(page.locator('.editor-props .editor-text-from')).toHaveCount(0);
  await bottom.getByRole('combobox', { name: /Writing in/ }).selectOption('Spanish');
  await expect(page.getByRole('status')).toHaveText('Ahora escribes en español.');

  // The book: each text in the order of the tree, as it is played in Spanish (English, which it lacks, as a game would)
  await bottom.getByRole('tab', { name: 'Libro' }).click();
  const book = bottom.locator('.editor-book');
  await expect(book.locator('.editor-book-head')).toContainText('Translated');
  await expect(book.locator('.editor-book-head')).toContainText('A test of texts');
  await expect(book.locator('.editor-book-passage')).toHaveCount(5);
  expect(await book.locator('.editor-book-passage').evaluateAll((all) => all.map((p) => p.getAttribute('aria-label')))).toEqual(['EventStart', 'EventCheck', 'EventA', 'EventWin', 'EventLoose']);
  const passage = (name: string) => book.locator(`[id="editor-book-${name}"]`);
  await expect(passage('EventStart').locator('.editor-book-text')).toHaveText('Welcome');
  await expect(passage('EventStart').locator('.editor-book-buttons')).toHaveText('Go onEventCheck');
  await expect(passage('EventCheck')).toContainText('Sin diálogo');
  await expect(passage('EventA').locator('.editor-book-buttons li')).toHaveText(['WinEventWin', 'AgainEventStart']);
  await expect(passage('EventWin')).toContainText('Termina la partida');
  await expect(book.locator('.editor-book-apart')).toHaveText('Sueltos (1): no llega nada a ellos, lo que no siempre es un error');
  // A button's way leads to its passage; a name, to its component
  await passage('EventCheck').getByRole('button', { name: 'EventA' }).click();
  await expect(passage('EventA')).toBeFocused();
  await passage('EventWin').getByRole('button', { name: 'EventWin' }).click();
  await expect(page.locator('#editor-props-title')).toHaveText('EventWin');

  // Saved, each language in its own file, as Valkyrie's editor writes them; none for Spanish, where nothing was written
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Guardado.');
  const files = await page.evaluate(async (url) => {
    const engine = (await import(url)) as { File: { readAllText(path: string): string; exists(path: string): boolean } };
    const folder = '/AppData/Valkyrie/MoM/Editor/Translated';
    return { french: engine.File.readAllText(folder + '/Localization.French.txt'), english: engine.File.readAllText(folder + '/Localization.English.txt'), spanish: engine.File.exists(folder + '/Localization.Spanish.txt'), quest: engine.File.readAllText(folder + '/quest.ini') };
  }, engineUrl);
  expect(files.french.split('\r\n')).toEqual(['.,French', 'quest.name,Traduit', 'EventStart.button1,Continuer', 'EventA.text,Un choix']);
  expect(files.english).toContain('\r\nEventStart.text,Welcome\r\n');
  expect(files.spanish).toBe(false);
  expect(files.quest).toContain('\r\ndefaultlanguage=English\r\n');
  expect(files.quest).toContain('\r\nLocalization.English.txt\r\nLocalization.French.txt\r\n');
});

/** A scenario to test: a start that stays or wins, a token it places, and an ending. */
function testable(): Buffer {
  const events = [
    '[EventStart]', 'trigger=EventStart', 'buttons=2', 'event1=', 'event2=EventWin', 'add=TokenLook', '',
    '[EventWin]', 'buttons=1', 'operations=$end,=,1', '',
    '[TokenLook]', 'type=TokenSearch', 'xposition=0', 'yposition=0', 'buttons=1', 'event1=EventWin', '',
  ];
  const texts = [
    '.,English', 'quest.name,Testable', 'EventStart.text,Welcome', 'EventStart.button1,Stay', 'EventStart.button2,Win', 'EventWin.text,You win',
    'EventWin.button1,End', 'TokenLook.text,A desk', 'TokenLook.button1,Search', '',
  ];
  return Buffer.from(
    zipSync({
      'quest.ini': strToU8('[Quest]\r\nformat=21\r\ntype=MoM\r\ndefaultlanguage=English\r\nminhero=1\r\nmaxhero=4\r\n\r\n[QuestText]\r\nLocalization.English.txt\r\n\r\n[QuestData]\r\nevents.ini\r\n'),
      'events.ini': strToU8(events.join('\r\n')),
      'Localization.English.txt': strToU8(texts.join('\r\n')),
    }),
  );
}

test('tests the scenario as Valkyrie does, with a panel of why each event started and the variables, and comes back to the editor', async ({ page }) => {
  await openEditor(page);
  await page.locator('input[type=file][accept=".valkyrie,.zip"]').setInputFiles({ name: 'Testable.valkyrie', mimeType: 'application/zip', buffer: testable() });
  await page.getByRole('button', { name: /Testable/ }).click();
  const workbench = page.locator('.editor-workbench');
  // A change not saved yet, which the test saves first and Undo still takes back afterwards
  await page.locator('.editor-components').getByRole('button', { name: '{Nuevo Tablero}' }).click();
  await expect(page.getByText('Sin guardar')).toBeVisible();

  /** Save & Test with this many investigators, as Valkyrie's window asks, past the starting items. */
  const startTest = async (investigators: number) => {
    await page.getByRole('button', { name: 'Guardar y Probar' }).click();
    const ask = page.getByRole('group', { name: 'Número de Investigadores' });
    const count = ask.locator('output');
    // It starts at the number the last test had, as Valkyrie's
    while (Number(await count.textContent()) < investigators) await ask.getByRole('button', { name: 'Más: Número de Investigadores' }).click();
    while (Number(await count.textContent()) > investigators) await ask.getByRole('button', { name: 'Menos: Número de Investigadores' }).click();
    await expect(count).toHaveText(String(investigators));
    await ask.getByRole('button', { name: 'Iniciar' }).click();
    await page.getByRole('button', { name: 'Terminado' }).click();
    await expect(page.getByText('Welcome')).toBeVisible();
    // On a phone the panel would cover the game's buttons
    if (await panel.isVisible()) await hidePanel();
  };
  const panel = page.getByRole('complementary', { name: 'Prueba' });
  const showPanel = async () => {
    if (await page.locator('.test-panel-open').isVisible()) await page.locator('.test-panel-open').click();
    await expect(panel).toBeVisible();
  };
  const hidePanel = async () => panel.getByRole('button', { name: 'Ocultar' }).click();

  // The heroes asked, within the scenario's limits
  await page.getByRole('button', { name: 'Guardar y Probar' }).click();
  const ask = page.getByRole('group', { name: 'Número de Investigadores' });
  await expect(ask.locator('output')).toHaveText('1');
  await expect(ask.getByRole('button', { name: 'Menos: Número de Investigadores' })).toBeDisabled();
  await ask.getByRole('button', { name: 'Cancelar' }).click();
  await expect(ask).toHaveCount(0);

  // Played: the panel says which events started and why, and shows the variables, which can be changed and added
  await startTest(2);
  await showPanel();
  const events = panel.locator('.test-events li');
  await expect(events).toHaveCount(1);
  await expect(events.first()).toContainText('EventStart');
  await expect(events.first()).toContainText('activador EventStart');
  await expect(panel.getByRole('textbox', { name: '#heroes', exact: true })).toHaveValue('2');
  await panel.getByRole('textbox', { name: 'Variable nueva' }).fill('clues');
  await panel.getByRole('textbox', { name: 'Su valor' }).fill('4');
  await panel.getByRole('button', { name: 'Poner' }).click();
  await expect(panel.getByRole('textbox', { name: 'clues', exact: true })).toHaveValue('4');
  await panel.getByRole('textbox', { name: 'clues', exact: true }).fill('7');
  await panel.getByRole('textbox', { name: 'clues', exact: true }).press('Enter');
  await expect(panel.getByRole('textbox', { name: 'clues', exact: true })).toHaveValue('7');
  // With no dialog open, the game's menu goes back to the editor, as Valkyrie's does in a test
  await hidePanel();
  await page.getByRole('button', { name: 'Stay' }).click();
  await page.getByRole('button', { name: 'Menú' }).click();
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await expect(workbench.getByRole('heading', { name: 'Testable' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Deshacer' })).toBeEnabled();

  // A button's event says which button of which event led to it; pressed in the panel, it opens in the editor
  await startTest(1);
  await page.getByRole('button', { name: 'Win' }).click();
  await expect(page.getByText('You win')).toBeVisible();
  await showPanel();
  await expect(events.first()).toContainText('EventWin');
  await expect(events.first()).toContainText('botón 2 de EventStart');
  await events.nth(1).getByRole('button', { name: 'EventStart' }).click();
  await expect(workbench.getByRole('heading', { name: 'Testable' })).toBeVisible();
  await expect(page.locator('#editor-props-title')).toHaveText('EventStart');

  // A test that ends goes back to the editor, where Valkyrie goes to the main menu
  await startTest(1);
  await page.getByRole('button', { name: 'Win' }).click();
  await page.getByRole('button', { name: 'End' }).click();
  await expect(workbench.getByRole('heading', { name: 'Testable' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Deshacer' })).toBeEnabled();
});
