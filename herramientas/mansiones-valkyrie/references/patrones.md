# Recetario de patrones para escenarios de Valkyrie (MoM 2ª ed.)

Soluciones probadas para lo que hace la app oficial, listas para copiar y adaptar. Cada receta indica
los ficheros (`events.ini`, `tokens.ini`…) y los textos (`Localization.Spanish.txt`). Casi todas
están en funcionamiento en el escenario de ejemplo `assets/ejemplo/LaCasaDelRelojero` (se indica el
componente). El significado exacto de cada clave está en `formato-escenario.md`.

## Índice

0. [Convenciones](#0-convenciones)
1. [Arranque y preparación](#1-arranque-y-preparación)
2. [Explorar y revelar zonas](#2-explorar-y-revelar-zonas)
3. [Buscar](#3-buscar)
4. [Interactuar y fichas de Vistazo](#4-interactuar-y-fichas-de-vistazo)
5. [Personajes y conversaciones](#5-personajes-y-conversaciones)
6. [Tiradas](#6-tiradas)
7. [Variables útiles: banderas, contadores, mínimo y máximo](#7-variables-útiles-banderas-contadores-mínimo-y-máximo)
8. [Progreso y revelación del objetivo](#8-progreso-y-revelación-del-objetivo)
9. [Tiempo: temporizador oculto, avisos y derrota](#9-tiempo-temporizador-oculto-avisos-y-derrota)
10. [Mitos](#10-mitos)
11. [Monstruos](#11-monstruos)
12. [Objetos](#12-objetos)
13. [Rompecabezas](#13-rompecabezas)
14. [UI: prólogos, cartas y diarios](#14-ui-prólogos-cartas-y-diarios)
15. [Finales](#15-finales)
16. [Variación y rejugabilidad](#16-variación-y-rejugabilidad)
17. [Entorno: fuego, oscuridad, obstrucciones](#17-entorno-fuego-oscuridad-obstrucciones)
18. [Disparadores por variable y bucles](#18-disparadores-por-variable-y-bucles)
19. [Campañas y escenarios en varias partes](#19-campañas-y-escenarios-en-varias-partes)
20. [Sonido y música](#20-sonido-y-música)

---

## 0. Convenciones

- Nombres de componente: prefijo de tipo + nombre en CamelCase sin acentos (`EventRevelarTaller`,
  `TokenExplorarTaller`, `TileTaller`). Agrupa por zona o acto: todo lo del taller lleva "Taller".
- Un evento por pantalla de texto. 2-4 frases por diálogo: si el texto desborda, tapa los botones.
- Etiqueta **siempre** cada botón (`EventX.button1`), aunque sea "Continuar".
- `{action}` delante de la etiqueta = esa opción cuesta 1 acción (como en la app oficial). Las
  opciones gratuitas (leer, cerrar, "no había nadie") no lo llevan.
- Narración en segunda persona con **vosotros** (o tú en cartas personales); los personajes pueden
  tratar de usted. Términos oficiales: "tirada de {observation}", "sufres 1 de Horror", "ficha de
  Búsqueda", "Objeto único", "ganas 1 Pista" (`reglas-mom.md` §17).
- Tras escribir: `python scripts/validar.py <carpeta>` y `python scripts/grafo.py <carpeta>`.

## 1. Arranque y preparación

Un único evento con `trigger=EventStart` (con varios, el orden no es fiable). Es silencioso y
prepara las variables; la cadena coloca el mapa inicial paso a paso.
*Ejemplo: `EventInicio` → … → `EventColocarFichasVestibulo`.*

```ini
[EventInicio]
display=false
buttons=1
event1=EventPrologo
trigger=EventStart
operations=$mythosFlavor,=,1 $mythosIndoors,=,1 rondaMortal,=,17 rondaMortal,-,#heroes rondaMayor,=,rondaMortal rondaMayor,/,2 rondaMenor,=,rondaMayor rondaMenor,/,2 objetivo,=,#heroes objetivo,/,2 objetivo,+,1

[EventPrologo]
buttons=1
event1=EventColocarInicio

[EventColocarInicio]
xposition=3.5
yposition=-1.75
buttons=1
event1=EventColocarInvestigadores
add=TileVestibulo

[EventColocarInvestigadores]
xposition=1.75
yposition=-1.75
highlight=true
buttons=1
event1=EventColocarFichas
add=TokenInvestigadores

[EventColocarFichas]
xposition=3.5
yposition=-1.75
buttons=1
event1=
add=TokenPerchero TokenExplorarTaller
remove=TokenInvestigadores
```
```ini
; tokens.ini
[TokenInvestigadores]
type=TokenInvestigators
xposition=1.75
yposition=-1.75
display=false
buttons=0
```
```text
EventPrologo.text,"<i>Arkham, otoño de 1926.</i>\n\nUna carta sin remite os cita esta noche en la casa de Elias Thorne."
EventPrologo.button1,Continuar
EventColocarInicio.text,Coloca {c:TileVestibulo}.
EventColocarInicio.button1,Continuar
EventColocarInvestigadores.text,Colocad a los investigadores en el espacio indicado.
EventColocarInvestigadores.button1,Continuar
EventColocarFichas.text,Coloca una ficha de Búsqueda y una de Exploración donde se indica.
EventColocarFichas.button1,Empezar
```

- Cada evento "Coloca…" lleva la posición del componente: la cámara va ahí.
- `TokenInvestigadores` se añade y se quita: solo marca dónde empiezan.
- `{c:TileX}` muestra el nombre oficial de la loseta en el idioma del jugador.
- Objetos iniciales: QItem con `starting=True` (§12). Prólogo con imagen: §14.
- `nuevo_escenario.py` genera un arranque como este (con el plazo calculado según `--duracion` y
  `objetivo=1` provisional hasta que haya varias fuentes de progreso, §8).

## 2. Explorar y revelar zonas

**Ficha de Exploración en una puerta → evento que revela la loseta y sus fichas.**
*Ejemplo: `TokenExplorarTaller` → `EventRevelarTaller` → `EventColocarFichasTaller`.*

```ini
[TokenExplorarTaller]
type=TokenExplore
xposition=5.25
yposition=0
buttons=1
event1=EventRevelarTaller

[EventRevelarTaller]
xposition=3.5
yposition=1.75
buttons=1
event1=EventColocarFichasTaller
remove=TokenExplorarTaller
add=TileTaller TokenParedTaller
operations=$mythosStudy,=,1
audio=AudioDoorOpen1

[EventColocarFichasTaller]
xposition=3.5
yposition=1.75
buttons=1
event1=
add=TokenEscritorio TokenBanco
```
```text
TokenExplorarTaller.text,Una puerta entornada. Por la rendija se ve el resplandor de una lámpara.
TokenExplorarTaller.button1,{action} Explorar
EventRevelarTaller.text,"<b>El taller</b>\nColoca {c:TileTaller} y una ficha de Pared donde se indica. Cientos de relojes desmontados cubren cada superficie."
EventRevelarTaller.button1,Continuar
EventColocarFichasTaller.text,Coloca una ficha de Búsqueda y una de Interacción donde se indica.
EventColocarFichasTaller.button1,Continuar
```

- La ficha de Exploración va en el **centro de la puerta** (`mapa.py` lo calcula) y se retira al
  explorar. En losetas exteriores sin puertas (calles, muelles, jardines) va sobre el **borde
  abierto**, en el centro del lado de un espacio: el informe de `mapa.py` propone esos puntos
  ("Exploración en (x,y)"). Coordenadas de losetas y fichas: `mapa-losetas.md`.
- Si una puerta de la loseta ya colocada da contra la pared de la nueva, tápala con
  `TokenWallInside` (`rotation=0` en bordes horizontales, `90` en verticales, `clickeffect=false`).
- Si la zona tiene un lugar concreto para los Mitos, enciende su variable (`$mythosStudy`…, §10).
- **Dos entradas a la misma habitación**: dos fichas que llevan al mismo evento, que retira ambas
  (`remove=TokenA TokenB`; retirar una ficha que no está en el tablero no hace nada). La segunda
  se coloca solo si la habitación sigue oculta (*ejemplo: `EventPasilloOtraPuerta`*):

```ini
[EventPasilloOtraPuerta]
xposition=7
yposition=-5.25
buttons=1
event1=
add=TokenExplorarDormitorio2
vartests=VarOperation:dormitorioRevelado,==,0
```

- **Puerta cerrada** (llave o fuerza). El botón de la llave solo aparece si la tienen
  (*ejemplo: `TokenExplorarEscalera`*):

```ini
[TokenExplorarEscalera]
type=TokenExplore
xposition=14
yposition=-1.75
buttons=2
event1=EventAbrirConLlave
event1Condition=VarOperation:llaveEncontrada,==,1
event1ConditionAction=hide
event2=EventForzarPuerta
```
```text
TokenExplorarEscalera.button1,{action} Abrir con la llave de latón
TokenExplorarEscalera.button2,{action} Forzar la puerta
```
  `EventForzarPuerta` es una tirada acumulativa (§6). Valkyrie no sabe qué objetos tiene cada
  investigador: usa una variable que pones a 1 al dar la llave, o pregunta ("¿Tenéis la llave?").
- **Entrar en la zona explorada (hazlo siempre)**: la app oficial cierra casi todas las
  exploraciones con un último mensaje, **enfocando la puerta**, que deja entrar a quien ha explorado
  sin gastar movimiento. Es lo que la mesa espera; sin él, explorar se come el turno. Ponlo como
  **último evento de la cadena** (después de colocar las fichas), con `xposition`/`yposition` de la
  puerta. Si la cadena también se usa para otras cosas (reponer fichas, una escena que coloca la loseta),
  enciende una variable al revelar y que el mensaje solo salga con ella:

```ini
[EventRevelarTaller]
operations=$mythosStudy,=,1 recienExplorada,=,1
event1=EventColocarFichasTaller
...
[EventColocarFichasTaller]
add=TokenEscritorio TokenBanco
event1=EventEntrarTaller

[EventEntrarTaller]
buttons=1
event1=
vartests=VarOperation:recienExplorada,==,1
operations=recienExplorada,=,0
xposition=5.25
yposition=0
```
```text
EventEntrarTaller.text,<i>Quien ha explorado puede moverse 1 espacio a través de esta puerta, a la zona que acaba de revelar.</i>
```
  Si quien abre la puerta no puede entrar (le pasa algo que lo saca del tablero, la puerta se
  atasca), apaga la variable en ese evento. Las fichas de **Vistazo** (la otra cara) son distintas:
  sirven para zonas abiertas que se amplían (calles, jardines, muelles), la app no suele pedir
  acción por ellas ni dice que te muevas; el espacio ya es accesible. `validar.py` avisa (INFO) de
  las fichas de Exploración cuya cadena no dice que se pueda entrar.
- Losetas que "se mueven" (Más Allá del Umbral, carrozas…): `remove=TileX` y `add=TileX2` (misma
  cara, otra posición) e indica a los jugadores que lleven también lo que había encima.

## 3. Buscar

**Con tirada, repetible si falla** (*ejemplo: `TokenPerchero`*):

```ini
[TokenPerchero]
type=TokenSearch
xposition=2.6
yposition=-2.6
buttons=1
event1=EventPercheroTirada

[EventPercheroTirada]
buttons=2
event1=EventPercheroExito
event2=EventPercheroFallo
buttoncolor1="green"
buttoncolor2="red"

[EventPercheroExito]
buttons=1
event1=EventComprobarProgreso
remove=TokenPerchero
operations=progreso,+,1
audio=AudioPapers2

[EventPercheroFallo]
buttons=1
event1=
```
```text
TokenPerchero.text,Un perchero del que cuelgan un gabán húmedo y un paraguas roto.
TokenPerchero.button1,{action} Registrar los bolsillos
EventPercheroTirada.text,Realiza una tirada de {observation} (1).
EventPercheroTirada.button1,Superada
EventPercheroTirada.button2,Fallada
EventPercheroExito.text,"En un bolsillo hay un recibo de una librería de viejo.\n\nGanas 1 Pista."
EventPercheroExito.button1,Continuar
EventPercheroFallo.text,Solo encuentras pelusa y un botón suelto.
EventPercheroFallo.button1,Continuar
```

- **Sin tirada, con objeto**: el evento del botón da el objeto (`add=QItemX`, uno por evento),
  retira la ficha y suma progreso (*ejemplo: `EventEscritorio`*).
- **Resultado según el estado**: lista de eventos con condiciones, se ejecuta el primero habilitado
  (*ejemplo: `TokenJoyero` → `EventJoyeroLlave` (si aún no tienen la llave) o `EventJoyeroVacio`*):
  `event1=EventJoyeroLlave EventJoyeroVacio` y `vartests` en el primero.
- **Resultado al azar**: `randomevents=true` y varios eventos en `event1` (§16).
- Cada búsqueda debería aportar historia, no solo un objeto suelto.

**Búsquedas que encajan con el dibujo.** Antes de escribir una búsqueda, mira qué hay dibujado en
esa loseta (`python scripts/losetas.py ver TileSideStudy`) y pon la ficha encima del objeto que
nombra el texto (`python scripts/losetas.py colocar MiEscenario TileTaller:escritorio`). En el
ejemplo, `TokenEscritorio` está sobre el escritorio del estudio, `TokenFoto` sobre la mesilla y
`TokenJoyero` sobre la mesa del gramófono. Los objetos con uso «registrar» son los candidatos
naturales para Búsquedas, los de «interactuar» (mecanismos, cocinas, órganos) para Interacción, y
los de «esconderse» y «trepar» dan ideas para tiradas y escapadas. Lo dibujado orienta y no limita:
una búsqueda puede revelar algo que no se ve (un doble fondo, un pasadizo detrás de la estantería),
y una zona vacía puede tener lo que la historia necesite.

## 4. Interactuar y fichas de Vistazo

**Interacción con varias opciones** (*ejemplo: `TokenMecanismo`*). Las opciones con condición
salen en gris (o se ocultan con `hide`) mientras no se cumpla:

```ini
[TokenMecanismo]
type=TokenInteract
xposition=26.25
yposition=-5.25
buttons=2
event1=EventAntesDelPuzle
event1Condition=VarOperation:objetivoRevelado,==,1
event2=EventDestrozar
event2Condition=VarOperation:objetivoRevelado,==,1
```

**Vistazo** (`TokenSight`): leerla es gratis; puede tener una opción con `{action}`. Para "apagar"
la opción tras usarla, pon `vartests` en el evento destino: cuando ningún destino está habilitado
la ficha solo muestra su texto y "Cancelar" (*ejemplo: `TokenRelojPie` → `EventRelojTirada` con
`vartests=VarOperation:relojEscuchado,==,0`*).

- Las fichas **ignoran sus propias `vartests`**: para que una ficha aparezca según el estado,
  añádela desde el evento que cambia ese estado; para quitarla, `remove=`.
- Para cambiar lo que hace una ficha tras un suceso: retírala y añade otra en el mismo sitio con
  otro evento ("sustituir la ficha"), o usa condiciones en sus botones.
- Fichas decorativas (pared, oscuridad): `display=false`, `buttons=0`, `clickeffect=false`.

## 5. Personajes y conversaciones

Ficha de Personaje con un botón por tema; los temas aparecen al descubrir cosas (`hide`), y cada
tema da su recompensa solo la primera vez. *Ejemplo: `TokenMargaret`.*

```ini
[TokenMargaret]
type=TokenPurpleWoman
xposition=5.25
yposition=-1.75
buttons=3
event1=EventMargaretElias
event2=EventMargaretDiario
event2Condition=VarOperation:diarioEncontrado,==,1 VarTestsLogicalOperator:AND VarOperation:margaretDiario,==,0
event2ConditionAction=hide
event3=EventMargaretEleanor
event3Condition=VarOperation:fotoVista,==,1 VarTestsLogicalOperator:AND VarOperation:margaretEleanor,==,0
event3ConditionAction=hide

[EventMargaretElias]
buttons=1
event1=EventMargaretEliasPista

[EventMargaretEliasPista]
display=false
buttons=1
event1=EventComprobarProgreso
vartests=VarOperation:margaretElias,==,0
operations=margaretElias,=,1 progreso,+,1
```
```text
TokenMargaret.text,Margaret Thorne retuerce un pañuelo entre las manos.
TokenMargaret.button1,{action} Preguntar por Elias
TokenMargaret.button2,{action} Enseñarle el diario
TokenMargaret.button3,{action} Preguntar por Eleanor
EventMargaretElias.text,«Desde que murió la tía Eleanor, mi tío apenas salía del sótano.»
EventMargaretElias.button1,Continuar
```

- "Solo la primera vez": el evento que da la recompensa es silencioso y tiene `vartests` sobre una
  bandera que él mismo pone a 1. La conversación se puede repetir; la recompensa no.
- **Tirada de Influencia** para convencer: igual que §6, con `{influence}`.
- **A quién le pasa algo.** ⚠️ En Mansiones **no** se puede pedir que pulsen un retrato: `minhero`/`maxhero`
  en un evento bloquea la partida, porque los retratos desaparecen al empezar (`validar.py` lo marca como
  error). Cuatro maneras, de la más sencilla a la más completa:
  1. **Que lo decida la mesa** y lo aplique ella: «El investigador más cercano gana…». La app no lo sabe.
  2. **Un apodo**: «Pulsad Continuar; quien la haya cogido será, desde ahora, *el Infectado*». Después se
     dice «el Infectado sufre 1 de Horror» en Mitos, en otra noche o donde haga falta, y la mesa sabe quién
     es. Nombres con género fijo («el Ancla», «la Mano Caliente», «Once Segundos») valen para cualquiera.
  3. **Al azar**: `{rnd:hero}` en el texto pone a uno al azar (el mismo en todo ese texto), y después
     `{c:EventoDondeSalio}` repite su nombre. No pongas un botón «otro» para volver a sortear: es poco fiable.
  4. **Un botón por investigador**: el evento tiene un botón por cada investigador que existe, con
     `eventNCondition=VarOperation:#HeroAgathaCrane,==,1` y `eventNConditionAction=hide`, así que solo
     salen los que juegan, más «Otro investigador». Cada botón va a un evento silencioso común que guarda
     el número en una variable (`sel`), y un distribuidor lleva a la continuación de esa pregunta
     (`<Evento>Sigue`). Como `{c:…}` no puede dar ese nombre, después se usa un apodo (2). Lo monta
     `scripts/selector_investigador.py` (los 40 investigadores de la caja y las expansiones):
     ```bash
     python scripts/selector_investigador.py MiEscenario EventMordisco \
            "Algo os muerde en la oscuridad.\n\n<i>¿A quién? Desde ahora será el Infectado.</i>" --apodo "el Infectado"
     ```
     Guarda quién fue en `quienN` y cambia `{c:EventMordisco}` por el apodo en todos los textos.
- En Descent sí se eligen héroes pulsando su retrato (`minhero`/`maxhero`), porque allí no se quitan.
- Un personaje que **se mueve**: retira su ficha y añádela en otra posición ("Mueve a Margaret al
  espacio indicado"). Un personaje que se convierte en monstruo: `remove=TokenX` + un Spawn en su
  posición.
- Personajes únicos con nombre: `TokenRichardBechman`…; genéricos: `TokenWhiteWoman`,
  `TokenGreyMan`… (`buscar.py --tipo fichas --clase personaje`).

## 6. Tiradas

**Superada / fallada**: dos botones con colores. Escribe la dificultad entre paréntesis:
"Realiza una tirada de {lore} (2)." (= hacen falta 2 Éxitos).

**Acumulativa (cuota)**: un selector 0-10 y un solo botón. Los éxitos se suman entre intentos;
al llegar a `quota` sigue por `event1` (y el contador vuelve a 0); si no, por `event2`.
*Ejemplo: `EventForzarPuerta`.*

```ini
[EventForzarPuerta]
buttons=2
quota=3
event1=EventPuertaCede
event2=EventPuertaAguanta
```
```text
EventForzarPuerta.text,Embestís la puerta. Realiza una tirada de {strength} e indica tus éxitos. Se acumulan entre intentos: la puerta cede con 3.
EventForzarPuerta.button1,Confirmar
EventForzarPuerta.button2,Confirmar
```

**Acumulativa que se puede reiniciar o escalar**: la cuota de Valkyrie guarda lo sumado por
nombre de evento y no hay forma de ponerlo a 0. Si hace falta (una puerta que se cierra otra vez,
un umbral según `#heroes`), suma tú los éxitos en una variable:

```ini
[EventForzarPuerta]
buttons=1
quota=exitosPuerta
operations=exitosPuerta,=,0
event1=EventForzarPuertaSuma

[EventForzarPuertaSuma]
display=false
buttons=1
operations=fuerzaPuerta,+,exitosPuerta
event1=EventPuertaCede EventPuertaAguanta

[EventPuertaCede]
vartests=VarOperation:fuerzaPuerta,>=,umbralPuerta
operations=fuerzaPuerta,=,0
```

`quota=variable` muestra el selector empezando en el valor de la variable: ponla a 0 en el mismo
evento (las operaciones van antes de la ventana) para que empiece en 0.

**"Indica cuántos éxitos sacaste" y ramificar**: `quota=nombreVariable` guarda el número en esa
variable y sigue siempre por `event1`, que ramifica con condiciones:

```ini
[EventInterrogar]
buttons=1
quota=exitosInterrogar
event1=EventInterrogar3 EventInterrogar1 EventInterrogar0

[EventInterrogar3]
vartests=VarOperation:exitosInterrogar,>=,3
buttons=1
event1=

[EventInterrogar1]
vartests=VarOperation:exitosInterrogar,>=,1
buttons=1
event1=

[EventInterrogar0]
buttons=1
event1=
```

**Daño y Horror en el texto** (estilo oficial):
- "Sufres 2 de Daño." / "Sufres 1 de Horror boca abajo."
- "Realiza una tirada de {will}: sufres 3 de Horror (anulado por {will})." (cada Éxito evita 1).
- "Cada investigador en el sótano sufre…", "El investigador con menos {agility}…".
- Estados: "quedas Aturdido", "quedas Desconcertado", "quedas Retenido", "ganas el Estado
  Concentrado". "Lanza 2 dados" no es una tirada (no admite Pistas).
- Valkyrie no lleva la cuenta de Daño, Horror, Estados ni Pistas: los jugadores los gestionan.
  Probabilidades para elegir la dificultad: `reglas-mom.md` §6.5 (con 3-4 dados, dificultad 2 ≈
  30-50 % sin Pistas).

## 7. Variables útiles: banderas, contadores, mínimo y máximo

- **Bandera**: `operations=diarioEncontrado,=,1`; condición `VarOperation:diarioEncontrado,==,1`.
- **Contador**: `progreso,+,1`; condición `VarOperation:progreso,>=,objetivo` (se puede comparar
  con otra variable).
- **Copiar el valor de otra**: `rondaMayor,=,#round`.
- **Mínimo de dos valores** (sin función min): evento silencioso con condición
  (*ejemplo: `EventAjustarFin`*):

```ini
[EventAjustarFin]
display=false
buttons=0
vartests=VarOperation:rondaFin,>,limiteTrasObjetivo
operations=rondaFin,=,limiteTrasObjetivo
```
- **Concentrador** ("hub"): un evento silencioso al que llegan todos los descubrimientos y que
  comprueba lo que toque (*ejemplo: `EventComprobarProgreso`*). Añadir comprobaciones nuevas es
  añadir eventos a su lista.
- **Dos condiciones en cualquier orden** (romper la cadena **y** recitar el conjuro): cada acción
  pone su bandera y salta al mismo concentrador, que solo sigue cuando están las dos:

```ini
[EventCadenaRota]
buttons=1
event1=EventComprobarRitual
operations=cadenaRota,=,1

[EventCantoRoto]
buttons=1
event1=EventComprobarRitual
operations=cantoRoto,=,1

[EventComprobarRitual]
display=false
buttons=1
event1=EventVictoriaRitual
vartests=VarOperation:cadenaRota,==,1 VarTestsLogicalOperator:AND VarOperation:cantoRoto,==,1
```
  Si falta una, `EventComprobarRitual` está deshabilitado y la cadena termina sin más. Para "dos de
  tres", suma un contador y compara con `>=,2`.
- Tras dividir, compara con `>=`/`<=`, nunca `==`.
- Nombres sin espacios, comas ni prefijos raros. Una errata en un nombre crea una variable nueva a
  0 sin avisar (en el registro sale "Adding quest var"): `validar.py` avisa de variables que se leen
  y nunca se escriben.

## 8. Progreso y revelación del objetivo

Como en la app oficial, el objetivo está oculto: se revela cuando el grupo ha descubierto lo
suficiente. El umbral escala con el número de investigadores.

```ini
[EventInicio]
; fragmento: añade a sus operations  objetivo = 1 + investigadores/2  (2→2, 3→2,5, 4→3, 5→3,5)
operations=objetivo,=,#heroes objetivo,/,2 objetivo,+,1

[EventComprobarProgreso]
display=false
buttons=1
event1=EventRevelarObjetivo

[EventRevelarObjetivo]
buttons=1
event1=EventAjustarFin
vartests=VarOperation:progreso,>=,objetivo VarTestsLogicalOperator:AND VarOperation:objetivoRevelado,==,0
operations=objetivoRevelado,=,1 rondaMayor,=,#round limiteTrasObjetivo,=,#round limiteTrasObjetivo,+,6
audio=AudioImportant1
music=AudioAtmosphere5
```
```text
EventRevelarObjetivo.text,"<b>Objetivo</b>\nAhora lo entendéis: ...\n\n<b>Bajad al sótano y detened el mecanismo.</b>"
EventRevelarObjetivo.button1,Continuar
```

- Ten **más fuentes de progreso que el máximo necesario** (el ejemplo tiene 6 para un máximo de 4)
  para que ninguna pista perdida bloquee la partida.
- Al revelarlo: endurece los Mitos (`rondaMayor,=,#round` adelanta los mayores), arranca o acorta
  el temporizador (§9) y activa las opciones finales (condiciones con `objetivoRevelado`).
- Dilo con claridad: "Objetivo: …" en negrita. Lo que no esté escrito, los jugadores no lo sabrán.

## 9. Tiempo: temporizador oculto, avisos y derrota

Plazo según la duración prevista (K = ronda de los Mitos mortales con 0 investigadores; se resta
`#heroes`). La guía de la comunidad usa 20 para partidas de 2-3 horas; para partidas más cortas es
una adaptación propia que hay que ajustar probando (`nuevo_escenario.py --duracion` la aplica):

| Duración (`lengthmax`) | K | Mortales (2 / 4 investigadores) | Fin = K + 2 − `#heroes` |
|---|---|---|---|
| hasta 90 min | 15 | ronda 13 / 11 | 15 / 13 |
| hasta 120 min | 17 | 15 / 13 | 17 / 15 |
| hasta 180 min | 20 | 18 / 16 | 20 / 18 |
| más | 23 | 21 / 19 | 23 / 21 |

Al revelar el objetivo conviene acortarlo a "como mucho 6 rondas más" (`EventAjustarFin`, §7).

```ini
[EventInicio]
; fragmento: añade a sus operations (K=17: partida de hasta 120 minutos)
operations=rondaMortal,=,17 rondaMortal,-,#heroes rondaFin,=,rondaMortal rondaFin,+,2 rondaAviso,=,rondaFin rondaAviso,-,2

[EventAvisoTiempo]
buttons=1
event1=
trigger=EndRound
vartests=VarOperation:#round,>=,rondaAviso VarTestsLogicalOperator:AND VarOperation:avisoDado,==,0
operations=avisoDado,=,1
audio=AudioClock

[EventDerrotaTiempo]
buttons=1
event1=
trigger=EndRound
vartests=VarOperation:#round,>=,rondaFin
operations=$end,=,1
audio=AudioGameOver
```

- `#round` empieza en 1 y sube al acabar cada ronda. Los eventos `EndRound` se ejecutan tras el
  paso de Horror y **antes** de que suba: dentro de ellos `#round` es la ronda que termina. Con
  `#round,>=,rondaFin` los jugadores juegan `rondaFin` rondas completas.
- Define la derrota **después** del aviso: los eventos del mismo disparador salen en orden inverso
  (pila), así la derrota se resuelve primero si coinciden.
- Temporizador relativo: guarda `inicio,=,#round` en el momento clave y compara
  `#round` con `inicio` + N (variable auxiliar).
- Un monstruo o un fallo puede **acelerar el reloj** (`rondaFin,-,1 rondaAviso,-,1`) y una buena
  acción **retrasarlo** (*ejemplo: `EventRelojeroAcelera` y `EventEleanorDescansa`*).
- Avisa siempre antes de perder por tiempo: es la crítica más repetida a los escenarios de la
  comunidad ("temporizador poco claro").

## 10. Mitos

Cada Fase de los Mitos Valkyrie saca **1** Evento de los Mitos al azar entre los habilitados por
estas variables (eventos genéricos del juego base, solo intensidad / con lugar):

| Variable | Eventos genéricos | Uso |
|---|---|---|
| `$mythosFlavor` | 22 (+5 con lugar) | Ambientación sin efecto: al principio. |
| `$mythosHelp` | 13 (+6) | Ayudas (curar, Concentrado): para aliviar. |
| `$mythosMinor` | 45 (+41) | Peligros pequeños. |
| `$mythosMajor` | 44 (+73) | Peligros serios. |
| `$mythosDeadly` | 27 (+42) | Mortales: final de partida. |

- **Lugar**: `$mythosIndoors`, `$mythosOutdoors` (38 eventos exteriores) y habitaciones
  (`$mythosLibrary`, `$mythosStudy`, `$mythosBedroom`, `$mythosHall`, `$mythosStairs`,
  `$mythosStreet`, `$mythosAlley`, `$mythosDock`…; lista en `catalogo.md`). Un evento de lugar
  necesita su variable **y** una de intensidad. Enciéndelas al revelar esas zonas.
- **Especiales**: `$mythosDarkness` (hay Oscuridad en el tablero), `$mythosDiscardItem`,
  `$mythosKey`. `$fire` lo gestiona el menú (§17).
- Las variables siguen activas hasta que las apagas. Con varias encendidas, la probabilidad es
  proporcional al número de eventos de cada grupo (Ambientación + Menores = 1 de cada 3 de
  ambientación).

**Escalada por número de investigadores** (fórmula de la guía de la comunidad: mortales en la ronda
`K − #heroes`, con K = 20 en partidas de 2-3 horas y menor en las cortas, tabla del §9; mayores en la
mitad, menores en la mitad de la mitad), con niveles **excluyentes** como en *Exotic Material*:

```ini
[EventMitosMenores]
display=false
buttons=0
trigger=EndRound
vartests=VarOperation:#round,>=,rondaMenor VarTestsLogicalOperator:AND VarOperation:nivelMitos,<,1
operations=$mythosMinor,=,1 nivelMitos,=,1

[EventMitosMayores]
display=false
buttons=0
trigger=EndRound
vartests=VarOperation:#round,>=,rondaMayor VarTestsLogicalOperator:AND VarOperation:nivelMitos,<,2
operations=$mythosFlavor,=,0 $mythosMinor,=,0 $mythosMajor,=,1 nivelMitos,=,2

[EventMitosMortales]
display=false
buttons=0
trigger=EndRound
vartests=VarOperation:#round,>=,rondaMortal VarTestsLogicalOperator:AND VarOperation:nivelMitos,<,3
operations=$mythosFlavor,=,0 $mythosMinor,=,0 $mythosMajor,=,0 $mythosDeadly,=,1 nivelMitos,=,3
```

- Si en una misma ronda se cumplen dos niveles, se aplica el más alto: las `vartests` se vuelven a
  comprobar al sacar cada evento de la pila y `nivelMitos` excluye el resto.
- **Mitos propios cada ronda**: evento con `trigger=BeforeMonsterActivation` (el más predecible).
  Los de `trigger=Mythos` salen además del genérico y en orden imprevisible.
- **Mitos propios al azar**: un evento silencioso con `trigger=BeforeMonsterActivation`,
  `randomevents=true` y una lista de eventos (cada uno con sus `vartests`).
- Un Mito propio que afecta a "el investigador más cercano a…", "quien esté en la oscuridad…": los
  jugadores lo resuelven; Valkyrie no sabe dónde está nadie.

## 11. Monstruos

**Aparición** (Spawn es un evento: se dispara desde un botón o un disparador, no con `add`):

```ini
[SpawnSotanoSectario]
monster=MonsterCultist
xposition=26.25
yposition=-1.75
buttons=1
event1=
audio=AudioMonsterGeneric1
```
```text
SpawnSotanoSectario.text,Un {type} surge de entre los engranajes. Colócalo en el lugar indicado.
SpawnSotanoSectario.button1,Continuar
```

- Vida = la del tipo (base + por investigador, ver `catalogo.md`) + `round(uniquehealth +
  investigadores × uniquehealthhero)`. Escala siempre con los investigadores.
- Monstruo de expansión con reserva del base: `monster=MonsterSkeleton MonsterCultist` (el primero
  disponible) o declara la expansión en `packs`.
- Al azar por rasgos: `traits=humanoid` (todos) o `traitpool=beast spirit` (alguno); `monster=`
  pasa a ser lista de exclusiones.
- Varios del mismo tipo: Valkyrie asigna fichas de ID automáticamente.
- **Derrota → evento**: `trigger=DefeatedSpawnSotanoSectario` (ese Spawn) o
  `trigger=DefeatedMonsterCultist` (cualquiera de ese tipo). Para saber si sigue vivo: bandera a 1
  al aparecer y a 0 en el evento de derrota.
- Quitar sin derrotar (huye, se desvanece): `remove=SpawnSotanoSectario` (todos los de su tipo) o
  `remove=#monsters` (todos). No dispara `Defeated`.
- `activated=true`: aparece ya activado (no actúa esta ronda).
- **No uses `unique=true`** en MoM (es de Descent): para un monstruo con nombre, CustomMonster.

**Monstruo propio** con nombre, estadísticas y activación propias (*ejemplo:
`CustomMonsterRelojero`*):

```ini
; monsters.ini
[CustomMonsterRelojero]
base=MonsterCultist
health=2
healthperhero=1
awareness=4
horror=2
activation=EventActivaRelojero

[EventActivaRelojero]
display=false
buttons=1
randomevents=true
event1=EventActivaRelojeroA EventActivaRelojeroB

[EventActivaRelojeroA]
buttons=2
event1=
event2=EventRelojeroAcelera

[SpawnRelojero]
monster=CustomMonsterRelojero
xposition=26.25
yposition=-1.75
buttons=1
event1=
```
```text
CustomMonsterRelojero.monstername,Elias Thorne
CustomMonsterRelojero.info,El relojero. Solo quiere que nadie toque su máquina.
EventActivaRelojeroA.text,"<b>{c:CustomMonsterRelojero}</b>\nElias se interpone entre vosotros y su máquina. Si hay algún investigador en su espacio, le golpea: ese investigador sufre 3 de Daño (anulado por {agility})."
EventActivaRelojeroA.button1,Continuar
EventActivaRelojeroA.button2,No había nadie en su espacio
```

- `base` aporta imagen, rasgos, textos de ataque, evasión y Horror y activaciones (lo que no
  redefinas). Sin `activation` usa las activaciones del `base`.
- `activation` = **un** evento cuyo nombre empieza por `Event`. Estructura de la app: movimiento
  y objetivo, ataque, y un botón alternativo "no hay investigadores a su alcance" con otro
  movimiento. ⚠️ Sin `base` ni `activation`, Valkyrie se cierra al activarlo.
- Atajo sin eventos: `activation=Cultist01 Cultist04` reutiliza activaciones **oficiales** (ya
  traducidas) de otro monstruo, elegidas al azar en cada activación; o define las tuyas como
  `[ActivationGolpe]` con textos `ActivationGolpe.ability`, `.master`, `.movebutton` y `.move`
  (`formato-escenario.md` §11 y §14). IDs: `python scripts/buscar.py cultist --tipo activaciones`.
- `evadeevent` / `horrorevent`: eventos que sustituyen a la tirada de evasión / de Horror.
- `attacks=heavy:2 unarmed:1` + textos `CustomMonsterX.Attack_heavy_1`… para ataques propios.
- Imagen propia: `image=img/relojero.png` (miniatura) e `imageplace` (al colocarlo).

## 12. Objetos

```ini
; items.ini
[QItemInicialArma]
starting=True
traits=weapon common
itemname=ItemCommonShotgun ItemCommonTommyGun

[QItemInicialLuz]
starting=True
traits=lightsource common

[QItemDiario]
starting=False
itemname=ItemUniqueOldJournal
inspect=EventLeerDiario
```

- **Iniciales**: `starting=True`; los oficiales dan 4-5 (arma, luz, equipo, hechizo…). Con `traits`,
  `itemname` son **exclusiones** (aquí, sin escopeta ni Tommy Gun). Escribe siempre `starting=`.
- **Dar un objeto**: `add=QItemDiario` en un evento (**uno por evento**). Texto: "Ganas el Objeto
  único {c:QItemDiario}." Para dos objetos, dos eventos encadenados.
- **Inspeccionar**: `inspect=EventX` se abre al pulsar el objeto en Objetos: cartas, diarios,
  pistas (*ejemplo: `EventLeerDiario`*). Puede tener opciones con condiciones (usar el objeto).
- **Quitar**: `remove=QItemX` (se lo quitáis al grupo; decid quién lo descarta).
- Valkyrie no sabe quién lleva cada objeto ni si lo han intercambiado: pon una bandera al darlo
  (`llaveEncontrada,=,1`) y úsala en condiciones.
- **Sorteo al empezar**: Valkyrie sortea todos los QItem al empezar, en el orden de los ficheros.
  Los que tienen `traits` excluyen lo ya sorteado y lo que hay en el inventario; los que tienen
  `itemname` sin `traits` **no** comprueban nada. Como el inventario no admite duplicados, si un
  objeto inicial por rasgos saca el mismo objeto que otro QItem da por nombre más tarde (el whisky
  que se encuentra en la barca), ese segundo QItem no añadirá nada. Solución: define los QItem
  con nombre **antes** que los de rasgos o añade el objeto como exclusión (`itemname=`) en el de
  rasgos. `validar.py` lo avisa. `$restock,=,1` repite el sorteo.
- Si das armas potentes por evento, compensa (más monstruos, menos objetos iniciales).

## 13. Rompecabezas

La ventana del puzle no muestra el texto del evento: pon las instrucciones en un evento previo
(*ejemplo: `EventAntesDelPuzle` → `PuzzleMecanismo`*).

```ini
; puzzles.ini
[PuzzleMecanismo]
class=code
skill={lore}
puzzlelevel=3
puzzlealtlevel=4
puzzlesolution=3 3 3
image=
buttons=1
event1=EventMecanismoDetenido
display=false
```
```text
PuzzleMecanismo.button1,Continuar
EventAntesDelPuzle.text,"Tres agujas, cuatro posiciones cada una.\n\n<i>Rompecabezas de código:</i> tienes tantos pasos como tu {lore} impreso, más 1 por cada Pista que gastes (no en la Oscuridad). Si te quedas sin pasos, pulsa Cerrar: el progreso se guarda."
EventAntesDelPuzle.button1,Empezar
```

| Clase | Oficial | Ajustes típicos |
|---|---|---|
| `code` | Código | `puzzlelevel` 3-4 (longitud), `puzzlealtlevel` 4-6 (símbolos); `image=symbol` o `element` para runas o elementos; `puzzlesolution` fija con pista narrativa |
| `image` | Mosaico | `image=PuzzleOldJournal` (3×3) o imagen propia; `puzzlelevel`/`puzzlealtlevel` = piezas en horizontal / vertical |
| `slide` | Mecanismo | `puzzlelevel` = movimientos mínimos (4-8) |
| `tower` | Torre (Calles de Arkham) | `puzzlelevel` = movimientos |

- Valkyrie **no limita los pasos**: los jugadores los cuentan (atributo impreso + 1 por Pista).
- Al resolverlo se ejecuta `event1`. Cerrar sin resolver guarda el progreso.
- Prueba la dificultad en partida: hay imágenes de mosaico mucho más fáciles que otras.

## 14. UI: prólogos, cartas y diarios

Con `vunits=true` las medidas se dan en **alturas de pantalla** (igual en 16:9 y 16:10). Sin
`halign`/`valign` el elemento se centra y `xposition`/`yposition` lo desplazan desde el centro
(y **positiva = hacia abajo**). El texto (`uitext`) va en una UI sin imagen; su caja mide
`size` de alto y `size × textaspect` de ancho. *Ejemplo: `UIPrologoFondo`, `UIPrologoTexto`,
`UIPrologoSeguir`.*

```ini
; ui.ini
[UIPrologoFondo]
image=ImageCutsceneBG
size=1
vunits=true
xposition=0
yposition=0
display=false
buttons=0
clickeffect=false

[UIPrologoTexto]
image=
size=0.6
vunits=true
textsize=0.9
textaspect=1.7
textcolor=white
textbackgroundcolor=#000000A0
border=true
xposition=0
yposition=-0.04
display=false
buttons=0
clickeffect=false

[UIPrologoSeguir]
image=
size=0.07
vunits=true
textsize=0.9
textaspect=5
textcolor=#E8C872
border=true
xposition=0
yposition=0.39
display=false
buttons=1
event1=EventPrologoFin
```
```ini
; events.ini
[EventPrologoUI]
display=false
buttons=0
add=UIPrologoFondo UIPrologoTexto UIPrologoSeguir

[EventPrologoFin]
display=false
buttons=1
event1=EventColocarInicio
remove=UIPrologoFondo UIPrologoTexto UIPrologoSeguir
```
```text
UIPrologoTexto.uitext,"<i>Muy señores míos:</i>\n\nMi tío no responde a mis cartas desde hace una semana...\n\n<i>Margaret Thorne</i>"
UIPrologoSeguir.uitext,Continuar
```

- El evento que pone la UI termina la cadena (silencioso, sin botones): la partida espera a que
  pulsen la UI-botón (`display=false` + `event1`).
- **Retira siempre las UI** (o `remove=#uicomponents`): con una UI en pantalla no funciona "Fin de
  fase".
- Orden de dibujo = orden en `add`: fondo, imagen, texto, botón.
- Imágenes integradas útiles: `ImageCutsceneBG`, `ImageCutsceneFrame`, `ImageLeather`,
  `ImageMansionAtNight`, `ImageAlienClockwork`, `ImageBook`, `ImageClueFound`… (`catalogo.md`).
  Imágenes propias: PNG/JPG ≤ 1920×1080 en una subcarpeta (`img/carta.png`).
- **Diario o carta desde el inventario**: el `inspect` del objeto añade una UI con la imagen de la
  carta y una UI-botón "Cerrar" que la retira.
- Prueba en 16:9 y 16:10, y con la ventana pequeña.
- Para aparatos que la mesa maneja (palancas, teclados, diales, mapas que se recorren, mochilas): `mecanismos-ui.md`.

## 15. Finales

Un concentrador elige el epílogo según el estado (el primero habilitado). *Ejemplo:
`EventMecanismoDetenido`.*

```ini
[EventMecanismoDetenido]
display=false
buttons=1
event1=EventEpilogoEliasVive EventEpilogoEliasMuerto
operations=mecanismoDetenido,=,1

[EventEpilogoEliasVive]
buttons=1
event1=
vartests=VarOperation:relojeroDerrotado,==,0
operations=$end,=,1
audio=AudioFinale1

[EventEpilogoEliasMuerto]
buttons=1
event1=
operations=$end,=,1
audio=AudioFinale2

[EventDerrotaEliminado]
buttons=1
event1=
trigger=Eliminated
operations=$end,=,1
```

- `$end,=,1`: la partida termina al pulsar el botón de ese evento. Con un identificador propio (no
  `EditorScenario…`) Valkyrie pregunta si ganasteis y pide la valoración.
- Escribe "<b>Epílogo</b>" y deja claro si han ganado o perdido.
- Finales necesarios: victoria (uno o varios), derrota por tiempo (§9) y derrota por eliminación
  (`trigger=Eliminated`: se dispara al final de la Fase de los Investigadores de la ronda
  siguiente a marcar un eliminado, que es su última oportunidad).
- Varios finales: señala que la elección importa (dos botones con consecuencias claras, como
  "Detener" o "Destrozar" en el ejemplo).
- **Decisión irreversible con confirmación** (abandonar a alguien, quemar el libro): un evento
  intermedio pregunta y deja volver atrás.

```ini
[TokenAmos]
type=TokenWhiteMan
xposition=5.25
yposition=-5.25
buttons=1
event1=EventAbandonarPregunta

[EventAbandonarPregunta]
buttons=2
event1=EventFinalAbandono
event2=
buttoncolor1="red"
```
```text
TokenAmos.button1,Abandonar a Amos a la marea
EventAbandonarPregunta.text,"Si os marcháis ahora, nadie volverá a ver a Amos con vida. <b>Esta decisión termina la partida.</b>"
EventAbandonarPregunta.button1,Nos vamos
EventAbandonarPregunta.button2,Seguir intentándolo
```

## 16. Variación y rejugabilidad

- **Pista en un lugar al azar** (al preparar la partida):

```ini
[EventSortearPista]
display=false
buttons=1
randomevents=true
event1=EventPistaEnBiblioteca EventPistaEnDespacho EventPistaEnSotano

[EventPistaEnBiblioteca]
display=false
buttons=0
operations=pistaEn,=,1
```
  Luego cada búsqueda comprueba `pistaEn` para dar la pista o un "aquí no hay nada".
- **Número al azar**: `operations=dado,=,#rand6` y condiciones sobre `dado`.
- **Contenido extra si tienen una expansión** sin exigirla: `vartests=VarOperation:#SoA,==,1`
  (`#BtT`, `#SoT`, `#HJ`, `#PotS`, `#MoM1ET`…). Y monstruos con reserva: `monster=MonsterHiredGun
  MonsterCultist`.
- **Según quién juega**: `VarOperation:#HeroAgathaCrane,==,1` (texto especial para un investigador).
- Variantes de toda una trama (4 culpables posibles, 2 mapas): sorteo al principio + condiciones.

## 17. Entorno: fuego, oscuridad, obstrucciones

- **Fuego** que provoca el escenario: añade fichas `TokenFire` y `operations=$fire,=,1`; Valkyrie
  sacará cada Fase de los Mitos el evento de propagación. Los jugadores también pueden "Prender
  fuego" desde el menú.
- **Oscuridad**: fichas `TokenDarkness` (decorativas) + `$mythosDarkness,=,1`. Recuerda que en la
  oscuridad no se gastan Pistas (afecta a tiradas y rompecabezas): da una fuente de luz.
- **Obstrucción**: `TokenBarricadeInside`/`Outside`; las reglas de mover y romper son físicas.
- **Pasadizo secreto**: `TokenSecretInside`/`Outside` en los dos extremos.
- Expansiones: `TokenRift` y `TokenWater` (HJ), `TokenOvergrowth` y `TokenRubble` (PotS); sus
  reglas, en `reglas-mom.md` §13.5.

## 18. Disparadores por variable y bucles

- **`@variable`**: al ponerla a un valor > 0, al terminar ese evento vuelve a 0 y se disparan los
  eventos con `trigger=Var<nombre sin @>`. Sirve para "cuando pase X, desde cualquier sitio":

```ini
[EventRomperJarron]
buttons=1
event1=
operations=@ruido,=,1

[EventAlguienOye]
trigger=Varruido
buttons=1
event1=
```
- **Bucles** (puzles con UI, rondas de un ritual): inicialización → inicio del bucle → trabajo →
  evento de salida con condición → vuelta al inicio. **Siempre** con contador y condición de salida:
  un bucle de eventos silenciosos sin salida cuelga Valkyrie.

## 19. Campañas y escenarios en varias partes

- Un `eventN` con la ruta a otro `quest.ini` carga ese escenario: `event1=Parte2/quest.ini`. Se
  limpia el tablero; se conservan los investigadores y las variables con `%` (`%final1`,
  `%aliadoSalvado`).
- La ruta va siempre desde la carpeta del escenario principal, también desde una parte interior
  (`Parte3/quest.ini`, no `../Parte3/quest.ini`). Nada de variables de un carácter (cierran Valkyrie
  al cambiar de parte).
- Cada parte con `Localization.English.txt`: tras el cambio, Valkyrie carga el idioma del jugador y
  el inglés, no el `defaultlanguage` (detalle en `formato-escenario.md` §19).
- Las partes interiores llevan `hidden=True` en su `[Quest]` (Valkyrie busca `quest.ini` en
  subcarpetas).
- Para variantes: `randomevents=true` con varias rutas.
- Valida desde la carpeta principal (`validar.py` comprueba a qué partes se llega) y, en el editor de
  Valkyrie, prueba y empaqueta desde el principal, no desde una parte suelta.

## 20. Sonido y música

| Momento | Audio integrado |
|---|---|
| Explorar / abrir puertas | `AudioDoorOpen1-3`, `AudioDoorCreak1-2`, `AudioHiddenDoor1-4`, `AudioUnlock1`, `AudioLocked1-3` |
| Revelar losetas | `AudioRevealTile1-2`, `AudioNewContent` |
| Buscar | `AudioPapers1-5`, `AudioDrawer1-2`, `AudioCabinet1-3`, `AudioOpenObject1-4` |
| Hallazgo importante | `AudioImportant1-2`, `AudioPositive1-2`, `AudioGainItem` |
| Mal resultado | `AudioNegative1-6`, `AudioGlassBreak1-3`, `AudioThud1-2` |
| Monstruos | `AudioSpawnFirstMonster`, `AudioMonsterGeneric1-4`, `AudioSpawnBoss1-2`, `AudioCreatureWarning` |
| Música de fondo (`music=`) | `AudioAtmosphere1-7` (las únicas marcadas como música en el catálogo) |
| Ambiente puntual (`audio=`) | `AudioClock`, `AudioCrows`, `AudioFogBell`, `AudioPiano`, `AudioDinnerBell`, `AudioGong` |
| Finales | `AudioFinale1-3`, `AudioGameOver`, `AudioComplete` |

- `audio=` efecto corto (se superpone). `music=` cambia la música: una sola pista suena y luego
  vuelve la lista anterior; varias pistas forman una lista nueva en bucle.
- Audio propio: solo `.ogg`. Truco de la comunidad: una narración grabada en `music=` se puede
  saltar al avanzar.
- `buscar.py <palabra> --tipo audio` para encontrar más (`buscar.py pasos --tipo audio`).
