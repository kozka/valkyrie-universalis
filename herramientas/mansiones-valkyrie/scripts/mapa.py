#!/usr/bin/env python3
"""
mapa.py - Herramientas de mapa para escenarios de Valkyrie (MoM 2ª ed.)

Usos:
  python mapa.py <escenario>                       # informe: losetas, solapes, puertas, fichas
  python mapa.py <escenario> --png mapa.png        # dibujo esquemático (necesita Pillow)
  python mapa.py <escenario> --colocar TileSideKitchen --junto-a TileVestibulo [--lado E]
                                                   # calcula xposition/yposition/rotation de una
                                                   # loseta nueva con una puerta alineada
  python mapa.py --info TileSideKitchen            # geometría de una cara de loseta

  python mapa.py <escenario> --png mapa.png --zonas # además dibuja las zonas y objetos de cada loseta

Sistema de coordenadas de Valkyrie (verificado en Quest.cs):
  * 1 espacio de MoM = 3,5 unidades. x crece hacia la derecha (este), y crece hacia ARRIBA (norte).
  * Una loseta en (x, y) con rotation=0 ocupa [x, x+W] × [y-H, y]: el punto es su esquina superior
    izquierda y la loseta cuelga hacia la derecha y hacia abajo.
  * rotation gira en sentido ANTIHORARIO alrededor de esa esquina (90, 180, 270).
  * Una loseta con customImage se CENTRA en (x, y) (salvo que lleve top/left, que fijan el píxel que
    cae en el punto) y mide ancho_px/(1024/3,5) × alto_px/(1024/3,5) unidades en escritorio.
  * Fichas, monstruos y eventos se centran en su posición.
"""
import argparse
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from valkyrie_io import Scenario, component_type  # noqa: E402

GEO_PATH = os.path.join(SKILL, "assets", "geometria_losetas.json")
CAT_PATH = os.path.join(SKILL, "assets", "catalogo.json")
SIDES = ["N", "E", "S", "W"]
SIDE_ES = {"N": "norte", "E": "este", "S": "sur", "W": "oeste"}
NORMAL = {"N": (0, 1), "E": (1, 0), "S": (0, -1), "W": (-1, 0)}


def load_geo():
    geo = json.load(open(GEO_PATH, encoding="utf-8")) if os.path.exists(GEO_PATH) else {}
    cat = json.load(open(CAT_PATH, encoding="utf-8")) if os.path.exists(CAT_PATH) else {"tiles": {}}
    return geo, cat


def rot(u, v, deg):
    t = math.radians(deg)
    c, s = round(math.cos(t), 10), round(math.sin(t), 10)
    return (u * c - v * s, u * s + v * c)


def tile_dims(side, geo, cat):
    g = geo.get(side)
    if g:
        return g["w"], g["h"], g
    t = cat.get("tiles", {}).get(side)
    if t and t.get("size"):
        return t["size"][0], t["size"][1], None
    return 7.0, 7.0, None


def world_side(local_side, deg):
    nx, ny = NORMAL[local_side]
    wx, wy = rot(nx, ny, deg)
    wx, wy = round(wx), round(wy)
    for s, (a, b) in NORMAL.items():
        if (a, b) == (wx, wy):
            return s
    return local_side


def local_edge_point(local_side, d, W, H):
    if local_side == "N":
        return (d, 0.0)
    if local_side == "S":
        return (d, -H)
    if local_side == "W":
        return (0.0, -d)
    return (W, -d)


MOM_PPS = 1024 / 3.5   # píxeles por unidad de las imágenes propias en escritorio (Android: 512/3,5)


