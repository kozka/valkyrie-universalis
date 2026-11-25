// Not in Valkyrie: the tiles a scenario uses, from its details, for a player who wants to have them ready before
// starting. It tells the map, so a spoiler warning comes first. Every quest.ini of the package is read (a campaign or a
// TLE scenario has several), each tile once, with how many copies one map needs at most; and, on top, about how big a
// table the largest map needs with all its tiles down. A tile of a pack the player's collection leaves out is shown
// apart, under its pack: scenarios like Possessed change their map with the packs the player has (#MoM1ET, #RN…), so
// those are only placed with the pack.
import { useState } from 'react';
import {
  CommonStringKeys,
  ContentData,
  Directory,
  ExtractManager,
  Game,
  type IniData,
  IniRead,
  ItemData,
  LocalizationRead,
  MonsterData,
  Path,
  Quest,
  QuestData,
  SearchOption,
  TileSideData,
  ValkyrieConstants,
  ValkyrieDebug,
} from '@universalis/engine';
import { startingFromKeptFiles } from '../host/storage.ts';
import { InfoTip } from '../ui/InfoTip.tsx';
import { Picture } from '../ui/Picture.tsx';
import { run } from '../ui/run.ts';
import { nameOf, uni } from '../ui/text.ts';

/**
 * About how many centimetres a unit of Valkyrie's board is on the table: Descent's square is about an inch, and
 * Mansions' tiles, measured by kozka, are 17.7 cm for 7 units (a square tile 17.7 × 17.7, the alley 17.7 × 8.85).
 */
const CM_PER_UNIT: Record<string, number> = { D2E: 2.5, MoM: 17.7 / 7 };

/** The table one map needs at most, all its tiles down at once: its width and depth in centimetres. */
interface Table {
  width: number;
  depth: number;
}

/** A tile's four corners on the board, placed as Quest.Tile places its picture (its size, its anchor square, its
 * rotation and its place), or null when its picture is not there to give its size. */
function tileCorners(tile: QuestData.Tile, side: TileSideData | undefined, questDir: string): [number, number][] | null {
  const game = Game.get();
  let cTile = side;
  let texture;
  if (tile.customImage.length > 0) {
    texture = ContentData.fileToTexture(Quest.findLocalisedMultimediaFile(tile.customImage, questDir));
    if (texture === null) return null;
    const dict = new Map<string, string>();
    dict.set('top', String(tile.top === 0 && tile.left === 0 ? texture.height / 2 : tile.top));
    dict.set('left', String(tile.top === 0 && tile.left === 0 ? texture.width / 2 : tile.left));
    cTile = new TileSideData(tile.customImage, dict, '');
  } else {
    if (cTile === undefined) return null;
    texture = ContentData.fileToTexture(cTile.image);
    if (texture === null) return null;
  }
  // Valkyrie: Quest.cs Tile.Tile (the sizes and moves of its picture)
  const vPPS = cTile.pxPerSquare;
  let hPPS = vPPS;
  if (cTile.aspect !== 0) hPPS = (vPPS * texture.width) / texture.height / cTile.aspect;
  let cx = (Math.trunc(texture.width / 2) - cTile.left) / hPPS;
  let cy = -(Math.trunc(texture.height / 2) - cTile.top) / vPPS;
  if (game.gameType.tileOnGrid()) {
    cx -= 0.5;
    cy += 0.5;
  }
  const w = texture.width / hPPS / 2;
  const h = texture.height / vPPS / 2;
  const r = (tile.rotation * Math.PI) / 180;
  const turn = (x: number, y: number): [number, number] => [x * Math.cos(r) - y * Math.sin(r) + tile.location.x, x * Math.sin(r) + y * Math.cos(r) + tile.location.y];
  return [turn(cx - w, cy - h), turn(cx + w, cy - h), turn(cx + w, cy + h), turn(cx - w, cy + h)];
}

interface UsedTile {
  key: string;
  name: string;
  picture: string;
  copies: number;
  /** The pack it comes from when the collection leaves that pack out, so the game has not loaded it. */
  pack?: string;
  /** In no pack at all: only its name in the scenario can be shown. */
  unknown?: boolean;
}

/**
 * A tile side of a pack the game has not loaded (the collection leaves it out), read from the pack's own files as
 * ContentLoader.LoadContentPack would, and that pack's id; null when no pack has it.
 */
