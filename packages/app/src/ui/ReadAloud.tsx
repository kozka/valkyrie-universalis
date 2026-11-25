// Not in Valkyrie: a button that reads a text aloud, or stops it (Valkyrie issue #390), with the browser's voices
// (ui/speech.ts): on the event windows (play/Windows.tsx) and on the scenario's UI texts (board/QuestUILayer.tsx).
// Options can turn the voice off: then there is no speaker.
import { useEffect, useId, useRef, type CSSProperties } from 'react';
import { switchOn } from './preferences.ts';
import { readingAloud, speak, stopSpeaking, useReading } from './speech.ts';
import { uni } from './text.ts';

/**
 * The speaker. With `auto`, the advanced option «read events as they appear» reads the text as soon as it shows (event
 * windows only). `stopBoard` keeps the press from reaching the board under it, which would press the UI element there.
 */
export function ReadAloud({ text, auto = false, stopBoard = false, className = '', style }: { text: string; auto?: boolean; stopBoard?: boolean; className?: string; style?: CSSProperties }) {
  const id = useId();
  const reading = useReading() === id;
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (auto && switchOn('autoRead') && readingAloud()) speak(id, text);
    return () => stopSpeaking(id);
  }, [id, text, auto]);
  // The board listens on its stage, before React's own handlers would run
  useEffect(() => {
    const button = ref.current;
    if (!stopBoard || button === null) return;
    const stop = (e: Event) => e.stopPropagation();
    button.addEventListener('pointerdown', stop);
    return () => button.removeEventListener('pointerdown', stop);
  }, [stopBoard]);
  if (!readingAloud()) return null;
  return (
    <button
      ref={ref}
      type="button"
      className={`read-aloud ${className}`.trim()}
      style={style}
      aria-pressed={reading}
      aria-label={uni(reading ? 'STOP_READING' : 'READ_ALOUD')}
      title={uni(reading ? 'STOP_READING' : 'READ_ALOUD')}
      onClick={() => (reading ? stopSpeaking(id) : speak(id, text))}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M2 6h2.5L8 3v10L4.5 10H2Z" />
        {reading ? <path d="M10.5 6l3 4M13.5 6l-3 4" /> : <path d="M10.5 5.5a3.5 3.5 0 0 1 0 5M12.5 3.5a6.5 6.5 0 0 1 0 9" />}
      </svg>
    </button>
  );
}
