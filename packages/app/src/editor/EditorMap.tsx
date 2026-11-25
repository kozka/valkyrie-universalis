// The open scenario's map: the board as a game draws it (board/Board.ts), seen from straight above, where pressing a
// piece selects its component and dragging the selected tile, token or door moves it, snapped as Valkyrie's editor
// places it (EditorComponent.MouseDown with GetMouseBoardRounded: TileRound for tiles, SelectionRound for the rest;
// with Shift held, where it is dropped). Dragging anything else, or the empty table, moves the camera, as in a game.
// A grid shows those steps, and a line in a corner where the pointer is and what is under it. Over it, a column of
// tools: the grid and the snapping (off, a piece goes where it is dropped, as with Shift), the zoom, everything in
// view, and the turn of the selected piece, which Ctrl or Alt with the wheel also turns. Not ported from Valkyrie, whose
// editor places a piece with a Position button and a click.
import { useEffect, useRef, useState } from 'react';
import { EditorComponentDoor, EditorComponentTile, EditorComponentToken, Game, Mathf, QUEST_SELECTION, QuestData, Vector3, type GameObject } from '@universalis/engine';
import { getBoardTilt, setBoardTilt } from '../board/Board.ts';
import '../board/board.css';
import { probe } from '../board/BoardView.tsx';
import { run } from '../ui/run.ts';
import { Tool } from './chrome.tsx';
import { Icon, typeIcon } from './Icon.tsx';
import { typeName } from './ComponentList.tsx';
import { EditorBoard } from './EditorBoard.ts';
import { useEditor } from './editorState.ts';
import { toggle, useLayout } from './layout.ts';
import { UIStage } from './UIStage.tsx';
import { DialogShow } from './DialogShow.tsx';
import { change, select } from './session.ts';
import { edi } from './text.ts';

/** A press that moves further than this, in CSS pixels, is a drag (Board's CLICK_DISTANCE). */
const CLICK_DISTANCE = 10;

/** The component an object on the board belongs to. */
function componentOf(gameObject: GameObject): string | null {
  const quest = Game.get().currentQuest;
  if (quest === null) return null;
  for (const [name, item] of quest.boardItems) if (item.unityObject === gameObject) return name;
  return null;
}

/** The topmost component under a point: a mark the editor leaves on the map is not one (EditorComponent.drawOnMap). */
/** Every component under a point: tokens before doors and doors before tiles, as a door's wide picture covers the token by it; else topmost first. */
function componentsAt(board: EditorBoard, point: { x: number; y: number }): string[] {
  const names: string[] = [];
  for (const piece of board.piecesAt(point)) {
    const name = componentOf(piece);
    if (name !== null && !names.includes(name)) names.push(name);
  }
  const components = Game.get().currentQuest?.qd.components;
  const rank = (name: string) => {
    const c = components?.get(name);
    return c instanceof QuestData.Tile ? 2 : c instanceof QuestData.Door ? 1 : 0;
  };
  return names
    .map((name, i) => ({ name, i }))
    .sort((a, b) => rank(a.name) - rank(b.name) || a.i - b.i)
    .map((n) => n.name);
}

/** The piece a press there means: the selected one when it is among them, or else the topmost. */
function componentAt(board: EditorBoard, point: { x: number; y: number }): string | null {
  const names = componentsAt(board, point);
  const selection = Game.get().qed?.selection;
  return names.find((name) => name === selection) ?? names[0] ?? null;
}

/** A click picks the topmost piece; clicking again on the selected one picks the one under it, round and round. */
function componentClicked(board: EditorBoard, point: { x: number; y: number }): string | null {
  const names = componentsAt(board, point);
  const at = names.indexOf(Game.get().qed?.selection ?? '');
  return at < 0 ? (names[0] ?? null) : names[(at + 1) % names.length]!;
}

function movable(component: QuestData.QuestComponent | undefined): component is QuestData.Tile | QuestData.Token | QuestData.Door {
  return component instanceof QuestData.Tile || component instanceof QuestData.Token || component instanceof QuestData.Door;
}

/** Draws a board component again where it now is, as EditorComponent.MouseDown does after a move. */
export function redrawOnBoard(name: string): void {
  const quest = Game.get().currentQuest!;
  quest.remove(name);
  quest.add(name);
  quest.changeAlphaAll();
  quest.changeAlpha(name, 1);
}

/** The selected component, when it is a piece the map turns. */
function selectedPiece(): QuestData.Tile | QuestData.Token | QuestData.Door | null {
  const game = Game.get();
  const component = game.currentQuest?.qd.components.get(game.qed?.selection ?? QUEST_SELECTION);
  return movable(component) ? component : null;
}

