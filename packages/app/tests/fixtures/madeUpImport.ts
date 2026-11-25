// Made-up imports of the official content for the Playwright tests: zips of files laid out as Valkyrie's import folder,
// with pictures of one colour in the formats Valkyrie's importer writes, and nothing from the official apps.
import { expect, type Page } from '@playwright/test';
import { strToU8, zipSync } from 'fflate';

/** A DXT1 DDS of one colour, rows from the bottom, as Valkyrie's importer writes them. */
export function dds(size: number): Uint8Array {
  const blocks = (size / 4) ** 2;
  const bytes = new Uint8Array(128 + blocks * 8);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x20534444, true);
  view.setUint32(4, 124, true);
  view.setUint32(12, size, true);
  view.setUint32(16, size, true);
  bytes.set(strToU8('DXT1'), 84);
  for (let i = 0; i < blocks; i++) {
    view.setUint16(128 + i * 8, 0xc904, true);
    view.setUint16(130 + i * 8, 0xc904, true);
  }
  return bytes;
}

/** A PVR file of one colour in ETC2 RGB, as Valkyrie's importer writes them on Android. */
export function pvr(size: number): Uint8Array {
  const blocks = (size / 4) ** 2;
  const bytes = new Uint8Array(52 + blocks * 8);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x03525650, true);
  view.setUint32(8, 22, true);
  view.setUint32(24, size, true);
  view.setUint32(28, size, true);
  // Individual mode, the same colour in both halves
  for (let i = 0; i < blocks; i++) bytes.set([0xcc, 0x88, 0x33], 52 + i * 8);
  return bytes;
}

export function zip(files: Record<string, string | Uint8Array>): Buffer {
  return Buffer.from(zipSync(Object.fromEntries(Object.entries(files).map(([name, content]) => [name, typeof content === 'string' ? strToU8(content) : content]))));
}

/** Imports a zip for one game from the game selection ('mom' or 'd2e', its section), and comes back to it. */
export async function importZip(page: Page, game: 'mom' | 'd2e', name: string, content: Buffer): Promise<void> {
  await page.locator(`[data-section=${game}]`).getByRole('button', { name: /Importar datos|Reimportar datos/ }).click();
  await page.locator('input[accept*=zip]').setInputFiles({ name, mimeType: 'application/zip', buffer: content });
  await expect(page.getByText('Importación completada con éxito.')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
}
