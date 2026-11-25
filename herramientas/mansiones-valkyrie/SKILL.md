---
name: mansiones-valkyrie
description: Crea, edita, depura, traduce y empaqueta escenarios de Las Mansiones de la Locura 2ª edición (Mansions of Madness 2nd ed., MoM) para Valkyrie, la app libre de NPBruce, y resuelve dudas sobre las reglas del juego, sus expansiones y el formato de ficheros de Valkyrie (quest.ini, events.ini, tokens.ini, Localization.Spanish.txt, paquetes .valkyrie). Úsala siempre que se mencione Valkyrie, Mansiones de la Locura, Mansions of Madness, MoM, escenarios o aventuras caseras o fan-made, el editor de escenarios, losetas, fichas, eventos, Mitos, monstruos, rompecabezas o publicar en la tienda de Valkyrie, aunque no se pida expresamente; también para planificar la historia, los personajes, los giros, el ritmo ronda a ronda, el mapa y el equilibrio de un escenario, para escribir sus textos, o para revisar uno existente con una rúbrica.
license: Instrucciones y scripts propios. Datos derivados de Valkyrie (Apache-2.0); geometría y contenido de losetas de ValkyrieMCP (MIT); ver LICENCIAS.md
compatibility: Python 3.8 o superior. Pillow solo para dibujar mapas (scripts/mapa.py --png).
---

# Mansiones de la Locura + Valkyrie

Esta skill convierte una idea de historia en un escenario de Valkyrie jugable, validado y listo para
publicar, y sirve de referencia completa del juego de mesa y de la app. Todo lo técnico está
comprobado contra el código fuente de Valkyrie 3.28 (formato 21) y contra 168 escenarios publicados.

Responde en español salvo que el usuario use otro idioma. Explica las cosas en términos de juego
("la ficha de Exploración de la puerta norte"), no solo en términos de ficheros.

## Qué hay dentro

| Fichero | Para qué | Cuándo leerlo |
|---|---|---|
| `references/formato-escenario.md` | Especificación de todos los ficheros y claves, cómo ejecuta Valkyrie los eventos, variables, disparadores, marcado de texto | Antes de escribir o arreglar cualquier `.ini` |
| `references/patrones.md` | Recetario: arranque, explorar, buscar, personajes, tiradas, objetivo, tiempo, Mitos, monstruos, objetos, puzles, UI, finales, variación | Al construir cada parte del escenario |
| `references/mapa-losetas.md` | Coordenadas, tamaños, rotaciones, dónde van las fichas | Al colocar losetas y fichas |
| `references/catalogo.md` | IDs de losetas, monstruos, objetos, investigadores, fichas, imágenes, audio, puzles, variables de Mitos y activaciones oficiales | Para elegir componentes (mejor con `scripts/buscar.py`) |
| `references/reglas-mom.md` | Reglas completas del juego, FAQ, erratas, glosario español-inglés y puente con Valkyrie | Dudas de reglas y para redactar con la terminología oficial |
| `references/expansiones.md` | Productos, reglas nuevas, monstruos e investigadores de cada expansión, IDs de pack | Al usar contenido de expansiones |
| `references/valkyrie-app.md` | Instalar, importar, jugar, editor (y lo que hace mal), rutas, probar, publicar, traducir, problemas | Dudas sobre la app, para publicar y cuando el usuario también usa el editor de Valkyrie |
| `references/diseno-escenarios.md` | Proceso, plantilla de documento de diseño, estructura, equilibrio, escritura, críticas habituales | Al planificar y al revisar la calidad |
| `references/ritmo.md` | Hoja de ritmo ronda a ronda: latidos, hilos, curva de tensión, trabajo para todos, detalles opcionales | Al diseñar (antes de los ficheros) y al revisar |
| `references/investigacion.md` | Investigar como en un librojuego: red de preguntas, tres pistas, salas descritas al ponerlas, contenido coherente, pistas que se usan, decisiones con información, tiradas por número de éxitos, despistes, cuaderno de lo que no cuadra, reglas propias, lo que se gana da acciones nuevas; y qué cambiar al revisar | Al diseñar (antes del mapa), al escribir cada sala y al revisar cualquier escenario |
| `references/mecanismos-ui.md` | Aparatos hechos con UI: interruptores, teclados con memoria (el piano), visores con números, diales, recorridos en primera persona, mochilas con ranuras, bucles que se llaman a sí mismos | Cuando la escena pide algo que la mesa maneje (una máquina, una caja fuerte, un mapa) |
| `references/desafios.md` | Enigmas que se piensan, amenaza que caza, decisiones que pesan, responder como personaje, desafío justo, plantar y cobrar el giro, efecto «¡oh!», con recetas | Al diseñar los desafíos y al construirlos |
| `references/escritura.md` | Oficio de escritor: estructura, frase a frase, personajes, vicios de principiante (sí/no), estilos de autor | Antes de escribir textos y al revisarlos |
| `references/partida-de-mesa.md` | Simular partidas de mesa (posiciones, 2 acciones, dados, Horror) con 2, 3 y 4 investigadores sobre el motor de Universalis: montar el perfil del escenario, batería de partidas, cómo leer la tabla, errores que engañan y lecciones de diseño (ventanas de una ronda, trabajo para el cuarto, compensar a 2) | Antes de dar por bueno el ritmo y el equilibrio, y cuando el usuario pida «jugarla de verdad» |
| `references/revision.md` | Rúbrica de nueve criterios (1-5) y encargo para un revisor independiente | Al terminar un escenario y al revisar uno ajeno |
| `references/datos-tienda.md` | Qué tienen los escenarios mejor valorados de la tienda (127 con 40 partidas o más) | Al planificar, para decidir dónde poner el esfuerzo |
| `assets/ejemplo/LaCasaDelRelojero/` | Escenario completo de ejemplo (6 losetas, 101 componentes, 3 finales, sin expansiones) que valida sin avisos | Como modelo de casi cualquier patrón |
| `assets/contenido_losetas.json` | Qué hay dibujado en cada una de las 174 caras de loseta de 2ª ed.: zonas de movimiento con su nombre y contorno, 1.955 objetos con su posición y una descripción, en español e inglés | No hace falta leerlo: `scripts/losetas.py` |
| `assets/catalogo.json`, `assets/geometria_losetas.json` | Datos para los scripts | No hace falta leerlos |