def image_size(path):
    """(ancho, alto) en píxeles leyendo la cabecera de un PNG o JPEG; None si no se puede."""
    try:
        with open(path, "rb") as fh:
            buf = fh.read(1 << 16)
        if buf[:8] == b"\x89PNG\r\n\x1a\n":
            return int.from_bytes(buf[16:20], "big"), int.from_bytes(buf[20:24], "big")
        if buf[:2] == b"\xff\xd8":
            with open(path, "rb") as fh:
                buf = fh.read()
            o = 2
            while o + 9 < len(buf):
                if buf[o] != 0xFF:
                    o += 1
                    continue
                marker = buf[o + 1]
                ln = int.from_bytes(buf[o + 2:o + 4], "big")
                if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
                    return int.from_bytes(buf[o + 7:o + 9], "big"), int.from_bytes(buf[o + 5:o + 7], "big")
                o += 2 + ln
    except (OSError, IndexError):
        pass
    return None


class PlacedTile:
    def __init__(self, name, side, x, y, deg, geo, cat, custom=None, size=None, top=0.0, left=0.0):
        self.name, self.side, self.x, self.y, self.deg = name, side, x, y, deg % 360
        self.custom, self.size_known = custom, True
        if custom:
            # Quest.cs: imagen propia centrada en el punto salvo que top/left digan qué píxel cae en él
            if not size:
                size, self.size_known = (1024, 1024), False
            wpx, hpx = size
            if not top and not left:
                top, left = hpx / 2, wpx / 2
            self.W, self.H, self.g = wpx / MOM_PPS, hpx / MOM_PPS, None
            u0, v1 = -left / MOM_PPS, top / MOM_PPS
            box = [(u0, v1), (u0 + self.W, v1), (u0, v1 - self.H), (u0 + self.W, v1 - self.H)]
        else:
            self.W, self.H, self.g = tile_dims(side, geo, cat)
            box = [(0, 0), (self.W, 0), (0, -self.H), (self.W, -self.H)]
        corners = [rot(u, v, self.deg) for u, v in box]
        xs = [x + c[0] for c in corners]
        ys = [y + c[1] for c in corners]
        self.x0, self.x1, self.y0, self.y1 = min(xs), max(xs), min(ys), max(ys)

    def local_to_world(self, lx, ly):
        """Punto en coordenadas de la cara SIN girar (x al este desde el borde oeste, y al SUR desde el
        borde norte, como en contenido_losetas.json) → coordenadas del tablero."""
        u, v = rot(lx, -ly, self.deg)
        return self.x + u, self.y + v

    def world_to_local(self, px, py):
        u, v = rot(px - self.x, py - self.y, -self.deg)
        return u, -v

    def openings(self):
        """Lista de (lado_mundo, tipo, (x,y) centro, (xa,ya),(xb,yb) extremos)."""
        out = []
        if not self.g:
            return out
        for ls in SIDES:
            for seg in self.g.get(ls, []):
                a = local_edge_point(ls, seg["frm"], self.W, self.H)
                b = local_edge_point(ls, seg["to"], self.W, self.H)
                m = local_edge_point(ls, (seg["frm"] + seg["to"]) / 2, self.W, self.H)
                pa, pb, pm = (rot(*a, self.deg), rot(*b, self.deg), rot(*m, self.deg))
                out.append((world_side(ls, self.deg), seg["kind"],
                            (self.x + pm[0], self.y + pm[1]),
                            (self.x + pa[0], self.y + pa[1]), (self.x + pb[0], self.y + pb[1])))
        return out

    def contains(self, px, py, margin=0.01):
        return self.x0 - margin <= px <= self.x1 + margin and self.y0 - margin <= py <= self.y1 + margin

    def inside(self, px, py, margin=0.15):
        return self.x0 + margin < px < self.x1 - margin and self.y0 + margin < py < self.y1 - margin


def overlap(a, b):
    w = min(a.x1, b.x1) - max(a.x0, b.x0)
    h = min(a.y1, b.y1) - max(a.y0, b.y0)
    return w > 0.05 and h > 0.05, max(0, w) * max(0, h)


def f(v):
    return f"{v:g}" if abs(v - round(v, 3)) < 1e-9 else f"{v:.3f}".rstrip("0").rstrip(".")


