// The main menu's entry of the scenario editor, past the warning it shows while the editor is open to try
// (packages/app/editorPreview.ts; editor-preview.spec.ts tests the warning itself).
import type { Page } from '@playwright/test';
import { EDITOR_PREVIEW } from '../../editorPreview.ts';

/** Presses the menu's entry of the editor (Mansions' 'Editar Escenario', Descent's 'Editar Aventura') and goes in. */
export async function pressEditor(page: Page, entry = 'Editar Escenario'): Promise<void> {
  await page.getByRole('button', { name: entry }).click();
  if (EDITOR_PREVIEW) await page.getByRole('alertdialog').getByRole('button', { name: 'Entendido, entrar' }).click();
}
