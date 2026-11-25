import { start, log } from './jugar_comun.ts';

const seeds = Number(process.env.N ?? 10), NH = Number(process.env.NH ?? 4);
const ALL = (process.env.HEROES ?? 'HeroAgathaCrane,HeroRitaYoung,HeroFatherMateo,HeroWilliamYorick,HeroCarsonSinclair').split(',');
const strip = (s: string) => s.replace(/<[^>]+>/g, '');
let rng = 12345; const r = (n: number) => { rng = (rng * 1103515245 + 12345) & 0x7fffffff; return rng % n; };
const summary: Record<string, number> = {}; const anomalies = new Set<string>();
for (let s = Number(process.env.S0 ?? 1); s <= seeds; s++) {
  rng = s * 7919;
  log.length = 0;
  const { ui, game } = start(ALL.slice(0, NH), s);
  const q = () => game.currentQuest;
  const seen = new Set<string>(); const evs: string[] = []; let problem = ''; let steps = 0;
  const clicked = new Map<string, number>();
  while (steps++ < 4000 && q()) {
    const d = ui.lastDialog; const w: any = ui.lastWindow;
    try {
      if (d) {
        const ev = d.eventData.qEvent; evs.push(ev.sectionName + "@" + "r" + q()!.vars.getValue("#round")); seen.add(ev.sectionName);
        const raw = (d.text + ' ' + d.buttons.map((b: any) => b.button.getLabel().translate()).join(' ')).match(/\{[^}]*\}|\b(Event|Token|Tile|QItem|Spawn)[A-Z]\w+/g); if (raw) anomalies.add(ev.sectionName + ': ' + raw.join(','));
        if (d.quotaButton) { d.quota = process.env.QHI ? 3 : r(4); d.onQuota(); continue; }
        if (ev.maxHeroes > 0 && process.env.PICK !== '1') {
          const en = d.buttons.find(b => b.enabled); const before = d; if (en) d.onButton(en.num);
          if (ui.lastDialog === before) { problem = 'BLOQUEO (pide investigador, MoM no lo deja): ' + ev.sectionName; break; }
          continue;
        }
        if (ev.maxHeroes > 0) { const hs = q()!.heroes.filter(h => h.heroData); hs[r(hs.length)].selected = true; }
        const en = d.buttons.filter(b => b.enabled);
        if (en.length === 0) { problem = 'SIN BOTONES ACTIVOS: ' + ev.sectionName; break; }
        const recent = evs.slice(-30).filter(x => x.startsWith(ev.sectionName + '@')).length;
        const en2 = en.filter((b: any) => !/Es otr/.test(b.button.getLabel().translate())); const b = recent >= 3 ? en2[en2.length - 1] ?? en[0] : en[r(en.length)]; const before = d; d.onButton(b.num);
        if (ui.lastDialog === before) { problem = 'BOTÓN NO AVANZA: ' + ev.sectionName; break; }
        continue;
      }
      if (w && w.constructor?.name === 'PuzzleCodeWindow') {
        const sol = w.questPuzzle.puzzleSolution.split(' ').map(Number);
        const guess = (process.env.QHI || r(2)) ? sol : sol.map(() => 1 + r(4));
        for (const x of guess) w.guessAdd(x); w.guess();
        if (w.puzzle.solved?.() ?? (guess.join() === sol.join())) w.finished(); else w.close();
        continue;
      }
      if (ui.findTag('dialog')) { problem = 'VENTANA DESCONOCIDA: ' + (w?.constructor?.name); break; }
      const name = (c: any) => c.c?.getEvent?.()?.sectionName;
      const toks = game.tokenBoard.tc.filter((c: any) => c.clickable !== false && c.c && q()!.boardItems.has(c.c?.getEvent?.()?.sectionName ?? ""));
      
      const fresh = toks.filter((c: any) => (clicked.get(name(c) + '@' + q()!.vars.getValue('#round')) ?? 0) < 1);
      if (fresh.length && r(10) < 9) { const c: any = fresh[r(fresh.length)]; clicked.set(name(c) + '@' + q()!.vars.getValue('#round'), 1); evs.push("CLICK:" + name(c) + (q()!.boardItems.has(name(c)) ? "" : "(FANTASMA)")); c.startEvent(); continue; }
      if (q()!.uiItemsPresent()) { const ui2: any = toks.find((c: any) => c.c?.constructor?.name === 'UI'); if (ui2) { evs.push("UICLICK:" + name(ui2)); ui2.startEvent(); continue; } problem = 'UI EN PANTALLA SIN SALIDA'; break; }
      evs.push("NEXT"); (game.stageUI as any).next();
    } catch (e: any) { problem = 'EXCEPCIÓN: ' + e.message + ' tras ' + evs.at(-1); break; }
  }
  const end = q() ? `sigue (ronda ${q()!.vars.getValue('#round')})` : 'terminó';
  const fin = evs.filter(e => new RegExp(process.env.FINALES ?? '^Event(Final|Derrota|Victoria|Fin)').test(e)).join(',');
  if (process.env.TR) console.log(evs.slice(0, Number(process.env.TR)).join(" "));
  console.log(`semilla ${s}: ${problem || 'ok'} | ${end} | finales: ${fin} | pasos ${steps}`);
  summary[problem.split(':')[0] || 'ok'] = (summary[problem.split(':')[0] || 'ok'] ?? 0) + 1;
}
console.log(summary); console.log('TEXTOS RAROS:', [...anomalies].slice(0, 40));