/** Turns the selected tile, token or door as its panel's button does in Valkyrie (R), or back (Shift+R). */
export function turnSelected(back = false): void {
  const component = selectedPiece();
  if (component === null) return;
  const name = component.sectionName;
  change(edi('EDITOR_ROTATE_STEP', name), () => {
    // A door has two turns; the others four, so three forward are one back
    const times = back && !(component instanceof QuestData.Door) ? 3 : 1;
    for (let i = 0; i < times; i++) {
      if (component instanceof QuestData.Tile) EditorComponentTile.tileRotate(component);
      else if (component instanceof QuestData.Token) EditorComponentToken.rotate(component);
      else EditorComponentDoor.rotate(component);
    }
    redrawOnBoard(name);
  });
}

/** Where the scenario's pieces are, to bring them all into view. */
function piecePoints(): { x: number; y: number }[] {
  const quest = Game.get().currentQuest;
  if (quest === null) return [];
  const points: { x: number; y: number }[] = [];
  for (const c of quest.qd.components.values()) {
    if (c instanceof QuestData.Tile || c instanceof QuestData.Token || c instanceof QuestData.Door || c instanceof QuestData.MPlace) points.push({ x: c.location.x, y: c.location.y });
  }
  return points;
}

/** The map's board, while it is drawn, for its tools. */
let shownBoard: EditorBoard | null = null;

/** Brings the scenario's pieces into view (the map's tool, and when a scenario opens). */
export function showAllPieces(): void {
  shownBoard?.showAll(piecePoints());
}

interface Drag {
  pointer: number;
  name: string;
  component: QuestData.Tile | QuestData.Token | QuestData.Door;
  start: { x: number; y: number };
  /** Where the component and its object were when the drag began. */
  location: { x: number; y: number };
  object: GameObject | null;
  objectAt: Vector3 | null;
  moved: boolean;
}

/** A board coordinate as an author writes it. */
function coordinate(v: number): string {
  return String(Number(v.toFixed(2)));
}

