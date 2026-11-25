# Reglas de Las Mansiones de la Locura 2ª edición

Referencia completa de las reglas del juego de mesa *Mansions of Madness: Second Edition* (FFG, 2016;
en español *Las Mansiones de la Locura (Segunda Edición)*, Edge Entertainment). Está **parafraseada**
(no copia el reglamento) y se centra en lo que un escenario de Valkyrie tiene que reproducir, porque
Valkyrie sustituye a la app oficial: exploración, búsqueda, interacción, tiradas, rompecabezas,
Mitos, monstruos, tiradas de Horror y final de partida.

- Expansiones, productos, monstruos e investigadores: `expansiones.md`.
- Cómo se programa cada cosa en Valkyrie: `formato-escenario.md` y `patrones.md`.
- Para redactar textos en español con la terminología oficial: §17 de este fichero.

## Índice

- [0. Chuleta rápida](#0-chuleta-rápida)
- [1. Visión general](#1-visión-general)
- [2. Componentes y su función](#2-componentes-y-su-función)
- [3. Preparación](#3-preparación)
- [4. Estructura de la ronda](#4-estructura-de-la-ronda)
- [5. Acciones](#5-acciones)
- [6. Tiradas (en inglés, *tests*)](#6-tiradas-en-inglés-tests)
- [7. Daño, Horror, Herido, Loco y Eliminado](#7-daño-horror-herido-loco-y-eliminado)
- [8. Estados (*Conditions*)](#8-estados-conditions)
- [9. Monstruos](#9-monstruos)
- [10. El mapa](#10-el-mapa)
- [11. Rompecabezas](#11-rompecabezas)
- [12. Objetos y Hechizos](#12-objetos-y-hechizos)
- [13. Fuego, Oscuridad, Obstrucciones y otros elementos del entorno](#13-fuego-oscuridad-obstrucciones-y-otros-elementos-del-entorno)
- [14. Glosario de términos especiales](#14-glosario-de-términos-especiales)
- [15. Final de la partida](#15-final-de-la-partida)
- [16. FAQ, erratas y reglas que suelen malinterpretarse](#16-faq-erratas-y-reglas-que-suelen-malinterpretarse)
- [17. Glosario de terminología española ↔ inglesa](#17-glosario-de-terminología-española--inglesa)
- [18. Puente con Valkyrie: qué controla la app y cómo lo modela Valkyrie](#18-puente-con-valkyrie-qué-controla-la-app-y-cómo-lo-modela-valkyrie)
- [Fuentes](#fuentes)

## Códigos de fuente

Cada afirmación lleva el código de su fuente. La lista completa de URL está en "Fuentes", al final.

| Código | Fuente |
|---|---|
| [RR] | *Rules Reference* oficial (FFG, inglés). Es la fuente de mayor autoridad. |
| [AJ] | *Learn to Play* oficial, el "Aprende a jugar" (FFG, inglés). |
| [GR] | *Guía de referencia* oficial en español (Edge/Asmodee). Se usa sobre todo para la terminología. |
| [FAQ] / [FAQ-ES] | FAQ y erratas oficiales v1.0 (FFG en inglés / Edge en español). |
| [DICT] | Dictámenes de diseñadores de FFG (Kara Centell-Dunk, Grace Holdinghaus y correos de FFG), recopilados en BGG y en el archivo del foro de FFG. |
| [BGG] | Hilos y FAQ comunitarios de BoardGameGeek y del foro de FFG. **No son oficiales** salvo que se indique. |
| [EXP] | Reglamentos oficiales de las expansiones. |
| [APP] | Cadenas de la app oficial en español que Valkyrie declara "heredadas de la localización de FFG". |
| [VAL] | Datos, código y wiki del repositorio de Valkyrie (NPBruce/valkyrie). |
| [COM] | Escenarios comunitarios de Valkyrie traducidos al español (repositorios de GitHub). |
| [OoG], [Lindhard], [Steam], [reseñas], [web FFG] | Resúmenes, listas de componentes, hilos de Steam y reseñas (no oficiales). |

**(sin verificar)** significa que el dato no pudo confirmarse en una fuente fiable.

---

## 0. Chuleta rápida

- **Formato.** Juego cooperativo para 1 a 5 investigadores contra la app, que hace de Guardián, narrador y motor de reglas. En solitario, un jugador controla 2 investigadores [RR].
- **Ronda.** Primero la **Fase de los Investigadores**: cada uno juega 1 turno de hasta 2 acciones. Después la **Fase de los Mitos**, con este orden: el Fuego se propaga, se resuelven los Eventos, se activan los monstruos y se resuelve el paso de Horror [RR].
- **Tirada.** Se lanzan tantos dados como el valor del atributo, ajustado por modificadores, con un mínimo de 1 dado. El dado tiene 8 caras: 3 de **Éxito**, 2 de **Investigación** (lupa) y 3 vacías. Gastar 1 Pista convierte 1 Investigación en Éxito [RR].
- **Alcance.** Hasta 3 espacios. No atraviesa paredes, puertas ni Pasadizos secretos, pero sí bordes infranqueables. **No existe línea de visión**; el alcance puede doblar esquinas [RR][DICT].
- **Evasión.** Es obligatoria para salir voluntariamente del espacio de un monstruo y para hacer en él cualquier acción que no sea Ataque o Movimiento. Se resuelve contra el monstruo de mayor **Percepción** [RR].
- **Tirada de Horror.** Se hace en el paso de Horror, una vez por investigador, contra el monstruo con mayor puntuación de **Horror** dentro del alcance [RR].
- **Daño y Horror.** Si el total alcanza la Vida o la Cordura, el investigador queda **Herido** o **Loco** y descarta las cartas boca abajo. Si vuelve a alcanzarlo, queda **Eliminado**. Los demás pierden al final de la siguiente Fase de los Investigadores si la investigación no está completa [RR].
- **Fuego.** Se añade 1 ficha en total por ronda. Entrar en un espacio con Fuego, actuar en él o renunciar a una acción en él causa 1 Daño boca abajo [RR][DICT].
- **Oscuridad.** Impide gastar Pistas, salvo que haya Fuente de luz o Fuego en tu espacio o en uno adyacente [RR].
- **Rompecabezas.** Los pasos permitidos son el valor **impreso** del atributo, más 1 por cada Pista gastada. El progreso se guarda al cerrar [RR].

---

## 1. Visión general

- **Género.** Juego cooperativo de investigación y terror lovecraftiano. Las partidas duran unas 2 a 3 horas. La app gratuita es obligatoria y existe para iOS, Android, Amazon y Steam [web FFG].
- **Papel de la app.** Sustituye al Guardián de la 1ª edición. Genera el mapa a medida que se explora, los eventos de los Mitos, la activación y los ataques de los monstruos, los textos de ataque, evasión y Horror, los rompecabezas y las condiciones de victoria y derrota [RR].
- **Lo que no hace la app.** No tira dados ni comprueba lo que hacen los jugadores. Los jugadores mueven figuras y fichas, tiran los dados e informan a la app de los resultados, por sistema de honor [RR][reseñas].
- **Quién gana.** Todos los investigadores ganan o pierden juntos. Las excepciones son los efectos que cambian condiciones individuales, como los reversos de las cartas de Estado **Loco** o las Agendas de *Horrific Journeys* [RR][EXP].
- **Objetivo oculto.** Al principio solo se conoce el **prólogo**. Cuando los investigadores progresan lo suficiente, la app revela el **objetivo** y la tarea final [RR][AJ]:
  - La app solo registra el objetivo básico; los detalles los tienen que recordar los jugadores.
  - Si tardan demasiado, el objetivo puede cambiar o endurecerse, y al final pueden perder por tiempo.
- **Prioridad de las reglas** [RR][DICT]:
  - La *Rules Reference* prevalece sobre el *Learn to Play*.
  - El texto de los componentes y de la app prevalece sobre la *Rules Reference*.
  - Un efecto con "no puede" es absoluto, salvo que otro efecto lo contradiga de forma específica, por ejemplo con "puede".
- **Decisiones de grupo.** Lo que se decide "en grupo" exige unanimidad. Si no hay acuerdo, decide un investigador elegido al azar. Lo mismo vale para los empates de objetivo de los monstruos y para los efectos que afectan a "un investigador" [RR][FAQ].
- **Investigador.** El término engloba la carta, la figura y el jugador que lo controla. Los jugadores toman todas las decisiones de sus investigadores [RR].

---

## 2. Componentes y su función

### 2.1 Contenido de la caja base [AJ]

| Componente | Cantidad |
|---|---|
| Cartas de investigador y figuras | 8 + 8 |
| Figuras de monstruo con su ficha | 24 + 24 |
| Módulos de tablero (map tiles) | 24 |
| Cartas de Objeto común | 40 |
| Cartas de Objeto único | 24 |
| Cartas de Hechizo (6 hechizos × 5 copias) | 30 |
| Cartas de Estado | 37 |
| Cartas de Daño | 40 |
| Cartas de Horror | 40 |
| Fichas de Pista | 26 |
| Fichas de Identificación (ID) | 6 |
| Fichas de Personaje | 22 |
| Fichas de Búsqueda / Interacción (doble cara) | 16 |
| Fichas de Exploración / Vistazo (doble cara) | 16 |
| Fichas de Fuego / Oscuridad (doble cara) | 18 |
| Fichas de Pasadizo secreto | 4 |
| Fichas de Obstrucción (barricada) | 4 |
| Fichas de Pared | 8 |
| Fichas de Puerta | 4 (otra fuente da 8) |
| Dados de 8 caras | 5 |
| Kit de conversión para componentes de la 1ª edición | 1 |

- **Investigadores de la caja base** [Lindhard]: Agatha Crane, Carson Sinclair, Father Mateo, Minh Thi Phan, Preston Fairmont, Rita Young, Wendy Adams y William Yorick.
- **Reparto de las cartas de Estado** [Lindhard]:
  - Herido ×5.
  - Loco ×12.
  - Aturdido (Stunned) ×5.
  - Desconcertado (Dazed) ×5.
  - Retenido (Restrained) ×5.
  - Concentrado (Focused) ×5.
- **Hechizos de la caja base** [Lindhard][VAL]:
  - De apoyo: Feed the Mind, Flesh Ward e Instill Bravery.
  - De ataque: Shriveling, Wither y Wrack.

### 2.2 Para qué sirve cada componente

**Carta de investigador** [RR][GR]

- Tiene 6 **atributos** con valores de 2 a 5, que son el número de dados de cada tirada:
  - **Fuerza:** proezas físicas y ataques con armas pesadas.
  - **Agilidad:** velocidad y coordinación, armas de filo, armas de fuego y, a menudo, evasión.
  - **Observación:** encontrar detalles, buscar y forzar cerraduras.
  - **Saber:** conocimiento académico y arcano, y hechizos.
  - **Influencia:** carisma y trato con personajes.
  - **Voluntad:** disciplina y resistencia al Horror.
- **Vida** (health) y **Cordura** (sanity) son valores fijos impresos. **No bajan**: funcionan como umbrales.
- Cada investigador tiene una capacidad única, y su historia está en el reverso.

**Ficha de monstruo** [RR]

- **Anverso:** nombre, **Percepción** (número verde, arriba a la derecha) y **Horror** (número azul, abajo a la derecha).
- **Reverso:** **Agresividad** (número rojo, abajo a la derecha), capacidades (por ejemplo *Acuático* o *Volador*) y texto ambiental.
- **La Vida del monstruo no está impresa en la ficha.** La muestra la app en el menú del monstruo.
- La ficha se encaja en la peana de la figura:
  - Peana pequeña: la mayoría de los monstruos.
  - Peana mediana: Horrendo cazador (Hunting Horror) y Turba (Riot).
  - Peana grande: Star Spawn.

**Ficha de Identificación (ID)** [RR]

- Se coloca en la peana cuando hay varios monstruos del mismo tipo. La app indica cuál poner, y el monstruo la conserva mientras siga en juego.

**Mazos de Daño y de Horror** [RR]

- Se barajan y se colocan boca abajo.
- Cada carta tiene uno de dos rasgos: *Resolver inmediatamente* o *Mantener boca arriba* (detalles en el §7).

**Estados, Objetos comunes y Objetos únicos** [RR][AJ]

- Estos mazos se ordenan alfabéticamente y boca arriba, porque se toman por nombre.

**Hechizos** [RR]

- Cuando ganas un Hechizo recibes una copia **al azar** de ese hechizo.
- Nadie puede mirar el reverso de un Hechizo.

**Pistas** [RR]

- Son fichas que **no son pertenencias**: no se sueltan ni se intercambian salvo que un efecto lo permita.
- Al gastarlas vuelven a la reserva.

**Fichas de la app** [RR]

- **Búsqueda** e **Interacción** son las dos caras de la misma ficha.
- **Exploración** y **Vistazo** son las dos caras de la misma ficha.

**Fichas de Personaje (Person)** [RR]

- **Comunes:** silueta, el mismo dibujo por ambas caras y personajes anónimos.
- **Únicos:** ilustración a color, con el nombre del personaje en el reverso.

**Fichas de Pared y de Puerta**

- Modifican los bordes de los módulos cuando la app lo indica (uso exacto sin verificar).

**Características del entorno (features)** [RR]

- Son fichas cuadradas que se usan **sin intervención de la app**: Obstrucción, Oscuridad, Fuego y Pasadizo secreto.

**Límites de componentes** [RR]

- **Pistas, Oscuridad y Fuego son ilimitados.** Si se acaban, se usan sustitutos.
- Todo lo demás está limitado a lo que trae la caja.

---

## 3. Preparación

### 3.1 Lo que hacen los jugadores [AJ][RR]

1. Separan las cartas de investigador.
2. Barajan los mazos de **Daño** y **Horror** y los dejan boca abajo.
3. Ordenan alfabéticamente y boca arriba los mazos de Objetos comunes, Objetos únicos, Hechizos y Estados.
4. Agrupan los módulos de tablero por tamaño.
5. Encajan cada ficha de monstruo en la peana de su figura.
6. Separan las fichas en reservas por tipo.

### 3.2 Lo que hace la app

1. **Elegir escenario** [AJ][DICT].
   - La app muestra la dificultad del escenario en estrellas y su duración aproximada.
   - Las estrellas indican cuánto daño se espera que sufra el grupo al ganar con 5 investigadores: 2 estrellas equivalen a que un 40 % salga malparado, y 5 estrellas a que salgan todos muy dañados.
   - Las reglas no describen un selector de dificultad (sin verificar que no exista uno en la app).
2. **Elegir investigadores** [AJ].
   - Cada jugador elige uno y lo indica en la app. En solitario, un jugador controla 2.
3. **Pertenencias iniciales** [AJ][DICT].
   - La app indica qué objetos y hechizos iniciales recibe el grupo, y los jugadores los reparten como quieran.
   - Los objetos personales de ciertos investigadores de expansión llegan automáticamente.
   - Las **Pistas** iniciales se reparten **exactamente** como diga la app, porque no son pertenencias.
4. **Prólogo y colocación inicial** [AJ].
   - Se lee el prólogo.
   - La app indica qué módulos colocar, dónde situar las figuras y qué fichas poner (Búsqueda, Exploración, Personaje, etc.).
   - Luego empieza la primera Fase de los Investigadores.
5. **Administrador de colección** [RR].
   - En el menú principal, la opción "More → My Collection" permite activar los productos que se poseen.
   - La app solo usa el contenido activado: investigadores, monstruos y módulos.

### 3.3 Lo que no existe en la 2ª edición base

- No hay historias personales ni progresión de personaje entre partidas. No existen la experiencia ni el oro.
- Los escenarios oficiales son autónomos (sin verificar para todos los escenarios descargables y expansiones).
- Los mecanismos ocultos por jugador son las cartas de **Loco** (base) y las **Agendas** de *Horrific Journeys*.

---

## 4. Estructura de la ronda

Una **ronda** consta de la Fase de los Investigadores y la Fase de los Mitos. Se repite hasta ganar o perder [RR].

### 4.1 Fase de los Investigadores [RR][FAQ]

- **Orden de turnos.** Cada investigador juega **un turno**, en el orden que elija el grupo. No hace falta fijar todo el orden de antemano: cuando termina uno, se decide quién sigue.
- **Turnos completos.** No se intercalan turnos: cada uno se juega entero.
- **Acciones.** Cada turno permite hasta **2 acciones**:
  - Se puede repetir la misma acción, por ejemplo moverse dos veces para recorrer hasta 4 espacios.
  - Se pueden hacer menos de 2.
- **Fin de la fase.** Cuando todos han jugado, un jugador pulsa **"Fin de la fase"** en la app.

### 4.2 Fase de los Mitos [RR][AJ]

**Propagación del Fuego.** Ocurre **al principio de la fase, antes de cualquier evento**. Si hay Fuego en algún lugar, se coloca **1 sola ficha** de Fuego en un espacio adyacente a un espacio con Fuego (detalles en el §13).

**1. Paso de Eventos.**

- La app genera uno o más **Eventos de los Mitos**, que se resuelven según su texto.
- Suelen pedir tiradas y causar Daño u Horror. También pueden hacer aparecer monstruos, provocar Fuego o Oscuridad o quitar objetos.
- Muchos eventos dependen de la situación: el investigador en Oscuridad, el que está en un espacio exterior, el de menor Agilidad, etc.

**2. Paso de Activación de monstruos.**

- La app da instrucciones de activación para **cada monstruo**, uno tras otro (ver el §9.3).
- Si no hay monstruos, el paso se salta.

**3. Paso de Horror.**

- Cada investigador resuelve **una tirada de Horror** contra el monstruo dentro del alcance con mayor puntuación de Horror (ver el §9.6).
- Si no tiene ninguno dentro del alcance, no tira.

**Final.** Un jugador pulsa "Fin de la fase" y empieza una nueva ronda.

### 4.3 El tiempo

- Las reglas no muestran un contador visible de rondas.
- La app controla internamente el progreso y la presión de tiempo. Si los investigadores tardan, el objetivo puede cambiar o volverse más difícil, y al final pueden perder [RR][AJ].
- El **Historial de mensajes** de la app está organizado por rondas [RR].
- En Valkyrie, la variable interna `#round` cuenta las rondas [VAL].

---

## 5. Acciones

**Coste en acciones** [RR][DICT]

- Las opciones de la app marcadas con el **icono de acción** cuestan 1 acción.
- Las opciones sin icono son gratuitas.
- Se puede pulsar una ficha para leer su texto sin comprometerse a gastar una acción.

### 5.1 Las acciones disponibles

| Acción | Qué hace |
|---|---|
| **Movimiento** | Mover hasta 2 espacios, uno a uno, entre espacios adyacentes. |
| **Búsqueda** | Usar en la app una ficha de Búsqueda de tu espacio. |
| **Exploración** | Usar en la app una ficha de Exploración para revelar la zona contigua. |
| **Interacción** | Usar en la app una ficha de Interacción o de Personaje de tu espacio. |
| **Ataque** | Atacar a un monstruo a través de la app. |
| **Intercambio** | Dar, recoger y soltar pertenencias en tu espacio. |
| **Acciones de componente** | Usar efectos "Acción:" de cartas, características del entorno o el inventario de la app. |
| **Empujar** | Mover a un monstruo u otro investigador de tu espacio (poco habitual). |
| **Robar** | Quitar pertenencias a otro investigador de tu espacio (poco habitual). |
| **Prender fuego** | Colocar Fuego en tu espacio o en uno adyacente (poco habitual). |

### 5.2 Movimiento

**Cómo se mueve** [RR][DICT]

- Se mueve hasta **2 espacios**, de uno en uno, a espacios **adyacentes**.
- Se pueden cruzar **bordes** (líneas blancas o amarillas continuas) y **puertas** no bloqueadas.
- No se pueden cruzar paredes (líneas marrones gruesas) ni bordes infranqueables (líneas discontinuas), salvo que un efecto lo permita.
- No hay movimiento en diagonal cuando dos espacios solo se tocan por una esquina.

**Interrumpir el movimiento** [RR][FAQ]

- La acción de Movimiento **se puede interrumpir**: por ejemplo, mover 1 espacio, hacer otra acción y mover el espacio restante.

**Bloqueos** [RR]

- Una **Obstrucción** o una **ficha de Exploración** bloquean el paso por su puerta.

**Monstruos y movimiento** [RR][AJ]

- Entrar en el espacio de un monstruo es libre.
- **Salir voluntariamente** exige una tirada de evasión (§9.5).
- El movimiento **involuntario**, como ser empujado o desplazado por un efecto, no requiere evasión.

**Herido** [AJ]

- Un investigador Herido no puede hacer la acción de Movimiento **más de una vez por ronda**.

**Movimiento extra de capacidades** [DICT]

- El movimiento adicional que conceden algunas capacidades puede usarse antes, entre o después del movimiento normal.
- Aun así requiere evasión si sales del espacio de un monstruo.

### 5.3 Búsqueda [RR][AJ]

- Solo se puede buscar en la ficha de Búsqueda **de tu espacio**.
- Se pulsa la ficha en la app y se elige la opción con el icono de acción.
- El resultado lo da la app: normalmente una tirada (a menudo de Observación) y, como consecuencia, Objetos, Pistas o nada.
- Las reglas no dicen si la ficha se retira después de buscar. Lo decide el texto de la app.

### 5.4 Exploración [RR][AJ]

- La ficha de Exploración se coloca en una puerta o borde que lleva a una zona no revelada.
- Se puede explorar estando **en el espacio de la ficha** o **adyacente a la puerta que bloquea**.
- La app indica qué módulos, fichas y monstruos colocar. Puede revelar varias habitaciones, ninguna, o una puerta cerrada que pide una llave o una tirada.
- Tras colocar todo, la app **puede permitir** que el investigador entre en la zona explorada cruzando esa puerta. Ese movimiento lo concede la app, no las reglas generales. En la práctica lo concede casi siempre, al final de la exploración y enfocando la puerta; en un escenario de Valkyrie hay que escribirlo (`patrones.md` §2).
- Hasta que se explora, la ficha impide el paso.

### 5.5 Interacción [RR][AJ]

- Se interactúa con una ficha de **Interacción** (un objeto) o de **Personaje** que esté en **tu espacio**.
- Se elige en la app una opción con el icono de acción.
- La app puede ofrecer **varias opciones**: hablar, dar un objeto, usar una llave, etc.
- El resultado suele ser una tirada, Objetos, Pistas, información o un rompecabezas.
- Las reglas no dan movimiento propio a los Personajes, pero la app puede ordenar moverlos ("Mueve la ficha de Personaje...") [COM].

### 5.6 Ataque [RR][AJ][APP]

**Procedimiento**

1. Se abre el **Cajón de monstruos**, se elige el monstruo y se pulsa **"Atacar"**.
2. La app pregunta con qué tipo de arma se ataca. Las opciones son:
   - Arma pesada.
   - Arma de filo.
   - Arma de fuego.
   - Hechizo.
   - Sin arma.
3. Se confirma la opción con el icono de acción, que cuesta 1 acción.
4. La app muestra el **texto de ataque**.

**Qué se puede usar** [RR][AJ]

- Para atacar con un tipo de arma hay que tener un Objeto o Hechizo de ese tipo, con icono **cuerpo a cuerpo** o **a distancia** y un valor de Daño.
- Siempre se puede atacar **sin arma**, aunque se lleven armas.

**Alcance del ataque** [RR]

- **Cuerpo a cuerpo** (incluido sin arma): solo contra un monstruo de **tu espacio**.
- **A distancia:** contra cualquier monstruo **dentro del alcance**, es decir, hasta 3 espacios sin atravesar paredes ni puertas.

**Resolución** [AJ][BGG]

- El texto de ataque suele pedir una tirada y decir cuánto Daño sufre el monstruo.
- Ejemplo oficial: con una palanca (Daño 2), la app pide una tirada de **Fuerza con dificultad 2**. Con 2 Éxitos, el monstruo sufre el Daño del arma más el resultado de la tirada: 2 + 2 = 4.
- El "resultado" de la tirada son solo los Éxitos; el valor del arma no se suma al resultado [BGG].

**Registro del daño** [RR]

- El Daño se anota en la app con los botones **+ / −** del menú del monstruo.
- Al alcanzar su Vida, el monstruo queda derrotado y la app lo retira del cajón.

**Evasión antes de atacar** [RR][DICT]

- Atacar **no** requiere evasión, aunque estés en el espacio de un monstruo.

**Textos de ataque en la app** [VAL]

- Dependen del **tipo de arma** y de la **categoría del monstruo**: humanoide, bestia, espíritu, y en expansiones hombre-serpiente y "fleshless".
- Valkyrie importa estos textos con claves de la app oficial, como `ATTACK_BLADED_VS_BEAST_xx`.

### 5.7 Intercambio [RR]

- Cada investigador del espacio, **incluido el activo**, puede:
  - Dar cualquier número de sus pertenencias a otro investigador del mismo espacio.
  - **Recoger** cualquier número de pertenencias del espacio.
  - **Soltar** cualquier número de pertenencias en el espacio.
- Esto se hace en cualquier orden y tantas veces como se quiera.
- **Recoger y soltar requieren esta acción**, así que llevarse objetos del suelo cuesta acciones.
- Pistas, Estados, Daño y Horror **no** son pertenencias.

### 5.8 Acciones de componente [RR][AJ]

- Son los efectos precedidos de **"Acción:"** en cartas de Objeto, Hechizo o investigador. Por ejemplo, la capacidad de Carson Sinclair permite que otro investigador dentro del alcance haga 1 acción, una vez por ronda.
- También incluyen las acciones de las características del entorno: mover una Obstrucción o apagar Fuego (§13).
- Algunos objetos se usan desde el **Inventario** de la app: se abre el inventario, se elige el objeto y se confirma la opción con icono de acción.

### 5.9 Acciones poco habituales

Se usan sobre todo cuando una carta de **Loco** cambia los objetivos de un investigador [AJ].

**Empujar** [RR][DICT]

- Requiere un monstruo u otro investigador **en tu espacio**. Se elige un espacio adyacente y el objetivo.
- **Si el objetivo es otro investigador**, este decide si se deja mover o se resiste:
  - Si se resiste, primero tira Fuerza.
  - La dificultad para el empujador es el **resultado del defensor + 1**.
- **Si el objetivo es un monstruo**, la dificultad es su **Agresividad**.
- **Tirada:** el empujador tira **Fuerza**.
  - Si la supera, el objetivo se mueve 1 espacio hacia el espacio elegido, y el empujador **puede** moverse 1 espacio en la misma dirección.
  - Si falla, renuncia a la acción.
- **Evasión:** si empujas en el espacio de un monstruo, hay que superar una evasión para empezar la acción, y otra para seguir al empujado fuera del espacio.
- **Bordes infranqueables:** un monstruo volador o incorpóreo (*phasing*) puede ser empujado a través de un borde infranqueable. El empujador sigue por el camino más corto practicable.

**Robar** [RR][DICT]

- Se elige otro investigador de tu espacio y uno de estos atributos: Fuerza, Agilidad u Observación.
- Ambos tiran ese atributo. Las modificaciones se aplican simultáneamente y con información completa.
- El activo toma 1 pertenencia por cada Éxito que supere el resultado del otro.
- Si el otro iguala o supera al activo, este renuncia a la acción sin obtener nada.

**Prender fuego** [RR]

- Requiere tener una **Fuente de luz**.
- Se coloca Fuego en tu espacio o en uno adyacente que no tenga ya Fuego.
- Si no había Fuego en el tablero, hay que elegir **"Prender fuego"** en el menú de juego para que la app empiece a propagarlo.

### 5.10 Cosas gratuitas (no cuestan acción)

- Inspeccionar fichas de **Vistazo** [RR].
- Usar capacidades que no digan "Acción:", como Duke al principio del turno [FAQ].
- Elegir en la app opciones sin icono de acción [Steam][DICT].

---

## 6. Tiradas (en inglés, *tests*)

> En la edición española el término oficial es **"Tirada"** (tirada de Fuerza, tirada de evasión, tirada de Horror) [GR]. **"Prueba" es el rasgo *Evidence*** de los objetos (Prueba fotográfica, Prueba circunstancial...). Para evitar confusiones, en los textos de escenario conviene escribir "tirada" y no "prueba".

### 6.1 Notación

- Una tirada aparece como el **icono del atributo**, seguido opcionalmente de un **modificador** (±N) y, tras un punto y coma, de la **dificultad**. Por ejemplo, (Agilidad −1; 2) [RR].
- Valkyrie muestra los iconos con símbolos como `{strength}`, `{agility}`, `{observation}`, `{lore}`, `{influence}`, `{will}`, `{success}`, `{clue}` y `{action}` [VAL].

### 6.2 Procedimiento [RR]

1. **Reserva de dados.** Se parte del valor impreso del atributo, se aplica el modificador y luego otros efectos (objetos, Estados, etc.). Si queda en menos de 1, se tira **1 dado**.
2. **Lanzar.** Si hacen falta más dados de los disponibles (hay 5), se tiran, se anotan los resultados y se vuelve a tirar hasta completar la reserva.
3. **Modificar resultados:**
   - Repeticiones o conversiones de efectos: solo si un efecto lo permite.
   - **Pistas:** cada Pista gastada convierte **1** resultado de Investigación en Éxito. No se puede en **Oscuridad** (§13) ni estando **Desconcertado** (§8).
   - **Concentrado:** se descarta para convertir **todas** las Investigaciones en Éxitos.
4. **Resultado.** El resultado es el número de **Éxitos**.
   - Si hay dificultad y el resultado es menor, la tirada se falla.
   - Si no hay dificultad, el resultado se usa tal cual. Por ejemplo, el monstruo sufre tanto Daño como el resultado, o el investigador sufre 3 menos el resultado.

### 6.3 Dados [RR]

- Son dados de **8 caras**:
  - 3 caras de **Éxito** (el icono del Signo Arcano).
  - 2 caras de **Investigación** (lupa).
  - 3 caras **vacías**.
- No hay límite teórico de dados en una reserva.

### 6.4 Reglas especiales

**"Anula"** (*negates*) [RR]

- Cuando una tirada dice que anula, cada Éxito evita 1 Daño o 1 Horror, a elección del investigador si hay de ambos.
- Ejemplo de formato: sufre 3 de Daño (anulado por Agilidad).

**Quién tira** [RR]

- Solo tira el investigador activo. Otros no pueden aportar dados, salvo que un efecto lo permita.

**Tiradas enfrentadas** (Robar y Empujar) [DICT]

- Ambos tiran, con información completa y modificaciones simultáneas.

**"Lanza X dados" no es una tirada** [DICT]

- Si un evento dice solo que se lancen dados, no se pueden usar Pistas, Concentrado ni otros modificadores de tirada.
- Los monstruos también lanzan dados sin tirar atributos: por ejemplo, tantos dados como su Agresividad contra una Obstrucción.

**Cómo pregunta la app** [OoG][COM][VAL]

- A veces ofrece botones de "superada" o "fallada".
- Otras veces pide **el número de Éxitos**. Un ejemplo comunitario: "Realiza una tirada de Influencia e indica el número de Éxitos".
- Algunas tiradas son **acumulativas**: la app recuerda los Éxitos de intentos anteriores y en el siguiente intento faltan menos. En Valkyrie esto se modela con eventos de cuota (*quota*).

### 6.5 Probabilidades útiles para fijar dificultades

Con 3/8 de probabilidad de Éxito por dado, sin Pistas:

| Dados | Éxitos esperados | ≥1 | ≥2 | ≥3 | ≥4 |
|---|---|---|---|---|---|
| 1 | 0,38 | 38 % | — | — | — |
| 2 | 0,75 | 61 % | 14 % | — | — |
| 3 | 1,13 | 76 % | 32 % | 5 % | — |
| 4 | 1,50 | 85 % | 48 % | 15 % | 2 % |
| 5 | 1,88 | 90 % | 62 % | 28 % | 7 % |
| 6 | 2,25 | 94 % | 73 % | 40 % | 15 % |

Con Pistas de sobra, cada lupa también cuenta (5/8 de probabilidad):

| Dados | ≥1 | ≥2 | ≥3 | ≥4 |
|---|---|---|---|---|
| 1 | 62 % | — | — | — |
| 2 | 86 % | 39 % | — | — |
| 3 | 95 % | 68 % | 24 % | — |
| 4 | 98 % | 85 % | 52 % | 15 % |
| 5 | 99 % | 93 % | 72 % | 38 % |
| 6 | 100 % | 97 % | 85 % | 60 % |

Estas tablas están calculadas a partir de las caras del dado. Una reseña comenta que muchas tiradas oficiales piden **2 Éxitos**: con un atributo de 3 o 4, eso da entre un 30 % y un 50 % de acierto sin Pistas.

---

## 7. Daño, Horror, Herido, Loco y Eliminado

### 7.1 Sufrir Daño y Horror [RR][AJ][BGG]

- **Cómo se sufren.** Sufrir Daño u Horror significa robar la carta superior del mazo correspondiente. Se pone **boca arriba**, salvo que el efecto diga "boca abajo".
- **Varias cartas.** Cada una se resuelve antes de robar la siguiente [DICT].
- **Rasgos de las cartas:**
  - ***Resolver inmediatamente:*** su efecto se aplica al recibirla y casi siempre termina con la carta boca abajo.
  - ***Mantener boca arriba:*** tiene un efecto continuo mientras siga boca arriba. Algunos ejemplos de cartas de Horror son las fobias, la Claustrofobia y la Nictofobia.
- **Cartas boca abajo.** No tienen efecto, solo **cuentan** para el total. El jugador no puede mirarlas salvo que un efecto lo permita.
- **Dar la vuelta.** Para poner boca arriba cartas boca abajo, se eligen **al azar**. Para poner boca abajo cartas boca arriba, el jugador elige cuáles [BGG].
- **Dar la vuelta a varias a la vez** [DICT]:
  - Primero se eligen todas al azar y después se giran juntas.
  - Si una de ellas ordena girar otra más y ya no quedan boca abajo, no se gira nada.
- **Descartar.** Se elige una carta boca arriba o una boca abajo al azar, y se baraja de nuevo en su mazo.
- **"Más Daño" en los objetivos.** Los efectos que buscan al investigador con más Daño u Horror solo cuentan las cartas de Daño u Horror, no las cartas de Herido ni de Loco [DICT].

### 7.2 Herido (Wounded) [RR][AJ][DICT]

**Cuándo ocurre**

- Cuando el Daño total, sumando el que está boca arriba y el que está boca abajo, **iguala o supera la Vida**.

**Secuencia**

1. Primero se termina de sufrir todo el Daño de ese efecto.
2. Después se gana la carta **Herido** y se **descartan todas las cartas de Daño boca abajo**. Las que están boca arriba se quedan.

**Precisiones de los dictámenes**

- Si una carta de *Resolver inmediatamente* se descarta a sí misma y con eso el total queda por debajo del umbral, el investigador **no** queda Herido.
- Si queda Herido a mitad de un evento, se resuelve el estado antes de seguir con el resto del texto.

**Efecto**

- No puede hacer la acción de Movimiento **más de una vez por ronda**.
- Renunciar a un Movimiento cuenta como haberlo hecho [DICT].

**Si ya estaba Herido**

- Si el Daño vuelve a igualar o superar la Vida, queda **Eliminado**.

### 7.3 Loco (Insane) [RR][AJ][DICT]

**Cuándo ocurre**

- Igual que con el Daño, pero con el **Horror** frente a la **Cordura**.
- Se gana una carta **Loco al azar** y se descartan las cartas de Horror boca abajo.

**El reverso de la carta**

- Indica un **número mínimo de investigadores**. Si hay menos en la partida, se descarta y se toma otra.
- El jugador lo lee **en secreto** y no puede enseñárselo a nadie salvo que un efecto lo permita. Hablar o insinuar su contenido es cuestión de normas sociales, no de reglas [DICT].
- Suele **cambiar las condiciones de victoria o derrota** de ese investigador, lo que puede llevarle a Empujar, Robar o Prender fuego.

**Ejemplos de cartas Loco** [DICT]

- *Forbidden Words* le impide hablar con los demás jugadores, aunque sí puede interactuar con fichas de Personaje.
- *Crisis of Conscience* solo gana si la investigación queda incompleta y él no ha sido eliminado.

**Si ya estaba Loco**

- Si el Horror vuelve a igualar o superar la Cordura, queda **Eliminado**.

### 7.4 Eliminado (no existe un estado "Muerto") [RR][FAQ][FAQ-ES]

**Al quedar eliminado**

- El investigador **suelta todas sus pertenencias** en su espacio y **retira su figura** del tablero.
- No juega más turnos ni hace acciones.
- **No gana** la partida, salvo que un efecto diga expresamente que gana aunque esté eliminado. Así lo aclara la errata oficial.

**Consecuencia para el grupo**

- Los demás investigadores **pierden al final de la siguiente Fase de los Investigadores** si para entonces no han completado la investigación. Esa fase es la "última oportunidad".
- Un jugador elige **"Investigador eliminado"** en el menú de la app.
- Si **todos** quedan eliminados a la vez, la partida termina **inmediatamente** con derrota.

**Efectos sobre investigadores eliminados**

- Se resuelven en la medida de lo posible, y el eliminado no se ve afectado salvo que el efecto lo diga [FAQ].

**Cómo lo implementa Valkyrie** [VAL]

1. Al marcar "Investigador eliminado" se activa la variable `#eliminated`.
2. Al terminar esa ronda empieza la ronda final, que dispara el activador `StartFinalRound`.
3. Al terminar la Fase de los Investigadores de esa ronda se dispara el activador **`Eliminated`**. El diseñador debe crear con él el evento de derrota.

---

## 8. Estados (*Conditions*)

### 8.1 Reglas generales [RR]

- **Ganar un Estado.** Se toma una copia y se coloca **boca arriba**, con la ilustración visible.
- **Sin duplicados.** No se pueden tener **varias copias** del mismo Estado.
- **Estados de doble cara.** Si el Estado tiene doble cara y se gana al azar, se toma una copia aleatoria.
- **Reversos.** No se puede mirar el reverso de un Estado salvo que un efecto lo permita. La excepción es **Loco**, que su dueño mira en privado.
- **Descartar.** Al descartarse, el Estado vuelve a su mazo.
- **Duración.** Los Estados temporales de la caja base indican que se descartan al **final de tu turno**. Por eso un Estado recibido durante la Fase de los Mitos afecta a todo el turno siguiente (deducción a partir de [BGG]).

### 8.2 Estados de la caja base

| Español (oficial) | Inglés | Efecto | Fuente |
|---|---|---|---|
| **Herido** | Wounded | Ver el §7.2: como máximo 1 acción de Movimiento por ronda. Un segundo umbral de Daño elimina. Es permanente. | [AJ][RR] |
| **Loco** | Insane | Ver el §7.3: reverso secreto que cambia las condiciones de victoria o derrota. Un segundo umbral de Horror elimina. Es permanente. | [RR][AJ] |
| **Aturdido** | Stunned | No puedes hacer **más de 1 acción en tu turno**. Se descarta **al final de tu turno**. Las acciones que te concede otro durante **su** turno, como la capacidad de Carson Sinclair, no están limitadas. | Texto de la carta citado en el foro de FFG |
| **Desconcertado** | Dazed | **No puedes gastar Pistas**. No impide usar Concentrado. Se descarta al final de tu turno (texto exacto de la carta sin verificar). | [BGG], con respuesta oficial según el hilo |
| **Retenido** | Restrained | **No puedes moverte voluntariamente.** Sí puedes atacar, buscar, etc., y hacer acciones que incluyan movimiento involuntario. Se descarta al final de tu turno (según [BGG]; texto exacto sin verificar). | Foro de FFG y [DICT] |
| **Concentrado** | Focused | Puedes **descartarlo** al resolver una tirada para convertir **todas** tus Investigaciones en Éxitos. Se conserva hasta usarlo, incluso entre rondas. | [AJ][BGG] |

**Notas sobre los nombres**

- Los cuatro nombres Aturdido, Desconcertado, Retenido y Concentrado aparecen en el **índice de la Guía de referencia oficial**, que remite a "Estado" [GR].
- La correspondencia con el inglés sale de traducciones comunitarias consistentes entre sí: Stunned es Aturdido, Dazed es Desconcertado, Restrained es Retenido y Focused es Concentrado [COM].
- Un escenario comunitario traduce mal *Dazed* como "Aturdido". La correspondencia correcta es la de la tabla.

**Inmunidades**

- Algunos investigadores no pueden recibir ciertos Estados. Por ejemplo, Wendy Adams no puede quedar Aturdida ni Retenida [BGG].

### 8.3 Términos que no son Estados de esta 2ª edición

Conviene no confundirlos:

- **Bleeding, Cursed, Detained, Agonized y Hunted** no existen como Estados aquí. Son de otros juegos de Arkham o de FFG (sin verificar que no aparezcan en algún escenario).
- **Hallucinations y Paranoia** son nombres de **cartas de Horror** de la caja base, no Estados.
- **Infected Wounds** es una carta de **Daño** de *Path of the Serpent*.
- **Oscuridad** es una característica del entorno, no un Estado.

### 8.4 Estados de las expansiones

Salvo donde se indica, los nombres en español están sin verificar.

| Expansión | Estado (inglés) | Copias | Efecto conocido |
|---|---|---|---|
| *Beyond the Threshold* | **Mesmerized** | 5 | Al final de tu turno, una entidad ajena "toma el control". El reverso da las instrucciones (detalle sin verificar). |
| *Streets of Arkham* | **Righteous** | 5 | Permite descartar el Daño u Horror que acabas de sufrir. Funciona igual si la carta está boca arriba o boca abajo [EXP FAQ]; texto exacto sin verificar. |
| *Sanctum of Twilight* | **Stressed** | 5 | Efecto sin verificar. |
| *Horrific Journeys* | **Lost in Time and Space** | 5 | Ver el detalle debajo de la tabla. |
| *Path of the Serpent* | **Poisoned** | 8 | Efecto sin verificar. |
| *Path of the Serpent* | **Fearless** | 2 | Protege contra el Horror recibido después de ganarlo; el Horror que ya estaba en curso se resuelve igualmente [DICT]. Texto exacto sin verificar. |

**Lost in Time and Space** [EXP][DICT]

- Un blog en español lo llama "Perdido en el tiempo y el espacio"; no es fuente oficial.
- Mientras lo tienes, **ningún otro efecto del juego te afecta** salvo que lo diga específicamente.
- **Puedes ganar** la partida igualmente.
- Se gana por las **Grietas** (*Rifts*, §13).
- Si lo ganas a mitad de una serie de Daño, se roban igualmente las cartas restantes, pero sus efectos no te afectan [DICT].

**Copias adicionales de Loco** [Lindhard]

- *Beyond the Threshold*: 4.
- *Streets of Arkham*: 3.
- *Sanctum of Twilight*: 2.
- *Horrific Journeys*: 3.
- *Path of the Serpent*: 2.

**Agendas** (*Horrific Journeys*) [EXP]

- No son Estados, pero funcionan de forma parecida a Loco: son cartas secretas con objetivos propios.
- Solo se usan en el escenario *Hidden Depths* con 3 o más investigadores.
- Exigen un mínimo de jugadores, igual que Loco.

---

## 9. Monstruos

### 9.1 Atributos del monstruo [RR][AJ]

| Atributo | Dónde está | Para qué sirve |
|---|---|---|
| **Vida** | Solo en la app | Se escala con el número de investigadores (§9.8). La app anota el Daño recibido. Al llegar a la Vida, el monstruo queda **derrotado** y se retira. |
| **Percepción** (verde) | Anverso de la ficha | Decide **qué monstruo hay que evitar** si hay varios en el espacio. |
| **Horror** (azul) | Anverso de la ficha | Decide **contra qué monstruo** se hace la tirada de Horror. |
| **Agresividad** (rojo) | Reverso de la ficha | Dados que lanza contra una Obstrucción, dificultad para empujarlo y otros efectos. |
| **Capacidades** | Reverso de la ficha | Por ejemplo *Acuático*, *Volador* e *Incorpóreo* (*phasing*). Ver el detalle debajo. |

**Capacidades**

- Los monstruos voladores (y, según los dictámenes, los incorpóreos) pueden cruzar **bordes infranqueables** [BGG][DICT].
- La capacidad *phasing* permite atravesar **paredes** [BGG].
- Los monstruos acuáticos, voladores e incorpóreos no se detienen en el Agua (§13).
- Detalle exacto de cada capacidad sin verificar contra las fichas.

**Lo que no existe**

- No hay monstruos "élite", "épicos", "temerarios" (*reckless*) ni la regla de "trabado" (*engaged*). Estar "trabado" equivale simplemente a **estar en el espacio de un monstruo**, con la obligación de evadirlo (§9.5).
- Sí existen monstruos **únicos** con nombre propio, como el Priest of Dagon, que la app define con sus propios valores.

### 9.2 Aparición y colocación [RR][BGG]

- La app ordena colocar un monstruo en un lugar concreto. En los escenarios comunitarios en español aparece como "Aparece un Profundo en el lugar señalado" [COM].
- El jugador coloca la figura. Si ya hay otro monstruo de ese tipo, la app indica qué **ficha de ID** poner en la peana.
- Las **Obstrucciones no impiden las apariciones**.
- Las reglas no dicen qué hacer si no quedan figuras. La app solo usa monstruos de productos activados (comportamiento con figuras agotadas sin verificar).
- No hay límite de figuras por espacio, y todas ocupan un solo espacio sea cual sea su peana [RR].

### 9.3 Activación en el paso de monstruos [RR][AJ][VAL][DICT]

**Cómo se presenta**

La app activa cada monstruo, uno tras otro y en el orden que ella decide, con un texto de este tipo:

1. **Movimiento y objetivo.** Por ejemplo: "El monstruo se mueve 2 espacios hacia el investigador más cercano. Luego ataca al investigador de su espacio que haya sufrido menos Daño".
2. **Ataque.** Se pulsa para ver el texto del ataque, que el investigador objetivo resuelve. Suele incluir una tirada para anular: por ejemplo, sufre 3 de Daño (anulado por un atributo) y después, si has sufrido algún Daño, quedas Aturdido y Desconcertado.
3. **No puede atacar.** Si no hay objetivo, se pulsa el botón correspondiente ("no hay investigadores al alcance" o similar). Entonces la app muestra una **instrucción alternativa de movimiento**.

Valkyrie modela estas cuatro partes con los campos `ability` (movimiento y capacidad), `master` (ataque), `movebutton` (botón si no puede atacar) y `move` (movimiento alternativo).

**Términos de movimiento** [RR][DICT]

| Término | Español | Significado |
|---|---|---|
| Toward | **Hacia** | Cada espacio recorrido debe reducir la distancia al destino. La distancia se calcula por caminos que el monstruo **puede** recorrer, sin contar paredes ni bordes infranqueables salvo capacidades como volar. |
| Away from | **Alejarse** | Cada espacio recorrido debe aumentar la distancia. |
| Nearest | **Más cercano** | El que esté a menos espacios. En los empates eligen los investigadores. |
| Farthest | **Más alejado** | El que esté a más espacios. En los empates eligen los investigadores. |

- Para mover, "más cercano" solo cuenta caminos practicables. Para efectos que no son movimiento, como un ataque al más cercano, cuenta cualquier camino [DICT].

**"Muévete hasta X espacios"** [DICT][BGG]

- El monstruo **se detiene** al alcanzar su objetivo, aunque le sobre movimiento.
- Si ya está dentro del alcance y moverse no le acerca, no se mueve.
- Si la instrucción exige un investigador "dentro del alcance" y no lo hay, no se mueve. Entonces se pulsa el botón de "no hay investigadores" para recibir otra instrucción.

**Empates de objetivo**

- Por ejemplo, "el que tenga más Daño" cuando nadie tiene Daño. Deciden los investigadores en grupo [DICT].

**Restricciones de movimiento** [RR][DICT]

- Los monstruos no atraviesan paredes, bordes infranqueables ni puertas bloqueadas, salvo por capacidades.
- No usan salidas especiales, como un montaplatos, salvo que la app lo ordene.
- Una **Obstrucción** les obliga a una tirada (§13.3). Si fallan, **pierden todo el movimiento de esa activación**, pero si ya comparten espacio con un investigador **pueden atacar igualmente**.

**Restricciones** (*Sanctum of Twilight*) [EXP]

- Al activarse un monstruo, el grupo puede descartar una ficha de Restricción de su espacio para que **renuncie a su movimiento**.

**Daño ambiental**

- Un monstruo que empieza su activación en Fuego, o que entra en Fuego, sufre 1 Daño [RR].

### 9.4 Atacar a monstruos

Ver el §5.6.

**Daño adicional de armas** [DICT]

- Las armas con daño adicional, como el Scalpel o la Silver Twilight Dagger, lo infligen **incluso si se falla** la tirada de ataque.

### 9.5 Tirada de evasión [RR][AJ][DICT]

**Cuándo es obligatoria**

- Un investigador que está en el espacio de un monstruo debe evadirlo si:
  - **Sale voluntariamente** del espacio, o
  - Hace **cualquier acción que no sea Ataque ni Movimiento**: buscar, explorar, interactuar, intercambiar, acciones de componente, empujar, etc.
- Las opciones de la app con icono de acción también la exigen. Si fallas la evasión, solo puedes elegir opciones sin icono de acción [DICT].

**Contra qué monstruo**

- Solo se evita **un** monstruo por intento: el de **mayor Percepción** del espacio. Si hay empate, elige el investigador.

**Procedimiento**

1. Se elige ese monstruo en el Cajón de monstruos.
2. Se pulsa **"Evitar"** (el botón oficial en español [GR]; Valkyrie lo llama "Esquivar").
3. Se resuelve el texto de la app. Suele ser una tirada, y si se falla normalmente se **renuncia a la acción**. También puede haber Daño, Horror u otros efectos (detalle variable según el monstruo).

**Resultado**

- Si no se pide renunciar, la acción se completa con normalidad.
- **Renunciar** significa perder la acción sin resolverla:
  - Si se renuncia a un movimiento, se pierde el movimiento restante y el investigador se queda en su espacio.
  - Si se renuncia estando en Fuego, sufre 1 Daño boca abajo.

**Casos sin evasión**

- **No** requieren evasión el movimiento involuntario, atacar, ni salir de un espacio con una ficha de **Restricción** (*Sanctum of Twilight*).

**Casos con evasión adicional**

- El movimiento extra que conceden capacidades redactadas con "puede" **sí** requiere evasión [DICT].
- En la acción de Empujar hacen falta dos evasiones (§5.9). Por analogía, entrar gratis en la zona recién explorada saliendo del espacio de un monstruo también la requeriría (sin verificar).

### 9.6 Tirada de Horror [RR][FAQ][DICT]

**Cuándo**

- **Solo en el paso de Horror** de la Fase de los Mitos, salvo que un efecto diga otra cosa.
- **No** se hace al final del turno del investigador.

**Contra qué monstruo**

- Cada investigador resuelve **una** tirada contra el monstruo **dentro del alcance** con mayor puntuación de **Horror**.
- Si hay empate, elige el investigador.
- El alcance no atraviesa paredes ni puertas, y no se usa línea de visión.
- Si no hay ningún monstruo dentro del alcance, no hay tirada.

**Procedimiento**

- Se elige el monstruo en el Cajón y la opción de Horror. La app muestra el texto: normalmente una tirada (muy a menudo de **Voluntad**) y el Horror que se sufre o se anula.
- La puntuación de Horror **sirve para elegir el monstruo**. La tirada concreta y su dificultad las da el texto de la app (relación exacta entre ambas sin verificar).

**Varios investigadores contra el mismo monstruo**

- Se dispara **una sola** tirada de Horror en la app, y **cada uno tira y aplica** su resultado por separado.
- Si un investigador puede elegir entre monstruos, puede esperar al resultado de otro antes de decidir, salvo que vaya a compartir la misma tirada [DICT].

**Ejemplo de interacción**

- En la caja base, la carta de Horror **Claustrofobia** hace sufrir Horror si al acabar el turno hay **menos de 3 espacios** dentro de tu alcance, contando el tuyo.
- Esto ilustra que el alcance es una propiedad de "sí o no", contada sin atravesar paredes ni puertas [DICT].

### 9.7 Derrotar monstruos [RR][VAL]

- El Daño se anota con los botones **+ / −**. Al igualar la Vida, el monstruo queda derrotado: se retira la figura y la app lo quita del cajón.
- En Valkyrie, derrotar un monstruo dispara los eventos con `trigger=Defeated<TipoMonstruo>` (por ejemplo `DefeatedMonsterCultist`) y `trigger=Defeated<NombreDelSpawn>`. `DefeatedUnique…` no se dispara en MoM.

### 9.8 Valores de los monstruos de la caja base

Valores tomados de los datos de Valkyrie [VAL]. La Vida es un valor base más un valor por investigador.

| Monstruo (inglés) | Nombre en escenarios en español [COM] | Vida | Percepción | Horror | Agresividad | Categoría |
|---|---|---|---|---|---|---|
| Cultist | Sectario | 1 + 1/inv. | 3 | 1 | 2 | humanoide |
| Deep One | Profundo (confirmado en [FAQ-ES]) | 2 + 1/inv. | 3 | 4 | 2 | humanoide |
| Deep One Hybrid | Híbrido de Profundo | 2 + 1/inv. | 3 | 1 | 2 | humanoide |
| Ghost | Fantasma | 1 + 1/inv. | 2 | 5 | 1 | espíritu |
| Hunting Horror | Horrendo cazador | 3 + 1/inv. | 5 | 6 | 3 | bestia |
| Riot | Turba | 5 + 3/inv. | 7 | 4 | 4 | humanoide |
| Star Spawn | Semilla estelar (uso común en la edición española) | 9 + 3/inv. | 5 | 8 | 5 | bestia |
| Child of Dagon (único) | Hijo de Dagón | 1 + 1/inv. | 4 | 3 | 2 | humanoide |
| Priest of Dagon (único) | Sacerdote de Dagón | 2 + 2/inv. | 4 | 3 | 2 | humanoide |

- Figuras de la caja según las listas de componentes: Sectario ×6, Profundo ×4, Híbrido de Profundo ×4, Fantasma ×2, Turba ×2, Semilla estelar ×2, Horrendo cazador ×2, Hijo de Dagón ×1 y Sacerdote de Dagón ×1 (24 en total). Es el máximo de cada tipo que puede haber a la vez en el tablero.
- Las expansiones y el kit de conversión añaden muchos más monstruos, como Byakhee, Shoggoth, Mi-Go, Dark Young, Wraith o Serpent Person. Todos tienen valores en los datos de Valkyrie.

---

## 10. El mapa

### 10.1 Estructura [RR][GR]

- **Tablero:** el conjunto de módulos colocados.
- **Módulo de tablero:** contiene una o varias habitaciones y permanece en juego hasta que se descarta.
- **Habitación:** zona con **un solo nombre**, formada por uno o más espacios. Dentro de un módulo, los **bordes amarillos** separan habitaciones.
- **Espacio:** la unidad de movimiento.

### 10.2 Separaciones entre espacios [RR]

| Separación | Aspecto | Movimiento |
|---|---|---|
| **Borde** | Línea continua blanca o amarilla | Se puede cruzar. |
| **Borde infranqueable** | Línea discontinua | No se puede cruzar. El alcance **sí** se cuenta a través de él. |
| **Pared** | Línea marrón gruesa | No se puede cruzar. El alcance no la atraviesa, y los efectos sobre espacios adyacentes tampoco. |
| **Puerta** | Hueco en una pared | Se puede cruzar salvo que esté bloqueada por una Obstrucción o una ficha de Exploración. El **alcance no atraviesa puertas**, ni siquiera abiertas o ya exploradas. |

- **Adyacencia.** Dos espacios son adyacentes si comparten borde, puerta, borde infranqueable o pared. Que sean adyacentes no implica que se pueda pasar de uno a otro.
- **Efectos sobre espacios adyacentes.** No atraviesan paredes; sí atraviesan puertas [FAQ][BGG]. Ejemplos: la propagación del Fuego, la luz frente a la Oscuridad y los eventos que afectan a espacios adyacentes.

### 10.3 Interior y exterior [RR][FAQ]

- Cada habitación es **interior** (con techo: vestíbulo, dormitorio...) o **exterior** (sin techo: calle, callejón, jardín, muelle).
- En la 2ª edición, la placa con el nombre de las habitaciones **exteriores** es plateada con tentáculos rojos.
- El kit de conversión trae listas de habitaciones interiores y exteriores para los módulos de la 1ª edición.
- La distinción importa para eventos y capacidades: por ejemplo, eventos que afectan a quien está en el exterior.

### 10.4 Alcance [RR][DICT]

- Llega **hasta 3 espacios**, y tu propio espacio cuenta como 0.
- Es una propiedad de "sí o no", no una línea trazada: rodea esquinas.
- No atraviesa paredes, puertas ni Pasadizos secretos. Sí atraviesa bordes infranqueables.
- **No hay línea de visión** en este juego. Las fichas de **Vistazo** no tienen que ver con la visión: son fichas de la app que se inspeccionan gratis.

### 10.5 Otros elementos

- **Pasadizo secreto** [RR]: todos los espacios con Pasadizo secreto son adyacentes entre sí. Se puede mover por ellos salvo que haya una Obstrucción. El alcance no pasa por ellos.
- **Escaleras y varias plantas:** no hay reglas específicas en la 2ª edición. Las plantas se conectan mediante fichas de Exploración, Pasadizos secretos o instrucciones de la app (sin verificar que no haya excepciones).
- **Puntos cardinales** [RR]: se refieren a la pantalla. El norte está arriba y el sur abajo.
- **Despejar el tablero** [RR]: se descartan todos los módulos, fichas y monstruos, y se retiran las figuras de los investigadores. Lo usa la app en cambios de escena o de acto.
- **Retirar del tablero** [RR]: el componente queda apartado y no ocupa ningún espacio.
- **Módulos que se mueven** (*Beyond the Threshold*, *Sanctum of Twilight*, *Horrific Journeys*) [EXP]: la app recoloca el módulo con todo lo que tiene encima.
- **Módulos superpuestos** (*Sanctum of Twilight*) [EXP]: nunca tapan un espacio por completo. Los componentes tapados se recolocan dentro de su espacio, y la parte tapada deja de ser tablero.

---

## 11. Rompecabezas

### 11.1 Reglas generales [RR][AJ][FAQ]

- **Cómo surgen.** No son una acción propia: aparecen como parte de una Búsqueda, una Interacción o una Exploración, según indique la app.
- **Pasos.** El investigador hace tantos **pasos de rompecabezas** como el **valor impreso** del atributo indicado, sin modificadores.
  - Las Mejoras de *Streets of Arkham* aumentan el valor impreso, así que deberían dar 1 paso más (deducción, sin verificar).
- **Pasos extra.** Cada **Pista** gastada da 1 paso adicional. No se puede en **Oscuridad** y presumiblemente tampoco estando **Desconcertado**.
- **Final del intento.** La app detecta sola cuándo el rompecabezas está resuelto. Si se agotan los pasos sin resolverlo, se pulsa **"Cerrar"** y **el progreso se guarda**. Otro investigador, o el mismo, puede continuarlo más tarde con una nueva acción.
- **Cooperación.** Los demás jugadores pueden aconsejar y discutir el rompecabezas [FAQ].
- **Consecuencias.** El texto de la app tras resolverlo o cerrarlo indica qué ocurre.

### 11.2 Tipos de la caja base [RR][AJ][GR]

**Mosaico** (*Slide puzzle*)

- Hay que recomponer una imagen dividida en **6 o más piezas**, desordenadas en una cuadrícula.
- **Cada paso:** intercambiar **dos piezas adyacentes**.
- Se resuelve cuando la imagen queda correcta.

**Mecanismo** (*Lock puzzle*)

- Hay que sacar una pieza objetivo distinta de las demás desplazando bloques en una cuadrícula.
- **Cada paso:** mover **una** pieza en su orientación, vertical u horizontal, sin atravesar otras ni superponerlas. La distancia por paso no está verificada.
- Se resuelve cuando la pieza objetivo llega al **borde derecho**.

**Código** (*Code puzzle*)

- Hay que adivinar un código de **3 o más** piezas, que pueden ser números o **runas**. Lo que algunos llaman "rompecabezas de runas" es este mismo tipo.
- Las piezas posibles se muestran arriba y **pueden repetirse**. No todas tienen por qué estar en la solución.
- **Cada paso:** proponer un código completo y pulsar "Resolver".
- **Respuesta de la app**, al estilo Mastermind:
  - Un icono de **Éxito** por cada pieza correcta en la posición correcta.
  - Un icono de **Investigación** por cada pieza correcta en la posición incorrecta.
- Los parámetros son la **longitud** y la **variedad** (número de símbolos distintos).
- Ejemplo oficial [AJ]: con Saber 5, Agatha tiene 5 intentos para un código de 3 cifras.

### 11.3 Tipos de las expansiones [EXP]

**Torre** (*Tower puzzle*, *Streets of Arkham*)

- Hay 3 columnas.
- **Cada paso:** mover la pieza superior de una columna a otra.
- Se resuelve con todas las piezas en una columna, de mayor a menor de abajo arriba.

**Líneas** (*Line puzzle*, *Horrific Journeys*)

- Un blog en español lo llama "puzle de conducto"; nombre oficial sin verificar.
- **Cada paso:** intercambiar dos piezas ortogonalmente adyacentes, o girar una pieza 90°.
- Se resuelve cuando una línea continua une el lado izquierdo con el derecho.

**Anillos** (*Ring puzzle*, *Path of the Serpent*)

- Hay 4 anillos concéntricos de 6 secciones; el interior está fijo.
- **Cada paso:** girar una sección uno de los 3 anillos exteriores.
- Hay símbolos ocultos que se deducen. Se resuelve cuando los anillos coinciden con el interior.

### 11.4 Rompecabezas en Valkyrie [VAL]

**Correspondencia de nombres**

| Clase de Valkyrie | Rompecabezas oficial | Etiqueta en el editor en español |
|---|---|---|
| `slide` | Mecanismo (*Lock*) | "mecanismo" |
| `image` | Mosaico (*Slide*) | "mosaico" |
| `code` | Código | "código" |
| `tower` | Torre | — |

- **Atención:** la clase `slide` de Valkyrie es el *Lock puzzle* oficial, y la clase `image` es el *Slide puzzle* oficial.
- Valkyrie no implementa los rompecabezas de Líneas ni de Anillos.

**Parámetros**

| Clase | `puzzlelevel` | `puzzlealtlevel` |
|---|---|---|
| `slide` | Movimientos mínimos de la solución | — |
| `image` | Piezas en horizontal | Piezas en vertical |
| `code` | Longitud del código | Número de símbolos |

- Un código puede usar números, símbolos o elementos químicos, y admite una solución predefinida.

**Límite de pasos**

- La ventana del rompecabezas muestra los movimientos de este intento y el total, pero **no aplica el límite**. Son los jugadores quienes lo controlan.
- El estado se guarda al cerrar.

---

## 12. Objetos y Hechizos

### 12.1 Pertenencias [RR]

- Son **pertenencias** los Objetos comunes, los Objetos únicos y los Hechizos.
- Se pueden **soltar**, **recoger** e **intercambiar** (§5.7).
- Al **ganarlos** se colocan boca arriba en tu zona de juego. Un Hechizo se gana como copia al azar.
- "Ganar" un objeto significa recibirlo porque un efecto lo dice. Recoger o intercambiar **no** cuenta como ganar [DICT].
- Las instrucciones de "soltar un objeto" afectan a Objetos comunes y únicos, **no a Hechizos** [BGG].

### 12.2 Armas [RR][AJ][APP][VAL]

**Qué hace falta**

- Un Objeto o Hechizo es un arma si tiene icono **cuerpo a cuerpo** o **a distancia** y un **valor de Daño**.

**Los tipos que pregunta la app al atacar**

| Tipo | Atributo habitual | Armas comunes de la caja base |
|---|---|---|
| **Arma pesada** (*Heavy Weapon*) | Fuerza | 2x4, Axe, Crowbar, Fire Extinguisher, Lead Pipe, Pickaxe, Shovel, Sledgehammer, Torch (también Fuente de luz), Wrench |
| **Arma de filo** (*Bladed Weapon*) | Agilidad | Knife, Machete, Meat Cleaver, Ritual Dagger |
| **Arma de fuego** (*Firearm*) | Agilidad | .18 Derringer, .38 Revolver, .45 Automatic, Carbine Rifle, Shotgun, Tommy Gun |
| **Hechizo** de ataque | Saber | Shriveling, Wither, Wrack |
| **Sin arma** | Lo indica la app | — |

- El atributo de la tabla es el más habitual según [GR], pero **el texto de cada ataque decide** qué atributo se tira.

**Cálculo del Daño** [AJ][BGG]

- Lo indica el texto de ataque. Es típico "el Daño del arma más el resultado de la tirada".

### 12.3 Otros objetos comunes de la caja base [VAL]

- **Fuentes de luz:** Bullseye Lantern, Candles, Kerosene Lantern, Torch.
- **Tomos:** Arcane Manuscript, King James Bible.
- **Equipo:** Bandages, Brass Knuckles, Dynamite, Elder Sign Pendant, Elder Ward, Flare Gun, Holy Cross, Holy Water, Lucky Cigarette Case, Lucky Rabbit's Foot, Magnifying Glass, Medical Textbook, Pocket Watch, Sedatives, Whiskey.
- Ejemplos de texto [AJ]:
  - Bandages: "Acción:" descartar hasta 2 Daño boca abajo y después descartar las vendas.
  - Arcane Manuscript: tira 1 dado adicional al resolver una tirada.

### 12.4 Objetos únicos [RR][VAL][Lindhard]

- Son objetos de **historia** que la app da **por nombre**. Muchas veces aparecen en el **Inventario** de la app, que puede ofrecer acciones al usarlos.

**Caja base**

| Rasgo | Objetos |
|---|---|
| **Llave** | Brass Key, Gold Key, Silver Key, Old Keys |
| **Prueba** (*Evidence*) | Circumstantial, Conclusive, Forensic, Incriminating y Photographic Evidence; Grotesque Stone (×5); Old Journal; Missing Link; Ritual Components |
| **Prueba y Llave** | Cult Sigil |
| **Equipo** | Handcuffs, Puzzle Box, Rope |
| **Fuente de luz** | Oil Lamp |
| **Aliado** | **Duke** (el perro) |
| Otros | Flux Stabilizer |

- **Duke** [FAQ][DICT]: usarlo al principio del turno no cuesta acción. Permite intercambiar con un investigador dentro del alcance sin evasión, y puede intercambiarse a sí mismo.

**Fichas de Llave** (*Beyond the Threshold*) [EXP]

- Un objeto con ficha de Llave gana los rasgos *Llave* y *Prueba*.
- No se puede descartar, y queda fuera de los descartes al azar.

### 12.5 Rasgos [RR][GR]

- Los rasgos aparecen en cursiva y **no tienen efecto propio**: los usan otros efectos. Por ejemplo, "solo si tienes una Fuente de luz".
- **Rasgos verificados en español** [GR]: *Arma de fuego*, *Fuente de luz* y *Prueba* (*Evidence*).
- **Rasgos sin verificar en la edición española:** Tomo y Llave.
- Arma pesada y Arma de filo son los nombres de los tipos de ataque en la app [APP].

### 12.6 Hechizos [RR][AJ][BGG][DICT]

**Cómo funcionan**

- Son cartas de **doble cara**. Al ganar uno se toma una copia **al azar** del hechizo indicado.
- **Nunca** se mira su reverso, ni el de los Hechizos del mazo.

**Lanzar un hechizo**

1. Se usa su efecto **"Acción:"** como acción de componente, o se ataca con él eligiendo "Atacar con un Hechizo".
2. El efecto ordena **darle la vuelta** a la carta.
3. El reverso se resuelve **de inmediato**. Suele ser una tirada, normalmente de Saber, con un beneficio extra si se supera o un perjuicio (Daño u Horror) si se falla.
4. Casi siempre se termina **descartando la carta y ganando otra copia** del mismo hechizo. Así se conserva el hechizo, pero con un reverso nuevo y desconocido.

**Ejemplos de la caja base**

- *Feed the Mind:* tú u otro investigador dentro del alcance quedáis Concentrados; después se le da la vuelta.
- *Instill Bravery:* permite descartar 1 Horror, esté boca arriba o boca abajo.

**Efectos sobre hechizos**

- Un efecto de "no puedes lanzar hechizos" impide tanto los lanzamientos pagados como los gratuitos [DICT].

### 12.7 Expansiones [EXP]

**Elixires** (*Streets of Arkham*)

- Son de doble cara y se ganan al azar. El reverso no se mira hasta que un efecto les da la vuelta, y entonces se resuelve en ese momento.
- Boca arriba son pertenencias; boca abajo no lo son.

**Mejoras** (*Streets of Arkham*)

- La palabra clave es "mejorar". Se toma la ficha, que suma **+1 al valor impreso** del atributo.
- Cada atributo solo puede mejorarse **una vez**.
- No son pertenencias.

---

## 13. Fuego, Oscuridad, Obstrucciones y otros elementos del entorno

### 13.1 Fuego [RR][FAQ][DICT]

**Daño a investigadores**

- Sufren **1 Daño boca abajo** cuando:
  - **Entran** en un espacio con Fuego.
  - **Hacen una acción que no sea Movimiento** en un espacio con Fuego (el Daño llega al terminarla).
  - **Renuncian** a una acción en un espacio con Fuego.

**Daño a monstruos**

- Sufren **1 Daño** al **empezar** su activación en Fuego o al **entrar** en Fuego.

**Propagación**

- Al **principio de cada Fase de los Mitos**, antes de los eventos, se coloca **1 ficha de Fuego en total**, no una por cada foco, en un espacio adyacente a un espacio con Fuego.
- No se propaga a través de paredes. Sí lo hace por puertas, y las Obstrucciones no lo detienen [FAQ][BGG].
- No puede haber 2 fichas de Fuego en el mismo espacio.

**Apagar el Fuego**

1. Como acción, se tira **Agilidad**.
2. Por cada Éxito se descarta 1 ficha de Fuego de tu espacio o de un espacio al que entres **más tarde en ese mismo turno**.
3. El Fuego descartado así **no causa Daño**. Como el Fuego desaparece antes de comprobar el Daño posterior a la acción, entrar en Fuego (1 Daño) y apagarlo con la acción siguiente evita el segundo Daño [DICT].

**Prender fuego**

- Ver el §5.9.
- Si se coloca Fuego por efectos de cartas o por la acción de un jugador y no había Fuego, hay que avisar a la app con **"Prender fuego"** en el menú.

**En Valkyrie** [VAL]

- La opción "Prender fuego" del menú pone la variable `$fire = 1` (un escenario también puede ponerla con `operations=$fire,=,1` cuando su texto ordena colocar Fuego).
- Mientras `$fire` > 0, cada Fase de los Mitos sale el evento de propagación (`PerilFireSpread`) con dos botones: "se propaga" y "ya no hay fuego". Este último pone `$fire = 0`.
- Algunos Mitos genéricos solo salen si `$fire` > 0.

### 13.2 Oscuridad [RR][FAQ][BGG]

**Efecto**

- Un investigador en un espacio con Oscuridad **no puede gastar Pistas**, ni para convertir resultados ni para hacer pasos extra de rompecabezas.

**Cuándo se ignora**

- Si en **su espacio o en uno adyacente** hay una **Fuente de luz** o **Fuego**.
- Un espacio "tiene Fuente de luz" si un investigador que está en él lleva una, o si se ha soltado o colocado allí.
- La luz funciona a través de puertas, pero no de paredes.

**Límite**

- Máximo 1 ficha de Oscuridad por espacio.

**Interacción con cartas y eventos**

- Algunas cartas de Horror, como la **Nictofobia**, y algunos eventos de los Mitos hacen referencia a la Oscuridad.

### 13.3 Obstrucción (barricada) [RR][DICT][BGG]

**Mover una Obstrucción**

- Como acción, un investigador en un espacio con Obstrucción puede moverla **contra** una puerta o Pasadizo secreto de ese espacio, o **apartarla** de él.
- No puede llevarla a otro espacio salvo que un efecto lo permita.

**Efecto**

- Ni investigadores ni monstruos pasan por una puerta o Pasadizo bloqueado.

**Desde el otro lado**

- Un investigador adyacente pero en otra habitación puede, como acción, tirar **Fuerza**.
- Con **2 o más Éxitos** aparta la Obstrucción y se mueve 1 espacio a través de la puerta. Con menos, no ocurre nada.

**Monstruos ante una Obstrucción**

- Lanzan tantos dados como su **Agresividad**. Con 2 o más Éxitos **descartan** la Obstrucción y siguen moviéndose.
- Si fallan, **renuncian a todo el movimiento de esa activación** y no lo reintentan, aunque pueden atacar si ya comparten espacio.
- Si hay varias Obstrucciones en la misma puerta, hace falta una tirada por cada una.

**Lo que no detiene**

- No impide las apariciones de monstruos, ni el Fuego, ni el movimiento de los Personajes que ordene la app [BGG].

### 13.4 Pasadizo secreto

Ver el §10.5.

### 13.5 Elementos de las expansiones [EXP][DICT]

**Restricciones** (*Restraints*, *Sanctum of Twilight*)

- Hay 20 fichas.
- Un monstruo en un espacio con Restricción no exige evasión.
- Al activarse un monstruo, el grupo puede descartar una Restricción de su espacio para que renuncie a su movimiento.
- No son pertenencias.

**Agua** (*Horrific Journeys*)

- Al entrar en un espacio con Agua se pierde el movimiento restante. Los monstruos acuáticos, voladores e incorpóreos están exentos.
- El Agua elimina el Fuego, y no pueden estar en el mismo espacio.

**Grietas** (*Rifts*, *Horrific Journeys*; nombre en español sin verificar)

- Si tras hacer una acción que no sea Movimiento sigues en un espacio con Grieta, quedas **Lost in Time and Space**. Lo mismo ocurre si renuncias a una acción allí. Un dictamen precisa que solo ocurre si empezaste la acción en una Grieta y sigues en ella al terminar.
- **Cerrar Grietas:** como acción se tira **Saber**. Cada Éxito descarta 1 Grieta de tu espacio o de uno al que entres en ese turno.

**Maleza** (*Overgrowth*, *Path of the Serpent*)

- Al salir de un espacio con Maleza se tira **Observación**, con dificultad igual al número de fichas. Si se falla, se suelta un objeto al azar.
- Con un Arma de filo se puede descartar 1 ficha al entrar, o todas como acción.
- El Fuego elimina la Maleza.

**Escombros** (*Rubble*, *Path of the Serpent*)

- No se puede Buscar, Explorar ni Interactuar en un espacio con Escombros.
- Con un Arma pesada se puede descartar 1 ficha al entrar.
- Como acción, cualquiera puede tirar **Fuerza** y descartar 1 ficha por Éxito. Con un Arma pesada se descartan todas.

**Fichas de Llave, módulos móviles y módulos superpuestos**

- Ver el §12.4 y el §10.5.

---

## 14. Glosario de términos especiales

Cada término está en español oficial, con el inglés entre paréntesis.

| Término | Significado |
|---|---|
| **Acción** (*Action*) | Hasta 2 por turno. Las del §5. |
| **Acción de componente** (*Component Action*) | Efecto "Acción:" de una carta, ficha o del inventario. |
| **Icono de acción** (*Action Icon*) | Marca las opciones de la app que cuestan 1 acción. |
| **Adyacente** (*Adjacent*) | Que comparte borde, puerta, borde infranqueable o pared (§10.2). |
| **Alcance** (*Range*) | Hasta 3 espacios (§10.4). |
| **Aleatorio** (*Random*) | Con todas las opciones igual de probables. |
| **Anular** (*Negates*) | Cada Éxito evita 1 Daño u Horror. |
| **Cajón de monstruos** (*Monster Drawer*) | Botón abajo a la izquierda. Lista los monstruos y sus opciones (Atacar, Evitar, Horror, ±Daño). |
| **Características del entorno** (*Features*) | Fichas cuadradas sin app: Obstrucción, Oscuridad, Fuego y Pasadizo secreto. |
| **Cartas de doble cara** (*Double-sided Cards*) | El reverso de Objetos y Estados se puede consultar (salvo efecto, Loco ajeno o Hechizos). Al darles la vuelta, el reverso sustituye al anverso. |
| **Colocar** (*Place*) | Poner un componente en el tablero según el efecto. |
| **Dar la vuelta** (*Flip*) | Cambiar la cara de una carta. El reverso de un Hechizo y las cartas de *Resolver inmediatamente* se resuelven al girarse. |
| **Descartar** (*Discard*) | Devolver al mazo o a la reserva. Daño y Horror se barajan en su mazo. |
| **Despejar el tablero** (*Clear the Board*) | Ver el §10.5. |
| **Retirar del tablero** (*Remove from the Board*) | Ver el §10.5. |
| **Eliminado** (*Eliminated*) | Ver el §7.4. |
| **Ganar** (*Gain*) | Recibir por efecto un Objeto, Estado, Hechizo o Pista. |
| **Gastar** (*Spend*) | Descartar como coste. Es opcional y no se puede gastar lo que no se tiene. |
| **Soltar** (*Drop*) | Dejar pertenencias en tu espacio, normalmente con la acción de Intercambio. |
| **Recoger** (*Pick Up*) | Tomar pertenencias de tu espacio con la acción de Intercambio. |
| **Hacia / Alejarse / Más cercano / Más alejado** | Ver el §9.3. |
| **Historial de mensajes** (*Message Log*) | Todos los mensajes de la app, por rondas. |
| **Guardar y salir** (*Save & Quit*) | Hay una sola ranura de guardado. La app guarda módulos y fichas; los jugadores apuntan pertenencias, Daño, Horror, Estados y posiciones. Valkyrie además autoguarda cada ronda [VAL]. |
| **Interior / Exterior** (*Indoor / Outdoor*) | Ver el §10.3. |
| **Inventario** (*Inventory*) | Botón de la app para objetos con opciones de app. |
| **Menú de juego** (*In-game Menu*) | Da acceso al historial, a "Guardar y salir", "Prender fuego", "Investigador eliminado" y "Fin de partida". |
| **Administrador de colección** (*Collection Manager*) | Activa los productos que se poseen. |
| **Objetivo** (*Objective*) | Oculto al principio (§1). |
| **Pertenencias** (*Possessions*) | Objetos comunes, únicos y Hechizos (§12.1). |
| **Rasgos** (*Traits*) | Etiquetas en cursiva sin efecto propio. |
| **Renunciar** (*Forfeit*) | Perder la acción sin resolverla (§9.5). Cuenta como acción realizada. |
| **Ronda / Turno** (*Round / Turn*) | Ronda = las dos fases. Turno = las acciones de un investigador. |
| **Tirada** (*Test*) | Ver el §6. |
| **Pista** (*Clue*) | Ver el §2.2 y el §6.2. |
| **Personaje** (*Person*) | Ver el §2.2 y el §5.5. |
| **Ficha de Vistazo** (*Sight Token*) | Ficha de la app, normalmente en el borde de un espacio. Se inspecciona **sin gastar acción**. Da información, ambientación o a veces opciones. |

---

## 15. Final de la partida

**Victoria** [RR][AJ]

- Se gana al cumplir el **objetivo** revelado.
- La app lo detecta o lo pregunta y muestra el **epílogo** o texto final.
- **No hay puntuación.** El final es narrativo, y algunos escenarios tienen varios finales.

**Derrota** [RR]

1. **Por tiempo:** los investigadores tardaron demasiado. La app termina la partida, un jugador lee el **epílogo** y todos pierden.
2. **Por eliminación:** ver el §7.4. Al final de la siguiente Fase de los Investigadores, si la investigación no está completa, se lee el epílogo y se pierde. Si todos caen a la vez, la derrota es inmediata.
3. **Por efectos de cartas:** cartas de Loco o Agendas. El investigador afectado gana o pierde según su carta. Si una carta termina la partida, se elige **"Fin de partida"** en el menú.

**Investigadores eliminados**

- No ganan, salvo que un efecto diga lo contrario [FAQ].

**En Valkyrie** [VAL]

- El diseñador crea los eventos de final. Puede usar la variable `$end` para terminar tras un evento, o el activador `Eliminated` para la derrota por eliminación.
- Al acabar, Valkyrie pregunta a los jugadores si ganaron y les pide puntuar el escenario. La puntuación es una estadística, no una regla.

---

## 16. FAQ, erratas y reglas que suelen malinterpretarse

### 16.1 Erratas oficiales [FAQ][FAQ-ES]

- **Rules Reference, p. 8 (Eliminado):** un investigador eliminado pierde, salvo que un efecto diga expresamente que gana estando eliminado.
- **Rules Reference, p. 14 (Exterior):** las habitaciones exteriores de la 2ª edición tienen placa de nombre plateada con tentáculos rojos.
- **Learn to Play, p. 11:**
  - En el ejemplo de activación, el Profundo ataca al investigador de su espacio que ha sufrido **menos** Daño.
  - Se reformulan los pasos 4 y 5 del ejemplo: Agatha tira Fuerza +1, y el Daño se anula con su tirada.
- **Propagación del Fuego:** si hay Fuego en uno o más espacios, se coloca **1** ficha en un espacio adyacente.
- **Componentes:**
  - El módulo Flea Market β debería tener placa de exterior.
  - En el kit de conversión, *Rooftop* y *Spruce Grove* son exteriores.

### 16.2 Preguntas frecuentes oficiales [FAQ]

- El orden de turnos se decide sobre la marcha.
- Se puede interrumpir el Movimiento.
- Si un efecto afecta a "un investigador", el grupo decide quién. Si no hay acuerdo, decide uno elegido al azar.
- Se puede cooperar en los rompecabezas.
- La luz anula la Oscuridad en su espacio y en los adyacentes.
- Los efectos sobre eliminados se resuelven en lo posible.
- Varios investigadores comparten una sola tirada de Horror contra el mismo monstruo, y cada uno aplica su resultado.
- El Fuego y los efectos sobre espacios adyacentes no cruzan paredes.
- Usar a Duke no gasta acción.

### 16.3 Errores habituales [BGG][DICT]

1. **Fuego:** se coloca **1 ficha en total** por ronda, no una por cada foco.
2. **Alcance:**
   - No pasa por puertas, aunque estén abiertas, ni por paredes ni por Pasadizos secretos.
   - Sí rodea esquinas, porque no hay línea de visión.
   - Tu espacio cuenta como 0.
3. **Pistas:** convierten una lupa en Éxito. **No** son repeticiones de dados.
4. **Tirada de Horror:** solo en el paso de Horror, contra un monstruo y dentro del alcance. Si varios investigadores tiran contra el mismo monstruo, es **una** tirada compartida y cada uno tira sus dados.
5. **Movimiento:** se puede intercalar con otra acción.
6. **Evasión:** hace falta para **cualquier** acción salvo Atacar o Moverse en el espacio de un monstruo (incluidos Intercambiar y Buscar), y para salir de él. Atacar no la requiere.
7. **Daño y Horror:** salen **boca arriba** por defecto. Las cartas boca abajo se ponen boca arriba al azar.
8. **Empujar a un investigador que se resiste:** hace falta su resultado **+1**.
9. **Recoger objetos:** cuesta la acción de Intercambio. Intentar explorar, buscar o recoger todo suele llevar a perder, porque la presión de tiempo es intencionada.
10. **Entrar en una zona explorada:** muchas veces la app concede ese movimiento gratis. Hay que leerlo y no olvidarlo.
11. **Instrucciones de movimiento de monstruos:** si no hay objetivo "dentro del alcance", el monstruo no se mueve. Se pulsa el botón de "no hay investigadores" para recibir otra instrucción.
12. **Obstrucción fallida:** el monstruo pierde todo el movimiento de esa activación, pero puede atacar si ya está con un investigador.
13. **Varios Estados a la vez:** son compatibles. Por ejemplo, Desconcertado no impide usar Concentrado.
14. **"Lanza dados" frente a "tirada":** si el texto solo dice que se lancen dados, no es una tirada y no admite Pistas ni Concentrado.
15. **Renunciar sigue contando:** un Herido que renuncia a un Movimiento ya no puede moverse más esa ronda.
16. **Capacidades con "puede":** se imponen a restricciones que las prohíban específicamente, **pero** el movimiento voluntario siempre exige evasión.
17. **Pistas iniciales:** se reparten como diga la app, porque no son pertenencias.

### 16.4 Notas sobre la app oficial [Steam][BGG]

- Los rompecabezas recuerdan su estado al salir y volver a entrar.
- En el código, un símbolo puede repetirse o no aparecer.
- Las opciones sin icono de acción, como algunas fichas de Exploración o de "ojo", son gratuitas.

---

## 17. Glosario de terminología española ↔ inglesa

**Leyenda de verificación**

- **[GR]**: aparece en la Guía de referencia oficial en español.
- **[FAQ-ES]**: aparece en la FAQ oficial en español.
- **[APP]**: cadena de la app oficial en español, declarada como "heredada de la localización de FFG" en Valkyrie.
- **[COM]**: uso en escenarios comunitarios en español; probable, pero no oficial.
- **[VAL-ES]**: traducción propia de la interfaz de Valkyrie, **no oficial**.
- **(sin verificar)**.

### 17.1 Estructura y fases

| Inglés | Español | Verificación |
|---|---|---|
| Mansions of Madness: Second Edition | Las Mansiones de la Locura (Segunda Edición); la app se llama "Mansiones de la Locura" | Tiendas y App Store en español |
| Rules Reference / Learn to Play | Guía de referencia / Aprende a jugar | [GR]; el segundo, sin verificar |
| Round / Turn | Ronda / Turno | [GR]. Valkyrie muestra "Turno {n}" en el historial [VAL-ES], pero el término oficial es Ronda. |
| Investigator Phase | Fase de los Investigadores | [GR][APP] |
| Mythos Phase | Fase de los Mitos ([GR]); "Fase de Mitos" ([APP]) | [GR][APP] |
| Event Step | Eventos (paso) | [GR] |
| Monster Step | Activación de monstruos (paso); "Paso de activación de monstruos" | [GR][APP] |
| Horror Step | Horror (paso); "Paso de Horror" | [GR][APP] |
| Mythos Event | Evento de los Mitos | [GR] |
| End Phase (botón) | Fin de la fase | [APP] (en [GR], "icono de Fin de la fase") |
| Prologue / Epilogue | Prólogo / Epílogo | [GR] |
| Objective | Objetivo | [GR] |
| Winning & Losing | Victoria y derrota | [GR] |

### 17.2 Investigadores y tiradas

| Inglés | Español | Verificación |
|---|---|---|
| Investigator | Investigador | [GR] |
| Skills (attributes) | Atributos | [GR]. La UI de Valkyrie mezcla "Habilidades" y "Atributo" [VAL-ES]. |
| Strength / Agility / Observation / Lore / Influence / Will | Fuerza / Agilidad / Observación / Saber / Influencia / Voluntad | [GR] |
| Health & Sanity | Vida y Cordura | [GR]. Valkyrie usa "Salud" para *health* [VAL-ES]. |
| Test | Tirada (tirada de Fuerza, etc.) | [GR]. **No usar "prueba".** |
| Test difficulty / modifier | Dificultad / modificador | [GR] |
| Pass / fail a test | Superar / fallar la tirada | [GR][FAQ-ES][COM] |
| Success result (icono Elder Sign) | Éxito | [GR] |
| Elder Sign (nombre del icono) | "Signo Arcano" es el nombre en español de *Elder Sign* en otros productos de Arkham | Sin verificar como término de este juego; el reglamento habla de "Éxito" |
| Investigation result (lupa) | Investigación; coloquialmente "lupa" | [GR][COM] |
| Blank result | Cara vacía (sin icono) | [GR] |
| Dice | Dados | [GR] |
| Negates | Anular ("anulado por Agilidad") | [GR][FAQ-ES][COM] |
| Clue | Pista | [GR] |
| Spend / Gain | Gastar / Ganar | [GR] |

### 17.3 Daño, Horror y Estados

| Inglés | Español | Verificación |
|---|---|---|
| Damage / Horror | Daño / Horror (con mayúscula) | [GR] |
| Faceup / Facedown | Boca arriba / Boca abajo | [GR] |
| Flip | Dar la vuelta | [GR] |
| Discard | Descartar | [GR] |
| Resolve Immediately / Keep Faceup | Resolver inmediatamente / Mantener boca arriba | [GR] |
| Condition | Estado | [GR] |
| Wounded / Insane | Herido / Loco | [GR] |
| Stunned | Aturdido | Índice de [GR] + [COM] |
| Dazed | Desconcertado | Índice de [GR] + [COM] |
| Restrained | Retenido | Índice de [GR] + [COM] |
| Focused | Concentrado | Índice de [GR] + [COM] |
| Lost in Time and Space | Perdido en el tiempo y el espacio | Blog; sin verificar oficial |
| Mesmerized, Righteous, Stressed, Poisoned, Fearless | — | Sin verificar |
| Eliminated | Eliminado | [GR][FAQ-ES] |
| Investigator Eliminated (menú) | Investigador eliminado | [GR][APP] |
| End Game (menú) | Fin de partida | [GR] |

### 17.4 Acciones

| Inglés | Español | Verificación |
|---|---|---|
| Action / Component Action | Acción / Acciones de componente | [GR] |
| Action Icon | Icono de acción | [GR] |
| Move Action / Movement | Movimiento (acción) / Movimiento | [GR] |
| Search Action / Search Token | Búsqueda (acción) / ficha de Búsqueda | [GR] |
| Explore Action / Explore Token | Exploración (acción) / ficha de Exploración | [GR] |
| Interact Action / Interact Token | Interacción (acción) / ficha de Interacción | [GR] |
| Sight Token | ficha de Vistazo | [GR] |
| Trade Action | Intercambio (acción) | [GR] |
| Attack Action | Ataque (acción); botón "Atacar" | [GR][APP] |
| Evade Check | Tirada de evasión (entrada "Evasión, tirada de"); botón **"Evitar"** | [GR]. Valkyrie usa "Esquivar" [VAL-ES]. |
| Horror Check | Tirada de Horror (entrada "Horror, tirada de") | [GR]. En el cajón, Valkyrie muestra "Horror". |
| Push / Steal / Set Fire | Empujar / Robar / Prender fuego (acciones; también opción del menú) | [GR][APP] |
| Forfeit | Renunciar | [GR] |
| Drop / Pick Up | Soltar / Recoger | [GR] |
| Possessions | Pertenencias | [GR] |

### 17.5 Objetos, armas y Hechizos

| Inglés | Español | Verificación |
|---|---|---|
| Item / Common Item / Unique Item | Objeto / Objeto común / Objeto único | [GR] |
| Spell | Hechizo | [GR] |
| Traits | Rasgos | [GR] |
| Light Source | Fuente de luz | [GR] |
| Firearm | Arma de fuego | [GR][APP] |
| Heavy Weapon | Arma pesada | [APP] (Valkyrie traduce "Arma Contundente" [VAL-ES]) |
| Bladed Weapon | Arma de filo | [APP][GR] |
| Attack with a Spell / Unarmed | Atacar con un Hechizo / Atacar sin arma | [APP] |
| "Which weapon type will you attack with?" | ¿Con qué tipo de arma vas a atacar? | [APP] |
| Melee / Ranged icon | icono de combate cuerpo a cuerpo / a distancia | [GR] |
| Damage value (arma) | puntuación de Daño | [GR] |
| Evidence (rasgo) | **Prueba** (de ahí Prueba fotográfica, Prueba circunstancial...) | [GR][COM]. La UI de Valkyrie lo traduce como "Pista" [VAL-ES]: **no confundir con *Clue***. |
| Tome / Key / Equipment / Ally | Tomo / Llave / Equipo / Aliado | Sin verificar en las cartas; usados en Valkyrie |
| Inventory | Inventario | [GR] |

**Nombres de objetos en escenarios comunitarios** [COM]

- Grotesque Stone: "Escultura grotesca".
- Ritual Components: "Componentes de ritual".
- Old Keys: "Llaves antiguas".
- Brass Key: "Llave de latón".
- Old Journal: "Viejo diario".
- Puzzle Box: "Caja enigmática".
- Cult Sigil: "Emblema de sectario".
- Duke: "Duque", confirmado en [FAQ-ES].

### 17.6 Monstruos

| Inglés | Español | Verificación |
|---|---|---|
| Monster | Monstruo | [GR] |
| Monster Drawer | Cajón de monstruos | [GR] |
| Awareness | Percepción | [GR] |
| Horror rating | Horror (puntuación de Horror) | [GR] |
| Brawn | Agresividad | [GR] |
| ID token | ficha de Identificación | [GR] |
| Aquatic / Flying | Acuático / Volador | [GR] |
| Phasing | — | Sin verificar |
| Spawn ("place a monster") | Aparece un ... en el lugar señalado | [COM] |
| Deep One | Profundo | [FAQ-ES] |
| Cultist / Hunting Horror / Riot / Ghost | Sectario / Horrendo cazador / Turba / Fantasma | [COM] |

### 17.7 Mapa y entorno

| Inglés | Español | Verificación |
|---|---|---|
| Map Tile / Board | Módulo de tablero / Tablero | [GR] |
| Room / Space | Habitación / Espacio | [GR] |
| Wall / Door | Pared / Puerta | [GR] |
| Border / Impassable Border | Borde / Borde infranqueable | [GR] |
| Indoor / Outdoor | Interior / Exterior | [GR] |
| Adjacent | Adyacente | [GR] |
| Range / "within range" | Alcance / "dentro del alcance" | [GR][COM] |
| Toward / Away From / Nearest / Farthest | Hacia / Alejarse / Más cercano / Más alejado | [GR] |
| Random | Aleatorio | [GR] |
| Place / Remove from the Board / Clear the Board | Colocar / Retirar del tablero / Despejar el tablero | [GR] |
| Cardinal Directions | Puntos cardinales | [GR] |
| Features | Características del entorno | [GR] |
| Barricade | **Obstrucción** | [GR] |
| Darkness / Fire | Oscuridad / Fuego | [GR] |
| Secret Passage | Pasadizo secreto | [GR] |
| Person | Personaje (comunes y únicos) | [GR] |

### 17.8 Rompecabezas

| Inglés | Español | Verificación |
|---|---|---|
| Puzzle / Puzzle Step | Rompecabezas / Paso de rompecabezas | [GR] |
| Slide Puzzle | **Mosaico** | [GR] |
| Lock Puzzle | **Mecanismo** | [GR] |
| Code Puzzle | **Código** | [GR] |
| Puzzle "Close" / "Guess" | Cerrar / Resolver | [APP] |
| Tower / Line / Ring puzzle | — | Sin verificar ("conducto", según un blog) |

### 17.9 App y menús

| Inglés | Español | Verificación |
|---|---|---|
| App | Aplicación | [GR] |
| In-game Menu | Menú de juego | [GR] |
| Message Log | Historial de mensajes | [GR] |
| Save & Quit | Guardar y salir | [GR] |
| Collection Manager | Administrador de colección | [GR] |
| Double-sided cards | Cartas de doble cara | [GR] |

### 17.10 Expansiones

| Inglés | Español | Verificación |
|---|---|---|
| Horrific Journeys | Viajes escalofriantes | Blog en español; probable nombre comercial |
| Sanctum of Twilight | El santuario del crepúsculo | Blog en español; probable nombre comercial |
| Beyond the Threshold, Streets of Arkham, Path of the Serpent, Recurring Nightmares, Suppressed Memories | — | Sin verificar |

### 17.11 Títulos del glosario de la Guía de referencia en español

Sirven para buscar términos en la edición española [GR]:

Acción · Acciones de componente · Activación de monstruos (paso) · Administrador de colección · Adyacente · Alcance · Aleatorio · Alejarse · Anular · Aplicación · Ataque (acción) · Atributos · Boca arriba/boca abajo · Borde · Borde infranqueable · Búsqueda (acción) · Búsqueda (ficha) · Cajón de monstruos · Características del entorno · Cartas de doble cara · Código (rompecabezas) · Colocar · Cordura · Dados · Daño y Horror · Dar la vuelta · Descartar · Despejar el tablero · Eliminado · Empujar (acción) · Espacio · Estado · Evasión, tirada de · Evento de los Mitos · Eventos (paso) · Exploración (acción) · Exploración (ficha) · Exterior · Fase de los Investigadores · Fase de los Mitos · Fuego · Ganar · Gastar · Guardar y salir · Habitación · Hacia · Hechizo · Historial de mensajes · Horror · Horror (paso) · Horror, tirada de · Icono de acción · Interacción (acción) · Interacción (ficha) · Intercambio (acción) · Interior · Inventario · Investigador · Más alejado · Más cercano · Mecanismo (rompecabezas) · Menú de juego · Módulo de tablero · Monstruo · Mosaico (rompecabezas) · Movimiento · Movimiento (acción) · Objetivo · Objeto · Objeto común · Objeto único · Obstrucción · Oscuridad · Pared · Pasadizo secreto · Paso de rompecabezas · Personaje · Pertenencias · Pista · Prender fuego (acción) · Puerta · Puntos cardinales · Rasgos · Recoger · Renunciar · Retirar del tablero · Robar (acción) · Rompecabezas · Ronda · Soltar · Tablero · Tirada · Turno · Victoria y derrota · Vida y Cordura · Vistazo (ficha).

### 17.12 Estilo de redacción para escenarios en español [COM]

Coherente con la terminología oficial:

- "Sufres 2 de Daño (anulado por {agility})".
- "Sufres 1 de Horror boca abajo".
- "Adquieres el estado Aturdido".
- "Ganas el Objeto único ...".
- "Ganas 1 Pista".
- "Coloca el módulo ... y una ficha de Búsqueda en el lugar señalado".
- "Realiza una tirada de {observation}; si superas la tirada... / si fallas la tirada...".

---

## 18. Puente con Valkyrie: qué controla la app y cómo lo modela Valkyrie

Estas notas proceden del repositorio y la wiki de Valkyrie [VAL]. Sirven para relacionar las reglas con el diseño. El detalle técnico del formato debe consultarse en las notas específicas de Valkyrie.

| Elemento de la app oficial | Cómo lo representa Valkyrie |
|---|---|
| Fichas de Búsqueda, Exploración, Interacción, Vistazo y Personaje | Componentes *Token* con un evento asociado. Las opciones con coste se marcan con `{action}`. |
| Tiradas | Texto con los símbolos `{strength}`... `{will}`. Los botones de resultado los define el diseñador. Las tiradas acumulativas se hacen con eventos de **cuota**. |
| Rompecabezas | Componente *Puzzle* (§11.4). El estado se guarda al cerrar. |
| Aparición de monstruos | Componente *Spawn*. Valkyrie elige el tipo concreto entre los productos activados según los tipos o rasgos indicados. La Vida es base + por investigador; hay monstruos únicos con nombre y Vida propios. |
| Activación de monstruos | Valkyrie elige al azar el siguiente monstruo no activado. Usa los textos de activación del tipo (`ability`, `master`, `movebutton`, `move`) o el evento de activación de un monstruo personalizado. |
| Ataque | El texto sale al azar entre los del par tipo de arma × categoría del monstruo. Los monstruos personalizados pueden tener ataques propios por tipo. |
| Evasión y Horror | Texto al azar del tipo de monstruo, o eventos `evadeevent` y `horrorevent` del monstruo personalizado. Muestra la Percepción y el Horror. |
| Eventos de los Mitos | Cada Fase de los Mitos, el evento interno `PerilMythosPool` (disparador `Mythos`) elige al azar **1** Evento de los Mitos entre los habilitados por las variables de intensidad (`$mythosFlavor`, `$mythosHelp`, `$mythosMinor`, `$mythosMajor`, `$mythosDeadly`) y de lugar (`$mythosIndoors`, `$mythosOutdoors`, `$mythosLibrary`, `$mythosStreet`...), más los especiales (`$mythosDarkness`, `$mythosDiscardItem`, `$mythosKey`). El diseñador las enciende y apaga (receta en `patrones.md`). También puede crear eventos propios con los disparadores `Mythos`, `EndRound`, `StartRound`, `EndInvestigatorTurn` y `BeforeMonsterActivation`. |
| Fuego | Opción del menú "Prender fuego" (variable `$fire`) y evento automático de propagación en cada Fase de los Mitos (§13.1). |
| Investigador eliminado | Opción del menú, variable `#eliminated` y activadores `StartFinalRound` y `Eliminated` (§7.4). |
| Ronda y tiempo | Variable `#round`. La presión de tiempo la programa el diseñador, por ejemplo con eventos en `EndRound` que comprueban `#round`. |
| Final | Variable `$end` o fin de escenario en un evento. Hay que crear eventos de victoria y de derrota (tiempo, eliminación). |

---

## Fuentes

### Oficiales (FFG / Edge / Asmodee)

- Rules Reference (EN): https://images-cdn.fantasyflightgames.com/filer_public/a6/c1/a6c1ba76-bc7e-4a4c-ba6c-dd72574b431d/mansions_of_madness_second_editon_rules_reference.pdf
  - Copia en Steam: https://cdn.akamai.steamstatic.com/steam/apps/478980/manuals/mansions_of_madness_second_editon_rules_reference.pdf
- Learn to Play (EN): https://cdn.akamai.steamstatic.com/steam/apps/478980/manuals/mansions_of_madness_second_edition_learn_to_play.pdf
  - Copia: https://cdn.1j1ju.com/medias/4d/75/62-mansions-of-madness-second-edition-rulebook.pdf
- FAQ oficial v1.0 (EN): https://images-cdn.fantasyflightgames.com/filer_public/27/a1/27a1ca76-7f47-419c-bea6-d83a90491606/madfaq_1_0.pdf
- Guía de referencia (ES): https://cdn.svc.asmodee.net/production-ffges/uploads/2023/08/Guia_Referencia_Mansiones_de_la_Locura.pdf
  - Copia: https://www.jugonesweb.com/wp-content/uploads/2016/12/Mansionesdelalocuraguiareferencia_es.pdf
- FAQ v1.0 (ES): https://cdn.svc.asmodee.net/production-ffges/uploads/2023/08/Reglas_Mansiones_de_la_Locura.pdf
- Reglas del kit de conversión: https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/478980/manuals/mansions_of_madness_second_edition_conversion_kit_rules.pdf
- Path of the Serpent: https://images-cdn.fantasyflightgames.com/filer_public/72/41/72411d43-e1bc-4cab-814d-be42d1a453d5/mad28_rules.pdf
- Sanctum of Twilight: https://images-cdn.fantasyflightgames.com/filer_public/aa/df/aadfa0f3-2296-4892-a5f8-e1481558fca5/sanctum_of_twilight_rules.pdf
- Beyond the Threshold: https://cdn.1j1ju.com/medias/1f/57/3a-mansions-of-madness-second-edition-beyond-the-threshold-rulebook.pdf
- Streets of Arkham: https://cdn.1j1ju.com/medias/7a/3f/ff-mansions-of-madness-second-edition-streets-of-arkham-rulebook.pdf
- Horrific Journeys: https://cdn.1j1ju.com/medias/2e/2e/88-mansions-of-madness-second-edition-horrific-journeys-rulebook.pdf
- Página del producto: https://www.fantasyflightgames.com/en/mansions-of-madness-second-edition/products/mansions-madness-second-edition/

### Dictámenes y FAQ comunitarios (BoardGameGeek, a través de su API)

- Lista del foro de reglas: https://api.geekdo.com/api/forums/threads?forumid=66&objectid=205059&objecttype=thing&pageid=1&sort=hot
- Hilos (con el prefijo https://api.geekdo.com/api/articles?threadid=):

| ID del hilo | Tema |
|---|---|
| 3274346 | Recopilación de dictámenes oficiales |
| 1627427 | FAQ comunitaria |
| 1649128 | Publicación de la FAQ oficial |
| 1685274 | Dar la vuelta a varias cartas |
| 1617399 | Locura y orden de turnos |
| 2015477 | Daño adicional de armas |
| 1696989 | Propagación del fuego |
| 1793691 | Errores de novato |
| 1625106 | Confusión con las cartas de Estado |
| 1625091 | Desconcertado y Concentrado |
| 1639800 | Ganar un Estado a mitad de turno |
| 1642004 | Concentrado |

### Archivo del foro de FFG

- https://ffg-forum-archive.entropicdreams.com/topic/285208-carson-sinclair-action-stunned-players/
- https://ffg-forum-archive.entropicdreams.com/topic/226873-can-you-attack-or-search-when-restrained/
- https://ffg-forum-archive.entropicdreams.com/topic/229963-death-insanity/
- https://ffg-forum-archive.entropicdreams.com/topic/237973-can-someone-explain-focus-to-a-beginner/
- https://ffg-forum-archive.entropicdreams.com/topic/308385-common-mistakes-seeking-advice/
- https://ffg-forum-archive.entropicdreams.com/topic/233834-claustrophobia/
- https://ffg-forum-archive.entropicdreams.com/topic/236341-claustrophobia-kara-centell-dunks-official-answer/
- https://ffg-forum-archive.entropicdreams.com/topic/231742-push-action-evade-check/
- https://ffg-forum-archive.entropicdreams.com/topic/243262-monster-movement-question/
- https://ffg-forum-archive.entropicdreams.com/topic/289112-4-questions-move-action-journal-monster-attack-range/
- https://ffg-forum-archive.entropicdreams.com/topic/227505-wounded-insane-eliminated-clarifications/
- https://ffg-forum-archive.entropicdreams.com/topic/274703-using-restraints/
- https://ffg-forum-archive.entropicdreams.com/topic/228354-does-instill-bravery-work-on-faceup-cards/
- https://ffg-forum-archive.entropicdreams.com/topic/255537-akachi-onyele-worst-ever-or-is-there-worse/
- https://ffg-forum-archive.entropicdreams.com/topic/225805-welcome-to-the-mansions-of-madness-second-edition-forums/

### Resúmenes, listas y reseñas

- The Esoteric Order of Gamers (resumen v2, incluye expansiones): https://www.orderofgamers.com/downloads/MansionsofMadness2ndEd_v2.pdf
- UltraBoardGames: https://www.ultraboardgames.com/mansions-of-madness/game-rules.php y https://www.ultraboardgames.com/mansions-of-madness/additional-rules.php
- Lindhardgaming (listas de componentes):
  - https://www.lindhardgaming.dk/2017/05/14/mansion-of-madness-2nd-edition-list/
  - https://www.lindhardgaming.dk/2018/03/01/mansion-of-madness-2nd-edition-beyond-the-thresold-complete-inventory-list/
  - https://www.lindhardgaming.dk/2018/05/27/mansion-of-madness-2nd-edition-streets-of-arkham-complete-inventory-list/
  - https://www.lindhardgaming.dk/2018/07/15/sanctum-of-twillight-complete-inventory-list/
  - https://www.lindhardgaming.dk/2018/12/30/horrific-journeys/
  - https://www.lindhardgaming.dk/2019/11/19/mansion-of-madness-exspansion-path-of-the-serpent-complete-inventory-list/
- Foro de Tric Trac (dictámenes sobre alcance y Horror): https://forum.trictrac.net/t/les-demeures-de-l-epouvante-seconde-edition-1/164348
- Steam (estado de los rompecabezas): https://steamcommunity.com/app/478980/discussions/0/2942494909164073706
- Steam (acciones gratuitas): https://steamcommunity.com/app/478980/discussions/0/1642052612855213509
- Otras reseñas y resúmenes:
  - https://thesolomeeple.com/2018/07/10/mansions-of-madness-second-edition/
  - https://fenomas.com/2024/01/mansions/
  - https://www.theboardgamefamily.com/2017/04/mansions-of-madness-board-game-review/
  - https://peterrustemeyer.wordpress.com/2017/05/14/angespielt-villen-des-wahnsinns-2/
- Wikipedia: https://en.wikipedia.org/wiki/Mansions_of_Madness

### Fuentes en español

- https://www.susurrosdesdelaoscuridad.com/2016/11/aprende-jugar-las-mansiones-de-la.html
- https://www.susurrosdesdelaoscuridad.com/2019/02/las-mansiones-de-la-locura-viajes.html
- https://www.susurrosdesdelaoscuridad.com/2018/11/las-mansiones-de-la-locura-2-edicion-el.html
- https://juernesdemesa.com/hoja-de-ayuda-las-mansiones-de-la-locura

### Valkyrie y escenarios comunitarios (GitHub)

- Repositorio de Valkyrie: https://github.com/NPBruce/valkyrie
  - Archivos consultados: `unity/Assets/StreamingAssets/content/MoM/*` (monsters, attacks, evade, horror, activations, mythos, items, puzzle), `unity/Assets/StreamingAssets/text/Localization.Spanish.txt` y `unity/Assets/Scripts/Quest/*.cs`.
- Wiki de Valkyrie: https://github.com/NPBruce/valkyrie/wiki (páginas Event-Triggers, Valkyrie-Variables, QuestIniPuzzle, QuestIniActivation, QuestIniCustomMonster, TutorialMythosEvents, TutorialQuotaEvents, Special-Symbols).
- Escenarios en español:
  - https://github.com/vidimus/Escenarios_para_Mansiones
  - https://github.com/vidimus/HechizocasaCorbit
  - Listado de repositorios del tema: https://github.com/topics/mansions-of-madness

### Consultadas sin resultado útil

- Fandom Arkham Horror Files (error 402) y sus espejos: no se pudieron leer los textos exactos de las cartas de Estado.
- Scribd: requiere JavaScript.
- fgbradleys.com: bloqueado por robots.txt.
- Ficha de producto en bbystatic: solo contenía publicidad.
- rulespal.com: sin datos nuevos.
- Resumen de tesera.ru: corresponde a la **1ª edición** y se descartó.
- FAQ v3.1 de FFG (mad_faq_v3_1.pdf): también es de la **1ª edición** y se descartó.
- Hilos de BGG 2023488 y 3304149: no pudieron leerse por límite de peticiones (HTTP 429).
