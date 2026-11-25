# Escritura de autor maduro y estilos

Cómo escribir los textos de un escenario para que se lean bien en voz alta, den miedo y suenen a un
autor, no a una plantilla. La terminología oficial y el tono lovecraftiano están en
`diseno-escenarios.md` §8; aquí, el oficio.

## Índice

1. [Estructura desde el principio](#1-estructura-desde-el-principio)
2. [Oficio: frase a frase](#2-oficio-frase-a-frase)
3. [Personajes](#3-personajes)
4. [Vicios de principiante](#4-vicios-de-principiante)
5. [Estilos de autor](#5-estilos-de-autor)
6. [Antes de dar un texto por bueno](#6-antes-de-dar-un-texto-por-bueno)

## 1. Estructura desde el principio

Antes de un solo texto, cinco frases:

- **Premisa en una frase**: «Un relojero desaparece y su casa sigue marcando la hora de su muerte.»
- **La verdad oculta**: qué pasó realmente, en orden (la cronología secreta).
- **Lo que se planta y dónde se recoge** (`desafios.md` §6).
- **El giro**: qué cree el grupo hasta la mitad y qué descubre.
- **El precio del final**: qué cuesta ganar (alguien, algo, una certeza). Un final sin precio se
  olvida.

Las cinco fases de `diseno-escenarios.md` §4 son el esqueleto; esto es lo que lo llena.

## 2. Oficio: frase a frase

- **Un detalle concreto vale más que tres adjetivos.** «Una taza con café todavía tibio» da más
  miedo que «una habitación siniestra y opresiva».
- **Sugerir antes que catalogar.** Lo que no se ve entero asusta más: una mano, un olor, un ruido
  que para cuando paráis.
- **Frases cortas y largas, alternadas.** Las largas crean atmósfera; la corta golpea. «Bajáis la
  escalera con la lámpara en alto, contando los escalones porque es lo único que se puede contar.
  Son trece. Ayer eran doce.»
- **Una idea por texto**, y un final que empuja a seguir (una pregunta, un ruido, una puerta).
- **Una paleta de sentidos por sala** (olor, sonido, tacto, temperatura) repartida a lo largo de la
  partida: la biblioteca huele a moho, el sótano está más frío de lo que debería, la cocina tiene un
  zumbido. Si cada sala tiene su firma, los jugadores la recuerdan.
- **Segunda persona del plural, presente** («Abrís la puerta»), como los oficiales; cuando el texto
  es para un solo investigador, singular («Te agachas»).
- **Para leer en voz alta**: de 30 a 90 palabras por ventana; más de 110 empujan los botones fuera de
  la pantalla de un móvil y cansan al lector. Lo largo, en una UI de diario o carta que se lee con
  calma (`patrones.md` §14).
- **Instrucciones de juego aparte de la narración**: primero lo que se ve, después, en una línea o en
  cursiva, lo que hay que hacer («<i>Realiza una tirada de {lore} (2).</i>»).

## 3. Personajes

- **Cada uno con un deseo y una forma de hablar**, no máquinas de dar pistas. El ama de llaves
  quiere que os vayáis antes de que oscurezca y contesta con refranes; el capitán quiere beber y
  miente mal.
- **Lo que dice encaja con lo que quiere**: si oculta algo, sus respuestas lo rodean; la pista se
  saca de lo que evita.
- **Subtexto**: lo que no dice también cuenta. «No subáis al desván» dice más si nunca explica por
  qué.
- **Cambian con lo que pasa**: más asustado, más hostil, más sincero; las variables de confianza
  (`desafios.md` §4) se notan en su forma de hablar.
- **Pocos y memorables**: tres personajes bien hechos valen más que ocho que dicen lo mismo.

## 4. Vicios de principiante

| No | Sí |
|---|---|
| «Un escalofrío recorre tu espalda.» | «Tu aliento hace vaho. Estamos en agosto.» |
| «De repente, oyes un ruido.» | «Algo cae en el piso de arriba. Después, nada.» |
| «Sientes un miedo indescriptible.» | Lo que se ve, que haga sentir: «La sonrisa del retrato tiene más dientes que ayer.» |
| «La habitación es oscura, tétrica y siniestra.» | Un solo detalle concreto. |
| Explicar lo que ya se ve: «Hay una puerta. Es una puerta de madera.» | Decir lo que la puerta tiene de raro. |
| Revelaciones sin preparar («¡Era el mayordomo!») | Plantar antes (`desafios.md` §6). |
| El narrador que juzga: «Has hecho bien en desconfiar.» | Que lo diga un personaje o una consecuencia. |
| Finales que lo explican todo, párrafo a párrafo | Lo justo para entender; una pregunta abierta. |
| Textos que no caben en la ventana (más de 110 palabras) | Partir en dos eventos o pasar a una UI de diario. |
| Diálogos sin voz: todos hablan igual | Un rasgo de habla por personaje. |
| Nombres técnicos en el texto («ve a TileSotano») | `{c:TileSotano}` o `{c:QItemDiario}`, que Valkyrie cambia por el nombre que ve el jugador. |

Las frases gastadas que el editor de Valkyrie Universalis señala («un escalofrío recorre…», «de
repente», «sin previo aviso», «un silencio sepulcral») están en su comprobación de textos; aquí,
la idea: si una frase podría estar en cualquier escenario, no está diciendo nada del tuyo.

## 5. Estilos de autor

Plantillas que cambian las proporciones y el tono. Se elige una al empezar (o dos combinadas) y se
anota en el documento de diseño; cada una trae su ritmo típico para la hoja de ritmo (`ritmo.md`) y
sus recetas.

| Estilo | Lo que pesa | Ritmo típico | Recetas |
|---|---|---|---|
| **Sensorial** | Ambiente, detalles por sala, Mitos de ambientación, sonidos | Lento al principio, muchos latidos pequeños, pocos monstruos hasta la mitad | Paleta de sentidos (§2), Mitos propios de ambientación (`patrones.md` §10), sonido propio |
| **Cinematográfico** | Imágenes de interfaz, música y escenas encadenadas | Escenas cortas con cortes; una UI en cada giro | UI de pantalla completa (`patrones.md` §14), `music=` por escena, efecto «¡oh!» (`desafios.md` §7) |
| **Enigmas** | Puzles integrados en la historia, pistas cruzadas | Bloques de búsqueda y bloques de pensar; la mesa se para a discutir | `desafios.md` §1, rompecabezas (`patrones.md` §13) con pista narrativa |
| **Persecución** | Una amenaza que caza, escondites, huida | Calma, aviso, carrera; ciclos de 3-4 rondas | `desafios.md` §2 |
| **Social** | Personajes, diálogos con decisiones, mentiras | Conversaciones largas entre exploraciones; decisiones cada ronda | `desafios.md` §3 y §4, personajes (`patrones.md` §5) |
| **Supervivencia** | Recursos, tiempo, sacrificios | Reloj desde la ronda 1, decisiones de qué dejar atrás | Plazo corto (`patrones.md` §9), objetos que se gastan, decisiones con precio |
| **Elige tu propia aventura** | Ramas narrativas largas dentro de ventanas | Mucho texto y elección; el tablero acompaña | Varios caminos con consecuencias, cada uno con su epílogo; avisar en la descripción |

Cómo se nota el estilo en el texto:

- *Sensorial*: «El papel pintado está húmedo al tacto. Huele a lirios, y no hay lirios.»
- *Cinematográfico*: frases cortas, presente, cortes: «La luz se va. Una cerilla. Una cara.»
- *Enigmas*: datos precisos y verificables, sin adornar lo que importa.
- *Persecución*: verbos de movimiento y sonido; el texto mide distancias («dos puertas más allá»).
- *Social*: diálogo con voz; poco narrador.
- *Supervivencia*: recuentos, cansancio, frío; cada texto recuerda lo que queda.

## 6. Antes de dar un texto por bueno

- ¿Se entiende leído en voz alta, una sola vez?
- ¿Tiene un detalle que solo podría estar en este escenario?
- ¿Dice qué hay que hacer, sin mezclarlo con la atmósfera?
- ¿Cabe en la ventana (menos de 110 palabras)?
- ¿Suena al personaje que habla?
- ¿Termina empujando a seguir?
