// Sound where the browser cannot read Ogg Vorbis, as Safari before 26 on iPad and iPhone (audio/webAudio.ts): the
// options' test sound, an .ogg as all of the import's, is decoded with WebAssembly (audio/oggDecoder.ts) and played.
// The test makes Chromium say it cannot read Ogg and serves the test sound from a small fixture; other browsers never
// download the decoder.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

const beep = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'beep.ogg'));

test.use({ locale: 'es-ES' });

/** What the bug reports say about the sound (audio/webAudio.ts audioState). */
function audioState(page: Page): Promise<string> {
  return page.evaluate<string>(`import('/src/audio/webAudio.ts').then((audio) => audio.audioState())`);
}

test('plays an Ogg sound on a browser that cannot read Ogg', async ({ page }) => {
  await page.addInitScript(`{
    const canPlayType = HTMLMediaElement.prototype.canPlayType;
    HTMLMediaElement.prototype.canPlayType = function (type) {
      return type.includes('ogg') ? '' : canPlayType.call(this, type);
    };
    window.played = [];
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...args) {
      window.played.push(this.buffer ? this.buffer.duration : 0);
      start.apply(this, args);
    };
  }`);
  await page.route('https://raw.githubusercontent.com/**', (route) =>
    route.request().url().endsWith('/Resources/test.ogg') ? route.fulfill({ body: beep, contentType: 'audio/ogg' }) : route.abort(),
  );
  const decoder = page.waitForRequest((request) => /\/oggDecoder\.ts|\/oggDecoder-/.test(request.url()));
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Opciones' }).click();
  await page.getByRole('slider', { name: /Efectos/ }).click();
  await decoder;
  // Among the menu's own sounds (the buttons' click, the wind), the test sound, half a second long, played once
  await expect.poll(() => page.evaluate<number[]>('window.played.filter((seconds) => seconds > 0.3 && seconds < 1)')).toEqual([expect.closeTo(0.5, 1)]);
  // The bug reports say how the sound stands
  const state = await audioState(page);
  expect(state).toMatch(/^Ogg no \(decodificador\), audio running$/);
});

test('does not load the Ogg decoder where the browser reads Ogg', async ({ page }) => {
  const requested: string[] = [];
  page.on('request', (request) => requested.push(request.url()));
  await page.route('https://raw.githubusercontent.com/**', (route) =>
    route.request().url().endsWith('/Resources/test.ogg') ? route.fulfill({ body: beep, contentType: 'audio/ogg' }) : route.abort(),
  );
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Opciones' }).click();
  const sound = page.waitForRequest((request) => request.url().endsWith('/Resources/test.ogg'));
  await page.getByRole('slider', { name: /Efectos/ }).click();
  await sound;
  const state = await audioState(page);
  expect(state).toMatch(/^Ogg sí, audio /);
  expect(requested.filter((url) => url.includes('oggDecoder'))).toEqual([]);
});
