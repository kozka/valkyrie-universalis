// Descent in a real browser (steps D.1 to D.3): open without its official content, which only playing asks for. A
// made-up import, laid out as one made on Android and zipped on a Mac (with the __MACOSX folder, which the app leaves
// out), opens it: Descent's menu; its store list (the store's own, from the clone), with Affairs of Wizards (Cosas de
// magos) downloaded and started up to the choice of heroes, named and pictured by the import; and its collection, with
// Descent's kinds of pack and the community pack DooM downloaded from referencias/descargas. Then, in the tests'
// schematic mode, its heroes take their classes, the quest starts with their morale and Valkyrie's fonts for Descent,
// its tiles and doors go on the board, and a hero's window knocks the hero out, brings it back and ends its turn,
// after which a monster group activates. In Goblin Raid (Incursión Goblin), the goblins' places on the board get
// Valkyrie's frames and circles; Affairs of Wizards is played to its end; and in Prison of Ice and Lies (Prisión de
// hielo y mentiras) the blacksmith's shop sells, buys and is kept in a saved game. The Shadow Rune (La Runa de las
// Sombras) goes from its first quest, won, through its campaign phase (the map, the city's shop, the journey) to the
// next. With the community pack DooM downloaded and selected, the first mission of DooM is played with its marines, its
// tiles and tokens and its imps, drawn with the pack's own pictures: DooM has a button of its own, which asks for its
// pack and lists its 11 missions, which Descent's list leaves out; on a phone held upright, the mission asks to turn
// it. Needs the clones and the downloads (node referencias/clonar.mjs, node referencias/descargar-escenarios.mjs).
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import type { BoardProbe } from '../src/board/probe.ts';
import { importZip, pvr, zip } from './fixtures/madeUpImport.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const valkyrie = join(root, 'referencias/valkyrie');
const storeLists = join(root, 'referencias/valkyrie-store/D2E');
const downloads = join(root, 'referencias/descargas/D2E');
/** The heroes of DooM's pack (its heros.ini): Alpha, Bravo, Charlie and Delta. */
const DOOM_MARINES = 4;

test.use({ locale: 'es-ES' });
test.skip(
  !existsSync(join(storeLists, 'manifestDownload.ini')) ||
    ![
      'escenarios/affairsofwizards.valkyrie',
      'escenarios/Goblin_Raid.valkyrie',
      'escenarios/PrisonofIceandLies.valkyrie',
      'escenarios/TSR.valkyrie',
      'escenarios/Doom_Mission_1.valkyrie',
      'packs/DooM.valkyrieContentPack',
    ].every((file) => existsSync(join(downloads, file))),
  'Missing referencias: run node referencias/clonar.mjs and descargar-escenarios.mjs',
);

type Probed = { universalisBoard: BoardProbe };
/** The pieces of the board drawn with their own picture: for a door or a frame, Valkyrie's, from its repository. */
const pictured = (page: Page) => page.evaluate(() => (globalThis as unknown as Probed).universalisBoard.pictured());
const tiles = (page: Page) => page.evaluate(() => (globalThis as unknown as Probed).universalisBoard.tiles());

/** The engine as the development server hands it to the app, so that the page's own game is reached. */
const engineUrl = `/@fs/${join(root, 'packages/engine/src/index.ts').replaceAll('\\', '/').replace(/^\//, '')}`;

/** The file of the quest the page's game is playing. */
const questPath = (page: Page) =>
  page.evaluate(async (url) => ((await import(url)) as typeof import('@universalis/engine')).Game.get().currentQuest!.qd.questPath, engineUrl);

/** Answers the windows over the board with their first enabled button, up to `most` of them. */
async function answer(page: Page, most: number): Promise<void> {
  for (let i = 0; i < most && (await page.locator('.dialog-layer .event-button:enabled').count()) > 0; i++) {
    await page.locator('.dialog-layer .event-button:enabled').first().click();
  }
}

/** Where a clickable piece of the board is on the page, once the camera stands still, or undefined. */
async function pieceAt(page: Page, name: string): Promise<{ x: number; y: number } | undefined> {
  const find = () => page.evaluate((piece) => (globalThis as unknown as Probed).universalisBoard.clickable().find((c) => c.name === piece), name);
  let at = await find();
  await expect
    .poll(async () => {
      const before = at;
      at = await find();
      return before !== undefined && at !== undefined && Math.hypot(at.x - before.x, at.y - before.y) < 0.5;
    })
    .toBe(true);
  return at;
}

