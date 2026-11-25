// The board: Valkyrie's board and token canvases drawn with PixiJS from the objects the engine puts on them
// (registry.ts), seen in perspective through the camera of CameraController (camera.ts), lying on a table, with the
// clicks that TokenBoard's buttons take. Each frame does what Game.Update and CameraController do: the quest fades its
// pieces, the camera moves, and the board shows them. Not ported from Valkyrie, except where noted.
import { Container, Rectangle, UPDATE_PRIORITY, type Texture, type Ticker, type Application } from 'pixi.js';
import { Game, Quest, Vector3, type CameraController, type Color, type GameObject, type TokenBoard } from '@universalis/engine';
import { run } from '../ui/run.ts';
import { update, useUI } from '../ui/store.ts';
import {
  type ArrowKey,
  type BoardPoint,
  type ViewSize,
  boardToScreen,
  boardToScreenMatrix,
  drag,
  followTarget,
  keepBoardInReach,
  type BoardBox,
  limit,
  panKeys,
  pinchZoom,
  screenToBoard,
  wheelAxis,
  wheelZoom,
  zoom,
} from './camera.ts';
import { BoardEffects, SHOW_PLACED } from './effects.ts';
import { freeCentre, positionShowingAt, type Box } from './focus.ts';
import { createQuad, destroyQuad, placeQuad, setPerspective, setQuadTexture, type Quad } from './perspective.ts';
import { componentsByObject, describe } from './pieces.ts';
import { boardTexture, releasePictures, resourceTexture } from './pictures.ts';
import { board } from './registry.ts';
import { drawSchematic, schematicLook, type SchematicLook } from './schematic.ts';
import { TABLE_GRAIN, TABLE_SIZE, tableTexture } from './table.ts';
import { destroyApplication, newApplication } from './pixiApps.ts';

/**
 * A press that moves further than this, in CSS pixels, pans the board instead of clicking a piece. In Valkyrie dragging
 * never cancels a click; here it does, or every pan on a phone would open the piece under the finger.
 */
const CLICK_DISTANCE = 10;

/**
 * Not in Valkyrie: a finger is not a pointer. A tap this close, in CSS pixels, to a clickable quest UI element above
 * what it landed on presses that element, as a browser's touch adjustment does for its buttons: the small arrows that
 * scenarios draw to turn their pages (Além do Beco's, 29×19 pixels on a phone held upright, over a picture that takes
 * the whole screen and is clickable too) could not be pressed with a finger (18 October 2026).
 */
const TOUCH_SLOP = 16;

const ARROWS: Record<string, ArrowKey> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };

/** Pixels per board unit of a baked schematic: about those of the official tiles (1024 for 3.5 units). */
const SCHEMATIC_PIXELS = 160;
/** The biggest side of a baked schematic, in pixels. */
const SCHEMATIC_MAX = 2048;

interface Drawn {
  /** The piece on the board; null for an object without a picture or without size. */
  quad: Quad | null;
  /** The schematic baked for the piece, until its picture replaces it. */
  baked: Texture | null;
  /** Where the quad was last put (x, y, rotation, width, height), so it moves only when the piece does. */
  placed: number[];
  /** Whether it is a token (anything but a tile), which Options may draw bigger. */
  token: boolean;
  /** Whether it shines when placed and fades when taken away (board/effects.ts): the scenario's tokens and monsters. */
  marked: boolean;
}

/** The window of the event on screen, the topmost; null when none is open. What it placed is told apart by it. */
function eventOnScreen(): unknown {
  return useUI.getState().windows.findLast((w) => w.kind === 'dialog')?.window ?? null;
}

/** How far the board's camera leans from looking straight down, in degrees: as Valkyrie's, the default (Options can lean
 * it like a table, as the official apps do). */
const BOARD_TILT = 10;

/** How long the board may go without drawing, while the page is in sight, before it is started again. */
const WATCHDOG_MS = 2000;

let boardTilt = BOARD_TILT;

/** Leans the board's camera more or less; the middle of the screen keeps showing what Valkyrie shows there. */
export function setBoardTilt(tilt: number): void {
  boardTilt = Math.max(0, Math.min(50, tilt));
}

/** How far the camera leans now, so that the editor's map, seen from above, can put it back. */
export function getBoardTilt(): number {
  return boardTilt;
}

/** Not in Valkyrie: how much bigger than the scenario says the tokens are drawn (and pressed), tiles apart. */
let pieceScale = 1;

export function setBoardPieceScale(scale: number): void {
  pieceScale = scale;
}

/** Not in Valkyrie: whether the camera keeps the player's zoom when the scenario moves it (Valkyrie issue #466). */
let keepZoom = false;

