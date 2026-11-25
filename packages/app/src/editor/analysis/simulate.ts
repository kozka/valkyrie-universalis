// Not ported from Valkyrie (7 November 2026): one game of a Mansions scenario played by made-up investigators, for the
// editor's analysis (analyze.ts). It reads the quest as Valkyrie runs it (EventManager: tests, operations, add and
// remove, buttons and their conditions, the next events in order or at random, triggers) with its own variables, so it
// never touches the game being edited. What Valkyrie does not know, it guesses as a table plays: each investigator
// stands in a space and has 2 actions a round, a move being up to 2 spaces; an item and the flags set with it travel
// with whoever took it, so a door that wants the key needs that investigator there; a test's pass or fail by the dice;
// a puzzle by its size; the monsters by a rough fight. Times are a table's minutes. Pure: no DOM.
import { QuestButtonAction, QuestData, VarOperation, VarTests, VarTestsLogicalOperator, VarTestsParenthesis, type QuestButtonData } from '@universalis/engine';
import { distances, SPACE_UNITS, spaceAt, type MapModel } from './mapModel.ts';

export type Profile = 'curious' | 'normal' | 'direct';

export interface SimOptions {
  heroes: number;
  profile: Profile;
  random: () => number;
  /** Rounds after which a game is cut short. */
  maxRounds?: number;
  /** Lines saying what the table did, for whoever tunes the simulation. */
  trace?: string[];
}

/** What a table meets: a place (a tile), a token, an item, a monster, a puzzle, a text not read before, a choice of where a
 * story goes, and the scenario's own Mythos texts. */
export type Kind = 'place' | 'token' | 'item' | 'monster' | 'puzzle' | 'story' | 'decision' | 'mythos';
export const KINDS: Kind[] = ['place', 'token', 'item', 'story', 'decision', 'puzzle', 'monster', 'mythos'];

/** What a table's minutes go on. */
export type Spend = 'read' | 'roll' | 'spawn' | 'puzzle' | 'carry' | 'fight' | 'interact' | 'move' | 'talk' | 'mythos' | 'monsters';

export interface RoundStats {
  /** New things the table met this round (every kind but the Mythos texts, which come anyway). */
  novelties: number;
  kinds: Partial<Record<Kind, number>>;
  /** Investigators whose two actions gave them nothing this round. */
  idleHeroes: number;
  /** Monsters on the board at the round's end. */
  monsters: number;
  minutes: number;
}

export type Ending = 'end' | 'eliminated' | 'stuck' | 'rounds' | 'quest-change';

export interface RunResult {
  ending: Ending;
  /** The event whose operations ended the game, when one did. */
  endEvent: string | null;
  /** The event that led to it (a good ending's last text, a defeat's), when another did: one end event often closes both. */
  endVia: string | null;
  rounds: number;
  minutes: number;
  actions: { total: number; move: number; interact: number; wasted: number; idle: number; fight: number; carry: number };
  perRound: RoundStats[];
  /** Tokens pressed at least once. */
  pressed: Set<string>;
  /** Tokens that were on the board at some time. */
  shown: Set<string>;
  /** The round each event first ran. */
  firstRound: Map<string, number>;
  /** The tokens on the board when the game ended, with why the table left them (for a game that got stuck). */
  leftOnBoard: { name: string; why: 'tried' | 'carried' | 'unreachable' | 'look' }[];
  /** The variables when the game ended. */
  vars: Map<string, number>;
  /** The minutes, by what they went on. */
  spent: Record<Spend, number>;
  /** Each investigator's stretches of actions between two that gave them something (a find, a story, a fight). */
  gaps: number[];
}

/** A table's minutes (aloud, discussing). */
export const MINUTES = { move: 0.5, interact: 0.8, wordsPerMinute: 130, roll: 0.7, mythosBase: 2.5, monsterActivation: 1.2, roundTalk: 0.8, puzzle: { easy: 3, hard: 9, veryHard: 15 } };

/** Tests whose buttons read as a pass and a fail. */
const PASS_WORDS = ['pasa', 'éxito', 'exito', 'superad', 'consigu', 'logras', 'pass', 'success', 'succeed'];
const FAIL_WORDS = ['falla', 'fallo', 'fracas', 'fail', 'no lo', 'no consigu'];
/** Chance to pass a test of 1, 2, 3 or more successes with 3–4 dice and a clue or two (reglas-mom §6.5). */
const PASS_CHANCE = [0.6, 0.82, 0.48, 0.15, 0.05];

const SIGHT = /sight|look|vistazo/i;
/** A button that asks for a test of a skill ({will}, {strength}…): trying it is what a table does. */
const SKILL = /\{(will|strength|agility|observation|lore|influence|horror|success)\}/i;

function label(b: QuestButtonData): string {
  try {
    return b.label.translate();
  } catch {
    return '';
  }
}

