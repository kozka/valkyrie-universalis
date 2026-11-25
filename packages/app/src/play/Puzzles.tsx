// The slide, picture and tower puzzles, drawn from the engine's windows (PuzzleSlideWindow, PuzzleImageWindow and
// PuzzleTowerWindow), with the pointer doing what Valkyrie's BlockSlider and IUpdateListener do. Rewritten from
// Valkyrie's Unity drawing: sizes in its UI units (the screen is 30 high), shrunk to fit narrow screens.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode, type RefObject } from 'react';
import {
  CommonStringKeys,
  EventManager,
  StringKey,
  type PuzzleImage,
  type PuzzleImageWindow,
  type PuzzleSlideWindow,
  type PuzzleTowerWindow,
  type QuestData,
} from '@universalis/engine';
import { pictureUrl } from '../board/pictures.ts';
import { RichText } from '../ui/RichText.tsx';
import { ButtonRow } from './ButtonRow.tsx';
import { run } from '../ui/run.ts';
import { uni } from '../ui/text.ts';

/** Pixels in one of Valkyrie's UI units: a thirtieth of the screen's height, or less when a 29-unit window is too wide. */
function screenUnit(): number {
  return Math.min(window.innerHeight / 30, (window.innerWidth - 24) / 29);
}

/**
 * The unit a puzzle is drawn at, and the frame it fits. Not in Valkyrie (11 November 2026): Valkyrie's unit leaves no room
 * for the frame, the counts, the buttons and the phase bar, which are in the player's text size, so on a short screen or
 * with large text the puzzle spilled out of its window over the bar: it is made smaller until the window holds it all.
 */
function usePuzzleUnit(): { unit: number; frame: RefObject<HTMLElement | null> } {
  const frame = useRef<HTMLElement>(null);
  const [unit, setUnit] = useState(screenUnit);
  // From Valkyrie's size again whenever the room for the windows changes (the screen turns, the phase bar grows), then smaller
  useEffect(() => {
    const room = frame.current?.parentElement;
    if (room === null || room === undefined) return;
    let size = '';
    const watch = new ResizeObserver(() => {
      const now = `${room.clientWidth}x${room.clientHeight}`;
      if (now !== size && size !== '') setUnit(screenUnit());
      size = now;
    });
    watch.observe(room);
    return () => watch.disconnect();
  }, []);
  useLayoutEffect(() => {
    const fit = () => {
      const box = frame.current;
      if (box === null || box.scrollHeight === 0 || box.scrollWidth === 0) return;
      const ratio = Math.min(box.clientHeight / box.scrollHeight, box.clientWidth / box.scrollWidth);
      // Only while the puzzle is what does not fit: beside taller counts, a smaller puzzle wins no room
      const puzzle = box.querySelector('.slide-board, .image-board, .tower-row');
      const row = puzzle?.parentElement;
      const tallest = puzzle !== null && puzzle !== undefined && row !== null && row !== undefined && [...row.children].every((c) => c === puzzle || c.getBoundingClientRect().height <= puzzle.getBoundingClientRect().height + 1 || c.getBoundingClientRect().top >= puzzle.getBoundingClientRect().bottom);
      if (ratio < 0.995 && tallest) setUnit((u) => Math.max(screenUnit() * 0.35, u * ratio * 0.98));
    };
    fit();
    // The words change size when the game's fonts arrive
    let live = true;
    void document.fonts?.ready.then(() => live && fit());
    return () => {
      live = false;
    };
  });
  return { unit, frame };
}

/** Valkyrie's puzzles answer the left button only (GetMouseButtonDown(0)), and a touch is its first finger. */
function leftButton(e: PointerEvent): boolean {
  return e.button === 0 && e.isPrimary;
}

