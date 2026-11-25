# Peticiones de la comunidad

Lo que la gente ha pedido en los [issues abiertos de Valkyrie](https://github.com/NPBruce/valkyrie/issues) (213 a 12 de octubre de 2026) y kozka ha elegido para Universalis. Son extras de la web: no cambian cómo se juega un escenario respecto a Valkyrie, salvo que el jugador lo active en Opciones. Lo que tocaría el formato de los escenarios queda fuera hasta pactarlo con Quantumrunner.

Estado: ☐ pendiente · ◐ en marcha · ☑ hecho.

## Opciones

| Estado | Petición | Issue | Notas |
| --- | --- | --- | --- |
| ☑ | Tamaño del texto | #1222 | Normal, grande y muy grande; escala toda la interfaz |
| ☑ | Tamaño de las fichas del tablero | — | Normal o grande (+30 %), en avanzadas, pedido por kozka |
| ☑ | Tamaño de los objetos | — | Normal o grande: el dibujo grande y el nombre al lado, como Valkyrie, en los objetos iniciales, los inventarios, el objeto que da un evento y la tienda; pedido por kozka |
| ☑ | Opciones en la partida | — | «Opciones» en el menú de la partida: tamaños, sonido, interruptores de juego y voz; pedido por kozka |
| ☑ | Opciones ordenadas y a dos columnas en escritorio | — | Pedido por kozka |
| ☑ | Sección «Opciones avanzadas» | — | Con lo que sigue, y el bloqueo de cámara de Valkyrie |
| ☑ | Confirmar el paso de fase (investigadores → Mitos) | #1173 | Avanzada, como la app oficial |
| ☑ | Mantener el zoom cuando el escenario mueve la cámara | #466 | Avanzada |
| ☑ | Ocultar el cursor (iPad con ratón, pantallas táctiles) | #1663 | Avanzada |
| ☑ | Restablecer las opciones predeterminadas | — | Botón al pie de Opciones, con confirmación: vuelven las opciones de la app, los volúmenes y el bloqueo de cámara; no se tocan el idioma, las partidas, las marcas, lo bajado ni la clave de traducción. Pedido por kozka |
| ☑ | Traducción automática | — | Avanzada (`host/translator.ts`, `ui/TranslateOptions.tsx`): con la clave de OpenRouter del jugador (solo en su navegador) y un modelo gratuito de DeepSeek por defecto, o el que elija de la lista de gratuitos o escriba. Al activarla avisa de que puede tener errores y explica cómo sacar la clave. «Probar la traducción» se puede repetir siempre: una prueba nueva o un cambio de modelo dejan la que seguía esperando, cada modelo traduce de nuevo (lo ya traducido se guarda por modelo), dice cuánto tardó, y un modelo que no responde en 60 s da un aviso en vez de quedarse esperando. Si el DeepSeek gratuito por defecto ya no está en OpenRouter, se elige el primero gratuito de la lista. Traduce el texto y los botones de cada ventana de evento cuando el escenario no viene en el idioma del jugador, con líneas que se mueven mientras llega y «Traducción automática» debajo. El encargo al modelo le pide que deje las etiquetas, los colores, los símbolos y los nombres propios, y que adapte las frases hechas. Pendiente: los elementos de interfaz de los escenarios y la descripción de los detalles. Pedido por kozka |

## En partida

| Estado | Petición | Issue | Notas |
| --- | --- | --- | --- |
| ☑ | Separadores en el registro entre entradas, y rondas y fases destacadas | #1519 | |
| ☑ | Copiar el registro | #585 | |
| ☑ | Consultar el registro durante los Mitos | #218 | Ya lo deja Valkyrie en Mansiones (`NextStageButton.Log`); comprobado |
| ☑ | Zoom hacia el cursor y hacia el centro del pellizco | #692 | Siempre, sin opción |
| ☑ | Zoom con el touchpad | #828 | El navegador lo da: el pellizco del touchpad llega como rueda |
| ☑ | Avanzar con Enter o Espacio | #992 | El botón de un diálogo con uno solo |
| ☑ | Botones del HUD en gris mientras hay una ventana abierta | #987 | Solo el aspecto: siguen respondiendo como en Valkyrie |
| ☑ | Resaltar las fichas y los monstruos recién colocados | #696, #256 | Un halo dorado suave bajo la ficha nueva y dos círculos transparentes que crecen desde ella, como el resaltado de Valkyrie (PixiJS, `board/effects.ts`), y un brillo en el monstruo nuevo de la lista |
| ☑ | Cuántos investigadores pide el escenario, y tamaño de su lista | — | En la selección: «Este escenario pide de X a Y · elegidos: N» (`minHero` y `maxHero` del escenario) y tres botones para la lista: pequeños (como antes), grandes y retratos. Pedido por kozka; el aspecto bonito, más adelante |
| ☑ | Efecto al derrotar un monstruo, en vez de quitarlo de golpe | — | El monstruo de la lista se quema y se desvanece; la ficha que se quita del tablero crece, enrojece y se apaga. Pedido por kozka |
| ☑ | Recordar las tiradas de Horror tras las activaciones | #683 | Avanzada, como la app oficial |
| ☑ | Leer en voz alta los textos | #390 | Altavoz en cada evento con la voz del navegador, lectura automática en avanzadas, y la voz se puede desactivar (sin altavoz). Ver «Lectura en voz alta» |
| ☑ | «Quitar eliminado» en el botón de investigador eliminado | — | Como el del fuego: mientras se puede deshacer dice «Quitar eliminado», y en gris cuando el escenario ya no deja (`#eliminatedcomplete`). Lo pidió un jugador por el formulario (1 de noviembre de 2026); también es de Valkyrie (`docs/fallos-y-mejoras.md`) |
| ☑ | Reportar un problema desde la partida | — | En el menú de la partida, para que el informe diga el juego, el escenario (su paquete) y la ronda (6 de noviembre de 2026) |
| ☑ | Aviso sin WebGL | — | Un navegador sin WebGL no dibuja el tablero: ahora lo dice en su sitio y explica qué hacer (activar la aceleración por hardware o probar otro navegador), en vez de dejarlo vacío (6 de noviembre de 2026) |

## Tienda y escenarios

| Estado | Petición | Issue | Notas |
| --- | --- | --- | --- |
| ☑ | Actualizar todos los escenarios de una vez, sin perder la posición en la lista | #1448, #1151 | Botón «Actualizar todos (N)» en la lista en línea; la lista se queda debajo |
| ☑ | Filtro de descargados | #1028 | En la ventana de filtros, en línea: todos, descargados o sin descargar |
| ☑ | Marcar los jugados | #1814 | Las marcas del jugador |
| ☑ | Ver las losetas de un escenario | — | «Ver losetas» en sus detalles, a la derecha de las marcas: aviso de spoiler y, tras continuar, cada loseta de todos sus mapas en pequeño con su nombre debajo (y cuántas copias pide un mapa). Arriba, la mesa que pide el mapa más grande con todas sus losetas a la vez, en centímetros y redondeada hacia arriba de 5 en 5: se calcula colocando cada loseta como Valkyrie (su tamaño, su casilla de anclaje, su giro y su sitio), con una casilla de Descent de 2,5 cm y las losetas de Mansiones como las midió kozka (la cuadrada, 17,7 × 17,7 cm; la del callejón, 17,7 × 8,85), en `CM_PER_UNIT`. Un icono (i) avisa de que puede diferir de la realidad, porque es el tamaño máximo calculado (`ui/InfoTip.tsx`). `screens/QuestTiles.tsx`; pedido por kozka |
| ☑ | Loseta en blanco si falta, en vez de parar | #1513 | Avanzada (`Quest.Tile.blankMissingTiles`): un cuadrado de 3×3 en su sitio. Sin ella, para como Valkyrie. Si solo falta el dibujo, la app ya pintaba el esquema |
| ☑ | Mirar los escenarios sin la importación | — | Los tres juegos se abren sin ella; se pide al empezar un escenario o continuar una partida, y después se vuelve al escenario (`screens/ImportGate.tsx`, 6 de noviembre de 2026) |
| ☑ | Expansiones elegidas bien visibles | — | En la colección, las que tiene el jugador van con borde y fondo encendidos y una marca ✓; las otras, apagadas y con la imagen en gris. En Valkyrie solo cambia el color del texto (6 de noviembre de 2026) |

## Música

| Estado | Petición | Issue | Notas |
| --- | --- | --- | --- |
| ◐ | Música propia de los menús | — | DooM ya suena con la suya («Black Tooth», que mandó kozka, a 128 kbps: `assets/music/doom-menu.mp3`, `audio/appMusic.ts`); no entra en la PWA hasta que suena una vez. Sus autores salen pequeños abajo a la derecha de los menús, «Música: Aim To Head Official (BLACK TOOTH)» con el icono de YouTube que lleva a su canal: cada pieza lleva sus créditos en `appMusic.ts` y se ven los de la que tocan los menús (`ui/MusicCredits.tsx`). La pantalla de elegir juego va sin música de momento (se apaga al volver a ella); cada juego conserva la de su menú. Desde el 6 de noviembre de 2026, los menús de Mansiones y Descent van sin música, porque la que sonaba era la de la importación (de FFG), hasta tener la suya. Desde el 10 de noviembre de 2026 (0.32.0), los menús de los tres juegos tienen su sonido (`audio/menuAmbience.ts`): Descent y Mansiones, un ambiente (viento y piedras; brisa y tormenta lejana con relámpagos) y, sobre él, su lista de música, la primera pieza a los 5 s con fundido y 35 s de ambiente tras cada una; DooM, su música. Los créditos salen de la lista del juego (un autor sin canal solo se nombra). Falta una opción de música (música, ambiente…) y la de la pantalla de inicio |

## Idiomas

| Estado | Petición | Issue | Notas |
| --- | --- | --- | --- |
| ☐ | Tailandés | #1637 | Fuente con su alfabeto |
| ☐ | Indonesio | #1572 | |
| ☐ | Checo con su traducción completa | #1580 | |
| ☐ | Ruso completo | #1578 | |
| ☐ | Más japonés | #1457 | |
| ☐ | Fuente con cirílico | #1586 | |
| ☐ | Revisar el español | #1533 | |

## Lectura en voz alta

Un altavoz en la esquina de cada evento lo lee o lo para, y la opción avanzada lo lee solo al aparecer. En Opciones (avanzadas) y en las opciones de la partida se elige la voz: la del navegador (Web Speech API, `ui/speech.ts`), con la lista de sus voces para el idioma (por defecto, la mejor: las «Natural», «Online» o «Neural» primero), o desactivada, y entonces las ventanas no llevan altavoz. Antes cambiaba de voz a veces porque el navegador da su lista un momento después de cargar la página: ahora la espera y lee siempre con la misma.

Antes de leer se limpia el texto: fuera las etiquetas (`<b>`, `<color>`…), y los símbolos del juego (habilidades, éxito, pista…) se cambian por su nombre en el idioma de la partida.
