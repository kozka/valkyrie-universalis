#!/usr/bin/env python3
"""
losetas.py - Qué hay dibujado en cada loseta de MoM 2ª ed. (zonas de movimiento y objetos) y dónde cae
cada cosa en el tablero de un escenario.

Usos:
  python losetas.py ver TileSideKitchen [--en]           # descripción, zonas, puertas y objetos de una cara
  python losetas.py buscar altar velas [--pack MoMBase]  # caras que tengan todo eso (español o inglés)
  python losetas.py donde <escenario> [--eventos]        # en qué loseta, zona y junto a qué objeto está
                                                         # cada ficha, aparición y MPlace
  python losetas.py colocar <escenario> Tile_cocina      # coordenadas libres en la zona más grande
  python losetas.py colocar <escenario> Tile_cocina:s2   # ... en la zona s2
  python losetas.py colocar <escenario> Tile_cocina:f4   # ... encima del objeto f4
  python losetas.py colocar <escenario> Tile_cocina:chimenea [--n 3]   # objeto o zona por su nombre
  python losetas.py punto <escenario> 10.5 -3.5          # qué hay en ese punto del tablero

Los datos (assets/contenido_losetas.json) vienen de ValkyrieMCP (MIT), anotados sobre el arte de cada
loseta, con traducción al español. Describen lo DIBUJADO: sirven para colocar fichas donde tiene sentido
y para escribir eventos que encajen con lo que ven los jugadores, no para limitar la historia (un armario
puede esconder un pasadizo aunque los datos digan solo «armario»).

Coordenadas: las de contenido_losetas.json son locales a la cara sin girar (x al este desde el borde
oeste, y al SUR desde el borde norte; el origen es el punto xposition/yposition de la loseta). Este
script las pasa al tablero teniendo en cuenta la posición y la rotación (sentido antihorario) de cada
loseta, igual que Valkyrie (Quest.cs).
"""
import argparse
import json
import math
import os
import re
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)
sys.path.insert(0, HERE)
CONTENT_PATH = os.path.join(SKILL, "assets", "contenido_losetas.json")
OCUPADO = 0.6          # dos fichas a menos de esto se tapan
LADO_ES = {"N": "norte", "E": "este", "S": "sur", "W": "oeste"}

_DATA = None


def data():
    global _DATA
    if _DATA is None:
        _DATA = json.load(open(CONTENT_PATH, encoding="utf-8")) if os.path.exists(CONTENT_PATH) else \
            {"losetas": {}, "vocabulario": {}}
    return _DATA


def contenido(side):
    """Contenido anotado de una cara de loseta (o None)."""
    t = data()["losetas"].get(side) or data()["losetas"].get("TileSide" + side)
    return t if t and t.get("spaces") else None


def norm(s):
    s = unicodedata.normalize("NFKD", str(s).lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", s.replace("_", " ")).strip()


# ---------------------------------------------------------------- vocabulario
def tipo_es(kind):
    v = data()["vocabulario"].get("tipos", {}).get(kind)
    return v["es"][0] if v and v.get("es") else kind.replace("_", " ")


def sala_es(r):
    return data()["vocabulario"].get("salas", {}).get(r, r)


def etiqueta_es(t):
    return data()["vocabulario"].get("etiquetas", {}).get(t, t)


def uso_es(a):
    return data()["vocabulario"].get("usos", {}).get(a, a)


def zona_es(s):
    return s.get("label_es") or s["label"]


def objeto_es(f):
    if f.get("label_es"):
        return f["label_es"]
    return f.get("label") or tipo_es(f["kind"])


def tipos_de(termino):
    """Tipos de objeto a los que se refiere una palabra (español o inglés, con o sin tildes)."""
    q = norm(termino)
    out = []
    for k, v in data()["vocabulario"].get("tipos", {}).items():
        if k == "other":
            continue
        names = [norm(x) for x in v.get("es", []) + v.get("en", [])] + [norm(k)]
        if q in names:
            out.append(k)
    return out


# ---------------------------------------------------------------- geometría
def dentro(p, poly):
    x, y = p
    ins = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            ins = not ins
        j = i
    return ins


def dist_borde(p, poly):
    x, y = p
    best = float("inf")
    j = len(poly) - 1
    for i in range(len(poly)):
        ax, ay = poly[j]
        bx, by = poly[i]
        dx, dy = bx - ax, by - ay
        L = dx * dx + dy * dy
        t = 0.0 if L == 0 else max(0.0, min(1.0, ((x - ax) * dx + (y - ay) * dy) / L))
        best = min(best, math.hypot(x - (ax + t * dx), y - (ay + t * dy)))
        j = i
    return best


def area(poly):
    a = 0.0
    j = len(poly) - 1
    for i in range(len(poly)):
        a += poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1]
        j = i
    return abs(a) / 2


