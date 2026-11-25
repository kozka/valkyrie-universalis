// Not ported from Valkyrie (7 November 2026): a look at the scenario's texts, in the language they are written in,
// for the editor's analysis: windows too long to read at the table (they also push the buttons off a small screen), and
// the phrases a beginner writes and a seasoned author avoids ("a shiver runs down your spine", "suddenly"). Pure: no DOM.
import { QuestData } from '@universalis/engine';
import type { Advice } from './analyze.ts';

/** More words than this in one window is a lot to read aloud (diseno-escenarios.md: dialogues of 2–4 sentences). */
const LONG = 110;

/** Worn phrases, in Spanish and English: the author says what to feel instead of showing what is there. */
const WORN: RegExp[] = [
  /escalofr[ií]o[s]? (te )?recorre/i,
  /se te hiela la sangre/i,
  /de repente/i,
  /sin previo aviso/i,
  /no puedes creer lo que ven tus ojos/i,
  /un silencio sepulcral/i,
  /indescriptible/i,
  /sientes (mucho )?miedo/i,
  /shivers? (runs?|down) (down )?your spine/i,
  /blood runs cold/i,
  /\bsuddenly\b/i,
  /out of nowhere/i,
  /you can'?t believe your eyes/i,
  /deafening silence/i,
  /indescribable/i,
  /you feel (very )?(afraid|scared)/i,
];

export function textOf(c: QuestData.QuestComponent): string {
  try {
    const key = c instanceof QuestData.UI ? c.uiText : c instanceof QuestData.Event ? c.text : null;
    if (key === null) return '';
    const t = key.translate();
    return t.startsWith(c.sectionName) ? '' : t;
  } catch {
    return '';
  }
}

export function words(text: string): number {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\\n/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1).length;
}

export function writingAdvice(qd: QuestData): Advice[] {
  const long: string[] = [];
  const worn = new Map<string, string[]>();
  for (const c of qd.components.values()) {
    if (!(c instanceof QuestData.Event)) continue;
    const text = textOf(c);
    if (text.length === 0) continue;
    if (words(text) > LONG && !(c instanceof QuestData.UI)) long.push(c.sectionName);
    for (const re of WORN) {
      const found = re.exec(text);
      if (found !== null) worn.set(found[0].toLowerCase(), [...(worn.get(found[0].toLowerCase()) ?? []), c.sectionName]);
    }
  }
  const out: Advice[] = [];
  if (long.length > 0) out.push({ level: 'hint', key: 'ANALYSIS_LONG_TEXTS', params: [long.length, LONG], components: long });
  for (const [phrase, where] of worn) out.push({ level: 'hint', key: 'ANALYSIS_WORN', params: [phrase], components: where });
  return out;
}
