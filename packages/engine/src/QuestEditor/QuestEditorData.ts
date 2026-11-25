// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/QuestEditorData.cs
// The selection is the name of the component being edited ('Quest' for the quest itself): the app draws its panel, the
// component list (TypeSelect) and the choice on a right click. New components go into the slot a deleted one freed, as in
// Valkyrie's Dictionary, so that the files come out in the same order.
import { LocalizationRead } from '../Content/LocalizationRead.ts';
import { QuestData } from '../Content/QuestData.ts';
import { StringKey } from '../Content/StringKey.ts';
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { Mathf } from '../platform/Mathf.ts';
import { netAdd, netRemove } from '../platform/NetDictionary.ts';

/** The selection that stands for the quest component (EditorComponentQuest). */
export const QUEST_SELECTION = 'Quest';

/**
 * QuestComponent.ChangeReference, as the editor's rename and delete call it. Not in Valkyrie: Event.ChangeReference
 * also changes a trigger that only starts with "Defeated" and the old name (DefeatedSpawnA12 when SpawnA1 is renamed
 * or deleted), which breaks another monster's event, and a delete takes a deleted event only once from a button that
 * names it more than once (a random choice with weights), leaving it there; here the trigger is kept and the event goes.
 * A renamed custom monster keeps its attacks' texts under the old name until the quest is read again, so an attack
 * edited before then is lost; here they follow the new name, as an event's button labels do.
 */
export function changeReference(component: QuestData.QuestComponent, oldName: string, newName: string): void {
  const trigger = component instanceof QuestData.Event ? component.trigger : null;
  component.changeReference(oldName, newName);
  if (component instanceof QuestData.CustomMonster && component.sectionName === oldName && newName !== '') {
    for (const attacks of component.investigatorAttacks.values()) {
      attacks.forEach((attack, i) => {
        if (attack.key.startsWith(oldName + '.')) attacks[i] = new StringKey('qst', newName + attack.key.substring(oldName.length));
      });
    }
  }
  if (!(component instanceof QuestData.Event)) return;
  if (trigger !== 'Defeated' + oldName && trigger !== 'DefeatedUnique' + oldName) component.trigger = trigger!;
  if (newName !== '') return;
  for (const button of component.buttons) {
    for (let i = button.eventNames.length - 1; i >= 0; i--) {
      if (button.eventNames[i] === oldName) button.eventNames.splice(i, 1);
    }
  }
}

// This class manages the Quest editor Interface
// Valkyrie: QuestEditorData.cs QuestEditorData
export class QuestEditorData {
  // This is the currently selected component
  selection: string | null = null;
  // The selection stack is used for the 'back' button
  selectionStack: string[] = [];

  /** QuestEditorData() starts the editor; QuestEditorData(old) starts it from an old version, keeping its selection. */
  // Valkyrie: QuestEditorData.cs QuestEditorData.QuestEditorData
  constructor(old?: QuestEditorData | null) {
    Game.get().qed = this;
    this.selectionStack = [];
    if (old === undefined || old === null || old.selection === null) {
      // Start at the quest component
      QuestEditorData.selectQuest();
    } else {
      this.selectionStack = old.selectionStack;
      this.selectionStack.push(old.selection);
      QuestEditorData.back();
    }
  }

  // Update component selection
  // Used to save selection history
  // Valkyrie: QuestEditorData.cs QuestEditorData.NewSelection
  newSelection(c: string): void {
    // selection starts at null
    if (this.selection !== null) {
      this.selectionStack.push(this.selection);
    }
    this.selection = c;
  }

  // Go back in the selection stack
  // Valkyrie: QuestEditorData.cs QuestEditorData.Back
  static back(): void {
    const game = Game.get();
    const qed = game.qed!;
    // Check if there is anything to go back to
    if (qed.selectionStack.length === 0) {
      // Reset on quest selection
      qed.selection = QUEST_SELECTION;
      return;
    }
    qed.selection = qed.selectionStack.pop()!;
    // Quest is OK, and so is an existing component
    if (qed.selection === QUEST_SELECTION || game.currentQuest!.qd.components.has(qed.selection)) {
      return;
    }
    // History item has been deleted/renamed, go back further
    QuestEditorData.back();
  }

  // Select a component for editing
  // Valkyrie: QuestEditorData.cs QuestEditorData.SelectComponent
  static selectComponent(name: string): void {
    const game = Game.get();
    const qed = game.qed!;

    // Quest is a special component
    if (name === QUEST_SELECTION) {
      QuestEditorData.selectQuest();
      return;
    }
    // These are special strings for creating new objects
    const created = /^\{NEW:(\w+)\}$/.exec(name);
    if (created !== null) {
      qed.newComponent(created[1]!);
      return;
    }
    // This may happen to due rename/delete; not in Valkyrie: it went on to throw KeyNotFoundException
    if (!game.currentQuest!.qd.components.has(name)) {
      QuestEditorData.selectQuest();
      return;
    }
    // SelectAsTile, SelectAsEvent...: the app draws the panel for the component's type
    qed.newSelection(name);
  }

  // Valkyrie: QuestEditorData.cs QuestEditorData.SelectQuest
  static selectQuest(): void {
    Game.get().qed!.newSelection(QUEST_SELECTION);
  }

