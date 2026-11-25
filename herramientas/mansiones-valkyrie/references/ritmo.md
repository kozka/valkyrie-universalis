# Hoja de ritmo: qué pasa en cada ronda

Antes de escribir un solo evento, una tabla dice qué encuentra la mesa en cada ronda, qué amenaza
crece, qué decisión tiene delante y qué hilos siguen abiertos. Es lo que separa un escenario que
funciona de uno que se juega del tirón. Va en el documento de diseño (`diseno-escenarios.md` §2) y
se comprueba al terminar (§5).

## Índice

1. [Las cinco reglas del ritmo](#1-las-cinco-reglas-del-ritmo)
2. [Hilos](#2-hilos)
3. [La plantilla](#3-la-plantilla)
4. [Ejemplo: 120 minutos, 2-4 investigadores](#4-ejemplo-120-minutos-2-4-investigadores)
5. [Cómo se comprueba](#5-cómo-se-comprueba)
6. [Señales de alarma](#6-señales-de-alarma)

## 1. Las cinco reglas del ritmo

1. **Un latido cada 3 o 4 acciones.** Cada investigador encuentra algo que le importe (una pista,
   un detalle con historia, una decisión, un susto, un objeto) como mucho cada 3 o 4 acciones; es
   decir, en cada ronda o como mucho cada dos. Una ronda entera andando por pasillos vacíos es la
   queja más repetida. Un vistazo que solo dice "no hay nada" no es un latido: es una acción tirada.
2. **Entre 2 y 4 hilos abiertos a la vez** (§2). Uno solo aburre; cinco confunden. Cada hilo se
   abre, se tensa y se cierra en rondas que la hoja dice.
3. **Subida lenta, respiro, giro, final frenético.** Las primeras rondas, pocas cosas y bien
   contadas; la amenaza crece en escalones; justo antes del giro, una ronda de calma (un diario que
   explica, un personaje que habla); después del giro, todo se acelera y los Mitos aprietan. Es la
   curva más elogiada de las reseñas.
4. **Trabajo para todos.** Si el grupo se separa, cada parte tiene algo que hacer; nadie espera dos
   rondas sin nada. Con 4-5 investigadores hacen falta frentes en paralelo (dos alas de la casa, un
   personaje que hay que convencer mientras otros buscan), no una sola cadena.
5. **Detalles opcionales planificados.** Cosas pequeñas que no hacen falta para ganar pero que
   gustan: un objeto con historia, un personaje que recuerda lo que hicisteis, un guiño a otra
   aventura, una carta que solo entiende quien leyó otra. Se ponen en la hoja como cualquier otra
   cosa; no salen por casualidad. Una o dos por zona bastan.

## 2. Hilos

| Hilo | Qué es | Abre | Se tensa | Se cierra |
|---|---|---|---|---|
| Misterio principal | Lo que hay que averiguar | Prólogo | Cada pista clave | Revelación del objetivo |
| Amenaza que crece | Lo que se acerca (un culto, una criatura, la marea) | Primer síntoma (ronda 1-3) | Mitos propios, apariciones | Clímax |
| Historia secundaria | Un personaje con su propio problema | Al conocerle | Lo que se descubre de él | Su decisión o su final |
| Reloj | Lo que hace que no se pueda esperar | Prólogo o primera pista | Avisos | Derrota por tiempo o victoria |

Un buen giro **cruza dos hilos**: el personaje secundario resulta ser parte de la amenaza, el reloj
no era lo que parecía, la pista principal llevaba a otra parte. Se planta en la primera mitad (un
detalle que no parece importar) y se cobra en la segunda.

## 3. La plantilla

Una fila por ronda prevista con el número típico de investigadores (y una nota de qué cambia con
el mínimo y el máximo). Las rondas de verdad varían; la hoja dice la intención.

```markdown
| Ronda | Se descubre (latidos) | Amenaza | Decisión | Hilos abiertos | Quién está ocupado | Detalle opcional |
|---|---|---|---|---|---|---|
| 1 | Vestíbulo, carta del tío, retrato | Ruido en el sótano (ambientación) | — | Misterio, Reloj | Todos en el vestíbulo | La firma del retrato |
| 2 | … | … | … | … | … | … |
```

- **Se descubre**: lo que la mesa encuentra si juega razonablemente (no todo lo que existe).
- **Amenaza**: Mitos propios, apariciones, avisos; con su escalón (ambientación, menor, mayor).
- **Decisión**: una pregunta al grupo con consecuencias (`desafios.md` §3). No hace falta en todas
  las rondas; sí al menos una cada 2-3.
- **Quién está ocupado**: con 2 y con 4 investigadores; si alguien no tiene nada, se nota aquí.

## 4. Ejemplo: 120 minutos, 2-4 investigadores

Unas 10-12 rondas (en la tienda, una ronda de verdad dura unos 10-15 minutos con lectura y Mitos).

| Ronda | Se descubre | Amenaza | Decisión | Hilos | Ocupados |
|---|---|---|---|---|---|
| 1 | Prólogo; vestíbulo y dos puertas; el ama de llaves | Ambientación | ¿Abrir el estudio o subir? | Misterio, Reloj | Todos |
| 2 | Estudio: diario (pista 1); escalera | Ambientación | — | +Secundaria (el ama) | Dos frentes |
| 3 | Dormitorio: foto (detalle plantado); sótano cerrado | Menores | ¿Mentir al ama? | 3 | Dos frentes |
| 4 | Llave; sótano: primer monstruo débil | Menores | — | 3 | Uno lucha, otro busca |
| 5 | Pista 2 y 3; el ama confiesa o calla | Menores | ¿Confiar en ella? | 3 | Todos |
| 6 | **Respiro**: el diario completo explica la verdad a medias | — | — | 3 | Lectura en común |
| 7 | **Giro**: la foto era la clave; objetivo revelado | Mayores | ¿Salvar al ama o seguir? | Amenaza, Reloj | Todos |
| 8-10 | Tarea final en dos sitios a la vez | Mayores, apariciones | Sacrificio | 2 | Dos frentes |
| 11 | Clímax | Mortales si se alarga | — | 1 | Todos |

## 5. Cómo se comprueba

1. **Al diseñar**: rellena la hoja antes de los ficheros. Si una fila no tiene latido para alguien,
   añade algo o quita espacio de mapa.
2. **Al terminar, recorriendo el escenario como una mesa** (el razonamiento manda): sigue el grafo
   (`grafo.py`) ronda a ronda, con 2 y con 4 investigadores, y anota en la hoja lo que de verdad se
   encuentra en cada una. Mira sobre todo las rondas sin latido, quién espera, si el giro llega
   antes de los Mitos mortales y si la decisión prometida existe en un botón.
3. **Como ayuda mecánica**, si el autor usa Valkyrie Universalis: su editor tiene la pestaña
   «Análisis», que juega el escenario muchas veces y saca una hoja de ritmo simulada (lo que se
   encuentra de media por ronda, quién se queda sin nada, el latido medio y el tramo más largo sin
   nada). Es mecánica: no lee los textos ni sabe qué botón «es el bueno», así que sus rondas no son
   las de una mesa (juega más) y su duración es orientativa. Sirve para ver tramos muertos,
   caminos que nunca se recorren y dónde se atasca; la última palabra es del recorrido razonado y
   de las partidas de prueba.

## 6. Señales de alarma

- Dos rondas seguidas sin nada nuevo para la mayoría de las mesas.
- Un investigador que pasa 8 o más acciones seguidas sin encontrar nada (típico con 5 jugadores y
  una sola cadena de pistas).
- La revelación del objetivo después de la mitad de la duración prevista.
- Un hilo que se abre y nunca se cierra, o que se cierra fuera de la vista (en un epílogo).
- Ninguna decisión en todo el escenario: los datos de la tienda (`datos-tienda.md`) dicen que los
  mejor valorados ofrecen el doble de elecciones por hora.
- El clímax cae en la ronda de los Mitos mortales o después.
- Algo importante que solo se puede hacer en una ronda y en un sitio (estar con alguien «a las doce»):
  casi nunca se hace. Ábrelo dos o tres rondas antes.
- Con el máximo de jugadores, alguien sin nada que hacer una ronda de cada dos; con el mínimo, la
  última noche sin margen. Compruébalo con la batería de `partida-de-mesa.md` y mira allí (§7) cómo
  dar trabajo al cuarto y aire a la pareja.
