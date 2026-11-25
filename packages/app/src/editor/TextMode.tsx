// The text mode of a component, or of the quest itself: its .ini section and its texts in one of the scenario's
// languages, as Save writes them, to change as text and apply, for whoever edits the files by hand today. Applying loads the scenario again as
// Reload would load such files (ComponentText), so what the editor holds is what Valkyrie would read; Undo takes it
// back. Not in Valkyrie, whose editor has no text mode.
import { useEffect, useState } from 'react';
import { ComponentText, Game, QUEST_SELECTION, QuestEditor, type TextTarget } from '@universalis/engine';
import { run } from '../ui/run.ts';
import { change } from './session.ts';
import { edi } from './text.ts';

/** The scenario's languages, from the texts Save would write: Localization.<language>.txt. */
function languages(): string[] {
  return [...QuestEditor.filesToSave().localization.keys()].map((file) => file.substring('Localization.'.length, file.length - '.txt'.length));
}

/** Rows enough for its lines, within reason. */
function rows(text: string): number {
  return Math.min(24, Math.max(4, text.split('\n').length + 1));
}

export function TextMode({ component }: { component: TextTarget }) {
  const all = languages();
  const game = Game.get();
  const preferred = [game.currentLang, game.currentQuest!.qd.quest.defaultLanguage].find((l) => all.includes(l)) ?? all[0] ?? '';
  const [language, setLanguage] = useState(preferred);
  const [section, setSection] = useState(() => ComponentText.section(component));
  const [texts, setTexts] = useState(() => ComponentText.texts(component, language));
  const [problem, setProblem] = useState<string | null>(null);
  const name = 'sectionName' in component ? component.sectionName : QUEST_SELECTION;

  // Another component, or this one loaded again (applied, undone, reloaded): its lines as they are now
  useEffect(() => {
    setSection(ComponentText.section(component));
    setTexts(ComponentText.texts(component, language));
    setProblem(null);
  }, [component, name, language]);

  const apply = () => {
    const found = ComponentText.check(component, section, texts);
    if (found !== null) {
      setProblem(edi(found.key, found.line, name));
      return;
    }
    run(() => {
      let applied = false;
      change(edi('EDITOR_TEXT_STEP', name), () => {
        applied = ComponentText.apply(component, section, language, texts);
      });
      setProblem(applied ? null : edi('EDITOR_TEXT_LOAD'));
    });
  };

  return (
    <section className="editor-text-mode">
      <p className="quiet">{edi('EDITOR_TEXT_HINT')}</p>
      <label className="editor-field">
        <span>{edi('EDITOR_TEXT_SECTION_LABEL')}</span>
        <textarea className="editor-code" spellCheck={false} rows={rows(section)} value={section} onChange={(e) => setSection(e.target.value)} />
      </label>
      <label className="editor-field">
        <span className="editor-inline">
          {edi('EDITOR_TEXT_TEXTS_LABEL')}
          <select value={language} onChange={(e) => setLanguage(e.target.value)} aria-label={edi('EDITOR_LANGUAGES')}>
            {all.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </span>
        <textarea className="editor-code" spellCheck={false} rows={rows(texts)} value={texts} onChange={(e) => setTexts(e.target.value)} />
      </label>
      {problem !== null && (
        <p className="editor-error" role="alert">
          {problem}
        </p>
      )}
      <span className="editor-inline">
        <button type="button" className="button primary" onClick={apply}>
          {edi('EDITOR_TEXT_APPLY')}
        </button>
        <button
          type="button"
          className="button"
          onClick={() => {
            setSection(ComponentText.section(component));
            setTexts(ComponentText.texts(component, language));
            setProblem(null);
          }}
        >
          {edi('EDITOR_TEXT_RESET')}
        </button>
      </span>
    </section>
  );
}
