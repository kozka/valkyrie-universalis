// The drawing side of Valkyrie's Unity code: the app implements GameUI with React and PixiJS.
// Not ported from Valkyrie. The engine keeps Valkyrie's classes and their rules (DialogWindow, HeroCanvas, TokenBoard…)
// and calls game.ui wherever Valkyrie draws, opens a window or destroys objects by tag. Each method names the Valkyrie
// code it stands for. HeadlessUI draws nothing, for unit tests and the battery, and keeps what they need to play on.
import type { ItemData } from './Content/ContentTypes.ts';
import type { QuestData } from './Content/QuestData.ts';
import type { GameObject } from './platform/GameObject.ts';
import type { Texture2D } from './platform/Texture2D.ts';
import type { ActivateDialog } from './Quest/ActivateDialog.ts';
import type { ActivateDialogMoM } from './Quest/ActivateDialogMoM.ts';
import type { DialogWindow } from './Quest/DialogWindow.ts';
import type { HeroDialog } from './Quest/HeroDialog.ts';
import type { HeroSelection } from './Quest/HeroSelection.ts';
import type { HorrorCheck } from './Quest/HorrorCheck.ts';
import type { InfoDialog } from './Quest/InfoDialog.ts';
import type { InventoryWindow } from './Quest/InventoryWindow.ts';
import type { InventoryWindowMoM } from './Quest/InventoryWindowMoM.ts';
import type { InvestigatorAttack } from './Quest/InvestigatorAttack.ts';
import type { InvestigatorEvade } from './Quest/InvestigatorEvade.ts';
import type { InvestigatorItems } from './Quest/InvestigatorItems.ts';
import type { LogWindow } from './Quest/LogWindow.ts';
import type { MonsterDialog } from './Quest/MonsterDialog.ts';
import type { MonsterDialogMoM } from './Quest/MonsterDialogMoM.ts';
import type { MoraleDisplay } from './Quest/MoraleDisplay.ts';
import type { NextStageButton } from './Quest/NextStageButton.ts';
import type { PuzzleCodeWindow } from './Quest/PuzzleCodeWindow.ts';
import type { PuzzleImageWindow } from './Quest/PuzzleImageWindow.ts';
import type { PuzzleSlideWindow } from './Quest/PuzzleSlideWindow.ts';
import type { PuzzleTowerWindow } from './Quest/PuzzleTowerWindow.ts';
import type { Quest } from './Quest/Quest.ts';
import type { SetWindow } from './Quest/SetWindow.ts';
import type { ShopInterface } from './Quest/ShopInterface.ts';
import type { SkillWindow } from './Quest/SkillWindow.ts';
import type { TokenBoard } from './Quest/TokenBoard.ts';
import type { ClassSelectionScreen } from './UI/Screens/ClassSelectionScreen.ts';

export interface GameUI {
  // Valkyrie: GameObject.FindGameObjectWithTag(tag) != null (tags are the Game constants: Game.DIALOG, Game.SHOP…)
  findTag(tag: string): boolean;
  // Valkyrie: foreach (GameObject go in GameObject.FindGameObjectsWithTag(tag)) Object.Destroy(go)
  destroyTag(tag: string): void;

  // Valkyrie: Audio.cs Audio.PlayMusic(List<string>, bool), the coroutine that loads and plays music
  audioPlayMusic(fileNames: string[], isDefaultQuestMusic: boolean): void;
  // Valkyrie: Audio.cs Audio.PlayEffect
  audioPlayEffect(fileName: string): void;
  // Valkyrie: Audio.cs Audio.StopAudioEffect
  audioStopAudioEffect(): void;

  // Valkyrie: Quest/HeroCanvas.cs HeroCanvas.SetupUI, Clean, UpdateStatus and UpdateImages
  heroCanvasSetupUI(): void;
  heroCanvasClean(): void;
  heroCanvasUpdateStatus(): void;
  heroCanvasUpdateImages(): void;
  // Valkyrie: Quest/HeroDialog.cs HeroDialog.HeroDialog
  heroDialog(dialog: HeroDialog): void;
  // Valkyrie: Game.cs Game.StartQuest (the finished and back buttons and the title of the hero selection)
  heroSelectionScreen(): void;
  // Valkyrie: Quest/HeroSelection.cs HeroSelection.Draw and HeroSelection.Update
  heroSelection(selection: HeroSelection): void;
  // Valkyrie: UI/Screens/ClassSelectionScreen.cs ClassSelectionScreen.Draw
  classSelectionScreen(screen: ClassSelectionScreen): void;
  // Valkyrie: Quest/InvestigatorItems.cs InvestigatorItems.InvestigatorItems (its finished button calls game.questStartEvent)
  investigatorItems(window: InvestigatorItems): void;
  // Valkyrie: Game.cs Game.QuestStartEvent (MenuButton, LogButton, SkillButton and InventoryButton)
  questButtons(): void;

