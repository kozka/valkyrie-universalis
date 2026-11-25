// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/TokenBoard.cs
// The objects it places on the token canvas keep the state Unity's would (platform/GameObject.ts); the app draws them.
import { ContentData } from '../Content/ContentData.ts';
import { ItemData } from '../Content/ContentTypes.ts';
import { QuestData } from '../Content/QuestData.ts';
import { Game } from '../Game.ts';
import { Application } from '../platform/Application.ts';
import { Color } from '../platform/Color.ts';
import { dictGet, floatTryParse, listGet } from '../platform/CSharp.ts';
import { GameObject } from '../platform/GameObject.ts';
import type { Texture2D } from '../platform/Texture2D.ts';
import { Mathf } from '../platform/Mathf.ts';
import { Vector2 } from '../platform/Vector2.ts';
import { Vector3 } from '../platform/Vector3.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import type { EventManager } from './EventManager.ts';
import { Quest } from './Quest.ts';

// Class for tokens and doors that will get the onClick event
// Valkyrie: TokenBoard.cs TokenBoard.TokenControl
class TokenControl {
  c: Quest.BoardComponent | null = null;
  /** Not in Valkyrie: true when the constructor gave the piece its button. */
  clickable = false;

  // Initialise from a door
  constructor(component: Quest.BoardComponent) {
    // If we are in the editor we don't add the buttons
    if (Game.get().editMode) return;

    this.c = component;
    // Check if we should enable click for UI
    if (component instanceof Quest.UI) {
      if (!component.qUI.enableClick) {
        return;
      }
    } else if (component instanceof Quest.Token) {
      if (!component.qToken.enableClick) {
        return;
      }
    }

    // button.onClick.AddListener(delegate { startEvent(); })
    this.clickable = true;
    Game.get().ui.tokenBoardAdd(this);
  }

  // On click the tokens start an event
  // Valkyrie: TokenBoard.cs TokenControl.startEvent
  startEvent(): void {
    const game = Game.get();

    // If in horror phase ignore token, accept UI element (items)
    if (this.c!.getEvent()!.typeDynamic === 'Token' && game.currentQuest!.phase !== Quest.MoMPhase.investigator) return;

    // If a dialog is open ignore
    if (game.ui.findTag(Game.DIALOG)) return;
    // Spawn a window with the door/token info; not in Valkyrie: the editor's test panel says it was pressed on the board
    const eManager = game.currentQuest!.eManager;
    eManager.queueBecause({ kind: 'board' }, () => eManager.queueEvent(this.c!.getEvent()!.sectionName));
  }
}

type _TokenControl = TokenControl;

// Class for managing token and door operation
// One object is created and attached to the token canvas
// Valkyrie: TokenBoard.cs TokenBoard
export class TokenBoard {
  static readonly TokenControl = TokenControl;

  tc: TokenControl[] = [];

  // Used when ending a quest
  // Valkyrie: TokenBoard.cs TokenBoard.Clear
  clear(): void {
    this.tc = [];
  }

  // Add a door, a token or a UI
  // Valkyrie: TokenBoard.cs TokenBoard.Add
  add(component: Quest.Door | Quest.Token | Quest.UI): void {
    this.tc.push(new TokenControl(component));
  }

  // Monsters are only on the board during an event
  // Valkyrie: TokenBoard.cs TokenBoard.AddMonster
  addMonster(me: EventManager.MonsterEvent): void {
    const game = Game.get();
    let count = 0;
    // Get number of heroes
    for (const h of game.currentQuest!.heroes) {
      if (h.heroData !== null) count++;
    }

    if (game.gameType.typeName() === 'MoM') {
      const newTex = ContentData.fileToTexture(me.cMonster.imagePlace);
      let width = 1;
      let height = 1;

      if (game.currentQuest!.qd.components.has(me.cMonster.sectionName)) {
        const cm = game.currentQuest!.qd.components.get(me.cMonster.sectionName);
        // When using a custom imported image directly or an explicit imageplace, use its native PPS scale
        if (cm instanceof QuestData.CustomMonster && cm.imagePlace.length > 0) {
          const pps = game.gameType.tilePixelPerSquare();
          if (pps > 0) {
            width = Math.fround(newTex!.width / pps);
            height = Math.fround(newTex!.height / pps);
          }
        }
      }
      this.addPlacedMonsterImg('', newTex, width, height, me.qEvent.location.x, me.qEvent.location.y);
    }
    // Check for a placement list at this hero count
    else if (listGet(me.qMonster.placement, count).length === 0) {
      if (me.cMonster.containsTrait('lieutenant')) {
        const newTex = ContentData.fileToTexture(me.cMonster.imagePlace);
        let width = 1;
        let height = 1;

        if (game.currentQuest!.qd.components.has(me.cMonster.sectionName)) {
          const cm = game.currentQuest!.qd.components.get(me.cMonster.sectionName);
          // For Descent custom unplaced Lieutenants like agents, respect custom token dimensions
          if (cm instanceof QuestData.CustomMonster && cm.imagePlace.length > 0) {
            const pps = game.gameType.tilePixelPerSquare();
            if (pps > 0) {
              width = Math.fround(newTex!.width / pps);
              height = Math.fround(newTex!.height / pps);
            }
          }
        }
        this.addPlacedMonsterImg('', newTex, width, height, me.qEvent.location.x, me.qEvent.location.y);
      } else {
        // group placement
        this.addAreaMonster(me.qMonster);
      }
    } else {
      // Individual monster placement
      this.addPlacedMonsters(me, count);
    }
  }

