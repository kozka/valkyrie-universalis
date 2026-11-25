// Not in Valkyrie (17 November 2026): what the app checks in a community content pack the player adds from a file
// (ContentSelectDownloadScreen), so that its author hears what is wrong and how to mend it. Valkyrie has no way to add
// one: its wiki (Create Custom Content Packs) has the author copy the .valkyrieContentPack into Download/ContentPacks and
// write its entry in that folder's manifest.ini, which a browser cannot reach. The errors are what stops Valkyrie from
// loading the pack (or the app from keeping it); the warnings, what it loads but shows badly, or not on every device.
// The rules follow ContentData.PopulatePackListByPath, GetPackData and GetContentPack, and ContentLoader. No DOM, so
// that Vitest can test it.
import { IniRead, readZipDirectory, readZipEntry, type IniData, type ZipEntry } from '@universalis/engine';
import type { Problem } from './scenarioPackage.ts';

export type ContentPackCheck =
  | { kind: 'not-zip' }
  /** A scenario (quest.ini), given here by mistake. */
  | { kind: 'scenario' }
  | { kind: 'no-pack-ini' }
  | {
      kind: 'pack';
      /** The [ContentPack] section of its content_pack.ini. */
      pack: Map<string, string>;
      /** Its id, the name it is kept by; '' when it has none. */
      id: string;
      /** What stops it from being kept. */
      errors: Problem[];
      /** What it loads with but shows badly, or not everywhere. */
      warnings: Problem[];
    };

/** What the check compares the pack with: the game it is added to, and the packs already there. */
export interface ContentPackContext {
  /** GameType.TypeName(): MoM or D2E. */
  gameType: string;
  /** The ids of the packs that come with the game (and the official import). */
  officialIds: ReadonlySet<string>;
  /** The ids of the community packs in the store's list. */
  storeIds: ReadonlySet<string>;
  /** The content already defined by other packs, by section name, with the pack that defines it. */
  knownNames: ReadonlyMap<string, string>;
}

/** ContentLoader.CONTENT_TYPE_LOADERS: a section is read only when its name starts with one of these. */
const SECTION_TYPES = [
  'PackType',
  'TileSide',
  'Hero',
  'Class',
  'Skill',
  'Item',
  'MonsterActivation',
  'Monster',
  'Attack',
  'Evade',
  'Horror',
  'Token',
  'Peril',
  'Puzzle',
  'Image',
  'Audio',
];

/** ContentData.ResolveTextureFile: the name as given, or with one of these extensions. */
const TEXTURE_EXTENSIONS = ['', '.dds', '.pvr', '.png', '.jpg', '.jpeg', '.tex'];

/** At most this many problems of one kind, so that the window stays short. */
const MAX_OF_A_KIND = 5;

const decoder = new TextDecoder();

function isMacMetadata(name: string): boolean {
  return name.startsWith('__MACOSX/') || name.split('/').some((part) => part === '.DS_Store' || part.startsWith('._'));
}

/** A path inside the zip, with Windows' separators, doubled slashes, '.' and '..' sorted out. */
function normalize(path: string): string {
  const parts: string[] = [];
  for (const part of path.replace(/\\/g, '/').split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') parts.pop();
    else parts.push(part);
  }
  return parts.join('/');
}

function folderOf(path: string): string {
  const at = path.lastIndexOf('/');
  return at < 0 ? '' : path.substring(0, at);
}

function join(folder: string, name: string): string {
  return normalize(folder === '' ? name : folder + '/' + name);
}

/** Counts the problems of each kind and keeps the first few. */
class Problems {
  readonly list: Problem[] = [];
  private readonly counts = new Map<string, number>();

  add(key: string, ...params: string[]): void {
    const count = (this.counts.get(key) ?? 0) + 1;
    this.counts.set(key, count);
    if (count <= MAX_OF_A_KIND) this.list.push({ key, params });
  }

  /** The list, with a line for each kind that had more than were kept. */
  done(): Problem[] {
    const out: Problem[] = [];
    for (const problem of this.list) {
      out.push(problem);
      const count = this.counts.get(problem.key)!;
      const last = this.list.filter((p) => p.key === problem.key).at(-1);
      if (count > MAX_OF_A_KIND && last === problem) out.push({ key: 'CHECK_MORE', params: [String(count - MAX_OF_A_KIND)] });
    }
    return out;
  }
}