/** A clickable piece of the board, dragged into view if the screen does not show it, as a player would. */
async function pieceInView(page: Page, name: string): Promise<{ x: number; y: number }> {
  const view = page.viewportSize()!;
  for (let i = 0; i < 15; i++) {
    const at = await pieceAt(page, name);
    expect(at, name).toBeDefined();
    // Clear of the heroes' column, on the left, of the Menu button, at the top, and of the screen's edges
    if (at!.x > 90 && at!.x < view.width - 40 && at!.y > 80 && at!.y < view.height - 40) return at!;
    // A drag that stays on the screen, towards its middle
    const dx = Math.max(-0.4 * view.width, Math.min(0.4 * view.width, view.width / 2 - at!.x));
    const dy = Math.max(-0.4 * view.height, Math.min(0.4 * view.height, view.height / 2 - at!.y));
    await page.mouse.move(view.width / 2 - dx / 2, view.height / 2 - dy / 2);
    await page.mouse.down();
    await page.mouse.move(view.width / 2 + dx / 2, view.height / 2 + dy / 2, { steps: 8 });
    await page.mouse.up();
  }
  throw new Error(`${name} could not be brought into view`);
}

/** Chooses the first two heroes and the first free class of each. */
async function chooseHeroes(page: Page): Promise<void> {
  await page.locator('.hero-choice').nth(0).click();
  await page.locator('.hero-choice').nth(1).click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  const columns = page.locator('.class-hero');
  await columns.nth(0).locator('.class-choice').first().click();
  await columns.nth(1).locator('.class-choice:enabled').first().click();
  await page.getByRole('button', { name: 'Terminado' }).click();
}

const CORS = { 'access-control-allow-origin': '*' };
/** A 1×1 PNG, for every cover and for Valkyrie's own pictures. */
const PICTURE = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

/**
 * The Descent store: its two lists, the scenarios and community packs of referencias/descargas, Valkyrie's own files
 * from its clone (its fonts for Descent among them) and a picture for anything else.
 */
async function serveStore(page: Page): Promise<string[]> {
  const fetched: string[] = [];
  await page.route('https://raw.githubusercontent.com/**', async (route) => {
    const url = route.request().url();
    const own = /\/NPBruce\/valkyrie\/[0-9a-f]{40}\/(.+)$/.exec(url);
    if (own !== null && existsSync(join(valkyrie, decodeURIComponent(own[1]!)))) return route.fulfill({ path: join(valkyrie, decodeURIComponent(own[1]!)), headers: CORS });
    const list = /valkyrie-store\/(?:refs\/heads\/)?master\/D2E\/(manifestDownload|contentPacksManifestDownload)\.ini$/.exec(url);
    if (list !== null) return route.fulfill({ body: readFileSync(join(storeLists, `${list[1]}.ini`)), headers: CORS });
    const file = decodeURIComponent(url.split('/').pop()!);
    for (const folder of ['escenarios', 'packs']) {
      const path = join(downloads, folder, file);
      if (/\.valkyrie(ContentPack)?$/.test(file) && existsSync(path)) {
        fetched.push(file);
        return route.fulfill({ path, headers: CORS });
      }
    }
    if (/\.(png|jpe?g)$/i.test(file)) return route.fulfill({ body: PICTURE, contentType: 'image/png', headers: CORS });
    return route.abort();
  });
  return fetched;
}

/** The files of a game's import the app keeps, as its index in the browser lists them. */
async function importedFiles(page: Page, game: string): Promise<string[]> {
  return page.evaluate(`(async () => {
    const folder = await (await navigator.storage.getDirectory()).getDirectoryHandle('import');
    const index = JSON.parse(await (await (await folder.getFileHandle(${JSON.stringify(`${game}.json`)})).getFile()).text());
    return index.files.map((file) => file.path).sort();
  })()`);
}

/** A Descent import as Valkyrie writes it on Android, with a few files: its log, a text and two PVR pictures. */
const ANDROID: Record<string, string | Uint8Array> = {
  'import.ini': '[Import]\r\nValkyrie=2\r\nFFG=1.5.5\r\n',
  'text/Localization_es.txt': 'KEY,Spanish\r\nASHRIAN,Ashrian (importada)\r\n',
  'img/Hero_Ashrian.pvr': pvr(64),
  'img/001A.pvr': pvr(64),
};

/** What a Mac adds when it zips them: an AppleDouble ._ copy of each file under __MACOSX. */
const MAC = Object.fromEntries(Object.keys(ANDROID).map((name) => [`__MACOSX/${name.replace(/[^/]+$/, (file) => `._${file}`)}`, 'Mac OS X metadata']));

