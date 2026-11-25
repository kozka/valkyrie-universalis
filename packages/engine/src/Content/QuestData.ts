// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/QuestData.cs
// The nested classes (QuestData.Tile, QuestData.Event...) are module classes exposed as static members and types of
// QuestData, so ported code reads as in C#. Unity objects (Image, GameObject) are left for the app as `unknown`.
// Game-type checks: Token's default tokenSize and Quest.isMoM read GameType.typeName() (see porting rules).
import { Game } from '../Game.ts';
import { Application } from '../platform/Application.ts';
import {
  NewLine,
  boolToString,
  boolTryParse,
  dictAdd,
  enumToString,
  floatToString,
  floatTryParse,
  intTryParse,
  isNullOrEmpty,
  isNumber,
  split,
} from '../platform/CSharp.ts';
import { IniRead, type IniData } from '../ValkyrieTools/IniRead.ts';
import { Path } from '../platform/SystemIO.ts';
import { Vector2 } from '../platform/Vector2.ts';
import { VarOperation, VarTests, VarTestsLogicalOperator } from '../Quest/VarTests.ts';
import { ValkyrieConstants } from '../ValkyrieConstants.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { ActivationData, MonsterData, TileSideData } from './ContentTypes.ts';
import { DictionaryI18n } from './DictionaryI18n.ts';
import { QuestFormat } from './FormatVersions.ts';
import type { ITestable } from './ITestable.ts';
import { LocalizationRead } from './LocalizationRead.ts';
import { QuestButtonData, QuestButtonDataSerializer } from './QuestButtonData.ts';
import { QuestListMode } from './QuestsManager.ts';
import { StringKey } from './StringKey.ts';
import { TextAlignment, TextAlignmentUtils } from './TextAlignment.ts';

const DOT = '.';

/** float.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture, out x): the value, 0 on failure. */
function parseInvariantFloat(s: string | undefined): number {
  return floatTryParse(s).value;
}

function joinWithSpaces(values: readonly string[]): string {
  let r = '';
  for (const s of values) r += s + ' ';
  return r.substring(0, r.length - 1);
}

// Super class for all quest components
// Valkyrie: QuestData.cs QuestData.QuestComponent
class QuestComponent implements ITestable {
  // Source file
  source = '';
  // location on the board in squares
  location: Vector2 = Vector2.zero;
  // Has a location been speficied?
  locationSpecified = false;
  // type for sub classes
  static type = '';
  typeDynamic = '';
  // name of section in ini file
  sectionName: string;
  // image for display (a UnityEngine.UI.Image in Valkyrie; the app keeps its own object here)
  image: unknown = null;
  // comment for developers
  comment = '';
  // Var tests and operations if required
  tests: VarTests | null = null;
  operations: VarOperation[] = null as unknown as VarOperation[];

  // Valkyrie: QuestData.cs QuestComponent.genKey
  genKey(element: string): string {
    return this.sectionName + DOT + element;
  }

  // Valkyrie: QuestData.cs QuestComponent.genQuery
  genQuery(element: string): StringKey {
    return new StringKey('qst', this.sectionName + DOT + element);
  }

  /** QuestComponent(string nameIn) creates a new component in the editor; with data it is read from ini data. */
  // Valkyrie: QuestData.cs QuestComponent.QuestComponent
  constructor(nameIn: string, data?: Map<string, string>, sourceIn?: string, format = -1) {
    this.typeDynamic = QuestComponent.type;
    this.sectionName = nameIn;
    if (data === undefined) {
      this.location = Vector2.zero;
      return;
    }
    this.source = sourceIn as string;

    // Default to 0, 0 unless specified
    this.location = new Vector2(0, 0);
    this.locationSpecified = false;
    if (data.has('xposition')) {
      this.locationSpecified = true;
      this.location.x = parseInvariantFloat(data.get('xposition'));
    }

    if (data.has('yposition')) {
      this.locationSpecified = true;
      this.location.y = parseInvariantFloat(data.get('yposition'));
    }
    if (data.has('comment')) {
      this.comment = data.get('comment')!;
    }

    this.operations = [];
    if (data.has('operations')) {
      for (const s of split(data.get('operations')!, [' '], undefined, true)) {
        this.operations.push(new VarOperation(s));
      }
    }

    // Backwards support for format < 8
    if (format <= 8 && this.sectionName.startsWith('EventEnd')) {
      this.operations.push(new VarOperation('$end,=,1'));
    }

    this.tests = new VarTests();
    if (data.has('vartests')) {
      //todo load save
      for (const s of split(data.get('vartests')!, [' '], undefined, true)) {
        this.tests.add(s);
      }
    }
    // Backwards support for conditions
    else if (data.has('conditions')) {
      let i = 0;
      for (const s of split(data.get('conditions')!, [' '], undefined, true)) {
        if (i > 0) this.tests.add(new VarTestsLogicalOperator('AND'));
        this.tests.add(new VarOperation(s));
        i++;
      }
    }
  }

  // Helper function to remove an element form an array
  // Valkyrie: QuestData.cs QuestComponent.RemoveFromArray
  static removeFromArray(array: readonly string[], element: string): string[] {
    return array.filter((s) => s !== element);
  }

  // Used to rename components
  // Valkyrie: QuestData.cs QuestComponent.ChangeReference
  changeReference(_oldName: string, _newName: string): void {}

  // Used to delete components
  // Valkyrie: QuestData.cs QuestComponent.RemoveReference
  removeReference(refName: string): void {
    // Rename to "" is taken to be delete
    this.changeReference(refName, '');
  }

  // Helper for parsing floats with logging
  // Valkyrie: QuestData.cs QuestComponent.ParseFloat
  static parseFloat(s: string): number {
    const result = floatTryParse(s);
    if (result.ok) return result.value;
    if (!isNullOrEmpty(s)) {
      ValkyrieDebug.log('Warning: Failed to parse float: ' + s);
    }
    return 0;
  }

  // Helper for parsing ints with logging
  // Valkyrie: QuestData.cs QuestComponent.ParseInt
  static parseInt(s: string): number {
    const result = intTryParse(s);
    if (result.ok) return result.value;
    if (!isNullOrEmpty(s)) {
      ValkyrieDebug.log('Warning: Failed to parse int: ' + s);
    }
    return 0;
  }

  // Helper for parsing bools with logging
  // Valkyrie: QuestData.cs QuestComponent.ParseBool
  static parseBool(s: string): boolean {
    const result = boolTryParse(s);
    if (result.ok) return result.value;
    if (!isNullOrEmpty(s)) {
      ValkyrieDebug.log('Warning: Failed to parse bool: ' + s);
    }
    return false;
  }

  // Save to string (editor)
  // Valkyrie: QuestData.cs QuestComponent.ToString
  toString(): string {
    const nl = NewLine;
    let r = '[' + this.sectionName + ']' + nl;
    if (this.locationSpecified) {
      r += 'xposition=' + floatToString(this.location.x) + nl;
      r += 'yposition=' + floatToString(this.location.y) + nl;
    }
    if (this.comment.length > 0) {
      r += 'comment=' + this.comment + nl;
    }

    if (this.operations !== null && this.operations.length > 0) {
      r += 'operations=';
      for (const o of this.operations) {
        r += o.toString() + ' ';
      }
      r = r.substring(0, r.length - 1) + nl;
    }

    if (this.tests !== null && this.tests.varTestsComponents.length > 0) {
      r += 'vartests=' + this.tests.toString() + nl;
    }

    return r;
  }
}

// Events are used to create dialogs that control the quest
// Valkyrie: QuestData.cs QuestData.Event
class Event extends QuestComponent {
  static override type = 'Event';

  display = true;
  trigger = '';
  buttons: QuestButtonData[] = [];
  heroListName = '';
  minHeroes = 0;
  maxHeroes = 0;
  addComponents: string[] = [];
  removeComponents: string[] = [];
  cancelable = false;
  highlight = false;
  randomEvents = false;
  minCam = false;
  maxCam = false;
  quota = 0;
  quotaVar = '';
  audio = '';
  music: string[] = [];

  get text_key(): string {
    return this.genKey('text');
  }

  get text(): StringKey {
    return this.genQuery('text');
  }

