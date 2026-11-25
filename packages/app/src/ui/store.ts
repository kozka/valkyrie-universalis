// What the app shows, for React. The engine keeps the game's state; this store only says which screen and windows are
// open, and counts changes so the views read the engine again. Not ported from Valkyrie.
import { create } from 'zustand';
import type {
  ActivateDialog,
  ActivateDialogMoM,
  ClassSelectionScreen,
  DialogWindow,
  HeroDialog,
  HeroSelection,
  HorrorCheck,
  InfoDialog,
  InventoryWindow,
  InventoryWindowMoM,
  InvestigatorAttack,
  InvestigatorEvade,
  InvestigatorItems,
  ItemData,
  LogWindow,
  MonsterDialog,
  MonsterDialogMoM,
  MoraleDisplay,
  NextStageButton,
  PuzzleCodeWindow,
  PuzzleImageWindow,
  PuzzleSlideWindow,
  PuzzleTowerWindow,
  Quest,
  QuestData,
  SaveData,
  SetWindow,
  ShopInterface,
  SkillWindow,
  Texture2D,
} from '@universalis/engine';

/** The app's screens (Valkyrie's UI/Screens) and, once a quest starts, the quest screen with its windows. */
export type Screen =
  | { name: 'loading' }
  | { name: 'game-selection' }
  /** `resume`, when the import was asked for to play (screens/ImportGate.tsx): where to go back to. */
  | { name: 'content-import'; game: string; resume?: { doom: boolean; scenario: string | null } }
  | { name: 'main-menu' }
  | { name: 'options' }
  | { name: 'about' }
  | { name: 'quest-selection' }
  | { name: 'quest-load-error'; questName: string; packageUrl: string; key: string }
  | { name: 'quest-details'; quest: QuestData.Quest }
  | { name: 'content-select'; type: string | null }
  | { name: 'content-download' }
  | { name: 'saves'; saves: SaveData[] }
  | { name: 'quest' }
  /** The scenario editor (editor/), only in development builds until it is ready. */
  | { name: 'editor' };

/**
 * A window over the board, with the tag Valkyrie gives its objects: destroying the tag closes it, and findTag sees it.
 * Windows stay in the order they opened, the last one on top, as Unity's UI canvas draws its children.
 */
export type GameWindow =
  | { kind: 'dialog'; tag: 'dialog'; window: DialogWindow; item: { data: ItemData; texture: Texture2D } | null }
  | { kind: 'investigator-items'; tag: 'dialog'; window: InvestigatorItems }
  | { kind: 'menu'; tag: 'dialog' }
  | { kind: 'saves'; tag: 'dialog'; saves: SaveData[] }
  | { kind: 'inventory'; tag: 'dialog'; window: InventoryWindowMoM }
  | { kind: 'inventory-d2e'; tag: 'dialog'; window: InventoryWindow }
  | { kind: 'skills'; tag: 'dialog'; window: SkillWindow }
  | { kind: 'set'; tag: 'setwindow'; window: SetWindow }
  /** Its lines (and a developer's variables when dialog) as Update drew them; Destroyer.Dialog takes them away. */
  | { kind: 'log'; tag: 'logs'; window: LogWindow; entries: string[]; dialog: boolean }
  | { kind: 'transition'; tag: 'transition'; phase: Quest.MoMPhase }
  | { kind: 'monster'; tag: 'dialog'; window: MonsterDialogMoM }
  | { kind: 'monster-d2e'; tag: 'dialog'; window: MonsterDialog }
  | { kind: 'monster-image'; tag: 'dialog'; monster: Quest.Monster; displayHealth: boolean }
  | { kind: 'attack'; tag: 'dialog'; window: InvestigatorAttack; greyed: boolean }
  | { kind: 'evade'; tag: 'dialog'; window: InvestigatorEvade; greyed: boolean }
  | { kind: 'horror'; tag: 'dialog'; window: HorrorCheck }
  | { kind: 'activation'; tag: 'dialog'; window: ActivateDialogMoM }
  | { kind: 'activation-d2e'; tag: 'activation'; window: ActivateDialog }
  | { kind: 'info'; tag: 'dialog'; window: InfoDialog }
  | { kind: 'hero'; tag: 'dialog'; window: HeroDialog }
  | { kind: 'puzzle-code'; tag: 'dialog'; window: PuzzleCodeWindow }
  | { kind: 'puzzle-slide'; tag: 'dialog'; window: PuzzleSlideWindow }
  | { kind: 'puzzle-image'; tag: 'dialog'; window: PuzzleImageWindow }
  | { kind: 'puzzle-tower'; tag: 'dialog'; window: PuzzleTowerWindow }
  | { kind: 'end'; tag: 'endgame' }
  | { kind: 'loading'; tag: 'dialog'; text: string; progress: number | null };

/** Something that stopped the game: a fatal error as Valkyrie reports it, or an exception. */
export interface Stop {
  message: string;
  detail: string;
  /** Not in Valkyrie: what stopped, for the stop window's buttons: the app's start, Valkyrie's Application.Quit, or else an exception. */
  kind?: 'boot' | 'fatal';
}

