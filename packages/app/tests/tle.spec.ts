// A scenario that needs TLE, in a real browser: the community pack Lost Expeditions (TLE) is downloaded from the store
// and chosen with the seven expansions The Pharaoh's Tomb (Desert_en) asks for; then the scenario is downloaded,
// started and taken through its intro, whose two clicks change quest (Quest.ChangeQuest) to all/folder_0001 with a
// tile of TLE; the autosave of that change is continued, and the map's slide, picture and tower puzzles are each played
// one move and closed. The store is the clone in referencias, the scenario comes from
// referencias/descargas, and the pack is the downloaded TLE with blank pictures of the same sizes: Playwright cannot
// hand over the real one (89 MB) in one response. Without official content, in the tests' schematic mode (?schematic).
// Needs the clones and the downloads (node referencias/clonar.mjs, node referencias/descargar-escenarios.mjs).
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateSync } from 'node:zlib';
import { expect, test, type Page } from '@playwright/test';
import { unzipSync, zipSync } from 'fflate';
import type { BoardProbe } from '../src/board/probe.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const storeLists = join(root, 'referencias/valkyrie-store/MoM');
const scenario = join(root, 'referencias/descargas/MoM/escenarios/Desert_en.valkyrie');
const pack = join(root, 'referencias/descargas/MoM/packs/TLE.valkyrieContentPack');
const valkyrie = join(root, 'referencias/valkyrie');

test.use({ locale: 'es-ES' });
test.skip(!existsSync(storeLists) || !existsSync(scenario) || !existsSync(pack), 'Missing referencias: run node referencias/clonar.mjs and descargar-escenarios.mjs');

const CORS = { 'access-control-allow-origin': '*' };
/** A 1×1 PNG, for every cover. */
const COVER = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

