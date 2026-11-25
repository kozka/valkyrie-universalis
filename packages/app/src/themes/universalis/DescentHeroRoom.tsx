// Descent's and DooM's hero selection in the Universalis theme (kozka's designs, 31 October and 2 November 2026): a
// room of his behind, alive with PixiJS (descentRoomArt.ts, the dwarven hall of runes; doomRoomArt.ts, the ship's bridge), and over it his
// frames cut in pieces (brand/d2e-hero-room/ and brand/doom-hero-room/, make_pieces.py): eight portraits a page under
// the title's banner, turned with the arrows or the dots; and at the bottom Back, the plate of the heroes chosen and
// Confirm, each button its own piece of the frames. Each game's look says where its pieces go (RoomLook; DooM's in
// DoomHeroRoom.tsx). The plate takes as many circles as the quest takes heroes, lit for as many as it asks for: from
// one to ten, smaller past five. A hero chosen turns grey in its frame and flies, burning, into its circle, which flares
// as it lands; Confirm burns once there are enough. Built as Mansions' room (HeroRoom.tsx), whose rules it keeps, which
// are Valkyrie's: a press chooses (HeroSelection.Select), a press on a chosen one's circle lets it go
// (HeroCanvas.HeroDiag), and Confirm is always live (HeroCanvas.EndSection). Not ported from Valkyrie.
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { CommonStringKeys, Game, GameStateManager, HeroData, type HeroSelection, type Quest } from '@universalis/engine';
import stillUrl from '../../assets/d2e-heroes-room-still.webp';
import titleUrl from '../../assets/d2e-heroes-title.webp';
import ringsUrl from '../../assets/d2e-heroes-rings.webp';
import previousUrl from '../../assets/d2e-heroes-previous.webp';
import nextUrl from '../../assets/d2e-heroes-next.webp';
import backUrl from '../../assets/d2e-heroes-back.webp';
import confirmUrl from '../../assets/d2e-heroes-confirm.webp';
import plateUrl from '../../assets/d2e-heroes-plate.webp';
import circleLitUrl from '../../assets/d2e-heroes-circle-lit.webp';
import circleDarkUrl from '../../assets/d2e-heroes-circle-dark.webp';
import ringLitUrl from '../../assets/d2e-heroes-ring-lit.webp';
import ringDarkUrl from '../../assets/d2e-heroes-ring-dark.webp';
import diamondUrl from '../../assets/d2e-heroes-diamond.webp';
import type { Art } from '../themes.ts';
import { Picture } from '../../ui/Picture.tsx';
import { run } from '../../ui/run.ts';
import { nameOf, uni, val } from '../../ui/text.ts';
import { Ripple, roomMoves, useFit } from './HeroRoom.tsx';
import { DescentRoomArt } from './descentRoomArt.ts';
import './descentHeroRoom.css';

/** The stage is the room's picture, 1672×941: every place on it as x, y, width, height. */
export type Box = readonly [number, number, number, number];
const STAGE_W = 1672;
const STAGE_H = 941;

/** A piece of the frames: its picture, its place, and the picture of its lights alone, which flicker. */
export interface Piece {
  url: string;
  box: Box;
  glow?: string;
}

/** A portrait's frame: its part of the frames' sheet, its place, its hole and its name plate on the stage. */
export interface Tile {
  box: Box;
  sheet: Box;
  hole: Box;
  plate: Box;
}

/** Where a game's pieces go, and what lives behind them. */
export interface RoomLook {
  look: 'd2e' | 'doom';
  Art: new (host: HTMLElement) => Art;
  still: string;
  title: Piece & { text: Box };
  dots: Box;
  sheet: { url: string; glow?: string; width: number; height: number };
  tiles: readonly Tile[];
  /** The holes' shape: round, or this picture's alpha. */
  holeMask?: string;
  previous: Piece;
  next: Piece;
  back: Piece & { text: Box };
  confirm: Piece & { text: Box };
  plate: Piece;
  circles: {
    /** Their middle, their room on the plate, two of them middle to middle, and the lit one's size. */
    x: number;
    y: number;
    room: number;
    step: number;
    size: number;
    /** The dark one's size, and where a portrait goes in a circle, in percent of the lit one. */
    dark: number;
    inset: number;
    diamond: number;
    lit: string;
    darkUrl: string;
    ringLit: string;
    ringDark: string;
    diamondUrl: string;
  };
  /** Gems that glint now and then: x, y and size. */
  gems: readonly (readonly [number, number, number])[];
}

