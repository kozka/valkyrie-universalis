# Guía de escenarios de Mansiones e Igor

La guía es lo que la app sabe de cada escenario de la tienda de Valkyrie para Mansiones, además de lo que dice la propia tienda: de qué tipo es, cuánto dura de verdad, si lleva mucho combate, si es para principiantes… La usan el **filtro por tipo de aventura** de la lista, el **aviso +18** de las tarjetas e **Igor**, el mayordomo que recomienda aventuras. Solo hay guía de Mansiones: Descent y DooM no la tienen.

Se hizo el 23 de octubre de 2026 con los 169 escenarios de la tienda. Cuando lleguen escenarios nuevos hay que repetir el proceso con ellos, así que aquí queda cómo se hizo.

## Dónde está cada cosa

| Qué | Dónde |
| --- | --- |
| La guía, que lee la app | `packages/app/src/guide/MoM.json` |
| Cómo la lee la app (tipos, etiquetas finales, categorías del filtro) | `packages/app/src/guide/guide.ts` |
| Script que la actualiza desde la tienda y los paquetes | `herramientas/guia-escenarios/actualizar.py` |
| Script que la pasa a Excel para revisarla, y la vuelve a leer | `herramientas/guia-escenarios/excel.py` |
| Igor: su ventana, su lógica, sus frases y sus noticias | `packages/app/src/igor/` (`Igor.tsx`, `recommend.ts`, `lines.ts` y `lines/`, `news.json`) |
| Imágenes de Igor | `packages/app/src/assets/igor/` |
| Pruebas | `packages/app/tests/igor.test.ts` |
| Copias de trabajo (el Excel, datos sueltos; no se suben a git) | `referencias/_etiquetas/` |

## Formato de `MoM.json`

Un objeto por escenario, con la clave de la tienda (la sección de `manifestDownload.ini`, como `Possessed`). Cada uno tiene cinco partes. Las tres primeras las rellena el script; las dos últimas, una persona:

| Parte | Quién | Qué lleva |
| --- | --- | --- |
| `store` | script | De la tienda: nombres y sinopsis (español e inglés), autor, jugadores (`[mín, máx]`; si el escenario no lo dice, 2–5 como Valkyrie), duración del autor (`authorLength`), duración media real, partidas, valoración, % de victorias, dificultad del autor, expansiones necesarias (`packs`), fecha y portada (`url` + `image`) |
| `files` | script | Del paquete descargado: idiomas, número de aventuras (`quests`), eventos, losetas, apariciones de monstruos (`spawns`), puzles y palabras del texto |
| `computed` | script | Etiquetas por reglas (tabla de abajo) |
| `judged` | persona | `setting` (ambiente), `tags` (etiquetas de criterio), `remove` (etiquetas por regla que el revisor quitó), `idealPlayers` (lo que recomienda el autor) y `notes` (notas para el revisor; **no** salen en la app) |
| `review` | persona | `reviewed` (si alguien lo ha revisado) y `comments` (comentarios del revisor) |

Las etiquetas que usa la app son las de `computed` más las de `judged.tags`, menos las de `judged.remove`.

### Etiquetas por reglas (`computed`)

| Etiqueta | En el Excel | Regla |
| --- | --- | --- |
| `solo` | Admite solitario | Mínimo de jugadores = 1 |
| `sixPlus` | 6 o más jugadores | Máximo de jugadores ≥ 6 |
| `short` | Duración reducida | Menos de 90 min: la media real si hay 10 partidas o más; si no, el máximo del autor |
| `long` | Largo | Más de 180 min, con el mismo criterio (el mínimo del autor) |
| `hard` | Difícil | Menos del 50 % de victorias con 20 partidas o más |
| `combat` | Combate | 25 apariciones de monstruos o más, o el autor lo anuncia (`judged.tags` con `combat`) |
| `littleCombat` | Poco combate | 3 apariciones o menos |
| `puzzles` | Puzles | 5 puzles o más, o el autor los anuncia |
| `narrative` | Narrativo | 18.000 palabras o más en su idioma principal (no en los generados por partes: Pruebas, Faraón, Hielo) |

### Etiquetas de criterio (`judged.tags`)

`beginners` (para principiantes: solo si el autor lo dice), `deduction` (al final hay que señalar a alguien), `replayable`, `timer` (contrarreloj), `campaign` (campaña o serie), `chooseDifficulty`, `multipleEndings`, `hiddenRoles`, `competitive`, `escapeRoom`, `humour`, `fixedInvestigator` (para jugar solo con un investigador concreto) y `adult` (contenido adulto: solo si el autor lo avisa; da el +18 de la tarjeta).

Ambientes (`setting`): `mansion`, `city`, `town`, `building` (manicomio, museo, hotel, iglesia…), `coast`, `ship`, `forest`, `jungle`, `train`, `otherWorld`, `various`, o `null` si la ficha no lo dice.

### La regla de los spoilers

Las etiquetas y los ambientes dicen **qué tipo de partida es, nunca qué pasa**. «Deducción» dice que al final hay que señalar a alguien, no a quién. Si algo es una sorpresa de la historia (una traición, un final), **no** se etiqueta, aunque esté en los ficheros: se avisa en `notes` con «REVISAR» para que decida el revisor. Por ejemplo, *Drácula* y *Artefactos robados*.

