// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/LogWindow.cs
// What the log window lists and the variables it lets a developer change; the app draws it (game.ui.logWindow).
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { floatTryParse, trim } from '../platform/CSharp.ts';

// Valkyrie: LogWindow.cs LogWindow
export class LogWindow {
  developerToggle = false;

  // Construct and display
  constructor() {
    this.developerToggle = Game.get().testMode;
    this.update();
  }

  // Valkyrie: LogWindow.cs LogWindow.Update
  update(toggle = false): void {
    this.developerToggle = this.developerToggle !== toggle;
    const game = Game.get();
    game.logWindow = this;
    game.ui.logWindow(this);
  }

  /** Not in Valkyrie: the entries the window shows, without their surrounding new lines, the empty ones left out. */
  entries(): string[] {
    const entries: string[] = [];
    for (const e of Game.get().currentQuest!.log) {
      const entry = trim(e.getEntry(this.developerToggle), '\n');
      if (entry.length === 0) continue;
      entries.push(entry);
    }
    return entries;
  }

  /**
   * Not in Valkyrie: whether Update draws anything with UIElement's default tag, dialog: its lines and a developer's
   * variables (DrawVarList) are, so that while they are on screen whatever waits for no dialog does nothing.
   */
  drawsDialog(): boolean {
    return this.entries().length > 0 || (this.developerToggle && Game.get().currentQuest!.vars.vars.size > 0);
  }

  // Valkyrie: LogWindow.cs LogWindow.UpdateValue
  updateValue(key: string, text: string): void {
    const value = floatTryParse(text).value;
    Game.get().currentQuest!.vars.setValue(key, value);
    Destroyer.dialog();
    this.update();
  }
}
