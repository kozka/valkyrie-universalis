// Partida de mesa simulada: la app la pone el motor de Valkyrie Universalis y la mesa la pone este
// fichero, con las reglas de Mansiones: posiciones en el mapa, 2 acciones por investigador, mover 2
// espacios, tiradas con los dados de verdad (3 éxitos, 2 lupas y 3 blancos de 8), Pistas para cambiar
// lupas, Daño y Horror con anulación, Herido/Loco/Eliminado, monstruos que se mueven y atacan,
// investigadores que atacan y evaden, y la fase de Horror.
//
// Lo que es de cada escenario (qué hace cada investigador, a qué hora tiene que estar dónde, qué
// botones prefiere la mesa, cómo se resuelven sus diálogos raros) va en un PERFIL aparte
// (ver perfil_ejemplo.ts y references/partida-de-mesa.md).
//
// Uso (Node 22.18+):
//   python ../espacios_mesa.py <escenario> grafo.json          # una vez, o cuando cambie el mapa
//   KIT=<valkyrie-universalis> QDIR=<escenario> GRAFO=grafo.json PERFIL=mi_perfil.ts \
//     NH=3 STRAT=N SEED=1 OUT=partidas/3N1.txt node partida_mesa.ts
//   python ../resumen_partidas.py partidas --eventos EventX,EventY      # tabla comparativa
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { start, ENGINE } from './jugar_comun.ts';
const { MonsterDialogMoM } = ENGINE;

// ---------- tipos ----------
export type Inv = { id: string; n: string; key: string; st: Record<string, number>; vida: number; cordura: number; pos: string; dano: number; horror: number; pistas: number; acc: number; herido: boolean; loco: boolean; fuera: boolean };
export type Perfil = {
  inicio?: string;                                   // espacio donde empiezan (y vuelven si hay reinicio de noche)
  nocheVar?: string; horaVar?: string;               // variables del escenario para noche/acto y hora/ronda
  investigadores?: Inv[];                            // por defecto, Rita, Agatha, Mateo y Carson
  heroesOrden?: string[];                            // orden de los botones del selector (apodos: quienN = índice+1)
  apodos?: [RegExp, number][];                       // «el Ancla» → variable quien1
  vidaMonstruos?: Record<string, [number, number, number]>; // nombre: [vida base, vida por investigador, Horror]
  accesos?: Record<string, string[]>;                // ficha → espacios desde los que se usa (si no, la del grafo)
  fichas?: Record<string, string>;                   // ficha → espacio (para fichas que no estén en el grafo)
  plan(i: Inv, c: Ctx): string[];                    // fichas que quiere usar, en orden de prioridad
  cita?(i: Inv, c: Ctx): string | null;              // espacio donde tiene que estar ahora (o null)
  preferir?(c: Ctx): RegExp[];                       // botones que la mesa pulsa si los ve
  evitar?(c: Ctx): RegExp;                           // botones que la mesa no pulsa (además de Despedirse, Volver…)
  quienSufre?(raw: string, c: Ctx): Inv[] | null;    // «Cada investigador en el sótano…»
  elegirInvestigador?(evento: string, c: Ctx): Inv | undefined;
  respuestas?: [RegExp, (c: Ctx) => boolean, RegExp, RegExp][]; // botón que delata la pregunta, condición, botón sí, botón no
  alEvento?(nombre: string, raw: string, c: Ctx): void;
  dialogo?(d: any, nombre: string, raw: string, c: Ctx): boolean; // resuelve entero un diálogo especial
  turnoEspecial?(i: Inv, c: Ctx): boolean;           // true = este investigador no juega normal esta ronda
  accionEspecial?(i: Inv, c: Ctx): boolean;          // true = ha gastado una acción en algo propio
  puedeAtacar?(monstruo: string, i: Inv, c: Ctx): boolean;
  fichaDisponible?(t: string, c: Ctx): boolean;
  pesoDistancia?: number;                            // 99 = siempre lo más cercano; 1-3 = respeta el orden del plan
  noMarcar?: RegExp;                                 // fichas que se pueden repetir (puertas que se fuerzan…)
  accionesExtra?(i: Inv, c: Ctx): number;
  alEmpezarNoche?(c: Ctx): void;
  rompecabezas?(w: any, i: Inv, c: Ctx): number[][]; // intentos para un PuzzleCode
  tirada?(evento: string, quien: Inv, habilidad: string, c: Ctx): number | null; // reglas del texto que cambian una tirada («si es el Ancla, suma 1»)
};
export type Ctx = ReturnType<typeof makeCtx>;

