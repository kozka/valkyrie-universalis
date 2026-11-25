// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/RoundControllerMoM.cs
// The transition window between phases goes through game.ui.
import { ChangePhaseWindow, Game, Mathf, Quest, QuestMonster, Random, RoundController, SaveManager, StringKey, dictGet, listGet } from '@universalis/engine';

// This round controller extends the standard controller for MoM specific round order
// Valkyrie: RoundControllerMoM.cs RoundControllerMoM
export class RoundControllerMoM extends RoundController {
  private endRoundRequested = false;

  // Investigators have finished
  // Valkyrie: RoundControllerMoM.cs RoundControllerMoM.HeroActivated
  override heroActivated(): void {
    const game = Game.get();
    const quest = game.currentQuest!;

    // Mark all Investigators as finished
    for (let i = 0; i < quest.heroes.length; i++) {
      quest.heroes[i]!.activated = true;
    }

    if (quest.vars.getValue('#eliminatedprev') > 0 && quest.vars.getValue('#eliminatedcomplete') <= 0) {
      quest.vars.setValue('#eliminatedcomplete', 1);
      if (quest.eManager.eventTriggerType('Eliminated', false)) {
        quest.eManager.triggerEvent();
        return;
      }
    }

    quest.phase = Quest.MoMPhase.mythos;
    game.stageUI!.update();
    game.monsterCanvas.updateList();

    quest.eManager.eventTriggerType('BeforeMonsterActivation', false);
    quest.eManager.eventTriggerType('Mythos', false);
    quest.eManager.eventTriggerType('EndInvestigatorTurn', false);
    // This will cause the next phase if nothing was added
    quest.eManager.triggerEvent();

    // Display the transition dialog for investigator phase
    ChangePhaseWindow.displayTransitionWindow(Quest.MoMPhase.mythos);
  }

  // Mark a monster as activated
  // Valkyrie: RoundControllerMoM.cs RoundControllerMoM.MonsterActivated
  override monsterActivated(): void {
    const game = Game.get();

    // Check for any partial monster activations
    for (const m of game.currentQuest!.monsters) {
      if (m.minionStarted || m.masterStarted) {
        m.activated = true;
      }
    }

    // Activate a monster
    if (this.activateMonster()) {
      this.checkNewRound();
    }
  }

  // Activate a monster
  // Valkyrie: RoundControllerMoM.cs RoundControllerMoM.ActivateMonster
  override activateMonster(monster?: Quest.Monster): boolean {
    if (monster !== undefined) return this.activateMonsterGroup(monster);
    const game = Game.get();
    const quest = game.currentQuest!;

    // Search for unactivated monsters
    const notActivated: number[] = [];
    // Get the index of all monsters that haven't activated
    for (let i = 0; i < quest.monsters.length; i++) {
      if (!quest.monsters[i]!.activated) {
        const monsterData = quest.monsters[i]!.monsterData;
        const qm = monsterData instanceof QuestMonster ? monsterData : null;
        if (
          qm !== null &&
          qm.activations !== null &&
          qm.activations.length === 1 &&
          qm.activations[0]!.indexOf('Event') === 0 &&
          dictGet(quest.eManager.events, qm.activations[0]!).disabled()
        ) {
          // monster cannot be activated, mark as activated
          quest.monsters[i]!.activated = true;
        } else {
          notActivated.push(i);
        }
      }
    }

    if (notActivated.length > 0) {
      // Find a random unactivated monster
      const toActivate = listGet(quest.monsters, listGet(notActivated, Random.range(0, notActivated.length)));

      // Find out of this monster is quest specific
      const qm = toActivate.monsterData instanceof QuestMonster ? toActivate.monsterData : null;
      if (qm !== null && qm.activations !== null && qm.activations.length === 1 && qm.activations[0]!.indexOf('Event') === 0) {
        toActivate.masterStarted = true;
        toActivate.activated = true;
        quest.eManager.monsterImage = toActivate;
        quest.eManager.queueEvent(qm.activations[0]!);
      } else {
        this.activateMonsterGroup(toActivate);
      }

      // Return false as activations remain
      return false;
    }

    return true;
  }

  // Valkyrie: RoundControllerMoM.cs RoundControllerMoM.EndRound
  override endRound(): void {
    this.endRoundRequested = true;
    super.endRound();
  }

  // Check if there are events that are required at the end of the round
  // Valkyrie: RoundControllerMoM.cs RoundControllerMoM.CheckNewRound
  override checkNewRound(): boolean {
    const game = Game.get();
    const quest = game.currentQuest!;

    // Return if there is an event open
    if (quest.eManager.currentEvent !== null) return false;

    // Return if there is an event queued
    if (quest.eManager.eventStack.count > 0) return false;

    if (quest.phase === Quest.MoMPhase.investigator) {
      return false;
    }

    if (quest.phase === Quest.MoMPhase.mythos) {
      if (quest.monsters.length > 0) {
        if (this.activateMonster()) {
          // no monster can be activated (activation conditions may prevent existing monster from doing anything), switch to horror phase
          quest.phase = Quest.MoMPhase.horror;
          game.stageUI!.update();
          return false;
        }
        // this is a recursive call, so we don't want to bring back monsters, if we have reached the end of activations
        // (activateMonster can change the phase, so it is read again)
        else if ((quest.phase as Quest.MoMPhase) !== Quest.MoMPhase.horror) {
          // going through monster activation: switch to phase monsters
          quest.phase = Quest.MoMPhase.monsters;
          game.stageUI!.update();
          return quest.eManager.currentEvent !== null;
        }
      } else {
        quest.phase = Quest.MoMPhase.horror;
        game.stageUI!.update();
        this.endRound();
        return quest.eManager.currentEvent !== null;
      }
    }

    if (quest.phase === Quest.MoMPhase.monsters) {
      quest.phase = Quest.MoMPhase.horror;
      game.stageUI!.update();
      return false;
    }

    // we need this test to make sure user can do the horro test, as a random event would switch the game to investigator phase
    if (!this.endRoundRequested && quest.phase === Quest.MoMPhase.horror && quest.monsters.length > 0) {
      return false;
    }

    // Finishing the round

    // reset the endRound Request
    this.endRoundRequested = false;

    // Clear all investigator activated
    for (const h of quest.heroes) {
      h.activated = false;
    }

    //  Clear monster activations
    for (const m of quest.monsters) {
      m.activated = false;
      m.minionStarted = false;
      m.masterStarted = false;
      m.currentActivation = null;
    }

    // Advance to next round
    const round = Mathf.roundToInt(quest.vars.getValue('#round')) + 1;
    quest.vars.setValue('#round', round);
    quest.log.add(new Quest.LogEntry(new StringKey('val', 'ROUND', round).translate()));

    quest.log.add(new Quest.LogEntry(new StringKey('val', 'PHASE_INVESTIGATOR').translate()));

    quest.phase = Quest.MoMPhase.investigator;
    game.stageUI!.update();
    game.monsterCanvas.updateList();

    game.audioControl.playTrait('newround');

    // Start of round events
    if (quest.vars.getValue('#eliminatedprev') > 0 && quest.vars.getValue('#eliminatedcomplete') <= 0) {
      quest.eManager.eventTriggerType('StartFinalRound');
    }

    quest.eManager.eventTriggerType('StartRound');

    SaveManager.save(0);

    // Display the transition dialog for investigator phase
    ChangePhaseWindow.displayTransitionWindow(Quest.MoMPhase.investigator);

    return true;
  }
}
