// The scenario's own fields beside the map, as Valkyrie's quest panel has them (EditorComponentQuest): its name,
// whether it is hidden, its cover, the default music, its description, synopsis and authors, the packs it needs, how
// many heroes, how long and how hard. What each does is the engine's (QuestEditor/EditorComponentQuest.ts). Not
// ported from Valkyrie's panel, which is drawn with Unity.
import { EditorComponentQuest, Game, Path, StringKey, floatToString, type QuestText } from '@universalis/engine';
import { Picture } from '../ui/Picture.tsx';
import { run } from '../ui/run.ts';
import { val } from '../ui/text.ts';
import { Fold } from './chrome.tsx';
import { Field, Toggle, TypedText } from './fields.tsx';
import { change } from './session.ts';
import { edi } from './text.ts';

/** A change to the scenario that Undo takes back. */
function edit(action: () => void): void {
  run(() => change(edi('EDITOR_EDIT_STEP', val('QUEST')), action));
}

function QuestTextField({ which, label, multiline = true, maxLength }: { which: QuestText; label: string; multiline?: boolean; maxLength?: number }) {
  const value = new StringKey('qst', 'quest.' + which).translate(true);
  return (
    <Field label={label}>
      <TypedText
        label={label}
        multiline={multiline}
        symbols={false}
        maxLength={maxLength}
        textKey={'quest.' + which}
        value={value}
        onDone={(text) => edit(() => EditorComponentQuest.updateQuestText(which, text))}
      />
    </Field>
  );
}

export function QuestPanel() {
  const game = Game.get();
  const quest = game.currentQuest!;
  const q = quest.qd.quest;
  const heroes = game.gameType.heroesName();
  const images = EditorComponentQuest.imageChoices();
  const folder = Path.getDirectoryName(quest.qd.questPath)!;
  const packs = EditorComponentQuest.packChoices();
  return (
    <div className="editor-quest">
      <Fold id="quest-cover" title={edi('EDITOR_QUEST_COVER')} part>
        <Field label={val('NAME')}>
          <TypedText label={val('NAME')} textKey={q.name_key} value={q.name.translate(true)} onDone={(text) => edit(() => EditorComponentQuest.updateQuestName(text))} />
        </Field>
        <Toggle label={val('HIDDEN')} on={q.hidden} onToggle={() => edit(EditorComponentQuest.toggleHidden)} />
        <Field label={val('IMAGE')}>
          <select aria-label={val('IMAGE')} value={q.image} onChange={(e) => edit(() => EditorComponentQuest.selectImage(e.target.value))}>
            {!images.includes(q.image) && <option value={q.image}>{q.image}</option>}
            {images.map((image) => (
              <option key={image} value={image}>
                {image === '' ? val('NONE') : image}
              </option>
            ))}
          </select>
          {q.image.length > 0 && <Picture file={folder + '/' + q.image} name={q.image} className="editor-cover" decorative />}
        </Field>
        <Toggle label={val('DEFAULTMUSICON')} on={q.defaultMusicOn} onToggle={() => edit(EditorComponentQuest.toggleDefaultMusicOn)} />
      </Fold>
      <Fold id="quest-texts" title={edi('EDITOR_QUEST_TEXTS')} part>
        <QuestTextField which="description" label={val('DESCRIPTION')} />
        <QuestTextField which="synopsys" label={val('SYNOPSYS')} maxLength={100} />
        <QuestTextField which="authors" label={val('AUTHORS')} />
        <QuestTextField which="authors_short" label={val('AUTHORS_SHORT')} multiline={false} maxLength={75} />
      </Fold>
      <Fold id="quest-play" title={edi('EDITOR_QUEST_PLAY')} count={q.packs.length} part>
        <Field label={val('REQUIRED_EXPANSIONS').replace(/:$/, '')}>
          <ul className="editor-names">
            {q.packs.map((pack, i) => (
              <li key={`${pack}-${i}`} className="editor-inline">
                <span className="editor-pack">{new StringKey('val', pack).translate()}</span>
                <code>{pack}</code>
                <button
                  type="button"
                  className="editor-back"
                  aria-label={edi('EDITOR_REMOVE_PACK', pack)}
                  title={edi('EDITOR_REMOVE_PACK', pack)}
                  onClick={() => edit(() => EditorComponentQuest.questRemovePack(i))}
                >
                  −
                </button>
              </li>
            ))}
            <li>
              <select className="editor-add" aria-label={val('SELECT_PACK')} value="" onChange={(e) => e.target.value !== '' && edit(() => EditorComponentQuest.selectQuestAddPack(e.target.value))}>
                <option value="">{'+ ' + val('SELECT_PACK')}</option>
                {packs.map((pack) => (
                  <option key={pack} value={pack}>
                    {new StringKey('val', pack).translate() + ' (' + pack + ')'}
                  </option>
                ))}
              </select>
            </li>
          </ul>
        </Field>
        <div className="editor-pair">
          <Field label={val('MIN_X', heroes)}>
            <TypedText
              label={val('MIN_X', heroes)}
              number={{ min: 1, max: game.gameType.maxHeroes() }}
              value={String(q.minHero)}
              onDone={(text) => edit(() => EditorComponentQuest.updateMinHero(text))}
            />
          </Field>
          <Field label={val('MAX_X', heroes)}>
            <TypedText
              label={val('MAX_X', heroes)}
              number={{ min: 1, max: game.gameType.maxHeroes() }}
              value={String(q.maxHero)}
              onDone={(text) => edit(() => EditorComponentQuest.updateMaxHero(text))}
            />
          </Field>
        </div>
        <div className="editor-pair">
          <Field label={val('MIN_X', new StringKey('val', 'DURATION')).replace(/:$/, '')}>
            <TypedText
              label={val('MIN_X', new StringKey('val', 'DURATION')).replace(/:$/, '')}
              number={{ min: 0 }}
              value={String(q.lengthMin)}
              onDone={(text) => edit(() => EditorComponentQuest.updateMinLength(text))}
            />
          </Field>
          <Field label={val('MAX_X', new StringKey('val', 'DURATION')).replace(/:$/, '')}>
            <TypedText
              label={val('MAX_X', new StringKey('val', 'DURATION')).replace(/:$/, '')}
              number={{ min: 0 }}
              value={String(q.lengthMax)}
              onDone={(text) => edit(() => EditorComponentQuest.updateMaxLength(text))}
            />
          </Field>
        </div>
        <Field label={val('DIFFICULTY').replace(/:$/, '')}>
          <TypedText
            label={val('DIFFICULTY').replace(/:$/, '')}
            number={{ min: 0, max: 1, step: 0.05 }}
            value={floatToString(q.difficulty)}
            onDone={(text) => edit(() => EditorComponentQuest.updateDifficulty(text))}
          />
        </Field>
      </Fold>
    </div>
  );
}
