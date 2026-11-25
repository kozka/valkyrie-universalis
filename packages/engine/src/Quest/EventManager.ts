// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/EventManager.cs
// Windows go through game.ui (DialogWindow keeps its rules in the engine). Nested C# classes are module classes exposed
// as static members, as in QuestData.ts. The game-type check in TriggerEvent reads GameType.typeName() (porting rules).
// Not in Valkyrie: in a test from the editor, it keeps which events started and why (started, EventCause).
import { AudioData, HeroData, ItemData, MonsterData, TileSideData } from '../Content/ContentTypes.ts';
import { ContentData } from '../Content/ContentData.ts';
import { CommonStringKeys } from '../Content/CommonStringKeys.ts';
import { PerilData } from '../Content/PerilData.ts';
import { QuestButtonAction, QuestButtonData } from '../Content/QuestButtonData.ts';
import { QuestData } from '../Content/QuestData.ts';
import { StringKey } from '../Content/StringKey.ts';
import { Game } from '../Game.ts';
import { GameStateManager } from '../GameStateManager.ts';
import {
  NewLine,
  boolToString,
  boolTryParse,
  charAt,
  dictAdd,
  dictGet,
  floatToString,
  indexOf,
  listGet,
  replace,
  split,
  substring,
} from '../platform/CSharp.ts';
import { Mathf } from '../platform/Mathf.ts';
import { Random } from '../platform/Random.ts';
import { Stack } from '../platform/Stack.ts';
import { File, Path } from '../platform/SystemIO.ts';
import { ValkyrieConstants } from '../ValkyrieConstants.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { CameraController } from './CameraController.ts';
import { DialogWindow } from './DialogWindow.ts';
import { LogEntry } from './LogEntry.ts';
import { PuzzleCodeWindow } from './PuzzleCodeWindow.ts';
import { PuzzleImageWindow } from './PuzzleImageWindow.ts';
import { PuzzleSlideWindow } from './PuzzleSlideWindow.ts';
import { PuzzleTowerWindow } from './PuzzleTowerWindow.ts';
import { Quest } from './Quest.ts';
import { QuestMonster } from './QuestMonster.ts';
import { ShopInterface } from './ShopInterface.ts';
import type { VarManager } from './VarManager.ts';

/**
 * Not in Valkyrie: why an event was queued, for the editor's test panel: a trigger, a button of an event (one of its
 * next events, at random or the first enabled), a component pressed on the board, or something else (a monster's evade
 * or horror event, an item's inspect event).
 */
export type EventCause =
  | { kind: 'trigger'; trigger: string }
  | { kind: 'button'; event: string; button: number; random: boolean }
  | { kind: 'board' }
  | { kind: 'other' };

/**
 * Not in Valkyrie: an event that started in a test from the editor, why, in which round and in which quest (its
 * quest.ini); a change of quest is one too, named by the quest.ini it goes to, in the quest it leaves.
 */
export interface StartedEvent {
  name: string;
  cause: EventCause;
  round: number;
  quest: string;
  /** A change of quest, named by the quest.ini it goes to (StartQuestEvent). */
  changesQuest?: true;
}

const OTHER: EventCause = { kind: 'other' };

// Event control class
// Valkyrie: EventManager.cs EventManager.Event
class Event {
  private addsFallbackContinueButton: boolean;
  game: Game;
  /** Null when no event of the quest has this name, as in C# (a quest change or a missing component). */
  qEvent: QuestData.Event = null as unknown as QuestData.Event;

  // Create event from quest data
  constructor(name: string, addsFallbackContinueButton = true) {
    this.addsFallbackContinueButton = addsFallbackContinueButton;
    this.game = Game.get();
    if (this.game.currentQuest!.qd.components.has(name)) {
      const component = this.game.currentQuest!.qd.components.get(name);
      this.qEvent = (component instanceof QuestData.Event ? component : null) as QuestData.Event;
    }
  }

