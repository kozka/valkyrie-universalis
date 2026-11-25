// The event's fields, beside the map: its dialog, trigger, place on the board, sounds, what it adds and removes, its
// buttons with their next events and conditions, its own conditions and its assignments; and the parts of it that a
// token, a door, a UI element, a spawn and a puzzle keep, as Valkyrie's panels for them do (EditorComponentToken and
// the others override the event's). What each field does to the quest is the engine's (EditorComponentEvent,
// EditorComponentVarTestsUtil). Not ported from Valkyrie's panel, which is drawn with Unity; nor are a button's changes
// of quest to the campaign's other quests, which Valkyrie's next-event window does not offer (campaign.ts).
import { useState, type ReactNode } from 'react';
import {
  ASSIGN_OPERATIONS,
  CommonStringKeys,
  EditorComponentEvent,
  EditorComponentVarTestsUtil,
  File,
  Game,
  Path,
  QuestButtonAction,
  QuestData,
  StringKey,
  TEST_OPERATIONS,
  VarOperation,
  VarTestsLogicalOperator,
  VarTestsParenthesis,
  type EditorChoice,
  type ITestable,
  type QuestButtonData,
} from '@universalis/engine';
import { run } from '../ui/run.ts';
import { val } from '../ui/text.ts';
import { Fold, Tool } from './chrome.tsx';
import { openInCampaign, useEditor } from './editorState.ts';
import { Swatch } from './Colours.tsx';
import { TypedText } from './fields.tsx';
import { change, currentSession, select, undoSteps } from './session.ts';
import { edi } from './text.ts';

/** Makes a change to the event that Undo takes back, named after it. */
function edit(name: string, action: () => void): void {
  run(() => change(edi('EDITOR_EDIT_STEP', name), action));
}

/** How a choice reads: {NEW:Type} as Valkyrie's {New Type}, '' as {None}, the rest as it is. */
function choiceLabel(value: string): string {
  if (value === '') return val('NONE');
  const made = /^\{NEW:(\w+)\}$/.exec(value);
  if (made !== null) return val('NEW_X', new StringKey('val', made[1]!.toUpperCase()));
  if (value === '{NEW}') return '{' + CommonStringKeys.NEW.translate() + '}';
  if (value === '{NUMBER}') return '{' + val('NUMBER') + '}';
  return value;
}

/** The heading of a group of choices: Valkyrie's word for it when it has one. */
function groupLabel(group: string): string {
  if (['GENERAL', 'Special', 'NEW', 'FFG', 'ADVENTURES'].includes(group)) return edi('EDITOR_GROUP_' + group.toUpperCase());
  return new StringKey('val', group.toUpperCase()).translate();
}

