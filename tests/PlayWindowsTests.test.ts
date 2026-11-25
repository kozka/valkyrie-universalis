// Characterization tests of Mansions' play windows, written from Valkyrie's C# (NextStageButton.cs,
// RoundControllerMoM.cs, MonsterCanvas.cs, MonsterDialogMoM.cs, InvestigatorAttack.cs, InvestigatorEvade.cs,
// HorrorCheck.cs, ActivateDialogMoM.cs, InventoryWindowMoM.cs, SetWindow.cs, LogWindow.cs, GameMenu.cs,
// ChangePhaseWindow.cs, PuzzleCodeWindow.cs, PuzzleSlideWindow.cs, PuzzleImageWindow.cs and PuzzleTowerWindow.cs), which
// has no NUnit tests for them. Not ported from Valkyrie. They use the battery's setting (all MoM base packs) and a small
// quest written here, with a cultist, an item that can be inspected, a lock with a code and the other three puzzles.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  ActivateDialogMoM,
  Application,
  File,
  Game,
  GameMenu,
  GameStateManager,
  HeadlessUI,
  HorrorCheck,
  InventoryWindowMoM,
  InvestigatorAttack,
  InvestigatorEvade,
  LogWindow,
  MonsterCanvas,
  MonsterDialogMoM,
  PuzzleCode,
  PuzzleCodeWindow,
  PuzzleImage,
  PuzzleImageWindow,
  PuzzleSlide,
  PuzzleSlideWindow,
  PuzzleTower,
  PuzzleTowerWindow,
  Quest,
  QuestData,
  Random,
  SetWindow,
  ValkyrieDebug,
  type DialogWindow,
} from '@universalis/engine';
import { RoundControllerMoM } from '@universalis/module-mom';
import { createEnvironment, type Environment } from '../tools/battery/environment.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const QUEST = '/AppData/Valkyrie/MoM/Editor/PlayTest';

const QUEST_INI = `[Quest]
format=21
type=MoM
defaultlanguage=English
minhero=1
maxhero=5

[QuestText]
Localization.English.txt

[QuestData]
events.ini
`;

const TEXT = `.,English
quest.name,Play test
EventStart.text,The cultist waits.
EventStart.button1,Continue
SpawnCultist.text,A cultist appears.
SpawnCultist.button1,Continue
EventDefeated.text,The cultist falls.
EventDefeated.button1,Continue
EventInspect.text,The lamp flickers.
EventInspect.button1,Close
PuzzleLock.button1,Open
EventOpened.text,The lock opens.
EventOpened.button1,Continue
SpawnGhost.text,A ghost appears.
SpawnGhost.button1,Continue
CustomMonsterGhost.monstername,Ghost
PuzzleBlocks.button1,Push
PuzzleMosaic.button1,Look
PuzzleTowers.button1,Lift
`;

const EVENTS = `[EventStart]
trigger=EventStart
buttons=1
event1=SpawnCultist
add=TileHall QItemLamp

[SpawnCultist]
monster=MonsterCultist
buttons=1
event1=

[EventDefeated]
trigger=DefeatedMonsterCultist
buttons=1
event1=

[EventInspect]
buttons=1
event1=

[PuzzleLock]
display=false
buttons=1
event1=EventOpened
class=code
skill={agility}
puzzlelevel=3
puzzlealtlevel=4
puzzlesolution=1 2 3

[EventOpened]
buttons=1
event1=

[SpawnGhost]
monster=CustomMonsterGhost
buttons=1
event1=

[CustomMonsterGhost]
base=MonsterCultist
image=ghost.png

[QItemLamp]
traits=lightsource
inspect=EventInspect

[PuzzleBlocks]
display=false
buttons=1
event1=EventOpened
skill={strength}
puzzlelevel=2

[PuzzleMosaic]
display=false
buttons=1
event1=EventOpened
class=image
image=mosaic.png
puzzlelevel=2
puzzlealtlevel=2

[PuzzleTowers]
display=false
buttons=1
event1=EventOpened
class=tower
puzzlelevel=1

[TileHall]
side=TileSideAlley1
xposition=0
yposition=0
`;

let env: Environment;
let ui: HeadlessUI;
let stopLog: () => void;

