// The fields of a custom monster and of an activation beside the map, as Valkyrie's panels for them have them
// (EditorComponentCustomMonster, EditorComponentActivation): a monster's base, and what it takes from it or has of its
// own (name, info, health, horror, awareness, pictures), its activations, traits, investigator attacks and evade and
// horror events; an activation's texts, who goes first and its conditions. What each does is the engine's
// (QuestEditor/EditorComponentCustomMonster.ts, EditorComponentActivation.ts). Not ported from Valkyrie's panels,
// which are drawn with Unity.
import { useState, type ReactNode } from 'react';
import {
  CommonStringKeys,
  EditorComponent,
  EditorComponentActivation,
  EditorComponentCustomMonster,
  Game,
  MonsterData,
  QuestData,
  StringKey,
  ValkyrieConstants,
  floatToString,
  type ActivationText,
  type SelectionItem,
} from '@universalis/engine';
import { val } from '../ui/text.ts';
import { Chooser } from './Chooser.tsx';
import { AddPick, Go, Minus, Tests } from './EventPanel.tsx';
import { Field, Toggle, TypedText } from './fields.tsx';
import { edit } from './PiecePanel.tsx';
import { traitName } from './SpawnPanel.tsx';
import { edi } from './text.ts';

interface Open {
  title: string;
  items: SelectionItem[];
  current: string;
  exclude: boolean;
  pictures: boolean;
  onPick: (key: string) => void;
}

/**
 * A field the base monster gives until it is set (Valkyrie's Set), and that Reset gives back to it; without a base it
 * is always the monster's own.
 */
function Own({ label, own, base, onSet, onReset, children }: { label: string; own: boolean; base: boolean; onSet: () => void; onReset: () => void; children: ReactNode }) {
  return (
    <Field label={label}>
      {!base || own ? (
        <>
          {children}
          {base && (
            <button type="button" className="button editor-reset" onClick={onReset}>
              {CommonStringKeys.RESET.translate()}
            </button>
          )}
        </>
      ) : (
        <button type="button" className="button" aria-label={label} onClick={onSet}>
          {edi('EDITOR_SET_OWN')}
        </button>
      )}
    </Field>
  );
}

