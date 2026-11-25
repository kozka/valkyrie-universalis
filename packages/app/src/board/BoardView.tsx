// The board on the quest screen: the PixiJS canvas (Board.ts) with the quest's UI elements over it. Not ported from
// Valkyrie. In development it also answers the end-to-end tests, which need to know where the pieces are.
import { useEffect, useRef, useState } from 'react';
import { Game } from '@universalis/engine';
import { uni } from '../ui/text.ts';
import { Board, controlOf, setBoardTilt } from './Board.ts';
import { LossCounter, REBUILD_DELAY_MS } from './contextLoss.ts';
import type { BoardProbe } from './probe.ts';
import { QuestUILayer } from './QuestUILayer.tsx';
import { board } from './registry.ts';
import './board.css';

declare global {
  interface Window {
    universalisBoard?: BoardProbe;
  }
}

export function probe(view: Board, stage: HTMLElement): BoardProbe {
  return {
    tiles: () => board.tiles.map((o) => o.name),
    pictured: () => view.pictured(),
    drawn: () => view.drawnPieces(),
    clickable: () => {
      const rect = stage.getBoundingClientRect();
      return board.tokens
        .filter((o) => controlOf(o) !== undefined)
        .map((o) => {
          const at = view.screenOf(o.transform.position);
          return { name: o.name, x: rect.left + at.x, y: rect.top + at.y };
        });
    },
    tokenObjects: () => board.tokens.map((o) => ({ name: o.name, tag: o.tag, x: o.transform.position.x, y: o.transform.position.y })),
    camera: () => {
      const { x, y, z } = Game.get().cc.position;
      return { x, y, z };
    },
    pointOnPage: (x, y) => {
      const rect = stage.getBoundingClientRect();
      const at = view.screenOf({ x, y });
      return { x: rect.left + at.x, y: rect.top + at.y };
    },
    tilt: setBoardTilt,
  };
}

export function BoardView() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [noWebGL, setNoWebGL] = useState(false);
  // Not in Valkyrie (15 November 2026): each loss of the WebGL context makes a new board (contextLoss.ts)
  const [generation, setGeneration] = useState(0);
  const [lostForGood, setLostForGood] = useState(false);
  const losses = useRef(new LossCounter());
  useEffect(() => {
    const view = new Board(stage.current!, canvas.current!);
    let rebuild: ReturnType<typeof setTimeout> | undefined;
    let whenVisible: (() => void) | null = null;
    view.onContextLost = () => {
      if (!losses.current.allow(performance.now())) {
        setLostForGood(true);
        return;
      }
      const again = () => {
        rebuild = setTimeout(() => setGeneration((g) => g + 1), REBUILD_DELAY_MS);
      };
      if (document.visibilityState === 'visible') {
        again();
        return;
      }
      // A page in the background is not given a context: the board is made when it comes back
      whenVisible = () => {
        if (document.visibilityState !== 'visible') return;
        document.removeEventListener('visibilitychange', whenVisible!);
        whenVisible = null;
        again();
      };
      document.addEventListener('visibilitychange', whenVisible);
    };
    // Not in Valkyrie (6 November 2026): without WebGL there is no board, and the player is told why
    view.start().catch((error: unknown) => {
      if (!String(error).includes('No available renderer')) throw error;
      console.warn('The board cannot be drawn:', error);
      setNoWebGL(true);
    });
    if (import.meta.env.DEV) window.universalisBoard = probe(view, stage.current!);
    return () => {
      clearTimeout(rebuild);
      if (whenVisible !== null) document.removeEventListener('visibilitychange', whenVisible);
      view.destroy();
    };
  }, [generation]);
  return (
    <div className="board-stage" ref={stage}>
      <div className="board-canvas" ref={canvas} />
      {noWebGL && (
        <p className="board-no-webgl card" role="alert">
          {uni('NO_WEBGL')}
        </p>
      )}
      {lostForGood && (
        <p className="board-no-webgl card" role="alert">
          {uni('BOARD_LOST')}
        </p>
      )}
      <QuestUILayer />
    </div>
  );
}
