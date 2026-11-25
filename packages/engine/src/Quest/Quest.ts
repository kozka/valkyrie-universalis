// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/Quest.cs
// Board components keep the state Unity's objects would hold (platform/GameObject.ts) and hand them to the app through
// game.ui; the quest UI elements are laid out by the app from their QuestData.UI. Nested C# classes are module classes
// exposed as static members, as in QuestData.ts; BoardComponent and LogEntry have their own modules (porting rules).
import { ContentData } from '../Content/ContentData.ts';
import {
  ActivationData,
  AudioData,
  HeroData,
  ImageData,
  ItemData,
  MonsterData,
  SkillData,
  TileSideData,
  TokenData,
} from '../Content/ContentTypes.ts';
import { QuestData } from '../Content/QuestData.ts';
import { StringKey } from '../Content/StringKey.ts';
import { Game } from '../Game.ts';
import { Application } from '../platform/Application.ts';
import { Color } from '../platform/Color.ts';
import {
  NewLine,
  boolToString,
  boolTryParse,
  dateTimeToString,
  dictAdd,
  dictGet,
  floatToString,
  floatTryParse,
  intTryParse,
  isNullOrEmpty,
  listGet,
  replace,
  split,
  substring,
} from '../platform/CSharp.ts';
import { GameObject } from '../platform/GameObject.ts';
import { Mathf } from '../platform/Mathf.ts';
import { Random } from '../platform/Random.ts';
import { Stack } from '../platform/Stack.ts';
import { File, Path } from '../platform/SystemIO.ts';
import type { Texture2D } from '../platform/Texture2D.ts';
import { Vector2 } from '../platform/Vector2.ts';
import { Vector3 } from '../platform/Vector3.ts';
import { SaveManager } from '../SaveManager.ts';
import { ColorUtil } from '../UI/ColorUtil.ts';
import { ValkyrieConstants } from '../ValkyrieConstants.ts';
import { IniData, IniRead } from '../ValkyrieTools/IniRead.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { BoardComponent } from './BoardComponent.ts';
import { EventManager } from './EventManager.ts';
import { LogEntry } from './LogEntry.ts';
import { NextStageButton } from './NextStageButton.ts';
import type { Puzzle } from './Puzzle.ts';
import { PuzzleCode } from './PuzzleCode.ts';
import { PuzzleImage } from './PuzzleImage.ts';
import { PuzzleSlide } from './PuzzleSlide.ts';
import { PuzzleTower } from './PuzzleTower.ts';
import { QuestActivation, QuestMonster } from './QuestMonster.ts';
import { QuestLog } from './QuestLog.ts';
import { ShopInterface } from './ShopInterface.ts';
import { VarManager } from './VarManager.ts';

// Valkyrie: Quest.cs Quest.MoMPhase
const MoMPhase = {
  investigator: 0,
  mythos: 1,
  monsters: 2,
  horror: 3,
} as const;
type MoMPhase = number;

const MAX_PARTS = Number.MAX_SAFE_INTEGER;

// Class for Tile components (use TileSide content data)
// Valkyrie: Quest.cs Quest.Tile
class Tile extends BoardComponent {
  // This is the quest information
  qTile: QuestData.Tile;

  // This is the component information
  cTile: TileSideData = null as unknown as TileSideData;

  // Construct with data from the quest, pass Game for speed
  constructor(questTile: QuestData.Tile, gameObject: Game) {
    super(gameObject);
    this.qTile = questTile;
    const game = this.game;

    let newTex: Texture2D | null;
    if (this.qTile.customImage.length > 0) {
      const imageData = game.cd.tryGet(ImageData, this.qTile.customImage);
      if (imageData !== undefined) {
        const texPos = new Vector2(imageData.x, imageData.y);
        const texSize = new Vector2(imageData.width, imageData.height);
        newTex = ContentData.fileToTexture(imageData.image, texPos, texSize);
      } else {
        const questDir = Path.getDirectoryName(game.currentQuest!.qd.questPath)!;
        const path = Quest.findLocalisedMultimediaFile(this.qTile.customImage, questDir);
        newTex = ContentData.fileToTexture(path);
      }

      // If we have a custom image, we create a dummy TileSideData to steer rendering
      const dict = new Map<string, string>();
      if (this.qTile.top === 0 && this.qTile.left === 0) {
        // Default to center if not set
        dict.set('top', floatToString(Math.fround(newTex!.height / 2)));
        dict.set('left', floatToString(Math.fround(newTex!.width / 2)));
      } else {
        // Use values from editor
        dict.set('top', floatToString(this.qTile.top));
        dict.set('left', floatToString(this.qTile.left));
      }
      this.cTile = new TileSideData(this.qTile.customImage, dict, '');
    } else {
      // Search for tile in content
      let cTile = game.cd.tryGet(TileSideData, this.qTile.tileSideName);
      if (cTile === undefined) {
        cTile = game.cd.tryGet(TileSideData, 'TileSide' + this.qTile.tileSideName);
      }

      if (cTile === undefined && Tile.blankMissingTiles) {
        this.placeBlank();
        return;
      }

      if (cTile === undefined) {
        // Fatal if not found
        const message = "Error: Failed to locate TileSide: '" + this.qTile.tileSideName + "' in quest component: '" + this.qTile.sectionName + "'";
        ValkyrieDebug.log(message);
        Application.quit('tileside-missing', this.qTile.sectionName, message);
        return;
      }
      this.cTile = cTile;

      // Attempt to load image
      newTex = ContentData.fileToTexture(this.cTile.image);
    }

    if (newTex === null && Tile.blankMissingTiles) {
      this.placeBlank();
      return;
    }

    if (newTex === null) {
      // Fatal if missing
      const message = "Error: cannot open image file for TileSide: '" + this.cTile.image + "' named: '" + this.qTile.tileSideName + "'";
      ValkyrieDebug.log(message);
      Application.quit('tile-image-unreadable', this.qTile.sectionName, message);
      return;
    }

    // Create a unity object for the tile
    this.unityObject = new GameObject('Object' + this.qTile.sectionName);
    this.unityObject.tag = Game.BOARD;

    // Add image to object
    this.image = this.unityObject.addImage();
    // Set image sprite
    this.image.sprite = newTex;
    // Move to get the top left square corner at 0,0
    const vPPS = this.cTile.pxPerSquare;
    let hPPS = vPPS;
    // manual aspect control
    // We need this for the 3x2 MoM tiles because they don't have square pixels!!
    if (this.cTile.aspect !== 0) {
      hPPS = Math.fround(Math.fround(Math.fround(vPPS * newTex.width) / newTex.height) / this.cTile.aspect);
    }

    // Perform alignment move (newTex.width / 2 is an integer division in C#)
    this.unityObject.transform.translate(Math.fround(Math.fround(Math.trunc(newTex.width / 2) - this.cTile.left) / hPPS), 0);
    this.unityObject.transform.translate(0, -Math.fround(Math.fround(Math.trunc(newTex.height / 2) - this.cTile.top) / vPPS));
    // Move to get the middle of the top left square at 0,0
    // We don't do this for MoM because it spaces differently
    if (game.gameType.tileOnGrid()) {
      this.unityObject.transform.translate(-0.5, 0.5);
    }

    // Set the size to the image size
    this.image.sizeDelta = new Vector2(newTex.width / hPPS, newTex.height / vPPS);

    // Rotate around 0,0 rotation amount
    this.unityObject.transform.rotateAround(new Vector3(), this.qTile.rotation);
    // Move tile into target location (Space.World is needed because tile has been rotated)
    this.unityObject.transform.translate(this.qTile.location.x, this.qTile.location.y);
    this.image.color = new Color(1, 1, 1, 0);
    game.ui.boardCanvasAdd(this.unityObject);

    if (!Game.get().currentQuest!.firstTileDisplayed) {
      Game.get().currentQuest!.firstTileDisplayed = true;

      // We wait for the first tile displayed on MoM to display the 'NextStage' button bar
      // Don't do anything if quest is being loaded and stageUI does not exist yet
      if (game.gameType.typeName() === 'MoM' && game.stageUI !== null) {
        game.stageUI.update();
      }
    }
  }

  /**
   * Not in Valkyrie, which closes: when the player asks for it (Options, advanced; Valkyrie issue 1513), a tile whose
   * TileSide or picture is missing is a blank square of three by three, at the tile's place, and the game goes on.
   */
  static blankMissingTiles = false;

  private placeBlank(): void {
    const game = this.game;
    ValkyrieDebug.log("Warning: drawing a blank tile for missing TileSide: '" + this.qTile.tileSideName + "' in quest component: '" + this.qTile.sectionName + "'");
    this.cTile ??= new TileSideData(this.qTile.tileSideName, new Map(), '');
    this.unityObject = new GameObject('Object' + this.qTile.sectionName);
    this.unityObject.tag = Game.BOARD;
    this.image = this.unityObject.addImage();
    this.image.sizeDelta = new Vector2(3, 3);
    this.unityObject.transform.translate(1, -1);
    this.unityObject.transform.rotateAround(new Vector3(), this.qTile.rotation);
    this.unityObject.transform.translate(this.qTile.location.x, this.qTile.location.y);
    this.image.color = new Color(1, 1, 1, 0);
    game.ui.boardCanvasAdd(this.unityObject);
  }

  // Remove this tile
  // Valkyrie: Quest.cs Tile.Remove
  override remove(): void {
    destroy(this);
  }

