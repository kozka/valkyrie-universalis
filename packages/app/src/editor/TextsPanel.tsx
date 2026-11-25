// The scenario's texts by language, as a table (QuestEditorTexts): a row for each text, by component, and a column for
// each language, the default one first; a text is changed where it is pressed, in that language only, and what a
// language lacks is marked. Above it: the language the editor writes in (the player's, as in Valkyrie, so the options
// change it too), the default language, a search, only what is missing, and a column for a language the scenario does
// not have yet. A scenario can have thousands of texts: the table shows them a page at a time. Not ported from
// Valkyrie, whose editor shows the player's language only.
import { useRef, useState } from 'react';
import { Game, QuestData, QuestEditorTexts, type TextRow } from '@universalis/engine';
import { LANGUAGE_CODES, languageCode, languageName } from '../ui/languages.ts';
import { run } from '../ui/run.ts';
import { redrawOnBoard } from './EditorMap.tsx';
import { showTab, useEditor } from './editorState.ts';
import { writeIn } from './language.ts';
import { change, select, textsNow } from './session.ts';
import { edi } from './text.ts';

/** How many rows a page of the table has. */
const PAGE = 200;

/** Where a cell is being written. */
interface Editing {
  key: string;
  language: string;
}

/** A column: a language, with its name in the language the editor writes in. */
interface Column {
  language: string;
  name: string;
}

