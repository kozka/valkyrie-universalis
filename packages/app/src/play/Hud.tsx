// What stays on screen while the quest is played: the menu button (MenuButton), Descent's log, skills and items
// buttons (LogButton, SkillButton and InventoryButton), Mansions' button bar (NextStageButton) and the list of monsters
// (MonsterCanvas). Rewritten from Valkyrie's Unity drawing; each part names the code it draws, and its buttons call the
// engine's rules.
import { openNotes } from './notes.ts';
import {
  CommonStringKeys,
  Game,
  GameMenu,
  InventoryWindow,
  LogWindow,
  MonsterCanvas,
  Quest,
  SkillWindow,
  ValkyrieConstants,
  type NextStageButton,
} from '@universalis/engine';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Picture } from '../ui/Picture.tsx';
import { ButtonRow } from './ButtonRow.tsx';
import { epicTier, type EpicTier } from './epicSpawn.ts';
import { monsterPlace, switchOn } from '../ui/preferences.ts';
import { run } from '../ui/run.ts';
import { chosenMonster, useUI } from '../ui/store.ts';
import { nameOf, uni, val } from '../ui/text.ts';

// Valkyrie: MenuButton.cs MenuButton.MenuButton and Menu (the editor's menu comes with the editor)
export function MenuButton() {
  // Not in Valkyrie: the windows keep clear of the menu by its real width, whatever the language, text size or theme
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const button = ref.current;
    const screen = button?.closest<HTMLElement>('.quest-screen');
    if (!button || !screen) return;
    const measure = () => screen.style.setProperty('--menu-width', `${Math.ceil(button.getBoundingClientRect().width)}px`);
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(button);
    return () => {
      watch.disconnect();
      screen.style.removeProperty('--menu-width');
    };
  }, []);
  return (
    <button ref={ref} type="button" className="button hud menu-button" onClick={() => run(() => GameMenu.create())}>
      {val('MENU')}
    </button>
  );
}

/** Valkyrie's buttons do nothing while a window is open, or a monster group activates. */
function windowOpen(): boolean {
  const ui = Game.get().ui;
  return ui.findTag(Game.DIALOG) || ui.findTag(Game.ACTIVATION);
}

// When pressed bring up the approriate menu
// Valkyrie: LogButton.cs LogButton.Log
function log(): void {
  if (windowOpen()) return;
  new LogWindow();
}

// Valkyrie: SkillButton.cs SkillButton.Skills
function skills(): void {
  if (windowOpen()) return;
  new SkillWindow();
}

// Valkyrie: InventoryButton.cs InventoryButton.Items
function items(): void {
  if (windowOpen()) return;
  new InventoryWindow();
}

// Valkyrie: LogButton.cs, SkillButton.cs and InventoryButton.cs, their constructors: along the bottom, in the game's
// heading font, except in the editor and in Mansions (which has them in its NextStageButton)
export function DescentButtons() {
  const game = Game.get();
  if (game.editMode || game.gameType.typeName() === ValkyrieConstants.typeMom) return null;
  // Not in Valkyrie: greyed while they would do nothing, though still pressed as there (Valkyrie issue #987)
  const idle = windowOpen() ? ' idle' : '';
  return (
    <nav className="descent-buttons" aria-label={uni('PHASE_BAR')}>
      <button type="button" className={`button hud${idle}`} onClick={() => run(log)}>
        {CommonStringKeys.LOG.translate()}
      </button>
      <button type="button" className={`button hud${idle}`} onClick={() => run(skills)}>
        {val('SKILLS')}
      </button>
      <button type="button" className={`button hud${idle}`} onClick={() => run(items)}>
        {val('ITEMS')}
      </button>
    </nav>
  );
}

/** The phase the bar names, and whether it is the investigators' (white) or the Mythos' (red). */
function phaseName(phase: Quest.MoMPhase): string {
  if (phase === Quest.MoMPhase.horror) return val('HORROR_STEP');
  if (phase === Quest.MoMPhase.mythos) return val('PHASE_MYTHOS');
  if (phase === Quest.MoMPhase.monsters) return val('MONSTER_STEP');
  return val('PHASE_INVESTIGATOR');
}

