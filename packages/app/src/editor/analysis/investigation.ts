// Not ported from Valkyrie (9 November 2026): what the editor's analysis can tell, without playing, about whether a table
// investigates a story or has to press everything (the skill's investigacion.md): rooms placed without saying what is in
// them, tokens that change nothing, and clues set and never used. Pure: no DOM.
import { QuestData, QuestGraph } from '@universalis/engine';
import type { Advice } from './analyze.ts';
import { textOf, words } from './writing.ts';

/** Tokens a table presses to look at something (not doors, people or monsters). */
const LOOKS = new Set(['TokenSearch', 'TokenInteract', 'TokenSight']);
/** A room placed with fewer words than this says nothing of what draws the eye. */
const TERSE = 12;

function isTile(qd: QuestData, name: string): boolean {
  return qd.components.get(name) instanceof QuestData.Tile;
}

function isLook(qd: QuestData, name: string): boolean {
  const c = qd.components.get(name);
  return c instanceof QuestData.Token && LOOKS.has(c.tokenName);
}

/** Whether pressing it can change anything: a variable, the board, the inventory, a roll that counts. */
function changesSomething(qd: QuestData, token: QuestData.Token): boolean {
  const seen = new Set<string>();
  const queue: [string, number][] = token.buttons.flatMap((b) => b.eventNames.map((n): [string, number] => [n, 1]));
  for (const op of token.operations ?? []) if (op.var !== '') return true;
  while (queue.length > 0) {
    const [name, depth] = queue.shift()!;
    if (seen.has(name) || depth > 5) continue;
    seen.add(name);
    const c = qd.components.get(name);
    if (!(c instanceof QuestData.Event)) continue;
    if ((c.operations ?? []).some((op) => op.var !== '') || c.addComponents.length > 0 || c.quota > 0 || c.quotaVar !== '') return true;
    if (c.removeComponents.some((r) => r !== token.sectionName)) return true;
    for (const b of c.buttons) for (const n of b.eventNames) queue.push([n, depth + 1]);
  }
  return false;
}

export function investigationAdvice(qd: QuestData): Advice[] {
  const out: Advice[] = [];

  // Rooms placed with their tokens and hardly a word about what is there
  const graph = new QuestGraph(qd.components);
  const unsaid: string[] = [];
  for (const c of qd.components.values()) {
    if (!(c instanceof QuestData.Event) || c instanceof QuestData.Token) continue;
    if (!c.addComponents.some((n) => isTile(qd, n)) || !c.addComponents.some((n) => isLook(qd, n))) continue;
    // A silent event that places the room says it through the window that led to it
    const said = c.display ? [c] : (graph.incoming.get(c.sectionName) ?? []).filter((l) => l.kind === 'button').map((l) => qd.components.get(l.from)!);
    if (!said.some((e) => words(textOf(e)) >= TERSE)) unsaid.push(c.sectionName);
  }
  if (unsaid.length > 0) out.push({ level: 'hint', key: 'ANALYSIS_ROOMS_UNSAID', params: [unsaid.length], components: unsaid });

  // Tokens that change nothing: a few are atmosphere or a red herring; many make the table press everything
  const looks = [...qd.components.values()].filter((c): c is QuestData.Token => c instanceof QuestData.Token && LOOKS.has(c.tokenName));
  const dull = looks.filter((t) => !changesSomething(qd, t)).map((t) => t.sectionName);
  if (dull.length >= 3 && dull.length >= looks.length * 0.25) out.push({ level: 'hint', key: 'ANALYSIS_DULL_TOKENS', params: [dull.length, looks.length], components: dull });

  // Clues set and never read: what was found does not change what can be done
  const shown = new Set<string>();
  for (const c of qd.components.values()) for (const m of textOf(c).matchAll(/\{var:([^{}]+)\}/g)) shown.add(m[1]!);
  const unread = [...graph.written.keys()].filter((v) => !/^[#$%]/.test(v) && !graph.read.has(v) && !shown.has(v));
  if (unread.length > 0) {
    const writers = [...new Set(unread.flatMap((v) => graph.written.get(v)!.map((u) => u.component)))];
    out.push({ level: 'hint', key: 'ANALYSIS_UNREAD', params: [unread.length, unread.slice(0, 6).join(', ')], components: writers });
  }
  return out;
}
