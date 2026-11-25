// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/VarTestsTests.cs
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  ValkyrieDebug,
  VarOperation,
  VarTests,
  VarTestsComponent,
  VarTestsLogicalOperator,
  VarTestsParenthesis,
} from '../src/index.ts';

/**
 * Unit tests for VarTests, VarTestsLogicalOperator, VarTestsParenthesis, and VarOperation classes.
 * Tests cover parsing, parenthesis matching, movement operations, and component management.
 */
describe('VarTestsTests', () => {
  beforeEach(() => {
    // Disable ValkyrieDebug to prevent Unity logging during tests
    ValkyrieDebug.enabled = false;
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
  });

  // VarTests Constructor Tests

  it('Constructor_Default_CreatesEmptyComponentsList', () => {
    const varTests = new VarTests();
    expect(varTests.varTestsComponents).not.toBeNullable();
    expect(varTests.varTestsComponents.length).toBe(0);
  });

  it('Constructor_WithList_AssignsComponentsList', () => {
    const components: VarTestsComponent[] = [new VarOperation('x,==,5')];
    const varTests = new VarTests(components);
    expect(varTests.varTestsComponents).toBe(components);
    expect(varTests.varTestsComponents.length).toBe(1);
  });

  // VarTests.Add Tests

  it('Add_StringWithVarOperation_ParsesAndAddsComponent', () => {
    const varTests = new VarTests();
    varTests.add('VarOperation:x,==,5');
    expect(varTests.varTestsComponents.length).toBe(1);
    expect(varTests.varTestsComponents[0].getClassVarTestsComponentType()).toBe('VarOperation');
  });

  it('Add_StringWithLogicalOperator_ParsesAndAddsComponent', () => {
    const varTests = new VarTests();
    varTests.add('VarTestsLogicalOperator:AND');
    expect(varTests.varTestsComponents.length).toBe(1);
    expect(varTests.varTestsComponents[0].getClassVarTestsComponentType()).toBe('VarTestsLogicalOperator');
  });

  it('Add_StringWithParenthesis_ParsesAndAddsComponent', () => {
    const varTests = new VarTests();
    varTests.add('VarTestsParenthesis:(');
    expect(varTests.varTestsComponents.length).toBe(1);
    expect(varTests.varTestsComponents[0].getClassVarTestsComponentType()).toBe('VarTestsParenthesis');
  });

  it('Add_ParenthesisComponent_InsertsAtBeginning', () => {
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarOperation('x,==,5'));
    const parenthesis = new VarTestsParenthesis('(');
    varTests.add(parenthesis);
    expect(varTests.varTestsComponents.length).toBe(2);
    expect(varTests.varTestsComponents[0].getClassVarTestsComponentType()).toBe('VarTestsParenthesis');
  });

  it('Add_NonParenthesisComponent_AppendsToEnd', () => {
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarTestsParenthesis('('));
    const operation = new VarOperation('x,==,5');
    varTests.add(operation);
    expect(varTests.varTestsComponents.length).toBe(2);
    expect(varTests.varTestsComponents[1].getClassVarTestsComponentType()).toBe('VarOperation');
  });

  // VarTests.FindClosingParenthesis Tests

  it('FindClosingParenthesis_SimpleCase_ReturnsCorrectIndex', () => {
    // ( x==5 )
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarTestsParenthesis('('));
    varTests.varTestsComponents.push(new VarOperation('x,==,5'));
    varTests.varTestsComponents.push(new VarTestsParenthesis(')'));
    const result = varTests.findClosingParenthesis(0);
    expect(result).toBe(2);
  });

  it('FindClosingParenthesis_NestedParentheses_ReturnsOuterClosing', () => {
    // ( ( x==5 ) )
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarTestsParenthesis('('));
    varTests.varTestsComponents.push(new VarTestsParenthesis('('));
    varTests.varTestsComponents.push(new VarOperation('x,==,5'));
    varTests.varTestsComponents.push(new VarTestsParenthesis(')'));
    varTests.varTestsComponents.push(new VarTestsParenthesis(')'));
    const result = varTests.findClosingParenthesis(0);
    expect(result).toBe(4);
  });

  it('FindClosingParenthesis_InnerParentheses_ReturnsInnerClosing', () => {
    // ( ( x==5 ) )
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarTestsParenthesis('('));
    varTests.varTestsComponents.push(new VarTestsParenthesis('('));
    varTests.varTestsComponents.push(new VarOperation('x,==,5'));
    varTests.varTestsComponents.push(new VarTestsParenthesis(')'));
    varTests.varTestsComponents.push(new VarTestsParenthesis(')'));
    const result = varTests.findClosingParenthesis(1);
    expect(result).toBe(3);
  });

  it('FindClosingParenthesis_NoMatchingParenthesis_ReturnsMinusOne', () => {
    // ( x==5 - missing closing
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarTestsParenthesis('('));
    varTests.varTestsComponents.push(new VarOperation('x,==,5'));
    const result = varTests.findClosingParenthesis(0);
    expect(result).toBe(-1);
  });

  // VarTests.FindOpeningParenthesis Tests

  it('FindOpeningParenthesis_SimpleCase_ReturnsCorrectIndex', () => {
    // ( x==5 )
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarTestsParenthesis('('));
    varTests.varTestsComponents.push(new VarOperation('x,==,5'));
    varTests.varTestsComponents.push(new VarTestsParenthesis(')'));
    const result = varTests.findOpeningParenthesis(2);
    expect(result).toBe(0);
  });

  it('FindOpeningParenthesis_NestedParentheses_ReturnsOuterOpening', () => {
    // ( ( x==5 ) )
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarTestsParenthesis('('));
    varTests.varTestsComponents.push(new VarTestsParenthesis('('));
    varTests.varTestsComponents.push(new VarOperation('x,==,5'));
    varTests.varTestsComponents.push(new VarTestsParenthesis(')'));
    varTests.varTestsComponents.push(new VarTestsParenthesis(')'));
    const result = varTests.findOpeningParenthesis(4);
    expect(result).toBe(0);
  });

  it('FindOpeningParenthesis_InnerParentheses_ReturnsInnerOpening', () => {
    // ( ( x==5 ) )
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarTestsParenthesis('('));
    varTests.varTestsComponents.push(new VarTestsParenthesis('('));
    varTests.varTestsComponents.push(new VarOperation('x,==,5'));
    varTests.varTestsComponents.push(new VarTestsParenthesis(')'));
    varTests.varTestsComponents.push(new VarTestsParenthesis(')'));
    const result = varTests.findOpeningParenthesis(3);
    expect(result).toBe(1);
  });

  it('FindOpeningParenthesis_NoMatchingParenthesis_ReturnsMinusOne', () => {
    // x==5 ) - missing opening
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarOperation('x,==,5'));
    varTests.varTestsComponents.push(new VarTestsParenthesis(')'));
    const result = varTests.findOpeningParenthesis(1);
    expect(result).toBe(-1);
  });

  // VarTests.FindNextValidPosition Tests

  it('FindNextValidPosition_LogicalOperator_ReturnsMinusOne', () => {
    // x==5 AND y==3
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarOperation('x,==,5'));
    varTests.varTestsComponents.push(new VarTestsLogicalOperator('AND'));
    varTests.varTestsComponents.push(new VarOperation('y,==,3'));
    // LogicalOperator cannot be moved
    const result = varTests.findNextValidPosition(1, true);
    expect(result).toBe(-1);
  });

  it('FindNextValidPosition_VarOperationUp_FindsNextVarOperation', () => {
    // x==5 AND y==3
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarOperation('x,==,5'));
    varTests.varTestsComponents.push(new VarTestsLogicalOperator('AND'));
    varTests.varTestsComponents.push(new VarOperation('y,==,3'));
    // Move VarOperation at index 2 up
    const result = varTests.findNextValidPosition(2, true);
    expect(result).toBe(0);
  });

  it('FindNextValidPosition_VarOperationDown_FindsNextVarOperation', () => {
    // x==5 AND y==3
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarOperation('x,==,5'));
    varTests.varTestsComponents.push(new VarTestsLogicalOperator('AND'));
    varTests.varTestsComponents.push(new VarOperation('y,==,3'));
    // Move VarOperation at index 0 down
    const result = varTests.findNextValidPosition(0, false);
    expect(result).toBe(2);
  });

  it('FindNextValidPosition_VarOperationNoTarget_ReturnsMinusOne', () => {
    // x==5 only
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarOperation('x,==,5'));
    // No other VarOperation to swap with
    const result = varTests.findNextValidPosition(0, true);
    expect(result).toBe(-1);
  });

  // VarTests.Remove Tests

  it('Remove_SingleVarOperation_RemovesIt', () => {
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarOperation('x,==,5'));
    varTests.remove(0);
    expect(varTests.varTestsComponents.length).toBe(0);
  });

  it('Remove_VarOperationWithPrecedingOperator_RemovesBoth', () => {
    // x==5 AND y==3
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarOperation('x,==,5'));
    varTests.varTestsComponents.push(new VarTestsLogicalOperator('AND'));
    varTests.varTestsComponents.push(new VarOperation('y,==,3'));
    // Remove y==3 (index 2)
    varTests.remove(2);
    // Should remove AND and y==3
    expect(varTests.varTestsComponents.length).toBe(1);
    expect(varTests.varTestsComponents[0].getClassVarTestsComponentType()).toBe('VarOperation');
  });

  it('Remove_VarOperationWithFollowingOperator_RemovesBoth', () => {
    // x==5 AND y==3
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarOperation('x,==,5'));
    varTests.varTestsComponents.push(new VarTestsLogicalOperator('AND'));
    varTests.varTestsComponents.push(new VarOperation('y,==,3'));
    // Remove x==5 (index 0)
    varTests.remove(0);
    // Should remove x==5 and AND
    expect(varTests.varTestsComponents.length).toBe(1);
    expect(varTests.varTestsComponents[0].getClassVarTestsComponentType()).toBe('VarOperation');
  });

  it('Remove_OpeningParenthesis_RemovesBoth', () => {
    // ( x==5 )
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarTestsParenthesis('('));
    varTests.varTestsComponents.push(new VarOperation('x,==,5'));
    varTests.varTestsComponents.push(new VarTestsParenthesis(')'));
    // Remove opening parenthesis
    varTests.remove(0);
    // Both parentheses should be removed
    expect(varTests.varTestsComponents.length).toBe(1);
    expect(varTests.varTestsComponents[0].getClassVarTestsComponentType()).toBe('VarOperation');
  });

  it('Remove_ClosingParenthesis_RemovesBoth', () => {
    // ( x==5 )
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarTestsParenthesis('('));
    varTests.varTestsComponents.push(new VarOperation('x,==,5'));
    varTests.varTestsComponents.push(new VarTestsParenthesis(')'));
    // Remove closing parenthesis
    varTests.remove(2);
    // Both parentheses should be removed
    expect(varTests.varTestsComponents.length).toBe(1);
    expect(varTests.varTestsComponents[0].getClassVarTestsComponentType()).toBe('VarOperation');
  });

  // VarTests.ToString Tests

  it('ToString_EmptyList_ReturnsEmptyString', () => {
    const varTests = new VarTests();
    const result = varTests.toString();
    expect(result).toBe('');
  });

  it('ToString_WithComponents_ReturnsFormattedString', () => {
    const varTests = new VarTests();
    varTests.varTestsComponents.push(new VarOperation('x,==,5'));
    varTests.varTestsComponents.push(new VarTestsLogicalOperator('AND'));
    const result = varTests.toString();
    expect(result.includes('VarOperation:x,==,5')).toBe(true);
    expect(result.includes('VarTestsLogicalOperator:AND')).toBe(true);
  });

  // VarTestsLogicalOperator Tests

  it('VarTestsLogicalOperator_DefaultConstructor_SetsAND', () => {
    const op = new VarTestsLogicalOperator();
    expect(op.op).toBe('AND');
  });

  it('VarTestsLogicalOperator_ParameterizedConstructor_SetsValue', () => {
    const op = new VarTestsLogicalOperator('OR');
    expect(op.op).toBe('OR');
  });

  it('VarTestsLogicalOperator_NextLogicalOperator_TogglesANDtoOR', () => {
    const op = new VarTestsLogicalOperator('AND');
    op.nextLogicalOperator();
    expect(op.op).toBe('OR');
  });

  it('VarTestsLogicalOperator_NextLogicalOperator_TogglesORtoAND', () => {
    const op = new VarTestsLogicalOperator('OR');
    op.nextLogicalOperator();
    expect(op.op).toBe('AND');
  });

  it('VarTestsLogicalOperator_GetVarTestsComponentType_ReturnsCorrectType', () => {
    const result = VarTestsLogicalOperator.getVarTestsComponentType();
    expect(result).toBe('VarTestsLogicalOperator');
  });

  it('VarTestsLogicalOperator_ToString_ReturnsOperator', () => {
    const op = new VarTestsLogicalOperator('OR');
    const result = op.toString();
    expect(result).toBe('OR');
  });

  // VarTestsParenthesis Tests

  it('VarTestsParenthesis_ParameterizedConstructor_SetsValue', () => {
    const paren = new VarTestsParenthesis('(');
    expect(paren.parenthesis).toBe('(');
  });

  it('VarTestsParenthesis_GetVarTestsComponentType_ReturnsCorrectType', () => {
    const result = VarTestsParenthesis.getVarTestsComponentType();
    expect(result).toBe('VarTestsParenthesis');
  });

  it('VarTestsParenthesis_ToString_ReturnsParenthesis', () => {
    const paren = new VarTestsParenthesis(')');
    const result = paren.toString();
    expect(result).toBe(')');
  });

  // VarOperation Tests

  it('VarOperation_ParameterizedConstructor_ParsesCorrectly', () => {
    const op = new VarOperation('health,>=,10');
    expect(op.var).toBe('health');
    expect(op.operation).toBe('>=');
    expect(op.value).toBe('10');
  });

  it('VarOperation_GetVarTestsComponentType_ReturnsCorrectType', () => {
    const result = VarOperation.getVarTestsComponentType();
    expect(result).toBe('VarOperation');
  });

  it('VarOperation_ToString_ReturnsFormattedString', () => {
    const op = new VarOperation('health,>=,10');
    const result = op.toString();
    expect(result).toBe('health,>=,10');
  });

  it('VarOperation_UpdateVarName_ConvertsFireVariable', () => {
    // #fire should be converted to $fire
    const op = new VarOperation('#fire,==,1');
    expect(op.var).toBe('$fire');
  });

  it('VarOperation_UpdateVarName_ConvertsFireInValue', () => {
    // #fire in value should also be converted
    const op = new VarOperation('x,==,#fire');
    expect(op.value).toBe('$fire');
  });
});