  // Get the text to display for the event
  // Valkyrie: EventManager.cs Event.GetText
  getText(): string {
    let text = this.qEvent.text.translate(true);

    // Find and replace {q:element with the name of the
    // element

    text = Event.replaceComponentText(text);

    // Find and replace rnd:hero with a hero
    // replaces all occurances with the one hero

    const h = this.game.currentQuest!.getRandomHero();
    if (text.includes('{rnd:hero')) {
      h.selected = true;
    }
    text = replace(text, '{rnd:hero}', h.heroData!.name.translate());

    // Random heroes can have custom lookups
    if (text.startsWith('{rnd:hero:')) {
      const hero: HeroData = h.heroData!;
      let start = '{rnd:hero:'.length;
      if (!hero.containsTrait('male')) {
        if (charAt(text, start) === '{') {
          start = indexOf(text, '}', start);
        }
        start = indexOf(text, ':{', start) + 1;
        if (charAt(text, start) === '{') {
          start = indexOf(text, '}', start);
        }
        start = indexOf(text, ':', start) + 1;
      }
      let next = start;
      if (charAt(text, next) === '{') {
        next = indexOf(text, '}', next);
      }
      next = indexOf(text, ':{', next) + 1;
      let end = next;
      if (charAt(text, end) === '{') {
        end = indexOf(text, '}', end);
      }
      end = indexOf(text, ':', end);
      if (end < 0) end = text.length - 1;
      const toReplace = substring(text, next, end - next);
      text = new StringKey(substring(text, start, next - start - 1)).translate();
      text = replace(text, toReplace, hero.name.translate());
    }

    // Fix new lines and replace symbol text with special characters
    return replace(EventManager.outputSymbolReplace(text), '\\n', '\n');
  }

  // Valkyrie: EventManager.cs Event.ReplaceComponentText
  static replaceComponentText(input: string): string {
    let toReturn = input;
    if (toReturn.includes('{c:')) {
      const questItemRegex = /\{c:(((?!\{).)*?)\}/g;
      for (const oneVar of input.matchAll(questItemRegex)) {
        const replaceFrom = oneVar[0];
        const componentName = oneVar[1]!;
        const component = Game.get().currentQuest!.qd.components.get(componentName);
        if (component !== undefined) {
          const componentText = Event.getComponentText(component);
          toReturn = replace(toReturn, replaceFrom, componentText);
        }
      }
    }
    return toReturn;
  }

  /** Get text related with selected component. */
  // Valkyrie: EventManager.cs Event.getComponentText (switch on the exact class, as GetType().Name)
  static getComponentText(component: QuestData.QuestComponent): string {
    const game = Game.get();
    const quest = game.currentQuest!;
    switch (component.constructor) {
      case QuestData.Event: {
        const selection = quest.heroSelection.get(component.sectionName);
        if (selection === undefined || selection.length === 0) {
          return component.sectionName;
        }
        return selection[0]!.heroData!.name.translate();
      }
      case QuestData.Tile:
        // Replaced with the name of the Tile
        return game.cd.get(TileSideData, (component as QuestData.Tile).tileSideName).name.translate();
      case QuestData.CustomMonster:
        // Replaced with the custom nonster name
        return (component as QuestData.CustomMonster).monsterName.translate();
      case QuestData.Spawn: {
        if (!quest.monsterSelect.has(component.sectionName)) {
          return component.sectionName;
        }
        // Replaced with the text shown in the spawn
        const monsterName = quest.monsterSelect.get(component.sectionName)!;
        if (monsterName.startsWith('Custom')) {
          return (dictGet(quest.qd.components, monsterName) as QuestData.CustomMonster).monsterName.translate();
        } else {
          const monsterData = game.cd.get(MonsterData, monsterName);
          return monsterData.name.translate();
        }
      }
      case QuestData.QItem: {
        if (!quest.itemSelect.has(component.sectionName)) {
          return component.sectionName;
        }
        // Replaced with the first element in the list
        const itemData = game.cd.get(ItemData, quest.itemSelect.get(component.sectionName)!);
        return itemData.name.translate();
      }
      default:
        return component.sectionName;
    }
  }

  // Valkyrie: EventManager.cs Event.GetButtons
  getButtons(): DialogWindow.EventButton[] {
    const buttons: DialogWindow.EventButton[] = [];

    // Determine if no buttons should be displayed
    if (!this.buttonsPresent()) {
      return buttons;
    }

    for (let i = 0; i < this.qEvent.buttons.length; i++) {
      buttons.push(new DialogWindow.EventButton(this.qEvent.buttons[i]!));
    }

    // If there are no enabled buttons - add a default continue button
    const atLeastOneButtonActive = buttons.some((b) => b.action === QuestButtonAction.NONE || Game.get().currentQuest!.vars.test(b.condition));
    if (this.addsFallbackContinueButton && !atLeastOneButtonActive) {
      buttons.push(new DialogWindow.EventButton(new QuestButtonData(CommonStringKeys.CONTINUE)));
    }

    return buttons;
  }

  // Is the confirm button present?
  // Valkyrie: EventManager.cs Event.ButtonsPresent
  buttonsPresent(): boolean {
    const quest = this.game.currentQuest!;
    // If the event can't be canceled it must have buttons
    if (!this.qEvent.cancelable) return true;
    // Check if any of the next events are enabled
    for (const l of this.qEvent.buttons) {
      for (const s of l.eventNames) {
        // Check if the event doesn't exists - quest fault
        if (!quest.eManager.events.has(s)) {
          let questToTransition = quest.originalPath + Path.DirectorySeparatorChar + s;
          if (quest.fromSavegame) {
            questToTransition = ContentData.valkyrieLoadQuestPath + Path.DirectorySeparatorChar + s;
          }
          if (File.exists(questToTransition)) {
            dictAdd(quest.eManager.events, s, new StartQuestEvent(s));
            return true;
          } else {
            ValkyrieDebug.log('Warning: Missing event called: ' + s);
            quest.log.add(new LogEntry('Warning: Missing event called: ' + s, true));
            // Not in Valkyrie (16 October 2026): it returned false here, hiding the buttons even when a later event is enabled
            continue;
          }
        }
        if (!quest.eManager.events.get(s)!.disabled()) return true;
      }
    }
    // Nothing valid, no buttons
    return false;
  }

  // Is this event disabled?
  // Valkyrie: EventManager.cs Event.Disabled
  disabled(): boolean {
    if (this.game.debugTests) {
      ValkyrieDebug.log('Event test ' + this.qEvent.sectionName + ' result is : ' + boolToString(this.game.currentQuest!.vars.test(this.qEvent.tests)));
    }

    // check if condition is valid, and if there is something to do in this event (see #916)
    return !this.game.currentQuest!.vars.test(this.qEvent.tests);
  }
}

// Valkyrie: EventManager.cs EventManager.StartQuestEvent
class StartQuestEvent extends Event {
  name: string;

