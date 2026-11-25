# Lo que dicen los datos de la tienda

A 8 de noviembre de 2026. La lista de la tienda de Valkyrie (`MoM/manifestDownload.ini` de
valkyrie-store) trae, por escenario, las partidas puntuadas (`play_count`), la nota media de 1 a 10
(`rating`), los minutos medios que dicen los jugadores (`duration`) y la parte de partidas ganadas
(`win_ratio`). Se compararon con lo que tienen dentro los 127 escenarios de Mansiones con 40
partidas o más (contando secciones, palabras, botones, imágenes y sonidos de sus ficheros).

**Son correlaciones, no recetas**: que los mejor valorados tengan más de algo no quiere decir que
añadirlo suba la nota; muchas cosas van juntas (un autor que se esfuerza más hace más de todo). Lo
que se controla por duración (comparando escenarios de igual duración) es más fiable.

## Notas

- Nota mediana 7,5 (de 5,2 a 8,9). El tercio mejor valorado está por encima de 7,7; el peor, por
  debajo de 7,1.

## Lo más claro

| Qué | Mejor valorados (tercio de arriba) | Peor valorados (tercio de abajo) | A igual duración |
|---|---|---|---|
| Duración de verdad | 204 min | 114 min | — |
| Sonidos propios (`audio=` o `music=` a un fichero del escenario) | 19 (6 por hora) | 0 | Sí: la mayor diferencia |
| Imágenes propias en UI | 20 (6 por hora) | 7 (3,6 por hora) | Sí |
| Decisiones (botones que llevan a sitios distintos, sin contar pasar o fallar) | 32 (8,5 por hora) | 6 (3,3 por hora) | Sí |
| Palabras | 11.300 (3.900 por hora) | 4.500 (2.400 por hora) | Sí |
| Eventos | 336 (114 por hora) | 160 (85 por hora) | Sí |

- **Duración y nota**: hasta 90 minutos, nota mediana 6,4; de 90 a 150, 7,0; de 150 a 210, 7,6;
  más de 210, 8,2. Los jugadores de Valkyrie premian las aventuras largas y con mucha historia.
- **Lo que no se nota**: el número de losetas, fichas, objetos, apariciones de monstruos y puzles
  por hora no distingue los mejor de los peor valorados. El tamaño del mapa no es lo que gusta.
- **Los textos largos no restan**: a igual duración, los escenarios con más ventanas de más de 110
  palabras están algo mejor valorados (son los de mucha historia). Aun así, una ventana larga se lee
  peor en el móvil: mejor partirla o pasarla a una UI de diario (`escritura.md` §2).
- **Victorias**: la mitad de los escenarios se ganan más del 82 % de las veces. Los que se ganan
  más del 90 % tienen nota mediana 7,0; los que se ganan entre el 60 y el 90 %, 7,7. Ni muy fácil
  ni imposible: el punto dulce es perder una de cada cuatro o cinco partidas.
- **Duración dicha frente a la de verdad**: los jugadores tardan de mediana 1,15 veces lo que dice
  el autor. La duración que pone un autor que lo ha probado acierta bastante (dos de cada tres
  partidas a menos de ×1,26); un cálculo a partir del escenario, mucho menos.

## Qué hacer con esto

- Pon **sonido e imágenes propios** en los momentos clave (`desafios.md` §7); es lo que más separa,
  a igual duración.
- Ofrece **decisiones de verdad**: una cada 2-3 rondas (`desafios.md` §3).
- No midas la calidad por el tamaño del mapa; mídela por lo que pasa en él (`ritmo.md`).
- Apunta a que se gane entre el 60 y el 90 % de las veces con el número típico de investigadores.
- Prueba la duración y súmale un 15 % al escribirla.

## Cómo se repite

En el proyecto Valkyrie Universalis, `tools/analysis-calibration-data.mjs` saca los escenarios y sus
cifras de la tienda; el cálculo de estas tablas se hizo con un script de Python sobre esa carpeta
(secciones por prefijo, palabras del idioma por defecto sin etiquetas, botones `eventN` distintos y
sin «pasa/falla» en sus etiquetas).
