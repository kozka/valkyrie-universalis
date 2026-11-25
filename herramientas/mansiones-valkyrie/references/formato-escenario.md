# Formato de escenario de Valkyrie (Mansiones de la Locura 2ª ed.)

Especificación completa de los ficheros de un escenario, verificada contra el código fuente de
Valkyrie 3.28 (`QuestData.cs`, `EventManager.cs`, `VarManager.cs`, `RoundControllerMoM.cs`,
`IniRead.cs`, `DictionaryI18n.cs`, `QuestEditor.cs`, `EditorTools.cs`) y contra 168 escenarios
publicados. Donde la wiki oficial dice otra cosa que el código, manda el código y se indica.

## Índice

1. [Estructura de la carpeta](#1-estructura-de-la-carpeta)
2. [Reglas del lector INI (y errores fatales)](#2-reglas-del-lector-ini-y-errores-fatales)
3. [quest.ini](#3-questini)
4. [Ficheros de localización](#4-ficheros-de-localización)
5. [Claves comunes a todos los componentes](#5-claves-comunes-a-todos-los-componentes)
6. [Event: el motor del escenario](#6-event-el-motor-del-escenario)
7. [Token](#7-token)
8. [Tile](#8-tile)
9. [UI](#9-ui)
10. [Spawn](#10-spawn)
11. [CustomMonster](#11-custommonster)
12. [QItem](#12-qitem)
13. [Puzzle](#13-puzzle)
14. [Door, MPlace y Activation](#14-door-mplace-y-activation)
15. [Variables](#15-variables)
16. [Disparadores (trigger)](#16-disparadores-trigger)
17. [Marcado de texto](#17-marcado-de-texto)
18. [Imágenes y audio](#18-imágenes-y-audio)
19. [Escenarios encadenados y campañas](#19-escenarios-encadenados-y-campañas)
20. [Paquete .valkyrie y manifiesto](#20-paquete-valkyrie-y-manifiesto)
21. [Lista de comprobación de errores típicos](#21-lista-de-comprobación-de-errores-típicos)

---

## 1. Estructura de la carpeta

Un escenario es una carpeta cuyo nombre es su **identificador** (sin espacios, sin acentos; no uses
`EditorScenario1`: los revisores lo rechazan y Valkyrie no muestra la pantalla de puntuación final).
El editor guarda en:

| SO | Carpeta del editor |
|---|---|
| Windows | `%APPDATA%\Valkyrie\MoM\Editor\<Identificador>\` |
| macOS / Linux | `~/.config/Valkyrie/MoM/Editor/<Identificador>/` |

Contenido típico (es lo que escribe el editor):

```
MiEscenario/
├── quest.ini                 ← obligatorio: [Quest], [QuestText], [QuestData]
├── events.ini                ← Event
├── tiles.ini                 ← Tile
├── tokens.ini                ← Token
├── spawns.ini                ← Spawn
├── items.ini                 ← QItem
├── puzzles.ini               ← Puzzle
├── ui.ini                    ← UI
├── monsters.ini              ← CustomMonster (y Activation)
├── Localization.Spanish.txt  ← textos (idioma por defecto)
├── Localization.English.txt  ← traducción (opcional)
├── portada.jpg               ← imagen de la lista de escenarios (opcional, ~200×200)
├── img/…  audio/…            ← recursos propios (opcional)
└── English/…                 ← versiones de imágenes/audio por idioma (opcional)
```

- El reparto en ficheros es libre: cualquier sección puede ir en cualquier `.ini` listado en
  `[QuestData]`. **El tipo lo decide el prefijo del nombre de la sección** (`EventX`, `TokenX`…).
  Secciones con prefijo desconocido se ignoran.
- **Nombres de fichero sensibles a mayúsculas**: `Events.ini` ≠ `events.ini` en Linux y Android (en
  Windows funciona y por eso el error pasa desapercibido). Valkyrie se cierra si falta un fichero de
  `[QuestData]`.
- Un escenario puede contener subescenarios en subcarpetas (ver §19). Valkyrie busca `quest.ini`
  **recursivamente**, así que los subescenarios deben llevar `hidden=True`.

## 2. Reglas del lector INI (y errores fatales)

Comportamiento exacto de `ValkyrieTools.IniRead`:

- Codificación: UTF-8 (con o sin BOM). El editor escribe UTF-8 sin BOM y CRLF en Windows.
- Línea cuyo primer carácter no blanco es `#` → comentario (en cualquier parte). `;` → comentario en
  líneas de datos. El editor pone `; Saved by version: 3.28` al principio de cada fichero.
- `[Nombre]` abre sección. `clave=valor` parte por el **primer** `=` (así `operations=$end,=,1` es
  válido). Se recortan espacios y **las comillas de los extremos** (`image="a.png"` = `image=a.png`).
- Línea sin `=` → clave con valor vacío (así se listan ficheros en `[QuestText]`/`[QuestData]`).
- **Claves sensibles a mayúsculas**: `tokensize` funciona, `tokenSize` (como pone la wiki) no.
  Las claves que usan mayúscula interna son `customImage`, `textAlignment`, `richText`,
  `eventNCondition` y `eventNConditionAction`.
- Clave repetida en una sección → **gana la primera**, las demás se ignoran (sin aviso visible).
- Sección repetida en el mismo fichero → se ignora la segunda.
- ⚠️ **Fatal**: el mismo componente definido en dos ficheros → `Application.Quit()`.
- ⚠️ **Fatal**: una línea con **solo espacios o tabuladores** provoca una excepción en el lector
  (`l.Trim()[0]`). Ningún escenario publicado tiene una: no las escribas.
- ⚠️ **Fatal**: `add=` con un nombre de componente que no existe → `Application.Quit()`.
- ⚠️ **Fatal**: un `Tile` sin `side` ni `customImage`, o con una imagen que no carga.
- Nombres de componentes: usa solo `[A-Za-z0-9_]`. Van en listas separadas por espacios y forman las
  claves de texto `Nombre.text`, así que nada de espacios, comas, dos puntos ni puntos.

## 3. quest.ini

```ini
; Saved by version: 3.28
[Quest]
format=21
hidden=False
type=MoM
defaultlanguage=Spanish
defaultmusicon=True
packs=BtT SoA
minhero=1
maxhero=5
difficulty=0.6
lengthmin=90
lengthmax=120
image=portada.jpg

[QuestText]
Localization.Spanish.txt
Localization.English.txt

[QuestData]
events.ini
tiles.ini
tokens.ini
spawns.ini
items.ini
puzzles.ini
ui.ini
monsters.ini
```

| Clave | Valores | Notas (código) |
|---|---|---|
| `format` | 4 a **21** | Fuera de rango → el escenario no aparece. 21 = Valkyrie ≥ 3.20 (imágenes propias en losetas/fichas, `clickeffect`). 20 = 3.15 (borrados `#tiles`, `#tokens`…). 19 = 3.0. 18 = 2.5.4. Usa **21** salvo que quieras compatibilidad con versiones antiguas y no uses nada nuevo. |
| `type` | `MoM` | `D2E` es Descent. |
| `hidden` | `True`/`False` | `True` = no sale en la lista (subescenarios, partes de campaña). |
| `defaultlanguage` | `Spanish`, `English`… | Idioma del que se toman las claves que falten en otros idiomas. |
| `defaultmusicon` | `True`/`False` | Si suena la música genérica de partida (por defecto `True`). |
| `packs` | IDs separados por espacio | Expansiones obligatorias. Sin ellas el escenario aparece como no disponible. No pongas `MoMBase`. Para el kit de conversión usa `MoM1ET MoM1EM MoM1EI FAT FAM FAI CotWT CotWM CotWI MoM1CK` (no `RN`/`SM`). Alias antiguos: `MoM1E`, `FA`, `CotW`. Un pack de la comunidad se pide igual (`TLE`, *Expediciones perdidas*: el jugador lo baja en Mi colección). Lo que definen dos packs vale con cualquiera de ellos, y Valkyrie usa la primera definición (`TileSideCampsite` está en el kit de conversión y en *La Senda de la Serpiente*; su reverso es el del kit). Ver `catalogo.md`. |
| `minhero` | entero | Por defecto 2 (el mínimo efectivo es 1). |
| `maxhero` | entero | Por defecto 5; máximo 10 en MoM. |
| `difficulty` | 0 a 1 | ×5 = estrellas (0,6 → 3 estrellas). 0 = no se muestra. |
| `lengthmin`/`lengthmax` | minutos | Duración que se muestra. Sé realista (los jugadores leen mucho). |
| `image` | ruta relativa | JPG/PNG para la lista (se muestra 1:1). Sin espacios en el nombre. |
| `version` | texto | Lo rellena "Crear paquete" (SHA-256). Si cambia respecto al publicado, Valkyrie ofrece actualizar. |

Textos del escenario (en los ficheros de localización, no en el .ini):

| Clave | Uso |
|---|---|
| `quest.name` | Título. |
| `quest.description` | Descripción larga ("tráiler"): admite `<b>`, `<i>`, `\n`. |
| `quest.synopsys` | Sinopsis de una línea (sí, con esa ortografía). Va al manifiesto. |
| `quest.authors` | Autores y traductores (admite `\n`, `<b>`). |
| `quest.authors_short` | Autores en una línea (máx. ~75 caracteres). |

`[QuestText]` lista los ficheros de localización y `[QuestData]` los `.ini` de datos (rutas relativas,
subcarpetas permitidas). `quest.ini` siempre se lee aunque no esté en la lista.

## 4. Ficheros de localización

`Localization.<Idioma>.txt` (UTF-8). Formato real de `DictionaryI18n`:

```text
.,Spanish
quest.name,La biblioteca de Miskatonic
quest.description,"Una carta urgente os cita en la biblioteca.\n\n<i>Escenario de investigación.</i>"
EventInicio.text,"La lluvia golpea los ventanales.\nColoca {c:TileVestibulo} como se indica."
EventInicio.button1,Continuar
TokenEstanteria.text,|||Alguien ha escrito "NO LEAS" en el lomo de un libro.|||
// esto es un comentario
```

- **Primera línea obligatoria `.,<Idioma>`**: el idioma lo decide esta línea, no el nombre del
  fichero (dos ficheros con `.,Spanish` se fusionan; gana la primera aparición de cada clave).
- Idiomas válidos: English, Spanish, German, French, Italian, Polish, Portuguese, Russian, Chinese,
  Czech, Japanese, Korean, Ukrainian.
- Cada línea `clave,valor` se parte por la **primera coma**: las comas del valor no necesitan comillas.
- `\n` (barra y n, literal) = salto de línea. No hay otras secuencias de escape.
- Valor entre comillas `"…"`: se quitan y `""` representa una comilla. El editor entrecomilla los
  valores con `\n`.
- Valor con comillas `"` dentro: escríbelo entre **`|||…|||`** (es lo que hace el editor).
- Un valor que empieza por `"` y no cierra en la misma línea continúa en las siguientes hasta la
  comilla de cierre (bloque multilínea). Evítalo: usa `\n` en una sola línea.
- Líneas que empiezan por `//` = comentario.
- ⚠️ **No mezcles finales de línea**: si el fichero contiene algún `\r`, Valkyrie parte solo por `\r`
  y las líneas que terminen solo en `\n` se pegan a la anterior (la clave nueva desaparece y la
  anterior se corrompe). Todo CRLF o todo LF.
- Búsqueda de un texto: idioma del jugador → idioma de reserva del usuario → `defaultlanguage` →
  cualquiera. Valores vacíos o en blanco cuentan como ausentes.
- Texto de evento ausente → diálogo sin texto. **Etiqueta de botón ausente → se ve la clave**
  (`EventX.button1`): pon siempre la etiqueta de cada botón.
- Un valor puede contener otras claves: `EventY.text,{qst:TextoComun}` o `{ffg:CLAVE}` (texto oficial
  ya traducido por FFG, ver §17).
- ⚠️ **Una búsqueda sin cerrar para el evento**: Valkyrie busca el `}` de un `{qst:`, `{ffg:` o `{val:`
  contando llaves y, si el texto se acaba antes, lanza una excepción al enseñarlo y el evento se queda
  a medias. Pasa sobre todo en traducciones: en la tienda hay 15 textos así (*Eyes Behind the
  Mirror*, *Return to the Mirror*, *Mansión abandonada*). `validar.py` lo da como error.
- **Al editar textos con el editor de Valkyrie**, se escriben en el idioma en que está Valkyrie, no en el
  del escenario (`valkyrie-app.md` §6).

Claves de texto por componente:

| Componente | Claves |
|---|---|
| Event, Token, Door, UI, Spawn, Puzzle | `Nombre.text`, `Nombre.button1`…`Nombre.buttonN` |
| UI | además `Nombre.uitext` (texto dibujado en el propio elemento si no tiene imagen) |
| Spawn | (`Nombre.uniquetitle`, `Nombre.uniquetext`: solo con `unique`, no recomendado en MoM) |
| CustomMonster | `Nombre.monstername`, `Nombre.info`, `Nombre.Attack_<tipo>_<n>` |
| Activation | `Nombre.ability`, `.master`, `.minion`, `.movebutton`, `.move` |
| Puzzle | `Nombre.button1` (botón al resolver) |

## 5. Claves comunes a todos los componentes

| Clave | Significado |
|---|---|
| `xposition`, `yposition` | Posición en unidades del tablero (decimales con punto). Ver `mapa-losetas.md`. En eventos: si existe, la cámara se mueve ahí al dispararse. |
| `comment` | Comentario para el autor (Valkyrie lo conserva). |
| `operations` | Operaciones de variables al dispararse (ver §15). |
| `vartests` | Condiciones para que el componente esté **habilitado** (ver §15). Ignorado en Token. |
| `conditions` | Formato antiguo de condiciones (AND). Se ignora si hay `vartests`. No lo uses. |

## 6. Event: el motor del escenario

Todo lo que pasa en un escenario son eventos encadenados. Token, Door, UI, Spawn y Puzzle son
"eventos con algo más" y aceptan todas estas claves.

```ini
[EventBibliotecaBuscar]
xposition=3.5
yposition=-1.75
display=true
highlight=false
buttons=2
event1=EventBibliotecaExito
event2=EventBibliotecaFallo
buttoncolor1="green"
buttoncolor2="red"
operations=busquedas,+,1
vartests=VarOperation:bibliotecaRevisada,==,0
add=TokenNota
remove=TokenBuscarBiblioteca
audio=AudioPapers1
trigger=
randomevents=false
quota=0
```

| Clave | Valores | Efecto |
|---|---|---|
| `display` | `true` (por defecto) / `false` | `false` = evento silencioso: no muestra diálogo y continúa por el primer botón habilitado. |
| `buttons` | entero | Nº de botones. **Solo se leen `event1..eventN` hasta este número.** Si `display=true` y falta, vale 1. ⚠️ Un evento silencioso con `event1` y sin `buttons=1` no continúa. |
| `eventN` | nombres separados por espacio | Al pulsar el botón N se encola **UN solo** evento: el primero habilitado de la lista (o uno al azar entre los habilitados si `randomevents=true`). Vacío = no pasa nada más. |
| `eventNCondition` | condición (formato `vartests`) | Condición del botón N. |
| `eventNConditionAction` | `disable` (por defecto si hay condición) / `hide` / `none` | Si la condición falla: botón gris, oculto, o se muestra igual. |
| `buttoncolorN` | `#RRGGBB`, `#RRGGBBAA` o nombre | Nombres: black, white, red, lime, blue, yellow, aqua, cyan, magenta, fuchsia, silver, gray, maroon, olive, green, purple, teal, navy, transparent. Otra cosa puede romper el diálogo. |
| `randomevents` | `true`/`false` | Elige al azar entre los eventos habilitados de la lista del botón. |
| `quota` | número o nombre de variable | Tirada acumulativa (ver abajo). |
| `minhero` / `maxhero` | enteros | En Descent, `maxhero>0` pide elegir héroes pulsando sus retratos. ⚠️ **En Mansiones no sirve**: los retratos se quitan al acabar la selección inicial (HeroCanvas.EndSection), nadie puede elegir y el botón no avanza: la partida se queda bloqueada. Alternativas en `patrones.md` §5. |
| `hero` | nombre de evento | Marca como elegidos los investigadores elegidos en ese evento (en Mansiones, solo los de un `{rnd:hero}`). |
| `highlight` | `true`/`false` | Marca la posición en el tablero (si no, solo mueve la cámara). |
| `add` | componentes | Muestra Tile, Token, Door, UI o da un QItem. Spawn en `add` se ignora (los Spawn se disparan como eventos). ⚠️ Nombre inexistente = cierre de Valkyrie. |
| `remove` | componentes o especiales | Quita del tablero. Ver especiales abajo. |
| `trigger` | disparador | Ver §16. |
| `audio` | `AudioX` o ruta `.ogg` | Efecto de sonido. |
| `music` | lista de `AudioX` o rutas | 1 pista: suena y luego vuelve la lista anterior. Varias: nueva lista en bucle. Para repetir una sola, ponla dos veces. |
| `mincam` / `maxcam` | `true` | Limita la cámara: esta posición es el mínimo (abajo-izquierda) o máximo (arriba-derecha). |

Especiales de `remove=` (formato 20+ salvo `#monsters`, `#boardcomponents`, `#shop`):
`#monsters` (quita todos los monstruos **sin** disparar `Defeated`), `#boardcomponents` (losetas,
fichas, puertas y UI), `#tiles`, `#tokens`, `#doors`, `#uicomponents`, `#qitems` (quita del inventario
los objetos dados por QItem). Quitar un **Spawn** quita todos los monstruos de su tipo sin
`Defeated`. Quitar un **QItem** lo retira del inventario.

### 6.1 Cómo se ejecuta (modelo mental imprescindible)

Valkyrie usa una **pila** de eventos (el último encolado se ejecuta primero). Al ejecutar un evento,
en este orden:

1. Suena `audio` y cambia `music`.
2. Se aplican las `operations` (antes de mostrar nada: el texto ya ve los valores nuevos).
3. Si `$restock` es 1, se vuelven a sortear los objetos.
4. Si es un Spawn: se elige el monstruo y se añade a la lista de monstruos.
5. Se marca la posición si `highlight=true`.
6. Se aplican `add` y luego `remove`.
7. Se mueve la cámara si tiene posición (no en UI).
8. Si es un Puzzle: se abre el puzle (y ahí termina).
9. Si `display=false`: se continúa sin diálogo por el primer botón cuya condición se cumpla.
   Si `display=true`: se muestra el diálogo con el texto y los botones.

Al pulsar un botón (o al continuar uno silencioso):

- Si `$end` ≠ 0 → **termina la partida** (si el escenario es un paquete con nombre propio, sale la
  pantalla de final y puntuación; si no, vuelve al menú).
- Se encola **un** evento de la lista del botón: el primero habilitado (o uno al azar).
- Se disparan los eventos `Var…` de las variables `@` que valgan 1.
- Se ejecuta lo que esté en lo alto de la pila.

Consecuencias de diseño:

- `event1=A B C` **no** ejecuta A, luego B, luego C. Ejecuta A si está habilitado; si no, B; si no,
  C. Para encadenar acciones, cada evento apunta al siguiente (A → B → C).
- Un evento está **deshabilitado** si sus `vartests` fallan: no se encola nunca (ni por botón ni por
  disparador). Así se ramifica: `event1=EventFinalBueno EventFinalMalo` con `vartests` en el primero.
- Un evento silencioso puede ramificar también con condiciones de botón (`eventNCondition`): continúa
  por el primer botón habilitado.
- Si ningún botón está habilitado (todos con condición fallida), un evento normal añade un botón
  "Continuar" automático.
- Fichas, puertas y UI (componentes "cancelables") solo muestran sus botones si **alguno de sus
  eventos de destino está habilitado**; si no (lista vacía, eventos inexistentes o con `vartests`
  fallidos) solo aparece "Cancelar". Así se "apaga" una ficha: pon `vartests` en el evento al que
  apunta.
- Los eventos encolados por disparadores esperan a que termine la cadena actual completa.
- Las `vartests` se comprueban al encolar **y otra vez al sacar el evento de la pila**: si un evento
  anterior cambió las variables y ya no se cumplen, se salta. Así dos eventos del mismo disparador
  pueden excluirse entre sí con una variable (el primero que se ejecute la cambia).
- Un nombre en `eventN` que no existe se ignora (aviso en el registro), salvo que sea la ruta de un
  `quest.ini` (§19).

### 6.2 Tiradas: botones o cuota

**Superada/Fallada** (lo más habitual):

```ini
[EventForzarCerradura]
buttons=2
event1=EventCerraduraAbierta
event2=EventCerraduraResiste
buttoncolor1="green"
buttoncolor2="red"
```
```text
EventForzarCerradura.text,Intentas forzar la cerradura. Realiza una tirada de {observation} (2).
EventForzarCerradura.button1,Superada
EventForzarCerradura.button2,Fallada
```

**Cuota (`quota`)**: muestra un selector numérico 0–10 y un solo botón (`button1`). Los éxitos se
**acumulan entre intentos**; si el acumulado ≥ cuota → `event1` (y el contador se reinicia); si no →
`event2` (necesitas `buttons=2` para que exista ese camino).

```ini
[TokenPuertaAtascada]
type=TokenExplore
xposition=7
yposition=-1.75
buttons=2
quota=4
event1=EventPuertaCede
event2=EventPuertaAguanta
```

Con `quota=nombreVariable` el número elegido se guarda en esa variable y siempre se sigue por
`event1` (útil para "indica cuántos éxitos sacaste" y ramificar con `vartests`).

## 7. Token

Fichas del tablero: Búsqueda, Exploración, Interacción, Vistazo, personajes, paredes, puertas,
oscuridad… Al pulsarlas se ejecutan como un evento con botón **Cancelar** añadido.

```ini
[TokenBuscarEscritorio]
type=TokenSearch
xposition=2.6
yposition=-2.2
rotation=0
buttons=1
event1=EventBuscarEscritorio
```
```text
TokenBuscarEscritorio.text,Un escritorio de roble lleno de papeles.
TokenBuscarEscritorio.button1,{action} Registrar el escritorio
```

| Clave | Valores | Notas |
|---|---|---|
| `type` | ID de ficha o de monstruo | `TokenSearch`, `TokenExplore`, `TokenInteract`, `TokenSight`, `TokenInvestigators`, `TokenWallInside`, `TokenDoorInside`, `TokenDarkness`, personajes (`TokenWhiteMan`…), monstruos (`MonsterCultist`)… Lista completa en `catalogo.md`. Tipo inexistente → se dibuja como `TokenSearch`. |
| `rotation` | grados | Gira alrededor de su centro (paredes y puertas: 90 para lados verticales). |
| `tokensize` | `small` (1×1), `medium` (2×1), `huge` (2×2), `massive` (3×2), `Original`, número | **En minúsculas `tokensize`** (la wiki dice `tokenSize`). `Original` con mayúscula. Vacío = tamaño nativo (1×1 en las fichas estándar). |
| `customImage` | ruta .png/.jpg | Formato 21. Imagen propia en lugar de `type`. |
| `clickeffect` | `false` | Formato 21. No se puede pulsar (decoración). |

- Las fichas **ignoran `vartests`** (desde el formato 6): no se pueden "ocultar" con condiciones.
  Para que una ficha aparezca según el estado, añádela desde el evento que cambia ese estado; para
  que deje de ofrecer su acción, pon `vartests` en el evento de destino o una `eventNCondition`
  en su botón (la ficha seguirá mostrando su texto y "Cancelar").
- Fichas decorativas (paredes, puertas) suelen llevar `display=false` y `buttons=0`.
- Para que un clic dé opciones con coste de acción, pon `{action}` en la etiqueta del botón.

## 8. Tile

```ini
[TileVestibulo]
side=TileSideEntryHall
xposition=0
yposition=0
rotation=90
```

| Clave | Notas |
|---|---|
| `side` | ID de cara de loseta (`TileSide…`, ver `catalogo.md`). Las dos caras de una misma loseta física comparten cartón: no uses ambas a la vez (`reverse` en el catálogo). |
| `xposition`, `yposition` | Esquina superior izquierda de la loseta antes de girar. |
| `rotation` | 0, 90, 180, 270 (grados, sentido antihorario alrededor de esa esquina). |
| `customImage`, `top`, `left` | Formato 21: loseta con imagen propia; `top`/`left` = píxel de anclaje. |

Las losetas no aparecen hasta que un evento las añade con `add=`. Geometría y cálculo de
posiciones: `mapa-losetas.md`.

## 9. UI

Elementos de pantalla (imágenes, textos, botones invisibles) para prólogos, cartas, diarios y
puzles propios. Mientras haya **alguna UI en pantalla, el botón de fin de fase no funciona**:
quítalas siempre al terminar.

```ini
[UIPrologoFondo]
image=ImageGreenBG
size=1
vunits=true
xposition=0
yposition=0
display=false
buttons=0

[UIPrologoTexto]
image=
size=0.8
vunits=true
textsize=1.1
textcolor=white
textaspect=1.6
richText=true
xposition=0
yposition=0
buttons=1
event1=EventPrologo2
```
```text
UIPrologoTexto.uitext,"<b>Arkham, 1926.</b>\nLa carta llegó sin remitente..."
```

| Clave | Notas |
|---|---|
| `image` | `ImageX` del catálogo o ruta a png/jpg. Vacío + `uitext` = caja de texto. |
| `size` | Fracción del ancho de pantalla (o del alto si `vunits=true`). Mantiene la proporción. |
| `vunits` | `true` = las unidades son el alto de pantalla (recomendado para que encaje igual en 16:9 y 16:10). |
| `halign` / `valign` | `left`/`right` y `top`/`bottom` (por defecto, centro). `xposition`/`yposition` son distancias desde ese borde (o desde el centro). |
| `textsize` | 1 = tamaño normal de los diálogos (~30 líneas por pantalla). |
| `textcolor`, `textbackgroundcolor` | Colores (mismo formato que `buttoncolor`). |
| `textaspect` | Proporción ancho/alto de la caja de texto. |
| `textAlignment` | `TOP`, `CENTER`, `BOTTOM`. |
| `richText` | `true` = marcado TextMesh Pro en `uitext`. |
| `border` | `true` = borde del color del texto. |
| `fadespeed` | `instant`, `fast` (por defecto), `slow`. |
| `clickeffect` | `false` = no reacciona al clic. |

- Se dibujan en el orden en que se añaden: fondo primero, luego imagen, luego texto, luego botón.
- Pulsar una UI ejecuta su evento (con botón Cancelar). Una UI con `display=false` y `event1`
  sirve de "botón invisible" que avanza al pulsarla.

## 10. Spawn

Hace aparecer un monstruo. Es un evento: se dispara desde `eventN` o con `trigger`, **no** con `add`.

```ini
[SpawnSotanoSectario]
monster=MonsterCultist
xposition=5.25
yposition=-5.25
uniquehealth=0
uniquehealthhero=0
buttons=1
event1=EventTrasAparicion
audio=AudioMonsterGeneric4
```
```text
SpawnSotanoSectario.text,Un {type} surge de las sombras. Colócalo en el lugar indicado.
SpawnSotanoSectario.button1,Continuar
```

| Clave | Notas |
|---|---|
| `monster` | Lista: se usa el **primero disponible** (pon primero el de expansión y luego uno del base). El prefijo `Monster` es opcional. Puede ser un `CustomMonster…` o el nombre de otro `Spawn…` (mismo tipo que salió en ese). Si hay `traits`/`traitpool`, esta lista pasa a ser de **exclusiones**. |
| `traits` / `traitpool` | Monstruo al azar con todos / alguno de esos rasgos (`humanoid`, `beast`, `spirit`, `small`, `undead`…). |
| `uniquehealth`, `uniquehealthhero` | Vida extra de **este** monstruo: `round(uniquehealth + investigadores × uniquehealthhero)`, se suma a la del tipo aunque no sea único (admite negativos). |
| `unique` | Herencia de Descent (monstruo "maestro"): ningún escenario de MoM publicado lo usa y el código muestra el título "Maestro {tipo}". **No lo uses**: para un monstruo con nombre propio crea un `CustomMonster` con `monstername` (§11). |
| `activated` | `true` = aparece ya activado (no actúa esta ronda). |
| posición | Muestra la miniatura del monstruo en el tablero y mueve la cámara. |

- En el texto, `{type}` = nombre oficial del monstruo elegido (en un CustomMonster, su `monstername`;
  si no lo tiene, el del `base`); `{c:SpawnX}` también (si ya apareció).
- Vida total = `round(health + investigadores × healthperhero)` del tipo (catálogo) + modificador.
- Derrotarlo dispara `Defeated<TipoMonstruo>` y `Defeated<NombreSpawn>` (§16).
- La variable `#monsters` cuenta los monstruos en juego.

## 11. CustomMonster

Monstruo propio o versión modificada de uno existente.

```ini
[CustomMonsterBibliotecario]
base=MonsterCultist
traits=humanoid
health=3
healthperhero=1
horror=2
awareness=4
activation=EventActivaBibliotecario
evadeevent=EventEvadirBibliotecario
horrorevent=EventHorrorBibliotecario
attacks=heavy:1 unarmed:2
image=img/bibliotecario.png
```
```text
CustomMonsterBibliotecario.monstername,El bibliotecario
CustomMonsterBibliotecario.info,Un anciano de ojos lechosos que susurra en latín.
CustomMonsterBibliotecario.Attack_heavy_1,Golpeas al anciano... {0} retrocede tambaleándose.
CustomMonsterBibliotecario.Attack_unarmed_1,...
CustomMonsterBibliotecario.Attack_unarmed_2,...
```

| Clave | Notas |
|---|---|
| `base` | Monstruo del que hereda nombre, imagen, vida, rasgos, textos de ataque/evasión/horror y activaciones (todo lo que no definas). |
| `traits` | Si no hay `base`, pon al menos una categoría (`humanoid`, `beast`, `spirit`, `fleshless`, `snakeperson`) o no habrá opciones de ataque. |
| `health`, `healthperhero` | Vida = `round(health + investigadores × healthperhero)`. |
| `horror`, `awareness` | Horror y Percepción mostrados. |
| `activation` | Tres formas (`RoundController.ActivateMonster`): **(1)** **un solo** nombre de evento **que empiece por `Event`**: se ejecuta en lugar de la activación estándar (con la imagen del monstruo); si sus `vartests` fallan, el monstruo no hace nada esa ronda. **(2)** Una lista de nombres `X Y…`: por cada uno usa el componente `[ActivationX]` del escenario (si sus `vartests` se cumplen) o, si no existe, la activación **oficial** `MonsterActivationX` (p. ej. `activation=Cultist01 Cultist03` reutiliza activaciones del Sectario; lista en `catalogo.json` → `activation_ids`, o `buscar.py --tipo activaciones`); cada vez que se activa elige una al azar. Los nombres que no existen se ignoran. **(3)** Vacío: las activaciones del `base`. ⚠️ **Valkyrie se cierra** si no hay `base` ni `activation`, si el evento de (1) no existe o si en (2) no queda ninguna activación válida (todas inexistentes o con `vartests` fallidos). Un evento dentro de una lista de varios nombres no funciona como evento. |
| `evadeevent`, `horrorevent` | Eventos que sustituyen a la tirada de evasión / de Horror estándar. |
| `attacks` | `tipo:cantidad` (tipos `heavy`, `bladed`, `firearm`, `spell`, `unarmed`) → textos `Attack_<tipo>_<n>`. Los tipos que no pongas usan los genéricos de su categoría. `{0}` = nombre del monstruo. |
| `image`, `imageplace` | Ruta relativa a la imagen (miniatura y colocación). |

Se usa poniéndolo en `monster=` de un Spawn. `{c:CustomMonsterX}` = su nombre.

## 12. QItem

Objetos que Valkyrie sortea **al empezar**, en el orden de los ficheros (`Quest.AttemptItemMatch`).
Los que tienen `traits`/`traitpool` excluyen lo ya sorteado y lo que hay en el inventario; los que
tienen solo `itemname` **no** comprueban duplicados. El inventario es un conjunto: entregar un
objeto que ya se tiene no añade nada (ver `patrones.md` §12).

```ini
[QItemInicialArma]
starting=True
traits=weapon common

[QItemLlaveSotano]
starting=False
itemname=ItemUniqueBrassKey

[QItemDiario]
starting=False
itemname=ItemUniqueOldJournal
inspect=EventLeerDiario
```

| Clave | Notas |
|---|---|
| `starting` | `True` = se entrega al empezar (las oficiales suelen dar 4-5). Escríbelo siempre: si falta, vale `True`. |
| `itemname` | Sin rasgos: el primer objeto disponible de la lista (o el mismo que otro `QItemX`). Con rasgos: exclusiones. |
| `traits` / `traitpool` | Todos / alguno de los rasgos (`weapon`, `common`, `unique`, `spell`, `lightsource`…). Si nada encaja, no se da nada. |
| `vartests` | Solo para objetos iniciales: si falla, no se entregan. |
| `inspect` | Evento que se abre al pulsar el objeto en el inventario (cartas, diarios, pistas). |

- Se da un objeto con `add=QItemX` en un evento: el texto del evento aparece junto a la carta del
  objeto. **Uno por evento**: con varios QItem en el mismo `add=` se entregan todos al inventario,
  pero la ventana no enseña ninguna carta (`DialogWindow.DrawItem` solo la dibuja si hay exactamente
  uno) y el registro avisa "only one QItem can be used". Para dar varios, encadena eventos.
- `{c:QItemX}` = nombre oficial del objeto sorteado.
- `remove=QItemX` lo quita del inventario; `$restock=1` repite el sorteo.

## 13. Puzzle

```ini
[PuzzleCajaFuerte]
class=code
skill={lore}
puzzlelevel=4
puzzlealtlevel=5
image=symbol
buttons=1
event1=EventCajaAbierta
display=false
```
```text
PuzzleCajaFuerte.button1,Resolver
```

| `class` | Puzle oficial | `puzzlelevel` | `puzzlealtlevel` |
|---|---|---|---|
| `slide` | **Mecanismo** (*Lock*: bloques que se deslizan para sacar la pieza por la derecha) | movimientos mínimos de la solución (por defecto 4) | — |
| `image` | **Mosaico** (*Slide*: recomponer una imagen) | piezas horizontales | piezas verticales |
| `code` | **Código** (*Mastermind* con números, símbolos o runas) | longitud del código | nº de símbolos distintos |
| `tower` | **Torre** (Calles de Arkham) | movimientos mínimos | — |

- Ojo con los nombres: la clase `slide` de Valkyrie es el *Lock puzzle* oficial (Mecanismo) y
  `image` es el *Slide puzzle* (Mosaico). No existen los puzles de Líneas ni de Anillos.
- `image`: para `image`, un `PuzzleX` del catálogo (rejilla 3×3 o 4×2) o una ruta png/jpg; para
  `code`, `symbol` (símbolos) o `element` (elementos químicos); vacío = números.
- `puzzlesolution`: solución fija de `code`, p. ej. `1 3 4 1` (valores de 1 a `puzzlealtlevel`).
- `skill`: icono del atributo (`{observation}`, `{lore}`…), solo informativo.
- El progreso se guarda al cerrar y se reanuda al volver a abrirlo. **Valkyrie no limita los pasos**:
  los jugadores cuentan (atributo impreso + 1 por Pista gastada).
- `event1` se ejecuta al resolverlo. Se abre como cualquier evento (desde un botón de una ficha).

## 14. Door, MPlace y Activation

- **Door**: puerta de Descent (clicable, con color). En MoM las puertas son **fichas**
  (`TokenDoorInside`, `TokenExplore` sobre el umbral). Casi no se usa.
- **MPlace**: posiciones individuales de un grupo de monstruos (Descent). En MoM, un Spawn por
  monstruo.
- **Activation** (`[ActivationX]`, el editor la guarda en `monsters.ini`): activación de texto como
  las oficiales, para la forma (2) de `activation=` de un CustomMonster. Textos en la localización:
  `ActivationX.ability` (primer recuadro: movimiento/efecto; `{0}` = nombre del monstruo),
  `ActivationX.master` (lo que se ve al pulsar "El monstruo ataca"), `ActivationX.movebutton`
  (etiqueta del segundo botón, p. ej. `{ffg:UI_NOT_IN_SPACE}` como las oficiales) y `ActivationX.move`
  (texto al pulsar ese botón; si no existe, la activación termina). `minion`, `minionfirst` y
  `masterfirst` son de Descent. Admite `vartests` para que solo se elija en ciertas condiciones.
  Las oficiales (`MonsterActivationCultist01`…) se reutilizan sin copiarlas: `activation=Cultist01`.
  Con la forma (1), un evento propio, tienes más control (botones, variables, tiradas).

## 15. Variables

Todas son números (float), empiezan en 0 y no se declaran.

| Prefijo | Tipo | Ejemplos |
|---|---|---|
| letra | del escenario | `pistas`, `puertaAbierta` |
| `%` | de campaña: sobreviven al pasar a otro `quest.ini` | `%final1` |
| `@` | disparador: al ponerla a 1, al final del evento se pone a 0 y se disparan los eventos con `trigger=Var<nombre sin @>` | `@alarma` → `trigger=Varalarma` |
| `$` | de Valkyrie, escribibles | `$end`, `$fire`, `$restock`, `$mythosMinor`… |
| `#` | de Valkyrie, solo lectura | `#round`, `#heroes`… |

Variables de Valkyrie en MoM:

| Variable | Significado |
|---|---|
| `#round` | Ronda actual (empieza en 1). |
| `#heroes` | Nº de investigadores. |
| `#monsters` | Nº de monstruos en juego. |
| `#eliminated` | 1 si se marcó "Investigador eliminado" en el menú. |
| `#<IDpack>` | 1 si la expansión está activa: `#BtT`, `#SoA`, `#SoT`, `#HJ`, `#PotS`, `#MoM1ET`… y los agregados `#MoM1E`, `#FA`, `#CotW`. |
| `#Hero<Nombre>` | 1 si ese investigador juega: `#HeroAgathaCrane`, `#HeroWendyAdams`… |
| `#rand<N>` | **Solo como valor**: entero aleatorio 1..N en cada uso (`tirada,=,#rand6`). |
| `$end` | Ponla a 1: la partida termina al acabar ese evento. |
| `$fire` | 1 = hay fuego; cada Fase de Mitos sale el evento de propagación. |
| `$restock` | 1 = volver a sortear los QItem. |
| `$mythosHelp`, `$mythosFlavor`, `$mythosMinor`, `$mythosMajor`, `$mythosDeadly` | Intensidad de los Mitos genéricos (ver `patrones.md`). |
| `$mythosIndoors`, `$mythosOutdoors`, `$mythosLibrary`, `$mythosKitchen`… | Mitos de lugar (necesitan además una de intensidad). Lista en `catalogo.md`. |
| `$mythosDarkness`, `$mythosDiscardItem`, `$mythosKey` | Mitos especiales. |

**Operaciones** (`operations=`, separadas por espacios, cada una `variable,operador,valor`):
operadores `=`, `+`, `-`, `*`, `/`, `%`. El valor es un número (empieza por dígito, `-` o `.`),
`#randN`, o el nombre de otra variable. Ejemplo:
`operations=fin,=,20 fin,-,#heroes mitad,=,fin mitad,/,2`. Las `#` no se pueden escribir.

**Condiciones** (`vartests=`, elementos separados por espacios):

```
vartests=VarOperation:pistas,>=,3 VarTestsLogicalOperator:AND VarOperation:#round,<,10
vartests=VarTestsParenthesis:( VarOperation:a,==,1 VarTestsLogicalOperator:OR VarOperation:b,==,1 VarTestsParenthesis:) VarTestsLogicalOperator:AND VarOperation:c,==,0
```

Operadores: `==`, `!=`, `>=`, `<=`, `>`, `<`. Se evalúa de izquierda a derecha (sin precedencia
entre AND y OR: usa paréntesis). Cada `VarOperation` necesita exactamente 3 partes no vacías: una
mal formada puede bloquear Valkyrie. Tras divisiones compara con `>=`/`<=`, nunca `==` con decimales.

`{var:nombre}` en un texto muestra el valor (las `#` normales también; `#randN` no).

## 16. Disparadores (trigger)

Un evento con `trigger=` se encola solo cuando ocurre la condición (si sus `vartests` lo permiten).

| `trigger` | Cuándo |
|---|---|
| `EventStart` | Al empezar la partida. **Pon uno solo**: con varios, el orden no es fiable. |
| `StartRound` | Al empezar cada ronda, **incluida la 1** (tras la cadena de `EventStart`). |
| `EndInvestigatorTurn` | Cuando los jugadores pulsan "Fin de fase" de investigadores (una vez por ronda, no por investigador). Antes de los Mitos. |
| `Mythos` | En la Fase de Mitos, junto al evento de Mitos genérico y la propagación del fuego (orden entre ellos no garantizado). |
| `BeforeMonsterActivation` | Tras los Mitos y antes de activar monstruos. El más predecible para "cada ronda". |
| `EndRound` | Al acabar la ronda (tras el paso de Horror). |
| `EndRound<N>` | Al acabar la ronda N (`EndRound5`). Funciona aunque esté marcado como antiguo. |
| `StartFinalRound` | Al empezar la ronda siguiente a marcar un investigador eliminado. |
| `Eliminated` | Al final de la fase de investigadores de esa última ronda: pon aquí la derrota por eliminación. |
| `Defeated<TipoMonstruo>` | Al derrotar un monstruo de ese tipo: `DefeatedMonsterCultist`, `DefeatedCustomMonsterX`. |
| `Defeated<NombreSpawn>` | Al derrotar el monstruo que salió de ese Spawn: `DefeatedSpawnJefe`. |
| `Var<nombre>` | Al poner a 1 la variable `@nombre` (ver §15). |

Orden en una ronda: (investigadores juegan y pulsan "Fin de fase") → `EndInvestigatorTurn` →
`Mythos` → `BeforeMonsterActivation` → activaciones de monstruos → paso de Horror (jugadores) →
`EndRound`, `EndRound<N>` → nueva ronda: `StartFinalRound` (solo tras un eliminado) → `StartRound`.

Eliminación paso a paso (código de `RoundControllerMoM`): el jugador marca "Investigador eliminado"
en el menú (`#eliminated`=1) → al acabar esa ronda queda fijado → la ronda siguiente empieza con
`StartFinalRound` → cuando los jugadores pulsan "Fin de fase" de investigadores en esa ronda se
dispara `Eliminated` **antes** de los Mitos. Si tu evento `Eliminated` no termina la partida (por
ejemplo, porque el objetivo ya está cumplido y prefieres seguir), los jugadores tendrán que pulsar
"Fin de fase" otra vez. Mientras no se dispare `Eliminated` se puede deshacer desde el menú.

Varios eventos con el mismo disparador se apilan y salen en orden **inverso** al de los ficheros
(la pila es LIFO): no dependas de su orden; si importa, usa un único evento que encadene los demás.
`DefeatedUnique…` no se dispara en MoM.

## 17. Marcado de texto

Se procesa en este orden: búsquedas de diccionario → `{c:}` → `{rnd:hero}` → `{var:}` → símbolos →
`\n`.

| Marca | Resultado |
|---|---|
| `{qst:CLAVE}` | Otra clave de tu localización (reutiliza textos). Con parámetros, `{qst:Plantilla:{0}:Ana}` toma el texto de `Plantilla` y cambia en él `{0}` por `Ana` (varios pares seguidos valen). Con llaves dentro, la clave llega hasta el primer `:` fuera de ellas; sin llaves, es todo hasta el cierre: `{qst:A:B}` busca la clave `A:B`. |
| `{ffg:CLAVE}` | Texto oficial de FFG ya traducido (p. ej. `{ffg:INVESTIGATOR_AGATHA_CRANE}`, `{ffg:MONSTER_CULTIST}`, `{ffg:UI_TAP_TO_CONTINUE}`). Las claves seguras son las que usa Valkyrie en sus content packs (`catalogo.json` → `ffg_keys`, ~4.000); también vale cualquier otra clave de la app oficial importada, pero si no existe se verá la clave tal cual. Admite parámetros: `{ffg:CLAVE:{0}:texto}`. |
| `{val:CLAVE}` | Texto de la interfaz de Valkyrie. |
| `{c:TileX}` | Nombre oficial de la loseta (con su idioma). |
| `{c:SpawnX}` | Nombre del monstruo que salió en ese Spawn (si aún no ha salido, el nombre del componente). |
| `{c:CustomMonsterX}` | Nombre del monstruo propio. |
| `{c:QItemX}` | Nombre del objeto sorteado. |
| `{c:EventX}` | Primer investigador elegido en ese evento (por selección o `{rnd:hero}`). |
| `{rnd:hero}` | Un investigador al azar (el mismo en todo el texto; lo resalta). |
| `{var:nombre}` | Valor de una variable. |
| `{type}` | En un Spawn: nombre del monstruo. |
| `{strength}` `{agility}` `{observation}` `{lore}` `{influence}` `{will}` | Iconos de atributo. |
| `{success}` `{clue}` `{action}` | Iconos de Éxito, Pista y Acción. |
| `{MAD01}` `{MAD06}` `{MAD09}` `{MAD20}`…`{MAD23}` `{MAD25}`…`{MAD28}` | Icono de producto (no existe `{MAD24}`). |
| `<b>`, `<i>`, `<color=#RRGGBB>…</color>`, `<size=…>` | Texto enriquecido de Unity. |
| `\n` | Salto de línea. |

- Diccionarios que puede buscar un texto: `qst` (el escenario), `ffg` (la importación), `val` (Valkyrie),
  `pck` (los packs, también los de la comunidad) y `csh` (*The Cult of Sentinel Hill*, de la importación).
- Un `{c:…}` partido por un salto de línea (`\n` dentro de la marca) se ve tal cual.

## 18. Imágenes y audio

- Imágenes: PNG (transparencia) o JPG (más ligero), ≤ 1920×1080. Audio: **solo `.ogg`**.
- Rutas relativas a la carpeta del escenario (`img/carta.png`). Sin espacios en los nombres.
- Versión por idioma: misma ruta dentro de una carpeta con el nombre del idioma
  (`English/img/carta.png` o `img/English/carta.png`). Si no existe, se usa la normal.
  Valkyrie (`Quest.FindLocalisedMultimediaFile`) prueba, por orden: `<escenario>/<idioma>/<ruta>`,
  `<escenario>/<carpeta>/<idioma>/<fichero>`, lo mismo con el idioma de reserva del jugador
  (Opciones) y al final `<escenario>/<ruta>`. La ruta se normaliza antes de buscarla: en el
  escenario principal, `../Sounds/x.ogg` llega a su propia carpeta `Sounds` a través de la de un
  idioma. Un fichero que solo está en las carpetas de algunos idiomas no lo ve quien juega en otro.
  El editor de Valkyrie no mira las carpetas de idioma (enseña la versión normal, o nada).
- Lo usan el `customImage` de losetas y fichas, el `image` de las UI, el `audio` y la `music` de los
  eventos. Los puzles de imagen y el `image`/`imageplace` de los monstruos propios se leen solo de
  la carpeta del escenario, sin carpetas de idioma.
- Audios integrados (`AudioX`) en `catalogo.md`: efectos para puertas, búsqueda, monstruos, Mitos,
  y pistas de música (`AudioAtmosphere1`…).

## 19. Escenarios encadenados y campañas

Un nombre en `eventN` que no es un evento sino la ruta de otro `quest.ini` carga ese escenario
(`StartQuestEvent`, `Quest.ChangeQuest`):

```ini
[EventIrAlSotano]
buttons=1
event1=Sotano/quest.ini
```

- La ruta es **relativa a la carpeta del `quest.ini` principal** (el primero que se cargó), también
  desde una parte interior: desde `Sotano/quest.ini` se va a `Desvan/quest.ini`, no a
  `../Desvan/quest.ini`. Se admite una `/` inicial. Si ese fichero no existe, Valkyrie lo toma por un
  evento que no existe y no cambia de escenario.
- Se limpia el tablero y la cámara y se vuelve a la fase de investigadores; se conservan los
  investigadores y solo las variables `%` y `$%` (las demás se borran).
- ⚠️ Al cambiar, `VarManager.TrimQuest` lee las dos primeras letras de cada variable: una variable de
  **un solo carácter** cierra Valkyrie.
- ⚠️ **Idiomas**: tras el cambio, Valkyrie carga el idioma del jugador, el inglés y el de reserva,
  pero no el `defaultlanguage` del escenario nuevo. Una parte solo en español sale **sin textos** para
  quien juega con Valkyrie en otro idioma: pon `Localization.English.txt` en cada parte.
- Los subescenarios llevan `hidden=True` en su `[Quest]`. Pueden compartir ficheros con rutas relativas
  en `[QuestData]` (`../comun/events.ini`, como hacen los de TLE).
- Con `randomevents=true` y varias rutas se elige una variante al azar.
- En el editor de Valkyrie, prueba y empaqueta desde el escenario principal, nunca desde una parte
  suelta de la lista (`valkyrie-app.md` §6).
- `scripts/validar.py` en la carpeta principal comprueba las partes: a cuáles se llega, sus textos en
  inglés y las variables de un carácter.

## 20. Paquete .valkyrie y manifiesto

"Crear paquete" (menú Herramientas del editor) genera en el Escritorio una carpeta con:

1. `<Id>.valkyrie`: **ZIP** con el contenido de la carpeta del escenario en la raíz (no dentro de una
   subcarpeta). Máx. 100 MB. No lo recomprimas a mano.
2. `<Id>.ini`: el `[Quest]` (con `version` = SHA-256 del .valkyrie, `image` solo con el nombre de
   fichero) más `name.<Idioma>=`, `synopsys.<Idioma>=`, `description.<Idioma>=` (con `\n`),
   `authors.<Idioma>=`, `authors_short.<Idioma>=`.
3. La imagen de portada.

`scripts/empaquetar.py` reproduce exactamente este proceso. Para publicar ver `valkyrie-app.md`.

## 21. Lista de comprobación de errores típicos

Valkyrie se cierra o el escenario no carga:
- **Búsqueda sin cerrar** (`{qst:…` sin su `}`) en un texto: el evento se queda a medias al enseñarlo.
- **Variable de un carácter** en un escenario que cambia a otro `quest.ini`.
- [ ] Componente duplicado entre ficheros; `add=` con nombre inexistente; Tile sin `side`.
- [ ] Fichero de `[QuestData]` que no existe o con otras mayúsculas.
- [ ] Línea con solo espacios en un `.ini`; `VarOperation` sin 3 partes.
- [ ] `format` > 21 o < 4; `type` distinto de `MoM`.

Se carga pero falla en partida:
- [ ] Evento silencioso con `event1` y sin `buttons=1` (la cadena se corta).
- [ ] Esperar que `event1=A B` ejecute A y B (solo ejecuta uno).
- [ ] Varios `EventStart` (orden imprevisible).
- [ ] UI que no se quita (bloquea el fin de fase) o diálogos demasiado largos (tapan los botones).
- [ ] Etiquetas de botón sin texto (se ve la clave).
- [ ] Ficha con `vartests` creyendo que la oculta (se ignoran).
- [ ] `tokenSize` en vez de `tokensize`; color de botón no válido.
- [ ] Monstruo de una expansión no declarada en `packs` sin alternativa del base.
- [ ] CustomMonster sin `base` ni rasgo de categoría (sin opciones de ataque); `activation=` que no
      empieza por `Event`.
- [ ] Ficheros de localización con finales de línea mezclados; comillas sin cerrar.
- [ ] Sin evento de derrota con `trigger=Eliminated` ni límite de tiempo.

Ejecuta `python scripts/validar.py <carpeta>`: comprueba todo lo anterior (la falta de derrota por
tiempo sale como sugerencia, porque algunos escenarios no la quieren) y más: sorteos de objetos que
chocan, fichas de Exploración fuera de las puertas, más monstruos de un tipo que figuras en la caja…
