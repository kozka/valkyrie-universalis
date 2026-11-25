# Fallos y mejoras encontrados revisando el código

Revisión del 16 de octubre de 2026, sobre el commit «1.6» y el C# de Valkyrie del commit fijado `752d420` (20 de junio de 2026). Nada de esto está aplicado todavía: es la lista para decidir qué se arregla y, lo marcado **[Valkyrie]**, para contárselo a Quantumrunner si queremos (el fallo está igual en su C#; se da su fichero y línea).

Lo que se buscaba: errores del tipo del de *El Horror de Aylesbury* (un dato mal puesto en un escenario que deja vacía o bloqueada una pantalla entera), y mejoras fáciles.

## Qué se aplicó en la 0.15.0 (16 de octubre de 2026)

kozka dio el visto bueno a todo salvo la traducción automática, que queda desactivada temporalmente. Cada cambio lleva en el código un comentario «Not in Valkyrie (16 October 2026)», y sus pruebas están en `tests/AuthorMistakesTests.test.ts` y `packages/engine/tests/AuthorMistakesTests.test.ts`. La batería de escenarios no cambia: 0 peor, 0 mejor.

- **Aplicados del 1 al 18**, salvo lo que sigue.
  - **No tocados, a propósito:**
    - `IniRead` y `DictionaryI18n` siguen como en Valkyrie. Ahora se aísla cada escenario, pack o fichero que falla, en vez de cambiar cómo se leen.
    - La variable de un carácter en `TrimQuest` (15) tampoco se toca: `porting.md` dice que hay escenarios que cuentan con ese fallo.
    - La activación sin datos de un monstruo (8) sigue parando el escenario con un mensaje, como un error fatal de Valkyrie.
  - **Sin arreglar, y también en Valkyrie:**
    - Los puzles de torre por encima del nivel 15 tardan mucho en generarse (nivel 15: 4,7 s; nivel 20: 27 s).
    - Una foto de héroe o de puzle de imagen que falta (`SkillWindow`, `PuzzleImage`) sigue fallando como en Valkyrie.
- **Aplicados del 19 al 28** (la app):
  - **La ventana de error**, cuando el fallo es en partida, ofrece «Seguir jugando», «Guardar y salir», «Volver» y «Copiar los detalles del error».
  - **Barrera de errores por ventana:** un fallo al dibujar una ventana ya no quita el tablero.
  - **El arranque:** el logo ya no tapa la ventana de error, y «Recargar» sustituye a «Volver» cuando la app no llegó a arrancar.
  - **El almacenamiento:**
    - El índice de la importación, si está dañado, se trata como «sin importación».
    - Un fichero ilegible ya no para el arranque.
    - Los errores al escribir y las partidas que no se pudieron guardar se avisan.
    - `config.ini` y las partidas se escriben en un `.tmp` y se renombran.
    - Una segunda ventana de la app recibe un aviso.
  - **La red:**
    - Plazos: 30 s para las listas y 45 s sin datos para las descargas.
    - Una descarga cortada, o que no es un zip, no sustituye al paquete bueno.
    - Botón «Cancelar» en la descarga.
  - **Cachés:**
    - Las imágenes de Valkyrie van por commit y las viejas se borran.
    - La música va en una caché aparte del service worker.
    - Una imagen que no llegó se vuelve a pedir.
  - **La lectura en voz alta** va por frases, para que Chrome no la corte.
- **Mejoras fáciles aplicadas:**
  - Pantalla encendida durante la partida.
  - «Atrás» de Android abre el menú de la partida.
  - Aviso antes de cerrar o recargar en partida.
  - Música y voz en pausa con la app en segundo plano.
  - «Almacenamiento» en Opciones avanzadas.
  - Copiar los detalles del error.
  - Confirmación antes de borrar un escenario descargado.
- **No hacía falta:** recuperar el contexto WebGL perdido, que PixiJS 8 ya hace solo (`GlContextSystem.handleContextRestored`).
- **Pendientes:**
  - Guardar las traducciones automáticas (la traducción está desactivada).
  - Guardar la importación nueva aparte y cambiarla al final, para no perder la anterior si falla a medias.

## 0.16.0 (16 de octubre de 2026, noche)

- **El revisor al añadir un escenario** (`host/scenarioPackage.ts`).
- **El clic fantasma de un toque** que abre una ventana.
- **El evento largo bajo la barra de fase** en el móvil.
- **Para Quantumrunner:**
  - **[Valkyrie]** Un zip con el escenario dentro de una carpeta no se lista, y el jugador no sabe por qué.
  - **[Valkyrie]** Una línea con solo espacios en cualquier `.ini` tumba el escenario: es la causa común de antes (`IniRead.cs:86`).

