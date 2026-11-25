"""Rarezas reales de los escenarios publicados (paquetes .valkyrie).

Lee cada .valkyrie de la carpeta indicada sin extraerlo y cuenta lo que un
cargador web tiene que tolerar: codificaciones, finales de línea, rutas con
barra invertida o mayúsculas distintas, ficheros que faltan, secciones
desconocidas o repetidas, tamaños de imagen y formatos de audio. Recorre todos
los quest.ini de cada paquete (las campañas llevan varios), cada uno con su
carpeta como raíz, igual que Valkyrie.

Uso: python3 -I analizar_corpus.py <carpeta_con_valkyrie> <salida.json> [tamanos.tsv]
     (en Windows: py -3 -I analizar_corpus.py ...)
"""
import collections
import json
import os
import posixpath
import re
import struct
import sys
import zipfile

KNOWN = ("Tile", "Door", "Token", "UI", "Event", "Spawn", "MPlace", "QItem",
         "StartingItem", "Puzzle", "CustomMonster", "Activation")
META = {"Quest", "QuestData", "QuestText"}
MEDIA = (".png", ".jpg", ".jpeg", ".ogg", ".mp3", ".wav", ".webp", ".gif", ".bmp")
LANGS = {"English", "Spanish", "French", "German", "Italian", "Polish", "Portuguese", "Russian",
         "Korean", "Chinese", "Czech", "Japanese", "Ukrainian"}
# Claves cuya \ Valkyrie no cambia por / (QuestData.cs): solo funcionan en Windows.
NO_NORMALIZA = {"customImage", "imageplace"}


def encoding_of(b):
    if b.startswith(b"\xef\xbb\xbf"):
        return "utf8-bom"
    if b.startswith((b"\xff\xfe", b"\xfe\xff")):
        return "utf16-bom"
    try:
        b.decode("utf-8")
        return "utf8"
    except UnicodeDecodeError:
        return "no-utf8"


def endings_of(b):
    crlf = b.count(b"\r\n")
    lf = b.count(b"\n") - crlf
    cr = b.count(b"\r") - crlf
    kinds = [k for k, n in (("crlf", crlf), ("lf", lf), ("cr", cr)) if n]
    if not kinds:
        return "una-linea"
    return kinds[0] if len(kinds) == 1 else "mezcla"


def decode(b):
    for enc in ("utf-8-sig", "utf-16"):
        try:
            return b.decode(enc)
        except UnicodeDecodeError:
            continue
    return b.decode("cp1252", errors="replace")


def parse_ini(text):
    """Como IniRead de Valkyrie: la primera sección y la primera clave ganan."""
    sections, dup_sections, dup_keys, ws_lines = {}, 0, 0, 0
    cur, data = "", {}
    for raw in re.split(r"\r\n|\n|\r", text):
        if raw and not raw.strip():
            ws_lines += 1
            continue
        line = raw.strip()
        if not line or line[0] in "#;":
            continue
        if line[0] == "[":
            if cur:
                if cur in sections:
                    dup_sections += 1
                else:
                    sections[cur] = data
            cur, data = line.strip("[]"), {}
            continue
        k, _, v = raw.partition("=")
        k = k.strip()
        if k in data:
            dup_keys += 1
        else:
            data[k] = v.strip().strip('"')
    if cur:
        if cur in sections:
            dup_sections += 1
        else:
            sections[cur] = data
    return sections, dup_sections, dup_keys, ws_lines


def listed_files(text):
    """Ficheros de [QuestData] y [QuestText] de un quest.ini."""
    in_qd = in_qt = False
    data_files, text_files = [], []
    for raw in re.split(r"\r\n|\n|\r", text):
        t = raw.strip()
        if t.startswith("["):
            in_qd, in_qt = t == "[QuestData]", t == "[QuestText]"
            continue
        if not t or t[0] in "#;":
            continue
        if in_qd:
            data_files.append(t)
        elif in_qt:
            text_files.append(t)
    return data_files, text_files


def resolve(root, rel):
    """Ruta dentro del zip como la resolvería el sistema de ficheros: \\ a /, // a /, y . y .. resueltos."""
    p = posixpath.normpath(root + rel.replace("\\", "/"))
    return "" if p.startswith("..") else p.lstrip("/")


def image_size(b):
    if b[:8] == b"\x89PNG\r\n\x1a\n":
        return struct.unpack(">II", b[16:24])
    if b[:2] == b"\xff\xd8":
        i = 2
        while i + 9 < len(b):
            if b[i] != 0xFF:
                i += 1
                continue
            m = b[i + 1]
            if m in (0xD8, 0x01) or 0xD0 <= m <= 0xD7:
                i += 2
                continue
            seg = struct.unpack(">H", b[i + 2:i + 4])[0]
            if 0xC0 <= m <= 0xCF and m not in (0xC4, 0xC8, 0xCC):
                h, w = struct.unpack(">HH", b[i + 5:i + 9])
                return w, h
            i += 2 + seg
    return None