  // Valkyrie: TokenBoard.cs TokenBoard.AddPlacedMonsters
  addPlacedMonsters(me: EventManager.MonsterEvent, count: number): void {
    // Get monster placement image
    const newTex = ContentData.fileToTexture(me.cMonster.imagePlace);

    // Check load worked
    if (newTex === null) {
      ValkyrieDebug.log('Error: Cannot load monster image');
      Application.quit('monster-image-unreadable', me.cMonster.sectionName, 'Error: Cannot load monster image: ' + me.cMonster.imagePlace);
    }

    // Get placement dimensions
    let x = 1;
    let y = 1;

    if (me.cMonster.containsTrait('medium') || me.cMonster.containsTrait('huge')) {
      x = 2;
    }
    if (me.cMonster.containsTrait('huge') || me.cMonster.containsTrait('massive')) {
      y = 2;
    }
    if (me.cMonster.containsTrait('massive')) {
      x = 3;
    }

    // All all placements
    for (const s of listGet(me.qMonster.placement, count)) {
      this.addPlacedMonsterImg(s, newTex, x, y);
    }
  }

  // Add a placement image
  // Valkyrie: TokenBoard.cs TokenBoard.AddPlacedMonsterImg
  addPlacedMonsterImg(place: string, newTex: Texture2D | null, sizeX: number, sizeY: number, posX = 0, posY = 0): void {
    const game = Game.get();

    // Check that placement name exists
    if (game.currentQuest!.qd.components.has(place)) {
      const mp = game.currentQuest!.qd.components.get(place);
      if (mp instanceof QuestData.MPlace) {
        if (mp.tokenSize === 'small') {
          sizeX = 1;
          sizeY = 1;
        } else if (mp.tokenSize === 'medium') {
          sizeX = 2;
          sizeY = 1;
        } else if (mp.tokenSize === 'huge') {
          sizeX = 2;
          sizeY = 2;
        } else if (mp.tokenSize === 'massive') {
          sizeX = 3;
          sizeY = 2;
        } else if (mp.tokenSize === 'Original') {
          const pps = game.gameType.tilePixelPerSquare();
          if (pps > 0) {
            sizeX = Math.fround(newTex!.width / pps);
            sizeY = Math.fround(newTex!.height / pps);
          }
        } else {
          const size = floatTryParse(mp.tokenSize);
          if (size.ok) {
            sizeX = size.value;
            sizeY = size.value;
          }
        }
      }
    } else if (place.length > 0) {
      ValkyrieDebug.log('Error: Invalid moster place: ' + place);
      Application.quit('monster-place-missing', place, 'Error: Invalid moster place: ' + place);
    }

    // Create object
    const circleObject = new GameObject('MonsterSpawnBorder' + place);
    const gameObject = new GameObject('MonsterSpawn' + place);
    const borderObject = new GameObject('MonsterSpawnBorder' + place);
    gameObject.tag = Game.DIALOG;
    borderObject.tag = Game.DIALOG;
    circleObject.tag = Game.DIALOG;

    // Create the image (Sprite.Create reads the size first: a missing picture throws, as in C#)
    const image = gameObject.addImage();
    image.sprite = textureOrThrow(newTex);
    image.sizeDelta = new Vector2(sizeX, sizeY);

    let iconFrame: GameObject | null = null;
    if (game.gameType.typeName() === 'D2E') {
      // Move to get the top left square corner at 0,0
      gameObject.transform.translate(Math.fround((sizeX - 1) / 2), 0);
      gameObject.transform.translate(0, -Math.fround((sizeY - 1) / 2));
      borderObject.transform.translate(Math.fround((sizeX - 1) / 2), 0);
      borderObject.transform.translate(0, -Math.fround((sizeY - 1) / 2));

      image.sizeDelta = new Vector2(sizeX * 0.83, sizeY * 0.83);

      const frame = borderObject.addImage();
      frame.resource = 'sprites/borders/Frame_Monster_1x1';
      if (Mathf.approximately(sizeX, 3)) {
        frame.resource = 'sprites/borders/Frame_Monster_2x3';
      }
      if (Mathf.approximately(sizeX, 2) && Mathf.approximately(sizeY, 1)) {
        frame.resource = 'sprites/borders/Frame_Monster_1x2';
      }
      frame.sizeDelta = new Vector2(sizeX, sizeY);
      iconFrame = borderObject;
    }

    if (place.length > 0) {
      const component = dictGet(game.currentQuest!.qd.components, place);
      // A component that is not an MPlace is null after the cast in C#, and throws here
      const mp = (component instanceof QuestData.MPlace ? component : null)!;
      posX = mp.location.x;
      posY = mp.location.y;

      circleObject.transform.translate(Math.fround((sizeX - 1) / 2), 0);
      circleObject.transform.translate(0, -Math.fround((sizeY - 1) / 2));

      const iconCicle = circleObject.addImage();
      iconCicle.resource = 'sprites/target';
      if (Mathf.approximately(sizeX, 2) && Mathf.approximately(sizeY, 1)) {
        iconCicle.resource = 'sprites/borders/Empty_Monster_1x2';
      }
      iconCicle.sizeDelta = new Vector2(sizeX * 1.08, sizeY * 1.08);

      if (mp.master) {
        iconCicle.color = new Color(1, 0, 0, 1);
      }

      if (mp.rotate) {
        gameObject.transform.rotateAround(new Vector3(), -90);
        // iconFrame is null outside D2E, which throws here as in C#
        iconFrame!.transform.rotateAround(new Vector3(), -90);
        circleObject.transform.rotateAround(new Vector3(), -90);
      }
    }
    // Move to square
    gameObject.transform.translate(posX, posY);
    borderObject.transform.translate(posX, posY);
    circleObject.transform.translate(posX, posY);

    game.ui.tokenCanvasAdd(circleObject);
    game.ui.tokenCanvasAdd(gameObject);
    game.ui.tokenCanvasAdd(borderObject);
  }

