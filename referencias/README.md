# Referencias

Clones y descargas que sirven para portar y probar, pero que **no se suben a git** (`.gitignore`) ni se redistribuyen: son de sus autores, y la mayoría de los escenarios no tienen licencia. Se suben solo los dos scripts, este README y `versiones.json`.

| Carpeta | Qué es | Versión | Para qué |
| --- | --- | --- | --- |
| `valkyrie/` | La app de escritorio (C#, Unity) | **Fijada**: `752d420` (3.28, 20 de junio de 2026) | La fuente del comportamiento que se porta, con sus tests y sus datos base |
| `valkyrie-store/` | Las listas de la tienda | La última | Qué escenarios y packs hay, dónde están y su versión |
| `valkyrie-questdata/` | Escenarios del propio proyecto | La última | Casos de prueba |
| `valkyrie.wiki/` | La wiki de Valkyrie | La última | Documentación de formatos y de publicación |
| `ValkyrieMCP/` | Zonas y objetos dibujados en cada loseta (MIT) | **Fijada**: `b1a8992` | Regenerar `contenido_losetas.json` |
| `descargas/` | Los `.valkyrie` y `.valkyrieContentPack` tal como los baja Valkyrie, incluidos los cuatro packs de la comunidad | Según la tienda | La batería de compatibilidad |

```
node referencias/clonar.mjs                          # todos los clones, unos 600 MB
node referencias/clonar.mjs valkyrie-store           # solo los que contengan ese nombre
node referencias/descargar-escenarios.mjs            # escenarios y packs de los dos juegos, unos 3,3 GB
node referencias/descargar-escenarios.mjs D2E packs  # solo los packs de Descent
```

- `versiones.json` guarda el commit de cada clon. Cada descarga deja su informe en `descargas/informe-<juego>-<tipo>.json`.
- Volver a ejecutar los scripts actualiza lo que no está fijado.
- Como Valkyrie, la descarga guarda la `version` que daba la lista y no vuelve a bajar nada cuya versión siga igual; `latest_update` no cuenta.
- Los clones se hacen con `core.autocrlf=false`, para que los ficheros tengan los mismos bytes en Windows y en Linux. Un clon hecho a mano con Git para Windows cambiaría los finales de línea, y con ellos lo que prueba la batería.

Para avanzar la versión fijada de Valkyrie, cambia el commit en `clonar.mjs` y sigue `.agent/rules/porting.md`, apartado «Pinned source».
