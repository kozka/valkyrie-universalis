// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/EditorComponentSpawn.cs
// Only what the spawn's panel does to it, and the choices its selection windows offer; the panel is the app's
// (editor/SpawnPanel.tsx). Its place (PositionTypeCycle) is EditorComponentEvent's spawnPositionTypeCycle, and the
// parts of the event a spawn keeps are the event panel's.
import { MonsterData } from '../Content/ContentTypes.ts';
import { LocalizationRead } from '../Content/LocalizationRead.ts';
import { QuestData } from '../Content/QuestData.ts';
import { Game } from '../Game.ts';
import { floatTryParse } from '../platform/CSharp.ts';
import { netAdd } from '../platform/NetDictionary.ts';
import { componentItem, contentItem, newComponentItem, type SelectionItem } from './SelectionTraits.ts';

function components(): Map<string, QuestData.QuestComponent> {
  return Game.get().currentQuest!.qd.components;
}

export const EditorComponentSpawn = {
  // Valkyrie: EditorComponentSpawn.cs EditorComponentSpawn.ActivatedToggle
  activatedToggle(spawn: QuestData.Spawn): void {
    spawn.activated = !spawn.activated;
  },

  /** A unique monster gets a title (its name) and a text ('-'); a group loses them. */
  // Valkyrie: EditorComponentSpawn.cs EditorComponentSpawn.UniqueToggle
  uniqueToggle(spawn: QuestData.Spawn): void {
    spawn.unique = !spawn.unique;
    if (!spawn.unique) {
      LocalizationRead.dicts.get('qst')!.remove(spawn.uniquetitle_key);
      LocalizationRead.dicts.get('qst')!.remove(spawn.uniquetext_key);
    } else {
      LocalizationRead.updateScenarioText(spawn.uniquetitle_key, spawn.sectionName);
      LocalizationRead.updateScenarioText(spawn.uniquetext_key, '-');
    }
  },

  /** What is not a number is 0. */
  // Valkyrie: EditorComponentSpawn.cs EditorComponentSpawn.UpdateHealth
  updateHealth(spawn: QuestData.Spawn, text: string): void {
    spawn.uniqueHealthBase = Math.fround(floatTryParse(text).value);
  },

  // Valkyrie: EditorComponentSpawn.cs EditorComponentSpawn.UpdateHealthHero
  updateHealthHero(spawn: QuestData.Spawn, text: string): void {
    spawn.uniqueHealthHero = Math.fround(floatTryParse(text).value);
  },

  /** An empty box keeps the old title. */
  // Valkyrie: EditorComponentSpawn.cs EditorComponentSpawn.UpdateUniqueTitle
  updateUniqueTitle(spawn: QuestData.Spawn, text: string): void {
    if (text.length > 0) LocalizationRead.updateScenarioText(spawn.uniquetitle_key, text);
  },

  // Valkyrie: EditorComponentSpawn.cs EditorComponentSpawn.UpdateUniqueText
  updateUniqueText(spawn: QuestData.Spawn, text: string): void {
    if (text.length > 0) LocalizationRead.updateScenarioText(spawn.uniquetext_key, text);
  },

  /** What the monster window offers: the scenario's custom monsters and spawns, then the content's monsters. */
  // Valkyrie: EditorComponentSpawn.cs EditorComponentSpawn.MonsterTypeAdd and MonsterTypeReplace
  monsterTypeChoices(): SelectionItem[] {
    const own = [...components().values()].filter((c) => c instanceof QuestData.CustomMonster || c instanceof QuestData.Spawn).map(componentItem);
    return [...own, ...Game.get().cd.values(MonsterData).map((m) => contentItem(m))];
  },

  /** A monster type put at a place in the list, or in place of the one there. */
  // Valkyrie: EditorComponentSpawn.cs EditorComponentSpawn.SelectMonsterType
  selectMonsterType(spawn: QuestData.Spawn, type: string, pos: number, replace = false): void {
    const name = type.split(' ')[0]!;
    if (replace) spawn.mTypes[pos] = name;
    else spawn.mTypes = [...spawn.mTypes.slice(0, pos), name, ...spawn.mTypes.slice(pos)];
  },

  /** A monster type goes, unless it is all the spawn has. */
  // Valkyrie: EditorComponentSpawn.cs EditorComponentSpawn.MonsterTypeRemove
  monsterTypeRemove(spawn: QuestData.Spawn, pos: number): void {
    if (spawn.mTypes.length === 1 && spawn.mTraitsRequired.length === 0 && spawn.mTraitsPool.length === 0) return;
    spawn.mTypes = spawn.mTypes.filter((_, i) => i !== pos);
  },

  /** What the trait windows offer: every trait of the content's monsters. */
  // Valkyrie: EditorComponentSpawn.cs EditorComponentSpawn.MonsterTraitsAdd and MonsterTraitReplace
  traitChoices(): string[] {
    return [...new Set(Game.get().cd.values(MonsterData).flatMap((m) => m.traits))];
  },

  // Valkyrie: EditorComponentSpawn.cs EditorComponentSpawn.SelectMonsterTraitReplace
  selectMonsterTraitReplace(spawn: QuestData.Spawn, pos: number, pool: boolean, trait: string): void {
    if (pool) spawn.mTraitsPool[pos] = trait;
    else spawn.mTraitsRequired[pos] = trait;
  },

  // Valkyrie: EditorComponentSpawn.cs EditorComponentSpawn.SelectMonsterTrait
  selectMonsterTrait(spawn: QuestData.Spawn, pool: boolean, trait: string): void {
    if (pool) spawn.mTraitsPool = [...spawn.mTraitsPool, trait];
    else spawn.mTraitsRequired = [...spawn.mTraitsRequired, trait];
  },

  /** A trait goes, unless it is all the spawn has. */
  // Valkyrie: EditorComponentSpawn.cs EditorComponentSpawn.MonsterTraitsRemove
  monsterTraitsRemove(spawn: QuestData.Spawn, pos: number, pool = false): void {
    if (spawn.mTypes.length + spawn.mTraitsPool.length + spawn.mTraitsRequired.length <= 1) return;
    if (pool) spawn.mTraitsPool = spawn.mTraitsPool.filter((_, i) => i !== pos);
    else spawn.mTraitsRequired = spawn.mTraitsRequired.filter((_, i) => i !== pos);
  },

  /** What the place window offers: a new monster place, then the scenario's. */
  // Valkyrie: EditorComponentSpawn.cs EditorComponentSpawn.MonsterPlaceAdd
  placeChoices(): SelectionItem[] {
    return [newComponentItem('MPlace'), ...[...components().values()].filter((c) => c instanceof QuestData.MPlace).map(componentItem)];
  },

  /** A place for a number of heroes, at the end or in place of one; {NEW:MPlace} makes it, named as Valkyrie names it. */
  // Valkyrie: EditorComponentSpawn.cs EditorComponentSpawn.MonsterPlaceAddSelection
  monsterPlaceAddSelection(spawn: QuestData.Spawn, heroes: number, slot: number, name: string): string {
    let place = name;
    if (name === '{NEW:MPlace}') {
      let index = 0;
      while (components().has('MPlace' + index)) index++;
      place = 'MPlace' + index;
      netAdd(components(), place, new QuestData.MPlace(place));
    }
    if (slot === -1) spawn.placement[heroes] = [...spawn.placement[heroes]!, place];
    else spawn.placement[heroes]![slot] = place;
    return place;
  },

  // Valkyrie: EditorComponentSpawn.cs EditorComponentSpawn.MonsterPlaceRemove
  monsterPlaceRemove(spawn: QuestData.Spawn, heroes: number, pos: number): void {
    spawn.placement[heroes] = spawn.placement[heroes]!.filter((_, i) => i !== pos);
  },
};
