// Not in Valkyrie: a small (i) that tells a short note on hover, focus or touch.
import { useId, useState } from 'react';
import { uni } from './text.ts';
import './InfoTip.css';

export function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="info-tip">
      <button
        type="button"
        className="info-tip-button"
        aria-label={uni('MORE_INFO')}
        aria-describedby={id}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
      >
        i
      </button>
      <span id={id} role="tooltip" className="info-tip-text" data-open={open}>
        {text}
      </span>
    </span>
  );
}
