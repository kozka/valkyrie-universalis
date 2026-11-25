# Revisión independiente con rúbrica

Al final del flujo de creación (y para revisar uno ajeno), alguien que **no ha visto cómo se
diseñó** lee el escenario como jugador y lo puntúa. Si se puede, un agente aparte (un subagente sin
la conversación de diseño): así el escenario no se corrige a sí mismo. Si no, quien lo hizo lo
relee con estos criterios, haciendo de lector exigente.

## Índice

1. [Cómo se hace](#1-cómo-se-hace)
2. [La rúbrica](#2-la-rúbrica)
3. [Qué devuelve](#3-qué-devuelve)
4. [Encargo para el revisor](#4-encargo-para-el-revisor)

## 1. Cómo se hace

1. **Antes de revisar la calidad, que funcione**: `validar.py` sin errores.
2. **Recorrido razonado, como una mesa**: con `grafo.py` delante, el revisor juega el escenario de
   cabeza ronda a ronda, con el mínimo y el máximo de investigadores: qué ve al empezar, qué
   pulsaría una mesa normal (no la que ya sabe la solución), qué encuentra, qué decide, dónde se
   atasca, cuándo llega el giro, cómo acaba. Anota la hoja de ritmo real (`ritmo.md` §5). Es la
   parte que una simulación mecánica no hace bien: entender que un texto dice «ve al sótano» y que
   la mesa irá allí.
3. **Leer todos los textos** del camino principal y de los secundarios, en voz alta mentalmente.
4. **Puntuar** cada criterio del 1 al 5 con la rúbrica (§2), con un ejemplo concreto del escenario
   que lo justifique (un componente y lo que pasa en él).
5. **Devolver** lo flojo con su sitio y una propuesta (§3). Quien diseñó arregla y se vuelve a pasar
   la revisión, hasta que ningún criterio quede por debajo de 4.

Ayuda mecánica opcional: la pestaña «Análisis» del editor de Valkyrie Universalis (tramos muertos,
caminos que no se toman, dónde se para el camino a un final). Sus cifras orientan; no puntúan.

## 2. La rúbrica

| Criterio | Qué mira | 1 | 3 | 5 |
|---|---|---|---|---|
| **Ritmo** | Tramos muertos, latidos, curva de tensión (`ritmo.md`) | Rondas enteras sin nada; el objetivo aparece tarde; el clímax cae con los Mitos mortales | Hay latidos, pero con algún tramo de dos rondas vacío o un final plano | Algo cada 3-4 acciones para cada investigador; respiro antes del giro; final que acelera |
| **Sentido de cada ficha** | Que cada búsqueda o interacción aporte | Muchas fichas de «no hay nada»; vistazos sin texto | La mayoría aportan; alguna sobra | Todas dan algo (pista, detalle, objeto, decisión, susto); ninguna sobra |
| **Desafío** | Justo con el mínimo y el máximo de jugadores; enigmas que se piensan | Imposible con 2 o trivial con 5; enigmas que se adivinan; bloqueos | Equilibrado con el número típico; algún enigma se resuelve a ciegas | Escala con `#heroes`; los enigmas se resuelven con lo leído; perder se entiende |
| **Implicación** | Decisiones que pesan, respuestas del personaje, detalles opcionales | Ninguna decisión; el grupo solo pulsa «Continuar» | Alguna decisión, sin eco posterior | Decisiones cada 2-3 rondas con consecuencias visibles; el escenario recuerda lo que hicieron |
| **Prosa** | Vicios de principiante, largo de los textos, voz (`escritura.md`) | Frases gastadas, adjetivos, textos de 200 palabras, todos hablan igual | Correcta, sin voz propia; algún texto largo | Detalles concretos, ritmo de frase, cada personaje suena distinto, cabe en la ventana |
| **Claridad** | Objetivo, plazos y finales se entienden | No se sabe qué hacer ni por qué se ha perdido | Se entiende con alguna duda | Objetivo claro al revelarse, avisos antes de perder, cada final dice por qué |
| **Historia** | Premisa, verdad oculta, giro, precio del final | Lineal y previsible; giro sin preparar o ninguno | Buena premisa, giro esperable | El giro se planta y se cobra; el final tiene precio y deja una pregunta |
| **Investigación** | Que la mesa decida qué mirar por lo que sabe (`investigacion.md`) | Hay que pulsarlo todo: salas sin describir, fichas genéricas, pistas que no se usan | Se describe lo que hay, pero las pistas solo abren puertas | Salas descritas con fichas coherentes; pistas que abren conversaciones y decisiones; tres caminos para lo imprescindible; tiradas que dicen algo según los éxitos |
| **Producción** | Imágenes, sonido, presentación (`desafios.md` §7) | Sin nada propio; descripción pobre | Algo de imagen o sonido; descripción correcta | UI e imágenes en los momentos clave, sonido propio, descripción que vende y avisa de lo que pide |

Cada nota necesita su ejemplo. Una nota sin ejemplo no vale.

## 3. Qué devuelve

```markdown
## Revisión de <Escenario>
| Criterio | Nota | Por qué (ejemplo) |
|---|---|---|
| Ritmo | 3 | Rondas 4-5: con 2 investigadores solo queda el pasillo (TokenPasillo2 da «nada»). |
| … | | |

### Lo que hay que arreglar, de más a menos importante
1. **<Componente>**: qué pasa → qué proponer.
2. …

### Cambios concretos (investigacion.md §13)
| Componente | Qué pasa | Cambio (quitar, cambiar, añadir) |
|---|---|---|

### Lo que funciona y hay que conservar
- …

### Recorrido (hoja de ritmo real, con 2 y con 4 investigadores)
| Ronda | Qué encuentra la mesa | Decisión | Quién espera |
|---|---|---|---|
```

## 4. Encargo para el revisor

Para un subagente, con la carpeta del escenario y nada del diseño:

> Eres un jugador experto de *Las Mansiones de la Locura* y un editor exigente. Revisa el escenario
> de `<carpeta>` como lo jugaría una mesa que no lo conoce. Lee `references/revision.md`,
> `references/ritmo.md`, `references/investigacion.md` y `references/escritura.md` de la skill mansiones-valkyrie. Ejecuta
> `scripts/validar.py` y `scripts/grafo.py` sobre la carpeta. Recorre la partida ronda a ronda con 2
> y con 4 investigadores, lee todos los textos y puntúa los nueve criterios del 1 al 5, cada nota con
> un ejemplo concreto (componente y lo que pasa). Devuelve el informe con el formato de
> `revision.md` §3, con la tabla de cambios concretos. No arregles nada: solo revisa. Sé duro: una nota de 5 es para algo que un autor
> veterano publicaría tal cual.
