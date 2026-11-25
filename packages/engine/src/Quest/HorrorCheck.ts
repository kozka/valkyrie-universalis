// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/HorrorCheck.cs
// Mansions' horror check against a monster: the quest's own horror event, or a random horror text for its type. The app
// draws the text (game.ui.horrorCheck).
import { HorrorData, MonsterData } from '../Content/ContentTypes.ts';
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { isNullOrWhiteSpace, listGet, replace } from '../platform/CSharp.ts';
import { Random } from '../platform/Random.ts';
import { LogEntry } from './LogEntry.ts';
import { MonsterDialogMoM } from './MonsterDialogMoM.ts';
import type { Quest } from './Quest.ts';
import { QuestMonster } from './QuestMonster.ts';

// Window with Investigator evade information
// Valkyrie: HorrorCheck.cs HorrorCheck
export class HorrorCheck {
  /** Not in Valkyrie: the monster and the text Draw shows, for the app. */
  monster: Quest.Monster | null = null;
  text = '';

  constructor(m: Quest.Monster) {
    const game = Game.get();

    const qm = m.monsterData instanceof QuestMonster ? m.monsterData : null;
    if (qm !== null && game.currentQuest!.qd.components.has(qm.cMonster.horrorEvent)) {
      game.currentQuest!.eManager.monsterImage = m;
      game.currentQuest!.eManager.queueEvent(qm.cMonster.horrorEvent);
    } else {
      this.pickHorror(m);
    }
  }

  // Valkyrie: HorrorCheck.cs HorrorCheck.PickHorror
  pickHorror(m: Quest.Monster): void {
    const game = Game.get();
    const horrors: HorrorData[] = [];
    for (const hd of game.cd.values(HorrorData)) {
      if (m.monsterData.sectionName === MonsterData.type + hd.monster) {
        horrors.push(hd);
      }
    }

    const qm = m.monsterData instanceof QuestMonster ? m.monsterData : null;
    if (horrors.length === 0 && qm !== null && !isNullOrWhiteSpace(qm.derivedType)) {
      for (const horrorData of game.cd.values(HorrorData)) {
        if (qm.derivedType === 'Monster' + horrorData.monster) {
          horrors.push(horrorData);
        }
      }
    }

    if (horrors.length !== 0) this.draw(listGet(horrors, Random.range(0, horrors.length)), m);
  }

  // Valkyrie: HorrorCheck.cs HorrorCheck.Draw
  protected draw(horror: HorrorData, m: Quest.Monster): void {
    const game = Game.get();
    // If a dialog window is open we force it closed (this shouldn't happen)
    game.ui.destroyTag(Game.DIALOG);

    this.monster = m;
    this.text = replace(horror.text.translate(), '{0}', m.monsterData.name.translate());
    game.ui.horrorCheck(this);

    game.currentQuest!.log.add(new LogEntry(replace(this.text, '\n', '\\n')));

    MonsterDialogMoM.drawMonster(m, true);
  }
}
