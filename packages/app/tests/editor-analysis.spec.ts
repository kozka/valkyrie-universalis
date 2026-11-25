// The editor's analysis in a real browser: the skill's example scenario, La casa del relojero, imported and analysed;
// its figures for each number of investigators, its curve of new things round by round and its advice, whose
// components are selected with a press. Development builds only, without official content (?schematic).
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { zipSync } from 'fflate';
import { pressEditor } from './fixtures/editor.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const example = join(root, 'herramientas/mansiones-valkyrie/assets/ejemplo/LaCasaDelRelojero');

test.use({ locale: 'es-ES' });

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'phone', 'The editor is for computers and large tablets');
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
});

test('analyses a scenario: how long it lasts, where the actions go and advice', async ({ page }) => {
  const files = Object.fromEntries(readdirSync(example).map((f) => [f, new Uint8Array(readFileSync(join(example, f)))]));
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await pressEditor(page);
  await page.locator('input[type=file][accept=".valkyrie,.zip"]').setInputFiles({ name: 'LaCasaDelRelojero.valkyrie', mimeType: 'application/zip', buffer: Buffer.from(zipSync(files)) });
  await page.getByRole('button', { name: /relojero/i }).first().click();
  await page.getByRole('tab', { name: 'Análisis' }).click();
  await page.getByRole('button', { name: 'Analizar' }).click();
  const table = page.locator('.editor-analysis-table:not(.editor-analysis-pace)');
  await expect(table).toBeVisible({ timeout: 60_000 });
  // One row for each number of investigators it allows (1 to 5)
  await expect(table.locator('tbody tr')).toHaveCount(5);
  await expect(page.locator('.editor-analysis-curve rect').first()).toBeVisible();
  // The pacing sheet: a row for each round most games reach, its first finding the hall and its tokens
  const pace = page.locator('.editor-analysis-pace');
  await expect(pace.locator('tbody tr').first()).toBeVisible();
  await expect(pace.locator('thead')).toContainText('Lugares');
  // Choosing another number of investigators shows its sheet
  await table.locator('tbody tr').first().click();
  await expect(page.getByRole('heading', { name: 'Hoja de ritmo, 1 investigadores' })).toBeVisible();
  // A token the advice names is selected with a press
  const named = page.locator('.editor-analysis-components .editor-link').first();
  const name = (await named.textContent())!;
  await named.click();
  await expect(page.locator('.editor-props-head')).toContainText(name);
});