  constructor(n: string) {
    super(n);
    this.name = n;
  }

  override disabled(): boolean {
    return false;
  }
}

// Monster event extends event for adding monsters
// Valkyrie: EventManager.cs EventManager.MonsterEvent
class MonsterEvent extends Event {
  qMonster: QuestData.Spawn;
  cMonster: MonsterData = null as unknown as MonsterData;

  constructor(name: string) {
    super(name);
    // cast the monster event
    this.qMonster = (this.qEvent instanceof QuestData.Spawn ? this.qEvent : null) as QuestData.Spawn;

    // monsters are generated on the fly to avoid duplicate for D2E when using random
  }

  // Valkyrie: EventManager.cs MonsterEvent.MonsterEventSelection
  monsterEventSelection(): void {
    const quest = this.game.currentQuest!;
    if (!quest.runtimeMonsterSelection(this.qMonster.sectionName)) {
      ValkyrieDebug.log('Warning: Monster type unknown in event: ' + this.qMonster.sectionName);
      return;
    }
    const t = dictGet(quest.monsterSelect, this.qMonster.sectionName);
    if (quest.qd.components.has(t)) {
      const component = quest.qd.components.get(t);
      this.cMonster = new QuestMonster((component instanceof QuestData.CustomMonster ? component : null) as QuestData.CustomMonster);
    } else {
      this.cMonster = this.game.cd.get(MonsterData, t);
    }
  }

  // Event text
  // Valkyrie: EventManager.cs MonsterEvent.GetText
  override getText(): string {
    // Not in Valkyrie (16 October 2026): without a monster selected the text is shown as written, instead of throwing
    if (this.cMonster === null) return super.getText();
    // Monster events have {type} replaced with the selected type
    return replace(super.getText(), '{type}', this.cMonster.name.translate());
  }

  // Unique monsters can have a special name
  // Valkyrie: EventManager.cs MonsterEvent.GetUniqueTitle
  getUniqueTitle(): StringKey {
    // Default to Master {type}
    if (this.qMonster.uniqueTitle.keyExists()) {
      return new StringKey('val', 'MONSTER_MASTER_X', this.cMonster.name);
    }
    return new StringKey(this.qMonster.uniqueTitle, '{type}', this.cMonster.name.fullKey);
  }
}

// Peril extends event
// Valkyrie: EventManager.cs EventManager.Peril
class Peril extends Event {
  cPeril: PerilData;

  constructor(name: string) {
    super(name);
    // Event is pulled from content data not quest data
    this.cPeril = this.game.cd.get(PerilData, name);
    this.qEvent = this.cPeril;
  }
}

// Token event extends event for handling tokens
// Valkyrie: EventManager.cs EventManager.Token
class Token extends Event {
  constructor(name: string) {
    super(name, false);
  }
}

type _Event = Event;
type _StartQuestEvent = StartQuestEvent;
type _MonsterEvent = MonsterEvent;
type _Peril = Peril;
type _Token = Token;

// Class for managing quest events
// Valkyrie: EventManager.cs EventManager
export class EventManager {
  static readonly Event = Event;
  static readonly StartQuestEvent = StartQuestEvent;
  static readonly MonsterEvent = MonsterEvent;
  static readonly Peril = Peril;
  static readonly Token = Token;

