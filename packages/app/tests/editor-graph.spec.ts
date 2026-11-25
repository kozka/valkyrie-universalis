// The editor's graph, its history and selections, and the screen of UI elements, in a real browser (development builds
// only, or while it is open to try: packages/app/editorPreview.ts): the scenario drawn as a graph (rows by what starts
// them, shapes by kind, conditions in pink, braces, copies with a circled number), edited there (a new event from a
// button's port, a link dragged, a link taken away, an event put in the middle, a new component from the menu), the
// changes listed in the history and taken back from it, what was selected listed latest first, and a UI element dragged
// on the screen. Without official content (?schematic).
import { expect, test, type Page } from '@playwright/test';
import { strToU8, zipSync } from 'fflate';
import { EDITOR_PREVIEW } from '../editorPreview.ts';
import { pressEditor } from './fixtures/editor.ts';

test.use({ locale: 'es-ES' });

test.beforeEach(async ({ page }, testInfo) => {
  // While the editor is open to try, a phone does not open it (editor-preview.spec.ts)
  test.skip(testInfo.project.name === 'phone' && EDITOR_PREVIEW, 'While it is open to try, the editor opens on a computer only');
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
});

const EVENTS = [
  '[EventStart]', 'trigger=EventStart', 'display=true', 'buttons=1', 'event1=EventA EventB', 'add=TokenLook UIText', '',
  '[EventA]', 'display=true', 'buttons=2', 'event1=EventWin', 'event1Condition=VarOperation:clues,>=,2 ', 'event1ConditionAction=hide', 'event2=EventA', 'vartests=VarOperation:#round,>,0 ', '',
  '[EventB]', 'buttons=1', 'operations=clues,+,1', '',
  '[EventWin]', 'display=true', 'buttons=1', 'operations=$end,=,1', '',
  '[EventLoose]', 'buttons=1', '',
].join('\r\n');
const TOKENS = ['[TokenLook]', 'type=TokenSearch', 'xposition=0', 'yposition=0', 'buttons=1', 'event1=EventA', ''].join('\r\n');
const UI = ['[UIText]', 'xposition=0', 'yposition=0', 'size=0.4', 'aspect=2', 'verticalunits=false', 'buttons=1', ''].join('\r\n');
const TEXTS = [
  '.,Spanish',
  'quest.name,Grafo',
  'EventStart.text,Empieza',
  'EventStart.button1,Seguir',
  'EventA.text,Una sala',
  'EventA.button1,Ganar',
  'EventA.button2,Otra vez',
  'EventWin.text,Ganaste',
  'EventWin.button1,Fin',
  'UIText.uitext,Hola',
].join('\r\n');

function scenario(): Buffer {
  return Buffer.from(
    zipSync({
      'quest.ini': strToU8('[Quest]\r\nformat=21\r\ntype=MoM\r\ndefaultlanguage=Spanish\r\n\r\n[QuestText]\r\nLocalization.Spanish.txt\r\n\r\n[QuestData]\r\nevents.ini\r\ntokens.ini\r\nui.ini\r\n'),
      'events.ini': strToU8(EVENTS),
      'tokens.ini': strToU8(TOKENS),
      'ui.ini': strToU8(UI),
      'Localization.Spanish.txt': strToU8(TEXTS),
    }),
  );
}

