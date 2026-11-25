#!/usr/bin/env python3
"""
construir_losetas.py - Genera assets/contenido_losetas.json: qué hay dibujado en cada loseta de MoM 2ª ed.
(zonas de movimiento con su contorno, objetos con su posición y una descripción), con el texto en
inglés original y su traducción al español.

Los datos vienen de ValkyrieMCP (https://github.com/thijs-hakkenberg/ValkyrieMCP, licencia MIT),
fichero src/catalogs/data/tile-content.ts, anotado a mano sobre el arte de cada loseta. Este script
lee ese .ts directamente (no necesita Node) y conserva las traducciones que ya tenga el JSON actual:
solo hace falta traducir lo que sea nuevo.

Uso:
  python construir_losetas.py --mcp /ruta/a/ValkyrieMCP [--traducciones nuevas.json] [--salida ruta.json]

  nuevas.json (opcional) puede traer cualquiera de estas claves:
    {"descripciones": {TileSide: texto_es}, "espacios": {label_en: label_es},
     "objetos": {label_en: label_es}, "vocabulario": {...misma forma que en el JSON...}}

Al terminar dice qué textos siguen sin traducir (se quedan en inglés).
"""
import argparse
import datetime
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)
OUT_DEFAULT = os.path.join(SKILL, "assets", "contenido_losetas.json")
GEO_PATH = os.path.join(SKILL, "assets", "geometria_losetas.json")


# ---------------------------------------------------------------- lector de literales JS/TS
class JsReader:
    """Lee un literal de objeto/array de JavaScript (claves sin comillas, comillas simples o dobles,
    comas finales, comentarios). Suficiente para los ficheros de datos de ValkyrieMCP."""

    def __init__(self, text, pos):
        self.s, self.i = text, pos

    def ws(self):
        s = self.s
        while self.i < len(s):
            c = s[self.i]
            if c in " \t\r\n":
                self.i += 1
            elif s.startswith("//", self.i):
                self.i = s.find("\n", self.i) if s.find("\n", self.i) >= 0 else len(s)
            elif s.startswith("/*", self.i):
                self.i = s.index("*/", self.i) + 2
            else:
                break

    def value(self):
        self.ws()
        c = self.s[self.i]
        if c == "{":
            return self.obj()
        if c == "[":
            return self.arr()
        if c in "\"'":
            return self.string()
        m = re.compile(r"-?\d+(\.\d+)?([eE][-+]?\d+)?").match(self.s, self.i)
        if m:
            self.i = m.end()
            t = m.group(0)
            return float(t) if any(ch in t for ch in ".eE") else int(t)
        m = re.compile(r"[A-Za-z_$][\w$]*").match(self.s, self.i)
        if m:
            self.i = m.end()
            return {"true": True, "false": False, "null": None}.get(m.group(0), m.group(0))
        raise ValueError(f"carácter inesperado {c!r} en {self.i}")

    def string(self):
        q = self.s[self.i]
        self.i += 1
        out = []
        while True:
            c = self.s[self.i]
            if c == "\\":
                n = self.s[self.i + 1]
                if n == "u":
                    out.append(chr(int(self.s[self.i + 2:self.i + 6], 16)))
                    self.i += 6
                    continue
                out.append({"n": "\n", "t": "\t", "r": "\r"}.get(n, n))
                self.i += 2
                continue
            if c == q:
                self.i += 1
                return "".join(out)
            out.append(c)
            self.i += 1

    def key(self):
        self.ws()
        if self.s[self.i] in "\"'":
            return self.string()
        m = re.compile(r"[A-Za-z_$][\w$]*").match(self.s, self.i)
        if not m:
            raise ValueError(f"clave inesperada en {self.i}: {self.s[self.i:self.i + 30]!r}")
        self.i = m.end()
        return m.group(0)

    def obj(self):
        self.i += 1
        out = {}
        while True:
            self.ws()
            if self.s[self.i] == "}":
                self.i += 1
                return out
            k = self.key()
            self.ws()
            if self.s[self.i] != ":":
                raise ValueError(f"falta ':' tras {k!r}")
            self.i += 1
            out[k] = self.value()
            self.ws()
            if self.s[self.i] == ",":
                self.i += 1

    def arr(self):
        self.i += 1
        out = []
        while True:
            self.ws()
            if self.s[self.i] == "]":
                self.i += 1
                return out
            out.append(self.value())
            self.ws()
            if self.s[self.i] == ",":
                self.i += 1


def read_const(path, name):
    text = open(path, encoding="utf-8").read()
    m = re.search(r"export const " + name + r"\b[^=]*=\s*", text)
    if not m:
        sys.exit(f"No encuentro 'export const {name}' en {path}")
    return JsReader(text, m.end()).value()


# ---------------------------------------------------------------- traducciones
def memory_from(existing):
    """Memoria de traducción a partir del JSON ya generado."""
    mem = {"descripciones": {}, "espacios": {}, "objetos": {}, "vocabulario": existing.get("vocabulario", {})}
    for tid, t in existing.get("losetas", {}).items():
        if t.get("desc_es"):
            mem["descripciones"][tid] = (t["desc"], t["desc_es"])
        for s in t.get("spaces", []):
            if s.get("label_es"):
                mem["espacios"][s["label"]] = s["label_es"]
        for f in t.get("features", []):
            if f.get("label") and f.get("label_es"):
                mem["objetos"][f["label"]] = f["label_es"]
    return mem


