// Characterization tests of Descent's board, written from Valkyrie's C# (Quest.Tile, Quest.Door and
// TokenBoard.AddPlacedMonsterImg), which has no NUnit tests for them. Not ported from Valkyrie. The tiles of Affairs of
// Wizards (referencias/descargas) are placed with pictures of the import's size, and their squares (the app's
// schematic-tiles-d2e.json, found where a Descent import is) must fall on Descent's grid without overlapping; the
// monster places of a small quest written here get Valkyrie's frames; and every sprite the board loads is in Valkyrie.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  Application,
  ContentData,
  ExtractManager,
  File,
  Game,
  GameStateManager,
  HeadlessUI,
  Quest,
  QuestData,
  Random,
  Resources,
  RoundController,
  ValkyrieDebug,
  standInFile,
  type GameObject,
} from '@universalis/engine';
import { createEnvironment, type Environment } from '../tools/battery/environment.ts';
import { startQuest } from '../tools/battery/start.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const AFFAIRS = join(root, 'referencias/descargas/D2E/escenarios/affairsofwizards.valkyrie');
const RESOURCES = join(root, 'referencias/valkyrie/unity/Assets');

interface DescentTile {
  w: number;
  h: number;
  left: number;
  top: number;
  pps: number;
  x: number;
  y: number;
  rows: string[];
}

/** The app's Descent tiles, by picture file name in lower case. */
const tiles = new Map(
  Object.entries((JSON.parse(readFileSync(join(root, 'packages/app/src/board/schematic-tiles-d2e.json'), 'utf8')) as { tiles: Record<string, DescentTile> }).tiles).map(
    ([picture, tile]) => [picture.substring(picture.lastIndexOf('/') + 1).toLowerCase(), tile],
  ),
);

function fileName(path: string): string {
  return path.substring(path.lastIndexOf('/') + 1).replace(/\.[^.]*$/, '').toLowerCase();
}

/** A stand-in of the import's size for its tile pictures, as the app's schematic mode gives them. */
function importPicture(relative: string): Uint8Array {
  const tile = tiles.get(fileName(relative));
  return tile === undefined ? standInFile(relative) : standInFile(relative, tile.w, tile.h);
}

/** HeadlessUI, keeping what goes on the token canvas. */
class BoardUI extends HeadlessUI {
  readonly tokens: GameObject[] = [];

  override tokenCanvasAdd(gameObject: GameObject): void {
    super.tokenCanvasAdd(gameObject);
    this.tokens.push(gameObject);
  }
}

/** The board squares a tile covers, from its picture's squares where Quest.Tile has put the picture. */
function boardSquares(tile: Quest.Tile): [number, number][] {
  const data = tiles.get(fileName(tile.cTile.image))!;
  const { position, rotation } = tile.unityObject!.transform;
  const radians = (rotation * Math.PI) / 180;
  const squares: [number, number][] = [];
  data.rows.forEach((row, j) =>
    [...row].forEach((c, i) => {
      if (c !== '#') return;
      // The square's centre from the picture's, in board units (y up)
      const u = (data.left + data.pps * (data.x + i + 0.5) - data.w / 2) / data.pps;
      const v = -(data.top + data.pps * (data.y + j + 0.5) - data.h / 2) / data.pps;
      squares.push([position.x + u * Math.cos(radians) - v * Math.sin(radians), position.y + u * Math.sin(radians) + v * Math.cos(radians)]);
    }),
  );
  return squares;
}

let env: Environment;
let stopLog: () => void;

