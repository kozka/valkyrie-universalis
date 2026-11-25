---
trigger: always_on
---

# Compatibility with Valkyrie and its ecosystem

Universalis lives next to the desktop app for a long time. Authors keep publishing as they do today, and their work must appear in both apps. Evidence for every rule below is in `docs/contexto-tecnico.md`.

## Read only
- Sources: valkyrie-store lists (`MoM|D2E/manifestDownload.ini`, `MoM|D2E/contentPacksManifestDownload.ini`), authors' repositories (`url` + `<Name>.valkyrie` or `url` + `<Id>.valkyrieContentPack`), and Valkyrie's repository for base data.
- Never write to them, and never mirror their scenarios or packs: 106 of 118 MoM scenario repositories have no license. Each player downloads into their own browser (OPFS). The only copy is Valkyrie's own Apache-2.0 base data (see "Base data").
- Updates as in Valkyrie: store the `version` the list gave at download time, and offer an update when the list shows a different one. Valkyrie compares only `version`, never `latest_update`, for scenarios and for packs. Never recompute hashes: the listed SHA-256 does not match the file for 13 packages (11 of 169 MoM, 2 of 59 Descent).

## Network
- Only simple GET requests (no custom headers) to `raw.githubusercontent.com`. It sends `access-control-allow-origin: *` but answers 403 to `OPTIONS` preflights.
- GitLab `/-/raw/` sends no CORS; use the GitLab repository files API instead.
- No proxy on Vercel: its acceptable use policy forbids it.
- The statistics of a rated game (`EndGameScreen`, `StatsManager.PublishData`) go to Valkyrie's Google Form, as in Valkyrie, with Quantumrunner's permission (13 October 2026): a `no-cors` POST of the form, URL-encoded, with no headers of ours (`postForm` in `host/network.ts`). Google answers with no CORS, so the page cannot read the reply; only a network error can be told. Universalis sends each scenario once per device (`ratingOf` in `ui/marks.ts`), so that playing it again does not count twice in the store's figures; tests route the form's address and never reach it.
- The players' bugs and ideas (`ui/Feedback.tsx`) go the same way to kozka's own Google Form (`FEEDBACK_FORM`: its four questions' entries come from the form's `FB_PUBLIC_LOAD_DATA_`), a sheet he reads while the repository is private. Every question is optional there, so a changed form never rejects a report; tests route the address.
- The automatic translation (`host/translator.ts`) is the only other request with a body, and the only one with headers: a POST to OpenRouter's chat completions with the player's own key, which OpenRouter answers with CORS. The key lives in the browser's `localStorage`, never in `config.ini`, because backups carry `config.ini`.
- Covers (`url` + `image`) are plain `<img>` elements, which need no CORS. Lists and packages go through `fetch` (`host/network.ts`); a GitLab `/-/raw/<ref>/<path>` address becomes `gitlab.com/api/v4/projects/<project>/repository/files/<path>/raw?ref=<ref>`, both encoded (`host/storeAddress.ts`).

## Accept what Valkyrie accepts
- Scenario formats 4 to 21, including the legacy rules:
  - Old pack ids (`MoM1E`, `FA`, `CotW`).
  - The conversion-kit list for MoM formats below 17.
  - `EventEnd` handling for format 8 or lower.
- Parse `.ini` and `Localization.*.txt` exactly like `IniRead` and `DictionaryI18n`. That means first section and first key win, Valkyrie's comment rules and quote trimming, `|||` blocks, and the `\r` split rule for localization files.
- Component type by section-name prefix; unknown types are ignored.
- Media lookup:
  - Tile and token `customImage`, UI `image`, event `audio` and `music` go through `Quest.FindLocalisedMultimediaFile`, after a lookup by name in pack data (`ImageData` or `AudioData`).
  - Image puzzles try `PuzzleData` first, then the quest folder.
  - Custom monster `image` and `imageplace` are read straight from the quest folder.
