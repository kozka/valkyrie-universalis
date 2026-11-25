// Not in Valkyrie: each game's help, a window with what a player does on a turn and a summary of the rules (rulesMoM.ts,
// rulesD2E.ts, rulesDooM.ts), opened from the game's main menu and from the game's menu, so players can refresh the
// rules before and during a game.
import { useState, useSyncExternalStore } from 'react';
import { CommonStringKeys, Game } from '@universalis/engine';
import { playingDoom } from '../screens/doom.ts';
import { rulesHelpD2E } from './rulesD2E.ts';
import { rulesHelpDooM } from './rulesDooM.ts';
import { rulesHelpMoM, type RulesHelpText, type RulesSection } from './rulesMoM.ts';
import { useUI } from './store.ts';
import { uni } from './text.ts';
import './RulesHelp.css';

/** The help of the game being played, and the name of its first tab. */
function gameHelp(language: string): [RulesHelpText, string] {
  if (playingDoom()) return [rulesHelpDooM(language), 'RULES_ACTIONS_DOOM'];
  if (Game.get().gameType.typeName() === 'D2E') return [rulesHelpD2E(language), 'RULES_ACTIONS_D2E'];
  return [rulesHelpMoM(language), 'RULES_ACTIONS'];
}

let open = false;
/** The tab last shown, kept while the app is open. */
let lastTab: 'actions' | 'rules' = 'actions';
const listeners = new Set<() => void>();

export function openRulesHelp(on = true): void {
  open = on;
  for (const listener of listeners) listener();
}

/** Lower case and without accents, so that «dano» finds «daño». */
function fold(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/** Not in Valkyrie: the sections of both tabs with only the entries that hold every word searched for (or all of a
 * section whose title does). */
function search(help: RulesHelpText, query: string): RulesSection[] {
  const words = fold(query).split(/\s+/).filter((w) => w.length > 0);
  const has = (text: string) => words.every((w) => fold(text).includes(w));
  return [...help.actions, ...help.rules].flatMap((section) => {
    if (has(section.title)) return [section];
    const entries = section.entries.filter((entry) => has((entry.term ?? '') + ' ' + entry.text));
    return entries.length > 0 ? [{ ...section, entries }] : [];
  });
}

function Entries({ section }: { section: RulesSection }) {
  return (
    <ul className="rules-entries">
      {section.entries.map((entry, i) => (
        <li key={i}>
          {entry.term !== undefined && <strong>{entry.term}</strong>} {entry.text}
        </li>
      ))}
    </ul>
  );
}

export function RulesHelp() {
  useUI((s) => s.revision);
  const shown = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => open,
  );
  const [tab, setTab] = useState(lastTab);
  const [query, setQuery] = useState('');
  if (!shown) return null;
  const [help, actionsTab] = gameHelp(Game.get().currentLang);
  const choose = (next: typeof tab) => {
    lastTab = next;
    setTab(next);
  };
  return (
    <div className="window-layer rules-help-layer" onKeyDown={(e) => e.key === 'Escape' && openRulesHelp(false)}>
      <section className="window panel rules-help" role="dialog" aria-modal="true" aria-labelledby="rules-help-title">
        <h2 id="rules-help-title">{uni('RULES_HELP')}</h2>
        <div className="rules-tabs" role="tablist">
          <button type="button" role="tab" className="rules-tab" aria-selected={tab === 'actions'} onClick={() => choose('actions')}>
            {uni(actionsTab)}
          </button>
          <button type="button" role="tab" className="rules-tab" aria-selected={tab === 'rules'} onClick={() => choose('rules')}>
            {uni('RULES_SUMMARY')}
          </button>
        </div>
        <input
          type="search"
          className="rules-search"
          value={query}
          placeholder={uni('HELP_SEARCH')}
          aria-label={uni('HELP_SEARCH')}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="rules-body" role="tabpanel">
          {query.trim().length > 0 ? (
            (() => {
              const found = search(help, query);
              if (found.length === 0) return <p className="rules-intro">{uni('HELP_SEARCH_NONE')}</p>;
              return found.map((section, i) => (
                <section key={i} className="rules-group">
                  <h3>{section.title}</h3>
                  <Entries section={section} />
                </section>
              ));
            })()
          ) : tab === 'actions' ? (
            <>
              <p className="rules-intro">{help.actionsIntro}</p>
              {help.actions.map((section) => (
                <section key={section.title} className="rules-group">
                  <h3>{section.title}</h3>
                  <Entries section={section} />
                </section>
              ))}
            </>
          ) : (
            help.rules.map((section) => (
              <details key={section.title} className="rules-section">
                <summary>{section.title}</summary>
                <Entries section={section} />
              </details>
            ))
          )}
          <p className="rules-note">{uni('RULES_NOTE')}</p>
        </div>
        <button type="button" className="button primary" autoFocus onClick={() => openRulesHelp(false)}>
          {CommonStringKeys.CLOSE.translate()}
        </button>
      </section>
    </div>
  );
}
