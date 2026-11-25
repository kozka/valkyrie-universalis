# Valkyrie Universalis: qué es y decisiones

Una versión web (PWA) de [Valkyrie](https://github.com/NPBruce/valkyrie), sin Unity y en TypeScript, hecha por fans y no oficial. Tiene un motor universal y un módulo por juego: Mansiones de la Locura 2ª edición y Descent 2ª edición, con DooM. Abre tal cual los escenarios, los packs de contenido (oficiales y de la comunidad) y las listas de la tienda de Valkyrie, y convive con la app de escritorio.

- **Plan**: `docs/plan.md`; el del editor, `docs/plan-editor.md`.
- **Todo lo averiguado** (código de Valkyrie, formatos, tienda, packs y rarezas reales de los escenarios): `docs/contexto-tecnico.md`.
- **Avance del port**, fichero a fichero: `docs/port-status.md`.
- **Repositorios de referencia**: en `referencias/`. Sus clones y descargas no se suben; los scripts y su README, sí (`node referencias/clonar.mjs`, `node referencias/descargar-escenarios.mjs`).
- **Herramientas**: `herramientas/` tiene, en Python, las skills para crear escenarios de Mansiones (`mansiones-valkyrie`) y de Descent y DooM (`descent-valkyrie`, `doom-valkyrie`): validador, mapas, catálogos y esqueletos; y el analizador del corpus.
- **Reglas para trabajar en el código**, también con una IA: `AGENTS.md` y `.agent/rules/`.

## Decisiones tomadas

Si alguna cambia, se actualizan esta tabla y `docs/plan.md`.

| Tema | Decisión |
| --- | --- |
| Nombre | Valkyrie Universalis, de momento |
| Lenguaje | TypeScript, en modo estricto |
| Lógica de juego | Portada a TypeScript calcando el C# de Valkyrie fichero a fichero; nada de C# compilado a WebAssembly |
| Interfaz | React |
| Tablero | PixiJS 8, con filtros, partículas y Spine; el 3D queda abierto detrás de una capa propia |
| Escenarios nuevos | En el formato de Valkyrie (el 21), sin JSON: un formato propio queda para una posible fase 4 del editor. Universalis lee todos los de Valkyrie (formatos 4 a 21) (23 de octubre de 2026) |
| Editor | El de Valkyrie bien hecho, para Mansiones, Descent y DooM (Mansiones primero), en ordenador y tabletas grandes, escribiendo exactamente lo que escribe el de Valkyrie; lo que Universalis haga de más, en un fichero aparte (fase 3). Abierto a prueba desde el 12 de noviembre de 2026 en la app publicada, con un aviso grande al entrar («El editor no está listo») y solo en ordenador (`EDITOR_PREVIEW` en `packages/app/editorPreview.ts`; con `false`, otra vez solo en desarrollo). Plan en `docs/plan-editor.md` (23 de octubre de 2026) |
| Alcance | Mansiones, Descent y sus packs, DooM incluido; ni Imperial Assault ni Descent 3 |
| Prioridad | Primero todo lo que tiene Valkyrie (jugar, tienda, packs, editor); los extras de la web, después |
| Datos base | Los `.ini` y `.txt` de `content/MoM`, `content/D2E` y `text`, y los textos de `Resources` que usan las reglas (`slidepuzzles.txt`), copiados del commit fijado de Valkyrie con un script. Las imágenes no se copian, porque entre ellas hay arte de la editorial: se descargan de ese mismo commit la primera vez y quedan en caché |
| Contenido oficial | Hay que importarlo para jugar, en los dos juegos, pero no para mirar: sin la importación, el juego se abre (menús, lista de escenarios, detalles, colección) y la importación se pide al empezar un escenario, antes de elegir investigadores o héroes, o al continuar una partida, y después se vuelve al escenario (`screens/ImportGate.tsx`; 6 de noviembre de 2026; antes, como en Valkyrie, el botón salía en gris). Los menús de cada juego suenan con lo que trae la app, elegido por kozka: un ambiente y su lista de música (`audio/menuSound.ts`, `audio/appMusic.ts`; 10 de noviembre de 2026), nunca con la de la importación. El modo esquemático queda para las pruebas automáticas y el desarrollo |
| Partidas | Formato propio que guarde y cargue bien; abrir las `.vSave` de escritorio solo si sale fácil |
| Licencia | Apache-2.0, la de Valkyrie: `LICENSE` y `NOTICE` en la raíz, y un aviso en cada fichero portado |
| Repositorio | GitHub, público (`kozka/valkyrie-universalis`). Los cambios entran por pull request y los revisa kozka |
| Publicación | GitHub Pages (`.github/workflows/pages.yml`) y Vercel (`vercel.json`), los dos desde `main`: solo estático, sin servidor. Cada dirección guarda aparte los datos del jugador |
| DooM | Un botón propio en el inicio, debajo de Descent, con los dibujos de kozka: Descent con el pack DooM cargado siempre y solo sus 11 misiones (las que piden `DooM`); Descent deja fuera el pack y esas misiones (11 de octubre de 2026, `screens/doom.ts`) |
| Móvil en vertical | Las partidas en horizontal, como Valkyrie: la pantalla gira sola donde se puede (Android, instalada o a pantalla completa) y si no se pide girar el móvil, con la opción de seguir en vertical; los menús, como se sostenga (11 de octubre de 2026, `host/orientation.ts`) |
| Temas | Universalis, el predeterminado, con los dibujos de kozka detrás de las pantallas y sus pantallas nuevas según llegan (la primera, la selección de investigadores de Mansiones, 17 de octubre de 2026); Clásico, los mismos dibujos con las pantallas de antes; colores lisos; y, por hacer, un «Valkyrie clásico» para los nostálgicos. El tapete por defecto es negro puro sin textura y la inclinación, la de Valkyrie (10°), como en Valkyrie (11 de octubre de 2026, `docs/temas.md`) |
| Puntuaciones | Como Valkyrie, al formulario de Google de Valkyrie, con permiso de Quantumrunner; una sola vez por escenario en cada dispositivo, y la nota se guarda en el dispositivo (13 de octubre de 2026, `screens/EndGameScreen.tsx`) |
| Valkyrie | Los fallos de Valkyrie que salen al portar se le cuentan a Quantumrunner, que la mantiene, en su repositorio |

## Reglas que no se negocian

1. **Compatibilidad**: todo escenario y pack que abre Valkyrie se abre igual en Universalis. Si algo se comporta distinto, el fallo es nuestro. Detalle en `.agent/rules/compatibility.md`.
2. **Convivencia**: solo se lee lo que existe (listas de valkyrie-store, repositorios de los autores, repositorio de Valkyrie). Nunca se escribe en ellos ni se replican sus escenarios ni sus packs; la única copia son los `.ini` y textos de Valkyrie, que son Apache-2.0 (ver «Datos base»). Lo exclusivo de Universalis va en un fichero aparte dentro de la carpeta del escenario o del pack, nunca dentro de sus `.ini`.
3. **Contenido de la editorial**: ni el código, ni el repositorio, ni la app publicada traen o alojan imágenes, sonidos o textos de FFG. Los importa cada jugador y se quedan en su navegador. Sin dinero de ningún tipo, y la app va etiquetada «no oficial, hecha por fans».
4. **Portar, no reinventar**: el comportamiento sale del C# del commit fijado en `referencias/README.md`. Se lee el C# y su test antes de escribir el TypeScript. Detalle en `.agent/rules/porting.md`.
5. **Tests primero**: se porta el test de NUnit, se ve fallar y luego se porta el código. La batería de escenarios no puede empeorar.
