// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/QuestMonster.cs
import { ActivationData, MonsterData } from '../Content/ContentTypes.ts';
import type { QuestData } from '../Content/QuestData.ts';
import { StringKey } from '../Content/StringKey.ts';
import { Game } from '../Game.ts';
import { listGet } from '../platform/CSharp.ts';
import { Random } from '../platform/Random.ts';
import { Path } from '../platform/SystemIO.ts';
import { EventManager } from './EventManager.ts';

// A monster quest class that is defined by the quest
// Valkyrie: QuestMonster.cs QuestMonster
export class QuestMonster extends MonsterData {
  useMonsterTypeActivations = false;
  cMonster: QuestData.CustomMonster;
  derivedType = '';

  // Construct with quest data
  constructor(qm: QuestData.CustomMonster) {
    super();
    const game = Game.get();
    this.cMonster = qm;

    // Get base derived monster type
    // Check for content data monster defined as base
    const baseObject = game.cd.tryGet(MonsterData, qm.baseMonster) ?? null;
    if (baseObject !== null) {
      // Set base monster type
      this.derivedType = qm.baseMonster;
    }

    // If name not set use base type
    if (!qm.monsterName.keyExists() && baseObject !== null) {
      this.name = baseObject.name;
    } else {
      this.name = qm.monsterName;
    }

    // Initialise sets
    this.sets = [];

    // define data
    this.sectionName = qm.sectionName;
    this.priority = 0;

    // Read traits from quest data or base type
    this.traits = qm.traits;
    if (this.traits.length === 0 && baseObject !== null) {
      this.traits = baseObject.traits;
    }

    // Read info from quest data or base type
    this.info = new StringKey(null, EventManager.outputSymbolReplace(qm.info.translate()), false);
    if (!qm.info.keyExists() && baseObject !== null) {
      this.info = baseObject.info;
    }

    this.image = qm.getImagePath();
    if (this.image.length === 0) {
      if (baseObject !== null) {
        this.image = baseObject.image;
      }
    } else {
      this.image = Path.getDirectoryName(game.currentQuest!.qd.questPath) + Path.DirectorySeparatorChar + this.image;
    }

    // Read placement image from quest data or base type
    this.imagePlace = qm.getImagePlacePath();
    if (this.imagePlace.length === 0) {
      if (baseObject !== null) {
        this.imagePlace = baseObject.image;
      } else {
        this.imagePlace = this.image;
      }
    } else {
      this.imagePlace = Path.getDirectoryName(game.currentQuest!.qd.questPath) + Path.DirectorySeparatorChar + this.imagePlace;
    }

    // Read activations  from quest data or base type
    this.activations = qm.activations;
    if (this.activations.length === 0 && baseObject !== null) {
      this.useMonsterTypeActivations = true;
    }

    this.healthBase = qm.healthBase;
    this.healthPerHero = qm.healthPerHero;
    if (!qm.healthDefined && baseObject !== null) {
      this.healthBase = baseObject.healthBase;
      this.healthPerHero = baseObject.healthPerHero;
    }

    this.horror = qm.horror;
    if (!qm.horrorDefined && baseObject !== null) {
      this.horror = baseObject.horror;
    }
    this.awareness = qm.awareness;
    if (!qm.awarenessDefined && baseObject !== null) {
      this.awareness = baseObject.awareness;
    }
  }

  // Valkyrie: QuestMonster.cs QuestMonster.GetRandomAttack
  override getRandomAttack(type: string): StringKey {
    if (!this.cMonster.investigatorAttacks.has(type)) {
      return super.getRandomAttack(type);
    }

    const attackOptions = this.cMonster.investigatorAttacks.get(type)!;
    return listGet(attackOptions, Random.range(0, attackOptions.length));
  }
}

// Class for quest defined activations
// Valkyrie: QuestMonster.cs QuestActivation
export class QuestActivation extends ActivationData {
  constructor(qa: QuestData.Activation) {
    super();
    // Read data from activation
    this.ability = qa.ability;
    if (!this.ability.keyExists()) {
      this.ability = StringKey.NULL;
    }
    this.masterActions = qa.masterActions;
    if (!this.masterActions.keyExists()) {
      this.masterActions = StringKey.NULL;
    }
    this.minionActions = qa.minionActions;
    if (!this.minionActions.keyExists()) {
      this.minionActions = StringKey.NULL;
    }
    this.minionFirst = qa.minionFirst;
    this.masterFirst = qa.masterFirst;
    this.move = qa.move;
    if (!this.move.keyExists()) {
      this.move = StringKey.NULL;
    }
    this.moveButton = qa.moveButton;
    if (!this.moveButton.keyExists()) {
      this.moveButton = StringKey.NULL;
    }
    this.sectionName = qa.sectionName;
  }
}