  /** Event(string s) creates a new event in the editor; Event(name, data, path, format) reads it from ini data. */
  // Valkyrie: QuestData.cs Event.Event
  constructor(name: string, data?: Map<string, string>, path?: string, format?: number) {
    super(name, data, path, format);
    if (data === undefined) {
      this.source = 'events.ini';
      this.display = false;
      this.typeDynamic = Event.type;
      this.buttons = [];
      this.addComponents = [];
      this.removeComponents = [];
      this.operations = [];
      this.tests = new VarTests();
      this.minCam = false;
      this.maxCam = false;
      this.music = [];
      return;
    }
    this.typeDynamic = Event.type;

    if (data.has('display')) {
      this.display = boolTryParse(data.get('display')).value;
    }

    // Should the target location by highlighted?
    if (data.has('highlight')) {
      this.highlight = boolTryParse(data.get('highlight')).value;
    }

    this.buttons = [];

    let buttonCount = 0;
    if (data.has('buttons')) {
      buttonCount = intTryParse(data.get('buttons')).value;
    }

    // Displayed events must have a button
    if (this.display && buttonCount === 0) {
      buttonCount = 1;
    }

    for (let buttonNum = 1; buttonNum <= buttonCount; buttonNum++) {
      this.buttons.push(QuestButtonDataSerializer.fromData(data, buttonNum, this.sectionName));
    }

    // Heros from another event can be hilighted
    if (data.has('hero')) {
      this.heroListName = data.get('hero')!;
    }

    // Success quota
    if (data.has('quota')) {
      const quota = data.get('quota')!;
      this.quota = intTryParse(quota).value;
      if (quota.length > 0 && !isNumber(quota[0])) {
        this.quotaVar = quota;
      }
    }

    // minimum heros required to be selected for event
    if (data.has('minhero')) {
      this.minHeroes = intTryParse(data.get('minhero')).value;
    }

    // maximum heros selectable for event (0 disables)
    if (data.has('maxhero')) {
      this.maxHeroes = intTryParse(data.get('maxhero')).value;
    }

    // Display hidden components (space separated list)
    if (data.has('add')) {
      this.addComponents = split(data.get('add')!, [' '], undefined, true);
    } else {
      this.addComponents = [];
    }

    // Hide components (space separated list)
    if (data.has('remove')) {
      this.removeComponents = split(data.get('remove')!, [' '], undefined, true);
    } else {
      this.removeComponents = [];
    }

    // trigger event on condition
    if (data.has('trigger')) {
      this.trigger = data.get('trigger')!;
    }

    // Randomise next event setting
    if (data.has('randomevents')) {
      this.randomEvents = boolTryParse(data.get('randomevents')).value;
    }
    // Randomise next event setting
    if (data.has('mincam')) {
      this.locationSpecified = false;
      this.minCam = boolTryParse(data.get('mincam')).value;
    }
    // Randomise next event setting
    if (data.has('maxcam')) {
      this.locationSpecified = false;
      this.maxCam = boolTryParse(data.get('maxcam')).value;
    }
    if (data.has('audio')) {
      const value = data.get('audio');
      this.audio = value !== undefined && value !== null ? value.replace(/\\/g, '/') : (value as unknown as string);
    }
    this.music = [];
    if (data.has('music')) {
      this.music = split(data.get('music')!, [' '], undefined, true);
      for (let i = 0; i < this.music.length; i++) {
        this.music[i] = this.music[i]!.replace(/\\/g, '/');
      }
    }
  }

  // Check all references when a component name is changed
  // Valkyrie: QuestData.cs Event.ChangeReference
  override changeReference(oldName: string, newName: string): void {
    if (this.sectionName === oldName && newName !== '') {
      for (let i = 1; i <= this.buttons.length; i++) {
        this.buttons[i - 1]!.label = new StringKey('qst', newName + '.' + 'button' + i);
      }
    }

    // hero list event is changed
    if (this.heroListName === oldName) {
      this.heroListName = newName;
    }

    const isRemoveOperation = newName === '';
    // a next event is changed
    for (let i = 0; i < this.buttons.length; i++) {
      const eventNames = this.buttons[i]!.eventNames;

      // Handle event removal
      if (isRemoveOperation) {
        const index = eventNames.indexOf(oldName);
        if (index !== -1) eventNames.splice(index, 1);
        continue;
      }

      // Handle event name change
      for (let j = 0; j < eventNames.length; j++) {
        if (eventNames[j] === oldName) {
          eventNames[j] = newName;
        }
      }
    }

    // If CustomMonster renamed update trigger
    if (this.trigger.indexOf('Defeated' + oldName) === 0) {
      this.trigger = 'Defeated' + newName;
    }
    if (this.trigger.indexOf('DefeatedUnique' + oldName) === 0) {
      this.trigger = 'DefeatedUnique' + newName;
    }

    // component to add renamed
    for (let i = 0; i < this.addComponents.length; i++) {
      if (this.addComponents[i] === oldName) {
        this.addComponents[i] = newName;
      }
    }
    // If component is deleted, trim array
    this.addComponents = QuestComponent.removeFromArray(this.addComponents, '');

    // component to remove renamed
    for (let i = 0; i < this.removeComponents.length; i++) {
      if (this.removeComponents[i] === oldName) {
        this.removeComponents[i] = newName;
      }
    }
    // If component is deleted, trim array
    this.removeComponents = QuestComponent.removeFromArray(this.removeComponents, '');
  }

  // Save event to string (editor)
  // Valkyrie: QuestData.cs Event.ToString
  override toString(): string {
    const nl = NewLine;
    let r = super.toString();

    if (!this.display) {
      r += 'display=false' + nl;
    }

    if (this.highlight) {
      r += 'highlight=true' + nl;
    }

    r += 'buttons=' + this.buttons.length + nl;

    this.buttons.forEach((buttonData, i) => {
      r += QuestButtonDataSerializer.toEventString(i + 1, buttonData);
    });

    if (this.heroListName !== '') {
      r += 'hero=' + this.heroListName + nl;
    }
    if (this.quotaVar.length > 0) {
      r += 'quota=' + this.quotaVar + nl;
    } else if (this.quota !== 0) {
      r += 'quota=' + this.quota + nl;
    }
    if (this.minHeroes !== 0) {
      r += 'minhero=' + this.minHeroes + nl;
    }
    if (this.maxHeroes !== 0) {
      r += 'maxhero=' + this.maxHeroes + nl;
    }
    if (this.addComponents.length > 0) {
      r += 'add=' + joinWithSpaces(this.addComponents) + nl;
    }
    if (this.removeComponents.length > 0) {
      r += 'remove=' + joinWithSpaces(this.removeComponents) + nl;
    }
    if (this.trigger !== '') {
      r += 'trigger=' + this.trigger + nl;
    }

    if (this.randomEvents) {
      r += 'randomevents=true' + nl;
    }
    // Randomise next event setting
    if (this.minCam) {
      r += 'mincam=true' + nl;
    }
    if (this.maxCam) {
      r += 'maxcam=true' + nl;
    }
    if (this.maxCam || this.minCam) {
      r += 'xposition=' + floatToString(this.location.x) + nl;
      r += 'yposition=' + floatToString(this.location.y) + nl;
    }

    if (this.audio.length > 0) {
      r += 'audio=' + this.audio + nl;
    }

    if (this.music.length > 0) {
      r += 'music=' + joinWithSpaces(this.music) + nl;
    }

    return r;
  }
}

// Class for Tile components (use TileSide content data)
// Valkyrie: QuestData.cs QuestData.Tile
class Tile extends QuestComponent {
  static override type = 'Tile';
  rotation = 0;
  tileSideName = '';
  customImage = '';
  top = 0;
  left = 0;

  /** Tile(string s) creates a new tile in the editor; Tile(name, data, path) reads it from ini data. */
  // Valkyrie: QuestData.cs Tile.Tile
  constructor(name: string, data?: Map<string, string>, path?: string) {
    super(name, data, path);
    if (data === undefined) {
      this.locationSpecified = true;
      this.typeDynamic = Tile.type;
      const game = Game.get();
      this.source = 'tiles.ini';
      this.tileSideName = game.cd.keys(TileSideData)[0] ?? (null as unknown as string);
      return;
    }
    // Tiles must have a location
    this.locationSpecified = true;
    this.typeDynamic = Tile.type;
    // Get rotation if specified
    if (data.has('rotation')) {
      this.rotation = intTryParse(data.get('rotation')).value;
    }

    // Find the tileside that is used
    this.tileSideName = '';
    if (data.has('side')) {
      this.tileSideName = data.get('side')!;
    }
    if (data.has('customImage')) {
      this.customImage = data.get('customImage')!;
    }
    if (data.has('top')) {
      this.top = parseInvariantFloat(data.get('top'));
    }
    if (data.has('left')) {
      this.left = parseInvariantFloat(data.get('left'));
    }

    if (this.tileSideName.length === 0 && this.customImage.length === 0) {
      // Fatal if missing
      ValkyrieDebug.log('Error: No TileSide specified in quest component: ' + name);
      Application.quit('tile-without-side', name, 'Error: No TileSide specified in quest component: ' + name);
    }
  }

  // Save to ini string (used by editor)
  // Valkyrie: QuestData.cs Tile.ToString
  override toString(): string {
    const nl = NewLine;
    let r = super.toString();

    if (this.tileSideName.length > 0) {
      r += 'side=' + this.tileSideName + nl;
    }
    if (this.rotation !== 0) {
      r += 'rotation=' + this.rotation + nl;
    }
    if (this.customImage.length > 0) {
      r += 'customImage=' + this.customImage + nl;
      if (this.top !== 0) {
        r += 'top=' + floatToString(this.top) + nl;
      }
      if (this.left !== 0) {
        r += 'left=' + floatToString(this.left) + nl;
      }
    }
    return r;
  }
}