export interface UIState {
  screen: Screen;
  /** Counts engine changes the views show (heroes, windows, lists); each view reads the engine again when it changes. */
  revision: number;
  /** HeroCanvas.SetupUI drew the hero icons and Clean has not removed them. */
  heroCanvas: boolean;
  /** Game.StartQuest's title, back and finished buttons (tag heroselect). */
  heroSelectionScreen: boolean;
  /** HeroSelection's list of heroes (tag heroselect). */
  heroSelection: HeroSelection | null;
  /** Descent's ClassSelectionScreen (tag heroselect). */
  classSelection: ClassSelectionScreen | null;
  /** Descent's MoraleDisplay (tag questui). */
  morale: MoraleDisplay | null;
  /** Game.QuestStartEvent's menu button (tag questui). */
  questButtons: boolean;
  /** NextStageButton's bar (tag uiphase). */
  stageBar: NextStageButton | null;
  /** MonsterCanvas: the list of monsters is on screen (tag monsters). */
  monsterList: boolean;
  /** Descent's ShopInterface (tag shop), under the windows that open over it. */
  shop: ShopInterface | null;
  windows: GameWindow[];
  stop: Stop | null;
  /** A short message for the player, such as a scenario added. */
  notice: string | null;
  /** Not in Valkyrie: what the app found in a scenario the player added (host/scenarioPackage.ts), shown in a window. */
  scenarioReport: { title: string; lines: string[] } | null;
  /** A new version of the app is ready and waits for the player to reload (host/pwa.ts). */
  appUpdate: boolean;
  /** The browser offers to install the app (host/pwa.ts). */
  canInstall: boolean;
}

export const useUI = create<UIState>(() => ({
  screen: { name: 'loading' },
  revision: 0,
  heroCanvas: false,
  heroSelectionScreen: false,
  heroSelection: null,
  classSelection: null,
  morale: null,
  questButtons: false,
  stageBar: null,
  monsterList: false,
  shop: null,
  windows: [],
  stop: null,
  notice: null,
  scenarioReport: null,
  appUpdate: false,
  canInstall: false,
}));

/** Changes the store and counts a change, so the views read the engine again. A notice belongs to its screen. */
export function update(change: Partial<UIState> = {}): void {
  useUI.setState((state) => {
    const leaving = change.screen !== undefined && change.screen.name !== state.screen.name;
    return { ...(leaving ? { notice: null, scenarioReport: null } : {}), ...change, revision: state.revision + 1 };
  });
}

export function show(screen: Screen): void {
  update({ screen });
}

/**
 * The same window drawn again: the same object, or the only one of its kind (a monster's picture, the menu). A second
 * log window is drawn over the first in Valkyrie, looking the same, so it takes the first one's place.
 */
function sameWindow(a: GameWindow, b: GameWindow): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'log') return true;
  if ('window' in a && 'window' in b) return a.window === b.window;
  return true;
}

/** Opens a window; one drawn again (CreateWindow after a change) keeps its place. */
export function openWindow(window: GameWindow): void {
  const windows = useUI.getState().windows;
  const same = windows.findIndex((w) => sameWindow(w, window));
  const next = [...windows];
  if (same >= 0) next[same] = window;
  else next.push(window);
  update({ windows: next });
}

/** Closes the windows with this tag (Object.Destroy of every object with it). */
export function closeWindows(tag: string): void {
  const windows = useUI.getState().windows;
  if (windows.some((w) => w.tag === tag)) update({ windows: windows.filter((w) => w.tag !== tag) });
}

/** Whether a log window shows its lines, which LogWindow.Update draws with UIElement's default tag, dialog. */
export function logLinesShown(): boolean {
  return useUI.getState().windows.some((w) => w.kind === 'log' && w.dialog);
}

/** Destroyer.Dialog destroys the log window's lines and variables, and leaves its frame and Close. */
export function clearLogLines(): void {
  const windows = useUI.getState().windows;
  if (logLinesShown()) update({ windows: windows.map((w) => (w.kind === 'log' ? { ...w, entries: [], dialog: false } : w)) });
}

/** Not in Valkyrie (12 November 2026): the monster whose window is open (its picture, its attack, evade, horror, activation or information), lit in the list. */
export function chosenMonster(windows: readonly GameWindow[]): Quest.Monster | null {
  for (const w of [...windows].reverse()) {
    if (w.kind === 'monster-image') return w.monster;
    if (w.kind === 'monster-d2e' || w.kind === 'activation-d2e' || w.kind === 'activation' || w.kind === 'monster') return w.window.monster;
    if (w.kind === 'info' && w.window.monster !== null) return w.window.monster;
  }
  return null;
}

/** Not in Valkyrie (12 November 2026): the hero whose window is open, lit in its column. */
export function chosenHero(windows: readonly GameWindow[]): Quest.Hero | null {
  const hero = windows.findLast((w) => w.kind === 'hero');
  return hero?.kind === 'hero' ? hero.window.hero : null;
}
