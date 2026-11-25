# Partida de mesa simulada: jugar el escenario como una mesa, ronda a ronda

`jugar_azar.ts` y `jugar_guiado.ts` (`valkyrie-app.md` §8) prueban **la app**: bloqueos, textos sin
sustituir, finales que salen. No saben dónde está cada figura, así que no ven lo que más falla en la
mesa: **el tiempo**. Si da tiempo a llegar a un sitio, cuántas acciones cuesta lo que pide el texto,
quién se queda sin nada que hacer, cuánto Horror se acumula con 2 y con 4 jugadores.
`partida_mesa.ts` juega con las reglas de la mesa encima del motor de Valkyrie Universalis y deja un
registro que se lee como una crónica: «Rita [acción] cocina → almacén (hacia la bodega)».

## Índice

1. [Qué simula](#1-qué-simula)
2. [Montarlo para un escenario](#2-montarlo-para-un-escenario)
3. [El perfil del escenario](#3-el-perfil-del-escenario)
4. [La batería de partidas](#4-la-batería-de-partidas)
5. [Leer los resultados](#5-leer-los-resultados)
6. [Errores que engañan](#6-errores-que-engañan)
7. [Lo que ya hemos aprendido de diseño](#7-lo-que-ya-hemos-aprendido-de-diseño)

## 1. Qué simula

- **Mapa**: un grafo de espacios sacado de las zonas de cada loseta (`contenido_losetas.json`) y de las
  aberturas que tocan otra loseta (`espacios_mesa.py`). Solo cuentan las losetas que están en la mesa.
- **Turno**: 2 acciones por investigador. Mover = hasta 2 espacios (1 si está Herido). Usar una
  ficha = 1 acción; los botones con `{action}` cuestan otra. Con un monstruo en su espacio, evadir
  (Agilidad, 1 éxito) antes de irse; si en ese espacio hay algo que vino a buscar, lo coge antes.
  Ataca si un monstruo comparte espacio (Saber si tiene 4 o más, si no Fuerza; daño = éxitos + 1).
  Si el texto de la exploración dice «puede moverse 1 espacio a través de esta puerta», entra gratis
  en la zona nueva, pero solo si eso le acerca a lo siguiente que quiere hacer. Si un diálogo le pide
  una acción que ya no tiene, vuelve a esa ficha en su próximo turno en vez de darla por hecha.
- **Dados de verdad**: 8 caras, 3 éxitos, 2 lupas, 3 blancos. Las Pistas convierten lupas.
  El generador es xorshift: un LCG con `% 8` repite las caras en bucle y da partidas falsas.
- **Daño y Horror**: lee el texto («Sufres 2 de Daño (anulado por {strength})», «Cada investigador
  sufre 1 de Horror», «descarta 1 carta de Horror») y tira para anular. Herido y Loco a la primera,
  Eliminado a la segunda.
- **Monstruos**: los saca la app; el simulador los coloca (en el espacio del `Spawn` o donde estaba
  ese monstruo), les da vida (base + por investigador) y, cuando la activación lo dice, los mueve
  hacia el investigador más cercano y aplica a quién ataca. Fase de Horror: cada investigador con
  un monstruo en su espacio o al lado tira Voluntad.
- **La app** hace lo suyo: eventos, Mitos, variables, finales, UI (las pulsa), rompecabezas de código.

Lo que **no** hace: pensar. Juega el plan que le das. Por eso hay estrategias (§4) y por eso un
resultado raro es primero una pregunta sobre el plan y luego, si aguanta, sobre el escenario.

## 2. Montarlo para un escenario

```bash
cd scripts/universalis
python ../espacios_mesa.py <escenario> grafo.json      # repítelo si cambias el mapa o las fichas
cp perfil_ejemplo.ts mi_perfil.ts                       # y adáptalo (§3)
KIT=<valkyrie-universalis> QDIR=<escenario> GRAFO=grafo.json PERFIL=mi_perfil.ts \
  NH=3 STRAT=N SEED=1 OUT=partidas/3N1.txt node partida_mesa.ts
```

Revisa la salida de `espacios_mesa.py` antes de nada: cada espacio con sus vecinos. Una puerta del
mapa que no aparece como conexión, o una ficha que cae en `Tile:?`, se arregla en el perfil
(`accesos`, `fichas`); si no, el simulador dirá que algo está lejos cuando no lo está.

Investigadores por defecto (en este orden, `NH` toma los primeros): Rita Young, Agatha Crane, Padre
Mateo y Carson Sinclair, con sus características reales. Cambia `investigadores` en el perfil para
probar otro grupo (uno sin Voluntad, uno sin Fuerza).

## 3. El perfil del escenario

Un fichero `.ts` que exporta lo que una mesa haría en **ese** escenario. Lo mínimo es `plan`:

| Campo | Para qué |
|---|---|
| `plan(i, c)` | Fichas que quiere usar cada investigador, por orden. Reparte papeles por posición en la mesa (`c.INV.indexOf(i)`), noche/acto y hora. Con 2 jugadores cada uno hace más cosas; con 4, ¿qué hace el cuarto? |
| `cita(i, c)` | Dónde **tiene** que estar ahora porque el texto lo pide («a las doce, en la terraza») |
| `preferir(c)` / `evitar(c)` | Botones que la mesa pulsa o no. Aquí viven las estrategias (`c.STRAT`) |
| `quienSufre(raw, c)` | Frases propias del escenario: «Cada investigador en el sótano…» |
| `elegirInvestigador(evento, c)` | A quién elige la mesa cuando la app pregunta con un botón por investigador |
| `respuestas` | Preguntas sí/no que dependen de la posición («¿Hay alguien en la cocina?») |
| `alEvento(nombre, raw, c)` | Lo que el texto mueve o decide y la app no sabe: quién lleva a la niña, a quién se lleva el sueño, a dónde vuelve |
| `dialogo(d, nombre, raw, c)` | Diálogos que no se resuelven con un botón razonable (persecuciones, azar) |
| `tirada(evento, quien, hab, c)` | Reglas escritas que cambian una tirada: «si es el Ancla, suma 1» |
| `turnoEspecial` / `accionEspecial` / `accionesExtra` | Un investigador fuera del tablero, una acción propia (quemar algo), un aliado que da acciones |
| `puedeAtacar`, `fichaDisponible`, `noMarcar` | Monstruos que no se pueden matar, fichas que solo valen a veces, puertas que se fuerzan en varios intentos |
| `pesoDistancia` | 99 (por defecto): va a lo más cercano del plan; 1-3: respeta más el orden del plan (también `PESO_DIST=`) |
| `vidaMonstruos`, `apodos`, `inicio`, `nocheVar`, `horaVar` | Datos |

`perfil_ejemplo.ts` es el de *La noche que no termina* (tres noches que se repiten, 2-4 jugadores):
léelo entero antes de escribir el tuyo.

**Lee los textos del escenario antes de escribir el perfil.** Toda regla escrita que favorece una
jugada («el Ancla no suelta», «si alguien la sujeta, tira un dado más») tiene que estar en el perfil,
o la simulación juega peor que cualquier mesa que lea.

## 4. La batería de partidas

Mínimo: **mínimo, 3 y máximo de investigadores × 2 estrategias × 10 semillas**. Cada partida tarda 1-3
segundos; 60 partidas, un par de minutos.

- **N, mesa ingenua**: pulsa lo razonable y no sabe el truco. Si nunca gana, el escenario depende de
  algo que hay que adivinar: comprueba que hay pistas para adivinarlo.
- **C (o la que toque), mesa que sabe**: juega bien. Si casi nunca gana, sobra dificultad o falta
  tiempo. Si gana siempre con cualquier número, la dificultad está toda en descubrir el truco.
- Una estrategia por cada **decisión grande** del escenario (llevarse a la niña o dejarla, alertar al
  villano o no) enseña qué pesa cada rama.

```bash
for nh in 2 3 4; do for st in N C; do for s in $(seq 1 10); do
  NH=$nh STRAT=$st SEED=$s OUT=partidas/$nh$st$s.txt KIT=… QDIR=… GRAFO=grafo.json PERFIL=mi_perfil.ts node partida_mesa.ts > /dev/null
done; done; done
python ../resumen_partidas.py partidas --eventos EventVigila,EventQuemar@3 --md tabla.md
```

Para comparar antes y después de un cambio, juega **las mismas semillas** con la versión anterior
del escenario (una copia de los `.ini` y la localización, con las carpetas de imágenes enlazadas: sin
imágenes la UI rompe el motor).

## 5. Leer los resultados

`resumen_partidas.py` da, por grupo (`3N`, `4C`…): finales, losetas al acabar la primera noche/acto,
rondas-investigador sin nada que hacer por noche, Horror de toda la mesa por noche, locos, eliminados
y en cuántas partidas pasa cada evento que le pidas.

| Señal | Qué suele querer decir |
|---|---|
| Un evento que sale 0 de 30 | Ventana imposible: pide estar en un sitio y gastar una acción en la misma ronda, o está lejos de quien lo tiene que hacer |
| Las losetas de la primera noche no suben de 3 a 4 jugadores | El mapa se atasca en puertas y llaves, no en manos: el cuarto jugador espera |
| Esperas altas solo con el máximo de jugadores | Falta trabajo para el último: encargos, fichas menores, una mini-aventura que lo saque |
| Horror que crece en línea con los jugadores | «Cada investigador sufre…» multiplica; a 4 elimina a los de poca cordura |
| La estrategia N no gana nunca, la C casi siempre | La partida es descubrir el truco: ¿hay pistas pronto? ¿hay aviso antes de la jugada que lo estropea? |
| Siempre el mismo final de derrota | Mira la ronda en que se decide (el registro dice dónde estaba cada uno) |

Después, **lee dos o tres partidas enteras** de los grupos raros. La tabla dice dónde mirar; el
registro dice por qué.

## 6. Errores que engañan

Todos nos han pasado y todos daban conclusiones falsas:

- **El plan decide más que el escenario.** Con una mesa que se ponía a pelear con el monstruo en vez
  de coger el cuaderno que había venido a buscar, 2 jugadores ganaban 1 de cada 10; cogiendo antes el
  cuaderno, 8 de cada 10, con el mismo escenario. Antes de culpar al diseño, mira qué hizo la mesa
  en la ronda clave.
- **Reglas escritas que el simulador no aplica**: «si es el Ancla, no hace falta tirar». Sin ella, la
  niña se perdía en la mitad de las partidas a 4.
- **Citas que chocan**: una cita («ve a la terraza a las once») que gana al plan («quédate con la
  niña, que está arriba») hace que nadie llegue a tiempo.
- **Contar dos veces el paso de la hora** (varias llamadas a `next()` por ronda): noches de 3 rondas.
- **Una ficha dada por hecha sin haberla usado**: el investigador llega con la última acción, el
  diálogo pide otra (`{action}` en el botón) y se va; si se marca como hecha, no vuelve en toda la
  noche. Pasaba con el cajón del cuaderno y hundía las victorias.
- **Un cambio pequeño mueve todo**: dejar entrar gratis tras explorar cambió el orden en que cada
  uno llegaba a las cosas, y con él los resultados, hasta que se arregló lo anterior. Si un cambio
  que no debería importar cambia mucho la tabla, busca el fallo en el simulador antes que en el
  escenario; para separar una cosa de otra, juega las mismas semillas con y sin el cambio
  (`MOVLIBRE=0` desactiva la entrada gratis).
- **Frases que no se entienden**: «Sufres» con mayúscula, «cada investigador» en minúscula, «descarta
  2 cartas de Horror». Si cambias la redacción de un efecto, mira que el registro lo aplica.
- **Puertas que se fuerzan en varios intentos** marcadas como hechas al primer intento (`noMarcar`).
- **Objetivos inalcanzables** (la sala está cerrada esta noche): el investigador se queda parado.
  Comprueba con `path` y descarta el objetivo.
- **Procesos en segundo plano**: en algunos entornos mueren al acabar la orden. Lanza la batería en
  primer plano; va rápida.

## 7. Lo que ya hemos aprendido de diseño

Sacado de jugar *La noche que no termina* con 2, 3 y 4 investigadores (varios cientos de partidas):

1. **Una ventana de una sola ronda no se usa.** «Quedarte con la niña» solo existía en la última ronda
   antes de medianoche y en su espacio: 0 de 70 partidas. Abierta desde dos horas antes, 10 de 10 a
   3 y 4 jugadores. Si algo importante pide estar y actuar, dale dos o tres rondas.
2. **Más jugadores no exploran más si el mapa tiene cerrojos.** A 3 y a 4 se abrían las mismas 7
   losetas en la primera noche. El cuarto necesita trabajo propio, no más mapa.
3. **Trabajo para el cuarto**: una mini-aventura que lo saca del tablero dos rondas (un sueño con tres
   caminos que se juega pulsando una ficha de niebla fuera del mapa), un recado pequeño con algo raro
   dentro (un pendiente junto al agua) y dos o tres fichas menores que cuestan una acción y dan
   ambiente. Que solo aparezcan con `#heroes>=4`, y que la mini-aventura no pueda caer en el momento
   decisivo (`hora<=3`, nunca la última noche) ni la corte la medianoche.
4. **Compensar a 2 sin regalar la partida**: una ronda más al principio de la noche decisiva, un
   aliado que da una acción extra a quien lo lleva y un PNJ que ahorra un paso (trae la llave en vez
   de decir dónde está). Mide antes de compensar: en ese escenario, lo que parecía falta de tiempo a 2
   era sobre todo el plan del simulador (§6); las ayudas acabaron sirviendo para que la pareja no
   llegara a la última noche medio loca, no para poder ganar.
5. **El Horror global escala en línea**: con 4, un alivio al empezar cada noche (descartar 1) o
   efectos «cada investigador en tal sitio» en vez de «cada investigador».
6. **Si la victoria depende de una jugada escondida** (quemar el cuaderno), la mesa ingenua no gana
   nunca. Pon una pista temprana y un aviso antes de la jugada que la estropea.
7. **Las UI en pantalla bloquean «Fin de fase»** (`mecanismos-ui.md` §1): para algo que un jugador
   pulsa en su turno durante varias rondas, usa una **ficha fuera del mapa** que aparece al pasar la
   hora y desaparece al pulsarla, no un botón de UI.