  // A dictionary of available events
  events: Map<string, Event> = new Map();

  // events should display monster image when not null
  monsterImage: Quest.Monster | null = null;
  // events should display monster health if true
  monsterHealth = false;

  // Stack of events to be triggered
  eventStack: Stack<Event> = new Stack();

  game: Game = null as unknown as Game;

  // Event currently open
  currentEvent: Event | null = null;

  /** Not in Valkyrie: in a test from the editor (Game.testMode), each event that started and why, the newest last. */
  readonly started: StartedEvent[] = [];
  /** Why the events queued now are queued, and why each event was queued last. */
  private queueCause: EventCause = OTHER;
  private readonly causes = new WeakMap<Event, EventCause>();

  /** EventManager() or EventManager(data), the [EventManager] section of a save. */
  constructor(data: Map<string, string> | null = null) {
    this.init(data);
  }

  // Valkyrie: EventManager.cs EventManager.Init
  init(data: Map<string, string> | null): void {
    this.game = Game.get();
    const quest = this.game.currentQuest!;

    // This is filled out later but is required for loading saves
    quest.eManager = this;

    this.events = new Map();
    this.eventStack = new Stack();

    // Find quest events
    for (const [key, value] of quest.qd.components) {
      if (value instanceof QuestData.Event) {
        // If the event is a monster type cast it
        if (value instanceof QuestData.Spawn) {
          dictAdd(this.events, key, new MonsterEvent(key));
        } else if (value instanceof QuestData.Token) {
          dictAdd(this.events, key, new Token(key));
        } else {
          dictAdd(this.events, key, new Event(key));
        }
      }
    }

    // Add game content perils as available events
    for (const perilKey of this.game.cd.keys(PerilData)) {
      dictAdd(this.events, perilKey, new Peril(perilKey));
    }

    if (data !== null) {
      if (data.has('queue')) {
        for (const s of split(data.get('queue')!, [' '], undefined, true)) {
          this.eventStack.push(dictGet(this.events, s));
        }
      }
      if (data.has('monsterimage')) {
        this.monsterImage = Quest.Monster.getMonster(data.get('monsterimage')!);
      }
      if (data.has('monsterhealth')) {
        this.monsterHealth = boolTryParse(data.get('monsterhealth')).value;
      }
      if (data.has('currentevent') && quest.activeShop !== data.get('currentevent')) {
        this.currentEvent = dictGet(this.events, data.get('currentevent')!);
        this.resumeEvent();
      }
    }
  }

  // Queue all events by trigger, optionally start
  // Valkyrie: EventManager.cs EventManager.EventTriggerType
  eventTriggerType(type: string, trigger = true): boolean {
    return this.queueBecause({ kind: 'trigger', trigger: type }, () => {
      let queued = false;
      // Not in Valkyrie (16 October 2026): the events that run now can add a quest change to this dictionary, which made .NET
      // throw "Collection was modified"; a copy is walked instead, stopping once the quest has changed
      for (const [key, value] of [...this.events]) {
        if (this.game.currentQuest!.eManager !== this) break;
        if (this.events.get(key) !== value) continue;
        if (value.qEvent !== null && value.qEvent.trigger === type) {
          queued = this.queueEvent(key, trigger) || queued;
        }
      }

      return queued;
    });
  }

  /** Not in Valkyrie: queues events for this cause, which the editor's test panel shows. */
  queueBecause<T>(cause: EventCause, queue: () => T): T {
    const before = this.queueCause;
    this.queueCause = cause;
    try {
      return queue();
    } finally {
      this.queueCause = before;
    }
  }

  /** Not in Valkyrie: an event starts in a test from the editor, or a change of quest, which the test's panel shows. */
  private startedNow(e: Event): void {
    const quest = this.game.currentQuest!;
    const changesQuest = e instanceof StartQuestEvent;
    const started: StartedEvent = { name: changesQuest ? e.name : e.qEvent.sectionName, cause: this.causes.get(e) ?? OTHER, round: quest.vars.getValue('#round'), quest: quest.qd.questPath };
    if (changesQuest) started.changesQuest = true;
    this.started.push(started);
  }

