// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/DialogWindow.cs
// The rules stay here; the app draws the window (game.ui.dialogWindow or dialogQuotaWindow) and its buttons call
// onButton, onQuota, quotaDec, quotaInc and onCancel. CreateWindow works out which buttons the app shows.
import { ContentData } from '../Content/ContentData.ts';
import { ItemData } from '../Content/ContentTypes.ts';
import { QuestButtonAction, type QuestButtonData } from '../Content/QuestButtonData.ts';
import { StringKey } from '../Content/StringKey.ts';
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { Color } from '../platform/Color.ts';
import { dictAdd, dictGet, listGet, replace, substring } from '../platform/CSharp.ts';
import { Mathf } from '../platform/Mathf.ts';
import { ColorUtil, hexToInt } from '../UI/ColorUtil.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import type { VarTests } from './VarTests.ts';
import { EventManager } from './EventManager.ts';
import { LogEntry } from './LogEntry.ts';
import type { Quest } from './Quest.ts';

// Valkyrie: DialogWindow.cs DialogWindow.EventButton
class EventButton {
  private label: StringKey = StringKey.NULL;
  colour: Color = Color.white;
  condition: VarTests | null = null;
  action: QuestButtonAction = QuestButtonAction.NONE;

  constructor(buttonData: QuestButtonData) {
    this.label = buttonData.label;
    const colorRGB = ColorUtil.fromName(buttonData.color);

    // Check format is valid
    if ((colorRGB.length !== 7 && colorRGB.length !== 9) || colorRGB[0] !== '#') {
      Game.get().currentQuest!.log.add(new LogEntry('Warning: Button color must be in #RRGGBB format or a known name', true));
    }

    // Not in Valkyrie (16 October 2026): a colour that Convert.ToInt32 or Substring cannot read threw; the button stays white
    try {
      // Hexadecimal to byte convert (Color32: 0x00-0xFF)
      const r = hexToInt(substring(colorRGB, 1, 2));
      const g = hexToInt(substring(colorRGB, 3, 2));
      const b = hexToInt(substring(colorRGB, 5, 2));
      // opaque by default
      const a = colorRGB.length === 9 ? hexToInt(substring(colorRGB, 7, 2)) : 255;
      this.colour = new Color(r / 255, g / 255, b / 255, a / 255);
    } catch {
      ValkyrieDebug.log('Warning: Unreadable button color, using white: ' + buttonData.color);
      this.colour = Color.white;
    }

    this.condition = buttonData.condition;
    this.action = buttonData.conditionFailedAction;
  }

  // Valkyrie: DialogWindow.cs EventButton.GetLabel
  getLabel(): StringKey {
    return new StringKey(null, EventManager.outputSymbolReplace(EventManager.Event.replaceComponentText(this.label.translate())), false);
  }
}

type _EventButton = EventButton;

/** A button CreateWindow draws: num is what pressing it passes to onButton; a disabled one is grey and does nothing. */
export interface DialogButton {
  button: EventButton;
  num: number;
  enabled: boolean;
}

// Class for creation of a dialog window with buttons and handling button press
// This is used for display of event information
// Valkyrie: DialogWindow.cs DialogWindow
export class DialogWindow {
  static readonly EventButton = EventButton;

  // The even that raises this dialog
  eventData: EventManager.Event;
  // An event can have a list of selected heroes
  heroList: Quest.Hero[];

  quota = 0;

  text = '';

  /** Not in Valkyrie: the buttons CreateWindow draws, in order (hidden ones left out). */
  buttons: DialogButton[] = [];

  /** Not in Valkyrie: the button CreateQuotaWindow draws, which calls onQuota. */
  quotaButton: EventButton | null = null;

  // Create from event
  constructor(e: EventManager.Event) {
    this.eventData = e;
    this.heroList = [];
    const game = Game.get();
    this.text = this.eventData.getText();

    // hero list can be populated from another event
    if (this.eventData.qEvent.heroListName !== '') {
      // Try to find the event
      if (!game.currentQuest!.heroSelection.has(this.eventData.qEvent.heroListName)) {
        const warning =
          'Warning: Hero selection in event: ' + this.eventData.qEvent.sectionName + ' from event ' + this.eventData.qEvent.heroListName + ' with no data.';
        ValkyrieDebug.log(warning);
        game.currentQuest!.log.add(new LogEntry(warning, true));
      } else {
        // Get selection data from other event
        for (const h of game.currentQuest!.heroSelection.get(this.eventData.qEvent.heroListName)!) {
          h.selected = true;
        }
      }
    }
    // Update selection status
    game.heroCanvas.updateStatus();

    if (this.eventData.qEvent.quota > 0 || this.eventData.qEvent.quotaVar.length > 0) {
      if (this.eventData.qEvent.quotaVar.length > 0) {
        this.quota = Mathf.roundToInt(game.currentQuest!.vars.getValue(this.eventData.qEvent.quotaVar));
      }
      this.createQuotaWindow();
    } else {
      this.createWindow();
    }

    this.drawItem();
  }

