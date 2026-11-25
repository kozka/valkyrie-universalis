// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/VarTests.cs
import { listGet, split } from '../platform/CSharp.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';

/** List.RemoveAt, which throws on a bad index. */
function removeAt<T>(list: T[], index: number): void {
  listGet(list, index);
  list.splice(index, 1);
}

/** List.Reverse(index, 2): swaps two neighbours. */
function reversePair<T>(list: T[], index: number): void {
  listGet(list, index + 1);
  const a = list[index]!;
  list[index] = list[index + 1]!;
  list[index + 1] = a;
}

// Valkyrie: VarTests.cs VarTestsComponent
export abstract class VarTestsComponent {
  abstract getClassVarTestsComponentType(): string;
}

// Valkyrie: VarTests.cs VarTestsLogicalOperator
export class VarTestsLogicalOperator extends VarTestsComponent {
  op: string;

  constructor(inOp = 'AND') {
    super();
    this.op = inOp;
  }

  override toString(): string {
    return this.op;
  }

  // Valkyrie: VarTests.cs VarTestsLogicalOperator.NextLogicalOperator
  nextLogicalOperator(): void {
    if (this.op === 'AND') this.op = 'OR';
    else this.op = 'AND';
  }

  static getVarTestsComponentType(): string {
    return 'VarTestsLogicalOperator';
  }

  getClassVarTestsComponentType(): string {
    return VarTestsLogicalOperator.getVarTestsComponentType();
  }
}

// Valkyrie: VarTests.cs VarTestsParenthesis
export class VarTestsParenthesis extends VarTestsComponent {
  // can be "(" or ")"
  parenthesis: string;

  constructor(inOp?: string) {
    super();
    this.parenthesis = inOp as string;
  }

  override toString(): string {
    return this.parenthesis;
  }

  static getVarTestsComponentType(): string {
    return 'VarTestsParenthesis';
  }

  getClassVarTestsComponentType(): string {
    return VarTestsParenthesis.getVarTestsComponentType();
  }
}

// Valkyrie: VarTests.cs VarOperation
export class VarOperation extends VarTestsComponent {
  var = '';
  operation = '';
  value = '';

  /** VarOperation() leaves the fields empty; VarOperation("var,op,value") parses them. */
  constructor(inOp?: string) {
    super();
    if (inOp === undefined) return;
    const splitted_string = split(inOp, [','], undefined, true);

    if (splitted_string.length !== 3) {
      ValkyrieDebug.log('Invalid var operation: ' + inOp);
    }

    // Not in Valkyrie (16 October 2026): missing parts threw while loading the scenario; they stay empty and Perform skips the operation
    this.var = splitted_string[0] ?? '';
    this.operation = splitted_string[1] ?? '';
    this.value = splitted_string[2] ?? '';

    // Support old internal var names (depreciated, format 3)
    this.var = VarOperation.updateVarName(this.var);
    this.value = VarOperation.updateVarName(this.value);
  }

  override toString(): string {
    return this.var + ',' + this.operation + ',' + this.value;
  }

  // Valkyrie: VarTests.cs VarOperation.UpdateVarName
  private static updateVarName(s: string): string {
    if (s === '#fire') return '$fire';
    return s;
  }

  static getVarTestsComponentType(): string {
    return 'VarOperation';
  }

  getClassVarTestsComponentType(): string {
    return VarOperation.getVarTestsComponentType();
  }
}

// Valkyrie: VarTests.cs VarTests
export class VarTests {
  varTestsComponents: VarTestsComponent[];

  constructor(inTC?: VarTestsComponent[]) {
    this.varTestsComponents = inTC ?? [];
  }

  toString(): string {
    let result = '';
    for (const v of this.varTestsComponents) {
      result += v.getClassVarTestsComponentType() + ':' + v.toString() + ' ';
    }
    return result;
  }

  /** Add("Type:data") parses a saved component; Add(component) inserts parentheses first, as Valkyrie does. */
  // Valkyrie: VarTests.cs VarTests.Add
  add(item: string | VarTestsComponent): void {
    if (typeof item === 'string') {
      const part = item.split(':');

      if (part[0] === VarTestsLogicalOperator.getVarTestsComponentType()) {
        this.varTestsComponents.push(new VarTestsLogicalOperator(listGet(part, 1)));
      }
      if (part[0] === VarTestsParenthesis.getVarTestsComponentType()) {
        this.varTestsComponents.push(new VarTestsParenthesis(listGet(part, 1)));
      }
      if (part[0] === VarOperation.getVarTestsComponentType()) {
        this.varTestsComponents.push(new VarOperation(listGet(part, 1)));
      }
      return;
    }
    if (item.getClassVarTestsComponentType() === 'VarTestsParenthesis') {
      this.varTestsComponents.unshift(item);
    } else {
      this.varTestsComponents.push(item);
    }
  }

  /** Index of the closing parenthesis for the opening one at index_open, or -1. */
  // Valkyrie: VarTests.cs VarTests.FindClosingParenthesis
  findClosingParenthesis(index_open: number): number {
    if (index_open < 0 || index_open >= this.varTestsComponents.length) return -1;
    let count = 0;

    for (let i = index_open; i < this.varTestsComponents.length; i++) {
      const component = this.varTestsComponents[i]!;
      if (component.getClassVarTestsComponentType() === VarTestsParenthesis.getVarTestsComponentType()) {
        const tmp = component as VarTestsParenthesis;

        if (tmp.parenthesis === '(') {
          count++;
        } else if (tmp.parenthesis === ')') {
          count--;
          if (count === 0) return i;
        }
      }
    }

    // not found
    return -1;
  }

