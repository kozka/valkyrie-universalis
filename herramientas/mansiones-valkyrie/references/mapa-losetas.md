# Mapa: coordenadas, losetas y colocación de fichas

Cómo colocar losetas, fichas y monstruos en Valkyrie sin que queden descolocadas. Todo verificado
en `Quest.cs` (dibujo de losetas y fichas) y comprobado con los escenarios publicados.

## 1. Sistema de coordenadas

- La unidad es el "cuadrado" de Descent: **1 espacio de MoM = 3,5 unidades** (1024 px de arte).
- **x crece hacia la derecha (este) e y crece hacia ARRIBA (norte)**, como en matemáticas.
  Hacia abajo en la pantalla las y son negativas.
- El editor ajusta (snap) las losetas a múltiplos de **3,5** y los objetos a múltiplos de **1,75**
  (centro o borde de un espacio). En el `.ini` se puede escribir cualquier posición y Valkyrie la
  respeta (una loseta desplazada medio espacio, 1,75, es válida y a veces necesaria con bordes
  abiertos), pero en el editor no se podrá arrastrar a ese sitio. `mapa.py --colocar` marca esos
  candidatos como "media rejilla".

## 2. Losetas

Una loseta en `(xposition, yposition)` con `rotation=0` tiene su **esquina superior izquierda** en ese
punto y ocupa `[x, x+W] × [y−H, y]`. `rotation` la gira en sentido **antihorario** alrededor de esa
misma esquina:

| rotation | Rectángulo que ocupa (W = ancho, H = alto a rotación 0) |
|---|---|
| 0 | x ∈ [x, x+W], y ∈ [y−H, y] |
| 90 | x ∈ [x, x+H], y ∈ [y, y+W] |
| 180 | x ∈ [x−W, x], y ∈ [y, y+H] |
| 270 | x ∈ [x−H, x], y ∈ [y−W, y] |

Tamaños (a rotación 0, ver `catalogo.md`):

| Rasgo de la loseta | Tamaño | Espacios |
|---|---|---|
| `small` | 7 × 3,5 | 2 × 1 |
| `medium` | 7 × 7 | 2 × 2 |
| `big` | 10,5 × 7 | 3 × 2 |

Las losetas con **`customImage`** (imagen propia del escenario, formato 21) se colocan distinto: la
imagen se **centra** en `(xposition, yposition)` y mide `ancho_px / 292,57 × alto_px / 292,57`
unidades (292,57 = 1024/3,5 px por unidad en escritorio). Si llevan `top`/`left`, esos píxeles de la
imagen son los que caen en el punto (como el borde de las losetas oficiales). También giran en
sentido antihorario alrededor del punto. Ojo: en Android Valkyrie usa 512/3,5 px por unidad, así que
allí las imágenes propias de losetas, fichas con `tokensize=Original` y MPlace se ven al doble de
tamaño; si importa, prueba en Android.

Ejemplo real (*Exotic Material*): `TileTownSquare` en (0,0) ocupa x 0..7, y −7..0;
`TileStorefront` (7×7) en (7,0) con rotation=180 ocupa x 0..7, y 0..7 (queda al norte); su puerta
sur cae en (5,25 ; 0), y ahí está la ficha `TokenExploreShop`.

### Aberturas (puertas y bordes abiertos)

`assets/geometria_losetas.json` tiene, para las 174 caras de 2ª edición, las aberturas de cada lado a
rotación 0 (`P` = puerta de ~1 unidad, `A` = borde abierto de calle o jardín). En N y S se miden desde
el extremo oeste; en E y O desde el extremo norte. Las losetas de 1ª edición (kit de conversión) no
tienen estos datos: solo se conoce su tamaño.

Paso de un punto de la loseta a coordenadas del mundo: en coordenadas locales (u, v) la loseta
ocupa u ∈ [0, W], v ∈ [−H, 0]; un punto del lado N está en (d, 0), del S en (d, −H), del O en
(0, −d), del E en (W, −d). Se gira (u, v) por `rotation` en sentido antihorario y se suma
(xposition, yposition).

**No hagas estas cuentas a mano**: usa el script.

```bash
python scripts/mapa.py --info TileSideKitchen          # tamaño y aberturas de una cara
python scripts/mapa.py MiEscenario                       # informe: dónde está cada loseta, solapes,
                                                         # puertas y a qué llevan, fichas fuera
python scripts/mapa.py MiEscenario --png mapa.png        # dibujo esquemático para revisar
python scripts/mapa.py MiEscenario --colocar TileSideKitchen --junto-a TileVestibulo --lado E
                                                         # xposition/yposition/rotation candidatos
```

## 3. Fichas, monstruos y eventos

- Se **centran** en su posición. Las fichas estándar miden 1×1 unidad.
- **Búsqueda / Interacción / personajes**: dentro de una zona, nunca en una pared ni pisando la
  línea entre dos zonas. Mejor aún: la Búsqueda encima del dibujo que representa (un escritorio, un
  cadáver) y la persona en el centro libre de su zona, sin tapar otra ficha. `losetas.py colocar`
  da esos puntos ya girados (sección 6).
- **Exploración**: en el centro de la puerta que lleva a la zona sin revelar (el informe de
  `mapa.py` da ese punto como "puerta … → fuera del mapa"). En un **borde abierto** (calles,
  muelles, jardines), en el centro del lado de un espacio de ese borde: el informe lo propone
  ("Exploración en (x,y)").
