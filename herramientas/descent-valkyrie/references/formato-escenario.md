# Formato de escenario de Valkyrie (Descent 2ª ed., modo Camino a la leyenda)

Especificación de los ficheros de un escenario de Descent, comprobada contra el código de Valkyrie 3.28
(commit `752d420`: `QuestData.cs`, `Quest.cs`, `EventManager.cs`, `VarManager.cs`, `RoundController.cs`,
`TokenBoard.cs`, `ShopInterface.cs`, `MonsterDialog.cs`, `ActivateDialog.cs`, `DictionaryI18n.cs`,
`EditorTools.cs`), contra los 59 paquetes de Descent de la tienda (295 `quest.ini`) y contra el motor de
Valkyrie Universalis, que porta ese código y juega esos escenarios. Donde la wiki dice otra cosa que el
código, manda el código.

Lo que es igual que en Mansiones se cuenta igual; las diferencias de Descent van marcadas **(Descent)**.

## Índice

1. [Estructura de la carpeta](#1-estructura-de-la-carpeta)
2. [Reglas del lector INI (y errores fatales)](#2-reglas-del-lector-ini-y-errores-fatales)
3. [quest.ini](#3-questini)
4. [Ficheros de localización](#4-ficheros-de-localización)
5. [Claves comunes](#5-claves-comunes)
6. [Event: el motor del escenario](#6-event-el-motor-del-escenario)
7. [Tile](#7-tile)
8. [Door](#8-door)
9. [Token](#9-token)
10. [UI](#10-ui)
11. [Spawn: grupos de monstruos](#11-spawn-grupos-de-monstruos)
12. [MPlace: casillas de cada figura](#12-mplace-casillas-de-cada-figura)
13. [CustomMonster](#13-custommonster)
14. [Activation](#14-activation)
15. [QItem: objetos y tienda](#15-qitem-objetos-y-tienda)
16. [Puzzle](#16-puzzle)
17. [Variables](#17-variables)
18. [Disparadores (trigger) y orden de la ronda](#18-disparadores-trigger-y-orden-de-la-ronda)
19. [Marcado de texto](#19-marcado-de-texto)
20. [Imágenes y audio](#20-imágenes-y-audio)
21. [Campañas: varias aventuras en un paquete](#21-campañas-varias-aventuras-en-un-paquete)
22. [Lo que Valkyrie hace solo en Descent](#22-lo-que-valkyrie-hace-solo-en-descent)
23. [Paquete .valkyrie y manifiesto](#23-paquete-valkyrie-y-manifiesto)
24. [Lista de comprobación de errores típicos](#24-lista-de-comprobación-de-errores-típicos)

---

## 1. Estructura de la carpeta

Un escenario es una carpeta cuyo nombre es su **identificador** (sin espacios ni acentos; nunca
`EditorScenario…`: los revisores lo rechazan y Valkyrie no muestra la pantalla final). El editor guarda en:

| SO | Carpeta del editor de Descent |
|---|---|
| Windows | `%APPDATA%\Valkyrie\D2E\Editor\<Identificador>\` |
| macOS / Linux | `~/.config/Valkyrie/D2E/Editor/<Identificador>/` |

Contenido típico (es lo que escribe el editor; el fichero de cada tipo es el que usa por defecto):

```
MiAventura/
├── quest.ini                 ← obligatorio: [Quest], [QuestText], [QuestData]
├── events.ini                ← Event
├── tiles.ini                 ← Tile
├── door.ini                  ← Door
├── tokens.ini                ← Token
├── spawns.ini                ← Spawn
├── mplaces.ini               ← MPlace
├── monsters.ini              ← CustomMonster y Activation
├── items.ini                 ← QItem
├── ui.ini                    ← UI
├── puzzles.ini               ← Puzzle (casi nunca en Descent)
├── Localization.Spanish.txt  ← textos (idioma por defecto)
├── Localization.English.txt  ← traducción (obligatoria en la práctica en campañas, §21)
├── portada.jpg               ← imagen de la lista de escenarios (opcional, ~300×300)
└── Aventura2/quest.ini …     ← otras aventuras de una campaña (hidden=True), §21
```

- El reparto en ficheros es libre: cualquier sección puede ir en cualquier `.ini` de `[QuestData]`. **El
  tipo lo decide el prefijo del nombre de la sección** (`EventX`, `TileX`, `DoorX`, `TokenX`, `UIX`,
  `SpawnX`, `MPlaceX`, `CustomMonsterX`, `ActivationX`, `QItemX`, `PuzzleX`). Prefijo desconocido → se ignora.
- **Mayúsculas en los nombres de fichero**: `Events.ini` ≠ `events.ini` en Linux y Android. Si falta un
  fichero de `[QuestData]`, Valkyrie se cierra.
- Valkyrie busca `quest.ini` **recursivamente**: las aventuras de una campaña en subcarpetas llevan
  `hidden=True` para no salir sueltas en la lista.

## 2. Reglas del lector INI (y errores fatales)

Comportamiento de `ValkyrieTools.IniRead` (igual en los dos juegos):

- UTF-8 con o sin BOM. El editor escribe sin BOM y con CRLF en Windows.
- Línea que empieza (tras espacios) por `#` → comentario; `;` → comentario en líneas de datos. El editor pone
  `; Saved by version: 3.28` arriba.
- `[Nombre]` abre sección. `clave=valor` se parte por el **primer** `=` (`operations=$end,=,1` vale). Se
  recortan los espacios y **las comillas de los extremos** (`buttoncolor1="green"` = `green`).
- Línea sin `=` → clave con valor vacío (así se listan los ficheros de `[QuestText]` y `[QuestData]`).
- **Claves sensibles a mayúsculas**: `tokensize`, no `tokenSize`. Llevan mayúscula interna `customImage`,
  `textAlignment`, `richText`, `eventNCondition` y `eventNConditionAction`.
- Clave repetida → gana la primera. Sección repetida en el mismo fichero → se ignora la segunda.
- ⚠️ **Fatal**: el mismo componente en dos ficheros → `Application.Quit()`.
- ⚠️ **Fatal**: una línea con **solo espacios o tabuladores** (`l.Trim()[0]` lanza una excepción).
- ⚠️ **Fatal**: `add=` con un componente que no existe.
- ⚠️ **Fatal**: una `Tile` cuyo `side` no existe (por ejemplo, de una expansión que el jugador no tiene, si
  no la declaraste en `packs`), o con una imagen que no carga.
- Nombres de componente: solo `[A-Za-z0-9_]`. Van en listas separadas por espacios y forman las claves de
  texto (`EventX.text`).

## 3. quest.ini

```ini
; Saved by version: 3.28
[Quest]
format=21
hidden=False
type=D2E
defaultlanguage=Spanish
defaultmusicon=True
packs=LoR
minhero=2
maxhero=4
difficulty=0.4
lengthmin=60
lengthmax=90
image=portada.jpg

[QuestText]
Localization.Spanish.txt
Localization.English.txt

[QuestData]
events.ini
tiles.ini
door.ini
tokens.ini
spawns.ini
mplaces.ini
monsters.ini
```

| Clave | Valores | Notas (código) |
|---|---|---|
| `format` | 4 a **21** | Fuera de rango → no aparece. Usa **21** (Valkyrie ≥ 3.20). |
| `type` | `D2E` | **(Descent)** `MoM` es Mansiones. |
| `hidden` | `True`/`False` | `True` = no sale en la lista (aventuras de una campaña). |
| `defaultlanguage` | `Spanish`, `English`… | Idioma del que se toman los textos que falten. Ojo en campañas (§21). |
| `defaultmusicon` | `True`/`False` | Música genérica de partida (la de la importación con rasgo `quest`). |
| `packs` | IDs separados por espacio | Expansiones obligatorias: sin ellas el escenario sale como no disponible. No pongas `D2EBase`. IDs en `catalogo.md` (`LoR`, `LotW`, `TT`, `SoN`, `MoR`, `MoB`, `TCTR`, `LL`, colecciones de héroes y monstruos `BotW`…, lugartenientes `DJ09`…, kit de conversión `CKD1E`…, y los packs de la comunidad `DooM`, `D1ED`, `SOTP`). |
| `minhero` | entero | Por defecto 2 (el mínimo efectivo es 1). |
| `maxhero` | entero | **(Descent)** por defecto 4, y **4 como máximo**. |
| `difficulty` | 0 a 1 | ×5 = estrellas. 0 = no se muestra. |
| `lengthmin`/`lengthmax` | minutos | Duración que se muestra. En una campaña, la de toda la campaña. |
| `image` | ruta relativa | Portada (JPG/PNG), sin espacios en el nombre. |
| `version` | texto | Lo pone "Crear paquete" (SHA-256). |

Textos del escenario (en la localización): `quest.name` (título), `quest.synopsys` (una línea; con esa
ortografía), `quest.description` (tráiler; admite `<b>`, `<i>`, `\n`), `quest.authors` y
`quest.authors_short` (una línea).

## 4. Ficheros de localización

`Localization.<Idioma>.txt` (UTF-8), igual que en Mansiones (`DictionaryI18n`):

```text
.,Spanish
quest.name,La campana de Vadoscuro
EventPrologo.text,"<i>Al amanecer seguís las rodadas del carro…</i>\n\nColoca la pieza {c:TileCamino}."
EventPrologo.button1,Continuar
TokenAldeana.text,|||Una mujer grita: "¡Socorro!"|||
// comentario
```

- **Primera línea `.,<Idioma>`**: el idioma lo decide esta línea, no el nombre del fichero.
- Idiomas: English, Spanish, German, French, Italian, Polish, Portuguese, Russian, Chinese, Czech, Japanese,
  Korean, Ukrainian.
- `clave,valor` se parte por la **primera coma**. `\n` literal = salto de línea.
- Valor entre comillas: se quitan y `""` es una comilla. Con comillas dentro, usa **`|||…|||`**.
- ⚠️ **No mezcles finales de línea**: si el fichero tiene algún `\r`, Valkyrie parte solo por `\r` y las líneas
  que acaben solo en `\n` se pegan a la anterior.
- Búsqueda: idioma del jugador → idioma de reserva que el jugador eligió en Opciones → **inglés** → cualquiera
  **cargado**. Solo se cargan los idiomas «requeridos»: inglés, el del jugador, el de reserva y, en la aventura
  con la que empieza la partida, el `defaultlanguage` del escenario (tras un cambio de aventura, ese ya no: §21).
  Así, quien juega en un tercer idioma ve el inglés antes que el idioma por defecto del escenario.
- Texto ausente → diálogo sin texto. **Etiqueta de botón ausente → se ve la clave.**
- ⚠️ **Una búsqueda sin cerrar para el evento**: Valkyrie busca el `}` de un `{qst:`, `{ffg:` o `{val:` contando
  llaves y, si el texto se acaba antes, lanza una excepción al enseñarlo y el evento se queda a medias (pasa
  en traducciones). `validar.py` lo da como error.
- **Al editar textos con el editor de Valkyrie**, se escriben en el idioma en que está Valkyrie, no en el de la
  aventura (`valkyrie-app.md` §5).

| Componente | Claves de texto |
|---|---|
| Event, Token, Door, UI, Spawn, Puzzle | `Nombre.text`, `Nombre.button1`…`Nombre.buttonN` |
| UI | además `Nombre.uitext` (texto dibujado en el propio elemento) |
| Spawn con `unique=true` | `Nombre.uniquetitle`, `Nombre.uniquetext` (§11) |
| CustomMonster | `Nombre.monstername`, `Nombre.info` |
| Activation | `Nombre.ability`, `Nombre.master`, `Nombre.minion` |

## 5. Claves comunes

| Clave | Significado |
|---|---|
| `xposition`, `yposition` | Posición en casillas del tablero (la y crece hacia el norte). En eventos: la cámara va ahí. Ver `mapa-losetas.md`. |
| `comment` | Comentario para el autor (Valkyrie lo conserva y no lo muestra). |
| `operations` | Operaciones de variables (§17). |
| `vartests` | Condiciones para que el componente esté **habilitado** (§17). Ignorado en Token. |
| `conditions` | Formato antiguo de condiciones (AND). No lo uses. |

## 6. Event: el motor del escenario

Todo lo que pasa son eventos encadenados. Door, Token, UI, Spawn y Puzzle son eventos con algo más y aceptan
todas estas claves.

```ini
[EventForzar]
xposition=6
yposition=-2
buttons=2
event1=EventAbrirCampamento
event2=EventTrancaResiste
buttoncolor1="green"
buttoncolor2="red"
operations=intentos,+,1
vartests=VarOperation:campamentoAbierto,==,0
add=TileCampamento
remove=DoorEmpalizada
audio=AudioButton1
```

| Clave | Efecto |
|---|---|
| `display` | `true` (por defecto) / `false` = silencioso: sin diálogo, sigue por el primer botón habilitado. |
| `buttons` | Nº de botones; solo se leen `event1..eventN` hasta ese número. ⚠️ Un silencioso con `event1` y sin `buttons=1` no continúa. |
| `eventN` | Lista de nombres: al pulsar el botón N se encola **uno**: el primero habilitado (o uno al azar con `randomevents=true`). Puede ser la ruta de otro `quest.ini` (§21). |
| `eventNCondition` / `eventNConditionAction` | Condición del botón (formato `vartests`); si falla: `disable` (gris, por defecto), `hide` o `none`. |
| `buttoncolorN` | `#RRGGBB`, `#RRGGBBAA` o un nombre (black, white, red, lime, blue, yellow, aqua, cyan, magenta, fuchsia, silver, gray, maroon, olive, green, purple, teal, navy, transparent). |
| `randomevents` | Elige al azar entre los habilitados de la lista del botón. |
| `quota` | Tirada acumulada (selector 0–10). En Descent casi no se usa: las pruebas son de superar o fallar. |
| `minhero` / `maxhero` | Selección de héroes: con el diálogo abierto se pulsan sus retratos; el botón solo sigue si hay entre min y max elegidos. `{c:EventX}` = el primero elegido. ⚠️ Pon siempre `maxhero` (≥ 1): con `maxhero=0` no se puede elegir a nadie y un `minhero` mayor que 0 deja el evento sin salida. |
| `hero` | Marca como elegidos los héroes que se eligieron en ese otro evento. |
| `highlight` | Marca la posición en el tablero (diana que late). |
| `add` / `remove` | Pone o quita Tile, Door, Token, UI; da o quita QItem. ⚠️ `add=` a algo inexistente cierra Valkyrie. **(Descent)** dos o más QItem en un `add=` **abren la tienda** (§15). |
| `trigger` | §18. |
| `audio` / `music` | Efecto (`AudioX` del catálogo o `.ogg`) / lista de música (una pista: suena y vuelve la anterior; varias: bucle). |
| `mincam` / `maxcam` | La posición del evento es el límite inferior izquierdo / superior derecho de la cámara. |

Especiales de `remove=`: `#monsters` (todos los grupos, sin disparar `Defeated`), `#boardcomponents`,
`#tiles`, `#doors`, `#tokens`, `#uicomponents`, `#qitems` y **`#shop`** (cierra la tienda, §15). Quitar un
`SpawnX` retira su grupo (sin `Defeated`); quitar un `QItemX`, ese objeto del grupo.

### 6.1 Cómo se ejecuta

Valkyrie usa una **pila** (lo último encolado sale primero). Al sacar un evento:

1. Suena `audio` y cambia `music`.
2. Se aplican las `operations`. **(Descent)** justo después, `AdjustMorale(0)`: si `$%morale` es menor que 0,
   se encolan los eventos `NoMorale` (§18).
3. Si `$restock` es 1, se vuelven a sortear los objetos (QItem).
4. Si es un Spawn: se elige el monstruo y se añade su grupo, o se junta con el grupo de ese tipo que ya esté
   en juego (§11).
5. `highlight`; luego `add` y después `remove`.
6. La cámara va a la posición (no en UI).
7. Si es un Puzzle, se abre y ahí termina.
8. **(Descent)** Si el `add` tenía 2 o más QItem y no hay tienda abierta: se abre la tienda con los botones
   del evento y el evento espera a que se pulse uno.
9. Si `display=false`: sigue por el primer botón habilitado; si no, se abre el diálogo.

Al pulsar un botón (o seguir solo):

- Si `$end` ≠ 0 → **termina la partida** (paquete con nombre propio: pantalla final; si no, menú).
- Se encola **uno** de la lista del botón (o se cambia de aventura, §21).
- Se disparan los eventos `Var…` de las variables `@` y `$@` mayores que 0 (§17).
- Sale lo que esté en lo alto de la pila.

Consecuencias:

- `event1=A B C` ejecuta **solo uno**: A si está habilitado; si no, B… Para A, luego B, luego C, encadénalos.
- Un evento con `vartests` que fallan no se encola (ni por botón ni por disparador), y se comprueban otra vez
  al sacarlo de la pila.
- Si ningún botón está habilitado, un evento normal añade un «Continuar» automático (una ficha no: solo
  ofrece «Cancelar»).
- Puertas, fichas y UI solo muestran sus botones si **alguno de sus destinos está habilitado**; si no, solo
  «Cancelar».
- Los disparados por un disparador esperan a que termine la cadena en curso.

## 7. Tile

```ini
[TileCamino]
side=TileSide5A
xposition=0
yposition=0
rotation=90
```

| Clave | Notas |
|---|---|
| `side` | Cara de pieza: `TileSide1A`… (`catalogo.md`, o `buscar.py --tipo losetas`). Las dos caras de una pieza física comparten cartón (`reverso` en el catálogo). |
| `xposition`, `yposition` | **(Descent)** casilla donde cae la esquina superior izquierda del rectángulo de la cara (puede no ser una casilla dibujada; `mapa-losetas.md` §2), en números enteros. |
| `rotation` | 0, 90, 180, 270: antihorario alrededor de esa casilla. |
| `customImage`, `top`, `left` | Formato 21: imagen propia; `top`/`left` = píxel de la esquina de la primera casilla, a 105 píxeles por casilla. |

- **(Descent)** el tablero es una rejilla de casillas (`TileOnGrid`, 105 píxeles por casilla en las
  imágenes de la importación; las piezas de DooM usan 100). Valkyrie dibuja la imagen oficial, que incluye
  bordes y conectores; las casillas exactas de cada cara están en `assets/losetas.json`.
- Las piezas se unen **salida con salida** (tramos de 2 casillas). Los **terminales** (`TileSideCapA/B`)
  cierran salidas, las **extensiones** y **transiciones** alargan pasillos o pasan de exterior a interior, y
  la **Entrada** (`TileSideEntranceA/B`, `…StairA/B`) es donde empiezan los héroes. Ver `mapa-losetas.md`.
- Una pieza no aparece hasta que un evento la añade (`add=`).

## 8. Door

**(Descent)** Puerta física entre dos piezas. Es un evento que se pulsa (con «Cancelar»).

```ini
[DoorEmpalizada]
xposition=6
yposition=-2
rotation=0
color=yellow
buttons=1
event1=EventForzar
```

| Clave | Notas |
|---|---|
| `xposition`, `yposition`, `rotation` | La puerta es una barra de 2 casillas centrada en (x−0,5, y+0,5): con `rotation=0` va en vertical entre las columnas x−1 y x (filas y, y+1); con `90`, en horizontal entre las filas y, y+1 (columnas x−1, x). `mapa.py` calcula la de cada unión. |
| `color` | Color con que se tiñe el dibujo de la puerta (mismos nombres que `buttoncolor`). Por defecto blanco. Úsalo para distinguir puertas (cerrada con llave, sellada…). |

- Se abre como en el juego: el evento de la puerta la quita (`remove=DoorX`) y añade lo que hay detrás.
- Una puerta no impide nada en Valkyrie: los jugadores aplican las reglas (§22).

## 9. Token

Fichas: Búsqueda, Objetivo, Aldeanos, terreno… Al pulsarlas se ejecutan como un evento con «Cancelar».

```ini
[TokenBusqueda1]
type=TokenSearch
xposition=5
yposition=0
buttons=1
event1=EventBuscar1
```

| Clave | Notas |
|---|---|
| `type` | Fichas de Descent: `TokenSearch`, `TokenSearchSpecial`, `TokenObjectiveRed`, `…Blue`, `…Green`, `…White`, `TokenObjectiveBack` (reverso), `TokenVillagerMan`, `TokenVillagerWoman`, `TokenSecretA/B`, `TokenSunStone`, `TokenCrumblingTerrain`, `Token_Web`, `Token_Stairs`; las de DooM (`Token_DM_…`). También un monstruo (`MonsterZombie`). Lista en `catalogo.md`. |
| `rotation` | Grados. |
| `tokensize` | `small` (1×1), `medium` (2×1), `huge` (2×2), `massive` (3×2), `Original` o un número. |
| `customImage` | Formato 21: imagen propia. |
| `clickeffect` | `false` = no se puede pulsar (decoración). |

- **Ignoran `vartests`**: aparecen cuando un evento las añade y desaparecen con `remove=`. Para «apagar» una,
  condición en su botón o `vartests` en el evento de destino.
- `{action}` en la etiqueta del botón indica que cuesta una acción.

## 10. UI

Elementos de pantalla (imágenes, textos, botones invisibles), igual que en Mansiones: mapas de campaña,
fondos de ciudad, cartas. `image` (un `ImageX` del catálogo o un png/jpg), `size` (fracción del ancho; del
alto con `vunits=true`), `halign`/`valign`, `textsize`, `textcolor`, `textbackgroundcolor`, `textaspect`,
`textAlignment`, `richText`, `border`, `fadespeed`, `clickeffect`; texto en `Nombre.uitext`. Pulsar una UI
ejecuta su evento.

- Las campañas publicadas usan UI para el mapa de campaña y el fondo de la ciudad (`image=ImageCityNight`, de
  la importación, o una imagen propia). Quítalas al salir (`remove=`).
- ⚠️ **(Descent)** mientras haya una UI (o la tienda) en el tablero, pulsar el retrato de un héroe **no abre
  su ventana**: no se puede terminar su turno ni marcarlo fuera de combate (`Quest.UIItemsPresent`). Quita
  siempre las UI al acabar con ellas.

## 11. Spawn: grupos de monstruos

Hace aparecer un **grupo** de monstruos. Es un evento: se dispara desde `eventN` o con `trigger`, **no** con
`add`.

```ini
[SpawnTrasgos]
monster=MonsterGoblinArcher
xposition=0
yposition=0
placement2=MPlaceTrasgoLider MPlaceTrasgo1 MPlaceTrasgo2
placement3=MPlaceTrasgoLider MPlaceTrasgo1 MPlaceTrasgo2 MPlaceTrasgo3
placement4=MPlaceTrasgoLider MPlaceTrasgo1 MPlaceTrasgo2 MPlaceTrasgo3 MPlaceTrasgo4
buttons=1
event1=EventObjetivo
```
```text
SpawnTrasgos.text,Colocad el grupo de {type} como se indica, respetando el límite de monstruos.
SpawnTrasgos.button1,Continuar
```

| Clave | Notas |
|---|---|
| `monster` | Lista: el **primero disponible** (pon primero el de expansión y después uno del básico). `Monster` es opcional. Vale un `CustomMonsterX` o el nombre de otro `SpawnX` (el mismo tipo que salió allí). Con `traits`/`traitpool`, la lista pasa a ser de **exclusiones**. |
| `traits` / `traitpool` | **Grupo abierto**: un monstruo al azar con todos / alguno de esos rasgos (`cave`, `wilderness`, `undead`, `building`, `small`, `huge`, `ranged`…), entre las expansiones que el jugador eligió. **(Descent)** excluye además los tipos ya elegidos por otro Spawn y los que están en juego. También puede salir un `CustomMonster` del escenario con esos rasgos. ⚠️ Si no queda ninguno, el evento se corta a medias: deja candidatos de sobra en el juego básico. |
| `placementN` | **(Descent)** casillas (`MPlaceX`, §12) de cada figura cuando juegan N héroes (`placement2`, `placement3`, `placement4`; `placement1` si la aventura admite un héroe). Las casillas con `master=true` son de líderes (marco rojo); el orden de la lista no importa. ⚠️ Solo se dibujan si el Spawn tiene `xposition`/`yposition` y no es `display=false`: sin posición, o silencioso, el grupo entra en juego pero no se marca nada en el tablero. |
| sin `placementN` para ese número de héroes | Valkyrie marca la **zona** del grupo (círculo que late en `xposition`, `yposition`) y los jugadores colocan. Un **lugarteniente** (rasgo `lieutenant`) sin casillas sale con su imagen en esa posición. |
| `unique` | `true` = el grupo tiene un **monstruo único** (Vida adicional, reglas en Información, «Único derrotado»). |
| `uniquehealth`, `uniquehealthhero` | Vida adicional: `round(uniquehealth + héroes × uniquehealthhero)`; Valkyrie la muestra en rojo en el retrato del grupo. |
| `uniquetitle` / `uniquetext` (textos) | Título y reglas del único en la ventana de Información. ⚠️ Rareza de `GetUniqueTitle`: **si existe `uniquetitle`, el título que sale es «Maestro <monstruo>»**; si no existe, sale la clave sin traducir. Pon siempre un `uniquetitle` y el nombre propio dentro de `uniquetext`, o usa un CustomMonster con `monstername` (§13). |
| `activated` | `true` = el grupo aparece ya activado (no actúa esta ronda). |

- **(Descent) Grupos por tipo**: si ya hay un grupo de ese tipo en juego, el Spawn no crea otro: se junta con
  él (y si es `unique`, el grupo pasa a tener ese único). Entonces `Defeated<NombreSpawn>` usa el nombre del
  **primer** Spawn de ese tipo. Para un jefe aparte, usa otro tipo o un CustomMonster. `validar.py` lo sugiere
  cuando un `Defeated<Spawn>` es de un Spawn cuyo monstruo ya trae otro que sale antes (en la tienda sale 24
  veces en 9 escenarios, 3 de ellos de DooM).
- `{type}` en su texto = nombre oficial del monstruo elegido, en el idioma del jugador.
- Vida: Valkyrie no lleva la Vida de cada figura en Descent; los jugadores usan las cartas de monstruo.
- Derrotar el grupo (botón «Derrotado» en su retrato) dispara `Defeated<Tipo>` y `Defeated<NombreSpawn>`;
  si es único, también `DefeatedUnique…` (§18).
- `#monsters` cuenta los grupos en juego.

## 12. MPlace: casillas de cada figura

**(Descent)** La casilla de cada figura de un grupo con casillas (`placementN`).

```ini
[MPlaceTrasgoLider]
xposition=0
yposition=0
master=true

[MPlaceGorruk]
xposition=10
yposition=-4
master=true
rotate=false
```

| Clave | Notas |
|---|---|
| `xposition`, `yposition` | Casilla de origen (entera). |
| `master` | `true` = líder (marco rojo); si no, esbirro (marco blanco). |
| `rotate` | `true` = la figura grande se dibuja en vertical (girada 90°). |
| `tokensize` | Fuerza el tamaño del dibujo (`small`, `medium`, `huge`, `massive`, `Original`, número); si no, el del monstruo por sus rasgos. |

- Huella según el tamaño del monstruo: `small` 1×1; `medium` x..x+1; `huge` x..x+1 × y−1..y; `massive`
  x..x+2 × y−1..y (hacia el este y hacia el sur). Con `rotate=true` gira hacia el oeste: `medium` x × y−1..y;
  `huge` x−1..x × y−1..y; `massive` x−1..x × y−2..y. Debe caer entera en casillas de las piezas (`validar.py`
  y `mapa.py` lo calculan).
- ⚠️ Un `placementN` que cita un MPlace inexistente cierra Valkyrie al colocar el grupo.
- ⚠️ Valkyrie lee la imagen de colocación del monstruo para dibujarla; si no carga (un CustomMonster sin
  `base` ni `image`), se cierra.

## 13. CustomMonster

Monstruo propio o versión con nombre de uno existente (jefes, personajes).

```ini
[CustomMonsterGorruk]
base=MonsterEttin
activation=GorrukEmbestida GorrukRugido Brawler1
```
```text
CustomMonsterGorruk.monstername,Gorruk el Rompehuesos
CustomMonsterGorruk.info,Gorruk usa la miniatura y la carta de Ettin del Acto I, como líder.
```

| Clave | Notas |
|---|---|
| `base` | Monstruo del que hereda imagen, rasgos (y tamaño), información y activaciones. |
| `traits` | Rasgos propios (si no, los de `base`). Sin `base` ni rasgo de tamaño, se coloca como 1×1. |
| `activation` | **(Descent)** lista de nombres: por cada uno, el `[ActivationX]` del escenario (si sus `vartests` se cumplen) o la activación oficial `MonsterActivationX` (p. ej. las comunes `Brawler1`…`3`, `Range1`…`3`, `Skirmisher1`…`3`, `Charge`, `Enraged`…; `buscar.py --tipo activaciones`). Cada activación elige una al azar. Vacío: las del `base`. ⚠️ Si no queda ninguna válida, Valkyrie se cierra. **No existe la forma «un evento» de Mansiones.** |
| `health`, `healthperhero` | Vida mostrada en rojo en el retrato: `round(health + héroes × healthperhero)`, más la Vida adicional del Spawn. En Descent se lee como «Vida adicional»: déjala a 0 y usa la del Spawn. |
| `image`, `imageplace` | Imagen propia (retrato y colocación). Si no hay, la del `base`. |

- Se usa en `monster=` de un Spawn. `{c:CustomMonsterX}` = su `monstername`.
- Su tipo es `CustomMonsterX`: disparadores `DefeatedCustomMonsterX` y `DefeatedUniqueCustomMonsterX`
  (sirven para todos los Spawn que lo usen).

## 14. Activation

**(Descent)** Activación de texto para un CustomMonster (en `monsters.ini`). Textos:

| Clave | Qué es |
|---|---|
| `ActivationX.ability` | Efecto especial de esta activación (recuadro de arriba). **`{0}` = un héroe al azar, `{1}` = el monstruo** (al revés que en Mansiones). |
| `ActivationX.master` | Lista de acciones del **líder** (`{0}` = el monstruo). |
| `ActivationX.minion` | Lista de acciones de los **esbirros** (`{0}` = el monstruo). |

| Clave del .ini | Notas |
|---|---|
| `minionfirst` / `masterfirst` | `true` = primero esbirros / primero el líder. Sin ninguno, al azar. |
| `vartests` | Solo se puede elegir si se cumplen. |

- Sin texto de esbirros → un solo paso con el del líder; sin texto de líder → un solo paso con el de los
  esbirros (grupos de una figura, como un jefe solo).
- Redacción en el estilo de Camino a la leyenda: «{action} Se confronta con el héroe más cercano.» (ver
  `reglas-descent.md` §12.5 y §18.11).

## 15. QItem: objetos y tienda

```ini
[QItemBotin]
starting=False
traitpool=act1

[QItemMercado1]
starting=False
traitpool=act1
```

| Clave | Notas |
|---|---|
| `itemname` | Objeto concreto (`ItemIronLongsword`; el primero disponible de la lista) o el mismo que otro `QItemX`. Con rasgos, es lista de exclusiones. |
| `traits` / `traitpool` | Todos / alguno de los rasgos (`act1`, `act2`, `relic`, `blade`, `armor`, `trinket`, `magic`…). Excluye lo que ya tiene el grupo y lo ya sorteado (no repite en la tienda). |
| `starting` | **(Descent) no tiene efecto**: Descent no entrega objetos iniciales de escenario (los iniciales son los de cada clase). Escribe `starting=False`. |

- **Un QItem en un `add=`**: se entrega al grupo y el diálogo enseña su carta.
- **(Descent) Dos o más QItem en un `add=`**: **abren la tienda** (`ShopInterface`) con esos objetos (que no
  se entregan). La tienda muestra a la izquierda los **botones del evento** (con sus colores) y lo que vende
  y lo que el grupo puede vender. El evento no termina hasta pulsar uno de esos botones.
- **La tienda solo se cierra con `remove=#shop`** en el evento que sigue al botón: en el mismo evento que la
  abre no sirve (Valkyrie quita antes de abrir). Ni un cambio de aventura la cierra, y después del cambio ya no
  se puede cerrar: ciérrala antes de saltar. Volver a abrir la misma tienda (el mismo evento) enseña lo que
  queda.
- Precios: el de la carta; los objetos de clase, 25. Venta: al mismo precio, o por `$%sellratio` (0,5 =
  mitad) si no es 0. Las **reliquias** no se venden. El oro es `$%gold`.
- **Fama**: la tienda solo ofrece objetos cuyo intervalo de fama (`minfama`–`maxfama` en el catálogo)
  incluye el nivel del grupo, que sale de `$%fame` comparado con los umbrales `$%famenoteworthy`,
  `$%fameimpressive`, `$%famecelebrated`, `$%fameheroic` y `$%famelegendary`. ⚠️ **Si los umbrales
  valen 0 (no se fijaron), el nivel es «legendary»** y del Acto I solo quedan 3 objetos en el juego básico (4
  con LoR, más los del pack SOTP, que no tienen fama): fíjalos
  al empezar la campaña (las publicadas usan 2, 4, 6 y 8 para impressive, celebrated, heroic y legendary;
  sin `$%famenoteworthy`, el grupo empieza en «noteworthy»).
- ⚠️ **Cuándo se sortea**: al cargar cada aventura (antes de su `EventStart`) y cada vez que un evento pone
  `$restock,=,1`; la tienda enseña lo ya sorteado. En una campaña, la raíz fija los umbrales y las aventuras
  siguientes sortean al cargarse, ya con ellos. En una **aventura suelta** con tienda u objetos al azar, pon
  `$restock,=,1` en las `operations` del evento que fija los umbrales, o se sortearán con el nivel
  «legendary».
- `$restock,=,1` vuelve a sortear todos los QItem (y vacía las tiendas).

## 16. Puzzle

Los puzles de Mansiones (`class=slide|image|code|tower`) también funcionan en Descent, pero ningún escenario
publicado los usa y no son parte de Camino a la leyenda. Detalles en la skill de Mansiones.

## 17. Variables

Todas son números (float), empiezan en 0 y no se declaran.

| Prefijo | Tipo | Ejemplos |
|---|---|---|
| letra | de la aventura: se borran al cambiar de aventura | `amenaza`, `llave` |
| `%` | de campaña: sobreviven al cambio de aventura | `%aldeana`, `%ganada1` |
| `$%` | de Valkyrie y de campaña | `$%morale`, `$%xp`, `$%gold`, `$%fame`… |
| `@` | disparador: si vale > 0 al acabar un evento, se pone a 0 y salta `trigger=Var<nombre sin @>` | `@despertar` → `trigger=Vardespertar` |
| `$@` | igual, para disparadores de Valkyrie: `$@travelevent` → `Var$travelevent` | `$@travelevent,=,1` |
| `$` | de Valkyrie, de la aventura | `$end`, `$restock`, `$perilMinor`… |
| `#` | de Valkyrie, solo lectura | `#round`, `#heroes`… |

⚠️ **Nombres de 2 caracteres o más**: al cambiar de aventura, `VarManager.TrimQuest` lee los 2 primeros
caracteres de cada nombre y una variable de una letra (`x`) lo hace fallar.

**(Descent)** variables de Valkyrie:

| Variable | Significado |
|---|---|
| `#round` | Ronda actual (empieza en 1; en `EndRound` es la que acaba). |
| `#heroes` | Nº de héroes. |
| `#monsters` | Nº de grupos en juego. |
| `#<pack>` | 1 si el jugador tiene esa expansión: `#LoR`, `#SoN`, `#TT`, `#DooM`… |
| `#Hero<Nombre>`, `#Class<Nombre>` | 1 si juega ese héroe / esa clase: `#HeroAshrian`, `#ClassKnight`. |
| `#rand<N>` | Solo como valor: entero al azar de 1 a N. |
| `$end` | A 1: la partida termina al acabar ese evento. |
| `$%morale` | Moral (§22). Valkyrie la pone igual a `#heroes` al elegir héroes. |
| `$%xp` | Experiencia común: cada héroe tiene la suya (0) más esta, menos lo que gastó en habilidades. «Cada héroe recibe 1 PE» = `$%xp,+,1`. |
| `$%gold` | Oro del grupo. |
| `$%fame` y umbrales `$%famenoteworthy`…`$%famelegendary` | Fama y niveles para la tienda (§15). |
| `$%sellratio` | Proporción del precio de venta (0 = precio completo). |
| `$restock` | A 1: nuevo sorteo de objetos. |
| `$perilMinor`, `$perilMajor`, `$perilDeadly` | Mayor que 0: al final de la ronda sale un peligro al azar de ese nivel (texto oficial) y vuelve a 0 (§22). ⚠️ Los peligros se apuntan cuando empieza el final de la ronda: ponlo **durante la ronda** (al empezarla, por ejemplo); si lo pone un evento de `EndRound`, el peligro sale al final de la ronda **siguiente**. |
| `$@travelevent` | A 1: al acabar el evento, un evento de viaje al azar de Valkyrie (§22). |

**Operaciones** (`operations=`, separadas por espacios, `variable,operador,valor`): `=`, `+`, `-`, `*`, `/`,
`%`. El valor es un número (empieza por dígito, `-` o `.`), `#randN` o el nombre de otra variable (las `#`
sí se pueden leer). Ej.: `oro,=,#heroes oro,*,25 $%gold,+,oro`.

**Condiciones** (`vartests=`):

```
vartests=VarOperation:amenaza,>=,4 VarTestsLogicalOperator:AND VarOperation:peligroMenor,==,0
vartests=VarTestsParenthesis:( VarOperation:a,==,1 VarTestsLogicalOperator:OR VarOperation:b,==,1 VarTestsParenthesis:)
```

Operadores `==`, `!=`, `>=`, `<=`, `>`, `<`; de izquierda a derecha (sin precedencia: paréntesis). Cada
`VarOperation` con 3 partes. `{var:nombre}` en un texto muestra el valor (`{var:$%morale}`).

## 18. Disparadores (trigger) y orden de la ronda

| `trigger` | Cuándo |
|---|---|
| `EventStart` | Al empezar la aventura, tras elegir héroes y clases (y en cada aventura de una campaña). **Pon uno solo.** |
| `StartRound` | Al empezar cada ronda, **incluida la 1** (tras la cadena de `EventStart`). |
| `EndRound` | Al acabar la ronda: cuando todos los héroes y todos los grupos se han activado. |
| `EndRound<N>` | Al acabar la ronda N (`EndRound3`). |
| `NoMorale` | **(Descent)** cuando la moral baja de 0 (un héroe queda fuera de combate con la moral a 0, o una operación). ⚠️ Vuelve a saltar **tras cada evento** mientras `$%morale` siga por debajo de 0: el evento de derrota debe poner `$end,=,1` o subir la moral (`$%morale,=,0`). Cambiar de aventura **no basta**: la moral es una variable `$%` y pasa a la siguiente, donde volvería a saltar; pon `$%morale,=,0` (o más) antes del salto. |
| `Defeated<Tipo>` | Al derrotar un grupo de ese tipo: `DefeatedMonsterZombie`, `DefeatedCustomMonsterGorruk`. |
| `Defeated<NombreSpawn>` | Al derrotar el grupo que salió de ese Spawn: `DefeatedSpawnTrasgos`. |
| `DefeatedUnique<Tipo>` / `DefeatedUnique<NombreSpawn>` | **(Descent)** al pulsar «Único derrotado», o «Derrotado» en un grupo que tiene único. |
| `Var<nombre>` | Al poner `@nombre` > 0 (§17). |
| `Var$<nombre>` | Al poner `$@nombre` > 0 (el viaje usa `Var$travelevent`). |

Disparadores de Mansiones que **nunca saltan en Descent**: `EndInvestigatorTurn`, `Mythos`,
`BeforeMonsterActivation`, `StartFinalRound` y `Eliminated` (no hay forma de marcar un eliminado).

**Orden de una ronda (Descent)**: al pulsar «Fin del Turno» de un héroe se activa un grupo de monstruos al
azar de los que no se han activado (ventana de activación), y así hasta que juegan todos → final de la ronda:
se apilan los eventos `EndRound` (con ellos, los peligros cuya variable ya vale más de 0) y encima los
`EndRound<N>`, así que salen primero los `EndRound<N>`, luego los peligros y luego los `EndRound` del
escenario → nueva ronda: `#round` + 1, `StartRound` y guardado automático. Las activaciones las fuerza también
el botón «Forzar Activación» del grupo.

Varios eventos con el mismo disparador se apilan y salen en orden **inverso** al de los ficheros (pila): si el
orden importa, un único evento que encadene los demás.

## 19. Marcado de texto

Orden: búsquedas de diccionario → `{c:}` → `{rnd:hero}` → `{var:}` → símbolos → `\n`.

| Marca | Resultado |
|---|---|
| `{qst:CLAVE}` | Otra clave de tu localización. Con parámetros, `{qst:Plantilla:{0}:Ana}` toma el texto de `Plantilla` y cambia en él `{0}` por `Ana`. Con llaves dentro, la clave llega hasta el primer `:` fuera de ellas; sin llaves, es todo hasta el cierre: `{qst:A:B}` busca la clave `A:B`. |
| `{ffg:CLAVE}` | Texto oficial de la app importada, en el idioma del jugador (claves seguras: las de `catalogo.json` → `ffg_keys`). |
| `{val:CLAVE}` | Texto de la interfaz de Valkyrie. |
| `{c:TileX}` | Nombre de la pieza (`5A`, `13B`…). Para Entrada y terminales salen nombres internos (`EntranceA`, `CapB`): escríbelos tú. |
| `{c:SpawnX}` | Nombre del monstruo que salió en ese Spawn (antes de salir, el nombre del componente). |
| `{c:CustomMonsterX}` | Su `monstername`. |
| `{c:QItemX}` | Nombre del objeto sorteado. |
| `{c:EventX}` | Primer héroe elegido en ese evento (selección de héroes). |
| `{rnd:hero}` | Un héroe al azar (el mismo en todo el texto). |
| `{var:nombre}` | Valor de una variable. |
| `{type}` | En un Spawn: nombre del monstruo. |
| `{heart}` `{fatigue}` `{might}` `{will}` `{knowledge}` `{awareness}` `{action}` `{shield}` `{surge}` | **(Descent)** los 9 símbolos: daño (corazón), fatiga, los 4 atributos, acción, escudo y aumento. No hay iconos de producto. |
| `<b>`, `<i>`, `<color=#RRGGBB>…</color>`, `<size=…>` | Texto enriquecido de Unity. |

- Diccionarios que puede buscar un texto: `qst` (la aventura), `ffg` (la importación), `val` (Valkyrie) y `pck`
  (los packs, también los de la comunidad).
- Un `{c:…}` partido por un salto de línea (`\n` dentro de la marca) se ve tal cual.

## 20. Imágenes y audio

- PNG o JPG (≤ 1920×1080); audio **solo `.ogg`**. Rutas relativas, sin espacios.
- Del juego: `ImageX` (fondos de ciudad, mapas, papel…) y `AudioX` (música de ciudad, mapa, combate, oro,
  botones…) en `catalogo.md`; vienen de la importación oficial.
- Versión por idioma: `English/img/x.png` o `img/English/x.png`. Valkyrie (`Quest.FindLocalisedMultimediaFile`)
  prueba, por orden: `<aventura>/<idioma>/<ruta>`, `<aventura>/<carpeta>/<idioma>/<fichero>`, lo mismo con el
  idioma de reserva del jugador y al final `<aventura>/<ruta>`. La ruta se normaliza antes: en la raíz,
  `../Sounds/x.ogg` llega a su propia carpeta `Sounds` a través de la de un idioma, y en una aventura de una
  campaña, a la carpeta `Sounds` de la raíz. Un fichero que solo está en las carpetas de algunos idiomas no lo
  ve quien juega en otro. El editor de Valkyrie no mira las carpetas de idioma.
- Lo usan el `customImage` de piezas y fichas, el `image` de las UI, el `audio` y la `music`. El `image` y el
  `imageplace` de los monstruos propios se leen solo de la carpeta de la aventura.

## 21. Campañas: varias aventuras en un paquete

Un nombre en `eventN` que sea la ruta de otro `quest.ini` **cambia de aventura** (`StartQuestEvent`,
`Quest.ChangeQuest`):

```ini
[EventVictoria]
buttons=1
event1=Interludio/quest.ini
trigger=DefeatedUniqueSpawnGorruk
operations=%ganada1,=,1 $%xp,+,1 $%gold,+,50
```

- La ruta es **relativa a la carpeta del `quest.ini` principal** (el de la raíz del paquete), también desde
  una subcarpeta: desde `Aventura1/quest.ini` se salta a `Interludio/quest.ini`, no a
  `../Interludio/quest.ini`. Se admite una `/` inicial.
- Se limpia el tablero, la cámara y los grupos; empieza la ronda 1; salta `EventStart` de la nueva aventura.
- **Se conserva**: los héroes con su clase y sus habilidades compradas, los objetos del grupo y las variables
  `%` y `$%` (moral, PE, oro, fama…). **Se borra**: las demás variables, las tiendas abiertas en la aventura
  anterior (pero la ventana de tienda no se cierra sola: ciérrala con `remove=#shop` antes de saltar).
- Las aventuras de la campaña llevan `hidden=True` y su propia localización.
- ⚠️ **Idiomas**: Valkyrie solo carga el `defaultlanguage` del escenario con el que empezó la partida. Tras un
  cambio de aventura carga el idioma del jugador, el inglés y el de reserva: una aventura solo en español sale
  **sin textos** para quien juega con Valkyrie en otro idioma. Pon `Localization.English.txt` en cada
  aventura de la campaña (`validar.py` lo avisa).
- La estructura habitual: la raíz (título, introducción y preparación de la campaña: umbrales de fama, oro),
  aventuras en subcarpetas y una «fase de campaña» o «ciudad» (otro `quest.ini`) con tienda, moral y viaje
  entre una y otra. Ver `patrones.md` §12.
- **En el editor de Valkyrie**, las aventuras salen en la lista como escenarios sueltos: prueba y empaqueta
  siempre desde la raíz. Probada sola, una aventura no encuentra la siguiente (la busca dentro de su propia
  carpeta), y empaquetada sola sale oculta (`valkyrie-app.md` §5).

## 22. Lo que Valkyrie hace solo en Descent

- **Héroes y clases**: elección de 2 a 4 héroes y de la clase de cada uno (las híbridas, en su caso); los
  objetos de las clases van al grupo. Variables `#Hero…` y `#Class…`.
- **Turnos**: «Fin del Turno» en el retrato de cada héroe; tras cada héroe se activa un grupo al azar.
- **Activación de un grupo**: una activación al azar de las de su tipo (§13-14): efecto especial y lista
  del líder y de los esbirros, en dos ventanas o en una.
- **Grupos**: columna de retratos con Información, Forzar activación, Derrotado y Único derrotado. La Vida
  de cada figura la llevan los jugadores; Valkyrie solo muestra en rojo la Vida adicional.
- **Moral**: `$%morale`; el botón KO de un héroe la baja en 1; por debajo de 0 salta `NoMorale` (si fue
  durante una activación, al cerrarla). Recuperar devuelve al héroe sin tocar la moral.
- **Habilidades**: ventana con los PE de cada héroe (los suyos más `$%xp`) para comprar habilidades de su
  clase (y de la híbrida).
- **Objetos y oro**: ventana de consulta; tienda cuando un evento añade 2 o más QItem.
- **Peligros**: el contenido de Valkyrie trae tres «mazos» (menor, mayor, mortal) que salen al final de la
  ronda si `$perilMinor`, `$perilMajor` o `$perilDeadly` valen 1 (y los vuelven a 0). Sus textos son los de
  la app oficial. Algunos solo salen con ciertas expansiones o con un número de héroes.
- **Viaje**: `$@travelevent,=,1` saca al acabar el evento un evento de viaje al azar (los del juego básico
  son «todo está tranquilo»).
- **No sabe**: posiciones, líneas de visión, daño, fatiga, Estados, qué figura concreta cae. Todo eso lo
  aplican los jugadores con lo que diga el texto (`reglas-descent.md` §19).

## 23. Paquete .valkyrie y manifiesto

Igual que en Mansiones: "Crear paquete" del editor genera `<Id>.valkyrie` (ZIP con la carpeta, incluidas las
aventuras de las subcarpetas), `<Id>.ini` (el `[Quest]` con `type=D2E`, `version` = SHA-256 y los
`name.`/`synopsys.`/`description.`/`authors.`/`authors_short.` de cada idioma) y la portada.
`scripts/empaquetar.py` hace lo mismo. Publicar: `valkyrie-app.md`.

## 24. Lista de comprobación de errores típicos

Valkyrie se cierra o no carga:
- [ ] Componente en dos ficheros; `add=` a algo inexistente; fichero de `[QuestData]` que falta.
- [ ] Una Tile con `side` de una expansión no declarada en `packs` (para quien no la tenga).
- [ ] Línea con solo espacios; `format` fuera de 4-21; `type` distinto de `D2E`.
- [ ] `placementN` con un MPlace que no existe; CustomMonster sin activaciones válidas o sin imagen.
- [ ] Variable de un carácter en una campaña.
- [ ] Una búsqueda `{qst:…` sin su `}` en un texto de algún idioma (el evento se queda a medias).

Carga, pero falla en partida:
- [ ] Evento silencioso con `event1` y sin `buttons=1`.
- [ ] Esperar que `event1=A B` haga A y B.
- [ ] Varios `EventStart`.
- [ ] `NoMorale` sin `$end`, cambio de aventura ni subida de moral (salta en bucle).
- [ ] Dos o más QItem en un `add=` creyendo que se entregan (abren la tienda), o tienda sin `remove=#shop`.
- [ ] Umbrales de fama sin fijar en una campaña con tienda, o fijados en una aventura suelta sin
  `$restock,=,1` (sus objetos ya se sortearon al cargarla).
- [ ] Jefe del mismo tipo que otro grupo en juego (se juntan; `Defeated<Spawn>` no salta como esperas).
- [ ] `uniquetitle` creyendo que se verá (sale «Maestro <monstruo>»).
- [ ] Grupo abierto (`traits`) sin candidatos en el juego básico.
- [ ] Aventuras de campaña sin inglés (sin textos para quien juegue en otro idioma).
- [ ] Ruta de cambio de aventura relativa a la subcarpeta en vez de a la raíz.
- [ ] Disparadores de Mansiones (`Mythos`, `Eliminated`…), que nunca saltan.

Ejecuta `python scripts/validar.py <carpeta>`: comprueba todo lo anterior y más (casillas fuera de las
piezas, puertas sueltas, solapes, packs sin declarar, objetos sin candidatos…).
