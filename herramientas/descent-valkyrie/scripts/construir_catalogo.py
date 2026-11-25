#!/usr/bin/env python3
"""
construir_catalogo.py - Regenera el catálogo de componentes de Descent 2ª ed. para Valkyrie a partir
de un clon del repositorio de Valkyrie (https://github.com/NPBruce/valkyrie) y, si se quiere, de los
packs de la comunidad descomprimidos (DooM, D1ED, SOTP).

Uso:
    python construir_catalogo.py <clon de Valkyrie> [--packs <carpeta con packs de la comunidad>]
                                 [--nombres <nombres_oficiales.json>]
                                 [--json assets/catalogo.json] [--md references/catalogo.md]

Lee unity/Assets/StreamingAssets/content/D2E/**/content_pack.ini y los .ini que lista (losetas, héroes,
clases, habilidades, objetos, monstruos, activaciones, fichas, imágenes, audio, peligros y viajes) y
produce:
  * assets/catalogo.json  (para validar.py, buscar.py, mapa.py y nuevo_escenario.py)
  * references/catalogo.md (tablas legibles)

Los nombres visibles de Descent vienen de la app oficial importada ({ffg:CLAVE}). El nombre inglés de
las tablas se deduce de la clave; el español, de --nombres (generado con nombres_oficiales.py a partir
de la importación del usuario) o, para los monstruos, del uso de la comunidad (marcado con «?»).
De los packs de la comunidad solo se guardan identificadores y datos, nunca sus textos.
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

# Orden de ContentLoader.CONTENT_TYPE_LOADERS: el primer prefijo que encaja gana
PREFIXES = ["PackType", "TileSide", "Hero", "Class", "Skill", "Item", "MonsterActivation", "Monster",
            "Attack", "Evade", "Horror", "Token", "Peril", "Puzzle", "Image", "Audio"]

PRODUCTS = {
    # id de Valkyrie: (código, nombre inglés, nombre español, fuente del español)
    "D2EBase": ("DJ01", "Descent: Journeys in the Dark (Second Edition)", "Descent: Viaje a las Tinieblas (Segunda Edición)", True),
    "LotW": ("DJ03", "Lair of the Wyrm", "La Guarida de la Sierpe", True),
    "LoR": ("DJ04", "Labyrinth of Ruin", "Laberinto de Perdición", True),
    "TT": ("DJ05", "The Trollfens", "La Ciénaga del Troll", False),
    "SoN": ("DJ07", "Shadow of Nerekhall", "La Sombra de Nerekhall", True),
    "MoR": ("DJ21", "Manor of Ravens", "La Mansión de los Cuervos", False),
    "MoB": ("DJ40", "Mists of Bilehall", "Las Brumas de Castrohiel", False),
    "TCTR": ("DJ44", "The Chains That Rust", "Las Cadenas del Óxido", False),
    "LL": ("DJ45", "Lost Legends", "Leyendas Perdidas", True),
    "OotO": ("DJ26", "Oath of the Outcast", "El Juramento de la Exiliada", True),
    "CoD": ("DJ27", "Crown of Destiny", "La Corona del Destino", False),
    "CotF": ("DJ28", "Crusade of the Forgotten", "La Cruzada de los Olvidados", True),
    "GoD": ("DJ29", "Guardians of Deephall", "Guardianes de la Fortaleza Interior", False),
    "VoD": ("DJ30", "Visions of Dawn", "Visiones del Amanecer", False),
    "BotW": ("DJ31", "Bonds of the Wild", "Vínculos de la Naturaleza", False),
    "ToC": ("DJ32", "Treaty of Champions", "El Tratado de los Campeones", True),
    "SotS": ("DJ33", "Stewards of the Secret", "Senescales del Secreto", True),
    "SoE": ("DJ34", "Shards of Everdark", "Esquirlas de Sombra Eterna", False),
    "CKD1E": ("DJ02", "Conversion Kit: Descent 1st ed. base", "Kit de conversión: 1ª ed.", False),
    "CKWoD": ("DJ02", "Conversion Kit: Well of Darkness", "Kit de conversión: El Pozo de las Tinieblas", False),
    "CKAoD": ("DJ02", "Conversion Kit: Altar of Despair", "Kit de conversión: El Altar de la Desesperación", False),
    "CKToI": ("DJ02", "Conversion Kit: Tomb of Ice", "Kit de conversión: Tumba de Hielo", False),
    "CKDQ": ("DJ02", "Conversion Kit: DungeonQuest heroes", "Kit de conversión: héroes de DungeonQuest", False),
    "CKPromo": ("DJ02", "Conversion Kit: promotional heroes", "Kit de conversión: héroes promocionales", False),
    "DooM": ("—", "DooM 2016 (community pack)", "DooM 2016 (pack de la comunidad)", True),
    "D1ED": ("—", "Descent 1st edition tiles (community pack)", "Losetas de Descent 1ª ed. (pack de la comunidad)", True),
    "SOTP": ("—", "Sands of the Past (community pack)", "Sands of the Past (pack de la comunidad)", True),
}
LIEUTENANT_PACKS = {"DJ09": "Splig", "DJ10": "Belthir", "DJ11": "Baron Zachareth", "DJ12": "Sir Alric Farrow",
                    "DJ13": "Lord Merick Farrow", "DJ14": "Lady Eliza Farrow", "DJ15": "Valyndra",
                    "DJ16": "Raythen", "DJ17": "Serena", "DJ18": "Ariad", "DJ19": "Queen Ariad",
                    "DJ20": "Bol'Goreth", "DJ22": "Rylan Olliven", "DJ23": "Verminous",
                    "DJ24": "Tristayne Olliven", "DJ25": "Gargan Mirklace", "DJ35": "Skarn",
                    "DJ41": "Kyndrithul", "DJ42": "Zarihell", "DJ43": "Ardus Ix'Erebus"}

# Nombres en español que usa la comunidad hispana (traducciones de la tienda de Valkyrie): sin confirmar.
MONSTER_ES = {
    "MonsterZombie": "Zombi", "MonsterGoblinArcher": "Arquero goblin", "MonsterCaveSpider": "Araña de las cavernas",
    "MonsterFleshMoulder": "Moldeador de carne", "MonsterBarghest": "Barghest", "MonsterEttin": "Ettin",
    "MonsterElemental": "Elemental", "MonsterMerriod": "Merriod", "MonsterShadowDragon": "Dragón de las sombras",
    "MonsterFireImp": "Diablillo de fuego", "MonsterHybridSentinel": "Centinela híbrido",
    "MonsterGoblinWitcher": "Brujo goblin", "MonsterVolucrixReaver": "Segador volucrix",
    "MonsterCarrionDrake": "Draco carroñero", "MonsterArachyura": "Arachyura", "MonsterHarpy": "Arpía",
    "MonsterPlagueWorm": "Gusano de plaga", "MonsterRatSwarm": "Enjambre de ratas", "MonsterChangeling": "Cambiante",
    "MonsterYnfernaelHulk": "Mole del Ynfernael", "MonsterBandit": "Bandido", "MonsterWraith": "Espectro",
    "MonsterBoneHorror": "Horror óseo", "MonsterReanimate": "Reanimado", "MonsterBroodwalker": "Caminante de progenie",
    "MonsterTheDispossessed": "Desposeído", "MonsterShamblingColossus": "Coloso tambaleante",
    "MonsterRazorwing": "Alacortante", "MonsterBeastmen": "Hombre bestia", "MonsterBaneSpider": "Araña ponzoñosa",
    "MonsterChaosBeast": "Bestia del caos", "MonsterGiant": "Gigante", "MonsterLavaBeetle": "Escarabajo de lava",
    "MonsterSorcerer": "Hechicero", "MonsterMedusa": "Medusa", "MonsterGolem": "Gólem",
    "MonsterDarkPriest": "Sacerdote oscuro", "MonsterCryptDragon": "Dragón de la cripta", "MonsterWendigo": "Wendigo",
    "MonsterTroll": "Troll", "MonsterOgre": "Ogro", "MonsterHellhound": "Sabueso infernal", "MonsterKobold": "Kobold",
    "MonsterSkeletonArcher": "Arquero esqueleto", "MonsterDemonLord": "Señor demonio", "MonsterCrowHag": "Bruja cuervo",
    "MonsterNaga": "Naga", "MonsterFerrox": "Ferrox", "MonsterIceWyrm": "Sierpe de hielo", "MonsterShade": "Sombra",
    "MonsterDarkMinotaur": "Minotauro oscuro", "MonsterBloodApe": "Simio de sangre", "MonsterDeepElf": "Elfo del abismo",
    "MonsterManticore": "Mantícora", "MonsterIronbound": "Ironbound", "MonsterMarrowPriest": "Sacerdote de la médula",
    "MonsterVolucrix": "Volucrix",
}
SIZES = ("small", "medium", "huge", "massive")
SIZE_SQUARES = {"small": "1×1", "medium": "1×2", "huge": "2×2", "massive": "2×3"}
ENV_TRAITS = {"building", "cave", "civilized", "cursed", "dark", "hot", "cold", "mountain", "water", "wilderness"}
FAME = ["", "insignificant", "noteworthy", "impressive", "celebrated", "heroic", "legendary"]
SMALL_WORDS = {"the", "of", "and", "a", "an", "to", "in", "on", "at", "for", "from", "with"}
FFG_RE = re.compile(r"\{ffg:([A-Za-z0-9_]+)")


def ptype(section):
    for p in PREFIXES:
        if section.startswith(p):
            return p
    return None


def en_from_key(key, strip=()):
    k = key
    for s in strip:
        k = re.sub(s, "", k)
    words = [w for w in k.split("_") if w]
    out = []
    for i, w in enumerate(words):
        lw = w.lower()
        out.append(lw if (i > 0 and lw in SMALL_WORDS) else lw.capitalize())
    return " ".join(out)


def split_camel(s):
    s = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", s)
    s = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1 \2", s)
    s = re.sub(r"\b([A-Z][a-z]{3,}?)(of|the)\b", r"\1 \2", s)      # SleightofHand -> Sleight of Hand
    return s.replace("Earthand", "Earth and").replace("_", " ").strip()


def name_of(kv, section, prefix, key_strip=()):
    raw = kv.get("name", "")
    m = FFG_RE.match(raw) if raw else None
    if m:
        return m.group(1), en_from_key(m.group(1), key_strip)
    if raw and not raw.startswith("{"):
        return "", raw.strip('"')
    return "", split_camel(section[len(prefix):])


def find_packs(root):
    return sorted(os.path.dirname(p) for p in glob.glob(os.path.join(root, "**", "content_pack.ini"), recursive=True))


def read_pack(pdir):
    cp = os.path.join(pdir, "content_pack.ini")
    ini = IniFile.read(cp)
    head = ini.sections.get("ContentPack", {})
    files = [cp] + [os.path.join(pdir, f) for f in ini.sections.get("ContentPackData", {}) if f
                    and os.path.exists(os.path.join(pdir, f))]
    return head, files


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("valkyrie", help="clon de https://github.com/NPBruce/valkyrie")
    ap.add_argument("--packs", help="carpeta con los packs de la comunidad: descomprimidos o .valkyrieContentPack")
    ap.add_argument("--nombres", help="nombres_oficiales.json (de nombres_oficiales.py)")
    ap.add_argument("--json", default=os.path.join(SKILL, "assets", "catalogo.json"))
    ap.add_argument("--md", default=os.path.join(SKILL, "references", "catalogo.md"))
    ap.add_argument("--losetas", default=os.path.join(SKILL, "assets", "losetas.json"))
    a = ap.parse_args()

    content = os.path.join(a.valkyrie, "unity", "Assets", "StreamingAssets", "content", "D2E")
    if not os.path.isdir(content):
        sys.exit(f"No encuentro {content}")
    official, official_en = {}, {}
    if a.nombres and os.path.exists(a.nombres):
        names = json.load(open(a.nombres, encoding="utf-8"))
        official, official_en = names.get("nombres", {}), names.get("nombres_en", {})
    losetas = {}
    if os.path.exists(a.losetas):
        losetas = json.load(open(a.losetas, encoding="utf-8"))["losetas"]

    # Orden: base, cajas, colecciones H&M, lugartenientes y kit de conversión; así una reedición de la 2ª
    # edición (H&M) figura como su pack, y el kit como "tambien"
    order = {"base": 0, "boxed": 1, "h&m": 2, "lt": 3, "ck": 4}
    dirs = [(d, False, content) for d in sorted(find_packs(content), key=lambda d: (
        order.get(os.path.relpath(d, content).replace("\\", "/").split("/")[0], 9), d))]
    if a.packs:
        dirs += [(d, True, a.packs) for d in find_packs(a.packs)]
        zips = sorted(glob.glob(os.path.join(a.packs, "*.valkyrieContentPack")))
        if zips:                        # los packs tal como los descarga Valkyrie: se leen descomprimidos aparte
            tmp = tempfile.TemporaryDirectory(prefix="packs_")
            for z in zips:
                with zipfile.ZipFile(z) as zf:
                    zf.extractall(os.path.join(tmp.name, os.path.splitext(os.path.basename(z))[0]))
            dirs += [(d, True, tmp.name) for d in find_packs(tmp.name)]

    cat = OrderedDict((k, OrderedDict()) for k in (
        "packs", "tiles", "heroes", "classes", "skills", "items", "monsters", "activations", "tokens",
        "images", "audio", "perils"))
    ffg_keys = set()
    seen = set()
    for pdir, community, root in dirs:
        head, files = read_pack(pdir)
        pid = head.get("id", "")
        if not pid:
            continue
        if pid in cat["packs"]:
            continue
        code, en, es, es_ok = PRODUCTS.get(pid, (pid, "", "", False))
        if pid in LIEUTENANT_PACKS:
            code, en, es, es_ok = pid, f"Lieutenant Pack: {LIEUTENANT_PACKS[pid]}", \
                f"Lugarteniente {LIEUTENANT_PACKS[pid]}", True
        m = FFG_RE.match(head.get("name", ""))
        if m:
            ffg_keys.add(m.group(1))
        cat["packs"][pid] = OrderedDict(
            tipo=head.get("type", ""), producto=code, en=en, es=es, es_oficial=es_ok, comunidad=community,
            carpeta=os.path.relpath(pdir, root).replace("\\", "/"),
            clon=head.get("clone", "").split())
        for f in files:
            ini = IniFile.read(f)
            for sec, kv in ini.sections.items():
                for v in kv.values():
                    ffg_keys.update(FFG_RE.findall(v))
                t = ptype(sec)
                if t is None or sec in ("ContentPack", "ContentPackData", "LanguageData") or t == "PackType":
                    continue
                if (t, sec) in seen:
                    # mismo componente en otro pack: Valkyrie lo apunta a los dos y vale el primero
                    tab = {"TileSide": "tiles", "Hero": "heroes", "Class": "classes", "Skill": "skills",
                           "Item": "items", "MonsterActivation": "activations", "Monster": "monsters",
                           "Token": "tokens", "Image": "images", "Audio": "audio", "Peril": "perils"}.get(t)
                    if tab and sec in cat[tab]:
                        cat[tab][sec].setdefault("tambien", []).append(pid)
                    continue
                seen.add((t, sec))
                traits = kv.get("traits", "").split()
                if t == "TileSide":
                    lo = losetas.get(sec, {})
                    filas = lo.get("filas", [])
                    cat["tiles"][sec] = OrderedDict(
                        pack=pid, nombre=kv.get("name", sec[8:]).strip('"'), rasgos=traits,
                        reverso=kv.get("reverse", ""),
                        casillas=sum(r.count("#") for r in filas),
                        ancho=max((len(r) for r in filas), default=0), alto=len(filas))
                elif t == "Hero":
                    key, en_ = name_of(kv, sec, "Hero")
                    cat["heroes"][sec] = OrderedDict(pack=pid, ffg=key, en=en_, arquetipo=kv.get("archetype", "warrior"),
                                                     rasgos=traits, var="#" + sec)
                elif t == "Class":
                    key, en_ = name_of(kv, sec, "Class", (r"^CLASS_", r"_NAME$"))
                    cat["classes"][sec] = OrderedDict(pack=pid, ffg=key, en=en_, arquetipo=kv.get("archetype", "warrior"),
                                                      hibrida=kv.get("hybridarchetype", ""),
                                                      objetos=kv.get("items", "").split(), var="#" + sec)
                elif t == "Skill":
                    key, en_ = name_of(kv, sec, "Skill")
                    try:
                        xp = int(kv.get("xp", "0"))
                    except ValueError:
                        xp = 0
                    cat["skills"][sec] = OrderedDict(pack=pid, ffg=key, xp=xp)
                elif t == "Item":
                    key, en_ = name_of(kv, sec, "Item", (r"^ITEM_",))
                    try:
                        price = int(kv.get("price", "0"))
                    except ValueError:
                        price = 0
                    cat["items"][sec] = OrderedDict(pack=pid, ffg=key, en=en_, rasgos=traits, precio=price,
                                                    minfama=kv.get("minfame", ""), maxfama=kv.get("maxfame", ""))
                elif t == "MonsterActivation":
                    cat["activations"][sec] = OrderedDict(
                        pack=pid, jefe=bool(kv.get("master")), esbirro=bool(kv.get("minion")),
                        masterfirst=kv.get("masterfirst", "").lower() == "true",
                        minionfirst=kv.get("minionfirst", "").lower() == "true")
                elif t == "Monster":
                    key, en_ = name_of(kv, sec, "Monster")
                    size = next((s for s in SIZES if s in traits), "small")
                    cat["monsters"][sec] = OrderedDict(
                        pack=pid, ffg=key, en=en_, es=official.get(key, MONSTER_ES.get(sec, "")),
                        es_oficial=key in official, rasgos=traits, tamano=size,
                        lugarteniente="lieutenant" in traits, agente="agent" in traits,
                        activation=kv.get("activation", "").split(),
                        imageplace=bool(kv.get("imageplace")))
                elif t == "Token":
                    cat["tokens"][sec] = OrderedDict(pack=pid, imagen=os.path.basename(kv.get("image", "")))
                elif t == "Image":
                    cat["images"][sec] = OrderedDict(pack=pid, imagen=os.path.basename(kv.get("image", "")))
                elif t == "Audio":
                    cat["audio"][sec] = OrderedDict(pack=pid, rasgos=traits)
                elif t == "Peril":
                    cat["perils"][sec] = OrderedDict(pack=pid, trigger=kv.get("trigger", ""),
                                                     conditions=kv.get("conditions", ""),
                                                     operations=kv.get("operations", ""))

    # habilidades de cada clase: Skill<clase sin "Class"> (SkillWindow)
    for sk, d in cat["skills"].items():
        owner = ""
        for c in cat["classes"]:
            base = c[len("Class"):]
            if sk.startswith("Skill" + base) and len(base) > len(owner):
                owner = base
        d["clase"] = "Class" + owner if owner else ""
        d["en"] = split_camel(sk[len("Skill") + len(owner):]) if owner else split_camel(sk[len("Skill"):])
    # activaciones de cada monstruo: MonsterActivation<tipo> por prefijo + las comunes de activation=
    for mon, d in cat["monsters"].items():
        pref = "MonsterActivation" + mon[len("Monster"):]
        d["propias"] = [x for x in cat["activations"] if x.startswith(pref)]
    # nombres oficiales de lo demás (si los hay)
    for tab in ("heroes", "classes", "items"):
        for d in cat[tab].values():
            if d.get("ffg") in official:
                d["es"] = official[d["ffg"]]
                d["es_oficial"] = True
    for tab in ("monsters", "heroes", "classes", "items"):
        for d in cat[tab].values():
            if d.get("ffg") in official_en:
                d["en"] = official_en[d["ffg"]]
    common = sorted({x for d in cat["monsters"].values() for x in d["activation"]})
    data = OrderedDict(generado_desde="Valkyrie " + os.path.basename(os.path.abspath(a.valkyrie)), **cat,
                       activaciones_comunes=common, ffg_keys=sorted(ffg_keys))
    os.makedirs(os.path.dirname(a.json), exist_ok=True)
    with open(a.json, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=0)
        fh.write("\n")
    write_md(data, a.md)
    print(f"catálogo: {', '.join(f'{k} {len(v)}' for k, v in cat.items())}; {len(ffg_keys)} claves ffg")


def fama(d):
    lo, hi = d.get("minfama", ""), d.get("maxfama", "")
    if not lo and not hi:
        return "—"
    return lo if lo == hi else f"{lo}–{hi}"


def write_md(c, path):
    L = []
    w = L.append
    w("# Catálogo de componentes de Valkyrie para Descent 2ª edición\n")
    w("Generado por `scripts/construir_catalogo.py` a partir de los content packs de Valkyrie "
      "(`unity/Assets/StreamingAssets/content/D2E`) y de los packs de la comunidad (DooM, D1ED, SOTP; solo "
      "identificadores y datos). Para buscar rápido: `python scripts/buscar.py <texto>`.\n")
    w("Los nombres que ve el jugador vienen de la app oficial importada (`{ffg:CLAVE}`), en su idioma. En los textos "
      "usa `{c:SpawnX}`, `{c:QItemX}`, `{c:TileX}` o `{type}` (en un Spawn) para que Valkyrie ponga el nombre "
      "oficial. La columna «EN» se deduce de la clave; «ES» es el nombre que usa la comunidad hispana, marcado con "
      "«?» si no está confirmado como oficial.\n")
    w("## Índice\n")
    for i, t in enumerate(["Packs", "Losetas (TileSide)", "Monstruos y lugartenientes", "Activaciones comunes",
                           "Héroes", "Clases", "Habilidades", "Objetos", "Fichas (Token)", "Imágenes para UI",
                           "Audio", "Peligros y viajes"], 1):
        anchor = t.lower().replace(" ", "-").replace("(", "").replace(")", "")
        w(f"{i}. [{t}](#{anchor})")
    w("")
    # packs
    w("## Packs\n")
    w("`packs=` del `quest.ini`: IDs separados por espacios. `D2EBase` no hace falta. Cada pack activado pone "
      "`#<ID>` a 1 (ramas opcionales sin exigir la expansión).\n")
    w("| ID | Producto | Nombre (EN) | Nombre (ES) | Tipo | Losetas | Héroes | Clases | Monstruos | Objetos |")
    w("|---|---|---|---|---|---|---|---|---|---|")
    cnt = defaultdict(lambda: defaultdict(int))
    for tab in ("tiles", "heroes", "classes", "monsters", "items"):
        for d in c[tab].values():
            cnt[d["pack"]][tab] += 1
    for pid, d in c["packs"].items():
        es = d["es"] + ("" if d["es_oficial"] or not d["es"] else " (?)")
        k = cnt[pid]
        w(f"| `{pid}` | {d['producto']} | {d['en']} | {es} | {d['tipo']} | {k['tiles'] or ''} | {k['heroes'] or ''} | "
          f"{k['classes'] or ''} | {k['monsters'] or ''} | {k['items'] or ''} |")
    w("")
    # tiles
    w("## Losetas (TileSide)\n")
    w("Tamaño en casillas (ancho × alto a rotación 0) y número de casillas dibujadas. La forma exacta y dónde "
      "encajan puertas y fichas: `python scripts/mapa.py --info TileSideX`. Las dos caras de una misma pieza "
      "física (`Reverso`) no se pueden usar a la vez.\n")
    by_pack = defaultdict(list)
    for n, d in c["tiles"].items():
        by_pack[d["pack"]].append((n, d))
    for pid, items in by_pack.items():
        w(f"### {pid}\n")
        w("| ID | Nombre | Tamaño | Casillas | Rasgos | Reverso |")
        w("|---|---|---|---|---|---|")
        for n, d in items:
            w(f"| `{n}` | {d['nombre']} | {d['ancho']}×{d['alto']} | {d['casillas']} | {' '.join(d['rasgos'])} | "
              f"{d['reverso'].replace('TileSide', '')} |")
        w("")
    # monsters
    w("## Monstruos y lugartenientes\n")
    w("Tamaño: `small` 1×1, `medium` 1×2, `huge` 2×2, `massive` 2×3 (decide el marco de cada `MPlace`). Act.: "
      "activaciones propias (`MonsterActivation<Tipo>…`) + comunes (`activation=`). Rasgos de entorno para "
      "`traits=`/`traitpool=` de un Spawn: building cave civilized cursed dark hot cold mountain water wilderness.\n")
    w("| ID | EN | ES | Pack | Tamaño | Ataque | Entorno | Otros | Act. propias | Comunes |")
    w("|---|---|---|---|---|---|---|---|---|---|")
    for n, d in c["monsters"].items():
        r = set(d["rasgos"])
        atk = " ".join(x for x in ("melee", "ranged") if x in r)
        env = " ".join(sorted(r & ENV_TRAITS))
        other = " ".join(sorted(r - ENV_TRAITS - {"melee", "ranged", "monster"} - set(SIZES)))
        es = d["es"] + ("" if d["es_oficial"] or not d["es"] else " (?)")
        w(f"| `{n}` | {d['en']} | {es} | {d['pack']} | {d['tamano']} | {atk} | {env} | {other} | "
          f"{len(d['propias'])} | {' '.join(d['activation'])} |")
    w("")
    w("## Activaciones comunes\n")
    w("Activaciones genéricas que los monstruos citan en `activation=` y que un `CustomMonster` puede reutilizar "
      "(`activation=Brawler1 Range2`). Las propias de un monstruo se reutilizan igual sin el prefijo "
      "(`activation=Zombie1` usa `MonsterActivationZombie1`). J = tiene paso de jefe, E = de esbirro.\n")
    w("| Nombre en `activation=` | J/E | Orden |")
    w("|---|---|---|")
    for x in c["activaciones_comunes"]:
        d = c["activations"].get("MonsterActivation" + x)
        if not d:
            continue
        je = ("J" if d["jefe"] else "") + ("E" if d["esbirro"] else "")
        orden = "jefe primero" if d["masterfirst"] else "esbirros primero" if d["minionfirst"] else "al azar"
        w(f"| `{x}` | {je} | {orden} |")
    w("")
    w("## Héroes\n")
    w("La variable `#HeroX` vale 1 si ese héroe juega. Arquetipos: warrior (Guerrero), healer (Sanador), mage "
      "(Mago), scout (Explorador); DooM tiene el suyo.\n")
    w("| ID | EN | Arquetipo | Pack | Rasgos |")
    w("|---|---|---|---|---|")
    for n, d in c["heroes"].items():
        w(f"| `{n}` | {d['en']} | {d['arquetipo']} | {d['pack']} | {' '.join(d['rasgos'])} |")
    w("")
    w("## Clases\n")
    w("`#ClassX` vale 1 si alguien la eligió como clase principal. Las híbridas (`hybridarchetype`) añaden una "
      "clase normal de ese otro arquetipo.\n")
    w("| ID | EN | Arquetipo | Híbrida con | Pack | Equipo inicial |")
    w("|---|---|---|---|---|---|")
    for n, d in c["classes"].items():
        w(f"| `{n}` | {d['en']} | {d['arquetipo']} | {d['hibrida']} | {d['pack']} | {' '.join(d['objetos'])} |")
    w("")
    w("## Habilidades\n")
    w("Por clase, con su coste en experiencia (0 = la básica, gratis).\n")
    by_class = defaultdict(list)
    for n, d in c["skills"].items():
        by_class[d["clase"]].append((n, d))
    w("| Clase | Habilidades (coste) |")
    w("|---|---|")
    for cl, items in by_class.items():
        lista = ", ".join("`%s` (%d)" % (n, d["xp"]) for n, d in items)
        w(f"| `{cl}` | {lista} |")
    w("")
    w("## Objetos\n")
    w("Rasgos útiles para `QItem traits=`/`traitpool=`: `act1`, `act2` (tienda), `class` (equipo de clase, se "
      "compra y vende por 25), `relic` (no se vende), y de tipo (`melee`, `ranged`, `magic`, `blade`, `axe`, "
      "`hammer`, `bow`, `staff`, `armor`, `shield`, `ring`, `trinket`…). Fama: el objeto solo sale en un sorteo "
      "por rasgos si el nivel de fama del grupo cae en su intervalo (ver `formato-escenario.md` §15).\n")
    w("| ID | EN | Rasgos | Precio | Fama | Pack |")
    w("|---|---|---|---|---|---|")
    for n, d in c["items"].items():
        w(f"| `{n}` | {d['en']} | {' '.join(d['rasgos'])} | {d['precio'] or ''} | {fama(d)} | {d['pack']} |")
    w("")
    w("## Fichas (Token)\n")
    w("| ID | Pack | Imagen |")
    w("|---|---|---|")
    for n, d in c["tokens"].items():
        w(f"| `{n}` | {d['pack']} | {d['imagen']} |")
    w("")
    w("## Imágenes para UI\n")
    w("Nombres para el `image=` de un `UI` (se buscan antes que los ficheros).\n")
    w(", ".join(f"`{n}`" for n in c["images"]) + "\n")
    w("## Audio\n")
    w("Nombres para `audio=` y `music=` (rasgos entre paréntesis).\n")
    w(", ".join(f"`{n}` ({' '.join(d['rasgos'])})" for n, d in c["audio"].items()) + "\n")
    w("## Peligros y viajes\n")
    w("Eventos de contenido que Valkyrie añade a cualquier escenario de Descent. `$perilMinor`, `$perilMajor` o "
      "`$perilDeadly` a 1 → al final de la ronda sale un peligro al azar de ese nivel (`PerilMinorPool`…). "
      "`$@travelevent` a 1 → un evento de viaje al azar (`PerilTravel`). Sus textos son de la app oficial.\n")
    w("| Evento | Disparador | Condiciones |")
    w("|---|---|---|")
    for n, d in c["perils"].items():
        if n == "PerilEmpty":
            continue
        w(f"| `{n}` | {d['trigger']} | {d['conditions']} |")
    w("")
    with open(path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(L))


if __name__ == "__main__":
    main()
