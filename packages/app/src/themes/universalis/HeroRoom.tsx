// Mansions' investigator selection in the Universalis theme (kozka's design, 17 October 2026): his study behind
// (heroRoomArt.ts, alive with PixiJS) and, over it, his gold frames: eight oval portraits a page, turned with the
// arrows or the dots under them, empty ones in black and white past the last investigator; and at the bottom Back, the
// investigators chosen and Finished (for a scenario of more than five, a bar of eight or ten smaller circles, built
// from pieces of the same picture by brand/hero-room/make_bar.py). The circles at the bottom glow for as many as the
// scenario asks for, more softly up to as many as it takes; an investigator chosen turns grey in its oval and flies,
// rippling, into its circle; Finished lights up once there are enough. The rules are Valkyrie's, as in the classic view (QuestScreen.tsx
// HeroSelectionView): a press chooses (HeroSelection.Select), a press on a chosen one's circle lets it go
// (HeroCanvas.HeroDiag), and Finished is always live (HeroCanvas.EndSection). Not ported from Valkyrie.
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import { CommonStringKeys, ContentData, Game, GameStateManager, HeroData, type HeroSelection, type Quest } from '@universalis/engine';
import roomUrl from '../../assets/hero-room.webp';
import uiUrl from '../../assets/hero-room-ui.webp';
import framesUrl from '../../assets/hero-room-frames.webp';
import ovalUrl from '../../assets/hero-room-oval.webp';
import uiBar8Url from '../../assets/hero-room-ui-bar8.webp';
import framesBar8Url from '../../assets/hero-room-frames-bar8.webp';
import uiBar10Url from '../../assets/hero-room-ui-bar10.webp';
import framesBar10Url from '../../assets/hero-room-frames-bar10.webp';
import { Picture } from '../../ui/Picture.tsx';
import { run } from '../../ui/run.ts';
import { nameOf, uni, val } from '../../ui/text.ts';
import { HeroRoomArt } from './heroRoomArt.ts';
import './heroRoom.css';

/** The frames' picture is 1536×1024: every place on it, as x, y, width, height. */
type Box = readonly [number, number, number, number];

/** The holes of the ovals, a row of four over another, as they are in the frames' picture. */
const HOLES: readonly Box[] = [
  [307, 207, 180, 193],
  [549, 207, 178, 193],
  [808, 207, 178, 193],
  [1048, 209, 177, 191],
  [309, 504, 178, 192],
  [547, 504, 180, 191],
  [808, 504, 179, 191],
  [1047, 504, 178, 192],
];
/** A portrait: its hole and 5 pixels more all round, under the gold ring, cut to the hole's shape (hero-room-oval.webp). */
const PORTRAITS: readonly Box[] = HOLES.map(([x, y]) => [x - 5, y - 5, 190, 203] as const);
const PLATES: readonly Box[] = [408, 702].flatMap((y) => [309, 548, 808, 1048].map((x) => [x, y, 179, 30] as const));
/** The title, between the star and the castle of its banner. */
const TITLE: Box = [538, 40, 420, 68];
/** The page dots, under the title's banner and between the top ovals' crests (by the skull they met it, 17 October 2026). */
const DOTS: Box = [648, 170, 240, 16];
/** A picture of the whole 1536×1024, or of the rows from top down that tall (the bars for more investigators). */
interface Sheet {
  url: string;
  top: number;
  height: number;
}

/**
 * The bar at the bottom: a circle for each investigator chosen, between Back and Finished (their whole frame, which
 * lights up, and the inside where the word goes), and the circle whose painting is an empty one, which every empty
 * circle shows. Five circles as kozka drew it; for a scenario of more, eight or ten smaller ones and narrower buttons,
 * painted over the drawn bar (its rows from BAR_TOP down), with its pieces (brand/hero-room/make_bar.py).
 */
interface Bar {
  circles: readonly Box[];
  emptyCircle: Box;
  back: Box;
  backText: Box;
  finished: Box;
  finishedText: Box;
  ui: Sheet;
  frames: Sheet;
  /** Painted over the drawn bar, whose rows from BAR_TOP down are left out. */
  over: boolean;
}

const BAR_TOP = 798;
const BAR_HEIGHT = 164;

