// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/VarManager.cs
// Variables are 32-bit floats in Valkyrie, so every stored value goes through Math.fround.
// The C# overloads Perform(op) and Perform(ops), Test(tests) and Test(op), are one method each.
import { Game } from '../Game.ts';
import { NewLine, boolToString, charAt, dictAdd, floatToString, floatTryParse, intTryParse, isNumber, substring } from '../platform/CSharp.ts';
import { Random } from '../platform/Random.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { LogEntry } from './LogEntry.ts';
import { VarOperation, VarTests, VarTestsLogicalOperator, VarTestsParenthesis } from './VarTests.ts';

// Valkyrie: VarManager.cs VarManager
export class VarManager {
  vars: Map<string, number>;

  /** VarManager() starts empty; VarManager(data) reads saved values. */
  // Valkyrie: VarManager.cs VarManager.VarManager
  constructor(data?: Map<string, string>) {
    this.vars = new Map();
    if (data === undefined) return;

    for (const [key, text] of data) {
      const value = floatTryParse(text).value;
      // There is a \ before var starting with #, so they don't get ignored.
      if (key.indexOf('\\') === 0) {
        dictAdd(this.vars, substring(key, 1, key.length - 1), value);
      } else {
        dictAdd(this.vars, key, value);
      }
    }
  }

  // Valkyrie: VarManager.cs VarManager.GetPrefixVars
  getPrefixVars(prefix: string): Map<string, number> {
    const dict = new Map<string, number>();
    for (const [key, value] of this.vars) {
      if (key.indexOf(prefix) === 0) {
        dictAdd(dict, key, value);
      }
    }
    return dict;
  }

  /** Keeps only the variables that survive a change of quest: % and $%. A name shorter than two characters throws, as in C#. */
  // Valkyrie: VarManager.cs VarManager.TrimQuest
  trimQuest(): void {
    const newVars = new Map<string, number>();
    for (const [key, value] of this.vars) {
      if (charAt(key, 0) === '%') dictAdd(newVars, key, value);
      if (substring(key, 0, 2) === '$%') dictAdd(newVars, key, value);
    }
    this.vars = newVars;
  }

  // Valkyrie: VarManager.cs VarManager.SetValue
  setValue(varName: string, value: number): void {
    if (!this.vars.has(varName)) {
      if (Game.get().currentQuest !== null && Game.get().currentQuest!.log !== null) {
        Game.get().currentQuest!.log.add(new LogEntry('Notice: Adding quest var: ' + varName, true));
      }
      this.vars.set(varName, 0);
    }
    this.vars.set(varName, Math.fround(value));
  }

  // Valkyrie: VarManager.cs VarManager.GetValue
  getValue(varName: string): number {
    return this.vars.get(varName) ?? 0;
  }

  // Valkyrie: VarManager.cs VarManager.GetOpValue
  getOpValue(op: VarOperation): number {
    if (!this.vars.has(op.var)) {
      Game.get().currentQuest!.log.add(new LogEntry('Notice: Adding quest var: ' + op.var, true));
      dictAdd(this.vars, op.var, 0);
    }
    let r = 0;
    if (op.value.length === 0) {
      return r;
    }
    if (isNumber(op.value[0]) || op.value[0] === '-' || op.value[0] === '.') {
      r = floatTryParse(op.value).value;
      return r;
    }
    if (op.value.indexOf('#rand') === 0) {
      const randLimit = intTryParse(op.value.substring(5)).value;
      r = Random.range(1, randLimit + 1);
      return r;
    }
    // value is var
    if (!this.vars.has(op.value)) {
      Game.get().currentQuest!.log.add(new LogEntry('Notice: Adding quest var: ' + op.value, true));
      dictAdd(this.vars, op.value, 0);
    }
    return this.vars.get(op.value)!;
  }

