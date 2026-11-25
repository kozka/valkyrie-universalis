# Mecanismos con UI: máquinas, teclados, mapas y mochilas

La UI no sirve solo para cartas y prólogos (`patrones.md` §14). Con imágenes, textos y botones
encadenados se construyen aparatos que la mesa maneja con el dedo: un piano, una caja fuerte, un mapa
que se recorre en primera persona, una mochila con ranuras. Lo hace la gente en la tienda (*Bruma
maldita 2*, *L'Asile oublié*, *A Strain on Reality*, *Carta triste*) y funciona, aunque el montaje sea a
mano. Este fichero recoge cómo, comprobado contra el código de Valkyrie (vía Valkyrie Universalis).

## Índice

1. [Lo que hay que saber de la UI](#1-lo-que-hay-que-saber-de-la-ui)
2. [Interruptor de dos estados](#2-interruptor-de-dos-estados)
3. [Teclado con memoria (el piano)](#3-teclado-con-memoria-el-piano)
4. [Visor con números](#4-visor-con-números)
5. [Rueda o dial](#5-rueda-o-dial)
6. [Recorrido en primera persona](#6-recorrido-en-primera-persona)
7. [Mochila o panel con ranuras](#7-mochila-o-panel-con-ranuras)
8. [Bucle que se llama a sí mismo](#8-bucle-que-se-llama-a-sí-mismo)
9. [Diseñar el aparato](#9-diseñar-el-aparato)

## 1. Lo que hay que saber de la UI

- **Una UI es una imagen o un texto** (si `image=` está vacío, se dibuja `Nombre.uitext`). Con
  `buttons=1` y `event1=`, pulsarla dispara ese evento; con `buttons=0` es solo decorado.
  `clickeffect=false` quita el efecto al pulsar.
- **Capas**: se dibuja en el orden en que se añade. En un mismo `add=`, de izquierda a derecha: fondo,
  piezas, textos, botones.
- **Posición**: con `vunits=true` todo se mide en alturas de pantalla; sin `halign`/`valign` se centra
  y `xposition`/`yposition` la desplazan desde el centro (y positiva = hacia abajo). Una tecla de
  `size=0.045` en `x=-0.10, -0.05, 0, 0.05…` hace una fila.
- **Orden dentro de un evento**: `operations` → `add` → `remove`. Si una UI ya está en pantalla, `add`
  no hace nada; si un evento la añade y la quita a la vez, se queda quitada. Para **cambiar** una UI
  (otra imagen, otro número), quítala en un evento y añade la nueva en el siguiente.
- **El texto de una UI se calcula al añadirla**: admite `{var:x}`, `{c:…}` e iconos, pero no se
  actualiza solo (§4).
- **Se puede pulsar en cualquier fase**: las fichas no responden en la fase de Mitos, la UI sí.
- **Con una UI en pantalla no funciona «Fin de fase»**: todo aparato necesita un botón de salir que lo
  retire entero (o `remove=#uicomponents`).
- **El evento que monta el aparato no lleva botones** (silencioso, `buttons=0`): la partida espera a
  que pulsen una pieza. Cada pieza lleva a un evento silencioso que hace su cuenta y, si hace falta,
  repinta.
- Cada pieza necesita un nombre único en `ui.ini`. Un aparato de 20 piezas son 20 secciones: hazlas con
  un script (`valkyrie_io.Scenario.set`) en vez de a mano.

## 2. Interruptor de dos estados

Una palanca, una lámpara, una válvula. Dos UI en el mismo sitio, una por estado, y una variable.

```ini
; ui.ini
[UIPalancaArriba]
image=img/palanca_arriba.png
size=0.2
vunits=true
xposition=-0.3
display=false
buttons=1
event1=EventPalancaBaja
clickeffect=false

[UIPalancaAbajo]
image=img/palanca_abajo.png
size=0.2
vunits=true
xposition=-0.3
display=false
buttons=1
event1=EventPalancaSube
clickeffect=false

; events.ini
[EventPalancaBaja]
display=false
buttons=1
event1=EventComprobarPanel
operations=palanca1,=,1
remove=UIPalancaArriba
add=UIPalancaAbajo
audio=AudioClick1
```

Aquí funciona en un solo evento porque `add` y `remove` son de piezas distintas. Con varias palancas,
la comprobación final mira todas las variables a la vez (`EventComprobarPanel` con `vartests` o con
condiciones de botón).

## 3. Teclado con memoria (el piano)

*Bruma maldita 2*: seis teclas de piano en UI. Cada tecla suena y guarda su número; el aparato apunta
las pulsaciones en ranuras y, al llenar la última, compara con las secuencias válidas.

```ini
[UI_tecla1]                ; una por tecla: misma imagen, distinta x
image=img/tecla.png
size=0.045
xposition=-0.1
yposition=-0.055
display=false
buttons=1
event1=Event_tecla1

[Event_tecla1]             ; una por tecla
display=false
buttons=1
event1=Event_apuntar
operations=tecla,=,1
audio=sonidos/piano1.ogg

[Event_apuntar]            ; la primera ranura vacía se queda con la tecla
display=false
buttons=1
event1=Event_ranura1 Event_ranura2 Event_ranura3 Event_comprobar

[Event_ranura1]
display=false
buttons=0
operations=nota1,=,tecla
vartests=VarOperation:nota1,==,0

[Event_ranura2]
display=false
buttons=0
operations=nota2,=,tecla
vartests=VarOperation:nota2,==,0

[Event_ranura3]            ; la última comprueba
display=false
buttons=1
event1=Event_comprobar
operations=nota3,=,tecla
vartests=VarOperation:nota3,==,0

[Event_comprobar]
display=false
buttons=2
event1=Event_acierto
event1Condition=VarOperation:nota1,==,4 VarTestsLogicalOperator:AND VarOperation:nota2,==,2 VarTestsLogicalOperator:AND VarOperation:nota3,==,1
event2=Event_fallo         ; borra las ranuras (nota1..3 = 0) y vuelve a esperar
```

- `operations=nota1,=,tecla` copia una variable en otra: es lo que hace que una sola cadena sirva para
  todas las teclas.
- Las ranuras son silenciosas y sin botones salvo la última: después de apuntar no sigue nada y el
  aparato espera la siguiente pulsación.
- Con un texto (`uitext` con `{var:nota1} {var:nota2} {var:nota3}`) se puede enseñar lo tecleado (§4).
- Si hay varias secuencias válidas (cada una con su efecto), un botón con condición por secuencia y el
  último sin condición para el fallo.

## 4. Visor con números

Un marcador, un cuentarrevoluciones, el número de golpes. La UI de texto se calcula al añadirla, así que
para que cambie hay que quitarla y volver a ponerla en dos eventos:

```ini
[UIVisor]
image=
size=0.06
vunits=true
textsize=0.9
textaspect=4
textcolor=#E8C872
yposition=-0.3
display=false
buttons=0
clickeffect=false
; Localization: UIVisor.uitext,Presión: {var:presion}

[EventSubirPresion]        ; lo dispara un botón del aparato
display=false
buttons=1
event1=EventRepintarVisor
operations=presion,+,1
remove=UIVisor

[EventRepintarVisor]
display=false
buttons=0
add=UIVisor
```

## 5. Rueda o dial

Un botón que avanza y una imagen por posición. La variable da la vuelta con `%`, y un distribuidor
pinta la imagen que toca:

```ini
[EventGirarRueda]
display=false
buttons=1
event1=EventPintarRueda
operations=rueda,+,1 rueda,%,4
remove=UIRueda0 UIRueda1 UIRueda2 UIRueda3

[EventPintarRueda]
display=false
buttons=1
event1=EventRueda0 EventRueda1 EventRueda2 EventRueda3

[EventRueda0]
display=false
buttons=0
add=UIRueda0
vartests=VarOperation:rueda,==,0
; …y una por posición
```

Tres ruedas así son una caja fuerte de combinación; la comprobación mira las tres variables.

## 6. Recorrido en primera persona

*L'Asile oublié*: un túnel que se recorre por fotos. Cada lugar es una imagen a pantalla completa y
unas flechas de UI (izquierda, adelante, media vuelta, registrar). Cada flecha lleva a un evento que
quita el lugar actual y pone el siguiente, y suma a un contador de pasos que trae consecuencias (la
luz se agota, algo se acerca).

```ini
[EventCruce4]
display=false
buttons=1
event1=
operations=pasos,+,1
add=UICruce4 UICruce4Izquierda UICruce4Adelante UICruce4Derecha
remove=UICodo1 UICodo1Adelante UICodo1Registrar UICodo1Volver
```

- Lo más cómodo es que cada evento quite **todas** las piezas del lugar del que se puede venir, o que
  cada lugar tenga un evento «salir de aquí» que quite las suyas y siga al siguiente.
- Un evento de comprobación después de cada paso (`pasos` ≥ N) mete el susto o el final del tramo.
- Para un mapa visto desde arriba (un plano con puntos que se pulsan), lo mismo con el plano de fondo y
  un botón por lugar.

## 7. Mochila o panel con ranuras

*A Strain on Reality*: una mochila de UI con ranuras y botones de colores debajo de cada ranura; pulsar
un color pone ese objeto en esa ranura (variables `ranura1`…), y «Aceptar» comprueba la combinación o
aplica lo elegido. Es el teclado del §3 en dos dimensiones: una variable por ranura, un evento por
botón, repintar la ranura (§2 o §5) y un botón de borrar todo.

## 8. Bucle que se llama a sí mismo

*Carta triste*: para volver a poner en el mapa todas las losetas que la mesa ya ha descubierto, un evento
silencioso lista un evento por loseta; cada uno añade la suya, marca su variable y **vuelve a llamar al
primero**. En cada vuelta entra el primero que falta, y cuando no queda ninguno la cadena sigue por el
último de la lista.

```ini
[EventReponerMapa]
display=false
buttons=1
event1=EventReponerCalle1 EventReponerCalle2 EventReponerIglesia EventMapaRepuesto

[EventReponerCalle1]
display=false
buttons=1
event1=EventReponerMapa
operations=repuestaCalle1,=,1
vartests=VarOperation:conocidaCalle1,==,1 VarTestsLogicalOperator:AND VarOperation:repuestaCalle1,==,0
add=TileCalle1
```

Sirve para recorrer listas de cualquier cosa (reponer, contar, repartir) sin escribir todas las
combinaciones. Pon a cero las marcas `repuesta…` antes de cada uso.

## 9. Diseñar el aparato

- **Que tenga dueño en la historia** y una sola cosa que entender (como un enigma: `desafios.md`). Un
  aparato precioso que se resuelve probando es un adorno caro.
- **Dibuja primero el panel**: piezas, estados, qué variable guarda cada cosa y qué pasa al fallar.
- **Fallar cuesta algo** (Horror, un paso, que algo se acerque) o se resuelve por descarte.
- **Siempre un botón de salir** y una forma de volver a entrar con lo hecho guardado.
- **Prueba en 16:9 y 16:10**, y con el arnés de Universalis: `jugar_azar.ts` avisa de UI sin salida
  (`valkyrie-app.md` §8).
- Para estudiar montajes reales, abre con un ZIP esos `.valkyrie` y busca las secciones `[UI…]` con
  `event1=`: *Bruma maldita 2* (`_E_piano*.ini`), *L'Asile oublié* (`UIIntersection*`), *A Strain on
  Reality* (`UIITEM_RB_*`), *Escape*, *Glimmering Fields* (conversaciones con recuadros de texto).
