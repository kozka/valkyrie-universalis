// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/RoundController.cs
// Activation windows go through game.ui. The game-type check in ActivateMonster reads GameType.typeName() (porting rules).
import { ActivationData, MonsterData } from '../Content/ContentTypes.ts';
import { QuestData } from '../Content/QuestData.ts';
import { StringKey } from '../Content/StringKey.ts';
import { Game } from '../Game.ts';
import { Application } from '../platform/Application.ts';
import { listGet, substring } from '../platform/CSharp.ts';
import { Mathf } from '../platform/Mathf.ts';
import { Random } from '../platform/Random.ts';
import { SaveManager } from '../SaveManager.ts';
import { ValkyrieConstants } from '../ValkyrieConstants.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { ActivateDialog } from './ActivateDialog.ts';
import { ActivateDialogMoM } from './ActivateDialogMoM.ts';
import { LogEntry } from './LogEntry.ts';
import type { Quest } from './Quest.ts';
import { QuestActivation, QuestMonster } from './QuestMonster.ts';

// This class controls the progression of activations and events
// Valkyrie: RoundController.cs RoundController
export class RoundController {
  // Latch activations finished incase more monsters come
  private activationsFinished = false;

  // A hero has finished their turn
  // Valkyrie: RoundController.cs RoundController.HeroActivated
  heroActivated(): void {
    const game = Game.get();
    // Check if all heros have finished
    let herosActivated = true;
    for (const h of game.currentQuest!.heroes) {
      if (!h.activated && h.heroData !== null) herosActivated = false;
    }

    // activate a monster group (returns if all activated, does nothing if none left)
    const monstersActivated = this.activateMonster();

    // If everyone has finished move to next round
    if (monstersActivated && herosActivated) {
      this.activationsFinished = true;
      this.endRound();
    }
  }

  // Finish the other half of monster activation
  // Valkyrie: RoundController.cs RoundController.ParticalActivationComplete
  particalActivationComplete(m: Quest.Monster): void {
    // Start the other half of the activation
    new ActivateDialog(m, m.minionStarted);
    m.minionStarted = true;
    m.masterStarted = true;
  }

  // Valkyrie: RoundController.cs RoundController.Reset
  reset(): void {
    this.activationsFinished = false;
  }

  // A monster has activated, work out what to do next
  // Valkyrie: RoundController.cs RoundController.MonsterActivated
  monsterActivated(): void {
    const game = Game.get();

    // Check for any partial monster activations
    for (const m of game.currentQuest!.monsters) {
      if (m.minionStarted !== m.masterStarted) {
        // Half activated group, complete then return;
        this.particalActivationComplete(m);
        return;
      }

      // If both started then it is complete
      if (m.minionStarted && m.masterStarted) {
        m.activated = true;
      }
    }

    // Full activation, update display
    game.monsterCanvas.updateStatus();

    // Check if all heros have finished
    let herosActivated = true;
    for (const h of game.currentQuest!.heroes) {
      if (!h.activated && h.heroData !== null) herosActivated = false;
    }

    // If there no heros left activate another monster
    if (herosActivated) {
      if (this.activateMonster()) {
        // Evenyone has finished, move to next round
        this.activationsFinished = true;
        game.currentQuest!.adjustMorale(0);
        this.endRound();
      }
    } else {
      // Trigger morale event if required
      game.currentQuest!.adjustMorale(0);
    }
  }

  /** ActivateMonster(): activate a monster (if any left) and return true if all monsters activated; ActivateMonster(m): that one. */
  // Valkyrie: RoundController.cs RoundController.ActivateMonster
  activateMonster(monster?: Quest.Monster): boolean {
    const game = Game.get();
    if (monster !== undefined) return this.activateMonsterGroup(monster);

    const notActivated: number[] = [];
    // Get the index of all monsters that haven't activated
    for (let i = 0; i < game.currentQuest!.monsters.length; i++) {
      if (!game.currentQuest!.monsters[i]!.activated) notActivated.push(i);
    }

    // If no monsters are found return true
    if (notActivated.length === 0) return true;

    // Find a random unactivated monster
    const toActivate = listGet(game.currentQuest!.monsters, listGet(notActivated, Random.range(0, notActivated.length)));

    return this.activateMonsterGroup(toActivate);
  }