  // Tiles are not interactive, no event
  // Valkyrie: Quest.cs Tile.GetEvent
  override getEvent(): QuestData.Event | null {
    return null;
  }
}

// Tokens are events that are tied to a token placed on the board
// Valkyrie: Quest.cs Quest.Token
class Token extends BoardComponent {
  // Quest info on the token
  qToken: QuestData.Token;

  // Construct with quest info and reference to Game
  constructor(questToken: QuestData.Token, gameObject: Game) {
    super(gameObject);
    this.qToken = questToken;
    const game = this.game;

    let tokenName = this.qToken.tokenName;
    let newTex: Texture2D | null = null;
    let PPS = 0;

    // Check that token exists
    if (this.qToken.customImage.length > 0) {
      const imageData = game.cd.tryGet(ImageData, this.qToken.customImage);
      if (imageData !== undefined) {
        const texPos = new Vector2(imageData.x, imageData.y);
        const texSize = new Vector2(imageData.width, imageData.height);
        newTex = ContentData.fileToTexture(imageData.image, texPos, texSize);
      } else {
        const questDir = Path.getDirectoryName(game.currentQuest!.qd.questPath)!;
        const path = Quest.findLocalisedMultimediaFile(this.qToken.customImage, questDir);
        newTex = ContentData.fileToTexture(path);
      }
    } else if (game.cd.containsKey(TokenData, tokenName)) {
      // Get texture for token
      const tokenData = game.cd.get(TokenData, tokenName);
      const texPos = new Vector2(tokenData.x, tokenData.y);
      const texSize = new Vector2(tokenData.width, tokenData.height);
      newTex = ContentData.fileToTexture(tokenData.image, texPos, texSize);
      PPS = tokenData.pxPerSquare;
    } else if (game.cd.containsKey(MonsterData, tokenName)) {
      const monsterData = game.cd.get(MonsterData, tokenName);
      newTex = ContentData.fileToTexture(monsterData.image);
    }

    if (newTex === null) {
      game.currentQuest!.log.add(new LogEntry('Warning: Quest component ' + this.qToken.sectionName + ' is using missing token type: ' + tokenName, true));
      // Catch for older quests with different types (0.4.0 or older)
      if (game.cd.containsKey(TokenData, 'TokenSearch')) {
        tokenName = 'TokenSearch';
        const tokenData = game.cd.get(TokenData, tokenName);
        const texPos = new Vector2(tokenData.x, tokenData.y);
        const texSize = new Vector2(tokenData.width, tokenData.height);
        newTex = ContentData.fileToTexture(tokenData.image, texPos, texSize);
        PPS = tokenData.pxPerSquare;
      }
    }

    if (newTex === null) {
      ValkyrieDebug.log('Error: Token ' + tokenName + ' does not have a valid picture');
      return;
    }

    // Create object
    this.unityObject = new GameObject('Object' + this.qToken.sectionName);
    this.unityObject.tag = Game.BOARD;

    // Create the image
    this.image = this.unityObject.addImage();
    this.image.color = new Color(1, 1, 1, 0);
    this.image.sprite = newTex;

    const tokenSize = this.qToken.tokenSize;
    if (PPS === 0) {
      if (this.qToken.customImage.length > 0 && (tokenSize === 'Original' || tokenSize.length === 0)) {
        PPS = game.gameType.tilePixelPerSquare();
      }

      if (PPS === 0) {
        PPS = newTex.width;
      }
    }

    // Set the size to the image size
    if (tokenSize === 'small') {
      this.image.sizeDelta = new Vector2(0.95, 0.95);
    } else if (tokenSize === 'medium') {
      this.image.sizeDelta = new Vector2(1.95, 0.95);
    } else if (tokenSize === 'huge') {
      this.image.sizeDelta = new Vector2(1.95, 1.95);
    } else if (tokenSize === 'massive') {
      this.image.sizeDelta = new Vector2(2.95, 1.95);
    } else {
      const size = floatTryParse(tokenSize);
      if (tokenSize === 'Original' || tokenSize.length === 0) {
        // Use native token PPS or image width if token doesn't specify PPS
        if (PPS > 0) {
          this.image.sizeDelta = new Vector2(newTex.width / PPS, newTex.height / PPS);
        }
      } else if (size.ok) {
        this.image.sizeDelta = new Vector2(size.value * 0.95, size.value * 0.95);
      } else {
        // Fallback for valid tokenSize string that failed to parse (should not happen)
        this.image.sizeDelta = new Vector2(0.95, 0.95);
      }
    }
    // Rotate around 0,0 rotation amount
    this.unityObject.transform.rotateAround(new Vector3(), this.qToken.rotation);

    // Move to square
    // Align top left for larger predefined and numeric sizes
    if (tokenSize.length > 0 && tokenSize !== 'Original' && tokenSize !== 'small') {
      let width = 1;
      let height = 1;

      const size = floatTryParse(tokenSize);
      if (tokenSize === 'medium') width = 2;
      else if (tokenSize === 'huge') {
        width = 2;
        height = 2;
      } else if (tokenSize === 'massive') {
        width = 3;
        height = 2;
      } else if (size.ok) {
        width = size.value;
        height = size.value;
      }

      if (width !== 1 || height !== 1) {
        this.unityObject.transform.translate(Math.fround((width - 1) / 2), 0);
        this.unityObject.transform.translate(0, -Math.fround((height - 1) / 2));
      }
    } else if (this.qToken.customImage.length > 0 && (tokenSize.length === 0 || tokenSize === 'Original')) {
      let width = 1;
      let height = 1;
      if (PPS === 0) PPS = game.gameType.tilePixelPerSquare();
      if (PPS > 0) {
        width = Math.fround(newTex.width / PPS);
        height = Math.fround(newTex.height / PPS);
      }

      if (width !== 1 || height !== 1) {
        this.unityObject.transform.translate(Math.fround((width - 1) / 2), 0);
        this.unityObject.transform.translate(0, -Math.fround((height - 1) / 2));
      }
    }

    // Move to target location
    this.unityObject.transform.translate(this.qToken.location.x, this.qToken.location.y);
    game.ui.tokenCanvasAdd(this.unityObject);

    game.tokenBoard.add(this);
  }

  // Tokens have an associated event to start on press
  // Valkyrie: Quest.cs Token.GetEvent
  override getEvent(): QuestData.Event | null {
    return this.qToken;
  }

  // Clean up
  // Valkyrie: Quest.cs Token.Remove
  override remove(): void {
    destroy(this);
  }
}

// Tokens are events that are tied to a token placed on the board
// Valkyrie: Quest.cs Quest.UI
class UI extends BoardComponent {
  // Quest info on the token
  qUI: QuestData.UI;

  /** The text the element shows when it has no image (its Text or TextMeshProUGUI), and its colour. */
  uiText: string | null = null;
  textColor: Color | null = null;
  /** The background colour of the text (uiTextBG); only its alpha follows the fading. */
  textBackground: Color | null = null;
  /** Width over height, for the layout the app works out from qUI. */
  aspect = 1;

  // Construct with quest info and reference to Game
  constructor(questUI: QuestData.UI, gameObject: Game) {
    super(gameObject);
    this.qUI = questUI;
    const game = this.game;
    if (this.qUI.fadeSpeed === 'instant') this.fadeSpeed = 100;
    else if (this.qUI.fadeSpeed === 'slow') this.fadeSpeed = 0.5;
    else this.fadeSpeed = 1;

    let newTex: Texture2D | null = null;
    if (this.qUI.imageName.length > 0) {
      const imageData = game.cd.tryGet(ImageData, this.qUI.imageName);
      if (imageData !== undefined) {
        const texPos = new Vector2(imageData.x, imageData.y);
        const texSize = new Vector2(imageData.width, imageData.height);
        newTex = ContentData.fileToTexture(imageData.image, texPos, texSize);
      } else {
        newTex = ContentData.fileToTexture(
          Quest.findLocalisedMultimediaFile(this.qUI.imageName, Path.getDirectoryName(game.currentQuest!.qd.questPath)!),
        );
      }
    }

    // Create object
    this.unityObject = new GameObject('Object' + this.qUI.sectionName);
    this.unityObject.tag = Game.BOARD;

    let aspect = 1;

    if (this.qUI.imageName.length === 0) {
      this.textBackground = ColorUtil.colorFromName(this.qUI.textBackgroundColor);
      this.uiText = this.getText();
      this.setColorName(this.qUI.textColor);
      aspect = this.qUI.aspect;
    } else {
      // Not in Valkyrie (16 October 2026): a missing picture threw on its size and stopped the rest of the add= list; the
      // element is kept but not drawn
      if (newTex === null) {
        ValkyrieDebug.log('Warning: Missing UI image, not drawn: ' + this.qUI.imageName + ' in ' + this.qUI.sectionName);
        return;
      }
      // Create the image
      this.image = this.unityObject.addImage();
      this.image.color = new Color(1, 1, 1, this.qUI.fadeSpeed === 'instant' ? 1 : 0);
      this.image.sprite = newTex!;
      aspect = Math.fround(newTex!.width / newTex!.height);
    }
    this.aspect = aspect;

    game.ui.questUICanvasAdd(this);

    game.tokenBoard.add(this);
  }

  // Tokens have an associated event to start on press
  // Valkyrie: Quest.cs UI.GetEvent
  override getEvent(): QuestData.Event | null {
    return this.qUI;
  }

