// What leads to what in a quest, as Valkyrie plays it: the buttons of each event and the events they start, what an
// event adds to the board or takes away, the monsters a spawn places, a custom monster's activations, an item's
// inspect event, and the texts that show a component. The editor's checks and its tree of events read it. Not ported
// from Valkyrie; the references are the ones QuestComponent.ChangeReference keeps (QuestData.cs).
import { QuestData } from '../../Content/QuestData.ts';
import { VarOperation, type VarTests } from '../../Quest/VarTests.ts';

export type LinkKind =
  /** A button of an event starts one of these events (Event.buttons, eventN). */
  | 'button'
  /** An event places a component on the board, or gives an item (add=). */
  | 'add'
  /** An event takes a component away (remove=). */
  | 'remove'
  /** An event shows the heroes another event chose (hero=). */
  | 'hero'
  /** An event starts when a monster or a spawn is defeated (trigger=Defeated<name>, DefeatedUnique<name>). */
  | 'defeated'
  /** A spawn places a custom monster (monster=). */
  | 'monster'
  /** A spawn places its monsters on a place (placementN=). */
  | 'placement'
  /** A custom monster's activation: an [Activation…] or, alone, an event (activation=). */
  | 'activation'
  /** A custom monster's evade or horror event (evadeevent=, horrorevent=). */
  | 'evade'
  | 'horror'
  /** An item's inspect event (inspect=). */
  | 'inspect'
  /** An item given by name as another item component (itemname=). */
  | 'item'
  /** A button that changes quest: the event's name is the path of another quest.ini (StartQuestEvent). */
  | 'quest'
  /** A text that shows a component ({c:Name}) or one of its texts ({qst:Name.key}). */
  | 'text';

export interface Link {
  from: string;
  kind: LinkKind;
  to: string;
  /** The button, from 1, for a button link. */
  button?: number;
  /** Whether the component it names exists. */
  exists: boolean;
}

/** The links a game follows from a component to another it reaches. */
const FOLLOWED: ReadonlySet<LinkKind> = new Set(['button', 'add', 'monster', 'activation', 'evade', 'horror', 'inspect']);

/** An event that ends the game: an operation that sets $end to anything but 0 (Quest.GameOver checks $end). */
export function endsGame(component: QuestData.QuestComponent): boolean {
  return (component.operations ?? []).some((op) => op.var === '$end' && op.operation === '=' && op.value !== '0');
}

/** The variables a list of tests reads. */
function testedVariables(tests: VarTests | null): VarOperation[] {
  return (tests?.varTestsComponents ?? []).filter((c): c is VarOperation => c instanceof VarOperation);
}

export interface VariableUse {
  component: string;
  /** operations=, vartests=, a button's condition, quota=, or an operation's value. */
  how: 'operation' | 'test' | 'button' | 'quota' | 'value';
}

export class QuestGraph {
  readonly links: Link[] = [];
  readonly outgoing = new Map<string, Link[]>();
  readonly incoming = new Map<string, Link[]>();
  /** Where each variable is written (an operation) and read (a test, a condition, a quota, an operation's value). */
  readonly written = new Map<string, VariableUse[]>();
  readonly read = new Map<string, VariableUse[]>();
  /** The components whose texts show each variable's value ({var:name}, EventManager.OutputSymbolReplace). */
  readonly shown = new Map<string, Set<string>>();
  private readonly components: ReadonlyMap<string, QuestData.QuestComponent>;

