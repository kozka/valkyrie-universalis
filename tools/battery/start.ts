// Battery v2: starts each quest the quest list shows, as a player would but without drawing (HeadlessUI), runs its
// start events and then plays a few steps, always taking the first choice. Not ported from Valkyrie; each step names
// the Valkyrie code that a player's clicks run.
import {
  Application,
  Game,
  GameStateManager,
  HeadlessUI,
  HeroData,
  Quest,
  QuestData,
  Random,
  ValkyrieDebug,
} from '../../packages/engine/src/index.ts';
import type { Environment } from './environment.ts';

export const START_STATUSES = ['ok', 'not-started', 'fatal', 'crash'] as const;
/** How many choices the battery makes after the start events: enough to go through intros such as TLE's. */
export const PLAY_STEPS = 10;
export type StartStatus = (typeof START_STATUSES)[number];

export interface StartWarning {
  kind: string;
  detail: string;
}

export interface StartResult {
  status: StartStatus;
  /** What waits for the player once the start events have run: an event's dialog, another window, or the board. */
  screen?: string;
  /** The quest file running by then, when an event changed quest (Quest.ChangeQuest), relative to the package. */
  changedTo?: string;
  /** The choices made after the start events, in order: the dialog button pressed or the element clicked. */
  played: string[];
  reason?: string;
  detail?: string;
  /** What Valkyrie writes to its log, or to the quest log that the editor's log window shows, while the quest starts. */
  warnings: StartWarning[];
}

/** The messages Valkyrie writes while a quest runs, by kind. */
const WARNING_KINDS: [RegExp, string][] = [
  [/^Warning: Missing event called: /, 'missing-event'],
  [/^Warning: Unable to find an item for QItem: /, 'qitem-unmatched'],
  [/^Error: Unable to find monster of traits /, 'spawn-unmatched'],
  [/^Warning: Monster type unknown in event: /, 'spawn-unmatched'],
  [/^WARNING: only one QItem can be used in event /, 'qitem-several'],
  [/^Warning: Quest component .* is using missing token type: /s, 'token-type-missing'],
  [/^Error: Token .* does not have a valid picture/s, 'token-picture-missing'],
  [/^Warning: (Button )?[Cc]olor must be /, 'bad-colour'],
  [/^Warning: Invalid var clause in text: /, 'bad-var-clause'],
  [/^Warning: Hero selection in event: /, 'hero-selection-missing'],
  [/^Warning: Unable to find activation: /, 'activation-missing'],
  [/^Could not resolve file: /, 'missing-media'],
  [/^Warning: (DDS |PVR )?Image (missing|invalid|loading)/, 'image-unreadable'],
  [/^Warning: ImageToTexture failed/, 'image-unreadable'],
];

function warningOf(message: string): StartWarning | null {
  for (const [pattern, kind] of WARNING_KINDS) {
    if (pattern.test(message)) return { kind, detail: message };
  }
  return null;
}

/** Quest log entries for the editor (Quest.LogEntry with editor set), which Valkyrie uses for its warnings. */
function editorEntries(quest: Quest): string[] {
  const entries: string[] = [];
  for (const entry of quest.log) {
    const line = entry.toString(0);
    if (line.startsWith('editor0=')) entries.push(line.substring('editor0='.length).replace(/\r\n$/, '').replaceAll('\\n', '\n'));
  }
  return entries;
}

/** What waits for the player: the dialog of an event, another window, the quest's own UI elements, or the board. */
function screenOf(ui: HeadlessUI, game: Game): string {
  if (game.currentQuest === null) return ui.endGames > 0 ? 'end-screen' : 'main-menu';
  if (ui.lastDialog !== null) return 'dialog ' + ui.lastDialog.eventData.qEvent.sectionName;
  if (ui.findTag(Game.SHOP)) return 'shop';
  if (ui.findTag(Game.DIALOG)) return 'window';
  if (game.currentQuest.uiItemsPresent()) return 'quest-ui';
  return 'board';
}

/**
 * Up to PLAY_STEPS choices, the first one each time: the first button a dialog lets press (with the first heroes
 * selected when the event asks for some, as HeroCanvas.HeroDiag would), the button of a quota dialog, or else the
 * topmost clickable element of the quest's own UI (TokenBoard.TokenControl.startEvent). Stops at anything else.
 */
