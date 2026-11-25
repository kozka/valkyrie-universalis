#!/usr/bin/env python3
"""
grafo.py - Muestra el flujo narrativo de un escenario de Descent: qué dispara qué.

Uso:
    python grafo.py <escenario>                  # esquema en texto (para revisar la historia)
    python grafo.py <escenario> --mermaid g.md   # diagrama Mermaid (Markdown)
    python grafo.py <escenario> --html g.html    # página HTML con el diagrama
    python grafo.py <escenario> --idioma Spanish

En una campaña, <escenario> es la carpeta de una aventura (la raíz o una subcarpeta); los saltos a otra
aventura salen como «↪ aventura …».

En el esquema: [T] disparador, ⇒ botón y evento siguiente, → paso automático (evento silencioso),
+ componentes añadidos, − retirados, = operaciones, ? condiciones, ⚑ fin de la aventura ($end),
🛒 abre la tienda (añade 2 o más QItem), ↪ cambia de aventura, ↺ ya visto.
"""
import argparse
import os
import re
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from valkyrie_io import Scenario, component_type, EVENT_LIKE  # noqa: E402

sys.setrecursionlimit(20000)


def short(s, n=70):
    if s is None:
        return ""
    s = re.sub(r"<[^>]+>", "", s).replace("\n", " ").strip()
    return s if len(s) <= n else s[:n - 1] + "…"


def bonito(cond):
    """VarOperation:a,==,1 VarTestsLogicalOperator:AND ... -> a==1 AND ..."""
    out = []
    for x in cond.split():
        tipo, _, val = x.partition(":")
        if tipo == "VarOperation":
            p = val.split(",")
            out.append("".join(p) if len(p) == 3 else val)
        else:
            out.append(val)
    return " ".join(out)


def buttons_of(kv):
    display = kv.get("display", "true").lower() != "false"
    try:
        b = int(kv.get("buttons", "1" if display else "0") or 0)
    except ValueError:
        b = 0
    if display and "buttons" not in kv:
        b = 1
    return b


