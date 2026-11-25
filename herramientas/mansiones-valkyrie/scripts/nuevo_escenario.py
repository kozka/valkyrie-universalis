#!/usr/bin/env python3
"""
nuevo_escenario.py - Crea el esqueleto de un escenario de Valkyrie (MoM 2ª ed.) listo para abrir en el
editor y seguir construyendo: inicio con prólogo, primera loseta, investigadores, una ficha de
Exploración en una puerta real, una de Búsqueda, escalada de Mitos según nº de investigadores,
límite de tiempo, comprobación de progreso/objetivo y finales de victoria y derrota.

Uso:
  python nuevo_escenario.py <Identificador> --titulo "La casa del relojero"
        [--destino CARPETA] [--idioma Spanish] [--ingles] [--packs "BtT SoA"]
        [--loseta TileSideEntryHall] [--dificultad 0.5] [--duracion 60-90] [--autor "Nombre"]

<Identificador>: nombre de la carpeta y del paquete (solo letras, números y _; sin espacios).
--destino: carpeta donde crearlo (por defecto, la actual). Para que aparezca en el editor de
           Valkyrie usa la carpeta del editor (ver references/valkyrie-app.md).
"""
import argparse
import json
import os
import re
import sys
from collections import OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from valkyrie_io import Scenario, CURRENT_FORMAT  # noqa: E402
import mapa as M  # noqa: E402

