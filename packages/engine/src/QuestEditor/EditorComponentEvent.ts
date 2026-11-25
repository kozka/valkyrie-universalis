// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/EditorComponentEvent.cs
// Only what the event panel does to the quest, and the choices its selection windows offer; the panel is the app's
// (editor/EventPanel.tsx). The variable tests and operations are EditorComponentVarTestsUtil's.
import { AudioData, MonsterData } from '../Content/ContentTypes.ts';
import { LocalizationRead } from '../Content/LocalizationRead.ts';
import { QuestButtonData, type QuestButtonAction } from '../Content/QuestButtonData.ts';
import { QuestData } from '../Content/QuestData.ts';
import { StringKey } from '../Content/StringKey.ts';
import { Game } from '../Game.ts';
import { intTryParse, replace } from '../platform/CSharp.ts';
import { Mathf } from '../platform/Mathf.ts';
import { netAdd } from '../platform/NetDictionary.ts';
import { Directory, Path, SearchOption } from '../platform/SystemIO.ts';
import { EventManager } from '../Quest/EventManager.ts';
import { ColorUtil } from '../UI/ColorUtil.ts';
import { ValkyrieConstants } from '../ValkyrieConstants.ts';
import { EditorComponentVarTestsUtil } from './EditorComponentVarTestsUtil.ts';

const CONTINUE = new StringKey('val', 'CONTINUE');
const BUTTON = new StringKey('val', 'BUTTON');

/** A choice of a selection window: its value, the group it is listed under, and whether it is greyed (taken). */
export interface EditorChoice {
  value: string;
  group: string;
  greyed?: boolean;
}

function isMoM(): boolean {
  return Game.get().gameType.typeName() === ValkyrieConstants.typeMom;
}

function isD2E(): boolean {
  return Game.get().gameType.typeName() === ValkyrieConstants.typeDescent;
}

function components(): Map<string, QuestData.QuestComponent> {
  return Game.get().currentQuest!.qd.components;
}

/** The first free name of a type: the type and the lowest number not taken. */
function nextName(type: string): string {
  let i = 0;
  while (components().has(type + i)) i++;
  return type + i;
}

/** A dialog as a game shows it (EditorComponentEvent.preview): its text, and its buttons' labels with their colours. */
export interface EventPreview {
  text: string;
  buttons: { label: string; colour: string }[];
}

/** A text as EventManager shows it, but for what only a game knows: a variable's value and a random hero. */
function shownAsInAGame(text: string): string {
  let shown = text;
  // A component a game could not name either (a tile whose side is missing) stays as it is typed
  try {
    shown = EventManager.Event.replaceComponentText(shown);
  } catch {
    shown = text;
  }
  // EventManager.OutputSymbolReplace, without the variables' values
  for (const [key, value] of EventManager.getCharacterMap(false, true) ?? new Map<string, string>()) shown = replace(shown, key, value);
  return shown;
}

/** A button's colour as a game draws it: its #RRGGBB or #RRGGBBAA, or white when it is not one (DialogWindow.EventButton). */
function buttonColour(color: string): string {
  const rgb = ColorUtil.fromName(color);
  return /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(rgb) ? rgb : '#FFFFFF';
}

/** Where SelectAddVisibility puts a new board component: the camera, rounded to the tile's step. */
function atCamera(component: QuestData.QuestComponent): void {
  const game = Game.get();
  const round = game.gameType.tileRound();
  component.location.x = Math.fround(round * Mathf.round(game.cc.position.x / round));
  component.location.y = Math.fround(round * Mathf.round(game.cc.position.y / round));
}

