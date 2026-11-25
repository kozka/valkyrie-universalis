---
name: descent-valkyrie
description: Crea, edita, depura, traduce y empaqueta aventuras y campañas de Descent Viaje a las Tinieblas 2ª edición (Journeys in the Dark 2nd ed., D2E) para Valkyrie (app libre de NPBruce), en el modo Road to Legend (Camino a la leyenda), y resuelve dudas de reglas, expansiones y formato de ficheros de Valkyrie para Descent (quest.ini, events.ini, spawns.ini, Localization, .valkyrie). Úsala siempre que se mencione Descent, Viaje a las Tinieblas, Road to Legend, Camino a la leyenda, D2E, aventuras o campañas caseras o fan-made de Descent, piezas de Descent, grupos de monstruos, activaciones, lugartenientes, moral, tienda, fama, peligros o publicar en la tienda de Valkyrie, aunque no se pida expresamente; también para planificar la historia, el ritmo ronda a ronda, las decisiones, el mapa y el equilibrio de una aventura, para escribir sus textos, o para revisar una existente con una rúbrica. Para misiones del pack de la comunidad DooM, úsala junto con doom-valkyrie.
license: Instrucciones y scripts propios. Datos derivados de Valkyrie (Apache-2.0); ver LICENCIAS.md
compatibility: Python 3.8 o superior. Pillow solo para dibujar mapas (scripts/mapa.py --png) y regenerar las losetas.
---

# Descent 2ª edición + Valkyrie

Esta skill convierte una idea de historia en una aventura o una campaña de Descent para Valkyrie, jugable,
validada y lista para publicar, y sirve de referencia completa del juego de mesa, de Road to Legend y de la
app. Valkyrie juega Descent como Road to Legend: sin Señor Supremo, la app prepara la mesa, revela el mapa y
activa a los monstruos, y los jugadores mueven, tiran y aplican las reglas. Todo lo técnico está comprobado
contra el código fuente de Valkyrie 3.28 (formato 21) y contra los 59 paquetes de Descent de su tienda (295
`quest.ini`).

Responde en español salvo que el usuario use otro idioma. Explica las cosas en términos de juego («el grupo de
arqueros goblin de la sala del norte»), no solo en términos de ficheros.

## Qué hay dentro

| Fichero | Para qué | Cuándo leerlo |
|---|---|---|
| `references/formato-escenario.md` | Especificación de ficheros y claves en Descent: eventos, piezas, puertas, fichas, grupos de monstruos y sus casillas, monstruos propios y activaciones, objetos y tienda, variables, disparadores, campañas | Antes de escribir o arreglar cualquier `.ini` |
| `references/patrones.md` | Recetario: preparación, puertas, búsqueda, objetivos y aldeanos, pruebas, grupos, jefes, refuerzos, amenaza y peligros, moral, recompensas, campañas, tienda, ciudad | Al construir cada parte |
| `references/mapa-losetas.md` | Rejilla, piezas, salidas y uniones, terminales, puertas, casillas de las figuras | Al montar el mapa |
| `references/catalogo.md` | IDs de piezas, monstruos (rasgos, tamaño, activaciones), héroes, clases, habilidades, objetos, fichas, imágenes, audio, peligros y packs | Para elegir componentes (mejor con `scripts/buscar.py`) |
| `references/reglas-descent.md` | Reglas completas del juego y de Road to Legend, FAQ, errores habituales, glosario español-inglés y puente con Valkyrie | Dudas de reglas y para redactar con la terminología de la comunidad |
| `references/expansiones.md` | Productos, reglas nuevas, héroes, clases, monstruos y lugartenientes de cada uno, IDs de pack, escenarios de la tienda | Al usar expansiones |
| `references/valkyrie-app.md` | Instalar, importar Road to Legend, jugar, editor (y lo que hace mal), rutas, probar, publicar, packs de la comunidad, problemas | Dudas sobre la app, para publicar y cuando el usuario también usa el editor de Valkyrie |
| `references/diseno-escenarios.md` | Proceso, plantilla de diseño, estructura, mapa y duración, equilibrio, objetivos, campañas, escritura | Al planificar y al revisar la calidad |
| `references/ritmo.md` | Hoja de ritmo ronda a ronda, decisiones que pesan (también en campaña), desafío justo | Al diseñar (antes de los ficheros) y al revisar |
| `references/escritura.md` | Oficio de escritor: estructura, brevedad, personajes, vicios (sí/no), estilos; el tono de DooM | Antes de escribir textos y al revisarlos |
| `references/revision.md` | Rúbrica de ocho criterios (1-5) y encargo para un revisor independiente (también DooM) | Al terminar una aventura y al revisar una ajena |
| `assets/ejemplo/LaCampanaDeVadoscuro/` | Minicampaña de ejemplo sin expansiones: dos aventuras y una ciudad entre ellas (tienda, donativo, viaje), dificultad Normal o Difícil, un jefe y un sectario propios con sus activaciones, una aldeana que cambia la segunda aventura, en español e inglés. Valida sin avisos y se ha recorrido entera, en sus dos ramas, en pruebas automáticas con el motor de Valkyrie portado a Valkyrie Universalis | Como modelo de casi cualquier patrón |
| `assets/catalogo.json`, `assets/losetas.json` | Datos para los scripts | No hace falta leerlos |

