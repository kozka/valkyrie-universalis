# Contexto técnico

Todo lo que se averiguó leyendo el código y los repositorios de Valkyrie durante la planificación, del 6 al 7 de octubre de 2026, revisado después por un segundo agente contra los clones. Cada dato dice de dónde sale para poder comprobarlo. Las rutas `referencias/…` son los clones que crea `node referencias/clonar.mjs`; las de código, relativas a `unity/Assets/Scripts/` salvo que se diga otra cosa.

## 1. Valkyrie hoy

| Dato | Valor | Dónde |
| --- | --- | --- |
| Versión | 3.28, commit `752d420` (20 de junio de 2026), rama `master`; no hay etiquetas para 3.x | `unity/Assets/Resources/version.txt` |
| Motor | Unity 2019.4.41f1 | `unity/ProjectSettings/ProjectVersion.txt` |
| Licencia | Apache-2.0, con `LICENSE` y `NOTICE` | raíz del repositorio |
| Quién lo mantiene | Quantumrunner, que también arregla escenarios en valkyrie-questdata (último cambio, 17 de febrero de 2026) | historial de git |
| Código | 40.847 líneas de C#: Quest 12.207, Content 7.604, QuestEditor 9.052, UI 8.902 y raíz 3.082 | `wc -l` |
| Tests | 24 ficheros NUnit en `unity/Assets/UnitTests/Editor`, más el ayudante `TestHelpers/TestGameProvider.cs`. Son 893 casos (887 `[Test]` y 6 `[TestCase]`) en 14.231 líneas, y solo corren dentro de Unity | `grep`; cómo se ejecutan, en `.agent/rules/testing.md` de Valkyrie |
| Librerías aparte | `libraries/`: FFGAppImport (importa de las apps oficiales), ImportTest, ValkyrieTools (incluye `IniRead`), ObbExtract, Injection, MoMInjection, PuzzleGenerator y SetVersion | `.agent/rules/project-structure.md` |

Ficheros más grandes, que son los que más cuesta portar: `Quest/Quest.cs` (2.817), `Content/QuestData.cs` (2.513), `UI/Screens/QuestSelectionScreen.cs` (1.884), `QuestEditor/EditorComponentEvent.cs` (1.318), `QuestEditor/EditorComponentCustomMonster.cs` (1.039), `Quest/EventManager.cs` (1.006), `Content/ContentData.cs` (808), `Content/DictionaryI18n.cs` (680) y `Content/ContentTypes.cs` (666).

Tests con más casos: QuestComponentTests 179, ContentTypesTests 112, DictionaryI18nTests 72, EventManagerTests 53, AdditionalCoverageTests 52, PuzzleTests 46, GameTypeTests 45, VarManagerTests 44, LocalizationReadTests 42, VarTestsTests 40 y SaveLoadTests 34.

### Valkyrie ya se mantiene con agentes de IA

El repositorio tiene `claude.md` y `.agent/gemini.md`, que mandan seguir `.agent/agents.md`. Además tiene `.agent/rules/` (estilo de código, estructura, sistemas operativos, tests, localización, interfaz, web y wiki) y `.agent/workflows/` (subir la versión de la app y la del formato).

- **Sus principios**: pensar antes de programar, lo más simple, cambios quirúrgicos, actualizar las reglas tras cada cambio no trivial y criterios de éxito verificables.
- **Su entorno**: Windows, y prefiere PowerShell.

Universalis copia esa organización en su propio `.agent/` para que a Quantumrunner, y a sus agentes, les resulte familiar.

Reglas suyas que afectan al port:

- **Localización**: `StreamingAssets/text/Localization.<Idioma>.txt`, formato `CLAVE,Valor`, 13 idiomas; el inglés es el maestro. Sus reglas dicen que todos usan CRLF, aunque en el repositorio solo el inglés lo tiene. El lector parte solo por `\r` si el fichero contiene alguno (sección 2).
- **Números**: siempre `CultureInfo.InvariantCulture` al leer decimales.
- **Formato de escenario**: se sube en `Content/FormatVersions.cs`, enum `Versions` y constante `CURRENT_VERSION`.

### Lo que cambia según el juego

`GameType.cs` define una clase abstracta `GameType` con tres hijas: `NoGameType`, `D2EGameType` y `MoMGameType`. Es el embrión del «módulo de juego».

| Miembro | Descent | Mansiones |
| --- | --- | --- |
| `TypeName()` | `D2E` | `MoM` |
| `BaseContentPackId()` | `D2EBase` | `MoMBase` |
| `MaxHeroes()` / `DefaultHeroes()` | 4 / 4 | 10 / 5 |
| `DisplayHeroes()` | sí | no |
| `TilePixelPerSquare()` | 105 | 1024/3,5 (512/3,5 en Android) |
| `TileOnGrid()` | sí | no |
| `DisplayMorale()` | sí | no |
| `SelectionRound()` / `TileRound()` | 1 / 1 | 1,75 / 3,5 |
| `MonstersGrouped()` | sí | no |

Además hay 77 comprobaciones del tipo de juego repartidas en 30 ficheros. Las más cargadas son `QuestSelectionScreen.cs` (9), `EditorComponentEvent.cs` (7), `HeroCanvas.cs` (6) y `QuestLoader.cs` (5); `Quest.cs`, `ContentSelectScreen.cs` y `ContentSelectDownloadScreen.cs` tienen 4 cada uno. Para listarlas:

```
grep -rnE "is (MoMGameType|D2EGameType|NoGameType)|TypeName\(\)\s*(==|\.Equals)|TypeName\(\)\)" --include=*.cs referencias/valkyrie/unity/Assets/Scripts
```

Esa búsqueda no encuentra otra veintena de sitios que usan el nombre del juego (`TypeName()`) para buscar rutas o datos, como `Quest/EventManager.cs` (líneas 938 y 945), `Game.cs` (332), `Content/QuestLoader.cs` (190), `Content/ContentData.cs` (233) y `QuestEditor/QuestEditSelection.cs` (305).

### A qué se conecta la app de escritorio

- Las cuatro listas de valkyrie-store: `MoM/manifestDownload.ini`, `D2E/manifestDownload.ini`, `MoM/contentPacksManifestDownload.ini` y `D2E/contentPacksManifestDownload.ini`, en `raw.githubusercontent.com/NPBruce/valkyrie-store/master/…`.
- `raw.githubusercontent.com/NPBruce/valkyrie/master/unity/Assets/Resources/prod_version.txt`, para avisar de versiones nuevas, y `github.com/NPBruce/valkyrie/releases/latest`.
- Estadísticas: un JSON en Google Drive (`drive.google.com/uc?id=1lEhwFWrryzNH6DUMbte37G1p22SyDhu9&export=download`) y formularios de Google para enviar partidas. Google Drive no permite CORS; da igual, porque la tienda ya copia esas cifras en sus listas (sección 3).

## 2. Formatos

### Escenarios

- **Formato**: Valkyrie acepta del 4 al 21 (`QuestData.minumumFormat = 4`, con esa errata; `QuestFormat.CURRENT_VERSION = 21`, `RELEASE_3_2_0`). Fuera de ese rango no lo abre.
- **Compatibilidad heredada** (`QuestData.Quest.Populate`):
  - Formato 8 o menor: `EventEnd…` tiene un trato especial.
  - Packs con nombre antiguo: `MoM1E` pasa a `MoM1ET`, `MoM1EI` y `MoM1EM`; `FA` a `FAT`, `FAI` y `FAM`; `CotW` a `CotWT`, `CotWI` y `CotWM`.
  - Una lista fija de 20 escenarios de Mansiones con formato menor que 17 exige el pack `MoM1CK` (`SCENARIOS_THAT_REQUIRE_CONVERSION_KIT` en `FormatVersions.cs`).
