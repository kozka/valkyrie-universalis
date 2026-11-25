// Every window of a game, laid out on the screens where they had no room (11 November 2026): a phone held sideways and
// upright and a small phone, with the largest text and the television mode. In Mansions: a long event with four
// buttons, a monster's window and its attack, its activation, the four puzzles, the items, the notes and the game's
// menu; in Descent (and DooM, which wears its own frames): the classes, a monster group, its activation, a hero, the
// skills, items and log, the shop and the menu. No window is off the screen, over another or drawn past its frame, and
// every button is in reach (layoutFaults). Their own scenarios, so they need no download.
import { expect, test, type Page } from '@playwright/test';
import { strToU8, zipSync } from 'fflate';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { layoutFaults } from './fixtures/layoutFaults.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const engineUrl = `/@fs/${join(root, 'packages/engine/src/index.ts').replaceAll('\\', '/').replace(/^\//, '')}`;

const LONG = 'Las paredes de la biblioteca están cubiertas de estanterías combadas por el peso de libros que nadie ha abierto en décadas. '.repeat(6);
const longEvent = `[EventLong]
display=true
buttons=4
event1=Spawn
event2=Spawn
event3=Spawn
event4=Spawn
`;
const longTexts = `EventLong.text,${LONG}
EventLong.button1,Examinar con calma el cuaderno abierto sobre la mesa
EventLong.button2,Encender el candil
EventLong.button3,Buscar entre las estanterías del fondo
EventLong.button4,Salir de la biblioteca sin tocar nada
Spawn.text,Aparecen.
Spawn.button1,Continuar
EventStart.text,Empieza.
EventStart.button1,Continuar
`;
const header = (game: string) => `[Quest]
format=21
type=${game}
defaultlanguage=Spanish
minhero=2
maxhero=4

[QuestText]
Localization.Spanish.txt

[EventStart]
display=true
trigger=EventStart
add=TileA
buttons=1
event1=EventLong

`;

const MOM = `${header('MoM')}[TileA]
side=TileSideAlley1
xposition=0
yposition=0

${longEvent}
[Spawn]
monster=MonsterCultist
buttons=1
event1=

[PuzzleCode]
class=code
skill={lore}
puzzlelevel=4
puzzlealtlevel=6
buttons=1
event1=

[PuzzleSlide]
class=slide
skill={agility}
puzzlelevel=4
buttons=1
event1=

[PuzzleTower]
class=tower
skill={strength}
puzzlelevel=5
puzzlealtlevel=3
buttons=1
event1=

[PuzzleImage]
class=image
skill={observation}
puzzlelevel=3
puzzlealtlevel=3
image=PuzzleOldJournal
buttons=1
event1=
`;

const D2E = `${header('D2E')}[TileA]
side=TileSide1A
xposition=0
yposition=0

${longEvent}
[Spawn]
monster=MonsterGoblinArcher
buttons=1
event1=

[QItemA]
traitpool=act1

[QItemB]
traitpool=act1

[QItemC]
traitpool=act1

[EventShop]
display=true
add=QItemA QItemB QItemC
buttons=1
event1=EventShopClose

[EventShopClose]
display=false
remove=#shop
`;

const package_ = (ini: string, name: string, more = '') =>
  Buffer.from(zipSync({ 'quest.ini': strToU8(ini), 'Localization.Spanish.txt': strToU8(`.,Spanish\nquest.name,${name}\nquest.description,Prueba\n${longTexts}${more}`) }));

const SCREENS = [
  { name: 'a phone held sideways in the television mode', viewport: { width: 853, height: 384 }, size: 'larger', tv: true },
  { name: 'a small phone held sideways', viewport: { width: 568, height: 320 }, size: 'larger', tv: false },
  { name: 'a phone held upright', viewport: { width: 412, height: 915 }, size: 'larger', tv: false },
];

test.use({ locale: 'es-ES' });
test.beforeEach(async ({ page }) => {
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
  await page.addInitScript(() => localStorage.setItem('universalis.upright', 'yes'));
});

/** Runs code with the page's own engine, as `e`. */
function engine(page: Page, code: string): Promise<void> {
  return page.evaluate(
    async ({ url, code }) => {
      const e = await import(url);
      new Function('e', code)(e);
    },
    { url: engineUrl, code },
  );
}

/** Closes the windows and forgets the event they belonged to, so that the next one opens at once. */
const close = (page: Page) => engine(page, 'e.Destroyer.dialog(); e.Game.get().currentQuest.eManager.currentEvent = null;');

/** Opens a scenario of its own with the text size of the screen, up to its first event. */
async function start(page: Page, game: RegExp, file: Buffer, name: string, size: string, tv: boolean): Promise<void> {
  await page.goto('/?schematic');
  await page.getByRole('button', { name: game }).first().click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await page.locator('input[type=file]').setInputFiles({ name: 'ventanas.valkyrie', mimeType: 'application/zip', buffer: file });
  await page.locator('.quest', { hasText: name }).click();
  await page.evaluate(`import('/src/ui/preferences.ts').then((p) => { p.setTextSize('${size}'); p.setSwitch('tvMode', ${tv}); })`);
  await page.getByRole('button', { name: 'Iniciar' }).click();
}

