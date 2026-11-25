// Not ported from Valkyrie (8 November 2026): for the editor's analysis, where the way to an ending stops. From each
// event that ends the game ($end), it walks back through whatever leads there (the buttons that name it, what puts a
// token or UI element on the board, a trigger) to the first steps that never ran though what leads to them did, and
// names the condition that held them back with the values the variables had. Pure: no DOM.
import { QuestData, VarOperation, type VarTests } from '@universalis/engine';

export interface Blocker {
  /** The event that never ran. */
  event: string;
  /** What ran and would have led to it (a button's owner, what adds it), or null for a trigger. */
  from: string | null;
  /** The tests that failed, as written, with the values seen ("_x==1 (0)"). */
  needs: string[];
  /** How far back from the ending, in steps. */
  depth: number;
}

const failing = (tests: VarTests | null, vars: ReadonlyMap<string, number>): string[] => {
  const out: string[] = [];
  for (const tc of tests?.varTestsComponents ?? []) {
    if (!(tc instanceof VarOperation)) continue;
    const seen = vars.get(tc.var) ?? 0;
    const want = /^[-.\d]/.test(tc.value) ? Number.parseFloat(tc.value) : (vars.get(tc.value) ?? 0);
    const ok = { '==': seen === want, '!=': seen !== want, '>=': seen >= want, '<=': seen <= want, '>': seen > want, '<': seen < want }[tc.operation] ?? false;
    if (ok || tc.var.startsWith('#')) continue;
    out.push(`${tc.var}${tc.operation}${tc.value} (${seen})`);
  }
  return out;
};

/** The events that end the game: their operations, or a button's, set $end. */
export function endingEvents(qd: QuestData): string[] {
  const out: string[] = [];
  for (const c of qd.components.values()) {
    if (!(c instanceof QuestData.Event)) continue;
    const ops = [...(c.operations ?? []), ...c.buttons.flatMap((b) => b.operations ?? [])];
    if (ops.some((o) => o.var === '$end' && o.value !== '0')) out.push(c.sectionName);
  }
  return out;
}

/** The first steps towards an ending that no game took, though what leads to them was taken. */
export function blockers(qd: QuestData, ran: ReadonlySet<string>, vars: ReadonlyMap<string, number>, limit = 8): Blocker[] {
  const callers = new Map<string, { from: string; condition: VarTests | null }[]>();
  const adders = new Map<string, string[]>();
  for (const c of qd.components.values()) {
    if (!(c instanceof QuestData.Event)) continue;
    for (const b of c.buttons) for (const n of b.eventNames) callers.set(n, [...(callers.get(n) ?? []), { from: c.sectionName, condition: b.condition }]);
    for (const a of c.addComponents) adders.set(a, [...(adders.get(a) ?? []), c.sectionName]);
  }
  const setters = new Map<string, string[]>();
  for (const c of qd.components.values()) {
    if (!(c instanceof QuestData.Event)) continue;
    for (const o of [...(c.operations ?? []), ...c.buttons.flatMap((b) => b.operations ?? [])]) setters.set(o.var, [...(setters.get(o.var) ?? []), c.sectionName]);
  }
  /** What could set the variables a failed test reads, which then never ran. */
  const behind = (needs: string[]): string[] => needs.flatMap((n) => setters.get(/^[^=!<>]+/.exec(n)![0]) ?? []).filter((e) => !ran.has(e));
  const defeatedBy = (what: string): string[] =>
    [...qd.components.values()].filter((c): c is QuestData.Spawn => c instanceof QuestData.Spawn && (c.sectionName === what || c.mTypes.includes(what))).map((c) => c.sectionName);
  const out: Blocker[] = [];
  const seen = new Set<string>();
  let wave = endingEvents(qd).filter((e) => !ran.has(e));
  for (let depth = 0; wave.length > 0 && depth < 40; depth++) {
    const next: string[] = [];
    for (const name of wave) {
      if (seen.has(name)) continue;
      seen.add(name);
      const c = qd.components.get(name);
      if (!(c instanceof QuestData.Event)) continue;
      const own = failing(c.tests, vars);
      // A monster's defeat starts once its spawn has run (Defeated + the spawn's name, or + a kind it can bring): before
      // that, the spawn is where the way stopped
      const spawns = c.trigger.startsWith('Defeated') ? defeatedBy(c.trigger.substring('Defeated'.length)) : [];
      if (spawns.length > 0 && !spawns.some((sp) => ran.has(sp))) next.push(...spawns);
      else if (c.trigger.length > 0) out.push({ event: name, from: null, needs: own, depth });
      next.push(...behind(own));
      for (const k of callers.get(name) ?? []) {
        if (ran.has(k.from)) {
          const needs = [...failing(k.condition, vars), ...own];
          out.push({ event: name, from: k.from, needs, depth });
          next.push(...behind(needs));
        } else next.push(k.from);
      }
      // A token or UI element is pressed once something puts it on the board
      if (c instanceof QuestData.Token || c instanceof QuestData.UI) {
        for (const a of adders.get(name) ?? []) {
          if (ran.has(a)) out.push({ event: name, from: a, needs: own, depth });
          else next.push(a);
        }
      }
    }
    wave = next;
  }
  const unique = new Map<string, Blocker>();
  for (const b of out) if (!unique.has(b.event)) unique.set(b.event, b);
  return [...unique.values()].sort((a, b) => b.depth - a.depth).slice(0, limit);
}
