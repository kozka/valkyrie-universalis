// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/EditorComponentItem.cs
// Only what the quest item's panel does to it, and the choices its selection windows offer; the panel is the app's
// (editor/ItemPanel.tsx). A starting item's conditions are EditorComponentVarTestsUtil's.
import { ItemData } from '../Content/ContentTypes.ts';
import { CommonStringKeys } from '../Content/CommonStringKeys.ts';
import { QuestData } from '../Content/QuestData.ts';
import { Game } from '../Game.ts';
import { netAdd } from '../platform/NetDictionary.ts';
import { VarTests } from '../Quest/VarTests.ts';
import { componentItem, contentItem, newComponentItem, type SelectionItem } from './SelectionTraits.ts';

function components(): Map<string, QuestData.QuestComponent> {
  return Game.get().currentQuest!.qd.components;
}

export const EditorComponentItem = {
  /** A starting item is handed out at the start, when its conditions hold; it gets an empty list of them. */
  // Valkyrie: EditorComponentItem.cs EditorComponentItem.ToggleStarting (and AddSubComponents, which gives it tests)
  toggleStarting(item: QuestData.QItem): void {
    item.starting = !item.starting;
    if (item.starting && item.tests === null) item.tests = new VarTests();
  },

  /**
   * What the item window offers: the scenario's quest items, then the content's, greyed when a quest item of a single
   * item already gives it.
   */
  // Valkyrie: EditorComponentItem.cs EditorComponentItem.SetItem
  itemChoices(): SelectionItem[] {
    const quest = CommonStringKeys.SOURCE.translate();
    const own: SelectionItem[] = [];
    const used = new Set<string>();
    for (const c of components().values()) {
      if (!(c instanceof QuestData.QItem)) continue;
      own.push({ key: c.sectionName, display: c.sectionName, traits: new Map([[quest, ['Quest']]]) });
      if (c.traits.length === 0 && c.traitpool.length === 0 && c.itemName[0] !== undefined) used.add(c.itemName[0]);
    }
    return [...own, ...Game.get().cd.values(ItemData).map((data) => contentItem(data, used.has(data.sectionName)))];
  },

  /** An item at the end (-1) or in place of one. */
  // Valkyrie: EditorComponentItem.cs EditorComponentItem.SelectAddItem
  selectAddItem(item: QuestData.QItem, pos: number, name: string): void {
    if (pos === -1) item.itemName = [...item.itemName, name];
    else item.itemName[pos] = name;
  },

  // Valkyrie: EditorComponentItem.cs EditorComponentItem.RemoveItem
  removeItem(item: QuestData.QItem, index: number): void {
    item.itemName = item.itemName.filter((_, i) => i !== index);
  },

  /** What the trait windows offer: every trait of the content's items. */
  // Valkyrie: EditorComponentItem.cs EditorComponentItem.AddTrait
  traitChoices(): string[] {
    return [...new Set(Game.get().cd.values(ItemData).flatMap((data) => data.traits))];
  },

  // Valkyrie: EditorComponentItem.cs EditorComponentItem.SelectAddTrait
  selectAddTrait(item: QuestData.QItem, pool: boolean, trait: string): void {
    if (pool) item.traitpool = [...item.traitpool, trait];
    else item.traits = [...item.traits, trait];
  },

  // Valkyrie: EditorComponentItem.cs EditorComponentItem.RemoveTrait
  removeTrait(item: QuestData.QItem, index: number): void {
    item.traits = item.traits.filter((_, i) => i !== index);
  },

  // Valkyrie: EditorComponentItem.cs EditorComponentItem.RemoveTraitPool
  removeTraitPool(item: QuestData.QItem, index: number): void {
    item.traitpool = item.traitpool.filter((_, i) => i !== index);
  },

  /** What the inspect window offers: a new event, then the scenario's events (none, '', is the panel's). */
  // Valkyrie: EditorComponentItem.cs EditorComponentItem.PickInpsect
  inspectChoices(): SelectionItem[] {
    return [newComponentItem('Event'), ...[...components().values()].filter((c) => c.typeDynamic === 'Event').map(componentItem)];
  },

  /** The event shown when the item is inspected; {NEW:Event} makes it, named as Valkyrie names it. */
  // Valkyrie: EditorComponentItem.cs EditorComponentItem.SelectInspectEvent
  selectInspectEvent(item: QuestData.QItem, eventName: string): string {
    let toAdd = eventName;
    if (eventName === '{NEW:Event}') {
      let i = 0;
      while (components().has('Event' + i)) i++;
      toAdd = 'Event' + i;
      netAdd(components(), toAdd, new QuestData.Event(toAdd));
    }
    item.inspect = toAdd;
    return toAdd;
  },
};
