// The adventures of a campaign: the quests in the folders below a scenario's own, which a change of quest reaches (a
// button's next event named after another quest.ini, from the campaign's folder: StartQuestEvent, Quest.ChangeQuest).
// Valkyrie's editor lists them as scenarios of their own, as it lists every quest below its user folder
// (QuestLoader.GetUserUnpackedQuests, ExtractManager.DirList); not in Valkyrie: the editor shows them under their
// campaign, checks them with the whole campaign, tests them with their changes of quest going from the campaign's
// folder, and packages the campaign, never an adventure alone.
import { Directory, File, Game, Path, QuestData, SearchOption, normalizePath, pathKey } from '@universalis/engine';

/** Whether two paths name the same folder or file, whatever their slashes and letter case (as Windows finds them). */
export function samePath(a: string, b: string): boolean {
  return pathKey(normalizePath(a)) === pathKey(normalizePath(b));
}

/** A path from a folder it is in, with forward slashes ('' for the folder itself). */
export function pathFrom(folder: string, inside: string): string {
  const from = normalizePath(folder);
  const path = normalizePath(inside);
  return path.length > from.length ? path.substring(from.length + 1) : '';
}

/** The campaign a quest's folder is an adventure of: the outermost folder above it with a quest.ini, or the folder itself. */
export function campaignOf(folder: string): string {
  let campaign = folder;
  for (let up = Path.getDirectoryName(normalizePath(folder)); up !== null && up.length > 1; up = Path.getDirectoryName(up)) {
    if (File.exists(up + '/quest.ini')) campaign = up;
  }
  return campaign;
}

/** A quest's name in its own texts, or null when it has none (an adventure often has none). */
export function questTitle(quest: QuestData.Quest): string | null {
  const texts = quest.localizationDict;
  return texts !== null && texts.keyExists('quest.name') ? texts.getValue('quest.name') : null;
}

export interface Adventure {
  /** Its folder. */
  path: string;
  /** Its folder from the campaign's, as a change of quest names it without '/quest.ini'. */
  folder: string;
  /** Its name in its own texts, or its folder's. */
  name: string;
}

/** An adventure of a campaign, from its quest. */
function adventure(campaign: string, path: string, quest: QuestData.Quest): Adventure {
  const folder = pathFrom(campaign, path);
  return { path, folder, name: questTitle(quest) ?? folder };
}

/** The nearest first, then by folder. */
function nearestFirst(a: Adventure, b: Adventure): number {
  return a.folder.split('/').length - b.folder.split('/').length || a.folder.localeCompare(b.folder);
}

/** A list of the editor's quests (QuestEditSelection.questList) with each adventure under its campaign. */
export function byCampaign<T extends { quest: QuestData.Quest }>(list: readonly T[]): { entry: T; adventures: Adventure[] }[] {
  const campaigns = new Map<string, { entry: T; adventures: Adventure[] }>();
  const adventures: T[] = [];
  for (const entry of list) {
    const path = entry.quest.path;
    if (samePath(campaignOf(path), path)) campaigns.set(pathKey(normalizePath(path)), { entry, adventures: [] });
    else adventures.push(entry);
  }
  for (const entry of adventures) {
    const campaign = campaigns.get(pathKey(normalizePath(campaignOf(entry.quest.path))));
    // One whose campaign the list does not have (another game's) is listed as Valkyrie lists it
    if (campaign === undefined) campaigns.set(pathKey(normalizePath(entry.quest.path)), { entry, adventures: [] });
    else campaign.adventures.push(adventure(campaign.entry.quest.path, entry.quest.path, entry.quest));
  }
  for (const c of campaigns.values()) c.adventures.sort(nearestFirst);
  return [...campaigns.values()];
}

/** A campaign's adventures, read from its folders: the quests below it that Valkyrie's editor would list (of this game). */
export function adventuresOf(campaign: string): Adventure[] {
  if (!Directory.exists(campaign)) return [];
  const type = Game.get().gameType.typeName();
  const found: Adventure[] = [];
  for (const questIni of Directory.getFiles(campaign, 'quest.ini', SearchOption.AllDirectories)) {
    const path = Path.getDirectoryName(questIni)!;
    if (samePath(path, campaign)) continue;
    const quest = new QuestData.Quest(path);
    if (quest.valid && quest.type === type) found.push(adventure(campaign, path, quest));
  }
  return found.sort(nearestFirst);
}

/** The quests of a campaign that a change of quest in one of them can go to, as it names them: their quest.ini from the campaign's folder. */
export function questChanges(campaign: string, own: string): string[] {
  if (!Directory.exists(campaign)) return [];
  return Directory.getFiles(campaign, 'quest.ini', SearchOption.AllDirectories)
    .filter((questIni) => !samePath(Path.getDirectoryName(questIni)!, own))
    .map((questIni) => pathFrom(campaign, questIni))
    .sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b));
}
