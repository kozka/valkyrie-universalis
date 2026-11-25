// The menus' own sound (audio/menuAmbience.ts): an ambience, the game's music a while after it, and its credits.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const scenario = join(import.meta.dirname, '../../../referencias/descargas/MoM/escenarios/ExoticMaterial.valkyrie');

/** The game whose menu sound plays (audio/menuAmbience.ts menuSoundOf). */
function soundOf(page: Page): Promise<string | null> {
  return page.evaluate<string | null>(`import('/src/audio/menuAmbience.ts').then((sound) => sound.menuSoundOf())`);
}

test.use({ locale: 'es-ES' });

test("Descent's menu has a wind, stones now and then and, a few seconds later, its music, with its author named", async ({ page }) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // What the page plays: its music goes through a media element
  await page.addInitScript(`{
    window.musicStarted = 0;
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      window.musicStarted++;
      return play.call(this);
    };
  }`);
  await page.goto('/?schematic');
  const stones = page.waitForRequest(/cave-[^/]*\.mp3/);
  const wind = page.waitForRequest(/wind-\d[^/]*\.mp3/);
  await page.getByRole('button', { name: /Descent/ }).click();
  await wind;
  // The music does not come with the ambience, but after it
  await page.waitForTimeout(2000);
  expect(await page.evaluate<number>('window.musicStarted')).toBe(0);
  await expect.poll(() => page.evaluate<number>('window.musicStarted'), { timeout: 20_000 }).toBe(1);
  await stones;
  // Its authors: one named without a link, as he has no channel, the other with his
  const credits = page.getByRole('complementary', { name: 'Créditos de la música' });
  await expect(credits).toContainText('Música: Sam McGrath');
  await expect(credits).toContainText('Música: Alexander Nakarada');
  await expect(credits.getByRole('link')).toHaveCount(1);
  await expect(credits.getByRole('link', { name: 'Alexander Nakarada en YouTube' })).toHaveAttribute('href', 'https://www.youtube.com/@anakarada');
  // Back at the game selection, the credits go with the sound
  await page.getByRole('button', { name: 'Seleccionar tipo de juego' }).click();
  await expect(credits).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("Mansions' menu has a storm far away: a thunder is heard before long", async ({ page }) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?schematic');
  const thunder = page.waitForRequest(/thunder-far-\d[^/]*\.mp3/, { timeout: 40_000 });
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await thunder;
  await expect(page.getByRole('complementary', { name: 'Créditos de la música' })).toContainText('Música: Run Rabbit Productions');
  expect(errors).toEqual([]);
});

test("Mansions' sound goes on while the investigators are chosen, their room's lightning with its thunder, and ends with the choice", async ({ page }, testInfo) => {
  test.skip(!existsSync(scenario), 'Missing referencias/descargas: run node referencias/descargar-escenarios.mjs');
  test.skip(testInfo.project.name !== 'desktop', "A wide screen: held upright, the classic list, without the room's storm");
  test.setTimeout(90_000);
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await page.locator('input[type=file]').setInputFiles(scenario);
  await page.getByRole('button', { name: /Material exótico/ }).click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await expect(page.locator('.hero-room-art[data-art=drawn]')).toHaveCount(1);
  expect(await soundOf(page)).toBe('MoM');
  // The room's own lightning brings a thunder
  await page.waitForRequest(/thunder-far-\d[^/]*\.mp3/, { timeout: 40_000 });
  expect(await soundOf(page)).toBe('MoM');
  // The game starts: the menu's sound ends
  for (const hero of await page.locator('.hero-choice').all()) await hero.click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  await expect(page.getByRole('heading', { name: 'Objetos' })).toBeVisible();
  await expect.poll(() => soundOf(page)).toBeNull();
});

test("the menus' buttons click softly, unless the advanced options say not to", async ({ page }) => {
  await page.addInitScript(`{
    window.played = [];
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...args) {
      window.played.push(this.buffer ? this.buffer.duration : 0);
      start.apply(this, args);
    };
  }`);
  // The click is a hundredth of a second long
  const clicks = () => page.evaluate<number>('window.played.filter((seconds) => seconds < 0.05).length');
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Descent/ }).click();
  await page.getByRole('button', { name: 'Opciones' }).click();
  await expect.poll(clicks).toBeGreaterThan(0);
  await page.getByText('Opciones avanzadas').click();
  await page.getByRole('switch', { name: 'Sonido de clic en los botones de los menús' }).uncheck();
  await page.waitForTimeout(500);
  const before = await clicks();
  await page.getByRole('button', { name: 'Volver' }).click();
  await page.getByRole('button', { name: 'Opciones' }).click();
  await page.waitForTimeout(500);
  expect(await clicks()).toBe(before);
});

test('the options have a volume for the music of the import, one for the adventure\'s own, one for the effects and one for the menus', async ({ page }) => {
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Descent/ }).click();
  await page.getByRole('button', { name: 'Opciones' }).click();
  for (const name of ['Música del juego oficial (importada)', 'Música de la aventura (la de su autor)', 'Efectos', 'Sonido de los menús']) {
    await expect(page.getByRole('slider', { name })).toHaveValue('1');
  }
  // The menus' volume is kept, and is the menus' sound's own
  await page.getByRole('slider', { name: 'Sonido de los menús' }).fill('0.3');
  await page.getByRole('slider', { name: 'Música de la aventura (la de su autor)' }).fill('0.6');
  await page.getByRole('button', { name: 'Volver' }).click();
  await page.getByRole('button', { name: 'Opciones' }).click();
  await expect(page.getByRole('slider', { name: 'Sonido de los menús' })).toHaveValue('0.3');
  await expect(page.getByRole('slider', { name: 'Música de la aventura (la de su autor)' })).toHaveValue('0.6');
  await expect(page.getByRole('slider', { name: 'Música del juego oficial (importada)' })).toHaveValue('1');
});