def zona_en(cont, p, tol=0.0):
    """Zona que contiene el punto local (la más pequeña si hay una dentro de otra), o la más cercana a
    menos de tol."""
    hits = sorted((s for s in cont["spaces"] if dentro(p, s["outline"])), key=lambda s: area(s["outline"]))
    if hits or tol <= 0:
        return hits[0] if hits else None
    best, bd = None, tol
    for s in cont["spaces"]:
        d = dist_borde(p, s["outline"])
        if d <= bd:
            best, bd = s, d
    return best


def objeto_cerca(cont, p, maxd=1.0):
    best = None
    for f in cont["features"]:
        d = math.hypot(f["at"][0] - p[0], f["at"][1] - p[1])
        if d <= maxd and (best is None or d < best[1]):
            best = (f, d)
    return best


# ---------------------------------------------------------------- escenario
def cargar(escenario):
    from valkyrie_io import Scenario
    import mapa as M
    sc = Scenario.load(escenario)
    geo, cat = M.load_geo()
    return sc, M.placed_tiles(sc, geo, cat)


def localizar(tiles, x, y):
    """Dónde cae un punto del tablero: {'tile', 'local', 'zona', 'borde', 'objeto'} o None."""
    cands = [t for t in tiles if t.contains(x, y, 0.2)]
    if not cands:
        return None
    best = None
    for t in cands:
        cont = None if t.custom else contenido(t.side)
        if not cont:
            r = {"tile": t, "cont": None}
        else:
            p = t.world_to_local(x, y)
            z = zona_en(cont, p)
            r = {"tile": t, "cont": cont, "local": p, "zona": z,
                 "borde": dist_borde(p, z["outline"]) if z else None, "objeto": objeto_cerca(cont, p)}
        rank = (2 if r.get("zona") else 1 if r["cont"] else 0) + (0.5 if t.contains(x, y, 0) else 0)
        if best is None or rank > best[0]:
            best = (rank, r)
    return best[1]


def posiciones(sc, tipos=("Token", "Spawn", "MPlace"), excepto=None):
    out = []
    for n in sc.of_type(*tipos):
        if n == excepto:
            continue
        kv = sc.components[n]
        if "xposition" not in kv:
            continue
        try:
            out.append((n, float(kv["xposition"]), float(kv.get("yposition", 0) or 0)))
        except ValueError:
            pass
    return out


def fmt(v):
    v = round(v, 2) + 0.0
    return f"{v:g}"


EN_BORDE = ("TokenExplore", "TokenWall", "TokenWallInside", "TokenWallOutside", "TokenBarricade",
            "TokenBarricadeInside", "TokenBarricadeOutside")   # van en puertas y paredes a propósito


