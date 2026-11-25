// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/EditorComponentTile.cs
// Only what the tile's panel does to it, and the choices its selection windows offer; the panel is the app's
// (editor/PiecePanel.tsx), which draws the tile again after each change (CurrentQuest.Remove and Add).
import { TileSideData } from '../Content/ContentTypes.ts';
import { QuestData } from '../Content/QuestData.ts';
import { Game } from '../Game.ts';
import { floatTryParse } from '../platform/CSharp.ts';
import { contentItem, type SelectionItem } from './SelectionTraits.ts';

export const EditorComponentTile = {
  /** Every side of the content, with those on the board and their backs shown as taken. */
  // Valkyrie: EditorComponentTile.cs EditorComponentTile.ChangeTileSide
  tileSideChoices(): SelectionItem[] {
    const game = Game.get();
    const used = new Set<string>();
    for (const c of game.currentQuest!.qd.components.values()) {
      if (c instanceof QuestData.Tile && c.tileSideName.length > 0) {
        used.add(c.tileSideName);
        if (game.cd.containsKey(TileSideData, c.tileSideName)) used.add(game.cd.get(TileSideData, c.tileSideName).reverse);
      }
    }
    return game.cd.values(TileSideData).map((side) => contentItem(side, used.has(side.sectionName)));
  },

  /** A side instead of a picture of its own. */
  // Valkyrie: EditorComponentTile.cs EditorComponentTile.SelectTileSide
  selectTileSide(tile: QuestData.Tile, side: string): void {
    tile.tileSideName = side.split(' ')[0]!;
    tile.customImage = '';
    tile.top = 0;
    tile.left = 0;
  },

  /** A quarter turn; a turn Valkyrie did not set goes to the next quarter it falls under. */
  // Valkyrie: EditorComponentTile.cs EditorComponentTile.TileRotate
  tileRotate(tile: QuestData.Tile): void {
    if (tile.rotation === 0) tile.rotation = 90;
    else if (tile.rotation > 0 && tile.rotation <= 100) tile.rotation = 180;
    else if (tile.rotation > 100 && tile.rotation <= 190) tile.rotation = 270;
    else tile.rotation = 0;
  },

  /** A picture of its own instead of a side (from EditorComponent.customImageChoices). */
  // Valkyrie: EditorComponentTile.cs EditorComponentTile.SelectCustomImage
  selectCustomImage(tile: QuestData.Tile, image: string): void {
    if (image === '{NONE}') {
      tile.customImage = '';
      tile.top = 0;
      tile.left = 0;
    } else {
      tile.customImage = image;
      tile.tileSideName = '';
    }
  },

  /** Reset: no picture of its own, and the content's first side. */
  // Valkyrie: EditorComponentTile.cs EditorComponentTile.ClearCustomImage
  clearCustomImage(tile: QuestData.Tile): void {
    tile.customImage = '';
    tile.tileSideName = Game.get().cd.keys(TileSideData)[0] ?? '';
    tile.top = 0;
    tile.left = 0;
  },

  /** Where the picture's squares start, typed: what is not a number is 0. */
  // Valkyrie: EditorComponentTile.cs EditorComponentTile.SetTop
  setTop(tile: QuestData.Tile, text: string): void {
    tile.top = Math.fround(floatTryParse(text).value);
  },

  // Valkyrie: EditorComponentTile.cs EditorComponentTile.SetLeft
  setLeft(tile: QuestData.Tile, text: string): void {
    tile.left = Math.fround(floatTryParse(text).value);
  },
};
