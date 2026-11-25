# AGENTS guidelines for Valkyrie Universalis

Valkyrie Universalis is a browser (PWA) port of [Valkyrie](https://github.com/NPBruce/valkyrie), written in TypeScript. It has one game-agnostic engine plus one module per game (Mansions of Madness 2nd ed., Descent 2nd ed.). It must open every scenario, content pack and store list that Valkyrie opens, and it lives side by side with the desktop app.

The plan (in Spanish) is in `docs/plan.md`, the editor's in `docs/plan-editor.md`; the verified technical findings are in `docs/contexto-tecnico.md`, and the state of the port file by file in `docs/port-status.md`. Topic rules are in `.agent/rules/`; follow them always.

## Development principles

These are Valkyrie's own principles, kept so that its maintainers feel at home.

### 1. Think before coding
- State your assumptions. If uncertain, ask.
- If several readings exist, present them; don't pick silently.
- If the plan and Valkyrie's code disagree, stop and say so.

### 2. Simplicity first
- Minimum code that solves the problem. No speculative features, abstractions or configuration.
- Comments: one line at most. Prefer clear code.

### 3. Surgical changes
- Touch only what the task needs. Match the existing style.
- Remove only what your own change made unused.

### 4. Update agent rules after implementation
- After anything non-trivial, check whether a file in `.agent/rules/` should learn something (a gotcha, a pattern, a missing entry). Add only what would prevent a future mistake.

### 5. Goal-driven execution
- Turn tasks into checks: "port X" means "port X's NUnit tests, see them fail, port X, see them pass".
- For multi-step work, state a short plan with a check per step.

## Project rules

### Port, don't reinvent
- Behaviour comes from Valkyrie's C# at the commit pinned in `referencias/README.md`. Read the C# and its tests before writing TypeScript. Details: `.agent/rules/porting.md`.

### Compatibility first
- Everything Valkyrie accepts, Universalis accepts, with the same result. Never write to the store, to authors' repositories or to Valkyrie's repository. Details: `.agent/rules/compatibility.md`.

### Official content
- Never commit, bundle or host files from Fantasy Flight Games (images, audio, text), and never link to third-party archives of them. Official content comes from each player's own import and stays in their browser.
- The FFG-derived images inside Valkyrie's own content folders are not bundled either: they are downloaded from Valkyrie's repository at use time, like scenarios.
- For local import tests, keep official files in `/contenido-oficial/`, which is git-ignored.
- Data derived from an import is built on the computer that has it, and only that data enters the repository: the size and squares of Descent's tiles, for the tests' schematic mode, come from `tools/build-schematic-tiles-d2e.mjs`, run there.
- Fan project: no money of any kind, labelled "unofficial, fan-made", no FFG logos or marks in the name.

### Priorities
- First, everything Valkyrie already does (play both games with their packs, store, editor). Web-only extras wait until that works.

### Tests
- Vitest for `engine` and modules, Playwright for the app.
- Ported tests keep Valkyrie's test names, so a failure maps back to its NUnit test.
- The scenario battery (`npm run battery`, once it exists; defined in `.agent/rules/porting.md`) loads every quest of every scenario package and every pack in `referencias/descargas/`, and it must never get worse than its baseline. Tests that need the clones skip with a clear message when `referencias/valkyrie/.git` or `referencias/descargas/` is missing. The `referencias/` folder itself always exists, because it holds the scripts.
- Do not edit the app's or the engine's source while Playwright runs: its development server reloads the page under test, and a test fails with an element "detached from the DOM" or a navigation it never made (23 October 2026: Descent's blacksmith test, while the editor was being written).
- A Playwright test that presses a piece of the board waits for the camera to stop and, on a phone, whose screen shows a few squares, drags the board to the piece first, as a player would (`pieceInView` in `descent.spec.ts`), clear of the heroes' column and of the Menu button, which a click there would press instead.
- A finger is not a pointer: a tap lands a few pixels off, and browsers fix that only for clicks, not for pointer events, which the board reads. A touch takes the topmost clickable quest UI element within `TOUCH_SLOP` of it, above what it landed on (`Board.ts`, 18 October 2026: Além do Beco's page arrows could not be pressed with a finger). `touch.spec.ts` taps beside one on the phone with `page.touchscreen`; a test that only presses elements exactly, or with the keyboard, would not have caught it.
- A Playwright test presses a scenario's own UI element with the keyboard (`press('Enter')` on `[data-quest-ui=<name>]`): on a phone held upright, a layout its author made for a wide screen can leave it off the screen or under the app's buttons.

### Localization
- No hardcoded UI text: keys only. Reuse Valkyrie's UI keys and translations (`StreamingAssets/text/Localization.*.txt`, copied with the base data) when the text is the same.
- The app's own texts (`packages/app/src/i18n`) come in Valkyrie's 13 languages, so that the screens follow the language chosen: a new key goes into every file, English first (the master), and `tests/texts.test.ts` checks it. Translations made by Claude say so at the top of their file, for natives to correct.
- The page asks browsers not to translate it (`translate="no"` and the `notranslate` class on `<html>`, `<meta name="google" content="notranslate">`, in `index.html`): a page translator rewrites React's text and inline nodes, and the next change React makes there throws `removeChild` (19 October 2026: Firefox translated the Russian page into Spanish, and changing the language in Options stopped the app). Keep them; `options.spec.ts` checks them.
- Where Valkyrie's own translation of a key the app shows is missing or empty, `src/i18n/valkyrie/` fills it; never replace one of Valkyrie's.

### Screens
- Scenario and pack texts can hold long addresses (102 descriptions of the store lists do): wrap them (`overflow-wrap: anywhere`) and give a grid column that holds them `minmax(0, 1fr)`, or a phone's screen grows past its width and its buttons end up under the text.
- Nothing may be wider than a phone outside a scroll box: the page grows, the phone draws it smaller, and Playwright's presses land on the wrong element (24 October 2026: the editor's status line, all `nowrap`; it wraps on a phone now). Find the culprit with `getBoundingClientRect().right` beyond the viewport, leaving out what sits inside an `overflow: auto` box.
- Phones are the narrowest case: check a new screen with the phone project of the Playwright tests, which a desktop run does not catch.
- Something shown beside a game's windows (the monster's panel) goes in their layout box (`.dialog-stack`), never `position: fixed` over them: sizes are in `rem`, so the text size (up to 130 %) times the television mode (×1.2) grows both until they meet (11 November 2026: the panel covered the attack and horror windows). Size it by the room the windows have (`cqh`/`cqw` of the `dialogs` container, whose `rem` is the page's real one, unlike a media query's), and check it with the largest text and the television mode on a phone held sideways (`monsterpanel.spec.ts`).
- No window may be drawn past its frame: whatever does not fit scrolls inside it (`.dialog-stack > .window`, `.window-layer > .window.panel`), and a window's own buttons stay in sight (sticky in the puzzles). Something sized by the screen as Valkyrie sizes it (the puzzles' unit, a thirtieth of the height) leaves no room for what is in `rem`; fit it to its window instead (`usePuzzleUnit`). `windows.spec.ts` opens every game window on three small screens with the largest text and checks them with `layoutFaults`: a new window goes there too.
- Portraits (monster icons, heroes, morale, the monster's picture) are sized by the screen's height, as Valkyrie's (`--unit`, `--monster-size`, `--hero-size` in `QuestScreen.css`), never by `rem`, so that they neither stay small on a big screen nor jump at a breakpoint; texts and buttons keep `rem` and the player's text size. Prefer fluid sizes (`clamp`, `min`) to new breakpoints.
- A rule for a narrow screen that a `display: contents` box unwraps still selects by the DOM: its children are not children of the grid (`.quest-text > .facts`, not `.quest > .facts`).
- What reacts to a monster coming (its shine, the epic spawn) compares against what each quest had when the game's screen first drew it (`noteQuestMonsters` in `play/Hud.tsx`), not against the list's own first drawing: the list only mounts once the first monster comes, so a game's first monster was never seen as new (12 November 2026).
- `.window`'s own width and gap (`screens/QuestScreen.css`) load after the stylesheets of the main menu's windows, in development and in the build, so a window's class alone does not change them: `.window.editor-warning`, not `.editor-warning` (12 November 2026: the editor's warning stayed at 48rem and wrapped its title in three lines).
- An option that restyles a theme's window (`data-buttons-apart`) must outweigh the theme's own selectors, which already carry `:root[data-theme][data-game]` and `.window.panel`: add the same classes (`.event-window.panel`) or the attribute to the theme's own rule, rather than relying on which stylesheet loads last.
- What Valkyrie sizes by the screen (its UI units) and the app in `rem` can outgrow a short screen: the monster list showed five icons whatever the height, and the sixth on were out of reach on a phone held sideways. Cap such sizes by `vh` and, where even that is not enough, show fewer; the engine's paging (`MonsterCanvas.offset`, never past the fifth from the end) then cannot reach the last ones, so the app keeps its own place (`MonsterList`, `useSlots`).
- Container queries and `cqh` arrived in Chrome 105: give a rule that needs them a fallback under `@supports not (container-type: size)` (or a `vh` value first and the `cqh` one inside `@supports (width: 1cqh)`), and check it with `withoutContainerQueries` (`tests/fixtures/layoutFaults.ts`). A custom property holding `cqh` is accepted by an old browser and only fails where it is used.
- The root tsconfig, which type-checks the Playwright tests, has no DOM types: code run in the page goes to `page.evaluate` as text (11 November 2026: `monsterpanel.spec.ts` broke `npm run typecheck`).
- A game asks a phone held upright to turn (`host/orientation.ts`). The tests' phone keeps playing upright because its storage says so (`universalis.upright` in `playwright.config.ts`); a test of the request removes it with `addInitScript` (DooM's in `descent.spec.ts`).
- DooM is Descent with its pack, under a button of its own (`screens/doom.ts`): Descent's list leaves out the scenarios whose `packs` name `DooM`, so a test that plays one goes through DooM's button.