// ---------- parámetros ----------
const QDIR = process.env.QDIR!;
const SEED = Number(process.env.SEED ?? 7);
const STRAT = process.env.STRAT ?? 'N';
const PERFIL: Perfil = (await import(pathToFileURL(resolve(process.env.PERFIL!)).href)).default;
let rs = (SEED * 2654435761) >>> 0 || 1;
const rnd = (n: number) => { rs ^= rs << 13; rs >>>= 0; rs ^= rs >>> 17; rs ^= rs << 5; rs >>>= 0; return rs % n; }; // xorshift: un LCG con %8 da caras en bucle

// ---------- datos ----------
const L: Record<string, string> = {};
for (const line of readFileSync(QDIR + '/Localization.Spanish.txt', 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
  const i = line.indexOf(','); if (i < 0) continue; let v = line.slice(i + 1); if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1); L[line.slice(0, i)] = v;
}
const G = JSON.parse(readFileSync(process.env.GRAFO ?? 'grafo.json', 'utf8'));
Object.assign(G.tokens, PERFIL.fichas ?? {});
const adj: Record<string, string[]> = {}; for (const [a, b] of G.edges) { (adj[a] ??= []).push(b); (adj[b] ??= []).push(a); }
const zn = (n: string) => n ? `${G.nodes[n]?.zona ?? n} (${n.split(':')[0].replace('Tile', '')})` : '?';
const tileOf = (n: string) => n.split(':')[0];
const HEROES = PERFIL.heroesOrden ?? ['RitaYoung','MinhThiPhan','FatherMateo','PrestonFairmont','AgathaCrane','CarsonSinclair','WendyAdams','WilliamYorick','MichaelMcGlen','AshcanPete','GloriaGoldberg','HarveyWalters','JennyBarnes','JoeDiamond','KateWinthrop','SisterMary','AmandaSharpe','BobJenkins','MandyThompson','MontereyJack','CarolynFern','DarrellSimmons','DexterDrake','VincentLee','LeoAnderson','UrsulaDowns','DanielaReyes','NormanWithers','CharlieKane','LilyChen','TrishScarborough','JimCulver','SilasMarsh','AgnesBaker','FinnEdwards','TommyMuldoon','MarieLambeau','DianaStanley','WilsonRichards','AkachiOnyele'];
const INICIO = PERFIL.inicio ?? 'TileInicio:s1';
const mk = (id: string, n: string, key: string, st: number[], vida: number, cordura: number): Inv => ({ id, n, key, st: { strength: st[0], agility: st[1], observation: st[2], lore: st[3], influence: st[4], will: st[5] }, vida, cordura, pos: INICIO, dano: 0, horror: 0, pistas: 0, acc: 0, herido: false, loco: false, fuera: false });
const BASE: Inv[] = PERFIL.investigadores ?? [
  mk('HeroRitaYoung', 'Rita', 'INVESTIGATOR_RITA_YOUNG', [4, 4, 3, 2, 2, 3], 8, 6),
  mk('HeroAgathaCrane', 'Agatha', 'INVESTIGATOR_AGATHA_CRANE', [2, 3, 3, 5, 3, 4], 6, 8),
  mk('HeroFatherMateo', 'Mateo', 'INVESTIGATOR_FATHER_MATEO', [2, 2, 3, 4, 3, 5], 7, 7),
  mk('HeroCarsonSinclair', 'Carson', 'INVESTIGATOR_CARSON_SINCLAIR', [3, 3, 3, 2, 4, 3], 7, 6),
];
const INV: Inv[] = BASE.slice(0, Number(process.env.NH ?? 2));
const SK: Record<string, string> = { strength: 'Fuerza', agility: 'Agilidad', observation: 'Observación', lore: 'Saber', influence: 'Influencia', will: 'Voluntad' };
const out: string[] = []; const P = (s: string) => { out.push(s); };
const { ui, game } = start(INV.map((i) => i.id), SEED);
const q = () => game.currentQuest!;
const V = (v: string) => game.currentQuest?.vars.getValue(v) ?? 0;
const onBoard = (n: string) => q().boardItems.has(n);
const nombresTablero = (): string[] => { const b: any = q().boardItems; return [...(typeof b.keys === 'function' ? b.keys() : b)].map(String); };
const noche = () => (PERFIL.nocheVar ? V(PERFIL.nocheVar) : V('noche')) || 1;
const hora = () => PERFIL.horaVar ? V(PERFIL.horaVar) : V('#round');