export function EditorMap() {
  const staged = useEditor((s) => s.stage);
  const showing = useEditor((s) => s.showing);
  const placing = useEditor((s) => s.placing !== null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const [menu, setMenu] = useState<{ x: number; y: number; at: { x: number; y: number } } | null>(null);
  useEffect(() => {
    const host = stage.current!;
    // Seen from above, the way a scenario is laid out; the player's own lean comes back afterwards
    const tilt = getBoardTilt();
    setBoardTilt(0);
    const gameType = Game.get().gameType;
    const board = new EditorBoard(host, canvas.current!, { major: gameType.tileRound(), minor: gameType.selectionRound() });
    board.showGrid(useLayout.getState().grid);
    shownBoard = board;
    // Not in Valkyrie: the scenario opens with all its pieces in view
    void board.start().then(() => {
      if (shownBoard === board) board.showAll(piecePoints());
    });
    window.universalisBoard = probe(board, host);
    const unwatch = useLayout.subscribe((s) => board.showGrid(s.grid));
    /** Whether a dragged piece goes where it is dropped: snapping off, or Shift held while it is on. */
    const free = (e: PointerEvent) => e.shiftKey === useLayout.getState().snap;

    let drag: Drag | null = null;
    let press: { x: number; y: number; pointer: number } | null = null;

    const snapped = (component: QuestData.QuestComponent, x: number, y: number, free: boolean) => {
      if (free) return { x: Math.fround(x), y: Math.fround(y) };
      const game = Game.get();
      const round = component instanceof QuestData.Tile ? game.gameType.tileRound() : game.gameType.selectionRound();
      return { x: Math.fround(round * Mathf.round(x / round)), y: Math.fround(round * Mathf.round(y / round)) };
    };

    // Before the board's own listener on the same element, so that a drag of the selected piece does not pan
    const down = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const point = board.pointAt(e.clientX, e.clientY);
      press = { x: e.clientX, y: e.clientY, pointer: e.pointerId };
      const name = componentAt(board, point);
      const game = Game.get();
      const component = name === null ? undefined : game.currentQuest?.qd.components.get(name);
      if (name === null || name !== game.qed?.selection || !movable(component)) return;
      e.stopPropagation();
      host.setPointerCapture(e.pointerId);
      const object = game.currentQuest!.boardItems.get(name)?.unityObject ?? null;
      drag = {
        pointer: e.pointerId,
        name,
        component,
        start: point,
        location: { x: component.location.x, y: component.location.y },
        object,
        objectAt: object === null ? null : object.transform.position,
        moved: false,
      };
    };
    /** Where the pointer is, as a piece would snap there, and the name of the topmost piece under it. */
    const show = (e: PointerEvent, at: { x: number; y: number }, piece: string | null) => {
      if (status.current === null) return;
      const game = Game.get();
      const round = game.gameType.selectionRound();
      const x = free(e) ? at.x : round * Mathf.round(at.x / round);
      const y = free(e) ? at.y : round * Mathf.round(at.y / round);
      status.current.textContent = `x ${coordinate(x)} · y ${coordinate(y)}` + (piece === null ? '' : ` · ${piece}`);
    };
    const hover = (e: PointerEvent) => {
      if (drag !== null) return;
      const point = board.pointAt(e.clientX, e.clientY);
      const names = componentsAt(board, point);
      show(e, point, names.length === 0 ? null : names.join(' / '));
    };
    const leave = () => {
      if (drag === null && status.current !== null) status.current.textContent = '';
    };
    const move = (e: PointerEvent) => {
      if (drag === null || e.pointerId !== drag.pointer) return;
      if (!drag.moved && press !== null && Math.hypot(e.clientX - press.x, e.clientY - press.y) <= CLICK_DISTANCE) return;
      drag.moved = true;
      const point = board.pointAt(e.clientX, e.clientY);
      const to = snapped(drag.component, drag.location.x + point.x - drag.start.x, drag.location.y + point.y - drag.start.y, free(e));
      // A preview: the object moves; the component moves when it is dropped
      if (drag.object !== null && drag.objectAt !== null) {
        drag.object.transform.position = new Vector3(drag.objectAt.x + to.x - drag.location.x, drag.objectAt.y + to.y - drag.location.y, drag.objectAt.z);
      }
      if (status.current !== null) status.current.textContent = `x ${coordinate(to.x)} · y ${coordinate(to.y)} · ${drag.name}`;
    };
    const up = (e: PointerEvent) => {
      if (press === null || e.pointerId !== press.pointer) return;
      const clicked = Math.hypot(e.clientX - press.x, e.clientY - press.y) <= CLICK_DISTANCE;
      const point = board.pointAt(e.clientX, e.clientY);
      const held = drag;
      drag = null;
      press = null;
      if (held !== null && held.moved) {
        const to = snapped(held.component, held.location.x + point.x - held.start.x, held.location.y + point.y - held.start.y, free(e));
        run(() => {
          if (to.x === held.location.x && to.y === held.location.y) {
            redrawOnBoard(held.name);
            return;
          }
          change(edi('EDITOR_MOVE_STEP', held.name), () => {
            held.component.location.x = to.x;
            held.component.location.y = to.y;
            redrawOnBoard(held.name);
          });
        });
        return;
      }
      if (!clicked) return;
      // Placing an event or a monster place: the press puts it there (Valkyrie's Position button)
      const placing = useEditor.getState().placing;
      const placed = placing === null ? undefined : Game.get().currentQuest?.qd.components.get(placing);
      if (placing !== null && placed !== undefined) {
        const to = snapped(placed, point.x, point.y, free(e));
        useEditor.setState({ placing: null });
        run(() =>
          change(edi('EDITOR_MOVE_STEP', placing), () => {
            placed.location.x = to.x;
            placed.location.y = to.y;
            if (placed instanceof QuestData.MPlace) redrawOnBoard(placing);
          }),
        );
        return;
      }
      // A click selects the topmost piece there, or the quest itself on the empty table
      const name = componentClicked(board, point);
      run(() => select(name ?? QUEST_SELECTION, true));
    };
    // Ctrl or Alt with the wheel turns the selected piece, a notch a quarter; the wheel alone zooms, as in a game
    let turning = 0;
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.altKey) return;
      e.preventDefault();
      e.stopPropagation();
      if (selectedPiece() === null) return;
      turning += e.deltaY;
      if (Math.abs(turning) < 40) return;
      const back = turning < 0;
      turning = 0;
      run(() => turnSelected(back));
    };
    // Not in Valkyrie: a right click offers to make a piece there, as the graph's does
    const context = (e: MouseEvent) => {
      e.preventDefault();
      const rect = host.getBoundingClientRect();
      setMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top, at: board.pointAt(e.clientX, e.clientY) });
    };
    host.addEventListener('contextmenu', context);
    host.addEventListener('wheel', wheel, { capture: true, passive: false });
    host.addEventListener('pointerdown', down, { capture: true });
    host.addEventListener('pointermove', hover);
    host.addEventListener('pointerleave', leave);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      unwatch();
      if (shownBoard === board) shownBoard = null;
      host.removeEventListener('contextmenu', context);
      host.removeEventListener('wheel', wheel, { capture: true });
      host.removeEventListener('pointerdown', down, { capture: true });
      host.removeEventListener('pointermove', hover);
      host.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      board.destroy();
      setBoardTilt(tilt);
    };
  }, []);
  return (
    <div className="editor-map-box">
      <div className={'board-stage editor-map' + (placing ? ' editor-map-placing' : '')} ref={stage}>
        <div className="board-canvas" ref={canvas} />
        <p className="editor-map-status" ref={status} aria-hidden="true" />
      </div>
      {menu !== null && <MapMenu menu={menu} onClose={() => setMenu(null)} />}
      <MapTools />
      {staged && <UIStage />}
      {showing && <DialogShow />}
    </div>
  );
}