for (const { name, viewport, size, tv } of SCREENS) {
  test(`lays out Mansions' windows on ${name}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'The sizes are set here');
    test.setTimeout(120_000);
    await page.setViewportSize(viewport);
    const seen = async (step: string) => {
      await page.waitForTimeout(300);
      expect(await layoutFaults(page), step).toEqual([]);
    };
    await start(page, /Las Mansiones de la Locura/, package_(MOM, 'Ventanas de Mansiones'), 'Ventanas de Mansiones', size, tv);
    await seen('investigators');
    await page.locator('.hero-choice').nth(0).click();
    await page.locator('.hero-choice').nth(1).click();
    await page.getByRole('button', { name: 'Terminado' }).click();
    await seen('starting items');
    await page.getByRole('button', { name: 'Terminado' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.locator('.dialog-layer .event-window')).toContainText('biblioteca');
    await seen('long event');
    // Not in Valkyrie (11 November 2026): Set waits while a window is open, as Items does, instead of opening a second one
    for (const button of ['items', 'set']) {
      await page.locator(`.phase-bar .button.${button}`).click();
      await expect(page.locator('.window-layer .window')).toHaveCount(1);
    }
    await page.locator('.dialog-layer .event-button').first().click();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.locator('.monster-icon').first().click();
    await expect(page.locator('.monster-panel')).toBeVisible();
    await seen('monster');
    await page.locator('.dialog-layer .event-window .button').first().click();
    await page.locator('.dialog-layer .event-window .button').first().click();
    await seen('attack');
    await close(page);
    await engine(page, 'const q = e.Game.get().currentQuest; q.phase = e.Quest.MoMPhase.monsters; e.Game.get().roundControl.activateMonster(q.monsters[0]);');
    await seen('activation');
    await close(page);
    await engine(page, 'e.Game.get().currentQuest.phase = e.Quest.MoMPhase.investigator;');
    for (const puzzle of ['PuzzleCode', 'PuzzleSlide', 'PuzzleTower', 'PuzzleImage']) {
      await engine(page, `e.Game.get().currentQuest.eManager.queueEvent('${puzzle}');`);
      await expect(page.locator('.puzzle-window')).toBeVisible();
      await seen(puzzle);
      await close(page);
    }
    await page.locator('.phase-bar .button.items').click();
    await seen('items');
    await close(page);
    await page.locator('.phase-bar .button.notes').click();
    await expect(page.locator('.notes-window')).toBeVisible();
    await seen('notes');
    await page.keyboard.press('Escape');
    await page.locator('.menu-button').click();
    await seen('menu');
    await page.screenshot({ path: testInfo.outputPath('menu.png') });
  });

  test(`lays out Descent's windows on ${name}, in its frames and in DooM's`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'The sizes are set here');
    test.setTimeout(180_000);
    await page.setViewportSize(viewport);
    for (const look of ['D2E', 'DooM']) {
      const seen = async (step: string) => {
        await page.waitForTimeout(300);
        expect(await layoutFaults(page), `${look}: ${step}`).toEqual([]);
      };
      await start(page, /Descent/, package_(D2E, 'Ventanas de Descent', 'EventShop.text,El herrero os enseña su mercancía.\nEventShop.button1,Salir de la tienda\n'), 'Ventanas de Descent', size, tv);
      // DooM is Descent with its pack, in its own frames: its look alone, kept whatever the screens set
      await page.evaluate(`(() => {
        const html = document.documentElement;
        new MutationObserver(() => html.dataset.look !== '${look}' && (html.dataset.look = '${look}')).observe(html, { attributes: true });
        html.dataset.look = '${look}';
      })()`);
      await page.locator('.hero-choice').nth(0).click();
      await page.locator('.hero-choice').nth(1).click();
      await page.getByRole('button', { name: 'Terminado' }).click();
      await seen('classes');
      const columns = page.locator('.class-hero');
      await columns.nth(0).locator('.class-choice').first().click();
      await columns.nth(1).locator('.class-choice:enabled').first().click();
      await page.getByRole('button', { name: 'Terminado' }).click();
      await page.getByRole('button', { name: 'Continuar' }).click();
      await seen('long event');
      await page.locator('.dialog-layer .event-button').first().click();
      await page.getByRole('button', { name: 'Continuar' }).click();
      await page.locator('.monster-icon').first().click();
      await seen('monster group');
      await close(page);
      await engine(page, 'const g = e.Game.get(); g.roundControl.activateMonster(g.currentQuest.monsters[0]);');
      await seen('activation');
      await engine(page, "const g = e.Game.get(); g.ui.destroyTag('activation'); e.Destroyer.dialog();");
      await page.locator('.hero-slot').first().click();
      await seen('hero');
      await close(page);
      const buttons = page.locator('.descent-buttons .button');
      for (let i = 0; i < (await buttons.count()); i++) {
        await buttons.nth(i).click();
        await seen(`button ${i + 1} below`);
        await engine(page, "const g = e.Game.get(); g.ui.destroyTag('logs'); e.Destroyer.dialog();");
      }
      await engine(page, "e.Game.get().currentQuest.vars.setValue('$%gold', 300); e.Game.get().currentQuest.eManager.queueEvent('EventShop');");
      await expect(page.locator('.shop')).toBeVisible();
      await seen('shop');
      await page.getByRole('button', { name: 'Salir de la tienda' }).click();
      await page.locator('.menu-button').click();
      await seen('menu');
      await page.screenshot({ path: testInfo.outputPath(`${look}-menu.png`) });
    }
  });
}