/** The skill to test, and the moves of this time and in all, as each puzzle window shows them. */
function PuzzleCounts({ puzzle, moves, total }: { puzzle: QuestData.Puzzle; moves: number; total: number }) {
  return (
    <div className="puzzle-counts">
      <p>
        {new StringKey('val', 'X_COLON', CommonStringKeys.SKILL).translate()}{' '}
        <span className="card">
          <RichText text={EventManager.outputSymbolReplace(puzzle.skill)} />
        </span>
      </p>
      <p>
        {new StringKey('val', 'X_COLON', CommonStringKeys.MOVES).translate()} <span className="card">{moves}</span>
      </p>
      <p>
        {new StringKey('val', 'X_COLON', CommonStringKeys.TOTAL_MOVES).translate()} <span className="card">{total}</span>
      </p>
    </div>
  );
}

/** Close, greyed once solved, and the event's first button, greyed until then. */
function PuzzleButtons({ solved, finishLabel, close, finished }: { solved: boolean; finishLabel: StringKey; close: () => void; finished: () => void }) {
  return (
    <ButtonRow>
      <button type="button" className="button event-button" disabled={solved} onClick={() => run(close)}>
        {CommonStringKeys.CLOSE.translate()}
      </button>
      <button type="button" className="button event-button" disabled={!solved} onClick={() => run(finished)}>
        <RichText text={finishLabel.translate()} />
      </button>
    </ButtonRow>
  );
}

function PuzzleFrame({ name, className, frame, children }: { name: string; className: string; frame: RefObject<HTMLElement | null>; children: ReactNode }) {
  return (
    <section ref={frame} className={`window panel puzzle-window ${className}`} role="dialog" aria-modal="false" aria-label={name}>
      {children}
    </section>
  );
}

// Valkyrie: PuzzleSlideWindow.cs PuzzleSlideWindow.CreateWindow, DrawSlideFrame and CreateBlock, and BlockSlider
export function PuzzleSlideView({ window }: { window: PuzzleSlideWindow }) {
  const puzzle = window.puzzle;
  const { unit, frame } = usePuzzleUnit();
  const square = 3 * unit;
  const [drag, setDrag] = useState<{ index: number; pointer: number; start: number; position: number } | null>(null);
  return (
    <PuzzleFrame name={window.questPuzzle.sectionName} className="slide-window" frame={frame}>
      <div className="puzzle-play">
        {/* Six squares by six, and the exit two squares long on the third row */}
        <div className="slide-board" style={{ width: 8 * square, height: 6 * square }} role="group" aria-label={uni('PUZZLE_BLOCKS')}>
          <svg className="slide-frame" viewBox="0 0 8 6" aria-hidden="true">
            <path d="M6 2V0H0V6H6V3H8V2Z" />
          </svg>
          {puzzle.puzzle.map((block, index) => {
            const position = drag?.index === index ? drag.position : block.rotation ? block.ypos : block.xpos;
            /** Where the block follows the pointer to, in squares, as BlockSlider.Update places it each frame. */
            const follow = (e: PointerEvent<HTMLDivElement>, from: number) => window.dragPosition(block, ((block.rotation ? e.clientY : e.clientX) - from) / square);
            const style: CSSProperties = {
              left: (block.rotation ? block.xpos : position) * square,
              top: (block.rotation ? position : block.ypos) * square,
              width: (block.xlen + 1) * square,
              height: (block.ylen + 1) * square,
            };
            return (
              <div
                key={index}
                className={block.target ? 'slide-block target' : 'slide-block'}
                style={style}
                role="img"
                aria-label={uni(block.target ? 'PUZZLE_TARGET_BLOCK' : 'PUZZLE_BLOCK')}
                data-block={index}
                onPointerDown={(e) => {
                  if (!leftButton(e) || drag !== null) return;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  // The frame the button goes down already keeps the block within its limits
                  const start = block.rotation ? e.clientY : e.clientX;
                  setDrag({ index, pointer: e.pointerId, start, position: follow(e, start) });
                }}
                onPointerMove={(e) => {
                  if (drag?.index !== index || drag.pointer !== e.pointerId) return;
                  setDrag({ ...drag, position: follow(e, drag.start) });
                }}
                onPointerUp={(e) => {
                  if (drag?.index !== index || drag.pointer !== e.pointerId) return;
                  setDrag(null);
                  const at = follow(e, drag.start);
                  run(() => window.release(block, at));
                }}
                // A touch the browser takes over ends where the block is, as a released button does in Unity
                onPointerCancel={(e) => {
                  if (drag?.index !== index || drag.pointer !== e.pointerId) return;
                  setDrag(null);
                  run(() => window.release(block, drag.position));
                }}
              />
            );
          })}
        </div>
        <PuzzleCounts puzzle={window.questPuzzle} moves={puzzle.moves - window.lastMoves} total={puzzle.moves} />
      </div>
      <PuzzleButtons solved={puzzle.solved()} finishLabel={window.finishLabel} close={() => window.close()} finished={() => window.finished()} />
    </PuzzleFrame>
  );
}

