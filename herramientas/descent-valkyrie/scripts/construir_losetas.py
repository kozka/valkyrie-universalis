#!/usr/bin/env python3
"""
construir_losetas.py - Regenera assets/losetas.json: las casillas de cada cara de loseta de Descent
(TileSide) en su rejilla, para dibujar mapas, detectar solapes y comprobar dónde caen fichas,
puertas y monstruos.

Uso:
    python construir_losetas.py --valkyrie <clon de Valkyrie> --esquematico <schematic-tiles-d2e.json>
                                [--packs <carpeta con packs de la comunidad descomprimidos>]
                                [--salida assets/losetas.json]

De dónde sale cada loseta:
  * Las que Valkyrie dibuja con una imagen de la importación oficial ({import}/img/…): de
    schematic-tiles-d2e.json, que Valkyrie Universalis genera en el ordenador que tiene la importación
    (solo tamaños y casillas; nunca las imágenes).
  * Las que dibuja con una imagen propia de Valkyrie (img/030B…) o de un pack de la comunidad (DooM,
    D1ED): se calculan aquí a partir de esa imagen (necesita Pillow). Solo sale qué casillas están
    dibujadas; la imagen no se copia.

Una casilla cuenta si el centro de la casilla es opaco (alfa medio >= 128 en un cuadrado de pps/3).
Coordenadas: casilla (i, j) de la rejilla de la cara, con (0, 0) la casilla de la esquina superior
izquierda (left, top) y j hacia abajo. Ver references/mapa-losetas.md.

Las salidas de cada cara ('salidas') las añade después construir_salidas.py; si el fichero ya existe,
se conservan.
"""
import argparse
import glob
import json
import os
import sys
from collections import OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from valkyrie_io import IniFile  # noqa: E402

PPS_D2E = 105.0
IMPORT = "{import}/"
SPECIAL = ("ContentPack", "ContentPackData", "LanguageData")


def pack_inis(pack_dir):
    """content_pack.ini y los .ini que lista, como ContentData.GetPackData."""
    cp = os.path.join(pack_dir, "content_pack.ini")
    if not os.path.exists(cp):
        return None, []
    ini = IniFile.read(cp)
    pid = ini.sections.get("ContentPack", {}).get("id", "")
    files = [cp]
    for f in ini.sections.get("ContentPackData", {}):
        if f:
            p = os.path.join(pack_dir, f)
            if os.path.exists(p):
                files.append(p)
    return pid, files


def find_packs(root):
    """Carpetas con content_pack.ini (un pack de la comunidad puede ir un nivel por debajo)."""
    out = []
    for cp in glob.glob(os.path.join(root, "**", "content_pack.ini"), recursive=True):
        out.append(os.path.dirname(cp))
    return sorted(out)


def resolve_image(path):
    for ext in ("", ".png", ".jpg", ".jpeg", ".PNG", ".JPG"):
        if os.path.exists(path + ext) and os.path.isfile(path + ext):
            return path + ext
    return None


def squares_from_image(path, left, top, pps):
    from PIL import Image  # noqa
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    alpha = im.getchannel("A")
    reach = max(1, int(pps / 6))
    px = alpha.load()

    def opaque(cx, cy):
        s = n = 0
        for y in range(round(cy) - reach, round(cy) + reach + 1):
            for x in range(round(cx) - reach, round(cx) + reach + 1):
                if 0 <= x < w and 0 <= y < h:
                    s += px[x, y]
                    n += 1
        return n > 0 and s / n >= 128

    import math
    covered = []
    j = math.ceil(-top / pps - 0.5)
    while top + pps * (j + 0.5) < h:
        i = math.ceil(-left / pps - 0.5)
        while left + pps * (i + 0.5) < w:
            if opaque(left + pps * (i + 0.5), top + pps * (j + 0.5)):
                covered.append((i, j))
            i += 1
        j += 1
    if not covered:
        return w, h, 0, 0, []
    x0 = min(i for i, _ in covered)
    y0 = min(j for _, j in covered)
    across = max(i for i, _ in covered) - x0 + 1
    rows = [["."] * across for _ in range(max(j for _, j in covered) - y0 + 1)]
    for i, j in covered:
        rows[j - y0][i - x0] = "#"
    return w, h, x0, y0, ["".join(r) for r in rows]


