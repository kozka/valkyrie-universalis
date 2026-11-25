# Revisión independiente con rúbrica (Descent y DooM)

Al terminar una aventura (o para revisar una ajena), alguien que no ha visto cómo se diseñó la lee
como jugador y la puntúa. Si se puede, un subagente sin la conversación de diseño; si no, quien la
hizo la relee como un lector exigente.

## 1. Cómo se hace

1. `validar.py` sin errores (en una campaña, desde la raíz).
2. **Recorrido razonado**: con `grafo.py` y `mapa.py --png`, juega la aventura de cabeza ronda a ronda
   con 2 y con 4 héroes (en DooM, con 1 y con 4 marines): qué se coloca al empezar, qué abre cada
   puerta, dónde está el combate, cuándo llega el giro, si el clímax llega antes del límite, y qué
   pasa en cada final. En una campaña, recorre también los saltos y lo que cambian las variables `%`.
3. **Leer todos los textos** (prólogo, objetivos, reglas especiales, monstruos, epílogos).
4. **Puntuar** cada criterio del 1 al 5, cada nota con un ejemplo concreto (componente y lo que pasa).
5. **Devolver** lo flojo con su sitio y una propuesta; se arregla y se vuelve a pasar hasta que
   ningún criterio quede por debajo de 4.

## 2. La rúbrica

| Criterio | Qué mira | 1 | 3 | 5 |
|---|---|---|---|---|
| **Ritmo** | Turnos muertos, escalones, giro y clímax (`ritmo.md`) | Rondas solo andando; el jefe sale al final y ya | Hay escalones, con algún tramo vacío | Cada activación importa; giro a mitad; clímax antes del límite |
| **Mapa** | Que cada pieza, puerta y ficha cambie algo | Pasillos vacíos; fichas sin uso | La mayoría aportan | Cada puerta abre una situación nueva; terreno que cuenta |
| **Equilibrio** | 2, 3 y 4 héroes; grupos, jefe, presión | Imposible con 2 o paseo con 4; grupos que no caben | Equilibrada con el número típico | Casillas y vida escaladas; presión visible; perder se entiende |
| **Implicación** | Decisiones, aldeanos, memoria de campaña | Ninguna decisión | Alguna, sin eco | Decisiones con consecuencias visibles; la campaña recuerda |
| **Prosa** | Brevedad, voz, vicios (`escritura.md`) | Párrafos largos, frases gastadas | Correcta, sin voz | Breve, concreta, cada personaje suena distinto |
| **Claridad** | Objetivo, reglas especiales, finales | No se sabe qué hacer; reglas escondidas | Se entiende con dudas | Objetivo claro y actualizado; reglas especiales dichas al aparecer; cada final dice por qué |
| **Historia** | Premisa, giro, precio | Lineal | Buena premisa, giro esperable | Giro plantado y cobrado; ganar cuesta algo |
| **Producción** | Monstruos propios, imágenes, sonido, descripción | Nada propio | Algo propio | Jefes y activaciones propias con sentido, presentación cuidada |

## 3. Qué devuelve

```markdown
## Revisión de <Aventura>
| Criterio | Nota | Por qué (ejemplo) |
|---|---|---|
### Lo que hay que arreglar, de más a menos importante
### Lo que funciona y hay que conservar
### Recorrido (ronda a ronda, con 2 y con 4 héroes)
```

## 4. Encargo para el revisor

> Eres un jugador experto de *Descent 2ª edición* (o de DOOM, si la aventura pide `packs=DooM`) y un
> editor exigente. Revisa la aventura de `<carpeta>` como la jugaría una mesa que no la conoce. Lee
> `references/revision.md`, `references/ritmo.md` y `references/escritura.md` de la skill
> descent-valkyrie. Ejecuta `scripts/validar.py`, `scripts/grafo.py` y `scripts/mapa.py --png`.
> Recorre la partida ronda a ronda con 2 y con 4 héroes, lee todos los textos y puntúa los ocho
> criterios del 1 al 5, cada nota con un ejemplo concreto. Devuelve el informe con el formato de §3.
> No arregles nada. Sé duro: un 5 es para algo que un autor veterano publicaría tal cual.