/** A selection window as a list to pick from, its choices under their groups; the current value first if it is not one of them. */
export function Pick({
  label,
  value,
  choices,
  onPick,
  className,
  labelOf = choiceLabel,
}: {
  label: string;
  value: string;
  choices: EditorChoice[];
  onPick: (value: string) => void;
  className?: string;
  labelOf?: (value: string) => string;
}) {
  const groups = new Map<string, EditorChoice[]>();
  for (const c of choices) {
    const list = groups.get(c.group) ?? [];
    list.push(c);
    groups.set(c.group, list);
  }
  const known = choices.some((c) => c.value === value);
  return (
    <select className={className} aria-label={label} value={value} onChange={(e) => onPick(e.target.value)}>
      {!known && <option value={value}>{labelOf(value)}</option>}
      {[...groups].map(([group, list]) => (
        <optgroup key={group} label={groupLabel(group)}>
          {list.map((c) => (
            <option key={c.value} value={c.value} className={c.greyed === true ? 'editor-greyed' : undefined}>
              {labelOf(c.value) + (c.greyed === true ? ' ·' : '')}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

/** A list to pick a new one from: it shows what it adds, and goes back to that after each pick. */
export function AddPick({ label, choices, onPick, labelOf = choiceLabel }: { label: string; choices: EditorChoice[]; onPick: (value: string) => void; labelOf?: (value: string) => string }) {
  const groups = new Map<string, EditorChoice[]>();
  for (const c of choices) {
    if (c.value === '') continue;
    const list = groups.get(c.group) ?? [];
    list.push(c);
    groups.set(c.group, list);
  }
  return (
    <select className="editor-add" aria-label={label} value="" onChange={(e) => e.target.value !== '' && onPick(e.target.value)}>
      <option value="">{'+ ' + label}</option>
      {[...groups].map(([group, list]) => (
        <optgroup key={group} label={groupLabel(group)}>
          {list.map((c) => (
            <option key={c.value} value={c.value}>
              {labelOf(c.value)}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

/** A part of the panel, which folds (chrome.tsx Fold), remembered by its key for every event. */
function Section({ id, title, count, open, actions, children }: { id: string; title: string; count?: number; open?: boolean; actions?: ReactNode; children: ReactNode }) {
  return (
    <Fold id={'event-' + id} title={title} count={count} open={open} actions={actions} className="editor-event-part" part>
      {children}
    </Fold>
  );
}

/** A field on one row, its name before it, as Valkyrie's panels set them out ("Trigger: [EventStart]"). */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="editor-row-field">
      <span>{label}</span>
      <div className="editor-inline">{children}</div>
    </div>
  );
}

/** ⇨: goes to a component that exists. */
export function Go({ name }: { name: string }) {
  if (!Game.get().currentQuest!.qd.components.has(name)) {
    // Not in Valkyrie: a change of quest, to that quest of the campaign (campaign.ts)
    const questIni = currentSession().root + '/' + name;
    if (!/(^|\/)quest\.ini$/i.test(name) || !File.exists(questIni)) return null;
    return (
      <button type="button" className="editor-back" title={name} aria-label={edi('EDITOR_GO_TO', name)} onClick={() => openInCampaign(Path.getDirectoryName(questIni)!)}>
        ⇨
      </button>
    );
  }
  return (
    <button type="button" className="editor-back" title={name} aria-label={edi('EDITOR_GO_TO', name)} onClick={() => run(() => select(name))}>
      ⇨
    </button>
  );
}

/** What a button can lead to: Valkyrie's next events and, not in Valkyrie, the campaign's other quests (campaign.ts). */
function nextChoices(): EditorChoice[] {
  return [...EditorComponentEvent.nextEventChoices(), ...currentSession().campaign.questChanges.map((value) => ({ value, group: 'ADVENTURES' }))];
}

export function Minus({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="editor-back" aria-label={label} title={label} onClick={onClick}>
      −
    </button>
  );
}

/** A variable typed for {NEW}, or a number for {NUMBER}: a box that asks for it, as Valkyrie's QuestEditorTextEdit. */
function Ask({ label, onDone, onCancel }: { label: string; onDone: (text: string) => void; onCancel: () => void }) {
  const [text, setText] = useState('');
  return (
    <span className="editor-inline">
      <input autoFocus aria-label={label} placeholder={label} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onDone(text)} />
      <button type="button" className="button" onClick={() => onDone(text)}>
        {CommonStringKeys.OK.translate()}
      </button>
      <button type="button" className="button" onClick={onCancel}>
        {CommonStringKeys.CANCEL.translate()}
      </button>
    </span>
  );
}

/** A value of a test or an assignment: a variable or a # value from the list, or a number typed. */
function Value({ name, op }: { name: string; op: VarOperation }) {
  const [asking, setAsking] = useState(false);
  if (asking) {
    return (
      <Ask
        label={val('NUMBER')}
        onDone={(text) => {
          setAsking(false);
          edit(name, () => EditorComponentVarTestsUtil.setNumValue(op, text));
        }}
        onCancel={() => setAsking(false)}
      />
    );
  }
  const choices = EditorComponentVarTestsUtil.valueChoices().map((v) => ({ value: v, group: v.startsWith('#') ? 'VARS' : 'GENERAL' }));
  return (
    <Pick
      className="editor-value"
      label={val('VALUE')}
      value={op.value}
      choices={choices}
      onPick={(v) => (v === '{NUMBER}' ? setAsking(true) : edit(name, () => EditorComponentVarTestsUtil.selectSetValue(op, v)))}
    />
  );
}

/** A variable for a new test or assignment: one from the list, or a new one typed. */
function NewVariable({ name, choices, onAdd }: { name: string; choices: string[]; onAdd: (variable: string, typed: boolean) => void }) {
  const [asking, setAsking] = useState(false);
  if (asking) {
    return (
      <Ask
        label={val('VAR_NAME')}
        onDone={(text) => {
          setAsking(false);
          onAdd(text, true);
        }}
        onCancel={() => setAsking(false)}
      />
    );
  }
  return (
    <AddPick
      label={edi('EDITOR_ADD_VARIABLE', name)}
      choices={choices.map((v) => ({ value: v, group: v.startsWith('#') ? 'VARS' : 'GENERAL' }))}
      onPick={(v) => (v === '{NEW}' ? setAsking(true) : onAdd(v, false))}
    />
  );
}

/** The tests of an event or a button: each comparison, the AND or OR between them, parentheses, and arrows to move them. */
export function Tests({ name, testable, after }: { name: string; testable: ITestable; after?: () => void }) {
  const tests = testable.tests!;
  const act = (action: () => void) =>
    edit(name, () => {
      action();
      after?.();
    });
  return (
    <div className="editor-tests">
      <ol>
        {tests.varTestsComponents.map((tc, i) => {
          const moves = EditorComponentVarTestsUtil.moves(tests, i);
          const arrows = (
            <span className="editor-arrows">
              <button type="button" className="editor-back" disabled={!moves.down} aria-label={val('DOWN')} onClick={() => act(() => tests.moveComponent(i, false))}>
                ↓
              </button>
              <button type="button" className="editor-back" disabled={!moves.up} aria-label={val('UP')} onClick={() => act(() => tests.moveComponent(i, true))}>
                ↑
              </button>
            </span>
          );
          if (tc instanceof VarOperation) {
            return (
              <li key={i} className="editor-inline">
                {arrows}
                <code>{tc.var}</code>
                <select className="editor-op" aria-label={val('OP')} value={tc.operation} onChange={(e) => act(() => EditorComponentVarTestsUtil.selectSetOp(tc, e.target.value))}>
                  {[...new Set([tc.operation, ...TEST_OPERATIONS])].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <Value name={name} op={tc} />
                <Minus label={CommonStringKeys.DELETE.translate()} onClick={() => act(() => EditorComponentVarTestsUtil.removeOp(tests, i))} />
              </li>
            );
          }
          if (tc instanceof VarTestsLogicalOperator) {
            return (
              <li key={i}>
                <button type="button" className="button editor-logic" onClick={() => act(() => tc.nextLogicalOperator())}>
                  {tc.op === 'AND' ? CommonStringKeys.AND.translate() : CommonStringKeys.OR.translate()}
                </button>
              </li>
            );
          }
          if (tc instanceof VarTestsParenthesis) {
            return (
              <li key={i} className="editor-inline">
                {arrows}
                <code>{tc.parenthesis}</code>
                <Minus label={CommonStringKeys.DELETE.translate()} onClick={() => act(() => tests.remove(i))} />
              </li>
            );
          }
          return null;
        })}
      </ol>
      <span className="editor-inline">
        <NewVariable
          name={name}
          choices={EditorComponentVarTestsUtil.testVarChoices()}
          onAdd={(v, typed) => act(() => (typed ? EditorComponentVarTestsUtil.newVar(v, testable) : EditorComponentVarTestsUtil.selectAddOp(v, testable)))}
        />
        {tests.varTestsComponents.length > 0 && (
          <button type="button" className="button" onClick={() => act(() => EditorComponentVarTestsUtil.selectAddParenthesis(testable))}>
            (...)
          </button>
        )}
      </span>
    </div>
  );
}

/** The assignments an event makes: a variable, how (=, +…) and a value. */
function Assignments({ name, testable }: { name: string; testable: ITestable }) {
  return (
    <div className="editor-tests">
      <ol>
        {testable.operations!.map((op, i) => (
          <li key={i} className="editor-inline">
            <code>{op.var}</code>
            <select className="editor-op" aria-label={val('OP')} value={op.operation} onChange={(e) => edit(name, () => EditorComponentVarTestsUtil.selectSetOp(op, e.target.value))}>
              {[...new Set([op.operation, ...ASSIGN_OPERATIONS])].map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <Value name={name} op={op} />
            <Minus label={CommonStringKeys.DELETE.translate()} onClick={() => edit(name, () => EditorComponentVarTestsUtil.removeAssignOp(testable, op))} />
          </li>
        ))}
      </ol>
      <NewVariable
        name={name}
        choices={EditorComponentVarTestsUtil.assignVarChoices()}
        onAdd={(v, typed) => edit(name, () => (typed ? EditorComponentVarTestsUtil.newVar(v, testable, false) : EditorComponentVarTestsUtil.selectAddOp(v, testable, false)))}
      />
    </div>
  );
}

/** A list of components or events: each one can be replaced or taken out, and new ones go at its end. */
function Names({
  label,
  names,
  choices,
  onReplace,
  onRemove,
  onAdd,
}: {
  label: string;
  names: readonly string[];
  choices: EditorChoice[];
  onReplace: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onAdd: (value: string) => void;
}) {
  return (
    <ul className="editor-names">
      {names.map((n, i) => (
        <li key={i} className="editor-inline">
          <Pick label={label} value={n} choices={choices} onPick={(v) => onReplace(i, v)} />
          <Go name={n} />
          <Minus label={CommonStringKeys.DELETE.translate()} onClick={() => onRemove(i)} />
        </li>
      ))}
      <li>
        <AddPick label={label} choices={choices} onPick={onAdd} />
      </li>
    </ul>
  );
}

const FAILED_ACTIONS: [QuestButtonAction, string][] = [
  [QuestButtonAction.NONE, 'NONE'],
  [QuestButtonAction.DISABLE, 'DISABLE'],
  [QuestButtonAction.HIDE, 'HIDE'],
];

/** What a button's "?" says of its condition: none, or what a failed one does (the graph's colours). */
function conditionClass(button: QuestButtonData): string {
  if (!button.hasCondition) return '';
  if (button.conditionFailedAction === QuestButtonAction.HIDE) return ' editor-condition-hide';
  if (button.conditionFailedAction === QuestButtonAction.DISABLE) return ' editor-condition-disable';
  return ' editor-condition-none';
}

/** Valkyrie's window for a button's condition: its tests and what a failed one does, kept with Ok, taken back with Cancel. */
// Valkyrie: EditorComponentEvent.cs EditorComponentEvent.SetButtonCondition (EditorComponentVarTestsUtil)
function ConditionWindow({ event, number, button, onClose }: { event: QuestData.Event; number: number; button: QuestButtonData; onClose: () => void }) {
  const name = event.sectionName;
  // What Cancel takes back: the changes made while it was open
  const [start] = useState(() => currentSession().history.undoLabels.length);
  const cancel = () => {
    const made = currentSession().history.undoLabels.length - start;
    if (made > 0) run(() => undoSteps(made));
    onClose();
  };
  return (
    <div
      className="editor-chooser-layer"
      onKeyDown={(e) => {
        if (e.key !== 'Escape') return;
        e.stopPropagation();
        cancel();
      }}
      onClick={(e) => e.target === e.currentTarget && cancel()}
    >
      <section className="editor-condition-window" role="dialog" aria-modal="true" aria-labelledby="editor-condition-title">
        <h2 id="editor-condition-title">{edi('EDITOR_CONDITION_OF', number, name)}</h2>
        <h3>{val('TESTS')}</h3>
        <Tests name={name} testable={button} after={() => EditorComponentEvent.setConditionFailedAction(button, button.rawConditionFailedAction)} />
        <div className="editor-condition-actions" role="radiogroup" aria-label={edi('EDITOR_CONDITION_FAILED')}>
          {FAILED_ACTIONS.map(([action, key]) => (
            <button
              key={key}
              type="button"
              role="radio"
              className={'button editor-condition-' + key.toLowerCase()}
              disabled={!button.hasCondition}
              aria-checked={button.hasCondition && button.conditionFailedAction === action}
              onClick={() => edit(name, () => EditorComponentEvent.setConditionFailedAction(button, action))}
            >
              {val(key)}
            </button>
          ))}
        </div>
        <footer className="editor-condition-foot">
          <button type="button" className="button" onClick={cancel}>
            {CommonStringKeys.CANCEL.translate()}
          </button>
          <button type="button" className="button editor-ok" autoFocus onClick={onClose}>
            {CommonStringKeys.OK.translate()}
          </button>
        </footer>
      </section>
    </div>
  );
}

/** A button: its colour, its label in the current language, its next events, and its condition in a window of its own. */
function Button({ event, number, button }: { event: QuestData.Event; number: number; button: QuestButtonData }) {
  const name = event.sectionName;
  const [conditions, setConditions] = useState(false);
  const title = edi('EDITOR_CONDITION') + (button.hasCondition ? ': ' + val(FAILED_ACTIONS.find(([a]) => a === button.conditionFailedAction)?.[1] ?? 'NONE') : '');
  return (
    <li className="editor-button">
      <span className="editor-inline">
        <b className="editor-number">{number}</b>
        <Swatch label={val('COLOR')} value={button.color} any onPick={(c) => edit(name, () => EditorComponentEvent.selectButtonColour(event, number, c))} />
        <TypedText
          rich
          label={edi('EDITOR_BUTTON_LABEL', number)}
          textKey={button.label.key}
          value={button.label.translate(true)}
          onDone={(text) => edit(name, () => EditorComponentEvent.updateButtonLabel(event, number, text))}
        />
        <button
          type="button"
          className={'editor-tool editor-condition-toggle' + conditionClass(button)}
          aria-haspopup="dialog"
          aria-label={edi('EDITOR_CONDITION')}
          title={title}
          onClick={() => setConditions(true)}
        >
          ?
        </button>
      </span>
      <Names
        label={edi('EDITOR_NEXT_EVENT', number)}
        names={button.eventNames}
        choices={nextChoices()}
        onReplace={(i, v) => edit(name, () => EditorComponentEvent.selectAddEvent(event, i, number, true, v))}
        onRemove={(i) => edit(name, () => EditorComponentEvent.removeEvent(event, i, number))}
        onAdd={(v) => edit(name, () => EditorComponentEvent.selectAddEvent(event, button.eventNames.length, number, false, v))}
      />
      {conditions && <ConditionWindow event={event} number={number} button={button} onClose={() => setConditions(false)} />}
    </li>
  );
}

/** Which of the event's parts a component shows, as Valkyrie's panels override them. */
function parts(event: QuestData.Event) {
  const token = event instanceof QuestData.Token;
  const door = event instanceof QuestData.Door;
  const ui = event instanceof QuestData.UI;
  const spawn = event instanceof QuestData.Spawn;
  const puzzle = event instanceof QuestData.Puzzle;
  return {
    // EditorComponentPuzzle.AddEventDialog
    dialog: !puzzle,
    // EditorComponentToken, Door and UI .AddEventTrigger
    trigger: !token && !door && !ui,
    // EditorComponentEvent.AddLocationType; EditorComponentSpawn's toggles; Token, Door, UI and Puzzle have none
    location: spawn ? ('spawn' as const) : token || door || ui || puzzle ? null : ('event' as const),
    // EditorComponentToken.AddEventVarConditionComponents
    tests: !token,
  };
}

export function EventPanel({ event }: { event: QuestData.Event }) {
  const name = event.sectionName;
  const show = parts(event);
  const game = Game.get();
  const descent = game.gameType.typeName() === 'D2E';
  const positionType = event instanceof QuestData.Spawn ? EditorComponentEvent.spawnLocationType(event) : EditorComponentEvent.locationType(event);
  const sounds = (event.audio === '' ? 0 : 1) + event.music.length;
  return (
    <div className="editor-event">
      {show.dialog && (
        <Section
          id="dialog"
          title={val('DIALOG')}
          actions={event.display && <Tool icon="eye" label={edi('EDITOR_SHOW_IN_GAME')} onClick={() => useEditor.setState({ showing: true, stage: false })} />}
        >
          <TypedText
            label={val('DIALOG')}
            multiline
            textKey={event.text_key}
            value={EditorComponentEvent.dialogText(event)}
            onDone={(text) => edit(name, () => EditorComponentEvent.updateText(event, text))}
          />
        </Section>
      )}
      <Section id="sound" title={edi('EDITOR_SOUND')} count={sounds} open={sounds > 0}>
        <Row label={val('AUDIO')}>
          <Pick label={val('AUDIO')} value={event.audio} choices={EditorComponentEvent.audioChoices()} onPick={(v) => edit(name, () => EditorComponentEvent.selectEventAudio(event, v))} />
        </Row>
        <div className="editor-list-field">
          <span>{val('MUSIC')}</span>
          <Names
            label={val('MUSIC')}
            names={event.music}
            choices={EditorComponentEvent.audioChoices().filter((c) => c.value !== '')}
            onReplace={(i, v) =>
              edit(name, () => {
                EditorComponentEvent.removeMusic(event, i);
                EditorComponentEvent.selectMusic(event, i, v);
              })
            }
            onRemove={(i) => edit(name, () => EditorComponentEvent.removeMusic(event, i))}
            onAdd={(v) => edit(name, () => EditorComponentEvent.selectMusic(event, event.music.length, v))}
          />
        </div>
      </Section>
      <Section id="when" title={edi('EDITOR_WHEN')}>
        {show.trigger && (
          <Row label={CommonStringKeys.TRIGGER.translate()}>
            <Pick
              label={CommonStringKeys.TRIGGER.translate()}
              value={event.trigger}
              choices={EditorComponentEvent.triggerChoices()}
              onPick={(v) => edit(name, () => EditorComponentEvent.selectEventTrigger(event, v))}
            />
          </Row>
        )}
        {show.location !== null && (
          <Row label={val('POSITION')}>
            <select
              aria-label={val('POSITION')}
              value={positionType}
              onChange={(e) =>
                edit(name, () => {
                  // As many presses of Valkyrie's button as it takes to get there
                  const wanted = e.target.value;
                  for (let i = 0; i < 5; i++) {
                    if (event instanceof QuestData.Spawn) {
                      if (EditorComponentEvent.spawnLocationType(event) === wanted) break;
                      EditorComponentEvent.spawnPositionTypeCycle(event);
                    } else {
                      if (EditorComponentEvent.locationType(event) === wanted) break;
                      EditorComponentEvent.positionTypeCycle(event);
                    }
                  }
                })
              }
            >
              {(show.location === 'spawn' ? ['UNUSED', 'HIGHLIGHT'] : ['UNUSED', 'CAMERA', 'HIGHLIGHT', 'MIN_CAM', 'MAX_CAM']).map((t) => (
                <option key={t} value={t}>
                  {val(t)}
                </option>
              ))}
            </select>
          </Row>
        )}
        <Row label={val('QUOTA')}>
          <span className="editor-inline editor-quota">
            {event.quotaVar.length === 0 ? (
              <TypedText label={val('QUOTA')} value={String(event.quota)} onDone={(text) => edit(name, () => EditorComponentEvent.setQuota(event, text))} />
            ) : (
              <>
                <code>{event.quotaVar}</code>
                <button type="button" className="button" onClick={() => edit(name, () => EditorComponentEvent.setQuotaInt(event))}>
                  {val('NUMBER')}
                </button>
              </>
            )}
            <NewVariable
              name={name}
              choices={['{NEW}', ...EditorComponentVarTestsUtil.questVars()]}
              onAdd={(v, typed) => edit(name, () => (typed ? EditorComponentEvent.newQuotaVar(event, v) : EditorComponentEvent.selectQuotaVar(event, v)))}
            />
          </span>
        </Row>
      </Section>
      <Section id="shows" title={edi('EDITOR_SHOWS_HIDES')} count={event.addComponents.length + event.removeComponents.length}>
        {(['ADD_COMPONENTS', 'REMOVE_COMPONENTS'] as const).map((key) => {
          const add = key === 'ADD_COMPONENTS';
          return (
            <div key={key} className="editor-list-field">
              <span>{val(key).replace(/:$/, '')}</span>
              <Names
                label={val(key).replace(/:$/, '')}
                names={add ? event.addComponents : event.removeComponents}
                choices={EditorComponentEvent.visibilityChoices(add)}
                onReplace={(i, v) => edit(name, () => EditorComponentEvent.selectAddVisibility(event, add, i, v))}
                onRemove={(i) => edit(name, () => EditorComponentEvent.removeVisibility(event, i, add))}
                onAdd={(v) => edit(name, () => EditorComponentEvent.selectAddVisibility(event, add, -1, v))}
              />
            </div>
          );
        })}
      </Section>
      <Section
        id="buttons"
        title={val('BUTTONS')}
        count={event.buttons.length}
        actions={<Tool icon="plus" label={edi('EDITOR_ADD_BUTTON')} onClick={() => edit(name, () => EditorComponentEvent.addButton(event))} />}
      >
        <Row label={val('NEXT_EVENTS')}>
          <button type="button" className="button" aria-pressed={event.randomEvents} onClick={() => edit(name, () => EditorComponentEvent.toggleRandom(event))}>
            {val(event.randomEvents ? 'Random' : 'Ordered')}
          </button>
        </Row>
        <ol className="editor-buttons">
          {event.buttons.map((b, i) => (
            <Button key={i} event={event} number={i + 1} button={b} />
          ))}
        </ol>
        {event.buttons.length === 0 && <p className="editor-empty-hint">{edi('EDITOR_NO_BUTTONS')}</p>}
        {event.buttons.length > 0 && (
          <button type="button" className="editor-link editor-remove-last" onClick={() => edit(name, () => EditorComponentEvent.removeButton(event))}>
            {edi('EDITOR_REMOVE_BUTTON', event.buttons.length)}
          </button>
        )}
      </Section>
      {show.tests && (
        <Section id="tests" title={val('TESTS')} count={event.tests?.varTestsComponents.length ?? 0}>
          <Tests name={name} testable={event} />
        </Section>
      )}
      <Section id="assign" title={val('ASSIGN')} count={event.operations?.length ?? 0}>
        <Assignments name={name} testable={event} />
      </Section>
      {descent && (
        <Section id="selection" title={val('SELECTION')} open={event.heroListName !== ''}>
          <span className="editor-inline">
            <Pick
              label={val('SELECTION')}
              value={event.heroListName}
              choices={[{ value: '', group: 'GENERAL' }, ...[...game.currentQuest!.qd.components].filter(([, c]) => c instanceof QuestData.Event).map(([n]) => ({ value: n, group: 'EVENT' }))]}
              onPick={(v) => edit(name, () => EditorComponentEvent.selectEventHighlight(event, v))}
            />
            <Go name={event.heroListName} />
          </span>
          <span className="editor-inline">
            {(['MIN', 'MAX'] as const).map((key) => (
              <label key={key} className="editor-inline">
                {val(key)}
                <select value={key === 'MAX' ? event.maxHeroes : event.minHeroes} onChange={(e) => edit(name, () => EditorComponentEvent.selectEventHeroCount(event, key === 'MAX', e.target.value))}>
                  {Array.from({ length: game.gameType.maxHeroes() + 1 }, (_, i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </span>
        </Section>
      )}
    </div>
  );
}
