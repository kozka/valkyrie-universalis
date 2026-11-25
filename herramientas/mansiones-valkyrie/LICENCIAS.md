# Licencias y créditos

## Contenido propio de la skill

Las instrucciones (`SKILL.md`, `references/*.md`), los scripts de `scripts/` y el escenario de
ejemplo `assets/ejemplo/LaCasaDelRelojero` se han escrito para esta skill. Las reglas del juego
están **parafraseadas** a partir del material oficial y de la comunidad (fuentes al final de cada
referencia); no reproducen el reglamento.

*Las Mansiones de la Locura* / *Mansions of Madness* es una marca de Fantasy Flight Games. Esta
skill no está afiliada ni respaldada por Fantasy Flight Games, Edge Entertainment ni Asmodee.
Valkyrie importa los gráficos y textos oficiales de la app que el jugador tiene instalada; esta
skill no incluye ninguno.

## Datos derivados de Valkyrie (Apache License 2.0)

`assets/catalogo.json` y `references/catalogo.md` se generan con `scripts/construir_catalogo.py` a
partir de los ficheros de contenido del repositorio de Valkyrie
(https://github.com/NPBruce/valkyrie, `unity/Assets/StreamingAssets/content/MoM`): identificadores,
rasgos y estadísticas de componentes. La especificación de `references/formato-escenario.md` se ha
comprobado leyendo su código fuente.

Valkyrie GM — Copyright 2016 Nathan Parslow. Licencia Apache 2.0:
http://www.apache.org/licenses/LICENSE-2.0

## Geometría y contenido de losetas de ValkyrieMCP (MIT)

`assets/geometria_losetas.json` (tamaños y aberturas de las 174 caras de loseta de 2ª edición) y
`assets/contenido_losetas.json` (zonas de movimiento, objetos dibujados y descripción de cada cara,
de `src/catalogs/data/tile-content.ts` y `feature-vocabulary.ts`, versión 2.6.0) proceden del
proyecto ValkyrieMCP (https://github.com/thijs-hakkenberg/ValkyrieMCP). Las traducciones al español
(campos `*_es` y el vocabulario en español) se han añadido para esta skill; `scripts/losetas.py`,
`scripts/construir_losetas.py` y los cambios de `scripts/mapa.py` son propios, aunque las fórmulas de
paso de coordenadas siguen las de ValkyrieMCP (`src/map/layout.ts`). Licencia de ValkyrieMCP:

```
MIT License

Copyright (c) 2025 thijs-hakkenberg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Comunidad

Gracias a la comunidad de Valkyrie: la guía "Valkyrie MoM Tutorial" de scrubbless (y su
traducción al español de EtiCarasoft), la wiki del proyecto, los autores y traductores hispanos
(vidimus, ZombieJuanma, DaniMassaro, xehnlp y muchos más) y las reseñas de BoardGameGeek, de las que
salen los consejos de diseño de `references/diseno-escenarios.md`.