describe('DescentBoardTests', () => {
  beforeAll(() => {
    env = createEnvironment('D2E', join(root, 'packages', 'engine', 'data'), [], importPicture);
  }, 120_000);

  beforeEach(() => {
    env.game.roundControl = new RoundController();
    env.game.moraleDisplay = null;
    Application.fatalErrors.length = 0;
    Random.initState(1);
    stopLog = ValkyrieDebug.onLog(() => {});
  });

  afterEach(() => {
    stopLog();
  });

  it.skipIf(!existsSync(AFFAIRS))('Tiles_OfAffairsOfWizards_MeetSquareBySquareOnTheGrid', () => {
    const download = ContentData.downloadPath() + '/affairsofwizards.valkyrie';
    env.vfs.writeFile(download, () => readFileSync(AFFAIRS), statSync(AFFAIRS).size);
    const extracted = ExtractManager.extractSinglePackageFull(download);
    expect(startQuest(env, extracted).status).toBe('ok');
    const quest = Game.get().currentQuest!;
    // Every tile of the quest on the board
    quest.add([...quest.qd.components.values()].filter((c) => c instanceof QuestData.Tile).map((c) => c.sectionName));
    const placed = [...quest.boardItems.values()].filter((c) => c instanceof Quest.Tile);
    expect(placed).toHaveLength(15);

    const owner = new Map<string, string>();
    for (const tile of placed) {
      // Each square's centre on a whole board point (TileOnGrid), where no other tile has a square
      for (const [x, y] of boardSquares(tile)) {
        expect(Math.abs(x - Math.round(x)), `${tile.qTile.sectionName} at ${x}, ${y}`).toBeLessThan(0.001);
        expect(Math.abs(y - Math.round(y)), `${tile.qTile.sectionName} at ${x}, ${y}`).toBeLessThan(0.001);
        const at = `${Math.round(x)},${Math.round(y)}`;
        expect(owner.get(at), `${tile.qTile.sectionName} and ${owner.get(at)} at ${at}`).toBeUndefined();
        owner.set(at, tile.qTile.sectionName);
      }
    }
    // And each tile meets another along a side
    for (const tile of placed) {
      const name = tile.qTile.sectionName;
      const touches = [...owner].some(([at, other]) => {
        if (other !== name) return false;
        const [x, y] = at.split(',').map(Number) as [number, number];
        return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => (owner.get(`${x + dx!},${y + dy!}`) ?? name) !== name);
      });
      expect(touches, name).toBe(true);
    }
  });

  it('PlacedMonster_GetsValkyriesFramesAndCircles', () => {
    const ui = new BoardUI();
    env.game.ui = ui;
    const folder = '/AppData/Valkyrie/D2E/Editor/DescentBoardTest';
    File.writeAllText(folder + '/quest.ini', '[Quest]\nformat=21\ntype=D2E\ndefaultlanguage=English\nminhero=2\n\n[QuestText]\nLocalization.English.txt\n\n[QuestData]\nevents.ini\n');
    File.writeAllText(folder + '/Localization.English.txt', '.,English\nquest.name,Board test\nSpawnBarghest.text,Barghests.\nSpawnBarghest.button1,Continue\n');
    File.writeAllText(
      folder + '/events.ini',
      [
        '[SpawnBarghest]',
        'trigger=EventStart',
        'monster=MonsterBarghest',
        'placement2=MPlaceMaster MPlaceMinion',
        'xposition=3',
        'yposition=2',
        'buttons=1',
        'event1=',
        '',
        '[MPlaceMaster]',
        'xposition=3',
        'yposition=2',
        'master=true',
        '',
        '[MPlaceMinion]',
        'xposition=6',
        'yposition=2',
        'rotate=true',
        '',
      ].join('\n'),
    );
    GameStateManager.Quest.start(new QuestData.Quest(folder));
    const game = Game.get();
    game.heroCanvas.heroSelection!.select('HeroAshrian');
    game.heroCanvas.heroSelection!.select('HeroAvricAlbright');
    game.endSelection();
    const classes = ui.lastClassSelection!;
    classes.select(0, 'ClassDisciple');
    classes.select(1, 'ClassSpiritSpeaker');
    classes.finished();

    // The barghest takes two squares in a row: under each place a pill, over it its picture at 0.83 and a frame
    const at = (name: string) => ui.tokens.filter((o) => o.name === name);
    const [circle, frame] = at('MonsterSpawnBorderMPlaceMaster');
    const [monster] = at('MonsterSpawnMPlaceMaster');
    expect(circle!.image!.resource).toBe('sprites/borders/Empty_Monster_1x2');
    expect(circle!.image!.color).toMatchObject({ r: 1, g: 0, b: 0, a: 1 });
    expect(circle!.image!.sizeDelta).toMatchObject({ x: Math.fround(2 * 1.08), y: Math.fround(1.08) });
    expect(monster!.image!.sprite!.name).toMatch(/Monster_Barghest_Placement/);
    expect(monster!.image!.sizeDelta).toMatchObject({ x: Math.fround(2 * 0.83), y: Math.fround(0.83) });
    expect(frame!.image!.resource).toBe('sprites/borders/Frame_Monster_1x2');
    expect(frame!.image!.sizeDelta).toMatchObject({ x: 2, y: 1 });
    // From the place's square to the right, over the two squares
    for (const piece of [circle!, monster!, frame!]) expect(piece.transform.position).toMatchObject({ x: 3.5, y: 2 });
    // In the order Valkyrie parents them: the circle under the picture, the frame on top
    expect(ui.tokens.indexOf(circle!)).toBeLessThan(ui.tokens.indexOf(monster!));
    expect(ui.tokens.indexOf(monster!)).toBeLessThan(ui.tokens.indexOf(frame!));

    // A minion's circle is white; a place that rotates turns down from its square
    const [minionCircle, minionFrame] = at('MonsterSpawnBorderMPlaceMinion');
    expect(minionCircle!.image!.color).toMatchObject({ r: 1, g: 1, b: 1, a: 1 });
    for (const piece of [minionCircle!, minionFrame!, ...at('MonsterSpawnMPlaceMinion')]) {
      expect(piece.transform.rotation).toBe(-90);
      expect(piece.transform.position.x).toBeCloseTo(6, 5);
      expect(piece.transform.position.y).toBeCloseTo(1.5, 5);
    }
  });

  it.skipIf(!existsSync(RESOURCES))('BoardSprites_AreValkyriesOwn', () => {
    for (const name of [
      'sprites/door',
      'sprites/target',
      'sprites/borders/Frame_Monster_1x1',
      'sprites/borders/Frame_Monster_1x2',
      'sprites/borders/Frame_Monster_2x3',
      'sprites/borders/Empty_Monster_1x2',
      'sprites/element1',
      'sprites/monster_duplicate_6',
    ]) {
      const path = Resources.load(name);
      expect(path, name).not.toBeNull();
      // With its letter case: Valkyrie's repository is read by address, which minds it
      expect(existsSync(join(RESOURCES, path!)), path!).toBe(true);
    }
  });
});