function unloadedTileSide(name: string, read: Map<string, IniData | null>): { side: TileSideData; pack: string } | null {
  const cd = Game.get().cd;
  for (const pack of cd.allPacks) {
    if (pack.id === null || cd.loadedPacks.has(pack.id)) continue;
    for (const ini of pack.iniFiles ?? []) {
      if (!read.has(ini)) read.set(ini, IniRead.readFromIni(ini));
      const data = read.get(ini);
      if (data === null || data === undefined) continue;
      for (const section of [name, 'TileSide' + name]) {
        const content = data.get(section);
        if (content !== null && content !== undefined && section.startsWith(TileSideData.type)) {
          return { side: new TileSideData(section, content, Path.getDirectoryName(ini) ?? '', [pack.id]), pack: pack.id };
        }
      }
    }
  }
  return null;
}

/** A monster or an item the scenario names (not those it draws at random by traits). */
interface UsedThing {
  key: string;
  name: string;
  picture: string;
}

/** The monsters a spawn names: the scenario's own custom ones by their base, or the game's. */
function spawnMonsters(spawn: QuestData.Spawn, data: QuestData, found: Map<string, UsedThing>): void {
  const cd = Game.get().cd;
  for (const type of spawn.mTypes) {
    if (found.has(type)) continue;
    const custom = data.components.get(type);
    if (custom instanceof QuestData.CustomMonster) {
      const base = cd.tryGet(MonsterData, custom.baseMonster);
      const own = custom.getImagePath();
      found.set(type, { key: type, name: custom.monsterName.translate(), picture: own.length > 0 ? own : (base?.image ?? '') });
      continue;
    }
    const monster = cd.tryGet(MonsterData, type);
    found.set(type, monster !== undefined ? { key: type, name: nameOf(monster.name), picture: monster.image } : { key: type, name: type.replace(/^Monster/, ''), picture: '' });
  }
}

/** The items a quest item names (itemname=), each once. */
function namedItems(item: QuestData.QItem, found: Map<string, UsedThing>): void {
  const cd = Game.get().cd;
  for (const name of item.itemName) {
    if (found.has(name)) continue;
    const data = cd.tryGet(ItemData, name);
    found.set(name, data !== undefined ? { key: name, name: nameOf(data.name), picture: data.image } : { key: name, name: name.replace(/^Item(Unique|Common|Spell|Condition)?/, ''), picture: '' });
  }
}