// Doors are like tokens but placed differently and have different defaults
// Valkyrie: QuestData.cs QuestData.Door
class Door extends Event {
  static override type = 'Door';
  rotation = 0;
  // A UnityEngine.GameObject in Valkyrie; the app keeps its own object here
  gameObject: unknown = null;
  colourName = 'white';

  /** Door(string s) creates a new door in the editor; Door(name, data, game, path) reads it from ini data. */
  // Valkyrie: QuestData.cs Door.Door
  constructor(name: string, data?: Map<string, string>, _game?: Game | null, path?: string) {
    super(name, data, path, QuestData_Quest.currentFormat);
    if (data === undefined) {
      this.source = 'door.ini';
      this.locationSpecified = true;
      this.typeDynamic = Door.type;
      this.cancelable = true;
      return;
    }
    this.locationSpecified = true;
    this.typeDynamic = Door.type;
    // Doors are cancelable because you can select then cancel
    this.cancelable = true;

    if (data.has('rotation')) {
      this.rotation = intTryParse(data.get('rotation')).value;
    }

    // color is only supported as a hexadecimal "#RRGGBB" format
    if (data.has('color')) {
      this.colourName = data.get('color')!;
    }
  }

  // Save to string
  // Valkyrie: QuestData.cs Door.ToString
  override toString(): string {
    const nl = NewLine;
    let r = super.toString();

    if (this.colourName !== 'white') {
      r += 'color=' + this.colourName + nl;
    }
    if (this.rotation !== 0) {
      r += 'rotation=' + this.rotation + nl;
    }
    return r;
  }
}

// Tokens are events that are tied to a token placed on the board
// Valkyrie: QuestData.cs QuestData.Token
class Token extends Event {
  static override type = 'Token';
  rotation = 0;
  tokenName = '';
  customImage = '';
  tokenSize = '';
  enableClick = true;

  /** Token(string s) creates a new token in the editor; Token(name, data, game, path) reads it from ini data. */
  // Valkyrie: QuestData.cs Token.Token
  constructor(name: string, data?: Map<string, string>, _game?: Game | null, path?: string) {
    super(name, data, path, QuestData_Quest.currentFormat);
    if (data === undefined) {
      this.source = 'tokens.ini';
      this.locationSpecified = true;
      this.typeDynamic = Token.type;
      this.tokenName = 'TokenSearch';
      this.cancelable = true;
      this.enableClick = true;
      // Valkyrie: Game.Get().gameType is D2EGameType
      this.tokenSize = Game.get().gameType.typeName() === ValkyrieConstants.typeDescent ? 'small' : '';
      return;
    }
    this.locationSpecified = true;
    this.typeDynamic = Token.type;
    // Tokens are cancelable because you can select then cancel
    this.cancelable = true;

    // Tokens don't have conditions
    this.tests = null;

    this.tokenName = '';
    if (data.has('type')) {
      this.tokenName = data.get('type')!;
    }
    // Get rotation if specified
    if (data.has('rotation')) {
      this.rotation = QuestComponent.parseInt(data.get('rotation')!);
    }
    if (data.has('tokensize')) {
      this.tokenSize = data.get('tokensize')!;
    }
    if (data.has('clickeffect')) {
      this.enableClick = QuestComponent.parseBool(data.get('clickeffect')!);
    }
    if (data.has('customImage')) {
      this.customImage = data.get('customImage')!;
    }
  }

  // Save to string (for editor)
  // Valkyrie: QuestData.cs Token.ToString
  override toString(): string {
    const nl = NewLine;
    let r = super.toString();

    r += 'type=' + this.tokenName + nl;
    if (this.rotation !== 0) {
      r += 'rotation=' + this.rotation + nl;
    }
    if (this.tokenSize.length > 0) {
      r += 'tokensize=' + this.tokenSize + nl;
    }
    if (!this.enableClick) {
      r += 'clickeffect=false' + nl;
    }
    if (this.customImage.length > 0) {
      r += 'customImage=' + this.customImage + nl;
    }
    return r;
  }
}

// UI is an image/button that is displayed to the user
// Valkyrie: QuestData.cs QuestData.UI
class UI extends Event {
  static override type = 'UI';
  imageName = '';
  verticalUnits = false;
  hAlign = 0;
  vAlign = 0;
  size = 1;
  richText = false;
  textSize = 1;
  textColor = 'white';
  textBackgroundColor = 'transparent';
  textAlignment: TextAlignment = TextAlignment.CENTER;
  aspect = 1;

  border = false;
  fadeSpeed = 'fast';
  enableClick = true;

  get uitext_key(): string {
    return this.genKey('uitext');
  }

  get uiText(): StringKey {
    return this.genQuery('uitext');
  }

  /** UI(string s) creates a new UI in the editor; UI(name, data, game, path) reads it from ini data. */
  // Valkyrie: QuestData.cs UI.UI
  constructor(name: string, data?: Map<string, string>, _game?: Game | null, path?: string) {
    super(name, data, path, QuestData_Quest.currentFormat);
    if (data === undefined) {
      this.source = 'ui.ini';
      this.locationSpecified = true;
      this.typeDynamic = UI.type;
      this.cancelable = true;
      this.enableClick = true;
      return;
    }
    this.locationSpecified = true;
    this.typeDynamic = UI.type;
    // Tokens are cancelable because you can select then cancel
    this.cancelable = true;

    if (data.has('image')) {
      const value = data.get('image');
      this.imageName = value !== undefined && value !== null ? value.replace(/\\/g, '/') : (value as unknown as string);
    }

    if (data.has('fadespeed')) {
      this.fadeSpeed = data.get('fadespeed')!;
    }

    if (data.has('vunits')) {
      this.verticalUnits = boolTryParse(data.get('vunits')).value;
    }

    if (data.has('size')) {
      this.size = parseInvariantFloat(data.get('size'));
    }

    if (data.has('textsize')) {
      this.textSize = parseInvariantFloat(data.get('textsize'));
    }

    if (data.has('textaspect')) {
      this.aspect = parseInvariantFloat(data.get('textaspect'));
    }

    if (data.has('textcolor')) {
      this.textColor = data.get('textcolor')!;
    }

    if (data.has('textbackgroundcolor')) {
      this.textBackgroundColor = data.get('textbackgroundcolor')!;
    }

    if (data.has('halign')) {
      if (data.get('halign') === 'left') {
        this.hAlign = -1;
      }
      if (data.get('halign') === 'right') {
        this.hAlign = 1;
      }
    }

    if (data.has('valign')) {
      if (data.get('valign') === 'top') {
        this.vAlign = -1;
      }
      if (data.get('valign') === 'bottom') {
        this.vAlign = 1;
      }
    }

    const textAlignString = data.get('textAlignment');
    if (textAlignString !== undefined) {
      this.textAlignment = TextAlignmentUtils.parseAlignment(textAlignString);
    }

    const richTextString = data.get('richText');
    if (richTextString !== undefined) {
      const richTextBool = boolTryParse(richTextString);
      if (richTextBool.ok) this.richText = richTextBool.value;
    }

    if (data.has('border')) {
      this.border = boolTryParse(data.get('border')).value;
    }

    if (data.has('clickeffect')) {
      this.enableClick = boolTryParse(data.get('clickeffect')).value;
    }
  }

  // Save to string (for editor)
  // Valkyrie: QuestData.cs UI.ToString
  override toString(): string {
    const nl = NewLine;
    let r = super.toString();

    r += 'image=' + this.imageName + nl;
    r += 'size=' + floatToString(this.size) + nl;

    if (this.textSize !== 1) {
      r += 'textsize=' + floatToString(this.textSize) + nl;
    }

    if (this.textColor !== 'white') {
      r += 'textcolor=' + this.textColor + nl;
    }

    if (this.textBackgroundColor !== 'transparent') {
      r += 'textbackgroundcolor=' + this.textBackgroundColor + nl;
    }

    if (this.richText) {
      r += `richText=${boolToString(this.richText)}${nl}`;
    }

    if (this.textAlignment !== TextAlignment.CENTER) {
      r += `textAlignment=${enumToString(TextAlignment, this.textAlignment)}${nl}`;
    }

    if (this.verticalUnits) {
      r += 'vunits=' + boolToString(this.verticalUnits) + nl;
    }

    if (this.border) {
      r += 'border=' + boolToString(this.border) + nl;
    }

    if (this.aspect !== 1) {
      r += 'textaspect=' + floatToString(this.aspect) + nl;
    }

    if (this.hAlign < 0) {
      r += 'halign=left' + nl;
    }
    if (this.hAlign > 0) {
      r += 'halign=right' + nl;
    }

    if (this.vAlign < 0) {
      r += 'valign=top' + nl;
    }
    if (this.vAlign > 0) {
      r += 'valign=bottom' + nl;
    }

    if (this.fadeSpeed !== 'fast') {
      r += 'fadespeed=' + this.fadeSpeed + nl;
    }

    if (!this.enableClick) {
      r += 'clickeffect=' + boolToString(this.enableClick) + nl;
    }

    return r;
  }
}

