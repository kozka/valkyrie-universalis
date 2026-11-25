# Temas

Cómo se organiza el aspecto de la app (11 de octubre de 2026). El código está en `packages/app/src/themes/` y los colores en `theme/theme.css`.

## Qué es un tema

Un tema es todo lo que se ve y no son reglas de Valkyrie. Se elige en Opciones, en «Tema» (`ui/preferences.ts`, clave `theme` de `[Universalis]` en `config.ini`):

| Tema | Estado | Qué trae |
| --- | --- | --- |
| **Universalis** (el predeterminado) | En marcha | Los dibujos de kozka detrás de las pantallas: el caballero en la elección de juego, y en el menú de cada juego la mansión (Mansiones), las salas de lava (Descent) y la fortaleza del infierno (DooM) (`themes/themes.ts`, `UNIVERSALIS`). Y sus pantallas nuevas, una a una: la primera, la selección de investigadores de Mansiones (17 de octubre de 2026, ver abajo). Descent y DooM tendrán las suyas |
| **Clásico** | Hecho | Lo de Universalis hasta el 16 de octubre de 2026: los mismos fondos con las pantallas de siempre, para quien las prefiera o tenga problemas con las nuevas (`newScreens()` en `themes/themes.ts`) |
| Negro, Verde, Granate y Azul | Hechos | Las pantallas planas, del color elegido, sin dibujos |
| **Valkyrie clásico** | Por hacer | Para los nostálgicos: los colores, las ventanas y los botones de Valkyrie tal cual |

Descent y DooM tendrán lo mismo: su aspecto clásico (el de Valkyrie) y el suyo propio en Universalis.

## Dónde va cada cosa

- `themes/themes.ts`: la lista de temas y lo que cada uno dibuja en cada sitio (`Place`: `start`, `MoM`, `D2E`, `DooM`).
- `themes/Backdrop.tsx` y `backdrop.css`: el fondo de una pantalla. La imagen completa, quieta, por CSS (el móvil y «menos movimiento» se quedan ahí); en pantallas anchas con ratón, encima, su animación de PixiJS (`Art`).
- `themes/universalis/`: lo propio de Universalis. `scene.ts` es lo que comparten los fondos de los menús: la imagen entera con las capas de kozka encima; una cámara que va una vez, en 45 s, de una vista a otra y se queda ahí, apenas moviéndose; nieblas que derivan y se arremolinan (las cercanas se mueven más con la cámara), humos, luces que respiran o titilan, telas que ondean y cosas colgadas que se balancean. Cada fondo dice lo que tiene: `mansionArt.ts` (de la izquierda, con el bosque, a la casa, más las ventanas que se apagan), `lavaArt.ts` (de las cascadas de lava a la puerta en llamas) y `fortressArt.ts` (de la puerta de la fortaleza al guerrero, a la izquierda, junto al menú). El caballero sigue en `screens/menuArt.ts`, porque se hizo antes, y sus imágenes en `src/assets/`.
- `theme/theme.css`: los colores y fuentes (roles). Un tema cambia los roles con `:root[data-theme='…']` y nunca escribe colores en los componentes.

## La selección de investigadores de Mansiones (Universalis)

El 17 de octubre de 2026 kozka mandó el estudio (`brand/hero-room/`), sus marcos dorados y el dibujo de la pantalla entera. `themes/universalis/HeroRoom.tsx` la monta en HTML sobre el estudio vivo de `heroRoomArt.ts` (PixiJS):

- **El estudio** llena la pantalla, mucho más oscuro que el dibujo (17 de octubre, a petición de kozka, como su -150 de brillo y +50 de contraste: `hero-room.webp`).
  - Las velas iluminan lo que tienen cerca: el dibujo original (`hero-room-lit.webp`) se ve a través de un mapa de luz alrededor de cada grupo de velas, que respira con sus llamas.
  - Cada una de las nueve velas tiene su llama y su brillo, y a veces una ráfaga las inclina a la vez.
  - Tras el cristal de la ventana hay una tormenta: nubes bajas, lluvia inclinada, gotas que resbalan por el cristal y, cada 7 a 18 s, un relámpago, con su rayo en el cielo y toda la habitación iluminada un instante.
  - Con «menos movimiento» se queda quieto.