  // Valkyrie: DialogWindow.cs DialogWindow.CreateWindow
  createWindow(): void {
    const buttons = this.eventData.getButtons();
    const varManager = Game.get().currentQuest!.vars;

    this.buttons = [];
    let num = 0;
    for (const eb of buttons) {
      const numTmp = num++;
      // Handle condition failure
      const buttonConditionFailed = eb.condition !== null && !varManager.test(eb.condition);
      if (buttonConditionFailed && eb.action === QuestButtonAction.HIDE) {
        continue;
      }
      this.buttons.push({ button: eb, num: numTmp, enabled: !(buttonConditionFailed && eb.action === QuestButtonAction.DISABLE) });
    }

    // The text, the buttons and the cancel button when the event is cancelable
    Game.get().ui.dialogWindow(this);
  }

  // Valkyrie: DialogWindow.cs DialogWindow.CreateQuotaWindow
  createQuotaWindow(): void {
    // Only one button, action depends on quota
    this.quotaButton = listGet(this.eventData.getButtons(), 0);

    // The text, minus (when quota is not 0), the quota, plus (when quota is under 10), the button and cancel
    Game.get().ui.dialogQuotaWindow(this);
  }

  // Valkyrie: DialogWindow.cs DialogWindow.DrawItem
  drawItem(): void {
    if (this.eventData.qEvent.highlight) return;

    let item = '';
    let items = 0;
    for (const s of this.eventData.qEvent.addComponents) {
      if (s.indexOf('QItem') === 0) {
        item = s;
        items++;
      }
    }
    if (items !== 1) return;

    const game = Game.get();

    if (!game.currentQuest!.itemSelect.has(item)) return;

    const selectedItemData = game.cd.get(ItemData, game.currentQuest!.itemSelect.get(item)!);
    const tex = ContentData.fileToTexture(selectedItemData.image);
    // Not in Valkyrie (16 October 2026): Sprite.Create threw on a missing picture; the item shows with the app's placeholder
    if (tex === null) ValkyrieDebug.log('Warning: Missing item picture: ' + selectedItemData.image);

    game.ui.dialogItem(this, selectedItemData, tex);
  }

  // Valkyrie: DialogWindow.cs DialogWindow.quotaDec
  quotaDec(): void {
    this.quota--;
    Destroyer.dialog();
    this.createQuotaWindow();
  }

  // Valkyrie: DialogWindow.cs DialogWindow.quotaInc
  quotaInc(): void {
    this.quota++;
    Destroyer.dialog();
    this.createQuotaWindow();
  }

  // Valkyrie: DialogWindow.cs DialogWindow.onQuota
  onQuota(): void {
    const game = Game.get();
    const quest = game.currentQuest!;
    if (this.eventData.qEvent.quotaVar.length > 0) {
      quest.vars.setValue(this.eventData.qEvent.quotaVar, this.quota);
      this.onButton(0);
      return;
    }

    if (quest.eventQuota.has(this.eventData.qEvent.sectionName)) {
      quest.eventQuota.set(this.eventData.qEvent.sectionName, quest.eventQuota.get(this.eventData.qEvent.sectionName)! + this.quota);
    } else {
      dictAdd(quest.eventQuota, this.eventData.qEvent.sectionName, this.quota);
    }
    if (dictGet(quest.eventQuota, this.eventData.qEvent.sectionName) >= this.eventData.qEvent.quota) {
      quest.eventQuota.delete(this.eventData.qEvent.sectionName);
      this.onButton(0);
    } else {
      this.onButton(1);
    }
  }

  // Cancel cleans up
  // Valkyrie: DialogWindow.cs DialogWindow.onCancel
  onCancel(): void {
    Destroyer.dialog();
    Game.get().currentQuest!.eManager.currentEvent = null;
    // There may be a waiting event
    Game.get().currentQuest!.eManager.triggerEvent();
  }

  // Valkyrie: DialogWindow.cs DialogWindow.onButton
  onButton(num: number): void {
    // Do we have correct hero selection?
    if (!this.checkHeroes()) return;

    const game = Game.get();
    // Destroy this dialog to close
    Destroyer.dialog();

    // If the user started this event button is undoable
    if (this.eventData.qEvent.cancelable) {
      game.currentQuest!.save();
    }

    // Add this to the log
    game.currentQuest!.log.add(new LogEntry(replace(this.text, '\n', '\\n')));

    // Add this to the eventList
    game.currentQuest!.eventList.push(this.eventData.qEvent.sectionName);

    // Event manager handles the aftermath
    game.currentQuest!.eManager.endEvent(num);
  }

  // Check that the correct number of heroes are selected
  // Valkyrie: DialogWindow.cs DialogWindow.checkHeroes
  checkHeroes(): boolean {
    const game = Game.get();
    const quest = game.currentQuest!;

    this.heroList = [];

    // List all selected heroes
    for (const h of quest.heroes) {
      if (h.selected) {
        this.heroList.push(h);
      }
    }

    // Check that count matches
    if (this.eventData.qEvent.maxHeroes < this.heroList.length && this.eventData.qEvent.maxHeroes !== 0) return false;
    if (this.eventData.qEvent.minHeroes > this.heroList.length) return false;

    // Clear selection
    for (const h of quest.heroes) {
      h.selected = false;
    }

    // If this event has previous selected heroes clear the data
    // Add this selection to the quest (Remove then Add puts it back in its slot of the .NET Dictionary, as Map.set does)
    quest.heroSelection.set(this.eventData.qEvent.sectionName, this.heroList);

    // Update hero image state
    game.heroCanvas.updateStatus();

    // Selection OK
    return true;
  }
}

export declare namespace DialogWindow {
  type EventButton = _EventButton;
}