def merge_vocab(base, extra):
    out = json.loads(json.dumps(base or {}))
    for sec, d in (extra or {}).items():
        out.setdefault(sec, {}).update(d)
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--mcp", required=True, help="carpeta del repositorio ValkyrieMCP")
    ap.add_argument("--traducciones", help="JSON con traducciones nuevas")
    ap.add_argument("--salida", default=OUT_DEFAULT)
    a = ap.parse_args()

    data_dir = os.path.join(a.mcp, "src", "catalogs", "data")
    content = read_const(os.path.join(data_dir, "tile-content.ts"), "TILE_CONTENT")
    kinds = read_const(os.path.join(data_dir, "feature-vocabulary.ts"), "FEATURE_KINDS")
    version, commit = "?", "?"
    try:
        version = json.load(open(os.path.join(a.mcp, "package.json"), encoding="utf-8")).get("version", "?")
        commit = subprocess.run(["git", "-C", a.mcp, "rev-parse", "--short", "HEAD"], capture_output=True,
                                text=True).stdout.strip() or "?"
    except Exception:
        pass

    existing = json.load(open(a.salida, encoding="utf-8")) if os.path.exists(a.salida) else {}
    mem = memory_from(existing)
    new = json.load(open(a.traducciones, encoding="utf-8")) if a.traducciones else {}
    desc_new = new.get("descripciones", {})
    esp = {**mem["espacios"], **new.get("espacios", {})}
    obj = {**mem["objetos"], **new.get("objetos", {})}
    vocab = merge_vocab(mem["vocabulario"], new.get("vocabulario"))

    # vocabulario de tipos de objeto: categoría y sinónimos en inglés (de ValkyrieMCP) + español (nuestro)
    tipos_es = vocab.get("tipos", {})
    tipos = {}
    falta = {"descripciones": [], "espacios": set(), "objetos": set(), "tipos": [], "salas": set(),
             "etiquetas": set()}
    for k, info in kinds.items():
        es = tipos_es.get(k)
        if isinstance(es, dict):
            es = es.get("es")
        if not es:
            falta["tipos"].append(k)
        tipos[k] = {"categoria": info.get("category"), "en": [k.replace("_", " ")] + list(info.get("synonyms", [])),
                    "es": es or [k.replace("_", " ")]}
    vocab["tipos"] = tipos

    losetas = {}
    for tid, t in content.items():
        d = desc_new.get(tid)
        if not d and tid in mem["descripciones"] and mem["descripciones"][tid][0] == t["desc"]:
            d = mem["descripciones"][tid][1]
        if not d:
            falta["descripciones"].append(tid)
        for r in t.get("roomTypes", []):
            if r not in vocab.get("salas", {}):
                falta["salas"].add(r)
        for g in t.get("tags", []):
            if g not in vocab.get("etiquetas", {}):
                falta["etiquetas"].add(g)
        spaces = []
        for s in t.get("spaces", []):
            s2 = dict(s)
            if s["label"] in esp:
                s2["label_es"] = esp[s["label"]]
            else:
                falta["espacios"].add(s["label"])
            spaces.append(s2)
        feats = []
        for f in t.get("features", []):
            f2 = dict(f)
            if f.get("label"):
                if f["label"] in obj:
                    f2["label_es"] = obj[f["label"]]
                else:
                    falta["objetos"].add(f["label"])
            feats.append(f2)
        losetas[tid] = {"desc": t["desc"], "desc_es": d or t["desc"], "roomTypes": t.get("roomTypes", []),
                        "tags": t.get("tags", []), "spaces": spaces, "features": feats}

    # comprobación contra nuestra geometría (tamaño de cada cara)
    geo = json.load(open(GEO_PATH, encoding="utf-8")) if os.path.exists(GEO_PATH) else {}
    avisos = []
    for tid, t in losetas.items():
        g = geo.get(tid)
        if not g:
            avisos.append(f"{tid}: sin geometría en geometria_losetas.json")
            continue
        xs = [p[0] for s in t["spaces"] for p in s["outline"]]
        ys = [p[1] for s in t["spaces"] for p in s["outline"]]
        if xs and (max(xs) > g["w"] + 0.06 or max(ys) > g["h"] + 0.06 or min(xs) < -0.06 or min(ys) < -0.06):
            avisos.append(f"{tid}: zonas fuera del tamaño {g['w']}×{g['h']}")

    out = {
        "_fuente": {
            "datos": "ValkyrieMCP (Thijs Hakkenberg, licencia MIT) src/catalogs/data/tile-content.ts y "
                     "feature-vocabulary.ts",
            "version": version, "commit": commit,
            "generado": datetime.date.today().isoformat(),
            "traduccion": "español añadido para esta skill (campos *_es y vocabulario)",
            "coordenadas": "locales a la cara de la loseta SIN girar, en unidades de tablero (1 espacio = 3,5): "
                           "x hacia el este desde el borde oeste, y hacia el SUR desde el borde norte. El origen "
                           "(0,0) es el punto xposition/yposition de la loseta. Para pasar al tablero usa "
                           "losetas.py (local_a_mundo).",
        },
        "vocabulario": vocab,
        "losetas": dict(sorted(losetas.items())),
    }
    os.makedirs(os.path.dirname(a.salida), exist_ok=True)
    with open(a.salida, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))
    n_sp = sum(len(t["spaces"]) for t in losetas.values())
    n_f = sum(len(t["features"]) for t in losetas.values())
    print(f"{a.salida}: {len(losetas)} caras de loseta, {n_sp} zonas, {n_f} objetos, "
          f"{os.path.getsize(a.salida) // 1024} KB (ValkyrieMCP {version} {commit})")
    for k, v in falta.items():
        if v:
            v = sorted(v)
            print(f"  sin traducir ({k}): {len(v)}: {', '.join(v[:12])}{' …' if len(v) > 12 else ''}")
    for x in avisos:
        print("  aviso:", x)


if __name__ == "__main__":
    main()