/** A grey PNG of this size. */
function blankPng(width: number, height: number): Uint8Array<ArrayBuffer> {
  const chunk = (type: string, data: Buffer) => {
    const out = Buffer.alloc(12 + data.length);
    out.writeUInt32BE(data.length, 0);
    out.write(type, 4, 'latin1');
    data.copy(out, 8);
    out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
    return out;
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // 8 bits of grey per pixel
  const rows = Buffer.alloc((width + 1) * height, 0x80);
  for (let y = 0; y < height; y++) rows[y * (width + 1)] = 0;
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([signature, chunk('IHDR', header), chunk('IDAT', deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]);
}

let lightPack: Buffer | null = null;

/** TLE with every PNG made blank at its size; its .ini and texts, and its JPEG pictures, as they are. */
function tle(): Buffer {
  if (lightPack !== null) return lightPack;
  const files = unzipSync(readFileSync(pack));
  for (const [name, data] of Object.entries(files)) {
    if (data.length < 24 || data[0] !== 0x89 || data[1] !== 0x50) continue;
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    files[name] = blankPng(view.getUint32(16), view.getUint32(20));
  }
  lightPack = Buffer.from(zipSync(files));
  return lightPack;
}

/** The store, with TLE; Valkyrie's own pictures from its clone. */
async function serveStore(page: Page): Promise<string[]> {
  const downloads: string[] = [];
  await page.route('https://raw.githubusercontent.com/**', async (route) => {
    const url = new URL(route.request().url());
    const parts = url.pathname.split('/').slice(1).map(decodeURIComponent);
    const file = parts.at(-1)!;
    if (parts[0] === 'NPBruce' && parts[1] === 'valkyrie-store') return route.fulfill({ path: join(storeLists, file), headers: CORS });
    if (parts[0] === 'NPBruce' && parts[1] === 'valkyrie') {
      const picture = join(valkyrie, ...parts.slice(3));
      return existsSync(picture) ? route.fulfill({ path: picture, headers: CORS }) : route.abort();
    }
    if (file === 'TLE.valkyrieContentPack') {
      downloads.push(file);
      return route.fulfill({ body: tle(), headers: CORS });
    }
    if (file === 'Desert_en.valkyrie') {
      downloads.push(file);
      return route.fulfill({ path: scenario, headers: CORS });
    }
    if (/\.(png|jpe?g)$/i.test(file)) return route.fulfill({ body: COVER, contentType: 'image/png', headers: CORS });
    return route.abort();
  });
  return downloads;
}

type Probed = { universalisBoard: BoardProbe };
const tiles = (page: Page) => page.evaluate(() => (globalThis as unknown as Probed).universalisBoard.tiles());
const pictured = (page: Page) => page.evaluate(() => (globalThis as unknown as Probed).universalisBoard.pictured().sort());

/** Answers the windows over the board with their first enabled button until none is left. */
async function answerAll(page: Page): Promise<string[]> {
  const texts: string[] = [];
  for (let i = 0; i < 40; i++) {
    if ((await page.locator('.transition-window').count()) > 0) {
      await expect(page.locator('.transition-window')).toHaveCount(0, { timeout: 5000 });
      continue;
    }
    const windows = page.locator('.dialog-layer .event-window');
    if ((await windows.count()) === 0) break;
    const text = (await windows.last().textContent()) ?? '';
    texts.push(text);
    await page.locator('.dialog-layer .event-button:enabled').first().click();
    for (let wait = 0; wait < 20; wait++) {
      if ((await windows.count()) === 0 || (await windows.last().textContent()) !== text) break;
      await page.waitForTimeout(50);
    }
  }
  return texts;
}

/** Chooses the packs with these acronyms in a category of the collection. */
async function choosePacks(page: Page, category: string, acronyms: string[]): Promise<void> {
  await page.locator('.pack-type', { hasText: category }).click();
  for (const acronym of acronyms) {
    // The acronym is followed by the pack's symbol, a character of the official fonts
    const row = page.locator('.pack-row').filter({ has: page.locator('.pack-note', { hasText: new RegExp(`^\\(${acronym}\\b`) }) });
    await row.locator('.pack-choice').click();
    await expect(row).toHaveClass(/chosen/);
  }
  await page.getByRole('button', { name: 'Volver' }).click();
}

/** The engine as the development server hands it to the app, so that the page's own game is reached. */
const engineUrl = `/@fs/${join(root, 'packages/engine/src/index.ts').replaceAll('\\', '/').replace(/^\//, '')}`;

/** Starts one of the quest's events, as a click on its token would. */
async function queueEvent(page: Page, name: string): Promise<void> {
  await page.evaluate(
    async ([url, event]) => {
      const engine = (await import(url)) as typeof import('@universalis/engine');
      const manager = engine.Game.get().currentQuest!.eManager;
      if (!manager.events.has(event)) throw new Error(`No event ${event}`);
      manager.queueEvent(event);
    },
    [engineUrl, name],
  );
}

/** A legal move in the puzzle window open now, chosen with the engine's own rules. */
async function puzzleMove(page: Page): Promise<{ piece: number; dx: number; dy: number }> {
  return page.evaluate(async (url) => {
    const store = (await import(url)) as typeof import('../src/ui/store.ts');
    const open = store.useUI.getState().windows.find((w) => w.kind.startsWith('puzzle-'));
    if (open?.kind === 'puzzle-slide') {
      const w = open.window;
      for (const [piece, block] of w.puzzle.puzzle.entries()) {
        const at = block.rotation ? block.ypos : block.xpos;
        const step = w.getPositiveLimit(block) > at ? 1 : w.getNegativeLimit(block) < at ? -1 : 0;
        if (step !== 0) return { piece, dx: block.rotation ? 0 : step, dy: block.rotation ? step : 0 };
      }
    }
    if (open?.kind === 'puzzle-image') {
      const [screen, picture] = [...open.window.puzzle.state][0];
      const columns = open.window.questPuzzle.puzzleLevel;
      return { piece: picture.x + picture.y * columns + 1, dx: screen.x < columns - 1 ? 1 : -1, dy: 0 };
    }
    if (open?.kind === 'puzzle-tower') {
      const puzzle = open.window.puzzle;
      for (let from = 0; from < 3; from++) {
        for (let to = 0; to < 3; to++) if (from !== to && puzzle.moveOK(from, to)) return { piece: from, dx: to - from, dy: 0 };
      }
    }
    throw new Error(`No move in ${open?.kind}`);
  }, '/src/ui/store.ts');
}

/** Drags with the mouse from the middle of a box, by this many pixels. */
async function drag(page: Page, box: { x: number; y: number; width: number; height: number }, dx: number, dy: number): Promise<void> {
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy, { steps: 10 });
  await page.mouse.up();
}

/** Clicks a quest UI element where nothing covers it, as a player would. */
async function clickQuestUI(page: Page, name: string): Promise<void> {
  const element = page.locator(`button[data-quest-ui="${name}"]`);
  await expect(element).toBeVisible();
  const box = (await element.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

test('opens a scenario that needs TLE and goes through its intro, as Valkyrie does', async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  const shot = (name: string) => page.screenshot({ path: testInfo.outputPath(`${name}.png`) });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const downloads = await serveStore(page);

  // The community pack, downloaded and chosen with the expansions the scenario asks for
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Mi Colección' }).click();
  await page.getByRole('button', { name: 'Descarga de contenidos' }).click();
  const lost = page.locator('.pack-download', { hasText: 'Expediciones perdidas' });
  await lost.getByRole('button', { name: 'Descargar' }).click();
  await expect(lost.getByRole('button', { name: 'Eliminar' })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Volver' }).click();
  await choosePacks(page, 'Caja de Expansión', ['BtT', 'HJ', 'PotS', 'SoA', 'SoT']);
  await choosePacks(page, 'Colección de Figuras y Tableros', ['RN', 'SM']);
  await choosePacks(page, 'Paquetes de contenidos comunitarios', ['TLE']);
  await page.getByRole('button', { name: 'Volver' }).click();

  // The scenario, from the store
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await page.getByRole('searchbox').fill('Pharaoh');
  await page.getByRole('searchbox').press('Enter');
  const card = page.locator('.quest', { hasText: "The Pharaoh's Tomb" });
  await expect(card.locator('.quest-action')).toHaveText('Descargar');
  await card.click();
  await expect(card.locator('.quest-action')).toHaveText('Jugar', { timeout: 60_000 });
  expect(downloads).toEqual(['TLE.valkyrieContentPack', 'Desert_en.valkyrie']);
  await card.click();
  await expect(page.getByRole('heading', { name: "The Pharaoh's Tomb" })).toBeVisible();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await expect(page.getByRole('heading', { name: 'Selección de Investigadores' })).toBeVisible({ timeout: 30_000 });
  const heroes = page.locator('.hero-choice');
  await heroes.nth(0).click();
  await heroes.nth(1).click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  await expect(page.getByRole('heading', { name: 'Objetos' })).toBeVisible();
  await page.getByRole('button', { name: 'Terminado' }).click();

  // The intro: a picture (UI0) under a button as big as the screen (UI1), and no board yet
  await expect(page.locator('[data-quest-ui="UI0"]')).toBeVisible();
  await expect.poll(() => tiles(page)).toEqual([]);
  await expect(page.locator('.phase-name')).toHaveCount(0);
  await shot('01-intro');
  await clickQuestUI(page, 'UI1');
  await expect(page.locator('[data-quest-ui="UI1"]')).toHaveCount(0);
  // The second click changes quest: the first of the hundred maps in all/, whose first tile is TLE's
  await clickQuestUI(page, 'UI2');
  await expect(page.locator('.dialog-layer .event-window')).toContainText('The desert heat', { timeout: 30_000 });
  await expect(page.locator('[data-quest-ui]')).toHaveCount(0);
  await shot('02-new-quest');
  await answerAll(page);
  await expect.poll(() => tiles(page)).toEqual(['ObjectTileSideTLEBedouin']);
  await expect(page.locator('.phase-name')).toHaveText('Fase de los Investigadores');
  // The tile's picture comes from the pack, the tokens' from Valkyrie
  await expect.poll(() => pictured(page)).toContain('ObjectTileSideTLEBedouin');
  await expect.poll(async () => (await pictured(page)).length).toBeGreaterThan(5);
  const drawn = await pictured(page);
  await shot('03-board');

  // The change of quest saved the game: continuing goes back to that map, filling the screen again if the player left it
  await page.evaluate('document.exitFullscreen()');
  await page.getByRole('button', { name: 'Menú' }).click();
  await page.getByRole('button', { name: 'Menú principal' }).click();
  await page.getByRole('button', { name: 'Salir', exact: true }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.locator('.save-slot').first()).toContainText('The nightmare at Swaniawski');
  await expect(page.locator('html:fullscreen')).toHaveCount(0);
  await page.locator('.save-slot').first().click();
  await expect(page.locator('html:fullscreen')).toHaveCount(1);
  await expect.poll(() => tiles(page)).toEqual(['ObjectTileSideTLEBedouin']);
  await expect(page.locator('.phase-name')).toHaveText('Fase de los Investigadores');
  await expect.poll(() => pictured(page)).toEqual(drawn);
  await shot('04-continued');

  // The map's three kinds of puzzle, which stopped the game before they were ported: each opens, takes a move dragged
  // with the mouse, and closes; the game goes on and keeps the moves for the next time
  const puzzles = [
    ['PuzzleUnlockTokenSideDesecratedTomb1toSideBlackObelisk1', 'slide'],
    ['PuzzleUnlockTokenSideTLEBurialChamber1toSideTLEDigSite1', 'image'],
    ['PuzzleUnlockTokenSideTabletChamber1toSideBlackObelisk1', 'tower'],
  ] as const;
  for (const [event, kind] of puzzles) {
    await queueEvent(page, event);
    const window = page.locator(`.${kind}-window`);
    const counts = window.locator('.puzzle-counts p');
    await expect(counts.nth(1)).toHaveText('Movimientos: 0');
    const move = await puzzleMove(page);
    if (kind === 'slide') {
      const square = (await page.locator('.slide-board').boundingBox())!.width / 8;
      await drag(page, (await page.locator(`.slide-block[data-block="${move.piece}"]`).boundingBox())!, move.dx * square, move.dy * square);
    } else if (kind === 'image') {
      const box = (await page.locator(`.image-piece[data-piece="${move.piece}"]`).boundingBox())!;
      await drag(page, box, move.dx * box.width, 0);
    } else {
      const from = (await page.locator(`.tower-box[data-tower="${move.piece}"]`).boundingBox())!;
      const to = (await page.locator(`.tower-box[data-tower="${move.piece + move.dx}"]`).boundingBox())!;
      await drag(page, from, to.x - from.x, 0);
    }
    await expect(counts.nth(1)).toHaveText('Movimientos: 1');
    await shot(`05-${kind}`);
    await window.getByRole('button', { name: 'Cerrar' }).click();
    await expect(page.locator('.puzzle-window')).toHaveCount(0);
  }
  await queueEvent(page, puzzles[0][0]);
  await expect(page.locator('.slide-window .puzzle-counts p').nth(2)).toHaveText('Total Movims.: 1');
  await page.locator('.slide-window').getByRole('button', { name: 'Cerrar' }).click();
  await page.getByRole('button', { name: 'Menú' }).click();
  await expect(page.getByRole('button', { name: 'Menú principal' })).toBeVisible();

  expect(errors).toEqual([]);
  await expect(page.locator('.stop-window')).toHaveCount(0);
});
