"""
The scenario guide of Mansions of Madness (packages/app/src/guide/MoM.json): what the app knows about each scenario of
Valkyrie's store beyond the store itself, for the list's category filter and for Igor. How it is made and kept is in
docs/guia-escenarios.md.

This script refreshes the parts that come from data, and keeps the parts people wrote:
  - "store": the store's manifest and statistics (referencias/valkyrie-store, referencias/descargas), refreshed;
  - "files": counts from the scenario's own package (referencias/descargas/MoM/escenarios), refreshed;
  - "computed": tags given by rules over those numbers (RULES below), refreshed;
  - "judged", "review": written by Claude and reviewed by a person, never touched here. A scenario new to the store
    gets them empty, with review.reviewed false, so that someone reads it and fills them in.

Run it from the repository's root after `node referencias/clonar.mjs` and `node referencias/descargar-escenarios.mjs`:
    py -3 herramientas/guia-escenarios/actualizar.py          (Windows)
    python3 herramientas/guia-escenarios/actualizar.py        (Linux, macOS)
"""
import argparse
import datetime
import json
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REF = ROOT / 'referencias'
GUIDE = ROOT / 'packages/app/src/guide/MoM.json'

# Scenarios built from many generated parts (thousands of folders): their counts add up every variant
GENERATED = {'pruebas_en', 'pruebas_es', 'desert_en', 'desert_es', 'snow_en', 'snow_es'}

# Tags given by rules over the numbers. A short name of each and its rule, as docs/guia-escenarios.md explains them
RULES = {
    'solo': 'admits one investigator (store minhero = 1)',
    'sixPlus': 'admits six or more (store maxhero >= 6)',
    'short': 'under 90 min: real average if 10+ plays, else the author\'s maximum',
    'long': 'over 180 min: real average if 10+ plays, else the author\'s minimum',
    'hard': 'under 50% victories with 20+ plays',
    'combat': '25+ monster spawns in its files (or the author says so: judged "combat")',
    'littleCombat': '3 or fewer monster spawns',
    'puzzles': '5+ puzzles in its files (or the author says so: judged "puzzles")',
    'narrative': '18,000+ words in its main language (not for generated scenarios)',
}


def store_entries():
    text = (REF / 'valkyrie-store/MoM/manifestDownload.ini').read_text(encoding='utf-8')
    parts = re.split(r'^\[([^\]]+)\]\s*$', text, flags=re.M)
    for i in range(1, len(parts), 2):
        data = dict(line.split('=', 1) for line in parts[i + 1].splitlines() if '=' in line)
        if data.get('type', 'MoM') == 'MoM':
            yield parts[i], data


def number(value, kind=float):
    try:
        return kind(float(value))
    except (TypeError, ValueError):
        return None


def clean(text):
    text = text.replace('\\n', ' ')
    text = re.sub(r'<[^>]+>|\{[^}]*\}', '', text)
    return re.sub(r'\s+', ' ', text).strip()


def by_language(data, field, languages=('Spanish', 'English')):
    """The field in the languages the app's guide keeps; the rest come from the store's own list at run time."""
    out = {}
    for lang in languages:
        value = data.get(f'{field}.{lang}')
        if value:
            out[lang] = clean(value)
    if not out:
        first = next((v for k, v in data.items() if k.startswith(field + '.')), '')
        if first:
            out['English'] = clean(first)
    return out


def store_part(data):
    return {
        'names': by_language(data, 'name'),
        'synopsis': by_language(data, 'synopsys'),
        'author': clean(data.get('authors_short.Spanish') or data.get('authors_short.English') or next((v for k, v in data.items() if k.startswith('authors_short.')), '')),
        # Valkyrie's defaults when the scenario does not say (QuestData.Quest: 2 to the game's default 5)
        'players': [number(data.get('minhero'), int) or 2, number(data.get('maxhero'), int) or 5],
        'authorLength': [number(data.get('lengthmin'), int), number(data.get('lengthmax'), int)],
        'realLength': round(number(data.get('duration'))) if number(data.get('duration')) else None,
        'plays': number(data.get('play_count'), int) or 0,
        'rating': round(number(data.get('rating')), 2) if number(data.get('rating')) else None,
        'winRatio': round(number(data.get('win_ratio')), 3) if number(data.get('win_ratio')) is not None else None,
        'difficulty': number(data.get('difficulty')),
        'packs': data.get('packs', '').split(),
        'updated': data.get('latest_update', ''),
        # The cover, as the store's list draws it: the package's address and the picture in it
        'url': data.get('url', ''),
        'image': data.get('image', ''),
    }