// ---------- dados ----------
function roll(who: Inv, skill: string, mod = 0, gastar = true) {
  const n = Math.max(1, (who.st[skill] ?? 2) + mod); let ex = 0, lupas = 0; const caras: string[] = [];
  for (let i = 0; i < n; i++) { const f = rnd(8); if (f < 3) { ex++; caras.push('★'); } else if (f < 5) { lupas++; caras.push('?'); } else caras.push('·'); }
  let gasto = 0; if (gastar) { gasto = Math.min(lupas, who.pistas); who.pistas -= gasto; ex += gasto; }
  P(`      🎲 ${who.n} tira ${SK[skill] ?? skill} (${n} dados): ${caras.join(' ')}${gasto ? ` + gasta ${gasto} Pista` : ''} → ${ex} éxito${ex === 1 ? '' : 's'}`);
  return ex;
}
// ---------- mapa ----------
const revealed = (n: string) => onBoard(tileOf(n));
function bfs(from: string) {
  const d: Record<string, number> = { [from]: 0 }, par: Record<string, string> = {}; const Q = [from];
  while (Q.length) { const a = Q.shift()!; for (const b of adj[a] ?? []) if (!(b in d) && revealed(b)) { d[b] = d[a] + 1; par[b] = a; Q.push(b); } }
  return { d, par };
}
function path(from: string, to: string) { const { par, d } = bfs(from); if (!(to in d)) return null; const p = [to]; while (p[0] !== from) p.unshift(par[p[0]]); return p; }
function access(tok: string): string[] {
  if (PERFIL.accesos?.[tok]) return PERFIL.accesos[tok];
  const p = G.tokens[tok]; if (!p) return [];
  if (revealed(p) && !p.endsWith('?')) return [p];
  return (adj[p] ?? []).filter(revealed); // fichas de explorar: desde el espacio vecino ya revelado
}
// ---------- monstruos ----------
const mpos = new Map<any, string>(), mhp = new Map<any, number>();
let pendingSpawn: string | null = null; const lastPos = new Map<string, string>();
const mname = (m: any) => m.monsterData?.sectionName ?? '?';
const mshort = (m: any) => mname(m).replace(/^CustomMonster|^Monster/, '');
const HP = PERFIL.vidaMonstruos ?? {};
function syncMonsters() {
  if (!game.currentQuest) return;
  for (const m of q().monsters as any[]) if (!mpos.has(m)) {
    const name = mname(m); const p = pendingSpawn ?? lastPos.get(name) ?? INICIO;
    mpos.set(m, p); const h = HP[name] ?? [3, 1, 2]; mhp.set(m, h[0] + h[1] * INV.length);
    P(`   👹 Aparece ${mshort(m)} en ${zn(p)} (vida ${mhp.get(m)})`);
  }
  for (const m of [...mpos.keys()]) if (!(q().monsters as any[]).includes(m)) { lastPos.set(mname(m), mpos.get(m)!); mpos.delete(m); }
}
const vivos = () => INV.filter((i) => !i.fuera);
function nearestInv(from: string) { const { d } = bfs(from); let best: Inv | null = null; for (const i of vivos()) if (i.pos in d && (!best || d[i.pos] < d[best.pos])) best = i; return best; }
function moveMonster(m: any, steps: number, target?: Inv | string) {
  const p = mpos.get(m)!; const tgt = typeof target === 'string' ? target : (target ?? nearestInv(p))?.pos; if (!tgt) return;
  const pa = path(p, tgt) ?? [p]; const np = pa[Math.min(steps, pa.length - 1)]; if (np !== p) P(`   👹 ${mshort(m)} se mueve de ${zn(p)} a ${zn(np)}`); mpos.set(m, np);
}
// ---------- contexto para el perfil ----------
let actor: Inv = INV[0];
const fallaronVoluntad: Inv[] = [];
const done = new Set<string>(); const nightKey = (t: string) => t + '@' + noche();
function makeCtx() {
  return {
    INV, NH: INV.length, STRAT, V, onBoard, noche, hora, P, rnd, roll, bfs, path, access, zn, adj, G, L, q, game,
    get actor() { return actor; }, set actor(i: Inv) { actor = i; },
    vivos, mpos, mname, mshort, moveMonster, nearestInv, fallaronVoluntad, done, nightKey,
    estado: {} as Record<string, any>,                     // memoria libre del perfil
    porApodo(n: number) { const k = V('quien' + n); return INV.find((i) => i.id === 'Hero' + HEROES[k - 1]); },
    monstruo(re: RegExp) { return [...mpos.entries()].find(([m]) => re.test(mname(m))); },
    pulsarFicha(t: string) { const c: any = game.tokenBoard.tc.find((c: any) => c.c?.getEvent?.()?.sectionName === t); if (c) { c.startEvent(); drain(); return true; } return false; },
    lanzarEvento(e: string) { q().eManager.queueEvent(e); q().eManager.triggerEvent(); drain(); },
  };
}
const C = makeCtx();

