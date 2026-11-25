#!/usr/bin/env python3
"""
buscar.py - Busca componentes de Descent 2ª edición (y de los packs DooM y D1ED) en el catálogo de
Valkyrie (assets/catalogo.json).

Uso:
    python buscar.py ettin                          # busca en todo (ID, nombres, rasgos)
    python buscar.py zombi --tipo monstruos         # también en español (nombres y sinónimos)
    python buscar.py --tipo losetas --rasgo outside --pack D2EBase
    python buscar.py --tipo objetos --rasgo act1 --rasgo blade
    python buscar.py --tipo monstruos --tamano huge --rasgo cave
    python buscar.py --tipo heroes --arquetipo healer
    python buscar.py knight --tipo habilidades
    python buscar.py --tipo packs                   # los packs y su nombre en español
    python buscar.py --tipo activaciones --monstruo MonsterZombie

Tipos: losetas, monstruos, activaciones, objetos, heroes, clases, habilidades, fichas, imagenes, audio,
peligros, packs.
"""
import argparse
import difflib
import json
import os
import re
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)
CAT = json.load(open(os.path.join(SKILL, "assets", "catalogo.json"), encoding="utf-8"))
LOS = json.load(open(os.path.join(SKILL, "assets", "losetas.json"), encoding="utf-8"))["losetas"]

# Palabras en español -> términos en inglés de los ID y los rasgos
SINONIMOS = {
    # losetas
    "agua": "water", "rio": "water river", "lava": "lava", "fuera": "outside", "exterior": "outside",
    "dentro": "inside", "interior": "inside", "trono": "throne", "tierra": "dirt", "madera": "timber",
    "biblioteca": "library", "tumba": "tomb graves", "cementerio": "graves tomb", "nieve": "snow cold",
    "hielo": "snow cold", "pantano": "swamp sludge", "cieno": "sludge", "foso": "pit", "abismo": "pit",
    "puente": "bridge drawbridge", "escaleras": "stairs", "escalera": "stairs", "ciudad": "city",
    "tesoro": "treasure", "altar": "altar", "granja": "farm", "piedra": "stone", "escombros": "rubble",
    "tortura": "torture", "tiendas": "tents", "establo": "stables", "dormitorio": "bedroom beds",
    "fuente": "fountain", "estudio": "study", "prision": "prison", "carcel": "prison", "taberna": "tavern",
    "posada": "tavern", "estatuas": "statues", "reino": "blackrealm", "oscuro": "dark blackrealm",
    "entrada": "entrance", "terminal": "cap", "tapa": "cap", "extension": "extension",
    "transicion": "transition", "pasillo": "extension hallway", "salon": "hall", "mapa": "map",
    # monstruos
    "zombi": "zombie", "trasgo": "goblin", "arquero": "archer", "arana": "spider", "sombra": "shadow",
    "demonio": "demon", "esqueleto": "skeleton", "fantasma": "ghost wraith", "nigromante": "necromancer",
    "sacerdote": "priest", "bandido": "bandit", "dragon": "dragon", "lobo": "wolf", "rata": "rat",
    "murcielago": "bat", "serpiente": "naga serpent", "gigante": "giant ettin", "ogro": "ogre ettin",
    "brujo": "warlock witch", "bruja": "witch", "lugarteniente": "lieutenant", "agente": "agent",
    "jefe": "master", "esbirro": "minion", "maldito": "cursed", "muerto": "undead", "cueva": "cave",
    "montana": "mountain", "edificio": "building", "salvaje": "wilderness", "civilizado": "civilized",
    "caliente": "hot", "frio": "cold", "enorme": "huge", "mediano": "medium", "pequeno": "small",
    "descomunal": "massive", "cuerpo": "melee", "distancia": "ranged",
    # objetos
    "espada": "sword blade", "hoja": "blade", "hacha": "axe", "arco": "bow", "escudo": "shield",
    "armadura": "armor", "baston": "staff", "vara": "wand staff", "daga": "dagger blade", "martillo": "hammer",
    "anillo": "ring", "amuleto": "trinket amulet", "abalorio": "trinket", "reliquia": "relic", "runa": "rune",
    "magia": "magic rune", "magico": "magic", "capa": "cloak", "botas": "boots", "casco": "helmet",
    "cinturon": "belt", "libro": "book tome", "ballesta": "crossbow", "lanza": "spear", "honda": "sling",
    "pocion": "potion", "exotico": "exotic", "acto": "act", "clase": "class", "dos": "two",
    "pesada": "heavy", "ligera": "light", "escopeta": "shotgun", "rifle": "rifle", "plasma": "plasma",
    "motosierra": "chainsaw", "canon": "cannon", "granada": "grenade", "botiquin": "medpack",
    # héroes, clases y habilidades
    "sanador": "healer", "curandero": "healer", "mago": "mage", "guerrero": "warrior", "explorador": "scout",
    "caballero": "knight", "berserker": "berserker", "discipulo": "disciple", "espiritista": "spiritspeaker",
    "runas": "runemaster", "ladron": "thief", "montaraz": "wildlander", "cazador": "hunter wildlander",
    "hombre": "male", "mujer": "female", "enano": "dwarf", "elfo": "latari",
    # fichas, imágenes y sonido
    "busqueda": "search", "objetivo": "objective", "aldeano": "villager", "aldeana": "villager woman",
    "secreto": "secret", "telarana": "web", "portal": "portal", "teletransporte": "teleport",
    "amenaza": "threat", "progreso": "progress", "musica": "music", "combate": "battle fight",
    "derrota": "defeat defeated", "victoria": "victory", "ronda": "round", "fuego": "fire",
    "lluvia": "raining rain", "viento": "wind", "bosque": "forest", "noche": "night", "dia": "day",
    "oro": "gold", "nubes": "clouds", "papel": "paper", "peligro": "peril", "viaje": "travel",
}
TYPES = {"losetas": "tiles", "monstruos": "monsters", "activaciones": "activations", "objetos": "items",
         "heroes": "heroes", "clases": "classes", "habilidades": "skills", "fichas": "tokens",
         "imagenes": "images", "audio": "audio", "peligros": "perils", "packs": "packs"}


