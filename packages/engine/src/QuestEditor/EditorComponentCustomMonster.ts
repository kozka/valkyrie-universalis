// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/EditorComponentCustomMonster.cs
// Only what the custom monster's panel does to it, and the choices its selection windows offer; the panel is the
// app's (editor/MonsterPanel.tsx).
import { AttackData, MonsterData } from '../Content/ContentTypes.ts';
import { LocalizationRead } from '../Content/LocalizationRead.ts';
import { QuestData } from '../Content/QuestData.ts';
import { StringKey } from '../Content/StringKey.ts';
import { Game } from '../Game.ts';
import { floatTryParse, intTryParse } from '../platform/CSharp.ts';
import { netAdd } from '../platform/NetDictionary.ts';
import { componentItem, contentItem, newComponentItem, type SelectionItem } from './SelectionTraits.ts';

const NAME = new StringKey('val', 'NAME');
const INFO = new StringKey('val', 'INFO');

function components(): Map<string, QuestData.QuestComponent> {
  return Game.get().currentQuest!.qd.components;
}

/** A new component of a type, named as Valkyrie names it: the type and the lowest number not taken. */
function make(type: 'Event' | 'Activation'): string {
  let i = 0;
  while (components().has(type + i)) i++;
  const name = type + i;
  netAdd(components(), name, type === 'Event' ? new QuestData.Event(name) : new QuestData.Activation(name));
  return name;
}

