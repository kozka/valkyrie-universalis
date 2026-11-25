#!/usr/bin/env python3
"""
empaquetar.py - Crea el paquete publicable de un escenario igual que "Crear paquete" del editor de
Valkyrie (EditorTools.CreatePackage):

  <salida>/<Id>/<Id>.valkyrie   ZIP con el contenido de la carpeta en la raíz
  <salida>/<Id>/<Id>.ini        manifiesto: [Quest] + name./synopsys./description./authors.<Idioma>
  <salida>/<Id>/<portada>       imagen de portada (si hay)

Uso:
    python empaquetar.py <carpeta_escenario> [--salida CARPETA] [--sobrescribir] [--todo] [--sin-validar]

Crea <salida>/<Id>/ (si ya existe, <Id>2, <Id>3… como el editor; --sobrescribir reutiliza <Id>/).
Antes de empaquetar ejecuta validar.py (salvo --sin-validar) y se niega si hay ERRORES.
No mete en el .valkyrie ficheros de trabajo (.md, .html, .py, .zip, .json…) salvo con --todo, y avisa
de imágenes o audio que ningún .ini cita.
"""
import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from valkyrie_io import Scenario  # noqa: E402

JUNK = {".git", "__pycache__", ".DS_Store", "Thumbs.db", "desktop.ini", ".idea", ".vscode"}
# ficheros de trabajo que no forman parte del escenario (mapas, grafos, notas, copias)
NO_ESCENARIO = (".md", ".html", ".htm", ".py", ".pyc", ".zip", ".valkyrie", ".json", ".csv", ".log", ".bak",
                ".tmp", ".7z", ".rar", ".psd", ".xcf", ".kra", ".docx", ".pdf")
MAX_BYTES = 100 * 1024 * 1024


def referenced_media(folder):
    """Rutas de imágenes y audio que citan los .ini del escenario (y de sus subescenarios)."""
    refs = set()
    for root, _, files in os.walk(folder):
        for f in files:
            if f.lower().endswith(".ini"):
                try:
                    text = open(os.path.join(root, f), encoding="utf-8-sig", errors="replace").read()
                except OSError:
                    continue
                for m in re.finditer(r"[^\s=\"']+\.(?:png|jpe?g|ogg)", text, flags=re.I):
                    rel_ini = os.path.relpath(root, folder)
                    p = os.path.normpath(os.path.join(rel_ini, m.group(0).replace("\\", "/")))
                    refs.add(p.replace("\\", "/").lower())
    return refs


