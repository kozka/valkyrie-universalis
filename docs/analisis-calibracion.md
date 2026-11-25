# Calibración del análisis de escenarios

A 8 de noviembre de 2026. El análisis del editor (`packages/app/src/editor/analysis/`) juega un escenario de Mansiones con investigadores inventados. Para saber cuánto se parece a una mesa de verdad, se compara con las cifras que la lista de la tienda de Valkyrie trae de cada escenario: partidas jugadas (`play_count`), minutos de media (`duration`) y parte de victorias (`win_ratio`).

## Cómo se repite

1. En el PC, con `referencias/descargas` y `referencias/valkyrie-store`: `node tools/analysis-calibration-data.mjs <carpeta>` (por defecto, los escenarios con 40 partidas o más; `--games N` cambia el mínimo). Escribe en la carpeta los `.ini` y `.txt` de cada escenario y `stats.tsv`.
2. `CALIB=<carpeta> npx vitest run analysis-calibration` (con `CALIB_RUNS=10` partidas por número de investigadores, unos 2 minutos para los 127). Imprime una línea por escenario y deja `calibration.json` en la carpeta: minutos de verdad, simulados y estimados, victorias de verdad, y cómo acabaron las simuladas (`end`, `eliminated`, `stuck`, `rounds`), con dónde se paró el camino al final.

## Resultados con 127 escenarios

| | Antes | Ahora | Jugadores |
| --- | --- | --- | --- |
| Partidas que acaban | 34 % | 58 % | 76 % ganadas |
| Eliminados | 26 % | 12 % | |
| Atascadas | 26 % | 17 % | |
| Sin acabar tras el límite de rondas | 12 % | 11 % | |
| *La bruma maldita 1*, victorias | 57 % | 95 % | 94 % |

Las partidas que acaban incluyen las derrotas por tiempo, que el análisis no sabe distinguir de una victoria (las dos ponen `$end`).

## La duración

| Qué predice los minutos de verdad | Dos de cada tres, dentro de | A menos del 25 % |
| --- | --- | --- |
| La duración que pone el autor (media de mínimo y máximo) | ×1,26 | 70 % |
| Palabras del escenario + minutos simulados (lo que enseña el editor) | ×1,32 | 58 % |
| Las palabras solas | ×1,43 | 50 % |
| Los minutos simulados solos | ×1,45 | 43 % |

La estimación es `ln(minutos) = 0,26 ln(1 + palabras) + 0,19 ln(1 + minutos simulados) + 1,59` (`ESTIMATE` en `analyze.ts`; validación dejando cada escenario fuera: ×1,34). Las palabras son las de todos los textos del escenario en su idioma. Si el simulador cambia mucho, hay que volver a ajustarla con la calibración.

## Lo que falta

- La mesa simulada juega más rondas que una de verdad (unas 20–30 donde una mesa juega 10–15): sus rondas no predicen nada.
- Escenarios que aún no acaba: contadores que se suben con varios intentos (forzar una puerta), llaves que no consigue, límites de tiempo del propio escenario, historias por capítulos.
