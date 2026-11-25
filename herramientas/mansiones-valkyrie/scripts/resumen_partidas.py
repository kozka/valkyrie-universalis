"""Tabla comparativa de las partidas de partida_mesa.ts.

Agrupa los registros por el nombre del fichero: <investigadores><estrategia><semilla>.txt
(3N7.txt = 3 investigadores, plan N, semilla 7) y cuenta, por grupo: finales, losetas al acabar la
primera noche/acto, esperas sin nada que hacer, Horror por noche, locos y eliminados, y cuántas
partidas pasan por los eventos que le digas.

Uso: python resumen_partidas.py <carpeta> [--eventos EventA,EventB@2,...] [--md salida.md]
     EventB@2 = solo si ocurre en la noche 2.
"""
import sys, re, glob, os, collections

def analiza(f, eventos):
    t = open(f, encoding='utf-8').read()
    r = {'finales': (re.search(r'FIN\. Finales: (.*)', t) or [None, ''])[1].strip()}
    noches = re.split(r'\n(?==== Noche )', t)
    tiles = set(); los = collections.defaultdict(int); esp = collections.Counter(); hor = collections.Counter(); vistos = set()
    for bloque in noches:
        m = re.match(r'=== Noche (\d+) · Ronda (-?\d+)(?: \(global \d+\))?(?: · losetas (\d+))?', bloque)
        if not m: continue
        n = int(m.group(1))
        if m.group(3): los[n] = max(los[n], int(m.group(3)))
        else: tiles.update(re.findall(r'Coloca (TILE_\w+)', bloque)); los[n] = max(los[n], len(tiles))
        esp[n] += len(re.findall(r'⏳', bloque))
        for a, b in re.findall(r'💔 .*? sufre (?:(\d+) de Daño)?(?: y )?(?:(\d+) de Horror)?', bloque):
            if b: hor[n] += int(b)
        for e in re.findall(r'\[(Event\w+)\]', bloque): vistos.add(e); vistos.add(f'{e}@{n}')
    r['losetas1'] = los.get(1, 0); r['esperas'] = esp; r['horror'] = hor
    est = (re.search(r'Estado: (.*)', t) or [None, ''])[1]
    r['loco'] = '(loco)' in est; r['elim'] = est.count('ELIMINADO')
    r['ev'] = {e: e in vistos for e in eventos}
    return r

def main():
    a = sys.argv[1:]
    if not a: print(__doc__); sys.exit(2)
    carpeta = a[0]; eventos = []; md = None
    if '--eventos' in a: eventos = a[a.index('--eventos') + 1].split(',')
    if '--md' in a: md = a[a.index('--md') + 1]
    grupos = collections.defaultdict(list)
    for f in sorted(glob.glob(os.path.join(carpeta, '**', '*.txt'), recursive=True)):
        m = re.match(r'(\d)([A-Za-z]+)(\d+)\.txt$', os.path.basename(f))
        if m: grupos[m.group(1) + m.group(2)].append(analiza(f, eventos))
    if not grupos: print('No hay registros con nombre tipo 3N7.txt en', carpeta); sys.exit(1)
    cols = sorted(grupos)
    filas = [('Partidas', lambda g: str(len(g)))]
    finales = sorted({x for g in grupos.values() for r in g for x in r['finales'].split(', ')[:1] if x})
    for fin in finales: filas.append((f'Final {fin}', lambda g, fin=fin: str(sum(r['finales'].split(', ')[0] == fin for r in g))))
    media = lambda xs: f'{sum(xs) / len(xs):.1f}' if xs else '-'
    filas.append(('Losetas al acabar la noche 1', lambda g: media([r['losetas1'] for r in g])))
    nn = sorted({n for g in grupos.values() for r in g for n in r['horror']} | {n for g in grupos.values() for r in g for n in r['esperas']})
    filas.append(('Esperas sin nada que hacer por noche', lambda g: ' / '.join(media([r['esperas'][n] for r in g]) for n in nn)))
    filas.append(('Horror de la mesa por noche', lambda g: ' / '.join(media([r['horror'][n] for r in g]) for n in nn)))
    filas.append(('Alguien loco al final', lambda g: f"{sum(r['loco'] for r in g)}/{len(g)}"))
    filas.append(('Eliminados (total)', lambda g: str(sum(r['elim'] for r in g))))
    for e in eventos: filas.append((e, lambda g, e=e: f"{sum(r['ev'][e] for r in g)}/{len(g)}"))
    lineas = ['| | ' + ' | '.join(cols) + ' |', '|---|' + '---|' * len(cols)]
    for nombre, fn in filas: lineas.append(f'| {nombre} | ' + ' | '.join(fn(grupos[c]) for c in cols) + ' |')
    txt = '\n'.join(lineas); print(txt)
    if md: open(md, 'w', encoding='utf-8').write(txt + '\n')

if __name__ == '__main__':
    main()