async function openScenario(page: Page): Promise<void> {
  await page.goto('/?schematic');
  await page.getByRole('button', { name: /Las Mansiones de la Locura/ }).click();
  await pressEditor(page);
  await page.locator('input[type=file][accept=".valkyrie,.zip"]').setInputFiles({ name: 'Grafo.valkyrie', mimeType: 'application/zip', buffer: scenario() });
  await page.getByRole('button', { name: /Grafo/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Grafo', level: 1 })).toBeVisible();
}

async function openGraph(page: Page) {
  await page.getByRole('tab', { name: 'Grafo' }).click();
  const graph = page.getByRole('application', { name: 'Grafo' });
  await expect(graph).toBeVisible();
  return graph;
}

/** The lines text mode shows for the selected component: what Save writes. */
async function sectionOf(page: Page): Promise<string> {
  await page.getByRole('button', { name: 'Modo texto' }).click();
  const value = await page.getByLabel('Su sección del .ini').inputValue();
  await page.getByRole('button', { name: 'Modo texto' }).click();
  return value;
}

test('draws the scenario as a graph: rows, shapes, conditions, braces and copies', async ({ page, isMobile }) => {
  // The graph is for a computer or a big tablet, as the editor is: a phone shows a corner of it
  test.skip(isMobile, 'The graph needs a wide screen');
  await openScenario(page);
  const graph = await openGraph(page);
  // A row for EventStart, and apart what nothing reaches
  await expect(page.getByLabel('Filas: qué empieza cada una').locator('option')).toHaveText(['Todas las filas (2)', 'Al empezar · EventStart', 'Nada llega']);
  await expect(graph.locator('.graph-row-head').first()).toHaveText('Al empezar');
  const start = graph.locator('[data-graph-id="EventStart#0"]');
  await expect(start).toHaveClass(/graph-event/);
  await expect(start.locator('.graph-badge-trigger')).toHaveText('EventStart');
  await expect(start.locator('.graph-button-label')).toHaveText('Seguir');
  // Its button starts two events: a brace, the first that can
  await expect(graph.locator('.graph-brace-label')).toHaveText('el primero que pueda');
  // What it puts on the board: a round token, and a UI element, with + on their lines
  await expect(graph.locator('[data-graph-id="TokenLook#0"] .graph-circle')).toBeVisible();
  await expect(graph.locator('[data-graph-id="UIText#0"]')).toHaveClass(/graph-ui/);
  await expect(graph.locator('.graph-edge-add')).toHaveCount(2);
  // EventA's own condition, and its first button's, lit as hiding the button
  const a = graph.locator('[data-graph-id="EventA#0"]');
  await expect(a.locator('.graph-condition')).toHaveText('#round > 0');
  await expect(a.locator('.graph-button-condition')).toHaveText('clues ≥ 2');
  await expect(a.locator('.graph-button-condition')).toHaveClass(/graph-effect-hide/);
  // What it sets, and what ends the game
  await expect(graph.locator('[data-graph-id="EventB#0"] .graph-operations')).toHaveText('clues + 1');
  await expect(graph.locator('[data-graph-id="EventWin#0"] .graph-badge-end')).toHaveText('FIN');
  // EventA comes again (its own button, the token): copies with its circled number
  await expect(graph.locator('[data-graph-node="EventA"] .graph-mark').first()).toHaveText('①');
  await expect(graph.locator('[data-graph-id="EventA#1"]')).toHaveClass(/graph-copy/);
  // Chosen in the graph: the panel on the left shows it
  await a.locator('.graph-name').click();
  await expect(page.locator('#editor-props-title')).toHaveText('EventA');
  // Only one row
  await page.getByLabel('Filas: qué empieza cada una').selectOption({ label: 'Nada llega' });
  await expect(graph.locator('[data-graph-id="EventStart#0"]')).toHaveCount(0);
  await expect(graph.locator('[data-graph-id="EventLoose#0"]')).toBeVisible();
});

test('edits the scenario in the graph, and every change is one step back', async ({ page, isMobile }) => {
  // The graph is for a computer or a big tablet, as the editor is: a phone shows a corner of it
  test.skip(isMobile, 'The graph needs a wide screen');
  await openScenario(page);
  const graph = await openGraph(page);
  const undo = page.getByRole('button', { name: 'Deshacer' });
  const title = page.locator('#editor-props-title');

  // A button's port, pressed: a new event at the end of that button's list, chosen
  await graph.locator('[data-graph-id="EventWin#0"] .graph-port').click();
  await expect(title).toHaveText('Event0');
  await expect(undo).toHaveAttribute('title', 'Evento nuevo desde EventWin');
  await page.locator('.editor-components').getByRole('button', { name: 'EventWin' }).click();
  expect(await sectionOf(page)).toContain('event1=Event0');

  // Dragged from a port onto another event: linked
  await page.getByLabel('Filas: qué empieza cada una').selectOption({ index: 1 });
  const port = graph.locator('[data-graph-id="EventStart#0"] .graph-port');
  const target = graph.locator('[data-graph-id="EventWin#0"] .graph-name');
  await port.hover();
  await page.mouse.down();
  const box = (await target.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(undo).toHaveAttribute('title', 'EventStart lleva a EventWin');
  await page.locator('.editor-components').getByRole('button', { name: 'EventStart' }).click();
  expect(await sectionOf(page)).toContain('event1=EventA EventB EventWin');

  // A link chosen: an event put in the middle, then the link taken away with Delete
  await graph.locator('.graph-edge-remove, .graph-edge-add').first().waitFor({ state: 'attached' }).catch(() => {});
  const edge = graph.locator('.graph-edge-button .graph-edge-hit').first();
  await edge.dispatchEvent('pointerdown', { button: 0, pointerId: 1, bubbles: true });
  await graph.getByRole('button', { name: 'Un evento en medio' }).click();
  await expect(undo).toHaveAttribute('title', /^Un evento entre /);
  await undo.click();
  await edge.dispatchEvent('pointerdown', { button: 0, pointerId: 1, bubbles: true });
  await graph.getByRole('button', { name: 'Quitar el enlace' }).click();
  await expect(undo).toHaveAttribute('title', /ya no lleva a/);

  // The background's menu makes a component nothing leads to yet
  const view = (await graph.boundingBox())!;
  await page.mouse.click(view.x + view.width - 260, view.y + 24, { button: 'right' });
  await page.getByRole('menuitem', { name: '{Nuevo Evento}' }).click();
  await expect(title).toHaveText(/^Event\d$/);
});

test('lists the changes in the history and goes back to one, and lists what was selected latest first', async ({ page }) => {
  await openScenario(page);
  const list = page.locator('.editor-components');
  await list.getByRole('button', { name: '{Nuevo Evento}' }).click();
  await list.getByRole('button', { name: '{Nuevo Evento}' }).click();
  await list.getByRole('button', { name: 'EventA', exact: true }).click();

  await page.getByRole('tab', { name: 'Historial' }).click();
  const steps = page.getByRole('list', { name: 'Historial' });
  await expect(steps.locator('.editor-step')).toHaveText(['Ahora', 'Nuevo Evento', 'Nuevo Evento']);
  // Back to before the first: both new events go, and they wait above, greyed, to come back
  await steps.locator('.editor-step').nth(2).click();
  await expect(steps.locator('.editor-step')).toHaveText(['Nuevo Evento', 'Nuevo Evento', 'Ahora']);
  await expect(page.getByRole('button', { name: 'Deshacer' })).toBeDisabled();
  await steps.locator('.editor-step').first().click();
  await expect(steps.locator('.editor-step')).toHaveText(['Ahora', 'Nuevo Evento', 'Nuevo Evento']);

  await page.getByRole('tab', { name: 'Selecciones' }).click();
  const selected = page.getByRole('list', { name: 'Selecciones' });
  await expect(selected.locator('.editor-step').first()).toContainText('EventA');
  await expect(selected.locator('.editor-step').nth(1)).toContainText('Event1');
  await selected.locator('.editor-step').nth(1).click();
  await expect(page.locator('#editor-props-title')).toHaveText('Event1');
  await expect(selected.locator('.editor-step').first()).toContainText('Event1');
});

test('shows the UI elements on a screen as a game lays them out, and places one by dragging it', async ({ page }) => {
  await openScenario(page);
  await page.locator('.editor-components').getByRole('button', { name: 'UIText' }).click();
  await page.getByRole('button', { name: 'Verla en la pantalla' }).click();
  const stage = page.getByRole('region', { name: 'La pantalla: ver y colocar las interfaces' });
  await expect(stage.getByLabel('Pantalla de')).toHaveValue('EventStart');
  const element = stage.locator('[data-stage-ui="UIText"]');
  // The chosen one's frame and name go over every element, which keep the order the game adds them in
  await expect(stage.locator('.editor-stage-frame .editor-stage-name')).toHaveText('UIText');
  await expect(element).toContainText('Hola');
  await element.scrollIntoViewIfNeeded();
  const box = (await element.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2, { steps: 6 });
  await page.mouse.up();
  await expect(page.getByRole('button', { name: 'Deshacer' })).toHaveAttribute('title', 'Mover UIText');
  expect(await sectionOf(page)).toMatch(/xposition=0\.\d+/);
  // The arrows move it a hundredth at a time
  await element.click();
  await page.keyboard.press('ArrowDown');
  expect(await sectionOf(page)).toContain('yposition=0.01');
  await stage.getByRole('button', { name: 'Mapa' }).click();
  await expect(stage).toHaveCount(0);
});