def describir(r, tipo=""):
    t = r["tile"]
    base = f"{t.name} ({t.custom or t.side}, rot {t.deg})"
    if not r.get("cont"):
        return base + (" · imagen propia: sin datos de zonas" if t.custom else " · sin datos de zonas")
    if not r.get("zona"):
        return base + (" · en el borde" if tipo in EN_BORDE else
                       " · fuera de las zonas dibujadas (pared, hueco o borde)")
    s = f"{base} › {r['zona']['id']} «{zona_es(r['zona'])}»"
    if r.get("objeto") and tipo not in EN_BORDE:
        f, d = r["objeto"]
        s += f" · {'sobre' if d < 0.45 else 'junto a'} {f['id']} {objeto_es(f)}"
    if r.get("borde") is not None and r["borde"] < 0.3 and tipo not in EN_BORDE:
        s += " · pisando la línea de la zona"
    return s


# ---------------------------------------------------------------- órdenes
def cmd_ver(a):
    side = a.loseta if a.loseta.startswith("TileSide") else "TileSide" + a.loseta
    cont = data()["losetas"].get(side)
    if not cont:
        sys.exit(f"No tengo datos de {side} (las de 1ª edición y las imágenes propias no tienen zonas).")
    import mapa as M
    geo, cat = M.load_geo()
    W, H, g = M.tile_dims(side, geo, cat)
    ct = cat.get("tiles", {}).get(side, {})
    pk = cat.get("packs", {}).get(ct.get("pack", ""), {})
    print(f"{side}  ({ct.get('en', '')}; {pk.get('es') or ct.get('pack', '?')}; {M.f(W / 3.5)}×{M.f(H / 3.5)} "
          f"espacios, {M.f(W)}×{M.f(H)} unidades)")
    print(f"  {cont['desc_es']}")
    if a.en:
        print(f"  [en] {cont['desc']}")
    print(f"  Tipo: {', '.join(sala_es(r) for r in cont['roomTypes'])} · Ambiente: "
          f"{', '.join(etiqueta_es(t) for t in cont['tags'])}")
    for s in cont["spaces"]:
        ab = []
        for o in s.get("openings", []):
            seg = (g or {}).get(o["side"], [])
            kind = seg[o["index"]]["kind"] if o["index"] < len(seg) else "?"
            ab.append(f"{'puerta' if kind == 'door' else 'abierto'} {LADO_ES[o['side']]}")
        en = []
        for l in s.get("links", []):
            via = {"line": "línea", "door": "puerta", "barrier": "barrera"}.get(l["via"], l["via"])
            en.append(f"{l['to']} ({via})")
        print(f"\n  Zona {s['id']} «{zona_es(s)}»" + (f" [{s['label']}]" if a.en else "") +
              f": {M.f(round(area(s['outline']) / 12.25, 1))} espacios aprox.; centro libre {tuple(s['anchor'])}")
        if ab:
            print(f"    Salidas del borde: {', '.join(ab)}")
        if en:
            print(f"    Comunica con: {', '.join(en)}")
        for f in [f for f in cont["features"] if f["space"] == s["id"]]:
            us = f" · {', '.join(uso_es(u) for u in f['affords'])}" if f.get("affords") else ""
            extra = f" [{f.get('label', f['kind'])}]" if a.en else ""
            print(f"    {f['id']:4s} {objeto_es(f)} ({tipo_es(f['kind'])}) en {tuple(f['at'])}{us}{extra}")
    print("\n  Coordenadas locales: x al este desde el borde oeste, y al SUR desde el borde norte, sin girar.")
    print("  Para el tablero: python losetas.py colocar <escenario> <Tile>:<zona u objeto>")


def campos(cont):
    """(peso, texto, objeto) donde buscar palabras en una cara de loseta, en español e inglés."""
    fields = []
    for f in cont["features"]:
        v = data()["vocabulario"]["tipos"].get(f["kind"], {})
        fields.append((3, " | ".join(v.get("es", []) + v.get("en", [])), f))
        fields.append((2, f"{f.get('label_es', '')} | {f.get('label', '')}", f))
    for s in cont["spaces"]:
        fields.append((2, f"{s.get('label_es', '')} | {s['label']}", s))
    for r in cont["roomTypes"]:
        fields.append((3, f"{sala_es(r)} | {r}", None))
    for t in cont["tags"]:
        fields.append((2, f"{etiqueta_es(t)} | {t}", None))
    fields.append((1, f"{cont['desc_es']} | {cont['desc']}", None))
    return fields


