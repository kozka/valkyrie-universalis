# Valkyrie Universalis

**[Play it in your browser](https://kozka.github.io/valkyrie-universalis/)** · [en español](README.es.md)

A web version (PWA) of [Valkyrie](https://github.com/NPBruce/valkyrie), the fan-made app for *Mansions of Madness* 2nd edition and *Descent: Journeys in the Dark* 2nd edition (with the community DooM pack). It runs in any modern browser, on a computer, an Android phone or tablet, or an iPhone or iPad, and can be installed as an app.

It opens the same scenarios, content packs and store lists as Valkyrie, unchanged, and plays them the same way: Valkyrie's C# is ported to TypeScript file by file, with its tests. It also has a scenario editor that writes the same files as Valkyrie's (still in an early stage).

> **Unofficial and fan-made.** Not affiliated with Fantasy Flight Games, Asmodee or Edge. No money of any kind. The app does not include or host any official content: to play, each player imports the content of their own copy of the official app, and it stays in their browser.

## Run it

You need [Node.js](https://nodejs.org) 24 and [Git](https://git-scm.com).

```
git clone https://github.com/kozka/valkyrie-universalis.git
cd valkyrie-universalis
npm install
npm run dev
```

Then open `http://localhost:5173`. On Windows, `iniciar.bat` does the same with a double click.

| Command | What it does |
| --- | --- |
| `npm run dev` | The app in development mode, at `http://localhost:5173` |
| `npm run build` | The published app, in `dist/` |
| `npm test` | Vitest: the tests ported from Valkyrie and the project's own |
| `npm run typecheck` | Type-checks every package |
| `npm run test:app` | Playwright, in a desktop and a phone browser (first time: `npx playwright install chromium`) |
| `npm run battery` | Loads every quest of the store and compares with the baseline (needs `node referencias/clonar.mjs` and `node referencias/descargar-escenarios.mjs`, about 3 GB) |

## How it is organised

| Path | What |
| --- | --- |
| `packages/engine` | The game-agnostic engine: events, variables, scenarios, packs, store, saves |
| `packages/module-mom`, `packages/module-d2e` | What only Mansions or only Descent has |
| `packages/app` | Screens (React) and board (PixiJS 8) |
| `tests/`, `tools/battery/` | Cross-package tests and the scenario battery |
| `referencias/` | Scripts that clone Valkyrie and its store and download the scenarios; nothing downloaded is committed |
| `herramientas/` | Python tools to create and check scenarios for Mansions, Descent and DooM |
| `docs/` | The plan, the editor's plan, the technical findings and the state of the port (in Spanish) |
| `AGENTS.md`, `.agent/rules/` | The rules for working on the code, for people and AI assistants alike |

## Contributing

Issues and pull requests are welcome. Please read `AGENTS.md` first: the main rule is that whatever Valkyrie opens must open and play the same here, so behaviour is ported from Valkyrie's code, not reinvented. Bugs found in Valkyrie itself are reported to [its repository](https://github.com/NPBruce/valkyrie/issues).

## Licence and credits

- Code: [Apache-2.0](LICENSE), like Valkyrie, from which most of the logic is ported (see [NOTICE](NOTICE)). Valkyrie is by NPBruce, Quantumrunner and its contributors.
- Artwork in `packages/app/brand/`: by kozka. It is not covered by the Apache-2.0 licence; ask before reusing it.
- Music and sounds: their authors and terms are listed in `packages/app/src/assets/music/` and `packages/app/src/assets/sound/README.md`.