// Spawn items are monster group placement events
// Valkyrie: QuestData.cs QuestData.Spawn
class Spawn extends Event {
  static override type = 'Spawn';
  // Array of placements by hero count
  placement: string[][] = [];
  activated = false;
  unique = false;
  uniqueHealthBase = 0;
  uniqueHealthHero = 0;
  mTypes: string[] = [];
  mTraitsRequired: string[] = [];
  mTraitsPool: string[] = [];

  get uniquetitle_key(): string {
    return this.genKey('uniquetitle');
  }

  get uniquetext_key(): string {
    return this.genKey('uniquetext');
  }

  get uniqueTitle(): StringKey {
    return this.genQuery('uniquetitle');
  }

  get uniqueText(): StringKey {
    return this.genQuery('uniquetext');
  }

  /** Spawn(string s) creates a new spawn in the editor; Spawn(name, data, game, path) reads it from ini data. */
  // Valkyrie: QuestData.cs Spawn.Spawn
  constructor(name: string, data?: Map<string, string>, game?: Game | null, path?: string) {
    super(name, data, path, QuestData_Quest.currentFormat);
    if (data === undefined) {
      this.source = 'spawns.ini';
      // Location defaults to specified
      this.locationSpecified = true;
      this.typeDynamic = Spawn.type;
      const editorGame = Game.get();
      const firstMonster = editorGame.cd.keys(MonsterData)[0];
      if (firstMonster === undefined) throw new Error('InvalidOperationException: Sequence contains no elements');
      this.mTypes = [firstMonster];

      this.mTraitsRequired = [];
      this.mTraitsPool = [];

      // Initialise array
      let maxHeroes = 4;
      if (editorGame != null && editorGame.gameType != null) {
        maxHeroes = editorGame.gameType.maxHeroes() + 1;
      }
      this.placement = [];
      for (let i = 0; i < maxHeroes; i++) {
        this.placement.push([]);
      }
      return;
    }
    this.typeDynamic = Spawn.type;
    // First try to a list of specific types
    if (data.has('monster')) {
      this.mTypes = split(data.get('monster')!, [' '], undefined, true);
    } else {
      this.mTypes = [];
    }

    // A list of traits to match
    this.mTraitsRequired = [];
    if (data.has('traits')) {
      this.mTraitsRequired = split(data.get('traits')!, [' '], undefined, true);
    }

    // A list of traits to match
    this.mTraitsPool = [];
    if (data.has('traitpool')) {
      this.mTraitsPool = split(data.get('traitpool')!, [' '], undefined, true);
    }

    // Array of placements by hero count
    let maxHeroes = 4;
    if (game != null && game.gameType != null) {
      maxHeroes = game.gameType.maxHeroes() + 1;
    }
    this.placement = [];
    for (let i = 0; i < maxHeroes; i++) {
      let placement: string[] = [];
      if (data.has('placement' + i)) {
        placement = split(data.get('placement' + i)!, [' '], undefined, true);
      }
      this.placement.push(placement);
    }

    if (data.has('unique')) {
      this.unique = boolTryParse(data.get('unique')).value;
    }
    if (data.has('activated')) {
      this.activated = boolTryParse(data.get('activated')).value;
    }
    if (data.has('uniquehealth')) {
      this.uniqueHealthBase = parseInvariantFloat(data.get('uniquehealth'));
    }
    if (data.has('uniquehealthhero')) {
      this.uniqueHealthHero = parseInvariantFloat(data.get('uniquehealthhero'));
    }
  }

  // When changing the name placement event need to update in array
  // Valkyrie: QuestData.cs Spawn.ChangeReference
  override changeReference(oldName: string, newName: string): void {
    super.changeReference(oldName, newName);

    for (let j = 0; j < this.placement.length; j++) {
      const placement = this.placement[j]!;
      for (let i = 0; i < placement.length; i++) {
        // Placement used is being renamed
        if (placement[i] === oldName) {
          placement[i] = newName;
        }
      }
      // If any were replaced with "", remove them
      this.placement[j] = QuestComponent.removeFromArray(placement, '');
    }

    for (let i = 0; i < this.mTypes.length; i++) {
      // Placement used is being renamed
      if (this.mTypes[i] === oldName && oldName.indexOf('Monster') !== 0) {
        this.mTypes[i] = newName;
      }
    }
    // If any were replaced with "", remove them
    this.mTypes = QuestComponent.removeFromArray(this.mTypes, '');
  }

  // Save to string (editor)
  // Valkyrie: QuestData.cs Spawn.ToString
  override toString(): string {
    const nl = NewLine;
    let r = super.toString();

    if (this.mTypes.length > 0) {
      r += 'monster=' + joinWithSpaces(this.mTypes) + nl;
    }
    if (this.mTraitsRequired.length > 0) {
      r += 'traits=' + joinWithSpaces(this.mTraitsRequired) + nl;
    }
    if (this.mTraitsPool.length > 0) {
      r += 'traitpool=' + joinWithSpaces(this.mTraitsPool) + nl;
    }
    for (let i = 0; i < this.placement.length; i++) {
      if (this.placement[i]!.length > 0) {
        r += 'placement' + i + '=' + joinWithSpaces(this.placement[i]!) + nl;
      }
    }
    if (this.unique) {
      r += 'unique=true' + nl;
      r += 'uniquehealth=' + floatToString(this.uniqueHealthBase) + nl;
      r += 'uniquehealthhero=' + floatToString(this.uniqueHealthHero) + nl;
    }
    if (this.uniqueHealthBase !== 0 && !this.unique) {
      r += 'uniquehealth=' + floatToString(this.uniqueHealthBase) + nl;
    }
    if (this.uniqueHealthHero !== 0 && !this.unique) {
      r += 'uniquehealthhero=' + floatToString(this.uniqueHealthHero) + nl;
    }

    if (this.activated) {
      r += 'activated=true' + nl;
    }
    return r;
  }
}

// MPlaces are used to position individual monsters
// Valkyrie: QuestData.cs QuestData.MPlace
class MPlace extends QuestComponent {
  static readonly KEY_MASTER = 'master';
  static readonly KEY_ROTATE = 'rotate';
  static readonly KEY_TOKENSIZE = 'tokensize';

  master = false;
  static override type = 'MPlace';
  rotate = false;
  tokenSize = '';

  /** MPlace(string s) creates a new mplace in the editor; MPlace(name, data, path) reads it from ini data. */
  // Valkyrie: QuestData.cs MPlace.MPlace
  constructor(name: string, data?: Map<string, string>, path?: string) {
    super(name, data, path);
    if (data === undefined) {
      this.source = 'mplaces.ini';
      this.locationSpecified = true;
      this.typeDynamic = MPlace.type;
      return;
    }
    // Must have a location
    this.locationSpecified = true;
    this.typeDynamic = MPlace.type;
    this.master = false;

    if (data.has(MPlace.KEY_MASTER)) {
      this.master = QuestComponent.parseBool(data.get(MPlace.KEY_MASTER)!);
    }
    if (data.has(MPlace.KEY_ROTATE)) {
      this.rotate = QuestComponent.parseBool(data.get(MPlace.KEY_ROTATE)!);
    }
    if (data.has(MPlace.KEY_TOKENSIZE)) {
      this.tokenSize = data.get(MPlace.KEY_TOKENSIZE)!;
    }
  }

  // Save to string (editor)
  // Valkyrie: QuestData.cs MPlace.ToString
  override toString(): string {
    const nl = NewLine;
    let r = super.toString();
    if (this.master) {
      r += MPlace.KEY_MASTER + '=true' + nl;
    }
    if (this.rotate) {
      r += MPlace.KEY_ROTATE + '=true' + nl;
    }
    if (this.tokenSize.length > 0) {
      r += MPlace.KEY_TOKENSIZE + '=' + this.tokenSize + nl;
    }
    return r;
  }
}

// Puzzle component
// Valkyrie: QuestData.cs QuestData.Puzzle
class Puzzle extends Event {
  static override type = 'Puzzle';
  puzzleClass = 'slide';
  skill = '{observation}';
  puzzleLevel = 4;
  puzzleAltLevel = 3;
  puzzleSolution = '';

  imageType = '';
  fadeSpeed = 'instant';

  /** Puzzle(string s) creates a new puzzle in the editor; Puzzle(name, data, path) reads it from ini data. */
  // Valkyrie: QuestData.cs Puzzle.Puzzle
  constructor(name: string, data?: Map<string, string>, path?: string) {
    super(name, data, path, QuestData_Quest.currentFormat);
    if (data === undefined) {
      this.source = 'puzzles.ini';
      this.typeDynamic = Puzzle.type;
      this.buttons.push(new QuestButtonData(this.genQuery('button1')));
      LocalizationRead.updateScenarioText(this.genKey('button1'), new StringKey('val', 'PUZZLE_GUESS').translate());
      return;
    }
    this.typeDynamic = Puzzle.type;

    if (data.has('class')) {
      this.puzzleClass = data.get('class')!;
    }
    if (data.has('image')) {
      const value = data.get('image');
      this.imageType = value !== undefined && value !== null ? value.replace(/\\/g, '/') : (value as unknown as string);
    }
    if (data.has('fadespeed')) {
      this.fadeSpeed = data.get('fadespeed')!;
    }
    if (data.has('skill')) {
      this.skill = data.get('skill')!;
    }
    if (data.has('puzzlelevel')) {
      this.puzzleLevel = intTryParse(data.get('puzzlelevel')).value;
    }
    if (data.has('puzzlealtlevel')) {
      this.puzzleAltLevel = intTryParse(data.get('puzzlealtlevel')).value;
    }
    if (data.has('puzzlesolution')) {
      this.puzzleSolution = data.get('puzzlesolution')!;
    }
  }