const BAR_5: Bar = {
  circles: [472, 592, 723, 855, 983].map((x) => [x, 835, 86, 86] as const),
  // The first circle has a figure in it: the second is an empty one
  emptyCircle: [592, 835, 86, 86],
  back: [52, 806, 346, 134],
  backText: [125, 822, 266, 99],
  finished: [1138, 806, 340, 134],
  finishedText: [1146, 822, 266, 99],
  ui: { url: uiUrl, top: 0, height: 1024 },
  frames: { url: framesUrl, top: 0, height: 1024 },
  over: false,
};

/** A bar of n circles of the size given, their left edges at xs and their tops at y. */
function bar(xs: number[], y: number, size: number, back: number, backText: number, finished: number, finishedText: number, ui: string, frames: string): Bar {
  const circles = xs.map((x) => [x, y, size, size] as const);
  return {
    circles,
    emptyCircle: circles[0]!,
    back: [45, 806, back, 134],
    backText: [125, 822, backText, 99],
    finished: [1475 - finished, 806, finished, 134],
    finishedText: [1475 - finished + 12, 822, finishedText, 99],
    ui: { url: ui, top: BAR_TOP, height: BAR_HEIGHT },
    frames: { url: frames, top: BAR_TOP, height: BAR_HEIGHT },
    over: true,
  };
}

const BAR_8 = bar([367.2, 472.2, 577.1, 682.1, 787.1, 892.1, 997, 1102], 843.6, 68.8, 242, 110, 224, 125, uiBar8Url, framesBar8Url);
const BAR_10 = bar([351.1, 437.5, 523.8, 610.2, 696.6, 782.9, 869.3, 955.7, 1042, 1128.4], 848.8, 58.5, 230, 98, 212, 113, uiBar10Url, framesBar10Url);

/** The bar for as many investigators as a scenario takes: five or fewer keep kozka's. */
function barFor(maxHero: number): Bar {
  if (maxHero <= 5) return BAR_5;
  return maxHero <= 8 ? BAR_8 : BAR_10;
}
const PREVIOUS: Box = [186, 334, 96, 218];
const NEXT: Box = [1254, 334, 96, 218];
const PAGE = PORTRAITS.length;
/** How long a chosen investigator takes to fly into its circle. */
const FLIGHT_MS = 950;

/** A box of the frames' picture as a place on the stage, in percent. */
function at([x, y, w, h]: Box): CSSProperties {
  return { left: `${(x / 1536) * 100}%`, top: `${(y / 1024) * 100}%`, width: `${(w / 1536) * 100}%`, height: `${(h / 1024) * 100}%` };
}

/** A box of the frames' picture as a place inside another, in percent of that one. */
function within([x, y, w, h]: Box, [ox, oy, ow, oh]: Box): CSSProperties {
  return { left: `${((x - ox) / ow) * 100}%`, top: `${((y - oy) / oh) * 100}%`, width: `${(w / ow) * 100}%`, height: `${(h / oh) * 100}%` };
}

/** A part of a picture (the frames', by default) shown on its own, as a background: the box is of the whole 1536×1024. */
function cut([x, y, w, h]: Box, url: string | Sheet = uiUrl): CSSProperties {
  const sheet = typeof url === 'string' ? { url, top: 0, height: 1024 } : url;
  const top = y - sheet.top;
  return {
    backgroundImage: `url("${sheet.url}")`,
    backgroundSize: `${(1536 / w) * 100}% ${(sheet.height / h) * 100}%`,
    backgroundPosition: `${(x / (1536 - w)) * 100}% ${sheet.height === h ? 0 : (top / (sheet.height - h)) * 100}%`,
  };
}

/** The drawn picture without its bar, when another is painted over it. */
const WITHOUT_BAR: CSSProperties = { clipPath: `inset(0 0 ${((1024 - BAR_TOP) / 1024) * 100}% 0)` };

/**
 * An investigator's picture for the ovals: the official import has an oval portrait of each one beside the round one
 * Valkyrie shows (Oval_Investigator_… and Circle_Investigator_…), larger and with more of the scene; the round one
 * when there is no oval one (a scenario's own investigator).
 */
function ovalPicture(image: string): string {
  if (!image.includes('Circle_Investigator_')) return image;
  const oval = image.replace('Circle_Investigator_', 'Oval_Investigator_');
  return ContentData.resolveTextureFile(oval) !== null ? oval : image;
}

/** The room is drawn for a screen wider than tall; held upright (a phone played upright), the classic list. */
const WIDE = '(min-aspect-ratio: 1/1)';

