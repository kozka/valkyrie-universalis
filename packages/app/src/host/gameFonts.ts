// Valkyrie's own fonts for each game (GameType.GetFont, GetHeaderFont and GetSymbolFont, in its Resources/Fonts), which
// it loads from its Resources, not from the official import. They are fetched from Valkyrie's repository at the base
// data's commit when the game is chosen, as its pictures are, because they carry FFG's icons: Mansions' MADGaramondPro
// draws its skills and symbols at U+F200–F20F, Descent's Gara_Scenario_Desc draws its symbols in place of some
// mathematical characters (EventManager.CHARS_MAP), and Descent_symbol the expansions'. Without them the app's own fonts
// stay, and Symbols.tsx names the symbols. Not ported from Valkyrie.
import { resourceUrl } from './baseData.ts';
import { markFonts } from './officialImport.ts';

/** Each game's fonts, by the family theme.css gives them. */
const FONTS: Record<'MoM' | 'D2E', Record<string, string>> = {
  MoM: {
    'MAD Garamond Pro': 'Resources/Fonts/MADGaramondPro.ttf',
    'Old Newspaper Types': 'Resources/Fonts/OldNewspaperTypes.ttf',
  },
  D2E: {
    'Gara Scenario Descent': 'Resources/Fonts/Gara_Scenario_Desc.ttf',
    Windlass: 'Resources/Fonts/Windl.ttf',
    'Descent Symbols': 'Resources/Fonts/Descent_symbol.ttf',
  },
};

const loading = new Map<string, Promise<boolean>>();

/** Gives the page a game's fonts, all or none, fetched once: whether it has them. */
export async function loadGameFonts(game: 'MoM' | 'D2E'): Promise<boolean> {
  if (typeof FontFace === 'undefined') return false;
  if (!loading.has(game)) {
    loading.set(
      game,
      (async () => {
        try {
          const faces = await Promise.all(Object.entries(FONTS[game]).map(([family, path]) => new FontFace(family, `url("${resourceUrl(path)}")`).load()));
          for (const face of faces) document.fonts.add(face);
          return true;
        } catch {
          // Without a connection, or a font the browser cannot read: tried again the next time the game is chosen
          loading.delete(game);
          return false;
        }
      })(),
    );
  }
  const loaded = await loading.get(game)!;
  // Marked each time, as reading the import again unmarks the game
  if (loaded) markFonts(game, true);
  return loaded;
}