export function setBoardKeepZoom(on: boolean): void {
  keepZoom = on;
}

/** Called after every frame of the board, for what follows the quest's fading outside the canvas (quest UI elements). */
const frameListeners = new Set<() => void>();

export function onBoardFrame(listener: () => void): () => void {
  frameListeners.add(listener);
  return () => frameListeners.delete(listener);
}

/** The control a click on this object would press: the button TokenBoard.TokenControl gave it, if any. */
export function controlOf(gameObject: GameObject | null): TokenBoard.TokenControl | undefined {
  if (gameObject === null) return undefined;
  return Game.get().tokenBoard.tc.find((tc) => tc.clickable && tc.c?.unityObject === gameObject);
}

/** The quest UI element with this name (its section, which data-quest-ui holds). */
export function questUIElement(sectionName: string | undefined): Quest.UI | undefined {
  return board.questUI.find((component) => component.qUI.sectionName === sectionName);
}

/** The board on screen, if any. */
let shown: Board | null = null;

/** CameraController.TakeScreenshot for SaveManager: the board as it is on screen, or null without a board. */
export function boardScreenshot(): Promise<Uint8Array | null> {
  return shown === null ? Promise.resolve(null) : shown.screenshot();
}

/** Unity's Image.color as a tint. */
function tintOf(c: Color): number {
  const channel = (v: number) => Math.max(0, Math.min(255, Math.round(v * 255)));
  return (channel(c.r) << 16) | (channel(c.g) << 8) | channel(c.b);
}

/** SpritePulser: the size goes from 80% to 120% and back. */
function pulse(time: number): number {
  return 1 + 0.2 * Math.sin(time * 4);
}

export class Board {
  /** The element that takes the pointer: the canvas and the quest UI elements over it. */
  private readonly host: HTMLElement;
  /** The element that holds the canvas, as big as the host. */
  private readonly canvasHost: HTMLElement;
  /** The theme's colours and font, which follow the game being played (theme.css). */
  private readonly look: SchematicLook;
  private readonly tableColour: string;
  private readonly tableGrain: boolean;
  /** Protected for the scenario editor's map (editor/EditorBoard.ts), which draws a grid over the tiles. */
  protected app: Application | null = null;
  private destroyed = false;
  private table: Quad | null = null;
  protected readonly tileLayer = new Container();
  private readonly tokenLayer = new Container();
  private readonly effects = new BoardEffects();
  /** Whether the board has drawn once: what is there when a game starts or is loaded does not shine. */
  private synced = false;
  private readonly drawn = new Map<GameObject, Drawn>();
  private readonly perspective = new Float32Array(16);
  private revision = -1;
  private time = 0;

  // Input, read each frame as Unity's Input is
  private readonly pointers = new Map<number, BoardPoint>();
  /** Where the first pointer went down: on the screen, on the board, and on which element. */
  private pressed: { at: BoardPoint; point: BoardPoint; on: EventTarget | null; touch: boolean; client: BoardPoint } | null = null;
  /** The board point that stays under the pointer while it drags; null when the press does not drag. */
  private grabbed: BoardPoint | null = null;
  private moved = false;
  private pinching = false;
  private pinchDistance = 0;
  private zoomBy = 0;
  /** Where on the screen the wheel or the pinch zooms. */
  private zoomAt: BoardPoint | null = null;
  private readonly keys = new Set<ArrowKey>();
  private shift = false;
  private readonly removeListeners: (() => void)[] = [];

  constructor(host: HTMLElement, canvasHost: HTMLElement) {
    this.host = host;
    this.canvasHost = canvasHost;
    const theme = getComputedStyle(document.documentElement);
    this.look = schematicLook(theme);
    this.tableColour = theme.getPropertyValue('--table').trim();
    this.tableGrain = theme.getPropertyValue('--table-grain').trim() !== '0';
  }

