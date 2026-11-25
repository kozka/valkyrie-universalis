// The scenario's variables (QuestGraph): each with what kind it is, where an operation changes it, where a test, a
// button's condition, a quota or another operation reads it, and which texts show it ({var:…}); pressing a component
// selects it. Not ported from Valkyrie, whose editor lists variables only in the windows that pick one.
import { useState } from 'react';
import { Game, type VariableUse } from '@universalis/engine';
import { run } from '../ui/run.ts';
import { useEditor } from './editorState.ts';
import { currentSession, select } from './session.ts';
import { edi } from './text.ts';

/** What a variable is by its first letters (VarManager), in the order the panel lists them. */
const KINDS: [RegExp, string][] = [
  [/^@/, 'EDITOR_VAR_KIND_TRIGGER'],
  [/^\$?%/, 'EDITOR_VAR_KIND_CAMPAIGN'],
  [/^\$/, 'EDITOR_VAR_KIND_VALKYRIE'],
  [/^#/, 'EDITOR_VAR_KIND_READ_ONLY'],
];

function kindOf(variable: string): number {
  const i = KINDS.findIndex(([test]) => test.test(variable));
  return i === -1 ? -1 : i;
}

function kindLabel(variable: string): string {
  const i = kindOf(variable);
  return edi(i === -1 ? 'EDITOR_VAR_KIND_OWN' : KINDS[i]![1]);
}

/** The components of a list of uses, each once, with how a reading one reads it; the quest's own texts are not one. */
function Uses({ uses, how = false }: { uses: readonly VariableUse[]; how?: boolean }) {
  const components = Game.get().currentQuest!.qd.components;
  const byComponent = new Map<string, Set<string>>();
  for (const use of uses) {
    let hows = byComponent.get(use.component);
    if (hows === undefined) byComponent.set(use.component, (hows = new Set()));
    hows.add(use.how);
  }
  return (
    <ul className="editor-var-uses">
      {[...byComponent].map(([component, hows]) => (
        <li key={component}>
          {components.has(component) ? (
            <button type="button" className="editor-link" onClick={() => run(() => select(component))}>
              {component}
            </button>
          ) : (
            <span>{component}</span>
          )}
          {how && <span className="quiet"> ({[...hows].map((h) => edi('EDITOR_VAR_HOW_' + h.toUpperCase())).join(', ')})</span>}
        </li>
      ))}
    </ul>
  );
}

export function VariablesPanel() {
  useEditor((s) => s.revision);
  const graph = currentSession().graph;
  const [filter, setFilter] = useState('');
  if (graph === null) return null;
  const lower = filter.trim().toLowerCase();
  const names = [...new Set([...graph.written.keys(), ...graph.read.keys(), ...graph.shown.keys()])]
    .filter((v) => v !== '' && (lower === '' || v.toLowerCase().includes(lower)))
    .sort((a, b) => kindOf(a) - kindOf(b) || a.localeCompare(b));
  return (
    <div className="editor-vars">
      <input type="search" className="editor-search" value={filter} placeholder={edi('EDITOR_VAR_SEARCH')} aria-label={edi('EDITOR_VAR_SEARCH')} onChange={(e) => setFilter(e.target.value)} />
      {names.length === 0 ? (
        <p className="quiet">{edi('EDITOR_VAR_NONE')}</p>
      ) : (
        <table className="editor-var-table">
          <thead>
            <tr>
              <th scope="col">{edi('EDITOR_VAR_NAME')}</th>
              <th scope="col">{edi('EDITOR_VAR_WRITTEN')}</th>
              <th scope="col">{edi('EDITOR_VAR_READ')}</th>
              <th scope="col">{edi('EDITOR_VAR_SHOWN')}</th>
            </tr>
          </thead>
          <tbody>
            {names.map((v) => (
              <tr key={v}>
                <th scope="row">
                  <code>{v}</code>
                  <span className="quiet">{kindLabel(v)}</span>
                </th>
                <td>
                  <Uses uses={graph.written.get(v) ?? []} />
                </td>
                <td>
                  <Uses uses={graph.read.get(v) ?? []} how />
                </td>
                <td>
                  <Uses uses={[...(graph.shown.get(v) ?? [])].map((component) => ({ component, how: 'value' as const }))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