/** Valkyrie's languages, by their names in the language the editor writes in. */
function allLanguages(writing: string): Column[] {
  return Object.keys(LANGUAGE_CODES)
    .map((language) => ({ language, name: languageName(language, writing) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Writes a cell; a text of an interface element is drawn on the map again when the map shows that language. */
function write(row: TextRow, column: Column, text: string): void {
  change(edi('EDITOR_TEXTS_STEP', row.key, column.name), () => QuestEditorTexts.setText(row.key, column.language, text));
  const owner = row.owner === null ? undefined : Game.get().currentQuest!.qd.components.get(row.owner);
  if (owner instanceof QuestData.UI && column.language === Game.get().currentLang) redrawOnBoard(owner.sectionName);
}

function Cell({ row, column, editing, setEditing }: { row: TextRow; column: Column; editing: boolean; setEditing: (e: Editing | null) => void }) {
  const value = row.values.get(column.language);
  const cancelled = useRef(false);
  const label = edi('EDITOR_TEXTS_EDIT', row.key, column.name);
  const lacks = QuestEditorTexts.lacks(row, column.language);
  if (editing) {
    const done = (text: string) => {
      setEditing(null);
      if (cancelled.current) return;
      if (text !== (value ?? '')) run(() => write(row, column, text));
    };
    return (
      <td>
        <textarea
          className="editor-texts-input"
          aria-label={label}
          lang={languageCode(column.language)}
          spellCheck
          autoFocus
          rows={Math.min(8, (value ?? '').split('\n').length + 1)}
          defaultValue={value ?? ''}
          onBlur={(e) => done(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              cancelled.current = true;
              setEditing(null);
            } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.currentTarget.blur();
            }
          }}
        />
      </td>
    );
  }
  return (
    <td className={lacks ? 'editor-texts-lacks' : undefined}>
      <button
        type="button"
        className="editor-texts-cell"
        lang={languageCode(column.language)}
        aria-label={label}
        onClick={() => {
          cancelled.current = false;
          setEditing({ key: row.key, language: column.language });
        }}
      >
        {value === undefined || value.trim() === '' ? lacks && <em>{edi('EDITOR_TEXTS_MISSING')}</em> : value}
      </button>
    </td>
  );
}

/** The key of a row: pressing it selects its component, or the scenario for its own texts. */
function Key({ row }: { row: TextRow }) {
  if (row.owner === null) {
    return (
      <>
        <code>{row.key}</code> <span className="quiet">{edi('EDITOR_TEXTS_NO_OWNER')}</span>
      </>
    );
  }
  const owner = row.owner;
  return (
    <button type="button" className="editor-link" onClick={() => run(() => select(owner))}>
      {row.key}
    </button>
  );
}

export function TextsPanel() {
  useEditor((s) => s.revision);
  const onlyMissing = useEditor((s) => s.onlyMissing);
  const search = useEditor((s) => s.textsSearch);
  const [added, setAdded] = useState<string[]>([]);
  const [two, setTwo] = useState(false);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [pages, setPages] = useState(1);
  const game = Game.get();
  const quest = game.currentQuest!;
  const writing = game.currentLang;
  const defaultLanguage = quest.qd.quest.defaultLanguage;
  const texts = textsNow();
  const all = allLanguages(writing);
  const nameOf = (language: string) => all.find((c) => c.language === language)?.name ?? language;
  // Each of its languages, or only the default one and the one written in, and those added to write in them
  const languages = two ? [defaultLanguage] : QuestEditorTexts.languages(texts, defaultLanguage);
  for (const language of [writing, ...added]) if (!languages.includes(language)) languages.push(language);
  const columns = languages.map((language) => ({ language, name: nameOf(language) }));
  const rows = QuestEditorTexts.rows(texts, quest.qd.components, defaultLanguage);
  const needle = search.trim().toLocaleLowerCase();
  const shown = rows.filter(
    (row) =>
      (!onlyMissing || languages.some((l) => QuestEditorTexts.lacks(row, l))) &&
      (needle === '' || row.key.toLocaleLowerCase().includes(needle) || [...row.values.values()].some((v) => v.toLocaleLowerCase().includes(needle))),
  );
  const withTexts = new Set([defaultLanguage, ...texts.keys()]);
  const others = all.filter((c) => !languages.includes(c.language));
  return (
    <div className="editor-texts">
      <div className="editor-texts-bar">
        <label className="editor-inline">
          {edi('EDITOR_WRITING_IN')}
          <select value={writing} onChange={(e) => run(() => writeIn(e.target.value))}>
            {all.map((c) => (
              <option key={c.language} value={c.language}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="editor-inline">
          {edi('EDITOR_DEFAULT_LANGUAGE')}
          <select
            value={defaultLanguage}
            onChange={(e) => {
              const language = e.target.value;
              run(() => change(edi('EDITOR_DEFAULT_LANGUAGE_STEP', nameOf(language)), () => QuestEditorTexts.setDefaultLanguage(language)));
            }}
          >
            {[...withTexts].map((l) => (
              <option key={l} value={l}>
                {nameOf(l)}
              </option>
            ))}
          </select>
        </label>
        <input type="search" aria-label={edi('EDITOR_TEXTS_SEARCH')} placeholder={edi('EDITOR_TEXTS_SEARCH')} value={search} onChange={(e) => useEditor.setState({ textsSearch: e.target.value })} />
        <label className="editor-inline editor-check">
          <input type="checkbox" checked={onlyMissing} onChange={() => showTab('texts', { onlyMissing: !onlyMissing })} />
          {edi('EDITOR_TEXTS_ONLY_MISSING')}
        </label>
        <label className="editor-inline editor-check">
          <input type="checkbox" checked={two} onChange={() => setTwo(!two)} />
          {edi('EDITOR_TEXTS_TWO')}
        </label>
        {others.length > 0 && (
          <select aria-label={edi('EDITOR_TEXTS_ADD_LANGUAGE')} value="" onChange={(e) => setAdded([...added, e.target.value])}>
            <option value="">{edi('EDITOR_TEXTS_ADD_LANGUAGE')}</option>
            {others.map((c) => (
              <option key={c.language} value={c.language}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <p className="quiet editor-texts-hint">
        {edi('EDITOR_WRITING_HINT')} {edi('EDITOR_DEFAULT_LANGUAGE_HINT')}
      </p>
      {shown.length === 0 ? (
        <p className="quiet">{edi('EDITOR_TEXTS_NONE')}</p>
      ) : (
        <table className="editor-texts-table">
          <thead>
            <tr>
              <th scope="col">{edi('EDITOR_TEXTS_KEY', rows.length)}</th>
              {columns.map((c) => {
                const lacking = rows.filter((row) => QuestEditorTexts.lacks(row, c.language)).length;
                return (
                  <th key={c.language} scope="col">
                    {c.name}
                    {c.language === defaultLanguage && <span className="editor-tree-badge">{edi('EDITOR_TEXTS_DEFAULT')}</span>}
                    {lacking > 0 && <span className="editor-texts-count">{edi('EDITOR_TEXTS_LACKS', lacking)}</span>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {shown.slice(0, pages * PAGE).map((row) => (
              <tr key={row.key}>
                <th scope="row">
                  <Key row={row} />
                </th>
                {columns.map((c) => (
                  <Cell key={c.language} row={row} column={c} editing={editing?.key === row.key && editing.language === c.language} setEditing={setEditing} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {shown.length > pages * PAGE && (
        <button type="button" className="button editor-more" onClick={() => setPages(pages + 1)}>
          {edi('EDITOR_SHOW_MORE', shown.length - pages * PAGE)}
        </button>
      )}
    </div>
  );
}
