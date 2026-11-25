// While the scenario editor is open to try in the published app (packages/app/editorPreview.ts): the warning on
// entering it, in large capitals, with the way in on a computer, and on a phone why it does not open and no way in; and
// the warning within its frame on small screens with the largest text and the television mode (layoutFaults). In the
// tests' schematic mode (?schematic).
import { expect, test, type Page } from '@playwright/test';
import { EDITOR_PREVIEW } from '../editorPreview.ts';
import { layoutFaults } from './fixtures/layoutFaults.ts';

test.use({ locale: 'es-ES' });
test.skip(!EDITOR_PREVIEW, 'The editor is in development builds only, with no warning');

test.beforeEach(async ({ page }) => {
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
});

/** Mansions' menu, with the text size and the television mode given. */
async function mansionsMenu(page: Page, size = 'normal', tv = false): Promise<void> {
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  // The start's logo fades out over the screen for a few seconds (ui/Splash.tsx)
  await expect(page.locator('.splash')).toHaveCount(0);
  await page.evaluate(`import('/src/ui/preferences.ts').then((p) => { p.setTextSize('${size}'); p.setSwitch('tvMode', ${tv}); })`);
}

test('warns in large capitals that the editor is not ready, and opens it on a computer only', async ({ page, isMobile }, testInfo) => {
  await mansionsMenu(page);
  await page.getByRole('button', { name: 'Editar Escenario' }).click();
  const warning = page.getByRole('alertdialog', { name: 'El editor no está listo' });
  await expect(warning).toContainText('Estamos en fase muy temprana: úsalo solo para probarlo, no como herramienta final');
  const title = warning.getByRole('heading', { name: 'El editor no está listo' });
  await expect(title).toHaveCSS('text-transform', 'uppercase');
  expect(await page.evaluate<number>("parseFloat(getComputedStyle(document.querySelector('.editor-warning h2')).fontSize)")).toBeGreaterThanOrEqual(28);
  await page.waitForTimeout(300);
  expect(await layoutFaults(page)).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('warning.png') });

  if (isMobile) {
    // A phone or a tablet: why, and only the way back
    await expect(warning).toContainText('Por ahora solo se abre en un ordenador');
    await expect(warning.getByRole('button', { name: 'Entendido, entrar' })).toHaveCount(0);
    await expect(warning.getByRole('button', { name: 'Volver' })).toBeFocused();
    await warning.getByRole('button', { name: 'Volver' }).click();
    await expect(warning).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Editar Escenario' })).toHaveCount(0);
    return;
  }
  await expect(warning).not.toContainText('ordenador');
  await expect(warning.getByRole('button', { name: 'Entendido, entrar' })).toBeFocused();
  // Escape and Back leave it, and the menu stays
  await page.keyboard.press('Escape');
  await expect(warning).toHaveCount(0);
  await page.getByRole('button', { name: 'Editar Escenario' }).click();
  await warning.getByRole('button', { name: 'Volver' }).click();
  await expect(warning).toHaveCount(0);
  await page.getByRole('button', { name: 'Editar Escenario' }).click();
  await warning.getByRole('button', { name: 'Entendido, entrar' }).click();
  await expect(page.getByRole('heading', { name: 'Editar Escenario' })).toBeVisible();
  // And the editor says it too
  await expect(page.getByText('Fase muy temprana: el editor aún no está listo.')).toBeVisible();
});

const SCREENS = [
  { name: 'a phone held sideways in the television mode', viewport: { width: 853, height: 384 }, tv: true },
  { name: 'a small phone held sideways', viewport: { width: 568, height: 320 }, tv: false },
  { name: 'a phone held upright', viewport: { width: 412, height: 915 }, tv: false },
  { name: 'a small laptop in the television mode', viewport: { width: 1280, height: 720 }, tv: true },
];

for (const { name, viewport, tv } of SCREENS) {
  test(`lays the warning out on ${name}, with the largest text`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'The sizes are set here');
    await page.setViewportSize(viewport);
    await mansionsMenu(page, 'larger', tv);
    await page.getByRole('button', { name: 'Editar Escenario' }).click();
    // Its title in sight first, even where the rest needs scrolling
    await expect(page.getByRole('alertdialog').getByRole('heading')).toBeInViewport();
    await page.waitForTimeout(300);
    expect(await layoutFaults(page)).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath('warning.png') });
  });
}
