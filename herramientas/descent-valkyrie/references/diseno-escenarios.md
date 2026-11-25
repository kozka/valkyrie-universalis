# Diseño de aventuras y campañas de Descent: cómo hacer una buena

Buenas prácticas para diseñar aventuras cooperativas de *Descent 2ª ed.* en Valkyrie, con el modo de
*Camino a la leyenda*: cómo están hechas las de la app oficial, qué hacen las 59 de la tienda (295 `quest.ini`)
y cómo escribirlas en español. Las recetas técnicas están en `patrones.md`; las reglas, en `reglas-descent.md`.

## Índice

1. [Proceso de trabajo](#1-proceso-de-trabajo)
2. [Documento de diseño (plantilla)](#2-documento-de-diseño-plantilla)
3. [Cómo funcionan las aventuras de Camino a la leyenda](#3-cómo-funcionan-las-aventuras-de-camino-a-la-leyenda)
4. [Estructura recomendada](#4-estructura-recomendada)
5. [Mapa y duración](#5-mapa-y-duración)
6. [Monstruos y equilibrio](#6-monstruos-y-equilibrio)
7. [Objetivos y finales](#7-objetivos-y-finales)
8. [Campañas](#8-campañas)
9. [Escribir en español](#9-escribir-en-español)
10. [Cómo evitar bloqueos](#10-cómo-evitar-bloqueos)
11. [Pruebas](#11-pruebas)
12. [Descripción y presentación](#12-descripción-y-presentación)

---

## 1. Proceso de trabajo

1. **La historia y el objetivo** en dos frases: qué quieren los héroes, qué se lo impide, cómo se gana y cómo
   se pierde.
2. **El mapa en papel** con las piezas que tiene el usuario: dónde empiezan, qué se ve al principio, qué hay tras
   cada puerta (`mapa-losetas.md`).
3. **Los grupos de monstruos** de cada zona, sus límites de grupo y el jefe; los refuerzos y la amenaza.
4. **El documento de diseño** (§2), revisado con el autor.
5. **Construir por bloques** y validar cada poco (`validar.py`, `grafo.py`, `mapa.py --png`).
6. **Probar** con 2 y con 4 héroes, con las piezas reales, y en una campaña de principio a fin.

## 2. Documento de diseño (plantilla)

Rellénalo con el autor antes de generar nada; lo que no se sepa se decide con valores razonables y se marca.

```markdown
# <Título>
- Identificador: <SinEspacios>          - Idiomas: Spanish + English
- Héroes: 2-4                            - Expansiones obligatorias: ninguna / …
- Duración: 60-90 min (6-8 rondas)       - Dificultad: 2/5 (difficulty=0.4)
- Suelta o campaña (cuántas aventuras, ciudad entre ellas)

## Premisa (lo que leen los héroes)
## Objetivo (y cuándo se revela o cambia)
## Mapa: piezas, Entrada, puertas, qué se coloca al empezar y qué al abrir cada puerta
## Fichas: Búsqueda, Objetivo, Aldeanos, terreno especial (y sus reglas)
## Grupos de monstruos: tipo o rasgos, dónde, cuándo, casillas para 2/3/4 héroes, refuerzos
## Jefe: Vida adicional, reglas en Información, activaciones propias
## Presión: amenaza y peligros, límite de rondas
## Finales: victoria, derrota por moral, otras derrotas; recompensas (PE, oro, fama, objetos)
## En campaña: qué variables % cambian lo que viene
```

## 3. Cómo funcionan las aventuras de Camino a la leyenda

- **La app prepara la mesa** paso a paso: qué piezas apartar, qué colocar y dónde, qué grupos y en qué casillas
  (marco rojo para el líder). Los jugadores montan, mueven, tiran y aplican las reglas.
- **El mapa se revela**: al abrir puertas aparecen piezas, fichas, monstruos y reglas nuevas.
- **El objetivo** se dice al empezar y se actualiza («Objetivo actualizado») cuando la historia gira.
- **Los monstruos los dirige la app**: tras cada héroe se activa un grupo al azar con una activación propia de
  su tipo (prioridades de objetivo, «Divisa», «Confronta», «Ataca»).
- **Presión**: la amenaza sube cada ronda y trae peligros; en algunas, refuerzos o un límite de rondas.
- **Moral**: cada héroe fuera de combate la baja; sin moral, se pierde la aventura.
- **Recompensas** al final: PE, oro, fama, objetos; en campaña, el resultado cambia lo que viene.
- En la tienda de Valkyrie: mediana de **4 piezas** por aventura (sin contar entradas, terminales ni
  extensiones), **10 Spawn** (incluidas versiones alternativas), **peligros** en 67 de 242 aventuras con mapa,
  **monstruos propios** en la mitad, textos de ~120 caracteres de mediana (el 90 % por debajo de 320).

## 4. Estructura recomendada

1. **Prólogo** (un único `EventStart`): gancho, lugar, qué está en juego. Breve.
2. **Preparación**: aparta, coloca el mapa inicial, héroes en la Entrada, fichas y los primeros 1-2 grupos.
3. **Objetivo** claro desde el principio (aunque luego cambie).
4. **Exploración** (rondas 1-4): puertas que revelan zonas con fichas y grupos nuevos; una decisión o un
   personaje (rescatar, negociar) que cambie algo.
5. **Giro** (rondas 4-6): aparece el jefe o cambia el objetivo; la amenaza ya da peligros.
6. **Clímax y final** (rondas 6-10): el jefe cae o los héroes llegan; epílogo con recompensas. Derrota por moral
   (y, si la hay, por tiempo).

Ritmo: una aventura de 60-90 minutos son 6-8 rondas con 2-4 héroes. Peligros a 4/6/8 de amenaza y un clímax
antes del mortal.

## 5. Mapa y duración

| Duración | Piezas (sin conectores) | Grupos en total |
|---|---|---|
| 45-60 min | 2-3 | 2-3 |
| 60-90 min | 3-5 | 3-4 |
| 90-120 min | 5-7 | 4-6 |

- Une **salida con salida** y cierra con terminales las que no lleven a ninguna parte (`mapa.py --colocar`).
- Una pieza de cada número; no uses las dos caras de la misma pieza a la vez.
- Interior y exterior según la historia (rasgos `inside`/`outside`), con una transición entre ambos.
- El terreno dibujado (agua, foso, lava) cambia la partida: tenlo en cuenta al poner monstruos y objetivos.
- Los héroes empiezan en la Entrada; la salida de la aventura, si la hay, es otra entrada.

## 6. Monstruos y equilibrio

- **Límites de grupo** de la carta para 2, 3 y 4 héroes (casillas `placementN`). Más héroes = más figuras, no
  más grupos.
- **Grupos a la vez**: en torno a tantos como héroes; cada grupo se activa una vez por ronda.
- **Mezcla**: uno de cuerpo a cuerpo y otro a distancia, o uno rápido y otro duro. Grupos abiertos por rasgos
  para variar entre partidas.
- **Jefe**: único con Vida adicional de unas 2-4 más 1-2 por héroe (un monstruo pequeño del Acto I aguanta 2-6
  `{heart}`, uno grande 6-10), sus reglas y orden de aumentos en Información y 2-3 activaciones propias.
- **Acto I / Acto II**: los monstruos, el oro y los objetos de la tienda cambian de acto; en una campaña corta,
  todo Acto I.
- **Refuerzos**: con tope (el límite de grupo) y condición (cada 2 rondas, mientras el grupo siga).
- **Amenaza**: umbrales más bajos en «Difícil».
- **Recompensas**: 1 PE por héroe y aventura, 25 de oro por héroe al ganar, 1 de fama; un objeto o una reliquia
  en momentos especiales.

## 7. Objetivos y finales

Objetivos que funcionan con la app (detalles en `reglas-descent.md` §16):

- Derrotar a un jefe (disparador `DefeatedUnique…`).
- Llevar algo a un sitio o escapar (fichas que se recogen y una pregunta en el destino).
- Rescatar o escoltar aldeanos (reglas de movimiento en el texto, preguntas al final de ronda).
- Destruir un objeto con Vida (`quota` para acumular el daño).
- Aguantar o terminar antes de un límite.

Finales: **victoria**, **derrota por moral** (siempre) y, si los hay, otras derrotas. Cada epílogo dice qué se
gana. En campaña, perder no acaba la campaña: cambia lo que viene.

## 8. Campañas

- 2-5 aventuras con una **ciudad** entre ellas (moral, tienda, PE, quizá un evento) y un **viaje**.
- Las decisiones y resultados se guardan en variables `%` y cambian prólogos, monstruos y recompensas.
- Umbrales de fama al empezar; tienda del Acto I y, si la campaña es larga, del Acto II.
- Cada aventura con inglés además del español (`formato-escenario.md` §21).
- Un final que cierre la historia en los dos casos (victoria y derrota).

## 9. Escribir en español

- Segunda persona del plural para el grupo («Colocad a los héroes», «Vuestra Moral sube en 1») y del singular
  para quien hace la prueba («sufres 1 `{heart}`»).
- Términos de la comunidad hispana: pieza, Entrada, terminal, ficha de Búsqueda / de Objetivo / de Aldeano,
  líder y esbirro, límite de monstruos, prueba de `{might}`, fuera de combate, PE, oro, fama, peligro (glosario en
  `reglas-descent.md` §18).
- Instrucciones de preparación en negrita al principio («**Preparación**»), objetivos con «**Objetivo:**».
- Activaciones: una acción por línea, con `{action}` delante y prioridades claras («el héroe más cercano», «con
  menos Vida restante», «a 3 casillas o menos»).
- Textos cortos: si una pantalla pasa de ~400 caracteres, pártela.

## 10. Cómo evitar bloqueos

- Toda puerta se puede abrir de algún modo (llave o prueba que se puede repetir).
- `NoMorale` termina la partida o, si cambia de aventura, deja antes la moral en 0 o más.
- Toda UI se quita; toda tienda se cierra con `remove=#shop`.
- Un objetivo que depende de una figura concreta: que esa figura sea única o un grupo propio.
- Grupos abiertos con candidatos en el juego básico.
- `grafo.py` enseña lo inalcanzable y los finales; `validar.py` los fallos que cierran Valkyrie.

## 11. Pruebas

- Con 2 y con 4 héroes (las casillas y la Vida adicional cambian).
- La derrota por moral y la victoria, en cada aventura.
- En campaña, el paso de una aventura a otra con las dos ramas (ganada y perdida) y la tienda.
- Con las piezas físicas, para ver si el mapa se puede montar.
- Valkyrie Universalis (web) juega los mismos paquetes: sirve para probar desde el móvil.

## 12. Descripción y presentación

- Título propio; sinopsis de una línea sin destripar; descripción con el gancho, la duración, el número de
  aventuras y las expansiones necesarias.
- Portada propia (no arte de la editorial) de unos 300×300.
- `packs=` exacto; `difficulty` y `lengthmin`/`lengthmax` realistas.
