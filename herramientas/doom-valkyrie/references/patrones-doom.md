# Recetas para misiones de DooM en Valkyrie

Cómo se monta cada mecánica del juego de mesa *DOOM* (2016) con eventos de Valkyrie, usando el pack de la
comunidad DooM. Una misión de DooM es una aventura de Descent (`type=D2E`) que pide `packs=DooM`: el formato,
las claves y las rarezas de Valkyrie están en `formato-escenario.md` de la skill descent-valkyrie; aquí solo lo
propio de DooM. Las reglas del juego de mesa y el contenido del pack están en `reglas-doom.md`.

Cada receta cita la misión de ejemplo `assets/ejemplo/FugaEnHesperia` y la función de `scripts/doom.py` que la
crea. Los componentes de las misiones de la tienda usan otros nombres (§12).

## Índice

0. [Antes de empezar](#0-antes-de-empezar)
1. [Arranque y preparación](#1-arranque-y-preparación)
2. [La ronda: activaciones, Argent y mazo de amenaza](#2-la-ronda-activaciones-argent-y-mazo-de-amenaza)
3. [Portales](#3-portales)
4. [Puertas, tarjetas y zonas](#4-puertas-tarjetas-y-zonas)
5. [Armas, botiquines y teletransportadores](#5-armas-botiquines-y-teletransportadores)
6. [Objetivos](#6-objetivos)
7. [Frags, derrota y final](#7-frags-derrota-y-final)
8. [Jefes y demonios propios](#8-jefes-y-demonios-propios)
9. [Presión: rondas, cuenta atrás y oxígeno](#9-presión-rondas-cuenta-atrás-y-oxígeno)
10. [Diseño y equilibrio](#10-diseño-y-equilibrio)
11. [Lista de comprobación](#11-lista-de-comprobación)
12. [Leer las misiones de la tienda](#12-leer-las-misiones-de-la-tienda)

---

## 0. Antes de empezar

- **`quest.ini`**: `type=D2E`, `format=21`, `packs=DooM` y `minhero=1` (si se puede jugar con un marine). Sin el
  pack activado, Valkyrie no deja elegir la misión.
- **Marines**: `HeroAlpha`, `HeroBravo`, `HeroCharlie` y `HeroDelta`, con arquetipo propio (`DooM`): al elegir
  clase solo ven `ClassMarine1` a `ClassMarine4`. La clase solo sugiere dos armas iniciales; ninguna misión da
  experiencia ni objetos de Valkyrie. Variables `#HeroAlpha`… y `#heroes` como en Descent.
- **Demonios**: `MonsterImp`, `MonsterPossessed`, `MonsterCacoDemon`, `MonsterPinky`, `MonsterRevenant`,
  `MonsterMancubus`, `MonsterBaron_of_Hell` y `MonsterCyberDemon`, todos con el rasgo `Doom` y sin tamaño: en
  Valkyrie ocupan una casilla aunque la figura física sea grande (el texto dice dónde se pone). Cada tipo
  tiene 3 o 4 activaciones propias y comparte las genéricas `LongShot`, `ChargedShot`, `Enraged`, `Charge` y
  `ExplosiveShot` (`buscar.py --tipo activaciones --monstruo MonsterImp` en la skill de Descent).
- **Piezas**: `TileSideDooM_01_A` a `TileSideDooM_16_B`. Se unen salida con salida como las de Descent
  (`mapa.py --info TileSideDooM_09_A`, `--colocar`): la 13 hace de entrada (2×2 con una salida) y la 15 (2×1)
  de cuarto pequeño o cierre de una salida. La caja trae 24 piezas; por las misiones de la tienda, como mucho 6
  copias de la 15 y 2 de la 10, la 12 y la 13 (deducción, `reglas-doom.md` §2.6).
- **Fichas**: `Token_DM1_Objective` (objetivo, reglas, consolas, tarjetas), `Token_DM1_Progress` (azul),
  `Token_DM1_Threat` (roja: escombros, fuego, cadáveres), `Token_DM_MedPack`, `Token_DM_Copy` (persona),
  `Token_DM_<Blue|Yellow|Red>_Portal_A` / `_I`, `Token_DM_A_Teleport` / `Token_DM_I_Teleport`, granadas y una por
  arma (`Token_DM_Chainsaw`…). Las puertas son `Door…` de Descent, con `color` para las de tarjeta.
- **Textos**: segunda persona del plural para el grupo («Colocad…», «pulsadlo»), términos de `reglas-doom.md`
  §9 (marine, demonio, frag, Argent, ejecución, tambaleo, teletransportador, portal, carta de evento, mazo de
  acción). `{action}` es la viñeta de cada paso de las activaciones del pack y de las misiones de la tienda:
  úsala igual en las activaciones propias (§8). En eventos y botones no hace falta.
- **Botones de Valkyrie** que nombran los textos: «Fin del Turno», KO y Recuperar en el retrato del marine (la app
  en español pone «Recupear», con una errata; «Recuperar» se entiende); Información, «Forzar Activación»,
  Derrotado y «Único Derrotado» en el del demonio.

## 1. Arranque y preparación

*Ejemplo: `EventInicio` → `EventPrologo` → `EventPreparacion` → `EventAmenazaPregunta` → `EventMontar` →
`SpawnInicio`.*

```ini
[EventInicio]
display=false
buttons=1
trigger=EventStart
event1=EventPrologo
operations=$%morale,=,5
```

- Un solo `EventStart`. En sus `operations`, los frags del invasor (§7): `D.frags(6)` da `$%morale,=,5`.
- **Preparación** (texto): cada marine forma su mazo (juego UAC y dos armas iniciales distintas, o lo que diga la
  misión), roba 3 y, con menos de 4 marines, toma su carta de pelotón; el invasor baraja 3 mazos de evento, que
  solo sirven para la defensa de los demonios. Si la app decide qué sale de cada portal (§3), no hace falta carta
  de Invasión; si se usa una, dilo y respeta sus grupos.
- **Montar la primera zona**: un evento con `add=` de las piezas, la puerta, el teletransportador de entrada y
  las fichas, con `highlight=true` y posición para que la cámara vaya allí. Los marines empiezan en el
  teletransportador activo o a su lado.
- **Demonios iniciales** (Infestación): un Spawn con casillas para 1, 2, 3 y 4 marines (`placement1` a
  `placement4`; sin `placement1` no hay casillas con un solo marine). Las mismas figuras con cualquier número de
  marines si se juega con cartas de pelotón (§10.1).
- **Fichas de reglas** fuera del mapa, en coordenadas negativas (`D.reglas`: `TokenReglasApp` y
  `TokenReglasMision`; y `TokenObjetivo`): se pulsan para leer cómo se juega con la app, las reglas de la misión
  y el objetivo. `validar.py` las da por buenas (INFO).

## 2. La ronda: activaciones, Argent y mazo de amenaza

**Activaciones.** En el «modo Valkyrie» (el de las misiones de la tienda y de esta skill), los marines juegan en
el orden que quieran y, al pulsar «Fin del Turno» en el retrato de uno, la app activa un grupo de demonios al
azar que no haya actuado; cuando ya han actuado todos los marines, activa los grupos que falten. Para jugar con
el mazo de iniciativa físico («modo normal»), al salir una carta del invasor se pulsa «Forzar Activación» en el
retrato de un demonio, y al acabar el mazo cada marine pulsa «Fin del Turno». Las activaciones del pack solo
tienen habilidad y acciones (`ability` y `minion`): salen en un paso con el botón Activado.

**Un solo marine con *Solo Operative*** (dos activaciones por ronda) en el modo Valkyrie: tras su primera
activación se pulsa «Forzar Activación» en el retrato de un grupo que no haya actuado, elegido al azar; tras la
segunda, «Fin del Turno», y la app activa los grupos que falten y cierra la ronda. Si se pulsara «Fin del Turno»
tras la primera, la app daría la ronda por acabada para el marine. `D.reglas` lo explica en la ficha de reglas.

**Inicio de ronda** (`D.ronda(m, argent=2, amenaza=True, siguiente="EventMontar")`):

```ini
[EventRonda]
display=false
buttons=1
trigger=StartRound
event1=EventArgentRonda EventAmenazaRonda

[EventArgentRonda]
vartests=VarOperation:#monsters,>,0
buttons=1
event1=EventAmenazaRonda
```

- `StartRound` salta también en la ronda 1, después de toda la cadena de `EventStart`.
- `event1=A B` hace el primero habilitado: Argent si hay demonios (`#monsters` cuenta grupos), y si no, directo
  a la amenaza.
- **Argent**: el texto dice cuánto gana el invasor y dónde ponerlo (repartido entre las cartas de demonio boca
  arriba). Lo gastan las activaciones que empiezan por «[1 Argent]». Otras formas de las misiones publicadas:
  un dado por cada grupo nuevo (tantas fichas como iconos) o +1 por carta de demonio si no quedan portales.

**Mazo de amenaza** (opcional, preguntado al empezar). No son las cartas de Amenaza del juego de mesa (esas
deciden cómo se abren los portales, §3): son efectos de una ronda que roba la app. El de esta skill tiene 6
cartas propias (`doom.CARTAS_AMENAZA`); se pueden cambiar o añadir.

```ini
[EventAmenazaRonda]
display=false
vartests=VarOperation:amenazaActiva,==,1
buttons=1
event1=EventAmenazaBarajar EventAmenazaRobar

[EventAmenazaBarajar]
display=false
vartests=VarOperation:amenazaQuedan,<=,0
operations=amenazaQuedan,=,6 amenaza1,=,0 amenaza2,=,0 … amenaza6,=,0
buttons=1
event1=EventAmenazaRobar

[EventAmenazaRobar]
display=false
randomevents=true
buttons=1
event1=EventAmenaza1 EventAmenaza2 EventAmenaza3 EventAmenaza4 EventAmenaza5 EventAmenaza6

[EventAmenaza1]
vartests=VarOperation:amenaza1,==,0
operations=amenaza1,=,1 amenazaQuedan,-,1
```

- `randomevents=true` elige al azar entre los habilitados: las cartas ya robadas tienen `amenazaN=1` y no salen
  hasta que el mazo se acaba y se baraja. El texto enseña cuántas quedan con `{var:amenazaQuedan}`.
- Una carta que roba otra: su botón vuelve a `EventAmenazaRonda`.

## 3. Portales

### 3.1 Infestación: se abren al verlos

*Ejemplo: `TokenPortalCruce` → `EventPortalCruce` → `SpawnPortalCruceA` o `SpawnPortalCruceB`.*

```ini
[TokenPortalCruce]
type=Token_DM_Blue_Portal_A
xposition=2
yposition=4
buttons=1
event1=EventPortalCruce

[EventPortalCruce]
display=false
buttons=1
event1=SpawnPortalCruceA SpawnPortalCruceB
randomevents=true
remove=TokenPortalCruce

[SpawnPortalCruceA]
monster=MonsterImp
xposition=2
yposition=4
placement1=MPlacePortalCruceA1
placement2=MPlacePortalCruceA1 MPlacePortalCruceA2
placement3=MPlacePortalCruceA1 MPlacePortalCruceA2
placement4=MPlacePortalCruceA1 MPlacePortalCruceA2 MPlacePortalCruceA3
buttons=1
event1=

[SpawnPortalCruceB]
monster=MonsterPossessed
…
event1=EventArgentPortal1
```

```python
D.portal(m, "Cruce", "azul", (2, 4), [
    D.Opcion([("MonsterImp", 3, casillas)]),                  # 3 Imps con cualquier número de marines
    D.Opcion([("MonsterPossessed", 2, casillas)], argent=1)])
# grupos que crecen con los marines (sin cartas de pelotón): ("MonsterImp", (1, 2, 2, 3), casillas)
```

- La ficha del portal se añade con la zona y el texto pide pulsarla cuando un marine la vea. El evento que
  quita la ficha va **detrás** del botón: si la ficha quitara en su propio evento, bastaría con mirarla.
- Los dos grupos son los dos de ese color en la carta de Invasión (o los que invente la misión). Cada uno con
  sus casillas junto al portal y `placement1` a `placement4`: las mismas figuras con cualquier número de marines
  si se juega con cartas de pelotón, o más figuras con más marines si no (§10.1). `D.Opcion` comprueba que haya
  casillas para todas las figuras, que cada grupo tenga al menos 1 (con 0, Valkyrie marca una zona y crea el
  grupo igual) y que dos demonios del mismo grupo no compartan casillas.
- **Dos tipos en un grupo**: un Spawn por tipo, encadenados (`SpawnPortalPozoA1` → `SpawnPortalPozoA2`).
- **Argent del grupo**: un evento al final de la cadena (`EventArgentPortal1`).
- ⚠️ **Los tipos se juntan**: si ya hay Imps en juego, los nuevos entran en el mismo grupo (se marcan sus casillas
  y se activan juntos). `Defeated<Spawn>` solo salta con el primer Spawn de ese tipo: para contar, usa
  `DefeatedMonsterImp` o `#monsters` (§6). `validar.py` sugiere los `Defeated<Spawn>` que no saltarán por eso.
- **Figuras**: si no quedan figuras de un tipo, no salen más (regla del juego de mesa); `D.reglas` lo dice en la
  ficha de reglas de la misión.
- **Que esperen a la ronda siguiente**: con `activated=true` en el Spawn, el grupo nuevo cuenta como ya activado
  en esta ronda. Sin él, la app puede activarlo en cuanto un marine pulse «Fin del Turno», como en el juego de
  mesa, donde las cartas de iniciativa de los tipos nuevos entran al acabar la activación en curso.
- Un Spawn solo marca sus casillas si tiene posición (`xposition`, `yposition`) y no lleva `display=false`; sin
  eso, el grupo se crea igual pero no se ve dónde va (§12).

### 3.2 Horda: la app abre un portal cada ronda

Cada portal lleva una variable que dice si se ha usado, y un evento de final de ronda elige uno al azar entre
los que quedan; cuando no queda ninguno, otro evento (con todas las variables a 1) da Argent.

```ini
[EventHorda]
display=false
trigger=EndRound
randomevents=true
buttons=1
event1=EventPortalNorte EventPortalSur EventHordaSinPortales

[EventPortalNorte]
vartests=VarOperation:usadoNorte,==,0
operations=usadoNorte,=,1
display=false
randomevents=true
remove=TokenPortalNorte
buttons=1
event1=SpawnPortalNorteA SpawnPortalNorteB

[EventHordaSinPortales]
vartests=VarOperation:usadoNorte,==,1 VarTestsLogicalOperator:AND VarOperation:usadoSur,==,1
```

Con Infestación y Horda a la vez, la ficha del portal lleva al mismo `EventPortalNorte`, así que se usa una sola
vez se abra como se abra.

### 3.3 Asalto: el invasor acumula amenaza y la gasta

Una variable (`asalto`) sube al final de cada ronda (`EndRound`, `operations=asalto,+,2`) y, al empezar la
siguiente, un evento con `event1=EventAsaltoRojo EventAsaltoAmarillo EventAsaltoAzul` hace el primero que pueda
pagarse (`vartests` de coste y de que quede un portal de ese color) y resta su coste. Los portales de Asalto
vuelven a servir: no se quitan, o se cambian por su cara inactiva (`_I`) y vuelven con `add`.

### 3.4 Un jefe que llega al cumplir algo

Al cumplir algo (las dos válvulas en el ejemplo), un evento con posición y `highlight=true` anuncia al jefe (en
el ejemplo, trepa por el pozo) y encadena su Spawn (§8). Si llega por un portal que se ve en el mapa, añade su
ficha (`Token_DM_Red_Portal_A`) con `add=` y quítala con `remove=` en el evento del Spawn. Si el jefe debe salir
cuando lo vean, usa §3.1 con un solo grupo.

## 4. Puertas, tarjetas y zonas

*Ejemplo: `DoorEsclusa` → `EventAbrirEsclusa` (zona 2); `TokenTarjetaAmarilla`; `DoorAmarilla`.*

```ini
[DoorAmarilla]
xposition=1
yposition=5
rotation=90
color=yellow
event1Condition=VarOperation:tarjetaAmarilla,==,1
buttons=1
event1=EventAbrirPozo
```

- Abrir una puerta cuesta 1 punto de movimiento a un marine adyacente. El evento de la puerta la quita
  (`remove=`) y añade la zona siguiente: piezas, fichas, portales y puertas nuevas.
- Los demonios no abren puertas (dilo en las reglas).
- **Tarjetas**: la ficha pone `tarjetaAmarilla,=,1`; la puerta de color tiene el botón apagado hasta entonces
  (`event1Condition`). `D.tarjeta()` y `D.puerta(..., color="amarilla")`.
- Una zona que se revela con algo que no es una puerta (un muro que cae, un ascensor) es lo mismo con otra ficha.

## 5. Armas, botiquines y teletransportadores

- **Arma de recogida** (`D.arma`): la ficha del arma; al pulsarla, el texto dice que el marine baraja sus cartas
  y las pone boca abajo encima de su mazo de acción, y la ficha se quita. Recogerla no gasta movimiento.
- **Granadas**: `granada` (`Token_DM_FGrenade`) y `granada_absorcion` (`Token_DM_Grenade`). Son una sola carta,
  que va encima del mazo de acción, y la ficha queda boca arriba en la zona del marine.
- **Botiquín** (`D.botiquin`): el marine que pasa por su casilla retira 5 de daño de su carta.
- **Teletransportador** (`D.teletransporte`): el activo de la entrada (`Token_DM_A_Teleport`) y los apagados
  (`Token_DM_I_Teleport`), que un marine enciende al entrar: el evento cambia una ficha por la otra (`add` y
  `remove`). Los activos son puntos de reaparición y, para moverse, adyacentes entre sí.
- **Armero** con varias armas: una ficha por arma, o una de objetivo con un botón por arma.

## 6. Objetivos

| Objetivo | Cómo se hace |
|---|---|
| **Consolas, terminales, válvulas** | `D.consola`: un marine adyacente descarta 1 carta (una vez por activación) y pulsa la ficha; una variable cuenta los avances y, al llegar al número, la ficha se quita y sigue la historia. *Ejemplo: `TokenConsolaAlmacen`.* |
| **Matar a un jefe** | Spawn único y `trigger=DefeatedUnique<Spawn>` en la victoria (§8). |
| **Limpiar el mapa** | Al final de ronda, un evento con `vartests` `#monsters==0` y las variables de los portales usados. |
| **Recoger y llevar** | Fichas de Progreso (`Token_DM1_Progress`) que un marine recoge (se quita la ficha y sube una variable); si muere, la ficha cae en su casilla: el texto lo dice y un botón la vuelve a poner. |
| **Escoltar** | Una ficha de persona (`Token_DM_Copy`); al final de ronda, una pregunta: si hay un marine adyacente, la mueve hasta X casillas; al llegar, se pulsa la ficha de destino. |
| **Salir** | Al final de ronda: «¿Están todos los marines vivos en el teletransportador de salida?», con Sí (victoria) y No. |
| **Aguantar N rondas** | `trigger=EndRound<N>` con la victoria, o una variable que cuenta rondas (§9). |

- Una ficha de objetivo con botones «Victoria» y «Derrota» como red de seguridad está bien en misiones largas,
  pero no en lugar de los finales automáticos.

## 7. Frags, derrota y final

- El invasor gana con **F frags** (6 en casi todas; en el tutorial, menos con más marines). Valkyrie los lleva
  como moral: pon `$%morale,=,F-1` en el `EventStart` (Valkyrie la acaba de poner igual al número de marines).
- Cada muerte: KO en el retrato del marine (baja la moral 1). En su siguiente activación reaparece en un
  teletransportador activo y se pulsa Recuperar (no devuelve moral).
- Cuando la moral baja de 0 salta `NoMorale`: con `F-1`, en el frag número F. Si el KO llega durante una
  activación de demonios, salta al cerrarla.
- ⚠️ `NoMorale` vuelve a saltar tras cada evento mientras la moral siga por debajo de 0: el evento de derrota
  termina la partida (`$end,=,1`).
- Para enseñar cuánto queda: `{var:$%morale}` es el número de bajas que el pelotón aún puede sufrir sin perder
  («Podéis sufrir {var:$%morale} bajas más; la siguiente es la derrota»).
- **No uses `trigger=Eliminated`** (es de Mansiones y en Descent no salta nunca); tampoco otros disparadores de
  Mansiones.
- Victoria y derrota terminan con `$end,=,1`; una misión publicada enseña después la pantalla para puntuarla.

## 8. Jefes y demonios propios

*Ejemplo: `CustomMonsterBaronPozo`, `ActivationBaronEmbestida`, `ActivationBaronFuego`, `SpawnBaron`.*

```ini
[CustomMonsterBaronPozo]
base=MonsterBaron_of_Hell
activation=BaronEmbestida BaronFuego

[ActivationBaronEmbestida]
masterfirst=true

[SpawnBaron]
monster=CustomMonsterBaronPozo
unique=true
uniquehealth=2
uniquehealthhero=2
placement1=MPlaceBaron
…
```
```text
CustomMonsterBaronPozo.monstername,Barón del pozo
ActivationBaronEmbestida.ability,<i>El Barón huele la sangre de {0}.</i>
ActivationBaronEmbestida.master,"{action} Se mueve hasta 5 casillas hacia ese marine (si no está en el mapa, hacia el más cercano) hasta quedar adyacente.\n{action} Le ataca.…"
```

- `base` es el demonio del pack cuya figura y carta se usan. Sin `activation=`, el demonio propio usa las
  activaciones de su base (las `MonsterActivation<Base>…` del pack y las genéricas de su `activation=`).
- Cada nombre de `activation=` es primero una activación de la misión (`[ActivationX]`, si sus `vartests` se
  cumplen) y, si no, una del pack (`MonsterActivationX`): un jefe puede mezclar las suyas con
  `Baron_of_Hell1` o `Enraged`. Los nombres que no se encuentran se saltan con un aviso en el registro; si no
  queda ninguna activación válida, Valkyrie se cierra (`RoundController.ActivateMonster`).
- Las propias llevan `ability` (arriba; `{0}` es un marine al azar y `{1}` el demonio) y `master`, `minion` o los
  dos (las acciones). `{0}` puede ser un marine muerto: «hacia ese marine (si no está en el mapa, hacia el más
  cercano)».
- Escribe las acciones como las del pack: `{action}` delante de cada paso; cuánto se mueve, hacia quién (el más
  cercano, el más alejado, el más débil o el más fuerte), cuándo ataca y qué habilidad usa; un coste de Argent
  entre corchetes al principio, en su propia línea («[1 Argent] Este ataque gana +3 de alcance.»).
- **Vida adicional** con `unique`, `uniquehealth` y `uniquehealthhero`: Valkyrie la enseña en rojo. Di en el texto
  si se le puede ejecutar o no tiene tambaleo.
- Un jefe de un tipo que ya está en juego se juntaría con su grupo: hazlo `CustomMonster` (es otro tipo).
- **Figura grande**: la app la dibuja en una casilla. El texto del Spawn dice que la figura cubra la casilla
  marcada (o quede lo más cerca posible).
- `uniquetitle` no se ve tal cual (sale «Maestro <demonio>»): el nombre va en `monstername` y en `uniquetext`.
- Demonios nuevos (un zombi, un teniente): `CustomMonster` sobre la figura que se use, con su `info` (vida,
  tambaleo, defensa) y sus activaciones.

## 9. Presión: rondas, cuenta atrás y oxígeno

- **Evento en una ronda concreta**: `trigger=EndRound4` (al acabar la ronda 4).
- **Cuenta atrás**: un evento que la arranca (`cuenta,=,5`) y otro de final de ronda con `vartests` `cuenta>0`,
  `operations=cuenta,-,1` y el texto «Quedan {var:cuenta} rondas»; al llegar a 0, la derrota o el suceso.
- **Oxígeno o un recurso**: igual que la cuenta atrás; las bombonas son fichas que suman.
- **Refuerzos**: un Spawn de final de ronda con `vartests` (mientras quede un portal, cada 2 rondas con una
  variable…).

## 10. Diseño y equilibrio

- **Tamaño**: las misiones de la tienda tienen de 7 a 18 piezas (mediana 13) y duran de 30-45 minutos (el
  tutorial, 7 piezas) a 3-4 horas. Para 60-90 minutos: 3 zonas, 8-10 piezas, 3-4 portales.
- **Portales**: azul para demonios menores (2-3 Imps, 1-2 Soldados poseídos, 1 Pinky), amarillo para 1-2
  Cacodemonios, Pinkies o un Revenant, rojo para los mayores (Barón, Mancubus, Ciberdemonio).
- **Argent**: 2-3 por ronda; algún grupo con +1 o +2. Más Argent, más habilidades caras de los demonios.
- **Frags**: 6 es lo estándar. Con un solo marine, `minhero=1` y `placement1` en todos los Spawn.
- **Armas**: una de recogida por zona, mejor apartada (un cuarto pequeño) que en el camino.
- **Teletransportadores**: uno apagado en cada zona nueva acorta la vuelta tras morir.
- Prueba con 1 y con 4 marines.

### 10.1 Menos de 4 marines

El juego de mesa no cambia los grupos de invasión con el número de marines: compensa a los pelotones pequeños con
las cartas de pelotón (con 3 marines, uno lleva *Taking Point*; con 2, los dos llevan *Combat Veteran*; con 1,
*Solo Operative*: dos activaciones por ronda y, según BGG, más vida; `reglas-doom.md` §2.2). Una misión elige
**una** de dos formas, y lo dice en la preparación y en las reglas:

| | Grupos fijos (como el juego de mesa) | Grupos que crecen |
|---|---|---|
| Cartas de pelotón | Sí | No |
| `D.Opcion` | Un número: `("MonsterImp", 3, casillas)` | Cuatro: `("MonsterImp", (1, 2, 2, 3), casillas)` |
| Con un marine | Dos activaciones (§2, «Forzar Activación» entre ellas) | Una activación |
| `nueva_mision.py` | Por defecto | `--escalar` |
| `D.reglas` | `pelotones=True` | `pelotones=False` |

Hacer las dos cosas (grupos que crecen y cartas de pelotón) deja la misión muy fácil con 1 o 2 marines. La vida
extra de un jefe (`uniquehealthhero`) sí puede crecer con los marines: más marines hacen más daño por ronda.

## 11. Lista de comprobación

- [ ] `packs=DooM`, `minhero` y `placement1` si admite un marine (el editor de Valkyrie no enseña `placement1`: a
  mano en `spawns.ini`).
- [ ] `$%morale,=,F-1` en el `EventStart` y `NoMorale` con `$end,=,1`.
- [ ] Cada portal: ficha en la zona, evento con `randomevents` que la quita, Spawn con casillas para 1-4.
- [ ] Grupos fijos con cartas de pelotón o grupos que crecen sin ellas (§10.1), dicho en la preparación; con un
  marine, cómo se juega *Solo Operative*.
- [ ] Activaciones propias con `{action}` en cada paso y un plan para cuando `{0}` no esté en el mapa.
- [ ] Ninguna cuenta de demonios con `Defeated<Spawn>` de un tipo que se repite.
- [ ] Sin `Eliminated` ni otros disparadores de Mansiones.
- [ ] Puertas de color con su tarjeta en el mapa y la condición en el botón.
- [ ] Fichas de reglas y de objetivo fuera del mapa, con su texto.
- [ ] Textos en español (y en inglés si se publica) con los nombres de los botones de Valkyrie.
- [ ] `validar.py` y `mapa.py --png` de la skill descent-valkyrie sin errores ni avisos.

## 12. Leer las misiones de la tienda

Casi todas parten de la plantilla de Neuntoter (ver `reglas-doom.md` §10.5), con otros nombres:

| Plantilla de la tienda | Lo mismo en esta skill |
|---|---|
| `Event_999_Round_Beginning`, `Event_999_Beg_Round_Gain_3_Argent` | `EventRonda`, `EventArgentRonda` |
| `Event_999_Check_Use_Cards`, `Event_999_Draw_Card`, `Event_999_Card_NN`, `_Card_NN_Dicarded` | `EventAmenazaPregunta`, `EventAmenazaRobar`, `EventAmenazaN`, `amenazaN` |
| `Token_NN_Portal_M` → `Event_NN_Portal_M_Click` → `…_Selection_1/2` → `Spawn_NN_Spawn_M_Option_X_K` | `TokenPortalX` → `EventPortalX` → `SpawnPortalXA/B` |
| `Event_000_Gain_N_Argent` | `EventArgentPortalN` |
| `Token_000_Objective`, `Token_000_Mission_Rules`, `Token_000_Game_Rules`, `Token_Mode_Rules` | `TokenObjetivo`, `TokenReglasMision`, `TokenReglasApp` |
| `Token_<Color>_Key_Card`, `_<C>_Keycard`, `Door_<Color>_Door` | `TokenTarjeta<Color>`, `tarjeta<Color>`, `DoorX` con `color` |
| `AreaNN_Portals.ini` (hasta 3 portales por zona, lo no usado «aparcado» en (-4, 2)) | Solo los portales que se usan |

Al arreglar una misión de la tienda, cuidado con sus trampas conocidas (`reglas-doom.md` §10.6): la puerta
amarilla que se abre sin tarjeta, la moral desfasada en 1, `Eliminated`, contadores con `DefeatedSpawn…`. Pasa
`validar.py`: también señala portales y fichas sin texto.

Al reutilizar un Spawn «aparcado» de la plantilla (en (-4, 2), casi siempre el segundo tipo de un grupo,
`…_Option_X_2`), dale la posición del portal y quítale `display=false`: con él, Valkyrie crea el grupo pero no
marca sus casillas.
