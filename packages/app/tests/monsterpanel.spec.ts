// A monster's panel beside its windows (11 November 2026): at any text size, in the television mode, on a phone held
// sideways or upright, the panel and the attack, evade and horror windows never cover each other, every button of both
// can be pressed, the panel's damage buttons stay on the screen and the menu button stays in reach. Its own scenario,
// so it needs no download.
import { expect, test, type Page } from '@playwright/test';
import { strToU8, zipSync } from 'fflate';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { layoutFaults, withoutContainerQueries } from './fixtures/layoutFaults.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const engineUrl = `/@fs/${join(root, 'packages/engine/src/index.ts').replaceAll('\\', '/').replace(/^\//, '')}`;

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
event1=SpawnCultist

[TileA]
side=TileSideAlley1
xposition=0
yposition=0

[SpawnCultist]
monster=MonsterCultist
buttons=1
event1=
`;
const loc = `.,Spanish
quest.name,Prueba del monstruo
quest.description,Prueba
EventStart.text,Empieza.
EventStart.button1,Continuar
SpawnCultist.text,Aparece un sectario.
SpawnCultist.button1,Continuar
`;
test.use({ locale: 'es-ES' });
test.beforeEach(async ({ page }) => {
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
});

/** What is wrong with the monster's panel and the windows beside it, if anything (layoutFaults), with the menu in reach. */
async function faults(page: Page): Promise<string[]> {
  const found = await layoutFaults(page);
  const own = await page.evaluate<string[]>(`(() => {
    const found = [];
    const menu = document.querySelector('.menu-button');
    if (menu !== null) {
      const r = menu.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (!(hit !== null && (hit === menu || menu.contains(hit)))) found.push('menu covered');
    }
    const panel = document.querySelector('.monster-panel');
    if (panel === null) found.push('no panel');
    else if (panel.scrollHeight > panel.clientHeight + 1) found.push('panel too short for its content');
    return found;
  })()`);
  return [...found, ...own];
}

for (const { name, viewport, size, tv, old = false } of [
  { name: 'a phone held sideways', viewport: { width: 853, height: 384 }, size: 'larger', tv: false },
  { name: 'a phone held sideways in a Chrome before 105', viewport: { width: 853, height: 384 }, size: 'larger', tv: false, old: true },
  { name: 'a phone held upright in a Chrome before 105', viewport: { width: 412, height: 915 }, size: 'larger', tv: true, old: true },
  { name: 'a small phone held sideways', viewport: { width: 568, height: 320 }, size: 'normal', tv: false },
  { name: 'a laptop in the television mode', viewport: { width: 1366, height: 768 }, size: 'larger', tv: true },
  { name: 'a tablet held upright', viewport: { width: 810, height: 1080 }, size: 'large', tv: false },
  { name: 'a phone held upright', viewport: { width: 412, height: 915 }, size: 'larger', tv: true },
]) {
  test(`keeps a monster's panel and its windows apart on ${name}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'The sizes are set here');
    await page.addInitScript(() => localStorage.setItem('universalis.upright', 'yes'));
    await page.setViewportSize(viewport);
    await page.goto('/?schematic');
    await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
    await page.getByRole('button', { name: 'Partida nueva' }).click();
    const file = zipSync({ 'quest.ini': strToU8(ini), 'Localization.Spanish.txt': strToU8(loc) });
    await page.locator('input[type=file]').setInputFiles({ name: 'monstruo.valkyrie', mimeType: 'application/zip', buffer: Buffer.from(file) });
    await page.getByRole('button', { name: /Prueba del monstruo/ }).click();
    await page.getByRole('button', { name: 'Iniciar' }).click();
    await page.locator('.hero-choice').first().click();
    await page.getByRole('button', { name: 'Terminado' }).click();
    if (await page.getByRole('heading', { name: 'Objetos' }).isVisible()) await page.getByRole('button', { name: 'Terminado' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.locator('.dialog-layer .event-window')).toContainText('sectario');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.evaluate(`import('/src/ui/preferences.ts').then((p) => { p.setTextSize('${size}'); p.setSwitch('tvMode', ${tv}); })`);
    if (old) await withoutContainerQueries(page);

    // Its window: attack, evade and cancel, all of them in reach beside the panel
    await page.locator('.monster-icon').first().click();
    await expect(page.locator('.monster-panel')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible();
    expect(await faults(page)).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath('01-monster.png') });
    // The damage goes up and down from the panel while its window is open
    await page.locator('.monster-damage .button').last().click();
    await expect(page.locator('.damage-value')).toHaveText('1');
    await page.locator('.monster-damage .button').first().click();
    await expect(page.locator('.damage-value')).toHaveText('0');

    // An attack's result
    await page.locator('.dialog-layer .event-window .button').first().click();
    await page.locator('.dialog-layer .event-window .button').first().click();
    await expect(page.getByRole('button', { name: 'Terminado' })).toBeVisible();
    expect(await faults(page)).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath('02-attack.png') });
    await page.getByRole('button', { name: 'Terminado' }).click();

    // A horror check, in the Mythos' horror step
    await page.evaluate(async (url) => {
      const engine = (await import(url)) as typeof import('@universalis/engine');
      const game = engine.Game.get();
      game.currentQuest!.phase = engine.Quest.MoMPhase.horror;
      engine.MonsterCanvas.monsterDiag(game.currentQuest!.monsters[0]!);
    }, engineUrl);
    await page.locator('.dialog-layer .event-window .button').first().click();
    await expect(page.getByRole('button', { name: 'Terminado' })).toBeVisible();
    expect(await faults(page)).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath('03-horror.png') });
  });
}