- Paths:
  - Resolve `..` and doubled slashes as a file system would. Campaign sub-quests use `../../file.ini` and `../..//Sounds/x.ogg`.
  - Accept `\` everywhere. Valkyrie converts it itself for most keys, but not for `customImage` and `imageplace`, where it only works on Windows: there the validator warns.
  - Look files up case-insensitively, like Windows, and let the validator warn about letter-case mismatches.
- Content-pack zips may nest everything in one top folder (DooM does): look one level down, as Valkyrie does.
- Campaign packages: an event name that is the path of another `quest.ini` switches quest (`StartQuestEvent`, `Quest.ChangeQuest`). The path is relative to the first quest's folder, and only `%` and `$%` variables survive the switch. 17 of 59 Descent packages and 7 of 169 MoM packages use it, including the four TLE scenarios, which switch right after their intro (two clicks on its UI elements).
- Pictures are read by their content, not their extension, as Unity's `LoadImage` reads them: TLE names three JPEG tiles `.png`.
- Missing images, sounds and listed localization files are skipped, never fatal. The battery finds 75 missing media references in the MoM quests the list shows and 3 in Descent's.
- What Valkyrie treats as fatal still stops that scenario, with a clear message instead of closing the app. That covers a missing TileSide or tile image, a component defined in two files, and an `add=` to a missing component. The one exception is opt-in: the advanced option `blankTiles` sets `Quest.Tile.blankMissingTiles`, which draws a blank 3×3 tile instead (Valkyrie issue 1513); it is off by default and the battery runs without it.
- Descent's shop (`ShopInterface`) closes only when an event removes `#shop`, as the scenarios do; Valkyrie keeps it open even across a quest change. Do not close it anywhere else.

## Extending without breaking the desktop app
- Universalis-only data goes in its own file inside the scenario or pack folder (for example `universalis.json`). Valkyrie neither reads nor deletes it, and its packager zips the whole folder.
- Never put Universalis-only sections or keys inside the `.ini` files. Valkyrie's editor rewrites them from known fields only, on every save and package (`QuestEditor.Save`, `EditorTools.CreatePackage`).
- No component that Valkyrie knows may reference a Universalis-only one: an `add=` to a missing name crashes Valkyrie.
- The editor writes Valkyrie's own files and format, never JSON (kozka, 23 October 2026: a format of Universalis' own waits for a possible phase 4). What only Universalis would read (phase 3) goes in `universalis.json`, and the scenario forks on a plain variable, `universalis`, that Universalis sets to 1, so that Valkyrie plays its normal way.
- The player's own translation of a scenario (`host/customTranslation.ts`) is kept apart from the package (`<game>/Translations/<identifier>/<Language>.zip`, beside Valkyrie's folders, staying on disk like packages) and goes only into the copy the engine extracts to start a game (`Game.onQuestExtracted`): its texts replace that language's own files (or a new file is added to that copy's `quest.ini`), and its pictures and sounds go into `<Language>/<path>`, where `Quest.findLocalisedMultimediaFile` looks. Never write into the package or the scenario's folder.

