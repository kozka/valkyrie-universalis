// The fields of a quest item beside the map, as Valkyrie's panel for it has them (EditorComponentItem): in Mansions
// whether it is a starting item, with its conditions; the items it is drawn from and the traits it is drawn by; and in
// Mansions the event shown when it is inspected. What each does is the engine's (QuestEditor/EditorComponentItem.ts).
// Not ported from Valkyrie's panel, which is drawn with Unity.
import { useState } from 'react';
import { CommonStringKeys, EditorComponentItem, Game, ItemData, ValkyrieConstants, type QuestData, type SelectionItem } from '@universalis/engine';
import { val } from '../ui/text.ts';
import { Chooser } from './Chooser.tsx';
import { AddPick, Go, Minus, Tests } from './EventPanel.tsx';
import { Field, Toggle } from './fields.tsx';
import { edit } from './PiecePanel.tsx';
import { traitName } from './SpawnPanel.tsx';
import { edi } from './text.ts';

interface Open {
  title: string;
  items: SelectionItem[];
  current: string;
  onPick: (key: string) => void;
}

/** An item as the panel names it: the content's name, or the quest item's. */
function itemName(name: string): string {
  const cd = Game.get().cd;
  return cd.containsKey(ItemData, name) ? cd.get(ItemData, name).name.translate() : name;
}

function Traits({ item, pool }: { item: QuestData.QItem; pool: boolean }) {
  const list = pool ? item.traitpool : item.traits;
  const label = pool ? val('POOL_TRAITS').replace(/:$/, '') : CommonStringKeys.TRAITS.translate();
  const choices = EditorComponentItem.traitChoices().map((trait) => ({ value: trait, group: 'TRAITS' }));
  // Valkyrie's panel offers − while something else would be left
  const others = item.itemName.length + (pool ? item.traits.length : item.traitpool.length);
  return (
    <Field label={label}>
      <ul className="editor-names">
        {list.map((trait, i) => (
          <li key={i} className="editor-inline">
            <span className="editor-pack">{traitName(trait)}</span>
            {(others > 0 || list.length > 1) && (
              <Minus label={CommonStringKeys.DELETE.translate()} onClick={() => edit(item, () => (pool ? EditorComponentItem.removeTraitPool(item, i) : EditorComponentItem.removeTrait(item, i)))} />
            )}
          </li>
        ))}
        <li>
          <AddPick label={label} choices={choices} labelOf={traitName} onPick={(v) => edit(item, () => EditorComponentItem.selectAddTrait(item, pool, v))} />
        </li>
      </ul>
    </Field>
  );
}

export function ItemPanel({ item }: { item: QuestData.QItem }) {
  const [opened, setOpened] = useState<Open | null>(null);
  const mansions = Game.get().gameType.typeName() === ValkyrieConstants.typeMom;
  const items = (current: string, onPick: (key: string) => void) => setOpened({ title: CommonStringKeys.SELECT_ITEM.translate(), items: EditorComponentItem.itemChoices(), current, onPick });
  const itemsRemovable = item.traits.length > 0 || item.itemName.length > 1 || item.traitpool.length > 0;
  return (
    <div className="editor-piece">
      {mansions && <Toggle label={CommonStringKeys.STARTING_ITEM.translate()} on={item.starting} onToggle={() => edit(item, () => EditorComponentItem.toggleStarting(item))} />}
      <Field label={CommonStringKeys.ITEM.translate()}>
        <ul className="editor-names">
          {item.itemName.map((name, i) => (
            <li key={i} className="editor-inline">
              <button type="button" className="editor-picked" aria-label={edi('EDITOR_ITEM_N', i + 1)} onClick={() => items(name, (key) => edit(item, () => EditorComponentItem.selectAddItem(item, i, key)))}>
                <span>{itemName(name)}</span>
                {itemName(name) !== name && <code>{name}</code>}
              </button>
              <Go name={name} />
              {itemsRemovable && <Minus label={CommonStringKeys.DELETE.translate()} onClick={() => edit(item, () => EditorComponentItem.removeItem(item, i))} />}
            </li>
          ))}
          <li>
            <button type="button" className="button" onClick={() => items('', (key) => edit(item, () => EditorComponentItem.selectAddItem(item, -1, key)))}>
              {edi('EDITOR_ADD_ITEM')}
            </button>
          </li>
        </ul>
      </Field>
      <Traits item={item} pool={false} />
      <Traits item={item} pool />
      {mansions && (
        <Field label={val('INSPECT')}>
          <span className="editor-inline">
            <button
              type="button"
              className="editor-picked"
              aria-label={val('INSPECT')}
              onClick={() =>
                setOpened({
                  title: val('SELECT', CommonStringKeys.SELECT_ITEM),
                  items: EditorComponentItem.inspectChoices(),
                  current: item.inspect,
                  onPick: (key) => edit(item, () => EditorComponentItem.selectInspectEvent(item, key)),
                })
              }
            >
              <span>{item.inspect.length === 0 ? val('NONE') : item.inspect}</span>
            </button>
            <Go name={item.inspect} />
            {item.inspect.length > 0 && <Minus label={CommonStringKeys.DELETE.translate()} onClick={() => edit(item, () => EditorComponentItem.selectInspectEvent(item, ''))} />}
          </span>
        </Field>
      )}
      {item.starting && item.tests !== null && (
        <Field label={val('TESTS')}>
          <Tests name={item.sectionName} testable={item} />
        </Field>
      )}
      {opened !== null && (
        <Chooser
          title={opened.title}
          items={opened.items}
          current={opened.current}
          excludeExpansions={opened.title === CommonStringKeys.SELECT_ITEM.translate()}
          onPick={(key) => {
            setOpened(null);
            opened.onPick(key);
          }}
          onClose={() => setOpened(null)}
        />
      )}
    </div>
  );
}
