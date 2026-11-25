#!/usr/bin/env python3
"""
doom.py - Bloques para construir misiones del pack de la comunidad DooM en Valkyrie (modo Descent):
portales que se abren al verlos, mazo de amenaza propio, Argent por ronda, armas, botiquines,
teletransportadores, tarjetas de acceso, consolas, frags y finales, en español e inglés.

Los usan nueva_mision.py y la misión de ejemplo, y sirven para ampliar una misión:

    import sys; sys.path.insert(0, "<carpeta de la skill doom-valkyrie>/scripts")
    import doom as D
    m = D.Mision("MiMision")                                   # una que ya existe
    D.arma(m, "Gauss", "gauss", (4, -2))
    D.portal(m, "Sala", "amarillo", (5, 1), [
        D.Opcion([("MonsterCacoDemon", 2, [(5, 2), (6, 2)])]),         # 2 figuras con cualquier número de marines
        D.Opcion([("MonsterRevenant", 1, [(5, 2)])], argent=1)])
    m.save()

Cada bloque crea sus componentes con nombres propios (TokenPortalSala, EventPortalSala, SpawnPortalSalaA…)
y sus textos; no los añade al tablero: eso lo hace el evento que revela la zona (add=…), con los nombres
que devuelve cada función. Ver references/patrones-doom.md.

Necesita la skill descent-valkyrie al lado (usa sus valkyrie_io.py y geometria.py).
"""
import os
import sys
from collections import OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
DESCENT = os.path.normpath(os.path.join(HERE, "..", "..", "descent-valkyrie", "scripts"))
if not os.path.exists(os.path.join(DESCENT, "valkyrie_io.py")):
    sys.exit("doom.py necesita la skill descent-valkyrie junto a esta (carpeta hermana descent-valkyrie/scripts)")
sys.path.insert(0, DESCENT)
from valkyrie_io import Scenario, CURRENT_FORMAT  # noqa: E402
import geometria as G  # noqa: E402

EN_LABEL = {"Continuar": "Continue", "Sí": "Yes", "No": "No", "Fin": "End"}

# Fichas del pack DooM (tokens.ini del pack) y nombres para los textos
PORTAL = {"azul": ("Token_DM_Blue_Portal_A", "azul", "blue"),
          "amarillo": ("Token_DM_Yellow_Portal_A", "amarillo", "yellow"),
          "rojo": ("Token_DM_Red_Portal_A", "rojo", "red")}
# tipo: (ficha, nombre con artículo, nombre inglés, femenino, es granada)
ARMAS = {
    "motosierra": ("Token_DM_Chainsaw", "la motosierra", "the Chainsaw", True, False),
    "lanzamisiles": ("Token_DM_RocketLauncher", "el lanzamisiles", "the Rocket Launcher", False, False),
    "ametralladora": ("Token_DM_Chaingun", "la ametralladora", "the Chaingun", True, False),
    "gauss": ("Token_DM_GaussCannon", "el cañón Gauss", "the Gauss Cannon", False, False),
    "bfg": ("Token_DM_BFG9000", "la BFG 9000", "the BFG 9000", True, False),
    "escopeta": ("Token_DM_CombatShotgun", "la escopeta de combate", "the Combat Shotgun", True, False),
    "superescopeta": ("Token_DM_SuperShotgun", "la superescopeta", "the Super Shotgun", True, False),
    "fusil_rafagas": ("Token_DM_BurstRifle", "el fusil de ráfagas", "the Burst Rifle", False, False),
    "fusil_asalto": ("Token_DM_HeavyAssaultRifle", "el fusil de asalto pesado", "the Heavy Assault Rifle", False,
                     False),
    "fusil_plasma": ("Token_DM_PlasmaRifle", "el fusil de plasma", "the Plasma Rifle", False, False),
    "fusil_estatica": ("Token_DM_StaticRifle", "el fusil de estática", "the Static Rifle", False, False),
    "granada": ("Token_DM_FGrenade", "la granada de fragmentación", "the Frag Grenade", True, True),
    "granada_absorcion": ("Token_DM_Grenade", "la granada de absorción", "the Siphon Grenade", True, True),
}
TARJETA = {"azul": ("blue", "Azul", "blue", "azules"), "amarilla": ("yellow", "Amarilla", "yellow", "amarillas"),
           "roja": ("red", "Roja", "red", "rojas")}

