# Productos y expansiones de Las Mansiones de la Locura 2ª ed. (y cómo los trata Valkyrie)

Qué trae cada caja, qué reglas nuevas añade, qué monstruos e investigadores existen y con qué ID se
usan en Valkyrie. Los datos de juego (estadísticas, IDs) salen del repositorio de Valkyrie
(octubre de 2026); son de la comunidad, útiles pero no oficiales.

- **(sin verificar)**: dato no confirmado en una fuente oficial ni en dos independientes.
- **(fuente única)**: una sola fuente no oficial pero fiable.
- Lista completa de IDs de losetas, fichas, objetos y audio: `catalogo.md` (o `scripts/buscar.py`).

## Índice

- [0. Resumen rápido](#0-resumen-rápido)
- [1. Cómo trata Valkyrie estos productos (lo esencial para la skill)](#1-cómo-trata-valkyrie-estos-productos-lo-esencial-para-la-skill)
- [2. Glosario oficial español ↔ inglés](#2-glosario-oficial-español--inglés)
- [3. MAD20: juego base](#3-mad20-juego-base)
- [4. Kit de conversión (incluido en la caja base)](#4-kit-de-conversión-incluido-en-la-caja-base)
- [5. MAD21: Recurring Nightmares / Pesadillas Recurrentes](#5-mad21-recurring-nightmares--pesadillas-recurrentes)
- [6. MAD22: Suppressed Memories / Recuerdos Reprimidos](#6-mad22-suppressed-memories--recuerdos-reprimidos)
- [7. MAD23: Beyond the Threshold / Más Allá del Umbral](#7-mad23-beyond-the-threshold--más-allá-del-umbral)
- [8. MAD25: Streets of Arkham / Calles de Arkham](#8-mad25-streets-of-arkham--calles-de-arkham)
- [9. MAD26: Sanctum of Twilight / El Santuario del Crepúsculo](#9-mad26-sanctum-of-twilight--el-santuario-del-crepúsculo)
- [10. MAD27: Horrific Journeys / Viajes Escalofriantes](#10-mad27-horrific-journeys--viajes-escalofriantes)
- [11. MAD28: Path of the Serpent / La Senda de la Serpiente](#11-mad28-path-of-the-serpent--la-senda-de-la-serpiente)
- [12. Otros productos y contenido digital](#12-otros-productos-y-contenido-digital)
- [13. Mecánicas por las que se preguntó: qué existe y qué no](#13-mecánicas-por-las-que-se-preguntó-qué-existe-y-qué-no)
- [14. Lista consolidada de monstruos (40 tipos y 85 figuras)](#14-lista-consolidada-de-monstruos-40-tipos-y-85-figuras)
- [15. Lista consolidada de investigadores (40)](#15-lista-consolidada-de-investigadores-40)
- [16. Lista consolidada de escenarios oficiales](#16-lista-consolidada-de-escenarios-oficiales)
- [17. Lagunas y datos dudosos](#17-lagunas-y-datos-dudosos)
- [Fuentes](#fuentes)

## 0. Resumen rápido

| Código | ID en Valkyrie | Nombre en inglés | Nombre en español (Edge / FFG España) | Año EN / ES | Tipo | Contenido principal | Escenarios de la app |
|---|---|---|---|---|---|---|---|
| MAD20 | `MoMBase` | Mansions of Madness: Second Edition | Las Mansiones de la Locura (Segunda Edición) | 2016 (agosto) / 2016 (noviembre) | Juego base | 8 investigadores, 24 monstruos (9 tipos), 24 losetas de doble cara, kit de conversión | 4 (más DLC de pago) |
| MAD21 | `RN` (activa `MoM1ET MoM1EM MoM1EI MoM1CK`) | Recurring Nightmares: Figure and Tile Collection | Pesadillas Recurrentes | 2016 (otoño) / 2017 (sin verificar) | Colección de figuras y losetas | 8 figuras de investigador, 18 monstruos (8 tipos), 15 losetas dobles de la 1ª edición base | 1: *Dearly Departed* |
| MAD22 | `SM` (activa `FAM CotWM FAI CotWI FAT CotWT`) | Suppressed Memories: Figure and Tile Collection | Recuerdos Reprimidos | 2016 (otoño) / 2017 (sin verificar) | Colección de figuras y losetas | 8 figuras de investigador, 15 monstruos (9 tipos), 17 losetas dobles de *Forbidden Alchemy* y *Call of the Wild* | 1: *Cult of Sentinel Hill* |
| MAD23 | `BtT` | Beyond the Threshold | Más Allá del Umbral | 2017 (enero) / 2017 (julio) | Expansión pequeña | 2 investigadores, 4 Thrall, 6 losetas | 2 |
| MAD24 | (ninguno) | Mansions of Madness Dice Pack | Set de dados de Mansiones de la Locura | 2017 (sin verificar) | Accesorio | 6 dados según Edge | ninguno |
| MAD25 | `SoA` | Streets of Arkham | Calles de Arkham | finales de 2017 / 2018 (junio) | Expansión grande | 4 investigadores, 7 monstruos (4 tipos), 17 losetas | 3 |
| MAD26 | `SoT` | Sanctum of Twilight | El Santuario del Crepúsculo | 2018 (19 de abril) / 2018 (octubre) | Expansión pequeña | 2 investigadores, 2 Wraith, 5 losetas | 2 |
| MAD27 | `HJ` | Horrific Journeys | Viajes Escalofriantes | 2018 (29 de noviembre) / finales de 2018 o principios de 2019 (sin verificar) | Expansión grande | 4 investigadores, 7 monstruos (4 tipos), 18 losetas | 3 |
| MAD28 | `PotS` | Path of the Serpent | La Senda de la Serpiente | 2019 (1 de noviembre) / finales de 2019 | Expansión grande | 4 investigadores, 8 monstruos (4 tipos), 17 losetas | 3 |
| (dentro de MAD20) | `MoM1CK` y 9 paquetes más (ver §4) | First Edition Conversion Kit | Kit de conversión (de la primera edición) | 2016 | Kit de conversión, sin figuras | 16 cartas de investigador, 33 indicadores de monstruo, 4 fichas de personaje, 2 objetos únicos | ninguno propio |

Los productos de la 1ª edición que el kit de conversión permite usar son:

- **MAD01**, *Mansions of Madness* (1ª edición, 2011), en español *Las Mansiones de la Locura*, publicada por Edge en julio de 2011.
- **MAD06**, *Forbidden Alchemy* (2011), en español *Alquimia Prohibida*.
- **MAD09**, *Call of the Wild* (2013), en español *La Llamada de lo Salvaje*.

Valkyrie traduce sus tipos de paquete así: "Caja de Expansión" (box), "Colección de Figuras y Tableros" (ft) y "Kit de Conversión" (ck).

---

## 1. Cómo trata Valkyrie estos productos (lo esencial para la skill)

Datos comprobados en el código y en la wiki de Valkyrie:

1. **Expansiones requeridas.** Se declaran en `quest.ini`, sección `[Quest]`, con `packs=` y una lista de IDs separados por espacios. Si al jugador le falta alguno, el escenario aparece como no disponible (o se filtra). En el editor el campo se llama "Required Expansions".
2. **IDs válidos:**
   - Paquetes de caja: `MoMBase`, `BtT`, `SoA`, `SoT`, `HJ`, `PotS`.
   - Colecciones de figuras y losetas: `RN`, `SM`.
   - Kit de conversión: `MoM1CK`, `MoM1ET`, `MoM1EI`, `MoM1EM`, `FAT`, `FAI`, `FAM`, `CotWT`, `CotWI`, `CotWM`. La letra final indica el contenido: T = losetas, I = investigadores, M = monstruos. CK son las fichas y los objetos del kit.
   - `MoMBase` es el paquete base y siempre está cargado.
3. **`RN` y `SM` clonan paquetes.** Activar `RN` carga también `MoM1ET`, `MoM1EM`, `MoM1EI` y `MoM1CK`. Activar `SM` carga `FAM`, `CotWM`, `FAI`, `CotWI`, `FAT` y `CotWT`. Por eso la wiki recomienda no poner `RN` ni `SM` en `packs=` y usar los IDs desglosados. Así puede jugar tanto quien tiene la colección de 2ª edición como quien tiene la 1ª edición física más el kit.
4. **Alias del formato antiguo.** En escenarios con formato anterior al 17, `MoM1E` equivale a `MoM1ET MoM1EI MoM1EM`, `FA` a `FAT FAI FAM` y `CotW` a `CotWT CotWI CotWM`.
5. **Ramas opcionales por expansión.** Valkyrie define una variable de solo lectura `#<ID>` que vale 1 si el paquete está activo (por ejemplo `#HJ` o `#PotS`). Sirve para crear contenido opcional sin exigir la expansión.
6. **Aparición de monstruos (Spawn).** El campo `monster=` admite una lista y Valkyrie usa el primero disponible (comprobado en `Quest.AttemptMonsterMatch`). Conviene poner primero el monstruo de expansión y después uno de reserva del juego base. También se puede pedir un monstruo aleatorio por rasgos con `traits=` (debe cumplir todos) o `traitpool=` (basta con uno); en ese caso la lista de `monster=` pasa a ser de **exclusiones**. El sorteo por rasgos solo elige entre los monstruos de las expansiones que el jugador tiene activadas.
7. **Equivalencia de puzles** (comprobada en `EventManager.cs` y `PuzzleSlide.cs`):

   | Clase en Valkyrie | Puzle de FFG | Nombre oficial en español |
   |---|---|---|
   | `slide` | *Lock* (bloques que se deslizan para sacar la pieza objetivo por la derecha) | **Mecanismo** |
   | `image` | *Slide* (recomponer una imagen intercambiando piezas adyacentes) | **Mosaico** |
   | `code` | *Code* | **Código** |
   | `tower` | *Tower* (Calles de Arkham) | Torre (sin verificar) |

   Los puzles *Line* (Viajes Escalofriantes) y *Ring* (La Senda de la Serpiente) **no están implementados** en Valkyrie: solo existen las cuatro clases de la tabla.

   Imágenes de puzle de mosaico incluidas en el paquete base de Valkyrie: `PuzzleOldJournal`, `PuzzleRitualRunes`, `PuzzleStatue`, `PuzzleTheUsualSuspects` (4x2), `PuzzleWire3x3`, `PuzzleWire4x2`, `PuzzleStarsofHades3x3`, `PuzzleTarotDeath4x2`.
8. **Fichas de tablero de expansión que existen en Valkyrie:**
   - `TokenRift` y `TokenWater` (HJ).
   - `TokenOvergrowth`, `TokenRubble`, `TokenTempleDoor`, `TokenTempleDoor2`, `TokenTempleWall` y `TokenTempleWall2` (PotS).

   **No hay** fichas de Contención/Restraint (SoT), Llave/Key (BtT) ni Mejora/Improvement (SoA). Valkyrie tampoco lleva la cuenta de los Estados (cartas de condición). Esas mecánicas se indican con texto en los eventos.
9. **Losetas que se mueven o se superponen** (BtT, SoT, HJ). Las losetas de Valkyrie tienen posición `x`, `y` y `rotation`, y los eventos pueden añadir y quitar componentes con `add` y `remove`. Para "mover" una loseta, se quita y se añade otra copia del mismo lado en la nueva posición. Esto es una sugerencia de diseño, no una función nativa.
10. **Textos oficiales.** Los nombres de monstruos, objetos e investigadores son claves `{ffg:...}` que Valkyrie importa de la app oficial de FFG. Con Valkyrie en español deberían verse los nombres oficiales en español (según el código de importación de Valkyrie; no lo he comprobado ejecutándolo).
11. **Error en la wiki de Valkyrie.** El ejemplo de `User-settings` dice que `SoT` es Streets of Arkham. Es incorrecto: **`SoA` = Streets of Arkham (MAD25)** y **`SoT` = Sanctum of Twilight (MAD26)**.
12. **Horror de Dunwich.** En Valkyrie tiene una única activación escrita a mano. Sus textos de tirada de Horror y de ataque se cargan del escenario oficial *Cult of Sentinel Hill* (prefijo `csh:`), así que tiene poco contenido genérico.
13. **Vida de los monstruos.** Valkyrie la calcula como `health + healthperhero × número de investigadores`. En los ficheros de SoA y HJ hay un comentario "Todo: monster health", así que la vida de esos monstruos puede ser provisional.
14. **Categorías de ataque.** Los textos de ataque se eligen por tipo de ataque y categoría del monstruo:
    - Tipos de ataque: `bladed`, `firearm`, `heavy`, `spell`, `unarmed`.
    - Categorías: `humanoid`, `beast`, `spirit` (base), `fleshless` (introducida con el Esqueleto de SoA) y `snakeperson` (hombres serpiente de PotS). El Horror de Dunwich usa una categoría especial, `horror`.
    - Otros rasgos de monstruo usados en los datos: `small` y `undead`.
15. **Rasgos de objeto en Valkyrie** (útiles para dar objetos aleatorios por rasgo): `common`, `unique`, `weapon`, `firearm`, `heavyweapon`, `bladedweapon`, `spell`, `spellattack`, `spelldefence`, `lightsource`, `tome`, `relic`, `equipment`, `evidence`, `key`, `ally`, `elixir`.
16. **Variables de los Mitos.** Valkyrie trae los eventos de los Mitos genéricos de la app y los filtra con variables:
    - Intensidad: `$mythosMinor`, `$mythosMajor`, `$mythosDeadly`, `$mythosHelp`, `$mythosFlavor`.
    - Lugar: `$mythosIndoors`, `$mythosOutdoors` y habitaciones concretas como `$mythosLibrary`, `$mythosExhibit` o `$mythosClassroom`.
    - Otros: `$mythosDarkness`, `$mythosKey` y `$fire`.

---

## 2. Glosario oficial español ↔ inglés

Fuente: Guía de referencia en español (Edge / FFG España). Los términos de expansión vienen de las fichas de producto de fantasyflightgames.es.

| Español (oficial) | Inglés |
|---|---|
| Indicador de monstruo | Monster token |
| **Percepción** (número verde) | Awareness |
| **Horror** (número azul) | Horror rating |
| **Agresividad** (número rojo, reverso) | Brawn |
| **Vida** / **Cordura** | Health / Sanity |
| Fuerza, Agilidad, Observación, Saber, Influencia, Voluntad | Strength, Agility, Observation, Lore, Influence, Will |
| Movimiento, Búsqueda, Exploración, Intercambio, Interacción, Ataque | Move, Search, Explore, Trade, Interact, Attack |
| Empujar, Prender fuego, Robar (acciones poco habituales) | Push, Set Fire, Steal |
| Tirada de evasión / Tirada de Horror | Evade check / Horror check |
| Renunciar | Forfeit |
| Pertenencias | Possessions |
| Alcance (3 espacios) | Range |
| Borde infranqueable | Impassable border |
| Módulo de tablero | Map tile |
| Ficha de Búsqueda / Interacción / Exploración / **Vistazo** / **Personaje** | Search / Interact / Explore / **Sight** / **Person** token |
| Pista | Clue |
| Fuego, Oscuridad, **Obstrucción**, Pasadizo secreto, Pared, Puerta | Fire, Darkness, **Barricade**, Secret Passage, Wall, Door |
| Objeto común, Objeto único, Hechizo, Estado, Daño, Horror | Common Item, Unique Item, Spell, Condition, Damage, Horror |
| Herido, Loco, Aturdido, **Desconcertado**, Retenido, **Concentrado** | Wounded, Insane, Stunned, **Dazed**, Restrained, **Focused** |
| Fuente de luz, **Prueba**, Arma de fuego, Llave (rasgos) | Light Source, **Evidence**, Firearm, Key |
| Rasgos (por ejemplo Acuático, Volador, Humanoide) | Traits (Aquatic, Flying, Humanoid) |
| Monstruo único / Personaje único | Unique monster / unique person |
| Fase de los Investigadores / Fase de los Mitos | Investigator Phase / Mythos Phase |
| Evento de los Mitos / Activación de monstruos | Mythos event / Monster activation |
| Cajón de monstruos | Monster drawer (en la app) |
| Rompecabezas: Mosaico / Código / Mecanismo; paso de rompecabezas | Puzzles: Slide / Code / Lock; puzzle step |
| Éxito / Investigación (resultados de dado) | Success / Investigation (dice results) |
| Duque (perro de "Ashcan" Pete) | Duke |
| Fichas de **Llave** (Más Allá del Umbral) | Key tokens |
| Cartas de **Elixir**, fichas de **Mejora** (Calles de Arkham) | Elixir cards, Improvement tokens |
| Fichas de **Contención** (El Santuario del Crepúsculo) | Restraint tokens |
| Fichas de **Grieta/Agua**, cartas de **Plan** (Viajes Escalofriantes) | Rift/Water tokens, Agenda cards |
| Fichas de **Maleza/Escombros** (La Senda de la Serpiente) | Overgrowth/Rubble tokens |
| "Perdido en el tiempo y el espacio" (sin verificar como término oficial) | Lost in Time and Space |

---

## 3. MAD20: juego base

**Nombres:** *Mansions of Madness: Second Edition* / *Las Mansiones de la Locura (Segunda Edición)*. Código Edge FFMAD20, EAN 8435407610705.

**Lanzamiento:** agosto de 2016 en inglés; noviembre de 2016 en español.

**Diseño:** Nikki Valens. Los escenarios de la app son de Kara Centell-Dunk y Andrew Fischer.

**Funcionamiento:** juego cooperativo de 1 a 5 jugadores, de 2 a 3 horas. Una app gratuita hace de guardián: genera el mapa, los Mitos, los monstruos y los puzles, y no hay jugador enemigo.

### Contenido
- **8 investigadores** (carta y figura): Agatha Crane (The Parapsychologist), Carson Sinclair (The Butler), Father Mateo (The Priest), Minh Thi Phan (The Secretary), Preston Fairmont (The Millionaire), Rita Young (The Athlete), Wendy Adams (The Urchin) y William Yorick (The Gravedigger).
- **24 monstruos** (figura e indicador) de 9 tipos: Cultist ×6, Deep One ×4, Deep One Hybrid ×4, Ghost ×2, Riot ×2, Star Spawn ×2, Hunting Horror ×2, Child of Dagon ×1 (único) y Priest of Dagon ×1 (único). Hay estadísticas en §14.
- **24 módulos de tablero de doble cara.** En Valkyrie son 48 caras: Alley1, Alley2, AlleyCorner1, AlleyCorner2, AlleyEnd, Attic, Ballroom, Basement, Bathroom, Beach, Bedroom1, Bedroom2, BellTower, BilliardsRoom, Conservatory, DiningRoom, Dock1, Dock2, EntryHall, FleaMarket, Hall1, Hall2, HallCorner1, HallCorner2, HallEnd, HallStairs, HouseBoat, InteriorHall, Library, Lobby, Lounge, Office, ParkPond, Pier, RentalDock, RootCellar, Storefront, Street1, Street2, StreetCorner1, StreetCorner2, StreetCorner3, Study, ToolShed, TownSquare, Warehouse, Yard1 y Yard2. Todas con prefijo `TileSide`.
- **Cartas:**
  - 40 Objetos comunes.
  - 24 Objetos únicos (incluyen Duke y Flux Stabilizer, que son del kit de conversión).
  - 30 Hechizos: Feed the Mind, Flesh Ward, Instill Bravery, Shriveling, Wither y Wrack, 5 de cada.
  - 37 Estados: Dazed ×5, Focused ×5, Insane ×12, Restrained ×5, Stunned ×5 y Wounded ×5.
  - 40 de Daño y 40 de Horror.
- **Fichas:** 16 de Búsqueda/Interacción, 16 de Exploración/Vistazo, 22 de Personaje, 4 de Obstrucción, 4 de Pasadizo secreto, 18 de Fuego/Oscuridad, 8 de Pared, 4 de Puerta, 26 de Pista y 6 de identificación (ID), además de 5 dados.
- Guía para aprender a jugar, Guía de referencia y **kit de conversión** (ver §4).
- **Fichas de Valkyrie del base:** `TokenSearch`, `TokenInteract`, `TokenExplore`, `TokenSight`, `TokenClue`, `TokenDarkness`, `TokenFire`, `TokenBarricadeInside`/`Outside`, `TokenDoorInside`/`Outside`, `TokenSecretInside`/`Outside`, `TokenSewer`, `TokenTrapdoor`, `TokenWallInside`/`Outside` (y variantes `Green`), `TokenInvestigators`, personajes genéricos de 8 colores (hombre y mujer), `TokenDog`, `TokenCat` y personajes con nombre: Richard, Mildred, Howard y Grace Bechman, Agent Craven, Eugene Clemens, Joyce Little, Sylvia Marsh, Bobby Foster, Victor Blake, Zadok Allen (`TokenZadocAllen`, con c), Othera Gilman y Edna Hughes. Sewer y Trapdoor son fichas de Valkyrie; la Guía de referencia no las define como regla. Lista completa en `catalogo.md`.

### Reglas base que conviene tener presentes al diseñar
- **Turno.** Cada investigador hace 2 acciones en cualquier orden: mover hasta 2 espacios, explorar, buscar, intercambiar, interactuar, atacar, acciones de componente (las que empiezan por "Acción" en una carta) y las acciones poco habituales (Empujar, Prender fuego, Robar). El movimiento se puede interrumpir para hacer otra acción. Resolver una ficha de Vistazo no cuesta acción.
- **Evasión.** Si un investigador está en el espacio de un monstruo e intenta salir o hacer algo que no sea atacar o moverse, tiene que evadir al monstruo de mayor Percepción. Si falla, renuncia a la acción. El movimiento involuntario no obliga a evadir.
- **Fase de los Mitos.** Hay un evento de los Mitos, se activan los monstruos y cada investigador hace una tirada de Horror contra el monstruo de mayor Horror que tenga a su alcance (3 espacios).
- **Ataque.** El jugador elige el tipo de ataque (pesado, de filo, de fuego, hechizo o desarmado) y la app indica la tirada. Cuerpo a cuerpo solo se ataca en el mismo espacio; a distancia, hasta el alcance. El monstruo se descarta cuando el daño iguala su Vida, que solo muestra la app.
- **Daño y Horror.** Se roban cartas. Las de "resolver inmediatamente" se resuelven y quedan boca abajo; las de "mantener boca arriba" tienen efecto continuo.
  - Si el daño llega a la Vida, el investigador queda **Herido**: no puede moverse más de una vez por ronda.
  - Si el horror llega a la Cordura, queda **Loco**. La carta de Loco es secreta y puede cambiar su forma de ganar o perder.
  - Volver a llegar al límite en ese estado lo **elimina**. Tras una eliminación, los demás tienen una fase más para completar la investigación o pierden.
- **Fuego.** Entrar en un espacio con fuego, actuar en él o renunciar a una acción allí cuesta 1 daño boca abajo. Los monstruos sufren 1 daño al entrar o al empezar su activación en fuego. Se apaga con una tirada de Agilidad (un fuego por éxito). Se extiende a un espacio adyacente en cada fase de los Mitos, pero no atraviesa paredes (FAQ).
- **Oscuridad.** En un espacio oscuro no se pueden gastar pistas para convertir resultados ni para dar pasos extra de puzle. Se ignora si hay una fuente de luz o fuego en el espacio o en uno adyacente.
- **Obstrucción.** Bloquea una puerta. Quitarla requiere 2 éxitos en una tirada de Fuerza (investigador) o tirar dados iguales a la Agresividad (monstruo).
- **Pasadizos secretos.** Todos los espacios con pasadizo son adyacentes entre sí, pero el alcance no se cuenta a través de ellos.
- **Puzles.** Cada investigador puede dar tantos pasos como su atributo; cada pista gastada da un paso extra (no en la oscuridad). Los investigadores pueden comentar el puzle entre ellos.
- **Fichas de ID.** Distinguen a varios monstruos del mismo tipo. **Fichas de Personaje:** genéricas (silueta) o únicas (con nombre).
- **Interior y exterior.** Cada loseta es interior o exterior. Algunos efectos usan esa distinción, por ejemplo eventos de los Mitos o habilidades como la de Norman Withers.
- **Victoria y derrota.** Se gana completando la investigación; el objetivo se revela a medida que se avanza. Se pierde si el tiempo o la amenaza llegan al final según la app.

### Escenarios oficiales del base

Los nombres en español de los escenarios salen de fichas bibliográficas y blogs: compruébalos en la
app oficial antes de citarlos en un texto.

| Inglés | Español | Dificultad | Duración | Premisa |
|---|---|---|---|---|
| Cycle of Eternity | El ciclo de la eternidad | 2/5 | 60-90 min | Una serie de desapariciones lleva a la finca Vandelbilt, sede de un club privado de astronomía. Es el escenario de aprendizaje. |
| Escape from Innsmouth | Huida de Innsmouth | 4/5 | 90-150 min | Los investigadores han enfurecido a un enemigo poderoso en Innsmouth y tienen que sobrevivir a la noche, descubrir la verdad y escapar. |
| Shattered Bonds | Lazos inquebrantables | 5/5 | 120-180 min | Algo acecha a la familia Bechman y hay que reparar los lazos que antes protegían el mundo. |
| Rising Tide | Marea creciente | 3/5 | 240-360 min | Un ritual inminente en Innsmouth y una carta con seis sospechosos: hay que averiguar quiénes son los culpables y qué buscan. Es mucho más de investigación que de combate. |

Los escenarios DLC de pago que solo necesitan el base están en §12.

---

## 4. Kit de conversión (incluido en la caja base)

**Qué es.** Material de cartón y cartas para usar las figuras y losetas de la 1ª edición. **No trae figuras**: hay que tener los productos de 1ª edición o las colecciones MAD21 y MAD22.

**Contenido:**
- **16 cartas de investigador** con formato de 2ª edición.
- **33 indicadores de monstruo** para 17 tipos; las cultistas de la 1ª edición no se incluyen porque el base ya trae 6.
- **4 fichas de Personaje**, útiles solo si se tiene *Call of the Wild*. En Valkyrie son Ammi Pierce, Corrina Jones, Eric Colt y Zebulon Whateley.
- **2 objetos únicos:** **Duke** (Duque), el perro de "Ashcan" Pete, con rasgos `ally unique` en Valkyrie, y **Flux Stabilizer**. Probablemente el objeto inicial de Kate Winthrop (sin verificar).

**Cómo se identifica.** Cada componente lleva un símbolo de origen: una llave (1ª edición base), un matraz (*Forbidden Alchemy*) o una luna creciente (*Call of the Wild*).

**Uso en la app.** Se activan los productos en el gestor de colección (More → My Collection). A partir de ahí la app los mezcla en los mapas, monstruos e investigadores de todos los escenarios.

**Losetas de 1ª edición.** No llevan marca de interior o exterior, así que el encarte trae la lista de cuáles son de cada tipo. La FAQ corrige que Rooftop y Spruce Grove son de **exterior**.

**Paquetes de Valkyrie:**

| ID | Contenido |
|---|---|
| `MoM1CK` | Fichas y objetos del kit |
| `MoM1EI` / `MoM1EM` / `MoM1ET` | Investigadores, monstruos y losetas de la 1ª edición base (MAD01) |
| `FAI` / `FAM` / `FAT` | Investigadores, monstruos y losetas de *Alquimia Prohibida* (MAD06) |
| `CotWI` / `CotWM` / `CotWT` | Investigadores, monstruos y losetas de *La Llamada de lo Salvaje* (MAD09) |

**Productos de 1ª edición que el kit no cubre.** Los escenarios de impresión bajo demanda de la 1ª edición (*Season of the Witch*, *The Silver Tablet*, *Til Death Do Us Part*, *House of Fears*, *The Yellow Sign*, *The Laboratory*) no tienen soporte en el kit ni en la app de 2ª edición, según Wikipedia y las listas oficiales consultadas.

---

## 5. MAD21: Recurring Nightmares / Pesadillas Recurrentes

**Tipo:** colección de figuras y losetas. Trae plástico y losetas, pero **no** cartas ni indicadores: esos están en el kit de conversión de la caja base.

**Lanzamiento:** otoño de 2016, a 49,95 USD. Hoy está descatalogado. En español, Edge, a unos 49,90 € (EAN 8435407612662).

**Reproduce:** la 1ª edición base (MAD01).

**Contenido:**
- **8 figuras de investigador:** Michael McGlen, Sister Mary, Gloria Goldberg, "Ashcan" Pete, Harvey Walters, Joe Diamond, Kate Winthrop y Jenny Barnes.
- **18 figuras de monstruo** de 8 tipos: Zombie ×4, Cthonian ×2, Mi-Go ×2, Maniac ×2, Cult Leader ×2, Shoggoth ×2, Witch ×2 y Hound of Tindalos ×2.
- **15 losetas de doble cara** (30 caras en Valkyrie): AtticLoft, BasementLanding, Cave1, Cave2, CeremonyRoom, Chapel, Chasm, CornerHallway, Crypt, DiningRoom1E, Foyer, FrontPorch, FrontYard, FurnaceRoom, Gallery, Garden, Graveyard, GuestBedroom, Hallway1 a Hallway4, Laboratory, Library1E, MasterBedroom, Nursery, RootCellar1E, SecretPassage, StorageShed y TowerRoom.

**Reglas nuevas:** ninguna. Solo añade componentes. Hay monstruos con rasgos especiales en el indicador (ver §14):
- Hound of Tindalos: *Phasing*, atraviesa paredes y bordes infranqueables.
- Mi-Go: *Flying*.
- Maniac: *Unstoppable*, especialmente eficaz al romper obstrucciones.

**Escenario: *Dearly Departed*** (nombre en español no encontrado).
- Desaparecen cadáveres de depósitos y tumbas recientes; el peor caso es el cementerio de Hangman's Hill, donde los muertos vuelven como cadáveres animados.
- Se empieza ante una capilla. Es exigente: dificultad 5/5 (tesera.ru y una crónica de partida en Goodreads) y unos 120-150 minutos (fuente única: tesera.ru).
- Se desbloquea con RN **o** con la 1ª edición base más el kit de conversión.
- *Suppressed Memories*, *Forbidden Alchemy* o *Call of the Wild* añaden variedad de mapas.

---

## 6. MAD22: Suppressed Memories / Recuerdos Reprimidos

**Tipo:** colección de figuras y losetas.

**Lanzamiento:** otoño de 2016, a 49,95 USD. En español, Edge, EAN 8435407612686, probablemente en 2017 (sin verificar).

**Reproduce:** *Forbidden Alchemy* (MAD06) y *Call of the Wild* (MAD09).

**Contenido:**
- **8 figuras de investigador:**
  - De *Forbidden Alchemy* (`FAI`): Carolyn Fern, Darrell Simmons, Dexter Drake y Vincent Lee.
  - De *Call of the Wild* (`CotWI`): Amanda Sharpe, Bob Jenkins, Mandy Thompson y Monterey Jack.
- **15 figuras de monstruo** de 9 tipos:
  - De *Forbidden Alchemy* (`FAM`): Byakhee ×2 y Crawling One ×2.
  - De *Call of the Wild* (`CotWM`): Child of the Goat ×2, Dark Druid ×2, Goat Spawn ×2, Nightgaunt ×2, Dark Young ×1, Dunwich Horror ×1 (único) y Wizard ×1 (único).
- **17 losetas de doble cara:**
  - 6 de *Forbidden Alchemy* (`FAT`): Cave3, GeneratorRoom, Graveyard2, Greenhouse, Hallway5, HiddenLaboratory, MedicalStorage, Morgue, ObservationRoom, OfficeFA, OperatingTheater y Rooftop.
  - 11 de *Call of the Wild* (`CotWT`): AbandonedShack, Barn, Campsite, CaveBend, CaveEntrance, CoveredBridge, HillTop, Marshland, OldForest, OldOak, OldWell, Outhouse, PigPen, Pond, RitualSite, RiverBend, RiverRapids, RottedPorch, Scarecrow, SpruceGrove, TortureChamber y Waterwheel.

**Reglas nuevas:** ninguna. Byakhee y Nightgaunt tienen el rasgo *Flying*.

**Escenario: *Cult of Sentinel Hill*** (nombre en español no encontrado).
- Los investigadores empiezan presos en una mazmorra en lo alto de Sentinel Hill, en Dunwich, y se cruzan con Zebulon Whateley. Hay presión de tiempo para frustrar el plan de la secta.
- Dificultad 3/5, 120-150 minutos (fuente única: tesera.ru).
- Se desbloquea con SM **o** con *Call of the Wild* de la 1ª edición. *Forbidden Alchemy* añade una variante de mapa.
- Es el único escenario oficial con contenido completo del Horror de Dunwich (ver §1.12).

---

## 7. MAD23: Beyond the Threshold / Más Allá del Umbral

**Tipo:** expansión pequeña (32,99 USD). Código Edge FFMAD23, EAN 8435407614413.

**Lanzamiento:** principios de 2017 (enero) en inglés; julio de 2017 en español.

**Diseño:** Kara Centell-Dunk y Nikki Valens. **Tema:** la influencia de Yog-Sothoth, "el omnisciente", y el peligro de adquirir conocimiento prohibido.

### Contenido
- **2 investigadores:** Akachi Onyele (The Shaman), con gran saber sobrenatural, y Wilson Richards (The Handyman), físico y concentrado.
- **4 monstruos:** **Thrall** ×4. En el texto de Edge se llaman "Subyugados". Son personas débiles de mente poseídas y deformadas por poderes oscuros; un personaje puede convertirse en Thrall durante la partida.
- **6 losetas** (12 caras en Valkyrie): AtticStorage, Balcony, BasementStorage, Bedroom, DiningRoomMAD23, EntryHallMAD23, HallCorner, HallStairsMAD23, Kitchen, LibraryMAD23, Porch y Yard1MAD23.
- **Cartas:**
  - 8 Objetos comunes: .25 Automatic, Blackjack, Enchanted Blade, Fine Clothes, Razor, Scribe's Journal, Tome of Horrors y Tome of Secrets.
  - 1 Objeto único: Cultist's Journal.
  - 10 Hechizos: Arcane Insight ×5 y Poison Mist ×5.
  - 9 Estados: **Mesmerized** ×5 e Insane ×4.
  - 4 de Daño (Feeble, Head Trauma, Minor Injury, Painful Clarity) y 4 de Horror (Minor Shock, Squeamish, Terrible Truths, Weak-Willed).
- **Fichas:** 16 de Fuego/Oscuridad, 7 de Personaje, 10 de Pista, **4 de Llave** y 2 de Pared.
  - Personajes en Valkyrie: Bruce Darzi, Jean Spencer, Elizabeth Fairview, Thomas Carvey, May Nguyen, Tetsuo Mori y Leland Williams, además de `TokenThrall`.

### Reglas y mecánicas nuevas
1. **Losetas móviles (*Moving Tiles*).** La app puede ordenar retirar una loseta y colocarla en otro sitio del tablero. Todo lo que hay encima (figuras, fichas, cartas) viaja con ella y conserva su posición relativa. Sirve para mansiones que cambian de forma, pasillos que ya no llevan al mismo sitio o habitaciones que aparecen y desaparecen. Se repite en SoT y HJ.
2. **Fichas de Llave (*Key*).** Se colocan sobre un objeto para indicar que tiene una propiedad sobrenatural oculta.
   - El objeto gana los rasgos *Llave* y *Prueba* (Key y Evidence).
   - **No se puede descartar** ni puede salir elegido en un descarte aleatorio.
   - Hay eventos de los Mitos que afectan a quien lleva una llave; en Valkyrie, `$mythosKey`.
3. **Estado nuevo: *Mesmerized*** (nombre en español sin verificar). FFG lo describe como un trance que desorienta. El efecto exacto está en el reverso de la carta (sin verificar).
4. **Nuevas cartas de Loco** con efectos de locura distintos y **objetos de efecto variable**, que el anuncio de FFG llama "cualidades ocultas de los objetos".
5. **Monstruo nuevo: Thrall.** Humanoide de Percepción 3, Horror 4 y Agresividad 2. Ataca casi siempre en su espacio.

### Escenarios

| Inglés | Español | Dificultad | Duración | Premisa |
|---|---|---|---|---|
| Vengeful Impulses | La venganza está servida | 2/5 | 90-120 min | Thomas Carvey invita a los investigadores a una cena formal porque cree que un invitado quiere matarlo. Hay que infiltrarse, interrogar y descubrir quién y por qué. Es un misterio de deducción con muy poco combate. |
| Gates of Silverwood Manor | Las puertas de la mansión Silverwood | 4/5 | 120-180 min | El agente Tetsuo Mori pide ayuda con varias desapariciones que llevan a la mansión Silverwood. Es una casa encantada de los Mitos, con losetas móviles, llaves y una estructura en bucle con varios finales. |

---

## 8. MAD25: Streets of Arkham / Calles de Arkham

**Tipo:** expansión grande (59,95 o 69,99 USD según la fuente). Código Edge FFMAD25, EAN 8435407619265, 69,99 €.

**Lanzamiento:** cuarto trimestre de 2017 en inglés (el reglamento es de diciembre de 2017); junio de 2018 en español.

**Diseño:** Grace Holdinghaus, Kara Centell-Dunk y Tony Fanchi. **Tema:** las calles, las bandas y los locales clandestinos de Arkham, la Universidad Miskatonic y su museo.

### Contenido
- **4 investigadores:**
  - Diana Stanley (The Reformed Cultist): si sufre 2 o más de horror de golpe, sufre 1 menos.
  - Finn Edwards (The Bootlegger): puede moverse 1 espacio extra antes o después de buscar.
  - Marie Lambeau (The Entertainer): lanza un hechizo sin gastar acción; según la FAQ puede atacar con hechizos al empezar su turno.
  - Tommy Muldoon (The Rookie Cop): empieza con **Becky**, un rifle único que puede usar en cualquier tirada.
- **7 monstruos:**
  - Skeleton ×2, base pequeña, categoría nueva `fleshless`.
  - Hired Gun ×2, base pequeña.
  - Star Vampire ×2, base mediana.
  - Lloigor ×1, base grande.
- **17 losetas** (34 caras en Valkyrie): Diner, ExhibitEntrance, Exhibit1 a Exhibit3, MainExhibit, Lab, Bandstand, Classroom1 a Classroom3, LibraryMAD25, LibraryArchives, ResearchLibrary, GeneralShop, MagicShop, CuriosityShop, Studio, Sewer1, Sewer2, PrintingPress, StreetCorner, ChapelMAD25, Speakeasy, PortraitHall, OfficeMAD25, Yard1MAD25, Yard2MAD25, BedroomMAD25, Alley, HallStairsMAD25, WarehouseMAD25, LobbyMAD25 y LoungeMAD25.
- **Cartas:**
  - 11 Objetos comunes: Bulletproof Vest, Enhancing Serum, Flask, Gambler's Dice, Mental Stimulant, Moon Potion, Mutation Juice, Ocular Extract, Scalpel, Snubnose Revolver y Thermos.
  - 9 Objetos únicos: Becky, Bone Pipes, De Vermis Mysteriis, Ledger, Mysterious Idol, Old Map, Star Calendar, Stone Chest y Strange Tablet.
  - 15 Hechizos: Azure Flame, Forced Learning e Implant Suggestion, 5 de cada.
  - **6 Elixires.**
  - 8 Estados: **Righteous** ×5 e Insane ×3.
  - 5 de Daño (Exhaustion, Fog of Pain, Minor Injury ×2, Thirst for Justice) y 5 de Horror (Fervor, Mediocrity, Minor Shock ×2, Regression).
- **Fichas:** **30 de Mejora**, 12 de Personaje, 2 de Puerta y 2 de Pared.
  - Personajes en Valkyrie: genéricos rosa y cian, Delphinia Bell, Sadie Sheldon (joven y mayor), Lola Santiago, Adam Lynch, Naomi O'Bannion, Drew Walker, Alice Luxley, Elli Horowitz y Professor Smith.
  - Valkyrie también trae fichas de imagen de los cuatro monstruos.

### Reglas y mecánicas nuevas
1. **Elixires** (tipo de carta nuevo; en Valkyrie, `ItemElixir` con rasgo `elixir`). Son brebajes químicos de doble cara.
   - Cuando un efecto da un Elixir, el investigador toma **una copia al azar boca arriba** y no puede mirar el reverso.
   - Al **darle la vuelta** se resuelve el reverso al instante. Puede ser una mejora potente o un efecto adverso, como sufrir daño, y a veces obliga a descartarlo.
   - Boca arriba es una pertenencia: se puede soltar, recoger e intercambiar. Boca abajo no lo es.
   - No se puede mirar el reverso del mazo de Elixires.
2. **Mejoras (*Improvements*)**, con la palabra clave "mejorar". Un efecto indica qué atributo mejorar, o deja elegir, y el investigador toma la ficha correspondiente.
   - Ese atributo sube **+1 de forma permanente**.
   - **Cada atributo solo se puede mejorar una vez.**
   - Las mejoras no son pertenencias y no se sueltan ni se intercambian salvo que un efecto lo permita.
3. **Puzle de Torre (*Tower*).** Hay piezas de distintos tamaños repartidas al azar en tres columnas. En cada paso se mueve la pieza superior de una columna a otra. Se resuelve al apilarlas todas en una sola columna, de mayor (abajo) a menor (arriba). Es la clase `tower` de Valkyrie.
4. **Estado nuevo: *Righteous*** (nombre en español sin verificar). Según la FAQ se descarta en cuanto el investigador sufre Daño u Horror, sea boca arriba o boca abajo. Su efecto positivo no está verificado.
5. **Monstruos nuevos:** Lloigor (enorme, de Horror 9), Star Vampire, Hired Gun (humano armado) y Skeleton. El esqueleto introduce la categoría de objetivo "sin carne" (`fleshless`) para los textos de ataque.
6. **Contenido de app:** nuevos eventos de los Mitos y un puzle digital nuevo (la Torre). Las losetas nuevas también se usan en los escenarios del base.

### Escenarios

| Inglés | Español | Dificultad | Duración | Premisa |
|---|---|---|---|---|
| Astral Alchemy | Alquimia astral | 4/5 | 90-120 min | Tras una llamada de socorro de la Dra. Delphinia Bell, unas bestias de más allá de las estrellas recorren los pasillos de la Universidad Miskatonic. Hay que devolverlas a su origen. |
| Gangs of Arkham | Guerra de bandas en Arkham | 3/5 | 180-240 min | Hay que resolver un asesinato monstruoso para evitar una guerra entre las bandas de Sheldon y O'Bannon. |
| Ill-Fated Exhibit | La exposición maldita | 5/5 | 120-180 min | Tras inaugurar una exposición de artefactos antiguos en el Museo Miskatonic se suceden accidentes. Hay que identificar el objeto maldito y neutralizarlo. |

---

## 9. MAD26: Sanctum of Twilight / El Santuario del Crepúsculo

**Tipo:** expansión pequeña (32,99 USD). Código Edge MAD26ES, EAN 8435407621640, 32,99 €.

**Lanzamiento:** 19 de abril de 2018 en inglés; octubre de 2018 en español.

**Diseño:** Kara Centell-Dunk y Grace Holdinghaus. **Tema:** la Orden Hermética del Crepúsculo de Plata (*Silver Twilight Lodge*), una amenaza que nace dentro de la propia sociedad de Arkham.

### Contenido
- **2 investigadores:**
  - Charlie Kane (The Politician), Vida 5 y Cordura 9: una vez por tirada convierte un resultado de Investigación en Éxito si tiene a un personaje a su alcance.
  - Lily Chen (The Martial Artist), Vida 7 y Cordura 7: sus ataques desarmados hacen 2 daños extra si el monstruo sufre al menos 1.
- **2 monstruos:** **Wraith** ×2, en español **Alma en pena** (nombre oficial). Es una amenaza incorpórea de categoría `spirit`.
- **5 losetas** (10 caras en Valkyrie): Cafe, DungeonHall, CeremonyRoomMAD26, InnerSanctum, LoungeMAD26, **ParadeFloat1**, **ParadeFloat2** (carrozas), Pharmacy, StorageRoom y Vault.
- **Cartas:**
  - 10 Objetos comunes: Binding Powder, Convincing Dummy, Lucky Ring, Painkillers, Riot Whistle, Sensible Shoes, Silver Twilight Dagger, Sword Cane, Tote Bag y Track Shoes.
  - 6 Objetos únicos, entre ellos Membership Ring y Twilight Diadem. Los otros 4 no están verificados.
  - 10 Hechizos: Binding ×5 y Spectral Razor ×5.
  - 7 Estados: Insane ×2 y un estado nuevo, posiblemente *Stressed* (sin verificar).
  - 2 de Daño (Aches and Pains, Minor Injury) y 2 de Horror (Anxiety, Minor Shock).
- **Fichas:** **20 de Contención**, 10 de Personaje, 7 de Pista y 2 de Pared.
  - Personajes en Valkyrie: Granny Orne, Arthur Johnson, Zora Larson, Gabriel Carillo, Mary Ann Chase, Lewis Hayes, Sachiko Higa, Esther Locke, Henry Wan y The Veiled King, además de `TokenWraith`.

### Reglas y mecánicas nuevas
1. **Losetas móviles.** Misma regla que en BtT. En *La Diadema del Crepúsculo* representan las **carrozas del desfile**, que avanzan por las calles con los investigadores encima.
2. **Losetas superpuestas (*Overlapping Tiles*).** Una loseta puede colocarse parcialmente encima de otra.
   - La parte tapada **deja de formar parte del tablero**.
   - Si una figura o carta queda donde se va a tapar, el grupo decide dónde recolocarla dentro de ese mismo espacio.
   - Nunca se tapa un espacio entero.
   - El movimiento sigue las reglas normales.
3. **Contención (*Restraint*).** Las fichas se colocan en espacios mediante efectos, sobre todo objetos y hechizos como Binding.
   - Un monstruo en un espacio con Contención **no necesita ser evadido**.
   - Puede haber varias en el mismo espacio.
   - Cuando el monstruo se activa, el grupo puede descartar una ficha de su espacio para que el monstruo **renuncie a su movimiento**.
   - No son pertenencias, así que no se recogen, sueltan ni intercambian.
   - En Valkyrie no hay ficha: se gestiona con texto.
4. **Monstruo nuevo: Wraith (Alma en pena).** Espíritu de Percepción 2, Horror 6 y Agresividad 1.

### Escenarios

| Inglés | Español | Dificultad | Duración | Premisa |
|---|---|---|---|---|
| Behind Closed Doors | A puerta cerrada | 3/5 | 120-180 min | Un paseo por el parque acaba con los investigadores secuestrados. Despiertan en celdas en el sótano de la Logia y tienen que escapar y llevar a otros prisioneros a un lugar seguro. |
| The Twilight Diadem | La Diadema del Crepúsculo | 4/5 | 180-240 min | La debutante Mary Ann Chase pide ayuda contra la Logia durante la Feria del Crepúsculo. Hay que protegerla y frustrar el plan antes del Baile del Crepúsculo, persiguiendo el desfile antes de que llegue a la Logia. Usa carrozas móviles. |

---

## 10. MAD27: Horrific Journeys / Viajes Escalofriantes

**Tipo:** expansión grande (69,99 USD). Código Edge FFMAD27, EAN 8435407623958, 69,99 €.

**Lanzamiento:** 29 de noviembre de 2018 en inglés; en español, a finales de 2018 o principios de 2019 (sin verificar).

**Diseño:** Kara Centell-Dunk. **Tema:** los viajes. Por primera vez la acción sale de mansiones y ciudades y transcurre en un tren, un dirigible y un transatlántico, con criaturas anfibias y seres interdimensionales que rasgan la realidad.

### Contenido
- **4 investigadores:**
  - Agnes Baker (The Waitress): empieza con el hechizo **Storm of Spirits** y puede potenciarlo sufriendo daño.
  - Jim Culver (The Musician): empieza con la **Golden Trumpet**, que una vez por ronda cura un horror boca abajo a cada investigador a su alcance.
  - Silas Marsh (The Sailor): una vez por ronda pone boca arriba una carta de horror para repetir dados. Tiene Cordura 5.
  - Trish Scarborough (The Spy): una vez por ronda convierte hasta 2 resultados de Investigación en Éxitos al buscar.
- **7 monstruos:** Warlock ×2, Dimensional Shambler ×2, Hunting Deep One ×2 y **Formless Spawn** ×1. El Formless Spawn va en base grande de unos 80-90 mm y hay que pegarlo.
- **18 losetas** (36 caras en Valkyrie):
  - Tren: BaggageCar, Carboose (sic), DiningCar1, DiningCar2, Engine, FreightCar1, FreightCar2, LoungeCar, ObservationCar, PassengerCar1, PassengerCar2, SleeperCar, Station y Tracks.
  - Barco: Bridge, Cabin1, Cabin3, ChartRoom, CrewBedroom, EngineRoom, LifeBoat, MedicalOffice, Pool, Prow, ShipDeck1 a ShipDeck6, Spa y StorageHold.
  - Otras: DiningRoomMAD27 y ViewingRoom1 a ViewingRoom3.
- **Cartas:**
  - **6 de Plan (*Agenda*):** 4 humanas y 2 de híbrido de profundo.
  - 13 Objetos comunes: .41 Derringer, Astronomy Guidebook, Captain's Hat, Coal Shovel, Diver's Helmet, Diver's Journal, Gate Box, Gatling Gun, Harpoon, Life Preserver, Map of the Ley Lines, Mystic Sextant y Sturdy Luggage.
  - 7 Objetos únicos: Fishing Net, Fuel ×3, Golden Trumpet, Satchel of the Void y Ticket.
  - 15 Hechizos: Mists of R'lyeh, Plumb the Void y Storm of Spirits, 5 de cada.
  - 8 Estados: **Lost in Time and Space** ×5 e Insane ×3.
  - 4 de Daño (Knocked Loose, Minor Injury, Motion Sickness, Pinched Nerve) y 4 de Horror (Aware of the Void, Fear the Unknown, Minor Shock, Photophobia).
- **Fichas:** **43 de Grieta/Agua** (de doble cara), 6 de Personaje y 4 de Puerta.
  - Personajes en Valkyrie: Dot Fisher, Officer Butler, Fred Cooper, Arthur Holloway III, Ethel Gibbs y Doctor Rose Barnett.

### Reglas y mecánicas nuevas
1. **Planes (*Agendas*). Solo se usan en *Hidden Depths* y con 3 o más investigadores.**
   - Cada investigador recibe una carta boca arriba y no puede mirar el reverso salvo que un efecto se lo permita.
   - El reverso indica a cuántos jugadores como mínimo se aplica; si no se llega a ese número, se descarta y se roba otra.
   - Representan **lealtades ocultas**. Algunos investigadores pueden resultar ser híbridos de profundo con objetivos propios (sabotaje). El escenario se vuelve semicooperativo, con posible traidor y desconfianza.
2. **Grieta (*Rift*).** Es una debilidad en la barrera de la realidad.
   - Entrar en el espacio no tiene efecto automático (FAQ).
   - Hacer cualquier acción que no sea moverse estando en una Grieta, o renunciar a una acción allí, deja al investigador **Perdido en el tiempo y el espacio**.
   - Como acción, se puede intentar **cerrar la Grieta con una tirada de Saber**: se descarta una Grieta por cada éxito.
   - No puede haber dos Grietas en el mismo espacio.
3. **Estado nuevo: *Lost in Time and Space*** (en español probablemente "Perdido en el tiempo y el espacio", sin verificar).
   - El investigador **deja de verse afectado por cualquier efecto del juego** salvo los que digan expresamente que le afectan.
   - Sigue pudiendo ganar la partida (FAQ).
   - La forma de volver la decide la app o la carta (sin verificar).
4. **Agua (*Water*).** Representa una inundación.
   - Cualquier investigador o monstruo que entre en un espacio con Agua **pierde el resto de su movimiento**.
   - Los monstruos **acuáticos, voladores o etéreos** (*Aquatic*, *Flying*, *Phasing*) no lo pierden.
   - Al poner Agua en un espacio con Fuego, el Fuego se descarta. No se puede poner Fuego donde hay Agua.
5. **Puzle de líneas (*Line Puzzle*).** Una cuadrícula de piezas con tramos de línea. Se pueden intercambiar piezas adyacentes o girar una pieza 90°. Se resuelve cuando hay una línea continua de izquierda a derecha. Un blog español lo llama "puzle de conducto" (sin verificar). **No existe en Valkyrie.**
6. **Losetas móviles.** Misma regla que en BtT. Se usan para vagones, partes del barco y otras zonas del vehículo. **Los vehículos no tienen reglas propias de movimiento**: el viaje se representa con losetas móviles, Agua (inundación), Grietas y eventos de la app. Según una reseña, en el tren se puede subir al techo (fuente única).
7. **Monstruos nuevos:**
   - Warlock: humanoide; suele moverse y atacar.
   - Dimensional Shambler.
   - Hunting Deep One: humanoide anfibio.
   - Formless Spawn: enorme; ataca a 1 espacio.

### Escenarios

| Inglés | Español | Dificultad | Duración | Premisa |
|---|---|---|---|---|
| The 10:50 to Arkham | Tren de las 10:50 a Arkham | 4/5 | 90-120 min | Los investigadores viajan en tren por la campiña de Nueva Inglaterra con su colega Harriet, que investiga una conspiración que implica a varios pasajeros. Harriet desaparece del vagón. El tablero es lineal, de vagones. |
| Murder on the Stargazer Majestic | Asesinato en el Stargazer Majestic | 3/5 | 90-150 min | En un dirigible transatlántico asesinan a un pasajero mientras estalla una tormenta, y hay fuerzas oscuras detrás. Es una venganza sangrienta. |
| Hidden Depths | Profundidades ignotas | 5/5 | 120-180 min | Los investigadores están contratados para comprobar los rumores sobre el transatlántico RMS Morgana: accidentes y avistamientos de criaturas marinas. Una explosión bajo cubierta desata el caos y no se sabe de quién fiarse. Usa Planes con 3 o más jugadores y es el tablero más grande publicado. |

---

## 11. MAD28: Path of the Serpent / La Senda de la Serpiente

**Tipo:** expansión grande (69,99 USD). Código Edge FFMAD28, EAN 8435407628564.

**Lanzamiento:** 1 de noviembre de 2019 en inglés; finales de 2019 en español. Hubo escasez de stock al salir y una reimpresión posterior.

**Diseño:** Kara Centell-Dunk y Amudha Venugopalan. **Tema:** la selva amazónica, ruinas de civilizaciones perdidas, hombres serpiente y el dios Yig.

### Contenido
- **4 investigadores:**
  - Daniela Reyes (The Mechanic), Vida 8 y Fuerza 5: cada vez que **cualquiera** resuelve un puzle, gana 2 pistas o descarta 1 horror.
  - Leo Anderson (The Expedition Leader): una vez por ronda, cuando se mueve, puede ayudar a otro investigador a moverse 1 espacio, aunque esté fuera del rango normal (FAQ).
  - Norman Withers (The Astronomer), Vida 6: una vez por ronda, si está en un espacio exterior, gana 2 pistas o descarta 1 horror.
  - Ursula Downs (The Explorer), Vida 7 y Cordura 7: una vez por ronda puede moverse 1 espacio antes o después de explorar o de resolver una ficha de Vistazo.
- **8 monstruos:** Serpent Person ×3, Feathered Serpent ×2, Temple Guardian ×2 y **Ancient Basilisk** ×1. El basilisco se monta con 4 piezas pegadas sobre base grande; el Temple Guardian también va pegado.
- **17 losetas** (34 caras en Valkyrie):
  - Templo: StatueChamber, BurialChamber, BedChamber, VerdantChamber, Pit, Tunnel, TempleStairs, ThroneChamber, AltarChamber, SunlitChamber, HallChamber1, HallChamber2, StorageChamber, PoolChamber, MosaicChamber, Antechamber, CrackedChamber y RuinedChamber.
  - Selva: RopeBridge, HollowGrove, CrumblingPlaza, Shrine, JungleRuins1, JungleRuins2, River1, River2, RiverCrossing, RiverEdge, Campsite, Clearing1, Clearing2, OvergrownPath, RuinedHut y Ravine.
- **Cartas:**
  - 16 Objetos comunes: Antivenom, Disc of Itzamna, Expedition Log, Hedge Shears, Jeweled Skull, Lucky Bandana, Matches, Otherworldly Compass, Pith Helmet, Serpent Bracelet, Survival Knife, Survival Pack, Timeworn Brand y Torch ×3.
  - 5 Objetos únicos: Citrine Snake, Jade Crocodile, Mysterious Serpent, Obsidian Jaguar y Turquoise Eagle (ídolos).
  - 15 Hechizos: Banishment, Call the Storm y Summoning, 5 de cada.
  - 12 Estados: estados nuevos **Poisoned** y **Fearless**, y nuevas cartas de Loco. La reseña de RPGnet menciona también *Ophidiophobia* y una carta de locura, *Treasure Hunter*, que cambia la condición de victoria (sin verificar). El reparto exacto tampoco está verificado.
  - 3 de Daño (Infected Wounds, Minor Injury, Skinned Knee) y 3 de Horror (Delusion of Power, Minor Shock, Visceral Reaction).
- **Fichas:** **27 de Maleza/Escombros** (doble cara), 8 de Puerta y 8 de Pared (de templo), y 5 de Personaje.
  - Personajes en Valkyrie: Clinton Freeman, Eula Dorman, Marshall Hastings, Merle Garvin y Veda Whitsley.

### Reglas y mecánicas nuevas
1. **Maleza (*Overgrowth*).** Representa follaje espeso.
   - Para **salir** de un espacio con Maleza hay que hacer una **tirada de Observación** con dificultad igual al número de fichas de Maleza del espacio. Si se falla, el investigador **suelta un objeto al azar**.
   - Con un **arma de filo**, al entrar en el espacio puede descartar 1 Maleza; como acción, puede descartar **toda** la Maleza de su espacio.
   - Poner **Fuego** en el espacio elimina toda la Maleza, y no se puede poner Maleza donde hay Fuego.
2. **Escombros (*Rubble*).** Representan piedra desmoronada.
   - En un espacio con Escombros **no se puede buscar, explorar ni interactuar**.
   - Con un **arma pesada**, al entrar se descarta 1 Escombro.
   - Como acción, una **tirada de Fuerza** descarta 1 Escombro por éxito. Con un arma pesada se descartan todos, saque lo que saque.
3. **Puzle de anillos (*Ring Puzzle*).** Hay 4 anillos concéntricos con los mismos símbolos en el mismo orden. El interior está fijo y los 3 exteriores giran un sector por paso. Hay que alinear todos los símbolos con el anillo interior. Algunos símbolos están ocultos y hay que deducirlos. **No existe en Valkyrie.**
4. **Puertas y paredes de templo.** Funcionan igual que las del base y son intercambiables con ellas (FAQ).
5. **Estados nuevos: *Poisoned* y *Fearless*.** Sus efectos exactos no están verificados.
6. **Exploración.** No hay una regla nueva de exploración. Lo nuevo está en el diseño de los escenarios:
   - En *Lost Temple of Yig* el mapa **cambia en cada partida**: sale de un conjunto de salas predefinidas que pueden moverse.
   - *Into the Dark* da un giro a la Oscuridad: en la selva hay que evitarla a toda costa y usar hogueras como refugio.
   - Hay peligros ambientales: suelos que se hunden y cavernas que se derrumban.
7. **Monstruos nuevos:** Serpent Person (categoría de ataque propia `snakeperson`), Feathered Serpent (ataque a distancia), Temple Guardian (una "monstruosidad de piedra" animada) y Ancient Basilisk (monstruo enorme).
8. Según la reseña de Zatu, la expansión **apenas interactúa con las demás**: sus elementos de selva se diluyen al mezclarla con otras.

### Escenarios

| Inglés | Español | Dificultad | Duración | Premisa |
|---|---|---|---|---|
| The Jungle Awakens | La selva ha despertado | 3/5 | 90-120 min | En una fiesta de la alta sociedad de Arkham, el anfitrión enseña reliquias de Sudamérica. El jardín se convierte en selva tropical en minutos: llevarse reliquias de la selva tiene consecuencias. |
| Into the Dark | Expedición a las tinieblas | 4/5 | 150-180 min | Una expedición a Sudamérica contrata a los investigadores con una regla: en la selva hay que evitar la oscuridad a toda costa. Es más de combate. |
| Lost Temple of Yig | El templo perdido de Yig | 5/5 | 90-120 min | En salas de piedra antiquísimas, sacerdotes de los hombres serpiente intentan restablecer el vínculo con Yig. El mapa es variable, con escombros y trampas. |

---

## 12. Otros productos y contenido digital

### MAD24: Dice Pack / Set de dados de Mansiones de la Locura
Son **6 dados** extra según Edge (código FFGMAD24, 6,99 €). No traen reglas nuevas y **no son un paquete de Valkyrie**, por eso hay un hueco entre MAD23 y MAD25 en la numeración. Año: probablemente 2017 (sin verificar).

### Escenarios digitales de pago (DLC de la app y Steam)
Todos cuestan 4,99 USD, **solo exigen el juego base** y usan las expansiones que se tengan si están activadas. Desde 2025, la compra queda ligada a la cuenta de AsmoConnect.

| DLC | Lanzamiento | Dificultad / duración | Premisa |
|---|---|---|---|
| What Lies Within | 19 de diciembre de 2016 | 4/5; 120-150 min (fuente única) | Escena de un crimen, fenómenos extraños y el sótano de una casa supuestamente vacía. |
| Dark Reflections | 3 de agosto de 2017 | 3/5; 180-240 min (fuente única) | Una casa de campo ruinosa y una mujer desaparecida. Los espejos son el elemento inquietante y la barrera con el otro lado se desmorona. |
| Altered Fates | 30 de agosto de 2018 | 3/5; 90-120 min (fuente única) | En la campiña inglesa, Lady Helena es raptada a través de un portal policromado. El grupo se reparte en **dos mapas simultáneos** de la misma mansión: el presente (años 20) y un futuro abandonado. Lo que hacen unos afecta a los otros. |
| Turn of a Page | 7-8 de mayo de 2025 | 5/5; 120-180 min | Una tienda de objetos esotéricos de Arkham recibe artefactos rescatados del mar (de R'lyeh). Hay una enfermedad del sueño con pesadillas y una amenaza creciente. Está vinculado a la campaña *The Drowned City* de *Arkham Horror: El juego de cartas*. Tiene tres actos y mapa variable. Diseño de Brooks Flugaur-Leavitt con Grace Holdinghaus. |
| Mirror of a Man | 14-15 de septiembre de 2026 | No indicada; FFG lo presenta como ideal para novatos | Un profesor visitante de la Universidad Miskatonic dice haber visto una bestia que cambia de forma. Hay que averiguar si es verdad o si su investigación arcana y alquímica lo ha corrompido. Preparación simplificada y mapas alternativos. |

No he encontrado los nombres en español de los DLC; la app podría mostrarlos traducidos (sin verificar).

### Productos por los que se preguntó y que no existen
- **"Dead of Night":** no hay ningún producto de MoM 2ª edición con ese nombre en la línea de FFG, el catálogo de FFG España, la lista de DLC de Steam ni Wikipedia.
- **Investigadores promocionales:** no he encontrado ninguno para MoM 2ª edición (sin verificar). Los 40 investigadores de la lista consolidada son todos los que salen en productos.
- **Expansiones nuevas después de 2019:** ninguna física. Desde entonces el soporte ha sido solo digital. En el Gen Con 2026 no se anunció nada de MoM.

---

## 13. Mecánicas por las que se preguntó: qué existe y qué no

| Mecánica | Situación en MoM 2ª edición |
|---|---|
| Estados (condiciones) nuevos | Sí. Base: Dazed, Focused, Restrained, Stunned, Wounded, Insane. BtT: Mesmerized. SoA: Righteous. SoT: probablemente Stressed (sin verificar). HJ: Lost in Time and Space. PotS: Poisoned y Fearless. Cada expansión trae además cartas de Loco nuevas. |
| Fichas de entorno nuevas | Llave (BtT), Mejora (SoA), Contención (SoT), Grieta y Agua (HJ), Maleza y Escombros (PotS). Fuego, Oscuridad, Obstrucción y Pasadizo vienen del base. |
| Puzles nuevos | Torre (SoA), Líneas (HJ) y Anillos (PotS). Los del base son Mosaico, Código y Mecanismo. |
| Tipos de carta nuevos | Elixir (SoA) y Plan/Agenda (HJ). |
| Losetas móviles o superpuestas | Móviles en BtT, SoT y HJ; superpuestas solo en SoT. |
| "Vehículos que se mueven" (HJ) | No hay regla de vehículo: son losetas móviles más los eventos de la app. |
| Mapas de varias plantas | No hay regla formal. Se usan losetas de escaleras (HallStairs), zonas de mapa separadas y, en *Altered Fates*, dos mapas en paralelo. |
| "Investigador líder" | **No existe.** Ni la Guía de referencia ni el reglamento lo mencionan. Si un efecto afecta a "un investigador" y hay varios candidatos, decide el grupo; si no hay acuerdo, se elige al azar (FAQ). |
| "Historia personal" | **No existe** en MoM. Es un concepto de otros juegos de Arkham. |
| "Debilidad" (*weakness*) | **No existe** en MoM. Es de *Arkham Horror: El juego de cartas*. |
| Oscuridad | Ficha del base. *Into the Dark* (PotS) le da un giro de escenario. |
| Exploración (PotS) | Sin regla nueva. Hay un mapa variable en *Lost Temple of Yig* y habilidades de exploración, como la de Ursula Downs. |
| Traidor o semicooperativo | Solo con los Planes de *Hidden Depths*, con 3 o más jugadores. Las cartas de Loco del base ya podían cambiar objetivos individuales. |
| Campañas | Los escenarios oficiales son independientes (sin verificar si hay excepciones). Valkyrie permite campañas con variables `%` que se conservan entre escenarios. |

---

## 14. Lista consolidada de monstruos (40 tipos y 85 figuras)

Columnas:
- **Fig.:** número de figuras.
- **Per./Hor./Agr.:** Percepción (*awareness*), Horror (*horror rating*) y Agresividad (*brawn*). Vienen de los datos de Valkyrie; los del kit de conversión coinciden con el PDF oficial de indicadores salvo donde se indica.
- **Vida:** base + por investigador, según Valkyrie. No está impresa en el indicador.
- **Cat.:** categoría del monstruo para los textos de ataque en Valkyrie.
- **Ataque típico:** patrón dominante en las activaciones de Valkyrie: "esp." = ataca en su espacio; "dist." = a distancia (alcance); "carga" = se mueve y ataca; "≤N" = a N espacios o menos.
- **Nombre en español:** "oficial" sale de la Guía de referencia de Edge o de una ficha de FFG España. El resto está **(sin verificar)**: se toma de blogs o tiendas españolas o es una traducción probable.

| Monstruo (EN) | Español | Producto | Fig. | Per. | Hor. | Agr. | Vida | Cat. | Rasgo del indicador / notas | Ataque típico | ID en Valkyrie |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Cultist | Sectario (oficial) | Base | 6 | 3 | 1 | 2 | 1+1 | small humanoid | | esp. | `MonsterCultist` |
| Deep One | Profundo (oficial) | Base | 4 | 3 | 4 | 2 | 2+1 | humanoid | probablemente Acuático (sin verificar) | esp. | `MonsterDeepOne` |
| Deep One Hybrid | Híbrido de profundo (oficial) | Base | 4 | 3 | 1 | 2 | 2+1 | humanoid | | esp. | `MonsterDeepOneHybrid` |
| Ghost | Fantasma (oficial) | Base | 2 | 2 | 5 | 1 | 1+1 | spirit | probablemente Etéreo/Phasing (sin verificar) | mixto | `MonsterGhost` |
| Hunting Horror | Horrendo cazador (oficial) | Base | 2 | 5 | 6 | 3 | 3+1 | beast | probablemente Volador (sin verificar) | dist. | `MonsterHuntingHorror` |
| Riot | Turba (oficial) | Base | 2 | 7 | 4 | 4 | 5+3 | humanoid | | ≤2 | `MonsterRiot` |
| Star Spawn | Semilla estelar (nombre de uso común en la edición española) | Base | 2 | 5 | 8 | 5 | 9+3 | beast | figura grande | esp. | `MonsterStarSpawn` |
| Child of Dagon | Hijo de Dagón (oficial) | Base | 1 | 4 | 3 | 2 | 1+1 | humanoid | **único** | esp. | `MonsterChildOfDagon` |
| Priest of Dagon | Sacerdote de Dagón (oficial) | Base | 1 | 4 | 3 | 2 | 2+2 | humanoid | **único** | esp. | `MonsterPriestOfDagon` |
| Zombie | Zombi (sin verificar) | RN / 1ª ed. | 4 | 2 | 4 | 2 | 2+1 | undead small humanoid | | esp. | `MonsterZombie` |
| Cthonian | Chthoniano (sin verificar) | RN / 1ª ed. | 2 | 4 | 7 | 5 | 3+2 | beast | | esp. | `MonsterCthonian` |
| Hound of Tindalos | Perro de Tíndalos (sin verificar) | RN / 1ª ed. | 2 | 6 | 5 | 5 (el PDF oficial parece decir 3; discrepancia) | 1+2 | beast | **Phasing**: atraviesa paredes y bordes infranqueables | esp. o ≤3 | `MonsterHoundOfTindalos` |
| Maniac | Maníaco (sin verificar) | RN / 1ª ed. | 2 | 5 | 1 | 2 | 2+1 | humanoid | **Unstoppable**: muy eficaz rompiendo obstrucciones | esp. | `MonsterManiac` |
| Mi-Go | Mi-Go | RN / 1ª ed. | 2 | 6 | 4 | 3 | 3+1 | beast | **Flying** | dist. | `MonsterMiGo` |
| Shoggoth | Shoggoth | RN / 1ª ed. | 2 | 4 (el PDF oficial parece decir 3; discrepancia) | 6 | 4 | 4+2 | beast | | esp. | `MonsterShoggoth` |
| Witch | Bruja (sin verificar) | RN / 1ª ed. | 2 | 3 | 2 | 2 | 2+1 | humanoid | | dist. | `MonsterWitch` |
| Cult Leader | Líder de la secta (sin verificar) | RN / 1ª ed. | 2 | 4 | 3 | 2 | 8+4 | humanoid | **único** | esp. | `MonsterCultLeader` |
| Byakhee | Byakhee | SM / Alquimia Prohibida | 2 | 4 | 3 | 2 | 1+2 | beast | **Flying** | dist. | `MonsterByakhee` |
| Crawling One | Reptante (sin verificar) | SM / Alquimia Prohibida | 2 | 2 | 4 | 4 | 3+1 | beast | | esp. | `MonsterCrawlingOne` |
| Child of the Goat | Hijo o Hija de la Cabra (sin verificar) | SM / La Llamada de lo Salvaje | 2 | 3 | 1 | 2 | 1+1 | humanoid | | esp. | `MonsterChildOfTheGoat` |
| Dark Druid | Druida oscuro (sin verificar) | SM / La Llamada de lo Salvaje | 2 | 3 | 2 | 2 | 2+1 | humanoid | | mixto | `MonsterDarkDruid` |
| Dark Young | Retoño oscuro (sin verificar) | SM / La Llamada de lo Salvaje | 1 | 4 | 7 | 5 | 4+2 | beast | | esp. | `MonsterDarkYoung` |
| Goat Spawn | Engendro cabrío (sin verificar) | SM / La Llamada de lo Salvaje | 2 | 4 | 3 | 2 | 1+2 | humanoid | | esp. | `MonsterGoatSpawn` |
| Nightgaunt | Ángel descarnado (sin verificar) | SM / La Llamada de lo Salvaje | 2 | 6 | 5 | 3 | 1+2 | beast | **Flying** | esp. | `MonsterNightgaunt` |
| Dunwich Horror | Horror de Dunwich (sin verificar) | SM / La Llamada de lo Salvaje | 1 | 7 | 9 | 5 | 2+3 | horror | **único**; contenido solo en *Cult of Sentinel Hill* (ver §1.12) | especial | `MonsterDunwichHorror` |
| Wizard | Brujo (sin verificar) | SM / La Llamada de lo Salvaje | 1 | 4 | 3 | 2 | 2+1 | humanoid | **único** | mixto | `MonsterWizard` |
| Thrall | Subyugado (texto de Edge) | BtT | 4 | 3 | 4 | 2 | 2+1 | humanoid | Pocos textos genéricos en Valkyrie | esp. | `MonsterThrall` |
| Skeleton | Esqueleto (sin verificar) | SoA | 2 | 2 | 4 | 2 | 1+1 | fleshless | | esp. | `MonsterSkeleton` |
| Hired Gun | ¿Gángster o pistolero a sueldo? (sin verificar) | SoA | 2 | 2 | 1 | 2 | 2+1 | humanoid | | esp. o carga | `MonsterHiredGun` |
| Lloigor | Lloigor | SoA | 1 | 7 | 9 | 5 | 1+2 (dudoso) | beast | base grande | esp. o ≤1 | `MonsterLloigor` |
| Star Vampire | Vampiro estelar (sin verificar) | SoA | 2 | 4 | 6 | 3 | 9+3 (dudoso) | beast | base mediana | esp. o carga | `MonsterStarVampire` |
| Wraith | Alma en pena (oficial) | SoT | 2 | 2 | 6 | 1 | 2+2 | spirit | incorpóreo | esp. | `MonsterWraith` |
| Warlock | ¿Mago malvado? (sin verificar) | HJ | 2 | 4 | 3 | 2 | 1+1 (dudoso) | humanoid | | carga | `MonsterWarlock` |
| Dimensional Shambler | Vagabundo dimensional (sin verificar) | HJ | 2 | 4 | 5 | 2 | 6+2 (dudoso) | beast | | esp. | `MonsterDimensionalShambler` |
| Hunting Deep One | Profundo cazador (sin verificar) | HJ | 2 | 4 | 5 | 4 | 3+1 (dudoso) | humanoid | anfibio | esp. | `MonsterHuntingDeepOne` |
| Formless Spawn | Semilla informe (sin verificar) | HJ | 1 | 4 | 6 | 4 | 48+1 (casi seguro un error de datos) | beast | base grande | ≤1 | `MonsterFormlessSpawn` |
| Feathered Serpent | Serpiente emplumada (sin verificar) | PotS | 2 | 3 | 2 | 2 | 2+1 | beast | | dist. | `MonsterFeatheredSerpent` |
| Temple Guardian | Guardián del templo (sin verificar) | PotS | 2 | 4 | 5 | 5 | 3+2 | beast | estatua animada | esp. | `MonsterTempleGuardian` |
| Serpent Person | Hombre serpiente (sin verificar) | PotS | 3 | 4 | 3 | 3 | 2+1 | snakeperson | | esp. o carga | `MonsterSerpentPerson` |
| Ancient Basilisk | Basilisco ancestral (sin verificar) | PotS | 1 | 6 | 5 | 5 | 20+1 | beast | 4 piezas, base grande | esp. | `MonsterAncientBasilisk` |

Totales por producto:

| Producto | Tipos | Figuras |
|---|---|---|
| Base | 9 | 24 |
| RN | 8 | 18 |
| SM | 9 | 15 |
| BtT | 1 | 4 |
| SoA | 4 | 7 |
| SoT | 1 | 2 |
| HJ | 4 | 7 |
| PotS | 4 | 8 |
| **Total** | **40** | **85** |

Notas sobre la tabla:
- **Rasgos de indicador confirmados** en el PDF oficial de indicadores del kit de conversión: *Phasing* (Hound of Tindalos), *Flying* (Mi-Go, Byakhee, Nightgaunt) y *Unstoppable* (Maniac). El reglamento de HJ confirma que existen los rasgos *Aquatic*, *Flying* y *Phasing*. Los rasgos de los monstruos del base y de las expansiones no los he podido comprobar ficha a ficha.
- **Monstruos únicos** (llevan el prefijo `UNIQUE_MONSTER_` en las claves de la app): Child of Dagon, Priest of Dagon, Cult Leader, Wizard y Dunwich Horror.
- **Tamaños de base** (de tiendas de peanas y de los reglamentos): pequeña de 25 mm para la mayoría de humanoides; mediana para Star Vampire, Hunting Deep One y Mi-Go/Cthonian (unos 40 mm); grande para Star Spawn (sin verificar), Shoggoth, Dark Young, Dunwich Horror, Lloigor, Formless Spawn y Ancient Basilisk (60 a 90 mm).

---

## 15. Lista consolidada de investigadores (40)

24 de cartas y figuras de 2ª edición (8 del base y 16 de las expansiones) más 16 de la 1ª edición, que se juegan con las cartas del kit de conversión.

Los roles están en inglés; el rol de los investigadores de 1ª edición sale de la tradición de Arkham Horror (sin verificar en MoM, salvo Bob Jenkins y Carolyn Fern, que confirma FFG). Los nombres propios se mantienen en la edición española; algunos títulos, como "Father" o "Sister", podrían traducirse ("Padre Mateo", "Hermana Mary"; sin verificar).

| Investigador | Producto | Rol | ID en Valkyrie |
|---|---|---|---|
| Agatha Crane | Base | Parapsychologist | `HeroAgathaCrane` |
| Carson Sinclair | Base | Butler | `HeroCarsonSinclair` |
| Father Mateo | Base | Priest | `HeroFatherMateo` |
| Minh Thi Phan | Base | Secretary | `HeroMinhThiPhan` |
| Preston Fairmont | Base | Millionaire | `HeroPrestonFairmont` |
| Rita Young | Base | Athlete | `HeroRitaYoung` |
| Wendy Adams | Base | Urchin | `HeroWendyAdams` |
| William Yorick | Base | Gravedigger | `HeroWilliamYorick` |
| "Ashcan" Pete | RN / 1ª ed. (kit) | Drifter; lleva a Duke | `HeroAshcanPete` |
| Gloria Goldberg | RN / 1ª ed. | Author | `HeroGloriaGoldberg` |
| Harvey Walters | RN / 1ª ed. | Professor | `HeroHarveyWalters` |
| Jenny Barnes | RN / 1ª ed. | Dilettante | `HeroJennyBarnes` |
| Joe Diamond | RN / 1ª ed. | Private Eye | `HeroJoeDiamond` |
| Kate Winthrop | RN / 1ª ed. | Scientist | `HeroKateWinthrop` |
| Michael McGlen | RN / 1ª ed. | Gangster | `HeroMichaelMcGlen` |
| Sister Mary | RN / 1ª ed. | Nun | `HeroSisterMary` |
| Carolyn Fern | SM / Alquimia Prohibida | Psychologist | `HeroCarolynFern` |
| Darrell Simmons | SM / Alquimia Prohibida | Photographer | `HeroDarrellSimmons` |
| Dexter Drake | SM / Alquimia Prohibida | Magician | `HeroDexterDrake` |
| Vincent Lee | SM / Alquimia Prohibida | Doctor | `HeroVincentLee` |
| Amanda Sharpe | SM / La Llamada de lo Salvaje | Student | `HeroAmandaSharpe` |
| Bob Jenkins | SM / La Llamada de lo Salvaje | Salesman | `HeroBobJenkins` |
| Mandy Thompson | SM / La Llamada de lo Salvaje | Researcher | `HeroMandyThompson` |
| Monterey Jack | SM / La Llamada de lo Salvaje | Archaeologist | `HeroMontereyJack` |
| Akachi Onyele | BtT | Shaman | `HeroAkachiOnyele` |
| Wilson Richards | BtT | Handyman | `HeroWilsonRichards` |
| Diana Stanley | SoA | Reformed Cultist | `HeroDianaStanley` |
| Finn Edwards | SoA | Bootlegger | `HeroFinnEdwards` |
| Marie Lambeau | SoA | Entertainer | `HeroMarieLambeau` |
| Tommy Muldoon | SoA | Rookie Cop | `HeroTommyMuldoon` |
| Charlie Kane | SoT | Politician | `HeroCharlieKane` |
| Lily Chen | SoT | Martial Artist | `HeroLilyChen` |
| Agnes Baker | HJ | Waitress | `HeroAgnesBaker` |
| Jim Culver | HJ | Musician | `HeroJimCulver` |
| Silas Marsh | HJ | Sailor | `HeroSilasMarsh` |
| Trish Scarborough | HJ | Spy | `HeroTrishScarborough` |
| Daniela Reyes | PotS | Mechanic | `HeroDanielaReyes` |
| Leo Anderson | PotS | Expedition Leader | `HeroLeoAnderson` |
| Norman Withers | PotS | Astronomer | `HeroNormanWithers` |
| Ursula Downs | PotS | Explorer | `HeroUrsulaDowns` |

En Valkyrie, el paquete de investigadores de RN es `MoM1EI`, los de Alquimia Prohibida están en `FAI` y los de La Llamada de lo Salvaje en `CotWI`. Las cartas de los 16 investigadores de 1ª edición vienen en el kit de conversión.

---

## 16. Lista consolidada de escenarios oficiales

| # | Inglés | Español | Producto necesario | Dificultad | Duración |
|---|---|---|---|---|---|
| 1 | Cycle of Eternity | El ciclo de la eternidad | Base | 2/5 | 60-90 min |
| 2 | Escape from Innsmouth | Huida de Innsmouth | Base | 4/5 | 90-150 min |
| 3 | Shattered Bonds | Lazos inquebrantables | Base | 5/5 | 120-180 min |
| 4 | Rising Tide | Marea creciente | Base | 3/5 | 240-360 min |
| 5 | Dearly Departed | (no encontrado) | RN, o 1ª ed. base más el kit | 5/5 | 120-150 min (fuente única) |
| 6 | Cult of Sentinel Hill | (no encontrado) | SM, o *Call of the Wild* | 3/5 (fuente única) | 120-150 min (fuente única) |
| 7 | Vengeful Impulses | La venganza está servida | BtT | 2/5 | 90-120 min |
| 8 | Gates of Silverwood Manor | Las puertas de la mansión Silverwood | BtT | 4/5 | 120-180 min |
| 9 | Astral Alchemy | Alquimia astral | SoA | 4/5 | 90-120 min |
| 10 | Gangs of Arkham | Guerra de bandas en Arkham | SoA | 3/5 | 180-240 min |
| 11 | Ill-Fated Exhibit | La exposición maldita | SoA | 5/5 | 120-180 min |
| 12 | Behind Closed Doors | A puerta cerrada | SoT | 3/5 | 120-180 min |
| 13 | The Twilight Diadem | La Diadema del Crepúsculo | SoT | 4/5 | 180-240 min |
| 14 | The 10:50 to Arkham | Tren de las 10:50 a Arkham | HJ | 4/5 | 90-120 min |
| 15 | Murder on the Stargazer Majestic | Asesinato en el Stargazer Majestic | HJ | 3/5 | 90-150 min |
| 16 | Hidden Depths | Profundidades ignotas | HJ | 5/5 | 120-180 min |
| 17 | The Jungle Awakens | La selva ha despertado | PotS | 3/5 | 90-120 min |
| 18 | Into the Dark | Expedición a las tinieblas | PotS | 4/5 | 150-180 min |
| 19 | Lost Temple of Yig | El templo perdido de Yig | PotS | 5/5 | 90-120 min |
| 20 | What Lies Within (DLC) | (no encontrado) | Base | 4/5 (fuente única) | 120-150 min (fuente única) |
| 21 | Dark Reflections (DLC) | (no encontrado) | Base | 3/5 (fuente única) | 180-240 min (fuente única) |
| 22 | Altered Fates (DLC) | (no encontrado) | Base | 3/5 (fuente única) | 90-120 min (fuente única) |
| 23 | Turn of a Page (DLC, 2025) | (no encontrado) | Base | 5/5 | 120-180 min |
| 24 | Mirror of a Man (DLC, 2026) | (no encontrado) | Base | apto para novatos | no indicada |

Para Valkyrie, la escala de dificultad del `quest.ini` va de 0 a 1 (por ejemplo, 0,8 equivale a 4/5), y las duraciones se ponen en `lengthmin` y `lengthmax`.

---

## 17. Lagunas y datos dudosos

1. **Nombres en español de la mayoría de monstruos de expansión y de la 1ª edición.** Solo son oficiales los 9 del base, Alma en pena (Wraith) y Subyugado (Thrall). El resto sale de blogs o tiendas, o es una traducción probable. La forma más fiable de comprobarlos es abrir la app oficial o Valkyrie en español.
2. **Efectos exactos de los estados nuevos** (Mesmerized, Righteous, Poisoned, Fearless, y Stressed u otros de SoT) y sus nombres en español. No están en los reglamentos públicos: solo aparecen en las cartas.
3. **Vida de los monstruos de SoA y HJ en Valkyrie.** Está marcada como "Todo" en sus ficheros, y los valores del Formless Spawn (48+1) y el Lloigor (1+2) parecen erróneos. Además hay dos discrepancias con el PDF oficial del kit: la Agresividad del Hound of Tindalos y la Percepción del Shoggoth.
4. **Rasgos de indicador** (Acuático, Volador, Etéreo) de los monstruos del base y de las expansiones: no los he comprobado ficha a ficha.
5. **Escenarios de RN y SM y los DLC:** su dificultad y duración salen de una sola fuente (tesera.ru) y no he encontrado sus nombres en español.
6. **Año de MAD24 y fechas españolas** de RN, SM y HJ: aproximadas.
7. **La wiki de Arkham Horror Files** (fandom) y **BoardGameGeek** no se pudieron consultar (bloqueados, errores 402 y 403). Con ellos se podrían confirmar los rasgos de los indicadores y los estados.

---

## Fuentes

Principales (la investigación completa consultó más de 100 páginas):

- Repositorio y wiki de Valkyrie: https://github.com/NPBruce/valkyrie y https://github.com/NPBruce/valkyrie/wiki
  (ficheros `content/MoM/*/content_pack.ini`, `monsters.ini`, `investigators.ini`, `tiles.ini`, `tokens.ini`,
  `items.ini`, `activations.ini`, `mythos.ini`, `puzzle.ini` y los `.cs` de `Content/` y `Quest/`).
- Líneas de producto de FFG: https://www.fantasyflightgames.com/productline/mansions-of-madness-second-edition/
- Reglamentos de expansión (PDF de FFG):
  - Kit de conversión: https://images-cdn.fantasyflightgames.com/filer_public/aa/6b/aa6bf7df-096e-4744-a3bb-eaf54021b110/mansions_of_madness_second_edition_conversion_kit_rules.pdf
  - Indicadores de monstruo del kit: https://images-cdn.fantasyflightgames.com/filer_public/35/ac/35aca0a7-197b-41a8-a7e9-73bdf1ac1d49/conversion_kit_monsters_tokens.pdf
  - Beyond the Threshold: https://images-cdn.fantasyflightgames.com/filer_public/37/20/372073da-9fb0-441e-8c03-461bedc9ea66/mad23_rules_eng.pdf
  - Streets of Arkham: https://images-cdn.fantasyflightgames.com/filer_public/f9/ca/f9ca9a71-def0-482e-bc8d-02f3cdfe8a0a/madk043_d6570__rules.pdf
  - Sanctum of Twilight: https://images-cdn.fantasyflightgames.com/filer_public/aa/df/aadfa0f3-2296-4892-a5f8-e1481558fca5/sanctum_of_twilight_rules.pdf
  - Horrific Journeys: https://images-cdn.fantasyflightgames.com/filer_public/f6/71/f671c831-b06a-40db-95d3-05b8f89b6262/mad27_rules.pdf
  - Path of the Serpent: https://images-cdn.fantasyflightgames.com/filer_public/72/41/72411d43-e1bc-4cab-814d-be42d1a453d5/mad28_rules.pdf
- Edge / FFG España (nombres comerciales en español): https://www.fantasyflightgames.es/coleccion/las-mansiones-de-la-locura/
- Guía de referencia en español: https://cdn.svc.asmodee.net/production-ffges/uploads/2023/08/Guia_Referencia_Mansiones_de_la_Locura.pdf
- Leyenda.net (fichas de los escenarios en español): https://leyenda.net/cthulhu/
- DLC: https://store.steampowered.com/dlc/478980/ y https://www.arkhamhorror.com/news/
- Listas de componentes: https://www.lindhardgaming.dk/2017/05/14/mansion-of-madness-2nd-edition-list/
- Resumen de reglas con expansiones: https://www.orderofgamers.com/downloads/MansionsofMadness2ndEd_v2.pdf
- Wikipedia: https://en.wikipedia.org/wiki/Mansions_of_Madness
