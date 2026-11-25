// What the scenario editor shows: its list of scenarios, the copy list, the new scenario form or an open scenario, with
// the tab of the panel below it, and a line about what was just done. The engine keeps the scenario; this only says
// which view. Not ported from Valkyrie.
import { create } from 'zustand';
import { setLayout } from './layout.ts';

export type EditorView =
  /** QuestEditSelection: the scenarios of the Editor folder. */
  | { name: 'list' }
  /** QuestEditSelection.Copy: every scenario, the downloaded ones too. */
  | { name: 'copy' }
  /** QuestEditSelection.NewQuestDialog; not in Valkyrie, for a new adventure of a campaign. */
  | { name: 'new'; campaign?: string }
  /** A scenario open in the editor (QuestEditor.Begin), or one it cannot load, and why. */
  | { name: 'quest'; path: string; error?: string };

/** The tabs of the panel below the workbench. */
export type BottomTab = 'graph' | 'problems' | 'tree' | 'texts' | 'book' | 'variables' | 'analysis' | 'files' | 'versions';

interface EditorState {
  view: EditorView;
  /** The tab shown below the workbench, and what the table of texts shows. */
  tab: BottomTab;
  onlyMissing: boolean;
  textsSearch: string;
  /** What was just done, or what went wrong. */
  message: string | null;
  /** QuestEditSelection's search filters, kept while the editor is open as Valkyrie keeps them. */
  editFilter: string;
  copyFilter: string;
  /** Counts changes, so that the views read the files again. */
  revision: number;
  /** The selected component is shown as its .ini lines (TextMode.tsx) rather than as fields. */
  textMode: boolean;
  /** Another quest of the campaign to open, once the workbench has asked about what is not saved (campaign.ts). */
  opening: string | null;
  /** The selected component's panel asks whether to delete it (its button, or the Delete key). */
  deleting: boolean;
  /** The map's place shows the screen with the UI elements instead (UIStage.tsx). */
  stage: boolean;
  /** The map's place shows the selected event's dialog as a game shows it (DialogShow.tsx). */
  showing: boolean;
  /** The component whose place the next press on the map sets (an event's or a monster place's). */
  placing: string | null;
}

export const useEditor = create<EditorState>(() => ({
  view: { name: 'list' },
  tab: 'problems',
  onlyMissing: false,
  textsSearch: '',
  message: null,
  editFilter: '',
  copyFilter: '',
  revision: 0,
  textMode: false,
  opening: null,
  deleting: false,
  stage: false,
  showing: false,
  placing: null,
}));

/** Shows a tab of the panel below the workbench, opening it; the texts' one, with only what is missing, or found by a search. */
export function showTab(tab: BottomTab, texts: { onlyMissing?: boolean; search?: string } = {}): void {
  useEditor.setState((s) => ({ tab, onlyMissing: texts.onlyMissing ?? s.onlyMissing, textsSearch: texts.search ?? s.textsSearch }));
  setLayout({ bottom: true });
}

/** Shows a view, with a line about what was just done. */
export function go(view: EditorView, message: string | null = null): void {
  useEditor.setState((s) => ({ view, message, revision: s.revision + 1 }));
}

/** A line about what was just done, on the view that is showing. */
export function say(message: string | null): void {
  useEditor.setState((s) => ({ message, revision: s.revision + 1 }));
}

export function setFilter(which: 'editFilter' | 'copyFilter', value: string): void {
  useEditor.setState({ [which]: value });
}

/** Asks the workbench to open another quest of the campaign, the campaign's own or one of its adventures (null: none). */
export function openInCampaign(folder: string | null): void {
  useEditor.setState({ opening: folder });
}