Las rutas `references/…`, `scripts/…` y `assets/…` son relativas a la carpeta de esta skill (la que se indica
al cargarla). Los ficheros de referencia son largos: mira primero su índice y lee solo la sección que
necesites (o búscala con grep).

## Reglas de oro

Lo que más aventuras rompe. Detalles en `formato-escenario.md` (lista completa en su §24).

1. **Un solo evento con `trigger=EventStart`**; **`event1=A B C` ejecuta UNO** (el primero habilitado), así
   que para hacer A, luego B, luego C, encadénalos; **un evento silencioso (`display=false`) necesita
   `buttons=1`** para seguir a su `event1`.
2. **Cada botón con su etiqueta** (`EventX.button1,Continuar`). Las piezas, fichas, puertas y UI aparecen
   solo cuando un evento las añade (`add=`) y se quitan con `remove=`. Las fichas ignoran sus `vartests`:
   para apagar una, condición en su botón o `vartests` en el evento de destino.
3. **Errores que cierran Valkyrie**: el mismo componente en dos ficheros, `add=` a un nombre que no existe,
   una línea con solo espacios, una pieza sin `side` (o de una expansión que falta en `packs=`), un
   `placementN` con un MPlace que no existe, un CustomMonster sin `base` ni imagen o sin ninguna activación
   válida, y, en una campaña, una variable de un solo carácter.
4. **Coordenadas**: una casilla mide 1, la y crece hacia el norte y todo va en enteros. Una pieza en (X, Y)
   con `rotation=R` pone en (X, Y) la esquina superior izquierda del rectángulo de su cara (que puede no ser
   una casilla dibujada) y gira en sentido antihorario. Une **salida con salida** y cierra las que no llevan a
   ningún sitio con terminales: no calcules a mano, usa `mapa.py --info` y `--colocar`.
5. **Grupos de monstruos**: el Spawn pone sus figuras en las casillas de `placement2/3/4` según el número de
   héroes (las de `master=true`, líderes), respetando el límite de grupo de la carta y su tamaño (los grandes
   suelen ser 1 o 2 figuras). **Solo se dibujan si el Spawn tiene `xposition`/`yposition` y no es
   `display=false`.** Dos Spawn del mismo tipo se juntan en un grupo: un jefe aparte debe ser de otro tipo o un
   CustomMonster (`validar.py` sugiere los `Defeated<Spawn>` que no saltarán por eso). `uniquetitle` no se ve (sale «Maestro <monstruo>»): el nombre del jefe va en `uniquetext` o en
   el CustomMonster.
