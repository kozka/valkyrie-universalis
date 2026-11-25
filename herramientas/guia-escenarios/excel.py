"""
The scenario guide (packages/app/src/guide/MoM.json) as a workbook for a person who knows the scenarios to review, and
back: what they change goes into the guide's "judged" and "review" parts. See docs/guia-escenarios.md.

    py -3 herramientas/guia-escenarios/excel.py exportar [archivo.xlsx]   (default: referencias/_etiquetas/Guia escenarios Mansiones.xlsx)
    py -3 herramientas/guia-escenarios/excel.py importar archivo.xlsx

Needs openpyxl (py -3 -m pip install openpyxl).
"""
import json
import sys
from pathlib import Path

from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = Path(__file__).resolve().parents[2]
GUIDE = ROOT / 'packages/app/src/guide/MoM.json'
DEFAULT = ROOT / 'referencias/_etiquetas/Guia escenarios Mansiones.xlsx'

PACKS = {
    'MoMBase': 'Juego base', 'BtT': 'Más allá del umbral', 'SoA': 'Calles de Arkham', 'SoT': 'El santuario del Crepúsculo',
    'HJ': 'Viajes escalofriantes', 'PotS': 'La senda de la serpiente', 'RN': 'Pesadillas recurrentes', 'SM': 'Recuerdos reprimidos',
    'MoM1ET': '1ª ed.: tableros', 'MoM1EM': '1ª ed.: monstruos', 'MoM1EI': '1ª ed.: investigadores', 'MoM1CK': 'Kit de conversión',
    'CotWT': 'Llamada de lo Salvaje: tableros', 'CotWM': 'Llamada de lo Salvaje: monstruos', 'CotWI': 'Llamada de lo Salvaje: investigadores',
    'FAT': 'Alquimia prohibida: tableros', 'FAM': 'Alquimia prohibida: monstruos', 'FAI': 'Alquimia prohibida: investigadores',
    'TLE': 'TLE (pack de la comunidad)',
}
SETTINGS = {'mansion': 'Mansión', 'city': 'Ciudad', 'town': 'Pueblo', 'building': 'Edificio', 'coast': 'Costa / puerto', 'ship': 'Barco',
            'forest': 'Bosque', 'jungle': 'Selva', 'train': 'Tren', 'otherWorld': 'Otro mundo', 'various': 'Varios', None: '?'}
# Tags by rules (blue) and by judgement (yellow), as the guide names them and as the workbook shows them
COMPUTED = [('solo', 'Admite solitario'), ('sixPlus', '6 o más jugadores'), ('short', 'Duración reducida'), ('long', 'Largo'),
            ('hard', 'Difícil'), ('combat', 'Combate'), ('littleCombat', 'Poco combate'), ('puzzles', 'Puzles'), ('narrative', 'Narrativo')]
JUDGED = [('beginners', 'Para principiantes'), ('deduction', 'Deducción'), ('replayable', 'Rejugable'), ('timer', 'Contrarreloj'),
          ('campaign', 'Campaña o serie'), ('chooseDifficulty', 'Dificultad a elegir'), ('multipleEndings', 'Varios finales'),
          ('hiddenRoles', 'Roles ocultos'), ('competitive', 'Competitivo'), ('escapeRoom', 'Escape room'), ('humour', 'Humor'),
          ('fixedInvestigator', 'Con un investigador concreto'), ('adult', 'Contenido adulto')]
LANG = {'English': 'EN', 'Spanish': 'ES', 'French': 'FR', 'German': 'DE', 'Italian': 'IT', 'Portuguese': 'PT', 'Polish': 'PL',
        'Russian': 'RU', 'Chinese': 'ZH', 'Czech': 'CS', 'Korean': 'KO', 'Japanese': 'JA', 'Ukrainian': 'UK'}
DATA = ['Escenario', 'ID en la tienda', 'Autor', 'Mín. jugadores', 'Máx. jugadores', 'Ideal para (según el autor)',
        'Duración del autor: mín. (min)', 'Duración del autor: máx. (min)', 'Duración real media (min)', 'Partidas registradas',
        'Valoración media (/10)', '% de victorias', 'Dificultad del autor (0–1)', 'Expansiones necesarias', 'Idiomas', 'Ambiente']
REVIEW = ['Notas para el revisor (no van a la app)', 'Revisado', 'Comentarios del revisor']
TECH = ['Puzles (nº)', 'Apariciones de monstruos (nº)', 'Palabras del texto', 'Losetas colocadas (nº)']
FONT = 'Arial'


