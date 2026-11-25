# Valkyrie para Descent: instalación, juego, editor, rutas, publicación y problemas

Cómo funciona Valkyrie con *Descent: Viaje a las Tinieblas 2ª ed.* desde el punto de vista de quien crea
aventuras. Comprobado en el código de Valkyrie 3.28 y en su wiki; lo de la comunidad se indica. El formato de
los ficheros está en `formato-escenario.md`. Lo que es igual que en Mansiones (instalación, editor,
publicación) se resume; la skill `mansiones-valkyrie` lo cuenta con más detalle.

## Índice

1. [Qué es Valkyrie para Descent](#1-qué-es-valkyrie-para-descent)
2. [Importar el contenido oficial](#2-importar-el-contenido-oficial)
3. [Jugar una aventura](#3-jugar-una-aventura)
4. [Rutas en disco](#4-rutas-en-disco)
5. [El editor](#5-el-editor)
6. [Trabajar con esta skill y el editor a la vez](#6-trabajar-con-esta-skill-y-el-editor-a-la-vez)
7. [Probar y depurar](#7-probar-y-depurar)
8. [Publicar](#8-publicar)
9. [Packs de contenido](#9-packs-de-contenido)
10. [Traducir](#10-traducir)
11. [Problemas frecuentes](#11-problemas-frecuentes)
12. [Comunidad y recursos](#12-comunidad-y-recursos)

---

## 1. Qué es Valkyrie para Descent

- Valkyrie (Apache 2.0, de **NPBruce**; hoy la mantiene **Quantumrunner**) emula la app oficial *Road to
  Legend* (en español, *Camino a la leyenda*) para jugar aventuras y campañas cooperativas hechas por fans,
  con el modo de juego de esa app: los héroes contra los monstruos que dirige la app, sin Señor Supremo.
  Repositorio: https://github.com/NPBruce/valkyrie. Versión actual: **3.28** (20 de junio de 2026).
- La tienda de Descent tiene **59 paquetes** (lista `valkyrie-store/D2E/manifest.ini`), entre ellos
  *The Shadow Rune* (la campaña del juego básico rehecha), *Lair of the Wyrm*, *The Trollfens*, *Manor of
  Ravens*, varias campañas largas y la serie de misiones de **DooM** (pack de la comunidad).
- No trae gráficos ni textos oficiales: los **importa** de la app oficial. Por eso `{ffg:…}`, los nombres de
  monstruos, objetos y piezas, los peligros y los viajes salen en el idioma del jugador.
- Plataformas: Windows, macOS y Linux (juego y editor); Android (solo jugar, importación por ZIP).

## 2. Importar el contenido oficial

1. Instala la app oficial *Descent: Road to Legend* (Steam en PC/Mac, o Android).
2. Valkyrie > **Descent** > **Importar**. Se crea `D2E/import` con imágenes, sonidos y textos. Valkyrie
   pide la app 1.5.2 o posterior; sin importación, el botón de Descent sale en gris.
3. **Seleccionar contenido**: marca las expansiones que tienes. Decide qué aventuras se pueden jugar
   (`packs=`), qué monstruos salen en los grupos abiertos y qué objetos en las tiendas.

- Importación por ZIP: la de Android (o una hecha en otro equipo) comprimida; Valkyrie Universalis acepta
  también la carpeta.
- Los packs de la comunidad (DooM, D1ED, SOTP) se bajan desde Valkyrie (§9).

## 3. Jugar una aventura

1. **Escenarios** (lista local + descargables). Sin las expansiones de su `packs=`, sale no disponible.
2. Elegir **héroes** (de `minhero` a `maxhero`, 4 como mucho) y después la **clase** de cada uno (las
   híbridas encima). Los objetos de las clases van al grupo. La moral empieza igual al número de héroes.
3. Arranca `EventStart` y, tras él, `StartRound` de la ronda 1.
4. Durante la partida:
   - **Retratos de los héroes** (izquierda): Fin del Turno (tras cada héroe se activa un grupo al azar), KO
     (baja la moral 1) y Recuperar (en la traducción de Valkyrie sale «Recupear»). No se abren mientras haya una
     UI o la tienda en el tablero.
   - **Grupos de monstruos** (derecha): Información (reglas y aumentos), Forzar Activación, Derrotado y Único
     Derrotado. La Vida adicional sale en rojo.
   - **Activación**: efecto especial y lista de acciones del líder y de los esbirros; un botón para cada
     parte.
   - **Moral** encima de los héroes; **Registro**, **Habilidades** (gastar PE) y **Objetos** (objetos y oro)
     abajo.
   - **Menú**: Guardar, Deshacer, Menú principal. Guardado automático al acabar cada ronda y al cambiar de
     aventura.
5. Al terminar (`$end`), si es un paquete con nombre propio, la pantalla final pide resultado y valoración.

## 4. Rutas en disco

| Qué | Windows | macOS / Linux |
|---|---|---|
| Datos de Valkyrie | `%APPDATA%\Valkyrie` | `~/.config/Valkyrie` |
| **Aventuras del editor** | `%APPDATA%\Valkyrie\D2E\Editor\<Id>\` | `~/.config/Valkyrie/D2E/Editor/<Id>/` |
| **Descargas / paquetes manuales** (los dos juegos) | `%APPDATA%\Valkyrie\Download\` | `~/.config/Valkyrie/Download/` |
| Packs de contenido descargados | `%APPDATA%\Valkyrie\Download\ContentPacks\` | `~/.config/Valkyrie/Download/ContentPacks/` |
| Partidas guardadas | `%APPDATA%\Valkyrie\D2E\Save\` | `~/.config/Valkyrie/D2E/Save/` |
| Importación oficial | `%APPDATA%\Valkyrie\D2E\import\` | `~/.config/Valkyrie/D2E/import/` |
| Registro (log) | `%USERPROFILE%\AppData\LocalLow\NA\Valkyrie\Player.log` | `~/Library/Logs/NA/Valkyrie/Player.log` (macOS) |

## 5. El editor

Descent > **Editor de escenarios** (solo escritorio). Igual que el de Mansiones (§6 de su `valkyrie-app.md`):
lista de la carpeta `D2E/Editor`, **Copiar** un paquete para estudiarlo, **Nuevo** (crea `EditorScenarioN`:
renómbralo), componentes en paneles, **Guardar y probar**, **Recargar** tras editar a mano, **Crear
paquete**. En Descent el editor añade Door, MPlace y Activation, y coloca piezas y casillas en la rejilla.

- "Validar" y "Optimizar localización" no hacen nada en 3.28: usa `scripts/validar.py`.
- Al guardar reescribe los `.ini` (orden de claves, `; Saved by version`) sin perder nada de lo que la skill
  escribe.
- Al acabar una partida de prueba, Valkyrie se va al menú principal (desde el menú de la partida, en cambio,
  se vuelve al editor).

### Lo que el editor de Valkyrie hace mal

Comprobado en su código (3.28) al portarlo a Valkyrie Universalis. No avisa de nada: se nota al jugar.

- **Campañas**: el editor lista también las aventuras de una campaña (las ocultas) como escenarios sueltos.
  Si abres una aventura y la pruebas, su cambio de aventura no funciona (busca el siguiente `quest.ini`
  dentro de esa aventura, no desde la raíz), y si la empaquetas sola, el paquete sale oculto y nadie puede
  jugarlo. → Prueba y empaqueta siempre desde la raíz (§6).
- **Grupos (Spawn)**: su panel solo enseña las casillas para 2, 3 y 4 héroes. Las de `placement1` (una
  misión de DooM para un marine) se conservan al guardar, pero no se ven ni se cambian ahí: escríbelas en
  `spawns.ini`. La ventana para elegir su monstruo se abre vacía si el escenario no pide expansiones (ver
  abajo, las ventanas para elegir).
- **Renombrar** cambia el nombre en las listas (`add`, `eventN`, `monster`, `placementN`…) y en las claves de
  sus textos, pero no en los textos que lo citan: `{c:Viejo}` y `{qst:Viejo.text}` se quedan con el nombre
  viejo y se ven tal cual. Además cambia el disparador de **otro** componente cuyo nombre empiece igual: al
  renombrar `SpawnTrasgos` a `SpawnOrcos`, un `trigger=DefeatedSpawnTrasgos2` pasa a ser `DefeatedSpawnOrcos`
  (y `DefeatedUnique…` igual). Si quedan textos sueltos con el nombre nuevo (de un componente borrado a
  mano), el renombrado se rompe a medias. → Renombra con `sc.rename()` de `scripts/valkyrie_io.py`, que
  lleva todo eso consigo, y valida.
- **Borrar** deja en `Defeated` (que nunca salta) el disparador de otro componente cuyo nombre empiece igual,
  y si un botón nombra varias veces el evento borrado (un azar con pesos: `event1=A A B`), solo quita la
  primera. → `sc.delete()` y `validar.py`.
- **Los textos van al idioma en que está Valkyrie**, no al del escenario: con Valkyrie en inglés y la
  aventura en español, lo que escribas va callado a un `Localization.English.txt` nuevo, y quien juegue en
  español sigue leyendo lo de antes. → Pon Valkyrie en el idioma de la aventura antes de tocar textos.
- **Imágenes propias** de piezas y fichas (`customImage`): en Windows las escribe con `\`, que solo encuentra
  Windows. → Cámbialas por `/` (`validar.py` lo avisa).
- **Las ventanas para elegir** (piezas, monstruos, objetos, imágenes…) esconden el juego base: su filtro de
  expansiones deja ver las que pide el escenario y un pack llamado «base», que no existe (el básico es
  `D2EBase`). → Quita el filtro de fuente para ver lo de la caja básica. Tampoco ofrecen «{Ninguno}»: una UI
  con imagen no vuelve a ser texto ni un objeto se queda sin `inspect` si no es editando el `.ini`.
- **Un texto que contenga `,|||`** se traga al guardar las líneas que lo siguen en la localización, y uno que
  empieza y acaba con comillas las pierde. → Evita `|||` dentro de un texto.
- **Recargar** tira sin preguntar lo que no se ha guardado; **Guardar** pisa los ficheros sin copia, y si
  Valkyrie se cierra, lo no guardado se pierde. → Guarda a menudo y versiona la carpeta.
- **Guardar y probar** juega solo con las expansiones que tienes elegidas en Valkyrie, no con las que pide la
  aventura: una pieza de otra la cierra. → Activa antes todas las de `packs=` (y el pack DooM para sus
  misiones).
- **Crear paquete** no comprueba nada. → `scripts/validar.py` antes.

## 6. Trabajar con esta skill y el editor a la vez

1. Escribe o modifica con los scripts **en la carpeta del editor** (`…/D2E/Editor/<Id>/`) o en una de trabajo
   que luego copias allí.
2. `python scripts/validar.py <carpeta>` hasta que no haya errores.
3. En Valkyrie: abrir en el editor (o Menú > **Recargar** si estaba abierto) y ajustar a ojo lo que haga
   falta. Guardar desde Valkyrie con cambios sin recargar hechos a mano **los pierde**. No renombres ni
   borres componentes en el editor de Valkyrie (§5, «Lo que el editor de Valkyrie hace mal»): hazlo con
   `valkyrie_io`.
4. **Guardar y probar** con 2 y con 4 héroes. Una campaña se prueba abriendo la raíz (los saltos van a sus
   subcarpetas), nunca una aventura suelta de la lista; la pantalla final solo sale con el paquete (§8).
5. Versiona la carpeta (Git) antes de cambios grandes.

## 7. Probar y depurar

- **Variables en directo**: Registro + **Alt+D** muestra las variables y deja cambiarlas (saltar a una parte).
- «Warning: Missing event called…» y «Notice: Adding quest var…» con un nombre mal escrito delatan erratas.
- `scripts/grafo.py` (qué dispara qué, saltos entre aventuras, tiendas) y `scripts/mapa.py --png` (piezas,
  puertas, fichas, casillas de monstruos).
- Juega la aventura con las piezas físicas al menos una vez: el mapa de la app es la guía para montarlo.
- Valkyrie Universalis (la versión web) juega los mismos paquetes: útil para probar en el móvil.

## 8. Publicar

1. **Preparar**: identificador propio, `defaultlanguage` correcto, `packs` exactos, duración realista,
   dificultad, portada (~300×300) y descripción tipo tráiler. En campañas, inglés en cada aventura.
2. **Empaquetar**: Crear paquete (o `python scripts/empaquetar.py <carpeta>`): `<Id>.valkyrie`, `<Id>.ini` y
   la portada. Pruébalo copiando el `.valkyrie` a la carpeta `Download`.
3. **Subir** los tres ficheros a un repositorio público de GitHub.
4. **Pedir el alta**: issue en https://github.com/NPBruce/valkyrie/issues con título `[Scenario] Nombre`,
   indicando que es de **Descent**, la URL y las expansiones obligatorias y opcionales. El mantenedor lo añade
   a `valkyrie-store/D2E/manifest.ini`:
   ```ini
   [IdentificadorUnico]
   external=https://raw.githubusercontent.com/<usuario>/<repo>/<rama>/<carpeta-opcional>/
   ```
5. **Actualizar**: sube los ficheros nuevos al mismo sitio (cambia `version` y Valkyrie lo ofrece).

## 9. Packs de contenido

- Paquetes `.valkyrieContentPack` con `type=D2ECustom` que añaden piezas, monstruos, héroes, clases, objetos,
  fichas, actividades e imágenes. Los de la tienda de Descent: **DooM** (DooM 2016, con sus misiones), **D1ED**
  (piezas de la 1ª edición) y **SOTP** (*Sands of the Past*). Se bajan en Seleccionar contenido > Descargar y
  se marcan como cualquier expansión.
- Una aventura que los usa los pone en `packs=` (`packs=DooM`). Para escribir misiones de DooM, la skill
  `doom-valkyrie`.

## 10. Traducir

Igual que en Mansiones: un `Localization.<Idioma>.txt` por idioma (primera línea `.,<Idioma>`) en
`[QuestText]`, sin traducir las marcas (`{c:…}`, `{ffg:…}`, `{var:…}`, `{rnd:hero}`, `{type}`, `{heart}`…), las
etiquetas ni los `\n`. **En campañas**, cada aventura (subcarpeta) necesita su propia traducción, y el inglés
es casi obligatorio (`formato-escenario.md` §21). Terminología en español: `reglas-descent.md` §18.

## 11. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| Valkyrie se cierra al cargar | Componente duplicado, `add=` a algo inexistente, fichero de `[QuestData]` que falta, línea con solo espacios, pieza de una expansión sin declarar | `validar.py` |
| Se cierra al colocar un grupo | `placementN` con un MPlace inexistente; CustomMonster sin imagen | `validar.py` |
| Se cierra al activar un grupo | CustomMonster sin activaciones válidas | `validar.py`; `buscar.py --tipo activaciones` |
| La aventura no aparece | `format`, `type=D2E`, `hidden=True` | Revisar `[Quest]` |
| «No disponible» | Expansión de `packs=` no marcada | Marcarla o quitarla de `packs` |
| No se puede terminar el turno de un héroe | Una UI o la tienda sigue en el tablero | Quitarla (`remove=`), cerrar la tienda (`remove=#shop`) |
| La derrota por moral sale una y otra vez (también en la aventura siguiente) | `NoMorale` que no pone `$end` ni deja la moral en 0 o más; cambiar de aventura no basta | `formato-escenario.md` §18 |
| La tienda no se cierra | Falta `remove=#shop`, está en el mismo evento que la abre, o se cambió de aventura con ella abierta | `remove=#shop` en el evento del botón de salir, antes de cualquier salto |
| La tienda sale vacía o con pocos objetos | Umbrales de fama sin fijar o fijados después del sorteo (al cargar la aventura), o pocos objetos con esos rasgos en las expansiones elegidas | Fijar `$%fame…` en la raíz, o con `$restock,=,1` en una aventura suelta; más QItem o rasgos más amplios |
| Diálogos vacíos tras pasar a otra aventura | La aventura no tiene el idioma del jugador ni inglés | Añadir `Localization.English.txt` |
| Se cierra al pasar a otra aventura | Variable de un carácter; ruta mal escrita | Nombres de 2 o más caracteres; ruta relativa a la raíz |
| Al probar una aventura desde el editor no cambia a la siguiente | Se abrió la aventura suelta, no la raíz de la campaña | Probar desde la raíz |
| Un evento se queda a medias al enseñar un texto (en un idioma) | Una búsqueda `{qst:…` sin su `}` en ese idioma | `validar.py` (error en textos) |
| `Defeated<Spawn>` no salta | Su grupo se juntó con uno del mismo monstruo que salió antes | Otro monstruo o un CustomMonster; `validar.py` lo sugiere |
| Un monstruo único sale como «Maestro…» | Rareza de `GetUniqueTitle` | Nombre en `uniquetext` o CustomMonster |
| Se ve `EventX.button1` | Falta la etiqueta | Añadirla |

## 12. Comunidad y recursos

- **Wiki de Valkyrie**: https://github.com/NPBruce/valkyrie/wiki (variables, disparadores, tienda, Spawn,
  CustomMonster, activaciones, símbolos).
- **valkyrie-questdata**: fuentes de *The Shadow Rune – First Blood* y otros ejemplos oficiales de Valkyrie.
- **descent-community.org**: *Community Rules Reference Guide* (CRRG) y wiki de reglas.
- **BoardGameGeek** y el **Discord de Valkyrie**: dudas, anuncios y reseñas.
- **Comunidad hispana**: traducciones de *vidimus* a casi toda la tienda de Descent (49 paquetes con
  `Localization.Spanish.txt`) y misiones de DooM en español.
- **Valkyrie Universalis**: la versión web (PWA) que juega los mismos escenarios, con la que se han
  comprobado las aventuras de ejemplo de esta skill.
