#!/usr/bin/env python3
"""
geometria.py - Geometría del tablero de Descent en Valkyrie (rejilla de casillas), compartida por
validar.py, mapa.py y nuevo_escenario.py.

Modelo (Quest.cs Tile/Token/Door, TokenBoard.AddPlacedMonsterImg; verificado con escenarios publicados):
  * Una casilla mide 1 unidad. La casilla de coordenadas enteras (x, y) tiene su centro en (x, y); la y
    crece hacia arriba (norte).
  * Loseta en (X, Y) con rotation=R: su casilla de rejilla (i, j) (i a la derecha, j hacia abajo, (0,0) la
    casilla de la esquina superior izquierda de la cara) cae en (X, Y) + rot_R(i, -j). R gira en sentido
    antihorario alrededor del centro de esa casilla (0, 0).
  * Ficha (Token) 1×1: centrada en su posición. medium (2×1): ocupa (x, y) y (x+1, y); huge (2×2): x..x+1,
    y-1..y; massive (3×2): x..x+2, y-1..y.
  * Puerta (Door) en (x, y): barra de 2 casillas centrada en (x-0.5, y+0.5). rotation=0 vertical, entre las
    columnas x-1 y x, a lo largo de las filas y e y+1; rotation=90 horizontal, entre las filas y e y+1, a lo
    largo de las columnas x-1 y x.
  * Monstruo en un MPlace (x, y): casilla (x, y) y, según su tamaño, hacia la derecha (+x) y hacia abajo (-y),
    igual que las fichas: medium x..x+1; huge x..x+1, y-1..y; massive x..x+2, y-1..y. Con rotate=true el
    dibujo gira -90° alrededor del origen del tablero (la forma pasa a ser vertical).
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)

_LOSETAS = None


def losetas():
    global _LOSETAS
    if _LOSETAS is None:
        path = os.path.join(SKILL, "assets", "losetas.json")
        _LOSETAS = json.load(open(path, encoding="utf-8"))["losetas"] if os.path.exists(path) else {}
    return _LOSETAS


def rot(a, b, deg):
    """Gira (a, b) en sentido antihorario un múltiplo de 90 grados."""
    r = int(round(deg)) % 360
    for _ in range(r // 90):
        a, b = -b, a
    return a, b


def num(v, default=0.0):
    try:
        return float(str(v).strip())
    except (TypeError, ValueError):
        return default


def tile_side(kv):
    side = kv.get("side", "")
    L = losetas()
    if side in L:
        return side
    if "TileSide" + side in L:
        return "TileSide" + side
    return None


def placement(kv):
    """(xposition, yposition, rotation) de un componente."""
    return num(kv.get("xposition")), num(kv.get("yposition")), int(num(kv.get("rotation"), 0))


def local_to_world(side, X, Y, R, i, j):
    """Casilla del tablero donde cae la casilla (i, j) de la rejilla de la cara (contando desde la primera
    casilla dibujada, como 'filas') con la loseta en (X, Y) girada R."""
    t = losetas()[side]
    a, b = rot(t["x"] + i, -(t["y"] + j), R)
    return round(X + a), round(Y + b)


def world_to_local(side, X, Y, R, x, y):
    t = losetas()[side]
    a, b = rot(x - round(X), y - round(Y), -R)
    return a - t["x"], -b - t["y"]


def place_squares(side, X, Y, R):
    """Casillas del tablero de la cara 'side' colocada en (X, Y) con rotation=R."""
    out = []
    for jj, row in enumerate(losetas()[side]["filas"]):
        for ii, c in enumerate(row):
            if c == "#":
                out.append(local_to_world(side, X, Y, R, ii, jj))
    return out


def tile_squares(kv):
    """Casillas (x, y) del tablero que ocupa una loseta, o None si no se conoce su forma."""
    side = tile_side(kv)
    if side is None:
        return None
    return place_squares(side, *placement(kv))


DIRS = {"N": (0, 1), "S": (0, -1), "E": (1, 0), "O": (-1, 0)}
OPP = {"N": "S", "S": "N", "E": "O", "O": "E"}
DIR_ES = {"N": "norte", "S": "sur", "E": "este", "O": "oeste"}


def dir_world(d, R):
    """Dirección local de la cara (sin girar) -> dirección en el tablero con la loseta girada R."""
    v = rot(*DIRS[d], R)
    return next(k for k, w in DIRS.items() if w == v)


def step(sq, d):
    return sq[0] + DIRS[d][0], sq[1] + DIRS[d][1]


def exits(side):
    """Salidas conocidas de una cara: [((casilla, casilla), hacia, escenarios)] en su rejilla."""
    out = []
    for e in losetas().get(side, {}).get("salidas", []):
        (i1, j1), (i2, j2) = e["casillas"]
        out.append((((i1, j1), (i2, j2)), e["hacia"], e["escenarios"]))
    return out


def exits_world(side, X, Y, R):
    """Salidas conocidas de la cara colocada: [((casilla, casilla), dirección en el tablero, escenarios)]."""
    out = []
    for (c1, c2), d, n in exits(side):
        out.append(((local_to_world(side, X, Y, R, *c1), local_to_world(side, X, Y, R, *c2)), dir_world(d, R), n))
    return out


def boundary_pairs(squares):
    """Tramos de 2 casillas del borde de un conjunto de casillas: [((casilla, casilla), dirección hacia fuera)]."""
    sset = set(squares)
    out = []
    for (x, y) in sorted(sset):
        for d in DIRS:
            nxt = (x + 1, y) if d in ("N", "S") else (x, y + 1)
            if step((x, y), d) in sset or nxt not in sset or step(nxt, d) in sset:
                continue
            out.append((((x, y), nxt), d))
    return out


def contacts(a, b):
    """Parejas de casillas vecinas entre dos conjuntos: [(casilla de a, dirección hacia b)]."""
    bset = set(b)
    return [(s, d) for s in a for d in DIRS if step(s, d) in bset]


def segments(pairs):
    """Agrupa parejas (casilla, dirección) en tramos rectos seguidos: [[(casilla, dirección), …], …]."""
    left = set(pairs)
    out = []
    while left:
        s, d = min(left)
        run = [(s, d)]
        left.discard((s, d))
        along = (1, 0) if d in ("N", "S") else (0, 1)
        for sign in (1, -1):
            cur = s
            while True:
                cur = (cur[0] + sign * along[0], cur[1] + sign * along[1])
                if (cur, d) in left:
                    left.discard((cur, d))
                    run.append((cur, d))
                else:
                    break
        out.append(sorted(run))
    return sorted(out)


def tile_grid_size(side):
    t = losetas().get(side)
    if not t:
        return 0, 0
    return max((len(r) for r in t["filas"]), default=0), len(t["filas"])


SIZE_WH = {"small": (1, 1), "medium": (2, 1), "huge": (2, 2), "massive": (3, 2)}


def footprint(x, y, size, rotate=False):
    """Casillas de una figura o ficha de ese tamaño colocada en (x, y). Con rotate (MPlace rotate=true) la
    forma gira 90° en sentido horario alrededor de la casilla (x, y): un medium queda en (x, y) y (x, y-1)."""
    w, h = SIZE_WH.get(size, (1, 1))
    x, y = round(x), round(y)
    if rotate:
        return [(x - j, y - i) for i in range(w) for j in range(h)]
    return [(x + i, y - j) for i in range(w) for j in range(h)]


def door_sides(x, y, rotation):
    """Las dos parejas de casillas que separa una puerta: [(a1, b1), (a2, b2)] (a a un lado, b al otro)."""
    x, y = round(x), round(y)
    if int(rotation) % 180 == 0:
        return [((x - 1, y), (x, y)), ((x - 1, y + 1), (x, y + 1))]
    return [((x - 1, y), (x - 1, y + 1)), ((x, y), (x, y + 1))]


def board(sc):
    """Mapa casilla -> [losetas] de todas las losetas del escenario (aunque no estén a la vez)."""
    occ = {}
    unknown = []
    for n in sc.of_type("Tile"):
        sq = tile_squares(sc.components[n])
        if sq is None:
            unknown.append(n)
            continue
        for s in sq:
            occ.setdefault(s, []).append(n)
    return occ, unknown


def edges(squares):
    """Bordes exteriores de un conjunto de casillas: lista de (casilla, dirección) con dirección N/S/E/O."""
    sset = set(squares)
    out = []
    for (x, y) in sset:
        for d, (dx, dy) in (("N", (0, 1)), ("S", (0, -1)), ("E", (1, 0)), ("O", (-1, 0))):
            if (x + dx, y + dy) not in sset:
                out.append(((x, y), d))
    return out


def door_for(a, b):
    """Posición y rotación de una puerta entre la pareja de casillas a-b y su vecina (para dos casillas de
    ancho): devuelve la puerta que tiene a 'a' a un lado y 'b' al otro, empezando en esa fila/columna."""
    (ax, ay), (bx, by) = a, b
    if ay == by and abs(ax - bx) == 1:          # separadas en horizontal: puerta vertical
        x = max(ax, bx)
        return x, ay, 0
    if ax == bx and abs(ay - by) == 1:          # separadas en vertical: puerta horizontal
        y = min(ay, by)
        return ax + 1, y, 90
    return None


def door_between(seg):
    """Puerta (x, y, rotation) que cierra un tramo de 2 casillas [(casilla, dirección), (casilla, dirección)]."""
    (s1, d), (s2, _) = sorted(seg)
    return door_for(s1, step(s1, d))


def side_exits_or_border(side):
    """Salidas conocidas de una cara (en su rejilla) o, si no hay, todos los tramos de 2 casillas de su borde
    (con 0 escenarios)."""
    ex = exits(side)
    if ex:
        return ex
    loc = {}
    for jj, row in enumerate(losetas()[side]["filas"]):
        for ii, c in enumerate(row):
            if c == "#":
                loc[local_to_world(side, 0, 0, 0, ii, jj)] = (ii, jj)
    return [((loc[p[0]], loc[p[1]]), d, 0) for p, d in boundary_pairs(list(loc))]


def join_positions(new_side, pair, d):
    """Formas de colocar la cara 'new_side' para que una de sus salidas quede frente al tramo 'pair' (dos
    casillas del tablero cuya salida mira hacia 'd'): [(X, Y, R, (c1, c2), hacia_local, escenarios)]."""
    s1, s2 = pair
    t1, t2 = step(s1, d), step(s2, d)
    out = []
    for (c1, c2), nd, nn in side_exits_or_border(new_side):
        for R in (0, 90, 180, 270):
            if dir_world(nd, R) != OPP[d]:
                continue
            for f1, f2 in ((c1, c2), (c2, c1)):
                w1 = local_to_world(new_side, 0, 0, R, *f1)
                w2 = local_to_world(new_side, 0, 0, R, *f2)
                X, Y = t1[0] - w1[0], t1[1] - w1[1]
                if (w2[0] + X, w2[1] + Y) == t2:
                    out.append((X, Y, R, (f1, f2), nd, nn))
    return out
