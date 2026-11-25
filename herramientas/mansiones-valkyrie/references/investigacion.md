# Investigar como en un librojuego

Cómo hacer que la mesa investigue una historia en vez de registrar habitaciones. El síntoma que se
quiere evitar: «entro, pulso todo, paso a la siguiente sala, pulso todo», porque nada dice qué mirar
y cualquier ficha puede esconder lo importante. Lo que se busca es que la mesa se pregunte **«¿qué
hacemos con lo que sabemos?»** y no **«¿qué nos queda por pulsar?»**.

Vale para crear y para revisar: §13 dice cómo usarlo al analizar un escenario ajeno.

## Índice

1. [El ciclo de una investigación](#1-el-ciclo-de-una-investigación)
2. [La red de preguntas, antes que el mapa](#2-la-red-de-preguntas-antes-que-el-mapa)
3. [La sala se describe al ponerla](#3-la-sala-se-describe-al-ponerla)
4. [Lo que se encuentra encaja con dónde se busca](#4-lo-que-se-encuentra-encaja-con-dónde-se-busca)
5. [Pistas que se usan](#5-pistas-que-se-usan)
6. [Decisiones con información detrás](#6-decisiones-con-información-detrás)
7. [Personajes con intereses](#7-personajes-con-intereses)
8. [Tiradas que dicen algo según cuánto se saca, y despistes](#8-tiradas-que-dicen-algo-según-cuánto-se-saca-y-despistes)
9. [El cuaderno de lo que no cuadra](#9-el-cuaderno-de-lo-que-no-cuadra)
10. [Reglas propias de la aventura](#10-reglas-propias-de-la-aventura)
11. [Aprender jugando: lo que se gana sirve para algo](#11-aprender-jugando-lo-que-se-gana-sirve-para-algo)
12. [Las cuatro preguntas de cada escena](#12-las-cuatro-preguntas-de-cada-escena)
13. [Al revisar un escenario](#13-al-revisar-un-escenario)

## 1. El ciclo de una investigación

| Aventura de registrar | Aventura de investigar |
|---|---|
| Entro → miro todo → encuentro pistas → abro otra zona → miro todo → sale un monstruo | Pasa algo → recibo información → me hago una idea → decido qué comprobar → lo que descubro la confirma o la tumba → decido con consecuencias |

No se trata de quitar las búsquedas: buscar es emocionante **cuando hay un motivo** para buscar
allí. Lo que sobra es tener que registrarlo todo porque nadie ha dado un motivo para hacer otra cosa.

Tres referencias que lo trabajan bien: *Sherlock Holmes Detective Asesor* (la mesa decide a quién
visitar con lo que ha leído), los librojuegos de inkle como *80 Days* o *Sorcery!* (decisiones con
contexto y consecuencias que se arrastran) y el diseño de partidas de investigación de rol (la regla
de las tres pistas y el diseño por nodos de Justin Alexander; GUMSHOE, donde lo difícil es
interpretar las pistas, no conseguirlas).

## 2. La red de preguntas, antes que el mapa

Antes de elegir losetas se escribe la red: las preguntas que la mesa querrá contestar y qué lleva
de una a otra. El mapa sale después, para dar sitio a esas escenas.

```markdown
Pregunta inicial: ¿Dónde está Ada Marsh?          (la plantea el prólogo)
├─ ¿Por qué miente la madre?       ← la carta del jueves; la vecina; el diario de Ada
│   └─ lleva a: el sanatorio, el sacerdote
├─ ¿Qué oculta el sheriff?         ← el informe que falta; su mujer; la llave del archivo
│   └─ lleva a: el archivo, la desaparición de 1919
└─ ¿A quién tenía miedo Ada?       ← sus dibujos; el sacerdote; la carta del jueves
    └─ lleva a: el sanatorio
Conclusión imprescindible: el doctor Crane tiene a Ada (3 pistas: ...)
```

- **Nodos, no pasillos**: cada escena (un sitio, una persona, un documento) da pistas hacia al menos
  dos más, así que la mesa elige el orden.
- **Tres pistas por conclusión imprescindible**: cualquier cosa que haya que deducir para avanzar
  tiene tres caminos independientes (una persona, un objeto, un lugar). Los jugadores se saltan una
  ficha, fallan una tirada o no ven la relación: con tres, alguna llega.
- **Lo imprescindible no depende de los dados**: la tirada decide cuánto cuesta o cuánto más se
  saca (§8), no si se consigue la pista sin la que no se puede seguir.
- Lo que no lleva a ninguna parte se queda en la red como **color o despiste** a propósito (§8), no
  por descuido.

Va en el documento de diseño (`diseno-escenarios.md` §2) antes de la hoja de ritmo.

## 3. La sala se describe al ponerla

El texto que coloca una loseta dice **lo que llama la atención**, como lo vería alguien que entra.
Cada ficha de esa sala corresponde a algo de ese texto, y lo que el texto no menciona no tiene ficha
(salvo lo escondido a propósito, que se gana con una tirada o un dato: §8).

```text
EventExplorarDespacho.text,"Coloca {c:TileDespacho}. Huele a tabaco frío. Sobre la mesa, cuadernos abiertos y revueltos, como si alguien buscara algo con prisa. Al fondo, junto a la ventana, una mancha oscura en la alfombra. Un archivador de roble ocupa la pared del este."
```

Tres fichas: los cuadernos (Búsqueda), la mancha (Vistazo) y el archivador (Búsqueda). La mesa ya
sabe qué hay y puede elegir: la mancha da miedo, los cuadernos sugieren que alguien buscaba algo, el
archivador es grande y lento. Y lo que no está en el texto no está en la sala: no hay que pulsar la
alfombra ni la chimenea «por si acaso».

- **Ponlo todo de una vez** cuando ahorra tiempo y no hay nada que decidir (un pasillo, una sala ya
  conocida). Describe y deja elegir cuando lo que hay es una elección.
- **El texto de la ficha repite el detalle con más precisión**, no lo contradice: «Los cuadernos
  están abiertos por páginas de fechas de octubre.»
- **Lo que ya se sabe que no interesa se puede ignorar**: un armero lleno de escopetas, si ya
  lleváis una, es una ficha que la mesa puede saltarse sabiendo lo que se pierde. Eso también es
  decidir.

**Tres maneras de presentar una sala**, de peor a mejor:

| Manera | Cómo | Cuándo |
|---|---|---|
| Colocar sin decir nada | La loseta y sus fichas a la vez, sin texto | Casi nunca: a la mesa le dice que tendrá que mirarlo todo |
| Describir al colocar | Un texto con lo que llama la atención, y las fichas a la vez | Salas con pocas cosas, salas que vuelven, cuando hay prisa |
| Ficha a ficha | Una ventana corta por cada cosa, que coloca su ficha: «Una niña de azul, apoyada en la barandilla» (con su retrato, §7), «Sobre la mesa, cuadernos revueltos», «Un hombre de frac da cuerda a un reloj» | La primera vez que aparecen personajes y objetos importantes: es la más elegante y bonita |

Ficha a ficha, cada ventana tiene una o dos frases (que no se haga lenta) y su ficha aparece al
leerla:

```ini
[EventSalonClara]
buttons=1
event1=EventSalonOrquesta
add=TokenClara
```
```text
EventSalonClara.text,"Una niña de vestido azul se ha subido a una silla para ver a los músicos."
```

Mezcla las tres: ficha a ficha la primera vez, describiendo al colocar cuando la sala vuelve, y sin
nada solo un pasillo vacío.

## 4. Lo que se encuentra encaja con dónde se busca

| Dónde | Qué puede salir | Qué no |
|---|---|---|
| Cuadernos revueltos | Una foto que se cae, una hoja arrancada, una fecha | Un arma, una llave de hierro |
| Cajonera, escritorio | Cartas, llaves pequeñas, dinero, un revólver en el cajón de abajo | Algo grande |
| Armero | Armas, munición | Una carta de amor (salvo que sea el giro) |
| Botiquín | Vendas, láudano, una receta con un nombre | Un libro |
| Ropa colgada | Lo que lleva un bolsillo: un billete, un pagaré, un guante | Un objeto pesado |

- Un mueble grande o con muchos cajones justifica varias cosas o una tirada para encontrar más; un
  objeto pequeño da una cosa.
- La sorpresa (algo que no debería estar allí) es un recurso, no la norma: si sale, el texto lo dice
  («Entre los cuadernos, una navaja. No es de nadie de esta casa»).
- Los objetos únicos del catálogo se eligen por lo que son (`catalogo.md`), no por lo que dan.

## 5. Pistas que se usan

Una pista no tiene que abrir una puerta. Puede descubrir que alguien miente, abrir una conversación,
permitir una deducción, cambiar el sentido de otra pista o avisar de un peligro. El mismo objeto
produce situaciones distintas según lo que se sepa:

| Lo que sabéis | Lo que aparece |
|---|---|
| Tenéis la fotografía | «Preguntar al sacerdote por el hombre de la foto» |
| Sabéis que el sacerdote mintió | «Enseñarle la fotografía» |
| Sabéis la fecha de la foto | «Demostrar que se conocían antes» |
| Sabéis que el médico la busca | «Ofrecérsela a cambio de…» |

En Valkyrie, cada una es un botón de la conversación con una condición sobre lo que se sabe; sin la
condición, el botón no se ve:

```ini
[EventSacerdote]
buttons=3
event1=EventSacerdoteFoto
event1Condition=VarOperation:tieneFoto,==,1
event1ConditionAction=hide
event2=EventSacerdoteMentira
event2Condition=VarOperation:tieneFoto,==,1 VarTestsLogicalOperator:AND VarOperation:sabeMentira,==,1
event2ConditionAction=hide
event3=
```

- **Cada pista importante se usa al menos una vez después** de encontrarla: un botón, un texto que
  la nombra, una decisión. Una variable que se pone y nadie lee es una pista desperdiciada (el
  análisis del editor lo señala).
- **La mesa lo nota**: el botón nuevo dice de dónde sale («Enseñarle la fotografía del muelle»).
- Las rutas se pueden volver a juntar (como en ink): no hacen falta veinte caminos; hace falta que
  lo hecho se note después.

## 6. Decisiones con información detrás

Una elección entre tres botones sin saber nada es azar con apariencia de libertad. La misma elección
es buena si antes la mesa ha podido saber por qué iría a cada sitio:

- «¿Iglesia, cementerio o sanatorio?» a secas: no.
- Después de saber que Ada visitó al sacerdote, que el enterrador vio abrir una tumba y que el médico
  pidió al sheriff que no investigara: sí. Ahora pueden discutir cuál es más sospechoso.

**Dilemas de tiempo**: dos cosas importantes a la vez que no se pueden atender juntas («El periodista
os cita a medianoche; el sheriff os pide ayuda para detener a un sospechoso que huye»). La mesa sabe
qué gana y qué arriesga con cada una, y repartirse crea dos escenas con sus riesgos. En Valkyrie: una
variable de hora (`hora`) y fichas que solo cumplen si se llega antes de cierta hora. **Con
mesura**: si todas las decisiones castigan, la mesa se agota. Alterna exploración tranquila,
deducción, conversación y presión.

## 7. Personajes con intereses

Un personaje no es un dispensador de pistas: quiere algo, oculta algo y reacciona a lo que se hace.

- **Primero colabora; luego se descubre que ocultó algo**: confrontarlo, chantajearlo, ganarse su
  confianza o averiguar por qué. Y quizá no era malo: alguien le amenaza. Otro dilema: ¿lo
  denunciáis o lo ayudáis?
- **Confianza como variable** (`confSheriff`): sube o baja con lo que se dice y abre o cierra lo que
  cuenta (`desafios.md` §4).
- **Un rasgo de habla** por personaje (`escritura.md`) y **cambia** a lo largo de la partida.
- **Ver con quién se habla**: un retrato del personaje a la izquierda mientras dura la conversación
  (una UI con su imagen, `vunits=true`, alineada a la izquierda). Se añade en el evento que abre la
  conversación (no en la ficha, que lleva el botón Cancelar) y **se quita en cada salida**: con una
  UI en pantalla no funciona «Fin de fase». Un evento `EventQuitarRetratos` que quita todos los
  retratos, al que van todos los botones que cierran la conversación.
- **Preguntar dos veces**: lo ya preguntado no puede contestar lo mismo como si nada. Tres maneras:
  - el botón queda **en gris** (`eventNConditionAction=disable` con una variable que se pone al
    preguntar): la mesa ve que ya lo preguntó, y no pierde una acción;
  - el botón **desaparece** (`hide`) cuando la respuesta ya no aporta;
  - **otra respuesta** la segunda vez («Ya os lo dije, señores. ¿No me escuchaban?»), con un evento
    que elige entre la primera y las siguientes (`event1=EventRosaYa EventRosaPrimera`).
  Lo normal es el gris para preguntas y otra respuesta para lo que el personaje diría distinto.

## 8. Tiradas que dicen algo según cuánto se saca, y despistes

**Resultados por éxitos**: `quota=nombreVariable` guarda los éxitos y se ramifica (`patrones.md`,
tiradas). Que 0, 1, 2 y 3 éxitos sean cosas distintas, no solo «pasa / falla»:

| Éxitos | Ante la mancha de la alfombra ({observation}) |
|---|---|
| 0 | Es una mancha. Huele a vino. |
| 1 | Vino, sí, pero alguien ha frotado los bordes. |
| 2 | Debajo del vino hay sangre seca, de hace días. |
| 3+ | Sangre, y un rastro que va hacia el archivador: alguien arrastró algo. Aparece otra ficha. |

```ini
[EventManchaTirada]
buttons=1
quota=exitosMancha
event1=EventMancha3 EventMancha2 EventMancha1 EventMancha0
```

**Lo escondido**: una ficha que el texto de la sala no anuncia se gana con una tirada en algo que sí
anuncia (con 3 éxitos, el rastro) o con un dato («Si sabéis que Ada escondía cartas, mirad detrás
del cuadro»). Así registrar tiene premio sin obligar a registrarlo todo.

**Despistes**: una tirada tensa ante algo que parece importante y no lo es («La caja tiene un
cierre de latón con símbolos… es un costurero holandés»). Bien puestos, hacen que el mundo parezca
más hondo; abusar los convierte en trampas. **Uno por cada 45-60 minutos como mucho**, que cueste
poco (una acción, no Daño), con un detalle de ambiente que pague la curiosidad, y nunca en una
pregunta imprescindible.

## 9. El cuaderno de lo que no cuadra

Un objeto que la mesa lleva (una libreta, la carta que les trajo) cuyo `inspect` abre un evento con
las preguntas abiertas: un botón por pregunta, visible solo cuando se sabe lo bastante para
planteársela. Cada uno recuerda los hechos y sugiere, sin decir la solución, dónde comprobarlo.

```text
EventCuaderno.text,"Lo que no cuadra:"
EventCuaderno.button1,¿Por qué la carta es del jueves, si Ada desapareció el martes?
EventCuadernoCarta.text,"La madre dice martes. La carta dice jueves y está escrita con prisa. O la madre se equivoca, o alguien la envió por Ada. La vecina vio luz en su cuarto el miércoles."
```

- Se pueden ofrecer **hipótesis**: «La madre oculta algo» / «Alguien escribió por Ada». Elegir una
  pone una variable que cambia el enfoque de alguna conversación (más preguntas a la madre, o a la
  vecina). El juego no dice si es correcta.
- No sustituye a la investigación: la ordena para la mesa que ha estado una hora sin jugar o que se
  ha perdido.

## 10. Reglas propias de la aventura

Valkyrie permite reglas que el juego de mesa no tiene, y aprovechar las que tiene. La app no sabe
dónde está cada figura: la regla la dice el texto, en su propia línea con frase de reglas, y la app
lleva la cuenta con variables.

- **Las fichas del entorno en la historia**: una **Obstrucción** (`TokenBarricadeInside`) para
  atrancar la puerta ante lo que os sigue (ni investigadores ni monstruos pasan; el monstruo tira su
  Agresividad y con 2 éxitos la rompe: `reglas-mom.md` §13.3); el **Fuego** (`$fire`), la
  **Oscuridad** (no se gastan Pistas), los **Pasadizos secretos**. «Atrancad la puerta» es una
  decisión con coste (una acción) y premio (una ronda).
- **Reglas de la escena**: «En la escalera de servicio movéis 1 espacio más»; «el agua: los espacios
  del muelle cuestan 1 movimiento más»; «mientras Clara vaya con vosotros, quien la lleva no puede
  correr»; «la tormenta: no se puede usar la terraza». Se dicen al aparecer y se recuerdan cuando
  importan.
- **Ayudas que facilitan**: una regla puede hacer la aventura más amable (un aliado que da 1 dado,
  un sitio seguro donde descansar) si la historia lo pide.
- **Dónde dejarlas por escrito**: Valkyrie no tiene un panel de reglas del escenario; ponlas en el
  `inspect` de un objeto que la mesa lleva (§9) o repítelas en el texto de la ficha donde aplican.
- **Las cartas y los Estados como historia**: un Estado que el texto nombra («Estáis Malditos: la
  campana os ha oído»), cartas de Daño y Horror que dice qué son.

## 11. Aprender jugando: lo que se gana sirve para algo

Como en un Zelda: lo que la mesa consigue le da **una forma nueva de actuar**, y el mundo se lee de
otra manera porque ahora puede hacer algo con él. Aunque sea pequeño, esa sensación de aprender
mientras se juega engancha. La llave es lo más evidente; hay muchas más:

| Se gana | Lo que permite después |
|---|---|
| Un objeto (una lámpara, una palanca, un frasco de sal) | Entrar en la Oscuridad del sótano y gastar Pistas allí; abrir una trampilla; echar sal en el umbral para que el fantasma no pase |
| Un dato (la canción, el nombre verdadero, la contraseña) | Tocarla en la campana; llamar al espíritu por su nombre y que conteste; entrar en la logia sin pelear |
| Un aliado (un personaje que os sigue) | Que abra puertas de servicio; que hable por vosotros; un dado más en una tirada concreta |
| Un sitio (un atajo, una escalera de servicio) | Moverse distinto: un espacio más, llegar a donde los demás tardan |
| Una regla aprendida («el agua los frena») | Usar el terreno a favor: atraerlos al agua |

- **Enséñala tranquila, úsala en apuros y combínala al final**: la lámpara se encuentra en una sala
  segura; vuelve a importar cuando se apagan las luces; y en el clímax hace falta junto a otra cosa
  ganada antes.
- **Que se note que hay algo nuevo**: el texto lo dice al ganarlo («Con la lámpara podréis bajar
  al sótano») y el botón nuevo aparece donde sirve, con una condición sobre la variable que se puso
  al ganarlo (§5). Los botones que la mesa no puede usar todavía pueden verse en gris
  (`eventNConditionAction=disable`): avisan de que algo falta y dan ganas de buscarlo.
- **Una herramienta nueva cada 30-45 minutos** como mucho: en una partida de tiempo limitado, pocas
  y bien usadas valen más que una mochila llena.
- **Lo que se gana con un dato no se pierde** aunque se pierda el objeto: es la recompensa de leer.

## 12. Las cuatro preguntas de cada escena

Antes de dar por buena una sala, una conversación o un documento:

1. **¿Qué sabe la mesa al llegar?** Alguna expectativa o motivo, aunque sea incompleto.
2. **¿Qué pregunta nueva le deja?** Algo que quiera seguir.
3. **¿Qué decisión interesante tiene?** Una deducción, una conversación delicada, un sacrificio, un
   objetivo nuevo.
4. **¿Qué cambia después?** Un personaje, un suceso, un recurso, un dato o una posibilidad.

Una escena que no responde a ninguna es relleno: se quita, se junta con otra o se pone sin elegir
(«Coloca el pasillo; no hay nada que os llame la atención»).

## 13. Al revisar un escenario

Para escenarios ajenos o propios, además de la rúbrica (`revision.md`, criterio «Investigación»),
la revisión devuelve **cambios concretos**, cada uno con su componente:

| Qué buscar | Señal | Propuesta típica |
|---|---|---|
| Fichas que nadie anuncia | La sala se coloca sin describir lo que hay, o el texto no nombra la ficha | Describir la sala al ponerla y que cada ficha salga del texto |
| Registros sin motivo | Búsquedas en muebles genéricos que dan «nada» o un objeto sin historia | Quitarlas, o darles un motivo (un detalle en la descripción) y algo que cuente |
| Contenido incoherente | Un arma entre cuadernos, una carta en un armero | Cambiar el objeto o el mueble |
| Pistas desperdiciadas | Variables que se ponen y nadie lee; objetos que no se usan | Un botón que la use en una conversación, un texto que la nombre, o quitarla |
| Una pista sola para algo imprescindible | Una sola ficha o una tirada da lo que hace falta para seguir | Dos caminos más (persona, objeto, lugar) |
| Decisiones a ciegas | Botones de destino sin información previa | Plantar antes una razón para cada opción |
| Tiradas de sí o no | Pasa o falla, siempre igual | Resultados por número de éxitos |
| Personajes dispensadores | Hablan una vez y desaparecen | Algo que ocultan, una reacción a lo que se sabe |
| Nada cambia la forma de jugar | Solo las reglas de siempre | Una regla de la escena o una ficha del entorno con sentido |
| Preguntar dos veces | El mismo botón da la misma respuesta como si fuera nueva | Botón en gris tras preguntarlo, o quitarlo, u otra respuesta («ya os lo dije») (§7) |
| No se ve con quién se habla | Conversaciones sin cara | Retrato a la izquierda mientras se habla, quitado en cada salida (§7) |
| Salas que aparecen de golpe | Loseta y fichas sin texto, o todo en un párrafo largo | Ficha a ficha la primera vez, con frases cortas (§3) |
| Solo funciona con un número de jugadores | Con el mínimo no da tiempo; con el máximo, gente esperando | Hilos, ayudas y enemigos según `#heroes` (`desafios.md` §5) |
| Lo ganado no sirve para nada nuevo | Objetos que solo suman a un contador; datos que no abren ninguna acción | Que cada cosa ganada dé una acción nueva en algún sitio (§11) |

Escríbelos como un editor: «En `EventExplorarCocina`, quitaría `TokenAlacena` (da "nada"); añadiría
a la descripción "un cuchillo falta del taco" y lo cobraría en `TokenFregadero`, que ya existe». De
más a menos importante, y respetando el estilo del autor.