  // Valkyrie: Quest.cs UI.SetColor
  override setColor(c: Color): void {
    if (this.image !== null) this.image.color = c;
    if (this.uiText !== null) {
      this.textColor = c;
    }

    // Text BG has its own color, only alpha is changing
    if (this.textBackground !== null && this.qUI.textBackgroundColor !== 'transparent') {
      this.textBackground = new Color(this.textBackground.r, this.textBackground.g, this.textBackground.b, c.a);
    }
  }

  // Valkyrie: Quest.cs UI.GetColor
  override getColor(): Color {
    if (this.image !== null) return this.image.color;
    if (this.textColor !== null) return this.textColor;
    return Color.clear;
  }

  // Set visible can control the transparency level of the component
  // Valkyrie: Quest.cs UI.SetVisible
  override setVisible(alpha: number): void {
    this.targetAlpha = alpha;
    // Hide in editor
    if (this.targetAlpha < 0.5) {
      this.targetAlpha = 0;
    }
  }

  // Get the text to display on the UI
  // Valkyrie: Quest.cs UI.GetText
  getText(): string {
    let text = this.qUI.uiText.translate(true);

    // Find and replace {q:element with the name of the
    // element
    text = EventManager.Event.replaceComponentText(text);

    // Fix new lines and replace symbol text with special characters
    return replace(EventManager.outputSymbolReplace(text), '\\n', '\n');
  }

  // Clean up
  // Valkyrie: Quest.cs UI.Remove
  override remove(): void {
    destroy(this);
  }
}

// Doors are like tokens but placed differently and have different defaults
// Note that MoM Explore tokens are tokens and do not use this
// Valkyrie: Quest.cs Quest.Door
class Door extends BoardComponent {
  qDoor: QuestData.Door;

  // Constuct with quest data and reference to Game
  constructor(questDoor: QuestData.Door, gameObject: Game) {
    super(gameObject);
    this.qDoor = questDoor;
    const game = this.game;

    // Create object
    this.unityObject = new GameObject('Object' + this.qDoor.sectionName);
    this.unityObject.tag = Game.BOARD;

    // Create the image: Valkyrie's own door picture (Resources.Load("sprites/door"))
    this.image = this.unityObject.addImage();
    this.image.resource = 'sprites/door';
    this.image.sizeDelta = new Vector2(0.4, 1.6);
    // Rotate as required
    this.unityObject.transform.rotateAround(new Vector3(), this.qDoor.rotation);
    // Move to square
    this.unityObject.transform.translate(-0.5, 0.5);
    this.unityObject.transform.translate(this.qDoor.location.x, this.qDoor.location.y);

    // Set the texture colour from quest data
    this.setColorName(this.qDoor.colourName);

    this.image.color = new Color(this.image.color.r, this.image.color.g, this.image.color.b, 0);
    game.ui.tokenCanvasAdd(this.unityObject);

    game.tokenBoard.add(this);
  }

  // Clean up
  // Valkyrie: Quest.cs Door.Remove
  override remove(): void {
    destroy(this);
  }

  // Doors have events that start when pressed
  // Valkyrie: Quest.cs Door.GetEvent
  override getEvent(): QuestData.Event | null {
    return this.qDoor;
  }
}

// Object.Destroy(unityObject)
function destroy(component: BoardComponent): void {
  if (component.unityObject !== null) component.game.ui.destroyObject(component.unityObject);
  component.unityObject = null;
}

// Class for holding current hero status
// Valkyrie: Quest.cs Quest.Hero
class Hero {
  // This can be null if not selected
  heroData: HeroData | null = null;
  activated = false;

  defeated = false;

  //  Heros are in a list so they need ID... maybe at some point this can move to an array
  id = 0;

  // Used for events that can select or highlight heros
  selected = false;
  className = '';
  hybridClass = '';
  skills: string[];
  xp = 0;

  /** Hero(HeroData h, int i) with content hero data and an index, or Hero(data) from a save. */
  constructor(h: HeroData | null | Map<string, string>, i = 0) {
    if (!(h instanceof Map)) {
      this.heroData = h;
      this.id = i;
      this.skills = [];
      return;
    }
    const data = h;
    this.activated = boolTryParse(dictGet(data, 'activated')).value;
    this.defeated = boolTryParse(dictGet(data, 'defeated')).value;
    this.id = intTryParse(dictGet(data, 'id')).value;
    if (data.has('class')) {
      const classes = split(data.get('class')!, [' '], MAX_PARTS, true);
      this.className = listGet(classes, 0);
      if (classes.length > 1) {
        this.hybridClass = classes[1]!;
      }
    }

    const game = Game.get();
    // Saved content reference, look it up
    if (data.has('type')) {
      for (const hd of game.cd.values(HeroData)) {
        if (hd.sectionName === data.get('type')) {
          this.heroData = hd;
        }
      }
    }

    this.skills = [];
    if (data.has('skills')) {
      this.skills.push(...split(data.get('skills')!, [' '], MAX_PARTS, true));
    }

    if (data.has('xp')) {
      this.xp = intTryParse(data.get('xp')).value;
    }
  }

  // Valkyrie: Quest.cs Hero.AvailableXP
  availableXP(): number {
    const game = Game.get();
    let aXP = this.xp + Mathf.roundToInt(game.currentQuest!.vars.getValue('$%xp'));
    for (const s of this.skills) {
      aXP -= game.cd.get(SkillData, s).xp;
    }

    return aXP;
  }

  // Save hero to string for saves/undo
  // Valkyrie: Quest.cs Hero.ToString
  toString(): string {
    const nl = NewLine;

    let r = '[Hero' + this.id + ']' + nl;
    r += 'id=' + this.id + nl;
    r += 'activated=' + boolToString(this.activated) + nl;
    r += 'defeated=' + boolToString(this.defeated) + nl;
    if (this.className.length > 0) {
      r += 'class=' + this.className + ' ' + this.hybridClass + nl;
    }

    if (this.heroData !== null) {
      r += 'type=' + this.heroData.sectionName + nl;
    }

    if (this.skills.length > 0) {
      r += 'skills=';
      for (const s of this.skills) {
        r += s + ' ';
      }

      r += nl;
    }

    if (this.xp !== 0) {
      r += 'xp=' + this.xp + nl;
    }

    return r + nl;
  }
}

// Activation instance is requresd to track variables in the activation
// Valkyrie: Quest.cs Quest.Monster.ActivationInstance
class ActivationInstance {
  ad: ActivationData;

  // String is populated on creation of the activation
  effect: string;
  move: string | null = null;
  minionActions: string;
  masterActions: string;

  // Construct activation
  constructor(contentActivation: ActivationData, monsterName: string) {
    this.ad = contentActivation;
    this.minionActions = EventManager.outputSymbolReplace(replace(this.ad.minionActions.translate(), '{0}', monsterName));
    this.masterActions = EventManager.outputSymbolReplace(replace(this.ad.masterActions.translate(), '{0}', monsterName));

    // Fill in hero, monster names
    // Note: Random hero selection is NOT kept on load/undo FIXME
    if (Game.get().gameType.typeName() === ValkyrieConstants.typeMom) {
      this.effect = replace(this.ad.ability.translate(), '{0}', monsterName);
      this.move = replace(this.ad.move.translate(), '{0}', monsterName);
      this.move = replace(EventManager.outputSymbolReplace(this.move), '\\n', '\n');
    } else {
      this.effect = replace(this.ad.ability.translate(), '{0}', Game.get().currentQuest!.getRandomHero().heroData!.name.translate());
      this.effect = replace(this.effect, '{1}', monsterName);
    }

    // Fix new lines
    this.effect = replace(EventManager.outputSymbolReplace(this.effect), '\\n', '\n');
  }
}

// Class for holding current monster status
// Valkyrie: Quest.cs Quest.Monster
class Monster {
  static readonly ActivationInstance = ActivationInstance;

  // Content Data
  monsterData: MonsterData = null as unknown as MonsterData;

  // Spawn event name used later for defeated triggers
  spawnEventName: string | null = null;

  // What dulpicate number is the monster?
  duplicate = 0;

  // State
  activated = false;
  minionStarted = false;

  masterStarted = false;

  // Accumulated damage
  damage = 0;

  // Quest specific info
  unique = false;
  uniqueText: StringKey = StringKey.NULL;
  uniqueTitle: StringKey = StringKey.NULL;

  healthMod = 0;

  // Activation is reset each round so that master/minion use the same data and forcing doesn't re roll
  // Note that in RtL forcing activation WILL reroll the selected activation
  currentActivation: ActivationInstance | null = null;

  /** Monster(monsterEvent) when an event adds a monster group, or Monster(data) from a save. */
  constructor(source: EventManager.MonsterEvent | Map<string, string>) {
    if (source instanceof Map) {
      this.load(source);
      return;
    }
    const monsterEvent = source;
    this.monsterData = monsterEvent.cMonster;
    this.spawnEventName = monsterEvent.qMonster.sectionName;
    this.activated = monsterEvent.qMonster.activated;
    this.unique = monsterEvent.qMonster.unique;
    this.uniqueTitle = monsterEvent.getUniqueTitle();
    this.uniqueText = monsterEvent.qMonster.uniqueText;
    this.healthMod = Mathf.roundToInt(
      Math.fround(monsterEvent.qMonster.uniqueHealthBase + Math.fround(Game.get().currentQuest!.getHeroCount() * monsterEvent.qMonster.uniqueHealthHero)),
    );

    const game = Game.get();
    const dupe = new Set<number>();
    for (const m of game.currentQuest!.monsters) {
      let active_monster = '';
      let new_monster = '';

      // also check for custom monster base type
      if (m.monsterData.sectionName.indexOf('CustomMonster') === 0) active_monster = (m.monsterData as QuestMonster).derivedType;
      else active_monster = m.monsterData.sectionName;

      if (this.monsterData.sectionName.indexOf('CustomMonster') === 0) new_monster = (this.monsterData as QuestMonster).derivedType;
      else new_monster = this.monsterData.sectionName;

      if (active_monster === new_monster || m.duplicate !== 0) {
        dupe.add(m.duplicate);
      }
    }

    while (dupe.has(this.duplicate)) {
      this.duplicate++;
    }
  }