// ---------- efectos de texto ----------
function selHero(ev: string) { const s = q().heroSelection.get(ev); return s?.[0] ? INV.find((i) => i.id === s[0].heroData.sectionName) : undefined; }
function subject(raw: string, rendered: string): Inv[] | null {
  const c = raw.match(/\{c:(Event\w+)\}/); if (c) { const h = selHero(c[1]); if (h) return [h]; }
  for (const [re, n] of PERFIL.apodos ?? []) if (re.test(raw)) { const h = C.porApodo(n); if (h) return [h]; }
  if (/\{rnd:hero\}/.test(raw)) { const h = INV.find((i) => rendered.includes(i.key)); if (h) return [h]; }
  const p = PERFIL.quienSufre?.(raw, C); if (p) return p;
  if (/[Cc]ada investigador/.test(raw)) return vivos();
  return null;
}
function hurt(i: Inv, dano: number, horror: number, anul?: string) {
  if (anul && (dano || horror)) { let r = roll(i, anul, 0, false); const d0 = Math.max(0, dano - r); r -= dano - d0; dano = d0; horror = Math.max(0, horror - Math.max(0, r)); }
  if (!dano && !horror) { P(`      ${i.n} no sufre nada.`); return; }
  i.dano += dano; i.horror += horror;
  P(`      💔 ${i.n} sufre ${dano ? dano + ' de Daño' : ''}${dano && horror ? ' y ' : ''}${horror ? horror + ' de Horror' : ''} → Daño ${i.dano}/${i.vida}, Horror ${i.horror}/${i.cordura}`);
  if (i.dano >= i.vida) { if (i.herido) { i.fuera = true; P(`      ☠️ ${i.n} queda ELIMINADO`); } else { i.herido = true; i.dano = 0; P(`      🩸 ${i.n} queda HERIDO (descarta el Daño; solo un movimiento por ronda)`); } }
  if (i.horror >= i.cordura) { if (i.loco) { i.fuera = true; P(`      ☠️ ${i.n} queda ELIMINADO por locura`); } else { i.loco = true; i.horror = 0; P(`      🌀 ${i.n} se vuelve LOCO (carta de Loco secreta)`); } }
}
const applied = new Set<any>(); let movLibre = false;
function applyEffects(d: any) {
  if (applied.has(d)) return; applied.add(d);
  const name = d.eventData.qEvent.sectionName; const raw = L[name + '.text'] ?? ''; const rendered = d.text;
  if (/Cada investigador realiza una tirada de \{will\}; si no obtiene ningún éxito/.test(raw)) { fallaronVoluntad.length = 0; for (const i of vivos()) if (roll(i, 'will', 0, false) === 0) { fallaronVoluntad.push(i); hurt(i, 0, 1); } }
  else if (/realiza una tirada de \{will\} y sufre 2 de Horror, menos 1 por cada éxito/.test(raw)) { for (const i of subject(raw, rendered) ?? []) hurt(i, 0, 2, 'will'); }
  else for (const sent of raw.split(/(?<=[.!?»])\s+|\\n/)) {
    const m = sent.match(/(.*?)\b[Ss]ufres? (\d) de (Daño|Horror)(?: y (\d) de Horror)?(?: boca abajo)?(?: \(anulad[oa]s? por \{(\w+)\}\))?/);
    if (m && !/menos 1 por cada|Si sabías/.test(sent)) {
      const who = subject(m[1], rendered) ?? [actor]; const dano = m[3] === 'Daño' ? +m[2] : 0; const hor = m[3] === 'Horror' ? +m[2] : +(m[4] ?? 0);
      for (const i of who) hurt(i, dano, hor, m[5]);
    }
    const dh = sent.match(/descarta (\d) cartas? de Horror/i); if (dh) for (const i of subject(sent, rendered) ?? [actor]) { i.horror = Math.max(0, i.horror - +dh[1]); P(`      💚 ${i.n} descarta ${dh[1]} de Horror (${i.horror})`); }
    const pg = sent.match(/(.*?)\bgana(?:s|n)? (\d|una?) (?:ficha de |fichas de )?Pistas?/i); if (pg) for (const i of subject(pg[1], rendered) ?? [actor]) { i.pistas += /\d/.test(pg[2]) ? +pg[2] : 1; P(`      🔍 ${i.n} gana Pista (${i.pistas})`); }
  }
  if (/puede moverse 1 espacio a través de (?:esta|la) puerta/.test(raw)) movLibre = true;
  PERFIL.alEvento?.(name, raw, C);
}
// ---------- elección de botones ----------
const pressed = new Map<string, Set<string>>(); let faltoAccion = false;
const BAD = /Despedirse|Cerrar|^Volver|Dejarl[oa]|No hay|Rechaz|^No$|Otro investigador|Repasar|Reglas de esta/i;
const lab = (b: any) => b.button.getLabel().translate().replace(/<[^>]+>/g, '');
const rawLabel = (ev: string, num: number) => L[`${ev}.button${num + 1}`] ?? '';
const costsAction = (rawl: string) => /\{action\}/.test(rawl);
function handleDialog(): boolean {
  const d: any = ui.lastDialog; if (!d) return false;
  const ev = d.eventData.qEvent.sectionName; const raw = L[ev + '.text'] ?? '';
  if (ev.startsWith('Spawn')) pendingSpawn = G.tokens[ev] ?? pendingSpawn;
  const txt = d.text.replace(/<[^>]+>/g, '').replace(/\n+/g, ' / ');
  if (!/^EventLam/.test(ev)) P(`   📜 [${ev}] ${txt.slice(0, 240)}${txt.length > 240 ? '…' : ''}`);
  applyEffects(d); syncMonsters();
  const en = d.buttons.filter((b: any) => b.enabled);
  if (d.quotaButton) {
    const sk = (raw.match(/\{(strength|agility|observation|lore|influence|will)\}/) ?? [])[1] ?? 'strength';
    const who = subject(raw.split(/realiza/i)[0] ?? '', d.text) ?? [actor];
    const fija = PERFIL.tirada?.(ev, who[0], sk, C);
    d.quota = fija ?? roll(who[0], sk, /tira 1 dado menos/.test(raw) ? -1 : 0); d.onQuota(); return true;
  }
  if (PERFIL.dialogo?.(d, ev, raw, C)) return true;
  const yes = (re: RegExp) => { const b = en.find((b: any) => re.test(lab(b))); if (b) { P(`      ➜ ${lab(b)}`); d.onButton(b.num); return true; } return false; };
  for (const [delata, cond, si, no] of PERFIL.respuestas ?? []) if (en.some((b: any) => delata.test(lab(b)))) return yes(cond(C) ? si : no);
  if (en.some((b: any) => /Todos obtuvieron/.test(lab(b)))) return yes(fallaronVoluntad.length > 0 ? /Alguien no/ : /Todos obtuvieron/);
  // activación de monstruo hecha con botones «El monstruo ataca…» / «No hay nadie…»
  if (en.some((b: any) => /El monstruo ataca/.test(lab(b)))) {
    const m = q().eManager.monsterImage as any;
    if (m && mpos.has(m)) {
      moveMonster(m, +(raw.match(/Se mueve (\d) espacio/)?.[1] ?? 1));
      const here = vivos().filter((i) => i.pos === mpos.get(m));
      if (here.length) {
        let t = here[0];
        if (/menos Daño/.test(raw)) t = [...here].sort((a, b) => a.dano - b.dano)[0];
        else if (/más Horror/.test(raw)) t = [...here].sort((a, b) => b.horror - a.horror)[0];
        else { const s = (raw.match(/menor \{(\w+)\}/) ?? [])[1]; if (s) t = [...here].sort((a, b) => a.st[s] - b.st[s])[0]; }
        actor = t; P(`      ➜ ${mshort(m)} ataca a ${t.n}`); d.onButton(en.find((b: any) => /ataca/.test(lab(b))).num); return true;
      }
    }
    P('      ➜ no hay nadie en su espacio'); d.onButton(en.find((b: any) => /No hay/.test(lab(b))).num); return true;
  }
  if (/Se mueve 1 espacio más/.test(raw)) { const m = q().eManager.monsterImage as any; if (m && mpos.has(m)) moveMonster(m, 1); }
  // selector con un botón por investigador
  if (en.some((b: any) => INV.some((i) => lab(b).includes(i.key) || lab(b).includes(i.n)))) {
    const h = PERFIL.elegirInvestigador?.(ev, C) ?? actor; const b = en.find((b: any) => lab(b).includes(h.n) || lab(b).includes(h.key)) ?? en[0];
    P(`      ➜ elige a ${h.n}`); d.onButton(b.num); return true;
  }
  const key = ev + '@' + noche(); const pr = pressed.get(key) ?? new Set<string>(); pressed.set(key, pr);
  const extraBad = PERFIL.evitar?.(C) ?? /$^/;
  let b: any; for (const p of PERFIL.preferir?.(C) ?? []) { b = en.find((x: any) => p.test(lab(x))); if (b) break; }
  const sinAccion = (x: any) => costsAction(rawLabel(ev, x.num)) && actor.acc <= 0 && q().phase === 0;
  if (!b) b = en.find((x: any) => !BAD.test(lab(x)) && !extraBad.test(lab(x)) && !pr.has(lab(x)) && !sinAccion(x));
  if (!b) b = en.find((x: any) => !BAD.test(lab(x)) && !pr.has(lab(x)) && !sinAccion(x));
  if (!b && en.some((x: any) => !BAD.test(lab(x)) && !pr.has(lab(x)) && sinAccion(x))) faltoAccion = true; // quería hacer algo y no le quedaba acción: lo intentará en su próximo turno
  if (!b) b = en.find((x: any) => /Despedirse|Cerrar|Continuar|Confirmar/.test(lab(x))) ?? en.find((x: any) => /Volver/.test(lab(x))) ?? en[en.length - 1];
  if (!b) return false;
  if (costsAction(rawLabel(ev, b.num)) && q().phase === 0 && en.length > 1) { actor.acc--; P(`      (${actor.n} gasta otra acción)`); }
  pr.add(lab(b)); if (en.length > 1) P(`      ➜ ${lab(b)}`); d.onButton(b.num); return true;
}
function handlePuzzle(): boolean {
  const w: any = ui.lastWindow; if (!w || w.constructor?.name !== 'PuzzleCodeWindow') return false;
  const sol = w.questPuzzle.puzzleSolution.split(' ').map(Number); const pasos = actor.st.lore + actor.pistas;
  const intentos = PERFIL.rompecabezas?.(w, actor, C) ?? [sol.map(() => 1 + rnd(4)), sol];
  for (let k = 0; k < intentos.length && k < pasos; k++) { for (const x of intentos[k]) w.guessAdd(x); w.guess(); P(`      🧩 ${actor.n} prueba ${intentos[k].join('-')} (paso ${k + 1} de ${pasos})`); if (intentos[k].join() === sol.join()) { w.finished(); return true; } }
  P('      🧩 no le quedan pasos'); w.close(); return true;
}
function clickUI(): boolean {
  if (!game.currentQuest || ui.lastDialog) return false;
  const c: any = game.tokenBoard.tc.find((c: any) => c.clickable && c.c?.constructor?.name === 'UI' && q().boardItems.has(c.c?.getEvent?.()?.sectionName));
  if (!c) return false; P(`   🖱 (pulsan ${c.c.getEvent().sectionName})`); c.startEvent(); return true;
}
function drain() { let n = 0; while (game.currentQuest && n++ < 400) { if (handleDialog()) continue; if (handlePuzzle()) continue; if (clickUI()) continue; break; } if (game.currentQuest) syncMonsters(); }