  // Save to string (editor)
  // Valkyrie: QuestData.cs Puzzle.ToString
  override toString(): string {
    const nl = NewLine;
    let r = super.toString();

    if (this.puzzleClass !== 'slide') {
      r += 'class=' + this.puzzleClass + nl;
    }
    if (this.skill !== '{observation}') {
      r += 'skill=' + this.skill + nl;
    }
    if (this.imageType !== '') {
      r += 'image=' + this.imageType + nl;
    }
    if (this.puzzleLevel !== 4) {
      r += 'puzzlelevel=' + this.puzzleLevel + nl;
    }
    if (this.puzzleAltLevel !== 3) {
      r += 'puzzlealtlevel=' + this.puzzleAltLevel + nl;
    }
    if (this.puzzleSolution !== '') {
      r += 'puzzlesolution=' + this.puzzleSolution + nl;
    }
    if (this.fadeSpeed !== 'instant') {
      r += 'fadespeed=' + this.fadeSpeed + nl;
    }
    return r;
  }
}

// Monster defined in the quest
// Valkyrie: QuestData.cs QuestData.CustomMonster
class CustomMonster extends QuestComponent {
  static override type = 'CustomMonster';
  // A bast type is used for default values
  baseMonster = '';
  imagePath = '';
  imagePlace = '';
  activations: string[] = [];
  traits: string[] = [];
  path = '';
  healthBase = 0;
  healthPerHero = 0;
  healthDefined = false;
  evadeEvent = '';
  horrorEvent = '';
  horror = 0;
  horrorDefined = false;
  awareness = 0;
  awarenessDefined = false;
  investigatorAttacks = new Map<string, StringKey[]>();

  get monstername_key(): string {
    return this.genKey('monstername');
  }

  get info_key(): string {
    return this.genKey('info');
  }

  get monsterName(): StringKey {
    return this.genQuery('monstername');
  }

  get info(): StringKey {
    return this.genQuery('info');
  }

  /** CustomMonster(string s) creates a new monster in the editor; CustomMonster(iniName, data, pathIn) reads it. */
  // Valkyrie: QuestData.cs CustomMonster.CustomMonster
  constructor(iniName: string, data?: Map<string, string>, pathIn?: string) {
    super(iniName, data, pathIn);
    if (data === undefined) {
      this.source = 'monsters.ini';
      LocalizationRead.updateScenarioText(this.monstername_key, this.sectionName);
      LocalizationRead.updateScenarioText(this.info_key, '-');
      this.activations = [];
      this.traits = [];
      this.typeDynamic = CustomMonster.type;
      return;
    }
    this.typeDynamic = CustomMonster.type;
    this.path = Path.getDirectoryName(pathIn as string) as string;
    // Get base derived monster type
    if (data.has('base')) {
      this.baseMonster = data.get('base')!;
    }

    this.traits = [];
    if (data.has('traits')) {
      this.traits = split(data.get('traits')!, [' '], undefined, true);
    }

    if (data.has('image')) {
      const value = data.get('image');
      this.imagePath = value !== undefined && value !== null ? value.replace(/\\/g, '/') : (value as unknown as string);
    }

    this.imagePlace = this.imagePath;
    if (data.has('imageplace')) {
      this.imagePlace = data.get('imageplace')!;
    }

    this.activations = [];
    if (data.has('activation')) {
      this.activations = split(data.get('activation')!, [' '], undefined, true);
    }

    if (data.has('health')) {
      this.healthDefined = true;
      this.healthBase = parseInvariantFloat(data.get('health'));
    }
    if (data.has('healthperhero')) {
      this.healthDefined = true;
      this.healthPerHero = parseInvariantFloat(data.get('healthperhero'));
    }

    if (data.has('evadeevent')) {
      this.evadeEvent = data.get('evadeevent')!;
    }
    if (data.has('horrorevent')) {
      this.horrorEvent = data.get('horrorevent')!;
    }

    if (data.has('horror')) {
      this.horrorDefined = true;
      this.horror = intTryParse(data.get('horror')).value;
    }
    if (data.has('awareness')) {
      this.awarenessDefined = true;
      this.awareness = intTryParse(data.get('awareness')).value;
    }

    if (data.has('attacks')) {
      for (const typeEntry of split(data.get('attacks')!, [' '], undefined, true)) {
        let type = typeEntry;
        let typeCount = 1;
        const typeSeparator = typeEntry.indexOf(':');
        if (typeSeparator >= 0) {
          type = typeEntry.substring(0, typeSeparator);
          typeCount = intTryParse(typeEntry.substring(typeSeparator + 1)).value;
        }

        if (!this.investigatorAttacks.has(type)) {
          this.investigatorAttacks.set(type, []);
        }

        for (let i = 1; i <= typeCount; i++) {
          this.investigatorAttacks.get(type)!.push(this.genQuery('Attack_' + type + '_' + i));
        }
      }
    }
  }

  // get path of monster image
  // Valkyrie: QuestData.cs CustomMonster.GetImagePath
  getImagePath(): string {
    if (this.imagePath.length === 0) {
      // this will use the base monster type
      return '';
    }
    return this.path + Path.DirectorySeparatorChar + this.imagePath;
  }

  // Valkyrie: QuestData.cs CustomMonster.GetImagePlacePath
  getImagePlacePath(): string {
    if (this.imagePlace.length === 0) {
      // this will use the base monster type
      return '';
    }
    return this.path + Path.DirectorySeparatorChar + this.imagePlace;
  }

  // Save to string (editor)
  // Valkyrie: QuestData.cs CustomMonster.ToString
  override toString(): string {
    const nl = NewLine;
    let r = super.toString();

    if (this.baseMonster.length > 0) {
      r += 'base=' + this.baseMonster + nl;
    }
    if (this.traits.length > 0) {
      r += 'traits=' + this.traits.join(' ') + nl;
    }
    if (this.imagePath.length > 0) {
      r += 'image=' + this.imagePath + nl;
    }
    if (this.imagePlace.length > 0) {
      r += 'imageplace=' + this.imagePlace + nl;
    }
    if (this.activations.length > 0) {
      r += 'activation=' + this.activations.join(' ') + nl;
    }
    if (this.healthDefined) {
      r += 'health=' + floatToString(this.healthBase) + nl;
      r += 'healthperhero=' + floatToString(this.healthPerHero) + nl;
    }
    if (this.evadeEvent.length > 0) {
      r += 'evadeevent=' + this.evadeEvent + nl;
    }
    if (this.horrorEvent.length > 0) {
      r += 'horrorevent=' + this.horrorEvent + nl;
    }

    if (this.horrorDefined) {
      r += 'horror=' + this.horror + nl;
    }
    if (this.awarenessDefined) {
      r += 'awareness=' + this.awareness + nl;
    }

    if (this.investigatorAttacks.size > 0) {
      let attacksLine = 'attacks=';
      for (const [type, attacks] of this.investigatorAttacks) {
        attacksLine += type + ':' + attacks.length + ' ';
      }
      r += attacksLine.substring(0, attacksLine.length - 1) + nl;
    }

    return r;
  }

  // When changing the name placement event need to update in array
  // Valkyrie: QuestData.cs CustomMonster.ChangeReference
  override changeReference(oldName: string, newName: string): void {
    for (let i = 0; i < this.activations.length; i++) {
      if (this.activations[i] === oldName) {
        this.activations[i] = newName;
      } else {
        if (oldName === 'Activation' + this.activations[i]) {
          if (newName.indexOf('Activation') === 0) {
            this.activations[i] = newName.substring('Activation'.length);
          }
          if (newName.length === 0) {
            this.activations[i] = '';
          }
        }
      }
    }
    // If any were replaced with "", remove them
    this.activations = QuestComponent.removeFromArray(this.activations, '');

    if (this.evadeEvent === oldName) {
      this.evadeEvent = newName;
    }
    if (this.horrorEvent === oldName) {
      this.horrorEvent = newName;
    }
  }
}

// Quest defined Monster activation
// Valkyrie: QuestData.cs QuestData.Activation
class Activation extends QuestComponent {
  static override type = 'Activation';
  minionFirst = false;
  masterFirst = false;

  get ability_key(): string {
    return this.genKey('ability');
  }
  get minion_key(): string {
    return this.genKey('minion');
  }
  get master_key(): string {
    return this.genKey('master');
  }
  get movebutton_key(): string {
    return this.genKey('movebutton');
  }
  get move_key(): string {
    return this.genKey('move');
  }

