#!/usr/bin/env python3
"""
nuevo_escenario.py - Crea el esqueleto de una aventura de Descent 2ª ed. para Valkyrie (modo Road to
Legend), lista para abrir en el editor y seguir construyendo; o el de una campaña con varias aventuras.

Aventura (por defecto): prólogo, preparación física paso a paso (piezas, entrada, terminales, héroes,
fichas), dos salas unidas salida con salida y con una puerta, un grupo de monstruos con sus casillas
para 2, 3 y 4 héroes, una ficha de Búsqueda, un jefe único detrás de la puerta, amenaza que sube cada
ronda y dispara peligros, victoria al derrotar al jefe y derrota por moral (NoMorale).

Campaña (--campana N): la raíz (título, preparación de la campaña: fama, oro) y, en subcarpetas
ocultas, N aventuras como la de arriba y un interludio con ciudad, tienda, moral y viaje entre una y
otra. Las recompensas (PE, oro) y las variables de campaña (%, $%) pasan de una aventura a otra.

Uso:
  python nuevo_escenario.py <Identificador> --titulo "La cripta del hereje"
        [--destino CARPETA] [--idioma Spanish] [--ingles] [--packs "LoR"] [--autor "Nombre"]
        [--sala1 TileSide3B] [--sala2 TileSide9B] [--monstruo MonsterGoblinArcher] [--jefe MonsterEttin]
        [--dificultad 0.4] [--duracion 60-90] [--campana N]

<Identificador>: nombre de la carpeta y del paquete (letras, números y _; sin espacios).
--destino: carpeta donde crearlo (por defecto, la actual). Para verlo en el editor de Valkyrie usa
           %APPDATA%\\Valkyrie\\D2E\\Editor (ver references/valkyrie-app.md).
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
import geometria as G  # noqa: E402

CAT = json.load(open(os.path.join(SKILL, "assets", "catalogo.json"), encoding="utf-8"))


# ----------------------------------------------------------------------------------------------
# Mapa: dos salas unidas por una puerta, entrada y terminales
# ----------------------------------------------------------------------------------------------
def good_exits(side, X, Y, R, minimum=2):
    ex = [e for e in G.exits_world(side, X, Y, R) if e[2] >= minimum]
    return sorted(ex, key=lambda e: -e[2])


def occupied(tiles):
    occ = set()
    for _, (side, X, Y, R) in tiles.items():
        occ |= set(G.place_squares(side, X, Y, R))
    return occ


def place_against(tiles, new_side, pair, d, prefer=None):
    """Coloca new_side frente al tramo pair (hacia d) sin pisar nada; elige la salida más usada de la cara."""
    occ = occupied(tiles)
    best = None
    for X, Y, R, fs, nd, nn in G.join_positions(new_side, pair, d):
        sq = set(G.place_squares(new_side, X, Y, R))
        if sq & occ:
            continue
        score = (nn, 1 if prefer and nd == prefer else 0)
        if best is None or score > best[0]:
            best = (score, (X, Y, R))
    return best[1] if best else None


def build_board(sala1, sala2, inside=True):
    entrance = "TileSideEntranceB" if inside else "TileSideEntranceA"
    cap = "TileSideCapB" if inside else "TileSideCapA"
    tiles = OrderedDict()
    tiles["TileSala1"] = (sala1, 0, 0, 0)
    ex1 = good_exits(sala1, 0, 0, 0)
    if len(ex1) < 2:
        sys.exit(f"{sala1} tiene menos de 2 salidas conocidas: elige otra sala (buscar.py --tipo losetas)")
    order = {"S": 0, "O": 1, "E": 2, "N": 3}
    ent_exit = min(ex1, key=lambda e: (order[e[1]], -e[2]))
    pos = place_against(tiles, entrance, ent_exit[0], ent_exit[1], prefer="N")
    if pos is None:
        sys.exit("No cabe la entrada: elige otra sala")
    tiles["TileEntrada"] = (entrance, *pos)
    opposite = G.OPP[ent_exit[1]]
    rest = [e for e in ex1 if e is not ent_exit]
    door_exit = None
    for e in sorted(rest, key=lambda e: (e[1] != opposite, -e[2])):
        pos2 = place_against(tiles, sala2, e[0], e[1])
        if pos2:
            door_exit = e
            tiles["TileSala2"] = (sala2, *pos2)
            break
    if door_exit is None:
        sys.exit(f"No encuentro cómo unir {sala2} a {sala1} sin solapes: prueba otra --sala2")
    door = G.door_between([(s, door_exit[1]) for s in door_exit[0]])
    # terminales en las salidas libres de las dos salas
    caps = []
    for name in ("TileSala1", "TileSala2"):
        side, X, Y, R = tiles[name]
        for (s1, s2), d, n in good_exits(side, X, Y, R):
            occ = occupied(tiles)
            if G.step(s1, d) in occ or G.step(s2, d) in occ:
                continue
            p = place_against(tiles, cap, (s1, s2), d, prefer="N")
            if p:
                cname = f"TileTerminal{len(caps) + 1}"
                tiles[cname] = (cap, *p)
                caps.append(cname)
    return tiles, door, ent_exit, door_exit, caps


def squares_of(tiles, name):
    side, X, Y, R = tiles[name]
    return G.place_squares(side, X, Y, R)


def pick(squares, n, far_from, avoid=(), spaced=True):
    """n casillas de 'squares', las más lejanas a far_from, sin repetir ni (si se puede) tocarse."""
    out = []
    cand = sorted((s for s in squares if s not in avoid),
                  key=lambda s: -(abs(s[0] - far_from[0]) + abs(s[1] - far_from[1])))
    for s in cand:
        if len(out) == n:
            break
        if spaced and any(abs(s[0] - o[0]) <= 1 and abs(s[1] - o[1]) <= 1 for o in out):
            continue
        out.append(s)
    for s in cand:                      # si no caben separadas, juntas
        if len(out) == n:
            break
        if s not in out:
            out.append(s)
    return out


# Figuras de un grupo para 2, 3 y 4 héroes según el tamaño del monstruo (por debajo de los límites de grupo de
# las cartas del juego básico: 5 figuras de los pequeños, 4 de los medianos y 2 de los grandes)
GROUP = {"small": (3, 4, 4), "medium": (2, 3, 3), "huge": (1, 2, 2), "massive": (1, 1, 2)}


def fits(sq, size, area, taken):
    fp = G.footprint(sq[0], sq[1], size)
    return all(s in area and s not in taken for s in fp), fp


def place_group(area, n, size, far_from, taken):
    """Casillas de origen para n figuras de ese tamaño dentro de 'area' sin pisarse."""
    out = []
    used = set(taken)
    for s in sorted(area, key=lambda s: -(abs(s[0] - far_from[0]) + abs(s[1] - far_from[1]))):
        ok, fp = fits(s, size, set(area), used)
        if not ok:
            continue
        out.append(s)
        used |= set(fp)
        if len(out) == n:
            break
    return out, used


def center(squares):
    xs = [s[0] for s in squares]
    ys = [s[1] for s in squares]
    return round(sum(xs) / len(xs)), round(sum(ys) / len(ys))


def fit_group(area, want, size, far_from, taken, monster, tile):
    """Coloca el grupo; si no caben todas las figuras, lo recorta (y avisa). Devuelve (casillas, cuántas para
    2/3/4 héroes)."""
    got, _ = place_group(area, want[-1], size, far_from, taken)
    if not got:
        sys.exit(f"En la pieza {tile_label(tile)} no cabe ninguna figura de {monster} ({size}): elige una sala "
                 f"más grande (buscar.py --tipo losetas) u otro monstruo")
    counts = tuple(min(c, len(got)) for c in want)
    if counts != tuple(want):
        cabe = "solo cabe 1 figura" if len(got) == 1 else f"solo caben {len(got)} figuras"
        print(f"  Aviso: en la pieza {tile_label(tile)} {cabe} de {monster} ({size}); el grupo queda en "
              f"{'/'.join(map(str, counts))} para 2/3/4 héroes")
    return got, counts


def plan_adventure(a):
    """Todo lo que depende del mapa (piezas, puerta, casillas de monstruos), antes de escribir nada."""
    inside = "inside" in CAT["tiles"].get(a.sala1, {}).get("rasgos", ["inside"])
    tiles, door, ent_exit, door_exit, caps = build_board(a.sala1, a.sala2, inside)
    p = dict(tiles=tiles, door=door, door_exit=door_exit)
    p["s1"], p["s2"] = squares_of(tiles, "TileSala1"), squares_of(tiles, "TileSala2")
    p["ent"] = squares_of(tiles, "TileEntrada")
    p["caps1"] = [c for c in caps if any(G.step(s, d) in set(squares_of(tiles, c)) for (pair, d, _) in
                                         good_exits(*tiles["TileSala1"]) for s in pair)]
    p["caps2"] = [c for c in caps if c not in p["caps1"]]
    door_squares = set(door_exit[0])
    exit_squares = {s for (pair, d, _) in good_exits(*tiles["TileSala1"]) for s in pair}
    p["ent_c"] = center(p["ent"])
    p["size1"] = CAT["monsters"].get(a.monstruo, {}).get("tamano", "small")
    p["size2"] = CAT["monsters"].get(a.jefe, {}).get("tamano", "small")
    p["busq"] = pick(p["s1"], 1, p["ent_c"], avoid=exit_squares | door_squares)[0]
    # monstruos de la sala 1: el grupo, lejos de la entrada; el jefe, tras la puerta pero sin taparla
    p["g1"], p["n1"] = fit_group(p["s1"], GROUP.get(p["size1"], GROUP["small"]), p["size1"], p["ent_c"],
                                 {p["busq"]} | door_squares, monster_name(a.monstruo, a.idioma), a.sala1)
    behind_door = {G.step(s, door_exit[1]) for s in door_exit[0]}
    p["g2"], p["n2"] = fit_group(p["s2"], GROUP.get(p["size2"], GROUP["small"]), p["size2"], center(p["s1"]),
                                 behind_door, monster_name(a.jefe, a.idioma), a.sala2)
    return p


def needed_packs(a):
    """Packs de las piezas y monstruos elegidos (además de los de --packs), sin el juego básico."""
    out = a.packs.split()
    for kind, ids in (("tiles", (a.sala1, a.sala2)), ("monsters", (a.monstruo, a.jefe))):
        for i in ids:
            p = CAT[kind].get(i, {}).get("pack", "D2EBase")
            if p != "D2EBase" and p not in out:
                out.append(p)
    return out


# ----------------------------------------------------------------------------------------------
# Textos
# ----------------------------------------------------------------------------------------------
def monster_name(m, lang):
    d = CAT["monsters"].get(m, {})
    if lang == "Spanish" and d.get("es"):
        return d["es"]
    return d.get("en", m.replace("Monster", ""))


def tile_label(side):
    return CAT["tiles"].get(side, {}).get("nombre", side.replace("TileSide", ""))


def adventure_texts(lang, v):
    """v: diccionario con los datos de la aventura (nombres de piezas, monstruos, recompensas…)."""
    if lang == "Spanish":
        t = {
            "EventPrologo.text": "<i>{titulo}</i>\\n\\nEscribe aquí el prólogo: quién os envía, qué ha pasado y "
                                 "qué esperáis encontrar. Dos o tres frases por pantalla.",
            "EventPrologo.button1": "Continuar",
            "EventPreparar.text": "<b>Preparación</b>\\n\\nApartad las piezas {sala1}, {sala2}, una Entrada y "
                                  "{terminales}.",
            "EventPreparar.button1": "Continuar",
            "EventColocarSala1.text": "Colocad la pieza {sala1}, la Entrada y {terminales1} como se indica.",
            "EventColocarSala1.button1": "Continuar",
            "EventColocarHeroes.text": "Colocad a los héroes en la Entrada.",
            "EventColocarHeroes.button1": "Continuar",
            "EventColocarFichas.text": "Colocad una ficha de Búsqueda y una puerta como se indica.",
            "EventColocarFichas.button1": "Continuar",
            "SpawnGuardia.text": "Colocad el grupo de {{type}} como se indica, respetando el límite de monstruos.",
            "SpawnGuardia.button1": "Continuar",
            "EventObjetivo.text": "<b>Objetivo:</b> derrotad {al_jefe}, que se esconde tras la puerta.\\n\\n"
                                  "Cuenta aquí las reglas especiales de la aventura.",
            "EventObjetivo.button1": "Continuar",
            "TokenBusqueda1.text": "Algo brilla entre los escombros.",
            "TokenBusqueda1.button1": "{{action}} Buscar",
            "EventBuscar1.text": "Roba una carta de Búsqueda.",
            "EventBuscar1.button1": "Continuar",
            "DoorSala2.text": "Una puerta de madera reforzada.",
            "DoorSala2.button1": "{{action}} Abrir",
            "EventAbrirPuerta.text": "Retirad la puerta. Colocad la pieza {sala2} y {terminales2} como se "
                                     "indica.",
            "EventAbrirPuerta.button1": "Continuar",
            "SpawnJefe.text": "Colocad el grupo de {{type}} como se indica. El líder es {jefe_nombre}: tiene Vida "
                              "adicional (indicada en su retrato).",
            "SpawnJefe.button1": "Continuar",
            "SpawnJefe.uniquetitle": "{jefe_nombre}",
            "SpawnJefe.uniquetext": "{Jefe_nombre} tiene 2 {{heart}} más, y 1 {{heart}} más por héroe.",
            "EventPeligroMenor.text": "La amenaza crece: al final de esta ronda ocurrirá un peligro menor.",
            "EventPeligroMenor.button1": "Continuar",
            "EventPeligroMayor.text": "La amenaza es grave: al final de esta ronda ocurrirá un peligro mayor.",
            "EventPeligroMayor.button1": "Continuar",
            "EventPeligroMortal.text": "¡Ya no queda tiempo! Al final de esta ronda ocurrirá un peligro mortal.",
            "EventPeligroMortal.button1": "Continuar",
            "EventVictoria.text": "<b>Victoria</b>\\n\\n{Jefe_nombre} cae.{recompensa}",
            "EventVictoria.button1": "{fin}",
            "EventDerrota.text": "<b>Derrota</b>\\n\\nOs habéis quedado sin moral y huis.{recompensa_derrota}",
            "EventDerrota.button1": "{fin}",
        }
    else:
        t = {
            "EventPrologo.text": "<i>{titulo}</i>\\n\\nWrite the prologue here.",
            "EventPrologo.button1": "Continue",
            "EventPreparar.text": "<b>Setup</b>\\n\\nSet aside tiles {sala1}, {sala2}, an entrance and "
                                  "{terminales}.",
            "EventPreparar.button1": "Continue",
            "EventColocarSala1.text": "Place tile {sala1}, the Entrance and {terminales1} as shown.",
            "EventColocarSala1.button1": "Continue",
            "EventColocarHeroes.text": "Place the heroes on the Entrance.",
            "EventColocarHeroes.button1": "Continue",
            "EventColocarFichas.text": "Place a search token and a door as shown.",
            "EventColocarFichas.button1": "Continue",
            "SpawnGuardia.text": "Place the {{type}} group as shown, respecting the group limit.",
            "SpawnGuardia.button1": "Continue",
            "EventObjetivo.text": "<b>Objective:</b> defeat {jefe_nombre}, hiding behind the door.",
            "EventObjetivo.button1": "Continue",
            "TokenBusqueda1.text": "Something glints among the rubble.",
            "TokenBusqueda1.button1": "{{action}} Search",
            "EventBuscar1.text": "Draw a search card.",
            "EventBuscar1.button1": "Continue",
            "DoorSala2.text": "A reinforced wooden door.",
            "DoorSala2.button1": "{{action}} Open",
            "EventAbrirPuerta.text": "Remove the door. Place tile {sala2} and {terminales2} as shown.",
            "EventAbrirPuerta.button1": "Continue",
            "SpawnJefe.text": "Place the {{type}} group as shown. The master is {jefe_nombre}, who has extra Health.",
            "SpawnJefe.button1": "Continue",
            "SpawnJefe.uniquetitle": "{jefe_nombre}",
            "SpawnJefe.uniquetext": "{Jefe_nombre} has 2 extra {{heart}}, plus 1 per hero.",
            "EventPeligroMenor.text": "The threat grows: a minor peril will happen at the end of this round.",
            "EventPeligroMenor.button1": "Continue",
            "EventPeligroMayor.text": "The threat is serious: a major peril will happen at the end of this round.",
            "EventPeligroMayor.button1": "Continue",
            "EventPeligroMortal.text": "Time is up! A deadly peril will happen at the end of this round.",
            "EventPeligroMortal.button1": "Continue",
            "EventVictoria.text": "<b>Victory</b>\\n\\n{Jefe_nombre} falls.{recompensa}",
            "EventVictoria.button1": "{fin}",
            "EventDerrota.text": "<b>Defeat</b>\\n\\nYour morale breaks and you flee.{recompensa_derrota}",
            "EventDerrota.button1": "{fin}",
        }
    return {k: val.format(**v) for k, val in t.items()}


# ----------------------------------------------------------------------------------------------
# Una aventura
# ----------------------------------------------------------------------------------------------
def build_adventure(sc, a, p, lang_list, titulo, campaign=None):
    """Rellena 'sc' con una aventura (p: plan_adventure). campaign: None (aventura suelta) o dict(n=, total=)."""
    tiles, door = p["tiles"], p["door"]
    s1, s2, caps1, caps2, ent_c, busq = p["s1"], p["s2"], p["caps1"], p["caps2"], p["ent_c"], p["busq"]
    g1, g2, n1, n2, size1 = p["g1"], p["g2"], p["n1"], p["n2"], p["size1"]
    S = sc.set
    for name, (side, X, Y, R) in tiles.items():
        kv = {"side": side, "xposition": X, "yposition": Y}
        if R:
            kv["rotation"] = R
        S(name, **kv)
    sx, sy = center(s1)
    s2x, s2y = center(s2)
    S("EventInicio", display="false", buttons="1", event1="EventPrologo", trigger="EventStart",
      operations="amenaza,=,0",
      comment="Único EventStart. La amenaza sube al empezar cada ronda (EventAmenaza) y dispara los peligros")
    S("EventPrologo", buttons="1", event1="EventPreparar")
    S("EventPreparar", buttons="1", event1="EventColocarSala1")
    S("EventColocarSala1", xposition=sx, yposition=sy, buttons="1", event1="EventColocarHeroes",
      add=" ".join(["TileSala1", "TileEntrada"] + caps1))
    S("EventColocarHeroes", xposition=ent_c[0], yposition=ent_c[1], highlight="true", buttons="1",
      event1="EventColocarFichas")
    S("EventColocarFichas", xposition=busq[0], yposition=busq[1], buttons="1", event1="SpawnGuardia",
      add="TokenBusqueda1 DoorSala2")
    places = []
    for i, s in enumerate(g1):
        nm = "MPlaceGuardiaLider" if i == 0 else f"MPlaceGuardia{i}"
        kv = {"xposition": s[0], "yposition": s[1]}
        if i == 0:
            kv["master"] = "true"
        S(nm, **kv)
        places.append(nm)
    S("SpawnGuardia", monster=a.monstruo, xposition=g1[0][0], yposition=g1[0][1], buttons="1",
      event1="EventObjetivo", placement2=" ".join(places[:n1[0]]), placement3=" ".join(places[:n1[1]]),
      placement4=" ".join(places[:n1[2]]),
      comment=f"Figuras para 2/3/4 héroes según el tamaño ({size1}: {'/'.join(map(str, n1))}). Ajústalas al "
              f"límite de grupo de la carta del monstruo")
    S("EventObjetivo", buttons="1", event1="")
    S("TokenBusqueda1", type="TokenSearch", xposition=busq[0], yposition=busq[1], buttons="1",
      event1="EventBuscar1")
    S("EventBuscar1", buttons="1", event1="", remove="TokenBusqueda1")
    S("DoorSala2", xposition=door[0], yposition=door[1], rotation=door[2], buttons="1", event1="EventAbrirPuerta")
    S("EventAbrirPuerta", xposition=s2x, yposition=s2y, buttons="1", event1="SpawnJefe",
      add=" ".join(["TileSala2"] + caps2), remove="DoorSala2")
    places2 = []
    for i, s in enumerate(g2):
        nm = "MPlaceJefe" if i == 0 else f"MPlaceEscolta{i}"
        kv = {"xposition": s[0], "yposition": s[1]}
        if i == 0:
            kv["master"] = "true"
        S(nm, **kv)
        places2.append(nm)
    S("SpawnJefe", monster=a.jefe, unique="true", uniquehealth="2", uniquehealthhero="1",
      xposition=g2[0][0], yposition=g2[0][1], buttons="1", event1="",
      placement2=" ".join(places2[:n2[0]]), placement3=" ".join(places2[:n2[1]]),
      placement4=" ".join(places2[:n2[2]]),
      comment="Jefe único: Vida extra = 2 + 1 por héroe. Su tipo no debe coincidir con el de otro grupo en "
              "juego (los grupos del mismo tipo se juntan y entonces DefeatedUniqueSpawnJefe no salta)")
    # amenaza y peligros
    S("EventAmenaza", display="false", buttons="1", event1="EventPeligroMortal EventPeligroMayor EventPeligroMenor",
      trigger="StartRound", operations="amenaza,+,1",
      comment="Al empezar cada ronda (también la 1). Umbrales: 4 menor, 6 mayor, 8 mortal")
    S("EventPeligroMenor", buttons="1", event1="", operations="peligroMenor,=,1 $perilMinor,=,1",
      vartests="VarOperation:amenaza,>=,4 VarTestsLogicalOperator:AND VarOperation:peligroMenor,==,0")
    S("EventPeligroMayor", buttons="1", event1="", operations="peligroMayor,=,1 $perilMajor,=,1",
      vartests="VarOperation:amenaza,>=,6 VarTestsLogicalOperator:AND VarOperation:peligroMayor,==,0")
    S("EventPeligroMortal", buttons="1", event1="", operations="peligroMortal,=,1 $perilDeadly,=,1",
      vartests="VarOperation:amenaza,>=,8 VarTestsLogicalOperator:AND VarOperation:peligroMortal,==,0")
    # finales
    if campaign is None:
        S("EventVictoria", buttons="1", event1="", trigger="DefeatedUniqueSpawnJefe", operations="$end,=,1")
        S("EventDerrota", buttons="1", event1="", trigger="NoMorale", operations="$end,=,1",
          comment="Sin $end la moral sigue por debajo de 0 y NoMorale vuelve a saltar tras cada evento")
    else:
        n, total = campaign["n"], campaign["total"]
        nxt = "Interludio/quest.ini" if n < total else ""
        win_ops = f"%ganada{n},=,1 $%xp,+,1 oro,=,#heroes oro,*,25 $%gold,+,oro %siguiente,=,{n + 1}"
        lose_ops = f"$%morale,=,0 %ganada{n},=,0 $%xp,+,1 %siguiente,=,{n + 1}"
        if nxt:
            S("EventVictoria", buttons="1", event1=nxt, trigger="DefeatedUniqueSpawnJefe", operations=win_ops,
              comment="Recompensa: 1 PE por héroe ($%xp es común) y 25 de oro por héroe. Las variables % y $% "
                      "pasan a la aventura siguiente; las demás se borran")
            S("EventDerrota", buttons="1", event1=nxt, trigger="NoMorale", operations=lose_ops,
              comment="$%morale,=,0 corta NoMorale (si no, vuelve a saltar tras cada evento). En una campaña se "
                      "sigue aunque se pierda")
        else:
            S("EventVictoria", buttons="1", event1="", trigger="DefeatedUniqueSpawnJefe",
              operations=win_ops + " $end,=,1")
            S("EventDerrota", buttons="1", event1="", trigger="NoMorale", operations=lose_ops + " $end,=,1")
    terminales1 = len(caps1)
    terminales2 = len(caps2)
    for lang in lang_list:
        es = lang == "Spanish"
        jefe = (f"el cabecilla ({monster_name(a.jefe, lang)})" if es else
                f"the chieftain ({monster_name(a.jefe, lang)})")
        rec = rec_d = ""
        fin = "Fin" if es else "End"
        if campaign is not None:
            rec = ("\\n\\nCada héroe recibe 1 PE. Los héroes ganan 25 de oro por héroe." if es else
                   "\\n\\nEach hero gains 1 XP. The heroes gain 25 gold per hero.")
            rec_d = "\\n\\nCada héroe recibe 1 PE." if es else "\\n\\nEach hero gains 1 XP."
            fin = "Continuar" if es else "Continue"
        def caps_txt(k):
            if es:
                return {0: "ningún terminal", 1: "un terminal"}.get(k, f"{k} terminales")
            return {0: "no end caps", 1: "an end cap"}.get(k, f"{k} end caps")
        v = dict(titulo=titulo, sala1=tile_label(a.sala1), sala2=tile_label(a.sala2),
                 terminales=caps_txt(terminales1 + terminales2), terminales1=caps_txt(terminales1),
                 terminales2=caps_txt(terminales2),
                 jefe_nombre=jefe, Jefe_nombre=jefe[:1].upper() + jefe[1:],
                 al_jefe=("al " + jefe[3:]) if jefe.startswith("el ") else ("a " + jefe), recompensa=rec,
                 recompensa_derrota=rec_d, fin=fin)
        for k, val in adventure_texts(lang, v).items():
            sc.set_text(lang, k, val.replace("\\n", "\n"))
    return tiles


def quest_header(sc, a, hidden=False, lmin="60", lmax="90"):
    sc.quest = OrderedDict([("format", str(CURRENT_FORMAT)), ("hidden", "True" if hidden else "False"),
                            ("type", "D2E"), ("defaultlanguage", a.idioma), ("defaultmusicon", "True")])
    if a.packs_all:
        sc.quest["packs"] = " ".join(a.packs_all)
    if not hidden:
        sc.quest.update([("difficulty", a.dificultad), ("lengthmin", lmin), ("lengthmax", lmax)])


def meta_texts(sc, lang_list, titulo, autor, campana):
    for lang in lang_list:
        es = lang == "Spanish"
        tipo = (f"Campaña de {campana} aventuras" if es else f"Campaign of {campana} quests") if campana else \
            ("Aventura" if es else "Quest")
        sc.set_text(lang, "quest.name", titulo)
        sc.set_text(lang, "quest.synopsys", "Sinopsis de una línea (sin destripar nada)." if es else
                    "One-line synopsis (no spoilers).")
        sc.set_text(lang, "quest.description",
                    (f"Descripción tipo tráiler: gancho, tono y qué se espera de los héroes.\n\n<i>{tipo} para 2-4 "
                     f"héroes, con las reglas de Camino a la leyenda.</i>") if es else
                    f"Trailer-style description.\n\n<i>{tipo} for 2-4 heroes, Road to Legend rules.</i>")
        sc.set_text(lang, "quest.authors", f"<b>{'Autor' if es else 'Author'}</b>\n{autor}")
        sc.set_text(lang, "quest.authors_short", autor)


def build_campaign_root(sc, lang_list):
    S = sc.set
    S("EventInicio", display="false", buttons="1", event1="EventIntroCampana", trigger="EventStart",
      operations="$%fame,=,0 $%fameimpressive,=,2 $%famecelebrated,=,4 $%fameheroic,=,6 $%famelegendary,=,8 "
                 "%siguiente,=,1",
      comment="Umbrales de fama (como la mayoría de campañas publicadas): sin ellos el nivel es «legendary» y la "
              "tienda apenas ofrece objetos del Acto I. Las aventuras siguientes sortean sus objetos al cargarse, "
              "ya con estos umbrales. El oro ($%gold) empieza en 0")
    S("EventIntroCampana", buttons="1", event1="Aventura1/quest.ini",
      comment="Las rutas de otra aventura son relativas a la carpeta de este quest.ini (la raíz)")
    for lang in lang_list:
        es = lang == "Spanish"
        sc.set_text(lang, "EventIntroCampana.text",
                    "<b>Introducción</b>\n\nCuenta aquí la historia de la campaña y lo que está en juego." if es else
                    "<b>Introduction</b>\n\nTell the campaign's story here.")
        sc.set_text(lang, "EventIntroCampana.button1", "Empezar" if es else "Begin")


def build_interlude(sc, lang_list, total):
    S = sc.set
    S("EventInicio", display="false", buttons="1", event1="EventCiudad", trigger="EventStart")
    S("EventCiudad", buttons="1", event1="EventTienda",
      operations="$%morale,=,#heroes",
      comment="Visitar una ciudad devuelve la moral (como en Camino a la leyenda)")
    items = []
    for i in range(1, 6):
        nm = f"QItemTienda{i}"
        S(nm, starting="False", traitpool="act1")
        items.append(nm)
    S("EventTienda", display="false", buttons="1", event1="EventSalirCiudad", add=" ".join(items),
      comment="Añadir 2 o más QItem abre la tienda (no se entregan): el jugador compra y vende con $%gold. Sus "
              "botones son los de este evento. La tienda solo se cierra con remove=#shop")
    S("EventSalirCiudad", buttons="1", event1=" ".join(f"EventIrAventura{n}" for n in range(2, total + 1)),
      remove="#shop", operations="$@travelevent,=,1",
      comment="$@travelevent lanza un evento de viaje al azar de Valkyrie al terminar este evento")
    for n in range(2, total + 1):
        S(f"EventIrAventura{n}", display="false", buttons="1", event1=f"Aventura{n}/quest.ini",
          vartests=f"VarOperation:%siguiente,==,{n}")
    for lang in lang_list:
        es = lang == "Spanish"
        sc.set_text(lang, "EventCiudad.text",
                    "<b>La ciudad</b>\n\nDescansáis en la ciudad: la moral vuelve a su valor inicial. En la "
                    "tienda podéis comprar y vender, y gastar PE con el botón Habilidades." if es else
                    "<b>The city</b>\n\nYou rest in town: morale is restored. At the shop you may buy, sell and "
                    "spend XP with the Skills button.")
        sc.set_text(lang, "EventCiudad.button1", "Ir a la tienda" if es else "Go shopping")
        sc.set_text(lang, "EventTienda.button1", "Salir de la ciudad" if es else "Leave town")
        sc.set_text(lang, "EventSalirCiudad.text",
                    "Os ponéis en camino hacia la siguiente aventura." if es else "You set off on your next quest.")
        sc.set_text(lang, "EventSalirCiudad.button1", "Continuar" if es else "Continue")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("identificador")
    ap.add_argument("--titulo", required=True)
    ap.add_argument("--destino", default=".")
    ap.add_argument("--idioma", default="Spanish", choices=["Spanish", "English"])
    ap.add_argument("--ingles", action="store_true", help="crea también Localization.English.txt (en las "
                                                            "campañas va siempre)")
    ap.add_argument("--packs", default="")
    ap.add_argument("--sala1", default="TileSide3B", help="pieza donde empiezan los héroes")
    ap.add_argument("--sala2", default="TileSide9B", help="pieza tras la puerta, con el jefe")
    ap.add_argument("--monstruo", default="MonsterGoblinArcher")
    ap.add_argument("--jefe", default="MonsterEttin")
    ap.add_argument("--dificultad", default="0.4")
    ap.add_argument("--duracion", default="60-90")
    ap.add_argument("--autor", default="Autor")
    ap.add_argument("--campana", type=int, default=0, help="nº de aventuras de la campaña (2 o más)")
    a = ap.parse_args()

    if not re.fullmatch(r"[A-Za-z][A-Za-z0-9_]*", a.identificador):
        sys.exit("El identificador solo puede tener letras, números y _ (y empezar por letra)")
    for side in (a.sala1, a.sala2):
        if side not in G.losetas():
            sys.exit(f"No conozco la pieza {side} (buscar.py --tipo losetas)")
    for m in (a.monstruo, a.jefe):
        if m not in CAT["monsters"]:
            sys.exit(f"No conozco el monstruo {m} (buscar.py --tipo monstruos)")
    if a.monstruo == a.jefe:
        sys.exit("El jefe debe ser de otro tipo que el grupo de la primera sala (los grupos del mismo tipo se juntan)")
    if a.campana == 1:
        sys.exit("Una campaña necesita al menos 2 aventuras")
    folder = os.path.join(os.path.abspath(a.destino), a.identificador)
    if os.path.exists(os.path.join(folder, "quest.ini")):
        sys.exit(f"Ya existe un escenario en {folder}")
    plan = plan_adventure(a)            # antes de crear nada: si las piezas o los monstruos no encajan, sale aquí
    a.packs_all = needed_packs(a)
    extra = [x for x in a.packs_all if x not in a.packs.split()]
    if extra:
        print(f"  packs= incluye {' '.join(extra)} por las piezas o monstruos elegidos")
    lmin, _, lmax = a.duracion.partition("-")
    langs = [a.idioma] + (["English"] if (a.ingles or a.campana) and a.idioma != "English" else [])
    if a.campana and not a.ingles and a.idioma != "English":
        print("  En una campaña cada aventura lleva también textos en inglés: tras un cambio de aventura Valkyrie no "
              "carga el defaultlanguage, solo el idioma del jugador, el inglés y el de reserva")
    os.makedirs(folder, exist_ok=True)

    if not a.campana:
        sc = Scenario(folder)
        quest_header(sc, a, lmin=lmin or "60", lmax=lmax or "90")
        meta_texts(sc, langs, a.titulo, a.autor, 0)
        build_adventure(sc, a, plan, langs, a.titulo)
        sc.save()
        print(f"Aventura creada en {folder}")
    else:
        root = Scenario(folder)
        total_min = int(lmin or 60) * a.campana
        total_max = int(lmax or 90) * a.campana
        quest_header(root, a, lmin=str(total_min), lmax=str(total_max))
        meta_texts(root, langs, a.titulo, a.autor, a.campana)
        build_campaign_root(root, langs)
        root.save()
        for n in range(1, a.campana + 1):
            sub = Scenario(os.path.join(folder, f"Aventura{n}"))
            os.makedirs(sub.folder, exist_ok=True)
            quest_header(sub, a, hidden=True)
            build_adventure(sub, a, plan, langs,
                            f"{a.titulo}: {'aventura' if a.idioma == 'Spanish' else 'quest'} {n}",
                            campaign={"n": n, "total": a.campana})
            sub.save()
        inter = Scenario(os.path.join(folder, "Interludio"))
        os.makedirs(inter.folder, exist_ok=True)
        quest_header(inter, a, hidden=True)
        build_interlude(inter, langs, a.campana)
        inter.save()
        print(f"Campaña creada en {folder}: raíz, Aventura1…Aventura{a.campana} e Interludio (ocultos)")
        print("  Cada aventura es una copia del esqueleto: cambia sus piezas, monstruos y textos.")
    print("  Siguiente paso: python scripts/validar.py", folder)
    print("  Mapa: python scripts/mapa.py <carpeta de la aventura> [--png mapa.png]")


if __name__ == "__main__":
    main()