def placed_tiles(sc, geo, cat):
    tiles = []
    for name in sc.of_type("Tile"):
        kv = sc.components[name]
        side = kv.get("side", "")
        try:
            x = float(kv.get("xposition", 0) or 0)
            y = float(kv.get("yposition", 0) or 0)
            deg = int(float(kv.get("rotation", 0) or 0))
            top = float(kv.get("top", 0) or 0)
            left = float(kv.get("left", 0) or 0)
        except ValueError:
            continue
        custom = kv.get("customImage", "")
        size = None
        if custom:
            path = os.path.join(sc.folder, custom.replace("\\", "/"))
            size = image_size(path)
        tiles.append(PlacedTile(name, side, x, y, deg, geo, cat, custom=custom or None, size=size, top=top,
                                left=left))
    return tiles


def report(sc, geo, cat):
    tiles = placed_tiles(sc, geo, cat)
    print(f"== Losetas ({len(tiles)})")
    for t in tiles:
        if t.custom:
            flag = "  [imagen propia, centrada en su punto" + ("" if t.size_known else
                                                               "; no pude leer su tamaño: supongo 1024 px") + "]"
        else:
            flag = "" if t.g else "  [sin geometría: solo tamaño aproximado]"
        print(f"  {t.name:28s} {(t.custom or t.side)[:28]:28s} ancla=({f(t.x)},{f(t.y)}) rot={t.deg:3d}  "
              f"ocupa x[{f(t.x0)},{f(t.x1)}] y[{f(t.y0)},{f(t.y1)}]  {f(t.W)}×{f(t.H)}{flag}")
    print("\n== Solapes")
    n = 0
    for i, a in enumerate(tiles):
        for b in tiles[i + 1:]:
            ov, area = overlap(a, b)
            if ov:
                n += 1
                print(f"  ⚠ {a.name} y {b.name} se solapan ({area:.2f} u²). Si nunca están a la vez en el "
                      f"tablero puede ser intencionado.")
    if not n:
        print("  ninguno")
    print("\n== Puertas y bordes abiertos (coordenadas del mundo)")
    tokens = [(nme, sc.components[nme]) for nme in sc.of_type("Token")]
    for t in tiles:
        for side, kind, (mx, my), pa, pb in t.openings():
            nxt = [o.name for o in tiles if o is not t and o.contains(mx + 0.3 * NORMAL[side][0],
                                                                     my + 0.3 * NORMAL[side][1], 0)]
            near = [nme for nme, kv in tokens if _xy(kv) and near_opening(*_xy(kv), kind, (mx, my), pa, pb)]
            dest = ("→ " + ", ".join(nxt)) if nxt else "→ fuera del mapa"
            fichas = f"  fichas: {', '.join(near)}" if near else ""
            if kind == "door":
                print(f"  {t.name:24s} puerta {SIDE_ES[side]:5s} centro=({f(mx)},{f(my)}) {dest}{fichas}")
            else:
                sug = ""
                if not nxt:
                    pts = open_points(t, side, pa, pb)
                    if pts:
                        sug = "  (Exploración en " + " o ".join(f"({f(x)},{f(y)})" for x, y in pts) + ")"
                print(f"  {t.name:24s} abierto {SIDE_ES[side]:5s} de ({f(pa[0])},{f(pa[1])}) a "
                      f"({f(pb[0])},{f(pb[1])}) {dest}{fichas}{sug}")
    print("\n== Fichas y apariciones fuera de las losetas")
    bad = 0
    for nme in sc.of_type("Token", "Spawn"):
        kv = sc.components[nme]
        if "xposition" not in kv:
            continue
        x, y = float(kv.get("xposition", 0) or 0), float(kv.get("yposition", 0) or 0)
        if not any(t.contains(x, y) for t in tiles):
            bad += 1
            print(f"  ⚠ {nme} en ({f(x)},{f(y)}) no está sobre ninguna loseta")
    if not bad:
        print("  ninguna")
    print("\n== Fichas de Exploración que no están en una puerta ni en un borde abierto")
    bad = explore_off_openings(sc, tiles)
    for nme, x, y in bad:
        print(f"  · {nme} en ({f(x)},{f(y)}): no coincide con ninguna abertura conocida")
    if not bad:
        print("  ninguna")


