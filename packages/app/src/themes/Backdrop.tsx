// A theme's picture behind a screen (themes.ts): the whole picture still, from the stylesheet, which on wide screens
// that move freely a PixiJS drawing brings to life over it. It fades in, and is darker where the screen's words are.
// Not ported from Valkyrie.
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useUI } from '../ui/store.ts';
import { backdropOf, type Place } from './themes.ts';
import { Scene } from './universalis/scene.ts';
import './backdrop.css';

/** Whether this screen gets the moving backdrops: wide, with a mouse, and not asking for less motion. */
export function backdropMoves(): boolean {
  return matchMedia('(min-width: 900px) and (hover: hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function Backdrop({ place }: { place: Place }) {
  // Drawn again when the theme changes
  useUI((s) => s.revision);
  const backdrop = backdropOf(place);
  const host = useRef<HTMLDivElement>(null);
  const Art = backdrop?.art;
  // A camera that travels starts elsewhere than the still picture, which shows where it ends: none under it, unless
  // the drawing fails
  const [stayedStill, setStayedStill] = useState(false);
  const moves = Art !== undefined && backdropMoves();
  const travels = moves && Art.prototype instanceof Scene && !stayedStill;
  useEffect(() => {
    if (Art === undefined || !moves) return;
    const element = host.current!;
    const art = new Art(element);
    let gone = false;
    void art.start().then(() => {
      if (!gone && element.dataset.art === undefined) setStayedStill(true);
    });
    return () => {
      gone = true;
      art.destroy();
    };
  }, [Art, moves]);
  if (backdrop === undefined) return null;
  const style = {
    '--still': `url("${backdrop.still}")`,
    '--still-position': backdrop.position,
    '--phone-position': backdrop.phonePosition,
  } as CSSProperties;
  return <div className="backdrop" data-place={place} aria-hidden="true" ref={host} style={style} data-travels={travels ? '' : undefined} />;
}
