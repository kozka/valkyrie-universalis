// Undo and redo for the scenario editor. Not ported from Valkyrie, whose editor has neither. Each step keeps the texts
// that Save would write at that moment (QuestEditor.filesToSave), and going back to one loads them as Reload loads a
// quest, from a scratch folder: an undo gives exactly what saving and opening again would give, and the round trip
// (tools/battery/roundtrip.ts) checks that this changes nothing Valkyrie loads. The quest's own files are not touched.
import { LocalizationRead } from '../Content/LocalizationRead.ts';
import { QuestData } from '../Content/QuestData.ts';
import { Game } from '../Game.ts';
import { Application } from '../platform/Application.ts';
import { Directory, File, Path } from '../platform/SystemIO.ts';
import { QuestEditor, type QuestFiles } from './QuestEditor.ts';
import { QUEST_SELECTION } from './QuestEditorData.ts';

interface Step {
  /** What changed after this step, as the app names it (shown in Undo's tooltip). */
  label: string;
  files: QuestFiles;
  selection: string | null;
}

const SCRATCH = '/EditorHistory';
let scratchCount = 0;

export class QuestEditorHistory {
  private readonly undoSteps: Step[] = [];
  private readonly redoSteps: Step[] = [];
  /** How many steps back are kept. */
  readonly limit: number;

  constructor(limit = 100) {
    this.limit = limit;
  }

  /** Call before a change: keeps the quest as it is now, under the name of the change about to be made. */
  record(label: string): void {
    this.undoSteps.push(QuestEditorHistory.current(label));
    if (this.undoSteps.length > this.limit) this.undoSteps.shift();
    this.redoSteps.length = 0;
  }

  get canUndo(): boolean {
    return this.undoSteps.length > 0;
  }

  get canRedo(): boolean {
    return this.redoSteps.length > 0;
  }

  /** The name of the change Undo takes back, or null. */
  get undoLabel(): string | null {
    return this.undoSteps.at(-1)?.label ?? null;
  }

  /** The name of the change Redo makes again, or null. */
  get redoLabel(): string | null {
    return this.redoSteps.at(-1)?.label ?? null;
  }

  /** The names of the changes Undo takes back, the next one first (the editor's history panel). */
  get undoLabels(): string[] {
    return this.undoSteps.map((step) => step.label).reverse();
  }

  /** The names of the changes Redo makes again, the next one first. */
  get redoLabels(): string[] {
    return this.redoSteps.map((step) => step.label).reverse();
  }

  /** Goes back to the quest before the last recorded change; false when there is none or it could not be loaded. */
  undo(): boolean {
    const step = this.undoSteps.at(-1);
    if (step === undefined) return false;
    const now = QuestEditorHistory.current(step.label);
    if (!QuestEditorHistory.restore(step)) return false;
    this.undoSteps.pop();
    this.redoSteps.push(now);
    return true;
  }

  /** Makes again the change the last Undo took back. */
  redo(): boolean {
    const step = this.redoSteps.at(-1);
    if (step === undefined) return false;
    const now = QuestEditorHistory.current(step.label);
    if (!QuestEditorHistory.restore(step)) return false;
    this.redoSteps.pop();
    this.undoSteps.push(now);
    return true;
  }

  /** Forgets every step, as when another quest is opened or the quest is reloaded from its files. */
  clear(): void {
    this.undoSteps.length = 0;
    this.redoSteps.length = 0;
  }

  private static current(label: string): Step {
    return { label, files: QuestEditor.filesToSave(), selection: Game.get().qed?.selection ?? null };
  }

  /** Loads a step's texts and its selection. */
  private static restore(step: Step): boolean {
    if (!QuestEditorHistory.loadFiles(step.files)) return false;
    const game = Game.get();
    const quest = game.currentQuest!;
    if (game.qed !== null) {
      const selection = step.selection;
      game.qed.selection = selection !== null && (selection === QUEST_SELECTION || quest.qd.components.has(selection)) ? selection : QUEST_SELECTION;
    }
    return true;
  }

  /**
   * Loads these texts (as Save would write them) as the current quest's components and texts, keeping the quest's
   * folder: a step of the history, or a draft taken up again. False when they do not load.
   */
  static loadFiles(files: QuestFiles): boolean {
    const game = Game.get();
    const quest = game.currentQuest!;
    const realDir = Path.getDirectoryName(quest.qd.questPath)!;
    // The real folder's path inside the scratch one, so that a source like ../../shared.ini stays inside it
    const scratchRoot = SCRATCH + '/' + ++scratchCount;
    const dir = scratchRoot + realDir;
    const fatalBefore = Application.fatalErrors.length;
    const dictionaryBefore = LocalizationRead.selectDictionary('qst');
    try {
      for (const [file, text] of files.localization) File.writeAllText(dir + '/' + file, text);
      for (const [file, text] of files.data) File.writeAllText(Path.combine(dir, file), text);
      const loaded = new QuestData(dir + '/quest.ini');
      if (Application.fatalErrors.length > fatalBefore) {
        Application.fatalErrors.length = fatalBefore;
        LocalizationRead.dicts.set('qst', dictionaryBefore);
        return false;
      }
      const { path, identifier } = quest.qd.quest;
      quest.qd.components = loaded.components;
      quest.qd.questActivations = loaded.questActivations;
      quest.qd.quest = loaded.quest;
      quest.qd.quest.path = path;
      quest.qd.quest.identifier = identifier;
    } catch {
      Application.fatalErrors.length = fatalBefore;
      LocalizationRead.dicts.set('qst', dictionaryBefore);
      return false;
    } finally {
      if (Directory.exists(scratchRoot)) Directory.delete(scratchRoot, true);
    }

    // Draw the components again, as Reload does
    quest.removeAll();
    for (const name of quest.qd.components.keys()) quest.add(name);
    quest.changeAlphaAll();
    return true;
  }
}
