#!/usr/bin/env python3
"""
mapa.py - Mapa de un escenario de Descent 2ª ed. en Valkyrie: informe, dibujo y colocación de losetas.

Usos:
  python mapa.py <escenario>                        informe: losetas, uniones, puertas, fichas, lugares
                                                    de monstruos y un mapa de texto con coordenadas
  python mapa.py <escenario> --png mapa.png         dibujo esquemático (necesita Pillow) [--escala 32]
  python mapa.py <escenario> --casillas TileSala    casillas del tablero que ocupa esa loseta y sus salidas
  python mapa.py --info TileSide9A [--en X,Y] [--rotacion R]
                                                    forma de una cara y sus salidas conocidas; con --en,
                                                    las casillas del tablero que ocuparía ahí
  python mapa.py <escenario> --colocar TileSide9A --junto-a TileSala [--lado E] [--todas]
                                                    xposition/yposition/rotation para unir la cara nueva,
                                                    salida con salida, y la puerta de esa unión

<escenario> es la carpeta del quest.ini (o el propio quest.ini); en una campaña, la de cada aventura.

Coordenadas (references/mapa-losetas.md): una casilla mide 1 y la casilla (x, y) tiene el centro en (x, y);
la y crece hacia el norte (arriba). Una loseta en (X, Y) con rotation=R pone la primera casilla de su
rejilla (esquina superior izquierda) en (X, Y) y gira R grados en sentido antihorario alrededor de ella.
Las salidas (tramos de 2 casillas por donde se une con otra) salen de dónde las unen los escenarios
publicados (construir_salidas.py): cuantos más escenarios, más fiable.
"""
import argparse
import json
import os
import re
import sys
from collections import OrderedDict, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from valkyrie_io import Scenario  # noqa: E402
import geometria as G  # noqa: E402

CAT = json.load(open(os.path.join(SKILL, "assets", "catalogo.json"), encoding="utf-8"))
LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"


def is_true(v):
    return str(v).strip().lower() == "true"


# ----------------------------------------------------------------------------------------------
# Lo que hay en el tablero
# ----------------------------------------------------------------------------------------------
def monster_size(m, C):
    if m in CAT["monsters"]:
        return CAT["monsters"][m]["tamano"]
    if m in C:
        traits = C[m].get("traits", "").split()
        for s in ("massive", "huge", "medium", "small"):
            if s in traits:
                return s
        b = C[m].get("base", "")
        if b in CAT["monsters"]:
            return CAT["monsters"][b]["tamano"]
    return "small"


def spawn_monster(kv, C):
    for x in kv.get("monster", "").split():
        m = x if x.startswith(("Monster", "CustomMonster")) else "Monster" + x
        if m in C or m in CAT["monsters"]:
            return m
    return None