# Mazo de amenaza de las misiones de esta skill: efectos de una ronda, escritos para ella
# (no son las cartas de Amenaza del juego de mesa, que deciden cómo se abren los portales)
CARTAS_AMENAZA = [
    ("Sed de sangre", "Bloodthirst",
     "Esta ronda, cada demonio tira 1 dado rojo más cuando ataca.",
     "This round, each demon rolls 1 additional red die when attacking."),
    ("Piel de hierro", "Iron Hide",
     "Esta ronda, cada demonio suma 1 escudo a su defensa.",
     "This round, each demon adds 1 shield to its defense."),
    ("Marea Argent", "Argent Tide",
     "El invasor gana 1 Argent por cada carta de demonio boca arriba.",
     "The invader gains 1 Argent for each faceup demon card."),
    ("Rugido del pozo", "Roar from the Deep",
     "El primer grupo de demonios que se active esta ronda gana 2 puntos de movimiento.",
     "The first demon group activated this round gains 2 movement points."),
    ("Brecha", "Breach",
     "Si queda algún portal en el mapa, pulsad el más cercano a un marine: se abre ahora, aunque nadie lo vea.",
     "If any portal is left on the map, press the one closest to a marine: it opens now, even if nobody sees it."),
    ("Respiro", "Breather",
     "Esta ronda no pasa nada. Aprovechadla.",
     "Nothing happens this round. Make the most of it."),
]


class Mision:
    """Escenario de Valkyrie con textos en español (y en inglés si está en idiomas)."""

    def __init__(self, folder, idiomas=("Spanish", "English"), nuevo=False, quest=None):
        self.idiomas = list(idiomas)
        if nuevo:
            os.makedirs(folder, exist_ok=True)
            self.sc = Scenario(folder)
            self.sc.header = "; Generado con la skill doom-valkyrie"
            self.sc.quest = OrderedDict([("format", str(CURRENT_FORMAT)), ("hidden", "False"), ("type", "D2E"),
                                         ("defaultlanguage", self.idiomas[0]), ("defaultmusicon", "True"),
                                         ("packs", "DooM"), ("minhero", "1")])
            self.sc.quest.update(quest or {})
        else:
            self.sc = Scenario.load(folder)

    def t(self, key, es, en=None):
        for lang in self.idiomas:
            if lang == "Spanish":
                self.sc.set_text(lang, key, es)
            elif lang == "English":
                self.sc.set_text(lang, key, en if en is not None else es)

    def c(self, name, es=None, botones=None, en=None, **kv):
        """Componente con su texto y sus botones: botones = [(etiqueta, destino, color, etiqueta_en)]."""
        fields = OrderedDict((k, str(v)) for k, v in kv.items() if v is not None)
        if botones is not None:
            fields["buttons"] = str(len(botones))
            for i, b in enumerate(botones, 1):
                fields[f"event{i}"] = b[1]
                if len(b) > 2 and b[2]:
                    fields[f"buttoncolor{i}"] = f'"{b[2]}"'
        self.sc.set(name, **fields)
        if es is not None:
            self.t(f"{name}.text", es, en)
        for i, b in enumerate(botones or [], 1):
            if b[0] is not None:
                self.t(f"{name}.button{i}", b[0], b[3] if len(b) > 3 and b[3] else EN_LABEL.get(b[0], b[0]))
        return name

    def save(self):
        self.sc.save()