TXT_ES = {
    "quest.name": "{titulo}",
    "quest.synopsys": "Sinopsis de una línea (sin destripar nada).",
    "quest.description": "Descripción tipo tráiler: gancho, tono, si es de investigación o de combate, "
                         "número de finales y avisos.\\n\\n<i>Escenario para {minh}-{maxh} investigadores.</i>",
    "quest.authors": "<b>Autor</b>\\n{autor}",
    "quest.authors_short": "{autor}",
    "EventPrologo.text": "<i>Arkham, otoño de 1926.</i>\\n\\nEscribe aquí el prólogo: quién os contrata, qué ha "
                         "pasado y por qué estáis aquí. Dos o tres frases como mucho por pantalla.",
    "EventPrologo.button1": "Continuar",
    "EventColocarInicio.text": "Coloca {c:TileInicio} como se indica.",
    "EventColocarInicio.button1": "Continuar",
    "EventColocarInvestigadores.text": "Colocad a los investigadores en el espacio indicado.",
    "EventColocarInvestigadores.button1": "Continuar",
    "EventColocarExploracion.text": "Coloca una ficha de Exploración en la puerta indicada.",
    "EventColocarExploracion.button1": "Continuar",
    "EventColocarBusqueda.text": "Coloca una ficha de Búsqueda en el lugar indicado.",
    "EventColocarBusqueda.button1": "Continuar",
    "TokenExploracionInicio.text": "Una puerta entreabierta deja escapar una corriente fría.",
    "TokenExploracionInicio.button1": "{action} Explorar",
    "EventExplorarInicio.text": "Aquí se revelará la siguiente zona: añade su loseta, sus fichas y su "
                                "monstruo. Mientras tanto, retira la ficha de Exploración.\\n\\n"
                                "<i>Quien ha explorado puede moverse 1 espacio a través de esta puerta, "
                                "a la zona que acaba de revelar.</i>",
    "EventExplorarInicio.button1": "Continuar",
    "TokenBusquedaInicio.text": "Un escritorio cubierto de papeles revueltos.",
    "TokenBusquedaInicio.button1": "{action} Registrar el escritorio",
    "EventBuscarInicio.text": "Realiza una tirada de {observation} (2).",
    "EventBuscarInicio.button1": "Superada",
    "EventBuscarInicio.button2": "Fallada",
    "EventBuscarExito.text": "Entre los papeles encuentras una nota con una dirección. Ganas 1 Pista.",
    "EventBuscarExito.button1": "Continuar",
    "EventBuscarFallo.text": "No encuentras nada útil... de momento.",
    "EventBuscarFallo.button1": "Continuar",
    "EventRevelarObjetivo.text": "<b>Objetivo</b>\\n\\nAquí se revela la tarea final cuando los investigadores "
                                 "han avanzado lo suficiente. Coloca una ficha de Interacción en el lugar indicado.",
    "EventRevelarObjetivo.button1": "Continuar",
    "TokenObjetivoFinal.text": "Aquí está lo que buscabais.",
    "TokenObjetivoFinal.button1": "{action} Completar la investigación",
    "EventVictoria.text": "<b>Epílogo</b>\\n\\nTexto de la victoria.",
    "EventVictoria.button1": "Fin",
    "EventAvisoTiempo.text": "Escribe aquí el aviso: un sonido, una visión, un mensaje...\\n\\n<i>Queda muy poco "
                             "tiempo.</i>",
    "EventAvisoTiempo.button1": "Continuar",
    "EventDerrotaTiempo.text": "<b>Epílogo</b>\\n\\nHabéis tardado demasiado. Texto de la derrota.",
    "EventDerrotaTiempo.button1": "Fin",
    "EventDerrotaEliminado.text": "<b>Epílogo</b>\\n\\nUno de vosotros ha caído. Los demás no pudieron "
                                  "terminar la investigación a tiempo.",
    "EventDerrotaEliminado.button1": "Fin",
}
TXT_EN = {
    "quest.name": "{titulo}",
    "quest.synopsys": "One-line synopsis (no spoilers).",
    "quest.description": "Trailer-style description.\\n\\n<i>Scenario for {minh}-{maxh} investigators.</i>",
    "quest.authors": "<b>Author</b>\\n{autor}",
    "quest.authors_short": "{autor}",
    "EventPrologo.text": "<i>Arkham, autumn 1926.</i>\\n\\nWrite the prologue here.",
    "EventPrologo.button1": "Continue",
    "EventColocarInicio.text": "Place {c:TileInicio} as shown.",
    "EventColocarInicio.button1": "Continue",
    "EventColocarInvestigadores.text": "Place the investigators in the indicated space.",
    "EventColocarInvestigadores.button1": "Continue",
    "EventColocarExploracion.text": "Place an Explore token at the indicated door.",
    "EventColocarExploracion.button1": "Continue",
    "EventColocarBusqueda.text": "Place a Search token in the indicated space.",
    "EventColocarBusqueda.button1": "Continue",
    "TokenExploracionInicio.text": "A half-open door lets a cold draught through.",
    "TokenExploracionInicio.button1": "{action} Explore",
    "EventExplorarInicio.text": "The next area will be revealed here.\\n\\n"
                                "<i>The investigator who explored may move 1 space through this door "
                                "into the newly revealed area.</i>",
    "EventExplorarInicio.button1": "Continue",
    "TokenBusquedaInicio.text": "A desk covered with scattered papers.",
    "TokenBusquedaInicio.button1": "{action} Search the desk",
    "EventBuscarInicio.text": "Test {observation} (2).",
    "EventBuscarInicio.button1": "Pass",
    "EventBuscarInicio.button2": "Fail",
    "EventBuscarExito.text": "Among the papers you find a note with an address. Gain 1 Clue.",
    "EventBuscarExito.button1": "Continue",
    "EventBuscarFallo.text": "You find nothing useful... for now.",
    "EventBuscarFallo.button1": "Continue",
    "EventRevelarObjetivo.text": "<b>Objective</b>\\n\\nReveal the final task here.",
    "EventRevelarObjetivo.button1": "Continue",
    "TokenObjetivoFinal.text": "Here is what you were looking for.",
    "TokenObjetivoFinal.button1": "{action} Complete the investigation",
    "EventVictoria.text": "<b>Epilogue</b>\\n\\nVictory text.",
    "EventVictoria.button1": "End",
    "EventAvisoTiempo.text": "Write the warning here.\\n\\n<i>Time is running out.</i>",
    "EventAvisoTiempo.button1": "Continue",
    "EventDerrotaTiempo.text": "<b>Epilogue</b>\\n\\nYou took too long. Defeat text.",
    "EventDerrotaTiempo.button1": "End",
    "EventDerrotaEliminado.text": "<b>Epilogue</b>\\n\\nOne of you has fallen.",
    "EventDerrotaEliminado.button1": "End",
}


def opening_spots(side):
    """Sitios para la primera ficha de Exploración: puertas y, si no hay, bordes abiertos (calles, muelles)."""
    geo, cat = M.load_geo()
    t = M.PlacedTile("TileInicio", side, 0, 0, 0, geo, cat)
    spots = [(s, "puerta", (mx, my)) for s, kind, (mx, my), a, b in t.openings() if kind == "door"]
    for s, kind, (mx, my), pa, pb in t.openings():
        if kind != "door":
            spots += [(s, "borde abierto", p) for p in M.open_points(t, s, pa, pb)]
    return t, spots