def cmd_buscar(a):
    import mapa as M
    geo, cat = M.load_geo()
    terms = [norm(t) for t in a.terminos if norm(t)]
    if not terms:
        sys.exit("¿Qué busco?")
    want_pack = norm(a.pack) if a.pack else None
    res = []
    for side, cont in data()["losetas"].items():
        ct = cat.get("tiles", {}).get(side, {})
        if want_pack:
            pk = cat.get("packs", {}).get(ct.get("pack", ""), {})
            if want_pack not in (norm(ct.get("pack", "")), ) and want_pack not in norm(pk.get("es", "")) \
                    and want_pack not in norm(pk.get("en", "")):
                continue
        fields = campos(cont)
        score, hits, ok = 0, [], True
        for q in terms:
            rx = re.compile(r"(?<![a-z0-9])" + re.escape(q))
            m = [(w, obj) for w, txt, obj in fields if rx.search(norm(txt))]
            if not m:
                ok = False
                break
            score += max(w for w, _ in m)
            hits += [obj for _, obj in m if obj is not None]
        if ok:
            res.append((score, side, cont, ct, hits))
    res.sort(key=lambda x: (-x[0], -len(x[4]), x[1]))
    if not res:
        cuentas = []
        for q in terms:
            rx = re.compile(r"(?<![a-z0-9])" + re.escape(q))
            n = sum(1 for c in data()["losetas"].values() if any(rx.search(norm(txt)) for _, txt, _ in campos(c)))
            cuentas.append(f"«{q}» en {n}")
        print("Ninguna cara de loseta" + (" de ese pack" if want_pack else "") + " lo tiene todo a la vez ("
              + ", ".join(cuentas) + " en total). Prueba con menos palabras, en inglés o sin --pack.")
        return
    print(f"{len(res)} caras de loseta" + (f" (muestro {a.max})" if len(res) > a.max else "") + ":")
    for score, side, cont, ct, hits in res[:a.max]:
        W, H, _ = M.tile_dims(side, geo, cat)
        pk = cat.get("packs", {}).get(ct.get("pack", ""), {})
        desc = cont["desc_es"]
        print(f"\n  {side}  ({M.f(W / 3.5)}×{M.f(H / 3.5)} esp.; {pk.get('es') or ct.get('pack', '?')})")
        print(f"    {desc[:170]}{'…' if len(desc) > 170 else ''}")
        seen, shown = set(), []
        for h in hits:
            if id(h) in seen:
                continue
            seen.add(id(h))
            if "kind" in h:
                z = next((s for s in cont["spaces"] if s["id"] == h["space"]), None)
                shown.append(f"{h['id']} {objeto_es(h)}" + (f" (zona {z['id']} «{zona_es(z)}»)" if z else ""))
            else:
                shown.append(f"zona {h['id']} «{zona_es(h)}»")
        if shown:
            print(f"    → {'; '.join(shown[:5])}{' …' if len(shown) > 5 else ''}")


def cmd_donde(a):
    sc, tiles = cargar(a.escenario)
    tipos = ("Token", "Spawn", "MPlace") + (("Event",) if a.eventos else ())
    rows = posiciones(sc, tipos)
    if not rows:
        print("No hay componentes con posición.")
        return
    sin = 0
    for n, x, y in rows:
        kv = sc.components[n]
        r = localizar(tiles, x, y)
        typ = kv.get("type", "") or (kv.get("monster", "").split() or [""])[0]
        if not r:
            sin += 1
            print(f"  {n:34s} ({fmt(x)},{fmt(y)}) {typ[:22]:22s} ⚠ fuera de todas las losetas")
            continue
        print(f"  {n:34s} ({fmt(x)},{fmt(y)}) {typ[:22]:22s} {describir(r, kv.get('type', ''))}")
    if sin:
        print(f"\n{sin} componentes fuera de las losetas (pueden ser intencionados si su loseta aún no existe).")