/** Starts the quest with two investigators and answers its first two dialogs: the cultist is on the list. */
function startQuest(): Quest {
  File.writeAllText(QUEST + '/quest.ini', QUEST_INI);
  File.writeAllText(QUEST + '/Localization.English.txt', TEXT);
  File.writeAllText(QUEST + '/events.ini', EVENTS);

  GameStateManager.Quest.start(new QuestData.Quest(QUEST));
  const game = Game.get();
  game.heroCanvas.heroSelection!.select('HeroRitaYoung');
  game.heroCanvas.heroSelection!.select('HeroAgathaCrane');
  game.endSelection();
  game.questStartEvent();
  ui.lastDialog!.onButton(0);
  ui.lastDialog!.onButton(0);
  return game.currentQuest!;
}

function dialog(): DialogWindow {
  return ui.lastDialog!;
}

/** The header of a PNG of this size: what FileToTexture reads. */
function pngHeader(width: number, height: number): Uint8Array {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52, 0, 0, 0, 0, 0, 0, 0, 0]);
  const view = new DataView(png.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return png;
}

/** The moves (block, square) that solve a slide puzzle soonest, trying every square each block can reach. */
function solveSlide(window: PuzzleSlideWindow): [number, number][] {
  const blocks = window.puzzle.puzzle;
  const start = blocks.map((b): [number, number] => [b.xpos, b.ypos]);
  const place = (state: [number, number][]) =>
    state.forEach(([x, y], i) => {
      blocks[i]!.xpos = x;
      blocks[i]!.ypos = y;
    });
  const seen = new Set<string>([start.join(';')]);
  let queue = [{ state: start, path: [] as [number, number][] }];
  try {
    while (queue.length > 0) {
      const next: typeof queue = [];
      for (const { state, path } of queue) {
        place(state);
        if (window.puzzle.solved()) return path;
        blocks.forEach((b, i) => {
          const from = b.rotation ? b.ypos : b.xpos;
          for (let p = window.getNegativeLimit(b); p <= window.getPositiveLimit(b); p++) {
            if (p === from) continue;
            const moved = state.map((s): [number, number] => [s[0], s[1]]);
            moved[i]![b.rotation ? 1 : 0] = p;
            const key = moved.join(';');
            if (seen.has(key)) continue;
            seen.add(key);
            next.push({ state: moved, path: [...path, [i, p]] });
          }
        });
      }
      queue = next;
    }
    throw new Error('No solution');
  } finally {
    place(start);
  }
}

/** The swaps (piece's screen position, step) that solve a picture puzzle soonest. */
function solveImage(window: PuzzleImageWindow): { at: [number, number]; step: { x: number; y: number } }[] {
  const columns = window.questPuzzle.puzzleLevel;
  const rows = window.questPuzzle.puzzleAltLevel;
  const start: number[] = [];
  for (const [screen, picture] of window.puzzle.state) start[screen.x + screen.y * columns] = picture.x + picture.y * columns;
  const solved = start.map((_, i) => i).join(',');
  const steps = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];
  const seen = new Set<string>([start.join(',')]);
  let queue = [{ state: start, path: [] as { at: [number, number]; step: { x: number; y: number } }[] }];
  while (queue.length > 0) {
    const next: typeof queue = [];
    for (const { state, path } of queue) {
      if (state.join(',') === solved) return path;
      for (let i = 0; i < state.length; i++) {
        const x = i % columns;
        const y = Math.floor(i / columns);
        for (const step of steps) {
          if (x + step.x >= columns || y + step.y >= rows) continue;
          const j = x + step.x + (y + step.y) * columns;
          const swapped = [...state];
          [swapped[i], swapped[j]] = [swapped[j]!, swapped[i]!];
          if (seen.has(swapped.join(','))) continue;
          seen.add(swapped.join(','));
          next.push({ state: swapped, path: [...path, { at: [x, y], step }] });
        }
      }
    }
    queue = next;
  }
  throw new Error('No solution');
}

/** Opens the lock's code puzzle, as an event that leads to it would. */
function openLock(quest: Quest): PuzzleCodeWindow {
  quest.eManager.queueEvent('PuzzleLock');
  return ui.lastWindow as PuzzleCodeWindow;
}

