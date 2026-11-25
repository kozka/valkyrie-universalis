// The open scenario's components, by type, with a search box: pressing one selects it, the dot by a name says what the
// checks found in it, a switch leaves only those with something to mend, and each type makes a new one from the + of
// its heading. Valkyrie's editor lists them in one window (QuestEditorData.TypeSelect), with the same types to make in
// each game; here the list stays beside the map, on the right, as the selected component's panel is on the left in
// Valkyrie. Not ported from Valkyrie.
import { useState } from 'react';
import { Game, PerilData, QUEST_SELECTION, StringKey, ValkyrieConstants, type QuestData } from '@universalis/engine';
import { run } from '../ui/run.ts';
import { val } from '../ui/text.ts';
import { Tool } from './chrome.tsx';
import { useEditor } from './editorState.ts';
import { Icon, typeIcon } from './Icon.tsx';
import { setGroupOpen, useLayout } from './layout.ts';
import { change, select, worstAt } from './session.ts';
import { edi } from './text.ts';

/** The types listed, in this order; a component goes under the first whose name starts its own (QuestData.AddData). */
export const TYPES = ['Tile', 'Door', 'Token', 'UI', 'Event', 'Spawn', 'MPlace', 'QItem', 'Puzzle', 'CustomMonster', 'Activation'];

/** The types each game's editor makes (QuestEditorData.TypeSelect). */
export function makes(type: string): boolean {
  const descent = Game.get().gameType.typeName() === ValkyrieConstants.typeDescent;
  if (['Activation', 'Door', 'MPlace'].includes(type)) return descent;
  if (type === 'Puzzle') return !descent;
  return true;
}

/** The type a component is listed under: the class QuestData made it as (a StartingItem is a QItem). */
function typeOf(component: QuestData.QuestComponent): string {
  return component.typeDynamic === 'StartingItem' ? 'QItem' : component.typeDynamic;
}

export function typeName(type: string): string {
  return new StringKey('val', type.toUpperCase()).translate();
}

/** Makes a new component of a type, selected, as Valkyrie's {New …} does. */
export function makeComponent(type: string): void {
  run(() =>
    change(edi('EDITOR_NEW_COMPONENT', typeName(type)), () => {
      Game.get().qed!.newComponent(type);
    }),
  );
}

function Dot({ name }: { name: string }) {
  const worst = worstAt(name);
  if (worst === null || worst === 'hint') return null;
  return <span className={`editor-dot editor-dot-${worst}`} aria-label={edi(worst === 'breaks' ? 'EDITOR_DOT_BREAKS' : 'EDITOR_DOT_WRONG')} role="img" />;
}

export function ComponentList() {
  useEditor((s) => s.revision);
  const folded = useLayout((s) => s.groups);
  const [filter, setFilter] = useState('');
  const [onlyProblems, setOnlyProblems] = useState(false);
  const game = Game.get();
  const quest = game.currentQuest!;
  const selection = game.qed?.selection ?? QUEST_SELECTION;
  const lower = filter.trim().toLowerCase();
  const byType = new Map<string, string[]>(TYPES.map((t) => [t, []]));
  for (const c of quest.qd.components.values()) {
    if (c instanceof PerilData) continue;
    if (lower !== '' && !c.sectionName.toLowerCase().includes(lower)) continue;
    if (onlyProblems && (worstAt(c.sectionName) ?? 'hint') === 'hint') continue;
    const list = byType.get(typeOf(c));
    if (list !== undefined) list.push(c.sectionName);
  }
  const pick = (name: string) => run(() => select(name));
  const narrowed = lower !== '' || onlyProblems;
  return (
    <nav className="editor-components" aria-label={edi('EDITOR_COMPONENTS_LIST')}>
      <div className="editor-search-row">
      <label className="editor-search-box">
        <Icon name="search" />
        <input
          className="editor-search"
          type="search"
          value={filter}
          placeholder={val('SEARCH_BY_NAME')}
          aria-label={val('SEARCH_BY_NAME')}
          data-editor-search=""
          onChange={(e) => setFilter(e.target.value)}
        />
        <kbd>Ctrl+K</kbd>
      </label>
      <Tool icon="alert" label={edi('EDITOR_ONLY_PROBLEMS')} pressed={onlyProblems} onClick={() => setOnlyProblems(!onlyProblems)} />
      </div>
      <div className="editor-side-body">
        <button
          type="button"
          className={`editor-item editor-item-quest${selection === QUEST_SELECTION ? ' selected' : ''}`}
          aria-current={selection === QUEST_SELECTION}
          onClick={() => pick(QUEST_SELECTION)}
        >
          <Icon name="quest" />
          <span className="editor-item-name">{val('QUEST')}</span>
        </button>
        {TYPES.map((type) => {
          const names = byType.get(type)!;
          if (!makes(type) && names.length === 0) return null;
          // Narrowed, a type with nothing found is not listed
          if (narrowed && names.length === 0) return null;
          const open = narrowed || names.includes(selection) || (folded[type] === undefined ? names.length <= 40 : !folded[type]);
          return (
            <section key={type} className="editor-group">
              <div className="editor-group-head">
                <button type="button" className="editor-group-name" aria-expanded={open} onClick={() => setGroupOpen(type, !open)}>
                  <Icon name="chevron" className="editor-chevron" />
                  <Icon name={typeIcon(type)} />
                  <span>{typeName(type)}</span>
                  <span className="editor-count">{names.length}</span>
                </button>
                {makes(type) && <Tool icon="plus" label={val('NEW_X', new StringKey('val', type.toUpperCase()))} onClick={() => makeComponent(type)} />}
              </div>
              {open && names.length > 0 && (
                <ul>
                  {names.map((name) => (
                    <li key={name}>
                      <button type="button" className={`editor-item${name === selection ? ' selected' : ''}`} aria-current={name === selection} onClick={() => pick(name)}>
                        <span className="editor-item-name">
                          {name.startsWith(type) && name.length > type.length ? (
                            <>
                              <span className="editor-item-type">{type}</span>
                              {name.slice(type.length)}
                            </>
                          ) : (
                            name
                          )}
                        </span>
                        <Dot name={name} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
        {narrowed && [...byType.values()].every((n) => n.length === 0) && <p className="quiet editor-empty">{edi('EDITOR_NOTHING_FOUND')}</p>}
      </div>
    </nav>
  );
}
