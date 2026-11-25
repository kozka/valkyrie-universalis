// The Demo in a real browser: choose Mansions, add Exotic Material (Material exótico in Spanish), start it, choose
// investigators, see the starting items, play its first events and use the board; then play it to the end, with its
// lock, a round, a saved game and its ending. Without official content, in the tests' schematic mode (?schematic).
// Needs the downloaded scenarios (node referencias/descargar-escenarios.mjs).
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import type { BoardProbe } from '../src/board/probe.ts';
import { pick } from './fixtures/options.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const scenario = join(root, 'referencias/descargas/MoM/escenarios/ExoticMaterial.valkyrie');
const valkyrie = join(root, 'referencias/valkyrie');

test.use({ locale: 'es-ES' });
test.skip(!existsSync(scenario), 'Missing referencias/descargas: run node referencias/descargar-escenarios.mjs');

// Valkyrie's own pictures come from its repository: serve them from the local clone, or let the board draw schematics.
// The store is out of reach, so the list is the one in the browser (store.spec.ts has the store).
test.beforeEach(async ({ page }) => {
  await page.route('https://raw.githubusercontent.com/NPBruce/valkyrie-store/**', (route) => route.abort());
  await page.route('https://raw.githubusercontent.com/NPBruce/valkyrie/**', async (route) => {
    const path = decodeURIComponent(new URL(route.request().url()).pathname.split('/').slice(4).join('/'));
    const file = join(valkyrie, path);
    if (existsSync(file)) await route.fulfill({ path: file, headers: { 'access-control-allow-origin': '*' } });
    else await route.abort();
  });
});

/** The page, as the board's probe leaves it in development builds. */
type Probed = { universalisBoard: BoardProbe };
// None until the board is drawn (a game is loaded after its file is read from storage)
const tiles = (page: Page) => page.evaluate(() => (globalThis as unknown as Partial<Probed>).universalisBoard?.tiles() ?? []);
const camera = (page: Page) => page.evaluate(() => (globalThis as unknown as Probed).universalisBoard.camera());
const clickable = (page: Page) => page.evaluate(() => (globalThis as unknown as Probed).universalisBoard.clickable());

/** Waits until the camera stops gliding towards its target, so a piece stays where the probe says. */
async function settle(page: Page): Promise<void> {
  let last = '';
  for (let i = 0; i < 40; i++) {
    const now = JSON.stringify(await camera(page));
    if (now === last) return;
    last = now;
    await page.waitForTimeout(150);
  }
}

/**
 * Answers the windows over the board with their first enabled button (the success, when an event asks), adding the
 * successes a quota asks for, until none is left or a puzzle opens. Returns the texts it read.
 */
async function answerAll(page: Page): Promise<string[]> {
  const texts: string[] = [];
  for (let i = 0; i < 40; i++) {
    if ((await page.locator('.transition-window').count()) > 0) {
      await expect(page.locator('.transition-window')).toHaveCount(0, { timeout: 5000 });
      continue;
    }
    if ((await page.locator('.puzzle-window').count()) > 0) break;
    const windows = page.locator('.dialog-layer .event-window');
    if ((await windows.count()) === 0) break;
    const text = (await windows.last().textContent()) ?? '';
    texts.push(text);
    const quota = page.locator('.quota');
    if ((await quota.count()) > 0) {
      for (let k = 0; k < 3; k++) await quota.getByRole('button').last().click();
    }
    await page.locator('.dialog-layer .event-button:enabled').first().click();
    // The next window, if any, before reading again (the same text may come back, so this does not insist)
    for (let wait = 0; wait < 20; wait++) {
      if ((await windows.count()) === 0 || (await windows.last().textContent()) !== text) break;
      await page.waitForTimeout(50);
    }
  }
  return texts;
}

