// The editor's text mode: a component, or the quest itself, as the lines of its section and of its texts in one
// language, as Save writes them, changed as text and then loaded again the way Reload loads the files, so that what
// the editor holds afterwards is what Valkyrie would read from such files. Not in Valkyrie, whose editor has no text
// mode.
import { QuestData } from '../Content/QuestData.ts';
import { Game } from '../Game.ts';
import { Application } from '../platform/Application.ts';
import { NewLine } from '../platform/CSharp.ts';
import { QuestEditor } from './QuestEditor.ts';
import { QUEST_SELECTION } from './QuestEditorData.ts';
import { QuestEditorHistory } from './QuestEditorHistory.ts';

/** A component, or the quest itself (its [Quest] section and its quest.* texts). */
export type TextTarget = QuestData.QuestComponent | QuestData.Quest;

/** Why lines cannot be taken as a component's, and on which line (1 is the first, 0 when none). */
export interface TextProblem {
  /**
   * EDITOR_TEXT_HEADER: no [name] first; EDITOR_TEXT_SECTION: another section; EDITOR_TEXT_KEY: not a text of the
   * component; EDITOR_TEXT_FIXED: the quest's format or game, which Save writes itself.
   */
  key: 'EDITOR_TEXT_HEADER' | 'EDITOR_TEXT_SECTION' | 'EDITOR_TEXT_KEY' | 'EDITOR_TEXT_FIXED';
  line: number;
}

/** The section's name: the component's, or Quest. */
function nameOf(target: TextTarget): string {
  return 'sectionName' in target ? target.sectionName : QUEST_SELECTION;
}

/** What its texts' keys start with. */
function prefixOf(target: TextTarget): string {
  return 'sectionName' in target ? target.sectionName + '.' : 'quest.';
}

/** What Save writes for the quest's format and game, whatever the lines say (QuestData.Quest.ToString). */
function fixedOf(target: TextTarget): Map<string, string> {
  if ('sectionName' in target) return new Map();
  return new Map([
    ['format', String(QuestData.Quest.currentFormat)],
    ['type', Game.get().gameType.typeName()],
  ]);
}

function lines(text: string): string[] {
  return text.split(/\r\n|\r|\n/);
}

function localizationFile(language: string): string {
  return 'Localization.' + language + '.txt';
}

/** IniRead skips these lines: empty, or a comment (# or ;). */
function skipped(line: string): boolean {
  const trimmed = line.trim();
  return trimmed === '' || trimmed.startsWith('#') || trimmed.startsWith(';');
}

export const ComponentText = {
  /** The section, as Save writes it. */
  section(target: TextTarget): string {
    return target.toString().replace(/(\r\n)+$/, '');
  },

  /** The lines of its texts in a language, as Save writes them. */
  texts(target: TextTarget, language: string): string {
    const file = QuestEditor.filesToSave().localization.get(localizationFile(language));
    if (file === undefined) return '';
    const prefix = prefixOf(target);
    return lines(file)
      .slice(1)
      .filter((line) => line.startsWith(prefix))
      .join('\n');
  },

  /** What stops these lines from being its section and texts, or null. */
  check(target: TextTarget, section: string, texts: string): TextProblem | null {
    const name = nameOf(target);
    const fixed = fixedOf(target);
    let header = false;
    const sectionLines = lines(section);
    for (let i = 0; i < sectionLines.length; i++) {
      const line = sectionLines[i]!;
      if (skipped(line)) continue;
      // IniRead: a line that starts with [ starts a section, named without the brackets
      const isHeader = line.trim().startsWith('[');
      if (!header) {
        if (!isHeader || line.trim().replace(/^\[+|\]+$/g, '') !== name) return { key: 'EDITOR_TEXT_HEADER', line: i + 1 };
        header = true;
      } else if (isHeader) {
        return { key: 'EDITOR_TEXT_SECTION', line: i + 1 };
      } else {
        // IniRead: the key before the first =, the value after it without spaces or quotes at its ends
        const equals = line.indexOf('=');
        const key = (equals < 0 ? line : line.substring(0, equals)).trim();
        const value = equals < 0 ? '' : line.substring(equals + 1).trim().replace(/^"+|"+$/g, '');
        if (fixed.has(key) && fixed.get(key) !== value) return { key: 'EDITOR_TEXT_FIXED', line: i + 1 };
      }
    }
    if (!header) return { key: 'EDITOR_TEXT_HEADER', line: 0 };
    const prefix = prefixOf(target);
    const textLines = lines(texts);
    for (let i = 0; i < textLines.length; i++) {
      const line = textLines[i]!;
      if (line.trim() === '') continue;
      if (!line.startsWith(prefix) || !line.includes(',')) return { key: 'EDITOR_TEXT_KEY', line: i + 1 };
    }
    return null;
  },

  /**
   * Takes these lines (checked first) as its section and its texts in the language, and loads the quest from such
   * files as Reload would. False when they would not load, or Valkyrie would stop on them (a TileSide that is not
   * there, say); then nothing changes. A component is a new object afterwards: look it up by its name.
   */
  apply(target: TextTarget, section: string, language: string, texts: string): boolean {
    const name = nameOf(target);
    const before = QuestEditor.filesToSave();
    const written = lines(section).join(NewLine).replace(/(\r\n)+$/, '').replace(/^(\r\n)+/, '') + NewLine;
    const files = QuestEditor.filesToSave(undefined, undefined, new Map([[name, written]]));
    const file = localizationFile(language);
    const current = files.localization.get(file);
    if (current !== undefined) {
      const prefix = prefixOf(target);
      const all = lines(current);
      const kept = all.filter((line, i) => i === 0 || !line.startsWith(prefix));
      const first = all.findIndex((line, i) => i > 0 && line.startsWith(prefix));
      // Where the old ones were, or at the end, before a last empty line
      const at = first >= 0 ? first : kept.length > 1 && kept.at(-1) === '' ? kept.length - 1 : kept.length;
      kept.splice(at, 0, ...lines(texts).filter((line) => line.trim() !== ''));
      files.localization.set(file, kept.join(NewLine));
    }
    const fatal = Application.fatalErrors.length;
    let loaded: boolean;
    try {
      loaded = QuestEditorHistory.loadFiles(files);
    } catch {
      loaded = false;
    }
    if (loaded && Application.fatalErrors.length === fatal) return true;
    Application.fatalErrors.length = fatal;
    QuestEditorHistory.loadFiles(before);
    return false;
  },
};