6. **Moral y derrota**: Valkyrie pone la moral igual al número de héroes y la baja con el botón KO; por debajo
   de 0 salta `NoMorale`, y **vuelve a saltar tras cada evento** mientras siga así. El evento de derrota
   termina (`$end,=,1`) o deja la moral en 0 o más (`$%morale,=,0`). Si cambia de aventura, también: la moral
   pasa a la siguiente y allí volvería a saltar.
7. **La tienda**: dos o más QItem en un `add=` **abren la tienda** (no se entregan); se cierra **solo** con
   `remove=#shop` en el evento de su botón de salir (en el mismo que la abre no sirve) y siempre antes de
   cambiar de aventura (después ya no se puede cerrar). Un QItem en un `add=` es una recompensa. Los objetos se
   sortean al cargar la aventura, filtrados por la fama: fija los umbrales de fama en la raíz de la campaña (o
   con `$restock,=,1` en una aventura suelta).
8. **Quita siempre las UI**: con una imagen o un texto del escenario (UI) o la tienda en pantalla, los
   retratos de los héroes no responden (ni Fin del Turno ni KO).
9. **Campañas**: un evento que se llama como otro `quest.ini` (ruta desde la carpeta raíz:
   `Aventura2/quest.ini`) cambia de aventura. Pasan los héroes con su clase, habilidades y objetos, y las
   variables `%` y `$%` (moral, PE, oro, fama); lo demás se borra. **Cada aventura con textos en inglés**: tras
   el cambio, Valkyrie no carga el idioma por defecto del escenario, sino el del jugador y el inglés. En el
   editor de Valkyrie, prueba y empaqueta desde la raíz: una aventura abierta suelta no encuentra la siguiente.
10. **Disparadores de Descent**: `EventStart`, `StartRound`, `EndRound`, `EndRound<N>`, `NoMorale`,
    `Defeated<Tipo|Spawn>`, `DefeatedUnique<Tipo|Spawn>` y `Var<variable>`. Los de Mansiones (`Mythos`,
    `Eliminated`…) nunca saltan.
11. **Valkyrie no conoce posiciones, Vida, fatiga, Estados ni quién lleva qué**: el texto dice a los jugadores
    qué hacer («el héroe más cercano sufre 2 `{heart}`») y pregunta con botones lo que importa («¿Está algún
    héroe en la pieza de Salida?»); las variables recuerdan el resto.
12. **Localización**: primera línea `.,Spanish`; `clave,valor` (se parte en la primera coma); `\n` para saltos
    de línea; valores con comillas entre `|||…|||`; nunca mezcles finales de línea. Símbolos de Descent:
    `{heart}` `{fatigue}` `{surge}` `{shield}` `{might}` `{knowledge}` `{will}` `{awareness}` `{action}`.
    Una búsqueda `{qst:…` sin su `}` hace que el evento se quede a medias al enseñar el texto.
13. **Escala con `#heroes`**: casillas por número de héroes, Vida adicional del jefe
    (`uniquehealth` + `uniquehealthhero` por héroe), oro y umbrales de amenaza.
14. **Peligros** (`$perilMinor`, `$perilMajor`, `$perilDeadly`): ponlos durante la ronda (al empezarla, por
    ejemplo); si los pone un evento de final de ronda, el peligro sale al final de la ronda siguiente.

## Flujo A: crear una aventura o una campaña

1. **Diseño.** Rellena con el usuario el documento de diseño de `diseno-escenarios.md` §2: premisa,
   objetivo, mapa, grupos, jefe, presión y finales; las cinco frases de `escritura.md` §1 (premisa, lo
   que trama el señor oscuro, lo que se planta, el giro, el precio) y la hoja de ritmo con sus
   decisiones (`ritmo.md`), antes de tocar un fichero. Pregunta solo lo que cambie mucho el resultado (número de
   héroes, duración, expansiones que tiene, aventura suelta o campaña); decide el resto con valores razonables
   y dilo. Si quiere «algo rápido», propón tú una historia completa.
