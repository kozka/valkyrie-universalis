// Not in Valkyrie (29 October 2026): a window's buttons side by side when every one of them fits, whole, in one row at a
// size a finger can press: in equal shares if they can, or else each as wide as its words; one under another when they
// do not fit even so. Never some in a row and the rest below. Continue and Cancel, and most events' two choices, then
// take one line instead of two.
import { useLayoutEffect, useRef, type ReactNode } from 'react';

/** The narrowest a button may be in a row, in rem: a thumb's width and a short word on a phone or a tablet. */
const MIN_WIDTH = 7;
/** Not in Valkyrie (12 November 2026): at most this many side by side; more go one under another, which reads better. */
const MAX_IN_ROW = 3;

/** Lays the buttons in a row, or in a column when they do not fit (data-layout on the box, play.css). */
export function fitButtons(box: HTMLElement): void {
  const buttons = [...box.children] as HTMLElement[];
  // Only plain buttons go in a row: a quota's counter or anything else keeps the column
  if (buttons.length < 2 || buttons.length > MAX_IN_ROW || !buttons.every((b) => b.matches('button'))) {
    box.dataset.layout = 'column';
    return;
  }
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const pressable = (b: HTMLElement) => b.clientWidth >= MIN_WIDTH * rem;
  // Equal shares
  box.dataset.layout = 'row';
  if (buttons.every((b) => pressable(b) && b.scrollWidth <= b.clientWidth + 1)) return;
  // Each as wide as its words, the room left shared out
  box.dataset.layout = 'row-fit';
  if (buttons.every(pressable) && box.scrollWidth <= box.clientWidth + 1) return;
  box.dataset.layout = 'column';
}

/**
 * The row of a window's buttons, laid out again whenever its width or its buttons change. `row` false keeps them one
 * under another whatever their size: the menus (an investigator's, a monster's, the game menu) are lists, not choices.
 */
export function ButtonRow({ children, className = '', row = true }: { children: ReactNode; className?: string; row?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  // Before the browser paints, so the buttons never show in the wrong layout
  useLayoutEffect(() => {
    const box = ref.current;
    if (box === null) return;
    if (!row) {
      box.dataset.layout = 'column';
      return;
    }
    fitButtons(box);
    let width = box.clientWidth;
    const watch = new ResizeObserver(() => {
      if (box.clientWidth === width) return;
      width = box.clientWidth;
      fitButtons(box);
    });
    watch.observe(box);
    // The words change width when the game's fonts arrive
    let live = true;
    void document.fonts?.ready.then(() => live && fitButtons(box));
    return () => {
      live = false;
      watch.disconnect();
    };
  });
  return (
    <div ref={ref} className={`event-buttons ${className}`.trim()} data-layout="column">
      {children}
    </div>
  );
}
