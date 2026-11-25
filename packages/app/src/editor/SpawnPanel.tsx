// The fields of a spawn beside the map, as Valkyrie's panel for it has them (EditorComponentSpawn): whether its monsters
// come activated, in Descent whether it is a unique one with its title and text, its health, its monster types and the
// traits its monster is drawn by, and in Descent its places for each number of heroes. What each does is the engine's
// (QuestEditor/EditorComponentSpawn.ts); its place and the parts of the event it keeps are EventPanel's. Not ported
// from Valkyrie's panel, which is drawn with Unity.
import { useState } from 'react';
import {
  CommonStringKeys,
  EditorComponentSpawn,
  Game,
  MonsterData,
  StringKey,
  ValkyrieConstants,
  floatToString,
  type QuestData,
  type SelectionItem,
} from '@universalis/engine';
import { val } from '../ui/text.ts';
import { Chooser } from './Chooser.tsx';
import { AddPick, Go, Minus, Pick } from './EventPanel.tsx';
import { Field, Toggle, TypedText } from './fields.tsx';
import { edit } from './PiecePanel.tsx';
import { edi } from './text.ts';

interface Open {
  title: string;
  items: SelectionItem[];
  current: string;
  /** Whether the packs the quest does not ask for start left out, as the monster window does (ExcludeExpansions). */
  exclude: boolean;
  onPick: (key: string) => void;
}

/** A monster type as the panel names it: the content's name, or the component's. */
function monsterName(type: string): string {
  const cd = Game.get().cd;
  return cd.containsKey(MonsterData, type) ? cd.get(MonsterData, type).name.translate() : type;
}

/** A trait as Valkyrie's trait windows name it. */
export function traitName(trait: string): string {
  return new StringKey('val', trait).translate();
}

/** The traits of the content's monsters. */
function traitChoices() {
  return EditorComponentSpawn.traitChoices().map((trait) => ({ value: trait, group: 'TRAITS' }));
}

function Traits({ spawn, pool }: { spawn: QuestData.Spawn; pool: boolean }) {
  const list = pool ? spawn.mTraitsPool : spawn.mTraitsRequired;
  const label = val(pool ? 'POOL_TRAITS' : 'REQ_TRAITS').replace(/:$/, '');
  // Valkyrie's panel offers − while something else would be left
  const others = spawn.mTypes.length + (pool ? spawn.mTraitsRequired.length : spawn.mTraitsPool.length);
  return (
    <Field label={label}>
      <ul className="editor-names">
        {list.map((trait, i) => (
          <li key={i} className="editor-inline">
            <Pick label={label} value={trait} choices={traitChoices()} labelOf={traitName} onPick={(v) => edit(spawn, () => EditorComponentSpawn.selectMonsterTraitReplace(spawn, i, pool, v))} />
            {(others > 0 || list.length > 1) && <Minus label={CommonStringKeys.DELETE.translate()} onClick={() => edit(spawn, () => EditorComponentSpawn.monsterTraitsRemove(spawn, i, pool))} />}
          </li>
        ))}
        <li>
          <AddPick label={label} choices={traitChoices()} labelOf={traitName} onPick={(v) => edit(spawn, () => EditorComponentSpawn.selectMonsterTrait(spawn, pool, v))} />
        </li>
      </ul>
    </Field>
  );
}

/**
 * The numbers of heroes a spawn has places for (EditorComponentSpawn.AddPlacementComponenets: 2 to 4). Not in
 * Valkyrie: 1 too where the scenario can be played by one (DooM's missions) or the spawn has places for one, which
 * Valkyrie's panel leaves out though the spawn keeps them.
 */
function placesFor(spawn: QuestData.Spawn): number[] {
  const one = Game.get().currentQuest!.qd.quest.minHero < 2 || (spawn.placement[1]?.length ?? 0) > 0;
  return one ? [1, 2, 3, 4] : [2, 3, 4];
}

