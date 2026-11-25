// The board drawn again when the browser takes its WebGL context away (15 November 2026, board/contextLoss.ts): iPadOS
// does it when a page runs short of memory, and the map went black for good. A few losses a minute make a new board each;
// more, and the player is told to open the app again. Its own scenario, so it needs no download.
import { expect, test, type Page } from '@playwright/test';
import { strToU8, zipSync } from 'fflate';

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
event1=

[TileA]
side=TileSideAlley1
xposition=0
yposition=0
`;
const loc = `.,Spanish
quest.name,Prueba del tablero
quest.description,Prueba
EventStart.text,Empieza.
EventStart.button1,Continuar
`;
test.use({ locale: 'es-ES' });
test.beforeEach(async ({ page }) => {
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
});

/** Makes the browser take the board's context away, as iPadOS does when memory runs short. */
async function loseContext(page: Page): Promise<void> {
  // As text: the root's tsconfig has no DOM types
  await page.evaluate(`(() => {
    const canvas = document.querySelector('.board-canvas canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    gl.getExtension('WEBGL_lose_context').loseContext();
  })()`);
}

test('draws the board again when the browser takes its context away', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The same board on a phone');
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  const file = zipSync({ 'quest.ini': strToU8(ini), 'Localization.Spanish.txt': strToU8(loc) });
  await page.locator('input[type=file]').setInputFiles({ name: 'tablero.valkyrie', mimeType: 'application/zip', buffer: Buffer.from(file) });
  await page.getByRole('button', { name: /Prueba del tablero/ }).click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await page.locator('.hero-choice').first().click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  if (await page.getByRole('heading', { name: 'Objetos' }).isVisible()) await page.getByRole('button', { name: 'Terminado' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect.poll(() => page.evaluate<number>('window.universalisBoard?.drawn().length ?? 0')).toBeGreaterThan(0);

  const canvases = page.locator('.board-canvas canvas');
  for (let i = 0; i < 3; i++) {
    await page.evaluate(`document.querySelector('.board-canvas canvas').dataset.old = 'yes'`);
    await loseContext(page);
    // A new canvas, with the tile on it
    await expect.poll(() => page.evaluate<boolean>(`document.querySelector('canvas[data-old]') === null`)).toBe(true);
    await expect(canvases).toHaveCount(1);
    await expect.poll(() => page.evaluate<number>('window.universalisBoard?.drawn().length ?? 0')).toBeGreaterThan(0);
    expect(await page.evaluate<boolean>(`(() => {
      const canvas = document.querySelector('.board-canvas canvas');
      return (canvas.getContext('webgl2') ?? canvas.getContext('webgl')).isContextLost();
    })()`)).toBe(false);
  }
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('01-drawn-again.png') });

  // The fourth within a minute: the player is told
  await loseContext(page);
  await expect(page.getByRole('alert')).toContainText('sin memoria');
});
