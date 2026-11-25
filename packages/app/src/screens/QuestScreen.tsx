// The quest once it starts, drawn from the engine's state: the board with the quest's UI elements (board/), and over
// it the hero icons (HeroCanvas.SetupUI, UpdateImages and UpdateStatus) with Descent's morale (MoraleDisplay), the hero
// selection (Game.StartQuest and HeroSelection.Draw), Descent's class selection (ClassSelectionScreen), the menu button,
// Descent's log, skills and items buttons, Mansions' button bar, the monsters (play/Hud.tsx), Descent's shop and the
// windows (play/Windows.tsx), and in a test from the editor, the editor's panel. Rewritten from Valkyrie's Unity
// drawing; each part names the code it draws.
import { useEffect } from 'react';
import {
  ClassData,
  ClassSelectionScreen,
  CommonStringKeys,
  Game,
  GameStateManager,
  HeroData,
  type HeroSelection,
  type MoraleDisplay,
  type Quest,
  ValkyrieConstants,
} from '@universalis/engine';
import { BoardView } from '../board/BoardView.tsx';
import { QuickOptions } from '../play/QuickOptions.tsx';
import { editorTest } from '../ui/editorTest.ts';
import { RulesHelp } from '../ui/RulesHelp.tsx';
import { FeedbackInGame } from '../ui/Feedback.tsx';
import { heroesToChoose, playingDoom } from './doom.ts';
import { newScreens } from '../themes/themes.ts';
import { HeroRoom, useRoomFits } from '../themes/universalis/HeroRoom.tsx';
import { DescentHeroRoom } from '../themes/universalis/DescentHeroRoom.tsx';
import { DoomHeroRoom } from '../themes/universalis/DoomHeroRoom.tsx';
import { DescentButtons, MenuButton, MonsterList, noteQuestMonsters, PhaseBar } from '../play/Hud.tsx';
import { useCalmAutoSave } from '../play/autoSave.ts';
import { NotesWindow } from '../play/NotesWindow.tsx';
import { GameTimer } from '../play/GameTimer.tsx';
import { switchOn } from '../ui/preferences.ts';
import { ShopView, WindowStack } from '../play/Windows.tsx';
import { Picture } from '../ui/Picture.tsx';
import { HERO_VIEWS, heroView, setHeroView, type HeroView } from '../ui/preferences.ts';
import { run } from '../ui/run.ts';
import { chosenHero, useUI } from '../ui/store.ts';
import { nameOf, uni, val } from '../ui/text.ts';
import './QuestScreen.css';
import '../themes/universalis/play.css';
import '../themes/universalis/descentScreens.css';
import '../themes/universalis/doomPlay.css';
import '../themes/universalis/descentPlay.css';

/** List<string>.Sort() with the invariant culture, as HeroSelection.Draw sorts the heroes. */
const collator = new Intl.Collator('en-US', { usage: 'sort', sensitivity: 'variant', caseFirst: 'lower' });

// Valkyrie: HeroCanvas.cs HeroCanvas.AddHero, UpdateImages and UpdateStatus, and MoraleDisplay.cs (above the heroes)
function HeroCanvasView({ quest, morale }: { quest: Quest; morale: MoraleDisplay | null }) {
  const game = Game.get();
  const chosen = useUI((s) => chosenHero(s.windows));
  return (
    <aside className="hero-canvas" aria-label={game.gameType.heroesName().translate()}>
      {morale !== null && (
        <p className="morale" role="status" aria-label={uni('MORALE', String(morale.morale))}>
          {morale.morale}
        </p>
      )}
      {quest.heroes.map((h) => {
        // No hero: invisible once the heroes are chosen, an empty frame before
        if (h.heroData === null && quest.heroesSelected) return null;
        const name = h.heroData !== null ? nameOf(h.heroData.name) : '';
        const classes = ['hero-slot', h.defeated ? 'defeated' : '', h.activated ? 'activated' : '', h.selected ? 'selected' : '', h === chosen ? 'chosen' : ''].join(' ');
        return (
          <button
            key={h.id}
            type="button"
            className={classes}
            aria-label={name || String(h.id)}
            aria-pressed={h.selected}
            onClick={() => run(() => game.heroCanvas.heroDiag(h.id))}
          >
            {h.heroData !== null ? <Picture file={h.heroData.image} name={name} className="portrait" decorative /> : <span className="empty" />}
          </button>
        );
      })}
    </aside>
  );
}

