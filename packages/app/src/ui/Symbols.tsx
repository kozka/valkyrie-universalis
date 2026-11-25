// The game's symbols inside texts. Valkyrie writes them as characters of each game's fonts (EventManager.CHARS_MAP, the
// ICON_* keys of its texts, the expansions' acronyms). With those fonts (Mansions' from the official import, Descent's
// from Valkyrie's repository) the app draws the characters; without them, its own: skills and Descent's symbols as
// their names, and the rest as small pictures. Not ported from Valkyrie.
import type { ReactNode } from 'react';
import { Game } from '@universalis/engine';
import { hasOfficialFonts } from '../host/officialImport.ts';
import { DESCENT, DESCENT_SYMBOL, SKILLS, SYMBOL } from './symbolNames.ts';
import { uni } from './text.ts';

const ICONS: Record<number, [string, ReactNode]> = {
  // An arrow
  0xf208: ['SYMBOL_ACTION', <path d="M2 8h9M8 4.5 11.5 8 8 11.5" />],
  // An eight-pointed star
  0xf206: ['SYMBOL_SUCCESS', <path d="M8 1.5 9.4 5.6 13.6 4 12 8l1.6 4-4.2-1.6L8 14.5 6.6 10.4 2.4 12 4 8 2.4 4l4.2 1.6Z" />],
  // A magnifying glass
  0xf207: ['SYMBOL_CLUE', <path d="M6.8 2.5a4.3 4.3 0 1 1 0 8.6 4.3 4.3 0 0 1 0-8.6ZM10 10l4 4" />],
  // A curl
  0xf209: ['SYMBOL_TENTACLE', <path d="M3 13c3 0 4-2 4-4.5S9 4 11 4s2.5 2 1 3" />],
};

/** A text with its symbols drawn. */
export function withSymbols(text: string, key: string): ReactNode[] {
  // Before the app has started there is no game yet
  const descent = Game.game?.gameType.typeName() === 'D2E';
  const parts: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const match of text.matchAll(descent ? DESCENT_SYMBOL : SYMBOL)) {
    if (match.index > last) parts.push(text.substring(last, match.index));
    const code = match[0].codePointAt(0)!;
    parts.push(descent ? <DescentSymbol key={`${key}-s${n++}`} code={code} /> : <GameSymbol key={`${key}-s${n++}`} code={code} />);
    last = match.index + 1;
  }
  if (last < text.length) parts.push(text.substring(last));
  return parts;
}

function DescentSymbol({ code }: { code: number }) {
  const name = DESCENT[code];
  if (hasOfficialFonts('D2E')) {
    return (
      <span className="symbol official" role="img" aria-label={uni(name ?? 'SYMBOL_PRODUCT')}>
        {String.fromCodePoint(code)}
      </span>
    );
  }
  if (name !== undefined) return <span className="symbol skill">{uni(name)}</span>;
  return (
    <svg className="symbol icon" viewBox="0 0 16 16" role="img" aria-label={uni('SYMBOL_PRODUCT')}>
      <rect x="3" y="3" width="10" height="10" rx="2" />
    </svg>
  );
}

function GameSymbol({ code }: { code: number }) {
  const skill = SKILLS[code];
  const [label, path] = ICONS[code] ?? ['SYMBOL_PRODUCT', <rect x="3" y="3" width="10" height="10" rx="2" />];
  // With the official import, Valkyrie's own: the character in the game's symbol font
  if (hasOfficialFonts(Game.get().gameType.typeName())) {
    return (
      <span className="symbol official" role="img" aria-label={uni(skill ?? label)}>
        {String.fromCodePoint(code)}
      </span>
    );
  }
  if (skill !== undefined) return <span className="symbol skill">{uni(skill)}</span>;
  return (
    <svg className="symbol icon" viewBox="0 0 16 16" role="img" aria-label={uni(label)}>
      {path}
    </svg>
  );
}

