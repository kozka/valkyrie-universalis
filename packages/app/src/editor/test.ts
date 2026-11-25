// A test of the open scenario, as Valkyrie's Save & Test plays it (ToolsButton.StartTest): saved, then played in test
// mode with that many heroes chosen at random, on the game's screens, with the editor's panel beside it
// (TestPanel.tsx). Back to the editor with the scenario and its history from the game's menu, from Descent's class
// selection, from the panel, or when the test ends, where Valkyrie goes to the main menu. Not ported from Valkyrie,
// whose editor draws none of this; nor are the test of a campaign's adventure, whose changes of quest go from the
// campaign's folder, and DooM's, whose heroes are its marines.
import { Game, Path, ToolsButton, type QuestEditorHistory } from '@universalis/engine';
import { heroesToChoose, playingDoom } from '../screens/doom.ts';
import { setEditorTest } from '../ui/editorTest.ts';
import { show } from '../ui/store.ts';
import { samePath } from './campaign.ts';
import { openQuest } from './EditorScreen.tsx';
import { useEditor } from './editorState.ts';
import { currentSession, questHeading, select } from './session.ts';
import { TestPanel } from './TestPanel.tsx';

/** The scenario tested, as the editor opened it, its name, its history, and the campaign it is an adventure of. */
let testing: { path: string; name: string; history: QuestEditorHistory; root: string } | null = null;

/** Plays the scenario open, which was just saved, with that many heroes (ToolsButton.StartTest). */
export function startTest(heroes: number): void {
  const view = useEditor.getState().view;
  if (view.name !== 'quest') return;
  const { history, root } = currentSession();
  testing = { path: view.path, name: questHeading(), history, root };
  setEditorTest({ Panel: TestPanel, back });
  try {
    ToolsButton.startTest(heroes, { ...(playingDoom() ? { heroes: heroesToChoose } : {}), ...(samePath(root, view.path) ? {} : { root }) });
  } catch (e) {
    // What was half made goes, and the editor opens the scenario again
    back();
    throw e;
  }
  show({ name: 'quest' });
}

/** The scenario tested, its name and its campaign's folder, while a test runs. */
export function tested(): { path: string; name: string; root: string } | null {
  return testing === null ? null : { path: testing.path, name: testing.name, root: testing.root };
}

/**
 * Back to the editor on the scenario tested, with its history, and with a component of it chosen there; or, given the
 * quest.ini of another quest of its campaign the test went to, on that one.
 */
export function back(selected?: string, questIni?: string): void {
  if (testing === null) return;
  const { path, history } = testing;
  testing = null;
  setEditorTest(null);
  const folder = questIni === undefined ? path : Path.getDirectoryName(questIni)!;
  if (samePath(folder, path)) openQuest(path, history);
  else openQuest(folder);
  show({ name: 'editor' });
  if (selected !== undefined && Game.get().currentQuest?.qd.components.has(selected)) select(selected);
}