/** Not in Valkyrie: the three sizes of the investigators' list, as icons: a list of small rows, of big rows, of pictures. */
function HeroViewIcon({ view }: { view: HeroView }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {view === 'normal' && [5, 10, 15, 20].map((y) => <rect key={y} x="3" y={y - 1.5} width="18" height="3" rx="1.5" />)}
      {view === 'large' && [7, 17].map((y) => <rect key={y} x="3" y={y - 3.5} width="18" height="7" rx="3.5" />)}
      {view === 'larger' && [[3, 3], [13, 3], [3, 13], [13, 13]].map(([x, y]) => <rect key={`${x}${y}`} x={x} y={y} width="8" height="8" rx="1.5" />)}
    </svg>
  );
}

// Valkyrie: Game.cs Game.StartQuest (title, back and finished) and HeroSelection.cs HeroSelection.Draw
function HeroSelectionView({ quest, selection }: { quest: Quest; selection: HeroSelection | null }) {
  const game = Game.get();
  const heroList = heroesToChoose(game).sort(collator.compare);
  // Not in Valkyrie: Mansions' selection in the Universalis theme is kozka's room (themes/universalis/HeroRoom.tsx)
  const roomFits = useRoomFits();
  if (newScreens() && roomFits && game.gameType.typeName() === ValkyrieConstants.typeMom) return <HeroRoom quest={quest} selection={selection} heroes={heroList} />;
  // Not in Valkyrie: Descent's, the dwarven hall (themes/universalis/DescentHeroRoom.tsx), and DooM's, the ship's bridge
  if (newScreens() && roomFits && game.gameType.typeName() === ValkyrieConstants.typeDescent) {
    const Room = playingDoom() ? DoomHeroRoom : DescentHeroRoom;
    return <Room quest={quest} selection={selection} heroes={heroList} />;
  }
  const chosen = new Set(quest.heroes.flatMap((h) => (h.heroData !== null ? [h.heroData.sectionName] : [])));
  // Not in Valkyrie: how many the scenario asks for (HeroCanvas.EndSection waits for minHero), and how many are chosen
  const { minHero, maxHero } = quest.qd.quest;
  const view = heroView();
  return (
    <section className="hero-selection" data-view={view}>
      <div className="hero-selection-head">
        <h1>{val('SELECT', game.gameType.heroesName())}</h1>
        <p className="hero-count" aria-live="polite">
          {minHero === maxHero ? uni('HEROES_ASKED_EXACT', minHero) : uni('HEROES_ASKED_RANGE', minHero, maxHero)} · {uni('HEROES_CHOSEN', chosen.size)}
        </p>
        <div className="hero-views" role="radiogroup" aria-label={uni('HERO_VIEW')}>
          {HERO_VIEWS.map((v) => (
            <button key={v} type="button" role="radio" aria-checked={v === view} className="hero-view" title={uni(`HERO_VIEW_${v.toUpperCase()}`)} aria-label={uni(`HERO_VIEW_${v.toUpperCase()}`)} onClick={() => setHeroView(v)}>
              <HeroViewIcon view={v} />
            </button>
          ))}
        </div>
      </div>
      {selection !== null && (
        <ul className="hero-list">
          {heroList.map((hero) => {
            const heroData = game.cd.get(HeroData, hero);
            const name = nameOf(heroData.name);
            return (
              <li key={hero}>
                <button
                  type="button"
                  className="hero-choice"
                  aria-pressed={chosen.has(hero)}
                  onClick={() => run(() => selection.select(hero))}
                >
                  <Picture file={heroData.image} name={name} className="portrait" decorative />
                  <span>{name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <footer className="screen-foot">
        <button type="button" className="button back" onClick={() => run(() => GameStateManager.Quest.restart())}>
          {val('BACK')}
        </button>
        {/* Always live, as Valkyrie's: HeroCanvas.EndSection sets each chosen hero's variable, then waits for enough heroes */}
        <button type="button" data-sound="start" className="button primary" onClick={() => run(() => game.endSelection())}>
          {CommonStringKeys.FINISHED.translate()}
        </button>
      </footer>
    </section>
  );
}

// Valkyrie: ClassSelectionScreen.cs ClassSelectionScreen.Draw and DrawHero (Descent)
function ClassSelectionView({ quest, screen }: { quest: Quest; screen: ClassSelectionScreen }) {
  const game = Game.get();
  const heroes = quest.heroes.filter((h) => h.heroData !== null);
  const className = (name: string) => nameOf(game.cd.get(ClassData, name).name);
  // Not in Valkyrie: whether every hero has a class, which Universalis' Descent look shows on Finished (descentScreens.css)
  const ready = heroes.every((_, i) => {
    const { hybridClass, options } = screen.classOptions(i);
    return hybridClass.length > 0 || options.some((o) => o.picked);
  });
  return (
    <section className="hero-selection class-selection" data-ready={ready ? '' : undefined}>
      <h1>{val('SELECT_CLASS')}</h1>
      <div className="class-heroes">
        {heroes.map((h, i) => {
          const name = nameOf(h.heroData!.name);
          const { hybridClass, options } = screen.classOptions(i);
          return (
            <section key={h.id} className="class-hero" aria-label={name}>
              <Picture file={h.heroData!.image} name={name} className="portrait" decorative />
              <h2>{name}</h2>
              {/* A hybrid class sits on top, in green: pressed again, it goes */}
              {hybridClass.length > 0 && (
                <button type="button" className="class-choice picked hybrid" onClick={() => run(() => screen.select(i, hybridClass))}>
                  {className(hybridClass)}
                </button>
              )}
              <ul className="class-list">
                {options.map((o) => (
                  <li key={o.className}>
                    {/* A class another hero has is dark, the hero's own is green, and neither can be pressed */}
                    <button
                      type="button"
                      className={`class-choice${o.picked ? ' picked' : ''}`}
                      aria-pressed={o.picked}
                      disabled={!o.available}
                      onClick={() => run(() => screen.select(i, o.className))}
                    >
                      {className(o.className)}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <footer className="screen-foot">
        <button type="button" className="button back" onClick={() => run(ClassSelectionScreen.backButtonAction())}>
          {CommonStringKeys.BACK.translate()}
        </button>
        {/* Always live, as Valkyrie's: Finished sets the classes' variables up to the first hero without one, and waits */}
        <button type="button" data-sound="start" className="button primary" onClick={() => run(() => screen.finished())}>
          {CommonStringKeys.FINISHED.translate()}
        </button>
      </footer>
    </section>
  );
}

/** The editor's panel of the test running. */
function TestPanel() {
  const Panel = editorTest()!.Panel;
  return <Panel />;
}

export function QuestScreen() {
  const state = useUI();
  // Valkyrie: Game.cs Game.Update (alt+D draws the log window again, with or without the variables)
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (!e.altKey || e.code !== 'KeyD' || Game.get().logWindow === null) return;
      e.preventDefault();
      run(() => Game.get().logWindow?.update(true));
    };
    globalThis.addEventListener('keydown', key);
    return () => globalThis.removeEventListener('keydown', key);
  }, []);
  useCalmAutoSave(state.questButtons && state.windows.length === 0 && !state.heroSelectionScreen && state.classSelection === null);
  const quest = Game.get().currentQuest;
  if (quest === null) return null;
  noteQuestMonsters(quest);
  // The end screen covers the game, as Valkyrie's full-screen picture does
  const ended = state.windows.some((w) => w.kind === 'end');
  return (
    <main className="quest-screen">
      <div className="quest-play" inert={ended}>
        <BoardView />
        {state.heroCanvas && <HeroCanvasView quest={quest} morale={state.morale} />}
        {state.heroSelectionScreen && <HeroSelectionView quest={quest} selection={state.heroSelection} />}
        {state.classSelection !== null && <ClassSelectionView quest={quest} screen={state.classSelection} />}
        {state.monsterList && <MonsterList />}
        {state.questButtons && <MenuButton />}
        {state.questButtons && switchOn('gameTimer') && <GameTimer />}
        {state.questButtons && <DescentButtons />}
        {state.stageBar !== null && <PhaseBar button={state.stageBar} />}
        {state.shop !== null && <ShopView shop={state.shop} />}
      </div>
      <WindowStack />
      <QuickOptions />
      <RulesHelp />
      <NotesWindow />
      <FeedbackInGame />
      {/* Not in Valkyrie: beside a game tested from the editor, its panel (ui/editorTest.ts), once the heroes and their classes are chosen, which it would cover */}
      {Game.get().testMode && editorTest() !== null && !state.heroSelectionScreen && state.classSelection === null && <TestPanel />}
    </main>
  );
}
