// Not in Valkyrie (15 November 2026): what a save keeps of the game, without the clock, so that the calm autosave
// (autoSave.ts) is skipped when nothing changed since the last save. Each save copies the whole scenario: 170 MB for
// Strain on Reality, written again every minute on an iPad that ran short of memory. Not ported from Valkyrie.

/** Quest.ToString's lines that change with the clock alone. */
const CLOCK = /^(time|duration)=/;

/** A save.ini without the lines that change with the clock, and the files saved beside it (ZipManager.extraSaveFiles). */
export function saveState(saveIni: string, extra: ReadonlyMap<string, Uint8Array>): string {
  const lines = saveIni.split(/\r?\n/);
  const end = lines.findIndex((line, i) => i > 0 && line.startsWith('['));
  const kept = lines.filter((line, i) => !((end < 0 || i < end) && CLOCK.test(line)));
  const decoder = new TextDecoder();
  const files = [...extra].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([name, data]) => `${name}\n${decoder.decode(data)}`);
  return [kept.join('\n'), ...files].join('\n\u0000');
}
