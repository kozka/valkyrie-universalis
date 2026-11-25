#!/usr/bin/env python3
"""
nueva_mision.py - Crea el esqueleto de una misión para el pack de la comunidad DooM en Valkyrie (modo Descent),
lista para abrir en el editor y seguir construyendo.

Trae: prólogo, preparación (mazos de los marines y del invasor), pregunta del mazo de amenaza, la entrada con
su teletransportador, una primera sala con demonios y un botiquín, una puerta que revela la segunda sala (con
un portal azul de dos grupos al azar, un arma y una consola de objetivo), Argent al empezar cada ronda, fichas
de reglas fuera del mapa, victoria al completar la consola y derrota por frags (NoMorale). Al terminar pasa
validar.py de la skill descent-valkyrie y sale con error si encuentra alguno.

Uso:
  python nueva_mision.py <Identificador> --titulo "Laboratorio 3"
        [--destino CARPETA] [--idioma Spanish|English] [--ingles] [--autor "Nombre"]
        [--sala1 TileSideDooM_08_A] [--sala2 TileSideDooM_05_A] [--frags 6] [--argent 2]
        [--sin-amenaza] [--escalar] [--dificultad 0.4] [--duracion 45-60]

--sala1: necesita 2 salidas conocidas o más y 3 casillas libres. De las caras B solo sirven 10_B y 12_B; de las
         A, 03, 05, 08, 09, 10, 11, 12 y 16 (mapa.py --info <cara> enseña sus salidas).
--sala2: al menos 6 casillas (de la 01 a la 10, o la 16).
--escalar: grupos de demonios que crecen con los marines y sin cartas de pelotón. Por defecto, como el juego de
           mesa: grupos fijos y cartas de pelotón (con un marine, Solo Operative y sus dos activaciones).

Necesita la skill descent-valkyrie junto a esta: valida con su validar.py y dibuja con su mapa.py.
"""
import argparse
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import doom as D  # noqa: E402

SKILL_D = os.path.normpath(os.path.join(HERE, "..", "..", "descent-valkyrie", "scripts"))

# Figuras de cada grupo: fijas (como el juego de mesa) o con 1, 2, 3 y 4 marines (--escalar)
GRUPOS = {"inicio": (2, (1, 1, 2, 2)), "imps": (3, (1, 2, 2, 3)), "poseidos": (2, (1, 1, 2, 2))}


def center(sqs):
    xs = [s[0] for s in sqs]
    ys = [s[1] for s in sqs]
    return round(sum(xs) / len(xs)), round(sum(ys) / len(ys))


def tablero(sala1, sala2):
    T = D.Tablero()
    T.poner("TileSala1", sala1, 0, 0, 0)
    ex = sorted(T.salidas("TileSala1", 2), key=lambda e: ({"S": 0, "O": 1, "E": 2, "N": 3}[e[1]], -e[2]))
    if len(ex) < 2:
        sys.exit(f"{sala1} tiene menos de 2 salidas conocidas: elige otra --sala1 (ver la ayuda; "
                 f"mapa.py --info {sala1} enseña sus salidas)")
    T.unir("TileEntrada", "TileSideDooM_13_A", "TileSala1", ex[0][1])
    puerta = None
    for e in sorted(ex[1:], key=lambda e: (e[1] != D.G.OPP[ex[0][1]], -e[2])):
        try:
            puerta = T.unir("TileSala2", sala2, "TileSala1", e[1])
            break
        except ValueError:
            continue
    if puerta is None:
        sys.exit(f"No encuentro cómo unir {sala2} a {sala1}: prueba otra --sala2")
    cuartos = []
    for n in ("TileSala1", "TileSala2"):
        for (_, d, _) in T.salidas(n, 2):
            try:
                T.unir(f"TileCuarto{len(cuartos) + 1}", "TileSideDooM_15_A", n, d)
                cuartos.append(f"TileCuarto{len(cuartos) + 1}")
            except ValueError:
                pass
    return T, puerta, cuartos


