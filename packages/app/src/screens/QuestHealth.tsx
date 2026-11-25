// Not in Valkyrie (7 November 2026): in a scenario's details, a word when its author left a mistake that stops a game
// or leaves an event half done, found by the editor's checks (QuestEditor/checks). Only those: kozka wants no fuss
// about the rest. Of the 228 scenarios of the store, about ten have one (a component added that does not exist, a tile
// side no pack has, no start, a component in two files, a text whose {qst:…} is never closed).
import { useEffect, useState } from 'react';
import {
  checkQuest,
  ContentData,
  Directory,
  ExtractManager,
  Game,
  Path,
  type Problem,
  type QuestData,
  readQuestForChecks,
  SearchOption,
  ValkyrieConstants,
} from '@universalis/engine';
import { startingFromKeptFiles } from '../host/storage.ts';
import { languageName } from '../ui/languages.ts';
import { switchOn } from '../ui/preferences.ts';
import { run } from '../ui/run.ts';
import { uni } from '../ui/text.ts';

/** What stops Universalis as it stops Valkyrie (letter case and line endings do not: the app reads both its way). */
const SERIOUS = new Set(['add-missing', 'tile-side-unknown', 'start-none', 'component-twice', 'text-mark-unclosed']);

/** At most this long checking a package's quests one by one (Pruebas has hundreds, of a few seconds each): the main
 * quest first, then the others while there is time. */
const BUDGET_MS = 3000;

/**
 * Where the serious problems of the package's quests are, each once: one quest at a time, with a pause for the page
 * between them, until `live` says the screen has gone.
 */
async function seriousProblems(q: QuestData.Quest, live: () => boolean): Promise<string[]> {
  const game = Game.get();
  let folder = q.path;
  const file = Path.getFileName(q.path) ?? '';
  if (Path.getExtension(file) === ValkyrieConstants.ScenarioDownloadContainerExtension) {
    folder = ExtractManager.extractSinglePackageFull(Path.combine(ContentData.downloadPath(), file));
  }
  if (!Directory.exists(folder)) return [];
  const quests = Directory.getFiles(folder, 'quest.ini', SearchOption.AllDirectories).sort((a, b) => a.length - b.length);
  const problems: Problem[] = [];
  let spent = 0;
  for (const quest of quests) {
    if (spent > BUDGET_MS) break;
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (!live()) return [];
    const start = performance.now();
    run(() => problems.push(...checkQuest({ game, ...readQuestForChecks(quest), root: folder })));
    spent += performance.now() - start;
  }
  const lang = game.currentLang;
  const said = problems.flatMap((p) => {
    if (!SERIOUS.has(p.code)) return [];
    // A text of another language does not matter to this player
    const texts = /^texts (\w+)$/.exec(p.where);
    if (texts !== null) return texts[1] === lang ? [uni('FAULT_TEXT', languageName(lang, lang))] : [];
    return [uni(FAULT_TEXT_KEYS[p.code]!, p.where || 'quest.ini')];
  });
  return [...new Set(said)];
}

/** How a player is told each mistake, in a line. */
const FAULT_TEXT_KEYS: Record<string, string> = {
  'add-missing': 'FAULT_ADD_MISSING',
  'tile-side-unknown': 'FAULT_TILE',
  'start-none': 'FAULT_START',
  'component-twice': 'FAULT_TWICE',
};

export function QuestHealth({ quest }: { quest: QuestData.Quest }) {
  const on = switchOn('scenarioFaults');
  const [found, setFound] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let live = true;
    setFound([]);
    setOpen(false);
    if (!on) return;
    // After the screen is drawn: a big package takes a moment
    const timer = setTimeout(() => {
      const name = Path.getFileName(quest.path) ?? '';
      const packages = Path.getExtension(name) === ValkyrieConstants.ScenarioDownloadContainerExtension ? [Path.combine(ContentData.downloadPath(), name)] : [];
      void startingFromKeptFiles(packages, () =>
        seriousProblems(quest, () => live).then((said) => {
          if (live) setFound(said);
        }),
      );
    }, 300);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [quest, on]);
  if (!on || found.length === 0) return null;
  return (
    <div className="quest-health" role="note">
      <span>{uni('QUEST_SERIOUS', found.length)}</span>
      <button type="button" className="quest-health-more" aria-expanded={open} onClick={() => setOpen(!open)}>
        {uni(open ? 'QUEST_SERIOUS_HIDE' : 'QUEST_SERIOUS_SHOW')}
      </button>
      {open && (
        <div className="quest-health-popover" role="dialog" aria-label={uni('QUEST_SERIOUS_SHOW')}>
          <ul>
            {found.slice(0, 12).map((line) => (
              <li key={line}>{line}</li>
            ))}
            {found.length > 12 && <li>…</li>}
          </ul>
          <p>{uni('QUEST_SERIOUS_TELL')}</p>
        </div>
      )}
    </div>
  );
}