  // Valkyrie: Quest/MonsterCanvas.cs MonsterCanvas.UpdateList and UpdateStatus (the icons, from game.monsterCanvas.offset)
  monsterCanvasUpdateList(): void;
  monsterCanvasUpdateStatus(): void;
  // Valkyrie: Quest/MonsterDialog.cs MonsterDialog.CreateWindow (Descent)
  monsterDialog(dialog: MonsterDialog): void;
  // Valkyrie: Quest/MonsterDialogMoM.cs MonsterDialogMoM.CreateWindow (its buttons; DrawMonster is drawMonster)
  monsterDialogMoM(dialog: MonsterDialogMoM): void;
  // Valkyrie: Quest/InvestigatorAttack.cs InvestigatorAttack.AttackOptions and Attack
  investigatorAttack(attack: InvestigatorAttack): void;
  // Valkyrie: Quest/InvestigatorEvade.cs InvestigatorEvade.Draw
  investigatorEvade(evade: InvestigatorEvade): void;
  // Valkyrie: Quest/HorrorCheck.cs HorrorCheck.Draw
  horrorCheck(check: HorrorCheck): void;
  // Valkyrie: Quest/InfoDialog.cs InfoDialog.InfoDialog
  infoDialog(dialog: InfoDialog): void;
  // Valkyrie: Quest/InventoryWindowMoM.cs InventoryWindowMoM.Update
  inventoryWindowMoM(window: InventoryWindowMoM): void;
  // Valkyrie: Quest/InventoryWindow.cs InventoryWindow.Update (Descent: items and gold)
  inventoryWindow(window: InventoryWindow): void;
  // Valkyrie: Quest/SkillWindow.cs SkillWindow.Update (Descent: each hero's skills, from window.hero)
  skillWindow(window: SkillWindow): void;
  // Valkyrie: Quest/SetWindow.cs SetWindow.SetWindow (tag setwindow)
  setWindow(window: SetWindow): void;
  // Valkyrie: Quest/LogWindow.cs LogWindow.Update (tag logs)
  logWindow(window: LogWindow): void;
  // Valkyrie: Quest/GameMenu.cs GameMenu.Draw
  gameMenu(): void;
  // Valkyrie: UI/Screens/SaveSelectScreen.cs SaveSelectScreen.SaveSelectScreen (save, or load)
  saveSelectScreen(save: boolean): void;
  // Valkyrie: Quest/MoraleDisplay.cs MoraleDisplay.MoraleDisplay and Update
  moraleDisplay(display: MoraleDisplay): void;
  // Valkyrie: Quest/NextStageButton.cs NextStageButton.Update (the button bar of MoM)
  nextStageButton(button: NextStageButton): void;
  // Valkyrie: Quest/TokenBoard.cs TokenBoard.TokenControl.TokenControl (makes a token, door or UI clickable)
  tokenBoardAdd(control: TokenBoard.TokenControl): void;

  // Valkyrie: gameObject.transform.SetParent(game.boardCanvas.transform) (tiles)
  boardCanvasAdd(gameObject: GameObject): void;
  // Valkyrie: gameObject.transform.SetParent(game.tokenCanvas.transform) (tokens, doors, monster places, highlights)
  tokenCanvasAdd(gameObject: GameObject): void;
  // Valkyrie: Quest.cs Quest.UI.UI (a quest UI element, laid out on the screen from its QuestData.UI)
  questUICanvasAdd(component: Quest.UI): void;
  // Valkyrie: Object.Destroy(gameObject)
  destroyObject(gameObject: GameObject): void;