class Tablero:
    """Piezas del mapa, unidas salida con salida con las salidas conocidas (assets/losetas.json de Descent)."""

    def __init__(self):
        self.piezas = OrderedDict()

    def poner(self, nombre, cara, x=0, y=0, r=0):
        self.piezas[nombre] = (cara, x, y, r)

    def ocupadas(self):
        occ = set()
        for cara, x, y, r in self.piezas.values():
            occ |= set(G.place_squares(cara, x, y, r))
        return occ

    def casillas(self, nombre):
        cara, x, y, r = self.piezas[nombre]
        return G.place_squares(cara, x, y, r)

    def salidas(self, nombre, minimo=1):
        """Salidas conocidas libres de una pieza colocada: [((casilla, casilla), hacia, escenarios)]."""
        cara, x, y, r = self.piezas[nombre]
        occ = self.ocupadas()
        return [e for e in G.exits_world(cara, x, y, r) if e[2] >= minimo
                and G.step(e[0][0], e[1]) not in occ and G.step(e[0][1], e[1]) not in occ]

    def unir(self, nombre, cara, ancla, hacia, minimo=2, salida=None):
        """Pone 'cara' contra la salida de 'ancla' que mira hacia 'hacia' (con la salida de la cara más usada,
        o la que mira hacia 'salida' sin girar). Devuelve la puerta de esa unión: (x, y, rotation)."""
        cand = [e for e in self.salidas(ancla, minimo) if e[1] == hacia]
        if not cand:
            raise ValueError(f"{ancla} no tiene una salida libre hacia {hacia} (con {minimo}+ escenarios)")
        par = max(cand, key=lambda e: e[2])[0]
        occ = self.ocupadas()
        mejor = None
        for X, Y, R, _, nd, nn in G.join_positions(cara, par, hacia):
            if salida and nd != salida:
                continue
            if set(G.place_squares(cara, X, Y, R)) & occ:
                continue
            if mejor is None or nn > mejor[0]:
                mejor = (nn, (X, Y, R))
        if mejor is None:
            raise ValueError(f"{cara} no cabe contra {ancla} hacia {hacia}")
        self.piezas[nombre] = (cara, *mejor[1])
        return G.door_between([(s, hacia) for s in par])

    def a_mision(self, m):
        for n, (cara, x, y, r) in self.piezas.items():
            m.c(n, side=cara, xposition=x, yposition=y, rotation=r or None)
        return list(self.piezas)


def cerca(casillas, ref, n, evitar=()):
    """Las n casillas de 'casillas' más cercanas a ref (sin las de evitar)."""
    orden = sorted((s for s in casillas if s not in evitar),
                   key=lambda s: (max(abs(s[0] - ref[0]), abs(s[1] - ref[1])), abs(s[0] - ref[0]) + abs(s[1] - ref[1]),
                                  s))
    return orden[:n]


# ----------------------------------------------------------------------------------------------
# Fichas y puertas
# ----------------------------------------------------------------------------------------------
def arma(m, nombre, tipo, pos):
    """Arma de recogida: al pasar por su casilla, el marine pone sus cartas encima de su mazo de acción (una
    granada es una sola carta, y su ficha se queda boca arriba en la zona del marine)."""
    token, es, en, fem, granada = ARMAS[tipo]
    lo = "la" if fem else "lo"
    ev = f"EventArma{nombre}"
    m.c(f"TokenArma{nombre}", f"Aquí está {es}. {lo.capitalize()} recoge el marine que pasa por su casilla, sin "
                              f"gastar movimiento.",
        [(f"Un marine {lo} recoge", ev, None, "A marine picks it up")],
        en=f"Here lies {en}. A marine who moves through its space picks it up, at no movement cost.",
        type=token, xposition=pos[0], yposition=pos[1])
    if granada:
        m.c(ev, f"El marine que {lo} recoge pone su carta boca abajo encima de su mazo de acción y deja la ficha boca "
                f"arriba en su zona de juego.",
            [("Continuar", "")], en="The marine who picks it up places its card facedown on top of their action deck "
                                    "and keeps the token faceup in their play area.", remove=f"TokenArma{nombre}")
    else:
        m.c(ev, f"El marine que {lo} recoge baraja sus cartas y las pone boca abajo encima de su mazo de acción.",
            [("Continuar", "")], en="The marine who picks it up shuffles its cards and places them facedown on top of "
                                    "their action deck.", remove=f"TokenArma{nombre}")
    return f"TokenArma{nombre}"


