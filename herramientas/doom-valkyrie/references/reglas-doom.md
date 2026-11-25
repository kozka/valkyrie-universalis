# Reglas de DOOM: El juego de tablero (2016) y su adaptación a Valkyrie (pack DooM)

Referencia de las reglas del juego de mesa *DOOM: The Board Game* (Fantasy Flight Games, 2016; en español
*DOOM: El juego de tablero*, Edge Entertainment, 2017) y de cómo lo convierte en un escenario de Valkyrie el
pack de la comunidad **DooM** (Neuntoter) y las 11 misiones de la tienda que lo usan. Está **parafraseada**:
no copia frases de los reglamentos, de las cartas, del pack ni de las misiones. DOOM es marca de id Software
y Bethesda (ZeniMax); aquí solo hay cifras, nombres e identificadores.

Sirve para diseñar y revisar misiones DooM en el modo Descent de Valkyrie, donde la app hace de invasor y los
jugadores llevan a los marines en cooperativo. Lo más importante para eso está en §10 (qué trae el pack, cómo
lo trata el motor de Valkyrie y qué reglas cambian) y §11 (las misiones publicadas).

- Formato de ficheros de Valkyrie: `formato-escenario.md` de la skill descent-valkyrie (DooM es contenido de
  Descent para Valkyrie). Cómo montar cada mecánica de DooM con eventos: `patrones-doom.md`.
- Reglas de Descent y de Road to Legend, por si una misión mezcla contenido: `reglas-descent.md` de la skill
  descent-valkyrie.

## Índice

