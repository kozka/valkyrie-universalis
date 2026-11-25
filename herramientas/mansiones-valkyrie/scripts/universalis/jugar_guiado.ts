import { start, log, ENGINE } from './jugar_comun.ts';
const { MonsterDialogMoM } = ENGINE;

const N = Number(process.env.N ?? 3), NH = Number(process.env.NH ?? 4);
const ALL = (process.env.HEROES ?? 'HeroAgathaCrane,HeroRitaYoung,HeroFatherMateo,HeroWilliamYorick').split(',');
const strip = (s: string) => s.replace(/<[^>]+>/g, '').replace(/\n+/g, ' / ');
const BAD0 = /Despedirse|Cerrar|^Volver|Dejarl[oa]|No hay|^No$/i;
const BAD = process.env.BADX ? new RegExp(BAD0.source + '|' + process.env.BADX, 'i') : BAD0;
const PREF: RegExp[] = process.env.PREFX ? process.env.PREFX.split(',').map(x => new RegExp(x, 'i')) : [];
for (let s = 1; s <= N; s++) {
  let rng = s * 31; const r = (n: number) => { rng = (rng * 1103515245 + 12345) & 0x7fffffff; return rng % n; };
  const { ui, game } = start(ALL.slice(0, NH), s);
  const q = () => game.currentQuest; const V = (n: string) => q()?.vars.getValue(n);
  const pressed = new Map<string, Set<string>>(); const clicked = new Set<string>(); const evs: string[] = []; let steps = 0, problem = '';
  let last: any = {};
  while (steps++ < 6000 && q()) {
    const d = ui.lastDialog, w: any = ui.lastWindow;
    try {
      if (d) {
        const ev = d.eventData.qEvent.sectionName; evs.push(ev); last = Object.fromEntries((process.env.VARS ?? '#round').split(',').map(v => [v, V(v)]));
        if (process.env.SHOW && process.env.SHOW.split(',').some(x => ev.includes(x))) console.log('   >', ev, '|', strip(d.text).slice(0, 300), '|', d.buttons.map(b => (b.enabled?'':'[x]') + strip(b.button.getLabel().translate())).join(' / '));
        if (d.quotaButton) { d.quota = 3; d.onQuota(); continue; }
        const key = ev + '@' + V('#round'); const done = pressed.get(key) ?? new Set(); pressed.set(key, done);
        const en = d.buttons.filter(b => b.enabled); const L = (b: any) => strip(b.button.getLabel().translate());
        if (!en.length) { problem = 'SIN BOTONES: ' + ev; break; }
        let b: any; for (const p of PREF) { b = en.find(x => p.test(L(x)) && !(process.env.BADX && new RegExp(process.env.BADX, 'i').test(L(x)))); if (b) break; }
        if (!b && ev === 'EventPruebas') b = en.find(b => !done.has(L(b)) && !/Eso es todo/.test(L(b))) ?? en.find(b => /Eso es todo/.test(L(b)));
        if (!b) b = en.find(b => !BAD.test(L(b)) && !done.has(L(b)));
        if (!b) b = en.find(b => /Despedirse|Cerrar|Continuar/.test(L(b))) ?? en.find(b => /Volver/.test(L(b))) ?? en[en.length - 1];
        done.add(L(b)); const before = d; d.onButton(b.num);
        if (ui.lastDialog === before) { problem = 'NO AVANZA: ' + ev; break; }
        continue;
      }
      if (w && w.constructor?.name === 'PuzzleCodeWindow') {
        const sol = w.questPuzzle.puzzleSolution.split(' ').map(Number); for (const x of sol) w.guessAdd(x); w.guess(); evs.push('PUZZLE ' + sol.join('')); w.finished(); continue;
      }
      if (ui.findTag('dialog')) { problem = 'VENTANA ' + w?.constructor?.name; break; }
      const kr = 'kill@' + V('#round'); if (process.env.KILL !== '0' && q()!.monsters.length && q()!.phase === 0 && !clicked.has(kr)) { clicked.add(kr); const ms: any[] = q()!.monsters as any; const m: any = ms.find((x: any) => process.env.JEFE && new RegExp(process.env.JEFE).test(x.monsterData?.sectionName ?? '')) ?? ms[0]; evs.push('MATA ' + (m.monsterData?.sectionName ?? m.cMonster?.sectionName)); new MonsterDialogMoM(m).defeated(); continue; }
      if (process.env.INSPECT && false && !clicked.has('insp' + V('#round'))) { clicked.add('insp' + V('#round')); evs.push('INSPECT'); q()!.eManager.queueEvent('EventMirarCuaderno'); q()!.eManager.triggerEvent(); continue; }
      const name = (c: any) => c.c?.getEvent?.()?.sectionName;
      const toks = game.tokenBoard.tc.filter((c: any) => c.clickable && q()!.boardItems.has(name(c)));
      const tag = (c: any) => name(c) + '@' + V('#round');
      const fresh = toks.filter((c: any) => !clicked.has(tag(c)) && !/^UI(Reinicio|Final)/.test(name(c)) || (/^UI(Reinicio|Final).*Seguir/.test(name(c)) && !clicked.has(tag(c))));
      if (fresh.length) { const c: any = fresh.find((c: any) => /Seguir/.test(name(c))) ?? fresh[0]; clicked.add(tag(c)); evs.push('CLICK ' + name(c)); c.startEvent(); continue; }
      evs.push('NEXT'); (game.stageUI as any).next();
    } catch (e: any) { problem = 'EXCEPCIÓN ' + e.message; break; }
  }
  const fins = evs.filter(e => new RegExp(process.env.FINALES ?? '^Event(Final|Derrota|Victoria|Epilogo|Fin)').test(e));
  console.log(`semilla ${s} (${NH} inv.): ${problem || 'ok'} | ${q() ? 'sigue en la ronda ' + V('#round') : 'terminó'} | ${fins.join(', ')} | ${JSON.stringify(last)} | pasos ${steps}`);
  if (process.env.TR) console.log(evs.filter(e => new RegExp(process.env.TR!).test(e)).join(' '));
}