test('opens with its official import and plays a scenario of its store up to the heroes', async ({ page }, testInfo) => {
  const shot = (name: string) => page.screenshot({ path: testInfo.outputPath(`${name}.png`) });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const fetched = await serveStore(page);
  await page.goto('/');
  const d2e = page.getByRole('button', { name: /Descent/ });
  // Not as in Valkyrie, which greys it until it is imported (ImportGate.tsx)
  await expect(d2e).toBeEnabled();

  // The import, without what the Mac added
  await importZip(page, 'd2e', 'IMPORT_DES.zip', zip({ ...ANDROID, ...MAC }));
  await expect(d2e).toBeEnabled();
  await expect(page.locator('[data-section=d2e]').getByRole('button', { name: 'Reimportar datos' })).toBeVisible();
  await expect(page.locator('[data-section=mom]').getByRole('button', { name: 'Importar datos' })).toBeVisible();
  expect(await importedFiles(page, 'D2E')).toEqual(['img/001A.pvr', 'img/Hero_Ashrian.pvr', 'import.ini', 'text/Localization_es.txt']);
  await shot('01-imported');

  // DooM, Descent's, opens with its import
  await expect(page.getByRole('button', { name: 'DooM', exact: true })).toBeEnabled();

  // Descent's menu and its store without DooM's 11 missions, where Affairs of Wizards needs no expansion
  await d2e.click();
  await expect(page.getByRole('heading', { name: /Descent/ })).toBeVisible();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await expect(page.locator('.count')).toHaveText('48 escenarios');
  await expect(page.locator('.quest', { hasText: 'DooM' })).toHaveCount(0);
  const wizards = page.locator('.quest', { hasText: 'Cosas de magos' });
  await expect(wizards.locator('.quest-action')).toHaveText('Descargar');
  await wizards.click();
  await expect(wizards.locator('.quest-action')).toHaveText('Jugar');
  expect(fetched).toEqual(['affairsofwizards.valkyrie']);
  await shot('02-store');

  // Started, up to the heroes of the base game, named and pictured by the import
  await wizards.click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await expect(page.locator('.hero-choice')).toHaveCount(8);
  await expect(page.locator('.hero-choice').filter({ hasText: 'Ashrian (importada)' }).locator('img')).toBeVisible();
  await shot('03-heroes');
  expect(errors).toEqual([]);
});

test("lists Descent's kinds of pack and downloads the community packs DooM, D1ED and SOTP", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const fetched = await serveStore(page);
  await page.goto('/');
  await importZip(page, 'd2e', 'import.zip', zip(ANDROID));
  await page.getByRole('button', { name: /Descent/ }).click();
  await page.getByRole('button', { name: 'Mi Colección' }).click();
  await expect(page.getByRole('heading', { name: 'Elige Colección de Expansiones' })).toBeVisible();
  // Valkyrie's for Descent: boxes, hero and monster packs, lieutenants and the conversion kit, then the community's
  await expect(page.locator('.pack-type')).toHaveText([/Boxed Expansions/, /Hero and Monster packs/, /Lieutenant Packs/, /Conversion Kit/, /Paquetes de contenidos comunitarios/]);

  // The store's three, downloaded one after the other
  await page.getByRole('button', { name: 'Descarga de contenidos' }).click();
  await expect(page.locator('.pack-download')).toHaveCount(3);
  for (const pack of ['DooM', 'D1ED', 'SOTP']) {
    const row = page.locator('.pack-download', { hasText: pack });
    await row.getByRole('button', { name: 'Descargar' }).click();
    await expect(row.getByRole('button', { name: 'Eliminar' })).toBeVisible();
  }
  expect(fetched).toEqual(['DooM.valkyrieContentPack', 'D1ED.valkyrieContentPack', 'SOTP.valkyrieContentPack']);
  await page.screenshot({ path: testInfo.outputPath('01-downloaded.png') });

  // Loaded among the community packs of the collection, with the names their content_pack.ini give
  await page.getByRole('button', { name: 'Volver' }).click();
  await page.locator('.pack-type', { hasText: 'Paquetes de contenidos comunitarios' }).click();
  for (const name of ['DooM 2016 Ver 1.0', 'Descent: Journeys in the Dark 1st Edition- Tile Pack', 'Sands of the Past Content Pack']) {
    await expect(page.locator('.pack-row .pack-name', { hasText: name })).toBeVisible();
  }
  await page.screenshot({ path: testInfo.outputPath('02-collection.png') });
  expect(errors).toEqual([]);
});