  async start(): Promise<void> {
    const app = newApplication();
    try {
      await app.init({
        resizeTo: this.canvasHost,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        // The board's shader (perspective.ts) is written for WebGL: no WebGPU or Canvas 2D in its place (BoardView.tsx)
        preference: ['webgl'],
      });
    } catch (error) {
      destroyApplication(app);
      throw error;
    }
    // Labels are drawn once, so the font must be there first
    await document.fonts.load(`500 64px ${this.look.font}`).catch(() => []);
    if (this.destroyed) {
      destroyApplication(app);
      return;
    }
    this.app = app;
    shown = this;
    // Not in Valkyrie (15 November 2026): the owner draws the board again when the browser takes its context away
    // (contextLoss.ts); preventDefault lets the browser give it back
    const lost = (event: Event) => {
      event.preventDefault();
      if (this.contextLost) return;
      this.contextLost = true;
      console.warn('The board lost its WebGL context; drawing it again');
      app.ticker.stop();
      this.onContextLost?.();
    };
    app.canvas.addEventListener('webglcontextlost', lost);
    this.removeListeners.push(() => app.canvas.removeEventListener('webglcontextlost', lost));
    this.canvasHost.append(app.canvas);
    this.table = this.makeTable();
    app.stage.addChild(this.table, this.tileLayer, this.effects.under, this.tokenLayer, this.effects.over);
    this.listen();
    app.ticker.add(this.frame);
    // Not in Valkyrie (7 November 2026): an error thrown while Pixi draws a frame leaves its ticker without the next one,
    // and the quest then stops fading in its pictures (a scenario's last button stayed invisible): it is started again
    const watchdog = setInterval(() => {
      if (this.contextLost || document.visibilityState !== 'visible' || performance.now() - this.lastFrame < WATCHDOG_MS) return;
      console.warn('The board stopped drawing; starting it again');
      this.lastFrame = performance.now();
      app.ticker.stop();
      app.ticker.start();
    }, WATCHDOG_MS);
    this.removeListeners.push(() => clearInterval(watchdog));
  }

  /** When the board last drew a frame (performance.now), for the watchdog. */
  private lastFrame = performance.now();

  /** Not in Valkyrie: called once when the browser takes the board's WebGL context away (contextLoss.ts). */
  onContextLost: (() => void) | null = null;
  private contextLost = false;

  destroy(): void {
    this.destroyed = true;
    if (shown === this) shown = null;
    for (const remove of this.removeListeners) remove();
    for (const drawn of this.drawn.values()) {
      if (drawn.quad !== null) destroyQuad(drawn.quad);
      drawn.baked?.destroy(true);
    }
    this.drawn.clear();
    this.effects.destroy();
    if (this.table !== null) {
      const table = this.table.texture;
      destroyQuad(this.table);
      table.destroy(true);
      this.table = null;
    }
    if (this.app !== null) destroyApplication(this.app);
    this.app = null;
    releasePictures();
  }

  /** The felt the board lies on, in the theme's colour, reaching beyond what the camera can see. */
  private makeTable(): Quad {
    const table = createQuad(tableTexture(this.tableColour, this.tableGrain));
    placeQuad(table, 0, 0, 0, TABLE_SIZE, TABLE_SIZE);
    const copies = TABLE_SIZE / TABLE_GRAIN;
    table.geometry.uvs.set([0, 0, copies, 0, copies, copies, 0, copies]);
    table.geometry.getBuffer('aUV').update();
    return table;
  }

  /** The names of the pieces drawn with their own picture, not a schematic (for tests). */
  pictured(): string[] {
    return [...this.drawn].filter(([, drawn]) => drawn.quad !== null && drawn.baked === null).map(([gameObject]) => gameObject.name);
  }

  /** The names of every piece drawn, with its picture or as a schematic (for tests). */
  drawnPieces(): string[] {
    return [...this.drawn].filter(([, drawn]) => drawn.quad !== null || drawn.baked !== null).map(([gameObject]) => gameObject.name);
  }

  /** Where a board point is in the board's element, in CSS pixels (for tests and the quest UI layer). */
  screenOf(point: BoardPoint): BoardPoint {
    return boardToScreen(point, Game.get().cc.position, this.view());
  }

  /** The board point under a point of the page (for the editor's map). */
  pointAt(clientX: number, clientY: number): BoardPoint {
    const rect = this.host.getBoundingClientRect();
    return this.boardPoint({ x: clientX - rect.left, y: clientY - rect.top });
  }

  /** The objects at a board point, topmost first (for the editor's map). */
  piecesAt(point: BoardPoint): GameObject[] {
    return this.objectsAt(point);
  }

