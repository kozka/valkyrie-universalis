// A colour shown as a small square, which opens a palette to choose another: Valkyrie's named colours, the ones the
// text already uses, and any other one. Buttons and the text tools take it. Not in Valkyrie, whose button colour is a
// list of names and whose texts take their colour tags typed.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ColorUtil } from '@universalis/engine';
import { edi } from './text.ts';

/** How a colour is drawn: its name as Valkyrie reads it, or the #hex itself. */
export function cssOf(colour: string): string {
  return ColorUtil.fromName(colour.trim());
}

interface PaletteProps {
  /** What it chooses the colour of. */
  label: string;
  /** The element it opens under. */
  anchor: HTMLElement;
  value: string;
  /** Colours to offer first, as they are written (those of the text). */
  extra?: string[];
  /** Whether a colour of any value can be chosen as well as the named ones. */
  any?: boolean;
  onPick: (colour: string) => void;
  onClose: () => void;
}

export function Palette({ label, anchor, value, extra = [], any = true, onPick, onClose }: PaletteProps) {
  const box = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState<CSSProperties>({ visibility: 'hidden' });
  useLayoutEffect(() => {
    const r = anchor.getBoundingClientRect();
    const w = box.current?.offsetWidth ?? 200;
    const h = box.current?.offsetHeight ?? 120;
    const left = Math.max(4, Math.min(r.left, window.innerWidth - w - 4));
    const top = r.bottom + h + 4 > window.innerHeight ? Math.max(4, r.top - h - 4) : r.bottom + 4;
    setAt({ left, top });
  }, [anchor]);
  useEffect(() => {
    const away = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node) && !anchor.contains(e.target as Node)) onClose();
    };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('pointerdown', away, true);
    document.addEventListener('keydown', key, true);
    return () => {
      document.removeEventListener('pointerdown', away, true);
      document.removeEventListener('keydown', key, true);
    };
  }, [anchor, onClose]);
  const named = [...ColorUtil.lookUp().keys()].filter((n) => n !== 'transparent' && n !== 'cyan' && n !== 'fuchsia');
  const offered = [...new Set([...extra, ...named])];
  const [hex, setHex] = useState(/^#[0-9a-f]{6}/i.test(cssOf(value)) ? cssOf(value).slice(0, 7) : '#ffffff');
  return (
    <div className="editor-palette" ref={box} style={at} role="dialog" aria-label={label} onMouseDown={(e) => e.preventDefault()}>
      <div className="editor-palette-grid">
        {offered.map((c) => (
          <button
            key={c}
            type="button"
            className="editor-swatch-cell"
            aria-label={c}
            title={c}
            aria-pressed={c.toLowerCase() === value.toLowerCase()}
            style={{ background: cssOf(c) }}
            onClick={() => onPick(c)}
          />
        ))}
      </div>
      {any && (
        <div className="editor-palette-any">
          <span>{edi('EDITOR_COLOUR_OTHER')}</span>
          <input type="color" aria-label={edi('EDITOR_COLOUR_OTHER')} value={hex} onChange={(e) => setHex(e.target.value)} />
          <button type="button" className="button" onClick={() => onPick(hex.toUpperCase())}>
            {hex.toUpperCase()}
          </button>
        </div>
      )}
    </div>
  );
}

/** A small square of the colour: pressing it opens the palette. */
export function Swatch({ label, value, onPick, any = false }: { label: string; value: string; onPick: (colour: string) => void; any?: boolean }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <button
        type="button"
        className="editor-swatch"
        aria-label={`${label}: ${value}`}
        title={`${label}: ${value}`}
        aria-expanded={anchor !== null}
        style={{ background: cssOf(value) }}
        onClick={(e) => setAnchor(anchor === null ? e.currentTarget : null)}
      />
      {anchor !== null && (
        <Palette
          label={label}
          anchor={anchor}
          value={value}
          any={any}
          onPick={(c) => {
            setAnchor(null);
            if (c !== value) onPick(c);
          }}
          onClose={() => setAnchor(null)}
        />
      )}
    </>
  );
}