  // Queue event, optionally trigger next event
  // Valkyrie: EventManager.cs EventManager.QueueEvent
  queueEvent(name: string, trigger = true): boolean {
    const quest = this.game.currentQuest!;
    // Check if the event doesn't exists - quest fault
    if (!this.events.has(name)) {
      let questToTransition = quest.originalPath + Path.DirectorySeparatorChar + name;
      if (quest.fromSavegame) {
        questToTransition = ContentData.valkyrieLoadQuestPath + Path.DirectorySeparatorChar + name;
      }
      if (File.exists(questToTransition)) {
        dictAdd(this.events, name, new StartQuestEvent(name));
      } else {
        ValkyrieDebug.log('Warning: Missing event called: ' + name);
        quest.log.add(new LogEntry('Warning: Missing event called: ' + name, true));
        return false;
      }
    }

    // Don't queue disabled events
    if (this.events.get(name)!.disabled()) return false;

    // Place this on top of the stack
    this.eventStack.push(this.events.get(name)!);
    this.causes.set(this.events.get(name)!, this.queueCause);

    // IF there is a current event trigger if specified
    if (this.currentEvent === null && trigger) {
      this.triggerEvent();
    }

    return true;
  }

  // Trigger next event in stack
  // Valkyrie: EventManager.cs EventManager.TriggerEvent
  triggerEvent(): void {
    const game = Game.get();
    // First check if things need to be added to the queue at end round
    if (game.roundControl.checkNewRound()) return;

    // No events to trigger
    if (this.eventStack.count === 0) return;

    // Get the next event
    const e = this.eventStack.pop();
    this.currentEvent = e;

    // Move to another quest
    if (e instanceof StartQuestEvent) {
      if (game.testMode) this.startedNow(e);
      // This loads the game
      game.currentQuest!.changeQuest(e.name);
      return;
    }

    // Event may have been disabled since added
    if (e.disabled()) {
      this.currentEvent = null;
      this.triggerEvent();
      return;
    }

    const quest = game.currentQuest!;
    if (game.testMode) this.startedNow(e);

    // Play audio
    const audioData = game.cd.tryGet(AudioData, e.qEvent.audio);
    if (audioData !== undefined) {
      game.audioControl.play(audioData.file);
    } else if (e.qEvent.audio.length > 0) {
      game.audioControl.play(Quest.findLocalisedMultimediaFile(e.qEvent.audio, Path.getDirectoryName(quest.qd.questPath)!));
    }

    // Set Music
    if (e.qEvent.music.length > 0) {
      const music: string[] = [];
      for (const s of e.qEvent.music) {
        const musicData = game.cd.tryGet(AudioData, s);
        if (musicData !== undefined) {
          music.push(musicData.file);
        } else {
          music.push(Quest.findLocalisedMultimediaFile(s, Path.getDirectoryName(quest.qd.questPath)!));
        }
      }
      game.audioControl.playMusic(music);
      if (music.length > 0) {
        quest.music = [...e.qEvent.music];
      }
    }

    // Perform var operations
    quest.vars.perform(e.qEvent.operations);
    // Update morale change
    if (game.gameType.typeName() === ValkyrieConstants.typeDescent) {
      quest.adjustMorale(0);
    }
    if (quest.vars.getValue('$restock') === 1) {
      quest.generateItemSelection();
    }

    // If a dialog window is open we force it closed (this shouldn't happen)
    game.ui.destroyTag(Game.DIALOG);

    if (e instanceof MonsterEvent) e.monsterEventSelection();

    // Not in Valkyrie (16 October 2026): a spawn whose monster is not found threw here; it goes on as a plain event
    if (e instanceof MonsterEvent && e.cMonster === null) {
      ValkyrieDebug.log('Warning: No monster selected for spawn event: ' + e.qEvent.sectionName);
      quest.log.add(new LogEntry('Warning: No monster selected for spawn event: ' + e.qEvent.sectionName, true));
    }
    // If this is a monster event then add the monster group
    else if (e instanceof MonsterEvent) {
      const qe = e;

      // Is this type new?
      let oldMonster: Quest.Monster | null = null;
      for (const m of quest.monsters) {
        if (m.monsterData.sectionName === qe.cMonster.sectionName) {
          // Matched existing monster
          oldMonster = m;
        }
      }

      // Add the new type
      if (!game.gameType.monstersGrouped() || oldMonster === null) {
        const monster = new Quest.Monster(qe);
        quest.monsters.push(monster);
        game.monsterCanvas.updateList();
        // Update monster var
        quest.vars.setValue('#monsters', quest.monsters.length);
      }
      // There is an existing group, but now it is unique
      else if (qe.qMonster.unique) {
        oldMonster.unique = true;
        oldMonster.uniqueText = qe.qMonster.uniqueText;
        oldMonster.uniqueTitle = qe.getUniqueTitle();
        oldMonster.healthMod = Mathf.roundToInt(
          Math.fround(qe.qMonster.uniqueHealthBase + Math.fround(Game.get().currentQuest!.getHeroCount() * qe.qMonster.uniqueHealthHero)),
        );
      }

      // Display the location(s)
      if (qe.qEvent.locationSpecified && e.qEvent.display) {
        game.tokenBoard.addMonster(qe);
      }
    }

    // Highlight a space on the board
    if (e.qEvent.highlight) {
      game.tokenBoard.addHighlight(e.qEvent);
    }

    // Is this a shop?
    const itemList: string[] = [];
    for (const s of e.qEvent.addComponents) {
      if (s.indexOf('QItem') === 0) {
        // Fix #998
        if (game.gameType.typeName() === 'MoM' && itemList.length === 1) {
          ValkyrieDebug.log('WARNING: only one QItem can be used in event ' + e.qEvent.sectionName + ', ignoring other items');
          break;
        }
        itemList.push(s);
      }
    }
    // Add board components
    quest.add(e.qEvent.addComponents, itemList.length > 1);
    // Remove board components
    quest.remove(e.qEvent.removeComponents);

    // Move camera
    if (e.qEvent.locationSpecified && !(e.qEvent instanceof QuestData.UI)) {
      CameraController.setCamera(e.qEvent.location);
    }

    if (e.qEvent instanceof QuestData.Puzzle) {
      const p = e.qEvent;
      if (p.puzzleClass === 'slide') {
        new PuzzleSlideWindow(e);
      }
      if (p.puzzleClass === 'code') {
        new PuzzleCodeWindow(e);
      }
      if (p.puzzleClass === 'image') {
        new PuzzleImageWindow(e);
      }
      if (p.puzzleClass === 'tower') {
        new PuzzleTowerWindow(e);
      }
      if (EventManager.knownPuzzle(p)) return;
    }

    // Set camera limits
    if (e.qEvent.minCam) {
      CameraController.setCameraMin(e.qEvent.location);
    }
    if (e.qEvent.maxCam) {
      CameraController.setCameraMax(e.qEvent.location);
    }

    // Is this a shop?
    if (itemList.length > 1 && !quest.boardItems.has('#shop')) {
      dictAdd(quest.boardItems, '#shop', new ShopInterface(itemList, Game.get(), e.qEvent.sectionName));
      quest.ordered_boardItems.push('#shop');
    } else if (!e.qEvent.display) {
      // Only raise dialog if there is text, otherwise auto confirm

      let firstEnabledButtonIndex = 0;
      for (const b of e.qEvent.buttons) {
        if (isButtonEnabled(b, quest.vars)) break;
        firstEnabledButtonIndex++;
      }
      this.endEvent(firstEnabledButtonIndex);
    } else {
      if (this.monsterImage !== null) {
        // MonsterDialogMoM.DrawMonster, which this module cannot import (it would close a cycle with MonsterDialog)
        // Not in Valkyrie (16 October 2026): a missing picture threw before the dialog; it is logged and the app draws a placeholder
        if (ContentData.fileToTexture(this.monsterImage.monsterData.image) === null) ValkyrieDebug.log('Warning: Missing monster picture: ' + this.monsterImage.monsterData.image);
        game.ui.drawMonster(this.monsterImage, true);
      }
      new DialogWindow(e);
    }
  }

