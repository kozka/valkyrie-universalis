// The library behind a scenario's details in the Universalis theme for Mansions (QuestDetailsScreen.tsx): the picture
// as painted, still, under its drawing with the candles lit (libraryArt.ts), unless the player wants less motion. Its
// place is in scenarios.css. Not ported from Valkyrie.
import { useEffect, useRef } from 'react';
import litUrl from '../../assets/details-library-lit.webp';
import { LibraryArt } from './libraryArt.ts';

export function Library() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const art = new LibraryArt(host.current!);
    void art.start();
    return () => art.destroy();
  }, []);
  return <div className="details-library" ref={host} style={{ backgroundImage: `url("${litUrl}")` }} aria-hidden="true" />;
}
