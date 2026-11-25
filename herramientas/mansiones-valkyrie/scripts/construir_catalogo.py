#!/usr/bin/env python3
"""
construir_catalogo.py - Regenera el catálogo de componentes de Mansiones de la Locura a partir
de un clon del repositorio de Valkyrie (https://github.com/NPBruce/valkyrie).

Uso:
    python construir_catalogo.py <ruta_clon_valkyrie> [--packs <carpeta con packs de la comunidad>]
                                 [--geometria assets/geometria_losetas.json]
                                 [--json assets/catalogo.json] [--md references/catalogo.md]

Lee unity/Assets/StreamingAssets/content/MoM/**/{content_pack,tiles,monsters,items,investigators,
tokens*,images,audio,puzzle,activations,evade,horror,attacks,mythos}.ini y produce:
  * assets/catalogo.json  (para los scripts: validar.py, buscar.py, mapa.py)
  * references/catalogo.md (tablas legibles para el diseñador)

Con --packs lee también los packs de la comunidad (TLE), descomprimidos o tal como los baja Valkyrie
(.valkyrieContentPack); de ellos solo se guardan identificadores y datos, nunca sus textos.
Un componente que definen dos packs se queda, como en Valkyrie (ContentData.AddContent), con la primera
definición y los dos packs: el segundo va en "tambien" (TileSideCampsite, ItemCommonTorch).
"""
import argparse
import glob
import json
import os
import re
import sys
import tempfile
import zipfile
from collections import OrderedDict, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from valkyrie_io import IniFile  # noqa: E402

PACK_NAMES = {
    "MoMBase": ("Juego base (MAD20)", "Las Mansiones de la Locura 2ª ed."),
    "BtT": ("Beyond the Threshold (MAD23)", "Más Allá del Umbral"),
    "SoA": ("Streets of Arkham (MAD25)", "Calles de Arkham"),
    "SoT": ("Sanctum of Twilight (MAD26)", "El Santuario del Crepúsculo"),
    "HJ": ("Horrific Journeys (MAD27)", "Viajes Escalofriantes"),
    "PotS": ("Path of the Serpent (MAD28)", "La Senda de la Serpiente"),
    "RN": ("Recurring Nightmares (MAD21)", "Pesadillas Recurrentes"),
    "SM": ("Suppressed Memories (MAD22)", "Recuerdos Reprimidos"),
    "MoM1CK": ("Kit de conversión: fichas y objetos", "Kit de conversión"),
    "MoM1ET": ("1ª ed. base: losetas", "1ª ed.: losetas"),
    "MoM1EI": ("1ª ed. base: investigadores", "1ª ed.: investigadores"),
    "MoM1EM": ("1ª ed. base: monstruos", "1ª ed.: monstruos"),
    "FAT": ("Forbidden Alchemy: losetas", "Alquimia Prohibida: losetas"),
    "FAI": ("Forbidden Alchemy: investigadores", "Alquimia Prohibida: investigadores"),
    "FAM": ("Forbidden Alchemy: monstruos", "Alquimia Prohibida: monstruos"),
    "CotWT": ("Call of the Wild: losetas", "La Llamada de lo Salvaje: losetas"),
    "CotWI": ("Call of the Wild: investigadores", "La Llamada de lo Salvaje: investigadores"),
    "CotWM": ("Call of the Wild: monstruos", "La Llamada de lo Salvaje: monstruos"),
    "TLE": ("Lost Expeditions (community pack)", "Expediciones perdidas (pack de la comunidad)"),
}