## Ya arreglado en Universalis

- **[Valkyrie] El botón «Investigador eliminado» apenas cambia al pulsarlo.** `SetWindow.cs:40-50` lo deja con el mismo texto, solo en gris, y pulsarlo otra vez lo deshace (`Uneliminate`, que no hace nada si ya está `#eliminatedcomplete`): el jugador no sabe si lo marcó ni que puede quitarlo. Lo pidió un jugador por el formulario de informes el 1 de noviembre de 2026. Arreglado en la 0.29.0 como el botón del fuego («Prender fuego» / «Quitar fuego»): mientras se puede deshacer dice «Quitar eliminado» (`CLEAR_ELIMINATED`, texto propio en los 13 idiomas), y cuando `#eliminatedcomplete` ya no lo deja, vuelve a «Investigador eliminado» en gris y sin pulsar (`SetWindow.eliminatedComplete`, `play/Windows.tsx`; prueba `SetWindow_SetsTheFireAndAnEliminatedInvestigator`). En Valkyrie bastaría con una clave nueva en `Localization.*.txt` y elegir el texto en `SetWindow.cs:40`, como ya hace con `CLEAR_FIRE`.
- **[Valkyrie] La lista de la tienda se queda vacía si un escenario no tiene nombre en su idioma por defecto.** `QuestsManager.SortQuests` lee `languages_name[defaultLanguage]` sin comprobarlo. Disparado el 15 de octubre de 2026 por *ElHorrorDeAylesbury* (`defaultlanguage=Spanish` y solo `name.Italian`). Arreglado en «1.6»: si falta, usa el primer nombre o la clave (`packages/engine/src/Content/QuestsManager.ts`, prueba `QuestsManagerSortTests`). A 16 de octubre, la lista de la tienda ya no trae ninguno así.

## Un dato malo que tumba mucho más de lo que debería

Escaneados los 228 paquetes descargados (169 de Mansiones, 59 de Descent), sus packs y las cuatro listas de valkyrie-store del 16 de octubre: **ninguno dispara hoy estos fallos**. Basta con que un autor cometa el error una vez.

### Listas y carga

