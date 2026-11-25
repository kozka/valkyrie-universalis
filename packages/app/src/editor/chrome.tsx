// The workbench's own controls: buttons that show an icon, a menu that drops from a button, the handles that size the
// panels, and parts of a panel that fold. Not in Valkyrie, whose editor draws its panels with Unity.
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon.tsx';
import { isOpen, setOpen, useLayout } from './layout.ts';

/** A button that shows an icon, and its words when asked; its name and tooltip say what it does, and its keys. */
export function Tool({
  icon,
  label,
  keys,
  onClick,
  pressed,
  disabled,
  text,
  className,
  expanded,
  title,
}: {
  icon: IconName;
  label: string;
  /** The tooltip, when it says more than the name (Undo's: what it takes back). */
  title?: string;
  keys?: string;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
  /** Shown beside the icon. */
  text?: string;
  className?: string;
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      className={'editor-tool' + (text === undefined ? '' : ' editor-tool-text') + (className === undefined ? '' : ' ' + className)}
      aria-label={label}
      title={title ?? (keys === undefined ? label : `${label} (${keys})`)}
      aria-pressed={pressed}
      aria-expanded={expanded}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon name={icon} />
      {text !== undefined && <span>{text}</span>}
    </button>
  );
}

export type MenuEntry =
  | { label: string; icon?: IconName; keys?: string; onSelect: () => void; disabled?: boolean; danger?: boolean; /** One of a choice, marked when it is the chosen one. */ checked?: boolean }
  | 'separator';

/** A menu that drops from its button; it closes when one of its entries is chosen, with Escape or a press elsewhere. */
export function Menu({ icon, label, text, entries }: { icon: IconName; label: string; text?: string; entries: MenuEntry[] }) {
  const [open, setOpenMenu] = useState(false);
  const [end, setEnd] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  // A menu near the right edge opens towards the left, so that it stays on the screen
  useLayoutEffect(() => {
    if (!open) return setEnd(false);
    const list = box.current?.querySelector<HTMLElement>('.editor-menu-list');
    if (list !== null && list !== undefined && list.getBoundingClientRect().right > window.innerWidth) setEnd(true);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpenMenu(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(false);
    };
    window.addEventListener('pointerdown', away, true);
    window.addEventListener('keydown', key);
    box.current?.querySelector<HTMLElement>(':is([role="menuitem"], [role="menuitemradio"]):not(:disabled)')?.focus();
    return () => {
      window.removeEventListener('pointerdown', away, true);
      window.removeEventListener('keydown', key);
    };
  }, [open]);
  // The arrows go from one entry to the next
  const arrows = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = [...(box.current?.querySelectorAll<HTMLElement>(':is([role="menuitem"], [role="menuitemradio"]):not(:disabled)') ?? [])];
    const at = items.indexOf(document.activeElement as HTMLElement);
    items[(at + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus();
  };
  return (
    <div className="editor-menu" ref={box}>
      <button
        type="button"
        className={'editor-tool' + (text === undefined ? '' : ' editor-tool-text')}
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpenMenu(!open)}
      >
        <Icon name={icon} />
        {text !== undefined && <span>{text}</span>}
      </button>
      {open && (
        <div className={'editor-menu-list' + (end ? ' editor-menu-end' : '')} role="menu" aria-label={label} onKeyDown={arrows}>
          {entries.map((entry, i) =>
            entry === 'separator' ? (
              <hr key={i} />
            ) : (
              <button
                key={entry.label}
                type="button"
                role={entry.checked === undefined ? 'menuitem' : 'menuitemradio'}
                aria-checked={entry.checked}
                className={entry.danger === true ? 'editor-menu-danger' : undefined}
                disabled={entry.disabled}
                onClick={() => {
                  setOpenMenu(false);
                  entry.onSelect();
                }}
              >
                {entry.checked === true ? <Icon name="check" /> : entry.icon !== undefined ? <Icon name={entry.icon} /> : <span className="editor-icon" />}
                <span>{entry.label}</span>
                {entry.keys !== undefined && <kbd>{entry.keys}</kbd>}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

/**
 * A handle between two panels: dragging it sizes the panel on its side, the arrows too (Shift for bigger steps), and a
 * double press folds it.
 */
export function Splitter({
  label,
  vertical,
  size,
  limits,
  grows,
  onSize,
  onFold,
}: {
  label: string;
  /** Between two columns (sizes a width) or two rows (sizes a height). */
  vertical: boolean;
  size: number;
  limits: readonly [number, number];
  /** Which way the panel grows: 1 when it is before the handle, -1 when after. */
  grows: 1 | -1;
  onSize: (size: number) => void;
  onFold: () => void;
}) {
  const clamp = (n: number) => Math.round(Math.min(limits[1], Math.max(limits[0], n)));
  const down = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    const start = vertical ? e.clientX : e.clientY;
    const from = size;
    const move = (m: PointerEvent) => onSize(clamp(from + grows * ((vertical ? m.clientX : m.clientY) - start)));
    const up = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
      document.body.classList.remove('editor-sizing');
    };
    document.body.classList.add('editor-sizing');
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  };
  const key = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 64 : 16;
    const less = vertical ? 'ArrowLeft' : 'ArrowUp';
    const more = vertical ? 'ArrowRight' : 'ArrowDown';
    if (e.key !== less && e.key !== more) return;
    e.preventDefault();
    onSize(clamp(size + grows * (e.key === more ? step : -step)));
  };
  return (
    <div
      className={'editor-splitter' + (vertical ? ' editor-splitter-v' : ' editor-splitter-h')}
      role="separator"
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      aria-label={label}
      aria-valuenow={size}
      aria-valuemin={limits[0]}
      aria-valuemax={limits[1]}
      title={label}
      tabIndex={0}
      onPointerDown={down}
      onKeyDown={key}
      onDoubleClick={onFold}
    />
  );
}

/**
 * A part of a panel under its heading, which folds: as the author left it on this device, or open unless it is
 * secondary. Folded, its heading still says how many it holds.
 */
export function Fold({
  id,
  title,
  count,
  open: byDefault = true,
  actions,
  className,
  children,
  part,
}: {
  /** What remembers it folded, the same for every component of a type. */
  id: string;
  title: string;
  count?: number;
  open?: boolean;
  /** Buttons at the end of its heading. */
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
  /** A part of a component's panel, which the panel's flat view shows without its heading. */
  part?: boolean;
}) {
  useLayout((s) => s.folded[id]);
  const flat = useLayout((s) => s.flat) && part === true;
  const open = isOpen(id, byDefault);
  if (flat)
    return (
      <section className={'editor-fold editor-fold-flat' + (className === undefined ? '' : ' ' + className)}>
        {actions !== undefined && <div className="editor-fold-head editor-fold-flat-head">{actions}</div>}
        <div className="editor-fold-body">{children}</div>
      </section>
    );
  return (
    <section className={'editor-fold' + (open ? '' : ' editor-folded') + (className === undefined ? '' : ' ' + className)}>
      <div className="editor-fold-head">
        <h3>
          <button type="button" aria-expanded={open} onClick={() => setOpen(id, !open)}>
            <Icon name="chevron" className="editor-chevron" />
            {title}
          </button>
        </h3>
        {count !== undefined && count > 0 && (
          <span className="editor-count" aria-hidden="true">
            {count}
          </span>
        )}
        {actions}
      </div>
      {open && <div className="editor-fold-body">{children}</div>}
    </section>
  );
}
