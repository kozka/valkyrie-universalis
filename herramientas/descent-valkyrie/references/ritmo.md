# Hoja de ritmo y decisiones en Descent

Antes de escribir eventos, una tabla dice qué pasa en cada ronda: qué objetivo avanza, qué presión
pone el señor oscuro (la app), qué decisión tienen los héroes y quién está ocupado. Va en el
documento de diseño (`diseno-escenarios.md` §2) y se comprueba al terminar.

## 1. Las reglas del ritmo en Descent

1. **Cada activación de un héroe importa.** En cada turno, cada héroe tiene algo que hacer que no
   sea andar: un grupo al alcance, una búsqueda, un objetivo, un aldeano, una puerta. Dos turnos
   seguidos solo moviéndose es tiempo muerto.
2. **Entre 2 y 3 hilos a la vez**: el objetivo principal, la presión (amenaza, refuerzos, un límite
   de rondas) y, si cabe, uno secundario (un aldeano que rescatar, un tesoro, un rival).
3. **Escalones**: exploración (rondas 1-3), giro (4-6: el jefe, un objetivo nuevo, una puerta que
   cambia el mapa), clímax (6-10). Un respiro corto antes del giro: una sala sin monstruos con algo
   que leer o decidir.
4. **Presión que se ve**: la amenaza sube cada ronda y los peligros llegan en escalones conocidos
   (`patrones.md`); avisa antes del límite de rondas y de los refuerzos grandes.
5. **El mapa se revela con sentido**: cada puerta abre algo que cambia la situación (un grupo nuevo,
   una ficha de objetivo, terreno), no solo más pasillo.

## 2. La plantilla

```markdown
| Ronda | Objetivo (qué avanza) | Presión (amenaza, refuerzos, peligros) | Decisión | Hilos | Quién está ocupado (2 y 4 héroes) |
|---|---|---|---|---|---|
| 1 | Entrada, primer grupo, puerta norte | Amenaza 1 | ¿Norte o sótano? | Objetivo, Presión | Todos en combate |
```

Ejemplo de 60-90 minutos (6-8 rondas, 2-4 héroes):

| Ronda | Objetivo | Presión | Decisión | Ocupados |
|---|---|---|---|---|
| 1-2 | Primer grupo; dos puertas | Amenaza baja | ¿Por dónde? | Todos |
| 3 | Sala con aldeano y búsqueda | Primer peligro | ¿Escoltar al aldeano o seguir? | Uno escolta, el resto avanza |
| 4 | **Giro**: el aldeano revela dónde está el jefe; objetivo actualizado | Refuerzos | — | Todos |
| 5-6 | Jefe y su escolta; ficha de objetivo | Peligros | ¿Matar al jefe o cerrar el portal? | Dos frentes |
| 7-8 | Clímax | Límite de rondas | — | Todos |

## 3. Decisiones que pesan

Valkyrie permite preguntas con consecuencias que el juego de mesa no tiene: úsalas.

- **Dentro de la aventura**: rescatar o seguir, aceptar el trato del lugarteniente, abrir la puerta
  sellada. Cada opción cambia algo visible (un grupo más o menos, un objeto, una regla en
  Información). Botones con su consecuencia y una bandera:

```ini
[EventTratoLugarteniente]
buttons=2
event1=EventTratoAceptado
event2=EventTratoRechazado

[EventTratoAceptado]
buttons=1
event1=
operations=%tratoAceptado,=,1
```
- **En campaña**: las variables `%` pasan a las aventuras siguientes (`patrones.md`, campañas). Que
  la consecuencia se note después: un texto que la nombra, un grupo distinto, otra recompensa.
- **Las dos opciones tienen que tentar**; si una es mejor, no es una decisión.
- Una decisión cada 2-3 rondas como mucho; en Descent manda el combate, pero una elección bien
  puesta es lo que la mesa recuerda.

## 4. Desafío justo

- Escala con el número de héroes (casillas para 2, 3 y 4 héroes en cada grupo, vida adicional del
  jefe) y prueba con 2 y con 4.
- Avisa antes de lo irreversible («Si cruzáis el puente, no podréis volver»).
- Un objetivo que se pueda perder tiene otra forma de conseguirse (otra ficha, más coste).
- El objetivo se entiende al empezar y cuando cambia («Objetivo actualizado»).

## 5. Cómo se comprueba

Recorriendo la aventura como una mesa, con `grafo.py` y `mapa.py --png` delante, ronda a ronda con 2
y con 4 héroes: qué abre cada puerta, quién tiene algo que hacer, cuándo llega el giro, si el clímax
cae antes del límite. La rúbrica de `revision.md` puntúa el resultado.