2. **Esqueleto.**
   ```bash
   python scripts/nuevo_escenario.py MiAventura --titulo "Título" --destino <carpeta> \
          [--sala1 TileSide3B] [--sala2 TileSide9B] [--monstruo MonsterGoblinArcher] [--jefe MonsterEttin] \
          [--duracion 60-90] [--dificultad 0.4] [--packs "LoR"] [--autor "Nombre"] [--idioma Spanish] \
          [--ingles] [--campana 2]
   ```
   Crea el prólogo, la preparación paso a paso (piezas, Entrada, terminales, héroes, fichas), dos salas unidas
   salida con salida con una puerta, un grupo con sus casillas para 2, 3 y 4 héroes, una Búsqueda, un jefe
   único tras la puerta, amenaza que dispara peligros, victoria y derrota por moral. Con `--campana N`: la raíz
   (fama, oro), N aventuras y una ciudad con tienda y viaje entre ellas, en español e inglés. Pone en
   `packs=` las expansiones de las piezas y los monstruos elegidos y, si un grupo no cabe entero en su sala,
   lo recorta y avisa. Valida sin errores.
3. **Mapa.** Elige piezas (`python scripts/buscar.py --tipo losetas --rasgo inside`), mira su forma y sus
   salidas (`python scripts/mapa.py --info TileSide9A`) y únelas
   (`python scripts/mapa.py MiAventura --colocar TileSide9A --junto-a TileSala1 --lado E`): da
   `xposition`/`yposition`/`rotation` y la puerta de esa unión. Cierra las salidas libres con terminales y
   coloca fichas y casillas de monstruos con `--casillas TileSala1` (`mapa-losetas.md` §6).
4. **Contenido.** Construye zona a zona con `patrones.md`: puerta → evento que coloca piezas, fichas y grupos
   → búsquedas, aldeanos, pruebas → objetivo → jefe → final. Usa el ejemplo `LaCampanaDeVadoscuro` como
   modelo. Elige monstruos y objetos con `buscar.py` (`--tipo monstruos --rasgo cave --tamano huge`,
   `--tipo activaciones --monstruo MonsterZombie`). Para cambios grandes, edita con la librería (respeta el
   formato exacto de Valkyrie):
   ```python
   import sys; sys.path.insert(0, "<ruta de la skill>/scripts")
   from valkyrie_io import Scenario
   sc = Scenario.load("MiAventura")
   sc.set("SpawnTrasgos", monster="MonsterGoblinArcher", xposition="4", yposition="-2",
          placement2="MPlaceLider MPlace1 MPlace2", buttons="1", event1="EventObjetivo")  # spawns.ini
   sc.set("MPlaceLider", xposition="4", yposition="-2", master="true")                   # mplaces.ini
   sc.set_text("Spanish", "SpawnTrasgos.text",
               "Colocad el grupo de {type} como se indica, respetando el límite de monstruos.")
   sc.set_text("Spanish", "SpawnTrasgos.button1", "Continuar")
   sc.rename("TileSala1", "TileCripta")    # cambia también referencias, textos y {c:TileSala1}
   sc.references("MPlaceLider")            # quién lo cita: [(componente, clave)]
   sc.save()                               # CRLF y comillas como el editor
   ```
   Para cambios pequeños, edita los `.ini` y la localización a mano siguiendo las reglas de oro.
5. **Validar** hasta que no haya errores y revisar los avisos: `python scripts/validar.py MiAventura`
   (`--json` para procesarlo). En una campaña, valida la raíz: recorre todas las aventuras y los saltos.
6. **Revisar la historia y el mapa**: `python scripts/grafo.py MiAventura` (qué dispara qué, en el orden
   real; tiendas, cambios de aventura, inalcanzables), `--html <fuera>/grafo.html` para un diagrama, y
   `python scripts/mapa.py MiAventura --png <fuera>/mapa.png` (míralo; en una campaña, una vez por carpeta de
   aventura, porque la raíz no tiene mapa). Guarda estos ficheros **fuera** de la carpeta de la aventura.
