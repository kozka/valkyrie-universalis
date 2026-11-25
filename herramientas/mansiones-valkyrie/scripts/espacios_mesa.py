"""Grafo de espacios de un escenario de Mansiones para partida_mesa.ts.

Une las zonas de cada loseta (assets/contenido_losetas.json) por sus enlaces internos y por las
aberturas que tocan otra loseta, y sitúa cada ficha en su espacio.

Uso: python espacios_mesa.py <carpeta del escenario> grafo.json
Revisa la lista que imprime: si una puerta del mapa no sale como conexión, o una ficha cae en
«Tile:?», corrígelo en el perfil (accesos / fichas) antes de sacar conclusiones de las partidas.
"""
import sys, os, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import mapa as M, losetas as LZ

def main(q, salida):
    sc, tiles = LZ.cargar(q)
    nodes = {}; edges = set()
    for t in tiles:
        cont = LZ.contenido(t.side)
        if not cont: print('AVISO: sin zonas para', t.name, t.side); continue
        for s in cont['spaces']:
            nid = f"{t.name}:{s['id']}"
            ax, ay = t.local_to_world(*s['anchor'])
            nodes[nid] = {'tile': t.name, 'zona': s.get('label_es') or s['label'], 'x': round(ax, 2), 'y': round(ay, 2)}
            for l in s.get('links', []):
                edges.add(tuple(sorted((nid, f"{t.name}:{l['to']}"))))
    def zona(t, x, y):
        cont = LZ.contenido(t.side)
        if not cont: return None
        z = LZ.zona_en(cont, t.world_to_local(x, y), tol=0.6)
        return f"{t.name}:{z['id']}" if z else None
    for t in tiles:
        for side, kind, (mx, my), pa, pb in t.openings():
            nx, ny = M.NORMAL[side]
            for o in [o for o in tiles if o is not t and o.contains(mx + 0.3 * nx, my + 0.3 * ny, 0)]:
                for f in (0.15, 0.5, 0.85):
                    px, py = pa[0] + (pb[0] - pa[0]) * f, pa[1] + (pb[1] - pa[1]) * f
                    a = zona(t, px - 0.35 * nx, py - 0.35 * ny); b = zona(o, px + 0.35 * nx, py + 0.35 * ny)
                    if a and b: edges.add(tuple(sorted((a, b))))
    toks = {}
    for n in sc.of_type('Token', 'Spawn'):
        kv = sc.components[n]
        try: x, y = float(kv.get('xposition', 0)), float(kv.get('yposition', 0))
        except ValueError: continue
        r = LZ.localizar(tiles, x, y)
        if r and r.get('zona'): toks[n] = f"{r['tile'].name}:{r['zona']['id']}"
        elif r: toks[n] = r['tile'].name + ':?'
    json.dump({'nodes': nodes, 'edges': sorted(edges), 'tokens': toks}, open(salida, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(len(nodes), 'espacios,', len(edges), 'conexiones,', len(toks), 'fichas situadas')
    for n, v in nodes.items():
        vec = sorted(b if a == n else a for a, b in edges if n in (a, b))
        print(f"  {n:24} {v['zona']:28} → {', '.join(vec)}")
    sin = [k for k, v in toks.items() if v.endswith(':?')]
    if sin: print('Fichas sin espacio (dales acceso en el perfil):', ', '.join(sin))

if __name__ == '__main__':
    if len(sys.argv) < 3: print(__doc__); sys.exit(2)
    main(sys.argv[1], sys.argv[2])