// Valkyrie: PuzzleImageWindow.cs PuzzleImageWindow.CreateWindow and Draw, BlockSlider and FadeIn
export function PuzzleImageView({ window }: { window: PuzzleImageWindow }) {
  const puzzle = window.puzzle;
  const { unit, frame } = usePuzzleUnit();
  const texture = window.texture;
  const columns = window.questPuzzle.puzzleLevel;
  const rows = window.questPuzzle.puzzleAltLevel;
  const pieceWidth = window.width * unit;
  const pieceHeight = window.height * unit;
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    void pictureUrl(texture.name).then((u) => live && setUrl(u));
    return () => {
      live = false;
    };
  }, [texture.name]);
  const [drag, setDrag] = useState<{
    piece: PuzzleImage.TilePosition;
    pointer: number;
    x: number;
    y: number;
    offset: { x: number; y: number };
  } | null>(null);
  const solved = puzzle.solved();
  const fade = window.fadeSpeed(solved);
  return (
    <PuzzleFrame name={window.questPuzzle.sectionName} className="image-window" frame={frame}>
      <div className="puzzle-play">
        <div className="image-board" style={{ width: columns * pieceWidth, height: rows * pieceHeight }} role="group" aria-label={uni('PUZZLE_PIECES')}>
          {[...puzzle.state].map(([screen, picture]) => {
            // In UI units, as BlockSlider measures it
            const offset = drag?.piece === screen ? drag.offset : { x: 0, y: 0 };
            const rect = window.pieceRect(picture.x, picture.y);
            const number = picture.x + picture.y * columns + 1;
            let style: CSSProperties = {
              left: screen.x * pieceWidth + offset.x * unit,
              top: screen.y * pieceHeight + offset.y * unit,
              width: pieceWidth,
              height: pieceHeight,
              zIndex: drag?.piece === screen ? 1 : undefined,
              animationDuration: fade !== null ? `${1 / fade}s` : undefined,
            };
            if (url !== null) {
              // Unity counts the picture's rows from the bottom
              const sx = pieceWidth / rect.width;
              const sy = pieceHeight / rect.height;
              style = {
                ...style,
                backgroundImage: `url(${url})`,
                backgroundSize: `${texture.width * sx}px ${texture.height * sy}px`,
                backgroundPosition: `${-rect.x * sx}px ${-(texture.height - rect.y - rect.height) * sy}px`,
              };
            }
            return (
              <div
                // Drawn again after each move, fading in again as Valkyrie's new pieces do
                key={`${picture.x} ${picture.y} ${puzzle.moves}`}
                className={`image-piece ${fade !== null ? 'fading' : ''} ${solved ? 'solved' : ''}`}
                style={style}
                role="img"
                aria-label={uni('PUZZLE_PIECE', number)}
                data-piece={number}
                onPointerDown={(e) => {
                  // A solved picture has no BlockSlider
                  if (solved || !leftButton(e) || drag !== null) return;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setDrag({ piece: screen, pointer: e.pointerId, x: e.clientX, y: e.clientY, offset: { x: 0, y: 0 } });
                }}
                onPointerMove={(e) => {
                  if (drag?.piece !== screen || drag.pointer !== e.pointerId) return;
                  setDrag({ ...drag, offset: window.dragOffset(screen, (e.clientX - drag.x) / unit, (e.clientY - drag.y) / unit) });
                }}
                onPointerUp={(e) => {
                  if (drag?.piece !== screen || drag.pointer !== e.pointerId) return;
                  setDrag(null);
                  const dropped = window.dragOffset(screen, (e.clientX - drag.x) / unit, (e.clientY - drag.y) / unit);
                  run(() => window.release(screen, dropped));
                }}
                // A touch the browser takes over ends where the piece is, as a released button does in Unity
                onPointerCancel={(e) => {
                  if (drag?.piece !== screen || drag.pointer !== e.pointerId) return;
                  setDrag(null);
                  run(() => window.release(screen, drag.offset));
                }}
              >
                {/* Without the picture (no official import), each piece shows its place in it */}
                {url === null && <span className="image-number">{number}</span>}
              </div>
            );
          })}
        </div>
        <PuzzleCounts puzzle={window.questPuzzle} moves={puzzle.moves - window.previousMoves} total={puzzle.moves} />
      </div>
      <PuzzleButtons solved={solved} finishLabel={window.finishLabel} close={() => window.close()} finished={() => window.finished()} />
    </PuzzleFrame>
  );
}