/** What a right click on the map makes: a piece there, or a component the map does not place. */
function MapMenu({ menu, onClose }: { menu: { x: number; y: number; at: { x: number; y: number } }; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const away = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) onClose();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('pointerdown', away, true);
    window.addEventListener('keydown', key);
    box.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => {
      window.removeEventListener('pointerdown', away, true);
      window.removeEventListener('keydown', key);
    };
  }, [onClose]);
  const game = Game.get();
  const d2e = game.gameType.typeName() === 'D2E';
  const placed = ['Tile', 'Token', ...(d2e ? ['Door', 'MPlace'] : [])];
  const types = [...placed, 'Event', 'Spawn', 'UI', 'QItem', ...(d2e ? [] : ['Puzzle'])];
  const make = (type: string) => {
    onClose();
    run(() =>
      change(edi('EDITOR_NEW_COMPONENT', typeName(type)), () => {
        game.qed!.newComponent(type);
        const name = game.qed!.selection;
        const component = name === null ? undefined : game.currentQuest!.qd.components.get(name);
        if (component === undefined || !placed.includes(type)) return;
        const round = type === 'Tile' ? game.gameType.tileRound() : game.gameType.selectionRound();
        component.location.x = Math.fround(round * Mathf.round(menu.at.x / round));
        component.location.y = Math.fround(round * Mathf.round(menu.at.y / round));
        redrawOnBoard(name!);
      }),
    );
  };
  return (
    <div className="editor-menu-list editor-map-menu" role="menu" aria-label={edi('EDITOR_MAP_CREATE')} ref={box} style={{ left: menu.x, top: menu.y }}>
      {types.map((type) => (
        <button key={type} type="button" role="menuitem" onClick={() => make(type)}>
          <Icon name={typeIcon(type)} />
          <span>{typeName(type)}</span>
        </button>
      ))}
    </div>
  );
}

/** The map's tools, beside it rather than on the board, so that pressing one is never a press on the board. */
function MapTools() {
  const grid = useLayout((s) => s.grid);
  const snap = useLayout((s) => s.snap);
  useEditor((s) => s.revision);
  const piece = selectedPiece() !== null;
  return (
    <div className="editor-map-tools" role="toolbar" aria-label={edi('EDITOR_MAP_TOOLS')} aria-orientation="vertical">
      <Tool icon="grid" label={edi('EDITOR_GRID')} keys="G" pressed={grid} onClick={() => toggle('grid')} />
      <Tool icon="magnet" label={edi('EDITOR_SNAP')} keys="M" pressed={snap} onClick={() => toggle('snap')} />
      <span className="editor-tools-gap" />
      <Tool icon="zoomIn" label={edi('EDITOR_ZOOM_IN')} keys="+" onClick={() => shownBoard?.zoom(1)} />
      <Tool icon="zoomOut" label={edi('EDITOR_ZOOM_OUT')} keys="−" onClick={() => shownBoard?.zoom(-1)} />
      <Tool icon="focus" label={edi('EDITOR_SHOW_ALL')} keys="F" onClick={showAllPieces} />
      <span className="editor-tools-gap" />
      <Tool icon="ui" label={edi('EDITOR_STAGE')} onClick={() => useEditor.setState({ stage: true, showing: false })} />
      <span className="editor-tools-gap" />
      <Tool icon="rotateBack" label={edi('EDITOR_TURN_BACK')} keys={edi('EDITOR_KEY_SHIFT') + '+R'} disabled={!piece} onClick={() => run(() => turnSelected(true))} />
      <Tool icon="rotate" label={edi('EDITOR_TURN')} keys="R" disabled={!piece} onClick={() => run(() => turnSelected())} />
    </div>
  );
}