test('chooses the classes, starts Affairs of Wizards with its morale and plays a hero\'s turn', async ({ page }, testInfo) => {
  // Its first events are many dialogs
  test.setTimeout(150_000);
  const shot = (name: string) => page.screenshot({ path: testInfo.outputPath(`${name}.png`) });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await serveStore(page);
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Descent/ }).click();
  // Valkyrie's fonts for Descent, from its repository: Windlass for the titles
  await expect(page.locator('html')).toHaveAttribute('data-official-fonts', /D2E/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('font-family', /Windlass/);

  await page.getByRole('button', { name: 'Partida nueva' }).click();
  const wizards = page.locator('.quest', { hasText: 'Cosas de magos' });
  await wizards.click();
  await expect(wizards.locator('.quest-action')).toHaveText('Jugar');
  await wizards.click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  // Two heroes, then back to choose again (the package is extracted again, as RestartFromHeroSelection does). Finished
  // is always live, as Valkyrie's: with one hero it waits for another
  await page.locator('.hero-choice').nth(0).click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  await expect(page.locator('.hero-choice')).toHaveCount(8);
  await page.locator('.hero-choice').nth(2).click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  const columns = page.locator('.class-hero');
  await expect(columns).toHaveCount(2);
  await page.getByRole('button', { name: 'Volver' }).click();
  await expect(page.locator('.hero-choice')).toHaveCount(8);
  await expect(page.locator('.hero-choice[aria-pressed=true]')).toHaveCount(0);

  // Two healers, Ashrian and Avric Albright
  await page.locator('.hero-choice').nth(0).click();
  await page.locator('.hero-choice').nth(1).click();
  await page.getByRole('button', { name: 'Terminado' }).click();

  // A column for each hero, with the healers' classes: one taken by a hero is not free for the other. Without every
  // class, Finished waits
  await expect(columns).toHaveCount(2);
  const finished = page.getByRole('button', { name: 'Terminado' });
  await finished.click();
  await expect(columns).toHaveCount(2);
  await columns.nth(0).locator('.class-choice').first().click();
  await expect(columns.nth(0).locator('.class-choice').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(columns.nth(1).locator('.class-choice').first()).toBeDisabled();
  await columns.nth(1).locator('.class-choice:enabled').first().click();
  await shot('01-classes');
  await finished.click();

  // The quest starts: the morale, as many as the heroes, above them
  await expect(page.locator('.morale')).toHaveText('2');
  await answer(page, 30);
  await expect(page.locator('.dialog-layer')).toHaveCount(0);
  // Its tiles on the board, and its doors with Valkyrie's own picture
  expect(await tiles(page)).toEqual(expect.arrayContaining(['ObjectTileEntry', 'ObjectTileStream', 'ObjectTileOutsideFork', 'ObjectTileCaretaker']));
  await expect.poll(() => pictured(page)).toEqual(expect.arrayContaining(['ObjectDoorCabin', 'ObjectDoorCrypt1']));

  // A hero's window: knocked out, a morale goes; recovered, it comes back to play
  const ashrian = page.locator('.hero-slot').first();
  await ashrian.click();
  await page.getByRole('button', { name: 'KO' }).click();
  await expect(ashrian).toHaveClass(/defeated/);
  await expect(page.locator('.morale')).toHaveText('1');
  await ashrian.click();
  await page.getByRole('button', { name: 'Recupear' }).click();
  await expect(ashrian).not.toHaveClass(/defeated/);

  // Its turn ends, and a monster group activates (RoundController.HeroActivated)
  await ashrian.click();
  await shot('02-hero-window');
  await page.getByRole('button', { name: 'Fin del Turno' }).click();
  await expect(ashrian).toHaveClass(/activated/);
  const activated = page.getByRole('button', { name: /Activad/ });
  await expect(activated).toBeVisible();
  // The master's step, which comes first at random, is red: its header, the box of its actions and its button
  const master = (await activated.innerText()).startsWith('Maestro');
  for (const red of [activated, page.locator('.activation-actions'), page.locator('.event-text h3')]) {
    await (master ? expect(red).toHaveClass(/master/) : expect(red).not.toHaveClass(/master/));
  }
  // Over the activation, a hero's window opens but the turn cannot end
  await page.locator('.hero-slot').nth(1).click();
  await expect(page.getByRole('button', { name: 'Fin del Turno' })).toBeDisabled();
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await shot('03-activation');
  expect(errors).toEqual([]);
});