// ---------- turno de un investigador ----------
function evadeIfNeeded(i: Inv): boolean {
  const m = [...mpos.entries()].find(([, p]) => p === i.pos); if (!m) return true;
  P(`   🏃 ${i.n} [acción] intenta evadir a ${mshort(m[0])}`); i.acc--;
  return roll(i, 'agility', 0, false) >= 1;
}
function attackIfThere(i: Inv): boolean {
  const m = [...mpos.entries()].find(([, p]) => p === i.pos);
  if (!m || i.acc <= 0) return false;
  if (PERFIL.puedeAtacar && !PERFIL.puedeAtacar(mname(m[0]), i, C)) return false;
  const sk = i.st.lore >= 4 ? 'lore' : 'strength'; P(`   ⚔️ ${i.n} [acción] ataca a ${mshort(m[0])} (${sk === 'lore' ? 'hechizo' : 'arma'})`); i.acc--;
  const dmg = roll(i, sk) + 1; const hp = mhp.get(m[0])! - dmg; mhp.set(m[0], hp); P(`      ${dmg} de Daño → le quedan ${Math.max(0, hp)}`);
  if (hp <= 0) { const where = m[1]; new MonsterDialogMoM(m[0]).defeated(); P(`      ✝ cae en ${zn(where)}`); drain(); }
  return true;
}
function step(i: Inv, to: string, why: string) {
  const p = path(i.pos, to); if (!p || p.length < 2) { P(`   ${i.n} no puede llegar a ${zn(to)}`); i.acc = 0; return; }
  const np = p[Math.min(i.herido ? 1 : 2, p.length - 1)]; P(`   🚶 ${i.n} [acción] ${zn(i.pos)} → ${zn(np)} ${why}`); i.pos = np; i.acc--;
}
function distObjetivo(i: Inv, desde: string) {
  const { d } = bfs(desde); let best = 99;
  for (const t of PERFIL.plan(i, C)) if (onBoard(t) && !done.has(nightKey(t)) && (PERFIL.fichaDisponible?.(t, C) ?? true)) for (const a of access(t)) if (a in d && d[a] < best) best = d[a];
  return best;
}
function click(i: Inv, t: string) {
  if (!(PERFIL.noMarcar ?? /^TokenX/).test(t)) done.add(nightKey(t)); actor = i; i.acc--;
  P(`   👉 ${i.n} [acción] ${t.replace('Token', '')} en ${zn(i.pos)}`);
  const antes = new Set(nombresTablero().filter((n) => /^Tile/.test(n))); movLibre = false; faltoAccion = false;
  C.pulsarFicha(t);
  if (faltoAccion) { done.delete(nightKey(t)); P(`      (sin acción para seguir: ${i.n} volverá a ${t.replace('Token', '')})`); faltoAccion = false; }
  // «puede moverse 1 espacio a través de esta puerta»: entra gratis en la zona que acaba de revelar
  if (movLibre && process.env.MOVLIBRE !== '0' && game.currentQuest && !i.fuera) {
    const dest = (adj[i.pos] ?? []).find((n) => revealed(n) && !antes.has(tileOf(n)));
    // es opcional: solo entra si le acerca a lo siguiente que quiere hacer
    if (dest && ![...mpos.values()].includes(i.pos) && distObjetivo(i, dest) < distObjetivo(i, i.pos)) { P(`   🚪 ${i.n} entra gratis en ${zn(dest)}`); i.pos = dest; }
  }
  movLibre = false;
}
function act(i: Inv) {
  let guard = 0;
  while (i.acc > 0 && !i.fuera && game.currentQuest && guard++ < 20) {
    drain(); if (!game.currentQuest) return;
    actor = i; if (PERFIL.accionEspecial?.(i, C)) continue;
    // con un monstruo al lado, una mesa sensata coge antes lo que ha venido a buscar (no hace falta evadir para usar una ficha)
    if ([...mpos.values()].includes(i.pos)) { const aqui = PERFIL.plan(i, C).find((t) => onBoard(t) && !done.has(nightKey(t)) && access(t).includes(i.pos) && !/^TokenX/.test(t) && (PERFIL.fichaDisponible?.(t, C) ?? true)); if (aqui) { click(i, aqui); continue; } }
    if (attackIfThere(i)) continue;
    let goal = PERFIL.cita?.(i, C) ?? null;
    if (goal && i.pos !== goal && !path(i.pos, goal)) goal = null;
    if (goal && i.pos !== goal) { if (!evadeIfNeeded(i)) continue; step(i, goal, `(cita: ${zn(goal)})`); continue; }
    if (goal && i.pos === goal) { const here = PERFIL.plan(i, C).find((t) => onBoard(t) && !done.has(nightKey(t)) && access(t).includes(i.pos)); if (here) { click(i, here); continue; } P(`   ⏳ ${i.n} espera en ${zn(i.pos)}`); i.acc = 0; break; }
    const cands = PERFIL.plan(i, C).filter((t) => onBoard(t) && !done.has(nightKey(t)) && access(t).length && (PERFIL.fichaDisponible?.(t, C) ?? true));
    const { d } = bfs(i.pos);
    // el plan va por orden de prioridad; lo que está cerca puede adelantarse un poco (PESO_DIST)
    const W = Number(process.env.PESO_DIST ?? PERFIL.pesoDistancia ?? 99);
    let best: string | null = null, bs = 1e9; cands.forEach((t, k) => { for (const a of access(t)) if (a in d) { const sc = d[a] * W + k; if (sc < bs) { bs = sc; best = t; } } });
    if (!best) { P(`   ⏳ ${i.n} no tiene nada a mano y espera en ${zn(i.pos)}`); i.acc = 0; break; }
    const tgt = access(best).filter((a) => a in d).sort((a, b) => d[a] - d[b])[0];
    if (i.pos === tgt) click(i, best); else { if (!evadeIfNeeded(i)) continue; step(i, tgt, `(hacia ${best.replace('Token', '')})`); }
  }
}