def _xy(kv):
    try:
        return float(kv["xposition"]), float(kv.get("yposition", 0) or 0)
    except (KeyError, ValueError):
        return None


def explore_off_openings(sc, tiles):
    """Fichas TokenExplore que no están sobre ninguna puerta ni borde abierto conocido."""
    ops = [o for t in tiles if t.g for o in t.openings()]
    out = []
    if not ops:
        return out
    for nme in sc.of_type("Token"):
        kv = sc.components[nme]
        if kv.get("type") != "TokenExplore" or not _xy(kv):
            continue
        x, y = _xy(kv)
        if not any(near_opening(x, y, k, m, a, b) for s, k, m, a, b in ops):
            out.append((nme, x, y))
    return out


def seg_dist(px, py, pa, pb):
    """Distancia de (px, py) al segmento pa-pb."""
    ax, ay = pa
    bx, by = pb
    dx, dy = bx - ax, by - ay
    L2 = dx * dx + dy * dy
    t = 0.0 if L2 == 0 else max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / L2))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def near_opening(px, py, kind, mid, pa, pb):
    """¿Está (px, py) sobre esa abertura? Puertas: cerca del centro; bordes abiertos: sobre el tramo."""
    if kind == "door":
        return math.hypot(px - mid[0], py - mid[1]) < 0.9
    return seg_dist(px, py, pa, pb) < 0.6


def open_points(t, side_world, pa, pb):
    """Centros de los lados de espacio a lo largo de un tramo abierto (sitios para una ficha de Exploración)."""
    pts = []
    L = math.hypot(pb[0] - pa[0], pb[1] - pa[1])
    if L <= 0:
        return pts
    ux, uy = (pb[0] - pa[0]) / L, (pb[1] - pa[1]) / L
    # los centros de espacio caen en múltiplos de 3,5 + 1,75 respecto a la esquina de la loseta
    horizontal = side_world in ("N", "S")
    origin = t.x0 if horizontal else t.y0
    lo, hi = (min(pa[0], pb[0]), max(pa[0], pb[0])) if horizontal else (min(pa[1], pb[1]), max(pa[1], pb[1]))
    c = origin + 1.75
    while c <= hi + 1e-6:
        if c >= lo - 1e-6:
            pts.append((c, pa[1]) if horizontal else (pa[0], c))
        c += 3.5
    return pts


def _dist(kv, x, y):
    try:
        return math.hypot(float(kv.get("xposition", 1e9)) - x, float(kv.get("yposition", 1e9)) - y)
    except ValueError:
        return 1e9