// Valkyrie: NextStageButton.cs NextStageButton.Update
export function PhaseBar({ button }: { button: NextStageButton }) {
  const [asking, setAsking] = useState(false);
  const [reminding, setReminding] = useState(false);
  const investigators = button.phase === Quest.MoMPhase.investigator;
  // Not in Valkyrie: an advanced option reminds of the horror checks once the monsters have acted, as the official app
  // does (Valkyrie issue 683)
  const lastPhase = useRef(button.phase);
  useEffect(() => {
    if (button.phase === Quest.MoMPhase.horror && lastPhase.current !== Quest.MoMPhase.horror && switchOn('horrorReminder')) setReminding(true);
    if (button.phase !== Quest.MoMPhase.horror) setReminding(false);
    lastPhase.current = button.phase;
  });
  const game = Game.get();
  // Not in Valkyrie: greyed while they would do nothing, though still pressed as there (Valkyrie issue #987)
  const dialog = game.ui.findTag(Game.DIALOG);
  const idle = (yes: boolean) => (yes ? ' idle' : '');
  const nextIdle = dialog || game.currentQuest!.uiItemsPresent();
  const next = () => {
    // Not in Valkyrie: an advanced option asks first, as the official app does, when the press would end the phase (#1173)
    if (investigators && !nextIdle && switchOn('confirmPhase')) setAsking(true);
    else run(() => button.next());
  };
  // Not in Valkyrie: the windows keep clear of the bar by its real height, whatever the theme or the screen
  const bar = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = bar.current;
    const screen = nav?.closest<HTMLElement>('.quest-screen');
    if (!nav || !screen) return;
    const measure = () => screen.style.setProperty('--phase-bar-height', `${Math.ceil(nav.getBoundingClientRect().height)}px`);
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(nav);
    return () => {
      watch.disconnect();
      screen.style.removeProperty('--phase-bar-height');
    };
  }, []);
  return (
    <>
      {!investigators && <div className="phase-vignette" aria-hidden="true" />}
      <nav ref={bar} className={`phase-bar ${investigators ? 'investigators' : 'mythos'}`} aria-label={uni('PHASE_BAR')}>
        <button type="button" className={`button hud items${idle(dialog)}`} onClick={() => run(() => button.items())}>
          <span className="hud-label">{val('ITEMS_SMALL')}</span>
        </button>
        {/* Not in Valkyrie (11 November 2026): Set waits while another window is open, as Items does, instead of opening
            a second window over it (Valkyrie opens it over an event); the log still opens, to read again what happened */}
        <button type="button" className={`button hud set${idle(dialog || game.ui.findTag(Game.SETWINDOW))}`} onClick={() => !(dialog || game.ui.findTag(Game.SETWINDOW)) && run(() => button.set())}>
          <span className="hud-label">{CommonStringKeys.SET.translate()}</span>
        </button>
        <button type="button" className="button hud log" onClick={() => run(() => button.log())}>
          <span className="hud-label">{CommonStringKeys.LOG.translate()}</span>
        </button>
        {/* Not in Valkyrie: the players' notes on the game (play/notes.ts) */}
        <button type="button" className="button hud notes" onClick={() => openNotes()}>
          <span className="hud-label">{uni('NOTES')}</span>
        </button>
        <p className="phase-name" aria-live="polite">
          <span>{phaseName(button.phase)}</span>
        </p>
        <button type="button" className={`button hud next-phase${idle(nextIdle)}`} aria-label={uni('NEXT_PHASE')} onClick={next}>
          {CommonStringKeys.TAB.translate()}
        </button>
        {asking &&
          createPortal(
            <div className="window-layer phase-confirm-layer">
              <section className="window panel event-window phase-confirm" role="alertdialog" aria-labelledby="phase-confirm-text">
                <div className="card event-text">
                  <p id="phase-confirm-text">{uni('CONFIRM_PHASE_TEXT')}</p>
                </div>
                <ButtonRow>
                  <button
                    type="button"
                    className="button event-button"
                    autoFocus
                    onClick={() => {
                      setAsking(false);
                      run(() => button.next());
                    }}
                  >
                    {val('CONFIRM')}
                  </button>
                  <button type="button" className="button event-button" onClick={() => setAsking(false)}>
                    {CommonStringKeys.CANCEL.translate()}
                  </button>
                </ButtonRow>
              </section>
            </div>,
            document.body,
          )}
        {reminding &&
          createPortal(
            <div className="window-layer phase-confirm-layer">
              <section className="window panel event-window phase-confirm" role="alertdialog" aria-labelledby="horror-reminder-text">
                <div className="card event-text">
                  <p id="horror-reminder-text">{uni('HORROR_REMINDER_TEXT')}</p>
                </div>
                <ButtonRow>
                  <button type="button" className="button event-button" autoFocus onClick={() => setReminding(false)}>
                    {CommonStringKeys.CONTINUE.translate()}
                  </button>
                </ButtonRow>
              </section>
            </div>,
            document.body,
          )}
      </nav>
    </>
  );
}

