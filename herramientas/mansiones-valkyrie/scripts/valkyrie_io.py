#!/usr/bin/env python3
"""
valkyrie_io.py - Lectura y escritura de escenarios de Valkyrie (Mansiones de la Locura 2ª ed.)
replicando el comportamiento real del código C# de Valkyrie (IniRead.cs, DictionaryI18n.cs,
QuestData.cs, QuestEditor.cs).

Se usa como librería desde el resto de scripts:
    from valkyrie_io import Scenario
    sc = Scenario.load("ruta/al/escenario")
    sc.components["EventStart"]["display"]
    sc.text("Spanish", "EventStart.text")
    sc.set("TokenX", type="TokenSearch", xposition="1.75", yposition="-1.75", buttons="1", event1="EventX")
    sc.set_text("Spanish", "TokenX.text", "Un escritorio.")
    sc.rename("TokenX", "TokenEscritorio")       # actualiza referencias y textos
    sc.delete("EventViejo")                      # borra también sus textos y las referencias
    sc.save()

Reglas replicadas (verificadas en el código de Valkyrie 3.28):
  * INI: comentarios con '#' (en cualquier sitio) o ';' (en líneas de datos); la primera
    aparición de una clave gana; una sección duplicada en el mismo fichero se ignora; los
    valores se recortan y se les quitan las comillas de los extremos; claves sensibles a
    mayúsculas. Una línea con SOLO espacios provoca una excepción en Valkyrie -> se evita.
  * Componente duplicado entre ficheros -> Valkyrie se cierra (Application.Quit).
  * Localización: primera línea ".,Idioma"; "clave,valor" partiendo por la PRIMERA coma;
    '\\n' literal = salto de línea; valor entre comillas "..." con "" para comillas internas,
    o entre |||...||| si contiene comillas; bloques multilínea entre comillas.
"""
from __future__ import annotations

import io
import os
import re
from collections import OrderedDict
from typing import Dict, List, Optional, Tuple

# ----------------------------------------------------------------------------------------
# Constantes del formato
# ----------------------------------------------------------------------------------------
CURRENT_FORMAT = 21          # QuestFormat.CURRENT_VERSION en Valkyrie 3.20+ (3.28 sigue en 21)
MIN_FORMAT = 4               # Quest.minumumFormat

# Prefijo de sección -> tipo de componente (el orden importa: el más largo primero)
COMPONENT_PREFIXES = [
    "CustomMonster", "StartingItem", "Activation", "MPlace", "Puzzle",
    "Spawn", "Event", "QItem", "Token", "Tile", "Door", "UI",
]
# Fichero por defecto que usa el editor para cada tipo (QuestData.*(string) constructors)
DEFAULT_FILE = {
    "Tile": "tiles.ini", "Door": "door.ini", "Token": "tokens.ini", "UI": "ui.ini",
    "Spawn": "spawns.ini", "Event": "events.ini", "MPlace": "mplaces.ini",
    "Puzzle": "puzzles.ini", "CustomMonster": "monsters.ini", "Activation": "monsters.ini",
    "QItem": "items.ini", "StartingItem": "items.ini",
}
# Tipos que se comportan como eventos (tienen botones, add/remove, operations...)
EVENT_LIKE = {"Event", "Token", "Door", "UI", "Spawn", "Puzzle"}

LANGUAGES = ["English", "Spanish", "German", "French", "Italian", "Polish", "Portuguese",
             "Russian", "Chinese", "Czech", "Japanese", "Korean", "Ukrainian"]

TRIPLE = "|||"


def component_type(section_name: str) -> Optional[str]:
    """Devuelve el tipo de componente según el prefijo del nombre de sección (como QuestData.AddData)."""
    for p in COMPONENT_PREFIXES:
        if section_name.startswith(p):
            return p
    return None


def find_case_insensitive(folder: str, relpath: str) -> Optional[str]:
    """Si 'relpath' existe con otras mayúsculas/minúsculas, devuelve el nombre real (ruta relativa)."""
    parts = relpath.replace("\\", "/").split("/")
    cur = folder
    real = []
    for part in parts:
        if not os.path.isdir(cur):
            return None
        match = None
        for entry in os.listdir(cur):
            if entry.lower() == part.lower():
                match = entry
                break
        if match is None:
            return None
        real.append(match)
        cur = os.path.join(cur, match)
    return "/".join(real)