test("places the goblins of Goblin Raid in Valkyrie's frames", async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await serveStore(page);
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Descent/ }).click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  const raid = page.locator('.quest', { hasText: 'Incursión Goblin' });
  await raid.click();
  await expect(raid.locator('.quest-action')).toHaveText('Jugar');
  await raid.click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await chooseHeroes(page);

  // Its setup, up to Evlyn, who waits on the board to be healed: on a phone's narrow screen, the board is dragged to her
  await answer(page, 4);
  const evlyn = await pieceInView(page, 'ObjectToken9AVilligerTokenTheSurvivor');
  await page.mouse.click(evlyn.x, evlyn.y);
  // Healed, her caravan's tiles, a door and the search tokens go on the board, and the goblin archers come
  await answer(page, 5);
  await expect(page.locator('.dialog-layer')).toContainText('goblin');
  const places = ['MPlace2playerGoblinminion1', 'MPlace2playergoblinminion2', 'MPlace2playergoblinmaster'];
  // Each place: Valkyrie's circle (red for the master) and frame over the goblin, which has no picture without the import
  await expect.poll(async () => (await pictured(page)).filter((name) => name.startsWith('MonsterSpawnBorder')).sort()).toEqual(
    places.flatMap((place) => [`MonsterSpawnBorder${place}`, `MonsterSpawnBorder${place}`]).sort(),
  );
  await page.screenshot({ path: testInfo.outputPath('01-goblins.png') });
  expect(errors).toEqual([]);
});

/** Answers the monsters' activations, master and minions, until none is left. */
async function activate(page: Page): Promise<void> {
  for (let i = 0; i < 20; i++) {
    const button = page.locator('.window-layer .event-button:enabled').first();
    if ((await button.count()) === 0) return;
    await button.click();
  }
}

test('plays Affairs of Wizards to the end: its windows, a round, its five doors and the Flesh Moulders', async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  const shot = (name: string) => page.screenshot({ path: testInfo.outputPath(`${name}.png`) });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await serveStore(page);
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Descent/ }).click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  const wizards = page.locator('.quest', { hasText: 'Cosas de magos' });
  await wizards.click();
  await expect(wizards.locator('.quest-action')).toHaveText('Jugar');
  await wizards.click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await chooseHeroes(page);
  // Its intro: the basic mode, the setup, the heroes at the entrance, the zombies and an arcane spirit
  await answer(page, 30);
  await expect(page.locator('.dialog-layer')).toHaveCount(0);

  // Along the bottom, Descent's skills (none to buy without experience), items and gold, and log
  await page.getByRole('button', { name: 'Habilidades', exact: true }).click();
  const skills = page.locator('.skills-window');
  await expect(skills.locator('.skill-hero')).toHaveCount(2);
  await expect(skills.locator('.button.skill')).toHaveCount(8);
  await expect(skills.locator('.button.skill.locked')).toHaveCount(8);
  await skills.locator('.skill-hero').nth(1).click();
  await expect(skills.locator('.skill-hero').nth(1)).toHaveAttribute('aria-pressed', 'true');
  await shot('01-skills');
  await skills.getByRole('button', { name: 'Cerrar' }).click();
  await page.getByRole('button', { name: 'Objetos', exact: true }).click();
  const items = page.locator('.inventory-window');
  await expect(items.locator('.inventory-item')).toHaveCount(3);
  await expect(items.locator('.gold')).toHaveText(/Oro\s+0/);
  await items.getByRole('button', { name: 'Cerrar' }).click();
  // The log's lines are tagged dialog, as in Valkyrie: until it closes, a hero does nothing
  await page.getByRole('button', { name: 'Log', exact: true }).click();
  await page.locator('.hero-slot').first().click();
  await expect(page.locator('.window')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Fin del Turno' })).toHaveCount(0);
  await page.locator('.log-window').getByRole('button', { name: 'Cerrar' }).click();
  await expect(page.locator('.window')).toHaveCount(0);

  // A round: after each hero's turn a monster group activates, and then the heroes and monsters start again
  for (const hero of [0, 1]) {
    await page.locator('.hero-slot').nth(hero).click();
    await page.getByRole('button', { name: 'Fin del Turno' }).click();
    await activate(page);
  }
  await expect(page.locator('.hero-slot.activated')).toHaveCount(0);
  await expect(page.locator('.monster-icon.activated')).toHaveCount(0);

  // The crypt's five doors, one after the other: tiles, search tokens and monsters, up to the Flesh Moulders
  for (const n of [1, 2, 3, 4, 5]) {
    const door = await pieceInView(page, `ObjectDoorCrypt${n}`);
    await page.mouse.click(door.x, door.y);
    await expect(page.locator('.dialog-layer')).toHaveCount(1);
    await answer(page, 12);
  }
  expect(await tiles(page)).toEqual(expect.arrayContaining(['ObjectTileInsideRiver', 'ObjectTileStairs', 'ObjectTileLowerCrypt']));
  await shot('02-crypt');

  // Defeated, they end the quest (the list shows as many monsters as fit: its arrow down, only when they do not)
  const more = page.getByRole('button', { name: 'Más monstruos' });
  while ((await page.getByRole('button', { name: /^Flesh Moulder/ }).count()) === 0) await more.click();
  await page.getByRole('button', { name: /^Flesh Moulder/ }).click();
  await page.getByRole('button', { name: 'Derrotado' }).click();
  await answer(page, 5);
  await expect(page.locator('.end-window')).toBeVisible();
  await expect(page.locator('.end-quest')).toHaveText('Cosas de magos');
  await shot('03-end');
  expect(errors).toEqual([]);
});