/** Valkyrie's base monsters, eight kinds, as a save's lines make them (Quest.Monster from its data). */
const EIGHT = ['MonsterCultist', 'MonsterDeepOne', 'MonsterDeepOneHybrid', 'MonsterGhost', 'MonsterHuntingHorror', 'MonsterRiot', 'MonsterStarSpawn', 'MonsterChildOfDagon'];

// Not in Valkyrie (11 November 2026): with many monsters, the list on the right shows as many as fit between the menu
// and the next phase's button (five where they fit, as Valkyrie), and its arrows reach every one; on a phone held
// sideways the fifth and the arrow down were off the screen
for (const { name, viewport, size, tv, place = 'right' } of [
  { name: 'a laptop', viewport: { width: 1280, height: 800 }, size: 'normal', tv: false },
  { name: 'a phone held sideways', viewport: { width: 853, height: 360 }, size: 'normal', tv: false },
  { name: 'a phone held sideways in the television mode', viewport: { width: 853, height: 360 }, size: 'larger', tv: true },
  // Not in Valkyrie (12 November 2026): along the bottom, as the official app (Options)
  { name: 'a laptop, along the bottom', viewport: { width: 1280, height: 800 }, size: 'normal', tv: false, place: 'bottom' },
  { name: 'a small phone held sideways, along the bottom', viewport: { width: 568, height: 320 }, size: 'larger', tv: false, place: 'bottom' },
]) {
  test(`reaches every monster of a long list on ${name}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'The sizes are set here');
    await page.setViewportSize(viewport);
    await page.goto('/?schematic');
    await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
    await page.getByRole('button', { name: 'Partida nueva' }).click();
    const file = zipSync({ 'quest.ini': strToU8(ini), 'Localization.Spanish.txt': strToU8(loc) });
    await page.locator('input[type=file]').setInputFiles({ name: 'monstruo.valkyrie', mimeType: 'application/zip', buffer: Buffer.from(file) });
    await page.getByRole('button', { name: /Prueba del monstruo/ }).click();
    await page.evaluate(`import('/src/ui/preferences.ts').then((p) => { p.setTextSize('${size}'); p.setSwitch('tvMode', ${tv}); p.setMonsterPlace('${place}'); })`);
    await page.getByRole('button', { name: 'Iniciar' }).click();
    await page.locator('.hero-choice').first().click();
    await page.getByRole('button', { name: 'Terminado' }).click();
    if (await page.getByRole('heading', { name: 'Objetos' }).isVisible()) await page.getByRole('button', { name: 'Terminado' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.evaluate(
      async ({ url, kinds }) => {
        const engine = (await import(url)) as typeof import('@universalis/engine');
        const game = engine.Game.get();
        engine.Destroyer.dialog();
        game.currentQuest!.eManager.currentEvent = null;
        const blank = ['activated', 'minionStarted', 'masterStarted', 'unique'].map((key) => [key, 'false'] as [string, string]);
        for (const type of kinds) game.currentQuest!.monsters.push(new engine.Quest.Monster(new Map([['type', type], ['damage', '0'], ['duplicate', '0'], ['uniqueText', ''], ['uniqueTitle', ''], ...blank])));
        game.monsterCanvas.updateList();
      },
      { url: engineUrl, kinds: EIGHT },
    );
    const icons = page.locator('.monster-list .monster-icon');
    await expect(icons.first()).toBeVisible();
    const seen = new Set<string>();
    for (let i = 0; i < 10; i++) {
      // Every icon and arrow shown is on the screen, above the next phase's button, and can be pressed
      const wrong = await page.evaluate<string[]>(`(() => {
        const next = document.querySelector('.phase-bar > .button.next-phase').getBoundingClientRect();
        return [...document.querySelectorAll('.monster-list :is(.monster-icon, .scroll)')].flatMap((e) => {
          const r = e.getBoundingClientRect();
          const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          const label = e.getAttribute('aria-label');
          if (r.bottom > innerHeight || ('${place}' === 'right' && r.bottom > next.top) || ('${place}' === 'bottom' && r.right > next.left)) return [label + ' outside the list\\'s room'];
          return hit !== null && (hit === e || e.contains(hit)) ? [] : [label + ' covered'];
        });
      })()`);
      expect(wrong).toEqual([]);
      for (const label of await icons.evaluateAll((all) => all.map((e) => e.getAttribute('aria-label') ?? ''))) seen.add(label);
      const down = page.getByRole('button', { name: 'Más monstruos' });
      if ((await down.count()) === 0 || (await down.isDisabled())) break;
      await down.click();
    }
    expect(seen.size).toBe(EIGHT.length);
    await page.screenshot({ path: testInfo.outputPath('list-end.png') });
    // The last one opens its window
    await icons.last().click();
    await expect(page.locator('.monster-panel')).toBeVisible();
  });
}