class Board:
    def __init__(self, sc):
        self.sc = sc
        C = sc.components
        self.tiles = OrderedDict()       # nombre -> (cara, casillas, (X, Y, R))
        self.unknown = []
        for n in sc.of_type("Tile"):
            kv = C[n]
            side = G.tile_side(kv)
            if side is None:
                self.unknown.append(n)
                continue
            self.tiles[n] = (side, G.tile_squares(kv), G.placement(kv))
        self.letter = {n: LETTERS[i % len(LETTERS)] for i, n in enumerate(self.tiles)}
        self.occ = defaultdict(list)
        for n, (_, sq, _) in self.tiles.items():
            for s in sq:
                self.occ[s].append(n)
        # tamaño de lo que se coloca en cada MPlace (el mayor de los Spawn que lo usan)
        self.mplace_users = defaultdict(list)
        order = ["small", "medium", "huge", "massive"]
        self.mplace_size = {}
        for n in sc.of_type("Spawn"):
            kv = C[n]
            m = spawn_monster(kv, C)
            size = monster_size(m, C) if m else "small"
            for k, v in kv.items():
                if re.fullmatch(r"placement\d+", k):
                    for p in v.split():
                        self.mplace_users[p].append(n)
                        old = self.mplace_size.get(p, "small")
                        self.mplace_size[p] = size if order.index(size) > order.index(old) else old
        self.mplaces = OrderedDict()
        for n in sc.of_type("MPlace"):
            kv = C[n]
            size = kv.get("tokensize", "") or self.mplace_size.get(n, "small")
            x, y = G.num(kv.get("xposition")), G.num(kv.get("yposition"))
            self.mplaces[n] = (G.footprint(x, y, size if size in G.SIZE_WH else "small",
                                           is_true(kv.get("rotate", "false"))), size)
        self.tokens = OrderedDict()
        for n in sc.of_type("Token"):
            kv = C[n]
            size = kv.get("tokensize", "") or "small"
            self.tokens[n] = G.footprint(G.num(kv.get("xposition")), G.num(kv.get("yposition")),
                                         size if size in G.SIZE_WH else "small")
        self.doors = OrderedDict()
        for n in sc.of_type("Door"):
            x, y, r = G.placement(C[n])
            self.doors[n] = G.door_sides(x, y, r)

    def tiles_at(self, sq):
        return self.occ.get(sq, [])

    def joins(self):
        """[(a, b, tramo)] para cada pareja de losetas que se tocan (tramo = [(casilla de a, hacia b)])."""
        names = list(self.tiles)
        out = []
        for i, a in enumerate(names):
            for b in names[i + 1:]:
                A, B = self.tiles[a][1], self.tiles[b][1]
                if set(A) & set(B):
                    continue
                for seg in G.segments(G.contacts(A, B)):
                    out.append((a, b, seg))
        return out

    def known_exit(self, tile, squares, d):
        """Escenarios que avalan que ese tramo (casillas del tablero, dirección hacia fuera) es una salida de la
        loseta, o 0."""
        side, _, (X, Y, R) = self.tiles[tile]
        want = set(squares)
        for (s1, s2), dd, n in G.exits_world(side, X, Y, R):
            if {s1, s2} == want and dd == d:
                return n
        return 0

    def door_at(self, pairs):
        want = {frozenset(p) for p in pairs}
        for n, dp in self.doors.items():
            if {frozenset(p) for p in dp} == want:
                return n
        return None


def door_ini(x, y, r):
    return f"xposition={x:g} yposition={y:g} rotation={r}"


def describe_join(bd, a, b, seg):
    """Texto de una unión: dónde está la salida (2 casillas), si es conocida y si hay puerta."""
    d = seg[0][1]
    sq = [s for s, _ in seg]
    lines = []
    cands = []
    for k in range(len(sq) - 1):
        two = sq[k:k + 2]
        other = [G.step(s, d) for s in two]
        na = bd.known_exit(a, two, d)
        nb = bd.known_exit(b, other, G.OPP[d])
        cands.append((na + nb, na, nb, two, other))
    if len(sq) == 1:
        lines.append(f"  {a} – {b}: se tocan por 1 casilla {sq[0]} (las salidas miden 2: ¿están bien unidas?)")
        return lines
    cands.sort(key=lambda c: -c[0])
    best = [c for c in cands if c[0] > 0] or ([cands[0]] if len(sq) == 2 else [])
    head = f"  {a} – {b}: {len(sq)} casillas de contacto hacia el {G.DIR_ES[d]} de {a} ({sq[0]}…{sq[-1]})"
    lines.append(head)
    if not best:
        lines.append("      no coincide con ninguna salida conocida de las dos: mira la imagen en el editor")
    cap = [t for t in (a, b) if is_cap(bd.tiles[t][0])]
    for tot, na, nb, two, other in best[:2]:
        seg2 = [(s, d) for s in two]
        x, y, r = G.door_between(seg2)
        door = bd.door_at([(two[0], other[0]), (two[1], other[1])])
        fa = f"salida de {a} vista en {na} escenario(s)" if na else f"{a}: tramo no visto como salida"
        fb = f"salida de {b} vista en {nb}" if nb else f"{b}: no visto como salida"
        lines.append(f"      paso {two[0]}-{two[1]}: {fa}; {fb}")
        if cap and not door:
            lines.append(f"      {cap[0]} es un terminal: cierra esa salida (no lleva puerta)")
        else:
            lines.append(f"      puerta (si la lleva): {door_ini(x, y, r)}" + (f"  (ya está: {door})" if door else ""))
    return lines


