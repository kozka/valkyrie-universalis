// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/EditorComponentQuest.cs
// Only what the quest's panel does to it, and the choices its selection windows offer; the panel is the app's
// (editor/QuestPanel.tsx).
import { LocalizationRead } from '../Content/LocalizationRead.ts';
import { Game } from '../Game.ts';
import { floatTryParse, intTryParse } from '../platform/CSharp.ts';
import { questPictures } from './EditorComponent.ts';

/** The quest's texts that its panel edits, by the end of their keys. */
export type QuestText = 'description' | 'synopsys' | 'authors' | 'authors_short';

function quest() {
  return Game.get().currentQuest!.qd.quest;
}

export const EditorComponentQuest = {
  /** The name changes when one is typed: an empty box keeps the old one. */
  // Valkyrie: EditorComponentQuest.cs EditorComponentQuest.UpdateQuestName
  updateQuestName(text: string): void {
    if (text.length === 0) return;
    LocalizationRead.updateScenarioText(quest().name_key, text);
  },

  /** The description, synopsis and authors: an empty one goes from every language. */
  // Valkyrie: EditorComponentQuest.cs EditorComponentQuest.UpdateQuestDesc, UpdateQuestSynopsys, UpdateQuestAuth and UpdateQuestShortAuth
  updateQuestText(which: QuestText, text: string): void {
    const key = 'quest.' + which;
    if (text.length === 0) LocalizationRead.dicts.get('qst')!.remove(key);
    else LocalizationRead.updateScenarioText(key, text);
  },

  // Valkyrie: EditorComponentQuest.cs EditorComponentQuest.ToggleHidden
  toggleHidden(): void {
    quest().hidden = !quest().hidden;
  },

  // Valkyrie: EditorComponentQuest.cs EditorComponentQuest.ToggleDefaultMusicOff
  toggleDefaultMusicOn(): void {
    quest().defaultMusicOn = !quest().defaultMusicOn;
  },

  /** What the cover window offers: none (''), then the png and jpg pictures of the scenario's folder. */
  // Valkyrie: EditorComponentQuest.cs EditorComponentQuest.Image
  imageChoices(): string[] {
    return ['', ...questPictures()];
  },

  // Valkyrie: EditorComponentQuest.cs EditorComponentQuest.SelectImage
  selectImage(image: string): void {
    quest().image = image.replace(/\\/g, '/');
  },

  /** What the pack window offers: every pack with an id. */
  // Valkyrie: EditorComponentQuest.cs EditorComponentQuest.QuestAddPack
  packChoices(): string[] {
    return Game.get()
      .cd.allPacks.map((pack) => pack.id ?? '')
      .filter((id) => id.length > 0);
  },

  // Valkyrie: EditorComponentQuest.cs EditorComponentQuest.SelectQuestAddPack
  selectQuestAddPack(pack: string): void {
    quest().packs = [...quest().packs, pack];
  },

  // Valkyrie: EditorComponentQuest.cs EditorComponentQuest.QuestRemovePack
  questRemovePack(index: number): void {
    quest().packs = quest().packs.filter((_, i) => i !== index);
  },

  /** At least one hero: what is not a number counts as 0, so one. */
  // Valkyrie: EditorComponentQuest.cs EditorComponentQuest.UpdateMinHero
  updateMinHero(text: string): void {
    quest().minHero = intTryParse(text).value;
    if (quest().minHero < 1) quest().minHero = 1;
  },

  /** At most the game's heroes: what is not a number counts as 0, as in Valkyrie. */
  // Valkyrie: EditorComponentQuest.cs EditorComponentQuest.UpdateMaxHero
  updateMaxHero(text: string): void {
    quest().maxHero = intTryParse(text).value;
    if (quest().maxHero > Game.get().gameType.maxHeroes()) quest().maxHero = Game.get().gameType.maxHeroes();
  },

  // Valkyrie: EditorComponentQuest.cs EditorComponentQuest.UpdateMinLength
  updateMinLength(text: string): void {
    quest().lengthMin = intTryParse(text).value;
  },

  // Valkyrie: EditorComponentQuest.cs EditorComponentQuest.UpdateMaxLength
  updateMaxLength(text: string): void {
    quest().lengthMax = intTryParse(text).value;
  },

  /** Between 0 and 1. */
  // Valkyrie: EditorComponentQuest.cs EditorComponentQuest.UpdateDifficulty
  updateDifficulty(text: string): void {
    quest().difficulty = Math.fround(floatTryParse(text).value);
    if (quest().difficulty > 1) quest().difficulty = 1;
    if (quest().difficulty < 0) quest().difficulty = 0;
  },
};
