# Mapa: rejilla, piezas, uniones y colocación

Cómo coloca Valkyrie las piezas, puertas, fichas y monstruos de Descent, y cómo calcular posiciones sin
equivocarse. Todo está comprobado con el código (`Quest.cs` Tile/Door/Token, `TokenBoard.cs`,
`D2EGameType.TileOnGrid`) y con los 295 `quest.ini` publicados: sus piezas casi nunca se pisan (salvo variantes que no están a
la vez) y casi el 80 % de sus uniones son exactamente de 2 casillas, como en la mesa. Las herramientas: `scripts/mapa.py`.

## 1. Sistema de coordenadas

- **Una casilla mide 1.** La casilla (x, y) tiene su centro en el punto (x, y). La **x crece hacia el este** y
  la **y crece hacia el norte** (arriba en pantalla). Todo va en enteros.
- `mapa.py <escenario>` dibuja un mapa de texto con las coordenadas en los bordes, y `--png` un dibujo con las
  piezas, las salidas conocidas (en verde), las puertas, las fichas y las casillas de los monstruos.

## 2. Piezas (Tile)

- Cada cara de pieza (`TileSide1A`…) tiene una **rejilla**: columnas `i` (hacia el este) y filas `j` (hacia
  abajo). Valkyrie ancla la pieza en la **esquina superior izquierda del rectángulo** de su cara, que puede no
  estar dibujada (la primera fila de la 13A es `.####.`). `assets/losetas.json` guarda las casillas dibujadas
  (`filas`, `#` = casilla) y, en `x` e `y`, dónde empiezan respecto a ese ancla; se ven con
  `python scripts/mapa.py --info TileSide9A`.
- Una pieza con `xposition=X`, `yposition=Y` y `rotation=R` pone ese ancla en (X, Y) y gira R grados en
  **sentido antihorario** alrededor de ella. Con R = 0, el rectángulo ocupa X…X+ancho−1 y Y−alto+1…Y. No lo
  calcules a mano: `--info … --en X,Y --rotacion R` y `--colocar` ya cuentan con el ancla y el giro.
- Ver dónde cae una pieza: `python scripts/mapa.py --info TileSide9A --en 3,-2 --rotacion 90` (dibuja sus
  casillas con coordenadas y dónde quedan sus salidas).
- Casillas de una pieza ya colocada (para poner fichas y monstruos): `mapa.py <escenario> --casillas TileX`.
- Las dos caras de una pieza física (`1A` y `1B`) comparten cartón: no las uses a la vez. Hay **una** pieza de
  cada número en la caja; de terminales, extensiones y transiciones hay varias.

### 2.1 Salidas y uniones

En la mesa, las piezas se unen por sus **salidas**: tramos de 2 casillas en el borde, con un corte de puzle.
Valkyrie no guarda dónde está cada salida (está dibujado en la imagen oficial), así que la skill las ha sacado
de dónde las unen los escenarios publicados (`assets/losetas.json` → `salidas`, con cuántos paquetes la usan;
`construir_salidas.py`). Cuantos más paquetes, más fiable; una salida vista en un solo paquete puede ser un
descuido de su autor.

- **Unir salida con salida**: las dos casillas de una salida quedan pegadas a las dos de la otra. Si las piezas
  son anchas, el contacto puede ser más largo (los bordes quedan a ras), pero el paso es la salida.
- `python scripts/mapa.py <escenario> --colocar TileSide9B --junto-a TileAntesala [--lado E]` lista las formas
  de unir la cara nueva a una pieza ya colocada, salida con salida, sin pisar otras piezas, con su
  `xposition`/`yposition`/`rotation` y la **puerta** de esa unión.
- `mapa.py <escenario>` (informe) revisa todas las uniones: si coinciden con salidas conocidas de las dos
  piezas, si hay puerta y qué pieza es un terminal.
- **Terminales** (`TileSideCapA` exterior, `TileSideCapB` interior): cierran una salida que no lleva a ningún
  sitio. Ocupan 2 casillas pegadas a la salida. Toda salida libre de una pieza colocada debería tener uno (o
  una puerta), como en la mesa.
