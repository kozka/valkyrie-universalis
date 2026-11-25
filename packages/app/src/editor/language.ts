// The language the editor writes the scenario's texts in: the player's, as in Valkyrie, whose panels write
// LocalizationRead's current language; here it is also changed from the editor, as the options change it
// (OptionsScreen.SelectLang). Not ported from Valkyrie, where the options are reached only by leaving the editor.
import { Game, QuestData } from '@universalis/engine';
import { selectLang } from '../screens/OptionsScreen.tsx';
import { languageInSentence } from '../ui/languages.ts';
import { redrawOnBoard } from './EditorMap.tsx';
import { say } from './editorState.ts';
import { edi } from './text.ts';

/** Writes in another language from now on: the fields show and write its texts, and the map its interface's. */
export function writeIn(language: string): void {
  selectLang(language);
  const quest = Game.get().currentQuest!;
  for (const [name, component] of quest.qd.components) if (component instanceof QuestData.UI) redrawOnBoard(name);
  say(edi('EDITOR_WRITING_NOW', languageInSentence(language, language)));
}
