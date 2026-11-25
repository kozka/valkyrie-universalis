// The editor's table of texts: every text of the scenario in each of its languages, by component, with what each
// language lacks; a text written or taken away in one language only; and the scenario's default language, which a
// player whose language the scenario lacks reads. Not in Valkyrie, whose editor writes the player's language only,
// takes an emptied text away from every language, and keeps the default language its new quest was given.
import { LocalizationRead } from '../Content/LocalizationRead.ts';
import type { QuestData } from '../Content/QuestData.ts';
import { Game } from '../Game.ts';
import { QUEST_SELECTION } from './QuestEditorData.ts';

/** The texts of a scenario by language, as Save writes them (ScenarioFiles.texts, DictionaryI18n.allEntries). */
export type TextsByLanguage = ReadonlyMap<string, ReadonlyMap<string, string>>;

/** A text of the scenario in each language that has it. */
export interface TextRow {
  key: string;
  /** The component whose text it is, QUEST_SELECTION for the quest's own (quest.*), or null when none has its name. */
  owner: string | null;
  values: ReadonlyMap<string, string>;
}

/** Blank, as DictionaryI18n.GetValue skips a text. */
function blank(text: string | undefined): boolean {
  return text === undefined || text.trim() === '';
}

export const QuestEditorTexts = {
  /** The languages the scenario has texts in, its default language first, also when it has none. */
  languages(texts: TextsByLanguage, defaultLanguage: string): string[] {
    return [defaultLanguage, ...[...texts.keys()].filter((l) => l !== defaultLanguage)];
  },

  /**
   * Every text: the quest's own first, then each component's in the quest's order, and last those of no component;
   * each component's in the order the default language has them, then those only other languages have.
   */
  rows(texts: TextsByLanguage, components: ReadonlyMap<string, QuestData.QuestComponent>, defaultLanguage: string): TextRow[] {
    const languages = QuestEditorTexts.languages(texts, defaultLanguage);
    const keys = new Set<string>();
    for (const language of languages) for (const key of texts.get(language)?.keys() ?? []) keys.add(key);
    const rank = new Map<string, number>([[QUEST_SELECTION, -1]]);
    for (const name of components.keys()) rank.set(name, rank.size);
    const rows = [...keys].map((key): TextRow => {
      const prefix = key.includes('.') ? key.substring(0, key.indexOf('.')) : key;
      const owner = prefix === 'quest' ? QUEST_SELECTION : components.has(prefix) ? prefix : null;
      const values = new Map<string, string>();
      for (const language of languages) {
        const value = texts.get(language)?.get(key);
        if (value !== undefined) values.set(language, value);
      }
      return { key, owner, values };
    });
    const rankOf = (row: TextRow) => (row.owner === null ? rank.size : rank.get(row.owner)!);
    return rows.map((row, i) => ({ row, i })).sort((a, b) => rankOf(a.row) - rankOf(b.row) || a.i - b.i).map(({ row }) => row);
  },

  /**
   * Whether a language lacks a text another one has (missing or blank); a text that only names another one, {qst:…},
   * is read in each language through it, as the checks see it (texts-missing-language).
   */
  lacks(row: TextRow, language: string): boolean {
    if (!blank(row.values.get(language))) return false;
    for (const [other, value] of row.values) if (other !== language && !blank(value) && !value.startsWith('{qst:')) return true;
    return false;
  },

  /** Writes a text in one language; an empty one goes from that language only. */
  setText(key: string, language: string, text: string): void {
    const dict = LocalizationRead.selectDictionary('qst')!;
    if (text.length === 0) dict.removeEntry(key, language);
    else dict.addEntry(key, text, language);
  },

  /** The language a player whose language the scenario lacks reads it in (defaultlanguage). */
  setDefaultLanguage(language: string): void {
    Game.get().currentQuest!.qd.quest.defaultLanguage = language;
    LocalizationRead.selectDictionary('qst')!.defaultLanguage = language;
  },
};
