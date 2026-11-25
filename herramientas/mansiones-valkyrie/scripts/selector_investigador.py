"""Convierte un evento de Valkyrie (Mansiones) que pedía "pulsad su retrato" en una elección con un botón por
investigador presente. En Mansiones los retratos desaparecen al empezar la partida, así que minhero/maxhero bloquea.

Uso:
  python scripts/selector_investigador.py <carpeta> <Evento> "<pregunta>" [--apodo "el Ancla"] [--texto-sigue "<texto>"]

- <Evento> pasa a enseñar su texto + la pregunta y un botón por investigador (solo salen los que juegan: #HeroX==1),
  más "Otro investigador". Lo que hacía antes (botones, tirada, operaciones) pasa a <Evento>Sigue.
- Guarda quién fue en la variable quienN (N = número del punto) con el número del investigador (0 = otro).
- Con --apodo, cambia {c:<Evento>} en todos los textos por el apodo (el/la/sin artículo, con "al", "del" y mayúscula
  al empezar frase). Así "el Ancla" sirve en Mitos y en noches siguientes y la mesa sabe quién es.
- Se puede usar en varios eventos: el módulo compartido (EventSel<Hero>, EventSelSigue) se crea una sola vez.
"""
import argparse, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from valkyrie_io import Scenario

HEROES = [('RitaYoung','Rita Young'),('MinhThiPhan','Minh Thi Phan'),('FatherMateo','Padre Mateo'),('PrestonFairmont','Preston Fairmont'),
 ('AgathaCrane','Agatha Crane'),('CarsonSinclair','Carson Sinclair'),('WendyAdams','Wendy Adams'),('WilliamYorick','William Yorick'),
 ('MichaelMcGlen','Michael McGlen'),('AshcanPete','«Ashcan» Pete'),('GloriaGoldberg','Gloria Goldberg'),('HarveyWalters','Harvey Walters'),
 ('JennyBarnes','Jenny Barnes'),('JoeDiamond','Joe Diamond'),('KateWinthrop','Kate Winthrop'),('SisterMary','Hermana Mary'),
 ('AmandaSharpe','Amanda Sharpe'),('BobJenkins','Bob Jenkins'),('MandyThompson','Mandy Thompson'),('MontereyJack','Monterey Jack'),
 ('CarolynFern','Carolyn Fern'),('DarrellSimmons','Darrell Simmons'),('DexterDrake','Dexter Drake'),('VincentLee','Vincent Lee'),
 ('LeoAnderson','Leo Anderson'),('UrsulaDowns','Ursula Downs'),('DanielaReyes','Daniela Reyes'),('NormanWithers','Norman Withers'),
 ('CharlieKane','Charlie Kane'),('LilyChen','Lily Chen'),('TrishScarborough','Trish Scarborough'),('JimCulver','Jim Culver'),
 ('SilasMarsh','Silas Marsh'),('AgnesBaker','Agnes Baker'),('FinnEdwards','Finn Edwards'),('TommyMuldoon','Tommy Muldoon'),
 ('MarieLambeau','Marie Lambeau'),('DianaStanley','Diana Stanley'),('WilsonRichards','Wilson Richards'),('AkachiOnyele','Akachi Onyele')]

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('carpeta'); ap.add_argument('evento'); ap.add_argument('pregunta')
    ap.add_argument('--apodo'); ap.add_argument('--texto-sigue'); ap.add_argument('--idioma', default='Spanish')
    a = ap.parse_args()
    sc = Scenario.load(a.carpeta); E = sc.localizations[a.idioma].entries; txt = lambda k, v: sc.set_text(a.idioma, k, v)
    ev, sig = a.evento, a.evento + 'Sigue'
    if 'EventSelSigue' not in sc.components:
        for k, (h, _) in enumerate(HEROES, 1):
            sc.set(f'EventSel{h}', display='false', buttons='1', event1='EventSelSigue', operations=f'sel,=,{k}'); sc.source[f'EventSel{h}'] = 'events.ini'
        sc.set('EventSelNinguno', display='false', buttons='1', event1='EventSelSigue', operations='sel,=,0'); sc.source['EventSelNinguno'] = 'events.ini'
        sc.set('EventSelSigue', display='false', buttons='1', event1=''); sc.source['EventSelSigue'] = 'events.ini'
    lst = sc.components['EventSelSigue'].get('event1', '').split()
    n = len(lst) + 1
    c = sc.components[ev]
    keep = {k: c[k] for k in ('vartests', 'audio', 'remove', 'music', 'add') if k in c}
    moved = {k: v for k, v in c.items() if k in ('buttons', 'quota', 'operations') or re.fullmatch(r'event\d+(Condition(Action)?)?|buttoncolor\d+', k)}
    moved['operations'] = (f'quien{n},=,sel ' + moved.get('operations', '')).strip()
    if a.texto_sigue is None and 'quota' not in moved: moved['display'] = 'false'
    sc.set(sig, **moved); sc.source[sig] = sc.source[ev]
    for i in range(1, int(c.get('buttons', '1')) + 1):
        if f'{ev}.button{i}' in E: txt(f'{sig}.button{i}', E[f'{ev}.button{i}'])
    if a.texto_sigue is not None: txt(sig + '.text', a.texto_sigue.replace('\\n', '\n'))
    q = {'buttons': str(len(HEROES) + 1), 'operations': f'selPunto,=,{n}', **keep}
    for k, (h, name) in enumerate(HEROES, 1):
        q[f'event{k}'] = f'EventSel{h}'; q[f'event{k}Condition'] = f'VarOperation:#Hero{h},==,1'; q[f'event{k}ConditionAction'] = 'hide'
        txt(f'{ev}.button{k}', name)
    q[f'event{len(HEROES)+1}'] = 'EventSelNinguno'; txt(f'{ev}.button{len(HEROES)+1}', 'Otro investigador')
    c.clear(); c.update(q)
    txt(ev + '.text', a.pregunta.replace('\\n', '\n'))
    sc.components['EventSelSigue']['event1'] = ' '.join(lst + [f'EventSelSigue{n}'])
    sc.set(f'EventSelSigue{n}', display='false', buttons='1', event1=sig, vartests=f'VarOperation:selPunto,==,{n}'); sc.source[f'EventSelSigue{n}'] = 'events.ini'
    if a.apodo:
        m = re.match(r'(el|la) (.+)', a.apodo); art, nick = (m.group(1), m.group(2)) if m else (None, a.apodo)
        tag = re.escape('{c:' + ev + '}')
        af = {'el': 'al ' + nick, 'la': 'a la ' + nick, None: 'a ' + nick}[art]; df = {'el': 'del ' + nick, 'la': 'de la ' + nick, None: 'de ' + nick}[art]
        low = a.apodo; cap = low[0].upper() + low[1:]; up = lambda s: s[0].upper() + s[1:]
        for k in [k for k in E if '{c:' + ev + '}' in E[k]]:
            t = re.sub(r'\b([Aa]) ' + tag, lambda m: up(af) if m.group(1) == 'A' else af, E[k])
            t = re.sub(r'\b([Dd]e) ' + tag, lambda m: up(df) if m.group(1) == 'De' else df, t)
            t = re.sub(r'(^|\n|[.!?…»:]\s+|<i>|</b>\s+|<b>)' + tag, lambda m: m.group(1) + cap, t)
            txt(k, re.sub(tag, low, t))
    sc.save(); print(f'{ev}: punto {n}, variable quien{n}. Sin apodo, revisa los {{c:{ev}}} que queden.')

if __name__ == '__main__':
    main()