function MonsterFields({ monster }: { monster: QuestData.CustomMonster }) {
  const [opened, setOpened] = useState<Open | null>(null);
  const mansions = Game.get().gameType.typeName() === ValkyrieConstants.typeMom;
  const base = monster.baseMonster.length > 0;
  const cd = Game.get().cd;
  const baseName = base && cd.containsKey(MonsterData, monster.baseMonster) ? cd.get(MonsterData, monster.baseMonster).name.translate() : monster.baseMonster;
  const pictureChooser = (title: string, current: string, onPick: (key: string) => void) =>
    setOpened({ title, items: EditorComponent.customImageChoices(), current, exclude: true, pictures: true, onPick });
  const eventChooser = (title: string, current: string, onPick: (key: string) => void) =>
    setOpened({ title, items: EditorComponentCustomMonster.eventChoices(), current, exclude: false, pictures: false, onPick });
  const eventField = (label: string, current: string, onPick: (key: string) => void) => (
    <Field label={label}>
      <span className="editor-inline">
        <button type="button" className="editor-picked" aria-label={label} onClick={() => eventChooser(val('SELECT', new StringKey('val', 'EVENT')), current, (key) => edit(monster, () => onPick(key)))}>
          <span>{current.length === 0 ? val('NONE') : current}</span>
        </button>
        <Go name={current} />
        {current.length > 0 && <Minus label={CommonStringKeys.DELETE.translate()} onClick={() => edit(monster, () => onPick(''))} />}
      </span>
    </Field>
  );
  return (
    <>
      <Field label={val('BASE')}>
        <span className="editor-inline">
          <button
            type="button"
            className="editor-picked"
            aria-label={val('BASE')}
            onClick={() =>
              setOpened({
                title: val('SELECT', CommonStringKeys.MONSTER),
                items: EditorComponentCustomMonster.baseChoices(),
                current: monster.baseMonster,
                exclude: true,
                pictures: false,
                onPick: (key) => edit(monster, () => EditorComponentCustomMonster.selectSetBase(monster, key)),
              })
            }
          >
            <span>{base ? baseName : val('NONE')}</span>
            {base && baseName !== monster.baseMonster && <code>{monster.baseMonster}</code>}
          </button>
          {base && (
            <button type="button" className="button" onClick={() => edit(monster, () => EditorComponentCustomMonster.selectSetBase(monster, '{NONE}'))}>
              {edi('EDITOR_NO_BASE')}
            </button>
          )}
        </span>
      </Field>
      <Own
        label={val('NAME')}
        own={monster.monsterName.keyExists()}
        base={base}
        onSet={() => edit(monster, () => EditorComponentCustomMonster.setName(monster))}
        onReset={() => edit(monster, () => EditorComponentCustomMonster.clearName(monster))}
      >
        <TypedText label={val('NAME')} textKey={monster.monstername_key} value={monster.monsterName.translate(true)} onDone={(text) => edit(monster, () => EditorComponentCustomMonster.updateName(monster, text))} />
      </Own>
      {!mansions && (
        <Own
          label={val('INFO')}
          own={monster.info.keyExists()}
          base={base}
          onSet={() => edit(monster, () => EditorComponentCustomMonster.setInfo(monster))}
          onReset={() => edit(monster, () => EditorComponentCustomMonster.clearInfo(monster))}
        >
          <TypedText label={val('INFO')} multiline textKey={monster.info_key} value={monster.info.translate(true)} onDone={(text) => edit(monster, () => EditorComponentCustomMonster.updateInfo(monster, text))} />
        </Own>
      )}
      {mansions ? <MansionsActivation monster={monster} open={setOpened} /> : <DescentActivations monster={monster} open={setOpened} />}
      <Field label={CommonStringKeys.TRAITS.translate()}>
        <ul className="editor-names">
          {monster.traits.map((trait, i) => (
            <li key={i} className="editor-inline">
              <span className="editor-pack">{traitName(trait)}</span>
              <Minus label={CommonStringKeys.DELETE.translate()} onClick={() => edit(monster, () => EditorComponentCustomMonster.removeTrait(monster, i))} />
            </li>
          ))}
          <li>
            <AddPick
              label={CommonStringKeys.TRAITS.translate()}
              choices={EditorComponentCustomMonster.traitChoices().map((trait) => ({ value: trait, group: 'TRAITS' }))}
              labelOf={traitName}
              onPick={(v) => edit(monster, () => EditorComponentCustomMonster.selectAddTraits(monster, v))}
            />
          </li>
        </ul>
      </Field>
      <Own
        label={val('HEALTH')}
        own={monster.healthDefined}
        base={base}
        onSet={() => edit(monster, () => EditorComponentCustomMonster.setHealth(monster))}
        onReset={() => edit(monster, () => EditorComponentCustomMonster.clearHealth(monster))}
      >
        <div className="editor-pair">
          <TypedText label={val('HEALTH')} number={{ step: 1 }} value={floatToString(monster.healthBase)} onDone={(text) => edit(monster, () => EditorComponentCustomMonster.updateHealth(monster, text))} />
          <TypedText label={val('HEALTH_HERO')} number={{ step: 1 }} value={floatToString(monster.healthPerHero)} onDone={(text) => edit(monster, () => EditorComponentCustomMonster.updateHealthHero(monster, text))} />
        </div>
      </Own>
      {mansions && (
        <div className="editor-pair">
          <Own
            label={val('horror')}
            own={monster.horrorDefined}
            base={base}
            onSet={() => edit(monster, () => EditorComponentCustomMonster.setHorror(monster))}
            onReset={() => edit(monster, () => EditorComponentCustomMonster.clearHorror(monster))}
          >
            <TypedText label={val('horror')} number={{ step: 1 }} value={String(monster.horror)} onDone={(text) => edit(monster, () => EditorComponentCustomMonster.updateHorror(monster, text))} />
          </Own>
          <Own
            label={val('AWARENESS')}
            own={monster.awarenessDefined}
            base={base}
            onSet={() => edit(monster, () => EditorComponentCustomMonster.setAwareness(monster))}
            onReset={() => edit(monster, () => EditorComponentCustomMonster.clearAwareness(monster))}
          >
            <TypedText label={val('AWARENESS')} number={{ step: 1 }} value={String(monster.awareness)} onDone={(text) => edit(monster, () => EditorComponentCustomMonster.updateAwareness(monster, text))} />
          </Own>
        </div>
      )}
      {mansions && <Attacks monster={monster} />}
      {(
        [
          ['IMAGE', monster.imagePath, EditorComponentCustomMonster.selectImage, EditorComponentCustomMonster.clearImage],
          ['PLACE_IMG', monster.imagePlace, EditorComponentCustomMonster.selectImagePlace, EditorComponentCustomMonster.clearImagePlace],
        ] as const
      ).map(([key, current, select, clear]) => (
        <Own key={key} label={val(key)} own={current.length > 0} base={base} onSet={() => pictureChooser(val('SELECT_IMAGE'), current, (k) => edit(monster, () => select(monster, k)))} onReset={() => edit(monster, () => clear(monster))}>
          <button type="button" className="editor-picked" aria-label={val(key)} onClick={() => pictureChooser(val('SELECT_IMAGE'), current, (k) => edit(monster, () => select(monster, k)))}>
            <span>{current.length === 0 ? val('NONE') : current}</span>
          </button>
        </Own>
      ))}
      {mansions && eventField(val('EVADE'), monster.evadeEvent, (key) => EditorComponentCustomMonster.selectSetEvade(monster, key))}
      {mansions && eventField(val('horror'), monster.horrorEvent, (key) => EditorComponentCustomMonster.selectSetHorror(monster, key))}
      {opened !== null && (
        <Chooser
          title={opened.title}
          items={opened.items}
          current={opened.current}
          excludeExpansions={opened.exclude}
          pictures={opened.pictures}
          onPick={(key) => {
            setOpened(null);
            opened.onPick(key);
          }}
          onClose={() => setOpened(null)}
        />
      )}
    </>
  );
}

