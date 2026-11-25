// Unity's rich text, which Valkyrie's texts use (<b>, <i>, <color=…>, <size=…>), as React elements, with the games'
// symbols drawn (Symbols.tsx). Scenario texts come from their authors, so nothing is ever read as HTML: anything that is
// not one of these tags stays text. Where asked (links), the web addresses and emails authors write become links.
// Not ported from Valkyrie.
import type { CSSProperties, ReactNode } from 'react';
import { RICH_TAG, linkParts } from './links.ts';
import { withSymbols } from './Symbols.tsx';

export { plainText } from './links.ts';

const TAG = RICH_TAG;
/** Unity accepts #RGB(A), #RRGGBB(AA) and colour names, which CSS also knows. */
const COLOUR = /^(#[0-9a-f]{3,4}|#[0-9a-f]{6}|#[0-9a-f]{8}|[a-z]+)$/i;

interface Open {
  tag: string;
  style: CSSProperties | null;
  children: ReactNode[];
}

/** A line of text with its symbols drawn and, if asked, its addresses as links that open apart (links.ts). */
function withLinks(text: string, key: string, links: boolean): ReactNode[] {
  if (!links) return withSymbols(text, key);
  return linkParts(text).flatMap((part, n): ReactNode[] =>
    part.href === undefined
      ? withSymbols(part.text, `${key}-p${n}`)
      : [
          <a key={`${key}-a${n}`} className="rich-link" href={part.href} target={part.href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">
            {part.text}
          </a>,
        ],
  );
}

export function RichText({ text, links = false }: { text: string; links?: boolean }) {
  const lines = (part: string, key: string): ReactNode[] =>
    part.split('\n').flatMap((line, i) => (i === 0 ? withLinks(line, `${key}-${i}`, links) : [<br key={`${key}-${i}`} />, ...withLinks(line, `${key}-${i}`, links)]));
  const root: Open = { tag: '', style: null, children: [] };
  const stack: Open[] = [root];
  let last = 0;
  let n = 0;
  for (const match of text.matchAll(TAG)) {
    const [whole, closing, name, value] = match;
    const tag = name!.toLowerCase();
    const top = stack.at(-1)!;
    top.children.push(...lines(text.substring(last, match.index), `t${n++}`));
    last = match.index + whole.length;
    if (closing) {
      // Close the innermost open element with this tag (Unity ignores a closing tag that matches nothing)
      const at = stack.findLastIndex((o) => o.tag === tag);
      if (at <= 0) {
        top.children.push(whole);
        continue;
      }
      while (stack.length > at) {
        const open = stack.pop()!;
        const element = wrap(open, `e${n++}`);
        stack.at(-1)!.children.push(element);
      }
      continue;
    }
    let style: CSSProperties | null = null;
    if (tag === 'color') {
      const colour = (value ?? '').trim();
      style = COLOUR.test(colour) ? { color: colour } : {};
    } else if (tag === 'size') {
      const size = Number.parseFloat(value ?? '');
      style = Number.isFinite(size) && size > 0 ? { fontSize: `${(size / 20).toFixed(2)}em` } : {};
    }
    stack.push({ tag, style, children: [] });
  }
  stack.at(-1)!.children.push(...lines(text.substring(last), `t${n++}`));
  // Unity leaves unclosed tags open to the end
  while (stack.length > 1) {
    const open = stack.pop()!;
    stack.at(-1)!.children.push(wrap(open, `e${n++}`));
  }
  return <>{root.children}</>;
}

function wrap(open: Open, key: string): ReactNode {
  if (open.tag === 'b') return <strong key={key}>{open.children}</strong>;
  if (open.tag === 'i') return <em key={key}>{open.children}</em>;
  return (
    <span key={key} style={open.style ?? undefined}>
      {open.children}
    </span>
  );
}