  // Valkyrie: EventManager.cs EventManager.ResumeEvent
  resumeEvent(): void {
    const e = this.currentEvent!;
    // Not in Valkyrie (16 October 2026): a spawn without a selected monster is resumed without its figures, instead of throwing
    if (e instanceof MonsterEvent && e.cMonster !== null) {
      // Display the location(s)
      if (e.qEvent.locationSpecified && e.qEvent.display) {
        this.game.tokenBoard.addMonster(e);
      }
    }

    // Highlight a space on the board
    if (e.qEvent.highlight) {
      this.game.tokenBoard.addHighlight(e.qEvent);
    }

    if (e.qEvent instanceof QuestData.Puzzle) {
      const p = e.qEvent;
      if (p.puzzleClass === 'slide') {
        new PuzzleSlideWindow(e);
      }
      if (p.puzzleClass === 'code') {
        new PuzzleCodeWindow(e);
      }
      if (p.puzzleClass === 'image') {
        new PuzzleImageWindow(e);
      }
      // Not in Valkyrie (16 October 2026): a tower puzzle open in a save was resumed with no window, leaving the game stuck
      if (p.puzzleClass === 'tower') {
        new PuzzleTowerWindow(e);
      }
      if (EventManager.knownPuzzle(p)) return;
    }
    new DialogWindow(e);
  }