# ----------------------------------------------------------------------------------------
# INI
# ----------------------------------------------------------------------------------------
class IniFile:
    """Fichero INI leído con la semántica de ValkyrieTools.IniRead."""

    def __init__(self, path: str):
        self.path = path
        self.sections: "OrderedDict[str, OrderedDict[str, str]]" = OrderedDict()
        self.warnings: List[str] = []
        self.header_comments: List[str] = []

    @classmethod
    def read(cls, path: str) -> "IniFile":
        ini = cls(path)
        with open(path, "r", encoding="utf-8-sig", errors="replace", newline=None) as fh:
            lines = fh.read().splitlines()
        ini._parse(lines)
        return ini

    @classmethod
    def from_string(cls, text: str, path: str = "<string>") -> "IniFile":
        ini = cls(path)
        ini._parse(text.splitlines())
        return ini

    def _parse(self, lines: List[str]) -> None:
        current: Optional[str] = None
        data: Optional[OrderedDict] = None
        seen_sections = set()
        for n, raw in enumerate(lines, 1):
            if len(raw) > 0 and raw.strip() == "":
                self.warnings.append(f"{os.path.basename(self.path)}:{n}: línea con solo espacios "
                                     f"(Valkyrie lanza una excepción al leerla)")
                continue
            s = raw.strip()
            if not s:
                continue
            if s[0] == "#":
                if current is None:
                    self.header_comments.append(raw)
                continue
            if s[0] == "[":
                name = s.strip("[]")
                if name == "":
                    self.warnings.append(f"{os.path.basename(self.path)}:{n}: sección vacía ignorada")
                if name in seen_sections:
                    self.warnings.append(f"{os.path.basename(self.path)}:{n}: sección duplicada "
                                         f"[{name}] en el mismo fichero: Valkyrie la ignora")
                    current, data = name, OrderedDict()   # se descarta
                    continue
                seen_sections.add(name)
                current, data = name, OrderedDict()
                self.sections[name] = data
                continue
            if s[0] == ";":
                if current is None:
                    self.header_comments.append(raw)
                continue
            if current is None:
                self.warnings.append(f"{os.path.basename(self.path)}:{n}: dato fuera de sección: {s}")
                continue
            if "=" in raw:
                k, v = raw.split("=", 1)
                k = k.strip()
                v = v.strip().strip('"')
            else:
                k, v = s, ""
            if k in data:
                self.warnings.append(f"{os.path.basename(self.path)}:{n}: clave duplicada '{k}' en "
                                     f"[{current}]: Valkyrie usa la primera")
                continue
            data[k] = v


def write_ini(path: str, sections: "OrderedDict[str, OrderedDict[str, str]]",
              header: str = "; Generado con la skill mansiones-valkyrie", newline: str = "\r\n") -> None:
    """Escribe un INI con el estilo del editor de Valkyrie (sin líneas de solo espacios)."""
    out = io.StringIO()
    if header:
        out.write(header + newline)
    for name, kv in sections.items():
        out.write(newline + f"[{name}]" + newline)
        for k, v in kv.items():
            if v is None:
                continue
            if v == "" and k.endswith(".txt") or v == "" and k.endswith(".ini"):
                out.write(k + newline)          # listas de ficheros de [QuestText]/[QuestData]
            else:
                out.write(f"{k}={v}" + newline)
    with open(path, "w", encoding="utf-8", newline="") as fh:
        fh.write(out.getvalue())


# ----------------------------------------------------------------------------------------
# Localización
# ----------------------------------------------------------------------------------------
def _split_lines_like_valkyrie(text: str) -> List[str]:
    # DictionaryI18n.AddDataFromFile: si hay algún '\r' parte por '\r', si no por '\n'
    if "\r" in text:
        return text.split("\r")
    return text.split("\n")


def _is_old_format(raw_line: str) -> bool:
    comps = raw_line.split(",", 1)
    is_not_old = len(comps) > 1 and len(comps[1]) > 0 and comps[1][0] == '"'
    return not is_not_old