- **Extensiones** (`TileSideExtensionA/B`): pasillo de 1×2 entre dos salidas. **Transiciones**
  (`TileSideTransitionA/B`): de exterior a interior.
- **Entradas** (`TileSideEntranceA/B`, `…StairA/B`, `…SwampA/B`): 2×2 con su salida al norte (sin girar);
  es donde empiezan los héroes. La salida de la aventura suele ser otra entrada.

### 2.2 DooM y 1ª edición

Las piezas de los packs de la comunidad DooM (`TileSideDooM_…`, 100 píxeles por casilla) y D1ED (1ª edición)
van en la misma rejilla y tienen sus casillas en `losetas.json`. Sus salidas se conocen peor (menos
escenarios). Ver la skill `doom-valkyrie` para DooM.

## 3. Puertas

- Una puerta (`DoorX`) es una barra de 2 casillas en el borde entre dos casillas de cada lado:
  - `rotation=0` (vertical): entre las columnas x−1 y x, a lo largo de las filas y e y+1.
  - `rotation=90` (horizontal): entre las filas y e y+1, a lo largo de las columnas x−1 y x.
- Va en una unión de 2 casillas: `mapa.py --colocar` y el informe dan su posición. Ejemplo: entre las casillas
  (5, −1), (5, −2) de una pieza y (6, −1), (6, −2) de la siguiente → `xposition=6`, `yposition=-2`,
  `rotation=0`.

## 4. Fichas y monstruos

- **Fichas** (`TokenX`): se centran en su casilla. Con `tokensize`, ocupan como un monstruo de ese tamaño
  (abajo).
- **Casillas de monstruos** (`MPlaceX`): la figura ocupa su casilla y, según el tamaño del monstruo:
  `small` 1×1; `medium` (x, y) y (x+1, y); `huge` x…x+1 × y−1…y; `massive` x…x+2 × y−1…y (hacia el este y
  hacia el sur). Con `rotate=true` gira hacia el oeste: `medium` x × y−1…y; `huge` x−1…x × y−1…y; `massive`
  x−1…x × y−2…y.
- Un grupo **sin** casillas para ese número de héroes: Valkyrie marca su zona con un círculo en la posición
  del Spawn. Un Spawn sin `xposition`/`yposition`, o con `display=false`, no marca nada: ni casillas ni zona.
- **Eventos con posición**: la cámara va allí; con `highlight=true`, una diana en esa casilla.
- `validar.py` avisa de fichas, puertas y figuras fuera de las piezas, figuras que se pisan y piezas que se
  solapan (vale si no están a la vez en el tablero).

## 5. Planificar el mapa físico

- El mapa de Valkyrie es una **guía para montar el de la mesa**: usa solo uniones que se puedan hacer con las
  piezas (salida con salida) y no más piezas de un número de las que hay.
- Cuenta lo que hace falta para cada aventura: piezas por número, terminales, extensiones, puertas (7 en la
  caja básica), fichas de Búsqueda (9), de Objetivo (10) y de Aldeano (8), y figuras por tipo (los límites de
  grupo están en las cartas). El evento «Preparación» dice qué apartar.
- Terreno: agua, fosos, lava, obstáculos… están dibujados en las piezas (rasgos `water`, `pit`, `lava` en el
  catálogo) y los aplican los jugadores (`reglas-descent.md` §6.6).
- Interior y exterior: los rasgos `inside`/`outside` de cada cara; una transición entre ambos.

## 6. Flujo recomendado

1. Elige la primera pieza (`buscar.py --tipo losetas --rasgo inside`) y ponla en (0, 0), sin girar.
2. Une la Entrada a una de sus salidas: `mapa.py <esc> --colocar TileSideEntranceB --junto-a TileSala --lado S`.
3. Une cada pieza nueva con `--colocar`; copia su `xposition`/`yposition`/`rotation` y la puerta de la unión.
4. Cierra las salidas libres con terminales (`--colocar TileSideCapB --junto-a … --lado …`).
5. Coloca fichas y casillas de monstruos con `--casillas TileX` (las casillas de cada pieza con coordenadas).
6. Revisa: `mapa.py <esc>` (uniones, puertas, fuera de piezas) y `mapa.py <esc> --png mapa.png` (míralo).
7. `validar.py`.