# Nombres en español de los monstruos. "oficial" = Guía de referencia / FFG España.
MONSTER_ES = {
    "MonsterCultist": ("Sectario", True), "MonsterDeepOne": ("Profundo", True),
    "MonsterDeepOneHybrid": ("Híbrido de profundo", True), "MonsterGhost": ("Fantasma", True),
    "MonsterHuntingHorror": ("Horrendo cazador", True), "MonsterRiot": ("Turba", True),
    "MonsterStarSpawn": ("Semilla estelar", True), "MonsterChildOfDagon": ("Hijo de Dagón", True),
    "MonsterPriestOfDagon": ("Sacerdote de Dagón", True), "MonsterWraith": ("Alma en pena", True),
    "MonsterThrall": ("Subyugado", True),
    "MonsterZombie": ("Zombi", False), "MonsterCthonian": ("Chthoniano", False),
    "MonsterHoundOfTindalos": ("Perro de Tíndalos", False), "MonsterManiac": ("Maníaco", False),
    "MonsterMiGo": ("Mi-Go", False), "MonsterShoggoth": ("Shoggoth", False), "MonsterWitch": ("Bruja", False),
    "MonsterCultLeader": ("Líder de la secta", False), "MonsterByakhee": ("Byakhee", False),
    "MonsterCrawlingOne": ("Reptante", False), "MonsterChildOfTheGoat": ("Hijo de la Cabra", False),
    "MonsterDarkDruid": ("Druida oscuro", False), "MonsterDarkYoung": ("Retoño oscuro", False),
    "MonsterGoatSpawn": ("Engendro cabrío", False), "MonsterNightgaunt": ("Ángel descarnado", False),
    "MonsterDunwichHorror": ("Horror de Dunwich", False), "MonsterWizard": ("Brujo", False),
    "MonsterSkeleton": ("Esqueleto", False), "MonsterHiredGun": ("Pistolero a sueldo", False),
    "MonsterLloigor": ("Lloigor", False), "MonsterStarVampire": ("Vampiro estelar", False),
    "MonsterWarlock": ("Hechicero", False), "MonsterDimensionalShambler": ("Vagabundo dimensional", False),
    "MonsterHuntingDeepOne": ("Profundo cazador", False), "MonsterFormlessSpawn": ("Engendro informe", False),
    "MonsterFeatheredSerpent": ("Serpiente emplumada", False), "MonsterTempleGuardian": ("Guardián del templo", False),
    "MonsterSerpentPerson": ("Hombre serpiente", False), "MonsterAncientBasilisk": ("Basilisco ancestral", False),
}


def nice_from_key(name_value: str, section: str, prefixes) -> str:
    m = re.match(r"\{\w+:([A-Za-z0-9_]+)\}", name_value or "")
    if m:
        k = m.group(1)
        for p in prefixes:
            if k.startswith(p):
                k = k[len(p):]
        k = re.sub(r"_MAD\d+$", "", k)
        return " ".join(w.capitalize() if not w.isdigit() else w for w in k.split("_"))
    s = section
    for p in prefixes:
        if s.startswith(p):
            s = s[len(p):]
    return re.sub(r"(?<=[a-z])(?=[A-Z0-9])", " ", s)


