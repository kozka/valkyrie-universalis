// A scenario's text typed as a game shows it: Unity's rich text (<b>, <i>, <color=…>, <size=…>) drawn while it is
// typed, as Valkyrie's boxes draw it, with a few tools (bold, italic, colour) and, for the texts a game shows, the row
// of its symbols, each drawn in the box as the symbol. What is kept is the text with its tags, as Valkyrie writes it;
// any other tag stays as it is typed. Kept when the box loses the focus (or with Enter on one line), and only when it
// was changed, so that a text whose tags a game reads loosely is never rewritten by just looking at it. Not in Valkyrie.
import { useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EventManager, Game } from '@universalis/engine';
import { languageCode } from '../ui/languages.ts';
import { RICH_TAG } from '../ui/links.ts';
import { withSymbols } from '../ui/Symbols.tsx';
import { Palette, cssOf } from './Colours.tsx';
import { edi } from './text.ts';

/** The symbols' codes and what a game draws for each ({will} and its character): the packs' too, or only the row's. */
function symbolMap(packs = true): Map<string, string> {
  return EventManager.getCharacterMap(true, packs) ?? new Map();
}

/** A symbol as a piece of the box that is not typed into: the game's symbol, its code kept. */
function symbolNode(code: string, char: string): HTMLElement {
  const chip = document.createElement('span');
  chip.className = 'editor-rich-symbol';
  chip.contentEditable = 'false';
  chip.dataset.code = code;
  chip.title = code;
  // Our own elements, not the author's text: the symbol as the game's texts draw it
  chip.innerHTML = renderToStaticMarkup(<>{withSymbols(char, 's')}</>);
  return chip;
}

/** Text with its symbols' codes as symbols and its line ends as breaks. */
function appendText(parent: Node, text: string, symbols: Map<string, string>, codes: RegExp | null): void {
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (i > 0) parent.appendChild(document.createElement('br'));
    if (codes === null) {
      if (line.length > 0) parent.appendChild(document.createTextNode(line));
      return;
    }
    let last = 0;
    for (const m of line.matchAll(codes)) {
      if (m.index > last) parent.appendChild(document.createTextNode(line.slice(last, m.index)));
      parent.appendChild(symbolNode(m[0], symbols.get(m[0])!));
      last = m.index + m[0].length;
    }
    if (last < line.length) parent.appendChild(document.createTextNode(line.slice(last)));
  });
}

/** An element for a tag, which keeps how the tag was written. */
function tagNode(tag: string, value: string | undefined): HTMLElement {
  if (tag === 'b') return document.createElement('b');
  if (tag === 'i') return document.createElement('i');
  const span = document.createElement('span');
  if (tag === 'color') {
    span.dataset.color = value ?? '';
    span.style.color = cssOf(value ?? '');
  } else {
    span.dataset.size = value ?? '';
    const size = Number.parseFloat(value ?? '');
    if (Number.isFinite(size) && size > 0) span.style.fontSize = `${(size / 20).toFixed(2)}em`;
  }
  return span;
}