  // Add a signal to place a monster group
  // Valkyrie: TokenBoard.cs TokenBoard.AddAreaMonster
  addAreaMonster(m: QuestData.Spawn): void {
    const game = Game.get();
    // Create object
    const gameObject = new GameObject('MonsterSpawn');
    gameObject.tag = Game.DIALOG;

    // Create the image
    const image = gameObject.addImage();
    image.color = new Color(1, 0, 0, 1);
    image.resource = 'sprites/target';
    image.sizeDelta = new Vector2(1, 1);
    // Move to square (105 units per square)
    gameObject.transform.translate(m.location.x, m.location.y);

    // Add pulser
    gameObject.pulser = true;
    game.ui.tokenCanvasAdd(gameObject);
  }

  // Add highlight for event, or the picture of the item it gives
  // Valkyrie: TokenBoard.cs TokenBoard.AddHighlight(QuestData.Event)
  addHighlight(e: QuestData.Event): void {
    let item = '';
    let items = 0;
    for (const s of e.addComponents) {
      if (s.indexOf('QItem') === 0) {
        item = s;
        items++;
      }
    }
    if (items !== 1 || !Game.get().currentQuest!.itemSelect.has(item)) {
      this.addHighlightAt(e.location);
    } else {
      this.addItem(e.location, item);
    }
  }

  // Add an item
  // Valkyrie: TokenBoard.cs TokenBoard.AddItem
  addItem(location: Vector2, item: string): void {
    const game = Game.get();
    // Create object
    const itemObject = new GameObject('item' + item);
    itemObject.tag = Game.DIALOG;

    // Create the image
    const itemData = game.cd.get(ItemData, dictGet(game.currentQuest!.itemSelect, item));
    const newTex = ContentData.fileToTexture(itemData.image);
    const image = itemObject.addImage();
    image.sprite = textureOrThrow(newTex);
    image.sizeDelta = new Vector2(1, 1);

    // Move to square
    itemObject.transform.translate(location.x, location.y);
    game.ui.tokenCanvasAdd(itemObject);
  }

  // Draw a highlight at location
  // Valkyrie: TokenBoard.cs TokenBoard.AddHighlight(Vector2, string, string)
  addHighlightAt(location: Vector2, id = '', tag = 'dialog'): void {
    // Create object
    const gameObject = new GameObject('Highlight' + id);
    gameObject.tag = tag;

    // Create the image
    const image = gameObject.addImage();
    image.resource = 'sprites/target';
    image.sizeDelta = new Vector2(1, 1);
    // Move to square (105 units per square)
    gameObject.transform.translate(location.x, location.y);

    // Add pulser
    gameObject.pulser = true;
    Game.get().ui.tokenCanvasAdd(gameObject);
  }
}

/** Sprite.Create(texture, new Rect(0, 0, texture.width, texture.height), …) on a null texture throws, as in C#. */
function textureOrThrow(texture: Texture2D | null): Texture2D {
  if (texture === null) throw new TypeError("Cannot read properties of null (reading 'width')");
  return texture;
}

export declare namespace TokenBoard {
  type TokenControl = _TokenControl;
}