class Corpus:
    def __init__(self):
        self.c = collections.Counter()
        self.casos = collections.defaultdict(list)
        self.casos_paquetes = collections.defaultdict(collections.Counter)
        self.formatos = collections.Counter()
        self.formatos_raiz = collections.Counter()
        self.desconocidas = collections.Counter()
        self.medios = collections.Counter()
        self.faltan_por_clave = collections.Counter()
        self.idiomas = collections.Counter()
        self.imagenes = []
        self.campanas = []
        self.tamanos = []

    def paquete(self, path, sc):
        self.c["paquetes"] += 1
        self.tamanos.append((sc, os.path.getsize(path)))
        with zipfile.ZipFile(path) as z:
            names = [n for n in z.namelist() if not n.endswith("/")]
            exact = set(names)
            lower = {n.lower(): n for n in names}
            if any("\\" in n for n in names):
                self.caso("zip con '\\' en los nombres", sc, sc)
            texts = {}
            for n in names:
                low = n.lower()
                if low.endswith((".ini", ".txt")):
                    b = z.read(n)
                    texts[n] = b
                    enc, end = encoding_of(b), endings_of(b)
                    self.c[f"texto:{enc}"] += 1
                    self.c[f"final:{end}"] += 1
                    if enc in ("no-utf8", "utf16-bom"):
                        self.caso(f"texto {enc}", sc, f"{sc}/{n}")
                    if low.split("/")[-1].startswith("localization.") and end == "mezcla":
                        self.caso("Localization con finales mezclados", sc, f"{sc}/{n}")
                elif low.endswith(MEDIA):
                    ext = os.path.splitext(low)[1]
                    self.medios[ext] += 1
                    if ext in (".png", ".jpg", ".jpeg"):
                        s = image_size(z.read(n)[:262144])
                        if s:
                            self.imagenes.append((max(s), f"{sc}/{n}", s))
            quests = sorted(n for n in names if n.lower().split("/")[-1] == "quest.ini")
            if "quest.ini" not in exact:
                self.caso("quest.ini no está en la raíz", sc, f"{sc}: {quests[:1]}")
            if len(quests) > 1:
                self.campanas.append((len(quests), sc))
            for q in quests:
                self.quest(sc, q, q[: -len("quest.ini")], names, exact, lower, texts)

    def caso(self, tipo, sc, texto):
        self.casos[tipo].append(texto)
        self.casos_paquetes[tipo][sc] += 1

    def quest(self, sc, qpath, root, names, exact, lower, texts):
        self.c["quests"] += 1
        label = sc if not root else f"{sc}/{root.rstrip('/')}"
        quest_text = decode(texts.get(qpath, b""))
        qs, dsec, dkey, ws = parse_ini(quest_text)
        fmt = qs.get("Quest", {}).get("format", "?")
        self.formatos[fmt] += 1
        if not root:
            self.formatos_raiz[fmt] += 1
        data_files, text_files = listed_files(quest_text)
        for lst, kind in ((data_files, "QuestData"), (text_files, "QuestText")):
            for f in lst:
                if "\\" in f:
                    self.caso(f"[{kind}] con '\\'", sc, f"{label}: {f}")
                p = resolve(root, f)
                if p in exact:
                    continue
                if p and p.lower() in lower:
                    self.caso(f"[{kind}] con mayúsculas distintas", sc, f"{label}: {f}")
                else:
                    self.caso(f"[{kind}] apunta a un fichero que no está", sc, f"{label}: {f}")
        for f in text_files:
            m = re.match(r"Localization\.(.+)\.txt$", f.replace("\\", "/").split("/")[-1], re.I)
            if m and not root:
                self.idiomas[m.group(1)] += 1
        sections = dict(qs)
        self.c["secciones repetidas"] += dsec
        self.c["claves repetidas"] += dkey
        if dsec or dkey:
            self.caso("secciones o claves repetidas en un fichero", sc, f"{label}/quest.ini")
        self.c["líneas solo con espacios"] += ws
        for f in data_files:
            p = resolve(root, f)
            p = p if p in exact else lower.get(p.lower())
            if not p:
                continue
            s2, d2, k2, w2 = parse_ini(decode(texts.get(p, b"")))
            self.c["secciones repetidas"] += d2
            self.c["claves repetidas"] += k2
            if d2 or k2:
                self.caso("secciones o claves repetidas en un fichero", sc, f"{label}: {f}")
            self.c["líneas solo con espacios"] += w2
            for sname in s2:
                if sname in sections:
                    self.c["componente repetido entre ficheros (fatal en Valkyrie)"] += 1
                    self.caso("componente repetido entre ficheros", sc, f"{label}: {sname}")
                else:
                    sections[sname] = s2[sname]
        rel_names = [n[len(root):] for n in names if n.startswith(root)]
        lang_dirs = sorted(({n.split("/")[0] for n in rel_names if "/" in n}
                            | {n.split("/")[-2] for n in rel_names if n.count("/") >= 1}) & LANGS)
        for sname, kv in sections.items():
            if sname in META:
                continue
            if not sname.startswith(KNOWN):
                self.desconocidas[re.sub(r"[0-9_].*$", "", sname) or sname] += 1
                self.c["secciones de tipo desconocido"] += 1
            for k, v in kv.items():
                values = re.split(r"\s+", v) if k == "music" else [v.strip()]
                for token in values:
                    if not token.lower().endswith(MEDIA) or token.startswith("{"):
                        continue
                    self.c["referencias a medios"] += 1
                    if "\\" in token and k in NO_NORMALIZA:
                        self.caso("'\\' en customImage o imageplace (solo vale en Windows)", sc, f"{label}: [{sname}] {k}={token}")
                    rel = token.replace("\\", "/")
                    d, _, fname = rel.rpartition("/")
                    cands = [resolve(root, rel)] + [resolve(root, f"{lg}/{rel}") for lg in lang_dirs]
                    if d:
                        cands += [resolve(root, f"{d}/{lg}/{fname}") for lg in lang_dirs]
                    if any(p in exact for p in cands):
                        if cands[0] not in exact:
                            self.c["medios solo en carpeta de idioma"] += 1
                        continue
                    if any(p and p.lower() in lower for p in cands):
                        self.caso("medio con mayúsculas distintas", sc, f"{label}: [{sname}] {k}={token}")
                    else:
                        self.caso("medio que no está en el paquete", sc, f"{label}: [{sname}] {k}={token}")
                        self.faltan_por_clave[k] += 1
                        if not root:
                            self.c["medios que faltan (quest.ini principal)"] += 1

    def resultado(self):
        self.imagenes.sort(reverse=True)
        self.campanas.sort(reverse=True)
        orden = lambda kv: (len(kv[0]), kv[0])
        return {
            "contadores": dict(sorted(self.c.items())),
            "formatos_todos_los_quest": dict(sorted(self.formatos.items(), key=orden)),
            "formatos_quest_raiz": dict(sorted(self.formatos_raiz.items(), key=orden)),
            "paquetes_con_varios_quest": {"total": len(self.campanas),
                                          "mayores": [{"paquete": s, "quest_ini": n} for n, s in self.campanas[:10]]},
            "idiomas_QuestText_raiz": dict(self.idiomas.most_common()),
            "secciones_desconocidas": dict(self.desconocidas.most_common(30)),
            "medios_por_extension": dict(self.medios.most_common()),
            "medios_que_faltan_por_clave": dict(self.faltan_por_clave.most_common()),
            "imagenes": {
                "total_medidas": len(self.imagenes),
                "mas_de_4096px": sum(1 for s in self.imagenes if s[0] > 4096),
                "mas_de_8192px": sum(1 for s in self.imagenes if s[0] > 8192),
                "mayores": [{"fichero": f, "ancho_alto": list(s)} for _, f, s in self.imagenes[:10]],
            },
            "casos": {k: {"total": len(v), "paquetes": len(self.casos_paquetes[k]),
                          "por_paquete": dict(self.casos_paquetes[k].most_common(8)), "ejemplos": v[:12]}
                      for k, v in sorted(self.casos.items())},
        }


def main(folder, out, tsv=None):
    corpus = Corpus()
    for name in sorted(os.listdir(folder)):
        if name.endswith(".valkyrie"):
            corpus.paquete(os.path.join(folder, name), name[: -len(".valkyrie")])
    res = corpus.resultado()
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(res, fh, ensure_ascii=False, indent=1)
    if tsv:
        with open(tsv, "w", encoding="utf-8", newline="\n") as fh:
            fh.write("escenario\tbytes\n")
            for sc, size in corpus.tamanos:
                fh.write(f"{sc}\t{size}\n")
    sys.stdout.reconfigure(encoding="utf-8")
    print(json.dumps(res, ensure_ascii=False, indent=1)[:6000])


if __name__ == "__main__":
    main(*sys.argv[1:4])
