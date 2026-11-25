// Each game's help (ui/RulesHelp.tsx): opened from its main menu, with what a player does on a turn and the rules'
// summary in folding sections; Mansions' and Descent's here (DooM's needs its pack).
import { expect, test } from '@playwright/test';

test.use({ locale: 'es-ES' });

test.beforeEach(async ({ page }) => {
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
});

test("shows each game's help from its menu", async ({ page }) => {
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Ayuda y reglas' }).click();
  const help = page.getByRole('dialog', { name: 'Ayuda y reglas' });
  await expect(help.getByRole('tab', { name: 'Acciones del investigador' })).toHaveAttribute('aria-selected', 'true');
  await expect(help.getByText('Hasta 2 espacios, de uno en uno.', { exact: false })).toBeVisible();

  await help.getByRole('tab', { name: 'Resumen de reglas' }).click();
  await help.locator('summary', { hasText: 'Tiradas' }).click();
  await expect(help.getByText('convierte 1 lupa en Éxito', { exact: false })).toBeVisible();

  await help.getByRole('button', { name: 'Cerrar' }).click();
  await expect(help).toHaveCount(0);

  // Descent's menu has its own help, a hero's turn and Road to Legend's rules
  await page.getByRole('button', { name: 'Seleccionar tipo de juego' }).click();
  await page.getByRole('button', { name: /Descent/ }).first().click();
  await page.getByRole('button', { name: 'Ayuda y reglas' }).click();
  const descent = page.getByRole('dialog', { name: 'Ayuda y reglas' });
  // The window remembers the tab last shown, Mansions' rules here
  await descent.getByRole('tab', { name: 'Acciones del héroe' }).click();
  await expect(descent.getByText('pulsa «Fin del Turno» en tu retrato', { exact: false })).toBeVisible();
  await descent.getByRole('tab', { name: 'Resumen de reglas' }).click();
  await descent.locator('summary', { hasText: 'Pruebas de atributo' }).click();
  await expect(descent.getByText('1 dado gris y 1 negro', { exact: false })).toBeVisible();
});
