# Productos de Descent: Viaje a las Tinieblas, 2ª ed. (y cómo los trata Valkyrie)

Qué trae cada producto de *Descent: Journeys in the Dark (Second Edition)* (Fantasy Flight Games, 2012-2019;
en español, *Descent: Viaje a las Tinieblas (Segunda Edición)*, de Edge Entertainment), qué reglas añade, qué
misiones y campañas tiene y con qué identificador lo pide un escenario de Valkyrie (`packs=` en `quest.ini`).
Los datos de juego de Valkyrie (IDs, rasgos, losetas) salen de su repositorio, commit `752d420` de junio de
2026 (`unity/Assets/StreamingAssets/content/D2E/`). Son datos de la comunidad: útiles, pero no oficiales.
Para buscar un componente concreto y su ID, mejor `python scripts/buscar.py` o `catalogo.md`; las reglas que
añade cada expansión, resumidas aquí, están completas en `reglas-descent.md`.

**Códigos de fuente** (entre corchetes tras cada dato):

| Código | Fuente |
|---|---|
| [EXP] | Reglamento o documento de reglas del producto, en PDF de FFG (ficha de producto de FFG, 2026) |
| [FAQ] | Errata y FAQ oficial de Descent 2ª ed., versión 1.6 (18 de enero de 2016) |
| [FFG] | Noticias y fichas de FFG (fantasyflightgames.com y su copia drafts.fantasyflightgames.com) |
| [WIKI] | Wiki de la comunidad de Descent (wiki.descent-community.org) |
| [BGG] | Datos de BoardGameGeek leídos en sus espejos (analog.games, kallax.io, Dice Tower); BGG no se pudo abrir directamente |
| [ES] | Edge Entertainment: su anuncio recogido por la prensa, o tiendas españolas con EAN de Edge (8435407…) |
| [WES] | Wikipedia en español |
| [BLOG] | Blogs y reseñas (mundoaizen, El Club del Dado, Theology of Games, Brückenkopf, icv2) |
| [TND] | Tiendas en inglés (Board Game Bliss, Troll and Toad, Noble Knight), por los códigos de producto |
| [APP] | Fichas de Road to Legend en App Store y Steam |
| [VAL] | Datos y código de Valkyrie (`content/D2E/**/*.ini`, `Scripts/**/*.cs`, wiki de Valkyrie) |
| [TIENDA] | Lista de escenarios de la tienda de Valkyrie (`valkyrie-store/D2E/manifestDownload.ini`) y sus paquetes |
| [COM] | Packs de la comunidad (sus `content_pack.ini` y `.ini`) y descent-community.org |

- **(sin verificar)**: dato no confirmado en una fuente oficial ni en dos independientes.
- **(fuente única)**: una sola fuente no oficial pero fiable.
- **(?)** tras un nombre en español: nombre no confirmado como oficial de Edge (ver §2).
- Los nombres de héroes, clases y monstruos se dan en inglés, que es como los nombra Valkyrie en sus IDs. En
  la partida, Valkyrie los muestra traducidos con las claves `{ffg:…}` de la importación de Road to Legend.

## Índice

