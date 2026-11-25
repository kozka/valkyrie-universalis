// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/ShopInterface.cs
// The app draws the shop (game.ui.shopInterface) and its buttons call onButton, buy and sell. Update still reads the
// button colours and looks up every item and picture as the drawing does: a bad one throws in Valkyrie and stops the event.
import { ContentData } from '../Content/ContentData.ts';
import { ItemData } from '../Content/ContentTypes.ts';
import { QuestData } from '../Content/QuestData.ts';
import { Game } from '../Game.ts';
import { Color } from '../platform/Color.ts';
import { dictAdd, dictGet } from '../platform/CSharp.ts';
import { Mathf } from '../platform/Mathf.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { BoardComponent } from './BoardComponent.ts';
import { DialogWindow } from './DialogWindow.ts';

// Tokens are events that are tied to a token placed on the board
// Valkyrie: ShopInterface.cs ShopInterface
export class ShopInterface extends BoardComponent {
  eventData: QuestData.Event;
  /** Not in Valkyrie: the colours DrawButtons works out, one per button of the event. */
  buttons: DialogWindow.EventButton[] = [];

  // Construct with quest info and reference to Game
  constructor(items: string[], gameObject: Game, eventName: string) {
    super(gameObject);
    this.game = gameObject;
    const quest = this.game.currentQuest!;
    if (!quest.shops.has(eventName)) {
      const contentItems: string[] = [];
      for (const s of items) {
        if (quest.itemSelect.has(s)) {
          contentItems.push(quest.itemSelect.get(s)!);
        }
      }
      dictAdd(quest.shops, eventName, contentItems);
    }
    const component = dictGet(quest.qd.components, eventName);
    this.eventData = (component instanceof QuestData.Event ? component : null) as QuestData.Event;

    this.update();
  }

  // Valkyrie: ShopInterface.cs ShopInterface.GetEvent
  getEvent(): QuestData.Event | null {
    return null;
  }

  // Clean up
  // Valkyrie: ShopInterface.cs ShopInterface.Remove
  remove(): void {
    this.game.ui.destroyTag(Game.SHOP);
    this.game.currentQuest!.activeShop = '';
  }

  // Valkyrie: ShopInterface.cs ShopInterface.Update
  update(): void {
    this.remove();
    this.game.currentQuest!.activeShop = this.eventData.sectionName;
    // DrawButtons: the colours (with the same warning in the quest log). It puts their bytes, 0 to 255, in a Color, whose
    // channels Unity clamps to 1 when it draws: a channel that is not 0 is full
    this.buttons = this.eventData.buttons.map((data) => {
      const button = new DialogWindow.EventButton(data);
      const { r, g, b, a } = button.colour;
      button.colour = new Color(r > 0 ? 1 : 0, g > 0 ? 1 : 0, b > 0 ? 1 : 0, a > 0 ? 1 : 0);
      return button;
    });
    // DrawShopItems and DrawPartyItems: the lookups that can throw
    for (const itemName of dictGet(this.game.currentQuest!.shops, this.eventData.sectionName)) {
      ShopInterface.itemTexture(this.game.cd.get(ItemData, itemName));
    }
    for (const itemName of this.game.currentQuest!.items) {
      const itemData = this.game.cd.get(ItemData, itemName);
      if (itemData.containsTrait('relic')) continue;
      ShopInterface.itemTexture(itemData);
    }
    this.game.ui.shopInterface(this);
  }

  // Valkyrie: ShopInterface.cs ShopInterface.OnButton
  onButton(i: number): void {
    if (this.game.ui.findTag(Game.DIALOG)) return;
    this.game.currentQuest!.save();
    this.game.currentQuest!.eManager.endEvent(this.eventData, i);
  }

  // Valkyrie: ShopInterface.cs ShopInterface.GetPurchasePrice
  getPurchasePrice(item: ItemData): number {
    if (item.containsTrait('class')) {
      return 25;
    }
    return item.price;
  }

  // Valkyrie: ShopInterface.cs ShopInterface.GetSellPrice
  getSellPrice(item: ItemData): number {
    if (item.containsTrait('class')) {
      return 25;
    }

    if (this.game.currentQuest!.vars.getValue('$%sellratio') === 0) {
      return this.getPurchasePrice(item);
    }
    return Mathf.roundToInt(Math.fround(this.getPurchasePrice(item) * this.game.currentQuest!.vars.getValue('$%sellratio')));
  }

  // Valkyrie: ShopInterface.cs ShopInterface.Buy
  buy(item: string): void {
    if (this.game.ui.findTag(Game.DIALOG)) return;

    const itemData = this.game.cd.get(ItemData, item);
    const vars = this.game.currentQuest!.vars;
    if (vars.getValue('$%gold') < this.getPurchasePrice(itemData)) return;

    vars.setValue('$%gold', Math.fround(vars.getValue('$%gold') - this.getPurchasePrice(itemData)));
    const shop = dictGet(this.game.currentQuest!.shops, this.eventData.sectionName);
    const index = shop.indexOf(item);
    if (index >= 0) shop.splice(index, 1);
    this.game.currentQuest!.items.add(item);
    this.update();
  }

  // Valkyrie: ShopInterface.cs ShopInterface.Sell
  sell(item: string): void {
    if (this.game.ui.findTag(Game.DIALOG)) return;

    const itemData = this.game.cd.get(ItemData, item);
    const vars = this.game.currentQuest!.vars;
    vars.setValue('$%gold', Math.fround(vars.getValue('$%gold') + this.getSellPrice(itemData)));
    dictGet(this.game.currentQuest!.shops, this.eventData.sectionName).push(item);
    this.game.currentQuest!.items.delete(item);
    this.update();
  }

  /** ContentData.FileToTexture and Sprite.Create on an item picture. */
  private static itemTexture(itemData: ItemData): void {
    const itemTex = ContentData.fileToTexture(itemData.image);
    // Not in Valkyrie (16 October 2026): a missing picture threw (NullReferenceException); it is logged and the app draws a placeholder
    if (itemTex === null) ValkyrieDebug.log('Warning: Missing item picture: ' + itemData.image);
  }
}
