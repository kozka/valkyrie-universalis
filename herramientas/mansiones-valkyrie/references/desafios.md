# Enigmas, amenaza y decisiones

Qué hace que un desafío sea inteligente y que el jugador se sienta dentro de la historia, y cómo se
monta en Valkyrie. Cada escenario elige dónde pone el peso (un estilo, `escritura.md` §5); no hace
falta todo en todos. Las piezas técnicas básicas (banderas, contadores, concentradores, tiradas,
Mitos) están en `patrones.md`; aquí se combinan.

## Índice

1. [Enigmas que se piensan](#1-enigmas-que-se-piensan)
2. [Una amenaza que caza](#2-una-amenaza-que-caza)
3. [Decisiones que pesan](#3-decisiones-que-pesan)
4. [Responder como personaje](#4-responder-como-personaje)
5. [Desafío justo](#5-desafío-justo)
6. [Plantar y cobrar: el giro](#6-plantar-y-cobrar-el-giro)
7. [El efecto «¡oh!»](#7-el-efecto-oh)

## 1. Enigmas que se piensan

**La respuesta está en lo que los jugadores han leído o visto**, nunca en adivinar ni en saber algo
de fuera. Un buen enigma cumple tres cosas:

- **Se resuelve con la cabeza, no con los dados**: la tirada, si la hay, da una ayuda o tiempo; la
  solución la ponen ellos.
- **Cuenta la historia**: la combinación es la fecha de la muerte de la hija; el orden de los
  cuadros es el orden de los crímenes. Si un enigma no cuenta nada, sobra.
- **Tiene dos pistas por camino distinto** (`diseno-escenarios.md` §1) y un fallo que cuesta, no
  que bloquea: Horror, tiempo, un monstruo; nunca la partida.

**Receta: la respuesta elegida entre varias.** Un evento con una opción por respuesta posible; la
buena sigue, las malas cuestan. Las opciones salen del texto (nombres, fechas, objetos que han
visto), y las falsas son plausibles.

```ini
[EventCerraduraRetrato]
buttons=4
event1=EventCerraduraBien
event2=EventCerraduraMal
event3=EventCerraduraMal
event4=

[EventCerraduraMal]
buttons=1
event1=
operations=fallosCerradura,+,1
```
```text
EventCerraduraRetrato.text,"La cerradura tiene un disco con meses grabados. Bajo el retrato, alguien rascó: <i>«Nació con las primeras nieves»</i>."
EventCerraduraRetrato.button1,Noviembre
EventCerraduraRetrato.button2,Diciembre
EventCerraduraRetrato.button3,Enero
EventCerraduraRetrato.button4,Dejarlo por ahora
EventCerraduraMal.text,El disco se bloquea con un chasquido y algo se mueve dentro de la pared. Sufres 1 de Horror.
```

- Si las primeras nieves de ese pueblo caen en noviembre lo ha dicho otra pista (un diario, el
  ama de llaves): eso es lo que se piensa.
- Varía el orden de las opciones si el escenario se rejuega mucho (dos versiones del evento y un
  sorteo al empezar, `patrones.md` §16).
- `fallosCerradura` puede acelerar el reloj o traer algo al tercer fallo (`>=,3`).

**Receta: el código de una pista** (rompecabezas `code` con `puzzlesolution` fija,
`patrones.md` §13): la solución está escrita en el mundo (tres velas apagadas en el cuadro = 3 3 3).
Pon la pista antes de que encuentren la cerradura, o en una búsqueda cercana.

**Receta: juntar tres piezas.** Tres búsquedas suman `piezas,+,1`; la tercera (`>=,3`, concentrador
de `patrones.md` §7) deja leer el mensaje completo en una UI. Cada pieza, leída sola, ya dice algo.

## 2. Una amenaza que caza

No todo es un enigma: a veces el peso es algo que os persigue y el desafío es cómo lo esquivas, lo
despistas o lo usas. Valkyrie no sabe dónde está nadie, así que la persecución se lleva con una
**distancia** (cuántas rondas faltan para que alcance al grupo) que los Mitos acortan y los
jugadores alargan.

```ini
[EventCazadorDespierta]
buttons=1
event1=
operations=cazadorActivo,=,1 distancia,=,3

[EventCazadorRonda]
display=false
buttons=1
trigger=BeforeMonsterActivation
vartests=VarOperation:cazadorActivo,==,1
event1=EventCazadorLlega EventCazadorCerca EventCazadorLejos

[EventCazadorLejos]
buttons=1
event1=
operations=distancia,-,1

[EventCazadorCerca]
vartests=VarOperation:distancia,<=,1
buttons=1
event1=
operations=distancia,-,1

[EventCazadorLlega]
vartests=VarOperation:distancia,<=,0
buttons=1
event1=SpawnCazador
operations=cazadorActivo,=,0

[TokenArmarioEsconderse]
type=TokenSearch
buttons=1
event1=EventEsconderse

[EventEsconderse]
buttons=2
event1=EventEscondidoBien
event2=EventEscondidoMal
```
```text
EventCazadorLejos.text,Algo arrastra los pies muy lejos, en el piso de abajo. Se detiene. Escucha.
EventCazadorCerca.text,"Los pasos están en el pasillo. Si os quedáis donde estáis, os encontrará la próxima ronda."
EventCazadorLlega.text,La puerta se abre despacio.
EventEsconderse.text,"Os metéis en el armario con el corazón en la boca. Cada investigador que se esconda realiza una tirada de {agility} (1)."
```

- **Esconderse** (`EventEscondidoBien`: `distancia,+,2`), **distraer** (un objeto que se usa desde
  el inventario, con `inspect=`: `distancia,+,3` una vez), **cerrar una puerta** (`+1`) o **usar**
  la amenaza (atraerla hacia otro peligro: un evento que la quita si la distancia es 0 en una zona
  concreta). Cada salida cuesta acciones, que es la tensión.
- `event1=A B C` ejecuta la primera que se cumple: por eso el orden es «llega, cerca, lejos».
- El cazador que no se puede matar (un monstruo propio con mucha vida y un evento que lo retira
  tras dos rondas) es más aterrador que uno que se mata a tiros; dilo en el texto («No podéis
  hacerle frente: solo esconderos»).
- Avisa siempre un paso antes de que llegue: la amenaza da miedo cuando se oye, no cuando aparece.

## 3. Decisiones que pesan

Preguntas al grupo con **consecuencias visibles más tarde**: salvar a uno o seguir, quemar el diario
o leerlo, entregar el ídolo o romperlo, mentir a un personaje. Valkyrie no conoce las reglas de la
mesa, así que el escenario puede pedir elecciones que el juego de mesa no tiene: aprovéchalo.

```ini
[EventDiarioDecision]
buttons=2
event1=EventDiarioQuemado
event2=EventDiarioLeido

[EventDiarioQuemado]
buttons=1
event1=
operations=diarioQuemado,=,1

[EventDiarioLeido]
buttons=1
event1=
operations=diarioLeido,=,1 rondaFin,-,1
```

Y, mucho después, el eco:

```ini
[EventFinalSacerdote]
buttons=1
event1=EventSacerdoteRecuerda EventSacerdoteNormal

[EventSacerdoteRecuerda]
vartests=VarOperation:diarioQuemado,==,1
buttons=1
event1=
```
```text
EventSacerdoteRecuerda.text,"«Quemasteis sus palabras», dice el sacerdote, y por primera vez parece tener miedo. «Ahora no sabe vuestros nombres.»"
```

- **Las dos opciones tienen que tentar**: leer el diario da información y cuesta tiempo; quemarlo
  protege y deja a ciegas. Si una es obviamente mejor, no es una decisión.
- **La consecuencia se ve**: un texto que la nombra, un final distinto, un personaje que reacciona.
  Una variable que cambia algo invisible no cuenta para el jugador.
- Al menos una decisión cada 2-3 rondas; los escenarios mejor valorados de la tienda ofrecen más
  del doble de elecciones por hora que los peor valorados (`datos-tienda.md`).
- Avisa del peso cuando la decisión es irreversible («No habrá vuelta atrás»).

## 4. Responder como personaje

Botones que obligan a tomar postura (¿qué le dices?) y que la historia recuerde con variables. Un
personaje con **confianza** (`patrones.md` §5 para la ficha):

```ini
[EventCapitanPregunta]
buttons=3
event1=EventCapitanVerdad
event2=EventCapitanMentira
event3=EventCapitanAmenaza

[EventCapitanVerdad]
buttons=1
event1=
operations=confianza,+,1

[EventCapitanAmenaza]
buttons=1
event1=
operations=confianza,-,1 capitanAsustado,=,1
```
```text
EventCapitanPregunta.button1,«Buscamos a su hija. Creemos que está viva.»
EventCapitanPregunta.button2,«Somos de la aseguradora.»
EventCapitanPregunta.button3,«O nos lleva al barco, o la policía sabrá lo del contrabando.»
```

- Escribe las respuestas como frases que diría un investigador, no como «Ser amable».
- La confianza abre o cierra cosas después (`>=,2`: os da la llave; `<=,-1`: avisa al culto), y
  lo que pasa lo dice el texto: el jugador tiene que notar que su manera de hablar importó.
- Un personaje que miente también tiene su lógica: lo que dice encaja con lo que quiere (`escritura.md` §3).

## 5. Desafío justo

El grupo puede perder, pero entiende por qué.

- **Avisos antes de lo irreversible**: un evento de confirmación («Si bajáis ahora, la puerta se
  cerrará tras vosotros») con un botón para pensarlo.
- **Una salida para cada cosa que se puede perder**: si la llave cae al pozo, hay otra forma de
  abrir (forzar con `quota`, un pasadizo con más coste). Si un personaje muere, lo que sabía está
  también en otra parte.
- **Avisos de tiempo** antes de la derrota (`patrones.md` §9) y Mitos que se oyen antes de golpear.
- **Dificultad con el mínimo y el máximo de investigadores**: escala con `#heroes` (vida de los
  monstruos, pistas necesarias, plazo). En la tienda, los escenarios que se ganan más del 90 % de
  las veces están peor valorados que los que se ganan entre el 60 y el 90 % (`datos-tienda.md`).

### Para 1, 2, 3 y 4 investigadores: escalar es un arte

Un escenario pensado para 4 que funciona con 4 no funciona solo con 2 o con 1: con menos, no da
tiempo; con más, sobra gente esperando. Si el usuario pide un rango (2-4), se diseña para el rango,
y se recorre con el mínimo y el máximo (`ritmo.md` §5). Las herramientas:

| Con más investigadores | Con menos investigadores |
|---|---|
| **Más hilos a la vez**: una tarea paralela que solo existe con 3 o más (un invitado que evacuar, un segundo ritual que impedir), para que nadie espere | **Atajos y ayudas**: un aliado que acompaña y da un dado o abre una puerta; una escalera de servicio; un objeto que ahorra una tirada |
| **Un enemigo más** o uno que aparece antes (`vartests` con `#heroes,>=,3`) | **Menos apariciones**, o más tarde (`#heroes,==,1`) |
| **Más vida** (`healthperhero`) y cuotas más altas | **Plazos más largos** para lo imprescindible, o una tarea que se hace sola |
| **Más cosas que buscar**, que aporten: objetos con uso, no relleno para perder tiempo | **Menos cosas imprescindibles en sitios lejanos**: lo necesario más junto |

- **Cuotas que escalan**: una tirada acumulativa con su umbral según el número de investigadores se
  hace guardando los éxitos en una variable y sumándolos (`patrones.md`, tiradas):
  `quota=exitosPuerta`, `operations=fuerzaPuerta,+,exitosPuerta`, y el siguiente evento comprueba
  `fuerzaPuerta` contra un umbral calculado al empezar (`umbralPuerta,=,#heroes` y `umbralPuerta,+,1`).
  Así, además, el contador se puede poner a 0 cuando haga falta (al empezar otra noche, al cerrarse
  otra vez la puerta).
- **Lo que no se hace**: añadir relleno para que 4 «tengan algo que pulsar». Si sobran manos, falta
  un hilo, no fichas.
- **Dilo en la descripción** si un número va justo («en solitario, muy exigente»).

## 6. Plantar y cobrar: el giro

Un giro funciona si al llegar los jugadores piensan «claro, ¡estaba ahí!». Se planta en la primera
mitad algo que no parece importar y se cobra después:

1. **Plantar**: un detalle concreto, sin subrayar (la foto con una persona recortada; el ama que no
   entra en el sótano). Ponlo en una ficha que casi todos miran, no en una opcional.
2. **Recordar**: un segundo roce, a mitad de partida (el ama se santigua al ver el reloj).
3. **Cobrar**: la revelación nombra los detalles («La mujer recortada de la foto es ella»), con una
   UI de imagen y un cambio de música si se puede.

Con variables, el giro puede **depender de lo que vieron**: si miraron la foto (`fotoVista`), la
revelación la cita; si no, se cuenta de otra forma. Así nadie se queda sin entenderlo y quien lo vio
se lleva el premio.

Giros que funcionan en Mansiones (de las reseñas): el aliado es el villano; la víctima a la que
buscabais es quien os trajo; el objetivo era otro (no había que salvarle, había que impedir que
saliera); el lugar no es lo que parecía (la casa es un barco, el sótano es el pasado); el tiempo
corre al revés. Lo que no funciona: el giro que no se puede deducir, o el que invalida todo lo
jugado («era un sueño»).

## 7. El efecto «¡oh!»

Lo que hace que una mesa hable del escenario después:

- **Una imagen en el momento justo**: una UI a pantalla completa en el giro o en el clímax (los
  escenarios con imágenes propias están mejor valorados a igual duración, `datos-tienda.md`).
- **Sonido propio**: un `audio=` o `music=` del escenario en los momentos clave (la mayor diferencia
  de toda la tienda entre los mejor y peor valorados, a igual duración).
- **Algo que reacciona a lo que hicieron**: un epílogo que recuerda sus decisiones, un personaje que
  menciona una conversación de hace una hora.
- **Un cambio de reglas tardío**: la casa se inunda, se apaga la luz, el monstruo cambia de forma,
  hay que salir por otro sitio. Se avisa y se explica en el texto.
- **Un final que no lo explica todo**: deja una pregunta abierta, no un vacío.
