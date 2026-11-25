// Descent's hero selection in the Universalis theme (themes/universalis/DescentHeroRoom.tsx): kozka's dwarven hall,
// alive behind his frames; as many circles on the plate as the quest takes heroes, lit for as many as it asks for; each
// hero chosen in its circle, grey in its ring, let go from its circle; and Finished on to the classes. Plays the skill's
// example campaign (herramientas/descent-valkyrie/assets/ejemplo), packaged here, in the tests' schematic mode.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { zipSync } from 'fflate';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const CAMPAIGN = join(root, 'herramientas/descent-valkyrie/assets/ejemplo/LaCampanaDeVadoscuro');

test.use({ locale: 'es-ES' });

/** A scenario folder as a .valkyrie package: its files at the top of a zip. */
function packageOf(folder: string): Buffer {
  const entries: Record<string, Uint8Array> = {};
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else entries[relative(folder, path).replaceAll('\\', '/')] = new Uint8Array(readFileSync(path));
    }
  };
  walk(folder);
  return Buffer.from(zipSync(entries));
}

test("chooses the heroes in kozka's dwarven hall", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'A wide screen: held upright, the classic list');
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Descent/ }).first().click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await page.locator('input[type=file]').setInputFiles({ name: 'LaCampanaDeVadoscuro.valkyrie', mimeType: 'application/zip', buffer: packageOf(CAMPAIGN) });
  const quest = page.locator('.quest').first();
  // The list wears Descent's frames (themes/universalis/scenarios.css)
  await expect(page.locator('html')).toHaveAttribute('data-look', 'D2E');
  await expect(quest).toHaveCSS('border-image-source', /d2e-scenario-card/);
  await quest.click();
  if ((await page.getByRole('button', { name: 'Iniciar' }).count()) === 0) await quest.click();
  await page.getByRole('button', { name: 'Iniciar' }).click();

  const room = page.locator('.frame-room');
  await expect(room).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Selección de Héroes' })).toBeVisible();
  await expect(page.locator('.frame-room-art[data-art=drawn]')).toHaveCount(1);
  // Descent's hero column waits under the hall
  const canvasShows = await page.evaluate<boolean>(`(() => {
    const canvas = document.querySelector('.hero-canvas');
    const box = canvas.getBoundingClientRect();
    return canvas.contains(document.elementFromPoint(box.x + box.width / 2, box.y + Math.min(box.height / 2, 40)));
  })()`);
  expect(canvasShows).toBe(false);
  await expect(page.locator('.hero-choice')).toHaveCount(8);

  // A circle for each hero the quest takes, lit for as many as it asks for
  const circles = page.locator('.frame-room-circle');
  const required = await page.locator('.frame-room-circle[data-kind=required]').count();
  expect(required).toBeGreaterThan(0);
  expect(await circles.count()).toBeGreaterThanOrEqual(required);
  await expect(page.locator('.frame-room-diamond')).toHaveCount((await circles.count()) - 1);
  await expect(room).not.toHaveAttribute('data-ready');

  for (const i of [0, 1, 2, 3].slice(0, required)) await page.locator('.hero-choice').nth(i).click();
  await expect(page.locator('.frame-room-chosen')).toHaveCount(required);
  await expect(page.locator('.frame-room-chosen[data-arriving]')).toHaveCount(0);
  await expect(page.locator('.hero-choice[aria-pressed=true]')).toHaveCount(required);
  await expect(page.locator('.frame-room-chosen').first()).toHaveAttribute('aria-label', await page.locator('.hero-choice .frame-room-name').nth(0).innerText());
  await expect(room).toHaveAttribute('data-ready');
  await testInfo.attach('hall', { body: await page.screenshot(), contentType: 'image/png' });

  // Let go from its circle, then chosen again
  await page.locator('.frame-room-chosen').first().click({ force: true });
  await expect(page.locator('.frame-room-chosen')).toHaveCount(required - 1);
  await page.locator('.hero-choice').nth(0).click();
  await expect(page.locator('.frame-room-chosen')).toHaveCount(required);

  await page.getByRole('button', { name: 'Terminado' }).click();
  await expect(page.locator('.class-hero')).toHaveCount(required);
  // Finished burns once every hero has a class (themes/universalis/descentScreens.css)
  const classes = page.locator('.class-selection');
  await expect(classes).not.toHaveAttribute('data-ready');
  for (let i = 0; i < required; i++) await page.locator('.class-hero').nth(i).locator('.class-choice:not(:disabled)').first().click();
  await expect(classes).toHaveAttribute('data-ready');
  expect(errors).toEqual([]);
});

// DooM's own button needs its pack (referencias/descargas, as descent.spec.ts plays it): here Descent is turned into
// DooM in the page (screens/doom.ts playDoom), which the hero selection reads at its next drawing
test("chooses the marines on DooM's bridge", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'A wide screen: held upright, the classic list');
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Descent/ }).first().click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await page.locator('input[type=file]').setInputFiles({ name: 'LaCampanaDeVadoscuro.valkyrie', mimeType: 'application/zip', buffer: packageOf(CAMPAIGN) });
  const quest = page.locator('.quest').first();
  await quest.click();
  if ((await page.getByRole('button', { name: 'Iniciar' }).count()) === 0) await quest.click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await expect(page.locator('.frame-room[data-look=d2e]')).toBeVisible();
  await page.evaluate(`import('/src/screens/doom.ts').then((doom) => doom.playDoom(true))`);
  await page.locator('.hero-choice').nth(0).click();

  const room = page.locator('.frame-room[data-look=doom]');
  await expect(room).toBeVisible();
  // DooM's own look for the page (App.tsx PageGame): its steel frames on the scenario screens and the class selection
  await expect(page.locator('html')).toHaveAttribute('data-look', 'DooM');
  // The bridge lives: its monitors drawn on the room, its lights, the city through the window
  await expect(page.locator('.frame-room-art[data-art=drawn]')).toHaveCount(1);
  await expect(page.locator('.frame-room-chosen')).toHaveCount(1);
  await expect(page.locator('.frame-room-ring-glow')).toHaveCount(8);
  await page.locator('.hero-choice').nth(1).click();
  await expect(page.locator('.frame-room-chosen')).toHaveCount(2);
  await testInfo.attach('bridge', { body: await page.screenshot(), contentType: 'image/png' });
  expect(errors).toEqual([]);
});