export function useRoomFits(): boolean {
  return useSyncExternalStore(
    (listener) => {
      const query = matchMedia(WIDE);
      query.addEventListener('change', listener);
      return () => query.removeEventListener('change', listener);
    },
    () => matchMedia(WIDE).matches,
  );
}

/** Whether the room moves: not when the player asks for less motion. */
export function roomMoves(): boolean {
  return !matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Words that must fit their place whatever the language (the title, the names, the buttons): their size, in the
 * stylesheet, shrinks until they fit on one line, again when the screen changes or the game's fonts arrive.
 */
export function useFit(stage: RefObject<HTMLElement | null>, key: string): void {
  useLayoutEffect(() => {
    const host = stage.current;
    if (host === null) return;
    const fit = () => {
      for (const element of host.querySelectorAll<HTMLElement>('[data-fit]')) {
        element.style.fontSize = '';
        const room = element.clientWidth - parseFloat(getComputedStyle(element).paddingLeft) - parseFloat(getComputedStyle(element).paddingRight);
        const wide = element.scrollWidth - parseFloat(getComputedStyle(element).paddingLeft) - parseFloat(getComputedStyle(element).paddingRight);
        if (wide > room && room > 0) element.style.fontSize = `${parseFloat(getComputedStyle(element).fontSize) * (room / wide) * 0.97}px`;
      }
    };
    fit();
    const resizing = new ResizeObserver(fit);
    resizing.observe(host);
    // Mansions' own fonts (gameFonts.ts) are wider and may come after the screen: fit again then
    void document.fonts?.ready.then(fit);
    document.fonts?.addEventListener('loadingdone', fit);
    return () => {
      resizing.disconnect();
      document.fonts?.removeEventListener('loadingdone', fit);
    };
  }, [stage, key]);
}

/** The study, alive, behind the frames; the still picture under it until it draws, or if it cannot. */
function Room() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!roomMoves()) return;
    const art = new HeroRoomArt(host.current!);
    void art.start();
    return () => art.destroy();
  }, []);
  return <div className="hero-room-art" ref={host} style={{ backgroundImage: `url("${roomUrl}")` }} aria-hidden="true" />;
}

/**
 * A portrait in the shape of the oval's hole: the picture, with itself blurred behind to fill what it leaves (a
 * background of the same picture once it has come, so that the oval holds a single image).
 */
function OvalPortrait({ file, name }: { file: string; name: string }) {
  const host = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const element = host.current;
    if (element === null) return;
    const follow = () => {
      const src = element.querySelector('img')?.src;
      if (fill.current !== null) fill.current.style.backgroundImage = src ? `url("${src}")` : '';
    };
    follow();
    const watching = new MutationObserver(follow);
    watching.observe(element, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });
    return () => watching.disconnect();
  }, []);
  return (
    <span className="hero-room-oval" ref={host} style={{ maskImage: `url("${ovalUrl}")`, WebkitMaskImage: `url("${ovalUrl}")` }}>
      <span className="hero-room-oval-fill" ref={fill} />
      <Picture file={file} name={name} className="portrait" decorative />
    </span>
  );
}

/** The ripple a chosen investigator flies through, settling as it lands. */
export function Ripple({ id, ms }: { id: string; ms: number }) {
  return (
    <svg className="hero-room-filter" aria-hidden="true" focusable="false">
      <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.03 0.05" numOctaves="2" seed="7">
          <animate attributeName="baseFrequency" dur={`${ms}ms`} values="0.03 0.05;0.05 0.08;0.015 0.025" fill="freeze" />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G">
          <animate attributeName="scale" dur={`${ms}ms`} values="0;55;40;0" keyTimes="0;0.35;0.7;1" fill="freeze" />
        </feDisplacementMap>
      </filter>
    </svg>
  );
}

/** One flight: from the oval to the circle, as boxes of the stage in pixels. */
interface Flight {
  hero: string;
  file: string;
  from: DOMRect;
  to: DOMRect;
}

