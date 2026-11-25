// Texts for the screens: Valkyrie's own keys ('val'), the app's ('uni', src/i18n) and the names the engine gives.
// Not ported from Valkyrie.
import { StringKey } from '@universalis/engine';

/** A key of Valkyrie's texts (StreamingAssets/text), with its {0} parameter if any. */
export function val(key: string, param?: string | number | StringKey): string {
  const text = param === undefined ? new StringKey('val', key).translate() : new StringKey('val', key, param as string).translate();
  return text.trim();
}

/** A key of the app's own texts, with {0}, {1}… replaced literally (a name may hold ':', which StringKey would split). */
export function uni(key: string, ...params: (string | number)[]): string {
  let text = new StringKey('uni', key).translate();
  params.forEach((param, i) => {
    text = text.split(`{${i}}`).join(String(param));
  });
  return text;
}

/** Prefixes of the official texts' keys that say what kind of thing they name, and the suffix of the box they come in. */
const KIND_PREFIX = /^(INVESTIGATOR|COMMON_ITEM|UNIQUE_ITEM|SPELL|CONDITION|MONSTER_NAME|MONSTER|TILE)_/;
const BOX_SUFFIX = /_MAD\d+$/;

/** A key of the official texts as words: INVESTIGATOR_RITA_YOUNG reads "Rita Young", TILE_ATTIC_MAD20 "Attic". */
export function wordsOf(key: string): string {
  return key
    .replace(KIND_PREFIX, '')
    .replace(BOX_SUFFIX, '')
    .split('_')
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0) + word.substring(1).toLowerCase())
    .join(' ');
}

/**
 * The name of something the official import translates ({ffg:…}). Without the import the key comes back as it is, so
 * it is turned into words, from Valkyrie's own data: {ffg:INVESTIGATOR_RITA_YOUNG} reads "Rita Young".
 */
export function nameOf(name: StringKey): string {
  const text = name.translate();
  if (name.dict !== 'ffg' || name.keyExists()) return text;
  return wordsOf(name.key);
}

/** Initials for a picture that is not here. */
export function initials(name: string): string {
  const words = name.split(/\s+/).filter((w) => /\p{L}/u.test(w));
  return (words.length > 1 ? words[0]!.charAt(0) + words.at(-1)!.charAt(0) : (words[0] ?? '?').substring(0, 2)).toUpperCase();
}

/**
 * A game's full name, from the app's texts: the publishers' titles in each language (Descent is "Viaje a las Tinieblas"
 * in Spanish, which Valkyrie's D2E_NAME gets wrong). Valkyrie's MOM_NAME and D2E_NAME are what its screens show.
 */
export function gameName(type: string): string {
  return type === 'D2E' ? `${uni('D2E_TITLE')}: ${uni('D2E_SUBTITLE')}, ${uni('D2E_EDITION')}` : `${uni('MOM_TITLE')}, ${uni('MOM_EDITION')}`;
}