export function SpawnPanel({ spawn }: { spawn: QuestData.Spawn }) {
  const [opened, setOpened] = useState<Open | null>(null);
  const descent = Game.get().gameType.typeName() === ValkyrieConstants.typeDescent;
  const monsters = (current: string, onPick: (key: string) => void) =>
    setOpened({ title: val('SELECT', CommonStringKeys.MONSTER), items: EditorComponentSpawn.monsterTypeChoices(), current, exclude: true, onPick });
  const places = (current: string, onPick: (key: string) => void) =>
    setOpened({ title: CommonStringKeys.SELECT_ITEM.translate(), items: EditorComponentSpawn.placeChoices(), current, exclude: false, onPick });
  const typesRemovable = spawn.mTypes.length > 1 || spawn.mTraitsRequired.length > 0 || spawn.mTraitsPool.length > 0;
  return (
    <div className="editor-piece">
      <Toggle label={val('ACTIVATED')} on={spawn.activated} onToggle={() => edit(spawn, () => EditorComponentSpawn.activatedToggle(spawn))} />
      {descent && <Toggle label={val('MONSTER_UNIQUE')} on={spawn.unique} onToggle={() => edit(spawn, () => EditorComponentSpawn.uniqueToggle(spawn))} />}
      {descent && spawn.unique && (
        <>
          <Field label={val('UNIQUE_TITLE')}>
            <TypedText label={val('UNIQUE_TITLE')} textKey={spawn.uniquetitle_key} value={spawn.uniqueTitle.translate()} onDone={(text) => edit(spawn, () => EditorComponentSpawn.updateUniqueTitle(spawn, text))} />
          </Field>
          <Field label={val('UNIQUE_INFO')}>
            <TypedText label={val('UNIQUE_INFO')} multiline textKey={spawn.uniquetext_key} value={spawn.uniqueText.translate()} onDone={(text) => edit(spawn, () => EditorComponentSpawn.updateUniqueText(spawn, text))} />
          </Field>
        </>
      )}
      <div className="editor-pair">
        <Field label={val('HEALTH')}>
          <TypedText label={val('HEALTH')} number={{ step: 1 }} value={floatToString(spawn.uniqueHealthBase)} onDone={(text) => edit(spawn, () => EditorComponentSpawn.updateHealth(spawn, text))} />
        </Field>
        <Field label={val('HEALTH_HERO')}>
          <TypedText label={val('HEALTH_HERO')} number={{ step: 1 }} value={floatToString(spawn.uniqueHealthHero)} onDone={(text) => edit(spawn, () => EditorComponentSpawn.updateHealthHero(spawn, text))} />
        </Field>
      </div>
      <Field label={val('TYPES')}>
        <ul className="editor-names">
          {spawn.mTypes.map((type, i) => (
            <li key={i} className="editor-inline">
              <button type="button" className="editor-picked" aria-label={edi('EDITOR_MONSTER_N', i + 1)} onClick={() => monsters(type, (key) => edit(spawn, () => EditorComponentSpawn.selectMonsterType(spawn, key, i, true)))}>
                <span>{monsterName(type)}</span>
                {monsterName(type) !== type && <code>{type}</code>}
              </button>
              <Go name={type} />
              {typesRemovable && <Minus label={CommonStringKeys.DELETE.translate()} onClick={() => edit(spawn, () => EditorComponentSpawn.monsterTypeRemove(spawn, i))} />}
            </li>
          ))}
          <li>
            <button type="button" className="button" onClick={() => monsters('', (key) => edit(spawn, () => EditorComponentSpawn.selectMonsterType(spawn, key, spawn.mTypes.length)))}>
              {edi('EDITOR_ADD_MONSTER')}
            </button>
          </li>
        </ul>
      </Field>
      <Traits spawn={spawn} pool={false} />
      <Traits spawn={spawn} pool />
      {descent &&
        placesFor(spawn).map((heroes) => (
          <Field key={heroes} label={heroes === 1 ? edi('EDITOR_ONE_HERO') : val('NUMBER_HEROS', heroes).replace(/:$/, '')}>
            <ul className="editor-names">
              {(spawn.placement[heroes] ?? []).map((place, i) => (
                <li key={i} className="editor-inline">
                  <button type="button" className="editor-picked" aria-label={heroes === 1 ? edi('EDITOR_PLACE_N_ONE', i + 1) : edi('EDITOR_PLACE_N', heroes, i + 1)} onClick={() => places(place, (key) => edit(spawn, () => EditorComponentSpawn.monsterPlaceAddSelection(spawn, heroes, i, key)))}>
                    <span>{place}</span>
                  </button>
                  <Go name={place} />
                  <Minus label={CommonStringKeys.DELETE.translate()} onClick={() => edit(spawn, () => EditorComponentSpawn.monsterPlaceRemove(spawn, heroes, i))} />
                </li>
              ))}
              <li>
                <button type="button" className="button" onClick={() => places('', (key) => edit(spawn, () => EditorComponentSpawn.monsterPlaceAddSelection(spawn, heroes, -1, key)))}>
                  {heroes === 1 ? edi('EDITOR_ADD_PLACE_ONE') : edi('EDITOR_ADD_PLACE', heroes)}
                </button>
              </li>
            </ul>
          </Field>
        ))}
      {opened !== null && (
        <Chooser
          title={opened.title}
          items={opened.items}
          current={opened.current}
          excludeExpansions={opened.exclude}
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