/** The chosen investigator's picture flying from its oval into its circle, rippling, turning round as it goes. */
function Flyer({ flight, stage, done }: { flight: Flight; stage: DOMRect; done: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = `ripple-${useId().replace(/:/g, '')}`;
  const { from, to } = flight;
  // Drawn again on every change of the screen: the flight must not start over
  const finished = useRef(done);
  finished.current = done;
  useLayoutEffect(() => {
    const element = ref.current;
    if (element === null) return;
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const sx = from.width / to.width;
    const sy = from.height / to.height;
    // A circle not laid out yet has no size: land at once rather than animate NaN
    if (!Number.isFinite(sx) || !Number.isFinite(sy)) return void finished.current();
    const animation = element.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, borderRadius: '50%', filter: 'brightness(1)', opacity: 1 },
        { transform: `translate(${dx * 0.55}px, ${dy * 0.45 - to.height * 0.6}px) scale(${(sx + 1) / 2 + 0.15})`, filter: 'brightness(1.6)', opacity: 1, offset: 0.45 },
        { transform: 'none', borderRadius: '50%', filter: 'brightness(1)', opacity: 1 },
      ],
      { duration: FLIGHT_MS, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' },
    );
    animation.onfinish = () => finished.current();
    return () => animation.cancel();
  }, [from, to]);
  return (
    <div
      ref={ref}
      className="hero-room-flyer"
      aria-hidden="true"
      style={{ left: to.left - stage.left, top: to.top - stage.top, width: to.width, height: to.height }}
    >
      <Ripple id={id} ms={FLIGHT_MS} />
      <span className="hero-room-flyer-picture" style={{ filter: `url(#${id})` }}>
        <Picture file={flight.file} name="" decorative />
      </span>
    </div>
  );
}

