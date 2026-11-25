#!/usr/bin/env python3
"""
construir_salidas.py - Añade a assets/losetas.json las salidas de cada cara de loseta (los tramos de
2 casillas por donde se une con otra), sacadas de dónde unen las losetas los escenarios publicados.

Uso:
    python construir_salidas.py <carpeta con escenarios> [--losetas assets/losetas.json]

<carpeta> puede tener paquetes .valkyrie o escenarios ya descomprimidos (cualquier carpeta con un
quest.ini, también las aventuras de una campaña). Valkyrie Universalis los descarga en
referencias/descargas/D2E/escenarios.

Cómo se calcula: en cada quest.ini se buscan las parejas de losetas que se tocan por exactamente
2 casillas seguidas (así se unen en Descent: salida con salida, cada una de 2 casillas de ancho).
Cada tramo se pasa a la rejilla de su cara (columna i, fila j, hacia N/S/E/O sin girar) y se cuenta en
cuántos paquetes distintos aparece. Las imágenes de las losetas no hacen falta: solo posiciones.

Cuantos más paquetes, más fiable: un tramo visto en un solo paquete puede ser un descuido de su autor.
Las caras que ningún escenario une se quedan sin salidas conocidas (mapa.py lo dice).
"""
import argparse
import glob
import json
import os
import sys
import tempfile
import zipfile
from collections import OrderedDict, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from valkyrie_io import Scenario  # noqa: E402
import geometria as G  # noqa: E402

DIRS = OrderedDict([("N", (0, 1)), ("S", (0, -1)), ("E", (1, 0)), ("O", (-1, 0))])
INV = {v: k for k, v in DIRS.items()}
OPP = {"N": "S", "S": "N", "E": "O", "O": "E"}


def to_local(kv, side, wx, wy, d):
    """Casilla del tablero (wx, wy) con salida hacia d -> (i, j, hacia) en la rejilla de la cara."""
    t = G.losetas()[side]
    X, Y = G.num(kv.get("xposition")), G.num(kv.get("yposition"))
    R = int(G.num(kv.get("rotation"), 0))
    a, b = G.rot(wx - round(X), wy - round(Y), -R)
    dx, dy = G.rot(*DIRS[d], -R)
    return a - t["x"], -b - t["y"], INV[(dx, dy)]


def joins(sc):
    """Uniones de 2 casillas entre losetas: [(componente, cara, kv, (casilla, casilla), hacia), …] por pareja."""
    tiles = {}
    for n in sc.of_type("Tile"):
        kv = sc.components[n]
        sq = G.tile_squares(kv)
        if sq:
            tiles[n] = (kv, set(sq), G.tile_side(kv))
    names = list(tiles)
    out = []
    for i, a in enumerate(names):
        for b in names[i + 1:]:
            A, B = tiles[a][1], tiles[b][1]
            if A & B:
                continue
            pairs = [((x, y), d) for (x, y) in A for d, (dx, dy) in DIRS.items() if (x + dx, y + dy) in B]
            if len(pairs) != 2:
                continue
            (p1, d1), (p2, d2) = pairs
            if d1 != d2 or abs(p1[0] - p2[0]) + abs(p1[1] - p2[1]) != 1:
                continue
            dx, dy = DIRS[d1]
            q1, q2 = (p1[0] + dx, p1[1] + dy), (p2[0] + dx, p2[1] + dy)
            out.append(((a, tiles[a], (p1, p2), d1), (b, tiles[b], (q1, q2), OPP[d1])))
    return out


def quest_dirs(root):
    for qi in glob.glob(os.path.join(root, "**", "quest.ini"), recursive=True):
        yield os.path.dirname(qi)


def packages(folder):
    """(nombre, carpeta) de cada paquete: los .valkyrie se descomprimen en una carpeta temporal."""
    tmp = tempfile.mkdtemp(prefix="salidas_")
    for entry in sorted(os.listdir(folder)):
        full = os.path.join(folder, entry)
        if entry.lower().endswith(".valkyrie") and os.path.isfile(full):
            dest = os.path.join(tmp, entry[:-len(".valkyrie")])
            try:
                with zipfile.ZipFile(full) as z:
                    z.extractall(dest)
            except zipfile.BadZipFile:
                print(f"  no es un zip: {entry}")
                continue
            yield entry[:-len(".valkyrie")], dest
        elif os.path.isdir(full) and glob.glob(os.path.join(full, "**", "quest.ini"), recursive=True):
            yield entry, full


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("carpeta", help="carpeta con paquetes .valkyrie o escenarios descomprimidos")
    ap.add_argument("--losetas", default=os.path.join(SKILL, "assets", "losetas.json"))
    a = ap.parse_args()

    seen = defaultdict(lambda: defaultdict(set))
    n_pkg = 0
    for pkg, folder in packages(a.carpeta):
        n_pkg += 1
        for qd in quest_dirs(folder):
            try:
                sc = Scenario.load(qd)
            except Exception as e:  # noqa: BLE001 - a broken quest must not stop the survey
                print(f"  no se pudo leer {pkg}/{os.path.relpath(qd, folder)}: {e}")
                continue
            for half in (h for j in joins(sc) for h in j):
                _, (kv, _, side), squares, d = half
                seg = sorted(to_local(kv, side, s[0], s[1], d) for s in squares)
                seen[side][tuple(seg)].add(pkg)

    data = json.load(open(a.losetas, encoding="utf-8"), object_pairs_hook=OrderedDict)
    total = 0
    for side, t in data["losetas"].items():
        segs = []
        for seg, pkgs in sorted(seen.get(side, {}).items(), key=lambda kv: (-len(kv[1]), kv[0])):
            segs.append(OrderedDict(casillas=[[s[0], s[1]] for s in seg], hacia=seg[0][2], escenarios=len(pkgs)))
        t["salidas"] = segs
        total += bool(segs)
    data["nota_salidas"] = ("'salidas': tramos de 2 casillas por donde los escenarios publicados unen esa cara con "
                            "otra (i, j en la rejilla de la cara; 'hacia' sin girar; 'escenarios' = paquetes "
                            "distintos que la unen así). Generado por construir_salidas.py con %d paquetes." % n_pkg)
    with open(a.losetas, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=0)
        fh.write("\n")
    print(f"{n_pkg} paquetes leídos; {total} caras con salidas conocidas de {len(data['losetas'])}")


if __name__ == "__main__":
    main()
