# Valkyrie: instalación, juego, editor, rutas, publicación y problemas

Cómo funciona la aplicación Valkyrie para *Las Mansiones de la Locura 2ª ed.* desde el punto de
vista de quien crea escenarios. Comprobado en el código de Valkyrie 3.28 y en su wiki; lo que viene
de la comunidad se indica. El formato de los ficheros está en `formato-escenario.md`.

## Índice

1. [Qué es Valkyrie](#1-qué-es-valkyrie)
2. [Plataformas e instalación](#2-plataformas-e-instalación)
3. [Importar el contenido oficial](#3-importar-el-contenido-oficial)
4. [Jugar un escenario](#4-jugar-un-escenario)
5. [Rutas en disco](#5-rutas-en-disco)
6. [El editor de escenarios](#6-el-editor-de-escenarios)
7. [Trabajar con esta skill y el editor a la vez](#7-trabajar-con-esta-skill-y-el-editor-a-la-vez)
8. [Probar y depurar](#8-probar-y-depurar)
9. [Publicar un escenario](#9-publicar-un-escenario)
10. [Traducir](#10-traducir)
11. [Estadísticas y valoraciones](#11-estadísticas-y-valoraciones)
12. [Problemas frecuentes](#12-problemas-frecuentes)
13. [Comunidad y recursos](#13-comunidad-y-recursos)

---

## 1. Qué es Valkyrie

- Aplicación libre (licencia Apache 2.0) creada por **NPBruce** que sustituye a la app oficial de
  FFG para jugar escenarios hechos por fans de *Las Mansiones de la Locura 2ª ed.* (y de *Descent*).
  Hoy la mantiene **Quantumrunner**. Repositorio: https://github.com/NPBruce/valkyrie
  (web en español: https://npbruce.github.io/valkyrie/index-es.html).
- **Versión actual: 3.28-major (20 de junio de 2026).** Los escenarios actuales usan `format=21`.
- Incluye un **editor de escenarios** y una **tienda** con unos 170-240 escenarios de la comunidad
  (unos 45-50 con identificador en español, más muchos traducidos).
- No trae los gráficos ni los textos oficiales: los **importa** de la app oficial instalada. Por eso
  los textos `{ffg:...}` salen traducidos al idioma del jugador.

## 2. Plataformas e instalación

| Plataforma | Estado | Notas |
|---|---|---|
| **Windows** | Juego + editor | Instalador `.exe` o `.zip`/`.7z` portable. Si la importación falla, ejecutar como administrador. En Windows ARM: Propiedades > Compatibilidad > emulación segura. |
| **macOS** | Juego + editor | `.tar.gz`. Abrir con Control+clic > Abrir (Gatekeeper); si no arranca: `chmod +x /Applications/Valkyrie.app/Contents/MacOS/Valkyrie`. |
| **Linux** | Juego + editor | `.tar.gz`. Sin detección automática de la app oficial: lanzar con `-import <ruta>` o usar la importación por ZIP. Con escalado fraccional en Wayland el tablero se desalinea: escala 100 % o `SDL_VIDEODRIVER=x11`. |
| **Android** | Solo jugar | El editor está desactivado desde 3.24. APK con "orígenes desconocidos"; solo importación por ZIP. En Android 14+ la instalación puede fallar (issue #1877, abierto en junio de 2026). |
| **iOS / iPadOS** | No existe | Se juega por streaming desde un PC (Steam Link). |

Descargas: https://github.com/NPBruce/valkyrie/releases (unos 300 MB por juego importado; 1 GB
libre recomendado).

## 3. Importar el contenido oficial

1. Instala la app oficial *Mansions of Madness* (en PC/Mac, la de **Steam**).
2. Abre Valkyrie > Mansiones de la Locura > **Importar**. Valkyrie extrae imágenes, audio y textos.
3. En **Seleccionar contenido** marca las expansiones que tienes: filtra los escenarios jugables y
   lo que ofrece el editor (y el sorteo de monstruos y objetos por rasgos).

- **Importación por ZIP** (obligatoria en Android, útil en Linux): la wiki (página *ZIP-Import*)
  enlaza paquetes de datos mantenidos por la comunidad.
- Cuando FFG actualiza su app, la importación puede romperse (pasó con la app 2.1.2, arreglado en
  2025, y en 3.27). Solución temporal: el ZIP o una versión anterior de la app. La 3.28 valida el
  fichero antes de importar.
- Fichas raras (gatos en vez de fichas de Búsqueda, puertas mal puestas): borrar la carpeta de datos
  de Valkyrie, reinstalar y volver a importar (consejo de la comunidad).

## 4. Jugar un escenario

1. **Escenarios**: lista local + descargables (filtros por idioma, duración, dificultad, valoración,
   búsqueda por texto). Un escenario sin las expansiones de su `packs=` aparece no disponible.
2. Elegir investigadores (el escenario define `minhero`/`maxhero`) y empezar: se reparten los
   objetos iniciales (`QItem` con `starting=True`) y arranca el evento `EventStart`.
3. Durante la partida:
   - **Fin de la fase**: termina la Fase de los Investigadores. Valkyrie lanza los Mitos, activa los
     monstruos y muestra el "Paso de Horror". No funciona mientras haya una UI del escenario en
     pantalla.
   - **Cajón de monstruos**: lista de monstruos con Atacar, Esquivar (Evitar), Horror y +/− Daño.
   - **Objetos**: inventario de objetos dados por el escenario; los que tienen `inspect` se pueden
     pulsar.
   - **Registro (Log)**: historial de mensajes por rondas ("Turno N" en la traducción de Valkyrie).
   - **Set**: Prender fuego / Quitar fuego / Investigador eliminado (y deshacerlo mientras no se
     haya resuelto).
   - **Menú**: Guardar, Deshacer, Menú principal (y Editor cuando se está probando).
   - Valkyrie **guarda automáticamente** al empezar cada ronda.
4. Al terminar (`$end`), si el escenario es un paquete con identificador propio, Valkyrie pregunta si
   ganasteis, pide una valoración y una reseña opcional, y envía las estadísticas (§11).

## 5. Rutas en disco

| Qué | Windows | macOS / Linux | Android |
|---|---|---|---|
| Datos de Valkyrie | `%APPDATA%\Valkyrie` | `~/.config/Valkyrie` | `/storage/emulated/0/Valkyrie` |
| **Escenarios del editor** | `%APPDATA%\Valkyrie\MoM\Editor\<Id>\` | `~/.config/Valkyrie/MoM/Editor/<Id>/` | (sin editor) |
| **Descargas / paquetes manuales** | `%APPDATA%\Valkyrie\Download\` | `~/.config/Valkyrie/Download/` | `.../Valkyrie/Download/` |
| Partidas guardadas | `%APPDATA%\Valkyrie\MoM\Save\saveN.vSave` | `~/.config/Valkyrie/MoM/Save/` | `.../Valkyrie/MoM/Save/` |
| Registro (log) | `%USERPROFILE%\AppData\LocalLow\NA\Valkyrie\Player.log` | macOS `~/Library/Logs/NA/Valkyrie/Player.log`; Linux `~/.config/unity3d/NA/Valkyrie/Player.log` | `Android/data/com.bruce.valkyrie/files/` |

- `%APPDATA%` se puede pegar tal cual en la barra del Explorador de Windows.
- Desde 3.12 el ajuste *UserRoot* permite mover la carpeta raíz; desde 3.24 el editor tiene un botón
  para abrir la carpeta del escenario.
- Para exportar el log al informar de un fallo: Opciones > Opciones avanzadas > Exportar log (se
  borra al reiniciar la app).

## 6. El editor de escenarios

Menú principal > Mansiones de la Locura > **Editor de escenarios** (solo escritorio).

- **Lista**: escenarios de la carpeta `Editor`. Los descargados (paquetes) no se editan: usa
  **Copiar** para tener una copia editable (sirve para estudiar escenarios ajenos; no los republiques
  sin permiso del autor). **Nuevo** crea `EditorScenarioN`: renombra luego la carpeta con un
  identificador propio, porque los revisores rechazan nombres genéricos y Valkyrie no muestra la
  pantalla final con ese nombre.
- Barra superior del editor:
  - **Componentes**: crear, seleccionar y borrar componentes (Quest, Tile, Token, Event, Spawn,
    Puzzle, QItem, UI, CustomMonster…). Cada componente se edita en un panel; las posiciones se
    pueden fijar haciendo clic en el tablero (con ajuste a la rejilla).
  - **Utilidades**: **Crear paquete** (§9) y **Reordenar componentes**. "Validar" y "Optimizar
    localización" aparecen en gris y no hacen nada en 3.28: usa `scripts/validar.py`.
  - **Guardar y probar**: guarda y arranca la partida en modo prueba; deja elegir el número de
    investigadores (asigna investigadores al azar de tus expansiones). Desde el menú de la partida
    se vuelve al editor; al acabar la partida, en cambio, Valkyrie se va al menú principal.
  - **Menú**: Guardar, **Recargar** (vuelve a leer los `.ini` del disco: imprescindible si los
    has editado a mano), Menú principal.
- El editor reescribe los ficheros al guardar: ordena las claves a su manera, pone
  `; Saved by version: 3.28` y escribe los textos en `Localization.<Idioma>.txt`. No pasa nada:
  la skill lee y escribe ese mismo formato.
- Lo que el editor no permite (hay que escribirlo en los `.ini`): algunas combinaciones avanzadas
  de condiciones, comentarios largos, reorganizar ficheros. Muchos autores veteranos editan a mano
  con Notepad++ y usan el editor para colocar cosas en el tablero.

### Lo que el editor de Valkyrie hace mal

Comprobado en su código (3.28) al portarlo a Valkyrie Universalis. No avisa de nada: se nota al jugar.

- **Renombrar** cambia el nombre en las listas (`add`, `eventN`, `monster`…) y en las claves de sus
  textos, pero no en los textos que lo citan: `{c:Viejo}` y `{qst:Viejo.text}` se quedan con el
  nombre viejo y se ven tal cual. Además cambia el disparador de **otro** componente cuyo nombre
  empiece igual: al renombrar `SpawnLobo` a `SpawnOso`, un `trigger=DefeatedSpawnLobo2` pasa a ser
  `DefeatedSpawnOso`. Si quedan textos sueltos con el nombre nuevo (de un componente borrado a mano),
  el renombrado se rompe a medias. Y los textos de los ataques de un monstruo propio siguen con el
  nombre viejo hasta que se recarga: lo que cambies en ellos antes se pierde. → Renombra con
  `sc.rename()` de `scripts/valkyrie_io.py`, que lleva todo eso consigo, y valida.
- **Borrar** deja en `Defeated` (que nunca salta) el disparador de otro componente cuyo nombre empiece
  igual, y si un botón nombra varias veces el evento borrado (un azar con pesos: `event1=A A B`), solo
  quita la primera. → `sc.delete()` y `validar.py`.
- **Los textos van al idioma en que está Valkyrie**, no al del escenario: con Valkyrie en inglés y el
  escenario en español, lo que escribas va callado a un `Localization.English.txt` nuevo, y quien
  juegue en español sigue leyendo lo de antes. → Pon Valkyrie en el idioma del escenario (Opciones)
  antes de tocar textos.
- **Un monstruo propio sin `base`**: la salud, el horror y la percepción que escribes en su panel no
  se guardan. Los que están en el `.ini` sí se conservan. → Escríbelos en el fichero (`health`,
  `healthperhero`, `horror`, `awareness`).
- **Imágenes propias** de losetas y fichas (`customImage`): en Windows las escribe con `\`, que solo
  encuentra Windows (en Android, Mac y Linux la loseta cierra Valkyrie). → Cámbialas por `/`
  (`validar.py` lo avisa).
- **Las ventanas para elegir** (losetas, monstruos, objetos, imágenes…) esconden el juego base: su
  filtro de expansiones deja ver las que pide el escenario y un pack llamado «base», que no existe
  (el básico es `MoMBase`). → Quita el filtro de fuente para ver lo de la caja básica. Tampoco
  ofrecen «{Ninguno}»: una UI con imagen no vuelve a ser texto, un objeto no se queda sin `inspect` y
  el escenario no se queda sin portada si no es editando el `.ini`.
- **Un texto que contenga `,|||`** se traga al guardar las líneas que lo siguen en la localización, y
  uno que empieza y acaba con comillas las pierde. → Evita `|||` dentro de un texto; si un texto
  lleva comillas, que la skill lo escriba (`set_text`).
- **Recargar** tira sin preguntar lo que no se ha guardado; **Guardar** pisa los ficheros sin copia, y
  si Valkyrie se cierra, lo no guardado se pierde. → Guarda a menudo y versiona la carpeta.
- **Guardar y probar** juega solo con las expansiones que tienes elegidas en Valkyrie, no con las que
  pide el escenario: una loseta de otra la cierra (*Time and Place* usa una de *La Senda de la
  Serpiente*). → Activa antes todas las de `packs=`.
- **Escenarios en varias partes**: el editor lista también las partes interiores (las ocultas) como
  escenarios sueltos. Si abres una y la pruebas, sus cambios de escenario no funcionan (busca el
  siguiente `quest.ini` dentro de esa parte y no desde la carpeta principal), y si la empaquetas sola,
  el paquete sale oculto y nadie puede jugarlo. → Prueba y empaqueta siempre desde el principal.
- **Crear paquete** no comprueba nada. → `scripts/validar.py` antes.

## 7. Trabajar con esta skill y el editor a la vez

Flujo recomendado:

1. Crear o modificar el escenario con los scripts y los ficheros de texto **directamente en la
   carpeta del editor** (`.../MoM/Editor/<Id>/`) o en una carpeta de trabajo que luego se copia ahí.
2. `python scripts/validar.py <carpeta>` hasta que no haya errores.
3. En Valkyrie: abrir el escenario en el editor (si ya estaba abierto: Menú > **Recargar**).
4. Ajustar posiciones visualmente si hace falta y **Guardar**. Si guardas desde Valkyrie mientras
   tienes cambios sin recargar hechos a mano, **los pierdes**: recarga antes de tocar nada. No
   renombres ni borres componentes en el editor de Valkyrie (§6, «Lo que el editor de Valkyrie hace
   mal»): hazlo con `valkyrie_io`.
5. **Guardar y probar** con el mínimo y el máximo de investigadores del escenario (`minhero`, `maxhero`).
6. Versionar la carpeta con Git (o al menos duplicarla) antes de cambios grandes.

## 8. Probar y depurar

- **Variables en directo**: en la partida, abre el **Registro (Log)** y pulsa **Alt+D**: aparecen
  las entradas de depuración y la lista de variables, que se pueden **editar** (útil para saltar a
  una parte del escenario).
- Los avisos internos ("Warning: Missing event called…", "Notice: Adding quest var…") salen en el
  registro de depuración: un "Adding quest var" con un nombre mal escrito delata una errata.
- `scripts/grafo.py` dibuja el flujo de eventos y señala lo inalcanzable; `scripts/mapa.py --png`
  dibuja el mapa para comprobar puertas y fichas.
- Prueba diálogos largos en una ventana pequeña: el texto que desborda tapa los botones.
- Juega el escenario entero con las piezas físicas al menos una vez: es como se detectan los fallos
  de colocación y de ritmo.

### Jugarlo en el motor de Valkyrie Universalis

(Para jugarlo **como una mesa**, con posiciones, acciones y dados, y comparar 2, 3 y 4 investigadores:
`partida-de-mesa.md`.)

Valkyrie Universalis es un port de Valkyrie a TypeScript que calca su C#. Con su código
(`valkyrie-universalis-kit/valkyrie-universalis`, Node 22.18 o posterior, sin instalar nada) se puede jugar
un escenario sin pantalla, miles de pasos en segundos:

```bash
cd scripts/universalis
KIT=<ruta a valkyrie-universalis> QDIR=<carpeta del escenario> N=20 node jugar_azar.ts
KIT=… QDIR=… PREFX="^Tocarla al revés,Quedarte con ella" JEFE=Gaspar VARS=campanaRota,claraSegura node jugar_guiado.ts
```

- `jugar_azar.ts` pulsa botones y fichas al azar y pasa de ronda; avisa de **BLOQUEO** (un evento que
  pide elegir investigador), botones que no avanzan, ventanas sin salida, excepciones y textos con
  `{…}` o nombres de componentes sin sustituir, y dice qué final sale. `QHI=1`: todas las tiradas con
  3 éxitos y los rompecabezas resueltos; `NH`: investigadores; `HEROES`: cuáles; `TR=regex`: traza.
- `jugar_guiado.ts` juega con botones preferidos (`PREFX`, separados por comas) y prohibidos (`BADX`,
  con `|`), mata un monstruo por ronda (`JEFE=regex` para elegir cuál) y enseña textos (`SHOW`) y
  variables al final (`VARS`). Sirve para comprobar que cada final se puede alcanzar con 2 y con 4.
- Las imágenes son sustitutos y los nombres oficiales salen como claves (INVESTIGATOR_…) si no está
  importado el contenido: es normal. El arnés solo pulsa fichas que siguen en el tablero.

## 9. Publicar un escenario

1. **Preparar**: identificador único y descriptivo (carpeta = nombre del paquete), sin espacios en
   ningún fichero, `defaultlanguage` correcto, `packs` exactos, `lengthmin`/`lengthmax` realistas,
   `difficulty`, portada de unos 200×200 px en JPG y una descripción tipo tráiler (gancho, tono,
   si es de investigación o de combate, número de finales, avisos de contenido) sin destripes.
2. **Empaquetar**: Utilidades > **Crear paquete** (o `python scripts/empaquetar.py <carpeta>`). Se
   crea una carpeta con tres ficheros:
   - `<Id>.valkyrie`: ZIP con el escenario (máx. 100 MB; **no lo recomprimas a mano**).
   - `<Id>.ini`: manifiesto con `[Quest]`, `version` (SHA-256 del paquete) y nombres, sinopsis,
     descripción y autores por idioma.
   - La portada.
3. **Subir** los tres ficheros sueltos a un **repositorio público de GitHub** (GitHub Desktop es lo
   más cómodo). Recomendado: subir también la carpeta fuente, un README y una licencia.
4. **Pedir el alta**: abrir un issue en https://github.com/NPBruce/valkyrie/issues con título
   `[Scenario] Nombre del escenario`, indicando el juego (Mansions of Madness), la URL del
   repositorio y las expansiones obligatorias y opcionales.
5. Un mantenedor añade al manifiesto de la tienda (`valkyrie-store/MoM/manifest.ini`):
   ```ini
   [IdentificadorUnico]
   external=https://raw.githubusercontent.com/<usuario>/<repo>/<rama>/<carpeta-opcional>/
   ```
   El identificador debe coincidir con el nombre del `.valkyrie`. La tienda se sincroniza cada hora.

Lo que revisan (el revisor activo de los envíos es *vidimus*, de la comunidad hispana): nombre no
genérico, idiomas coherentes (`Localization.<Idioma>.txt` en el idioma real y `defaultlanguage`
correcto), expansiones bien declaradas, portada y fallos evidentes (fichas que no desaparecen).

**Actualizar**: sube los ficheros nuevos al mismo sitio; como cambia `version`, Valkyrie ofrece la
actualización. Para mover o retirar el escenario, otro issue.

**Compartir sin la tienda**: copiar el `.valkyrie` en la carpeta `Download` de Valkyrie (§5); aparece
en la lista de escenarios. Así se reparten traducciones no oficiales y versiones de prueba.

**Content packs** (losetas, monstruos o fichas nuevas): paquetes `.valkyrieContentPack` con
`type=MoMCustom`; los escenarios que los usan los ponen en `packs=` (ejemplo: *TLE "Expediciones
perdidas"* de xehnlp). Ver la página *Create-Custom-Content-Packs* de la wiki.

## 10. Traducir

- Un fichero por idioma (`Localization.<Idioma>.txt`, primera línea `.,<Idioma>`), registrado en
  `[QuestText]`. Lo que falte en un idioma se toma del `defaultlanguage`.
- No traduzcas las marcas: `{c:...}`, `{qst:...}`, `{ffg:...}`, `{var:...}`, `{rnd:hero}`, `{type}`,
  iconos como `{observation}`, etiquetas `<b>`, `<i>` ni los `\n`.
- Imágenes y audio por idioma: misma ruta dentro de una carpeta con el nombre del idioma
  (`English/img/carta.png`). Si el escenario tiene narración grabada y no se traduce, pon un audio
  vacío en la carpeta del idioma o sonará la voz original.
- Traducir el escenario de otro: pide permiso al autor o abre un issue `[Translation] Nombre
  (versión)` con el fichero. Las traducciones sueltas "ensucian" las estadísticas del original.
- La wiki ofrece un **diccionario CSV de términos de MoM** en muchos idiomas
  (`docs/translation/MansionsOfMadness_LocalizationDictionary.csv`) y una plantilla para traducir con
  IA: bloques de unas 200 líneas, conservar marcas y etiquetas, sin espacios al principio o final.
- Terminología oficial en español: `reglas-mom.md` §17.

## 11. Estadísticas y valoraciones

- Al terminar una partida Valkyrie registra: escenario, investigadores, victoria o derrota,
  duración, idioma, valoración y reseña opcional (suele tener destripes).
- Se publican en la hoja "Valkyrie Play Statistics" y en la web de escenarios
  (https://npbruce.github.io/valkyrie/scenarios.html), con filtros por duración, dificultad,
  valoración, % de victorias, partidas, idioma, autor y expansiones.
- Úsalas para ajustar `lengthmin`/`lengthmax`, ver el % de victorias por número de investigadores y
  leer reseñas tras las primeras partidas.

## 12. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| Valkyrie se cierra al cargar el escenario | Componente duplicado entre ficheros, `add=` a un nombre inexistente, loseta sin `side`, línea con solo espacios, fichero de `[QuestData]` que no existe o con otras mayúsculas | `python scripts/validar.py` |
| El escenario no aparece en la lista | `format` fuera de 4-21, `type` distinto de `MoM`, `hidden=True`, o falta `quest.ini` | Revisar `[Quest]` |
| Aparece "no disponible" | Falta una expansión de `packs=` en Seleccionar contenido | Activarla o quitarla de `packs` |
| La partida se queda parada | Evento silencioso sin `buttons=1`, cadena que apunta a un evento con `vartests` falsos, UI que no se retira (bloquea el fin de fase) | `scripts/grafo.py` y validar |
| No se ven los botones de un diálogo | Texto demasiado largo | Partir el texto en varios eventos |
| Se ve `EventX.button1` en un botón | Falta la etiqueta en la localización | Añadirla |
| Textos que desaparecen o se pegan | Finales de línea mezclados en la localización | Guardar todo en CRLF o todo en LF (la skill lo hace) |
| Funciona en Windows y falla en Android | Mayúsculas distintas en nombres de fichero | Igualar nombres (validar lo detecta) |
| La importación falla | Actualización de la app oficial | Importación por ZIP o versión anterior |
| Monstruo "desconocido" en un Spawn | Monstruo de una expansión no activada y sin alternativa | Añadir un monstruo del base al final de `monster=` |
| Un evento se queda a medias al enseñar un texto (en un idioma) | Una búsqueda `{qst:…` sin su `}` en ese idioma (pasa en traducciones) | `validar.py` (error en textos) |
| Un `{c:…}` o `{qst:…}` se ve tal cual | El componente se renombró en el editor de Valkyrie, que no cambia los textos | `valkyrie_io` `rename()`; validar |
| Los textos editados no se ven al jugar | El editor de Valkyrie los escribió en su idioma, no en el del escenario | Poner Valkyrie en ese idioma y reescribirlos |
| Diálogos vacíos tras pasar a otra parte del escenario | Esa parte no tiene el idioma del jugador ni inglés | `Localization.English.txt` en cada parte (`formato-escenario.md` §19) |
| Al probar desde el editor no cambia a la siguiente parte | Se abrió una parte suelta, no el escenario principal | Probar desde el principal |
| La prueba se cierra al mostrar una loseta | Loseta de una expansión que no tienes elegida en Valkyrie | Activar las expansiones de `packs=` antes de probar |

## 13. Comunidad y recursos

- **Wiki de Valkyrie**: https://github.com/NPBruce/valkyrie/wiki (tutoriales de creación, Mitos,
  QItem, cuotas, UI, variables, publicación, traducción).
- **"Valkyrie MoM Tutorial" de scrubbless**: guía de referencia de más de 200 páginas (Google Doc),
  con **traducción al español de EtiCarasoft**. Enlazada desde la página *QuestGuide* de la wiki.
- **Telegram en español**: "Las Mansiones de la Locura, 2a Edición – En español"
  (t.me/mansionesdelalocura), admite dudas de Valkyrie.
- **Discord de Valkyrie** (enlace en el README del repositorio): donde más se reúnen los autores.
- **BoardGameGeek**: hilos "Fan-made scenarios reviews (Valkyrie)" y "Valkyrie – Home Brew Scenarios
  – Statistics, Announcements & Reviews".
- **Autores y traductores hispanos con repositorios**: vidimus (traducciones y revisión de envíos),
  ZombieJuanma, DaniMassaro, xehnlp (content pack TLE), EtiCarasoft (*En la pajarería a las
  22:30*), FJReina21, Sandra0797, Anxelog, RealPolux, DarkVanf, australmurcia, kozka…
- **Blog de reseñas en español**: momvalkyrie.blogspot.com. **Leyenda.net**: reseñas y guías.
- **Vídeos en español**: Fernando Esra ("Valkyrie (Creador de escenarios) – Tutorial, Charla y
  ejemplos"), Juegos y Dados, Yo Tenía Un Juego (instalación).
- **ValkyrieMCP** (thijs-hakkenberg, licencia MIT): servidor MCP para crear y validar escenarios;
  de él procede la geometría de losetas de esta skill.