  // Create new activation
  // Valkyrie: Quest.cs Monster.NewActivation
  newActivation(contentActivation: ActivationData): void {
    this.currentActivation = new ActivationInstance(contentActivation, this.monsterData.name.translate());
  }

  // Construct from save data
  // Valkyrie: Quest.cs Monster.Monster(Dictionary<string, string>)
  private load(data: Map<string, string>): void {
    this.activated = boolTryParse(dictGet(data, 'activated')).value;
    this.minionStarted = boolTryParse(dictGet(data, 'minionStarted')).value;
    this.masterStarted = boolTryParse(dictGet(data, 'masterStarted')).value;
    this.unique = boolTryParse(dictGet(data, 'unique')).value;
    this.damage = intTryParse(dictGet(data, 'damage')).value;
    this.duplicate = intTryParse(dictGet(data, 'duplicate')).value;

    if (data.has('healthmod')) {
      this.healthMod = intTryParse(data.get('healthmod')).value;
    }

    this.spawnEventName = data.get('spawnEventName') ?? null;

    this.uniqueText = new StringKey(dictGet(data, 'uniqueText'));
    this.uniqueTitle = new StringKey(dictGet(data, 'uniqueTitle'));

    // Support old saves (deprectiated)
    if (dictGet(data, 'type').indexOf('UniqueMonster') === 0) {
      data.set('type', 'CustomMonster' + data.get('type')!.substring('UniqueMonster'.length));
    }

    // Find base type
    const game = Game.get();
    const quest = game.currentQuest!;
    const type = dictGet(data, 'type');

    this.monsterData = (game.cd.tryGet(MonsterData, type) ?? null) as MonsterData;

    // Check if type is a special quest specific type
    const typeComponent = quest.qd.components.get(type);
    if (typeComponent instanceof QuestData.CustomMonster) {
      this.monsterData = new QuestMonster(typeComponent);
    }

    // If we have already selected an activation find it
    if (data.has('activation')) {
      const activation = data.get('activation')!;
      let saveActivation = (game.cd.tryGet(ActivationData, activation) ?? null) as ActivationData;
      // Activations can be specific to the quest
      if (quest.qd.components.has(activation)) {
        const component = quest.qd.components.get(activation);
        saveActivation = new QuestActivation((component instanceof QuestData.Activation ? component : null) as QuestData.Activation);
      }

      this.currentActivation = new ActivationInstance(saveActivation, this.monsterData.name.translate());
    }
  }

  // Valkyrie: Quest.cs Monster.GetIdentifier
  getIdentifier(): string {
    return this.monsterData.sectionName + ':' + this.duplicate;
  }

  // Valkyrie: Quest.cs Monster.GetMonster
  static getMonster(identifier: string): Monster | null {
    const game = Game.get();
    const parts = identifier.split(':');
    if (parts.length !== 2) return null;
    const d = intTryParse(parts[1]).value;
    for (const m of game.currentQuest!.monsters) {
      if (m.monsterData.sectionName === parts[0] && m.duplicate === d) {
        return m;
      }
    }

    return null;
  }

  // Valkyrie: Quest.cs Monster.GetHealth
  getHealth(): number {
    return (
      Mathf.roundToInt(Math.fround(this.monsterData.healthBase + Math.fround(Game.get().currentQuest!.getHeroCount() * this.monsterData.healthPerHero))) +
      this.healthMod
    );
  }

  // Save monster data to string
  // Valkyrie: Quest.cs Monster.ToString
  toString(): string {
    const nl = NewLine;

    // Section name must be unique
    let r = '[Monster' + this.monsterData.sectionName + this.duplicate + ']' + nl;
    r += 'activated=' + boolToString(this.activated) + nl;
    r += 'type=' + this.monsterData.sectionName + nl;
    r += 'minionStarted=' + boolToString(this.minionStarted) + nl;
    r += 'masterStarted=' + boolToString(this.masterStarted) + nl;
    r += 'unique=' + boolToString(this.unique) + nl;
    r += 'uniqueText=' + this.uniqueText.toString() + nl;
    r += 'uniqueTitle=' + this.uniqueTitle.toString() + nl;
    r += 'damage=' + this.damage + nl;
    r += 'duplicate=' + this.duplicate + nl;
    r += 'healthmod=' + this.healthMod + nl;
    r += 'spawnEventName=' + (this.spawnEventName ?? '') + nl;
    // Save the activation (currently doesn't save the effect string)
    if (this.currentActivation !== null) {
      r += 'activation=' + this.currentActivation.ad.sectionName + nl;
    }

    return r;
  }
}

type _Tile = Tile;
type _Token = Token;
type _UI = UI;
type _Door = Door;
type _BoardComponent = BoardComponent;
type _Hero = Hero;
type _Monster = Monster;
type _ActivationInstance = ActivationInstance;
type _LogEntry = LogEntry;

// Class to manage all data for the current quest
// Valkyrie: Quest.cs Quest
export class Quest {
  static readonly Tile = Tile;
  static readonly Token = Token;
  static readonly UI = UI;
  static readonly Door = Door;
  static readonly BoardComponent = BoardComponent;
  static readonly Hero = Hero;
  static readonly Monster = Monster;
  static readonly MoMPhase = MoMPhase;
  static readonly LogEntry = LogEntry;

  /** QuestData */
  qd: QuestData = null as unknown as QuestData;

  /** Current Quest Path */
  questPath = '';

  /** Original Quest Path (required for quest within a quest) */
  originalPath = '';

  /** components on the board (tiles, tokens, doors) */
  boardItems: Map<string, BoardComponent> = null as unknown as Map<string, BoardComponent>;

  /**
   * list of components on the board (tiles, tokens, doors) in the right order for savegames
   * we need to use an ordered list of board item, to preserve items stacking order, Dictionary do not preserve order
   */
  ordered_boardItems: string[] = null as unknown as string[];

  /** vars for the quest */
  vars: VarManager = null as unknown as VarManager;

  // A list of items that have been given to the investigators
  items: Set<string> = null as unknown as Set<string>;

  // Dictionary of shops and items
  shops: Map<string, string[]> = null as unknown as Map<string, string[]>;

  // The open shop
  activeShop = '';

  // Dictionary of picked items
  itemSelect: Map<string, string> = null as unknown as Map<string, string>;

  // Dictionary item inspect events
  itemInspect: Map<string, string> = null as unknown as Map<string, string>;

  // A dictionary of heros that have been selected in events
  heroSelection: Map<string, Hero[]> = null as unknown as Map<string, Hero[]>;

  // A dictionary of puzzle state
  puzzle: Map<string, Puzzle> = null as unknown as Map<string, Puzzle>;

  // A count of successes from events
  eventQuota: Map<string, number> = null as unknown as Map<string, number>;

  // Event manager handles the events
  eManager: EventManager = null as unknown as EventManager;

  /** List of heros and their status */
  heroes: Hero[] = null as unknown as Hero[];

  /** List of active monsters and their status */
  monsters: Monster[] = null as unknown as Monster[];

  // Stack of saved game state for undo (C#: undo, renamed because the Undo method becomes undo in camelCase)
  undoStack: Stack<string> = null as unknown as Stack<string>;

  // Event Log
  log: QuestLog = null as unknown as QuestLog;

  // Event list
  eventList: string[] = null as unknown as string[];

  // Dictionary of picked monster types
  monsterSelect: Map<string, string> = null as unknown as Map<string, string>;

  // game state variables
  phase: MoMPhase = MoMPhase.investigator;

  // This is true when the quest is finished
  questHasEnded = false;

  // This is true once heros are selected and the quest is started
  heroesSelected = false;

  // This is true once the first tile has been displayed
  firstTileDisplayed = false;

  // This is true once the first autoSave has been done
  firstAutoSaveDone = false;

  // This is true if the game is loaded from a savegame
  fromSavegame = false;

  // Quest start time (or load time)
  start_time: Date = new Date();

  // Quest gameplay duration
  duration = 0;

  // Default music will be played when you start the quest
  defaultMusicOn = false;

  // A list of music if custom music has been selected - used for save games
  music: string[] = [];

  // Reference back to the game object
  game: Game = null as unknown as Game;

