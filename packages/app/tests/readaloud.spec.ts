// The speaker of a scenario's own texts on the screen (board/QuestUILayer.tsx UISpeaker), like the event windows':
// O Culto das Estrelas opens with a long text over its intro picture. The speaker reads it without pressing what is
// under it. Needs the downloaded scenarios (node referencias/descargar-escenarios.mjs).
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const scenario = join(root, 'referencias/descargas/MoM/escenarios/CultoDasEstrelas.valkyrie');

test.use({ locale: 'es-ES' });
test.skip(!existsSync(scenario), 'Missing referencias/descargas: run node referencias/descargar-escenarios.mjs');

test("reads aloud a scenario's text on the screen", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
  // What the page asks the browser to say, without a voice in the test's browser
  await page.addInitScript(() => {
    const said: string[] = [];
    const page = globalThis as unknown as { said: string[]; speechSynthesis: { speak(u: { text: string }): void } };
    page.said = said;
    page.speechSynthesis.speak = (u) => {
      said.push(u.text);
    };
  });
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await page.locator('input[type=file]').setInputFiles(scenario);
  await page.locator('.quest').first().click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  const heroes = page.locator('.hero-choice');
  await heroes.nth(0).click();
  await heroes.nth(1).click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  await page.getByRole('button', { name: 'Terminado' }).click();

  const text = page.locator('[data-quest-ui="UITexto"]');
  await expect(text).toBeVisible();
  const speaker = page.locator('[data-quest-ui-speaker="UITexto"] .read-aloud');
  await expect(speaker).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('01-speaker.png') });
  await speaker.click();
  await expect.poll(() => page.evaluate(() => (globalThis as unknown as { said: string[] }).said.join(' '))).not.toBe('');
  // The press stays on the speaker: the intro is still there
  await expect(text).toBeVisible();
  expect(errors).toEqual([]);
});