def is_cap(side):
    return re.fullmatch(r"TileSideCap\w*", side or "") is not None


# ----------------------------------------------------------------------------------------------
# Informe y mapa de texto
# ----------------------------------------------------------------------------------------------
def text_map(bd):
    marks = {}
    for n, (fp, _) in bd.mplaces.items():
        for s in fp:
            marks[s] = "@"
    for n, fp in bd.tokens.items():
        for s in fp:
            marks[s] = "*"
    allsq = set(bd.occ) | set(marks)
    if not allsq:
        return ["(sin losetas conocidas)"]
    xs = [s[0] for s in allsq]
    ys = [s[1] for s in allsq]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    vdoor, hdoor = set(), set()
    for dp in bd.doors.values():
        for a, b in dp:
            if a[1] == b[1]:
                vdoor.add((min(a[0], b[0]), a[1]))           # entre (x, y) y (x+1, y)
            else:
                hdoor.add((a[0], min(a[1], b[1])))           # entre (x, y) y (x, y+1)
    out = []
    head = [" "] * (2 * (x1 - x0 + 1) + 1)
    for x in range(x0, x1 + 1):
        if x % 5 == 0:
            lab = str(x)
            pos = 2 * (x - x0)
            if all(head[pos + i] == " " for i in range(min(len(lab), len(head) - pos))):
                for i, ch in enumerate(lab):
                    if pos + i < len(head):
                        head[pos + i] = ch
    out.append("  y\\x " + "".join(head).rstrip())
    for y in range(y1, y0 - 1, -1):
        row = []
        for x in range(x0, x1 + 1):
            tl = bd.occ.get((x, y), [])
            c = marks.get((x, y)) or ("#" if len(tl) > 1 else (bd.letter[tl[0]] if tl else "."))
            row.append(c)
            row.append("|" if (x, y) in vdoor else " ")
        out.append(f"{y:5} " + "".join(row).rstrip())
        if any((x, y - 1) in hdoor for x in range(x0, x1 + 1)):
            line = "".join(("-" if (x, y - 1) in hdoor else " ") + " " for x in range(x0, x1 + 1))
            out.append("      " + line.rstrip())
    return out