/** Mansions' activation: one event, or the old list of several, which can only be taken away (DepreciatedMoMActivations). */
function MansionsActivation({ monster, open }: { monster: QuestData.CustomMonster; open: (o: Open) => void }) {
  const components = Game.get().currentQuest!.qd.components;
  const old = monster.activations.length > 1 || (monster.activations.length === 1 && !components.has(monster.activations[0]!));
  const label = val('ACTIVATIONS');
  if (old) {
    return (
      <Field label={label}>
        <p className="editor-error">{edi('EDITOR_OLD_ACTIVATIONS')}</p>
        <ul className="editor-names">
          {monster.activations.map((activation, i) => (
            <li key={i} className="editor-inline">
              <span className="editor-pack">{activation}</span>
              <Go name={activation} />
              <Minus label={CommonStringKeys.DELETE.translate()} onClick={() => edit(monster, () => EditorComponentCustomMonster.removeActivation(monster, i))} />
            </li>
          ))}
        </ul>
      </Field>
    );
  }
  const current = monster.activations[0] ?? '';
  return (
    <Field label={label}>
      <span className="editor-inline">
        <button
          type="button"
          className="editor-picked"
          aria-label={label}
          onClick={() =>
            open({
              title: val('SELECT', CommonStringKeys.ACTIVATION),
              items: EditorComponentCustomMonster.mansionsActivationChoices(),
              current,
              exclude: false,
              pictures: false,
              onPick: (key) => edit(monster, () => EditorComponentCustomMonster.selectSetActivation(monster, key)),
            })
          }
        >
          <span>{current.length === 0 ? val('NONE') : current}</span>
        </button>
        <Go name={current} />
        {current.length > 0 && <Minus label={CommonStringKeys.DELETE.translate()} onClick={() => edit(monster, () => EditorComponentCustomMonster.selectSetActivation(monster, ''))} />}
      </span>
    </Field>
  );
}

/** Descent's activations: a list of the scenario's activations, written without their prefix. */
function DescentActivations({ monster, open }: { monster: QuestData.CustomMonster; open: (o: Open) => void }) {
  const label = val('ACTIVATIONS');
  const choose = (current: string, index: number) =>
    open({
      title: val('SELECT', CommonStringKeys.ACTIVATION),
      items: EditorComponentCustomMonster.activationChoices(),
      current,
      exclude: false,
      pictures: false,
      onPick: (key) => edit(monster, () => EditorComponentCustomMonster.selectAddActivation(monster, index, key)),
    });
  return (
    <Field label={label}>
      <ul className="editor-names">
        {monster.activations.map((activation, i) => (
          <li key={i} className="editor-inline">
            <button type="button" className="editor-picked" aria-label={edi('EDITOR_ACTIVATION_N', i + 1)} onClick={() => choose('Activation' + activation, i)}>
              <span>{'Activation' + activation}</span>
            </button>
            <Go name={'Activation' + activation} />
            <Minus label={CommonStringKeys.DELETE.translate()} onClick={() => edit(monster, () => EditorComponentCustomMonster.removeActivation(monster, i))} />
          </li>
        ))}
        <li>
          <button type="button" className="button" onClick={() => choose('', -1)}>
            {edi('EDITOR_ADD_ACTIVATION')}
          </button>
        </li>
      </ul>
    </Field>
  );
}

