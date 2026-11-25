// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Game.cs
// Only the engine side of Game. Canvases, Unity callbacks and screens are rebuilt in the app, which draws through ui.
// Game.get() is the same global accessor as in C#: the host installs the current game with Game.game = ...
// It stays null in unit tests, as Game.Get() does in Valkyrie's EditMode tests.
// What Unity finds in the scene or Awake creates (camera, canvases, audio, config, round controller) is created here.
import { Audio } from './Audio.ts';
import { ConfigFile } from './ConfigFile.ts';
import { AudioData } from './Content/ContentTypes.ts';
import { ContentData } from './Content/ContentData.ts';
import { ContentLoader } from './Content/ContentLoader.ts';
import { ExtractManager } from './Content/ExtractManager.ts';
import { LocalizationRead } from './Content/LocalizationRead.ts';
import type { QuestData } from './Content/QuestData.ts';
import type { QuestsManager } from './Content/QuestsManager.ts';
import type { RemoteContentPackManager } from './Content/RemoteContentPackManager.ts';
import { Destroyer } from './Destroyer.ts';
import { HeadlessUI, type GameUI } from './GameUI.ts';
import { NoGameType, type GameType } from './GameType.ts';
import { Application } from './platform/Application.ts';
import { isNullOrEmpty } from './platform/CSharp.ts';
import { Path } from './platform/SystemIO.ts';
import { CameraController } from './Quest/CameraController.ts';
import { HeroCanvas } from './Quest/HeroCanvas.ts';
import { HeroSelection } from './Quest/HeroSelection.ts';
import { MonsterCanvas } from './Quest/MonsterCanvas.ts';
import type { LogWindow } from './Quest/LogWindow.ts';
import type { MoraleDisplay } from './Quest/MoraleDisplay.ts';
import type { QuestEditorData } from './QuestEditor/QuestEditorData.ts';
import { NextStageButton } from './Quest/NextStageButton.ts';
import { Quest } from './Quest/Quest.ts';
import { RoundController } from './Quest/RoundController.ts';
import { TokenBoard } from './Quest/TokenBoard.ts';
import { StatsManager } from './StatsManager.ts';
import { ValkyrieConstants } from './ValkyrieConstants.ts';
import { ValkyrieDebug } from './ValkyrieTools/ValkyrieDebug.ts';

// General controller for the game
// Valkyrie: Game.cs Game
export class Game {
  static readonly MONSTERS = 'monsters';
  static readonly HEROSELECT = 'heroselect';
  static readonly BOARD = 'board';
  static readonly QUESTUI = 'questui';
  static readonly CONTENTPACKUI = 'contentpackui';
  static readonly QUESTLIST = 'questlist';
  static readonly CONTENTPACKLIST = 'contentpacklist';
  static readonly EDITOR = 'editor';
  static readonly UIPHASE = 'uiphase';
  static readonly TRANSITION = 'transition';
  static readonly DIALOG = 'dialog';
  /**
   * Not in Valkyrie (17 October 2026): called with a scenario's package just extracted to start it, before the quest
   * reads it, so that the app can add the player's own translation to that copy (host/customTranslation.ts).
   */
  static onQuestExtracted: ((q: QuestData.Quest) => void) | null = null;
  static readonly SETWINDOW = 'setwindow';
  static readonly ACTIVATION = 'activation';
  static readonly SHOP = 'shop';
  static readonly ENDGAME = 'endgame';
  static readonly BG_TASKS = 'bg_tasks';
  static readonly LOGS = 'logs';
  static readonly DIALOG_PART = 'dialogPart';

  // This is a reference to the Game object
  static game: Game | null = null;

  // This is populated at run time from the text asset
  version = '';

  private _cd: ContentData | null = null;
  private _contentLoader: ContentLoader | null = null;

  // Data included in content packs
  get cd(): ContentData {
    return this._cd as ContentData;
  }

  set cd(value: ContentData) {
    this._cd = value;
    this._contentLoader = new ContentLoader(value);
  }

  get contentLoader(): ContentLoader {
    return this._contentLoader as ContentLoader;
  }

  /** Not in Valkyrie: the app's drawing of windows, screens and board objects (HeadlessUI until the host sets one). */
  ui: GameUI = new HeadlessUI();

  // Class for management of tokens on the board
  tokenBoard = new TokenBoard();
  // Class for management of hero selection panel
  heroCanvas = new HeroCanvas();
  // Class for management of monster selection panel
  monsterCanvas = new MonsterCanvas();
  // Class for Morale counter
  moraleDisplay: MoraleDisplay | null = null;
  // Class for gameType information (controls specific to a game type)
  gameType: GameType = new NoGameType();
  // Class for camera management (zoom, scroll)
  cc = new CameraController();
  // Class for managing user configuration
  config = new ConfigFile();
  // Class for progress of activations, rounds
  roundControl: RoundController = new RoundController();
  // Class for stage control UI
  stageUI: NextStageButton | null = null;
  // The log window, when open (Update toggles its developer view)
  logWindow: LogWindow | null = null;
  // Class for stage control UI
  audioControl = new Audio();
  // Transparecny value for non selected component in the editor
  editorTransparency = 0.3;
  // Quest started as test from editor
  testMode = false;

  private quest: Quest | null = null;

  // Valkyrie: Game.cs Game.CurrentQuest
  get currentQuest(): Quest | null {
    return this.quest;
  }