7. **Revisión independiente** (`revision.md`): un revisor que no ha visto el diseño (un subagente, si
   se puede, con el encargo de §4) recorre la partida ronda a ronda con 2 y con 4 héroes y puntúa los
   ocho criterios con ejemplos. Arregla lo que quede por debajo de 4 y vuelve a pasarla.
8. **Entregar**: la carpeta comprimida (para copiarla en `%APPDATA%\Valkyrie\D2E\Editor\`) y, si la quiere
   probar como jugador o publicar, el paquete: `python scripts/empaquetar.py MiAventura --salida <carpeta>`
   crea `<carpeta>/MiAventura/` con `.valkyrie`, `.ini` y portada, como «Crear paquete» del editor (no mete
   ficheros de trabajo salvo con `--todo`). Explica dónde copiar cada cosa (`valkyrie-app.md` §4 y §8) y
   recuerda probar con 2 y con 4 héroes, y una campaña de principio a fin (solo el paquete enseña la pantalla
   final). Si la conversación está enlazada al ordenador del usuario, ofrece escribir la carpeta en
   `%APPDATA%\Valkyrie\D2E\Editor\<Id>\` (pidiendo acceso a esa carpeta).

El identificador (nombre de carpeta) va sin espacios ni acentos y nunca `EditorScenario…`.

## Flujo B: revisar o arreglar una aventura existente

1. Consigue la carpeta (las del editor están en `%APPDATA%\Valkyrie\D2E\Editor\<Id>\`). Un `.valkyrie` es un
   ZIP: descomprímelo en una carpeta con el nombre del identificador.
2. `validar.py`, `grafo.py` y `mapa.py` (informe y PNG). Si los avisos son muchos, agrúpalos.
3. Explica cada problema en términos de juego y propón el arreglo. Respeta el estilo del autor y no renombres
   componentes sin necesidad (los textos dependen del nombre). Si el autor usa también el editor de Valkyrie,
   recuérdale lo que este hace mal (`valkyrie-app.md` §5): renombrar o borrar allí deja textos y disparadores
   rotos, escribe los textos en el idioma de Valkyrie y no enseña `placement1`.
4. Corrige, vuelve a validar y entrega solo los ficheros cambiados o la carpeta completa.

Valkyrie también tiene sus propios síntomas (se cierra, la aventura no aparece, la ronda no avanza, la tienda
no se cierra): tabla de diagnóstico en `valkyrie-app.md` §11.

## Flujo C: dudas de reglas, expansiones o de la app

- Reglas: `reglas-descent.md` (chuleta en §0; errores habituales en §17.4; lo que no sabe la app en §19.2).
- Qué trae cada expansión y sus IDs: `expansiones.md`; componentes concretos: `buscar.py`.
- Instalar, importar, rutas, editor, publicar: `valkyrie-app.md`.
- Si algo no está en las referencias y depende de la actualidad (versiones nuevas de Valkyrie, escenarios
  recientes), búscalo en la web y dilo.

## Flujo D: traducir

1. Copia las claves del idioma por defecto a `Localization.<Idioma>.txt` (primera línea `.,<Idioma>`) y
   tradúcelas conservando marcas (`{c:…}`, `{qst:…}`, `{var:…}`, `{rnd:hero}`, `{type}`, símbolos como
   `{heart}`), etiquetas `<b>`/`<i>` y `\n`.
2. Añade el fichero a `[QuestText]` (con `valkyrie_io` basta `sc.set_text("English", …)` y `save()`).
3. Valida. Terminología en español: `reglas-descent.md` §18. En una campaña, el inglés no es opcional (regla 9).

## Flujo E: publicar

`empaquetar.py` → repositorio público de GitHub con los tres ficheros → issue `[Scenario] Nombre` en
NPBruce/valkyrie, diciendo que es de Descent y qué expansiones pide. Lista de comprobación: `valkyrie-app.md`
§8.

## Scripts

Todos en `scripts/`, sin dependencias salvo Pillow para `--png`. Ejecútalos con `python3` (o `py -3` en
Windows).

| Script | Uso |
|---|---|
| `nuevo_escenario.py <Id> --titulo "…" [opciones del paso 2]` | Esqueleto jugable y válido de una aventura o una campaña |
| `validar.py <carpeta> [--json] [--sin-info] [--sin-mapa] [--solo <subcarpeta>]` | Errores (cierran o rompen Valkyrie), avisos y sugerencias, en todas las aventuras de una campaña; sale con 1 si hay errores |
| `grafo.py <carpeta> [--mermaid f.md] [--html f.html] [--idioma …]` | Flujo narrativo: disparadores, botones, condiciones, tiendas, cambios de aventura, finales, inalcanzables |
| `mapa.py <carpeta> [--png f.png [--escala 32]]` | Informe del mapa (piezas, uniones, puertas, fichas, casillas de monstruos, mapa de texto) o dibujo |
| `mapa.py --info TileSideX [--en X,Y --rotacion R]` | Forma de una cara, sus salidas conocidas y dónde caería |
| `mapa.py <carpeta> --colocar TileSideX --junto-a TileY [--lado N/S/E/O] [--todas]` / `--casillas TileY` | Posiciones para unir una cara nueva, salida con salida, con su puerta / casillas de una pieza colocada |
| `buscar.py <texto> [--tipo …] [--rasgo …] [--pack …] [--tamano …] [--arquetipo …] [--monstruo …]` | Busca en el catálogo (entiende español: «zombi», «espada», «cueva») |
| `empaquetar.py <carpeta> [--salida …] [--sobrescribir] [--todo]` | `.valkyrie` + manifiesto + portada, como el editor |
| `valkyrie_io.py` | Librería: `Scenario.load/set/set_text/rename/delete/references/save` con el formato exacto de Valkyrie |
| `construir_catalogo.py <clon de Valkyrie> [--packs …] [--nombres …]` | Regenera el catálogo si sale una versión nueva de Valkyrie |
| `nombres_oficiales.py <importación de Road to Legend>` | En el ordenador que tiene la importación: saca los nombres oficiales (español e inglés) para `construir_catalogo.py --nombres` |
| `construir_losetas.py` / `construir_salidas.py <escenarios>` | Regeneran las casillas de cada cara y sus salidas conocidas |

## Lo que Valkyrie no puede hacer (y cómo se suple)

- No sabe dónde están las figuras ni su Vida, fatiga o Estados → el texto da instrucciones, los botones
  preguntan y las variables recuerdan lo importante.
- No lleva la Vida de cada monstruo: solo la Vida adicional del único → los jugadores usan las cartas de
  monstruo; un objetivo que depende de una figura concreta la hace única o le da su propio grupo.
- No tiene calendario de semanas, mapa de campaña ni ciudades propias → se construyen con eventos, UI y
  variables `%` (el interludio del ejemplo).
- No da objetos iniciales de escenario en Descent (solo el equipo de clase) → recompensas con un QItem en un
  evento.
- La elección de héroes es libre (`#Hero…`, `#Class…`) o al azar (`{rnd:hero}`, que puede ser un héroe fuera de
  combate: da una alternativa en el texto); un evento puede pedir que se elija a uno (`minhero` y `maxhero` en el
  evento; sin `maxhero` no se puede elegir a nadie).
- Los botones Habilidades y Objetos no responden mientras hay un diálogo abierto → en una ciudad, el momento de
  gastar PE es dentro del mercado (la tienda no es un diálogo): dilo en el texto de la ciudad.
- «Validar» y «Optimizar localización» del editor no hacen nada en 3.28 → `validar.py`.

## DooM

Las misiones del pack de la comunidad DooM (marines, demonios, portales, armas) usan este mismo formato con
otras piezas, fichas y reglas: la skill `doom-valkyrie` lo explica y se apoya en esta.