Las rutas `references/…`, `scripts/…` y `assets/…` son relativas a la carpeta de esta skill (la que
se indica al cargarla). Los ficheros de referencia son largos: mira primero su índice y lee solo la
sección que necesites (o búscala con grep).

## Reglas de oro

Lo que más escenarios rompe. Detalles en `formato-escenario.md`.

1. **Un solo evento con `trigger=EventStart`**: con varios, el orden no es fiable.
2. **`event1=A B C` ejecuta UNO**: el primero habilitado (o uno al azar con `randomevents=true`).
   Para hacer A, luego B, luego C, encadénalos (A → B → C).
3. **Un evento silencioso (`display=false`) necesita `buttons=1`** para continuar a su `event1`.
4. **Las fichas ignoran `vartests`**: aparecen cuando un evento las añade (`add=`) y desaparecen con
   `remove=`. Para apagar una opción, condición en el botón o `vartests` en el evento destino.
5. **Cada botón necesita su etiqueta** (`EventX.button1,Continuar`), o se ve la clave.
6. **Errores que cierran Valkyrie**: el mismo componente en dos ficheros, `add=` a un nombre que no
   existe, una línea con solo espacios, una loseta sin `side` (o de una expansión que falta en
   `packs=`, para quien no la tenga), un fichero de `[QuestData]` que no existe o con otras
   mayúsculas, un CustomMonster sin `base` ni `activation` o cuya `activation` no existe.
7. **Localización**: primera línea `.,Spanish`; `clave,valor` (se parte en la primera coma); `\n`
   para saltos de línea; valores con comillas entre `|||…|||`; **nunca mezcles finales de línea**.
   Una búsqueda `{qst:…` sin su `}` hace que el evento se quede a medias al enseñar el texto.
8. **Coordenadas**: 1 espacio = 3,5 unidades, y crece hacia arriba (norte), las losetas se anclan en
   su esquina superior izquierda y giran en sentido antihorario (las de `customImage`, en cambio, se
   centran en su punto). No calcules a mano: `mapa.py` y `losetas.py`.
