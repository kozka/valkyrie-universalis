# Licencias y créditos

## Contenido propio de la skill

Las instrucciones (`SKILL.md`, `references/*.md`), los scripts de `scripts/` y la campaña de ejemplo
`assets/ejemplo/LaCampanaDeVadoscuro` (textos, mapa, monstruos propios y portada, que es un dibujo hecho para
ella) se han escrito para esta skill. Las reglas del juego están **parafraseadas** a partir del material
oficial y de la comunidad (fuentes al final de cada referencia); no reproducen reglamentos, cartas ni textos de
la app.

*Descent: Viaje a las Tinieblas* / *Descent: Journeys in the Dark* y *Road to Legend* son marcas de Fantasy
Flight Games. *DOOM* es una marca de id Software (ZeniMax / Bethesda). Esta skill no está afiliada ni
respaldada por Fantasy Flight Games, Edge Entertainment, Asmodee, id Software ni Bethesda. Valkyrie importa los
gráficos y textos oficiales de la app *Road to Legend* que el jugador tiene instalada; esta skill no incluye
ninguno, ni imágenes, sonidos o textos de los escenarios y packs de la comunidad.

## Datos derivados de Valkyrie (Apache License 2.0)

`assets/catalogo.json` y `references/catalogo.md` se generan con `scripts/construir_catalogo.py` a partir de
los ficheros de contenido del repositorio de Valkyrie (https://github.com/NPBruce/valkyrie, commit `752d420`,
`unity/Assets/StreamingAssets/content/D2E` y los `content_pack.ini` de los packs de la comunidad): solo
identificadores, rasgos, tamaños, precios, fama y estadísticas de componentes. Los nombres oficiales de
héroes, clases, monstruos y objetos (marcados `es_oficial` en el catálogo) se sacan de la importación de *Road
to Legend* con `scripts/nombres_oficiales.py`, en el ordenador que la tiene, y se usan como identificadores:
ningún otro texto de la importación entra en la skill. Los nombres sin marcar son propuestas de la comunidad o
nuestras. La especificación de `references/formato-escenario.md` se ha comprobado leyendo el código fuente de
Valkyrie.

Valkyrie GM — Copyright 2016 Nathan Parslow. Licencia Apache 2.0:
http://www.apache.org/licenses/LICENSE-2.0

## Casillas y salidas de las piezas (`assets/losetas.json`)

Son hechos medidos, no imágenes:

- **Casillas de cada cara** (`filas`): qué casillas tiene dibujadas cada cara en su rejilla. Las de las piezas
  oficiales salen de los datos esquemáticos que Valkyrie Universalis calcula en el ordenador que tiene la
  importación (solo tamaños y casillas); las de las imágenes propias de Valkyrie y de los packs de la
  comunidad (DooM, D1ED) se calculan con `scripts/construir_losetas.py` mirando qué casillas están dibujadas.
  Ninguna imagen se copia.
- **Salidas** (`salidas`): dónde unen cada cara los escenarios publicados en la tienda de Valkyrie, y cuántos
  paquetes lo hacen (`scripts/construir_salidas.py`). Son posiciones contadas, sin nada de su contenido.

## Escenarios de la comunidad

Las estadísticas y los patrones de `references/diseno-escenarios.md` y `references/patrones.md` salen de
analizar los 59 escenarios de Descent de la tienda de Valkyrie (https://github.com/NPBruce/valkyrie-store):
se cuentan claves, disparadores y estructuras, y los ejemplos son propios. Los nombres de escenarios y autores
de `references/expansiones.md` §24 son solo para identificarlos.

## Comunidad

Gracias a la comunidad de Valkyrie y de Descent: la wiki del proyecto, el *Community Rules Reference Guide* de
descent-community.org, los autores y traductores de los escenarios y packs de la tienda, y los blogs y reseñas
citados en las referencias.