def botiquin(m, nombre, pos):
    ev = f"EventBotiquin{nombre}"
    m.c(f"TokenBotiquin{nombre}", "Un botiquín de emergencia. Lo recoge el marine que pasa por su casilla.",
        [("Un marine lo recoge", ev, None, "A marine picks it up")],
        en="An emergency health pack. A marine who moves through its space picks it up.",
        type="Token_DM_MedPack", xposition=pos[0], yposition=pos[1])
    m.c(ev, "Ese marine retira 5 de daño de su carta.", [("Continuar", "")],
        en="That marine recovers 5 damage.", remove=f"TokenBotiquin{nombre}")
    return f"TokenBotiquin{nombre}"


def teletransporte(m, nombre, pos, activo=False):
    """Teletransportador. Inactivo: un marine que entra en su casilla lo activa (punto de reaparición)."""
    act = f"TokenTele{nombre}"
    m.c(act, "Un teletransportador activo: aquí pueden reaparecer los marines. Todos los activos son adyacentes "
             "entre sí para moverse.", [("Continuar", "")],
        en="An active teleporter: marines can respawn here. All active teleporters are adjacent to each other "
           "for movement.", type="Token_DM_A_Teleport", xposition=pos[0], yposition=pos[1])
    if activo:
        return act
    ina = f"TokenTeleInactivo{nombre}"
    m.c(ina, "Un teletransportador apagado. Se enciende cuando un marine entra en su casilla.",
        [("Un marine ha entrado", f"EventTele{nombre}", None, "A marine has entered")],
        en="A teleporter, powered down. It turns on when a marine enters its space.",
        type="Token_DM_I_Teleport", xposition=pos[0], yposition=pos[1])
    m.c(f"EventTele{nombre}", "El teletransportador se enciende: desde ahora los marines pueden reaparecer aquí.",
        [("Continuar", "")], en="The teleporter powers up: from now on, marines can respawn here.",
        add=act, remove=ina)
    return ina


def tarjeta(m, color, pos):
    """Tarjeta de acceso: al recogerla, la variable tarjeta<Color> pasa a 1 (la usa puerta())."""
    _, Color, en, plural = TARJETA[color]
    ev = f"EventTarjeta{Color}"
    m.c(f"TokenTarjeta{Color}", f"Una tarjeta de acceso {color}.", [("Un marine la recoge", ev, None,
                                                                      "A marine picks it up")],
        en=f"A {en} keycard.", type="Token_DM1_Objective", xposition=pos[0], yposition=pos[1])
    m.c(ev, f"Tenéis la tarjeta {color}: ya podéis abrir las puertas {plural}.", [("Continuar", "")],
        en=f"You have the {en} keycard: you can now open {en} doors.",
        operations=f"tarjeta{Color},=,1", remove=f"TokenTarjeta{Color}")
    return f"TokenTarjeta{Color}"


def puerta(m, nombre, xyr, abre, texto=None, color=None):
    """Puerta en (x, y, rotation) que, al abrirla (1 punto de movimiento), lanza el evento 'abre'. Con color
    (azul, amarilla o roja) necesita su tarjeta."""
    x, y, r = xyr
    es, en = texto or ("Una puerta blindada.", "A blast door.")
    kv = dict(xposition=x, yposition=y, rotation=r or None)
    if color:
        col, Color, cen, _ = TARJETA[color]
        kv.update(color=col, event1Condition=f"VarOperation:tarjeta{Color},==,1")
        es += f" Solo se abre con la tarjeta {color}."
        en += f" Only the {cen} keycard opens it."
    m.c(nombre, es, [("Abrirla (1 punto de movimiento)", abre, None, "Open it (1 movement point)")], en=en, **kv)
    return nombre


