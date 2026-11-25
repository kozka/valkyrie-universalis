// Public entry point of the engine. Game is imported first so that module cycles resolve in a safe order.
export { Game } from './Game.ts';
export { Audio } from './Audio.ts';
export { ConfigFile } from './ConfigFile.ts';
export { Destroyer } from './Destroyer.ts';
export { GameStateManager } from './GameStateManager.ts';
export { HeadlessUI, type GameUI } from './GameUI.ts';
export { HTTPManager, type HTTPReply } from './HTTPManager.ts';
export { NoGameType, type GameType } from './GameType.ts';
export { DefaultGameProvider, type IGameProvider } from './IGameProvider.ts';
export { SaveData, SaveManager } from './SaveManager.ts';
export { PublishedGameStats, STATS_FORM_URL, StatsManager, type ScenarioStats } from './StatsManager.ts';
export { ValkyrieConstants } from './ValkyrieConstants.ts';
export { VersionManager } from './VersionManager.ts';
export { ZipManager, Extract_mode } from './ZipManager.ts';

export { FFGImport } from './FFGAppImport/FFGAppImport.ts';
export { FetchContent } from './FFGAppImport/AssetImport/FetchContent.ts';

export { IniData, IniRead } from './ValkyrieTools/IniRead.ts';
export { ValkyrieDebug } from './ValkyrieTools/ValkyrieDebug.ts';

export { CommonStringKeys } from './Content/CommonStringKeys.ts';
export { ContentData } from './Content/ContentData.ts';
export {
  ContentLoader,
  TypedContentLoader,
  type IContentLoader,
} from './Content/ContentLoader.ts';
export { ContentPack } from './Content/ContentPack.ts';
export * from './Content/ContentTypes.ts';
export { DictionaryI18n } from './Content/DictionaryI18n.ts';
export { ExtractManager } from './Content/ExtractManager.ts';
export { QuestFormat } from './Content/FormatVersions.ts';
export type { ContentType, IContent } from './Content/IContent.ts';
export type { ITestable } from './Content/ITestable.ts';
export { LocalizationRead } from './Content/LocalizationRead.ts';
export { ManifestManager } from './Content/ManifestManager.ts';
export { PerilData } from './Content/PerilData.ts';
export { QuestButtonAction, QuestButtonData, QuestButtonDataSerializer } from './Content/QuestButtonData.ts';
export { QuestAndContentPackDownload } from './Content/QuestAndContentPackDownload.ts';
export { QuestData } from './Content/QuestData.ts';
export { QuestLoader } from './Content/QuestLoader.ts';
export { QuestListMode, QuestsManager } from './Content/QuestsManager.ts';
export { RemoteContentPack } from './Content/RemoteContentPack.ts';
export { RemoteContentPackListMode, RemoteContentPackManager } from './Content/RemoteContentPackManager.ts';
export { StringKey } from './Content/StringKey.ts';
export { TextAlignment, TextAlignmentUtils } from './Content/TextAlignment.ts';

export { Quest } from './Quest/Quest.ts';
export { ActivateDialog } from './Quest/ActivateDialog.ts';
export { ActivateDialogMoM, type ActivationStep } from './Quest/ActivateDialogMoM.ts';
export { ChangePhaseWindow } from './Quest/ChangePhaseWindow.ts';
export { GameMenu } from './Quest/GameMenu.ts';
export { HorrorCheck } from './Quest/HorrorCheck.ts';
export { InfoDialog } from './Quest/InfoDialog.ts';
export { InventoryWindow } from './Quest/InventoryWindow.ts';
export { InventoryWindowMoM } from './Quest/InventoryWindowMoM.ts';
export { InvestigatorAttack } from './Quest/InvestigatorAttack.ts';
export { InvestigatorEvade } from './Quest/InvestigatorEvade.ts';
export { LogWindow } from './Quest/LogWindow.ts';
export { MonsterDialog } from './Quest/MonsterDialog.ts';
export { MonsterDialogMoM, type MonsterRedraw } from './Quest/MonsterDialogMoM.ts';
export { SetWindow } from './Quest/SetWindow.ts';
export { CameraController } from './Quest/CameraController.ts';
export { DialogWindow, type DialogButton } from './Quest/DialogWindow.ts';
export { EventManager, type EventCause, type StartedEvent } from './Quest/EventManager.ts';
export { HeroCanvas } from './Quest/HeroCanvas.ts';
export { HeroDialog } from './Quest/HeroDialog.ts';
export { SkillWindow, type SkillOption } from './Quest/SkillWindow.ts';
export { HeroSelection } from './Quest/HeroSelection.ts';
export { InvestigatorItems } from './Quest/InvestigatorItems.ts';
export { MonsterCanvas } from './Quest/MonsterCanvas.ts';
export { MoraleDisplay } from './Quest/MoraleDisplay.ts';
export { NextStageButton } from './Quest/NextStageButton.ts';
export { Puzzle } from './Quest/Puzzle.ts';
export { PuzzleCode } from './Quest/PuzzleCode.ts';
export { PuzzleImage } from './Quest/PuzzleImage.ts';
export { PuzzleSlide } from './Quest/PuzzleSlide.ts';
export { PuzzleTower } from './Quest/PuzzleTower.ts';
export { PuzzleCodeWindow } from './Quest/PuzzleCodeWindow.ts';
export { PuzzleImageWindow, type PieceRect } from './Quest/PuzzleImageWindow.ts';
export { PuzzleSlideWindow } from './Quest/PuzzleSlideWindow.ts';
export { PuzzleTowerWindow } from './Quest/PuzzleTowerWindow.ts';
export { QuestActivation, QuestMonster } from './Quest/QuestMonster.ts';
export { QuestLog } from './Quest/QuestLog.ts';
export { RoundController } from './Quest/RoundController.ts';
export { ShopInterface } from './Quest/ShopInterface.ts';
export { TokenBoard } from './Quest/TokenBoard.ts';
export { VarManager } from './Quest/VarManager.ts';
export { VarOperation, VarTests, VarTestsComponent, VarTestsLogicalOperator, VarTestsParenthesis } from './Quest/VarTests.ts';

