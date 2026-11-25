#!/usr/bin/env python3
"""
alcance.py - Qué componentes de un escenario se pueden llegar a ejecutar (para validar.py y grafo.py).

Se parte de los eventos con disparador (trigger=…: EventStart, StartRound, EndRound, NoMorale,
Defeated…, Var…) y se sigue lo que Valkyrie puede encolar o poner en el tablero:
  * los eventos de cada botón (eventN), aunque tengan condiciones;
  * lo que un evento añade (add=): fichas, puertas y elementos de UI se pueden pulsar, así que sus
    eventos también son alcanzables; un QItem con inspect= hace alcanzable ese evento;
  * los QItem iniciales (starting=True) con inspect=.
Es una aproximación por exceso (no evalúa variables): lo que queda fuera seguro que no se ejecuta.
"""
import re

from valkyrie_io import component_type

EVENTISH = {"Event", "Token", "Door", "UI", "Spawn", "Puzzle"}


def reachable(sc):
    C = sc.components
    todo = []
    seen = set()

    def push(n):
        if n in C and n not in seen:
            seen.add(n)
            todo.append(n)

    for n, kv in C.items():
        t = component_type(n)
        if t in EVENTISH and kv.get("trigger"):
            push(n)
        if t in ("QItem", "StartingItem") and kv.get("starting", "True").lower() == "true":
            push(n)
    while todo:
        n = todo.pop()
        kv = C[n]
        t = component_type(n)
        if t in ("QItem", "StartingItem"):
            if kv.get("inspect"):
                push(kv["inspect"])
            continue
        for k, v in kv.items():
            if re.fullmatch(r"event\d+", k):
                for tg in v.split():
                    push(tg)
        for x in kv.get("add", "").split():
            push(x)
    return seen


def _buttons(kv):
    """Los botones de un evento como los lee Valkyrie (QuestData.Event): buttons=, y uno si se muestra."""
    display = kv["display"].strip().lower() == "true" if "display" in kv else True
    try:
        count = int(kv.get("buttons", "0").strip() or 0)
    except ValueError:
        count = 0
    return 1 if display and count == 0 else count


def reading_order(sc):
    """Cada componente una vez, en el orden en que se lee el escenario abierto del todo (como el árbol de eventos
    del editor de Valkyrie Universalis, QuestGraph.readingOrder): los eventos de cada disparador, los de EventStart
    primero, y los objetos iniciales, cada uno seguido de lo que lleva a otro (sus botones, lo que añade, los
    monstruos propios de un Spawn, las activaciones de un CustomMonster, el inspect de un objeto, los eventos que
    salta su derrota y los Var que pone); después, aparte, lo que nada alcanza."""
    C = sc.components
    names = list(C)

    def triggered(trig):
        # Valkyrie los encola en el orden del escenario y ejecuta el último primero
        return [n for n in reversed(names) if component_type(n) in EVENTISH and C[n].get("trigger", "") == trig]

    defeated_by = {}
    led = set()
    for n in names:
        if component_type(n) in EVENTISH:
            m = re.match(r"^Defeated(?:Unique)?(.+)$", C[n].get("trigger", ""))
            if m and m.group(1) in C:
                defeated_by.setdefault(m.group(1), []).append(n)

    def links(n):
        kv = C[n]
        t = component_type(n)
        out = []
        if t in EVENTISH:
            for i in range(1, _buttons(kv) + 1):
                out += [x for x in kv.get(f"event{i}", "").split() if not x.lower().endswith("quest.ini")]
            out += kv.get("add", "").split()
        if t == "Spawn":
            out += [x for x in kv.get("monster", "").split() if not x.startswith("Monster")]
        if t == "CustomMonster":
            out += ["Activation" + x if "Activation" + x in C else x for x in kv.get("activation", "").split()]
            out += [kv[k] for k in ("evadeevent", "horrorevent") if kv.get(k)]
        if t in ("QItem", "StartingItem") and kv.get("inspect"):
            out.append(kv["inspect"])
        return [x for x in out if x in C]

    for n in names:
        led.update(links(n))

    def following(n):
        out = links(n) + defeated_by.get(n, [])
        for op in C[n].get("operations", "").split():
            var = op.split(",")[0]
            if var.startswith("@"):
                out += triggered("Var" + var[1:])
        return out

    seen = set()
    order = []

    def walk(starts):
        stack = list(reversed(starts))
        while stack:
            n = stack.pop()
            if n in seen or n not in C:
                continue
            seen.add(n)
            order.append(n)
            stack.extend(reversed(following(n)))

    triggers = []
    for n in names:
        tr = C[n].get("trigger", "") if component_type(n) in EVENTISH else ""
        if tr and tr not in triggers:
            triggers.append(tr)
    triggers.sort(key=lambda tr: tr != "EventStart")
    starting = [n for n in names if component_type(n) in ("QItem", "StartingItem")
                and C[n].get("starting", "True").strip().lower() == "true"]
    walk([n for tr in triggers for n in triggered(tr)] + starting)
    rest = [n for n in names if n not in seen]
    walk([n for n in rest if n not in led] + rest)
    return order