9. **Retira siempre las UI**: con una UI en pantalla no funciona "Fin de fase".
10. **Un QItem por evento** (con varios se entregan todos pero no se ve ninguna carta). Valkyrie no
    sabe quién lleva cada objeto: usa variables.
11. **Toda partida necesita finales**: victoria (`$end,=,1`), derrota por tiempo y derrota con
    `trigger=Eliminated`.
12. **Valkyrie no conoce posiciones, Daño, Horror, Estados ni Pistas**: el texto dice a los
    jugadores qué hacer ("el investigador más cercano…", "ganas 1 Pista") y ellos lo aplican.
13. Escala con `#heroes`: vida de monstruos, Mitos y plazo (mortales en la ronda K − `#heroes`, con
    K = 20 para 2-3 horas y menos para partidas cortas: tabla en `patrones.md` §9) y pistas necesarias.
14. **Escenario en varias partes** (`event1=Parte2/quest.ini`): la ruta es relativa a la carpeta del
    `quest.ini` principal; solo pasan las variables `%` y `$%`; nada de variables de un carácter; y
    cada parte con `Localization.English.txt`, porque tras el cambio Valkyrie no carga el
    `defaultlanguage` (`formato-escenario.md` §19). Valida desde la carpeta principal.
15. **Nunca `minhero`/`maxhero` en un evento de Mansiones**: los retratos se quitan al empezar y el botón
    no avanza (partida bloqueada; `validar.py` lo marca como error). Para saber a quién le pasa algo:
    apodo, `{rnd:hero}` o un botón por investigador (`scripts/selector_investigador.py`, `patrones.md` §5).

## Flujo A: crear un escenario nuevo

1. **Diseño.** Rellena con el usuario el documento de diseño de `diseno-escenarios.md` §2: premisa,
   estilo, verdad oculta, lo que se planta y el giro, personajes, orden de revelación, mapa, pistas,
   objetivo, monstruos, puzles, tiempo y finales. Empieza por la **red de preguntas**
   (`investigacion.md` §2): qué querrá averiguar la mesa y qué lleva de una cosa a otra; el mapa sale
   de ahí. Haz la **hoja de ritmo** (`ritmo.md`) y elige los
   desafíos y decisiones (`desafios.md`) antes de tocar un fichero: es lo que hace que el escenario
   sea bueno, no solo que funcione. Pregunta solo lo que cambie mucho el resultado (tema, número de
   investigadores, duración, expansiones que tiene); decide el resto con valores razonables y dilo.
   Si el usuario quiere "algo rápido", propón tú una historia completa. Los textos, con
   `escritura.md`.
2. **Esqueleto.**
   ```bash
   python scripts/nuevo_escenario.py MiEscenario --titulo "Título" --destino <carpeta> \
          [--loseta TileSideEntryHall] [--duracion 60-90] [--minhero 2] [--maxhero 4] \
          [--dificultad 0.6] [--packs "SoA"] [--autor "Nombre"] [--idioma Spanish] [--ingles]
   ```
   Crea arranque, prólogo, primera loseta, investigadores, una Exploración en una puerta (o en un
   borde abierto si la loseta es una calle o un muelle), una Búsqueda, escalada de Mitos y plazo
   calculados con `--duracion`, aviso de tiempo, objetivo y finales, y muestra la tabla de rondas
   por número de investigadores. Valida sin errores. `objetivo=1` es provisional: escálalo
   (`patrones.md` §8) cuando haya varias fuentes de progreso.
3. **Mapa.** Elige losetas por lo que tienen dibujado (`python scripts/losetas.py buscar altar`,
   `… buscar biblioteca chimenea --pack MoMBase`) o por nombre (`python scripts/buscar.py biblioteca
   --tipo losetas`), mira sus zonas, puertas y objetos (`python scripts/losetas.py ver TileSideLibrary`)
   y calcula posiciones
   (`python scripts/mapa.py MiEscenario --colocar TileSideLibrary --junto-a TileInicio --lado N`).