  // Valkyrie: Quest/DialogWindow.cs DialogWindow.CreateWindow
  dialogWindow(window: DialogWindow): void;
  // Valkyrie: Quest/DialogWindow.cs DialogWindow.CreateQuotaWindow
  dialogQuotaWindow(window: DialogWindow): void;
  // Valkyrie: Quest/DialogWindow.cs DialogWindow.DrawItem (the picture and name of the item an event gives; null texture when the picture is missing, not in Valkyrie)
  dialogItem(window: DialogWindow, item: ItemData, texture: Texture2D | null): void;
  // Valkyrie: Quest/PuzzleCodeWindow.cs PuzzleCodeWindow.CreateWindow and GuessAdd
  puzzleCodeWindow(window: PuzzleCodeWindow): void;
  // Valkyrie: Quest/PuzzleSlideWindow.cs PuzzleSlideWindow.CreateWindow
  puzzleSlideWindow(window: PuzzleSlideWindow): void;
  // Valkyrie: Quest/PuzzleImageWindow.cs PuzzleImageWindow.CreateWindow
  puzzleImageWindow(window: PuzzleImageWindow): void;
  // Valkyrie: Quest/PuzzleTowerWindow.cs PuzzleTowerWindow.CreateWindow
  puzzleTowerWindow(window: PuzzleTowerWindow): void;
  // Valkyrie: Quest/ActivateDialog.cs ActivateDialog.CreateWindow (tag activation)
  activateDialog(dialog: ActivateDialog): void;
  // Valkyrie: Quest/ActivateDialogMoM.cs ActivateDialogMoM.CreateWindow, CreateAttackWindow and CreateMoveWindow
  activateDialogMoM(dialog: ActivateDialogMoM): void;
  // Valkyrie: Quest/MonsterDialogMoM.cs MonsterDialogMoM.DrawMonster
  drawMonster(monster: Quest.Monster, displayHealth: boolean): void;
  // Valkyrie: Quest/ChangePhaseWindow.cs ChangePhaseWindow.DisplayTransitionWindow
  displayTransitionWindow(phase: Quest.MoMPhase): void;
  // Valkyrie: Quest/ShopInterface.cs ShopInterface.DrawButtons, DrawShopItems, DrawPartyItems and DrawGold
  shopInterface(shop: ShopInterface): void;
  // Valkyrie: UI/Screens/EndGameScreen.cs EndGameScreen.EndGameScreen
  endGameScreen(): void;
  // Valkyrie: UI/Screens/MainMenuScreen.cs MainMenuScreen.MainMenuScreen
  mainMenuScreen(): void;
  // Valkyrie: Game.cs Game.SelectQuest (new QuestSelectionScreen, or questSelectionScreen.Show())
  questSelectionScreen(): void;
  // Valkyrie: UI/Screens/QuestSelectionScreen.cs QuestSelectionScreen.UpdateQuestButton (after a download)
  updateQuestButton(key: string): void;
  // Valkyrie: UI/Screens/ContentSelectDownloadScreen.cs ContentSelectDownloadScreen.ContentSelectDownloadScreen
  contentSelectDownloadScreen(): void;
  // Valkyrie: GameStateManager.cs GameStateManager.Quest.Restart (new QuestDetailsScreen)
  questDetailsScreen(quest: QuestData.Quest): void;
  // Valkyrie: QuestEditor/QuestEditor.cs QuestEditor.Begin (new MenuButton and new ToolsButton: the editor's screen)
  questEditorScreen(): void;
  // Valkyrie: Quest/CameraController.cs CameraController.TakeScreenshot, with SaveManager.ResizeScreenShotTexture: a PNG
  // of the screen at 4/30 of its size once the frame is drawn, or null when there is nothing to take
  takeScreenshot(done: (png: Uint8Array | null) => void): void;
}

/** Draws nothing. Keeps the open tags and the last window of each kind, so tests and the battery can answer them. */
export class HeadlessUI implements GameUI {
  /** Tags that have objects on screen, as Valkyrie would tag them. */
  readonly tags = new Set<string>();
  lastDialog: DialogWindow | null = null;
  lastInvestigatorItems: InvestigatorItems | null = null;
  lastClassSelection: ClassSelectionScreen | null = null;
  lastHeroSelection: HeroSelection | null = null;
  lastQuestDetails: QuestData.Quest | null = null;
  /** The last window of the play screens, whichever kind, and the monster drawn with it. */
  lastWindow: object | null = null;
  lastMonsterDrawn: Quest.Monster | null = null;
  transitions: Quest.MoMPhase[] = [];
  screenshots = 0;
  mainMenus = 0;
  questSelections = 0;
  /** The quests whose button UpdateQuestButton drew again, in order. */
  questButtonUpdates: string[] = [];
  contentSelectDownloads = 0;
  endGames = 0;
  editorScreens = 0;

  /** Whether the log window's lines are on screen, which are tagged dialog (LogWindow.drawsDialog). */
  private logLines = false;

  findTag(tag: string): boolean {
    return this.tags.has(tag) || (tag === 'dialog' && this.logLines);
  }

  destroyTag(tag: string): void {
    this.tags.delete(tag);
    if (tag === 'dialog' || tag === 'logs') this.logLines = false;
    if (tag === 'dialog') {
      this.lastDialog = null;
      this.lastWindow = null;
      this.lastMonsterDrawn = null;
    }
  }

  private open(tag: string, window: object | null = null): void {
    this.tags.add(tag);
    if (window !== null) this.lastWindow = window;
  }

  audioPlayMusic(): void {}
  audioPlayEffect(): void {}
  audioStopAudioEffect(): void {}