def pack_es(p):
    d = CAT["packs"].get(p, {})
    return d.get("es") or d.get("en") or p


def exits_text(key):
    t = LOS.get(key, {})
    ex = t.get("salidas", [])
    good = [e for e in ex if e["escenarios"] >= 2]
    if not ex:
        return "salidas: ?"
    return "salidas: " + " ".join(sorted({e["hacia"] for e in good})) if good else "salidas: poco vistas"


def describe(sec, key, v):
    if sec == "tiles":
        tam = f"{v.get('ancho', '?')}×{v.get('alto', '?')} ({v.get('casillas', '?')} casillas)"
        rev = v.get("reverso", "").replace("TileSide", "")
        return f"{tam} {' '.join(v.get('rasgos', []))} [{v['pack']}] reverso={rev or '—'} {exits_text(key)}"
    if sec == "monsters":
        es = f" / {v['es']}{'' if v.get('es_oficial') else '?'}" if v.get("es") and v["es"] != v["en"] else ""
        kind = " LUGARTENIENTE" if v.get("lugarteniente") else (" AGENTE" if v.get("agente") else "")
        act = " ".join(v.get("activation", [])) or "propias"
        rasgos = [r for r in v.get("rasgos", []) if r not in ("small", "medium", "huge", "massive", "monster")]
        return (f"{v['en']}{es} [{v['pack']}]{kind} {v.get('tamano', '?')} {' '.join(rasgos)} "
                f"activaciones: {act} ({len(v.get('propias', []))} propias)")
    if sec == "activations":
        quien = "jefe y esbirros" if v.get("jefe") and v.get("esbirro") else ("jefe" if v.get("jefe") else
                                                                               ("esbirros" if v.get("esbirro") else "—"))
        orden = "esbirros primero" if v.get("minionfirst") else ("jefe primero" if v.get("masterfirst") else "")
        return f"[{v['pack']}] texto para {quien}{', ' + orden if orden else ''}"
    if sec == "items":
        fama = ""
        if v.get("minfama") or v.get("maxfama"):
            fama = f" fama {v.get('minfama') or '…'}–{v.get('maxfama') or '…'}"
        return f"{v['en']} [{v['pack']}] {' '.join(v.get('rasgos', []))} precio={v.get('precio', 0)}{fama}"
    if sec == "heroes":
        return f"{v['en']} [{v['pack']}] {v.get('arquetipo', '')} {' '.join(v.get('rasgos', []))} variable={v['var']}"
    if sec == "classes":
        hib = f" híbrida de {v['hibrida']}" if v.get("hibrida") else ""
        return (f"{v['en']} [{v['pack']}] {v.get('arquetipo', '')}{hib} variable={v['var']} "
                f"objetos: {' '.join(v.get('objetos', [])) or '—'}")
    if sec == "skills":
        return f"{v['en']} [{v['pack']}] de {v.get('clase', '?')}, {v.get('xp', 0)} PX"
    if sec in ("tokens", "images"):
        return f"[{v['pack']}] imagen {v.get('imagen', '')}"
    if sec == "audio":
        return f"[{v['pack']}] {' '.join(v.get('rasgos', []))}"
    if sec == "perils":
        return f"[{v['pack']}] trigger={v.get('trigger') or '—'} operations={v.get('operations') or '—'}"
    if sec == "packs":
        com = " (de la comunidad)" if v.get("comunidad") else ""
        es = v.get("es") or "—"
        return f"{v.get('en', '')} = {es}{'' if v.get('es_oficial') else ' (nombre no oficial)'} [{v.get('tipo', '')}]{com}"
    return f"[{v.get('pack', '')}]"


