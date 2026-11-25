// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/InvestigatorAttack.cs
// Mansions' attack on a monster: which weapon, then the attack's text. The app draws both steps
// (game.ui.investigatorAttack, with attackText empty while the player chooses).
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { replace } from '../platform/CSharp.ts';
import { EventManager } from './EventManager.ts';
import { LogEntry } from './LogEntry.ts';
import { MonsterDialogMoM } from './MonsterDialogMoM.ts';
import type { Quest } from './Quest.ts';

// Window with Investigator attack information
// Valkyrie: InvestigatorAttack.cs InvestigatorAttack
export class InvestigatorAttack {
  // The monster that raises this dialog
  monster: Quest.Monster;
  attackText = '';

  constructor(m: Quest.Monster) {
    this.monster = m;
    this.attackOptions();
  }

  // Valkyrie: InvestigatorAttack.cs InvestigatorAttack.AttackOptions
  attackOptions(): void {
    // If a dialog window is open we force it closed (this shouldn't happen)
    Game.get().ui.destroyTag(Game.DIALOG);

    // The prompt, a button for each attack type and cancel
    Game.get().ui.investigatorAttack(this);

    MonsterDialogMoM.drawMonster(this.monster, true);
  }

  /** Not in Valkyrie: the attack types the prompt offers, from the monster's traits (MonsterData.GetAttackTypes). */
  attackTypes(): string[] {
    return [...this.monster.monsterData.getAttackTypes()];
  }

  // Valkyrie: InvestigatorAttack.cs InvestigatorAttack.Attack(string)
  attackWith(type: string): void {
    const text = this.monster.monsterData.getRandomAttack(type);
    this.attackText = EventManager.outputSymbolReplace(replace(text.translate(), '{0}', this.monster.monsterData.name.translate()));
    Game.get().currentQuest!.log.add(new LogEntry(replace(this.attackText, '\n', '\\n')));
    this.attack();
  }

  // Valkyrie: InvestigatorAttack.cs InvestigatorAttack.Attack()
  attack(): void {
    Destroyer.dialog();

    // The attack's text and the finished button
    Game.get().ui.investigatorAttack(this);

    MonsterDialogMoM.drawMonster(this.monster, true);
  }
}