def grid_of(kv):
    pps = kv.get("pps")
    if pps is None:
        p = PPS_D2E
    elif pps.startswith("*"):
        p = float(pps[1:]) * PPS_D2E
    else:
        p = float(pps)
    return float(kv.get("left", 0) or 0), float(kv.get("top", 0) or 0), p


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--valkyrie", required=True, help="clon del repositorio de Valkyrie")
    ap.add_argument("--esquematico", required=True, help="schematic-tiles-d2e.json de Valkyrie Universalis")
    ap.add_argument("--packs", help="carpeta con packs de la comunidad descomprimidos (DooM, D1ED…)")
    ap.add_argument("--salida", default=os.path.join(SKILL, "assets", "losetas.json"))
    a = ap.parse_args()

    sch = json.load(open(a.esquematico, encoding="utf-8"))
    by_pic = {k.lower(): v for k, v in sch["tiles"].items()}
    content = os.path.join(a.valkyrie, "unity", "Assets", "StreamingAssets", "content", "D2E")
    pack_dirs = [(d, False) for d in find_packs(content)]
    if a.packs:
        pack_dirs += [(d, True) for d in find_packs(a.packs)]

    out = OrderedDict()
    missing = []
    for pdir, community in pack_dirs:
        pid, files = pack_inis(pdir)
        if not pid:
            continue
        for f in files:
            ini = IniFile.read(f)
            for name, kv in ini.sections.items():
                if not name.startswith("TileSide") or name in out:
                    continue
                left, top, pps = grid_of(kv)
                img = kv.get("image", "")
                entry = OrderedDict(pack=pid, nombre=kv.get("name", name[len("TileSide"):]).strip('"'),
                                    rasgos=kv.get("traits", "").split(), reverso=kv.get("reverse", ""))
                if img.startswith(IMPORT):
                    key = img[len(IMPORT):].lower()
                    t = by_pic.get(key)
                    if t is None:
                        missing.append(name)
                        continue
                    entry.update(w=t["w"], h=t["h"], left=t["left"], top=t["top"], pps=t["pps"],
                                 x=t["x"], y=t["y"], filas=t["rows"], fuente="importación (" + sch["import"] + ")")
                else:
                    path = resolve_image(os.path.join(os.path.dirname(f), img))
                    if path is None:
                        missing.append(name)
                        continue
                    w, h, x0, y0, rows = squares_from_image(path, left, top, pps)
                    entry.update(w=w, h=h, left=left, top=top, pps=pps, x=x0, y=y0, filas=rows,
                                 fuente="imagen del pack de la comunidad" if community else "imagen de Valkyrie")
                out[name] = entry
    data = OrderedDict(
        nota="Casillas de cada TileSide en su rejilla (columna i, fila j; (0,0) = casilla de la esquina "
             "superior izquierda). 'filas' empieza en la casilla (x, y). Generado por construir_losetas.py.",
        losetas=out)
    if os.path.exists(a.salida):                # keep the exits construir_salidas.py added
        old = json.load(open(a.salida, encoding="utf-8"))
        for name, entry in out.items():
            if "salidas" in old["losetas"].get(name, {}):
                entry["salidas"] = old["losetas"][name]["salidas"]
        if "nota_salidas" in old:
            data["nota_salidas"] = old["nota_salidas"]
    with open(a.salida, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=0)
        fh.write("\n")
    print(f"{len(out)} caras de loseta escritas en {a.salida}")
    if missing:
        print(f"Sin datos ({len(missing)}): {' '.join(missing)}")


if __name__ == "__main__":
    main()