def libres(sc, excepto=None):
    return [(x, y) for _, x, y in posiciones(sc, excepto=excepto)]


def cmd_colocar(a):
    sc, tiles = cargar(a.escenario)
    nombre, _, ref = a.donde.partition(":")
    t = next((t for t in tiles if t.name.lower() == nombre.strip().lower()), None)
    if not t:
        sys.exit(f"No hay ninguna loseta llamada {nombre} en el escenario.")
    cont = None if t.custom else contenido(t.side)
    if not cont:
        sys.exit(f"{t.name} ({t.custom or t.side}) no tiene zonas anotadas: usa python mapa.py {a.escenario}")
    ocupados = libres(sc, a.excepto)

    def libre(p):
        return all(math.hypot(p[0] - q[0], p[1] - q[1]) >= OCUPADO for q in ocupados)

    ref = ref.strip()
    puntos = []          # (x, y, descripción)
    if ref and re.fullmatch(r"[sfSF]\d+", ref):
        ref = ref.lower()
    zonas = []
    objetos = []
    if not ref:
        zonas = sorted(cont["spaces"], key=lambda s: -area(s["outline"]))
    elif ref.startswith("s") and any(s["id"] == ref for s in cont["spaces"]):
        zonas = [s for s in cont["spaces"] if s["id"] == ref]
    elif ref.startswith("f") and any(f["id"] == ref for f in cont["features"]):
        objetos = [f for f in cont["features"] if f["id"] == ref]
    else:
        q = norm(ref)
        kinds = set(tipos_de(ref))
        objetos = [f for f in cont["features"] if f["kind"] in kinds or q in norm(f.get("label_es", ""))
                   or q in norm(f.get("label", ""))]
        if not objetos:
            zonas = [s for s in cont["spaces"] if q in norm(zona_es(s)) or q in norm(s["label"])]
        if not objetos and not zonas:
            opts = [f"{s['id']} «{zona_es(s)}»" for s in cont["spaces"]] + \
                   [f"{f['id']} {objeto_es(f)}" for f in cont["features"]]
            sys.exit(f"Nada llamado «{ref}» en {t.name}. Opciones: {'; '.join(opts)}")
    for f in objetos:
        z = next((s for s in cont["spaces"] if s["id"] == f["space"]), None)
        x, y = t.local_to_world(*f["at"])
        puntos.append((x, y, f"sobre {f['id']} {objeto_es(f)} (zona {f['space']} «{zona_es(z) if z else '?'}»)"))
    for s in zonas:
        for p in [s["anchor"]] + list(s.get("spots", [])):
            x, y = t.local_to_world(*p)
            puntos.append((x, y, f"zona {s['id']} «{zona_es(s)}»"))
    ok = [p for p in puntos if libre(p[:2])]
    print(f"{t.name} ({t.side}, en ({fmt(t.x)},{fmt(t.y)}) rot {t.deg}):")
    if not ok:
        print("  Todos los sitios están ocupados por otras fichas; estos son los de todas formas:")
        ok = puntos
    for x, y, d in ok[:a.n]:
        print(f"  xposition={fmt(x)} yposition={fmt(y)}   ← {d}")
    if objetos and len(objetos) > 1 and a.n == 1:
        print(f"  ({len(objetos)} objetos encajan; usa --n {len(objetos)} para verlos todos)")
    if objetos:
        z = next((s for s in cont["spaces"] if s["id"] == objetos[0]["space"]), None)
        if z:
            x, y = t.local_to_world(*z["anchor"])
            print(f"  Para una persona o un monstruo junto a él, mejor el centro libre de su zona: "
                  f"xposition={fmt(x)} yposition={fmt(y)}")