1. **[Valkyrie] Un pack de contenido descargado roto deja al jugador sin poder entrar en ese juego.** `ContentData.GetPacksFromFiles` (C# `ContentData.cs:220-224`; TS `ContentData.ts:187`) recorre los packs sin `try` por pack. Basta una de estas cosas en su `content_pack.ini`:
   - una línea con solo espacios (ver «causa común» abajo);
   - una línea de `[LanguageData]` sin espacio (`ContentData.cs:408`);
   - que falte `name=`, que llama a `Application.Quit` (`ContentData.cs:344` y `351`): Valkyrie se cierra.

   Como el pack solo se borra desde los menús de ese juego, no hay forma de quitarlo. Arreglo: `try/catch` por pack, que avise y lo salte; sin `name`, saltarlo en vez de salir.
2. **[Valkyrie] Un escenario local roto vacía toda la lista sin conexión.** `QuestLoader.GetQuests` (C# `QuestLoader.cs:47`, también `:102` y `:168`; TS `QuestLoader.ts:45-56`) hace `new QuestData.Quest(p)` sin `try`. Lo disparan:
   - un `Localization.*.txt` listado en `[QuestText]` vacío o con la primera línea en blanco (`DictionaryI18n.cs:219`, `languageData[0].Split(',')[1]`);
   - el mismo fichero listado dos veces en `[QuestText]`;
   - una línea con solo espacios.

   El paquete roto ni aparece, así que no se puede borrar. Arreglo: `try` por escenario.
3. **[Valkyrie] Un pack seleccionado roto impide abrir la lista de escenarios.** En `Game.SelectQuest` y `ContentLoader.LoadContentPack` (C# `ContentLoader.cs:100-108`; TS `Game.ts:165-170`, `ContentLoader.ts:309-327`), los packs que van detrás ya no se cargan. Lo dispara, por ejemplo, un `TokenData` con `height=` y sin `width=` (`ContentTypes.cs:384`). Arreglo: `try` por pack y por fichero.
4. **[Valkyrie] La lista de la tienda se queda en «descargando» o vacía.** Pasa con una entrada local de `manifest.ini` sin `version`: `CheckLocalAvailability` hace `["version"]` (C# `QuestsManager.cs:150`, `RemoteContentPackManager.cs:156`). Esa entrada aparece si se descarga algo cuya lista no trae `version`, porque `ToString` la omite cuando está vacía. También lo dispara una línea con solo espacios en la lista. Arreglo: `TryGetValue` y un `try` alrededor del análisis de la lista que avise del error.
5. **[Valkyrie] Un pack cuya entrada en la lista no tiene `image` nunca queda registrado al descargarlo.** `RemoteContentPack.ToString` hace `image.Length` con `image` nulo (C# `RemoteContentPack.cs:112`; TS `RemoteContentPack.ts:97`). Arreglo: comprobar el nulo.
6. **[Valkyrie] Ordenar con un `NaN` desordena la lista.** `difficulty=NaN` u otro valor `NaN` de las estadísticas rompe el orden. En Universalis es peor, porque `compareNumbers` devuelve 0 (`QuestsManager.ts:70`), mientras que .NET pone los `NaN` primero. Leve.

**Causa común: [Valkyrie] `IniRead` revienta con una línea que solo tiene espacios o tabuladores.** Usa `l.Trim()[0]` (C# `libraries/ValkyrieTools/IniRead.cs:86`, `90`, `111` y `181`; TS `ValkyrieTools/IniRead.ts:7`). Arreglarlo ahí (saltar la línea) quita de golpe varios de los casos de arriba.

### En partida

7. **[Valkyrie] Un monstruo personalizado con `image=` que no existe rompe la lista de monstruos para el resto de la partida.**
   - `MonsterCanvas.MonsterIcon` (C# `MonsterCanvas.cs:168`; TS `MonsterCanvas.ts:28`) falla en cada aparición, derrota, fin de ronda y carga.
   - Una partida guardada con ese monstruo ya no se puede cargar.
   - `DrawMonster` también falla al activarlo.

   Arreglo: icono de sustitución si falta la imagen.
8. **[Valkyrie] La activación de un monstruo personalizado de Mansiones cierra la app** (`Application.Quit`, C# `RoundController.cs:205-209`, `RoundControllerMoM.cs:82`). Pasa en estos casos:
   - todas sus `[Activation…]` tienen `vartests` y ninguna se cumple esa ronda;
   - `activation=` con varios eventos y sin secciones `Activation`;
   - `activation=` con un nombre mal escrito.

   Arreglo: avisar, darlo por activado y seguir.
9. **[Valkyrie] Un `Spawn` que no encuentra monstruo falla en `.sectionName` y deja el evento a medias** (C# `EventManager.cs:239+`; TS `EventManager.ts:535-548`). Lo disparan:
   - `monster=` mal escrito o de un pack no elegido;
   - filtros de rasgos que no encuentran nada (en Descent, más probable).

   Arreglo: mostrarlo como un evento normal.
10. **[Valkyrie] Un nombre de evento mal escrito en un botón esconde todos los botones de esa ficha, puerta o UI.** `ButtonsPresent` devuelve `false` en el primer evento que no existe, sin mirar los demás (C# `EventManager.cs:736-741`; TS `EventManager.ts:216-222`). Una ficha clave queda muerta y el escenario, bloqueado. Arreglo: `continue` en vez de `return false`. En la tienda hay 9 casos en 5 escenarios (DooM *Apuesta Hayden*, *FOP E1M2/E1M3*, *Repliegue*; Mansiones *SmugglersPoint*), pero en fichas que no se ponen en el tablero, así que hoy no muerden.
11. **[Valkyrie] Un color mal escrito impide mostrar el evento o crear el elemento de UI.** Por ejemplo `buttoncolor1=#FFF` o `textcolor=purpl` (C# `DialogWindow.cs:379`, `Quest.cs:2389`). Arreglo: avisar y usar blanco.
12. **[Valkyrie] Un puzle con `class=` desconocida (`Code`, con mayúscula) no abre nada y bloquea la partida** (C# `EventManager.cs:312-330`). Arreglo: tratarlo como un evento normal.
13. **[Valkyrie] Un puzle de torre guardado abierto no se vuelve a abrir al cargar.** `ResumeEvent` no tiene el caso `tower` (C# `EventManager.cs:392-408`). Al cargar, la partida queda bloqueada.
14. **[Valkyrie] El puzle de código mal configurado.**
    - `puzzlesolution=1,2,3,4` (con comas) o con dos espacios seguidos lo hace imposible de resolver.
    - Una solución más larga que `puzzlelevel` falla en cada intento.
    - `puzzlelevel=0` hace fallar `ToString` (C# `PuzzleCode.cs:118`): desde ahí no se guarda nada en silencio y cada pulsación falla.

    En la torre, un `puzzlelevel` mayor de 255 o negativo falla.
15. **[Valkyrie] Al cambiar de aventura en una campaña, una variable de un solo carácter (`x,=,1`) hace fallar `TrimQuest`** (C# `VarManager.cs:54`). La campaña no puede seguir. Arreglo: `StartsWith("$%")`.
16. **[Valkyrie] Una operación mal formada (`$x,=,` o `$x=1`) impide cargar el escenario** (C# `VarTests.cs:376-378`). En la tienda hay una (`statues,=,0,` en *Pruebas_en/_es*) que no muerde porque tiene tres partes. Arreglo: saltarla con un aviso.
17. **[Valkyrie] Una UI con `image=` que no existe aborta todo el `add=` del evento** (TS `Quest.ts:446-451`).
18. **[Valkyrie] Un cambio de aventura lanzado desde un evento de `trigger=` (StartRound, Defeated…) da «Collection was modified»** porque se añade al diccionario que se está recorriendo (`EventManager.EventTriggerType`). Arreglo: recorrer una copia.

## Solo de Universalis

19. **Cualquier excepción termina la partida.** `ui/run.ts` y `App.tsx` (StopWindow) solo ofrecen «Volver» al menú, sin guardar. Unity apunta el error y sigue, así que casi todo lo de arriba, que en Valkyrie es un tropiezo, aquí acaba la sesión. Arreglo: botones «Seguir de todos modos» y «Guardar y salir»; parar solo con `Application.quit`. **Es el que más rendimiento da.**
20. **Si el arranque falla, se queda en el logo para siempre.** `Splash.tsx` solo se va cuando la pantalla deja de ser `loading`, y tapa la ventana de error (z-index 50 contra 40). Además, su «Volver» llama a `Game.get()` con el juego sin crear.
21. **Un índice de importación dañado bloquea cada arranque.** `officialImport.ts:86` hace `JSON.parse` sin `try`, y ese fichero se escribe vaciándolo primero: si se cierra la pestaña a medias, queda vacío. Lo mismo, en general: `PersistentFolder.load` (`storage.ts:71-82`) se para con un solo fichero ilegible.
22. **Los errores al escribir en el almacenamiento se pierden.** Cuota llena, otra pestaña…: `storage.ts:49` los guarda en `errors` y nadie los lee. El jugador cree que se guardó.
23. **Escrituras no atómicas** (`opfs.ts:47-53`): un cierre a medias puede dejar `config.ini` vacío (se pierden opciones, marcas y notas) o una partida guardada a medias. Arreglo: escribir en `.tmp` y renombrar.
24. **Dos ventanas a la vez (la PWA y una pestaña) se pisan `config.ini`.** Arreglo: `navigator.locks` al arrancar y aviso.
25. **Sin plazo en la red ni botón de cancelar descarga** (`network.ts`). Una descarga cortada (menos bytes que `content-length`) sustituye al paquete bueno.
26. **`.then` sin `.catch`** en la copia de seguridad y la importación (`OptionsScreen.tsx:394`, `:401`; `ContentImportScreen.tsx:46`): se quedan en «trabajando».
27. **Un error al dibujar una ventana tira la partida entera.** Hay una sola barrera de errores de React para toda la pantalla. Arreglo: una por ventana de evento.
28. **Menores.**
    - Cachés que crecen sin límite: imágenes de Valkyrie por commit, y la música en la caché versionada del service worker.
    - Fallos de red cacheados que nunca se reintentan (`board/pictures.ts:31`).
    - Chrome corta la lectura en voz alta a los ~15 s (`speech.ts`): trocear por frases.

## Mejoras fáciles (menos de medio día cada una)

- **Pantalla siempre encendida durante la partida** (Wake Lock). Es una app de mesa y el móvil se apaga a mitad de ronda.
- **El gesto «atrás» de Android abre el menú de la partida** en vez de cerrar la app (y perder lo jugado desde el último autoguardado).
- **Avisar antes de cerrar o recargar** con una partida en curso o una escritura pendiente (`beforeunload`).
- **Pausar música y voz** con la app en segundo plano.
- **Guardar las traducciones automáticas** entre sesiones (IndexedDB) y un botón «Reintentar»: los modelos gratuitos tienen límite diario.
- **«Almacenamiento» en Opciones**: espacio usado, cuota y si el navegador lo hace persistente.
- **«Copiar diagnóstico» en la ventana de error**: versión, navegador, error y problemas recientes, para que los informes lleguen completos.
- **Confirmar antes de borrar un escenario descargado.**
- **Recuperar el tablero si el navegador pierde el contexto WebGL** (habitual en iOS al volver de segundo plano).
- **Validador al añadir un `.valkyrie`**: pasar los escenarios por los avisos de arriba (botones a eventos inexistentes, imágenes que faltan, colores, puzles) y avisar al jugador o al autor. Ya está medio hecho en las skills de `herramientas/`.
