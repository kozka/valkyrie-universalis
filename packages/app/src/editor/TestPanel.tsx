// The panel beside a game tested from the editor (test.ts): the events that started, the newest first, each with why
// (a trigger, a button of an event, a component pressed on the board) and pressed, back to the editor on it; through a
// campaign, its changes of quest and the adventure each event is in; and the scenario's variables, live, each value
// changed here as Valkyrie's log window changes it in a test (LogWindow.UpdateValue), and a new one set. Not ported
// from Valkyrie, whose test shows the variables only inside the log window.
import { useState } from 'react';
import { Game, Path, floatToString, floatTryParse, type EventCause, type StartedEvent } from '@universalis/engine';
import { RichText } from '../ui/RichText.tsx';
import { run } from '../ui/run.ts';
import { update, useUI } from '../ui/store.ts';
import { val } from '../ui/text.ts';
import { pathFrom, samePath } from './campaign.ts';
import { back, tested } from './test.ts';
import { edi } from './text.ts';
import './TestPanel.css';

/** Whether the panel was left open, where the screen has room for it beside the game. */
let opened = true;

/** Open as it was left, where the screen has room for it; on a phone it would cover the game, so closed at each test. */
function startsOpen(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(min-width: 60rem)').matches && opened;
}

/** Why an event started, in words. */
function causeText(cause: EventCause): string {
  switch (cause.kind) {
    case 'trigger':
      return edi('EDITOR_TEST_BY_TRIGGER', cause.trigger);
    case 'button':
      return edi(cause.random ? 'EDITOR_TEST_BY_BUTTON_RANDOM' : 'EDITOR_TEST_BY_BUTTON', cause.button, cause.event);
    case 'board':
      return edi('EDITOR_TEST_BY_BOARD');
    case 'other':
      return edi('EDITOR_TEST_BY_OTHER');
  }
}

/** Where an event of a campaign's test is, when it is not in the quest tested: the campaign, or one of its adventures. */
function questOf(event: StartedEvent): string | null {
  const test = tested();
  const folder = Path.getDirectoryName(event.quest)!;
  if (test === null || samePath(folder, test.path)) return null;
  return pathFrom(test.root, folder) || edi('EDITOR_TEST_CAMPAIGN');
}

/** An event that started, or a change of quest. */
function Started({ event }: { event: StartedEvent }) {
  const where = questOf(event);
  return (
    <li className={event.changesQuest ? 'test-change' : undefined}>
      {event.changesQuest ? (
        <span className="test-quest">{edi('EDITOR_TEST_CHANGES', event.name)}</span>
      ) : (
        <button type="button" className="editor-link" title={edi('EDITOR_TEST_OPEN', event.name)} onClick={() => run(() => back(event.name, event.quest))}>
          {event.name}
        </button>
      )}
      {!event.changesQuest && where !== null && <span className="test-in">{edi('EDITOR_TEST_IN', where)}</span>}
      <span className="test-cause">{causeText(event.cause)}</span>
      <span className="quiet">{edi('EDITOR_TEST_ROUND', event.round)}</span>
    </li>
  );
}

/** A variable's value, typed: set when Enter is pressed or the box is left; what is not a number is left as it was. */
function Value({ name, value }: { name: string; value: number }) {
  const set = (text: string) => {
    const parsed = floatTryParse(text);
    if (!parsed.ok || parsed.value === value) return;
    run(() => {
      Game.get().currentQuest!.vars.setValue(name, parsed.value);
      update();
    });
  };
  return (
    <input
      key={value}
      type="text"
      inputMode="decimal"
      aria-label={name}
      defaultValue={floatToString(value)}
      onBlur={(e) => set(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && set(e.currentTarget.value)}
    />
  );
}

/** A variable not set yet: its name and its value. */
function NewVariable() {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const add = () => {
    const parsed = floatTryParse(value);
    if (name.trim() === '' || !parsed.ok) return;
    run(() => {
      Game.get().currentQuest!.vars.setValue(name.trim(), parsed.value);
      update();
    });
    setName('');
    setValue('');
  };
  return (
    <form
      className="test-new-var"
      onSubmit={(e) => {
        e.preventDefault();
        add();
      }}
    >
      <input type="text" aria-label={edi('EDITOR_TEST_NEW_VAR')} placeholder={edi('EDITOR_TEST_NEW_VAR')} value={name} onChange={(e) => setName(e.target.value)} />
      <input type="text" inputMode="decimal" aria-label={edi('EDITOR_TEST_NEW_VALUE')} placeholder="0" value={value} onChange={(e) => setValue(e.target.value)} />
      <button type="submit" className="button">
        {edi('EDITOR_TEST_SET')}
      </button>
    </form>
  );
}

export function TestPanel() {
  useUI((s) => s.revision);
  const [open, setOpen] = useState(startsOpen);
  const [search, setSearch] = useState('');
  const quest = Game.get().currentQuest;
  if (quest === null) return null;
  const toggle = () => {
    opened = !open;
    setOpen(!open);
  };
  if (!open) {
    return (
      <button type="button" className="button test-panel-open" aria-expanded={false} onClick={toggle}>
        {edi('EDITOR_TEST')}
      </button>
    );
  }
  const started = [...quest.eManager.started].reverse();
  const test = tested();
  const adventure = test !== null && !samePath(test.root, test.path);
  const needle = search.trim().toLocaleLowerCase();
  const vars = [...quest.vars.vars].filter(([name]) => name.toLocaleLowerCase().includes(needle)).sort(([a], [b]) => a.localeCompare(b));
  return (
    <aside className="test-panel panel" aria-label={edi('EDITOR_TEST')}>
      <header className="test-panel-head">
        <h2>
          {edi('EDITOR_TEST')}: <RichText text={test?.name ?? quest.qd.quest.name.translate()} />
        </h2>
        <button type="button" className="button" onClick={() => run(() => back())}>
          {val('EDITOR')}
        </button>
        <button type="button" className="button test-panel-close" aria-expanded={true} onClick={toggle}>
          {edi('EDITOR_TEST_HIDE')}
        </button>
      </header>
      {adventure && <p className="quiet">{edi('EDITOR_TEST_ADVENTURE')}</p>}
      <section className="test-panel-part">
        <h3>{edi('EDITOR_TEST_EVENTS')}</h3>
        {started.length === 0 ? (
          <p className="quiet">{edi('EDITOR_TEST_NO_EVENTS')}</p>
        ) : (
          <ol className="test-events" reversed>
            {started.map((event, i) => (
              <Started key={started.length - i} event={event} />
            ))}
          </ol>
        )}
      </section>
      <section className="test-panel-part">
        <h3>{edi('EDITOR_VARIABLES')}</h3>
        <input type="search" aria-label={edi('EDITOR_VAR_SEARCH')} placeholder={edi('EDITOR_VAR_SEARCH')} value={search} onChange={(e) => setSearch(e.target.value)} />
        <ul className="test-vars">
          {vars.map(([name, value]) => (
            <li key={name}>
              <code>{name}</code>
              <Value name={name} value={value} />
            </li>
          ))}
        </ul>
        <NewVariable />
      </section>
    </aside>
  );
}
