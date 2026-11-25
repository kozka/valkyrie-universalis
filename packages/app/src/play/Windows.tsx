// The windows over the board while a quest is played, drawn from the engine's window objects (store.ts holds them in
// the order they opened). Rewritten from Valkyrie's Unity drawing; each window names the code it draws, and its
// buttons call the engine's rules.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  CameraController,
  ChangePhaseWindow,
  CommonStringKeys,
  Destroyer,
  EventManager,
  Game,
  GameMenu,
  InfoDialog,
  ItemData,
  Mathf,
  MonsterDialogMoM,
  Quest,
  QuestData,
  StringKey,
  floatToString,
  type ActivateDialog,
  type ActivateDialogMoM,
  type Color,
  type DialogWindow,
  type HeroDialog,
  type HorrorCheck,
  type InventoryWindow as InventoryWindowD2E,
  type InventoryWindowMoM,
  type InvestigatorAttack,
  type InvestigatorEvade,
  type InvestigatorItems,
  type LogWindow,
  type MonsterDialog,
  type MonsterRedraw,
  type PuzzleCodeWindow,
  type SetWindow,
  type ShopInterface,
  type SkillOption,
  type SkillWindow,
  type Texture2D,
} from '@universalis/engine';
import { resourceUrl } from '../host/baseData.ts';
import { Picture } from '../ui/Picture.tsx';
import { RichText } from '../ui/RichText.tsx';
import { translate, translating } from '../host/translator.ts';
import { TranslatingLines, failureText } from '../ui/TranslateOptions.tsx';
import { Guard } from '../ui/Guard.tsx';
import { SHOW_PLACED } from '../board/effects.ts';
import { ButtonRow } from './ButtonRow.tsx';
import { ReadAloud } from '../ui/ReadAloud.tsx';
import { run } from '../ui/run.ts';
import { useUI, type GameWindow } from '../ui/store.ts';
import { nameOf, uni, val } from '../ui/text.ts';
import { openQuickOptions } from './QuickOptions.tsx';
import { openRulesHelp } from '../ui/RulesHelp.tsx';
import { openFeedback } from '../ui/Feedback.tsx';
import { PuzzleImageView, PuzzleSlideView, PuzzleTowerView } from './Puzzles.tsx';
import { EndGameWindow } from '../screens/EndGameScreen.tsx';
import { SaveSelectWindow } from '../screens/SaveSelectScreen.tsx';
import './play.css';

function cssColour(c: Color): string {
  return `rgb(${Math.round(c.r * 255)} ${Math.round(c.g * 255)} ${Math.round(c.b * 255)} / ${c.a})`;
}

/**
 * A window's card: its text over its buttons, as Valkyrie's bordered boxes. Only an event's choices (`row`) may go side
 * by side; the other windows are menus and keep their buttons one under another. `onFold` runs when it is folded away
 * to look at the board.
 */
function Card({ label, text, speech, row = false, onFold, className = '', children }: { label: string; text?: ReactNode; speech?: string; row?: boolean; onFold?: () => void; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => continueOnKey(ref), []);
  // Not in Valkyrie (29 October 2026): folded away to a thin strip, to look at the board under it; a new text unfolds it
  const [folded, setFolded] = useState(false);
  useEffect(() => setFolded(false), [label, speech]);
  if (folded) {
    return (
      <section ref={ref} className="window panel event-window folded" role="dialog" aria-modal="false" aria-label={label}>
        <button type="button" className="event-peek" aria-label={uni('SHOW_TEXT')} title={uni('SHOW_TEXT')} onClick={() => setFolded(false)}>
          <UnfoldIcon />
          <span className="event-peek-text">{plainText(speech ?? label)}</span>
        </button>
      </section>
    );
  }
  return (
    <section ref={ref} className={`window panel event-window ${className}`.trim()} role="dialog" aria-modal="false" aria-label={label}>
      {text !== undefined && (
        <div className="card event-text">
          <button
            type="button"
            className="peek-map"
            aria-label={uni('SHOW_MAP')}
            title={uni('SHOW_MAP')}
            onClick={() => {
              setFolded(true);
              if (onFold !== undefined) onFold();
              else showPlaced();
            }}
          >
            <MapIcon />
          </button>
          {speech !== undefined && <ReadAloud text={speech} auto />}
          {text}
        </div>
      )}
      <ButtonRow row={row}>{children}</ButtonRow>
    </section>
  );
}

/**
 * Not in Valkyrie: the board lights again what was just placed, or else the place the event marks (board/effects.ts),
 * for whoever folds a window to find it.
 */
function showPlaced(place?: { x: number; y: number }): void {
  globalThis.dispatchEvent(new CustomEvent(SHOW_PLACED, { detail: place }));
}

/** A window's text without its markup, on one line, for the folded strip. */
function plainText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\\n|\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** A folded map: what the window's corner button shows. */
function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" />
      <path d="M9 4v13.5M15 6.5V20" />
    </svg>
  );
}

/** A chevron opening downwards: the strip unfolds back into the window. */
function UnfoldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/**
 * Not in Valkyrie: Enter or Space presses the only button of the topmost card, when nothing else has the keyboard
 * (Valkyrie issue #992). A focused button already takes them itself.
 */
