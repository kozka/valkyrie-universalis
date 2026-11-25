#!/usr/bin/env python3
"""
validar.py - Validador de escenarios de Valkyrie para Mansiones de la Locura 2ª ed.

Uso:
    python validar.py <carpeta_escenario> [--json] [--sin-info] [--sin-mapa]

Niveles:
  ERROR  Valkyrie se cierra, no carga el escenario o lo carga roto.
  AVISO  Carga, pero algo no funcionará como esperas (cadenas cortadas, textos que faltan...).
  INFO   Sugerencias y comprobaciones de estilo.

Todas las reglas se basan en el comportamiento real del código de Valkyrie 3.28
(ver references/formato-escenario.md). Sale con código 1 si hay ERRORES.
"""
import argparse
import json
import math
import os
import re
import sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from valkyrie_io import (Scenario, component_type, find_case_insensitive, parse_vartests,  # noqa: E402
                         CURRENT_FORMAT, MIN_FORMAT, LANGUAGES, EVENT_LIKE)

CAT = json.load(open(os.path.join(SKILL, "assets", "catalogo.json"), encoding="utf-8"))
OFFICIAL_ACTIVATIONS = set(CAT.get("activation_ids", []))
FFG_KEYS = set(CAT.get("ffg_keys", []))
GEO_PATH = os.path.join(SKILL, "assets", "geometria_losetas.json")

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
            "RichText": "richText", "clickEffect": "clickeffect", "fadeSpeed": "fadespeed",
            "puzzleLevel": "puzzlelevel", "puzzleAltLevel": "puzzlealtlevel", "varTests": "vartests",
            "Operations": "operations", "Trigger": "trigger", "Display": "display", "Buttons": "buttons",
            "imagePlace": "imageplace", "evadeEvent": "evadeevent", "horrorEvent": "horrorevent",
            "healthPerHero": "healthperhero", "uniqueHealth": "uniquehealth", "uniqueHealthHero": "uniquehealthhero",
            "randomEvents": "randomevents", "minHero": "minhero", "maxHero": "maxhero",
            "xPosition": "xposition", "yPosition": "yposition", "Rotation": "rotation", "Type": "type"}
SPECIAL_REMOVE = {"#monsters", "#boardcomponents", "#shop", "#uicomponents", "#doors", "#tiles", "#tokens", "#qitems"}
FIXED_TRIGGERS = {"EventStart", "StartRound", "EndRound", "EndInvestigatorTurn", "Mythos",
                  "BeforeMonsterActivation", "StartFinalRound", "Eliminated", "NoMorale"}
COLOR_NAMES = {"black", "white", "red", "lime", "blue", "yellow", "aqua", "cyan", "magenta", "fuchsia",
               "silver", "gray", "maroon", "olive", "green", "purple", "teal", "navy", "transparent"}
TOKEN_SIZES = {"small", "medium", "huge", "massive", "Original"}
ATTACK_TYPES = {"heavy", "bladed", "firearm", "spell", "unarmed"}
MONSTER_CATEGORIES = {"humanoid", "beast", "spirit", "fleshless", "snakeperson", "horror"}
PACK_SYMBOLS = {"MAD01", "MAD06", "MAD09", "MAD20", "MAD21", "MAD22", "MAD23", "MAD25", "MAD26", "MAD27", "MAD28"}
SKILL_SYMBOLS = {"will", "strength", "agility", "lore", "influence", "observation", "success", "clue", "action"}
BUILTIN_VARS_W = {"$end", "$fire", "$restock"}
NUM_RE = re.compile(r"^-?\d+(\.\d+)?$")
# figuras de cada monstruo en su caja (expansiones.md §14)
FIGURAS = {"MonsterCultist": 6, "MonsterDeepOne": 4, "MonsterDeepOneHybrid": 4, "MonsterGhost": 2,
           "MonsterHuntingHorror": 2, "MonsterRiot": 2, "MonsterStarSpawn": 2, "MonsterChildOfDagon": 1,
           "MonsterPriestOfDagon": 1, "MonsterZombie": 4, "MonsterCthonian": 2, "MonsterHoundOfTindalos": 2,
           "MonsterManiac": 2, "MonsterMiGo": 2, "MonsterShoggoth": 2, "MonsterWitch": 2, "MonsterCultLeader": 2,
           "MonsterByakhee": 2, "MonsterCrawlingOne": 2, "MonsterChildOfTheGoat": 2, "MonsterDarkDruid": 2,
           "MonsterDarkYoung": 1, "MonsterGoatSpawn": 2, "MonsterNightgaunt": 2, "MonsterDunwichHorror": 1,
           "MonsterWizard": 1, "MonsterThrall": 4, "MonsterSkeleton": 2, "MonsterHiredGun": 2, "MonsterLloigor": 1,
           "MonsterStarVampire": 2, "MonsterWraith": 2, "MonsterWarlock": 2, "MonsterDimensionalShambler": 2,
           "MonsterHuntingDeepOne": 2, "MonsterFormlessSpawn": 1, "MonsterFeatheredSerpent": 2,
           "MonsterTempleGuardian": 2, "MonsterSerpentPerson": 3, "MonsterAncientBasilisk": 1}


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


def packs_declared(sc):
    declared = set(sc.quest.get("packs", "").split()) | {"MoMBase"}
    alias = {"MoM1E": ["MoM1ET", "MoM1EI", "MoM1EM"], "FA": ["FAT", "FAI", "FAM"], "CotW": ["CotWT", "CotWI", "CotWM"]}
    for k, v in alias.items():
        if k in declared:
            declared |= set(v)
    for p in list(declared):
        declared |= set(CAT["packs"].get(p, {}).get("clone", []))
    return declared


# Diccionarios que puede buscar un texto al jugar: el escenario, Valkyrie, la importación, los packs y el de
# The Cult of Sentinel Hill (LocalizationRead; GameSelectionScreen, ContentLoader)
DICTS = ("qst", "val", "ffg", "pck", "csh")
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


def campaign_root(folder):
    """La carpeta más de fuera, por encima, con un quest.ini: la del escenario principal de un paquete, desde la
    que Valkyrie resuelve los cambios de aventura (originalPath). La propia si no está dentro de otro."""
    root, cur = folder, os.path.dirname(folder)
    while cur and cur != os.path.dirname(cur):
        if os.path.exists(os.path.join(cur, "quest.ini")):
            root = cur
        cur = os.path.dirname(cur)
    return root


def quest_target(root, name):
    """La ruta de un cambio de aventura: relativa a la carpeta del quest.ini principal (EventManager.QueueEvent)."""
    p = name.replace("\\", "/")
    while p.startswith("/"):
        p = p[1:]
    return os.path.normpath(os.path.join(root, p))


def quest_switches(sc):
    """Los cambios de aventura de un escenario: (evento, ruta) de cada eventN que acaba en quest.ini."""
    out = []
    for n, kv in sc.components.items():
        for k, v in kv.items():
            if re.fullmatch(r"event\d+", k):
                out.extend((n, tg) for tg in v.split() if tg.lower().endswith("quest.ini"))
    return out


