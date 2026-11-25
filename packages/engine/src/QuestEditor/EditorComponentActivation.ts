// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/EditorComponentActivation.cs
// Only what the activation's panel does to it; the panel is the app's (editor/MonsterPanel.tsx). Descent's
// activation's conditions are EditorComponentVarTestsUtil's.
import { LocalizationRead } from '../Content/LocalizationRead.ts';
import type { QuestData } from '../Content/QuestData.ts';
import { VarTests } from '../Quest/VarTests.ts';

/** The texts of an activation, by the end of their keys. */
export type ActivationText = 'ability' | 'movebutton' | 'master' | 'minion' | 'move';

export const EditorComponentActivation = {
  /** Descent's activations have conditions: an empty list of them when they have none. */
  // Valkyrie: EditorComponentActivation.cs EditorComponentActivation.D2EActivation
  givenTests(activation: QuestData.Activation): void {
    if (activation.tests === null) activation.tests = new VarTests();
  },

  /**
   * A text typed: the ability (Descent) or first message (Mansions) is kept when emptied; the others (the button
   * when it cannot attack, the master's and minion's actions or the attack, the move) go when emptied.
   */
  // Valkyrie: EditorComponentActivation.cs EditorComponentActivation.UpdateAbility, UpdateMoveButton, UpdateMasterActions, UpdateMinionActions and UpdateMove
  updateText(activation: QuestData.Activation, which: ActivationText, text: string): void {
    const keys: Record<ActivationText, string> = {
      ability: activation.ability_key,
      movebutton: activation.movebutton_key,
      master: activation.master_key,
      minion: activation.minion_key,
      move: activation.move_key,
    };
    const key = keys[which];
    if (text.length === 0) {
      if (which !== 'ability') LocalizationRead.dicts.get('qst')!.remove(key);
      return;
    }
    LocalizationRead.updateScenarioText(key, text);
  },

  // Valkyrie: EditorComponentActivation.cs EditorComponentActivation.ToggleMasterFirst
  toggleMasterFirst(activation: QuestData.Activation): void {
    activation.masterFirst = !activation.masterFirst;
  },

  // Valkyrie: EditorComponentActivation.cs EditorComponentActivation.ToggleMinionFirst
  toggleMinionFirst(activation: QuestData.Activation): void {
    activation.minionFirst = !activation.minionFirst;
  },
};