function play(ui: HeadlessUI, game: Game, played: string[]): void {
  for (let step = 0; step < PLAY_STEPS && game.currentQuest !== null; step++) {
    const quest = game.currentQuest;
    const dialog = ui.lastDialog;
    if (dialog !== null) {
      const event = dialog.eventData.qEvent;
      let selected = 0;
      for (const h of quest.heroes) {
        h.selected = h.heroData !== null && selected < event.minHeroes;
        if (h.selected) selected++;
      }
      if (dialog.quotaButton !== null) {
        played.push(event.sectionName + ' quota');
        dialog.onQuota();
        continue;
      }
      const button = dialog.buttons.find((b) => b.enabled);
      if (button === undefined) return;
      played.push(event.sectionName + ' ' + button.num);
      dialog.onButton(button.num);
      continue;
    }
    // Another window (a puzzle, a monster activation…) is left to the player
    if (ui.findTag(Game.DIALOG)) return;
    const clickable = game.tokenBoard.tc.filter((c) => c.clickable && c.c instanceof Quest.UI && c.c.unityObject !== null);
    const top = clickable.at(-1);
    if (top === undefined) return;
    played.push('click ' + top.c!.getEvent()!.sectionName);
    top.startEvent();
  }
}

/**
 * GameStateManager.Quest.Start, then the hero selection (two heroes, or the quest's minimum, in content order) and
 * Game.EndSelection; in Descent the first free class for each hero and ClassSelectionScreen.Finished, in Mansions the
 * finished button of InvestigatorItems. Both run Game.QuestStartEvent. Then a few steps of play.
 */
export function startQuest(env: Environment, questDir: string): StartResult {
  const game = env.game;
  const ui = new HeadlessUI();
  game.ui = ui;
  game.stageUI = null;
  Application.fatalErrors.length = 0;
  Random.initState(1);

  const log: string[] = [];
  const stopLog = ValkyrieDebug.onLog((message) => {
    if (message) log.push(message);
  });
  const result: StartResult = { status: 'ok', warnings: [], played: [] };
  let quest: Quest | null = null;
  let error: unknown = null;
  try {
    const q = new QuestData.Quest(questDir);
    GameStateManager.Quest.start(q);
    quest = game.currentQuest!;

    const heroCount = Math.min(Math.max(q.minHero, 2), quest.heroes.length);
    for (const hero of game.cd.keys(HeroData).slice(0, heroCount)) {
      game.heroCanvas.heroSelection!.select(hero);
    }
    game.endSelection();

    if (env.gameName === 'D2E') {
      const screen = ui.lastClassSelection;
      if (screen === null) {
        result.status = 'not-started';
        result.reason = 'no-class-selection';
      } else {
        const selected = quest.heroes.filter((h) => h.heroData !== null).length;
        for (let i = 0; i < selected; i++) {
          const option = screen.classOptions(i).options.find((o) => o.available);
          if (option !== undefined) screen.select(i, option.className);
        }
        screen.finished();
      }
    } else if (ui.lastInvestigatorItems === null) {
      result.status = 'not-started';
      result.reason = 'no-starting-items';
    } else {
      game.questStartEvent();
    }
    if (result.status === 'ok' && game.stageUI === null) {
      result.status = 'not-started';
      result.reason = 'quest-start-event-not-run';
    }
    if (result.status === 'ok' && Application.fatalErrors.length === 0) {
      play(ui, game, result.played);
    }
    result.screen = screenOf(ui, game);
    const running = game.currentQuest?.qd.questPath ?? null;
    if (running !== null && running !== questDir + '/quest.ini') result.changedTo = running.substring(questDir.length + 1);
  } catch (e) {
    error = e;
  } finally {
    stopLog();
  }

  const messages = [...log, ...(quest !== null ? editorEntries(quest) : [])];
  const unique = new Map<string, StartWarning>();
  for (const message of messages) {
    const warning = warningOf(message);
    if (warning !== null) unique.set(warning.kind + '\u0000' + warning.detail, warning);
  }
  result.warnings = [...unique.values()].sort((a, b) => (a.kind + a.detail < b.kind + b.detail ? -1 : 1));

  const fatal = Application.fatalErrors[0];
  if (fatal) {
    result.status = 'fatal';
    result.reason = fatal.reason;
    result.detail = fatal.message + (error ? ` (then ${String(error)})` : '');
  } else if (error) {
    result.status = 'crash';
    result.reason = error instanceof Error ? error.name : 'Error';
    result.detail = error instanceof Error ? (error.stack ?? error.message).split('\n').slice(0, 5).join(' | ') : String(error);
  }
  return result;
}