def cmd_punto(a):
    sc, tiles = cargar(a.escenario)
    r = localizar(tiles, a.x, a.y)
    print(describir(r) if r else "Fuera de todas las losetas.")


# ---------------------------------------------------------------- dibujo (lo usa mapa.py --zonas)
def dibujar_zonas(img, tiles, P, scale):
    from PIL import Image, ImageDraw
    over = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    font_z, font_o = _fuentes(scale)
    for t in tiles:
        cont = None if t.custom else contenido(t.side)
        if not cont:
            continue
        for s in cont["spaces"]:
            pts = [P(*t.local_to_world(*p)) for p in s["outline"]]
            d.polygon(pts, fill=(255, 255, 255, 18), outline=(255, 255, 255, 150))
        for f in cont["features"]:
            x0, y0 = P(*t.local_to_world(*f["at"]))
            r = max(2, scale * 0.08)
            col = (255, 214, 120, 230) if "search" in f.get("affords", []) else (190, 190, 190, 210)
            d.ellipse([x0 - r, y0 - r, x0 + r, y0 + r], fill=col)
            d.text((x0 + r + 1, y0 - r - 1), tipo_es(f["kind"])[:16], fill=col, font=font_o)
        for s in cont["spaces"]:
            x0, y0 = P(*t.local_to_world(*s["anchor"]))
            nombre = re.sub(r"\s*\(.*?\)", "", zona_es(s)).strip() or zona_es(s)
            nombre = nombre if len(nombre) <= 22 else nombre[:21] + "…"
            d.text((x0, y0), nombre, fill=(140, 230, 255, 255), font=font_z, anchor="mm",
                   stroke_width=2, stroke_fill=(0, 0, 0, 255))
    img.paste(Image.alpha_composite(img.convert("RGBA"), over).convert("RGB"))


def _fuentes(scale):
    from PIL import ImageFont
    zs, os_ = max(10, int(scale * 0.3)), max(8, int(scale * 0.22))
    for path in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "DejaVuSans-Bold.ttf", "arialbd.ttf"):
        try:
            return ImageFont.truetype(path, zs), ImageFont.truetype(path.replace("-Bold", "").replace("bd", ""), os_)
        except OSError:
            continue
    try:
        return ImageFont.load_default(zs), ImageFont.load_default(os_)
    except TypeError:
        f = ImageFont.load_default()
        return f, f


def main():
    if hasattr(__import__("signal"), "SIGPIPE"):       # que "| head" no acabe en BrokenPipeError
        import signal
        signal.signal(signal.SIGPIPE, signal.SIG_DFL)
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="orden", required=True)
    p = sub.add_parser("ver")
    p.add_argument("loseta")
    p.add_argument("--en", action="store_true", help="enseña también el texto original en inglés")
    p = sub.add_parser("buscar")
    p.add_argument("terminos", nargs="+")
    p.add_argument("--pack", help="id o nombre del pack (MoMBase, Más Allá del Umbral…)")
    p.add_argument("--max", type=int, default=12)
    p = sub.add_parser("donde")
    p.add_argument("escenario")
    p.add_argument("--eventos", action="store_true", help="incluye los eventos con posición")
    p = sub.add_parser("colocar")
    p.add_argument("escenario")
    p.add_argument("donde", help="Tile_nombre[:zona|objeto|palabra]")
    p.add_argument("--n", type=int, default=1, help="cuántos sitios libres dar")
    p.add_argument("--excepto", help="componente que se va a mover (su sitio actual cuenta como libre)")
    p = sub.add_parser("punto")
    p.add_argument("escenario")
    p.add_argument("x", type=float)
    p.add_argument("y", type=float)
    a = ap.parse_args()
    {"ver": cmd_ver, "buscar": cmd_buscar, "donde": cmd_donde, "colocar": cmd_colocar, "punto": cmd_punto}[a.orden](a)


if __name__ == "__main__":
    main()