  // Activate a monster
  // Valkyrie: RoundController.cs RoundController.ActivateMonster(Quest.Monster)
  protected activateMonsterGroup(m: Quest.Monster): boolean {
    let adList: ActivationData[] = [];
    const game = Game.get();
    const quest = game.currentQuest!;

    let customActivations = false;
    let md: MonsterData = m.monsterData;

    // Find out of this monster is quest specific
    const qm = md instanceof QuestMonster ? md : null;
    if (qm !== null) {
      // Get the base monster type
      if (game.cd.containsKey(MonsterData, qm.derivedType)) {
        md = game.cd.get(MonsterData, qm.derivedType);
      }

      // Determine if the monster has quest specific activations
      customActivations = !qm.useMonsterTypeActivations;
    }

    // A monster with quest specific activations
    if (customActivations) {
      if (!qm!.useMonsterTypeActivations) {
        adList = [];
        // Get all custom activations
        for (const s of qm!.activations) {
          const component = quest.qd.components.get('Activation' + s);
          const activation = component instanceof QuestData.Activation ? component : null;
          // Find the activation in quest data
          if (component !== undefined && quest.vars.test(activation!.tests)) {
            adList.push(new QuestActivation(activation!));
          }
          // Otherwise look for the activation in content data
          else {
            const activationData = game.cd.tryGet(ActivationData, 'MonsterActivation' + s);
            if (activationData !== undefined) {
              adList.push(activationData);
            } // Invalid activation
            else {
              quest.log.add(new LogEntry('Warning: Unable to find activation: ' + s + ' for monster type: ' + m.monsterData.sectionName, true));
            }
          }
        }
      }
    } // Content Data activations only
    else {
      // Find all possible activations
      for (const [key, value] of game.cd.getAll(ActivationData)) {
        // Is this activation for this monster type? (replace "Monster" with "MonsterActivation", ignore specific variety)
        if (key.indexOf('MonsterActivation' + substring(md.sectionName, 'Monster'.length)) === 0) {
          adList.push(value);
        }
      }

      // Search for additional common activations
      for (const s of md.activations) {
        const activationData = game.cd.tryGet(ActivationData, 'MonsterActivation' + s);
        if (activationData !== undefined) {
          adList.push(activationData);
        } else {
          ValkyrieDebug.log('Warning: Unable to find activation: ' + s + ' for monster type: ' + md.sectionName);
        }
      }
    }

    // Check for no activations
    if (adList.length === 0) {
      ValkyrieDebug.log('Error: Unable to find any activation data for monster type: ' + md.name.toString());
      Application.quit('no-activation', md.sectionName, 'Error: Unable to find any activation data for monster type: ' + md.sectionName);
    }

    // No current activation
    if (m.currentActivation === null) {
      // Pick a random activation
      const activation = listGet(adList, Random.range(0, adList.length));
      m.newActivation(activation);
    }

    // MoM has a special activation
    if (game.gameType.typeName() === ValkyrieConstants.typeMom) {
      m.masterStarted = true;
      new ActivateDialogMoM(m);
      return false;
    }

    // If no minion activation just do master
    if (m.currentActivation!.ad.minionActions.fullKey.length === 0) {
      m.minionStarted = true;
      m.masterStarted = true;
      new ActivateDialog(m, true, true);
      return false;
    }

    // If no master activation just do minion
    if (m.currentActivation!.ad.masterActions.fullKey.length === 0) {
      m.minionStarted = true;
      m.masterStarted = true;
      new ActivateDialog(m, false, true);
      return false;
    }

    // Random pick Minion or master (both available)
    m.minionStarted = Random.range(0, 2) === 0;

    // If order specificed then use that instead
    if (m.currentActivation!.ad.masterFirst) {
      m.minionStarted = false;
    }

    if (m.currentActivation!.ad.minionFirst) {
      m.minionStarted = true;
    }

    // Master is opposite of minion as this is the first activation
    m.masterStarted = !m.minionStarted;

    // Create activation window
    new ActivateDialog(m, m.masterStarted);

    // More groups unactivated
    return false;
  }

  // All activations finished, start end of round
  // Valkyrie: RoundController.cs RoundController.EndRound
  endRound(): void {
    const game = Game.get();
    const quest = game.currentQuest!;

    // Queue end of all round events
    quest.eManager.eventTriggerType('EndRound', false);
    // Queue end of this round events (depriciated)
    const round = Mathf.roundToInt(quest.vars.getValue('#round'));
    quest.eManager.eventTriggerType('EndRound' + round, false);

    if (quest.vars.getValue('#eliminatedprev') > 0 && quest.vars.getValue('#eliminatedcomplete') <= 0) {
      quest.vars.setValue('#eliminatedcomplete', 1);
      quest.eManager.eventTriggerType('Eliminated', false);
    }

    if (quest.vars.getValue('#eliminated') > 0) {
      quest.vars.setValue('#eliminatedprev', 1);
    }

    // This will cause the end of the round if nothing was added
    quest.eManager.triggerEvent();
  }

  // Check if ready for new round
  // Valkyrie: RoundController.cs RoundController.CheckNewRound
  checkNewRound(): boolean {
    const game = Game.get();
    const quest = game.currentQuest!;

    // Is there an active event?
    if (quest.eManager.currentEvent !== null) return false;

    // Are there queued events?
    if (quest.eManager.eventStack.count > 0) return false;

    if (!this.activationsFinished) return false;

    // Clean up for next round
    this.activationsFinished = false;
    // Clear hero activations
    for (const h of quest.heroes) {
      h.activated = false;
    }

    // Clear monster activations
    for (const m of quest.monsters) {
      m.activated = false;
      m.minionStarted = false;
      m.masterStarted = false;
      m.currentActivation = null;
    }

    // Increment the round
    const round = Mathf.roundToInt(quest.vars.getValue('#round')) + 1;
    quest.vars.setValue('#round', round);

    quest.log.add(new LogEntry(new StringKey('val', 'ROUND', round).translate()));

    // Update monster and hero display
    game.monsterCanvas.updateStatus();
    game.heroCanvas.updateStatus();

    game.audioControl.playTrait('newround');

    // Start of round events
    quest.eManager.eventTriggerType('StartRound');
    SaveManager.save(0);
    return true;
  }
}
