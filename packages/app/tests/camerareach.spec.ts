// The board cannot be lost from view (16 November 2026, keepBoardInReach in board/camera.ts): a player on an iPad whose
// map had gone black dragged blindly and saved with the camera sixty units from every tile, and the map stayed black.
// A camera put that far comes back to the board, and dragging stops near it. Its own scenario, so it needs no download.
import { expect, test, type Page } from '@playwright/test';
import { strToU8, zipSync } from 'fflate';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const engineUrl = `/@fs/${join(root, 'packages/engine/src/index.ts').replaceAll('\\', '/').replace(/^\//, '')}`;

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

/** Whether the tile's middle (its corner is at 0, 0) is on the screen. */
async function tileInView(page: Page): Promise<boolean> {
  return page.evaluate<boolean>(`(() => {
    const at = window.universalisBoard.pointOnPage(3.5, -1.75);
    return at.x > 0 && at.y > 0 && at.x < innerWidth && at.y < innerHeight;
  })()`);
}

test('brings the board back into view, and does not let a drag lose it', async ({ page }, testInfo) => {
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
  await expect.poll(() => tileInView(page)).toBe(true);

  // The camera where the player's save had it, sixty units below the board
  await page.evaluate(async (url) => {
    const engine = (await import(url)) as typeof import('@universalis/engine');
    const cc = engine.Game.get().cc;
    cc.targetSet = false;
    cc.position = new engine.Vector3(-36.96879, -70.18026, -23.93919);
  }, engineUrl);
  await expect.poll(() => tileInView(page)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('01-back.png') });

  // Dragging far away, over and over: the tile stays on the screen
  const box = (await page.locator('.board-stage').boundingBox())!;
  for (let i = 0; i < 4; i++) {
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.8, { steps: 8 });
    await page.mouse.up();
  }
  expect(await tileInView(page)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('02-dragged.png') });
});
