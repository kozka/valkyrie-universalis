// The phase bar never hides a window's button (25 October 2026): a long event with many buttons, in the investigators'
// phase and in the Mythos, on a wide screen and on a phone held sideways. Its own scenario, so it needs no download.
import { expect, test, type Page } from '@playwright/test';
import { strToU8, zipSync } from 'fflate';

const long = 'Pandu se agacha junto al cuerpo y empieza a registrar sus bolsillos con manos temblorosas. '.repeat(12);
const ini = `[Quest]
format=21
type=MoM
defaultlanguage=Spanish
minhero=1
maxhero=5

[QuestText]
Localization.Spanish.txt

[EventStart]
display=true
trigger=EventStart
add=TileA
buttons=1
event1=EventMany

[EventMany]
display=true
buttons=4
event1=
event2=
event3=
event4=

[TileA]
side=TileSideAlley1
xposition=0
yposition=0

[EventMythos]
display=true
trigger=Mythos
buttons=4
event1=
event2=
event3=
event4=
`;
const loc = `.,Spanish
quest.name,Prueba de la barra
quest.description,Prueba
EventStart.text,Empieza.
EventStart.button1,Continuar
EventMany.text,${long}
EventMany.button1,Uno
EventMany.button2,Dos
EventMany.button3,Tres
EventMany.button4,Cuatro
EventMythos.text,${long}
EventMythos.button1,Intentar quitarle a Pandu
EventMythos.button2,Dejarle hacer
EventMythos.button3,Huir
EventMythos.button4,Gritar
`;

test.use({ locale: 'es-ES' });
test.beforeEach(async ({ page }) => {
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
});

/** Every button of the window lies inside it, above the bar, and is what a press at its middle reaches once in view. */
async function reachable(page: Page, names: string[]): Promise<void> {
  const window = (await page.locator('.dialog-layer .event-window').boundingBox())!;
  const bar = (await page.locator('.phase-bar').boundingBox())!;
  expect(window.y + window.height).toBeLessThanOrEqual(bar.y + bar.height - (await page.locator('.phase-bar .next-phase').boundingBox())!.height + 1);
  for (const name of names) {
    const button = page.getByRole('button', { name, exact: true });
    await button.scrollIntoViewIfNeeded();
    const box = (await button.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(window.y);
    expect(box.y + box.height).toBeLessThanOrEqual(window.y + window.height + 1);
    // The root tsconfig has no DOM: the page's document is reached as descent.spec.ts reaches it
    type Page = { document: { elementFromPoint(x: number, y: number): { closest(s: string): { textContent: string | null } | null } | null } };
    const hit = await page.evaluate(({ x, y }) => (globalThis as unknown as Page).document.elementFromPoint(x, y)?.closest('button')?.textContent ?? null, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
    expect(hit).toBe(name);
  }
}

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 640, height: 360 },
]) {
  test(`keeps every button of a long event clear of the phase bar at ${viewport.width}×${viewport.height}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'The sizes are set here');
    await page.setViewportSize(viewport);
    await page.goto('/?schematic');
    await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
    await page.getByRole('button', { name: 'Partida nueva' }).click();
    const file = zipSync({ 'quest.ini': strToU8(ini), 'Localization.Spanish.txt': strToU8(loc) });
    await page.locator('input[type=file]').setInputFiles({ name: 'barra.valkyrie', mimeType: 'application/zip', buffer: Buffer.from(file) });
    await page.getByRole('button', { name: /Prueba de la barra/ }).click();
    await page.getByRole('button', { name: 'Iniciar' }).click();
    await page.locator('.hero-choice').first().click();
    await page.getByRole('button', { name: 'Terminado' }).click();
    if (await page.getByRole('heading', { name: 'Objetos' }).isVisible()) await page.getByRole('button', { name: 'Terminado' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();

    // The investigators' phase: the bar is there, and lets presses through away from its own buttons
    await expect(page.locator('.phase-bar.investigators')).toBeVisible();
    await expect(page.locator('.phase-bar')).toHaveCSS('pointer-events', 'none');
    await reachable(page, ['Uno', 'Dos', 'Tres', 'Cuatro']);
    await page.screenshot({ path: testInfo.outputPath('01-investigators.png') });
    await page.getByRole('button', { name: 'Cuatro' }).click();

    // The Mythos: red at the edges, and the same room for its event
    await page.locator('.phase-bar .next-phase').click();
    const confirm = page.getByRole('button', { name: 'Confirmar' });
    if (await confirm.isVisible()) await confirm.click();
    await expect(page.locator('.phase-bar.mythos')).toBeVisible();
    await expect(page.locator('.phase-vignette')).toHaveCount(1);
    await expect(page.locator('.dialog-layer .event-window')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.transition-window')).toHaveCount(0, { timeout: 10_000 });
    await reachable(page, ['Intentar quitarle a Pandu', 'Dejarle hacer', 'Huir', 'Gritar']);
    await page.screenshot({ path: testInfo.outputPath('02-mythos.png') });
    await page.getByRole('button', { name: 'Gritar' }).click();
    await expect(page.locator('.dialog-layer .event-window')).toHaveCount(0);
  });
}
