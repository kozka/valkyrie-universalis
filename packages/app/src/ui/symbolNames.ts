// The names of the games' symbols inside texts (ui/Symbols.tsx draws them, ui/speech.ts says them). Not ported from
// Valkyrie.
import { Game } from '@universalis/engine';
import { uni } from './text.ts';

/** Mansions of Madness: the characters of the official font, by what they show. */
export const SKILLS: Record<number, string> = {
  0xf200: 'SYMBOL_STRENGTH',
  0xf201: 'SYMBOL_AGILITY',
  0xf202: 'SYMBOL_OBSERVATION',
  0xf203: 'SYMBOL_LORE',
  0xf204: 'SYMBOL_INFLUENCE',
  0xf205: 'SYMBOL_WILL',
};

/** Mansions of Madness: the other characters of the official font that Symbols.tsx draws as small pictures. */
export const ICON_NAMES: Record<number, string> = {
  0xf208: 'SYMBOL_ACTION',
  0xf206: 'SYMBOL_SUCCESS',
  0xf207: 'SYMBOL_CLUE',
  0xf209: 'SYMBOL_TENTACLE',
};

/** Any symbol character of the games' fonts: Mansions' private-use characters. */
export const SYMBOL = /[-]/g;

/** Descent: the characters Valkyrie's text font for it draws as symbols (EventManager.CHARS_MAP), by what they show. */
export const DESCENT: Record<number, string> = {
  0x2265: 'SYMBOL_HEART',
  0x220f: 'SYMBOL_FATIGUE',
  0x2202: 'SYMBOL_MIGHT',
  0x3c0: 'SYMBOL_WILL',
  0x221e: 'SYMBOL_ACTION',
  0x2211: 'SYMBOL_KNOWLEDGE',
  0x3bc: 'SYMBOL_AWARENESS',
  0x2264: 'SYMBOL_SHIELD',
  0xb1: 'SYMBOL_SURGE',
};

/** Those, and the expansions' icons of Descent's symbol font. */
export const DESCENT_SYMBOL = /[\u2265\u220f\u2202\u03c0\u221e\u2211\u03bc\u2264\u00b1\ue800-\ue812]/g;

/** Not in Valkyrie: a text with its symbols as their names, to be read aloud (ui/speech.ts); expansion icons are left out. */
export function spokenSymbols(text: string): string {
  const descent = Game.game?.gameType.typeName() === 'D2E';
  return text.replace(descent ? DESCENT_SYMBOL : SYMBOL, (symbol) => {
    const name = descent ? DESCENT[symbol.codePointAt(0)!] : (SKILLS[symbol.codePointAt(0)!] ?? ICON_NAMES[symbol.codePointAt(0)!]);
    return name === undefined ? '' : ` ${uni(name)} `;
  });
}