  get ability(): StringKey {
    return this.genQuery('ability');
  }
  get minionActions(): StringKey {
    return this.genQuery('minion');
  }
  get masterActions(): StringKey {
    return this.genQuery('master');
  }
  get moveButton(): StringKey {
    return this.genQuery('movebutton');
  }
  get move(): StringKey {
    return this.genQuery('move');
  }

  /** Activation(string s) creates a new activation in the editor; Activation(name, data, path) reads it. */
  // Valkyrie: QuestData.cs Activation.Activation
  constructor(name: string, data?: Map<string, string>, path?: string) {
    super(name, data, path);
    if (data === undefined) {
      this.source = 'monsters.ini';
      LocalizationRead.updateScenarioText(this.ability_key, '-');
      this.typeDynamic = Activation.type;
      return;
    }
    this.typeDynamic = Activation.type;
    if (data.has('minionfirst')) {
      this.minionFirst = boolTryParse(data.get('minionfirst')).value;
    }
    if (data.has('masterfirst')) {
      this.masterFirst = boolTryParse(data.get('masterfirst')).value;
    }
  }

  // Save to string
  // Valkyrie: QuestData.cs Activation.ToString
  override toString(): string {
    const nl = NewLine;
    let r = super.toString();

    if (this.minionFirst) {
      r += 'minionfirst=' + boolToString(this.minionFirst) + nl;
    }
    if (this.masterFirst) {
      r += 'masterfirst=' + boolToString(this.masterFirst) + nl;
    }
    return r;
  }
}

// Scenario starting item
// Valkyrie: QuestData.cs QuestData.QItem
class QItem extends QuestComponent {
  static override type = 'QItem';
  itemName: string[] = [];
  traits: string[] = [];
  traitpool: string[] = [];
  starting = false;
  inspect = '';

  /** QItem(string s) creates a new item in the editor; QItem(name, data, path) reads it from ini data. */
  // Valkyrie: QuestData.cs QItem.QItem
  constructor(name: string, data?: Map<string, string>, path?: string) {
    super(name, data, path);
    if (data === undefined) {
      this.source = 'items.ini';
      this.typeDynamic = QItem.type;
      this.itemName = [];
      this.traits = ['weapon'];
      this.traitpool = [];
      return;
    }
    this.typeDynamic = QItem.type;
    if (data.has('itemname')) {
      this.itemName = split(data.get('itemname')!, [' '], undefined, true);
    } else {
      this.itemName = [];
    }

    if (data.has('starting')) {
      this.starting = boolTryParse(data.get('starting')).value;
    } else {
      // Depreciated (Format 3)
      this.starting = true;
    }

    if (data.has('traits')) {
      this.traits = split(data.get('traits')!, [' '], undefined, true);
    } else {
      this.traits = [];
    }
    if (data.has('traitpool')) {
      this.traitpool = split(data.get('traitpool')!, [' '], undefined, true);
    } else {
      this.traitpool = [];
    }
    if (data.has('inspect')) {
      this.inspect = data.get('inspect')!;
    }
  }

  // Save to string
  // Valkyrie: QuestData.cs QItem.ToString
  override toString(): string {
    const nl = NewLine;
    let r = super.toString();

    if (this.itemName.length > 0) {
      r += 'itemname=' + joinWithSpaces(this.itemName) + nl;
    }

    // Depreciated (Format 3) - To make default false
    r += 'starting=' + boolToString(this.starting) + nl;

    if (this.traits.length > 0) {
      r += 'traits=' + joinWithSpaces(this.traits) + nl;
    }
    if (this.traitpool.length > 0) {
      r += 'traitpool=' + joinWithSpaces(this.traitpool) + nl;
    }

    if (this.inspect.length > 0) {
      r += 'inspect=' + this.inspect + nl;
    }
    return r;
  }

  // When changing the name placement event need to update in array
  // Valkyrie: QuestData.cs QItem.ChangeReference
  override changeReference(oldName: string, newName: string): void {
    if (this.inspect === oldName) {
      this.inspect = newName;
    }
    for (let i = 0; i < this.itemName.length; i++) {
      if (this.itemName[i] === oldName) {
        this.itemName[i] = newName;
      }
    }
    // If any were replaced with "", remove them
    this.itemName = QuestComponent.removeFromArray(this.itemName, '');
  }
}

// Valkyrie: QuestData.cs QuestData.QuestLoaderContext
class QuestLoaderContext {
  gameType = '';
  maxHeroes = 0;
  defaultHeroes = 0;
  currentLang = '';
  isMoM = false;
  questListMode: QuestListMode = QuestListMode.ONLINE;
}

/** DateTime.MinValue, what `new DateTime(0)` gives and a failed DateTime.TryParse leaves. */
const DATETIME_MIN = new Date(-62135596800000);

/** SortedSet<string> order: the invariant culture, where letter case only breaks ties (a < B < b). */
const invariantCollator = new Intl.Collator('en-US', { usage: 'sort', sensitivity: 'variant', caseFirst: 'lower' });

// Quest ini component has special data
// Valkyrie: QuestData.cs QuestData.Quest
class QuestData_Quest {
  static minumumFormat = 4;
  // Increment during changes, and again at release
  static currentFormat: number = QuestFormat.CURRENT_VERSION;
  format = 0;
  hidden = false;
  valid = false;
  path = '';
  identifier = '';
  // quest type (MoM, D2E)
  type = '';
  // Content packs required for quest
  packs: string[] = [];
  // Default language for the text
  defaultLanguage: string = ValkyrieConstants.DefaultLanguage;
  //Default music will be played when starting the quest
  defaultMusicOn = false;
  // raw localization dictionary
  localizationDict: DictionaryI18n | null = null;

  image = '';

  minHero = 2;
  maxHero = 5;
  difficulty = 0;
  lengthMin = 0;
  lengthMax = 0;

  // -- data for initial scenario listing
  // CRC32 of valkyrie package
  version = '';
  // languages availables with scenario name <"English", "The Fall of House Lynch">
  languages_name: Map<string, string> | null = null;
  // languages availables with synopsys name <"English", "This is the synopsys">
  languages_synopsys: Map<string, string> | null = null;
  // languages availables with synopsys name <"English", "Authors in one line">
  languages_authors_short: Map<string, string> | null = null;
  // URL of the package
  package_url = '';
  // latest_update date if file is stored on Github
  latest_update: Date = DATETIME_MIN;
  // is package available locally
  downloaded = false;
  update_available = false;

  // -- data inside translation file (for unzipped quest)
  get name_key(): string {
    return 'quest.name';
  }
  get description_key(): string {
    return 'quest.description';
  }
  get synopsys_key(): string {
    return 'quest.synopsys';
  }
  get authors_key(): string {
    return 'quest.authors';
  }
  get authors_short_key(): string {
    return 'quest.authors_short';
  }

  get name(): StringKey {
    return new StringKey('qst', this.name_key);
  }
  get description(): StringKey {
    return new StringKey('qst', this.description_key);
  }
  get synopsys(): StringKey {
    return new StringKey('qst', this.synopsys_key);
  }
  get authors(): StringKey {
    return new StringKey('qst', this.authors_key);
  }
  get authors_short(): StringKey {
    return new StringKey('qst', this.authors_short_key);
  }

  // Context for async loading
  private context: QuestLoaderContext | null = null;

  /**
   * Quest(pathIn) and Quest(pathIn, ctx) load a quest folder; Quest(identifier, iniData) builds it from ini data.
   */
  // Valkyrie: QuestData.cs Quest.Quest
  constructor(pathOrIdentifier: string, ctxOrIniData?: QuestLoaderContext | Map<string, string>) {
    if (ctxOrIniData instanceof Map) {
      this.createDefaultContext();
      this.identifier = pathOrIdentifier.toLowerCase();
      const qst = LocalizationRead.dicts.get('qst');
      if (LocalizationRead.dicts.has('qst')) {
        this.localizationDict = qst ?? null;
      } else {
        this.localizationDict = new DictionaryI18n(['.,' + this.context!.currentLang], this.defaultLanguage);
      }
      this.valid = this.populate(ctxOrIniData);
      return;
    }
    if (ctxOrIniData === undefined) {
      // Default context from Game.Get() for main thread usage
      this.createDefaultContext();
    } else {
      this.context = ctxOrIniData;
    }
    this.load(pathOrIdentifier);
  }

  // Valkyrie: QuestData.cs Quest.CreateDefaultContext
  private createDefaultContext(): void {
    if (Game.game === null) return; // Should not happen in main thread usage
    this.context = new QuestLoaderContext();
    this.context.gameType = Game.get().gameType.typeName();
    this.context.maxHeroes = Game.get().gameType.maxHeroes();
    this.context.defaultHeroes = Game.get().gameType.defaultHeroes();
    this.context.currentLang = Game.get().currentLang;
    // Valkyrie: Game.Get().gameType is MoMGameType
    this.context.isMoM = Game.get().gameType.typeName() === ValkyrieConstants.typeMom;
    this.context.questListMode = Game.get().questsList.quest_list_mode;
  }