/** How long a chosen hero takes to fly into its circle. */
const FLIGHT_MS = 900;

/** A box of the stage as a place on it, in percent. */
export function at([x, y, w, h]: Box): CSSProperties {
  return { left: `${(x / STAGE_W) * 100}%`, top: `${(y / STAGE_H) * 100}%`, width: `${(w / STAGE_W) * 100}%`, height: `${(h / STAGE_H) * 100}%` };
}

/** A box of the stage as a place inside another, in percent of that one. */
function within([x, y, w, h]: Box, [ox, oy, ow, oh]: Box): CSSProperties {
  return { left: `${((x - ox) / ow) * 100}%`, top: `${((y - oy) / oh) * 100}%`, width: `${(w / ow) * 100}%`, height: `${(h / oh) * 100}%` };
}

/** A part of the frames' sheet as a background. */
function sheetPart(url: string, width: number, height: number, [x, y, w, h]: Box): CSSProperties {
  return {
    backgroundImage: `url("${url}")`,
    backgroundSize: `${(width / w) * 100}% ${(height / h) * 100}%`,
    backgroundPosition: `${(x / (width - w || 1)) * 100}% ${(y / (height - h || 1)) * 100}%`,
  };
}

/** A point of the stage, with a size, as a glint's place. */
function glintAt(x: number, y: number, size: number, i: number): CSSProperties {
  const s = 30 * size;
  return { ...at([x - s / 2, y - s / 2, s, s]), animationDelay: `${-((i * 1.93) % 7.3).toFixed(2)}s`, animationDuration: `${(5.5 + ((i * 0.77) % 3)).toFixed(2)}s` };
}

/** A piece's lights, over it, flickering out of step with the others. */
function Glow({ url, i }: { url: string | undefined; i: number }) {
  if (url === undefined) return null;
  return <img className="frame-room-glow" src={url} alt="" draggable={false} style={{ animationDelay: `${-((i * 2.71) % 9).toFixed(2)}s`, animationDuration: `${(7 + ((i * 1.3) % 5)).toFixed(2)}s` }} />;
}

/** The circles of the bar for a quest of up to `count` heroes: their middles and how big they are, from 1. */
function circlesFor(look: RoomLook, count: number): { xs: number[]; scale: number; step: number } {
  const { x, room, step: full } = look.circles;
  const n = Math.max(1, Math.min(10, count));
  const step = Math.min(full, room / n);
  const xs = Array.from({ length: n }, (_, i) => x + (i - (n - 1) / 2) * step);
  return { xs, scale: step / full, step };
}

/** The room, alive, behind the frames; the still picture under it until it draws, or if it cannot. */
function Backdrop({ look }: { look: RoomLook }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!roomMoves()) return;
    const art = new look.Art(host.current!);
    void art.start();
    return () => art.destroy();
  }, [look]);
  return <div className="frame-room-art" ref={host} style={{ backgroundImage: `url("${look.still}")` }} aria-hidden="true" />;
}

/** One flight: from the frame to the circle, as boxes of the screen. */
interface Flight {
  hero: string;
  file: string;
  from: DOMRect;
  to: DOMRect;
}

/** The chosen hero's picture flying from its frame into its circle, burning and shimmering in the heat as it goes. */
function Flyer({ flight, stage, done }: { flight: Flight; stage: DOMRect; done: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = `heat-${useId().replace(/:/g, '')}`;
  const { from, to } = flight;
  const finished = useRef(done);
  finished.current = done;
  useLayoutEffect(() => {
    const element = ref.current;
    if (element === null) return;
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const sx = from.width / to.width;
    const sy = from.height / to.height;
    if (!Number.isFinite(sx) || !Number.isFinite(sy)) return void finished.current();
    const animation = element.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, filter: 'brightness(1) saturate(1)' },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - to.height * 0.9}px) scale(${(sx + 1) / 2 + 0.2}) rotate(-6deg)`, filter: 'brightness(1.5) saturate(1.4)', offset: 0.45 },
        { transform: 'none', filter: 'brightness(1) saturate(1)' },
      ],
      { duration: FLIGHT_MS, easing: 'cubic-bezier(0.5, 0, 0.3, 1)' },
    );
    animation.onfinish = () => finished.current();
    return () => animation.cancel();
  }, [from, to]);
  return (
    <div ref={ref} className="frame-room-flyer" aria-hidden="true" style={{ left: to.left - stage.left, top: to.top - stage.top, width: to.width, height: to.height }}>
      <Ripple id={id} ms={FLIGHT_MS} />
      <span className="frame-room-flyer-picture" style={{ filter: `url(#${id})` }}>
        <Picture file={flight.file} name="" decorative />
      </span>
    </div>
  );
}

