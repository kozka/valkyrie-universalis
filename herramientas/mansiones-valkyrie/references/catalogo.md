# Catálogo de componentes de Valkyrie para Mansiones de la Locura

Generado automáticamente por `scripts/construir_catalogo.py` a partir de los content packs de Valkyrie (`unity/Assets/StreamingAssets/content/MoM`). Para buscar rápido usa `python scripts/buscar.py <texto>`.

Los nombres visibles (`{ffg:...}`) se importan de la app oficial: en los textos usa `{c:TileX}`, `{c:SpawnX}`, `{c:QItemX}` o `{type}` para que Valkyrie muestre el nombre oficial en el idioma del jugador. Las columnas 'EN' son nombres derivados de la clave, solo orientativos.

## Índice

1. [Packs (expansiones)](#packs-expansiones)
2. [Losetas (TileSide)](#losetas-tileside)
3. [Monstruos](#monstruos)
4. [Objetos](#objetos)
5. [Investigadores](#investigadores)
6. [Fichas (Token)](#fichas-token)
7. [Imágenes para UI](#imágenes-para-ui)
8. [Audio](#audio)
9. [Imágenes de puzle](#imágenes-de-puzle)
10. [Tipos de ataque y categorías](#tipos-de-ataque-y-categorías)
11. [Variables de Mitos](#variables-de-mitos)
12. [Activaciones oficiales](#activaciones-oficiales)

## Packs (expansiones)

| ID (`packs=`) | Producto | Nombre en español | Tipo | Activa también |
|---|---|---|---|---|
| `MoMBase` | Juego base (MAD20) | Las Mansiones de la Locura 2ª ed. | box |  |
| `BtT` | Beyond the Threshold (MAD23) | Más Allá del Umbral | box |  |
| `MoM1CK` | Kit de conversión: fichas y objetos | Kit de conversión | ck |  |
| `CotWI` | Call of the Wild: investigadores | La Llamada de lo Salvaje: investigadores | ck |  |
| `CotWM` | Call of the Wild: monstruos | La Llamada de lo Salvaje: monstruos | ck |  |
| `CotWT` | Call of the Wild: losetas | La Llamada de lo Salvaje: losetas | ck |  |
| `FAI` | Forbidden Alchemy: investigadores | Alquimia Prohibida: investigadores | ck |  |
| `FAM` | Forbidden Alchemy: monstruos | Alquimia Prohibida: monstruos | ck |  |
| `FAT` | Forbidden Alchemy: losetas | Alquimia Prohibida: losetas | ck |  |
| `MoM1EI` | 1ª ed. base: investigadores | 1ª ed.: investigadores | ck |  |
| `MoM1EM` | 1ª ed. base: monstruos | 1ª ed.: monstruos | ck |  |
| `MoM1ET` | 1ª ed. base: losetas | 1ª ed.: losetas | ck |  |
| `HJ` | Horrific Journeys (MAD27) | Viajes Escalofriantes | box |  |
| `PotS` | Path of the Serpent (MAD28) | La Senda de la Serpiente | box |  |
| `RN` | Recurring Nightmares (MAD21) | Pesadillas Recurrentes | ft | MoM1ET MoM1EM MoM1EI MoM1CK |
| `SM` | Suppressed Memories (MAD22) | Recuerdos Reprimidos | ft | FAM CotWM FAI CotWI FAT CotWT |
| `SoA` | Streets of Arkham (MAD25) | Calles de Arkham | box |  |
| `SoT` | Sanctum of Twilight (MAD26) | El Santuario del Crepúsculo | box |  |
| `TLE` | Lost Expeditions (community pack) | Expediciones perdidas (pack de la comunidad) | MoMCustom |  |

Los de tipo `MoMCustom` son packs de la comunidad: el jugador los baja en Mi colección (Descarga de contenidos) y el escenario los pide en `packs=` como una expansión. De ellos el catálogo solo guarda identificadores y datos.


En `packs=` usa los IDs desglosados del kit de conversión (`MoM1ET`, `CotWM`...) en vez de `RN`/`SM`, para que el escenario funcione tanto con la colección de figuras como con la 1ª edición física. `MoMBase` no hace falta ponerlo.

## Losetas (TileSide)

Tamaño en unidades de Valkyrie (1 espacio de MoM ≈ 3,5 unidades) a rotación 0. Aberturas: lado N/E/S/O, `P`=puerta (centro medido desde el extremo oeste en N/S y desde el norte en E/O), `A`=borde abierto (tramo). Datos de geometría de ValkyrieMCP (MIT); `?` = sin geometría (1ª edición). Qué hay dibujado en cada cara (zonas y objetos, en español): `python scripts/losetas.py ver <TileSide>`; buscar caras por lo que tienen: `python scripts/losetas.py buscar <palabras>`.


### Juego base (MAD20) (`MoMBase`)

| ID | EN | Tamaño | Rasgos | Reverso | Aberturas | Descripción |
|---|---|---|---|---|---|---|
| `TileSideAlley1` | Alley 1 | 7×3.5 | outside small street | Bedroom1 | N:P5.25 E:A0.21-3.28 S:P1.75 W:A0.21-3.28 | Brick-walled alley with hanging lantern and barrels |
| `TileSideAlley2` | Alley 2 | 7×3.5 | outside small street | Bedroom2 | N:P1.74 E:A0.21-3.28 S:P5.24 W:A0.21-3.28 | Dark brick alley with crates, barrels, and debris |
| `TileSideAlleyCorner1` | Alley Corner 1 | 7×3.5 | outside small street | HallCorner1 | N:P1.75 E:P1.74 S:A3.71-6.79 W:A0.21-3.28 | Brick alley corner open east and turning south |
| `TileSideAlleyCorner2` | Alley Corner 2 | 7×3.5 | outside small street | HallCorner2 | E:A0.21-3.28 S:A0.19-3.28,P5.25 W:P1.74 | Brick alley corner open west with barrels and streetlamp |
| `TileSideAlleyEnd` | Alley End | 7×3.5 | outside small street | BilliardsRoom | N:P5.25 E:A0-3.5 S:P1.75 W:P1.75 | Dead-end alley with fruit stand, barrels, and curved pipe |
| `TileSideAttic` | Attic | 7×7 | inside medium stairs | ParkPond | E:P5.25 S:P1.75 | Dark wooden attic with stairs down and skylight overhead |
| `TileSideBallroom` | Ballroom | 7×7 | inside medium | Warehouse | E:P1.75 W:P5.25 | Elegant ballroom with herringbone floor, piano, and chandelier |
| `TileSideBasement` | Basement | 7×7 | inside medium stairs | FleaMarket | N:P5.25 E:P5.25 S:P1.75 W:P1.75 | Grimy basement with furnace, stairs up, and stone pillars |
| `TileSideBathroom` | Bathroom | 7×3.5 | inside small hallway bathroom | Street1 | N:P1.75 S:A0.21-3.28 W:A0.21-3.28 | Bathroom with bathtub and hallway with desk and chair |
| `TileSideBeach` | Beach | 7×3.5 | inside outside small water | Yard2 | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Sandy beach with beached rowboat and wooden shack |
| `TileSideBedroom1` | Bedroom 1 | 7×3.5 | inside small bedroom | Alley1 | N:P5.25 E:P1.75 | Cozy bedroom with bed, chair, and diagonal wall division |
| `TileSideBedroom2` | Bedroom 2 | 7×3.5 | inside small bedroom | Alley2 | S:P5.24 | Cluttered bedroom with couch, rug, and stacked luggage |
| `TileSideBellTower` | Bell Tower | 7×3.5 | inside small | StreetCorner1 | N:P1.75 | Bell tower interior with spiral staircase and large bell |
| `TileSideBilliardsRoom` | Billiards Room | 7×3.5 | inside small | AlleyEnd | E:P1.75 | Billiards room with pool table, bar area, and leather chairs |
| `TileSideConservatory` | Conservatory | 7×7 | inside outside medium | Storefront | N:A0-3.87 E:P1.75,A3.19-7 S:A0-7 W:A0-7 | Glass conservatory with stone path leading through garden to greenhouse |
| `TileSideDiningRoom` | Dining Room | 7×7 | inside medium kitchen | TownSquare | E:P1.75 S:P1.75 W:P1.75 | Dining room with long counter, hexagonal kitchen floor, and stove |
| `TileSideDock1` | Dock 1 | 7×3.5 | outside small dock | Hall2 | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Weathered wooden dock with crates and barrels by the water |
| `TileSideDock2` | Dock 2 | 7×3.5 | outside small dock | Hall1 | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Dark wet dock planks with rope, life preserver, and mooring posts |
| `TileSideEntryHall` | Entry Hall | 7×3.5 | inside small hallway | StreetCorner2 | N:P1.75,P5.25 E:A0.21-3.28 S:P1.75,P5.25 W:P1.74 | Checkered tile entry hall with armchair and stone columns |
| `TileSideFleaMarket` | Flea Market | 7×7 | outside medium | Basement | N:A0-7 E:A0-7 S:A0-7 W:A0-7 | Bustling outdoor flea market with striped awnings and scattered crates |
| `TileSideHall1` | Hall 1 | 7×3.5 | inside small hallway | Dock2 | N:P5.24 E:A0.21-3.28 S:P1.74 W:A0.21-3.28 | Wooden hallway with large red rug and side doors |
| `TileSideHall2` | Hall 2 | 7×3.5 | inside small hallway | Dock1 | N:P1.75 E:A0.21-3.28 S:P1.75,P5.25 W:A0.21-3.28 | Wooden hallway with red chair, papers, and ceiling lights |
| `TileSideHallCorner1` | Hall Corner 1 | 7×3.5 | inside small hallway | AlleyCorner1 | N:P1.75 E:P1.74 S:P1.75,A3.71-6.78 W:A0.21-3.28 | L-shaped corner hallway with potted plant and small table |
| `TileSideHallCorner2` | Hall Corner 2 | 7×3.5 | inside small hallway | AlleyCorner2 | N:P1.75 E:A0.21-3.28 S:A0.21-3.28,P5.25 | L-shaped corner hallway with round rug and side table |
| `TileSideHallEnd` | Hall End | 7×3.5 | inside small hallway | StreetCorner3 | N:P5.25 E:P1.74 S:P1.75 W:A0.21-3.28 | Dead-end hallway with dark rug, red chair, and scattered papers |
| `TileSideHallStairs` | Hall Stairs | 7×3.5 | inside small hallway stairs | Street2 | E:A0.21-3.28 W:P1.74 | Red-carpeted staircase descending between walled landings |
| `TileSideHouseBoat` | House Boat | 7×3.5 | outside inside small water ship | Office | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Small wooden houseboat deck cluttered with rope and supplies |
| `TileSideInteriorHall` | Interior Hall | 7×7 | inside medium hallway | RootCellar | E:P1.75 W:P1.75,P5.25 | Interior hall with parquet floor, ornate clock, and bed alcove |
| `TileSideLibrary` | Library | 7×3.5 | inside small | Yard1 | E:P1.74 S:P1.75 | Library with bookshelves, ornate rug, and reading furniture |
| `TileSideLobby` | Lobby | 7×7 | inside medium | ToolShed | N:P3.51 E:P1.75,P5.25 S:P1.75,P5.25 W:P1.75,P5.25 | Grand lobby with red walls, checkered floor, and chandelier |
| `TileSideLounge` | Lounge | 7×7 | inside medium | Pier | E:P1.75 S:P5.25 | Elegant lounge with sofas, armchairs, and herringbone parquet floors |
| `TileSideOffice` | Office | 7×3.5 | inside small | HouseBoat | N:P5.24 W:P1.74 | Cluttered office with desk, chair, stairs, and filing cabinets |
| `TileSideParkPond` | Park Pond | 7×7 | outside medium water | Attic | N:A0-7 E:A0-7 S:A0-7 W:A0-3.23,A3.64-7 | Dark park pond surrounded by grass, trees, and a gravel path |
| `TileSidePier` | Pier | 7×7 | inside outside medium dock water | Lounge | N:A0-7 E:A0-7 S:A0-7 W:A0-7 | Wooden pier shed with green tiled dock area and water access |
| `TileSideRentalDock` | Rental Dock | 7×3.5 | inside outside small dock | Study | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Boat rental dock with shack, rowboats, and rope pilings |
| `TileSideRootCellar` | Root Cellar | 7×7 | inside outside medium | InteriorHall | N:P1.75 E:A3.72-7 S:A0-7 W:P1.75,A3.72-7 | Root cellar with barrels, shelves, and stairs leading to grassy yard |
| `TileSideStorefront` | Storefront | 7×7 | inside outside medium street | Conservatory | N:P1.75 E:A3.72-7 S:A0-7 W:A3.72-7 | Cobblestone street frontage with interior shop shelves and wooden walls |
| `TileSideStreet1` | Street 1 | 7×3.5 | outside small street | Bathroom | N:A0-7 E:A0-3.28 S:P1.75 W:A0-3.28 | Dark cobblestone street section with lamplight and drainpipe |
| `TileSideStreet2` | Street 2 | 7×3.5 | outside small street | HallStairs | N:A0-7 E:A0-3.28 S:P5.25 W:A0-3.28 | Cobblestone street segment with one doorway along north wall |
| `TileSideStreetCorner1` | Street Corner 1 | 7×3.5 | outside small street | BellTower | N:A0-7 E:A0-3.28 S:A0-3.28,P5.25 W:A0-3.5 | Street corner with cobblestones, building walls on north and west |
| `TileSideStreetCorner2` | Street Corner 2 | 7×3.5 | outside small street | EntryHall | N:A0-7 E:A0-3.5 S:P1.75,A3.71-7 W:A0-3.28 | Dark cobblestone street corner with stairs descending east |
| `TileSideStreetCorner3` | Street Corner 3 | 7×3.5 | outside small street | HallEnd | N:A0-7 E:A0-3.5 S:A3.71-7 W:A0-3.28 | Brick street corner with manhole cover and dim lighting |
| `TileSideStudy` | Study | 7×3.5 | inside small | RentalDock | S:P5.25 W:P1.74 | Wood-floored study with armchair, rug, trunks, and globe |
| `TileSideToolShed` | Tool Shed | 7×7 | inside outside medium | Lobby | N:A0-7 E:A0-7 S:A0-7 W:A0-7 | Small walled tool shed surrounded by open grassy yard with paths |
| `TileSideTownSquare` | Town Square | 7×7 | outside medium | DiningRoom | N:A0-7 E:A0-7 S:A0-7 W:A0-7 | Circular cobblestone town square with ornate central fountain |
| `TileSideWarehouse` | Warehouse | 7×7 | inside medium storage | Ballroom | N:P5.25 E:P5.25 W:P1.75 | Wooden warehouse interior cluttered with crates and barrels |
| `TileSideYard1` | Yard 1 | 7×3.5 | outside small | Library | N:A0-7 E:A0-3.28 S:P5.25 W:A0-3.28 | Garden yard with wooden deck, bench, plant, and stone patio |
| `TileSideYard2` | Yard 2 | 7×3.5 | outside small | Beach | N:A0-7 E:A0-3.28 S:P1.75 W:A0-3.28 | Grassy yard with stone path, well, and wooden bridge |

### Beyond the Threshold (MAD23) (`BtT`)

| ID | EN | Tamaño | Rasgos | Reverso | Aberturas | Descripción |
|---|---|---|---|---|---|---|
| `TileSideAtticStorage` | Attic Storage | 7×3.5 | inside small | LibraryMAD23 | S:P5.25 | Cluttered attic storage room with crates and old equipment |
| `TileSideBalcony` | Balcony | 7×3.5 | outside small | BasementStorage | N:P5.25 E:A0.22-3.5 S:A0-7 W:A0.22-3.5 | Outdoor balcony with ornate circular tile pattern and railing |
| `TileSideBasementStorage` | Basement Storage | 7×3.5 | inside small | Balcony | N:P1.75 S:P1.75 | Dark basement filled with crates, barrels, and old junk |
| `TileSideBedroom` | Bedroom | 7×3.5 | inside small bedroom storage | Kitchen | S:P5.25 | Small bedroom with bed, round rug, and frosted window |
| `TileSideDiningRoomMAD23` | Dining Room | 7×3.5 | inside small | HallCorner | N:P5.25 S:P1.76 W:P1.75 | Formal dining room with large round table and herringbone floor |
| `TileSideEntryHallMAD23` | Entry Hall | 7×3.5 | inside small hallway | Porch | N:P1.75,A3.72-6.79 E:P1.76 S:P3.50 W:P1.76 | Entry hall with checkered floor, overturned furniture, and staircase |
| `TileSideHallCorner` | Hall Corner | 7×3.5 | inside small hallway | DiningRoomMAD23 | N:A0.22-3.29 E:P1.76 S:P1.75 | L-shaped hallway corner with wooden floor and round rug |
| `TileSideHallStairsMAD23` | Hall Stairs | 7×3.5 | inside small hallway stairs | Yard1MAD23 | N:P1.75 E:P1.76 S:A0.22-3.29 | Hallway with dark descending staircase and tiled landing |
| `TileSideKitchen` | Kitchen | 7×3.5 | inside small kitchen storage | Bedroom | S:P5.25 | Kitchen with checkered floor, stove, and adjacent pantry storage |
| `TileSideLibraryMAD23` | Library | 7×3.5 | inside small | AtticStorage | S:P5.25 W:P1.76 | Cozy library with wall-to-wall bookshelves and reading globe |
| `TileSidePorch` | Porch | 7×3.5 | inside outside small | EntryHallMAD23 | N:P1.75,A3.72-7 E:A0-3.5 S:A1.49-7 | Covered porch with wooden walls opening onto yard and garden |
| `TileSideYard1MAD23` | Yard 1 | 7×3.5 | outside small | HallStairsMAD23 | N:A0-3.29,P5.25 E:A0.22-3.5 S:A0-7 W:A0-3.5 | Side yard with stone well, garden path, and wooden shed |

### Call of the Wild: losetas (`CotWT`)

| ID | EN | Tamaño | Rasgos | Reverso | Aberturas | Descripción |
|---|---|---|---|---|---|---|
| `TileSideAbandonedShack` | Abandoned Shack | 7×7 | inside outside medium | HillTop |  |  |
| `TileSideBarn` | Barn | 10.5×7 | inside outside big | CoveredBridge |  |  |
| `TileSideCampsite` | Campsite (también en PotS) | 7×3.5 | outside small | Scarecrow | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Rocky campsite with boulders, mushrooms, and scattered supplies |
| `TileSideCaveBend` | Cave Bend | 7×3.5 | inside small cave | OldOak |  |  |
| `TileSideCaveEntrance` | Cave Entrance | 7×3.5 | outside small | PigPen |  |  |
| `TileSideCoveredBridge` | Covered Bridge | 10.5×7 | inside outside big river | Barn |  |  |
| `TileSideHillTop` | Hilltop | 7×7 | outside medium | AbandonedShack |  |  |
| `TileSideMarshland` | Marshland | 7×7 | outside medium river water | RitualSite |  |  |
| `TileSideOldForest` | Old Forest | 10.5×7 | outside big | Waterwheel |  |  |
| `TileSideOldOak` | Old Oak | 7×3.5 | outside small | CaveBend |  |  |
| `TileSideOldWell` | Old Well | 7×3.5 | outside small | RiverBend |  |  |
| `TileSideOuthouse` | Outhouse | 7×3.5 | inside outside small | RiverRapids |  |  |
| `TileSidePigPen` | Pigpen | 7×3.5 | outside small | CaveEntrance |  |  |
| `TileSidePond` | Pond | 7×7 | outside medium river water | TortureChamber |  |  |
| `TileSideRitualSite` | Ritual Site | 7×7 | outside medium | Marshland |  |  |
| `TileSideRiverBend` | River Bend 1 | 7×3.5 | outside small river | OldWell |  |  |
| `TileSideRiverRapids` | River Rapids 1 | 7×3.5 | outside small river | Outhouse |  |  |
| `TileSideRottedPorch` | Rotted Porch | 7×3.5 | inside outside small | SpruceGrove |  |  |
| `TileSideScarecrow` | Scarecrow | 7×3.5 | outside small | Campsite |  |  |
| `TileSideSpruceGrove` | Spruce Grove | 7×3.5 | outside small | RottedPorch |  |  |
| `TileSideTortureChamber` | Torture Chamber | 7×7 | inside medium cave | Pond |  |  |
| `TileSideWaterwheel` | Waterwheel | 10.5×7 | inside outside big river | OldForest |  |  |

### Forbidden Alchemy: losetas (`FAT`)

| ID | EN | Tamaño | Rasgos | Reverso | Aberturas | Descripción |
|---|---|---|---|---|---|---|
| `TileSideCave3` | Cave 3 | 7×3.5 | inside small cave | OfficeFA |  |  |
| `TileSideGeneratorRoom` | Generator Room | 7×7 | inside medium | OperatingTheater |  |  |
| `TileSideGraveyard2` | Graveyard 2 | 7×3.5 | outside small | Hallway5 |  |  |
| `TileSideGreenhouse` | Greenhouse | 7×7 | inside outside medium | HiddenLaboratory |  |  |
| `TileSideHallway5` | Hallway 5 | 7×3.5 | inside small hallway | Graveyard2 |  |  |
| `TileSideHiddenLaboratory` | Hidden Laboratory | 7×7 | inside medium | Greenhouse |  |  |
| `TileSideMedicalStorage` | Medical Storage | 7×3.5 | inside small storage | ObservationRoom |  |  |
| `TileSideMorgue` | Morgue | 7×7 | inside medium | Rooftop |  |  |
| `TileSideObservationRoom` | Observation Room | 7×3.5 | inside small | MedicalStorage |  |  |
| `TileSideOfficeFA` | Office | 7×3.5 | inside small | Cave3 |  |  |
| `TileSideOperatingTheater` | Operating Theater | 7×7 | inside medium | GeneratorRoom |  |  |
| `TileSideRooftop` | Rooftop | 7×7 | outside medium | Morgue |  |  |

### 1ª ed. base: losetas (`MoM1ET`)

| ID | EN | Tamaño | Rasgos | Reverso | Aberturas | Descripción |
|---|---|---|---|---|---|---|
| `TileSideAtticLoft` | Attic Loft | 7×7 | inside medium stairs | Chapel |  |  |
| `TileSideBasementLanding` | Basement Landing | 7×7 | inside medium storage basement stairs | TowerRoom |  |  |
| `TileSideCave1` | Cave 1 | 7×3.5 | inside small cave | Hallway4 |  |  |
| `TileSideCave2` | Cave 2 | 7×3.5 | inside small cave | Hallway3 |  |  |
| `TileSideCeremonyRoom` | Ceremony Room | 7×3.5 | inside small | Nursery |  |  |
| `TileSideChapel` | Chapel | 7×7 | inside medium | AtticLoft |  |  |
| `TileSideChasm` | Chasm | 7×3.5 | inside small cave | Hallway2 |  |  |
| `TileSideCornerHallway` | Corner Hallway 1 | 7×7 | inside medium hallway bathroom | RootCellar1E |  |  |
| `TileSideCrypt` | Crypt | 7×3.5 | inside small cave | Hallway1 |  |  |
| `TileSideDiningRoom1E` | Dining Room | 7×7 | inside medium storage kitchen | Graveyard |  |  |
| `TileSideFoyer` | Foyer | 10.5×7 | inside big stairs | FrontYard |  |  |
| `TileSideFrontPorch` | Front Porch | 7×7 | inside outside medium | Laboratory |  |  |
| `TileSideFrontYard` | Front Yard | 10.5×7 | inside outside big | Foyer |  |  |
| `TileSideFurnaceRoom` | Furnace Room | 7×3.5 | inside small | MasterBedroom |  |  |
| `TileSideGallery` | Gallery | 7×7 | inside medium | StorageShed |  |  |
| `TileSideGarden` | Garden | 7×7 | inside outside medium | Library1E |  |  |
| `TileSideGraveyard` | Graveyard | 7×7 | outside medium | DiningRoom1E |  |  |
| `TileSideGuestBedroom` | Guest Bedroom | 7×3.5 | inside small bedroom storage | SecretPassage |  |  |
| `TileSideHallway1` | Hallway 1 | 7×3.5 | inside small hallway | Crypt |  |  |
| `TileSideHallway2` | Hallway 2 | 7×3.5 | inside small hallway | Chasm |  |  |
| `TileSideHallway3` | Hallway 3 | 7×3.5 | inside small hallway | Cave2 |  |  |
| `TileSideHallway4` | Hallway 4 | 7×3.5 | inside small hallway | Cave1 |  |  |
| `TileSideLaboratory` | Laboratory | 7×7 | inside medium | FrontPorch |  |  |
| `TileSideLibrary1E` | Library | 7×7 | inside medium | Garden |  |  |
| `TileSideMasterBedroom` | Master Bedroom | 7×3.5 | inside small bedroom | FurnaceRoom |  |  |
| `TileSideNursery` | Nursery | 7×3.5 | inside small bathroom | CeremonyRoom |  |  |
| `TileSideRootCellar1E` | Root Cellar | 7×7 | inside outside medium | CornerHallway |  |  |
| `TileSideSecretPassage` | Secret Passage | 7×3.5 | inside small | GuestBedroom |  |  |
| `TileSideStorageShed` | Storage Shed | 7×7 | inside outside medium storage | Gallery |  |  |
| `TileSideTowerRoom` | Tower Room | 7×7 | inside medium stairs storage | BasementLanding |  |  |

### Horrific Journeys (MAD27) (`HJ`)

| ID | EN | Tamaño | Rasgos | Reverso | Aberturas | Descripción |
|---|---|---|---|---|---|---|
| `TileSideBaggageCar` | Baggage Car | 7×3.5 | inside train ship storage small | LifeBoat | N:P5.26 E:P1.75 W:P1.75 | Train baggage car packed with crates and luggage |
| `TileSideBridge` | Bridge | 7×3.5 | inside ship small | SleeperCar | N:A3.88-6.69 E:A0.41-3.09 S:A3.88-6.69 W:P1.75 | Ship bridge with helm station and skylights on starboard side |
| `TileSideCabin1` | Cabin 1 | 7×3.5 | inside train ship small | LoungeCar | S:P1.75,P5.25 | Two small passenger cabins with herringbone parquet flooring |
| `TileSideCabin3` | Cabin 3 | 7×3.5 | inside train ship small | PassengerCar2 | S:P1.75,P5.25 | Two cabins with ornate rug and washtub on wooden floor |
| `TileSideCarboose` | Caboose | 7×3.5 | inside outside train storage small | ShipDeck4 | N:A0-2.57 E:P1.78 S:A0-2.68 W:A0-3.5 | Train caboose with corrugated exterior section and stored equipment |
| `TileSideChartRoom` | Chart Room | 7×3.5 | inside train ship small | DiningCar1 | N:P5.26 S:P5.26 | Navigation chart room with large map table and bookshelf |
| `TileSideCrewBedroom` | Crew Bedroom | 7×3.5 | inside train ship small | Tracks | E:P1.75 | Crew sleeping quarters with three hammock bunks and pipes |
| `TileSideDiningCar1` | Dining Car 1 | 7×3.5 | inside train ship small | ChartRoom | N:A0.9-6.06 E:A0.21-3.29 S:A0.9-6.06 W:P1.75 | Elegant dining car with six white-clothed tables and red seats |
| `TileSideDiningCar2` | Dining Car 2 | 7×3.5 | inside train ship kitchen small | ShipDeck6 | N:P1.75 E:P1.75 W:A0-3.5 | Dining car kitchen with checkered tile floor and cooking station |
| `TileSideDiningRoomMAD27` | Dining Room | 7×7 | inside ship medium | Pool | N:P1.75 E:P1.75 S:P1.75 | Grand ship dining room with four round tables on herringbone floor |
| `TileSideEngine` | Engine | 7×3.5 | inside outside train small | ShipDeck3 | N:A1.76-7 E:A0-3.5 S:A1.82-7 W:P1.75 | Train engine with large boiler and open cab with controls |
| `TileSideEngineRoom` | Engine Room | 7×7 | inside ship medium | Station | N:P1.75 E:P5.25 | Dark ship engine room with heavy machinery and metal catwalks |
| `TileSideFreightCar1` | Freight Car 1 | 7×3.5 | inside train ship storage small | ShipDeck5 | N:A1.57-4.03 E:P1.74 S:A1.57-4.03 W:P1.75 | Dark wooden freight car interior with crates and machinery |
| `TileSideFreightCar2` | Freight Car 2 | 7×3.5 | outside train storage small | StorageHold | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Open-top freight car loaded with crates and cargo containers |
| `TileSideLifeBoat` | Life Boat | 7×3.5 | small ship outside | BaggageCar | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Wooden lifeboat with ropes and nautical equipment on water |
| `TileSideLoungeCar` | Lounge Car | 7×3.5 | inside train ship small | Cabin1 | E:P1.75 W:P1.75 | Ornate lounge car with cushioned seating and decorative carpet |
| `TileSideMedicalOffice` | Medical Office | 7×3.5 | inside storage small | ObservationCar | N:P1.75 W:P1.75 | Medical office with tiled floor, exam table, and cabinets |
| `TileSideObservationCar` | Observation Car | 7×3.5 | outside train small | MedicalOffice | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Open observation car with wooden bench and railing at rear of train |
| `TileSidePassengerCar1` | Passenger Car 1 | 7×3.5 | inside train ship small | Spa | N:A4.18-6.23 E:A0.4-3.09 S:A0.71-2.76 W:P1.75 | Luxurious dining car with long table and red oriental rug |
| `TileSidePassengerCar2` | Passenger Car 2 | 7×3.5 | inside train ship small | Cabin3 | N:P1.84 E:P1.76 W:P1.75 | Passenger sleeper car with bunk compartments and red carpet aisle |
| `TileSidePool` | Pool | 7×7 | inside bathroom medium | DiningRoomMAD27 | N:P5.25 E:P1.75 W:P5.25 | Indoor swimming pool room with tiled walls and ladder |
| `TileSideProw` | Prow | 7×7 | outside ship medium | ViewingRoom2 | N:A0-7 E:A0-7 S:A0-7 W:A0-7 | Ship prow deck with raised platform and railing over water |
| `TileSideShipDeck1` | Ship Deck 1 | 7×3.5 | outside ship small | ViewingRoom1 | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Ship deck with tarp-covered cargo and curved railing over sea |
| `TileSideShipDeck2` | Ship Deck 2 | 7×3.5 | outside ship small | ViewingRoom3 | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Open ship deck with curved railing and scattered crates |
| `TileSideShipDeck3` | Ship Deck 3 | 7×3.5 | outside ship small | Engine | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Open wooden ship deck with shuffleboard courts and railing |
| `TileSideShipDeck4` | Ship Deck 4 | 7×3.5 | outside ship small | Carboose | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Wooden ship deck with central buffet table and seating |
| `TileSideShipDeck5` | Ship Deck 5 | 7×3.5 | outside ship small | FreightCar1 | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Ship deck with lounge chairs and scattered reading materials |
| `TileSideShipDeck6` | Ship Deck 6 | 7×3.5 | outside ship small | DiningCar2 | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Ship deck with small dining tables, chairs, and potted plants |
| `TileSideSleeperCar` | Sleeper Car | 7×3.5 | inside train ship small | Bridge | E:P1.75 W:P1.75 | Train sleeper car with two private cabins and ornate carpet |
| `TileSideSpa` | Spa | 7×3.5 | inside bathroom small | PassengerCar1 | W:P1.75 | Tiled spa room with soaking pool and bath supplies |
| `TileSideStation` | Station | 7×7 | inside outside train ship dock medium | EngineRoom | N:P1.75 E:A3.77-7 S:A0-7 W:A3.72-7 | Train station interior with ticket counter, benches, and cargo area |
| `TileSideStorageHold` | Storage Hold | 7×3.5 | inside storage train ship small | FreightCar2 | N:P1.75 E:P1.75 | Cluttered ship storage hold packed with crates and luggage |
| `TileSideTracks` | Tracks | 7×3.5 | outside train small | CrewBedroom | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Outdoor railroad tracks on gravel bed between platforms |
| `TileSideViewingRoom1` | Viewing Room 1 | 7×3.5 | inside ship small | ShipDeck1 | N:A0.22-1.83,A2.43-4.06,A4.72-6.32 E:A1.05-2.67 S:A0-6.82 W:A0.21-3.5 | Ship viewing room with cushioned seats and windows along walls |
| `TileSideViewingRoom2` | Viewing Room 2 | 7×7 | inside ship medium | Prow | N:A0.22-1.8,A2.73-4.32,A5.2-6.77 E:A0.21-7 S:A0-7 W:A0.21-7 | Large ornate viewing room with velvet chairs and globe decorations |
| `TileSideViewingRoom3` | Viewing Room 3 | 7×3.5 | inside ship small | ShipDeck2 | N:A0.71-2.3,A2.95-4.55,A5.15-6.77 E:A0.22-3.5 S:A0.21-7 W:A1.05-2.67 | Sunlit ship viewing room with wooden crates and bench seating |

### Path of the Serpent (MAD28) (`PotS`)

| ID | EN | Tamaño | Rasgos | Reverso | Aberturas | Descripción |
|---|---|---|---|---|---|---|
| `TileSideStatueChamber` | Statue Chamber | 7×7 | inside medium temple | RuinedHut | N:P1.75 E:P5.25 S:P1.75 | Stone chamber with large serpent statues and carved floor |
| `TileSideBurialChamber` | Burial Chamber | 7×3.5 | inside small temple | OvergrownPath | N:P5.25 S:P5.25 | Rectangular tomb room with cracked floor and burial urns |
| `TileSideBedChamber` | Bed Chamber | 7×3.5 | inside temple small | JungleRuins1 | N:P1.75 W:P1.75 | Temple sleeping quarters with ornate archway and stone bed |
| `TileSideVerdantChamber` | Verdant Chamber | 7×3.5 | inside small temple | Clearing1 | E:P1.75 S:P1.75 | Overgrown chamber with lush vegetation and mossy stone floor |
| `TileSidePit` | Pit | 7×7 | inside medium temple | Clearing2 | N:P1.75 S:P1.75 W:P1.75 | Half-collapsed chamber with deep rocky pit and carved walls |
| `TileSideTunnel` | Tunnel | 7×3.5 | inside small cave | Ravine | E:P1.75 W:P1.75 | Narrow rocky cave tunnel with rough uneven stone walls |
| `TileSideRopeBridge` | Rope Bridge | 7×7 | outside medium | MosaicChamber | N:A0-3.6,A4.07-7 E:A0-7 S:A0-7 W:A0-7 | Wooden rope bridge spanning a rocky gorge between cliff edges |
| `TileSideHollowGrove` | Hollow Grove | 7×3.5 | outside small | SunlitChamber | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Forest clearing with three large hollow tree trunk pools |
| `TileSideCrumblingPlaza` | Crumbling Plaza | 7×7 | outside medium | PoolChamber | N:A0-4.48,P5.12,P6.38 E:A0-7 S:A0-7 W:A0-7 | Overgrown circular stone plaza with crumbling mosaic pattern |
| `TileSideShrine` | Shrine | 7×3.5 | outside small | HallChamber1 | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Jungle clearing with ancient carved stone shrine disc |
| `TileSideJungleRuins1` | Jungle Ruins 1 | 7×3.5 | outside small | BedChamber | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Jungle path winding through crumbled stone building ruins |
| `TileSideJungleRuins2` | Jungle Ruins 2 | 7×3.5 | outside small | StorageChamber | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Dense jungle with scattered broken stone walls and carvings |
| `TileSideRiver1` | River 1 | 7×3.5 | outside small river | AltarChamber | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | River flowing east-west through grassy banks with rocks |
| `TileSideRiver2` | River 2 | 7×3.5 | outside small river | Antechamber | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Wide river curving through mossy banks with muddy shore |
| `TileSideRiverCrossing` | River Crossing | 7×3.5 | outside small river | RuinedChamber | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Shallow river crossing with rocky stepping stones in center |
| `TileSideRiverEdge` | River Edge | 7×7 | outside medium river | ThroneChamber | N:A0-7 E:A0-7 S:A0-7 W:A0-7 | River corner with wooden bridge crossing to forested clearing |
| `TileSideClearing1` | Clearing 1 | 7×3.5 | outside small | VerdantChamber | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Forest clearing with winding path and fallen autumn leaves |
| `TileSideClearing2` | Abandoned Hut | 7×7 | outside medium | Pit | N:A0-7 E:A0-7 S:A0-7 W:A0-7 | Circular stone ruins in an overgrown forest clearing with debris |
| `TileSideTempleStairs` | Temple Stairs | 7×7 | outside medium | CrackedChamber | N:A0-7 E:A0-7 S:A0-7 W:A0-4.87,P5.72,P6.78 | Broad stone staircase leading up to walled temple entrance |
| `TileSideThroneChamber` | Throne Chamber | 7×7 | inside medium temple | RiverEdge | N:P1.75 E:P1.75 W:P1.75 | Grand throne chamber with ornate floor patterns and two south doors |
| `TileSideOvergrownPath` | Overgrown Path | 7×3.5 | outside small | BurialChamber | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Dirt path winding through dense overgrown autumn foliage |
| `TileSideAltarChamber` | Altar Chamber | 7×3.5 | inside small | River1 | S:P1.75 | Stone altar chamber with carved relief, rubble, and west door |
| `TileSideSunlitChamber` | Sunlit Chamber | 7×3.5 | inside small temple | HollowGrove | E:P1.75 S:P1.75 | Stone chamber with glowing orbs and arcane floor circles |
| `TileSideRuinedHut` | Ruined Hut | 7×7 | outside medium | StatueChamber | N:A3.53-7 E:A0-7 S:P1.75,A3.51-7 W:A0.92-2.58 | Overgrown ruined hut with muddy ground and vegetation |
| `TileSideHallChamber1` | Hall Chamber 1 | 7×3.5 | inside small temple | Shrine | N:P1.75 E:P0.47,P1.80,P2.96 S:P5.25 W:P1.75 | Temple hall with scattered rubble and green idol statue |
| `TileSideHallChamber2` | Hall Chamber 2 | 7×3.5 | inside small temple | Campsite | N:A0-3.27 E:P1.83 S:A0-3.28 W:A0-3.5 | Cracked stone chamber with bookshelf alcove on east side |
| `TileSideStorageChamber` | Storage Chamber | 7×3.5 | inside small temple | JungleRuins2 | N:P5.25 E:P1.75 | Temple storage room with shelves, crates, and cracked floor |
| `TileSidePoolChamber` | Pool Chamber | 7×7 | inside medium cave water | CrumblingPlaza | N:P5.25 E:P1.75 S:P5.25 | Flooded cave chamber with large turquoise pool and island |
| `TileSideMosaicChamber` | Mosaic Chamber | 7×7 | inside medium temple | RopeBridge | N:P1.75 E:P5.25 W:P5.25 | Ornate chamber with vivid stained-glass mosaic floor pattern |
| `TileSideRavine` | Ravine | 7×3.5 | outside small | Tunnel | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Outdoor rocky ravine with fallen branches and mossy ground |
| `TileSideAntechamber` | Antechamber | 7×3.5 | inside small temple | River2 | S:P5.25 W:P1.75 | Stone antechamber with cracked floor and scattered red debris |
| `TileSideCrackedChamber` | Cracked Chamber | 7×7 | inside medium temple | TempleStairs | N:P1.75 E:P1.75 S:P1.75 | Large crumbling temple chamber with deep central crack and rubble |
| `TileSideRuinedChamber` | Ruined Chamber | 7×3.5 | inside small temple | RiverCrossing | W:P1.75 | Collapsed temple room half-filled with boulder rubble |

### Streets of Arkham (MAD25) (`SoA`)

| ID | EN | Tamaño | Rasgos | Reverso | Aberturas | Descripción |
|---|---|---|---|---|---|---|
| `TileSideDiner` | Diner | 10.5×7 | inside big | ExhibitEntrance | N:P8.75 E:P5.25 S:P8.75 W:P1.75,P5.25 | Checkered-floor diner with counter, kitchen area, and booth seating |
| `TileSideExhibitEntrance` | Exhibit Entrance | 10.5×7 | inside big | Diner | N:A0.21-10.29 E:P1.75,P5.25 S:P5.24 W:P1.75,P5.25 | Green-tiled museum entrance hall with large whale skeleton mural |
| `TileSideYard1MAD25` | Yard 1 | 7×7 | outside medium | MainExhibit | N:A0-7 E:A0-7 S:A0-7 W:A0-7 | Grassy yard with stone paths, benches, and scattered hedges |
| `TileSideMainExhibit` | Main Exhibit | 7×7 | inside medium | Yard1MAD25 | E:P1.75 S:A0.21-6.78 W:P1.75 | Museum exhibit room with central dinosaur skeleton display case |
| `TileSideLab` | Lab | 7×7 | inside medium | Bandstand | N:P1.75 S:P1.75 W:P1.75,P5.25 | Dark tiled laboratory with shelves, equipment, and overhead lighting |
| `TileSideBandstand` | Bandstand | 7×7 | outside medium | Lab | N:A0-7 E:A0-7 S:A0-7 W:A0-7 | Outdoor octagonal wooden bandstand surrounded by grass and bushes |
| `TileSideLobbyMAD25` | Lobby | 7×7 | inside medium | Exhibit3 | N:P1.75,P5.25 E:P1.75,P5.25 S:P3.50 W:P1.75,P5.25 | Herringbone-floored lobby with fireplace, paintings, and ornate rug |
| `TileSideExhibit3` | Exhibit 3 | 7×7 | inside medium | LobbyMAD25 | E:P1.75,P5.25 S:P1.75 W:P1.75 | Cluttered museum storage room with diamond-pattern floor and artifacts |
| `TileSideClassroom1` | Classroom 1 | 7×7 | inside medium | LibraryMAD25 | N:P1.75 E:P5.25 | Wooden lecture hall with tiered bench seating and podium |
| `TileSideLibraryMAD25` | Library | 7×7 | inside medium | Classroom1 | N:P5.25 E:P5.25 S:P1.75 W:P5.25 | Warm library with central reading area, bookshelves, and herringbone floor |
| `TileSideGeneralShop` | General Shop | 7×7 | inside medium | Studio | N:P1.75 E:P1.75 S:P1.75 W:P1.75 | Cluttered general store with shelves, merchandise, and dark wood floors |
| `TileSideStudio` | Studio | 7×7 | inside medium | GeneralShop | N:P1.75,P5.25 W:P5.25 | Dark artist studio with ghostly canvas, paint supplies, and columns |
| `TileSideSewer1` | Sewer 1 | 7×3.5 | small inside | LibraryArchives | N:P1.75 E:A0.22-3.5 S:A3.73-7 W:P1.75 | Dark stone sewer corridor with debris and mechanical equipment |
| `TileSideLibraryArchives` | Library Archives | 7×3.5 | inside small | Sewer1 | S:P1.75,P5.25 W:P1.75 | Wooden archive room with bookshelves, scattered papers and red chairs |
| `TileSidePrintingPress` | Printing Press | 7×3.5 | inside small | Exhibit2 | E:P1.75 S:P1.75 W:P1.75 | Industrial printing press room with two large presses and columns |
| `TileSideExhibit2` | Exhibit 2 | 7×3.5 | inside small | PrintingPress | S:A0-3.28,P5.25 W:A0.22-3.5 | Green checkered museum exhibit hall with display case in center |
| `TileSideStreetCorner` | Street Corner | 7×3.5 | outside small | ResearchLibrary | N:A0.21-3.29,P5.25 E:A0.22-3.5 S:A0.21-7 W:P1.73 | Cobblestone street corner with brick wall and lamppost |
| `TileSideResearchLibrary` | Research Library | 7×3.5 | inside small | StreetCorner | N:P1.75,P5.25 S:P5.25 | Parquet-floored library with tall bookshelves and large globe |
| `TileSideSewer2` | Sewer 2 | 7×3.5 | small inside | ChapelMAD25 | N:P5.24 E:A0.22-3.28 W:A0.22-3.28 | Stone sewer tunnel with scattered crates and dark water pools |
| `TileSideChapelMAD25` | Chapel | 7×3.5 | inside small | Sewer2 | N:P5.25 E:P1.75 S:P1.75 | Chapel interior with pews, stained glass light and checkered floor |
| `TileSideSpeakeasy` | Speakeasy | 7×3.5 | inside small | PortraitHall | N:P1.75 S:P1.75 W:P1.75 | Dimly lit speakeasy bar with wooden floors and circular stage |
| `TileSidePortraitHall` | Portrait Hall | 7×3.5 | inside small | Speakeasy | E:A0.22-3.5 S:P1.75,A3.73-7 W:P1.75 | Green tiled hallway with portraits, luggage and display case |
| `TileSideMagicShop` | Magic Shop | 7×3.5 | inside small | OfficeMAD25 | N:P1.75,P5.25 W:P1.75 | Cluttered magic shop with shelves, rug and fortune-telling chair |
| `TileSideOfficeMAD25` | Office | 7×3.5 | inside small | MagicShop | N:P1.75 W:P1.75 | Dark wood office with large oval rug and desk |
| `TileSideYard2MAD25` | Yard 2 | 7×3.5 | outside small | BedroomMAD25 | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Overgrown yard with debris, trees, and winding path |
| `TileSideBedroomMAD25` | Bedroom | 7×3.5 | inside small | Yard2MAD25 | S:P1.75 | Bedroom with round rug, bathtub, and luggage |
| `TileSideAlley` | Alley | 7×3.5 | outside small | Exhibit1 | N:A0.21-3.29 E:P1.75 S:P1.75,A3.72-6.78 | Dark cobblestone alley cluttered with crates and debris |
| `TileSideExhibit1` | Exhibit 1 | 7×3.5 | inside small | Alley | N:P1.75,A3.72-6.79 E:P1.75 S:P1.75,A3.72-6.79 | Museum exhibit hall with checkered floor and dinosaur display |
| `TileSideCuriosityShop` | Curiosity Shop | 7×3.5 | inside small | HallStairsMAD25 | N:P5.25 E:P1.75 W:P1.75 | Cluttered curiosity shop with round table and red wood walls |
| `TileSideHallStairsMAD25` | Hall Stairs | 7×3.5 | inside small | CuriosityShop | N:A0.21-3.27 E:P1.75 | Grand hallway with checkered floor and staircases on both sides |
| `TileSideWarehouseMAD25` | Warehouse | 7×3.5 | inside small | Classroom2 | S:P1.75 W:P1.75 | Dark warehouse packed with crates, barrels, and scattered goods |
| `TileSideClassroom2` | Classroom 2 | 7×3.5 | inside small | WarehouseMAD25 | E:P1.75 S:P1.75 | Classroom with large blackboard, wooden floor, and scattered papers |
| `TileSideClassroom3` | Classroom 3 | 7×3.5 | inside small | LoungeMAD25 | N:P1.75 W:P1.75 | Classroom with long floral-covered table and framed paintings |
| `TileSideLoungeMAD25` | Lounge | 7×3.5 | inside small | Classroom3 | N:P5.25 S:P1.75,P5.25 | Lounge with herringbone floor, paintings, and ornate furniture |

### Sanctum of Twilight (MAD26) (`SoT`)

| ID | EN | Tamaño | Rasgos | Reverso | Aberturas | Descripción |
|---|---|---|---|---|---|---|
| `TileSideCafe` | Cafe | 7×7 | inside outside medium | DungeonHall | N:A0-3.29 S:A0-3.29 W:A0-7 | Cafe with cobblestone patio and wood-floored dining area |
| `TileSideDungeonHall` | Dungeon Hall | 7×7 | inside medium | Cafe | N:P1.75 S:P1.75 | Dark dungeon rooms connected by a checkered hallway |
| `TileSideCeremonyRoomMAD26` | Ceremony Room | 7×3.5 | inside small | Pharmacy | E:P1.75 | Ceremonial room with ornate altar and tiled floor |
| `TileSideInnerSanctum` | Inner Sanctum | 7×3.5 | inside small | ParadeFloat2 | N:P5.24 S:P5.24 W:P1.76 | Red-carpeted sanctum with cushioned seating and wooden alcove |
| `TileSideLoungeMAD26` | Lounge | 7×3.5 | inside small | ParadeFloat1 | E:P1.75 S:P1.75 | Herringbone-floored lounge with fireplace and armchair |
| `TileSideParadeFloat1` | Parade Float 1 | 7×3.5 | outside small | LoungeMAD26 | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Parade float with large flower decoration on cobblestone street |
| `TileSideParadeFloat2` | Parade Float 2 | 7×3.5 | outside small | InnerSanctum | N:A0-7 E:A0-3.5 S:A0-7 W:A0-3.5 | Parade float with sunburst banner and central emblem |
| `TileSidePharmacy` | Pharmacy | 7×3.5 | inside small | CeremonyRoomMAD26 | S:P5.24 W:P1.76 | Blue-tiled pharmacy with counter and shelves of medicine |
| `TileSideStorageRoom` | Storage Room | 7×3.5 | inside small | Vault | S:P5.24 | Wooden storage room with racks of equipment and supplies |
| `TileSideVault` | Vault | 7×3.5 | inside small | StorageRoom | S:A0.21-3.28 | Split vault with wooden office area and dark stone strongroom |

### Lost Expeditions (community pack) (`TLE`)

| ID | EN | Tamaño | Rasgos | Reverso | Aberturas | Descripción |
|---|---|---|---|---|---|---|
| `TileSideTLEBedouin` | Campamentomiskatonic | 7×7 | outside medium |  |  |  |
| `TileSideTLEDigSite` | Excavacionprincipal | 7×7 | outside medium |  |  |  |
| `TileSideTLEBurialChamber` | Camarafuneraria | 7×7 | inside medium |  |  |  |
| `TileSideTLESacredChamber` | Grangaleria | 7×7 | inside medium |  |  |  |
| `TileSideTabletChamber` | Salatablilla | 7×7 | inside medium |  |  |  |
| `TileSideTLEOpenDesert` | Desiertoarido | 7×7 | outside medium |  |  |  |
| `TileSideTombStorage` | Puntoreabastecimiento | 7×3.5 | inside small |  |  |  |
| `TileSideOvergrownChamber` | Salaenredaderas | 7×3.5 | inside small |  |  |  |
| `TileSideExpositionHall` | Salahallazgos | 7×3.5 | inside small |  |  |  |
| `TileSideDustyPassage` | Corredor | 7×3.5 | inside small |  |  |  |
| `TileSideTreasureRoom` | Salatesoro | 7×3.5 | inside small |  |  |  |
| `TileSideColumnsHall` | Salacolumnas | 7×3.5 | inside small |  |  |  |
| `TileSideFountainChamber` | Salafuente | 7×3.5 | inside small |  |  |  |
| `TileSideHiddenGarden` | Jardinoculto | 7×3.5 | inside small |  |  |  |
| `TileSideAbandonedSite` | Salaabandonada | 7×3.5 | inside small |  |  |  |
| `TileSideDesecratedTomb` | Tumbaprofanada | 7×3.5 | inside small |  |  |  |
| `TileSideBlackObelisk` | Obelisconegro | 7×3.5 | outside small |  |  |  |
| `TileSideBaseCamp` | Campamentobase | 7×7 | outside medium |  |  |  |
| `TileSideBlackPyramid` | Piramidenegra | 7×7 | outside medium |  |  |  |
| `TileSideTundra` | Tundraheladora | 7×7 | outside medium |  |  |  |
| `TileSideCore` | Nucleoprincipal | 7×7 | inside medium |  |  |  |
| `TileSideTurbineChamber` | Salaturbinas | 7×3.5 | inside small |  |  |  |
| `TileSideFrozenHill` | Colinascongeladas | 7×3.5 | outside small |  |  |  |
| `TileSideHydroponicGarden` | Jardinhidroponico | 7×3.5 | inside small |  |  |  |
| `TileSideBlockedPassage` | Pasajebloqueado | 7×3.5 | inside small |  |  |  |
| `TileSideTLERuinedChamber` | Saladerruida | 7×3.5 | inside small |  |  |  |
| `TileSideLostRuins` | Ruinasperdidas | 7×7 | inside medium |  |  |  |
| `TileSideFrozenAltar` | Altarcongelado | 7×7 | inside medium |  |  |  |
| `TileSideConduct` | Conducto | 7×3.5 | inside small |  |  |  |
| `TileSideFrozenChamber` | Salacongelada | 7×3.5 | inside small |  |  |  |
| `TileSideFrozenBridge` | Puentehelado | 7×3.5 | inside small |  |  |  |
| `TileSideColdTunnel` | Tunelfrio | 7×3.5 | inside small |  |  |  |
| `TileSideRamp` | Rampaciclopea | 7×3.5 | inside small |  |  |  |
| `TileSideReactor` | Salareactores | 7×3.5 | inside small |  |  |  |

## Monstruos

Vida = `health` + `healthperhero` × investigadores. Per./Hor./Agr. = Percepción, Horror, Agresividad. Act/Ev/HC = nº de textos de activación, evasión y tirada de Horror que trae Valkyrie (0 = el monstruo no tiene textos genéricos: usa un CustomMonster con eventos propios).

| ID | EN | Español | Pack | Rasgos | Vida | Per. | Hor. | Agr. | Act | Ev | HC |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `MonsterCultist` | Cultist | Sectario | MoMBase | small humanoid | 1+1 | 3 | 1 | 2 | 25 | 12 | 13 |
| `MonsterDeepOne` | Deep One | Profundo | MoMBase | humanoid | 2+1 | 3 | 4 | 2 | 24 | 12 | 12 |
| `MonsterDeepOneHybrid` | Deep One Hybrid | Híbrido de profundo | MoMBase | humanoid | 2+1 | 3 | 1 | 2 | 24 | 12 | 12 |
| `MonsterGhost` | Ghost | Fantasma | MoMBase | spirit | 1+1 | 2 | 5 | 1 | 21 | 12 | 12 |
| `MonsterHuntingHorror` | Hunting Horror | Horrendo cazador | MoMBase | beast | 3+1 | 5 | 6 | 3 | 21 | 12 | 12 |
| `MonsterRiot` | Riot | Turba | MoMBase | humanoid | 5+3 | 7 | 4 | 4 | 22 | 12 | 12 |
| `MonsterStarSpawn` | Star Spawn | Semilla estelar | MoMBase | beast | 9+3 | 5 | 8 | 5 | 23 | 12 | 12 |
| `MonsterChildOfDagon` | Child Of Dagon | Hijo de Dagón | MoMBase | humanoid | 1+1 | 4 | 3 | 2 | 24 | 12 | 12 |
| `MonsterPriestOfDagon` | Priest Of Dagon | Sacerdote de Dagón | MoMBase | humanoid | 2+2 | 4 | 3 | 2 | 24 | 13 | 19 |
| `MonsterThrall` | Thrall | Subyugado | BtT | humanoid | 2+1 | 3 | 4 | 2 | 24 | 1 | 3 |
| `MonsterChildOfTheGoat` | Child Of The Goat | Hijo de la Cabra (?) | CotWM | humanoid | 1+1 | 3 | 1 | 2 | 24 | 12 | 12 |
| `MonsterDarkDruid` | Dark Druid | Druida oscuro (?) | CotWM | humanoid | 2+1 | 3 | 2 | 2 | 24 | 12 | 12 |
| `MonsterDarkYoung` | Dark Young | Retoño oscuro (?) | CotWM | beast | 4+2 | 4 | 7 | 5 | 24 | 12 | 12 |
| `MonsterGoatSpawn` | Goat Spawn | Engendro cabrío (?) | CotWM | humanoid | 1+2 | 4 | 3 | 2 | 24 | 12 | 12 |
| `MonsterNightgaunt` | Nightgaunt | Ángel descarnado (?) | CotWM | beast | 1+2 | 6 | 5 | 3 | 22 | 12 | 12 |
| `MonsterDunwichHorror` | Dunwich Horror | Horror de Dunwich (?) | CotWM | horror | 2+3 | 7 | 9 | 5 | 1 | 12 | 12 |
| `MonsterWizard` | Wizard | Brujo (?) | CotWM | humanoid | 2+1 | 4 | 3 | 2 | 24 | 12 | 12 |
| `MonsterByakhee` | Byakhee | Byakhee (?) | FAM | beast | 1+2 | 4 | 3 | 2 | 24 | 12 | 12 |
| `MonsterCrawlingOne` | Crawling One | Reptante (?) | FAM | beast | 3+1 | 2 | 4 | 4 | 24 | 12 | 12 |
| `MonsterZombie` | Zombie | Zombi (?) | MoM1EM | undead small humanoid | 2+1 | 2 | 4 | 2 | 24 | 12 | 12 |
| `MonsterCthonian` | Cthonian | Chthoniano (?) | MoM1EM | beast | 3+2 | 4 | 7 | 5 | 24 | 12 | 12 |
| `MonsterHoundOfTindalos` | Hound Of Tindalos | Perro de Tíndalos (?) | MoM1EM | beast | 1+2 | 6 | 5 | 5 | 20 | 12 | 10 |
| `MonsterManiac` | Maniac | Maníaco (?) | MoM1EM | humanoid | 2+1 | 5 | 1 | 2 | 24 | 12 | 12 |
| `MonsterMiGo` | Mi Go | Mi-Go (?) | MoM1EM | beast | 3+1 | 6 | 4 | 3 | 24 | 12 | 12 |
| `MonsterShoggoth` | Shoggoth | Shoggoth (?) | MoM1EM | beast | 4+2 | 4 | 6 | 4 | 24 | 12 | 12 |
| `MonsterWitch` | Witch | Bruja (?) | MoM1EM | humanoid | 2+1 | 3 | 2 | 2 | 23 | 12 | 12 |
| `MonsterCultLeader` | Cult Leader | Líder de la secta (?) | MoM1EM | humanoid | 8+4 | 4 | 3 | 2 | 24 | 12 | 12 |
| `MonsterWarlock` | Warlock | Hechicero (?) | HJ | humanoid | 1+1 | 4 | 3 | 2 | 24 | 12 | 12 |
| `MonsterDimensionalShambler` | Dimensional Shambler | Vagabundo dimensional (?) | HJ | beast | 6+2 | 4 | 5 | 2 | 24 | 12 | 12 |
| `MonsterHuntingDeepOne` | Hunting Deep One | Profundo cazador (?) | HJ | humanoid | 3+1 | 4 | 5 | 4 | 24 | 12 | 12 |
| `MonsterFormlessSpawn` | Formless Spawn | Engendro informe (?) | HJ | beast | 48+1 | 4 | 6 | 4 | 24 | 12 | 12 |
| `MonsterFeatheredSerpent` | Feathered Serpent | Serpiente emplumada (?) | PotS | beast | 2+1 | 3 | 2 | 2 | 24 | 12 | 12 |
| `MonsterTempleGuardian` | Temple Guardian | Guardián del templo (?) | PotS | beast | 3+2 | 4 | 5 | 5 | 24 | 12 | 12 |
| `MonsterSerpentPerson` | Serpent Person | Hombre serpiente (?) | PotS | snakeperson | 2+1 | 4 | 3 | 3 | 24 | 12 | 12 |
| `MonsterAncientBasilisk` | Ancient Basilisk | Basilisco ancestral (?) | PotS | beast | 20+1 | 6 | 5 | 5 | 24 | 12 | 12 |
| `MonsterSkeleton` | Skeleton | Esqueleto (?) | SoA | fleshless | 1+1 | 2 | 4 | 2 | 24 | 12 | 12 |
| `MonsterHiredGun` | Hired Gun | Pistolero a sueldo (?) | SoA | humanoid | 2+1 | 2 | 1 | 2 | 24 | 12 | 12 |
| `MonsterLloigor` | Lloigor | Lloigor (?) | SoA | beast | 1+2 | 7 | 9 | 5 | 24 | 12 | 12 |
| `MonsterStarVampire` | Star Vampire | Vampiro estelar (?) | SoA | beast | 9+3 | 4 | 6 | 3 | 24 | 12 | 12 |
| `MonsterWraith` | Wraith | Alma en pena | SoT | spirit | 2+2 | 2 | 6 | 1 | 24 | 12 | 12 |
| `MonsterIcePrisoner` | Ice Prisoner |  | TLE | humanoid | 2+1 | 2 | 3 | 2 | 24 | 12 | 12 |
| `MonsterHombreLobo` | Hombre Lobo |  | TLE | beast | 2+2 | 4 | 4 | 4 | 10 | 8 | 10 |
| `MonsterAncientThing` | Ancient Thing |  | TLE | beast | 1+3 | 2 | 5 | 4 | 12 | 6 | 6 |
| `MonsterElderThing` | Elder Thing |  | TLE | beast | 1+3 | 2 | 5 | 4 | 12 | 6 | 6 |
| `MonsterAvatarPharaoh` | Avatar Pharaoh |  | TLE | beast | 14+4 | 6 | 6 | 6 | 15 | 6 | 10 |
| `MonsterFalsePharaoh` | False Pharaoh |  | TLE | fleshless | 8+3 | 6 | 6 | 3 | 80 | 6 | 6 |
| `MonsterObsessiveExplorer` | Obsessive Explorer |  | TLE | humanoid | 1+1 | 3 | 1 | 2 | 15 | 6 | 10 |
| `MonsterPenguin` | Penguin |  | TLE | beast | 2+1 | 1 | 3 | 1 | 1 | 6 | 12 |
| `MonsterSmartExplorer` | Smart Explorer |  | TLE | humanoid | 2+1 | 5 | 1 | 3 | 15 | 6 | 12 |
| `MonsterSphynxGuardian` | Sphynx Guardian |  | TLE | beast | 1+3 | 4 | 5 | 5 | 24 | 12 | 12 |
| `MonsterYithian` | Yithian |  | TLE | horror | 1+2 | 5 | 5 | 2 | 15 | 6 | 10 |

## Objetos

Rasgos útiles para `QItem traits=`/`traitpool=`: `common`, `unique`, `weapon`, `firearm`, `heavyweapon`, `bladedweapon`, `spell`, `spellattack`, `spelldefence`, `lightsource`, `tome`, `equipment`, `evidence`, `key`, `ally`, `relic`, `elixir`.


### Juego base (MAD20) (`MoMBase`)

| ID | EN | Rasgos |
|---|---|---|
| `ItemCommon18Derringer` | 18 Derringer | weapon firearm common |
| `ItemCommon38Revolver` | 38 Revolver | weapon firearm common |
| `ItemCommon45Automatic` | 45 Automatic | weapon firearm common |
| `ItemCommon2x4` | 2x4 | weapon heavyweapon common |
| `ItemCommonArcaneManuscript` | Arcane Manuscript | tome common |
| `ItemCommonAxe` | Axe | weapon heavyweapon common |
| `ItemCommonBandages` | Bandages | equipment common |
| `ItemCommonBrassKnuckles` | Brass Knuckles | equipment common |
| `ItemCommonBullseyeLantern` | Bullseye Lantern | lightsource common |
| `ItemCommonCandles` | Candles | lightsource common |
| `ItemCommonCarbineRifle` | Carbine Rifle | weapon firearm common |
| `ItemCommonCrowbar` | Crowbar | weapon heavyweapon common |
| `ItemCommonDynamite` | Dynamite | equipment common |
| `ItemCommonElderSignPendant` | Elder Sign Pendant | equipment common |
| `ItemCommonElderWard` | Elder Ward | equipment common |
| `ItemCommonFireExtinguisher` | Fire Extinguisher | weapon heavyweapon common |
| `ItemCommonFlareGun` | Flare Gun | equipment common |
| `ItemCommonHolyCross` | Holy Cross | equipment common |
| `ItemCommonHolyWater` | Holy Water | equipment common |
| `ItemCommonKeroseneLantern` | Kerosene Lantern | lightsource common |
| `ItemCommonKingJamesBible` | King James Bible | tome common |
| `ItemCommonKnife` | Knife | weapon bladedweapon common |
| `ItemCommonLeadPipe` | Lead Pipe | weapon heavyweapon common |
| `ItemCommonLuckyCigaretteCase` | Lucky Cigarette Case | equipment common |
| `ItemCommonLuckyRabbitsFoot` | Lucky Rabbits Foot | equipment common |
| `ItemCommonMachete` | Machete | weapon bladedweapon common |
| `ItemCommonMagnifyingGlass` | Magnifying Glass | equipment common |
| `ItemCommonMeatCleaver` | Meat Cleaver | weapon bladedweapon common |
| `ItemCommonMedicalTextbook` | Medical Textbook | equipment common |
| `ItemCommonPickaxe` | Pickaxe | weapon heavyweapon common |
| `ItemCommonPocketWatch` | Pocket Watch | equipment common |
| `ItemCommonRitualDagger` | Ritual Dagger | weapon bladedweapon common |
| `ItemCommonSedatives` | Sedatives | equipment common |
| `ItemCommonShotgun` | Shotgun | weapon firearm common |
| `ItemCommonShovel` | Shovel | weapon heavyweapon common |
| `ItemCommonSledgehammer` | Sledgehammer | weapon heavyweapon common |
| `ItemCommonTommyGun` | Tommy Gun | weapon firearm common |
| `ItemCommonTorch` | Torch (también en PotS) | weapon heavyweapon lightsource common |
| `ItemCommonWhiskey` | Whiskey | equipment common |
| `ItemCommonWrench` | Wrench | weapon heavyweapon common |
| `ItemUniqueBrassKey` | Brass Key | key unique |
| `ItemUniqueCircumstantialEvidence` | Circumstantial Evidence | evidence unique |
| `ItemUniqueConclusiveEvidence` | Conclusive Evidence | evidence unique |
| `ItemUniqueCultSigil` | Cult Sigil | evidence key unique |
| `ItemUniqueForensicEvidence` | Forensic Evidence | evidence unique |
| `ItemUniqueHandcuffs` | Handcuffs | equipment unique |
| `ItemUniqueGoldKey` | Gold Key | key unique |
| `ItemUniqueGrotesqueStone` | Grotesque Stone | evidence unique |
| `ItemUniqueIncriminatingEvidence` | Incriminating Evidence | evidence unique |
| `ItemUniqueOilLamp` | Oil Lamp | lightsource unique |
| `ItemUniqueOldJournal` | Old Journal | evidence unique |
| `ItemUniqueOldKeys` | Old Keys | key unique |
| `ItemUniqueMissingLink` | Missing Link | evidence unique |
| `ItemUniquePhotographicEvidence` | Photographic Evidence | evidence unique |
| `ItemUniquePuzzleBox` | Puzzle Box | equipment unique |
| `ItemUniqueRitualComponents` | Ritual Components | evidence unique |
| `ItemUniqueRope` | Rope | equipment unique |
| `ItemUniqueSilverKey` | Silver Key | key unique |
| `ItemSpellFeedTheMind` | Feed The Mind | spell spelldefence |
| `ItemSpellFleshWard` | Flesh Ward | spell spelldefence |
| `ItemSpellInstillBravery` | Instill Bravery | spell spelldefence |
| `ItemSpellShriveling` | Shriveling | spell spellattack |
| `ItemSpellWither` | Wither | spell spellattack |
| `ItemSpellWrack` | Wrack | spell spellattack |

### Beyond the Threshold (MAD23) (`BtT`)

| ID | EN | Rasgos |
|---|---|---|
| `ItemCommon25Automatic` | 25 Automatic | weapon firearm common |
| `ItemCommonBlackjack` | Blackjack | weapon heavyweapon common |
| `ItemCommonEnchantedBlade` | Enchanted Blade | weapon bladedweapon common |
| `ItemCommonFineClothes` | Fine Clothes | equipment common |
| `ItemCommonScribesJournal` | Scribes Journal | tome common |
| `ItemCommonRazor` | Razor | weapon bladedweapon common |
| `ItemCommonTomeOfHorrors` | Tome Of Horrors | tome common |
| `ItemCommonTomeOfSecrets` | Tome Of Secrets | tome common |
| `ItemUniqueCultistsJournal` | Cultists Journal | evidence tome unique |
| `ItemSpellPoisonMist` | Poison Mist | spell spellattack |
| `ItemSpellArcaneInsight` | Arcane Insight | spell spelldefence |

### Kit de conversión: fichas y objetos (`MoM1CK`)

| ID | EN | Rasgos |
|---|---|---|
| `ItemUniqueDukeTheDog` | Duke The Dog | ally unique |
| `ItemUniqueFluxStabilizer` | Flux Stabilizer | equipment unique |

### Horrific Journeys (MAD27) (`HJ`)

| ID | EN | Rasgos |
|---|---|---|
| `ItemCommon41Derringer` | 41 Derringer | weapon firearm common |
| `ItemCommonAstronomyGuidebook` | Astronomy Guidebook | tome common |
| `ItemCaptainsHat` | Captains Hat | equipment common |
| `ItemCommonCoalShovel` | Coal Shovel | weapon heavyweapon common |
| `ItemCommonDiversHelm` | Divers Helm | equipment common |
| `ItemCommonDiversJournal` | Divers Journal | tome common |
| `ItemCommonGateBox` | Gate Box | equipment common |
| `ItemCommonGatlingGun` | Gatling Gun | weapon firearm common |
| `ItemCommonHarpoon` | Harpoon | weapon bladedweapon common |
| `ItemCommonLifePreserver` | Life Preserver | weapon heavyweapon common |
| `ItemCommonMapOfTheLeyLines` | Map Of The Ley Lines | equipment common |
| `ItemCommonMysticSextant` | Mystic Sexton | equipment common |
| `ItemCommonSturdyLuggage` | Sturdy Luggage | weapon heavyweapon common |
| `ItemUniqueFishingNet` | Fishing Net | equipment unique |
| `ItemUniqueFuel` | Fuel | equipment unique |
| `ItemUniqueGoldenTrumpet` | Golden Trumpet | equipment unique |
| `ItemUniqueSatchelOfTheVoid` | Satchel Of The Void | equipment unique |
| `ItemUniqueTicket` | Ticket | evidence unique |
| `ItemSpellMistsOfRlyeh` | Mists Of Rlyeh | spell spelldefence |
| `ItemSpellStormOfSpirits` | Storm Of Spirits | spell spellattack |
| `ItemSpellPlumbingTheVoid` | Plumbing The Void | spell spelldefence |

### Path of the Serpent (MAD28) (`PotS`)

| ID | EN | Rasgos |
|---|---|---|
| `ItemCommonDiskOfItzamna` | Disc Of Itzamna | equipment common |
| `ItemCommonAntiVenom` | Antivenom | equipment common |
| `ItemCommonExpeditionLog` | Expedition Log | tome common |
| `ItemCommonHedgeShears` | Hedge Shears | weapon bladedweapon common |
| `ItemCommonJeweledSkull` | Jeweled Skull | equipment common |
| `ItemCommonLuckyBandana` | Lucky Bandana | equipment common |
| `ItemCommonMatches` | Matches | equipment common |
| `ItemCommonOtherworldlyCompass` | Otherworldly Compass | equipment common |
| `ItemCommonPithHelmet` | Pith Helmet | equipment common |
| `ItemCommonSerpentBracelet` | Serpent Bracelet | equipment common |
| `ItemCommonSurvivalKnife` | Survival Knife | weapon bladedweapon common |
| `ItemCommonSurvivalPack` | Survival Pack | weapon heavyweapon common |
| `ItemCommonTimewornBrand` | Timeworn Brand | weapon bladedweapon common |
| `ItemSpellCallTheStorm` | Call The Storm | spell spellattack |
| `ItemUniqueCitrineSnake` | Citrine Snake | evidence relic unique |
| `ItemUniqueJadeCrocodile` | Jade Crocodile | evidence relic unique |
| `ItemUniqueObsidianJaguar` | Obsidian Jaguar | evidence relic unique |
| `ItemUniqueTurquoiseEagle` | Turquoise Eagle | evidence relic unique |
| `ItemUniqueMysteriousSerpent` | Mysterious Snake | ally unique |
| `ItemSpellBanishment` | Banishment | spell spelldefence |
| `ItemSpellSummoning` | Summoning | spell spelldefence |

### Streets of Arkham (MAD25) (`SoA`)

| ID | EN | Rasgos |
|---|---|---|
| `ItemCommonBulletproofVest` | Bulletproof Vest | equipment common |
| `ItemCommonEnhancingSerum` | Enhancing Serum | equipment common |
| `ItemCommonFlask` | Flask | equipment common |
| `ItemCommonGamblersDice` | Gamblers Dice | equipment common |
| `ItemCommonMentalStimulant` | Mental Stimulant | equipment common |
| `ItemCommonMoonPotion` | Moon Potion | equipment common |
| `ItemCommonMutationJuice` | Mutation Juice | equipment common |
| `ItemCommonOcularExtract` | Ocular Extract | equipment common |
| `ItemCommonScalpel` | Scalpel | weapon bladedweapon common |
| `ItemCommonSnubnoseRevolver` | Snubnose Revolver | weapon firearm common |
| `ItemCommonThermos` | Thermos | equipment common |
| `ItemUniqueBecky` | Becky | weapon firearm unique |
| `ItemUniqueBonePipes` | Bone Pipes | relic unique |
| `ItemUniqueDeVermisMysteriis` | De Vermis Mysteriis | evidence tome unique |
| `ItemUniqueLedger` | Ledger | evidence tome unique |
| `ItemUniqueMysteriousIdol` | Mysterious Idol | relic unique |
| `ItemUniqueOldMap` | Old Map | evidence unique |
| `ItemUniqueStarCalendar` | Star Calendar | relic unique |
| `ItemUniqueStoneChest` | Stone Chest | relic unique |
| `ItemUniqueStrangeTablet` | Strange Tablet | relic unique |
| `ItemSpellAzureFlame` | Azure Flame | spell spellattack |
| `ItemSpellForcedLearning` | Forced Learning | spell spelldefence |
| `ItemSpellImplantSuggestion` | Implant Suggestion | spell spelldefence |
| `ItemElixir` | Elixir | elixir |

### Sanctum of Twilight (MAD26) (`SoT`)

| ID | EN | Rasgos |
|---|---|---|
| `ItemCommonPainkillers` | Painkillers | equipment common |
| `ItemCommonBindingPowder` | Binding Powder | equipment common |
| `ItemCommonConvincingDummy` | Convincing Dummy | equipment common |
| `ItemCommonLuckyRing` | Lucky Ring | equipment common |
| `ItemCommonRiotWhistle` | Riot Whistle | equipment common |
| `ItemCommonSensibleShoes` | Sensible Shoes | equipment common |
| `ItemCommonSilverTwilightDagger` | Silver Twilight Dagger | weapon bladedweapon common |
| `ItemCommonSwordCane` | Sword Cane | weapon bladedweapon heavyweapon common |
| `ItemCommonToteBag` | Tote Bag | equipment common |
| `ItemCommonTrackShoes` | Track Shoes | equipment common |
| `ItemUniqueMembershipRing` | Membership Ring | evidence unique |
| `ItemUniqueTwilightDiadem` | Twilight Diadem | relic unique |
| `ItemSpellBinding` | Binding | spell spelldefence |
| `ItemSpellSpectralRazor` | Spectral Razor | spell spellattack |

## Investigadores

La variable `#Hero...` vale 1 si ese investigador juega (p. ej. `#HeroAgathaCrane`). En textos: `{ffg:INVESTIGATOR_AGATHA_CRANE}` da su nombre oficial.

| ID / variable | EN | Pack | Rasgos |
|---|---|---|---|
| `HeroRitaYoung` | Rita Young | MoMBase | female |
| `HeroMinhThiPhan` | Minh Thi Phan | MoMBase | female |
| `HeroFatherMateo` | Father Mateo | MoMBase | male |
| `HeroPrestonFairmont` | Preston Fairmont | MoMBase | male |
| `HeroAgathaCrane` | Agatha Crane | MoMBase | female |
| `HeroCarsonSinclair` | Carson Sinclair | MoMBase | male |
| `HeroWendyAdams` | Wendy Adams | MoMBase | female |
| `HeroWilliamYorick` | William Yorick | MoMBase | male |
| `HeroWilsonRichards` | Wilson Richards | BtT | male |
| `HeroAkachiOnyele` | Akachi Onyele | BtT | female |
| `HeroAmandaSharpe` | Amanda Sharpe | CotWI | female |
| `HeroBobJenkins` | Bob Jenkins | CotWI | male |
| `HeroMandyThompson` | Mandy Thompson | CotWI | female |
| `HeroMontereyJack` | Monterey Jack | CotWI | male |
| `HeroCarolynFern` | Carolyn Fern | FAI | female |
| `HeroDarrellSimmons` | Darrell Simmons | FAI | male |
| `HeroDexterDrake` | Dexter Drake | FAI | male |
| `HeroVincentLee` | Vincent Lee | FAI | male |
| `HeroMichaelMcGlen` | Michael Mcglen | MoM1EI | male |
| `HeroAshcanPete` | Ashcan Pete | MoM1EI | male |
| `HeroGloriaGoldberg` | Gloria Goldberg | MoM1EI | female |
| `HeroHarveyWalters` | Harvey Walters | MoM1EI | male |
| `HeroJennyBarnes` | Jenny Barnes | MoM1EI | female |
| `HeroJoeDiamond` | Joe Diamond | MoM1EI | male |
| `HeroKateWinthrop` | Kate Winthrop | MoM1EI | female |
| `HeroSisterMary` | Sister Mary | MoM1EI | female |
| `HeroTrishScarborough` | Trish Scarborough | HJ | female |
| `HeroJimCulver` | Jim Culver | HJ | male |
| `HeroSilasMarsh` | Silas Marsh | HJ | male |
| `HeroAgnesBaker` | Agnes Baker | HJ | female |
| `HeroLeoAnderson` | Leo Anderson | PotS | male |
| `HeroUrsulaDowns` | Ursula Downs | PotS | female |
| `HeroDanielaReyes` | Daniela Reyes | PotS | female |
| `HeroNormanWithers` | Norman Withers | PotS | male |
| `HeroFinnEdwards` | Finn Edwards | SoA | male |
| `HeroTommyMuldoon` | Tommy Muldoon | SoA | male |
| `HeroMarieLambeau` | Marie Lambeau | SoA | female |
| `HeroDianaStanley` | Diana Stanley | SoA | female |
| `HeroCharlieKane` | Charlie Kane | SoT | male |
| `HeroLilyChen` | Lily Chen | SoT | female |

## Fichas (Token)

Valor de `type=` en un componente Token. También se puede usar el ID de un monstruo (`type=MonsterCultist`) para mostrar su imagen como ficha.


### tablero (28)

`TokenSearch` (MoMBase), `TokenInteract` (MoMBase), `TokenExplore` (MoMBase), `TokenSight` (MoMBase), `TokenClue` (MoMBase), `TokenDarkness` (MoMBase), `TokenFire` (MoMBase), `TokenBarricadeInside` (MoMBase), `TokenBarricadeOutside` (MoMBase), `TokenDoorInside` (MoMBase), `TokenDoorOutside` (MoMBase), `TokenSecretInside` (MoMBase), `TokenSecretOutside` (MoMBase), `TokenSewer` (MoMBase), `TokenTrapdoor` (MoMBase), `TokenWallInside` (MoMBase), `TokenWallOutside` (MoMBase), `TokenWallInsideGreen` (MoMBase), `TokenWallOutsideGreen` (MoMBase), `TokenInvestigators` (MoMBase), `TokenRift` (HJ), `TokenWater` (HJ), `TokenOvergrowth` (PotS), `TokenRubble` (PotS), `TokenTempleDoor` (PotS), `TokenTempleDoor2` (PotS), `TokenTempleWall` (PotS), `TokenTempleWall2` (PotS)

### personaje-generico (20)

`TokenWhiteWoman` (MoMBase), `TokenWhiteMan` (MoMBase), `TokenGreyWoman` (MoMBase), `TokenGreyMan` (MoMBase), `TokenGreenWoman` (MoMBase), `TokenGreenMan` (MoMBase), `TokenRedWoman` (MoMBase), `TokenRedMan` (MoMBase), `TokenPurpleWoman` (MoMBase), `TokenPurpleMan` (MoMBase), `TokenOrangeWoman` (MoMBase), `TokenOrangeMan` (MoMBase), `TokenBlueWoman` (MoMBase), `TokenBlueMan` (MoMBase), `TokenYellowWoman` (MoMBase), `TokenYellowMan` (MoMBase), `TokenPinkWoman` (SoA), `TokenPinkMan` (SoA), `TokenCyanWoman` (SoA), `TokenCyanMan` (SoA)

### personaje (61)

`TokenDog` (MoMBase), `TokenCat` (MoMBase), `TokenRichardBechman` (MoMBase), `TokenMildredBechman` (MoMBase), `TokenAgentCraven` (MoMBase), `TokenHowardBechman` (MoMBase), `TokenGraceBechman` (MoMBase), `TokenEugeneClemens` (MoMBase), `TokenJoyceLittle` (MoMBase), `TokenSylviaMarsh` (MoMBase), `TokenBobbyFoster` (MoMBase), `TokenVictorBlake` (MoMBase), `TokenZadocAllen` (MoMBase), `TokenOtheraGilman` (MoMBase), `TokenEdnaHughes` (MoMBase), `TokenBruceDarzi` (BtT), `TokenJeanSpencer` (BtT), `TokenElizabethFairview` (BtT), `TokenThomasCarvey` (BtT), `TokenMayNguyen` (BtT), `TokenTetsuoMori` (BtT), `TokenLelandWilliams` (BtT), `TokenAmmiPierce` (MoM1CK), `TokenCorrinaJones` (MoM1CK), `TokenEricColt` (MoM1CK), `TokenZebulonWhateley` (MoM1CK), `TokenDotFisher` (HJ), `TokenOfficerButler` (HJ), `TokenFredCooper` (HJ), `TokenArthurHollowayIII` (HJ), `TokenEthelGibbs` (HJ), `TokenDoctorRoseBarnett` (HJ), `TokenClintonFreeman` (PotS), `TokenEulaDorman` (PotS), `TokenMarshallHastings` (PotS), `TokenMerleGarvin` (PotS), `TokenVedaWhitsley` (PotS), `TokenDephinaBell` (SoA), `TokenOldSadieSheldon` (SoA), `TokenLolaSantiago` (SoA), `TokenAdamLynch` (SoA), `TokenNaomiOBannion` (SoA), `TokenDrewWalker` (SoA), `TokenAliceLuxley` (SoA), `TokenElliHorowitz` (SoA), `TokenSadieSheldon` (SoA), `TokenProfessorSmith` (SoA), `TokenGrannyOrne` (SoT), `TokenArthurJohnson` (SoT), `TokenZoraLarson` (SoT), `TokenGabrielCarillo` (SoT), `TokenMaryAnnChase` (SoT), `TokenLewisHayes` (SoT), `TokenSachikoHiga` (SoT), `TokenEstherLocke` (SoT), `TokenHenryWan` (SoT), `TokenTheVeiledKing` (SoT), `TokenFacilityDoor` (TLE), `TokenFacilityWall` (TLE), `TokenDesertDoor` (TLE), `TokenDesertWall` (TLE)

### monstruo (50)

`TokenCultist` (MoMBase), `TokenDeepOne` (MoMBase), `TokenDeepOneHybrid` (MoMBase), `TokenGhost` (MoMBase), `TokenHuntingHorror` (MoMBase), `TokenRiot` (MoMBase), `TokenStarSpawn` (MoMBase), `TokenChildOfDagon` (MoMBase), `TokenPriestOfDagon` (MoMBase), `TokenZombie` (MoMBase), `TokenCthonian` (MoMBase), `TokenHoundOfTindalos` (MoMBase), `TokenManiac` (MoMBase), `TokenMiGo` (MoMBase), `TokenShoggoth` (MoMBase), `TokenWitch` (MoMBase), `TokenCultLeader` (MoMBase), `TokenChildOfTheGoat` (MoMBase), `TokenDarkDruid` (MoMBase), `TokenDarkYoung` (MoMBase), `TokenGoatSpawn` (MoMBase), `TokenNightgaunt` (MoMBase), `TokenDunwichHorror` (MoMBase), `TokenWizard` (MoMBase), `TokenByakhee` (MoMBase), `TokenCrawlingOne` (MoMBase), `TokenThrall` (BtT), `TokenWarlock` (HJ), `TokenDimensionalShambler` (HJ), `TokenHuntingDeepOne` (HJ), `TokenFormlessSpawn` (HJ), `TokenFeatheredSerpent` (PotS), `TokenTempleGuardian` (PotS), `TokenSerpentPerson` (PotS), `TokenAncientBasilisk` (PotS), `TokenSkeleton` (SoA), `TokenHiredGun` (SoA), `TokenLloigor` (SoA), `TokenStarVampire` (SoA), `TokenWraith` (SoT), `TokenPenguin` (TLE), `TokenYithian` (TLE), `TokenSphynxGuardian` (TLE), `TokenIcePrisoner` (TLE), `TokenObsessiveExplorer` (TLE), `TokenElderThing` (TLE), `TokenAncientThing` (TLE), `TokenFrozenSpawn` (TLE), `TokenAvatarPharaoh` (TLE), `TokenHombreLobo` (TLE)

### objeto (154)

`TokenCommon18Derringer` (MoMBase), `TokenCommon38Revolver` (MoMBase), `TokenCommon45Automatic` (MoMBase), `TokenCommon2x4` (MoMBase), `TokenCommonArcaneManuscript` (MoMBase), `TokenCommonAxe` (MoMBase), `TokenCommonBandages` (MoMBase), `TokenCommonBrassKnuckles` (MoMBase), `TokenCommonBullseyeLantern` (MoMBase), `TokenCommonCandles` (MoMBase), `TokenCommonCarbineRifle` (MoMBase), `TokenCommonCrowbar` (MoMBase), `TokenCommonDynamite` (MoMBase), `TokenCommonElderSignPendant` (MoMBase), `TokenCommonElderWard` (MoMBase), `TokenCommonFireExtinguisher` (MoMBase), `TokenCommonFlareGun` (MoMBase), `TokenCommonHolyCross` (MoMBase), `TokenCommonHolyWater` (MoMBase), `TokenCommonKeroseneLantern` (MoMBase), `TokenCommonKingJamesBible` (MoMBase), `TokenCommonKnife` (MoMBase), `TokenCommonLeadPipe` (MoMBase), `TokenCommonLuckyCigaretteCase` (MoMBase), `TokenCommonLuckyRabbitsFoot` (MoMBase), `TokenCommonMachete` (MoMBase), `TokenCommonMagnifyingGlass` (MoMBase), `TokenCommonMeatCleaver` (MoMBase), `TokenCommonMedicalTextbook` (MoMBase), `TokenCommonPickaxe` (MoMBase), `TokenCommonPocketWatch` (MoMBase), `TokenCommonRitualDagger` (MoMBase), `TokenCommonSedatives` (MoMBase), `TokenCommonShotgun` (MoMBase), `TokenCommonShovel` (MoMBase), `TokenCommonSledgehammer` (MoMBase), `TokenCommonTommyGun` (MoMBase), `TokenCommonTorch` (MoMBase), `TokenCommonWhiskey` (MoMBase), `TokenCommonWrench` (MoMBase), `TokenUniqueBrassKey` (MoMBase), `TokenUniqueCircumstantialEvidence` (MoMBase), `TokenUniqueConclusiveEvidence` (MoMBase), `TokenUniqueCultSigil` (MoMBase), `TokenUniqueForensicEvidence` (MoMBase), `TokenUniqueHandcuffs` (MoMBase), `TokenUniqueGoldKey` (MoMBase), `TokenUniqueGrotesqueStone` (MoMBase), `TokenUniqueIncriminatingEvidence` (MoMBase), `TokenUniqueOilLamp` (MoMBase), `TokenUniqueOldJournal` (MoMBase), `TokenUniqueOldKeys` (MoMBase), `TokenUniqueMissingLink` (MoMBase), `TokenUniquePhotographicEvidence` (MoMBase), `TokenUniquePuzzleBox` (MoMBase), `TokenUniqueRitualComponents` (MoMBase), `TokenUniqueRope` (MoMBase), `TokenUniqueSilverKey` (MoMBase), `TokenSpellFeedTheMind` (MoMBase), `TokenSpellFleshWard` (MoMBase), `TokenSpellInstillBravery` (MoMBase), `TokenSpellShriveling` (MoMBase), `TokenSpellWither` (MoMBase), `TokenSpellWrack` (MoMBase), `TokenCommon25Automatic` (BtT), `TokenCommonBlackjack` (BtT), `TokenCommonEnchantedBlade` (BtT), `TokenCommonFineClothes` (BtT), `TokenCommonScribesJournal` (BtT), `TokenCommonRazor` (BtT), `TokenCommonTomeOfHorrors` (BtT), `TokenCommonTomeOfSecrets` (BtT), `TokenUniqueCultistsJournal` (BtT), `TokenSpellPoisonMist` (BtT), `TokenSpellArcaneInsight` (BtT), `TokenCommon41Derringer` (HJ), `TokenCommonAstronomyGuidebook` (HJ), `TokenCaptainsHat` (HJ), `TokenCommonCoalShovel` (HJ), `TokenCommonDiversHelm` (HJ), `TokenCommonDiversJournal` (HJ), `TokenCommonGateBox` (HJ), `TokenCommonGatlingGun` (HJ), `TokenCommonHarpoon` (HJ), `TokenCommonLifePreserver` (HJ), `TokenCommonMapOfTheLeyLines` (HJ), `TokenCommonMysticSextant` (HJ), `TokenCommonSturdyLuggage` (HJ), `TokenUniqueFishingNet` (HJ), `TokenUniqueFuel` (HJ), `TokenUniqueGoldenTrumpet` (HJ), `TokenUniqueSatchelOfTheVoid` (HJ), `TokenUniqueTicket` (HJ), `TokenSpellMistsOfRlyeh` (HJ), `TokenSpellStormOfSpirits` (HJ), `TokenSpellPlumbingTheVoid` (HJ), `TokenCommonDiskOfItzamna` (PotS), `TokenCommonAntiVenom` (PotS), `TokenCommonExpeditionLog` (PotS), `TokenCommonHedgeShears` (PotS), `TokenCommonJeweledSkull` (PotS), `TokenCommonLuckyBandana` (PotS), `TokenCommonMatches` (PotS), `TokenCommonOtherworldlyCompass` (PotS), `TokenCommonPithHelmet` (PotS), `TokenCommonSerpentBracelet` (PotS), `TokenCommonSurvivalKnife` (PotS), `TokenCommonSurvivalPack` (PotS), `TokenCommonTimewornBrand` (PotS), `TokenSpellCallTheStorm` (PotS), `TokenUniqueCitrineSnake` (PotS), `TokenUniqueJadeCrocodile` (PotS), `TokenUniqueObsidianJaguar` (PotS), `TokenUniqueTurquoiseEagle` (PotS), `TokenUniqueMysteriousSerpent` (PotS), `TokenSpellBanishment` (PotS), `TokenSpellSummoning` (PotS), `TokenCommonBulletproofVest` (SoA), `TokenCommonEnhancingSerum` (SoA), `TokenCommonFlask` (SoA), `TokenCommonGamblersDice` (SoA), `TokenCommonMentalStimulant` (SoA), `TokenCommonMoonPotion` (SoA), `TokenCommonMutationJuice` (SoA), `TokenCommonOcularExtract` (SoA), `TokenCommonScalpel` (SoA), `TokenCommonSnubnoseRevolver` (SoA), `TokenCommonThermos` (SoA), `TokenUniqueBecky` (SoA), `TokenUniqueBonePipes` (SoA), `TokenUniqueDeVermisMysteriis` (SoA), `TokenUniqueLedger` (SoA), `TokenUniqueMysteriousIdol` (SoA), `TokenUniqueOldMap` (SoA), `TokenUniqueStarCalendar` (SoA), `TokenUniqueStoneChest` (SoA), `TokenUniqueStrangeTablet` (SoA), `TokenSpellAzureFlame` (SoA), `TokenSpellForcedLearning` (SoA), `TokenSpellImplantSuggestion` (SoA), `TokenCommonPainkillers` (SoT), `TokenCommonBindingPowder` (SoT), `TokenCommonConvincingDummy` (SoT), `TokenCommonLuckyRing` (SoT), `TokenCommonRiotWhistle` (SoT), `TokenCommonSensibleShoes` (SoT), `TokenCommonSilverTwilightDagger` (SoT), `TokenCommonSwordCane` (SoT), `TokenCommonToteBag` (SoT), `TokenCommonTrackShoes` (SoT), `TokenUniqueMembershipRing` (SoT), `TokenUniqueTwilightDiadem` (SoT), `TokenSpellBinding` (SoT), `TokenSpellSpectralRazor` (SoT)


## Imágenes para UI

Valores de `image=` en un componente UI (o una ruta a un .png/.jpg propio).

`Image1stEdition`, `Image2ndEdition`, `ImageartOldJournal_3x3`, `ImageArtPowder3x3`, `ImageartTheUsualSuspects_4x2`, `ImageartEVEAL3x3`, `ImageCloudsGrey`, `ImageCutsceneBG`, `ImageCutsceneFrame`, `ImageCutsceneTextTopper`, `ImageChurch`, `ImageMurderInvestigation`, `ImageSlime`, `ImageOfficeWithBlood`, `ImageDunwichHorror`, `ImageDarkReflections`, `ImageRitualGoneWrong`, `ImageBuriedAlive`, `ImageArtRoom`, `ImageGoodNowStayDead`, `ImageWounded`, `ImageBloodyKukri`, `ImageHexagramRitual`, `ImageDrHenryArmitage`, `ImageScream`, `ImageOfficeLazy`, `ImageLibary`, `ImageMuseum`, `ImageSpell`, `ImageWorkroom`, `ImageFogWindy`, `ImageMuseumHuntingHorror`, `ImageDeepOnes`, `ImageDocks`, `ImageArmStuck`, `ImageSpellCaster`, `ImageOfficeAsleep`, `ImageVillageDecayed`, `ImageWoodsDogingBullets`, `ImageCoveredBodyWithBlood`, `ImageFogMansion`, `ImageLibaryResearch`, `ImageFightingTentacles`, `ImageMuseumRobber`, `ImageCityMessedUpWithBlood`, `ImageGunThemDown`, `ImageDissectionRoom`, `ImageDocksBuringBoat`, `ImageSpellMindtrick`, `ImageBookHolder`, `ImageSyringe`, `ImageBustedOpen`, `ImageHillStreetPolicePatrol`, `ImageBook`, `ImageNightWatch`, `ImageCarTentacleEscape`, `ImageChurchDecayed`, `ImageMuseumInvitation`, `ImageFogVillage`, `ImageInnsmouthHorror`, `ImageDinnerInvitation`, `ImageStarVampire`, `ImagePortal`, `ImageBoatRide`, `ImageTome`, `ImageMiskatonicCampus`, `ImageClueFound`, `ImageDarkReflections2`, `ImageMiGoSneakUp`, `ImagePortalSpell`, `ImageOfficeTypewriter`, `ImageRoomVineCovered`, `ImageFogCityStreets`, `ImageHandcuffed`, `ImageDarkReflections3`, `ImageOfficeBriefing`, `ImageDinnerParty`, `ImageInnsmouthCity`, `ImageMurderInvestigationBedroom`, `ImagePoliceMan`, `ImageSpellVision`, `ImageFogWoods`, `ImageBurningHouseRuneStone`, `ImageFlashlightScared`, `ImageRitualOnDeadBody`, `ImagePoliceBuilding`, `ImageLabStudy`, `ImageMeeting`, `ImageZombieKill`, `ImageMuseumHall`, `ImageFogWoods2`, `ImageDarkReflections4`, `ImageBackShot`, `ImageMotorcycle`, `ImageBarricadeBreaks`, `ImageDispute`, `ImageGraveyard`, `ImageRitualStone`, `ImageSpellMindtrick2`, `ImageAmulet`, `ImageKillItWithFire`, `ImageHandcuffed2`, `ImageFarmDarkYoung`, `ImageMuseumExhibition`, `ImageDeepOne`, `ImageZombie`, `ImageSpellLightning`, `ImageRitualPentagramCultists`, `ImageBook2`, `ImageCityAlleyway`, `ImageMuseumBloodTrail`, `ImageWoodsSwathOfDestruction`, `ImageAngryMob`, `ImageDocks2`, `ImageVillage`, `ImageDog`, `ImageDeepOne2`, `ImageZombieGirl`, `ImageStrangeSky`, `ImageYogSothoth`, `ImageMuseumArchive`, `ImageTentacleAttack`, `ImageCityAtNight`, `ImageDriveBy`, `ImageLetTheMotherfuckerBurn`, `ImagePlaza`, `ImageCityStreets`, `ImageMuseumBuilding`, `ImageTank`, `ImagePoliceMan2`, `ImageMuseumExhibitionAtNight`, `ImageThisIsYouLastChance`, `ImageDunwichCultists`, `ImageWeirdStorage`, `ImageRitualNeedsBlood`, `ImageInnsmouthStreets`, `ImageLockedAway`, `ImageWeirdStorage2`, `ImagePoliceConfession`, `ImageDocksKiller`, `ImageBadNews`, `ImageMansionAtNight`, `ImageSpellMoon`, `ImageYouAreFinished`, `ImageDissectionMiGo`, `ImageYogSothothPlanet`, `ImageHotelRoom`, `ImageMausoleum`, `ImageSewerInvestigation`, `ImageThrall`, `ImageFogGarden`, `ImageYogSothoth2`, `ImageZombiesAtTheWindow`, `ImageTentaclePalms`, `ImageDarkReflections5`, `ImageGraveyard2`, `ImageCarDriver`, `ImagePoliceMythosCreaturesAttack`, `ImageFoundTheKey`, `ImageOvergrowth`, `ImageCar`, `ImageHotelRoomDark`, `ImageSyringeDoctor`, `ImageAlienClockwork`, `ImageDoorOpening`, `ImageGreenBG`, `ImageInvestigatorSelectTitle`, `ImageLoadingScreen01`, `ImageLoadingScreen02`, `ImageLoadingScreen03`, `ImageLoadingScreen04`, `ImageLeather`, `ImageMythosBackground`, `ImagePicturePuzzleBG`, `ImagePuzzle1_background`, `ImageTimberPuzzleBG`, `ImageScenarioCoE`, `ImageScenarioCoSH`, `ImageScenarioDD`, `ImageScenarioEFI`, `ImageScenarioGoSM`, `ImageScenarioRT`, `ImageScenarioSB`, `ImageScenarioVI`, `ImageScenario_WLW`, `ImageScenario_DR`, `ImageScenario_BCD`, `ImageScenario_BCD2`, `ImageScenario_TD`, `ImageSceneryBushLeft`, `ImageSceneryBushRight`, `ImageSceneryFence`, `ImageSceneryMansion`, `ImageSceneryTreesLeft`, `ImageScenery_Trees_Right`, `ImageStartingItemsTitleBar`, `ImageAlchemyBottlePuzzle`, `ImageStarsofHades`, `ImageStatueClipped`, `ImageTarotDeath`, `ImageLaneBG`, `ImageScenarioAA`, `ImageScenarioGoA`, `ImageScenarioIFE`, `ImageTower4Piece`, `ImageTower5Piece`, `ImageTower6Piece`, `ImageGrotesque`, `ImageLowEditorTransparency`, `ImageMediumEditorTransparency`, `ImageHighEditorTransparency`


## Audio

Valores de `audio=`/`music=` (o una ruta a un .ogg propio). Rasgo `music` = pista larga.

`AudioMenu` (música), `AudioAtmosphere1` (música), `AudioAtmosphere2` (música), `AudioAtmosphere3` (música), `AudioAtmosphere4` (música), `AudioAtmosphere5` (música), `AudioAtmosphere6` (música), `AudioAtmosphere7` (música), `AudioBladed1`, `AudioBladed2`, `AudioBladed3`, `AudioDeath`, `AudioButlerEaten`, `AudioButlerSaved`, `AudioButton1`, `AudioButton2`, `AudioCabinet1`, `AudioCabinet2`, `AudioCabinet3`, `AudioClick1`, `AudioClick2`, `AudioClick3`, `AudioClock`, `AudioComplete`, `AudioCreatureMoves`, `AudioCreatureWarning`, `AudioCrows`, `AudioCurio`, `AudioDarkPact`, `AudioDeselect`, `AudioDevoured1`, `AudioDevoured2`, `AudioDinnerBell`, `AudioDog`, `AudioDoorCreak1`, `AudioDoorCreak2`, `AudioDoorOpen1`, `AudioDoorOpen2`, `AudioDoorOpen3`, `AudioDrawer1`, `AudioDrawer2`, `AudioDumbwaiter`, `AudioElectric1`, `AudioElectric2`, `AudioElectric3`, `AudioElectric4`, `AudioElectric5`, `AudioEntrance`, `AudioEventFinale`, `AudioFinale1`, `AudioFinale2`, `AudioFinale3`, `AudioFinalPortalSurge`, `AudioFirearm1`, `AudioFirearm2`, `AudioFirstPortalSurge`, `AudioFogBell`, `AudioForceFinale`, `AudioFormIdol`, `AudioGainItem`, `AudioGameOver`, `AudioGenericItem1`, `AudioGenericItem2`, `AudioGenericItem3`, `AudioGlassBreak1`, `AudioGlassBreak2`, `AudioGlassBreak3`, `AudioGong`, `AudioGraceDies`, `AudioGuess`, `AudioHeavy1`, `AudioHeavy2`, `AudioHiddenDoor1`, `AudioHiddenDoor2`, `AudioHiddenDoor3`, `AudioHiddenDoor4`, `AudioHybridAttack`, `AudioImportant1`, `AudioImportant2`, `AudioInvestigator`, `AudioLocked1`, `AudioLocked2`, `AudioLocked3`, `AudioMableGhost1`, `AudioMetalOpen1`, `AudioMetalOpen2`, `AudioMobTrashesDock`, `AudioMonsterGeneric1`, `AudioMonsterGeneric2`, `AudioMonsterGeneric3`, `AudioMonsterGeneric4`, `AudioMove1`, `AudioMove2`, `AudioMove3`, `AudioMove4`, `AudioMythos`, `AudioNegative1`, `AudioNegative2`, `AudioNegative3`, `AudioNegative4`, `AudioNegative5`, `AudioNegative6`, `AudioNegativeStory`, `AudioNewContent`, `AudioNodeAppear`, `AudioNodeFailed`, `AudioOpenObject1`, `AudioOpenObject2`, `AudioOpenObject3`, `AudioOpenObject4`, `AudioPapers1`, `AudioPapers2`, `AudioPapers3`, `AudioPapers4`, `AudioPapers5`, `AudioPaperSlideIn`, `AudioPaperSlideOut`, `AudioPhone1`, `AudioPhone2`, `AudioPiano`, `AudioPortalOpens1`, `AudioPortalOpens2`, `AudioPortalSurge`, `AudioPositive1`, `AudioPositive2`, `AudioPotsPans1`, `AudioRevealTile1`, `AudioRevealTile2`, `AudioRitualCircle1`, `AudioRitualCircle2`, `AudioRoofComesOff`, `AudioRoomFeature`, `AudioSecurityAlarm`, `AudioSelect`, `AudioSetup`, `AudioSoftButton`, `AudioSpawnBoss1`, `AudioSpawnBoss2`, `AudioSpawnFirstMonster`, `AudioSpawnRiot`, `AudioSpawnVanderbilt1`, `AudioSpawnVanderbilt2`, `AudioSpell1`, `AudioSpell2`, `AudioSpell3`, `AudioStoneOpen1`, `AudioStoneOpen2`, `AudioSuspectTransform`, `AudioTestSound`, `AudioThud1`, `AudioThud2`, `AudioTransition`, `AudioTransistionGeneric`, `AudioUISlideIn`, `AudioUISlideOut`, `AudioUnarmed1`, `AudioUnarmed2`, `AudioUnlock1`, `AudioWoodDestroy1`, `AudioWoodDestroy2`, `AudioAngryGhost`, `AudioBangDoor1`, `AudioBangDoor2`, `AudioBarricade1`


## Imágenes de puzle

Valores de `image=` para `class=image` (rejilla recomendada entre paréntesis: úsala en `puzzlelevel`×`puzzlealtlevel`).

`PuzzleOldJournal` (3x3), `PuzzleRitualRunes` (3x3), `PuzzleStatue` (3x3), `PuzzleTheUsualSuspects` (4x2), `PuzzleWire3x3` (3x3), `PuzzleWire4x2` (4x2), `PuzzleStarsofHades3x3` (3x3), `PuzzleTarotDeath4x2` (4x2)


## Tipos de ataque y categorías

Tipo de ataque del investigador → categorías de monstruo (rasgo) con textos. Un CustomMonster sin `base` ni rasgos de categoría no ofrece opciones de ataque.

| Tipo (`attacks=` de CustomMonster) | Categorías |
|---|---|
| `bladed` | beast, fleshless, horror, humanoid, snakeperson, spirit |
| `firearm` | beast, fleshless, horror, humanoid, snakeperson, spirit |
| `heavy` | beast, fleshless, horror, humanoid, snakeperson, spirit |
| `spell` | beast, fleshless, horror, humanoid, snakeperson, spirit |
| `unarmed` | beast, fleshless, horror, humanoid, snakeperson, spirit |

## Variables de Mitos

Variables que activan grupos de eventos de Mitos genéricos (nº de eventos que las usan). Pon a 1 una de intensidad (`$mythosMinor`...) y, opcionalmente, de lugar.

`$mythosMajor` (117), `$mythosMinor` (86), `$mythosDeadly` (69), `$mythosOutdoors` (38), `$mythosFlavor` (27), `#SoA` (25), `$mythosHelp` (19), `#BtT` (13), `$mythosStreet` (11), `#SoT` (9), `$mythosAlley` (8), `$mythosIndoors` (8), `$mythosHall` (5), `$mythosStairs` (5), `$fire` (4), `$mythosLibrary` (4), `$mythosDarkness` (4), `$mythosBeach` (4), `$mythosDock` (4), `$mythosStorageRoom` (4), `$mythosKitchen` (3), `$mythosDiscardItem` (3), `$mythosPier` (3), `$mythosOffice` (3), `$mythosStudy` (3), `$mythosStreetCorner` (2), `$mythosBallroom` (2), `$mythosBedroom` (2), `$mythosClassroom` (2), `$mythosAlleyCorner` (1), `$mythosCrypt` (1), `$mythosGraveyard` (1), `$mythosMorgue` (1), `$mythosBathroom` (1), `$mythosTownSquare` (1), `$mythosLounge` (1), `$mythosKey` (1), `$mythosRiver` (1), `$mythosDiningRoom` (1), `$mythosHallStairs` (1), `$mythosAtticStorage` (1), `$mythosChapel` (1), `$mythosExhibit` (1)

`#SoA`, `#BtT`, `#SoT` aparecen porque hay eventos de Mitos que solo salen si esa expansión está activa. Evita llamar a una variable propia `mythosUnfinished`: Valkyrie la usa para desactivar eventos de Mitos sin terminar.

## Activaciones oficiales

Activaciones `MonsterActivationX` de los content packs (textos oficiales ya traducidos). Un CustomMonster las reutiliza con `activation=X Y…` (sin el prefijo `MonsterActivation`), y Valkyrie elige una al azar en cada activación. Rangos por monstruo:

`AncientBasilisk01`…`AncientBasilisk24` (24), `AncientThing01`…`AncientThing12` (12), `AvatarPharaoh01`…`AvatarPharaoh15` (15), `Byakhee01`…`Byakhee24` (24), `ChildOfDagon01`…`ChildOfDagon24` (24), `ChildOfTheGoat01`…`ChildOfTheGoat24` (24), `CrawlingOne01`…`CrawlingOne24` (24), `Cthonian01`…`Cthonian24` (24), `CultLeader01`…`CultLeader24` (24), `Cultist01`…`Cultist25` (25), `DarkDruid01`…`DarkDruid24` (24), `DarkYoung01`…`DarkYoung24` (24), `DeepOne01`…`DeepOne24` (24), `DeepOneHybrid01`…`DeepOneHybrid24` (24), `DimensionalShambler01`…`DimensionalShambler24` (24), `DunwichHorror` y `DunwichHorror01`…`DunwichHorror24` (24), `ElderThing01`…`ElderThing12` (12), `FalsePharaoh01`…`FalsePharaoh80` (80), `FeatheredSerpent01`…`FeatheredSerpent24` (24), `FormlessSpawn01`…`FormlessSpawn24` (24), `Ghost01`…`Ghost24` (21), `GoatSpawn01`…`GoatSpawn24` (24), `HiredGun01`…`HiredGun24` (24), `HombreLobo01`…`HombreLobo10` (10), `HoundOfTindalos03`…`HoundOfTindalos24` (20), `HuntingDeepOne01`…`HuntingDeepOne24` (24), `HuntingHorror01`…`HuntingHorror24` (21), `IcePrisoner01`…`IcePrisoner24` (24), `Lloigor01`…`Lloigor24` (24), `Maniac01`…`Maniac24` (24), `MiGo01`…`MiGo24` (24), `Nightgaunt01`…`Nightgaunt24` (22), `ObsessiveExplorer01`…`ObsessiveExplorer15` (15), `Penguin01`, `PriestOfDagon01`…`PriestOfDagon24` (24), `Riot02`…`Riot24` (22), `SerpentPerson01`…`SerpentPerson24` (24), `Shoggoth01`…`Shoggoth24` (24), `Skeleton01`…`Skeleton24` (24), `SmartExplorer01`…`SmartExplorer15` (15), `SphynxGuardian01`…`SphynxGuardian24` (24), `StarSpawn01`…`StarSpawn24` (23), `StarVampire01`…`StarVampire24` (24), `TempleGuardian01`…`TempleGuardian24` (24), `Thrall01`…`Thrall24` (24), `Warlock01`…`Warlock24` (24), `Witch01`…`Witch24` (23), `Wizard01`…`Wizard24` (24), `Wraith01`…`Wraith24` (24), `Yithian01`…`Yithian15` (15), `Zombie01`…`Zombie24` (24)
