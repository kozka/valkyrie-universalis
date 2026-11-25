// Mansions' investigator selection in the Universalis theme (themes/universalis/HeroRoom.tsx): kozka's room, eight
// investigators a page turned with the arrows, black-and-white figures past the last one, the circles lit for as many
// as the scenario asks for, and each one chosen in its circle with its name; the classic theme keeps the classic list,
// and so does a screen held upright. Needs the downloaded scenarios (node referencias/descargar-escenarios.mjs).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { pick } from './fixtures/options.ts';

const scenario = join(import.meta.dirname, '../../../referencias/descargas/MoM/escenarios/ExoticMaterial.valkyrie');

test.use({ locale: 'es-ES' });
test.skip(!existsSync(scenario), 'Missing referencias/descargas: run node referencias/descargar-escenarios.mjs');

/** From Mansions' menu to Exotic Material's investigators, with one more box of the collection chosen. */
async function toInvestigators(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Mi Colección' }).click();
  await page.locator('.pack-type').first().click();
  await page.locator('.pack-row:not(.chosen) .pack-choice').first().click();
  await page.getByRole('button', { name: 'Volver' }).click();
  await page.getByRole('button', { name: 'Volver' }).click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await page.locator('input[type=file]').setInputFiles(scenario);
  await page.getByRole('button', { name: /Material exótico/ }).click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
}

test("chooses the investigators in kozka's room, a page at a time", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'A wide screen: held upright, the classic list (below)');
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await toInvestigators(page);

  const room = page.locator('.hero-room');
  await expect(room).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Selección de Investigadores' })).toBeVisible();
  // The study lives behind the frames (heroRoomArt.ts)
  await expect(page.locator('.hero-room-art[data-art=drawn]')).toHaveCount(1);
  const previous = page.getByRole('button', { name: 'Página anterior' });
  const next = page.getByRole('button', { name: 'Página siguiente' });
  await expect(page.locator('.hero-choice')).toHaveCount(8);
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();

  // As many circles lit as the scenario asks for, softly the rest up to its most
  const required = await page.locator('.hero-room-circle[data-kind=required]').count();
  expect(required).toBeGreaterThan(0);
  await expect(room).not.toHaveAttribute('data-ready');
  await page.locator('.hero-choice').nth(0).click();
  await page.locator('.hero-choice').nth(1).click();
  await expect(page.locator('.hero-room-chosen')).toHaveCount(2);
  await expect(page.locator('.hero-choice[aria-pressed=true]')).toHaveCount(2);
  // Each flies into its circle, and stays grey in its oval
  await expect(page.locator('.hero-room-chosen[data-arriving]')).toHaveCount(0);
  await expect(page.locator('.hero-room-chosen').first()).toHaveAttribute('aria-label', await page.locator('.hero-choice .hero-room-name').nth(0).innerText());
  if (required <= 2) await expect(room).toHaveAttribute('data-ready');
  // A chosen one let go from its circle (it floats for ever, so it is never still for Playwright)
  await page.locator('.hero-room-chosen').nth(1).click({ force: true });
  await expect(page.locator('.hero-room-chosen')).toHaveCount(1);
  await page.locator('.hero-choice').nth(1).click();
  await testInfo.attach('room', { body: await page.screenshot(), contentType: 'image/png' });

  // A dot for each page, the page shown lit; the last page: the figures past the last investigator, in black and white
  const dots = page.locator('.hero-room-dot');
  expect(await dots.count()).toBeGreaterThan(1);
  await expect(dots.first()).toHaveAttribute('aria-current', 'page');
  // A finger dragged to the left over a portrait turns the page, and chooses no one
  const swipeOver = (await page.locator('.hero-choice').nth(4).elementHandle())!;
  const box = (await swipeOver.boundingBox())!;
  const touch = { pointerType: 'touch', pointerId: 7, isPrimary: true, clientY: box.y + box.height / 2 };
  const pressed = await page.locator('.hero-choice[aria-pressed=true]').count();
  await swipeOver.dispatchEvent('pointerdown', { ...touch, clientX: box.x + box.width * 0.9 });
  await swipeOver.dispatchEvent('pointerup', { ...touch, clientX: box.x - box.width * 0.6 });
  await swipeOver.dispatchEvent('click');
  await expect(dots.nth(1)).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.hero-room-chosen')).toHaveCount(pressed);
  while (await next.isEnabled()) await next.click();
  await expect(dots.last()).toHaveAttribute('aria-current', 'page');
  await expect(next).toBeDisabled();
  await expect(previous).toBeEnabled();
  expect(await page.locator('.hero-room-empty').count()).toBeGreaterThan(0);
  expect((await page.locator('.hero-choice').count()) + (await page.locator('.hero-room-empty').count())).toBe(8);

  await page.getByRole('button', { name: 'Terminado' }).click();
  await expect(page.getByRole('heading', { name: 'Objetos' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('keeps the classic list in the classic theme', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The phone holds it upright, with the classic list anyway');
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Opciones' }).click();
  await pick(page.getByRole('combobox', { name: 'Tema' }), 'Clásico');
  await page.getByRole('button', { name: 'Volver' }).click();
  await toInvestigators(page);
  await expect(page.locator('.hero-count')).toBeVisible();
  await expect(page.locator('.hero-room')).toHaveCount(0);
});