// Valkyrie: Game.cs Game.StartQuest (title, back and finished) and HeroSelection.cs HeroSelection.Draw
export function HeroRoom({ quest, selection, heroes }: { quest: Quest; selection: HeroSelection | null; heroes: string[] }) {
  const game = Game.get();
  const stage = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(heroes.length / PAGE));
  const shown = Math.min(page, pages - 1);
  // The page turns with a short fade, in its direction
  const [turning, setTurning] = useState<'left' | 'right' | null>(null);
  const goTo = (next: number) => {
    const to = Math.min(pages - 1, Math.max(0, next));
    if (to === shown) return;
    setTurning(to > shown ? 'right' : 'left');
    setPage(to);
  };
  // Not in Valkyrie (17 October 2026): on a touch screen a sideways swipe turns the page too, and presses nothing
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
  const shape = barFor(maxHero);
  const circles = shape.circles;
  const ready = chosen.length >= minHero;
  const onPage = heroes.slice(shown * PAGE, shown * PAGE + PAGE);
  const [flights, setFlights] = useState<Flight[]>([]);
  const flying = new Set(flights.map((f) => f.hero));
  useFit(stage, `${shown}|${game.currentLang}`);

  // Valkyrie: HeroSelection.cs HeroSelection.Select (it takes the first free place, as the flight does)
  const choose = (hero: string, file: string) => {
    if (selection === null) return;
    const free = quest.heroes.findIndex((h) => h.heroData === null);
    const host = stage.current;
    const source = host?.querySelector(`[data-hero="${CSS.escape(hero)}"]`);
    const target = host?.querySelector(`[data-place="${free}"]`);
    const willFly = !chosenNames.has(hero) && free >= 0 && free < circles.length && source && target && roomMoves();
    run(() => selection.select(hero));
    if (willFly) setFlights((now) => [...now, { hero, file, from: source.getBoundingClientRect(), to: target.getBoundingClientRect() }]);
  };
  const landed = (hero: string) => setFlights((now) => now.filter((f) => f.hero !== hero));

  return (
    <section className="hero-selection hero-room" data-ready={ready ? '' : undefined}>
      <Room />
      <div className="hero-room-stage" ref={stage} onPointerDown={swipeStart} onPointerUp={swipeEnd} onPointerCancel={() => (swipe.current = null)} onClickCapture={noPressAfterSwipe}>
        <img className="hero-room-layer" src={uiUrl} alt="" draggable={false} style={shape.over ? WITHOUT_BAR : undefined} />
        {shape.over && <img className="hero-room-layer" src={shape.ui.url} alt="" draggable={false} style={at([0, BAR_TOP, 1536, BAR_HEIGHT])} />}

        <h1 className="hero-room-title" style={at(TITLE)} data-fit="">
          {val('SELECT', game.gameType.heroesName())}
        </h1>

        <ul className="hero-list hero-room-portraits" data-turning={turning ?? undefined} key={shown}>
          {PORTRAITS.map((box, i) => {
            const hero = onPage[i];
            if (hero === undefined) {
              // Past the last one: the frame's own figure, in black and white
              return <li key={`empty-${i}`} className="hero-room-empty" style={{ ...at(HOLES[i]!), ...cut(HOLES[i]!) }} aria-hidden="true" />;
            }
            const data = game.cd.get(HeroData, hero);
            const name = nameOf(data.name);
            const file = ovalPicture(data.image);
            return (
              <li key={hero} className="hero-room-slot" style={at(box)}>
                {/* Chosen, it turns grey: it cannot be chosen again */}
                <button type="button" className="hero-choice hero-room-portrait" data-hero={hero} aria-pressed={chosenNames.has(hero)} onClick={() => choose(hero, file)}>
                  <OvalPortrait file={file} name={name} />
                  <span className="hero-room-name" style={within(PLATES[i]!, box)} data-fit="">
                    {name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <img className="hero-room-layer hero-room-frames" src={framesUrl} alt="" draggable={false} style={shape.over ? WITHOUT_BAR : undefined} />
        {shape.over && <img className="hero-room-layer hero-room-frames" src={shape.frames.url} alt="" draggable={false} style={at([0, BAR_TOP, 1536, BAR_HEIGHT])} />}

        {/* The arrows and the buttons wear their own piece of the gold frames, which lights up when pressed or pointed at */}
        <button type="button" className="hero-room-arrow previous" style={{ ...at(PREVIOUS), ...cut(PREVIOUS, framesUrl) }} disabled={shown === 0} aria-label={uni('PREVIOUS_PAGE')} onClick={() => goTo(shown - 1)} />
        <button type="button" className="hero-room-arrow next" style={{ ...at(NEXT), ...cut(NEXT, framesUrl) }} disabled={shown >= pages - 1} aria-label={uni('NEXT_PAGE')} onClick={() => goTo(shown + 1)} />
        {pages > 1 && (
          <nav className="hero-room-dots" style={at(DOTS)} aria-label={uni('PAGE_OF', String(shown + 1), String(pages))}>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} type="button" className="hero-room-dot" aria-current={i === shown ? 'page' : undefined} aria-label={uni('PAGE_OF', String(i + 1), String(pages))} onClick={() => goTo(i)} />
            ))}
          </nav>
        )}

        <div className="hero-room-circles">
          {circles.map((box, i) => {
            const place = quest.heroes[i];
            const hero = place?.heroData ?? undefined;
            const kind = i < minHero ? 'required' : i < maxHero ? 'optional' : 'closed';
            const arriving = hero !== undefined && flying.has(hero.sectionName);
            return (
              <div key={i} className="hero-room-circle" data-place={i} data-kind={kind} data-filled={hero !== undefined ? '' : undefined} style={at(box)}>
                <span className="hero-room-circle-empty" style={cut(shape.emptyCircle, shape.ui)} />
                {/* Pressed, it is let go, as Valkyrie's hero icon is during the selection (HeroCanvas.HeroDiag) */}
                {hero !== undefined && (
                  <button
                    key={hero.sectionName}
                    type="button"
                    className="hero-room-chosen"
                    data-arriving={arriving ? '' : undefined}
                    aria-label={nameOf(hero.name)}
                    onClick={() => run(() => game.heroCanvas.heroDiag(place!.id))}
                  >
                    <Picture file={ovalPicture(hero.image)} name={nameOf(hero.name)} decorative />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {stage.current !== null &&
          flights.map((flight) => <Flyer key={flight.hero} flight={flight} stage={stage.current!.getBoundingClientRect()} done={() => landed(flight.hero)} />)}

        <button type="button" className="hero-room-button back" style={{ ...at(shape.back), ...cut(shape.back, shape.frames) }} onClick={() => run(() => GameStateManager.Quest.restart())}>
          <span style={within(shape.backText, shape.back)} data-fit="">
            {val('BACK')}
          </span>
        </button>
        {/* Always live, as Valkyrie's: HeroCanvas.EndSection sets each chosen hero's variable, then waits for enough heroes */}
        <button type="button" data-sound="start" className="hero-room-button finished" style={{ ...at(shape.finished), ...cut(shape.finished, shape.frames) }} onClick={() => run(() => game.endSelection())}>
          <span style={within(shape.finishedText, shape.finished)} data-fit="">
            {CommonStringKeys.FINISHED.translate()}
          </span>
        </button>
      </div>
    </section>
  );
}