export const EditorComponentEvent = {
  /** The text the dialog box shows: the event's text in the current language, or nothing. */
  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.AddEventDialog
  dialogText(event: QuestData.Event): string {
    return event.text.translate(true);
  },

  /** The dialog's text changed: an empty one hides the dialog, a new one shows it with a button to go on. */
  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.UpdateText
  updateText(event: QuestData.Event, text: string): void {
    if (text.length === 0) {
      LocalizationRead.dicts.get('qst')!.remove(event.text_key);
      event.display = false;
      return;
    }
    LocalizationRead.updateScenarioText(event.text_key, text);
    if (event.buttons.length === 0) {
      event.buttons.push(new QuestButtonData(event.genQuery('button1')));
      LocalizationRead.updateScenarioText(event.genKey('button1'), CONTINUE.translate());
    }
    if (!event.display) event.display = true;
  },

  /**
   * Not in Valkyrie, whose panel shows the dialog only as it is typed: the dialog as a game shows it
   * (EventManager.Event.GetText and DialogWindow.EventButton), with the components it names, the game's symbols and its
   * line breaks, and its buttons' labels and colours. A variable's value and a random hero, which only a game knows,
   * keep their code.
   */
  preview(event: QuestData.Event): EventPreview {
    return {
      text: EditorComponentEvent.shown(event.text.translate(true)),
      buttons: event.buttons.map((button) => ({ label: shownAsInAGame(button.label.translate()), colour: buttonColour(button.color) })),
    };
  },

  /** Any text of the scenario as a dialog shows it (EventManager.Event.GetText), as the preview shows the dialog's. */
  shown(text: string): string {
    return replace(shownAsInAGame(text), '\\n', '\n');
  },

  /** What the trigger window offers: the general triggers (greyed when another event has the one-off ones), the Mansions ones, Defeated for every monster and spawn, and Var for every @ variable. */
  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.SetTrigger
  triggerChoices(): EditorChoice[] {
    const game = Game.get();
    const choices: EditorChoice[] = [{ value: '', group: 'GENERAL' }];
    const used = new Set<string>();
    for (const c of components().values()) if (c instanceof QuestData.Event) used.add(c.trigger);
    for (const trigger of ['EventStart', 'NoMorale', 'Eliminated']) choices.push({ value: trigger, group: 'GENERAL', greyed: used.has(trigger) });
    choices.push({ value: 'EndRound', group: 'GENERAL' }, { value: 'StartRound', group: 'GENERAL' });
    if (isMoM()) {
      for (const trigger of ['Mythos', 'EndInvestigatorTurn', 'BeforeMonsterActivation', 'StartFinalRound']) choices.push({ value: trigger, group: 'GENERAL' });
    }
    const defeated = (name: string, group: string) => {
      choices.push({ value: 'Defeated' + name, group });
      if (isD2E()) choices.push({ value: 'DefeatedUnique' + name, group });
    };
    for (const monster of game.cd.keys(MonsterData)) defeated(monster, 'MONSTER');
    const vars = new Set<string>();
    for (const c of components().values()) {
      if (c instanceof QuestData.Event) for (const v of EditorComponentVarTestsUtil.extractVarsFromEvent(c)) if (v.startsWith('@')) vars.add(v);
    }
    for (const [name, c] of components()) if (c instanceof QuestData.CustomMonster) defeated(name, 'CUSTOMMONSTER');
    for (const [name, c] of components()) if (c instanceof QuestData.Spawn) defeated(name, 'SPAWN');
    for (const v of vars) choices.push({ value: 'Var' + v.substring(1), group: 'VARS' });
    return choices;
  },

  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.SelectEventTrigger
  selectEventTrigger(event: QuestData.Event, trigger: string): void {
    event.trigger = trigger;
  },

  /** What the audio windows offer: nothing, the scenario's own .ogg files, and the sounds of the content. */
  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.SetAudio
  audioChoices(): EditorChoice[] {
    const game = Game.get();
    const folder = Path.getDirectoryName(game.currentQuest!.qd.questPath)!;
    const choices: EditorChoice[] = [{ value: '', group: 'FILE' }];
    for (const file of Directory.getFiles(folder, '*.ogg', SearchOption.AllDirectories)) {
      choices.push({ value: file.substring(folder.length + 1), group: 'FILE' });
    }
    for (const [name] of game.cd.getAll(AudioData)) choices.push({ value: name, group: 'FFG' });
    return choices;
  },

  /** The sound played when the event starts (Valkyrie also plays it there and then; the app may). */
  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.SelectEventAudio
  selectEventAudio(event: QuestData.Event, audio: string): void {
    event.audio = audio;
  },

  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.SelectMusic
  selectMusic(event: QuestData.Event, index: number, music: string): void {
    event.music.splice(index, 0, music);
  },

  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.RemoveMusic
  removeMusic(event: QuestData.Event, index: number): void {
    event.music.splice(index, 1);
  },

  /** Descent: the event whose chosen heroes this one shows. */
  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.SelectEventHighlight
  selectEventHighlight(event: QuestData.Event, eventName: string): void {
    event.heroListName = eventName;
  },

  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.SelectEventHeroCount
  selectEventHeroCount(event: QuestData.Event, max: boolean, number: string): void {
    if (max) event.maxHeroes = intTryParse(number).value;
    else event.minHeroes = intTryParse(number).value;
  },

  /** What the add and remove windows offer: the special groups (remove only), new components, and those that can be shown. */
  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.AddVisibility
  visibilityChoices(add: boolean): EditorChoice[] {
    const choices: EditorChoice[] = [];
    if (!add) {
      for (const special of ['#boardcomponents', '#monsters', '#shop', '#uicomponents', '#doors', '#tiles', '#qitems', '#tokens']) choices.push({ value: special, group: 'Special' });
    }
    const types = [...(isD2E() ? ['Door'] : []), 'Tile', 'Token', 'UI', 'QItem'];
    for (const type of types) choices.push({ value: '{NEW:' + type + '}', group: 'NEW' });
    for (const [name, c] of components()) {
      const shown = c instanceof QuestData.Door || c instanceof QuestData.Tile || c instanceof QuestData.Token || c instanceof QuestData.UI;
      if (shown || c instanceof QuestData.Spawn || c instanceof QuestData.QItem) choices.push({ value: name, group: c.typeDynamic });
    }
    return choices;
  },

  /** Adds a component to show or hide (index -1), or puts it in place of another; {NEW:Type} makes it first. */
  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.SelectAddVisibility
  selectAddVisibility(event: QuestData.Event, add: boolean, index: number, component: string): void {
    const game = Game.get();
    let target = component;
    const make = (type: string, created: (name: string) => QuestData.QuestComponent, board: boolean) => {
      if (component !== '{NEW:' + type + '}') return;
      target = nextName(type);
      const made = created(target);
      netAdd(components(), target, made);
      if (board) {
        atCamera(made);
        game.currentQuest!.add(target);
      }
    };
    make('Door', (name) => new QuestData.Door(name), true);
    make('Tile', (name) => new QuestData.Tile(name), true);
    make('Token', (name) => new QuestData.Token(name), true);
    make('UI', (name) => new QuestData.UI(name), false);
    make('QItem', (name) => new QuestData.QItem(name), false);

    const list = add ? event.addComponents : event.removeComponents;
    if (index !== -1) {
      list[index] = target;
      return;
    }
    if (add) event.addComponents = [...list, target];
    else event.removeComponents = [...list, target];
  },

  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.RemoveVisibility
  removeVisibility(event: QuestData.Event, index: number, add: boolean): void {
    if (add) event.addComponents = event.addComponents.filter((_, i) => i !== index);
    else event.removeComponents = event.removeComponents.filter((_, i) => i !== index);
  },

  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.ToggleRandom
  toggleRandom(event: QuestData.Event): void {
    event.randomEvents = !event.randomEvents;
  },

  /** The quota as a number typed (0 when it is not one). */
  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.SetQuota
  setQuota(event: QuestData.Event, text: string): void {
    event.quota = intTryParse(text).value;
  },

  /** Back to a quota that is a number. */
  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.SetQuotaInt
  setQuotaInt(event: QuestData.Event): void {
    event.quotaVar = '';
  },

  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.SelectQuotaVar
  selectQuotaVar(event: QuestData.Event, variable: string): void {
    event.quotaVar = variable;
    event.quota = 0;
  },

  /** A new variable for the quota, typed: letters, digits and _, with its % or @ kept, and var in front of a number. */
  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.NewQuotaVar
  newQuotaVar(event: QuestData.Event, value: string): void {
    const name = EditorComponentEvent.variableName(value);
    if (name === '') return;
    event.quotaVar = name;
    event.quota = 0;
  },

  /** A variable's name as Valkyrie's editor makes it from what was typed (NewQuotaVar), or '' when nothing is left. */
  variableName(value: string): string {
    let name = value.replace(/[^A-Za-z0-9_]/g, '');
    if (name.length === 0) return '';
    if (value[0] === '%') name = '%' + name;
    if (value[0] === '@') name = '@' + name;
    if (/^[0-9]/.test(name) || name[0] === '-' || name[0] === '.') name = 'var' + name;
    return name;
  },

  /** A new button, the last, labelled Button and its number. */
  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.AddButton
  addButton(event: QuestData.Event): void {
    const count = event.buttons.length + 1;
    event.buttons.push(new QuestButtonData(event.genQuery('button' + count)));
    LocalizationRead.updateScenarioText(event.genKey('button' + count), BUTTON.translate() + count);
  },

  /** The last button goes, with its label in every language. */
  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.RemoveButton
  removeButton(event: QuestData.Event): void {
    const count = event.buttons.length;
    event.buttons.splice(count - 1, 1);
    LocalizationRead.dicts.get('qst')!.remove(event.genKey('button' + count));
  },

  /** The colours a button can have: ColorUtil's names. */
  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.SetButtonColor
  colourChoices(): string[] {
    return [...ColorUtil.lookUp().keys()];
  },

  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.SelectButtonColour
  selectButtonColour(event: QuestData.Event, number: number, color: string): void {
    event.buttons[number - 1]!.color = color;
  },

  /** A button's label in the current language; an empty one is not taken, as in Valkyrie. */
  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.UpdateButtonLabel
  updateButtonLabel(event: QuestData.Event, number: number, text: string): void {
    if (text.length === 0) return;
    LocalizationRead.updateScenarioText(event.genKey('button' + number), text);
  },

  /** What the next-event window offers: new events, spawns and (Mansions) puzzles, and every event. */
  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.AddEvent
  nextEventChoices(): EditorChoice[] {
    const choices: EditorChoice[] = [
      { value: '{NEW:Event}', group: 'NEW' },
      { value: '{NEW:Spawn}', group: 'NEW' },
    ];
    if (isMoM()) choices.push({ value: '{NEW:Puzzle}', group: 'NEW' });
    for (const [name, c] of components()) if (c instanceof QuestData.Event) choices.push({ value: name, group: c.typeDynamic });
    return choices;
  },

  /** Puts an event at a place of a button's list, or in place of the one there; {NEW:Type} makes it first. Returns its name. */
  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.SelectAddEvent
  selectAddEvent(event: QuestData.Event, index: number, button: number, replace: boolean, eventName: string): string {
    let toAdd = eventName;
    const make = (type: string, created: (name: string) => QuestData.QuestComponent) => {
      if (eventName !== '{NEW:' + type + '}') return;
      toAdd = nextName(type);
      netAdd(components(), toAdd, created(toAdd));
    };
    make('Event', (name) => new QuestData.Event(name));
    make('Spawn', (name) => new QuestData.Spawn(name));
    make('Puzzle', (name) => new QuestData.Puzzle(name));
    const names = event.buttons[button - 1]!.eventNames;
    if (replace) names[index] = toAdd;
    else names.splice(index, 0, toAdd);
    return toAdd;
  },

  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.RemoveEvent
  removeEvent(event: QuestData.Event, index: number, button: number): void {
    event.buttons[button - 1]!.eventNames.splice(index, 1);
  },

  /** What a button does when its condition fails: nothing, greyed or hidden; a button without a condition keeps none. */
  // Valkyrie: EditorWindowQuestButtonEdit.cs EditorWindowQuestButtonEdit.Update (the actions and OK)
  setConditionFailedAction(button: QuestButtonData, action: QuestButtonAction | null): void {
    button.rawConditionFailedAction = button.hasCondition ? action : null;
  },

  /** What the event's place on the board does: nothing, the camera goes there, it is highlighted, or the camera's limits. */
  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.AddLocationType
  locationType(event: QuestData.Event): 'MIN_CAM' | 'MAX_CAM' | 'UNUSED' | 'HIGHLIGHT' | 'CAMERA' {
    if (event.minCam) return 'MIN_CAM';
    if (event.maxCam) return 'MAX_CAM';
    if (!event.locationSpecified) return 'UNUSED';
    if (event.highlight) return 'HIGHLIGHT';
    return 'CAMERA';
  },

  /** A spawn's place: unused, or its monster shown there. */
  // Valkyrie: EditorComponentSpawn.cs EditorComponentSpawn.AddLocationType
  spawnLocationType(spawn: QuestData.Spawn): 'UNUSED' | 'HIGHLIGHT' {
    return spawn.locationSpecified ? 'HIGHLIGHT' : 'UNUSED';
  },

  // Valkyrie: EditorComponentSpawn.cs EditorComponentSpawn.PositionTypeCycle
  spawnPositionTypeCycle(spawn: QuestData.Spawn): void {
    spawn.locationSpecified = !spawn.locationSpecified;
  },

  /** The next of those, in Valkyrie's order: unused, camera, highlight, minimum camera, maximum camera. */
  // Valkyrie: EditorComponentEvent.cs EditorComponentEvent.PositionTypeCycle
  positionTypeCycle(event: QuestData.Event): void {
    if (event.minCam) {
      event.locationSpecified = false;
      event.highlight = false;
      event.maxCam = true;
      event.minCam = false;
    } else if (event.maxCam) {
      event.locationSpecified = false;
      event.highlight = false;
      event.maxCam = false;
      event.minCam = false;
    } else if (event.highlight) {
      event.locationSpecified = false;
      event.highlight = false;
      event.maxCam = false;
      event.minCam = true;
    } else if (event.locationSpecified) {
      event.locationSpecified = true;
      event.highlight = true;
      event.maxCam = false;
      event.minCam = false;
    } else {
      event.locationSpecified = true;
      event.highlight = false;
      event.maxCam = false;
      event.minCam = false;
    }
  },
};
