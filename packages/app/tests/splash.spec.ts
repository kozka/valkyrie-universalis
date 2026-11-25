// The app's start (ui/Splash.tsx): the logo over black, then the welcome in the player's language, until the player
// hides it. The other tests' browsers have hidden it already (playwright.config.ts); this one starts fresh.
import { expect, test } from '@playwright/test';

test.use({ locale: 'es-ES', storageState: { cookies: [], origins: [] } });

test('shows the logo, then the welcome until it is hidden', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?schematic');
  await expect(page.locator('.splash img')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('01-splash.png') });

  const welcome = page.getByRole('dialog', { name: 'Bienvenido a Valkyrie Universalis' });
  await expect(welcome).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.splash')).toHaveCount(0);
  await expect(welcome.getByText('Es una versión temprana.', { exact: false })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('02-welcome.png') });

  // Closed without hiding it, it comes back next time
  await welcome.getByRole('button', { name: 'Empezar' }).click();
  await expect(welcome).toHaveCount(0);
  await page.reload();
  await expect(welcome).toBeVisible({ timeout: 15_000 });

  // Hidden, it does not
  await welcome.getByRole('checkbox', { name: 'No volver a mostrar' }).check();
  await welcome.getByRole('button', { name: 'Empezar' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Valkyrie Universalis' })).toBeVisible();
  await expect(page.locator('.splash')).toHaveCount(0, { timeout: 15_000 });
  await expect(welcome).toHaveCount(0);
  expect(errors).toEqual([]);
});
