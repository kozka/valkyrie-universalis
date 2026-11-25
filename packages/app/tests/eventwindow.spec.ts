// An event that places pieces, on a phone held sideways and on a big screen (29 October 2026): the camera brings the
// place into the part of the screen the window leaves free, the window folds away to show the board and unfolds again,
// and its buttons go side by side when they all fit, one under another when they do not. Its own scenario, so it needs
// no download.
import { expect, test, type Page } from '@playwright/test';
import { strToU8, zipSync } from 'fflate';
import type { BoardProbe } from '../src/board/probe.ts';

const ini = `[Quest]
format=21
type=MoM
defaultlanguage=Spanish
minhero=1
maxhero=5

[QuestText]
Localization.Spanish.txt

[EventStart]
display=true
trigger=EventStart
add=TileA
buttons=1
event1=EventPlace

[TileA]
side=TileSideAlley1
xposition=0
yposition=0

[TileB]
side=TileSideAlley2
xposition=4
yposition=-2
rotation=90

[TokenS]
type=TokenSearch
xposition=6.5
yposition=-2.5

[EventPlace]
display=true
xposition=6.5
yposition=-2.5
highlight=true
add=TileB TokenS
buttons=1
event1=EventChoice

[EventChoice]
display=true
xposition=6.5
yposition=-2.5
buttons=2
event1=EventThree
event2=EventThree

[EventThree]
display=true
cancelable=true
buttons=3
event1=
event2=
event3=
`;
const loc = `.,Spanish
quest.name,Prueba de colocar
quest.description,Prueba
EventStart.text,Empieza.
EventStart.button1,Continuar
EventPlace.text,En la pared hay una vitrina para armas en la que sólo queda una, y parece que está en buen estado.\\n\\nColoca el <i>Callejón</i> junto al anterior y una ficha de Búsqueda en el lugar señalado.
EventPlace.button1,Continuar
EventChoice.text,Pandu se agacha junto al cuerpo y empieza a registrar sus bolsillos con manos temblorosas.
EventChoice.button1,Intentar quitarle a Pandu
EventChoice.button2,Dejarle hacer
EventThree.text,¿Qué haces?
EventThree.button1,Huir por la ventana del sótano
EventThree.button2,Esconderse
EventThree.button3,Gritar
`;
test.use({ locale: 'es-ES' });
test.beforeEach(async ({ page }) => {
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
});

/** Where the search token is on the screen, once the camera has stopped. */
async function token(page: Page): Promise<{ x: number; y: number }> {
  let last = '';
  for (let i = 0; i < 40; i++) {
    const now = JSON.stringify(await page.evaluate(() => (globalThis as unknown as { universalisBoard: BoardProbe }).universalisBoard.camera()));
    if (now === last) break;
    last = now;
    await page.waitForTimeout(150);
  }
  const pieces = await page.evaluate(() => (globalThis as unknown as { universalisBoard: BoardProbe }).universalisBoard.clickable());
  const found = pieces.find((p) => p.name.includes('TokenS'));
  expect(found, JSON.stringify(pieces.map((p) => p.name))).toBeDefined();
  return found!;
}

for (const viewport of [
  { width: 853, height: 384 },
  { width: 1280, height: 800 },
]) {
  test(`shows where an event places its pieces at ${viewport.width}×${viewport.height}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'The sizes are set here');
    await page.setViewportSize(viewport);
    await page.goto('/?schematic');
    await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
    await page.getByRole('button', { name: 'Partida nueva' }).click();
    const file = zipSync({ 'quest.ini': strToU8(ini), 'Localization.Spanish.txt': strToU8(loc) });
    await page.locator('input[type=file]').setInputFiles({ name: 'colocar.valkyrie', mimeType: 'application/zip', buffer: Buffer.from(file) });
    await page.getByRole('button', { name: /Prueba de colocar/ }).click();
    await page.getByRole('button', { name: 'Iniciar' }).click();
    await page.locator('.hero-choice').first().click();
    await page.getByRole('button', { name: 'Terminado' }).click();
    if (await page.getByRole('heading', { name: 'Objetos' }).isVisible()) await page.getByRole('button', { name: 'Terminado' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();

    // The token the event places is in sight, beside its window and not under it
    const window = page.locator('.dialog-layer .event-window');
    await expect(window).toContainText('vitrina');
    const at = await token(page);
    const box = (await window.boundingBox())!;
    const under = at.x > box.x && at.x < box.x + box.width && at.y > box.y && at.y < box.y + box.height;
    expect(under, `token at ${at.x},${at.y}, window ${JSON.stringify(box)}`).toBe(false);
    expect(at.x).toBeGreaterThan(0);
    expect(at.x).toBeLessThan(viewport.width);
    expect(at.y).toBeGreaterThan(0);
    expect(at.y).toBeLessThan((await page.locator('.phase-bar .next-phase').boundingBox())!.y);
    await page.screenshot({ path: testInfo.outputPath('01-placed.png') });

    // Folded to a strip and back; Enter does not press a button it hides
    await page.getByRole('button', { name: 'Ver el mapa' }).click();
    await expect(page.locator('.event-window.folded')).toBeVisible();
    await page.waitForTimeout(450);
    await page.screenshot({ path: testInfo.outputPath('02-folding.png') });
    await expect(page.getByRole('button', { name: 'Continuar' })).toHaveCount(0);
    await page.keyboard.press('Enter');
    await expect(page.locator('.event-window.folded')).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('02-folded.png') });
    await page.getByRole('button', { name: 'Volver al texto' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();

    // Two choices side by side when they fit; three that do not, one under another, never mixed
    const buttons = page.locator('.dialog-layer .event-buttons');
    await expect(window).toContainText('Pandu');
    await expect(buttons).toHaveAttribute('data-layout', /^row/);
    const [a, b] = await Promise.all([0, 1].map(async (i) => (await buttons.locator('.event-button').nth(i).boundingBox())!));
    expect(Math.abs(a!.y - b!.y)).toBeLessThan(1);
    await page.screenshot({ path: testInfo.outputPath('03-choice.png') });
    await page.getByRole('button', { name: 'Dejarle hacer' }).click();
    await expect(window).toContainText('¿Qué haces?');
    const layout = await buttons.getAttribute('data-layout');
    const ys = await buttons.locator('.event-button').evaluateAll((all) => all.map((e) => Math.round(e.getBoundingClientRect().y)));
    if (layout === 'column') expect(new Set(ys).size).toBe(ys.length);
    else expect(new Set(ys).size).toBe(1);
    await page.screenshot({ path: testInfo.outputPath('04-three.png') });
    await page.getByRole('button', { name: 'Gritar' }).click();
    await expect(window).toHaveCount(0);

    // A menu is a list: its buttons one under another, however short (29 October 2026)
    await page.locator('.menu-button').click();
    await expect(buttons).toHaveAttribute('data-layout', 'column');
    await page.screenshot({ path: testInfo.outputPath('05-menu.png') });
  });
}