def report(sc, bd):
    C = sc.components
    print(f"Escenario: {sc.folder}")
    print(f"\nLosetas ({len(bd.tiles)}):")
    for n, (side, sq, (X, Y, R)) in bd.tiles.items():
        xs, ys = [s[0] for s in sq], [s[1] for s in sq]
        info = CAT["tiles"].get(side, {})
        print(f"  [{bd.letter[n]}] {n}: {side} ({info.get('pack', '?')}) en ({X:g}, {Y:g}) rot {R}; "
              f"{len(sq)} casillas, x {min(xs)}..{max(xs)}, y {min(ys)}..{max(ys)}")
    for n in bd.unknown:
        print(f"  [?] {n}: cara '{C[n].get('side', '')}' sin forma conocida (no sale en el mapa)")
    over = defaultdict(set)
    for s, tl in bd.occ.items():
        if len(tl) > 1:
            over[tuple(tl)].add(s)
    if over:
        print("\nSolapes (vale si esas losetas no están a la vez):")
        for tl, sqs in over.items():
            print(f"  {' y '.join(tl)}: {len(sqs)} casillas, p. ej. {sorted(sqs)[0]}")
    js = bd.joins()
    print(f"\nUniones ({len(js)}):")
    for a, b, seg in js:
        for line in describe_join(bd, a, b, seg):
            print(line)
    if bd.doors:
        print(f"\nPuertas ({len(bd.doors)}):")
        for n, dp in bd.doors.items():
            x, y, r = G.placement(C[n])
            sides = []
            for a, b in dp:
                sides.append((",".join(bd.tiles_at(a)) or "nada", ",".join(bd.tiles_at(b)) or "nada"))
            t1 = " / ".join(sorted({s[0] for s in sides}))
            t2 = " / ".join(sorted({s[1] for s in sides}))
            color = C[n].get("color", "")
            print(f"  {n}: ({x:g}, {y:g}) rot {r}{' color ' + color if color else ''}: entre {t1} y {t2}"
                  f" (casillas {dp[0][0]}-{dp[1][0]} | {dp[0][1]}-{dp[1][1]})")
    if bd.tokens:
        print(f"\nFichas ({len(bd.tokens)}):")
        for n, fp in bd.tokens.items():
            kv = C[n]
            where = sorted({t for s in fp for t in bd.tiles_at(s)})
            print(f"  {n}: {kv.get('type', '?')} en ({G.num(kv.get('xposition')):g}, "
                  f"{G.num(kv.get('yposition')):g}) -> {', '.join(where) or 'fuera de las losetas'}")
    if bd.mplaces:
        print(f"\nLugares de monstruos ({len(bd.mplaces)}):")
        for n, (fp, size) in bd.mplaces.items():
            kv = C[n]
            where = sorted({t for s in fp for t in bd.tiles_at(s)})
            off = [s for s in fp if not bd.tiles_at(s)]
            users = ", ".join(sorted(set(bd.mplace_users.get(n, [])))) or "ningún Spawn"
            print(f"  {n}{' (jefe)' if is_true(kv.get('master', 'false')) else ''}: "
                  f"({G.num(kv.get('xposition')):g}, {G.num(kv.get('yposition')):g}) {size}"
                  f"{' girado' if is_true(kv.get('rotate', 'false')) else ''} -> {', '.join(where) or '—'}"
                  f"{'  ⚠ fuera: ' + str(off) if off else ''}  [{users}]")
    print("\nMapa (letra = loseta, # solape, * ficha, @ lugar de monstruo, | y - puertas; norte arriba):")
    for line in text_map(bd):
        print(line)
    print("  " + "  ".join(f"{bd.letter[n]}={n}" for n in bd.tiles))


# ----------------------------------------------------------------------------------------------
# Dibujo
# ----------------------------------------------------------------------------------------------
PALETTE = [(204, 224, 255), (255, 228, 196), (210, 245, 210), (245, 215, 245), (255, 250, 200),
           (220, 220, 220), (200, 240, 240), (250, 210, 210), (225, 210, 250), (235, 245, 200)]