- **Paredes y puertas** (`TokenWallInside`, `TokenDoorInside`…): sobre el borde; `rotation=0` en
  bordes horizontales (N/S) y `rotation=90` en verticales (E/O). Úsalas para cerrar puertas que dan
  a la nada o a otra loseta con la que no deban comunicar.
- **TokenInvestigators**: marca dónde empiezan los investigadores; se añade y se retira con un
  evento silencioso (patrón en `patrones.md`).
- **Spawn**: la posición es donde se dibuja la miniatura del monstruo (centro del espacio).
- **Eventos con posición**: al dispararse la cámara va ahí. Pon el evento que dice "Coloca la loseta"
  sobre la loseta y el que dice "Coloca una ficha" sobre la ficha.

## 4. Planificar el mapa físico

- Cada loseta física tiene dos caras (`reverse` en el catálogo): **no uses las dos caras en la misma
  partida** salvo que una se retire antes de que aparezca la otra.
- Hay pocas fichas de pared y puerta en la caja (8 paredes y 4 puertas en el base): evita mapas que
  necesiten muchas para tapar puertas que dan a paredes.
- Empieza con 1-3 losetas visibles y revela el resto con fichas de Exploración.
- El tamaño del mapa debe ir con la duración: 4-6 losetas para 60-90 min, 6-8 para 90-120 y 8-12
  para 2-3 horas (`diseno-escenarios.md` §5); más alarga la partida sin aportar (crítica habitual a
  los escenarios de la comunidad).
- Las losetas exteriores (muelles, calles, jardines) tienen bordes abiertos en varios lados. Las
  zonas de `losetas.py ver` dicen qué hay en cada parte (agua, valla, orilla) y qué salidas del borde
  dan a cada zona; aun así, mira el arte en Valkyrie y tapa con fichas de pared lo que no deba
  cruzarse. Para puertas y bordes manda la geometría (`mapa.py --info`); si al probar no coincide
  con el arte, corrígelo a mano.
- Si usas losetas de expansiones, declara la expansión en `packs=`.
- Limita la cámara con eventos `mincam`/`maxcam` si el mapa es grande.

## 5. Flujo recomendado al construir el mapa

1. Coloca la primera loseta en (0,0).
2. Para cada loseta nueva, `mapa.py --colocar …` y elige un candidato "OK" (sin solapes).
3. `mapa.py MiEscenario` → pon las fichas de Exploración en los centros de puerta "→ fuera del mapa" y
   paredes en las puertas que no deban usarse.
4. `mapa.py MiEscenario --png mapa.png` y míralo.
5. Coloca Búsquedas, personas y monstruos con `losetas.py colocar` y revisa con `losetas.py donde` y
   `mapa.py MiEscenario --png mapa.png --zonas`.
6. `validar.py` avisa de solapes, fichas fuera de losetas o metidas en una pared y caras de loseta
   usadas a la vez.

## 6. Zonas y objetos dibujados en cada loseta

`assets/contenido_losetas.json` (de ValkyrieMCP, licencia MIT, anotado a mano sobre el arte, con
traducción al español) describe las 174 caras de 2ª edición:

- `desc` / `desc_es`: qué se ve en la loseta.
- `roomTypes` y `tags`: tipo de sala (cocina, cripta, muelle…) y ambiente (oscuro, lujoso, agua…).
- `spaces`: zonas de movimiento. Cada una con `label`/`label_es`, `outline` (polígono), `anchor`
  (mejor punto libre para una ficha), `spots` (más puntos libres), `links` (con qué zona comunica:
  `line` = línea blanca, paso libre; `door` = puerta interior; `barrier` = línea de color, mira las
  reglas) y `openings` (qué aberturas del borde, de `geometria_losetas.json`, dan a esa zona).
- `features`: objetos dibujados, con `kind` (vocabulario controlado: `bookcase`, `fireplace`,
  `altar`…, nombres en español en `vocabulario.tipos`), `label`/`label_es`, zona (`space`),
  posición `at`, caja `box` y `affords` (pista de uso: registrar, interactuar, esconderse, trepar,
  iluminar).

**Coordenadas locales**: unidades de tablero en la cara **sin girar**, x hacia el este desde el
borde oeste e **y hacia el sur** desde el borde norte; el origen es el punto `xposition/yposition` de
la loseta. Al tablero: `(u, v) = (lx, −ly)`, se gira (u, v) por `rotation` en sentido antihorario y se
suma `(xposition, yposition)`. Comprobado con las 7.889 fichas de los 168 escenarios publicados que
caen en losetas anotadas: el 97 % cae dentro de una zona en las cuatro rotaciones (con el giro al
revés, 0 % a 90° y 270°), y dos tercios de las Búsquedas están encima de un objeto anotado.

```bash
python scripts/losetas.py ver TileSideKitchen                  # zonas, salidas, objetos y usos
python scripts/losetas.py buscar bañera                        # caras que la tienen (español o inglés)
python scripts/losetas.py buscar biblioteca chimenea --pack MoMBase
python scripts/losetas.py colocar MiEscenario Tile_cocina:fogón   # xposition/yposition sobre el objeto
python scripts/losetas.py colocar MiEscenario Tile_cocina:s2 --n 3   # 3 puntos libres en la zona s2
python scripts/losetas.py donde MiEscenario                    # zona y objeto de cada ficha
python scripts/losetas.py punto MiEscenario 8.75 -1.75         # qué hay en ese punto
python scripts/mapa.py MiEscenario --png mapa.png --zonas      # dibujo con zonas y objetos
```

Lo dibujado orienta, no limita: la historia puede convertir un armario en la entrada de un pasadizo.
Las losetas de 1ª edición y las de `customImage` no tienen zonas.