def outline(sc, lang):
    C = sc.components
    seen = set()
    out = []

    def walk(n, depth, via=""):
        kv = C.get(n)
        pad = "  " * depth
        if kv is None:
            if n.lower().endswith(".ini"):
                out.append(f"{pad}{via}↪ aventura {n}")
            else:
                out.append(f"{pad}{via}{n}  (¡no existe!)")
            return
        t = component_type(n)
        flags = []
        if kv.get("vartests"):
            flags.append("? " + bonito(kv["vartests"]))
        if any(o.startswith("$end,=,") and not o.endswith(",0") for o in kv.get("operations", "").split()):
            flags.append("⚑ FIN")
        qitems = [x for x in kv.get("add", "").split() if component_type(x) == "QItem"]
        if len(qitems) >= 2:
            flags.append(f"🛒 TIENDA ({len(qitems)} objetos)")
        if "#shop" in kv.get("remove", "").split():
            flags.append("cierra la tienda")
        text = short(sc.text(lang, f"{n}.text"))
        head = f"{pad}{via}{n} [{t}]" + (f" «{text}»" if text else "") + ("  " + " | ".join(flags) if flags else "")
        if n in seen:
            out.append(head + "  ↺")
            return
        seen.add(n)
        out.append(head)
        if kv.get("add"):
            out.append(f"{pad}   + {kv['add']}")
        if kv.get("remove"):
            out.append(f"{pad}   − {kv['remove']}")
        if kv.get("operations"):
            ops = [o for o in kv["operations"].split() if not o.startswith("$end")]
            if ops:
                out.append(f"{pad}   = {' '.join(ops)}")
        # componentes clicables añadidos
        for comp in kv.get("add", "").split():
            ct = component_type(comp)
            ckv = C.get(comp, {})
            decorativo = buttons_of(ckv) == 0 and sc.text(lang, f"{comp}.text") is None
            if ct in ("Token", "UI", "Door") and comp not in seen and not decorativo:
                walk(comp, depth + 2, "(pulsar) ")
        if t in EVENT_LIKE:
            nb = buttons_of(kv)
            for i in range(1, nb + 1):
                targets = kv.get(f"event{i}", "").split()
                label = short(sc.text(lang, f"{n}.button{i}"), 30) or f"botón {i}"
                cond = kv.get(f"event{i}Condition")
                silent = kv.get("display", "true").lower() == "false"
                lab = ("→" if silent else f"⇒ [{label}]") + (f" (si {bonito(cond)})" if cond else "") + " "
                if not targets:
                    continue
                rnd = kv.get("randomevents", "false").lower() == "true"
                if len(targets) > 1:
                    out.append(f"{pad}   {lab}{'AL AZAR entre' if rnd else 'el primero habilitado de'}: {' '.join(targets)}")
                    for tg in targets:
                        walk(tg, depth + 2, "· ")
                else:
                    walk(targets[0], depth + 1, lab)
        if t == "Spawn":
            for m in kv.get("monster", "").split():
                if m.startswith("CustomMonster") and m in C and C[m].get("activation"):
                    out.append(f"{pad}   ({m}: activaciones {C[m]['activation']})")
        if t == "QItem" and kv.get("inspect"):
            walk(kv["inspect"], depth + 1, "(inspeccionar) ")

    # Valkyrie apila los eventos de un mismo disparador en el orden de carga y los saca al revés (LIFO):
    # se muestran en el orden real de ejecución (los definidos más tarde, primero)
    pos = {n: i for i, n in enumerate(C)}
    roots = [(n, kv["trigger"]) for n, kv in C.items() if kv.get("trigger")]
    def rank(trig):
        if trig in ("EventStart", "StartRound", "EndRound"):
            return ("EventStart", "StartRound", "EndRound").index(trig), 0
        m = re.fullmatch(r"EndRound(\d+)", trig)
        if m:
            return 3, int(m.group(1))
        if trig == "NoMorale":
            return 4, 0
        if trig.startswith(("Defeated", "DefeatedUnique")):
            return 5, 0
        if trig.startswith("Var"):
            return 6, 0
        return 9, 0
    roots.sort(key=lambda x: (rank(x[1]), x[1], -pos[x[0]]))
    cuantos = defaultdict(int)
    for _, trig in roots:
        cuantos[trig] += 1
    anterior = None
    nunca = {"Eliminated", "EndInvestigatorTurn", "Mythos", "BeforeMonsterActivation", "StartFinalRound"}
    for n, trig in roots:
        if trig != anterior:
            nota = f"  ({cuantos[trig]} eventos, en el orden en que se ejecutan)" if cuantos[trig] > 1 else ""
            if trig in nunca or trig.startswith("Eliminated"):
                nota += "  ⚠ disparador de Mansiones: en Descent no salta nunca"
            out.append(f"\n[T {trig}]{nota}")
            anterior = trig
        walk(n, 1)
    for n, kv in C.items():
        if component_type(n) == "QItem" and kv.get("inspect") and n not in seen:
            out.append(f"\n[Inventario {n}]")
            walk(n, 1)
    left = [n for n in C if component_type(n) in ("Event", "Spawn", "Puzzle") and n not in seen]
    if left:
        out.append(f"\n[Sin alcanzar desde ningún disparador] {' '.join(left)}")
    return "\n".join(out)