// Valkyrie: MonsterCanvas.cs MonsterIcon.Draw, DrawAwareness and DrawHorror
function MonsterIcon({ monster, fresh = false, epic = 0 }: { monster: Quest.Monster; fresh?: boolean; epic?: EpicTier }) {
  const game = Game.get();
  const chosen = useUI((s) => chosenMonster(s.windows)) === monster;
  const name = nameOf(monster.monsterData.name);
  const mom = game.gameType.typeName() === 'MoM';
  let badge: { value: number; kind: string; label: string } | null = null;
  if (mom) {
    // MoM shows awareness while investigators act, horror the rest of the round
    if (game.currentQuest!.phase === Quest.MoMPhase.investigator) {
      if (monster.monsterData.awareness !== 0) badge = { value: monster.monsterData.awareness, kind: 'awareness', label: uni('AWARENESS', monster.monsterData.awareness) };
    } else if (monster.monsterData.horror !== 0) {
      badge = { value: monster.monsterData.horror, kind: 'horror', label: uni('HORROR_VALUE', monster.monsterData.horror) };
    }
  } else if (monster.getHealth() !== 0) {
    badge = { value: monster.getHealth(), kind: 'health', label: uni('HEALTH', monster.getHealth()) };
  }
  // Descent dims monsters that have activated and frames unique ones in green; MoM doesn't do colours
  const state = mom ? '' : `${monster.activated ? 'activated' : ''} ${monster.unique ? 'unique' : ''}`;
  const label = [name, badge?.label, monster.duplicate > 0 ? uni('DUPLICATE', monster.duplicate) : undefined].filter(Boolean).join(', ');
  return (
    <button type="button" className={`monster-icon ${state} ${fresh ? 'monster-new' : ''} ${epic > 0 ? `monster-epic epic-${epic}` : ''} ${chosen ? 'chosen' : ''}`} aria-label={label} onClick={() => run(() => MonsterCanvas.monsterDiag(monster))}>
      <Picture file={monster.monsterData.image} name={name} className="monster-picture" decorative />
      {badge !== null && <span className={`monster-badge ${badge.kind}`}>{badge.value}</span>}
      {monster.duplicate > 0 && <span className="monster-duplicate">{monster.duplicate}</span>}
    </button>
  );
}

interface Epic {
  monster: Quest.Monster;
  tier: EpicTier;
  key: number;
}

/** How long each tier's mark lasts, in milliseconds (play.css's animations). */
const EPIC_TIME: Record<EpicTier, number> = { 0: 0, 1: 2600, 2: 2600, 3: 2800 };

function tierOf(monster: Quest.Monster): EpicTier {
  const data = monster.monsterData;
  return epicTier({
    game: Game.get().gameType.typeName(),
    sectionName: data.sectionName,
    derivedType: (data as { derivedType?: string }).derivedType,
    healthBase: data.healthBase,
    healthPerHero: data.healthPerHero,
    traits: data.traits,
    unique: monster.unique,
  });
}

/**
 * Not in Valkyrie (12 November 2026): a tough monster's coming. From the second tier the board shakes (the board's
 * stage, so that the windows and buttons stay still); a boss also fills the screen a moment with its picture in a red
 * glow, over everything and never in the way of a press. The player's reduced motion leaves only the glow.
 */
function EpicSpawn({ epic }: { epic: Epic }) {
  useEffect(() => {
    if (epic.tier < 2) return;
    const stage = document.querySelector<HTMLElement>('.quest-screen .board-stage');
    const shake = `epic-shake-${epic.tier}`;
    stage?.classList.add(shake);
    const done = setTimeout(() => stage?.classList.remove(shake), 900);
    return () => {
      clearTimeout(done);
      stage?.classList.remove(shake);
    };
  }, [epic]);
  if (epic.tier < 3) return null;
  return createPortal(
    <div className="epic-spawn" aria-hidden="true">
      <Picture file={epic.monster.monsterData.image} name={nameOf(epic.monster.monsterData.name)} className="epic-spawn-picture" decorative />
    </div>,
    document.body,
  );
}