export { ClassSelectionScreen, type ClassOption } from './UI/Screens/ClassSelectionScreen.ts';
export { ColorUtil } from './UI/ColorUtil.ts';

// The scenario editor's rules (its screens are the app's)
export { ComponentText, type TextProblem, type TextTarget } from './QuestEditor/ComponentText.ts';
export { EditorComponent, type EditorHighlight } from './QuestEditor/EditorComponent.ts';
export { EditorComponentActivation, type ActivationText } from './QuestEditor/EditorComponentActivation.ts';
export { EditorComponentCustomMonster } from './QuestEditor/EditorComponentCustomMonster.ts';
export { EditorComponentDoor } from './QuestEditor/EditorComponentDoor.ts';
export { EditorComponentEvent, type EditorChoice, type EventPreview } from './QuestEditor/EditorComponentEvent.ts';
export { EditorComponentItem } from './QuestEditor/EditorComponentItem.ts';
export { EditorComponentMPlace } from './QuestEditor/EditorComponentMPlace.ts';
export { EditorComponentPuzzle } from './QuestEditor/EditorComponentPuzzle.ts';
export { EditorComponentQuest, type QuestText } from './QuestEditor/EditorComponentQuest.ts';
export { ProblemFixes, type ProblemFix } from './QuestEditor/ProblemFixes.ts';
export { EditorComponentSpawn } from './QuestEditor/EditorComponentSpawn.ts';
export { EditorComponentTile } from './QuestEditor/EditorComponentTile.ts';
export { EditorComponentToken } from './QuestEditor/EditorComponentToken.ts';
export { EditorComponentUI } from './QuestEditor/EditorComponentUI.ts';
export { ASSIGN_OPERATIONS, EditorComponentVarTestsUtil, TEST_OPERATIONS } from './QuestEditor/EditorComponentVarTestsUtil.ts';
export { EditorTools } from './QuestEditor/EditorTools.ts';
export { QuestEditSelection } from './QuestEditor/QuestEditSelection.ts';
export { QuestEditor, type QuestFiles } from './QuestEditor/QuestEditor.ts';
export { QuestEditorHistory } from './QuestEditor/QuestEditorHistory.ts';
export { QuestEditorTexts, type TextRow, type TextsByLanguage } from './QuestEditor/QuestEditorTexts.ts';
export { QuestEditorVersions, type QuestVersion } from './QuestEditor/QuestEditorVersions.ts';
export { QUEST_SELECTION, QuestEditorData } from './QuestEditor/QuestEditorData.ts';
export { ReorderComponents } from './QuestEditor/ReorderComponents.ts';
export {
  SelectionTraits,
  componentItem,
  contentItem,
  fileItem,
  newComponentItem,
  type SelectionItem,
  type SelectionTrait,
  type SelectionTraitGroup,
} from './QuestEditor/SelectionTraits.ts';
export { ToolsButton, type TestOptions } from './QuestEditor/ToolsButton.ts';
// The editor's checks, not ported: Valkyrie's Validate does nothing (QuestEditor/checks)
export { checkPackage } from './QuestEditor/checks/PackageChecks.ts';
export { problemSignature, type Problem, type ProblemLevel } from './QuestEditor/checks/Problem.ts';
export { checkQuest, readQuestForChecks, type QuestCheckInput } from './QuestEditor/checks/QuestChecks.ts';
export { QuestGraph, endsGame, type Link, type LinkKind, type VariableUse } from './QuestEditor/checks/QuestGraph.ts';
export { ScenarioFiles } from './QuestEditor/checks/ScenarioFiles.ts';

export { Application } from './platform/Application.ts';
export { Color } from './platform/Color.ts';
// .NET semantics for ported code in the game modules (Split, Substring, Dictionary and List indexers…)
export * from './platform/CSharp.ts';
export { GameObject, Image, Transform } from './platform/GameObject.ts';
export { Mathf } from './platform/Mathf.ts';
export { netAdd, netRemove, netSet } from './platform/NetDictionary.ts';
export { Random } from './platform/Random.ts';
export { Resources } from './platform/Resources.ts';
export { bitConverterToString, sha256 } from './platform/Sha256.ts';
export { Stack } from './platform/Stack.ts';
export { STAND_IN_SIZE, isStandIn, standInFile } from './platform/StandInFile.ts';
export {
  Directory,
  DirectoryNotFoundException,
  File,
  FileNotFoundException,
  IOException,
  Path,
  SearchOption,
  fileSystem,
  setFileSystem,
} from './platform/SystemIO.ts';
export { ValkyrieFatalError } from './platform/ValkyrieFatalError.ts';
export { Texture2D, type TexturePixels } from './platform/Texture2D.ts';
export { Vector2 } from './platform/Vector2.ts';
export { Vector3 } from './platform/Vector3.ts';
export { VirtualFileSystem, normalizePath, pathKey, type CaseMismatch, type FileSource, type FileSystemChange } from './platform/VirtualFileSystem.ts';
export {
  ZipFormatError,
  canCopyZipEntry,
  copyZipEntries,
  locateZipDirectory,
  readCentralDirectory,
  readZip64Record,
  readZipDirectory,
  readZipEntry,
  type ZipCopy,
  type ZipDirectoryLocation,
  type ZipEntry,
} from './platform/Zip.ts';