def check_varop(r, where, text, writing):
    parts = [p for p in text.split(",") if p != ""]
    if len(parts) != 3:
        r.error(where, f"operación/condición mal formada '{text}': necesita exactamente 'variable,operador,valor' "
                       f"(Valkyrie lanza una excepción)")
        return None
    var, op, val = parts
    if writing:
        if op not in {"=", "+", "-", "*", "/", "%"}:
            r.error(where, f"operador '{op}' no válido en operations (usa = + - * / %)")
        if var.startswith("#"):
            r.warn(where, f"'{var}' es de solo lectura: la operación '{text}' se ignora")
    else:
        if op not in {"==", "!=", ">=", "<=", ">", "<"}:
            r.error(where, f"comparador '{op}' no válido en vartests (usa == != >= <= > <); "
                           f"un comparador desconocido siempre da falso")
    if "," in val or " " in var:
        r.error(where, f"'{text}': ni la variable ni el valor pueden contener comas o espacios")
    return var, op, val


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("escenario")
    ap.add_argument("--json", action="store_true", help="salida en JSON")
    ap.add_argument("--sin-info", action="store_true", help="oculta los INFO")
    ap.add_argument("--sin-mapa", action="store_true", help="no comprueba geometría del mapa")
    a = ap.parse_args()
    r = Report()
    folder = os.path.abspath(a.escenario)
    if not os.path.exists(os.path.join(folder, "quest.ini")):
        print(f"ERROR: no existe {os.path.join(folder, 'quest.ini')}")
        sys.exit(1)
    sc = Scenario.load(folder)
    for e in sc.errors:
        r.error("carga", e)
    for w in sc.warnings:
        if "solo espacios" in w or "mezcla de finales" in w or "sin cerrar" in w:
            r.error("ficheros", w)
        elif "clave duplicada" in w or "sección duplicada" in w:
            r.warn("ficheros", w)
        else:
            r.info("ficheros", w)

    root = campaign_root(folder)
    is_root = root == folder
    C = sc.components
    ctype = {n: component_type(n) for n in C}
    names = set(C)
    declared = packs_declared(sc)
    langs = list(sc.localizations.keys())
    deflang = sc.default_language

    # ------------------------------------------------------------------ quest.ini
    q = sc.quest
    fmt = q.get("format", "")
    if not fmt:
        r.error("quest.ini", "falta 'format=' (sin él vale 0 y el escenario no aparece). Usa format=21")
    else:
        try:
            fv = int(fmt)
            if fv > CURRENT_FORMAT or fv < MIN_FORMAT:
                r.error("quest.ini", f"format={fv} fuera del rango admitido ({MIN_FORMAT}-{CURRENT_FORMAT}): "
                                     f"el escenario no aparecerá")
        except ValueError:
            r.error("quest.ini", f"format='{fmt}' no es un número")
            fv = 0
    if q.get("type", "") != "MoM":
        r.error("quest.ini", f"type='{q.get('type', '')}': debe ser 'MoM' para Mansiones de la Locura")
    if q.get("hidden", "False").lower() == "true" and is_root:
        r.warn("quest.ini", "hidden=True: el escenario no saldrá en la lista (solo para subescenarios)")
    if "defaultlanguage" not in q:
        r.warn("quest.ini", "falta defaultlanguage (se asume English)")
    elif deflang not in LANGUAGES:
        r.error("quest.ini", f"defaultlanguage='{deflang}' no es un idioma de Valkyrie ({', '.join(LANGUAGES)})")
    if deflang not in sc.localizations:
        r.error("quest.ini", f"no hay fichero de localización con '.,{deflang}' (idioma por defecto)")
    for p in q.get("packs", "").split():
        if p not in CAT["packs"] and p not in ("MoM1E", "FA", "CotW"):
            r.warn("quest.ini", f"pack '{p}' desconocido (¿content pack de la comunidad?)")
        if p in ("RN", "SM"):
            r.info("quest.ini", f"pack '{p}': mejor usar los IDs del kit de conversión "
                                f"({' '.join(CAT['packs'][p]['clone'])}) para admitir también la 1ª edición física")
        if p == "MoMBase":
            r.info("quest.ini", "no hace falta declarar MoMBase en packs")
    for k in ("difficulty",):
        if k in q:
            try:
                d = float(q[k])
                if not 0 <= d <= 1:
                    r.warn("quest.ini", f"difficulty={d}: debe estar entre 0 y 1 (×5 = estrellas)")
            except ValueError:
                r.warn("quest.ini", f"difficulty='{q[k]}' no es un número (usa punto decimal)")
    if not q.get("lengthmin") or not q.get("lengthmax"):
        r.info("quest.ini", "pon lengthmin/lengthmax (duración estimada en minutos)")
    img = q.get("image", "")
    if img:
        if " " in img:
            r.warn("quest.ini", f"image='{img}' con espacios: el paquete fallará")
        if not os.path.exists(os.path.join(folder, img)):
            r.warn("quest.ini", f"la imagen de portada '{img}' no existe")
    else:
        r.info("quest.ini", "sin imagen de portada (image=): recomendable ~200x200 JPG")
    base = os.path.basename(folder)
    if base.startswith("EditorScenario") or base.startswith("Scenario"):
        r.warn("carpeta", f"la carpeta se llama '{base}': renómbrala con un identificador propio (sin espacios). "
                          f"Con 'EditorScenario…' no sale la pantalla final y los revisores lo rechazan")
    if " " in base:
        r.error("carpeta", f"el nombre de carpeta '{base}' tiene espacios: el paquete .valkyrie fallará")
    for kk in ("quest.name", "quest.description", "quest.synopsys", "quest.authors"):
        if sc.text(deflang, kk) is None:
            (r.warn if kk == "quest.name" else r.info)("textos", f"falta '{kk}' en la localización")

    # ------------------------------------------------------------------ componentes
    def T(key):
        return sc.text(deflang, key)

    add_refs = defaultdict(list)       # componente añadido -> eventos que lo añaden
    remove_refs = defaultdict(list)
    next_refs = defaultdict(list)      # evento destino -> origen
    var_set = defaultdict(list)
    var_test = defaultdict(list)
    var_quota = defaultdict(list)
    start_events = []
    qitems_per_event = {}

    for n, kv in C.items():
        t = ctype[n]
        where = f"{n} ({sc.source.get(n, '?')})"
        if t is None:
            continue
        # claves
        for k in kv:
            if not key_allowed(t, k):
                if k in CASE_FIX:
                    r.error(where, f"clave '{k}' mal escrita: Valkyrie solo entiende '{CASE_FIX[k]}' "
                                   f"(las claves distinguen mayúsculas)")
                elif k.lower() in {x.lower() for x in TYPE_KEYS.get(t, set())}:
                    good = [x for x in TYPE_KEYS.get(t, set()) if x.lower() == k.lower()][0]
                    r.error(where, f"clave '{k}' con mayúsculas incorrectas: debe ser '{good}'")
                elif re.fullmatch(r"(?i)event\d+condition(action)?", k):
                    r.error(where, f"clave '{k}': se escribe 'eventNCondition' / 'eventNConditionAction'")
                else:
                    r.info(where, f"clave '{k}' desconocida para {t}: Valkyrie la ignora")
        # posiciones
        for pk in ("xposition", "yposition"):
            if pk in kv:
                v = kv[pk]
                if "," in v:
                    r.error(where, f"{pk}='{v}' usa coma decimal: Valkyrie leerá 0. Usa punto (p. ej. 1.75)")
                else:
                    try:
                        float(v)
                    except ValueError:
                        r.error(where, f"{pk}='{v}' no es un número (Valkyrie leerá 0)")
        if "rotation" in kv and t in ("Tile", "Token", "Door"):
            try:
                rv = int(kv["rotation"])
                if t == "Tile" and rv % 90 != 0:
                    r.warn(where, f"rotation={rv}: las losetas solo deben girar 0/90/180/270")
            except ValueError:
                r.error(where, f"rotation='{kv['rotation']}' debe ser un entero (Valkyrie leerá 0)")
        # operaciones y condiciones
        for op in kv.get("operations", "").split():
            res = check_varop(r, where, op, True)
            if res:
                var_set[res[0]].append(n)
                if not res[2][:1].isdigit() and res[2][:1] not in "-." and not res[2].startswith("#rand"):
                    var_test[res[2]].append(n)
        tests_keys = [k for k in kv if k == "vartests" or re.fullmatch(r"event\d+Condition", k)]
        for tk in tests_keys:
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
                    if data not in ("(", ")"):
                        r.error(where, f"{tk}: paréntesis '{data}' no válido")
                else:
                    r.error(where, f"{tk}: elemento '{cls_}:{data}' no reconocido (debe ser VarOperation:, "
                                   f"VarTestsLogicalOperator: o VarTestsParenthesis:). Se ignora")
                prev = cls_ if cls_ != "VarTestsParenthesis" else prev
            if depth != 0:
                r.error(where, f"{tk}: paréntesis desparejados")
        if "conditions" in kv:
            if "vartests" in kv:
                r.warn(where, "tiene 'conditions' y 'vartests': conditions se ignora")
            else:
                r.info(where, "usa 'conditions' (formato antiguo): mejor 'vartests'")
                for c in kv["conditions"].split():
                    res = check_varop(r, where, c, False)
                    if res:
                        var_test[res[0]].append(n)
        if t == "Token" and kv.get("vartests"):
            r.warn(where, "las fichas IGNORAN vartests: la ficha se podrá pulsar siempre. Pon la condición en "
                          "el evento de destino o en event1Condition")

        # ------------------ eventos y derivados
        if t in EVENT_LIKE:
            display = kv.get("display", "true").lower() != "false"
            mh = [k for k in ("minhero", "maxhero") if kv.get(k, "0").strip() not in ("", "0")]
            if mh:
                r.error(where, f"{'/'.join(mh)} en un evento: en Mansiones los retratos de los investigadores se quitan "
                               f"al empezar la partida, así que nadie puede elegir y el botón NO avanza (la partida se "
                               f"queda bloqueada). Usa un botón por investigador (scripts/selector_investigador.py), "
                               f"un apodo o {{rnd:hero}} (patrones.md §5)")
            try:
                buttons = int(kv.get("buttons", "1" if display else "0") or 0)
            except ValueError:
                r.error(where, f"buttons='{kv.get('buttons')}' no es un entero")
                buttons = 0
            if display and "buttons" not in kv:
                buttons = 1
            ev_keys = sorted((int(m.group(1)), k) for k in kv for m in [re.fullmatch(r"event(\d+)", k)] if m)
            for idx, k in ev_keys:
                if idx > buttons or idx < 1:
                    if not display and buttons == 0 and idx == 1 and kv[k].strip():
                        r.warn(where, f"evento silencioso con {k}={kv[k]} pero sin buttons=1: la cadena se CORTA "
                                      f"aquí (Valkyrie solo lee eventN hasta 'buttons')")
                    elif kv[k].strip():
                        r.warn(where, f"{k} se ignora porque buttons={buttons}")
                    continue
                targets = kv[k].split()
                for tg in targets:
                    if tg.lower().endswith("quest.ini"):
                        tq = quest_target(root, tg)
                        if not os.path.exists(tq) and not find_case_insensitive(root, tg.replace("\\", "/").lstrip("/")):
                            r.warn(where, f"{k} apunta al subescenario '{tg}' que no existe (la ruta es relativa a la "
                                          f"carpeta del quest.ini PRINCIPAL, no a la de este escenario): Valkyrie "
                                          f"lo toma por un evento que no existe y no cambia de escenario")
                        continue
                    if tg not in names:
                        r.warn(where, f"{k} apunta a '{tg}', que no existe (se ignora en partida)")
                    else:
                        next_refs[tg].append(n)
                        if ctype[tg] not in EVENT_LIKE:
                            r.warn(where, f"{k} apunta a '{tg}', que es un {ctype[tg]} (no un evento): se ignora")
                ramificacion = all(C.get(tg, {}).get("vartests") for tg in targets[:-1] if tg in names)
                # un paso de una cadena: el primero sigue él mismo hacia el último (prueba esto y sigue)
                encadenado = all(targets[-1] in C.get(tg, {}).get("event1", "").split() for tg in targets[:-1])
                if len(targets) > 1 and kv.get("randomevents", "false").lower() != "true" and not ramificacion and not encadenado:
                    r.info(where, f"{k} lista {len(targets)} eventos: solo se ejecutará el PRIMERO habilitado "
                                  f"(no todos). Si querías encadenarlos, enlázalos uno tras otro")
                if len(targets) == 1 and kv.get("randomevents", "false").lower() == "true":
                    r.info(where, f"randomevents=true con un solo evento en {k}")
                cond = kv.get(f"event{idx}Condition")
                act = kv.get(f"event{idx}ConditionAction")
                if act and act.lower() not in ("none", "disable", "hide"):
                    r.error(where, f"event{idx}ConditionAction='{act}': usa disable, hide o none")
                if act and not cond:
                    r.info(where, f"event{idx}ConditionAction sin event{idx}Condition: no hace nada")
                bc = kv.get(f"buttoncolor{idx}")
                if bc and not is_color(bc):
                    r.error(where, f"buttoncolor{idx}='{bc}' no es un color válido (#RRGGBB o nombre HTML básico)")
            if not display and buttons > 1 and not any(f"event{i}Condition" in kv for i in range(1, buttons + 1)):
                r.warn(where, f"evento silencioso con {buttons} botones y sin condiciones de botón: siempre sigue "
                              f"por el botón 1; los demás nunca se usan")
            # textos
            if display and t not in ("Puzzle",):
                if T(f"{n}.text") is None and t in ("Event", "Spawn"):
                    r.info(where, "evento visible sin texto (.text): se mostrará un diálogo vacío")
                for i in range(1, buttons + 1):
                    if f"button{i}" in kv:
                        r.info(where, f"button{i} definido en el .ini: el editor lo pierde al guardar; mejor en la localización")
                        continue
                    has_events = bool(kv.get(f"event{i}", "").strip())
                    if T(f"{n}.button{i}") is None and (t not in ("Token", "UI", "Door") or has_events):
                        r.warn(where, f"falta el texto del botón {i} ('{n}.button{i}'): se verá la clave en pantalla")
            if t == "Puzzle" and T(f"{n}.button1") is None:
                r.info(where, f"falta '{n}.button1' (texto del botón del puzle)")
            # add/remove
            qi = 0
            for comp in kv.get("add", "").split():
                if comp not in names:
                    r.error(where, f"add={comp}: el componente no existe → Valkyrie SE CIERRA al ejecutar este evento")
                    continue
                add_refs[comp].append(n)
                ct = ctype[comp]
                if ct == "Spawn":
                    r.warn(where, f"add={comp}: los Spawn no se añaden con add (se ignora); ponlo en eventN o trigger")
                elif ct in ("Event", "Puzzle", "CustomMonster", "MPlace", "Activation"):
                    r.warn(where, f"add={comp}: un {ct} no se puede añadir al tablero (se ignora)")
                elif ct in ("QItem", "StartingItem"):
                    qi += 1
            if qi > 1:
                r.warn(where, f"añade {qi} QItem en el mismo evento: se entregan todos, pero la ventana no "
                              f"enseña ninguna carta de objeto (solo con un único QItem). Mejor uno por evento, "
                              f"encadenando eventos")
            for comp in kv.get("remove", "").split():
                if comp.startswith("#"):
                    if comp not in SPECIAL_REMOVE:
                        r.warn(where, f"remove={comp}: especial desconocido ({', '.join(sorted(SPECIAL_REMOVE))})")
                    elif comp in {"#uicomponents", "#doors", "#tiles", "#tokens", "#qitems"} and fv and fv < 20:
                        r.warn(where, f"remove={comp} necesita format≥20")
                    remove_refs[comp].append(n)
                    continue
                if comp not in names:
                    r.info(where, f"remove={comp}: no existe ese componente (no hace nada)")
                remove_refs[comp].append(n)
            ambos = sorted(set(kv.get("add", "").split()) & {c for c in kv.get("remove", "").split()
                                                             if not c.startswith("#")} - {n})
            objs = [c for c in ambos if ctype.get(c) in ("QItem", "StartingItem")]
            ambos = [c for c in ambos if c not in objs]
            if objs:
                r.info(where, f"entrega y quita {' '.join(objs)} en el mismo evento: no se queda en el inventario "
                              f"(vale si solo querías enseñarlo)")
            if ambos:
                r.warn(where, f"añade y quita {' '.join(ambos)} en el mismo evento: Valkyrie primero añade y luego "
                              f"quita, así que acaba{'n' if len(ambos) > 1 else ''} fuera del tablero. Si querías "
                              f"que siga{'n' if len(ambos) > 1 else ''}, quítalo de remove=")
            # trigger
            trig = kv.get("trigger", "")
            if trig:
                if trig == "EventStart":
                    start_events.append(n)
                if trig in FIXED_TRIGGERS:
                    pass
                elif re.fullmatch(r"EndRound\d+", trig):
                    pass
                elif trig.startswith("DefeatedUnique"):
                    r.warn(where, f"trigger={trig}: 'DefeatedUnique…' no se dispara en MoM; usa 'Defeated…'")
                elif trig.startswith("Defeated"):
                    x = trig[len("Defeated"):]
                    if not (x in CAT["monsters"] or x in names):
                        r.warn(where, f"trigger={trig}: '{x}' no es un tipo de monstruo, CustomMonster ni Spawn "
                                      f"del escenario (formato: DefeatedMonsterCultist o Defeated<NombreSpawn>)")
                elif trig.startswith("Var"):
                    pass
                else:
                    r.warn(where, f"trigger='{trig}' desconocido: este evento nunca se disparará solo")
            # audio
            for ak in ("audio",):
                av = kv.get(ak, "")
                if av:
                    check_media(r, where, folder, av, audio=True)
            if re.search(r"\.ogg\b", kv.get("music", "")) and any(
                    not p.lower().endswith(".ogg") and not p.startswith("Audio") for p in kv.get("music", "").split()):
                r.warn(where, "music= es una lista separada por espacios: un fichero con espacios en el nombre se "
                              "parte en trozos y no suena. Renómbralo sin espacios")
            for mv in kv.get("music", "").split():
                check_media(r, where, folder, mv, audio=True)
            # selección de investigadores
            if kv.get("hero") and kv["hero"] not in names:
                r.warn(where, f"hero={kv['hero']}: ese evento no existe")
            if kv.get("quota"):
                qv = kv["quota"]
                if not qv[0].isdigit():
                    var_quota[qv].append(n)      # quota=<variable>: el selector empieza en su valor
                    var_set[qv].append(n)        # y lo elegido se guarda en ella (DialogWindow.onQuota)
                if qv[0].isdigit():
                    if int(re.sub(r"\D.*", "", qv) or 0) > 10:
                        r.info(where, f"quota={qv}: el selector llega a 10 por intento (se acumula entre intentos)")
                    if buttons < 2:
                        r.info(where, "quota sin event2: si no se alcanza la cuota no pasa nada (añade buttons=2)")

        # ------------------ por tipo
        if t == "Tile":
            side = kv.get("side", "")
            if not side and not kv.get("customImage"):
                r.error(where, "loseta sin 'side' ni 'customImage' → Valkyrie se cierra")
            elif side and side not in CAT["tiles"]:
                r.error(where, f"side={side} no existe en Valkyrie → al mostrarla Valkyrie se cierra")
            elif side:
                p = CAT["tiles"][side]["pack"]
                if p not in declared and not set(CAT["tiles"][side].get("tambien", [])) & declared:
                    r.warn(where, f"{side} es de la expansión {p}, que no está en packs=")
            if kv.get("customImage"):
                check_media(r, where, folder, kv["customImage"], audio=False, fatal=True)
                if fv and fv < 21:
                    r.warn(where, "customImage en losetas necesita format=21")
        elif t == "Token":
            ty = kv.get("type", "")
            if not ty and not kv.get("customImage"):
                r.warn(where, "ficha sin type (se dibuja como TokenSearch)")
            elif ty and ty not in CAT["tokens"] and ty not in CAT["monsters"]:
                r.warn(where, f"type={ty} no existe (se dibujará como TokenSearch)")
            elif ty in CAT["tokens"]:
                p = CAT["tokens"][ty]["pack"]
                if p not in declared and not set(CAT["tokens"][ty].get("tambien", [])) & declared:
                    r.warn(where, f"{ty} es de la expansión {p}, que no está en packs=")
            ts = kv.get("tokensize", "")
            if ts and ts not in TOKEN_SIZES and not NUM_RE.match(ts):
                r.error(where, f"tokensize='{ts}' no válido: small, medium, huge, massive, Original o un número")
            if (ts or kv.get("customImage") or kv.get("clickeffect")) and fv and fv < 21:
                r.warn(where, "tokensize/customImage/clickeffect en fichas necesitan format=21")
            if kv.get("customImage"):
                check_media(r, where, folder, kv["customImage"], audio=False)
        elif t == "UI":
            im = kv.get("image", "")
            if im and im not in CAT["images"] and im not in CAT["puzzles"]:
                check_media(r, where, folder, im, audio=False)
            if not im and T(f"{n}.uitext") is None:
                r.info(where, "UI sin imagen ni texto (.uitext): no se verá nada")
            for ck in ("textcolor", "textbackgroundcolor"):
                if kv.get(ck) and not is_color(kv[ck]):
                    r.error(where, f"{ck}='{kv[ck]}' no es un color válido")
            if kv.get("halign") and kv["halign"] not in ("left", "right"):
                r.warn(where, f"halign='{kv['halign']}': solo left o right (otro valor = centro)")
            if kv.get("valign") and kv["valign"] not in ("top", "bottom"):
                r.warn(where, f"valign='{kv['valign']}': solo top o bottom (otro valor = centro)")
            if kv.get("textAlignment") and kv["textAlignment"].upper() not in ("TOP", "CENTER", "BOTTOM"):
                r.warn(where, f"textAlignment='{kv['textAlignment']}': TOP, CENTER o BOTTOM")
        elif t == "Spawn":
            ms = kv.get("monster", "").split()
            if not ms and not kv.get("traits") and not kv.get("traitpool"):
                r.error(where, "Spawn sin monster ni traits: no aparecerá nada")
            avail = []
            for m in ms:
                mm = m if (m.startswith("Monster") or m.startswith("CustomMonster") or m.startswith("Spawn")) else "Monster" + m
                if mm in CAT["monsters"]:
                    avail.append(CAT["monsters"][mm]["pack"])
                    avail.extend(CAT["monsters"][mm].get("tambien", []))
                elif mm in names:
                    avail.append("MoMBase")
                    if ctype[mm] == "Spawn":
                        next_refs[mm]  # referencia
                else:
                    r.warn(where, f"monster={m}: tipo desconocido")
            if ms and not kv.get("traits") and not kv.get("traitpool"):
                if avail and not any(p in declared for p in avail):
                    r.warn(where, f"ningún monstruo de '{kv.get('monster')}' está en los packs declarados: si al "
                                  f"jugador le falta la expansión no aparecerá nada. Añade uno del juego base al final")
        elif t == "CustomMonster":
            b = kv.get("base", "")
            if b and b not in CAT["monsters"]:
                r.warn(where, f"base={b}: no es un monstruo de Valkyrie")
            tr = set(kv.get("traits", "").split())
            if not b and not (tr & MONSTER_CATEGORIES):
                r.warn(where, "sin base ni rasgo de categoría (humanoid, beast, spirit…): no tendrá opciones de ataque")
            act = kv.get("activation", "")
            if not act and not b:
                usado = any(n in C[x].get("monster", "").split() for x in C if ctype[x] == "Spawn")
                (r.error if usado else r.warn)(
                    where, "sin base ni activation: Valkyrie se cierra (Application.Quit) cuando este monstruo "
                           "se activa. Pon base=MonsterX o activation=EventX" + ("" if usado else
                                                                                  " (ahora ningún Spawn lo usa)"))
            if act:
                acts = act.split()
                if len(acts) == 1 and acts[0].startswith("Event"):
                    if acts[0] not in names:
                        r.error(where, f"activation={acts[0]}: ese evento no existe (Valkyrie falla al activar "
                                       f"el monstruo)")
                    else:
                        next_refs[acts[0]].append(n)
                else:
                    if any(x.startswith("Event") for x in acts):
                        r.warn(where, "activation mezcla un evento con otros nombres: un evento solo se usa si es el "
                                      "ÚNICO nombre; con varios, todos se tratan como activaciones de texto")
                    propias = [x for x in acts if "Activation" + x in names]
                    oficiales = [x for x in acts if x not in propias and x in OFFICIAL_ACTIVATIONS]
                    missing = [x for x in acts if x not in propias and x not in oficiales]
                    usado = any(n in C[x].get("monster", "").split() for x in C if ctype[x] == "Spawn")
                    if missing and not (propias or oficiales):
                        (r.error if usado else r.warn)(
                            where, f"activation={act}: no existe ninguna (ni [ActivationX] del escenario ni "
                                   f"activación oficial MonsterActivationX): Valkyrie se cierra al activar el monstruo")
                    elif missing:
                        r.warn(where, f"activation: no existen {' '.join(missing)} (ni [Activation…] ni oficiales); "
                                      f"Valkyrie las ignora y elige al azar entre las demás")
                    if propias and not oficiales and all(C["Activation" + x].get("vartests") for x in propias):
                        r.info(where, "todas sus [Activation…] tienen vartests: si en una ronda fallan todas, "
                                      "Valkyrie se cierra (no queda ninguna activación)")
            for ek in ("evadeevent", "horrorevent"):
                if kv.get(ek):
                    if kv[ek] not in names:
                        r.warn(where, f"{ek}={kv[ek]}: ese evento no existe (se usará la tirada estándar)")
                    else:
                        next_refs[kv[ek]].append(n)
            for entry in kv.get("attacks", "").split():
                typ, _, cnt = entry.partition(":")
                if typ not in ATTACK_TYPES:
                    r.warn(where, f"attacks: tipo '{typ}' no válido ({', '.join(sorted(ATTACK_TYPES))})")
                try:
                    cnt_i = int(cnt or 1)
                except ValueError:
                    cnt_i = 0
                    r.error(where, f"attacks: '{entry}' (formato tipo:cantidad)")
                for i in range(1, cnt_i + 1):
                    if T(f"{n}.Attack_{typ}_{i}") is None:
                        r.warn(where, f"falta el texto '{n}.Attack_{typ}_{i}'")
            if T(f"{n}.monstername") is None and not b:
                r.warn(where, f"falta '{n}.monstername'")
            for ik in ("image", "imageplace"):
                if kv.get(ik):
                    check_media(r, where, folder, kv[ik], audio=False)
        elif t in ("QItem", "StartingItem"):
            if t == "StartingItem":
                r.info(where, "StartingItem es el nombre antiguo: Valkyrie lo convierte en QItem")
            if "starting" not in kv:
                r.warn(where, "QItem sin 'starting=': por compatibilidad vale True (se entrega al empezar). "
                              "Escribe starting=False si es un objeto para dar más tarde")
            for it in kv.get("itemname", "").split():
                if it not in CAT["items"] and it not in names:
                    r.warn(where, f"itemname={it}: objeto desconocido")
                elif it in CAT["items"] and CAT["items"][it]["pack"] not in declared \
                        and not set(CAT["items"][it].get("tambien", [])) & declared \
                        and not (kv.get("traits") or kv.get("traitpool")):
                    r.info(where, f"{it} es de la expansión {CAT['items'][it]['pack']}, no declarada en packs=")
            if not kv.get("itemname") and not kv.get("traits") and not kv.get("traitpool"):
                r.warn(where, "QItem sin itemname ni traits: no se sorteará nada")
            if kv.get("inspect"):
                if kv["inspect"] not in names:
                    r.warn(where, f"inspect={kv['inspect']}: ese evento no existe")
                else:
                    next_refs[kv["inspect"]].append(n)
            if kv.get("vartests") and kv.get("starting", "True").lower() != "true":
                r.info(where, "vartests en un QItem solo sirve para los objetos iniciales")
        elif t == "Puzzle":
            cl = kv.get("class", "slide")
            if cl not in ("slide", "image", "code", "tower"):
                r.error(where, f"class='{cl}': debe ser slide, image, code o tower (si no, no se abre nada)")
            try:
                lvl = int(kv.get("puzzlelevel", 4))
                alt = int(kv.get("puzzlealtlevel", 3))
            except ValueError:
                r.error(where, "puzzlelevel/puzzlealtlevel deben ser enteros")
                lvl, alt = 4, 3
            if cl == "image":
                im = kv.get("image", "")
                if not im:
                    r.error(where, "puzle image sin image= (no hay nada que recomponer)")
                elif im not in CAT["puzzles"]:
                    check_media(r, where, folder, im, audio=False)
                else:
                    g = CAT["puzzles"][im].get("grid", "")
                    if g and f"{lvl}x{alt}" != g:
                        r.info(where, f"la imagen {im} está pensada para {g}; usas {lvl}x{alt}")
            if cl == "code":
                sol = kv.get("puzzlesolution", "")
                if sol:
                    vals = sol.split()
                    if len(vals) != lvl:
                        r.warn(where, f"puzzlesolution tiene {len(vals)} valores y puzzlelevel={lvl}")
                    for v in vals:
                        if not v.isdigit() or not 1 <= int(v) <= alt:
                            r.warn(where, f"puzzlesolution: '{v}' debe estar entre 1 y puzzlealtlevel={alt}")
                im = kv.get("image", "")
                if im and im not in ("symbol", "element"):
                    r.warn(where, f"en un código, image solo puede ser 'symbol' o 'element' (no '{im}')")
            sk = kv.get("skill", "{observation}")
            if sk.strip("{}") not in SKILL_SYMBOLS:
                r.info(where, f"skill='{sk}' no es un icono de atributo ({{lore}}, {{observation}}…)")
            if not kv.get("event1", "").strip():
                r.info(where, "puzle sin event1: al resolverlo no pasará nada")

    # ------------------------------------------------------------------ globales
    if not start_events:
        r.error("disparadores", "ningún evento tiene trigger=EventStart: la partida empezará sin hacer nada")
    elif len(start_events) > 1:
        r.warn("disparadores", f"{len(start_events)} eventos con trigger=EventStart ({', '.join(start_events)}): "
                               f"el orden no está garantizado. Deja uno y encadena el resto")
    if not any(kv.get("trigger") == "Eliminated" for kv in C.values()):
        r.warn("final", "ningún evento con trigger=Eliminated: si eliminan a un investigador no habrá final de derrota")
    ends = [n for n, kv in C.items() if any(op.replace(" ", "").startswith("$end,=,") and not op.endswith(",0")
                                            for op in kv.get("operations", "").split())]
    if not ends:
        r.warn("final", "ningún evento pone $end,=,1: la partida nunca termina sola")
    else:
        por_tiempo = [n for n in ends if re.fullmatch(r"EndRound\d*|StartRound|BeforeMonsterActivation|Mythos|"
                                                      r"EndInvestigatorTurn", C[n].get("trigger", "") or "")]
        if not por_tiempo:
            r.info("final", "no hay derrota por tiempo (un evento con trigger=EndRound, vartests sobre #round y "
                            "$end,=,1): sin presión de tiempo los jugadores pueden explorarlo todo con calma. "
                            "Patrón en patrones.md §9")

    # sorteo de objetos (Quest.AttemptItemMatch): los QItem se sortean al empezar, en el orden de los ficheros.
    # Los que tienen traits excluyen lo ya sorteado; los que tienen itemname sin traits NO comprueban duplicados.
    qitems = [n for n in C if ctype[n] in ("QItem", "StartingItem")]
    nombrados = {}
    for n in qitems:
        kv = C[n]
        tr = kv.get("traits", "").split()
        tp = kv.get("traitpool", "").split()
        lista = kv.get("itemname", "").split()
        if not tr and not tp:
            primero = next((x for x in lista if x in CAT["items"]), None)
            if primero:
                if primero in nombrados:
                    r.warn(n, f"da el mismo objeto ({primero}) que {nombrados[primero]}: el inventario no admite "
                              f"duplicados, así que el segundo que se entregue no añadirá nada")
                nombrados.setdefault(primero, n)
    for i, n in enumerate(qitems):
        kv = C[n]
        tr = kv.get("traits", "").split()
        tp = kv.get("traitpool", "").split()
        if not tr and not tp:
            continue
        excl = set(kv.get("itemname", "").split())

        def encaja(item_id):
            rasgos = set(CAT["items"].get(item_id, {}).get("traits", []))
            return all(t in rasgos for t in tr) and (not tp or any(t in rasgos for t in tp))
        # candidatos con la caja básica y las expansiones declaradas (estimación de la probabilidad)
        candidatos = [x for x, it in CAT["items"].items() if ({it["pack"]} | set(it.get("tambien", []))) & declared
                      and encaja(x) and x not in excl]
        for item, quien in nombrados.items():
            if qitems.index(quien) < i or item in excl or not encaja(item):
                continue      # ya sorteado antes (se excluye solo), excluido a mano o no encaja
            prob = 1 / len(candidatos) if item in candidatos and candidatos else 0
            msg = (f"puede sortear {item} (≈{prob:.0%} con la caja básica y los packs declarados), que {quien} "
                   f"entrega por nombre más tarde: si sale aquí, {quien} no añadirá nada. Añade itemname={item} a "
                   f"{n} (con traits son exclusiones) o define {quien} antes en el fichero")
            (r.warn if prob >= 0.2 else r.info)(n, msg)
    if not any(v.startswith("$mythos") for v in var_set):
        r.info("mitos", "no se activa ninguna variable $mythos…: no habrá eventos de Mitos genéricos")
    elif not any(v in var_set for v in ("$mythosMinor", "$mythosMajor", "$mythosDeadly", "$mythosHelp", "$mythosFlavor")):
        r.warn("mitos", "solo hay variables de lugar $mythos…: también hace falta una de intensidad ($mythosMinor…)")

    # variables @ y Var triggers
    var_triggers = {kv["trigger"][3:] for kv in C.values() if kv.get("trigger", "").startswith("Var")}
    for v in var_set:
        if v.startswith("@") and v[1:] not in var_triggers:
            r.warn("variables", f"'{v}' se pone a 1 pero ningún evento tiene trigger=Var{v[1:]}")
        if v.startswith("$@") and ("$" + v[2:]) not in var_triggers:
            r.warn("variables", f"'{v}' se pone a 1 pero ningún evento tiene trigger=Var${v[2:]}")
    for vt in var_triggers:
        if not vt.startswith("$") and ("@" + vt) not in var_set:
            r.warn("variables", f"trigger=Var{vt} pero ninguna operación modifica '@{vt}'")
    builtin_r = {"#round", "#heroes", "#monsters", "#eliminated", "#eliminatedprev", "#eliminatedcomplete",
                 "#MoM1E", "#FA", "#CotW"} | {"#" + p for p in CAT["packs"]} | {CAT["investigators"][h]["var"] for h in CAT["investigators"]}
    lower_map = defaultdict(set)
    for v in set(var_set) | set(var_test):
        if v.startswith("#") and not v.startswith("#rand") and v not in builtin_r:
            r.warn("variables", f"'{v}' no es una variable de Valkyrie conocida (#round, #heroes, #monsters, "
                                f"#eliminated, #<pack>, #Hero<Nombre>…): siempre valdrá 0")
        if v == "mythosUnfinished":
            r.warn("variables", "no uses 'mythosUnfinished': Valkyrie la usa para desactivar Mitos sin terminar")
        lower_map[v.lower()].add(v)
    for k, vs in lower_map.items():
        if len(vs) > 1:
            r.warn("variables", f"variables que solo difieren en mayúsculas: {', '.join(sorted(vs))} "
                                f"(son distintas para Valkyrie)")
    leidas = defaultdict(list, {v: list(w) for v, w in var_test.items()})
    for v, w in var_quota.items():
        leidas[v].extend(w)
    for v, where_ in leidas.items():
        if v.startswith(("#", "$")) or NUM_RE.match(v):
            continue
        if v not in var_set and not v.startswith("%"):
            r.info("variables", f"'{v}' se comprueba ({where_[0]}…) pero nunca se modifica: siempre vale 0")

    # alcanzabilidad
    reach = set()
    stack = [n for n, kv in C.items() if kv.get("trigger")]
    stack += [n for n, kv in C.items() if ctype[n] in ("QItem", "StartingItem")
              and kv.get("starting", "True").lower() == "true"]
    while stack:
        n = stack.pop()
        if n in reach or n not in C:
            continue
        reach.add(n)
        kv = C[n]
        t = ctype[n]
        for k, v in kv.items():
            if re.fullmatch(r"event\d+", k):
                stack.extend(x for x in v.split() if x in C)
        stack.extend(x for x in kv.get("add", "").split() if x in C)
        if t == "Spawn":
            for m in kv.get("monster", "").split():
                if m in C:
                    stack.append(m)
        if t == "CustomMonster":
            for ek in ("activation", "evadeevent", "horrorevent"):
                stack.extend(x for x in kv.get(ek, "").split() if x in C)
        if t in ("QItem", "StartingItem") and kv.get("inspect") in C:
            stack.append(kv["inspect"])
    for n in C:
        t = ctype[n]
        if t in EVENT_LIKE | {"Tile", "QItem"} and n not in reach:
            if t in ("Tile", "Token", "UI", "Door") and not add_refs.get(n):
                r.warn("alcance", f"{n} nunca se añade al tablero (ningún add=): no aparecerá")
            elif t in ("Event", "Spawn", "Puzzle"):
                r.warn("alcance", f"{n} nunca se ejecuta: ningún disparador ni botón alcanzable lleva a él")
            elif t == "QItem" and not add_refs.get(n):
                r.info("alcance", f"{n} no se entrega nunca (ni inicial ni con add=)")

    # UI que no se retiran (salvo pantallas finales: el evento que las añade, o una UI añadida con ellas,
    # lleva a un evento con $end)
    removes_all_ui = any(x in remove_refs for x in ("#uicomponents", "#boardcomponents"))
    fin_memo = {}

    def lleva_al_fin(nombre, prof=0):
        if nombre in fin_memo:
            return fin_memo[nombre]
        fin_memo[nombre] = False
        kv2 = C.get(nombre)
        if kv2 is None or prof > 8:
            return False
        res = any(op.replace(" ", "").startswith("$end,=,") and not op.endswith(",0")
                  for op in kv2.get("operations", "").split())
        if not res:
            for k2, v2 in kv2.items():
                if re.fullmatch(r"event\d+", k2):
                    if any(lleva_al_fin(t2, prof + 1) for t2 in v2.split()):
                        res = True
                        break
        fin_memo[nombre] = res
        return res

    # Exploración: la app oficial termina casi siempre diciendo que quien explora puede entrar en la zona
    # nueva (patrones.md §2). Sugiere añadirlo si la cadena de una ficha de Exploración no lo dice.
    def textos_cadena(nombre, vistos):
        if nombre in vistos or len(vistos) > 60:
            return ""
        vistos.add(nombre)
        kv2 = C.get(nombre)
        if kv2 is None:
            return ""
        out = T(nombre + ".text") or ""
        for k2, v2 in kv2.items():
            if re.fullmatch(r"event\d+", k2):
                for t2 in v2.split():
                    if t2 != "EventRevisarPuertas":
                        out += " " + textos_cadena(t2, vistos)
        return out
    sin_entrar = []
    for n in sc.of_type("Token"):
        kv = C.get(n, {})
        if kv.get("type") != "TokenExplore":
            continue
        txt = " ".join(textos_cadena(e, set()) for k, v in kv.items() if re.fullmatch(r"event\d+", k) for e in v.split())
        if txt.strip() and not re.search(r"mover(se|te|os)|entrar? en la (zona|sala|habitación)|may move|move into", txt, re.I):
            sin_entrar.append(n)
    if sin_entrar:
        r.info("exploración", f"{len(sin_entrar)} fichas de Exploración no dicen al final que quien explora puede entrar "
               f"en la zona nueva (como la app oficial; patrones.md §2): {', '.join(sin_entrar[:8])}{'…' if len(sin_entrar) > 8 else ''}")

    for n in sc.of_type("UI"):
        if add_refs.get(n) and not remove_refs.get(n) and not removes_all_ui:
            final = False
            for ev in add_refs[n]:
                juntos = C.get(ev, {}).get("add", "").split()
                if lleva_al_fin(ev) or any(component_type(u) == "UI" and lleva_al_fin(u) for u in juntos):
                    final = True
                    break
            if not final:
                r.warn("ui", f"{n} se añade pero nunca se quita: mientras haya una UI en pantalla no se puede "
                             f"terminar la fase")

    # parámetros de plantillas: {qst:CLAVE:{param}:valor} sustituye {param} dentro del texto de CLAVE
    parametros = set()
    for loc in sc.localizations.values():
        for v in loc.entries.values():
            parametros.update(re.findall(r":\{([A-Za-z0-9_]+)\}:", v))

    # textos largos
    for lang, loc in sc.localizations.items():
        for k, v in loc.entries.items():
            if k.endswith(".text") and (len(v) > 900 or v.count("\n") > 14):
                r.warn("textos", f"[{lang}] {k} es muy largo ({len(v)} caracteres): puede tapar los botones; "
                                 f"pártelo en varios eventos")
            for sym in re.findall(r"\{([A-Za-z0-9_]+)\}", v):
                if sym in SKILL_SYMBOLS or sym in PACK_SYMBOLS or sym in ("type",) or sym in parametros:
                    continue
                if sym == "0" and k.startswith(("Activation", "CustomMonster")):
                    continue      # {0} = nombre del monstruo en activaciones y textos de ataque
                if sym in ("heart", "fatigue", "might", "knowledge", "awareness", "shield", "surge"):
                    r.warn("textos", f"[{lang}] {k}: {{{sym}}} es un símbolo de Descent, no de MoM")
                elif sym == "MAD24":
                    r.warn("textos", f"[{lang}] {k}: {{MAD24}} no existe en Valkyrie")
                else:
                    r.info("textos", f"[{lang}] {k}: marca {{{sym}}} desconocida (se verá tal cual)")
            for cref in re.findall(r"\{c:([^}]+)\}", v):
                if cref not in names:
                    r.warn("textos", f"[{lang}] {k}: {{c:{cref}}} no es un componente (se verá "
                                     f"'{{c:{cref}}}' tal cual)")
            for dic, ref in lookups(v):
                if ref is None:
                    r.error("textos", f"[{lang}] {k}: una búsqueda {{{dic}:… que no se cierra (falta su '}}'): "
                                      f"Valkyrie lanza una excepción al enseñar este texto y el evento no sigue")
                elif dic == "qst" and sc.text(lang, ref) is None:
                    r.info("textos", f"[{lang}] {k}: {{qst:{ref}}} no existe (se mostrará '{ref}' tal cual)")
                elif dic == "ffg" and FFG_KEYS and ref not in FFG_KEYS:
                    r.info("textos", f"[{lang}] {k}: {{ffg:{ref}}} no aparece en los content packs de Valkyrie: "
                                     f"comprueba que existe en la app oficial (si no, se verá la clave)")
            if "{rnd:hero}" in v and k.endswith((".button1", ".button2", ".button3")):
                r.info("textos", f"[{lang}] {k}: {{rnd:hero}} no se sustituye en botones")
    # claves huérfanas y traducciones incompletas
    keyset = {}
    for lang, loc in sc.localizations.items():
        keyset[lang] = set(loc.entries)
        orph = [k for k in loc.entries if "." in k and not k.startswith("quest.")
                and k.split(".", 1)[0] not in names]
        if orph:
            r.info("textos", f"[{lang}] {len(orph)} claves de componentes que no existen (p. ej. {orph[0]})")
    if deflang in keyset:
        for lang, ks in keyset.items():
            if lang == deflang:
                continue
            miss = [k for k in keyset[deflang] - ks if not (sc.localizations[deflang].entries[k].startswith("{qst:"))]
            if miss:
                r.info("textos", f"[{lang}] faltan {len(miss)} textos respecto a {deflang} (se mostrarán en {deflang})")

    # losetas: dos caras a la vez y geometría
    used_sides = defaultdict(list)
    for n in sc.of_type("Tile"):
        used_sides[C[n].get("side", "")].append(n)
    for side, lst in used_sides.items():
        rev = CAT["tiles"].get(side, {}).get("reverse", "")
        if rev and rev in used_sides and side < rev:
            r.info("mapa", f"se usan las dos caras de la misma loseta física ({side} y {rev}): solo es posible "
                           f"si nunca están a la vez en el tablero")
        if len(lst) > 1:
            r.info("mapa", f"{side} se usa {len(lst)} veces ({', '.join(lst)}): solo hay una loseta física")
    if not a.sin_mapa:
        try:
            import mapa as M
            geo, cat = M.load_geo()
            tiles = M.placed_tiles(sc, geo, cat)
            for i, ta in enumerate(tiles):
                for tb in tiles[i + 1:]:
                    if not (ta.size_known and tb.size_known):
                        continue        # imagen propia que no se pudo medir: no se sabe si solapa
                    if M.overlap(ta, tb)[0]:
                        r.info("mapa", f"{ta.name} y {tb.name} se solapan (bien si nunca coinciden en el tablero)")
            for n in sc.of_type("Token", "Spawn"):
                kv = C[n]
                if "xposition" in kv and tiles:
                    try:
                        x, y = float(kv["xposition"]), float(kv.get("yposition", 0))
                    except ValueError:
                        continue
                    if not any(t.contains(x, y) for t in tiles):
                        r.info("mapa", f"{n} en ({x:g},{y:g}) no está sobre ninguna loseta")
            for n, x, y in M.explore_off_openings(sc, tiles):
                r.info("mapa", f"{n} (Exploración) en ({x:g},{y:g}) no está sobre ninguna puerta ni borde abierto "
                               f"conocido: usa el punto que indica 'python scripts/mapa.py <escenario>'")
            # fichas metidas en una pared: fuera de todas las zonas dibujadas de su loseta
            import losetas as LZ
            for n in sc.of_type("Token", "Spawn", "MPlace"):
                kv = C[n]
                if "xposition" not in kv or kv.get("type", "") in LZ.EN_BORDE:
                    continue
                try:
                    x, y = float(kv["xposition"]), float(kv.get("yposition", 0))
                except ValueError:
                    continue
                cands = [t for t in tiles if t.contains(x, y, 0)]
                if len(cands) != 1 or cands[0].custom or not LZ.contenido(cands[0].side):
                    continue
                t = cands[0]
                if not LZ.zona_en(LZ.contenido(t.side), t.world_to_local(x, y), 0.3):
                    r.info("mapa", f"{n} en ({x:g},{y:g}) cae fuera de las zonas dibujadas de {t.name} ({t.side}): "
                                   f"en una pared o un hueco, y no se sabe en qué espacio está. Un sitio dentro: "
                                   f"python scripts/losetas.py colocar <escenario> {t.name}")
        except Exception as ex:  # pragma: no cover
            r.info("mapa", f"no se pudo comprobar la geometría: {ex}")

    # rutas con barra invertida en customImage: Valkyrie no las normaliza en losetas ni fichas (QuestData.cs)
    for n in sc.of_type("Tile", "Token"):
        ci = C[n].get("customImage", "")
        if "\\" not in ci:
            continue
        bueno = ci.replace("\\", "/")
        if ctype[n] == "Tile":
            (r.error if add_refs.get(n) else r.warn)(
                n, f"customImage='{ci}' usa barras invertidas: en Windows funciona, pero en Android, Mac y Linux "
                   f"Valkyrie no encuentra la imagen y se CIERRA al mostrar la loseta"
                   + ("" if add_refs.get(n) else " (ahora ningún evento la añade)") + f". Escribe '{bueno}'")
        else:
            r.warn(n, f"customImage='{ci}' usa barras invertidas: en Android, Mac y Linux no se encuentra y se ve "
                      f"la ficha de búsqueda por defecto. Escribe '{bueno}'")

    # figuras: más apariciones de un tipo que figuras en la caja
    cuenta = Counter()
    for n in sc.of_type("Spawn"):
        kv = C[n]
        if kv.get("traits") or kv.get("traitpool"):
            continue
        m = next(iter(kv.get("monster", "").split()), "")
        if m.startswith("CustomMonster") and m in C:
            m = C[m].get("base", "")
        elif m and not m.startswith(("Monster", "Spawn")):
            m = "Monster" + m
        if m in FIGURAS:
            cuenta[m] += 1
    for m, c in cuenta.items():
        if c > FIGURAS[m]:
            r.info("monstruos", f"{c} apariciones de {m} y la caja trae {FIGURAS[m]} figuras: asegúrate de que no "
                                f"coinciden más de {FIGURAS[m]} a la vez (retira los anteriores o usa vartests con "
                                f"#monsters)")

    # cambios de escenario (campañas): al pasar a otro quest.ini, VarManager.TrimQuest lee las dos primeras
    # letras de cada variable y lanza una excepción con un nombre más corto
    if quest_switches(sc):
        for v in sorted(set(var_set) | set(var_test)):
            if len(v) < 2:
                r.error("variables", f"variable '{v}' de un solo carácter: al cambiar de escenario "
                                     f"VarManager.TrimQuest lanza una excepción (usa 2 o más)")
    if is_root:
        check_package(r, folder, sc)

    a.heroes = (sc.quest.get("minhero", "2"), sc.quest.get("maxhero", "5"))
    output(r, a)