- **Componentes**: el tipo sale del principio del nombre de la sección (`name.IndexOf(tipo) == 0`). Por orden: `Tile`, `Door`, `Token`, `UI`, `Event`, `Spawn`, `MPlace`, `QItem`, `StartingItem`, `Puzzle`, `CustomMonster` y `Activation`. El resto se ignora («If not known ignore», `QuestData.AddData`).
- **Lector de .ini** (`libraries/ValkyrieTools/IniRead.cs`):
  - Lee con `File.ReadAllLines`, así que acepta CRLF, LF o CR.
  - Las líneas que empiezan por `#` o `;` son comentarios; una sección es una línea que empieza por `[`.
  - Si una sección se repite dentro de un fichero, gana la primera; si una clave se repite dentro de una sección, también.
  - Clave y valor se separan en el primer `=`. Al valor se le quitan los espacios y las comillas de los extremos. Una línea sin `=` es una clave con valor vacío.
  - Una línea solo de espacios lanzaría una excepción (`l.Trim()[0]`). No aparece ninguna en el corpus.
- **Lector de textos** (`Content/DictionaryI18n.cs`):
  - Si el fichero contiene algún `\r`, parte solo por `\r`; si no, por `\n`. Un fichero con finales mezclados junta las líneas que solo tienen LF con la clave anterior.
  - La primera línea da el idioma (segundo campo tras la coma). Las líneas que empiezan por `//` son comentarios, y gana la primera aparición de cada clave.
  - Hay valores entre comillas, de varias líneas y delimitados por `|||`, más un «formato antiguo». Está cubierto por DictionaryI18nTests (72 casos): portar esos tests antes que el código.
- **Imágenes y sonidos** (`Quest.FindLocalisedMultimediaFile`): Valkyrie busca, por orden:
  1. `<carpeta del quest>/<idioma>/<ruta>`.
  2. `<carpeta del quest>/<carpeta>/<idioma>/<fichero>`.
  3. Lo mismo con el idioma de reserva.
  4. `<carpeta del quest>/<ruta>`.

  En el editor no mira las carpetas de idioma.
- **Qué usa esa búsqueda**: el `customImage` de losetas y fichas, el `image` de los `UI`, el `audio` de los eventos y la `music`.
  - Antes se busca el nombre en los packs: `AudioData` para `audio` y `music`; `ImageData` para `customImage` y para el `image` de los `UI` (`Quest.cs`, líneas 1649, 1804 y 2018).
  - Los puzles de imagen miran primero `PuzzleData` y luego la carpeta del escenario, sin carpetas de idioma (`Quest/PuzzleImageWindow.cs`, 42-48). Igual el `image` y el `imageplace` de los monstruos propios (`Quest/QuestMonster.cs`, 67-86).
  - Las imágenes se prueban tal cual y con `.dds`, `.pvr`, `.png`, `.jpg`, `.jpeg` y `.tex` (`ContentData.cs`, 520), pero `LoadImage` solo decodifica PNG y JPG. El editor solo ofrece `.ogg`.
  - `DdsToTexture` lee el tamaño de dos bytes de cada campo y decide el formato por bytes sueltos: `'5'` en el 87 es DXT5, `'1'` es DXT1, 32 bits en el 88 es BGRA32 si el primer byte de la máscara roja (92) es 0 y si no RGBA32, y 24 bits es RGB24. Con cualquier otro (DXT3, 16 bits…) avisa y luego falla. Le pasa los datos a Unity tal cual, así que la primera fila es la de abajo: el importador escribe los datos de Unity sin darles la vuelta. Ninguna imagen propia de Valkyrie es DDS (son 137 PNG y 18 JPG); en los escenarios hay 17, en 5 de Mansiones (ElHorrorDeAylesbury, Eldurmiente, HistoriasDeArkhamAgathaCrane, Perfidia y PuertaRoja): 16 objetos en DXT5 de 256×256 y una imagen en DXT1 de 1024×1024.
- **Barras invertidas**: al leer, Valkyrie cambia `\` por `/` en el `image` de los `UI`, el `audio`, la `music`, el `imageType` de los puzles, el `image` de los monstruos propios y la portada (`QuestData.cs`). No lo hace en el `customImage` de losetas y fichas ni en el `imageplace`: ahí la `\` solo funciona en Windows.
- **El editor reescribe al guardar**: `QuestEditor.Save` vuelve a escribir cada `.ini` (y los `Localization`) solo con los componentes y campos que conoce, así que lo desconocido desaparece. `EditorTools.CreatePackage` guarda primero, mete la carpeta entera en el `.valkyrie` y escribe el SHA-256 del zip como `version` en el `<Nombre>.ini` que acompaña al paquete. Por eso lo exclusivo de Universalis va en un fichero aparte dentro de la carpeta, nunca dentro de los `.ini`.
- **Campañas dentro de un paquete**: 17 de los 59 paquetes de Descent (hasta 36 `quest.ini` en TSR) y 7 de los 169 de Mansiones llevan varias aventuras, cada una con su `quest.ini` en una subcarpeta. Entre los de Mansiones están Desert_en/_es y Snow_en/_es, los cuatro que piden TLE, con 102 cada uno.
  - Para pasar de una aventura a otra, un evento lanza un nombre que no es un evento sino la ruta de un `quest.ini`, relativa a la carpeta del primero (`originalPath`, `Quest/EventManager.cs`, 119-135). Los de TLE lo hacen nada más pasar su introducción (sección 7).
  - `EventManager` lo convierte en `StartQuestEvent`, y `Quest.ChangeQuest(ruta)` limpia el tablero, vuelve a la fase de investigadores y carga el nuevo `QuestData`. De las variables solo conserva las que empiezan por `%` o `$%` (`VarManager.TrimQuest`).
  - El editor de Valkyrie las lista como escenarios sueltos, también las ocultas: busca escenarios en todas las subcarpetas de su carpeta de usuario (`QuestLoader.GetUserUnpackedQuests` recorre `ExtractManager.DirList`, que es recursivo). Una aventura abierta así se prueba con su propia carpeta como `originalPath`, así que su cambio de aventura no encuentra la siguiente, y se empaqueta sola (oculta: no sale en ninguna lista). El editor de Universalis las pone bajo su campaña y las prueba desde la carpeta de la campaña (paso E.9, `editor/campaign.ts`).
  - Las subaventuras comparten ficheros con rutas relativas como `../../eventsfixed.ini` o `../..//Sounds/Text_02.ogg`: hay que resolver `..` y las barras dobles igual que el sistema de ficheros.
- **Lo que cierra Valkyrie** (`Application.Quit()`):
  - Una loseta sin `TileSide` o sin imagen (`Quest.cs`, 1689 y 1702).
  - Un componente definido en dos ficheros (`QuestData.cs`, 167).
  - Un `add=` a un componente que no existe (`Quest.cs`, 1167-1174).

  Ningún componente que Valkyrie conozca puede apuntar a algo exclusivo de Universalis.
- **Losetas**: las del catálogo se colocan por el punto `left`/`top` de su TileSide, más medio cuadro en Descent (`Quest.cs`, 1732-1755). Las de `customImage`, por el centro salvo que lleven `top`/`left`. En Android la escala es la mitad, así que las imágenes propias salen al doble.
- **El tablero de Descent**: en sus 295 aventuras hay 2.565 losetas (ninguna con `customImage`), 3.995 fichas (sobre todo aldeanos, búsqueda y objetivos), 886 puertas y 3.973 `MPlace`, las casillas donde se coloca cada monstruo de un grupo. Valkyrie dibuja cada monstruo colocado con tres piezas (`TokenBoard.AddPlacedMonsterImg`): debajo, un círculo (`Sprites/target.png`, o la píldora `Sprites/borders/Empty_Monster_1x2.png` para los de dos casillas en fila), rojo si es el jefe; encima, la imagen del monstruo al 83 %; y arriba, un marco (`Sprites/borders/Frame_Monster_1x1`, `1x2` o `2x3`, en DDS DXT5 con las filas de Unity). Esas imágenes, la de la puerta (`Sprites/Door.png`, que toma el color de la puerta) y la diana de las casillas resaltadas son de Valkyrie (`unity/Assets/Resources`), y la app las baja de su repositorio.
- **La tienda de Descent** (`ShopInterface`): la abre un evento que añade dos o más `QItem`, y se cierra solo cuando un evento quita `#shop` (lo hacen 28 de los 32 paquetes de Descent con objetos, el 11 de octubre de 2026). Valkyrie no la cierra en ningún otro sitio: `Quest.ChangeQuest` borra lo marcado `board`, y la tienda va marcada `shop`. Sus elementos van sobre los de la aventura (`QuestUICanvas` es el primer hijo del lienzo de la interfaz) y bajo los diálogos, que paran sus botones.
- **La interfaz de los escenarios en un móvil en vertical**: los autores la colocan para una pantalla apaisada, en unidades de 1/30 del alto (`UIScaler`); Valkyrie en el móvil va siempre en horizontal. En vertical, algunos elementos se salen por los lados: el Herrero de *Prisión de hielo y mentiras* queda a medias bajo el botón Log.
- **Partidas** (`SaveManager.cs`, `ZipManager.cs`): `<juego>/Save/saveN.vSave` es un zip con `save.ini` (el estado), `image.png` (captura) y la carpeta del escenario dentro de `quest/`. Leerlas en la web es opcional.