- [0. Chuleta rápida](#0-chuleta-rápida)
- [1. Visión general del juego de mesa](#1-visión-general-del-juego-de-mesa)
- [2. Componentes](#2-componentes)
- [3. Preparación y estructura de la ronda](#3-preparación-y-estructura-de-la-ronda)
- [4. Acciones de los marines](#4-acciones-de-los-marines)
- [5. Combate](#5-combate)
- [6. Los demonios](#6-los-demonios)
- [7. Marines muertos, reaparición y frags](#7-marines-muertos-reaparición-y-frags)
- [8. Misiones y operaciones](#8-misiones-y-operaciones)
- [9. Glosario español ↔ inglés](#9-glosario-español--inglés)
- [10. La adaptación a Valkyrie (pack DooM)](#10-la-adaptación-a-valkyrie-pack-doom)
- [11. Las 11 misiones de la tienda](#11-las-11-misiones-de-la-tienda)
- [Fuentes](#fuentes)

## Códigos de fuente

Cada afirmación lleva el código de su fuente. Las URL están en «Fuentes», al final.

| Código | Fuente |
|---|---|
| [LTP] | *Learn to Play* oficial (FFG, inglés, 16 páginas), leído en una copia en línea. Es la única fuente oficial que se pudo leer entera. |
| [RR] | *Rules Reference* oficial (FFG, inglés, 24 páginas). **No se encontró el PDF**: se cita a través de [EOG] y de hilos de [BGG] que lo citan con número de página. |
| [OM] | *Operation Guide* oficial (la «Guía de operaciones», 16 páginas, con las 12 misiones). Tampoco se pudo leer: se cita a través de [BGG], [MOD] y reseñas. |
| [FAQ] | No se conoce FAQ ni fe de erratas oficial de esta edición (ver «Consultadas sin resultado útil»). |
| [FFG] | Artículos de presentación de FFG de 2016, leídos en el espejo `drafts.fantasyflightgames.com`. |
| [EOG] | Resumen de reglas de The Esoteric Order of Gamers (v1, agosto de 2017), hecho sobre la *Rules Reference*. |
| [ES] | Edición española de Edge: textos de la caja reproducidos por tiendas españolas. Solo para terminología. |
| [BGG] | BoardGameGeek: ficha del juego, ficheros e hilos, leídos con la API de geekdo. **No son oficiales** salvo que se indique. |
| [RES] | Reseñas y resúmenes (RPGnet, Geeks Under Grace, PC Gamer, NAG, Tematicoops, La BSK, Doom Wiki). |
| [MOD] | El pack DooM y las 11 misiones de la tienda (ficheros `.ini` y `Localization.*.txt`). Los términos españoles de sus textos son de Vidimus, el traductor: **no son oficiales**. |
| [TIENDA] | Fichas de la tienda de Valkyrie: `valkyrie-store/D2E/manifestDownload.ini` y `contentPacksManifestDownload.ini`. |
| [VAL] | Código C# de Valkyrie en el commit fijado en el proyecto (`752d420`, 20 de junio de 2026). |

- **(sin verificar)**: el dato no pudo confirmarse en una fuente fiable.
- **(?)**: traducción española que no se ha podido confirmar como la oficial de Edge.
- **(deducción)**: conclusión propia a partir de otros datos, explicada en el texto.

---

## 0. Chuleta rápida

### 0.1 El juego de mesa

Resumen de §1-§8, con las fuentes de cada dato; lo que viene de reseñas [RES] o de BoardGameGeek [BGG] no es
oficial, y el detalle y las dudas están en su sección.

- **Formato.** Un jugador es el **invasor** (los demonios) y de 1 a 4 juegan con **marines** en
  cooperativo. Partidas de 2 a 3 horas. Hay 12 misiones en 2 operaciones de 6; la operación la gana el bando
  que gane 4 misiones [FFG][EOG].
- **Ronda.** Primero la **fase de estado**: se arma el mazo de iniciativa (una carta por marine y una del
  invasor por cada tipo de demonio en el mapa), se preparan las cartas de demonio, el invasor roba cartas de
  evento hasta tener 6 y puede descartar hasta 3 para ganar 1 Argent por carta. Después, la **fase de
  activación**: se revelan las cartas de iniciativa de una en una [LTP][EOG].
- **Turno de un marine.** Una acción principal y las adicionales que quiera. Cada carta de acción jugada da
  tantos puntos de movimiento como su velocidad y, si tiene recuadro de ataque, un ataque. Esprintar es
  descartar 1 carta para ganar 6 puntos de movimiento. Al acabar, roba hasta tener 3 cartas [LTP].
- **Ataque.** El alcance cuenta la casilla del defensor y la línea de visión se traza desde una esquina. Se
  tiran los dados del recuadro: el rojo tiene caras con 0, 1, 1, 1, 2 y 2 iconos de daño, y el negro 1, 1, 2,
  2, 2 y 3 [RES]. El defensor revela una carta: el marine, la primera de su mazo de acción; el demonio, la
  primera del mazo de eventos del invasor. Cada escudo anula 1 de daño y la esquiva lo anula todo [LTP].
- **Ejecución (*Glory Kill*).** Un demonio con tanto daño como su valor de tambaleo (*stagger*) queda
  tambaleante. Si un marine entra en su casilla, lo mata en el acto, roba una carta de Ejecución y recupera 2 de
  daño [LTP][EOG].
- **Frag.** Un marine con tanto daño como su vida (10) cae: el invasor gana una ficha de frag. Reaparece al
  empezar su siguiente activación en un teletransportador activo. Si en él hay un demonio, lo **telefragea**
  [LTP]. El invasor suele ganar con 6 frags; en el tutorial, con 4, 3 o 2 según haya 1-2, 3 o 4 marines
  [FFG][LTP].
- **Portales.** Hay tres niveles: azul, amarillo y rojo. Cada portal invoca uno de los dos grupos de su color
  que trae la carta de Invasión. La carta de Amenaza (Infestación, Horda o Asalto) dice cómo y cuándo se abren
  [FFG].

### 0.2 En Valkyrie (pack DooM)

- **Modo Descent.** El pack convierte DOOM en contenido de Descent 2ª edición: los marines son héroes
  (Alpha a Delta, arquetipo `DooM`) y los demonios, monstruos con cartas de activación de texto. La app hace de
  invasor y se juega en cooperativo con los componentes físicos de DOOM [MOD][BGG].
- **Activaciones.** Lo habitual (el «modo Valkyrie») es alternar: cada vez que un marine pulsa *Fin del Turno*,
  la app activa al azar un grupo de demonios que aún no haya actuado. El «modo normal» usa el mazo de
  iniciativa físico y la opción *Forzar Activación* del retrato del demonio [MOD][VAL].
- **Cartas de evento.** Solo sirven para la defensa de los demonios; su texto se ignora. Cada misión dice con
  qué 2 o 3 mazos se forma [MOD].
- **Argent.** En la plantilla común, la app reparte 3 Argent al empezar cada ronda entre los tipos de demonio
  en juego, más lo que den algunas invocaciones. En *La caída de Fobos* se tira un dado por cada grupo nuevo
  [MOD].
- **Frags.** Se marca cada muerte con *KO* en el retrato del marine, que resta 1 a `$%morale`; cuando baja de 0
  salta el disparador `NoMorale` y la misión acaba en derrota. Por tanto, `$%morale` = frags permitidos − 1
  [VAL][MOD].
- **Portales.** Son fichas `Token_DM_<Color>_Portal_A` (activo) o `_I` (inactivo). En Infestación se pulsan
  cuando un marine ve el portal, y la app elige al azar el grupo de la izquierda o el de la derecha de la carta
  de Invasión [MOD].
- **«Cartas de Amenaza» de las misiones.** No son las cartas de Amenaza oficiales: son 12 efectos de ronda
  opcionales sacados del modo Horda de un aficionado (Mark Thomas, BGG) [MOD][BGG].

---

## 1. Visión general del juego de mesa

- **Ficha.** *DOOM: The Board Game*, de Jonathan Ying, desarrollado por Derrick Fuchs y Andrew Wyshock;
  publicado por Fantasy Flight Games. Se anunció el 28 de julio de 2016 y salió a finales de 2016. Es para 2 a
  5 jugadores, de 120 a 180 minutos y a partir de 14 años. En BGG es el juego 205317 [BGG][FFG][RES].
- **Edición española.** *DOOM: El juego de tablero*, de Edge Entertainment, se anunció para el primer trimestre
  de 2017 a 79,95 €, con la referencia FFZX01 y el EAN 8435407613850 [ES][RES].
- **Base.** Adapta el videojuego *DOOM* de 2016 (id Software y Bethesda): Marte, la UAC, la energía Argent y
  los demonios del Infierno [FFG].
- **No confundir.** *DOOM: The Boardgame* (FFG, 2004, de Kevin Wilson) se basaba en *Doom 3* y tenía munición,
  armadura y dados de alcance. En España lo publicó Devir. La edición de 2016 es un juego distinto: más rápido y
  sin munición, porque se ataca con las cartas del mazo de acción [RES].
- **Papeles.** El invasor controla a los demonios y gana acumulando frags (marines muertos). Los marines
  cooperan para cumplir el objetivo de la misión, que puede ser rescatar algo, escoltar, activar terminales o
  limpiar el mapa [FFG].
- **Operaciones.** La *Operation Guide* trae dos operaciones de 6 misiones: *Black Bishop* y *Exodus*. Se puede
  jugar una misión suelta o una operación entera, que gana el primer bando que se lleve 4 misiones. Si ninguno
  llega a 4, gana quien gane la última [EOG][RES].
- **Expansiones.** No se publicó ninguna expansión oficial [BGG][RES]. Sí hay mucho contenido de aficionados en
  BGG: el modo Horda cooperativo (en el que se basan las misiones de Valkyrie), las ediciones *Hurt Me Plenty* y
  *Ultra-Violence* de las reglas, mapas propios como los de Cypher0117, un modo Arena e impresos con material
  de *Doom Eternal* y *The Dark Ages* [BGG].
- **Reglamentos.** La caja trae el *Learn to Play* (aprender a jugar), la *Rules Reference* (referencia de
  reglas) y la *Operation Guide* (guía de operaciones) [LTP][ES]. FFG los ofrecía para descargar, pero su web
  actual ya no los tiene (sin verificar).

---

## 2. Componentes

### 2.1 Contenido de la caja [LTP][ES]

| Componente (inglés) | Nombre en la caja española [ES] | Cantidad |
|---|---|---|
| Plastic figures | Miniaturas de plástico | 37: 4 marines y 33 demonios |
| Dice | Dados | 6: 4 rojos y 2 negros |
| Double-sided map tiles | Piezas de tablero | 24, de doble cara |
| Door tokens + plastic stands | (puertas) con soportes de plástico | 8 + 8 |
| Demon cards | Cartas de Demonio | 8 |
| Event cards | Cartas de Evento | 36 (6 mazos de 6) |
| Action cards | Cartas de Acción | 73 |
| Invasion cards | Cartas de Invasión | 12 |
| Threat cards | Cartas de Amenaza | 3 |
| Initiative cards | Cartas de Iniciativa | 10: 4 de marine y 6 del invasor |
| Marine cards | Cartas de Marine | 4 |
| Objective cards | Cartas de Objetivo | 6 |
| Class cards | Cartas de Clase | 24 |
| Glory Kill cards | Cartas de Ejecución | 12 |
| Squad cards | Cartas de Pelotón | 4 |
| Stun cards | Cartas de Aturdimiento | 4 |
| Damage tokens | Fichas de daño (?) | 55: 35 de valor 1 y 20 de valor 3 |
| Health Pack tokens | Botiquines (?) | 9 |
| Teleporter tokens | Teletransportadores (?) | 6 |
| Stun tokens | Fichas de aturdimiento (?) | 7 |
| Progress / Threat tokens (doble cara) | Fichas de Progreso / Amenaza (?) | 16 |
| Portal tokens (doble cara) | Fichas de Portal (?) | 18 |
| Argent Power tokens | Fichas de Argent (?) | 18 |
| Frag tokens | Fichas de frag (?) | 21 |
| Weapon tokens | Fichas de Arma (?) | 23, de ellas 6 granadas |
| Objective tokens | Fichas de Objetivo (?) | 6 |
| Libros | 2 reglamentos y 1 guía de operaciones | 3 |

- La caja española suma «187 fichas variadas». Una tienda indica que las cartas necesitan 44 fundas de 41×63 mm
  y 152 de 57×89 mm [ES].
- Los componentes están limitados a lo que trae la caja: figuras, cartas, fichas de arma y de Argent. Si no
  quedan figuras de un tipo, no se puede invocar ese demonio [EOG][BGG]. Un comentarista de BGG añade que
  tampoco se pueden tirar más dados que los 6 de la caja (sin verificar).

### 2.2 Marines, clases y pelotones

- **Cartas de marine.** Hay cuatro: **Alpha, Bravo, Charlie y Delta**. Todos tienen la misma vida (10) y la
  misma acción de esprintar; se distinguen por la clase y las armas. Cada carta tiene un hueco para la carta de
  clase y el registro de daño [LTP][FFG].
- **Clases.** Hay 24 cartas de clase en 6 **equipos de intervención** (*fireteams*) de 4. Cada equipo tiene un
  combatiente de primera línea, un tirador a distancia, un explorador muy móvil y un especialista en armas
  pesadas [FFG].
  - Al empezar cada misión se reparten 2 al azar a cada marine, que se queda con una; también se puede elegir un
    equipo entero [EOG][FFG].
  - La clase da una habilidad que suele agotarse y prepararse al empezar la activación del marine [LTP].
  - Nombres conocidos: Commando (la de Alpha en el tutorial) [LTP]; Vanguard (la de Delta) y Close Combat
    Specialist [BGG]; Tactician y Shocktrooper [FFG]; Ranger, Requisitions Officer, Utilitarian y Combat
    Engineer, que forman el equipo Tomahawk [FFG]; Medic, Saboteur, Sentinel y Squad Leader [RES]. El resto
    no se ha podido reunir.
  - Ejemplos de efectos [FFG][BGG][RES]: el Tactician mira las 2 primeras cartas de iniciativa y puede poner
    una al fondo; el Shocktrooper coloca su carta de iniciativa la primera en cada ronda; el Ranger gana
    movimiento extra; el Squad Leader cede movimiento a otro marine descartando cartas; el Medic cura.
- **Pelotones** (*Squad cards*). Compensan que haya menos de 4 marines [EOG][LTP]:
  - Con 3 marines, uno de ellos recibe *Taking Point*.
  - Con 2 marines, ambos reciben *Combat Veteran*.
  - Con 1 marine, recibe *Solo Operative*, que añade una segunda carta de iniciativa de marine (dos
    activaciones por ronda). Según un hilo de BGG, además le da +5 de vida (15 en total) y le deja hacer 2
    acciones principales por activación [BGG].
  - Los efectos de *Taking Point* y *Combat Veteran* no se han podido confirmar (sin verificar).

### 2.3 Cartas de acción y armas

- **Mazo de acción.** Cada marine juega con su propio mazo. El inicial tiene 10 cartas: el juego de 4 cartas
  **UAC Marine** y dos juegos de arma inicial de 3 cartas cada uno. Se roba una mano de 3 [LTP]. El juego UAC
  incluye la carta *UAC Combat Armor* (1/4) [LTP]; según el anuncio de FFG, son una armadura y tres de pistola
  [FFG].
- **Partes de una carta de acción** [LTP][FFG]:
  - Su **velocidad**: los puntos de movimiento que da al jugarla.
  - El **recuadro de ataque**, si lo tiene: alcance máximo y dados.
  - Sus habilidades.
  - Los iconos de **defensa**, en la esquina superior derecha, que se usan cuando la carta se revela al
    defender.
  - El icono, el color y el número del juego al que pertenece (por ejemplo, 1/3).
  - El **tipo**: principal, adicional (*bonus*) o reacción. Las de reacción se pueden jugar fuera de la
    propia activación.
- **Armas** (14 tipos de ficha) [RES][BGG]:

| Arma (inglés) | Nombre en el pack y las misiones [MOD] | Tipo | Notas |
|---|---|---|---|
| Combat Shotgun | Escopeta de combate | Inicial | Permite moverse entre disparos y defiende bien [BGG]. Es el arma inicial de casi todas las misiones de Valkyrie [MOD]. |
| Super Shotgun | Super escopeta | Inicial | Mucho daño y poco alcance; *Up Close and Personal* tiene velocidad 4 y *Double Barrel Blast* no da movimiento [BGG]. |
| Heavy Assault Rifle | Fusil de asalto pesado | Inicial | Ataques fuertes, poco movimiento [BGG]. |
| Plasma Rifle | Fusil de plasma (en el pack, «Plasma Rifle» sin traducir) | Inicial | Aturde (*Stun Bomb*) [BGG]. |
| Burst Rifle | Fusil de ráfagas | Inicial | *Three-Round Burst*: 3 dados rojos y alcance 6; *Magnum Shot* es el único ataque de reacción de los marines [BGG]. |
| Static Rifle | Fusil de estática | Inicial | Se carga con *Charge* y se descarga con *Discharge*; con las tres cartas da 8 puntos de movimiento [BGG]. |
| Chainsaw | Motosierra | De recogida | Reduce el tambaleo del demonio para ejecutarlo [BGG]. |
| Chaingun | Ametralladora gatling | De recogida | Un hilo de BGG la llama *Minigun* [BGG]. |
| Rocket Launcher | Lanzamisiles | De recogida | *Rocket Salvo* (1/3): alcance 6 y velocidad 4; después del ataque se tira 1 dado negro y cada figura adyacente al defensor sufre tanto daño como iconos salgan [LTP]. |
| Gauss Cannon | Cañón Gauss | De recogida | *Precision Bolt* [BGG]. |
| BFG 9000 | BFG 9000 | De recogida | — |
| Frag Grenade | Granada de fragmentación | Granada | Juego de una sola carta. |
| Siphon Grenade | Granada de absorción [MOD] (?) | Granada | Juego de una sola carta. |
| Decoy Grenade | — | Granada | Juego de una sola carta (nombre según [RES]; sin verificar). |

- Las fichas de las armas iniciales no llevan la franja que tienen las demás. Cada marine elige 2 armas
  iniciales distintas y no puede tener dos juegos de la misma arma ni dos granadas iguales [EOG][BGG].
- **Reparto de fichas y cartas (deducción).** La plantilla de Valkyrie pone 2 fichas de cada arma inicial y 1
  de cada arma de recogida [MOD]. Eso da 6 × 2 + 5 = 17 fichas, más 6 granadas: las 23 de la caja. Si cada arma
  inicial tiene dos juegos de 3 cartas, salen 16 cartas UAC (4 × 4) + 36 de armas iniciales + 15 de armas de
  recogida + 6 de granadas = **73**, el total de cartas de acción de la caja.

### 2.4 Cartas del invasor

- **Cartas de demonio (8).** Hay una por tipo de demonio. Cada una indica velocidad, alcance y dados de ataque,
  valores de defensa, vida, tambaleo (debajo de la vida) y habilidades, algunas de pago con Argent [FFG][LTP].
  Detalle en §6.4.
- **Cartas de Invasión (12).** Cada una trae **6 grupos de invasión**, dos por color de portal (azul, amarillo
  y rojo). Algunos grupos dan Argent al invocarse; por ejemplo, *Imp Assault* da 2 [FFG][LTP]. Según la
  carta, el invasor puede tener desde 7 hasta casi 20 demonios disponibles [RES]. Son secretas para los
  marines [FFG].
  - Nombres conocidos: *First Strike* (tutorial) [LTP], *Imp Assault*, *Cruel Mayhem* [BGG], *Deadly Force*
    [FFG] y *Hellfire Blast* [FFG].
  - Vidimus usa además «La Fuerza de los Malditos» (nombre inglés sin verificar) [MOD].
- **Cartas de evento (36).** Forman 6 mazos de 6 cartas. El invasor elige 3 mazos para formar su mazo de 18
  [EOG]. Sirven para tres cosas [FFG][LTP]:
  - Sus efectos, que se juegan en el momento indicado.
  - La defensa de los demonios: se revela la primera del mazo.
  - Ganar Argent descartándolas.

  Composición según una guía de estrategia de BGG [BGG]:

| Mazo (inglés) | Nombre en las misiones [MOD] (?) | Cartas |
|---|---|---|
| Armored Offensive | Ofensiva blindada | Demonic Resilience ×2, Iron Skin ×1, Unbreakable ×2, Unstoppable ×1 |
| Blood Rush | Subidón sangriento | Ambush ×2, Darkness ×2, Demonic Speed ×2 |
| Infernal Sorcery | Hechicería infernal | Dark Pact ×1, Death Curse ×1, Devious Schemes ×2, Soul Harvest ×2 |
| Power Overwhelming | Poder abrumador | Hellish Power ×3, Explosive Blast ×2, Onslaught ×1 |
| Savage Strength | Fuerza salvaje | Demonic Strength ×3, Execution ×1, Ferocity ×2 |
| Seek and Destroy | Buscar y destruir | Crippling Strike ×2, Demonic Precision ×3, Paranoia ×1 |

  - Algunos efectos, según esa guía: *Ambush* reordena las 3 primeras cartas de iniciativa [FFG]; *Darkness*
    acorta el alcance de los marines; *Soul Harvest* da 2 Argent cuando muere algo; *Execution* mata a un
    marine con 8 o más de daño; *Onslaught* da un ataque extra contra otro marine [BGG].
- **Cartas de Amenaza (3).** Son Infestación, Horda y Asalto, y cambian cómo se abren los portales (§8.2) [FFG].
- **Cartas de objetivo (6).** Fijan qué tiene que hacer cada bando en la misión. Nombres conocidos:
  - *Asset Extraction*: los marines recogen 4 fichas de Progreso, que representan empleados de la UAC
    supervivientes [FFG].
  - *Sample Collection* («Obtención de muestras» (?)) [MOD].
  - *Containment Protocol* («Protocolo de contención» (?)) [MOD].
  - *Priority Escort* («Escolta prioritaria» (?)) [MOD][BGG].
  - Vidimus usa además «Eliminar hostiles» (nombre inglés sin verificar) [MOD].
- **Iniciativa (10).** Hay 4 cartas de marine y 6 del invasor. Las del invasor no llevan demonio: al revelarse,
  el invasor elige qué tipo activa [LTP][FFG].
- **Cartas de Ejecución (12).** Al ejecutar a un demonio se roba una. Todas hacen recuperar 2 de daño y dan una
  ventaja, como repetir tiradas, robar cartas de acción o moverse gratis. Se conservan aunque el marine muera y
  se descartan al acabar la misión [LTP][EOG][RES].

### 2.5 Dados

- Hay 4 dados rojos y 2 negros, de 6 caras. Sus caras solo tienen iconos de daño, hasta 3 por cara: el alcance
  no sale de los dados, sino del recuadro de ataque [LTP].
- Las caras, según la reseña de RPGnet [RES] (las de La BSK dicen lo mismo: de 0 a 2 y de 1 a 3):

| Dado | Caras (iconos de daño) | Media | Probabilidades útiles (cálculo propio) |
|---|---|---|---|
| Rojo | 0, 1, 1, 1, 2, 2 | 1,17 | Al menos 1: 5/6. Exactamente 2: 1/3. Cara vacía: 1/6. |
| Negro | 1, 1, 2, 2, 2, 3 | 1,83 | Al menos 2: 2/3. Exactamente 3: 1/6. |

- Esto sirve para las pruebas que piden algunas misiones de Valkyrie. Por ejemplo, superar una prueba si sale
  un 2 en un dado rojo pasa 1 de cada 3 veces, y que salga una cara vacía, 1 de cada 6 [MOD].

### 2.6 Piezas de tablero, terreno y fichas

- **Piezas.** Hay 24, de doble cara. Se nombran con un número y una letra de cara (por ejemplo, 05a o 15a)
  [LTP]. El pack de Valkyrie trae 16 números con sus dos caras (§10.2.6) [MOD].
  - Las misiones de Valkyrie usan como máximo 6 copias de la pieza 15, 2 de la 10, 2 de la 12, 2 de la 13 y 1 de
    cada una de las demás. Eso suma exactamente 24 (deducción).
  - Las caras B salen en los exteriores de Fobos y en el Infierno de las misiones de la comunidad [MOD].
- **Bordes y terreno** [EOG][LTP]:

| Borde | Movimiento | Línea de visión | Cobertura |
|---|---|---|---|
| Pared (línea negra gruesa; también el borde de cada pieza) | No se cruza | Bloquea | — |
| Terreno difícil (borde azul punteado) | +1 punto para entrar | No bloquea | Da cobertura |
| Terreno bloqueante (borde rojo continuo) | No se entra | Bloquea | Da cobertura |
| Terreno infranqueable (borde rojo punteado) | No se entra | No bloquea | No da cobertura |
| Puerta cerrada | Actúa como pared | Bloquea | — |

- Las figuras grandes y los demonios voladores tienen excepciones (§5.6 y §6.4) [EOG].
- **Fichas** [LTP][EOG][FFG]:
  - **Portales.** De doble cara (boca arriba y boca abajo), en tres colores: azul, amarillo y rojo. Se apilan:
    al usarse uno, queda disponible el siguiente de la pila.
  - **Teletransportadores.** Activos o inactivos.
  - **Progreso / Amenaza.** De doble cara: el lado de Progreso es azul y el de Amenaza, rojo con una mano
    [MOD].
  - Además: objetivos, botiquines, armas, daño (valores 1 y 3), aturdimiento, Argent y frags.

---

## 3. Preparación y estructura de la ronda

### 3.1 Preparación de una misión [EOG][LTP]

1. Se monta el mapa con las piezas y fichas que indica la misión en la *Operation Guide*.
2. Se leen en voz alta las cartas de **objetivo** y de **amenaza** de la misión y se dejan a la vista. Las demás
   vuelven a la caja.
3. Cada marine toma su carta de marine, su figura y el juego UAC de 4 cartas.
4. Se reparten 2 cartas de clase a cada marine, que se queda con una.
5. Con menos de 4 marines se reparten los pelotones (§2.2).
6. Cada marine elige 2 armas iniciales distintas, toma sus juegos de 3 cartas y forma un mazo de 10. Lo baraja
   y roba 3.
7. El invasor baraja las cartas de Invasión, roba 2 y se queda una en secreto. Toma boca abajo las cartas de los
   demonios que aparecen en ella. En las misiones de la *Operation Guide*, la carta de Invasión y los mazos de
   evento parecen venir fijados por la misión (sin verificar) [BGG][MOD].
8. El invasor elige 3 mazos de evento (18 cartas) y los baraja.
9. Se baraja el mazo de Ejecución y se dejan a mano el resto de fichas, los dados, los aturdimientos y las cartas
   de iniciativa.
10. Los marines deciden el orden de despliegue. Cada uno pone su figura en un teletransportador activo o al lado.

- **Misión suelta al azar.** Se roba una carta de objetivo y se lanza una moneda para decidir la operación
  [EOG].
- **Operación a medida.** El invasor elige la primera misión de las 12. Después, el que pierde cada misión
  elige la siguiente, sin repetir ninguna [EOG].

### 3.2 Fase de estado [LTP][EOG]

1. **Mazo de iniciativa.** Lleva una carta por marine y una del invasor por cada tipo de demonio que tenga al
   menos una figura en el mapa. Con *Solo Operative* se añade una segunda carta de marine. Se baraja boca abajo.
   - En el tutorial, las cartas de los tipos que entran a mitad de ronda se añaden en la siguiente fase de estado;
     la carta de Infestación, en cambio, pide añadirlas en cuanto acaba la activación que los invocó. Así lo leen
     los jugadores de BGG [BGG].
2. **Preparar.** El invasor endereza las cartas de demonio agotadas.
3. **Eventos.** El invasor roba cartas de evento hasta tener 6 en la mano.
4. **Argent.** El invasor puede descartar hasta 3 cartas de evento y ganar 1 Argent por cada una. Las pone en la
   carta de Invasión o en cartas de demonio boca arriba (§6.2).
5. Según la carta de Amenaza, en esta fase se abren o invocan portales (§8.2) [FFG].

### 3.3 Fase de activación [LTP][EOG]

- Se revela la primera carta de iniciativa:
  - Si es de un **marine**, ese marine hace su activación (§4).
  - Si es del **invasor**, el invasor elige una carta de demonio preparada, la agota y activa una a una todas
    las figuras de ese tipo (§6.1). Ese tipo no vuelve a activarse hasta que la carta se prepare.
- Se descarta la carta y se repite hasta agotar el mazo.
- Algunas cartas cambian el orden: el evento *Ambush* reordena las 3 primeras, el Tactician puede mandar una al
  fondo y el Shocktrooper juega siempre el primero [FFG].

---

## 4. Acciones de los marines

### 4.1 La activación [LTP][EOG]

1. Si el marine murió y está fuera del mapa, **reaparece** en el teletransportador activo que elija (§7).
2. Endereza su carta de clase si estaba agotada.
3. Hace **1 acción principal** y **cualquier número de acciones adicionales**, en el orden que quiera; puede
   hacer solo adicionales. Las acciones son:
   - **Jugar una carta**: se pone boca arriba, da tantos puntos de movimiento como su velocidad y, si tiene
     recuadro de ataque, permite ese ataque. Cada carta se resuelve entera antes de jugar otra.
   - **Esprintar**: en lugar de jugar una carta principal, descarta 1 carta de la mano y gana 6 puntos de
     movimiento. Es una acción principal.
   - Habilidades de la clase y de otras cartas.
4. **Final.** Descarta las cartas jugadas y roba hasta tener 3 en la mano (la mano habitual).

- Las cartas de **reacción** se juegan fuera de la propia activación, interrumpiendo el juego [LTP].
- Los puntos de movimiento que el marine no gaste al acabar su activación se pierden [LTP].
- **No hay munición**: un arma solo se usa cuando el marine tiene en la mano una de sus cartas, así que el mazo de
  acción hace de cargador [RES][LTP].

### 4.2 Movimiento y puertas [LTP][EOG]

- **Adyacencia.** Dos casillas son adyacentes si comparten lado o esquina, así que se mueve en diagonal.
  - No lo son si las separa una pared o un borde bloqueante o infranqueable.
  - No se puede pasar en diagonal entre casillas que solo se tocan por una esquina, salvo que otra casilla que
    comparta esa esquina sea adyacente a las dos.
- **Coste.** Cada paso cuesta 1 punto de movimiento. Entrar en terreno difícil cuesta 1 más, y entrar en una
  casilla con una figura enemiga, otro más.
  - Se puede atravesar a las figuras amigas sin coste extra. Los marines son amigos entre sí, y los demonios
    también.
  - Una figura pequeña no puede acabar su movimiento en una casilla ocupada.
- **Cuándo.** Los puntos de movimiento se gastan en cualquier momento de la activación salvo en mitad de un
  ataque. Los que se ganan fuera de la propia activación se gastan en el acto o se pierden.
- **Puertas.** Una figura adyacente a una puerta cerrada gasta 1 punto para abrirla. La puerta se quita del mapa
  y no se puede volver a cerrar. Una casilla cuyo borde es la puerta cuenta como adyacente a ella.
  - En el tutorial y con la carta de Infestación, los demonios no abren puertas. En las demás misiones sí
    pueden [LTP][BGG].

### 4.3 Recoger objetos y armas [EOG][LTP]

- Un marine que está en la casilla de un objeto lo recoge sin gastar movimiento, salvo en mitad de un ataque.
- **Botiquín** (*Health Pack*): se quita y el marine recupera 5 de daño.
- **Ficha de arma**: el marine la pone en su zona de juego, baraja el juego de cartas de esa arma y lo pone boca
  abajo **encima** de su mazo de acción, así que las roba enseguida.
- **Granadas**: cada una es un juego de una sola carta. La ficha queda boca arriba en la zona del marine. Al
  usarla, la ficha se pone boca abajo en el mapa donde diga la carta, y al recuperarla vuelve boca arriba.
- **Fichas de objetivo**: si muere la figura que lleva una, la ficha cae en su casilla. Si la casilla es de
  terreno bloqueante o infranqueable, cae en la más cercana válida.

### 4.4 Teletransportadores y *telefrag* [LTP][EOG]

- Un teletransportador inactivo se activa cuando un marine entra en su casilla, y se le da la vuelta.
- Para el movimiento de los marines, todos los teletransportadores activos son adyacentes entre sí. Por tanto,
  pasar de uno a otro cuesta lo que un paso normal, 1 punto de movimiento (deducción).
- **Telefrag.** Si un demonio está en un teletransportador activo y un marine reaparece en él o llega desde otro
  teletransportador activo, el demonio muere. El marine no paga el punto extra por entrar en una casilla
  enemiga.
  - Si el demonio estaba tambaleante, cuenta como ejecución [EOG].
  - Si el teletransportador lo ocupa otro marine, el que reaparece va a la casilla libre más cercana [EOG].
- Solo los marines teletransportan y telefraguean (deducción: las reglas solo hablan de marines).

### 4.5 Ejecución (*Glory Kill*) [LTP][EOG][FFG]

- Cada carta de demonio tiene, debajo de la vida, un **valor de tambaleo** (*stagger*). Cuando el daño de un
  demonio iguala o supera ese valor, queda **tambaleante** (*staggered*).
- Si un marine entra en la casilla de un demonio tambaleante, pagando el punto extra de casilla enemiga (2
  puntos en total), lo mata en el acto. Eso es una **ejecución**.
- El marine roba la primera carta de Ejecución, recupera 2 de daño y puede usar la habilidad de la carta. Después
  puede gastar los puntos de movimiento que le queden. Puede acumular cualquier número de cartas de Ejecución.
- **Reducir el tambaleo.** Los efectos que lo reducen se suman, salvo los que reducen el valor impreso: de esos
  solo vale el mayor. Por ejemplo, dos cartas de Motosierra no se suman [EOG][BGG].
  - Según un diseñador de FFG en BGG, el tambaleo puede bajar a 0, y entonces se ejecuta a un demonio sin
    dañarlo; otros jugadores leen que hace falta al menos 1 de daño (dictamen informal) [BGG].
- Solo se ejecuta a demonios: los marines no tienen valor de tambaleo [LTP][RES].
- Los marines solo se curan con ejecuciones, botiquines y alguna clase (dictamen informal) [BGG].

---

## 5. Combate

### 5.1 Alcance y línea de visión [LTP][EOG]

- **Alcance**: número de casillas desde el atacante hasta el defensor, **contando la del defensor**. El máximo lo
  da el recuadro de ataque.
- **Línea de visión**: se elige una esquina de la casilla del atacante y se traza una recta a cualquier esquina
  de la del defensor. La bloquean las paredes, las puertas cerradas y el terreno bloqueante; las figuras no la
  bloquean. Si no hay línea de visión, hay que elegir otro objetivo.

### 5.2 Cobertura [EOG][LTP]

- Desde la misma esquina elegida, se trazan rectas a **todas** las esquinas de la casilla del defensor. Si
  alguna cruza una pared, terreno difícil, terreno bloqueante o una casilla con otra figura, el defensor tiene
  cobertura.
- No hay cobertura si el atacante y el defensor comparten la esquina de partida.
- Las figuras grandes y las aturdidas nunca tienen cobertura.
- **Efecto**: el defensor con cobertura puede descartar la carta de defensa que reveló y revelar otra, que tiene
  que usar.

### 5.3 Secuencia de ataque [EOG][LTP]

1. **Declarar al defensor**: un enemigo a alcance y con línea de visión.
2. **Tirar los dados**: los del recuadro de la carta del marine (de acción, de clase o de Ejecución) o los de la
   carta del demonio.
3. **Revelar la defensa**:
   - El marine revela la primera carta de su mazo de acción.
   - El demonio, la primera del mazo de eventos del invasor.
   - Si el mazo está vacío, se baraja su descarte; si también lo está, no hay defensa.
4. Se aplican los efectos «al defender».
5. Se aplican los efectos «al atacar».
6. **Calcular el daño**:
   - Cada **escudo** de la carta revelada anula 1 icono de daño.
   - La **esquiva** anula todo el daño.
   - El icono de **defensa especial** activa la defensa especial del demonio, que puede dar escudos o esquiva
     (tabla de §6.4).
   - La **dureza** (*toughness*) de algunos demonios añade 1 escudo aunque no se revele carta.
   - Cada icono de daño que queda es 1 de daño.
7. Se descarta la carta revelada. El daño se marca con fichas de 1 y de 3: sobre la carta del marine, o junto a
   la figura del demonio.

### 5.4 Aturdimiento [LTP][EOG]

- Al marine aturdido se le da una carta de Aturdimiento; al demonio, una ficha.
- Una figura aturdida no revela carta al defender y no tiene cobertura.
- Antes de tirar al atacar, quita 1 dado.
- El aturdimiento termina después de que la figura ataque o sea atacada. No se acumula.

### 5.5 Muerte por daño [LTP]

- Una figura cuyo daño iguala o supera su vida muere (*fragged*) y se retira. Para los marines, ver §7.
- Cuando muere el último demonio de un tipo, su carta se pone boca abajo y su Argent vuelve a la reserva [EOG].

### 5.6 Figuras grandes [EOG][LTP]

- Ocupan varias casillas y no se mueven en diagonal. Al moverse, cada parte tiene que quedar adyacente a la casilla
  que ocupaba antes.
- Las que ocupan 2 o 6 casillas pueden girar 90° por 1 punto, conservando al menos la mitad de sus casillas.
- Ignoran el terreno al moverse y al ser invocadas, y no pagan el extra por entrar en casillas de figuras
  pequeñas.
  - Pueden acabar sobre terreno bloqueante o infranqueable y sobre figuras pequeñas, pero no sobre otra figura
    grande.
  - Las figuras pequeñas desplazadas van a la casilla libre más cercana a la que pudieran llegar: primero las de
    los demonios y luego las de los marines.
- La línea de visión y el alcance se pueden medir desde cualquiera de sus casillas. Nunca tienen cobertura.
- Qué demonios son grandes y cuántas casillas ocupan no se ha podido confirmar; el Ciberdemonio lo es seguro
  (sin verificar el resto).

---

## 6. Los demonios

### 6.1 Activación [LTP][EOG]

- Cuando sale una carta de iniciativa del invasor, este agota una carta de demonio preparada y activa una a una
  todas las figuras de ese tipo.
- Cada figura gana tantos puntos de movimiento como su velocidad, puede hacer **1 ataque** y gasta los puntos
  antes o después de atacar.
- Todos los demonios tienen velocidad 4 o 5 [FFG].
- Las habilidades del demonio pueden dar ataques extra, cambiar el daño o permitir otras acciones; algunas cuestan
  Argent [FFG].

### 6.2 Energía Argent [LTP][EOG][FFG][BGG]

- Es la moneda del invasor. Hay 18 fichas.
- **Se gana**:
  - Descartando hasta 3 cartas de evento en la fase de estado (1 por carta).
  - Invocando grupos de invasión que la dan: el número que acompaña al icono de Argent en el grupo.
  - Con algunos eventos, como *Soul Harvest*.
- **Dónde se pone**: en la carta de Invasión o en cualquier carta de demonio boca arriba, sin límite. Tras
  invocar, el Argent de la carta de Invasión se pasa a las cartas de los demonios de ese grupo y lo que sobre se
  descarta. Según el anuncio de FFG, una vez asignada a un tipo de demonio no se mueve [FFG].
- **Se gasta** quitando de la carta del demonio tantas fichas como iconos de Argent tenga la habilidad.
  - Se paga **por figura**: si cinco Imps usan su bola de fuego cargada, son cinco fichas. Lo dicen los jugadores
    de BGG a partir de la *Rules Reference* (p. 4 y 24); no hay dictamen oficial [BGG].
  - Una misma habilidad no se puede acumular en una misma acción, pero sí usarse varias veces por ronda [FFG].
- Cuando mueren todos los demonios de un tipo, su carta se pone boca abajo y su Argent vuelve a la reserva [EOG].
- Solo se gana Argent si quedan fichas en la reserva [EOG].

### 6.3 Portales e invocación [EOG][FFG][LTP]

- **Niveles.** Los portales son azules, amarillos o rojos, de menor a mayor peligro, y se apilan en el mapa.
- **Invocar**:
  1. El invasor elige un portal boca arriba. La carta de Amenaza dice cómo se ponen boca arriba (§8.2).
  2. Elige uno de los dos grupos de ese color de su carta de Invasión.
  3. Coloca las figuras en el portal o en casillas adyacentes, en el orden que indica el grupo. Si no hay sitio,
     van a la casilla libre alcanzable más cercana. Las figuras grandes y las voladoras ignoran el terreno al
     aparecer.
  4. Pone boca arriba la carta de cada tipo de demonio que aparece por primera vez.
  5. Gana el Argent del grupo y lo reparte entre las cartas de sus demonios.
  6. Descarta la ficha de portal, salvo que la amenaza diga otra cosa: en Asalto se pone boca abajo.
- No se puede invocar un tipo del que no queden figuras suficientes [EOG][BGG].
- Cada portal invoca una vez y se retira, y entonces queda disponible el siguiente de la pila [LTP][FFG].

### 6.4 Los 8 tipos de demonio

- La caja trae una carta de cada uno y 33 figuras en total.
- **Cuántas figuras hay de cada tipo no se ha podido confirmar** (sin verificar). Una partida de BGG cuenta que
  faltaron Imps para completar todas las invocaciones de una carta [BGG], y una reseña habla de activar 7 o más
  Imps a la vez [RES].
- No hay Caballeros del Infierno ni Invocadores, aunque salgan en el videojuego [RES].
- Las cifras de la tabla salen de una copia del *Learn to Play* con el texto desordenado. Se han ordenado como
  tambaleo / vida / alcance / velocidad porque así cuadran con las velocidades de las activaciones del pack
  (sin verificar, salvo el Ciberdemonio [RES]).

| Demonio (inglés) | En el pack [MOD] | Nivel [BGG] | Tambaleo / Vida / Alcance / Velocidad | Habilidades oficiales (nombres) | Defensa especial [BGG] |
|---|---|---|---|---|---|
| Imp | Imp | Menor | 1 / 3 / 4 / 4 (sin verificar) | *Hit & Run*: tras atacar gana 2 puntos de movimiento. Argent: *Charged Fireball*, +2 de alcance y +1 dado rojo en ese ataque [LTP]. | Esquiva |
| Possessed Soldier | Soldado poseído | Menor | 3 / 5 / 5 / 4 (sin verificar) | *Muscle Memory*: repite 1 dado al atacar. Argent: *Overwatch*, ataca a un marine a 5 casillas o menos que acabe de atacar, si lo ve [LTP]. | +2 escudos |
| Cacodemon | Cacodemonio | Menor | ? | Vuela; *Chomp*: si está adyacente, cambia dados rojos por negros; aturde [BGG][MOD]. | +1 escudo |
| Pinky | Pinky | Menor | ? | *Bull Rush*: +1 dado rojo si llega adyacente moviéndose. Argent: *Armored Hide*, más blindaje al defender [BGG][MOD]. | +3 escudos |
| Revenant | Revenant | Mayor | ? | Vuela; *Assault*: un segundo ataque; *Homing Missiles*. Ataque a distancia con 2 dados rojos y 1 negro [BGG][FFG]. | Esquiva |
| Mancubus | Mancubus | Mayor | 8 / 12 / 5 / 4 (sin verificar); dureza +1 escudo | *Artillery*: si el defensor no está adyacente, repite dados. Argent: *Flamethrower*, al final de su activación tira 1 dado negro y cada enemigo a 2 casillas o menos sufre ese daño [LTP]. | +1 escudo |
| Baron of Hell | Barón del infierno | Mayor | ? | *Grand Fireball* [BGG]. | +2 escudos |
| Cyberdemon | Ciberdemonio | Mayor | 15 / 18 / ? / ? [RES] | *Missile Barrage* (3 ataques), *Rail Cannon* [BGG]. Figura grande. | +3 escudos |

- La mayoría de los demonios mayores tienen dureza: +1 escudo al defender [BGG].
- Los voladores ignoran el terreno difícil y el coste extra de las casillas enemigas, y pueden cruzar terreno
  infranqueable o acabar en él. No cruzan paredes ni puertas cerradas [EOG].
- Una guía de BGG estima el daño medio por ataque: Imp unos 2; Poseído y Cacodemonio de 3 a 4; Pinky de 3 a 5;
  Revenant de 8 a 9 sumando sus dos ataques; Mancubus de 4 a 6; Barón 4 más su bola de fuego; Ciberdemonio de 5
  a 6 más sus habilidades de Argent [BGG].

---

## 7. Marines muertos, reaparición y frags

- **Muerte.** Un marine muere (*fragged*) cuando su daño iguala o supera su vida: 10, o 15 con *Solo Operative*
  [LTP][BGG]. Entonces [LTP][EOG]:
  - El invasor gana **1 ficha de frag**.
  - La figura se quita del mapa y se pone sobre la carta del marine. Se descarta todo su daño.
  - El marine baraja su mano y su descarte con su mazo de acción y roba 3 cartas.
  - **Conserva** sus armas y sus cartas de Ejecución, y las habilidades de clase siguen funcionando aunque esté
    muerto.
- **Reaparición.** Al empezar su siguiente activación pone su figura en el teletransportador activo que elija
  [LTP]. Los teletransportadores que activa por el camino funcionan como puntos de control de un videojuego
  [FFG].
- **Frags y victoria del invasor.** La carta de objetivo de cada misión dice cuántos frags necesita el
  invasor; lo habitual son **6** [FFG]. En el tutorial son 4 con 1 o 2 marines, 3 con 3 y 2 con 4 [LTP].
- **Fichas de objetivo** que llevaba el marine: caen en su casilla. Si es una figura grande, los marines eligen
  en cuál de sus casillas [EOG].
- **Cuánto pesa un solo marine.** Un diseñador explica en BGG que el marine en solitario tiene más vida y
  activaciones porque, al morir, vuelve al teletransportador y pierde mucho tiempo [BGG].

---

## 8. Misiones y operaciones

### 8.1 Objetivo [FFG][EOG]

- Cada misión fija un mapa, una carta de **objetivo** y una de **amenaza**, y el material del invasor.
- La misión acaba en cuanto un bando cumple su objetivo.
- Algunos objetivos tienen límite de rondas [RES], y en otros cada ficha de objetivo que retiran los marines da
  un frag al invasor (*Out of the Frying Pan*) [BGG].

### 8.2 Las tres cartas de Amenaza [FFG][BGG][MOD]

| Amenaza | Cómo se abren los portales |
|---|---|
| **Infestación** (*Infestation*) | La misión empieza con demonios en el mapa y se invocan más cuando los marines abren zonas nuevas [FFG]. Al abrir una puerta, se ponen boca arriba los portales que el marine puede alcanzar sin abrir otra puerta y se invoca en ellos, como en el tutorial [LTP][BGG]. Las cartas de iniciativa de los tipos nuevos se añaden al acabar esa activación, y los demonios no abren puertas [BGG]. |
| **Horda** (*Horde*) | Al empezar cada fase de estado, el invasor elige 1 o 2 casillas con portal, pone boca arriba el primer portal de cada una e invoca en todos los portales boca arriba. Los portales usados se descartan [FFG][MOD]. |
| **Asalto** (*Assault*) | El invasor acumula fichas de amenaza y las gasta para poner portales boca arriba e invocar en ellos. Los portales usados se ponen boca abajo en lugar de descartarse, así que vuelven a servir [FFG]. |

- Vidimus describe la carta de Asalto con estas cifras (sin verificar con la carta) [MOD]:
  - El invasor empieza con 3 fichas de amenaza y gana 2 al final de cada ronda.
  - Al empezar la ronda las gasta así: 1 para poner boca arriba 2 portales azules o 1 amarillo; 1 para invocar
    en un portal azul; 2 para un amarillo; 3 para un rojo.
  - Cada vez que muere un marine, se pone boca arriba un portal rojo.

### 8.3 Las 12 misiones de la *Operation Guide*

Los nombres son de la Doom Wiki [RES]. Los detalles, de un hilo de BGG sobre el equilibrio de las misiones y de
las misiones de Valkyrie [BGG][MOD]; son opiniones de jugadores salvo lo marcado como [MOD].

| N.º | Operación | Misión (inglés) | Lo que se sabe |
|---|---|---|---|
| E1M1 | Black Bishop | *Knee Deep in the Dead* | Objetivo *Sample Collection*, amenaza Infestación, invasión *Imp Assault*; mazos *Power Overwhelming*, *Seek and Destroy* y *Armored Offensive* [MOD]. Es casi un tutorial largo y favorece a los marines [BGG]. Es la misión 1 convertida a Valkyrie (§11). |
| E1M2 | Black Bishop | *Molten Retrieval* | Un portal rojo; un Cañón Gauss y una Motosierra muy cerca de los marines [BGG]. |
| E1M3 | Black Bishop | *Spring Cleaning* | Llegar a la última ficha de objetivo; un BFG junto a un teletransportador; gestión de fichas de amenaza [BGG]. |
| E1M4 | Black Bishop | *Leaving the Nest* | Escolta de una carga; invasión *Cruel Mayhem*; granada de absorción, ametralladora, fusil de estática y motosierra [BGG]. |
| E1M5 | Black Bishop | *Territorial Dispute* | Cinco tipos de demonio, cuatro de ellos fuertes; mazos *Power Overwhelming*, *Seek and Destroy* y *Armored Offensive*; favorece al invasor [BGG]. |
| E1M6 | Black Bishop | *Breaking and Entering* | El Ciberdemonio está disponible; un BFG vigilado; los portales amarillos traen Barones [BGG]. |
| E2M1 | Exodus | *To Whom It May Concern* | Los marines retiran fichas de objetivo; amenaza Asalto; el BFG está junto a la última ficha [BGG]. |
| E2M2 | Exodus | *All You Can Eat* | Fichas de objetivo, una de ellas la lleva un Barón o un Revenant; lanzacohetes, ametralladora y Gauss [BGG]. |
| E2M3 | Exodus | *Collect Call* | Invasión *Cruel Mayhem*; mazos *Infernal Sorcery*, *Armored Offensive* y *Seek and Destroy*; un cuello de botella al norte; favorece mucho al invasor [BGG]. |
| E2M4 | Exodus | *Out of the Frying Pan* | Cada ficha de objetivo retirada da 1 frag al invasor; la motosierra y el BFG son clave [BGG]. |
| E2M5 | Exodus | *Bringing Down the House* | Objetivo *Priority Escort*; el invasor guarda 3 fichas de amenaza; el Ciberdemonio con cañón de raíles; la carga necesita al menos 7 rondas [BGG]. |
| E2M6 | Exodus | *End of the Line* | Dos portales rojos en la zona final; los Revenants son la gran amenaza [BGG]. |

### 8.4 Final de misión y de operación [EOG]

- La misión termina en el acto cuando un bando cumple su objetivo.
- Al acabar cada misión, los marines descartan sus cartas de Ejecución y devuelven a la caja las armas que
  recogieron.
- La operación la gana el primero que gane 4 misiones; si nadie llega, el ganador de la última.

---

## 9. Glosario español ↔ inglés

**Leyenda de verificación**

- **[ES]**: aparece en los textos de la caja española de Edge (lista de componentes y descripción).
- **[MOD]**: lo usa Vidimus en el pack y las misiones. Es probable que siga la edición española, pero no está
  confirmado: va marcado con (?).
- **[VAL]**: interfaz de Valkyrie en español (`text/Localization.Spanish.txt`).
- **(sin verificar)**: no se encontró ningún uso fiable.
- La edición española no se pudo leer: no hay copia en línea de sus reglamentos. Para redactar, conviene seguir
  a Vidimus, que es lo que ya conocen los jugadores de Valkyrie.

### 9.1 Partida y estructura

| Inglés | Español | Verificación |
|---|---|---|
| DOOM: The Board Game | DOOM: El juego de tablero | [ES] |
| Invader | Invasor | [ES][MOD] |
| Marine | Marine (plural: marines) | [ES][MOD] |
| Demon | Demonio | [ES][MOD] |
| Operation / Mission | Operación / Misión | [ES] (misión); operación (?) |
| Operation Guide | Guía de operaciones | [ES] |
| Learn to Play / Rules Reference | Los «2 reglamentos» de la caja; títulos sin verificar | [ES] |
| Round | Ronda; Vidimus y Valkyrie dicen «Turno» | [MOD][VAL] |
| Status Phase / Activation Phase | Fase de estado / Fase de activación | (?) |
| Initiative card / deck | Carta / mazo de Iniciativa; Vidimus también «cartas de Activación» | [ES][MOD] |
| Fireteam | Equipo de intervención | [MOD] (?) |

### 9.2 Cartas

| Inglés | Español | Verificación |
|---|---|---|
| Demon card | Carta de Demonio | [ES] |
| Event card / event deck | Carta de Evento / mazo de eventos; Vidimus también «mazo de Invasor» | [ES][MOD] |
| Action card / action deck | Carta de Acción / mazo de acción | [ES] |
| Invasion card | Carta de Invasión; Vidimus dice «carta de Invasor» | [ES][MOD] |
| Threat card | Carta de Amenaza | [ES] |
| Marine card | Carta de Marine | [ES] |
| Objective card | Carta de Objetivo | [ES] |
| Class card | Carta de Clase | [ES] |
| Glory Kill card | Carta de Ejecución | [ES] |
| Squad card | Carta de Pelotón | [ES] |
| Stun card | Carta de Aturdimiento | [ES] |
| Map tile | Pieza de tablero (Vidimus: «pieza de mapa», «pieza de terreno») | [ES][MOD] |

### 9.3 Reglas

| Inglés | Español | Verificación |
|---|---|---|
| Glory Kill | Ejecución (ejecutar a un demonio) | [ES][MOD] |
| Stagger / staggered | Tambaleo («valor de Tambaleo») / tambaleante | [MOD] (?) |
| Frag (marine muerto) / frag token | Baja o Eliminación; «ficha de Baja» o «de Eliminación» | [MOD] (?) |
| Telefrag | Telefrag (sin traducir en las reseñas) | (sin verificar) |
| Respawn | Reaparecer, «regresar por un teletransportador» | [MOD] (?) |
| Argent Power | Energía Argent («fichas de Energía Argent»); una reseña dice «Poder Argent» | [MOD][RES] (?) |
| Movement point | Punto de movimiento | [MOD] |
| Speed | Velocidad | [MOD] |
| Range / Line of sight | Alcance / Línea de visión | [MOD] |
| Cover | Cobertura | (sin verificar) |
| Sprint | Esprintar (?) | (sin verificar) |
| Main / Bonus / Reaction action | Acción principal / adicional / de reacción | (sin verificar) |
| Damage / Health | Daño / Vida | [MOD] |
| Armor | Armadura | [MOD] |
| Shield / Dodge | Escudo / Esquiva | [RES] (?) |
| Special defense | Defensa especial («símbolo de defensa especial») | [MOD] |
| Toughness | Dureza | (sin verificar) |
| Stunned | Aturdido | [ES][MOD] |
| Exhaust / Ready | Agotar / Preparar | (sin verificar) |
| Large figure | Figura grande / demonio grande | [MOD] |
| Flying | Vuelo / volador | [MOD] |

### 9.4 Mapa y fichas

| Inglés | Español | Verificación |
|---|---|---|
| Portal (blue, yellow, red) | Portal (azul, amarillo, rojo) | [MOD] |
| Faceup / facedown portal | Portal boca arriba (activo) / boca abajo (inactivo) | [MOD] |
| Teleporter (active / inactive) | Teletransportador (activo / desactivado) | [MOD] |
| Door | Puerta | [MOD] |
| Keycard (fan) | Tarjeta de acceso (roja, azul, amarilla) | [MOD] |
| Health Pack | Botiquín | [MOD] |
| Weapon token / weapon set | Ficha de Arma / conjunto de arma | [MOD] |
| Objective / Progress / Threat token | Ficha de Objetivo / de Progreso / de Amenaza | [MOD] |
| Difficult terrain | Terreno complicado | [MOD] (?) |
| Blocking / Impassable terrain | Terreno bloqueante / infranqueable | (sin verificar) |
| Wall | Pared | (sin verificar) |

### 9.5 Nombres propios

| Inglés | Español | Verificación |
|---|---|---|
| Alpha, Bravo, Charlie, Delta | Alfa, Bravo, Charlie, Delta | [MOD] |
| Infestation / Horde / Assault | Infestación / Horda / Asalto | [MOD] |
| First Strike | «Primer ataque» (tutorial) o «Primer golpe» (Laboratorios Alfa) | [MOD] (?), dos versiones |
| Imp Assault | Asalto de Imps | [MOD] (?) |
| Cruel Mayhem | Caos cruel | [MOD] (?) |
| (sin verificar) | La Fuerza de los Malditos | [MOD] |
| Power Overwhelming / Seek and Destroy / Blood Rush | Poder abrumador / Buscar y destruir / Subidón sangriento | [MOD] (?) |
| Armored Offensive / Infernal Sorcery / Savage Strength | Ofensiva blindada / Hechicería infernal / Fuerza salvaje | [MOD] (?) |
| Sample Collection / Containment Protocol / Priority Escort | Obtención de muestras / Protocolo de contención / Escolta prioritaria | [MOD] (?) |
| Knee Deep in the Dead | «De muertos hasta el cuello» (tienda); en BGG, «Hasta el cuello de muertos» | [TIENDA][BGG] (?) |
| Cyberdemon / Baron of Hell / Cacodemon / Possessed Soldier | Ciberdemonio / Barón del infierno / Cacodemonio / Soldado poseído | [MOD]; «Barón del Infierno» en prensa española [RES] |
| Imp / Pinky / Revenant / Mancubus | Igual que en inglés (plural de Pinky: Pinkies) | [MOD] |
| Frag / Siphon Grenade | Granada de fragmentación / Granada de absorción | [MOD] (?) |
| Chaingun | Ametralladora gatling | [MOD] (?) |
| UAC (Union Aerospace Corporation) | UAC, «Corporación Unión Aeroespacial» | [MOD] |

### 9.6 Interfaz de Valkyrie en el modo Descent [VAL]

| Inglés | Español | Dónde |
|---|---|---|
| End Turn | Fin del Turno | Retrato del marine |
| KO / Recover | KO / «Recupear» (errata de Valkyrie; los textos de las misiones dicen «Recuperar») | Retrato del marine |
| Force Activate | Forzar Activación | Retrato del demonio |
| Information | Información | Retrato del demonio |
| Defeated / Unique Defeated | Derrotado / Único derrotado | Retrato del demonio |
| Round {n} | Turno {n} | Historial |

---

## 10. La adaptación a Valkyrie (pack DooM)

### 10.1 Qué es y cómo se instala

- **Autor e historia.** Lo creó Neuntoter (Derek Laliberte) [BGG]:
  - Lo anunció en BGG en enero de 2023. En febrero añadió vídeos de instalación y de cómo hacer un nivel con la
    «plantilla Infestación».
  - Subió el pack, la plantilla y la misión 1 en febrero de 2023, a la página de ficheros 253899 de BGG y a su
    web `doom-valkyrie.ddns.net`.
  - En mayo de 2023 añadió la traducción española de Vidimus.
  - Tenía previsto hacer después las plantillas Horda y Asalto, convertir las misiones de la *Operation Guide*,
    hacer una campaña de 8 misiones y un pack del DOOM de 2004. De eso solo se ha publicado lo que hay en la
    tienda; también es suyo el pack de losetas de Descent 1ª edición `D1ED` [TIENDA].
- **Qué es.** Un pack de contenido para la parte de Descent 2ª edición de Valkyrie: funciona como una expansión
  más de Descent con las losetas, las fichas, los héroes y los demonios de DOOM [BGG][MOD].
  - Hace falta el juego de mesa: la app solo narra y dirige a los demonios. Neuntoter descarta hacer una app
    independiente porque id Software ya le retiró otro proyecto suyo [BGG].
  - Valkyrie exige importar la app oficial de Descent (*Road to Legend*) para habilitar el modo Descent, aunque
    las misiones DooM no usen su contenido [VAL].
- **Instalación** [TIENDA][BGG]:
  - Desde la versión 3.0.0 de Valkyrie, el pack está en la tienda de packs de la comunidad (`DooM`, versión 1.1,
    tipo `D2ECustom`, repositorio `Neuntoter82/Doom_2016_Mod`). Se instala desde *Mi colección* → descargar
    paquete comunitario, y **hay que activarlo** en *Paquetes de contenido comunitario*.
  - Antes se copiaba a mano: en el PC, en `Valkyrie_Data/StreamingAssets/content/D2E/ck`; en Android, en
    `Android/data/com.bruce.valkyrie/files/assets/content/D2E/ck`.
  - Sin el pack descargado y activado, Valkyrie 3.28 no deja empezar una misión que lo pide (`packs=DooM`): en la
    lista sale con el icono de prohibido y no responde al pulsarla (`QuestSelectionScreen`, con
    `QuestData.GetMissingPacks`). Las descripciones de varias misiones aún avisan de que la app se cierra, de
    cuando no lo comprobaba [VAL][MOD].
- **`content_pack.ini`** [MOD]:
  - `name` «DooM 2016 Ver 1.0», `id=DooM`, `type=D2ECustom`, `image="img/BX_Art"`.
  - Ficheros de datos: `tiles.ini`, `tokens.ini`, `heros.ini`, `monsters.ini`, `activations.ini`,
    `classes.ini` e `items.ini`.
  - Idiomas: `pck Localization.English.txt` y `pck Localization.Spanish.txt`.
  - El zip mete todo dentro de una carpeta `DooM/`, y Valkyrie la busca un nivel por debajo.
  - Las misiones lo piden con `packs=DooM`.

### 10.2 Contenido del pack (contado en los `.ini`) [MOD]

#### 10.2.1 Marines (héroes): 4

| Sección | Nombre (inglés) | Imagen | Arquetipo |
|---|---|---|---|
| `HeroAlpha` | Alpha | `img/Heroes/Alpha` | `DooM` |
| `HeroBravo` | Bravo | `img/Heroes/Bravo` | `DooM` |
| `HeroCharlie` | Charlie | `img/Heroes/Charlie` | `DooM` |
| `HeroDelta` | Delta | `img/Heroes/Delta` | `DooM` |

- Los nombres salen de las claves `HeroAlpha.name` y siguientes. El fichero español las llama `Hero1.name` a
  `Hero4.name` («Alfa», «Bravo»…), así que no se usan: en español también salen los nombres ingleses, porque
  Valkyrie recurre al idioma por defecto del pack [VAL].
- El arquetipo propio hace que, al elegir clase, cada marine solo vea las 4 clases DooM.

#### 10.2.2 Clases y habilidades: 4 clases y 24 habilidades

| Clase | Inglés | Español | Armas iniciales (`items=`) |
|---|---|---|---|
| `ClassMarine1` | Shotgun Specialist | Especialista en escopeta | `ItemSuperShotgun`, `ItemCombatShotgun` |
| `ClassMarine2` | Rifle Specialist | Especialista en fusil | `ItemBurstRifle`, `ItemHeavyAssaultRifle` |
| `ClassMarine3` | Support Specialist | Especialista en apoyo | `ItemBurstRifle`, `ItemSuperShotgun` |
| `ClassMarine4` | Heavy Assualt Specialist (errata del original) | Especialista en asalto pesado | `ItemHeavyAssaultRifle`, `ItemCombatShotgun` |

- Cada clase tiene 6 habilidades: `Skill<MarineN>Defense1..3` (+1 de armadura permanente) y
  `Skill<MarineN>Life1..3` (+1 de vida permanente). Cuestan 1, 1, 2, 2, 3 y 3 de experiencia.
- Valkyrie las asocia a la clase por el prefijo: `Skill` más el nombre de la clase sin `Class` [VAL].
- Un comentario del fichero dice que son provisionales. Ninguna misión de la tienda da experiencia ni usa los
  objetos, así que la clase solo sugiere el equipo inicial [MOD].

#### 10.2.3 Armas (objetos): 11

| Sección | Inglés | Español | Rasgos | Imagen |
|---|---|---|---|---|
| `ItemSuperShotgun` | Super Shotgun | Super escopeta | Shotgun | SuperShotgun |
| `ItemCombatShotgun` | Combat Shotgun | Escopeta de combate | Shotgun | SuperShotgun (usa la de la super escopeta) |
| `ItemBurstRifle` | Burst Rifle | Fusil de ráfagas | Rifle | BurstRifle |
| `ItemHeavyAssaultRifle` | Heavy Assault Rifle | Fusil de asalto pesado | Rifle Heavy | HeavyAssaultRifle |
| `ItemPlasmaRifle` | Plasma Rifle | Plasma Rifle (sin traducir) | Rifle Plasma | PlasmaRifle |
| `ItemStaticRifle` | Static Rifle | Fusil de estática | Rifle | StaticRifle |
| `ItemChaingun` | Chaingun | Ametralladora gatling | Heavy | Chaingun |
| `ItemRocketLauncher` | Rocket Launcher | Lanzamisiles | Heavy | RocketLauncher |
| `ItemGaussCannon` | Gauss Cannon | Cañón Gauss | Cannon | **`GaussCannan`: errata, el fichero es `GaussCannon.png`** |
| `ItemChainsaw` | Chainsaw | Motosierra | Chainsaw | Chainsaw |
| `ItemBFG9000` | BFG 9000 | BFG 9000 | Plasma | BFG9000 |

- Las granadas no tienen objeto en el pack; solo tienen ficha.

#### 10.2.4 Demonios: 8, y sus 30 activaciones

| Sección | Inglés | Español | `activation=` (genéricas) | Activaciones propias |
|---|---|---|---|---|
| `MonsterCyberDemon` | Cyberdemon | Ciberdemonio | `LongShot ChargedShot Enraged` | `CyberDemon1` a `4` |
| `MonsterBaron_of_Hell` | Baron of Hell | Barón del infierno | `Enraged Charge` | `Baron_of_Hell1` a `3` |
| `MonsterCacoDemon` | Cacodemon | Cacodemonio | `ChargedShot Charge` | `CacoDemon1` a `3` |
| `MonsterRevenant` | Revenant | Revenant | `ExplosiveShot ChargedShot` | `Revenant1` a `3` |
| `MonsterMancubus` | Mancubus | Mancubus | `ExplosiveShot ChargedShot` | `Mancubus1` a `3` |
| `MonsterPinky` | Pinky | Pinky | `Charge` | `Pinky1` a `3` |
| `MonsterImp` | Imp | Imp | `LongShot ChargedShot` | `Imp1` a `3` |
| `MonsterPossessed` | Possessed Soldier | Soldado poseído | `LongShot ChargedShot` | `Possessed1` a `3` |

- **Datos comunes.** Todos tienen `traits=Doom`, una imagen en `img/Monster/` y una descripción `info`.
  - En inglés, `info` es solo una frase de ambiente.
  - En español, Vidimus metió ahí las habilidades del demonio, que se leen con la opción *Información* de su
    retrato.
- **Lo que no tienen.** Ni vida ni rasgos de tamaño: la app no lleva la vida de los demonios (se usan las
  cartas y fichas de daño físicas) y dibuja a todos en una casilla [VAL].
- **Activaciones.** Todas las secciones de `activations.ini` tienen solo `ability` (la habilidad, arriba) y
  `minion` (las acciones), con `minionfirst=true`. Por eso Valkyrie las muestra en un solo paso: el nombre del
  demonio, la habilidad, el título *Acciones* y el botón *Activado* [VAL]. Resumen con mis palabras:

| Demonio | Habilidades fijas (nombre inglés / español del pack) | Qué hacen sus activaciones propias |
|---|---|---|
| Ciberdemonio | *Fury* / Furia: si ya tiene 10 de daño o más, repite hasta 3 de sus dados más bajos. | (1) Se mueve hasta 5 para tener a tiro a cuantos más marines mejor y lanza misiles entre dos marines separados por 2 casillas, o al más cercano: explosión de 3×3. (2) Carga hasta 5 hacia el más cercano y golpea con 1 dado negro y 1 rojo, empujando 3 casillas; si no llega, dispara al más cercano. (3) Se mueve hasta 5; con 2 Argent, al final de la ronda ataca a alcance 8 con 2 negros y 4 rojos; misiles 3×3 al más cercano. (4) *Missile Barrage* / Andanada de misiles: con 1 Argent, 3 ataques de alcance 4 con 2 rojos; misiles 3×3 al más cercano. |
| Barón del infierno | *Vengeful* / Vengativo: tras recibir un ataque gana 2 puntos de movimiento para acercarse. *Beatdown* / Ensañamiento: gasta 5 puntos para un ataque extra. | (1) Se mueve hasta 5 hasta quedar adyacente a un marine, le ataca y repite si le quedan 5 puntos. (2) Lo mismo, pero antes, con 1 Argent, hace un ataque a alcance 6 con 4 rojos. (3) Lo mismo, ganando 3 puntos más y yendo a por el más débil. |
| Cacodemonio | *Flying* / Vuelo: ignora terreno y figuras al moverse. *Chomp* / Mordisco: si está adyacente al defensor, cambia 2 dados rojos por 2 negros. | Se mueve hasta 5 y ataca: (1) adyacente, al más cercano; (2) al más cercano, y con 1 Argent lo deja aturdido; (3) al más débil. |
| Revenant | Vuelo. *Assault* / Asalto: hace un segundo ataque. | Con 1 Argent, antes de tirar, el marine defensor saca 3 cartas de su mazo y se queda la de menos defensa. Se mueve hasta 5 y ataca dos veces: (1) al más débil dos veces; (2) al más cercano y al más fuerte; (3) al más alejado y al más cercano. |
| Mancubus | *Artillery* / Artillería: si el defensor no está adyacente, repite los dados vacíos. | Se mueve hasta 4 y ataca: (1) al más débil; (2) al más cercano; (3) se pone a 2 casillas o menos de cuantos más marines mejor y ataca al más alejado. Al acabar, si tiene cerca (a 2 casillas o menos) a más de dos marines, puede pagar 1 Argent para tirar 1 dado negro: cada uno de esos marines sufre tanto daño como iconos salgan. |
| Pinky | *Bull Rush* / Acometida de toro: +1 dado rojo si llegó moviéndose. Con 1 Argent, *Armored Hide* / Piel blindada: +2 de armadura al defender. | Se mueve hasta 5 hasta quedar adyacente al marine (1) más débil, (2) más alejado o (3) más fuerte, y le ataca. |
| Imp | *Hit & Run* / Ataque y huida: tras atacar gana 2 puntos de movimiento. | Se mueve hasta 4 hacia el marine (1) más alejado, (2) más débil o (3) más fuerte, le ataca y se aparta 2 casillas del más cercano. En (1), con 1 Argent, +2 de alcance y +1 dado rojo. |
| Soldado poseído | *Fury* / Furia: repite 1 dado al atacar (la carta oficial la llama *Muscle Memory*). | Se mueve hasta 4 para tener a tiro al marine (1) más cercano, (2) más alejado o (3) más débil, y le ataca. **No incluye *Overwatch***. |

| Activación genérica | Nombre español [MOD] | Efecto y conducta |
|---|---|---|
| `LongShot` | Largo alcance | +3 de alcance; se coloca a su alcance máximo del más cercano y le ataca. |
| `ExplosiveShot` | Detonación explosiva | El ataque alcanza un área de 3×3; se acerca a un grupo de marines y ataca al grupo más cercano. |
| `ChargedShot` | Disparo potente | +1 dado rojo; va a por el más débil. |
| `Enraged` | Enfurecido | +1 dado rojo; se pone adyacente al más débil y le ataca. |
| `Charge` | Carga | +3 puntos de movimiento; se pone adyacente al más alejado y le ataca. Pinky, Cacodemonio y Barón conservan sus habilidades. |

- El pack no define «más débil» ni «más fuerte». Lo natural es leerlo como el marine con menos o más vida
  restante (sin verificar).
- La palabra «Argent» entre corchetes al principio de una acción indica su coste. Las misiones dicen que se use
  cuando haya fichas en la carta del demonio y la activación lo ofrezca [MOD].
- Cada paso de las acciones empieza por `{action}`, el icono de acción de Descent, que hace de viñeta; la línea
  del coste de Argent y alguna línea final de conducta van sin él. Las activaciones propias de las misiones de la
  tienda hacen lo mismo [MOD].
- **Erratas del pack**:
  - `MonsterActivationCyberDemon3.Ability` y `.Minion` están duplicadas en los dos idiomas. Valkyrie se queda
    con la **primera** aparición de cada clave, así que la tercera activación es la del ataque de final de ronda
    y la segunda versión, la de la andanada, se ignora [VAL].
  - En inglés, la segunda activación del Cacodemonio dice «Ardent» por «Argent».

#### 10.2.5 Fichas: 26 tipos

| Sección | Qué es | Uso en las misiones |
|---|---|---|
| `Token_DM1_Objective` | Ficha de Objetivo | Recordatorios de reglas fuera del mapa, terminales, tarjetas de acceso, consolas, salidas, contador de bajas |
| `Token_DM1_Progress` | Ficha de Progreso (azul) | Avance de objetivos, la científica rescatada; en *La caída de Fobos*, las fichas de Furia |
| `Token_DM1_Threat` | Ficha de Amenaza (roja, con una mano) | Cadáveres, escombros, barreras demoníacas, muros de fuego, chorros de plasma, una rejilla |
| `Token_DM_MedPack` | Botiquín | Recupera 5 de daño |
| `Token_DM_Copy` | Ficha gris con una persona corriendo | La ingeniera a escoltar en *Procesador de plasma* |
| `Token_DM_Blue_Portal_A` / `_I` | Portal azul activo / inactivo | Portales |
| `Token_DM_Yellow_Portal_A` / `_I` | Portal amarillo activo / inactivo | Portales |
| `Token_DM_Red_Portal_A` / `_I` | Portal rojo activo / inactivo | Portales |
| `Token_DM_A_Teleport` / `Token_DM_I_Teleport` | Teletransportador activo / inactivo | Entrada, reaparición, atajos |
| `Token_DM_FGrenade` | Granada de fragmentación (verde) | Granada |
| `Token_DM_Grenade` | Granada roja | Otra granada: en *Repliegue*, la de absorción |
| `Token_DM_CombatShotgun`, `_SuperShotgun`, `_BurstRifle`, `_HeavyAssaultRifle`, `_PlasmaRifle`, `_StaticRifle` | Armas iniciales | Armeros y recogidas |
| `Token_DM_Chaingun`, `_GaussCannon`, `_BFG9000`, `_RocketLauncher`, `_Chainsaw` | Armas de recogida | Recogidas |

- Las misiones también usan fichas de Descent, como `TokenSearch`, y sus puertas de colores (`color=red`,
  `blue` o `yellow`) [MOD].

#### 10.2.6 Piezas de tablero: 16 números, 32 caras

- Son `TileSideDooM_01_A` a `TileSideDooM_16_B`, con los nombres «1A» a «16B».
- Cada cara indica `image="img/Tiles/NN_X"`, la otra cara en `reverse=` y su cuadrícula con `top=` y `left=`.
- Todas declaran `pps=100`, que sustituye los 105 píxeles por casilla de Descent [VAL].
- Las misiones de la tienda usan como máximo 6 copias de la 15, 2 de la 10, 2 de la 12, 2 de la 13 y 1 de las
  demás: las 24 piezas de la caja (deducción, §2.6). Una misión no debería pedir más copias de una pieza de las
  que hay.

### 10.3 Cómo trata el motor de Valkyrie a DooM (Descent) [VAL]

- **Un grupo por tipo.** En Descent los monstruos se agrupan por tipo:
  - Si se invoca un tipo que ya está en juego, sus figuras se suman al grupo existente; solo se marcan sus
    casillas.
  - `#monsters` cuenta grupos, es decir, tipos, no figuras.
  - *Derrotado* quita el grupo entero y dispara `Defeated<Monster…>` (por ejemplo, `DefeatedMonsterImp`) y
    `Defeated<nombre del Spawn que creó el grupo>`. Los Spawn posteriores del mismo tipo no tienen disparador
    propio.
  - Con `unique=true`, el grupo pasa a único: su retrato muestra la vida extra (`uniquehealth` +
    `uniquehealthhero` × número de héroes) y aparece *Único derrotado*.
- **Ronda.** Los marines (héroes) actúan en el orden que quieran:
  - Cada *Fin del Turno* de un marine hace que la app active **un grupo de demonios al azar** entre los que aún
    no han actuado.
  - Cuando ya han actuado todos los marines, los grupos que faltan se activan uno tras otro.
  - Cuando todos han actuado, acaba la ronda: se disparan los eventos `EndRound`, sube `#round` y se disparan los
    `StartRound`.
  - *Forzar Activación* en el retrato de un demonio activa ese grupo cuando no hay otra activación abierta. Es lo
    que usa el «modo normal» con la iniciativa física.
- **Qué activación sale.** Al activarse un grupo, la app elige al azar entre:
  - todas las activaciones cuyo nombre empiece por `MonsterActivation` + el nombre del monstruo sin `Monster`
    (por ejemplo, `MonsterActivationImp1` a `3`);
  - y las genéricas que liste su `activation=`.

  El Imp tiene 5 posibles, el Ciberdemonio 7 y el Pinky 4. La elegida vale para toda la ronda y se renueva en la
  siguiente.
- **Monstruos de la misión** (`CustomMonster…` con `base=` y `activation=`) [VAL]:
  - Sin `activation=`, usan las activaciones de su demonio base (las suyas del pack y sus genéricas).
  - Cada nombre de `activation=` se busca primero entre las secciones `Activation<nombre>` de la misión, que
    valen si se cumplen sus condiciones (`vartests`), y si no, en el pack (`MonsterActivation<nombre>`): se
    pueden mezclar activaciones propias con las del pack, como `Baron_of_Hell1` o `Enraged`.
  - Las propias pueden tener `master`, `minion` o ambos.
  - Si no queda ninguna activación válida, Valkyrie se cierra (`RoundController.ActivateMonster`).
  - Pueden tener `health` y `healthperhero`, imagen propia y un `info`.
- **Grupos que esperan.** Un Spawn con `activated=true` crea su grupo como ya activado en esa ronda [VAL].
- **Moral y derrota.**
  - Al empezar, `$%morale` vale el número de héroes.
  - Cada *KO* en el retrato de un marine resta 1. Si una ventana de activación está abierta, la comprobación se
    aplaza hasta que se cierre.
  - Si `$%morale` queda por debajo de 0, se dispara `NoMorale`.
  - En Descent, la app vuelve a comprobar la moral **después de las operaciones de cada evento**, así que un
    evento que reste `$%morale` también puede provocar `NoMorale`.
  - *Recupear* (sic) solo devuelve el retrato a su estado normal; no suma moral.
- **`Eliminated` no funciona en Descent.** El disparador `Eliminated` depende de `#eliminated`, que solo pone el
  menú de Mansiones de la Locura. En una misión de Descent no salta nunca.
- **Colocación por número de marines.** `placementN` se usa con N héroes. Si falta la de ese número, la app
  marca una zona en lugar de casillas. Para jugar con 1 marine hacen falta `placement1` y `minhero=1`. Por
  defecto, una misión de Descent admite de 2 a 4 héroes.
- **Tamaño.** La figura de un monstruo se dibuja de 1×1 salvo que tenga los rasgos `medium`, `huge` o `massive`.
  Los demonios DooM no los tienen, así que el Ciberdemonio sale en una casilla y los jugadores colocan la figura
  grande donde quepa.
- **Idiomas.** De cada clave cuenta la primera aparición. Si falta una clave en el idioma del jugador, se usa la
  del idioma por defecto del pack o de la misión.
- **Final.** Cualquier valor de `$end` distinto de 0 termina la partida. Si la misión se abrió desde un
  paquete `.valkyrie` (cualquiera cuyo nombre no empiece por `EditorScenario`), muestra la pantalla para
  puntuarla (`EventManager.EndEvent`).

### 10.4 Qué reglas cambian en las misiones de Valkyrie [MOD][BGG]

| Aspecto | Juego de mesa | Misiones de Valkyrie |
|---|---|---|
| Invasor | Un jugador con información oculta | La app: textos de activación y eventos. Juego cooperativo; también en solitario. |
| Orden de activación | Mazo de iniciativa barajado (§3) | **Modo Valkyrie**: marine, grupo de demonios al azar, marine… (§10.3); un marine siempre abre la ronda. **Modo normal**, opcional en la misión 1, *Laboratorios Alfa*, *La apuesta de Hayden* y la versión inglesa del tutorial: mazo físico; al salir una carta del invasor se elige al azar una carta de demonio no activada y se pulsa *Forzar Activación*; al agotar el mazo, cada marine pulsa *Fin del Turno*. |
| Conducta de los demonios | La decide el invasor | La dicta la activación: cuánto moverse, a quién atacar (el más cercano, alejado, débil o fuerte) y qué habilidad usar. Algunas habilidades van ya dentro del texto, como la retirada del Imp tras atacar. |
| Cartas de evento | Mano de 6: efectos, Argent y defensa | **Solo la defensa de los demonios**: se revela la primera del mazo y se ignora su texto. Cada misión dice qué 2 o 3 mazos usar. |
| Argent | Descartando eventos e invocando | **Plantilla**: al empezar cada ronda, la app pide repartir 3 Argent lo más igual posible entre los tipos de demonio en juego; algunas invocaciones dan 1 a 3 más. ***La caída de Fobos*** (versión 2): por cada grupo nuevo se tira 1 dado rojo (normal) o negro (difícil) y se ponen tantas fichas en él. ***La apuesta de Hayden***: si al acabar la ronda no queda ningún portal, +1 por cada carta de demonio boca arriba. |
| Portales | Los abre el invasor según la amenaza | **Infestación**: cuando un marine tiene línea de visión con un portal, se pulsa su ficha y la app elige al azar el grupo izquierdo o derecho de la carta de Invasión de ese color. Las misiones usan la línea de visión; según un jugador de BGG, la carta oficial habla de lo que se puede alcanzar sin abrir otra puerta. **Asalto** y **Horda**: con contadores y eventos de ronda, y en *Procesador de plasma*, *Repliegue* y *La apuesta de Hayden* la propia app elige qué portales abrir (§11). |
| Puertas | 1 punto para abrirlas; los demonios pueden, salvo con Infestación | Igual coste, con un botón en la puerta. **Los demonios nunca abren puertas.** Las de color necesitan su tarjeta de acceso (idea de Neuntoter). |
| Frags | Fichas del invasor | *KO* en el retrato (resta moral) y, si el marine reaparece, *Recuperar*. Derrota con `NoMorale` o con contadores propios. Algunas misiones no tienen final automático: se pulsa «Victoria» o «Derrota» en la ficha de objetivo. |
| Reaparición | Teletransportador activo en su siguiente activación | Igual en el tutorial y en las misiones de Vidimus. **En *La caída de Fobos* no hay reaparición**: el marine recupera 5 de vida y sigue donde está, y la segunda muerte es la derrota. |
| Ejecuciones | Siempre, con el demonio tambaleante | Igual, salvo en ***La caída de Fobos***: cada ejecución gasta una ficha de **Furia** (ficha de Progreso azul). Se ganan con inyecciones de adrenalina (*berserker*, +2), con eventos, al matar ciertos grupos y cuando una granada de fragmentación estalla sin dañar a nadie. |
| Mazo inicial | UAC (4) + 2 armas iniciales (10 cartas) | Casi todas: **UAC 1-4 + Escopeta de combate 1-3 (7 cartas)**, robando 3. Las clases del pack proponen 2 armas, pero las misiones no las usan. |
| Recoger armas | El juego se pone encima del mazo | Basta con **pasar** por la casilla y pulsar la ficha, que desaparece; se añaden las cartas 1 a 3 del arma al mazo. En *La caída de Fobos*, las armas pasan a la siguiente misión (se apunta a mano). |
| Solitario | *Solo Operative*: 2 activaciones, +5 de vida y 2 acciones principales | Neuntoter lo quita en *La caída de Fobos* (1 activación). Valkyrie necesita `minhero=1` y `placement1`. En el modo Valkyrie, «Fin del Turno» solo se pulsa una vez por marine y ronda: la segunda activación se juega pulsando «Forzar Activación» en un grupo entre las dos (deducción a partir de `RoundController`) [VAL]. |
| Número de marines | 1 a 4 | *La caída de Fobos*: exactamente 1. Tutorial, *Procesador de plasma*, *La apuesta de Hayden* y *Repliegue*: 2 a 4 (no fijan `minhero`). Las demás, 1 a 4. |
| «Cartas de Amenaza» | Infestación, Horda o Asalto | Las misiones llaman así a otra cosa: 12 efectos de ronda opcionales del modo Horda de aficionados (§10.5). La amenaza oficial aparece como «modo de juego» o «Amenaza: …». |
| Vida de los demonios | Fichas de daño junto a la figura | La app no la lleva. Los jefes únicos muestran su vida extra en el retrato, y su texto dice si se les puede ejecutar o no tienen tambaleo. |
| Reglas de la misión | En la *Operation Guide* | Fichas de Objetivo colocadas fuera del mapa, en coordenadas negativas, que muestran las reglas al pulsarlas: reglas de juego, modo, objetivo y misión. |
| Pruebas de dados | No existen | Algunos eventos piden tirar 1 o 2 dados y decir el resultado (superar con un 2, fallar con una cara vacía…). |

### 10.5 La plantilla común de las misiones [MOD]

Neuntoter publicó una «plantilla Infestación» que reutilizan la misión 1, el tutorial y las misiones de Vidimus;
*La caída de Fobos* usa una variante.

- **Ficheros**:
  - `Events_Template.ini`: inicio, reglas, victoria, derrota, Argent y tarjetas de acceso.
  - `Events_Round.ini`, o `cards.ini` en *La caída de Fobos*: rondas y cartas de Amenaza.
  - `Tokens_Template.ini`: fichas de reglas, botiquines, armas y tarjetas.
  - `Area01_Portals.ini` a `Area09_Portals.ini`: hasta 3 portales por zona.
  - Además: `tiles.ini`, `door.ini`, `tokens.ini`, `events.ini`, `spawns.ini`, `mplaces.ini` y `ui.ini`.
- **Cadena de un portal** (zona NN, portal M):
  1. La ficha `Token_NN_Portal_M` (tipo `Token_DM_<Color>_Portal_A`) lanza `Event_NN_Portal_M_Click`.
  2. Ese evento retira la ficha y elige al azar (`randomevents=true`) entre `…_Selection_1` y `…_Selection_2`,
     el grupo izquierdo o derecho de la carta.
  3. Cada selección lanza `Spawn_NN_Spawn_M_Option_X_1`, el primer tipo de demonio. Si el grupo tiene un
     segundo tipo, encadena `…_Option_X_2`.
  4. Al final puede encadenar `Event_000_Gain_N_Argent`.
  5. Las casillas son `MPlace_NN_Portal_M_Option_X_K`. Lo que no se usa queda «aparcado» en (-4, 2) sin
     encadenar.
- **Rondas.** `Event_999_Round_Beginning` (disparador `StartRound`) suma `_Round` y lleva a
  `Event_999_Beg_Round_Gain_3_Argent` (repartir 3 Argent). Este roba una carta de Amenaza si están activadas.
  `Event_999_Round_End` (`EndRound`) tiene un texto que recuerda ajustar el mazo de iniciativa, pero en todas
  las misiones que lo traen está oculto (`display=false`).
- **Cartas de Amenaza.** Al empezar (`EventStart`), `Event_999_Check_Use_Cards` pregunta si se usan; la
  variable es `_Use_Cards`.
  - Cada ronda, `Event_999_Draw_Card` elige al azar una de 12 cartas no descartadas
    (`_Card_NN_Dicarded`, así escrito) y muestra cuántas quedan (`_Card_Deck_Amount`).
  - Los efectos, resumidos, valen para toda la ronda:
    1. Los ataques con Argent no se pueden bloquear.
    2. Si un demonio mata a un marine, todos los demonios se curan del todo.
    3. Los demonios tienen +1 de armadura.
    4. El marine que muera pierde sus armas especiales (la carta 9 repite este efecto).
    5. Los demonios tiran +1 dado negro.
    6. Los demonios tiran +1 dado rojo.
    7. Todas las cartas de demonio ganan 1 Argent y se roba otra carta.
    8. No se puede ejecutar a los demonios grandes.
    10. Cada vez que se activa un grupo, aparece 1 demonio más del grupo más débil junto a los suyos (la carta
        11 repite este efecto).
    12. Se baraja de nuevo y se roba otra.
  - Vienen del modo Horda de Mark Thomas, de marzo de 2017; la plantilla omite su carta del Ciberdemonio [BGG].
- **Variables habituales.**
  - Plantilla: `_Round`, `_Use_Cards`, `_B_Keycard`, `_R_Keycard`, `_Y_Keycard` y `$end`.
  - Las misiones añaden contadores propios: `Puerta`, `Portal`, `Demonios`, `Bajas`, `Amenaza`, `CuentaAtras`,
    `_oxygen` y `$%morale`.
- **Tarjetas de acceso.** La ficha `Token_<Color>_Key_Card` pone `_<C>_Keycard=1`, y la puerta
  `Door_<Color>_Door` solo se abre con ella.

### 10.6 Errores y trampas detectados al leer los ficheros

- **Plantilla: la puerta amarilla.** `Event_Open_Yellow_Door` comprueba `_Y_Keycard==0`, así que la puerta se
  abre **sin** la tarjeta. Sigue así en la misión 1, el tutorial, *Procesador de plasma*, *Puesto avanzado
  Garen* y *Repliegue*, aunque la puerta de la plantilla está aparcada fuera del mapa. *La caída de Fobos* y
  *Laboratorios Alfa* lo corrigen (`==1`). En el tutorial, además, los textos de recoger las tarjetas roja y
  amarilla están cruzados.
- **Plantilla: las cartas de Amenaza.**
  - Reinicia `_Card_02_Dicarded` dos veces y pone a 0 una `_Card_13_Dicarded` que no existe.
  - La carta 12 no tiene condición: puede salir en cualquier robo, no solo al acabarse el mazo.
- **Contar demonios con `DefeatedSpawn…`.** El tutorial lo hace con un evento por cada Spawn. Como los Spawn del
  mismo tipo se funden en un grupo (§10.3), solo dispara el del primero. Es más seguro usar `#monsters==0` o
  `DefeatedMonster<Tipo>`. `validar.py` lo sugiere: sale en 3 de las 11 misiones (el tutorial, E1M1 y E1M4).
- **Tutorial con 3 marines.** `Event000_AjustarEliminaciones3p` comprueba `#heroes==2` en vez de 3. Con 3
  marines ninguna de las tres opciones se cumple y la cadena de preparación se detiene ahí.
- **Moral desfasada.** *Procesador de plasma* y *Repliegue* ponen `$%morale=6` pero anuncian la derrota a las 6
  bajas; con 6, `NoMorale` llega en la 7.ª (`$%morale` tiene que ser frags permitidos − 1, como hacen
  *Laboratorios Alfa* y *La apuesta de Hayden* con 5). En *Procesador de plasma*, `Event0_Baja04` comprueba
  `$end==2` en lugar de la moral.
- ***La caída de Fobos*.**
  - `Event_Fragged` («recuperas 5 de vida») usa el disparador `Eliminated`, que en Descent no salta: la regla
    solo está en el texto de reglas especiales.
  - En E1M2, la pieza `Tile_03_11A` usa la cara `TileSideDooM_14_A`.
- **Idiomas.** *Procesador de plasma* y *Repliegue* traen un `Localization.English.txt` que su `quest.ini` no
  carga; es una copia del de *Procesador* y en la práctica están solo en español.
- **Pack.** Las erratas de §10.2: la imagen del Cañón Gauss, la clave duplicada del Ciberdemonio, las claves
  españolas de los héroes y «Ardent».

---

## 11. Las 11 misiones de la tienda

Datos de la tienda [TIENDA] y de los ficheros [MOD]. Las estadísticas de la tienda (nota, partidas, duración
media en minutos y porcentaje de victorias) son de pocos jugadores y orientativas.

### 11.1 Resumen

| Id de la tienda | Título en español | Título en inglés | Autor | Marines | Duración | Basada en |
|---|---|---|---|---|---|---|
| `Doom_Tutorial` | Doom - Tutorial (v1.15) | DooM - Tutorial (v1.15) | Vidimus | 2-4 | 30-45 min (autor); media de 80 | Tutorial oficial *UAC Training Field* del *Learn to Play* |
| `Doom_Mission_1` | Doom - Misión 1 - De muertos hasta el cuello | DooM - Mission 1 - Knee Deep in the Dead | Neuntoter; traducción de Vidimus | 1-4 | media de 125 | E1M1 oficial, *Knee Deep in the Dead* |
| `Doom_FOP_E1M1` | Doom - La caída de Fobos 01 El comienzo V2 | Doom Fall of Phobos - E1M1- The Beginning | Neuntoter; trad. Vidimus | 1 | media de 522 (dato anómalo) | Campaña propia |
| `Doom_FOP_E1M2` | Doom - La caída de Fobos 02 El pasillo tenebroso | … E1M2- The Dark Corridor | Neuntoter; trad. Vidimus | 1 | media de 133 | Campaña propia |
| `Doom_FOP_E1M3` | Doom - La caída de Fobos 03 En la superficie V2 | … E1M3- The Surface | Neuntoter; trad. Vidimus | 1 | media de 41 | Campaña propia |
| `Doom_FOP_E1M4` | Doom - La caída de Fobos 04 En la superficie, parte 2 V2 | … E1M4- The Surface Pt. 2 | Neuntoter; trad. Vidimus | 1 | media de 69 | Campaña propia |
| `Doom_Puesto_Garen` | Doom - Puesto avanzado Garen (v1.25) | Doom - Garen Outpost | Vidimus | 1-4 | 180-240 (autor); media de 245 | Propia; quizá el mapa de aficionado *Garen Outpost* de BGG (?) |
| `Doom_Laboratorios_Alfa` | Doom - Laboratorios Alfa | Doom - Alpha Labs | Vidimus | 1-4 | 90-120 (autor); media de 132 | Mapa de Cypher0117 (BGG) |
| `Doom_Procesador_plasma` | Doom - Procesador de plasma (v1.15) | — (solo español) | Vidimus | 2-4 | 45-90 (autor); media de 98 | Mapa de Cypher0117 (BGG) |
| `Doom_Apuesta_Hayden` | Doom - La apuesta de Hayden | Doom - Hayden's Wager | Vidimus | 2-4 | 60-90 (autor) | Mapa *Hayden's Corridor* de Cypher0117 (BGG) |
| `Doom_Repliegue` | Doom - Repliegue | — (solo español) | Vidimus | 2-4 | 60-120 (autor) | Propia |

- Todas son `type=D2E`, `packs=DooM` y formato 21, salvo el tutorial y *Procesador de plasma*, que son de
  formato 19.
- Idioma por defecto: inglés en las de Neuntoter y español en las de Vidimus.
- Dificultad que declaran sus autores (0 a 1): tutorial 0,2; *Laboratorios Alfa* y *La apuesta de Hayden* 0,3;
  *Garen*, *Procesador de plasma* y *Repliegue* 0,4.
- Notas medias de la tienda: entre 6,5 (FOP E1M3) y 9,4 (*Garen*). Victorias: del 60 % (*Garen*) al 100 %, sin
  contar *Repliegue*, que solo tiene una partida registrada y sin duración.
- Neuntoter tenía prevista una campaña de 8 misiones; solo se publicaron las 4 primeras [BGG].

### 11.2 Ficha de cada misión

#### Doom - Tutorial (Vidimus)

- **Qué es.** La adaptación del tutorial oficial, con explicaciones de cómo se juega con la app (que se pueden
  saltar desde la versión 1.15, de enero de 2026) [MOD][BGG].
- **Mapa.** Piezas 5A, 7A, 10A, 15A ×3 y 16A, como en el *Learn to Play* [MOD][LTP].
- **Material.** Carta de Invasión *First Strike* («Primer ataque»); mazos de evento *Power Overwhelming*, *Seek
  and Destroy* y *Blood Rush*, solo para la defensa. Los marines usan sus cartas como siempre.
- **Grupos de *First Strike*** (así los programa):
  - Portal azul: 3 Imps o 2 Soldados poseídos.
  - Portal amarillo: 2 Imps y 2 Cacodemonios, o 2 Pinkies y 1 Soldado poseído.
- **Desarrollo.**
  - Al empezar hay Imps y Soldados poseídos en el mapa (más que en el tutorial oficial, según el número de
    marines), dos botiquines y un armero con un lanzacohetes (con 1 o 2 marines) o una motosierra (con 3 o 4).
  - Abrir una puerta cuesta 1 punto de movimiento y los demonios no las abren.
  - Al abrir la primera puerta se activan los dos portales. Cada portal se pulsa cuando un marine lo ve, y la app
    elige al azar el grupo.
- **Victoria.** Al final de una ronda, si se ha abierto una puerta, se han usado los dos portales y no quedan
  demonios.
- **Derrota.** Con `NoMorale`: 4 bajas con 1-2 marines, 3 con 3 y 2 con 4 (`$%morale` 3, 2 o 1). Se explica cómo
  usar *KO* y *Recuperar*.
- **Además.** Las cartas de Amenaza opcionales y los dos modos de activación (en inglés se ofrece también el
  normal).
- **Problemas.** Con 3 marines la preparación se queda parada (§10.6). Usa contadores por Spawn que fallan al
  fundirse los grupos.

#### Doom - Misión 1 - De muertos hasta el cuello (Neuntoter)

- **Qué es.** La E1M1 oficial convertida a Valkyrie. Fue la primera misión DooM de la tienda (abril-mayo de 2023)
  [BGG].
- **Material.** Objetivo *Sample Collection* («Obtención de muestras»), amenaza Infestación, carta de Invasión
  *Imp Assault* («Asalto de Imps»); mazos *Power Overwhelming*, *Seek and Destroy* y *Armored Offensive*.
- **Mapa.** Tres zonas que aparecen al abrir sus puertas (`_02_Explored`, `_03_Explored`), con
  teletransportadores que hay que activar, botiquines, una motosierra y una ametralladora.
- **Grupos de *Imp Assault*** (así los programan esta misión y *Garen*):
  - Azul: 3 Imps, o 2 Imps y +2 Argent.
  - Amarillo: 2 Imps y 2 Cacodemonios con +2 Argent, o 2 Imps y 1 Revenant.
  - Rojo: 3 Imps y 2 Revenants, o 4 Imps, 1 Barón y +3 Argent.
  - Con 1 marine salen los mismos demonios, como en el juego de mesa [BGG].
- **Victoria y derrota.** Los marines consiguen 3 muestras matando a los demonios que las llevan, o el invasor
  llega a 6 fichas de baja. **No hay final automático**: se pulsa «Victoria» o «Derrota» en la ficha de
  objetivo.
- **Además.** Las cartas de Amenaza opcionales, 3 Argent por ronda y los dos modos de activación. Se juega con 1
  marine gracias a `placement1`.

#### Doom - La caída de Fobos 01 a 04 (Neuntoter)

Es una campaña para **un solo marine** (`minhero=1`, `maxhero=1`), pensada para parecerse más a los DOOM
clásicos. Las cuatro misiones son paquetes separados: no es una campaña de Valkyrie, y lo que pasa de una
misión a otra se apunta a mano [MOD].

- **Reglas especiales comunes**:
  - Marine raso; ejecuciones solo gastando **fichas de Furia** (fichas de Progreso azules), que dan los objetos y
    eventos.
  - Al morir, recupera 5 de vida y sigue donde está. **Pierde a la segunda muerte** (`$%morale=1`).
  - Los portales se activan al verlos.
  - Las armas recogidas pasan a la siguiente misión.
  - Las granadas de fragmentación también pasan, y la que estalla sin dañar a ningún demonio da 1 ficha de Furia
    (si hay enemigos en el mapa).
- **Material.**
  - Mazo inicial: UAC 1-4 y Escopeta de combate 1-3; se añade la granada de fragmentación en E1M2 y E1M4, y el
    fusil de plasma y la granada en E1M3.
  - Defensa de los demonios con *Seek and Destroy* y *Armored Offensive*.
- **Argent (versión 2, 2024).** Por cada grupo nuevo se tira 1 dado rojo (normal) o negro (difícil) y se ponen
  tantas fichas en él [MOD][BGG].
- **Objetivo.** Encontrar la salida.
- **Además.** Cartas de Amenaza opcionales, tarjetas de acceso, puertas que se pueden dejar cerradas, eventos de
  historia con imágenes y sonido, y pruebas de dado («tira un dado rojo: con 2, te salvas»).

| Misión | Lo propio |
|---|---|
| E1M1 *El comienzo* | Cafetería y centro de control; marines muertos que se levantan (Soldados poseídos). **Monstruos propios**: el *Bloated Zombie* (vida 5, velocidad 3, ataque cuerpo a cuerpo con 1 dado rojo, sin tambaleo y con contraataque como defensa especial; activaciones `_Claw`, `_Bite` y `_Swarm`; usa la figura del Poseído con una ficha de Amenaza) y el teniente Ruthic, un Soldado poseído con 10 de vida, tambaleo 7 y 3 Argent. Inyección de adrenalina: +2 de Furia. |
| E1M2 *El pasillo tenebroso* | Escombros (fichas de Amenaza) que se quitan descartando una carta de acción; un Pinky que derriba muros; un marine muerto con un fusil de plasma; pieza mal puesta (§10.6). |
| E1M3 *En la superficie* | Caras B, en el exterior de Fobos. **Oxígeno** (`_oxygen`): baja cada ronda, las bombonas dan 4 o 5 y si se acaba, el marine muere. Consolas que montan un puente sobre un foso (4 fichas). Solo aparecen Imps. |
| E1M4 *En la superficie, parte 2* | Oxígeno; barreras demoníacas (fichas de Amenaza) que caen al matar a ciertos grupos, que dan Furia; un salto a un nivel inferior (1 punto de movimiento) que retira el mapa anterior; modo difícil opcional con más demonios; final con un Cacodemonio. |

#### Doom - Puesto avanzado Garen (Vidimus)

- **Mapa.** Muchas piezas, entre ellas la 15A ×6, con exploración sala por sala: esclusa, muelle, pasillo,
  laboratorio, control, almacén y contención.
- **Material.** Mazo inicial UAC y Escopeta de combate; mazos de defensa *Seek and Destroy* y *Armored
  Offensive* (otro texto de la misión dice *Savage Strength* y *Seek and Destroy*); carta de Invasión *Imp
  Assault*.
- **Objetivos cambiantes**:
  1. Encontrar supervivientes: una científica escondida en una rejilla. Se lleva como una ficha de Progreso y,
     si su marine muere, cae en su casilla.
  2. Matar al jefe **G'Thrak**: un Imp propio (`CustomMonsterGThrak`) sin tambaleo, con +3 de vida por marine,
     un *Hit & Run* de 4 puntos y una bola de fuego de 1 Argent con +2 de alcance y 1 dado negro, en 4
     activaciones propias.
  3. Escapar antes de que una **cuenta atrás** de unas 5 rondas haga estallar la base, entre una horda de Pinkies
     y Barones.
- **Portales.** Cada color tiene dos grupos que se pueden usar hasta 3 veces cada uno, con sus ganancias de
  Argent.
- **Derrota.** Un contador de bajas manual (una ficha que se pulsa en cada muerte): con 6 gana el invasor.
- **Además.** Una ficha para cambiar de canción.

#### Doom - Laboratorios Alfa (Vidimus)

- **Material.** Objetivo *Containment Protocol* («Protocolo de contención»), amenaza Infestación, carta de
  Invasión *First Strike* («Primer golpe»); mazos *Armored Offensive*, *Seek and Destroy* y *Blood Rush*; mazo
  inicial UAC y Escopeta de combate.
- **Objetivo.** Tres terminales (fichas de Objetivo). Una vez por ronda, un marine adyacente descarta 1 carta
  para poner 1 ficha de Progreso en una; con 2, la terminal queda resuelta.
- **Victoria.** Retirar todas las fichas de Objetivo.
- **Derrota.** 6 bajas: `$%morale=5`, *KO* seguido de *Recuperar* en cada muerte.
- **Además.** Una puerta amarilla con tarjeta de acceso, un muro de fuego (fichas de Amenaza que bloquean el paso
  y la vista), Cañón Gauss, lanzacohetes, motosierra y granada, teletransportadores que hay que activar,
  «portales maestros», un modo de pruebas y los dos modos de activación.

#### Doom - Procesador de plasma (Vidimus)

- **Material.** Objetivo *Priority Escort* («Escolta prioritaria»), amenaza **Asalto**, carta de Invasión «La
  Fuerza de los Malditos»; mazos *Infernal Sorcery*, *Savage Strength* y *Blood Rush*.
- **Mapa.** Piezas 02A, 08A, 10A ×2, 15A ×6 y 16A.
- **Objetivo.** Escoltar a la ingeniera A. Rovenski (ficha `Token_DM_Copy`) hasta la consola (ficha de
  Progreso). Al final de cada ronda, si un marine está junto a ella, puede desplazarla hasta 3 casillas sin tener en
  cuenta el terreno complicado ni las figuras. Al llegar junto a la consola, se gana.
- **Asalto automatizado.** La app gasta por su cuenta las fichas de amenaza al empezar cada ronda: empieza con 3,
  gana 2 por ronda y elige al azar qué portales voltear o en cuáles invocar. Cada muerte de un marine voltea un
  portal rojo.
- **Grupos programados:**
  - Azul: 1 Pinky o 1 Cacodemonio.
  - Amarillo: 1 Cacodemonio y 1 Pinky, o 1 Soldado poseído y 1 Barón.
  - Rojo: 2 Revenants, o 1 Barón y 2 Cacodemonios.
- **Eventos por ronda**:
  - Ronda 3: cada marine descarta 1 carta.
  - Ronda 4: chorros de plasma (fichas de Amenaza) que matan lo que haya debajo.
  - Ronda 7: se apagan los teletransportadores.
  - Ronda 9: las defensas atacan a cada marine con 2 rojos.
  - Ronda 10: la ingeniera, poseída, retrocede tantas casillas como iconos salgan en 2 rojos.
- **Problemas.** La moral desfasada (§10.6).

#### Doom - La apuesta de Hayden (Vidimus)

- **Material.** Objetivo «Eliminar hostiles», amenaza **Horda**, carta de Invasión *Cruel Mayhem* («Caos
  cruel»); mazos *Armored Offensive*, *Power Overwhelming* y *Blood Rush*.
- **Mapa.** Piezas 04A, 05A, 07A, 13A, 14A, 15A ×2 y 16A, a partir del *Hayden's Corridor* de Cypher0117.
- **Victoria.** No queda ningún portal ni demonio.
- **Derrota.** 6 bajas (`$%morale=5`). Además, el invasor gana 1 ficha de Amenaza por ronda y, con 3, se cobra una
  baja automática: el temporizador de la misión.
- **Horda automatizada.** Al final de cada ronda la app abre un portal al azar e invoca. Si no queda ninguno,
  cada carta de demonio boca arriba gana 1 Argent.
- **Además.** Un Mancubus único «de Energía Argent» con vida extra, eventos como un ataque de 2 rojos y 2 negros a
  cada marine, ametralladora, motosierra y lanzacohetes, y los dos modos de activación.

#### Doom - Repliegue (Vidimus)

- **Material.** Objetivo: **aguantar 16 rondas** (misión suicida para cubrir una retirada). Amenaza **Asalto**
  automatizada como en *Procesador*, pero el invasor gana tantas fichas de amenaza por ronda como marines haya.
  Carta de Invasión «La Fuerza de los Malditos»; mazos *Infernal Sorcery*, *Armored Offensive* y *Seek and
  Destroy*.
- **Mapa.** Caras B (el Infierno): 01B, 04B, 06B, 08B, 09B, 10B ×2, 14B y 15B ×4.
- **Derrota.** 6 bajas, según el texto (§10.6).
- **Eventos por ronda**:
  - Ronda 4: misión secundaria «Protocolo Delta», 3 fichas de Objetivo; una es un módulo de datos que cura 3 a
    todos.
  - Ronda 8: el Mancubus único «El Vigilante», con activaciones propias y sin tambaleo.
  - Ronda 9: una falla que retira las piezas 10B y 15B y mata lo que haya encima.
  - Ronda 12: el Ciberdemonio único «Escorbuto», sin tambaleo, que desplaza y daña a quien esté donde aparece.
- **Además.** Granadas de fragmentación y de absorción, motosierra y BFG.

### 11.3 Mecánicas que se repiten

| Mecánica | Misiones |
|---|---|
| Infestación por línea de visión | Tutorial, Misión 1, FOP E1M1-E1M4, *Laboratorios Alfa*, *Garen* |
| Asalto o Horda automatizados por la app | *Procesador de plasma*, *Repliegue* (Asalto); *La apuesta de Hayden* (Horda) |
| Cartas de Amenaza opcionales (modo Horda de aficionados) | Todas |
| 3 Argent por ronda (plantilla) | Tutorial, Misión 1, *Garen*, *Laboratorios Alfa*, *Procesador*, *Hayden*, *Repliegue* |
| Argent por dado al aparecer un grupo | FOP E1M1-E1M4 |
| Tarjetas de acceso y puertas de color | FOP, *Laboratorios Alfa* (y aparcadas en la plantilla de las demás) |
| Jefes únicos o monstruos propios | FOP E1M1 (Zombi, Ruthic), *Garen* (G'Thrak), *Hayden* (Mancubus), *Repliegue* (Vigilante, Escorbuto) |
| Rondas con eventos programados | *Procesador*, *Repliegue*, *Garen* (cuenta atrás), *Hayden*, FOP E1M3-E1M4 (oxígeno) |
| Final manual con botones «Victoria» / «Derrota» | Misión 1; *Laboratorios Alfa* y *La apuesta de Hayden* (además de la derrota por moral) |
| Música propia y botón de música | *Garen*, *Laboratorios Alfa*, *Hayden* |

---

## Fuentes

Consultadas el 11 de octubre de 2026. Las de BGG se leyeron con la API pública de geekdo
(`https://api.geekdo.com/api/…`) porque las páginas web no cargan sin JavaScript.

### Oficiales (FFG / Edge)

- *Learn to Play*: se leyó una copia en línea; las copias subidas por terceros no se enlazan.
- Artículos de presentación de FFG (espejo `drafts`; la web actual de FFG los redirige a su portada):
  - *The Invasion Is Imminent* (28-7-2016): https://drafts.fantasyflightgames.com/en/news/2016/7/28/the-invasion-is-imminent-1/
  - *Rip Them to Shreds* (8-11-2016): https://drafts.fantasyflightgames.com/en/news/2016/11/8/rip-them-to-shreds/
  - *In a Hail of Bullets* (16-11-2016): https://drafts.fantasyflightgames.com/en/news/2016/11/16/in-a-hail-of-bullets/
  - *Journey to Hell* (6-12-2016): https://drafts.fantasyflightgames.com/en/news/2016/12/6/journey-to-hell/
  - Página del producto: https://drafts.fantasyflightgames.com/en/products/doom/
- Textos de la caja española (Edge), reproducidos por tiendas:
  - https://akataka.com/producto/doom-el-juego-de-tablero/
  - https://egdgames.com/producto/doom-el-juego-de-tablero
  - https://turolgames.com/es/tablero/43826-doom-el-juego-de-tablero
- Anuncio de la edición española: https://consolaytablero.com/2017/01/21/doom-el-juego-de-tablero-a-la-venta-en-el-primer-trimestre-del-ano/

### Resúmenes y referencias

- The Esoteric Order of Gamers: resumen de reglas v1 (agosto de 2017), en su web, orderofgamers.com.
- Doom Wiki: https://www.doomwiki.org/wiki/Doom:_The_Board_Game

### BoardGameGeek

- Ficha del juego (205317): https://boardgamegeek.com/boardgame/205317/doom-the-board-game (API `geekitems?objectid=205317&objecttype=thing`)
- *Valkyrie Mod* de Neuntoter (fichero 253899, `DooM.zip`): https://boardgamegeek.com/filepage/253899/valkyrie-mod (API `filepage/253899/file`; usuario 1018634)
- Hilos (prefijo `https://api.geekdo.com/api/articles?threadid=`):

| Hilo | Tema |
|---|---|
| 3015323 (páginas 1 a 5) | *Doom 2016 mod for Valkyrie*: historia del pack, cambios de reglas, versiones e instalación |
| 1869347 | Equilibrio de las 12 misiones |
| 1741709 | *Tooth and Claw 101*: estrategia del invasor, defensas especiales y mazos de evento |
| 1725104 | Armas iniciales |
| 1691090 | *Solo Operative* y ejecuciones |
| 2714831 | Argent por figura |
| 1695963 | Invocación e iniciativa con Infestación |
| 2923672 | Partidas con menos de 4 marines |

- Ficheros de aficionados (API `filepages/<id>` y `filepage/<id>/file`):
  - 144680 *Doom Horde Mode - Full Co-op*.
  - 178835 *Custom Doom: The Board Game Maps* (Cypher0117).
  - 142012 *Garen Outpost (Ground Floor)*.
  - 167153 *Hurt Me Plenty Edition*.
  - 178497 *Modo Horda cooperativo* (en español).
  - Listado completo: API `files?objectid=205317&objecttype=thing`.
- El PDF del modo Horda (Mark Thomas, v0.1, 9-3-2017) está en el fichero 144680 de BGG.

### Reseñas

- RPGnet: reseña del juego (archivo de reseñas, n.º 17557), con las caras de los dados.
- Geeks Under Grace: https://www.geeksundergrace.com/tabletop/reviews-tabletop/review-doom-board-game-2016/
- PC Gamer: https://www.pcgamer.com/doom-the-board-game-faithfully-adapts-the-shooter-into-a-turn-based-bloodbath/
- NAG: https://www.nag.co.za/2017/01/19/review-doom-the-board-game/
- Tematicoops (en español): https://tematicoops.wordpress.com/2017/04/07/resena-doom/
- La BSK, primeras impresiones (en español): https://labsk.net/index.php?topic=191298.0

### Valkyrie, tienda y misiones (ficheros locales)

- Repositorio de Valkyrie: https://github.com/NPBruce/valkyrie (commit `752d4206738f00a6d41e34be56fe7e65e7b35965`).
  - Leídos: `Quest/RoundController.cs`, `HeroDialog.cs`, `MonsterDialog.cs`, `ActivateDialog.cs`,
    `EventManager.cs`, `Quest.cs` (`AdjustMorale`), `TokenBoard.cs`, `SkillWindow.cs` y `SetWindow.cs`;
    `Game.cs` (`EndSelection`), `GameType.cs`, `Content/QuestData.cs`, `Content/DictionaryI18n.cs` y
    `StreamingAssets/text/Localization.*.txt`.
- Tienda: `valkyrie-store/D2E/manifestDownload.ini` (secciones `Doom_*`) y `contentPacksManifestDownload.ini`
  (sección `DooM`).
- Pack: el paquete `DooM` de la lista de packs de la comunidad de valkyrie-store (repositorio
  `Neuntoter82/Doom_2016_Mod`), leído en local.
- Misiones (las direcciones `url` de la tienda):
  - Neuntoter: `Neuntoter82/Doom_Mission_1`, `FOP_E1M1`, `FOP_E1M2`, `FOP_E1M3` y `FOP_E1M4`.
  - Vidimus: `vidimus/Doom_Tutorial`, `Doom_Puesto_Garen`, `Doom_Laboratorios_Alfa`, `Doom_Procesador_plasma`,
    `Doom_Apuesta_Hayden` y `Doom_Repliegue`.

### Consultadas sin resultado útil

- **Rules Reference, Operation Guide y FAQ oficiales.** No se encontraron:
  - La web actual de FFG no tiene página de DOOM con descargas.
  - Su archivo de documentos solo guarda los PDF del DOOM de 2004.
  - No consta ninguna FAQ ni fe de erratas oficial.
- **Archive.org**: bloqueado desde este entorno.
- **Descargas directas** con `curl` desde orderofgamers.com y otras webs: denegadas por el proxy. Se leyeron
  con WebFetch.
- **BGG por su web normal**: error; se usó la API. Los PDF de los ficheros de BGG no se pueden descargar sin
  sesión.
- **Steam Workshop** (mods de Tabletop Simulator de DOOM 2016, uno con contenido de *Eternal* de aficionados),
  Thingiverse y eBay: error al leer.
- **e-Raptor**: no detalla cuántas figuras hay de cada tipo.
- **brettspiele-report.de y mk-rpg.org.uk**: tratan el DOOM de 2004 y se descartaron.
- **Web de Neuntoter** (`doom-valkyrie.ddns.net`): robots.txt impide leerla.
- **Búsquedas sin respuesta**:
  - El número de figuras de cada demonio.
  - Las estadísticas completas de las cartas de demonio.
  - Los efectos de *Taking Point* y *Combat Veteran*.
  - Los nombres oficiales en español de las cartas de Invasión, de evento, de objetivo y de las misiones.