### Environment
- Main development machine: Windows. Tooling in Node (`.mjs` or npm scripts), never bash-only. Build paths with `path.join`; never hardcode separators.
- Node.js 24 LTS, npm workspaces, TypeScript in strict mode.
- Browsers back to Chrome 97 (Array `findLast`) must work, because players keep old tablets (Chrome 101 on 19 October 2026). Before Chrome 102 a file in OPFS has no `createSyncAccessHandle` and until 108 its `truncate`, `flush` and `close` return promises: write through `openForWriting` (`host/opfs.ts`), which falls back to `createWritable`. Raw deflate in `DecompressionStream` came in Chrome 103: inflate through `rawInflater` (`host/importSource.ts`). To try an old Chrome, the npm package `@sparticuz/chromium@92.0.0` or `@103.0.0` (unpack its `.br` files, run it with `LD_LIBRARY_PATH` at its `lib`, `--host-resolver-rules="MAP * ~NOTFOUND , EXCLUDE localhost"` so that NSS does not crash on HTTPS, and Playwright's `connectOverCDP`; `getByRole` needs `checkVisibility`, so click through `evaluate`).
- `iniciar.bat` (`tools/start.mjs`) starts the app on Windows and runs `npm install` whenever the lockfile changed; keep it working there. The dev server keeps port 5173 (`strictPort`), because the browser keeps the player's data per origin, port included.
- The repository has no Prettier configuration: `npx prettier` alone rewrites a file in double quotes at 80 columns. If a file needs formatting, `--single-quote --print-width 200 --object-wrap collapse` comes closest to the code's style (8 November 2026).
- The version on the start screen is `packages/app/package.json`'s (`__APP_VERSION__`, set in `vite.config.ts`); change the root `package.json` and `package-lock.json` with it.
- Vercel's build server looked for the site in `dist/` at the repository root whatever `vercel.json` and the dashboard said (9 October 2026), while `vercel build` on a machine honoured them: Vite writes the site there (`build.outDir` in `packages/app/vite.config.ts`), and `vercel.json` says the same.

### Language and git
- Code, comments, commit messages and `.agent/` in English, as in Valkyrie, so that its maintainers can read them. Talk with people in their own language; the maintainer, kozka, writes in Spanish, and the plans in `docs/` are in Spanish.
- The maintainer reviews and merges every change. Commit or open a pull request only when asked. Small commits, imperative messages.
- The app is published from `main` by GitHub Pages (`.github/workflows/pages.yml`) and by Vercel (`vercel.json`).

## Starting a session

1. Read this file, the rules in `.agent/rules/`, and the part of `docs/plan.md`, `docs/plan-editor.md` or `docs/contexto-tecnico.md` the task touches.
2. `npm install`. Check that `referencias/valkyrie/.git` and `referencias/descargas/` exist; if not, run `node referencias/clonar.mjs` and `node referencias/descargar-escenarios.mjs` (about 3 GB, for the battery and the tests that need real scenarios).
3. Before and after a change: `npm test`, `npm run typecheck`, `npm run battery` (never worse than its baseline) and, for the app, `npm run test:app` (Playwright, desktop and phone). `npm run build` makes the published app in `dist/`.
4. Before something costly to redo, or when the plan and Valkyrie's code disagree, ask. After something non-trivial, update `docs/port-status.md` and, if it would prevent a future mistake, the rule in `.agent/rules/` it belongs to.
