# Reglas de Descent: Viaje a las Tinieblas (2ª edición) y Road to Legend

Referencia completa de las reglas del juego de mesa *Descent: Journeys in the Dark Second Edition* (FFG, 2012;
en español *Descent: Viaje a las Tinieblas, Segunda Edición*, Edge Entertainment) y de su modo cooperativo con
la app oficial *Road to Legend* (FFG, 2016; la comunidad hispana la llama «Camino a la leyenda» [COM]). Está
**parafraseada** (no copia reglamentos ni cartas) y se centra en lo que necesita quien escribe aventuras para
**Valkyrie**, que juega Descent como Road to Legend: la app controla a los monstruos, no hay jugador Señor
Supremo, los héroes juegan sus turnos y, tras cada uno, la app activa un grupo de monstruos con instrucciones
de texto. Cubre el juego entero, incluido el modo competitivo, para que se entiendan las cartas y las
expansiones.

- El formato de ficheros de Valkyrie (`quest.ini`, eventos, variables) está en `formato-escenario.md` y las
  recetas para construir cada parte de una aventura, en `patrones.md`; aquí solo se da el puente a alto nivel
  (§19).
- Lo que cada caja y expansión añade (héroes, clases, monstruos, piezas, packs de Valkyrie): `expansiones.md`.
- Para redactar textos en español con una terminología coherente: §18 (glosario y estilo).

## Índice