def consola(m, nombre, pos, giros, es_desc, en_desc, hecho_es, hecho_en, siguiente="", operaciones=""):
    """Ficha de objetivo que se completa con 'giros' descartes: un marine adyacente descarta 1 carta de acción
    (una vez en su activación) y pulsa la ficha. Al completarla, retira la ficha, muestra hecho_es y sigue a
    'siguiente' (con 'operaciones' si se dan). Devuelve (ficha, variable de avances)."""
    var = f"giros{nombre}"
    m.c(f"TokenConsola{nombre}", es_desc + f"\n\nUn marine adyacente puede, una vez en su activación, descartar 1 "
                                           f"carta de acción para hacer 1 avance. Hacen falta {giros}.",
        [("Un marine ha descartado una carta", f"EventConsola{nombre}", None, "A marine has discarded a card")],
        en=en_desc + f"\n\nOnce during their activation, an adjacent marine may discard 1 action card to make 1 "
                     f"step of progress. It takes {giros}.",
        type="Token_DM1_Objective", xposition=pos[0], yposition=pos[1])
    m.c(f"EventConsola{nombre}", display="false", buttons="1", operations=f"{var},+,1",
        event1=f"EventConsolaHecha{nombre} EventConsolaFalta{nombre}",
        comment="event1 hace el primero habilitado: la consola completa o un avance más")
    m.c(f"EventConsolaHecha{nombre}", hecho_es, [("Continuar", siguiente)], en=hecho_en,
        vartests=f"VarOperation:{var},>=,{giros}", remove=f"TokenConsola{nombre}", operations=operaciones or None)
    m.c(f"EventConsolaFalta{nombre}", f"Avance hecho: {{var:{var}}} de {giros}.", [("Continuar", "")],
        en=f"Progress made: {{var:{var}}} of {giros}.")
    return f"TokenConsola{nombre}", var


# ----------------------------------------------------------------------------------------------
# Portales e invasión
# ----------------------------------------------------------------------------------------------
class Opcion:
    """Uno de los grupos de un portal: [(monstruo, figuras, casillas)] y el Argent que da.

    figuras: un número (las mismas con 1 a 4 marines, como en el juego de mesa, que compensa a los pelotones
    pequeños con sus cartas de pelotón) o cuatro (con 1, 2, 3 y 4 marines, si la misión no usa esas cartas).
    casillas: al menos tantas como figuras; las de los distintos demonios de un grupo, sin repetir."""

    def __init__(self, grupos, argent=0):
        self.grupos = [(mo, cuentas_por_marines(c), list(sq)) for mo, c, sq in grupos]
        self.argent = argent
        usadas = set()
        for mo, cuentas, sq in self.grupos:
            if min(cuentas) < 1:
                raise ValueError(f"{mo}: cada grupo necesita al menos 1 figura con cualquier número de marines (con 0, "
                                 f"Valkyrie marca una zona y crea el grupo igual)")
            if len(sq) < max(cuentas):
                raise ValueError(f"{mo}: {max(cuentas)} figuras y solo {len(sq)} casillas")
            propias = set(map(tuple, sq[:max(cuentas)]))
            if propias & usadas:
                raise ValueError(f"{mo}: comparte casillas con otro demonio del mismo grupo")
            usadas |= propias


def cuentas_por_marines(c):
    """Un número o cuatro (con 1, 2, 3 y 4 marines) → cuatro."""
    if isinstance(c, int):
        return (c, c, c, c)
    c = tuple(c)
    if len(c) != 4:
        raise ValueError(f"figuras {c}: da un número o cuatro (con 1, 2, 3 y 4 marines)")
    return c


def ganar_argent(m, n):
    ev = f"EventArgentPortal{n}"
    if ev not in m.sc.components:
        m.c(ev, f"El invasor gana {n} Argent: {'ponedlo' if n == 1 else 'ponedlos'} en las cartas de los demonios que "
                f"acaban de salir.",
            [("Continuar", "")], en=f"The invader gains {n} Argent: place {'it' if n == 1 else 'them'} on the cards of "
                                    f"the demons that just came out.")
    return ev