describe('PlayWindowsTests', () => {
  beforeAll(() => {
    env = createEnvironment('MoM', join(root, 'packages', 'engine', 'data'), []);
  }, 120_000);

  beforeEach(() => {
    ui = new HeadlessUI();
    env.game.ui = ui;
    env.game.roundControl = new RoundControllerMoM();
    Application.fatalErrors.length = 0;
    Random.initState(1);
    stopLog = ValkyrieDebug.onLog(() => {});
  });

  afterEach(() => {
    stopLog();
  });

  it('Start_TheCultistIsOnTheListAndTheBarShowsTheInvestigatorPhase', () => {
    const quest = startQuest();
    const game = Game.get();

    expect(quest.monsters.map((m) => m.monsterData.sectionName)).toEqual(['MonsterCultist']);
    expect(quest.vars.getValue('#monsters')).toBe(1);
    expect(ui.findTag(Game.DIALOG)).toBe(false);
    expect(game.stageUI!.phase).toBe(Quest.MoMPhase.investigator);
    expect(ui.findTag(Game.UIPHASE)).toBe(true);
  });

  it('Next_GoesThroughTheMythosPhaseTheMonsterActivationAndTheHorrorStep', () => {
    const quest = startQuest();
    const game = Game.get();

    // The investigators finish: Mythos phase, the cultist activates
    game.stageUI!.next();
    expect(ui.transitions).toEqual([Quest.MoMPhase.mythos]);
    expect(quest.phase).toBe(Quest.MoMPhase.monsters);
    const activation = ui.lastWindow as ActivateDialogMoM;
    expect(activation).toBeInstanceOf(ActivateDialogMoM);
    expect(activation.step).toBe('ability');
    expect(ui.lastMonsterDrawn).toBe(quest.monsters[0]);
    expect(game.stageUI!.phase).toBe(Quest.MoMPhase.monsters);

    // The bar's next button waits while a dialog is open
    game.stageUI!.next();
    expect(quest.phase).toBe(Quest.MoMPhase.monsters);

    // The monster attacks, then it has activated: the horror step
    activation.createAttackWindow();
    expect(activation.step).toBe('attack');
    // Log entries end with a blank line (LogEntry.GetEntry)
    expect([...quest.log].map((e) => e.getEntry()).at(-1)).toBe(quest.monsters[0]!.currentActivation!.masterActions + '\n\n');
    activation.activated();
    expect(quest.phase).toBe(Quest.MoMPhase.horror);
    expect(quest.monsters[0]!.activated).toBe(true);

    // Next ends the round: round two, the investigator phase again, saved automatically
    const saves = ui.screenshots;
    game.stageUI!.next();
    expect(quest.vars.getValue('#round')).toBe(2);
    expect(quest.phase).toBe(Quest.MoMPhase.investigator);
    expect(quest.monsters[0]!.activated).toBe(false);
    expect(ui.transitions).toEqual([Quest.MoMPhase.mythos, Quest.MoMPhase.investigator]);
    expect(ui.screenshots).toBe(saves + 1);
  });

  it('MonsterDiag_OpensTheMonsterWindowOnlyWithoutADialog', () => {
    const quest = startQuest();
    const cultist = quest.monsters[0]!;

    MonsterCanvas.monsterDiag(cultist);
    const window = ui.lastWindow as MonsterDialogMoM;
    expect(window).toBeInstanceOf(MonsterDialogMoM);
    expect(window.horrorStep()).toBe(false);
    expect(window.isAlive()).toBe(true);
    expect(ui.lastMonsterDrawn).toBe(cultist);

    // Another click while the window is open does nothing
    MonsterCanvas.monsterDiag(cultist);
    expect(ui.lastWindow).toBe(window);
  });

  it('MonsterDamage_StaysBetweenNothingAndTheMonsterHealth', () => {
    const quest = startQuest();
    const cultist = quest.monsters[0]!;
    MonsterCanvas.monsterDiag(cultist);
    const window = ui.lastWindow as MonsterDialogMoM;

    MonsterDialogMoM.monsterDamageDec(cultist, window.redraw);
    expect(cultist.damage).toBe(0);
    // health=1 and healthperhero=1, with two investigators
    expect(cultist.getHealth()).toBe(3);
    for (let i = 0; i < 5; i++) MonsterDialogMoM.monsterDamageInc(cultist, window.redraw);
    expect(cultist.damage).toBe(3);
    // The redraw is the same window's CreateWindow, now without attack or evade
    expect(ui.lastWindow).toBe(window);
    expect(window.isAlive()).toBe(false);
  });

  it('Defeated_RemovesTheMonsterAndTriggersItsDefeatedEvent', () => {
    const quest = startQuest();
    const cultist = quest.monsters[0]!;
    MonsterCanvas.monsterDiag(cultist);

    MonsterDialogMoM.defeated(cultist);

    expect(quest.monsters).toEqual([]);
    expect(quest.vars.getValue('#monsters')).toBe(0);
    expect(dialog().eventData.qEvent.sectionName).toBe('EventDefeated');
  });

  it('Attack_OffersTheMonsterTypesAndLogsTheAttackText', () => {
    const quest = startQuest();
    const cultist = quest.monsters[0]!;
    MonsterCanvas.monsterDiag(cultist);
    const undo = quest.undoStack.count;

    (ui.lastWindow as MonsterDialogMoM).attack();
    const attack = ui.lastWindow as InvestigatorAttack;
    expect(attack).toBeInstanceOf(InvestigatorAttack);
    expect(quest.undoStack.count).toBe(undo + 1);
    expect(attack.attackText).toBe('');
    // A cultist is a humanoid: every weapon type has attacks against it
    expect(attack.attackTypes().sort()).toEqual(['bladed', 'firearm', 'heavy', 'spell', 'unarmed']);

    attack.attackWith('heavy');
    expect(attack.attackText).toMatch(/^ATTACK_HEAVY_VS_HUMANOID_\d+$/);
    expect([...quest.log].map((e) => e.getEntry()).at(-1)).toBe(attack.attackText + '\n\n');
    expect(ui.lastWindow).toBe(attack);
    expect(ui.lastMonsterDrawn).toBe(cultist);
  });

  it('EvadeAndHorror_ShowARandomTextOfTheMonsterType', () => {
    const quest = startQuest();
    const cultist = quest.monsters[0]!;

    MonsterCanvas.monsterDiag(cultist);
    (ui.lastWindow as MonsterDialogMoM).evade();
    const evade = ui.lastWindow as InvestigatorEvade;
    expect(evade).toBeInstanceOf(InvestigatorEvade);
    expect(evade.text).toMatch(/^MONSTER_CULTIST_EVADE_\d+$/);

    quest.phase = Quest.MoMPhase.horror;
    Game.get().ui.destroyTag(Game.DIALOG);
    MonsterCanvas.monsterDiag(cultist);
    expect((ui.lastWindow as MonsterDialogMoM).horrorStep()).toBe(true);
    (ui.lastWindow as MonsterDialogMoM).horror();
    const horror = ui.lastWindow as HorrorCheck;
    expect(horror).toBeInstanceOf(HorrorCheck);
    expect(horror.text).toMatch(/^MONSTER_CULTIST_HORROR_\d+$/);
    expect(horror.monster).toBe(cultist);
  });

  it('Inventory_ListsTheItemsToInspectAndQueuesTheirEvent', () => {
    const quest = startQuest();
    const game = Game.get();

    game.stageUI!.items();
    const window = ui.lastWindow as InventoryWindowMoM;
    expect(window).toBeInstanceOf(InventoryWindowMoM);
    const items = window.items();
    expect(items).toEqual([quest.itemSelect.get('QItemLamp')]);

    // A window is open: the bar's items button waits
    game.stageUI!.items();
    expect(ui.lastWindow).toBe(window);

    window.inspect(items[0]!);
    expect(dialog().eventData.qEvent.sectionName).toBe('EventInspect');
  });

  it('SetWindow_SetsTheFireAndAnEliminatedInvestigator', () => {
    const quest = startQuest();
    const game = Game.get();

    game.stageUI!.set();
    let window = ui.lastWindow as SetWindow;
    expect(window.fire()).toBe(false);
    window.setFire();
    window = ui.lastWindow as SetWindow;
    expect(quest.vars.getValue('$fire')).toBe(1);
    expect(window.fire()).toBe(true);
    window.clearFire();
    expect(quest.vars.getValue('$fire')).toBe(0);

    (ui.lastWindow as SetWindow).eliminate();
    expect(quest.vars.getValue('#eliminated')).toBe(1);
    expect((ui.lastWindow as SetWindow).eliminated()).toBe(true);
    expect((ui.lastWindow as SetWindow).eliminatedComplete()).toBe(false);
    // Not once the final round has started
    quest.vars.setValue('#eliminatedcomplete', 1);
    expect((ui.lastWindow as SetWindow).eliminatedComplete()).toBe(true);
    (ui.lastWindow as SetWindow).uneliminate();
    expect(quest.vars.getValue('#eliminated')).toBe(1);
    quest.vars.setValue('#eliminatedcomplete', 0);
    (ui.lastWindow as SetWindow).uneliminate();
    expect(quest.vars.getValue('#eliminated')).toBe(0);
  });

  it('LogWindow_ListsTheTextsAndLetsADeveloperChangeAVariable', () => {
    const quest = startQuest();
    const game = Game.get();

    game.stageUI!.log();
    const window = ui.lastWindow as LogWindow;
    expect(game.logWindow).toBe(window);
    expect(window.entries()).toEqual(['The cultist waits.', 'A cultist appears.']);

    window.updateValue('counter', '2.5');
    expect(quest.vars.getValue('counter')).toBe(2.5);
    window.updateValue('counter', 'x');
    expect(quest.vars.getValue('counter')).toBe(0);
  });

  it('GameMenu_OpensWithoutADialogUndoesAndQuitsSaving', () => {
    const quest = startQuest();
    const game = Game.get();

    // Nothing while a dialog is open
    MonsterCanvas.monsterDiag(quest.monsters[0]!);
    GameMenu.create();
    expect(ui.lastWindow).toBeInstanceOf(MonsterDialogMoM);
    game.ui.destroyTag(Game.DIALOG);

    GameMenu.create();
    expect(ui.findTag(Game.DIALOG)).toBe(true);

    // Undo goes back to the state before the last save (the attack's)
    MonsterCanvas.monsterDiag(quest.monsters[0]!);
    // The menu dialog closes first
    game.ui.destroyTag(Game.DIALOG);
    MonsterCanvas.monsterDiag(quest.monsters[0]!);
    (ui.lastWindow as MonsterDialogMoM).attack();
    quest.monsters[0]!.damage = 2;
    game.ui.destroyTag(Game.DIALOG);
    GameMenu.undo();
    expect(game.currentQuest!.monsters[0]!.damage).toBe(0);

    const saves = ui.screenshots;
    GameMenu.quit();
    expect(ui.screenshots).toBe(saves + 1);
  });

  it('ChangePhaseWindow_IsNotShownInTheEditorsTestMode', () => {
    startQuest();
    const game = Game.get();
    game.testMode = true;
    try {
      game.stageUI!.next();
    } finally {
      game.testMode = false;
    }
    expect(ui.transitions).toEqual([]);
  });

  it('PuzzleCode_BuildsAGuessOfTheLevelsLengthAndFinishesOnceSolved', () => {
    const quest = startQuest();
    const window = openLock(quest);
    expect(window).toBeInstanceOf(PuzzleCodeWindow);
    expect(ui.findTag(Game.DIALOG)).toBe(true);
    // Symbols 0 to puzzlealtlevel, numbers without an image type
    expect(window.buttons.map((b) => b.image ?? b.label.translate())).toEqual(['0', '1', '2', '3', '4']);
    expect(window.puzzle.answer.toString()).toBe('1 2 3');

    // No more symbols than the code has, and no guess until it is complete
    for (let i = 0; i < 4; i++) window.guessAdd(2);
    expect(window.guessList).toEqual([2, 2, 2]);
    window.guessRemove(0);
    window.guess();
    expect(window.puzzle.guess).toEqual([]);

    window.guessAdd(4);
    window.guess();
    const [first] = window.puzzle.guess;
    expect(first!.correctSpot()).toBe(1);
    expect(first!.correctType()).toBe(0);
    expect(window.puzzle.solved()).toBe(false);
    expect(window.guessList).toEqual([]);

    for (const symbol of [1, 2, 3]) window.guessAdd(symbol);
    window.guess();
    expect(window.puzzle.solved()).toBe(true);
    expect(ui.lastWindow).toBe(window);

    window.finished();
    expect(dialog().eventData.qEvent.sectionName).toBe('EventOpened');
    expect(quest.puzzle.has('PuzzleLock')).toBe(false);
  });

  it('PuzzleCode_CloseKeepsTheGuessesForTheNextTimeAndTheSave', () => {
    const quest = startQuest();
    const game = Game.get();
    let window = openLock(quest);
    for (const symbol of [3, 2, 1]) window.guessAdd(symbol);
    window.guess();
    window.close();
    expect(ui.findTag(Game.DIALOG)).toBe(false);
    expect(quest.eManager.currentEvent).toBeNull();
    expect(quest.puzzle.get('PuzzleLock')).toBe(window.puzzle);

    // Played again: the same guesses, and the moves of this time count from zero
    window = openLock(quest);
    expect(window.puzzle).toBe(quest.puzzle.get('PuzzleLock'));
    expect(window.previousMoves).toBe(1);

    // The save keeps the puzzle, and loading it restores it
    expect(quest.toString()).toContain('[PuzzleCodePuzzleLock]\r\nanswer=1 2 3\r\nguess=3 2 1\r\n');
    window.close();
    quest.save();
    quest.puzzle.clear();
    GameMenu.undo();
    const loaded = game.currentQuest!.puzzle.get('PuzzleLock') as PuzzleCode;
    expect(loaded).toBeInstanceOf(PuzzleCode);
    expect(loaded.answer.toString()).toBe('1 2 3');
    expect(loaded.guess.map((g) => g.toString())).toEqual(['3 2 1']);
  });

  it('PuzzleCode_WithoutASolutionDrawsACodeOfTheAltLevelsSymbols', () => {
    const quest = startQuest();
    (quest.qd.components.get('PuzzleLock') as QuestData.Puzzle).puzzleSolution = '';
    const window = openLock(quest);
    expect(window.puzzle.answer.state).toHaveLength(3);
    for (const symbol of window.puzzle.answer.state) {
      expect(symbol).toBeGreaterThanOrEqual(1);
      expect(symbol).toBeLessThanOrEqual(4);
    }
  });

  it('MonsterList_AMonsterWithoutItsPictureComesInAndTheEventGoesOn', () => {
    const quest = startQuest();
    expect(ui.findTag(Game.MONSTERS)).toBe(true);
    // Not in Valkyrie (16 October 2026): MonsterIcon's NullReferenceException stopped the event; now the app draws a placeholder
    expect(() => quest.eManager.queueEvent('SpawnGhost')).not.toThrow();
    expect(quest.monsters.map((m) => m.monsterData.sectionName)).toEqual(['MonsterCultist', 'CustomMonsterGhost']);
    expect(quest.vars.getValue('#monsters')).toBe(2);
    expect(ui.findTag(Game.MONSTERS)).toBe(true);
    expect(dialog().eventData.qEvent.sectionName).toBe('SpawnGhost');

    // With its picture, the same monster comes in as any other
    File.writeAllBytes(QUEST + '/ghost.png', new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52, 0, 0, 0, 64, 0, 0, 0, 64]));
    expect(() => Game.get().monsterCanvas.updateList()).not.toThrow();
    expect(ui.findTag(Game.MONSTERS)).toBe(true);
  });
  it('PuzzleSlide_DragsBlocksWithinTheirLimitsCountsMovesAndFinishesOnceSolved', () => {
    const quest = startQuest();
    quest.eManager.queueEvent('PuzzleBlocks');
    const window = ui.lastWindow as PuzzleSlideWindow;
    expect(window).toBeInstanceOf(PuzzleSlideWindow);
    expect(ui.findTag(Game.DIALOG)).toBe(true);
    // One of Valkyrie's puzzles of two moves (Resources/slidepuzzles.txt), its target block first, on the exit row
    const target = window.puzzle.puzzle[0]!;
    expect([target.target, target.ypos]).toEqual([true, 2]);
    expect(window.puzzle.moves).toBe(0);
    expect(window.puzzle.solved()).toBe(false);
    expect(window.finishLabel.translate()).toBe('Push');

    // A block follows a drag within its limits, onto a square when it is within a third of one
    expect(window.dragPosition(target, 100)).toBe(window.getPositiveLimit(target));
    expect(window.dragPosition(target, -100)).toBe(window.getNegativeLimit(target));
    expect(window.dragPosition(target, 0.2)).toBe(target.xpos);
    // Dropped where it was, it does not count
    window.release(target, window.dragPosition(target, 0.2));
    expect(window.puzzle.moves).toBe(0);

    const solution = solveSlide(window);
    expect(solution).toHaveLength(2);
    for (const [i, p] of solution) window.release(window.puzzle.puzzle[i]!, p);
    expect(window.puzzle.moves).toBe(2);
    expect(window.puzzle.solved()).toBe(true);
    expect(ui.lastWindow).toBe(window);

    window.finished();
    expect(dialog().eventData.qEvent.sectionName).toBe('EventOpened');
    expect(quest.puzzle.has('PuzzleBlocks')).toBe(false);
  });

  it('PuzzleImage_CutsThePictureMovesOnePieceOneStepAndFinishesOnceSolved', () => {
    const quest = startQuest();
    File.writeAllBytes(QUEST + '/mosaic.png', pngHeader(200, 100));
    quest.eManager.queueEvent('PuzzleMosaic');
    const window = ui.lastWindow as PuzzleImageWindow;
    expect(window).toBeInstanceOf(PuzzleImageWindow);
    // Two by two pieces of a picture twice as wide as it is high; Unity counts the rows from the bottom
    expect([window.texture.width, window.texture.height]).toEqual([200, 100]);
    expect([window.width, window.height]).toEqual([9.5, 4.75]);
    expect(window.pieceRect(1, 0)).toEqual({ x: 100, y: 50, width: 100, height: 50 });
    expect(window.pieceRect(0, 1)).toEqual({ x: 0, y: 0, width: 100, height: 50 });
    expect(window.fadeSpeed(false)).toBeNull();
    expect(window.puzzle.state.size).toBe(4);

    // A piece follows a drag (in UI units, y down) one piece at most, never off the picture, and only along the axis
    // it moved most, measured in units: these pieces are twice as wide as they are high
    const corner = [...window.puzzle.state.keys()].find((k) => k.x === 0 && k.y === 0)!;
    expect(window.dragOffset(corner, -7, 2)).toEqual({ x: 0, y: 2 });
    expect(window.dragOffset(corner, 16, 3)).toEqual({ x: 9.5, y: 0 });
    expect(window.dragOffset(corner, 1, -5)).toEqual({ x: 1, y: 0 });
    expect(window.dragOffset(corner, 4, 4)).toEqual({ x: 4, y: 0 });
    expect(window.dragOffset(corner, 3, 4)).toEqual({ x: 0, y: 4 });
    // Dropped less than half a piece away, it goes back; more, it swaps places with its neighbour
    window.release(corner, window.dragOffset(corner, 4, 4));
    expect(window.puzzle.moves).toBe(0);
    const neighbour = [...window.puzzle.state.keys()].find((k) => k.x === 1 && k.y === 0)!;
    window.release(corner, window.dragOffset(corner, 6, 5));
    expect(window.puzzle.moves).toBe(1);
    expect([corner.x, corner.y, neighbour.x, neighbour.y]).toEqual([1, 0, 0, 0]);

    for (const { at, step } of solveImage(window)) {
      const piece = [...window.puzzle.state.keys()].find((k) => k.x === at[0] && k.y === at[1])!;
      window.release(piece, { x: step.x * window.width, y: step.y * window.height });
    }
    expect(window.puzzle.solved()).toBe(true);
    window.finished();
    expect(dialog().eventData.qEvent.sectionName).toBe('EventOpened');
  });

  it('PuzzleImage_WithoutItsPictureStopsTheEventAsInValkyrie', () => {
    const quest = startQuest();
    File.delete(QUEST + '/mosaic.png');
    // The window reads the size of the picture, which is not there: the event stops before drawing anything
    expect(() => quest.eManager.queueEvent('PuzzleMosaic')).toThrow(TypeError);
    expect(ui.lastWindow).toBeNull();
  });

  it('PuzzleTower_ShowsTheMoveWhileDraggingAndMakesItWhenDropped', () => {
    const quest = startQuest();
    quest.eManager.queueEvent('PuzzleTowers');
    const window = ui.lastWindow as PuzzleTowerWindow;
    expect(window).toBeInstanceOf(PuzzleTowerWindow);
    // One move from the end: seven blocks on a tower and the smallest on another, in any order
    expect(window.puzzle.puzzle.map((t) => t.length).sort()).toEqual([0, 1, 7]);
    const big = window.puzzle.puzzle.findIndex((t) => t.length === 7);
    const small = window.puzzle.puzzle.findIndex((t) => t.length === 1);
    const empty = 3 - big - small;

    // A bigger block onto a smaller one is not shown, and not made
    window.click(big);
    window.hover(small);
    expect(window.puzzleDisplay).toEqual(window.puzzle.puzzle);
    window.release();
    expect(window.puzzle.moves).toBe(0);

    // The smallest block shows over the empty tower, and is put on the big one
    window.click(small);
    window.hover(empty);
    expect(window.puzzleDisplay[empty]).toEqual([0]);
    expect(window.puzzle.puzzle[empty]).toEqual([]);
    window.hover(big);
    window.release();
    expect(window.puzzle.moves).toBe(1);
    expect(window.puzzle.solved()).toBe(true);
    expect(window.puzzleDisplay).toEqual(window.puzzle.puzzle);

    // Once solved, nothing moves
    window.click(big);
    expect(window.startDragTower).toBe(-1);
    window.finished();
    expect(dialog().eventData.qEvent.sectionName).toBe('EventOpened');
  });

  it('Puzzles_CloseKeepsThemForTheNextTimeAndTheSaveRestoresEachKind', () => {
    const quest = startQuest();
    const game = Game.get();
    File.writeAllBytes(QUEST + '/mosaic.png', pngHeader(100, 100));

    quest.eManager.queueEvent('PuzzleBlocks');
    let slide = ui.lastWindow as PuzzleSlideWindow;
    const [i, p] = solveSlide(slide)[0]!;
    slide.release(slide.puzzle.puzzle[i]!, p);
    slide.close();
    expect(ui.findTag(Game.DIALOG)).toBe(false);
    expect(quest.eManager.currentEvent).toBeNull();
    expect(quest.puzzle.get('PuzzleBlocks')).toBe(slide.puzzle);

    // Played again: the same blocks, and the moves of this time count from those already made
    quest.eManager.queueEvent('PuzzleBlocks');
    slide = ui.lastWindow as PuzzleSlideWindow;
    expect(slide.puzzle).toBe(quest.puzzle.get('PuzzleBlocks'));
    expect(slide.lastMoves).toBe(1);
    slide.close();

    quest.eManager.queueEvent('PuzzleMosaic');
    (ui.lastWindow as PuzzleImageWindow).close();
    quest.eManager.queueEvent('PuzzleTowers');
    (ui.lastWindow as PuzzleTowerWindow).close();

    const saved = [...quest.puzzle].map(([id, puzzle]) => puzzle.toString(id));
    expect(saved.map((s) => s.split('\r\n')[0])).toEqual(['[PuzzleSlidePuzzleBlocks]', '[PuzzleImagePuzzleMosaic]', '[PuzzleTowerPuzzleTowers]']);
    quest.save();
    quest.puzzle.clear();
    GameMenu.undo();
    const loaded = game.currentQuest!.puzzle;
    expect(loaded.get('PuzzleBlocks')).toBeInstanceOf(PuzzleSlide);
    expect(loaded.get('PuzzleMosaic')).toBeInstanceOf(PuzzleImage);
    expect(loaded.get('PuzzleTowers')).toBeInstanceOf(PuzzleTower);
    expect([...loaded].map(([id, puzzle]) => puzzle.toString(id))).toEqual(saved);
  });

  it('Puzzles_KeptAsAnotherKindStopTheEventAsInValkyrie', () => {
    const quest = startQuest();
    // A save edited by hand: `as PuzzleSlide` gives null, and reading its moves throws
    quest.puzzle.set('PuzzleBlocks', new PuzzleTower(1));
    expect(() => quest.eManager.queueEvent('PuzzleBlocks')).toThrow(TypeError);
    quest.puzzle.set('PuzzleTowers', new PuzzleImage(2, 2));
    quest.eManager.currentEvent = null;
    expect(() => quest.eManager.queueEvent('PuzzleTowers')).toThrow(TypeError);
    expect(ui.lastWindow).toBeNull();
  });
});
