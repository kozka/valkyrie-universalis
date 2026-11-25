// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/InfoDialog.cs
// A monster's information (its rules, and a unique monster's extra text); the app draws it (game.ui.infoDialog).
import { Game } from '../Game.ts';
import { replace } from '../platform/CSharp.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { EventManager } from './EventManager.ts';
import type { Quest } from './Quest.ts';

// Monster information dialog (additional rules)
// Valkyrie: InfoDialog.cs InfoDialog
export class InfoDialog {
  monster: Quest.Monster | null = null;

  constructor(m: Quest.Monster | null) {
    if (m === null) {
      ValkyrieDebug.log('Warning: Invalid monster type requested.');
      return;
    }
    this.monster = m;
    Game.get().ui.infoDialog(this);
  }

  /** Not in Valkyrie: the box with the monster's information, with its symbols. */
  info(): string {
    const m = this.monster!;
    return m.monsterData !== null && m.monsterData.info !== null ? EventManager.outputSymbolReplace(m.monsterData.info.translate()) : '';
  }

  /** Not in Valkyrie: a unique monster's additional text, or null when it has none. */
  uniqueText(): string | null {
    const m = this.monster!;
    if (!m.unique || !m.uniqueText.keyExists()) return null;
    return EventManager.outputSymbolReplace(replace(m.uniqueText.translate(), '\\n', '\n'));
  }

  // Close cleans up
  // Valkyrie: InfoDialog.cs InfoDialog.onClose
  onClose(): void {
    // Clean up everything marked as 'dialog'
    Game.get().ui.destroyTag(Game.DIALOG);
  }
}