  /** Not in Valkyrie (16 October 2026): a puzzle of an unknown class opened no window, leaving the game stuck; it shows as a plain event. */
  private static knownPuzzle(p: QuestData.Puzzle): boolean {
    if (['slide', 'code', 'image', 'tower'].includes(p.puzzleClass)) return true;
    ValkyrieDebug.log('Warning: Unknown puzzle class ' + p.puzzleClass + ' in event: ' + p.sectionName);
    Game.get().currentQuest!.log.add(new LogEntry('Warning: Unknown puzzle class ' + p.puzzleClass + ' in event: ' + p.sectionName, true));
    return false;
  }

  /** EndEvent(state = 0) for the current event, or EndEvent(eventData, state = 0). */
  // Valkyrie: EventManager.cs EventManager.EndEvent
  endEvent(eventDataOrState: QuestData.Event | number = 0, state = 0): void {
    if (typeof eventDataOrState === 'number') {
      this.endEvent(this.currentEvent!.qEvent, eventDataOrState);
      return;
    }
    const eventData = eventDataOrState;
    const quest = this.game.currentQuest!;

    // Get list of next events
    let eventList: string[] = [];
    if (eventData.buttons.length > state) {
      eventList = eventData.buttons[state]!.eventNames;
    }

    // Only take enabled events from list
    const enabledEvents: string[] = [];
    for (const s of eventList) {
      // Check if the event doesn't exists - quest fault
      if (!this.events.has(s)) {
        let questToTransition = quest.originalPath + Path.DirectorySeparatorChar + s;
        if (quest.fromSavegame) {
          questToTransition = ContentData.valkyrieLoadQuestPath + Path.DirectorySeparatorChar + s;
        }
        if (File.exists(questToTransition)) {
          dictAdd(this.events, s, new StartQuestEvent(s));
          enabledEvents.push(s);
        } else {
          ValkyrieDebug.log('Warning: Missing event called: ' + s);
          quest.log.add(new LogEntry('Warning: Missing event called: ' + s, true));
        }
      } else if (!dictGet(quest.eManager.events, s).disabled()) {
        enabledEvents.push(s);
      }
    }

    // Has the quest ended?
    if (quest.vars.getValue('$end') !== 0) {
      quest.questHasEnded = true;

      const fileName = Path.getFileName(quest.originalPath);
      if (fileName.startsWith('EditorScenario') || !fileName.endsWith(ValkyrieConstants.ScenarioDownloadContainerExtension)) {
        // do not show score screen for scenario with a non customized name, or if the scenario is not a package (most probably a test)
        GameStateManager.mainMenu();
      } else {
        this.game.ui.endGameScreen();
      }

      return;
    }

    this.currentEvent = null;
    // Are there any events?
    if (enabledEvents.length > 0) {
      quest.eManager.queueBecause({ kind: 'button', event: eventData.sectionName, button: state + 1, random: eventData.randomEvents }, () => {
        // Are we picking at random?
        if (eventData.randomEvents) {
          // Add a random event
          quest.eManager.queueEvent(listGet(enabledEvents, Random.range(0, enabledEvents.length)), false);
        } else {
          // Add the first valid event
          quest.eManager.queueEvent(enabledEvents[0]!, false);
        }
      });
    }

    // Add any custom triggered events
    this.addCustomTriggers();

    if (this.eventStack.count === 0) {
      this.monsterImage = null;
      this.monsterHealth = false;
      if (quest.phase === Quest.MoMPhase.monsters) {
        this.game.roundControl.monsterActivated();
        return;
      }
    }

    // Trigger a stacked event
    this.triggerEvent();
  }

  // Valkyrie: EventManager.cs EventManager.AddCustomTriggers
  addCustomTriggers(): void {
    const vars = this.game.currentQuest!.vars;
    for (const [key, value] of vars.getPrefixVars('@')) {
      if (value > 0) {
        vars.setValue(key, 0);
        this.eventTriggerType('Var' + substring(key, 1), false);
      }
    }
    for (const [key, value] of vars.getPrefixVars('$@')) {
      if (value > 0) {
        vars.setValue(key, 0);
        this.eventTriggerType('Var' + '$' + substring(key, 2), false);
      }
    }
  }