def candidates(new_side, anchor_tile, geo, cat, want_side=None, only_free=None):
    """Posiciones (x, y, rot) para new_side con una abertura alineada con una abertura de anchor_tile.

    puerta↔puerta: centros alineados. puerta↔borde abierto: la puerta se coloca en puntos del tramo
    abierto múltiplos de 1,75. abierto↔abierto: se alinean los extremos de los tramos.
    """
    W, H, g = tile_dims(new_side, geo, cat)
    if not g:
        return []
    res = []
    seen = set()

    def add(a_side, kind, x, y, deg, p):
        key = (round(x, 3), round(y, 3), deg)
        if key in seen:
            return
        seen.add(key)
        res.append((a_side, kind, round(x, 4), round(y, 4), deg, p))

    for a_side, a_kind, (mx, my), pa, pb in anchor_tile.openings():
        if want_side and a_side != want_side:
            continue
        facing = {"N": "S", "S": "N", "E": "W", "W": "E"}[a_side]
        horizontal = a_side in ("N", "S")          # el borde de contacto es horizontal
        lo, hi = sorted([pa[0], pb[0]] if horizontal else [pa[1], pb[1]])
        for deg in (0, 90, 180, 270):
            for ls in SIDES:
                if world_side(ls, deg) != facing:
                    continue
                for seg in g.get(ls, []):
                    if a_kind == "door" and seg["kind"] == "door":
                        q = rot(*local_edge_point(ls, (seg["frm"] + seg["to"]) / 2, W, H), deg)
                        add(a_side, "puerta↔puerta", mx - q[0], my - q[1], deg, (mx, my))
                    elif a_kind == "open" and seg["kind"] == "door":
                        q = rot(*local_edge_point(ls, (seg["frm"] + seg["to"]) / 2, W, H), deg)
                        k = math.ceil((lo + 0.4) / 1.75)
                        while k * 1.75 <= hi - 0.4:
                            t = k * 1.75
                            px, py = (t, my) if horizontal else (mx, t)
                            add(a_side, "puerta→borde abierto", px - q[0], py - q[1], deg, (px, py))
                            k += 1
                    elif a_kind == "open" and seg["kind"] == "open":
                        # tramos abiertos enfrentados: anclas en la rejilla de 1,75 con solape ≥ 1,5
                        qa = rot(*local_edge_point(ls, seg["frm"], W, H), deg)
                        qb = rot(*local_edge_point(ls, seg["to"], W, H), deg)
                        if horizontal:
                            s0, s1 = sorted([qa[0], qb[0]])
                            y_anchor = my - qa[1]
                            k = math.ceil((lo - s1) / 1.75)
                            while k * 1.75 <= hi - s0:
                                x = k * 1.75
                                if min(hi, x + s1) - max(lo, x + s0) >= 1.5:
                                    add(a_side, "abierto↔abierto", x, y_anchor, deg,
                                        ((max(lo, x + s0) + min(hi, x + s1)) / 2, my))
                                k += 1
                        else:
                            s0, s1 = sorted([qa[1], qb[1]])
                            x_anchor = mx - qa[0]
                            k = math.ceil((lo - s1) / 1.75)
                            while k * 1.75 <= hi - s0:
                                y = k * 1.75
                                if min(hi, y + s1) - max(lo, y + s0) >= 1.5:
                                    add(a_side, "abierto↔abierto", x_anchor, y, deg,
                                        (mx, (max(lo, y + s0) + min(hi, y + s1)) / 2))
                                k += 1
                    elif a_kind == "door" and seg["kind"] == "open":
                        # la puerta existente debe quedar dentro del tramo abierto de la loseta nueva
                        qa = rot(*local_edge_point(ls, seg["frm"], W, H), deg)
                        qb = rot(*local_edge_point(ls, seg["to"], W, H), deg)
                        if horizontal:
                            s0, s1 = sorted([qa[0], qb[0]])
                            y_anchor = my - qa[1]
                            k = math.ceil((mx - s1 + 0.6) / 1.75)
                            while k * 1.75 <= mx - s0 - 0.6:
                                add(a_side, "borde abierto→puerta", k * 1.75, y_anchor, deg, (mx, my))
                                k += 1
                        else:
                            s0, s1 = sorted([qa[1], qb[1]])
                            x_anchor = mx - qa[0]
                            k = math.ceil((my - s1 + 0.6) / 1.75)
                            while k * 1.75 <= my - s0 - 0.6:
                                add(a_side, "borde abierto→puerta", x_anchor, k * 1.75, deg, (mx, my))
                                k += 1
    return res