def mermaid(sc, lang):
    C = sc.components
    lines = ["flowchart TD"]
    ids = {}

    def nid(n):
        if n not in ids:
            ids[n] = f"n{len(ids)}"
        return ids[n]

    shapes = {"Event": ("[", "]"), "Token": ("([", "])"), "UI": ("[/", "/]"), "Spawn": ("{{", "}}"),
              "Puzzle": ("[[", "]]"), "Door": ("([", "])")}
    for n, kv in C.items():
        t = component_type(n)
        if t not in EVENT_LIKE:
            continue
        a, b = shapes.get(t, ("[", "]"))
        label = n.replace('"', "'")
        if any(o.startswith("$end,=,") and not o.endswith(",0") for o in kv.get("operations", "").split()):
            label = "⚑ " + label
        lines.append(f'  {nid(n)}{a}"{label}"{b}')
        if kv.get("trigger"):
            tnode = "t_" + re.sub(r"\W", "_", kv["trigger"])
            lines.append(f'  {tnode}(("{kv["trigger"]}")) --> {nid(n)}')
        for i in range(1, buttons_of(kv) + 1):
            for tg in kv.get(f"event{i}", "").split():
                if tg in C:
                    lab = short(sc.text(lang, f"{n}.button{i}"), 20).replace('"', "'").replace("{action}", "(acción)")
                    lines.append(f'  {nid(n)} -->|"{lab}"| {nid(tg)}' if lab else f"  {nid(n)} --> {nid(tg)}")
        for comp in kv.get("add", "").split():
            if component_type(comp) in ("Token", "UI", "Door") and comp in C:
                lines.append(f"  {nid(n)} -.-> {nid(comp)}")
            elif component_type(comp) == "QItem" and comp in C and C[comp].get("inspect") in C:
                lines.append(f"  {nid(n)} -.->|objeto| {nid(comp)}")
        if t == "Spawn":
            for m in kv.get("monster", "").split():
                if m.startswith("CustomMonster") and m in C:
                    lines.append(f"  {nid(n)} -.-> {nid(m)}")
        for i in range(1, buttons_of(kv) + 1):
            for tg in kv.get(f"event{i}", "").split():
                if tg not in C and tg.lower().endswith(".ini"):
                    lines.append(f'  {nid(n)} --> {nid(tg)}[/"↪ {tg}"/]')
    # objetos con inspeccionar y monstruos propios con sus eventos
    for n, kv in C.items():
        t = component_type(n)
        if t == "QItem" and kv.get("inspect") in C:
            lines.append(f'  {nid(n)}[("{n}")]')
            lines.append(f'  {nid(n)} -->|inspeccionar| {nid(kv["inspect"])}')
        if t == "CustomMonster":
            lines.append(f'  {nid(n)}{{{{"{n}"}}}}')
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("escenario")
    ap.add_argument("--mermaid")
    ap.add_argument("--html")
    ap.add_argument("--idioma")
    a = ap.parse_args()
    sc = Scenario.load(a.escenario)
    lang = a.idioma or sc.default_language
    if a.mermaid:
        with open(a.mermaid, "w", encoding="utf-8") as fh:
            fh.write("```mermaid\n" + mermaid(sc, lang) + "\n```\n")
        print(f"Mermaid guardado en {a.mermaid}")
    if a.html:
        title = sc.text(lang, "quest.name") or os.path.basename(a.escenario)
        html = f"""<!doctype html><html><head><meta charset="utf-8"><title>{title}</title>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<style>body{{font-family:sans-serif;background:#111;color:#eee}} .mermaid{{background:#fff;border-radius:8px}}</style>
</head><body><h1>{title}</h1><p>Rectángulo = evento, píldora = ficha o puerta, hexágono = grupo de monstruos,
doble = puzle, ⚑ = fin de la aventura, ↪ = salto a otra aventura de la campaña, línea discontinua =
componente añadido al tablero.</p>
<pre class="mermaid">
{mermaid(sc, lang)}
</pre><script>mermaid.initialize({{startOnLoad:true, flowchart:{{useMaxWidth:false}}}});</script></body></html>"""
        with open(a.html, "w", encoding="utf-8") as fh:
            fh.write(html)
        print(f"HTML guardado en {a.html}")
    if not a.mermaid and not a.html:
        print(outline(sc, lang))


if __name__ == "__main__":
    main()
