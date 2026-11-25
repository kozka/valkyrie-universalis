// Not in Valkyrie (12 November 2026): a tough monster's coming is marked by how tough it is (play/epicSpawn.ts), and
// the option «buttons apart» leaves an event's buttons below its text's frame. Its own scenario, so it needs no download.
import { expect, test, type Page } from '@playwright/test';
import { strToU8, zipSync } from 'fflate';
import { layoutFaults } from './fixtures/layoutFaults.ts';

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
buttons=3
event1=SpawnBoss
event2=SpawnCultist
event3=SpawnCultist

[TileA]
side=TileSideAlley1
xposition=0
yposition=0

[CustomMonsterBoss]
base=MonsterCultist
health=20
healthperhero=2

[SpawnBoss]
monster=CustomMonsterBoss
buttons=1
event1=

[SpawnCultist]
monster=MonsterCultist
buttons=1
event1=
`;
const loc = `.,Spanish
quest.name,Prueba del jefe
quest.description,Prueba
EventStart.text,${'La niebla se espesa sobre el callejón y algo se mueve entre las sombras. '.repeat(3)}
EventStart.button1,Enfrentarse a lo que viene
EventStart.button2,Huir
EventStart.button3,Esconderse
CustomMonsterBoss.name,El Jefe
SpawnBoss.text,Aparece el jefe.
SpawnBoss.button1,Continuar
SpawnCultist.text,Aparece un sectario.
SpawnCultist.button1,Continuar
`;

test.use({ locale: 'es-ES' });
test.beforeEach(async ({ page }) => {
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
  await page.addInitScript(() => localStorage.setItem('universalis.upright', 'yes'));
});

async function start(page: Page, apart: boolean): Promise<void> {
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  const file = zipSync({ 'quest.ini': strToU8(ini), 'Localization.Spanish.txt': strToU8(loc) });
  await page.locator('input[type=file]').setInputFiles({ name: 'jefe.valkyrie', mimeType: 'application/zip', buffer: Buffer.from(file) });
  await page.getByRole('button', { name: /Prueba del jefe/ }).click();
  await page.evaluate(`import('/src/ui/preferences.ts').then((p) => p.setSwitch('buttonsApart', ${apart}))`);
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await page.locator('.hero-choice').first().click();
  await page.getByRole('button', { name: 'Terminado' }).click();
  if (await page.getByRole('heading', { name: 'Objetos' }).isVisible()) await page.getByRole('button', { name: 'Terminado' }).click();
  await expect(page.locator('.dialog-layer .event-window')).toContainText('niebla');
}

test("fills the screen with a boss as it comes, and only marks a cultist's icon", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One screen is enough');
  await start(page, false);
  await page.getByRole('button', { name: 'Enfrentarse a lo que viene' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.locator('.epic-spawn')).toBeVisible();
  await expect(page.locator('.board-stage')).toHaveClass(/epic-shake-3/);
  await expect(page.locator('.monster-icon.epic-3')).toBeVisible();
  // It is never in the way of a press
  await page.locator('.monster-icon').first().click({ timeout: 1500 });
  await expect(page.locator('.monster-panel')).toBeVisible();
  await expect(page.locator('.epic-spawn')).toHaveCount(0, { timeout: 5000 });
  await expect(page.locator('.board-stage')).not.toHaveClass(/epic-shake/);
  await expect(page.locator('.monster-icon.monster-epic')).toHaveCount(0, { timeout: 5000 });
});

test('leaves a common monster without the mark', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One screen is enough');
  await start(page, false);
  await page.getByRole('button', { name: 'Huir' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.locator('.monster-icon.monster-new')).toBeVisible();
  await expect(page.locator('.monster-icon.monster-epic')).toHaveCount(0);
  await expect(page.locator('.epic-spawn')).toHaveCount(0);
});

for (const { name, viewport } of [
  { name: 'a laptop', viewport: { width: 1280, height: 720 } },
  { name: 'a phone held sideways', viewport: { width: 853, height: 384 } },
]) {
  test(`leaves an event's buttons below its text's frame on ${name}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'The sizes are set here');
    await page.setViewportSize(viewport);
    await start(page, true);
    const text = (await page.locator('.dialog-layer .event-window > .event-text').boundingBox())!;
    const buttons = (await page.locator('.dialog-layer .event-window > .event-buttons').boundingBox())!;
    expect(buttons.y).toBeGreaterThanOrEqual(text.y + text.height);
    expect(await page.evaluate("getComputedStyle(document.querySelector('.dialog-layer .event-window')).borderImageSource")).toBe('none');
    expect(await layoutFaults(page)).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath('apart.png') });
    if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/apart-${viewport.width}.png` });
  });
}