/** Clicks a piece of the board, dragging the board first when it is near an edge or behind the bars. */
async function clickPiece(page: Page, name: string): Promise<void> {
  const viewport = page.viewportSize()!;
  for (let attempt = 0; attempt < 10; attempt++) {
    await settle(page);
    const piece = (await clickable(page)).find((t) => t.name === name);
    expect(piece, `${name} is not clickable`).toBeDefined();
    const { x, y } = piece!;
    if (x > 60 && x < viewport.width - 90 && y > 110 && y < viewport.height - 120) {
      await page.mouse.click(x, y);
      return;
    }
    const middle = { x: viewport.width / 2, y: viewport.height / 2 };
    await page.mouse.move(middle.x, middle.y);
    await page.mouse.down();
    await page.mouse.move(middle.x + Math.max(-250, Math.min(250, middle.x - x)), middle.y + Math.max(-250, Math.min(250, middle.y - y)), { steps: 8 });
    await page.mouse.up();
  }
  throw new Error(`Could not bring ${name} into view`);
}

async function openQuestList(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: 'Valkyrie Universalis' })).toBeVisible();
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await expect(page.getByRole('heading', { name: 'Selección de Escenario' })).toBeVisible();
}

test('plays the start of Exotic Material', async ({ page }, testInfo) => {
  const shot = (name: string) => page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/?schematic');
  await expect(page.getByText('No oficial, hecha por fans')).toBeVisible();
  await shot('01-games');

  await expect(page.locator('html')).not.toHaveAttribute('data-game');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await expect(page.getByRole('button', { name: 'Partida nueva' })).toBeVisible();
  // The game picks its look (theme.css)
  await expect(page.locator('html')).toHaveAttribute('data-game', 'MoM');
  await shot('02-menu');
  // An app, not a page: its text is not selected
  await page.keyboard.press('ControlOrMeta+A');
  expect(await page.evaluate('getSelection().toString()')).toBe('');

  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await expect(page.getByText(/Todavía no hay escenarios/)).toBeVisible();
  await page.locator('input[type=file]').setInputFiles(scenario);
  const card = page.getByRole('button', { name: /Material exótico/ });
  await expect(card).toBeVisible();
  await shot('03-quests');

  await card.click();
  await expect(page.getByRole('button', { name: 'Iniciar' })).toBeVisible();
  // Centred, as Valkyrie draws its texts (UIElement.SetText)
  await expect(page.locator('.description')).toHaveCSS('text-align', 'center');
  await shot('04-details');

  await page.getByRole('button', { name: 'Iniciar' }).click();
  await expect(page.getByRole('heading', { name: 'Selección de Investigadores' })).toBeVisible();
  // Playing fills the screen
  await expect(page.locator('html:fullscreen')).toHaveCount(1);
  const heroes = page.locator('.hero-choice');
  await heroes.nth(0).click();
  await heroes.nth(1).click();
  await expect(page.locator('.hero-slot .portrait')).toHaveCount(2);
  await shot('05-heroes');

  await page.getByRole('button', { name: 'Terminado' }).click();
  await expect(page.getByRole('heading', { name: 'Objetos' })).toBeVisible();
  await shot('06-items');

  await page.getByRole('button', { name: 'Terminado' }).click();
  await expect(page.locator('.event-window')).toBeVisible();
  await expect(page.locator('.event-text')).toHaveCSS('text-align', 'center');
  await shot('07-first-event');

  for (let step = 0; step < 10 && (await page.locator('.event-window').count()) > 0; step++) {
    await page.locator('.event-button:enabled').first().click();
  }
  // The board: the two tiles of the intro, with their tokens fading in
  await expect.poll(() => tiles(page)).toEqual(['ObjectTileTownSquare', 'ObjectTileStorefront']);
  await page.waitForTimeout(1500);
  await shot('08-board');

  // Dragging moves the camera; the wheel zooms out
  const before = await camera(page);
  const viewport = page.viewportSize()!;
  await page.mouse.move(viewport.width / 2, viewport.height / 2);
  await page.mouse.down();
  await page.mouse.move(viewport.width / 2, viewport.height / 2 - 120, { steps: 6 });
  await page.mouse.up();
  const dragged = await camera(page);
  expect(dragged.y).toBeLessThan(before.y - 0.5);
  if (testInfo.project.name === 'desktop') {
    await page.mouse.wheel(0, 200);
    await expect.poll(async () => (await camera(page)).z).toBeLessThan(dragged.z);
  }

  // A click on a token starts its event, as its button does in Valkyrie
  const token = (await clickable(page)).find((t) => t.name === 'ObjectTokenSearchSquare');
  expect(token).toBeDefined();
  await page.mouse.click(token!.x, token!.y);
  await expect(page.locator('.event-window')).toBeVisible();
  await expect(page.locator('.event-text')).toContainText('montón de basura');
  await shot('09-token-event');
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.locator('.event-window')).toHaveCount(0);

  expect(errors).toEqual([]);
  await expect(page.locator('.stop-window')).toHaveCount(0);
});

