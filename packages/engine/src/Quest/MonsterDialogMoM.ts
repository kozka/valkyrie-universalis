// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/MonsterDialogMoM.cs
// Mansions' window for a monster: attack and evade in the investigator phase, the horror check in the horror step, its
// damage and its defeat. The app draws it (game.ui.monsterDialogMoM, and game.ui.drawMonster for its picture).
import { ContentData } from '../Content/ContentData.ts';
import { StringKey } from '../Content/StringKey.ts';
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { HorrorCheck } from './HorrorCheck.ts';
import { InvestigatorAttack } from './InvestigatorAttack.ts';
import { InvestigatorEvade } from './InvestigatorEvade.ts';
import { MonsterDialog, removeMonster } from './MonsterDialog.ts';
import { Quest } from './Quest.ts';

/** What redraws a monster after its damage changes: its window, or its picture alone. */
export type MonsterRedraw = (monster: Quest.Monster, displayHealth: boolean) => void;

// Class for creation of monster seleciton options
// Extends the standard class for MoM
// Valkyrie: MonsterDialogMoM.cs MonsterDialogMoM
export class MonsterDialogMoM extends MonsterDialog {
  static readonly DEFEATED = new StringKey('val', 'DEFEATED');

  // Valkyrie: MonsterDialogMoM.cs MonsterDialogMoM.CreateWindow
  override createWindow(): void {
    Destroyer.dialog();
    const game = Game.get();

    MonsterDialogMoM.drawMonster(this.monster);

    // In horror phase we do horror checks, in investigator phase we do attacks and evades: the app draws the buttons
    game.ui.monsterDialogMoM(this);
  }

  /** Not in Valkyrie: the buttons of the window, as CreateWindow chooses them. */
  horrorStep(): boolean {
    return Game.get().currentQuest!.phase === Quest.MoMPhase.horror;
  }

  /** Not in Valkyrie: attack, evade and cancel only work while the monster is alive (damage below its health). */
  isAlive(): boolean {
    return this.monster.damage < this.monster.getHealth();
  }

  /** What the health buttons redraw: this window (DrawMonsterHealth's call is CreateWindow). */
  redraw: MonsterRedraw = () => this.createWindow();

  // Valkyrie: MonsterDialogMoM.cs MonsterDialogMoM.DrawMonster
  static drawMonster(monster: Quest.Monster, displayHealth = false): void {
    // Not in Valkyrie (16 October 2026): Sprite.Create threw on a missing picture; it is logged and the app draws a placeholder
    if (ContentData.fileToTexture(monster.monsterData.image) === null) ValkyrieDebug.log('Warning: Missing monster picture: ' + monster.monsterData.image);
    Game.get().ui.drawMonster(monster, displayHealth);
  }

  // Valkyrie: MonsterDialogMoM.cs MonsterDialogMoM.Defeated
  static defeated(monster: Quest.Monster): void {
    Destroyer.dialog();
    const game = Game.get();
    // Remove this monster group
    removeMonster(game.currentQuest!, monster);
    game.monsterCanvas.updateList();

    game.currentQuest!.vars.setValue('#monsters', game.currentQuest!.monsters.length);

    game.audioControl.playTrait('defeated');

    // end this event (fix #1112)
    Game.get().currentQuest!.eManager.currentEvent = null;

    // Trigger defeated event by monster type
    game.currentQuest!.eManager.eventTriggerType('Defeated' + monster.monsterData.sectionName);
    // Trigger defeated event by spawn name
    game.currentQuest!.eManager.eventTriggerType('Defeated' + monster.spawnEventName);

    // fix #982 and #1352
    if (game.currentQuest!.phase === Quest.MoMPhase.monsters && Game.get().currentQuest!.eManager.currentEvent === null) {
      Game.get().roundControl.monsterActivated();
    }
  }

  // Valkyrie: MonsterDialogMoM.cs MonsterDialogMoM.MonsterDamageDec
  static monsterDamageDec(monster: Quest.Monster, call: MonsterRedraw): void {
    Destroyer.dialogParts();
    monster.damage -= 1;
    if (monster.damage < 0) {
      monster.damage = 0;
    }
    call(monster, true);
  }

  // Valkyrie: MonsterDialogMoM.cs MonsterDialogMoM.MonsterDamageInc
  static monsterDamageInc(monster: Quest.Monster, call: MonsterRedraw): void {
    monster.damage += 1;
    if (monster.damage > monster.getHealth()) {
      monster.damage = monster.getHealth();
    }
    call(monster, true);
  }

  // Valkyrie: MonsterDialogMoM.cs MonsterDialogMoM.Attack
  attack(): void {
    const game = Game.get();
    // Save to undo stack
    game.currentQuest!.save();
    new InvestigatorAttack(this.monster);
  }

  // Valkyrie: MonsterDialogMoM.cs MonsterDialogMoM.Evade
  evade(): void {
    new InvestigatorEvade(this.monster);
  }

  // Valkyrie: MonsterDialogMoM.cs MonsterDialogMoM.Horror
  horror(): void {
    new HorrorCheck(this.monster);
  }
}