  /**
   * Find and return audio or picture file for localization. Use only for scenarios.
   * name is the path from the scenario root folder to the file, as in the .ini; source is the scenario root folder.
   * Without currentLang, fallbackLang and editMode it reads them from the current Game, as the 2-argument C# overload does.
   */
  // Valkyrie: Quest.cs Quest.FindLocalisedMultimediaFile
  static findLocalisedMultimediaFile(
    name: string,
    source: string,
    currentLang?: string,
    fallbackLang?: string | null,
    editMode?: boolean,
  ): string {
    if (currentLang === undefined) {
      return Quest.findLocalisedMultimediaFile(name, source, Game.game!.currentLang, Game.game!.fallbackLang, Game.game!.editMode);
    }

    // First try language folder directly under the scenario root: source/<lang>/<path>
    const langPathRoot = Path.combine(Path.combine(source, currentLang), name);
    if (!editMode && File.exists(langPathRoot)) {
      return langPathRoot;
    }

    // If the file name contains subfolders (e.g. "image/map.png"), also support placing
    // the language folder inside that subfolder: source/<dir>/<lang>/<file>
    const dir = Path.getDirectoryName(name);
    const file = Path.getFileName(name);
    if (!editMode && !isNullOrEmpty(dir)) {
      const langPathInDir = Path.combine(source, dir!, currentLang, file);
      if (File.exists(langPathInDir)) return langPathInDir;
    }

    // Try fallback language using the same two patterns
    if (!editMode && !isNullOrEmpty(fallbackLang) && fallbackLang !== currentLang) {
      const fallbackPathRoot = Path.combine(Path.combine(source, fallbackLang!), name);
      if (File.exists(fallbackPathRoot)) {
        return fallbackPathRoot;
      }

      if (!isNullOrEmpty(dir)) {
        const fallbackPathInDir = Path.combine(source, dir!, fallbackLang!, file);
        if (File.exists(fallbackPathInDir)) return fallbackPathInDir;
      }
    }

    return Path.combine(source, name);
  }

  /**
   * Quest(q) starts a quest from quest data; Quest(save) and Quest(saveData) load one from save data, as undo does.
   */
  // Valkyrie: Quest.cs Quest.Quest
  constructor(source: QuestData.Quest | string | IniData) {
    if (typeof source === 'string') {
      this.loadQuest(IniRead.readFromString(source));
      return;
    }
    if (source instanceof IniData) {
      this.loadQuest(source);
      return;
    }
    const q = source;
    this.game = Game.get();

    // This happens anyway but we need it to be here before the following code is executed
    this.game.currentQuest = this;

    // Static data from the quest file
    this.qd = new QuestData(q);
    this.questPath = Path.getDirectoryName(this.qd.questPath)!;
    this.originalPath = Path.getDirectoryName(this.qd.questPath)!;

    // Initialise data
    this.boardItems = new Map();
    this.ordered_boardItems = [];
    this.vars = new VarManager();
    this.items = new Set();
    this.shops = new Map();
    this.itemSelect = new Map();
    this.itemInspect = new Map();
    this.monsters = [];
    this.heroSelection = new Map();
    this.puzzle = new Map();
    this.eventQuota = new Map();
    this.undoStack = new Stack();
    this.log = new QuestLog();
    this.eventList = [];
    this.monsterSelect = new Map();

    this.start_time = new Date();
    this.duration = 0;
    this.defaultMusicOn = q.defaultMusicOn;

    this.generateItemSelection();
    this.eManager = new EventManager();

    // Populate null hero list, these can then be selected as hero types
    this.heroes = [];
    for (let i = 1; i <= this.qd.quest.maxHero; i++) {
      this.heroes.push(new Hero(null, i));
    }

    // Set quest vars for selected expansions
    const packs = this.game.cd.getLoadedPackIDs();
    for (const s of packs) {
      if (s.length > 0) {
        this.vars.setValue('#' + s, 1);
      }
    }

    // Depreciated support for quest formats < 6
    if (packs.includes('MoM1ET') && packs.includes('MoM1EI') && packs.includes('MoM1EM')) {
      this.vars.setValue('#MoM1E', 1);
    }

    if (packs.includes('CotWT') && packs.includes('CotWI') && packs.includes('CotWM')) {
      this.vars.setValue('#CotW', 1);
    }

    if (packs.includes('FAT') && packs.includes('FAI') && packs.includes('FAM')) {
      this.vars.setValue('#FA', 1);
    }

    this.vars.setValue('#round', 1);
  }

  // Valkyrie: Quest.cs Quest.GenerateItemSelection
  generateItemSelection(): void {
    // Clear shops
    this.shops = new Map();

    // Clear item matches
    this.itemSelect = new Map();

    // Determine fame level
    let fame = 1;
    if (this.vars.getValue('$%fame') >= this.vars.getValue('$%famenoteworthy')) fame = 2;
    if (this.vars.getValue('$%fame') >= this.vars.getValue('$%fameimpressive')) fame = 3;
    if (this.vars.getValue('$%fame') >= this.vars.getValue('$%famecelebrated')) fame = 4;
    if (this.vars.getValue('$%fame') >= this.vars.getValue('$%fameheroic')) fame = 5;
    if (this.vars.getValue('$%fame') >= this.vars.getValue('$%famelegendary')) fame = 6;

    // Determine monster types
    let progress = false;
    let force = false;
    let done = false;
    while (!done) {
      progress = false;
      for (const [, value] of this.qd.components) {
        if (value instanceof QuestData.QItem) {
          progress = this.attemptItemMatch(value, fame, force) || progress;
          if (progress && force) force = false;
        }
      }

      if (!progress && !force) {
        force = true;
      } else if (!progress && force) {
        done = true;
      }
    }

    this.vars.setValue('$restock', 0);
  }

  // Valkyrie: Quest.cs Quest.AttemptItemMatch
  attemptItemMatch(qItem: QuestData.QItem, fame: number, force = true): boolean {
    if (this.itemSelect.has(qItem.sectionName)) {
      return false;
    }

    if (qItem.traitpool.length + qItem.traits.length === 0) {
      for (const t of qItem.itemName) {
        if (this.itemSelect.has(t)) {
          dictAdd(this.itemSelect, qItem.sectionName, this.itemSelect.get(t)!);
          return true;
        }

        if (t.indexOf('QItem') === 0) {
          return false;
        }
        // Item type might exist in content packs
        else if (this.game.cd.containsKey(ItemData, t)) {
          dictAdd(this.itemSelect, qItem.sectionName, t);
          return true;
        }
      }
    } else {
      // List of exclusions
      const exclude: string[] = [];
      for (const t of qItem.itemName) {
        if (this.itemSelect.has(t)) {
          exclude.push(this.itemSelect.get(t)!);
        } else if (t.indexOf('QItem') === 0 && !force) {
          return false;
        } else {
          exclude.push(t);
        }
      }

      // add user inventory in exclude list
      exclude.push(...this.items);

      // we don't want duplicate in the shop
      exclude.push(...this.itemSelect.values());

      // Start a list of matches
      const list: string[] = [];
      for (const [key, value] of this.game.cd.getAll(ItemData)) {
        let next = false;

        for (const t of qItem.traits) {
          // Does the item have this trait?
          if (!value.containsTrait(t)) {
            // Trait missing, exclude monster
            next = true;
          }
        }

        if (next) continue;

        for (const t of exclude) {
          if (t === key) next = true;
        }

        if (next) continue;

        if (value.minFame > 0) {
          if (value.minFame > fame) continue;
          if (value.maxFame < fame) continue;
        }

        // Must have one of these traits
        let oneFound = qItem.traitpool.length === 0;
        for (const t of qItem.traitpool) {
          // Does the item have this trait?
          if (value.containsTrait(t)) {
            oneFound = true;
          }
        }

        // item has all traits
        if (oneFound) {
          list.push(key);
        }
      }

      if (list.length === 0) {
        this.game.currentQuest!.log.add(new LogEntry('Warning: Unable to find an item for QItem: ' + qItem.sectionName, true));
        return false;
      }

      // Pick item at random from candidates
      dictAdd(this.itemSelect, qItem.sectionName, listGet(list, Random.range(0, list.length)));
      return true;
    }

    return false;
  }

  // Valkyrie: Quest.cs Quest.RuntimeMonsterSelection
  runtimeMonsterSelection(spawn_name: string): boolean {
    // Determine monster types
    if (this.qd.components.has(spawn_name)) {
      const component = this.qd.components.get(spawn_name);
      return this.attemptMonsterMatch((component instanceof QuestData.Spawn ? component : null) as QuestData.Spawn);
    } else {
      return false;
    }
  }