  // Valkyrie: QuestData.cs Quest.Load
  private load(pathIn: string): void {
    this.path = pathIn;
    if (this.path.endsWith('\\') || this.path.endsWith('/')) {
      this.path = this.path.substring(0, this.path.length - 1);
    }

    this.identifier = Path.getFileNameWithoutExtension(this.path).toLowerCase();

    const iniData = IniRead.readFromIniSection(this.path + Path.DirectorySeparatorChar + 'quest.ini', 'Quest');
    if (iniData === null) {
      ValkyrieDebug.log('Could not load the quest.ini file in ' + this.path + Path.DirectorySeparatorChar + 'quest.ini');
      this.valid = false;
      return;
    }

    // do not parse the content of a quest from another game type
    if (iniData.has('type') && iniData.get('type') !== this.context!.gameType) {
      ValkyrieDebug.log(
        'Quest ' + this.identifier + ' is not compatible with the current game type: ' + this.context!.gameType + ', it is for ' + iniData.get('type'),
      );
      this.valid = false;
      return;
    }

    //Read the localization data
    const localizationData = IniRead.readFromIniSection(this.path + Path.DirectorySeparatorChar + 'quest.ini', 'QuestText')!;

    this.localizationDict = new DictionaryI18n(this.defaultLanguage);
    for (const file of localizationData.keys()) {
      this.localizationDict.addDataFromFile(this.path + '/' + file);
    }

    this.valid = this.populate(iniData);
  }

  /** Create from ini data; returns true if the quest is valid */
  // Valkyrie: QuestData.cs Quest.Populate
  populate(iniData: Map<string, string>): boolean {
    if (iniData.has('format')) {
      this.format = intTryParse(iniData.get('format')).value;
    }

    if (this.format > QuestData_Quest.currentFormat || this.format < QuestData_Quest.minumumFormat) {
      ValkyrieDebug.log(
        'Quest ' + this.identifier + ' has an unknown format: ' + this.format + ', expected between ' + QuestData_Quest.minumumFormat + ' and ' + QuestData_Quest.currentFormat,
      );
      return false;
    }

    this.type = '';
    if (iniData.has('type')) {
      this.type = iniData.get('type')!;
    }

    const requiredPacks = new Set<string>();
    if (
      this.context!.isMoM &&
      this.format < QuestFormat.Versions.SPLIT_BASE_MOM_AND_CONVERSION_KIT &&
      QuestFormat.SCENARIOS_THAT_REQUIRE_CONVERSION_KIT.has(this.identifier)
    ) {
      requiredPacks.add('MoM1CK');
    }
    if (iniData.has('packs')) {
      this.packs = split(iniData.get('packs')!, [' '], undefined, true);
      // Depreciated Format 5
      for (const s of this.packs) {
        if (s === 'MoM1E') {
          requiredPacks.add('MoM1ET');
          requiredPacks.add('MoM1EI');
          requiredPacks.add('MoM1EM');
        } else if (s === 'FA') {
          requiredPacks.add('FAT');
          requiredPacks.add('FAI');
          requiredPacks.add('FAM');
        } else if (s === 'CotW') {
          requiredPacks.add('CotWT');
          requiredPacks.add('CotWI');
          requiredPacks.add('CotWM');
        } else {
          requiredPacks.add(s);
        }
      }
    }

    this.packs = [...requiredPacks].sort(invariantCollator.compare);

    if (iniData.has('defaultlanguage')) {
      this.defaultLanguage = iniData.get('defaultlanguage')!;
      this.localizationDict!.defaultLanguage = this.defaultLanguage;
    }

    if (iniData.has('defaultmusicon')) {
      this.defaultMusicOn = boolTryParse(iniData.get('defaultmusicon')).value;
    } else {
      this.defaultMusicOn = true;
    }

    if (iniData.has('hidden')) {
      this.hidden = boolTryParse(iniData.get('hidden')).value;
    }

    if (iniData.has('minhero')) {
      this.minHero = intTryParse(iniData.get('minhero')).value;
    }
    if (this.minHero < 1) this.minHero = 1;

    this.maxHero = this.context!.defaultHeroes;
    if (iniData.has('maxhero')) {
      this.maxHero = intTryParse(iniData.get('maxhero')).value;
    }
    if (this.maxHero > this.context!.maxHeroes) {
      this.maxHero = this.context!.maxHeroes;
    }

    if (iniData.has('difficulty')) {
      // float.TryParse(string) uses the current culture (invariant in Valkyrie) and also allows thousands separators
      this.difficulty = floatTryParse(iniData.get('difficulty'), true).value;
    }

    if (iniData.has('lengthmin')) {
      this.lengthMin = intTryParse(iniData.get('lengthmin')).value;
    }
    if (iniData.has('lengthmax')) {
      this.lengthMax = intTryParse(iniData.get('lengthmax')).value;
    }

    if (iniData.has('image')) {
      const value = iniData.get('image');
      this.image = value !== undefined && value !== null ? value.replace(/\\/g, '/') : (value as unknown as string);
    }

    // parse data for scenario explorer
    this.version = '';
    if (iniData.has('version')) {
      this.version = iniData.get('version')!;
    }

    this.languages_name = new Map();
    if (iniData.has('name.' + this.defaultLanguage)) {
      for (const [key, value] of iniData) {
        if (key.includes('name.')) {
          dictAdd(this.languages_name, key.substring(5), value);
        }
      }
    }

    this.languages_synopsys = new Map();
    if (iniData.has('synopsys.' + this.defaultLanguage)) {
      for (const [key, value] of iniData) {
        if (key.includes('synopsys.')) {
          dictAdd(this.languages_synopsys, key.substring(9), value);
        }
      }
    }

    this.languages_authors_short = new Map();
    if (iniData.has('authors_short.' + this.defaultLanguage)) {
      for (const [key, value] of iniData) {
        if (key.includes('authors_short.')) {
          dictAdd(this.languages_authors_short, key.substring(14), value);
        }
      }
    }

    this.package_url = '';
    if (iniData.has('url')) {
      this.package_url = iniData.get('url')!;
    }

    this.latest_update = DATETIME_MIN;
    if (iniData.has('latest_update')) {
      const parsed = Date.parse(iniData.get('latest_update')!);
      this.latest_update = Number.isNaN(parsed) ? DATETIME_MIN : new Date(parsed);
    }

    return true;
  }

  // Save to string (editor)
  // Valkyrie: QuestData.cs Quest.ToString
  toString(): string {
    const nl = NewLine;
    let r = '[Quest]' + nl;
    r += 'format=' + QuestData_Quest.currentFormat + nl;
    r += 'hidden=' + boolToString(this.hidden) + nl;
    // This is mostly editor side, so Game.Get() is fine, or we use context if available
    const typeName = this.context !== null ? this.context.gameType : Game.get().gameType.typeName();
    r += 'type=' + typeName + nl;
    r += 'defaultlanguage=' + this.defaultLanguage + nl;
    r += 'defaultmusicon=' + boolToString(this.defaultMusicOn) + nl;
    if (this.packs.length > 0) {
      r += 'packs=' + this.packs.join(' ') + nl;
    }

    if (this.minHero !== 2) {
      r += 'minhero=' + this.minHero + nl;
    }
    const defaultHeroes = this.context !== null ? this.context.defaultHeroes : Game.get().gameType.defaultHeroes();
    if (this.maxHero !== defaultHeroes) {
      r += 'maxhero=' + this.maxHero + nl;
    }

    if (this.difficulty !== 0) {
      r += 'difficulty=' + floatToString(this.difficulty) + nl;
    }

    if (this.lengthMin !== 0) {
      r += 'lengthmin=' + this.lengthMin + nl;
    }
    if (this.lengthMax !== 0) {
      r += 'lengthmax=' + this.lengthMax + nl;
    }
    if (this.image.length > 0) {
      r += 'image=' + this.image + nl;
    }

    if (this.version !== '') {
      r += 'version=' + this.version + nl;
    }

    if (this.package_url !== '') {
      r += 'url=' + this.package_url + nl;
    }

    for (const [key, value] of this.languages_name!) {
      r += 'name.' + key + '=' + value + nl;
    }

    for (const [key, value] of this.languages_synopsys!) {
      r += 'synopsys.' + key + '=' + value + nl;
    }

    for (const [key, value] of this.languages_authors_short!) {
      r += 'authors_short.' + key + '=' + value + nl;
    }

    return r;
  }

  // Valkyrie: QuestData.cs Quest.GetMissingPacks
  getMissingPacks(selected: readonly string[]): string[] {
    const r: string[] = [];
    for (const s of this.packs) {
      if (!selected.includes(s)) {
        r.push(s);
      }
    }
    return r;
  }

