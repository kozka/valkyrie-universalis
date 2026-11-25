---
name: doom-valkyrie
description: Crea, edita, depura y empaqueta misiones para el pack de la comunidad DooM de Valkyrie (DOOM The Board Game 2016 jugado en el modo Descent de la app libre de NPBruce) y resuelve dudas sobre las reglas del juego de mesa DOOM y cómo las adaptan las misiones de Valkyrie (portales, invasión, Argent, cartas de amenaza, frags, armas, teletransportadores, ejecuciones, marines y demonios). Úsala siempre que se mencione DOOM o DooM junto a Valkyrie, el pack DooM, misiones o mapas caseros de DOOM, o las misiones DooM de la tienda de Valkyrie, aunque no se pida expresamente; también para planificar o revisar una misión. Se apoya en la skill descent-valkyrie para el formato, el validador y los mapas.
license: Instrucciones y scripts propios. Datos derivados de Valkyrie (Apache-2.0); ver LICENCIAS.md
compatibility: Python 3.8 o superior. Necesita la skill descent-valkyrie al lado (mismo plugin). Pillow solo para dibujar mapas.
---

# DooM + Valkyrie

Esta skill convierte una idea en una misión de *DOOM: El juego de tablero* (2016) para Valkyrie, jugable con el
pack de la comunidad DooM, validada y lista para publicar, y sirve de referencia de las reglas del juego de mesa
y de cómo las adapta Valkyrie. El pack convierte DOOM en contenido de Descent: los marines son héroes, los
demonios son monstruos con activaciones de texto y la app hace de invasor, así que todo el formato es el de
Descent (skill **descent-valkyrie**, en la carpeta hermana `../descent-valkyrie`). Lo técnico está comprobado
contra el código de Valkyrie 3.28, el pack DooM y las 11 misiones DooM de la tienda.

Responde en español salvo que el usuario use otro idioma. Explica las cosas en términos de juego («el portal
amarillo de la sala del pozo»), no solo en términos de ficheros.

## Qué hay dentro

| Fichero | Para qué | Cuándo leerlo |
|---|---|---|
| `references/patrones-doom.md` | Recetas: arranque, ronda (activaciones, Argent, mazo de amenaza), portales (Infestación, Horda, Asalto), puertas y tarjetas, armas, botiquines, teletransportadores, objetivos, frags, jefes, presión, equilibrio, plantilla de la tienda | Al construir o revisar una misión |
| `references/reglas-doom.md` | Reglas del juego de mesa parafraseadas, glosario español-inglés, contenido del pack DooM (§10), cómo lo trata Valkyrie, qué reglas cambian y las 11 misiones de la tienda (§11) | Dudas de reglas y para redactar |
| `scripts/doom.py` | Bloques para crear portales, mazo de amenaza, Argent por ronda, armas, botiquines, teletransportadores, tarjetas, puertas, consolas, reglas, frags y derrota | Para construir o ampliar una misión |
| `scripts/nueva_mision.py` | Esqueleto de misión jugable y válido | Al empezar una misión |
| `assets/ejemplo/FugaEnHesperia/` | Misión de ejemplo para 1-4 marines: 3 zonas, portales azules y amarillo, mazo de amenaza, Argent, motosierra y lanzamisiles, tarjeta amarilla, dos consolas y un jefe propio; en español e inglés. Valida sin avisos y se ha recorrido entera, con 1 y con 2 marines, en pruebas automáticas con el motor de Valkyrie portado a Valkyrie Universalis | Como modelo |
| `../descent-valkyrie/references/formato-escenario.md` | Formato de Valkyrie para Descent (eventos, Spawn, MPlace, CustomMonster, variables, disparadores) | Antes de escribir `.ini` a mano |
| `../descent-valkyrie/references/mapa-losetas.md` | Rejilla, piezas, salidas, puertas (vale igual para las piezas de DooM) | Al montar el mapa |
| `../descent-valkyrie/references/valkyrie-app.md` | Instalar, importar, packs de la comunidad (§9), editor (y lo que hace mal, §5), probar, publicar | Dudas de la app |

Las rutas son relativas a la carpeta de esta skill. Los ficheros de referencia son largos: mira su índice y lee
solo la sección que necesites.

## Reglas de oro

Además de las de la skill descent-valkyrie (un solo `EventStart`, `event1=A B` hace uno, `display=false` con
`buttons=1`, etiquetas de botón, errores que cierran Valkyrie…):

1. **`packs=DooM`** en `quest.ini`: sin el pack descargado y activado, la misión no se puede elegir. `minhero=1`
   y `placement1` en todos los Spawn si admite un solo marine (el panel de grupos del editor de Valkyrie no
   enseña `placement1`: se escribe en `spawns.ini`, y se conserva al guardar desde Valkyrie).
2. **Marines**: `HeroAlpha` a `HeroDelta`, con su arquetipo `DooM` y las clases `ClassMarine1` a `4`, que solo
   sugieren armas. No des experiencia ni objetos de Valkyrie: el equipo son las cartas físicas.