  /** NewTile, NewEvent...: creates a component of that type with the next available number and selects it. */
  newComponent(type: string): string | null {
    switch (type) {
      case 'Tile':
        return this.newTile();
      case 'Door':
        return this.newDoor();
      case 'Token':
        return this.newToken();
      case 'UI':
        return this.newUI();
      case 'Spawn':
        return this.newSpawn();
      case 'MPlace':
        return this.newMPlace();
      case 'QItem':
        return this.newItem();
      case 'CustomMonster':
        return this.newCustomMonster();
      case 'Activation':
        return this.newActivation();
      case 'Event':
        return this.newEvent();
      case 'Puzzle':
        return this.newPuzzle();
      default:
        return null;
    }
  }

  /** The first free name of that type: the type and the lowest number not taken. */
  private static nextName(type: string): string {
    const components = Game.get().currentQuest!.qd.components;
    let index = 0;
    while (components.has(type + index)) {
      index++;
    }
    return type + index;
  }

  /** The camera's position rounded to steps of `round`, where new board components go. */
  private static atCamera(component: QuestData.QuestComponent, round: number): void {
    const position = Game.get().cc.position;
    component.location.x = Math.fround(round * Mathf.round(position.x / round));
    component.location.y = Math.fround(round * Mathf.round(position.y / round));
  }

  // Create a new tile, use next available number
  // Valkyrie: QuestEditorData.cs QuestEditorData.NewTile
  newTile(): string {
    const game = Game.get();
    const name = QuestEditorData.nextName('Tile');
    const tile = new QuestData.Tile(name);
    netAdd(game.currentQuest!.qd.components, name, tile);
    QuestEditorData.atCamera(tile, game.gameType.tileRound());
    game.currentQuest!.add(name);
    QuestEditorData.selectComponent(name);
    return name;
  }

  // Valkyrie: QuestEditorData.cs QuestEditorData.NewDoor
  newDoor(): string {
    const game = Game.get();
    const name = QuestEditorData.nextName('Door');
    const door = new QuestData.Door(name);
    netAdd(game.currentQuest!.qd.components, name, door);
    QuestEditorData.atCamera(door, game.gameType.selectionRound());
    game.currentQuest!.add(name);
    QuestEditorData.selectComponent(name);
    return name;
  }

  // Valkyrie: QuestEditorData.cs QuestEditorData.NewToken
  newToken(): string {
    const game = Game.get();
    const name = QuestEditorData.nextName('Token');
    const token = new QuestData.Token(name);
    netAdd(game.currentQuest!.qd.components, name, token);
    QuestEditorData.atCamera(token, game.gameType.selectionRound());
    game.currentQuest!.add(name);
    QuestEditorData.selectComponent(name);
    return name;
  }

  // Valkyrie: QuestEditorData.cs QuestEditorData.NewUI
  newUI(): string {
    const game = Game.get();
    const name = QuestEditorData.nextName('UI');
    const ui = new QuestData.UI(name);
    ui.verticalUnits = true;
    ui.richText = true;
    netAdd(game.currentQuest!.qd.components, name, ui);
    QuestEditorData.selectComponent(name);
    return name;
  }

  // Valkyrie: QuestEditorData.cs QuestEditorData.NewSpawn
  newSpawn(): string {
    return QuestEditorData.addNew(new QuestData.Spawn(QuestEditorData.nextName('Spawn')));
  }

  // Valkyrie: QuestEditorData.cs QuestEditorData.NewMPlace
  newMPlace(): string {
    return QuestEditorData.addNew(new QuestData.MPlace(QuestEditorData.nextName('MPlace')));
  }

  // Valkyrie: QuestEditorData.cs QuestEditorData.NewEvent
  newEvent(): string {
    return QuestEditorData.addNew(new QuestData.Event(QuestEditorData.nextName('Event')));
  }

  // Valkyrie: QuestEditorData.cs QuestEditorData.NewPuzzle
  newPuzzle(): string {
    return QuestEditorData.addNew(new QuestData.Puzzle(QuestEditorData.nextName('Puzzle')));
  }

  // Valkyrie: QuestEditorData.cs QuestEditorData.NewItem
  newItem(): string {
    return QuestEditorData.addNew(new QuestData.QItem(QuestEditorData.nextName('QItem')));
  }

  // Valkyrie: QuestEditorData.cs QuestEditorData.NewCustomMonster
  newCustomMonster(): string {
    return QuestEditorData.addNew(new QuestData.CustomMonster(QuestEditorData.nextName('CustomMonster')));
  }

  // Valkyrie: QuestEditorData.cs QuestEditorData.NewActivation
  newActivation(): string {
    return QuestEditorData.addNew(new QuestData.Activation(QuestEditorData.nextName('Activation')));
  }

  /** components.Add(name, component), then SelectComponent(name), for the components that are not drawn when made. */
  private static addNew(component: QuestData.QuestComponent): string {
    netAdd(Game.get().currentQuest!.qd.components, component.sectionName, component);
    QuestEditorData.selectComponent(component.sectionName);
    return component.sectionName;
  }

  // Item selected from list for deletion
  // Valkyrie: QuestEditorData.cs QuestEditorData.DeleteCurrentComponent
  static deleteCurrentComponent(): void {
    const game = Game.get();
    const name = game.qed!.selection ?? '';
    Destroyer.dialog();

    if (name.length === 0) return;

    // Remove all references to the deleted component (QuestComponent.RemoveReference renames it to "")
    for (const component of game.currentQuest!.qd.components.values()) {
      changeReference(component, name, '');
    }

    // Remove the component
    netRemove(game.currentQuest!.qd.components, name);

    LocalizationRead.dicts.get('qst')!.removeKeyPrefix(name + '.');

    // Clean up the current quest environment
    game.currentQuest!.remove(name);

    QuestEditorData.back();
  }
}