  // Valkyrie: Quest.cs Quest.AttemptMonsterMatch
  attemptMonsterMatch(spawn: QuestData.Spawn, force = true): boolean {
    const game = this.game;
    if (this.monsterSelect.has(spawn.sectionName)) {
      return true;
    }

    if (spawn.mTraitsPool.length + spawn.mTraitsRequired.length === 0) {
      for (const t of spawn.mTypes) {
        if (this.monsterSelect.has(t)) {
          dictAdd(this.monsterSelect, spawn.sectionName, this.monsterSelect.get(t)!);
          return true;
        }

        if (t.indexOf('Spawn') === 0) {
          return false;
        }

        let monster = t;
        if (monster.indexOf('Monster') !== 0 && monster.indexOf('CustomMonster') !== 0) {
          monster = 'Monster' + monster;
        }

        // Monster type might be a unique for this quest
        if (game.currentQuest!.qd.components.has(monster)) {
          dictAdd(this.monsterSelect, spawn.sectionName, monster);
          return true;
        }
        // Monster type might exist in content packs, 'Monster' is optional
        else if (game.cd.containsKey(MonsterData, monster)) {
          dictAdd(this.monsterSelect, spawn.sectionName, monster);
          return true;
        }
      }
    } else {
      // List of exclusions
      const exclude: string[] = [];
      for (const t of spawn.mTypes) {
        if (this.monsterSelect.has(t)) {
          exclude.push(this.monsterSelect.get(t)!);
        } else if (t.indexOf('Spawn') === 0 && !force) {
          return false;
        } else {
          exclude.push(t);
        }
      }

      if (game.gameType.typeName() === 'D2E') {
        // monster already selected
        for (const [, value] of this.monsterSelect) {
          if (!exclude.includes(value)) {
            exclude.push(value);
          }
        }

        // monster already present in the board
        for (const entry of this.monsters) {
          if (!exclude.includes(entry.monsterData.sectionName)) {
            exclude.push(entry.monsterData.sectionName);
          }
        }
      }

      // Start a list of matches
      const list: string[] = [];
      for (const [key, value] of game.cd.getAll(MonsterData)) {
        let allFound = true;
        for (const t of spawn.mTraitsRequired) {
          // Does the monster have this trait?
          if (!value.containsTrait(t)) {
            // Trait missing, exclude monster
            allFound = false;
          }
        }

        // Must have one of these traits
        let oneFound = spawn.mTraitsPool.length === 0;
        for (const t of spawn.mTraitsPool) {
          // Does the monster have this trait?
          if (value.containsTrait(t)) {
            oneFound = true;
          }
        }

        let excludeBool = false;
        for (const t of exclude) {
          if (t === key) excludeBool = true;
        }

        // Monster has all traits
        if (allFound && oneFound && !excludeBool) {
          list.push(key);
        }
      }

      for (const [key, value] of game.currentQuest!.qd.components) {
        if (!(value instanceof QuestData.CustomMonster)) continue;
        const cm = value;

        let traits = cm.traits;
        // Check for content data monster defined as base
        const baseMonster = game.cd.tryGet(MonsterData, cm.baseMonster);
        if (baseMonster !== undefined) {
          if (traits.length === 0) {
            traits = baseMonster.traits;
          }
        }

        let allFound = true;
        for (const t of spawn.mTraitsRequired) {
          // Does the monster have this trait?
          if (!Quest.inArray(traits, t)) {
            // Trait missing, exclude monster
            allFound = false;
          }
        }

        // Must have one of these traits
        let oneFound = spawn.mTraitsPool.length === 0;
        for (const t of spawn.mTraitsPool) {
          // Does the monster have this trait?
          if (Quest.inArray(traits, t)) {
            oneFound = true;
          }
        }

        let excludeBool = false;
        for (const t of exclude) {
          if (t === key) excludeBool = true;
        }

        // Monster has all traits
        if (allFound && oneFound && !excludeBool) {
          list.push(key);
        }
      }

      if (list.length === 0) {
        ValkyrieDebug.log('Error: Unable to find monster of traits specified in event: ' + spawn.sectionName);
        game.currentQuest!.log.add(new LogEntry('Error: Unable to find monster of traits specified in spawn event: ' + spawn.sectionName, true));
        return false;
      }

      // Pick monster at random from candidates
      dictAdd(this.monsterSelect, spawn.sectionName, listGet(list, Random.range(0, list.length)));
      return true;
    }

    return false;
  }

  // Valkyrie: Quest.cs Quest.InArray
  static inArray(array: string[], item: string): boolean {
    for (const s of array) {
      if (s === item) return true;
    }

    return false;
  }

  // Valkyrie: Quest.cs Quest.ChangeQuest
  changeQuest(path: string): void {
    const game = Game.get();

    // Clean up everything marked as 'board'
    // (Valkyrie keeps the QuestUICanvas panel, which the app recreates as needed; see issue #820)
    game.ui.destroyTag(Game.BOARD);

    game.tokenBoard.tc = [];

    this.phase = MoMPhase.investigator;
    game.cc.position = new Vector3(0, 0, -8);

    game.cc.minLimit = false;
    game.cc.maxLimit = false;

    // Set static quest data
    if (path.startsWith('\\') || path.startsWith('/')) {
      path = substring(path, 1, path.length - 1);
    }

    let questToTransition = game.currentQuest!.originalPath + Path.DirectorySeparatorChar + path;
    if (game.currentQuest!.fromSavegame) {
      questToTransition = ContentData.valkyrieLoadQuestPath + Path.DirectorySeparatorChar + path;
    }

    this.qd = new QuestData(questToTransition);
    // set questPath but do not set original path, as we are loading from within a quest here.
    this.questPath = Path.getDirectoryName(this.qd.questPath)!;

    this.vars.trimQuest();

    this.undoStack = new Stack();

    // Initialise data
    this.boardItems = new Map();
    this.ordered_boardItems = [];
    this.monsters = [];
    this.heroSelection = new Map();
    this.puzzle = new Map();
    this.eventQuota = new Map();
    this.undoStack = new Stack();
    this.monsterSelect = new Map();
    this.itemSelect = new Map();
    this.itemInspect = new Map();
    this.shops = new Map();
    this.activeShop = '';

    this.generateItemSelection();
    const started = this.eManager.started;
    this.eManager = new EventManager();
    // Not in Valkyrie: a test from the editor keeps the events of the quests it went through (EventManager.started)
    for (const s of started) this.eManager.started.push(s);

    // Set quest vars for selected expansions
    for (const s of game.cd.getLoadedPackIDs()) {
      if (s.length > 0) {
        this.vars.setValue('#' + s, 1);
      }
    }

    this.vars.setValue('#round', 1);

    // Set quest flag based on hero count
    let heroCount = 0;
    for (const h of this.heroes) {
      h.activated = false;
      h.defeated = false;
      h.selected = false;
      if (h.heroData !== null) {
        heroCount++;
        // Create variable to value 1 for each selected Hero and Class
        game.currentQuest!.vars.setValue('#' + h.heroData.sectionName, 1);
        if (!isNullOrEmpty(h.className)) {
          game.currentQuest!.vars.setValue('#' + h.className, 1);
        }
      }
    }

    game.currentQuest!.vars.setValue('#heroes', heroCount);

    const music: string[] = [];
    for (const ad of game.cd.values(AudioData)) {
      if (ad.containsTrait('quest')) music.push(ad.file);
    }

    game.audioControl.playDefaultQuestMusic(music);

    // Update the screen
    game.monsterCanvas.updateList();
    game.heroCanvas.updateStatus();

    // when starting a new quest, reset round countroller
    game.roundControl.reset();

    // Start round events
    this.eManager.eventTriggerType('StartRound', false);
    // Start the quest (top of stack)
    this.eManager.eventTriggerType('EventStart', false);
    this.eManager.triggerEvent();
    SaveManager.save(0);
  }