def files_part(key, default_language):
    package = REF / f'descargas/MoM/escenarios/{key}.valkyrie'
    if not package.exists():
        return None
    z = zipfile.ZipFile(package)
    names = z.namelist()
    sections = []
    # File by file: a scenario of thousands of folders does not fit in memory at once
    for n in names:
        if n.lower().endswith('.ini'):
            sections += re.findall(r'^\[([^\]]+)\]', z.read(n).decode('utf-8', 'replace'), re.M)
    texts = {}
    for n in names:
        m = re.search(r'Localization\.(\w+?)(?:_\w+)?\.txt$', n, re.I)
        if m and len(texts.get(m.group(1), '')) < 3_000_000:
            texts[m.group(1)] = texts.get(m.group(1), '') + z.read(n).decode('utf-8', 'replace')
    main = texts.get(default_language) or texts.get('English') or next(iter(texts.values()), '')
    return {
        'languages': sorted(texts),
        'quests': sum(1 for n in names if n.lower().endswith('quest.ini')),
        'events': sum(1 for s in sections if s.startswith('Event')),
        'tiles': sum(1 for s in sections if s.startswith('Tile')),
        'spawns': sum(1 for s in sections if s.startswith('Spawn')),
        'puzzles': sum(1 for s in sections if s.startswith('Puzzle')),
        'words': len(main.split()),
    }


def computed_tags(key, store, files, judged):
    tags = []
    minh, maxh = store['players']
    lmin, lmax = store['authorLength']
    real = store['realLength'] if store['plays'] >= 10 else None
    said = set(judged.get('tags', []))
    spawns = files['spawns'] if files else 0
    if minh == 1:
        tags.append('solo')
    if maxh >= 6:
        tags.append('sixPlus')
    if (real if real is not None else (lmax or 999)) < 90:
        tags.append('short')
    if (real if real is not None else (lmin or 0)) > 180:
        tags.append('long')
    if store['plays'] >= 20 and store['winRatio'] is not None and store['winRatio'] < 0.5:
        tags.append('hard')
    if spawns >= 25 or 'combat' in said:
        tags.append('combat')
    elif files and spawns <= 3:
        tags.append('littleCombat')
    if (files and files['puzzles'] >= 5) or 'puzzles' in said:
        tags.append('puzzles')
    if files and files['words'] >= 18000 and key.lower() not in GENERATED:
        tags.append('narrative')
    return tags


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--initial', help='JSON of judged parts to start from (used once, 23 October 2026)')
    args = parser.parse_args()
    guide = json.loads(GUIDE.read_text(encoding='utf-8')) if GUIDE.exists() else {'scenarios': {}}
    old = guide.get('scenarios', {})
    initial = json.loads(Path(args.initial).read_text(encoding='utf-8')) if args.initial else {}
    scenarios = {}
    added = []
    for key, data in store_entries():
        before = old.get(key) or {}
        judged = before.get('judged') or initial.get(key, {}).get('judged') or {'setting': None, 'tags': [], 'idealPlayers': None, 'notes': ''}
        review = before.get('review') or initial.get(key, {}).get('review') or {'reviewed': False, 'comments': ''}
        if key not in old and key not in initial:
            added.append(key)
        store = store_part(data)
        files = files_part(key, data.get('defaultlanguage', 'English'))
        scenarios[key] = {
            'store': store,
            'files': files,
            'computed': computed_tags(key, store, files, judged),
            'judged': judged,
            'review': review,
        }
    out = {
        '_about': 'Scenario guide of Mansions of Madness for Valkyrie Universalis. How it is made and kept: docs/guia-escenarios.md. '
                  '"store", "files" and "computed" are refreshed by herramientas/guia-escenarios/actualizar.py; "judged" and "review" are written by hand.',
        'game': 'MoM',
        'updated': datetime.date.today().isoformat(),
        'rules': RULES,
        'scenarios': dict(sorted(scenarios.items(), key=lambda kv: kv[0].lower())),
    }
    GUIDE.parent.mkdir(parents=True, exist_ok=True)
    GUIDE.write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    gone = sorted(set(old) - set(scenarios))
    print(f'{len(scenarios)} scenarios written to {GUIDE.relative_to(ROOT)}')
    if added:
        print('New, to read and tag (judged empty, review.reviewed false):', ', '.join(added))
    if gone:
        print('No longer in the store (left out):', ', '.join(gone))


if __name__ == '__main__':
    main()