/** Reads and checks a content pack as Valkyrie would load it into this game. */
export function checkContentPack(given: Uint8Array, context: ContentPackContext): ContentPackCheck {
  let entries: ZipEntry[];
  try {
    entries = readZipDirectory(given);
  } catch {
    return { kind: 'not-zip' };
  }
  const files = entries.filter((e) => !e.isDirectory && !isMacMetadata(e.name));
  // Found as named, and found only with other capitals (the app's files and Windows ignore them; Android does not)
  const exact = new Map(files.map((e) => [normalize(e.name), e]));
  const lower = new Map(files.map((e) => [normalize(e.name).toLowerCase(), e]));

  // PopulatePackListByPath: content_pack.ini at the top, or in one of the zip's folders
  let root: string | null = exact.has('content_pack.ini') ? '' : null;
  if (root === null) {
    const tops = [...new Set(files.filter((e) => e.name.includes('/')).map((e) => normalize(e.name).split('/')[0]!))];
    root = tops.find((top) => exact.has(`${top}/content_pack.ini`)) ?? null;
  }
  if (root === null) {
    if (files.some((e) => /(^|\/)quest\.ini$/i.test(e.name))) return { kind: 'scenario' };
    return { kind: 'no-pack-ini' };
  }

  const errors = new Problems();
  const warnings = new Problems();
  /** A file of the pack: its entry, and whether it was found only with other capitals. */
  const find = (path: string): { entry: ZipEntry; caseOnly: boolean } | null => {
    const at = normalize(path);
    const entry = exact.get(at);
    if (entry !== undefined) return { entry, caseOnly: false };
    const other = lower.get(at.toLowerCase());
    return other === undefined ? null : { entry: other, caseOnly: true };
  };
  /** The file's text, warning when its name differs in capitals; null when it is not there or cannot be read. */
  const read = (path: string, shown: string): string | null => {
    const found = find(path);
    if (found === null) return null;
    if (found.caseOnly) warnings.add('PACK_CASE', shown, normalize(found.entry.name).substring(root === '' ? 0 : root!.length + 1));
    try {
      return decoder.decode(readZipEntry(given, found.entry));
    } catch {
      return null;
    }
  };
  const parse = (file: string, text: string): IniData | null => {
    // IniRead reads l.Trim()[0]: a line of only spaces or tabs stops the whole file
    const lines = text.split(/\r\n|\r|\n/);
    const blank = lines.findIndex((line) => line.length > 0 && line.trim().length === 0);
    if (blank >= 0) {
      errors.add('CHECK_BLANK_LINE', file, String(blank + 1));
      return null;
    }
    try {
      return IniRead.readFromString(text);
    } catch (e) {
      errors.add('CHECK_UNREADABLE', file, e instanceof Error ? e.message : String(e));
      return null;
    }
  };
  const result = (pack: Map<string, string>, id: string): ContentPackCheck => ({ kind: 'pack', pack, id, errors: errors.done(), warnings: warnings.done() });

  const ini = parse('content_pack.ini', read(join(root, 'content_pack.ini'), 'content_pack.ini') ?? '');
  if (ini === null) return result(new Map(), '');
  const pack = ini.data.get('ContentPack') ?? new Map<string, string>();

  // GetContentPack: a pack without a name stops Valkyrie
  if ((pack.get('name') ?? '') === '') errors.add('PACK_NO_NAME');
  // The id names the file and the manifest's entry, and scenarios ask for it (packs=… lists them with spaces)
  const id = pack.get('id') ?? '';
  if (id === '') errors.add('PACK_NO_ID');
  else if (!/^[A-Za-z0-9_-]+$/.test(id)) errors.add('PACK_BAD_ID', id);
  else if (context.officialIds.has(id)) errors.add('PACK_OFFICIAL_ID', id);
  else if (context.storeIds.has(id)) warnings.add('PACK_STORE_ID', id);
  // GetPackData: only a type that starts with the game's is read in it
  const type = pack.get('type') ?? '';
  const other = context.gameType === 'MoM' ? 'D2E' : 'MoM';
  if (type === '') errors.add('PACK_NO_TYPE', context.gameType);
  else if (type.startsWith(other)) errors.add('PACK_OTHER_GAME', type, other);
  else if (!type.startsWith(context.gameType)) errors.add('PACK_BAD_TYPE', type, context.gameType);
  else if (type !== `${context.gameType}Custom`) warnings.add('PACK_NOT_CUSTOM', type, `${context.gameType}Custom`);

  /** A picture: found with one of the extensions Valkyrie tries. */
  const picture = (path: string): { caseOnly: boolean; name: string } | null => {
    for (const extension of TEXTURE_EXTENSIONS) {
      const found = find(path + extension);
      if (found !== null) return { caseOnly: found.caseOnly, name: normalize(found.entry.name) };
    }
    return null;
  };
  const strip = (name: string) => (root === '' ? name : name.substring(root!.length + 1));
  // GetContentPack: path + '/' + image, so a leading slash does no harm here
  for (const [key, problem] of [
    ['image', 'PACK_NO_IMAGE'],
    ['icon', 'PACK_NO_ICON'],
  ] as const) {
    const value = pack.get(key) ?? '';
    if (value === '' || value.startsWith('{import}')) continue;
    const found = picture(join(root, value));
    if (found === null) warnings.add(problem, value);
    else if (found.caseOnly) warnings.add('PACK_CASE', value, strip(found.name));
  }

  // [LanguageData]: "<dictionary> <file>" per line
  for (const line of ini.data.get('LanguageData')?.keys() ?? []) {
    const space = line.indexOf(' ');
    if (space <= 0) {
      warnings.add('PACK_LANGUAGE_LINE', line);
      continue;
    }
    const file = line.substring(space + 1).trim();
    const text = read(join(root, file), file);
    if (text === null) {
      warnings.add('PACK_MISSING_LANGUAGE', file);
      continue;
    }
    // DictionaryI18n reads the language after the first line's comma
    const first = (text.includes('\r') ? text.split('\r') : text.split('\n'))[0] ?? '';
    if (!first.includes(',')) warnings.add('CHECK_LOCALIZATION_HEADER', file);
  }

  // [ContentPackData]: LoadContent reads them in order and stops at the first it cannot read
  const defined = new Map<string, string>();
  for (const file of ini.data.get('ContentPackData')?.keys() ?? []) {
    const path = join(root, file);
    const text = read(path, file);
    if (text === null) {
      errors.add('PACK_MISSING_DATA', file);
      continue;
    }
    const data = parse(file, text);
    if (data === null) continue;
    const folder = folderOf(path);
    for (const [section, values] of data.data) {
      if (!SECTION_TYPES.some((prefix) => section.startsWith(prefix))) {
        warnings.add('PACK_UNKNOWN_SECTION', file, section);
        continue;
      }
      const first = defined.get(section);
      if (first !== undefined) warnings.add('PACK_DUPLICATE', section, first, file);
      else defined.set(section, file);
      const owner = context.knownNames.get(section);
      if (owner !== undefined && owner !== id) warnings.add('PACK_NAME_TAKEN', section, owner);
      // GenericData: image, image2, image3… relative to the ini file's folder; the first one found is used
      const images = [...values.keys()].filter((key) => /^image\d*$/.test(key));
      if (images.length === 0) continue;
      let found = false;
      for (const key of images) {
        const value = values.get(key)!;
        if (value.startsWith('{import}')) {
          found = true;
          break;
        }
        // Path.Combine: a path that starts with a slash is taken from the root, not from the pack
        if (/^[/\\]/.test(value)) {
          warnings.add('PACK_IMAGE_ROOTED', file, section, value);
          found = true;
          break;
        }
        const resolved = picture(join(folder, value));
        if (resolved !== null) {
          if (resolved.caseOnly) warnings.add('PACK_CASE', value, strip(resolved.name));
          found = true;
          break;
        }
      }
      if (!found) warnings.add('PACK_MISSING_IMAGE', file, section, values.get(images[0]!)!);
    }
  }
  return result(pack, id);
}

/** The entry the pack gets in Download/ContentPacks/manifest.ini, as Valkyrie's wiki has its author write it. */
export function manifestEntry(pack: ReadonlyMap<string, string>): Map<string, string> {
  const entry = new Map<string, string>();
  for (const key of ['name', 'description', 'image', 'id', 'type']) {
    const value = pack.get(key);
    if (value !== undefined && value !== '') entry.set(key, value);
  }
  return entry;
}
