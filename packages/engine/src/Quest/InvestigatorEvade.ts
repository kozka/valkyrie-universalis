// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/InvestigatorEvade.cs
// Mansions' evade test against a monster: the quest's own evade event, or a random evade text for its type. The app
// draws the text (game.ui.investigatorEvade).
import { EvadeData, MonsterData } from '../Content/ContentTypes.ts';
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { isNullOrWhiteSpace, listGet, replace } from '../platform/CSharp.ts';
import { Random } from '../platform/Random.ts';
import { LogEntry } from './LogEntry.ts';
import { MonsterDialogMoM } from './MonsterDialogMoM.ts';
import type { Quest } from './Quest.ts';
import { QuestMonster } from './QuestMonster.ts';

// Window with Investigator evade information
// Valkyrie: InvestigatorEvade.cs InvestigatorEvade
export class InvestigatorEvade {
  m: Quest.Monster;
  text = '';

  constructor(monster: Quest.Monster) {
    this.m = monster;
    const game = Game.get();

    const qm = this.m.monsterData instanceof QuestMonster ? this.m.monsterData : null;
    if (qm !== null && game.currentQuest!.qd.components.has(qm.cMonster.evadeEvent)) {
      game.currentQuest!.eManager.monsterImage = this.m;
      game.currentQuest!.eManager.queueEvent(qm.cMonster.evadeEvent);
    } else {
      this.pickEvade(this.m);
    }
  }

  // Valkyrie: InvestigatorEvade.cs InvestigatorEvade.PickEvade
  pickEvade(m: Quest.Monster): void {
    const game = Game.get();
    const evades = [...game.cd.values(EvadeData)].filter((md) => m.monsterData.sectionName === MonsterData.type + md.monster);

    const qm = m.monsterData instanceof QuestMonster ? m.monsterData : null;
    if (evades.length === 0 && qm !== null && !isNullOrWhiteSpace(qm.derivedType)) {
      evades.push(...[...game.cd.values(EvadeData)].filter((kv) => qm.derivedType === MonsterData.type + kv.monster));
    }

    if (evades.length > 0) {
      this.text = replace(listGet(evades, Random.range(0, evades.length)).text.translate(), '{0}', m.monsterData.name.translate());

      game.currentQuest!.log.add(new LogEntry(replace(this.text, '\n', '\\n')));

      this.draw();
    }
  }

  // Valkyrie: InvestigatorEvade.cs InvestigatorEvade.Draw
  draw(): void {
    Destroyer.dialog();
    Game.get().ui.investigatorEvade(this);

    MonsterDialogMoM.drawMonster(this.m, true);
  }
}
