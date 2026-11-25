// Tests as a reader says them: «clues >= 2 AND #heroes > 1», with AND and OR in the editor's language, which Valkyrie
// evaluates from left to right. Not ported from Valkyrie, whose panel lists them one per line.
import { CommonStringKeys, VarOperation, VarTestsLogicalOperator, VarTestsParenthesis, type VarTests } from '@universalis/engine';

export function conditionText(tests: VarTests | null): string {
  if (tests === null) return '';
  const parts: string[] = [];
  for (const c of tests.varTestsComponents) {
    if (c instanceof VarOperation) parts.push(`${c.var} ${c.operation} ${c.value}`);
    else if (c instanceof VarTestsLogicalOperator) parts.push(c.op === 'AND' ? CommonStringKeys.AND.translate() : CommonStringKeys.OR.translate());
    else if (c instanceof VarTestsParenthesis) parts.push(c.parenthesis);
  }
  return parts.join(' ').replace(/\( /g, '(').replace(/ \)/g, ')');
}
