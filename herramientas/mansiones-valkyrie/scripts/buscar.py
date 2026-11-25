#!/usr/bin/env python3
"""
buscar.py - Busca componentes de Mansiones de la Locura en el catálogo de Valkyrie.

Uso:
    python buscar.py biblioteca                 # busca en todo (ID, nombre, descripción, rasgos)
    python buscar.py cultist --tipo monstruos
    python buscar.py --tipo losetas --rasgo outside --pack MoMBase
    python buscar.py --tipo objetos --rasgo lightsource
    python buscar.py --tipo fichas --clase personaje
    python buscar.py door --tipo audio

Tipos: losetas, monstruos, objetos, investigadores, fichas, imagenes, audio, puzles, activaciones.
    python buscar.py sectario --tipo activaciones   # activaciones oficiales para activation= de CustomMonster
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
GEO = json.load(open(os.path.join(SKILL, "assets", "geometria_losetas.json"), encoding="utf-8"))
# Palabras en español -> términos en inglés que aparecen en los ID del catálogo
SINONIMOS = {
    # lugares y losetas
    "biblioteca": "library archives", "cocina": "kitchen", "dormitorio": "bedroom", "habitacion": "room bedroom",
    "comedor": "dining", "salon": "lounge parlor ballroom", "vestibulo": "entry foyer lobby hall",
    "recibidor": "entry foyer lobby", "entrada": "entry entrance porch front", "pasillo": "hallway corridor",
    "sotano": "basement cellar", "atico": "attic", "desvan": "attic", "jardin": "garden yard",
    "patio": "yard courtyard", "calle": "street", "callejon": "alley", "bosque": "woods forest grove",
    "cementerio": "graveyard cemetery", "iglesia": "church chapel", "capilla": "chapel",
    "estudio": "study office", "despacho": "study office", "laboratorio": "laboratory lab",
    "bano": "bathroom bath", "almacen": "storage warehouse storeroom", "invernadero": "greenhouse conservatory",
    "cripta": "crypt", "cueva": "cave", "tunel": "tunnel", "alcantarilla": "sewer", "muelle": "dock pier",
    "puerto": "dock harbor", "tren": "train car freight passenger engine", "vagon": "car freight passenger",
    "hospital": "hospital medical ward", "manicomio": "asylum ward", "celda": "cell", "oficina": "office",
    "tienda": "shop store storefront", "museo": "museum exhibit", "galeria": "gallery exhibit",
    "escaleras": "stairs", "escalera": "stairs", "puerta": "door gate", "plaza": "square plaza",
    "puente": "bridge", "rio": "river", "lago": "lake pond", "estanque": "pond", "pantano": "swamp bog",
    "barco": "ship boat deck", "cubierta": "deck", "templo": "temple", "ruinas": "ruins ruined",
    "selva": "jungle", "claro": "clearing", "colina": "hill", "aldea": "village", "pueblo": "village town",
    "mansion": "mansion house manor", "casa": "house", "cabana": "cabin shed", "cobertizo": "shed",
    "granero": "barn", "aula": "classroom", "comisaria": "police", "observatorio": "observation observatory",
    "torre": "tower", "estatua": "statue", "piscina": "pool", "fuera": "outside", "exterior": "outside",
    "interior": "inside", "dentro": "inside",
    # objetos
    "linterna": "lantern", "farol": "lantern", "vela": "candles", "velas": "candles", "antorcha": "torch",
    "revolver": "revolver", "escopeta": "shotgun", "rifle": "rifle carbine", "pistola": "derringer automatic snubnose",
    "cuchillo": "knife", "daga": "dagger", "hacha": "axe", "machete": "machete", "llave": "key keys",
    "libro": "book tome textbook manuscript", "tomo": "tome", "diario": "journal ledger", "carta": "letter",
    "mapa": "map", "foto": "photographic", "camara": "camera photographic", "dinamita": "dynamite",
    "botiquin": "medical bandages", "vendas": "bandages", "whisky": "whiskey", "amuleto": "pendant ward amulet",
    "cuerda": "rope", "palanca": "crowbar", "pala": "shovel", "martillo": "sledgehammer hammer",
    "espada": "sword blade", "lampara": "lamp", "cerillas": "matches", "veneno": "poison", "anillo": "ring",
    "cruz": "cross", "biblia": "bible", "lupa": "magnifying", "esposas": "handcuffs", "brujula": "compass",
    "pista": "clue evidence", "prueba": "evidence", "conjuro": "spell", "hechizo": "spell", "llaves": "keys",
    "arma": "weapon", "armas": "weapon",
    # fichas, monstruos y gente
    "busqueda": "search", "explorar": "explore", "exploracion": "explore", "interaccion": "interact",
    "persona": "person man woman", "hombre": "man", "mujer": "woman", "nino": "child", "nina": "child",
    "perro": "dog", "gato": "cat", "zadok": "zadoc", "rata": "rat", "sectario": "cultist", "sacerdote": "priest",
    "mayordomo": "butler", "policia": "police", "fantasma": "ghost spirit", "zombi": "zombie",
    "vampiro": "vampire", "bruja": "witch", "profundo": "deep", "pared": "wall", "muro": "wall",
    "barricada": "barricade", "fuego": "fire", "oscuridad": "dark darkness", "niebla": "fog mist",
    "sangre": "blood", "cadaver": "body corpse", "cuerpo": "body", "altar": "altar ritual", "ritual": "ritual",
    "portal": "portal gate", "obstaculo": "barricade wall", "escombros": "rubble debris",
    # sonidos
    "lluvia": "rain storm", "trueno": "thunder storm", "tormenta": "storm", "pasos": "move footsteps",
    "grito": "scream negative", "viento": "wind", "campana": "bell gong", "reloj": "clock", "musica": "music",
    "susurro": "whisper", "agua": "water", "cuervo": "crow", "papeles": "papers", "cristal": "glass",
    "terror": "horror", "combate": "attack", "cerradura": "locked unlock", "cajon": "drawer",
    "armario": "cabinet", "telefono": "phone", "disparo": "firearm", "golpe": "unarmed thud heavy",
    "ambiente": "atmosphere", "muerte": "death devoured", "mitos": "mythos", "alarma": "alarm",
    "electricidad": "electric", "piedra": "stone", "madera": "wood", "monstruo": "monster creature",
    "hallazgo": "important positive item", "magia": "spell arcane", "secreta": "hidden secret",
}
TYPES = {"losetas": "tiles", "monstruos": "monsters", "objetos": "items", "investigadores": "investigators",
         "fichas": "tokens", "imagenes": "images", "audio": "audio", "puzles": "puzzles",
         "activaciones": "activation_ids"}


def monster_of_activation(aid):
    """MonsterActivationCultist01 -> MonsterCultist (el monstruo cuyo nombre es prefijo más largo)."""
    best = ""
    for mid in CAT.get("monsters", {}):
        base = mid[len("Monster"):]
        if aid.startswith(base) and len(base) > len(best):
            best = base
    return "Monster" + best if best else ""


def section_items(sec):
    data = CAT.get(sec, {})
    if isinstance(data, list):     # activation_ids: lista de IDs
        out = {}
        for aid in data:
            mid = monster_of_activation(aid)
            m = CAT.get("monsters", {}).get(mid, {})
            out[aid] = {"en": m.get("en", ""), "es": m.get("es", ""), "pack": m.get("pack", ""),
                        "monster": mid, "traits": []}
        return out.items()
    return data.items()


def describe(sec, key, v):
    if sec == "tiles":
        s = v.get("size")
        size = f"{s[0]:g}×{s[1]:g}" if s else "?"
        g = GEO.get(key)
        doors = ""
        if g:
            partes = []
            for side, lab in zip("NESW", "NESO"):
                np_ = len([x for x in g[side] if x["kind"] == "door"])
                na = len([x for x in g[side] if x["kind"] != "door"])
                partes.append(f"{lab}:" + ("pared" if not (np_ or na) else
                                           "+".join(([f"{np_}P"] if np_ else []) + (["abierto"] if na else []))))
            doors = " lados " + " ".join(partes)
        return f"{size} {' '.join(v['traits'])} [{v['pack']}] reverso={v['reverse'].replace('TileSide', '')}{doors}  {v.get('desc', '')}"
    if sec == "monsters":
        es = f" / {v['es']}" if v.get("es") else ""
        return (f"{v['en']}{es} [{v['pack']}] {' '.join(v['traits'])} vida={v['health']:g}+{v['healthperhero']:g}/inv "
                f"per={v['awareness']} hor={v['horror']} agr={v['brawn']} activ={v.get('activations', 0)}")
    if sec == "items":
        return f"{v['en']} [{v['pack']}] {' '.join(v['traits'])}"
    if sec == "investigators":
        return f"{v['en']} [{v['pack']}] {' '.join(v['traits'])} variable={v['var']}"
    if sec == "tokens":
        return f"{v['kind']} [{v['pack']}] {' '.join(v['traits'])}"
    if sec == "audio":
        return f"[{v['pack']}] {' '.join(v['traits'])}"
    if sec == "puzzles":
        return f"[{v['pack']}] rejilla {v.get('grid', '?')}"
    if sec == "activation_ids":
        return f"activación oficial de {v['monster'] or '?'} [{v['pack']}] → activation={key}"
    return f"[{v.get('pack', '')}]"


def norm(t):
    t = unicodedata.normalize("NFD", str(t).lower())
    return "".join(ch for ch in t if unicodedata.category(ch) != "Mn")


def words(text):
    """Palabras normalizadas; parte también los ID en CamelCase (TokenZadocAllen -> token zadoc allen)."""
    text = re.sub(r"([a-z])([A-Z])", r"\1 \2", str(text))
    text = re.sub(r"([A-Za-z])([0-9])", r"\1 \2", text)
    return re.findall(r"[a-z0-9ñ]+", norm(text))


def haystack(key, v):
    """(palabras del ID, nombres y rasgos; palabras de la descripción)."""
    ids = words(" ".join([key, str(v.get("en", "")), str(v.get("es", "")), " ".join(v.get("traits", [])),
                          str(v.get("name", ""))]))
    return ids, words(str(v.get("desc", "")))


def matches(qwords, alts, key, hay, raw):
    """Cada palabra buscada debe ser el comienzo de alguna palabra. Los sinónimos solo se buscan en el ID,
    los nombres y los rasgos (no en las descripciones, para evitar ruido). Un ID escrito tal cual también
    vale como prefijo (TileSideDock -> todos los muelles)."""
    if not qwords:
        return True
    if " " not in raw.strip() and norm(key).startswith(norm(raw.strip())):
        return True
    ids, desc = hay
    for qw, alt in zip(qwords, alts):
        directo = any(h.startswith(qw) for h in ids + desc)
        sinonimo = any(h.startswith(x) for x in alt[1:] for h in ids)
        if not (directo or sinonimo):
            return False
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("texto", nargs="?", default="")
    ap.add_argument("--tipo", choices=list(TYPES))
    ap.add_argument("--rasgo", action="append", default=[])
    ap.add_argument("--pack")
    ap.add_argument("--clase", help="para fichas: tablero, personaje, personaje-generico, monstruo, objeto")
    ap.add_argument("--max", type=int, default=60)
    a = ap.parse_args()
    qwords = words(a.texto)
    # cada palabra admite sus sinónimos (español -> términos en inglés de los ID)
    alts = [[w] + [x for x in SINONIMOS.get(w, "").split()] for w in qwords]
    secs = [TYPES[a.tipo]] if a.tipo else list(TYPES.values())
    n = 0
    vocab = set()
    for sec in secs:
        rows = []
        for key, v in section_items(sec):
            hay = haystack(key, v)
            vocab.update(hay[0] + hay[1])
            if not matches(qwords, alts, key, hay, a.texto):
                continue
            if a.rasgo and not all(r in v.get("traits", []) for r in a.rasgo):
                continue
            if a.pack and v.get("pack") != a.pack:
                continue
            if a.clase and v.get("kind") != a.clase:
                continue
            rows.append((key, v))
        if rows:
            name = [k for k, s in TYPES.items() if s == sec][0]
            print(f"== {name} ({len(rows)})")
            for key, v in rows[:a.max]:
                print(f"  {key:34s} {describe(sec, key, v)}")
            if len(rows) > a.max:
                print(f"  … {len(rows) - a.max} más (usa --max)")
            n += len(rows)
    extra = sorted({x for alt in alts for x in alt[1:]})
    if not n:
        sug = []
        for w in qwords:
            sug += difflib.get_close_matches(w, sorted(vocab), n=4, cutoff=0.7)
        print("Sin resultados." + (f" ¿Quizá: {', '.join(dict.fromkeys(sug))}?" if sug else "") +
              " Prueba en inglés (library, cultist, lantern…) o con menos palabras.")
    elif extra:
        print(f"(también se buscó: {' '.join(extra)})")


if __name__ == "__main__":
    main()