def pack_of(folder_rel: str, packs_by_folder) -> str:
    parts = folder_rel.split("/")
    for i in range(len(parts), 0, -1):
        key = "/".join(parts[:i])
        if key in packs_by_folder:
            return packs_by_folder[key]
    return "?"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("valkyrie")
    ap.add_argument("--packs", help="carpeta con los packs de la comunidad: descomprimidos o .valkyrieContentPack")
    ap.add_argument("--geometria", default=os.path.join(SKILL, "assets", "geometria_losetas.json"))
    ap.add_argument("--json", default=os.path.join(SKILL, "assets", "catalogo.json"))
    ap.add_argument("--md", default=os.path.join(SKILL, "references", "catalogo.md"))
    a = ap.parse_args()

    base = os.path.join(a.valkyrie, "unity", "Assets", "StreamingAssets", "content", "MoM")
    if not os.path.isdir(base):
        sys.exit(f"No encuentro {base}")
    geo = json.load(open(a.geometria, encoding="utf-8")) if os.path.exists(a.geometria) else {}

    packs_by_folder = {}
    packs = OrderedDict()
    for cp in sorted(glob.glob(os.path.join(base, "**", "content_pack.ini"), recursive=True)):
        rel = os.path.relpath(os.path.dirname(cp), base).replace("\\", "/")
        ini = IniFile.read(cp)
        info = ini.sections.get("ContentPack", {})
        pid = info.get("id", rel)
        packs_by_folder[rel] = pid
        packs[pid] = {"id": pid, "folder": rel, "type": info.get("type", ""),
                      "clone": info.get("clone", "").split(),
                      "en": PACK_NAMES.get(pid, (pid, pid))[0], "es": PACK_NAMES.get(pid, (pid, pid))[1],
                      "comunidad": False}

    cat = OrderedDict((k, OrderedDict()) for k in
                      ["tiles", "monsters", "items", "investigators", "tokens", "images", "audio",
                       "puzzles", "attacks", "mythos_vars"])
    counts = defaultdict(lambda: defaultdict(int))     # monster -> evade/horror/activation counts
    attack_matrix = defaultdict(set)
    mythos_vars = defaultdict(int)
    activation_ids = []                                 # activaciones oficiales reutilizables (activation=X)
    ffg_keys = set()                                    # claves {ffg:...} que usa Valkyrie (para validar)

    def put(table, sec, entry):
        """Como ContentData.AddContent: vale la primera definición; otro pack que lo define va en "tambien"."""
        known = cat[table].get(sec)
        if known is None:
            cat[table][sec] = entry
        elif entry["pack"] != known["pack"] and entry["pack"] not in known.get("tambien", []):
            known.setdefault("tambien", []).append(entry["pack"])

    def read_file(path, pid):
        fname = os.path.basename(path)
        ini = IniFile.read(path)
        for sec, kv in ini.sections.items():
            for v in kv.values():
                ffg_keys.update(re.findall(r"\{ffg:([A-Za-z0-9_]+)", v))
            traits = kv.get("traits", "").split()
            if sec.startswith("TileSide"):
                g = geo.get(sec)
                size = None
                if g:
                    size = [g["w"], g["h"]]
                elif "small" in traits:
                    size = [7.0, 3.5]
                elif "medium" in traits:
                    size = [7.0, 7.0]
                elif "big" in traits:
                    size = [10.5, 7.0]
                put("tiles", sec, {"pack": pid, "name": kv.get("name", ""),
                                   "en": nice_from_key(kv.get("name", ""), sec, ["TILE_", "TileSide"]),
                                   "traits": traits, "reverse": kv.get("reverse", ""), "size": size,
                                   "geometry": bool(g),
                                   "desc": g.get("desc", "") if g else ""})
            elif sec.startswith("MonsterActivation"):
                activation_ids.append(sec[len("MonsterActivation"):])
            elif sec.startswith("Monster"):
                es = MONSTER_ES.get(sec)
                put("monsters", sec, {"pack": pid, "name": kv.get("name", ""),
                                      "en": nice_from_key(kv.get("name", ""), sec, ["UNIQUE_MONSTER_", "MONSTER_", "Monster"]),
                                      "es": es[0] if es else "", "es_oficial": bool(es and es[1]),
                                      "traits": traits,
                                      "health": float(kv.get("health", 0) or 0),
                                      "healthperhero": float(kv.get("healthperhero", 0) or 0),
                                      "awareness": int(float(kv.get("awareness", 0) or 0)),
                                      "horror": int(float(kv.get("horror", 0) or 0)),
                                      "brawn": int(float(kv.get("brawn", 0) or 0))})
            elif sec.startswith("Item"):
                put("items", sec, {"pack": pid, "name": kv.get("name", ""),
                                   "en": nice_from_key(kv.get("name", ""), sec,
                                                       ["COMMON_ITEM_", "UNIQUE_ITEM_", "SPELL_", "ItemCommon", "ItemUnique", "ItemSpell", "Item"]),
                                   "traits": traits, "unique": sec.startswith("ItemUnique")})
            elif sec.startswith("Hero"):
                put("investigators", sec, {"pack": pid, "name": kv.get("name", ""),
                                           "en": nice_from_key(kv.get("name", ""), sec, ["INVESTIGATOR_", "Hero"]),
                                           "traits": traits, "var": "#" + sec})
            elif sec.startswith("Token"):
                kind = "tablero"
                if "monster" in traits or fname == "tokens_monsters.ini":
                    kind = "monstruo"
                elif fname == "tokens_items.ini" or any(t in traits for t in ("common", "unique", "spell")):
                    kind = "objeto"
                elif re.match(r"Token(White|Grey|Green|Red|Purple|Orange|Blue|Yellow|Pink|Cyan|Brown|Black)(Man|Woman)$", sec):
                    kind = "personaje-generico"
                elif sec in ("TokenDog", "TokenCat"):
                    kind = "personaje"
                elif kv.get("name") or re.match(r"Token[A-Z][a-z]+[A-Z]", sec) and sec not in (
                        "TokenWallInside", "TokenWallOutside", "TokenDoorInside", "TokenDoorOutside",
                        "TokenSecretInside", "TokenSecretOutside", "TokenBarricadeInside",
                        "TokenBarricadeOutside", "TokenWallInsideGreen", "TokenWallOutsideGreen",
                        "TokenTempleDoor", "TokenTempleDoor2", "TokenTempleWall", "TokenTempleWall2"):
                    kind = "personaje"
                put("tokens", sec, {"pack": pid, "kind": kind, "name": kv.get("name", ""), "traits": traits})
            elif sec.startswith("Image"):
                put("images", sec, {"pack": pid, "image": kv.get("image", "")})
            elif sec.startswith("Audio"):
                put("audio", sec, {"pack": pid, "traits": traits})
            elif sec.startswith("Puzzle"):
                img = kv.get("image", "")
                m = re.search(r"(\d)x(\d)", img)
                put("puzzles", sec, {"pack": pid, "image": img, "grid": f"{m.group(1)}x{m.group(2)}" if m else ""})
            elif sec.startswith("Evade"):
                counts["Monster" + kv.get("monster", "")]["evade"] += 1
            elif sec.startswith("Horror") and "monster" in kv:
                counts["Monster" + kv.get("monster", "")]["horror_checks"] += 1
            elif sec.startswith("Attack"):
                attack_matrix[kv.get("attacktype", "")].add(kv.get("target", ""))
            elif sec.startswith("Peril"):
                for item in (kv.get("conditions", "") + " " + kv.get("vartests", "")).split():
                    item = item.split(":", 1)[-1]
                    var = item.split(",")[0]
                    if var.startswith("$mythos") or var.startswith("#") or var == "$fire":
                        mythos_vars[var] += 1
        # activaciones por monstruo
        if fname == "activations.ini":
            for sec in ini.sections:
                m = re.match(r"MonsterActivation([A-Za-z]+?)\d*$", sec)
                if m:
                    counts["Monster" + m.group(1)]["activations"] += 1

    for path in sorted(glob.glob(os.path.join(base, "**", "*.ini"), recursive=True)):
        if os.path.basename(path) == "content_pack.ini":
            continue
        rel = os.path.relpath(os.path.dirname(path), base).replace("\\", "/")
        read_file(path, pack_of(rel, packs_by_folder))

    # packs de la comunidad: los ficheros que lista su content_pack.ini ([ContentPackData])
    if a.packs:
        roots = [a.packs]
        zips = sorted(glob.glob(os.path.join(a.packs, "*.valkyrieContentPack")))
        tmp = None
        if zips:
            tmp = tempfile.TemporaryDirectory(prefix="packs_")
            for z in zips:
                with zipfile.ZipFile(z) as zf:
                    zf.extractall(os.path.join(tmp.name, os.path.splitext(os.path.basename(z))[0]))
            roots.append(tmp.name)
        for root in roots:
            for cp in sorted(glob.glob(os.path.join(root, "**", "content_pack.ini"), recursive=True)):
                pdir = os.path.dirname(cp)
                ini = IniFile.read(cp)
                info = ini.sections.get("ContentPack", {})
                pid = info.get("id", "")
                if not pid or pid in packs or not info.get("type", "").startswith("MoM"):
                    continue
                packs[pid] = {"id": pid, "folder": os.path.relpath(pdir, root).replace("\\", "/"),
                              "type": info.get("type", ""), "clone": info.get("clone", "").split(),
                              "en": PACK_NAMES.get(pid, (pid, pid))[0], "es": PACK_NAMES.get(pid, (pid, pid))[1],
                              "comunidad": True}
                for f in ini.sections.get("ContentPackData", {}):
                    path = os.path.join(pdir, f.replace("\\", "/"))
                    if f and os.path.exists(path):
                        read_file(path, pid)

    for mid, c in counts.items():
        if mid in cat["monsters"]:
            cat["monsters"][mid].update({k: v for k, v in c.items()})
    cat["attacks"] = {k: sorted(v) for k, v in sorted(attack_matrix.items())}
    cat["mythos_vars"] = dict(sorted(mythos_vars.items(), key=lambda kv: -kv[1]))
    cat["activation_ids"] = sorted(activation_ids)
    cat["ffg_keys"] = sorted(ffg_keys)
    source = "Valkyrie " + os.path.basename(os.path.abspath(a.valkyrie))
    if a.packs:
        source += " + " + os.path.basename(os.path.abspath(a.packs))
    out = OrderedDict([("generado_desde", source), ("packs", packs)])
    out.update(cat)
    os.makedirs(os.path.dirname(a.json), exist_ok=True)
    with open(a.json, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
    write_md(out, a.md)
    print(f"Catálogo: {', '.join(f'{k}={len(v)}' for k, v in out.items() if isinstance(v, (dict, list)))}")
    print(f"  -> {a.json}\n  -> {a.md}")


def fmt_size(s):
    if not s:
        return "?"
    w, h = s
    return f"{w:g}×{h:g}"


def openings_summary(geo_entry):
    if not geo_entry:
        return ""
    parts = []
    for side in "NESW":
        segs = geo_entry.get(side, [])
        if not segs:
            continue
        txt = ",".join(("P" if s["kind"] == "door" else "A") + f"{(s['frm'] + s['to']) / 2:.2f}" if s["kind"] == "door"
                       else f"A{s['frm']:g}-{s['to']:g}" for s in segs)
        parts.append(f"{side}:{txt}")
    return " ".join(parts)


def write_md(cat, path):
    geo_path = os.path.join(SKILL, "assets", "geometria_losetas.json")
    geo = json.load(open(geo_path, encoding="utf-8")) if os.path.exists(geo_path) else {}
    L = []
    L.append("# Catálogo de componentes de Valkyrie para Mansiones de la Locura\n")
    L.append("Generado automáticamente por `scripts/construir_catalogo.py` a partir de los content packs de "
             "Valkyrie (`unity/Assets/StreamingAssets/content/MoM`). Para buscar rápido usa "
             "`python scripts/buscar.py <texto>`.\n")
    L.append("Los nombres visibles (`{ffg:...}`) se importan de la app oficial: en los textos usa "
             "`{c:TileX}`, `{c:SpawnX}`, `{c:QItemX}` o `{type}` para que Valkyrie muestre el nombre oficial "
             "en el idioma del jugador. Las columnas 'EN' son nombres derivados de la clave, solo orientativos.\n")
    L.append("## Índice\n\n1. [Packs (expansiones)](#packs-expansiones)\n2. [Losetas (TileSide)](#losetas-tileside)\n"
             "3. [Monstruos](#monstruos)\n4. [Objetos](#objetos)\n5. [Investigadores](#investigadores)\n"
             "6. [Fichas (Token)](#fichas-token)\n7. [Imágenes para UI](#imágenes-para-ui)\n8. [Audio](#audio)\n"
             "9. [Imágenes de puzle](#imágenes-de-puzle)\n10. [Tipos de ataque y categorías](#tipos-de-ataque-y-categorías)\n"
             "11. [Variables de Mitos](#variables-de-mitos)\n"
             "12. [Activaciones oficiales](#activaciones-oficiales)\n")
    L.append("## Packs (expansiones)\n")
    L.append("| ID (`packs=`) | Producto | Nombre en español | Tipo | Activa también |\n|---|---|---|---|---|")
    for p in cat["packs"].values():
        L.append(f"| `{p['id']}` | {p['en']} | {p['es']} | {p['type']} | {' '.join(p['clone'])} |")
    L.append("\nLos de tipo `MoMCustom` son packs de la comunidad: el jugador los baja en Mi colección (Descarga de "
             "contenidos) y el escenario los pide en `packs=` como una expansión. De ellos el catálogo solo guarda "
             "identificadores y datos.\n")
    L.append("\nEn `packs=` usa los IDs desglosados del kit de conversión (`MoM1ET`, `CotWM`...) en vez de `RN`/`SM`, "
             "para que el escenario funcione tanto con la colección de figuras como con la 1ª edición física. "
             "`MoMBase` no hace falta ponerlo.\n")
    L.append("## Losetas (TileSide)\n")
    L.append("Tamaño en unidades de Valkyrie (1 espacio de MoM ≈ 3,5 unidades) a rotación 0. Aberturas: lado "
             "N/E/S/O, `P`=puerta (centro medido desde el extremo oeste en N/S y desde el norte en E/O), "
             "`A`=borde abierto (tramo). Datos de geometría de ValkyrieMCP (MIT); `?` = sin geometría "
             "(1ª edición). Qué hay dibujado en cada cara (zonas y objetos, en español): "
             "`python scripts/losetas.py ver <TileSide>`; buscar caras por lo que tienen: "
             "`python scripts/losetas.py buscar <palabras>`.\n")
    by_pack = defaultdict(list)
    for tid, t in cat["tiles"].items():
        by_pack[t["pack"]].append((tid, t))
    for pid, rows in by_pack.items():
        L.append(f"\n### {cat['packs'].get(pid, {}).get('en', pid)} (`{pid}`)\n")
        L.append("| ID | EN | Tamaño | Rasgos | Reverso | Aberturas | Descripción |\n|---|---|---|---|---|---|---|")
        for tid, t in rows:
            g = geo.get(tid)
            tambien = f" (también en {' '.join(t['tambien'])})" if t.get("tambien") else ""
            L.append(f"| `{tid}` | {t['en']}{tambien} | {fmt_size(t['size'])} | {' '.join(t['traits'])} | "
                     f"{t['reverse'].replace('TileSide', '') if t['reverse'] else ''} | {openings_summary(g)} | "
                     f"{t.get('desc', '')} |")
    L.append("\n## Monstruos\n")
    L.append("Vida = `health` + `healthperhero` × investigadores. Per./Hor./Agr. = Percepción, Horror, Agresividad. "
             "Act/Ev/HC = nº de textos de activación, evasión y tirada de Horror que trae Valkyrie (0 = el monstruo "
             "no tiene textos genéricos: usa un CustomMonster con eventos propios).\n")
    L.append("| ID | EN | Español | Pack | Rasgos | Vida | Per. | Hor. | Agr. | Act | Ev | HC |\n"
             "|---|---|---|---|---|---|---|---|---|---|---|---|")
    for mid, m in cat["monsters"].items():
        es = m["es"] + ("" if m["es_oficial"] or not m["es"] else " (?)")
        L.append(f"| `{mid}` | {m['en']} | {es} | {m['pack']} | {' '.join(m['traits'])} | "
                 f"{m['health']:g}+{m['healthperhero']:g} | {m['awareness']} | {m['horror']} | {m['brawn']} | "
                 f"{m.get('activations', 0)} | {m.get('evade', 0)} | {m.get('horror_checks', 0)} |")
    L.append("\n## Objetos\n")
    L.append("Rasgos útiles para `QItem traits=`/`traitpool=`: `common`, `unique`, `weapon`, `firearm`, "
             "`heavyweapon`, `bladedweapon`, `spell`, `spellattack`, `spelldefence`, `lightsource`, `tome`, "
             "`equipment`, `evidence`, `key`, `ally`, `relic`, `elixir`.\n")
    by_pack = defaultdict(list)
    for iid, it in cat["items"].items():
        by_pack[it["pack"]].append((iid, it))
    for pid, rows in by_pack.items():
        L.append(f"\n### {cat['packs'].get(pid, {}).get('en', pid)} (`{pid}`)\n")
        L.append("| ID | EN | Rasgos |\n|---|---|---|")
        for iid, it in rows:
            tambien = f" (también en {' '.join(it['tambien'])})" if it.get("tambien") else ""
            L.append(f"| `{iid}` | {it['en']}{tambien} | {' '.join(it['traits'])} |")
    L.append("\n## Investigadores\n")
    L.append("La variable `#Hero...` vale 1 si ese investigador juega (p. ej. `#HeroAgathaCrane`). "
             "En textos: `{ffg:INVESTIGATOR_AGATHA_CRANE}` da su nombre oficial.\n")
    L.append("| ID / variable | EN | Pack | Rasgos |\n|---|---|---|---|")
    for hid, h in cat["investigators"].items():
        L.append(f"| `{hid}` | {h['en']} | {h['pack']} | {' '.join(h['traits'])} |")
    L.append("\n## Fichas (Token)\n")
    L.append("Valor de `type=` en un componente Token. También se puede usar el ID de un monstruo "
             "(`type=MonsterCultist`) para mostrar su imagen como ficha.\n")
    by_kind = defaultdict(list)
    for tid, t in cat["tokens"].items():
        by_kind[t["kind"]].append((tid, t))
    for kind in ["tablero", "personaje-generico", "personaje", "monstruo", "objeto"]:
        rows = by_kind.get(kind, [])
        if not rows:
            continue
        L.append(f"\n### {kind} ({len(rows)})\n")
        L.append(", ".join(f"`{tid}` ({t['pack']})" for tid, t in rows))
    L.append("\n\n## Imágenes para UI\n")
    L.append("Valores de `image=` en un componente UI (o una ruta a un .png/.jpg propio).\n")
    L.append(", ".join(f"`{k}`" for k in cat["images"]))
    L.append("\n\n## Audio\n")
    L.append("Valores de `audio=`/`music=` (o una ruta a un .ogg propio). Rasgo `music` = pista larga.\n")
    L.append(", ".join(f"`{k}`" + (" (música)" if "music" in v["traits"] else "") for k, v in cat["audio"].items()))
    L.append("\n\n## Imágenes de puzle\n")
    L.append("Valores de `image=` para `class=image` (rejilla recomendada entre paréntesis: úsala en "
             "`puzzlelevel`×`puzzlealtlevel`).\n")
    L.append(", ".join(f"`{k}` ({v['grid']})" if v["grid"] else f"`{k}`" for k, v in cat["puzzles"].items()))
    L.append("\n\n## Tipos de ataque y categorías\n")
    L.append("Tipo de ataque del investigador → categorías de monstruo (rasgo) con textos. Un CustomMonster sin "
             "`base` ni rasgos de categoría no ofrece opciones de ataque.\n")
    L.append("| Tipo (`attacks=` de CustomMonster) | Categorías |\n|---|---|")
    for k, v in cat["attacks"].items():
        L.append(f"| `{k}` | {', '.join(v)} |")
    L.append("\n## Variables de Mitos\n")
    L.append("Variables que activan grupos de eventos de Mitos genéricos (nº de eventos que las usan). "
             "Pon a 1 una de intensidad (`$mythosMinor`...) y, opcionalmente, de lugar.\n")
    L.append(", ".join(f"`{k}` ({v})" for k, v in cat["mythos_vars"].items() if k != "$mythosUnfinished"))
    L.append("\n`#SoA`, `#BtT`, `#SoT` aparecen porque hay eventos de Mitos que solo salen si esa expansión está "
             "activa. Evita llamar a una variable propia `mythosUnfinished`: Valkyrie la usa para desactivar "
             "eventos de Mitos sin terminar.")
    L.append("\n## Activaciones oficiales\n")
    L.append("Activaciones `MonsterActivationX` de los content packs (textos oficiales ya traducidos). Un "
             "CustomMonster las reutiliza con `activation=X Y…` (sin el prefijo `MonsterActivation`), y Valkyrie "
             "elige una al azar en cada activación. Rangos por monstruo:\n")
    grupos = OrderedDict()
    for aid in cat.get("activation_ids", []):
        m = re.match(r"^(.*?)(\d+)$", aid)
        base, num = (m.group(1), m.group(2)) if m else (aid, "")
        grupos.setdefault(base, []).append(num)
    filas = []
    for base, nums in grupos.items():
        nums_ok = [x for x in nums if x]
        sueltas = [f"`{base}`"] if "" in nums else []
        if len(nums_ok) == 1:
            sueltas.append(f"`{base}{nums_ok[0]}`")
        elif nums_ok:
            sueltas.append(f"`{base}{nums_ok[0]}`…`{base}{nums_ok[-1]}` ({len(nums_ok)})")
        filas.append(" y ".join(sueltas))
    L.append(", ".join(filas))
    L.append("")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(L))


if __name__ == "__main__":
    main()
