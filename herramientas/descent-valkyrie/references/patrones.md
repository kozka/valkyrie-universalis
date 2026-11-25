# Recetario de patrones para aventuras de Descent en Valkyrie (Camino a la leyenda)

Soluciones probadas para lo que hace la app oficial de Descent (Road to Legend) y lo que hacen las campañas
publicadas, listas para copiar y adaptar. Casi todas están en funcionamiento en la minicampaña de ejemplo
`assets/ejemplo/LaCampanaDeVadoscuro` (se indica la aventura y el componente), que se ha jugado entera en el
motor de Valkyrie Universalis. El significado exacto de cada clave está en `formato-escenario.md`; la
geometría, en `mapa-losetas.md`.

## Índice

0. [Convenciones](#0-convenciones)
1. [Arranque y preparación](#1-arranque-y-preparación)
2. [Puertas y zonas que se revelan](#2-puertas-y-zonas-que-se-revelan)
3. [Búsqueda](#3-búsqueda)
4. [Objetivos, aldeanos y fichas que se recogen](#4-objetivos-aldeanos-y-fichas-que-se-recogen)
5. [Pruebas de atributo](#5-pruebas-de-atributo)
6. [Monstruos](#6-monstruos)
7. [Amenaza, peligros y límite de rondas](#7-amenaza-peligros-y-límite-de-rondas)
8. [Moral y derrota](#8-moral-y-derrota)
9. [Victoria y recompensas](#9-victoria-y-recompensas)
10. [Héroes concretos](#10-héroes-concretos)
11. [Objetos](#11-objetos)
12. [Campañas](#12-campañas)
13. [La tienda](#13-la-tienda)
14. [UI: mapa de campaña, ciudad e imágenes](#14-ui-mapa-de-campaña-ciudad-e-imágenes)
15. [Variación y rejugabilidad](#15-variación-y-rejugabilidad)
16. [Disparadores por variable](#16-disparadores-por-variable)
17. [Expansiones](#17-expansiones)
18. [Sonido y música](#18-sonido-y-música)

---

## 0. Convenciones

- Nombres: prefijo de tipo + CamelCase sin acentos (`EventAbrirOsario`, `DoorSello`, `MPlaceTrasgoLider`).
  Agrupa por zona: todo lo del osario lleva «Osario».
- Un evento por pantalla de texto, 2-4 frases. Etiqueta **siempre** cada botón (`EventX.button1,Continuar`).
- Redacta como la app y la comunidad: «Coloca la pieza 13A, la Entrada y 1 terminal como se indica»,
  «respetando el límite de monstruos», «Un héroe adyacente realiza una prueba de `{might}`», «sufres 1
  `{heart}`», «Vuestra Moral sube en 1», «Cada héroe recibe 1 PE», «**Objetivo:**», «**Objetivo
  actualizado:**» (glosario y fórmulas en `reglas-descent.md` §18).
- `{action}` en la etiqueta = cuesta una acción. Usa `{c:TileX}` para el número de la pieza y `{type}` o
  `{c:SpawnX}` para el nombre del monstruo: salen en el idioma del jugador.
- Valkyrie no sabe dónde está nadie ni cuánto daño tiene: pregunta con botones o pide pulsar una ficha.
- Tras escribir: `validar.py`, `grafo.py` y `mapa.py --png`.

## 1. Arranque y preparación

Un único `EventStart`, silencioso, que pone las variables; la cadena prepara la mesa paso a paso, como la
app: aparta piezas → coloca el mapa inicial → héroes en la Entrada → fichas → grupos de monstruos → objetivo.
*Ejemplo: Aventura1 `EventInicio` → … → `EventObjetivo`.*

```ini
[EventInicio]
display=false
trigger=EventStart
operations=amenaza,=,%dificil
buttons=1
event1=EventPrologo

[EventPrologo]
buttons=1
event1=EventPreparar

[EventPreparar]
buttons=1
event1=EventColocarMapa

[EventColocarMapa]
xposition=0
yposition=-2
add=TileCamino TileEntrada TileClaro TileTerminal1 TileTerminal2 DoorEmpalizada
buttons=1
event1=EventColocarHeroes

[EventColocarHeroes]
xposition=2
yposition=-4
highlight=true
buttons=1
event1=EventColocarFichas

[EventColocarFichas]
xposition=-2
yposition=-2
add=TokenBusqueda1 TokenBusqueda2 TokenAldeana
buttons=1
event1=SpawnTrasgos
```
```text
EventPreparar.text,"<b>Preparación</b>\n\nApartad las piezas {c:TileCamino}, {c:TileClaro} y {c:TileCampamento}, una Entrada, 3 terminales y una puerta."
EventColocarMapa.text,"Colocad las piezas {c:TileCamino} y {c:TileClaro}, la Entrada, 2 terminales y la puerta de la empalizada como se indica."
EventColocarHeroes.text,Colocad a los héroes en la Entrada.
```

- Cada «Coloca…» lleva la posición de lo que se coloca: la cámara va allí. `highlight=true` marca la casilla.
- `nuevo_escenario.py` genera este arranque (y una aventura entera válida) a partir de dos piezas.
- **Dificultad**, como en Camino a la leyenda: Normal (50 de oro por héroe para empezar) o Difícil (sin oro y
  los peligros antes). *Ejemplo: raíz `EventDificultad` → `EventNormal` (`oro,=,#heroes oro,*,50
  $%gold,=,oro %dificil,=,0`) o `EventDificil`; cada aventura empieza con `amenaza,=,%dificil`.* También
  puede cambiar la Vida de los únicos (dos Spawn con `vartests`, §6.4).
- **Límites de cámara** (opcional): un evento silencioso con `mincam=true` en la esquina inferior izquierda
  del mapa y otro con `maxcam=true` en la superior derecha.

## 2. Puertas y zonas que se revelan

**Puerta → evento que la quita y coloca lo que hay detrás.** Las piezas se unen salida con salida; la puerta
va en esa unión (`mapa.py --colocar … --junto-a …` da las dos posiciones).
*Ejemplo: Aventura2 `DoorOsario` → `EventAbrirOsario` → `SpawnAcolitos…`.*

```ini
[DoorOsario]
xposition=6
yposition=-2
rotation=0
buttons=1
event1=EventAbrirOsario

[EventAbrirOsario]
xposition=7
yposition=-2
remove=DoorOsario
add=TileOsario TileTerminal2 DoorSello TokenBusquedaB
buttons=1
event1=SpawnAcolitosFuerte SpawnAcolitos
```
```text
DoorOsario.text,Una puerta de roble con herrajes oxidados.
DoorOsario.button1,{action} Abrir
EventAbrirOsario.text,"Retirad la puerta. Colocad la pieza {c:TileOsario}, un terminal, una ficha de Búsqueda y una puerta roja (sellada) como se indica."
```

**Puerta cerrada con llave** (botón gris hasta tener la llave) y **forzarla** con una prueba.
*Ejemplo: Aventura2 `DoorSello`.*

```ini
[DoorSello]
xposition=8
yposition=0
rotation=90
color=red
buttons=2
event1=EventAbrirTumba
event1Condition=VarOperation:llave,==,1
event2=EventForzarLosa
```

- `color` tiñe la puerta: ayuda a decir «la puerta roja».
- Atrancada por dentro, atascada, sellada: un botón con prueba (`EventForzar` en Aventura1, §5).
- Una pared que se derrumba o un pasadizo: una ficha (`TokenSecretA`, `TokenCrumblingTerrain`) que al
  pulsarla añade la pieza nueva.
- Todo el mapa a la vista desde el principio también es habitual en Camino a la leyenda: entonces las
  puertas solo marcan por dónde se pasa y lo que hay detrás aparece al abrirlas (monstruos, fichas).

## 3. Búsqueda

En Descent buscar es robar una carta del mazo de Búsqueda: Valkyrie solo lo dice y quita la ficha.
*Ejemplo: Aventura1 `TokenBusqueda1` → `EventBuscar1`.*

```ini
[TokenBusqueda1]
type=TokenSearch
xposition=5
yposition=0
buttons=1
event1=EventBuscar1

[EventBuscar1]
remove=TokenBusqueda1
buttons=1
event1=
```
```text
TokenBusqueda1.text,Un fardo abandonado junto al camino.
TokenBusqueda1.button1,{action} Buscar
EventBuscar1.text,Roba una carta de Búsqueda.
```

- Búsqueda con premio extra: oro (`$%gold,+,25`, *Aventura1 `EventBuscar2`*), un objeto (un QItem en el
  `add`, §11) o una pista de la historia.
- **Búsqueda especial** (`TokenSearchSpecial`): la que da algo de la aventura (una llave, el objeto clave).
- **Lo que sale al azar sin repetirse** entre varias fichas: cada ficha va a un evento silencioso con
  `event1=EventPremio1 EventPremio2 EventPremio3` y `randomevents=true`; cada premio pone su bandera y tiene
  `vartests` con esa bandera a 0 (el mismo patrón que la llave de *Affairs of Wizards*).

## 4. Objetivos, aldeanos y fichas que se recogen

**Recoger**: la ficha va a un evento que la quita y pone una variable; si importa quién la lleva, elige al
héroe (§10). **Entregar**: una ficha en el destino pregunta si está allí el portador.
*Ejemplo: Aventura2 `TokenBadajo` → `EventElegirPortador` → `EventCogerBadajo`; `TokenCuerda` →
`EventTanir`.*

```ini
[EventTanir]
buttons=2
event1=EventVictoria
buttoncolor1="green"
event2=
```
```text
EventTanir.text,¿Está en la Entrada el héroe que lleva el badajo?
EventTanir.button1,Sí
EventTanir.button2,Todavía no
```

- **Aldeanos**: `TokenVillagerMan`/`TokenVillagerWoman`. Rescatar = prueba o acción en una ficha
  (*Aventura1 `TokenAldeana`*); escoltar = reglas en el texto («se mueve 3 casillas al final de cada ronda
  hacia la Entrada») y una pregunta al final de ronda («¿Ha llegado algún aldeano a la salida?»).
- **Ficha atacable** (una puerta, un altar con Vida): Valkyrie no lleva el daño. Usa `quota` en su evento:
  «Indicad cuánto `{heart}` le habéis hecho» con `quota=8`; el daño se acumula entre intentos y al llegar a 8
  sigue por `event1` (si no, por `event2`).
- **Cuántos hay**: un contador (`entregadas,+,1`) y un evento silencioso que compara con el total, que puede
  depender de `#heroes`.

## 5. Pruebas de atributo

Valkyrie no tira dados: pregunta el resultado.
*Ejemplo: Aventura1 `EventDesatar`, `EventForzar`.*

```ini
[EventForzar]
buttons=2
event1=EventAbrirCampamento
buttoncolor1="green"
event2=EventTrancaResiste
buttoncolor2="red"
```
```text
EventForzar.text,Un héroe adyacente a la puerta realiza una prueba de {might}.
EventForzar.button1,Superada
EventForzar.button2,Fallada
EventTrancaResiste.text,La tranca aguanta y una astilla se te clava en el brazo: sufres 1 {heart}.
```

- «Cada héroe realiza una prueba de `{will}`; cada uno que falle sufre 2 `{fatigue}`» no necesita botones: lo
  aplican los jugadores.
- Prueba de un héroe al azar: `{rnd:hero}` en el texto (*Aventura2 `EventVelas`*).
- Si fallar debe dejar intentarlo otra vez, el evento de fallo no quita nada (la ficha o puerta sigue).

## 6. Monstruos

### 6.1 Grupo con sus casillas

Lo normal en Camino a la leyenda: la app enseña la casilla de cada figura, el líder con marco rojo.
*Ejemplo: Aventura1 `SpawnTrasgos` y sus `MPlaceTrasgo…`.*

```ini
[SpawnTrasgos]
monster=MonsterGoblinArcher
xposition=0
yposition=0
placement2=MPlaceTrasgoLider MPlaceTrasgo1 MPlaceTrasgo2
placement3=MPlaceTrasgoLider MPlaceTrasgo1 MPlaceTrasgo2 MPlaceTrasgo3
placement4=MPlaceTrasgoLider MPlaceTrasgo1 MPlaceTrasgo2 MPlaceTrasgo3 MPlaceTrasgo4
buttons=1
event1=EventObjetivo

[MPlaceTrasgoLider]
xposition=0
yposition=0
master=true

[MPlaceTrasgo1]
xposition=4
yposition=0
```

- Respeta el **límite de grupo** de la carta de monstruo para 2, 3 y 4 héroes (arqueros goblin y zombis: 1
  líder y 2/3/4 esbirros; los grandes suelen ser 1 líder o 1 líder y 1 esbirro; tabla en `reglas-descent.md`
  §12.1). El texto dice «respetando el límite de monstruos».
- La huella de una figura grande va hacia el este y el sur desde su casilla (§12 de `formato-escenario.md`);
  `validar.py` comprueba que cae entera en las piezas y que no se pisan.

### 6.2 Grupo en una zona

Sin `placementN`, Valkyrie marca la zona (`xposition`, `yposition`) y los jugadores colocan: «Coloca un grupo
de {type} en la pieza 9A, lo más lejos posible de los héroes».

### 6.3 Grupo abierto

Como la app, que elige monstruos de la colección: `traits` (todos) o `traitpool` (alguno). Valkyrie no repite
tipos en juego.
*Ejemplo: Aventura1 `SpawnAcechadores` (`traits=wilderness`), Aventura2 `SpawnDespertar`
(`traits=undead`).*

- Rasgos útiles: los 10 de terreno (`cave`, `wilderness`, `building`, `civilized`, `cursed`, `dark`,
  `mountain`, `hot`, `cold`, `water`) y los de Valkyrie (`small`, `medium`, `huge`, `massive`, `melee`,
  `ranged`, `undead`, `goblin`). `buscar.py --tipo monstruos --rasgo cave` dice cuáles hay.
- Asegúrate de que el juego básico tiene al menos un candidato que no esté ya en juego: si no queda ninguno,
  el evento se corta.
- Para que no salga uno concreto: `monster=MonsterX` junto a `traits` es una lista de exclusiones.
- Sin casillas (§6.2), porque no sabes su tamaño.

### 6.4 Monstruo único (jefe dentro de un grupo)

```ini
[SpawnGorruk]
monster=CustomMonsterGorruk
unique=true
uniquehealth=3
uniquehealthhero=1
placement2=MPlaceGorruk
placement3=MPlaceGorruk
placement4=MPlaceGorruk
```
```text
SpawnGorruk.uniquetitle,Gorruk el Rompehuesos
SpawnGorruk.uniquetext,Gorruk el Rompehuesos es un Ettin líder. Tiene 3 {heart} más, y 1 {heart} más por héroe. Gasta los {surge} en este orden: primero en {heart} adicional, después en Arrojar (pon al héroe lo más lejos posible de sus compañeros).
```

- La Vida adicional sale en rojo en el retrato del grupo; «Único derrotado» dispara `DefeatedUnique…`.
- El título que enseña Valkyrie es «Maestro <monstruo>» (rareza de `GetUniqueTitle`): pon el nombre propio
  en `uniquetext`, o usa un CustomMonster con `monstername` (§6.5).
- **Versiones según el estado**: dos Spawn con `vartests` opuestos en la misma lista de botón
  (`event1=SpawnAcolitosFuerte SpawnAcolitos`), cada uno con su Vida adicional (*Aventura2*).
- El jefe no debe ser del mismo tipo que otro grupo en juego: se juntarían.

### 6.5 Monstruo propio con activaciones propias

*Ejemplo: Aventura1 `CustomMonsterGorruk`; Aventura2 `CustomMonsterAcolito`.*

```ini
[CustomMonsterAcolito]
base=MonsterFleshMoulder
activation=AcolitoRito AcolitoAzote Range1

[ActivationAcolitoRito]
minionfirst=true

[ActivationAcolitoAzote]
masterfirst=true
```
```text
CustomMonsterAcolito.monstername,Acólitos de la cripta
CustomMonsterAcolito.info,Usad las miniaturas y las cartas de Moldeador de carne del Acto I. Gastan los {surge} así: primero Cerrar heridas, después +1 {heart}.
ActivationAcolitoRito.ability,"<i>Los acólitos entonan una letanía y las sombras se espesan alrededor de {0}.</i>\nEse héroe sufre 1 {fatigue}."
ActivationAcolitoRito.minion,{action} Se aleja del héroe más cercano.\n{action} Ataca al héroe con menos {will} a 3 casillas o menos.
ActivationAcolitoRito.master,{action} Cada monstruo a 3 casillas o menos del hermano Odric recupera 2 {heart}.\n{action} Ataca al héroe más cercano.
```

- En `ability`, `{0}` es un héroe al azar y `{1}` el monstruo; en `master` y `minion`, `{0}` es el monstruo.
- Mezcla activaciones propias con comunes oficiales (`Range1`, `Brawler2`…): `buscar.py --tipo activaciones`.
- Un jefe solo (grupo de una figura): escribe solo `master` (sale en un paso).
- `info` es lo que sale en «Información»: con qué figura y carta se juega y cómo gasta los aumentos.

### 6.6 Lugartenientes

Los lugartenientes (`MonsterSplig`, `MonsterLadyElizaFarrow`…; rasgo `lieutenant`) tienen sus activaciones
oficiales. Un Spawn sin casillas para ese número de héroes pone su imagen en la posición del Spawn. Si tiene
que tener nombre, Vida o reglas propias, un CustomMonster con `base=` el lugarteniente.

### 6.7 Refuerzos

Al final de las rondas pares, mientras el grupo siga en juego.
*Ejemplo: Aventura1 `EventFinRonda`, `EventRefuerzos`, `EventTrasgosDerrotados`.*

```ini
[EventFinRonda]
display=false
trigger=EndRound
operations=par,=,#round par,%,2
buttons=1
event1=EventRefuerzos

[EventRefuerzos]
vartests=VarOperation:par,==,0 VarTestsLogicalOperator:AND VarOperation:trasgosDerrotados,==,0
buttons=1
event1=

[EventTrasgosDerrotados]
display=false
trigger=DefeatedSpawnTrasgos
operations=trasgosDerrotados,=,1
buttons=1
event1=
```
```text
EventRefuerzos.text,"<b>Refuerzos:</b> colocad un esbirro del grupo de {c:SpawnTrasgos} en la Entrada (o en la casilla vacía más cercana), respetando el límite de monstruos."
```

- Un grupo que huye o desaparece sin ser derrotado: `remove=SpawnX` (no dispara `Defeated`).
- `activated=true` en un Spawn: el grupo llega ya activado y no actúa en esta ronda.

## 7. Amenaza, peligros y límite de rondas

Camino a la leyenda castiga entretenerse: una **amenaza** que sube cada ronda dispara peligros de Valkyrie.
*Ejemplo: Aventura1 y Aventura2 `EventAmenaza`, `EventPeligro…`.*

```ini
[EventAmenaza]
display=false
trigger=StartRound
operations=amenaza,+,1
buttons=1
event1=EventPeligroMortal EventPeligroMayor EventPeligroMenor

[EventPeligroMenor]
operations=peligroMenor,=,1 $perilMinor,=,1
vartests=VarOperation:amenaza,>=,4 VarTestsLogicalOperator:AND VarOperation:peligroMenor,==,0
buttons=1
event1=
```

- `$perilMinor`, `$perilMajor`, `$perilDeadly` a 1: al final de esa ronda sale un peligro al azar de ese nivel
  (textos oficiales de la app). Avisa antes con tu propio texto. Ponlos al empezar la ronda (como aquí) o
  durante ella: si los pone un evento de final de ronda, el peligro sale al final de la ronda siguiente.
- Umbrales según la duración: una aventura de 6-8 rondas, 4/6/8; acciones de los héroes que bajan la amenaza
  (`amenaza,-,1` al abrir una puerta, como hace *Affairs of Wizards*).
- **Límite de rondas**: `trigger=EndRound` con `vartests=VarOperation:#round,>=,limite` (calcula `limite` en
  `EventInicio`, p. ej. `limite,=,10 limite,-,#heroes`); un aviso dos rondas antes. O `trigger=EndRound8` si es
  fijo.
- Sucesos de una ronda concreta: `trigger=EndRound3` (*Aventura2 `EventVelas`*).

## 8. Moral y derrota

- Valkyrie pone `$%morale` = número de héroes al elegirlos; cada KO resta 1; si baja de 0, `NoMorale`.
- **El evento de `NoMorale` debe cortar el bucle**: `$end,=,1` (aventura suelta), un cambio de aventura
  (campaña) con `$%morale,=,0`, o subir la moral. Si no, vuelve a saltar tras cada evento.
  *Ejemplo: Aventura1 `EventDerrota` (`$%morale,=,0` y salto a la ciudad); Aventura2 `EventDerrota`
  (`$end,=,1`).*
- Cambiar la moral: `$%morale,+,1` («Vuestra Moral sube en 1», *Aventura1 `EventAldeanaLibre`*). Recuperarla en
  una ciudad: `$%morale,=,#heroes` (*Interludio*).
- Otras derrotas (tiempo, un aldeano muerto, los monstruos llegan a la salida): eventos con su condición que
  pongan `$end,=,1` o salten a la ciudad.

## 9. Victoria y recompensas

*Ejemplo: Aventura1 `EventVictoria`.*

```ini
[EventVictoria]
trigger=DefeatedUniqueSpawnGorruk
add=QItemBotin
operations=%ganada1,=,1 $%xp,+,1 oro,=,#heroes oro,*,25 $%gold,+,oro $%fame,+,1
buttons=1
event1=Interludio/quest.ini
```
```text
EventVictoria.text,"<b>Victoria</b>\n\nGorruk se desploma junto al carro…\n\nCada héroe recibe 1 PE. Los héroes ganan 25 de oro por héroe y 1 de fama."
EventVictoria.button1,Volver a Puertoalto
```

- Disparadores de victoria: `DefeatedUnique<Spawn>` o `Defeated<Spawn>` (derrotar al jefe o al grupo),
  `DefeatedUniqueCustomMonsterX` (por tipo, para varias versiones del Spawn), o el evento de una ficha.
- Recompensas: `$%xp` (PE, comunes), `$%gold`, `$%fame`, un objeto (un QItem), una variable de campaña (`%…`)
  que cambie lo que viene. Dilo en el texto con las fórmulas de la comunidad.
- Aventura suelta: `$end,=,1`. En una campaña: salta a la siguiente (§12); la última pone `$end,=,1`.
- Valkyrie no tiene pantalla de recompensas: el texto es la pantalla.

## 10. Héroes concretos

- **Elegir un héroe**: un evento con `minhero=1` y `maxhero=1` (con el diálogo abierto se pulsa su retrato);
  `{c:EventX}` es su nombre en los textos que vengan después.
  *Ejemplo: Aventura2 `EventElegirPortador`.*

```ini
[EventElegirPortador]
minhero=1
maxhero=1
buttons=1
event1=EventCogerBadajo
```
```text
EventElegirPortador.text,¿Quién coge el badajo? Pulsad el retrato de ese héroe (debe estar en la ficha o adyacente) y después Continuar.
EventCogerBadajo.text,"{c:EventElegirPortador} levanta el badajo…"
```

- Un héroe al azar: `{rnd:hero}`.
- Según quién juega: `#HeroAshrian`, `#ClassKnight`, o por arquetipo con varios (`VarOperation:#ClassDisciple,==,1
  VarTestsLogicalOperator:OR …`), p. ej. para un evento solo si hay sanador.

## 11. Objetos

```ini
[QItemBotin]
starting=False
traitpool=act1
```

- **Dar un objeto**: un QItem en el `add` del evento (uno solo: el diálogo enseña su carta). Al azar por
  rasgos (`traitpool=act1`, `traits=relic`…) o uno concreto (`itemname=ItemDawnblade`, una reliquia).
- **Quitarlo**: `remove=QItemX`.
- Valkyrie no tiene una variable por objeto: si importa que el grupo lo tenga, pon una variable al dárselo.
- Los objetos iniciales son los de la clase de cada héroe; `starting=True` no hace nada en Descent.
- ⚠️ Dos o más QItem en el mismo `add` abren la tienda (§13), no los dan.

## 12. Campañas

Estructura de la minicampaña de ejemplo (la de las campañas publicadas, en pequeño):

```
LaCampanaDeVadoscuro/
├── quest.ini              raíz: introducción, fama, dificultad y oro → Aventura1/quest.ini
├── Aventura1/quest.ini    hidden=True; victoria y derrota → Interludio/quest.ini
├── Interludio/quest.ini   hidden=True; ciudad: moral, tienda, donativo, viaje → Aventura2/quest.ini
└── Aventura2/quest.ini    hidden=True; final de la campaña ($end)
```

- **La raíz** prepara lo de toda la campaña: umbrales de fama (`$%fameimpressive,=,2 $%famecelebrated,=,4
  $%fameheroic,=,6 $%famelegendary,=,8`), la dificultad y el oro inicial, variables `%` de estado. *Raíz
  `EventInicio`, `EventDificultad`.*
- **Rutas** relativas a la raíz (`Interludio/quest.ini` también desde `Aventura1/`).
- **Lo que pasa de una aventura a otra**: `%…` y `$%…`, héroes, clases, habilidades y objetos. Lo demás se
  borra. Nombres de variable de 2 caracteres o más.
- **Lo que cambia según lo anterior**: eventos con `vartests` sobre `%…` en la misma lista de botón
  (*Aventura2 `EventPrologoGanada`/`EventPrologoPerdida`, `EventIlsa`*) o Spawn alternativos (§6.4).
- **En Descent se sigue aunque se pierda**: la derrota da menos recompensa y cambia la historia, pero la
  campaña continúa (*Aventura1 `EventDerrota`*).
- **Idiomas**: cada aventura con `Localization.English.txt` además del español (tras el cambio de aventura,
  Valkyrie no carga el `defaultlanguage`).
- **Ciudad / fase de campaña** (*Interludio*): moral a su valor inicial, tienda (§13), gastos de oro con
  botones condicionados (`event2Condition=VarOperation:$%gold,>=,25 …`, *`EventCiudad`*), y al partir
  `$@travelevent,=,1` (evento de viaje de Valkyrie) y el salto a la aventura siguiente.
- **Elegir la siguiente aventura**: botones (o UI en un mapa, §14) que pongan `%siguiente` y una lista de
  eventos silenciosos `EventIrAventuraN` con `vartests` sobre `%siguiente` cuyo `event1` es la ruta.
- **Actos**: una variable `%acto`; la tienda del Acto II con QItem `traitpool=act2`.
- `nuevo_escenario.py --campana N` genera esta estructura con N aventuras.

## 13. La tienda

*Ejemplo: Interludio `EventMercado`, `EventSalirMercado`.*

```ini
[QItemMercado1]
starting=False
traitpool=act1

[EventMercado]
display=false
add=QItemMercado1 QItemMercado2 QItemMercado3 QItemMercado4 QItemMercado5
buttons=1
event1=EventSalirMercado

[EventSalirMercado]
display=false
remove=#shop
buttons=1
event1=EventCiudad
```
```text
EventMercado.button1,Salir del mercado
```

- 2 o más QItem en un `add` = tienda con esos objetos; sus botones son los del evento.
- **Ciérrala siempre con `remove=#shop`** en el evento de su botón de salir (en el mismo evento que la abre no
  sirve) y antes de cualquier cambio de aventura. Volver a entrar al mismo evento enseña lo que queda.
- Mientras la tienda está abierta no hay diálogo, así que los botones Habilidades y Objetos funcionan: es el
  momento de gastar PE en la ciudad (dilo en el texto).
- Fija los umbrales de fama antes (§12): sin ellos el nivel es «legendary» y apenas salen objetos del Acto I.
  Los objetos se sortean al cargar la aventura; en una aventura suelta, añade `$restock,=,1` al evento de
  inicio que fija los umbrales (`formato-escenario.md` §15).
- Nuevas existencias: `$restock,=,1` (vuelve a sortear y vacía las tiendas). Mercado negro: otra tienda con
  objetos de `traitpool=act2`, con su propio evento.
- `$%sellratio,=,0.5` para vender a mitad de precio (competitivo); 0 = precio completo (Camino a la leyenda).

## 14. UI: mapa de campaña, ciudad e imágenes

- Fondo de la ciudad: *Interludio `UICiudad`* (`image=ImageCityNight`, `size=1`), añadido al llegar y
  quitado al partir.
- Mapa de campaña: una UI con la imagen del mapa (propia o `ImageMap`) y UI pequeñas encima, cada una con
  el evento de viajar a una aventura (*The Shadow Rune* lo hace así).
- ⚠️ Con una UI en el tablero no se puede abrir la ventana de un héroe (fin del turno, KO): quítalas antes de
  jugar rondas.

## 15. Variación y rejugabilidad

- Grupos abiertos por rasgos (§6.3).
- Premios al azar sin repetir (§3), `randomevents=true` en cualquier lista.
- `#randN` como valor: `suerte,=,#rand6`.
- Activaciones propias con `vartests` (una activación más violenta cuando `furia==1`).

## 16. Disparadores por variable

Al poner `@nombre` a 1, al acabar el evento salta `trigger=Varnombre` (y la variable vuelve a 0). Sirve para
lanzar algo desde varios sitios o para separar la consecuencia del evento que la provoca.
*Ejemplo: Aventura2 `EventCogerBadajo` (`@despertar,=,1`) → `EventDespertar` (`trigger=Vardespertar`).*

## 17. Expansiones

- `packs=LoR` si la aventura no se puede jugar sin ella (piezas, monstruos fijos, objetos).
- Contenido opcional: `vartests=VarOperation:#LoR,==,1` y una alternativa del básico.
- `monster=MonsterArachyura MonsterEttin`: el primero disponible; los grupos abiertos ya eligen entre lo que
  el jugador tiene.

## 18. Sonido y música

- `music=AudioCityAmbience` en la ciudad, `AudioWorldMap` en el mapa; `audio=AudioGold1` al ganar oro.
  Lista en `catalogo.md` (todos vienen de la importación oficial).
- Una pista suelta en `music` suena y vuelve la anterior; varias, en bucle (repite una para que no acabe).