- **Los marcos** van en un escenario de proporción 3:2, tan grande como quepa. Todo se sitúa en píxeles del dibujo (1536×1024) y las letras se miden en el ancho del escenario.
  - El título, los nombres y los botones se encogen hasta caber en su sitio en cualquier idioma (`useFit`), también cuando llegan las fuentes de Mansiones.
  - Al entrar, el estudio sale de la oscuridad en algo más de medio segundo y los marcos, un instante después.
  - Ocho óvalos por página, con flechas que brillan cuando hay más, y un punto por página bajo el título, entre los dos óvalos del centro, encendido el de la que se ve (también se pueden pulsar). Abajo chocaban con la calavera.
  - En pantallas táctiles, deslizar el dedo a un lado pasa de página, sin elegir al investigador sobre el que empezó.
  - Pasado el último investigador, las siluetas del dibujo en blanco y negro.
  - Cada óvalo muestra el retrato ovalado de la importación (`Oval_Investigator_…`), o el redondo si no lo hay. Va recortado con la forma exacta del hueco (`hero-room-oval.webp`) y con el mismo retrato desenfocado detrás, para que no quede ningún hueco negro.
- **Al elegir a alguien**, su óvalo se queda en gris (ya no se puede elegir) y una copia de su retrato vuela ondulándose hasta el primer círculo libre de abajo, donde se queda ajustada dentro del círculo.
  - Pulsarlo abajo lo suelta, como el icono del héroe en Valkyrie (`HeroCanvas.HeroDiag`).
  - Brillan como brasas tantos círculos como pide el escenario, y más suaves los demás hasta el máximo.
  - «Terminado» está algo apagado hasta que hay bastantes, y entonces se enciende con un brillo suave.
- **Puesta en vertical** (un móvil que juega en vertical), la lista clásica: la sala está pensada en horizontal.

### La selección de escenarios de Mansiones

El 17 de octubre de 2026 kozka mandó la maqueta de la lista y sus piezas sueltas: el marco del escenario, la foto antigua, el cuadro de texto, el botón y el banner del título (`brand/scenario-list/`). `themes/universalis/scenarios.css` viste con ellas la lista clásica (`QuestSelectionScreen.tsx`), que no cambia de lógica: solo lleva unos ganchos para el tema (`data-fact` en cada dato, clases en los botones y la portada repetida detrás de la tarjeta).

- **Ventanas por trozos**, como las de antes: cada pieza se corta en nueve (`border-image`), con las esquinas tal cual y los lados estirados, así que vale para cualquier tamaño y cualquier idioma. Es el sistema que usarán las ventanas de los eventos.
- **El título**: el banner va limpio, sin su cresta ni su medallón, para estirarse con el texto, y los dos adornos se ponen encima, centrados.
- **Los botones**: el marco dorado para Jugar o Descargar, con su flecha; el mismo en rojo para Volver, Desconectarse y «Expansiones que faltan»; el marco fino para la búsqueda, la ordenación, el filtro y los botones de la lista. Los iconos son SVG en la hoja de estilos, del color del texto.
- **La dificultad**, en tentáculos de kozka en lugar de los rombos de Valkyrie, algo más altos que ellos: cinco apagados y en rojo hasta donde llega la dificultad, también en el detalle (que antes los tenía dorados).
- **Cada escenario**: su portada en la foto antigua, inclinada como su hueco, y repetida a la derecha de la tarjeta, difuminada; los datos con sus iconos bajo una línea dorada.
- **El fondo**: el estudio de los investigadores, aún más oscuro, quieto.
- En pantalla estrecha, el título arriba y la foto más pequeña. Los demás juegos, de momento, con la lista clásica.
- **Retoques del 17 de octubre por la tarde**, a petición de kozka: «desconectarse» en versalitas (Valkyrie lo escribe en mayúsculas), más pequeño y sin pisar el título; la búsqueda, la ordenación y las opciones de los filtros, como campos discretos (una línea dorada fina sobre lo oscuro), no como botones; «Clasificar», texto sin marco; la ventana de filtros, con el marco de la tarjeta, el botón dorado y lo elegido encendido en dorado.

### El detalle de un escenario de Mansiones

El mismo día kozka mandó la maqueta del detalle, la biblioteca de fondo, otra foto antigua (con esquinas de metal) y el botón de pergamino de «Iniciar» (`brand/scenario-details/`). La misma hoja, `scenarios.css`, viste la pantalla clásica (`QuestDetailsScreen.tsx`), con sus piezas en una sola rejilla como en la maqueta.

