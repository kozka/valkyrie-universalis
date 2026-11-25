// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/EditorComponentVarTestsUtil.cs, with
// the assignments of EditorComponent.cs (AddAssignOp, SetAssignOpp, RemoveOp). Only what the panels do to a
// component's tests and operations, and the choices their selection windows offer; the panels are the app's.
import type { ITestable } from '../Content/ITestable.ts';
import { HeroData } from '../Content/ContentTypes.ts';
import { PerilData } from '../Content/PerilData.ts';
import { QuestData } from '../Content/QuestData.ts';
import { Game } from '../Game.ts';
import { floatToString, floatTryParse, intTryParse } from '../platform/CSharp.ts';
import { VarOperation, VarTestsLogicalOperator, VarTestsParenthesis, type VarTests } from '../Quest/VarTests.ts';

/** The comparisons a test can make (SetTestOpp) and the operations an assignment can make (SetAssignOpp). */
export const TEST_OPERATIONS = ['==', '!=', '>=', '<=', '>', '<'];
export const ASSIGN_OPERATIONS = ['=', '+', '-', '*', '/', '%'];

/** What starts a value that is not a variable: a number, or a # one. */
function notVariable(value: string): boolean {
  const first = value[0]!;
  return first === '#' || /[0-9]/.test(first) || first === '-' || first === '.';
}

