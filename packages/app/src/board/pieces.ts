// What each object on the board is, so that the board can draw it without its picture: a tile, a token, a door, a
// highlight, a monster or an item. The engine's GameObject only holds what Unity's would (a name, a tag, a picture),
// so this looks at the quest component it belongs to. Not ported from Valkyrie.
import { Game, ItemData, Path, Quest, ValkyrieConstants, type GameObject } from '@universalis/engine';
import { nameOf } from '../ui/text.ts';
import { descentTile, type DescentTile } from './descentTiles.ts';
import { schematicTile, type SchematicTile } from './schematicTiles.ts';

export type Piece =
  | { kind: 'tile'; tile: SchematicTile | undefined; outside: boolean; label: string }
  | { kind: 'squares'; tile: DescentTile; outside: boolean; label: string }
  | { kind: 'token'; label: string }
  | { kind: 'door' }
  | { kind: 'target' }
  | { kind: 'frame'; oval: boolean }
  | { kind: 'pill' }
  | { kind: 'monster'; label: string }
  | { kind: 'item'; label: string }
  | { kind: 'picture'; label: string };

/** The quest components on the board, by the object Unity would have drawn for them. */
export function componentsByObject(quest: Quest | null): Map<GameObject, Quest.BoardComponent> {
  const components = new Map<GameObject, Quest.BoardComponent>();
  if (quest === null) return components;
  for (const component of quest.boardItems.values()) {
    if (component.unityObject !== null) components.set(component.unityObject, component);
  }
  return components;
}

export function describe(gameObject: GameObject, component: Quest.BoardComponent | undefined): Piece {
  if (component instanceof Quest.Tile) {
    const side = component.cTile;
    const outside = side.containsTrait('outside') && !side.containsTrait('inside');
    const squares = Game.get().gameType.typeName() === ValkyrieConstants.typeDescent ? descentTile(side.image) : undefined;
    if (squares !== undefined) return { kind: 'squares', tile: squares, outside, label: nameOf(side.name) };
    return { kind: 'tile', tile: schematicTile(side.image), outside, label: nameOf(side.name) };
  }
  if (component instanceof Quest.Token) {
    const token = component.qToken;
    if (token.customImage.length > 0) return { kind: 'token', label: words(fileName(token.customImage)) };
    return { kind: 'token', label: tokenLabel(token.tokenName) };
  }
  if (component instanceof Quest.Door) return { kind: 'door' };
  const resource = gameObject.image?.resource?.toLowerCase() ?? null;
  if (resource === 'sprites/target') return { kind: 'target' };
  // Valkyrie: TokenBoard.cs AddPlacedMonsterImg, under a monster of two squares in a row (sprites/borders/…)
  if (resource?.endsWith('empty_monster_1x2')) return { kind: 'pill' };
  if (resource !== null) return { kind: 'frame', oval: resource.endsWith('2x3') };
  const picture = gameObject.image?.sprite?.name ?? '';
  // Valkyrie: TokenBoard.cs AddItem names its object 'item' + the QItem
  if (gameObject.name.startsWith('item')) {
    const item = Game.get().currentQuest?.itemSelect.get(gameObject.name.substring(4));
    if (item !== undefined && Game.get().cd.containsKey(ItemData, item)) return { kind: 'item', label: nameOf(Game.get().cd.get(ItemData, item).name) };
  }
  // Valkyrie: TokenBoard.cs AddPlacedMonsterImg names its object 'MonsterSpawn' + the place
  if (gameObject.name.startsWith('MonsterSpawn')) return { kind: 'monster', label: words(fileName(picture)) };
  return { kind: 'picture', label: words(fileName(picture)) };
}

/** A token type as words: TokenSearch reads "Search", and a monster used as a token, MonsterDeepOne, "Deep One". */
function tokenLabel(tokenName: string): string {
  return tokenName.replace(/^(Token|Monster)(?=[A-Z])/, '').replace(/([a-z])([A-Z0-9])/g, '$1 $2');
}

/** What a picture shows, from its file name, for a placeholder or a screen reader. */
export function pictureLabel(path: string): string {
  return words(fileName(path));
}

function fileName(path: string): string {
  return Path.getFileNameWithoutExtension(path.replace(/\\/g, '/'));
}

/** A file name as words: Monster_Deep_One reads "Deep One", Tile_Attic_MAD20 reads "Attic". */
function words(name: string): string {
  return name
    .replace(/^(Monster|Tile|Token|Item|Img)_/i, '')
    .replace(/_MAD\d+\w*$/i, '')
    .replace(/[_-]+/g, ' ')
    .trim();
}