/** Mansions' investigator attacks: texts by kind, each kind with its +, each text with its −. */
function Attacks({ monster }: { monster: QuestData.CustomMonster }) {
  const label = val('INVESTIGATOR_ATTACKS');
  return (
    <Field label={label}>
      {[...monster.investigatorAttacks].map(([type, attacks]) => (
        <div key={type} className="editor-button">
          <span className="editor-inline">
            <b className="editor-pack">{new StringKey('val', type).translate()}</b>
            <button type="button" className="editor-back" aria-label={edi('EDITOR_ADD_ATTACK', new StringKey('val', type).translate())} title={edi('EDITOR_ADD_ATTACK', new StringKey('val', type).translate())} onClick={() => edit(monster, () => EditorComponentCustomMonster.newInvestigatorAttack(monster, type))}>
              +
            </button>
            <Minus label={CommonStringKeys.DELETE.translate()} onClick={() => edit(monster, () => EditorComponentCustomMonster.removeInvestigatorAttackType(monster, type))} />
          </span>
          {attacks.map((attack, i) => (
            <span key={attack.key} className="editor-inline">
              <TypedText label={attack.key} multiline textKey={attack.key} value={attack.translate(true)} onDone={(text) => edit(monster, () => EditorComponentCustomMonster.updateAttack(monster, type, i, text))} />
              <Minus label={CommonStringKeys.DELETE.translate()} onClick={() => edit(monster, () => EditorComponentCustomMonster.removeInvestigatorAttack(monster, type, attack))} />
            </span>
          ))}
        </div>
      ))}
      <AddPick
        label={edi('EDITOR_ATTACK_KIND')}
        choices={EditorComponentCustomMonster.attackTypeChoices().map((type) => ({ value: type, group: 'TYPE' }))}
        labelOf={(type) => new StringKey('val', type).translate()}
        onPick={(type) => edit(monster, () => EditorComponentCustomMonster.newInvestigatorAttack(monster, type))}
      />
    </Field>
  );
}

function ActivationFields({ activation }: { activation: QuestData.Activation }) {
  const mansions = Game.get().gameType.typeName() === ValkyrieConstants.typeMom;
  const text = (which: ActivationText, label: string, value: StringKey, multiline = true) => (
    <Field label={label}>
      <TypedText label={label} multiline={multiline} textKey={value.key} value={value.translate(true)} onDone={(typed) => edit(activation, () => EditorComponentActivation.updateText(activation, which, typed))} />
    </Field>
  );
  if (mansions) {
    return (
      <>
        {text('ability', val('INITIAL_MESSAGE').replace(/:$/, ''), activation.ability)}
        {text('movebutton', val('UNABLE_BUTTON').replace(/:$/, ''), activation.moveButton, false)}
        {text('master', val('ATTACK_MESSAGE').replace(/:$/, ''), activation.masterActions)}
        {text('move', val('NO_ATTACK_MESSAGE').replace(/:$/, ''), activation.move)}
      </>
    );
  }
  // Valkyrie's panel gives a Descent activation its list of conditions when it draws it (D2EActivation)
  EditorComponentActivation.givenTests(activation);
  return (
    <>
      {text('ability', val('ABILITY'), activation.ability)}
      <Toggle label={val('MONSTER_MASTER') + ': ' + val('FIRST')} on={activation.masterFirst} onToggle={() => edit(activation, () => EditorComponentActivation.toggleMasterFirst(activation))} />
      {text('master', val('MONSTER_MASTER'), activation.masterActions)}
      <Toggle label={val('MONSTER_MINION') + ': ' + val('FIRST')} on={activation.minionFirst} onToggle={() => edit(activation, () => EditorComponentActivation.toggleMinionFirst(activation))} />
      {text('minion', val('MONSTER_MINION'), activation.minionActions)}
      {activation.tests !== null && (
        <Field label={val('TESTS')}>
          <Tests name={activation.sectionName} testable={activation} />
        </Field>
      )}
    </>
  );
}

/** The fields of a custom monster or an activation; nothing for the other types. */
export function MonsterPanel({ component }: { component: QuestData.QuestComponent }) {
  if (component instanceof QuestData.CustomMonster) {
    return (
      <div className="editor-piece">
        <MonsterFields monster={component} />
      </div>
    );
  }
  if (component instanceof QuestData.Activation) {
    return (
      <div className="editor-piece">
        <ActivationFields activation={component} />
      </div>
    );
  }
  return null;
}