  constructor(components: ReadonlyMap<string, QuestData.QuestComponent>, texts: ReadonlyMap<string, ReadonlyMap<string, string>> = new Map()) {
    this.components = components;
    for (const [name, c] of components) {
      this.variables(name, c);
      if (c instanceof QuestData.Event) {
        c.buttons.forEach((button, i) => {
          for (const to of button.eventNames) {
            if (to.endsWith('quest.ini')) this.link(name, 'quest', to, i + 1);
            else this.link(name, 'button', to, i + 1);
          }
        });
        for (const to of c.addComponents) this.link(name, 'add', to);
        for (const to of c.removeComponents) if (!to.startsWith('#')) this.link(name, 'remove', to);
        if (c.heroListName !== '') this.link(name, 'hero', c.heroListName);
        const defeated = /^Defeated(?:Unique)?(.+)$/.exec(c.trigger);
        if (defeated && components.has(defeated[1]!)) this.link(name, 'defeated', defeated[1]!);
      }
      if (c instanceof QuestData.Spawn) {
        for (const to of c.mTypes) if (!to.startsWith('Monster')) this.link(name, 'monster', to);
        for (const places of c.placement) for (const to of places) this.link(name, 'placement', to);
      }
      if (c instanceof QuestData.CustomMonster) {
        // RoundController (D2E) and RoundControllerMoM look an activation up as "Activation" + name; a lone event is
        // an event (MoM)
        for (const to of c.activations) this.link(name, 'activation', components.has('Activation' + to) ? 'Activation' + to : to);
        if (c.evadeEvent !== '') this.link(name, 'evade', c.evadeEvent);
        if (c.horrorEvent !== '') this.link(name, 'horror', c.horrorEvent);
      }
      if (c instanceof QuestData.QItem) {
        if (c.inspect !== '') this.link(name, 'inspect', c.inspect);
        for (const to of c.itemName) if (components.has(to)) this.link(name, 'item', to);
      }
    }
    for (const entries of texts.values()) {
      for (const [key, value] of entries) {
        const owner = key.substring(0, key.indexOf('.'));
        for (const m of value.matchAll(/\{c:(((?!\{).)*?)\}/g)) this.link(owner, 'text', m[1]!);
        for (const m of value.matchAll(/\{qst:([^.{}:]+)\./g)) if (components.has(m[1]!)) this.link(owner, 'text', m[1]!);
        for (const m of value.matchAll(/\{var:([^{}]+)\}/g)) {
          let owners = this.shown.get(m[1]!);
          if (owners === undefined) this.shown.set(m[1]!, (owners = new Set()));
          owners.add(owner);
        }
      }
    }
  }

  private link(from: string, kind: LinkKind, to: string, button?: number): void {
    const link: Link = { from, kind, to, exists: this.components.has(to) };
    if (button !== undefined) link.button = button;
    this.links.push(link);
    let out = this.outgoing.get(from);
    if (out === undefined) this.outgoing.set(from, (out = []));
    out.push(link);
    let into = this.incoming.get(to);
    if (into === undefined) this.incoming.set(to, (into = []));
    into.push(link);
  }

  private variables(name: string, c: QuestData.QuestComponent): void {
    const use = (map: Map<string, VariableUse[]>, variable: string, how: VariableUse['how']) => {
      if (variable === '') return;
      let list = map.get(variable);
      if (list === undefined) map.set(variable, (list = []));
      list.push({ component: name, how });
    };
    for (const op of c.operations ?? []) {
      use(this.written, op.var, 'operation');
      if (QuestGraph.isVariable(op.value)) use(this.read, op.value, 'value');
    }
    for (const op of testedVariables(c.tests)) {
      use(this.read, op.var, 'test');
      if (QuestGraph.isVariable(op.value)) use(this.read, op.value, 'value');
    }
    if (c instanceof QuestData.Event) {
      for (const button of c.buttons) {
        for (const op of testedVariables(button.condition)) {
          use(this.read, op.var, 'button');
          if (QuestGraph.isVariable(op.value)) use(this.read, op.value, 'value');
        }
      }
      // DialogWindow.onQuota: the selector starts at the variable's value, and what is chosen is stored in it
      if (c.quotaVar !== '') {
        use(this.read, c.quotaVar, 'quota');
        use(this.written, c.quotaVar, 'quota');
      }
    }
  }

  /** An operation's value that names a variable rather than a number (VarManager reads it as one). */
  static isVariable(value: string): boolean {
    return value !== '' && !/^-?[0-9.]/.test(value) && !value.startsWith('#rand');
  }

  /** The events of a trigger, in the order Valkyrie runs them: it queues them in the quest's order and runs the last first. */
  triggered(trigger: string): string[] {
    const names: string[] = [];
    for (const [name, c] of this.components) if (c instanceof QuestData.Event && c.trigger === trigger) names.push(name);
    return names.reverse();
  }

  /** Every trigger the quest's events wait for, in the quest's order. */
  triggers(): string[] {
    const found = new Set<string>();
    for (const c of this.components.values()) if (c instanceof QuestData.Event && c.trigger !== '') found.add(c.trigger);
    return [...found];
  }

  /**
   * The components a game can reach: the events a trigger starts and the items given at the start, then whatever
   * their buttons start, what they add, a spawn's custom monsters, a custom monster's activations and events, and an
   * item's inspect event.
   */
  reachable(): Set<string> {
    const reached = new Set<string>();
    const stack: string[] = [];
    for (const [name, c] of this.components) {
      if (c instanceof QuestData.Event && c.trigger !== '') stack.push(name);
      if (c instanceof QuestData.QItem && c.starting) stack.push(name);
    }
    while (stack.length > 0) {
      const name = stack.pop()!;
      if (reached.has(name) || !this.components.has(name)) continue;
      reached.add(name);
      for (const link of this.outgoing.get(name) ?? []) if (FOLLOWED.has(link.kind) && link.exists) stack.push(link.to);
    }
    return reached;
  }

  /**
   * Every component once, in the order the tree of events reads them opened all the way: the events of each trigger
   * (EventStart's first) and the items given at the start, each followed by what it leads to (next); then, apart,
   * what nothing reaches, in the quest's order but those that nothing leads to first, each followed by what it leads to.
   */
  readingOrder(): { reached: string[]; loose: string[] } {
    const seen = new Set<string>();
    // Iterative, as a long chain of events would overflow a recursive walk
    const walk = (starts: readonly string[], into: string[]) => {
      const stack = [...starts].reverse();
      while (stack.length > 0) {
        const name = stack.pop()!;
        if (seen.has(name) || !this.components.has(name)) continue;
        seen.add(name);
        into.push(name);
        stack.push(...this.next(name).reverse());
      }
    };
    const triggers = this.triggers().sort((a, b) => Number(b === 'EventStart') - Number(a === 'EventStart'));
    const starting = [...this.components].filter(([, c]) => c instanceof QuestData.QItem && c.starting).map(([name]) => name);
    const reached: string[] = [];
    walk([...triggers.flatMap((t) => this.triggered(t)), ...starting], reached);
    const rest = [...this.components.keys()].filter((name) => !seen.has(name));
    const led = (name: string) => (this.incoming.get(name) ?? []).some((l) => FOLLOWED.has(l.kind) && this.components.has(l.from));
    const loose: string[] = [];
    walk([...rest.filter((name) => !led(name)), ...rest], loose);
    return { reached, loose };
  }

  /**
   * What the tree of events opens under a component (EventTree.tsx), but for what it only shows: the events of its
   * buttons, what it adds, a spawn's custom monsters, a custom monster's activations and events, an item's inspect
   * event, and the events its defeat or a variable it sets starts.
   */
  next(name: string): string[] {
    const next = (this.outgoing.get(name) ?? []).filter((l) => FOLLOWED.has(l.kind) && l.exists).map((l) => l.to);
    for (const link of this.incoming.get(name) ?? []) if (link.kind === 'defeated') next.push(link.from);
    for (const op of this.components.get(name)?.operations ?? []) if (op.var.startsWith('@')) next.push(...this.triggered('Var' + op.var.substring(1)));
    return next;
  }

  /** The events that end the game. */
  endings(): string[] {
    return [...this.components].filter(([, c]) => endsGame(c)).map(([name]) => name);
  }

  /** Whether pressing on from this event can end the game, through the buttons of the events on the way. */
  leadsToEnd(name: string): boolean {
    const seen = new Set<string>();
    const stack = [name];
    while (stack.length > 0) {
      const next = stack.pop()!;
      if (seen.has(next)) continue;
      seen.add(next);
      const c = this.components.get(next);
      if (c === undefined) continue;
      if (endsGame(c)) return true;
      for (const link of this.outgoing.get(next) ?? []) if (link.kind === 'button' && link.exists) stack.push(link.to);
    }
    return false;
  }

  /** Groups of events whose buttons lead from one to another and back (Tarjan's strongly connected components). */
  loops(): string[][] {
    const index = new Map<string, number>();
    const low = new Map<string, number>();
    const onStack = new Set<string>();
    const stack: string[] = [];
    const found: string[][] = [];
    let counter = 0;
    const next = (name: string) => (this.outgoing.get(name) ?? []).filter((l) => l.kind === 'button' && l.exists).map((l) => l.to);
    for (const start of this.components.keys()) {
      if (index.has(start)) continue;
      // Iterative, as a long chain of events would overflow a recursive walk
      const work: { name: string; children: string[]; i: number }[] = [];
      const open = (name: string) => {
        index.set(name, counter);
        low.set(name, counter);
        counter++;
        stack.push(name);
        onStack.add(name);
        work.push({ name, children: next(name), i: 0 });
      };
      open(start);
      while (work.length > 0) {
        const top = work.at(-1)!;
        if (top.i < top.children.length) {
          const child = top.children[top.i++]!;
          if (!index.has(child)) open(child);
          else if (onStack.has(child)) low.set(top.name, Math.min(low.get(top.name)!, index.get(child)!));
          continue;
        }
        work.pop();
        const parent = work.at(-1);
        if (parent !== undefined) low.set(parent.name, Math.min(low.get(parent.name)!, low.get(top.name)!));
        if (low.get(top.name) === index.get(top.name)) {
          const group: string[] = [];
          let member: string;
          do {
            member = stack.pop()!;
            onStack.delete(member);
            group.push(member);
          } while (member !== top.name);
          if (group.length > 1 || next(top.name).includes(top.name)) found.push(group.reverse());
        }
      }
    }
    return found;
  }
}