def parse_localization_text(text: str) -> Tuple[str, List[str], List[str]]:
    """Devuelve (idioma, entradas_en_bruto, avisos) replicando DictionaryI18n.AddData."""
    warnings: List[str] = []
    if text.startswith("﻿"):
        text = text[1:]
    if "\r" in text and "\n" in text.replace("\r\n", ""):
        warnings.append("mezcla de finales de línea (CRLF y LF): Valkyrie partirá solo por '\\r' "
                        "y unirá líneas; usa un único tipo de salto de línea")
    lines = _split_lines_like_valkyrie(text)
    raw_entries: List[str] = []
    current: List[str] = []
    end_of_line = False
    triple_mode = False
    for raw in lines:
        trimmed = raw.strip("\r\n")
        sections = len(trimmed.split('"'))
        is_first = len(current) == 0
        current.append(trimmed)
        starts_triple = is_first and (f",{TRIPLE}" in trimmed)
        if starts_triple or triple_mode:
            triple_mode = not trimmed.rstrip().endswith(TRIPLE)
            end_of_line = not triple_mode
        elif sections % 2 == 1:
            end_of_line = is_first and not triple_mode
        elif (not is_first) or _is_old_format(trimmed):
            end_of_line = not triple_mode
        if end_of_line:
            raw_entries.append("\n".join(current))
            current = []
            end_of_line = False
            triple_mode = False
    if current:
        warnings.append("bloque sin cerrar al final del fichero (comillas o ||| desparejados): "
                        + " / ".join(current)[:120])
        raw_entries.append("\\n".join(current))
    language = ""
    if raw_entries:
        first = raw_entries[0]
        parts = first.split(",")
        if len(parts) > 1 and parts[0].strip() == ".":
            language = parts[1].strip().strip('"')
        else:
            warnings.append(f"la primera línea debe ser '.,Idioma' y es: {first[:60]!r}")
    return language, raw_entries, warnings


def parse_entry_value(entry: str) -> str:
    """DictionaryI18n.ParseEntry: \\n -> salto, |||...||| y "..." con comillas dobles."""
    v = entry.replace("\\n", "\n")
    if len(v) >= len(TRIPLE) * 2 and v.startswith(TRIPLE) and v.strip().endswith(TRIPLE):
        v = v[len(TRIPLE):len(v) - len(TRIPLE)]
    if len(v) > 1 and v[0] == '"' and v[-1] == '"':
        v = v[1:-1].replace('""', '"')
    return v


def encode_entry_value(value: str) -> str:
    """Codifica un valor como lo hace el editor (DictionaryI18n.SerializeMultiple).

    Mejora: si el valor empieza Y termina por comillas, el editor las perdería al leerlo
    (ParseEntry las quita); aquí se protegen con |||"…"||| y comillas dobladas. Y un valor con ||| va
    entre |||…|||: entre comillas, como lo escribe el editor, un ",|||" dentro hace que Valkyrie se
    trague las líneas siguientes. Un valor con ||| que empieza y acaba con comillas no se puede escribir
    de forma que Valkyrie lo lea igual: da ValueError.
    """
    raw = value.replace("\r\n", "\n").replace("\r", "\n").replace("\n", "\\n")
    if TRIPLE in raw:
        if len(raw) > 1 and raw[0] == '"' and raw[-1] == '"':
            raise ValueError(f"texto que Valkyrie no leería igual (empieza y acaba con comillas y lleva {TRIPLE}): "
                             f"{value[:60]!r}")
        return TRIPLE + raw + TRIPLE
    if len(raw) > 1 and raw[0] == '"' and raw[-1] == '"':
        return TRIPLE + '"' + raw.replace('"', '""') + '"' + TRIPLE
    if '"' in raw:
        return TRIPLE + raw + TRIPLE
    if '"' in raw or TRIPLE in raw or "\\n" in raw:
        return '"' + raw.replace('"', '""') + '"'
    return raw


class Localization:
    """Un fichero Localization.<Idioma>.txt."""

    def __init__(self, language: str, path: Optional[str] = None):
        self.language = language
        self.path = path
        self.entries: "OrderedDict[str, str]" = OrderedDict()   # clave -> valor YA decodificado
        self.warnings: List[str] = []
        self.duplicates: List[str] = []

    @classmethod
    def read(cls, path: str) -> "Localization":
        with open(path, "r", encoding="utf-8-sig", errors="replace", newline="") as fh:
            text = fh.read()
        lang, raw_entries, warns = parse_localization_text(text)
        loc = cls(lang, path)
        loc.warnings.extend(warns)
        for raw in raw_entries[1:]:
            if raw.strip().startswith("//") or raw.strip() == "":
                continue
            parts = raw.split(",", 1)
            if len(parts) != 2:
                loc.warnings.append(f"línea sin coma ignorada: {raw[:60]!r}")
                continue
            key, val = parts[0], parts[1]
            if key in loc.entries:
                loc.duplicates.append(key)
                continue
            loc.entries[key] = parse_entry_value(val)
        return loc

    def write(self, path: Optional[str] = None, newline: str = "\r\n") -> None:
        path = path or self.path
        lines = [f".,{self.language}"]
        for k, v in self.entries.items():
            lines.append(f"{k},{encode_entry_value(v)}")
        with open(path, "w", encoding="utf-8", newline="") as fh:
            fh.write(newline.join(lines) + newline)