def colocar(sc, args, geo, cat):
    tiles = placed_tiles(sc, geo, cat)
    by_name = {t.name: t for t in tiles}
    anchor = by_name.get(args.junto_a)
    if not anchor:
        sys.exit(f"No encuentro la loseta {args.junto_a} en el escenario")
    want = {"N": "N", "E": "E", "S": "S", "O": "W", "W": "W"}.get((args.lado or "").upper()) if args.lado else None
    cands = candidates(args.colocar, anchor, geo, cat, want)
    if not cands:
        sys.exit("Sin candidatos (¿loseta sin geometría o sin aberturas compatibles en ese lado?)")
    print(f"Candidatos para {args.colocar} junto a {anchor.name}:")
    rows = []
    for a_side, kind, x, y, deg, (mx, my) in cands:
        new = PlacedTile("nueva", args.colocar, x, y, deg, geo, cat)
        clashes = [t.name for t in tiles if overlap(new, t)[0]]
        rows.append((len(clashes) > 0, a_side, kind, x, y, deg, mx, my, clashes))
    def on_grid(v):
        return abs(v / 3.5 - round(v / 3.5)) < 1e-6
    rows.sort(key=lambda r: (r[0], not (on_grid(r[3]) and on_grid(r[4])), SIDES.index(r[1]), r[2]))
    for bad, a_side, kind, x, y, deg, mx, my, clashes in rows[:40]:
        status = "OK" if not bad else "solapa con " + ", ".join(clashes)
        if not (on_grid(x) and on_grid(y)):
            status += ", media rejilla"
        print(f"  lado {SIDE_ES[a_side]:5s} {kind:22s} contacto ({f(mx)},{f(my)}) → "
              f"xposition={f(x)} yposition={f(y)} rotation={deg}   [{status}]")
    if len(rows) > 40:
        print(f"  … {len(rows) - 40} más (filtra con --lado)")
    print("\nElige uno sin solapes. La ficha de Exploración va en el punto de contacto (la puerta).\n"
          "'media rejilla': Valkyrie lo acepta en el .ini, pero el editor solo arrastra losetas a múltiplos "
          "de 3,5; prefiere los demás.")


def info(side, geo, cat):
    W, H, g = tile_dims(side, geo, cat)
    t = cat.get("tiles", {}).get(side, {})
    print(f"{side}: {f(W)}×{f(H)} unidades ({f(W / 3.5)}×{f(H / 3.5)} espacios) pack={t.get('pack', '?')} "
          f"rasgos={' '.join(t.get('traits', []))} reverso={t.get('reverse', '')}")
    if g:
        print(f"  {g.get('desc', '')}")
        for s in SIDES:
            segs = g.get(s, [])
            txt = ", ".join(f"{'puerta' if x['kind'] == 'door' else 'abierto'} {f(x['frm'])}-{f(x['to'])}"
                            for x in segs) or "pared"
            print(f"  {SIDE_ES[s]:5s}: {txt}")
        print("  (N/S medidos desde el extremo oeste; E/O desde el extremo norte; a rotación 0)")
    else:
        print("  Sin datos de aberturas (loseta de 1ª edición o importada sin geometría).")