- [Códigos de fuente](#códigos-de-fuente)
- [0. Chuleta rápida](#0-chuleta-rápida)
- [1. Visión general](#1-visión-general)
- [2. Componentes y su función](#2-componentes-y-su-función)
- [3. Preparación](#3-preparación)
- [4. Estructura de la ronda](#4-estructura-de-la-ronda)
- [5. Acciones](#5-acciones)
- [6. Movimiento y terreno](#6-movimiento-y-terreno)
- [7. Línea de visión, alcance, adyacencia y casillas vacías](#7-línea-de-visión-alcance-adyacencia-y-casillas-vacías)
- [8. Ataques](#8-ataques)
- [9. Vida, Aguante, fatiga, fuera de combate y moral](#9-vida-aguante-fatiga-fuera-de-combate-y-moral)
- [10. Estados](#10-estados)
- [11. Héroes y clases](#11-héroes-y-clases)
- [12. Monstruos](#12-monstruos)
- [13. Lugartenientes y agentes](#13-lugartenientes-y-agentes)
- [14. Búsqueda, objetos, oro, reliquias y tienda](#14-búsqueda-objetos-oro-reliquias-y-tienda)
- [15. Campaña](#15-campaña)
- [16. Objetivos de una aventura, victoria y derrota](#16-objetivos-de-una-aventura-victoria-y-derrota)
- [17. FAQ, erratas y reglas que se suelen malinterpretar](#17-faq-erratas-y-reglas-que-se-suelen-malinterpretar)
- [18. Glosario español ↔ inglés](#18-glosario-español--inglés)
- [19. Puente con Valkyrie](#19-puente-con-valkyrie)
- [Fuentes](#fuentes)

## Códigos de fuente

Cada afirmación lleva el código de su fuente. La lista completa de URL está en «Fuentes», al final.

| Código | Fuente |
|---|---|
| [RR] | **Reglamento** oficial de la caja básica (*Rulebook*, FFG, reimpresión de 2015, inglés). Descent 2ª ed. no tiene una *Rules Reference* aparte ni un *Learn to Play* separado: este reglamento hace las dos cosas. Es la fuente de mayor autoridad del juego competitivo. |
| [FAQ] | FAQ y erratas oficiales, versión 1.6 (FFG, 18 de enero de 2016), la que enlaza hoy la página del producto. |
| [RTL] | Reglas oficiales de *Road to Legend* (FFG, 2016). Es la fuente de mayor autoridad del modo cooperativo con app. |
| [EXP] | Reglamentos oficiales de expansiones: *Lair of the Wyrm* (LotW), *Labyrinth of Ruin* (LoR), *The Trollfens* (TT), *Shadow of Nerekhall* (SoN), *Manor of Ravens* (MoR), *Mists of Bilehall* (MoB), *The Chains That Rust* (TCTR), reglas de los packs de lugarteniente y la aventura cooperativa *Forgotten Souls* (FS). Se indica cuál cuando importa: [EXP-LoR], [EXP-SoN]… |
| [QG] | *Quest Guide* (libro de aventuras). No se leyó entero; solo se cita a través de la FAQ. |
| [CRRG] | *Community Rules Reference Guide* v1.15 (descent-community.org, 2019; v1.0 de 2017 para algunas entradas). Recopila las reglas oficiales de todas las cajas, las de Road to Legend, la FAQ v1.6 y unas 400 respuestas de FFG por correo. **No es oficial**, pero sus respuestas por correo sí lo son. Solo se pudo leer hasta la letra M (ver «Consultadas sin resultado útil»). |
| [DICT] | Respuestas oficiales de FFG por correo (*uFAQ*). Aquí se citan como [CRRG], que es donde se leyeron. |
| [WIKI] | Wiki de descent-community.org (no oficial; valores de héroes, monstruos, estados y dados). |
| [ES] | Reglamentos de Edge en español. **No se pudieron leer** (ver «Consultadas sin resultado útil»), así que la terminología española sale de [COM], [BLOG] y [VAL-ES]. |
| [COM] | 49 escenarios comunitarios de Valkyrie traducidos al español (`Localization.Spanish.txt`). Varios textos de monstruos siguen el formato de la app oficial en español. Uso probable, **no oficial**. Solo se toman de ellos términos y fórmulas cortas, nunca textos. |
| [BLOG] | Blogs y reseñas de jugadores (padresfrikis.com en español; theologyofgames.com en inglés). No oficial. |
| [VAL] | Código, datos (`content/D2E/*.ini`) y wiki de Valkyrie, commit fijado `752d420` (versión 3.28). |
| [VAL-ES] | Traducción propia de la interfaz de Valkyrie al español. **No oficial.** |
| [WEB-FFG] | Noticias y páginas de producto de FFG. |
| [BGG] | BoardGameGeek y archivo del foro de FFG. **No se usó:** BoardGameGeek no se pudo leer y el hilo consultado del foro no era de Descent. |
| [AJ] | *Learn to Play*: no existe en esta edición (lo cubre [RR]). |
| [OoG] | Resumen de *The Esoteric Order of Gamers*: **no se usó**, la web bloquea la lectura. |

- **(sin verificar)** significa que el dato no pudo confirmarse en una fuente fiable.
- **(?)** detrás de un término español indica que no se ha confirmado como traducción oficial de Edge.
- Los símbolos se escriben como en los textos de Valkyrie: `{heart}` (daño, ♥), `{fatigue}` (fatiga), `{surge}`
  (aumento), `{shield}` (escudo de defensa), `{might}`, `{knowledge}`, `{will}`, `{awareness}` (atributos) y
  `{action}` (icono de acción) [VAL].

---

## 0. Chuleta rápida

- **Dos modos.** Competitivo: un jugador es el **Señor Supremo** (*overlord*) y controla monstruos y cartas
  contra 2–4 héroes [RR]. Cooperativo con app (*Road to Legend*, «RtL»): 1–4 jugadores controlan entre 2 y 4 héroes
  (en solitario, uno lleva varios) y la app mueve a los monstruos [RTL][VAL]. **Valkyrie funciona como RtL** [VAL].
- **Ronda de RtL.** El grupo elige un héroe, que juega su turno; al acabar, la app activa **un grupo de monstruos
  al azar**; luego otro héroe, otro grupo… Si un bando se queda sin turnos, el otro juega los que le quedan
  seguidos. Después llega el final de ronda [RTL][VAL].
- **Turno de héroe.** Al empezar: terminan los efectos «hasta el inicio de tu siguiente turno», se resuelven los
  «al inicio de tu turno» y se **refrescan** las cartas agotadas; se puede cambiar el equipo. Después hace
  **2 acciones** en cualquier orden, repetibles y opcionales [RR][RTL].
- **Acciones.** Mover, Atacar, Usar una habilidad, Descansar, Buscar, Levantarse (solo fuera de combate),
  Reanimar a un héroe, Abrir o cerrar una puerta (en RtL solo **abrir**) y acción especial [RR][RTL].
- **Movimiento.** Se ganan tantos puntos de movimiento como la **Velocidad**; cada casilla cuesta 1. Se puede
  mover en **diagonal**, atravesar figuras **amigas** (no enemigas) y no se acaba en casilla ocupada. Un héroe
  puede sufrir 1 **fatiga** por cada punto extra, hasta su **Aguante** [RR].
- **Terreno.** Agua: cuesta 2 puntos. Foso: 2 de daño al entrar. Lava o casilla peligrosa: 1 de daño al entrar
  y derrota si acabas el turno dentro. Obstáculo: bloquea paso y visión. Lodo, elevación, muro antiguo, maleza,
  rastrillo y terreno quebradizo vienen en expansiones (§6.6) [RR][EXP].
- **Ataque.** Dado azul + dados de potencia contra dados de defensa, todo a la vez. La **X** del azul es fallo.
  A distancia, el alcance sacado debe llegar al número de casillas. Cada **aumento** activa una habilidad de
  aumento distinta (1 vez cada una por ataque). Daño = ♥ − escudos [RR].
- **Prueba de atributo.** Se tiran **1 dado gris y 1 negro**: se supera si los escudos son **iguales o menos**
  que el atributo (Fuerza, Conocimiento, Voluntad o Percepción). Los monstruos líderes y esbirros **fallan
  siempre**; los lugartenientes tiran [RR][RTL]. Con atributo 3 se supera el 53 % de las veces; con 4, el 72 %;
  con 5, el 92 % (§2.2).
- **Fuera de combate.** Al llegar el daño a la Vida, el héroe sufre fatiga hasta su Aguante, pone una ficha de
  héroe en su lugar y descarta sus Estados; si era su turno, se acaba. En su siguiente turno solo puede
  **Levantarse** (2 dados rojos: recupera ♥ por cada ♥ y fatiga por cada aumento; luego termina el turno), o un
  héroe adyacente lo **Reanima** [RR][RTL].
- **Moral (RtL).** Empieza igual al número de héroes y baja 1 cada vez que un héroe queda fuera de combate. Si
  está a **0** y cae otro héroe, los héroes **huyen y pierden** la aventura. Se recupera, sobre todo, en las
  ciudades [RTL]. En Valkyrie: botón **KO** del retrato; si la moral baja de 0, salta el disparador `NoMorale`
  [VAL].
- **Estados.** Envenenado, Enfermo, Inmovilizado, Aturdido (caja básica); En llamas (*Burning*), Maldito,
  Debilitado, Sangrando, Condenado y Aterrorizado (expansiones). Un ataque solo los pone si hace **al menos 1 ♥**
  tras la defensa; no se acumulan copias (§10) [RR][WIKI].
- **Monstruos en RtL.** Cada monstruo hace hasta **2 acciones**, solo **1 ataque** (salvo habilidades como
  *Ravage*). Recorre la lista de acciones de arriba abajo y vuelve a empezar si llega al final. **Divisar**
  (*Spot*): ir a 3 casillas o menos con línea de visión. **Confrontar** (*Engage*): ir adyacente. **Retirarse**
  (*Retreat*): alejarse con el movimiento sobrante. Empates de objetivo: el más cercano; si sigue el empate,
  deciden los jugadores [RTL][COM].
- **Dos héroes.** Una vez por turno, cada héroe puede hacer un ataque normal **sin gastar acción**; si no lo
  hace, recupera **2 ♥** al final de su turno [FAQ][RTL].
- **Final de aventura en RtL.** Los héroes recuperan todo el daño y la fatiga, ponen boca arriba su hoja,
  descartan Estados y cartas de Búsqueda. La app guarda oro, PE y compras, pero **no** posiciones, daño ni
  Estados [RTL].

---

## 1. Visión general

- **Género.** *Dungeon crawler* de fantasía en el mundo de Terrinoth. Se juega por aventuras sueltas o en
  campañas que las encadenan con experiencia, oro y equipo [RR][WEB-FFG].
- **Modo competitivo** [RR]:
  - Un jugador es el **Señor Supremo**. Los demás (1–4 jugadores) controlan entre 2 y 4 héroes; con 2 jugadores,
    uno lleva dos héroes, cada uno con su propio turno.
  - Los héroes ganan o pierden juntos; el Señor Supremo gana o pierde solo.
  - El Señor Supremo activa a los monstruos, juega cartas de Señor Supremo y compra mejoras con su experiencia.
- **Modo cooperativo con app (Road to Legend)** [RTL]:
  - No hay Señor Supremo. Todos los jugadores son héroes y ganan o pierden juntos. Se puede jugar en solitario
    controlando varios héroes.
  - La app prepara cada aventura, revela el mapa poco a poco, coloca y activa a los monstruos y cuenta la
    historia.
  - La app **no** sabe dónde está cada figura, ni el daño, ni los Estados, ni lo que sale en los dados: lo llevan
    los jugadores con los componentes. Los jugadores le dicen a la app lo que ocurre (se abre una puerta, cae un
    grupo de monstruos, un héroe queda fuera de combate, se compra una habilidad) y ella avanza la aventura.
  - Solo hay campañas de aventuras narrativas (y modos especiales como *The Delve*); no se usan las cartas de
    Señor Supremo, de Evento de viaje ni de Referencia.
- **Otros modos cooperativos sin app** [EXP-FS]: *Forgotten Souls*, *Nature's Ire* y *Dark Elements* usan
  mazos de Activación, Peligro y Exploración en lugar de app. Sus reglas de movimiento de monstruos («hacia»,
  «alejarse», *Spot*, *Engage*) son el antecedente de RtL (§6.8).
- **Valkyrie** [VAL]: app libre de NPBruce que sustituye a la oficial. Juega Descent al estilo RtL: los héroes
  pulsan **Fin del Turno** en su retrato, la app elige un grupo de monstruos al azar y muestra su activación,
  lleva la moral, la experiencia, el oro, la tienda y las campañas, y permite elegir clase (también híbrida).
- **Prioridad de reglas** [FAQ][RTL]:
  - El texto de las cartas y habilidades prevalece sobre el reglamento.
  - Las reglas de la aventura (libro de aventuras o, en RtL, la app) prevalecen sobre cartas, habilidades y
    reglamento.
- **Conflictos de tiempo.** Si varias habilidades se disparan a la vez, el **jugador activo** decide el orden
  [CRRG].
- **Decisiones de grupo** [RR][RTL][EXP-FS]:
  - El grupo decide qué héroe juega cada turno, y puede cambiar el orden en cada ronda.
  - Si un efecto admite varias opciones o varios objetivos y no está claro, eligen los jugadores, y deben
    decidir rápido. RtL sugiere que los grupos novatos elijan lo que favorezca a los héroes.
  - En los eventos de viaje del modo competitivo, todos los jugadores héroe deben estar de acuerdo.
- **Sin límite de fichas.** Daño, fatiga, Estados y amenaza no están limitados por las fichas de la caja; si se
  acaban, se sustituyen por otra cosa [CRRG][RTL]. Las excepciones son las fichas limitadas a propósito
  (elixir, maleficio, valor, imagen…: §11.9).
- **Figuras.** Son figuras los héroes, los aliados, los monstruos (lugartenientes incluidos), algunos familiares y
  algunos personajes de aventura; bloquean el paso y la línea de visión. Las fichas no son figuras salvo que se
  diga [CRRG].

---

## 2. Componentes y su función

### 2.1 Contenido de la caja básica [RR][RTL]

| Componente | Cantidad | Uso en RtL / Valkyrie |
|---|---|---|
| Figuras de héroe | 8 | Sí |
| Figuras de monstruo (9 tipos; esbirros en color beige, líderes en rojo) | 31: 5 zombis, 5 arqueros goblin, 5 arañas de las cavernas, 4 moldeadores de carne, 4 barghests, 2 ettins, 2 elementales, 2 meriodones (*merriods*), 2 dragones de las sombras | Sí |
| Dados de seis caras | 9: 1 azul, 2 rojos, 2 amarillos, 1 marrón, 2 grises, 1 negro | Sí |
| Hojas de héroe | 8 | Sí |
| Cartas de Clase | 84 (8 clases) | Sí |
| Cartas de Objeto de la tienda | 34 (20 del Acto I y 14 del Acto II) | Sí |
| Cartas de Reliquia | 6 | Sí |
| Cartas de Búsqueda | 12 | 10 (se retiran «Nothing» y «Treasure Chest») |
| Cartas de Estado | 16 (4 tipos × 4) | Sí |
| Cartas de Monstruo | 18 (9 tipos × Acto I y Acto II) | Sí |
| Cartas de Lugarteniente | 12 (6 lugartenientes × 2 actos) | Sí |
| Cartas de Señor Supremo, de Evento de viaje y de Referencia | — | **No** se usan en RtL |
| Piezas de mapa (dos caras) | 48 piezas físicas: losetas 1–30 más entradas, salidas, terminales, extensiones y transiciones | Sí |
| Puertas de cartón con peana | 7 | Sí |
| Fichas de Lugarteniente | 6 | Sí |
| Fichas de Objetivo | 10 (de colores) | Sí |
| Fichas de Búsqueda | 9 | Sí |
| Fichas de Estado | 20 | Sí |
| Fichas de héroe | 16 | Sí |
| Ficha de familiar | 1 (Reanimado del Nigromante) | Sí |
| Fichas de Aldeano | 8 | Sí |
| Fichas de daño / de fatiga | 45 / 35 | Sí |
| Libros de aventuras (*Quest Guide*) | 2, con 19 aventuras: 16 se pueden jugar sueltas y el resto (Interludio y Final) solo en campaña | No |

- **Dados sueltos.** Existe un pack de dados aparte (DJ08) [WEB-FFG]. *Labyrinth of Ruin* y *Shadow of
  Nerekhall* traen 2 dados verdes; *The Trollfens*, 1 [EXP].
- **Piezas de mapa.** Cada loseta tiene un código de número y letra (la letra es la cara: A o B). Las de la caja
  básica son la 1–30 y las de cada expansión siguen la numeración (§2.5). Una cara es de interior y otra de
  exterior (cuál es cada letra, sin verificar) [RR][FAQ][VAL].

### 2.2 Dados

**Tipos** [RR][CRRG]

| Dado | Nombre | Cuántos (caja básica) | Para qué |
|---|---|---|---|
| Azul | Dado de ataque | 1 | Siempre está en un ataque. Es el único con **X** (fallo) y da el alcance base. |
| Rojo | Dado de potencia | 2 | Mucho daño. Típico de armas cuerpo a cuerpo. Se tiran 2 para Levantarse o Reanimar. |
| Amarillo | Dado de potencia | 2 | Daño, alcance extra y aumentos. Típico de armas a distancia y mágicas. |
| Verde | Dado de potencia | 0 (expansiones) | Pocos ♥, muchos aumentos y algo de alcance. Lo piden ciertas armas y habilidades. |
| Marrón | Dado de defensa | 1 | Defensa baja. |
| Gris | Dado de defensa | 2 | Defensa media. La de casi todos los héroes. |
| Negro | Dado de defensa | 1 | Defensa alta. |

- **Reserva de ataque.** Todos los dados que tira el atacante: el azul más los de potencia que indique el arma o
  la carta de Monstruo. «Dado de ataque» en singular es el azul; «dados de ataque» en plural es toda la
  reserva [CRRG].
- **Reserva de defensa.** La hoja de héroe (normalmente un dado gris), la armadura y otros efectos para los
  héroes; la carta de Monstruo para los monstruos [RR].
- **Pruebas de atributo.** Se tira 1 dado gris y 1 negro y se cuentan los escudos (§11.2) [RR].

**Caras** [WIKI], comprobadas con las probabilidades que publica la wiki. Las cantidades son seguras; qué
combinación exacta lleva cada cara, salvo en los dados de defensa, está sin verificar.

| Dado | Caras |
|---|---|
| Azul | 1 cara con **X** (fallo, sin nada más). Las otras 5 dan alcance 2, 3, 4, 5 y 6. De esas 5, tres dan 2 ♥ y dos dan 1 ♥; dos de ellas llevan además 1 aumento. |
| Rojo | Todas tienen ♥: 1 cara con 1 ♥, 3 caras con 2 ♥ y 2 caras con 3 ♥. Una de ellas lleva además 1 aumento. Media: 2,2 ♥. |
| Amarillo | 3 caras con 1 ♥, 2 con 2 ♥ y 1 sin ♥ (media 1,2). 3 caras con 1 aumento. Alcance extra: 2 caras con +1 y 1 cara con +2. |
| Verde | 4 caras con 1 ♥ (media 0,7). 4 caras con 1 aumento. 3 caras con +1 de alcance. |
| Marrón | 0, 0, 0, 1, 1 y 2 escudos. Media 0,67. |
| Gris | 0, 1, 1, 1, 2 y 3 escudos. Media 1,33. |
| Negro | 0, 2, 2, 2, 3 y 4 escudos. Media 2,17. |

**Probabilidades útiles para fijar dificultades** (cálculo propio con las caras de arriba)

| Atributo | Probabilidad de superar la prueba (gris + negro) |
|---|---|
| 1 | 11 % |
| 2 | 22 % |
| 3 | 53 % |
| 4 | 72 % |
| 5 | 92 % |
| 6 | 97 % |
| 7 o más | 100 % |

- Un ataque falla por la X en **1 de cada 6** tiradas [RR].
- Con un solo dado de defensa, sacar al menos 1 escudo: marrón 50 %, gris 83 %, negro 83 %; al menos 2: marrón
  17 %, gris 33 %, negro 83 %.
- Dos dados rojos (Levantarse o Reanimar) dan una media de 4,3 ♥.
- Los atributos de un héroe van de 1 a 5 y, en los ocho héroes de la caja básica, suman siempre 11 [WIKI]. Una
  prueba de un atributo cualquiera «para todos los héroes» la falla, de media, aproximadamente la mitad del
  grupo (cálculo propio).

### 2.3 Símbolos

| Símbolo | En Valkyrie | Significado |
|---|---|---|
| Corazón | `{heart}` | Daño (en ataques y efectos) y Vida (en hojas y cartas). «Sufrir 2 `{heart}`» es recibir 2 de daño; «recuperar 2 `{heart}`» es curarlos [RR][VAL]. |
| Rayo | `{surge}` | **Aumento** (*surge*): resultado de los dados que se gasta en habilidades de aumento (§8.4) [RR]. |
| Número | — | Alcance (en dados de ataque y potencia) [RR]. |
| Escudo | `{shield}` | Resultado de defensa: cada uno anula 1 ♥. También es lo que se cuenta en las pruebas de atributo [RR]. |
| X | — | Fallo, solo en el dado azul [RR]. |
| Gota o rayo de fatiga | `{fatigue}` | Fatiga y Aguante [RR][VAL]. |
| Iconos de atributo | `{might}`, `{knowledge}`, `{will}`, `{awareness}` | Fuerza, Conocimiento, Voluntad y Percepción [RR][VAL]. |
| Flecha de acción | `{action}` | La habilidad cuesta una acción [RR][VAL]. |

- En las fuentes de Valkyrie, los símbolos se dibujan con los caracteres `≥` (corazón), `∏` (fatiga), `∂`
  (Fuerza), `π` (Voluntad), `∞` (acción), `∑` (Conocimiento), `μ` (Percepción), `≤` (escudo) y `±` (aumento),
  que algunos escenarios escriben directamente [VAL][COM].

### 2.4 Para qué sirve cada componente

**Hoja de héroe** [RR][CRRG]

- Nombre y **arquetipo** (Guerrero, Mago, Sanador o Explorador).
- **Características:** Velocidad, Vida, Aguante y Defensa (los dados de defensa).
- **Atributos:** Fuerza, Conocimiento, Voluntad y Percepción.
- **Habilidad de héroe** (siempre disponible) y **proeza heroica** (una vez por encuentro; al usarla se da la
  vuelta a la hoja).
- Icono de la expansión.

**Cartas de Clase** [RR][EXP-TCTR]

- Cada clase pertenece a un arquetipo y trae el **equipo inicial** (cartas de objeto que son de la clase), una
  **habilidad básica** gratuita y habilidades que se compran con PE (1, 2 o 3 PE cada una).
- Las cartas de Clase no se pueden intercambiar.

**Cartas de Objeto de la tienda y Reliquias** [RR]

- Las de la tienda llevan nombre, tipo de ataque (cuerpo a cuerpo o a distancia; si no tiene, no es un arma),
  iconos de equipo (manos, armadura, otro), dados, precio en oro, rasgos y reglas.
- Hay mazo del Acto I y mazo del Acto II.
- Las **Reliquias** son objetos únicos que se ganan en aventuras; tienen cara de héroe y cara de Señor Supremo.

**Cartas de Búsqueda** [RR][WIKI]

- Objetos de un solo uso (pociones, frasco de fuego, amuleto…) que se roban al buscar. Cada una tiene un valor en
  oro que el grupo cobra al final de la aventura (en el modo competitivo).
- Lista y uso en §14.1.

**Cartas de Estado** [RR]

- Los héroes llevan una carta por Estado; los monstruos, una ficha de Estado junto a la figura.

**Cartas de Monstruo** [RR][CRRG]

- Una por tipo y acto (Acto I y Acto II). Arriba vienen los datos del **esbirro** y abajo los del **líder**:
  Velocidad, Vida, Defensa, tipo de ataque y dados, habilidades y aumentos.
- En el reverso, los **rasgos** y el **límite de grupo** según el número de héroes.

**Cartas de Lugarteniente** [RR]

- Una por lugarteniente y acto. Su Velocidad, Vida y Defensa cambian con el número de héroes. A diferencia de los
  monstruos, tienen atributos y hacen pruebas.

**Fichas** [RR][RTL][VAL]

| Ficha | Uso |
|---|---|
| Búsqueda | Se registra con la acción Buscar (§5.5). Hay una variante «especial» para búsquedas únicas de una aventura. |
| Objetivo | De colores: rojo, azul, verde y blanco (Valkyrie tiene además una negra, probablemente el reverso; sin verificar). Marcan objetivos que se recogen, se activan o se llevan (§5.8). |
| Aldeano | Hombre o mujer. Representan personajes no jugadores: rehenes, guardias, informantes… Sus reglas las da la aventura. |
| Héroe | Con el retrato de cada héroe. Marcan dónde quedó un héroe fuera de combate, el descanso y otros recordatorios. |
| Daño y fatiga | Se ponen en la hoja de héroe o junto al monstruo. |
| Estado | Para monstruos. |
| Lugarteniente | Representa al lugarteniente si no se tiene su figura. |
| Familiar | Representa al familiar de un héroe (§11.8). |
| Puertas | Bloquean paso y visión hasta que se abren (§6.7). |

**Piezas de mapa** [RR][RTL][CRRG]

- **Losetas** numeradas, más piezas sin número que se identifican por la forma: **entrada**, **salida**,
  **terminales** (*end caps*: cierran un pasillo), **extensiones** (*extenders*) y **transiciones**.
- Las paredes y los bordes del mapa son líneas negras continuas que bloquean movimiento y visión.
- Los huecos entre piezas no son casillas [FAQ].

### 2.5 Expansiones

Nombres en español según [COM] (probablemente los comerciales de Edge, sin verificar). Entre paréntesis, el
identificador del pack en Valkyrie, que también es la variable `#<id>` que vale 1 si el pack está activado
[VAL].

**Cajas** [EXP][WIKI][VAL]

Los héroes, lugartenientes y clases van con su nombre original; los monstruos, con el nombre que usa [COM]
cuando existe. Las traducciones de clases propuestas están en el glosario (§18.6), marcadas con (?).

| Expansión (código, id) | Tipo y año | Héroes | Clases | Monstruos | Lugartenientes | Estado y reglas nuevas | Losetas |
|---|---|---|---|---|---|---|---|
| Caja básica (DJ01, `D2EBase`) | 2012 | Ashrian, Avric Albright, Grisban the Thirsty, Jain Fairwood, Leoric of the Book, Syndrael, Tomble Burrowell, Widow Tarha | Knight, Berserker, Disciple, Spiritspeaker, Necromancer, Runemaster, Thief, Wildlander | Zombi, Arquero goblin, Araña de las cavernas, Moldeador de carne, Barghest, Ettin, Elemental, Meriodón, Dragón de las sombras | Lady Eliza Farrow, Lord Merick Farrow, Sir Alric Farrow, Belthir, Splig, Baron Zachareth | Envenenado, Enfermo, Inmovilizado, Aturdido. Agua, foso, lava, obstáculo | 1–30 |
| *Lair of the Wyrm*, «La guarida de la Sierpe» (DJ03, `LotW`) | Caja pequeña, 2012 | Reynhart the Worthy, High Mage Quellen | Champion (Guerrero), Geomancer (Mago) | Diablillo de fuego, Centinela híbrido | Valyndra | **En llamas** (*Burning*). Salas secretas, Rumores, monstruos inactivos, fichas de valor, Piedras invocadas | 31–35, S1 |
| *Labyrinth of Ruin*, «Laberinto de Perdición» (DJ04, `LoR`) | Caja grande, 2013 | Dezra the Vile, Logan Lashley, Pathfinder Durik, Ulma Grimstone | Apothecary, Beastmaster, Hexer, Treasure Hunter | Brujo goblin, Segador volucrix, Draco carroñero, Aracniura | Ariad, Queen Ariad, Raythen, Serena | **Maldito**. 2 dados verdes, elevación, maleza, elixires, maleficios, aliados, Piedra solar | 36–43 |
| *The Trollfens*, «La ciénaga del troll» (DJ05, `TT`) | Caja pequeña, 2013 | Augur Grisom, Roganna the Shade | Prophet, Stalker | Arpía, Gusano de plaga | Bol'Goreth | **Debilitado**. 1 dado verde, salas secretas, Rumores, ficha de clarividencia (*insight*), trampas, clase de Señor Supremo Infector | 43–49, S2 |
| *Shadow of Nerekhall*, «La sombra de Nerekhall» (DJ07, `SoN`) | Caja grande, 2014 | Orkell the Swift, Tinashi the Wanderer, Ravaella Lightfoot, Rendiel | Skirmisher, Bard, Shadow Walker, Conjurer | Enjambre de ratas, Cambiante, *Ironbound*, Mole del Ynfernael | Gargan Mirklace, Rylan Olliven, Tristayne Olliven, Verminous | **Sangrando**. Casillas peligrosas, elevación, rastrillo, Eventos de ciudad, influencia, ciudadanos corruptos, imágenes, canciones | 50–69 |
| *Manor of Ravens*, «La Mansión de los Cuervos» (DJ21, `MoR`) | Caja pequeña, 2014 | Alys Raine, Thaiden Mistpeak | Marshal, Bounty Hunter | Bandido, Espectro (*Wraith*) | Skarn | **Condenado**. Reliquias de monstruo y universales, sirvientes, Rumores, ficha de rastreo | 70–77 |
| *Mists of Bilehall*, «Las brumas de Castrohiel» (DJ40, `MoB`) | Caja pequeña, 2016 | — | — | Horror óseo, Reanimado, *Broodwalker* | Ardus Ix'Erebus, Kyndrithul, Zarihell | **Aterrorizado**. Casillas peligrosas, lodo, elevación, muros antiguos, terreno quebradizo, cartas de Impureza (*Tainted*) | 78–87 y entrada de pantano |
| *The Chains That Rust*, «Las cadenas del óxido» (DJ44, `TCTR`) | Caja pequeña, 2016 | — | 4 **híbridas**: Watchman, Monk, Battlemage, Steelcaster | *Marrow Priest*, Desposeído, Coloso tambaleante | Ardus Ix'Erebus, Kyndrithul, Zarihell; sirviente *Scourge* | Aterrorizado. Lodo, elevación, muros antiguos, terreno quebradizo, Impureza | 88–98 (más 78–79) |
| *Lost Legends* (DJ45, `LL`) | Solo cartas, 2019 | — | Elementalist, Soul Collector y 8 híbridas: Crusader, Heretic, Lorekeeper, Truthseer, Avenger, Raider, Ravager, Trickster | — | — | Objetos | — |
| *Conversion Kit* (DJ02; `CKD1E`, `CKAoD`, `CKToI`, `CKWoD`, `CKDQ`, `CKPromo`) | Kit de conversión, 2012 | 48 héroes de la 1ª edición | — | 25 grupos de la 1ª edición | — | Usa las figuras de la 1ª edición | — |

- Las clases que Valkyrie asigna a *Lost Legends* salen de sus datos [VAL]; el contenido exacto de esa caja,
  sin verificar.
- En la edición española se tradujeron algunos nombres propios: [COM] llama «Jain Bosquebello» a Jain Fairwood.
  Sin el reglamento español, no se puede saber cuáles; en los textos conviene usar el nombre original o el que
  ya use la comunidad.

**Colecciones de héroes y monstruos** (2014–2015) [WIKI][VAL]: cada una trae 4 héroes y 3 grupos de monstruos de
la 1ª edición con miniaturas nuevas, y 2 aventuras de Rumor.

| Colección (código, id) | Nombre en [COM] | Héroes | Monstruos |
|---|---|---|---|
| *Oath of the Outcast* (DJ26, `OotO`) | El juramento de la Exiliada | Trenloe the Strong, Laurel of Bloodwood, Elder Mok, Shiver | *Razorwing*, Hombre bestia, *Bane Spider* |
| *Crown of Destiny* (DJ27, `CoD`) | La corona del destino | Corbin, Lindel, Brother Gherinn, Jaes the Exile | Gigante, Bestia del caos, Escarabajo de lava |
| *Crusade of the Forgotten* (DJ28, `CotF`) | Cruzada de los Olvidados | Tahlia, Tetherys, Andira Runehand, Astarra | Gólem, Medusa, Hechicero |
| *Guardians of Deephall* (DJ29, `GoD`) | Guardianes de la Fortaleza Interior | Lord Hawthorne, Silhouette, Sahla, Mordrog | Dragón de la cripta, Sacerdote oscuro, Wendigo |
| *Visions of Dawn* (DJ30, `VoD`) | (sin dato) | Nara the Fang, Master Thorn, Ispher, Sir Valadir | *Manticore*, Ogro, Troll |
| *Bonds of the Wild* (DJ31, `BotW`) | Vínculos de la naturaleza | Lyssa, Challara, Ronan of the Wild, Vyrah the Falconer | Kóbold, Sabueso infernal, Elfa del abismo |
| *Treaty of Champions* (DJ32, `ToC`) | Tratado de los campeones | Krutzbeck, Jonas the Kind, Grey Ker, Zyla | Arquero esqueleto, Bruja cuervo, *Demon Lord* |
| *Stewards of the Secret* (DJ33, `SotS`) | Senescales del Secreto | Seer Kel, Tatianna, Okaluk and Rakash, Nanok of the Blade | Férrox, *Blood Ape*, Naga |
| *Shards of Everdark* (DJ34, `SoE`) | Esquirlas de Sombra Eterna | Arvel Worldwalker, One Fist, Karnon, Steelhorns | Sierpe de hielo, Minotauro oscuro, *Shade* |

**Otros productos** [WIKI][EXP][WEB-FFG][BLOG]

- **Packs de lugarteniente** (20; DJ09–DJ43; en Valkyrie, `DJ09`, `DJ10`…): figura del lugarteniente y, para el
  modo competitivo, un mazo de Conjura (*Plot*) con agentes (§13.2).
- ***Heirs of Blood***: campaña competitiva, publicada como libro de campaña; el reglamento de 2015 la presenta como
  la campaña de la caja (§15.1).
- **Aventuras cooperativas sin app**: *Forgotten Souls* («Almas olvidadas»), *Nature's Ire* («La ira de la
  naturaleza») y *Dark Elements* [COM].
- ***Road to Legend*** (app, 2016) y sus campañas:

| Campaña o modo | Qué es | Requisitos |
|---|---|---|
| *Rise of All Goblins* | Minicampaña tutorial de 4 aventuras más secundarias. | Gratis; caja básica [BLOG]. |
| *Kindred Fire* | Campaña completa: 8 aventuras de historia más secundarias; sigue a Lord Merick Farrow. | Gratis según [BLOG]; caja básica. |
| *Nerekhall: Seeds of Corruption* | Campaña de 7 aventuras de historia en la ciudad de Nerekhall; las decisiones se arrastran. | Gratis según [BLOG]; caja básica y *Shadow of Nerekhall*. |
| *The Delve* | Partidas sueltas de hasta 6 etapas generadas al azar (§15.8). | (sin verificar) |
| *Trials of Frostgate* | 4 pruebas rejugables con puntuación (2017). | Compra dentro de la app [WEB-FFG]. |

---

## 3. Preparación

### 3.1 Modo competitivo [RR]

**General**

1. Elegir la aventura (*quest*) y montar el mapa del encuentro 1 según el libro de aventuras, con sus puertas.
2. Repartir los papeles: el jugador con más experiencia suele ser el Señor Supremo; si no hay acuerdo, se sortea.
3. Separar las fichas por tipo, barajar el mazo de Búsqueda boca abajo y ordenar las cartas de Estado.

**Héroes**

1. Cada jugador héroe toma su hoja, figura y fichas de héroe (con 2 jugadores en total, uno lleva dos héroes).
2. Cada héroe elige una **clase de su arquetipo**; **cada clase solo la puede llevar un héroe**.
3. Se queda la **habilidad básica** (la que no cuesta PE) y el **equipo inicial**; el resto del mazo de clase se
   aparta para comprarlo después.
4. Los héroes se colocan donde diga la aventura, normalmente en la entrada.

**Señor Supremo**

1. Toma las cartas de Monstruo y de Lugarteniente del **Acto I** que pida la aventura (o del Acto II en el juego
   épico o la segunda mitad de una campaña).
2. Hace la preparación de la aventura (monstruos, fichas).
3. Baraja sus 15 cartas básicas de Señor Supremo y roba una por héroe.

### 3.2 Road to Legend [RTL][BLOG]

1. **Reserva.** Dados, cartas de Estado y de Búsqueda, fichas de daño, fatiga y Estado a mano. Del mazo de
   Búsqueda se retiran **«Nothing»**, **«Treasure Chest»** y, si hay expansiones, **«Secret Passage»**.
2. **Componentes apartados.** Cartas de Monstruo y Lugarteniente (solo del Acto I al principio), figuras, fichas
   de objetivo y de búsqueda, losetas y puertas, ordenados para encontrarlos rápido.
3. **App.** Se indica la colección que se tiene (la app usa solo esos productos), se elige «New Game», la campaña,
   la dificultad y una ranura de guardado. Para empezar se recomienda *Rise of All Goblins* en Normal, que incluye
   un tutorial.
4. **Grupo.** Cada jugador elige héroe (hoja, figura y 4 fichas de héroe) y clase. Del mazo de clase se queda
   los objetos iniciales y la habilidad **sin icono de experiencia**; el resto queda aparte. Se pone nombre al
   grupo y se confirma.
5. **Retomar una partida.** Se monta la reserva igual y, con «Load Game», las pantallas de entrenamiento e
   inventario dicen qué cartas tenía cada héroe.

### 3.3 Qué hace la app y qué hacen los jugadores [RTL]

| La app | Los jugadores |
|---|---|
| Ofrece las aventuras y prepara cada una: qué losetas, fichas y monstruos poner y dónde. | Montan el mapa, colocan figuras y fichas. |
| Revela el mapa por partes: al abrir puertas, derrotar monstruos o interactuar con fichas aparecen losetas, fichas, monstruos y reglas nuevas. | Avisan a la app de lo que hacen: abrir una puerta, buscar, interactuar, derrotar un grupo, quedar fuera de combate. |
| Decide qué grupo de monstruos se activa y qué hace cada uno. | Mueven a los monstruos y tiran sus dados siguiendo las instrucciones. |
| Lleva la moral, el oro, los PE, las compras, la fama y el calendario de la campaña. | Llevan la posición de las figuras, el daño, la fatiga, los Estados y las cartas, y lo apuntan si guardan a mitad de aventura. |
| Guarda la partida al empezar cada aventura y cada ronda, al acabar una aventura y al salir de una ciudad (hasta 5 partidas). | Deciden en grupo cuando un efecto admite opciones (§1). |

### 3.4 Dificultad [RTL][CRRG]

| | Normal | Difícil |
|---|---|---|
| Peligro (§15.7) | Sube poco a poco. | Sube más deprisa. |
| Oro inicial | 50 por héroe. | Ninguno. |
| *The Delve* | 1 PE inicial; algo de recuperación y se quitan Estados entre etapas; tiempo normal por etapa. | Sin PE inicial ni recuperación entre etapas; menos tiempo por etapa. |

- La dificultad se fija al empezar la campaña (o *The Delve*) y no se puede cambiar [CRRG].
- Los escenarios comunitarios suelen ofrecer «Normal» y «Difícil» con distinto oro y PE iniciales [COM].

### 3.5 Preparación en Valkyrie (resumen) [VAL]

- Se elige el escenario, después los héroes (por defecto entre 2 y 4) y después la **clase** de cada uno, con
  las clases híbridas (§11.6). Valkyrie da a cada héroe el equipo inicial de su clase.
- Valkyrie fija la **moral inicial** igual al número de héroes al terminar la elección.
- El resto de la preparación física (losetas, fichas, monstruos) la piden los eventos del escenario (§19).

---

## 4. Estructura de la ronda

### 4.1 La ronda en Road to Legend [RTL][VAL]

1. El grupo elige un héroe que aún no haya jugado esta ronda.
2. Ese héroe juega su turno completo (§4.2).
3. Los jugadores indican a la app que el turno ha terminado (en Valkyrie, **Fin del Turno** en el retrato del
   héroe).
4. La app activa **un grupo de monstruos al azar** de los que no se han activado (§4.3).
5. Se repite desde el paso 1.

- **Si un bando se queda sin turnos**, el otro juega los que le quedan seguidos: si no quedan grupos de
  monstruos, los héroes restantes juegan uno tras otro; si no quedan héroes, la app activa los grupos que
  falten.
- **Fin de ronda.** Cuando todos han jugado, se resuelven los efectos de final de ronda (peligros, refuerzos
  y otros que diga la aventura) y empieza la siguiente. La app guarda la partida al empezar cada ronda.
- **Héroes fuera de combate.** También tienen turno, aunque solo puedan Levantarse (§9.4). En Valkyrie hay
  que pulsar su Fin del Turno igualmente.
- **Habilidades «una vez por turno»** de los héroes no se pueden usar durante las activaciones de los monstruos
  [RTL].

### 4.2 El turno de un héroe [RR][FAQ][RTL]

| Paso | Qué ocurre |
|---|---|
| 1. Inicio del turno | Terminan los efectos que duraban «hasta el inicio de tu siguiente turno». Se resuelven los efectos «al inicio de tu turno», incluidas las pruebas de Envenenado, Enfermo y Maldito. Se **refrescan** las cartas agotadas. |
| 2. Equipar | El héroe cambia qué objetos lleva equipados, dentro de los límites (§14.4). Es el único momento en que se puede. |
| 3. Acciones | Hace **2 acciones** de la lista (§5), en cualquier orden; puede repetir la misma y renunciar a una o a las dos. En este paso puede sufrir fatiga para moverse y activar a sus familiares, antes o después de una acción pero no en medio. |
| 4. Fin del turno | Se resuelven los efectos de final de turno (En llamas, recuperación del descanso, fin de Inmovilizado, comprobación de Aterrorizado…). En el modo competitivo, el héroe da la vuelta a su carta de Referencia. |

- Las habilidades que dicen «durante tu turno» solo se usan en el paso 3; no al principio ni al final [FAQ].
- Un héroe que queda fuera de combate durante su propio turno acaba el turno en ese momento [FAQ].

### 4.3 Activación de un grupo de monstruos en Road to Legend [RTL][CRRG][VAL]

**La ventana de activación** muestra:

- Un **efecto especial** para esta activación (por ejemplo, «cada ataque gana +1 ♥»).
- La **lista de activación**: si van primero los líderes o los esbirros, y la lista de acciones, cada una con el
  icono de acción. En Valkyrie se ven en dos ventanas seguidas, «Maestro» y «Esbirro» [VAL-ES], o en una sola si
  el grupo solo tiene un tipo [VAL].

**Cómo actúa cada monstruo**

1. Los monstruos del tipo indicado (líderes o esbirros) se activan uno a uno; después, los del otro tipo. El
   orden entre figuras del mismo tipo lo deciden los jugadores (sin verificar; en el modo competitivo lo elige
   el Señor Supremo).
2. Cada monstruo recorre la lista **de arriba abajo** y hace la primera acción que pueda; sigue bajando hasta
   haber hecho **2 acciones**. Si llega al final con acciones pendientes, **vuelve al principio**.
3. Su activación termina al hacer 2 acciones o cuando no puede resolver ninguna de la lista.
4. Al terminar todos los de un tipo, se pulsa el botón de ese tipo («Maestro activado», «Esbirro activado»).

**Saltar acciones** (no cuentan como hechas)

- Un movimiento hacia donde el monstruo ya está.
- Una acción con objetivo si no hay ninguno válido a su alcance o sin línea de visión.
- Una acción que lo derrotaría antes de afectar a un héroe.
- Un ataque si ya ha atacado en esta activación.
- Divisar o Confrontar si está Inmovilizado.
- Cualquier acción que no tendría efecto.
- **No** se salta una retirada que no puede completar del todo: se aleja lo que pueda.

**Otras reglas**

- Hasta **2 acciones** por monstruo y solo **1 ataque** por activación, salvo habilidades como *Ravage*
  (§12.6).
- La ventana sale aunque ya no quede ninguna figura de uno de los dos tipos; se sigue como si se hubiera
  resuelto.
- Si un héroe interrumpe la activación (por ejemplo, con *Guard*), el monstruo vuelve a evaluar su objetivo
  después [CRRG].
- Cómo elegir objetivos y moverse: §12.5.

### 4.4 El modo competitivo, para comparar [RR][FAQ]

1. **Turnos de héroe.** Todos los héroes juegan su turno, uno tras otro, en el orden que decidan (en cada ronda
   eligen quién empieza y, al acabar cada uno, quién sigue).
2. **Turno del Señor Supremo:**
   1. Inicio: terminan sus efectos «hasta el inicio de tu siguiente turno», roba 1 carta de Señor Supremo,
      resuelve los efectos de inicio de turno y refresca sus cartas.
   2. Activa **cada grupo de monstruos una vez**, en el orden que quiera. Todos los monstruos de un grupo se
      activan seguidos, y debe activar todos los grupos aunque no hagan nada.
   3. Fin de ronda: los héroes ponen boca arriba sus cartas de Referencia.

### 4.5 Encuentros [RR][CRRG]

- Algunas aventuras competitivas tienen **dos encuentros**. Ganar el primero no gana la aventura; gana quien
  cumple la condición de victoria del último.
- Entre encuentros, los héroes conservan daño, Estados, fichas (valor, elixir…) y cartas de Búsqueda (las
  usadas siguen usadas), recuperan toda la fatiga, ponen la hoja boca arriba (recuperan la proeza heroica) y,
  si estaban fuera de combate, se levantan gratis. El mapa se monta de nuevo.
- En las campañas de RtL cada aventura tiene **un solo encuentro**, aunque la app vaya revelando el mapa.

---

## 5. Acciones

### 5.1 Acciones de los héroes [RR][RTL]

| Acción | Resumen |
|---|---|
| **Mover** | Gana puntos de movimiento igual a su Velocidad y los gasta casilla a casilla (§6). |
| **Atacar** | Ataque con un arma equipada o sin arma (§8). |
| **Usar una habilidad** | Usa una habilidad de una carta de Clase que tenga el icono de acción, pagando su fatiga. |
| **Descansar** | Al final del turno recupera **toda** su fatiga. |
| **Buscar** | Registra una ficha de Búsqueda adyacente o en su casilla. |
| **Levantarse** | Solo si está fuera de combate, y es lo único que puede hacer en ese turno (§9.4). |
| **Reanimar a un héroe** | Levanta a un héroe fuera de combate cuya ficha esté adyacente (§9.4). |
| **Abrir o cerrar una puerta** | Una puerta adyacente. En RtL solo se abren. |
| **Acción especial** | Cualquier efecto con icono de acción de cartas de Búsqueda, objetos, reliquias, proezas heroicas o reglas de la aventura (recoger un objetivo, hablar con un aldeano…). |

- Las 2 acciones pueden ser la misma (dos Mover seguidos dan el doble de Velocidad) [RR].
- Un efecto con icono de acción cuesta una acción; uno sin icono, no (por ejemplo, la *Prayer of Healing* del
  Discípulo no requiere acción) [FAQ].
- Una acción especial que incluye un movimiento o un ataque sigue costando **una sola** acción [RTL].

### 5.2 Mover [RR][FAQ]

- Gana tantos **puntos de movimiento** como su Velocidad y los gasta para entrar en casillas adyacentes; puede
  gastar menos.
- Puede interrumpir el movimiento para hacer otra acción y seguir moviéndose después (por ejemplo, con
  Velocidad 4: mover 2, atacar y mover 2).
- Detalles de movimiento, fatiga para moverse y terreno: §6.

### 5.3 Usar una habilidad [RR]

- Se usa una habilidad de Clase con icono de acción. Si cuesta fatiga, el héroe la sufre.
- No se puede usar si la fatiga superaría el Aguante del héroe (fatiga voluntaria, §9.2).
- Los ataques que hace una habilidad siguen las reglas normales de ataque.

### 5.4 Descansar [RR][RTL][FAQ]

- El héroe pone una ficha de héroe en su carta de Referencia (en RtL basta con recordarlo).
- Al **final de su turno**, retira la ficha y recupera **toda la fatiga**, aunque Descansar fuera su primera
  acción.
- Descansar también descarta **Debilitado** (§10). Grisban the Thirsty, además, descarta 1 Estado al descansar
  (errata) [FAQ].

### 5.5 Buscar [RR][RTL]

- El héroe debe estar **en la casilla de la ficha de Búsqueda o adyacente** a ella.
- **Competitivo:** se da la vuelta a la ficha, se descarta y el héroe roba una carta de Búsqueda (salvo que la
  ficha sea especial: entonces manda el libro de aventuras).
- **RtL:** se le indica a la app, que dice qué se encuentra: oro, una carta de Búsqueda, un objeto, una trampa…
  Cualquier elemento del mapa (ficha, puerta) se puede **examinar en la app en cualquier momento, sin gastar
  acción y sin estar adyacente**, antes de decidir.
- Las cartas de Búsqueda: §14.1.

### 5.6 Abrir o cerrar una puerta [RR][RTL][CRRG]

- Afecta a una puerta **adyacente**. Al abrirla se retira y se deja cerca de su sitio; al cerrarla se vuelve a
  poner.
- Algunas puertas están **cerradas con llave o selladas** y solo se abren como diga la aventura (con una llave,
  una prueba, una palanca…). Si una puerta que pidió una prueba se vuelve a cerrar, hará falta otra prueba.
- No se puede cerrar una puerta si un monstruo grande ocupa casillas a los dos lados.
- **En RtL las puertas abiertas no se vuelven a cerrar**, salvo que la app lo indique. Al pulsar la puerta en la
  app se lee su texto y luego se confirma o se cancela la apertura. Abrirla suele revelar losetas, fichas y
  monstruos nuevos.

### 5.7 Acciones especiales de la aventura [RR][COM]

- Las reglas de la aventura pueden añadir acciones propias, normalmente con la fórmula «como acción, un héroe
  adyacente a X puede…». Ejemplos de [COM]: hablar con un aldeano herido, accionar una palanca, cortar o quemar
  una telaraña, destruir una página, cargar una urna.
- Si no se dice lo contrario, la figura debe estar **en la casilla o adyacente** al elemento.
- **Aldeanos:** las reglas generales no les dan movimiento ni acciones. Cada aventura dice si son simples fichas
  (que se recogen, se escoltan o se pueden «capturar»), si se mueven con un héroe o por su cuenta, y si son figuras
  con Vida y Defensa propias, a menudo tratadas como héroes para los ataques de los monstruos (en *Castle Daerion*
  tienen 8 de Vida) [FAQ][COM].

### 5.8 Fichas de objetivo [RR][RTL]

- **Recoger:** acción especial, estando adyacente o en la misma casilla. La ficha se pone en la hoja de héroe o
  en la peana del monstruo.
- Solo una figura puede llevar una ficha; otra figura no se la puede quitar salvo que una regla lo diga.
- **Soltar:** cuesta una acción y se deja en una casilla adyacente.
- Si quien la lleva es derrotado, la ficha cae en su casilla.

### 5.9 Intercambiar y equipar [RR][RTL]

- **Competitivo:** durante una acción de Mover, un héroe puede intercambiar cartas de Objeto de la tienda,
  Reliquias y cartas de Búsqueda con un héroe adyacente, sin coste. Se puede dar sin recibir nada.
- **RtL:** el intercambio se hace tras una acción de Mover, con un héroe adyacente.
- Las cartas de Clase (incluido el equipo inicial) **no** se intercambian.
- Lo recibido se equipa al inicio del siguiente turno del receptor.

### 5.10 Acciones de los monstruos [RR][RTL]

| Acción | Resumen |
|---|---|
| Mover | Como los héroes, pero **sin** poder sufrir fatiga para moverse más. |
| Atacar | Con el tipo de ataque y los dados de su carta. |
| Acción de monstruo | Una habilidad de su carta con icono de acción (*Grab*, *Sweep*…). Si incluye un ataque, cuenta para su límite de ataques. |
| Abrir o cerrar una puerta | Una puerta adyacente (en RtL los monstruos siguen las instrucciones de la app). |
| Especial | Lo que permita la aventura. |

- Cada monstruo hace hasta **2 acciones** y solo **1 ataque** por activación (2 con *Ravage*) [RR][CRRG].
- «Acción de ataque» en un efecto es la acción Atacar normal, no una acción de monstruo que incluya un ataque
  [CRRG].

### 5.11 Ataque gratuito con dos héroes [FAQ][RTL]

- Si juegan **exactamente 2 héroes**, cada héroe puede hacer **una vez por turno un ataque normal sin gastar
  acción**, antes o después de cualquiera de sus acciones.
- No vale para acciones especiales que incluyan un ataque (como *Rage* o *Exploding Rune*).
- Si no hace ese ataque (por no querer o no poder), recupera **2 ♥** al final de su turno.

---

## 6. Movimiento y terreno

### 6.1 Puntos de movimiento [RR][FAQ][CRRG]

- La acción Mover da tantos **puntos de movimiento** como la Velocidad de la figura. Entrar en una casilla
  adyacente cuesta 1 punto; ciertos terrenos cuestan más (§6.6).
- Se puede mover en **diagonal**, también doblando esquinas y pasando entre dos casillas bloqueadas, salvo que
  las separe una pared (§7.3) o una línea de elevación unida a una pared.
- **Fatiga para moverse:** durante el paso de acciones de su turno, un héroe puede sufrir 1 de fatiga por cada
  punto de movimiento extra, sin pasar de su Aguante. Puede hacerlo durante una acción de Mover o antes o
  después de otra acción. Los monstruos **no** pueden [RR].
- Si los puntos vienen de varias fuentes, hay que decir de cuál se gasta. Los puntos sobrantes se pierden al
  acabar el turno o la activación [CRRG].
- Los puntos de movimiento ganados en el turno de otro jugador se gastan en ese momento o se pierden [FAQ].
- **«Mueve hasta tu Velocidad» y «mueve X casillas»** (efectos de cartas) no dan puntos de movimiento: se
  cuentan casillas [CRRG].
- **Movimiento forzado:** si un efecto mueve a una figura, el jugador activo decide cómo [CRRG]. Al mover a
  un héroe por un efecto, no se aplican las preferencias de terreno de los monstruos [CRRG].

### 6.2 Figuras y casillas ocupadas [RR][FAQ]

- Las figuras **no pueden entrar ni pasar** por casillas bloqueadas: las ocupadas por **enemigos** y los
  obstáculos.
- Sí pueden **atravesar figuras amigas** (héroes entre sí; monstruos entre sí), pero **no acabar** el
  movimiento en una casilla ocupada.
- Para **interrumpir** el movimiento (hacer otra acción en medio) la figura tiene que estar en una casilla
  vacía.
- Las fichas no impiden entrar en una casilla, salvo que la aventura lo diga (§7.4).
- La ficha de un héroe fuera de combate cuenta como casilla vacía para el movimiento [RR].

### 6.3 Interrumpir el movimiento [RR][FAQ][CRRG]

- Una acción de Mover se puede interrumpir para hacer otra acción y continuar después. Es la única acción que se
  puede interrumpir a voluntad; las demás solo cuando lo permite el efecto que se dispara.
- Se pueden encadenar dos acciones de Mover; si un efecto termina la acción de Mover después de dos de ellas,
  terminan las dos y se pierden los puntos que quedaran.
- La fatiga para moverse se declara en el momento exacto en que se gasta, junto con las casillas en las que
  se entra.

### 6.4 Monstruos grandes [RR][FAQ][CRRG][EXP][RTL]

**Tamaños** [EXP][VAL]

| Tamaño | Casillas | Monstruos de la caja básica | Rasgo en Valkyrie |
|---|---|---|---|
| Pequeño | 1 (1×1) | Zombi, Arquero goblin, Araña de las cavernas, Moldeador de carne | `small` |
| Mediano | 2 (1×2) | Barghest | `medium` |
| Enorme | 4 (2×2) | Ettin, Elemental, Meriodón | `huge` |
| Descomunal (?) | 6 (2×3) | Dragón de las sombras | `massive` |

- Cualquier figura que ocupe más de una casilla es **grande**.

**Movimiento**

- El monstruo «se encoge»: se elige una de las casillas que ocupa y se cuenta el movimiento desde ella como si
  fuera pequeño. Entra en cada casilla por la que cuenta y sufre el terreno de esas casillas como una figura
  pequeña.
- Al terminar (o al interrumpir) el movimiento, «se expande»: se coloca de forma que una de sus casillas sea la
  casilla final; puede girar. No puede acabar donde no cabe entero en casillas vacías.
- Expandirse **no es entrar** en las casillas nuevas: si se expande sobre lava no sufre daño [FAQ].
- Para interrumpir el movimiento con una acción (por ejemplo, un ataque) hay que **declarar la acción antes de
  expandirlo** [FAQ]. Si no cabe entero en el sitio, no puede interrumpir allí ni se pueden disparar allí
  efectos que interrumpan su movimiento [CRRG].
- **Foso:** solo le afecta si al acabar o interrumpir el movimiento **todas** sus casillas son de foso [FAQ].
- **Lava o casilla peligrosa:** solo queda derrotado si todas sus casillas son de lava [RR].
- **Agua:** si acaba adyacente al agua, puede colocar su peana en el agua sin penalización [RR].
- **Elevación:** le bloquea al moverse, pero puede expandirse sobre casillas separadas por una línea de
  elevación [EXP].
- **Maleza:** no puede ocupar casillas a ambos lados [EXP-LoR].

**Ataques**

- Necesita línea de visión (paso 1) y alcance (paso 3) a la misma casilla objetivo, pero puede medirlos desde
  casillas suyas distintas [CRRG].
- Quien ataca a un monstruo grande declara a qué casilla suya apunta [RR].

**En RtL**

- La app indica el movimiento de los monstruos por la ruta más barata en puntos. Un monstruo grande que va
  **hacia** un objetivo cuenta desde su casilla más cercana a él; si se **aleja**, desde la más lejana; al final
  se coloca lo más cerca (o lejos) posible [CRRG][EXP-FS].

### 6.5 Entrada, salida y borde del mapa [RR][CRRG]

- Los bordes del mapa y las paredes (líneas negras) bloquean el movimiento y la línea de visión.
- Solo se sale del mapa por las losetas de **entrada** y **salida**: la figura se mueve a una casilla del borde
  marcado y gasta **1 punto de movimiento** (o usa un efecto que la mueva 1 casilla).
- Si hay que colocar figuras en una loseta (por ejemplo, refuerzos en la entrada) y no caben, van a las casillas
  vacías más cercanas. Un monstruo grande debería quedar entero sobre la loseta indicada si es posible.

### 6.6 Tipos de terreno [RR][FAQ][EXP][RTL][CRRG]

| Terreno | Cómo se marca | Regla | Producto | Monstruos en RtL |
|---|---|---|---|---|
| **Obstáculo** | Borde rojo | Bloquea el movimiento y la línea de visión; no se cuenta a través de él. | Caja básica | — |
| **Agua** | Borde azul | Entrar cuesta **2 puntos** de movimiento. Si no se pueden pagar, no se entra. | Caja básica | La usan solo si así gastan menos puntos. |
| **Foso** (*pit*) | Borde verde | Al entrar se sufren **2 ♥**. Dentro no se pueden gastar puntos de movimiento: se sale con **una acción**, moviéndose a una casilla vacía adyacente (no al otro lado de una elevación), o con efectos que muevan sin gastar puntos. Desde el foso solo se ven las casillas adyacentes, y solo lo ven las figuras adyacentes; quien está dentro no bloquea la línea de visión a los de fuera. | Caja básica (regla rehecha en la FAQ) | Lo evitan. Si uno acaba dentro, su siguiente acción es salir a la casilla sin foso más cercana. Uno grande puede cruzarlo sin efecto si no acaba dentro. |
| **Lava** | Borde amarillo | Al entrar se sufre **1 ♥**. Quien **acaba su turno** dentro queda **derrotado**; un héroe pone su ficha en la casilla vacía sin lava más cercana. | Caja básica | Evitan la lava y las casillas peligrosas salvo que no les hagan daño; si el único camino pasa por ellas, no se mueven. |
| **Casilla peligrosa** (*hazard*) | Borde amarillo | Igual que la lava: todo lo que se diga de la lava vale para ellas y al revés. | *SoN*, *MoB* | Igual que la lava. |
| **Lodo** (*sludge*) | Borde naranja | Entrar cuesta **1 punto extra** (como el agua). Si una figura empieza su turno o activación con **todas** sus casillas en lodo, su Velocidad es 1 y no puede subir hasta que termine. | *MoB*, *TCTR* | Lo usan solo si es más barato y evitan acabar en él si pueden. |
| **Elevación** | Línea roja de puntos en el borde de la casilla | Bloquea el movimiento pero **no** la línea de visión; las casillas a ambos lados **siguen siendo adyacentes**. Un ataque cuerpo a cuerpo a través de ella da al defensor **1 dado negro más**, salvo que el ataque tenga *Reach* o *Extend*. Las figuras con *Fly* la cruzan. No se puede pasar en diagonal por la esquina donde se unen una elevación y una pared. | *LoR*, *SoN*, *MoB*, *TCTR* | Los de cuerpo a cuerpo atacan a través de ella; uno que ya está adyacente no se mueve para evitarla. |
| **Terreno quebradizo** (*crumbling terrain*) | Ficha | La casilla pierde sus otros terrenos (salvo obstáculos). El héroe que entra puede hacer una prueba de uno de dos atributos, a su elección (cuáles, sin verificar); si falla o no la hace, se retira la ficha y se aplica el terreno de debajo, y si ese terreno costaba movimiento extra, sufre 1 ♥ en su lugar. Mientras una figura ocupa la casilla, nadie más puede entrar. | *MoB*, *TCTR* | (sin verificar) |

- **Contar casillas** ignora el terreno que no es obstáculo [RR].
- **Vuelo** (*Fly*): la figura puede pasar por casillas de enemigos e ignorar los efectos del terreno por el que
  pasa, pero debe acabar en una casilla vacía y legal [WIKI].
- **Familiares que no son figuras** tratan todo terreno especial, salvo los obstáculos, como agua [RR].
- **Otros terrenos de aventura.** Los escenarios inventan elementos propios (escombros, telarañas, cadenas…)
  con reglas en su texto; por ejemplo, unos escombros que bloquean la línea de visión y cuestan 2 puntos de
  movimiento [COM]. Hay que explicar siempre sus reglas.

### 6.7 Puertas y elementos parecidos [RR][EXP][CRRG][RTL]

| Elemento | Aspecto | Paso | Línea de visión y contar | Adyacencia | Cómo se quita |
|---|---|---|---|---|---|
| Puerta | Cartón con peana (amarilla la normal, roja la cerrada con llave) | Bloquea | Bloquea | Rompe | Acción Abrir o cerrar una puerta (§5.6). En RtL solo se abre. |
| Puerta cerrada con llave o sellada | Roja | Bloquea | Bloquea | Rompe | Lo que diga la aventura. |
| Rastrillo (*portcullis*) | Gris | Bloquea | **No** bloquea: se ataca, se ve y se cuenta a través | Mantiene | Abrir o cerrar una puerta (cuenta como abrir una puerta). *SoN* |
| Muro antiguo (*old wall*) | Azul | Bloquea | Bloquea | Rompe | No se abre. *MoB*, *TCTR* |
| Maleza (*overgrowth*) | Verde | **Se atraviesa** | Bloquea la visión y los ataques a través (salvo efectos como *Blast* o *Fire Breath*); sí se cuenta a través | Mantiene | La acción Abrir o cerrar una puerta la retira (y no vuelve). *LoR* |

- Las puertas que una aventura «retira» o destruye no se pueden volver a cerrar [CRRG].

### 6.8 Hacia, alejarse, más cercano y más lejano [EXP-FS][RTL][CRRG]

Términos que usan las instrucciones de monstruos (y conviene usar en los textos):

| Término | Significado |
|---|---|
| Hacia X | Moverse para quedar más cerca de X (en su casilla si se puede, o en la más cercana alcanzable), por la ruta más barata. Cuenta el resultado final, no el camino: se puede alejar un momento si al final queda más cerca. |
| Alejarse de X | Cada paso debe aumentar la distancia a X; si no se puede, no se mueve. En RtL también cuenta el resultado final. |
| Más cercano / más lejano | La figura con menos (o más) casillas de distancia. |
| Divisar (*Spot*) | Moverse hacia la casilla más cercana que esté a **3 casillas o menos** del objetivo y con **línea de visión** a él; parar al llegar o al quedarse sin movimiento [RTL]. |
| Confrontar (*Engage*) | Moverse hacia el objetivo hasta quedar **adyacente** o sin movimiento. Si no se movería, la acción se salta. Un monstruo con *Reach* se detiene a **2 casillas** con línea de visión [RTL][COM]. |
| Retirarse (*Retreat*) | Gastar el movimiento que le quede alejándose del enemigo más cercano. Sin puntos, no se retira; nunca es obligatorio llegar lejos [RTL]. |

- La traducción de *Spot* como «Divisar» y de *Engage* como «Confrontar» es la de [COM] (parece la de la app en
  español); se recomienda mantenerla.

---

## 7. Línea de visión, alcance, adyacencia y casillas vacías

### 7.1 Línea de visión [RR][FAQ][CRRG]

- Hay línea de visión si se puede trazar una **recta sin interrupciones** desde **cualquier esquina** de la
  casilla de la figura hasta **cualquier esquina** de la casilla objetivo. La elige el atacante.
- **La bloquean:** las casillas bloqueadas (con una figura o un obstáculo), los bordes del mapa y las paredes,
  las puertas, los muros antiguos y la maleza. También la bloquea una recta que **recorre el borde** de una
  casilla bloqueada.
- **No la bloquea** que la recta solo **toque la esquina** de una casilla bloqueada o de una pared.
- La recta no puede atravesar la casilla de quien la traza ni la del objetivo: debe llegar a una esquina de la
  casilla objetivo sin cruzarla [FAQ].
- **Las casillas adyacentes siempre tienen línea de visión** entre sí (salvo a través de maleza), pero dos
  casillas separadas por una pared **no** son adyacentes ni se ven aunque compartan una esquina [RR][FAQ].
- No hay límite de distancia. Es mutua, salvo efectos concretos (*Eagle Eyes* del Wildlander, *Lithesome*,
  la habilidad de Seer Kel) [CRRG].
- **Figuras grandes:** se traza desde cualquier esquina de cualquiera de sus casillas, sin atravesar sus
  propias casillas [CRRG].
- **Fosos:** §6.6.
- Un héroe **fuera de combate** no bloquea la línea de visión [RR].

### 7.2 Contar casillas y «a X casillas o menos» [RR][FAQ][CRRG]

- Se cuenta el camino más corto de casillas adyacentes desde la casilla de origen (que vale 0) hasta la de
  destino.
- Se **ignora** el terreno que no es obstáculo y las **figuras** (no bloquean la cuenta).
- **No** se cuenta a través de puertas cerradas, paredes, bordes del mapa, obstáculos ni muros antiguos. Sí a
  través de maleza y rastrillos.
- Un efecto «a X casillas» **no** exige línea de visión salvo que lo diga [RR].
- Para un monstruo grande, el jugador activo elige desde cuál de sus casillas se cuenta [CRRG].

### 7.3 Adyacencia [RR][FAQ][CRRG]

- Dos casillas son adyacentes si comparten un **lado o una esquina**.
- **No** lo son si las separa una pared, un borde del mapa, una puerta cerrada o un muro antiguo.
- **Sí** lo siguen siendo a través de una línea de elevación, de maleza o de un rastrillo.
- Las entradas de las salas secretas no son adyacentes, pero se puede pasar de una a otra como si lo fueran
  (§15.4).

### 7.4 Casillas vacías y ocupadas [RR][CRRG]

- Una casilla **vacía** no tiene figuras y no bloquea movimiento ni visión. Las **fichas no ocupan** la casilla
  salvo que se diga: las de búsqueda, objetivo y héroe fuera de combate la dejan vacía; las de aldeano también,
  salvo que la aventura las trate como figuras (lo que hacen muchas).
- Una casilla **bloqueada** tiene una figura o un obstáculo.
- Algunas aventuras convierten fichas en obstáculos o en figuras («esta ficha bloquea el movimiento y la línea
  de visión») [COM]: hay que decirlo siempre en el texto.

### 7.5 Alcance de un ataque a distancia [RR][CRRG]

- Se suman los números de alcance de todos los dados (más modificadores) y se cuentan las casillas hasta el
  objetivo (§7.2). Si el alcance es **menor**, el ataque falla.
- Para atacar a distancia a una figura **adyacente** hace falta al menos **1 de alcance**.
- Los ataques cuerpo a cuerpo no miran el alcance (salvo efectos como *Stealthy*, §8.7).

---

## 8. Ataques

### 8.1 Pasos del combate [RR][CRRG]

1. **Declarar arma y objetivo.**
   - Se elige un arma equipada, una carta de Búsqueda que sea arma o las **manos desnudas** (solo el dado azul,
     cuerpo a cuerpo).
   - El objetivo es una casilla ocupada por un enemigo: adyacente si es cuerpo a cuerpo, o en línea de visión si
     es a distancia. Ante un monstruo grande, se dice qué casilla suya.
   - Solo se aplican las habilidades del arma elegida; los requisitos «al elegir objetivo» se comprueban aquí.
2. **Tirar los dados.** Atacante y defensor tiran a la vez; si hay varios defensores, cada uno tira su defensa
   por separado. Las repeticiones de tirada se hacen ahora. **Una X en el dado azul es un fallo** y el ataque
   termina.
3. **Comprobar el alcance** (solo a distancia). Si no llega, el atacante puede gastar aumentos en habilidades
   que den alcance; si aun así no llega, el ataque falla. En este paso no se usan otras habilidades de aumento.
4. **Gastar aumentos** (§8.4).
5. **Infligir daño.** Cada escudo del defensor anula 1 ♥; el resto es el daño que sufre. Hacer 0 de daño **no**
   es fallar. Si el daño alcanza la Vida, la figura queda derrotada (§9.4). Con varios afectados, el jugador
   activo decide el orden.

- Cada figura puede verse afectada **una sola vez** por un mismo ataque [CRRG].
- Infligir daño o tirar dados fuera de un ataque **no** es un ataque [CRRG].
- Si el atacante es derrotado a mitad del ataque, el ataque se resuelve en ese momento sin más pasos [CRRG].

### 8.2 Tipos de ataque [RR][CRRG]

| Tipo | Objetivo | Notas |
|---|---|---|
| **Cuerpo a cuerpo** | Casilla adyacente | No mira el alcance. Con *Reach*, hasta 2 casillas con línea de visión. |
| **A distancia** | Cualquier casilla en línea de visión | Necesita alcance suficiente (§7.5). |
| **Manos desnudas** | Adyacente | Solo el dado azul; cuenta como cuerpo a cuerpo. Se puede elegir aunque se lleven armas. |

- **«Mágico» no es un tipo de ataque**, sino un **rasgo** de las armas (*Magic*, *Rune*, *Staff*…): las armas
  mágicas suelen ser a distancia, y algunas habilidades exigen un arma de cierto rasgo [RR][CRRG].
- Los monstruos atacan con el tipo y los dados de su carta [RR].

### 8.3 Fallos [RR][CRRG]

- Hay fallo si sale la X, si falta alcance tras el paso 3 o si no se pagan los aumentos que exige *Shadow*
  (§8.7).
- Un ataque fallado termina sin más pasos: no se gastan aumentos ni se recupera fatiga con ellos.

### 8.4 Aumentos [RR][CRRG][RTL]

- Cada aumento (`{surge}`) sacado se gasta en **una** habilidad de aumento del arma, la carta o la habilidad.
- **Cada habilidad de aumento se usa una vez por ataque**; dos habilidades distintas con el mismo efecto pueden
  usarse las dos.
- Sus efectos se aplican a todo el ataque y a todas las figuras afectadas.
- **Recuperar fatiga:** un héroe que ataca puede gastar **1 aumento sobrante** para recuperar 1 fatiga, una vez
  por ataque. Los monstruos no.
- Las habilidades de aumento solo funcionan durante un ataque, salvo que digan otra cosa.
- **Estados por aumento:** solo se aplican si el ataque hace **al menos 1 ♥** tras la defensa a esa figura
  [RR][FAQ].

**Efectos de aumento habituales** [RR][CRRG][WIKI][COM]

| Efecto (inglés) | En [COM] | Qué hace |
|---|---|---|
| +X ♥ | +X `{heart}` | Suma X de daño. |
| +X alcance (*Range*) | Alcance | Suma X al alcance. |
| *Pierce X* | Perforante X | Ignora X escudos de la defensa. Varios valores se suman. |
| *Blast* | Explosión | Afecta también a todas las casillas adyacentes al objetivo (§8.6). |
| *Poison*, *Disease*, *Immobilize*, *Stun* | Veneno, Enfermedad… | El objetivo queda Envenenado, Enfermo, Inmovilizado o Aturdido. |
| *Curse*, *Burn*, *Bleed*, *Doom*, *Terrify*, *Weaken* | Maldición, Hemorragia… | Ponen los Estados de las expansiones (§10). |
| *Mend X* | Cerrar heridas X | El monstruo recupera X ♥. |
| *Knockback* | Derribo | Se retira al objetivo y se coloca en cualquier casilla vacía a 3 o menos de la suya; cuenta como haber entrado en ella. |
| *Fire Breath* | Aliento de fuego | Afecta a un camino de 4 casillas desde el objetivo, en cualquier dirección y pudiendo girar; cada figura del camino tira su defensa [FAQ][WIKI]. |
| *Sorcery X* | Hechicería X | Tras la tirada, convierte hasta X de alcance en ♥ o al revés [EXP-MoB]. |

- «Robar vida» no es una palabra clave general de Descent: lo más parecido son habilidades concretas, como *Leech*
  (§12.6), o aumentos de «recupera 1 ♥» como el que da Avric Albright a los héroes cercanos [WIKI].

### 8.5 Defensa [RR][EXP][CRRG]

- Los héroes tiran el dado de su hoja (normalmente gris) más los de su armadura u otros efectos; los monstruos,
  los de su carta.
- **Elevación:** quien recibe un ataque cuerpo a cuerpo a través de una línea de elevación añade 1 dado negro
  (salvo *Reach* o *Extend*) [EXP].
- **Debilitado** quita 1 escudo de cada tirada de defensa (§10).
- Los efectos que mejoran «los dados de defensa» no se aplican a las pruebas de atributo, que usan dados de
  defensa pero no son defensa [RR][CRRG].

### 8.6 Ataques de área y con varios objetivos [RR][FAQ][RTL][CRRG]

- **Explosión** (*Blast*): afecta al objetivo y a **todas las casillas adyacentes**, amigos o enemigos. Solo el
  objetivo necesita línea de visión y alcance. Se tira un ataque y cada afectado tira su defensa. Cada figura se
  afecta una vez.
- **Varios objetivos** (*Sweep*, *Fire Breath*, la proeza de Leoric…): una sola tirada de ataque, una defensa
  por figura. *Sweep* afecta a cada otra figura a 2 casillas o menos y con línea de visión del monstruo [FAQ].
- **Estados en ataques de área:** cada figura debe sufrir al menos 1 ♥ tras **su** defensa para recibirlo [FAQ].
- **En RtL, contra monstruos:** si un ataque afecta a varios monstruos, el objetivo principal sufre el daño
  completo y los demás la **mitad, redondeando hacia arriba, antes de restar sus escudos** [RTL].

### 8.7 Palabras clave de ataque y defensa [RR][CRRG][WIKI][COM]

| Clave (inglés) | En [COM] | Qué hace |
|---|---|---|
| *Blast* | Explosión | §8.6. |
| *Pierce X* | Perforante X | Ignora X escudos; acumulable. |
| *Reach* | Gran alcance | Ataque cuerpo a cuerpo contra una figura a 2 casillas o menos, con línea de visión. En RtL, al Confrontar, el monstruo se detiene a 2 casillas con línea de visión. |
| *Extend* | (sin dato) | Habilidad de monstruo: puede atacar a una figura a 3 casillas o menos y en línea de visión. |
| *Stealthy* | Sigiloso | Quien ataca a esta figura necesita **3 de alcance más** de lo normal o falla; afecta también al cuerpo a cuerpo (que pasa a necesitar 3) [FAQ]. |
| *Shadow* | Sombra | Un héroe adyacente que la ataque debe gastar 1 aumento al declarar el ataque o falla. |
| *Night Stalker* | (sin dato) | Si lo ataca un héroe no adyacente, tira 1 dado marrón más de defensa. |
| *Fly* | (sin dato) | §6.6. |

### 8.8 Ataques de los monstruos en RtL [RTL][CRRG][EXP-FS][COM]

- **Objetivo:** el que diga la acción («ataca al héroe adyacente con menos Vida restante», «al héroe con más
  Aguante a 5 casillas o menos»…). Los objetivos sin línea de visión se ignoran y se pasa al siguiente válido.
  Empates: el más cercano; si persiste, deciden los jugadores [RTL].
- **Aumentos:** se gastan en el orden que muestra el panel de información del monstruo (en [COM]: «Los X gastan
  `{surge}` en el siguiente orden: …»). Prioridades generales:
  1. Los que evitan un fallo (alcance, *Shadow*).
  2. Los que pueden dejar fuera de combate a un héroe.
  3. Nunca los que no tendrían efecto (por ejemplo, envenenar a quien ya lo está).
  4. Sin panel, los que hagan más daño.
- Un aumento que pide más de un `{surge}` de los que hay, o que no tendría efecto, se salta.
- En las aventuras cooperativas sin app [EXP-FS] el orden es: los que exijan habilidades de héroes, alcance,
  especiales útiles, *Pierce* (solo si el objetivo sacó escudos) y daño (el de mayor bonificación primero).

### 8.9 Modificar tiradas [CRRG]

| Tipo | Ejemplos | Regla |
|---|---|---|
| Repetir | *Lucky Charm*, *Power Potion*, *Dark Fortune* | El resultado nuevo se queda. Repetir no crea una prueba nueva. |
| Cambiar el resultado | Proezas de Lindel y Tatianna | El jugador elige la cara. |
| Sumar o restar | *Mana Weave*, *Ghost Armor* | Se aplica al resultado final, después de repeticiones y cambios. |
| Sustituir el resultado | *Elven Cloak*, proeza de Krutzbeck | El resultado pasa a ser X escudos; lo que se sume o reste en respuesta se aplica normalmente. |

- Varios efectos que cambian o repiten se aplican en el orden en que se usan.
- Solo se pueden usar en la situación que digan (repetir dados de defensa vale en ataques, no en pruebas).

---

## 9. Vida, Aguante, fatiga, fuera de combate y moral

### 9.1 Daño y Vida [RR][CRRG]

- El daño se marca con fichas de daño (`{heart}`). La **Vida** es el daño máximo que aguanta una figura.
- Cuando el daño iguala o supera la Vida, la figura queda **derrotada**; el exceso se ignora.
- «Vida restante» es la Vida menos el daño sufrido.
- Recuperar ♥ es descartar fichas de daño.

### 9.2 Fatiga y Aguante [RR][CRRG][RTL]

- La fatiga se marca con fichas de fatiga (`{fatigue}`). El **Aguante** es la fatiga máxima de un héroe.
- **Fatiga voluntaria** (para habilidades o movimiento): nunca puede superar el Aguante.
- **Fatiga forzada** por un efecto: si superaría el Aguante, cada punto que no cabe se sufre como **1 ♥**.
- Las figuras **sin Aguante** (monstruos, familiares que son figuras, aliados) sufren ♥ en vez de fatiga.
- Si el Aguante baja por debajo de la fatiga que se tiene, el exceso se queda hasta que se recupere.
- **Recuperar fatiga:** acción Descansar (toda, al final del turno), 1 aumento sobrante en un ataque, pociones y
  habilidades; entre encuentros se recupera toda.

### 9.3 Recuperar [RR]

- Recuperar ♥ o fatiga es quitar fichas. No se puede recuperar por encima de 0.
- Al acabar la aventura, en RtL, los héroes recuperan todo el daño y la fatiga [RTL].

### 9.4 Derrotado y fuera de combate [RR][FAQ][CRRG][RTL]

**Monstruos.** Un monstruo derrotado se retira del mapa (salvo que la aventura diga otra cosa). En RtL, al caer
el último de un grupo hay que pulsar «Derrotado» (*Defeat Group*) en su retrato (§12.4).

**Héroes: quedar fuera de combate** (*knocked out*)

1. El héroe sufre fatiga hasta su Aguante (y daño hasta su Vida si lo derrotó un efecto directo).
2. Su figura se sustituye por una **ficha de héroe** en su casilla (en una sala secreta, en la casilla de la
   entrada, aunque esté ocupada).
3. Descarta **todas sus cartas de Estado**.
4. Si era su turno, el turno **termina en el acto**.
5. Competitivo: el Señor Supremo roba 1 carta de Señor Supremo; con un mazo de Conjura puede ganar 1 amenaza en
   su lugar, una vez por héroe y aventura (§13.2). RtL: se pulsa **KO** en su retrato y la moral baja 1 (§9.5).

**Lo que puede y no puede hacer un héroe fuera de combate**

| Puede | No puede |
|---|---|
| Recibir efectos cuyo fin principal sea **recuperar ♥** (aunque otra figura esté en su casilla). | Usar habilidades ni beneficiarse de las pasivas, salvo que lo digan. |
| En su siguiente turno, **Levantarse** (no está obligado). | Intercambiar objetos. |
| Equipar objetos. | Recibir Estados. Es inmune a los ataques. |
| Activar a su familiar antes de levantarse, no después [FAQ]. | Sufrir fatiga por encima de su Aguante ni daño por encima de su Vida. |
| Levantarse gratis al acabar un encuentro (competitivo). | Recuperar fatiga si no recupera también ♥. |

- Su ficha cuenta como casilla vacía para el movimiento y no bloquea la línea de visión [RR].
- Los efectos que cuentan casillas hasta él las cuentan hasta su ficha [CRRG].

**Volver al juego** [RR][FAQ]

- **Levantarse** (acción, la única de ese turno): tira **2 dados rojos**, recupera tantos ♥ como corazones salgan
  y tanta fatiga como aumentos, y cambia la ficha por la figura (si la casilla está ocupada, en la casilla vacía
  más cercana que elija). Después **el turno acaba**: no puede sufrir fatiga para moverse ni usar habilidades.
- **Reanimar a un héroe** (acción de otro héroe adyacente a la ficha; también la pueden hacer los aliados): el
  caído hace la misma tirada y vuelve; en su siguiente turno actúa con normalidad.
- **Cualquier efecto** que le haga recuperar al menos 1 ♥ lo devuelve al mapa.
- Los monstruos no reaniman a nadie (tampoco a un lugarteniente que haya caído como un héroe) [CRRG].
- **Cartas de Impureza** (*MoB*, *TCTR*): mientras un héroe con su carta boca arriba está fuera de combate,
  solo puede recuperar ♥ de héroes sin impureza o de proezas heroicas [EXP].

### 9.5 Moral (Road to Legend) [RTL][BLOG][VAL]

- **Empieza** normalmente igual al **número de héroes**.
- **Baja 1** cada vez que un héroe queda fuera de combate. Levantarse **no** la devuelve.
- Si la moral está a **0** (calavera en el contador) y otro héroe queda fuera de combate, **los héroes huyen y
  pierden la aventura**.
- Se recupera sobre todo **visitando una ciudad** en la fase de campaña; otros efectos la suben o la bajan.
- **En Valkyrie** [VAL]:
  - La moral es la variable de campaña `$%morale`; se muestra en pantalla (nunca por debajo de 0).
  - Valkyrie la fija igual al número de héroes al terminar la elección de héroes.
  - El botón **KO** del retrato la baja 1; **Recuperar** devuelve al héroe al estado normal sin tocar la moral.
  - Si la moral baja de 0, se dispara el evento `NoMorale`; si el KO ocurre durante una activación de
    monstruos, se dispara al cerrarla.
  - ⚠️ Después de cada evento Valkyrie vuelve a mirar la moral: mientras siga por debajo de 0, `NoMorale`
    salta otra vez. El evento de derrota tiene que terminar la partida (`$end,=,1`) o
    poner la moral a 0, también antes de cambiar de aventura, porque la moral pasa a la siguiente
    (`formato-escenario.md` §18).
  - La derrota por moral, la recuperación de moral entre aventuras y cualquier otro cambio los programa el
    escenario.

---

## 10. Estados

### 10.1 Reglas generales [RR][FAQ][CRRG]

- **Cómo se ganan:** con habilidades de aumento (si el ataque hace al menos 1 ♥ tras la defensa) o con otros
  efectos (una prueba fallada, una trampa, un evento).
- **Sin duplicados:** una figura no puede tener dos copias del mismo Estado; ganarlo otra vez no hace nada.
- **Componentes:** los héroes toman la carta; los monstruos, una ficha junto a la figura. No están limitados por
  los componentes.
- **Para monstruos, aliados y familiares**, «turno» se lee «activación».
- **Cómo se quitan:** según la carta (prueba superada, acción, descanso, final del turno), al quedar fuera de
  combate o al ser derrotado, en la limpieza de la fase de campaña y al final de una aventura de RtL, y con
  efectos como *Cleansing Touch* o *Curse Doll*.
- **Fuera de combate:** se descartan todos y no se pueden recibir más.
- Las pruebas de los Estados se hacen **al inicio del turno** del afectado.

### 10.2 Lista de Estados [RR][WIKI][CRRG][EXP][RTL]

| Español [COM] | Inglés | Producto | Efecto | Se quita | Monstruos en RtL |
|---|---|---|---|---|---|
| **Envenenado** | *Poisoned* | Caja básica | Al inicio del turno, prueba de **Fuerza** [WIKI]: si falla, sufre 1 ♥ y lo conserva. | Superando la prueba (se descarta). | — |
| **Enfermo** | *Diseased* | Caja básica | Al inicio del turno, prueba de **Voluntad** [WIKI]: si falla, sufre 1 fatiga y lo conserva (un monstruo sufriría 1 ♥, por no tener Aguante: deducción). | Superando la prueba. | — |
| **Inmovilizado** | *Immobilized* | Caja básica | No puede hacer acciones de Mover ni sufrir fatiga para moverse; pierde los puntos de movimiento que tuviera. Sí puede usar efectos que lo coloquen en otra casilla o le den movimiento sin la acción de Mover [FAQ]. Si lo recibe en mitad de un Mover, ese Mover acaba. | Al **final de su turno**. | Se salta las acciones de movimiento (y Divisar/Confrontar) y lo descarta al final de su activación. |
| **Aturdido** | *Stunned* | Caja básica | La única acción que puede hacer es descartarlo; después puede hacer la segunda con normalidad. Si lo recibe tras su primera acción, la segunda debe ser descartarlo. No afecta a lo que no sean acciones ni corta un movimiento ya empezado. | Con una acción. | Su primera acción es descartarlo; si lo recibe a mitad de activación, termina la acción en curso y lo descarta si le queda una. |
| **En llamas** (?) | *Burning* | *LotW* | Al final de su turno, él y cada figura amiga adyacente sufren 1 ♥. Si se descarta antes de que acabe el turno, no hace daño. | Con una acción suya o de una figura adyacente. | Si no tiene otra cosa que hacer, lo descarta de sí mismo o de un monstruo adyacente (el de menos Vida restante). |
| **Maldito** | *Cursed* | *LoR* | No puede usar acciones de monstruo ni habilidades con icono de acción. Al inicio del turno, prueba de **Conocimiento** (según [WIKI]; sin verificar en la carta). | Superando la prueba. | Se salta las acciones especiales de su carta. |
| **Debilitado** | *Weakened* | *TT* | Quita 1 escudo de cada tirada de defensa y 1 ♥ de cada tirada de ataque. | Al hacer la acción Descansar (los monstruos y figuras tratadas como héroes no pueden, salvo que se diga). | (sin dato) |
| **Sangrando** | *Bleeding* | *SoN* | Por cada acción que no sea descartarlo, sufre 1 fatiga (un monstruo, 1 ♥, por no tener Aguante: deducción) [CRRG]. | Con una acción. | Si no tiene otra acción que hacer, la usa para descartarlo. |
| **Condenado** | *Doomed* | *MoR* | Cada vez que sufre 1 o más ♥, sufre 1 ♥ más (no es un golpe aparte). Sus ataques ganan un aumento que lo descarta. | Gastando ese aumento. | Si tras gastar los aumentos útiles le sobra uno, lo usa para descartarlo. |
| **Aterrorizado** | *Terrified* | *MoB* (y *TCTR*) | No puede gastar aumentos. | Al final de su turno, si no tiene ningún enemigo en línea de visión. | Al retirarse, acaba fuera de la línea de visión de los enemigos si puede. |

- Estados por número de cartas: cada caja trae 4 cartas de su Estado y 5 fichas para monstruos [EXP].
- Los nombres en español son los que usa [COM] (Envenenado, Enfermo, Inmovilizado, Aturdido, Maldito,
  Debilitado, Sangrando, Condenado y Aterrorizado). Para *Burning*, [COM] usa casi siempre «En llamas» y una vez
  «Quemado». Ninguno está confirmado en un reglamento de Edge.
- **Monstruos y pruebas:** los monstruos fallan siempre las pruebas de atributo [RR], así que un monstruo
  Envenenado, Enfermo o Maldito nunca se libra solo (sin verificar si RtL lo trata distinto).

### 10.3 Otros términos que no son Estados

- **Infectado** (fichas de infección del Señor Supremo Infector, *TT*), **maleficio** (*hexed*, fichas del
  Hexer, *LoR*), **rastreado** (*tracked*, Bounty Hunter, *MoR*) e **impureza** (*tainted*, *MoB*/*TCTR*) son
  marcadores de cartas concretas, no Estados [EXP].
- **Fuera de combate** no es un Estado: es la situación de un héroe derrotado (§9.4).

---

## 11. Héroes y clases

### 11.1 Características y atributos [RR][CRRG]

| Valor | Inglés | Para qué |
|---|---|---|
| **Velocidad** | *Speed* | Puntos de movimiento por acción de Mover. |
| **Vida** | *Health* | Daño que aguanta antes de quedar fuera de combate. |
| **Aguante** | *Stamina* | Fatiga máxima. |
| **Defensa** | *Defense* | Dados de defensa de la hoja (casi siempre 1 gris). |
| **Fuerza** | *Might* | Fuerza física, resistir golpes, venenos, agarres. |
| **Conocimiento** | *Knowledge* | Erudición e inteligencia: descifrar, recordar, magia. |
| **Voluntad** | *Willpower* | Entereza mental y disciplina: miedo, hechizos, tentaciones. |
| **Percepción** | *Awareness* | Destreza, reflejos y atención: trampas, emboscadas, ver lo oculto. |

**Los ocho héroes de la caja básica** [WIKI] (útil para calibrar pruebas)

| Héroe | Arquetipo | Velocidad | Vida | Aguante | Defensa | Fuerza | Conocimiento | Voluntad | Percepción |
|---|---|---|---|---|---|---|---|---|---|
| Ashrian | Sanador | 5 | 10 | 4 | gris | 2 | 2 | 3 | 4 |
| Avric Albright | Sanador | 4 | 12 | 4 | gris | 2 | 3 | 4 | 2 |
| Grisban the Thirsty | Guerrero | 3 | 14 | 4 | gris | 5 | 2 | 3 | 1 |
| Syndrael | Guerrero | 4 | 12 | 4 | gris | 4 | 3 | 2 | 2 |
| Jain Fairwood | Explorador | 5 | 8 | 5 | gris | 2 | 3 | 2 | 4 |
| Tomble Burrowell | Explorador | 4 | 8 | 5 | gris | 1 | 2 | 3 | 5 |
| Leoric of the Book | Mago | 4 | 8 | 5 | gris | 1 | 5 | 2 | 3 |
| Widow Tarha | Mago | 4 | 10 | 4 | gris | 2 | 4 | 3 | 2 |

- Velocidad 3–5, Vida 8–14 y Aguante 4–5. Los atributos van de 1 a 5 y suman 11. Los guerreros tienen Fuerza
  alta; los magos, Conocimiento; los sanadores, Voluntad; los exploradores, Percepción.

### 11.2 Pruebas de atributo [RR][CRRG][RTL]

1. Se tiran **1 dado gris y 1 dado negro**.
2. Se cuentan los **escudos**.
3. Si son **iguales o menos** que el valor del atributo, la prueba se **supera**; si son más, se **falla**.

- Probabilidades: §2.2.
- **Monstruos** líderes y esbirros: fallan siempre. **Lugartenientes**: hacen la prueba con sus atributos.
- **Figuras tratadas como héroes** (aliados aparte, que sí hacen pruebas) y **familiares**: fallan siempre
  [CRRG].
- Una figura sin valor en ese atributo falla siempre (no tener valor no es tener 0) [CRRG].
- Repetir dados no crea una prueba nueva; los efectos que mejoran la defensa no se aplican salvo que lo digan
  [CRRG].
- **En RtL**, cuando un monstruo elige como objetivo a una ficha atacable o a un familiar que no tiene el atributo
  de la prioridad, cuenta como 0 [CRRG].
- **Cómo se redactan** [COM]: «Cada héroe realiza una prueba de `{will}`. Cada héroe que falle sufre 2
  `{fatigue}`», «el héroe con menos `{awareness}` realiza una prueba de `{awareness}`». La app no tira dados: el
  texto debe decir qué pasa al superar y al fallar, y ofrecer botones si el resultado cambia la aventura (§19).

### 11.3 Habilidad de héroe y proeza heroica [RR][CRRG][RTL]

- **Habilidad de héroe:** propia de cada héroe, en la esquina superior derecha de la hoja; siempre activa o con su
  coste. No es una habilidad de clase.
- **Proeza heroica:** más potente, en la esquina inferior derecha. Se usa **una vez por encuentro** (en RtL, una
  vez por aventura); al usarla se da la vuelta a la hoja, que vuelve boca arriba al empezar el siguiente
  encuentro o aventura. Algunas cuestan una acción.
- **En RtL** algunas no tienen efecto o cambian: las proezas de Elder Mok y Seer Kel no hacen nada; Grey Ker puede
  suspender su turno, dejar que otro héroe juegue el suyo y terminarlo después [RTL].
- Ejemplos de la caja básica [WIKI]: Grisban descarta un Estado al descansar; Jain puede convertir daño de un
  ataque en fatiga; Leoric resta 1 ♥ a los ataques de monstruos a 3 casillas o menos; la proeza de Jain es mover
  el doble de su Velocidad y atacar con una sola acción.
- *Tainted* «Ordinary»: si otro héroe ya usó su proeza en este encuentro, no se puede usar la propia [EXP-MoB].

### 11.4 Arquetipos [RR][VAL]

| Arquetipo | Inglés | Clases de la caja básica | Papel |
|---|---|---|---|
| **Guerrero** | *Warrior* | Knight, Berserker | Cuerpo a cuerpo, aguantar golpes. |
| **Sanador** | *Healer* | Disciple, Spiritspeaker | Curar, quitar Estados, apoyo. |
| **Mago** | *Mage* | Necromancer, Runemaster | Ataques mágicos a distancia o de área, familiares. |
| **Explorador** | *Scout* | Thief, Wildlander | Movimiento, búsqueda, ataques a distancia. |

- Cada héroe solo puede elegir clases de **su arquetipo** (o una híbrida de su arquetipo: §11.6), y **cada clase
  la lleva un solo héroe** [RR][VAL].

### 11.5 Clases y equipo inicial [RR][EXP][VAL]

Equipo inicial según los datos de Valkyrie (`classes.ini`); los nombres de los objetos se dejan en inglés.

| Arquetipo | Clase | Producto | Equipo inicial |
|---|---|---|---|
| Guerrero | Knight | Caja básica | Iron Longsword, Wooden Shield |
| Guerrero | Berserker | Caja básica | Chipped Greataxe |
| Guerrero | Champion | *LotW* | Horn of Courage, Worn Greatsword |
| Guerrero | Beastmaster | *LoR* | Hunting Spear, Skinning Knife |
| Guerrero | Skirmisher | *SoN* | Jagged Handaxe, Rusted Handaxe |
| Guerrero | Marshal | *MoR* | War Hammer, Signet Ring |
| Sanador | Disciple | Caja básica | Iron Mace, Wooden Shield |
| Sanador | Spiritspeaker | Caja básica | Oak Staff |
| Sanador | Apothecary | *LoR* | Smoking Vials |
| Sanador | Prophet | *TT* | Iron Flail, Sage's Tome |
| Sanador | Bard | *SoN* | Traveler's Blade, Lute |
| Sanador | Soul Collector | *LL* | Harvester Scythe |
| Mago | Necromancer | Caja básica | Reaper's Scythe |
| Mago | Runemaster | Caja básica | Arcane Bolt |
| Mago | Geomancer | *LotW* | Stasis Rune |
| Mago | Hexer | *LoR* | Staff of the Grave |
| Mago | Conjurer | *SoN* | Prismatic Staff |
| Mago | Elementalist | *LL* | Staff of Conflux, Runeshard Cache |
| Explorador | Thief | Caja básica | Throwing Knives, Lucky Charm |
| Explorador | Wildlander | Caja básica | Yew Shortbow |
| Explorador | Treasure Hunter | *LoR* | Leather Whip, The Dead Man's Compass |
| Explorador | Stalker | *TT* | Black Widow's Web, Hunting Knife |
| Explorador | Shadow Walker | *SoN* | Feathered Hatchet, Tribal Cloak |
| Explorador | Bounty Hunter | *MoR* | Double Crossbow |

- **Estructura de un mazo de clase** [VAL]: una habilidad básica gratuita y 8 habilidades a la venta: 3 de 1 PE,
  3 de 2 PE y 2 de 3 PE.
- El equipo inicial **no se intercambia** y se vende por 25 de oro [RR].
- Las cartas de habilidad de clase se agotan, cuestan fatiga o una acción, según su texto [RR].

### 11.6 Clases híbridas [EXP-TCTR][CRRG][VAL]

| Clase híbrida | Arquetipo del héroe | Segunda clase de… | Producto |
|---|---|---|---|
| Watchman | Sanador | Explorador | *TCTR* |
| Monk | Explorador | Sanador | *TCTR* |
| Battlemage | Mago | Guerrero | *TCTR* |
| Steelcaster | Guerrero | Mago | *TCTR* |
| Crusader | Sanador | Guerrero | *LL* |
| Heretic | Sanador | Mago | *LL* |
| Lorekeeper | Mago | Sanador | *LL* |
| Truthseer | Mago | Explorador | *LL* |
| Avenger | Guerrero | Sanador | *LL* |
| Raider | Guerrero | Explorador | *LL* |
| Ravager | Explorador | Guerrero | *LL* |
| Trickster | Explorador | Mago | *LL* |

**Cómo se eligen**

1. El héroe elige una clase híbrida **de su arquetipo** y recibe su carta de habilidad básica.
2. Esa carta le hace elegir **una clase normal** (no híbrida) del **otro arquetipo** que indica.
3. Recibe la habilidad básica y el **equipo inicial** de esa segunda clase.
4. Al gastar PE puede comprar habilidades de los dos mazos, salvo las de **3 PE de la clase normal**.
5. **Su arquetipo no cambia**: un Guerrero con una clase de Mago sigue siendo Guerrero a todos los efectos.

- Cada mazo híbrido tiene la carta básica y 3 habilidades (de 1, 2 y 3 PE) [VAL].
- **En Valkyrie:** en la pantalla de clases, al pulsar una clase híbrida aparece la lista de clases del otro
  arquetipo; las clases ya elegidas por otros héroes salen en gris. En la ventana de habilidades, las de 3 PE de
  la segunda clase no aparecen [VAL].

### 11.7 Experiencia y habilidades [RR][RTL][CRRG][VAL]

- La **experiencia** se mide en **puntos de experiencia** (en [COM]: «PE»). Son de cada héroe: no se
  transfieren ni se juntan, y se pueden guardar.
- **Competitivo:** al final de cada aventura todos los jugadores (héroes y Señor Supremo) ganan 1 PE, más las
  recompensas de la aventura; se gastan en el paso 5 de la fase de campaña.
- **RtL:** se ganan como recompensa de las aventuras y se gastan en cualquier momento de la fase de campaña
  (**Entrenamiento**), sin que pase el tiempo. Una vez compradas, las habilidades no se cambian salvo que un
  efecto lo permita. En *Trials of Frostgate* se gastan al recibirlos.
- **Coste:** la habilidad básica es gratis; las demás cuestan lo que indica la carta (1, 2 o 3 PE).
- **En Valkyrie:** cada héroe tiene sus PE propios más los PE comunes de la variable de campaña `$%xp`, que
  valen para todos. La ventana de habilidades permite marcar y desmarcar compras dentro de los PE disponibles
  [VAL].

### 11.8 Familiares [RR][FAQ][CRRG]

- Son fichas (o figuras) que controlan ciertos héroes: el Reanimate del Necromancer, el Wolf del Beastmaster,
  las Summoned Stones del Geomancer, la Shadow Soul del Shadow Walker, Brightblaze de Challara, entre otros.
- **Activación:** una vez por ronda, en el turno de su héroe, antes o después de sus acciones (no en medio).
  Normalmente tienen una acción de Mover y lo que diga su carta.
- **Tipos:**
  - Los que **no son figuras** no se pueden atacar ni afectar salvo que se diga, no bloquean el paso ni la vista
    y tratan el terreno especial (salvo obstáculos) como agua.
  - Los **tratados como figuras** (y como héroes para ataques y habilidades): bloquean paso y vista, se pueden
    atacar, reciben Estados, fallan las pruebas y sufren ♥ en vez de fatiga.
  - Los **tratados como obstáculos** (Summoned Stone): se pueden atacar, pero no se atraviesan.
- No se colocan al preparar un encuentro: hay que invocarlos. No caen porque caiga su héroe.
- En RtL no les afectan los peligros ni las reglas de la aventura que hablan de «héroes» [RTL][FAQ].

### 11.9 Fichas de clase [EXP][CRRG]

| Ficha | Clase | Límite | Uso |
|---|---|---|---|
| Valor | Champion (*LotW*) | 12 | Las ganan y gastan sus habilidades; se conservan entre encuentros y se descartan al acabar la aventura. |
| Elixir | Apothecary (*LoR*) | 8 | Durante su turno, el héroe que tiene una puede descartarla para tirar 1 dado rojo y recuperar esos ♥. Se pueden intercambiar. |
| Maleficio (*hex*) | Hexer (*LoR*) | 20 | Un monstruo con alguna está «maldecido» (*hexed*); al atacarlo, cada ficha descartada suma 1 ♥. |
| Clarividencia (*insight*) | Prophet (*TT*) | 1 | Pasa de una hoja de héroe a otra; no se puede poner en un héroe fuera de combate. |
| Trampa | Stalker (*TT*) | 6 | Se colocan en el mapa; no bloquean; una por casilla. |
| Canción (melodía y armonía) | Bard (*SoN*) | 2 | Activan efectos de las cartas donde están. |
| Imagen | Conjurer (*SoN*) | 4 | Cuentan como figuras de héroe con los atributos del Conjurer y 1 dado gris; si sufren cualquier daño o fatiga, se descartan y el Conjurer sufre 1 ♥ y 1 fatiga. |
| Rastreo | Bounty Hunter (*MoR*) | 1 | Marca al monstruo rastreado. |

### 11.10 Aliados y figuras tratadas como héroes [EXP-LoR][FAQ][CRRG][RTL]

- **Aliados** (*LoR*; por ejemplo Raythen o Serena): personajes que se unen a los héroes en ciertas aventuras.
  Los controlan los héroes; se activan una vez por ronda, antes o después del turno de un héroe, con 2 acciones
  (solo 1 ataque): Mover, Atacar, Reanimar a un héroe, acción de aliado, abrir o cerrar una puerta o acción
  especial. Hacen pruebas como los héroes. Si caen, se retiran el resto del encuentro y recuperan todo al
  acabarlo.
- **Figuras tratadas como héroes** (personajes de una aventura, algunos familiares): les afectan los ataques, las
  habilidades de monstruos y héroes y las cartas que mencionan héroes, y el terreno como a los héroes; reciben
  Estados; fallan las pruebas; bloquean paso y vista. **No** les afectan las reglas de la aventura, los peligros,
  los eventos de viaje ni otros efectos de «héroes» salvo que lo digan.
- **En RtL**, los monstruos pueden elegir como objetivo a estas figuras y a las fichas atacables cuando su
  instrucción dice «héroe».

---

## 12. Monstruos

### 12.1 Grupos, líderes y esbirros [RR][CRRG][WIKI]

- Todos los monstruos de un mismo tipo en el mapa forman un **grupo** y se activan juntos, uno tras otro.
- **Esbirros** (*minions*, figura beige) y **líderes** (*masters*, figura roja). En [COM] el esbirro se llama a
  menudo «monstruo común» («Ettin común») y el líder, «líder»; Valkyrie muestra «Esbirro» y «Maestro» [VAL-ES].
- Cada tipo tiene carta del **Acto I** y del **Acto II**; en el Acto II son más fuertes.
- **Límite de grupo:** depende del número de héroes y está en el reverso de la carta. Ejemplos [WIKI]:

| Monstruo | 2 héroes | 3 héroes | 4 héroes |
|---|---|---|---|
| Zombi | 1 líder + 2 esbirros | 1 líder + 3 esbirros | 1 líder + 4 esbirros |
| Arquero goblin | 1 líder + 2 esbirros | 1 líder + 3 esbirros | 1 líder + 4 esbirros |
| Dragón de las sombras | 1 esbirro | 1 líder | 1 líder + 1 esbirro |

- Si un efecto dice que se ignore el límite, el tope es el número de figuras de ese tipo [CRRG].
- Todos los monstruos son amigos entre sí [CRRG].

### 12.2 Valores de ejemplo (Acto I / Acto II) [WIKI]

| Monstruo | Velocidad | Vida | Defensa | Ataque | Habilidades |
|---|---|---|---|---|---|
| Zombi esbirro | 3 | 3 / 5 | marrón | cuerpo a cuerpo, azul + amarillo | *Shambling*; aumentos: Enfermedad, +1 ♥ (+2 en el Acto II) |
| Zombi líder | 3 | 6 / 9 | marrón | cuerpo a cuerpo, azul + amarillo (+ rojo en el Acto II) | Lo mismo y *Grab* |
| Arquero goblin esbirro | 5 | 2 / 4 | gris | a distancia, azul + amarillo | *Scamper*, *Cowardly*; aumentos: alcance, ♥ |
| Arquero goblin líder | 5 | 4 / 6 | gris | a distancia, azul + amarillo (+1 amarillo en el Acto II) | *Scamper* |
| Dragón de las sombras esbirro | 3 | 6 / 8 | 2 grises (negro + gris en el Acto II) | cuerpo a cuerpo, azul + rojo (+1 rojo en el Acto II) | *Shadow*; aumento: +♥ |
| Dragón de las sombras líder | 3 | 9 / 10 | igual | igual | *Shadow*, *Fire Breath* |

- Un monstruo pequeño del Acto I aguanta 2–6 ♥; uno grande, 6–10 o más. Esto sirve para calibrar la Vida extra
  de un monstruo único (§12.7).

### 12.3 Rasgos [CRRG][VAL]

- Cada monstruo normal tiene **2 de los 10 rasgos** de terreno: Civilizado, Maldito, Frío, Edificio, Oscuridad,
  Montaña, Naturaleza (*Wilderness*), Cueva, Agua y Calor (*Hot*). Los lugartenientes y sirvientes no tienen; un
  agente toma los de su grupo.
- Las aventuras competitivas fijan algunos grupos y dejan **grupos abiertos**: el Señor Supremo elige cualquier
  tipo que comparta al menos un rasgo con los de la aventura. En RtL los elige la app entre la colección del
  grupo [CRRG][BLOG].
- Valkyrie añade rasgos propios para elegir monstruos al azar: tamaño (`small`, `medium`, `huge`, `massive`),
  tipo de ataque (`melee`, `ranged`) y otros (`undead`, `goblin`, `lieutenant`…) [VAL].

### 12.4 Colocación, refuerzos y derrota [RR][CRRG][RTL]

- Se colocan donde diga la aventura; si no caben, en las casillas vacías más cercanas a la loseta indicada. Los
  grandes, enteros en la loseta si se puede.
- **RtL:** la app muestra el icono de cada monstruo en su casilla exacta (borde rojo para el líder) o una casilla
  resaltada con un círculo que late; si está ocupada, se colocan lo más cerca posible. Primero los **líderes**
  y después los esbirros, **respetando el límite de grupo** salvo que la app diga lo contrario.
- Si un efecto (por ejemplo, un peligro) hace aparecer un grupo que ya está en el mapa, se ponen tantos como
  permita el límite, sin quitar los que hay [RTL].
- **Refuerzos:** monstruos que vuelven a entrar durante la aventura según sus reglas (por ejemplo, «al final de
  cada ronda, coloca 1 zombi en la entrada respetando el límite»). Si el lugar está bloqueado, van a la casilla
  vacía más cercana [CRRG][COM].
- **Derrota:** se retira la figura. En RtL hay que pulsar **«Derrotado»** (*Defeat Group*) en el retrato del grupo
  cuando cae el último; si un monstruo único cae antes que el grupo, se pulsa **«Único derrotado»** [RTL][VAL].
- El rastreador de monstruos de la app (en Valkyrie, la columna de retratos) ofrece también **«Forzar
  activación»**, para cuando la app lo pide o se olvidó un grupo, e **«Información»**, que muestra las
  aclaraciones y el orden de gasto de aumentos [RTL][VAL].

### 12.5 Activación en RtL: objetivos y movimiento [RTL][CRRG][COM]

- **Prioridades de objetivo** típicas: «el héroe más cercano», «el héroe con más Vida restante», «el que haya
  sufrido menos ♥», «el héroe con menos `{awareness}` a 5 casillas o menos», «el héroe adyacente con más
  Aguante». Ver la redacción en §18.11.
- **Empates:** el más cercano; si sigue el empate, deciden los jugadores.
- **Línea de visión:** si la acción la requiere, los objetivos sin ella se ignoran.
- **Movimiento:** Divisar, Confrontar y Retirarse (§6.8), por la ruta más barata; evitan fosos y terreno que los
  dañe, y solo usan agua o lodo si es más barato.
- **Estados:** §10.2.
- **Ejemplos de listas de activación** (formato de [COM], que imita la app):
  - `{action}` Confronta al héroe más cercano. `{action}` Ataca al héroe adyacente con menos Vida restante.
  - `{action}` Divisa al héroe más cercano. `{action}` Ataca a un héroe. A continuación se retira.
  - `{action}` Usa «Barrido» contra 2 o más héroes. `{action}` Ataca a un héroe.

### 12.6 Habilidades frecuentes de monstruos [WIKI][FAQ][CRRG]

Resumen; el texto exacto está en cada carta. Nombre español de [COM] cuando existe; (?) si es una propuesta.

| Inglés | Español | Resumen |
|---|---|---|
| *Shambling* | Torpe (?) | Como mucho una acción de Mover por activación. |
| *Grab* | Agarrar | Acción: un héroe adyacente hace una prueba de Fuerza; si falla, queda Inmovilizado. |
| *Scamper* | Escabullirse (?) | Puede atravesar casillas ocupadas por héroes. |
| *Cowardly* | Cobarde (?) | Solo gasta aumentos si está a 3 casillas o menos de un líder o un lugarteniente. |
| *Shadow* | Sombra | §8.7. |
| *Fire Breath* | Aliento de fuego | §8.4. |
| *Night Stalker* | (sin dato) | §8.7. |
| *Ravage* | Frenesí (?) | Puede hacer 2 ataques en su activación. |
| *Fly* | (sin dato) | §6.6. |
| *Stealthy* | Sigiloso | §8.7. |
| *Knockback* | Derribo | §8.4. |
| *Web* | Telaraña | Un héroe adyacente debe pagar 1 fatiga más para salir de su casilla. |
| *Mend X* | Cerrar heridas X | Recupera X ♥. |
| *Sweep* | Barrido | Ataque contra cada otra figura a 2 casillas o menos y en línea de visión [FAQ]. |
| *Sorcery X* | Hechicería X | §8.4. |
| *Morph* | Metamorfo | La Bestia del caos usa los dados de la figura a la que ataca [FAQ][COM]. |
| *Throw* | Arrojar | El Ettin lanza a una figura (detalle sin verificar). |
| *Reach* | Gran alcance | §8.7. |
| *Extend* | (sin dato) | §8.7. |
| *Leech* | (sin dato) | Según [WIKI], un héroe adyacente hace una prueba de Fuerza; si falla, pierde fatiga según un dado amarillo y el monstruo recupera ♥ (detalle sin verificar). |

### 12.7 Monstruos únicos y personalizados [RTL][CRRG][VAL]

- **RtL:** un monstruo **único** tiene nombre propio, a menudo **Vida extra** (indicada en su retrato) y reglas
  especiales que la app muestra al colocarlo y en su panel de información. Puede formar parte de un grupo y se
  activa con él; si cae antes que el grupo, se pulsa «Único derrotado»; «Derrotado» retira al grupo entero,
  único incluido. La app dice si es líder o esbirro; si no, es líder si el límite lo permite.
- **Valkyrie:** un *Spawn* puede marcarse como único, con Vida extra fija y por héroe; un monstruo personalizado
  (*CustomMonster*) cambia nombre, imagen, Vida (también por héroe), texto de información y activaciones
  (§19).

### 12.8 Monstruos inactivos [EXP-LotW][CRRG]

- Algunas aventuras declaran **inactivo** un grupo (ficha de monstruo inactivo en su carta): no se activa ni le
  afectan las cartas de Señor Supremo, pero bloquea paso y vista y se le puede atacar (tira defensa).
- Si sufre **cualquier daño**, salvo que la aventura diga otra cosa, el grupo se activa.
- En Valkyrie no hay un estado «inactivo»: se programa con eventos (un *Spawn* puede aparecer ya «activado»
  para esa ronda) [VAL].

---

## 13. Lugartenientes y agentes

### 13.1 Lugartenientes [RR][CRRG][EXP][VAL]

- Personajes poderosos del Señor Supremo. Cuentan como **monstruos**, pero cada uno es **su propio grupo** y no
  es ni líder ni esbirro.
- Su carta (una por acto) da atributos, dados de ataque y una Velocidad, Vida y Defensa que **cambian con el
  número de héroes**.
- **Hacen pruebas de atributo** como los héroes.
- Pueden empuñar la cara de Señor Supremo de **una** reliquia (excepción: *Sun's Fury*, de la Piedra solar).
- En algunas aventuras caen «fuera de combate» como un héroe: descartan Estados, salen del mapa y pueden
  levantarse en su siguiente activación, que no termina por ello. Los monstruos no los reaniman.
- **Base** (caja básica): Lady Eliza Farrow, Lord Merick Farrow, Sir Alric Farrow, Belthir, Splig y Baron
  Zachareth. **Expansiones:** Valyndra (*LotW*); Ariad, Queen Ariad, Raythen y Serena (*LoR*); Bol'Goreth
  (*TT*); Gargan Mirklace, Rylan Olliven, Tristayne Olliven y Verminous (*SoN*); Skarn (*MoR*); Ardus
  Ix'Erebus, Kyndrithul y Zarihell (*MoB*, *TCTR*) [VAL].
- **En RtL y en Valkyrie** los lugartenientes aparecen como enemigos únicos con activaciones propias (solo de
  «Maestro») [VAL]. La caja trae fichas de lugarteniente; las figuras vienen en los packs (§2.5).

### 13.2 Mazos de Conjura y agentes (solo competitivo) [EXP][FAQ]

- Con un pack de lugarteniente, el Señor Supremo puede elegir al empezar una campaña un **mazo de Conjura**
  (*Plot deck*): una carta básica gratis y otras que compra con **amenaza** (*threat*).
- **Gana amenaza:** 1 al caer cada héroe en lugar de robar carta (una vez por héroe y aventura); 1 al acabar cada
  aventura (2 si la gana); 3 por cada PE que gaste en ello; 1 al jugar un Rumor de aventura.
- Al gastar amenaza para usar una carta, cada ficha se gira por su cara de **fortuna** y va a la hoja del héroe
  con menos fortuna. Los héroes gastan fortuna para recuperar 1 (♥ o fatiga: el icono no se pudo leer), repetir un dado, hacer una
  acción extra (2 fichas, una vez por ronda) o ver una carta más en la tienda (2 fichas).
- **Agentes:** ciertas cartas de Conjura convierten un grupo abierto en un grupo con el lugarteniente como
  **agente**: actúa como un líder de su grupo, toma sus rasgos, no se coloca como refuerzo ni empuña reliquias, y
  si cae vuelve a la mano de Conjura. No se invoca en Interludios ni Finales.
- Las cartas de Conjura no pueden elegir como objetivo a aliados, familiares ni figuras tratadas como héroes
  [FAQ].

### 13.3 Sirvientes [EXP-MoR][EXP-TCTR]

- Con las clases de Señor Supremo *Unkindness* (*MoR*) y *Soulbinder* (*TCTR*), las cartas de **Invocación** no
  van al mazo: se quedan en juego y colocan una ficha de **sirviente** (Bandada de cuervos, *Scourge*…) que actúa
  como un esbirro en su propio grupo, con su carta.

---

## 14. Búsqueda, objetos, oro, reliquias y tienda

### 14.1 Cartas de Búsqueda [RR][WIKI][RTL][EXP]

| Carta | Copias | Efecto (resumen) | En RtL |
|---|---|---|---|
| *Health Potion* | 3 | Acción: recupera ♥ el héroe o uno adyacente (cuánto, sin verificar: la wiki dice «todo»). | Sí |
| *Stamina Potion* | 3 | Durante su turno: recupera toda la fatiga el héroe o uno adyacente. | Sí |
| *Curse Doll* | 1 | Acción: descarta un Estado del héroe o de uno adyacente. | Sí |
| *Fire Flask* | 1 | Acción: ataque a distancia con este objeto; aumento: Explosión. | Sí |
| *Power Potion* | 1 | Tras atacar, repetir algunos o todos los dados de ataque. | Sí |
| *Warding Talisman* | 1 | Tras tirar defensa, +2 escudos. | Sí |
| *Treasure Chest* | 1 | Se descarta al momento para robar un Objeto de la tienda al azar del acto actual. | **Se retira** |
| *Nothing* | 1 | No hace nada. | **Se retira** |
| *Secret Passage* | 1 (*LotW*, *TT*; sustituye a *Nothing*) | Pone una entrada de sala secreta en la casilla del héroe (§15.4). | **Se retira** |

- Una carta usada se pone boca abajo y se conserva hasta el final de la aventura (entre encuentros sigue
  usada) [RR].
- **Competitivo:** al final de la aventura, el grupo cobra el **valor en oro** de todas las cartas de Búsqueda
  conseguidas (aunque se usaran) y las devuelve al mazo [RR].
- **RtL:** las cartas de Búsqueda no se venden y se **descartan al final de cada aventura** [RTL]. El oro de la
  búsqueda lo da la app directamente.

### 14.2 Objetos de la tienda [RR][VAL]

- Hay un mazo del **Acto I** (en la caja básica, 20) y otro del **Acto II** (14), más los que añaden las
  expansiones.
- **Anatomía:** nombre, tipo de ataque (si es arma), iconos de equipo, dados (de ataque o, en armaduras, de
  defensa), precio, rasgos y reglas [RR].
- **Rasgos** que usan las reglas y los escenarios [VAL]: arma cuerpo a cuerpo o a distancia, una o dos manos,
  hoja (*blade*), hacha, martillo, arco, bastón, mágica, runa, escudo, armadura (ligera o pesada), casco, anillo,
  abalorio (*trinket*), capa, botas, cinturón, libro, varita, exótica.
- **Precios** en los datos de Valkyrie: de 25 a 275 de oro. El equipo inicial de clase vale 25 [VAL].
- Las habilidades de un arma solo funcionan al atacar con ella [CRRG].

### 14.3 Reliquias [RR][EXP][CRRG]

- Objetos únicos de **doble cara** (héroe y Señor Supremo) que solo se ganan como recompensa de aventuras de
  campaña; **no se compran ni se venden**.
- Si las tiene el Señor Supremo, un lugarteniente puede empuñar su cara oscura (uno por lugarteniente); si cae, la
  reliquia deja de funcionar esa aventura, pero el Señor Supremo la conserva.
- ***MoR*, *MoB* y *TCTR*** añaden **reliquias de monstruo** (cada grupo puede empuñar una, elegida al preparar el
  encuentro; dura todo el encuentro aunque el grupo caiga) y **reliquias universales** (el Señor Supremo las
  conserva en su zona y las usa según su texto). Los lugartenientes no empuñan ninguna de estas.
- La **Piedra solar** (*Sun Stone*, *LoR*) es una reliquia con ficha que se puede soltar y recoger con una acción
  (§5.8); si un monstruo la tiene al final de un encuentro, el Señor Supremo gana *Sun's Fury*.
- **Caja básica:** 6 reliquias: *Dawnblade*, *Fortuna's Dice*, *Shield of the Dark God*, *Staff of Light*, *The
  Shadow Rune* y *Trueshot* [VAL].

### 14.4 Equipo [RR][CRRG]

| Límite | Cuántos se pueden equipar |
|---|---|
| Iconos de mano | **2** en total (un arma a dos manos ocupa los dos) |
| Armadura | **1** |
| Otros (*other*) | **2** |
| Sin icono | Sin límite (salvo restricciones de rasgo) |

- Se lleva cualquier número de cartas, pero solo funcionan las equipadas (salvo las de Búsqueda).
- Solo se cambia el equipo en el paso 2 del turno (§4.2). Lo no equipado va boca abajo o bajo la hoja.

### 14.5 Agotar y refrescar [RR][CRRG]

- **Agotar** una carta es girarla de lado para indicar que se ha usado su habilidad; no se puede volver a usar
  hasta **refrescarla** (ponerla derecha) al inicio del turno de su dueño.

### 14.6 Oro [RR][RTL][VAL]

- El oro de los héroes es **común**. Se gana con cartas de Búsqueda (competitivo), con lo que da la app al buscar
  y como recompensa de aventuras (RtL).
- **En Valkyrie** el oro del grupo es la variable de campaña `$%gold`, que la tienda muestra, resta al comprar y
  suma al vender [VAL].

### 14.7 La tienda [RR][FAQ][RTL][VAL]

**Competitivo** [RR][FAQ]

- En el paso de compras se barajan las cartas del acto actual y se revelan **5**; los héroes compran las que
  quieran pagar entre todos; las demás vuelven al mazo.
- **Vender:** la mitad del precio, redondeando hacia abajo a múltiplos de 25. El equipo inicial, 25 (y se
  devuelve a la caja). Las reliquias no se venden.
- **Paso al Acto II:** antes de cambiar de mazo, los héroes pueden comprar cualquier objeto del Acto I que
  quede (§15.2).

**RtL** [RTL]

- Se compra en las **ciudades**. El surtido es **aleatorio** según la ciudad, el avance de la campaña y la
  **fama**, y puede mezclar objetos del Acto I y del Acto II.
- Se compra al precio que muestra la app, no al de la carta, y, a diferencia del modo competitivo, **se vende por
  el valor completo**. Lo vendido vuelve a su mazo.
- **Esperar 1 semana** renueva el surtido; **Salir** no gasta tiempo si no se va a otro sitio.

**Valkyrie** [VAL]

- La tienda (solo en Descent) la abre un evento del escenario que **añade dos o más objetos** (`QItem`): no se
  entregan, sino que se ponen a la venta. Al lado salen los botones del evento; la tienda **solo se cierra**
  cuando un evento quita `#shop` (ni siquiera al cambiar de aventura).
- Los objetos son concretos o se sortean por rasgo o por acto entre los de las expansiones activas, sin repetir
  ni dar lo que el grupo ya tiene, y filtrados por la **fama** (§14.8). El sorteo se hace **al cargar la
  aventura** y cada vez que `$restock` se pone a 1; la tienda enseña lo ya sorteado y, si se vuelve a abrir,
  lo que queda (más lo que el grupo le haya vendido).
- Por defecto se vende al **mismo precio** que se compra; la variable `$%sellratio`, si no es 0, multiplica el
  precio de venta (0,5 = mitad, como en el modo competitivo). El equipo de clase se compra y se vende a 25.
  Las **reliquias** no se venden.
- Valkyrie no da objetos iniciales de escenario en Descent: solo el equipo de clase. Las recompensas son eventos
  que añaden **un** objeto.

### 14.8 Fama (RtL) [RTL][CRRG][VAL]

- Mide la reputación del grupo y se ve en la pantalla del diario, bajo los retratos.
- Decide qué objetos aparecen en las tiendas y desbloquea opciones de eventos de viaje y de aventuras.
- **En Valkyrie** es la variable `$%fame`, con umbrales para cada nivel (`$%famenoteworthy`, `$%fameimpressive`,
  `$%famecelebrated`, `$%fameheroic`, `$%famelegendary`) que fija el escenario. Los niveles son, de menor a
  mayor: *insignificant*, *noteworthy*, *impressive*, *celebrated*, *heroic* y *legendary* (en español,
  propuesta: insignificante, notable, impresionante, célebre, heroico y legendario (?); [COM] usa
  «impresionante», «heroico» y «legendario»).
  - El nivel es el más alto cuyo umbral alcanza `$%fame`. **Si no se fijan los umbrales, valen 0 y el nivel es
    *legendary***: casi ningún objeto del Acto I sale en la tienda. Las campañas publicadas usan 2, 4, 6 y 8
    para *impressive*, *celebrated*, *heroic* y *legendary* (sin umbral *noteworthy*, el grupo empieza en ese
    nivel).
  - Cuenta el nivel del momento del sorteo (§14.7): la raíz de una campaña fija los umbrales y las aventuras
    siguientes ya sortean con ellos; una aventura suelta tiene que volver a sortear (`$restock`) después de
    fijarlos.
- En los datos de Valkyrie, los objetos del Acto I se pueden comprar desde *insignificant*, *noteworthy* o
  *impressive* y dejan de salir casi todos tras *impressive* o *celebrated*; los del Acto II aparecen sobre todo
  desde *celebrated* y llegan casi todos a *legendary*. Las reliquias no tienen fama [VAL].

---

## 15. Campaña

### 15.1 Estructura de una campaña competitiva [RR][WIKI][EXP]

| Tramo | Aventuras | Quién elige |
|---|---|---|
| Introducción | 1 (cuenta como Acto I) | Fija. |
| Acto I | 3 | El ganador de la anterior, entre las disponibles. |
| Interludio | 1 (cuenta como Acto I) | Según quién ganó más aventuras del Acto I (sin contar la introducción). |
| Acto II | 3 | El ganador del Interludio y luego el de cada aventura. |
| Final (*Finale*) | 1 (cuenta como Acto II; puede tener varios encuentros) | Según quién ganó más del Acto II. |

- Gana la campaña quien gana el Final. Antes del Final conviene gastar todo el oro y los PE.
- **Campañas completas:** *The Shadow Rune* (caja básica en sus primeras ediciones), *Heirs of Blood* (el
  reglamento de 2015 la describe como la campaña de la caja, con 9 aventuras que empiezan en *Acolyte of
  Saradyn*; relación entre ambas ediciones, sin verificar), *Labyrinth of Ruin* y *Shadow of Nerekhall* [RR][WIKI].
- **Minicampañas** de 4–5 aventuras: *TT* y *MoR* (los héroes empiezan con 4 PE y 100 de oro cada uno; el Señor
  Supremo con 4 PE), *LotW* (con reglas de minicampaña en un documento aparte, no leído), *MoB* (5 aventuras,
  Acto I) y *TCTR* (5 aventuras con cartas del Acto II; cada jugador empieza con 5 PE y cada héroe con 225 de
  oro). *MoB* y *TCTR* se pueden unir en una campaña de dos actos [EXP].
- Los roles, héroes y clases se eligen una vez para toda la campaña [RR].

### 15.2 La fase de campaña (competitiva) [RR][FAQ]

1. **Oro de la Búsqueda:** se cobra el valor de las cartas de Búsqueda y se devuelven al mazo.
2. **Limpieza:** los héroes recuperan todo el daño y la fatiga; se descartan los Estados y terminan los efectos;
   el Señor Supremo junta su mazo y su descarte.
3. **Recompensas:** **todos** ganan 1 PE; el ganador, además, lo que diga la aventura.
4. **Compras** (§14.7).
5. **Gastar PE** (héroes en habilidades de clase; Señor Supremo en cartas).
6. **Elegir la siguiente aventura** (normalmente el ganador).
7. **Preparar la aventura.**
8. **Viaje** (§15.3).

**Paso al Acto II** (tras el Interludio; errata de la FAQ):

1. Pasos 1–3 de la fase de campaña.
2. En lugar de las compras normales, se ponen boca arriba **todos** los objetos del Acto I que queden y los
   héroes compran los que quieran.
3. Los objetos, monstruos y lugartenientes del Acto I que no se compraron vuelven a la caja y se usan los del
   Acto II. Los objetos del Acto I que ya tienen los héroes se quedan; si se venden después, van a la caja.
4. Pasos 5–8.

### 15.3 Viaje (competitivo) [RR][EXP]

- Los héroes salen de una localidad fija (en el reglamento de 2015, las ruinas de Kethiri; en *LoR*, el
  campamento de Pylia; en *SoN*, la posada Ironbrick) y siguen un camino continuo del mapa de campaña hasta la
  aventura. Al volver no hay viaje.
- Por **cada icono de viaje** del camino, el Señor Supremo roba una carta de **Evento de viaje** y se resuelve el
  evento del icono correspondiente; si no tiene evento, se descarta y se sigue. Los iconos representan tipos de
  camino o terreno (lista exacta, sin verificar).
- Las decisiones las toman todos los héroes de acuerdo. El daño, la fatiga y los Estados del viaje **se llevan a
  la aventura**.
- ***SoN***: en la ciudad de Nerekhall se usan **Eventos de ciudad** en lugar de eventos de viaje. Algunos
  eventos de *LoR* se quedan en la zona de un héroe de cierto arquetipo hasta que se usan.

### 15.4 Rumores, cartas de aventura y salas secretas (competitivo) [EXP][FAQ]

- **Rumores** (*LotW*, *TT*, *MoR* y las colecciones de héroes y monstruos): el Señor Supremo empieza la campaña
  con 3 y no roba más; juega como mucho 1 por fase de campaña y los héroes lo resuelven al momento. Algunos ponen en
  juego una **carta de aventura** (aventura de Rumor) que cualquiera puede elegir en el paso 6; se viaja con los
  iconos de la carta. Los del Acto I se descartan al empezar el Acto II. Estas aventuras no cuentan para el número
  de aventuras del acto.
- **Aventuras avanzadas:** cartas que entran como recompensa.
- **Salas secretas** (*LotW*, *TT*): al robar *Secret Passage* se pone una entrada en la casilla del héroe; gastar
  1 punto de movimiento en ella lleva a una loseta aparte con fichas de desafío boca abajo (tantas como héroes).
  Se revelan con la acción Buscar: monstruo (esbirro fuera del límite) o prueba de atributo (si se supera, carta
  de Búsqueda). Al vaciarla se cobra la recompensa de la carta de Sala secreta y se vuelve junto a la entrada. Solo
  puede haber una abierta a la vez; nunca son obligatorias.

### 15.5 La campaña en Road to Legend [RTL][BLOG]

- **Mapa de campaña.** Tras cada aventura se vuelve al mapa, desde donde se puede **viajar** a una aventura,
  **visitar una ciudad** o **entrenar** (gastar PE).
- **Semanas.** Las aventuras de **historia** muestran «empieza en X semanas». Cada actividad que gasta tiempo resta
  semanas; al llegar a 0, esa aventura es obligatoria y no se puede hacer nada más que gaste tiempo.
- **Aventuras secundarias.** Optativas, sacadas al azar de las desbloqueadas; intentarlas, se gane o se pierda,
  gasta **1 semana**.
- **Ciudades.** Visitar una gasta **1 semana** y es la forma principal de **recuperar moral**. Cada una tiene
  tienda (§14.7) y una acción propia; por ejemplo, en Tamalir se puede pagar 50 de oro por héroe para que cada
  uno gane 1 PE, a cambio de 1 semana.
- **Entrenamiento.** Gastar PE en habilidades no gasta tiempo.
- **Inventario y diario.** Solo de consulta; el diario muestra la fama.
- **Eventos de viaje.** Mensajes con opciones; las que tienen requisitos (entre corchetes) salen en gris si no se
  cumplen.
- **Actos.** La app anuncia el paso al Acto II; las cartas del Acto I vuelven a la caja.
- **Guardado.** Al empezar cada aventura y cada ronda, al acabar una aventura y al salir de una ciudad.

### 15.6 Qué se arrastra de una aventura a otra

| Se conserva | No se conserva |
|---|---|
| PE y habilidades compradas; oro; objetos de la tienda y reliquias; fama y moral (RtL); el calendario de semanas (RtL) [RTL][VAL] | Daño, fatiga y Estados (se recuperan o descartan al acabar); cartas de Búsqueda (RtL); proezas usadas (la hoja vuelve boca arriba); fichas de valor, elixir, clarividencia… [RTL][EXP] |

- En el modo competitivo, el daño, la fatiga y los Estados sufridos **en el viaje** sí entran en la aventura
  siguiente [RR].
- **En Valkyrie**, al pasar de un `quest.ini` a otro dentro de una campaña se conservan los héroes, sus clases,
  habilidades y objetos, y las variables que empiezan por `%` y `$%` (PE comunes, oro, moral, fama…); el resto
  de variables, el mapa, los monstruos y las tiendas se borran [VAL]. Cada aventura de la campaña debe llevar
  sus textos también en inglés: tras el cambio, Valkyrie carga el idioma del jugador y el inglés, no el idioma
  por defecto del escenario (`formato-escenario.md` §21).

### 15.7 Peligro (*Peril*) durante la aventura [RTL][VAL][COM]

- Si los héroes se entretienen, la app dispara **eventos de peligro** al final de algunas rondas, cada vez más
  graves: aparecen monstruos, se sufre daño o se pierden recursos. En Difícil suben más deprisa.
- Solo afectan a los **héroes** (no a figuras tratadas como héroes, fichas, familiares ni héroes fuera del mapa).
- Si un peligro hace aparecer un grupo que ya está en el mapa, se ponen los que permita el límite.
- Los peligros son sucesos **de la aventura**, al final de una ronda, no de la fase de campaña; lo que pasa entre
  aventuras son los eventos de viaje (§15.5) [RTL][VAL].
- **En Valkyrie** hay tres niveles, **menor**, **mayor** y **mortal**: el escenario pone `$perilMinor`,
  `$perilMajor` o `$perilDeadly` a 1 y, al final de esa ronda, Valkyrie elige al azar un peligro de ese nivel
  entre los suyos (texto de la app oficial). Muchos escenarios llevan un contador de «amenaza» que sube cada ronda
  y dispara los peligros al pasar ciertos umbrales [VAL][COM].

### 15.8 *The Delve* y otros modos de RtL [RTL][WEB-FFG]

- ***The Delve*:** partida de una sesión con hasta **6 etapas** generadas al azar; se gana al salir de la sexta.
  - Cada etapa tiene un portal; cuando se abre, la app pregunta si los héroes están en él o adyacentes y quieren
    irse; si es así, se despeja el mapa.
  - Entre etapas, una **fase de mejora**: PE y objetos de tienda según las rondas y búsquedas de la etapa; los
    héroes se quedan con 2 objetos (1 con dos héroes), más 1 si no quedaban monstruos.
  - Tras la tercera etapa se pasa a objetos y monstruos del Acto II, se rebarajan las cartas de Búsqueda usadas,
    se ponen boca arriba las hojas y se gana 1 de moral.
  - Solo el familiar Brightblaze pasa de una etapa a otra.
- ***Trials of Frostgate*:** 4 pruebas independientes y rejugables con puntuación.

### 15.9 Juego épico (competitivo sin campaña) [RR][FAQ][CRRG]

| Nivel | Héroes | Señor Supremo |
|---|---|---|
| Básico | Preparación normal | Normal |
| Avanzado | 3 PE en habilidades y 150 de oro en objetos del Acto I cada uno | 4 PE en cartas |
| Experto | 6 PE y 250 de oro en objetos del Acto I o II | 8 PE y monstruos y lugartenientes del Acto II |

- En los niveles avanzado y experto, el equipo inicial se puede vender por 25 antes de empezar [FAQ].

---

## 16. Objetivos de una aventura, victoria y derrota

### 16.1 Cómo se gana y se pierde en RtL [RTL][VAL]

- **Victoria:** cumplir el objetivo de la aventura. La app termina la aventura y da las recompensas.
- **Derrota por moral:** un héroe queda fuera de combate con la moral a 0 (§9.5).
- **Otras derrotas:** las que fije la aventura (tiempo, que los monstruos cumplan su objetivo…).
- El objetivo se puede **revelar o cambiar** a medida que se explora (en [COM] se marca con «**Objetivo**:» y
  «**Objetivo actualizado**:»).
- En Valkyrie, la victoria y la derrota son eventos del escenario; la derrota por moral se engancha al disparador
  `NoMorale` [VAL].

### 16.2 Objetivos típicos [RR][RTL][COM][VAL]

| Objetivo | Cómo se suele plantear |
|---|---|
| Derrotar a un jefe | Un monstruo único o un lugarteniente con Vida extra; la victoria salta al derrotarlo («Único derrotado» o el grupo). Ejemplo de Valkyrie: derrotar a Mauler antes de que 5 arqueros goblin salgan del mapa. |
| Escapar o llegar a un lugar | Todos los héroes (o uno con un objeto) en la loseta de salida; la app pregunta «¿Están todos los héroes en la pieza de Salida?». |
| Rescatar o escoltar | Fichas de aldeano que se recogen o acompañan; reglas de cómo se mueven y qué pasa si un monstruo llega a ellas. |
| Recoger y llevar objetos | Fichas de objetivo que se recogen con una acción y se llevan a un sitio (§5.8). |
| Investigar | Buscar fichas hasta dar con una llave o una pista; pruebas de atributo encadenadas («seguir el rastro»). |
| Destruir o defender un objeto | Una ficha con Vida y Defensa que los héroes atacan (o que los monstruos atacan; en RtL los monstruos pueden elegir como objetivo fichas atacables). |
| Aguantar o terminar a tiempo | Sobrevivir X rondas, o cumplir antes de que llegue un umbral de rondas o de amenaza; refuerzos y peligros cada ronda. |
| Impedir que los monstruos lo consigan | Monstruos que intentan salir del mapa, llevar algo a un sitio o matar a un personaje; se cuentan con fichas o con preguntas al final de ronda. |

- **Recompensas habituales:** oro (por héroe o común), PE, objetos de la tienda o reliquias, fama, moral [RTL][COM].
- **Información que da el texto**: el objetivo, qué cuenta como cumplirlo, qué hacen los monstruos especiales y
  qué no puede saber la app (§19.3).

---

## 17. FAQ, erratas y reglas que se suelen malinterpretar

### 17.1 Erratas oficiales del reglamento [FAQ]

- **Monstruos grandes (p. 16):** para interrumpir su movimiento con una acción, hay que poder declararla antes de
  colocar la figura.
- **Foso (p. 18):** regla reescrita (la de §6.6): 2 ♥ al entrar, no se gastan puntos de movimiento dentro, se sale
  con una acción a una casilla vacía adyacente, visión limitada, y a los grandes solo les afecta si todas sus
  casillas son de foso.
- **Reglas de oro (p. 18):** las cartas prevalecen sobre el reglamento; las reglas de la aventura, sobre todo lo
  demás.
- **Partidas con dos héroes (sección nueva):** el ataque gratuito o recuperar 2 ♥ (§5.11).
- **Fase de campaña:** las compras son el paso 4 y el gasto de PE el 5.
- **Compras:** se revelan 5 objetos.
- **Paso al Acto II:** el procedimiento de §15.2.
- **Carta de Referencia del Señor Supremo:** al inicio de su turno, primero roba carta y resuelve efectos de
  inicio, y después refresca.

### 17.2 Erratas de cartas que afectan a las reglas [FAQ]

- **Grisban the Thirsty:** al descansar, descarta 1 Estado.
- **Elemental** (*Air*): hasta el inicio de su siguiente turno, solo le afectan los ataques de figuras adyacentes.
- **Knight, *Guard*:** cuando un monstruo entra en una casilla vacía adyacente al Knight, este puede agotar la
  carta para interrumpir con un ataque cuerpo a cuerpo; si el monstruo sobrevive, sigue su activación.
- **Gigante y Troll, *Sweep*:** afecta a cada otra figura a 2 casillas o menos y en línea de visión; cada una
  tira su defensa.
- **Tristayne Olliven (Acto II):** su ataque es a distancia.
- ***Castle Daerion*:** los aldeanos tienen 8 de Vida, no 6.

### 17.3 Preguntas frecuentes oficiales [FAQ]

- **Orden de turnos:** los héroes eligen quién empieza y, al acabar cada uno, quién sigue.
- **«Durante tu turno»:** solo en el paso de acciones (los héroes) o de activación (el Señor Supremo).
- **Línea de visión:** no puede atravesar ninguna casilla ocupada u obstruida, ni siquiera la del objetivo; dos
  casillas separadas por una pared no son adyacentes ni se ven aunque compartan esquina; los huecos entre losetas
  no son casillas.
- **Contar casillas:** se ignoran las figuras; las puertas cortan la cuenta.
- **Aturdido:** la primera acción lo descarta y la segunda queda libre; si se recibe tras la primera acción, la
  segunda se gasta en descartarlo.
- **Inmovilizado en mitad de un Mover:** termina el movimiento y se pierden los puntos; se pueden usar efectos de
  colocación o de movimiento que no sean la acción de Mover.
- **Explosión y Estados:** cada figura debe sufrir al menos 1 ♥ tras su propia defensa.
- **Fuera de combate:** si cae en su turno, el turno acaba; tras Levantarse, el turno acaba y no puede sufrir fatiga
  para moverse; no está obligado a actuar.
- **Movimiento:** se puede interrumpir una acción de Mover para empezar otra; para interrumpir hay que estar en
  casilla vacía; los puntos ganados en el turno de otro se gastan al momento.
- **Lava y grandes:** expandirse sobre lava no hace daño; solo cuenta la casilla donde termina.
- **Familiares:** un héroe fuera de combate puede activar a su familiar antes de levantarse, no después; un
  familiar se activa una vez por ronda aunque se retire y vuelva a colocar; la fatiga de un familiar-figura se
  convierte en daño y sus aumentos no recuperan fatiga.
- ***Fire Breath*:** el camino puede ir en cualquier dirección y cambiarla.
- ***Stealthy*:** también contra cuerpo a cuerpo (necesita 3 de alcance).
- **Frenzy** (carta de Señor Supremo): da 2 ataques normales, no habilidades.
- **Elevación y fosos:** al salir de un foso no se puede acabar al otro lado de una línea de elevación.
- **Familiares en las aventuras cooperativas sin app:** cuentan como héroes solo para las cartas de Activación (las
  Summoned Stones, también cuando una carta de Activación elige objetivo), no para las de Peligro ni Exploración.

### 17.4 Errores habituales [CRRG][RTL][VAL]

1. **Pruebas de atributo:** se cuentan **escudos**, no aumentos, y se supera con un resultado **igual o menor**
   que el atributo. Los monstruos (salvo lugartenientes) fallan siempre.
2. **Estados por aumento:** solo si el ataque hace al menos 1 ♥ tras la defensa a esa figura.
3. **Cada habilidad de aumento, una vez por ataque.** Y un héroe puede gastar un aumento sobrante en recuperar 1
   fatiga.
4. **Diagonales:** se mueve en diagonal, pero no por la esquina de una pared ni de una elevación con pared.
5. **Atravesar figuras:** las amigas sí, las enemigas no; nunca se acaba en casilla ocupada.
6. **A distancia contra un adyacente** hace falta al menos 1 de alcance.
7. **Monstruos y fatiga:** no pueden sufrir fatiga para moverse; la fatiga que reciben es daño.
8. **Agua cuesta 2**, el foso hace **2 ♥ al entrar** y se sale con una acción, la lava hace 1 ♥ al entrar y
   derrota a quien acaba su turno dentro.
9. **Fuera de combate:** el héroe sufre fatiga hasta su Aguante y descarta sus Estados; en RtL, la moral baja 1.
10. **Levantarse termina el turno**; Reanimar lo hace otro héroe adyacente y el caído juega normal su siguiente
    turno.
11. **Proeza heroica:** una vez por encuentro (RtL: por aventura).
12. **Equipar** solo al inicio del turno; **intercambiar** durante o tras una acción de Mover, con un adyacente.
13. **En RtL las puertas no se cierran** (salvo que lo diga la app) y se puede examinar una ficha o puerta en la
    app sin gastar acción.
14. **Explosión contra monstruos en RtL:** el objetivo sufre todo el daño; los demás, la mitad redondeando hacia
    arriba antes de los escudos.
15. **Activación de monstruos en RtL:** recorrer la lista de arriba abajo y volver a empezar; saltar lo que no se
    puede hacer; como mucho un ataque.
16. **Habilidades «una vez por turno»** de los héroes no se usan en las activaciones de los monstruos.
17. **Dos héroes:** el ataque gratis o recuperar 2 ♥ solo se aplica con exactamente 2 héroes.
18. **Valkyrie:** hay que pulsar **Fin del Turno** en el retrato de cada héroe (también si está fuera de combate),
    **KO** cuando un héroe cae y **Derrotado** cuando cae el último monstruo de un grupo; si no, la ronda no avanza
    o la moral no baja [VAL].
19. **Valkyrie:** mientras haya en pantalla una imagen o un texto del escenario (UI) o la tienda, los retratos de
    los héroes no responden (ni Fin del Turno ni KO): el escenario debe quitarlos [VAL].

### 17.5 Notas sobre la app oficial [RTL][CRRG]

- La app no guarda posiciones, daño ni Estados: al guardar a mitad de aventura hay que apuntarlo.
- Algunas habilidades no tienen efecto en RtL o cambian: *By the Book*, *Danger Sense*, *Grim Fate*, *Just
  Reward* y *Zealous Fire* no hacen nada; *Cloud of Mist* y *Unseen*, mientras están agotadas, obligan a los
  monstruos a gastar antes su primer aumento en no fallar (detalle exacto, sin verificar); *Prayer of Peace*
  impide, si se puede, que los monstruos Confronten al Discípulo; *Payday* usa la ficha de búsqueda más cercana al
  Bounty Hunter; a las Summoned Stones se las elige como objetivo como si fueran héroes [RTL].
- Una instrucción de **Divisar** contra un héroe protegido por Roganna the Shade se convierte en Confrontar
  [RTL].

---

## 18. Glosario español ↔ inglés

**Leyenda de verificación**

- **[COM]**: uso en escenarios comunitarios en español (con número aproximado de apariciones cuando ayuda).
  Probable, pero no oficial.
- **[BLOG]**: uso en un blog de jugadores españoles.
- **[VAL-ES]**: traducción de la interfaz de Valkyrie, no oficial.
- **(?)**: propuesta sin respaldo; usarla con cautela.
- No se pudo consultar ningún reglamento de Edge en español (ver «Fuentes»).

### 18.1 Juego, partida y estructura

| Inglés | Español recomendado | Verificación y notas |
|---|---|---|
| Descent: Journeys in the Dark Second Edition | Descent: Viaje a las Tinieblas (Segunda Edición) | Nombre comercial de Edge [COM][BLOG] |
| Road to Legend | Camino a la leyenda | [COM] (Vidimus) |
| Overlord | **Señor Supremo** | [COM] (más de 300 usos) [BLOG] |
| Hero | Héroe | [COM][VAL-ES] |
| Quest | **Aventura** (también «misión») | [COM][BLOG]. Valkyrie usa «Escenario» para el fichero [VAL-ES]. |
| Encounter | Encuentro | [COM] |
| Round / Turn | Ronda / Turno | [COM]. Valkyrie muestra «Turno {n}» para la ronda [VAL-ES]: mejor «ronda» en los textos. |
| Activation | Activación | [COM][VAL-ES] |
| End Turn (botón) | Fin del Turno | [VAL-ES][COM] |
| Campaign / Campaign phase | Campaña / Fase de campaña | [COM] |
| Act I / Act II | Acto I / Acto II | [COM][VAL-ES] |
| Introduction / Interlude / Finale | Introducción / Interludio / Final (o «Gran final») | [COM] |
| Story quest / Side quest | Aventura de historia / Aventura secundaria | (?) |
| Rumor | Rumor | [COM] |
| Travel / Travel event | Viaje / Evento de viaje | [COM] |
| City event | Evento de ciudad | (?) |
| Peril (minor, major, deadly) | Peligro, «Evento de peligro» (menor, mayor, mortal) | [COM] |
| Morale | Moral | [COM] (más de 400 usos) |
| Fame | Fama | [COM] |
| Week | Semana | (?) |
| Difficulty Normal / Hard | Dificultad Normal / Difícil | [COM] |
| Golden rules | Reglas de oro | (?) |
| Epic play | Juego épico | (?) |

### 18.2 Héroes, características y pruebas

| Inglés | Español | Verificación |
|---|---|---|
| Hero sheet | Hoja de héroe | [COM] |
| Archetype: Warrior, Mage, Healer, Scout | Arquetipo: Guerrero, Mago, Sanador, Explorador | [BLOG][COM] |
| Class / Hybrid class | Clase / Clase híbrida | [COM][VAL-ES] |
| Skill (class card) | Habilidad (de clase) | [VAL-ES][BLOG] |
| Hero ability | Habilidad de héroe | [COM]; [BLOG] dice «capacidad de héroe» |
| Heroic feat | **Proeza heroica** | [COM][BLOG]; una vez «Hazaña heroica» [COM] |
| Speed / Health / Stamina / Defense | Velocidad / Vida / Aguante / Defensa | [COM]. Valkyrie usa «Salud» [VAL-ES]. |
| Might / Knowledge / Willpower / Awareness | Fuerza / Conocimiento / Voluntad / Percepción | [BLOG][COM] (en [COM] casi siempre con el símbolo) |
| Attribute | Atributo | [COM] |
| Attribute test | **Prueba** de atributo («prueba de `{might}`»); superar / fallar la prueba | [COM][BLOG] |
| Experience points (XP) | Puntos de experiencia (**PE**) | [COM][BLOG] |
| Starting equipment | Equipo inicial | [COM] |
| Familiar / Ally | Familiar / Aliado | [COM] |
| Knocked out | **Fuera de combate** («queda fuera de combate») | [COM][BLOG]; también «inconsciente» [COM]. Evitar «derribado» (?), que [COM] usa para *Knockback*. |
| Stand up / Revive a hero | Levantarse / Reanimar a un héroe | [COM] («levantarse», «ponerse en pie»); (?) |
| Rest | Descansar | [COM][BLOG] |

### 18.3 Daño, fatiga y Estados

| Inglés | Español | Verificación |
|---|---|---|
| Damage (heart) | Daño (`{heart}`); «sufre 2 `{heart}`» | [COM] |
| Fatigue | Fatiga (`{fatigue}`) | [COM][BLOG] |
| Suffer / Recover | Sufrir / Recuperar | [COM] |
| Defeated | Derrotado | [COM][VAL-ES] |
| Condition | Estado (carta de Estado) | [COM][BLOG] |
| Poisoned | Envenenado | [COM] |
| Diseased | Enfermo | [COM] |
| Immobilized | Inmovilizado | [COM] |
| Stunned | Aturdido | [COM] |
| Burning | En llamas | [COM] (también «Quemado», una vez) |
| Cursed | Maldito | [COM] |
| Weakened | Debilitado | [COM] |
| Bleeding | Sangrando | [COM] |
| Doomed | Condenado | [COM] |
| Terrified | Aterrorizado | [COM] |
| Tainted (card) | Impureza (carta de Impureza) | [COM] |

### 18.4 Acciones y movimiento

| Inglés | Español | Verificación |
|---|---|---|
| Action / Special action | Acción / Acción especial | [COM] |
| Move action / Movement points | Acción de movimiento / Puntos de movimiento | [COM] |
| Attack action | Acción de ataque | [COM] |
| Search | Buscar; ficha de Búsqueda | [COM] |
| Open a door | Abrir una puerta | [COM] |
| Exhaust / Refresh | Agotar / Refrescar | [COM] («agota»); «refrescar» (?) |
| Trade / Equip | Intercambiar / Equipar | [COM] |
| Spot | **Divisar** («Divisa al héroe más cercano») | [COM] |
| Engage | **Confrontar** («Se confronta con el héroe más cercano») | [COM] |
| Retreat | **Retirarse** («A continuación se retira») | [COM] |
| Toward / Away / Closest / Farthest | Hacia / Alejarse / Más cercano / Más alejado | [COM] |
| Adjacent | Adyacente | [COM] |
| Space | **Casilla** | [COM] (más de 2.000 usos) |
| Empty space | Casilla vacía | [COM] |
| Line of sight | Línea de visión | [COM] |
| Range | Alcance | [COM] |
| Within 3 spaces | A 3 casillas o menos | [COM] |

### 18.5 Ataques y dados

| Inglés | Español | Verificación |
|---|---|---|
| Attack die (blue) | Dado de ataque (azul) | [COM] |
| Power die (red, yellow, green) | Dado de potencia (rojo, amarillo, verde) | [BLOG]; [COM] también «dado de poder» |
| Defense die (brown, gray, black) | Dado de defensa (marrón, gris, negro) | [COM] |
| Attack pool / Defense pool | Reserva de ataque / Reserva de defensa | [COM] |
| Attack roll / Defense roll | Tirada de ataque / Tirada de defensa | [COM] |
| Surge | **Aumento** (`{surge}`) | (?). [COM] solo usa el símbolo; [BLOG] dice «incremento». |
| Shield (defense result) | Escudo (`{shield}`) | (?); [COM] usa el símbolo |
| Miss | Fallo | (?) |
| Melee / Ranged | Cuerpo a cuerpo / A distancia | [COM] |
| Bare hands | Sin arma / manos desnudas | (?) |
| Blast | Explosión | [COM] |
| Pierce X | Perforante X | [COM] |
| Reach | Gran alcance | [COM] |
| Stealthy | Sigiloso | [COM] |
| Knockback | Derribo | [COM] |
| Fire Breath | Aliento de fuego | [COM] |
| Sweep | Barrido | [COM] |
| Sorcery | Hechicería | [COM] |
| Mend | Cerrar heridas | [COM] |
| Grab | Agarrar | [COM] (verbo) |
| Shadow | Sombra | [COM] |
| Ravage | Frenesí (?) | [COM] usa «Frenesí» para el doble ataque |

### 18.6 Clases (propuestas)

[COM] casi no menciona clases y no se encontró la traducción oficial. [BLOG] usa «Montaraz», «Bersérker»,
«Nigromante» y «Discípulo»; el resto son propuestas (?). En los textos, mejor el nombre en inglés si la clase
importa.

| Inglés | Propuesta | | Inglés | Propuesta |
|---|---|---|---|---|
| Knight | Caballero (?) | | Thief | Ladrón (?) |
| Berserker | Bersérker [BLOG] | | Wildlander | Montaraz [BLOG] |
| Disciple | Discípulo [BLOG] | | Necromancer | Nigromante [BLOG] |
| Spiritspeaker | Hablaespíritus (?) | | Runemaster | Maestro de runas (?) |
| Champion | Campeón (?) | | Geomancer | Geomante (?) |
| Apothecary | Boticario (?) | | Hexer | Hechicero (?) |
| Beastmaster | Señor de las bestias (?) | | Treasure Hunter | Cazatesoros (?) |
| Prophet | Profeta (?) | | Stalker | Acechador (?) |
| Skirmisher | Escaramuzador (?) | | Bard | Bardo (?) |
| Shadow Walker | Caminante de las sombras (?) | | Conjurer | Conjurador (?) |
| Marshal | Mariscal (?) | | Bounty Hunter | Cazarrecompensas (?) |

### 18.7 Objetos, tienda y oro

| Inglés | Español | Verificación |
|---|---|---|
| Shop Item card | Objeto de la tienda; en [COM], sobre todo «carta de Artículo de Tienda» | [COM] |
| Search card | Carta de Búsqueda | [COM] |
| Relic | Reliquia | [COM][VAL-ES] |
| Gold | Oro | [COM][VAL-ES] |
| Buy / Sell | Comprar / Vender | [VAL-ES] |
| Items / Skills (pantallas) | Objetos / Habilidades | [VAL-ES] |
| Hands / Armor / Other | Manos / Armadura / Otro | (?) |
| Health Potion / Stamina Potion | Poción de Vida / Poción de Aguante | [COM] («pociones de Vida y de Aguante») |

### 18.8 Monstruos

| Inglés | Español | Verificación |
|---|---|---|
| Monster / Monster group | Monstruo / Grupo de monstruos | [COM] |
| Master | **Líder** («Ettin líder») | [COM] (más de 500 usos). Valkyrie: «Maestro» [VAL-ES]. |
| Minion | **Esbirro**; en nombres, «común» («Ettin común») | [COM]; Valkyrie: «Esbirro» [VAL-ES] |
| Lieutenant | Lugarteniente | [COM]; Valkyrie: «Teniente» [VAL-ES] |
| Unique monster | Monstruo único | [VAL-ES] |
| Group limit | **Límite de monstruos** (también «límite de grupo») | [COM] |
| Open group | Grupo abierto | [COM] |
| Reinforcements | Refuerzos | [COM] |
| Monster card | Carta de Monstruo | [COM] |
| Trait | Rasgo | (?) |
| Zombie / Goblin Archer / Cave Spider / Flesh Moulder | Zombi / Arquero goblin / Araña de las cavernas / Moldeador de carne | [COM] |
| Barghest / Ettin / Elemental / Merriod / Shadow Dragon | Barghest / Ettin / Elemental / Meriodón / Dragón de las sombras | [COM] |
| Goblin Witcher / Volucrix Reaver / Carrion Drake / Arachyura | Brujo goblin / Segador volucrix / Draco carroñero / Aracniura | [COM] |
| Fire Imp / Hybrid Sentinel / Harpy / Plague Worm | Diablillo de fuego / Centinela híbrido / Arpía / Gusano de plaga | [COM] |
| Rat Swarm / Changeling / Ynfernael Hulk | Enjambre de ratas / Cambiante / Mole del Ynfernael | [COM] |
| Bandit / Wraith / Bone Horror / Reanimate | Bandido / Espectro / Horror óseo / Reanimado | [COM] |
| Shambling Colossus / The Dispossessed | Coloso tambaleante / Desposeído | [COM] |
| Beastman / Giant / Chaos Beast / Lava Beetle | Hombre bestia / Gigante / Bestia del caos / Escarabajo de lava | [COM] |
| Golem / Medusa / Sorcerer | Gólem / Medusa / Hechicero | [COM] |
| Crypt Dragon / Dark Priest / Wendigo | Dragón de la cripta / Sacerdote oscuro / Wendigo | [COM] |
| Kobold / Hellhound / Deep Elf | Kóbold / Sabueso infernal / Elfa del abismo | [COM] |
| Skeleton Archer / Crow Hag / Ogre / Troll / Naga | Arquero esqueleto / Bruja cuervo / Ogro / Troll / Naga | [COM] |
| Ferrox / Ice Wyrm / Dark Minotaur | Férrox / Sierpe de hielo / Minotauro oscuro | [COM] |

### 18.9 Mapa, terreno y fichas

| Inglés | Español | Verificación |
|---|---|---|
| Map tile | **Pieza** («pieza 1B»); «loseta» | [COM] usa «pieza» (cientos de veces) y poco «loseta» |
| End cap / Extender / Transition | Terminal / Extensión / Transición | [COM] |
| Entrance / Exit | Entrada / Salida | [COM] |
| Wall / Door / Locked door | Pared / Puerta / Puerta cerrada | [COM] |
| Portcullis / Old wall / Overgrowth | Rastrillo / Muro antiguo / Maleza | (?) |
| Water / Pit / Lava / Obstacle | Agua / Foso / Lava / Obstáculo | [COM] |
| Hazard / Sludge / Elevation / Crumbling terrain | Casilla peligrosa / Lodo / Elevación / Terreno quebradizo | (?) |
| Search token / Objective token / Villager token / Hero token | Ficha de Búsqueda / de Objetivo / de Aldeano / de Héroe | [COM] |
| Damage token / Fatigue token | Ficha de daño / de fatiga | [COM] |
| Secret room | Sala secreta | (?) |

### 18.10 Expansiones y productos

| Inglés | Español | Verificación |
|---|---|---|
| The Shadow Rune | La Runa de las Sombras | [COM] |
| Lair of the Wyrm | La guarida de la Sierpe | [COM] |
| Labyrinth of Ruin | Laberinto de Perdición | [COM] |
| The Trollfens | La ciénaga del troll | [COM] |
| Shadow of Nerekhall | La sombra de Nerekhall | [COM] |
| Manor of Ravens | La Mansión de los Cuervos | [COM] |
| Mists of Bilehall | Las brumas de Castrohiel | [COM] |
| The Chains That Rust | Las cadenas del óxido | [COM] |
| Forgotten Souls / Nature's Ire | Almas olvidadas / La ira de la naturaleza | [COM] |
| Oath of the Outcast / Crown of Destiny / Crusade of the Forgotten | El juramento de la Exiliada / La corona del destino / Cruzada de los Olvidados | [COM] |
| Guardians of Deephall / Bonds of the Wild / Treaty of Champions | Guardianes de la Fortaleza Interior / Vínculos de la naturaleza / Tratado de los campeones | [COM] |
| Stewards of the Secret / Shards of Everdark | Senescales del Secreto / Esquirlas de Sombra Eterna | [COM] |

### 18.11 Estilo de redacción para aventuras en español [COM]

Fórmulas que usan los escenarios en español y que conviene mantener:

- Preparación: «Coloca las piezas 13A, la Entrada y 1 terminal como se indica.» «Coloca 2 fichas de Búsqueda como
  se indica.» «Coloca un Ettin líder en la pieza 1B como se indica.»
- Monstruos: «Coloca 1 monstruo {tipo} en la Entrada, respetando el límite de monstruos.» «Es un Férrox líder y
  tiene Vida adicional.»
- Pruebas: «Cada héroe realiza una prueba de `{will}`. Cada héroe que falle sufre 2 `{fatigue}`.» «Si fallas,
  sufres 1 `{heart}` y quedas Envenenado.»
- Estados: «queda Aturdido», «quedan Debilitados».
- Moral: «Vuestra Moral baja en 1.» «Vuestra Moral sube en 1.»
- Recompensas: «Cada héroe recibe 1 Punto de Experiencia.» «Los héroes ganan 50 de oro.» «Los héroes ganan 2 de
  fama.»
- Acciones de aventura: «Como `{action}`, un héroe adyacente puede…»
- Objetivo: «**Objetivo:** …», «**Objetivo actualizado:** …».
- Activaciones: «`{action}` Divisa al héroe más cercano.», «`{action}` Se confronta con el héroe más cercano.»,
  «`{action}` Ataca al héroe adyacente que haya sufrido menos `{heart}`.», «A continuación se retira.», «Omite
  esta activación durante el turno del monstruo líder.»
- Información de monstruo: «Los Moldeadores de carne gastan `{surge}` en el siguiente orden: `{surge}`: Cerrar
  heridas X; `{surge}`: +X `{heart}`.»

---

## 19. Puente con Valkyrie

Notas a alto nivel, sacadas del código, los datos y la wiki de Valkyrie [VAL]. El formato de ficheros se
documenta aparte.

### 19.1 Qué hace Valkyrie en una partida de Descent

| Elemento de RtL | Cómo lo hace Valkyrie |
|---|---|
| Elegir héroes y clases | Pantalla de héroes (por defecto 2–4) y de clases, con híbridas; da el equipo inicial de cada clase. Variables `#heroes`, `#Hero<nombre>` y `#Class<nombre>`. |
| Turnos de héroe | Cada retrato tiene **Fin del Turno**; al pulsarlo, Valkyrie activa un grupo de monstruos no activado, al azar. Cuando todos han jugado, termina la ronda. Variable `#round`. |
| Activación de monstruos | Elige al azar una activación del tipo de monstruo (o del monstruo personalizado) y muestra el efecto especial y la lista de **Maestro** y **Esbirro**, en el orden fijado o al azar. Un botón por mitad («Maestro activado», «Esbirro activado»). |
| Grupos de monstruos | Columna de retratos con **Información**, **Forzar activación**, **Derrotado** (todo el grupo) y **Único derrotado**. Valkyrie no lleva la Vida de cada figura; solo muestra en rojo la Vida extra de un único o la de un monstruo personalizado. |
| Fuera de combate y moral | Botón **KO** del retrato (baja la moral 1) y **Recuperar**. La moral es `$%morale`; si baja de 0, salta `NoMorale`. |
| Experiencia | Ventana de habilidades: PE propios del héroe más `$%xp`, con la regla de las híbridas. |
| Objetos y oro | Ventana de objetos (consulta) y oro `$%gold`; tienda que abre el escenario (dos o más objetos en un evento), filtrada por fama (`$%fame`) y cerrada con `remove=#shop` (§14.7). |
| Peligros | `$perilMinor`, `$perilMajor`, `$perilDeadly` a 1: al final de la ronda sale un peligro al azar de ese nivel. |
| Viaje | `$@travelevent` a 1 lanza un evento de viaje al azar de los de Valkyrie (o los que defina el escenario). |
| Campaña | Varias aventuras en un paquete; al cambiar de `quest.ini` se conservan los héroes, sus clases, habilidades y objetos, y las variables `%` y `$%` (§15.6). |
| Símbolos | `{heart}`, `{fatigue}`, `{surge}`, `{shield}`, `{might}`, `{knowledge}`, `{will}`, `{awareness}`, `{action}`; `{rnd:hero}` pone el nombre de un héroe al azar. |
| Disparadores útiles | `EventStart`, `StartRound`, `EndRound`, `EndRound<N>`, `Defeated<monstruo o spawn>`, `DefeatedUnique<…>`, `NoMorale`, `Var<variable>`. Los de Mansiones (`Mythos`, `Eliminated`…) nunca saltan en Descent. |

### 19.2 Qué no puede saber la app (sistema de honor)

Ni la app oficial ni Valkyrie saben nada de la mesa: los jugadores mueven, tiran y aplican las reglas, y le
cuentan a la app lo que ocurre [RTL][VAL].

| No sabe | Consecuencia para el texto |
|---|---|
| Dónde está cada figura, qué ve, a cuántas casillas está, qué terreno pisa | Las condiciones de posición se preguntan con botones («¿Hay algún héroe adyacente al altar?») o se resuelven al pulsar una ficha que solo se puede pulsar estando allí. |
| El daño, la fatiga y los Estados de héroes y monstruos | Los efectos se describen para que los apliquen los jugadores; si importa el resultado (¿murió el guardia?), se pregunta. |
| Los dados y las pruebas | El texto dice qué prueba hacer y qué pasa al superarla y al fallarla; si cambia la aventura, botones «Superada» y «Fallada». |
| Qué monstruo concreto cae | Solo grupos enteros y únicos; un monstruo concreto importante debe ser único o personalizado. |
| Si una ficha de objetivo va en manos de alguien | Se pregunta o se pide pulsar la ficha al recogerla o entregarla. |
| Si todos los héroes están en la salida | Se pregunta («¿Están todos los héroes en la pieza de Salida?») [COM]. |
| Qué héroe hizo algo, salvo que lo elija el texto | Se nombra con criterios de reglas («el héroe con menos `{will}`», «el héroe más cercano») o con `{rnd:hero}`. |

### 19.3 Qué debe decir siempre el texto de una aventura

- **Preparación física:** qué piezas, terminales, puertas, fichas y monstruos colocar y dónde (con el código de
  pieza), y qué grupos son líderes y esbirros, respetando el límite de monstruos (§12.4).
- **Objetivo** y cómo se cumple; si cambia, «Objetivo actualizado» (§16).
- **Reglas especiales:** acciones nuevas («como acción, un héroe adyacente puede…»), qué bloquea fichas o
  terreno inventado, si una ficha es atacable y con qué Vida y Defensa, cómo se mueven los aldeanos.
- **Monstruos especiales:** Vida extra, habilidades y orden de gasto de aumentos (texto de información), y
  activaciones propias con el vocabulario de §6.8 y §12.5.
- **Escalado** por número de héroes (`#heroes`): Vida, número de monstruos, oro.
- **Paso del tiempo:** refuerzos y peligros por ronda; si hay límite de rondas, avisar.
- **Final:** victoria, derrota (incluida la de moral) y recompensas (oro, PE, objetos, fama).
- **Lo que hacen los jugadores al acabar** (§15.6) si el escenario forma parte de una campaña.

### 19.4 Diferencias que conviene tener en cuenta

- Valkyrie usa «Maestro» y «Esbirro» en sus botones, mientras que [COM] escribe «líder» y «común» o «esbirro»:
  en los textos, «líder» y «esbirro» se entienden con cualquiera de los dos [VAL-ES][COM].
- Valkyrie pone la moral inicial igual al número de héroes, como RtL; recuperarla en ciudades o entre aventuras,
  y perder por moral, depende del escenario [VAL].
- Valkyrie no tiene calendario de semanas, ciudades ni mapa de campaña propios: si un escenario los quiere, los
  construye con eventos y variables de campaña [VAL].
- La tienda de Valkyrie vende por defecto al precio de compra, como RtL, que vende por el valor completo; el
  modo competitivo vende a mitad de precio [VAL][RTL][RR].
- Valkyrie no comprueba ninguna regla: todo lo que diga el texto lo aplican los jugadores.

---

## Fuentes

### Oficiales (FFG / Asmodee)

- Página del producto, con la lista de documentos de soporte:
  https://www.fantasyflightgames.com/product/descent-journeys-in-the-dark-second-edition/
- Reglamento de la caja básica (reimpresión de 2015):
  https://cdn.svc.asmodee.net/production-fantasyflightgames/uploads/2026/09/dj01_rulebook_eng_2015_web.pdf
- FAQ y erratas v1.6 (18-01-2016):
  https://cdn.svc.asmodee.net/production-fantasyflightgames/uploads/2026/09/descent_second_edition_faq_v16.pdf
- Reglas de Road to Legend:
  https://cdn.svc.asmodee.net/production-fantasyflightgames/uploads/2026/09/road_to_legend_rules.pdf
- *Lair of the Wyrm*: https://cdn.svc.asmodee.net/production-fantasyflightgames/uploads/2026/09/dj03_rulebook_cs5.pdf
- *Labyrinth of Ruin*: https://cdn.svc.asmodee.net/production-fantasyflightgames/uploads/2026/09/dj04_rulebook_web.pdf
- *The Trollfens*: https://cdn.svc.asmodee.net/production-fantasyflightgames/uploads/2026/09/dj05_rulebook.pdf
- *Shadow of Nerekhall*: https://cdn.svc.asmodee.net/production-fantasyflightgames/uploads/2026/09/dj07_rulebook.pdf
- Packs de lugarteniente: https://cdn.svc.asmodee.net/production-fantasyflightgames/uploads/2026/09/dj09-rules-web.pdf
- *Manor of Ravens*: https://cdn.svc.asmodee.net/production-fantasyflightgames/uploads/2026/09/dj21_rulebook_low_res.pdf
- *Forgotten Souls*: https://cdn.svc.asmodee.net/production-fantasyflightgames/uploads/2026/09/ugdj04_co-op_rules.pdf
- *Mists of Bilehall*: https://cdn.svc.asmodee.net/production-fantasyflightgames/uploads/2026/09/dj40_rulebook_web.pdf
- *The Chains That Rust*: https://cdn.svc.asmodee.net/production-fantasyflightgames/uploads/2026/09/dj44_rulebook_web.pdf
- Localizadas en la página del producto pero no leídas: reglas de *Nature's Ire* (`udj37_pod1_co-op_rules.pdf`) y de
  *Dark Elements* (`udj38_pod1_co-op_rules.pdf`), reglas de minicampaña de *Lair of the Wyrm*
  (`lotw_campaign_rules.pdf`), diario de campaña de *Heirs of Blood* y hoja de aventuras, todas bajo
  https://cdn.svc.asmodee.net/production-fantasyflightgames/uploads/2026/09/
- Noticias y artículos de FFG:
  - *Trials of Frostgate*: https://www.fantasyflightgames.com/en/news/2017/9/28/trials-of-frostgate/
  - Avance del combate de la 2ª edición: https://www.fantasyflightgames.com/en/ffg_blog/22657/original_content

### Comunidad (descent-community.org)

- Página del *Community Rules Reference Guide* (versiones 1.15 y 1.0, que se leyeron en PDF desde ella):
  https://descent-community.org/?p=160
  - Historial de cambios: https://descent-community.org/index.php/crrg-history-and-changelog/
- Wiki (con el prefijo https://wiki.descent-community.org/): `Main_Page`, `Expansion`, `Condition`, `Diseased`,
  `Poisoned`, `Cursed_(condition)`, `Weakened`, `Burning`, `Doomed`, `Stunned`, `Immobilized`, `Dice`, `Hero`,
  `Grisban_the_Thirsty`, `Jain_Fairwood`, `Leoric_of_the_Book`, `Ashrian`, `Avric_Albright`, `Syndrael`,
  `Tomble_Burrowell`, `Widow_Tarha`, `Zombie`, `Shadow_Dragon`, `Goblin_Archer`, `Search_card`, `Fly`,
  `Night_Stalker`, `Ravage`, `Leech`, `Knockback`, `Undying`, `Mend`, `Stealthy`, `Swallow`, `Web`,
  `Category:Abilities`, `Road_to_Legend`, `Campaign`, `The_Shadow_Rune`.

### Blogs y reseñas

- Theology of Games, primeras partidas de Road to Legend:
  https://www.theologyofgames.com/blog/2016/7/18/on-the-road-again-adventures-with-descent-road-to-legend-part-1
- Theology of Games, *Seeds of Corruption*:
  https://www.theologyofgames.com/blog/2017/1/16/another-free-campaign-for-descent-road-to-legend
- Padres Frikis (en español), campaña de Descent 2ª edición:
  https://padresfrikis.com/jugamos-descent-viaje-tinieblas-2-edicion-campana/

### Valkyrie y escenarios comunitarios

- Repositorio de Valkyrie (commit fijado `752d4206738f00a6d41e34be56fe7e65e7b35965`): https://github.com/NPBruce/valkyrie
  - Datos: `unity/Assets/StreamingAssets/content/D2E/**/*.ini` (`heros`, `classes`, `items`, `monsters`,
    `activations`, `lieutenants`, `ltActivations`, `perils`, `travel`, `tokens`, `tiles`, `content_pack`) y
    `text/Localization.Spanish.txt` / `Localization.English.txt`.
  - Código: `Quest/RoundController.cs`, `ActivateDialog.cs`, `HeroDialog.cs`, `MonsterDialog.cs`,
    `MonsterCanvas.cs`, `InfoDialog.cs`, `MoraleDisplay.cs`, `Quest.cs` (`AdjustMorale`, `AvailableXP`,
    `GetHealth`), `EventManager.cs` (`CHARS_MAP`), `ShopInterface.cs`, `SkillWindow.cs`, `Game.cs`
    (`EndSelection`), `UI/Screens/ClassSelectionScreen.cs`, `GameType.cs`.
- Wiki de Valkyrie: https://github.com/NPBruce/valkyrie/wiki (páginas *Valkyrie-Variables*, *ShopEvent*,
  *Event-Triggers*, *QuestIniSpawn*, *QuestIniCustomMonster*, *QuestIniActivation*,
  *QuestEditorGuideActivation*, *Special-Symbols*, *QuestIniQuest*).
- Escenario de ejemplo de Valkyrie *The Shadow Rune – First Blood*: https://github.com/NPBruce/valkyrie-questdata
  (`source/D2E/01_FirstBlood`).
- Lista de la tienda de Descent (nombres en español de expansiones): https://github.com/NPBruce/valkyrie-store
  (`D2E/manifestDownload.ini`).
- Escenarios comunitarios con `Localization.Spanish.txt` (49 paquetes de la tienda de Valkyrie), entre ellos
  *The Shadow Rune* (TSR), *Shadow Binders*, *Lair of the Wyrm*, *The Trollfens*, *Manor of Ravens*, *Mists of
  Bilehall*, *Forgotten Souls*, *Nature's Ire*, *Death Keep*, *City of the Dead*, *Calamity at the Cove*, *Prison of
  Ice and Lies*, *Affairs of Wizards* y la serie DooM.

### Consultadas sin resultado útil

- **Reglamentos de Edge en español:** no se encontró ninguna copia legible. Por eso la terminología sale de [COM],
  [BLOG] y [VAL-ES].
  - Las copias subidas por terceros no se usan ni se enlazan.
  - Edge (https://edgeent.com/juegos/coleccion/descent_viaje_a_las_tinieblas_segunda_edicion) y
    fantasyflightgames.es: bloqueados por `robots.txt`.
  - BoardGameGeek, edición española (https://boardgamegeek.com/boardgameversion/234694/spanish-edition): error al
    leerla.
  - Las búsquedas en español no dieron el PDF.
- **CRRG:** el lector de PDF corta el texto en unos 114.000 caracteres, así que la v1.15 solo se leyó hasta la
  entrada «Monsters» (la v1.0, hasta «Movement»). Quedaron sin leer, entre otras, las entradas de *Reach and
  Extend*, *Search*, *Shop*, *Terrain* y *Travel*, que se cubrieron con los reglamentos oficiales. La versión
  alemana va en otro orden (los Estados quedan al final) y la francesa se extrae ilegible.
- **The Esoteric Order of Gamers** (orderofgamers.com): bloqueado por `robots.txt`.
- **Archivo de documentos de FFG** (https://www.fantasyflightgames.com/product-document-archive/): solo tiene la 1ª
  edición.
- **Wiki de descent-community:** las páginas *Bleeding*, *Terrified* y *Heirs of Blood* están vacías; la tabla de
  *Dice* está mal formada (las caras se reconstruyeron con sus probabilidades).
- **descent2e.fandom.com** (https://descent2e.fandom.com/wiki/Cursed): error al leerla.
- **Foro de FFG, hilo «Bleed effect»** (https://ffg-forum-archive.entropicdreams.com/topic/144961-bleed-effect/): es
  de *Imperial Assault*, no de Descent.
- **Noticias de FFG** https://www.fantasyflightgames.com/en/news/2016/3/15/road-to-legend/ y
  https://www.fantasyflightgames.com/en/news/2016/12/20/seeds-of-corruption/: ahora devuelven el índice de
  noticias; el artículo https://www.fantasyflightgames.com/en/ffg_blog/22664/original_content ya no es de Descent.
- **Buscadores** (DuckDuckGo, Bing): bloqueados para la herramienta de lectura.