4. **Contenido.** Construye zona a zona con `patrones.md`: ficha de Exploración → evento que revela
   loseta y fichas → búsquedas, interacciones, personajes → progreso → objetivo → final. Usa el
   ejemplo `assets/ejemplo/LaCasaDelRelojero` como modelo.
   **Describe cada sala al colocarla** con lo que llama la atención, y que cada ficha salga de esa
   descripción y dé algo que encaje con dónde se busca (`investigacion.md` §3-§5): nada de registrar
   por si acaso.
   Coloca cada ficha donde tenga sentido y escribe su texto con lo que hay dibujado allí (sección
   «Lo que hay dibujado en las losetas»): `python scripts/losetas.py colocar MiEscenario
   Tile_cocina:fogón` da `xposition`/`yposition` sobre ese objeto; `:s2`, en una zona libre.
   Para cambios grandes, edita con la librería (respeta el formato exacto de Valkyrie):
   ```python
   import sys; sys.path.insert(0, "<ruta de la skill>/scripts")
   from valkyrie_io import Scenario
   sc = Scenario.load("MiEscenario")
   sc.set("TokenEstanteria", type="TokenSearch", xposition="1.75", yposition="1.75",
          buttons="1", event1="EventEstanteria")
   # va a tokens.ini (fichero por defecto según el tipo; se cambia con sc.source[nombre])
   sc.set_text("Spanish", "TokenEstanteria.text", "Una estantería cubierta de polvo.")
   sc.set_text("Spanish", "TokenEstanteria.button1", "{action} Registrar la estantería")
   sc.rename("TileInicio", "TileVestibulo")   # cambia también referencias, textos y {c:TileInicio}
   sc.delete("EventBuscarFallo")              # borra sus textos y lo quita de las listas que lo citan
   sc.references("TokenEstanteria")           # quién lo cita: [(componente, clave)]
   sc.save()                                  # CRLF y comillas como el editor
   ```
   Para cambios pequeños, edita los `.ini` y la localización a mano siguiendo las reglas de oro.
5. **Validar** hasta que no haya errores y revisar los avisos:
   `python scripts/validar.py MiEscenario` (`--json` para procesarlo).
6. **Revisar la historia y el mapa**: `python scripts/grafo.py MiEscenario` (esquema de qué dispara
   qué, en el orden real de ejecución; señala lo inalcanzable), `--html <fuera>/grafo.html` para un
   diagrama, y `python scripts/mapa.py MiEscenario --png <fuera>/mapa.png --zonas` (con las zonas y
   objetos de cada loseta). Mira el PNG. Guarda estos ficheros **fuera** de la carpeta del escenario.
7. **Revisión independiente** (`revision.md`): un revisor que no ha visto el diseño (un subagente,
   si se puede, con el encargo de §4) recorre la partida como una mesa, ronda a ronda, con el
   mínimo y el máximo de investigadores, y puntúa los nueve criterios con ejemplos. Arregla lo que
   quede por debajo de 4 y vuelve a pasarla. Una simulación mecánica (la pestaña «Análisis» del
   editor de Valkyrie Universalis) ayuda a ver tramos muertos y caminos que no se toman, pero no
   sustituye al recorrido razonado. Para el tiempo y el equilibrio por número de jugadores, juega
   la batería de partidas de mesa (`partida-de-mesa.md`: mínimo, 3 y máximo de investigadores × mesa
   ingenua y mesa que sabe × 10 semillas) y lee dos o tres registros enteros antes de concluir.
