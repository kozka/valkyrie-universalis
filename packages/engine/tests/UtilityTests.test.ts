// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/UtilityTests.cs
// The LinqUtil.ToSet region is not ported: LinqUtil is a C# extension method, and TypeScript uses new Set() instead.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { QuestFormat, TextAlignment, TextAlignmentUtils, ValkyrieDebug } from '../src/index.ts';

/**
 * Unit tests for utility classes: LinqUtil, FormatVersions, and TextAlignment
 */
describe('UtilityTests', () => {
  beforeEach(() => {
    // Disable ValkyrieDebug to prevent Unity logging during tests
    ValkyrieDebug.enabled = false;
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
  });

  // TextAlignment Tests

  it('ParseAlignment_Top_ReturnsTop', () => {
    const result = TextAlignmentUtils.parseAlignment('TOP');
    expect(result).toBe(TextAlignment.TOP);
  });

  it('ParseAlignment_Center_ReturnsCenter', () => {
    const result = TextAlignmentUtils.parseAlignment('CENTER');
    expect(result).toBe(TextAlignment.CENTER);
  });

  it('ParseAlignment_Bottom_ReturnsBottom', () => {
    const result = TextAlignmentUtils.parseAlignment('BOTTOM');
    expect(result).toBe(TextAlignment.BOTTOM);
  });

  it('ParseAlignment_LowercaseTop_ReturnsTop', () => {
    // case insensitive parsing
    const result = TextAlignmentUtils.parseAlignment('top');
    expect(result).toBe(TextAlignment.TOP);
  });

  it('ParseAlignment_MixedCaseCenter_ReturnsCenter', () => {
    const result = TextAlignmentUtils.parseAlignment('Center');
    expect(result).toBe(TextAlignment.CENTER);
  });

  it('ParseAlignment_InvalidValue_ReturnsCenter', () => {
    // invalid value should default to CENTER
    const result = TextAlignmentUtils.parseAlignment('INVALID');
    expect(result).toBe(TextAlignment.CENTER);
  });

  it('ParseAlignment_EmptyString_ReturnsCenter', () => {
    // empty string should default to CENTER
    const result = TextAlignmentUtils.parseAlignment('');
    expect(result).toBe(TextAlignment.CENTER);
  });

  it('TextAlignmentEnum_HasExpectedValues', () => {
    // verify enum has all expected values (Enum.IsDefined)
    const values: number[] = Object.values(TextAlignment);
    expect(values.includes(TextAlignment.TOP)).toBe(true);
    expect(values.includes(TextAlignment.CENTER)).toBe(true);
    expect(values.includes(TextAlignment.BOTTOM)).toBe(true);
  });

  // FormatVersions Tests

  it('QuestFormat_VersionOrdering_IsCorrect', () => {
    // verify versions are in ascending order
    expect(QuestFormat.Versions.RICH_TEXT < QuestFormat.Versions.SPLIT_BASE_MOM_AND_CONVERSION_KIT).toBe(true);
    expect(QuestFormat.Versions.SPLIT_BASE_MOM_AND_CONVERSION_KIT < QuestFormat.Versions.RELEASE_2_5_4).toBe(true);
    expect(QuestFormat.Versions.RELEASE_2_5_4 < QuestFormat.Versions.RELEASE_3_0_0).toBe(true);
    expect(QuestFormat.Versions.RELEASE_3_0_0 < QuestFormat.Versions.RELEASE_3_1_5).toBe(true);
  });

  it('QuestFormat_RichTextVersion_Is16', () => {
    expect(QuestFormat.Versions.RICH_TEXT).toBe(16);
  });

  it('QuestFormat_SplitBaseMomVersion_Is17', () => {
    expect(QuestFormat.Versions.SPLIT_BASE_MOM_AND_CONVERSION_KIT).toBe(17);
  });

  it('QuestFormat_Release254Version_Is18', () => {
    expect(QuestFormat.Versions.RELEASE_2_5_4).toBe(18);
  });

  it('QuestFormat_Release300Version_Is19', () => {
    expect(QuestFormat.Versions.RELEASE_3_0_0).toBe(19);
  });

  it('QuestFormat_Release315Version_Is20', () => {
    expect(QuestFormat.Versions.RELEASE_3_1_5).toBe(20);
  });

  it('QuestFormat_ScenariosRequiringConversionKit_ContainsExpectedScenarios', () => {
    // verify set contains expected scenarios (lowercase)
    expect(QuestFormat.SCENARIOS_THAT_REQUIRE_CONVERSION_KIT.has('escape')).toBe(true);
    expect(QuestFormat.SCENARIOS_THAT_REQUIRE_CONVERSION_KIT.has('holymansion')).toBe(true);
  });

  it('QuestFormat_ScenariosRequiringConversionKit_AllLowercase', () => {
    // all entries should be lowercase
    for (const scenario of QuestFormat.SCENARIOS_THAT_REQUIRE_CONVERSION_KIT) {
      expect(scenario, `Scenario '${scenario}' is not lowercase`).toBe(scenario.toLowerCase());
    }
  });

  it('QuestFormat_ScenariosRequiringConversionKit_IsHashSet', () => {
    // verify it's a HashSet for O(1) lookup
    expect(QuestFormat.SCENARIOS_THAT_REQUIRE_CONVERSION_KIT).toBeInstanceOf(Set);
  });

  it('QuestFormat_ScenariosRequiringConversionKit_NoDuplicates', () => {
    // HashSet automatically removes duplicates, so count should match list
    const list = [
      'Artefatos_Roubados',
      'BelieveorDie1',
      'BlackWoodsSecrets',
      'DemoniosEntreLosWilson',
      'EditorCenario8',
      'EditorScenario3',
      'Escape',
      'HolyMansion',
      'Horror_Haunts_Merinda',
      'InTheDark',
      'La_Follia_di_Arkham',
      'Main_Street_Market_Mayham',
      'OMalqueNuncaDorme',
      'Saviors',
      'StrainOnReality',
      'Stressandstrain',
      'TheLairofRlimShaikorth',
      'TheRitualScenario',
      'TheRobberyOfTheKadakianIdol',
      'wiltshire',
    ].map((t) => t.toLowerCase());

    expect(QuestFormat.SCENARIOS_THAT_REQUIRE_CONVERSION_KIT.size).toBe(list.length);
  });
});
