# Catálogo de componentes de Valkyrie para Descent 2ª edición

Generado por `scripts/construir_catalogo.py` a partir de los content packs de Valkyrie (`unity/Assets/StreamingAssets/content/D2E`) y de los packs de la comunidad (DooM, D1ED, SOTP; solo identificadores y datos). Para buscar rápido: `python scripts/buscar.py <texto>`.

Los nombres que ve el jugador vienen de la app oficial importada (`{ffg:CLAVE}`), en su idioma. En los textos usa `{c:SpawnX}`, `{c:QItemX}`, `{c:TileX}` o `{type}` (en un Spawn) para que Valkyrie ponga el nombre oficial. La columna «EN» se deduce de la clave; «ES» es el nombre que usa la comunidad hispana, marcado con «?» si no está confirmado como oficial.

## Índice

1. [Packs](#packs)
2. [Losetas (TileSide)](#losetas-tileside)
3. [Monstruos y lugartenientes](#monstruos-y-lugartenientes)
4. [Activaciones comunes](#activaciones-comunes)
5. [Héroes](#héroes)
6. [Clases](#clases)
7. [Habilidades](#habilidades)
8. [Objetos](#objetos)
9. [Fichas (Token)](#fichas-token)
10. [Imágenes para UI](#imágenes-para-ui)
11. [Audio](#audio)
12. [Peligros y viajes](#peligros-y-viajes)

## Packs

`packs=` del `quest.ini`: IDs separados por espacios. `D2EBase` no hace falta. Cada pack activado pone `#<ID>` a 1 (ramas opcionales sin exigir la expansión).

| ID | Producto | Nombre (EN) | Nombre (ES) | Tipo | Losetas | Héroes | Clases | Monstruos | Objetos |
|---|---|---|---|---|---|---|---|---|---|
| `D2EBase` | DJ01 | Descent: Journeys in the Dark (Second Edition) | Descent: Viaje a las Tinieblas (Segunda Edición) | box | 70 | 8 | 8 | 15 | 51 |
| `LL` | DJ45 | Lost Legends | Leyendas Perdidas | box |  |  | 10 |  | 3 |
| `LoR` | DJ04 | Labyrinth of Ruin | Laberinto de Perdición | box | 16 | 4 | 4 | 8 | 29 |
| `LotW` | DJ03 | Lair of the Wyrm | La Guarida de la Sierpe | box | 12 | 2 | 2 | 3 | 14 |
| `MoB` | DJ40 | Mists of Bilehall | Las Brumas de Castrohiel (?) | box | 22 |  |  | 6 | 11 |
| `MoR` | DJ21 | Manor of Ravens | La Mansión de los Cuervos (?) | box | 16 | 2 | 2 | 3 | 15 |
| `SoN` | DJ07 | Shadow of Nerekhall | La Sombra de Nerekhall | box | 50 | 4 | 4 | 8 | 30 |
| `TCTR` | DJ44 | The Chains That Rust | Las Cadenas del Óxido (?) | box | 22 |  | 4 | 3 | 12 |
| `TT` | DJ05 | The Trollfens | La Ciénaga del Troll (?) | box | 14 | 2 | 2 | 3 | 19 |
| `BotW` | DJ31 | Bonds of the Wild | Vínculos de la Naturaleza (?) | hm |  | 4 |  | 3 |  |
| `CoD` | DJ27 | Crown of Destiny | La Corona del Destino (?) | hm |  | 4 |  | 3 |  |
| `CotF` | DJ28 | Crusade of the Forgotten | La Cruzada de los Olvidados | hm |  | 4 |  | 3 |  |
| `GoD` | DJ29 | Guardians of Deephall | Guardianes de la Fortaleza Interior (?) | hm |  | 4 |  | 3 |  |
| `OotO` | DJ26 | Oath of the Outcast | El Juramento de la Exiliada | hm |  | 4 |  | 3 |  |
| `SoE` | DJ34 | Shards of Everdark | Esquirlas de Sombra Eterna (?) | hm |  | 4 |  | 3 |  |
| `SotS` | DJ33 | Stewards of the Secret | Senescales del Secreto | hm |  | 4 |  | 3 |  |
| `ToC` | DJ32 | Treaty of Champions | El Tratado de los Campeones | hm |  | 4 |  | 3 |  |
| `VoD` | DJ30 | Visions of Dawn | Visiones del Amanecer (?) | hm |  | 4 |  | 3 |  |
| `DJ12` | DJ12 | Lieutenant Pack: Sir Alric Farrow | Lugarteniente Sir Alric Farrow | lt |  |  |  | 1 |  |
| `DJ43` | DJ43 | Lieutenant Pack: Ardus Ix'Erebus | Lugarteniente Ardus Ix'Erebus | lt |  |  |  | 1 |  |
| `DJ18` | DJ18 | Lieutenant Pack: Ariad | Lugarteniente Ariad | lt |  |  |  | 1 |  |
| `DJ10` | DJ10 | Lieutenant Pack: Belthir | Lugarteniente Belthir | lt |  |  |  | 1 |  |
| `DJ20` | DJ20 | Lieutenant Pack: Bol'Goreth | Lugarteniente Bol'Goreth | lt |  |  |  | 1 |  |
| `DJ14` | DJ14 | Lieutenant Pack: Lady Eliza Farrow | Lugarteniente Lady Eliza Farrow | lt |  |  |  | 1 |  |
| `DJ41` | DJ41 | Lieutenant Pack: Kyndrithul | Lugarteniente Kyndrithul | lt |  |  |  | 1 |  |
| `DJ13` | DJ13 | Lieutenant Pack: Lord Merick Farrow | Lugarteniente Lord Merick Farrow | lt |  |  |  | 1 |  |
| `DJ25` | DJ25 | Lieutenant Pack: Gargan Mirklace | Lugarteniente Gargan Mirklace | lt |  |  |  | 1 |  |
| `DJ19` | DJ19 | Lieutenant Pack: Queen Ariad | Lugarteniente Queen Ariad | lt |  |  |  | 1 |  |
| `DJ16` | DJ16 | Lieutenant Pack: Raythen | Lugarteniente Raythen | lt |  | 1 |  | 1 |  |
| `DJ22` | DJ22 | Lieutenant Pack: Rylan Olliven | Lugarteniente Rylan Olliven | lt |  |  |  | 1 |  |
| `DJ17` | DJ17 | Lieutenant Pack: Serena | Lugarteniente Serena | lt |  | 1 |  | 1 |  |
| `DJ35` | DJ35 | Lieutenant Pack: Skarn | Lugarteniente Skarn | lt |  |  |  | 1 |  |
| `DJ09` | DJ09 | Lieutenant Pack: Splig | Lugarteniente Splig | lt |  |  |  | 1 |  |
| `DJ24` | DJ24 | Lieutenant Pack: Tristayne Olliven | Lugarteniente Tristayne Olliven | lt |  |  |  | 1 |  |
| `DJ15` | DJ15 | Lieutenant Pack: Valyndra | Lugarteniente Valyndra | lt |  |  |  | 1 |  |
| `DJ23` | DJ23 | Lieutenant Pack: Verminous | Lugarteniente Verminous | lt |  |  |  | 1 |  |
| `DJ11` | DJ11 | Lieutenant Pack: Baron Zachareth | Lugarteniente Baron Zachareth | lt |  |  |  | 1 |  |
| `DJ42` | DJ42 | Lieutenant Pack: Zarihell | Lugarteniente Zarihell | lt |  |  |  | 1 |  |
| `CKAoD` | DJ02 | Conversion Kit: Altar of Despair | Kit de conversión: El Altar de la Desesperación (?) | ck |  | 3 |  |  |  |
| `CKD1E` | DJ02 | Conversion Kit: Descent 1st ed. base | Kit de conversión: 1ª ed. (?) | ck |  | 5 |  |  |  |
| `CKDQ` | DJ02 | Conversion Kit: DungeonQuest heroes | Kit de conversión: héroes de DungeonQuest (?) | ck |  | 1 |  |  |  |
| `CKPromo` | DJ02 | Conversion Kit: promotional heroes | Kit de conversión: héroes promocionales (?) | ck |  | 1 |  |  |  |
| `CKToI` | DJ02 | Conversion Kit: Tomb of Ice | Kit de conversión: Tumba de Hielo (?) | ck |  | 1 |  |  |  |
| `CKWoD` | DJ02 | Conversion Kit: Well of Darkness | Kit de conversión: El Pozo de las Tinieblas (?) | ck |  | 1 |  |  |  |
| `D1ED` | — | Descent 1st edition tiles (community pack) | Losetas de Descent 1ª ed. (pack de la comunidad) | D2ECustom | 42 |  |  |  |  |
| `DooM` | — | DooM 2016 (community pack) | DooM 2016 (pack de la comunidad) | D2ECustom | 32 | 4 | 4 | 8 | 11 |
| `SOTP` | — | Sands of the Past (community pack) | Sands of the Past (pack de la comunidad) | D2ECustom |  | 2 | 2 | 2 | 21 |

## Losetas (TileSide)

Tamaño en casillas (ancho × alto a rotación 0) y número de casillas dibujadas. La forma exacta y dónde encajan puertas y fichas: `python scripts/mapa.py --info TileSideX`. Las dos caras de una misma pieza física (`Reverso`) no se pueden usar a la vez.

### D2EBase

| ID | Nombre | Tamaño | Casillas | Rasgos | Reverso |
|---|---|---|---|---|---|
| `TileSide1A` | 1A | 8×6 | 48 | water outside | 1B |
| `TileSide1B` | 1B | 8×6 | 48 | throne inside | 1A |
| `TileSide2A` | 2A | 6×6 | 36 | water outside | 2B |
| `TileSide2B` | 2B | 6×6 | 36 | dirt inside | 2A |
| `TileSide3A` | 3A | 6×4 | 24 | water outside | 3B |
| `TileSide3B` | 3B | 6×4 | 24 | inside | 3A |
| `TileSide4A` | 4A | 6×6 | 36 | outside | 4B |
| `TileSide4B` | 4B | 6×6 | 36 | inside pit dirt | 4A |
| `TileSide5A` | 5A | 6×4 | 24 | outside | 5B |
| `TileSide5B` | 5B | 6×4 | 24 | inside dirt | 5A |
| `TileSide6A` | 6A | 4×6 | 24 | outside | 6B |
| `TileSide6B` | 6B | 4×6 | 24 | inside dirt | 6A |
| `TileSide7A` | 7A | 6×4 | 24 | inside timber | 7B |
| `TileSide7B` | 7B | 6×4 | 24 | inside snow | 7A |
| `TileSide8A` | 8A | 4×4 | 16 | outside | 8B |
| `TileSide8B` | 8B | 4×4 | 16 | inside | 8A |
| `TileSide9A` | 9A | 4×4 | 16 | outside | 9B |
| `TileSide9B` | 9B | 4×4 | 16 | inside dirt | 9A |
| `TileSide10A` | 10A | 4×4 | 16 | outside farm | 10B |
| `TileSide10B` | 10B | 4×4 | 16 | inside tomb | 10A |
| `TileSide11A` | 11A | 4×4 | 16 | outside | 11B |
| `TileSide11B` | 11B | 4×4 | 16 | inside tomb | 11A |
| `TileSide12A` | 12A | 5×5 | 19 | outside water | 12B |
| `TileSide12B` | 12B | 5×5 | 19 | inside dirt lava | 12A |
| `TileSide13A` | 13A | 6×6 | 26 | outside timber | 13B |
| `TileSide13B` | 13B | 6×6 | 26 | inside library | 13A |
| `TileSide14A` | 14A | 4×4 | 14 | outside graves | 14B |
| `TileSide14B` | 14B | 4×4 | 14 | inside | 14A |
| `TileSide15A` | 15A | 5×4 | 14 | outside | 15B |
| `TileSide15B` | 15B | 5×4 | 14 | inside | 15A |
| `TileSide16A` | 16A | 4×4 | 12 | outside | 16B |
| `TileSide16B` | 16B | 4×4 | 12 | inside | 16A |
| `TileSide17A` | 17A | 4×4 | 12 | outside | 17B |
| `TileSide17B` | 17B | 4×4 | 12 | inside | 17A |
| `TileSide18A` | 18A | 4×4 | 12 | outside | 18B |
| `TileSide18B` | 18B | 4×4 | 12 | inside | 18A |
| `TileSide19A` | 19A | 3×6 | 18 | outside bridge | 19B |
| `TileSide19B` | 19B | 3×6 | 18 | inside stairs | 19A |
| `TileSide20A` | 20A | 3×8 | 20 | outside | 20B |
| `TileSide20B` | 20B | 3×8 | 20 | inside | 20A |
| `TileSide21A` | 21A | 6×3 | 18 | outside water | 21B |
| `TileSide21B` | 21B | 6×3 | 18 | inside water | 21A |
| `TileSide22A` | 22A | 6×2 | 12 | outside | 22B |
| `TileSide22B` | 22B | 6×2 | 12 | inside | 22A |
| `TileSide23A` | 23A | 6×2 | 12 | outside | 23B |
| `TileSide23B` | 23B | 6×2 | 12 | inside | 23A |
| `TileSide24A` | 24A | 6×2 | 12 | outside | 24B |
| `TileSide24B` | 24B | 6×2 | 12 | inside | 24A |
| `TileSide25A` | 25A | 2×6 | 12 | outside | 25B |
| `TileSide25B` | 25B | 2×6 | 12 | inside | 25A |
| `TileSide26A` | 26A | 4×3 | 10 | outside | 26B |
| `TileSide26B` | 26B | 4×3 | 10 | inside | 26A |
| `TileSide27A` | 27A | 2×4 | 8 | outside | 27B |
| `TileSide27B` | 27B | 2×4 | 8 | inside | 27A |
| `TileSide28A` | 28A | 4×2 | 8 | outside | 28B |
| `TileSide28B` | 28B | 4×2 | 8 | inside | 28A |
| `TileSide29A` | 29A | 4×2 | 8 | outside | 29B |
| `TileSide29B` | 29B | 4×2 | 8 | inside | 29A |
| `TileSide30A` | 30A | 4×2 | 8 | outside | 30B |
| `TileSide30B` | 30B | 4×2 | 8 | inside | 30A |
| `TileSideCapA` | CapA | 2×1 | 2 | outside | CapB |
| `TileSideCapB` | CapB | 2×1 | 2 | inside | CapA |
| `TileSideEntranceA` | EntranceA | 2×2 | 4 | outside | EntranceB |
| `TileSideEntranceB` | EntranceB | 2×2 | 4 | inside | EntranceA |
| `TileSideEntranceStairA` | EntranceStairA | 2×2 | 4 | outside | EntranceStairB |
| `TileSideEntranceStairB` | EntranceStairB | 2×2 | 4 | inside | EntranceStairA |
| `TileSideExtensionA` | ExtensionA | 2×1 | 2 | outside | ExtensionB |
| `TileSideExtensionB` | ExtensionB | 2×1 | 2 | inside | ExtensionA |
| `TileSideTransitionA` | TransitionA | 2×2 | 4 | inside outside transition | TransitionB |
| `TileSideTransitionB` | TransitionB | 2×2 | 4 | inside outside transition | TransitionA |

### LoR

| ID | Nombre | Tamaño | Casillas | Rasgos | Reverso |
|---|---|---|---|---|---|
| `TileSide36A` | 36A | 8×8 | 64 | outside | 36B |
| `TileSide36B` | 36B | 8×8 | 64 | inside pit | 36A |
| `TileSide37A` | 37A | 9×6 | 45 | outside stone | 37B |
| `TileSide37B` | 37B | 9×6 | 45 | inside pit | 37A |
| `TileSide38A` | 38A | 6×7 | 34 | outside | 38B |
| `TileSide38B` | 38B | 6×7 | 34 | inside water | 38A |
| `TileSide39A` | 39A | 7×8 | 45 | outside | 39B |
| `TileSide39B` | 39B | 7×8 | 45 | inside stairs | 39A |
| `TileSide40A` | 40A | 6×5 | 24 | outside | 40B |
| `TileSide40B` | 40B | 6×5 | 24 | inside | 40A |
| `TileSide41A` | 41A | 6×2 | 12 | outside | 41B |
| `TileSide41B` | 41B | 6×2 | 12 | inside | 41A |
| `TileSide42A` | 42A | 6×2 | 12 | outside | 42B |
| `TileSide42B` | 42B | 6×2 | 12 | inside | 42A |
| `TileSide43A` | 43A | 2×2 | 4 | outside | 43B |
| `TileSide43B` | 43B | 2×2 | 4 | inside | 43A |

### LotW

| ID | Nombre | Tamaño | Casillas | Rasgos | Reverso |
|---|---|---|---|---|---|
| `TileSide31A` | 31A | 6×6 | 36 | rubble outside | 31B |
| `TileSide31B` | 31B | 6×6 | 36 | treasure inside | 31A |
| `TileSide32A` | 32A | 4×4 | 16 | outside | 32B |
| `TileSide32B` | 32B | 4×4 | 16 | treasure inside | 32A |
| `TileSide33A` | 33A | 4×2 | 8 | outside water | 33B |
| `TileSide33B` | 33B | 4×2 | 8 | inside | 33A |
| `TileSide34A` | 34A | 3×6 | 18 | outside | 34B |
| `TileSide34B` | 34B | 3×6 | 18 | stairs inside | 34A |
| `TileSide35A` | 35A | 5×5 | 19 | outside | 35B |
| `TileSide35B` | 35B | 5×5 | 19 | lava inside | 35A |
| `TileSideS1A` | S1A | 4×4 | 16 | outside | S1B |
| `TileSideS1B` | S1B | 4×4 | 16 | inside | S1A |

### MoB

| ID | Nombre | Tamaño | Casillas | Rasgos | Reverso |
|---|---|---|---|---|---|
| `TileSide78A` | 78A | 2×2 | 4 | outside swamp | 78B |
| `TileSide78B` | 78B | 2×2 | 4 | inside | 78A |
| `TileSide79A` | 79A | 2×2 | 4 | outside | 79B |
| `TileSide79B` | 79B | 2×2 | 4 | inside | 79A |
| `TileSide80A` | 80A | 4×2 | 8 | outside | 80B |
| `TileSide80B` | 80B | 4×2 | 8 | inside | 80A |
| `TileSide81A` | 81A | 5×5 | 25 | outside swamp bridge sludge | 81B |
| `TileSide81B` | 81B | 5×5 | 25 | inside | 81A |
| `TileSide82A` | 82A | 3×4 | 12 | outside | 82B |
| `TileSide82B` | 82B | 3×4 | 12 | inside library | 82A |
| `TileSide83A` | 83A | 6×3 | 18 | outside swamp sludge | 83B |
| `TileSide83B` | 83B | 6×3 | 18 | inside | 83A |
| `TileSide84A` | 84A | 7×5 | 27 | outside | 84B |
| `TileSide84B` | 84B | 7×5 | 27 | inside outside | 84A |
| `TileSide85A` | 85A | 6×6 | 25 | outside swamp | 85B |
| `TileSide85B` | 85B | 6×6 | 25 | inside | 85A |
| `TileSide86A` | 86A | 8×3 | 18 | outside swamp water sludge | 86B |
| `TileSide86B` | 86B | 8×3 | 18 | inside | 86A |
| `TileSide87A` | 87A | 8×8 | 64 | outside | 87B |
| `TileSide87B` | 87B | 8×8 | 64 | inside torture sludge | 87A |
| `TileSideEntranceSwampA` | EntranceSwampA | 2×2 | 4 | outside swamp | EntranceSwampB |
| `TileSideEntranceSwampB` | EntranceSwampB | 2×2 | 4 | inside | EntranceSwampA |

### MoR

| ID | Nombre | Tamaño | Casillas | Rasgos | Reverso |
|---|---|---|---|---|---|
| `TileSide70A` | 70A | 6×6 | 36 | outside inside transition | 70B |
| `TileSide70B` | 70B | 6×6 | 36 | inside | 70A |
| `TileSide71A` | 71A | 6×6 | 24 | outside tents | 71B |
| `TileSide71B` | 71B | 6×6 | 24 | inside | 71A |
| `TileSide72A` | 72A | 6×4 | 24 | outside stables | 72B |
| `TileSide72B` | 72B | 6×4 | 24 | inside hall | 72A |
| `TileSide73A` | 73A | 6×3 | 18 | outside | 73B |
| `TileSide73B` | 73B | 6×3 | 18 | inside | 73A |
| `TileSide74A` | 74A | 4×5 | 16 | inside outside transition bedroom | 74B |
| `TileSide74B` | 74B | 4×5 | 16 | inside outside transition | 74A |
| `TileSide75A` | 75A | 4×4 | 16 | outside pit | 75B |
| `TileSide75B` | 75B | 4×4 | 16 | inside | 75A |
| `TileSide76A` | 76A | 4×2 | 8 | outside | 76B |
| `TileSide76B` | 76B | 4×2 | 8 | inside | 76A |
| `TileSide77A` | 77A | 2×2 | 4 | outside | 77B |
| `TileSide77B` | 77B | 2×2 | 4 | inside | 77A |

### SoN

| ID | Nombre | Tamaño | Casillas | Rasgos | Reverso |
|---|---|---|---|---|---|
| `TileSide50A` | 50A | 6×6 | 36 | city fountain | 50B |
| `TileSide50B` | 50B | 6×6 | 36 | blackrealm altar | 50A |
| `TileSide51A` | 51A | 6×4 | 20 | city beds | 51B |
| `TileSide51B` | 51B | 6×4 | 20 | blackrealm | 51A |
| `TileSide52A` | 52A | 5×4 | 19 | outside | 52B |
| `TileSide52B` | 52B | 5×4 | 19 | inside water | 52A |
| `TileSide53A` | 53A | 4×4 | 16 | outside | 53B |
| `TileSide53B` | 53B | 4×4 | 16 | inside water | 53A |
| `TileSide54A` | 54A | 4×4 | 16 | city study | 54B |
| `TileSide54B` | 54B | 4×4 | 16 | blackrealm pit | 54A |
| `TileSide55A` | 55A | 6×4 | 24 | city prison | 55B |
| `TileSide55B` | 55B | 6×4 | 24 | blackrealm stairs | 55A |
| `TileSide56A` | 56A | 6×4 | 24 | city library | 56B |
| `TileSide56B` | 56B | 6×4 | 24 | blackrealm plinth | 56A |
| `TileSide57A` | 57A | 4×6 | 20 | city | 57B |
| `TileSide57B` | 57B | 4×6 | 20 | blackrealm | 57A |
| `TileSide58A` | 58A | 6×3 | 14 | city water | 58B |
| `TileSide58B` | 58B | 6×3 | 14 | blackrealm | 58A |
| `TileSide59A` | 59A | 5×5 | 21 | blackrealm city transition | 59B |
| `TileSide59B` | 59B | 5×5 | 21 | blackrealm altar city transition | 59A |
| `TileSide60A` | 60A | 5×5 | 25 | city tavern | 60B |
| `TileSide60B` | 60B | 5×5 | 25 | blackrealm | 60A |
| `TileSide61A` | 61A | 4×4 | 12 | city water | 61B |
| `TileSide61B` | 61B | 4×4 | 12 | blackrealm | 61A |
| `TileSide62A` | 62A | 3×3 | 9 | city | 62B |
| `TileSide62B` | 62B | 3×3 | 9 | blackrealm | 62A |
| `TileSide63A` | 63A | 5×3 | 15 | city | 63B |
| `TileSide63B` | 63B | 5×3 | 15 | blackrealm | 63A |
| `TileSide64A` | 64A | 5×2 | 10 | city | 64B |
| `TileSide64B` | 64B | 5×2 | 10 | blackrealm | 64A |
| `TileSide65A` | 65A | 4×2 | 8 | city | 65B |
| `TileSide65B` | 65B | 4×2 | 8 | blackrealm | 65A |
| `TileSide66A` | 66A | 4×2 | 8 | city | 66B |
| `TileSide66B` | 66B | 4×2 | 8 | blackrealm | 66A |
| `TileSide67A` | 67A | 2×2 | 4 | city | 67B |
| `TileSide67B` | 67B | 2×2 | 4 | blackrealm | 67A |
| `TileSide68A` | 68A | 2×2 | 4 | city | 68B |
| `TileSide68B` | 68B | 2×2 | 4 | blackrealm | 68A |
| `TileSide69A` | 69A | 2×2 | 4 | city | 69B |
| `TileSide69B` | 69B | 2×2 | 4 | blackrealm | 69A |
| `TileSideCapSoNA` | CapSoNA | 2×1 | 2 | city | CapSoNB |
| `TileSideCapSoNB` | CapSoNB | 2×1 | 2 | blackrealm | CapSoNA |
| `TileSideEntranceSoNA` | EntranceSoNA | 2×2 | 4 | city | EntranceSoNB |
| `TileSideEntranceSoNB` | EntranceSoNB | 2×2 | 4 | blackrealm | EntranceSoNA |
| `TileSideExtensionSoNA` | ExtensionSoNA | 2×1 | 2 | city | ExtensionSoNB |
| `TileSideExtensionSoNB` | ExtensionSoNB | 2×1 | 2 | blackrealm | ExtensionSoNA |
| `TileSideTransitionSoNA` | TransitionSoNA | 2×1 | 2 | city outside transition | TransitionSoNB |
| `TileSideTransitionSoNB` | TransitionSoNB | 2×1 | 2 | blackrealm inside | TransitionSoNA |
| `TileSideTransitionSoN2A` | TransitionSoN2A | 2×2 | 4 | city inside transition | TransitionSoN2B |
| `TileSideTransitionSoN2B` | TransitionSoN2B | 2×2 | 4 | blackrealm city transition | TransitionSoN2A |

### TCTR

| ID | Nombre | Tamaño | Casillas | Rasgos | Reverso |
|---|---|---|---|---|---|
| `TileSide88A` | 88A | 6×6 | 36 | outside swamp | 88B |
| `TileSide88B` | 88B | 6×6 | 36 | inside | 88A |
| `TileSide89A` | 89A | 4×6 | 24 | outside pit | 89B |
| `TileSide89B` | 89B | 4×6 | 24 | inside pit | 89A |
| `TileSide90A` | 90A | 5×5 | 21 | outside | 90B |
| `TileSide90B` | 90B | 5×5 | 21 | inside stairs | 90A |
| `TileSide91A` | 91A | 4×6 | 16 | outside | 91B |
| `TileSide91B` | 91B | 4×6 | 16 | inside | 91A |
| `TileSide92A` | 92A | 4×6 | 15 | outside swamp sludge | 92B |
| `TileSide92B` | 92B | 4×6 | 15 | inside statues | 92A |
| `TileSide93A` | 93A | 4×5 | 16 | outside swamp sludge | 93B |
| `TileSide93B` | 93B | 4×5 | 16 | inside map | 93A |
| `TileSide94A` | 94A | 3×5 | 15 | outside | 94B |
| `TileSide94B` | 94B | 3×5 | 15 | inside map | 94A |
| `TileSide95A` | 95A | 4×4 | 16 | outside inside transition drawbridge | 95B |
| `TileSide95B` | 95B | 4×4 | 16 | outside inside transition | 95A |
| `TileSide96A` | 96A | 3×4 | 12 | outside sludge water | 96B |
| `TileSide96B` | 96B | 3×4 | 12 | inside water | 96A |
| `TileSide97A` | 97A | 2×4 | 8 | outside | 97B |
| `TileSide97B` | 97B | 4×2 | 8 | inside | 97A |
| `TileSide98A` | 98A | 1×4 | 4 | outside | 98B |
| `TileSide98B` | 98B | 1×4 | 4 | inside | 98A |

### TT

| ID | Nombre | Tamaño | Casillas | Rasgos | Reverso |
|---|---|---|---|---|---|
| `TileSide44A` | 44A | 6×6 | 24 | outside inside transition | 44B |
| `TileSide44B` | 44B | 6×6 | 24 | inside | 44A |
| `TileSide45A` | 45A | 8×3 | 18 | outside | 45B |
| `TileSide45B` | 45B | 8×3 | 18 | inside | 45A |
| `TileSide46A` | 46A | 4×3 | 10 | outside | 46B |
| `TileSide46B` | 46B | 4×3 | 10 | water inside | 46A |
| `TileSide47A` | 47A | 2×2 | 4 | outside | 47B |
| `TileSide47B` | 47B | 2×2 | 4 | inside | 47A |
| `TileSide48A` | 48A | 7×7 | 49 | outside water | 48B |
| `TileSide48B` | 48B | 7×7 | 49 | water inside | 48A |
| `TileSide49A` | 49A | 7×7 | 28 | outside | 49B |
| `TileSide49B` | 49B | 7×7 | 28 | inside water | 49A |
| `TileSideS2A` | S2A | 4×3 | 10 | outside | S2B |
| `TileSideS2B` | S2B | 4×3 | 10 | inside | S2A |

### D1ED

| ID | Nombre | Tamaño | Casillas | Rasgos | Reverso |
|---|---|---|---|---|---|
| `TileSideD1CRN` | Crn1Core | 4×4 | 12 |  |  |
| `TileSideD1CRN2` | Crn2Core | 4×4 | 12 |  |  |
| `TileSideD1X` | XCore | 4×4 | 12 |  |  |
| `TileSideD1T` | T1Core | 4×4 | 12 |  |  |
| `TileSideD1T2` | T2Core | 4×4 | 12 |  |  |
| `TileSideD1End` | EndCore | 2×1 | 2 |  |  |
| `TileSideD1Hall1` | HallCore2x2 | 2×2 | 4 |  |  |
| `TileSideD1HallA` | HallBCore2x4 | 2×4 | 8 |  |  |
| `TileSideD1HallB` | HallCCore2x6 | 2×6 | 12 |  |  |
| `TileSideD1RoomA` | RoomA1Core4x4 | 4×4 | 16 |  |  |
| `TileSideD1RoomA2` | RoomA2Core4x4 | 4×4 | 16 |  |  |
| `TileSideD1RoomB` | RoomB1Core4x6 | 4×6 | 24 |  |  |
| `TileSideD1RoomB2` | RoomB2Core4x6 | 4×6 | 24 |  |  |
| `TileSideD1RoomB3` | RoomB3Core4x6 | 4×6 | 24 |  |  |
| `TileSideD1RoomC` | RoomC1Core6x6 | 6×6 | 36 |  |  |
| `TileSideD1RoomC2` | RoomC2Core6x6 | 7×7 | 38 |  |  |
| `TileSide_D1_Stomach` | Stomach | 4×3 | 7 |  |  |
| `TileSideD1RoomC1RTL6x6` | RoomC1RTL6x6 | 7×7 | 40 |  |  |
| `TileSideD1RoomC2RTL6x6` | RoomC2RTL6x6 | 7×7 | 40 |  |  |
| `TileSideRubble1x1` | Rubble1x1 | 1×1 | 1 |  |  |
| `TileSideRubble1x2` | Rubble1x2 | 1×2 | 2 |  |  |
| `TileSideRubble1x3` | Rubble1x3 | 1×3 | 3 |  |  |
| `TileSideMud1x1` | Mud1x1 | 1×1 | 1 |  |  |
| `TileSideMud1x2` | Mud1x2 | 1×2 | 2 |  |  |
| `TileSideMud1x3` | Mud1x3 | 1×3 | 3 |  |  |
| `TileSideHole1x1` | hole1x3 | 1×1 | 1 |  |  |
| `TileSideHole1x2` | hole1x2 | 1×2 | 2 |  |  |
| `TileSideHole1x3` | hole1x3 | 1×3 | 3 |  |  |
| `TileSideWater1x1` | water1x1 | 1×1 | 1 |  |  |
| `TileSideWater1x2` | water1x2 | 1×2 | 2 |  |  |
| `TileSideWater1x3` | water1x3 | 1×3 | 3 |  |  |
| `TileSideLava1x1` | lava1x1 | 1×1 | 1 |  |  |
| `TileSideLava1x2` | lava1x2 | 1×2 | 2 |  |  |
| `TileSideLava1x3` | lava1x3 | 1×3 | 3 |  |  |
| `TileSideIce1x1` | Ice1x1 | 1×1 | 1 |  |  |
| `TileSideIce1x2` | Ice1x2 | 1×2 | 2 |  |  |
| `TileSideIce1x3` | Ice1x3 | 1×3 | 3 |  |  |
| `TileSideIce2x2` | Ice2x2 | 2×2 | 4 |  |  |
| `TileSideIce2x3` | Ice2x3 | 2×3 | 6 |  |  |
| `TileSide_D1_Lightning2x10` | Lightning2x10 | 2×10 | 20 |  |  |
| `TileSide_D1_Fire` | Fire Template | 4×5 | 12 |  |  |
| `TileSide_D1_Trap` | Trap | 4×4 | 16 |  |  |

### DooM

| ID | Nombre | Tamaño | Casillas | Rasgos | Reverso |
|---|---|---|---|---|---|
| `TileSideDooM_01_A` | 1A | 6×9 | 54 |  | DooM_01_B |
| `TileSideDooM_01_B` | 1B | 6×9 | 54 |  | DooM_01_A |
| `TileSideDooM_02_A` | 2A | 6×6 | 36 |  | DooM_02_B |
| `TileSideDooM_02_B` | 2B | 6×6 | 36 |  | DooM_02_A |
| `TileSideDooM_03_A` | 3A | 4×6 | 24 |  | DooM_03_B |
| `TileSideDooM_03_B` | 3B | 4×6 | 24 |  | DooM_03_A |
| `TileSideDooM_04_A` | 4A | 4×6 | 24 |  | DooM_04_B |
| `TileSideDooM_04_B` | 4B | 4×6 | 24 |  | DooM_04_A |
| `TileSideDooM_05_A` | 5A | 4×4 | 16 |  | DooM_05_B |
| `TileSideDooM_05_B` | 5B | 4×4 | 16 |  | DooM_05_A |
| `TileSideDooM_06_A` | 6A | 4×4 | 16 |  | DooM_06_B |
| `TileSideDooM_06_B` | 6B | 4×4 | 16 |  | DooM_06_A |
| `TileSideDooM_07_A` | 7A | 4×4 | 16 |  | DooM_07_B |
| `TileSideDooM_07_B` | 7B | 4×4 | 16 |  | DooM_07_A |
| `TileSideDooM_08_A` | 8A | 4×4 | 16 |  | DooM_08_B |
| `TileSideDooM_08_B` | 8B | 4×4 | 16 |  | DooM_08_A |
| `TileSideDooM_09_A` | 9A | 4×4 | 12 |  | DooM_09_B |
| `TileSideDooM_09_B` | 9B | 4×4 | 12 |  | DooM_09_A |
| `TileSideDooM_10_A` | 10A | 2×6 | 12 |  | DooM_10_B |
| `TileSideDooM_10_B` | 10B | 2×6 | 12 |  | DooM_10_A |
| `TileSideDooM_11_A` | 11A | 2×2 | 4 |  | DooM_11_B |
| `TileSideDooM_11_B` | 11B | 2×2 | 4 |  | DooM_11_A |
| `TileSideDooM_12_A` | 12A | 2×2 | 4 |  | DooM_12_B |
| `TileSideDooM_12_B` | 12B | 2×2 | 4 |  | DooM_12_A |
| `TileSideDooM_13_A` | 13A | 2×2 | 4 |  | DooM_13_B |
| `TileSideDooM_13_B` | 13B | 2×2 | 4 |  | DooM_13_A |
| `TileSideDooM_14_A` | 14A | 1×2 | 2 |  | DooM_14_B |
| `TileSideDooM_14_B` | 14B | 1×2 | 2 |  | DooM_14_A |
| `TileSideDooM_15_A` | 15A | 2×1 | 2 |  | DooM_15_B |
| `TileSideDooM_15_B` | 15B | 2×1 | 2 |  | DooM_15_A |
| `TileSideDooM_16_A` | 16A | 6×6 | 36 |  | DooM_16_B |
| `TileSideDooM_16_B` | 16B | 6×6 | 36 |  | DooM_16_A |

## Monstruos y lugartenientes

Tamaño: `small` 1×1, `medium` 1×2, `huge` 2×2, `massive` 2×3 (decide el marco de cada `MPlace`). Act.: activaciones propias (`MonsterActivation<Tipo>…`) + comunes (`activation=`). Rasgos de entorno para `traits=`/`traitpool=` de un Spawn: building cave civilized cursed dark hot cold mountain water wilderness.

| ID | EN | ES | Pack | Tamaño | Ataque | Entorno | Otros | Act. propias | Comunes |
|---|---|---|---|---|---|---|---|---|---|
| `MonsterZombie` | Zombie | Zombi (?) | D2EBase | small | melee | building cursed | undead | 5 | Brawler1 |
| `MonsterGoblinArcher` | Goblin Archer | Arquero goblin (?) | D2EBase | small | ranged | building cave | goblin | 3 | Range1 Range2 Range3 |
| `MonsterCaveSpider` | Cave Spider | Araña de las cavernas (?) | D2EBase | small | melee | cave wilderness |  | 3 | Skirmisher1 Skirmisher2 Skirmisher3 |
| `MonsterFleshMoulder` | Flesh Moulder | Moldeador de carne (?) | D2EBase | small | ranged | civilized cursed |  | 3 | Range1 Range2 Range3 |
| `MonsterBarghest` | Barghest | Barghest (?) | D2EBase | medium | melee | dark wilderness | undead | 3 | Brawler1 Brawler2 Brawler3 |
| `MonsterEttin` | Ettin | Ettin (?) | D2EBase | huge | melee | cave mountain |  | 3 | Brawler1 Brawler2 Brawler3 |
| `MonsterElemental` | Elemental | Elemental (?) | D2EBase | huge | ranged | cold hot |  | 4 |  |
| `MonsterMerriod` | Merriod | Merriod (?) | D2EBase | huge | melee | water wilderness |  | 3 |  |
| `MonsterShadowDragon` | Shadow Dragon | Dragón de las sombras (?) | D2EBase | massive | melee | cave dark |  | 3 | Brawler1 Brawler2 Brawler2 |
| `MonsterLadyElizaFarrow` | Lady Eliza Farrow |  | D2EBase | small |  |  | lieutenant | 6 |  |
| `MonsterLordMerickFarrow` | Lord Merick Farrow |  | D2EBase | small |  |  | lieutenant | 6 |  |
| `MonsterSirAlricFarrow` | Sir Alric Farrow |  | D2EBase | small |  |  | lieutenant | 6 |  |
| `MonsterBelthir` | Belthir |  | D2EBase | small |  |  | lieutenant | 6 |  |
| `MonsterSplig` | Splig |  | D2EBase | small |  |  | lieutenant | 6 |  |
| `MonsterBaronZachareth` | Baron Zachareth |  | D2EBase | small |  |  | lieutenant | 6 |  |
| `MonsterGoblinWitcher` | Goblin Witcher | Brujo goblin (?) | LoR | small | ranged | building cursed |  | 3 | Range1 Range2 Range3 |
| `MonsterVolucrixReaver` | Volucrix Reaver | Segador volucrix (?) | LoR | small | melee | building mountain |  | 4 | Skirmisher1 Skirmisher2 Skirmisher3 |
| `MonsterCarrionDrake` | Carrion Drake | Draco carroñero (?) | LoR | small | melee | dark water |  | 3 | Brawler1 Brawler2 Brawler3 |
| `MonsterArachyura` | Arachyura | Arachyura (?) | LoR | huge | melee | cursed wilderness |  | 3 | Brawler1 Brawler2 Brawler3 |
| `MonsterAriad` | Ariad |  | LoR | small |  |  | lieutenant | 6 |  |
| `MonsterQueenAriad` | Queen Ariad |  | LoR | huge |  |  | lieutenant | 6 |  |
| `MonsterRaythen` | Raythen |  | LoR | small |  |  | lieutenant | 6 |  |
| `MonsterSerena` | Serena |  | LoR | small |  |  | lieutenant | 6 |  |
| `MonsterFireImp` | Fire Imp | Diablillo de fuego (?) | LotW | small | ranged | cursed hot |  | 4 | Range1 Range2 Range3 |
| `MonsterHybridSentinel` | Hybrid Sentinel | Centinela híbrido (?) | LotW | small | melee | cave mountain |  | 3 | Brawler1 Brawler2 Brawler3 |
| `MonsterValyndra` | Valyndra |  | LotW | massive |  |  | lieutenant | 6 |  |
| `MonsterBoneHorror` | Bone Horror | Horror óseo (?) | MoB | small | melee | cave cursed | undead | 3 | Range2 Range3 |
| `MonsterReanimate` | Reanimate | Reanimado (?) | MoB | small | melee | civilized cursed | undead | 3 | Brawler1 Brawler2 Brawler3 |
| `MonsterBroodwalker` | Broodwalker | Caminante de progenie (?) | MoB | small | melee | building dark | undead | 3 | Brawler1 Brawler2 Brawler3 |
| `MonsterArdusIxErebus` | Ardus Ixerebus |  | MoB | small |  |  | lieutenant | 6 |  |
| `MonsterKyndrithul` | Kyndrithul |  | MoB | small |  |  | lieutenant | 6 |  |
| `MonsterZarihell` | Zarihell |  | MoB | small |  |  | lieutenant | 6 |  |
| `MonsterBandit` | Bandit | Bandido (?) | MoR | small | ranged | building wilderness |  | 3 | Range1 Range2 Range3 |
| `MonsterWraith` | Wraith | Espectro (?) | MoR | small | ranged | civilized cursed | undead | 3 | Range1 Range2 Range3 |
| `MonsterSkarn` | Skarn |  | MoR | huge |  |  | lieutenant | 6 |  |
| `MonsterRatSwarm` | Rat Swarm | Enjambre de ratas (?) | SoN | medium | melee | building dark |  | 4 | Skirmisher1 Skirmisher2 Skirmisher3 |
| `MonsterChangeling` | Changeling | Cambiante (?) | SoN | small | melee | civilized cursed |  | 3 | Brawler1 Brawler2 Brawler3 |
| `MonsterIronbound` | Ironbound | Ironbound (?) | SoN | small | melee | building civilized |  | 3 | Brawler1 Brawler2 Brawler3 |
| `MonsterYnfernaelHulk` | Ynfernael Hulk | Mole del Ynfernael (?) | SoN | huge | melee | cursed hot |  | 3 | Brawler1 Brawler2 Brawler3 |
| `MonsterGarganMirklace` | Gargan Mirklace |  | SoN | huge |  |  | lieutenant | 6 |  |
| `MonsterRylanOlliven` | Rylan Olliven |  | SoN | small |  |  | lieutenant | 6 |  |
| `MonsterTristayneOlliven` | Tristayne Olliven |  | SoN | small |  |  | lieutenant | 6 |  |
| `MonsterVerminous` | Verminous |  | SoN | medium |  |  | lieutenant | 6 |  |
| `MonsterMarrowPriest` | Marrow Priest | Sacerdote de la médula (?) | TCTR | small | ranged | building dark |  | 3 | Skirmisher1 Skirmisher2 Skirmisher3 |
| `MonsterTheDispossessed` | Dispossessed | Desposeído (?) | TCTR | small | melee | civilized cursed | undead | 4 |  |
| `MonsterShamblingColossus` | Shambling Colossus | Coloso tambaleante (?) | TCTR | medium | melee | cursed wilderness | undead | 3 | Brawler1 Brawler2 Brawler3 |
| `MonsterHarpy` | Harpy | Arpía (?) | TT | small | melee | mountain wilderness |  | 3 | Brawler1 Brawler2 Brawler3 |
| `MonsterPlagueWorm` | Plague Worm | Gusano de plaga (?) | TT | medium | melee | cave water |  | 3 |  |
| `MonsterBolGoreth` | Bolgoreth |  | TT | huge |  |  | lieutenant | 6 |  |
| `MonsterKobold` | Kobold | Kobold (?) | BotW | small | melee | building cave |  | 4 |  |
| `MonsterHellhound` | Hellhound | Sabueso infernal (?) | BotW | medium | melee | cursed hot |  | 4 |  |
| `MonsterDeepElf` | Deep Elf | Elfo del abismo (?) | BotW | small | melee | cave dark |  | 3 | Brawler1 Brawler2 Brawler3 |
| `MonsterGiant` | Giant | Gigante (?) | CoD | huge | melee | mountain wilderness |  | 3 | Brawler1 Brawler2 Brawler3 |
| `MonsterChaosBeast` | Chaos Beast | Bestia del caos (?) | CoD | huge | ranged | cursed dark |  | 3 | Range1 Range2 Range3 |
| `MonsterLavaBeetle` | Lava Beetle | Escarabajo de lava (?) | CoD | small | ranged | cave hot |  | 4 | Range1 Range2 Range3 |
| `MonsterGolem` | Golem | Gólem (?) | CotF | huge | melee | building mountain |  | 3 | Brawler1 Brawler2 Brawler3 |
| `MonsterMedusa` | Medusa | Medusa (?) | CotF | small | ranged | building cursed |  | 3 | Range1 Range2 Range3 |
| `MonsterSorcerer` | Sorcerer | Hechicero (?) | CotF | small | ranged | building civilized |  | 3 | Range1 Range2 |
| `MonsterCryptDragon` | Crypt Dragon | Dragón de la cripta (?) | GoD | massive | ranged | cursed dark | undead | 3 | Range1 Range2 Range3 |
| `MonsterDarkPriest` | Dark Priest | Sacerdote oscuro (?) | GoD | small | ranged | civilized cursed | undead | 4 | Range1 Range2 Range3 |
| `MonsterWendigo` | Wendigo | Wendigo (?) | GoD | huge | melee | cave cold |  | 3 | Skirmisher1 Skirmisher2 Skirmisher3 |
| `MonsterRazorwing` | Razorwing | Alacortante (?) | OotO | small | melee | cave wilderness |  | 3 | Skirmisher1 Skirmisher2 Skirmisher3 |
| `MonsterBeastmen` | Beastman | Hombre bestia (?) | OotO | small | melee | mountain wilderness |  | 3 | Skirmisher1 Skirmisher2 Skirmisher3 |
| `MonsterBaneSpider` | Bane Spider | Araña ponzoñosa (?) | OotO | huge | ranged | cave dark |  | 3 | Range1 Range2 Range3 |
| `MonsterIceWyrm` | Ice Wyrm | Sierpe de hielo (?) | SoE | massive | melee | cave cold |  | 3 | Brawler1 Brawler2 Brawler3 |
| `MonsterDarkMinotaur` | Dark Minotaur | Minotauro oscuro (?) | SoE | small | melee | civilized dark |  | 4 | Brawler1 Brawler2 Brawler3 |
| `MonsterShade` | Shade | Sombra (?) | SoE | small | melee | cold cursed | undead | 4 | Skirmisher1 Skirmisher2 Skirmisher3 |
| `MonsterFerrox` | Ferrox | Ferrox (?) | SotS | small | melee | cave water |  | 3 | Skirmisher1 Skirmisher2 Skirmisher3 |
| `MonsterBloodApe` | Blood Ape | Simio de sangre (?) | SotS | medium | melee | cave hot |  | 3 | Brawler1 Brawler2 Brawler3 |
| `MonsterNaga` | Naga | Naga (?) | SotS | huge | ranged | cave water |  | 3 | Range1 Range2 Range3 |
| `MonsterSkeletonArcher` | Skeleton Archer | Arquero esqueleto (?) | ToC | small | ranged | civilized cursed | undead | 4 | Range1 Range2 Range3 |
| `MonsterCrowHag` | Crow Hag | Bruja cuervo (?) | ToC | small | ranged | civilized dark |  | 3 | Range1 Range2 Range3 |
| `MonsterDemonLord` | Demon Lord | Señor demonio (?) | ToC | huge | ranged | cursed hot |  | 4 | Range1 Range2 Range3 |
| `MonsterManticore` | Manticore | Mantícora (?) | VoD | medium | ranged | dark wilderness |  | 3 | Range1 Range2 Range3 |
| `MonsterOgre` | Ogre | Ogro (?) | VoD | huge | melee | building cave |  | 3 | Skirmisher1 Skirmisher2 Skirmisher3 |
| `MonsterTroll` | Troll | Troll (?) | VoD | huge | melee | cave mountain |  | 3 | Brawler1 Brawler2 Brawler3 |
| `MonsterAgentSirAlricFarrow` | Sir Alric Farrow |  | DJ12 | small |  |  | agent | 6 |  |
| `MonsterAgentArdusIxErebus` | Ardus Ixerebus |  | DJ43 | small |  |  | agent | 6 |  |
| `MonsterAgentAriad` | Ariad |  | DJ18 | small |  |  | agent | 6 |  |
| `MonsterAgentBelthir` | Belthir |  | DJ10 | small |  |  | agent | 6 |  |
| `MonsterAgentBolGoreth` | Bolgoreth |  | DJ20 | huge |  |  | agent | 6 |  |
| `MonsterAgentLadyElizaFarrow` | Lady Eliza Farrow |  | DJ14 | small |  |  | agent | 6 |  |
| `MonsterAgentKyndrithul` | Kyndrithul |  | DJ41 | small |  |  | agent | 6 |  |
| `MonsterAgentLordMerickFarrow` | Lord Merick Farrow |  | DJ13 | small |  |  | agent | 6 |  |
| `MonsterAgentGarganMirklace` | Gargan Mirklace |  | DJ25 | huge |  |  | agent | 6 |  |
| `MonsterAgentQueenAriad` | Queen Ariad |  | DJ19 | huge |  |  | agent | 6 |  |
| `MonsterAgentRaythen` | Raythen |  | DJ16 | small |  |  | agent | 6 |  |
| `MonsterAgentRylanOlliven` | Rylan Olliven |  | DJ22 | small |  |  | agent | 6 |  |
| `MonsterAgentSerena` | Serena |  | DJ17 | small |  |  | agent | 6 |  |
| `MonsterAgentSkarn` | Skarn |  | DJ35 | huge |  |  | agent | 6 |  |
| `MonsterAgentSplig` | Splig |  | DJ09 | small |  |  | agent | 6 |  |
| `MonsterAgentTristayneOlliven` | Tristayne Olliven |  | DJ24 | small |  |  | agent | 6 |  |
| `MonsterAgentValyndra` | Valyndra |  | DJ15 | massive |  |  | agent | 6 |  |
| `MonsterAgentVerminous` | Verminous |  | DJ23 | medium |  |  | agent | 6 |  |
| `MonsterAgentBaronZachareth` | Baron Zachareth |  | DJ11 | small |  |  | agent | 6 |  |
| `MonsterAgentZarihell` | Zarihell |  | DJ42 | small |  |  | agent | 6 |  |
| `MonsterCyberDemon` | Cyber Demon |  | DooM | small |  |  | Doom | 4 | LongShot ChargedShot Enraged |
| `MonsterBaron_of_Hell` | Baron of Hell |  | DooM | small |  |  | Doom | 3 | Enraged Charge |
| `MonsterCacoDemon` | Caco Demon |  | DooM | small |  |  | Doom | 3 | ChargedShot Charge |
| `MonsterRevenant` | Revenant |  | DooM | small |  |  | Doom | 3 | ExplosiveShot ChargedShot |
| `MonsterMancubus` | Mancubus |  | DooM | small |  |  | Doom | 3 | ExplosiveShot ChargedShot |
| `MonsterPinky` | Pinky |  | DooM | small |  |  | Doom | 3 | Charge |
| `MonsterImp` | Imp |  | DooM | small |  |  | Doom | 3 | LongShot ChargedShot |
| `MonsterPossessed` | Possessed |  | DooM | small |  |  | Doom | 3 | LongShot ChargedShot |
| `MonsterSarcophagusGuard` | Sarcophagus Guard |  | SOTP | small | melee | cave cursed |  | 3 |  |
| `MonsterBurrowingHorror` | Burrowing Horror |  | SOTP | huge | melee | hot mountain |  | 3 |  |

## Activaciones comunes

Activaciones genéricas que los monstruos citan en `activation=` y que un `CustomMonster` puede reutilizar (`activation=Brawler1 Range2`). Las propias de un monstruo se reutilizan igual sin el prefijo (`activation=Zombie1` usa `MonsterActivationZombie1`). J = tiene paso de jefe, E = de esbirro.

| Nombre en `activation=` | J/E | Orden |
|---|---|---|
| `Brawler1` | JE | esbirros primero |
| `Brawler2` | JE | jefe primero |
| `Brawler3` | JE | esbirros primero |
| `Charge` | E | esbirros primero |
| `ChargedShot` | E | esbirros primero |
| `Enraged` | E | esbirros primero |
| `ExplosiveShot` | E | esbirros primero |
| `LongShot` | E | esbirros primero |
| `Range1` | JE | jefe primero |
| `Range2` | JE | esbirros primero |
| `Range3` | JE | esbirros primero |
| `Skirmisher1` | JE | esbirros primero |
| `Skirmisher2` | JE | esbirros primero |
| `Skirmisher3` | JE | esbirros primero |

## Héroes

La variable `#HeroX` vale 1 si ese héroe juega. Arquetipos: warrior (Guerrero), healer (Sanador), mage (Mago), scout (Explorador); DooM tiene el suyo.

| ID | EN | Arquetipo | Pack | Rasgos |
|---|---|---|---|---|
| `HeroAshrian` | Ashrian | healer | D2EBase | female latari |
| `HeroAvricAlbright` | Avric Albright | healer | D2EBase | male |
| `HeroGrisbantheThirsty` | Grisban the Thirsty | warrior | D2EBase | male |
| `HeroJainFairwood` | Jain Fairwood | scout | D2EBase | female |
| `HeroLeoricoftheBook` | Leoric of the Book | mage | D2EBase | male |
| `HeroSyndrael` | Syndrael | warrior | D2EBase | female latari |
| `HeroTombleBurrowell` | Tomble Burrowell | scout | D2EBase | male |
| `HeroWidowTarha` | Widow Tarha | mage | D2EBase | female |
| `HeroDezraTheVile` | Dezra the Vile | mage | LoR | female |
| `HeroLoganLashley` | Logan Lashley | scout | LoR | male |
| `HeroPathfinderDurik` | Pathfinder Durik | warrior | LoR | male |
| `HeroUlmaGrimstone` | Ulma Grimstone | healer | LoR | female dwarf |
| `HeroReynharttheWorthy` | Reynhart the Worthy | warrior | LotW | male |
| `HeroHighMageQuellen` | High Mage Quellen | mage | LotW | male |
| `HeroAlysRaine` | Alys Raine | warrior | MoR | female |
| `HeroThaidenMistpeak` | Thaiden Mistpeak | scout | MoR | male |
| `HeroOrkelltheSwift` | Orkell the Swift | warrior | SoN | male |
| `HeroTinashiTheWanderer` | Tinashi the Wanderer | scout | SoN | female |
| `HeroRavaellaLightfoot` | Ravaella Lightfoot | mage | SoN | female gnome |
| `HeroRendiel` | Rendiel | healer | SoN | male |
| `HeroAugurGrisom` | Augur Grisom | healer | TT | male dwarf |
| `HeroRogannaTheShade` | Roganna the Shade | scout | TT | female latari |
| `HeroLyssa` | Lyssa | mage | BotW | female |
| `HeroChallara` | Challara | mage | BotW | female |
| `HeroRonanOfTheWild` | Ronan of the Wild | scout | BotW | male |
| `HeroVyrahTheFalconer` | Vyrah the Falconer | scout | BotW | female |
| `HeroCorbin` | Corbin | warrior | CoD | male |
| `HeroLindel` | Lindel | scout | CoD | male |
| `HeroBrotherGherinn` | Brother Gherinn | healer | CoD | male |
| `HeroJaesTheExile` | Jaes the Exile | mage | CoD | male |
| `HeroTahlia` | Tahlia | warrior | CotF | female |
| `HeroTetherys` | Tetherys | scout | CotF | female |
| `HeroAndiraRunehand` | Andira Runehand | healer | CotF | female |
| `HeroAstarra` | Astarra | mage | CotF | female |
| `HeroLordHawthorne` | Lord Hawthorne | warrior | GoD | male |
| `HeroSilhouette` | Silhouette | scout | GoD | female |
| `HeroSahla` | Sahla | healer | GoD | male |
| `HeroMordrog` | Mordrog | warrior | GoD | male |
| `HeroTrenloeTheStrong` | Trenloe the Strong | warrior | OotO | male |
| `HeroLaurelOfBloodwood` | Laurel of Bloodwood | scout | OotO | female |
| `HeroElderMok` | Elder Mok | healer | OotO | male |
| `HeroShiver` | Shiver | mage | OotO | male |
| `HeroArvelWorldwalker` | Arvel Worldwalker | scout | SoE | female |
| `HeroOneFist` | One Fist | warrior | SoE | male |
| `HeroKarnon` | Karnon | warrior | SoE | male |
| `HeroSteelhorns` | Steelhorns | warrior | SoE | male |
| `HeroSeerKel` | Seer Kel | mage | SotS | female |
| `HeroTatianna` | Tatianna | scout | SotS | female |
| `HeroOkalukAndRakash` | Okaluk and Rakash | healer | SotS | male |
| `HeroNanokOfTheBlade` | Nanok of the Blade | warrior | SotS | male |
| `HeroKrutzbeck` | Krutzbeck | warrior | ToC | male dwarf |
| `HeroJonasTheKind` | Jonas the Kind | healer | ToC | male |
| `HeroGreyKey` | Grey Ker | scout | ToC | male |
| `HeroZyla` | Zyla | mage | ToC | female |
| `HeroNaraTheFang` | Nara the Fang | warrior | VoD | female |
| `HeroMasterThorne` | Master Thorne | mage | VoD | male |
| `HeroIspher` | Ispher | healer | VoD | male |
| `HeroSirValadir` | Sir Valadir | warrior | VoD | male |
| `HeroRaythen` | Raythen | scout | DJ16 | male |
| `HeroSerena` | Serena | healer | DJ17 | female |
| `HeroAurim` | Aurim | healer | CKAoD | male |
| `HeroEliam` | Eliam | warrior | CKAoD | male |
| `HeroKirga` | Kirga | scout | CKAoD | male |
| `HeroMadCarthos` | Mad Carthos | mage | CKD1E | male |
| `HeroRedScorpion` | Red Scorpion | scout | CKD1E | female |
| `HeroVarikasTheDead` | Varikas the Dead | warrior | CKD1E | male |
| `HeroLandrectheWise` | Landrec the Wise | mage | CKD1E | male |
| `HeroBogranTheShadow` | Bogran the Shadow | scout | CKD1E | male |
| `HeroHugoTheGlorious` | Hugo the Glorious | warrior | CKDQ | male |
| `HeroTobinFarslayer` | Tobin Farslayer | scout | CKPromo | male |
| `HeroLaughinBuldar` | Laughin Buldar | warrior | CKToI | male |
| `HeroBrotherGlyr` | Brother Glyr | healer | CKWoD | male |
| `HeroAlpha` | Alpha | DooM | DooM |  |
| `HeroBravo` | Bravo | DooM | DooM |  |
| `HeroCharlie` | Charlie | DooM | DooM |  |
| `HeroDelta` | Delta | DooM | DooM |  |
| `HeroElgaThePilgrim` | Elga The Pilgrim | healer | SOTP | female |
| `HeroRunemakerTara` | Runemaker Tara | mage | SOTP | female |

## Clases

`#ClassX` vale 1 si alguien la eligió como clase principal. Las híbridas (`hybridarchetype`) añaden una clase normal de ese otro arquetipo.

| ID | EN | Arquetipo | Híbrida con | Pack | Equipo inicial |
|---|---|---|---|---|---|
| `ClassKnight` | Knight | warrior |  | D2EBase | ItemIronLongsword ItemWoodenShieldKnight |
| `ClassBerserker` | Berserker | warrior |  | D2EBase | ItemChippedGreataxe |
| `ClassDisciple` | Disciple | healer |  | D2EBase | ItemIronMace ItemWoodenShieldDisciple |
| `ClassSpiritSpeaker` | Spiritspeaker | healer |  | D2EBase | ItemOakStaff |
| `ClassNecromancer` | Necromancer | mage |  | D2EBase | ItemReapersScythe |
| `ClassRunemaster` | Runemaster | mage |  | D2EBase | ItemArcaneBolt |
| `ClassThief` | Thief | scout |  | D2EBase | ItemThrowingKnives ItemLuckyCharmThief |
| `ClassWildlander` | Wildlander | scout |  | D2EBase | ItemYewShortbow |
| `ClassElementalist` | Elementalist | mage |  | LL | ItemStaffOfConflux ItemRuneshardCache |
| `ClassSoulCollector` | Soul Collector | healer |  | LL | ItemHarvesterScythe |
| `ClassCrusader` | Crusader | healer | warrior | LL |  |
| `ClassHeretic` | Heretic | healer | mage | LL |  |
| `ClassLorekeeper` | Lorekeeper | mage | healer | LL |  |
| `ClassTruthseer` | Truthseer | mage | scout | LL |  |
| `ClassAvenger` | Avenger | warrior | healer | LL |  |
| `ClassRaider` | Raider | warrior | scout | LL |  |
| `ClassRavager` | Ravager | scout | warrior | LL |  |
| `ClassTrickster` | Trickster | scout | mage | LL |  |
| `ClassApothecary` | Apothecary | healer |  | LoR | ItemSmokingVials |
| `ClassBeastmaster` | Beastmaster | warrior |  | LoR | ItemHuntingSpear ItemSkinningKnife |
| `ClassHexer` | Hexer | mage |  | LoR | ItemStaffOfTheGrave |
| `ClassTreasureHunter` | Treasurehunter | scout |  | LoR | ItemLeatherWhip ItemTheDeadMansCompass |
| `ClassChampion` | Champion | warrior |  | LotW | ItemHornOfCourage ItemWornGreatsword |
| `ClassGeomancer` | Geomancer | mage |  | LotW | ItemStasisRune |
| `ClassMarshal` | Marshal | warrior |  | MoR | ItemWarHammer ItemSignetRing |
| `ClassBountyHunter` | Bountyhunter | scout |  | MoR | ItemDoubleCrossbow |
| `ClassSkirmisher` | Skirmisher | warrior |  | SoN | ItemJaggedHandaxe ItemRustedHandaxe |
| `ClassBard` | Bard | healer |  | SoN | ItemTravelersBlade ItemLute |
| `ClassShadowWalker` | Shadowwalker | scout |  | SoN | ItemFeatheredHatchet ItemTribalCloak |
| `ClassConjurer` | Conjurer | mage |  | SoN | ItemPrismaticStaff |
| `ClassWatchman` | Watchman | healer | scout | TCTR |  |
| `ClassMonk` | Monk | scout | healer | TCTR |  |
| `ClassBattlemage` | Battlemage | mage | warrior | TCTR |  |
| `ClassSteelcaster` | Steelcaster | warrior | mage | TCTR |  |
| `ClassProphet` | Prophet | healer |  | TT | ItemIronFlail ItemSagesTome |
| `ClassStalker` | Stalker | scout |  | TT | ItemBlackWidowsWeb ItemHuntingKnife |
| `ClassMarine1` | Marine1 | DooM |  | DooM | ItemSuperShotgun ItemCombatShotgun |
| `ClassMarine2` | Marine2 | DooM |  | DooM | ItemBurstRifle ItemHeavyAssaultRifle |
| `ClassMarine3` | Marine3 | DooM |  | DooM | ItemBurstRifle ItemSuperShotgun |
| `ClassMarine4` | Marine4 | DooM |  | DooM | ItemHeavyAssaultRifle ItemCombatShotgun |
| `ClassHierophant` | Hierophant | healer |  | SOTP | ItemCeremonialStaff ItemSacredScriptures |
| `ClassPsychic` | Psychic | mage |  | SOTP | ItemMindsEyeTurban ItemShadowDarts |

## Habilidades

Por clase, con su coste en experiencia (0 = la básica, gratis).

| Clase | Habilidades (coste) |
|---|---|
| `ClassKnight` | `SkillKnightOathofHonor` (0), `SkillKnightDefend` (1), `SkillKnightChallenge` (1), `SkillKnightAdvance` (1), `SkillKnightShieldSlam` (2), `SkillKnightDefenseTraining` (2), `SkillKnightGuard` (2), `SkillKnightStalwart` (3), `SkillKnightInspiration` (3) |
| `ClassBerserker` | `SkillBerserkerRage` (0), `SkillBerserkerCounterAttack` (1), `SkillBerserkerCripple` (1), `SkillBerserkerBrute` (1), `SkillBerserkerWhirlwind` (2), `SkillBerserkerWeaponMastery` (2), `SkillBerserkerCharge` (2), `SkillBerserkerExecute` (3), `SkillBerserkerDeathRage` (3) |
| `ClassDisciple` | `SkillDisciplePrayerOfHealing` (0), `SkillDiscipleBlessedStrike` (1), `SkillDiscipleCleansingTouch` (1), `SkillDiscipleArmorOfFaith` (1), `SkillDiscipleTimeOfNeed` (2), `SkillDiscipleDivineFury` (2), `SkillDisciplePrayerOfPeace` (2), `SkillDiscipleRadiantLight` (3), `SkillDiscipleHolyPower` (3) |
| `ClassSpiritSpeaker` | `SkillSpiritSpeakerStoneskin` (0), `SkillSpiritSpeakerSharedPain` (1), `SkillSpiritSpeakerHealingRain` (1), `SkillSpiritSpeakerDrainSpirit` (1), `SkillSpiritSpeakerTempest` (2), `SkillSpiritSpeakerCloudOfMist` (2), `SkillSpiritSpeakerNaturesBounty` (2), `SkillSpiritSpeakerVigor` (3), `SkillSpiritSpeakerAncestorSpirits` (3) |
| `ClassNecromancer` | `SkillNecromancerRaiseDead` (0), `SkillNecromancerCorpseBlast` (1), `SkillNecromancerFuryOfUndeath` (1), `SkillNecromancerDeathlyHaste` (1), `SkillNecromancerVampiricBlood` (2), `SkillNecromancerDarkPact` (2), `SkillNecromancerUndeadMight` (2), `SkillNecromancerDyingCommand` (3), `SkillNecromancerArmyOfDeath` (3) |
| `ClassRunemaster` | `SkillRunemasterRunicKnowledge` (0), `SkillRunemasterExplodingRune` (1), `SkillRunemasterInscribeRune` (1), `SkillRunemasterGhostArmor` (1), `SkillRunemasterRunicSorcery` (2), `SkillRunemasterIronWill` (2), `SkillRunemasterRuneMastery` (2), `SkillRunemasterBreakTheRune` (3), `SkillRunemasterQuickCasting` (3) |
| `ClassThief` | `SkillThiefGreedy` (0), `SkillThiefSneaky` (1), `SkillThiefDirtyTricks` (1), `SkillThiefAppraisal` (1), `SkillThiefUnseen` (2), `SkillThiefCaltrops` (2), `SkillThiefTumble` (2), `SkillThiefLurk` (3), `SkillThiefBushwhack` (3) |
| `ClassWildlander` | `SkillWildlanderNimble` (0), `SkillWildlanderEagleEyes` (1), `SkillWildlanderDangerSense` (1), `SkillWildlanderAccurate` (1), `SkillWildlanderFleetOfFoot` (2), `SkillWildlanderBowMastery` (2), `SkillWildlanderFirstStrike` (2), `SkillWildlanderRunningShot` (3), `SkillWildlanderBlackArrow` (3) |
| `ClassElementalist` | `SkillElementalistEarthandSky` (1), `SkillElementalistSunandSea` (1), `SkillElementalistPrimalHarmony` (1), `SkillElementalistStormsFury` (2), `SkillElementalistVolcanicMight` (2), `SkillElementalistSpiritualBalance` (2), `SkillElementalistNaturesEmbrace` (3), `SkillElementalistNaturesFury` (3) |
| `ClassSoulCollector` | `SkillSoulCollectorSpiritLink` (1), `SkillSoulCollectorUnholyBond` (1), `SkillSoulCollectorBlightExtraction` (1), `SkillSoulCollectorCursedSoul` (2), `SkillSoulCollectorEtherealArmor` (2), `SkillSoulCollectorGalvanize` (2), `SkillSoulCollectorReapersPact` (3), `SkillSoulCollectorFontofVitality` (3) |
| `ClassCrusader` | `SkillCrusaderZealousAura` (1), `SkillCrusaderRighteous` (2), `SkillCrusaderDivineLight` (3) |
| `ClassHeretic` | `SkillHereticArcaneHealing` (1), `SkillHereticDarkRecovery` (2), `SkillHereticForbiddenArts` (3) |
| `ClassLorekeeper` | `SkillLorekeeperAncientRemedy` (1), `SkillLorekeeperCarefulBalance` (2), `SkillLorekeeperAllKnowing` (3) |
| `ClassTruthseer` | `SkillTruthseerTrueSight` (1), `SkillTruthseerTranslocation` (2), `SkillTruthseerPrecognition` (3) |
| `ClassAvenger` | `SkillAvengerJusticar` (0), `SkillAvengerHolyChampion` (1), `SkillAvengerVengefulSmite` (2), `SkillAvengerDeathFromAbove` (3) |
| `ClassRaider` | `SkillRaiderIntoTheFray` (0), `SkillRaiderSurpriseAssault` (1), `SkillRaiderDivideTheSpoils` (2), `SkillRaiderCloseTheGap` (3) |
| `ClassRavager` | `SkillRavagerBattleHardened` (0), `SkillRavagerMomentum` (1), `SkillRavagerChargingAssault` (2), `SkillRavagerViciousThrow` (3) |
| `ClassTrickster` | `SkillTricksterRazzleDazzle` (0), `SkillTricksterPrivateCollection` (1), `SkillTricksterNowYouSeeMe` (2), `SkillTricksterArcaneFusion` (3) |
| `ClassApothecary` | `SkillApothecaryHerbalLore` (1), `SkillApothecaryConcoction` (1), `SkillApothecaryInkySubstance` (1), `SkillApothecarySecretFormula` (2), `SkillApothecaryProtectiveTonic` (2), `SkillApothecaryBottledCourage` (2), `SkillApothecaryPotentRemedies` (3), `SkillApothecaryHiddenStash` (3) |
| `ClassBeastmaster` | `SkillBeastmasterSurvivalist` (1), `SkillBeastmasterBestialRage` (1), `SkillBeastmasterStalker` (1), `SkillBeastmasterFeralFrenzy` (2), `SkillBeastmasterShadowHunter` (2), `SkillBeastmasterSavagery` (2), `SkillBeastmasterChangingSkins` (3), `SkillBeastmasterPredator` (3) |
| `ClassHexer` | `SkillHexerAffliction` (1), `SkillHexerViralHex` (1), `SkillHexerPlagueSpasm` (1), `SkillHexerFelCommand` (2), `SkillHexerInternalRot` (2), `SkillHexerCripplingCurse` (2), `SkillHexerPlagueCloud` (3), `SkillHexerAccursedArms` (3) |
| `ClassTreasureHunter` | `SkillTreasureHunterDungeoneer` (1), `SkillTreasureHunterSurvey` (1), `SkillTreasureHunterGoldRush` (1), `SkillTreasureHunterSleightofHand` (2), `SkillTreasureHunterGuardtheSpoils` (2), `SkillTreasureHunterLureofFortune` (2), `SkillTreasureHunterFinder’sKeeper’s` (3), `SkillTreasureHunterTrailofRiches` (3) |
| `ClassChampion` | `SkillChampionValorOfHeroes` (0), `SkillChampionInspiringPresence` (1), `SkillChampionGloryOfBattle` (1), `SkillChampionALivingLegend` (1), `SkillChampionNoMercy` (2), `SkillChampionMotivatingCharge` (2), `SkillChampionStoicResolve` (2), `SkillChampionForTheCause` (3), `SkillChampionValorousStrike` (3) |
| `ClassGeomancer` | `SkillGeomancerTerracal` (0), `SkillGeomancerEarthenAnguish` (1), `SkillGeomancerQuakingWord` (1), `SkillGeomancerStoneTongue` (1), `SkillGeomancerLeyLine` (2), `SkillGeomancerMoltenFury` (2), `SkillGeomancerWaysOfStone` (2), `SkillGeomancerCataclysm` (3), `SkillGeomancerGravitySpike` (3) |
| `ClassMarshal` | `SkillMarshalRetribution` (0), `SkillMarshalZealousFire` (1), `SkillMarshalShockwave` (1), `SkillMarshalJustReward` (1), `SkillMarshalVigilantWatch` (2), `SkillMarshalIAmTheLaw` (2), `SkillMarshalByTheBook` (2), `SkillMarshalLastStand` (3), `SkillMarshalCrushingBlow` (3) |
| `ClassBountyHunter` | `SkillBountyHunterChosenTarget` (0), `SkillBountyHunterNotSoFast` (1), `SkillBountyHunterLieInWait` (1), `SkillBountyHunterLongshot` (1), `SkillBountyHunterEvilEye` (2), `SkillBountyHunterDarkIronChains` (2), `SkillBountyHunterUndercover` (2), `SkillBountyHunterPayday` (3), `SkillBountyHunterRapidFire` (3) |
| `ClassSkirmisher` | `SkillSkirmisherDualStrike` (0), `SkillSkirmisherBackInAction` (1), `SkillSkirmisherDeepWounds` (1), `SkillSkirmisherKeenEdge` (1), `SkillSkirmisherBornInBattle` (2), `SkillSkirmisherUnrelenting` (2), `SkillSkirmisherEverInMotion` (2), `SkillSkirmisherCarveAPath` (3), `SkillSkirmisherUnstoppable` (3) |
| `ClassBard` | `SkillBardSongOfMending` (0), `SkillBardDissonance` (1), `SkillBardUnderstudy` (1), `SkillBardPeacefulRest` (1), `SkillBardAriaOfWar` (2), `SkillBardRehearsal` (2), `SkillBardConcentration` (2), `SkillBardCacophony` (3), `SkillBardWayfarer` (3) |
| `ClassShadowWalker` | `SkillShadowWalkerSoulBound` (0), `SkillShadowWalkerDarkServant` (1), `SkillShadowWalkerFaithfulFriend` (1), `SkillShadowWalkerThroughTheVeil` (1), `SkillShadowWalkerEndlessVoid` (2), `SkillShadowWalkerDarkShift` (2), `SkillShadowWalkerOtherworldly` (2), `SkillShadowWalkerShadowPuppet` (3), `SkillShadowWalkerShadowStep` (3) |
| `ClassConjurer` | `SkillConjurerMirrorImage` (0), `SkillConjurerChanneling` (0), `SkillConjurerManyFriends` (1), `SkillConjurerIllusoryPath` (1), `SkillConjurerRefraction` (1), `SkillConjurerSleightOfMind` (2), `SkillConjurerFocusFire` (2), `SkillConjurerBlindingLight` (2), `SkillConjurerVortex` (3), `SkillConjurerPrismaticAssault` (3) |
| `ClassWatchman` | `SkillWatchmanVigilance` (0), `SkillWatchmanQuickRecovery` (1), `SkillWatchmanTrailblazer` (2), `SkillWatchmanUnity` (3) |
| `ClassMonk` | `SkillMonkGreaterCalling` (0), `SkillMonkInnerBalance` (1), `SkillMonkOpenhanded` (2), `SkillMonkVowOfFreedom` (3) |
| `ClassBattlemage` | `SkillBattlemageArcaneVeteran` (0), `SkillBattlemagePlanarWeapon` (1), `SkillBattlemageRunicWeave` (2), `SkillBattlemageDeathSiphon` (3) |
| `ClassSteelcaster` | `SkillSteelcasterRuneguard` (0), `SkillSteelcasterRuneGrafting` (1), `SkillSteelcasterShieldMage` (2), `SkillSteelcasterIronBlooded` (3) |
| `ClassProphet` | `SkillProphetSoothingInsight` (0), `SkillProphetBattleBision` (1), `SkillProphetForewarning` (1), `SkillProphetGrimFate` (1), `SkillProphetAllSeeing` (2), `SkillProphetLifeLine` (2), `SkillProphetVictoryForeTold` (2), `SkillProphetFocusedInsights` (3), `SkillProphetOmniscience` (3) |
| `ClassStalker` | `SkillStalkerSetTrap` (0), `SkillStalkerExploit` (1), `SkillStalkerHuntersMark` (1), `SkillStalkerMakeshiftTrap` (1), `SkillStalkerEasyPrey` (2), `SkillStalkerLayOfTheLand` (2), `SkillStalkerPoisonBarbs` (2), `SkillStalkerAmbush` (3), `SkillStalkerUpperHand` (3) |
| `ClassMarine1` | `SkillMarine1Defense1` (1), `SkillMarine1Life1` (1), `SkillMarine1Defense2` (2), `SkillMarine1Life2` (2), `SkillMarine1Defense3` (3), `SkillMarine1Life3` (3) |
| `ClassMarine2` | `SkillMarine2Defense1` (1), `SkillMarine2Life1` (1), `SkillMarine2Defense2` (2), `SkillMarine2Life2` (2), `SkillMarine2Defense3` (3), `SkillMarine2Life3` (3) |
| `ClassMarine3` | `SkillMarine3Defense1` (1), `SkillMarine3Life1` (1), `SkillMarine3Defense2` (2), `SkillMarine3Life2` (2), `SkillMarine3Defense3` (3), `SkillMarine3Life3` (3) |
| `ClassMarine4` | `SkillMarine4Defense1` (1), `SkillMarine4Life1` (1), `SkillMarine4Defense2` (2), `SkillMarine4Life2` (2), `SkillMarine4Defense3` (3), `SkillMarine4Life3` (3) |
| `ClassHierophant` | `SkillHierophantEmbalmingRitual` (0), `SkillHierophantEternalService` (1), `SkillHierophantPathOfProphecy` (1), `SkillHierophantHymn` (1), `SkillHierophantSandsOfVengeance` (2), `SkillHierophantShroudOfRespite` (2), `SkillHierophantWordsOfWisdom` (2), `SkillHierophantGiftOfTheDesert` (3), `SkillHierophantRoyalGuard` (3) |
| `ClassPsychic` | `SkillPsychicMentalAssault` (0), `SkillPsychicPrescience` (1), `SkillPsychicEmpathicResolve` (1), `SkillPsychicOverload` (1), `SkillPsychicMentalFortitude` (2), `SkillPsychicPossession` (2), `SkillPsychicReachingOut` (2), `SkillPsychicMindOverMatter` (3), `SkillPsychicToweringIntellect` (3) |

## Objetos

Rasgos útiles para `QItem traits=`/`traitpool=`: `act1`, `act2` (tienda), `class` (equipo de clase, se compra y vende por 25), `relic` (no se vende), y de tipo (`melee`, `ranged`, `magic`, `blade`, `axe`, `hammer`, `bow`, `staff`, `armor`, `shield`, `ring`, `trinket`…). Fama: el objeto solo sale en un sorteo por rasgos si el nivel de fama del grupo cae en su intervalo (ver `formato-escenario.md` §15).

| ID | EN | Rasgos | Precio | Fama | Pack |
|---|---|---|---|---|---|
| `ItemChippedGreataxe` | Chipped Greataxe | axe class | 25 | insignificant | D2EBase |
| `ItemWoodenShieldKnight` | Wooden Shield | shield class | 25 | insignificant | D2EBase |
| `ItemIronMace` | Iron Mace | hammer class | 25 | insignificant | D2EBase |
| `ItemWoodenShieldDisciple` | Wooden Shield | shield class | 25 | insignificant | D2EBase |
| `ItemIronLongsword` | Iron Longsword | blade class | 25 | insignificant | D2EBase |
| `ItemOakStaff` | Oak Staff | staff class | 25 | insignificant | D2EBase |
| `ItemArcaneBolt` | Arcane Bolt | magic rune class | 25 | insignificant | D2EBase |
| `ItemReapersScythe` | Reapers Scythe | staff magic class | 25 | insignificant | D2EBase |
| `ItemYewShortbow` | Yew Shortbow | bow class | 25 | insignificant | D2EBase |
| `ItemThrowingKnives` | Throwing Knives | blade class | 25 | insignificant | D2EBase |
| `ItemLuckyCharmThief` | Lucky Charm | trinket class | 25 | insignificant | D2EBase |
| `ItemLeatherArmor` | Leather Armor | armor light_armor act1 | 75 | insignificant–noteworthy | D2EBase |
| `ItemLeatherArmor2` | Leather Armor | armor light_armor act1 | 75 | insignificant–noteworthy | D2EBase |
| `ItemSteelBroadsword` | Steel Broadsword | melee one_handed blade act1 | 75 | insignificant–impressive | D2EBase |
| `ItemCrossbow` | Crossbow | ranged one_handed bow exotic act1 | 175 | impressive–celebrated | D2EBase |
| `ItemIronBattleaxe` | Iron Battleaxe | melee one_handed axe act1 | 100 | insignificant–impressive | D2EBase |
| `ItemLightHammer` | Light Hammer | melee one_handed hammer act1 | 75 | insignificant–impressive | D2EBase |
| `ItemIronShield` | Iron Shield | one_handed shield act1 | 50 | insignificant–noteworthy | D2EBase |
| `ItemIronShield2` | Iron Shield 2 | one_handed shield act1 | 50 | insignificant–noteworthy | D2EBase |
| `ItemIronSpear` | Iron Spear | melee one_handed exotic act1 | 75 | insignificant–impressive | D2EBase |
| `ItemSunburst` | Sunburst | ranged two_handed magic rune act1 | 125 | insignificant–impressive | D2EBase |
| `ItemElmGreatbow` | Elm Greatbow | ranged two_handed bow act1 | 100 | insignificant–impressive | D2EBase |
| `ItemMagicStaff` | Magic Staff | ranged two_handed staff magic act1 | 125 | insignificant | D2EBase |
| `ItemRingOfPower` | Ring of Power | other ring act1 | 150 | impressive–legendary | D2EBase |
| `ItemLuckyCharm` | Lucky Charm | other trinket act1 | 100 | insignificant–legendary | D2EBase |
| `ItemHeavyCloak` | Heavy Cloak | armor cloak act1 | 75 | insignificant–impressive | D2EBase |
| `ItemChainmail` | Chainmail | armor heavy_armor act1 | 150 | noteworthy–impressive | D2EBase |
| `ItemSling` | Sling | ranged one_handed exotic act1 | 75 | insignificant–impressive | D2EBase |
| `ItemImmolation` | Immolation | ranged two_handed magic rune act1 | 150 | noteworthy–impressive | D2EBase |
| `ItemScorpionHelm` | Scorpion Helm | other helmet act1 | 75 | insignificant–impressive | D2EBase |
| `ItemManaWeave` | Mana Weave | other rune act1 | 125 | noteworthy–legendary | D2EBase |
| `ItemDemonhideLeather` | Demonhide Leather | armor light_armor act2 | 200 | impressive–heroic | D2EBase |
| `ItemElvenCloak` | Elven Cloak | armor cloak act2 | 225 | celebrated–legendary | D2EBase |
| `ItemIceStorm` | Ice Storm | ranged two_handed magic rune act2 | 150 | celebrated–legendary | D2EBase |
| `ItemSteelGreatsword` | Steel Greatsword | melee two_handed blade act2 | 175 | celebrated–legendary | D2EBase |
| `ItemDwarvenFirebomb` | Dwarven Firebomb | ranged one_handed exotic act2 | 175 | celebrated–legendary | D2EBase |
| `ItemDragontoothHammer` | Dragontooth Hammer | melee two_handed hammer act2 | 250 | heroic–legendary | D2EBase |
| `ItemIronBoundRing` | Iron Bound Ring | other ring act2 | 125 | impressive–heroic | D2EBase |
| `ItemTivalCrystal` | Tival Crystal | other trinket act2 | 25 | noteworthy–celebrated | D2EBase |
| `ItemGrindingAxe` | Grinding Axe | melee two_handed axe act2 | 200 | legendary | D2EBase |
| `ItemLightningStrike` | Lightning Strike | ranged two_handed magic rune act2 | 200 | heroic–legendary | D2EBase |
| `ItemMaceOfKellos` | Mace of Kellos | melee one_handed hammer act2 | 175 | celebrated–legendary | D2EBase |
| `ItemLatariLongbow` | Latari Longbow | ranged two_handed bow act2 | 200 | celebrated–heroic | D2EBase |
| `ItemPlatemail` | Platemail | armor heavy_armor act2 | 250 | celebrated–legendary | D2EBase |
| `ItemHeavySteelShield` | Heavy Steel Shield | one_handed shield act2 | 100 | celebrated–legendary | D2EBase |
| `ItemDawnblade` | Relic Dawnblade | blade relic |  | — | D2EBase |
| `ItemFortunasDice` | Relic Fortunas Dice | trinket relic |  | — | D2EBase |
| `ItemShieldOfTheDarkGod` | Relic Shield of the Dark God | shield relic |  | — | D2EBase |
| `ItemStaffOfLight` | Relic Staff of Light | staff magic relic |  | — | D2EBase |
| `ItemTheShadowRune` | Relic the Shadow Rune | magic rune relic |  | — | D2EBase |
| `ItemTrueshot` | Relic Trueshot | bow relic |  | — | D2EBase |
| `ItemStaffOfConflux` | Spire of Conflux | magic staff class | 25 | insignificant | LL |
| `ItemRuneshardCache` | Runeshard Cache | trinket class | 25 | insignificant | LL |
| `ItemHarvesterScythe` | Harvester Scythe | magic blade staff class | 25 | insignificant | LL |
| `ItemSmokingVials` | Smoking Vials | exotic class | 25 | insignificant | LoR |
| `ItemHuntingSpear` | Hunting Spear | exotic class | 25 | insignificant | LoR |
| `ItemSkinningKnife` | Skinning Knife | blade class | 25 | insignificant | LoR |
| `ItemStaffOfTheGrave` | Staff of the Grave | staff magic class | 25 | insignificant | LoR |
| `ItemLeatherWhip` | Leather Whip | exotic class | 25 | insignificant | LoR |
| `ItemTheDeadMansCompass` | The Dead Mans Compass | trinket class | 25 | insignificant | LoR |
| `ItemBowOfBone` | Bow of Bone | ranged two_handed bow act1 | 125 | noteworthy–celebrated | LoR |
| `ItemTeleportaionRune` | Teleportaion Rune | ranged two_handed magic rune act1 | 125 | insignificant–impressive | LoR |
| `ItemRunePlate` | Rune Plate | armor heavy_armor act1 | 225 | impressive–legendary | LoR |
| `ItemShieldOfLight` | Shield of Light | one_handed shield act1 | 75 | noteworthy–celebrated | LoR |
| `ItemThiefsVest` | Thiefs Vest | armor light_armor act1 | 100 | noteworthy–celebrated | LoR |
| `ItemElvenBoots` | Elven Boots | other boots act1 | 50 | noteworthy–celebrated | LoR |
| `ItemPoisonedBlowgun` | Poisoned Blowgun | ranged one_handed exotic act1 | 100 | noteworthy–celebrated | LoR |
| `ItemMaceOfAver` | Mace of Aver | melee two_handed hammer act1 | 150 | noteworthy–celebrated | LoR |
| `ItemSerpentDagger` | Serpent Dagger | melee one_handed blade act1 | 125 | noteworthy–celebrated | LoR |
| `ItemBeardedAxe` | Bearded Axe | melee two_handed axe act1 | 175 | impressive–heroic | LoR |
| `ItemRageBlade` | Rage Blade | melee one_handed blade act2 | 200 | heroic–legendary | LoR |
| `ItemIronClaws` | Iron Claws | melee one_handed blade exotic act2 | 175 | celebrated–legendary | LoR |
| `ItemObsidianGreataxe` | Obsidian Greataxe | melee two_handed axe act2 | 225 | heroic–legendary | LoR |
| `ItemRuneOfMisery` | Rune of Misery | ranged two_handed magic rune act2 | 175 | celebrated–heroic | LoR |
| `ItemBowOfTheEclipse` | Bow of the Eclipse | ranged two_handed bow act2 | 225 | heroic–legendary | LoR |
| `ItemStaffOfTheWild` | Staff of the Wild | staff magic act2 | 175 | celebrated–legendary | LoR |
| `ItemObsidianScalemail` | Obsidian Scalemail | armor heavy_armor act2 | 275 | heroic–legendary | LoR |
| `ItemShroudOfDusk` | Shroud of Dusk | other helmet act2 | 150 | celebrated–legendary | LoR |
| `ItemBlackIronHelm` | Black Iron Helm | other helmet act2 | 150 | impressive–legendary | LoR |
| `ItemCloakOfDeception` | Cloak of Deception | armor cloak act2 | 200 | heroic–legendary | LoR |
| `ItemGauntletsOfPower` | Relic Gauntlets of Power | trinket relic |  | — | LoR |
| `ItemLivingHeart` | Relic Living Heart | trinket relic |  | — | LoR |
| `ItemSunStone` | Relic Sun Stone | trinket relic |  | — | LoR |
| `ItemStasisRune` | Stasis Rune | magic rune class | 25 | insignificant | LotW |
| `ItemWornGreatsword` | Worn Greatsword | blade class | 25 | insignificant | LotW |
| `ItemHornOfCourage` | Horn of Courage | trinket class | 25 | insignificant | LotW |
| `ItemScalemail` | Scalemail | armor heavy_armor act2 | 225 | celebrated–legendary | LotW |
| `ItemMercifulBoots` | Merciful Boots | other boots act2 | 75 | impressive–legendary | LotW |
| `ItemBowOfTheSky` | Bow of the Sky | ranged two_handed bow act2 | 200 | celebrated–legendary | LotW |
| `ItemInscribedRobes` | Inscribed Robes | armor cloak act2 | 225 | celebrated–legendary | LotW |
| `ItemStaffOfKellos` | Staff of Kellos | ranged two_handed staff magic act2 | 175 | celebrated–legendary | LotW |
| `ItemMagmaBlast` | Magma Blast | ranged two_handed magic rune act1 | 150 | noteworthy–celebrated | LotW |
| `ItemFlashPowder` | Flash Powder | other trinket act1 | 100 | noteworthy–heroic | LotW |
| `ItemHandbow` | Handbow | ranged other bow exotic act1 | 125 | noteworthy–impressive | LotW |
| `ItemHalberd` | Halberd | melee two_handed blade staff act1 | 125 | insignificant–impressive | LotW |
| `ItemAuriumMail` | Relic Aurium Mail | heavy_armor relic |  | — | LotW |
| `ItemValyndrasBane` | Relic Valyndras Bane | blade relic |  | — | LotW |
| `ItemMistbane` | Mistbane | melee one_handed blade act1 | 100 | noteworthy–impressive | MoB |
| `ItemCorpsebugBrooch` | Corpsebug Brooch | other trinket act1 | 75 | noteworthy–heroic | MoB |
| `ItemSoulstone` | Soulstone | ranged two_handed magic rune act1 | 125 | noteworthy–celebrated | MoB |
| `ItemBloodscriptRing` | Bloodscript Ring | other ring act1 | 75 | insignificant–celebrated | MoB |
| `ItemWitchHazelBow` | Witch Hazel Bow | ranged two_handed bow magic act1 | 125 | noteworthy–impressive | MoB |
| `ItemMarshCloak` | Marsh Cloak | armor cloak act1 | 150 | impressive–heroic | MoB |
| `ItemBattleTome` | Battle Tome | ranged one_handed magic book act1 | 125 | noteworthy–celebrated | MoB |
| `ItemSoulboundSword` | Soulbound Sword | melee two_handed blade act1 | 100 | impressive–celebrated | MoB |
| `ItemFearEater` | Relic Fear Eater | blade relic |  | — | MoB |
| `ItemUndertakersCoat` | Relic Undertakers Coat | relic |  | — | MoB |
| `ItemTheWhiteCrown` | Relic the White Crown | helmet relic |  | — | MoB |
| `ItemWarHammer` | War Hammer | hammer class | 25 | insignificant | MoR |
| `ItemSignetRing` | Signet Ring | ring class | 25 | insignificant | MoR |
| `ItemDoubleCrossbow` | Double Crossbow | bow exotic class | 25 | insignificant | MoR |
| `ItemHeartSeeker` | Heart Seeker | ranged two_handed bow magic act2 | 200 | heroic–legendary | MoR |
| `ItemWingedBlade` | Winged Blade | melee one_handed blade exotic act2 | 175 | legendary | MoR |
| `ItemHammerOfDoom` | Hammer of Doom | melee two_handed hammer magic act2 | 200 | heroic–legendary | MoR |
| `ItemRuneOfFate` | Rune of Fate | ranged two_handed magic rune act2 | 200 | heroic–legendary | MoR |
| `ItemUndyingSkull` | Undying Skull | other trinket act1 | 75 | insignificant–celebrated | MoR |
| `ItemBlessedShield` | Blessed Shield | one_handed shield act1 | 100 | noteworthy–celebrated | MoR |
| `ItemShadowBracers` | Shadow Bracers | other trinket act1 | 125 | impressive–heroic | MoR |
| `ItemStaffOfGreyhaven` | Staff of Greyhaven | ranged two_handed staff magic act1 | 150 | noteworthy–heroic | MoR |
| `ItemWhiteWolfCloak` | White Wolf Cloak | armor cloak act1 | 150 | noteworthy–celebrated | MoR |
| `ItemShardsOfIthyndrus` | Relic Shards of Ithyndrus | magic exotic relic |  | — | MoR |
| `ItemBookOfStars` | Relic Book of Stars | book relic |  | — | MoR |
| `ItemWanderersStone` | Relic Wanderers Stone | rune relic |  | — | MoR |
| `ItemTravelersBlade` | Travelers Blade | blade class | 25 | insignificant | SoN |
| `ItemLute` | Lute | trinket class | 25 | insignificant | SoN |
| `ItemPrismaticStaff` | Prismatic Staff | staff magic class | 25 | insignificant | SoN |
| `ItemFeatheredHatchet` | Feathered Hatchet | axe exotic class | 25 | insignificant | SoN |
| `ItemTribalCloak` | Tribal Cloak | cloak class | 25 | insignificant | SoN |
| `ItemRustedHandaxe` | Rusted Handaxe | axe class | 25 | insignificant | SoN |
| `ItemJaggedHandaxe` | Jagged Handaxe | axe class | 25 | insignificant | SoN |
| `ItemIncendiaryArrows` | Incendiary Arrows | other trinket act1 | 50 | noteworthy–celebrated | SoN |
| `ItemIronboundRune` | Ironbound Rune | ranged two_handed magic rune act1 | 175 | insignificant–impressive | SoN |
| `ItemBootsOfIron` | Boots of Iron | other boots act1 | 50 | insignificant–impressive | SoN |
| `ItemBaronsCloak` | Barons Cloak | armor cloak act1 | 125 | noteworthy–celebrated | SoN |
| `ItemJeweledMace` | Jeweled Mace | melee one_handed hammer act1 | 100 | insignificant–impressive | SoN |
| `ItemPhoenixPendant` | Phoenix Pendant | other trinket act1 | 50 | insignificant–celebrated | SoN |
| `ItemBloodyDagger` | Bloody Dagger | melee one_handed blade act1 | 75 | noteworthy–celebrated | SoN |
| `ItemBoneBlade` | Bone Blade | melee one_handed blade act1 | 125 | noteworthy–celebrated | SoN |
| `ItemCityGuardsBow` | City Guards Bow | ranged two_handed bow act1 | 75 | insignificant–impressive | SoN |
| `ItemCloakOfMists` | Cloak of Mists | armor cloak act1 | 100 | impressive–heroic | SoN |
| `ItemIronboundShield` | Ironbound Shield | one_handed shield act2 | 200 | heroic–legendary | SoN |
| `ItemIronboundGlaive` | Ironbound Glaive | melee two_handed blade staff act2 | 175 | celebrated–legendary | SoN |
| `ItemShadowTome` | Shadow Tome | other book act2 | 125 | heroic–legendary | SoN |
| `ItemNerekhallPlate` | Nerekhall Plate | armor heavy_armor act2 | 200 | celebrated–legendary | SoN |
| `ItemRatToothDagger` | Rat Tooth Dagger | melee one_handed blade exotic act2 | 175 | celebrated–legendary | SoN |
| `ItemRuneOfBlades` | Rune of Blades | ranged two_handed magic rune act2 | 150 | celebrated–legendary | SoN |
| `ItemRepeatingCrossbow` | Repeating Crossbow | ranged two_handed bow exotic act2 | 200 | heroic–legendary | SoN |
| `ItemGoldenMask` | Golden Mask | other helmet act2 | 75 | impressive–legendary | SoN |
| `ItemVestmentsOfKellos` | Vestments of Kellos | armor light_armor act2 | 200 | impressive–legendary | SoN |
| `ItemStarOfKellos` | Star of Kellos | other trinket act2 | 175 | heroic–legendary | SoN |
| `ItemShadowPlotter` | Relic Shadow Plotter | trinket relic |  | — | SoN |
| `ItemYnfernalRune` | Relic Ynfernal Rune | magic rune relic |  | — | SoN |
| `ItemSpiritedScythe` | Relic Spirited Scythe | blade staff relic |  | — | SoN |
| `ItemBlessedArmor` | Blessed Armor | armor heavy_armor act2 | 250 | celebrated–legendary | TCTR |
| `ItemBloodthirstyBracers` | Bloodthirsty Bracers | other trinket act2 | 125 | impressive–legendary | TCTR |
| `ItemBoneWand` | Bone Wand | magic wand act2 | 200 | celebrated–heroic | TCTR |
| `ItemFistsOfIron` | Fists of Iron | exotic act2 | 125 | celebrated–legendary | TCTR |
| `ItemHornedShield` | Horned Shield | one_handed shield act2 | 150 | celebrated–legendary | TCTR |
| `ItemLightningJavelin` | Lightning Javelin | magic exotic act2 | 200 | celebrated–legendary | TCTR |
| `ItemMaskOfHorrors` | Mask of Horrors | other helmet act2 | 75 | impressive–heroic | TCTR |
| `ItemRunetouchedLeather` | Runetouched Leather | armor light_armor act2 | 150 | noteworthy–celebrated | TCTR |
| `ItemSashOfTheSlayer` | Sash of the Slayer | other belt act2 | 75 | impressive–legendary | TCTR |
| `ItemRobesOfTheLast` | Relic Robes of the Last | armor cloak relic |  | — | TCTR |
| `ItemBonebornBow` | Relic Boneborn Bow | ranged two_handed bow relic |  | — | TCTR |
| `ItemForewarnedRing` | Relic Forewarned Ring | other relic |  | — | TCTR |
| `ItemIronFlail` | Iron Flail | hammer exotic class | 25 | insignificant | TT |
| `ItemSagesTome` | Sages Tome | class | 25 | insignificant | TT |
| `ItemBlackWidowsWeb` | Black Widows Web | exotic class | 25 | insignificant | TT |
| `ItemHuntingKnife` | Hunting Knife | blade class | 25 | insignificant | TT |
| `ItemBeltOfWaterwalking` | Belt of Waterwalking | other belt act1 | 50 | insignificant–impressive | TT |
| `ItemBeltOfAlchemy` | Belt of Alchemy | other belt act1 | 25 | insignificant–impressive | TT |
| `ItemLifedrainSepter` | Lifedrain Septer | ranged one_handed magic wand act1 | 100 | noteworthy–impressive | TT |
| `ItemDireFlail` | Dire Flail | melee two_handed hammer exotic act1 | 150 | noteworthy–celebrated | TT |
| `ItemTrident` | Trident | melee one_handed exotic act1 | 125 | noteworthy–celebrated | TT |
| `ItemGuardianAxe` | Guardian Axe | melee two_handed axe act1 | 175 | insignificant–impressive | TT |
| `ItemDeflectingShield` | Deflecting Shield | one_handed shield act1 | 50 | insignificant–impressive | TT |
| `ItemBoomerang` | Boomerang | ranged one_handed exotic act2 | 200 | celebrated–legendary | TT |
| `ItemStoneArmor` | Stone Armor | armor heavy_armor act2 | 225 | heroic–legendary | TT |
| `ItemBeltOfStrength` | Belt of Strength | other belt act2 | 100 | impressive–heroic | TT |
| `ItemBlastingRune` | Blasting Rune | ranged two_handed magic rune act2 | 200 | celebrated–legendary | TT |
| `ItemGlaive` | Glaive | melee two_handed blade exotic act2 | 175 | celebrated–legendary | TT |
| `ItemImmunityElixir` | Relic Immunity Elixir | trinket relic |  | — | TT |
| `ItemMendingTalisman` | Relic Mending Talisman | trinket relic |  | — | TT |
| `ItemWorkmansRing` | Relic Workmans Ring | trinket relic |  | — | TT |
| `ItemSuperShotgun` | Super Shotgun | Shotgun |  | — | DooM |
| `ItemCombatShotgun` | Combat Shotgun | Shotgun |  | — | DooM |
| `ItemBFG9000` | BFG9000 | Plasma |  | — | DooM |
| `ItemBurstRifle` | Burst Rifle | Rifle |  | — | DooM |
| `ItemChaingun` | Chaingun | Heavy |  | — | DooM |
| `ItemChainsaw` | Chainsaw | Chainsaw |  | — | DooM |
| `ItemGaussCannon` | Gauss Cannon | Cannon |  | — | DooM |
| `ItemHeavyAssaultRifle` | Heavy Assault Rifle | Rifle Heavy |  | — | DooM |
| `ItemPlasmaRifle` | Plasma Rifle | Rifle Plasma |  | — | DooM |
| `ItemRocketLauncher` | Rocket Launcher | Heavy |  | — | DooM |
| `ItemStaticRifle` | Static Rifle | Rifle |  | — | DooM |
| `ItemSacredScriptures` | Sacred Scriptures | book ring class | 25 | — | SOTP |
| `ItemCeremonialStaff` | Ceremonial Staff | exotic staff Melee class | 25 | — | SOTP |
| `ItemMindsEyeTurban` | Minds Eye Turban | ring helmet class | 25 | — | SOTP |
| `ItemShadowDarts` | Shadow Darts | exotic magic Ranged class | 25 | — | SOTP |
| `ItemBagOfTricks` | Bag Of Tricks | trinket ring act1 | 125 | — | SOTP |
| `ItemCrystalOfMirages` | Crystal Of Mirages | trinket ring act1 | 100 | — | SOTP |
| `ItemGoldenOrbMace` | Golden Orb Mace | hammer magic Melee one_handed act1 | 75 | — | SOTP |
| `ItemPiercingArrows` | Piercing Arrows | trinket ring act1 | 75 | — | SOTP |
| `ItemScarPitGreaves` | Scar Pit Greaves | boots ring act1 | 100 | — | SOTP |
| `ItemSunBlessedRune` | Sun Blessed Rune | magic rune Ranged two_handed act1 | 100 | — | SOTP |
| `ItemSunspear` | Sunspear | exotic Melee two_handed act1 | 100 | — | SOTP |
| `ItemViziersGarments` | Viziers Garments | cloak armor act1 | 125 | — | SOTP |
| `ItemChainSickle` | Chain Sickle | blade exotic Melee two_handed act2 | 200 | — | SOTP |
| `ItemEyeOfTheNight` | Eye Of The Night | ring act2 | 75 | — | SOTP |
| `ItemIbisBow` | Ibis Bow | bow Ranged two_handed act2 | 200 | — | SOTP |
| `ItemLostCaliphsCrook` | Lost Caliphs Crook | magic staff Ranged two_handed act2 | 200 | — | SOTP |
| `ItemScarabAmulet` | Scarab Amulet | trinket ring act2 | 100 | — | SOTP |
| `ItemShimmeringShield` | Shimmering Shield | shield one_handed act2 | 200 | — | SOTP |
| `ItemStarOfAtar` | Star Of Atar | trinket ring act2 | 100 | — | SOTP |
| `ItemStarmetalKhopesh` | Starmetal Khopesh | blade exotic Melee one_handed act2 | 150 | — | SOTP |
| `ItemSunlightWard` | Sunlight Ward | trinket ring act2 | 150 | — | SOTP |

## Fichas (Token)

| ID | Pack | Imagen |
|---|---|---|
| `TokenSearch` | D2EBase | Search-Token |
| `TokenSearchSpecial` | D2EBase | Search-Token-Special |
| `TokenObjectiveBack` | D2EBase | Objective-Token-Black |
| `TokenObjectiveBlue` | D2EBase | Objective-Token-Blue |
| `TokenObjectiveGreen` | D2EBase | Objective-Token-Green |
| `TokenObjectiveRed` | D2EBase | Objective-Token-Red |
| `TokenObjectiveWhite` | D2EBase | Objective-Token-White |
| `TokenVillagerMan` | D2EBase | Villager-Token-Man |
| `TokenVillagerWoman` | D2EBase | Villager-Tokens-Woman |
| `TokenSunStone` | LoR | TokenSunStone |
| `TokenSecretA` | LotW | SecretA |
| `TokenSecretB` | LotW | SecretB |
| `TokenCrumblingTerrain` | MoB | Rubble-token-clipped |
| `Token_Web` | D1ED | web1x1 |
| `Token_Stairs` | D1ED | stairs |
| `Token_DM1_Objective` | DooM | Objective |
| `Token_DM1_Progress` | DooM | Progress |
| `Token_DM1_Threat` | DooM | Threat |
| `Token_DM_MedPack` | DooM | Med |
| `Token_DM_Copy` | DooM | Copy |
| `Token_DM_Red_Portal_A` | DooM | Red_Portal_A |
| `Token_DM_Red_Portal_I` | DooM | Red_Portal_I |
| `Token_DM_Blue_Portal_A` | DooM | Blue_Portal_A |
| `Token_DM_Blue_Portal_I` | DooM | Blue_Portal_I |
| `Token_DM_Yellow_Portal_A` | DooM | Yellow_Portal_A |
| `Token_DM_Yellow_Portal_I` | DooM | Yellow_Portal_I |
| `Token_DM_A_Teleport` | DooM | Teleport_Active |
| `Token_DM_I_Teleport` | DooM | Teleport_InActive |
| `Token_DM_FGrenade` | DooM | FGrenade |
| `Token_DM_Grenade` | DooM | Grenade |
| `Token_DM_CombatShotgun` | DooM | CombatShotgun |
| `Token_DM_SuperShotgun` | DooM | SuperShotgun |
| `Token_DM_BurstRifle` | DooM | BurstRifle |
| `Token_DM_HeavyAssaultRifle` | DooM | HeavyAssaultRifle |
| `Token_DM_PlasmaRifle` | DooM | PlasmaRifle |
| `Token_DM_StaticRifle` | DooM | StaticRifle |
| `Token_DM_Chaingun` | DooM | Chaingun |
| `Token_DM_GaussCannon` | DooM | GaussCannon |
| `Token_DM_BFG9000` | DooM | BFG9000 |
| `Token_DM_RocketLauncher` | DooM | RocketLauncher |
| `Token_DM_Chainsaw` | DooM | Chainsaw |

## Imágenes para UI

Nombres para el `image=` de un `UI` (se buscan antes que los ficheros).

`ImageDefeat`, `ImageCityNight`, `ImageClouds`, `ImagePaper`, `ImageCloudsGrey`, `ImageRock`, `ImageDelveDefeat`, `ImageDelvePrologue`, `ImageDelveVictory`, `ImageMap`, `ImageMapBack`, `ImageDelveFG`, `ImageGoldSack`, `ImageGreyhavenBackground`, `ImageGreyhavenIcon`, `ImageKFDefeat`, `ImageKFPrologue`, `ImageKFVictory`, `ImageKindredFireIcon`, `ImageRoaGMap`, `ImageMapKindredFire`, `ImageMapNerekhall`, `ImageBlueArrow`, `ImageMerickFarrow`, `ImageCircleUnknown`, `ImageSoCDefeat`, `ImageSoCIcon`, `ImageSoCPrologue`, `ImageSoCVictory`, `ImageNerekhallBackground`, `ImageNerekhallIcon`, `ImageQuestArachnophilia`, `ImageQuestBloodhound`, `ImageQuestBoundByFear`, `ImageQuestBurningWrath`, `ImageQuestChooseYourPoison`, `ImageQuestDefenseOfThelys`, `ImageQuestDemonHive`, `ImageQuestDragonHunting`, `ImageQuestEnemyofmyEnemy`, `ImageQuestGatherNoMoss`, `ImageQuestGladeofIllusions`, `ImageQuestGoblinKing`, `ImageQuestHestionsHost`, `ImageQuestHookLine`, `ImageQuestInAManorOfSpeaking`, `ImageQuestKildarthForsaken`, `ImageQuestLairofTekaris`, `ImageQuestLetThemGo`, `ImageQuestLiarLiar`, `ImageQuestMadMoridensTower`, `ImageQuestMissingInAction`, `ImageQuestMothandFlame`, `ImageQuestNamesOfNightfall`, `ImageQuestPestControl`, `ImageQuestPrisonerExchange`, `ImageQuestPrisonerOfIcespire`, `ImageQuestServantsOfTheKing`, `ImageQuestSmashandGrab`, `ImageQuestSoulSave`, `ImageQuestStandAtThaugrimsRest`, `ImageQuestTempleElementalDragon`, `ImageQuestTheArchive`, `ImageQuestTimeTrials`, `ImageQuestTombsofKayladorn`, `ImageQuestToothAndBlade`, `ImageQuestTreasureDavinThrom`, `ImageQuestTrollsTreasure`, `ImageQuestUnstableForces`, `ImageQuestWhatBringsUsTogether`, `ImageQuestWorstExoticMerriod`, `ImageRiseOfAllGoblinsIcon`, `ImageROAGPrologue`, `ImageScroll`, `ImageDarkBackground`, `ImageSideQuestIcon`, `ImageStoryQuestIcon`, `ImageTamalirBackground`, `ImageTamalirIcon`, `ImageTheDelveIcon`, `ImageWoodSlab`, `ImageTrialGirl`, `ImageFrostGateBackground`, `ImageFrostgateEpilogue`, `ImageFrostgateIcon`, `ImageFrostgateLockedIcon`, `ImageFrostgatePrologue`, `ImageFrostgateMenu`, `ImageIconBear`, `ImageIconHawk`, `ImageIconLion`, `ImageIconWolf`, `ImageLogoFrostgate`, `ImageLowEditorTransparency`, `ImageMediumEditorTransparency`, `ImageHighEditorTransparency`, `ImageEmbersOfDreadIcon`, `ImageEmbersOfDreadLogo`, `ImageEmbersOfDreadMap`, `ImageQuestsCaveofWonders`, `ImageQuestsFortRodric`, `ImageQuestsRiverwatch`, `ImageQuestsSkydown`, `ImageQuestsSudanya`, `ImageQuestsVynelvale`, `ImageRiverwatchIcon`, `ImageRiverwatchBackground`

## Audio

Nombres para `audio=` y `music=` (rasgos entre paréntesis).

`AudioMenu` (menu music), `AudioSetup` (menu music), `AudioForestNight` (quest music), `AudioForestDay` (quest music), `AudioInside` (quest music), `AudioMountains` (quest music), `AudioNature` (quest music), `AudioOutdoors` (quest music), `AudioSelect` (), `AudioSkillAdd` (), `AudioSkillRemove` (), `AudioSoftButton` (), `AudioTitleScreenBG` (), `AudioTravelEvent` (), `AudioUISlideIn` (), `AudioUISlideOut` (), `AudioWaterfall` (), `AudioWind` (), `AudioWorldMap` (), `AudioBLDefeat` (), `AudioBLVictory` (), `AudioButton1` (), `AudioButton2` (), `AudioCityAmbience` (), `AudioCollectionDecrease` (), `AudioCollectionIncrease` (), `AudioDeselect` (), `AudioFire` (), `AudioGold1` (), `AudioGold2` (), `AudioGold3` (), `AudioGold4` (), `AudioKFAmbient` (), `AudioKnockout` (), `AudioMonsterActivation` (), `AudioDefeated` (defeated), `AudioNewRound` (newround), `AudioPaperSlideIn` (), `AudioPaperSlideOut` (), `AudioQuest` (), `AudioQuestBegin` (), `AudioRaining` (), `AudioRecover` (), `AudioRewardFail` (), `AudioRewardPass` (), `AudioRiver` (), `AudioToFG01` (), `AudioToFGEpilogue` (), `AudioToFGPrologueBear` (), `AudioToFGPrologueHawk` (), `AudioToFGPrologueLion` (), `AudioToFGPrologueWolf` (), `AudioTrialBearSelected` (), `AudioTrialHawkSelected` (), `AudioTrialLionSelected` (), `AudioTrialWolfSelected` ()

## Peligros y viajes

Eventos de contenido que Valkyrie añade a cualquier escenario de Descent. `$perilMinor`, `$perilMajor` o `$perilDeadly` a 1 → al final de la ronda sale un peligro al azar de ese nivel (`PerilMinorPool`…). `$@travelevent` a 1 → un evento de viaje al azar (`PerilTravel`). Sus textos son de la app oficial.

| Evento | Disparador | Condiciones |
|---|---|---|
| `PerilMinor1` |  |  |
| `PerilMinor22H` |  | #heroes,==,2 |
| `PerilMinor23H` |  | #heroes,==,3 |
| `PerilMinor24H` |  | #heroes,==,4 |
| `PerilMinor3` |  |  |
| `PerilMinor4` |  |  |
| `PerilMinor5` |  |  |
| `PerilMinor10` |  | #TT,>,0 |
| `PerilMinor11` |  | #SoN,>,0 |
| `PerilMinor11NextNoTT` | EndRound | $perilMinor11,>,0 #TT,==,0 |
| `PerilMinor11NextTT` | EndRound | $perilMinor11,>,0 #TT,>,0 |
| `PerilMinor12` |  | #MoR,>,0 #MoB,>,0 |
| `PerilMinor13` |  |  |
| `PerilMajor1` |  | #monsters,>,0 |
| `PerilMajor2` |  |  |
| `PerilMajor4` |  |  |
| `PerilMajor9` |  |  |
| `PerilMajor11` |  |  |
| `PerilDeadly1` |  |  |
| `PerilDeadly2` |  |  |
| `PerilD22` | EndRound | $perilDeadly2Count,==,1 |
| `PerilD2End` | EndRound | $perilDeadly2Count,==,2 |
| `PerilMinorPool` | EndRound | $perilMinor,>,0 |
| `PerilMajorPool` | EndRound | $perilMajor,>,0 |
| `PerilDeadlyPool` | EndRound | $perilDeadly,>,0 |
| `PerilTravel` | Var$travelevent |  |
| `PerilTravelQuite1` |  |  |
| `PerilTravelQuite2` |  |  |
| `PerilTravelQuite3` |  |  |
| `PerilTravelQuite4` |  |  |
| `PerilTravelQuite5` |  |  |
| `PerilTravelQuite6` |  |  |
| `PerilTravelQuite7` |  |  |
| `PerilTravelQuite8` |  |  |
| `PerilTravelQuite9` |  |  |
| `PerilTravelQuite10` |  |  |
| `PerilTravelQuite11` |  |  |
| `PerilTravelQuite12` |  |  |
| `PerilTravelQuiteContinue` |  |  |