def build_zip(folder, dest, todo=False):
    count = 0
    omitidos, sin_usar = [], []
    refs = referenced_media(folder)
    with zipfile.ZipFile(dest, "w", zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(folder):
            dirs[:] = sorted(d for d in dirs if d not in JUNK and not d.startswith("."))
            for f in sorted(files):
                if f in JUNK or f.startswith(".") or f.endswith("~"):
                    continue
                full = os.path.join(root, f)
                rel = os.path.relpath(full, folder).replace("\\", "/")
                low = f.lower()
                es_txt_ajeno = low.endswith(".txt") and not low.startswith("localization.")
                if not todo and (low.endswith(NO_ESCENARIO) or es_txt_ajeno):
                    omitidos.append(rel)
                    continue
                if low.endswith((".png", ".jpg", ".jpeg", ".ogg")):
                    base_rel = rel.lower()
                    # versiones por idioma: English/img/x.png o img/English/x.png
                    partes = base_rel.split("/")
                    variantes = {base_rel} | {"/".join(partes[:i] + partes[i + 1:]) for i in range(len(partes) - 1)}
                    if not (variantes & refs):
                        sin_usar.append(rel)
                if " " in rel:
                    print(f"  aviso: '{rel}' tiene espacios en el nombre")
                z.write(full, rel)
                count += 1
    if omitidos:
        print(f"  no se incluyen (ficheros de trabajo; usa --todo para meterlos): {', '.join(omitidos)}")
    if sin_usar:
        print(f"  aviso: imágenes o audio que ningún .ini cita (se incluyen igualmente): {', '.join(sin_usar)}")
    return count


def sha_version(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return "-".join(f"{b:02X}" for b in h.digest())


def manifest(sc, version, image_name):
    q = sc.quest
    nl = "\r\n"
    lines = ["[Quest]",
             f"format={q.get('format', '21')}",
             f"hidden={q.get('hidden', 'False')}",
             "type=MoM",
             f"defaultlanguage={sc.default_language}",
             f"defaultmusicon={q.get('defaultmusicon', 'True')}"]
    if q.get("packs", "").strip():
        lines.append(f"packs={' '.join(q['packs'].split())}")
    if q.get("minhero", "2") != "2":
        lines.append(f"minhero={q['minhero']}")
    if q.get("maxhero", "5") != "5":
        lines.append(f"maxhero={q['maxhero']}")
    for k in ("difficulty", "lengthmin", "lengthmax"):
        if q.get(k) and q.get(k) not in ("0",):
            lines.append(f"{k}={q[k]}")
    if image_name:
        lines.append(f"image={image_name}")
    lines.append(f"version={version}")
    for key, prefix, mode in (("quest.name", "name", "flat"), ("quest.synopsys", "synopsys", "flat"),
                              ("quest.description", "description", "esc"), ("quest.authors", "authors", "esc"),
                              ("quest.authors_short", "authors_short", "flat")):
        for lang, loc in sc.localizations.items():
            if key in loc.entries:
                v = loc.entries[key]
                v = v.replace("\r", "").replace("\n", "\\n") if mode == "esc" else v.replace("\r", "").replace("\n", "")
                lines.append(f"{prefix}.{lang}={v}")
    return nl.join(lines) + nl


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("escenario")
    ap.add_argument("--salida", default=".")
    ap.add_argument("--sin-validar", action="store_true")
    ap.add_argument("--sobrescribir", action="store_true",
                    help="reutiliza <salida>/<Id>/ en vez de crear <Id>2, <Id>3…")
    ap.add_argument("--todo", action="store_true", help="incluye también ficheros de trabajo (.md, .html, .py…)")
    a = ap.parse_args()
    folder = os.path.abspath(a.escenario)
    ident = os.path.basename(folder.rstrip("/\\"))
    if " " in ident:
        sys.exit("El nombre de la carpeta tiene espacios: renómbrala antes de empaquetar")
    if not a.sin_validar:
        r = subprocess.run([sys.executable, os.path.join(HERE, "validar.py"), folder, "--sin-info", "--json"],
                           capture_output=True, text=True)
        try:
            items = json.loads(r.stdout or "[]")
        except ValueError:
            items = None
        if items is None:
            print(r.stdout, r.stderr)
            sys.exit("No se pudo validar el escenario (usa --sin-validar para empaquetar igualmente)")
        errores = [i for i in items if i["nivel"] == "ERROR"]
        avisos = [i for i in items if i["nivel"] == "AVISO"]
        print(f"Validación: {len(errores)} errores, {len(avisos)} avisos")
        if errores:
            for i in errores:
                print(f"  ERROR | {i['donde']}: {i['mensaje']}")
            sys.exit("Hay ERRORES: corrígelos antes de empaquetar (o usa --sin-validar)")
    sc = Scenario.load(folder)
    out_dir = os.path.join(os.path.abspath(a.salida), ident)
    if os.path.abspath(out_dir).startswith(folder + os.sep) or os.path.abspath(a.salida) == folder:
        sys.exit("La carpeta de salida no puede estar dentro del escenario (se metería en el paquete)")
    if a.sobrescribir:
        os.makedirs(out_dir, exist_ok=True)
    else:
        n = 2
        while os.path.exists(out_dir):          # como el editor: <Id>2, <Id>3…
            out_dir = os.path.join(os.path.abspath(a.salida), f"{ident}{n}")
            n += 1
        os.makedirs(out_dir)
    pkg = os.path.join(out_dir, ident + ".valkyrie")
    count = build_zip(folder, pkg, todo=a.todo)
    size = os.path.getsize(pkg)
    if size > MAX_BYTES:
        print(f"  ⚠ el paquete ocupa {size / 1e6:.1f} MB: Valkyrie no admite más de 100 MB")
    version = sha_version(pkg)
    image = sc.quest.get("image", "").replace("\\", "/")
    image_name = os.path.basename(image) if image else ""
    if image:
        src = os.path.join(folder, image)
        if os.path.exists(src):
            with open(src, "rb") as fi, open(os.path.join(out_dir, image_name), "wb") as fo:
                fo.write(fi.read())
        else:
            print(f"  aviso: no encuentro la portada {image}")
            image_name = ""
    with open(os.path.join(out_dir, ident + ".ini"), "w", encoding="utf-8", newline="") as fh:
        fh.write(manifest(sc, version, image_name))
    print(f"Paquete creado en {out_dir}")
    print(f"  {ident}.valkyrie  ({count} ficheros, {size / 1024:.0f} KB)")
    print(f"  {ident}.ini       (version={version[:23]}…)")
    if image_name:
        print(f"  {image_name}")
    print("Para probarlo: copia el .valkyrie a la carpeta Download de Valkyrie. Para publicarlo: sube los "
          "3 ficheros a un repositorio público de GitHub y abre un issue '[Scenario] …' (valkyrie-app.md).")


if __name__ == "__main__":
    main()