export const EditorComponentVarTestsUtil = {
  /** The variables an event writes, tests or counts with, as the selection windows list them. */
  // Valkyrie: EditorComponentVarTestsUtil.cs EditorComponentVarTestsUtil.ExtractVarsFromEvent
  extractVarsFromEvent(e: QuestData.Event): Set<string> {
    const vars = new Set<string>();
    for (const op of e.operations ?? []) {
      vars.add(op.var);
      if (op.value.length > 0 && !notVariable(op.value)) vars.add(op.value);
    }
    if (e.tests === null) return vars;
    for (const tc of e.tests.varTestsComponents) {
      if (!(tc instanceof VarOperation)) continue;
      if (tc.var.length > 0 && tc.var[0] !== '#') vars.add(tc.var);
      if (tc.value.length > 0 && !notVariable(tc.value)) vars.add(tc.value);
    }
    if (e.quotaVar.length > 0 && e.quotaVar[0] !== '#') vars.add(e.quotaVar);
    return vars;
  },

  /** The scenario's variables (not the $ ones), then the $ ones of the content's perils. */
  // Valkyrie: EditorComponentVarTestsUtil.cs EditorComponentVarTestsUtil.AddQuestVars
  questVars(): string[] {
    const game = Game.get();
    const vars = new Set<string>();
    for (const c of game.currentQuest!.qd.components.values()) {
      if (c instanceof QuestData.Event) for (const v of EditorComponentVarTestsUtil.extractVarsFromEvent(c)) if (v[0] !== '$') vars.add(v);
    }
    const dollarVars = new Set<string>();
    for (const peril of game.cd.values(PerilData)) {
      for (const v of EditorComponentVarTestsUtil.extractVarsFromEvent(peril)) if (v[0] === '$') dollarVars.add(v);
    }
    return [...vars, ...dollarVars];
  },

  /** The # values a test or a value can read: monsters, heroes, round, eliminated, and every pack. */
  hashValues(): string[] {
    const ids = Game.get().cd.allPacks.filter((pack) => (pack.id ?? '').length > 0).map((pack) => '#' + pack.id);
    return ['#monsters', '#heroes', '#round', '#eliminated', ...ids];
  },

  /** What the window for a new test offers: a new variable ({NEW}), the scenario's, the # ones and every hero. */
  // Valkyrie: EditorComponentVarTestsUtil.cs EditorComponentVarTestsUtil.AddTestOp
  testVarChoices(): string[] {
    const heroes = Game.get()
      .cd.values(HeroData)
      .filter((hero) => hero.sectionName.length > 0)
      .map((hero) => '#' + hero.sectionName);
    return ['{NEW}', ...EditorComponentVarTestsUtil.questVars(), ...EditorComponentVarTestsUtil.hashValues(), ...heroes];
  },

  /** What the window for a new assignment offers: a new variable ({NEW}) and the scenario's. */
  // Valkyrie: EditorComponent.cs EditorComponent.AddAssignOp
  assignVarChoices(): string[] {
    return ['{NEW}', ...EditorComponentVarTestsUtil.questVars()];
  },

  /** What the value window offers: a number ({NUMBER}), the scenario's variables and the # values. */
  // Valkyrie: EditorComponentVarTestsUtil.cs EditorComponentVarTestsUtil.SetValue
  valueChoices(): string[] {
    return ['{NUMBER}', ...EditorComponentVarTestsUtil.questVars(), ...EditorComponentVarTestsUtil.hashValues()];
  },

  /** A test of a variable (greater than 0, joined to the others with AND) or an assignment (= 0) for it. */
  // Valkyrie: EditorComponentVarTestsUtil.cs EditorComponentVarTestsUtil.SelectAddOp
  selectAddOp(variable: string, testable: ITestable, test = true): void {
    const op = new VarOperation();
    op.var = variable;
    op.operation = test ? '>' : '=';
    op.value = '0';
    if (test) {
      const tests = testable.tests!;
      if (tests.varTestsComponents.length > 0) tests.add(new VarTestsLogicalOperator());
      tests.add(op);
    } else {
      testable.operations!.push(op);
    }
  },

  /** The same for a variable typed: letters, digits and _, its % or @ kept, var in front of a number; nothing when none is left. */
  // Valkyrie: EditorComponentVarTestsUtil.cs EditorComponentVarTestsUtil.NewVar
  newVar(value: string, testable: ITestable, test = true): void {
    let name = value.replace(/[^A-Za-z0-9_]/g, '');
    if (name.length === 0) return;
    if (value[0] === '%') name = '%' + name;
    if (value[0] === '@') name = '@' + name;
    if (/^[0-9]/.test(name) || name[0] === '-' || name[0] === '.') name = 'var' + name;
    EditorComponentVarTestsUtil.selectAddOp(name, testable, test);
  },

  /** A pair of parentheses, which the arrows then move into place. */
  // Valkyrie: EditorComponentVarTestsUtil.cs EditorComponentVarTestsUtil.SelectAddParenthesis
  selectAddParenthesis(testable: ITestable): void {
    testable.tests!.add(new VarTestsParenthesis(')'));
    testable.tests!.add(new VarTestsParenthesis('('));
  },

  // Valkyrie: EditorComponentVarTestsUtil.cs EditorComponentVarTestsUtil.SelectSetOp
  selectSetOp(op: VarOperation, operation: string): void {
    op.operation = operation;
  },

  // Valkyrie: EditorComponentVarTestsUtil.cs EditorComponentVarTestsUtil.SelectSetValue
  selectSetValue(op: VarOperation, value: string): void {
    op.value = value;
  },

  /** A number typed as a value: #rand and a whole number (at least 1), or a number as Valkyrie writes floats. */
  // Valkyrie: EditorComponentVarTestsUtil.cs EditorComponentVarTestsUtil.SetNumValue
  setNumValue(op: VarOperation, text: string): void {
    if (text.startsWith('#rand')) {
      let value = intTryParse(text.substring(5)).value;
      // The minimal random number is 1
      if (value === 0) value = 1;
      op.value = '#rand' + value;
    } else {
      op.value = floatToString(Math.fround(floatTryParse(text).value));
    }
  },

  /** A test, an AND or OR, or a parenthesis goes, as VarTests.Remove takes it with what it joined. */
  // Valkyrie: EditorComponentVarTestsUtil.cs EditorComponentVarTestsUtil.RemoveOp
  removeOp(tests: VarTests, index: number): void {
    if (index < tests.varTestsComponents.length) tests.remove(index);
  },

  /** An assignment goes. */
  // Valkyrie: EditorComponent.cs EditorComponent.RemoveOp
  removeAssignOp(testable: ITestable, op: VarOperation): void {
    const operations = testable.operations!;
    const at = operations.indexOf(op);
    if (at >= 0) operations.splice(at, 1);
  },

  /** Which arrows a part of the tests shows: whether it can go up or down (AddEventVarConditionComponents). */
  // Valkyrie: EditorComponentVarTestsUtil.cs EditorComponentVarTestsUtil.AddEventVarConditionComponents
  moves(tests: VarTests, index: number): { up: boolean; down: boolean } {
    const all = tests.varTestsComponents;
    const tc = all[index]!;
    const last = all.length - 1;
    const after = (type: string) => all.findIndex((x, i) => i > index && x.getClassVarTestsComponentType() === type) !== -1;
    const before = (type: string) => all.findLastIndex((x, i) => i < index && x.getClassVarTestsComponentType() === type) !== -1;
    if (tc instanceof VarOperation) {
      return {
        down: index !== last && all.length > 1 && after(VarTestsLogicalOperator.getVarTestsComponentType()),
        up: index !== 0 && before(VarTestsLogicalOperator.getVarTestsComponentType()),
      };
    }
    if (tc instanceof VarTestsParenthesis) {
      let down = false;
      let up = false;
      if (index !== last && after(VarOperation.getVarTestsComponentType())) {
        if (tc.parenthesis === '(') {
          const valid = tests.findNextValidPosition(index, false);
          down = valid !== -1 && tests.findClosingParenthesis(valid) !== -1;
        } else if (tc.parenthesis === ')') {
          down = true;
        }
      }
      if (index !== 0 && before(VarOperation.getVarTestsComponentType())) {
        if (tc.parenthesis === '(') {
          up = true;
        } else if (tc.parenthesis === ')') {
          const valid = tests.findNextValidPosition(index, true);
          up = valid !== -1 && tests.findOpeningParenthesis(valid) !== -1;
        }
      }
      return { up, down };
    }
    return { up: false, down: false };
  },
};
