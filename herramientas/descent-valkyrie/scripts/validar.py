#!/usr/bin/env python3
"""
validar.py - Validador de escenarios de Valkyrie para Descent 2ª edición (también campañas y misiones
del pack DooM).

Uso:
    python validar.py <carpeta> [--json] [--sin-info] [--sin-mapa] [--solo <subcarpeta>]

<carpeta> es la de un escenario (la del quest.ini principal). Si dentro hay más quest.ini (una campaña
con varias aventuras), se valida cada uno y también los saltos de una a otra.

Niveles:
  ERROR  Valkyrie se cierra, no carga el escenario o lo carga roto.
  AVISO  Carga, pero algo no funcionará como esperas (cadenas cortadas, textos que faltan...).
  INFO   Sugerencias y comprobaciones de estilo.

Las reglas salen del código de Valkyrie 3.28 (ver references/formato-escenario.md) y de lo que comprueba
la batería de Valkyrie Universalis. Sale con código 1 si hay ERRORES.
"""
import argparse
import json
import os
import re
import sys
from collections import Counter, OrderedDict, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from valkyrie_io import (Scenario, component_type, find_case_insensitive, parse_vartests,  # noqa: E402
                         CURRENT_FORMAT, MIN_FORMAT, LANGUAGES, EVENT_LIKE)
import geometria as G  # noqa: E402
from alcance import reachable, reading_order  # noqa: E402

CAT = json.load(open(os.path.join(SKILL, "assets", "catalogo.json"), encoding="utf-8"))
FFG_KEYS = set(CAT.get("ffg_keys", []))

QC_KEYS = {"xposition", "yposition", "comment", "operations", "vartests", "conditions"}
EVENT_KEYS = QC_KEYS | {"display", "highlight", "buttons", "hero", "quota", "minhero", "maxhero", "add",
                        "remove", "trigger", "randomevents", "mincam", "maxcam", "audio", "music"}
EVENT_PATTERNS = [r"event\d+", r"event\d+Condition", r"event\d+ConditionAction", r"buttoncolor\d+", r"button\d+"]
TYPE_KEYS = {
    "Event": EVENT_KEYS,
    "Tile": QC_KEYS | {"side", "rotation", "customImage", "top", "left"},
    "Door": EVENT_KEYS | {"rotation", "color"},
    "Token": EVENT_KEYS | {"type", "rotation", "tokensize", "clickeffect", "customImage"},
    "UI": EVENT_KEYS | {"image", "fadespeed", "vunits", "size", "textsize", "textaspect", "textcolor",
                        "textbackgroundcolor", "halign", "valign", "textAlignment", "richText", "border",
                        "clickeffect"},
    "Spawn": EVENT_KEYS | {"monster", "traits", "traitpool", "unique", "activated", "uniquehealth",
                           "uniquehealthhero"},
    "MPlace": QC_KEYS | {"master", "rotate", "tokensize"},
    "Puzzle": EVENT_KEYS | {"class", "image", "fadespeed", "skill", "puzzlelevel", "puzzlealtlevel",
                            "puzzlesolution"},
    "CustomMonster": QC_KEYS | {"base", "traits", "image", "imageplace", "activation", "health",
                                "healthperhero", "evadeevent", "horrorevent", "horror", "awareness", "attacks"},
    "Activation": QC_KEYS | {"minionfirst", "masterfirst"},
    "QItem": QC_KEYS | {"itemname", "starting", "traits", "traitpool", "inspect"},
    "StartingItem": QC_KEYS | {"itemname", "starting", "traits", "traitpool", "inspect"},
}
EXTRA_PATTERNS = {"Spawn": [r"placement\d+"]}
CASE_FIX = {"tokenSize": "tokensize", "TokenSize": "tokensize", "customimage": "customImage",
            "CustomImage": "customImage", "textalignment": "textAlignment", "richtext": "richText",
            "clickEffect": "clickeffect", "fadeSpeed": "fadespeed", "varTests": "vartests",
            "Operations": "operations", "Trigger": "trigger", "Display": "display", "Buttons": "buttons",
            "imagePlace": "imageplace", "healthPerHero": "healthperhero", "uniqueHealth": "uniquehealth",
            "uniqueHealthHero": "uniquehealthhero", "randomEvents": "randomevents", "minHero": "minhero",
            "maxHero": "maxhero", "xPosition": "xposition", "yPosition": "yposition", "Rotation": "rotation",
            "Type": "type", "Color": "color", "colour": "color", "Master": "master", "Rotate": "rotate",
            "minionFirst": "minionfirst", "masterFirst": "masterfirst", "Placement2": "placement2"}
SPECIAL_REMOVE = {"#monsters", "#boardcomponents", "#shop", "#uicomponents", "#doors", "#tiles", "#tokens", "#qitems"}
D2E_TRIGGERS = {"EventStart", "StartRound", "EndRound", "NoMorale"}
MOM_ONLY_TRIGGERS = {"EndInvestigatorTurn", "Mythos", "BeforeMonsterActivation", "StartFinalRound", "Eliminated"}
COLOR_NAMES = {"black", "white", "red", "lime", "blue", "yellow", "aqua", "cyan", "magenta", "fuchsia",
               "silver", "gray", "grey", "maroon", "olive", "green", "purple", "teal", "navy", "transparent"}
TOKEN_SIZES = {"small", "medium", "huge", "massive", "Original"}
D2E_SYMBOLS = {"heart", "fatigue", "might", "will", "action", "knowledge", "awareness", "shield", "surge"}
MOM_SYMBOLS = {"strength", "agility", "lore", "influence", "observation", "success", "clue"}
OTHER_MARKS = {"type", "var", "qst", "ffg", "val", "c", "rnd", "pck"}
D2E_VARS_W = {"$end", "$restock", "$perilMinor", "$perilMajor", "$perilDeadly", "$%morale", "$%xp", "$%gold",
              "$%sellratio", "$%fame", "$%famenoteworthy", "$%fameimpressive", "$%famecelebrated",
              "$%fameheroic", "$%famelegendary", "$@travelevent"}
D2E_VARS_R = {"#round", "#heroes", "#monsters"}
NUM_RE = re.compile(r"^-?\d+(\.\d+)?$")
MARK_RE = re.compile(r"\{([A-Za-z@$%#][^{}:]*)(?::([^{}]*))?\}")
# Diccionarios que puede buscar un texto al jugar: el escenario, Valkyrie, la importación y los packs
# (LocalizationRead; GameSelectionScreen, ContentLoader)
DICTS = ("qst", "val", "ffg", "pck")
LOOKUP_RE = re.compile(r"\{(" + "|".join(DICTS) + r"):")


def lookups(text):
    """Las búsquedas {qst:…}, {ffg:…}, {val:…} de un texto, como las lee Valkyrie (LocalizationRead.DictLookup):
    el cierre se busca contando llaves desde el segundo carácter de la clave y, si el texto se acaba antes,
    Valkyrie lanza una excepción al enseñarlo (clave None). Con llaves dentro, la clave llega hasta el primer ':'
    fuera de ellas ({qst:CLAVE:{0}:valor}, DictQuery); sin llaves, es todo hasta el cierre ({qst:A:B} busca 'A:B')."""
    found = []
    for m in LOOKUP_RE.finditer(text):
        start = m.start() + 5
        level, end = 1, start
        while level > 0 and end < len(text):
            end += 1
            ch = text[end] if end < len(text) else ""
            if ch == "{":
                level += 1
            elif ch == "}":
                level -= 1
        if level > 0:
            found.append((m.group(1), None))
            continue
        inner = text[start:end]
        key = inner
        if "{" in inner:
            depth = 0
            for i, ch in enumerate(inner):
                if ch == "{":
                    depth += 1
                elif ch == "}":
                    depth -= 1
                elif ch == ":" and depth == 0:
                    key = inner[:i]
                    break
        found.append((m.group(1), key))
    return found


class Report:
    def __init__(self):
        self.items = []

    def add(self, level, where, msg):
        self.items.append((level, where, msg))

    def error(self, where, msg):
        self.add("ERROR", where, msg)

    def warn(self, where, msg):
        self.add("AVISO", where, msg)

    def info(self, where, msg):
        self.add("INFO", where, msg)


def key_allowed(ctype, key):
    allowed = TYPE_KEYS.get(ctype, QC_KEYS)
    if key in allowed:
        return True
    pats = (EVENT_PATTERNS if ctype in EVENT_LIKE else []) + EXTRA_PATTERNS.get(ctype, [])
    return any(re.fullmatch(p, key) for p in pats)


def is_color(v):
    v = v.strip().strip('"')
    return v.lower() in COLOR_NAMES or re.fullmatch(r"#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?", v) is not None