/** The tiles of every map of the quest, its package extracted first as Game.StartQuest does, with its monsters and items. */
function questTiles(q: QuestData.Quest): { tiles: UsedTile[]; table: Table | null; monsters: UsedThing[]; items: UsedThing[] } {
  const game = Game.get();
  let folder = q.path;
  const file = Path.getFileName(q.path) ?? '';
  if (Path.getExtension(file) === ValkyrieConstants.ScenarioDownloadContainerExtension) {
    folder = ExtractManager.extractSinglePackageFull(Path.combine(ContentData.downloadPath(), file));
  }
  const iniFiles = Directory.exists(folder) ? Directory.getFiles(folder, 'quest.ini', SearchOption.AllDirectories) : [];
  const found = new Map<string, UsedTile>();
  const monsters = new Map<string, UsedThing>();
  const items = new Map<string, UsedThing>();
  const read = new Map<string, IniData | null>();
  let table: Table | null = null;
  const cm = CM_PER_UNIT[game.gameType.typeName()] ?? 2.5;
  for (const ini of iniFiles) {
    let data: QuestData;
    try {
      data = new QuestData(ini);
    } catch (e) {
      ValkyrieDebug.log('Warning: could not read ' + ini + ' for its tiles: ' + String(e));
      continue;
    }
    const here = new Map<string, number>();
    const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    for (const component of data.components.values()) {
      if (component instanceof QuestData.Spawn) spawnMonsters(component, data, monsters);
      if (component instanceof QuestData.QItem) namedItems(component, items);
      if (!(component instanceof QuestData.Tile)) continue;
      const side = component.customImage.length > 0 ? undefined : (game.cd.tryGet(TileSideData, component.tileSideName) ?? game.cd.tryGet(TileSideData, 'TileSide' + component.tileSideName));
      for (const [x, y] of tileCorners(component, side, Path.getDirectoryName(ini) ?? folder) ?? []) {
        box.minX = Math.min(box.minX, x);
        box.maxX = Math.max(box.maxX, x);
        box.minY = Math.min(box.minY, y);
        box.maxY = Math.max(box.maxY, y);
      }
      let tile: UsedTile;
      if (component.customImage.length > 0) {
        const picture = Path.combine(Path.getDirectoryName(ini) ?? folder, component.customImage);
        tile = { key: 'custom:' + component.customImage.toLowerCase(), name: Path.getFileNameWithoutExtension(component.customImage.replace(/\\/g, '/')), picture, copies: 0 };
      } else if (side !== undefined) {
        tile = { key: component.tileSideName, name: nameOf(side.name), picture: side.image, copies: 0 };
      } else {
        // Not loaded: of a pack the collection leaves out, if one has it. It stays out of the table's size
        const other = found.has(component.tileSideName) ? null : unloadedTileSide(component.tileSideName, read);
        tile =
          other !== null
            ? { key: component.tileSideName, name: nameOf(other.side.name), picture: other.side.image, copies: 0, pack: other.pack }
            : { key: component.tileSideName, name: component.tileSideName, picture: '', copies: 0, unknown: true };
      }
      here.set(tile.key, (here.get(tile.key) ?? 0) + 1);
      if (!found.has(tile.key)) found.set(tile.key, tile);
    }
    for (const [key, count] of here) found.get(key)!.copies = Math.max(found.get(key)!.copies, count);
    if (box.maxX > box.minX) {
      const a = (box.maxX - box.minX) * cm;
      const b = (box.maxY - box.minY) * cm;
      const map = { width: Math.max(a, b), depth: Math.min(a, b) };
      if (table === null || map.width * map.depth > table.width * table.depth) table = map;
    }
  }
  // Reading a quest.ini puts its texts in place of the details' ones (QuestData.LoadQuestData): put them back
  LocalizationRead.removeDictionary('qst');
  LocalizationRead.addDictionary('qst', q.localizationDict);
  const byName = <T extends { name: string }>(list: Iterable<T>) => [...list].sort((a, b) => a.name.localeCompare(b.name));
  return { tiles: byName(found.values()), table, monsters: byName(monsters.values()), items: byName(items.values()) };
}

type Shown = { step: 'shown'; tiles: UsedTile[]; table: Table | null; monsters: UsedThing[]; items: UsedThing[] };
type Step = { step: 'closed' } | { step: 'warning' } | { step: 'loading' } | Shown;

/** What the window shows: the tiles, or what the scenario names of its monsters or its items. */
type Tab = 'tiles' | 'monsters' | 'items';

/** A grid of monsters or items, with their pictures. */
function ThingGrid({ things, empty }: { things: UsedThing[]; empty: string }) {
  if (things.length === 0) return <p>{empty}</p>;
  return (
    <ul className="tiles-grid things-grid">
      {things.map((thing) => (
        <li key={thing.key}>
          <Picture file={thing.picture} name={thing.name} className="tile-picture" decorative />
          <span className="tile-name">{thing.name}</span>
        </li>
      ))}
    </ul>
  );
}

/** Centimetres rounded up to the next 5: a table is a little bigger rather than a little short. */
function roundCm(value: number): number {
  return Math.ceil(value / 5) * 5;
}