  /** The board as drawn now, with the table's colour behind it, as a PNG at 4/30 of its size in pixels. */
  // Valkyrie: CameraController.cs CameraController.IETakeScreenshot and SaveManager.cs SaveManager.ResizeScreenShotTexture
  async screenshot(): Promise<Uint8Array | null> {
    // WaitForEndOfFrame: the next frame shows what has just changed (or a moment, when the page is hidden)
    const drawn = this.app;
    if (drawn === null) return null;
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, 1000);
      drawn.ticker.addOnce(
        () => {
          clearTimeout(timer);
          resolve();
        },
        undefined,
        UPDATE_PRIORITY.UTILITY,
      );
    });
    const app = this.app;
    if (app === null) return null;
    // Valkyrie: SaveManager.cs SaveManager.SaveWithScreen (scale = 4f / 30f)
    const scale = 4 / 30;
    const width = Math.max(1, Math.round(app.canvas.width * scale));
    const height = Math.max(1, Math.round(app.canvas.height * scale));
    const picture = app.renderer.extract.canvas({ target: app.stage, frame: app.screen }) as HTMLCanvasElement;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (context === null) return null;
    context.fillStyle = this.tableColour;
    context.fillRect(0, 0, width, height);
    context.drawImage(picture, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    return blob === null ? null : new Uint8Array(await blob.arrayBuffer());
  }

  /** Zooms about the middle of the view as that many notches of the wheel do, away from the player when positive (the editor's buttons). */
  protected zoomNotches(notches: number): void {
    this.zoomBy += wheelZoom(notches * 0.1);
    this.zoomAt = null;
  }

  protected view(): ViewSize {
    return { width: this.host.clientWidth, height: this.host.clientHeight, tilt: boardTilt };
  }

  private readonly frame = (ticker: Ticker): void => {
    // Time.deltaTime and Time.time
    const deltaTime = ticker.deltaMS / 1000;
    this.time += deltaTime;
    this.lastFrame = performance.now();
    if (useUI.getState().stop !== null) return;
    const game = Game.get();
    try {
      // Valkyrie: Game.cs Game.Update (CurrentQuest.Update fades the pieces)
      game.currentQuest?.update(deltaTime);
      this.moveCamera(game.cc, deltaTime);
      this.sync();
      this.place(game.cc);
      // What was placed glows on while the window of its event is open
      const onScreen = eventOnScreen();
      this.effects.update(deltaTime, pieceScale, onScreen);
      const pressed = this.pressedPiece;
      if (pressed !== null) {
        if (onScreen !== null) pressed.seen = true;
        else if (pressed.seen || this.time - pressed.at > 1) this.pressedPiece = null;
      }
    } catch (e) {
      console.error(e);
      update({ stop: { message: e instanceof Error ? e.message : String(e), detail: e instanceof Error ? (e.stack ?? '') : '' } });
    }
    for (const listener of frameListeners) {
      try {
        listener();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Valkyrie: CameraController.cs CameraController.FixedUpdate and Update
  private moveCamera(cc: CameraController, deltaTime: number): void {
    if (this.zoomBy !== 0) {
      // Not in Valkyrie, which zooms to the middle of the screen: the point under the pointer or the pinch stays (#692)
      const at = this.zoomAt;
      const before = at !== null ? this.boardPoint(at) : null;
      zoom(cc, this.zoomBy);
      if (at !== null && before !== null) {
        const after = this.boardPoint(at);
        cc.position = new Vector3(cc.position.x + before.x - after.x, cc.position.y + before.y - after.y, cc.position.z);
      }
      this.zoomBy = 0;
    }
    panKeys(cc, this.keys, deltaTime);
    limit(cc);
    // If mouse is held down and we are not pinching update camera, every frame even when it does not move
    const held = this.pointers.values().next().value;
    if (this.grabbed !== null && !this.pinching && held !== undefined) {
      drag(cc, this.grabbed, this.boardPoint(held));
      limit(cc);
    }
    // any shift to cancel targets
    if (this.shift) cc.targetSet = false;
    this.aimAtFreeSpace(cc);
    followTarget(cc, deltaTime, keepZoom);
    // Not in Valkyrie (16 November 2026): the board cannot be lost from view (camera.ts); the editor's map goes anywhere
    if (!Game.get().editMode) keepBoardInReach(cc, this.piecesBox(), this.view());
  }

  /** Not in Valkyrie: what the tiles and the shown tokens cover; null when the board is empty. */
  private piecesBox(): BoardBox | null {
    let found = null as BoardBox | null;
    for (const objects of [board.tiles, board.tokens]) {
      for (const gameObject of objects) {
        const image = gameObject.image;
        if (image === null || image.color.a <= 0 || image.sizeDelta.x <= 0 || image.sizeDelta.y <= 0) continue;
        const { x, y } = gameObject.transform.position;
        // Turned any way, a piece stays within the circle around its corners
        const half = Math.hypot(image.sizeDelta.x, image.sizeDelta.y) / 2;
        found = {
          left: Math.min(found?.left ?? Infinity, x - half),
          right: Math.max(found?.right ?? -Infinity, x + half),
          bottom: Math.min(found?.bottom ?? Infinity, y - half),
          top: Math.max(found?.top ?? -Infinity, y + half),
        };
      }
    }
    return found;
  }

  /** The tiles placed while an event's window was on screen, and which window: lit again when it is folded away. */
  private newTiles: { of: GameObject; key: unknown }[] = [];

  /**
   * Not in Valkyrie (7 November 2026): the piece last pressed on the board, while the windows it opened are on screen,
   * so that folding one rings it (when it is pressed, `at`; `seen` once a window shows).
   */
  private pressedPiece: { of: GameObject; at: number; seen: boolean } | null = null;

  /** The engine's last target, and what the camera goes to instead (board/focus.ts). */
  private aimed: { place: Vector3; target: Vector3 } | null = null;

  /**
   * Not in Valkyrie (29 October 2026): while the camera moves to an event's place, it aims so that the place shows in
   * the middle of the part of the screen the windows leave free, not under them (board/focus.ts).
   */
  private aimAtFreeSpace(cc: CameraController): void {
    if (!cc.targetSet || Game.get().editMode) {
      this.aimed = null;
      return;
    }
    // A target the engine has just set (SetCamera makes a new one each time)
    if (this.aimed === null || cc.camTarget !== this.aimed.target) this.aimed = { place: cc.camTarget, target: cc.camTarget };
    const { place } = this.aimed;
    const z = keepZoom ? cc.position.z : place.z;
    const at = this.freeCentre();
    const target = at === null ? (z === place.z ? place : new Vector3(place.x, place.y, z)) : positionShowingAt(place, at, z, this.view());
    this.aimed.target = target;
    cc.camTarget = target;
  }

  /** The middle of the part of the board's screen the windows of the game leave free, if there is a good one. */
  private freeCentre(): { x: number; y: number } | null {
    const screen = this.host.closest('.quest-screen');
    if (screen === null) return null;
    const windows = [...screen.querySelectorAll('.dialog-stack > *')].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0);
    if (windows.length === 0) return null;
    const host = this.host.getBoundingClientRect();
    const box = (r: DOMRect): Box => ({ left: r.left - host.left, top: r.top - host.top, right: r.right - host.left, bottom: r.bottom - host.top });
    const bounds: Box = { left: 0, top: 0, right: host.width, bottom: host.height };
    // Above the bar's buttons, right of Descent's heroes, left of the monsters
    for (const button of screen.querySelectorAll('.phase-bar > .button, .descent-buttons')) bounds.bottom = Math.min(bounds.bottom, box(button.getBoundingClientRect()).top);
    const heroes = screen.querySelector('.hero-canvas');
    if (heroes !== null && heroes.getBoundingClientRect().width > 0) bounds.left = Math.max(bounds.left, box(heroes.getBoundingClientRect()).right);
    const monsters = screen.querySelector('.monster-list');
    if (monsters !== null && monsters.getBoundingClientRect().width > 0) {
      // Down the right edge, or along the bottom (Options)
      if (document.documentElement.dataset.monsterPlace === 'bottom') bounds.bottom = Math.min(bounds.bottom, box(monsters.getBoundingClientRect()).top);
      else bounds.right = Math.min(bounds.right, box(monsters.getBoundingClientRect()).left);
    }
    return freeCentre(bounds, windows.map(box));
  }

  /** Draws what was added to the board since the last frame, and forgets what was destroyed. */
  private sync(): void {
    if (board.revision === this.revision) return;
    this.revision = board.revision;
    const components = componentsByObject(Game.get().currentQuest);
    const alive = new Set<GameObject>();
    for (const [layer, objects] of [
      [this.tileLayer, board.tiles],
      [this.tokenLayer, board.tokens],
    ] as const) {
      let index = 0;
      for (const gameObject of objects) {
        alive.add(gameObject);
        let drawn = this.drawn.get(gameObject);
        if (drawn === undefined) {
          drawn = this.draw(gameObject, components.get(gameObject), layer === this.tokenLayer);
          this.drawn.set(gameObject, drawn);
          if (drawn.quad !== null && this.synced) {
            if (drawn.marked) this.effects.placed(gameObject, eventOnScreen());
            else if (layer === this.tileLayer) {
              const key = eventOnScreen();
              this.newTiles = [...this.newTiles.filter((t) => t.key === key), { of: gameObject, key }];
            }
          }
        }
        const quad = drawn.quad;
        if (quad === null) continue;
        if (quad.parent !== layer || layer.getChildIndex(quad) !== index) layer.addChildAt(quad, index);
        index++;
      }
    }
    for (const [gameObject, drawn] of this.drawn) {
      if (alive.has(gameObject)) continue;
      if (drawn.quad !== null && drawn.marked && drawn.placed.length > 0) this.effects.removed(drawn.quad, drawn.placed, drawn.baked);
      else {
        if (drawn.quad !== null) destroyQuad(drawn.quad);
        drawn.baked?.destroy(true);
      }
      this.drawn.delete(gameObject);
    }
    this.synced = true;
  }

  /** A piece as its schematic, replaced by its picture when the picture is there. */
  private draw(gameObject: GameObject, component: Quest.BoardComponent | undefined, token: boolean): Drawn {
    const image = gameObject.image;
    const marked = component instanceof Quest.Token || gameObject.name.startsWith('MonsterSpawn');
    if (image === null || image.sizeDelta.x <= 0 || image.sizeDelta.y <= 0) return { quad: null, baked: null, placed: [], token, marked };
    const { x: width, y: height } = image.sizeDelta;
    const spanish = Game.get().currentLang === 'Spanish';
    const baked = this.bake(drawSchematic(describe(gameObject, component), width, height, gameObject.transform.rotation, spanish, this.look), width, height);
    const drawn: Drawn = { quad: createQuad(baked), baked, placed: [], token, marked };
    const picture = image.sprite !== null ? boardTexture(image.sprite) : image.resource !== null ? resourceTexture(image.resource) : null;
    void picture?.then((texture) => {
      if (texture === null || drawn.quad === null || drawn.quad.destroyed) return;
      setQuadTexture(drawn.quad, texture);
      drawn.baked?.destroy(true);
      drawn.baked = null;
    });
    return drawn;
  }

  /** The schematic drawn once into a picture, which the quad shows in perspective like any other. */
  private bake(drawing: Container, width: number, height: number): Texture {
    // generateTexture rounds the frame's size down to whole units, so the drawing is scaled to pixels first
    const pixels = Math.min(SCHEMATIC_PIXELS, SCHEMATIC_MAX / Math.max(width, height));
    const pixelWidth = Math.max(1, Math.round(width * pixels));
    const pixelHeight = Math.max(1, Math.round(height * pixels));
    drawing.scale.set(pixelWidth / width, pixelHeight / height);
    const holder = new Container({ children: [drawing] });
    const texture = this.app!.renderer.generateTexture({
      target: holder,
      frame: new Rectangle(-pixelWidth / 2, -pixelHeight / 2, pixelWidth, pixelHeight),
      resolution: 1,
      antialias: true,
      textureSourceOptions: { autoGenerateMipmaps: true },
    });
    texture.source.style.maxAnisotropy = 8;
    texture.source.updateMipmaps();
    holder.destroy({ children: true });
    return texture;
  }

  /** Sets the camera's perspective and puts each piece where the engine has it, with its colour, fading and pulse. */
  private place(cc: CameraController): void {
    setPerspective(boardToScreenMatrix(cc.position, this.view(), this.perspective));
    const size = pulse(this.time);
    for (const [gameObject, drawn] of this.drawn) {
      const quad = drawn.quad;
      const image = gameObject.image;
      if (quad === null || image === null) continue;
      const { position, rotation } = gameObject.transform;
      const factor = (gameObject.pulser ? size : 1) * (drawn.token ? pieceScale : 1);
      const placed = [position.x, position.y, rotation, image.sizeDelta.x * factor, image.sizeDelta.y * factor];
      if (placed.some((v, i) => v !== drawn.placed[i])) {
        placeQuad(quad, placed[0]!, placed[1]!, placed[2]!, placed[3]!, placed[4]!);
        drawn.placed = placed;
      }
      quad.alpha = image.color.a;
      quad.tint = tintOf(image.color);
    }
  }

  /** The objects at this board point, topmost first, as Unity's raycast finds them: tokens over tiles, later over earlier. */
  private objectsAt(point: BoardPoint): GameObject[] {
    const hits: GameObject[] = [];
    for (const objects of [board.tokens, board.tiles]) {
      const scale = objects === board.tokens ? pieceScale : 1;
      for (let i = objects.length - 1; i >= 0; i--) {
        const gameObject = objects[i]!;
        const image = gameObject.image;
        if (image === null) continue;
        const { position, rotation } = gameObject.transform;
        const radians = (rotation * Math.PI) / 180;
        const dx = point.x - position.x;
        const dy = point.y - position.y;
        const localX = dx * Math.cos(radians) + dy * Math.sin(radians);
        const localY = -dx * Math.sin(radians) + dy * Math.cos(radians);
        const factor = (gameObject.pulser ? pulse(this.time) : 1) * scale;
        if (Math.abs(localX) <= (image.sizeDelta.x * factor) / 2 && Math.abs(localY) <= (image.sizeDelta.y * factor) / 2) hits.push(gameObject);
      }
    }
    return hits;
  }

  // Only board pieces under the pointer: highlights, monster places and items (tagged dialog) stop the camera
  // Valkyrie: CameraController.cs CameraController.ScrollEnabled
  private scrollEnabled(point: BoardPoint): boolean {
    return this.objectsAt(point).every((gameObject) => gameObject.tag === Game.BOARD);
  }

  private local(e: PointerEvent | WheelEvent): BoardPoint {
    const rect = this.host.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private boardPoint(at: BoardPoint): BoardPoint {
    return screenToBoard(at.x, at.y, Game.get().cc.position, this.view());
  }

  private listen(): void {
    const on = <K extends keyof HTMLElementEventMap>(target: HTMLElement | Window, type: K, handler: (e: HTMLElementEventMap[K]) => void, options?: AddEventListenerOptions) => {
      target.addEventListener(type, handler as EventListener, options);
      this.removeListeners.push(() => target.removeEventListener(type, handler as EventListener, options));
    };
    on(this.host, 'pointerdown', (e) => this.pointerDown(e));
    on(this.host, 'pointermove', (e) => this.pointerMove(e));
    on(this.host, 'pointerup', (e) => this.pointerUp(e, true));
    on(this.host, 'pointercancel', (e) => this.pointerUp(e, false));
    on(this.host, 'lostpointercapture', (e) => this.pointerUp(e, false));
    // Valkyrie: CameraController.FixedUpdate (Mouse ScrollWheel)
    on(
      this.host,
      'wheel',
      (e) => {
        e.preventDefault();
        const at = this.local(e);
        if (this.scrollEnabled(this.boardPoint(at))) {
          this.zoomBy += wheelZoom(wheelAxis(e.deltaY, e.deltaMode));
          this.zoomAt = at;
        }
      },
      { passive: false },
    );
    // Not in Valkyrie: a window folded away to find what its event placed (play/Windows.tsx)
    const showPlaced = (e: Event) => {
      const key = eventOnScreen();
      // The tiles the event on screen placed, where they lie now
      this.newTiles = this.newTiles.filter((t) => this.drawn.has(t.of));
      const tiles = this.newTiles.filter((t) => t.key === key).flatMap((t) => {
        const placed = this.drawn.get(t.of)?.placed ?? [];
        return placed.length > 0 ? [placed] : [];
      });
      const pressed = this.pressedPiece !== null && this.drawn.has(this.pressedPiece.of) ? this.pressedPiece.of : null;
      this.effects.showAgain(key, tiles, (e as CustomEvent<{ x: number; y: number } | undefined>).detail ?? undefined, pressed);
    };
    globalThis.addEventListener(SHOW_PLACED, showPlaced);
    this.removeListeners.push(() => globalThis.removeEventListener(SHOW_PLACED, showPlaced));
    on(window, 'keydown', (e) => this.key(e, true));
    on(window, 'keyup', (e) => this.key(e, false));
    on(window, 'blur', () => {
      this.keys.clear();
      this.shift = false;
    });
  }

  private key(e: KeyboardEvent, down: boolean): void {
    if (e.key === 'Shift') this.shift = down;
    const arrow = ARROWS[e.key];
    if (arrow === undefined) return;
    // Valkyrie: PanCancelInputField sets CameraController.panDisable while the player types
    if (down && e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable="true"]') !== null) return;
    if (down) {
      this.keys.add(arrow);
      e.preventDefault();
    } else {
      this.keys.delete(arrow);
    }
  }

  // Valkyrie: CameraController.cs CameraController.Update (latch positions on mouse down) and FixedUpdate (touches)
  private pointerDown(e: PointerEvent): void {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const at = this.local(e);
    this.pointers.set(e.pointerId, at);
    // Later events of this pointer come here, even over a quest UI element, which then gets no click of its own
    try {
      this.host.setPointerCapture(e.pointerId);
    } catch {
      // The pointer is already gone
    }
    if (this.pointers.size === 1) {
      const point = this.boardPoint(at);
      this.pressed = { at, point, on: e.target, touch: e.pointerType === 'touch', client: { x: e.clientX, y: e.clientY } };
      this.moved = false;
      // latch positions on mouse down, if the camera may move
      this.grabbed = this.scrollEnabled(point) ? point : null;
    } else if (this.pointers.size === 2) {
      // Two touches pinch: no dragging until every touch is gone
      this.pinching = true;
      this.grabbed = null;
      this.pinchDistance = this.touchDistance();
    }
  }

  private pointerMove(e: PointerEvent): void {
    const at = this.local(e);
    if (!this.pointers.has(e.pointerId)) {
      if (e.pointerType === 'mouse') this.host.classList.toggle('over-control', this.controlAt(e.target, this.boardPoint(at)) !== undefined);
      return;
    }
    this.pointers.set(e.pointerId, at);
    if (this.pinching) {
      if (this.pointers.size < 2) return;
      const distance = this.touchDistance();
      // Unity's touch positions are in device pixels
      if (this.scrollEnabled(this.boardPoint(this.pointers.values().next().value!))) {
        this.zoomBy += pinchZoom((distance - this.pinchDistance) * (window.devicePixelRatio || 1));
        const [a, b] = [...this.pointers.values()];
        this.zoomAt = a !== undefined && b !== undefined ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : null;
      }
      this.pinchDistance = distance;
      return;
    }
    // The frame moves the camera (moveCamera); here a press becomes a drag
    if (this.pressed !== null && !this.moved && Math.hypot(at.x - this.pressed.at.x, at.y - this.pressed.at.y) > CLICK_DISTANCE) {
      this.moved = true;
      if (this.grabbed !== null) this.host.classList.add('dragging');
    }
  }

  private pointerUp(e: PointerEvent, released: boolean): void {
    if (!this.pointers.has(e.pointerId)) return;
    const pressed = released && this.pointers.size === 1 && !this.pinching && !this.moved ? this.pressed : null;
    this.pointers.delete(e.pointerId);
    if (pressed !== null && this.click(pressed.touch ? this.touchTarget(pressed.on, pressed.point, pressed.client) : pressed.on, pressed.point) && e.pointerType !== 'mouse')
      swallowClick();
    if (this.pointers.size === 0) {
      // reset the pinching only when no more touch is present to avoid moving the scene
      this.pinching = false;
      this.grabbed = null;
      this.pressed = null;
      this.host.classList.remove('dragging');
    }
  }

  private touchDistance(): number {
    const [a, b] = [...this.pointers.values()];
    return a !== undefined && b !== undefined ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }

  /** What a click would press: a quest UI element over the board, or the topmost piece at that point. */
  private controlAt(target: EventTarget | null, point: BoardPoint): TokenBoard.TokenControl | undefined {
    const element = target instanceof Element ? target.closest<HTMLElement>('[data-quest-ui]') : null;
    if (element !== null) return controlOf(questUIElement(element.dataset.questUi)?.unityObject ?? null);
    return controlOf(this.objectsAt(point)[0] ?? null);
  }

  /**
   * Not in Valkyrie: what a finger pressed (TOUCH_SLOP). The topmost clickable quest UI element near the finger, above
   * the element it landed on, or over the board where it presses nothing; otherwise what it landed on.
   */
  private touchTarget(on: EventTarget | null, point: BoardPoint, client: BoardPoint): EventTarget | null {
    const landed = on instanceof Element ? on.closest<HTMLElement>('[data-quest-ui]') : null;
    if (landed === null && controlOf(this.objectsAt(point)[0] ?? null) !== undefined) return on;
    const elements = [...this.host.querySelectorAll<HTMLElement>('[data-quest-ui]')].reverse();
    for (const element of elements) {
      if (element === landed) break;
      if (!element.classList.contains('clickable')) continue;
      const r = element.getBoundingClientRect();
      if (client.x >= r.left - TOUCH_SLOP && client.x <= r.right + TOUCH_SLOP && client.y >= r.top - TOUCH_SLOP && client.y <= r.bottom + TOUCH_SLOP) return element;
    }
    return on;
  }

  // Valkyrie: TokenBoard.cs TokenControl (button.onClick calls startEvent)
  private click(target: EventTarget | null, point: BoardPoint): boolean {
    const control = this.controlAt(target, point);
    const onBoard = !(target instanceof Element && target.closest('[data-quest-ui]') !== null);
    if (control !== undefined && onBoard && control.c?.unityObject) this.pressedPiece = { of: control.c.unityObject, at: this.time, seen: false };
    if (control !== undefined) run(() => control.startEvent());
    return control !== undefined;
  }
}

/**
 * Not in Valkyrie: after a finger presses a piece, the browser still sends that touch's click, which landed on the
 * window the press just opened and pressed its button (phones and tablets, 16 October 2026): it is dropped.
 */
const SWALLOW_CLICK_MS = 600;

function swallowClick(): void {
  const until = performance.now() + SWALLOW_CLICK_MS;
  const drop = (e: MouseEvent) => {
    window.removeEventListener('click', drop, true);
    if (performance.now() > until) return;
    e.preventDefault();
    e.stopPropagation();
  };
  window.addEventListener('click', drop, true);
  setTimeout(() => window.removeEventListener('click', drop, true), SWALLOW_CLICK_MS);
}
