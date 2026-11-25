// The plain parts of Unity's rich text (ui/links.ts): names without their tags, and the addresses and emails authors
// write, which RichText.tsx draws as links. Not ported from Valkyrie.
import { describe, expect, it } from 'vitest';
import { linkParts, plainText } from '../src/ui/links.ts';

describe('rich text', () => {
  it('takes the tags out of a collection name', () => {
    expect(plainText('The <i>Lost</i> <color=red>Pack</color> <b>II</b>')).toBe('The Lost Pack II');
  });

  it('finds web addresses and emails, leaving the sentence around them', () => {
    expect(linkParts('Web: www.example.com/quest, or https://example.org. Mail me at someone@example.com!')).toEqual([
      { text: 'Web: ' },
      { text: 'www.example.com/quest', href: 'https://www.example.com/quest' },
      { text: ', or ' },
      { text: 'https://example.org', href: 'https://example.org' },
      { text: '. Mail me at ' },
      { text: 'someone@example.com', href: 'mailto:someone@example.com' },
      { text: '!' },
    ]);
  });

  it('leaves a line without addresses as it is', () => {
    expect(linkParts('No address here.')).toEqual([{ text: 'No address here.' }]);
  });
});