def is_true(v):
    return str(v).strip().lower() == "true"


def packs_declared(sc):
    declared = set(sc.quest.get("packs", "").split()) | {"D2EBase"}
    for p in list(declared):
        declared |= set(CAT["packs"].get(p, {}).get("clon", []))
    return declared


def check_varop(r, where, text, writing):
    parts = [p for p in text.split(",") if p != ""]
    if len(parts) < 3:
        r.error(where, f"operación/condición mal formada '{text}': necesita 'variable,operador,valor' "
                       f"(con menos partes Valkyrie lanza una excepción)")
        return None
    if len(parts) > 3:
        r.warn(where, f"operación/condición '{text}' con más de 3 partes: Valkyrie solo usa las tres primeras")
    var, op, val = parts[:3]
    if writing:
        if op not in {"=", "+", "-", "*", "/", "%"}:
            r.error(where, f"operador '{op}' no válido en operations (usa = + - * / %)")
        if var.startswith("#"):
            r.warn(where, f"'{var}' es de solo lectura: la operación '{text}' se ignora")
    else:
        if op not in {"==", "!=", ">=", "<=", ">", "<"}:
            r.error(where, f"comparador '{op}' no válido en vartests (usa == != >= <= > <); "
                           f"un comparador desconocido siempre da falso")
    return var, op, val


def media_languages(folder, v):
    """Los idiomas en cuyas carpetas encuentra Valkyrie el fichero al jugar (Quest.FindLocalisedMultimediaFile):
    <escenario>/<idioma>/<ruta> y <escenario>/<carpeta>/<idioma>/<fichero>. La ruta se normaliza antes de
    buscarla, así que '../Sounds/x.ogg' en el quest.ini principal llega a su propia carpeta Sounds por la de
    cualquier idioma. En el editor de Valkyrie no se miran estas carpetas."""
    d, f = os.path.split(v)
    found = []
    for lang in LANGUAGES:
        if os.path.exists(os.path.normpath(os.path.join(folder, lang, v))) or \
                (d and os.path.exists(os.path.normpath(os.path.join(folder, d, lang, f)))):
            found.append(lang)
    return found


def media_exists(folder, value, table):
    """Como Valkyrie: primero el nombre en los packs (ImageData/AudioData) y luego un fichero del escenario
    (también en carpetas de idioma, sin distinguir mayúsculas)."""
    if value in CAT.get(table, {}):
        return True
    v = value.replace("\\", "/")
    p = os.path.normpath(os.path.join(folder, v))
    if os.path.exists(p) or find_case_insensitive(folder, v):
        return True
    base, ext = os.path.splitext(v)
    if not ext:
        for e in (".png", ".jpg", ".jpeg", ".ogg", ".wav"):
            if os.path.exists(os.path.join(folder, base + e)):
                return True
    return bool(media_languages(folder, v))


def check_media(r, where, folder, value, audio, key):
    if not value:
        return
    table = "audio" if audio else "images"
    if value in CAT.get(table, {}):
        return
    if not media_exists(folder, value, table):
        if os.path.exists(os.path.join(folder, value.replace("\\", "/"))):
            return
        r.warn(where, f"{key}='{value}': no es un nombre de {'audio' if audio else 'imagen'} de Valkyrie ni un "
                      f"fichero del escenario (no se verá/oirá)")
        return
    v = value.replace("\\", "/")
    exact = os.path.exists(os.path.normpath(os.path.join(folder, v)))
    alt = None if exact else find_case_insensitive(folder, v)
    if alt not in (None, v):
        r.warn(where, f"{key}='{value}': el fichero existe con otras mayúsculas (falla en Linux y Android)")
        return
    if not exact and alt is None:
        idiomas = media_languages(folder, v)
        if idiomas and len(idiomas) < len(LANGUAGES):
            r.info(where, f"{key}='{value}' solo está en las carpetas de idioma {' '.join(idiomas)}: quien juegue "
                          f"en otro idioma (sin uno de esos de reserva) no lo {'oirá' if audio else 'verá'}")
    if " " in v:
        r.info(where, f"{key}='{value}' tiene espacios en el nombre: funciona en audio= e image=, pero no en "
                      f"music= (es una lista separada por espacios); mejor sin espacios")
    if audio and value.lower().endswith((".mp3",)):
        r.info(where, f"{key}='{value}': Valkyrie reproduce .ogg y .wav; un .mp3 puede no sonar")

def resolve_monster(name, C):
    """Tipo de monstruo que elegiría un Spawn por nombre (Quest.AttemptMonsterMatch), o None."""
    if name.startswith("Spawn"):
        return None
    m = name if name.startswith(("Monster", "CustomMonster")) else "Monster" + name
    if m in C or m in CAT["monsters"]:
        return m
    return None


def monster_size(m, C):
    if m in CAT["monsters"]:
        return CAT["monsters"][m]["tamano"]
    if m in C:
        traits = C[m].get("traits", "").split()
        for s in ("massive", "huge", "medium", "small"):
            if s in traits:
                return s
        b = C[m].get("base", "")
        if b in CAT["monsters"]:
            return CAT["monsters"][b]["tamano"]
    return "small"


class Package:
    """Un paquete: el quest.ini principal y los de sus subcarpetas (aventuras de una campaña)."""

    def __init__(self, root):
        self.root = os.path.abspath(root)
        self.quests = []
        for dirpath, dirs, files in os.walk(self.root):
            dirs.sort()
            if "quest.ini" in files:
                self.quests.append(dirpath)
        self.quests.sort(key=lambda d: (d != self.root, d))

    def rel(self, d):
        r = os.path.relpath(d, self.root).replace("\\", "/")
        return "." if r == "." else r


def target_quest(root, name):
    p = name.replace("\\", "/")
    while p.startswith("/"):
        p = p[1:]
    return os.path.normpath(os.path.join(root, p))


