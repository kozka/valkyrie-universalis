// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/MonsterDialog.cs
// What a click on a monster offers (Descent's window; Mansions' is MonsterDialogMoM). The app draws it
// (game.ui.monsterDialog); its buttons call these methods.
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { InfoDialog } from './InfoDialog.ts';
import type { Quest } from './Quest.ts';

// Class for creation of monster selection options
// Valkyrie: MonsterDialog.cs MonsterDialog
export class MonsterDialog {
  monster: Quest.Monster;

  // Constuct the button list
  constructor(m: Quest.Monster) {
    this.monster = m;
    this.createWindow();
  }

  // Draw items
  // Valkyrie: MonsterDialog.cs MonsterDialog.CreateWindow
  createWindow(): void {
    Game.get().ui.monsterDialog(this);
  }

  // Monster Information
  // Valkyrie: MonsterDialog.cs MonsterDialog.Info
  info(): void {
    Destroyer.dialog();
    new InfoDialog(this.monster);
  }

  // Force Activation
  // Valkyrie: MonsterDialog.cs MonsterDialog.Activate
  activate(): void {
    const game = Game.get();
    // Save to undo stack
    game.currentQuest!.save();
    game.roundControl.activateMonster(this.monster);
  }

  // Defeated monsters
  // Valkyrie: MonsterDialog.cs MonsterDialog.Defeated
  defeated(): void {
    Destroyer.dialog();
    const game = Game.get();
    // Save to undo stack
    game.currentQuest!.save();
    // Remove this monster group
    removeMonster(game.currentQuest!, this.monster);
    this.updateDisplay();

    game.currentQuest!.vars.setValue('#monsters', game.currentQuest!.monsters.length);

    game.audioControl.playTrait('defeated');

    this.triggerDefeatedEvents(game, 'Defeated');

    // If unique trigger defeated unique event
    if (this.monster.unique) {
      this.triggerDefeatedEvents(game, 'DefeatedUnique');
    }
  }

  // Unique Defeated (others still around)
  // Valkyrie: MonsterDialog.cs MonsterDialog.UniqueDefeated
  uniqueDefeated(): void {
    const game = Game.get();
    Destroyer.dialog();
    // Add to undo stack
    game.currentQuest!.save();
    // Monster is no longer unique
    this.monster.unique = false;
    this.monster.healthMod = 0;
    game.monsterCanvas.updateList();
    // Trigger unique defeated event
    this.triggerDefeatedEvents(game, 'DefeatedUnique');
  }

  // Valkyrie: MonsterDialog.cs MonsterDialog.TriggerDefeatedEvents
  private triggerDefeatedEvents(game: Game, eventType: string): void {
    // Trigger defeated event by monster type
    game.currentQuest!.eManager.eventTriggerType(eventType + this.monster.monsterData.sectionName);
    // Trigger defeated event by spawn name
    game.currentQuest!.eManager.eventTriggerType(eventType + this.monster.spawnEventName);
  }

  // Cancel cleans up
  // Valkyrie: MonsterDialog.cs MonsterDialog.OnCancel
  onCancel(): void {
    Destroyer.dialog();
  }

  // Update the list of monsters
  // Valkyrie: MonsterDialog.cs MonsterDialog.updateDisplay
  updateDisplay(): void {
    Game.get().monsterCanvas.updateList();
  }
}

/** List<Quest.Monster>.Remove: the first occurrence. */
export function removeMonster(quest: Quest, monster: Quest.Monster): void {
  const index = quest.monsters.indexOf(monster);
  if (index >= 0) quest.monsters.splice(index, 1);
}
