# Diseño de escenarios: cómo hacer uno bueno

Buenas prácticas para diseñar escenarios de *Las Mansiones de la Locura* en Valkyrie: cómo están
hechos los oficiales, qué valora y qué critica la comunidad (reseñas de BGG 2017-2026, guía de
scrubbless, estadísticas de Valkyrie) y cómo escribir terror lovecraftiano en español. Las recetas
técnicas están en `patrones.md`.

## Índice

1. [Proceso de trabajo](#1-proceso-de-trabajo)
2. [Documento de diseño (plantilla)](#2-documento-de-diseño-plantilla)
3. [Cómo funcionan los escenarios oficiales](#3-cómo-funcionan-los-escenarios-oficiales)
4. [Estructura recomendada en cinco fases](#4-estructura-recomendada-en-cinco-fases)
5. [Mapa y duración](#5-mapa-y-duración)
6. [Pistas, misterio y finales](#6-pistas-misterio-y-finales)
7. [Equilibrio y dificultad](#7-equilibrio-y-dificultad)
8. [Escribir en español: tono y terminología](#8-escribir-en-español-tono-y-terminología)
9. [Lo que gusta y lo que se critica](#9-lo-que-gusta-y-lo-que-se-critica)
10. [Cómo evitar bloqueos](#10-cómo-evitar-bloqueos)
11. [Pruebas](#11-pruebas)
12. [Descripción y presentación](#12-descripción-y-presentación)

---

## 1. Proceso de trabajo

1. **Historia antes que ficheros.** Escribe la verdad del caso (qué pasó realmente, en orden) y
   después el orden en que la descubrirán los jugadores. Es el consejo de Lovecraft para el relato
   de misterio ("dos sinopsis") y el de todos los autores veteranos. Añade las cinco frases de
   `escritura.md` §1 (premisa, verdad, lo que se planta, el giro, el precio del final) y elige un
   estilo (`escritura.md` §5).
2. **Cadena de pistas.** Para cada revelación importante, al menos dos caminos para llegar a ella.
3. **Mapa en papel**: qué habitaciones, qué se ve al empezar, qué se revela al explorar.
   **Hoja de ritmo** (`ritmo.md`): qué encuentra la mesa en cada ronda, qué amenaza crece, qué
   decisión hay y quién está ocupado. Enigmas, amenaza y decisiones con `desafios.md`.
4. **Rellenar el documento de diseño** (§2) y revisarlo con alguien.
5. **Construir por bloques** y validar cada poco (`validar.py`, `grafo.py`, `mapa.py --png`).
6. **Revisión independiente** con la rúbrica de `revision.md` (un revisor que no ha visto el
   diseño recorre la partida como una mesa y puntúa nueve criterios).
7. **Probar mucho más de lo que se programa**: con el mínimo y el máximo de investigadores, con las piezas reales.
8. Publicar, leer las reseñas y estadísticas, y sacar versiones corregidas.

Referencias de esfuerzo de la comunidad: un escenario sencillo, 40-50 horas (4-5 semanas); uno
complejo, 4-5 meses. Con esta skill la parte de ficheros es mucho más rápida, pero la historia y las
pruebas siguen llevando su tiempo.

## 2. Documento de diseño (plantilla)

Rellénalo con el autor antes de generar nada. Lo que no se sepa se decide con valores razonables y
se marca para revisar.

```markdown
# <Título>
- Identificador: <SinEspacios>          - Idioma: Spanish (+ English?)
- Investigadores: 1-5                    - Expansiones obligatorias: ninguna / …
- Duración objetivo: 90-120 min          - Dificultad: 3/5 (difficulty=0.6)
- Tipo: investigación / combate / mixto  - Finales: 3 (2 victorias, derrota)
- Tono y avisos de contenido:

## Premisa (lo que leen los jugadores) y premisa en una frase
## Estilo (escritura.md §5) y tono
## La verdad (cronología real, secreta)
## Lo que se planta y dónde se cobra; el giro; el precio del final
## Red de preguntas (investigacion.md §2): qué querrá averiguar la mesa, qué lleva a qué, tres pistas por conclusión imprescindible
## Personajes: deseo, forma de hablar, qué ocultan, cómo cambian
## Hoja de ritmo (ritmo.md §3): una fila por ronda
## Decisiones: cuáles, cuándo, y su eco (desafios.md §3)
## Orden de revelación (lo que descubren y cuándo)
## Mapa: losetas, qué se ve al empezar, qué se explora y desde dónde
## Salas: la descripción al colocarlas y las fichas que salen de ella (qué da cada una, coherente con dónde se busca)
## Progreso: fuentes de pista (≥ 1,5 × las necesarias) y umbral (escalado con #heroes)
## Objetivo revelado: cuándo y qué tarea final
## Monstruos: cuáles, cuándo y dónde aparecen; monstruos propios
## Rompecabezas: tipo, dónde, pista narrativa
## Tiempo: límite, avisos, qué lo acelera o retrasa
## Mitos: escalada (K − #heroes según la duración), lugares, mitos propios
## Finales: condiciones y epílogos (victoria, victoria pírrica, tiempo, eliminación)
## Objetos: iniciales, únicos que se ganan
```

## 3. Cómo funcionan los escenarios oficiales

- **Objetivo oculto.** Prólogo narrado, el grupo empieza en una habitación y no sabe qué tiene que
  hacer. Investigando, la app revela el **objetivo** con una tarea final. Es el punto de inflexión
  de casi todos.
- **Derrota por tiempo** con temporizadores ocultos (eventos que dependen de cuántas rondas se
  tarda) y **por eliminación** (una ronda de margen tras caer un investigador).
- La app conoce investigadores, monstruos y algunos efectos del entorno, pero **no la posición de
  nadie**: los textos dicen "el investigador más cercano…" y los jugadores lo resuelven.
- **Tensión con información oculta**: temporizadores invisibles, Mitos de ambientación ("crujidos,
  un grito lejano… no pasa nada, que sepáis"), avisos antes de que todo se descontrole.
- **Rastro de migas**: estanterías, fotos, cajas y personajes dan historia, pistas u objetos; la
  investigación es una cadena de interacciones.
- **Variación**: objetos, pistas y monstruos cambian de sitio entre partidas; el mapa suele ser
  fijo. Los recientes añaden mapas alternativos (*The Mirror of a Man*, 2026) y estructura en
  actos (*Turn of a Page*, 2025: calles → tienda → oleadas tras un portal).
- Duraciones: 60-360 min, la mayoría 120-180. Dificultad de 2 a 5 estrellas.

## 4. Estructura recomendada en cinco fases

1. **Prólogo** (un único `EventStart`, diálogo o UI): gancho personal (una carta, un encargo, un
   imprevisto), lugar y hora. Sin revelar el objetivo.
2. **Investigación inicial** (rondas 1-4): pocas habitaciones visibles, varias interacciones que
   crean ambiente y dan las primeras pistas. Solo Mitos de ambientación (y ayuda). Ningún monstruo
   o uno débil.
3. **Escalada** (desde la ronda 4 aprox., según `#heroes`): Mitos menores, primeras apariciones
   escaladas por investigador, zonas nuevas, un personaje o un rompecabezas que bloquea. Un
   contador de "progreso" suma los descubrimientos clave.
4. **Revelación del objetivo** (progreso ≥ umbral escalado): diálogo o UI con la tarea final; Mitos
   mayores; empieza o se acorta el temporizador.
5. **Clímax y desenlaces**: enfrentamiento, huida o decisión; epílogos distintos según variables
   (victoria limpia, victoria pírrica, derrota por tiempo, derrota por eliminación). Si se alarga,
   Mitos mortales.

Ritmo: con la escalada `K − #heroes` (tabla por duración en `patrones.md` §9) y 4 investigadores en
una partida de 2-3 horas, menores hacia la ronda 4, mayores hacia la 8 y mortales hacia la 16; en
una de 60-90 minutos, hacia la 3, la 6 y la 11. El clímax debe llegar antes de los mortales.
"Subida lenta y final frenético" es de lo más elogiado.

## 5. Mapa y duración

- **Tamaño proporcional a la duración** (orientativo, contando losetas de 2×1 y 2×2 espacios):

  | Duración | Losetas |
  |---|---|
  | 60-90 min | 4-6 |
  | 90-120 min | 6-8 |
  | 2-3 horas | 8-12 |

  Un mapa sobredimensionado alarga la partida sin aportar (*Stress and Strain* v2 redujo el mapa y
  la partida fue un 30 % más corta).
- Empieza con 1-3 losetas y revela el resto explorando. Las sorpresas y el objetivo suelen ir
  ligados a lo que aparece al explorar.
- Varias entradas a una misma zona hacen el mapa menos lineal (y permiten rodear a un monstruo).
- Evita puertas que den contra paredes (hay 8 fichas de pared en la caja) y no uses las dos caras
  de la misma loseta física.
- Coloca las fichas sobre el dibujo que representan (Búsqueda sobre el escritorio).
- Si usas expansiones, que sean necesarias de verdad. La mayoría de escenarios fan se limitan a la
  caja básica; las expansiones más extendidas son *Calles de Arkham* y *Pesadillas Recurrentes*
  (kit de conversión). Contenido opcional por expansión con `#SoA` y similares.

## 6. Pistas, misterio y finales

- Las **Pistas** (fichas) son un recurso mecánico: convierten lupas en Éxitos y dan pasos extra en
  rompecabezas. Dales con moderación (1 por hallazgo importante) y recuerda que la Oscuridad las
  bloquea.
- Las **pruebas del misterio** son información: guárdalas como variables y, si son importantes,
  como objetos con nombre evocador y un `inspect` que muestre el documento (un diario, una carta).
  Los nombres genéricos ("Prueba fotográfica") delatan que son piezas del final: usa el texto para
  darles identidad.
- **Cada búsqueda debe aportar algo a la historia**: la queja típica es "solo daba un objeto". Y
  debe haber un motivo para hacerla: la sala se describe al ponerla y cada ficha sale de esa
  descripción (`investigacion.md` §3).
- **Pistas falsas**: con moderación. La verdadera debe ser inequívoca y la falsa no debe poder
  bloquear la partida. Cuidado con el metajuego: si el grupo se pone a "buscar el McGuffin" sin
  leer, el misterio no funciona.
- **Más fuentes de progreso que las necesarias** (1,5×): una pista perdida (un personaje muerto,
  una ficha retirada) nunca debe bloquear la partida.
- **Finales múltiples**: muy valorados (*Una difícil decisión* tiene 6), pero hay que
  **señalizarlos**: que se note que una elección pesa (botones explícitos) y que cada final tenga
  su epílogo claro ("Habéis ganado… a un precio").

## 7. Equilibrio y dificultad

- **Escala todo con `#heroes`**: vida de monstruos (`healthperhero`, `uniquehealthhero`), umbrales
  de Mitos y plazo (K − `#heroes`, tabla en `patrones.md` §9), pistas necesarias (1 + `#heroes`/2), número de monstruos.
- Lo diseñado para 4-5 suele ser imposible con 2 y lo diseñado para 2, un paseo con 5 (*In Places
  Unseen*). Los oficiales se ganan más fácilmente con 3 o más. Prueba con el mínimo y el máximo que admita el escenario.
- Con 2 investigadores evita que el "monstruo grande" salga demasiado pronto.
- **Armas**: si el escenario regala armas potentes, excluye escopeta y Tommy Gun de los objetos
  iniciales (`itemname=` con `traits` = exclusiones) o añade monstruos. "Demasiadas armas" hace
  trivial el combate.
- **Tiradas**: con 3-4 dados, dificultad 1 ≈ 76-85 %, dificultad 2 ≈ 32-48 %, dificultad 3 ≈ 5-15 %
  sin Pistas (`reglas-mom.md` §6.5). Las oficiales piden casi siempre 1-2. Las tiradas
  acumulativas (cuota) evitan bloqueos: siempre se acaba lográndolo, a costa de tiempo.
- **Dificultad declarada** (`difficulty`): 0,4 = 2 estrellas (introductorio), 0,6 = 3, 0,8 = 4,
  1 = 5. En los oficiales las estrellas miden cuánto daño se espera que sufra el grupo al ganar.
- **Duración declarada**: cronometra las pruebas y suma margen; los jugadores leen todo en voz alta
  y comentan (*Robbery of the Kadakian Idol* decía 30-90 min y duraba 60-120).

## 8. Escribir en español: tono y terminología

**Principios** (de *Notes on Writing Weird Fiction* de Lovecraft, adaptados):
- Una sola anomalía central; todo lo demás, realista y verosímil.
- Construir la emoción poco a poco alrededor de esa anomalía; **sugerir** con detalles concretos
  (un olor, un sonido, algo fuera de lugar) en vez de catalogar horrores.
- Ambiente y estado de ánimo antes que acción. Los personajes reaccionan como lo haría alguien real.
- El horror como **revelación** de algo que siempre estuvo ahí; conocimiento que cuesta la cordura;
  un cosmos indiferente. Lo viscoso y lo informe antes que el gore.

**En la app**:
- Diálogos de 2-4 frases; encadena con "Continuar". El texto que desborda tapa los botones.
- `<i>` para cartas, diarios y voces; `<b>` para títulos ("<b>El sótano</b>") y para el objetivo.
- Narración en segunda persona y **vosotros** de forma coherente ("encontráis", "tenéis");
  "tú" para lo que le pasa a un investigador concreto. Los personajes de los años 20 pueden
  tratar de usted.
- Mitos de ambientación propios para crear tensión sin castigo: ruidos, olores, sombras, cambios
  sutiles en lo ya visto.
- **Terminología oficial** (Guía de referencia en español; tabla completa en `reglas-mom.md` §17):

| Escribe | No escribas |
|---|---|
| tirada de {observation} (2), superar / fallar la tirada | prueba, test, chequeo |
| Éxito, Investigación (lupa) | acierto, símbolo |
| sufres 2 de Daño / 1 de Horror (anulado por {will}) | pierdes 2 de vida |
| Herido, Loco, Aturdido, Desconcertado, Retenido, Concentrado | Malherido, Confuso, Inmovilizado |
| ficha de Búsqueda / Exploración / Interacción / Vistazo / Personaje | token, marcador |
| Objeto común, Objeto único, Hechizo, Pista | ítem, carta de objeto |
| Obstrucción, Oscuridad, Fuego, Pasadizo secreto | barricada (válido en la comunidad, no oficial) |
| Evitar / tirada de evasión; tirada de Horror | esquivar (es la traducción de Valkyrie) |
| Fase de los Investigadores / de los Mitos; ronda | turno (para la ronda) |
| Percepción, Horror, Agresividad (monstruos) | consciencia, fuerza bruta |

- "Prueba" en el juego es el rasgo *Evidence* (Prueba fotográfica…): no lo uses para las tiradas.
- Nombres oficiales: usa `{c:TileX}`, `{type}`, `{c:QItemX}` y `{ffg:CLAVE}` para que Valkyrie
  ponga el nombre oficial traducido en lugar de escribirlo a mano.

## 9. Lo que gusta y lo que se critica

**Gusta** (oficiales y fan): tensión sostenida y presión de tiempo (*Escape from Innsmouth*);
mezcla de combate e investigación; varias condiciones de victoria y finales ramificados
(*Gates of Silverwood Manor*); riesgo/recompensa (*The 10:50 to Arkham*); puzles integrados en el
mapa; personajes con peso; giros originales (un gato que guía, emboscadas, esconder un cuerpo);
uso lógico de los objetos; escenarios sin monstruos que se sienten distintos; producción propia
(imágenes y audio).

**Se critica**: linealidad (un solo camino: *Exotic Material*, 3/10); escenarios largos con poco
contenido (*Rising Tide*); textos interminables; condiciones de victoria y temporizadores poco
claros; combate puro sin matices; **vagar sin rumbo buscando "la pista"**; personajes cuya
conversación no sirve para nada; objetos críticos sin ninguna pista que los señale; mal equilibrio
con 2 jugadores; duración anunciada irreal; mapas enormes; finales abruptos o sin señalizar; tramas
fijas sin variación (*The Truth*, 5/10).

**Etiquetas** que los jugadores quieren conocer de antemano: Combate, Jefe final, Investigación,
Social, Puzle, Supervivencia. Dilo en la descripción.

**Con números** (127 escenarios de la tienda con 40 partidas o más, `datos-tienda.md`): las
aventuras largas y con mucha historia tienen mejor nota; a igual duración, lo que más separa a las
mejor valoradas es el sonido propio, las imágenes propias y las decisiones (más del doble por hora);
el tamaño del mapa, el número de fichas y de monstruos no se nota; y las que se ganan más del 90 %
de las veces gustan menos que las que se ganan entre el 60 y el 90 %.

## 10. Cómo evitar bloqueos

- Bucles sin condición de salida o sin contador.
- Ramas sin salida y finales inalcanzables: `grafo.py` muestra lo que no se alcanza desde ningún
  disparador.
- Texto que tapa los botones (diálogos largos, pantallas pequeñas).
- UI (diario, puzle propio) sin botón para cerrarla, o que se queda en pantalla y bloquea "Fin de
  fase".
- Fichas que no se retiran tras usarse (se repiten acciones o se rompe el orden).
- Depender del orden de varios `EventStart`, o de eventos `Mythos` frente a los genéricos.
- Variables que se activan antes de tiempo o diálogos que asumen un orden ("ya has visto X"):
  **prueba los descubrimientos en órdenes distintos**.
- Objetos o pistas críticos que se pueden perder (un personaje muere, una ficha desaparece): prevé
  una ruta alternativa.
- Puertas que solo se abren con una llave que puede no aparecer: añade siempre una alternativa
  (tirada acumulativa, otro camino).
- Monstruos o losetas de expansiones no declaradas (sin alternativa del base).
- Olvidar la derrota por eliminación (`trigger=Eliminated`) o por tiempo.

## 11. Pruebas

1. `python scripts/validar.py <carpeta>`: sin ERRORES ni AVISOS sin explicar.
2. `python scripts/grafo.py <carpeta>`: lee la historia entera en el esquema; busca "Sin alcanzar".
3. `python scripts/mapa.py <carpeta> --png mapa.png`: puertas, fichas de Exploración y paredes.
4. Valkyrie > editor > **Guardar y probar** con el mínimo y el máximo de investigadores. En la partida, Registro +
   **Alt+D** muestra y deja editar las variables (salta a partes concretas).
5. Partida completa con las piezas físicas: cronométrala y anota dudas de los jugadores.
6. Pruebas con un grupo que no conozca la historia: detectan linealidad y ambigüedades.
7. Tras publicar: estadísticas (victorias por número de investigadores, duración real), reseñas
   y versiones rápidas con las correcciones.

## 12. Descripción y presentación

- **Título** evocador y corto. **Sinopsis** de una línea sin destripes.
- **Descripción tipo tráiler**: gancho, tono, si es de investigación o de combate, número de
  investigadores, duración, expansiones, número de finales y avisos de contenido.
- **Portada** de unos 200×200 px en JPG.
- **Créditos** (`quest.authors`): autor, traductores, probadores, procedencia de imágenes y audio.
- Identificador sin espacios y descriptivo; `defaultlanguage` correcto; `lengthmin`/`lengthmax` y
  `difficulty` realistas.
