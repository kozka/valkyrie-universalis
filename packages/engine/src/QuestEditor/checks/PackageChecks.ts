// The checks of a whole package, a campaign's quests together: which quests a change of quest reaches
// (StartQuestEvent, Quest.ChangeQuest), the texts a quest needs after one, and Descent's fame. Not ported from Valkyrie,
// whose Validate button does nothing; they come from the validator of the skill descent-valkyrie.
import type { Game } from '../../Game.ts';
import { Path } from '../../platform/SystemIO.ts';
import { normalizePath } from '../../platform/VirtualFileSystem.ts';
import { Problems, type Problem } from './Problem.ts';
import { questFacts, type QuestCheckInput, type QuestFacts } from './QuestChecks.ts';

/** What the package's checks keep of each quest, so that its files can go once it has been read. */
interface QuestSummary {
  /** The quest's folder from the main quest's ('' for it). */
  folder: string;
  /** Its quest.ini, in lower case, as a change of quest names it. */
  questIni: string;
  facts: QuestFacts | null;
  /** The quest's default language when it is not English, and what English lacks of it. */
  english: { language: string; missing: string[] | null } | null;
}

/**
 * The checks of a package's quests together, the main quest first; `where` is a quest's folder from the main one's.
 * The quests are read one at a time, so a package of hundreds can be given as a generator.
 */
export function checkPackage(game: Game, quests: Iterable<QuestCheckInput>): Problem[] {
  const problems = new Problems();
  const summaries: QuestSummary[] = [];
  let root: string | null = null;
  for (const q of quests) {
    root ??= normalizePath(q.root ?? q.files.folder);
    const language = q.files.defaultLanguage;
    const english = q.files.texts.get('English');
    const base = q.files.texts.get(language);
    summaries.push({
      folder: normalizePath(q.files.folder).substring(root.length + 1),
      questIni: normalizePath(Path.combine(q.files.folder, 'quest.ini')).toLowerCase(),
      facts: q.qd === null ? null : questFacts({ ...q, qd: q.qd, root }),
      english:
        language === 'English'
          ? null
          : {
              language,
              missing: english === undefined ? null : [...(base ?? [])].filter(([k, v]) => v.trim() !== '' && (english.get(k) ?? '').trim() === '').map(([k]) => k),
            },
    });
  }
  const main = summaries[0];
  if (main === undefined) return [];

  // The virtual file system, as Windows, finds a quest whatever the letter case of its path
  const targets = new Set(summaries.flatMap((s) => (s.facts?.switches ?? []).map((t) => t.toLowerCase())));
  if (targets.size > 0) {
    const noEnglish: QuestSummary[] = [];
    const lessEnglish: QuestSummary[] = [];
    for (const s of summaries.slice(1)) {
      if (!targets.has(s.questIni)) {
        problems.hint('package-not-reached', s.folder);
        continue;
      }
      // Quest.ChangeQuest reads the player's language, English and the fallback one, never the quest's default language
      if (s.english === null) continue;
      if (s.english.missing === null) noEnglish.push(s);
      else if (s.english.missing.length > 0) lessEnglish.push(s);
    }
    // Wrong when the main quest speaks English; else the package is for its own language's players, who lose nothing
    const level = main.english === null || main.english.missing !== null ? 'wrong' : 'hint';
    const first = noEnglish[0];
    if (first !== undefined) problems.add(level, 'package-english', '', { count: noEnglish.length, example: first.folder, language: first.english!.language });
    const less = lessEnglish[0];
    if (less !== undefined) problems.add(level, 'package-english-missing', '', { count: lessEnglish.length, example: less.folder, language: less.english!.language, texts: less.english!.missing!.length, key: less.english!.missing![0]! });
  }

  if (game.gameType.typeName() !== 'D2E') return problems.list;
  // Quest.GenerateItemSelection draws a quest's items when it loads, before its EventStart, and again on $restock: with
  // no fame thresholds set, the fame is 'legendary' and only items whose maximum fame is legendary come
  const withItems = summaries.filter((s) => (s.facts?.fameItems.length ?? 0) > 0);
  const settingFame = summaries.filter((s) => (s.facts?.fameEvents.length ?? 0) > 0);
  if (withItems.length > 0 && settingFame.length === 0) {
    problems.wrong('package-fame', '', { items: withItems.flatMap((s) => s.facts!.fameItems).join(' ') });
  } else {
    for (const s of withItems) {
      if ((s !== main && settingFame.some((f) => f !== s)) || s.facts!.restocks) continue;
      problems.wrong('package-fame-load', s.folder, { items: s.facts!.fameItems.join(' '), events: s.facts!.fameEvents.join(' ') });
    }
  }
  return problems.list;
}
