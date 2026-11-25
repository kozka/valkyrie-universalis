# Herramientas

Necesitan Python 3; en Windows se llama con `py -3`, y en Linux o Mac con `python3`. Sirven de segunda opinión mientras Universalis no tenga las suyas.

| Herramienta | Qué hace | Ejemplo (Windows) |
| --- | --- | --- |
| `mansiones-valkyrie/scripts/validar.py` | Revisa un escenario de Mansiones (referencias rotas, eventos inalcanzables, losetas solapadas…) | `py -3 herramientas\mansiones-valkyrie\scripts\validar.py ruta\al\escenario` |
| `mansiones-valkyrie/scripts/mapa.py` | Informe del mapa de un escenario, o su dibujo con las zonas (necesita Pillow) | `py -3 herramientas\mansiones-valkyrie\scripts\mapa.py ruta\al\escenario --png mapa.png --zonas` |
| `mansiones-valkyrie/scripts/losetas.py` | Qué hay dibujado en cada loseta y dónde cae cada ficha | `py -3 herramientas\mansiones-valkyrie\scripts\losetas.py ver TileSideKitchen` |
| `mansiones-valkyrie/scripts/universalis/partida_mesa.ts` | Juega un escenario como una mesa (posiciones, 2 acciones, dados, Horror) con 2, 3 y 4 investigadores; con `espacios_mesa.py` (grafo del mapa) y `resumen_partidas.py` (tabla comparativa). Guía: `mansiones-valkyrie/references/partida-de-mesa.md` | `node herramientas/mansiones-valkyrie/scripts/universalis/partida_mesa.ts` con `KIT=. QDIR=… GRAFO=grafo.json PERFIL=mi_perfil.ts NH=3 STRAT=N SEED=1` |
| `descent-valkyrie/scripts/validar.py` | Revisa una aventura de Descent o una campaña entera, también las de DooM (referencias rotas, grupos que no se dibujan, eventos inalcanzables, moral, tienda, fama, piezas solapadas…) | `py -3 herramientas\descent-valkyrie\scripts\validar.py ruta\al\escenario` |
| `descent-valkyrie/scripts/mapa.py` | Mapa de una aventura de Descent o de DooM: casillas de cada pieza, salidas, puertas, fichas y lugares de monstruos, o su dibujo (necesita Pillow) | `py -3 herramientas\descent-valkyrie\scripts\mapa.py ruta\al\escenario --png mapa.png` |
| `descent-valkyrie/scripts/buscar.py` | Busca en el catálogo de Descent: piezas, monstruos, activaciones, héroes, clases, objetos, fichas… | `py -3 herramientas\descent-valkyrie\scripts\buscar.py --tipo monstruos --rasgo cave` |
| `descent-valkyrie/scripts/nombres_oficiales.py` | Saca de la importación de Road to Legend los nombres oficiales en español de monstruos, héroes, clases y objetos, para el catálogo; solo los nombres (se ejecuta en el PC que tiene la importación) | `py -3 herramientas\descent-valkyrie\scripts\nombres_oficiales.py %APPDATA%\Valkyrie\D2E\import --salida nombres_oficiales.json` |
| `doom-valkyrie/scripts/nueva_mision.py` | Esqueleto de misión para el pack DooM, validado al crearlo | `py -3 herramientas\doom-valkyrie\scripts\nueva_mision.py MiMision --titulo "Laboratorio 3" --destino ruta` |
| `guia-escenarios/actualizar.py` | Refresca la guía de escenarios de Mansiones (`packages/app/src/guide/MoM.json`) desde la tienda y los paquetes de `referencias/`, conserva lo escrito a mano y lista los escenarios nuevos (ver `docs/guia-escenarios.md`) | `py -3 herramientas\guia-escenarios\actualizar.py` |
| `guia-escenarios/excel.py` | Pasa la guía a un Excel para que la revise alguien que conozca los escenarios, y vuelve a leer lo que corrija (necesita openpyxl) | `py -3 herramientas\guia-escenarios\excel.py exportar` / `importar ruta\al\excel.xlsx` |
| `analizar_corpus.py` | Cuenta las rarezas de una carpeta de `.valkyrie`, recorriendo todas las aventuras de cada paquete (codificación, finales de línea, rutas, mayúsculas, medios que faltan, tamaños de imagen) | `py -3 -I herramientas\analizar_corpus.py referencias\descargas\MoM\escenarios datos\corpus-mom.json datos\tamanos-mom.tsv` |

`mansiones-valkyrie/` es una copia de la versión 1.8.1 del plugin. Su `SKILL.md` y sus `references/` explican las reglas del juego y el formato de Valkyrie. Su catálogo (`assets/catalogo.json` y `references/catalogo.md`), con el pack de la comunidad TLE, se rehace con `py -3 herramientas\mansiones-valkyrie\scripts\construir_catalogo.py referencias\valkyrie --packs referencias\descargas\MoM\packs`.

Sus datos de losetas (`assets/geometria_losetas.json` y `assets/contenido_losetas.json`) vienen de ValkyrieMCP, con licencia MIT; las traducciones son nuestras. Más detalle en `LICENCIAS.md`.

`descent-valkyrie/` y `doom-valkyrie/` son las dos skills de la versión 1.3.1 del plugin descent-doom-valkyrie, y van juntas: la de DooM usa los scripts de la de Descent. Sus `SKILL.md` y sus `references/` explican las reglas de Descent 2ª edición, de *Camino a la leyenda* y de DOOM (2016), y el formato de Valkyrie para Descent; traen una campaña y una misión de ejemplo. Sus datos salen de Valkyrie (Apache-2.0) y de los escenarios publicados; detalle en sus `LICENCIAS.md`.

Para que el catálogo de Descent use los nombres oficiales en español, en el PC con la importación de Road to Legend:

```
py -3 herramientas\descent-valkyrie\scripts\nombres_oficiales.py %APPDATA%\Valkyrie\D2E\import --salida nombres_oficiales.json
py -3 herramientas\descent-valkyrie\scripts\construir_catalogo.py referencias\valkyrie --packs referencias\descargas\D2E\packs --nombres nombres_oficiales.json
```

El segundo reescribe `assets/catalogo.json` y `references/catalogo.md` de la skill; `nombres_oficiales.json` solo lleva nombres y solo hace falta para regenerar el catálogo.