  set currentQuest(value: Quest | null) {
    this.quest = value;
    if (value?.qd?.quest?.defaultLanguage != null) {
      LocalizationRead.addRequiredLanguage(value.qd.quest.defaultLanguage);
    }
  }

  // Stats manager for quest rating (Game.Awake creates it; the store list fills it, see StatsManager)
  stats = new StatsManager();
  // Quests manager (created when a game type is selected, as GameSelectionScreen does)
  questsList: QuestsManager = null as unknown as QuestsManager;
  // Content Pack manager (created with questsList)
  remoteContentPackManager: RemoteContentPackManager = null as unknown as RemoteContentPackManager;

  // Current language
  currentLang: string = ValkyrieConstants.DefaultLanguage;

  // Fallback language for scenario content (empty = no fallback)
  fallbackLang = '';

  // Set when in quest editor
  editMode = false;
  // Editor selection data
  qed: QuestEditorData | null = null;

  // Debug option
  debugTests = false;

  /** Not in Valkyrie: packs chosen in the collection that the app leaves out, and packs it adds (DooM has a button of its own). */
  packsLeftOut: string[] = [];
  packsAdded: string[] = [];

  userRoot = '';

  /** The current game; typed as non-null like C#'s Game.Get(), but null until the host sets Game.game. */
  // Valkyrie: Game.cs Game.Get
  static get(): Game {
    return Game.game as Game;
  }

  // Valkyrie: Game.cs Game.CurrentQuestPath
  currentQuestPath(): string | null {
    return this.currentQuest?.originalPath ?? null;
  }

  // This is called by 'start quest' on the main menu
  // Valkyrie: Game.cs Game.SelectQuest
  selectQuest(): void {
    const packs = this.config.data.get(this.gameType.typeName() + 'Packs');
    if (packs !== null) {
      for (const key of packs.keys()) {
        if (this.packsLeftOut.includes(key)) continue;
        this.loadPackSafely(key);
      }
    }
    for (const key of this.packsAdded) this.loadPackSafely(key);

    // Pull up the quest selection page (Valkyrie creates QuestSelectionScreen once, then shows it again)
    this.ui.questSelectionScreen();
  }

  /** Not in Valkyrie (16 October 2026): a pack that throws while loading is logged and skipped, the others load. */
  private loadPackSafely(id: string): void {
    try {
      this.contentLoader.loadContentID(id);
    } catch (e) {
      ValkyrieDebug.log('Warning: Unable to load content pack ' + id + '\nException: ' + String(e));
    }
  }

  // This is called when a quest is selected
  // Valkyrie: Game.cs Game.StartQuest
  startQuest(q: QuestData.Quest): void {
    if (Path.getExtension(Path.getFileName(q.path)) === ValkyrieConstants.ScenarioDownloadContainerExtension) {
      // extract the full package
      ExtractManager.extractSinglePackageFull(ContentData.downloadPath() + Path.DirectorySeparatorChar + Path.getFileName(q.path));
      Game.onQuestExtracted?.(q);
    }

    // Fetch all of the quest data and initialise the quest
    this.currentQuest = new Quest(q);

    // Draw the hero icons, which are buttons for selection
    this.heroCanvas.setupUI();

    // The finished button (endSelection), the title and the back button
    this.ui.heroSelectionScreen();

    this.heroCanvas.heroSelection = new HeroSelection();
  }

  // HeroCanvas validates selection and starts quest if everything is good
  // Valkyrie: Game.cs Game.EndSelection
  endSelection(): void {
    // Count up how many heros have been selected
    let count = 0;
    for (const h of Game.get().currentQuest!.heroes) {
      if (h.heroData !== null) count++;
    }
    // Starting morale is number of heros
    this.currentQuest!.vars.setValue('$%morale', count);
    // This validates the selection then if OK starts first quest event
    this.heroCanvas.endSection();
  }

  // Valkyrie: Game.cs Game.QuestStartEvent
  questStartEvent(): void {
    this.playDefaultQuestMusic();

    Destroyer.dialog();
    // Create the menu button (MenuButton, LogButton, SkillButton and InventoryButton)
    this.ui.questButtons();
    // Draw next stage button if required
    this.stageUI = new NextStageButton();

    // Start round events
    this.currentQuest!.eManager.eventTriggerType('StartRound', false);
    // Start the quest (top of stack)
    this.currentQuest!.eManager.eventTriggerType('EventStart', false);
    this.currentQuest!.eManager.triggerEvent();
  }

  // Valkyrie: Game.cs Game.PlayDefaultQuestMusic
  playDefaultQuestMusic(): void {
    const music = this.getDefaultQuestMusic();
    this.audioControl.playDefaultQuestMusic(music);
  }

  // Valkyrie: Game.cs Game.GetDefaultQuestMusic
  private getDefaultQuestMusic(): string[] {
    const music: string[] = [];
    //If default quest music  has been turned off do not add any audio files to the list
    if (this.currentQuest!.defaultMusicOn) {
      // Start quest music
      for (const ad of this.cd.values(AudioData)) {
        if (ad.containsTrait('quest')) music.push(ad.file);
      }
    }

    return music;
  }

  // Valkyrie: Game.cs Game.AppData
  static appData(): string {
    if (Game.get() != null && !isNullOrEmpty(Game.get().userRoot)) {
      return Game.get().userRoot;
    }
    return Game.defaultAppData();
  }

  // Valkyrie: Game.cs Game.DefaultAppData
  static defaultAppData(): string {
    return Path.combine(Application.applicationDataPath, 'Valkyrie');
  }
}
