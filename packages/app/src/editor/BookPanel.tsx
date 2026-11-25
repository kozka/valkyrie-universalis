// The scenario read as a book (QuestGraph.readingOrder): every text a player reads, in the order of the tree of
// events opened all the way, as a game shows it in the language the editor writes in. Each event has its dialog and
// buttons, which lead to their passages; one with no dialog, where it goes on; and the texts of interface elements,
// unique monsters, custom monsters and activations come with their component. What nothing reaches comes after,
// apart. Pressing a name selects its component. A scenario can have thousands of passages: the book draws them a
// page at a time, and a way to one further on draws the pages up to it. Not ported from Valkyrie, whose editor has
// nothing like it.
import { Fragment, useEffect, useRef, useState } from 'react';
import { EditorComponentEvent, Game, QUEST_SELECTION, QuestData, QuestEditorTexts, StringKey, ValkyrieConstants, endsGame, type TextRow } from '@universalis/engine';
import { languageCode, languageInSentence } from '../ui/languages.ts';
import { RichText } from '../ui/RichText.tsx';
import { run } from '../ui/run.ts';
import { val } from '../ui/text.ts';
import { conditionText } from './conditions.ts';
import { useEditor } from './editorState.ts';
import { currentSession, select, textsNow } from './session.ts';
import { edi } from './text.ts';

const ID = 'editor-book-';
/** How many passages a page of the book has. */
const PAGE = 150;

/** A text's field (its key after the component's name) as the component's panel names it. */
function fieldName(field: string): string {
  const mom = Game.get().gameType.typeName() === ValkyrieConstants.typeMom;
  // Without what the panel adds to it, as «(max. 100 characters)»
  const label = (key: string) => val(key).replace(/\s*\([^)]*\)\s*$/, '').replace(/:$/, '');
  const attack = /^Attack_(.+)_\d+$/.exec(field);
  if (attack !== null) return new StringKey('val', attack[1]!).translate();
  const names: Record<string, string> = {
    uitext: edi('EDITOR_UI_TEXT'),
    uniquetitle: label('UNIQUE_TITLE'),
    uniquetext: label('UNIQUE_INFO'),
    monstername: label('NAME'),
    info: label('INFO'),
    ability: mom ? label('INITIAL_MESSAGE') : label('ABILITY'),
    movebutton: label('UNABLE_BUTTON'),
    master: mom ? label('ATTACK_MESSAGE') : label('MONSTER_MASTER'),
    minion: label('MONSTER_MINION'),
    move: label('NO_ATTACK_MESSAGE'),
    synopsys: label('SYNOPSYS'),
    description: label('DESCRIPTION'),
    authors: label('AUTHORS'),
    authors_short: label('AUTHORS_SHORT'),
  };
  return names[field] ?? field;
}

/** Brings a passage drawn into view, and the keyboard to it. */
function focusPassage(name: string): void {
  const passage = document.getElementById(ID + name);
  passage?.scrollIntoView({ block: 'start' });
  passage?.focus({ preventScroll: true });
}

/** Where a button or an event leads: to a passage of the book, to a component without one, or to what is not there. */
function Targets({ names, inBook, goTo }: { names: readonly string[]; inBook: ReadonlySet<string>; goTo: (name: string) => void }) {
  const components = Game.get().currentQuest!.qd.components;
  return (
    <span className="editor-book-targets">
      {names.map((to, i) => (
        <Fragment key={i}>
          {i > 0 && ', '}
          {inBook.has(to) ? (
            <button type="button" className="editor-link" onClick={() => goTo(to)}>
              {to}
            </button>
          ) : components.has(to) ? (
            <button type="button" className="editor-link" onClick={() => run(() => select(to))}>
              {to}
            </button>
          ) : to.endsWith('quest.ini') ? (
            <code>{to}</code>
          ) : (
            <span className="editor-tree-missing">{edi('EDITOR_TREE_MISSING', to)}</span>
          )}
        </Fragment>
      ))}
    </span>
  );
}

/** A text of the scenario as a game shows it, with the name its panel gives its field. */
function Line({ row, field }: { row: TextRow; field: string }) {
  return (
    <p className="editor-book-field">
      <span className="editor-book-label">{fieldName(field)}</span>
      <RichText text={EditorComponentEvent.shown(new StringKey('qst', row.key).translate())} />
    </p>
  );
}