test("buys and sells at the blacksmith of Prison of Ice and Lies, and keeps it in a saved game", async ({ page }, testInfo) => {
  test.setTimeout(150_000);
  const shot = (name: string) => page.screenshot({ path: testInfo.outputPath(`${name}.png`) });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await serveStore(page);
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Descent/ }).click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  const prison = page.locator('.quest', { hasText: 'Prisión de hielo' });
  await prison.click();
  await expect(prison.locator('.quest-action')).toHaveText('Jugar');
  await prison.click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await chooseHeroes(page);
  // The difficulty and the setup, then the town: its blacksmith opens the shop (ShopInterface). On a phone held upright
  // the author's layout, made for a wide screen, leaves the blacksmith partly off the screen and under the log button:
  // the keyboard presses it
  await answer(page, 5);
  await page.locator('[data-quest-ui]', { hasText: 'Herrero' }).press('Enter');
  const shop = page.locator('.shop');
  const buy = shop.locator('.shop-list').nth(0);
  const sell = shop.locator('.shop-list').nth(1);
  await expect(buy.locator('.shop-item')).toHaveCount(5);
  // The party sells its classes' items, for 25 each
  await expect(sell.locator('.shop-item')).toHaveCount(3);
  await expect(sell.locator('.shop-price')).toHaveText(['25', '25', '25']);
  await expect(shop.locator('.gold')).toHaveText(/Oro\s+500/);
  await shot('01-shop');

  // The first of the wares the quest drew, for its price
  const ware = buy.locator('.shop-item').first();
  const name = await ware.locator('.shop-name').innerText();
  const cost = Number(await ware.locator('.shop-price').innerText());
  await ware.click();
  await expect(shop.locator('.gold')).toHaveText(new RegExp(`Oro\\s+${500 - cost}$`));
  await expect(buy.locator('.shop-item')).toHaveCount(4);
  const bought = sell.locator('.shop-item', { has: page.locator('.shop-name', { hasText: name }) });
  await expect(bought).toHaveCount(1);

  // Saved, and continued from the main menu: the shop opens again as it was left
  await page.getByRole('button', { name: 'Menú' }).click();
  await page.locator('.dialog-layer').getByRole('button', { name: 'Guardar' }).click();
  await page.locator('.save-slot').first().click();
  await page.getByRole('button', { name: 'Menú' }).click();
  await page.getByRole('button', { name: 'Menú principal' }).click();
  await page.getByRole('button', { name: 'Salir', exact: true }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.locator('.save-slot', { hasText: 'Prisión de hielo' }).first().click();
  await expect(shop.locator('.gold')).toHaveText(new RegExp(`Oro\\s+${500 - cost}$`));
  await expect(bought).toHaveCount(1);
  await expect(page.locator('.morale')).toHaveText('2');

  // Sold back for what the party gets for it, and the smithy left
  const price = Number(await bought.locator('.shop-price').innerText());
  await bought.click();
  await expect(shop.locator('.gold')).toHaveText(new RegExp(`Oro\\s+${500 - cost + price}$`));
  await shop.locator('.shop-buttons button').first().click();
  await answer(page, 5);
  await expect(shop).toHaveCount(0);
  await shot('02-left');
  expect(errors).toEqual([]);
});