  // Valkyrie: VarManager.cs VarManager.Perform
  perform(op: VarOperation | readonly VarOperation[]): void {
    if (!(op instanceof VarOperation)) {
      for (const o of op) {
        this.perform(o);
      }
      return;
    }

    // Not in Valkyrie (16 October 2026): an operation missing its variable, operator or value threw; it is skipped
    if (op.var.length === 0 || op.operation.length === 0 || op.value.length === 0) {
      ValkyrieDebug.log('Warning: Invalid var operation skipped: ' + op.toString());
      Game.get().currentQuest!.log.add(new LogEntry('Warning: Invalid var operation skipped: ' + op.toString(), true));
      return;
    }

    const value = this.getOpValue(op);

    if (charAt(op.var, 0) === '#') {
      return;
    }

    const log = (text: string) => Game.get().currentQuest!.log.add(new LogEntry(text, true));
    const current = () => this.vars.get(op.var)!;

    if (op.operation === '+') {
      this.vars.set(op.var, Math.fround(current() + value));
      log('Notice: Adding: ' + floatToString(value) + ' to quest var: ' + op.var + ' result: ' + floatToString(current()));
    }

    if (op.operation === '-') {
      this.vars.set(op.var, Math.fround(current() - value));
      log('Notice: Subtracting: ' + floatToString(value) + ' from quest var: ' + op.var + ' result: ' + floatToString(current()));
    }

    if (op.operation === '*') {
      this.vars.set(op.var, Math.fround(current() * value));
      log('Notice: Multiplying: ' + floatToString(value) + ' with quest var: ' + op.var + ' result: ' + floatToString(current()));
    }

    if (op.operation === '/') {
      this.vars.set(op.var, Math.fround(current() / value));
      log('Notice: Dividing quest var: ' + op.var + ' by: ' + floatToString(value) + ' result: ' + floatToString(current()));
    }

    if (op.operation === '%') {
      this.vars.set(op.var, Math.fround(current() % value));
      log('Notice: Modulus quest var: ' + op.var + ' by: ' + floatToString(value) + ' result: ' + floatToString(current()));
    }

    if (op.operation === '=') {
      this.vars.set(op.var, value);
      log('Notice: Setting: ' + op.var + ' to: ' + floatToString(value));
    }
  }

  /** Test(VarTests): the whole condition, true when there is none; Test(VarOperation): one comparison. */
  // Valkyrie: VarManager.cs VarManager.Test
  test(tests: VarTests | VarOperation | null): boolean {
    if (tests instanceof VarOperation) {
      return this.testOperation(tests);
    }
    if (tests === null || tests.varTestsComponents === null || tests.varTestsComponents.length === 0) return true;

    let result = true;
    let current_operator = 'AND';
    let index = 0;
    let ignore_inside_parenthesis = 0;

    for (const tc of tests.varTestsComponents) {
      // ignore tests while we are running inside a parenthesis
      if (ignore_inside_parenthesis > 0) {
        if (tc instanceof VarTestsParenthesis) {
          if (tc.parenthesis === '(') ignore_inside_parenthesis++;
          else if (tc.parenthesis === ')') ignore_inside_parenthesis--;
        }

        index++;
        continue;
      }

      if (tc instanceof VarOperation) {
        if (current_operator === 'AND') result = result && this.testOperation(tc);
        else if (current_operator === 'OR') result = result || this.testOperation(tc);
      } else if (tc instanceof VarTestsLogicalOperator) {
        current_operator = tc.op;
      } else if (tc instanceof VarTestsParenthesis) {
        if (tc.parenthesis === '(') {
          const remaining_tests = tests.varTestsComponents.slice(index + 1);
          if (current_operator === 'AND') result = result && this.test(new VarTests(remaining_tests));
          else if (current_operator === 'OR') result = result || this.test(new VarTests(remaining_tests));

          ignore_inside_parenthesis = 1;
        } else if (tc.parenthesis === ')') {
          return result;
        }
      }

      index++;
    }

    if (ignore_inside_parenthesis > 0) {
      // we should not get here
      ValkyrieDebug.log('Invalid Test :' + tests.toString() + '\n returns ' + boolToString(result));
    }

    return result;
  }

  // Valkyrie: VarManager.cs VarManager.Test(VarOperation)
  private testOperation(op: VarOperation): boolean {
    const value = this.getOpValue(op);
    const current = this.vars.get(op.var)!;
    if (op.operation === '==') {
      return current === value;
    }

    if (op.operation === '!=') {
      return current !== value;
    }

    if (op.operation === '>=') {
      return current >= value;
    }

    if (op.operation === '<=') {
      return current <= value;
    }

    if (op.operation === '>') {
      return current > value;
    }

    if (op.operation === '<') {
      return current < value;
    }

    // unknown tests fail
    return false;
  }

  // Valkyrie: VarManager.cs VarManager.ToString
  toString(): string {
    const nl = NewLine;
    let r = '[Vars]' + nl;

    for (const [key, value] of this.vars) {
      if (value !== 0) {
        if (key.indexOf('#') === 0) {
          // # means comments in .ini
          r += '\\' + key + '=' + floatToString(value) + nl;
        } else {
          r += key + '=' + floatToString(value) + nl;
        }
      }
    }
    return r + nl;
  }
}
