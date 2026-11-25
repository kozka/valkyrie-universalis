// Bugs and ideas (ui/Feedback.tsx): the window from the game selection, sent to kozka's Google Form, which this test
// answers itself so that nothing reaches the sheet.
import { expect, test } from '@playwright/test';

test.use({ locale: 'es-ES' });

test('sends a bug report with the technical details', async ({ page }, testInfo) => {
  const posted: string[] = [];
  await page.route('https://docs.google.com/forms/**', async (route) => {
    posted.push(route.request().postData() ?? '');
    await route.fulfill({ status: 200, body: '' });
  });
  await page.goto('/?schematic');
  await page.getByRole('button', { name: 'Reportar un problema de la app' }).click();
  const window = page.getByRole('dialog', { name: 'Reportar un problema o proponer una idea' });
  await expect(window).toBeVisible();

  // Nothing written, nothing sent
  await window.getByRole('button', { name: 'Enviar' }).click();
  await expect(window.getByRole('alert')).toHaveText('Escribe un comentario antes de enviar.');

  await window.getByRole('radio', { name: 'Idea' }).check();
  await window.getByRole('textbox', { name: 'Tu comentario' }).fill('Un modo oscuro para el tablero');
  await window.getByRole('textbox', { name: /Tu correo/ }).fill('jugador@example.com');
  await page.screenshot({ path: testInfo.outputPath('feedback.png') });
  await window.getByRole('button', { name: 'Enviar' }).click();
  await expect(window.getByRole('status')).toHaveText('¡Gracias! Tu comentario se ha enviado.');

  expect(posted).toHaveLength(1);
  const form = new URLSearchParams(posted[0]);
  expect(form.get('entry.1554930256')).toBe('idea');
  expect(form.get('entry.1922982981')).toBe('Un modo oscuro para el tablero');
  expect(form.get('entry.624337130')).toBe('jugador@example.com');
  expect(form.get('entry.1001353303')).toContain('Versión: ');
  expect(form.get('entry.1001353303')).toContain('Pantalla de la app: game-selection');

  await window.getByRole('button', { name: 'Cerrar' }).click();
  await expect(window).toHaveCount(0);
});