/**
 * The monsters each quest had when the game's screen first drew it (none in a new game, all of them in a loaded one),
 * then the ones the list last drew. Kept apart from the list, which only shows once the first monster comes and goes
 * when Valkyrie clears it: the first monster of a game came too (12 November 2026: a scenario's boss as its first
 * monster was not marked).
 */
const knownMonsters = new WeakMap<object, Set<Quest.Monster>>();

/** For QuestScreen, at every drawing of a game: notes the monsters a quest starts with, the first time it is drawn. */
export function noteQuestMonsters(quest: { monsters: readonly Quest.Monster[] }): void {
  if (!knownMonsters.has(quest)) knownMonsters.set(quest, new Set(quest.monsters));
}

/**
 * Not in Valkyrie: the monsters that just came (they shine a moment, as the official app shows a spawn; Valkyrie issue
 * 256) and the ones just gone (drawn a moment more, burning away). A loaded game's monsters are not new.
 */
function useMonsterChanges(quest: { monsters: readonly Quest.Monster[] } | null): { fresh: Set<Quest.Monster>; ghosts: { monster: Quest.Monster; key: number }[]; epic: Epic | null } {
  const monsters = quest?.monsters ?? [];
  const [fresh, setFresh] = useState<Set<Quest.Monster>>(() => new Set());
  const [ghosts, setGhosts] = useState<{ monster: Quest.Monster; key: number }[]>([]);
  const [epic, setEpic] = useState<Epic | null>(null);
  // After every drawing: the list is the engine's own array, changed in place
  useEffect(() => {
    if (quest === null) return;
    const current = new Set(monsters);
    const previous = knownMonsters.get(quest) ?? current;
    knownMonsters.set(quest, current);
    const came = [...current].filter((m) => !previous.has(m));
    const left = [...previous].filter((m) => !current.has(m));
    if (came.length > 0) {
      setFresh((f) => new Set([...f, ...came]));
      setTimeout(() => setFresh((f) => new Set([...f].filter((m) => !came.includes(m)))), 2500);
      // Not in Valkyrie (12 November 2026): the toughest of those that came is marked by how tough it is (epicSpawn.ts)
      if (switchOn('epicSpawns')) {
        const toughest = came.map((monster) => ({ monster, tier: tierOf(monster), key: Math.random() })).sort((a, b) => b.tier - a.tier)[0]!;
        if (toughest.tier > 0) {
          setEpic(toughest);
          setTimeout(() => setEpic((e) => (e === toughest ? null : e)), EPIC_TIME[toughest.tier]);
        }
      }
    }
    if (left.length > 0) {
      const added = left.map((monster) => ({ monster, key: Math.random() }));
      setGhosts((g) => [...g, ...added]);
      setTimeout(() => setGhosts((g) => g.filter((x) => !added.includes(x))), 900);
    }
  });
  return { fresh, ghosts, epic };
}

/** Valkyrie's list shows five monsters at a time. */
const SLOTS = 5;

/**
 * Not in Valkyrie (11 November 2026): how many monsters fit between the menu and the bottom of the screen (the next
 * phase's button, in Mansions), as many as fit well. Valkyrie's five are what its size lets fit on its screen; with the
 * app's sizes, on a phone held sideways five did not fit (the arrow down and the monsters after the fifth were off the
 * screen), and on a tall screen more fit than five.
 */
