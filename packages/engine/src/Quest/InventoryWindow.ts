// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/InventoryWindow.cs
// Descent's items window: the party's items and its gold; the app draws it (game.ui.inventoryWindow).
import { ContentData } from '../Content/ContentData.ts';
import { ItemData } from '../Content/ContentTypes.ts';
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { Mathf } from '../platform/Mathf.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';

// Next stage button is used by MoM to move between investigators and monsters
// Valkyrie: InventoryWindow.cs InventoryWindow
export class InventoryWindow {
  // Construct and display
  constructor() {
    this.update();
  }

  // Valkyrie: InventoryWindow.cs InventoryWindow.Update
  update(): void {
    Destroyer.dialog();
    const game = Game.get();
    // Each item's picture is read for its size
    // Not in Valkyrie (16 October 2026): a missing one threw (NullReferenceException); it is logged and the app draws a placeholder
    for (const s of game.currentQuest!.items) {
      if (ContentData.fileToTexture(game.cd.get(ItemData, s).image) === null) ValkyrieDebug.log('Warning: Missing item picture: ' + game.cd.get(ItemData, s).image);
    }
    game.ui.inventoryWindow(this);
  }

  /** Not in Valkyrie: the items the window shows, in the order Quest.items keeps them. */
  items(): string[] {
    return [...Game.get().currentQuest!.items];
  }

  /** Not in Valkyrie: the gold it shows. */
  gold(): number {
    return Mathf.roundToInt(Game.get().currentQuest!.vars.getValue('$%gold'));
  }
}