def validate_quest(folder, root, r, a, pkg_info):
    sc = Scenario.load(folder)
    tag = os.path.relpath(folder, root).replace("\\", "/")
    tag = "" if tag == "." else tag + ": "
    is_root = os.path.abspath(folder) == os.path.abspath(root)

    def W(where):
        return tag + where

    for e in sc.errors:
        if "[QuestText]" in e:
            r.warn(W("carga"), e + " (Valkyrie sigue sin ese idioma)")
        else:
            r.error(W("carga"), e)
    for w in sc.warnings:
        if "solo espacios" in w or "mezcla de finales" in w:
            r.error(W("ficheros"), w)
        elif "sin cerrar" in w:
            r.warn(W("ficheros"), w + " → Valkyrie junta lo que queda del fichero en un solo texto: se pierden los "
                                      "textos que siguen")
        elif "clave duplicada" in w or "sección duplicada" in w or "clave repetida" in w:
            r.warn(W("ficheros"), w)
        else:
            r.info(W("ficheros"), w)

    C = sc.components
    ctype = {n: component_type(n) for n in C}
    names = set(C)
    declared = packs_declared(sc) | pkg_info["packs"]
    deflang = sc.default_language
    reach = reachable(sc)
    for n in list(reach):
        if ctype.get(n) == "Spawn":
            for m in C[n].get("monster", "").split():
                mm = resolve_monster(m, C)
                if mm in C:
                    reach.add(mm)
    pack_checked = set(re.findall(r"#([A-Za-z0-9]+)", " ".join(kv.get("vartests", "") + " " +
                                                               " ".join(v for k, v in kv.items()
                                                                        if k.endswith("Condition"))
                                                               for kv in C.values())))

    undeclared = defaultdict(list)          # pack -> componentes que usan su contenido

    def uses(pack, n, extra=()):
        if pack and pack not in declared and not (set(extra) & declared):
            undeclared[pack].append(n)

    latent = OrderedDict()                  # fallos graves en componentes que nada alcanza

    def crit(where, n, msg):
        if n in reach:
            r.error(where, msg)
        else:
            latent.setdefault(n, [where, msg, 0])[2] += 1

    def T(key):
        return sc.text(deflang, key)

    # ------------------------------------------------------------------ quest.ini
    q = sc.quest
    fv = 0
    fmt = q.get("format", "")
    if not fmt:
        r.error(W("quest.ini"), "falta 'format=' (vale 0 y el escenario no aparece). Usa format=21")
    else:
        try:
            fv = int(fmt)
            if fv > CURRENT_FORMAT or fv < MIN_FORMAT:
                r.error(W("quest.ini"), f"format={fv} fuera del rango admitido ({MIN_FORMAT}-{CURRENT_FORMAT})")
        except ValueError:
            r.error(W("quest.ini"), f"format='{fmt}' no es un número")
    if q.get("type", "") != "D2E":
        if is_root:
            r.error(W("quest.ini"), f"type='{q.get('type', '')}': debe ser 'D2E' para Descent")
        else:
            r.warn(W("quest.ini"), f"type='{q.get('type', '')}': las aventuras de una campaña de Descent llevan "
                                   f"type=D2E (ChangeQuest no lo comprueba, pero el editor sí)")
    hidden = is_true(q.get("hidden", "False"))
    if is_root and hidden:
        r.warn(W("quest.ini"), "hidden=True en el quest.ini principal: el escenario no saldrá en la lista")
    if not is_root and not hidden:
        r.warn(W("quest.ini"), "subaventura sin hidden=True: saldrá suelta en la lista de escenarios")
    if "defaultlanguage" not in q:
        r.warn(W("quest.ini"), "falta defaultlanguage (se asume English)")
    elif deflang not in LANGUAGES:
        r.error(W("quest.ini"), f"defaultlanguage='{deflang}' no es un idioma de Valkyrie")
    if deflang not in sc.localizations:
        r.error(W("quest.ini"), f"no hay fichero de localización con '.,{deflang}' (idioma por defecto)")
    for p in q.get("packs", "").split():
        if p not in CAT["packs"]:
            r.warn(W("quest.ini"), f"pack '{p}' desconocido: el escenario no se podrá elegir en Valkyrie")
        elif p == "D2EBase":
            r.info(W("quest.ini"), "no hace falta declarar D2EBase en packs")
        elif CAT["packs"][p]["comunidad"]:
            r.info(W("quest.ini"), f"pide el pack de la comunidad '{p}': el jugador lo baja en Mi colección → "
                                   f"Descarga de contenidos y lo activa (sin él no se puede elegir el escenario)")
    try:
        mn = int(q.get("minhero", "2"))
        mx = int(q.get("maxhero", "4"))
        if mx > 4:
            r.info(W("quest.ini"), f"maxhero={mx}: en Descent Valkyrie admite como mucho 4 héroes")
        if mn > mx:
            r.error(W("quest.ini"), f"minhero={mn} mayor que maxhero={mx}")
        if mn < 1:
            r.info(W("quest.ini"), "minhero<1: Valkyrie usa 1")
    except ValueError:
        r.error(W("quest.ini"), "minhero/maxhero deben ser enteros")
        mn, mx = 2, 4
    pkg_info["heroes"] = (max(1, mn), min(4, mx)) if is_root else pkg_info.get("heroes", (max(1, mn), min(4, mx)))
    mn, mx = pkg_info["heroes"]
    if "difficulty" in q:
        try:
            d = float(q["difficulty"])
            if not 0 <= d <= 1:
                r.warn(W("quest.ini"), f"difficulty={d}: debe estar entre 0 y 1 (×5 = estrellas)")
        except ValueError:
            r.warn(W("quest.ini"), f"difficulty='{q['difficulty']}' no es un número (usa punto decimal)")
    if is_root:
        if not q.get("lengthmin") or not q.get("lengthmax"):
            r.info(W("quest.ini"), "pon lengthmin/lengthmax (duración estimada en minutos)")
        img = q.get("image", "")
        if img:
            if " " in img:
                r.warn(W("quest.ini"), f"image='{img}' con espacios: el paquete fallará")
            if not os.path.exists(os.path.join(folder, img)):
                r.warn(W("quest.ini"), f"la imagen de portada '{img}' no existe")
        else:
            r.info(W("quest.ini"), "sin imagen de portada (image=): recomendable una imagen cuadrada ~300x300")
        base = os.path.basename(folder)
        if base.startswith("EditorScenario") or base.startswith("Scenario"):
            r.warn(W("carpeta"), f"la carpeta se llama '{base}': usa un identificador propio. Con 'EditorScenario…' "
                                 f"no sale la pantalla final y los revisores lo rechazan")
        if " " in base:
            r.error(W("carpeta"), f"el nombre de carpeta '{base}' tiene espacios: el paquete .valkyrie fallará")
        for kk in ("quest.name", "quest.description", "quest.synopsys", "quest.authors"):
            if T(kk) is None:
                (r.warn if kk == "quest.name" else r.info)(W("textos"), f"falta '{kk}' en la localización")

    # ------------------------------------------------------------------ componentes
    add_refs = defaultdict(list)
    next_refs = defaultdict(list)
    var_set = defaultdict(list)
    var_test = defaultdict(list)
    var_quota = defaultdict(list)
    spawn_monster = {}                      # Spawn -> monstruo que elige (Quest.AttemptMonsterMatch)
    start_events, startround_events, nomorale_events = [], [], []
    shop_events = []
    quest_switch = []
    removes_shop = []
    end_setters = []
    placements_used = set()

    for n, kv in C.items():
        t = ctype[n]
        where = W(f"{n} ({sc.source.get(n, '?')})")
        if t is None:
            continue
        for k in kv:
            if not key_allowed(t, k):
                if k in CASE_FIX:
                    r.error(where, f"clave '{k}' mal escrita: Valkyrie solo entiende '{CASE_FIX[k]}'")
                elif k.lower() in {x.lower() for x in TYPE_KEYS.get(t, set())}:
                    good = [x for x in TYPE_KEYS.get(t, set()) if x.lower() == k.lower()][0]
                    r.error(where, f"clave '{k}' con mayúsculas incorrectas: debe ser '{good}'")
                elif re.fullmatch(r"(?i)event\d+condition(action)?", k):
                    r.error(where, f"clave '{k}': se escribe 'eventNCondition' / 'eventNConditionAction'")
                else:
                    r.info(where, f"clave '{k}' desconocida para {t}: Valkyrie la ignora")
        for pk in ("xposition", "yposition"):
            if pk in kv:
                v = kv[pk]
                if "," in v:
                    r.error(where, f"{pk}='{v}' usa coma decimal: Valkyrie leerá 0. Usa punto")
                else:
                    try:
                        fvv = float(v)
                        if t in ("Token", "Door", "MPlace", "Spawn") and abs(fvv - round(fvv)) > 1e-6:
                            r.info(where, f"{pk}={v}: en Descent las casillas tienen coordenadas enteras "
                                          f"(el centro de la casilla); con decimales queda entre casillas")
                    except ValueError:
                        r.error(where, f"{pk}='{v}' no es un número (Valkyrie leerá 0)")
        if "rotation" in kv and t in ("Tile", "Token", "Door"):
            try:
                rv = int(kv["rotation"])
                if t in ("Tile", "Door") and rv % 90 != 0:
                    r.warn(where, f"rotation={rv}: en la rejilla de Descent solo 0, 90, 180 o 270")
            except ValueError:
                r.error(where, f"rotation='{kv['rotation']}' debe ser un entero (Valkyrie leerá 0)")
        # operaciones y condiciones
        for op in kv.get("operations", "").split():
            res = check_varop(r, where, op, True)
            if res:
                var_set[res[0]].append(n)
                if res[0] == "$end" and res[2] not in ("0",):
                    end_setters.append(n)
                if not res[2][:1].isdigit() and res[2][:1] not in "-." and not res[2].startswith("#rand"):
                    var_test[res[2]].append(n)
        for tk in [k for k in kv if k == "vartests" or re.fullmatch(r"event\d+Condition", k)]:
            depth = 0
            prev = None
            for cls_, data in parse_vartests(kv[tk]):
                if cls_ == "VarOperation":
                    res = check_varop(r, where, data, False)
                    if res:
                        var_test[res[0]].append(n)
                        if not res[2][:1].isdigit() and res[2][:1] not in "-." and not res[2].startswith("#rand"):
                            var_test[res[2]].append(n)
                    if prev == "VarOperation":
                        r.warn(where, f"{tk}: dos condiciones seguidas sin VarTestsLogicalOperator:AND/OR")
                elif cls_ == "VarTestsLogicalOperator":
                    if data not in ("AND", "OR"):
                        r.error(where, f"{tk}: operador lógico '{data}' (usa AND u OR)")
                elif cls_ == "VarTestsParenthesis":
                    depth += 1 if data == "(" else -1 if data == ")" else 0
                else:
                    r.error(where, f"{tk}: elemento '{cls_}:{data}' no reconocido (VarOperation:, "
                                   f"VarTestsLogicalOperator: o VarTestsParenthesis:)")
                prev = cls_ if cls_ != "VarTestsParenthesis" else prev
            if depth != 0:
                r.error(where, f"{tk}: paréntesis desparejados")
        if "conditions" in kv and "vartests" not in kv:
            r.info(where, "usa 'conditions' (formato antiguo): mejor 'vartests'")
            for c in kv["conditions"].split():
                res = check_varop(r, where, c, False)
                if res:
                    var_test[res[0]].append(n)
        if t == "Token" and kv.get("vartests"):
            r.warn(where, "las fichas IGNORAN vartests: se podrá pulsar siempre. Pon la condición en el evento de "
                          "destino o en event1Condition")

        # ------------------ eventos y derivados
        if t in EVENT_LIKE:
            display = kv.get("display", "true").lower() != "false"
            try:
                buttons = int(kv.get("buttons", "1" if display else "0") or 0)
            except ValueError:
                r.error(where, f"buttons='{kv.get('buttons')}' no es un entero")
                buttons = 0
            if display and buttons == 0:
                buttons = 1
            ev_keys = sorted((int(m.group(1)), k) for k in kv for m in [re.fullmatch(r"event(\d+)", k)] if m)
            for idx, k in ev_keys:
                if idx > buttons or idx < 1:
                    if not display and buttons == 0 and idx == 1 and kv[k].strip():
                        r.warn(where, f"evento silencioso con {k}={kv[k]} pero sin buttons=1: la cadena se CORTA aquí")
                    elif kv[k].strip():
                        r.warn(where, f"{k} se ignora porque buttons={buttons}")
                    continue
                targets = kv[k].split()
                for tg in targets:
                    if tg.lower().endswith("quest.ini"):
                        quest_switch.append((n, tg))
                        tq = target_quest(root, tg)
                        if not os.path.exists(tq) and not find_case_insensitive(root, tg.lstrip("/\\")):
                            r.warn(where, f"{k}={tg}: no existe {os.path.relpath(tq, root)} (la ruta es relativa a la "
                                          f"carpeta del quest.ini PRINCIPAL, no a la de esta aventura); Valkyrie "
                                          f"lo toma por un evento que no existe y no cambia de aventura")
                        continue
                    if tg not in names:
                        r.warn(where, f"{k} apunta a '{tg}', que no existe (Valkyrie lo salta y lo apunta en el registro)")
                    else:
                        next_refs[tg].append(n)
                        if ctype[tg] not in EVENT_LIKE:
                            r.warn(where, f"{k} apunta a '{tg}', que es un {ctype[tg]} (no un evento): se ignora")
                ramif = all(C.get(tg, {}).get("vartests") for tg in targets[:-1] if tg in names)
                # un paso de una cadena: el primero sigue él mismo hacia el último (prueba esto y sigue)
                encadenado = all(targets[-1] in C.get(tg, {}).get("event1", "").split() for tg in targets[:-1])
                if len(targets) > 1 and not is_true(kv.get("randomevents", "false")) and not ramif and not encadenado:
                    r.info(where, f"{k} lista {len(targets)} eventos: solo se ejecuta el PRIMERO habilitado")
                cond = kv.get(f"event{idx}Condition")
                act = kv.get(f"event{idx}ConditionAction")
                if act and act.lower() not in ("none", "disable", "hide"):
                    r.error(where, f"event{idx}ConditionAction='{act}': usa disable, hide o none")
                if act and not cond:
                    r.info(where, f"event{idx}ConditionAction sin event{idx}Condition: no hace nada")
                bc = kv.get(f"buttoncolor{idx}")
                if bc and not is_color(bc):
                    r.warn(where, f"buttoncolor{idx}='{bc}' no es un color válido (#RRGGBB o nombre básico)")
            if not display and buttons > 1 and not any(f"event{i}Condition" in kv for i in range(1, buttons + 1)):
                r.warn(where, f"evento silencioso con {buttons} botones y sin condiciones de botón: siempre sigue "
                              f"por el botón 1")
            # textos
            if display and t not in ("Puzzle",):
                if T(f"{n}.text") is None and t in ("Event", "Spawn"):
                    r.info(where, "evento visible sin texto (.text): diálogo vacío")
                for i in range(1, buttons + 1):
                    has_events = bool(kv.get(f"event{i}", "").strip())
                    if T(f"{n}.button{i}") is None and (t not in ("Token", "UI", "Door") or has_events):
                        r.warn(where, f"falta el texto del botón {i} ('{n}.button{i}'): se verá la clave")
            # add/remove
            qitems = []
            for comp in kv.get("add", "").split():
                if comp not in names:
                    crit(where, n, f"add={comp}: el componente no existe → Valkyrie SE CIERRA al ejecutar este evento")
                    continue
                add_refs[comp].append(n)
                ct = ctype[comp]
                if ct == "Spawn":
                    r.warn(where, f"add={comp}: los Spawn no se añaden con add (se ignora); ponlo en eventN o trigger")
                elif ct in ("Event", "Puzzle", "CustomMonster", "MPlace", "Activation"):
                    r.warn(where, f"add={comp}: un {ct} no se puede añadir (se ignora)")
                elif ct in ("QItem", "StartingItem"):
                    qitems.append(comp)
            if len(qitems) > 1:
                shop_events.append(n)
            for comp in kv.get("remove", "").split():
                if comp.startswith("#"):
                    if comp not in SPECIAL_REMOVE:
                        r.warn(where, f"remove={comp}: especial desconocido ({', '.join(sorted(SPECIAL_REMOVE))})")
                    elif comp in {"#uicomponents", "#doors", "#tiles", "#tokens", "#qitems"} and fv and fv < 20:
                        r.warn(where, f"remove={comp} necesita format≥20")
                    if comp == "#shop":
                        removes_shop.append(n)
                    continue
                if comp not in names:
                    r.info(where, f"remove={comp}: no existe ese componente (no hace nada)")
            both = sorted(set(kv.get("add", "").split()) & {c for c in kv.get("remove", "").split()
                                                            if not c.startswith("#")} - {n})
            both = [c for c in both if ctype.get(c) not in ("QItem", "StartingItem")]
            if both:
                r.warn(where, f"añade y quita {' '.join(both)} en el mismo evento: Valkyrie añade y luego quita")
            # trigger
            trig = kv.get("trigger", "")
            if trig:
                if trig == "EventStart":
                    start_events.append(n)
                elif trig == "StartRound":
                    startround_events.append(n)
                elif trig == "NoMorale":
                    nomorale_events.append(n)
                if trig in D2E_TRIGGERS or re.fullmatch(r"EndRound\d+", trig):
                    pass
                elif trig in MOM_ONLY_TRIGGERS:
                    r.warn(where, f"trigger={trig} es de Mansiones: en Descent no se dispara nunca"
                                  + (" (#eliminated solo lo pone el menú de Mansiones)" if trig == "Eliminated" else ""))
                elif trig.startswith("DefeatedUnique") or trig.startswith("Defeated"):
                    x = trig[len("DefeatedUnique"):] if trig.startswith("DefeatedUnique") else trig[len("Defeated"):]
                    if not (x in CAT["monsters"] or x in names):
                        r.warn(where, f"trigger={trig}: '{x}' no es un tipo de monstruo, CustomMonster ni Spawn del "
                                      f"escenario (DefeatedMonsterZombie, Defeated<NombreSpawn>)")
                    elif x in names and ctype[x] == "Spawn":
                        pass
                elif trig.startswith("Var"):
                    vname = trig[3:]
                    vw = ("$@" + vname[1:]) if vname.startswith("$") else "@" + vname
                    if vw not in var_set and vw not in ("$@travelevent",):
                        r.info(where, f"trigger={trig}: ninguna operación de este escenario pone '{vw}' a 1 "
                                      f"(se dispara al poner {vw},=,1)")
                else:
                    r.warn(where, f"trigger='{trig}' desconocido: este evento nunca se disparará solo")
            av = kv.get("audio", "")
            if av:
                check_media(r, where, folder, av, True, "audio")
            for mv in kv.get("music", "").split():
                check_media(r, where, folder, mv, True, "music")
            if kv.get("hero") and kv["hero"] not in names:
                r.warn(where, f"hero={kv['hero']}: ese evento no existe")
            qv = kv.get("quota", "")
            if qv and not qv[0].isdigit():
                var_quota[qv].append(n)      # quota=<variable>: la cuota es su valor (QuestData.Event)

        # ------------------ por tipo
        if t == "Tile":
            side = kv.get("side", "")
            if not side and not kv.get("customImage"):
                r.error(where, "loseta sin 'side' ni 'customImage' → Valkyrie se cierra")
            elif side:
                s2 = side if side in CAT["tiles"] else "TileSide" + side
                if s2 not in CAT["tiles"]:
                    r.error(where, f"side={side} no existe en Valkyrie ni en los packs conocidos → al mostrarla "
                                   f"Valkyrie se cierra")
                else:
                    uses(CAT["tiles"][s2]["pack"], n, CAT["tiles"][s2].get("tambien", []))
            if kv.get("customImage"):
                ci = kv["customImage"]
                if "\\" in ci:
                    r.warn(where, f"customImage='{ci}' con '\\': solo funciona en Windows; usa '/'")
                check_media(r, where, folder, ci, False, "customImage")
        elif t == "Token":
            ty = kv.get("type", "")
            if not ty and not kv.get("customImage"):
                r.warn(where, "ficha sin type (se dibuja como TokenSearch)")
            elif ty and ty not in CAT["tokens"] and ty not in CAT["monsters"] and not kv.get("customImage"):
                r.warn(where, f"type={ty} no existe (se dibujará como TokenSearch y se apunta en el registro)")
            elif ty in CAT["tokens"]:
                uses(CAT["tokens"][ty]["pack"], n, CAT["tokens"][ty].get("tambien", []))
            ts = kv.get("tokensize", "")
            if ts and ts not in TOKEN_SIZES and not NUM_RE.match(ts):
                r.error(where, f"tokensize='{ts}' no válido: small, medium, huge, massive, Original o un número")
            if kv.get("customImage"):
                if "\\" in kv["customImage"]:
                    r.warn(where, "customImage con '\\': solo funciona en Windows; usa '/'")
                check_media(r, where, folder, kv["customImage"], False, "customImage")
        elif t == "Door":
            col = kv.get("color", "")
            if col and not is_color(col):
                r.warn(where, f"color='{col}' no es #RRGGBB ni un nombre conocido (la puerta sale blanca y se avisa)")
        elif t == "UI":
            im = kv.get("image", "")
            if im:
                check_media(r, where, folder, im, False, "image")
            if not im and T(f"{n}.uitext") is None:
                r.info(where, "UI sin imagen ni texto (uitext): invisible (vale como botón transparente)")
        elif t == "Spawn":
            mons = kv.get("monster", "").split()
            traits = kv.get("traits", "").split() + kv.get("traitpool", "").split()
            chosen = None
            if not mons and not traits:
                crit(where, n, "Spawn sin monster ni traits/traitpool: el evento falla a medias (Valkyrie no elige "
                               "monstruo y la cadena se rompe)")
            if mons and not traits:
                for m in mons:
                    if m.startswith("Spawn"):
                        if m not in names:
                            r.warn(where, f"monster={m}: ese Spawn no existe")
                        chosen = chosen or ("spawn", m)
                        break
                    mm = resolve_monster(m, C)
                    if mm:
                        if mm in CAT["monsters"]:
                            p = CAT["monsters"][mm]["pack"]
                            ok = p in declared or (set(CAT["monsters"][mm].get("tambien", [])) & declared)
                            if not ok and m == mons[-1]:
                                uses(p, n)
                            elif not ok:
                                continue
                        chosen = ("monster", mm)
                        break
                if chosen is None:
                    crit(where, n, f"monster={' '.join(mons)}: ninguno existe → el evento falla a medias")
            elif traits:
                pool = [m for m, d in CAT["monsters"].items() if set(kv.get("traits", "").split()) <= set(d["rasgos"])
                        and (not kv.get("traitpool") or set(kv.get("traitpool", "").split()) & set(d["rasgos"]))
                        and (d["pack"] in declared)]
                if not pool:
                    r.warn(where, f"ningún monstruo de los packs declarados tiene esos rasgos ({' '.join(traits)})")
            if chosen and chosen[0] == "monster":
                spawn_monster[n] = chosen[1]
            size = monster_size(chosen[1], C) if chosen and chosen[0] == "monster" else "small"
            lieutenant = chosen and chosen[0] == "monster" and chosen[1] in CAT["monsters"] and \
                (CAT["monsters"][chosen[1]]["lugarteniente"] or CAT["monsters"][chosen[1]]["agente"])
            pl = {int(m.group(1)): kv[k] for k in kv for m in [re.fullmatch(r"placement(\d+)", k)] if m}
            for i, v in pl.items():
                if i > 4:
                    r.info(where, f"placement{i}: en Descent hay como mucho 4 héroes (no se usa)")
                masters = 0
                for p in v.split():
                    placements_used.add(p)
                    if p not in names:
                        crit(where, n, f"placement{i}={p}: ese MPlace no existe → Valkyrie se cierra al mostrar el "
                                       f"grupo con {i} héroes")
                    elif ctype[p] != "MPlace":
                        crit(where, n, f"placement{i}={p} no es un MPlace → Valkyrie se cierra al mostrar el grupo")
                    elif is_true(C[p].get("master", "false")):
                        masters += 1
                if masters > 1:
                    r.info(where, f"placement{i}: {masters} casillas de jefe (master=true); normalmente hay una")
            has_pos = "xposition" in kv or "yposition" in kv
            silent = kv.get("display", "true").lower() == "false"
            if pl and n in reach and not has_pos:
                r.warn(where, "tiene placementN pero no xposition/yposition: Valkyrie solo dibuja las figuras de los "
                              "Spawn con posición, así que no se marca nada en el tablero (pon la posición del grupo)")
            elif pl and n in reach and silent:
                r.warn(where, "display=false: el grupo entra en juego, pero Valkyrie no marca sus casillas en el "
                              "tablero (solo dibuja los Spawn que muestran su diálogo)")
            if (pl or kv.get("xposition")) and kv.get("display", "true").lower() != "false":
                for h in range(mn, mx + 1):
                    if h not in pl and pl and not lieutenant:
                        r.info(where, f"sin placement{h}: con {h} héroes Valkyrie solo marca la zona del grupo "
                                      f"(xposition/yposition) en vez de cada casilla")
            if not pl and not kv.get("xposition") and kv.get("display", "true").lower() != "false":
                r.info(where, "Spawn sin posición ni placements: no se marca nada en el tablero")
            if is_true(kv.get("unique", "false")):
                if T(f"{n}.uniquetext") is None:
                    r.info(where, "unique=true sin '.uniquetext': la ventana de Información no mostrará sus reglas "
                                  "(solo sale el título si hay uniquetext)")
                if T(f"{n}.uniquetitle") is not None:
                    r.info(where, "Valkyrie titula al único «Maestro <monstruo>» aunque haya '.uniquetitle' (rareza "
                                  "de EventManager.GetUniqueTitle): pon su nombre en '.uniquetext'")
                elif T(f"{n}.uniquetext") is not None:
                    r.warn(where, "unique=true con '.uniquetext' y sin '.uniquetitle': la ventana de Información "
                                  "muestra la clave sin traducir como título (pon un '.uniquetitle' cualquiera)")
            for k in ("uniquehealth", "uniquehealthhero"):
                if k in kv and not NUM_RE.match(kv[k].strip()):
                    r.warn(where, f"{k}='{kv[k]}' no es un número")
            sz_info = (where, size, pl)
            pkg_info.setdefault("spawn_sizes", []).append(sz_info)
        elif t == "MPlace":
            for k in ("master", "rotate"):
                if k in kv and kv[k].strip().lower() not in ("true", "false"):
                    r.warn(where, f"{k}='{kv[k]}' debe ser true o false")
            ts = kv.get("tokensize", "")
            if ts and ts not in TOKEN_SIZES and not NUM_RE.match(ts):
                r.warn(where, f"tokensize='{ts}' no válido")
        elif t == "CustomMonster":
            b = kv.get("base", "")
            acts = kv.get("activation", "").split()
            if b and b not in CAT["monsters"]:
                crit(where, n, f"base={b} no es un monstruo de Valkyrie (usa el ID completo, p. ej. MonsterZombie)")
            elif b:
                uses(CAT["monsters"][b]["pack"], n, CAT["monsters"][b].get("tambien", []))
            if not b and not acts:
                crit(where, n, "CustomMonster sin base ni activation: al activarse Valkyrie no encuentra activaciones "
                               "y SE CIERRA")
            if not b and not kv.get("traits"):
                r.info(where, "sin base ni traits: no tiene tamaño (se coloca como 1×1) ni sale en sorteos por rasgos")
            valid = 0
            for x in acts:
                if x.startswith("Event"):
                    crit(where, n, f"activation={x}: en Descent no existe la forma «evento» de Mansiones; Valkyrie "
                                   f"busca Activation{x} o MonsterActivation{x} y, si no hay ninguna válida, se cierra")
                    continue
                if "Activation" + x in C:
                    valid += 1
                elif "MonsterActivation" + x in CAT["activations"]:
                    valid += 1
                elif x.startswith("Activation") and x in C:
                    r.warn(where, f"activation={x}: se escribe sin el prefijo (activation={x[len('Activation'):]})")
                else:
                    r.warn(where, f"activation={x}: no existe Activation{x} en el escenario ni MonsterActivation{x} "
                                  f"en Valkyrie (se ignora y se apunta en el registro)")
            if acts and valid == 0:
                crit(where, n, "ninguna activación válida: al activarse el grupo Valkyrie SE CIERRA")
            for k in ("health", "healthperhero"):
                if k in kv and not NUM_RE.match(kv[k].strip()):
                    r.warn(where, f"{k}='{kv[k]}' no es un número")
            for k in ("image", "imageplace"):
                if kv.get(k):
                    if "\\" in kv[k]:
                        r.warn(where, f"{k} con '\\': solo funciona en Windows; usa '/'")
                    if not os.path.exists(os.path.join(folder, kv[k].replace("\\", "/"))):
                        crit(where, n, f"{k}='{kv[k]}' no existe: al colocar o mostrar el monstruo Valkyrie se cierra")
            if T(f"{n}.monstername") is None and not b:
                r.warn(where, "sin '.monstername' ni base: no tiene nombre")
            for k in ("evadeevent", "horrorevent", "horror", "awareness", "attacks"):
                if k in kv:
                    r.info(where, f"{k}: es de Mansiones; en Descent no se usa")
        elif t == "Activation":
            ab, ma, mi = T(f"{n}.ability"), T(f"{n}.master"), T(f"{n}.minion")
            if ma is None and mi is None:
                r.warn(where, "sin textos '.master' ni '.minion': la ventana de activación sale vacía")
            if ab is None:
                r.info(where, "sin '.ability' (recuadro superior de la activación)")
            for txt in (ab or "",):
                if "{0}" in txt:
                    r.info(where, "en Descent, {0} en '.ability' es un HÉROE al azar y {1} el monstruo "
                                  "(al revés que en Mansiones)")
            if is_true(kv.get("masterfirst", "")) and is_true(kv.get("minionfirst", "")):
                r.info(where, "masterfirst y minionfirst a la vez: gana minionfirst")
        elif t in ("QItem", "StartingItem"):
            if t == "StartingItem":
                r.info(where, "StartingItem es el nombre antiguo (formato 3): usa QItem")
            if "starting" not in kv:
                r.info(where, "sin 'starting=': vale True (se entrega al empezar). Escríbelo siempre")
            names_ = kv.get("itemname", "").split()
            tr = kv.get("traits", "").split()
            tp = kv.get("traitpool", "").split()
            if not names_ and not tr and not tp:
                r.warn(where, "QItem sin itemname ni rasgos: no se elige nada")
            if names_ and not tr and not tp:
                if not any(x in CAT["items"] or x in C for x in names_):
                    r.error(where, f"itemname={' '.join(names_)}: ningún objeto existe")
                else:
                    for x in names_:
                        if x in CAT["items"] and CAT["items"][x]["pack"] not in declared:
                            r.info(where, f"{x} es del pack {CAT['items'][x]['pack']}, que no está en packs=")
            elif tr or tp:
                pool = [i for i, d in CAT["items"].items() if set(tr) <= set(d["rasgos"])
                        and (not tp or set(tp) & set(d["rasgos"])) and d["pack"] in declared and i not in names_]
                if not pool:
                    r.warn(where, "ningún objeto de los packs declarados tiene esos rasgos: no se elige nada")
                fam = [i for i in pool if CAT["items"][i]["minfama"]]
                if fam and len(fam) == len(pool):
                    pkg_info["fame_items"].append((folder, n))
            if kv.get("inspect") and kv["inspect"] not in names:
                r.warn(where, f"inspect={kv['inspect']}: ese evento no existe")
        elif t == "Puzzle":
            cls_ = kv.get("class", "slide")
            if cls_ not in ("slide", "code", "image", "tower"):
                r.warn(where, f"class={cls_}: usa slide, code, image o tower (si no, el puzle no se abre)")
            if cls_ == "image":
                im = kv.get("image", "")
                if not im or not os.path.exists(os.path.join(folder, im)):
                    crit(where, n, "puzle de imagen sin imagen en el escenario (Descent no trae imágenes de "
                                   "puzle): el evento se corta")
            if cls_ == "slide" and kv.get("puzzlelevel", "4").strip() == "1":
                crit(where, n, "class=slide con puzzlelevel=1: Valkyrie se cierra (usa 2 o más)")

    # ------------------------------------------------------------------ comprobaciones globales
    # EventManager.TriggerEvent: un Spawn de un monstruo cuyo grupo ya está en el tablero se junta con él
    # (MonstersGrouped), que se queda con el nombre del primero: un Defeated<Spawn> del que sale después no salta.
    # Cuál sale antes se toma del orden en que se lee el escenario (alcance.reading_order).
    order = {x: i for i, x in enumerate(reading_order(sc))}
    lejos = len(order) + 1
    for n, kv in C.items():
        trig = kv.get("trigger", "") if ctype[n] in EVENT_LIKE else ""
        pre = "DefeatedUnique" if trig.startswith("DefeatedUnique") else "Defeated" if trig.startswith("Defeated") else None
        if pre is None:
            continue
        sp = trig[len(pre):]
        mon = spawn_monster.get(sp)
        if mon is None:
            continue
        antes = sorted((s for s, m in spawn_monster.items() if s != sp and m == mon
                        and order.get(s, lejos) < order.get(sp, lejos)), key=lambda s: order.get(s, lejos))
        if antes:
            r.info(W(f"{n} ({sc.source.get(n, '?')})"),
                   f"trigger={trig}: {antes[0]} también trae {mon}, y en Descent un monstruo que sale cuando ya hay "
                   f"de los suyos en el tablero se junta con ese grupo, que se queda con el nombre del primero. Si "
                   f"el grupo de {antes[0]} sigue en el tablero, este evento nunca salta: un grupo aparte necesita "
                   f"otro monstruo o un CustomMonster (o cuenta con #monsters o Defeated{mon})")
    for n, (where, msg, k) in latent.items():
        r.warn(where, msg + (f" (y {k - 1} más)" if k > 1 else "") + ". Hoy no ocurre: nada alcanza este componente")
    for p, comps in sorted(undeclared.items()):
        lista = " ".join(sorted(set(comps))[:6]) + ("…" if len(set(comps)) > 6 else "")
        if p in pack_checked:
            r.info(W("packs"), f"usa contenido del pack {p} ({lista}) sin declararlo en packs=; como comprueba "
                               f"#{p}, vale si solo se usa cuando #{p} es 1")
        else:
            r.warn(W("packs"), f"usa contenido del pack {p} ({lista}) y {p} no está en packs= del escenario: quien "
                               f"no lo tenga activado verá fallar esas partes (una loseta que falta cierra Valkyrie). "
                               f"Declara el pack o ramifica con #{p}")
    unreach = [n for n in C if ctype[n] in ("Event", "Spawn", "Puzzle") and n not in reach]
    if unreach:
        r.info(W("eventos"), f"{len(unreach)} evento(s) que ningún disparador, botón ni ficha alcanza: "
                             f"{' '.join(unreach[:12])}{'…' if len(unreach) > 12 else ''}")
    pkg_info["reach"][folder] = reach
    if not start_events and not startround_events:
        r.warn(W("eventos"), "ningún evento con trigger=EventStart (ni StartRound): no pasa nada al empezar")
    if len(start_events) > 1:
        r.warn(W("eventos"), f"{len(start_events)} eventos con trigger=EventStart ({', '.join(start_events)}): el orden "
                             f"no es fiable; usa uno solo que encadene los demás")
    for e in shop_events:
        r.info(W(e), "añade 2 o más QItem: en Descent esto ABRE LA TIENDA (los objetos no se entregan). Los botones "
                     "del evento salen a la izquierda de la tienda")
    if shop_events and not removes_shop:
        r.warn(W("tienda"), "abre una tienda pero ningún evento hace remove=#shop: Valkyrie no la cierra nunca "
                            "(ni al cambiar de aventura)")
    for n in C:
        if ctype[n] == "MPlace" and n not in placements_used:
            r.info(W(n), "MPlace que ningún Spawn usa en sus placementN")
    # UI que nada quita: mientras está, los retratos de los héroes no abren su ventana (Quest.UIItemsPresent)
    removed = {c for kv in C.values() for c in kv.get("remove", "").split()}

    def leads_to_end(start):
        """Si desde ese evento (botones y lo que añade) se llega a uno que pone $end o cambia de aventura."""
        todo, seen = [start], set()
        while todo:
            e = todo.pop()
            if e in seen:
                continue
            seen.add(e)
            kv = C.get(e)
            if kv is None:
                if e.lower().endswith(".ini"):
                    return True
                continue
            if re.search(r"(^|\s)\$end,=,(?!0(\s|$))", kv.get("operations", "")):
                return True
            for k, v in kv.items():
                if re.fullmatch(r"event\d+", k):
                    todo.extend(v.split())
            todo.extend(x for x in kv.get("add", "").split() if ctype.get(x) == "UI")
        return False

    if sc.of_type("Tile") and not removed & {"#uicomponents", "#boardcomponents"}:
        for n in C:
            if ctype[n] == "UI" and n in add_refs and n not in removed and n in reach \
                    and not any(leads_to_end(e) for e in add_refs[n]) and not leads_to_end(n):
                (r.info if quest_switch else r.warn)(
                    W(n), "esta UI se añade y ningún evento la quita: mientras está en el tablero, pulsar un héroe no "
                          "abre su ventana (ni fin del turno ni KO)" +
                          (" (un cambio de aventura sí la quita)" if quest_switch else ""))
    # variables
    for v in sorted(set(var_set) | set(var_test)):
        if v.startswith("#") and v not in D2E_VARS_R and not v.startswith("#rand") and v[1:] not in CAT["packs"] \
                and v[1:] not in CAT["heroes"] and v[1:] not in CAT["classes"] and v not in ("#eliminated",):
            if v in var_set:
                continue
            r.info(W("variables"), f"'{v}' no es una variable de Valkyrie en Descent (vale siempre 0)")
        if v.startswith("$") and v not in D2E_VARS_W:
            if v.startswith("$%"):
                r.info(W("variables"), f"'{v}': variable $% propia; se conserva entre aventuras (mejor usa %)")
            else:
                r.warn(W("variables"), f"'{v}' empieza por $ pero no es una variable de Valkyrie en Descent "
                                       f"($ son las del programa); usa un nombre normal o % para la campaña")
        if len(v) < 2:
            pkg_info["short_vars"].append((tag, v))
    for v in list(var_test) + [x for x in var_quota if x not in var_test]:
        if v not in var_set and not v.startswith(("#", "$", "%")) and not NUM_RE.match(v):
            r.info(W("variables"), f"'{v}' se comprueba pero ninguna operación la cambia (vale 0)")
    if "#eliminated" in var_test:
        r.warn(W("variables"), "#eliminated solo lo cambia el menú de Mansiones: en Descent vale siempre 0")
    pkg_info["quest_switch"].extend(quest_switch)
    pkg_info["end_setters"].extend(end_setters)
    pkg_info["nomorale"][folder] = nomorale_events

    # NoMorale: cadena hasta $end o hasta reponer la moral. Un cambio de aventura vacía la pila de eventos, pero
    # $%morale pasa a la siguiente: si allí hay un evento de NoMorale, salta en su primer evento, salvo que su
    # EventStart reponga la moral.
    def start_resets_morale(target):
        qpath = target_quest(root, target)
        try:
            tsc = Scenario.load(os.path.dirname(qpath))
        except Exception:
            return True
        comps = tsc.components.values()
        if not any(kv.get("trigger") == "NoMorale" for kv in comps):
            return True
        return any(kv.get("trigger") == "EventStart" and re.search(r"\$%morale,[=+]", kv.get("operations", ""))
                   for kv in comps)

    def leads_out(name, seen):
        if name in seen or name not in C:
            return False
        seen.add(name)
        kv = C[name]
        ops = kv.get("operations", "")
        if re.search(r"\$end,=,[1-9]", ops) or re.search(r"\$%morale,[=+]", ops):
            return True
        for k, v in kv.items():
            if re.fullmatch(r"event\d+", k):
                for tg in v.split():
                    if tg.lower().endswith("quest.ini"):
                        if start_resets_morale(tg):
                            return True
                    elif leads_out(tg, seen):
                        return True
        return False
    if not nomorale_events and is_root and not quest_switch:
        r.warn(W("derrota"), "ningún evento con trigger=NoMorale: si la moral se agota no pasa nada (en Descent la "
                             "derrota por moral la programa el escenario)")
    def guarded(name):
        """El propio evento se apaga: sus operations cambian una variable de sus vartests (NoMoraleDone…)."""
        kv = C.get(name, {})
        tested = set(re.findall(r"VarOperation:([^,\s]+),", kv.get("vartests", "")))
        changed = {op.split(",")[0] for op in kv.get("operations", "").split() if op.count(",") >= 2}
        return bool(tested & changed)
    for e in nomorale_events:
        if not guarded(e) and not leads_out(e, set()):
            r.warn(W(e), "el evento de NoMorale no termina la partida ($end,=,1) ni repone $%morale: mientras la "
                         "moral siga por debajo de 0, Valkyrie lo vuelve a disparar tras cada evento. Si salta a otra "
                         "aventura que tiene su propio NoMorale, allí salta nada más empezar: pon $%morale,=,0 antes "
                         "del salto")

    # textos con marcas
    for lang, loc in sc.localizations.items():
        for k, v in loc.entries.items():
            for dic, ref in lookups(v):
                if ref is None:
                    r.error(W(f"textos {lang}"), f"{k}: una búsqueda {{{dic}:… que no se cierra (falta su '}}'): "
                                                 f"Valkyrie lanza una excepción al enseñar este texto y el evento no sigue")
                elif dic == "qst" and sc.text(lang, ref) is None:
                    r.warn(W(f"textos {lang}"), f"{k}: {{qst:{ref}}} no existe")
                elif dic == "ffg" and ref not in FFG_KEYS:
                    r.info(W(f"textos {lang}"), f"{k}: {{ffg:{ref}}} no está entre las claves que usa Valkyrie: solo "
                                                f"funcionará si existe en la importación")
            for m in MARK_RE.finditer(v):
                mark, arg = m.group(1), m.group(2)
                if mark in D2E_SYMBOLS or mark in OTHER_MARKS:
                    if mark == "c" and arg and arg not in names:
                        r.warn(W(f"textos {lang}"), f"{k}: {{c:{arg}}} no es un componente del escenario")
                    continue
                if mark in MOM_SYMBOLS:
                    r.warn(W(f"textos {lang}"), f"{k}: {{{mark}}} es un símbolo de Mansiones; en Descent se verá tal cual")
                elif mark.startswith("rnd"):
                    continue
                elif mark in ("var", "type"):
                    continue
    return sc