test("plays DooM's first mission with its community pack: its marines, its tiles and tokens, and the imps of a portal", async ({ page }, testInfo) => {
  test.setTimeout(150_000);
  const shot = (name: string) => page.screenshot({ path: testInfo.outputPath(`${name}.png`) });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await serveStore(page);
  // On a phone held upright, as a player who has not chosen to play upright
  await page.addInitScript(() => localStorage.removeItem('universalis.upright'));
  await page.goto('/?schematic');
  // DooM's menus have their own music, which the app brings
  const music = page.waitForRequest(/doom-menu[^/]*\.mp3/);
  await page.getByRole('button', { name: 'DooM', exact: true }).click();
  await music;
  // Its authors, small in a corner, with their channel
  const credits = page.getByRole('complementary', { name: 'Créditos de la música' });
  await expect(credits).toContainText('Música: Aim To Head Official (BLACK TOOTH)');
  await expect(credits.getByRole('link', { name: 'Aim To Head Official (BLACK TOOTH) en YouTube' })).toHaveAttribute('href', 'https://www.youtube.com/channel/UC1KJEk-EZMmDF9DJKMK5OCQ');
  await shot('00-doom-menu');

  // DooM's menu asks for its pack, downloaded from the store; no need to select it in the collection
  await expect(page.getByRole('heading', { name: 'DooM' })).toBeVisible();
  await page.getByRole('button', { name: 'Descargar DooM' }).click();
  const download = page.locator('.pack-download', { hasText: 'DooM' });
  await download.getByRole('button', { name: 'Descargar' }).click();
  await expect(download.getByRole('button', { name: 'Eliminar' })).toBeVisible();
  await page.getByRole('button', { name: 'Volver' }).click();
  await page.getByRole('button', { name: 'Volver' }).click();
  await expect(page.getByRole('button', { name: 'Descargar DooM' })).toHaveCount(0);

  // Its 11 missions, and only them
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await expect(page.locator('.count')).toHaveText('11 escenarios');
  const mission = page.locator('.quest', { hasText: 'Misión 1 - De muertos' });
  await mission.click();
  await expect(mission.locator('.quest-action')).toHaveText('Jugar');
  await mission.click();
  await page.getByRole('button', { name: 'Iniciar' }).click();

  // A phone held upright is asked to turn, as Valkyrie plays in landscape; this one goes on upright
  const turn = page.getByRole('dialog', { name: /Gira el móvil/ });
  if (testInfo.project.name === 'phone') {
    await expect(turn).toBeVisible();
    await shot('00-turn');
    await turn.getByRole('button', { name: 'Jugar en vertical' }).click();
  }
  await expect(turn).toBeHidden();

  // Only the marines, without Descent's own heroes, with the pack's portraits; each takes one of DooM's four classes
  await expect(page.locator('.hero-choice')).toHaveCount(DOOM_MARINES);
  const alpha = page.locator('.hero-choice', { hasText: 'Alpha' });
  await expect(alpha.locator('img')).toBeVisible();
  await alpha.click();
  await page.locator('.hero-choice', { hasText: 'Bravo' }).click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  const columns = page.locator('.class-hero');
  const classes = ['Especialista en escopeta', 'Especialista en fusil', 'Especialista en apoyo', 'Especialista en asalto pesado'];
  await expect(columns.nth(0).locator('.class-choice')).toHaveText(classes);
  await expect(columns.nth(1).locator('.class-choice')).toHaveText(classes);
  await columns.nth(0).locator('.class-choice').first().click();
  await columns.nth(1).locator('.class-choice:enabled').first().click();
  await shot('01-classes');
  await page.getByRole('button', { name: 'Terminado' }).click();

  // Without the threat cards, through its intro: the pack's tiles and tokens, drawn with its pictures
  await page.locator('.dialog-layer').getByRole('button', { name: 'No', exact: true }).click();
  await answer(page, 10);
  await expect(page.locator('.dialog-layer')).toHaveCount(0);
  const board = ['ObjectTile_01_Entry', 'ObjectTile_01_Room_01', 'ObjectTile_01_Room_02', 'ObjectToken_01_Portal_1', 'ObjectToken_01_Medpack_01'];
  expect(await tiles(page)).toEqual(expect.arrayContaining(board.slice(0, 3)));
  await expect.poll(() => pictured(page)).toEqual(expect.arrayContaining(board));
  await shot('02-board');

  // Its first portal brings imps: their places on the board show the pack's imp in Valkyrie's frames
  const portal = await pieceInView(page, 'ObjectToken_01_Portal_1');
  await page.mouse.click(portal.x, portal.y);
  for (let i = 0; i < 3 && !(await page.locator('.dialog-layer').innerText()).includes('demonios aparecen'); i++) {
    await page.locator('.dialog-layer .event-button:enabled').first().click();
  }
  await expect.poll(async () => (await pictured(page)).filter((name) => name.startsWith('MonsterSpawnMPlace')).length).toBeGreaterThanOrEqual(2);
  await shot('03-imps');
  await answer(page, 5);
  const imp = page.getByRole('button', { name: /^Imp/ });
  await expect(imp.locator('img')).toBeVisible();

  // A marine's turn ends: the imps activate in one step, with the pack's texts
  await page.locator('.hero-slot').first().click();
  await page.getByRole('button', { name: 'Fin del Turno' }).click();
  const activation = page.locator('.window-layer');
  await expect(activation).toContainText('Imp');
  await expect(activation).toContainText('Acciones');
  await expect(activation).toContainText('marine');
  await shot('04-activation');
  await activation.getByRole('button', { name: 'Activado' }).click();
  await expect(activation.getByRole('button', { name: 'Activado' })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("goes through The Shadow Rune's campaign: its first quest, the campaign phase's city and map, and the journey to the next", async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  const shot = (name: string) => page.screenshot({ path: testInfo.outputPath(`${name}.png`) });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await serveStore(page);
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Descent/ }).click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  const rune = page.locator('.quest', { hasText: 'La Runa de las Sombras' });
  await rune.click();
  await expect(rune.locator('.quest-action')).toHaveText('Jugar');
  await rune.click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await chooseHeroes(page);

  // Its title screen, whose Start leads to its first quest, The First Blood
  await expect(page.locator('[data-quest-ui=UIStart]')).toHaveText('Inicio');
  await shot('01-title');
  await page.locator('[data-quest-ui=UIStart]').press('Enter');
  await expect.poll(() => questPath(page)).toMatch(/\/01_FB\/quest\.ini$/);
  await answer(page, 12);

  // Won, as when its Mauler falls: the campaign phase, with the map and the city of Arhynn
  await page.evaluate(async (url) => ((await import(url)) as typeof import('@universalis/engine')).Game.get().currentQuest!.eManager.queueEvent('EventWin'), engineUrl);
  await answer(page, 6);
  await expect.poll(() => questPath(page)).toMatch(/\/CP\/quest\.ini$/);
  await page.locator('[data-quest-ui=UICity]').press('Enter');
  await answer(page, 2);
  // Its shop, with the gold the quest gave
  const shop = page.locator('.shop');
  await expect(shop.locator('.shop-buttons button')).toHaveText(['Dejar la ciudad', 'Renovar el mercado', 'Mercado negro']);
  await expect(shop.locator('.gold')).toHaveText(/Oro\s+50/);
  await shot('02-city');

  // Back on the map, the act's five quests; the first, and the journey to it, one road event after another
  await shop.locator('.shop-buttons button').first().click();
  await answer(page, 1);
  await expect(page.locator('[data-quest-ui^=UIQuest]')).toHaveCount(5);
  await shot('03-map');
  await page.locator('[data-quest-ui=UIQuestAFatGoblin]').press('Enter');
  for (let i = 0; i < 30 && !(await questPath(page)).includes('/02_AFG/'); i++) await answer(page, 1);
  expect(await questPath(page)).toMatch(/\/02_AFG\/quest\.ini$/);
  // The heroes go on, with their morale
  await expect(page.locator('.hero-slot')).toHaveCount(2);
  await expect(page.locator('.morale')).toHaveText('2');
  await shot('04-next-quest');
  expect(errors).toEqual([]);
});