8. **Entregar**: la carpeta del escenario comprimida (para copiarla en la carpeta `Editor` de
   Valkyrie) y, si lo quiere probar como jugador o publicar, el paquete:
   `python scripts/empaquetar.py MiEscenario --salida <carpeta>` crea `<carpeta>/MiEscenario/` con
   `.valkyrie`, `.ini` y portada, igual que "Crear paquete" del editor (si ya existe, crea
   `MiEscenario2`…; `--sobrescribir` reutiliza la carpeta). No mete ficheros de trabajo (.md, .html,
   .py…) salvo con `--todo`. Explica dónde copiar cada cosa (`valkyrie-app.md` §5 y §7) y recuerda
   probar con el mínimo y el máximo de investigadores del escenario. Si la conversación está enlazada
   al ordenador del usuario, ofrece escribir la carpeta directamente en
   `%APPDATA%\Valkyrie\MoM\Editor\<Id>\` (pidiendo acceso a esa carpeta) para abrirla en el editor.

El identificador (nombre de carpeta) va sin espacios ni acentos y nunca `EditorScenario…`.

## Flujo B: revisar o arreglar un escenario existente

1. Consigue la carpeta (los escenarios en edición están en `%APPDATA%\Valkyrie\MoM\Editor\<Id>\`).
   Un `.valkyrie` es un ZIP: descomprímelo en una carpeta con el nombre del identificador.
2. `validar.py`, `grafo.py`, `mapa.py` (informe y PNG con `--zonas`) y `losetas.py donde <carpeta>`
   (en qué zona y junto a qué objeto cae cada ficha). Si los avisos son muchos, agrúpalos. Si piden
   revisar la calidad (no solo que funcione), haz además la revisión con rúbrica de `revision.md` y la lista de
   `investigacion.md` §13, que acaba en cambios concretos por componente («quitaría esto, aquí
   mejor esto»).
3. Explica cada problema en términos de juego y propón el arreglo. Respeta el estilo del autor y no
   renombres componentes sin necesidad (los textos dependen del nombre). Si el autor usa también el
   editor de Valkyrie, recuérdale lo que este hace mal (`valkyrie-app.md` §6): renombrar o borrar
   allí deja textos y disparadores rotos, y escribe los textos en el idioma de Valkyrie.
4. Corrige, vuelve a validar y entrega solo los ficheros cambiados o la carpeta completa.

Valkyrie también tiene sus propios síntomas (se cierra, el escenario no aparece, se queda parado):
tabla de diagnóstico en `valkyrie-app.md` §12.

## Flujo C: dudas de reglas, expansiones o de la app

- Reglas: `reglas-mom.md` (índice al principio; FAQ y errores habituales en §16).
- Qué trae cada expansión y sus IDs: `expansiones.md`; componentes concretos: `buscar.py`.
- Instalar, importar, rutas, editor, publicar: `valkyrie-app.md`.
- Si algo no está en las referencias y depende de la actualidad (versiones nuevas de Valkyrie,
  escenarios recientes), búscalo en la web y dilo.

## Flujo D: traducir

1. Copia las claves del idioma por defecto a `Localization.<Idioma>.txt` (primera línea
   `.,<Idioma>`) y tradúcelas conservando marcas (`{c:…}`, `{qst:…}`, `{rnd:hero}`, `{type}`,
   iconos como `{lore}`), etiquetas `<b>`/`<i>` y `\n`.
2. Añade el fichero a `[QuestText]` (con `valkyrie_io` basta `sc.set_text("English", …)` y `save()`).
3. Valida. Terminología oficial en español: `reglas-mom.md` §17.

## Flujo E: publicar

`empaquetar.py` → repositorio público de GitHub con los tres ficheros → issue `[Scenario] Nombre` en
NPBruce/valkyrie. Lista de comprobación y qué revisan los mantenedores: `valkyrie-app.md` §9.

## Lo que hay dibujado en las losetas

`assets/contenido_losetas.json` describe cada cara de loseta de 2ª edición: sus zonas de movimiento
(«despensa», «cocina», «cubierta oeste»…) con su contorno, por dónde se comunican y qué salidas del
borde dan a cada una, y los objetos dibujados en cada zona (chimenea, estantería, bañera, lápida…)
con su posición y una pista de uso (registrar, interactuar, esconderse, trepar, iluminar). Sirve para:

- **Elegir losetas** que cuenten la historia: `losetas.py buscar quirófano`, `… buscar altar`.
- **Colocar fichas con sentido**: Búsquedas sobre un objeto que se pueda registrar, personas y
  monstruos en el centro libre de una zona, Oscuridad o Fuego dentro de una zona (no en una pared).
  `losetas.py colocar` evita los sitios ya ocupados y gira las coordenadas con la loseta.
- **Escribir eventos localizados**: el texto de la ficha nombra lo que los jugadores ven en ese
  punto («Remueves las cenizas de la chimenea…»), y la descripción de la loseta da ambiente.
- **Revisar**: `losetas.py donde` y `mapa.py --png … --zonas` enseñan dónde cae cada cosa.

Es una ayuda, no un límite: describe lo dibujado, no lo que puede pasar. Un armario puede esconder
un pasadizo y una zona vacía puede tener lo que la historia necesite. Si los datos no encajan con lo
que el usuario ve, manda lo que ve (las anotaciones son manuales y puede haber pequeños errores);
si te pasa una imagen de la loseta, mírala. Las losetas de 1ª edición y las de `customImage` no
tienen zonas.

## Scripts

Todos en `scripts/`, sin dependencias salvo Pillow para `--png`. Ejecútalos con `python3` (o
`python` si es el nombre que hay, como en Windows).

| Script | Uso |
|---|---|
| `nuevo_escenario.py <Id> --titulo "…" [opciones del paso 2]` | Esqueleto jugable y válido |
| `validar.py <carpeta> [--json] [--sin-info] [--sin-mapa]` | Errores (cierran o rompen Valkyrie), avisos y sugerencias, también los de un escenario en varias partes (desde su carpeta principal); sale con 1 si hay errores |
| `grafo.py <carpeta> [--mermaid f.md] [--html f.html]` | Flujo narrativo: disparadores, botones, condiciones, finales, inalcanzables |
| `mapa.py <carpeta> [--png f.png [--zonas]]` | Informe del mapa: losetas, solapes, puertas y a qué llevan, fichas fuera; `--zonas` dibuja zonas y objetos |
| `losetas.py ver TileSideX` / `buscar <palabras> [--pack …]` | Zonas, salidas y objetos de una cara / caras que tienen todo eso dibujado (español o inglés) |
| `losetas.py colocar <carpeta> Tile_x[:zona\|objeto\|palabra] [--n 3]` / `donde <carpeta>` / `punto <carpeta> X Y` | Coordenadas libres en una zona o sobre un objeto / dónde cae cada ficha / qué hay en un punto |
| `mapa.py --info TileSideX` / `--colocar TileSideX --junto-a TileY [--lado N/E/S/O]` | Aberturas de una loseta / posiciones válidas junto a otra |
| `buscar.py <texto> [--tipo …] [--rasgo …] [--pack …]` | Busca en el catálogo (entiende español: "sótano", "linterna", "pasos"); `--tipo activaciones` lista las activaciones oficiales reutilizables |
| `empaquetar.py <carpeta> [--salida …] [--sobrescribir] [--todo]` | `.valkyrie` + manifiesto + portada, como el editor |
| `selector_investigador.py <carpeta> <Evento> "<pregunta>" [--apodo "el X"]` | Convierte un evento en una elección con un botón por investigador que juega (`#HeroX`) y pone el apodo en los textos siguientes |
| `universalis/partida_mesa.ts` + perfil (`perfil_ejemplo.ts`), `espacios_mesa.py`, `resumen_partidas.py` | Partidas de mesa simuladas con posiciones, acciones, dados y Horror; grafo de espacios del mapa; tabla comparativa por número de investigadores y estrategia (`partida-de-mesa.md`) |
| `universalis/jugar_azar.ts`, `universalis/jugar_guiado.ts` | Juegan el escenario en el motor de Valkyrie Universalis (Node 22.18+, `KIT=<valkyrie-universalis>` `QDIR=<escenario>`): bloqueos, textos con `{…}` sin sustituir, excepciones y qué finales salen (`valkyrie-app.md` §8) |
| `valkyrie_io.py` | Librería: `Scenario.load/set/set_text/rename/delete/references/save` con el formato exacto de Valkyrie |
| `construir_catalogo.py <clon de Valkyrie> [--packs <packs de la comunidad>]` | Regenera el catálogo si sale una versión nueva de Valkyrie o de TLE |
| `construir_losetas.py --mcp <clon de ValkyrieMCP> [--traducciones f.json]` | Regenera `contenido_losetas.json` conservando las traducciones; dice qué textos nuevos faltan por traducir |

## Lo que Valkyrie no puede hacer (y cómo se suple)

- No sabe dónde están las figuras ni qué objetos, Daño, Horror o Estados tiene cada uno → el texto
  da instrucciones y las variables recuerdan lo importante.
- No implementa los rompecabezas de Líneas ni de Anillos, ni las fichas de Contención, Llave o Mejora
  → se describen en el texto.
- No limita los pasos de los rompecabezas → los jugadores los cuentan.
- No deja elegir investigador durante la partida (los retratos desaparecen y `minhero`/`maxhero` en un
  evento la bloquea) → apodo, `{rnd:hero}` o un botón por investigador con `scripts/selector_investigador.py`
  (`patrones.md` §5).
- "Validar" y "Optimizar localización" del editor no hacen nada en 3.28 → `validar.py`.