// Valkyrie: PuzzleTowerWindow.cs PuzzleTowerWindow.CreateWindow, CreateTower and CreateBlock, Click and Update
export function PuzzleTowerView({ window }: { window: PuzzleTowerWindow }) {
  const puzzle = window.puzzle;
  const { unit, frame } = usePuzzleUnit();
  const boxes = useRef<(HTMLDivElement | null)[]>([]);
  const pointer = useRef(-1);
  /** The tower whose box is under the pointer (the last one, where two boxes touch), or -1. */
  const towerAt = (x: number, y: number) =>
    boxes.current.findLastIndex((box) => {
      const r = box?.getBoundingClientRect();
      return r !== undefined && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });
  /** The pointer went up, or the browser took the touch over: the move is made where it was shown. */
  const release = (e: PointerEvent<HTMLDivElement>, at: number) => {
    if (window.startDragTower < 0 || e.pointerId !== pointer.current) return;
    pointer.current = -1;
    run(() => {
      window.hover(at);
      window.release();
    });
  };
  return (
    <PuzzleFrame name={window.questPuzzle.sectionName} className="tower-window" frame={frame}>
      <div
        className="tower-row"
        role="group"
        aria-label={uni('PUZZLE_TOWERS')}
        onPointerDown={(e) => {
          const tower = towerAt(e.clientX, e.clientY);
          if (tower < 0 || !leftButton(e) || window.startDragTower >= 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          pointer.current = e.pointerId;
          run(() => window.click(tower));
        }}
        onPointerMove={(e) => {
          if (window.startDragTower < 0 || e.pointerId !== pointer.current) return;
          run(() => window.hover(towerAt(e.clientX, e.clientY)));
        }}
        onPointerUp={(e) => release(e, towerAt(e.clientX, e.clientY))}
        onPointerCancel={(e) => release(e, window.hoverTower)}
      >
        {window.puzzleDisplay.map((tower, i) => (
          <div
            key={i}
            ref={(box) => {
              boxes.current[i] = box;
            }}
            className="tower-box"
            style={{ width: 9 * unit, height: 16.5 * unit, gap: 0.5 * unit, paddingBottom: 0.5 * unit }}
            role="list"
            aria-label={uni('PUZZLE_TOWER', i + 1)}
            data-tower={i}
          >
            {tower.map((size, k) => (
              <span key={k} className="tower-block" role="listitem" aria-label={String(size + 1)} style={{ width: (size + 1.5) * unit, height: 1.5 * unit }} />
            ))}
          </div>
        ))}
      </div>
      <PuzzleCounts puzzle={window.questPuzzle} moves={puzzle.moves - window.lastMoves} total={puzzle.moves} />
      <PuzzleButtons solved={puzzle.solved()} finishLabel={window.finishLabel} close={() => window.close()} finished={() => window.finished()} />
    </PuzzleFrame>
  );
}
