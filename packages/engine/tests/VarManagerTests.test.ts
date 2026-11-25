// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/VarManagerTests.cs
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ValkyrieDebug, VarManager, VarOperation, VarTests, VarTestsLogicalOperator } from '../src/index.ts';

/**
 * Creates a VarOperation with the specified parameters without using the string constructor
 * which would call ValkyrieDebug on invalid input
 */
function createVarOperation(varName: string, operation: string, value: string): VarOperation {
  const op = new VarOperation();
  op.var = varName;
  op.operation = operation;
  op.value = value;
  return op;
}

/**
 * Unit tests for VarManager class - Quest variable management functionality
 */
describe('VarManagerTests', () => {
  let varManager: VarManager;

  beforeEach(() => {
    // Disable ValkyrieDebug to prevent Unity logging during tests
    ValkyrieDebug.enabled = false;
    varManager = new VarManager();
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
  });

  // Constructor Tests

  it('Constructor_Default_CreatesEmptyVarsDictionary', () => {
    const vm = new VarManager();
    expect(vm.vars).not.toBeNullable();
    expect(vm.vars.size).toBe(0);
  });

  it('Constructor_WithDictionaryData_ParsesValuesCorrectly', () => {
    const data = new Map<string, string>([
      ['health', '100'],
      ['mana', '50.5'],
      ['strength', '25'],
    ]);
    const vm = new VarManager(data);
    expect(vm.vars.get('health')).toBe(100);
    expect(vm.vars.get('mana')).toBe(50.5);
    expect(vm.vars.get('strength')).toBe(25);
  });

  it('Constructor_WithDictionaryData_HandlesInvalidFloatValues', () => {
    const data = new Map<string, string>([
      ['valid', '100'],
      ['invalid', 'not_a_number'],
    ]);
    const vm = new VarManager(data);
    expect(vm.vars.get('valid')).toBe(100);
    expect(vm.vars.get('invalid')).toBe(0); // Should default to 0
  });

  it('Constructor_WithDictionaryData_StripsBackslashFromHashKeys', () => {
    // Keys starting with \ followed by # are stored without the \
    const data = new Map<string, string>([
      ['\\#specialVar', '42'],
    ]);
    const vm = new VarManager(data);
    expect(vm.vars.has('#specialVar')).toBe(true);
    expect(vm.vars.get('#specialVar')).toBe(42);
  });

  // GetValue Tests

  it('GetValue_ExistingVar_ReturnsValue', () => {
    varManager.vars.set('testVar', 42.5);
    const result = varManager.getValue('testVar');
    expect(result).toBe(42.5);
  });

  it('GetValue_NonExistingVar_ReturnsZero', () => {
    const result = varManager.getValue('nonExistent');
    expect(result).toBe(0);
  });

  it('GetValue_NegativeValue_ReturnsCorrectValue', () => {
    varManager.vars.set('negative', -15.75);
    const result = varManager.getValue('negative');
    expect(result).toBe(-15.75);
  });

  // GetPrefixVars Tests

  it('GetPrefixVars_MatchingPrefix_ReturnsFilteredDictionary', () => {
    varManager.vars.set('monster_health', 100);
    varManager.vars.set('monster_damage', 25);
    varManager.vars.set('player_health', 200);
    const result = varManager.getPrefixVars('monster_');
    expect(result.size).toBe(2);
    expect(result.has('monster_health')).toBe(true);
    expect(result.has('monster_damage')).toBe(true);
    expect(result.has('player_health')).toBe(false);
  });

  it('GetPrefixVars_NoMatchingPrefix_ReturnsEmptyDictionary', () => {
    varManager.vars.set('monster_health', 100);
    const result = varManager.getPrefixVars('player_');
    expect(result.size).toBe(0);
  });

  it('GetPrefixVars_EmptyVars_ReturnsEmptyDictionary', () => {
    const result = varManager.getPrefixVars('any_');
    expect(result.size).toBe(0);
  });

  it('GetPrefixVars_ExactMatchOnly_DoesNotReturnPartialMatch', () => {
    varManager.vars.set('monster', 1);
    varManager.vars.set('monster_health', 100);
    const result = varManager.getPrefixVars('monster_');
    expect(result.size).toBe(1);
    expect(result.has('monster_health')).toBe(true);
    expect(result.has('monster')).toBe(false);
  });

  // TrimQuest Tests

  it('TrimQuest_KeepsPercentVars_RemovesOthers', () => {
    varManager.vars.set('%persistent', 1);
    varManager.vars.set('questVar', 2);
    varManager.vars.set('anotherVar', 3);
    varManager.trimQuest();
    expect(varManager.vars.has('%persistent')).toBe(true);
    expect(varManager.vars.has('questVar')).toBe(false);
    expect(varManager.vars.has('anotherVar')).toBe(false);
  });

  it('TrimQuest_KeepsDollarPercentVars_RemovesOthers', () => {
    varManager.vars.set('$%special', 10);
    varManager.vars.set('$normalDollar', 20);
    varManager.vars.set('regular', 30);
    varManager.trimQuest();
    expect(varManager.vars.has('$%special')).toBe(true);
    expect(varManager.vars.has('$normalDollar')).toBe(false);
    expect(varManager.vars.has('regular')).toBe(false);
  });

  it('TrimQuest_EmptyVars_RemainsEmpty', () => {
    varManager.trimQuest();
    expect(varManager.vars.size).toBe(0);
  });

  it('TrimQuest_MixedVars_KeepsOnlyPersistentTypes', () => {
    varManager.vars.set('%save1', 1);
    varManager.vars.set('%save2', 2);
    varManager.vars.set('$%globalSave', 3);
    varManager.vars.set('temp1', 4);
    varManager.vars.set('$temp2', 5);
    varManager.trimQuest();
    expect(varManager.vars.size).toBe(3);
    expect(varManager.vars.has('%save1')).toBe(true);
    expect(varManager.vars.has('%save2')).toBe(true);
    expect(varManager.vars.has('$%globalSave')).toBe(true);
  });

  // Test(VarOperation) Comparison Tests

  it('Test_EqualOperator_ReturnsTrueWhenEqual', () => {
    varManager.vars.set('health', 100);
    const op = createVarOperation('health', '==', '100');
    const result = varManager.test(op);
    expect(result).toBe(true);
  });

  it('Test_EqualOperator_ReturnsFalseWhenNotEqual', () => {
    varManager.vars.set('health', 100);
    const op = createVarOperation('health', '==', '50');
    const result = varManager.test(op);
    expect(result).toBe(false);
  });

  it('Test_NotEqualOperator_ReturnsTrueWhenDifferent', () => {
    varManager.vars.set('health', 100);
    const op = createVarOperation('health', '!=', '50');
    const result = varManager.test(op);
    expect(result).toBe(true);
  });

  it('Test_NotEqualOperator_ReturnsFalseWhenEqual', () => {
    varManager.vars.set('health', 100);
    const op = createVarOperation('health', '!=', '100');
    const result = varManager.test(op);
    expect(result).toBe(false);
  });

  it('Test_GreaterThanOrEqualOperator_ReturnsTrueWhenGreater', () => {
    varManager.vars.set('health', 100);
    const op = createVarOperation('health', '>=', '50');
    const result = varManager.test(op);
    expect(result).toBe(true);
  });

  it('Test_GreaterThanOrEqualOperator_ReturnsTrueWhenEqual', () => {
    varManager.vars.set('health', 100);
    const op = createVarOperation('health', '>=', '100');
    const result = varManager.test(op);
    expect(result).toBe(true);
  });

  it('Test_GreaterThanOrEqualOperator_ReturnsFalseWhenLess', () => {
    varManager.vars.set('health', 50);
    const op = createVarOperation('health', '>=', '100');
    const result = varManager.test(op);
    expect(result).toBe(false);
  });

  it('Test_LessThanOrEqualOperator_ReturnsTrueWhenLess', () => {
    varManager.vars.set('health', 50);
    const op = createVarOperation('health', '<=', '100');
    const result = varManager.test(op);
    expect(result).toBe(true);
  });

  it('Test_LessThanOrEqualOperator_ReturnsTrueWhenEqual', () => {
    varManager.vars.set('health', 100);
    const op = createVarOperation('health', '<=', '100');
    const result = varManager.test(op);
    expect(result).toBe(true);
  });

  it('Test_LessThanOrEqualOperator_ReturnsFalseWhenGreater', () => {
    varManager.vars.set('health', 150);
    const op = createVarOperation('health', '<=', '100');
    const result = varManager.test(op);
    expect(result).toBe(false);
  });

  it('Test_GreaterThanOperator_ReturnsTrueWhenGreater', () => {
    varManager.vars.set('health', 100);
    const op = createVarOperation('health', '>', '50');
    const result = varManager.test(op);
    expect(result).toBe(true);
  });

  it('Test_GreaterThanOperator_ReturnsFalseWhenEqual', () => {
    varManager.vars.set('health', 100);
    const op = createVarOperation('health', '>', '100');
    const result = varManager.test(op);
    expect(result).toBe(false);
  });

  it('Test_LessThanOperator_ReturnsTrueWhenLess', () => {
    varManager.vars.set('health', 50);
    const op = createVarOperation('health', '<', '100');
    const result = varManager.test(op);
    expect(result).toBe(true);
  });

  it('Test_LessThanOperator_ReturnsFalseWhenEqual', () => {
    varManager.vars.set('health', 100);
    const op = createVarOperation('health', '<', '100');
    const result = varManager.test(op);
    expect(result).toBe(false);
  });

  it('Test_UnknownOperator_ReturnsFalse', () => {
    varManager.vars.set('health', 100);
    const op = createVarOperation('health', '??', '100');
    const result = varManager.test(op);
    expect(result).toBe(false);
  });

  it('Test_NegativeValues_ComparesCorrectly', () => {
    varManager.vars.set('temperature', -10);
    const op = createVarOperation('temperature', '<', '0');
    const result = varManager.test(op);
    expect(result).toBe(true);
  });

  it('Test_DecimalValues_ComparesCorrectly', () => {
    varManager.vars.set('progress', 0.75);
    const op = createVarOperation('progress', '>=', '0.5');
    const result = varManager.test(op);
    expect(result).toBe(true);
  });

  // Test(VarTests) Compound Tests

  it('Test_NullVarTests_ReturnsTrue', () => {
    const result = varManager.test(null);
    expect(result).toBe(true);
  });

  it('Test_EmptyVarTests_ReturnsTrue', () => {
    const tests = new VarTests();
    const result = varManager.test(tests);
    expect(result).toBe(true);
  });

  it('Test_SingleTrueCondition_ReturnsTrue', () => {
    varManager.vars.set('x', 10);
    const tests = new VarTests();
    tests.varTestsComponents.push(createVarOperation('x', '==', '10'));
    const result = varManager.test(tests);
    expect(result).toBe(true);
  });

  it('Test_SingleFalseCondition_ReturnsFalse', () => {
    varManager.vars.set('x', 10);
    const tests = new VarTests();
    tests.varTestsComponents.push(createVarOperation('x', '==', '20'));
    const result = varManager.test(tests);
    expect(result).toBe(false);
  });

  it('Test_TwoConditionsWithAnd_BothTrue_ReturnsTrue', () => {
    varManager.vars.set('x', 10);
    varManager.vars.set('y', 20);
    const tests = new VarTests();
    tests.varTestsComponents.push(createVarOperation('x', '==', '10'));
    tests.varTestsComponents.push(new VarTestsLogicalOperator('AND'));
    tests.varTestsComponents.push(createVarOperation('y', '==', '20'));
    const result = varManager.test(tests);
    expect(result).toBe(true);
  });

  it('Test_TwoConditionsWithAnd_OneFalse_ReturnsFalse', () => {
    varManager.vars.set('x', 10);
    varManager.vars.set('y', 20);
    const tests = new VarTests();
    tests.varTestsComponents.push(createVarOperation('x', '==', '10'));
    tests.varTestsComponents.push(new VarTestsLogicalOperator('AND'));
    tests.varTestsComponents.push(createVarOperation('y', '==', '30'));
    const result = varManager.test(tests);
    expect(result).toBe(false);
  });

  it('Test_TwoConditionsWithOr_OneFalse_ReturnsTrue', () => {
    varManager.vars.set('x', 10);
    varManager.vars.set('y', 20);
    const tests = new VarTests();
    tests.varTestsComponents.push(createVarOperation('x', '==', '999')); // false
    tests.varTestsComponents.push(new VarTestsLogicalOperator('OR'));
    tests.varTestsComponents.push(createVarOperation('y', '==', '20')); // true
    const result = varManager.test(tests);
    expect(result).toBe(true);
  });

  it('Test_TwoConditionsWithOr_BothFalse_ReturnsFalse', () => {
    varManager.vars.set('x', 10);
    varManager.vars.set('y', 20);
    const tests = new VarTests();
    tests.varTestsComponents.push(createVarOperation('x', '==', '999')); // false
    tests.varTestsComponents.push(new VarTestsLogicalOperator('OR'));
    tests.varTestsComponents.push(createVarOperation('y', '==', '999')); // false
    const result = varManager.test(tests);
    expect(result).toBe(false);
  });

  // ToString Tests

  it('ToString_EmptyVars_ReturnsHeaderOnly', () => {
    const result = varManager.toString();
    expect(result.includes('[Vars]')).toBe(true);
  });

  it('ToString_WithVars_ContainsKeyValuePairs', () => {
    varManager.vars.set('health', 100);
    const result = varManager.toString();
    expect(result.includes('[Vars]')).toBe(true);
    expect(result.includes('health=100')).toBe(true);
  });

  it('ToString_ZeroValueVars_AreNotIncluded', () => {
    varManager.vars.set('health', 100);
    varManager.vars.set('zero', 0);
    const result = varManager.toString();
    expect(result.includes('health=100')).toBe(true);
    expect(result.includes('zero=')).toBe(false);
  });

  it('ToString_HashVars_AreEscapedWithBackslash', () => {
    varManager.vars.set('#comment', 5);
    const result = varManager.toString();
    expect(result.includes('\\#comment=5')).toBe(true);
  });
});