test('keeps an added scenario and deletes it', async ({ page }) => {
  await page.goto('/?schematic');
  await openQuestList(page);
  await page.locator('input[type=file]').setInputFiles(scenario);
  await expect(page.getByRole('button', { name: /Material exótico/ })).toBeVisible();

  // Written to the browser's storage in the background
  await page.waitForTimeout(1000);
  await page.reload();
  await openQuestList(page);
  await page.getByRole('button', { name: /Material exótico/ }).click();
  await page.getByRole('button', { name: 'Eliminar' }).click();
  // Asked first, as a tap by mistake would mean downloading it again
  await page.getByRole('alertdialog').getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.getByText(/Todavía no hay escenarios/)).toBeVisible();

  await page.waitForTimeout(1000);
  await page.reload();
  await openQuestList(page);
  await expect(page.getByText(/Todavía no hay escenarios/)).toBeVisible();
});

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

test('continues a saved game and starts a kept scenario after a reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?schematic');
  await openQuestList(page);
  await page.locator('input[type=file]').setInputFiles(scenario);
  await page.getByRole('button', { name: /Material exótico/ }).click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  const heroes = page.locator('.hero-choice');
  await heroes.nth(0).click();
  await heroes.nth(1).click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  await answerAll(page);

  // Saved in the first slot from the game menu, and written to the browser's storage
  await page.getByRole('button', { name: 'Menú' }).click();
  await page.locator('.dialog-layer').getByRole('button', { name: 'Guardar' }).click();
  await page.locator('.save-slot').first().click();
  await expect.poll(() => keptSize(page, 'AppData/Valkyrie/MoM/Save/save1.vSave')).toBeGreaterThan(0);

  // After a reload the save and the scenario stay on disk until they are listed or played (host/storage.ts)
  await page.reload();
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  const slot = page.locator('.save-slot', { hasText: 'Material exótico' });
  await expect(slot).toHaveCount(1);
  await slot.click();
  await expect.poll(() => tiles(page)).toEqual(['ObjectTileTownSquare', 'ObjectTileStorefront']);

  // A fresh start, as Valkyrie would list the save's quest too, still in its temporary folder (docs/contexto-tecnico.md)
  await page.reload();
  await openQuestList(page);
  await page.getByRole('button', { name: /Material exótico/ }).click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await expect(page.getByRole('heading', { name: 'Selección de Investigadores' })).toBeVisible();
  expect(errors).toEqual([]);
  await expect(page.locator('.stop-window')).toHaveCount(0);
});