def final_tags(s):
    """The tags the app uses: by rules, plus the judged ones, less the ones a reviewer took away (judged.remove)."""
    judged = s['judged']
    return (set(s['computed']) | set(judged.get('tags', []))) - set(judged.get('remove', []))


def exportar(out):
    guide = json.loads(GUIDE.read_text(encoding='utf-8'))
    items = sorted(guide['scenarios'].items(), key=lambda kv: -kv[1]['store']['plays'])
    wb = Workbook()
    ws = wb.active
    ws.title = 'Escenarios'
    fills = {'data': 'E7E6E6', 'auto': 'DDEBF7', 'judged': 'FFF2CC', 'review': 'E2EFDA', 'tech': 'EDEDED'}
    headers = [(h, 'data') for h in DATA[:-1]] + [(DATA[-1], 'judged')] + [(n, 'auto') for _, n in COMPUTED] + \
              [(n, 'judged') for _, n in JUDGED] + [(h, 'review') for h in REVIEW] + [(h, 'tech') for h in TECH]
    widths = {'Escenario': 34, 'ID en la tienda': 22, 'Autor': 18, 'Expansiones necesarias': 26, 'Idiomas': 22, 'Ambiente': 13,
              REVIEW[0]: 46, 'Comentarios del revisor': 40, 'Revisado': 9}
    groups = [('Datos de la tienda y del escenario', 'data', len(DATA) - 1), ('Ambiente', 'judged', 1),
              ('Etiquetas calculadas a partir de los datos', 'auto', len(COMPUTED)), ('Etiquetas de criterio', 'judged', len(JUDGED)),
              ('Revisión', 'review', len(REVIEW)), ('Datos técnicos (referencia)', 'tech', len(TECH))]
    thin = Side(style='thin', color='BFBFBF')
    col = 1
    for label, g, span in groups:
        ws.cell(1, col, label).font = Font(name=FONT, bold=True, size=10)
        ws.cell(1, col).alignment = Alignment(horizontal='center')
        for c in range(col, col + span):
            ws.cell(1, c).fill = PatternFill('solid', fgColor=fills[g])
        if span > 1:
            ws.merge_cells(start_row=1, start_column=col, end_row=1, end_column=col + span - 1)
        col += span
    tag_names = {n for _, n in COMPUTED + JUDGED}
    for c, (h, g) in enumerate(headers, 1):
        cell = ws.cell(2, c, h)
        cell.font = Font(name=FONT, bold=True, size=9)
        cell.fill = PatternFill('solid', fgColor=fills[g])
        cell.border = Border(bottom=thin, right=thin)
        rotate = h in tag_names
        cell.alignment = Alignment(horizontal='center', vertical='bottom' if rotate else 'center', wrap_text=True, text_rotation=90 if rotate else 0)
        ws.column_dimensions[get_column_letter(c)].width = widths.get(h, 5 if rotate else 8)
    ws.row_dimensions[2].height = 150
    for r, (key, s) in enumerate(items, 3):
        st, files, judged, review = s['store'], s['files'] or {}, s['judged'], s['review']
        tags = final_tags(s)
        name = st['names'].get('Spanish') or st['names'].get('English') or key
        langs = ' '.join(LANG.get(l, l[:2].upper()) for l in sorted(files.get('languages', []), key=lambda l: list(LANG).index(l) if l in LANG else 99))
        values = [name, key, st['author'], st['players'][0], st['players'][1], judged.get('idealPlayers'), st['authorLength'][0], st['authorLength'][1],
                  st['realLength'], st['plays'], st['rating'], st['winRatio'], st['difficulty'],
                  ', '.join(PACKS.get(p, p) for p in st['packs']) or '—', langs, SETTINGS.get(judged.get('setting'), '?')]
        values += ['✓' if t in tags else None for t, _ in COMPUTED + JUDGED]
        values += [judged.get('notes') or None, 'Sí' if review.get('reviewed') else 'No', review.get('comments') or None]
        values += [files.get('puzzles'), files.get('spawns'), files.get('words'), files.get('tiles')]
        for c, v in enumerate(values, 1):
            h = headers[c - 1][0]
            cell = ws.cell(r, c, v)
            cell.border = Border(bottom=thin, right=thin)
            cell.font = Font(name=FONT, size=9, bold=c == 1)
            if h in tag_names:
                cell.alignment = Alignment(horizontal='center', vertical='top')
            else:
                cell.alignment = Alignment(wrap_text=h in ('Escenario', 'Expansiones necesarias', 'Idiomas', REVIEW[0], 'Comentarios del revisor'), vertical='top')
            if h == '% de victorias':
                cell.number_format = '0%'
            elif h in ('Dificultad del autor (0–1)', 'Valoración media (/10)'):
                cell.number_format = '0.0'
    last = 2 + len(items)
    names = [h for h, _ in headers]
    dv = DataValidation(type='list', formula1='"✓"', allow_blank=True, showErrorMessage=False)
    ws.add_data_validation(dv)
    for _, n in COMPUTED + JUDGED:
        L = get_column_letter(names.index(n) + 1)
        dv.add(f'{L}3:{L}{last}')
    L = get_column_letter(names.index('Ambiente') + 1)
    dva = DataValidation(type='list', formula1='"' + ','.join(SETTINGS.values()) + '"', allow_blank=True, showErrorMessage=False)
    ws.add_data_validation(dva)
    dva.add(f'{L}3:{L}{last}')
    L = get_column_letter(names.index('Revisado') + 1)
    dvr = DataValidation(type='list', formula1='"Sí,No"', allow_blank=True)
    ws.add_data_validation(dvr)
    dvr.add(f'{L}3:{L}{last}')
    ws.freeze_panes = 'B3'
    ws.auto_filter.ref = f'A2:{get_column_letter(len(headers))}{last}'
    wh = wb.create_sheet('Cómo revisar', 0)
    for line in [
        'Guía de escenarios de Mansiones de la Locura: revisión',
        'Hoja «Escenarios»: una fila por escenario, de más a menos jugado. Para quitar una etiqueta borra el ✓; para ponerla, elige ✓ en la celda.',
        'Azul: etiquetas calculadas con reglas (docs/guia-escenarios.md). Si una no es cierta, quítala igualmente: se guarda como corrección.',
        'Amarillo: etiquetas de criterio y ambiente. Verde: revisión. Pon «Sí» en «Revisado» al terminar un escenario.',
        'Sin spoilers: las etiquetas dicen qué tipo de partida es, nunca qué pasa. Una traición sorpresa no se marca como «Roles ocultos».',
        'Las notas son para el revisor y no aparecen en la app.',
    ]:
        wh.append([line])
        wh.cell(wh.max_row, 1).font = Font(name=FONT, size=12 if wh.max_row == 1 else 10, bold=wh.max_row == 1)
    wh.column_dimensions['A'].width = 130
    wb.active = 0
    out.parent.mkdir(parents=True, exist_ok=True)
    wb.save(out)
    print(f'{len(items)} escenarios en {out}')