def check_package(r, root, root_sc):
    """Un paquete con varios quest.ini (campaña o escenario en varias partes): a qué partes se llega y con qué
    textos. Tras un cambio de escenario (Quest.ChangeQuest) Valkyrie carga el idioma del jugador, el inglés y el
    de reserva, pero no el defaultlanguage del escenario nuevo."""
    subs = []
    for dirpath, dirs, files in os.walk(root):
        dirs.sort()
        if dirpath != root and "quest.ini" in files:
            subs.append(dirpath)
    if not subs:
        return
    loaded = {root: root_sc}
    for d in subs:
        try:
            loaded[d] = Scenario.load(d)
        except Exception as ex:  # pragma: no cover
            r.warn(os.path.relpath(d, root), f"no se pudo leer: {ex}")
    targets = {quest_target(root, tg).lower() for sc_ in loaded.values() for _, tg in quest_switches(sc_)}
    if not targets:
        return
    sin_ingles, menos_ingles = [], []
    for d in subs:
        rel = os.path.relpath(d, root).replace("\\", "/")
        if os.path.normpath(os.path.join(d, "quest.ini")).lower() not in targets:
            r.info(rel, "ninguna aventura del paquete salta a este quest.ini")
            continue
        sc_ = loaded.get(d)
        if sc_ is None or sc_.default_language == "English":
            continue
        base = sc_.localizations.get(sc_.default_language)
        en = sc_.localizations.get("English")
        if en is None:
            sin_ingles.append((rel, sc_.default_language))
            continue
        falta = [k for k, v in (base.entries.items() if base else []) if v.strip() and not en.entries.get(k, "").strip()]
        if falta:
            menos_ingles.append((rel, sc_.default_language, falta))
    # para los jugadores del propio idioma no se pierde nada si el principal tampoco tiene inglés
    nivel = r.warn if root_sc.default_language == "English" or "English" in root_sc.localizations else r.info
    if sin_ingles:
        rel, lang = sin_ingles[0]
        nivel("paquete", f"{len(sin_ingles)} parte(s) solo en {lang} (p. ej. {rel}): tras un cambio de aventura Valkyrie "
                         f"carga el idioma del jugador, el inglés y el de reserva, pero no el defaultlanguage. Quien "
                         f"juegue en otro idioma verá los diálogos vacíos: añade Localization.English.txt")
    if menos_ingles:
        rel, lang, falta = menos_ingles[0]
        nivel("paquete", f"{len(menos_ingles)} parte(s) con textos sin traducir al inglés (p. ej. {rel}: {len(falta)}, "
                         f"como {falta[0]}): tras un cambio de aventura, quien no juegue en {lang} no los verá")