/** A grid of tiles, with how many copies of each one map needs. */
function TileGrid({ tiles }: { tiles: UsedTile[] }) {
  return (
    <ul className="tiles-grid">
      {tiles.map((tile) => (
        <li key={tile.key}>
          <Picture file={tile.picture} name={tile.name} className="tile-picture" decorative />
          <span className="tile-name">
            {tile.name}
            {tile.copies > 1 && <span className="tile-copies"> ×{tile.copies}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The tiles in groups: the scenario's own first, then those of each pack the collection leaves out, then unknown ones. */
function TileGroups({ tiles }: { tiles: UsedTile[] }) {
  const cd = Game.get().cd;
  const own = tiles.filter((t) => t.pack === undefined && t.unknown !== true);
  const packs = [...new Set(tiles.flatMap((t) => (t.pack !== undefined ? [t.pack] : [])))];
  const unknown = tiles.filter((t) => t.unknown === true);
  return (
    <>
      {own.length > 0 && <TileGrid tiles={own} />}
      {packs.map((pack) => (
        <section key={pack} className="tiles-optional">
          <h3>{uni('TILES_OPTIONAL', cd.getContentName(pack))}</h3>
          <p className="tiles-optional-note">{uni('TILES_OPTIONAL_NOTE')}</p>
          <TileGrid tiles={tiles.filter((t) => t.pack === pack)} />
        </section>
      ))}
      {unknown.length > 0 && (
        <section className="tiles-optional">
          <h3>{uni('TILES_UNKNOWN')}</h3>
          <TileGrid tiles={unknown} />
        </section>
      )}
    </>
  );
}

/** The button, its spoiler warning and the tiles. */
export function QuestTilesButton({ quest }: { quest: QuestData.Quest }) {
  const [state, setState] = useState<Step>({ step: 'closed' });
  const [tab, setTab] = useState<Tab>('tiles');
  const show = () => {
    setTab('tiles');
    setState({ step: 'loading' });
    // Not read from storage yet: the package is read first, as Start does
    const name = Path.getFileName(quest.path) ?? '';
    const packages = Path.getExtension(name) === ValkyrieConstants.ScenarioDownloadContainerExtension ? [Path.combine(ContentData.downloadPath(), name)] : [];
    void startingFromKeptFiles(packages, () => run(() => setState({ step: 'shown', ...questTiles(quest) })));
  };
  return (
    <>
      <button type="button" className="button tiles-button" onClick={() => setState({ step: 'warning' })}>
        {uni('TILES_SHOW')}
      </button>
      {state.step === 'warning' && (
        <div className="window-layer">
          <section className="window panel tiles-warning" role="alertdialog" aria-labelledby="tiles-warning-text">
            <p id="tiles-warning-text">{uni('TILES_SPOILER')}</p>
            <div className="choices">
              <button type="button" className="button primary" onClick={show}>
                {uni('TILES_CONTINUE')}
              </button>
              <button type="button" className="button" onClick={() => setState({ step: 'closed' })}>
                {CommonStringKeys.CANCEL.translate()}
              </button>
            </div>
          </section>
        </div>
      )}
      {(state.step === 'loading' || state.step === 'shown') && (
        <div className="window-layer">
          <section className="window panel tiles-window" role="dialog" aria-modal="true" aria-labelledby="tiles-title">
            <h2 id="tiles-title">{uni(tab === 'tiles' ? 'TILES_TITLE' : tab === 'monsters' ? 'MONSTERS_TITLE' : 'ITEMS_TITLE')}</h2>
            {state.step === 'shown' && (
              <div className="tiles-tabs" role="group">
                {(['tiles', 'monsters', 'items'] as const).map((t) => (
                  <button key={t} type="button" className="button" aria-pressed={tab === t} onClick={() => setTab(t)}>
                    {uni(t === 'tiles' ? 'TILES_TAB' : t === 'monsters' ? 'MONSTERS_SHOW' : 'ITEMS_SHOW')}
                  </button>
                ))}
              </div>
            )}
            {state.step === 'loading' && <p role="status">{uni('TILES_LOADING')}</p>}
            {state.step === 'shown' && tab === 'monsters' && (
              <>
                <p className="tiles-table-note">{uni('MONSTERS_NOTE')}</p>
                <ThingGrid things={state.monsters} empty={uni('MONSTERS_NONE')} />
              </>
            )}
            {state.step === 'shown' && tab === 'items' && (
              <>
                <p className="tiles-table-note">{uni('ITEMS_NOTE')}</p>
                <ThingGrid things={state.items} empty={uni('ITEMS_NONE')} />
              </>
            )}
            {state.step === 'shown' && tab === 'tiles' && state.table !== null && (
              <p className="tiles-table">
                <span className="tiles-table-size">
                  {uni('TILES_TABLE', roundCm(state.table.width), roundCm(state.table.depth))}
                  <InfoTip text={uni('TILES_TABLE_INFO')} />
                </span>
                <span className="tiles-table-note">{uni('TILES_TABLE_NOTE')}</span>
              </p>
            )}
            {state.step === 'shown' && tab === 'tiles' && state.tiles.length === 0 && <p>{uni('TILES_NONE')}</p>}
            {state.step === 'shown' && tab === 'tiles' && state.tiles.length > 0 && <TileGroups tiles={state.tiles} />}
            <button type="button" className="button primary" onClick={() => setState({ step: 'closed' })}>
              {CommonStringKeys.CLOSE.translate()}
            </button>
          </section>
        </div>
      )}
    </>
  );
}