- **Arriba**, el nombre en el banner del título (si no cabe, se corta con puntos suspensivos) y, a la derecha, «Notificar error», «Eliminar» en rojo y «Ver losetas».
- **A la izquierda**, la portada en la foto antigua; a su derecha, las marcas del jugador (Jugada, Favorita, Pendiente, con el icono encendido si están puestas), la descripción en el marco de la tarjeta y la dificultad, la duración y los autores, cada uno en su caja con su icono. Unos autores de varias líneas (con traductores, como en muchos escenarios) ocupan su fila entera, en columnas.
- **Abajo**, Volver en rojo e «Iniciar» en el pergamino de kozka, con la tinta oscura. El botón llegó con la palabra pintada: se le quitó, juntando sus remates con un trozo de pergamino limpio, para escribirla en cada idioma.
- **El fondo**: la biblioteca, con sus catorce velas encendidas como en el estudio (`libraryArt.ts`, con las llamas comunes de `candles.ts`): cada llama la suya, que tiembla y se inclina con alguna ráfaga, y su luz cálida sobre las estanterías, que respira con ellas. Con «menos movimiento», la biblioteca quieta.


- **Mi traducción** (también fuera de este tema y en Descent): al lado de «Ver losetas», abre una ventana para cargar una traducción propia del escenario (`screens/CustomTranslation.tsx`, más abajo).

### Las ventanas de la partida de Mansiones

Desde el 17 de octubre de 2026, con el tema Universalis, todas las ventanas de una partida de Mansiones (los eventos, los objetos, el inventario, el registro, los rompecabezas, el monstruo) y las de las pantallas de escenarios llevan el marco de la tarjeta, y sus botones el marco dorado (`themes/universalis/play.css`). Cada botón conserva el color que le da el autor, y el texto de un evento queda separado de sus botones por una línea dorada. La sombra sigue la forma del marco. Sobre el tablero, Menú y la flecha de siguiente fase (abajo a la derecha) llevan el marco dorado de kozka, del mismo tamaño que tenían (sin la palabra, que se escribe en cada idioma), y Objetos, Set y Registro de la barra de fases son sus dibujos: una mochila, un mapa y un libro, que brillan al pasar por encima; sus palabras siguen ahí para los lectores de pantalla. En el móvil, los dibujos algo más pequeños.
## Ventanas, botones e iconos (para cuando lleguen los dibujos)

La interfaz es HTML con React; PixiJS queda para el tablero y los fondos. Los marcos se pondrán con CSS (`border-image`), que dibuja un marco de nueve trozos a cualquier tamaño, nítido y sin coste:

- **Lo mejor que puede mandar kozka**: por cada estilo de ventana, una sola imagen cuadrada (unos 512×512, o el doble para pantallas de alta densidad) con el marco entero: las cuatro esquinas, los cuatro lados y el fondo. Los lados tienen que poder estirarse o repetirse sin que se note (sin adornos únicos en medio). Con eso se indica cuánto mide cada esquina y ya está.
- **Si un lado lleva un adorno único** (un remate en el centro de arriba, por ejemplo): ese adorno aparte, en su propia imagen, y los lados lisos. Se pone encima, centrado.
- **Botones**: igual, pero en tres trozos a lo ancho (izquierda, centro que se estira, derecha), o en nueve si crecen también a lo alto; uno por estado si cambian (normal, encima, pulsado, desactivado), o uno solo y los estados con brillo y filtros.
- **Iconos**: mejor en SVG; si no, PNG de 128 px con fondo transparente.
- **Texturas** (el papel de las ventanas en partida, el fondo de los registros): imágenes que se repitan sin costuras, de 256 o 512 px.

## Mansiones: los símbolos de las habilidades

Valkyrie dibuja las habilidades y los símbolos de Mansiones con su fuente `MADGaramondPro`, que lleva en sus `Resources` (caracteres U+F200 a F20F). Hasta el 11 de octubre la app la tomaba de la importación, y la de Android de kozka no trae fuentes: por eso salían como palabras. Ahora se baja del repositorio de Valkyrie al elegir Mansiones (`host/gameFonts.ts`), como ya se hacía con las de Descent. Los iconos propios de Universalis, cuando lleguen, sustituirán a esos caracteres en el tema Universalis (`ui/Symbols.tsx`).
