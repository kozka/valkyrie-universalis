#!/usr/bin/env python3
"""
nombres_oficiales.py - Saca de la importación oficial de Descent (la que hace Valkyrie desde Road to
Legend) los nombres oficiales en español e inglés de los monstruos, héroes, clases y objetos del
catálogo, para que construir_catalogo.py los use en lugar de los de la comunidad.

Uso (en el ordenador que tiene la importación):
    python nombres_oficiales.py <carpeta de la importación o .zip> [--catalogo assets/catalogo.json]
                                [--salida nombres_oficiales.json]

La importación está en %APPDATA%\\Valkyrie\\D2E\\import (o en el zip que se pasó a Valkyrie Universalis):
se leen text/Localization_Spanish.txt y text/Localization_English.txt. Solo salen los NOMBRES de las
claves que cita el catálogo (MONSTER_…, HERO_…, CLASS_…, ITEM_…); ningún otro texto de la app oficial.

Después:
    python construir_catalogo.py <clon de Valkyrie> --packs <packs> --nombres nombres_oficiales.json
"""
import argparse
import io
import json
import os
import sys
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)


def parse_localization(text):
    """KEY -> valor de un fichero de localización de Valkyrie (.,Idioma en la primera línea)."""
    sep = "\r" if "\r" in text else "\n"
    lines = [ln.strip("\r\n") for ln in text.split(sep)]
    out = {}
    i = 1
    while i < len(lines):
        line = lines[i]
        i += 1
        if not line or line.startswith("//") or "," not in line:
            continue
        key, value = line.split(",", 1)
        if value.startswith("|||"):
            while not value.rstrip().endswith("|||") or value.rstrip() == "|||":
                if i >= len(lines):
                    break
                value += "\n" + lines[i]
                i += 1
            value = value.strip()[3:-3]
        elif value.startswith('"'):
            while value.count('"') % 2 == 1 and i < len(lines):
                value += "\n" + lines[i]
                i += 1
            value = value[1:-1].replace('""', '"') if value.endswith('"') else value[1:]
        out.setdefault(key, value.replace("\\n", " ").strip())
    return out


def read_texts(src):
    """{idioma: texto} de text/Localization_<Idioma>.txt (sin dígitos en el nombre, como Valkyrie)."""
    found = {}

    def want(name):
        base = os.path.basename(name)
        return (base.startswith("Localization_") and base.endswith(".txt")
                and not any(ch.isdigit() for ch in base))

    if os.path.isdir(src):
        for root, _, files in os.walk(src):
            for f in files:
                if want(f) and os.path.basename(root).lower() == "text":
                    lang = f[len("Localization_"):-4]
                    found[lang] = open(os.path.join(root, f), encoding="utf-8-sig", errors="replace").read()
    else:
        with zipfile.ZipFile(src) as z:
            for n in z.namelist():
                if "__MACOSX" in n or not want(n):
                    continue
                if os.path.basename(os.path.dirname(n)).lower() != "text":
                    continue
                lang = os.path.basename(n)[len("Localization_"):-4]
                found[lang] = io.TextIOWrapper(z.open(n), encoding="utf-8-sig", errors="replace").read()
    return found


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("importacion", help="carpeta D2E/import de Valkyrie, o un .zip con ella")
    ap.add_argument("--catalogo", default=os.path.join(SKILL, "assets", "catalogo.json"))
    ap.add_argument("--salida", default="nombres_oficiales.json")
    a = ap.parse_args()
    texts = read_texts(a.importacion)
    if "Spanish" not in texts:
        sys.exit(f"No encuentro text/Localization_Spanish.txt en {a.importacion} (idiomas: {', '.join(texts) or '—'})")
    es = parse_localization(texts["Spanish"])
    en = parse_localization(texts.get("English", ""))
    cat = json.load(open(a.catalogo, encoding="utf-8"))
    keys = {d["ffg"] for tab in ("monsters", "heroes", "classes", "items") for d in cat[tab].values() if d.get("ffg")}
    nombres = {k: es[k] for k in sorted(keys) if es.get(k)}
    nombres_en = {k: en[k] for k in sorted(keys) if en.get(k)}
    data = {"nota": "Nombres oficiales sacados de la importación de Road to Legend con nombres_oficiales.py (solo "
                    "nombres de componentes, ningún otro texto).",
            "nombres": nombres, "nombres_en": nombres_en}
    with open(a.salida, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    print(f"{len(nombres)} nombres en español y {len(nombres_en)} en inglés de {len(keys)} claves -> {a.salida}")


if __name__ == "__main__":
    main()