// ---------- rondas ----------
drain();
let lastRound = -1, guard = 0, lastNight = noche();
const losetas = () => nombresTablero().filter((n) => /^Tile/.test(n)).length;
while (game.currentQuest && guard++ < 300) {
  const r = V('#round');
  if (r !== lastRound) {
    lastRound = r;
    if (noche() !== lastNight) { lastNight = noche(); mpos.clear(); for (const i of INV) { i.pos = INICIO; i.dano = 0; i.herido = false; } PERFIL.alEmpezarNoche?.(C); }
    P(`\n=== Noche ${noche()} · Ronda ${hora()} (global ${r}) · losetas ${losetas()} · ${vivos().map((i) => `${i.n} en ${zn(i.pos)} D${i.dano}/H${i.horror}/P${i.pistas}`).join(' · ')}`);
  }
  P(' — Fase de investigadores');
  for (const i of vivos()) {
    actor = i;
    if (PERFIL.turnoEspecial?.(i, C)) { if (!game.currentQuest) break; continue; }
    i.acc = 2 + (PERFIL.accionesExtra?.(i, C) ?? 0); act(i); if (!game.currentQuest) break;
  }
  if (!game.currentQuest) break;
  P(' — Fase de Mitos'); (game.stageUI as any).next(); drain(); if (!game.currentQuest) break;
  for (let k = 0; k < 5 && game.currentQuest && q().phase !== 3 && q().phase !== 0; k++) { (game.roundControl as any).checkNewRound(); drain(); }
  if (!game.currentQuest) break;
  if (q().phase === 0) continue;
  P(' — Fase de Horror');
  for (const i of vivos()) { const m = [...mpos.entries()].find(([, p]) => p === i.pos || (adj[i.pos] ?? []).includes(p)); if (m) { const hv = HP[mname(m[0])]?.[2] ?? 2; P(`   😱 ${i.n} ve a ${mshort(m[0])} (Horror ${hv})`); hurt(i, 0, hv, 'will'); } }
  (game.stageUI as any).next(); drain();
}
P(`\nFIN. Finales: ${out.filter((l) => /\[Event(Final|Epilogo|Fin)/.test(l)).map((l) => l.match(/\[(\w+)\]/)![1]).join(', ')}`);
P(`Estado: ${INV.map((i) => `${i.n}: Daño ${i.dano}${i.herido ? ' (herido)' : ''}, Horror ${i.horror}${i.loco ? ' (loco)' : ''}${i.fuera ? ' ELIMINADO' : ''}`).join(' · ')}`);
writeFileSync(process.env.OUT ?? 'partida.txt', out.join('\n'));
console.log(out.slice(-2).join('\n'));