def check_map(sc, r, tag, reach):
    occ, unknown = G.board(sc)
    C = sc.components
    if unknown:
        r.info(tag + "mapa", f"losetas sin geometría conocida (no se comprueba su posición): {' '.join(unknown)}")
    over = defaultdict(set)
    for s, tl in occ.items():
        if len(tl) > 1:
            over[tuple(sorted(tl))].add(s)
    groups = defaultdict(set)
    for n in sc.of_type("Tile"):
        groups[n]
    # las losetas que se pisan pueden no estar a la vez (variantes); se avisa si comparten evento de add
    together = defaultdict(set)
    for n, kv in C.items():
        adds = [x for x in kv.get("add", "").split() if x in C and component_type(x) == "Tile"]
        for x in adds:
            together[x].update(adds)
    for tl, sqs in over.items():
        same_add = any(set(tl) <= together.get(x, set()) for x in tl)
        msg = f"las losetas {' y '.join(tl)} se solapan en {len(sqs)} casilla(s), p. ej. {sorted(sqs)[0]}"
        if same_add:
            r.warn(tag + "mapa", msg + " (se añaden en el mismo evento)")
        else:
            r.info(tag + "mapa", msg + " (si son variantes que no están a la vez, ignóralo)")
    sides = Counter(C[n].get("side", "") for n in sc.of_type("Tile"))
    seen_rev = set()
    for s, k in sides.items():
        s2 = s if s in CAT["tiles"] else "TileSide" + s
        d = CAT["tiles"].get(s2, {})
        numbered = re.fullmatch(r"\d+[AB]", d.get("nombre", "")) is not None and d.get("pack") not in ("DooM",)
        if not numbered:
            continue          # conectores (terminales, extensiones, transiciones…) hay varios en la caja
        rev = d.get("reverso", "")
        if rev and rev in sides and (rev, s2) not in seen_rev:
            seen_rev.add((s2, rev))
            r.info(tag + "mapa", f"usa las dos caras de la misma pieza ({s2} y {rev}): solo vale si no están a la vez")
        if k > 1:
            r.info(tag + "mapa", f"{s2} aparece {k} veces: en la caja solo hay una pieza con ese número (vale si no "
                                 f"están a la vez)")
    if not occ:
        return
    for n in sc.of_type("Token"):
        kv = C[n]
        x, y = G.num(kv.get("xposition")), G.num(kv.get("yposition"))
        size = kv.get("tokensize", "") or "small"
        fp = G.footprint(x, y, size if size in G.SIZE_WH else "small")
        if not any(s in occ for s in fp):
            r.info(tag + n, f"ficha en ({x:g}, {y:g}), fuera de las losetas (vale para fichas de reglas apartadas)")
    for n in sc.of_type("Door"):
        kv = C[n]
        x, y, rot = G.num(kv.get("xposition")), G.num(kv.get("yposition")), int(G.num(kv.get("rotation"), 0))
        pairs = G.door_sides(x, y, rot)
        a_side = [p[0] in occ for p in pairs]
        b_side = [p[1] in occ for p in pairs]
        if not any(a_side + b_side):
            r.warn(tag + n, f"puerta en ({x:g}, {y:g}) rot {rot} fuera de las losetas")
        elif not (all(a_side) and all(b_side)):
            r.info(tag + n, f"puerta en ({x:g}, {y:g}) rot {rot} con casillas solo a un lado (borde del mapa o salida)")
    for n in sc.of_type("Spawn"):
        kv = C[n]
        if n not in reach:
            continue
        mons = kv.get("monster", "").split()
        m = next((resolve_monster(x, C) for x in mons if resolve_monster(x, C)), None)
        size = monster_size(m, C) if m else "small"
        for k, v in kv.items():
            mm = re.fullmatch(r"placement(\d+)", k)
            if not mm:
                continue
            used = []
            for p in v.split():
                if p not in C:
                    continue
                pk = C[p]
                psize = pk.get("tokensize", "") or size
                fp = G.footprint(G.num(pk.get("xposition")), G.num(pk.get("yposition")),
                                 psize if psize in G.SIZE_WH else size, is_true(pk.get("rotate", "false")))
                if not all(s in occ for s in fp):
                    r.warn(tag + n, f"{k}: {p} en ({G.num(pk.get('xposition')):g}, {G.num(pk.get('yposition')):g}) "
                                    f"deja {'la figura' if size == 'small' else 'parte de la figura (' + size + ')'} "
                                    f"fuera de las losetas")
                clash = set(fp) & set(s for f in used for s in f)
                if clash:
                    r.warn(tag + n, f"{k}: {p} se pisa con otra casilla del mismo grupo en {sorted(clash)[0]}")
                used.append(fp)


