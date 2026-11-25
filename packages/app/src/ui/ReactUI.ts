// The app's side of game.ui: where Valkyrie draws, opens a window or destroys objects by tag, the engine calls these,
// and they tell React what to show (store.ts) and the board what to draw (board/registry.ts). Not ported from Valkyrie.
import {
  Game,
  GameStateManager,
  type ActivateDialog,
  type ActivateDialogMoM,
  type ClassSelectionScreen,
  type DialogWindow,
  type GameObject,
  type GameUI,
  type HeroDialog,
  type HeroSelection,
  type HorrorCheck,
  type InfoDialog,
  type InventoryWindow,
  type InventoryWindowMoM,
  type InvestigatorAttack,
  type InvestigatorEvade,
  type InvestigatorItems,
  type ItemData,
  type LogWindow,
  type MonsterDialog,
  type MonsterDialogMoM,
  type MoraleDisplay,
  type NextStageButton,
  type PuzzleCodeWindow,
  type PuzzleImageWindow,
  type PuzzleSlideWindow,
  type PuzzleTowerWindow,
  type Quest,
  type QuestData,
  type SetWindow,
  type ShopInterface,
  type SkillWindow,
  type Texture2D,
} from '@universalis/engine';
import { audioPlayer, stopAudioEffects } from '../audio/webAudio.ts';
import { boardScreenshot } from '../board/Board.ts';
import { board } from '../board/registry.ts';
import { openContentSelectDownload } from '../screens/ContentSelectDownloadScreen.tsx';
import { openMainMenu } from '../screens/MainMenuScreen.tsx';
import { openQuestDetails } from '../screens/QuestDetailsScreen.tsx';
import { openQuestSelection } from '../screens/QuestSelectionScreen.tsx';
import { openSaveSelect } from '../screens/SaveSelectScreen.tsx';
import { editorTest } from './editorTest.ts';
import { run } from './run.ts';
import { clearLogLines, closeWindows, logLinesShown, openWindow, update, useUI } from './store.ts';

export class ReactUI implements GameUI {
  /** Tags of what is on screen besides the windows and the board (the bar, the menu button, the hero selection…). */
  private readonly tags = new Set<string>();

  findTag(tag: string): boolean {
    if (tag === Game.DIALOG && logLinesShown()) return true;
    return this.tags.has(tag) || board.hasTag(tag) || useUI.getState().windows.some((w) => w.tag === tag);
  }

  destroyTag(tag: string): void {
    this.tags.delete(tag);
    board.destroyTag(tag);
    closeWindows(tag);
    if (tag === Game.DIALOG) clearLogLines();
    if (tag === Game.HEROSELECT) update({ heroSelectionScreen: false, heroSelection: null, classSelection: null });
    else if (tag === Game.QUESTUI) update({ questButtons: false, morale: null });
    else if (tag === Game.UIPHASE) update({ stageBar: null });
    else if (tag === Game.MONSTERS) update({ monsterList: false });
    else if (tag === Game.SHOP) update({ shop: null });
    else update();
  }

  audioPlayMusic(fileNames: string[], isDefaultQuestMusic: boolean): void {
    void audioPlayer().playMusic(fileNames, isDefaultQuestMusic);
  }

  audioPlayEffect(fileName: string): void {
    void audioPlayer().playEffect(fileName);
  }

  audioStopAudioEffect(): void {
    stopAudioEffects();
  }

  heroCanvasSetupUI(): void {
    update({ heroCanvas: true });
  }

  heroCanvasClean(): void {
    update({ heroCanvas: false });
  }

  heroCanvasUpdateStatus(): void {
    update();
  }

  heroCanvasUpdateImages(): void {
    update();
  }

  heroDialog(window: HeroDialog): void {
    openWindow({ kind: 'hero', tag: Game.DIALOG, window });
  }

  heroSelectionScreen(): void {
    this.tags.add(Game.HEROSELECT);
    update({ screen: { name: 'quest' }, heroSelectionScreen: true });
  }

  heroSelection(selection: HeroSelection): void {
    this.tags.add(Game.HEROSELECT);
    update({ heroSelection: selection });
  }

  classSelectionScreen(screen: ClassSelectionScreen): void {
    this.tags.add(Game.HEROSELECT);
    update({ screen: { name: 'quest' }, classSelection: screen });
  }

  investigatorItems(window: InvestigatorItems): void {
    openWindow({ kind: 'investigator-items', tag: Game.DIALOG, window });
  }

  questButtons(): void {
    this.tags.add(Game.QUESTUI);
    update({ screen: { name: 'quest' }, questButtons: true });
  }

  monsterCanvasUpdateList(): void {
    this.tags.add(Game.MONSTERS);
    update({ monsterList: true });
  }

  monsterCanvasUpdateStatus(): void {
    update();
  }

  monsterDialog(window: MonsterDialog): void {
    openWindow({ kind: 'monster-d2e', tag: Game.DIALOG, window });
  }

  monsterDialogMoM(window: MonsterDialogMoM): void {
    openWindow({ kind: 'monster', tag: Game.DIALOG, window });
  }

  // Valkyrie greys the cancel and finished buttons when it draws the window, if the monster is already defeated
  investigatorAttack(window: InvestigatorAttack): void {
    openWindow({ kind: 'attack', tag: Game.DIALOG, window, greyed: window.monster.damage === window.monster.getHealth() });
  }

  investigatorEvade(window: InvestigatorEvade): void {
    openWindow({ kind: 'evade', tag: Game.DIALOG, window, greyed: window.m.damage === window.m.getHealth() });
  }