# ----------------------------------------------------------------------------------------
# Escenario completo
# ----------------------------------------------------------------------------------------
class Scenario:
    """Escenario de Valkyrie en una carpeta (quest.ini + .ini + Localization.*.txt)."""

    def __init__(self, folder: str):
        self.folder = os.path.abspath(folder)
        self.quest: "OrderedDict[str, str]" = OrderedDict()
        self.quest_text_files: List[str] = []
        self.quest_data_files: List[str] = []
        self.quest_header: List[str] = []
        self.components: "OrderedDict[str, OrderedDict[str, str]]" = OrderedDict()
        self.source: Dict[str, str] = {}             # componente -> fichero .ini
        self.localizations: "OrderedDict[str, Localization]" = OrderedDict()   # idioma -> Localization
        self.loc_files: Dict[str, str] = {}          # fichero -> idioma
        self.warnings: List[str] = []
        self.errors: List[str] = []

    # -------------------------- carga --------------------------
    @classmethod
    def load(cls, folder: str) -> "Scenario":
        sc = cls(folder)
        qpath = os.path.join(sc.folder, "quest.ini")
        if not os.path.exists(qpath):
            raise FileNotFoundError(f"No existe {qpath}")
        q = IniFile.read(qpath)
        sc.warnings.extend(q.warnings)
        sc.quest_header = q.header_comments
        if "Quest" not in q.sections:
            sc.errors.append("quest.ini no tiene sección [Quest] (obligatoria)")
        sc.quest = q.sections.get("Quest", OrderedDict())
        sc.quest_text_files = [k for k in q.sections.get("QuestText", {}).keys() if k]
        sc.quest_data_files = [k for k in q.sections.get("QuestData", {}).keys() if k]
        files = ["quest.ini"] + sc.quest_data_files
        for f in files:
            path = os.path.join(sc.folder, f)
            if not os.path.exists(path):
                alt = find_case_insensitive(sc.folder, f)
                if alt:
                    sc.errors.append(f"[QuestData] cita '{f}' pero el fichero se llama '{alt}': funciona en "
                                     f"Windows pero Valkyrie se cierra en Linux/Android (mayúsculas)")
                    path = os.path.join(sc.folder, alt)
                else:
                    sc.errors.append(f"[QuestData] cita '{f}' pero el fichero no existe (Valkyrie se cierra)")
                    continue
            ini = q if f == "quest.ini" else IniFile.read(path)
            if f != "quest.ini":
                sc.warnings.extend(ini.warnings)
            for name, kv in ini.sections.items():
                if name in ("Quest", "QuestText", "QuestData"):
                    continue
                if name in sc.components:
                    sc.errors.append(f"componente duplicado '{name}' (en {sc.source[name]} y {f}): "
                                     f"Valkyrie se cierra al cargar")
                    continue
                if component_type(name) is None:
                    sc.warnings.append(f"sección [{name}] en {f} con prefijo desconocido: Valkyrie la ignora")
                sc.components[name] = kv
                sc.source[name] = f
        for f in sc.quest_text_files:
            path = os.path.join(sc.folder, f)
            if not os.path.exists(path):
                alt = find_case_insensitive(sc.folder, f)
                if alt:
                    sc.errors.append(f"[QuestText] cita '{f}' pero el fichero se llama '{alt}' "
                                     f"(falla en Linux/Android por mayúsculas)")
                    path = os.path.join(sc.folder, alt)
                else:
                    sc.errors.append(f"[QuestText] cita '{f}' pero el fichero no existe")
                    continue
            loc = Localization.read(path)
            for w in loc.warnings:
                sc.warnings.append(f"{f}: {w}")
            for d in loc.duplicates:
                sc.warnings.append(f"{f}: clave repetida '{d}' (gana la primera)")
            if loc.language in sc.localizations:
                # Valkyrie fusiona ficheros del mismo idioma (gana la primera aparición)
                base = sc.localizations[loc.language]
                for k, v in loc.entries.items():
                    base.entries.setdefault(k, v)
            else:
                sc.localizations[loc.language] = loc
            sc.loc_files[f] = loc.language
        return sc

    # -------------------------- consultas --------------------------
    @property
    def default_language(self) -> str:
        return self.quest.get("defaultlanguage", "English")

    def ctype(self, name: str) -> Optional[str]:
        return component_type(name)

    def of_type(self, *types: str) -> List[str]:
        return [n for n in self.components if component_type(n) in types]

    def text(self, language: Optional[str], key: str) -> Optional[str]:
        """Busca como Valkyrie: idioma pedido -> idioma por defecto -> cualquiera."""
        order = []
        if language:
            order.append(language)
        order.append(self.default_language)
        order.extend(self.localizations.keys())
        for lang in order:
            loc = self.localizations.get(lang)
            if loc and key in loc.entries and loc.entries[key].strip() != "":
                return loc.entries[key]
        return None

    # -------------------------- modificación --------------------------
    def set(self, name: str, **fields: str) -> "OrderedDict[str, str]":
        """Crea/actualiza un componente. Un valor None borra la clave."""
        comp = self.components.get(name)
        if comp is None:
            comp = OrderedDict()
            self.components[name] = comp
            t = component_type(name)
            self.source[name] = DEFAULT_FILE.get(t, "other.ini") if t else "other.ini"
        for k, v in fields.items():
            if v is None:
                comp.pop(k, None)
            else:
                comp[k] = str(v)
        return comp

    # claves cuyos valores son listas de nombres de componentes
    REF_KEYS = {"add", "remove", "monster", "itemname", "inspect", "activation", "evadeevent", "horrorevent",
                "hero", "base"}

    def _ref_keys(self, kv: "OrderedDict[str, str]") -> List[str]:
        return [k for k in kv if k in self.REF_KEYS or re.fullmatch(r"event\d+", k)]

    def references(self, name: str) -> List[Tuple[str, str]]:
        """Lista de (componente, clave) que citan a `name` (incluye trigger=Defeated<name>)."""
        out = []
        for comp, kv in self.components.items():
            for k in self._ref_keys(kv):
                if name in kv[k].split():
                    out.append((comp, k))
            if kv.get("trigger") == "Defeated" + name:
                out.append((comp, "trigger"))
        return out

    def rename(self, old: str, new: str) -> None:
        """Renombra un componente y actualiza referencias, textos (`old.text` -> `new.text`), `{c:old}`
        y `trigger=Defeated<old>`. El nuevo nombre debe tener el mismo prefijo de tipo."""
        if old not in self.components:
            raise KeyError(old)
        if new in self.components:
            raise ValueError(f"ya existe {new}")
        sueltos = [k for loc in self.localizations.values() for k in loc.entries if k.startswith(new + ".")]
        if sueltos:
            # Valkyrie's editor breaks half way on them (DictionaryI18n.RenamePrefix); here they would mix in
            raise ValueError(f"ya hay textos de {new}, que no existe (p. ej. {sueltos[0]}): bórralos o usa otro nombre")
        if component_type(old) != component_type(new):
            raise ValueError(f"{new} no tiene el mismo tipo que {old} (prefijo)")
        self.components = OrderedDict((new if k == old else k, v) for k, v in self.components.items())
        self.source[new] = self.source.pop(old, DEFAULT_FILE.get(component_type(new) or "", "other.ini"))
        for comp, kv in self.components.items():
            for k in self._ref_keys(kv):
                parts = kv[k].split()
                if old in parts:
                    kv[k] = " ".join(new if x == old else x for x in parts)
            if kv.get("trigger") == "Defeated" + old:
                kv["trigger"] = "Defeated" + new
        for loc in self.localizations.values():
            entries = OrderedDict()
            for k, v in loc.entries.items():
                if k.startswith(old + "."):
                    k = new + k[len(old):]
                v = v.replace("{c:" + old + "}", "{c:" + new + "}").replace("{qst:" + old + ".", "{qst:" + new + ".")
                entries[k] = v
            loc.entries = entries

    def delete(self, name: str, clean_references: bool = True) -> List[Tuple[str, str]]:
        """Borra un componente y sus textos. Con clean_references=True lo quita también de las listas
        (add, remove, eventN, monster…) que lo citaban, para que Valkyrie no se cierre por un `add=`
        a un componente inexistente. Devuelve la lista de (componente, clave) que lo citaban."""
        refs = self.references(name)
        self.components.pop(name, None)
        self.source.pop(name, None)
        for loc in self.localizations.values():
            for k in [k for k in loc.entries if k.startswith(name + ".")]:
                del loc.entries[k]
        if clean_references:
            for comp, k in refs:
                kv = self.components.get(comp)
                if kv is None:
                    continue
                if k == "trigger":
                    kv[k] = ""
                else:
                    kv[k] = " ".join(x for x in kv[k].split() if x != name)
        return refs

    def set_text(self, language: str, key: str, value: str) -> None:
        loc = self.localizations.get(language)
        if loc is None:
            loc = Localization(language, os.path.join(self.folder, f"Localization.{language}.txt"))
            self.localizations[language] = loc
            fname = f"Localization.{language}.txt"
            self.loc_files[fname] = language
            if fname not in self.quest_text_files:
                if language == self.default_language:
                    self.quest_text_files.insert(0, fname)
                else:
                    self.quest_text_files.append(fname)
        loc.entries[key] = value

    # -------------------------- guardado --------------------------
    def save(self, newline: str = "\r\n") -> None:
        by_file: "OrderedDict[str, OrderedDict]" = OrderedDict()
        for name, kv in self.components.items():
            f = self.source.get(name) or DEFAULT_FILE.get(component_type(name) or "", "other.ini")
            by_file.setdefault(f, OrderedDict())[name] = kv
        # se conservan los ficheros que ya estaban en [QuestData] (aunque queden vacíos) y en su orden:
        # el orden de carga decide el orden de los eventos con el mismo disparador
        data_files = list(OrderedDict.fromkeys([f for f in self.quest_data_files if f != "quest.ini"] +
                                               [f for f in by_file if f != "quest.ini"]))
        # quest.ini
        q = OrderedDict()
        q["Quest"] = self.quest
        q["QuestText"] = OrderedDict((f, "") for f in self.quest_text_files)
        q["QuestData"] = OrderedDict((f, "") for f in data_files)
        for name, kv in by_file.get("quest.ini", {}).items():
            q[name] = kv
        header = newline.join(self.quest_header) if self.quest_header else "; Generado con la skill mansiones-valkyrie"
        write_ini(os.path.join(self.folder, "quest.ini"), q, header=header, newline=newline)
        for f in data_files:
            os.makedirs(os.path.dirname(os.path.join(self.folder, f)) or self.folder, exist_ok=True)
            write_ini(os.path.join(self.folder, f), by_file.get(f, OrderedDict()), newline=newline)
        self.quest_data_files = data_files
        for fname, lang in self.loc_files.items():
            loc = self.localizations[lang]
            # solo escribimos el primer fichero de cada idioma
            if loc.path is None or os.path.basename(loc.path) == fname or not os.path.exists(loc.path):
                loc.write(os.path.join(self.folder, fname), newline=newline)