- [0. Resumen rápido](#0-resumen-rápido)
- [1. Cómo trata Valkyrie estos productos (lo esencial para la skill)](#1-cómo-trata-valkyrie-estos-productos-lo-esencial-para-la-skill)
- [2. Glosario español ↔ inglés](#2-glosario-español--inglés)
- [3. DJ01: juego base](#3-dj01-juego-base)
- [4. DJ02: kit de conversión de la 1ª edición](#4-dj02-kit-de-conversión-de-la-1ª-edición)
- [5. DJ03: Lair of the Wyrm / La Guarida de la Sierpe](#5-dj03-lair-of-the-wyrm--la-guarida-de-la-sierpe)
- [6. DJ04: Labyrinth of Ruin / Laberinto de Perdición](#6-dj04-labyrinth-of-ruin--laberinto-de-perdición)
- [7. DJ05: The Trollfens / La Ciénaga del Troll](#7-dj05-the-trollfens--la-ciénaga-del-troll)
- [8. DJ07: Shadow of Nerekhall / La Sombra de Nerekhall](#8-dj07-shadow-of-nerekhall--la-sombra-de-nerekhall)
- [9. DJ21: Manor of Ravens / La Mansión de los Cuervos](#9-dj21-manor-of-ravens--la-mansión-de-los-cuervos)
- [10. DJ40: Mists of Bilehall / Las Brumas de Castrohiel](#10-dj40-mists-of-bilehall--las-brumas-de-castrohiel)
- [11. DJ44: The Chains That Rust / Las Cadenas del Óxido](#11-dj44-the-chains-that-rust--las-cadenas-del-óxido)
- [12. uDJ45: Lost Legends / Leyendas Perdidas](#12-udj45-lost-legends--leyendas-perdidas)
- [13. DJ39: Heirs of Blood / Herederos de Sangre](#13-dj39-heirs-of-blood--herederos-de-sangre)
- [14. DJ26 a DJ34: colecciones de Héroes y Monstruos](#14-dj26-a-dj34-colecciones-de-héroes-y-monstruos)
- [15. Packs de Lugarteniente](#15-packs-de-lugarteniente)
- [16. Aventuras cooperativas de cartas (uDJ36, uDJ37, uDJ38)](#16-aventuras-cooperativas-de-cartas-udj36-udj37-udj38)
- [17. Road to Legend: la app y sus campañas](#17-road-to-legend-la-app-y-sus-campañas)
- [18. Otros productos y lo que no existe](#18-otros-productos-y-lo-que-no-existe)
- [19. Packs de la comunidad: DooM, D1ED y SOTP](#19-packs-de-la-comunidad-doom-d1ed-y-sotp)
- [20. Lista consolidada de héroes (72)](#20-lista-consolidada-de-héroes-72)
- [21. Lista consolidada de clases (36)](#21-lista-consolidada-de-clases-36)
- [22. Lista consolidada de monstruos (56 grupos)](#22-lista-consolidada-de-monstruos-56-grupos)
- [23. Lista consolidada de lugartenientes (20)](#23-lista-consolidada-de-lugartenientes-20)
- [24. Escenarios de la tienda de Valkyrie por origen (59)](#24-escenarios-de-la-tienda-de-valkyrie-por-origen-59)
- [25. Lagunas y datos dudosos](#25-lagunas-y-datos-dudosos)
- [Fuentes](#fuentes)

## 0. Resumen rápido

**Tipos de pack de Valkyrie** [VAL]: `box` (caja de expansión), `hm` (colección de Héroes y Monstruos), `lt`
(pack de Lugarteniente), `ck` (kit de conversión) y `D2ECustom` (packs de la comunidad). `D2EBase` siempre está
cargado.

### Cajas, libros y cartas

| Código | ID en Valkyrie | Inglés | Español | Año EN | Tipo | Contenido principal | Misiones |
|---|---|---|---|---|---|---|---|
| DJ01 | `D2EBase` (box) | Descent: Journeys in the Dark (Second Edition) | Descent: Viaje a las Tinieblas (Segunda Edición) | 2012 (18 de julio) | Juego base | 8 héroes, 8 clases, 9 grupos de monstruos (31 figuras), 6 lugartenientes, 48 losetas | Campaña *The Shadow Rune* (20 misiones); desde 2015, *Heirs of Blood* |
| DJ02 | `CKD1E`, `CKWoD`, `CKAoD`, `CKToI`, `CKDQ`, `CKPromo` (ck) | Conversion Kit | Kit de conversión (?) | 2012 (agosto) | Cartas, sin figuras | 48 hojas de héroe y 50 cartas de monstruo (25 grupos) de la 1ª edición | Ninguna |
| DJ03 | `LotW` (box) | Lair of the Wyrm | La Guarida de la Sierpe | 2012 (diciembre) | Caja pequeña | 2 héroes, 2 clases, 2 grupos, Valyndra, 12 losetas | 5 misiones; minicampaña de 4 |
| DJ04 | `LoR` (box) | Labyrinth of Ruin | Laberinto de Perdición | 2013 (julio) | Caja grande | 4 héroes, 4 clases, 4 grupos, aliados, 18 losetas | Campaña de 19 misiones |
| DJ05 | `TT` (box) | The Trollfens | La Ciénaga del Troll (?) | 2013 (octubre) | Caja pequeña | 2 héroes, 2 clases, 2 grupos, Bol'Goreth, 9 losetas | 5 misiones; minicampaña de 4 |
| DJ07 | `SoN` (box) | Shadow of Nerekhall | La Sombra de Nerekhall | 2014 (marzo) | Caja grande | 4 héroes, 4 clases, 4 grupos, 4 lugartenientes, 46 losetas | Campaña de unas 19 misiones |
| DJ21 | `MoR` (box) | Manor of Ravens | La Mansión de los Cuervos (?) | 2014 (agosto) | Caja pequeña | 2 héroes, 2 clases, 2 grupos, Skarn, 16 losetas | 6 misiones; minicampaña |
| DJ39 | ninguno | Heirs of Blood | Herederos de Sangre | 2015 (abril) | Libro de campaña | Solo misiones; usa el base | Campaña de 32 encuentros |
| DJ40 | `MoB` (box) | Mists of Bilehall | Las Brumas de Castrohiel (?) | 2016 (enero) | Caja pequeña | 3 grupos, 3 lugartenientes, 13 losetas; sin héroes | Campaña de un acto (5 misiones) |
| DJ44 | `TCTR` (box) | The Chains That Rust | Las Cadenas del Óxido (?) | 2016 (septiembre) | Caja pequeña | 4 clases híbridas, 3 grupos, 15 losetas | Campaña de un acto; se une a la de MoB |
| uDJ45 | `LL` (box) | Lost Legends | Leyendas Perdidas | 2019 (20 de junio) | Solo cartas | 2 clases y 8 híbridas (59 cartas) | Ninguna |
| uDJ36 | ninguno | Forgotten Souls | Almas Olvidadas (?) | 2014 (julio) | Cooperativo de cartas | 32 cartas y hojas | 1 aventura cooperativa |
| uDJ37 | ninguno | Nature's Ire | La Ira de la Naturaleza (?) | 2014 (anuncio en diciembre) | Cooperativo de cartas | 32 cartas y hojas | 1 aventura cooperativa |
| uDJ38 | ninguno | Dark Elements | Elementos Oscuros (?) | 2015 (anuncio en abril) | Cooperativo de cartas | 32 cartas y hojas; pide LotW | 1 aventura cooperativa |
| DJ08 | ninguno | Dice Pack | (no encontrado) | 2013 | Accesorio | 9 dados | Ninguna |

### Colecciones de Héroes y Monstruos (4 héroes, 3 grupos y 2 misiones cada una)

| Código | ID | Inglés | Español | Año EN | Héroes | Monstruos | Misiones (acto I / acto II) |
|---|---|---|---|---|---|---|---|
| DJ26 | `OotO` | Oath of the Outcast | El Juramento de la Exiliada | 2014 | Trenloe the Strong, Laurel of Bloodwood, Elder Mok, Shiver | Bane Spider, Beastman, Razorwing | Oath of the Outcast / Prison of Ice and Lies |
| DJ27 | `CoD` | Crown of Destiny | La Corona del Destino (?) | 2014 | Corbin, Lindel, Brother Gherinn, Jaes the Exile | Giant, Chaos Beast, Lava Beetle | Burning Harvest / Crown of Destiny |
| DJ28 | `CotF` | Crusade of the Forgotten | La Cruzada de los Olvidados | 2014 | Tahlia, Tetherys, Andira Runehand, Astarra | Golem, Medusa, Sorcerer | Crusade of the Forgotten / Shadowside Watch |
| DJ29 | `GoD` | Guardians of Deephall | Guardianes de la Fortaleza Interior (?) | 2015 | Lord Hawthorne, Silhouette, Sahla, Mordrog | Crypt Dragon, Dark Priest, Wendigo | Guardians of Deephall / The Curse of Iona |
| DJ30 | `VoD` | Visions of Dawn | Visiones del Amanecer (?) | 2015 | Nara the Fang, Master Thorn, Ispher, Sir Valadir | Manticore, Ogre, Troll | Trucebreaker / Visions of Dawn |
| DJ31 | `BotW` | Bonds of the Wild | Vínculos de la Naturaleza (?) | 2015 | Lyssa, Challara, Ronan of the Wild, Vyrah the Falconer | Kobold, Hellhound, Deep Elf | One Man's Trash / Bonds of the Wild |
| DJ32 | `ToC` | Treaty of Champions | El Tratado de los Campeones | 2016 | Krutzbeck, Jonas the Kind, Grey Ker, Zyla | Skeleton Archer, **Crow Hag**, Demon Lord | Sindaea's Secret / Treaty of Champions |
| DJ33 | `SotS` | Stewards of the Secret | Senescales del Secreto | 2016 | Seer Kel, Tatianna, Okaluk and Rakash, Nanok of the Blade | Ferrox, Blood Ape, Naga | Stewards of the Secret / Bloodspire of Devis |
| DJ34 | `SoE` | Shards of Everdark | Esquirlas de Sombra Eterna (?) | 2016 | Arvel Worldwalker, One Fist, Karnon, Steelhorns | Ice Wyrm, **Dark Minotaur**, Shade | Shards of Everdark / Host of Everdark |

En negrita, los dos únicos monstruos que no vienen de la 1ª edición.

### Packs de Lugarteniente (una figura, 10 cartas de Trama y 2 de Agente cada uno)

| Código e ID | Lugarteniente | Caja de origen | Código e ID | Lugarteniente | Caja de origen |
|---|---|---|---|---|---|
| DJ09 `DJ09` | Splig | Base | DJ19 `DJ19` | Queen Ariad | LoR |
| DJ10 `DJ10` | Belthir | Base | DJ20 `DJ20` | Bol'Goreth | TT |
| DJ11 `DJ11` | Baron Zachareth | Base | DJ22 `DJ22` | Rylan Olliven | SoN |
| DJ12 `DJ12` | Sir Alric Farrow | Base | DJ23 `DJ23` | Verminous | SoN |
| DJ13 `DJ13` | Lord Merick Farrow | Base | DJ24 `DJ24` | Tristayne Olliven | SoN |
| DJ14 `DJ14` | Lady Eliza Farrow | Base | DJ25 `DJ25` | Gargan Mirklace | SoN |
| DJ15 `DJ15` | Valyndra | LotW | DJ35 `DJ35` | Skarn | MoR |
| DJ16 `DJ16` | Raythen (también héroe) | LoR | DJ41 `DJ41` | Kyndrithul | MoB |
| DJ17 `DJ17` | Serena (también héroe) | LoR | DJ42 `DJ42` | Zarihell | MoB |
| DJ18 `DJ18` | Ariad | LoR | DJ43 `DJ43` | Ardus Ix'Erebus | MoB |

Para estos packs el ID de Valkyrie **es el código de producto** (`DJ09`, `DJ35`…), no una sigla [VAL].

### Contenido digital (Road to Legend)

| Producto | Tipo | Fecha | Precio | Pide |
|---|---|---|---|---|
| Road to Legend | App gratuita (iOS, Android, Amazon, Steam) | 12 de mayo de 2016 | Gratis | Base |
| Rise of All Goblins | Minicampaña incluida (4 misiones) | 2016 | Incluida | Base |
| Kindred Fire | Campaña completa | Junio de 2016 | Gratis | Base |
| The Delve | Modo de aventura aleatoria | 17 de octubre de 2016 | 4,99 USD | Base |
| Nerekhall: Seeds of Corruption | Campaña (7 misiones de historia) | Enero de 2017 | Gratis | Base y SoN |
| Trials of Frostgate | 4 pruebas rejugables | 28 de septiembre de 2017 | 4,99 USD | Base |
| Embers of Dread | Campaña (6 misiones) | 6 de diciembre de 2018 | Gratis | Base, LotW y LoR |

Valkyrie no tiene pack para nada de esta tabla: la app es la fuente de la importación, no un pack (§17).

### Estados, terrenos y mecánicas por producto [EXP] [WIKI]

| Producto | Estados que añade | Terreno y mapa | Otras mecánicas |
|---|---|---|---|
| Base | Diseased, Immobilized, Poisoned, Stunned | Agua, foso, lava, obstáculos | Campaña de dos actos, tienda, reliquias, eventos de viaje, familiares |
| LotW | Burning | Salas secretas | Rumores, misiones avanzadas, monstruos inactivos, valor |
| LoR | Cursed | Elevación, maleza | Aliados, dado verde, elixires, maleficio, Sun Stone, mazo básico II |
| TT | Weakened | Salas secretas | Infección, trampas, visión, rumores, misiones avanzadas |
| SoN | Bleeding | Rastrillos, casillas de peligro, elevación | Viaje por la ciudad, influencia, ciudadanos corruptos, canciones, imágenes |
| MoR | Doomed | — | Reliquias de monstruo y universales, sirvientes, rastreo, cartas de misión, rumores |
| MoB | Terrified | Lodo, peligro, elevación, muros viejos, terreno que se desmorona | Cartas de impureza, reliquias de monstruo |
| TCTR | (Terrified, como MoB) | Los de MoB | Clases híbridas, Soulbinder y su sirviente Scourge |
| LL | — | — | Ocho clases híbridas más |
| Cooperativas | — | Mapa por cartas de exploración | Sin señor oscuro: cartas de activación y de peligro, perdición y destino |
| Road to Legend | — | Mapa oculto que se revela | Sin señor oscuro, turnos intercalados, peligros, moral, fama |

Las fuentes de cada dato de estas tablas están en la sección de cada producto.

---

## 1. Cómo trata Valkyrie estos productos (lo esencial para la skill)

Comprobado en el código y los datos de Valkyrie [VAL] salvo donde se indica.

1. **Expansiones requeridas.** Van en `quest.ini`, sección `[Quest]`, clave `packs=`, con IDs separados por
   espacios (`packs=LoR SoN`). En el editor el campo se llama «Expansiones requeridas». Valkyrie compara esa lista
   con los packs que el jugador tiene activados (`QuestData.Quest.GetMissingPacks`):
   - Si falta alguno, el escenario sale en la lista con el botón de «prohibido» (`button_no_entry`), los nombres de
     los packs que faltan en rojo y sus iconos aparte, y **no se puede empezar**.
   - Con la opción «Ocultar escenarios con ampliaciones que faltan» (`filterMissingExpansions`) ni siquiera aparece.
   - Un ID que no corresponde a ningún pack instalado cuenta como «falta» para siempre: por eso un escenario que
     pide `DooM` no arranca sin descargar antes ese pack de la comunidad.
2. **`D2EBase` siempre está cargado** y no se puede desmarcar (`GameStateManager.MainMenu` lo carga;
   `ContentSelectScreen.Select` impide quitarlo). No hace falta ponerlo en `packs=`: ninguno de los 59 escenarios
   de la tienda lo pone [TIENDA].
3. **IDs válidos de los packs oficiales** (44, más los 3 de la comunidad):
   - Cajas (`box`): `D2EBase`, `LotW`, `LoR`, `TT`, `SoN`, `MoR`, `MoB`, `TCTR`, `LL`.
   - Héroes y Monstruos (`hm`): `OotO`, `CoD`, `CotF`, `GoD`, `VoD`, `BotW`, `ToC`, `SotS`, `SoE`.
   - Lugartenientes (`lt`): `DJ09` a `DJ20`, `DJ22` a `DJ25`, `DJ35`, `DJ41`, `DJ42` y `DJ43` (el código de producto).
   - Kit de conversión (`ck`): `CKD1E` (1ª ed. base), `CKWoD` (*Well of Darkness*), `CKAoD` (*Altar of Despair*,
     escrito «Dispair» en su `content_pack.ini`), `CKToI` (*Tomb of Ice*), `CKDQ` (héroes de *DungeonQuest*) y
     `CKPromo` (héroes promocionales).
   - Comunidad (`D2ECustom`): `DooM`, `D1ED`, `SOTP`. Se descargan desde Valkyrie («Mi Colección» →
     «Descarga de contenidos») y se activan en «Paquetes de contenidos comunitarios».
   - No hay pack para *Heirs of Blood*, las aventuras cooperativas, el *Dice Pack* ni el contenido digital de
     Road to Legend: no traen héroes, clases, monstruos ni losetas nuevos. Para adaptarlos basta el base
     (y LotW para *Dark Elements*).
4. **El jugador marca su colección.** En «Mi Colección» (*Select Content*) elige por tipo (las categorías se llaman en
   inglés, tal cual en el `content_pack.ini` del base: *Boxed Expansions*, *Hero and Monster packs*, *Lieutenant
   Packs*, *Conversion Kit*) y la elección se guarda en `config.ini`, sección `[D2EPacks]`. Solo los packs
   activados aportan héroes al elegir grupo, clases, objetos a la tienda, monstruos al sorteo por rasgos y
   losetas. Las claves de nombre de las cajas son `{ffg:PRODUCT_DJxx_TITLE}`: el nombre que ve el jugador viene
   de la importación de Road to Legend, en su idioma.
5. **Variables de pack.** Al empezar, Valkyrie pone `#<ID>` a 1 para cada pack activado (`#LoR`, `#DJ16`…),
   `#<sección del héroe>` para cada héroe elegido (`#HeroJainFairwood`) y `#<sección de la clase>` para cada
   clase (`#ClassKnight`). Así se escriben ramas opcionales sin exigir la expansión. Es la técnica dominante en la
   tienda: `#MoB` aparece 332 veces, `#SoN` 185, `#LoR` 175, `#LotW` 114, `#MoR` 107, `#TCTR` 102, y cada
   colección H&M entre 33 y 76 [TIENDA]. Ningún escenario de la tienda consulta `#LL` ni `#DJxx`.
6. **El mismo contenido en dos packs.** Si dos packs definen la misma sección con la misma prioridad, Valkyrie
   la apunta a los dos (`ContentData.AddContent`, lista `sets`) y los datos que valen son los del primero que se
   carga. Casos reales:
   - Los 36 héroes y 25 monstruos de 1ª edición que reeditaron las colecciones H&M están también en los packs
     `ck` con el mismo ID (`HeroLyssa` en `CKD1E` y `BotW`). Basta tener uno de los dos.
   - La loseta 43 (`TileSide43A/B`) está en `LoR` y en `TT`.
   - Los tres lugartenientes de Bilehall (Ardus Ix'Erebus, Kyndrithul, Zarihell) y las losetas 78, 79 y la
     entrada de pantano (`TileSideEntranceSwampA/B`) están en `MoB` y en `TCTR`.
   - Diferencias entre copias: Manticore es `huge` en `CKD1E` y `medium` en `VoD`; Wendigo es `medium` en `CKToI`
     y `huge` en `GoD`; Shade es `dark` en `CKToI` y `cold undead` en `SoE`; Crypt Dragon y Dark Priest solo
     llevan `undead` en `GoD`. Un sorteo por rasgos puede dar resultados distintos según el orden de carga.
   - Error de datos: en `CKToI` el Shade tiene `image="No additional instructions."`. Quien solo tenga `CKToI` lo
     verá sin imagen.
7. **Monstruos al aparecer (`Spawn`).** `monster=` admite una lista y Valkyrie usa el primero disponible. Conviene
   poner primero el de expansión y después uno del base. Con `traits=` (los cumple todos) o `traitpool=` (basta
   uno) el sorteo elige entre los monstruos de los packs activados, y la lista de `monster=` pasa a ser de
   exclusiones. Rasgos de monstruo de Descent en Valkyrie:
   - Ataque: `melee`, `ranged`.
   - Tamaño: `small`, `medium`, `huge`, `massive`.
   - Entorno (los de las cartas de monstruo): `building`, `cave`, `civilized`, `cursed`, `dark`, `hot`, `cold`,
     `mountain`, `water`, `wilderness`.
   - Otros: `monster` (todos), `undead`, `goblin` (solo Goblin Archer), `lieutenant` (lugartenientes de las
     cajas) y `agent` (agentes de los packs `lt`).
   - Los escenarios también definen monstruos propios (`[CustomMonster…]`) sobre uno existente (`base=`), con sus
     rasgos, imagen, activaciones y vida (`health`, `healthperhero`); la tienda lo usa mucho para adaptar
     monstruos oficiales (`CustomMonsterFleshMoulder`, `CustomMonsterZombie`…) [TIENDA].
8. **Lugartenientes y agentes.** Las cajas definen el lugarteniente como monstruo con rasgo `lieutenant`
   (`MonsterSplig`) y activaciones en `ltActivations.ini`. Los packs `lt` definen el **agente**
   (`MonsterAgentSplig`, rasgo `agent`, 6 activaciones), que es la versión de los packs de Lugarteniente. Además,
   `DJ16` y `DJ17` traen a Raythen y Serena como héroes (`HeroRaythen`, `HeroSerena`).
9. **Objetos** (`items.ini`). Rasgo `class` para el equipo inicial de clase (`price=25`); `act1` y `act2` para la
   tienda, con `minfame` y `maxfame` (`insignificant`, `noteworthy`, `impressive`, `celebrated`, `heroic`,
   `legendary`) y `price`; `relic` para las reliquias (solo su cara de héroe). Otros rasgos: `melee`, `ranged`,
   `one_handed`, `two_handed`, `magic`, `exotic`, `blade`, `axe`, `hammer`, `bow`, `staff`, `rune`, `wand`, `book`,
   `shield`, `armor`, `light_armor`, `heavy_armor`, `cloak`, `helmet`, `boots`, `belt`, `ring`, `trinket`, `other`.
   Los escenarios dan objetos al azar con `traitpool=act1` o `act2` (más de 270 veces en la tienda).
10. **Clases e híbridas.** En la elección de clase cada héroe ve las de su arquetipo; una clase solo la puede
    llevar un héroe. Si elige una híbrida (clave `hybridarchetype`), después elige además una clase normal del
    arquetipo híbrido (`ClassSelectionScreen`). Las habilidades se compran con experiencia en `SkillWindow`.
    Arquetipos: `warrior`, `mage`, `healer`, `scout`. Los héroes del pack DooM usan un arquetipo propio, `DooM`.
11. **Losetas.** Se llaman `TileSide<número><A|B>` (`TileSide25A`) y conectores como `TileSideCapA`,
    `TileSideEntranceA`, `TileSideExtensionA`, `TileSideTransitionA`, `TileSideEntranceStairA` (base),
    `TileSideCapSoNA`… (SoN) y `TileSideEntranceSwampA` (MoB y TCTR). Rasgos de loseta: `inside`, `outside` y
    detalles (`water`, `lava`, `pit`, `swamp`, `sludge`, `city`, `blackrealm`…). En total hay 194 caras distintas
    (97 piezas); 18 caras usan imágenes propias de Valkyrie (probablemente porque la app no las trae), y los
    `tiles.ini` de las cajas avisan de que faltan muchas («; many are missing»). Las piezas físicas repiten
    conectores, así que las cuentas de cada caja no coinciden con las de Valkyrie (detalle en cada sección).
12. **Fichas** (`tokens.ini`). Solo existen `TokenSearch`, `TokenSearchSpecial`, `TokenObjectiveBack`
    (sic, la negra), `TokenObjectiveBlue`, `TokenObjectiveGreen`, `TokenObjectiveRed`, `TokenObjectiveWhite`,
    `TokenVillagerMan`, `TokenVillagerWoman` (base), `TokenSecretA/B` (LotW y TT, imágenes propias de Valkyrie),
    `TokenSunStone` (LoR) y `TokenCrumblingTerrain` (MoB y TCTR). No hay fichas de familiares, maleficio, elixir,
    maleza, rastrillo, muro viejo, desafío, valor, trampa, infección, visión, canción, imagen ni influencia: se
    resuelven con texto o con fichas propias del escenario (`customImage`). Las puertas son un componente de la
    aventura (`[Door…]`), no una ficha.
13. **Reglas al estilo Road to Legend.** Descent en Valkyrie no tiene señor oscuro: imita la app. La base trae los
    peligros (*perils*) menores, mayores y mortales (`perils.ini`) y los eventos de viaje (`travel.ini`), 40
    secciones entre los dos. Variables que usa Valkyrie: `$perilMinor`, `$perilMajor`, `$perilDeadly`,
    `$%morale`, `$%xp`, `$%gold`, `$%sellratio`, `$%fame`, `$%famenoteworthy` a `$%famelegendary`,
    `$@travelevent`, `$restock` y `#heroes`. La tienda (`ShopInterface`) se abre con un evento que añade dos o más `QItem` y se cierra al quitar
    `#shop`. Máximo de 4 héroes en Descent.
14. **Importación.** Valkyrie saca imágenes, sonidos y textos de la app oficial *Road to Legend*, versión 1.5.2 o
    posterior (`RtLFinder`: Steam 477200, Android `com.fantasyflightgames.rtl`). Sin importar, el botón de Descent
    sale en gris. Las claves `{ffg:…}` de héroes, clases, monstruos, objetos y productos son textos de la app.
15. **Kit de conversión fuera de la app.** Road to Legend no admite el kit [EXP], así que los packs `ck` son
    cosa de Valkyrie: `name=` literal en inglés y, para los 12 héroes que no salen en ningún producto de 2ª
    edición, a veces imagen propia y sin nombre (ver §4).
16. **Packs de la comunidad.** Se piden en `packs=` igual que los oficiales (`packs=DooM`). Sus textos van en
    sus propios `Localization.*.txt` con claves `{pck:…}`. Ver §19.

---

## 2. Glosario español ↔ inglés

No he encontrado un glosario oficial en español de Descent 2ª ed. en línea. La forma más fiable de confirmar los
nombres es abrir Valkyrie en español con la importación de Road to Legend: los nombres de productos, héroes,
clases y monstruos salen de la app (la app tiene español desde el otoño de 2017, versión 1.4.0 o 1.4.1 [APP]).

### Productos

| Inglés | Español | Fuentes del nombre español |
|---|---|---|
| Descent: Journeys in the Dark (Second Edition) | Descent: Viaje a las Tinieblas (Segunda Edición) | [BGG] [WES] |
| Conversion Kit | Kit de conversión (?) | ninguna; traducción literal |
| Lair of the Wyrm | La Guarida de la Sierpe | [BGG] [BLOG] [TIENDA] |
| Labyrinth of Ruin | Laberinto de Perdición | [BGG] [BLOG] [TIENDA] |
| The Trollfens | La Ciénaga del Troll (?) | [WES] [BLOG] [TIENDA] |
| Shadow of Nerekhall | La Sombra de Nerekhall | [BGG] [BLOG] [TIENDA] |
| Manor of Ravens | La Mansión de los Cuervos (?) | [TIENDA]; un blog dice «Mansión de Cuervos» [BLOG] |
| Mists of Bilehall | Las Brumas de Castrohiel (?) | [BLOG] [TIENDA] (Bilehall es «Castrohiel») |
| The Chains That Rust | Las Cadenas del Óxido (?) | [BLOG] (fuente única) |
| Lost Legends | Leyendas Perdidas | [BGG] [BLOG] |
| Heirs of Blood | Herederos de Sangre | [BGG] [WES] |
| The Shadow Rune (campaña del base) | La Runa de las Sombras | [WES] [TIENDA] |
| Oath of the Outcast | El Juramento de la Exiliada | [ES] (anuncio de Edge, octubre de 2014, 34,95 €) [WES] [BLOG] |
| Crown of Destiny | La Corona del Destino (?) | [WES] [BLOG] [TIENDA] |
| Crusade of the Forgotten | La Cruzada de los Olvidados | [BGG] [WES] [BLOG] |
| Guardians of Deephall | Guardianes de la Fortaleza Interior (?) | [WES] [BLOG] [TIENDA] |
| Visions of Dawn | Visiones del Amanecer (?) | [WES] [BLOG] |
| Bonds of the Wild | Vínculos de la Naturaleza (?) | [WES] [BLOG] [TIENDA] |
| Treaty of Champions | El Tratado de los Campeones | [BGG] [WES] [BLOG] |
| Stewards of the Secret | Senescales del Secreto | [ES] (tienda con EAN de Edge 8435407612242) [WES] [BLOG] |
| Shards of Everdark | Esquirlas de Sombra Eterna (?) | [BLOG] [TIENDA]; la Wikipedia dice «Esquirlas de la oscuridad eterna» |
| Lieutenant Pack (Splig, Rylan Olliven…) | Lugarteniente Splig, Lugarteniente Rylan Olliven… | [BGG]; Edge figura entre las editoriales [BGG] |
| Forgotten Souls | Almas Olvidadas (?) | [WES] [BLOG] [TIENDA] |
| Nature's Ire | La Ira de la Naturaleza (?) | [WES] [BLOG] [TIENDA] |
| Dark Elements | Elementos Oscuros (?) | [WES] [BLOG] |
| Road to Legend (app de 2ª ed.) | Camino a la Leyenda (?) | [TIENDA]; es el nombre que dio Edge a la expansión de 1ª ed. de 2008 [WES] |

Productos de 1ª edición (los que cubre el kit de conversión), según la Wikipedia en español [WES]: *Descent:
Viaje a las Tinieblas* (Edge, 2005), *El pozo de las tinieblas* (*Well of Darkness*, 2006), *El Altar de la
Desesperación* (*Altar of Despair*, 2007), *Tumba de Hielo* (*Tomb of Ice*), *Camino a la Leyenda* (*Road to
Legend*, 2008) y *El Mar de Sangre* (*Sea of Blood*).

### Términos de juego

Los términos de esta tabla salen de las traducciones al español de la tienda de Valkyrie (sobre todo de Vidimus)
[TIENDA] y no los he podido contrastar con el reglamento de Edge: todos **(?)**.

| Español | Inglés |
|---|---|
| Señor Oscuro (?) | Overlord |
| Lugarteniente | Lieutenant |
| Agente (?) | Agent |
| Guerrero, Mago, Sanador, Explorador (?) | Warrior, Mage, Healer, Scout (arquetipos) |
| Líder / esbirro | Master / minion (de un grupo de monstruos) |
| Prueba de atributo (con los símbolos `{might}`, `{knowledge}`, `{will}`, `{awareness}`) | Attribute test (Might, Knowledge, Willpower, Awareness) |
| Ventaja (?) | Surge (`{surge}`) |
| Fatiga / aguante | Fatigue / Stamina (`{fatigue}`) |
| Salud, daño | Health, damage (`{heart}`) |
| Acción | Action (`{action}`) |
| Defensa | Defense (`{shield}`) |
| Estados: Aturdido, Envenenado, Enfermo, Inmovilizado, Quemado (?), Maldito, Debilitado, Sangrando, Condenado, Aterrorizado | Conditions: Stunned, Poisoned, Diseased, Immobilized, Burning, Cursed, Weakened, Bleeding, Doomed, Terrified |
| Peligro (menor, mayor, mortal) | Peril (minor, major, deadly) |
| Moral, fama, oro | Morale, fame, gold |
| Reliquia | Relic |
| Rumor | Rumor |
| Aldeano | Villager |
| Ficha de búsqueda / de objetivo | Search token / objective token |
| Dado verde (de poder) | Green power die |
| Carta de impureza (?) | Tainted card (MoB, TCTR) |

### Nombres propios con fuente española

- **Héroes**, según el anuncio de Edge de *El Juramento de la Exiliada* [ES]: Laurel del Bosque Sangriento
  (Laurel of Bloodwood), Mok el Anciano (Elder Mok), Escalofrío (Shiver) y «Renloe el Fuerte» (sic; Trenloe the
  Strong). Según la Wikipedia en español [WES]: Reynhart el Digno, Gran Mago Quellen, Roganna la Sombra, Grisom el
  Augur. Según la tienda de Valkyrie [TIENDA]: Jain Bosquebello (Jain Fairwood). El resto de héroes, sin fuente.
- **Monstruos**, según el anuncio de Edge [ES]: arañas ponzoñosas (Bane Spiders), alacortantes (Razorwings) y
  «señores de las bestias» (probablemente Beastmen; dudoso). Según la Wikipedia en español [WES]: centinelas
  híbridos, diablillos de fuego, arpías, gusano de plaga; Reina Sierpe Valyndra y Trol Bol'Goreth.
- **Monstruos, según las traducciones de la tienda** [TIENDA] **(?)**: Zombi, Arquero goblin, Araña de las
  cavernas, Moldeador de carne, Barghest, Ettin, Elemental, Merriod, Dragón de las sombras, Brujo goblin (Goblin
  Witcher), Segador volucrix (Volucrix Reaver), Draco carroñero (Carrion Drake), Arpía, Gusano de la plaga,
  Enjambre de ratas, Cambiante (Changeling), Mole del Ynfernael (Ynfernael Hulk), Bandido, Espectro (Wraith),
  Reanimado, Horror óseo (Bone Horror), Caminante de progenie (Broodwalker), Desposeído (The Dispossessed), Coloso
  tambaleante (Shambling Colossus), Hombre bestia, Gigante, Bestia del caos, Escarabajo de lava, Gólem, Medusa,
  Hechicero (Sorcerer), Dragón de la cripta, Sacerdote oscuro, Wendigo, Ogro,
  Troll, Kobold, Sabueso infernal (Hellhound), Arquero esqueleto, Bruja cuervo (Crow Hag), Señor demonio (Demon
  Lord), Ferrox, Naga, Sierpe de hielo (Ice Wyrm), Minotauro oscuro, Sombra (Shade).

---

## 3. DJ01: juego base

**Nombres:** *Descent: Journeys in the Dark (Second Edition)* / *Descent: Viaje a las Tinieblas (Segunda
Edición)* [BGG] [WES]. Código DJ01 (FFGDJ01) [TND]. En español publicó la línea Edge Entertainment, que figura entre
las editoriales de *Shadow of Nerekhall* y del pack de Bol'Goreth [BGG] (año de la edición española del base sin
verificar).

**Lanzamiento:** anunciado el 7 de agosto de 2011 y publicado el 18 de julio de 2012 [WIKI] [WES].

**Diseño:** Adam Sadler y Corey Konieczka, con Daniel Lovat Clark [EXP]; la 1ª edición era de Kevin Wilson [BGG].

**Funcionamiento:** un jugador es el señor oscuro y hasta cuatro llevan héroes. Se juega por misiones de uno o
dos encuentros, enlazadas en una campaña de dos actos con experiencia, oro, tienda y reliquias [EXP]. Road to
Legend y Valkyrie quitan el señor oscuro (§17).

### Contenido [WIKI] [EXP]
- Reglamento y guía de misiones (*The Shadow Rune*); desde 2015, dos guías con *Heirs of Blood* (§13).
- **8 héroes** (hoja y figura): Ashrian (sanadora), Avric Albright (sanador), Grisban the Thirsty (guerrero),
  Jain Fairwood (exploradora), Leoric of the Book (mago), Syndrael (guerrera), Tomble Burrowell (explorador) y
  Widow Tarha (maga).
- **8 clases** (84 cartas de clase): Knight y Berserker (guerrero), Disciple y Spiritspeaker (sanador),
  Necromancer y Runemaster (mago), Thief y Wildlander (explorador).
- **31 figuras de monstruo** de 9 grupos (esbirros en marrón claro y líderes en rojo): Zombie 5, Goblin Archer 5,
  Cave Spider 5, Flesh Moulder 4, Barghest 4, Ettin 2, Elemental 2, Merriod 2 y Shadow Dragon 2.
- **6 lugartenientes** (12 cartas, una por acto, y 6 fichas, sin figura): Lady Eliza Farrow, Lord Merick Farrow,
  Sir Alric Farrow, Belthir, Splig y Baron Zachareth [VAL].
- **Cartas:** 40 del señor oscuro (mazo básico y las clases Warlord, Saboteur y Magus [WIKI]), 18 de monstruo,
  10 de evento de viaje, 4 de referencia, 20 objetos de tienda del acto I y 14 del acto II, 6 reliquias (cara de
  héroe y cara de señor oscuro), 12 de búsqueda y 16 de estado.
- **Estados:** Diseased, Immobilized, Poisoned y Stunned [WIKI].
- **Reliquias de héroe:** Dawnblade, Fortuna's Dice, Shield of the Dark God, Staff of Light, The Shadow Rune y
  Trueshot; sus caras de señor oscuro son Duskblade, Bones of Woe, Shield of Zorek's Favor, Staff of Shadows, The
  Shadow Rune y Scorpion's Kiss [WIKI].
- **9 dados** (1 azul de ataque, 2 rojos y 2 amarillos de poder, 1 marrón, 2 grises y 1 negro de defensa).
- **Fichas:** 48 losetas de doble cara, 7 puertas, 16 de héroe, 9 de búsqueda, 6 de lugarteniente, 10 de objetivo,
  8 de aldeano, 20 de estado, 45 de daño, 35 de fatiga y 1 de familiar (Reanimate, del Necromancer).

### Reglas base que conviene tener presentes al diseñar [EXP]
- **Turno del héroe:** dos acciones en cualquier orden, repetibles: mover, atacar, usar habilidades, descansar,
  buscar, abrir o cerrar una puerta adyacente y las acciones especiales de la misión. Puede sufrir fatiga para
  ganar 1 punto de movimiento por cada una, hasta su Aguante.
- **Monstruos:** cada grupo (líder y esbirros del mismo tipo) se activa una vez por turno; cada monstruo hace hasta
  dos acciones, pero **un solo ataque**. En Valkyrie, como en Road to Legend, el orden y lo que hacen lo dictan las
  activaciones (§1.8, §17).
- **Pruebas de atributo** (Might, Knowledge, Willpower, Awareness): se tiran un dado gris y uno negro de defensa y se
  supera si los escudos no pasan del valor del atributo. Los monstruos normales fallan siempre.
- **Héroe derrotado:** deja su ficha en el mapa y pierde sus estados; en su turno solo puede levantarse (recupera algo
  de daño y fatiga), o un héroe adyacente puede reanimarlo.
- **Terreno:** agua (entrar cuesta 2 de movimiento), foso (2 de daño al entrar; dentro no se mueve ni ve más allá de
  lo adyacente; salir cuesta una acción), lava (1 de daño al entrar; quien acaba el turno en ella queda derrotado)
  y obstáculos (bloquean paso y visión).
- **Visión:** de una esquina de la casilla propia a una esquina de la del objetivo sin cruzar paredes, puertas ni
  casillas bloqueadas. Las puertas cerradas cortan paso y visión, y las casillas a ambos lados no son adyacentes.
- **Monstruos grandes:** cuentan el movimiento desde una de sus casillas y se recolocan al acabar.
- **Misiones:** uno o más encuentros, cada uno con mapa, reglas y objetivos propios; gana quien cumple el objetivo
  del último. En campaña, todos ganan 1 punto de experiencia por misión y el oro sale de las cartas de búsqueda.

### Campaña: *The Shadow Rune* / *La Runa de las Sombras*
20 misiones [WIKI]; nueve se juegan en una partida. Orden según la adaptación de la tienda [TIENDA]:
- **Introducción:** First Blood.
- **Acto I (5):** A Fat Goblin, Castle Daerion, The Cardinal's Plight, Death on the Wing, The Masquerade Ball.
- **Interludio (1 de 2):** The Shadow Vault o The Overlord Revealed, según quién ganó más misiones del acto I.
- **Acto II (10):** The Monster's Hoard, The Frozen Spire, The Dawnblade, The Desecrated Tomb, Enduring the
  Elements, The Ritual of Shadows, Blood of Heroes, The Twin Idols, The Wyrm Turns y The Wyrm Rises.
- **Final (1 de 2):** Gryvorn Unleashed o The Man Who Would Be King.
- Personajes: Baron Zachareth se revela como el señor oscuro; salen Splig, Belthir y los tres Farrow [WIKI].

### En Valkyrie: `D2EBase` [VAL]
- 8 héroes (`HeroAshrian`, `HeroAvricAlbright`, `HeroGrisbantheThirsty`, `HeroJainFairwood`,
  `HeroLeoricoftheBook`, `HeroSyndrael`, `HeroTombleBurrowell`, `HeroWidowTarha`) y 8 clases con 72 habilidades.
- 51 objetos: 11 de clase, 20 de tienda del acto I, 14 del acto II y las 6 reliquias. Coincide con la caja.
- 9 monstruos más los 6 lugartenientes (`MonsterLadyElizaFarrow`, `MonsterLordMerickFarrow`,
  `MonsterSirAlricFarrow`, `MonsterBelthir`, `MonsterSplig`, `MonsterBaronZachareth`, todos `small`).
- Activaciones genéricas `Brawler1-3`, `Range1-3` y `Skirmisher1-3`, que usan casi todos los monstruos, más las
  propias de cada grupo (73 secciones en total).
- 70 caras de loseta: `1A` a `30B` y los conectores `Cap`, `Entrance`, `EntranceStair`, `Extension` y
  `Transition` (35 piezas distintas; la caja trae 48 porque repite conectores).
- Las 9 fichas de §1.12, los peligros (`perils.ini`, 26 secciones: 10 menores, 5 mayores y 2 mortales, con
  variantes por número de héroes) y los eventos de viaje (`travel.ini` sortea 12, todos del tipo «todo está
  tranquilo»), además de 107 imágenes de interfaz y 56 pistas de sonido.
- **No están:** cartas de búsqueda, del señor oscuro, de estado y de evento de viaje del juego de mesa (Valkyrie
  sigue el modelo de la app), puertas como ficha y el familiar Reanimate.

---

## 4. DJ02: kit de conversión de la 1ª edición

**Nombres:** *Conversion Kit* / Kit de conversión (?). Código DJ02, según el nombre de su imagen en Valkyrie
(`img/DJ02_Conversion_Kit`) [VAL]. Publicado el 1 de agosto de 2012 [WIKI].

**Qué es:** cartas para jugar en 2ª edición con las figuras de la 1ª. No trae figuras [WIKI].

**Contenido** [WIKI]:
- **48 hojas de héroe:** 20 de la 1ª edición base, 6 de *Well of Darkness*, 6 de *Altar of Despair*, 6 de *Tomb
  of Ice*, 6 de *DungeonQuest* y 4 promocionales (Jonas the Kind, Nara the Fang, Tobin Farslayer y Truthseer
  Kel).
- **50 cartas de monstruo:** 25 grupos con su carta de acto I y de acto II. Del base de 1ª ed.: Bane Spider,
  Beastman, Crypt Dragon, Demon Lord, Giant, Hellhound, Manticore, Naga, Ogre, Razorwing, Skeleton Archer y
  Sorcerer; de *Well of Darkness*: Ferrox, Golem y Kobold; de *Altar of Despair*: Blood Ape, Chaos Beast, Dark
  Priest, Deep Elf y Troll; de *Tomb of Ice*: Ice Wyrm, Lava Beetle, Medusa, Shade y Wendigo.
- **3 cartas de familiar:** Brightblaze, Pico y Skye.
- No cubre *Road to Legend* ni *Sea of Blood* de 1ª edición [WIKI].

**Road to Legend no admite el kit** [EXP]; las colecciones H&M (§14) reeditaron con figuras 36 de esos héroes y
los 25 grupos.

### En Valkyrie: seis packs `ck` [VAL]

| ID | Producto de 1ª ed. | Héroes | Monstruos |
|---|---|---|---|
| `CKD1E` | Descent base (2005) | 20 | 12 |
| `CKWoD` | Well of Darkness | 6 | 3 (Golem, Kobold, Ferrox) |
| `CKAoD` | Altar of Despair | 6 | 5 (Chaos Beast, Dark Priest, Troll, Deep Elf, Blood Ape) |
| `CKToI` | Tomb of Ice | 6 | 5 (Ice Wyrm, Shade, Lava Beetle, Medusa, Wendigo) |
| `CKDQ` | DungeonQuest | 6 | 0 |
| `CKPromo` | Héroes promocionales | 4 | 0 |

- Suman los 48 héroes y los 25 monstruos de la caja. **Faltan los 3 familiares.**
- Sus `name=` y descripciones son literales en inglés y sus portadas son imágenes propias de Valkyrie
  (`img/D1E`…).
- 36 héroes y los 25 monstruos llevan el mismo ID que en las colecciones H&M: cualquiera de los dos packs los
  activa (§1.6).
- **12 héroes solo existen en el kit:** Aurim, Eliam y Kirga (`CKAoD`); Mad Carthos, Red Scorpion, Varikas the
  Dead, Landrec the Wise y Bogran the Shadow (`CKD1E`); Hugo the Glorious (`CKDQ`); Tobin Farslayer (`CKPromo`);
  Laughin Buldar (`CKToI`) y Brother Glyr (`CKWoD`).
  - Aurim, Eliam, Kirga y Laughin Buldar no tienen `name=` y Valkyrie muestra el nombre de la sección (`Aurim`,
    `LaughinBuldar`); usan imagen propia de Valkyrie, igual que Landrec, Bogran, Hugo y Tobin.
  - Mad Carthos, Red Scorpion, Varikas y Brother Glyr sí tienen clave `{ffg:…}` e imagen de la importación: la
    app los trae aunque no salgan en ninguna colección (sin verificar por qué).
- El héroe *Truthseer Kel* del kit es `HeroSeerKel` en `CKPromo` (en *Stewards of the Secret*, Seer Kel).
- Ningún escenario de la tienda pide un pack `ck` [TIENDA].

---

## 5. DJ03: Lair of the Wyrm / La Guarida de la Sierpe

**Tipo:** caja pequeña, primera expansión. Anunciada el 16 de agosto de 2012 y publicada el 17 de diciembre de
2012 [WIKI]. Diseño: Adam Sadler y Brady Sadler [EXP]. **Tema:** la Reina Sierpe Valyndra despierta y sus
híbridos saquean la comarca [TIENDA].

### Contenido [EXP]
- **2 héroes:** Reynhart the Worthy (guerrero) y High Mage Quellen (mago).
- **2 clases:** Champion (guerrero) y Geomancer (mago).
- **8 figuras de monstruo:** Fire Imp 5 (3 esbirros y 2 líderes) y Hybrid Sentinel 3.
- **Lugarteniente:** Valyndra (2 cartas y 1 ficha).
- **Cartas:** 22 de clase, 4 objetos del acto I (Flash Powder, Halberd, Handbow, Magma Blast), 5 del acto II (Bow
  of the Sky, Inscribed Robes, Merciful Boots, Scalemail, Staff of Kellos), 4 de estado (Burning), 1 de búsqueda,
  2 reliquias (Aurium Mail y Valyndra's Bane; en el señor oscuro, Valyndra's Gift y Her Majesty's Malice [WIKI]),
  8 del señor oscuro (clase Punisher [WIKI]), 4 de monstruo, 2 de lugarteniente, 3 de viaje, 6 de sala secreta,
  6 de rumor y 2 de misión avanzada.
- **Fichas:** 12 losetas, 1 loseta de sala secreta, 1 entrada de sala secreta, 12 de valor, 3 de familiar, 8 de
  desafío, 5 de monstruo inactivo, 5 de estado, 7 de daño y 5 de fatiga.

### Reglas y mecánicas nuevas [EXP]
1. **Rumores.** El señor oscuro empieza la campaña con 3 cartas de rumor y juega como mucho una por fase de
   campaña; abren misiones de rumor.
2. **Misiones avanzadas.** Llegan como recompensa, siguen disponibles hasta completarse y no cuentan para el
   número de misiones de la campaña.
3. **Salas secretas.** Una carta de búsqueda pone una entrada; al entrar se roba una carta de sala, se coloca la
   loseta y fichas de desafío boca abajo (monstruos o pruebas de atributo). Limpiarla da recompensa.
4. **Estado *Burning*** y **monstruos inactivos** (no se activan hasta recibir daño).
5. **Fichas de clase:** valor (Champion) y Piedras invocadas (familiares del Geomancer).
6. **Minicampaña** (reglas publicadas aparte): tres misiones seguidas y un final, sin rumores, de 5 a 8 horas, con
   4 PX y 100 de oro por héroe al empezar; todos ganan 1 PX tras cada misión [EXP].

### Misiones
Cinco en la guía [EXP]: **Gold Digger** (de rumor), **Rude Awakening**, **What's Yours Is Mine**, **At the
Forge** y **Armed to the Teeth** (avanzada). En la minicampaña se juegan en ese orden las tres primeras y el
final es *At the Forge* si van por delante los héroes o *Armed to the Teeth* si va por delante el señor oscuro
[EXP]. Adaptación en la tienda: *Lair of the Wyrm*, de Tantum [TIENDA].

### En Valkyrie: `LotW` [VAL]
- 2 héroes, 2 clases (18 habilidades) y 14 objetos (3 de clase, 4 + 5 de tienda y 2 reliquias): todo lo de la caja.
- `MonsterFireImp` (`ranged hot cursed small`), `MonsterHybridSentinel` (`melee mountain cave small`) y
  `MonsterValyndra` (`lieutenant massive`).
- Losetas 31 a 35 y la sala secreta `S1` (12 caras, imágenes de la app salvo algunas propias); la caja trae 12
  losetas más la sala.
- Fichas `TokenSecretA` y `TokenSecretB`, con imágenes propias de Valkyrie.
- No están: valor, familiares, desafío, monstruo inactivo, salas secretas ni rumores (se escriben como eventos).
- La piden *Dark Elements* (cooperativa) y *Embers of Dread* (Road to Legend).

---

## 6. DJ04: Labyrinth of Ruin / Laberinto de Perdición

**Tipo:** caja grande, segunda expansión. Anunciada el 5 de febrero de 2013 y publicada el 5 de julio de 2013
[WIKI]. Diseño: Adam Sadler [EXP]. **Tema:** las ruinas de Sudanya y la hechicera Ariad, que quiere apagar el sol
[EXP] [TIENDA].

### Contenido [EXP]
- **4 héroes:** Dezra the Vile (maga), Logan Lashley (explorador), Pathfinder Durik (guerrero) y Ulma Grimstone
  (sanadora).
- **4 clases:** Apothecary (sanador), Beastmaster (guerrero), Hexer (mago) y Treasure Hunter (explorador).
- **13 figuras:** Goblin Witcher 4, Volucrix Reaver 4, Carrion Drake 3 y Arachyura 2.
- **2 dados verdes de poder** (nuevos) y 3 peanas.
- **Cartas:** 43 de clase, 11 objetos del acto I, 10 del acto II, 4 de estado (Cursed), 3 reliquias (Sun Stone,
  Living Heart, Gauntlets of Power; Sun's Fury, Fallen Heart, Gauntlets of Spite en su otra cara [WIKI]), 6 de
  habilidad de aliado, 19 del señor oscuro, 8 de monstruo, 5 de lugarteniente, 2 de aliado y 8 de viaje.
- **Fichas:** 18 losetas, 4 de lugarteniente, 2 de aliado, 8 de elixir, 20 de maleficio, 1 de lobo familiar, 3
  de maleza, 7 de objetivo, 1 de Sun Stone, 5 de estado, 20 de daño y 20 de fatiga.

### Reglas y mecánicas nuevas [EXP]
1. **Dado verde de poder**, como el rojo y el amarillo.
2. **Aliados:** Serena y Raythen. Los controlan los héroes en algunas misiones, una activación por ronda; mejoran
   con cartas de habilidad de aliado. La campaña solo deja reclutar a uno [FFG].
3. **Fichas de clase:** elixires (Apothecary), maleficio (Hexer) y el lobo (Beastmaster).
4. **Sun Stone:** reliquia que pueden llevar héroes o monstruos; si acaba en manos de un monstruo, el señor oscuro
   gana otra reliquia.
5. **Elevación** (líneas de puntos: bloquean el movimiento, no la visión; dan defensa en cuerpo a cuerpo salvo
   con Alcance) y **maleza** (se atraviesa pero corta la visión y los ataques).
6. **Estado *Cursed***, **mazo básico II** del señor oscuro (15 cartas) y cartas de recompensa de misión.

### Campaña *Labyrinth of Ruin* (19 misiones; 9 por partida) [EXP] [FFG] [WIKI]
- **Introducción:** Ruinous Whispers.
- **Acto I (3 de 8):** Gathering Foretold (lleva a Serena), Honor Among Thieves (lleva a Raythen), Reclamation,
  Through the Mist, Barrow of Barris, Secrets in Stone, Fury of the Tempest y Back from the Dead.
- **Interludio:** dos opciones en las profundidades de Sudanya; probablemente Let the Truth Be Buried y Fire and
  Brimstone (sin verificar).
- **Acto II (3 de 6):** Fountain of Insight, Web of Power, Fortune and Glory, Heart of the Wilds, Pilgrimage y
  Tipping the Scales.
- **Final:** A Glimmer of Hope si los héroes ganaron *Tipping the Scales*; si no, Endless Night.
- Lugarteniente: Ariad (también como Queen Ariad, su forma de araña) [EXP] [FFG].

### En Valkyrie: `LoR` [VAL]
- 4 héroes, 4 clases (32 habilidades, sin la carta básica) y 29 objetos (6 de clase, 10 + 10 de tienda y 3
  reliquias). **Falta Jinn's Lamp** (acto I). Ojo: el ID de la runa de teletransporte es `ItemTeleportaionRune`
  (sic).
- `MonsterGoblinWitcher`, `MonsterVolucrixReaver`, `MonsterCarrionDrake` (los tres `small`) y
  `MonsterArachyura` (`huge`).
- Lugartenientes `MonsterAriad` (`small`), `MonsterQueenAriad` (`huge`), `MonsterRaythen` y `MonsterSerena`
  (`small`): Raythen y Serena están como enemigos; no hay aliados.
- Losetas 36 a 43 (8 piezas, 16 caras; la 43 también está en `TT`); la caja trae 18.
- Ficha `TokenSunStone`. No hay elixir, maleficio, maleza ni lobo.
- La piden 4 escenarios de la tienda y *Embers of Dread* (Road to Legend).

---

## 7. DJ05: The Trollfens / La Ciénaga del Troll

**Tipo:** caja pequeña, tercera expansión. Anunciada el 7 de junio de 2013 y publicada el 11 de octubre de 2013
[WIKI]. Diseño: Justin Kemppainen con Adam Sadler [EXP]. **Tema:** una peste en los pantanos y el troll
Bol'Goreth [EXP] [WES].

### Contenido [EXP]
- **2 héroes:** Augur Grisom (sanador) y Roganna the Shade (exploradora).
- **2 clases:** Prophet (sanador) y Stalker (explorador).
- **7 figuras:** Harpy 4 y Plague Worm 3. **1 dado verde.**
- **Lugarteniente:** Bol'Goreth.
- **Cartas:** 22 de clase, 8 objetos del acto I (Belt of Alchemy, Belt of Waterwalking, Deflecting Shield, Dire
  Flail, Guardian Axe, Lifedrain Scepter, Mapstone, Trident), 5 del acto II (Belt of Strength, Blasting Rune,
  Boomerang, Glaive, Stone Armor), 4 de estado (Weakened), 1 de búsqueda, 3 reliquias (Immunity Elixir, Mending
  Talisman, Workman's Ring [WIKI]), 10 del señor oscuro (clase Infector), 4 de monstruo, 2 de lugarteniente, 3 de
  viaje, 6 de sala secreta, 6 de rumor y 2 de misión avanzada.
- **Fichas:** 9 losetas, 1 loseta y 1 entrada de sala secreta, 1 de visión (Insight), 6 de trampa, 16 de
  infección, 8 de desafío y 5 de estado.

### Reglas y mecánicas nuevas [EXP]
1. **Estado *Weakened*.**
2. **Infección:** la clase Infector del señor oscuro pone fichas en las hojas de héroe, que duran hasta el final
   de la misión.
3. **Trampas** (Stalker): fichas en el mapa que no bloquean nada; una por casilla.
4. **Visión** (Prophet): una ficha que pasa de un héroe a otro.
5. **Salas secretas, rumores y misiones avanzadas**, como en LotW, y una **minicampaña** de 4 misiones sin
   rumores, con el final según quién ganó más misiones.

### Misiones [EXP] [TIENDA]
**Ghost Town** (de rumor), **Food for Worms**, **Three Heads, One Mind** y dos finales: **Source of Sickness**
(si van por delante los héroes) y **Spreading Affliction** (si va el señor oscuro). Adaptación en la tienda: *The
Trollfens*, de Tantum.

### En Valkyrie: `TT` [VAL]
- 2 héroes, 2 clases (18 habilidades) y 19 objetos (4 de clase, 7 + 5 de tienda y 3 reliquias). **Falta
  Mapstone** (acto I).
- `MonsterHarpy` (`melee wilderness mountain small`), `MonsterPlagueWorm` (`melee water cave medium`) y
  `MonsterBolGoreth` (`lieutenant huge`).
- Losetas 43 a 49 y la sala secreta `S2` (16 caras; la 43 está repetida en `LoR`). Fichas `TokenSecretA/B`.
- No están: infección, trampa, visión, desafío ni salas secretas como mecánica.

---

## 8. DJ07: Shadow of Nerekhall / La Sombra de Nerekhall

**Tipo:** caja grande, cuarta expansión. Anunciada el 28 de octubre de 2013 y publicada el 31 de marzo de 2014
[WIKI]. Diseño: Justin Kemppainen [EXP]. **Tema:** la ciudad de Nerekhall, la corrupción y el Reino Negro (*Black
Realm*) [BGG].

### Contenido [EXP] [WIKI]
- **4 héroes:** Orkell the Swift (guerrero), Tinashi the Wanderer (exploradora), Ravaella Lightfoot (maga) y
  Rendiel (sanador).
- **4 clases:** Skirmisher (guerrero), Bard (sanador), Conjurer (mago) y Shadow Walker (explorador).
- **12 figuras:** Rat Swarm 4, Changeling 4, Ironbound 2 e Ynfernael Hulk 2. **2 dados verdes.**
- **Cartas:** 45 de clase, 11 objetos del acto I y 10 del acto II, 4 de estado (Bleeding), 3 reliquias (Shadow
  Plotter, Ynfernal Rune, Spirited Scythe), 12 del señor oscuro (7 Shadowmancer y 5 universales), 8 de monstruo,
  8 de lugarteniente, 10 de evento de ciudad y 9 de ciudadano corrupto.
- **46 losetas** y fichas: 4 de rastrillo, 2 de canción, 4 de imagen, 3 de influencia, 1 de familiar (Shadow
  Soul), 6 de objetivo, 4 de héroe, 4 de lugarteniente y 5 de estado.

### Reglas y mecánicas nuevas [EXP]
1. **Canciones** (Bard), **imágenes** (Conjurer, copias de sí mismo en el mapa) y el familiar **Shadow Soul**
   (Shadow Walker).
2. **Rastrillos** (bloquean el paso, no la visión; se abren con una acción), **elevación** y **casillas de
   peligro** (contorno amarillo, como la lava).
3. **Viaje por la ciudad:** mapa de campaña propio y cartas de evento de ciudad en vez de eventos de viaje.
4. **Influencia:** el señor oscuro elige en secreto un efecto por misión.
5. **Ciudadanos corruptos:** cartas que el señor oscuro pone en los Changeling.
6. **Estado *Bleeding*.**

### Campaña *Shadow of Nerekhall* (19 misiones según la prensa [BGG]; agrupación aproximada) [EXP]
- **Introducción:** A Demonstration.
- **Acto I:** Nightmares Lost, Civil War, Without Mercy, Local Politics, Prey, Price of Power, The Incident,
  Rat-Thing King y Respected Citizen.
- **Interludio:** The True Enemy o Traitors Among Us.
- **Acto II:** Overdue Demise, Arise My Friends, Into the Dark y Widespread Panic (falta una por identificar).
- **Final:** The Black Realm o The City Falls.
- Lugartenientes: Rylan Olliven, Verminous (el Rey Rata), Tristayne Olliven y Gargan Mirklace.

### En Valkyrie: `SoN` [VAL]
- 4 héroes, 4 clases (37 habilidades) y 30 objetos (7 de clase, 10 + 10 de tienda y 3 reliquias). **Falta
  Archaic Scroll** (acto I).
- `MonsterRatSwarm` (`medium`), `MonsterChangeling` y `MonsterIronbound` (`small`), `MonsterYnfernaelHulk`
  (`huge`); lugartenientes `MonsterGarganMirklace` (`huge`), `MonsterRylanOlliven` y `MonsterTristayneOlliven`
  (`small`) y `MonsterVerminous` (`medium`).
- Losetas 50 a 69 y los conectores `CapSoN`, `EntranceSoN`, `ExtensionSoN`, `TransitionSoN` y `TransitionSoN2`
  (25 piezas, 50 caras; 25 caras con rasgo `city` y 24 con `blackrealm`). La caja trae 46 piezas.
- Sin fichas nuevas: rastrillo, canción, imagen e influencia se resuelven con texto.
- La pide *Nerekhall: Seeds of Corruption* en Road to Legend y 4 escenarios de la tienda.

---

## 9. DJ21: Manor of Ravens / La Mansión de los Cuervos

**Tipo:** caja pequeña, quinta expansión. Anunciada el 21 de marzo de 2014 y publicada el 14 de agosto de 2014
[WIKI]. Diseño: Nathan I. Hajek [EXP]. **Tema:** la mansión cambiante del difunto gran mago Ithyndrus, cerca de
Greyhaven, y Skarn, un constructo que crece [TIENDA].

### Contenido [EXP] [WIKI]
- **2 héroes:** Alys Raine (guerrera) y Thaiden Mistpeak (explorador).
- **2 clases:** Marshal (guerrero) y Bounty Hunter (explorador). **2 clases del señor oscuro:** Enchanter y
  Unkindness.
- **8 figuras:** Bandit 5 y Wraith 3. **Lugarteniente:** Skarn.
- **Cartas:** 21 de clase, 18 del señor oscuro, 4 de estado (Doomed), 4 reliquias, 9 objetos (acto I: Blessed
  Shield, Shadow Bracers, Staff of Greyhaven, Undying Skull, White Wolf Cloak; acto II: Hammer of Doom, Heart
  Seeker, Rune of Fate, Winged Blade [WIKI]), 4 de monstruo, 1 de sirviente, 4 de rumor, 3 de misión avanzada y 2
  de lugarteniente.
- **16 losetas** y fichas: 1 de rastreo, 1 de sirviente (la Bandada de Cuervos), 1 de objetivo, 1 de
  lugarteniente y 5 de estado.

### Reglas y mecánicas nuevas [EXP]
1. **Estado *Doomed*:** el héroe sufre 1 daño más cada vez que sufre daño.
2. **Rastreo** (Bounty Hunter): una ficha sobre el monstruo perseguido.
3. **Reliquias de monstruo** (el señor oscuro las asigna a un grupo en cada encuentro) y **reliquias
   universales** (efecto para toda la campaña). Reliquias: Book of Stars, Shards of Ithyndrus, The Manor's Heart
   y Wanderer's Stone [WIKI].
4. **Sirvientes:** la clase Unkindness invoca la Bandada de Cuervos, que actúa como un grupo propio.
5. **Cartas de misión** que se quedan hasta completarse y una **minicampaña** corta sin rumores.

### Misiones [EXP] [TIENDA]
Acto I: **Spread Your Wings**, **Finders and Keepers** y **My House, My Rules**; finales: **Where the Heart Is**,
**Wrong Man for the Job** y **Beneath the Manor**. Sale también Ollen Threeblade, jefe de bandidos. Adaptación en
la tienda: *Manor of Ravens*, de Tantum y Xyphistor.

### En Valkyrie: `MoR` [VAL]
- 2 héroes, 2 clases (18 habilidades) y 15 objetos (3 de clase, 5 + 4 de tienda y 3 reliquias). **Falta The
  Manor's Heart.**
- `MonsterBandit` (`ranged wilderness building small`), `MonsterWraith` (`ranged civilized cursed small undead`)
  y `MonsterSkarn` (`lieutenant huge`).
- Losetas 70 a 77 (8 piezas, 16 caras). Sin fichas nuevas; no hay sirviente ni rastreo.
- Es la expansión que más piden los escenarios de la tienda después de DooM (6).

---

## 10. DJ40: Mists of Bilehall / Las Brumas de Castrohiel

**Tipo:** caja pequeña, sexta expansión, **sin héroes ni clases** [WIKI]. Anunciada el 1 de agosto de 2015 y
publicada a principios de 2016 (el wiki da el 11 de enero y cita una noticia de febrero) [WIKI]. Diseño: Kara
Centell-Dunk y Nathan I. Hajek [EXP]. **Tema:** las Tierras Brumosas (*Mistlands*) de Terrinoth, sus no muertos y
el mal de Bilehall, que corrompe a los héroes [BGG].

### Contenido [EXP]
- **12 figuras:** Reanimate, Broodwalker y Bone Horror (el wiki da 6, ¿3? y 3; reparto sin verificar).
- **Lugartenientes:** Ardus Ix'Erebus, Kyndrithul y Zarihell (3 cartas y 3 fichas).
- **Cartas:** 6 de monstruo, 4 de estado (Terrified), 3 reliquias (Fear Eater, The White Crown, Undertaker's
  Coat [WIKI]), 8 objetos del acto I (Battle Tome, Bloodscript Ring, Corpsebug Brooch, Marsh Cloak, Mistbane,
  Soulbound Sword, Soulstone, Witch Hazel Bow), 6 de impureza (*Tainted*) y 5 de viaje.
- **13 losetas** y fichas: 3 de muro viejo, 12 de terreno que se desmorona, 8 de héroe, 5 de estado y 12 de daño.

### Reglas y mecánicas nuevas [EXP]
1. **Terrenos:** peligro (contorno amarillo, como la lava), **lodo** (*sludge*, contorno naranja: cuesta 1 punto
   de movimiento más y quien empieza en él tiene Velocidad 1) y elevación.
2. **Muros viejos:** cortan la visión y el recuento de casillas; las casillas a ambos lados no son adyacentes.
3. **Terreno que se desmorona:** quita el resto de terreno de la casilla. Un héroe que entra puede hacer una prueba
   para despejarlo; si falla o no la hace, la ficha se retira y sufre el terreno de debajo, con castigo si cuesta
   movimiento extra (detalle sin verificar).
4. **Cartas de impureza:** una boca abajo por héroe al empezar la misión, que da +2 de Salud; se revela al caer el
   héroe y aplica un castigo hasta el final.
5. **Estado *Terrified*** y reliquias de monstruo. No hay rumores.

### Campaña de un acto (5 misiones por partida) [EXP] [TIENDA]
- **Introducción:** Strange Awakening.
- **Acto I (el ganador elige entre dos enlazadas):** Sanguine Lord, Song of Bone, Fear Unshackled, Shattered
  Schemes, Troubled Waters y Juliden's Keep.
- **Final:** Hallowing Fire, en dos encuentros; el segundo depende de quién ganó *Juliden's Keep* o *Shattered
  Schemes*.
- Se puede unir a *The Chains That Rust* en una campaña de dos actos (§11).

### En Valkyrie: `MoB` [VAL]
- Sin héroes ni clases. 11 objetos (8 del acto I y 3 reliquias): todo lo de la caja.
- `MonsterBoneHorror`, `MonsterReanimate` y `MonsterBroodwalker` (`small undead`; el Bone Horror es `melee` pero
  usa activaciones `Range2 Range3`).
- Lugartenientes `MonsterArdusIxErebus`, `MonsterKyndrithul` y `MonsterZarihell` (`small`), repetidos en `TCTR`.
- Losetas 78 a 87 y `EntranceSwamp` (11 piezas, 22 caras; rasgos `swamp` y `sludge`); la caja trae 13.
- Ficha `TokenCrumblingTerrain`. No hay muro viejo; impureza y *Terrified* van en texto.
- Es el pack más consultado como opcional en la tienda (`#MoB`, 332 veces), casi todo en *Chains of Bilehall*.

---

## 11. DJ44: The Chains That Rust / Las Cadenas del Óxido

**Tipo:** caja pequeña, séptima expansión. Anunciada el 11 de mayo de 2016 y publicada el 1 de septiembre de 2016
[WIKI]. Diseño: Kara Centell-Dunk, Daniel Lovat Clark, Nathan I. Hajek y Paul Winchester [EXP]. Road to Legend la
añadió en el verano de 2016, en la versión 1.1.6 o 1.1.7 [APP] (la ficha no empareja bien notas y versiones).

### Contenido [EXP] [WIKI]
- **4 clases híbridas** (16 cartas): Watchman (sanador, híbrida explorador), Monk (explorador, híbrida sanador),
  Battlemage (mago, híbrida guerrero) y Steelcaster (guerrero, híbrida mago).
- **8 figuras:** Shambling Colossus 3, The Dispossessed 3 y Marrow Priest 2; 2 muros viejos con peana.
- **Cartas:** 9 objetos del acto II (Blessed Armor, Bloodthirsty Bracers, Bone Wand, Fists of Iron, Horned Shield,
  Lightning Javelin, Mask of Horrors, Rune-Touched Leather, Sash of the Slayer), 3 reliquias (Boneborn Bow,
  Forewarned Ring, Robes of the Last), 8 del señor oscuro (clase Soulbinder), 6 de monstruo, 2 de viaje, 6 de
  impureza, 3 de lugarteniente del acto II y 1 de sirviente (Scourge).
- **15 losetas** y fichas: 8 de terreno que se desmorona, 8 de héroe, 1 de objetivo, 1 de aldeano, 5 de estado y
  16 de daño.

### Reglas y mecánicas nuevas [EXP]
1. **Clases híbridas.** El héroe elige una clase híbrida de su arquetipo; su carta básica le hace añadir una clase
   normal de otro arquetipo (el que indica la carta). Recibe las habilidades básicas y el equipo de esa clase y
   puede comprar cartas de las dos, salvo las de 3 PX de la añadida. Su arquetipo no cambia.
2. **Soulbinder** y su sirviente **Scourge**, que reparte daño entre los héroes de alrededor.
3. Repite lodo, elevación, muros viejos, terreno que se desmorona, impureza, *Terrified* y reliquias de monstruo y
   universales de MoB.

### Campaña de un acto [EXP] [TIENDA]
- **Introducción:** Castle Dalibor.
- **Misiones:** Legion's Hunter, Seeking Sanctuary, Halls of Phetra, Freedom from Flesh, Quarry y Unquiet
  Memories; la adaptación de la tienda añade *Taskmaster* (sin verificar en el reglamento).
- **Final:** Profane Nexus.
- **Sola:** cada jugador empieza con 5 PX y cada héroe con 225 de oro, y se usan las cartas del acto II.
- **Unida a MoB:** el final de MoB (*Hallowing Fire*) hace de interludio, se salta *Castle Dalibor* y el ganador
  elige entre *Legion's Hunter* y *Freedom from Flesh* para abrir el acto II. Adaptación en la tienda: *Chains of
  Bilehall* (beta), de Tantum, que permite jugar las dos o cada una por separado.

### En Valkyrie: `TCTR` [VAL]
- 4 clases híbridas (16 habilidades; sin equipo propio, porque usan el de la clase añadida) y 12 objetos (9 del
  acto II y 3 reliquias): todo lo de la caja.
- `MonsterMarrowPriest` (`ranged dark building small`), `MonsterTheDispossessed` (`melee small undead`) y
  `MonsterShamblingColossus` (`melee medium undead`); los tres lugartenientes de Bilehall otra vez.
- Losetas 88 a 98 y copias de 78, 79 y `EntranceSwamp` de MoB (14 piezas, 28 caras); la caja trae 15.
- `TokenCrumblingTerrain`. No hay sirviente Scourge ni muro viejo.

---

## 12. uDJ45: Lost Legends / Leyendas Perdidas

**Tipo:** expansión solo de cartas, la octava y última de la 2ª edición. Anunciada el 11 de febrero de 2019 y
publicada el 20 de junio de 2019 [WIKI]. Código uDJ45: la «u» marca la fabricación propia de FFG [FFG]; SKU
FFGUDJ45 [TND]. Diseño: Jim Cartwright [BGG].

**Contenido:** 59 cartas de clase [WIKI]:
- **2 clases normales:** Soul Reaper (sanador; convierte la esencia de los monstruos derrotados en curación) y
  Elementalist (mago) [FFG].
- **8 híbridas:** Avenger (guerrero/sanador), Raider (guerrero/explorador), Truthseer (mago/explorador),
  Lorekeeper (mago/sanador), Trickster (explorador/mago), Ravager (explorador/guerrero), Heretic (sanador/mago) y
  Crusader (sanador/guerrero). Con las 4 de TCTR quedan cubiertas las 12 combinaciones de arquetipos [FFG].
- Sin héroes, monstruos, losetas ni misiones.

**Road to Legend** la añadió al gestor de colección en 2019 (versión 1.5.2 o 1.5.3; la ficha de App Store no
empareja bien notas y versiones) [APP].

### En Valkyrie: `LL` [VAL]
- 10 clases con 44 habilidades y 3 objetos de clase (`ItemStaffOfConflux`, con clave `ITEM_SPIRE_OF_CONFLUX`;
  `ItemRuneshardCache`; `ItemHarvesterScythe`).
- El Soul Reaper es `ClassSoulCollector` (clave `CLASS_SOUL_COLLECTOR_NAME`): el nombre que ve el jugador sale de
  la app.
- Lorekeeper, Heretic, Truthseer y Crusader tienen 3 habilidades y no 4 (les falta la básica en los datos).
- Ningún escenario de la tienda la pide ni consulta `#LL`.

---

## 13. DJ39: Heirs of Blood / Herederos de Sangre

**Tipo:** libro de campaña, el primero de la 2ª edición. Anunciado en noviembre de 2014 y a la venta el 23 de abril
de 2015 [FFG] [BLOG]. SKU FFGDJ39 [TND].

**Contenido:** 32 encuentros nuevos en dos actos y un final de tres encuentros [FFG] [BLOG]. Los héroes protegen
al heredero legítimo de Saradyn frente a la vampira Lady Eliza Farrow, que reclama el trono [TND] [BLOG]. Solo usa
losetas y monstruos del juego base [FFG].

**Misiones** (registro de campaña oficial [EXP]): Introducción; Acolyte of Saradyn, Rellegar's Rest, Blood Will
Tell, The Baron Returns, Siege of Skytower, Archive of Arrizon, Rise of Urthko, Caladen's Crossing, From the
Wreckage, Army of Dal'Zunm, Lord of Flame, Dead or Drowning, Edge of Dawn, Piercing Darkness, Blood and Betrayal,
Rite of the Red Dawn, Saradyn in Flames, Prison of Khinn y Shadowfall Mountain; dos interludios y el final. El
registro no dice a qué acto va cada una.

**Reimpresión del base:** las cajas del base posteriores a 2015 traen *Heirs of Blood* en dos guías de misiones en
lugar de *The Shadow Rune* [EXP] [WIKI].

**En Valkyrie:** no hay pack (no hace falta) ni adaptación en la tienda.

---

## 14. DJ26 a DJ34: colecciones de Héroes y Monstruos

**Qué son:** nueve cajas que reeditan con figuras y cartas de 2ª edición 4 héroes y 3 grupos de monstruos de la
1ª edición [WIKI] [TND]. Cada una trae además 1 carta del señor oscuro, 1 carta de rumor, 1 carta de misión y una
hoja de reglas con 2 misiones nuevas: una de acto I y otra de acto II [WIKI] [TIENDA] (que la de acto I entre por
el rumor y la de acto II por la carta de misión está sin verificar). No traen losetas, clases ni objetos.

| ID | Producto | Anuncio → venta [WIKI] | Carta del señor oscuro | Figuras de monstruo | Notas |
|---|---|---|---|---|---|
| `OotO` | Oath of the Outcast | 9-1-2014 → 15-5-2014 | Hidden Wings | Bane Spider 3, Beastman 4, Razorwing 4 | 15 figuras; en España, Edge, 34,95 € [ES] |
| `CoD` | Crown of Destiny | 19-2-2014 → 11-7-2014 | Fire Gems | Giant 2, Chaos Beast 3, Lava Beetle 4 | Errata del Giant (*Sweep*) [FAQ] |
| `CotF` | Crusade of the Forgotten | 24-4-2014 → 3-10-2014 | Forgotten Sorcery | Golem 2, Medusa 3, Sorcerer 4 | |
| `GoD` | Guardians of Deephall | 7-7-2014 → 28-1-2015 | Power in Numbers | Crypt Dragon, Dark Priest, Wendigo (?) | Dos guerreros y ningún mago |
| `VoD` | Visions of Dawn | 2-1-2015 → 5-6-2015 | Hard Knocks | Manticore, Ogre, Troll (?) | Errata del Troll (*Sweep*) [FAQ] |
| `BotW` | Bonds of the Wild | 23-3-2015 → 6-8-2015 | Hunk of Junk | Kobold 12, Hellhound 4, Deep Elf 2 [FFG] | 22 figuras; 3 cartas y fichas de familiar (Brightblaze, de Challara) |
| `ToC` | Treaty of Champions | 11-8-2015 → 28-1-2016 | Hag's Hunger | Crow Hag 3, Skeleton Archer 5, Demon Lord 2 | Primer grupo nuevo (Crow Hag) |
| `SotS` | Stewards of the Secret | 12-10-2015 → 26-5-2016 | Splice | Ferrox, Blood Ape, Naga (?) | |
| `SoE` | Shards of Everdark | 3-2-2016 → 16-6-2016 | Mockery | Ice Wyrm 2, Dark Minotaur 2, Shade 5 | Dark Minotaur es nuevo; tres guerreros |

(?) = cantidad de figuras sin verificar. Los Kobold vienen como 3 líderes y 9 esbirros, que entran por la
habilidad *Spawner* de los líderes [FFG].

**Misiones** (ver tabla de §0): las 18 tienen adaptación en la tienda, de afellowspelunker, jugables solo con el
base (sustituyen héroes y monstruos que falten con ramas `#ID`) [TIENDA].

**Road to Legend:** las admite en el gestor de colección; por ejemplo, tener *Oath of the Outcast* añade Bane
Spiders a las misiones [FFG]. *Shards of Everdark* llegó a la app en junio de 2016 [APP].

### En Valkyrie: packs `hm` [VAL]
- Cada pack trae `heros.ini` (4 héroes), `monsters.ini` (3 grupos) y `activations.ini` (9 o 10 activaciones con
  textos de la app). No hay objetos, cartas del señor oscuro, rumores, misiones ni familiares.
- IDs curiosos: `HeroGreyKey` (Grey Ker, clave `GREY_KER`), `HeroMasterThorne` (Master Thorn), `MonsterBeastmen`
  (Beastman, clave `BEASTMAN`).
- Los 36 héroes y 25 grupos de 1ª edición repiten ID con los packs `ck` (§1.6); solo `MonsterCrowHag` (`ToC`) y
  `MonsterDarkMinotaur` (`SoE`) son exclusivos de H&M.
- Rasgos que difieren del kit: Manticore `medium` en `VoD`, Wendigo `huge` en `GoD`; Crypt Dragon y
  Dark Priest `undead` en `GoD`; Shade `cold undead` en `SoE`.
- Solo dos escenarios de la tienda exigen colecciones H&M: *Castle Daerion* (`CotF OotO SoE`, más cajas) y *Un
  festival de sangre* (`BotW OotO`, más cajas) [TIENDA].

---

## 15. Packs de Lugarteniente

**Qué traen** [WIKI] [EXP] [BLOG]: la figura de plástico del lugarteniente (sustituye a su ficha de cartón), una
hoja de reglas, **10 cartas de Trama** (*Plot*) con nombre de mazo propio, **2 cartas de Agente** (actos I y II) y
16 fichas de amenaza/fortuna. Raythen y Serena traen además una hoja de héroe y **dos figuras** (la versión buena y
la malvada) [FFG] [BLOG]. Precio de referencia: 14,95 USD [BLOG]. En español se vendieron como «Lugarteniente
Splig», etc. [BGG].

**Reglas** [EXP]:
1. Al empezar la campaña, el señor oscuro elige un solo mazo de Trama. La carta básica (sin coste) empieza boca
   arriba; el resto, boca abajo.
2. Compra cartas con **amenaza** en la fase de campaña. La gana al derrotar héroes, al acabar misiones (más si
   gana) y cambiando experiencia a 3 de amenaza por punto.
3. Usar cartas cuesta amenaza; cada ficha gastada se da la vuelta y pasa a los héroes como **fortuna** (repetir un
   dado, recuperar aguante, una acción más, robar un objeto más).
4. **Agentes:** algunas Tramas meten al lugarteniente como agente en un grupo de monstruos abierto. Actúa como un
   líder, no puede ser refuerzo ni llevar reliquias, no sale en interludios ni finales, ni en misiones donde ya es
   lugarteniente. Si cae, su carta vuelve al mazo.
5. Solo en campaña, no en misiones sueltas.

| ID (= código) | Lugarteniente | Caja de origen | Mazo de Trama [WIKI] | Año [BGG] y notas | Agente en Valkyrie |
|---|---|---|---|---|---|
| `DJ09` | Splig | Base | Goblin Uprising | 2013, primera tanda de seis [FFG] | `small` |
| `DJ10` | Belthir | Base | Hybrid Loyalty | 2013 | `small` |
| `DJ11` | Baron Zachareth | Base | Seeds of Betrayal | 2013 | `small` |
| `DJ12` | Sir Alric Farrow | Base | The Fallen Elite | 2013 | `small` |
| `DJ13` | Lord Merick Farrow | Base | Cursed by Power | 2013 | `small` |
| `DJ14` | Lady Eliza Farrow | Base | Endless Thirst | 2013 | `small` |
| `DJ15` | Valyndra | LotW | Dragon's Greed | 2013 (sin verificar) | `massive` |
| `DJ16` | Raythen | LoR | Skullduggery | 1.er trimestre de 2014 [BLOG]; también héroe | `small`; `HeroRaythen` (explorador) |
| `DJ17` | Serena | LoR | Silent Protector | 1.er trimestre de 2014; también héroe | `small`; `HeroSerena` (sanadora) |
| `DJ18` | Ariad | LoR | Dark Illusions | 1.er trimestre de 2014 | `small` |
| `DJ19` | Queen Ariad | LoR | Tangled Web | 1.er trimestre de 2014 | `huge` |
| `DJ20` | Bol'Goreth | TT | Raging Infection | 2013 [BGG]; Edge entre las editoriales | `huge` |
| `DJ22` | Rylan Olliven | SoN | Inner Corruption | 2014 | `small` |
| `DJ23` | Verminous | SoN | Unseen Legions | 2014 (sin verificar) | `medium` |
| `DJ24` | Tristayne Olliven | SoN | Unstable Forces | 2014 (sin verificar); errata: su ataque del acto II es a distancia [FAQ] | `small` |
| `DJ25` | Gargan Mirklace | SoN | Burning Ambition | 2014 (sin verificar) | `huge` |
| `DJ35` | Skarn | MoR | Twisted Soul | Anunciado el 19-6-2014 [BLOG] | `huge` |
| `DJ41` | Kyndrithul | MoB | Vital Essence | En preventa a finales de 2015 [FFG] | `small` |
| `DJ42` | Zarihell | MoB | Eternal Agony | 2015-2016 (sin verificar) | `small` |
| `DJ43` | Ardus Ix'Erebus | MoB | First Legion | 2015 [BGG] | `small` |

**Road to Legend:** según los foros, si se tiene el pack la app puede invocar al agente con un peligro; en las
misiones de historia usa el lugarteniente de la caja (fuente única: foro de FFG [BLOG]). Valkyrie trae las 6
activaciones de cada agente con textos de la app, lo que confirma que la app los tiene [VAL].

**En Valkyrie:** cada pack `lt` es solo su `content_pack.ini`: el agente `MonsterAgent<Nombre>` (rasgo `agent`,
sin `activation=`) y 6 secciones `MonsterActivationAgent<Nombre>1-6` [VAL]. No hay cartas de Trama ni amenaza.
Ningún escenario de la tienda pide un pack `lt` [TIENDA].

---

## 16. Aventuras cooperativas de cartas (uDJ36, uDJ37, uDJ38)

Tres productos oficiales de impresión bajo demanda que quitan el señor oscuro antes de que existiera la app [EXP]
[BLOG]. Son los únicos modos cooperativos de cartas oficiales: *Delve* no es uno de ellos (§17). Diseño de Jonathon
E. Bove (con Nathan I. Hajek en *Nature's Ire* y *Dark Elements*), según los créditos de sus adaptaciones
[TIENDA].

**Cómo funcionan** [EXP]: de 1 a 4 héroes. Cada ronda tiene una fase de héroes y otra del «señor oscuro» que
resuelve la carta de exploración activa, avanza el destino si no hay ninguna y activa a los monstruos con cartas
de activación. El mazo de exploración tiene un encuentro inicial, tres principales numerados y otros de relleno;
se gana al completar el tercero. Las fichas de perdición y destino avanzan por un marcador: si se juntan, se
pierde. Los héroes ganan experiencia en los dos primeros encuentros principales, el botín sale de los mazos de
tienda y se pasa del acto I al II.

| Código | Producto | Español | Fecha | Pide | Monstruos | Historia |
|---|---|---|---|---|---|---|
| uDJ36 (ISBN 978-1-61661-928-2) | Forgotten Souls | Almas Olvidadas (?) | Impresión bajo demanda desde el 22-7-2014; también en el kit de noche de juego de otoño de 2014 [WIKI] (su PDF de reglas en la web de FFG se llama `ugdj04_co-op_rules.pdf`) | Base | Zombie, Barghest, Flesh Moulder, Shadow Dragon | El destino de Summers Glade [TIENDA] |
| uDJ37 (ISBN 978-1-61661-929-9) | Nature's Ire | La Ira de la Naturaleza (?) | Anunciado el 18-12-2014 [FFG] | Base | Goblin Archer, Ettin, Merriod, Cave Spider | Desaparecidos en Blue Rock; el aldeano Desmond ayuda; final contra Zaldara (errata [FAQ]) |
| uDJ38 (ISBN 978-1-61661-930-5) | Dark Elements | Elementos Oscuros (?) | Anunciado el 10-4-2015 [FFG] | Base y LotW | Fire Imp, Elemental, Hybrid Sentinel, Merriod | Un mundo sin amanecer y el híbrido de dragón Draemor; mecánica de antorchas |

Cada una trae 12 cartas de exploración, 10 de activación y 10 de peligro, hojas de título, de marcador y de
referencia [EXP]. El kit de noche de juego añadía tapetes de cartulina, dados azules translúcidos, fichas de
herida acrílicas y un póster [WIKI].

**En Valkyrie:** sin pack. Las tres están adaptadas en la tienda por afellowspelunker, con 14 o 15 `quest.ini`
cada una y opciones de duración [TIENDA].

---

## 17. Road to Legend: la app y sus campañas

**Qué es:** app gratuita que hace de señor oscuro y vuelve el juego totalmente cooperativo [EXP] [FFG]. Anunciada
el 15 de marzo de 2016 y disponible el 12 de mayo de 2016 para iOS, Android y Amazon [FFG]; después también en
Steam para Windows y macOS (app 477200) [APP] [VAL]. Diseño: Nathan I. Hajek y Justin Kemppainen [BGG]. Última
versión vista: 1.5.8 (1.5.7 es de noviembre de 2025); sigue a la venta [APP]. No confundir con *Road to Legend*
de 1ª edición (2008), una expansión de campaña en caja.

**Cambios de reglas** [EXP]:
1. Sin señor oscuro: todos son héroes y ganan o pierden juntos.
2. **Turnos intercalados:** un héroe, luego un grupo de monstruos que elige la app, y así sucesivamente.
3. La app coloca losetas, fichas y monstruos, y **oculta el mapa** hasta abrir puertas o cumplir objetivos.
4. Las fichas de búsqueda dan oro y cartas, pero también trampas.
5. **Peligros:** se acumulan si los héroes se entretienen y pueden sacar monstruos o hacer daño.
6. **Moral:** empieza igual al número de héroes y baja cuando cae uno; si está a 0 y cae otro, el grupo huye y
   pierde. Se recupera en las ciudades.
7. **Tienda y fama:** las ciudades venden según la fama y el avance de la campaña; la fama también abre misiones.
8. **Campaña:** misiones de historia con cuenta atrás en semanas y misiones secundarias al azar.
9. Los lugartenientes se activan como monstruos, escalan con el número de héroes y hacen pruebas de atributo.
10. **No admite el kit de conversión.**

**Gestor de colección:** el jugador marca cajas, colecciones H&M y packs de lugarteniente, y la app usa sus héroes,
clases, monstruos y objetos [FFG]. Es el modelo del que copia Valkyrie su pantalla de contenido.

### Campañas y modos

| Nombre | Tipo | Fecha | Precio | Pide | Contenido |
|---|---|---|---|---|---|
| Rise of All Goblins | Minicampaña incluida | 12-5-2016 | Incluida | Base | 4 misiones (2 de historia y 2 secundarias) con tutorial; ayudar a Splig [FFG] |
| Kindred Fire | Campaña completa | Junio de 2016 | Gratis [WIKI] | Base | 8 misiones de historia (6 por partida), 2 secundarias propias, 8 secundarias generales y 6 misiones extra, una por expansión de LotW a MoB; contra Merick Farrow [FFG] |
| The Delve | Modo de aventura | 17-10-2016 | 4,99 USD [APP] | Base | 6 fases al azar (4 normales y 2 jefes), unas 2 horas; el base da 15 fases y 5 jefes, y cada expansión con losetas añade de 3 a 7 [FFG] |
| Nerekhall: Seeds of Corruption | Campaña | Enero de 2017 | Gratis | Base y SoN | 7 misiones de historia; Verminous y las facciones de Nerekhall [FFG] |
| Trials of Frostgate | 4 pruebas | 28-9-2017 | 4,99 USD [APP] | Base | Pruebas del Oso, el Halcón, el León y el Lobo, rejugables por puntuación [FFG] |
| Embers of Dread | Campaña | 6-12-2018 | Gratis | Base, LotW y LoR | 6 misiones; una secta (*the Dread*) quiere liberar a Margath, el *Dragonlord*, con ayuda de Belthir; Ashen Hills y Riverwatch [FFG] |

Según el historial de App Store, que no empareja bien versiones y notas, en otoño de 2016 llegaron 9 misiones
secundarias gratuitas y en otoño de 2017, con *Trials of Frostgate*, el español y otros idiomas [APP].

*The Delve* no es una expansión de escaramuzas: es un modo cooperativo de una sola sesión con fases al azar
y mejoras entre fase y fase [FFG].

**Relación con Valkyrie:** Valkyrie no reproduce estas campañas (son contenido de FFG) y la tienda no tiene
adaptaciones suyas. Sí copia el modelo de Road to Legend (peligros, moral, fama, tienda, eventos de viaje) y saca
de la app todos los recursos oficiales de Descent (§1.13, §1.14).

---

## 18. Otros productos y lo que no existe

- **DJ08, Dice Pack:** 9 dados como los del base (azul, 2 rojos y 2 amarillos de ataque y poder; marrón, 2 grises
  y negro de defensa), anunciado para el 2.º trimestre de 2013 [BLOG] [TND]. Sin reglas nuevas ni pack.
- **Kit de noche de juego de otoño de 2014:** incluía *Forgotten Souls* (§16) [WIKI] [BGG].
- **Quest Vault:** herramienta web de FFG para diseñar, imprimir y compartir misiones; se actualizó con el
  contenido de *Labyrinth of Ruin* [FFG].
- **DJ06:** no he identificado ningún producto con este código.
- **Tapetes y fundas oficiales de Descent 2ª ed.:** no he encontrado ninguno (sin verificar).
- **Fuera de alcance:** *Descent: Legends of the Dark* (2021), juego distinto con su app; FFG anunció en abril de
  2026 que deja de publicarse y cancela su tercer acto [FFG]. Tampoco hay en Valkyrie contenido de Imperial
  Assault ni de Descent 3.
- **1ª edición:** *Road to Legend* (2008) y *Sea of Blood* de 1ª edición no los cubre el kit de conversión; el
  pack de la comunidad D1ED trae parte de sus losetas (§19).

---

## 19. Packs de la comunidad: DooM, D1ED y SOTP

Los tres son de tipo `D2ECustom`, se descargan desde la lista `contentPacksManifestDownload.ini` de la tienda y no
son oficiales [COM].

### `DooM`: conversión de *DOOM: The Board Game* (FFG, 2016)
- Autor: Neuntöter (Neuntoter82), 1 de enero de 2023; versión 1.1 en la lista (1.0 en su `content_pack.ini`) [COM].
- **Contenido:** 16 losetas del juego de DOOM (32 caras, `TileSideDooM_01_A`…), 26 fichas (objetivo, progreso,
  amenaza, botiquín, portales de colores activos e inactivos, teletransportadores, granadas y armas), 4 marines
  (`HeroAlpha` a `HeroDelta`, arquetipo propio `DooM`), 4 clases (`ClassMarine1` a `4`, 6 habilidades cada una),
  8 demonios (Cyberdemon, Baron of Hell, Cacodemon, Revenant, Mancubus, Pinky, Imp y Possessed, rasgo `Doom`, con
  activaciones propias) y 11 armas con rasgos `Shotgun`, `Rifle`, `Plasma`, `Heavy`, `Cannon` o `Chainsaw`.
- Textos en inglés y español con claves `{pck:…}`.
- Lo piden 11 escenarios de la tienda [TIENDA]. La wiki de Valkyrie lo pone como ejemplo de pack de la
  comunidad [VAL].
- Para escribir misiones de DooM (portales, cartas de amenaza, armas, energía argent), usa la skill
  `doom-valkyrie`, que se apoya en esta para el formato.

### `D1ED`: losetas de la 1ª edición
- Autor: Neuntöter; versión 1.2 [COM]. Sirve para rehacer mapas de 1ª edición.
- **Contenido real:** 16 piezas del base de 1ª ed. (pasillos, cruces, final y salas de 4×4, 4×6 y 6×6), 1 de
  *Tomb of Ice* («Stomach»), 2 salas de 6×6 de *Road to Legend*, 23 superposiciones de terreno como losetas
  (escombros, barro, foso, agua, lava, hielo, rayo, fuego, trampa, plantilla) y las fichas `Token_Web` y
  `Token_Stairs`. Los ficheros de *Well of Darkness*, *Altar of Despair* y *Sea of Blood* están vacíos.
- Usa la clave `pps` (píxeles por casilla) en cada loseta. Ningún escenario de la tienda lo pide.

### `SOTP`: *Sands of the Past*
- Pack de afellowspelunker (diciembre de 2025, versión 1.2) para una **expansión de la comunidad**, no de FFG,
  hecha por Guido Hansen (Sadgit), Erik Burigo (Painkeeper) y otros con el formato de una caja pequeña: usa el
  base y *Labyrinth of Ruin*, 4 misiones como minicampaña o por rumores, y el modo cooperativo *Road to Peril*
  [COM].
- **Contenido del pack:** 2 héroes (Elga the Pilgrim, sanadora; Runemaker Tara, maga), 2 clases (Hierophant,
  sanador; Psychic, mago), 2 monstruos (Sarcophagus Guard, `small`; Burrowing Horror, `huge`) y 21 objetos (4 de
  clase, 8 del acto I y 9 del acto II). Textos en inglés y alemán.
- La campaña *Sands of the Past* de la tienda pide `LoR` y lo recomienda; lo consulta con `#SOTP` [TIENDA].

---

## 20. Lista consolidada de héroes (72)

60 héroes con figura en productos de 2ª edición (8 del base, 14 de las cajas, 36 de las colecciones H&M y
2 de los packs de lugarteniente) y 12 más que solo existen como hoja del kit de conversión. Arquetipo, producto
e IDs según Valkyrie [VAL], que coincide con el wiki [WIKI] allí donde este da el arquetipo. Nombre en español
solo si tiene fuente (§2).

| Héroe | Arquetipo | Producto de 2ª ed. | Origen en 1ª ed. | ID | Packs de Valkyrie | Español / notas |
|---|---|---|---|---|---|---|
| Ashrian | Sanador | Base | — | `HeroAshrian` | `D2EBase` |  |
| Avric Albright | Sanador | Base | — | `HeroAvricAlbright` | `D2EBase` |  |
| Grisban the Thirsty | Guerrero | Base | — | `HeroGrisbantheThirsty` | `D2EBase` |  |
| Jain Fairwood | Explorador | Base | — | `HeroJainFairwood` | `D2EBase` | Jain Bosquebello [TIENDA] |
| Leoric of the Book | Mago | Base | — | `HeroLeoricoftheBook` | `D2EBase` |  |
| Syndrael | Guerrero | Base | — | `HeroSyndrael` | `D2EBase` |  |
| Tomble Burrowell | Explorador | Base | — | `HeroTombleBurrowell` | `D2EBase` |  |
| Widow Tarha | Mago | Base | — | `HeroWidowTarha` | `D2EBase` |  |
| Reynhart the Worthy | Guerrero | LotW | — | `HeroReynharttheWorthy` | `LotW` | Reynhart el Digno [WES] |
| High Mage Quellen | Mago | LotW | — | `HeroHighMageQuellen` | `LotW` | Gran Mago Quellen [WES] |
| Dezra the Vile | Mago | LoR | — | `HeroDezraTheVile` | `LoR` |  |
| Logan Lashley | Explorador | LoR | — | `HeroLoganLashley` | `LoR` |  |
| Pathfinder Durik | Guerrero | LoR | — | `HeroPathfinderDurik` | `LoR` |  |
| Ulma Grimstone | Sanador | LoR | — | `HeroUlmaGrimstone` | `LoR` |  |
| Augur Grisom | Sanador | TT | — | `HeroAugurGrisom` | `TT` | Grisom el Augur [WES] |
| Roganna the Shade | Explorador | TT | — | `HeroRogannaTheShade` | `TT` | Roganna la Sombra [WES] |
| Orkell the Swift | Guerrero | SoN | — | `HeroOrkelltheSwift` | `SoN` |  |
| Tinashi the Wanderer | Explorador | SoN | — | `HeroTinashiTheWanderer` | `SoN` |  |
| Ravaella Lightfoot | Mago | SoN | — | `HeroRavaellaLightfoot` | `SoN` |  |
| Rendiel | Sanador | SoN | — | `HeroRendiel` | `SoN` |  |
| Alys Raine | Guerrero | MoR | — | `HeroAlysRaine` | `MoR` |  |
| Thaiden Mistpeak | Explorador | MoR | — | `HeroThaidenMistpeak` | `MoR` |  |
| Raythen | Explorador | Pack Raythen (DJ16) | — | `HeroRaythen` | `DJ16` |  |
| Serena | Sanador | Pack Serena (DJ17) | — | `HeroSerena` | `DJ17` |  |
| Trenloe the Strong | Guerrero | OotO | 1ª ed. base | `HeroTrenloeTheStrong` | `CKD1E` `OotO` | «Renloe el Fuerte» (sic) [ES] |
| Elder Mok | Sanador | OotO | 1ª ed. base | `HeroElderMok` | `CKD1E` `OotO` | Mok el Anciano [ES] |
| Shiver | Mago | OotO | Tomb of Ice | `HeroShiver` | `CKToI` `OotO` | Escalofrío [ES] |
| Laurel of Bloodwood | Explorador | OotO | Well of Darkness | `HeroLaurelOfBloodwood` | `CKWoD` `OotO` | Laurel del Bosque Sangriento [ES] |
| Corbin | Guerrero | CoD | Altar of Despair | `HeroCorbin` | `CKAoD` `CoD` |  |
| Jaes the Exile | Mago | CoD | 1ª ed. base | `HeroJaesTheExile` | `CKD1E` `CoD` |  |
| Lindel | Explorador | CoD | DungeonQuest | `HeroLindel` | `CKDQ` `CoD` |  |
| Brother Gherinn | Sanador | CoD | DungeonQuest | `HeroBrotherGherinn` | `CKDQ` `CoD` |  |
| Tahlia | Guerrero | CotF | Altar of Despair | `HeroTahlia` | `CKAoD` `CotF` |  |
| Andira Runehand | Sanador | CotF | 1ª ed. base | `HeroAndiraRunehand` | `CKD1E` `CotF` |  |
| Astarra | Mago | CotF | 1ª ed. base | `HeroAstarra` | `CKD1E` `CotF` |  |
| Tetherys | Explorador | CotF | Well of Darkness | `HeroTetherys` | `CKWoD` `CotF` |  |
| Sahla | Sanador | GoD | Altar of Despair | `HeroSahla` | `CKAoD` `GoD` |  |
| Silhouette | Explorador | GoD | 1ª ed. base | `HeroSilhouette` | `CKD1E` `GoD` |  |
| Mordrog | Guerrero | GoD | 1ª ed. base | `HeroMordrog` | `CKD1E` `GoD` |  |
| Lord Hawthorne | Guerrero | GoD | Well of Darkness | `HeroLordHawthorne` | `CKWoD` `GoD` |  |
| Ispher | Sanador | VoD | 1ª ed. base | `HeroIspher` | `CKD1E` `VoD` |  |
| Sir Valadir | Guerrero | VoD | 1ª ed. base | `HeroSirValadir` | `CKD1E` `VoD` |  |
| Nara the Fang | Guerrero | VoD | Promoción | `HeroNaraTheFang` | `CKPromo` `VoD` |  |
| Master Thorn | Mago | VoD | Well of Darkness | `HeroMasterThorne` | `CKWoD` `VoD` |  |
| Lyssa | Mago | BotW | 1ª ed. base | `HeroLyssa` | `CKD1E` `BotW` |  |
| Ronan of the Wild | Explorador | BotW | 1ª ed. base | `HeroRonanOfTheWild` | `CKD1E` `BotW` |  |
| Vyrah the Falconer | Explorador | BotW | 1ª ed. base | `HeroVyrahTheFalconer` | `CKD1E` `BotW` |  |
| Challara | Mago | BotW | DungeonQuest | `HeroChallara` | `CKDQ` `BotW` |  |
| Grey Ker | Explorador | ToC | 1ª ed. base | `HeroGreyKey` | `CKD1E` `ToC` |  |
| Krutzbeck | Guerrero | ToC | DungeonQuest | `HeroKrutzbeck` | `CKDQ` `ToC` |  |
| Jonas the Kind | Sanador | ToC | Promoción | `HeroJonasTheKind` | `CKPromo` `ToC` |  |
| Zyla | Mago | ToC | Tomb of Ice | `HeroZyla` | `CKToI` `ToC` |  |
| Tatianna | Explorador | SotS | DungeonQuest | `HeroTatianna` | `CKDQ` `SotS` |  |
| Seer Kel (Truthseer Kel en el kit) | Mago | SotS | Promoción | `HeroSeerKel` | `CKPromo` `SotS` |  |
| Okaluk and Rakash | Sanador | SotS | Tomb of Ice | `HeroOkalukAndRakash` | `CKToI` `SotS` |  |
| Nanok of the Blade | Guerrero | SotS | Well of Darkness | `HeroNanokOfTheBlade` | `CKWoD` `SotS` |  |
| One Fist | Guerrero | SoE | 1ª ed. base | `HeroOneFist` | `CKD1E` `SoE` |  |
| Steelhorns | Guerrero | SoE | 1ª ed. base | `HeroSteelhorns` | `CKD1E` `SoE` |  |
| Arvel Worldwalker | Explorador | SoE | Tomb of Ice | `HeroArvelWorldwalker` | `CKToI` `SoE` |  |
| Karnon | Guerrero | SoE | Tomb of Ice | `HeroKarnon` | `CKToI` `SoE` |  |
| Mad Carthos | Mago | solo kit | 1ª ed. base | `HeroMadCarthos` | `CKD1E` |  |
| Red Scorpion | Explorador | solo kit | 1ª ed. base | `HeroRedScorpion` | `CKD1E` |  |
| Varikas the Dead | Guerrero | solo kit | 1ª ed. base | `HeroVarikasTheDead` | `CKD1E` |  |
| Landrec the Wise | Mago | solo kit | 1ª ed. base | `HeroLandrectheWise` | `CKD1E` |  |
| Bogran the Shadow | Explorador | solo kit | 1ª ed. base | `HeroBogranTheShadow` | `CKD1E` |  |
| Brother Glyr | Sanador | solo kit | Well of Darkness | `HeroBrotherGlyr` | `CKWoD` |  |
| Aurim | Sanador | solo kit | Altar of Despair | `HeroAurim` | `CKAoD` | sin `name=` en Valkyrie |
| Eliam | Guerrero | solo kit | Altar of Despair | `HeroEliam` | `CKAoD` | sin `name=` en Valkyrie |
| Kirga | Explorador | solo kit | Altar of Despair | `HeroKirga` | `CKAoD` | sin `name=` en Valkyrie |
| Laughin Buldar | Guerrero | solo kit | Tomb of Ice | `HeroLaughinBuldar` | `CKToI` | sin `name=` en Valkyrie |
| Hugo the Glorious | Guerrero | solo kit | DungeonQuest | `HeroHugoTheGlorious` | `CKDQ` |  |
| Tobin Farslayer | Explorador | solo kit | Promoción | `HeroTobinFarslayer` | `CKPromo` |  |

Por arquetipo, los 60 con figura de 2ª edición son 18 guerreros, 16 exploradores, 13 magos y 13 sanadores; con
los 12 del kit, 22, 20, 15 y 15 [VAL].

---

## 21. Lista consolidada de clases (36)

24 clases normales (6 por arquetipo) y 12 híbridas (todas las combinaciones de dos arquetipos) [WIKI] [VAL]. La
columna «Híbrida con» es el arquetipo de la clase normal que se añade (`hybridarchetype`).

| Clase | Arquetipo | Híbrida con | Producto | ID | Equipo inicial (IDs de Valkyrie) |
|---|---|---|---|---|---|
| Thief | Explorador | — | Base | `ClassThief` | `ItemThrowingKnives` `ItemLuckyCharmThief` |
| Wildlander | Explorador | — | Base | `ClassWildlander` | `ItemYewShortbow` |
| Knight | Guerrero | — | Base | `ClassKnight` | `ItemIronLongsword` `ItemWoodenShieldKnight` |
| Berserker | Guerrero | — | Base | `ClassBerserker` | `ItemChippedGreataxe` |
| Necromancer | Mago | — | Base | `ClassNecromancer` | `ItemReapersScythe` |
| Runemaster | Mago | — | Base | `ClassRunemaster` | `ItemArcaneBolt` |
| Disciple | Sanador | — | Base | `ClassDisciple` | `ItemIronMace` `ItemWoodenShieldDisciple` |
| Spiritspeaker | Sanador | — | Base | `ClassSpiritSpeaker` | `ItemOakStaff` |
| Champion | Guerrero | — | LotW | `ClassChampion` | `ItemHornOfCourage` `ItemWornGreatsword` |
| Geomancer | Mago | — | LotW | `ClassGeomancer` | `ItemStasisRune` |
| Treasure Hunter | Explorador | — | LoR | `ClassTreasureHunter` | `ItemLeatherWhip` `ItemTheDeadMansCompass` |
| Beastmaster | Guerrero | — | LoR | `ClassBeastmaster` | `ItemHuntingSpear` `ItemSkinningKnife` |
| Hexer | Mago | — | LoR | `ClassHexer` | `ItemStaffOfTheGrave` |
| Apothecary | Sanador | — | LoR | `ClassApothecary` | `ItemSmokingVials` |
| Stalker | Explorador | — | TT | `ClassStalker` | `ItemBlackWidowsWeb` `ItemHuntingKnife` |
| Prophet | Sanador | — | TT | `ClassProphet` | `ItemIronFlail` `ItemSagesTome` |
| Shadow Walker | Explorador | — | SoN | `ClassShadowWalker` | `ItemFeatheredHatchet` `ItemTribalCloak` |
| Skirmisher | Guerrero | — | SoN | `ClassSkirmisher` | `ItemJaggedHandaxe` `ItemRustedHandaxe` |
| Conjurer | Mago | — | SoN | `ClassConjurer` | `ItemPrismaticStaff` |
| Bard | Sanador | — | SoN | `ClassBard` | `ItemTravelersBlade` `ItemLute` |
| Bounty Hunter | Explorador | — | MoR | `ClassBountyHunter` | `ItemDoubleCrossbow` |
| Marshal | Guerrero | — | MoR | `ClassMarshal` | `ItemWarHammer` `ItemSignetRing` |
| Monk | Explorador | Sanador | TCTR | `ClassMonk` | — (usa el de la clase añadida) |
| Steelcaster | Guerrero | Mago | TCTR | `ClassSteelcaster` | — (usa el de la clase añadida) |
| Battlemage | Mago | Guerrero | TCTR | `ClassBattlemage` | — (usa el de la clase añadida) |
| Watchman | Sanador | Explorador | TCTR | `ClassWatchman` | — (usa el de la clase añadida) |
| Ravager | Explorador | Guerrero | LL | `ClassRavager` | — (usa el de la clase añadida) |
| Trickster | Explorador | Mago | LL | `ClassTrickster` | — (usa el de la clase añadida) |
| Avenger | Guerrero | Sanador | LL | `ClassAvenger` | — (usa el de la clase añadida) |
| Raider | Guerrero | Explorador | LL | `ClassRaider` | — (usa el de la clase añadida) |
| Elementalist | Mago | — | LL | `ClassElementalist` | `ItemStaffOfConflux` `ItemRuneshardCache` |
| Lorekeeper | Mago | Sanador | LL | `ClassLorekeeper` | — (usa el de la clase añadida) |
| Truthseer | Mago | Explorador | LL | `ClassTruthseer` | — (usa el de la clase añadida) |
| Soul Reaper (ID `SoulCollector`) | Sanador | — | LL | `ClassSoulCollector` | `ItemHarvesterScythe` |
| Crusader | Sanador | Guerrero | LL | `ClassCrusader` | — (usa el de la clase añadida) |
| Heretic | Sanador | Mago | LL | `ClassHeretic` | — (usa el de la clase añadida) |

---

## 22. Lista consolidada de monstruos (56 grupos)

Columnas:
- **Español:** nombre usado en las traducciones de la tienda de Valkyrie [TIENDA] salvo que se indique otra fuente;
  todos (?) (§2).
- **Figuras:** total (esbirros + líderes) en el producto de 2ª ed. [EXP] [WIKI] [FFG]; «?» = sin verificar.
- **Ataque, tamaño, entorno y no muerto:** rasgos de Valkyrie [VAL]. Con «/», el valor cambia entre el pack del
  kit (primero) y el de la colección H&M. En el Shade, `dark` es del kit y `cold` de `SoE`.
- Los lugartenientes y agentes van aparte (§23).

| Monstruo | Español (?) | Producto de 2ª ed. | 1ª ed. | Figuras | Ataque | Tamaño | Entorno | No muerto | ID | Packs |
|---|---|---|---|---|---|---|---|---|---|---|
| Zombie | Zombi | Base | — | 5 (4+1) | melee | small | cursed building | sí | `MonsterZombie` | `D2EBase` |
| Goblin Archer | Arquero goblin | Base | — | 5 (4+1) | ranged | small | cave building |  | `MonsterGoblinArcher` | `D2EBase` |
| Cave Spider | Araña de las cavernas | Base | — | 5 (4+1) | melee | small | cave wilderness |  | `MonsterCaveSpider` | `D2EBase` |
| Flesh Moulder | Moldeador de carne | Base | — | 4 (3+1) | ranged | small | cursed civilized |  | `MonsterFleshMoulder` | `D2EBase` |
| Barghest | Barghest | Base | — | 4 (3+1) | melee | medium | dark wilderness | sí | `MonsterBarghest` | `D2EBase` |
| Ettin | Ettin | Base | — | 2 (1+1) | melee | huge | mountain cave |  | `MonsterEttin` | `D2EBase` |
| Elemental | Elemental | Base | — | 2 (1+1) | ranged | huge | cold hot |  | `MonsterElemental` | `D2EBase` |
| Merriod | Merriod | Base | — | 2 (1+1) | melee | huge | water wilderness |  | `MonsterMerriod` | `D2EBase` |
| Shadow Dragon | Dragón de las sombras | Base | — | 2 (1+1) | melee | massive | dark cave |  | `MonsterShadowDragon` | `D2EBase` |
| Fire Imp | Diablillo de fuego [WES] | LotW | — | 5 (3+2) | ranged | small | hot cursed |  | `MonsterFireImp` | `LotW` |
| Hybrid Sentinel | Centinela híbrido [WES] | LotW | — | 3 (2+1) | melee | small | mountain cave |  | `MonsterHybridSentinel` | `LotW` |
| Goblin Witcher | Brujo goblin | LoR | — | 4 (3+1) | ranged | small | building cursed |  | `MonsterGoblinWitcher` | `LoR` |
| Volucrix Reaver | Segador volucrix | LoR | — | 4 (3+1) | melee | small | building mountain |  | `MonsterVolucrixReaver` | `LoR` |
| Carrion Drake | Draco carroñero | LoR | — | 3 (2+1) | melee | small | water dark |  | `MonsterCarrionDrake` | `LoR` |
| Arachyura | Arachyura | LoR | — | 2 (1+1) | melee | huge | wilderness cursed |  | `MonsterArachyura` | `LoR` |
| Harpy | Arpía [WES] | TT | — | 4 (3+1) | melee | small | wilderness mountain |  | `MonsterHarpy` | `TT` |
| Plague Worm | Gusano de plaga [WES] | TT | — | 3 (2+1) | melee | medium | water cave |  | `MonsterPlagueWorm` | `TT` |
| Rat Swarm | Enjambre de ratas | SoN | — | 4 (3+1) | melee | medium | building dark |  | `MonsterRatSwarm` | `SoN` |
| Changeling | Cambiante | SoN | — | 4 (3+1) | melee | small | civilized cursed |  | `MonsterChangeling` | `SoN` |
| Ironbound | — | SoN | — | 2 (1+1) | melee | small | civilized building |  | `MonsterIronbound` | `SoN` |
| Ynfernael Hulk | Mole del Ynfernael | SoN | — | 2 (1+1) | melee | huge | cursed hot |  | `MonsterYnfernaelHulk` | `SoN` |
| Bandit | Bandido | MoR | — | 5 (4+1) | ranged | small | wilderness building |  | `MonsterBandit` | `MoR` |
| Wraith | Espectro | MoR | — | 3 (2+1) | ranged | small | civilized cursed | sí | `MonsterWraith` | `MoR` |
| Bone Horror | Horror óseo | MoB | — | 3 (2+1) | melee | small | cursed cave | sí | `MonsterBoneHorror` | `MoB` |
| Reanimate | Reanimado | MoB | — | 6 (4+2) | melee | small | cursed civilized | sí | `MonsterReanimate` | `MoB` |
| Broodwalker | Caminante de progenie | MoB | — | 3 (?) | melee | small | dark building | sí | `MonsterBroodwalker` | `MoB` |
| Marrow Priest | — | TCTR | — | 2 (1+1) | ranged | small | dark building |  | `MonsterMarrowPriest` | `TCTR` |
| The Dispossessed | Desposeído | TCTR | — | 3 (2+1) | melee | small | cursed civilized | sí | `MonsterTheDispossessed` | `TCTR` |
| Shambling Colossus | Coloso tambaleante | TCTR | — | 3 (2+1) | melee | medium | cursed wilderness | sí | `MonsterShamblingColossus` | `TCTR` |
| Razorwing | Alacortante [ES] | OotO | 1ª ed. base | 4 (3+1) | melee | small | wilderness cave |  | `MonsterRazorwing` | `CKD1E` `OotO` |
| Beastman | Hombre bestia | OotO | 1ª ed. base | 4 (3+1) | melee | small | wilderness mountain |  | `MonsterBeastmen` | `CKD1E` `OotO` |
| Bane Spider | Araña ponzoñosa [ES] | OotO | 1ª ed. base | 3 (2+1) | ranged | huge | dark cave |  | `MonsterBaneSpider` | `CKD1E` `OotO` |
| Chaos Beast | Bestia del caos | CoD | AoD | 3 (2+1) | ranged | huge | dark cursed |  | `MonsterChaosBeast` | `CKAoD` `CoD` |
| Giant | Gigante | CoD | 1ª ed. base | 2 (1+1) | melee | huge | mountain wilderness |  | `MonsterGiant` | `CKD1E` `CoD` |
| Lava Beetle | Escarabajo de lava | CoD | ToI | 4 (3+1) | ranged | small | cave hot |  | `MonsterLavaBeetle` | `CKToI` `CoD` |
| Sorcerer | Hechicero | CotF | 1ª ed. base | 4 (3+1) | ranged | small | civilized building |  | `MonsterSorcerer` | `CKD1E` `CotF` |
| Medusa | Medusa | CotF | ToI | 3 (2+1) | ranged | small | building cursed |  | `MonsterMedusa` | `CKToI` `CotF` |
| Golem | Gólem | CotF | WoD | 2 (1+1) | melee | huge | mountain building |  | `MonsterGolem` | `CKWoD` `CotF` |
| Dark Priest | Sacerdote oscuro | GoD | AoD | ? | ranged | small | civilized cursed | solo en GoD | `MonsterDarkPriest` | `CKAoD` `GoD` |
| Crypt Dragon | Dragón de la cripta | GoD | 1ª ed. base | ? | ranged | massive | cursed dark | solo en GoD | `MonsterCryptDragon` | `CKD1E` `GoD` |
| Wendigo | Wendigo | GoD | ToI | ? | melee | medium / huge | cold cave |  | `MonsterWendigo` | `CKToI` `GoD` |
| Troll | Troll | VoD | AoD | ? | melee | huge | mountain cave |  | `MonsterTroll` | `CKAoD` `VoD` |
| Manticore | — | VoD | 1ª ed. base | ? | ranged | huge / medium | wilderness dark |  | `MonsterManticore` | `CKD1E` `VoD` |
| Ogre | Ogro | VoD | 1ª ed. base | ? | melee | huge | building cave |  | `MonsterOgre` | `CKD1E` `VoD` |
| Deep Elf | — | BotW | AoD | 2 | melee | small | dark cave |  | `MonsterDeepElf` | `CKAoD` `BotW` |
| Hellhound | Sabueso infernal | BotW | 1ª ed. base | 4 | melee | medium | hot cursed |  | `MonsterHellhound` | `CKD1E` `BotW` |
| Kobold | Kobold | BotW | WoD | 12 (9+3) | melee | small | cave building |  | `MonsterKobold` | `CKWoD` `BotW` |
| Skeleton Archer | Arquero esqueleto | ToC | 1ª ed. base | 5 (4+1) | ranged | small | cursed civilized | sí | `MonsterSkeletonArcher` | `CKD1E` `ToC` |
| Demon Lord | Señor demonio | ToC | 1ª ed. base | 2 (1+1) | ranged | huge | cursed hot |  | `MonsterDemonLord` | `CKD1E` `ToC` |
| Crow Hag | Bruja cuervo | ToC | — | 3 (2+1) | ranged | small | dark civilized |  | `MonsterCrowHag` | `ToC` |
| Blood Ape | — | SotS | AoD | ? | melee | medium | hot cave |  | `MonsterBloodApe` | `CKAoD` `SotS` |
| Naga | Naga | SotS | 1ª ed. base | ? | ranged | huge | water cave |  | `MonsterNaga` | `CKD1E` `SotS` |
| Ferrox | Ferrox | SotS | WoD | ? | melee | small | cave water |  | `MonsterFerrox` | `CKWoD` `SotS` |
| Ice Wyrm | Sierpe de hielo | SoE | ToI | 2 (1+1) | melee | massive | cave cold |  | `MonsterIceWyrm` | `CKToI` `SoE` |
| Shade | Sombra | SoE | ToI | 5 (4+1) | melee | small | cursed dark cold | solo en SoE | `MonsterShade` | `CKToI` `SoE` |
| Dark Minotaur | Minotauro oscuro | SoE | — | 2 (1+1) | melee | small | civilized dark |  | `MonsterDarkMinotaur` | `SoE` |

Totales: 9 grupos del base, 20 de las cajas de expansión, 27 de las colecciones H&M (25 de la 1ª ed. más Crow Hag
y Dark Minotaur), en total 56 [VAL]. El kit de conversión da cartas para los mismos 25 de la 1ª ed.; las figuras
hay que tenerlas de la 1ª edición o de las colecciones.

Activaciones: casi todos usan las genéricas `Brawler`, `Range` o `Skirmisher` (1 a 3); Elemental, Merriod, Plague
Worm, Hellhound, Kobold y The Dispossessed no tienen `activation=` y usan solo las suyas
(`MonsterActivation<Nombre><n>`) [VAL].

---

## 23. Lista consolidada de lugartenientes (20)

En las cajas, el lugarteniente es una carta por acto y una ficha de cartón; la figura llega con su pack (§15). En
Valkyrie, la versión de la caja es `Monster<Nombre>` (rasgo `lieutenant`) y la del pack, `MonsterAgent<Nombre>`
(rasgo `agent`), con el mismo tamaño [VAL]. Mazos de Trama según el wiki [WIKI].

| Lugarteniente | Caja | Tamaño | ID de la caja | Pack e ID del agente | Mazo de Trama | Notas |
|---|---|---|---|---|---|---|
| Lady Eliza Farrow | Base | `small` | `MonsterLadyElizaFarrow` | `DJ14` `MonsterAgentLadyElizaFarrow` | Endless Thirst | Vampira; villana de *Heirs of Blood* |
| Lord Merick Farrow | Base | `small` | `MonsterLordMerickFarrow` | `DJ13` `MonsterAgentLordMerickFarrow` | Cursed by Power | Nigromante; villano de *Kindred Fire* |
| Sir Alric Farrow | Base | `small` | `MonsterSirAlricFarrow` | `DJ12` `MonsterAgentSirAlricFarrow` | The Fallen Elite | El Caballero Negro |
| Belthir | Base | `small` | `MonsterBelthir` | `DJ10` `MonsterAgentBelthir` | Hybrid Loyalty | Híbrido de dragón; vuelve en *Embers of Dread* |
| Splig | Base | `small` | `MonsterSplig` | `DJ09` `MonsterAgentSplig` | Goblin Uprising | Rey de todos los goblins; *Rise of All Goblins* |
| Baron Zachareth | Base | `small` | `MonsterBaronZachareth` | `DJ11` `MonsterAgentBaronZachareth` | Seeds of Betrayal | El señor oscuro de *The Shadow Rune* |
| Valyndra | LotW | `massive` | `MonsterValyndra` | `DJ15` `MonsterAgentValyndra` | Dragon's Greed | Reina Sierpe [WES] |
| Ariad | LoR | `small` | `MonsterAriad` | `DJ18` `MonsterAgentAriad` | Dark Illusions | La hechicera oscura |
| Queen Ariad | LoR | `huge` | `MonsterQueenAriad` | `DJ19` `MonsterAgentQueenAriad` | Tangled Web | Ariad en forma de araña |
| Raythen | LoR | `small` | `MonsterRaythen` | `DJ16` `MonsterAgentRaythen` | Skullduggery | Aliado en LoR; héroe con su pack |
| Serena | LoR | `small` | `MonsterSerena` | `DJ17` `MonsterAgentSerena` | Silent Protector | Aliada en LoR; heroína con su pack |
| Bol'Goreth | TT | `huge` | `MonsterBolGoreth` | `DJ20` `MonsterAgentBolGoreth` | Raging Infection | Troll [WES] |
| Gargan Mirklace | SoN | `huge` | `MonsterGarganMirklace` | `DJ25` `MonsterAgentGarganMirklace` | Burning Ambition | Demonio, señor del Reino Negro |
| Rylan Olliven | SoN | `small` | `MonsterRylanOlliven` | `DJ22` `MonsterAgentRylanOlliven` | Inner Corruption | Funcionario corrupto |
| Tristayne Olliven | SoN | `small` | `MonsterTristayneOlliven` | `DJ24` `MonsterAgentTristayneOlliven` | Unstable Forces | Mago que escapó de la muerte |
| Verminous | SoN | `medium` | `MonsterVerminous` | `DJ23` `MonsterAgentVerminous` | Unseen Legions | El Rey Rata; villano de *Seeds of Corruption* |
| Skarn | MoR | `huge` | `MonsterSkarn` | `DJ35` `MonsterAgentSkarn` | Twisted Soul | Constructo nacido de la muerte de un gran mago |
| Ardus Ix'Erebus | MoB (y TCTR) | `small` | `MonsterArdusIxErebus` | `DJ43` `MonsterAgentArdusIxErebus` | First Legion | Estratega de siglos de edad |
| Kyndrithul | MoB (y TCTR) | `small` | `MonsterKyndrithul` | `DJ41` `MonsterAgentKyndrithul` | Vital Essence | Hechicero y vampiro |
| Zarihell | MoB (y TCTR) | `small` | `MonsterZarihell` | `DJ42` `MonsterAgentZarihell` | Eternal Agony | Elfa antigua que manda sobre los espíritus |

**Uso en la tienda** [TIENDA]: el más usado es `MonsterSkarn` (96 referencias), seguido de `MonsterBelthir` (41) y
`MonsterSirAlricFarrow` (26). Verminous y Gargan Mirklace no salen en ningún escenario, y ninguno usa un agente.

---

## 24. Escenarios de la tienda de Valkyrie por origen (59)

Lista `valkyrie-store/D2E/manifestDownload.ini` (59 escenarios) y sus paquetes descargados [TIENDA]. «`quest.ini`»
cuenta las aventuras del paquete: más de una es una campaña que cambia de aventura (§1). Origen según la
descripción y los créditos de cada paquete.

**Resumen:**
- 33 escenarios no piden ningún pack; el resto pide `DooM` (11), `MoR` (6), `LoR` (4), `SoN` (4), `TT` (3), `LotW`
  (3), `OotO` (2), `TCTR` (2), `CotF`, `SoE`, `MoB` y `BotW` (1 cada uno). Ninguno pide `lt`, `ck`, `LL`, `D1ED` ni
  `SOTP`.
- Idioma por defecto: inglés 47, español 9, francés 2, italiano 1; 49 tienen español.
- Formatos de escenario: 13 (1), 18 (4), 19 (28), 20 (4) y 21 (22).
- No hay adaptaciones de las campañas de *Labyrinth of Ruin*, *Shadow of Nerekhall* ni *Heirs of Blood*, ni de
  ninguna campaña de Road to Legend.

### A1. Adaptaciones de productos oficiales de Descent 2ª ed. (9)

| ID del paquete | Nombre (EN / ES) | Autor | `packs=` | `quest.ini` | Origen |
|---|---|---|---|---|---|
| `TSR` | The Shadow Rune / La Runa de las Sombras | Tantum, Sadgit, Delphi, Dan, Charles | ninguno | 36 | Campaña *The Shadow Rune* del base |
| `CastleDaerion` | Castle Daerion / El castillo Daerion (v1.1) | Dakon Blackblade | `CotF` `LoR` `MoR` `OotO` `SoE` `SoN` | 1 | Misión *Castle Daerion* (acto I de *The Shadow Rune*) rehecha al estilo Road to Legend |
| `ValkyrieLairOfTheWyrm` | Lair of the Wyrm / La guarida de la Sierpe | Tantum | `LotW` | 8 | Minicampaña de *Lair of the Wyrm* |
| `ValkyrieTrollfens` | The Trollfens / La ciénaga del troll | Tantum | `TT` | 8 | Minicampaña de *The Trollfens* |
| `ValkyrieManorOfRavens` | Manor of Ravens / La Mansión de los Cuervos | Tantum, Xyphistor | `MoR` | 9 | Minicampaña de *Manor of Ravens* |
| `ChainsOfBilehall` | Chains of Bilehall (Beta) / Las cadenas de Castrohiel | Tantum | ninguno | 28 | Campañas de *Mists of Bilehall* y *The Chains That Rust*, juntas o por separado; la subcarpeta de Bilehall pide `MoB` |
| `ForgottenSouls` | Forgotten Souls / Almas olvidadas | afellowspelunker | ninguno | 15 | Aventura cooperativa *Forgotten Souls* (uDJ36) |
| `NaturesIre` | Nature's Ire / La Ira de la Naturaleza | afellowspelunker | ninguno | 14 | Aventura cooperativa *Nature's Ire* (uDJ37) |
| `DarkElements` | Dark Elements / — | afellowspelunker | `LotW` | 15 | Aventura cooperativa *Dark Elements* (uDJ38) |

### A2. Adaptaciones de las misiones de las colecciones H&M (afellowspelunker) (18)

| ID del paquete | Nombre (EN / ES) | Autor | `packs=` | `quest.ini` | Origen |
|---|---|---|---|---|---|
| `OathoftheOutcast` | OO1 - Oath of the Outcast (v1.0) / OO1 - El juramento de la exiliada (v1.0) | afellowspelunker | ninguno | 1 | OotO, acto I |
| `PrisonofIceandLies` | OO2 - Prison of Ice and Lies (v1.0) / OO2 - Prisión de hielo y mentiras (v1.0) | afellowspelunker | ninguno | 1 | OotO, acto II |
| `BurningHarvest` | CD1 - Burning Harvest (v1.2) / CD1 - Cosecha ardiente (v1.2) | afellowspelunker | ninguno | 1 | CoD, acto I |
| `CrownofDestiny` | CD2 - Crown of Destiny (v1.2) / CD2 - La corona del destino (v1.2) | afellowspelunker | ninguno | 1 | CoD, acto II |
| `CrusadeoftheForgotten` | CF1 - Crusade of the Forgotten (v1.2) / CF1 - Cruzada de los Olvidados (v1.2) | afellowspelunker | ninguno | 1 | CotF, acto I |
| `ShadowsideWatch` | CF2 - Shadowside Watch (v1.2) / CF2 - Guardia de la Umbra (v1.2) | afellowspelunker | ninguno | 1 | CotF, acto II |
| `GuardiansofDeephall` | GD1 - Guardians of Deephall (v1.2) / GD1- Guardianes de la Fortaleza Interior (v1.2) | afellowspelunker | ninguno | 1 | GoD, acto I |
| `TheCurseofIona` | GD2 - The Curse of Iona (v1.2) / GD2 - La maldición de Iona (v1.2) | afellowspelunker | ninguno | 1 | GoD, acto II |
| `Trucebreaker` | VD1 - Trucebreaker (v1.0) / — | afellowspelunker | ninguno | 1 | VoD, acto I |
| `VisionsofDawn` | VD2 - Visions of Dawn (v1.0) / — | afellowspelunker | ninguno | 1 | VoD, acto II |
| `OneMansTrash` | BW1 - One Man's Trash (v1.2) / BW1 - La basura de unos... (v1.2) | afellowspelunker | ninguno | 1 | BotW, acto I |
| `BondsoftheWild` | BW2 - Bonds of the Wild (v1.2) / BW2 - Vínculos de la naturaleza (v1.2) | afellowspelunker | ninguno | 1 | BotW, acto II |
| `SindaeasSecret` | TC1 - Sindaea's Secret (v1.0) / TC1 - El secreto de Sindaea (v1.0) | afellowspelunker | ninguno | 1 | ToC, acto I |
| `TreatyofChampions` | TC2 - Treaty of Champions (v1.0) / TC2 - Tratado de los campeones (v1.0) | afellowspelunker | ninguno | 1 | ToC, acto II |
| `StewardsoftheSecret` | SS1 - Stewards of the Secret (v1.1) / SS1 - Senescales del Secreto (v1.1) | afellowspelunker | ninguno | 1 | SotS, acto I |
| `BloodspireofDevis` | SS2 - Bloodspire of Devis (v1.1) / SS2 - La torre sangrienta de Devis (v1.1) | afellowspelunker | ninguno | 1 | SotS, acto II |
| `ShardsofEverdark` | SE1 - Shards of Everdark (v1.1) / SE1 - Esquirlas de Sombra Eterna (v1.1) | afellowspelunker | ninguno | 1 | SoE, acto I |
| `HostofEverdark` | SE2 - Host of Everdark (v1.1) / SE2 - La hueste de Sombra Eterna (v1.1) | afellowspelunker | ninguno | 1 | SoE, acto II |

### B. Adaptaciones de diseños de la comunidad o de terceros (12)

| ID del paquete | Nombre (EN / ES) | Autor | `packs=` | `quest.ini` | Origen |
|---|---|---|---|---|---|
| `LaFortalezadelaMuerte` | Death Keep (v1.65) / La fortaleza de la muerte (v1.75) | Vidimus | ninguno | 1 | *Death Keep*, aventura cooperativa de Crusader Games |
| `RegresoFortalezadelaMuerte` | Death Keep II: The Return (v1.5) / La fortaleza de la muerte II: el regreso (v1.5) | Vidimus | ninguno | 1 | Secuela de *Death Keep*, basada en Crusader Games |
| `SandsOfThePast` | Sands of the Past / — | afellowspelunker | `LoR` | 7 | *Sands of the Past*, expansión de la comunidad (Sadgit, Painkeeper y otros); recomienda el pack SOTP |
| `RuinsofDarkness` | Ruins of Darkness / — | afellowspelunker | `LoR` | 15 | Cooperativa de NHack2013 |
| `PestilentialSwamp` | Pestilential Swamp / — | afellowspelunker | `TT` | 15 | Cooperativa de NHack2013 |
| `ShadowBinders` | Shadow Binders / Los Vencedores de la Sombra | afellowspelunker | ninguno | 12 | Cooperativa de NHack2013 |
| `EscapeFromBelthir` | Escape From Belthir! / — | afellowspelunker | ninguno | 15 | Cooperativa de rent13579 (Dan Z.) |
| `GiftForAKing` | Gift For A King / Un regalo digno de un rey | afellowspelunker | ninguno | 1 | Cooperativa de Dan Howell (rdh174) |
| `TheLegacyOfIthyndrus_Body` | The Legacy of Ithyndrus - The Body / — | afellowspelunker | `MoR` | 16 | Cooperativa de DelphiDie |
| `TheLegacyOfIthyndrus_Soul` | The Legacy of Ithyndrus - The Soul / — | afellowspelunker | `MoR` | 16 | Cooperativa de DelphiDie |
| `TheLegacyOfIthyndrus_Essence` | The Legacy of Ithyndrus - The Essence / — | afellowspelunker | `MoR` | 16 | Cooperativa de DelphiDie |
| `Doom_Procesador_plasma` | — / Doom - Procesador de plasma (v1.15) | Vidimus | `DooM` | 1 | Mapa de Cypher0117 en BGG para DOOM |

### C. Adaptaciones de misiones oficiales de *DOOM: The Board Game* (FFG, 2016) (2)

| ID del paquete | Nombre (EN / ES) | Autor | `packs=` | `quest.ini` | Origen |
|---|---|---|---|---|---|
| `Doom_Mission_1` | DooM - Mission 1 - Knee Deep in the Dead / Doom - Misión 1 - De muertos hasta el cuello | Neuntoter | `DooM` | 1 | Misión 1 del juego de DOOM |
| `Doom_Tutorial` | DooM - Tutorial (v1.15) / Doom - Tutorial (v1.15) | Vidimus | `DooM` | 1 | Misión tutorial oficial de DOOM |

### D. Aventuras originales de la comunidad (18)

| ID del paquete | Nombre (EN / ES) | Autor | `packs=` | `quest.ini` | Origen |
|---|---|---|---|---|---|
| `affairsofwizards` | Affairs of Wizards / Cosas de magos | Bruce | ninguno | 1 | Original de Bruce (NPBruce, creador de Valkyrie) |
| `BowBeforeTheKing` | Bow before your king / Arrodillaos ante vuestro rey | Tantum | ninguno | 1 | Epílogo de *The Shadow Rune*, hecho como tutorial de diseño |
| `CityOfTheDead` | City of the Dead (V1.31) / La ciudad de los muertos (V1.3) | Tantum | `LoR` `MoB` `MoR` `SoN` `TCTR` `TT` | 1 | Original |
| `xghonol-beta` | Lost City X'Ghonol (v0.4) / La ciudad perdida de X'Ghonol (v0.5) | SpaceEye | `SoN` | 1 | Original (en francés) |
| `IlGranodiTorlomeke` | Torlomeke's Wheat / El trigo de Torlomeke | Gabro | ninguno | 1 | Original (en italiano), de Gabro |
| `Goblin_Raid` | Goblin Raid / Incursión Goblin | Matt Thornton | ninguno | 1 | Original |
| `FestivalDeSang` | — / Un festival de sangre (v1.1) | Nero | `BotW` `OotO` `SoN` `TCTR` | 1 | Original (en francés) |
| `The_Lost_Treasure_pt1` | The Lost Treasure of X 'Ul  (Pt. 1) / El tesoro perdido de X 'Ul (1ª Parte) | Neuntoter | ninguno | 1 | Original |
| `CalamityattheCove` | Calamity at the Cove / Infortunio en Cala de Karya | afellowspelunker | `LotW` | 8 | Campaña original |
| `HeroesDeTerrinothJain` | Heroes of Terrinoth - Jain Fairwood / Héroes de Terrinoth - Jain Bosquebello | Vidimus | ninguno | 1 | Aventura en solitario con Jain Fairwood |
| `Doom_FOP_E1M1` | Doom Fall of Phobos - E1M1- The Beginning / Doom - La caída de Fobos 01 El comienzo V2 | Neuntoter | `DooM` | 1 | Campaña *The Fall of Phobos* de Neuntöter, misión 1 (origen sin verificar) |
| `Doom_FOP_E1M2` | Doom Fall of Phobos - E1M2- The Dark Corridor / Doom - La caída de Fobos 02 El pasillo tenebroso | Neuntoter | `DooM` | 1 | *The Fall of Phobos*, misión 2 |
| `Doom_FOP_E1M3` | Doom Fall of Phobos - E1M3- The Surface / Doom - La caída de Fobos 03 En la superficie V2 | Neuntoter | `DooM` | 1 | *The Fall of Phobos*, misión 3 |
| `Doom_FOP_E1M4` | Doom Fall of Phobos - E1M4- The Surface Pt. 2 / Doom - La caída de Fobos 04 En la superficie, parte 2 V2 | Neuntoter | `DooM` | 1 | *The Fall of Phobos*, misión 4 |
| `Doom_Puesto_Garen` | Doom - Garen Outpost / Doom - Puesto avanzado Garen | Vidimus | `DooM` | 1 | Original para DooM |
| `Doom_Laboratorios_Alfa` | Doom - Alpha Labs / Doom - Laboratorios Alfa | Vidimus | `DooM` | 1 | Original para DooM |
| `Doom_Apuesta_Hayden` | Doom - Hayden's Wager / Doom - La apuesta de Hayden | Vidimus | `DooM` | 1 | Original para DooM |
| `Doom_Repliegue` | — / Doom - Repliegue | Vidimus | `DooM` | 1 | Original para DooM (solo en español) |

Notas:
- La campaña *The Fall of Phobos* (4 misiones de DooM) es de Neuntöter; no he comprobado si sale de algún producto
  de DOOM (sin verificar).
- *Affairs of Wizards* es de Bruce (NPBruce), el creador de Valkyrie, y vive en el repositorio `valkyrie-questdata`.
- Las cooperativas de afellowspelunker (grupos A1 y B) comparten estructura: muchas aventuras enlazadas,
  activaciones de monstruo inspiradas en *Road to Peril* (de Sadgit y Painkeeper) y opciones de duración.

---

## 25. Lagunas y datos dudosos

1. **Nombres oficiales en español.** Solo tengo confirmación de Edge o de BGG para el base, LotW, LoR, SoN, HoB, LL,
   *El Juramento de la Exiliada*, *La Cruzada de los Olvidados*, *El Tratado de los Campeones*, *Senescales del
   Secreto* y los packs «Lugarteniente…». El resto (TT, MoR, MoB, TCTR, cinco colecciones H&M, las cooperativas, el
   kit y la app) sale de la Wikipedia en español, un blog y las traducciones de la tienda, que a veces no coinciden
   (*Esquirlas de Sombra Eterna* frente a *de la oscuridad eterna*; *La Mansión de los Cuervos* frente a *Mansión
   de Cuervos*). Para héroes, clases, monstruos y términos de juego casi no hay fuentes españolas. Comprobación
   recomendada: Valkyrie en español con la importación de Road to Legend (claves `PRODUCT_DJxx_TITLE` y nombres).
2. **Fechas de la edición española** de todos los productos y si Edge publicó el kit de conversión, las aventuras
   cooperativas y *Leyendas Perdidas*.
3. **Figuras por grupo** de *Guardians of Deephall*, *Visions of Dawn* y *Stewards of the Secret*, del Broodwalker
   (MoB) y el reparto de Hellhound y Deep Elf en *Bonds of the Wild*.
4. **Fechas de los packs de lugarteniente** de Valyndra, la tanda de Nerekhall (Rylan, Verminous, Tristayne, Gargan
   Mirklace), Zarihell y Ardus: solo tengo el año de BGG o la fecha del anuncio.
5. **Misiones:** los dos interludios de LoR, la misión que falta del acto II de SoN y el reparto por actos de SoN y
   de *Heirs of Blood*; *Taskmaster* de TCTR solo sale en la adaptación de la tienda; qué misión de cada colección
   H&M entra por el rumor y cuál por la carta de misión.
6. **Códigos:** DJ06 sin identificar; *Forgotten Souls* tiene dos códigos (uDJ36 en sus reglas y `ugdj04` en el
   nombre del PDF de FFG); DJ02 para el kit sale solo del nombre de una imagen de Valkyrie.
7. **Road to Legend:** la ficha de App Store no empareja bien versiones y notas, así que las versiones en que
   llegaron TCTR, LL o el español son aproximadas. Que los packs de lugarteniente añadan agentes en la app sale de
   un foro (fuente única), aunque los datos de Valkyrie lo apoyan. No sé por qué la app trae 4 de los 12 héroes que
   solo están en el kit (Mad Carthos, Red Scorpion, Varikas the Dead, Brother Glyr).
8. **Rarezas de los datos de Valkyrie** (no son de los productos): loseta 43 en `LoR` y `TT`; losetas 78, 79 y
   `EntranceSwamp` en `MoB` y `TCTR`; faltan Jinn's Lamp (LoR), Mapstone (TT), Archaic Scroll (SoN) y The Manor's
   Heart (MoR); faltan losetas en todas las cajas («many are missing»); el Shade de `CKToI` sin imagen; tamaños
   distintos entre el kit y las colecciones; habilidades básicas que faltan en LoR y en cuatro híbridas de LL; IDs
   con erratas (`HeroGreyKey`, `ItemTeleportaionRune`, «Dispair» en `CKAoD`).
9. **Clases del señor oscuro:** que Punisher sea la de LotW solo lo dice el wiki; las de TT (Infector), SoN
   (Shadowmancer), MoR (Enchanter y Unkindness) y TCTR (Soulbinder) salen también de sus reglamentos.
10. **Fuentes que no se pudieron abrir:** BoardGameGeek (directamente), web.archive.org y la web de Edge. Muchas
    noticias antiguas de FFG redirigen ahora a la portada; se leyeron en su copia drafts.fantasyflightgames.com. Los
    reglamentos en PDF se leyeron con un lector automático: las cuentas de componentes coinciden con el wiki, pero
    el orden de las misiones en los registros de campaña puede tener errores de lectura.

---

## Fuentes

**Valkyrie** [VAL] [TIENDA] [COM]
- Repositorio de Valkyrie, commit `752d4206738f00a6d41e34be56fe7e65e7b35965`: https://github.com/NPBruce/valkyrie
  - Datos: `unity/Assets/StreamingAssets/content/D2E/` (`base`, `boxed/*`, `h&m/*`, `lt/*`, `ck/*`).
  - Código: `Content/QuestData.cs` (`packs`, `GetMissingPacks`), `Content/ContentData.cs` (`AddContent`),
    `Content/ContentTypes.cs`, `UI/Screens/QuestSelectionScreen.cs`, `ContentSelectScreen.cs`,
    `ClassSelectionScreen.cs`, `Quest/Quest.cs`, `Quest/SkillWindow.cs`, `GameStateManager.cs`,
    `libraries/FFGAppImport/AssetImport/RtLFinder.cs`, `StreamingAssets/text/Localization.*.txt`.
  - Wiki: https://github.com/NPBruce/valkyrie/wiki (`QuestIniQuest`, `Valkyrie-Variables`,
    `Create-Custom-Content-Packs`, `User-settings`).
- Tienda: https://github.com/NPBruce/valkyrie-store (`D2E/manifestDownload.ini`,
  `D2E/contentPacksManifestDownload.ini`) y los 59 paquetes descargados.
- Packs de la comunidad: https://github.com/Neuntoter82/Doom_2016_Mod, https://github.com/Neuntoter82/D1ED,
  https://github.com/afellowspelunker/SOTP; *Sands of the Past*: https://descent-community.org/index.php/sotp/

**FFG: ficha de producto y PDF** [EXP] [FAQ]
- https://www.fantasyflightgames.com/product/descent-journeys-in-the-dark-second-edition/
- Carpeta de los PDF: https://cdn.svc.asmodee.net/production-fantasyflightgames/uploads/2026/09/ con
  `dj01_rulebook_eng_2015_web.pdf`, `dj03_rulebook_cs5.pdf`, `lotw_campaign_rules.pdf`, `dj04_rulebook_web.pdf`,
  `dj05_rulebook.pdf`, `dj07_rulebook.pdf`, `dj09-rules-web.pdf`, `dj21_rulebook_low_res.pdf`,
  `dj40_rulebook_web.pdf`, `dj44_rulebook_web.pdf`, `heirs_of_blood_campaign_log.pdf`, `ugdj04_co-op_rules.pdf`,
  `udj37_pod1_co-op_rules.pdf`, `udj38_pod1_co-op_rules.pdf`, `road_to_legend_rules.pdf` y
  `descent_second_edition_faq_v16.pdf`.

**FFG: noticias** [FFG]
- Road to Legend: https://drafts.fantasyflightgames.com/en/news/2016/3/15/road-to-legend/ y
  https://drafts.fantasyflightgames.com/en/news/2016/5/12/become-a-legend/
- Kindred Fire: https://www.fantasyflightgames.com/en/news/2016/5/27/kindred-fire/
- The Delve: https://www.fantasyflightgames.com/en/news/2016/9/30/delving-deep/ y
  https://drafts.fantasyflightgames.com/en/news/2016/10/17/can-you-escape/
- Seeds of Corruption: https://drafts.fantasyflightgames.com/en/news/2017/1/16/corruption-begins/
- Trials of Frostgate: https://www.fantasyflightgames.com/en/news/2017/9/28/trials-of-frostgate/
- Embers of Dread: https://drafts.fantasyflightgames.com/en/news/2018/12/6/embers-of-dread/
- Lost Legends: https://drafts.fantasyflightgames.com/en/news/2019/2/11/lost-legends/
- Bonds of the Wild: https://drafts.fantasyflightgames.com/en/news/2015/3/23/bonds-of-the-wild/
- Heirs of Blood: https://drafts.fantasyflightgames.com/en/news/2015/4/23/protect-the-heir/
- Kyndrithul: https://drafts.fantasyflightgames.com/en/news/2015/11/30/vampiric-thirst/
- Fin de Legends of the Dark: https://drafts.fantasyflightgames.com/en/news/2026/4/9/the-end-of-a-legend/
- Archivo del blog de FFG: https://www.fantasyflightgames.com/en/ffg_blog/22706/original_content (primeros seis
  packs de lugarteniente), /22699/ (packs de LoR), /22682/ (campaña de LoR), /22691/ (Quest Vault).

**Comunidad y BGG** [WIKI] [BGG]
- Wiki de Descent: https://wiki.descent-community.org/ (páginas de cada producto, `Campaign`, `The_Shadow_Rune`,
  `Lair_of_the_Wyrm_(campaign)`, `Labyrinth_of_Ruin_(campaign)`, `Road_to_Legend`, `Kindred_Fire`,
  `Lieutenant_Pack`, `Plot_Deck`, `Agent`, `Lieutenant`, `Overlord`, `Expansion`).
- Espejos de BGG: https://kallax.io/boardgame/BA2X1-Descent (las 45 expansiones),
  https://kallax.io/boardgame/H43KS-Descent,
  páginas de analog.games de *Labyrinth of Ruin*, *Lair of the Wyrm*, *Shadow of Nerekhall*, *Heirs of Blood*,
  *Crusade of the Forgotten*, *Treaty of Champions*, *Splig* y *Rylan Olliven*, y Dice Tower
  (https://dicetower.com/board-game/149915, https://dicetower.com/board-game/148977).

**En español** [ES] [WES] [BLOG]
- https://es.wikipedia.org/wiki/Descent:_Viaje_a_las_tinieblas
- http://mundoaizen.blogspot.com/2020/09/descent-viaje-las-tinieblas-segunda.html
- http://www.elclubdeldado.com/2014/10/descent-viaje-las-tinieblas-el.html (anuncio de Edge de *El Juramento de la
  Exiliada*)
- https://juegosdelamesaredonda.com/3965-descent-senescales-del-secreto-8435407612242.html

**Tiendas, prensa y apps** [TND] [BLOG] [APP]
- Board Game Bliss (SKU de *Heirs of Blood*, *Oath of the Outcast*, *Zarihell*, *Lost Legends*):
  https://www.boardgamebliss.com/collections/4-players/products/descent-journeys-in-the-dark-second-edition-heirs-of-blood
- Troll and Toad (códigos FFGDJ01, FFGDJ03 y FFGDJ08 en los títulos de sus fichas):
  https://www.trollandtoad.com/toys-more/board-games-a-z/descent-dice-pack-accessory-fantasy-flight-games-ffgdj08/1027350
- Noble Knight: https://www.nobleknight.com/P/2148318595/Descent-2nd-Edition-Collection-67---Base-Games--12-Expansions--20-Lieutenant-Packs
- icv2: https://icv2.com/print/article/26912 (packs de LoR) y https://icv2.com/print/article/28909 (Skarn)
- Brückenkopf (Dice Pack): https://www.brueckenkopf-online.com/2013/descent-wurfelset/
- Theology of Games: https://www.theologyofgames.com/blog/2014/11/20/fantasy-flight-games-announces-a-campaign-book-for-descent
  y https://www.theologyofgames.com/blog/2017/1/16/another-free-campaign-for-descent-road-to-legend
- Foro de FFG (archivo): https://ffg-forum-archive.entropicdreams.com/topic/224891-question-monsters-lieutenants
- App Store: https://apps.apple.com/us/app/road-to-legend/id1098000926
- Steam (The Delve): https://steampulse.org/game/525550
