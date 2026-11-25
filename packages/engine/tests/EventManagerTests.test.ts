// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/EventManagerTests.cs
// Stack<T> is the engine's port of the .NET collection (platform/Stack.ts), which EventManager uses for its queue.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  EventManager,
  QuestButtonAction,
  QuestButtonData,
  Stack,
  StringKey,
  ValkyrieDebug,
  VarOperation,
  VarTests,
} from '../src/index.ts';

/**
 * Unit tests for EventManager class and related event handling functionality.
 * Tests focus on static methods, character maps, symbol replacement, and data structures
 * that can be tested without requiring full Game context.
 */
describe('EventManagerTests', () => {
  beforeEach(() => {
    // Disable ValkyrieDebug to prevent Unity logging during tests
    ValkyrieDebug.enabled = false;
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
  });

  // Character Map Structure Tests

  it('CHARS_MAP_ContainsD2EGameType', () => {
    expect(EventManager.CHARS_MAP.has('D2E'), 'CHARS_MAP should contain D2E game type').toBe(true);
  });

  it('CHARS_MAP_ContainsMoMGameType', () => {
    expect(EventManager.CHARS_MAP.has('MoM'), 'CHARS_MAP should contain MoM game type').toBe(true);
  });

  it('CHARS_MAP_D2E_ContainsHeartSymbol', () => {
    expect(EventManager.CHARS_MAP.get('D2E')!.has('{heart}'), 'D2E map should contain heart symbol').toBe(true);
  });

  it('CHARS_MAP_D2E_ContainsFatigueSymbol', () => {
    expect(EventManager.CHARS_MAP.get('D2E')!.has('{fatigue}'), 'D2E map should contain fatigue symbol').toBe(true);
  });

  it('CHARS_MAP_D2E_ContainsMightSymbol', () => {
    expect(EventManager.CHARS_MAP.get('D2E')!.has('{might}'), 'D2E map should contain might symbol').toBe(true);
  });

  it('CHARS_MAP_D2E_ContainsWillSymbol', () => {
    expect(EventManager.CHARS_MAP.get('D2E')!.has('{will}'), 'D2E map should contain will symbol').toBe(true);
  });

  it('CHARS_MAP_D2E_ContainsActionSymbol', () => {
    expect(EventManager.CHARS_MAP.get('D2E')!.has('{action}'), 'D2E map should contain action symbol').toBe(true);
  });

  it('CHARS_MAP_D2E_ContainsKnowledgeSymbol', () => {
    expect(EventManager.CHARS_MAP.get('D2E')!.has('{knowledge}'), 'D2E map should contain knowledge symbol').toBe(true);
  });

  it('CHARS_MAP_D2E_ContainsAwarenessSymbol', () => {
    expect(EventManager.CHARS_MAP.get('D2E')!.has('{awareness}'), 'D2E map should contain awareness symbol').toBe(true);
  });

  it('CHARS_MAP_D2E_ContainsShieldSymbol', () => {
    expect(EventManager.CHARS_MAP.get('D2E')!.has('{shield}'), 'D2E map should contain shield symbol').toBe(true);
  });

  it('CHARS_MAP_D2E_ContainsSurgeSymbol', () => {
    expect(EventManager.CHARS_MAP.get('D2E')!.has('{surge}'), 'D2E map should contain surge symbol').toBe(true);
  });

  it('CHARS_MAP_MoM_ContainsWillSymbol', () => {
    expect(EventManager.CHARS_MAP.get('MoM')!.has('{will}'), 'MoM map should contain will symbol').toBe(true);
  });

  it('CHARS_MAP_MoM_ContainsStrengthSymbol', () => {
    expect(EventManager.CHARS_MAP.get('MoM')!.has('{strength}'), 'MoM map should contain strength symbol').toBe(true);
  });

  it('CHARS_MAP_MoM_ContainsAgilitySymbol', () => {
    expect(EventManager.CHARS_MAP.get('MoM')!.has('{agility}'), 'MoM map should contain agility symbol').toBe(true);
  });

  it('CHARS_MAP_MoM_ContainsLoreSymbol', () => {
    expect(EventManager.CHARS_MAP.get('MoM')!.has('{lore}'), 'MoM map should contain lore symbol').toBe(true);
  });

  it('CHARS_MAP_MoM_ContainsInfluenceSymbol', () => {
    expect(EventManager.CHARS_MAP.get('MoM')!.has('{influence}'), 'MoM map should contain influence symbol').toBe(true);
  });

  it('CHARS_MAP_MoM_ContainsObservationSymbol', () => {
    expect(EventManager.CHARS_MAP.get('MoM')!.has('{observation}'), 'MoM map should contain observation symbol').toBe(true);
  });

  it('CHARS_MAP_MoM_ContainsSuccessSymbol', () => {
    expect(EventManager.CHARS_MAP.get('MoM')!.has('{success}'), 'MoM map should contain success symbol').toBe(true);
  });

  it('CHARS_MAP_MoM_ContainsClueSymbol', () => {
    expect(EventManager.CHARS_MAP.get('MoM')!.has('{clue}'), 'MoM map should contain clue symbol').toBe(true);
  });

  // Character Packs Map Tests

  it('CHAR_PACKS_MAP_ContainsD2EGameType', () => {
    expect(EventManager.CHAR_PACKS_MAP.has('D2E'), 'CHAR_PACKS_MAP should contain D2E game type').toBe(true);
  });

  it('CHAR_PACKS_MAP_ContainsMoMGameType', () => {
    expect(EventManager.CHAR_PACKS_MAP.has('MoM'), 'CHAR_PACKS_MAP should contain MoM game type').toBe(true);
  });

  it('CHAR_PACKS_MAP_MoM_ContainsMAD01Symbol', () => {
    expect(EventManager.CHAR_PACKS_MAP.get('MoM')!.has('{MAD01}'), 'MoM packs map should contain MAD01 symbol').toBe(true);
  });

  it('CHAR_PACKS_MAP_MoM_ContainsMAD06Symbol', () => {
    expect(EventManager.CHAR_PACKS_MAP.get('MoM')!.has('{MAD06}'), 'MoM packs map should contain MAD06 symbol').toBe(true);
  });

  it('CHAR_PACKS_MAP_D2E_IsEmpty', () => {
    // D2E doesn't have pack-specific symbols
    expect(EventManager.CHAR_PACKS_MAP.get('D2E')!.size, 'D2E packs map should be empty').toBe(0);
  });

  // QuestButtonData Tests

  it('QuestButtonData_DefaultColor_IsWhite', () => {
    expect(QuestButtonData.DEFAULT_COLOR).toBe('white');
  });

  it('QuestButtonData_Constructor_SetsLabel', () => {
    // Arrange
    const label = new StringKey('val', 'TEST');

    // Act
    const buttonData = new QuestButtonData(label);

    // Assert
    expect(buttonData.label).toBe(label);
  });

  it('QuestButtonData_Constructor_DefaultEventNamesIsEmpty', () => {
    // Arrange
    const label = new StringKey('val', 'TEST');

    // Act
    const buttonData = new QuestButtonData(label);

    // Assert
    expect(buttonData.eventNames).not.toBeNullable();
    expect(buttonData.eventNames.length).toBe(0);
  });

  it('QuestButtonData_Constructor_WithEventNames_SetsEventNames', () => {
    // Arrange
    const label = new StringKey('val', 'TEST');
    const eventNames = ['Event1', 'Event2'];

    // Act
    const buttonData = new QuestButtonData(label, eventNames);

    // Assert
    expect(buttonData.eventNames.length).toBe(2);
    expect(buttonData.eventNames[0]).toBe('Event1');
    expect(buttonData.eventNames[1]).toBe('Event2');
  });

  it('QuestButtonData_HasCondition_FalseWhenNoCondition', () => {
    const label = new StringKey('val', 'TEST');
    const buttonData = new QuestButtonData(label);
    expect(buttonData.hasCondition).toBe(false);
  });

  it('QuestButtonData_HasCondition_TrueWhenConditionHasComponents', () => {
    // Arrange
    const label = new StringKey('val', 'TEST');
    const condition = new VarTests();
    condition.varTestsComponents.push(new VarOperation('x,==,5'));
    const buttonData = new QuestButtonData(label, null, condition);

    // Assert
    expect(buttonData.hasCondition).toBe(true);
  });

  it('QuestButtonData_ConditionFailedAction_DefaultToDisableWhenHasCondition', () => {
    // Arrange
    const label = new StringKey('val', 'TEST');
    const condition = new VarTests();
    condition.varTestsComponents.push(new VarOperation('x,==,5'));
    const buttonData = new QuestButtonData(label, null, condition);

    // Assert
    expect(buttonData.conditionFailedAction).toBe(QuestButtonAction.DISABLE);
  });

  it('QuestButtonData_ConditionFailedAction_NoneWhenNoCondition', () => {
    const label = new StringKey('val', 'TEST');
    const buttonData = new QuestButtonData(label);
    expect(buttonData.conditionFailedAction).toBe(QuestButtonAction.NONE);
  });

  it('QuestButtonData_ConditionFailedAction_UsesExplicitValue', () => {
    // Arrange
    const label = new StringKey('val', 'TEST');
    const condition = new VarTests();
    condition.varTestsComponents.push(new VarOperation('x,==,5'));
    const buttonData = new QuestButtonData(label, null, condition, QuestButtonAction.HIDE);

    // Assert
    expect(buttonData.conditionFailedAction).toBe(QuestButtonAction.HIDE);
  });

  it('QuestButtonData_Color_DefaultIsWhite', () => {
    const label = new StringKey('val', 'TEST');
    const buttonData = new QuestButtonData(label);
    expect(buttonData.color).toBe('white');
  });

  it('QuestButtonData_Color_CanBeSet', () => {
    // Arrange
    const label = new StringKey('val', 'TEST');
    const buttonData = new QuestButtonData(label);

    // Act
    buttonData.color = 'red';

    // Assert
    expect(buttonData.color).toBe('red');
  });

  // QuestButtonAction Enum Tests

  it('QuestButtonAction_NONE_HasValue0', () => {
    expect(QuestButtonAction.NONE).toBe(0);
  });

  it('QuestButtonAction_DISABLE_HasValue1', () => {
    expect(QuestButtonAction.DISABLE).toBe(1);
  });

  it('QuestButtonAction_HIDE_HasValue2', () => {
    expect(QuestButtonAction.HIDE).toBe(2);
  });

  // Symbol Replacement Logic Tests

  it('InputSymbolReplace_ReplacesSpecialCharWithMarker', () => {
    // The InputSymbolReplace function replaces special Unicode chars with marker strings
    // Since it requires Game.Get() for character map lookup, we test the concept

    // Arrange - Test that the reverse operation would work
    const markerFormat = '{heart}';

    // Assert - Marker format is correct
    expect(markerFormat.startsWith('{')).toBe(true);
    expect(markerFormat.endsWith('}')).toBe(true);
    expect(markerFormat.includes(' ')).toBe(false);
  });

  it('SymbolMarker_Format_UsesCorrectSyntax', () => {
    // All symbol markers should follow {name} format
    for (const gameType of EventManager.CHARS_MAP.keys()) {
      for (const symbol of EventManager.CHARS_MAP.get(gameType)!.keys()) {
        expect(symbol.startsWith('{'), `Symbol ${symbol} should start with {`).toBe(true);
        expect(symbol.endsWith('}'), `Symbol ${symbol} should end with }`).toBe(true);
      }
    }
  });

  it('PackSymbolMarker_Format_UsesCorrectSyntax', () => {
    // All pack symbol markers should follow {NAME} format
    for (const gameType of EventManager.CHAR_PACKS_MAP.keys()) {
      for (const symbol of EventManager.CHAR_PACKS_MAP.get(gameType)!.keys()) {
        expect(symbol.startsWith('{'), `Pack symbol ${symbol} should start with {`).toBe(true);
        expect(symbol.endsWith('}'), `Pack symbol ${symbol} should end with }`).toBe(true);
      }
    }
  });

  // Event Data Structure Tests

  it('EventStack_CanPushAndPop', () => {
    // Test the Stack<Event> behavior used in EventManager
    const stack = new Stack<string>();

    // Act
    stack.push('Event1');
    stack.push('Event2');
    const popped = stack.pop();

    // Assert - Stack is LIFO
    expect(popped).toBe('Event2');
    expect(stack.count).toBe(1);
  });

  it('EventStack_EmptyStackCount_IsZero', () => {
    const stack = new Stack<string>();
    expect(stack.count).toBe(0);
  });

  it('EventStack_PopFromEmpty_ThrowsException', () => {
    const stack = new Stack<string>();
    expect(() => stack.pop()).toThrow(/^InvalidOperationException/);
  });

  // Button Enabled Logic Tests

  it('ButtonEnabled_NoCondition_IsEnabled', () => {
    // Test the IsButtonEnabled logic pattern
    // A button with no condition (NONE action) is always enabled
    const action: QuestButtonAction = QuestButtonAction.NONE;
    const hasCondition = false;

    // Act - Simulating: action == NONE || !hasCondition || conditionPasses
    const isEnabled = action === QuestButtonAction.NONE || !hasCondition;

    // Assert
    expect(isEnabled).toBe(true);
  });

  it('ButtonEnabled_WithCondition_DependsOnConditionResult', () => {
    // When button has condition, enabled state depends on condition evaluation
    const action: QuestButtonAction = QuestButtonAction.DISABLE;
    const hasCondition = true;
    const conditionPasses = false;

    // Act - Simulating: action == NONE || !hasCondition || conditionPasses
    const isEnabled = action === QuestButtonAction.NONE || !hasCondition || conditionPasses;

    // Assert - Button is disabled because condition fails
    expect(isEnabled).toBe(false);
  });

  it('ButtonEnabled_WithCondition_EnabledWhenConditionPasses', () => {
    // When condition passes, button is enabled regardless of action
    const action: QuestButtonAction = QuestButtonAction.DISABLE;
    const hasCondition = true;
    const conditionPasses = true;

    // Act
    const isEnabled = action === QuestButtonAction.NONE || !hasCondition || conditionPasses;

    // Assert
    expect(isEnabled).toBe(true);
  });

  // Component Text Replacement Pattern Tests

  it('ComponentTextPattern_DetectsCorrectFormat', () => {
    // The {c:ComponentName} pattern is used to reference components in text
    const textWithComponent = 'You found {c:QItem1}';

    // Assert
    expect(textWithComponent.includes('{c:')).toBe(true);
  });

  it('ComponentTextPattern_MultipleComponents', () => {
    // Multiple component references can exist in text
    const textWithComponents = 'Take {c:QItem1} to {c:Tile1}';

    // Assert
    let count = 0;
    let index = 0;
    while ((index = textWithComponents.indexOf('{c:', index)) !== -1) {
      count++;
      index++;
    }
    expect(count).toBe(2);
  });

  it('VariablePattern_DetectsCorrectFormat', () => {
    // The {var:VarName} pattern is used to display variable values
    const textWithVar = 'You have {var:gold} gold';

    // Assert
    expect(textWithVar.includes('{var:')).toBe(true);
  });

  it('NewlineEscape_Format', () => {
    // Text uses \\n for newlines that get replaced with actual newlines
    const textWithNewline = 'Line 1\\nLine 2';

    // Act
    const replaced = textWithNewline.replaceAll('\\n', '\n');

    // Assert
    expect(replaced.includes('\n')).toBe(true);
    expect(replaced.split('\n').length).toBe(2);
  });

  // Random Hero Pattern Tests

  it('RandomHeroPattern_DetectsCorrectFormat', () => {
    // The {rnd:hero} pattern is used to reference a random hero
    const textWithRndHero = '{rnd:hero} investigates the area';

    // Assert
    expect(textWithRndHero.includes('{rnd:hero}')).toBe(true);
  });

  it('RandomHeroPattern_Extended_HasCorrectPrefix', () => {
    // Extended pattern {rnd:hero:...} for gender-specific text
    const pattern = '{rnd:hero:';

    // Assert
    expect(pattern).toBe('{rnd:hero:');
  });
});