function useSlots(list: RefObject<HTMLElement | null>, count: number, bottom: boolean): { slots: number; place: CSSProperties | undefined } {
  const [slots, setSlots] = useState(SLOTS);
  const [place, setPlace] = useState<CSSProperties | undefined>(undefined);
  const [, remeasure] = useState(0);
  useEffect(() => {
    const again = () => remeasure((n) => n + 1);
    window.addEventListener('resize', again);
    const watch = new ResizeObserver(again);
    for (const bar of document.querySelectorAll('.phase-bar, .descent-buttons, .menu-button')) watch.observe(bar);
    return () => {
      window.removeEventListener('resize', again);
      watch.disconnect();
    };
  }, []);
  useLayoutEffect(() => {
    const box = list.current;
    const icon = box?.querySelector('.monster-icon');
    if (box === null || box === undefined || icon === null || icon === undefined) return;
    const gap = parseFloat(bottom ? getComputedStyle(box).columnGap : getComputedStyle(box).rowGap) || 0;
    const ul = getComputedStyle(box.querySelector('ul')!);
    const between = parseFloat(bottom ? ul.columnGap : ul.rowGap) || 0;
    const size = icon.getBoundingClientRect();
    const pitch = (bottom ? size.width : size.height) + between;
    const scroll = box.querySelector('.scroll')?.getBoundingClientRect();
    const arrow = (scroll !== undefined ? (bottom ? scroll.width : scroll.height) : parseFloat(getComputedStyle(document.documentElement).fontSize) * 1.8) + gap;
    const next = document.querySelector('.phase-bar > .button.next-phase')?.getBoundingClientRect();
    let room: number;
    if (bottom) {
      // Along the bottom, between the bar's buttons on the left (Mansions' notes, Descent's items) and the next phase's
      const left = (document.querySelector('.phase-bar > .button.notes') ?? document.querySelector('.descent-buttons'))?.getBoundingClientRect();
      const from = (left?.right ?? 0) + 12;
      const to = (next?.left ?? window.innerWidth - 8) - 12;
      const below = left !== undefined ? Math.max(0, window.innerHeight - left.bottom) : 8;
      const at: CSSProperties = { left: from, right: window.innerWidth - to, bottom: below, top: 'auto' };
      if (JSON.stringify(at) !== JSON.stringify(place)) setPlace(at);
      room = to - from;
    } else {
      if (place !== undefined) setPlace(undefined);
      room = (next?.top ?? window.innerHeight) - 4 - box.getBoundingClientRect().top;
    }
    const fit = (space: number) => Math.max(1, Math.floor((space + between) / pitch));
    // All of them without arrows if they fit so, else as many as fit between the two arrows
    const shown = fit(room) >= count ? Math.max(count, 1) : fit(room - 2 * arrow);
    if (shown !== slots) setSlots(shown);
  });
  return { slots, place };
}

// Valkyrie: MonsterCanvas.cs MonsterCanvas.UpdateList, DrawUp and DrawDown
export function MonsterList() {
  useUI((s) => s.revision);
  const game = Game.get();
  const quest = game.currentQuest;
  const gone = useMonsterChanges(quest);
  const list = useRef<HTMLElement>(null);
  const count = quest?.monsters.length ?? 0;
  const bottom = monsterPlace() === 'bottom';
  const { slots, place } = useSlots(list, count, bottom);
  // Other than Valkyrie's five: the app keeps its own place in the list, as Valkyrie's offset never goes past the fifth
  // from the end (with fewer shown, the last ones would be out of reach) and its arrows show from the sixth on
  const [own, setOwn] = useState<number | null>(null);
  if (quest === null || (count === 0 && gone.ghosts.length === 0)) return null;
  const offset = game.monsterCanvas.offset;
  const paged = slots !== SLOTS;
  const start = paged ? Math.max(0, Math.min(own ?? offset, count - slots)) : offset;
  const up = paged ? count > slots : !(count < 6 && offset === 0);
  const down = paged ? count > slots : count >= 6;
  return (
    <aside ref={list} className="monster-list" style={place} aria-label={uni('MONSTER_LIST')}>
      {gone.epic !== null && <EpicSpawn key={gone.epic.key} epic={gone.epic} />}
      {/* Up when there are more than five monsters, greyed at the top */}
      {up && (
        <button type="button" className="button hud scroll" aria-label={uni('SCROLL_UP')} disabled={start === 0} onClick={() => (paged ? setOwn(start - 1) : run(() => MonsterCanvas.move(-1)))}>
          {bottom ? '‹' : '˄'}
        </button>
      )}
      <ul>
        {quest.monsters.slice(start, start + slots).map((monster, i) => (
          <li key={start + i}>
            <MonsterIcon monster={monster} fresh={gone.fresh.has(monster)} epic={gone.epic?.monster === monster ? gone.epic.tier : 0} />
          </li>
        ))}
        {/* Not in Valkyrie: a defeated monster burns away instead of vanishing at once */}
        {gone.ghosts.map(({ monster, key }) => (
          <li key={key} className="monster-gone" aria-hidden="true">
            <span className="monster-icon">
              <Picture file={monster.monsterData.image} name={nameOf(monster.monsterData.name)} className="monster-picture" decorative />
            </span>
          </li>
        ))}
      </ul>
      {down && (
        <button
          type="button"
          className="button hud scroll"
          aria-label={uni('SCROLL_DOWN')}
          disabled={paged ? start >= count - slots : count - offset < 6}
          onClick={() => (paged ? setOwn(start + 1) : run(() => MonsterCanvas.move()))}
        >
          {bottom ? '›' : '˅'}
        </button>
      )}
    </aside>
  );
}
