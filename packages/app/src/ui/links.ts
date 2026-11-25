// The plain parts of Unity's rich text: its tags (RichText.tsx draws them), taken out for a name read out or cut to a
// length, and the web addresses and emails authors write in their texts, found to be drawn as links. Not ported from
// Valkyrie.

/** Unity's rich text tags that Valkyrie's texts use. */
export const RICH_TAG = /<(\/?)(b|i|color|size)(?:=([^>]*))?>/gi;

/** A web address (with its scheme or starting www.) or an email, as authors write them in their texts. */
const LINK = /\b(?:https?:\/\/|www\.)[^\s<>"]+|\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b/gi;
/** What usually follows an address in a sentence rather than belonging to it. */
const TRAILING = /[.,;:!?)\]}'"»]+$/;

/** A text without its rich text tags, for a name read out (aria-label, alt) or cut to a length. */
export function plainText(text: string): string {
  return text.replace(RICH_TAG, '');
}

/** A piece of a line: text, or an address with where its link goes. */
export interface LinkPart {
  text: string;
  href?: string;
}

/** A line cut into its text and its addresses; a web address without scheme opens with https, an email writes to it. */
export function linkParts(line: string): LinkPart[] {
  const parts: LinkPart[] = [];
  let last = 0;
  for (const match of line.matchAll(LINK)) {
    const address = match[0].replace(TRAILING, '');
    if (address.length === 0) continue;
    if (match.index > last) parts.push({ text: line.substring(last, match.index) });
    const email = !/^(https?:\/\/|www\.)/i.test(address);
    parts.push({ text: address, href: email ? `mailto:${address}` : /^www\./i.test(address) ? `https://${address}` : address });
    last = match.index + address.length;
  }
  if (last < line.length) parts.push({ text: line.substring(last) });
  return parts;
}