test('plays with the web extras: read aloud, Enter goes on, the log marks the phases, and the Mythos asks first', async ({ page, context }, testInfo) => {
  const shot = (name: string) => page.screenshot({ path: testInfo.outputPath(`${name}.png`) });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  // The advanced switch, from Options (docs/peticiones.md)
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Opciones' }).click();
  // The classic screens, whose investigator list has the extras this test looks at (Universalis has kozka's room)
  await pick(page.getByRole('combobox', { name: 'Tema' }), 'Clásico');
  await page.getByText('Opciones avanzadas').click();
  await page.getByRole('switch', { name: 'Preguntar antes de terminar la fase de investigadores' }).check();
  await pick(page.getByRole('combobox', { name: 'Tamaño de las fichas del tablero' }), 'Grande (+30 %)');
  await pick(page.getByRole('combobox', { name: 'Tamaño de los objetos' }), 'Grande');
  await page.getByRole('button', { name: 'Volver' }).click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await page.locator('input[type=file]').setInputFiles(scenario);
  await page.getByRole('button', { name: /Material exótico/ }).click();
  // The tiles it uses, after a spoiler warning, each once with its name
  await page.getByRole('button', { name: 'Ver losetas' }).click();
  await expect(page.getByRole('alertdialog')).toContainText('Aviso de spoiler');
  await page.getByRole('button', { name: 'Continuar y verlas' }).click();
  const tilesWindow = page.getByRole('dialog', { name: 'Losetas del escenario' });
  await expect(tilesWindow.locator('.tiles-grid li').first()).toBeVisible();
  // The table the largest map needs, in centimetres
  await expect(tilesWindow.locator('.tiles-table')).toContainText(/Mesa necesaria: unos \d+ × \d+ cm/);
  // An estimate, which its (i) says
  await tilesWindow.getByRole('button', { name: 'Más información' }).click();
  await expect(tilesWindow.getByRole('tooltip')).toBeVisible();
  await expect(tilesWindow.getByRole('tooltip')).toContainText('puede diferir de la realidad');
  await shot('17-tiles-info');
  expect(await tilesWindow.locator('.tiles-grid li').count()).toBeGreaterThan(2);
  await shot('17-tiles');
  await tilesWindow.getByRole('button', { name: 'Cerrar' }).click();
  // The details read as before
  await expect(page.locator('.description')).toContainText(/meteorito/);
  await page.getByRole('button', { name: 'Iniciar' }).click();
  // How many investigators the scenario asks for, and the list as big pictures
  await expect(page.locator('.hero-count')).toContainText(/Este escenario pide .*elegidos: 0/);
  await page.getByRole('radio', { name: 'Retratos' }).click();
  await expect(page.locator('.hero-selection')).toHaveAttribute('data-view', 'larger');
  const heroes = page.locator('.hero-choice');
  await heroes.nth(0).click();
  await heroes.nth(1).click();
  await expect(page.locator('.hero-count')).toContainText('elegidos: 2');
  await shot('17b-heroes-pictures');
  await page.getByRole('button', { name: 'Terminado' }).click();
  // The starting items, large, each with its name beside it
  await expect(page.getByRole('heading', { name: 'Objetos' })).toBeVisible();
  await shot('18-large-items');
  await page.getByRole('button', { name: 'Terminado' }).click();

  // A window with one button goes on with Enter; the buttons that would do nothing meanwhile are greyed
  const windows = page.locator('.dialog-layer .event-window');
  await expect(windows).toHaveCount(1);
  // Each event can be read aloud, with the browser's voices
  await expect(windows.last().getByRole('button', { name: 'Leer en voz alta' })).toBeVisible();
  await shot('19-read-aloud');
  for (let step = 0; step < 20 && (await windows.count()) > 0; step++) {
    const text = await windows.last().textContent();
    if ((await windows.last().locator('.event-button:enabled').count()) === 1) {
      await page.locator('body').focus();
      await page.keyboard.press('Enter');
    } else {
      await windows.last().locator('.event-button:enabled').first().click();
    }
    await expect.poll(async () => ((await windows.count()) === 0 ? null : await windows.last().textContent())).not.toBe(text);
  }
  await expect(windows).toHaveCount(0);
  await expect(page.locator('.phase-bar .next-phase')).toBeVisible();
  await expect(page.locator('.phase-bar .next-phase')).not.toHaveClass(/idle/);
  await page.waitForTimeout(1000);
  await shot('20-large-tokens');

  // The wheel zooms to the point under the pointer, not to the middle of the screen
  if (testInfo.project.name === 'desktop') {
    await settle(page);
    const before = await camera(page);
    await page.mouse.move(250, 300);
    await page.mouse.wheel(0, -300);
    await expect.poll(async () => (await camera(page)).z).toBeGreaterThan(before.z);
    const after = await camera(page);
    expect(after.x).toBeLessThan(before.x);
    expect(after.y).toBeGreaterThan(before.y);
  }

  // The game's menu has the options a game may want changed, over the board
  await page.getByRole('button', { name: 'Menú' }).click();
  await page.locator('.event-window').getByRole('button', { name: 'Opciones' }).click();
  const quick = page.getByRole('dialog', { name: 'Opciones' });
  await expect(quick.getByRole('combobox', { name: 'Tamaño del texto' })).toBeVisible();
  await expect(quick.getByRole('combobox', { name: 'Voz para leer en voz alta' })).toBeVisible();
  await shot('20b-quick-options');
  await quick.getByRole('button', { name: 'Cerrar' }).click();
  await expect(quick).toHaveCount(0);

  // Ending the investigators' phase asks first; cancelled, nothing happens
  const next = page.getByRole('button', { name: 'Siguiente fase' });
  await next.click();
  const asking = page.getByRole('alertdialog');
  await expect(asking).toContainText('¿Terminar la fase de investigadores y empezar la de Mitos?');
  await shot('21-confirm-phase');
  await asking.getByRole('button', { name: 'Cancelar' }).click();
  await expect(asking).toHaveCount(0);
  await expect(page.locator('.phase-name')).toHaveText('Fase de los Investigadores');
  await next.click();
  await asking.getByRole('button', { name: 'Confirmar' }).click();
  await expect(page.locator('.phase-name')).not.toHaveText('Fase de los Investigadores');

  // The log, during the Mythos too, with the phase standing out, and copied as plain text
  await page.getByRole('button', { name: 'Log', exact: true }).click();
  const log = page.locator('.log-window');
  await expect(log.locator('.log-mark').first()).toHaveText('Fase de Mitos');
  // Its lines count as a window: what would do nothing meanwhile is greyed, the log's own button is not
  await expect(page.locator('.phase-bar .next-phase')).toHaveClass(/idle/);
  await expect(page.locator('.phase-bar .button', { hasText: /^Log$/ })).not.toHaveClass(/idle/);
  await shot('22-log');
  await log.getByRole('button', { name: 'Copiar' }).click();
  await expect(log.getByRole('button', { name: 'Copiado' })).toBeVisible();
  expect(await page.evaluate<string>('navigator.clipboard.readText()')).toContain('Fase de Mitos');
  await log.getByRole('button', { name: 'Cerrar' }).click();

  expect(errors).toEqual([]);
  await expect(page.locator('.stop-window')).toHaveCount(0);
});