/** Sparks thrown from a circle as a hero lands in it. */
function Sparks() {
  return (
    <span className="frame-room-sparks" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <i key={i} style={{ '--angle': `${i * 36 + (i % 3) * 9}deg`, '--far': `${70 + ((i * 37) % 45)}%`, animationDelay: `${(i % 4) * 0.03}s` } as CSSProperties} />
      ))}
    </span>
  );
}

/** A piece of the frames as a picture on the stage. */
function PieceImage({ piece, className = '' }: { piece: Piece; className?: string }) {
  return (
    <span className={`frame-room-piece ${className}`} style={at(piece.box)}>
      <img src={piece.url} alt="" draggable={false} />
      <Glow url={piece.glow} i={piece.box[0]} />
    </span>
  );
}

// Valkyrie: Game.cs Game.StartQuest (title, back and finished) and HeroSelection.cs HeroSelection.Draw
export function FramedHeroRoom({ look, quest, selection, heroes }: { look: RoomLook; quest: Quest; selection: HeroSelection | null; heroes: string[] }) {
  const game = Game.get();
  const stage = useRef<HTMLDivElement>(null);
  const page = look.tiles.length;
  const [shownPage, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(heroes.length / page));
  const shown = Math.min(shownPage, pages - 1);
  const [turning, setTurning] = useState<'left' | 'right' | null>(null);
  const goTo = (next: number) => {
    const to = Math.min(pages - 1, Math.max(0, next));
    if (to === shown) return;
    setTurning(to > shown ? 'right' : 'left');
    setPage(to);
  };
  // As in Mansions' room: on a touch screen a sideways swipe turns the page, and presses nothing
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const swipeStart = (e: ReactPointerEvent) => {
    swiped.current = false;
    swipe.current = e.pointerType === 'mouse' || !e.isPrimary ? null : { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const swipeEnd = (e: ReactPointerEvent) => {
    const from = swipe.current;
    swipe.current = null;
    if (from === null || from.id !== e.pointerId) return;
    const dx = e.clientX - from.x;
    const far = Math.max(40, (stage.current?.clientWidth ?? 0) * 0.06);
    if (Math.abs(dx) < far || Math.abs(dx) < Math.abs(e.clientY - from.y) * 1.5) return;
    swiped.current = true;
    goTo(shown + (dx < 0 ? 1 : -1));
  };
  const noPressAfterSwipe = (e: ReactMouseEvent) => {
    if (!swiped.current) return;
    swiped.current = false;
    e.preventDefault();
    e.stopPropagation();
  };
  useEffect(() => {
    if (turning === null) return;
    const timer = setTimeout(() => setTurning(null), 450);
    return () => clearTimeout(timer);
  }, [turning, shown]);

  const chosen = quest.heroes.flatMap((h) => (h.heroData !== null ? [h.heroData] : []));
  const chosenNames = new Set(chosen.map((h) => h.sectionName));
  const { minHero, maxHero } = quest.qd.quest;
  // As many circles as the quest takes heroes (and as Valkyrie keeps places for)
  const places = Math.max(1, Math.min(maxHero, quest.heroes.length || maxHero));
  const bar = circlesFor(look, places);
  const ready = chosen.length >= minHero;
  const onPage = heroes.slice(shown * page, shown * page + page);
  const [flights, setFlights] = useState<Flight[]>([]);
  const flying = new Set(flights.map((f) => f.hero));
  // The circles a hero has just landed in flare and throw sparks
  const [landedIn, setLandedIn] = useState<Record<string, number>>({});
  useFit(stage, `${shown}|${game.currentLang}`);

  // Valkyrie: HeroSelection.cs HeroSelection.Select (it takes the first free place, as the flight does)
  const choose = (hero: string, file: string) => {
    if (selection === null) return;
    const free = quest.heroes.findIndex((h) => h.heroData === null);
    const host = stage.current;
    const source = host?.querySelector(`[data-hero="${CSS.escape(hero)}"] .frame-room-portrait`);
    const target = host?.querySelector(`[data-place="${free}"]`);
    const willFly = !chosenNames.has(hero) && free >= 0 && free < bar.xs.length && source && target && roomMoves();
    run(() => selection.select(hero));
    if (willFly) setFlights((now) => [...now, { hero, file, from: source.getBoundingClientRect(), to: target.getBoundingClientRect() }]);
  };
  const landed = (hero: string) => {
    setFlights((now) => now.filter((f) => f.hero !== hero));
    setLandedIn((now) => ({ ...now, [hero]: (now[hero] ?? 0) + 1 }));
  };
  const { sheet, circles } = look;
  const holeStyle: CSSProperties = look.holeMask === undefined ? { borderRadius: '50%' } : { maskImage: `url("${look.holeMask}")`, WebkitMaskImage: `url("${look.holeMask}")` };

  return (
    <section className="hero-selection frame-room" data-look={look.look} data-ready={ready ? '' : undefined}>
      <Backdrop look={look} />
      <div className="frame-room-stage" ref={stage} onPointerDown={swipeStart} onPointerUp={swipeEnd} onPointerCancel={() => (swipe.current = null)} onClickCapture={noPressAfterSwipe}>
        <ul className="hero-list frame-room-rings" data-turning={turning ?? undefined} key={shown}>
          {look.tiles.map((tile, i) => {
            const hero = onPage[i];
            const art = (
              <>
                <span className="frame-room-ring-art" style={sheetPart(sheet.url, sheet.width, sheet.height, tile.sheet)} />
                {sheet.glow !== undefined && <span className="frame-room-ring-glow" style={{ ...sheetPart(sheet.glow, sheet.width, sheet.height, tile.sheet), animationDelay: `${-((i * 2.3) % 8).toFixed(2)}s` }} />}
              </>
            );
            const hole = { ...within(tile.hole, tile.box), ...holeStyle };
            if (hero === undefined) {
              // Past the last one: an empty frame, its lights out
              return (
                <li key={`empty-${i}`} className="frame-room-tile frame-room-empty" style={at(tile.box)} aria-hidden="true">
                  <span className="frame-room-hole" style={hole} />
                  {art}
                </li>
              );
            }
            const data = game.cd.get(HeroData, hero);
            const name = nameOf(data.name);
            return (
              <li key={hero} className="frame-room-tile" style={{ ...at(tile.box), '--i': i } as CSSProperties}>
                {/* Chosen, it turns grey: it cannot be chosen again */}
                <button type="button" className="hero-choice frame-room-choice" data-hero={hero} aria-pressed={chosenNames.has(hero)} onClick={() => choose(hero, data.image)}>
                  <span className="frame-room-hole" style={hole}>
                    <span className="frame-room-portrait">
                      <Picture file={data.image} name={name} className="portrait" decorative />
                    </span>
                    <span className="frame-room-fire" />
                  </span>
                  {art}
                  <span className="frame-room-name" style={within(tile.plate, tile.box)} data-fit="">
                    {name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <PieceImage piece={look.title} className="frame-room-title-art" />
        <h1 className="frame-room-title" style={at(look.title.text)} data-fit="">
          {val('SELECT', game.gameType.heroesName())}
        </h1>

        <button type="button" className="frame-room-arrow previous" style={at(look.previous.box)} disabled={shown === 0} aria-label={uni('PREVIOUS_PAGE')} onClick={() => goTo(shown - 1)}>
          <img src={look.previous.url} alt="" draggable={false} />
        </button>
        <button type="button" className="frame-room-arrow next" style={at(look.next.box)} disabled={shown >= pages - 1} aria-label={uni('NEXT_PAGE')} onClick={() => goTo(shown + 1)}>
          <img src={look.next.url} alt="" draggable={false} />
        </button>
        {pages > 1 && (
          <nav className="frame-room-dots" style={at(look.dots)} aria-label={uni('PAGE_OF', String(shown + 1), String(pages))}>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} type="button" className="frame-room-dot" aria-current={i === shown ? 'page' : undefined} aria-label={uni('PAGE_OF', String(i + 1), String(pages))} onClick={() => goTo(i)} />
            ))}
          </nav>
        )}

        {/* The buttons under the plate, whose ends go over theirs */}
        <button type="button" className="frame-room-button back" style={at(look.back.box)} onClick={() => run(() => GameStateManager.Quest.restart())}>
          <img src={look.back.url} alt="" draggable={false} />
          <Glow url={look.back.glow} i={1} />
          <span style={within(look.back.text, look.back.box)} data-fit="">
            {val('BACK')}
          </span>
        </button>
        {/* Always live, as Valkyrie's: HeroCanvas.EndSection sets each chosen hero's variable, then waits for enough heroes */}
        <button type="button" data-sound="start" className="frame-room-button confirm" style={at(look.confirm.box)} onClick={() => run(() => game.endSelection())}>
          <img src={look.confirm.url} alt="" draggable={false} />
          <Glow url={look.confirm.glow} i={2} />
          <span style={within(look.confirm.text, look.confirm.box)} data-fit="">
            {CommonStringKeys.FINISHED.translate()}
          </span>
        </button>
        <PieceImage piece={look.plate} />

        <div className="frame-room-circles" style={{ '--circle-dark': `${circles.dark}%`, '--circle-inset': `${circles.inset}%` } as CSSProperties}>
          {bar.xs.slice(0, -1).map((x, i) => {
            const s = circles.diamond * bar.scale;
            return <img key={`d${i}`} className="frame-room-diamond" src={circles.diamondUrl} alt="" draggable={false} style={at([x + bar.step / 2 - s / 2, circles.y - s / 2, s, s])} />;
          })}
          {bar.xs.map((x, i) => {
            const place = quest.heroes[i];
            const hero = place?.heroData ?? undefined;
            const kind = i < minHero ? 'required' : 'optional';
            const arriving = hero !== undefined && flying.has(hero.sectionName);
            const size = circles.size * bar.scale;
            const flares = hero !== undefined && !arriving ? (landedIn[hero.sectionName] ?? 0) : 0;
            return (
              <div key={i} className="frame-room-circle" data-place={i} data-kind={kind} data-filled={hero !== undefined ? '' : undefined} style={at([x - size / 2, circles.y - size / 2, size, size])}>
                <img className="frame-room-circle-art" src={kind === 'required' ? circles.lit : circles.darkUrl} alt="" draggable={false} />
                {/* Pressed, it is let go, as Valkyrie's hero icon is during the selection (HeroCanvas.HeroDiag) */}
                {hero !== undefined && (
                  <button
                    key={hero.sectionName}
                    type="button"
                    className="frame-room-chosen"
                    data-arriving={arriving ? '' : undefined}
                    aria-label={nameOf(hero.name)}
                    onClick={() => run(() => game.heroCanvas.heroDiag(place!.id))}
                  >
                    <span className="frame-room-chosen-picture">
                      <Picture file={hero.image} name={nameOf(hero.name)} decorative />
                    </span>
                    <img className="frame-room-chosen-ring" src={kind === 'required' ? circles.ringLit : circles.ringDark} alt="" draggable={false} />
                  </button>
                )}
                {flares > 0 && (
                  <span key={`${hero!.sectionName}-${flares}`} className="frame-room-flare" aria-hidden="true">
                    <Sparks />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="frame-room-glints" aria-hidden="true">
          {look.gems.map(([x, y, size], i) => {
            const t = look.tiles.findIndex(({ box: [bx, by, bw, bh] }) => x >= bx && x <= bx + bw && y >= by && y <= by + bh);
            return <i key={i} className="frame-room-glint" data-empty={t >= 0 && onPage[t] === undefined ? '' : undefined} style={glintAt(x, y, size, i)} />;
          })}
        </div>

        {stage.current !== null && flights.map((flight) => <Flyer key={flight.hero} flight={flight} stage={stage.current!.getBoundingClientRect()} done={() => landed(flight.hero)} />)}
      </div>
    </section>
  );
}

// Descent's look, "Dwarven Runestone" (2 November 2026): kozka's frames are drawn at the hall's own size and place;
// they are laid out at 0.8 of it round its middle (as DooM's are), so that the hall shows round them

const S = 0.8;
/** A box of the frames' picture on the stage, at S round the picture's middle. */
function placed([x, y, w, h]: Box): Box {
  return [836 + (x - 836) * S, 470.5 + (y - 470.5) * S, w * S, h * S];
}
const pt = (x: number, y: number) => [836 + (x - 836) * S, 470.5 + (y - 470.5) * S] as const;

/** The rings' sheet: the frames from (301, 171), 1068×529, cut in tiles between two rings; each ring's middle. */
const SHEET_X = 301;
const SHEET_Y = 171;
const COLS = [0, 271, 542, 810, 1068] as const;
const ROWS = [0, 262, 529] as const;
const HOLE_X = [430, 700, 972, 1240] as const;
const HOLE_Y = [302, 561] as const;
/** The portrait goes a few pixels under the stone all round. */
const HOLE_R = 83;
const RING_GEMS = [
  [0, -88, 1],
  [-100, -2, 0.8],
  [100, -2, 0.8],
  [0, 118, 0.7],
] as const;

const D2E_HOLES = [0, 1].flatMap((r) => [0, 1, 2, 3].map((c) => [HOLE_X[c]!, HOLE_Y[r]!] as const));

const D2E_TILES: readonly Tile[] = [0, 1].flatMap((r) =>
  [0, 1, 2, 3].map((c) => {
    const sx = COLS[c]!;
    const sy = ROWS[r]!;
    const [cx, cy] = D2E_HOLES[r * 4 + c]!;
    return {
      box: placed([SHEET_X + sx, SHEET_Y + sy, COLS[c + 1]! - sx, ROWS[r + 1]! - sy]),
      sheet: [sx, sy, COLS[c + 1]! - sx, ROWS[r + 1]! - sy] as const,
      hole: placed([cx - HOLE_R, cy - HOLE_R, HOLE_R * 2, HOLE_R * 2]),
      plate: placed([cx - 82, cy + 78, 164, 32]),
    };
  }),
);

const PREVIOUS: Box = placed([183, 325, 109, 218]);
const NEXT: Box = placed([1381, 325, 108, 218]);
const gem = (x: number, y: number, size: number) => [...pt(x, y), size * S] as const;
const [CIRCLES_X, CIRCLES_Y] = pt(838, 824);

const DESCENT: RoomLook = {
  look: 'd2e',
  Art: DescentRoomArt,
  still: stillUrl,
  title: { url: titleUrl, box: placed([299, 8, 1073, 147]), text: placed([505, 46, 662, 74]) },
  dots: placed([736, 158, 200, 18]),
  sheet: { url: ringsUrl, width: 1068, height: 529 },
  tiles: D2E_TILES,
  previous: { url: previousUrl, box: PREVIOUS },
  next: { url: nextUrl, box: NEXT },
  back: { url: backUrl, box: placed([11, 676, 401, 260]), text: placed([88, 772, 292, 118]) },
  confirm: { url: confirmUrl, box: placed([1292, 676, 370, 260]), text: placed([1330, 772, 252, 118]) },
  plate: { url: plateUrl, box: placed([405, 676, 895, 260]) },
  circles: {
    x: CIRCLES_X,
    y: CIRCLES_Y,
    room: 760 * S,
    step: 152 * S,
    size: 140 * S,
    dark: 91.4,
    inset: 13,
    diamond: 34 * S,
    lit: circleLitUrl,
    darkUrl: circleDarkUrl,
    ringLit: ringLitUrl,
    ringDark: ringDarkUrl,
    diamondUrl,
  },
  gems: [
    ...D2E_HOLES.flatMap(([cx, cy]) => RING_GEMS.map(([dx, dy, size]) => gem(cx + dx, cy + dy, size))),
    gem(455, 85, 1.5),
    gem(365, 100, 0.9),
    gem(1305, 100, 0.9),
    gem(838, 140, 0.9),
    gem(58, 824, 1.1),
    gem(1612, 824, 1.1),
    gem(838, 915, 0.9),
    gem(238, 434, 1),
    gem(1434, 434, 1),
  ],
};

export function DescentHeroRoom(props: { quest: Quest; selection: HeroSelection | null; heroes: string[] }) {
  return <FramedHeroRoom look={DESCENT} {...props} />;
}