### Packs de contenido

- **`content_pack.ini`** (`ContentData.GetPackData`):
  - `[ContentPack]`: `name`, `description`, `image` (con `{import}` apunta a la carpeta importada), `icon`, `id` y `type`.
  - `[PackType<tipo>]`: nombre e imagen de cada categoría.
  - `[ContentPackData]`: los `.ini` que se leen.
  - `[LanguageData]`: líneas `<diccionario> <fichero>`.
  - Solo se leen los ficheros listados. La guía está en la [wiki](https://github.com/NPBruce/valkyrie/wiki/Create-Custom-Content-Packs).
- **Dentro del zip**: el pack puede ir metido en una carpeta, como hace DooM con `DooM/`; Valkyrie busca el `content_pack.ini` también un nivel por debajo (`ContentData.cs`, 258-270).
- **Comprobación de juego**: solo se aplica a los packs descargados. Su `type` tiene que empezar por `MoM` o `D2E` (`MoMCustom`, `D2ECustom`). Los integrados usan `type` como categoría: `box`, `ck`, `ft`, `hm` o `lt`.
- **Packs integrados** (`unity/Assets/StreamingAssets/content`): 18 de Mansiones (MoMBase, las expansiones BtT, HJ, PotS, SoA y SoT, RN y SM, y los kits de conversión de 1ª edición) y 44 de Descent (base, 8 cajas, 6 kits, 9 de Héroes y Monstruos y 20 lugartenientes). Sus ficheros suman 18,4 MB y 3,9 MB, casi todo imágenes (155: 113 de Mansiones y 42 de Descent). Los `.ini` y `.txt` son solo 0,52 MB y 0,20 MB.
- **Arte de la editorial en esas carpetas**: 16 losetas escaneadas de expansiones de la 1ª edición (`Tile_*_MAD01/06/09/20.jpg`: 15 en los kits de conversión y una en `base`), losetas de Descent (`030B.png`, `032A.png`…), retratos de héroes (Aurim, Eliam, Kirga, Landrec…) e iconos de caja. No se copian dentro de Universalis: se descargan del repositorio de Valkyrie, en el commit fijado, al usarlas. Las fichas con nombre, las paredes y las puertas son de Valkyrie.
- **Packs de la comunidad** (los cuatro de la tienda):

| Pack | Juego | Tamaño | Repositorio | Commit visto |
| --- | --- | --- | --- | --- |
| TLE | Mansiones | 89 MB | [xehnlp/TLE](https://github.com/xehnlp/TLE) | `c46e7bc` (9 de marzo de 2026) |
| DooM | Descent | 14 MB | [Neuntoter82/Doom_2016_Mod](https://github.com/Neuntoter82/Doom_2016_Mod) | `12656fa` (7 de marzo de 2026) |
| D1ED | Descent | 12 MB | [Neuntoter82/D1ED](https://github.com/Neuntoter82/D1ED) | `396a0b6` (25 de marzo de 2026) |
| SOTP | Descent | 1,2 MB | [afellowspelunker/SOTP](https://github.com/afellowspelunker/SOTP) | `211468b` (31 de diciembre de 2025) |

Sus repositorios solo tienen el zip (`<Id>.valkyrieContentPack`), su `.ini` y su icono. DooM trae 32 losetas, 26 fichas, 4 héroes, 4 clases con 24 habilidades, 8 monstruos, 30 activaciones y 11 objetos, en inglés y español. Son solo datos en el formato de las expansiones oficiales, sin código.

Los usan 11 de los 59 escenarios de Descent (DooM) y 4 de los 169 de Mansiones (TLE). Esos cuatro piden además siete expansiones: `packs=HJ SoA PotS BtT SoT RN SM TLE`.

Cómo se juegan los de Descent (comprobado el 11 de octubre de 2026, paso D.6; `tests/DescentPackTests.test.ts`):

- **Losetas**: las de DooM tienen 100 píxeles por casilla (`pps=100`) y las de D1ED entre 101 y 104, no los 105 de Descent. `Quest.Tile` coloca cada una con los suyos, y la casilla de arriba a la izquierda cae en su sitio de la rejilla. Muchas tienen un ancho o un alto impar: Valkyrie divide `newTex.width / 2` como entero.
- **Marines**: los cuatro héroes de DooM tienen su propio arquetipo (`archetype=DooM`), así que `ClassSelectionScreen.DrawHero` solo les ofrece las cuatro clases de DooM, cuyas armas van al grupo.
- **Demonios**: sus activaciones solo traen acciones de esbirro (`minion`, con `minionfirst=true`) y ninguna de jefe, así que Valkyrie las muestra en un solo paso, con «Acciones» y «Activado» (`RoundController.ActivateMonster`: «If no master activation just do minion»). Cada demonio toma las suyas por el nombre (`MonsterActivationImp1`…) y las comunes de su `activation=` (`LongShot`, `ChargedShot`…).
- **Escenarios**: las cuatro misiones de *La caída de Fobos* son para un solo héroe (`maxhero=1`). El tutorial trae sonidos `.wav`, que Valkyrie también reproduce (`AudioType.UNKNOWN`). Los 11 arrancan en la app sin errores.
- **D1ED y SOTP**: D1ED solo trae losetas y fichas de terreno, sin textos (no tiene `[LanguageData]`); SOTP, dos héroes, dos clases, dos monstruos con sus activaciones (estas sí, con jefe) y 21 objetos, en inglés y alemán, con negritas (`<b>`) en los textos. Ningún escenario de la tienda los pide.

## 3. La tienda (valkyrie-store)

- **Cómo se publica**: el autor sube `<Nombre>.valkyrie` y `<Nombre>.ini` a su repositorio, y alguien añade `[Nombre]` con `external=<url>` a `MoM/manifest.ini` o `D2E/manifest.ini` (o a `contentPacksManifest.ini`).
  - Cada hora, el flujo `.github/workflows/ManifestSync.yaml` (Descent a las :00, Mansiones a las :30) ejecuta `manifest_sync.py`.
  - Ese script copia la sección `[Quest]` del `<Nombre>.ini` de cada repositorio, con el `version` que puso el editor al empaquetar. Añade `url`, `latest_update` (fecha del último commit del `.valkyrie`, por la API de GitHub) y las estadísticas de Google Drive, y escribe `manifestDownload.ini` y `contentPacksManifestDownload.ini`. No calcula hashes.
  - Detalles en la [wiki](https://github.com/NPBruce/valkyrie/wiki/Scenario-Quest-publishing-administration).
- **Campos de un escenario**:
  - Ficha: `format`, `hidden`, `type`, `defaultlanguage`, `defaultmusicon`, `difficulty`, `lengthmin`, `lengthmax`, `image`, `packs` (100 de 169), `minhero` y `maxhero`.
  - Versión y descarga: `version` (SHA-256 en hexadecimal con guiones), `url` y `latest_update`.
  - Textos por idioma: `name.<Idioma>`, `synopsys.<Idioma>` (así, con esa errata), `description.<Idioma>`, `authors.<Idioma>` y `authors_short.<Idioma>`.
  - Muchos autores ponen direcciones largas en `description` y `authors` (102 descripciones y 12 autorías de las dos listas, el 11 de octubre de 2026): una pantalla que las muestra tiene que partirlas, o en un móvil se sale de su anchura y tapa sus botones (pasaba con los detalles del escenario).
  - Estadísticas: `rating`, `play_count`, `duration` y `win_ratio`.

  Los textos llevan `\n` literales (una barra invertida y una n) y etiquetas de texto enriquecido de Unity (`<color=grey>`).
- **Campos de un pack**: `type`, `defaultlanguage`, `image`, `version` (un número que sube el autor), `name.<Idioma>`, `description.<Idioma>`, `url` y `latest_update`.
- **Descarga**: `url + <Nombre> + .valkyrie` o `url + <Id> + .valkyrieContentPack`. La portada de la lista es `url + image`.
- **Actualizaciones**: al descargar, Valkyrie guarda en un `manifest.ini` local la `version` que daba la lista. Avisa de actualización cuando la lista trae otra, y solo mira `version`, nunca `latest_update` (`Content/QuestsManager.cs`, 150, y `Content/RemoteContentPackManager.cs`, 156). No recalcula el hash, ni hay que hacerlo: en 13 paquetes la versión de la lista no coincide con el SHA-256 del fichero (descarga del 7 de octubre). Son 11 de Mansiones (ElHuespedDel31deOctubre, Reanimator2, LaMaldiciondeMalory, lostofexist, Pruebas_en, Pruebas_es, Desert_en, Desert_es, LAsileOublie, Snow_es y Snow_en) y 2 de Descent (Doom_Mission_1 y Doom_Laboratorios_Alfa).
- **Dónde están**: los 59 escenarios de Descent, 168 de los 169 de Mansiones y los cuatro packs están en `raw.githubusercontent.com`.
  - Ese dominio responde con `access-control-allow-origin: *` (comprobado el 6 y el 7 de octubre). Rechaza con 403 las comprobaciones previas `OPTIONS`, así que solo valen GET simples, sin cabeceras propias.
  - El que falta (`gitlab.com/scrubbless/strainonreality`) usa `/-/raw/`, que no envía CORS: hay que ir por la API de ficheros de GitLab.
- **Licencias**: 106 de los 118 repositorios de escenarios de Mansiones revisados no tienen licencia. Se descarga en el navegador de cada jugador y nunca se replica.
- **Repositorios de NPBruce** (no se pudieron listar todos porque la API de GitHub estaba bloqueada en esa sesión; se probaron nombres):
  - `valkyrie`: la app, activa.
  - `valkyrie-store`: activa, se regenera cada hora.
  - `valkyrie-questdata`: escenarios del proyecto, activa.
  - `valkyrie-contentpacks`: obsoleta desde 2016.
  - `NPBruce.github.io`: página personal de 2020.
  - La web de Valkyrie sale de `index*.html` y `web/` del propio repositorio.

## 4. El corpus real

Son todos los paquetes de la tienda: 168 de los 169 de Mansiones, descargados el 6 de octubre de 2026, y los 59 de Descent, el 7. Se analizaron con `herramientas/analizar_corpus.py`, que recorre todos los `quest.ini` de cada paquete:

- Mansiones: 2.132 aventuras.
- Descent: 295 aventuras.

Los resultados completos están en `datos/corpus-mom-2026-10-07.json` y `datos/corpus-d2e-2026-10-07.json`, y los tamaños en `datos/tamanos-escenarios.tsv`.

| Qué | Mansiones (168 paquetes) | Descent (59 paquetes) | Qué tiene que hacer Universalis |
| --- | --- | --- | --- |
| Formatos del `quest.ini` principal | 9 (3), 12 (4), 13 (8), 15 (3), 17 (9), 18 (62), 19 (12), 20 (2), 21 (65) | 13 (1), 18 (4), 19 (28), 20 (4), 21 (22) | Leerlos todos |
| Formatos contando todas las aventuras | Las de más son casi todas del formato 18 | 13 (2), 15 (6), 17 (33), 18 (54), 19 (173), 20 (4), 21 (23) | Lo mismo |
| Paquetes con varias aventuras | 7, hasta con 777 `quest.ini` (Pruebas_en); incluye los 4 de TLE | 17, hasta con 36 (TSR) | Portar `ChangeQuest` ya en la Demo (sección 2) |
| Ficheros de texto con BOM | 2 de 8.339 | 130 de 3.161 | Quitar el BOM |
| Finales de línea | 6.125 LF, 2.201 CRLF, 3 mezclados | 83 LF, 3.066 CRLF, 5 mezclados | Lo mismo que Valkyrie (sección 2) |
| `Localization` con finales mezclados | 3 (ArkhamCrimeWave, MisterioHotelGibbins, UnaTormentaDeBienvenida) | 5 (CalamityattheCove, HostofEverdark, NaturesIre, ShardsofEverdark) | Reproducir lo que hace Valkyrie y avisar en el validador |
| `[QuestData]` con otras mayúsculas | 4 (HauntedLegacy, LastTrainToArkham) | 0 | Buscar sin distinguir mayúsculas, como Windows |
| `[QuestText]` que apunta a un fichero que no está | 0 | 65, en 8 paquetes | Seguir sin ese idioma |
| Secciones o claves repetidas en un fichero | 0 en los principales; las hay en subaventuras de 6 paquetes (Pruebas y los de TLE) | 0 | Gana la primera, como en `IniRead` |
| Imágenes o sonidos que no vienen en el paquete | 60 referencias en los `quest.ini` principales; con todas las aventuras, 19 paquetes | 37 en los principales; con todas, 9 paquetes | Seguir sin ellos y sin fallar |
| Imágenes o sonidos con otras mayúsculas | 2 | 1 | Buscar sin distinguir mayúsculas |
| `\` en `customImage` o `imageplace` | 0 en la tienda (sí en carta_triste, abajo) | 1 (ChainsOfBilehall) | Aceptarla; el validador avisa |
| Medios que solo están en una carpeta de idioma | 81 | 0 | Buscar como `FindLocalisedMultimediaFile` |
| Medios por tipo | 3.500 PNG, 2.120 OGG, 1.416 JPG, 13 WAV, 12 MP3, 6 JPEG, 6 GIF | 881 OGG, 331 PNG, 101 JPG, 93 WAV, 12 JPEG, 4 MP3, 2 WEBP | El navegador abre WAV, MP3, GIF y WEBP, que Valkyrie quizá no |
| Imágenes de más de 4.096 px | 9; la mayor, de 8.559 × 10.357 px (`MisterioenSeahide/Polish/advertiser.png`) | 0; la mayor, de 2.048 × 1.536 | Reducirlas al cargar según el límite de textura de cada aparato |
| Tamaño | mediana 6,0 MB, el 90 % por debajo de 50 MB, la mayor 102 MB; 2,85 GB en total | mediana 1,4 MB, la mayor 47 MB; 0,33 GB en total | Descargar bajo demanda y guardar en OPFS |
| Idiomas del `quest.ini` principal | español 147, inglés 88, francés 62, polaco 54, portugués 40, italiano 31, coreano 20… | inglés 56, español 49, alemán 41, italiano 3, ruso 3… | Español e inglés como mínimo |
| Secciones de tipo desconocido | 0 | 0 | — |

En las campañas de TLE, un `eventsfixed.ini` común a las 100 aventuras de cada paquete apunta a finales de otras variantes cuyas imágenes no vienen. Por eso esos paquetes suman miles de referencias que faltan sin que se note al jugar.

Los escenarios de kozka (bruma_maldita1, bruma_maldita2 y carta_triste) están en `%APPDATA%\Valkyrie\MoM\Editor\` de su PC; no van en el kit y sirven de prueba si los copia. carta_triste tiene cuatro losetas de tejado con `customImage` escrito con `\`: funciona en Windows, pero no en sistemas que distinguen la barra. Universalis debe aceptarlo y el validador avisar.

## 5. Qué hay dibujado en cada loseta

[ValkyrieMCP](https://github.com/thijs-hakkenberg/ValkyrieMCP) (MIT, commit `b1a8992`) describe 174 caras de loseta de Mansiones. Tienen 435 zonas (contorno, ancla, puntos y conexiones por puerta o pared) y 1.955 objetos dibujados (tipo, etiqueta, posición y si se pueden registrar o usar). Nuestro plugin lo tradujo al español en `herramientas/mansiones-valkyrie/assets/contenido_losetas.json`.

Las coordenadas son locales a cada loseta: x hacia el este, y hacia el sur y origen en el ancla. Para pasarlas al mundo de Valkyrie:

1. `(u, v) = (lx, −ly)`.
2. Se gira en sentido antihorario los grados de la loseta.
3. Se suma su posición.

Se comprobó contra los 168 escenarios. Sirve para el editor (proponer dónde poner una ficha) y para el tablero (resaltar zonas).

## 6. Hechos de la web ya comprobados

- Safari lee Ogg desde la versión 18.4; para las anteriores hay un decodificador WASM (`@wasm-audio-decoders/ogg-vorbis`).
- Sin HTTPS no hay service worker fuera de `localhost`. Para probar la PWA en un móvil hace falta HTTPS en la red local o un despliegue.
- Safari borra los datos de una web no instalada tras 7 días sin uso. Hay que instalar la PWA en la pantalla de inicio antes de importar.
- Lo que guarda una web va por origen (dominio y puerto) y por navegador: `localhost:5173`, la dirección de Vercel o el móvil no comparten nada. En iPhone y iPad, una web instalada en la pantalla de inicio tiene además su propio almacén, separado del de Safari, a propósito ([WebKit, error 181849](https://bugs.webkit.org/show_bug.cgi?id=181849)). Chrome y Safari dejan a cada origen hasta cerca del 60 % del disco, y Safari concede `navigator.storage.persist()` sobre todo a las webs instaladas ([WebKit](https://webkit.org/blog/14403/updates-to-storage-policy/), [MDN](https://developer.mozilla.org/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)). En las páginas de GitHub, todos los proyectos de un usuario comparten origen (`usuario.github.io`).
- vite-plugin-pwa 2.0 instala 338 paquetes (Babel, Rollup, Terser, Workbox 7.4) para precachear una cuarentena de ficheros: Universalis usa un service worker propio. Playwright no intercepta la petición con que el navegador busca un service worker nuevo; para probar una versión nueva hay que cambiar el fichero servido (`pwa.spec.ts`). La vista previa de Vite responde con `Vary: Origin`, y el script principal (un módulo) se pide con `Origin` mientras que el service worker lo guardó sin él: `cache.match` no lo encontraba, a ratos, sin `ignoreVary`.
- Memoria (Chromium en la nube, 9 de octubre de 2026): con cuatro escenarios de unos 50 MB guardados, el proceso de la página ocupaba 483 MB al arrancar cuando se cargaba todo lo guardado, y 274 MB leyendo escenarios y partidas solo al usarlos; con la lista sin conexión abierta, 525 y 328 MB.
- `Intl.DisplayNames` nombra cada idioma en otro (en español, «alemán»; en el suyo, «Deutsch»), en Chrome 81, Safari 14.1, Firefox 86 y Node con ICU completo. Lo usa la lista de idiomas de Opciones.
- PixiJS 8.22, sin WebGL ni WebGPU, cae a un renderizador de Canvas 2D que se salta las máscaras y los filtros: el lienzo de los botones del inicio pide `preference: ['webgl', 'webgpu']`, y sin ellos se queda la versión quieta en CSS. El Chromium de Playwright, sin GPU, dibuja WebGL con SwiftShader.
- Vercel Hobby es solo para uso personal no comercial, con 100 GB de transferencia al mes y 10 GB de tráfico de origen. Su política de uso prohíbe hacer de proxy. Su CLI puede desplegar una carpeta sin pasar por GitHub.
- Normas de FFG: «no podemos permitir nuestra propiedad intelectual en aplicaciones de software de ningún tipo». Valkyrie sobrevive sin dinero, como proyecto no oficial de fans y sin alojar contenido de la editorial; Universalis tiene que hacer lo mismo.
- Versiones de librerías (registro de npm, 7 de octubre de 2026):
  - Interfaz: React 19.3, Zustand 5 y Motion 14.
  - Tablero: PixiJS 8.22, pixi-filters 6.1.5, @pixi/react 8.0.5 y spine-pixi-v8 4.3.13.
  - Datos y almacenamiento: Dexie 4.4, fflate 0.8.3, zip.js 2.23 y Ajv 8.20 (de ellas, la app usa fflate).
  - Lógica de terceros: quickjs-emscripten 0.32.
  - Herramientas: Vite 8.3, vite-plugin-pwa 2.0 (no se usa), Vitest y Playwright.
  - 3D, si algún día: Three.js 0.186.

## 7. La batería

`npm run battery` carga en Node las 2.428 aventuras (2.133 de Mansiones y 295 de Descent) con el motor portado, como las carga Valkyrie: con los 62 packs integrados y los cuatro de la comunidad. Cómo funciona, en `.agent/rules/porting.md`. Línea base del 7 de octubre de 2026, con los 228 paquetes (StrainOnReality está en GitLab y desde la nube no se puede bajar; se copió el 8 desde el PC de kozka, donde el script sí lo baja):

- **Ninguna aventura falla al cargar**: 0 `crash`, 0 `fatal`, 0 `invalid` y 0 `missing-packs`. Quedan 356 `ok` y 2.072 con avisos.
- **Cómo se llega a cada `quest.ini`**: 228 son aventuras que la lista mostraría (una por paquete); las otras 2.200 solo se alcanzan con un evento que cambia de aventura (`Quest.ChangeQuest`), que las carga sin comprobar formato, tipo ni packs.
- **Avisos**: secciones repetidas 34.282 y claves repetidas 8.816 (casi todas en Pruebas y los cuatro de TLE, de aventuras generadas), medios que faltan 26.815 (75 en las aventuras de la lista de Mansiones y 3 en las de Descent; el resto, en las generadas), `[QuestText]` que apunta a un fichero que no está 65, `add=` a un componente que no existe 39 (sería un cierre de Valkyrie si ese evento se dispara), tipos de ficha desconocidos 35, mayúsculas distintas 10, finales de línea mezclados 8, `\` en `imageplace` 1 y una TileSide que no existe (CurseOfSet, sería un cierre al colocar la loseta).
- **Medios que faltan de verdad**: el analizador en Python contaba como que faltan los sonidos e imágenes que en realidad son nombres de los packs (`AudioData`, `ImageData`); la batería los busca primero en los packs, como Valkyrie. Casos típicos: una `music` con espacios en el nombre, que Valkyrie parte en varias («woman scream.ogg»), un nombre con espacios cuando el fichero los tiene con guiones bajos, o un `Localization.German.txt` que en el zip se llama con un BOM delante del nombre (ForgottenSouls).

La v2 arranca, con el motor sin interfaz (`HeadlessUI`), las 228 aventuras de la lista como lo haría un jugador: dos investigadores (o el mínimo que pida), la primera clase libre de cada héroe en Descent o los objetos iniciales en Mansiones, el evento inicial y diez elecciones más, siempre la primera. En la misma línea base:

- **Todas arrancan**: 228 `ok`, ninguna `fatal` ni `crash`. Tras las diez elecciones, 120 esperan en el tablero, 58 en un diálogo, 26 en elementos de interfaz de la aventura y 24 en una tienda (campañas de Descent).
- **Cambio de aventura**: 23 cambian de aventura en esas diez elecciones: 16 campañas de Descent y 7 paquetes de Mansiones, entre ellos los cuatro de TLE. Los de TLE no cambian en el evento inicial, sino justo después: ese evento pone dos elementos de interfaz (`UI0` y `UI1`), y al pulsarlos se pasa siempre a la primera de las cien aventuras de `all/` (sección 8, «TLE»).
- **Avisos al jugar**: 60 eventos que no existen (Valkyrie los salta y lo anota en el registro), 6 `QItem` sin objeto que cumpla sus rasgos, 2 eventos con más de un `QItem` en Mansiones (solo cuenta el primero, #998) y 1 color de botón que no es `#RRGGBB` ni un nombre conocido.

## 8. Las pantallas de Valkyrie

Lo que hacen las pantallas de antes de la partida, leído en su código al portarlas (paso 7.1):

- **Sin la importación oficial no se juega**: `GameSelectionScreen` deja el juego en gris mientras `ImportManager.NeedImport` lo pida, con un botón para importar (o reimportar) debajo. Universalis juega igualmente, en modo esquemático: los dibujos y sonidos de la importación son sustitutos (solo la cabecera, como en la batería) y los nombres que traduce la importación (`{ffg:…}`) se leen de su clave, que está en los datos de Valkyrie: `{ffg:INVESTIGATOR_RITA_YOUNG}` se lee «Rita Young».
- **La lista sin conexión** se ordena por nombre y de mayor a menor (de la Z a la A) mientras el jugador no elija otro orden (`offlineSortCriteria` y `offlineSortOrder` en `config.ini`), y oculta los escenarios que solo están en japonés (`filterLangs`). Un escenario al que le faltan expansiones de la colección del jugador no se puede elegir (la colección llegó con el paso 7.6, en «La tienda»).
- **Los nombres de escenario** salen traducidos: *Exotic Material* es «Material exótico» en español.
- **Los idiomas y sus textos**: Opciones lista los trece idiomas por su nombre en inglés, sin traducir (`OpenLanguageSelection`). Los textos de Valkyrie (`StreamingAssets/text`) no están completos en todos: de los 169 que usa la app, faltan o están vacíos 27 en italiano (entre ellos `DIFFICULTY`, `DURATION`, `AUTHORS`, `ITEMS` y `DOWNLOAD_PACKAGE`), 13 en chino (las estadísticas de la tienda y `UPDATE`), 11 en japonés, 12 en alemán (`ROUND`), 6 en español (`DOWNLOAD_PACKAGE`, que sale «Downloading Package» al bajar un escenario) y menos en el resto; muchos son claves sin palabras (`X_COLON`, iconos, el editor). `DictionaryI18n` da entonces el inglés, y una línea vacía tapa cualquier otra posterior de la misma clave. El chino de Valkyrie es sobre todo tradicional (劇本, 設置), con algunas claves nuevas en simplificado (语言, 导入数据), y el portugués es de Brasil (Arquivo, aplicativo). (10 de octubre de 2026)
- **En Mansiones**, al terminar de elegir investigadores desaparecen sus retratos (`displayHeroes` es falso) y la ventana de objetos iniciales se crea dos veces (`HeroCanvas.EndSection`). Volver desde esa selección lleva a los detalles del escenario, leídos otra vez del disco (`GameStateManager.Quest.Restart`).

### El tablero

Lo que hace el tablero de Valkyrie, leído en su código y en su escena al portarlo (paso 7.2):

- **Unidades**: el tablero usa unidades del mundo de Unity con la y hacia arriba. En Mansiones una casilla de loseta mide 3,5 unidades y las imágenes oficiales tienen 1024/3,5 píxeles por unidad (`TilePixelPerSquare`): una loseta de 2×1 casillas es una imagen de 2048×1024 que mide 7×3,5. Cada pieza es una `Image` centrada en su posición, del tamaño de su `sizeDelta`, y gira alrededor del origen antes de ir a su sitio. Por eso las imágenes sustitutas tienen que tener el tamaño real.
- **Cámara**: perspectiva de 60° en vertical (planos de recorte a 0,3 y 10.000 unidades, fondo negro), inclinada −10° en x, que empieza en (0, 0, −8) y mira al tablero un poco por delante de su posición (|z|·tan 10°). `GetMouseBoardPlane` lanza un rayo desde la cámara por el puntero hasta el plano z = 0. La rueda la acerca 15 unidades por unidad de eje (0,1 por muesca), el pellizco 0,05 por píxel de dispositivo, las flechas 0,3 unidades en cada `FixedUpdate` (15 por segundo), y la z queda entre −25 y −1. Arrastrar deja bajo el puntero el punto que se agarró, en cada fotograma mientras se mantiene pulsado. Ni arrastrar ni la rueda ni el pellizco mueven la cámara si bajo el puntero hay algo sin la etiqueta `board`, como un resaltado o un sitio de monstruo (`ScrollEnabled`). Cada evento con lugar la lleva allí a 12 unidades por segundo y vuelve a z = −8; se para a 0,1 unidades del destino, sin llegar.
- **Fundidos**: las piezas aparecen con alfa 0 y `Quest.Update`, en cada fotograma, las acerca a su alfa a la velocidad de cada una. Los resaltados y los sitios de monstruo de grupo laten con `SpritePulser`: tamaño × (1 + 0,2·sen 4t).
- **Clics**: el clic va a la pieza más alta bajo el puntero, aunque sea transparente o no tenga botón (entonces no hace nada): las fichas tapan las losetas y los elementos de interfaz de la aventura tapan a ambas. Los resaltados llevan la etiqueta `dialog`, así que mientras hay uno en el tablero los clics en fichas no hacen nada. El botón de Unity no anula el clic aunque se arrastre; Universalis sí lo anula pasados 10 píxeles, para que arrastrar el tablero en el móvil no abra fichas.
- **Elementos de interfaz de la aventura** (`Quest.UI`): se colocan en la pantalla, no en el tablero. Su tamaño es `size` por el ancho de la pantalla (o por el alto con `vunits`), su posición se mide desde el borde que diga la alineación, el texto mide alto/30 × `textSize` píxeles y el borde 0,05 de esas unidades.

### La partida

Lo que hacen las ventanas de partida, el sonido y las partidas guardadas de Valkyrie, leído en su código al portarlos (paso 7.3):

- **Exotic Material de principio a fin**: explorar la tienda, la calle, el almacén (con un candado de combinación), el sótano, la bodega y el estanque (una puerta atascada que pide 3 éxitos de Fuerza, acumulables entre intentos); coger la roca del estanque (Observación) despierta a todos los vecinos en trance, que hasta entonces son fichas y no monstruos, y abre la salida; escapar pone `$end` a 1 y termina. Las búsquedas dan objetos al azar sin repetir (`randomevents` con `vartests`), y uno de ellos, el hechizo, pide antes 2 éxitos.
- **El puzle de código** (`PuzzleCode`): sin `puzzlesolution`, la combinación se elige al azar al abrirlo (`puzzlelevel` símbolos, del 1 al `puzzlealtlevel`); cerrarlo guarda los intentos para la próxima vez y en la partida guardada, y resolverlo lo borra. Cada intento muestra cuántos símbolos están en su sitio y cuántos están en otro. Con `image=symbol` o `image=element`, los símbolos son dibujos propios de Valkyrie (`Resources/Sprites`), no de la editorial.
- **Los otros tres puzles** (portados el 9 de octubre, porque los escenarios de TLE los usan para abrir las puertas entre salas; el primer mapa de *The Pharaoh's Tomb* tiene 34: 19 de deslizar, 4 de código, 7 de imagen y 4 de torre; el de *El Sepulcro del Faraón* es otro mapa, con otros puzles). En los tres, «Cerrar» guarda el puzle como está para la próxima vez y en la partida, y resolverlo lo borra; el botón del evento solo se activa resuelto. Al continuar una partida que se guardó con uno abierto, Valkyrie vuelve a abrir el de deslizar, el de código y el de imagen, pero no el de torre.
  - **Deslizar** (`class=slide`): un tablero de 6×6 con la salida en la tercera fila; hay que sacar el bloque rojo arrastrando los demás, cada uno en su dirección. Las posiciones salen de `Resources/slidepuzzles.txt`, de Valkyrie (no de la editorial): una al azar entre las que piden `puzzlelevel` movimientos, y si no hay, un nivel menos. Con el nivel 1 la encuentra, pero el contador de niveles llega a 0 y Valkyrie se cierra igualmente; TLE usa del 4 al 10.
  - **Imagen** (`class=image`): la imagen (`image=`, un `PuzzleData` como `PuzzleStarsofHades3x3`, que son de la importación, o un fichero del escenario) se corta en `puzzlelevel` columnas por `puzzlealtlevel` filas, se baraja, y cada pieza se cambia por su vecina arrastrándola. Si la imagen no está, el evento se corta. Sin la importación, Universalis numera las piezas.
  - **Torre** (`class=tower`): ocho discos en tres torres, nunca uno sobre otro más pequeño; está resuelto con todos en una. Se construye hacia atrás desde la solución, a `puzzlelevel` movimientos como mínimo (TLE usa del 4 al 6), y las torres se barajan.
- **Botones que se deciden al dibujar**: Valkyrie pone en gris «Cancelar» o «Terminado» en el ataque y la evasión solo si al abrir la ventana el monstruo ya tiene todo el daño; si después se le sube el daño, el botón sigue activo.
- **Una imagen que falta detiene el evento**: el icono de la lista de monstruos, el dibujo del monstruo en sus ventanas y los objetos del inventario leen el tamaño de la imagen; si no existe, la excepción corta el evento a medias (el monstruo queda en la lista sin `#monsters` ni diálogo).
- **El sonido**: todos los sonidos y músicas de Valkyrie vienen de la importación (`{import}/audio`); sin ella solo suenan los que trae el escenario. La música nueva funde la anterior (un 1 % del volumen cada 20 ms) y, cuando se acaba la lista, vuelve la música por defecto de la aventura.
- **Partidas guardadas**: el autoguardado (hueco 0) se hace al acabar cada ronda, al cambiar de aventura y al salir al menú, no al empezar. El primero de cada sesión escribe el zip entero (con el escenario en `quest/`); los siguientes solo cambian `save.ini` e `image.png`. Desde el menú de partida se guarda en los huecos 1 a 3. Al cargar, el escenario sale del propio zip, así que la partida se puede continuar aunque el escenario ya no esté. La imagen es una captura de la pantalla a 4/30 de su tamaño. Al continuar una partida, su aventura se queda en la carpeta temporal (`Load/quest`, y la lista de partidas deja otra en `Preload/quest`); si después se abre la lista sin conexión sin haberla cargado antes, `QuestLoader.GetQuests` también las lista, porque `UnloadLocalQuests` solo limpia la carpeta temporal cuando la lista estaba cargada. Universalis hace lo mismo.
- **La pantalla final** solo sale con escenarios empaquetados (`.valkyrie`) que no se llamen `EditorScenario…`; si no, se vuelve al menú. Pregunta si se ganó y la puntuación, y lo envía a las estadísticas de Valkyrie; Universalis se queda con el final y la vuelta al menú.

### La importación oficial

Lo que hace la importación de Valkyrie, leído en su código al portarla (paso 7.5) y comprobado con la de kozka:

- **Dónde y qué**: `<AppData>/Valkyrie/<juego>/import` (en Windows, `%APPDATA%\Valkyrie\MoM\import`). La de Mansiones con la app oficial 2.0.3 ocupa 740 MB: 1.190 imágenes DDS (592 MB: 539 DXT1, 425 DXT5, 161 BGRA32, 22 RGB24 y 43 de 16 u 8 bits), 340 sonidos OGG (63 MB), 327 textos (52 MB) y 11 fuentes (34 MB, entre ellas MADGaramondPro y OldNewspaperTypes). Las imágenes miden como mucho 2048 píxeles de lado y ninguna trae copias pequeñas. 55 imágenes no las puede leer Valkyrie: las 43 de 16 u 8 bits y 12 vacías (texturas de fuentes); todas son de la interfaz de Unity, no del juego.
- **`import.ini`** dice con qué se hizo: `[Import]`, `Valkyrie=2` y `FFG=<versión de la app>`. `FetchContent.NeedImport` pide importar de nuevo si falta, si `Valkyrie` no es 2 o si la app es anterior a 1.5.0 (Mansiones) o 1.5.2 (Descent). Su comparación de versiones toma por más nueva cualquier versión con otro número de partes.
- **Los textos que se leen**: de `text/` solo los `Localization_*.txt` sin cifras en el nombre (14, uno por idioma, como `Localization_es.txt`, que empieza por `KEY,Spanish`) y los de *Cult of Sentinel Hill* (`SCENARIO_CULT_OF_SENTINEL_HILL_MAD22_*.txt`, para el diccionario `csh`): 26 ficheros, 19,6 MB. Los demás textos de escenarios oficiales no se usan.
- **La importación por ZIP** (`ImportManager.ImportZipFromPath`) solo acepta dos nombres de fichero, quiere `import.ini` en la raíz y, si el zip trae los ficheros de la app (`resources.assets` u `.obb`), ejecuta el importador completo; si no, borra la importación anterior y copia el zip tal cual. La wiki de Valkyrie enlaza zips ya hechos en Google Drive; Universalis no los enlaza: cada jugador usa su propia importación.
- **La importación hecha en Android** (la de kozka, de la app 2.0.3, en un zip) es más pequeña: 423 MB en 1.363 ficheros, con 896 imágenes PVR, 8 DDS, 174 audios, 284 textos y ninguna fuente. Las PVR son de la versión 3 (cabecera de 52 bytes, sin metadatos) y solo en los dos formatos que lee `PvrToTexture`: 22 (ETC2 RGB, 4 bits por píxel) y 23 (ETC2 RGBA, 8 bits por píxel, con el alfa en bloques EAC). 222 traen detrás sus copias reducidas (mipmaps), que `LoadRawTextureData` ignora. Las losetas tienen la mitad de píxeles que en el ordenador (1024 en vez de 2048; también `MoM_Reminder` y `PicturePuzzleBG`), y el resto de imágenes, los mismos: por eso `MoMGameType.TilePixelPerSquare` usa 512/3,5 en Android (`GameType.cs`, 279). Universalis lo reduce a la mitad solo para las losetas en PVR, y deja a escala de escritorio las imágenes propias de los escenarios (plan, «Compatibilidad con las aventuras actuales»).
- **La importación de Descent hecha en Android** (la de kozka, de la app Road to Legend 1.5.5, revisada en su PC el 10 de octubre de 2026 sin copiarla) tiene 892 ficheros y 300,6 MB: en `img/`, 784 PVR (202 MB; 727 sin copias reducidas y 57 con ellas) y 19 DDS sin comprimir (37 MB, de 8 a 32 bits, todas de la interfaz, una vacía); en `audio/`, 73 OGG (53 MB); en `text/`, 14 textos (9 MB: diez `Localization_xx.txt` y cuatro de la app); en la raíz, `import.ini` (`FFG=1.5.5`) y `bundles.txt`. No trae fuentes: Valkyrie usa las suyas para Descent (`Resources/Fonts`: `Windl.ttf`, Windlass, *shareware* de 1996; `Gara_Scenario_Desc.ttf`, © 2005 Adobe; y `Descent_symbol.ttf`, hecha con fontello). Las 203 imágenes de losetas (`img/001A.pvr`…) son cuadradas, de 1.024 píxeles (115), 512 (70) o 256 (18), todas en ETC2 RGBA, y `D2EGameType.TilePixelPerSquare` es 105 en todas las plataformas: las casillas de cada loseta caen justas en la rejilla de su TileSide (`left`, `top`, de 105 en 105 píxeles), y las de *Affairs of Wizards* encajan casilla a casilla en el tablero (11 de octubre de 2026, con `tools/build-schematic-tiles-d2e.mjs` en el PC de kozka, que solo saca los tamaños y las casillas). El zip se comprimió en un Mac: además trae `__MACOSX/` con una copia AppleDouble (`._<nombre>`, 190 KB en total) de cada fichero, que Valkyrie extraería sin leerla nunca y que Universalis no copia.
- **Rendimiento en el navegador** (PC de kozka): decodificar las 1.135 imágenes legibles con su reducción a 1024 lleva 32 s en total (28 ms de media, 220 ms la peor, una DXT5 de 2048); un zip de toda la carpeta (473 MB) se lee entero en 26 s. Las 896 PVR de la importación de Android se decodifican en 38 s (43 ms de media, 174 ms la peor), con el mismo resultado, píxel a píxel, que texture2ddecoder.

### La tienda

Lo que hacen la lista de la tienda, la colección y la descarga de packs de Valkyrie, leído en su código al portarlos (paso 7.6) y probado con la tienda de verdad desde la nube:

- **Las listas**: al elegir juego, `QuestsManager` pide la lista de escenarios (`master/<juego>/manifestDownload.ini`) y `RemoteContentPackManager` la de packs (`refs/heads/master/<juego>/contentPacksManifestDownload.ini`). Mientras llega, la lista de escenarios espera («Descargando...»); si falla, se usa la del dispositivo («OFFLINE (error de red)»). Una lista vacía cuenta como error, pero Valkyrie se queda en línea. El jugador puede pasar a la lista del dispositivo y volver (`SetOnlineMode`).
- **En línea**: se ordena por valoración, de mayor a menor, mientras el jugador no elija otro orden (`sortCriteria` y `sortOrder`; los cuatro órdenes de sin conexión también valen). Valkyrie solo ordena si ya tiene las estadísticas, que baja de Google Drive al arrancar; sin ellas, la lista sale vacía. Universalis las toma de los campos de la propia lista, que la tienda copia de allí cada hora, con la misma clave (`<nombre>.valkyrie` en minúsculas). Los escenarios que no son válidos (formato fuera de 4 a 21) no salen; los ocultos (`hidden`), sí.
- **Cada escenario** muestra:
  - Su portada (`url` + `image`).
  - Sus idiomas, sacados de los `name.<Idioma>`.
  - Su nombre y su sinopsis, en el idioma del jugador o en el de la aventura.
  - Duración, dificultad, duración media y porcentaje de victorias.
  - Su valoración sobre 10, con el número de partidas.

  Su botón baja el escenario, lo actualiza (cuando la lista trae otra `version`) o lo abre; si faltan expansiones, no hace nada.
- **Bajar un escenario**: se pide `url` + nombre + `.valkyrie` y se guarda en `Download/` mientras la pantalla de carga muestra el avance. Después se anota en `Download/manifest.ini` la sección de la lista, con su `version`, y el botón pasa a jugar. Para jugar uno bajado, Valkyrie lo lee otra vez del disco (`QuestLoader.GetSingleQuest`); si no puede, ofrece bajarlo de nuevo o avisar a su autor en las incidencias de su repositorio de GitHub.
- **Si la descarga falla**, la pantalla de carga de Valkyrie se queda puesta: su código lo marca como pendiente. Universalis la quita y lo dice.
- **Rarezas de Valkyrie**:
  - Si se baja un escenario en línea con la lista del dispositivo ya cargada, Valkyrie le añade una entrada hecha con los datos de la tienda, sin carpeta. Se ve al pasar a sin conexión, hasta recargar la lista.
  - Cuando la lista falla con su pantalla abierta, el rótulo de Valkyrie se queda en «Descargando...»; el de Universalis dice «OFFLINE (error de red)».
  - La búsqueda se aplica al terminar de escribir (Intro o al salir del cuadro), sin espacios a los lados.
  - El texto español de «Descargando paquete» está vacío, así que sale en inglés.
- **La colección** (`ContentSelectScreen`) muestra las categorías de los packs (en Mansiones: cajas, figuras y losetas, y kits de conversión) más la de los packs de la comunidad (`<juego>Custom`), y en cada una sus packs. El juego base se ve siempre elegido. Lo elegido se guarda en `config.ini` (`[MoMPacks]`) con el idioma de los textos de cada pack, y elegir un idioma («Base» incluido) también elige el pack. Al empezar partida se cargan los packs elegidos (`Game.SelectQuest`), y un escenario que pide uno que falta no se puede elegir.
- **Los packs de la comunidad** (`ContentSelectDownloadScreen`) se pueden bajar, actualizar (cuando la lista trae otra `version`) o borrar. Lo bajado va a `Download/ContentPacks/<id>.valkyrieContentPack`, con su entrada en el `manifest.ini` de esa carpeta: en ella `type` sale dos veces, el del pack y el del juego, y vale el primero. El pack se añade al contenido, pero hay que elegirlo en la colección.
- **Medido en la nube**, con la tienda de verdad: TLE (89 MB) se baja en 4 s. Con él guardado, la app vuelve a arrancar hasta el menú en 1,3 s. Su escenario *The Pharaoh's Tomb* (`Desert_en`) se baja y abre sus detalles una vez elegidas TLE y las siete expansiones.
- **En el Chrome de kozka**, con la tienda de verdad (8 de octubre): *StrainOnReality* se bajó entero de GitLab (170 MB) y *O Mal que Nunca Dorme* de GitHub (49 MB), sin un aviso ni un error en `dev.log`.

### TLE

Lo que hacen *The Pharaoh's Tomb* (`Desert_en`) y el pack TLE, leído en sus ficheros y probado en la app (paso 7.7):

- **La introducción**: el evento inicial (`EventAddUi`) pone `UI0`, una imagen con el texto de la introducción dibujado (`Images/desert_intro.png`, del ancho de la pantalla), y encima `UI1`, un texto vacío y transparente tan grande como la pantalla. Pulsarlo cambia `UI1` por `UI2`, igual, y pulsar `UI2` lanza `EventPlayDesert`, cuyo `event1` lista los cien mapas de `all/` sin `randomevents`: Valkyrie toma entonces el primer evento disponible (`EventManager.EndEvent`), así que siempre pasa a `all/folder_0001` (*The nightmare at Swaniawski*). Los cuatro paquetes de TLE lo hacen igual.
- **El menú para elegir mapa** (`EventStartMenu`, `UIRandom`…, con `randomevents`) no se muestra nunca, y sus imágenes no vienen en el paquete: son los medios que faltan de la batería en `Desert_en`.
- **El paquete** pesa 32 MB: 644 ficheros, 102 `quest.ini` y 36 MB de textos sin comprimir (cada mapa trae su `tokens.ini` y su `Localization.English.txt`). Las aventuras de `all/` piden otros packs (`MoM1ET CotWT FAT…`), pero `ChangeQuest` no lo comprueba.
- **El pack TLE** (89 MB) trae 54 imágenes: losetas en PNG de 2048×2048 y 2048×1024 con `pps=292`, monstruos y fichas. Tres losetas son JPEG con nombre `.png` (`md_lost_ruins`, `sm_column_hall`, `sm_treasure_room`); `LoadImage` de Unity las lee por su contenido, y el navegador también.
- **Guardar**: el cambio de aventura guarda la partida (`SaveManager.Save(0)`), y el primer autoguardado de la sesión mete el paquete entero en el zip. Recomprimir sus textos tardaba 4 s en Chrome de escritorio, y cada autoguardado siguiente (al acabar la ronda o salir) 3 s, con la página parada; Valkyrie lo hace en otro hilo, y DotNetZip copia sin recomprimir lo que no cambia. Universalis copia ahora tal cual las entradas que vienen sin cambios del paquete o de la partida anterior: 0,1 s, y la partida ocupa 32 MB.
- **Playwright** no puede servir una respuesta de casi 100 MB (la pasa en base64 por la conexión con el navegador), así que `tle.spec.ts` sirve TLE con imágenes en blanco del mismo tamaño.

## 9. Lo que queda por comprobar

- La semántica exacta de ejecución de eventos frente a la app de escritorio: `EventManager` ya está portado con sus tests, pero falta comparar partidas grabadas en las dos apps (plan, «Compatibilidad con las aventuras actuales»).
- Cómo importar directamente desde los ficheros de la app oficial (Steam), como FFGAppImport. El plan propone `unityfs-js` y `texture2ddecoder-wasm` (sección «Contenido oficial» de `docs/plan.md`). Hoy Universalis usa la carpeta que ya importó Valkyrie.
- Si hay más repositorios de NPBruce que importen.
- La licencia de los repositorios de escenarios de Descent.