function Passage({ name, rows, inBook, goTo }: { name: string; rows: readonly TextRow[]; inBook: ReadonlySet<string>; goTo: (name: string) => void }) {
  const component = Game.get().currentQuest!.qd.components.get(name);
  if (component === undefined) return null;
  const event = component instanceof QuestData.Event ? component : null;
  const fieldOf = (row: TextRow) => row.key.substring(name.length + 1);
  // An event's dialog and buttons are drawn as a game draws them; its other texts, as fields
  const fields = rows.filter((row) => event === null || !/^(text|button\d+)$/.test(fieldOf(row)));
  const preview = event?.display ? EditorComponentEvent.preview(event) : null;
  const condition = conditionText(component.tests ?? null);
  return (
    <section id={ID + name} className="editor-book-passage" tabIndex={-1} aria-label={name}>
      <h4 className="editor-book-title">
        <button type="button" className="editor-link" onClick={() => run(() => select(name))}>
          {name}
        </button>
        <span className="quiet">{new StringKey('val', component.typeDynamic.toUpperCase()).translate()}</span>
        {event !== null && event.trigger !== '' && <span className="editor-tree-badge">{edi('EDITOR_TREE_TRIGGER', event.trigger)}</span>}
        {condition !== '' && <span className="editor-tree-if">{edi('EDITOR_TREE_IF', condition)}</span>}
        {endsGame(component) && <span className="editor-tree-badge editor-tree-final">{edi('EDITOR_TREE_FINAL')}</span>}
      </h4>
      {fields.map((row) => (
        <Line key={row.key} row={row} field={fieldOf(row)} />
      ))}
      {preview !== null && preview.text !== '' && (
        <div className="card editor-book-text">
          <RichText text={preview.text} />
        </div>
      )}
      {event !== null && preview !== null && preview.buttons.length > 0 && (
        <ul className="editor-book-buttons">
          {preview.buttons.map((button, i) => (
            <li key={i}>
              <span className="editor-book-button" style={{ color: button.colour }}>
                <RichText text={button.label} />
              </span>
              {(event.buttons[i]?.eventNames.length ?? 0) > 0 && <Targets names={event.buttons[i]!.eventNames} inBook={inBook} goTo={goTo} />}
            </li>
          ))}
        </ul>
      )}
      {event !== null && preview === null && (
        <p className="quiet editor-book-silent">
          {edi('EDITOR_BOOK_SILENT')} <Targets names={event.buttons.flatMap((b) => b.eventNames)} inBook={inBook} goTo={goTo} />
        </p>
      )}
      {event !== null && event.addComponents.length > 0 && (
        <p className="quiet editor-book-adds">
          {edi('EDITOR_BOOK_ADDS')} <Targets names={event.addComponents} inBook={inBook} goTo={goTo} />
        </p>
      )}
    </section>
  );
}

export function BookPanel() {
  useEditor((s) => s.revision);
  const [pages, setPages] = useState(1);
  // A passage to bring into view once the pages up to it are drawn
  const pending = useRef<string | null>(null);
  useEffect(() => {
    if (pending.current === null) return;
    focusPassage(pending.current);
    pending.current = null;
  });
  const graph = currentSession().graph;
  const game = Game.get();
  const quest = game.currentQuest!;
  if (graph === null) return null;
  const byOwner = new Map<string, TextRow[]>();
  for (const row of QuestEditorTexts.rows(textsNow(), quest.qd.components, quest.qd.quest.defaultLanguage)) {
    if (row.owner === null) continue;
    let rows = byOwner.get(row.owner);
    if (rows === undefined) byOwner.set(row.owner, (rows = []));
    rows.push(row);
  }
  // Every event has its passage, so that a button can lead to it; any other component, when it has texts
  const hasPassage = (name: string) => quest.qd.components.get(name) instanceof QuestData.Event || (byOwner.get(name)?.length ?? 0) > 0;
  const order = graph.readingOrder();
  const reached = order.reached.filter(hasPassage);
  const loose = order.loose.filter(hasPassage);
  const all = [...reached, ...loose];
  const inBook = new Set(all);
  const drawn = pages * PAGE;
  const goTo = (name: string) => {
    const index = all.indexOf(name);
    if (index < drawn) {
      focusPassage(name);
      return;
    }
    pending.current = name;
    setPages(Math.floor(index / PAGE) + 1);
  };
  const passages = (names: string[]) => names.map((name) => <Passage key={name} name={name} rows={byOwner.get(name) ?? []} inBook={inBook} goTo={goTo} />);
  const writing = game.currentLang;
  return (
    <article className="editor-book" lang={languageCode(writing)}>
      <p className="quiet">{edi('EDITOR_BOOK_LANGUAGE', languageInSentence(writing, writing))}</p>
      <header className="editor-book-head">
        <h3>
          <RichText text={quest.qd.quest.name.translate()} />
        </h3>
        {(byOwner.get(QUEST_SELECTION) ?? [])
          .filter((row) => row.key !== 'quest.name')
          .map((row) => (
            <Line key={row.key} row={row} field={row.key.substring('quest.'.length)} />
          ))}
      </header>
      {all.length === 0 && <p className="quiet">{edi('EDITOR_BOOK_EMPTY')}</p>}
      {passages(reached.slice(0, drawn))}
      {loose.length > 0 && drawn > reached.length && (
        <>
          <h3 className="editor-book-apart">{edi('EDITOR_TREE_LOOSE', loose.length)}</h3>
          {passages(loose.slice(0, drawn - reached.length))}
        </>
      )}
      {all.length > drawn && (
        <button type="button" className="button editor-more" onClick={() => setPages(pages + 1)}>
          {edi('EDITOR_SHOW_MORE', all.length - drawn)}
        </button>
      )}
    </article>
  );
}
