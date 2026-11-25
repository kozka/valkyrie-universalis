# Valkyrie Universalis

**[Jugar en el navegador](https://kozka.github.io/valkyrie-universalis/)** · [in English](README.md)

> **No oficial, hecha por fans.** Sin relación con Fantasy Flight Games, Asmodee ni Edge, y sin dinero de ningún tipo. La app no trae ni aloja contenido oficial: para jugar, cada jugador importa el de su copia de la app oficial, que se queda en su navegador.

Versión web (PWA) de Valkyrie, sin Unity y en TypeScript. Tiene un motor universal y un módulo por juego (Mansiones de la Locura y Descent 2ª edición), y lee tal cual los escenarios, los packs y la tienda de Valkyrie. El avance del port, fichero a fichero, está en `docs/port-status.md`.

## Cómo arrancarla

1. Instala [Node.js 24](https://nodejs.org) y [Git](https://git-scm.com); para las herramientas de `herramientas/`, también Python 3 (en Windows, `py -3`).
2. `git clone https://github.com/kozka/valkyrie-universalis.git`, y en esa carpeta, `npm install`.
3. En Windows, doble clic en `iniciar.bat`; en cualquier sistema, `npm run dev`. Se abre en `http://localhost:5173`.
4. Para trabajar en el código, también con una IA, lee antes `AGENTS.md` y `.agent/rules/`.

## Qué hay

| Ruta | Para qué |
| --- | --- |
| `AGENTS.md`, `CLAUDE.md`, `.agent/rules/` | Las reglas para trabajar en el código, en inglés y organizadas como las de Valkyrie, para personas y asistentes de IA |
| `docs/decisiones.md` | Qué es el proyecto y las decisiones tomadas |
| `docs/plan.md`, `docs/plan-editor.md` | El plan, y el del editor |
| `docs/contexto-tecnico.md` | Lo averiguado del código, los formatos, la tienda y los escenarios reales |
| `docs/port-status.md` | Avance del port, fichero a fichero de Valkyrie |
| `packages/` | El motor (`engine`), los módulos de Mansiones (`module-mom`) y Descent (`module-d2e`) y la app (`app`: Vite, React y PixiJS) |
| `tools/` | `start.mjs`, que abre la app (lo usa `iniciar.bat`); `sync-valkyrie-data.mjs`, que copia los datos base de Valkyrie; `build-schematic-tiles.mjs` y `build-schematic-tiles-d2e.mjs`, que preparan las losetas del modo esquemático de las pruebas (el de Descent, donde está su importación: solo saca tamaños y casillas), y la batería de escenarios (`tools/battery`) |
| `tests/` | Tests que usan varios paquetes y la línea base de la batería (`tests/battery/baseline.json`) |
| `referencias/` | Scripts para clonar Valkyrie y la tienda y para descargar los escenarios y los packs; nada de lo descargado se sube |
| `herramientas/` | Herramientas en Python para crear y revisar escenarios de Mansiones, Descent y DooM, y el analizador del corpus |
| `datos/` | Lo medido en los 227 paquetes de la tienda, con sus 2.427 aventuras |
| `LICENSE`, `NOTICE` | Apache-2.0, la licencia de Valkyrie, y el aviso de que el código se porta de Valkyrie |
| `vercel.json`, `.github/workflows/pages.yml` | Cómo se construye la app publicada en Vercel y en GitHub Pages |
| `packages/app/brand/` | Los dibujos de kozka: el logo, el emblema, los marcos y los fondos. No los cubre la licencia Apache-2.0: pide permiso antes de usarlos en otra cosa |

## Comandos

| Comando | Qué hace |
| --- | --- |
| `iniciar.bat` (doble clic, en Windows) o `node tools/start.mjs` | Abre la app en el navegador (`http://localhost:5173`); si cambió `package-lock.json`, antes instala las dependencias. Para pararla, cierra la ventana |
| `npm install` | Instala las dependencias (la primera vez y cuando cambie `package.json`; `iniciar.bat` lo hace solo) |
| `npm test` | Los tests portados de Valkyrie y los propios, con Vitest |
| `npm run typecheck` | Comprueba los tipos de todos los paquetes |
| `npm run battery` | Carga todas las aventuras descargadas y las compara con la línea base; necesita `referencias/descargas` |
| `npm run sync-data` | Vuelve a copiar los datos base del commit fijado de Valkyrie; necesita `referencias/valkyrie` |
| `npm run dev` | La app en el navegador, en modo desarrollo (`http://localhost:5173`, siempre ese puerto, porque el navegador guarda los datos del jugador por dirección), sin mirar las dependencias |
| `npm run test:app` | Prueba la app en un navegador de verdad, de escritorio y de móvil, con Playwright; la primera vez, `npx playwright install chromium` |

## Dónde se publica

Cada cambio que entra en `main` se publica solo en dos sitios: [GitHub Pages](https://kozka.github.io/valkyrie-universalis/) (`.github/workflows/pages.yml`) y [Vercel](https://valkyrie-universalis.vercel.app/) (`vercel.json`).

El navegador guarda los datos del jugador (escenarios, colección, importación oficial y partidas) por dirección: cada una de esas dos, y `localhost:5173`, van aparte. La importación oficial se hace en cada dispositivo y se queda en él; nunca se sube. Sin ella, el juego se abre igual para ver sus escenarios, y la importación se pide al empezar uno.

**Instalarla**: en Chrome y Edge, con el botón «Instalar la app» del inicio o el del navegador; en iPhone y iPad, desde Compartir → «Añadir a pantalla de inicio» (allí la app instalada guarda sus datos aparte de los de Safari, así que conviene instalarla antes de importar). Instalada, abre sin conexión, y cuando se publica una versión nueva avisa para recargar. Para llevar las partidas, la colección y los escenarios bajados a otro navegador, dispositivo o dirección, Opciones tiene la copia de seguridad.

## Tres reglas

- Todo lo que abre Valkyrie se abre igual, y nada de lo que ya existe se toca.
- Nada de la editorial dentro del proyecto: lo importa cada jugador en su navegador.
- Primero todo lo que hace Valkyrie; los extras de la web, después.