  // Valkyrie: EventManager.cs EventManager.ToString
  toString(): string {
    const nl = NewLine;
    // General quest state block
    let r = '[EventManager]' + nl;
    r += 'queue=';
    for (const e of this.eventStack.toArray()) {
      r += e.qEvent.sectionName + ' ';
    }
    r += nl;
    if (this.currentEvent !== null) {
      r += 'currentevent=' + this.currentEvent.qEvent.sectionName + nl;
    }
    if (this.monsterImage !== null) {
      r += 'monsterimage=' + this.monsterImage.getIdentifier() + nl;
    }
    if (this.monsterHealth) {
      r += 'monsterhealth=' + boolToString(this.monsterHealth) + nl;
    }
    return r;
  }

  /** Replace symbol markers with special characters to be shown in Quest. */
  // Valkyrie: EventManager.cs EventManager.OutputSymbolReplace
  static outputSymbolReplace(input: string): string {
    let output = input;
    const game = Game.get();

    // Fill in variable data
    try {
      // Find first random number tag
      let index = output.indexOf('{var:');
      // loop through event text
      while (index !== -1) {
        // find end of tag
        const statement = substring(output, index, indexOf(output, '}', index) + 1 - index);
        // Replace with variable data
        output = replace(output, statement, floatToString(game.currentQuest!.vars.getValue(substring(statement, 5, statement.length - 6))));
        //find next random tag
        index = output.indexOf('{var:');
      }
    } catch {
      game.currentQuest!.log.add(new LogEntry('Warning: Invalid var clause in text: ' + input, true));
    }

    for (const [key, value] of EventManager.getCharacterMap(false, true)!) {
      output = replace(output, key, value);
    }

    return output;
  }

  /** Replace symbol markers with special characters to be stored in editor. */
  // Valkyrie: EventManager.cs EventManager.InputSymbolReplace
  static inputSymbolReplace(input: string): string {
    let output = input;

    for (const [key, value] of EventManager.getCharacterMap(false, true)!) {
      output = replace(output, value, key);
    }

    return output;
  }

  // Valkyrie: EventManager.cs EventManager.GetCharacterMap
  static getCharacterMap(addRnd = false, addPacks = false): Map<string, string> | null {
    const typeName = Game.get().gameType.typeName();
    if (!EventManager.CHARS_MAP.has(typeName)) {
      return null;
    }
    const toReturn = new Map(EventManager.CHARS_MAP.get(typeName)!);
    if (addRnd) {
      dictAdd(toReturn, '{rnd:hero}', 'Rnd');
    }
    if (addPacks) {
      for (const [key, value] of dictGet(EventManager.CHAR_PACKS_MAP, typeName)) {
        dictAdd(toReturn, key, value);
      }
    }
    return toReturn;
  }

  static CHARS_MAP = new Map<string, Map<string, string>>([
    [
      'D2E',
      new Map([
        ['{heart}', '≥'],
        ['{fatigue}', '∏'],
        ['{might}', '∂'],
        ['{will}', 'π'],
        ['{action}', '∞'],
        ['{knowledge}', '∑'],
        ['{awareness}', 'μ'],
        ['{shield}', '≤'],
        ['{surge}', '±'],
      ]),
    ],
    [
      'MoM',
      new Map([
        ['{will}', ''],
        ['{action}', ''],
        ['{strength}', ''],
        ['{agility}', ''],
        ['{lore}', ''],
        ['{influence}', ''],
        ['{observation}', ''],
        ['{success}', ''],
        ['{clue}', ''],
      ]),
    ],
  ]);

  static CHAR_PACKS_MAP = new Map<string, Map<string, string>>([
    ['D2E', new Map()],
    [
      'MoM',
      new Map([
        ['{MAD01}', ''],
        ['{MAD06}', ''],
        ['{MAD09}', ''],
        ['{MAD20}', ''],
        ['{MAD21}', ''],
        ['{MAD22}', ''],
        ['{MAD23}', ''],
        ['{MAD25}', ''],
        ['{MAD26}', ''],
        ['{MAD27}', ''],
        ['{MAD28}', ''],
      ]),
    ],
  ]);
}

// Valkyrie: EventManager.cs EventManager.IsButtonEnabled
function isButtonEnabled(b: QuestButtonData, varManager: VarManager): boolean {
  return b.conditionFailedAction === QuestButtonAction.NONE || !b.hasCondition || varManager.test(b.condition);
}

export declare namespace EventManager {
  type Event = _Event;
  type StartQuestEvent = _StartQuestEvent;
  type MonsterEvent = _MonsterEvent;
  type Peril = _Peril;
  type Token = _Token;
}
