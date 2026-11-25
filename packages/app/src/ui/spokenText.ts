// What the app says when it reads a text aloud (ui/speech.ts). Not ported from Valkyrie.
import { plainText } from './links.ts';
import { spokenSymbols } from './symbolNames.ts';

/** The text as it is said: without tags, with the symbols' names, the lines as pauses. */
export function spokenText(text: string): string {
  return spokenSymbols(plainText(text))
    .replace(/\\n|\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .replace(/(\.\s*){2,}/g, '. ')
    .trim();
}

/** Not in Valkyrie: the text in parts of at most `max` characters, by sentences, as Chrome cuts a voice after some 15 s. */
export function spokenParts(said: string, max = 200): string[] {
  const parts: string[] = [];
  let current = '';
  for (const piece of pieces(said, max)) {
    if (current !== '' && current.length + 1 + piece.length > max) {
      parts.push(current);
      current = '';
    }
    current = current === '' ? piece : current + ' ' + piece;
  }
  if (current !== '') parts.push(current);
  return parts;
}

/** Sentences, a long one by its clauses, then its words, then cut, so that none is longer than `max`. */
function pieces(text: string, max: number): string[] {
  const split = (s: string, ends: RegExp) => s.replace(ends, '$1$2\u0000').split('\u0000').map((p) => p.trim()).filter((p) => p !== '');
  return split(text, /([.!?…])\s+|([。！？])/g).flatMap((sentence) =>
    sentence.length <= max
      ? [sentence]
      : split(sentence, /([,;:])\s+|([、，；：])/g).flatMap((clause) => (clause.length <= max ? [clause] : words(clause, max))),
  );
}

/** A clause by its words, each part at most `max` long; a word longer than that, cut. */
function words(clause: string, max: number): string[] {
  const parts: string[] = [];
  let current = '';
  for (const word of clause.split(' ')) {
    for (let at = 0; at < word.length; at += max) {
      const bit = word.slice(at, at + max);
      if (current !== '' && current.length + 1 + bit.length > max) {
        parts.push(current);
        current = '';
      }
      current = current === '' ? bit : current + ' ' + bit;
    }
  }
  if (current !== '') parts.push(current);
  return parts;
}