def output(r, a, pkg):
    items = r.items
    if a.sin_info:
        items = [i for i in items if i[0] != "INFO"]
    if a.json:
        print(json.dumps([{"nivel": l, "donde": w, "mensaje": m} for l, w, m in items], ensure_ascii=False, indent=1))
    else:
        order = {"ERROR": 0, "AVISO": 1, "INFO": 2}
        for l, w, m in sorted(items, key=lambda x: order[x[0]]):
            print(f"{l:5} | {w}: {m}")
        c = Counter(l for l, _, _ in r.items)
        print(f"\n{len(pkg.quests)} aventura(s). Errores: {c['ERROR']}  Avisos: {c['AVISO']}  Info: {c['INFO']}")
        if c["ERROR"] == 0 and c["AVISO"] == 0:
            print("Sin errores ni avisos.")
    return 1 if any(l == "ERROR" for l, _, _ in r.items) else 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("escenario")
    ap.add_argument("--json", action="store_true", help="salida en JSON")
    ap.add_argument("--sin-info", action="store_true", help="oculta los INFO")
    ap.add_argument("--sin-mapa", action="store_true", help="no comprueba la geometría del mapa")
    ap.add_argument("--solo", help="valida solo esta subcarpeta (ruta relativa) además de los saltos")
    a = ap.parse_args()
    root = os.path.abspath(a.escenario)
    if not os.path.exists(os.path.join(root, "quest.ini")):
        print(f"ERROR: no existe {os.path.join(root, 'quest.ini')}")
        sys.exit(1)
    pkg = Package(root)
    r = Report()
    root_sc = Scenario.load(root)
    info = {"packs": packs_declared(root_sc), "quest_switch": [], "end_setters": [], "short_vars": [],
            "nomorale": {}, "fame_items": [], "reach": {}}
    fame_events = {}
    restock = set()
    scs = {}
    for qd in pkg.quests:
        if a.solo and qd != root and os.path.relpath(qd, root).replace("\\", "/") != a.solo.strip("/"):
            continue
        sc = validate_quest(qd, root, r, a, info)
        scs[qd] = sc
        for n, kv in sc.components.items():
            ops = kv.get("operations", "")
            if re.search(r"\$%fame(noteworthy|impressive|celebrated|heroic|legendary),=", ops):
                fame_events.setdefault(qd, []).append(n)
            if re.search(r"(^|\s)\$restock,=,1(\s|$)", ops):
                restock.add(qd)
        if not a.sin_mapa:
            tag = os.path.relpath(qd, root).replace("\\", "/")
            tag = "" if tag == "." else tag + ": "
            check_map(sc, r, tag, info["reach"].get(qd, set()))
    # paquete
    if info["quest_switch"]:
        for tag, v in info["short_vars"]:
            r.error((tag or "") + "variables", f"variable '{v}' de un solo carácter: al cambiar de aventura "
                                               f"VarManager.TrimQuest lanza una excepción (usa 2 o más)")
        targets = {os.path.normpath(target_quest(root, t)) for _, t in info["quest_switch"]}
        for qd in pkg.quests:
            if qd == root:
                continue
            if os.path.normpath(os.path.join(qd, "quest.ini")) not in targets:
                r.info(os.path.relpath(qd, root), "ninguna aventura del paquete salta a este quest.ini")
                continue
            sc = scs.get(qd)
            if sc is None:
                continue
            langs = list(sc.localizations)
            dl = sc.default_language
            where = os.path.relpath(qd, root).replace("\\", "/") + ": textos"
            if dl != "English" and "English" not in langs:
                r.warn(where, f"solo en {', '.join(langs) or 'ningún idioma'}: tras un cambio de aventura Valkyrie "
                              f"carga el idioma del jugador, el inglés y el de reserva, pero no el defaultlanguage "
                              f"({dl}). Quien juegue con Valkyrie en otro idioma verá los diálogos vacíos: añade "
                              f"Localization.English.txt")
            elif dl != "English" and "English" in langs:
                base = sc.localizations[dl].entries if dl in sc.localizations else {}
                en = sc.localizations["English"].entries
                miss = [k for k, v in base.items() if v.strip() and not en.get(k, "").strip()]
                if miss:
                    r.warn(where, f"{len(miss)} texto(s) sin traducir al inglés (p. ej. {miss[0]}): tras un cambio de "
                                  f"aventura, quien no juegue en {dl} no los verá")
    else:
        for tag, v in info["short_vars"]:
            r.info((tag or "") + "variables", f"variable '{v}' de un solo carácter: si algún día esto pasa a ser una "
                                              f"campaña, Valkyrie se cerrará al cambiar de aventura")
    if not info["end_setters"]:
        r.warn("final", "ningún evento pone $end,=,1: la partida no termina nunca (ni victoria ni derrota)")
    if info["fame_items"] and not fame_events:
        names_ = [n for _, n in info["fame_items"]]
        r.warn("tienda", f"{', '.join(names_[:4])}…: objetos sorteados por rasgos con fama, pero ningún evento fija "
                         f"los umbrales $%famenoteworthy…$%famelegendary. Con todos a 0 el nivel de fama es "
                         f"'legendary' y solo salen objetos cuyo maxfame sea legendary (del Acto I, muy pocos; ver "
                         f"patrones.md §12 y §13)")
    elif info["fame_items"]:
        # Quest.GenerateItemSelection runs when a quest loads, before its EventStart, and again on $restock
        for qd in sorted({q for q, _ in info["fame_items"]}):
            before = [q for q in fame_events if q != qd and qd != root]
            if before or qd in restock:
                continue
            tag = os.path.relpath(qd, root).replace("\\", "/")
            tag = "" if tag == "." else tag + ": "
            items_ = [n for q, n in info["fame_items"] if q == qd]
            evs = fame_events.get(qd, [])
            r.warn(tag + "tienda", f"{', '.join(items_[:4])}: Valkyrie sortea los objetos al cargar la aventura, "
                                   f"antes de EventStart, cuando aún no hay umbrales de fama (nivel 'legendary'). "
                                   f"Añade $restock,=,1 a las operations del evento que los fija"
                                   f"{' (' + ', '.join(evs[:2]) + ')' if evs else ''} para volver a sortearlos")
    sys.exit(output(r, a, pkg))


if __name__ == "__main__":
    main()