def rondas_base(lmax):
    """Ronda de los Mitos mortales con 0 investigadores (se resta #heroes). La guía de la comunidad usa 20
    para partidas de 2-3 horas; para partidas más cortas se adelanta (adaptación propia, ver patrones.md §9)."""
    if lmax <= 90:
        return 15
    if lmax <= 120:
        return 17
    if lmax <= 180:
        return 20
    return 23


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("identificador")
    ap.add_argument("--titulo", required=True)
    ap.add_argument("--destino", default=".")
    ap.add_argument("--idioma", default="Spanish")
    ap.add_argument("--ingles", action="store_true", help="crea también Localization.English.txt")
    ap.add_argument("--packs", default="")
    ap.add_argument("--loseta", default="TileSideEntryHall")
    ap.add_argument("--dificultad", default="0.5")
    ap.add_argument("--duracion", default="60-90")
    ap.add_argument("--autor", default="Autor")
    ap.add_argument("--minhero", default="1")
    ap.add_argument("--maxhero", default="5")
    a = ap.parse_args()

    if not re.fullmatch(r"[A-Za-z][A-Za-z0-9_]*", a.identificador):
        sys.exit("El identificador solo puede tener letras, números y _ (y empezar por letra)")
    folder = os.path.join(os.path.abspath(a.destino), a.identificador)
    if os.path.exists(os.path.join(folder, "quest.ini")):
        sys.exit(f"Ya existe un escenario en {folder}")
    os.makedirs(folder, exist_ok=True)

    tile, spots = opening_spots(a.loseta)
    if not spots:
        sys.exit(f"{a.loseta} no tiene puertas ni bordes abiertos conocidos (¿loseta de 1ª edición sin "
                 f"geometría?): elige otra loseta inicial o coloca tú la ficha de Exploración")
    explore_side, explore_kind, (ex, ey) = spots[0]
    # espacio central de la loseta para investigadores y búsqueda
    cx0, cy0 = tile.x0 + 1.75, tile.y1 - 1.75
    sx, sy = (tile.x1 - 1.75, tile.y0 + 1.75)
    # con zonas anotadas (losetas.py): investigadores en el centro libre de la zona más grande y la
    # Búsqueda encima de un objeto que se pueda registrar, lejos de ellos y de la Exploración
    busq = None
    try:
        import losetas as LZ
        cont = LZ.contenido(a.loseta)
    except Exception:  # pragma: no cover
        cont = None
    if cont:
        zona = max(cont["spaces"], key=lambda z: LZ.area(z["outline"]))
        cx0, cy0 = tile.local_to_world(*zona["anchor"])
        cands = []
        for ft in cont["features"]:
            if "search" not in ft.get("affords", []):
                continue
            fx, fy = tile.local_to_world(*ft["at"])
            d = min(((fx - cx0) ** 2 + (fy - cy0) ** 2) ** 0.5, ((fx - ex) ** 2 + (fy - ey) ** 2) ** 0.5)
            if d >= 1.2:
                cands.append((d, fx, fy, ft))
        if cands:
            _, sx, sy, busq = max(cands, key=lambda c: c[0])
    lmin, _, lmax = a.duracion.partition("-")
    try:
        K = rondas_base(int(lmax or lmin or 90))
    except ValueError:
        sys.exit("--duracion debe ser como 60-90 (minutos)")

    sc = Scenario(folder)
    sc.quest = OrderedDict([("format", str(CURRENT_FORMAT)), ("hidden", "False"), ("type", "MoM"),
                            ("defaultlanguage", a.idioma), ("defaultmusicon", "True")])
    if a.packs.strip():
        sc.quest["packs"] = " ".join(a.packs.split())
    sc.quest.update([("minhero", a.minhero), ("maxhero", a.maxhero), ("difficulty", a.dificultad),
                     ("lengthmin", lmin or "60"), ("lengthmax", lmax or "90")])

    S = sc.set
    _, cat = M.load_geo()
    rasgos = cat.get("tiles", {}).get(a.loseta, {}).get("traits", [])
    lugar = " ".join(v for t, v in (("inside", "$mythosIndoors,=,1"), ("outside", "$mythosOutdoors,=,1"))
                     if t in rasgos)
    # ---------------- arranque
    S("EventInicio", display="false", buttons="1", event1="EventPrologo", trigger="EventStart",
      comment=f"Único EventStart. Mitos mortales en la ronda {K}-#heroes (mayores en la mitad, menores en la mitad "
              f"de la mitad), fin en la ronda {K + 2}-#heroes con aviso 2 rondas antes. objetivo=1 es provisional: "
              f"cuando haya 3 o más fuentes de progreso usa objetivo,=,#heroes objetivo,/,2 objetivo,+,1 "
              f"(patrones.md §8)",
      operations=("$mythosFlavor,=,1 " + (lugar + " " if lugar else "") +
                  f"rondaMortal,=,{K} rondaMortal,-,#heroes rondaMayor,=,rondaMortal "
                  "rondaMayor,/,2 rondaMenor,=,rondaMayor rondaMenor,/,2 rondaFin,=,rondaMortal "
                  "rondaFin,+,2 rondaAviso,=,rondaFin rondaAviso,-,2 objetivo,=,1"))
    S("EventPrologo", buttons="1", event1="EventColocarInicio")
    S("EventColocarInicio", xposition=M.f((tile.x0 + tile.x1) / 2), yposition=M.f((tile.y0 + tile.y1) / 2),
      buttons="1", event1="EventColocarInvestigadores", add="TileInicio")
    S("EventColocarInvestigadores", xposition=M.f(cx0), yposition=M.f(cy0), highlight="true", buttons="1",
      event1="EventColocarExploracion", add="TokenInvestigadores")
    S("EventColocarExploracion", xposition=M.f(ex), yposition=M.f(ey), buttons="1",
      event1="EventColocarBusqueda", add="TokenExploracionInicio", remove="TokenInvestigadores")
    S("EventColocarBusqueda", xposition=M.f(sx), yposition=M.f(sy), buttons="1", event1="",
      add="TokenBusquedaInicio")
    # ---------------- exploración y búsqueda
    S("EventExplorarInicio", buttons="1", event1="EventComprobarProgreso",
      remove="TokenExploracionInicio", audio="AudioDoorOpen1",
      comment="Sustituye por la cadena que coloca la siguiente loseta (patrones.md §2)")
    S("EventBuscarInicio", buttons="2", event1="EventBuscarExito", event2="EventBuscarFallo",
      buttoncolor1='"green"', buttoncolor2='"red"')
    S("EventBuscarExito", buttons="1", event1="EventComprobarProgreso", remove="TokenBusquedaInicio",
      operations="progreso,+,1", audio="AudioPapers1")
    S("EventBuscarFallo", buttons="1", event1="")
    # ---------------- progreso y objetivo
    S("EventComprobarProgreso", display="false", buttons="1", event1="EventRevelarObjetivo",
      comment="Llama a este evento tras cada descubrimiento importante")
    S("EventRevelarObjetivo", xposition=M.f(cx0), yposition=M.f(cy0), buttons="1", event1="EventAjustarFin",
      vartests="VarOperation:progreso,>=,objetivo VarTestsLogicalOperator:AND VarOperation:objetivoRevelado,==,0",
      operations="objetivoRevelado,=,1 rondaMayor,=,#round limiteTrasObjetivo,=,#round limiteTrasObjetivo,+,6",
      add="TokenObjetivoFinal", audio="AudioImportant1",
      comment="rondaMayor=#round adelanta los Mitos mayores al final de esta ronda; desde aquí quedan como mucho "
              "6 rondas")
    S("EventAjustarFin", display="false", buttons="0",
      vartests="VarOperation:rondaFin,>,limiteTrasObjetivo",
      operations="rondaFin,=,limiteTrasObjetivo rondaAviso,=,rondaFin rondaAviso,-,2",
      comment="Mínimo de dos valores: el plazo nunca se alarga al revelar el objetivo")
    # ---------------- Mitos y tiempo
    S("EventMitosMenores", display="false", buttons="0", trigger="EndRound",
      vartests="VarOperation:#round,>=,rondaMenor VarTestsLogicalOperator:AND VarOperation:nivelMitos,<,1",
      operations="$mythosMinor,=,1 nivelMitos,=,1")
    S("EventMitosMayores", display="false", buttons="0", trigger="EndRound",
      vartests="VarOperation:#round,>=,rondaMayor VarTestsLogicalOperator:AND VarOperation:nivelMitos,<,2",
      operations="$mythosFlavor,=,0 $mythosMinor,=,0 $mythosMajor,=,1 nivelMitos,=,2")
    S("EventMitosMortales", display="false", buttons="0", trigger="EndRound",
      vartests="VarOperation:#round,>=,rondaMortal VarTestsLogicalOperator:AND VarOperation:nivelMitos,<,3",
      operations="$mythosFlavor,=,0 $mythosMinor,=,0 $mythosMajor,=,0 $mythosDeadly,=,1 nivelMitos,=,3")
    S("EventAvisoTiempo", buttons="1", event1="", trigger="EndRound",
      vartests="VarOperation:#round,>=,rondaAviso VarTestsLogicalOperator:AND VarOperation:avisoDado,==,0",
      operations="avisoDado,=,1", audio="AudioClock",
      comment="En EndRound #round es la ronda que termina")
    S("EventDerrotaTiempo", buttons="1", event1="", trigger="EndRound",
      vartests="VarOperation:#round,>=,rondaFin", operations="$end,=,1", audio="AudioGameOver",
      comment="Definido después del aviso: con la pila (LIFO) se ejecuta antes que él si coinciden")
    # ---------------- finales
    S("EventVictoria", buttons="1", event1="", operations="$end,=,1",
      comment="Llámalo desde el evento que cumple el objetivo")
    S("EventDerrotaEliminado", buttons="1", event1="", trigger="Eliminated", operations="$end,=,1")
    # ---------------- tablero
    S("TileInicio", side=a.loseta, xposition="0", yposition="0")
    S("TokenInvestigadores", type="TokenInvestigators", xposition=M.f(cx0), yposition=M.f(cy0),
      display="false", buttons="0")
    S("TokenExploracionInicio", type="TokenExplore", xposition=M.f(ex), yposition=M.f(ey), buttons="1",
      event1="EventExplorarInicio")
    S("TokenObjetivoFinal", type="TokenInteract", xposition=M.f(cx0), yposition=M.f(cy0), buttons="1",
      event1="EventVictoria")
    S("TokenBusquedaInicio", type="TokenSearch", xposition=M.f(sx), yposition=M.f(sy), buttons="1",
      event1="EventBuscarInicio")
    # ---------------- objetos iniciales (como las oficiales: 4-5)
    S("QItemInicialArma", starting="True", traits="weapon common")
    S("QItemInicialLuz", starting="True", traits="lightsource common")
    S("QItemInicialEquipo", starting="True", traits="equipment common")
    S("QItemInicialHechizo", starting="True", traits="spell")

    fmt = {"{titulo}": a.titulo, "{autor}": a.autor, "{minh}": a.minhero, "{maxh}": a.maxhero}

    def fill(v):
        v = v.replace("\\n", "\n")
        for k2, v2 in fmt.items():
            v = v.replace(k2, v2)
        return v
    txt_es, txt_en = dict(TXT_ES), dict(TXT_EN)
    if busq:
        es = LZ.objeto_es(busq)
        en = busq.get("label") or busq["kind"].replace("_", " ")
        txt_es["TokenBusquedaInicio.text"] = es[:1].upper() + es[1:] + "."
        txt_es["TokenBusquedaInicio.button1"] = "{action} Registrar"
        txt_en["TokenBusquedaInicio.text"] = en[:1].upper() + en[1:] + "."
        txt_en["TokenBusquedaInicio.button1"] = "{action} Search"
    for k, v in txt_es.items():
        sc.set_text("Spanish", k, fill(v))
    if a.ingles or a.idioma == "English":
        for k, v in txt_en.items():
            sc.set_text("English", k, fill(v))
    if a.idioma not in ("Spanish", "English"):
        sc.quest["defaultlanguage"] = "Spanish"
        print("Aviso: textos en español; cambia defaultlanguage cuando traduzcas")
    sc.save()
    print(f"Escenario creado en {folder}")
    print(f"  Loseta inicial {a.loseta}; ficha de Exploración en el {explore_kind} {M.SIDE_ES[explore_side]} "
          f"({M.f(ex)},{M.f(ey)}).")
    if busq:
        print(f"  Búsqueda sobre {busq['id']} «{LZ.objeto_es(busq)}» ({M.f(sx)},{M.f(sy)}); investigadores en "
              f"la zona «{LZ.zona_es(zona)}» ({M.f(cx0)},{M.f(cy0)}). Cambia el texto de la Búsqueda a tu historia.")
    try:
        hmin, hmax = int(a.minhero), int(a.maxhero)
    except ValueError:
        hmin, hmax = 1, 5
    print("  Rondas por número de investigadores (Mitos menores / mayores / mortales · aviso · fin):")
    for h in range(max(1, hmin), max(hmin, hmax) + 1):
        mort = K - h
        print(f"    {h}: {mort / 4:g} / {mort / 2:g} / {mort} · aviso al acabar la {mort} · fin al acabar la {mort + 2}")
    print("  objetivo=1 es provisional: escálalo cuando añadas fuentes de progreso (patrones.md §8).")
    print("  Siguiente paso: python scripts/validar.py", folder)


if __name__ == "__main__":
    main()
