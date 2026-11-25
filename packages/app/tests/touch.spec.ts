// A finger on a phone (Board.ts TOUCH_SLOP): Além do Beco turns the pages of its story with a small arrow, a quest UI
// element over a picture that takes the whole screen and is clickable too. A tap just beside the arrow, which a finger
// makes more often than not, presses it, as a browser presses the nearest button; one far from it does not.
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const scenario = join(root, 'referencias/descargas/MoM/escenarios/AlemDoBeco.valkyrie');

test.skip(!existsSync(scenario), 'Missing referencias/descargas: run node referencias/descargar-escenarios.mjs');
test.use({ locale: 'es-ES' });

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'A finger is a phone thing');
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
});

/** Taps this far below the middle of the element. */
async function tapBelow(page: Page, name: string, dy: number): Promise<void> {
  const box = (await page.locator(`[data-quest-ui=${name}]`).boundingBox())!;
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2 + dy);
}

test('a tap just beside a page arrow turns the page', async ({ page }) => {
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  // The scenario asks for Path of the Serpent
  await page.getByRole('button', { name: 'Mi Colección' }).click();
  await page.locator('.pack-type', { hasText: 'Caja de Expansión' }).click();
  await page.locator('.pack-row').filter({ has: page.locator('.pack-note', { hasText: /^\(PotS\b/ }) }).locator('.pack-choice').click();
  await page.getByRole('button', { name: 'Volver' }).click();
  await page.getByRole('button', { name: 'Volver' }).click();

  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await page.locator('input[type=file]').setInputFiles(scenario);
  await page.getByRole('button', { name: /beco/i }).first().click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  const heroes = page.locator('.hero-choice');
  for (let i = 0; i < 3; i++) await heroes.nth(i).click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  const arrow = page.locator('[data-quest-ui=UIHistoria1Proximo]');
  for (let i = 0; i < 20 && (await arrow.count()) === 0; i++) {
    const windows = page.locator('.dialog-layer .event-window');
    if ((await windows.count()) > 0) await windows.last().locator('.event-button:enabled').first().click();
    await page.waitForTimeout(300);
  }
  await expect(arrow).toBeVisible();

  // Far from it, the finger presses the picture behind, which does nothing
  await tapBelow(page, 'UIHistoria1Proximo', 80);
  await page.waitForTimeout(500);
  await expect(arrow).toBeVisible();

  // Just beside it, the arrow
  await tapBelow(page, 'UIHistoria1Proximo', 16);
  await expect(page.locator('[data-quest-ui=UIHistoria2Proximo]')).toBeVisible();
  await expect(arrow).toHaveCount(0);
  await tapBelow(page, 'UIHistoria2Proximo', 14);
  await expect(page.locator('[data-quest-ui=UIHistoria3Proximo]')).toBeVisible();
});