def portal(m, nombre, color, pos, opciones):
    """Portal que se abre cuando un marine lo ve (la Infestación de las misiones de Valkyrie): al pulsarlo, la app
    elige al azar una de las opciones y coloca sus demonios en las casillas dadas (placement1 a placement4)."""
    token, ces, cen = PORTAL[color]
    tk, ev = f"TokenPortal{nombre}", f"EventPortal{nombre}"
    m.c(tk, f"Un portal {ces} crepita. Pulsadlo en cuanto un marine tenga línea de visión con él.",
        [("Un marine lo ve: ¡se abre!", ev, "red", "A marine sees it: it opens!")],
        en=f"A {cen} portal crackles. Press it as soon as a marine has line of sight to it.",
        type=token, xposition=pos[0], yposition=pos[1])
    spawns = []
    for k, op in enumerate(opciones):
        letra = "AB"[k] if len(opciones) <= 2 else str(k + 1)
        chain = []
        for g, (monstruo, cuentas, casillas) in enumerate(op.grupos):
            sp = f"SpawnPortal{nombre}{letra}{g + 1 if len(op.grupos) > 1 else ''}"
            places = []
            for i, sq in enumerate(casillas[:max(cuentas)]):
                mp = f"MPlace{sp[5:]}{i + 1}"
                m.c(mp, xposition=sq[0], yposition=sq[1])
                places.append(mp)
            kv = {f"placement{h}": " ".join(places[:cuentas[h - 1]]) for h in range(1, 5)}
            primero = g == 0
            es = (f"<b>¡Se abre el portal {ces}!</b>\n\nColocad el grupo de {{type}} en las casillas marcadas o, si "
                  f"no caben, en las libres más cercanas." if primero else
                  "Y también: colocad el grupo de {type} en las casillas marcadas.")
            en = (f"<b>The {cen} portal opens!</b>\n\nPlace the {{type}} group on the marked spaces or, if they do "
                  f"not fit, on the closest empty ones." if primero else
                  "And also: place the {type} group on the marked spaces.")
            m.c(sp, es, [("Continuar", "")], en=en, monster=monstruo, xposition=pos[0], yposition=pos[1], **kv)
            chain.append(sp)
        if op.argent:
            chain.append(ganar_argent(m, op.argent))
        for a, b in zip(chain, chain[1:]):
            m.sc.components[a]["event1"] = b
        spawns.append(chain[0])
    m.c(ev, display="false", buttons="1", event1=" ".join(spawns), randomevents="true", remove=tk,
        comment="La app elige al azar uno de los grupos del portal (randomevents)")
    return tk