  horrorCheck(window: HorrorCheck): void {
    openWindow({ kind: 'horror', tag: Game.DIALOG, window });
  }

  infoDialog(window: InfoDialog): void {
    openWindow({ kind: 'info', tag: Game.DIALOG, window });
  }

  inventoryWindowMoM(window: InventoryWindowMoM): void {
    openWindow({ kind: 'inventory', tag: Game.DIALOG, window });
  }

  inventoryWindow(window: InventoryWindow): void {
    openWindow({ kind: 'inventory-d2e', tag: Game.DIALOG, window });
  }

  skillWindow(window: SkillWindow): void {
    openWindow({ kind: 'skills', tag: Game.DIALOG, window });
  }

  setWindow(window: SetWindow): void {
    openWindow({ kind: 'set', tag: Game.SETWINDOW, window });
  }

  // Valkyrie: LogWindow.cs LogWindow.Update: its lines are drawn as they are now, tagged dialog
  logWindow(window: LogWindow): void {
    openWindow({ kind: 'log', tag: Game.LOGS, window, entries: window.entries(), dialog: window.drawsDialog() });
  }

  gameMenu(): void {
    openWindow({ kind: 'menu', tag: Game.DIALOG });
  }

  saveSelectScreen(save: boolean): void {
    openSaveSelect(save);
  }

  moraleDisplay(display: MoraleDisplay): void {
    this.tags.add(Game.QUESTUI);
    update({ morale: display });
  }

  nextStageButton(button: NextStageButton): void {
    this.tags.add(Game.UIPHASE);
    update({ stageBar: button });
  }

  // The board finds the control of a piece in game.tokenBoard when it is clicked
  tokenBoardAdd(): void {
    update();
  }

  boardCanvasAdd(gameObject: GameObject): void {
    board.add('board', gameObject);
    update();
  }

  tokenCanvasAdd(gameObject: GameObject): void {
    board.add('token', gameObject);
    update();
  }

  questUICanvasAdd(component: Quest.UI): void {
    board.addUI(component);
    update();
  }

  destroyObject(gameObject: GameObject): void {
    board.remove(gameObject);
    update();
  }

  dialogWindow(window: DialogWindow): void {
    openWindow({ kind: 'dialog', tag: Game.DIALOG, window, item: null });
  }

  dialogQuotaWindow(window: DialogWindow): void {
    openWindow({ kind: 'dialog', tag: Game.DIALOG, window, item: null });
  }

  // DialogWindow.DrawItem draws the item next to the window that is open
  dialogItem(window: DialogWindow, data: ItemData, texture: Texture2D): void {
    openWindow({ kind: 'dialog', tag: Game.DIALOG, window, item: { data, texture } });
  }

  puzzleCodeWindow(window: PuzzleCodeWindow): void {
    openWindow({ kind: 'puzzle-code', tag: Game.DIALOG, window });
  }

  puzzleSlideWindow(window: PuzzleSlideWindow): void {
    openWindow({ kind: 'puzzle-slide', tag: Game.DIALOG, window });
  }

  puzzleImageWindow(window: PuzzleImageWindow): void {
    openWindow({ kind: 'puzzle-image', tag: Game.DIALOG, window });
  }

  puzzleTowerWindow(window: PuzzleTowerWindow): void {
    openWindow({ kind: 'puzzle-tower', tag: Game.DIALOG, window });
  }

  activateDialog(window: ActivateDialog): void {
    openWindow({ kind: 'activation-d2e', tag: Game.ACTIVATION, window });
  }

  activateDialogMoM(window: ActivateDialogMoM): void {
    openWindow({ kind: 'activation', tag: Game.DIALOG, window });
  }

  drawMonster(monster: Quest.Monster, displayHealth: boolean): void {
    openWindow({ kind: 'monster-image', tag: Game.DIALOG, monster, displayHealth });
  }

  displayTransitionWindow(phase: Quest.MoMPhase): void {
    openWindow({ kind: 'transition', tag: Game.TRANSITION, phase });
  }

  shopInterface(shop: ShopInterface): void {
    this.tags.add(Game.SHOP);
    update({ shop });
  }

  endGameScreen(): void {
    openWindow({ kind: 'end', tag: Game.ENDGAME });
  }

  mainMenuScreen(): void {
    // Not in Valkyrie: a test from the editor that ends goes back to the editor (ui/editorTest.ts), once what ended it is done
    const test = editorTest();
    if (test !== null) {
      setTimeout(() => run(() => test.back()), 0);
      return;
    }
    openMainMenu();
  }

  questSelectionScreen(): void {
    openQuestSelection();
  }

  // The list reads each quest's state when it draws, so its button changes with it
  updateQuestButton(): void {
    update();
  }

  contentSelectDownloadScreen(): void {
    openContentSelectDownload();
  }

  questDetailsScreen(quest: QuestData.Quest): void {
    openQuestDetails(quest);
  }

  // The editor opens its screen itself (editor/EditorScreen.tsx openQuest). Not in Valkyrie: a test that the engine
  // takes back to the editor (the game menu's Editor, the class selection's Back) shows it again with its history
  // (ui/editorTest.ts), once that way is done
  questEditorScreen(): void {
    const test = editorTest();
    if (test !== null) setTimeout(() => run(() => test.back()), 0);
  }

  // The picture is taken once the board has drawn its frame, as IETakeScreenshot waits for the end of Unity's
  takeScreenshot(done: (png: Uint8Array | null) => void): void {
    void boardScreenshot().then(
      (png) => run(() => done(png)),
      () => run(() => done(null)),
    );
  }
}