## Cómo se hizo (23 de octubre de 2026)

1. **Datos**: `actualizar.py` leyó la tienda (`referencias/valkyrie-store`) y los 169 paquetes (`referencias/descargas`).
2. **Criterio**: Claude leyó la sinopsis y la descripción de cada escenario, en español o en inglés, y buscó en sus textos señales de roles ocultos (pasa el dispositivo, en secreto, traidor…), de azar, de finales y de contrarreloj. Revisó a mano cada escenario donde saltaba alguna señal: casi todas eran ambientación. Con eso puso ambiente, etiquetas de criterio y notas.
3. **Revisión**: el Excel (`excel.py exportar`) va a alguien que conozca los escenarios. Lo que corrija vuelve a la guía con `excel.py importar`.

## Cuando lleguen escenarios nuevos

1. Bajar la tienda y los paquetes al día: `node referencias/clonar.mjs` y `node referencias/descargar-escenarios.mjs`.
2. `py -3 herramientas\guia-escenarios\actualizar.py`. Refresca los datos y las reglas de todos, conserva lo escrito a mano y lista los **nuevos**, que entran con `judged` vacío y `review.reviewed` en `false`.
3. Rellenar el `judged` de los nuevos: a mano, en el JSON, o pidiéndoselo a Claude («lee los escenarios nuevos de la guía y ponles ambiente, etiquetas y notas como dice `docs/guia-escenarios.md`»), con el mismo vocabulario y la regla de los spoilers.
4. Si hay revisor: `py -3 herramientas\guia-escenarios\excel.py exportar`, se le pasa el Excel de `referencias/_etiquetas/` y, cuando lo devuelva, `py -3 herramientas\guia-escenarios\excel.py importar ruta\al\excel.xlsx`.
5. Subir `packages/app/src/guide/MoM.json`.

Un escenario que ya no está en la tienda sale de la guía (el script lo avisa). Uno que la guía no conoce (más nuevo que ella, o uno que añadió el jugador) no tiene etiquetas: el filtro por tipo lo oculta mientras haya tipos marcados, e Igor no lo recomienda.

## Igor

Igor es una prueba para Halloween de 2026: un mayordomo de castillo, entre Lovecraft y *El jovencito Frankenstein*, que habla con frases fijas elegidas al azar, todavía sin IA. Sale abajo a la derecha del menú de Mansiones. Saluda (con frases de Halloween entre el 20 de octubre y el 2 de noviembre), comenta las noticias y recomienda tres aventuras tras **tres preguntas como mucho**:

- Siempre pregunta primero cuántos juegan, porque es lo que más descarta.
- Después elige, entre experiencia, tiempo, estilo y saga, la pregunta cuyas respuestas mejor reparten lo que queda. Así cada respuesta cuenta, y cambia un poco el orden de una vez a otra.
- Nunca ofrece escenarios que el jugador haya marcado como jugados, ni los que piden expansiones que no tiene en su colección.
- Puntúa por valoración, partidas, lo que encaja con las respuestas y si está en el idioma del jugador. Prefiere la primera parte de una saga (lo deduce de las notas) y no repite autor ni ambiente entre las tres si puede evitarlo.
- «Llévame a ella» abre la ficha si el escenario ya está descargado. Si no, lleva a su tarjeta en la lista y la ilumina, para que el jugador decida si la baja.

**Sus frases** están en `packages/app/src/igor/lines/`, un fichero por cada uno de los 13 idiomas de Valkyrie. `lines.ts` dice para qué es cada tipo de frase. Las escribió Claude en español e inglés y las tradujo a los demás manteniendo el tono, así que conviene que las repase un nativo. Cada tipo de frase tiene varias; para darle más variedad, basta añadir líneas a las listas de cada idioma (no hace falta que tengan las mismas en todos). Un test (`igor.test.ts`) comprueba que ningún idioma se deja un tipo de frase ni una respuesta.

**Noticias y promociones**: en `packages/app/src/igor/news.json`. Cada noticia tiene:

```json
{
  "id": "2026-11-nueva-aventura",
  "scenario": "ClaveDeLaTienda",
  "from": "2026-11-01",
  "until": "2026-11-15",
  "text": { "Spanish": "Ha llegado una historia nueva y escalofriante: …", "English": "A new, chilling tale has arrived: …" }
}
```

- `id`: único. Igor saluda con la noticia más reciente que el jugador no haya visto y la recuerda en `config.ini` (`[Universalis] igorSeen`), para no repetirla en el saludo.
- `scenario`: la clave de la tienda, como en `MoM.json`. Si se pone, Igor enseña su tarjeta con «Llévame a ella». Puede faltar en un aviso sin aventura.
- `from` / `until`: fechas en que se muestra, las dos incluidas.
- `text`: por idioma de Valkyrie; sin el del jugador, se usa el inglés. Conviene ponerla en los 13.

Mientras haya una noticia sin ver, el retrato de Igor lleva una brasa encendida. Para promocionar algo basta con decirle a Claude qué escenario, qué decir y entre qué fechas.