def norm(t):
    t = unicodedata.normalize("NFD", str(t).lower())
    return "".join(ch for ch in t if unicodedata.category(ch) != "Mn")


def words(text):
    """Palabras normalizadas; parte también los ID en CamelCase (MonsterGoblinArcher -> monster goblin archer)."""
    text = re.sub(r"([a-z])([A-Z])", r"\1 \2", str(text))
    text = re.sub(r"([A-Za-z])([0-9])", r"\1 \2", text)
    return re.findall(r"[a-z0-9ñ]+", norm(text))


def haystack(key, v):
    parts = [key, v.get("en", ""), v.get("es", ""), v.get("nombre", ""), v.get("ffg", ""), v.get("arquetipo", ""),
             v.get("clase", ""), " ".join(v.get("rasgos", [])), v.get("tamano", "")]
    if v.get("lugarteniente"):
        parts.append("lieutenant")
    if v.get("agente"):
        parts.append("agent")
    return words(" ".join(str(p) for p in parts).replace("_", " "))


def matches(qwords, alts, key, hay, raw):
    """Cada palabra buscada debe ser el comienzo de alguna palabra (o de un sinónimo). Un ID escrito tal cual
    también vale como prefijo (TileSide1 -> todas las caras que empiezan así)."""
    if not qwords:
        return True
    if " " not in raw.strip() and norm(key).startswith(norm(raw.strip())):
        return True
    for qw, alt in zip(qwords, alts):
        if not any(h.startswith(x) for x in alt for h in hay):
            return False
    return True


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("texto", nargs="?", default="")
    ap.add_argument("--tipo", choices=list(TYPES))
    ap.add_argument("--rasgo", action="append", default=[], help="se puede repetir")
    ap.add_argument("--pack", help="id del pack (D2EBase, LoR, DooM…; --tipo packs los lista)")
    ap.add_argument("--tamano", choices=["small", "medium", "huge", "massive"], help="monstruos")
    ap.add_argument("--arquetipo", choices=["healer", "mage", "warrior", "scout", "DooM"], help="héroes y clases")
    ap.add_argument("--monstruo", help="activaciones propias de ese monstruo (MonsterZombie)")
    ap.add_argument("--max", type=int, default=60)
    a = ap.parse_args()
    qwords = words(a.texto)
    alts = [[w] + [x for x in SINONIMOS.get(w, "").split()] for w in qwords]
    secs = [TYPES[a.tipo]] if a.tipo else [s for s in TYPES.values() if s != "packs"]
    n = 0
    vocab = set()
    propias = None
    if a.monstruo:
        m = a.monstruo if a.monstruo.startswith("Monster") else "Monster" + a.monstruo
        if m not in CAT["monsters"]:
            sys.exit(f"No conozco el monstruo {a.monstruo}")
        propias = set(CAT["monsters"][m].get("propias", []))
        print(f"{m}: activaciones comunes {' '.join(CAT['monsters'][m].get('activation', [])) or '—'}")
    for sec in secs:
        rows = []
        for key, v in CAT[sec].items():
            hay = haystack(key, v)
            vocab.update(hay)
            if not matches(qwords, alts, key, hay, a.texto):
                continue
            if a.rasgo and not all(r in v.get("rasgos", []) for r in a.rasgo):
                continue
            if a.pack and v.get("pack") != a.pack and a.pack not in v.get("tambien", []):
                continue
            if a.tamano and v.get("tamano") != a.tamano:
                continue
            if a.arquetipo and v.get("arquetipo") != a.arquetipo:
                continue
            if propias is not None and (sec != "activations" or key not in propias):
                continue
            rows.append((key, v))
        if rows:
            name = [k for k, s in TYPES.items() if s == sec][0]
            print(f"== {name} ({len(rows)})")
            for key, v in rows[:a.max]:
                print(f"  {key:36s} {describe(sec, key, v)}")
            if len(rows) > a.max:
                print(f"  … {len(rows) - a.max} más (usa --max)")
            n += len(rows)
    extra = sorted({x for alt in alts for x in alt[1:]})
    if not n:
        sug = []
        for w in qwords:
            sug += difflib.get_close_matches(w, sorted(vocab), n=4, cutoff=0.7)
        print("Sin resultados." + (f" ¿Quizá: {', '.join(dict.fromkeys(sug))}?" if sug else "") +
              " Prueba en inglés (ettin, sword, outside…) o con menos palabras.")
    elif extra:
        print(f"(también se buscó: {' '.join(extra)})")
    if a.pack and a.pack in CAT["packs"]:
        print(f"Pack {a.pack}: {pack_es(a.pack)}")


if __name__ == "__main__":
    main()