def importar(path):
    guide = json.loads(GUIDE.read_text(encoding='utf-8'))
    ws = load_workbook(path)['Escenarios']
    headers = [c.value for c in ws[2]]
    col = {h: i for i, h in enumerate(headers)}
    settings = {v: k for k, v in SETTINGS.items()}
    changed = 0
    for row in ws.iter_rows(min_row=3, values_only=True):
        key = row[col['ID en la tienda']]
        s = guide['scenarios'].get(key)
        if s is None:
            continue
        marked = {t for t, n in COMPUTED + JUDGED if (row[col[n]] or '').strip() == '✓'}
        judged = s['judged']
        before = json.dumps([judged, s['review']], sort_keys=True)
        # Judged tags as marked; a tag by rules the reviewer took away is kept as a correction (remove), one they added
        # is kept among the judged ones, so that the next refresh of the rules does not undo either
        computed = set(s['computed'])
        said = {t for t in judged.get('tags', []) if t in dict(COMPUTED) and t in marked}
        judged['tags'] = sorted({t for t, _ in JUDGED if t in marked} | {t for t, _ in COMPUTED if t in marked and t not in computed} | said)
        judged['remove'] = sorted({t for t, _ in COMPUTED if t in computed and t not in marked})
        if not judged['remove']:
            judged.pop('remove')
        judged['setting'] = settings.get(row[col['Ambiente']], judged.get('setting'))
        judged['idealPlayers'] = row[col['Ideal para (según el autor)']] or None
        judged['notes'] = row[col[REVIEW[0]]] or ''
        s['review'] = {'reviewed': row[col['Revisado']] == 'Sí', 'comments': row[col['Comentarios del revisor']] or ''}
        changed += before != json.dumps([judged, s['review']], sort_keys=True)
    GUIDE.write_text(json.dumps(guide, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'{changed} escenarios cambiados en {GUIDE.relative_to(ROOT)}')


if __name__ == '__main__':
    if len(sys.argv) >= 2 and sys.argv[1] == 'exportar':
        exportar(Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT)
    elif len(sys.argv) == 3 and sys.argv[1] == 'importar':
        importar(Path(sys.argv[2]))
    else:
        print(__doc__)
