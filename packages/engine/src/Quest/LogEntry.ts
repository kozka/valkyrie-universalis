// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/Quest.cs (class Quest.LogEntry)
// In its own module, not in Quest.ts, so that BoardComponent and ColorUtil can log without importing Quest (see porting
// rules); Quest exposes it as Quest.LogEntry.
import { Application } from '../platform/Application.ts';
import { NewLine } from '../platform/CSharp.ts';

// Valkyrie: Quest.cs Quest.LogEntry
export class LogEntry {
  private entry: string;
  private valkyrie = false;
  private editor = false;

  /** LogEntry(e, editorIn = false, valkyrieIn = false), or LogEntry(type, e) when the second argument is the text. */
  // Valkyrie: Quest.cs LogEntry.LogEntry
  constructor(first: string, second: boolean | string = false, valkyrieIn = false) {
    if (typeof second === 'string') {
      if (first.indexOf('valkyrie') === 0) {
        this.valkyrie = true;
      }

      if (first.indexOf('editor') === 0) {
        this.editor = true;
      }

      this.entry = second;
      return;
    }
    this.entry = first;
    this.editor = second;
    this.valkyrie = valkyrieIn;
  }

  // Valkyrie: Quest.cs LogEntry.ToString
  toString(id: number): string {
    let r = '';
    if (this.valkyrie) {
      r += 'valkyrie' + id + '=';
    } else if (this.editor) {
      r += 'editor' + id + '=';
    } else {
      r += 'quest' + id + '=';
    }

    r += this.entry.replaceAll('\n', '\\n') + NewLine;
    return r;
  }

  // Valkyrie: Quest.cs LogEntry.GetEntry
  getEntry(editorSet = false): string {
    if (this.valkyrie && !Application.isEditor) {
      return '';
    }

    if (this.editor && !editorSet) {
      return '';
    }

    return this.entry.replaceAll('\\n', '\n') + '\n\n';
  }
}