// Not in Valkyrie: a finger that presses a piece opens its window, and the browser's click of that same touch, which
// comes after, must not reach the window (it pressed its button when one lay under the finger, 16 October 2026)
test("a finger's press on a piece does not also press the window it opens", async ({ page }) => {
  test.skip(test.info().project.name !== 'phone', 'Touch screens only');
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Descent/ }).click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  const raid = page.locator('.quest', { hasText: 'Incursión Goblin' });
  await raid.click();
  await expect(raid.locator('.quest-action')).toHaveText('Jugar');
  await raid.click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await chooseHeroes(page);
  await answer(page, 4);
  const evlyn = await pieceInView(page, 'ObjectToken9AVilligerTokenTheSurvivor');
  await page.evaluate(() => {
    const seen = globalThis as unknown as { clicks: number; document: { addEventListener(type: string, listener: () => void, capture: boolean): void } };
    seen.clicks = 0;
    seen.document.addEventListener('click', () => seen.clicks++, true);
  });
  await page.touchscreen.tap(evlyn.x, evlyn.y);
  await expect(page.locator('.dialog-layer .event-window')).toHaveCount(1);
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => (globalThis as unknown as { clicks: number }).clicks)).toBe(0);
  // The next press is the player's own
  await page.locator('.dialog-layer .event-button:enabled').first().click();
});
