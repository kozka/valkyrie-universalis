// Arnés común: carga un escenario de Mansiones (QDIR) en el motor de Valkyrie Universalis (KIT) sin pantalla.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
// Arnés para jugar un escenario de Mansiones en el motor de Valkyrie Universalis (port de Valkyrie a TypeScript).
export const KIT = resolve(process.env.KIT ?? join(HERE, '..', 'valkyrie-universalis-kit', 'valkyrie-universalis'));
const imp = (p: string) => import(pathToFileURL(join(KIT, p)).href);
export const ENGINE = await imp('packages/engine/src/index.ts');
const { Application, File, GameStateManager, HeadlessUI, QuestData, Random, ValkyrieDebug, standInFile } = ENGINE;
const { RoundControllerMoM } = await imp('packages/module-mom/src/index.ts');
const { createEnvironment } = await imp('tools/battery/environment.ts');

if (!process.env.QDIR) { console.error('Indica la carpeta del escenario: QDIR=ruta (y KIT=ruta de valkyrie-universalis si no está junto a esta carpeta)'); process.exit(2); }
export const SRC = resolve(process.env.QDIR);
const QUEST = '/AppData/Valkyrie/MoM/Editor/LaNocheQueNoTermina';
const env = createEnvironment('MoM', join(KIT, 'packages', 'engine', 'data'), []);
export const log: string[] = [];
ValkyrieDebug.onLog((m) => { if (m) log.push(m); });

function mount(dir: string, rel = '') {
  for (const f of readdirSync(join(dir, rel))) {
    const p = join(dir, rel, f), r = rel ? rel + '/' + f : f;
    if (statSync(p).isDirectory()) { mount(dir, r); continue; }
    if (/\.(ini|txt)$/i.test(f)) File.writeAllText(QUEST + '/' + r, readFileSync(p, 'utf8'));
    else (env.vfs as any).writeFile(QUEST + '/' + r, () => standInFile(r), 10);
  }
}
export function start(heroes: string[], seed = 1) {
  const ui = new HeadlessUI(); const game = env.game; game.ui = ui; game.stageUI = null;
  game.roundControl = new RoundControllerMoM();
  Application.fatalErrors.length = 0; Random.initState(seed);
  mount(SRC);
  GameStateManager.Quest.start(new QuestData.Quest(QUEST));
  for (const h of heroes) game.heroCanvas.heroSelection!.select(h);
  game.endSelection(); game.questStartEvent();
  return { ui, game };
}