def png(sc, out, geo, cat, scale=40, zonas=False):
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        sys.exit("Necesitas Pillow: pip install pillow")
    if zonas:
        scale = max(scale, 64)
    tiles = placed_tiles(sc, geo, cat)
    pts = [(t.x0, t.y0) for t in tiles] + [(t.x1, t.y1) for t in tiles]
    toks = []
    for nme in sc.of_type("Token", "Spawn", "Event"):
        kv = sc.components[nme]
        if "xposition" in kv:
            try:
                toks.append((nme, float(kv["xposition"]), float(kv.get("yposition", 0)), kv.get("type", "")))
            except ValueError:
                pass
    pts += [(x, y) for _, x, y, _ in toks]
    if not pts:
        sys.exit("No hay nada que dibujar")
    minx, maxx = min(p[0] for p in pts) - 2, max(p[0] for p in pts) + 2
    miny, maxy = min(p[1] for p in pts) - 2, max(p[1] for p in pts) + 2
    Wpx, Hpx = int((maxx - minx) * scale), int((maxy - miny) * scale)
    img = Image.new("RGB", (max(Wpx, 200), max(Hpx, 200)), (24, 26, 30))
    d = ImageDraw.Draw(img)

    def P(x, y):
        return ((x - minx) * scale, (maxy - y) * scale)
    # rejilla de espacios
    gx = math.floor(minx / 3.5) * 3.5
    while gx <= maxx:
        d.line([P(gx, miny), P(gx, maxy)], fill=(40, 42, 48))
        gx += 3.5
    gy = math.floor(miny / 3.5) * 3.5
    while gy <= maxy:
        d.line([P(minx, gy), P(maxx, gy)], fill=(40, 42, 48))
        gy += 3.5
    palette = [(120, 90, 60), (70, 100, 120), (90, 110, 70), (120, 70, 90), (100, 100, 60), (70, 80, 120)]
    for i, t in enumerate(tiles):
        col = palette[i % len(palette)]
        d.rectangle([P(t.x0, t.y1), P(t.x1, t.y0)], fill=col, outline=(230, 230, 230), width=2)
    if zonas:
        import losetas
        losetas.dibujar_zonas(img, tiles, P, scale)
    for i, t in enumerate(tiles):
        etiqueta = os.path.basename((t.custom or "").replace("\\", "/")) if t.custom else t.side.replace("TileSide", "")
        d.text(P(t.x0 + 0.2, t.y1 - 0.2), f"{t.name}\n{etiqueta} r{t.deg}", fill=(255, 255, 255))
        for side, kind, (mx, my), pa, pb in t.openings():
            colr = (255, 220, 0) if kind == "door" else (120, 220, 120)
            d.line([P(*pa), P(*pb)], fill=colr, width=5 if kind == "door" else 3)
    colors = {"TokenExplore": (255, 140, 0), "TokenSearch": (0, 200, 255), "TokenInteract": (220, 80, 220),
              "TokenSight": (180, 180, 255), "TokenInvestigators": (255, 255, 255)}
    for nme, x, y, typ in toks:
        ct = component_type(nme)
        if ct == "Event":
            c = (255, 255, 0)
            x0, y0 = P(x, y)
            d.line([(x0 - 4, y0), (x0 + 4, y0)], fill=c)
            d.line([(x0, y0 - 4), (x0, y0 + 4)], fill=c)
            continue
        c = (255, 60, 60) if ct == "Spawn" else colors.get(typ, (200, 200, 200))
        x0, y0 = P(x, y)
        r = 0.45 * scale
        d.ellipse([x0 - r, y0 - r, x0 + r, y0 + r], outline=c, width=3)
        d.text((x0 + r, y0 - r), nme.replace("Token", "T:").replace("Spawn", "S:")[:22], fill=c)
    img.save(out)
    print(f"Mapa guardado en {out}  (cuadrícula = 1 espacio = 3,5 u; amarillo = puertas, verde = bordes "
          f"abiertos, naranja = Exploración, azul = Búsqueda, rojo = monstruos, cruz = eventos" +
          ("; contornos blancos = zonas con su nombre en azul claro, puntos = objetos dibujados (dorados si se "
           "pueden registrar)" if zonas else "") + ")")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("escenario", nargs="?")
    ap.add_argument("--png")
    ap.add_argument("--zonas", action="store_true", help="con --png: dibuja zonas y objetos de cada loseta")
    ap.add_argument("--colocar", help="TileSide de la loseta nueva")
    ap.add_argument("--junto-a", dest="junto_a", help="Nombre del componente Tile existente")
    ap.add_argument("--lado", help="N, E, S u O (lado de la loseta existente)")
    ap.add_argument("--info", help="Muestra la geometría de un TileSide")
    a = ap.parse_args()
    geo, cat = load_geo()
    if a.info:
        info(a.info, geo, cat)
        return
    if not a.escenario:
        ap.error("falta la carpeta del escenario")
    sc = Scenario.load(a.escenario)
    if a.colocar:
        colocar(sc, a, geo, cat)
    elif a.png:
        png(sc, a.png, geo, cat, zonas=a.zonas)
    else:
        report(sc, geo, cat)


if __name__ == "__main__":
    main()