3. **Demonios**: `MonsterImp`, `MonsterPossessed`, `MonsterCacoDemon`, `MonsterPinky`, `MonsterRevenant`,
   `MonsterMancubus`, `MonsterBaron_of_Hell` y `MonsterCyberDemon`. Ocupan una casilla en Valkyrie (sin rasgo de
   tamaño). **Los del mismo tipo se juntan en un grupo**: `Defeated<Spawn>` solo salta con el primero; cuenta con
   `#monsters` o `DefeatedMonster<Tipo>`. Un jefe aparte es un `CustomMonster`. `validar.py` lo sugiere: pasa en 3
   de las 11 misiones de la tienda.
4. **Frags = moral**: el invasor gana con F frags → `$%morale,=,F-1` en el `EventStart`; cada muerte es un KO; la
   derrota es `trigger=NoMorale` con `$end,=,1`. **Nunca `Eliminated`** ni otros disparadores de Mansiones.
5. **Portales**: ficha `Token_DM_<Color>_Portal_A` → botón → evento silencioso que **quita la ficha** y elige al
   azar un grupo (`randomevents=true`) → Spawn con casillas para 1-4 marines → Argent del grupo. Quitar la ficha
   en su propio evento la gastaría con solo mirarla.
6. **Cada ronda** (`StartRound`, también la primera, tras el arranque): Argent si hay demonios
   (`#monsters>0`) y, si se juega con él, una carta del mazo de amenaza.
7. **El «mazo de amenaza»** de estas misiones son efectos de una ronda que roba la app, no las cartas de
   Amenaza del juego (Infestación, Horda, Asalto), que deciden cómo se abren los portales.
8. **Cartas de evento**: solo sirven para la defensa de los demonios; si la app decide los grupos de cada
   portal, no hace falta carta de Invasión.
9. **Piezas** `TileSideDooM_NN_A/B`: se unen salida con salida (`mapa.py --colocar`), la 13 hace de entrada y la
   15 de cuarto pequeño o cierre. La caja trae 24; por las misiones de la tienda, como mucho 6 copias de la 15 y 2
   de la 10, la 12 y la 13 (deducción, `reglas-doom.md` §2.6).
10. **Valkyrie no sabe** posiciones, daño, tambaleo, cartas ni quién lleva qué: el texto dice qué hacer y los
    botones preguntan lo que importa («¿Están todos los marines en el teletransportador de salida?»).
11. **Textos**: segunda persona del plural y términos de `reglas-doom.md` §9. En las activaciones propias,
    `{action}` delante de cada paso, como hace el pack (un coste «[1 Argent] …» va antes, sin él); en eventos y
    botones no hace falta. Los botones de la app: «Fin del Turno», KO, Recuperar (en español la app pone
    «Recupear»), «Forzar Activación», Derrotado y «Único Derrotado».
12. **Pelotones de menos de 4 marines**: o grupos fijos con cartas de pelotón, como el juego de mesa (`D.Opcion`
    con un número; así lo hacen el esqueleto y el ejemplo), o grupos que crecen con los marines y sin esas cartas
    (cuatro números; `nueva_mision.py --escalar`). Nunca las dos cosas. Con un solo marine, *Solo Operative* le da
    dos activaciones: entre la primera y la segunda se pulsa «Forzar Activación» en un grupo que no haya actuado
    (lo explican las fichas de reglas de `D.reglas`).

## Flujo A: crear una misión

1. **Diseño.** Objetivo, 2-4 zonas que se abren con puertas, qué portales hay en cada una y sus dos grupos (fijos
   o que crecen con los marines, regla 12), frags, Argent por ronda, mazo de amenaza sí o no, armas, tarjetas,
   jefe y finales (`patrones-doom.md` §10).
   Pregunta solo lo que cambie mucho el resultado (número de marines, duración, si quieren el mazo de iniciativa
   físico); decide el resto y dilo. Si quieren «algo rápido», propón tú la misión entera.
2. **Esqueleto.**
   ```bash
   python scripts/nueva_mision.py MiMision --titulo "Laboratorio 3" --destino <carpeta> \
          [--sala1 TileSideDooM_08_A] [--sala2 TileSideDooM_05_A] [--frags 6] [--argent 2] [--sin-amenaza] \
          [--duracion 45-60] [--dificultad 0.4] [--autor "Nombre"] [--idioma Spanish] [--ingles]
   ```
   Crea arranque, preparación, mazo de amenaza, entrada con teletransportador, una sala con Imps y un botiquín,
   una puerta a la segunda sala (portal azul de dos grupos, motosierra y consola), Argent por ronda, fichas de
   reglas, victoria al completar la consola y derrota por frags, y pasa `validar.py` al terminar. Grupos fijos y
   cartas de pelotón; con `--escalar`, grupos que crecen con los marines. Como `--sala1` solo sirven las caras
   con 2 salidas conocidas (de las B, 10_B y 12_B), y como `--sala2`, las de 6 casillas o más: la ayuda
   (`--help`) las lista.