test('translates a scenario that does not come in the language being read, with the player\'s OpenRouter key', async ({ page }, testInfo) => {
  test.skip(true, 'The automatic translation is paused (TRANSLATION_PAUSED in host/translator.ts, 16 October 2026)');
  const shot = (name: string) => page.screenshot({ path: testInfo.outputPath(`${name}.png`) });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // OpenRouter, made up: its free models, and a translation that marks each text, a moment later
  const asked: { model: string; key: string; texts: string[] }[] = [];
  await page.route('https://openrouter.ai/api/v1/models', (route) =>
    route.fulfill({ json: { data: [{ id: 'deepseek/deepseek-chat-v3.1:free', pricing: { prompt: '0', completion: '0' } }, { id: 'slow/model:free', pricing: { prompt: '0', completion: '0' } }, { id: 'other/paid', pricing: { prompt: '0.000001', completion: '0.000002' } }] }, headers: { 'access-control-allow-origin': '*' } }),
  );
  await page.route('https://openrouter.ai/api/v1/chat/completions', async (route) => {
    const body = route.request().postDataJSON() as { model: string; messages: { content: string }[] };
    const texts = JSON.parse(body.messages[1]!.content) as string[];
    asked.push({ model: body.model, key: route.request().headers()['authorization'] ?? '', texts });
    // A free model that does not answer while the player waits
    if (body.model === 'slow/model:free') {
      await new Promise((resolve) => setTimeout(resolve, 15_000));
      await route.abort().catch(() => {});
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await route.fulfill({ json: { choices: [{ message: { content: '```json\n' + JSON.stringify(texts.map((t) => '[CS] ' + t)) + '\n```' } }] }, headers: { 'access-control-allow-origin': '*' } });
  });

  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Opciones' }).click();
  await page.getByText('Opciones avanzadas').click();
  // Turning it on first says what it does and how to get a key
  await page.getByRole('switch', { name: 'Traducción automática' }).check();
  const warning = page.getByRole('alertdialog');
  await expect(warning).toContainText('openrouter.ai');
  await expect(warning.locator('li')).toHaveCount(4);
  await shot('30-translate-warning');
  await warning.getByRole('button', { name: 'Activar' }).click();
  await page.getByLabel('Clave de OpenRouter').fill('sk-or-test');
  await expect(page.locator('.translate-field select')).toHaveValue('deepseek/deepseek-chat-v3.1:free');
  // A test that a model leaves waiting does not stop another: the player changes model and tries again
  const select = page.locator('.translate-field select');
  await select.selectOption('slow/model:free');
  await page.getByRole('button', { name: 'Probar la traducción' }).click();
  await expect(page.locator('.translate-settings .translating')).toBeVisible();
  await select.selectOption('deepseek/deepseek-chat-v3.1:free');
  await expect(page.locator('.translate-settings .translating')).toHaveCount(0);
  await page.getByRole('button', { name: 'Probar la traducción' }).click();
  await expect(page.locator('.translate-result')).toContainText('[CS] ');
  await expect(page.locator('.translate-settings')).toContainText(/deepseek\/deepseek-chat-v3\.1:free respondió en \d+ s/);
  // And again, with the same model: it answers at once
  await page.getByRole('button', { name: 'Probar la traducción' }).click();
  await expect(page.locator('.translate-result')).toContainText('[CS] ');
  await page.screenshot({ path: testInfo.outputPath('31-translate-options.png'), fullPage: true });

  // Czech, which Exotic Material does not come in
  await pick(page.getByRole('combobox', { name: 'Idioma' }), /^Checo/);
  await page.locator('.screen-foot .button.back').click();
  await page.getByRole('button', { name: 'Nová hra' }).click();
  await page.locator('input[type=file]').setInputFiles(scenario);
  await page.getByRole('button', { name: /Exotic Material|Material exótico/ }).click();
  await page.getByRole('button', { name: 'Začátek' }).click();
  const heroes = page.locator('.hero-choice');
  await heroes.nth(0).click();
  await heroes.nth(1).click();
  await page.getByRole('button', { name: 'Dokončeno' }).click();
  await page.getByRole('button', { name: 'Dokončeno' }).click();

  // Lines while the translation comes, then the text and its button translated, said so under it
  const card = page.locator('.dialog-layer .event-window').last();
  await expect(card.locator('.translating')).toBeVisible();
  await shot('32-translating');
  await expect(card.locator('.event-text')).toContainText('[CS] ');
  await expect(card.locator('.event-button').first()).toContainText('[CS] ');
  await expect(card.locator('.translated-note')).toBeVisible();
  await shot('33-translated');
  expect(asked.slice(0, 2).map((a) => a.model)).toEqual(['slow/model:free', 'deepseek/deepseek-chat-v3.1:free']);
  expect(asked.slice(2).map((a) => a.model)).toContain('deepseek/deepseek-chat-v3.1:free');
  expect(asked.at(-1)!.key).toBe('Bearer sk-or-test');
  expect(errors).toEqual([]);
});

test('plays Exotic Material to the end, saving and continuing on the way', async ({ page }, testInfo) => {
  // Five minutes or more on a phone in a slow machine
  test.setTimeout(600_000);
  const shot = (name: string) => page.screenshot({ path: testInfo.outputPath(`${name}.png`) });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/?schematic');
  await openQuestList(page);
  await page.locator('input[type=file]').setInputFiles(scenario);
  await page.getByRole('button', { name: /Material exótico/ }).click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  const heroes = page.locator('.hero-choice');
  await heroes.nth(0).click();
  await heroes.nth(1).click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  await answerAll(page);

  // A search gives an item, which the dialog shows; the spell, one of them, takes two successes first
  await clickPiece(page, 'ObjectTokenSearchSquare');
  await expect(page.locator('.event-window')).toContainText('montón de basura');
  await page.getByRole('button', { name: 'Buscar' }).click();
  const quota = page.locator('.quota');
  await expect(page.locator('.item-panel').or(quota)).toBeVisible();
  if ((await quota.count()) > 0) {
    for (let k = 0; k < 2; k++) await quota.getByRole('button').last().click();
    await page.locator('.dialog-layer .event-button:enabled').first().click();
  }
  await expect(page.locator('.item-panel')).toBeVisible();
  await shot('10-item');
  await answerAll(page);

  for (const piece of ['ObjectTokenExploreShop', 'ObjectTokenExploreStreet']) {
    await clickPiece(page, piece);
    await answerAll(page);
  }
  // The figures in the shop and the street stand still: they are tokens, not monsters yet
  await expect(page.locator('.monster-icon')).toHaveCount(0);

  // The investigators end their turn: the mythos phase, then round two, saved automatically
  await page.getByRole('button', { name: 'Siguiente fase' }).click();
  await answerAll(page);
  await expect(page.locator('.phase-name')).toHaveText('Fase de los Investigadores');
  await expect(page.locator('.transition-window')).toHaveCount(0);

  // Back to the main menu (which saves too), and continue from the autosave
  await page.getByRole('button', { name: 'Menú' }).click();
  await page.getByRole('button', { name: 'Menú principal' }).click();
  await page.getByRole('button', { name: 'Salir', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeEnabled();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.locator('.save-slot')).toHaveCount(4);
  await expect(page.locator('.save-slot').first()).toContainText('Material exótico');
  await shot('11-saves');
  await page.locator('.save-slot').first().click();
  await expect.poll(() => tiles(page)).toEqual(['ObjectTileTownSquare', 'ObjectTileStorefront', 'ObjectTileStreetCorner', 'ObjectTileWarehouse']);

  // The warehouse's lock: a wrong guess is scored, the right one opens it
  await clickPiece(page, 'ObjectTokenExploreWarehouse');
  await page.getByRole('button', { name: 'Abrir' }).click();
  await expect(page.locator('.puzzle-window')).toBeVisible();
  // The code the puzzle drew, from the window the app shows (development build)
  const code = await page.evaluate(async (url) => {
    const store = (await import(url)) as typeof import('../src/ui/store.ts');
    const window = store.useUI.getState().windows.find((w) => w.kind === 'puzzle-code');
    return window?.kind === 'puzzle-code' ? window.window.puzzle.answer.state : [];
  }, '/src/ui/store.ts');
  expect(code).toHaveLength(4);
  const symbols = page.getByRole('group', { name: 'Símbolos' }).getByRole('button');
  // Each symbol the next one: none in its place
  for (const symbol of code) await symbols.nth(symbol % 4).click();
  await page.getByRole('button', { name: 'Resolver' }).click();
  await expect(page.locator('.code-guesses li')).toHaveCount(1);
  await expect(page.locator('.code-result').first()).toHaveAttribute('aria-label', /^0 bien colocados/);
  for (const symbol of code) await symbols.nth(symbol - 1).click();
  await page.getByRole('button', { name: 'Resolver' }).click();
  await expect(page.locator('.code-result').last()).toHaveAttribute('aria-label', /^4 bien colocados/);
  await shot('12-lock');
  await page.locator('.puzzle-window').getByRole('button', { name: 'Abrir' }).click();
  await answerAll(page);

  // Down to the cellar and up to the pond, through a jammed door that takes three successes
  for (const piece of ['ObjectTokenExploreBasement', 'ObjectTokenExploreCellar', 'ObjectTokenExplorePond']) {
    await clickPiece(page, piece);
    await answerAll(page);
  }
  // Taking the rock wakes everyone up and shows the way out
  await clickPiece(page, 'ObjectTokenRock');
  const awake = await answerAll(page);
  expect(awake.some((t) => t.includes('despiertan'))).toBe(true);
  await expect(page.locator('.monster-icon').first()).toBeVisible();
  await shot('13-awake');

  await clickPiece(page, 'ObjectTokenExit');
  await page.getByRole('button', { name: 'Escapar' }).click();
  await answerAll(page);
  const end = page.locator('.end-window');
  await expect(end.getByText('¿Habéis conseguido vencer?')).toBeVisible();
  await shot('14-end');
  // The game behind can no longer be used
  await expect(page.locator('.quest-play')).toHaveAttribute('inert');
  // EndGameScreen: sending without saying whether they won asks for it
  await end.getByRole('button', { name: 'Enviar' }).click();
  await expect(end.getByRole('alert')).toHaveText('Por favor puntúa el escenario y dinos si has ganado antes de enviar.');
  await end.getByRole('button', { name: '¡SÍ!' }).click();
  await end.getByRole('button', { name: '8', exact: true }).click();
  await end.getByRole('textbox').fill('Muy bueno, gracias');
  // Valkyrie's Google Form, answered here: no test reaches it
  const posted: string[] = [];
  await page.route('https://docs.google.com/forms/**', async (route) => {
    posted.push(route.request().postData() ?? '');
    await route.fulfill({ status: 200, body: '' });
  });
  await end.getByRole('button', { name: 'Enviar' }).click();
  await expect(page.getByRole('button', { name: 'Partida nueva' })).toBeVisible();
  expect(posted).toHaveLength(1);
  const form = new URLSearchParams(posted[0]);
  expect(form.get('entry.1875990408')).toBe('ExoticMaterial.valkyrie');
  expect(form.get('entry.84574628')).toBe('true');
  expect(form.get('entry.227102998')).toBe('8');
  expect(form.get('entry.2125749314')).toBe('Muy bueno, gracias');
  // Not in Valkyrie: the scenario is marked as played in the list (ui/marks.ts), with the players' rating
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  const card = page.locator('.quest', { hasText: 'Material exótico' });
  await expect(card.getByRole('img', { name: 'Jugada' })).toBeVisible();
  await expect(card.getByTitle('Tu nota: 8/10')).toHaveText('8');

  expect(errors).toEqual([]);
  await expect(page.locator('.stop-window')).toHaveCount(0);
});

/** From the list to the board of Exotic Material, added from its file, with two investigators. */
async function playToBoard(page: Page): Promise<void> {
  await openQuestList(page);
  await page.locator('input[type=file]').setInputFiles(scenario);
  await page.getByRole('button', { name: /Material exótico/ }).click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  const heroes = page.locator('.hero-choice');
  await heroes.nth(0).click();
  await heroes.nth(1).click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  await answerAll(page);
}

test('reports a problem from the game menu, and clears an eliminated investigator as the fire is cleared', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?schematic');
  await playToBoard(page);

  // Not in Valkyrie: the report from a game says which game, scenario and round it was (ui/Feedback.tsx)
  await page.getByRole('button', { name: 'Menú' }).click();
  await page.locator('.dialog-layer').getByRole('button', { name: 'Reportar un problema de la app' }).click();
  const report = page.getByRole('dialog', { name: 'Reportar un problema o proponer una idea' });
  await report.getByText('Datos técnicos').click();
  await expect(report.locator('pre')).toContainText('Juego: MoM');
  await expect(report.locator('pre')).toContainText('Pantalla de la app: quest');
  await expect(report.locator('pre')).toContainText('Escenario: ExoticMaterial.valkyrie (ronda 1)');
  await report.getByRole('button', { name: 'Cancelar' }).click();
  await expect(report).toHaveCount(0);

  // Set: an eliminated investigator is cleared the way the fire is, while the scenario lets (SetWindow.eliminatedComplete)
  await page.locator('.phase-bar .hud.set').click();
  await page.getByRole('button', { name: 'Investigador eliminado' }).click();
  await expect(page.getByRole('button', { name: 'Quitar eliminado' })).toBeEnabled();
  await page.getByRole('button', { name: 'Quitar eliminado' }).click();
  await expect(page.getByRole('button', { name: 'Investigador eliminado' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Quitar eliminado' })).toHaveCount(0);

  expect(errors).toEqual([]);
  await expect(page.locator('.stop-window')).toHaveCount(0);
});

test('says why the board is empty in a browser without WebGL', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // A browser without WebGL nor WebGPU, as an old computer whose graphics the browser does not trust
  await page.addInitScript(`{
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...rest) {
      return /webgl/i.test(kind) ? null : getContext.call(this, kind, ...rest);
    };
    Object.defineProperty(navigator, 'gpu', { value: undefined });
  }`);
  await page.goto('/?schematic');
  await playToBoard(page);
  await expect(page.locator('.board-no-webgl')).toHaveText(/Este navegador no puede dibujar el tablero, porque no tiene WebGL/);
  expect(errors).toEqual([]);
});
