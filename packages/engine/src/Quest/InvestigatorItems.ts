// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/InvestigatorItems.cs
// The starting items are given here and sorted as Valkyrie shows them; the app draws the window
// (game.ui.investigatorItems) and its finished button calls game.questStartEvent().
import { ItemData } from '../Content/ContentTypes.ts';
import { QuestData } from '../Content/QuestData.ts';
import { Game } from '../Game.ts';
import { substring } from '../platform/CSharp.ts';

// SortedList<string, …> with the default comparer, which compares by culture (Valkyrie runs with the invariant culture)
const collator = new Intl.Collator('en');

// Window with starting Investigator items
// Valkyrie: InvestigatorItems.cs InvestigatorItems
export class InvestigatorItems {
  /** Not in Valkyrie: the items in the order the window shows them (by category, then by translated name). */
  sortedItems: string[] = [];

  constructor() {
    const game = Game.get();
    const quest = game.currentQuest!;

    // Items from heroes
    for (const h of quest.heroes) {
      if (h.heroData !== null) {
        if (game.cd.containsKey(ItemData, h.heroData.item)) {
          quest.items.add(h.heroData.item);
        }
      }
    }

    for (const [key, value] of quest.qd.components) {
      const item = value instanceof QuestData.QItem ? value : null;
      if (item !== null && item.starting && quest.itemSelect.has(key) && item.tests !== null && quest.vars.test(item.tests)) {
        quest.items.add(quest.itemSelect.get(key)!);
        if (item.inspect.length > 0) {
          // Remove then Add puts it back in its slot of the .NET Dictionary, as Map.set does
          quest.itemInspect.set(quest.itemSelect.get(key)!, item.inspect);
        }
      }
    }

    // If a dialog window is open we force it closed (this shouldn't happen)
    game.ui.destroyTag(Game.DIALOG);

    const itemSort = new Map<string, Map<string, string>>();

    for (const item of quest.items) {
      // Ignore "ItemX", find next capital letter
      let charIndex = 5;
      while (charIndex < item.length - 1) {
        if (/\p{Lu}/u.test(item[charIndex++]!)) break;
      }
      const typeString = substring(item, 0, charIndex);
      let translationString = game.cd.get(ItemData, item).name.translate();

      if (!itemSort.has(typeString)) {
        itemSort.set(typeString, new Map());
      }

      // Duplicate names
      while (itemSort.get(typeString)!.has(translationString)) {
        translationString += 'D';
      }

      itemSort.get(typeString)!.set(translationString, item);
    }

    for (const category of [...itemSort.keys()].sort(collator.compare)) {
      const items = itemSort.get(category)!;
      for (const name of [...items.keys()].sort(collator.compare)) {
        this.sortedItems.push(items.get(name)!);
      }
    }

    game.ui.investigatorItems(this);
  }
}