3. **Mapa.** Con los scripts de Descent: `python ../descent-valkyrie/scripts/mapa.py --info TileSideDooM_09_A`
   (forma y salidas), `… mapa.py MiMision --colocar TileSideDooM_16_A --junto-a TileSala2 --lado N` (posición y
   puerta), `--casillas TileSala2` (dónde poner fichas y demonios).
4. **Contenido.** Zona a zona con `patrones-doom.md` y los bloques de `doom.py`:
   ```python
   import sys; sys.path.insert(0, "<carpeta de esta skill>/scripts")
   import doom as D
   m = D.Mision("MiMision")
   portal = D.portal(m, "Norte", "amarillo", (5, 6), [
       D.Opcion([("MonsterCacoDemon", (1, 1, 2, 2), [(5, 5), (6, 5)])]),
       D.Opcion([("MonsterRevenant", (1, 1, 1, 1), [(6, 6)])], argent=1)])
   arma = D.arma(m, "Gauss", "gauss", (2, 7))
   m.sc.components["EventAbrirNorte"]["add"] += f" {portal} {arma}"   # que salgan con su zona
   m.save()
   ```
   Para lo demás, `m.c(nombre, texto_es, botones, en=texto_en, clave=valor…)` o la librería `valkyrie_io` de
   Descent; para cambios pequeños, edita los `.ini` y la localización a mano.
5. **Validar**: `python ../descent-valkyrie/scripts/validar.py MiMision` hasta que no haya errores; revisa los
   avisos.
6. **Revisar**: `grafo.py` (qué dispara qué) y `mapa.py --png <fuera>/mapa.png` (míralo) de la skill de Descent.
   Después, la **revisión independiente** con la rúbrica de `../descent-valkyrie/references/revision.md`
   (con 1 y con 4 marines); la hoja de ritmo y el tono de DooM (seco, militar, partes por radio), en
   `ritmo.md` y `escritura.md` de la misma skill.
7. **Entregar**: la carpeta (para `%APPDATA%\Valkyrie\D2E\Editor\`) y el paquete con
   `python ../descent-valkyrie/scripts/empaquetar.py MiMision --salida <carpeta>`. Recuerda que hay que tener el
   pack DooM activado y probar con 1 y con 4 marines.

## Flujo B: revisar o arreglar una misión

1. Descomprime el `.valkyrie` y pasa `validar.py`, `grafo.py` y `mapa.py`.
2. Las misiones de la tienda usan la plantilla de Neuntoter: sus nombres y trampas conocidas están en
   `patrones-doom.md` §12 y `reglas-doom.md` §10.6 (puerta amarilla que se abre sin tarjeta, moral desfasada en 1,
   `Eliminated`, contadores con `DefeatedSpawn…`).
3. Explica cada problema en términos de juego, propón el arreglo y respeta el estilo del autor.

## Flujo C: dudas de reglas o del pack

- Reglas del juego de mesa: `reglas-doom.md` (chuleta en §0); qué cambia en Valkyrie: §10.4; el pack: §10.2;
  las misiones de la tienda: §11.
- La app (instalar el pack, importar Road to Legend, que Valkyrie exige para el modo Descent): `valkyrie-app.md`
  de la skill de Descent.
- Lo que dependa de la actualidad (versiones nuevas del pack o misiones nuevas), búscalo en la web y dilo.

## Flujo D: traducir

Como en la skill de Descent (Flujo D): `Localization.<Idioma>.txt` con las mismas claves, conservando marcas
(`{type}`, `{c:…}`, `{var:…}`, `{0}`, `{1}`) y etiquetas. Términos en `reglas-doom.md` §9.

## Scripts

| Script | Uso |
|---|---|
| `scripts/nueva_mision.py <Id> --titulo "…" [opciones del paso 2]` | Esqueleto jugable y válido |
| `scripts/doom.py` | Librería: `Mision`, `Tablero`, `portal`, `Opcion`, `ronda`, `arma`, `botiquin`, `teletransporte`, `tarjeta`, `puerta`, `consola`, `reglas`, `frags`, `derrota` |
| `../descent-valkyrie/scripts/validar.py`, `grafo.py`, `mapa.py`, `buscar.py --pack DooM`, `empaquetar.py` | Validar, ver el flujo, el mapa, buscar componentes del pack y empaquetar |

## Lo que Valkyrie no puede hacer (y cómo se suple)

- No lleva el daño, el tambaleo ni el Argent de cada demonio, ni las cartas de los marines → las fichas y cartas
  físicas; el texto dice cuánto Argent gana el invasor y dónde ponerlo.
- No sabe qué ve cada marine → el texto pide pulsar el portal cuando un marine lo vea.
- No hay mazo de iniciativa en la app → «modo Valkyrie» (marine, grupo al azar, marine…) o «Forzar Activación»
  con el mazo físico.
- Los demonios grandes ocupan una casilla en la app → el texto dice dónde va la figura.
- `{0}` en una activación es un marine al azar, aunque esté muerto → «hacia ese marine (si no está en el mapa,
  hacia el más cercano)».