## Base data
- The `.ini` and `.txt` files from `unity/Assets/StreamingAssets/content/MoM` and `content/D2E` (0.7 MB) are copied into the app from the pinned Valkyrie commit by a script, together with `StreamingAssets/text/Localization.*.txt` and the text files of `unity/Assets/Resources` that game rules read (`slidepuzzles.txt`, the slide puzzles' layouts).
- Images from those folders (155 files, 22 MB) are not bundled, because some are FFG art: scanned 1st-edition tiles, hero portraits and box icons. They are fetched on first use from `https://raw.githubusercontent.com/NPBruce/valkyrie/<pinned commit>/unity/Assets/StreamingAssets/content/…` and cached, so they always match the copied `.ini`.
- The few pictures and sounds of Valkyrie's `unity/Assets/Resources` that game rules use (the code puzzle's `symbol` and `element` pictures; the board's door, target, and Descent's monster frames and circles; the options' test sound) are fetched the same way. `Resources.Load` ignores letter case and the extension, but the repository's addresses do not: `platform/Resources.ts` names each file as it is (`Sprites/Door.png`, `Sprites/borders/Frame_Monster_1x1.dds`). Its DDS keep Unity's rows, as the import's do. Offline, the board draws them as a schematic.
- So are Valkyrie's fonts for each game, which it loads from its `Resources/Fonts`, not from the import, when the game is chosen (`host/gameFonts.ts`). Mansions': `MADGaramondPro` (© Adobe) draws its skills and symbols at U+F200–F20F, with `OldNewspaperTypes` for titles; an import made on Android brings no fonts, and until 11 October 2026 the app took Mansions' from the import, so with one the skills showed as words. Descent's: `Gara_Scenario_Desc` (© Adobe) draws Descent's nine symbols in place of `≥∏∂π∞∑μ≤±` (`EventManager.CHARS_MAP`), `Descent_symbol` draws the expansions' icons at U+E800–E812 (in the acronyms of Valkyrie's texts), and `Windl` (Windlass, shareware) has capitals only and no accented letters.

## Official import
- Universalis takes the import folder Valkyrie writes (`<AppData>/Valkyrie/<game>/import`: `import.ini`, `img/*.dds`, `audio/*.ogg`, `text/*.txt`, `fonts/*.ttf`), chosen as a folder or zipped, under any name. Valkyrie's ZIP import wants `import.ini` at the top of a zip with one of two names; Universalis also finds it one level down or in `<game>/import/`.
- It is used only when `FetchContent.NeedImport` says so: `[Import] Valkyrie=2` and `FFG` at least 1.5.0 for Mansions, 1.5.2 for Descent. Otherwise the game still opens, unlike Valkyrie, which greys its button (`GameSelectionScreen.DrawMoMSection`, `DrawD2ESection`): its menus, scenario list, details and collection can be looked at, and the import is asked for only to play (`screens/ImportGate.tsx`), when a scenario's Start is pressed, before the investigators or heroes, and when a saved game is chosen; after it, or after Back, the player is back at the game and that scenario (decided 6 November 2026; until then the button was greyed). The menus never play the import's music (FFG's): each game's menus have the app's own sound, an ambience and a list of music kozka chose (`audio/menuSound.ts`, `audio/appMusic.ts`, 10 November 2026). The schematic mode is for the tests and development only: a development build opened with `?schematic` (`schematicMode` in `host/officialImport.ts`) plays a game without its import, with the stand-ins.
- A zip made on a Mac carries `__MACOSX/` with an AppleDouble `._` copy of every file, and folders may hold `.DS_Store`: the app leaves them out (`isMacMetadata`). Valkyrie extracts them and never reads them.
- The copy is exact, never converted: the same files at the same paths, so `{import}/…` references, extension probing and `Localization_*.txt` listing behave as on disk. A real MoM import (FFG 2.0.3) is 740 MB: 1,190 DDS (DXT1, DXT5, BGRA32, RGB24; 55 are Unity's own interface textures that Valkyrie cannot read either), 340 OGG, 327 texts and 11 fonts.
- An import made on Android works too. Its pictures are PVR in ETC2 RGB or RGBA (`PvrToTexture`'s formats 22 and 23; some carry their smaller copies after the picture, which are skipped). A real one (FFG 2.0.3) is 423 MB in 1,363 files: 896 PVR, 8 DDS, 174 OGG, 284 texts and no fonts.
- Its tiles have half the pixels of a computer's (1024 instead of 2048; the other pictures keep their size). Valkyrie halves MoM's `TilePixelPerSquare` on Android; Universalis halves it only for a tile whose picture is PVR, so that the scenarios' own pictures keep the desktop scale.
- Descent's import (from Road to Legend, `D2E/import`) has the same layout and no fonts: Valkyrie draws Descent with its own (`Resources/Fonts`: `Windl`, `Gara_Scenario_Desc`, `Descent_symbol`). One made on Android (FFG 1.5.5) has 892 files, 300 MB: 784 PVR, 19 DDS, 73 OGG and 14 texts. Its 203 tile pictures are square, 1024, 512 or 256 pixels, all ETC2 RGBA, and `D2EGameType.TilePixelPerSquare` stays 105 on every platform: on each, the tile's squares fall exactly on its TileSide's grid (`top`, `left`).
- Not yet: reading the official app's own files (`resources.assets`, Android's `.obb`), which the import screen refuses with a message.

## Saves
- Universalis writes Valkyrie's layout (a zip with `save.ini`, `image.png` and the scenario under `quest/`) with paths of its own virtual file system, and keeps it in the browser. Reading desktop `.vSave` files is optional: their `save.ini` carries Windows paths, which `SaveManager.Load` would have to map.