/** Fills the box with the text, its tags as formatting (as RichText reads them). */
export function fill(box: HTMLElement, text: string, withCodes: boolean): void {
  box.replaceChildren();
  const symbols = withCodes ? symbolMap() : new Map<string, string>();
  const codes = symbols.size === 0 ? null : new RegExp([...symbols.keys()].map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
  const stack: { tag: string; node: Node }[] = [{ tag: '', node: box }];
  let last = 0;
  for (const m of text.matchAll(RICH_TAG)) {
    const [whole, closing, name, value] = m;
    const tag = name!.toLowerCase();
    appendText(stack.at(-1)!.node, text.slice(last, m.index), symbols, codes);
    last = m.index + whole.length;
    if (closing) {
      const at = stack.findLastIndex((o) => o.tag === tag);
      if (at <= 0) appendText(stack.at(-1)!.node, whole, symbols, null);
      else stack.length = at;
      continue;
    }
    const node = tagNode(tag, value);
    stack.at(-1)!.node.appendChild(node);
    stack.push({ tag, node });
  }
  appendText(stack.at(-1)!.node, text.slice(last), symbols, codes);
  // A break at the very end shows only with another after it
  if (text.endsWith('\n')) box.appendChild(document.createElement('br'));
}

/** The text with its tags, from what the box holds. */
export function serialize(box: Node): string {
  const out = (node: Node): string => {
    let s = '';
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        s += (child.nodeValue ?? '').replace(/ /g, ' ');
        continue;
      }
      if (!(child instanceof HTMLElement)) continue;
      const tag = child.tagName.toLowerCase();
      if (child.dataset.code !== undefined) {
        s += child.dataset.code;
        continue;
      }
      if (tag === 'br') {
        s += '\n';
        continue;
      }
      let inner = out(child);
      // A line the browser made a block of its own
      if ((tag === 'div' || tag === 'p') && s.length > 0 && !s.endsWith('\n')) inner = '\n' + inner;
      if (inner.length === 0) continue;
      const style = child.style;
      if (child.dataset.size !== undefined) inner = `<size=${child.dataset.size}>${inner}</size>`;
      if (child.dataset.color !== undefined) inner = `<color=${child.dataset.color}>${inner}</color>`;
      else if (tag === 'font' && child.getAttribute('color') !== null) inner = `<color=${child.getAttribute('color')!.toUpperCase()}>${inner}</color>`;
      else if (style.color !== '' && tag === 'span') inner = `<color=${hexOf(style.color)}>${inner}</color>`;
      if (tag === 'i' || tag === 'em' || style.fontStyle === 'italic') inner = `<i>${inner}</i>`;
      if (tag === 'b' || tag === 'strong' || style.fontWeight === 'bold' || Number(style.fontWeight) >= 600) inner = `<b>${inner}</b>`;
      s += inner;
    }
    return s;
  };
  let text = out(box);
  // The break that only shows the last one
  if (box.lastChild instanceof HTMLBRElement && text.endsWith('\n\n')) text = text.slice(0, -1);
  else if (box.lastChild instanceof HTMLBRElement && box.childNodes.length === 1) text = '';
  return text;
}