  // Read save data
  // Valkyrie: Quest.cs Quest.LoadQuest
  loadQuest(saveData: IniData): void {
    const game = Game.get();
    this.game = game;

    this.fromSavegame = true;

    // Set static quest data
    this.qd = new QuestData(saveData.get('Quest', 'path'));

    // This happens anyway but we need it to be here before the following code is executed (also needed for loading saves)
    game.currentQuest = this;

    // Get state
    this.heroesSelected = boolTryParse(saveData.get('Quest', 'heroesSelected')).value;
    const horror = boolTryParse(saveData.get('Quest', 'horror')).value;
    if (horror) {
      this.phase = MoMPhase.horror;
    }

    // Set camera
    const camx = floatTryParse(saveData.get('Quest', 'camx'), true).value;
    const camy = floatTryParse(saveData.get('Quest', 'camy'), true).value;
    const camz = floatTryParse(saveData.get('Quest', 'camz'), true).value;
    game.cc.position = new Vector3(camx, camy, camz);

    game.cc.minLimit = false;
    if (saveData.get('Quest', 'camxmin').length > 0) {
      game.cc.minLimit = true;
      game.cc.minPanX = intTryParse(saveData.get('Quest', 'camxmin')).value;
      game.cc.minPanY = intTryParse(saveData.get('Quest', 'camymin')).value;
    }

    game.cc.maxLimit = false;
    if (saveData.get('Quest', 'camxmax').length > 0) {
      game.cc.maxLimit = true;
      game.cc.maxPanX = intTryParse(saveData.get('Quest', 'camxmax')).value;
      game.cc.maxPanY = intTryParse(saveData.get('Quest', 'camymax')).value;
    }

    this.shops = new Map();
    const saveShops = saveData.get('Shops');
    if (saveShops !== null) {
      for (const [key, value] of saveShops) {
        const shopList: string[] = [];
        for (const s of split(value, [' '], MAX_PARTS, true)) {
          shopList.push(s);
        }

        dictAdd(this.shops, key, shopList);
      }
    }

    this.activeShop = '';
    const saveActiveShop = saveData.get('ActiveShop');
    if (saveActiveShop !== null) {
      for (const [key] of saveActiveShop) {
        this.activeShop = key;
      }
    }

    // Restore event log
    this.log = new QuestLog();
    for (const [key, value] of saveData.get('Log')!) {
      this.log.add(new LogEntry(key, value));
    }

    // Restore event list (do nothing if empty: '??' is here to avoid null exception)
    this.eventList = [];
    for (const [, value] of saveData.get('EventList') ?? new Map<string, string>()) {
      this.eventList.push(value);
    }

    // Set start time to now
    this.start_time = new Date();
    // get previous duration, if not present, we are using an old savegame so do not use the duration
    const duration = intTryParse(saveData.get('Quest', 'duration'));
    this.duration = duration.ok ? duration.value : -1;

    // A save without [Vars] throws here, as in C#
    const saveVars = saveData.get('Vars');
    this.vars = new VarManager(saveVars as Map<string, string>);

    const saveSelectItem = saveData.get('SelectItem');
    if (saveSelectItem === null) {
      // Support old saves
      this.itemSelect = new Map();
      this.generateItemSelection();
    } else {
      this.itemSelect = saveSelectItem;
    }

    this.itemInspect = saveData.get('ItemInspect') ?? new Map();

    // Set items
    this.items = new Set();
    for (const [key] of saveData.get('Items')!) {
      this.items.add(key);
    }

    this.originalPath = saveData.get('Quest', 'originalpath');
    this.questPath = saveData.get('Quest', 'path');

    // Support old saves
    this.monsterSelect = saveData.get('SelectMonster') ?? new Map();

    // Clear all tokens
    game.tokenBoard.clear();
    // Clean up everything marked as 'board'
    game.ui.destroyTag(Game.BOARD);

    // Repopulate items on the baord
    this.boardItems = new Map();
    this.ordered_boardItems = [];
    for (const [key] of saveData.get('Board')!) {
      let boardItem = key;
      if (boardItem[0] === '\\') {
        boardItem = boardItem.substring(1);
      }

      if (!this.qd.components.has(boardItem)) {
        ValkyrieDebug.log('Missing component:' + boardItem + 'Probably corrupted save');
      }

      if (boardItem.indexOf('Door') === 0) {
        dictAdd(this.boardItems, boardItem, new Door(dictGet(this.qd.components, boardItem) as QuestData.Door, game));
        this.ordered_boardItems.push(boardItem);
      }

      if (boardItem.indexOf('Token') === 0) {
        dictAdd(this.boardItems, boardItem, new Token(dictGet(this.qd.components, boardItem) as QuestData.Token, game));
        this.ordered_boardItems.push(boardItem);
      }

      if (boardItem.indexOf('Tile') === 0) {
        dictAdd(this.boardItems, boardItem, new Tile(dictGet(this.qd.components, boardItem) as QuestData.Tile, game));
        this.ordered_boardItems.push(boardItem);
      }

      if (boardItem.indexOf('UI') === 0) {
        dictAdd(this.boardItems, boardItem, new UI(dictGet(this.qd.components, boardItem) as QuestData.UI, game));
        this.ordered_boardItems.push(boardItem);
      }

      if (boardItem.indexOf('#shop') === 0) {
        dictAdd(this.boardItems, boardItem, new ShopInterface([], Game.get(), this.activeShop));
        this.ordered_boardItems.push(boardItem);
      }
    }

    // Clean undo stack (we don't save undo stack)
    // When performing undo this is replaced later
    this.undoStack = new Stack();

    // Fetch hero state
    this.heroes = [];
    this.monsters = [];
    let heroCount = 0;
    for (const [key, value] of saveData.data) {
      // Only real heroes contains key "type" in loaded dictionary
      if (key.indexOf('Hero') === 0 && key.indexOf('HeroSelection') !== 0 && value.has('type')) {
        heroCount++;
        this.heroes.push(new Hero(value));
      }
    }

    game.currentQuest!.vars.setValue('#heroes', heroCount);

    // Monsters must be after heros because some activations refer to heros
    for (const [key, value] of saveData.data) {
      if (key.indexOf('Monster') === 0) {
        this.monsters.push(new Monster(value));
      }
    }

    // Restore hero selections
    this.heroSelection = new Map();
    for (const [key, value] of saveData.get('HeroSelection')!) {
      // List of selected heroes
      const selectHeroes = split(value, [' '], MAX_PARTS, true);
      const heroList: Hero[] = [];

      for (const s of selectHeroes) {
        for (const h of this.heroes) {
          // Match hero id
          const id = intTryParse(s).value;
          if (id === h.id) {
            heroList.push(h);
          }
        }
      }

      // Add this selection
      dictAdd(this.heroSelection, key, heroList);
    }

    this.puzzle = new Map();
    for (const [key, value] of saveData.data) {
      if (key.indexOf('PuzzleSlide') === 0) {
        dictAdd(this.puzzle, substring(key, 'PuzzleSlide'.length, key.length - 'PuzzleSlide'.length), new PuzzleSlide(value));
      }

      if (key.indexOf('PuzzleCode') === 0) {
        dictAdd(this.puzzle, substring(key, 'PuzzleCode'.length, key.length - 'PuzzleCode'.length), new PuzzleCode(value));
      }

      if (key.indexOf('PuzzleImage') === 0) {
        dictAdd(this.puzzle, substring(key, 'PuzzleImage'.length, key.length - 'PuzzleImage'.length), new PuzzleImage(value));
      }

      if (key.indexOf('PuzzleTower') === 0) {
        dictAdd(this.puzzle, substring(key, 'PuzzleTower'.length, key.length - 'PuzzleTower'.length), new PuzzleTower(value));
      }
    }

    // Restore event quotas
    this.eventQuota = new Map();
    for (const [key, value] of saveData.get('EventQuota')!) {
      dictAdd(this.eventQuota, key, intTryParse(value).value);
    }

    this.eManager = new EventManager(saveData.get('EventManager'));

    // Update the screen
    game.stageUI = new NextStageButton();
    game.monsterCanvas.updateList();
    game.heroCanvas.updateStatus();

    const loadedDefaultOn = boolTryParse(saveData.get('Quest', 'defaultmusicon'));
    this.defaultMusicOn = !loadedDefaultOn.ok || loadedDefaultOn.value;
    // Start quest music
    game.playDefaultQuestMusic();
    const saveMusic = saveData.get('Music');
    if (saveMusic !== null) {
      const music = [...saveMusic.values()];
      const toPlay: string[] = [];
      for (const s of music) {
        const musicData = game.cd.tryGet(AudioData, s);
        if (musicData !== undefined) {
          toPlay.push(musicData.file);
        } else {
          toPlay.push(Quest.findLocalisedMultimediaFile(s, Path.getDirectoryName(this.qd.questPath)!));
        }
      }

      game.audioControl.playMusic(toPlay);
    }
  }

  // Save to the undo stack
  // This is called on user actions (such as defeated monsters, heros activated)
  // Valkyrie: Quest.cs Quest.Save
  save(): void {
    this.undoStack.push(this.toString(false));
  }

  // Load from the undo stack
  // Valkyrie: Quest.cs Quest.Undo
  undo(): void {
    // Nothing to undo
    if (this.undoStack.count === 0) return;
    // Load the old state.  This will also set game.CurrentQuest
    const currentLog = this.log;
    currentLog.add(new LogEntry('Notice: Undo', true));
    const oldQuest = new Quest(this.undoStack.pop());
    // Transfer the undo stack to the loaded state
    oldQuest.undoStack = this.undoStack;
    oldQuest.log = currentLog;
  }

  // This function adjusts morale.  We don't write directly so that NoMorale can be triggered
  // Delay is used if we can't raise the nomorale event at this point (need to recall this later)
  // Valkyrie: Quest.cs Quest.AdjustMorale
  adjustMorale(m: number, delay = false): void {
    const game = Game.get();

    let morale = Math.fround(this.vars.getValue('$%morale') + m);
    this.vars.setValue('$%morale', morale);

    // Test for no morale ending
    if (morale < 0) {
      morale = 0;
      game.moraleDisplay!.update();
      // Hold loss during activation
      if (delay) {
        morale = -1;
        return;
      }

      this.eManager.eventTriggerType('NoMorale');
    }

    game.moraleDisplay!.update();
  }

  // Function to return a hero at random
  // Valkyrie: Quest.cs Quest.GetRandomHero
  getRandomHero(): Hero {
    // We have to create a list with the null heroes trimmed
    const hList: Hero[] = [];
    for (const h of this.heroes) {
      if (h.heroData !== null) {
        hList.push(h);
      }
    }

    return listGet(hList, Random.range(0, hList.length));
  }

  // Valkyrie: Quest.cs Quest.GetHeroCount
  getHeroCount(): number {
    let count = 0;
    for (const h of this.heroes) {
      if (h.heroData !== null) {
        count++;
      }
    }

    return count;
  }

  /** Add a component (token, tile, etc) to the board, or a list of them. */
  // Valkyrie: Quest.cs Quest.Add
  add(names: string | readonly string[], shop = false): void {
    if (typeof names !== 'string') {
      for (const s of names) {
        this.add(s, shop);
      }
      return;
    }
    const name = names;
    const game = this.game;

    // Check that the component is valid
    if (!game.currentQuest!.qd.components.has(name)) {
      ValkyrieDebug.log('Error: Unable to create missing quest component: ' + name);
      Application.quit('component-missing', name, 'Error: Unable to create missing quest component: ' + name);
    }

    // Add to active list (a missing component throws here, as Unity carries on after Application.Quit)
    const qc = dictGet(game.currentQuest!.qd.components, name);

    if (this.boardItems.has(name)) return;

    // Add to board
    if (qc instanceof QuestData.Tile) {
      dictAdd(this.boardItems, name, new Tile(qc, game));
      this.ordered_boardItems.push(name);
    }

    if (qc instanceof QuestData.Door) {
      dictAdd(this.boardItems, name, new Door(qc, game));
      this.ordered_boardItems.push(name);
    }

    if (qc instanceof QuestData.Token) {
      dictAdd(this.boardItems, name, new Token(qc, game));
      this.ordered_boardItems.push(name);
    }

    if (qc instanceof QuestData.UI) {
      dictAdd(this.boardItems, name, new UI(qc, game));
      this.ordered_boardItems.push(name);
    }

    if (qc instanceof QuestData.QItem && !shop) {
      if (this.itemSelect.has(name)) {
        this.items.add(this.itemSelect.get(name)!);
        if (qc.inspect.length > 0) {
          // Remove then Add puts it back in its slot of the .NET Dictionary, as Map.set does
          game.currentQuest!.itemInspect.set(this.itemSelect.get(name)!, qc.inspect);
        }
      }
    }
  }

