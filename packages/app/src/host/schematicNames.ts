// Schematic mode: without the official import the 'ffg' dictionary is empty, so the names Valkyrie's data gives as
// {ffg:KEY} (tiles, monsters, items, investigators…) would show as keys inside the events' texts. The app fills the
// dictionary with words made from those keys, in English, Valkyrie's default language. A pack's product title, which
// only the import has, becomes its acronym in Valkyrie's texts (or Base for the base game). Not ported from Valkyrie.
import { CommonStringKeys, ContentData, Directory, File, IniRead, LocalizationRead, SearchOption, StringKey, type Game } from '@universalis/engine';
import { wordsOf } from '../ui/text.ts';

const FFG_KEY = /\{ffg:([A-Za-z0-9_]+)[:}]/g;
const FFG_NAME = /^\{ffg:([A-Za-z0-9_]+)\}$/;

/** The product titles the game's built-in packs name ({ffg:PRODUCT_TITLE_MAD23}), as their acronyms. */
function productTitles(game: Game): Map<string, string> {
  const titles = new Map<string, string>();
  const folder = game.gameType.dataDirectory();
  if (!Directory.exists(folder)) return titles;
  for (const file of Directory.getFiles(folder, 'content_pack.ini', SearchOption.AllDirectories)) {
    const pack = IniRead.readFromIni(file)?.get('ContentPack') ?? null;
    const name = FFG_NAME.exec(pack?.get('name') ?? '');
    const id = pack?.get('id') ?? '';
    if (name === null || id === '') continue;
    const acronym = new StringKey('val', id);
    let title = id;
    if (id === game.gameType.baseContentPackId()) title = CommonStringKeys.BASE.translate();
    // Without the game's symbol font, the acronym's symbol (a private-use character) is left out
    else if (acronym.keyExists()) title = acronym.translate().replace(/[\uE000-\uF8FF]/g, '').trim();
    titles.set(name[1]!, title);
  }
  return titles;
}

/** After GameSelectionScreen.loadLocalization: words for the keys of the game's packs, when the import has no texts. */
export function addSchematicNames(game: Game): void {
  const ffg = LocalizationRead.selectDictionary('ffg');
  if (ffg === null || ffg.getLanguagesList().length > 0) return;
  const keys = new Set<string>();
  for (const folder of [game.gameType.dataDirectory(), ContentData.customContentPackPath()]) {
    if (!Directory.exists(folder)) continue;
    for (const file of Directory.getFiles(folder, '*', SearchOption.AllDirectories)) {
      if (!/\.(ini|txt)$/i.test(file)) continue;
      for (const match of File.readAllText(file).matchAll(FFG_KEY)) keys.add(match[1]!);
    }
  }
  const titles = productTitles(game);
  ffg.addData(['.,English', ...[...keys].sort().map((key) => `${key},${titles.get(key) ?? wordsOf(key)}`)]);
}