# ----------------------------------------------------------------------------------------------
# Ronda: Argent y mazo de amenaza
# ----------------------------------------------------------------------------------------------
def ronda(m, argent=2, amenaza=True, siguiente=""):
    """StartRound: el invasor gana Argent si hay demonios y, si se juega con él, se roba una carta de amenaza.
    Devuelve el evento que pregunta si se usa el mazo de amenaza (encadénalo en la preparación; después sigue
    a 'siguiente') o None."""
    if not argent and not amenaza:
        return None
    sig = "EventAmenazaRonda" if amenaza else ""
    m.c("EventRonda", display="false", buttons="1", trigger="StartRound",
        event1=f"EventArgentRonda {sig}".strip() if argent else sig,
        comment="Cada ronda, la 1 incluida: " + " y ".join(x for x, y in (("Argent", argent),
                                                                        ("mazo de amenaza", amenaza)) if y))
    if argent:
        m.c("EventArgentRonda", f"<b>Energía Argent</b>\n\nEl invasor gana {argent} Argent: repartidlos lo más igual "
                                f"posible entre las cartas de los demonios que hay en el mapa.",
            [("Continuar", sig)], en=f"<b>Argent energy</b>\n\nThe invader gains {argent} Argent: split it as evenly "
                                     f"as possible among the cards of the demons on the map.",
            vartests="VarOperation:#monsters,>,0")
    if not amenaza:
        return None
    n = len(CARTAS_AMENAZA)
    reset = " ".join(f"amenaza{i},=,0" for i in range(1, n + 1))
    m.c("EventAmenazaPregunta", "<b>Mazo de amenaza</b>\n\n¿Jugáis con el mazo de amenaza de esta misión? Al "
                                "empezar cada ronda saldrá una carta al azar con un efecto para esa ronda.",
        [("Sí", "EventAmenazaSi", "green"), ("No", "EventAmenazaNo", "red")],
        en="<b>Threat deck</b>\n\nDo you play with this mission's threat deck? At the start of each round a random "
           "card with an effect for that round will come up.")
    m.c("EventAmenazaSi", display="false", buttons="1", operations=f"amenazaActiva,=,1 amenazaQuedan,=,{n} {reset}",
        event1=siguiente)
    m.c("EventAmenazaNo", display="false", buttons="1", operations="amenazaActiva,=,0", event1=siguiente)
    m.c("EventAmenazaRonda", display="false", buttons="1", vartests="VarOperation:amenazaActiva,==,1",
        event1="EventAmenazaBarajar EventAmenazaRobar")
    m.c("EventAmenazaBarajar", display="false", buttons="1", vartests="VarOperation:amenazaQuedan,<=,0",
        operations=f"amenazaQuedan,=,{n} {reset}", event1="EventAmenazaRobar",
        comment="Se acabó el mazo: se baraja de nuevo")
    m.c("EventAmenazaRobar", display="false", buttons="1", randomevents="true",
        event1=" ".join(f"EventAmenaza{i}" for i in range(1, n + 1)))
    for i, (tes, ten, es, en) in enumerate(CARTAS_AMENAZA, 1):
        m.c(f"EventAmenaza{i}", f"<b>Carta de amenaza: {tes}</b>\n\n{es}\n\n<i>Quedan {{var:amenazaQuedan}} cartas "
                                f"en el mazo.</i>", [("Continuar", "")],
            en=f"<b>Threat card: {ten}</b>\n\n{en}\n\n<i>{{var:amenazaQuedan}} cards left in the deck.</i>",
            vartests=f"VarOperation:amenaza{i},==,0", operations=f"amenaza{i},=,1 amenazaQuedan,-,1")
    return "EventAmenazaPregunta"


# ----------------------------------------------------------------------------------------------
# Reglas, frags y finales
# ----------------------------------------------------------------------------------------------
def frags(n):
    """Operación que deja la «moral» de Valkyrie lista para que el invasor gane con n frags (1 o más)."""
    if n < 1:
        raise ValueError("el invasor necesita al menos 1 frag para ganar")
    return f"$%morale,=,{n - 1}"