def reparto(T, cuartos, escalar):
    """Casillas de fichas y demonios, antes de escribir nada: sale con un mensaje si una sala es pequeña."""
    s1, s2, ent = T.casillas("TileSala1"), T.casillas("TileSala2"), T.casillas("TileEntrada")
    used = {center(ent)}
    k = 1 if escalar else 0
    n_inicio = max(D.cuentas_por_marines(GRUPOS["inicio"][k]))
    n_portal = max(max(D.cuentas_por_marines(GRUPOS[g][k])) for g in ("imps", "poseidos"))

    def put(sqs, ref, n, sala, que):
        out = D.cerca(sqs, ref, n, used)
        if len(out) < n:
            opcion = "--sala1" if sala == "TileSala1" else "--sala2"
            sys.exit(f"La pieza {T.piezas[sala][0]} es pequeña para {que}: elige otra {opcion} más grande (ver la "
                     f"ayuda)")
        used.update(out)
        return out

    r = {"botiquin": put(s1, min(s1), 1, "TileSala1", "el botiquín")[0]}
    r["inicio"] = put(s1, max(s1), n_inicio, "TileSala1", f"los {n_inicio} Imps del principio")
    r["portal"] = put(s2, max(s2), 1, "TileSala2", "el portal")[0]
    r["portal_sq"] = put(s2, r["portal"], n_portal, "TileSala2", "los demonios del portal")
    sitio_arma = T.casillas(cuartos[0]) if cuartos else s2
    r["arma"] = put(sitio_arma, center(s2), 1, cuartos[0] if cuartos else "TileSala2", "la motosierra")[0]
    r["consola"] = put(s2, min(s2), 1, "TileSala2", "la consola")[0]
    return r


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("identificador")
    ap.add_argument("--titulo", required=True)
    ap.add_argument("--destino", default=".")
    ap.add_argument("--idioma", choices=["Spanish", "English"], default="Spanish")
    ap.add_argument("--ingles", action="store_true", help="crea también Localization.English.txt")
    ap.add_argument("--autor", default="")
    ap.add_argument("--sala1", default="TileSideDooM_08_A")
    ap.add_argument("--sala2", default="TileSideDooM_05_A")
    ap.add_argument("--frags", type=int, default=6, help="frags con los que gana el invasor (1 o más)")
    ap.add_argument("--argent", type=int, default=2, help="Argent del invasor al empezar cada ronda (0 o más)")
    ap.add_argument("--sin-amenaza", action="store_true", help="sin mazo de amenaza")
    ap.add_argument("--escalar", action="store_true", help="grupos que crecen con los marines, sin cartas de pelotón")
    ap.add_argument("--dificultad", default="0.4")
    ap.add_argument("--duracion", default="45-60")
    a = ap.parse_args()
    if not re.fullmatch(r"[A-Za-z0-9_]+", a.identificador) or a.identificador.startswith("EditorScenario"):
        sys.exit("El identificador va sin espacios ni acentos (letras, números y _) y no empieza por EditorScenario")
    if a.frags < 1:
        sys.exit("--frags: el invasor necesita al menos 1 frag para ganar")
    if a.argent < 0:
        sys.exit("--argent: 0 o más")
    folder = os.path.join(a.destino, a.identificador)
    if os.path.exists(os.path.join(folder, "quest.ini")):
        sys.exit(f"Ya existe {folder}/quest.ini")
    for s in (a.sala1, a.sala2):
        if s not in D.G.losetas():
            sys.exit(f"{s} no es una cara de loseta conocida (buscar.py --tipo losetas --pack DooM)")
    T, puerta, cuartos = tablero(a.sala1, a.sala2)
    r = reparto(T, cuartos, a.escalar)
    k = 1 if a.escalar else 0

    lmin, _, lmax = a.duracion.partition("-")
    idiomas = [a.idioma] + (["English"] if a.ingles and a.idioma != "English" else [])
    m = D.Mision(folder, idiomas=idiomas, nuevo=True,
                 quest={"difficulty": a.dificultad, "lengthmin": lmin, "lengthmax": lmax or lmin})
    amenaza = not a.sin_amenaza
    T.a_mision(m)
    s1, s2, ent = T.casillas("TileSala1"), T.casillas("TileSala2"), T.casillas("TileEntrada")

    autor = a.autor or ("Autor" if a.idioma == "Spanish" else "Author")
    m.t("quest.name", a.titulo, a.titulo)
    m.t("quest.synopsys", "Una línea que enganche, sin destripar.", "A one-line hook, no spoilers.")
    m.t("quest.description", "Descripción tipo tráiler.\n\n<i>Misión para el pack de la comunidad DooM, para 1-4 "
                             "marines. Necesita el juego de mesa DOOM (2016).</i>",
        "Trailer-style description.\n\n<i>Mission for the DooM community pack, for 1-4 marines. Needs the DOOM "
        "board game (2016).</i>")
    m.t("quest.authors", f"<b>Autor</b>\n{autor}", f"<b>Author</b>\n{autor}")
    m.t("quest.authors_short", autor, autor)

    m.c("EventInicio", display="false", buttons="1", trigger="EventStart", event1="EventPrologo",
        operations=D.frags(a.frags), comment=f"El invasor gana con {a.frags} frags: la moral empieza en {a.frags - 1}")
    sig = "EventAmenazaPregunta" if amenaza else "EventMontar"
    m.c("EventPrologo", "<i>Prólogo: dónde están los marines y qué tienen que hacer.</i>",
        [("Continuar", "EventPreparacion")], en="<i>Prologue: where the marines are and what they must do.</i>")
    pel_es = ("No uséis las cartas de pelotón: los grupos de demonios ya dependen del número de marines." if a.escalar
              else "Con menos de 4 marines, usad las cartas de pelotón.")
    pel_en = ("Do not use the squad cards: the demon groups already depend on the number of marines." if a.escalar
              else "With fewer than 4 marines, use the squad cards.")
    m.c("EventPreparacion",
        "<b>Preparación</b>\n\nCada marine forma su mazo con el juego UAC y dos armas iniciales distintas y roba 3 "
        f"cartas. {pel_es} Barajad 3 mazos de evento cualesquiera para la defensa de los demonios.",
        [("Continuar", sig)],
        en="<b>Setup</b>\n\nEach marine builds their deck with the UAC set and two different starting weapons and "
           f"draws 3 cards. {pel_en} Shuffle any 3 event decks for the demons' defense.")
    D.ronda(m, argent=a.argent, amenaza=amenaza, siguiente="EventMontar")
    xs = [x for n in T.piezas for x, _ in T.casillas(n)]
    ys = [y for n in T.piezas for _, y in T.casillas(n)]
    reglas = D.reglas(m, min(xs) - 3, max(ys), frags_n=a.frags, argent=a.argent, amenaza=amenaza,
                      pelotones=not a.escalar)
    m.c("TokenObjetivo", "<b>Objetivo</b>\n\nCompletad la consola de la segunda sala.\n\nEl invasor gana con "
                         f"{a.frags} frags.", [("Continuar", "")],
        en=f"<b>Objective</b>\n\nComplete the console in the second room.\n\nThe invader wins with {a.frags} frags.",
        type="Token_DM1_Objective", xposition=min(xs) - 3, yposition=max(ys) - 2)
    tele = D.teletransporte(m, "Entrada", center(ent), activo=True)
    bot = D.botiquin(m, "Sala1", r["botiquin"])
    D.puerta(m, "DoorSala2", puerta, "EventAbrirSala2")
    m.c("EventMontar",
        "Colocad las piezas {c:TileEntrada} y {c:TileSala1}, la puerta, el teletransportador y el botiquín como se "
        "indica. Los marines empiezan en el teletransportador o a su lado.",
        [("Continuar", "SpawnInicio")],
        en="Place tiles {c:TileEntrada} and {c:TileSala1}, the door, the teleporter and the health pack as shown. "
           "The marines start on the teleporter or next to it.",
        add=" ".join(["TileEntrada", "TileSala1", "DoorSala2", tele, bot, "TokenObjetivo"] + reglas),
        xposition=center(s1)[0], yposition=center(s1)[1], highlight="true")
    inicio = D.cuentas_por_marines(GRUPOS["inicio"][k])
    places = []
    for i, sq in enumerate(r["inicio"], 1):
        places.append(m.c(f"MPlaceInicio{i}", xposition=sq[0], yposition=sq[1]))
    m.c("SpawnInicio", "Colocad el grupo de {type} en las casillas marcadas.", [("Continuar", "")],
        en="Place the {type} group on the marked spaces.", monster="MonsterImp", xposition=r["inicio"][0][0],
        yposition=r["inicio"][0][1], **{f"placement{h}": " ".join(places[:inicio[h - 1]]) for h in range(1, 5)})

    portal = D.portal(m, "Sala2", "azul", r["portal"], [
        D.Opcion([("MonsterImp", GRUPOS["imps"][k], r["portal_sq"])]),
        D.Opcion([("MonsterPossessed", GRUPOS["poseidos"][k], r["portal_sq"])], argent=1)])
    arma = D.arma(m, "Motosierra", "motosierra", r["arma"])
    cons, _ = D.consola(m, "Sala2", r["consola"], 2, "Una consola de control.", "A control console.",
                        "La consola responde.", "The console responds.", siguiente="EventVictoria")
    m.c("EventAbrirSala2",
        "Retirad la puerta y colocad la pieza {c:TileSala2}" + (", las piezas pequeñas" if cuartos else "") +
        ", un portal azul, la motosierra y una consola como se indica.",
        [("Continuar", "")],
        en="Remove the door and place tile {c:TileSala2}" + (", the small tiles" if cuartos else "") +
           ", a blue portal, the chainsaw and a console as shown.",
        remove="DoorSala2", add=" ".join(["TileSala2"] + cuartos + [portal, arma, cons]),
        xposition=center(s2)[0], yposition=center(s2)[1], highlight="true")
    m.c("EventVictoria", "<b>Victoria</b>\n\nEpílogo.", [("Fin", "")], en="<b>Victory</b>\n\nEpilogue.",
        operations="$end,=,1")
    D.derrota(m, f"<b>Derrota</b>\n\nEl invasor se cobra su frag número {a.frags}.",
              f"<b>Defeat</b>\n\nThe invader claims frag number {a.frags}.")
    m.save()
    print(f"Creada {folder}: {len(m.sc.components)} componentes, {len(T.piezas)} piezas "
          f"({', '.join(c.replace('TileSideDooM_', '') for c, *_ in T.piezas.values())}); grupos "
          f"{'que crecen con los marines' if a.escalar else 'fijos y cartas de pelotón'}.")
    res = subprocess.run([sys.executable, os.path.join(SKILL_D, "validar.py"), folder], capture_output=True,
                         text=True)
    print("\n".join(res.stdout.strip().splitlines()[-2:]))
    print(f"Mapa: python {os.path.join(SKILL_D, 'mapa.py')} {folder} --png mapa.png")
    sys.exit(res.returncode)


if __name__ == "__main__":
    main()