def check_media(r, where, folder, value, audio, fatal=False):
    v = value.strip().strip('"').replace("\\", "/")
    if audio and v in CAT["audio"]:
        return
    if not audio and (v in CAT["images"] or v in CAT["puzzles"]):
        return
    if re.match(r"^(Audio|Image|Puzzle)[A-Z]", v) and "." not in v:
        r.warn(where, f"'{v}' no está en el catálogo de Valkyrie")
        return
    path = os.path.normpath(os.path.join(folder, v))
    if not os.path.exists(path):
        alt = find_case_insensitive(folder, v)
        if alt:
            r.error(where, f"'{v}' existe como '{alt}': falla en Linux/Android por mayúsculas")
            return
        idiomas = media_languages(folder, v)
        if not idiomas:
            (r.error if fatal else r.warn)(where, f"el fichero '{v}' no existe en la carpeta del escenario"
                                                  + (" → Valkyrie se cierra" if fatal else ""))
            return
        if len(idiomas) < len(LANGUAGES):
            r.info(where, f"'{v}' solo está en las carpetas de idioma {' '.join(idiomas)}: quien juegue en otro "
                          f"idioma (sin uno de esos de reserva) no lo {'oirá' if audio else 'verá'}")
    if " " in v:
        r.info(where, f"'{v}' tiene espacios en el nombre: funciona en audio= e image=, pero no en music= "
                      f"(es una lista separada por espacios); mejor sin espacios")
    if audio and not v.lower().endswith(".ogg"):
        r.error(where, f"'{v}': Valkyrie solo reproduce .ogg")
    if not audio and not v.lower().endswith((".png", ".jpg", ".jpeg")):
        r.warn(where, f"'{v}': usa PNG o JPG")


def output(r, a):
    items = [i for i in r.items if not (a.sin_info and i[0] == "INFO")]
    if a.json:
        print(json.dumps([{"nivel": l, "donde": w, "mensaje": m} for l, w, m in items], ensure_ascii=False, indent=1))
    else:
        order = {"ERROR": 0, "AVISO": 1, "INFO": 2}
        for lvl, where, msg in sorted(items, key=lambda i: order[i[0]]):
            print(f"{lvl:5s} | {where}: {msg}")
        c = Counter(i[0] for i in r.items)
        print(f"\nResumen: {c.get('ERROR', 0)} errores, {c.get('AVISO', 0)} avisos, {c.get('INFO', 0)} sugerencias")
        if not c.get("ERROR"):
            mn, mx = getattr(a, "heroes", ("2", "5"))
            print(f"Sin errores fatales. Prueba el escenario en Valkyrie (Guardar y probar) con {mn} y con {mx} "
                  f"investigadores.")
    sys.exit(1 if any(i[0] == "ERROR" for i in r.items) else 0)


if __name__ == "__main__":
    main()