interface Investigator {
  space: number | null;
  target: string | null;
  /** Moves left to reach a target the map does not join by its spaces (walked in a straight line). */
  across: number;
}

interface Monster {
  spawn: string;
  /** Its kind (MonsterCultist, a custom monster's name), as the spawn chose it. */
  type: string;
  health: number;
}

function words(text: string): number {
  const plain = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\\n/g, ' ');
  return plain.split(/\s+/).filter((w) => w.length > 1).length;
}

function translated(c: QuestData.QuestComponent, key: 'text' | 'uitext'): string {
  try {
    const k = key === 'text' ? (c as QuestData.Event).text : (c as QuestData.UI).uiText;
    const t = k.translate();
    return t.startsWith(c.sectionName) ? '' : t;
  } catch {
    return '';
  }
}

/** A token that does something when pressed: a marker (a wall, the investigators' start, darkness) is not pressed. */
export function interesting(t: QuestData.Token): boolean {
  return (
    translated(t, 'text').length > 0 ||
    t.buttons.some((b) => b.eventNames.length > 0 || b.operations.length > 0) ||
    t.addComponents.length > 0 ||
    t.removeComponents.length > 0 ||
    (t.operations ?? []).length > 0
  );
}

export function simulate(qd: QuestData, map: MapModel, options: SimOptions): RunResult {
  const { heroes, profile, random, trace } = options;
  const maxRounds = options.maxRounds ?? 40;
  const components = qd.components;
  const byTrigger = new Map<string, string[]>();
  for (const c of components.values()) {
    if (c instanceof QuestData.Event && c.trigger.length > 0) byTrigger.set(c.trigger, [...(byTrigger.get(c.trigger) ?? []), c.sectionName]);
  }

  const vars = new Map<string, number>([
    ['#heroes', heroes],
    ['#round', 1],
  ]);
  let varsVersion = 0;
  /** Flags set with an item, and who carries them. */
  const holders = new Map<string, number>();
  const onBoard = new Set<string>();
  const open = new Set<number>();
  const team: Investigator[] = Array.from({ length: heroes }, () => ({ space: null, target: null, across: 0 }));
  const monsters: Monster[] = [];
  const uiQueue: string[] = [];
  const readTexts = new Set<string>();
  /** Each token's last press: when, and whether it gave nothing new. */
  const tokenTried = new Map<string, { at: number; nothing: boolean; strikes: number; seen: number }>();
  /** Whether a table would go back to something it tried: not after it gave nothing, unless what it reads has changed since,
   * and not after twice in a row unless the game has moved on (something new met) since. */
  const worthAgain = (name: string): boolean => {
    const tried = tokenTried.get(name);
    if (tried === undefined || !tried.nothing) return true;
    if (tried.strikes >= 2 && newSoFar === tried.seen) return false;
    return [...readsOf(name)].some((v) => (changedAt.get(v) ?? 0) > tried.at);
  };
  /** When each variable last changed (varsVersion). */
  const changedAt = new Map<string, number>();
  /** The variables a token's way on reads, eight events deep, cached. */
  const reads = new Map<string, Set<string>>();
  const skipLook = new Map<string, boolean>();
  const quotaDone = new Map<string, number>();
  const decided = new Set<string>();
  const result: RunResult = {
    ending: 'rounds',
    endEvent: null,
    endVia: null,
    rounds: 0,
    minutes: 0,
    actions: { total: 0, move: 0, interact: 0, wasted: 0, idle: 0, fight: 0, carry: 0 },
    perRound: [],
    pressed: new Set(),
    shown: new Set(),
    firstRound: new Map(),
    leftOnBoard: [],
    vars: new Map(),
    gaps: [],
    spent: { read: 0, roll: 0, spawn: 0, puzzle: 0, carry: 0, fight: 0, interact: 0, move: 0, talk: 0, mythos: 0, monsters: 0 },
  };
  let round = 1;
  let novelties = 0;
  const spend = (kind: Spend, m: number): void => {
    minutes += m;
    result.spent[kind] += m;
  };
  let kinds: Partial<Record<Kind, number>> = {};
  /** Something new met: counted by kind for the round. */
  const novel = (kind: Kind): void => {
    kinds[kind] = (kinds[kind] ?? 0) + 1;
    newSoFar++;
    if (kind !== 'mythos') novelties++;
  };
  /** Whether the Mythos phase is running, when the scenario's own texts are its Mythos. */
  let inMythos = false;
  /** Everything new met so far, counted. */
  let newSoFar = 0;
  /** The items the table holds that can be looked at, with their inspect events. */
  const inventory = new Map<string, string>();
  /** Rounds in a row with nothing new and the table at a loss. */
  let quietRounds = 0;
  /** A token of the investigators' figures just put on the board. */
  let gather: string | null = null;
  let minutes = 0;
  let ended = false;
  /** Damage and horror each investigator has taken; the first to reach their health and sanity together is out. */
  const harm = team.map(() => 0);
  const pool = 12;
  /** The flags the event running sets (to 1 or more): when that same event gives an item, they go with whoever took it. */
  let flagsSet: string[] = [];
  let somethingNew = false;
  /** A press left a dialogue branch nobody has heard yet. */
  let skippedNew = false;
  /** The events running, the outermost first. */
  const chain: string[] = [];

  // Valkyrie: VarManager.GetOpValue, Perform and Test, with the investigator's view of the carried flags
  const value = (name: string, actor: number | null): number => {
    if (actor !== null && holders.has(name) && holders.get(name) !== actor) return 0;
    return vars.get(name) ?? 0;
  };
  const operand = (op: VarOperation, actor: number | null): number => {
    if (op.value.length === 0) return 0;
    const c = op.value[0]!;
    if ((c >= '0' && c <= '9') || c === '-' || c === '.') return Number.parseFloat(op.value) || 0;
    if (op.value.startsWith('#rand')) return 1 + Math.floor(random() * (Number.parseInt(op.value.substring(5), 10) || 1));
    return value(op.value, actor);
  };
  const testOne = (op: VarOperation, actor: number | null): boolean => {
    const a = value(op.var, actor);
    const b = operand(op, actor);
    switch (op.operation) {
      case '==':
        return a === b;
      case '!=':
        return a !== b;
      case '>=':
        return a >= b;
      case '<=':
        return a <= b;
      case '>':
        return a > b;
      case '<':
        return a < b;
      default:
        return false;
    }
  };
  const test = (tests: VarTests | null, actor: number | null): boolean => {
    if (tests === null || tests.varTestsComponents.length === 0) return true;
    let ok = true;
    let operator = 'AND';
    let skip = 0;
    const parts = tests.varTestsComponents;
    for (let i = 0; i < parts.length; i++) {
      const tc = parts[i]!;
      if (skip > 0) {
        if (tc instanceof VarTestsParenthesis) skip += tc.parenthesis === '(' ? 1 : -1;
        continue;
      }
      if (tc instanceof VarOperation) ok = operator === 'AND' ? ok && testOne(tc, actor) : ok || testOne(tc, actor);
      else if (tc instanceof VarTestsLogicalOperator) operator = tc.op;
      else if (tc instanceof VarTestsParenthesis) {
        if (tc.parenthesis === ')') return ok;
        const inner = test(new VarTests(parts.slice(i + 1)), actor);
        ok = operator === 'AND' ? ok && inner : ok || inner;
        skip = 1;
      }
    }
    return ok;
  };
  const perform = (ops: readonly VarOperation[] | null, actor: number | null): void => {
    for (const op of ops ?? []) {
      if (op.var.length === 0 || op.operation.length === 0 || op.value.length === 0 || op.var.startsWith('#')) continue;
      const v = operand(op, actor);
      const before = vars.get(op.var) ?? 0;
      let after = before;
      if (op.operation === '+') after = before + v;
      else if (op.operation === '-') after = before - v;
      else if (op.operation === '*') after = before * v;
      else if (op.operation === '/') after = v === 0 ? before : before / v;
      else if (op.operation === '%') after = v === 0 ? before : before % v;
      else if (op.operation === '=') after = v;
      vars.set(op.var, after);
      if (after !== before) {
        varsVersion++;
        changedAt.set(op.var, varsVersion);
        somethingNew = true;
      }
      if (op.operation === '=' && after !== 0) flagsSet.push(op.var);
      if (op.var === '$end' && after !== 0) ended = true;
    }
  };

  const tilesChanged = () => {
    open.clear();
    for (const name of onBoard) for (const id of map.byTile.get(name) ?? []) open.add(id);
  };

  const add = (name: string): void => {
    const c = components.get(name);
    if (c === undefined) return;
    if (c instanceof QuestData.QItem) {
      // An item that can be looked at (its inspect event, as InventoryWindowMoM opens it) is one more thing to try
      if (c.inspect.length > 0) inventory.set(name, c.inspect);
      novel('item');
      somethingNew = true;
      return;
    }
    if (onBoard.has(name)) return;
    onBoard.add(name);
    if (c instanceof QuestData.Tile) {
      novel('place');
      somethingNew = true;
      tilesChanged();
    } else if (c instanceof QuestData.Token) {
      // The investigators' figures put somewhere: the table moves there (a journey the story tells)
      if (c.tokenName === 'TokenInvestigators') gather = name;
      novel('token');
      somethingNew = true;
      result.shown.add(name);
    } else if (c instanceof QuestData.UI) {
      const text = translated(c, 'uitext');
      if (text.length > 0) spend('read', words(text) / MINUTES.wordsPerMinute);
      if (c.enableClick) uiQueue.push(name);
    }
  };

  const remove = (name: string): void => {
    const all = (test: (c: QuestData.QuestComponent | undefined) => boolean) => {
      for (const n of [...onBoard]) if (test(components.get(n))) onBoard.delete(n);
    };
    if (name === '#monsters') monsters.length = 0;
    else if (monsters.some((m) => m.spawn === name)) monsters.splice(0, monsters.length, ...monsters.filter((m) => m.spawn !== name));
    else if (name === '#boardcomponents') onBoard.clear();
    else if (name === '#uicomponents') all((c) => c instanceof QuestData.UI);
    else if (name === '#tokens') all((c) => c instanceof QuestData.Token);
    else if (name === '#tiles') all((c) => c instanceof QuestData.Tile);
    else if (name === '#doors') all((c) => c instanceof QuestData.Door);
    else onBoard.delete(name);
    inventory.delete(name);
    vars.set('#monsters', monsters.length);
    tilesChanged();
  };

  const puzzleMinutes = (p: QuestData.Puzzle): number => {
    const level = p.puzzleLevel;
    if (level <= 3) return MINUTES.puzzle.easy;
    if (level <= 5) return MINUTES.puzzle.hard;
    return MINUTES.puzzle.veryHard;
  };

  /** The button a table presses: a test by the dice; otherwise one that leads somewhere, more often than one that does not. */
  const choose = (event: QuestData.Event, buttons: QuestButtonData[], actor: number | null): QuestButtonData | null => {
    if (buttons.length === 0) return null;
    if (buttons.length === 2) {
      const labels = buttons.map((b) => label(b).toLowerCase());
      const pass = labels.findIndex((l) => PASS_WORDS.some((w) => l.includes(w)));
      const fail = labels.findIndex((l) => FAIL_WORDS.some((w) => l.includes(w)));
      if (pass >= 0 && fail >= 0 && pass !== fail) {
        const level = Number(/\((\d)\)/.exec(translated(event, 'text'))?.[1] ?? 1);
        spend('roll', MINUTES.roll);
        return buttons[random() < PASS_CHANCE[Math.min(level, 4)]! ? pass : fail]!;
      }
    }
    // A table goes where there is more to find: a dialogue's new branch before one already heard, trying something (a test,
    // taking a thing) before leaving it be, and closing the window last
    const promises = buttons.map((b) => {
      const seen = new Set<string>();
      return b.eventNames.reduce((sum, n) => sum + promise(n, actor, 0, seen), 0);
    });
    let weights: number[] = buttons.map((b, i) => (b.eventNames.length === 0 ? 0.5 : 1 + promises[i]!) * (SKILL.test(label(b)) ? 2 : 1));
    // Nor does it end the game of its own will (give up, leave the house) while it has anything else to do; an ending earned
    // on the way (a puzzle, a test) is an attempt, not giving up
    const final = buttons.map((b) => b.eventNames.some((n) => endsGame(n)) && !SKILL.test(label(b)) && !b.eventNames.some((n) => earned(n)));
    if (final.some((f) => f) && final.some((f) => !f) && team.some((_, who) => wanted(who).length > 0)) weights = weights.map((w, i) => (final[i] ? 0 : w));
    let pick = random() * weights.reduce((s, w) => s + w, 0);
    let chosen = buttons.length - 1;
    for (let i = 0; i < buttons.length; i++) {
      pick -= weights[i]!;
      if (pick <= 0) {
        chosen = i;
        break;
      }
    }
    // A branch left for later: the table comes back to hear it
    if (promises[chosen]! < 1 && promises.some((p, i) => p >= 1 && weights[i]! > 0)) skippedNew = true;
    // A choice of where the story goes, the first time it is offered
    if (buttons.filter((b) => b.eventNames.length > 0).length >= 2 && !decided.has(event.sectionName)) {
      decided.add(event.sectionName);
      novel('decision');
    }
    void actor;
    trace?.push(`    [${weights.join(' ')}] → ${chosen + 1}`);
    return buttons[chosen]!;
  };

  /** Whether an event leads to the end of the game whatever is chosen on the way, a few steps on: it or what it puts on the
   * board (a UI element to press) sets $end, or its buttons lead to one that does. */
  const endsCache = new Map<string, boolean>();
  const endsGame = (name: string, depth = 0): boolean => {
    const known = endsCache.get(name);
    if (known !== undefined) return known;
    const e = components.get(name);
    if (!(e instanceof QuestData.Event) || depth > 6) return false;
    endsCache.set(name, false);
    const sets = (x: QuestData.Event) => [...(x.operations ?? []), ...x.buttons.flatMap((b) => b.operations ?? [])].some((o) => o.var === '$end' && o.value !== '0');
    const added = e.addComponents.map((a) => components.get(a)).filter((a): a is QuestData.Event => a instanceof QuestData.Event);
    const ways = e.buttons.filter((b) => b.eventNames.length > 0);
    const found = sets(e) || added.some(sets) || (ways.length > 0 && ways.every((b) => b.eventNames.every((n) => endsGame(n, depth + 1))));
    endsCache.set(name, found);
    return found;
  };

  /** Whether the way from an event to the end asks for an effort first: a puzzle, a cumulative test, a skill's test. */
  const earned = (name: string, depth = 0, seen = new Set<string>()): boolean => {
    const e = components.get(name);
    if (!(e instanceof QuestData.Event) || depth > 6 || seen.has(name)) return false;
    seen.add(name);
    if (e instanceof QuestData.Puzzle || e.quota > 0 || e.buttons.some((b) => SKILL.test(label(b)))) return true;
    return e.buttons.some((b) => b.eventNames.some((n) => earned(n, depth + 1, seen)));
  };

  /** How much is still to find behind an event, a few steps on along what its buttons open now: events never run, and more
   * for an item, a tile, a token or a monster they bring. */
  const promise = (name: string, actor: number | null, depth: number, seen: Set<string>): number => {
    if (depth > 6 || seen.has(name)) return 0;
    seen.add(name);
    const e = components.get(name);
    if (!(e instanceof QuestData.Event) || !test(e.tests, actor)) return 0;
    let found = 0;
    if (!result.firstRound.has(name)) {
      // A text only tells; what changes the game (a variable, something put on the board) is what a table is after
      found += (e.operations ?? []).length > 0 || e.addComponents.length > 0 || e.removeComponents.length > 0 ? 1 : 0.25;
      for (const a of e.addComponents) {
        const c = components.get(a);
        if (c instanceof QuestData.QItem || ((c instanceof QuestData.Tile || c instanceof QuestData.Token) && !result.shown.has(a) && !onBoard.has(a))) found += 2;
      }
      if (e instanceof QuestData.Spawn) found += 1;
    }
    for (const b of e.buttons) {
      if (b.conditionFailedAction !== QuestButtonAction.NONE && !test(b.condition, actor)) continue;
      for (const n of b.eventNames) found += promise(n, actor, depth + 1, seen);
    }
    return Math.min(found, 30);
  };

  /** Valkyrie: EventManager.AddCustomTriggers: a variable named @x (or $@x) set above 0 goes back to 0 and starts Varx. */
  const customTriggers = (actor: number | null): void => {
    for (const [key, v] of [...vars]) {
      if (v <= 0) continue;
      const trigger = key.startsWith('@') ? 'Var' + key.substring(1) : key.startsWith('$@') ? 'Var$' + key.substring(2) : null;
      if (trigger === null) continue;
      vars.set(key, 0);
      for (const name of byTrigger.get(trigger) ?? []) run(name, actor, 1);
    }
  };

  /** Valkyrie: EventManager.QueueEvent of a list: the first whose tests pass, or one at random among them. */
  const queue = (names: string[], randomly: boolean, actor: number | null, depth: number): void => {
    const order = randomly ? [...names].sort(() => random() - 0.5) : names;
    for (const name of order) if (run(name, actor, depth + 1)) return;
  };

  /** Valkyrie: EventManager.TriggerEvent and the window it opens; false when its tests keep it from running. */
  const run = (name: string, actor: number | null, depth: number): boolean => {
    chain.push(name);
    try {
      return runEvent(name, actor, depth);
    } finally {
      chain.pop();
    }
  };
  const ending = (name: string): void => {
    result.endEvent ??= name;
    if (result.endVia === null && chain.length >= 2) result.endVia = chain.at(-2)!;
  };

  const runEvent = (name: string, actor: number | null, depth: number): boolean => {
    if (ended || depth > 200) return false;
    if (name.toLowerCase().endsWith('.ini')) {
      result.ending = 'quest-change';
      ended = true;
      return true;
    }
    const c = components.get(name);
    if (!(c instanceof QuestData.Event)) return false;
    if (!test(c.tests, actor)) return false;
    trace?.push(`${'  '.repeat(Math.min(depth, 12) + 1)}${name}`);
    if (!result.firstRound.has(name)) result.firstRound.set(name, round);
    if (c instanceof QuestData.Spawn) {
      const health = c.uniqueHealthBase + c.uniqueHealthHero * heroes;
      // Valkyrie: MonsterEvent.MonsterEventSelection picks one of the spawn's kinds
      const type = c.mTypes.length > 0 ? c.mTypes[Math.floor(random() * c.mTypes.length)]! : '';
      monsters.push({ spawn: name, type, health: health > 0 ? health : 4 + heroes });
      vars.set('#monsters', monsters.length);
      novel('monster');
      somethingNew = true;
      spend('spawn', 0.5);
    }
    if (c instanceof QuestData.Puzzle) {
      spend('puzzle', puzzleMinutes(c));
      novel('puzzle');
    }
    flagsSet = [];
    perform(c.operations, actor);
    if (ended) {
      ending(name);
      return true;
    }
    // An item given with a flag (a key and «hasKey»): the flag goes with whoever took the item
    if (actor !== null && c.addComponents.some((a) => components.get(a) instanceof QuestData.QItem)) for (const f of flagsSet) holders.set(f, actor);
    customTriggers(actor);
    for (const a of c.addComponents) add(a);
    for (const r of c.removeComponents) remove(r);
    if (gather !== null) {
      const there = tokenSpace(gather);
      if (there !== null)
        for (const inv of team) {
          inv.space = there;
          inv.across = 0;
        }
      gather = null;
    }
    if (c.display) {
      const text = translated(c, 'text');
      spend('read', words(text) / MINUTES.wordsPerMinute);
      if (!readTexts.has(name) && words(text) >= 15) {
        readTexts.add(name);
        novel(inMythos && actor === null ? 'mythos' : 'story');
        somethingNew = true;
      }
    }
    const shown = c.buttons.filter((b) => b.conditionFailedAction === QuestButtonAction.NONE || test(b.condition, actor));
    let button: QuestButtonData | null;
    if (c.quota > 0 && c.buttons.length >= 2) {
      // A cumulative test (DialogWindow.CreateQuotaWindow): the successes of each try add up until they reach the quota
      let successes = quotaDone.get(name) ?? 0;
      for (let die = 0; die < 4; die++) if (random() < 0.375) successes++;
      quotaDone.set(name, successes);
      spend('roll', MINUTES.roll);
      button = successes >= c.quota ? c.buttons[0]! : c.buttons[1]!;
      // Not there yet: the table keeps trying
      if (successes < c.quota) skippedNew = true;
    } else button = c.display ? choose(c, shown, actor) : (shown[0] ?? null);
    if (button !== null) {
      perform(button.operations, actor);
      if (ended) {
        ending(name);
        return true;
      }
      if (button.eventNames.length > 0) queue(button.eventNames, c.randomEvents, actor, depth);
    }
    return true;
  };

  const trigger = (kind: string, actor: number | null = null): void => {
    for (const name of byTrigger.get(kind) ?? []) {
      if (ended) return;
      run(name, actor, 0);
    }
  };

  /** The scenario's own clickable UI elements are pressed in turn, the topmost first, as a table reads a story. */
  const readUI = (): void => {
    for (let guard = 0; guard < 100 && uiQueue.length > 0 && !ended; guard++) {
      const name = uiQueue.pop()!;
      if (!onBoard.has(name)) continue;
      const ui = components.get(name) as QuestData.UI;
      if (ui.buttons.every((b) => b.eventNames.length === 0) && ui.operations.length === 0) continue;
      run(name, null, 0);
    }
  };

  /** Which flags a token's way on asks for (its tests, its buttons' conditions and their first events'). */
  const needs = (token: QuestData.Event): Set<string> => {
    const out = new Set<string>();
    const scan = (tests: VarTests | null) => {
      for (const tc of tests?.varTestsComponents ?? []) if (tc instanceof VarOperation && holders.has(tc.var)) out.add(tc.var);
    };
    scan(token.tests);
    for (const b of token.buttons) {
      scan(b.condition);
      for (const n of b.eventNames) {
        const e = components.get(n);
        if (e instanceof QuestData.Event) scan(e.tests);
      }
    }
    return out;
  };

  const tokenSpace = (name: string): number | null => {
    const c = components.get(name);
    if (!(c instanceof QuestData.Token)) return null;
    return spaceAt(map, [c.location.x, c.location.y], open);
  };

  const readsOf = (name: string): Set<string> => {
    let found = reads.get(name);
    if (found !== undefined) return found;
    found = new Set<string>();
    const scan = (tests: VarTests | null) => {
      for (const tc of tests?.varTestsComponents ?? []) {
        if (!(tc instanceof VarOperation)) continue;
        found!.add(tc.var);
        if (!/^[-.\d#]/.test(tc.value)) found!.add(tc.value);
      }
    };
    const walked = new Set<string>();
    const walk = (n: string, depth: number) => {
      const e = components.get(n);
      if (!(e instanceof QuestData.Event) || depth > 8 || walked.has(n)) return;
      walked.add(n);
      scan(e.tests);
      for (const b of e.buttons) {
        scan(b.condition);
        for (const next of b.eventNames) walk(next, depth + 1);
      }
    };
    walk(name, 0);
    reads.set(name, found);
    return found;
  };

  /** What an investigator would go for: tokens on the board not tried since the variables last changed. */
  const wanted = (who: number): { name: string; space: number }[] => {
    const out: { name: string; space: number }[] = [];
    const looks: { name: string; space: number }[] = [];
    for (const name of onBoard) {
      const c = components.get(name);
      if (!(c instanceof QuestData.Token) || !c.enableClick || !interesting(c)) continue;
      // A table remembers what gave nothing: it goes back only when something it depends on has changed since
      if (!worthAgain(name)) continue;
      if (SIGHT.test(c.tokenName) && !skipLook.has(name)) skipLook.set(name, random() < (profile === 'curious' ? 0 : profile === 'normal' ? 0.1 : 0.3));
      const need = needs(c);
      // What it asks for is carried: by this investigator, or by others who bring it over (press counts the trip)
      if (need.size > 0 && ![...need].some((v) => holders.get(v) === who)) continue;
      const space = tokenSpace(name);
      if (space === null) continue;
      // A look the table passed by is taken only when there is nothing else left to do
      if (skipLook.get(name) === true) looks.push({ name, space });
      else out.push({ name, space });
    }
    // The items in hand: looked at where the investigator stands
    const here = team[who]!.space;
    if (here !== null)
      for (const inspect of inventory.values()) {
        if (!worthAgain(inspect)) continue;
        out.push({ name: inspect, space: here });
      }
    return out.length > 0 ? out : looks;
  };

  const press = (who: number, name: string): boolean => {
    // Whoever else carries something it asks for brings it over: a move and a trade each
    const token = components.get(name);
    const givers = new Set<number>();
    if (token instanceof QuestData.Token) {
      for (const v of needs(token)) {
        const holder = holders.get(v);
        if (holder !== undefined && holder !== who) {
          givers.add(holder);
          holders.set(v, who);
        }
      }
    }
    result.actions.carry += givers.size * 2;
    spend('carry', givers.size * (MINUTES.move + MINUTES.interact));
    const before = varsVersion;
    somethingNew = false;
    skippedNew = false;
    result.pressed.add(name);
    trace?.push(`R${round} ${who} ${name}`);
    const ran = run(name, who, 0);
    readUI();
    const nothing = !ran || (!somethingNew && before === varsVersion && !skippedNew);
    const strikes = nothing ? (tokenTried.get(name)?.strikes ?? 0) + 1 : 0;
    tokenTried.set(name, { at: varsVersion, nothing, strikes, seen: newSoFar });
    if (nothing) result.actions.wasted++;
    return !nothing;
  };

  // The start: EventStart, and the story told with UI elements
  trigger('EventStart');
  readUI();
  const startTile = [...onBoard].find((n) => components.get(n) instanceof QuestData.Tile);
  const start = startTile !== undefined ? (map.byTile.get(startTile)?.[0] ?? null) : null;
  for (const inv of team) inv.space = start;

  const sinceBeat = team.map(() => 0);
  let busy = team.map(() => false);
  while (!ended && round <= maxRounds) {
    novelties = 0;
    kinds = {};
    busy = team.map(() => false);
    const roundStart = minutes;
    const actionsBefore = result.actions.wasted + result.actions.idle;
    // Investigators' phase: 2 actions each
    for (let who = 0; who < heroes && !ended; who++) {
      const inv = team[who]!;
      for (let action = 0; action < 2 && !ended; action++) {
        let gave = false;
        try {
          result.actions.total++;
          if (inv.space === null || !open.has(inv.space)) inv.space = open.size > 0 ? [...open][0]! : null;
          // A monster near takes an action to fight it
          if (monsters.length > 0 && who < monsters.length) {
            const m = monsters[who]!;
            m.health -= 1.5 + random();
            result.actions.fight++;
            trace?.push(`R${round} ${who} fight${inv.target ? ' ' + inv.target : ''}`);
            gave = true;
            spend('fight', MINUTES.roll);
            if (m.health <= 0) {
              monsters.splice(who, 1);
              vars.set('#monsters', monsters.length);
              // Valkyrie: MonsterDialogMoM.Defeated, by the monster's kind and then by its spawn
              trigger('Defeated' + m.type, who);
              trigger('Defeated' + m.spawn, who);
              readUI();
            }
            continue;
          }
          if (inv.space === null) {
            result.actions.idle++;
            trace?.push(`R${round} ${who} idle${inv.target ? ' ' + inv.target : ''}`);
            continue;
          }
          const steps = distances(map, inv.space, open);
          // Spaces the map does not join (a tile it does not know, or one not quite touching): a straight line, as a table walks
          const here = map.spaces[inv.space]!.centre;
          const away = (space: number): number => {
            const known = steps.get(space);
            if (known !== undefined) return known;
            const there = map.spaces[space]!.centre;
            return Math.ceil(Math.hypot(there[0] - here[0], there[1] - here[1]) / SPACE_UNITS) + 1;
          };
          // Nearest first; what only this investigator can open (it carries what it asks for) and what nobody has tried, sooner
          const score = (t: { name: string; space: number }) => away(t.space) - (needs(components.get(t.name) as QuestData.Event).size > 0 ? 3 : 0) - (result.pressed.has(t.name) ? 0 : 1);
          const targets = wanted(who).sort((a, b) => score(a) - score(b) || random() - 0.5);
          const others = new Set(team.filter((_, i) => i !== who).map((i) => i.target));
          const target = targets.find((t) => !others.has(t.name)) ?? targets[0];
          if (target === undefined) {
            result.actions.idle++;
            trace?.push(`R${round} ${who} idle${inv.target ? ' ' + inv.target : ''}`);
            inv.target = null;
            continue;
          }
          if (inv.target !== target.name) inv.across = 0;
          inv.target = target.name;
          if (target.space === inv.space) {
            result.actions.interact++;
            spend('interact', MINUTES.interact);
            gave = press(who, target.name);
            if (needs(components.get(target.name) as QuestData.Event).size > 0) result.actions.carry++;
          } else if (!steps.has(target.space)) {
            // Across what the map does not join: 2 spaces a move, in a straight line
            result.actions.move++;
            trace?.push(`R${round} ${who} across${inv.target ? ' ' + inv.target : ''}`);
            spend('move', MINUTES.move);
            if (inv.across === 0) inv.across = Math.max(1, Math.ceil(away(target.space) / 2));
            inv.across--;
            if (inv.across === 0) inv.space = target.space;
          } else {
            // Up to 2 spaces towards it
            result.actions.move++;
            trace?.push(`R${round} ${who} move${inv.target ? ' ' + inv.target : ''}`);
            spend('move', MINUTES.move);
            const back = distances(map, target.space, open);
            let at = inv.space;
            for (let s = 0; s < 2; s++) {
              const next = map.near[at]!.filter((n) => open.has(n) && back.has(n)).sort((a, b) => back.get(a)! - back.get(b)!)[0];
              if (next === undefined || back.get(next)! >= back.get(at)!) break;
              at = next;
            }
            inv.space = at;
          }
        } finally {
          // A beat: the action gave this investigator something; the stretch before it is a gap
          if (gave) {
            result.gaps.push(sinceBeat[who]!);
            sinceBeat[who] = 0;
            busy[who] = true;
          } else sinceBeat[who]!++;
        }
      }
    }
    spend('talk', MINUTES.roundTalk * heroes);
    if (ended) break;
    // Mythos phase: the scenario's own Mythos events, the monsters' attacks and the harm of the official Mythos
    spend('mythos', MINUTES.mythosBase);
    spend('monsters', monsters.length * MINUTES.monsterActivation);
    // Valkyrie: RoundControllerMoM.EndInvestigatorTurn and then the round's end
    inMythos = true;
    trigger('BeforeMonsterActivation');
    trigger('Mythos');
    trigger('EndInvestigatorTurn');
    inMythos = false;
    readUI();
    // Each monster attacks someone, who often comes off lightly (the official Mythos and the scenario's own clock are its own
    // events, which already run)
    for (let m = 0; m < monsters.length; m++) harm[Math.floor(random() * heroes)]! += random() * 2.4;
    if (harm.some((h) => h >= pool) && !ended) {
      trigger('Eliminated');
      result.ending = 'eliminated';
      ended = true;
    }
    trigger('EndRound');
    trigger('EndRound' + round);
    round++;
    vars.set('#round', round);
    trigger('StartRound');
    readUI();
    result.perRound.push({ novelties, kinds, idleHeroes: busy.filter((b) => !b).length, monsters: monsters.length, minutes: minutes - roundStart });
    const idleNow = result.actions.wasted + result.actions.idle - actionsBefore;
    quietRounds = novelties === 0 && idleNow >= heroes * 2 ? quietRounds + 1 : 0;
    if (quietRounds >= 6 && !ended) {
      result.ending = 'stuck';
      break;
    }
  }
  if (ended && result.ending === 'rounds') result.ending = 'end';
  for (const name of onBoard) {
    const c = components.get(name);
    if (!(c instanceof QuestData.Token) || !c.enableClick || !interesting(c)) continue;
    const why = skipLook.get(name) === true ? 'look' : [...needs(c)].length > 0 ? 'carried' : tokenSpace(name) === null ? 'unreachable' : 'tried';
    result.leftOnBoard.push({ name, why });
  }
  // The stretches still open when the game ended count too
  for (const g of sinceBeat) if (g > 0) result.gaps.push(g);
  result.rounds = Math.min(round, maxRounds);
  result.minutes = minutes;
  result.vars = vars;
  return result;
}
