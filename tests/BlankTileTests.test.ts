// Not in Valkyrie: the advanced option that draws a blank tile where Valkyrie closes because a tile is missing
// (Quest.Tile.blankMissingTiles, Valkyrie issue 1513). Off, the game stops as in Valkyrie; on, it goes on.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Application, ContentData, ExtractManager, Game, Quest, QuestData, Random, RoundController, ValkyrieDebug, standInFile } from '@universalis/engine';
import { createEnvironment, type Environment } from '../tools/battery/environment.ts';
import { startQuest } from '../tools/battery/start.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const AFFAIRS = join(root, 'referencias/descargas/D2E/escenarios/affairsofwizards.valkyrie');

let env: Environment;
let stopLog: () => void;

/** Affairs of Wizards started, and one of its tiles, not yet on the board, given a TileSide nobody has. */
function startWithMissingTile(): { quest: Quest; name: string } {
  const download = ContentData.downloadPath() + '/affairsofwizards.valkyrie';
  env.vfs.writeFile(download, () => readFileSync(AFFAIRS), statSync(AFFAIRS).size);
  const extracted = ExtractManager.extractSinglePackageFull(download);
  expect(startQuest(env, extracted).status).toBe('ok');
  const quest = Game.get().currentQuest!;
  const tile = [...quest.qd.components.values()].find((c): c is QuestData.Tile => c instanceof QuestData.Tile && !quest.boardItems.has(c.sectionName))!;
  tile.tileSideName = 'TileSideNobodyHasThis';
  return { quest, name: tile.sectionName };
}

describe('BlankTileTests', () => {
  beforeAll(() => {
    env = createEnvironment('D2E', join(root, 'packages', 'engine', 'data'), [], (relative) => standInFile(relative));
  }, 120_000);

  beforeEach(() => {
    env.game.roundControl = new RoundController();
    env.game.moraleDisplay = null;
    Application.fatalErrors.length = 0;
    Random.initState(1);
    stopLog = ValkyrieDebug.onLog(() => {});
  });

  afterEach(() => {
    Quest.Tile.blankMissingTiles = false;
    stopLog();
  });

  it.skipIf(!existsSync(AFFAIRS))('MissingTileSide_StopsTheGame_AsInValkyrie', () => {
    const { quest, name } = startWithMissingTile();
    quest.add([name]);
    expect(Application.fatalErrors.map((e) => e.reason)).toEqual(['tileside-missing']);
  });

  it.skipIf(!existsSync(AFFAIRS))('MissingTileSide_WithTheOption_IsABlankTile', () => {
    Quest.Tile.blankMissingTiles = true;
    const { quest, name } = startWithMissingTile();
    quest.add([name]);
    expect(Application.fatalErrors).toEqual([]);
    const tile = quest.boardItems.get(name) as Quest.Tile;
    expect(tile).toBeInstanceOf(Quest.Tile);
    expect(tile.unityObject!.image!.sizeDelta.x).toBe(3);
    expect(tile.unityObject!.tag).toBe(Game.BOARD);
  });
});