def reglas(m, x, y, frags_n=6, argent=2, amenaza=True, pelotones=True):
    """Fichas de reglas fuera del mapa (en x, y y x, y-1): cómo se juega con la app y reglas de la misión.
    pelotones: True si se juega con las cartas de pelotón y grupos fijos, como el juego de mesa (con un solo
    marine, Solo Operative le da dos activaciones por ronda); False si los grupos crecen con los marines."""
    app_es = ("<b>Cómo se juega con la app</b>\n\nValkyrie hace de invasor. Jugad las activaciones de los marines "
              "en el orden que queráis: al terminar cada una, pulsad «Fin del Turno» en el retrato del marine y la app "
              "activará un grupo de demonios al azar. Moved y atacad con sus figuras como dice la activación. La "
              "defensa de un demonio es la primera carta del mazo de eventos: usad solo sus iconos.\n\n"
              "Cuando muera un marine, pulsad KO en su retrato. En su siguiente activación reaparece en un "
              "teletransportador activo: pulsad Recuperar.\n\nCuando un marine tenga línea de visión con un portal, "
              "pulsadlo. Los demonios no abren puertas.")
    app_en = ("<b>Playing with the app</b>\n\nValkyrie plays the invader. Play the marines' activations in any "
              "order: after each one, press «End Turn» on that marine's portrait and the app will activate a random "
              "demon group. Move and attack with its figures as the activation says. A demon's defense is the top card "
              "of the event deck: use only its icons.\n\nWhen a marine dies, press KO on their portrait. At the start "
              "of their next activation they respawn on an active teleporter: press Recover.\n\nWhen a marine has "
              "line of sight to a portal, press it. Demons do not open doors.")
    if pelotones:
        app_es += ("\n\n<b>Un solo marine</b> (carta de pelotón Solo Operative): tiene dos activaciones por ronda. Al "
                   "acabar la primera, pulsad «Forzar Activación» en el retrato de un grupo de demonios que aún no haya "
                   "actuado, elegido al azar; al acabar la segunda, «Fin del Turno».")
        app_en += ("\n\n<b>A single marine</b> (Solo Operative squad card) has two activations each round. After the "
                   "first, press «Force Activate» on the portrait of a demon group that has not acted yet, chosen at "
                   "random; after the second, «End Turn».")
    m.c("TokenReglasApp", app_es, [("Continuar", "")], en=app_en, type="Token_DM1_Objective", xposition=x,
        yposition=y)
    if argent:
        arg_es = (f"el invasor gana {argent} al empezar cada ronda si hay demonios en el mapa, y más con algunos "
                  f"portales.")
        arg_en = (f"the invader gains {argent} at the start of each round if there are demons on the map, and more "
                  f"from some portals.")
    else:
        arg_es, arg_en = "el invasor solo gana el que dan algunos portales.", "the invader only gains what some " \
                                                                             "portals give."
    mis_es = ("<b>Reglas de la misión</b>\n\n<b>Portales:</b> se abren cuando un marine los ve (la variante de "
              "Infestación de las misiones de Valkyrie). Si no quedan figuras de un demonio, no salen más.\n"
              "<b>Pelotón:</b> " + ("con menos de 4 marines, usad las cartas de pelotón." if pelotones else
                                    "no uséis las cartas de pelotón: los grupos ya dependen del número de marines.") +
              f"\n<b>Argent:</b> {arg_es}" +
              ("\n<b>Mazo de amenaza:</b> si lo usáis, una carta al empezar cada ronda." if amenaza else "") +
              f"\n<b>Frags:</b> el invasor gana con {frags_n}. Valkyrie los lleva como su «moral»: el número rojo de "
              f"arriba a la izquierda es cuántas bajas más podéis sufrir sin perder, y cada KO lo baja en 1.")
    mis_en = ("<b>Mission rules</b>\n\n<b>Portals:</b> they open when a marine sees them (the Valkyrie missions' "
              "variant of Infestation). If no figures of a demon are left, no more come out.\n"
              "<b>Squad:</b> " + ("with fewer than 4 marines, use the squad cards." if pelotones else
                                  "do not use the squad cards: the groups already depend on the number of marines.") +
              f"\n<b>Argent:</b> {arg_en}" +
              ("\n<b>Threat deck:</b> if you use it, one card at the start of each round." if amenaza else "") +
              f"\n<b>Frags:</b> the invader wins with {frags_n}. Valkyrie tracks them as its «morale»: the red number "
              f"at the top left is how many more casualties you can take without losing, and each KO lowers it by 1.")
    m.c("TokenReglasMision", mis_es, [("Continuar", "")], en=mis_en, type="Token_DM1_Objective", xposition=x,
        yposition=y - 1)
    return ["TokenReglasApp", "TokenReglasMision"]


def derrota(m, es, en):
    """El invasor llega a sus frags (NoMorale): fin de la partida."""
    m.c("EventDerrota", es, [("Fin", "")], en=en, trigger="NoMorale", operations="$end,=,1",
        comment="NoMorale salta al bajar la moral de 0: con $%morale = frags - 1, en el último frag")
    return "EventDerrota"