  heroCanvasSetupUI(): void {}
  heroCanvasClean(): void {}
  heroCanvasUpdateStatus(): void {}
  heroCanvasUpdateImages(): void {}

  heroDialog(dialog: HeroDialog): void {
    this.open('dialog', dialog);
  }

  heroSelectionScreen(): void {
    this.tags.add('heroselect');
  }

  heroSelection(selection: HeroSelection): void {
    this.tags.add('heroselect');
    this.lastHeroSelection = selection;
  }

  classSelectionScreen(screen: ClassSelectionScreen): void {
    this.tags.add('heroselect');
    this.lastClassSelection = screen;
  }

  investigatorItems(window: InvestigatorItems): void {
    this.tags.add('dialog');
    this.lastInvestigatorItems = window;
  }

  questButtons(): void {
    this.tags.add('questui');
  }

  monsterCanvasUpdateList(): void {
    this.tags.add('monsters');
  }

  monsterCanvasUpdateStatus(): void {}

  monsterDialog(dialog: MonsterDialog): void {
    this.open('dialog', dialog);
  }

  monsterDialogMoM(dialog: MonsterDialogMoM): void {
    this.open('dialog', dialog);
  }

  investigatorAttack(attack: InvestigatorAttack): void {
    this.open('dialog', attack);
  }

  investigatorEvade(evade: InvestigatorEvade): void {
    this.open('dialog', evade);
  }

  horrorCheck(check: HorrorCheck): void {
    this.open('dialog', check);
  }

  infoDialog(dialog: InfoDialog): void {
    this.open('dialog', dialog);
  }

  inventoryWindowMoM(window: InventoryWindowMoM): void {
    this.open('dialog', window);
  }

  inventoryWindow(window: InventoryWindow): void {
    this.open('dialog', window);
  }

  skillWindow(window: SkillWindow): void {
    this.open('dialog', window);
  }

  setWindow(window: SetWindow): void {
    this.open('setwindow', window);
  }

  logWindow(window: LogWindow): void {
    this.open('logs', window);
    this.logLines ||= window.drawsDialog();
  }

  gameMenu(): void {
    this.open('dialog');
  }

  saveSelectScreen(): void {
    this.open('dialog');
  }

  moraleDisplay(): void {
    this.tags.add('questui');
  }

  nextStageButton(): void {
    this.tags.add('uiphase');
  }

  tokenBoardAdd(): void {}

  boardCanvasAdd(gameObject: GameObject): void {
    this.tags.add(gameObject.tag);
  }

  tokenCanvasAdd(gameObject: GameObject): void {
    this.tags.add(gameObject.tag);
  }

  questUICanvasAdd(): void {
    this.tags.add('board');
  }

  destroyObject(): void {}

  dialogWindow(window: DialogWindow): void {
    this.tags.add('dialog');
    this.lastDialog = window;
  }

  dialogQuotaWindow(window: DialogWindow): void {
    this.tags.add('dialog');
    this.lastDialog = window;
  }

  dialogItem(): void {}

  puzzleCodeWindow(window: PuzzleCodeWindow): void {
    this.open('dialog', window);
  }

  puzzleSlideWindow(window: PuzzleSlideWindow): void {
    this.open('dialog', window);
  }

  puzzleImageWindow(window: PuzzleImageWindow): void {
    this.open('dialog', window);
  }

  puzzleTowerWindow(window: PuzzleTowerWindow): void {
    this.open('dialog', window);
  }

  // Descent's activation window is tagged 'activation', which HeroDialog and MonsterDialog look for
  activateDialog(dialog: ActivateDialog): void {
    this.open('activation', dialog);
  }

  activateDialogMoM(dialog: ActivateDialogMoM): void {
    this.open('dialog', dialog);
  }

  drawMonster(monster: Quest.Monster): void {
    this.tags.add('dialog');
    this.lastMonsterDrawn = monster;
  }

  displayTransitionWindow(phase: Quest.MoMPhase): void {
    this.tags.add('transition');
    this.transitions.push(phase);
  }

  shopInterface(): void {
    this.tags.add('shop');
  }

  endGameScreen(): void {
    this.tags.add('endgame');
    this.endGames++;
  }

  mainMenuScreen(): void {
    this.mainMenus++;
  }

  questSelectionScreen(): void {
    this.questSelections++;
  }

  updateQuestButton(key: string): void {
    this.questButtonUpdates.push(key);
  }

  contentSelectDownloadScreen(): void {
    this.contentSelectDownloads++;
  }

  questDetailsScreen(quest: QuestData.Quest): void {
    this.lastQuestDetails = quest;
  }

  questEditorScreen(): void {
    this.editorScreens++;
  }

  takeScreenshot(done: (png: Uint8Array | null) => void): void {
    this.screenshots++;
    done(null);
  }
}