  /** Remove an active component, or a list of them. */
  // Valkyrie: Quest.cs Quest.Remove
  remove(names: string | readonly string[]): void {
    if (typeof names !== 'string') {
      for (const s of names) {
        this.remove(s);
      }
      return;
    }
    const name = names;
    const game = this.game;

    if (this.boardItems.has(name)) {
      this.boardItems.get(name)!.remove();
      this.boardItems.delete(name);
      removeFirst(this.ordered_boardItems, name);
    }

    if (this.monsterSelect.has(name)) {
      const toRemove: Monster[] = [];
      for (const m of this.monsters) {
        if (m.monsterData.sectionName === this.monsterSelect.get(name)) {
          toRemove.push(m);
        }
      }

      for (const m of toRemove) {
        removeFirst(this.monsters, m);
        game.monsterCanvas.updateList();
        game.currentQuest!.vars.setValue('#monsters', game.currentQuest!.monsters.length);
      }
    }

    if (this.itemSelect.has(name) && this.items.has(this.itemSelect.get(name)!)) {
      this.items.delete(this.itemSelect.get(name)!);
      if (this.itemInspect.has(this.itemSelect.get(name)!)) {
        this.itemInspect.delete(this.itemSelect.get(name)!);
      }
    }

    if (name === '#monsters') {
      this.monsters.length = 0;
      game.monsterCanvas.updateList();
      game.currentQuest!.vars.setValue('#monsters', 0);
    }

    if (name === '#boardcomponents') {
      for (const bc of this.boardItems.values()) {
        bc.remove();
      }

      this.boardItems.clear();
      this.ordered_boardItems.length = 0;
    }

    if (name === '#uicomponents') {
      this.removeWhere((c) => c instanceof UI);
    }

    if (name === '#doors') {
      this.removeWhere((c) => c instanceof Door);
    }

    if (name === '#tiles') {
      this.removeWhere((c) => c instanceof Tile);
    }

    if (name === '#qitems') {
      for (const [, value] of this.itemSelect) {
        if (this.items.has(value)) {
          this.items.delete(value);
          if (this.itemInspect.has(value)) {
            this.itemInspect.delete(value);
          }
        }
      }
    }

    if (name === '#tokens') {
      this.removeWhere((c) => c instanceof Token);
    }
  }

  // The loops of Remove for #uicomponents, #doors, #tiles and #tokens
  private removeWhere(test: (c: BoardComponent) => boolean): void {
    const toRemove: string[] = [];
    for (const [key, value] of this.boardItems) {
      if (test(value)) {
        value.remove();
        toRemove.push(key);
      }
    }

    for (const s of toRemove) {
      this.boardItems.delete(s);
      removeFirst(this.ordered_boardItems, s);
    }
  }

  // Valkyrie: Quest.cs Quest.UIItemsPresent
  uiItemsPresent(): boolean {
    for (const c of this.boardItems.values()) {
      if (c instanceof UI) return true;
      if (c instanceof ShopInterface) return true;
    }

    return false;
  }

  // Remove all active components
  // Valkyrie: Quest.cs Quest.RemoveAll
  removeAll(): void {
    for (const [, value] of this.boardItems) {
      value.remove();
    }

    this.boardItems.clear();
    this.ordered_boardItems.length = 0;
  }

  // Change the transparency of a component on the board
  // Valkyrie: Quest.cs Quest.ChangeAlpha
  changeAlpha(name: string, alpha: number): void {
    // Check is component is active
    if (!this.boardItems.has(name)) return;
    this.boardItems.get(name)!.setVisible(alpha);
  }

  // Change the transparency of all board components
  // Valkyrie: Quest.cs Quest.ChangeAlphaAll
  changeAlphaAll(): void {
    for (const [, value] of this.boardItems) {
      value.setVisible(this.game.editorTransparency);
    }
  }

  /** Fades the board components; the app calls it every frame with the seconds since the last one (Time.deltaTime). */
  // Valkyrie: Quest.cs Quest.Update
  update(deltaTime: number): void {
    for (const [, value] of this.boardItems) {
      value.updateAlpha(deltaTime);
    }
  }

  /** Save the quest state to a string for save games and undo; the log is left out for undo. */
  // Valkyrie: Quest.cs Quest.ToString
  toString(includeLog = true): string {
    const game = this.game;
    const nl = NewLine;
    // General quest state block
    let r = '[Quest]' + nl;

    r += 'time=' + dateTimeToString(new Date()) + nl;

    // Current game duration + duration of previous game session before loading
    if (this.duration >= 0) {
      const currentMinutes = (Date.now() - this.start_time.getTime()) / 60000;
      r += 'duration=' + Math.trunc(this.duration + currentMinutes) + nl;
    } else {
      // if previous duration is invalid, we are using an old savegame do not try to calculate anything
      r += 'duration=' + -1 + nl;
    }

    // Save valkyrie version
    r += 'valkyrie=' + game.version + nl;

    r += 'path=' + this.qd.questPath + nl;
    r += 'originalpath=' + this.originalPath + nl;
    r += 'questname=' + this.qd.quest.name.translate() + nl;

    if (this.phase === MoMPhase.horror) {
      r += 'horror=true' + nl;
    } else {
      r += 'horror=false' + nl;
    }

    r += 'heroesSelected=' + boolToString(this.heroesSelected) + nl;
    r += 'camx=' + floatToString(game.cc.position.x) + nl;
    r += 'camy=' + floatToString(game.cc.position.y) + nl;
    r += 'camz=' + floatToString(game.cc.position.z) + nl;
    if (game.cc.minLimit) {
      r += 'camxmin=' + game.cc.minPanX + nl;
      r += 'camymin=' + game.cc.minPanY + nl;
    }

    if (game.cc.maxLimit) {
      r += 'camxmax=' + game.cc.maxPanX + nl;
      r += 'camymax=' + game.cc.maxPanY + nl;
    }

    r += '[Packs]' + nl;
    for (const pack of game.cd.getLoadedPackIDs()) {
      r += pack + nl;
    }

    r += '[Board]' + nl;
    // we need to use an ordered list of board item, to preserve items stacking order, Dictionary do not preserve order
    for (const item of this.ordered_boardItems) {
      // Hack to prevent items from being treated as comments
      r += '\\' + item + nl;
    }

    r += this.vars.toString();

    r += '[Items]' + nl;
    for (const s of this.items) {
      r += s + nl;
    }

    // Hero selection is a list of selections, each with space separated hero lists
    r += '[HeroSelection]' + nl;
    for (const [key, value] of this.heroSelection) {
      r += key + '=';
      for (const h of value) {
        r += h.id + ' ';
      }

      r = r.substring(0, r.length - 1) + nl;
    }

    // Save event quotas
    r += '[EventQuota]' + nl;
    for (const [key, value] of this.eventQuota) {
      r += key + '=' + value + nl;
    }

    // Save hero state
    for (const h of this.heroes) {
      r += h.toString();
    }

    // Save monster state
    for (const m of this.monsters) {
      r += m.toString();
    }

    for (const [key, value] of this.puzzle) {
      r += value.toString(key);
    }

    let i = 0;
    r += '[Log]' + nl;

    if (includeLog) {
      for (const e of this.log) {
        r += e.toString(i++);
      }
    }

    r += '[EventList]' + nl;
    i = 0;
    for (const eventName of this.eventList) {
      r += 'Event' + i + '=' + eventName + nl;
      i++;
    }

    r += '[SelectMonster]' + nl;
    for (const [key, value] of this.monsterSelect) {
      r += key + '=' + value + nl;
    }

    r += '[SelectItem]' + nl;
    for (const [key, value] of this.itemSelect) {
      r += key + '=' + value + nl;
    }

    r += '[ItemInspect]' + nl;
    for (const [key, value] of this.itemInspect) {
      r += key + '=' + value + nl;
    }

    if (this.activeShop.length > 0) {
      r += '[ActiveShop]' + nl;
      r += this.activeShop + nl;
    }

    r += this.eManager.toString();

    r += '[Shops]' + nl;
    for (const [key, value] of this.shops) {
      r += key + '=';
      for (const s of value) {
        r += s + ' ';
      }

      r = r.substring(0, r.length - 1) + nl;
    }

    if (this.music.length > 0) {
      r += '[Music]' + nl;
      for (let j = 0; j < this.music.length; j++) {
        r += 'track' + j + '=' + this.music[j] + nl;
      }

      r += nl;
    }

    return r;
  }
}

// List<T>.Remove: the first occurrence
function removeFirst<T>(list: T[], item: T): void {
  const index = list.indexOf(item);
  if (index >= 0) list.splice(index, 1);
}

export declare namespace Quest {
  type Tile = _Tile;
  type Token = _Token;
  type UI = _UI;
  type Door = _Door;
  type BoardComponent = _BoardComponent;
  type Hero = _Hero;
  type Monster = _Monster;
  type MoMPhase = number;
  type LogEntry = _LogEntry;
  namespace Monster {
    type ActivationInstance = _ActivationInstance;
  }
}