def png(sc, bd, out, scale=32):
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        sys.exit("Falta Pillow: pip install pillow (en Windows: py -3 -m pip install pillow)")
    C = sc.components
    allsq = set(bd.occ)
    for fp, _ in bd.mplaces.values():
        allsq |= set(fp)
    for fp in bd.tokens.values():
        allsq |= set(fp)
    if not allsq:
        sys.exit("No hay nada que dibujar (ninguna loseta con forma conocida)")
    xs, ys = [s[0] for s in allsq], [s[1] for s in allsq]
    x0, x1, y0, y1 = min(xs) - 1, max(xs) + 1, min(ys) - 1, max(ys) + 1
    W, H = (x1 - x0 + 1) * scale, (y1 - y0 + 1) * scale + 24
    img = Image.new("RGB", (W, H), (255, 255, 255))
    dr = ImageDraw.Draw(img, "RGBA")
    font = small = None
    for name in ("DejaVuSans.ttf", "arial.ttf", "Arial.ttf", "LiberationSans-Regular.ttf"):
        try:
            font = ImageFont.truetype(name, max(9, scale // 3))
            small = ImageFont.truetype(name, max(8, scale // 4))
            break
        except OSError:
            continue
    if font is None:
        font = small = ImageFont.load_default()

    def box(x, y):
        px = (x - x0) * scale
        py = (y1 - y) * scale + 24
        return px, py, px + scale, py + scale

    for i, (n, (side, sq, _)) in enumerate(bd.tiles.items()):
        col = PALETTE[i % len(PALETTE)]
        for s in sq:
            fill = (255, 150, 150) if len(bd.occ[s]) > 1 else col
            dr.rectangle(box(*s), fill=fill, outline=(170, 170, 170))
    # bordes de cada loseta
    for n, (side, sq, _) in bd.tiles.items():
        sset = set(sq)
        for s in sq:
            l, t, r, b = box(*s)
            if G.step(s, "N") not in sset:
                dr.line((l, t, r, t), fill=(40, 40, 40), width=2)
            if G.step(s, "S") not in sset:
                dr.line((l, b, r, b), fill=(40, 40, 40), width=2)
            if G.step(s, "O") not in sset:
                dr.line((l, t, l, b), fill=(40, 40, 40), width=2)
            if G.step(s, "E") not in sset:
                dr.line((r, t, r, b), fill=(40, 40, 40), width=2)
    # salidas conocidas (marca verde en el borde)
    for n, (side, sq, (X, Y, R)) in bd.tiles.items():
        for (s1, s2), d, cnt in G.exits_world(side, X, Y, R):
            for s in (s1, s2):
                l, t, r, b = box(*s)
                m = 3
                seg = {"N": (l + m, t + 2, r - m, t + 2), "S": (l + m, b - 2, r - m, b - 2),
                       "O": (l + 2, t + m, l + 2, b - m), "E": (r - 2, t + m, r - 2, b - m)}[d]
                dr.line(seg, fill=(0, 150, 0, 200 if cnt > 1 else 90), width=3)
    for n, (fp, size) in bd.mplaces.items():
        master = is_true(C[n].get("master", "false"))
        for s in fp:
            l, t, r, b = box(*s)
            dr.rectangle((l + 3, t + 3, r - 3, b - 3), fill=(200, 0, 0, 70 if master else 40),
                         outline=(160, 0, 0), width=2 if master else 1)
        l, t, _, _ = box(*fp[0])
        dr.text((l + 4, t + 4), n.replace("MPlace", "")[:10], fill=(120, 0, 0), font=small)
    for n, fp in bd.tokens.items():
        l, t, r, b = box(*fp[0])
        if len(fp) > 1:
            r2, b2 = box(*fp[-1])[2:]
            r, b = max(r, r2), max(b, b2)
        dr.ellipse((l + 5, t + 5, r - 5, b - 5), fill=(255, 210, 0, 200), outline=(120, 90, 0), width=2)
        typ = C[n].get("type", "").replace("Token", "")[:3]
        dr.text((l + 7, t + scale // 3), typ, fill=(60, 40, 0), font=small)
    for n, dp in bd.doors.items():
        (a1, b1), (a2, b2) = dp
        pts = []
        for a, b in ((a1, b1), (a2, b2)):
            la, ta, ra, ba = box(*a)
            if a[1] == b[1]:          # separadas en horizontal: línea vertical entre columnas
                xl = ra if b[0] > a[0] else la
                pts.append(((xl, ta), (xl, ba)))
            else:
                yl = ta if b[1] > a[1] else ba
                pts.append(((la, yl), (ra, yl)))
        (p, q), (p2, q2) = pts
        xs2 = [p[0], q[0], p2[0], q2[0]]
        ys2 = [p[1], q[1], p2[1], q2[1]]
        dr.rectangle((min(xs2) - 3, min(ys2) - 3, max(xs2) + 3, max(ys2) + 3), fill=(150, 60, 0))
    for n, (side, sq, _) in bd.tiles.items():
        cx = sum(s[0] for s in sq) / len(sq)
        cy = sum(s[1] for s in sq) / len(sq)
        px = (cx - x0 + 0.5) * scale
        py = (y1 - cy + 0.5) * scale + 24
        label = f"{bd.letter[n]} {n.replace('Tile', '', 1)}"
        dr.text((px - len(label) * scale / 8, py - scale / 6), label, fill=(0, 0, 0), font=font)
    for x in range(x0, x1 + 1):
        if x % 5 == 0:
            dr.text(((x - x0) * scale + 2, 2), str(x), fill=(90, 90, 90), font=small)
    for y in range(y0, y1 + 1):
        if y % 5 == 0:
            dr.text((2, (y1 - y) * scale + 24 + 2), str(y), fill=(90, 90, 90), font=small)
    img.save(out)
    print(f"Mapa guardado en {out} ({W}×{H}): casillas por loseta, salidas conocidas en verde, puertas en marrón, "
          f"fichas en amarillo, lugares de monstruos en rojo (jefe más oscuro), solapes en rosa")


# ----------------------------------------------------------------------------------------------
# Consultas de losetas
# ----------------------------------------------------------------------------------------------
def grid_lines(squares, extra=None):
    """Rejilla de texto de un conjunto de casillas del tablero, con coordenadas."""
    sset = set(squares)
    xs, ys = [s[0] for s in sset], [s[1] for s in sset]
    out = ["  y\\x " + " ".join(f"{x:>3}" for x in range(min(xs), max(xs) + 1))]
    for y in range(max(ys), min(ys) - 1, -1):
        row = []
        for x in range(min(xs), max(xs) + 1):
            row.append(f"{(extra or {}).get((x, y), '#' if (x, y) in sset else '.'):>3}")
        out.append(f"{y:5} " + " ".join(row))
    return out


def info(side_name, en=None, R=0):
    side = side_name if side_name in G.losetas() else ("TileSide" + side_name if "TileSide" + side_name in G.losetas()
                                                       else None)
    if side is None:
        sys.exit(f"No conozco la cara {side_name} (busca con buscar.py losetas …)")
    t = G.losetas()[side]
    print(f"{side}: pack {t['pack']}, pieza {t['nombre']}, rasgos {' '.join(t['rasgos']) or '—'}, "
          f"reverso {t['reverso'] or '—'}")
    print(f"  rejilla {max(len(r) for r in t['filas'])}×{len(t['filas'])}, {sum(r.count('#') for r in t['filas'])} "
          f"casillas (de {t['fuente']})")
    ex = G.exits(side)
    marks = {}
    for k, ((c1, c2), d, n) in enumerate(ex, 1):
        for c in (c1, c2):
            marks[c] = str(k) if k < 10 else "+"
    print("  forma (columna i, fila j hacia abajo; números = salidas):")
    print("        " + " ".join(f"{i:>2}" for i in range(max(len(r) for r in t["filas"]))))
    for j, row in enumerate(t["filas"]):
        print(f"    {j:>3} " + " ".join(f"{marks.get((i, j), c):>2}" for i, c in enumerate(row)))
    if ex:
        print("  salidas conocidas (tramo de 2 casillas, hacia dónde con la loseta sin girar, escenarios que la usan):")
        for k, ((c1, c2), d, n) in enumerate(ex, 1):
            print(f"    {k}: ({c1[0]},{c1[1]})-({c2[0]},{c2[1]}) hacia el {G.DIR_ES[d]}: {n}"
                  f"{'  (poco fiable)' if n < 2 else ''}")
    else:
        print("  salidas: ningún escenario publicado la une; mira su imagen en el editor de Valkyrie")
    if en is not None:
        X, Y = en
        sq = G.place_squares(side, X, Y, R)
        print(f"\n  En ({X:g}, {Y:g}) con rotation={R} ocupa {len(sq)} casillas:")
        extra = {}
        for k, (pair, d, n) in enumerate(G.exits_world(side, X, Y, R), 1):
            for s in pair:
                extra[s] = str(k)
        for line in grid_lines(sq, extra):
            print("  " + line)
        for k, ((s1, s2), d, n) in enumerate(G.exits_world(side, X, Y, R), 1):
            print(f"    salida {k}: {s1}-{s2} hacia el {G.DIR_ES[d]}")


def casillas(sc, bd, name):
    if name not in bd.tiles:
        sys.exit(f"{name} no es una loseta del escenario con forma conocida")
    side, sq, (X, Y, R) = bd.tiles[name]
    print(f"{name}: {side} en ({X:g}, {Y:g}) rot {R}, {len(sq)} casillas")
    extra = {}
    exw = G.exits_world(side, X, Y, R)
    for k, (pair, d, n) in enumerate(exw, 1):
        for s in pair:
            extra[s] = str(k)
    for s in sq:
        if len(bd.occ[s]) > 1:
            extra[s] = "X"
    for fp in bd.tokens.values():
        for s in fp:
            if s in extra or s in set(sq):
                extra[s] = "*"
    for fp, _ in bd.mplaces.values():
        for s in fp:
            if s in set(sq):
                extra[s] = "@"
    for line in grid_lines(sq, extra):
        print(line)
    print("  (# casilla, números = salidas conocidas, * ficha, @ lugar de monstruo, X solape)")
    for k, ((s1, s2), d, n) in enumerate(exw, 1):
        beyond = [G.step(s, d) for s in (s1, s2)]
        used = sorted({t for s in beyond for t in bd.tiles_at(s)})
        print(f"  salida {k}: {s1}-{s2} hacia el {G.DIR_ES[d]} ({n} escenarios): "
              f"{'unida a ' + ', '.join(used) if used else 'libre'}")


def colocar(sc, bd, new_side, anchor, lado=None, todas=False):
    side = new_side if new_side in G.losetas() else "TileSide" + new_side
    if side not in G.losetas():
        sys.exit(f"No conozco la cara {new_side}")
    if anchor not in bd.tiles:
        sys.exit(f"{anchor} no es una loseta del escenario con forma conocida")
    lado = {"W": "O"}.get((lado or "").upper(), (lado or "").upper()) or None
    a_side, a_sq, (AX, AY, AR) = bd.tiles[anchor]
    a_exits = [(p, d, n) for p, d, n in G.exits_world(a_side, AX, AY, AR)]
    a_known = bool(a_exits)
    if not a_exits:
        a_exits = [(p, d, 0) for p, d in G.boundary_pairs(a_sq)]
    n_known = bool(G.exits(side))
    cands = []
    for (s1, s2), d, na in a_exits:
        if lado and d != lado:
            continue
        busy = [t for s in (s1, s2) for t in bd.tiles_at(G.step(s, d)) if t != anchor]
        if busy and not todas:
            continue
        for X, Y, R, (f1, f2), nd, nn in G.join_positions(side, (s1, s2), d):
            sq = G.place_squares(side, X, Y, R)
            over = sorted({t for s in sq for t in bd.tiles_at(s)})
            door = G.door_between([(s1, d), (s2, d)])
            cands.append((len(over), -(na + nn), X, Y, R, over, door, (s1, s2, d, na), (f1, f2, nd, nn)))
    if not cands:
        print("No encuentro ninguna forma de unirla" + (f" por el {G.DIR_ES[lado]}" if lado else "") +
              (" (todas las salidas de esa loseta están ocupadas: --todas para verlas igualmente)" if not todas else ""))
        return
    seen = set()
    uniq = []
    for c in sorted(cands, key=lambda c: (c[0], c[1], c[4], c[2], c[3])):
        if (c[2], c[3], c[4]) in seen:
            continue
        seen.add((c[2], c[3], c[4]))
        uniq.append(c)
    if not a_known:
        print(f"  ({a_side} no tiene salidas conocidas: pruebo todo su borde)")
    if not n_known:
        print(f"  ({side} no tiene salidas conocidas: pruebo todo su borde)")
    print(f"Formas de unir {side} a {anchor} ({a_side}):")
    for k, (nover, score, X, Y, R, over, door, ae, ne) in enumerate(uniq[:12 if not todas else None], 1):
        s1, s2, d, na = ae
        f1, f2, nd, nn = ne
        print(f"  {k}. xposition={X:g} yposition={Y:g} rotation={R}")
        print(f"     une la salida {s1}-{s2} de {anchor} (hacia el {G.DIR_ES[d]}, {na or 'sin'} escenarios) con la "
              f"({f1[0]},{f1[1]})-({f2[0]},{f2[1]}) de {side} ({nn or 'sin'} escenarios)")
        print(f"     puerta en esa unión: {door_ini(*door)}")
        if over:
            print(f"     ⚠ se solapa con {', '.join(over)}")
    best = uniq[0]
    print("\nPara la primera:")
    print(f"[TileNueva]\nside={side}\nxposition={best[2]:g}\nyposition={best[3]:g}\nrotation={best[4]}")
    x, y, r = best[6]
    print(f"\n[DoorNueva]   ; solo si va puerta en esa unión\nxposition={x:g}\nyposition={y:g}\nrotation={r}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("escenario", nargs="?")
    ap.add_argument("--png")
    ap.add_argument("--escala", type=int, default=32, help="píxeles por casilla del PNG")
    ap.add_argument("--casillas", help="nombre de una loseta del escenario")
    ap.add_argument("--info", help="un TileSide (con o sin el prefijo)")
    ap.add_argument("--en", help="con --info: X,Y donde colocarla")
    ap.add_argument("--rotacion", type=int, default=0, help="con --info --en: rotation")
    ap.add_argument("--colocar", help="TileSide de la loseta nueva")
    ap.add_argument("--junto-a", dest="junto_a", help="loseta del escenario a la que se une")
    ap.add_argument("--lado", help="N, S, E u O: por qué lado de esa loseta")
    ap.add_argument("--todas", action="store_true", help="con --colocar: también salidas ya ocupadas y todas las formas")
    a = ap.parse_args()
    if a.info:
        en = None
        if a.en:
            x, y = a.en.split(",")
            en = (float(x), float(y))
        info(a.info, en, a.rotacion)
        return
    if not a.escenario:
        ap.error("falta la carpeta del escenario")
    path = a.escenario
    if os.path.isfile(path):
        path = os.path.dirname(os.path.abspath(path))
    sc = Scenario.load(path)
    if not sc.of_type("Tile"):
        subs = sorted(d for d in os.listdir(path) if os.path.isfile(os.path.join(path, d, "quest.ini")) and
                      Scenario.load(os.path.join(path, d)).of_type("Tile"))
        if subs:
            sys.exit("Esta carpeta no tiene losetas: es la raíz de una campaña. Cada aventura tiene su mapa:\n" +
                     "\n".join(f"  python scripts/mapa.py {os.path.join(path, d)}" for d in subs))
    bd = Board(sc)
    if a.colocar:
        if not a.junto_a:
            ap.error("--colocar necesita --junto-a")
        colocar(sc, bd, a.colocar, a.junto_a, a.lado, a.todas)
    elif a.casillas:
        casillas(sc, bd, a.casillas)
    elif a.png:
        png(sc, bd, a.png, a.escala)
    else:
        report(sc, bd)


if __name__ == "__main__":
    main()