function continueOnKey(ref: { current: HTMLElement | null }): () => void {
  const onKey = (e: KeyboardEvent) => {
    if ((e.key !== 'Enter' && e.key !== ' ') || e.repeat || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const focused = document.activeElement;
    if (focused instanceof Element && focused.closest('button, input, textarea, select, a, [contenteditable="true"], [data-quest-ui]') !== null) return;
    const card = ref.current;
    if (card === null || card.classList.contains('folded') || [...document.querySelectorAll('.event-window')].at(-1) !== card) return;
    const buttons = [...card.querySelectorAll<HTMLButtonElement>('.event-buttons button:not(:disabled)')];
    if (buttons.length !== 1) return;
    e.preventDefault();
    buttons[0]!.click();
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}

function Button({ onClick, disabled = false, className = '', children }: { onClick: () => void; disabled?: boolean; className?: string; children: ReactNode }) {
  return (
    <button type="button" className={`button event-button ${className}`.trim()} disabled={disabled} onClick={() => run(onClick)}>
      {children}
    </button>
  );
}

/**
 * Not in Valkyrie: a window's texts in the player's language when the scenario does not come in it and Options asks
 * for it (host/translator.ts): the originals while the translation comes, then the translation, or the originals and
 * the reason when it fails.
 */
function useTranslation(texts: string[]): { texts: string[]; working: boolean; failed: string | null; translated: boolean } {
  const key = JSON.stringify(texts);
  const on = translating();
  const [state, setState] = useState<{ key: string; texts: string[] | null; failed: string | null }>({ key: '', texts: null, failed: null });
  useEffect(() => {
    if (!on) return;
    let live = true;
    translate(texts).then(
      (result) => live && setState({ key, texts: result, failed: null }),
      (e: unknown) => live && setState({ key, texts: null, failed: failureText(e) }),
    );
    return () => {
      live = false;
    };
    // The texts are the key
  }, [key, on]);
  if (!on) return { texts, working: false, failed: null, translated: false };
  if (state.key !== key) return { texts, working: true, failed: null, translated: false };
  return { texts: state.texts ?? texts, working: false, failed: state.failed, translated: state.texts !== null };
}

// Valkyrie: DialogWindow.cs DialogWindow.CreateWindow, CreateQuotaWindow and DrawItem
function DialogWindowView({ window, item }: { window: DialogWindow; item: { data: ItemData; texture: Texture2D } | null }) {
  const event = window.eventData.qEvent;
  const quota = window.quotaButton;
  const labels = quota !== null ? [quota.getLabel().translate()] : window.buttons.map(({ button }) => button.getLabel().translate());
  const tr = useTranslation([window.text, ...labels]);
  const [body, ...shown] = tr.texts;
  const text = (
    <>
      {tr.working ? <TranslatingLines /> : <RichText text={body ?? window.text} />}
      {tr.translated && <p className="translated-note">{uni('TRANSLATED')}</p>}
      {tr.failed !== null && <p className="translated-note problem">{uni('TRANSLATE_FAILED', tr.failed)}</p>}
    </>
  );
  return (
    <Card
      label={event.sectionName}
      text={text}
      speech={tr.working ? undefined : (body ?? window.text)}
      row
      // What it placed lights again, and the camera goes back to its place, now in the middle of the board left in sight
      onFold={() => {
        if (!event.locationSpecified || event instanceof QuestData.UI) return showPlaced();
        // Its place is marked only when the event highlights it (highlight=true, as Valkyrie draws its target there)
        showPlaced(event.highlight ? { x: event.location.x, y: event.location.y } : undefined);
        run(() => CameraController.setCamera(event.location));
      }}
    >
      {quota !== null ? (
        <>
          <div className="quota">
            <button type="button" className="button" disabled={window.quota === 0} onClick={() => run(() => window.quotaDec())}>
              {CommonStringKeys.MINUS.translate()}
            </button>
            <span className="quota-value">{window.quota}</span>
            <button type="button" className="button" disabled={window.quota >= 10} onClick={() => run(() => window.quotaInc())}>
              {CommonStringKeys.PLUS.translate()}
            </button>
          </div>
          <Button onClick={() => window.onQuota()}>
            <RichText text={shown[0] ?? quota.getLabel().translate()} />
          </Button>
        </>
      ) : (
        window.buttons.map(({ button, num, enabled }, i) => (
          <button
            key={num}
            type="button"
            className="button event-button"
            disabled={!enabled}
            style={enabled ? { color: cssColour(button.colour) } : undefined}
            onClick={() => run(() => window.onButton(num))}
          >
            <RichText text={shown[i] ?? button.getLabel().translate()} />
          </button>
        ))
      )}
      {event.cancelable && <Button onClick={() => window.onCancel()}>{CommonStringKeys.CANCEL.translate()}</Button>}
    </Card>
  );
}

// Valkyrie: InvestigatorItems.cs InvestigatorItems.InvestigatorItems (its drawing)
function InvestigatorItemsWindow({ window }: { window: InvestigatorItems }) {
  const game = Game.get();
  return (
    <div className="window-layer">
      <section className="window panel items-window" role="dialog" aria-modal="true" aria-labelledby="items-title">
        <h2 id="items-title">{val('ITEMS')}</h2>
        <ul className="item-grid">
          {window.sortedItems.map((item) => {
            const itemData = game.cd.get(ItemData, item);
            const name = nameOf(itemData.name);
            return (
              <li key={item}>
                <Picture file={itemData.image} name={name} className="item-picture" decorative />
                <span>{name}</span>
              </li>
            );
          })}
        </ul>
        <button type="button" className="button primary" onClick={() => run(() => game.questStartEvent())}>
          {CommonStringKeys.FINISHED.translate()}
        </button>
      </section>
    </div>
  );
}

// Valkyrie: GameMenu.cs GameMenu.Draw
function GameMenuWindow() {
  // Not in Valkyrie (7 November 2026): leaving for the main menu asks first, as one press there ended a game by mistake
  const [leaving, setLeaving] = useState(false);
  if (leaving) {
    return (
      <Card label={val('MAIN_MENU')} text={<p>{uni('QUIT_CONFIRM')}</p>} className="bar-buttons">
        <Button onClick={() => GameMenu.quit()}>{uni('QUIT_CONFIRM_YES')}</Button>
        <Button onClick={() => setLeaving(false)}>{CommonStringKeys.CANCEL.translate()}</Button>
      </Card>
    );
  }
  return (
    <Card label={val('MENU')} className="bar-buttons">
      <Button onClick={() => GameMenu.undo()}>{val('UNDO')}</Button>
      <Button onClick={() => GameMenu.save()}>{val('SAVE')}</Button>
      {/* Not in Valkyrie: the options a game may want changed without leaving it (QuickOptions.tsx) */}
      <Button
        onClick={() => {
          Destroyer.dialog();
          openQuickOptions();
        }}
      >
        {val('OPTIONS')}
      </Button>
      {/* Not in Valkyrie: the game's help (ui/RulesHelp.tsx) */}
      <Button
        onClick={() => {
          Destroyer.dialog();
          openRulesHelp();
        }}
      >
        {uni('RULES_HELP')}
      </Button>
      {/* Not in Valkyrie: a report from the game says which game, scenario and round (ui/Feedback.tsx) */}
      <Button
        onClick={() => {
          Destroyer.dialog();
          openFeedback();
        }}
      >
        {uni('FEEDBACK_BUTTON')}
      </Button>
      {Game.get().testMode ? (
        <Button onClick={() => GameMenu.editor()}>{val('EDITOR')}</Button>
      ) : (
        <Button onClick={() => setLeaving(true)}>{val('MAIN_MENU')}</Button>
      )}
      <Button onClick={() => Destroyer.dialog()}>{CommonStringKeys.CANCEL.translate()}</Button>
    </Card>
  );
}

// Valkyrie: InventoryWindowMoM.cs InventoryWindowMoM.Update
function InventoryWindow({ window }: { window: InventoryWindowMoM }) {
  const game = Game.get();
  return (
    <section className="window panel inventory-window" role="dialog" aria-modal="false" aria-labelledby="inventory-title">
      <h2 id="inventory-title">{val('ITEMS')}</h2>
      <ul className="item-row">
        {window.items().map((item) => {
          const itemData = game.cd.get(ItemData, item);
          const name = nameOf(itemData.name);
          return (
            <li key={item}>
              <button type="button" className="inventory-item" onClick={() => run(() => window.inspect(item))}>
                <Picture file={itemData.image} name={name} className="item-picture" decorative />
                <span>{name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <button type="button" className="button" onClick={() => run(() => Destroyer.dialog())}>
        {CommonStringKeys.CLOSE.translate()}
      </button>
    </section>
  );
}

// Valkyrie: InventoryWindow.cs InventoryWindow.Update (Descent: the party's items, each name under its picture, and the gold)
function InventoryD2EWindow({ window }: { window: InventoryWindowD2E }) {
  const game = Game.get();
  return (
    <section className="window panel inventory-window" role="dialog" aria-modal="false" aria-labelledby="inventory-title">
      <h2 id="inventory-title">{val('ITEMS')}</h2>
      <ul className="item-row">
        {window.items().map((item) => {
          const itemData = game.cd.get(ItemData, item);
          const name = nameOf(itemData.name);
          return (
            <li key={item} className="inventory-item">
              <Picture file={itemData.image} name={name} className="item-picture" decorative />
              <span className="item-name">{name}</span>
            </li>
          );
        })}
      </ul>
      <p className="gold">
        <span>{val('GOLD')}</span> <span>{window.gold()}</span>
      </p>
      <button type="button" className="button" onClick={() => run(() => Destroyer.dialog())}>
        {CommonStringKeys.CLOSE.translate()}
      </button>
    </section>
  );
}

// Valkyrie: SkillWindow.cs SkillWindow.Update: the heroes on top, each with the experience it has left; then the hero's
// skills by their cost in three rows, the third shared, for a hero with a hybrid class, by that class's three
function SkillsWindow({ window }: { window: SkillWindow }) {
  const quest = Game.get().currentQuest!;
  const skills = window.skills();
  const hybrid = quest.heroes[window.hero]!.hybridClass.length > 0;
  const skillButton = (s: SkillOption) => (
    <button key={s.skill} type="button" className={`button skill ${s.state}`} aria-pressed={s.state === 'picked'} onClick={() => run(() => window.selectSkill(window.hero, s.skill))}>
      {nameOf(s.name)}
    </button>
  );
  const row = (cost: string, buttons: ReactNode, key = cost) => (
    <div key={key} className="skill-row">
      <span className="skill-cost">{cost}</span>
      <div className="skill-buttons">{buttons}</div>
    </div>
  );
  return (
    <section className="window panel skills-window" role="dialog" aria-modal="false" aria-labelledby="skills-title">
      <h2 id="skills-title">{val('SELECT_SKILLS')}</h2>
      <ul className="skill-heroes">
        {window.heroes().map(({ hero, availableXP }, i) => (
          <li key={hero.id}>
            <button type="button" className="skill-hero" aria-pressed={i === window.hero} onClick={() => run(() => window.update(i))}>
              <Picture file={hero.heroData!.image} name={nameOf(hero.heroData!.name)} className="portrait" />
              {availableXP !== 0 && (
                <span className="skill-xp" aria-label={uni('AVAILABLE_XP', availableXP)}>
                  {availableXP}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      <div className="skill-rows">
        {row('1', skills.filter((s) => !s.hybrid && s.xp === 1).map(skillButton))}
        {row('2', skills.filter((s) => !s.hybrid && s.xp === 2).map(skillButton))}
        {hybrid ? (
          <div className="skill-row hybrid">
            {[1, 2, 3].map((xp) => row(String(xp), skills.filter((s) => s.hybrid && s.xp === xp).map(skillButton), `hybrid-${xp}`))}
          </div>
        ) : (
          row('3', skills.filter((s) => !s.hybrid && s.xp === 3).map(skillButton))
        )}
      </div>
      <button type="button" className="button" onClick={() => run(() => Destroyer.dialog())}>
        {CommonStringKeys.CLOSE.translate()}
      </button>
    </section>
  );
}

/** An item of the shop or of the party, as ShopInterface draws it: price, picture, act and name, all one button. */
function ShopItem({ item, price, onClick }: { item: string; price: number; onClick: () => void }) {
  const itemData = Game.get().cd.get(ItemData, item);
  const name = nameOf(itemData.name);
  let act = '-';
  if (itemData.containsTrait('class')) act = val('CLASS');
  if (itemData.containsTrait('act1')) act = val('ACT_1');
  if (itemData.containsTrait('act2')) act = val('ACT_2');
  return (
    <li>
      <button type="button" className="shop-item" onClick={() => run(onClick)}>
        <span className="shop-price">{price}</span>
        <Picture file={itemData.image} name={name} className="item-picture" decorative />
        <span className="shop-act">{act}</span>
        <span className="shop-name">{name}</span>
      </button>
    </li>
  );
}

// Valkyrie: ShopInterface.cs ShopInterface.Update (DrawButtons, DrawShopItems, DrawPartyItems and DrawGold): the event's
// buttons in their colours, what the shop sells and what the party can sell (not its relics), and the party's gold
export function ShopView({ shop }: { shop: ShopInterface }) {
  useUI((s) => s.revision);
  const game = Game.get();
  const quest = game.currentQuest!;
  const forSale = quest.shops.get(shop.eventData.sectionName) ?? [];
  const party = [...quest.items].filter((item) => !game.cd.get(ItemData, item).containsTrait('relic'));
  return (
    <div className="window-layer shop-layer">
      <section className="window panel shop" role="dialog" aria-modal="false" aria-label={shop.eventData.sectionName}>
        <div className="shop-columns">
          <nav className="shop-buttons">
            {shop.buttons.map((button, i) => (
              <button key={i} type="button" className="button event-button" style={{ color: cssColour(button.colour) }} onClick={() => run(() => shop.onButton(i))}>
                <RichText text={EventManager.outputSymbolReplace(shop.eventData.buttons[i]!.label.translate())} />
              </button>
            ))}
          </nav>
          <section className="shop-list" aria-labelledby="shop-buy">
            <h2 id="shop-buy">{val('BUY')}</h2>
            <ul>
              {forSale.map((item, i) => (
                <ShopItem key={`${item}-${i}`} item={item} price={shop.getPurchasePrice(game.cd.get(ItemData, item))} onClick={() => shop.buy(item)} />
              ))}
            </ul>
          </section>
          <section className="shop-list" aria-labelledby="shop-sell">
            <h2 id="shop-sell">{val('SELL')}</h2>
            <ul>
              {party.map((item) => (
                <ShopItem key={item} item={item} price={shop.getSellPrice(game.cd.get(ItemData, item))} onClick={() => shop.sell(item)} />
              ))}
            </ul>
          </section>
        </div>
        <p className="gold">
          <span>{val('GOLD')}</span> <span>{Mathf.roundToInt(quest.vars.getValue('$%gold'))}</span>
        </p>
      </section>
    </div>
  );
}

// Valkyrie: SetWindow.cs SetWindow.SetWindow
function SetWindowView({ window }: { window: SetWindow }) {
  return (
    <Card label={CommonStringKeys.SET.translate()}>
      {window.fire() ? <Button onClick={() => window.clearFire()}>{val('CLEAR_FIRE')}</Button> : <Button onClick={() => window.setFire()}>{val('SET_FIRE')}</Button>}
      {/* Not in Valkyrie (6 November 2026), which only greys it: undone as the fire is cleared, until it is over */}
      {!window.eliminated() ? (
        <Button onClick={() => window.eliminate()}>{val('INVESTIGATOR_ELIMINATED')}</Button>
      ) : window.eliminatedComplete() ? (
        <Button disabled onClick={() => window.uneliminate()}>
          {val('INVESTIGATOR_ELIMINATED')}
        </Button>
      ) : (
        <Button onClick={() => window.uneliminate()}>{uni('CLEAR_ELIMINATED')}</Button>
      )}
      <Button onClick={() => Destroyer.setWindow()}>{CommonStringKeys.CLOSE.translate()}</Button>
    </Card>
  );
}

// Valkyrie: LogWindow.cs LogWindow.Update and DrawVarList
function LogWindowView({ window, entries, dialog }: { window: LogWindow; entries: string[]; dialog: boolean }) {
  const vars = window.developerToggle && dialog ? [...Game.get().currentQuest!.vars.vars] : [];
  // Not in Valkyrie (7 November 2026): it opens on the newest entries, the ones a player looks for
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    if (list.current !== null) list.current.scrollTop = list.current.scrollHeight;
  }, [entries.length]);
  return (
    <section className="window panel log-window" role="dialog" aria-modal="false" aria-labelledby="log-title">
      <h2 id="log-title" className="visually-hidden">
        {CommonStringKeys.LOG.translate()}
      </h2>
      <div className="log-columns">
        <ol className="log-entries" ref={list}>
          {entries.map((entry, i) => (
            <li key={i} className={isLogMark(entry) ? 'log-mark' : undefined}>
              {/* Not in Valkyrie: a long entry can be read aloud again */}
              {!isLogMark(entry) && entry.length >= 30 && <ReadAloud text={entry} />}
              <RichText text={entry} />
            </li>
          ))}
        </ol>
        {vars.length > 0 && (
          <ul className="log-vars">
            {vars.map(([key, value]) => (
              <li key={key}>
                <label>
                  <span>{key}</span>
                  <input
                    type="text"
                    defaultValue={floatToString(value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') run(() => window.updateValue(key, e.currentTarget.value));
                    }}
                  />
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="log-buttons">
        <CopyLog entries={entries} />
        <button type="button" className="button" onClick={() => run(() => Destroyer.logs())}>
          {CommonStringKeys.CLOSE.translate()}
        </button>
      </div>
    </section>
  );
}

/** Not in Valkyrie: the entries that start a round or the Mythos phase stand out among the rest (Valkyrie issue #1519). */
function isLogMark(entry: string): boolean {
  const round = new RegExp('^' + val('ROUND', '\u0000').replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('\u0000', '\\d+') + '$');
  return entry === val('PHASE_MYTHOS') || round.test(entry);
}

/** Not in Valkyrie: copies the log as plain text (Valkyrie issue #585). */
function CopyLog({ entries }: { entries: string[] }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);
  const copy = () => {
    const text = entries.map((entry) => entry.replace(/<[^>]*>/g, '')).join('\n\n');
    void navigator.clipboard?.writeText(text).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };
  return (
    <button type="button" className="button" onClick={copy} aria-live="polite">
      {copied ? uni('LOG_COPIED') : val('COPY')}
    </button>
  );
}

// Valkyrie: ChangePhaseWindow.cs ChangePhaseWindow.DisplayTransitionWindow (and its timer, which calls Close)
function TransitionWindow({ phase }: { phase: Quest.MoMPhase }) {
  useEffect(() => {
    const timer = setTimeout(() => run(() => ChangePhaseWindow.close()), ChangePhaseWindow.transitionDuration * 1000);
    return () => clearTimeout(timer);
  }, [phase]);
  const investigators = phase === Quest.MoMPhase.investigator;
  const quest = Game.get().currentQuest;
  return (
    <div className={`transition-window ${investigators ? 'investigators' : 'mythos'}`} role="status">
      <p className="transition-title">{val(investigators ? 'PHASE_INVESTIGATOR' : 'PHASE_MYTHOS')}</p>
      {investigators && quest !== null && (
        <ul className="transition-heroes">
          {quest.heroes
            .filter((h) => h.heroData !== null)
            .map((h) => (
              <li key={h.id}>
                <Picture file={h.heroData!.image} name={nameOf(h.heroData!.name)} className="portrait" decorative />
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

// Valkyrie: MonsterDialogMoM.cs MonsterDialogMoM.DrawMonster and DrawMonsterHealth
function MonsterPanel({ monster, redraw }: { monster: Quest.Monster; redraw: MonsterRedraw | null }) {
  const name = nameOf(monster.monsterData.name);
  const health = monster.getHealth();
  return (
    <aside className="panel monster-panel" aria-label={name}>
      <div className="monster-portrait">
        <Picture file={monster.monsterData.image} name={name} className="monster-picture" decorative />
        {monster.duplicate > 0 && <span className="monster-duplicate">{monster.duplicate}</span>}
        {redraw !== null && (
          <span className="monster-badge health" aria-label={uni('HEALTH', health)}>
            {health}
          </span>
        )}
      </div>
      <p className="monster-name">{name}</p>
      {redraw !== null && (
        <>
          <div className="monster-damage">
            <button type="button" className="button" disabled={monster.damage === 0} onClick={() => run(() => MonsterDialogMoM.monsterDamageDec(monster, redraw))}>
              {CommonStringKeys.MINUS.translate()}
            </button>
            <span className="damage-value" aria-label={uni('DAMAGE', monster.damage)}>
              {monster.damage}
            </span>
            <button type="button" className="button" disabled={monster.damage === health} onClick={() => run(() => MonsterDialogMoM.monsterDamageInc(monster, redraw))}>
              {CommonStringKeys.PLUS.translate()}
            </button>
          </div>
          {monster.damage === health && (
            <button type="button" className="button defeated" onClick={() => run(() => MonsterDialogMoM.defeated(monster))}>
              {MonsterDialogMoM.DEFEATED.translate()}
            </button>
          )}
        </>
      )}
    </aside>
  );
}

// Valkyrie: DialogWindow.cs DialogWindow.DrawItem: the item the event gives, left of the window, with its name under it
function ItemPanel({ item }: { item: { data: ItemData } }) {
  const name = nameOf(item.data.name);
  return (
    <figure className="panel monster-panel picture-only item-panel" aria-label={name}>
      <div className="monster-portrait">
        <Picture file={item.data.image} name={name} className="monster-picture item-picture" decorative />
      </div>
      <figcaption className="monster-name">{name}</figcaption>
    </figure>
  );
}

/**
 * Not in Valkyrie (12 November 2026): Descent's and DooM's monster beside its window and its activation, as Mansions'
 * is beside its own (MonsterPanel), half as big again as its icon; Valkyrie shows only the window.
 */
function MonsterPicture({ monster }: { monster: Quest.Monster }) {
  const name = nameOf(monster.monsterData.name);
  return (
    <aside className="panel monster-panel picture-only" aria-label={name}>
      <div className="monster-portrait">
        <Picture file={monster.monsterData.image} name={name} className="monster-picture" decorative />
        {monster.duplicate > 0 && <span className="monster-duplicate">{monster.duplicate}</span>}
      </div>
      <p className="monster-name">{name}</p>
    </aside>
  );
}

// Valkyrie: MonsterDialogMoM.cs MonsterDialogMoM.CreateWindow (its buttons)
function MonsterWindow({ window }: { window: MonsterDialogMoM }) {
  if (window.horrorStep()) {
    return (
      <Card label={nameOf(window.monster.monsterData.name)}>
        <Button onClick={() => window.horror()}>{val('HORROR_CHECK')}</Button>
        <Button onClick={() => window.onCancel()}>{CommonStringKeys.CANCEL.translate()}</Button>
      </Card>
    );
  }
  const alive = window.isAlive();
  return (
    <Card label={nameOf(window.monster.monsterData.name)}>
      <Button disabled={!alive} onClick={() => window.attack()}>
        <RichText text={new StringKey('val', 'ACTION_X', new StringKey('val', 'ATTACK')).translate().trim()} />
      </Button>
      <Button disabled={!alive} onClick={() => window.evade()}>
        {val('EVADE')}
      </Button>
      <Button disabled={!alive} onClick={() => window.onCancel()}>
        {CommonStringKeys.CANCEL.translate()}
      </Button>
    </Card>
  );
}

// Valkyrie: InvestigatorAttack.cs InvestigatorAttack.AttackOptions and Attack
function AttackWindow({ window, greyed }: { window: InvestigatorAttack; greyed: boolean }) {
  if (window.attackText === '') {
    return (
      <Card label={val('ATTACK_PROMPT')} text={<p>{val('ATTACK_PROMPT')}</p>}>
        {window.attackTypes().map((type) => (
          <Button key={type} onClick={() => window.attackWith(type)}>
            {val(type)}
          </Button>
        ))}
        <Button disabled={greyed} onClick={() => Destroyer.dialog()}>
          {CommonStringKeys.CANCEL.translate()}
        </Button>
      </Card>
    );
  }
  return (
    <Card label={val('ATTACK')} text={<RichText text={window.attackText} />} speech={window.attackText}>
      <Button disabled={greyed} onClick={() => Destroyer.dialog()}>
        {CommonStringKeys.FINISHED.translate()}
      </Button>
    </Card>
  );
}

// Valkyrie: InvestigatorEvade.cs InvestigatorEvade.Draw and HorrorCheck.cs HorrorCheck.Draw
function TextWindow({ label, text, greyed }: { label: string; text: string; greyed: boolean }) {
  return (
    <Card label={label} text={<RichText text={text} />} speech={text}>
      <Button disabled={greyed} onClick={() => Destroyer.dialog()}>
        {CommonStringKeys.FINISHED.translate()}
      </Button>
    </Card>
  );
}

// Valkyrie: ActivateDialogMoM.cs ActivateDialogMoM.CreateWindow, CreateAttackWindow and CreateMoveWindow
function ActivationWindow({ window }: { window: ActivateDialogMoM }) {
  const activation = window.monster.currentActivation!;
  const name = nameOf(window.monster.monsterData.name);
  if (window.step === 'attack' || window.step === 'move') {
    const text = window.step === 'attack' ? activation.masterActions : activation.move!;
    return (
      <Card label={name} text={<RichText text={text.split('\\n').join('\n')} />} speech={text.split('\\n').join('\n')}>
        <Button onClick={() => window.activated()}>{CommonStringKeys.FINISHED.translate()}</Button>
      </Card>
    );
  }
  const effect = activation.effect.split('\\n').join('\n');
  return (
    <Card label={name} text={effect.length > 0 ? <RichText text={effect} /> : undefined} speech={effect.length > 0 ? effect : undefined}>
      <Button onClick={() => window.createAttackWindow()}>{val('MONSTER_ATTACKS')}</Button>
      <Button onClick={() => window.createMoveWindow()}>
        <RichText text={activation.ad.moveButton.translate()} />
      </Button>
    </Card>
  );
}

// Valkyrie: ActivateDialog.cs ActivateDialog.CreateWindow (Descent)
function ActivationD2EWindow({ window }: { window: ActivateDialog }) {
  const activation = window.monster.currentActivation!;
  const header = window.singleStep ? val('ACTIONS') : window.master ? val('MONSTER_MASTER') : val('MONSTER_MINION');
  const finished = window.singleStep ? val('ACTIVATED') : new StringKey('val', 'X_ACTIVATED', new StringKey('val', window.master ? 'MONSTER_MASTER' : 'MONSTER_MINION')).translate();
  const text = window.master ? activation.masterActions : activation.minionActions;
  // The master's step is red: its header, the box of its actions and its button
  const master = window.master && !window.singleStep ? 'master' : '';
  return (
    <Card
      label={nameOf(window.monster.monsterData.name)}
      speech={[activation.effect.split('\\n').join('\n'), header, text].filter((t) => t.length > 0).join('\n')}
      text={
        <>
          <button type="button" className="activation-name" onClick={() => run(() => new InfoDialog(window.monster))}>
            {nameOf(window.monster.monsterData.name)}
          </button>
          {activation.effect.length > 0 && <RichText text={activation.effect.split('\\n').join('\n')} />}
          <h3 className={master}>{header}</h3>
          <div className={`activation-actions ${master}`.trim()}>
            <RichText text={text} />
          </div>
        </>
      }
    >
      <Button className={master} onClick={() => window.activated()}>
        {finished}
      </Button>
    </Card>
  );
}

// Valkyrie: MonsterDialog.cs MonsterDialog.CreateWindow (Descent)
function MonsterD2EWindow({ window }: { window: MonsterDialog }) {
  const activating = Game.get().ui.findTag(Game.ACTIVATION);
  return (
    <Card label={nameOf(window.monster.monsterData.name)} className="bar-buttons">
      <Button onClick={() => window.info()}>{val('INFORMATION')}</Button>
      {!activating && (
        <>
          <Button onClick={() => window.activate()}>{val('FORCE_ACTIVATE')}</Button>
          <Button onClick={() => window.defeated()}>{val('DEFEATED')}</Button>
          {window.monster.unique && <Button onClick={() => window.uniqueDefeated()}>{val('UNIQUE_DEFEATED').split('\\n').join(' ')}</Button>}
        </>
      )}
      <Button onClick={() => window.onCancel()}>{CommonStringKeys.CANCEL.translate()}</Button>
    </Card>
  );
}

// Valkyrie: HeroDialog.cs HeroDialog.CreateWindow (Descent): end the hero's turn, knock it out or recover it
function HeroWindow({ window }: { window: HeroDialog }) {
  const name = nameOf(window.hero.heroData!.name);
  return (
    <Card label={name} text={<h3 className="hero-window-name">{name}</h3>} className="bar-buttons">
      <Button disabled={!window.canEndTurn} onClick={() => window.activated()}>
        {val('END_TURN')}
      </Button>
      {window.hero.defeated ? <Button onClick={() => window.restored()}>{val('RECOVER')}</Button> : <Button onClick={() => window.defeated()}>{val('KO')}</Button>}
      <Button onClick={() => window.onCancel()}>{CommonStringKeys.CANCEL.translate()}</Button>
    </Card>
  );
}

// Valkyrie: InfoDialog.cs InfoDialog.InfoDialog
function InfoWindow({ window }: { window: InfoDialog }) {
  const unique = window.uniqueText();
  return (
    <Card
      label={val('INFORMATION')}
      speech={[window.info(), ...(unique !== null ? [window.monster!.uniqueTitle.translate(), unique] : [])].join('\n')}
      text={
        <>
          <RichText text={window.info()} />
          {unique !== null && (
            <>
              <h3 className="master">{window.monster!.uniqueTitle.translate()}</h3>
              <RichText text={unique} />
            </>
          )}
        </>
      }
    >
      <Button onClick={() => window.onClose()}>{CommonStringKeys.CLOSE.translate()}</Button>
    </Card>
  );
}

/** A symbol of the code puzzle: its picture from Valkyrie's Resources, or its number. */
function CodeSymbol({ button, symbol }: { button: PuzzleCodeWindow.ButtonInfo; symbol: number }) {
  if (button.image !== null) return <img className="code-symbol-image" src={resourceUrl(button.image)} alt={String(symbol)} draggable={false} />;
  return <>{button.label.translate()}</>;
}

// Valkyrie: PuzzleCodeWindow.cs PuzzleCodeWindow.CreateWindow and GuessAdd
function PuzzleCodeView({ window }: { window: PuzzleCodeWindow }) {
  const puzzle = window.puzzle;
  const solved = puzzle.solved();
  const guesses = useRef<HTMLOListElement>(null);
  // Valkyrie scrolls the list of guesses to its end each time it draws the window
  useEffect(() => {
    if (guesses.current !== null) guesses.current.scrollTop = guesses.current.scrollHeight;
  }, [puzzle.guess.length]);
  const symbols = Array.from({ length: window.questPuzzle.puzzleAltLevel }, (_, i) => i + 1);
  const slots = Array.from({ length: window.questPuzzle.puzzleLevel }, (_, i) => i);
  const nameOfSymbol = (symbol: number) => window.buttons[symbol]!.label.translate() || String(symbol);
  return (
    <section className="window panel puzzle-window" role="dialog" aria-modal="false" aria-label={window.questPuzzle.sectionName}>
      <div className="code-top">
        {!solved && (
          <div className="code-entry">
            <div className="code-row" role="group" aria-label={uni('PUZZLE_SYMBOLS')}>
              {symbols.map((symbol) => (
                <button key={symbol} type="button" className="code-symbol" aria-label={uni('PUZZLE_ADD', nameOfSymbol(symbol))} onClick={() => run(() => window.guessAdd(symbol))}>
                  <CodeSymbol button={window.buttons[symbol]!} symbol={symbol} />
                </button>
              ))}
            </div>
            <div className="code-row" role="group" aria-label={uni('PUZZLE_CODE')}>
              {slots.map((slot) => {
                const symbol = window.guessList[slot];
                if (symbol === undefined) return <span key={slot} className="code-symbol empty" />;
                return (
                  <button key={slot} type="button" className="code-symbol" aria-label={uni('PUZZLE_REMOVE', nameOfSymbol(symbol))} onClick={() => run(() => window.guessRemove(slot))}>
                    <CodeSymbol button={window.buttons[symbol]!} symbol={symbol} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="code-side">
          <button type="button" className="button" onClick={() => run(() => window.guess())}>
            {val('PUZZLE_GUESS')}
          </button>
          <p className="code-skill">
            {new StringKey('val', 'X_COLON', CommonStringKeys.SKILL).translate()}{' '}
            <span className="card">
              <RichText text={EventManager.outputSymbolReplace(window.questPuzzle.skill)} />
            </span>
          </p>
        </div>
      </div>
      <ol className="code-guesses" ref={guesses} aria-label={uni('PUZZLE_GUESSES')}>
        {puzzle.guess.map((guess, n) => {
          const spot = guess.correctSpot();
          const type = guess.correctType();
          return (
            <li key={n} className="code-row">
              {guess.guess.map((symbol, i) => (
                <span key={i} className="code-symbol">
                  <CodeSymbol button={window.buttons[symbol]!} symbol={symbol} />
                </span>
              ))}
              <span className="code-result" aria-label={uni('PUZZLE_RESULT', spot, type)}>
                {Array.from({ length: spot }, (_, i) => (
                  <span key={`s${i}`} className="code-symbol result" aria-hidden="true">
                    <RichText text={val('ICON_SUCCESS_RESULT')} />
                  </span>
                ))}
                {Array.from({ length: type }, (_, i) => (
                  <span key={`t${i}`} className="code-symbol result" aria-hidden="true">
                    <RichText text={val('ICON_INVESTIGATION_RESULT')} />
                  </span>
                ))}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="code-moves">
        <span>
          {new StringKey('val', 'X_COLON', CommonStringKeys.MOVES).translate()} <span className="card">{puzzle.guess.length - window.previousMoves}</span>
        </span>
        <span>
          {new StringKey('val', 'X_COLON', CommonStringKeys.TOTAL_MOVES).translate()} <span className="card">{puzzle.guess.length}</span>
        </span>
      </p>
      <ButtonRow>
        <Button disabled={solved} onClick={() => window.close()}>
          {CommonStringKeys.CLOSE.translate()}
        </Button>
        <Button disabled={!solved} onClick={() => window.finished()}>
          <RichText text={window.finishLabel.translate()} />
        </Button>
      </ButtonRow>
    </section>
  );
}

function WindowView({ window }: { window: GameWindow }) {
  switch (window.kind) {
    case 'dialog':
      return <DialogWindowView window={window.window} item={window.item} />;
    case 'investigator-items':
      return <InvestigatorItemsWindow window={window.window} />;
    case 'menu':
      return <GameMenuWindow />;
    case 'saves':
      return <SaveSelectWindow saves={window.saves} />;
    case 'inventory':
      return <InventoryWindow window={window.window} />;
    case 'inventory-d2e':
      return <InventoryD2EWindow window={window.window} />;
    case 'skills':
      return <SkillsWindow window={window.window} />;
    case 'set':
      return <SetWindowView window={window.window} />;
    case 'log':
      return <LogWindowView window={window.window} entries={window.entries} dialog={window.dialog} />;
    case 'monster':
      return <MonsterWindow window={window.window} />;
    case 'monster-d2e':
      return <MonsterD2EWindow window={window.window} />;
    case 'attack':
      return <AttackWindow window={window.window} greyed={window.greyed} />;
    case 'evade':
      return <TextWindow label={val('EVADE')} text={window.window.text} greyed={window.greyed} />;
    case 'horror':
      return <TextWindow label={val('HORROR_CHECK')} text={window.window.text} greyed={false} />;
    case 'activation':
      return <ActivationWindow window={window.window} />;
    case 'activation-d2e':
      return <ActivationD2EWindow window={window.window} />;
    case 'info':
      return <InfoWindow window={window.window} />;
    case 'hero':
      return <HeroWindow window={window.window} />;
    case 'puzzle-code':
      return <PuzzleCodeView window={window.window} />;
    case 'puzzle-slide':
      return <PuzzleSlideView window={window.window} />;
    case 'puzzle-image':
      return <PuzzleImageView window={window.window} />;
    case 'puzzle-tower':
      return <PuzzleTowerView window={window.window} />;
    case 'monster-image':
    case 'transition':
    case 'end':
    case 'loading':
      return null;
  }
}

/** The windows of the play screen: the monster on the left, the windows in the middle, the full-screen ones on top. */
export function WindowStack() {
  const windows = useUI((s) => s.windows);
  useUI((s) => s.revision);
  const image = windows.find((w) => w.kind === 'monster-image');
  const monsterWindow = windows.find((w) => w.kind === 'monster');
  const descentMonster = windows.findLast((w) => w.kind === 'monster-d2e' || w.kind === 'activation-d2e');
  // The monster window draws the health itself (its call is CreateWindow); the others draw it with the picture
  let redraw: MonsterRedraw | null = null;
  if (image?.kind === 'monster-image' && image.displayHealth) redraw = (m, h) => MonsterDialogMoM.drawMonster(m, h);
  if (monsterWindow?.kind === 'monster' && !monsterWindow.window.horrorStep()) redraw = monsterWindow.window.redraw;
  // Investigator items and the save slots have a layer of their own, over the board
  const layered = (w: GameWindow) => w.kind === 'investigator-items' || w.kind === 'saves';
  const cards = windows.filter((w) => w.kind !== 'monster-image' && w.kind !== 'transition' && w.kind !== 'end' && w.kind !== 'loading' && !layered(w));
  const transition = windows.findLast((w) => w.kind === 'transition');
  return (
    <>
      {windows.map((w, i) =>
        layered(w) ? (
          <Guard key={`${w.kind}-${i}`}>
            <WindowView window={w} />
          </Guard>
        ) : null,
      )}
      {(cards.length > 0 || image !== undefined) && (
        <div className="window-layer dialog-layer">
          {/* Not in Valkyrie (11 November 2026): the monster and the windows side by side, or one above the other, in one
              box that lays them out together, so that they never cover each other at any text size or screen (play.css) */}
          <div className="dialog-stack">
            {image?.kind === 'monster-image' && <MonsterPanel monster={image.monster} redraw={redraw} />}
            {image === undefined && descentMonster !== undefined && (descentMonster.kind === 'monster-d2e' || descentMonster.kind === 'activation-d2e') && <MonsterPicture monster={descentMonster.window.monster} />}
            {cards.map((w, i) => (
              // Not in Valkyrie: a window that fails to draw leaves the board and the other windows as they are
              <Guard key={`${w.kind}-${i}`}>
                {w.kind === 'dialog' && w.item !== null && <ItemPanel item={w.item} />}
                <WindowView window={w} />
              </Guard>
            ))}
          </div>
        </div>
      )}
      {transition?.kind === 'transition' && <TransitionWindow phase={transition.phase} />}
      {windows.some((w) => w.kind === 'end') && <EndGameWindow />}
    </>
  );
}