# ----------------------------------------------------------------------------------------
# Utilidades de expresiones de variables
# ----------------------------------------------------------------------------------------
VAR_OP_TEST = {"==", "!=", ">=", "<=", ">", "<"}
VAR_OP_ASSIGN = {"=", "+", "-", "*", "/", "%"}


def parse_operations(value: str) -> List[Tuple[str, str, str]]:
    ops = []
    for item in value.split():
        parts = [p for p in item.split(",") if p != ""]
        ops.append(tuple(parts) if len(parts) == 3 else tuple(parts))
    return ops


def parse_vartests(value: str) -> List[Tuple[str, str]]:
    """Devuelve [(clase, dato)], p.ej. [('VarOperation','x,==,1'), ('VarTestsLogicalOperator','AND')]."""
    out = []
    for item in value.split():
        if ":" in item:
            cls_, data = item.split(":", 1)
        else:
            cls_, data = item, ""
        out.append((cls_, data))
    return out


def is_number_literal(v: str) -> bool:
    return len(v) > 0 and (v[0].isdigit() or v[0] in "-.")


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Uso: python valkyrie_io.py <carpeta_escenario>")
        sys.exit(1)
    s = Scenario.load(sys.argv[1])
    print(f"Escenario: {s.folder}")
    print(f"  formato={s.quest.get('format')} idioma={s.default_language} packs={s.quest.get('packs', '')}")
    from collections import Counter
    print("  componentes:", dict(Counter(component_type(n) for n in s.components)))
    print("  idiomas:", {k: len(v.entries) for k, v in s.localizations.items()})
    for e in s.errors:
        print("  ERROR:", e)
    for w in s.warnings[:30]:
        print("  aviso:", w)