  /** Index of the opening parenthesis for the closing one at index_close, or -1. */
  // Valkyrie: VarTests.cs VarTests.FindOpeningParenthesis
  findOpeningParenthesis(index_close: number): number {
    if (index_close < 0 || index_close >= this.varTestsComponents.length) return -1;
    let count = 0;

    for (let i = index_close; i >= 0; i--) {
      const component = this.varTestsComponents[i]!;
      if (component.getClassVarTestsComponentType() === VarTestsParenthesis.getVarTestsComponentType()) {
        const tmp = component as VarTestsParenthesis;

        if (tmp.parenthesis === ')') {
          count++;
        } else if (tmp.parenthesis === '(') {
          count--;
          if (count === 0) return i;
        }
      }
    }

    // not found
    return -1;
  }

  /** Next valid position for a parenthesis or VarOperation moved up or down (visually, in the editor). */
  // Valkyrie: VarTests.cs VarTests.FindNextValidPosition
  findNextValidPosition(index: number, up: boolean): number {
    const list = this.varTestsComponents;
    const typeAt = (i: number) => listGet(list, i).getClassVarTestsComponentType();
    if (
      typeAt(index) !== VarTestsParenthesis.getVarTestsComponentType() &&
      typeAt(index) !== VarOperation.getVarTestsComponentType()
    ) {
      return -1;
    }

    let i = index;

    if (up) i--;
    else i++;

    if (typeAt(index) === VarTestsParenthesis.getVarTestsComponentType()) {
      const tmp = list[index] as VarTestsParenthesis;
      while (i >= 0 && i <= list.length - 1) {
        if (
          // "(" should be before a varOperation or at the beginning a&(b  a&((b  (a&b
          (tmp.parenthesis === '(' && typeAt(i) === VarOperation.getVarTestsComponentType()) ||
          // ")" should be before a LogicalOperator or at the end  a)&b  a))&b  a&b)
          (tmp.parenthesis === ')' && typeAt(i) === VarTestsLogicalOperator.getVarTestsComponentType())
        ) {
          if (up) return i;
          // if going down, ignore first item found
          else if (i !== index + 1) return i - 1;
        }

        if (up) i--;
        else i++;
      }

      if (i >= list.length && tmp.parenthesis === ')') return list.length - 1;
      else if (i <= 0 && tmp.parenthesis === '(') return 0;
    } else if (typeAt(index) === VarOperation.getVarTestsComponentType()) {
      while (i >= 0 && i <= list.length - 1) {
        // varOperation should take the place of another varOperation
        if (typeAt(i) === VarOperation.getVarTestsComponentType()) {
          return i;
        }

        if (up) i--;
        else i++;
      }
    }

    if (i < 0 || i >= list.length) return -1;

    // this should not happen
    ValkyrieDebug.log('Invalid test position');

    return -1;
  }

  // Valkyrie: VarTests.cs VarTests.Remove
  remove(index: number): void {
    const list = this.varTestsComponents;
    const typeAt = (i: number) => listGet(list, i).getClassVarTestsComponentType();
    if (typeAt(index) === VarOperation.getVarTestsComponentType()) {
      if (index > 0 && typeAt(index - 1) === VarTestsLogicalOperator.getVarTestsComponentType()) {
        // remove TestOperator then VarOperation
        removeAt(list, index - 1);
        removeAt(list, index - 1);
      } else if (index < list.length - 1 && typeAt(index + 1) === VarTestsLogicalOperator.getVarTestsComponentType()) {
        // remove VarOperation then TestOperator
        removeAt(list, index);
        removeAt(list, index);
      } else if (list.length === 1) {
        removeAt(list, 0);
      } else {
        // no operator before and after: items must be between parenthesis, we delete and run again
        removeAt(list, index + 1);
        removeAt(list, index - 1);
        this.remove(index - 1);
      }
    } else if (typeAt(index) === VarTestsParenthesis.getVarTestsComponentType()) {
      const tmp = list[index] as VarTestsParenthesis;
      let other_parenthesis_index = -1;

      if (tmp.parenthesis === '(') {
        other_parenthesis_index = this.findClosingParenthesis(index);
        removeAt(list, other_parenthesis_index);
        removeAt(list, index);
      } else if (tmp.parenthesis === ')') {
        other_parenthesis_index = this.findOpeningParenthesis(index);
        removeAt(list, index);
        removeAt(list, other_parenthesis_index);
      }
    }
  }

  // Valkyrie: VarTests.cs VarTests.moveComponent
  moveComponent(index: number, up: boolean): void {
    const list = this.varTestsComponents;
    const next_position = this.findNextValidPosition(index, up);

    // up arrow means down in the list
    if (up) {
      for (let i = index; i > next_position; i--) {
        reversePair(list, i - 1);
      }

      if (listGet(list, next_position).getClassVarTestsComponentType() === VarOperation.getVarTestsComponentType()) {
        for (let i = next_position + 1; i < index; i++) {
          reversePair(list, i);
        }
      }
    } else {
      for (let i = index; i < next_position; i++) {
        reversePair(list, i);
      }

      if (listGet(list, next_position).getClassVarTestsComponentType() === VarOperation.getVarTestsComponentType()) {
        for (let i = next_position - 1; i > index; i--) {
          reversePair(list, i - 1);
        }
      }
    }
  }
}