export const EditorComponentCustomMonster = {
  /** What the base window offers: the content's monsters (none, which makes it a monster of its own, is the panel's). */
  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.SetBase
  baseChoices(): SelectionItem[] {
    return Game.get().cd.values(MonsterData).map((m) => contentItem(m));
  },

  /** A monster of the content as its base, or none ('{NONE}'), which gives it a name, an info, health, horror and awareness of its own. */
  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.SelectSetBase
  selectSetBase(monster: QuestData.CustomMonster, type: string): void {
    if (type === '{NONE}') {
      monster.baseMonster = '';
      if (!monster.monsterName.keyExists()) EditorComponentCustomMonster.setName(monster);
      if (!monster.info.keyExists()) EditorComponentCustomMonster.setInfo(monster);
      if (!monster.healthDefined) EditorComponentCustomMonster.setHealth(monster);
      if (!monster.horrorDefined) EditorComponentCustomMonster.setHorror(monster);
      if (!monster.awarenessDefined) EditorComponentCustomMonster.setAwareness(monster);
    } else {
      monster.baseMonster = type.split(' ')[0]!;
    }
  },

  /** An empty box keeps the old name. */
  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.UpdateName
  updateName(monster: QuestData.CustomMonster, text: string): void {
    if (text.length > 0) LocalizationRead.updateScenarioText(monster.monstername_key, text);
  },

  /** Reset: the base monster's name. */
  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.ClearName
  clearName(monster: QuestData.CustomMonster): void {
    LocalizationRead.dicts.get('qst')!.remove(monster.monstername_key);
  },

  /** Set: a name of its own, Valkyrie's word for a name until one is typed. */
  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.SetName
  setName(monster: QuestData.CustomMonster): void {
    LocalizationRead.updateScenarioText(monster.monstername_key, NAME.translate());
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.UpdateInfo
  updateInfo(monster: QuestData.CustomMonster, text: string): void {
    if (text.length > 0) LocalizationRead.updateScenarioText(monster.info_key, text);
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.ClearInfo
  clearInfo(monster: QuestData.CustomMonster): void {
    LocalizationRead.dicts.get('qst')!.remove(monster.info_key);
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.SetInfo
  setInfo(monster: QuestData.CustomMonster): void {
    LocalizationRead.updateScenarioText(monster.info_key, INFO.translate());
  },

  /** Descent's activations window: a new activation, then the scenario's. */
  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.AddActivation
  activationChoices(): SelectionItem[] {
    return [newComponentItem('Activation'), ...[...components().values()].filter((c) => c instanceof QuestData.Activation).map(componentItem)];
  },

  /** A Descent activation at the end (-1) or in place of one, written without its Activation prefix; {NEW:Activation} makes it. */
  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.SelectAddActivation
  selectAddActivation(monster: QuestData.CustomMonster, index: number, key: string): string {
    const toAdd = key === '{NEW:Activation}' ? make('Activation') : key;
    const short = toAdd.substring('Activation'.length);
    if (index !== -1) monster.activations[index] = short;
    else monster.activations = [...monster.activations, short];
    return toAdd;
  },

  /** Mansions' activation window: a new event, then the scenario's events of every kind (none, '', is the panel's). */
  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.SetActivation
  mansionsActivationChoices(): SelectionItem[] {
    return [newComponentItem('Event'), ...[...components().values()].filter((c) => c.typeDynamic.indexOf('Event') === 0).map(componentItem)];
  },

  /** Mansions' one activation, an event; none ('') takes it away; {NEW:Event} makes it. */
  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.SelectSetActivation
  selectSetActivation(monster: QuestData.CustomMonster, key: string): string {
    if (key.length === 0) {
      monster.activations = [];
      return '';
    }
    const toAdd = key === '{NEW:Event}' ? make('Event') : key;
    monster.activations = [toAdd];
    return toAdd;
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.RemoveActivation
  removeActivation(monster: QuestData.CustomMonster, index: number): void {
    monster.activations = monster.activations.filter((_, i) => i !== index);
  },

  /** What the trait window offers: every trait of the content's monsters, as written. */
  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.AddTrait
  traitChoices(): string[] {
    return [...new Set(Game.get().cd.values(MonsterData).flatMap((m) => m.traits))];
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.SelectAddTraits
  selectAddTraits(monster: QuestData.CustomMonster, trait: string): void {
    monster.traits = [...monster.traits, trait];
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.RemoveTrait
  removeTrait(monster: QuestData.CustomMonster, index: number): void {
    monster.traits = monster.traits.filter((_, i) => i !== index);
  },

  /**
   * What is not a number is 0. Not in Valkyrie: a number typed is the monster's own (healthDefined, and the same for
   * horror and awareness). Valkyrie's panel shows these boxes on a monster with no base, whose values are not its own
   * until its base is set to none, which its window never offers, so what was typed there was not saved.
   */
  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.UpdateHealth
  updateHealth(monster: QuestData.CustomMonster, text: string): void {
    monster.healthBase = Math.fround(floatTryParse(text).value);
    monster.healthDefined = true;
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.UpdateHealthHero
  updateHealthHero(monster: QuestData.CustomMonster, text: string): void {
    monster.healthPerHero = Math.fround(floatTryParse(text).value);
    monster.healthDefined = true;
  },

  /** Reset: the base monster's health. */
  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.ClearHealth
  clearHealth(monster: QuestData.CustomMonster): void {
    monster.healthBase = 0;
    monster.healthPerHero = 0;
    monster.healthDefined = false;
  },

  /** Set: health of its own, 0 until typed. */
  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.SetHealth
  setHealth(monster: QuestData.CustomMonster): void {
    monster.healthBase = 0;
    monster.healthPerHero = 0;
    monster.healthDefined = true;
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.UpdateHorror
  updateHorror(monster: QuestData.CustomMonster, text: string): void {
    monster.horror = intTryParse(text).value;
    monster.horrorDefined = true;
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.ClearHorror
  clearHorror(monster: QuestData.CustomMonster): void {
    monster.horror = 0;
    monster.horrorDefined = false;
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.SetHorror
  setHorror(monster: QuestData.CustomMonster): void {
    monster.horror = 0;
    monster.horrorDefined = true;
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.UpdateAwareness
  updateAwareness(monster: QuestData.CustomMonster, text: string): void {
    monster.awareness = intTryParse(text).value;
    monster.awarenessDefined = true;
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.ClearAwareness
  clearAwareness(monster: QuestData.CustomMonster): void {
    monster.awareness = 0;
    monster.awarenessDefined = false;
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.SetAwareness
  setAwareness(monster: QuestData.CustomMonster): void {
    monster.awareness = 0;
    monster.awarenessDefined = true;
  },

  /** The kinds of investigator attack the content has, as written. */
  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.NewAttackType
  attackTypeChoices(): string[] {
    return [...new Set(Game.get().cd.values(AttackData).map((a) => a.attackType))];
  },

  /** A new attack of a kind: its text, '-' until typed, under the next number of that kind. */
  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.NewInvestigatorAttack
  newInvestigatorAttack(monster: QuestData.CustomMonster, type: string): StringKey {
    if (!monster.investigatorAttacks.has(type)) monster.investigatorAttacks.set(type, []);
    const attacks = monster.investigatorAttacks.get(type)!;
    const attack = new StringKey('qst', monster.sectionName + '.Attack_' + type + '_' + (attacks.length + 1));
    attacks.push(attack);
    LocalizationRead.updateScenarioText(attack.key, '-');
    return attack;
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.RemoveInvestigatorAttack
  removeInvestigatorAttack(monster: QuestData.CustomMonster, type: string, attack: StringKey): void {
    const attacks = monster.investigatorAttacks.get(type)!;
    const at = attacks.findIndex((a) => a.key === attack.key);
    if (at >= 0) attacks.splice(at, 1);
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.RemoveInvestigatorAttackType
  removeInvestigatorAttackType(monster: QuestData.CustomMonster, type: string): void {
    monster.investigatorAttacks.delete(type);
  },

  /** An attack's text typed; an empty one takes the attack away, and its kind with it when it was the last. */
  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.UpdateAttacks
  updateAttack(monster: QuestData.CustomMonster, type: string, index: number, text: string): void {
    const attacks = monster.investigatorAttacks.get(type)!;
    const entry = attacks[index]!;
    if (text.length === 0) {
      LocalizationRead.dicts.get('qst')!.remove(entry.key);
      if (attacks.length === 1) monster.investigatorAttacks.delete(type);
      else attacks.splice(index, 1);
      return;
    }
    LocalizationRead.updateScenarioText(entry.key, text);
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.SelectImage
  selectImage(monster: QuestData.CustomMonster, image: string): void {
    monster.imagePath = image;
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.ClearImage
  clearImage(monster: QuestData.CustomMonster): void {
    monster.imagePath = '';
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.SelectImagePlace
  selectImagePlace(monster: QuestData.CustomMonster, image: string): void {
    monster.imagePlace = image;
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.ClearImagePlace
  clearImagePlace(monster: QuestData.CustomMonster): void {
    monster.imagePlace = '';
  },

  /** What the evade and horror windows offer: a new event, then the scenario's events (none, '', is the panel's). */
  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.SetEvade and SetHorrorEvent
  eventChoices(): SelectionItem[] {
    return [newComponentItem('Event'), ...[...components().values()].filter((c) => c.typeDynamic === 'Event').map(componentItem)];
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.SelectSetEvade
  selectSetEvade(monster: QuestData.CustomMonster, evade: string): string {
    monster.evadeEvent = evade === '{NEW:Event}' ? make('Event') : evade;
    return monster.evadeEvent;
  },

  // Valkyrie: EditorComponentCustomMonster.cs EditorComponentCustomMonster.SelectSetHorror
  selectSetHorror(monster: QuestData.CustomMonster, horror: string): string {
    monster.horrorEvent = horror === '{NEW:Event}' ? make('Event') : horror;
    return monster.horrorEvent;
  },
};
