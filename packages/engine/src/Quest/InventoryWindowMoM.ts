// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/InventoryWindowMoM.cs
// Mansions' items window lists the items that can be inspected; the app draws it (game.ui.inventoryWindowMoM).
import { ContentData } from '../Content/ContentData.ts';
import { ItemData } from '../Content/ContentTypes.ts';
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { dictGet } from '../platform/CSharp.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';

// Next stage button is used by MoM to move between investigators and monsters
// Valkyrie: InventoryWindowMoM.cs InventoryWindowMoM
export class InventoryWindowMoM {
  // Construct and display
  constructor() {
    this.update();
  }

  // Valkyrie: InventoryWindowMoM.cs InventoryWindowMoM.Update
  update(): void {
    Destroyer.dialog();
    const game = Game.get();
    // Each item's picture is read for its size
    // Not in Valkyrie (16 October 2026): a missing one threw (NullReferenceException); it is logged and the app draws a placeholder
    for (const s of game.currentQuest!.itemInspect.keys()) {
      if (ContentData.fileToTexture(game.cd.get(ItemData, s).image) === null) ValkyrieDebug.log('Warning: Missing item picture: ' + game.cd.get(ItemData, s).image);
    }
    game.ui.inventoryWindowMoM(this);
  }

  /** Not in Valkyrie: the items the window shows, in the order Quest.itemInspect keeps them. */
  items(): string[] {
    return [...Game.get().currentQuest!.itemInspect.keys()];
  }

  // Valkyrie: InventoryWindowMoM.cs InventoryWindowMoM.Inspect
  inspect(item: string): void {
    Destroyer.dialog();
    const quest = Game.get().currentQuest!;
    quest.save();
    quest.eManager.queueEvent(dictGet(quest.itemInspect, item));
  }
}