  // Valkyrie: QuestData.cs Quest.GetShortAuthor
  getShortAuthor(): string {
    let authors_short_translation = '';

    const qlm = this.context !== null ? this.context.questListMode : Game.get().questsList.quest_list_mode;
    const clang = this.context !== null ? this.context.currentLang : Game.get().currentLang;

    // if languages_authors_short is available, we are online in scenarios explorer and don't have access to .txt files yet
    if (qlm === QuestListMode.ONLINE) {
      if (this.languages_authors_short!.size !== 0) {
        // Try to get current language
        const current = this.languages_authors_short!.get(clang);
        if (current !== undefined) {
          authors_short_translation = current;
        } else {
          // Try to get default language
          const fallback = this.languages_authors_short!.get(this.defaultLanguage);
          // if not translated, returns unknown
          authors_short_translation = fallback ?? new StringKey('val', 'AUTHORS_UNKNOWN').translate();
        }
      }
    } else {
      authors_short_translation = this.authors_short.translate(true);
    }

    if (authors_short_translation === '') {
      authors_short_translation = new StringKey('val', 'AUTHORS_UNKNOWN').translate();
    }

    if (authors_short_translation.length > 80) authors_short_translation = authors_short_translation.substring(0, 75) + '(...)';

    return authors_short_translation;
  }
}

// Class to manage all static data for the current quest
// Valkyrie: QuestData.cs QuestData
export class QuestData {
  static readonly QuestComponent = QuestComponent;
  static readonly Event = Event;
  static readonly Tile = Tile;
  static readonly Door = Door;
  static readonly Token = Token;
  static readonly UI = UI;
  static readonly Spawn = Spawn;
  static readonly MPlace = MPlace;
  static readonly Puzzle = Puzzle;
  static readonly CustomMonster = CustomMonster;
  static readonly Activation = Activation;
  static readonly QItem = QItem;
  static readonly QuestLoaderContext = QuestLoaderContext;
  static readonly Quest = QuestData_Quest;

  // All components in the quest
  components = new Map<string, QuestComponent>();

  // Custom activations
  questActivations = new Map<string, ActivationData>();

  // List of ini files containing quest data
  private iniFiles: string[] = [];
  // List of localization files containing quest texts
  private localizationFiles: string[] = [];

  // Location of the quest.ini file
  questPath = '';

  // Dictionary of items to rename on reading
  rename = new Map<string, string>();

  // Data from 'Quest' section
  quest: QuestData_Quest = null as unknown as QuestData_Quest;

  private game: Game = null as unknown as Game;

  /** QuestData(QuestData.Quest q) loads from a quest loader entry; QuestData(string path) from a quest.ini path. */
  // Valkyrie: QuestData.cs QuestData.QuestData
  constructor(source: QuestData_Quest | string) {
    if (typeof source === 'string') {
      this.questPath = source;
    } else {
      this.questPath = source.path + Path.DirectorySeparatorChar + 'quest.ini';
    }
    this.loadQuestData();
  }

  // Populate data
  // Valkyrie: QuestData.cs QuestData.LoadQuestData
  loadQuestData(): void {
    ValkyrieDebug.log('Loading quest from: "' + this.questPath + '"' + NewLine);
    this.game = Game.get();

    this.components = new Map();
    this.questActivations = new Map();

    // Read the main quest file
    let questIniData: IniData | null = IniRead.readFromIni(this.questPath);
    // Failure to read quest is fatal
    if (questIniData === null) {
      ValkyrieDebug.log('Failed to load quest from: "' + this.questPath + '"');
      Application.quit('quest-unreadable', this.questPath, 'Failed to load quest from: "' + this.questPath + '"');
    }

    // List of data files
    this.iniFiles = [];
    this.localizationFiles = [];
    // The main data file is included
    this.iniFiles.push('quest.ini');

    // Quest is a special component, must be in quest.ini
    if (questIniData!.get('Quest') === null) {
      ValkyrieDebug.log('Error: Quest section missing from quest.ini');
      return;
    }
    this.quest = new QuestData_Quest('', questIniData!.get('Quest')!);

    // Find others (no addition files is not fatal)
    const questData = questIniData!.get('QuestData');
    if (questData !== null) {
      for (const file of questData.keys()) {
        if (file !== null && file.length > 0) {
          // path is relative to the main file (absolute not supported)
          this.iniFiles.push(file);
        }
      }
    } else {
      ValkyrieDebug.log('No QuestData extra files');
    }

    // Find Localization texts
    const questText = questIniData!.get('QuestText');
    if (questText !== null) {
      for (const file of questText.keys()) {
        if (file !== null && file.length > 0) {
          // path is relative to the main file (absolute not supported)
          this.localizationFiles.push(Path.getDirectoryName(this.questPath) + Path.DirectorySeparatorChar + file);
        }
      }
    } else {
      ValkyrieDebug.log('No QuestText extra files');
    }

    // Reset scenario dict
    const qstDict = new DictionaryI18n(this.game.currentLang);
    if (!isNullOrEmpty(this.game.fallbackLang)) {
      qstDict.addRequiredLanguage(this.game.fallbackLang);
    }
    for (const file of this.localizationFiles) {
      qstDict.addDataFromFile(file);
    }
    LocalizationRead.removeDictionary('qst');
    LocalizationRead.addDictionary('qst', qstDict);

    for (const f of this.iniFiles) {
      const fullPath = Path.combine(Path.getDirectoryName(this.questPath) as string, f);
      // Read each file
      questIniData = IniRead.readFromIni(fullPath);
      // Failure to read a file is fatal
      if (questIniData === null) {
        ValkyrieDebug.log('Unable to read quest file: "' + fullPath + '"');
        Application.quit('quest-file-unreadable', fullPath, 'Unable to read quest file: "' + fullPath + '"');
      }

      this.rename = new Map();
      // Loop through all ini sections
      for (const [sectionName, section] of questIniData!.data) {
        // Add the section to our quest data
        this.addData(sectionName, section, f);
      }

      // Update all references to this component
      for (const qc of this.components.values()) {
        for (const [oldName, newName] of this.rename) {
          qc.changeReference(oldName, newName);
          LocalizationRead.dicts.get('qst')!.renamePrefix(oldName + '.', newName + '.');
        }
      }
    }
  }

  // Add a section from an ini file to the quest data.  Duplicates are not allowed
  // Valkyrie: QuestData.cs QuestData.AddData
  private addData(name: string, content: Map<string, string>, source: string): void {
    // Fatal error on duplicates
    if (this.components.has(name)) {
      ValkyrieDebug.log('Duplicate component in quest: ' + name);
      Application.quit('duplicate-component', name, 'Duplicate component in quest: ' + name);
    }

    // Check for known types and create
    if (name.indexOf(Tile.type) === 0) {
      dictAdd(this.components, name, new Tile(name, content, source));
    }
    if (name.indexOf(Door.type) === 0) {
      dictAdd(this.components, name, new Door(name, content, this.game, source));
    }
    if (name.indexOf(Token.type) === 0) {
      dictAdd(this.components, name, new Token(name, content, this.game, source));
    }
    if (name.indexOf(UI.type) === 0) {
      dictAdd(this.components, name, new UI(name, content, this.game, source));
    }
    if (name.indexOf(Event.type) === 0) {
      dictAdd(this.components, name, new Event(name, content, source, this.quest.format));
    }
    if (name.indexOf(Spawn.type) === 0) {
      dictAdd(this.components, name, new Spawn(name, content, this.game, source));
    }
    if (name.indexOf(MPlace.type) === 0) {
      dictAdd(this.components, name, new MPlace(name, content, source));
    }
    if (name.indexOf(QItem.type) === 0) {
      dictAdd(this.components, name, new QItem(name, content, source));
    }
    // Depreciated (format 3)
    if (name.indexOf('StartingItem') === 0) {
      const fixedName = 'QItem' + name.substring('StartingItem'.length);
      dictAdd(this.components, fixedName, new QItem(fixedName, content, source));
    }
    if (name.indexOf(Puzzle.type) === 0) {
      dictAdd(this.components, name, new Puzzle(name, content, source));
    }
    if (name.indexOf(CustomMonster.type) === 0) {
      dictAdd(this.components, name, new CustomMonster(name, content, source));
    }
    if (name.indexOf(Activation.type) === 0) {
      dictAdd(this.components, name, new Activation(name, content, source));
    }
    // If not known ignore
  }
}

type _QuestComponent = QuestComponent;
type _Event = Event;
type _Tile = Tile;
type _Door = Door;
type _Token = Token;
type _UI = UI;
type _Spawn = Spawn;
type _MPlace = MPlace;
type _Puzzle = Puzzle;
type _CustomMonster = CustomMonster;
type _Activation = Activation;
type _QItem = QItem;
type _QuestLoaderContext = QuestLoaderContext;
type _Quest = QuestData_Quest;

export declare namespace QuestData {
  type QuestComponent = _QuestComponent;
  type Event = _Event;
  type Tile = _Tile;
  type Door = _Door;
  type Token = _Token;
  type UI = _UI;
  type Spawn = _Spawn;
  type MPlace = _MPlace;
  type Puzzle = _Puzzle;
  type CustomMonster = _CustomMonster;
  type Activation = _Activation;
  type QItem = _QItem;
  type QuestLoaderContext = _QuestLoaderContext;
  type Quest = _Quest;
}