/** A CSS colour (rgb(…)) as #RRGGBB. */
function hexOf(css: string): string {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(css);
  if (m === null) return css;
  return '#' + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** The colours a text already uses, as they are written. */
function coloursIn(text: string): string[] {
  return [...new Set([...text.matchAll(/<color=([^>]*)>/gi)].map((m) => m[1]!.trim()))];
}

/** Wraps what is selected in the box in a colour. */
function colourSelection(box: HTMLElement, colour: string): boolean {
  const selection = window.getSelection();
  if (selection === null || selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  if (range.collapsed || !box.contains(range.commonAncestorContainer)) return false;
  const span = tagNode('color', colour);
  span.appendChild(range.extractContents());
  // A colour inside goes: the new one is the one wanted
  for (const inner of span.querySelectorAll<HTMLElement>('[data-color], font[color]')) inner.replaceWith(...inner.childNodes);
  range.insertNode(span);
  selection.removeAllRanges();
  const after = document.createRange();
  after.selectNodeContents(span);
  selection.addRange(after);
  return true;
}

interface RichFieldProps {
  label: string;
  value: string;
  onDone: (text: string) => void;
  /** Several lines, which grow with the text up to a limit and then scroll. */
  multiline?: boolean;
  /** The row of the game's symbols (the texts a game shows; not the scenario's description or its authors). */
  symbols?: boolean;
  /** The key of the scenario's text it writes, for its language. */
  textKey?: string;
  placeholder?: string;
  /** Valkyrie's SetMaxCharacters, counted on the text with its tags, as Valkyrie counts it. */
  maxLength?: number;
}

export function RichField({ label, value, onDone, multiline = false, symbols = false, textKey, placeholder, maxLength }: RichFieldProps) {
  const box = useRef<HTMLDivElement>(null);
  const dirty = useRef(false);
  /** Where the caret was when the box lost the focus, where a symbol pressed afterwards goes. */
  const caret = useRef<Range | null>(null);
  const [palette, setPalette] = useState<HTMLElement | null>(null);
  const [showSymbols, setShowSymbols] = useState(multiline);
  const [empty, setEmpty] = useState(value.length === 0);
  const lang = textKey === undefined ? undefined : languageCode(Game.get().currentLang);
  useLayoutEffect(() => {
    const element = box.current;
    if (element === null || (document.activeElement === element && dirty.current)) return;
    fill(element, value, symbols);
    // A kept caret would now be at the start: a symbol goes at the end instead
    caret.current = null;
    dirty.current = false;
    setEmpty(value.length === 0);
  }, [value, symbols]);
  const changed = () => {
    dirty.current = true;
    setEmpty((box.current?.textContent ?? '').length === 0 && box.current?.querySelector('[data-code]') === null);
  };
  const done = () => {
    const element = box.current;
    const selection = window.getSelection();
    caret.current = element !== null && selection !== null && selection.rangeCount > 0 && element.contains(selection.anchorNode) ? selection.getRangeAt(0).cloneRange() : null;
    if (element === null || !dirty.current) return;
    const text = serialize(element);
    dirty.current = false;
    if (text !== value) onDone(text);
  };
  const command = (name: 'bold' | 'italic') => {
    box.current?.focus();
    document.execCommand('styleWithCSS', false, 'false');
    document.execCommand(name);
    changed();
  };
  const insertSymbol = (code: string, char: string) => {
    const element = box.current;
    if (element === null) return;
    const focused = document.activeElement === element;
    element.focus();
    const selection = window.getSelection();
    if (selection === null) return;
    if (!focused || selection.rangeCount === 0 || !element.contains(selection.anchorNode)) {
      // Where the caret was, or else at the end
      const kept = caret.current !== null && element.contains(caret.current.startContainer) ? caret.current : null;
      const range = kept ?? document.createRange();
      if (kept === null) {
        range.selectNodeContents(element);
        range.collapse(false);
      }
      selection.removeAllRanges();
      selection.addRange(range);
    }
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const chip = symbolNode(code, char);
    range.insertNode(chip);
    range.setStartAfter(chip);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    changed();
  };
  const key = (e: ReactKeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (multiline) {
        document.execCommand('insertLineBreak');
        changed();
      } else done();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'b' || e.key === 'i')) {
      e.preventDefault();
      command(e.key === 'b' ? 'bold' : 'italic');
    }
  };
  const chars = symbols ? symbolMap(false) : null;
  return (
    <div className={'editor-rich' + (multiline ? ' editor-rich-multi' : ' editor-rich-line')}>
      <div className="editor-rich-tools" role="toolbar" aria-label={edi('EDITOR_FORMAT_TOOLS')} onMouseDown={(e) => e.preventDefault()}>
        <button type="button" className="editor-rich-tool" title={`${edi('EDITOR_BOLD')} (Ctrl+B)`} aria-label={edi('EDITOR_BOLD')} onClick={() => command('bold')}>
          <b>B</b>
        </button>
        <button type="button" className="editor-rich-tool" title={`${edi('EDITOR_ITALIC')} (Ctrl+I)`} aria-label={edi('EDITOR_ITALIC')} onClick={() => command('italic')}>
          <i>I</i>
        </button>
        <button type="button" className="editor-rich-tool editor-rich-colour" title={edi('EDITOR_COLOUR')} aria-label={edi('EDITOR_COLOUR')} aria-expanded={palette !== null} onClick={(e) => setPalette(palette === null ? e.currentTarget : null)}>
          A
        </button>
        {chars !== null && !multiline && (
          <button type="button" className="editor-rich-tool" title={edi('EDITOR_SYMBOLS')} aria-label={edi('EDITOR_SYMBOLS')} aria-pressed={showSymbols} onClick={() => setShowSymbols(!showSymbols)}>
            ✦
          </button>
        )}
        {chars !== null && showSymbols && (
          <span className="editor-symbols" role="group" aria-label={edi('EDITOR_SYMBOLS')}>
            {[...chars].map(([code, char]) => (
              <button key={code} type="button" className="editor-back" title={code} aria-label={code} onClick={() => insertSymbol(code, char)}>
                {withSymbols(char, code)}
              </button>
            ))}
          </span>
        )}
      </div>
      <div
        ref={box}
        className="editor-rich-box"
        role="textbox"
        aria-label={label}
        aria-multiline={multiline}
        contentEditable
        suppressContentEditableWarning
        spellCheck={textKey !== undefined}
        lang={lang}
        data-placeholder={empty ? placeholder : undefined}
        onInput={changed}
        onBeforeInput={(e) => {
          if (maxLength !== undefined && box.current !== null && serialize(box.current).length >= maxLength) e.preventDefault();
        }}
        onBlur={done}
        onKeyDown={key}
        onPaste={(e) => {
          // Only text: what is pasted is typed, tags and all
          e.preventDefault();
          const text = e.clipboardData.getData('text/plain').replace(/\r\n?/g, '\n');
          document.execCommand('insertText', false, multiline ? text : text.replace(/\n/g, ' '));
          changed();
        }}
      />
      {palette !== null && (
        <Palette
          label={edi('EDITOR_COLOUR')}
          anchor={palette}
          value=""
          extra={coloursIn(value)}
          onPick={(c) => {
            setPalette(null);
            if (box.current !== null && colourSelection(box.current, c)) changed();
          }}
          onClose={() => setPalette(null)}
        />
      )}
    </div>
  );
}
