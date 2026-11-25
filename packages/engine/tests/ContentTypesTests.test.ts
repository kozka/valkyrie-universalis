// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/ContentTypesTests.cs
// Game.get() is null here, as in Valkyrie's EditMode tests, so NUnit's NullReferenceException is a TypeError.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  ActivationData,
  AttackData,
  AudioData,
  ClassData,
  EvadeData,
  HeroData,
  HorrorData,
  ImageData,
  ItemData,
  MonsterData,
  PackTypeData,
  PuzzleData,
  SkillData,
  StringKey,
  TileSideData,
  TokenData,
  ValkyrieDebug,
} from '../src/index.ts';

/**
 * Comprehensive unit tests for ContentTypes data classes.
 * Tests constructor parsing, default values, and type conversions for all GenericData subclasses.
 */
describe('ContentTypesTests', () => {
  const TestPath = '/test/path';

  beforeEach(() => {
    // Disable ValkyrieDebug to prevent Unity logging during tests
    ValkyrieDebug.enabled = false;
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
  });

  // GenericData Base Class Tests

  it('GenericData_MinimalDictionary_SetsDefaults', () => {
    const content = new Map<string, string>();
    const data = new PackTypeData('PackTypeTest', content, TestPath);
    expect(data.sectionName).toBe('PackTypeTest');
    expect(data.traits).not.toBeNullable();
    expect(data.traits.length).toBe(0);
    expect(data.image).toBe('');
  });

  it('GenericData_WithName_ParsesNameCorrectly', () => {
    const content = new Map<string, string>([
      ['name', '{val:TEST_NAME}'],
    ]);
    const data = new PackTypeData('PackTypeTest', content, TestPath);
    expect(data.name).not.toBeNullable();
    expect(data.name.fullKey).toBe('{val:TEST_NAME}');
  });

  it('GenericData_WithoutName_UsesDefaultFromSectionName', () => {
    const content = new Map<string, string>();
    const data = new PackTypeData('PackTypeMyPack', content, TestPath);
    // name should be section name minus type prefix
    expect(data.name).not.toBeNullable();
    expect(data.name.key).toBe('MyPack');
  });

  it('GenericData_WithPriority_ParsesPriorityCorrectly', () => {
    const content = new Map<string, string>([
      ['priority', '5'],
    ]);
    const data = new PackTypeData('PackTypeTest', content, TestPath);
    expect(data.priority).toBe(5);
  });

  it('GenericData_WithInvalidPriority_DefaultsToZero', () => {
    const content = new Map<string, string>([
      ['priority', 'invalid'],
    ]);
    const data = new PackTypeData('PackTypeTest', content, TestPath);
    expect(data.priority).toBe(0);
  });

  it('GenericData_WithTraits_ParsesTraitsCorrectly', () => {
    const content = new Map<string, string>([
      ['traits', 'trait1 trait2 trait3'],
    ]);
    const data = new PackTypeData('PackTypeTest', content, TestPath);
    expect(data.traits.length).toBe(3);
    expect(data.traits[0]).toBe('trait1');
    expect(data.traits[1]).toBe('trait2');
    expect(data.traits[2]).toBe('trait3');
  });

  it('GenericData_WithSingleTrait_ParsesCorrectly', () => {
    const content = new Map<string, string>([
      ['traits', 'singletrait'],
    ]);
    const data = new PackTypeData('PackTypeTest', content, TestPath);
    expect(data.traits.length).toBe(1);
    expect(data.traits[0]).toBe('singletrait');
  });

  it('GenericData_WithSets_StoresSetsCorrectly', () => {
    const content = new Map<string, string>();
    const sets = ['set1', 'set2'];
    const data = new PackTypeData('PackTypeTest', content, TestPath, sets);
    expect(data.sets.length).toBe(2);
    expect(data.sets).toContain('set1');
    expect(data.sets).toContain('set2');
  });

  it('GenericData_WithNullSets_CreatesEmptyList', () => {
    const content = new Map<string, string>();
    const data = new PackTypeData('PackTypeTest', content, TestPath, null);
    expect(data.sets).not.toBeNullable();
    expect(data.sets.length).toBe(0);
  });

  it('GenericData_ContainsTrait_ReturnsTrueForExistingTrait', () => {
    const content = new Map<string, string>([
      ['traits', 'warrior mage healer'],
    ]);
    const data = new PackTypeData('PackTypeTest', content, TestPath);
    expect(data.containsTrait('warrior')).toBe(true);
    expect(data.containsTrait('mage')).toBe(true);
    expect(data.containsTrait('healer')).toBe(true);
  });

  it('GenericData_ContainsTrait_ReturnsFalseForNonExistingTrait', () => {
    const content = new Map<string, string>([
      ['traits', 'warrior mage'],
    ]);
    const data = new PackTypeData('PackTypeTest', content, TestPath);
    expect(data.containsTrait('healer')).toBe(false);
    expect(data.containsTrait('thief')).toBe(false);
  });

  // HeroData Tests

  it('HeroData_MinimalDictionary_SetsDefaultArchetype', () => {
    const content = new Map<string, string>();
    const data = new HeroData('HeroTest', content, TestPath);
    expect(data.archetype).toBe('warrior');
    expect(data.item).toBe('');
  });

  it('HeroData_WithArchetype_ParsesArchetype', () => {
    const content = new Map<string, string>([
      ['archetype', 'mage'],
    ]);
    const data = new HeroData('HeroTest', content, TestPath);
    expect(data.archetype).toBe('mage');
  });

  it('HeroData_WithItem_ParsesItem', () => {
    const content = new Map<string, string>([
      ['item', 'StartingSword'],
    ]);
    const data = new HeroData('HeroTest', content, TestPath);
    expect(data.item).toBe('StartingSword');
  });

  it('HeroData_WithAllFields_ParsesAllFields', () => {
    const content = new Map<string, string>([
      ['archetype', 'healer'],
      ['item', 'HealingStaff'],
      ['name', '{val:HERO_NAME}'],
      ['traits', 'human cleric'],
    ]);
    const data = new HeroData('HeroMyHero', content, TestPath);
    expect(data.archetype).toBe('healer');
    expect(data.item).toBe('HealingStaff');
    expect(data.name.fullKey).toBe('{val:HERO_NAME}');
    expect(data.traits.length).toBe(2);
  });

  it('HeroData_TypeField_IsHero', () => {
    expect(HeroData.type).toBe('Hero');
  });

  // ClassData Tests

  it('ClassData_MinimalDictionary_SetsDefaults', () => {
    const content = new Map<string, string>();
    const data = new ClassData('ClassTest', content, TestPath);
    expect(data.archetype).toBe('warrior');
    expect(data.hybridArchetype).toBe('');
    expect(data.items).not.toBeNullable();
    expect(data.items.length).toBe(0);
  });

  it('ClassData_WithArchetype_ParsesArchetype', () => {
    const content = new Map<string, string>([
      ['archetype', 'scout'],
    ]);
    const data = new ClassData('ClassTest', content, TestPath);
    expect(data.archetype).toBe('scout');
  });

  it('ClassData_WithHybridArchetype_ParsesHybridArchetype', () => {
    const content = new Map<string, string>([
      ['hybridarchetype', 'warrior'],
    ]);
    const data = new ClassData('ClassTest', content, TestPath);
    expect(data.hybridArchetype).toBe('warrior');
  });

  it('ClassData_WithSingleItem_ParsesItemsList', () => {
    const content = new Map<string, string>([
      ['items', 'Sword'],
    ]);
    const data = new ClassData('ClassTest', content, TestPath);
    expect(data.items.length).toBe(1);
    expect(data.items[0]).toBe('Sword');
  });

  it('ClassData_WithMultipleItems_ParsesAllItems', () => {
    const content = new Map<string, string>([
      ['items', 'Sword Shield Armor'],
    ]);
    const data = new ClassData('ClassTest', content, TestPath);
    expect(data.items.length).toBe(3);
    expect(data.items[0]).toBe('Sword');
    expect(data.items[1]).toBe('Shield');
    expect(data.items[2]).toBe('Armor');
  });

  it('ClassData_WithAllFields_ParsesAllFields', () => {
    const content = new Map<string, string>([
      ['archetype', 'mage'],
      ['hybridarchetype', 'healer'],
      ['items', 'Staff Robe Wand'],
      ['name', '{val:CLASS_NAME}'],
    ]);
    const data = new ClassData('ClassMageHealer', content, TestPath);
    expect(data.archetype).toBe('mage');
    expect(data.hybridArchetype).toBe('healer');
    expect(data.items.length).toBe(3);
  });

  it('ClassData_TypeField_IsClass', () => {
    expect(ClassData.type).toBe('Class');
  });

  // SkillData Tests

  it('SkillData_MinimalDictionary_DefaultsXpToZero', () => {
    const content = new Map<string, string>();
    const data = new SkillData('SkillTest', content, TestPath);
    expect(data.xp).toBe(0);
  });

  it('SkillData_WithXp_ParsesXpCorrectly', () => {
    const content = new Map<string, string>([
      ['xp', '3'],
    ]);
    const data = new SkillData('SkillTest', content, TestPath);
    expect(data.xp).toBe(3);
  });

  it('SkillData_WithInvalidXp_DefaultsToZero', () => {
    const content = new Map<string, string>([
      ['xp', 'notanumber'],
    ]);
    const data = new SkillData('SkillTest', content, TestPath);
    expect(data.xp).toBe(0);
  });

  it('SkillData_WithNegativeXp_ParsesNegativeValue', () => {
    const content = new Map<string, string>([
      ['xp', '-5'],
    ]);
    const data = new SkillData('SkillTest', content, TestPath);
    expect(data.xp).toBe(-5);
  });

  it('SkillData_TypeField_IsSkill', () => {
    expect(SkillData.type).toBe('Skill');
  });

  // ItemData Tests

  it('ItemData_MinimalDictionary_SetsDefaults', () => {
    const content = new Map<string, string>();
    const data = new ItemData('ItemTest', content, TestPath);
    expect(data.unique).toBe(false);
    expect(data.price).toBe(0);
    expect(data.minFame).toBe(-1);
    expect(data.maxFame).toBe(-1);
  });

  it('ItemData_WithUniquePrefix_SetsUniqueTrue', () => {
    const content = new Map<string, string>();
    const data = new ItemData('ItemUniqueSword', content, TestPath);
    expect(data.unique).toBe(true);
  });

  it('ItemData_WithoutUniquePrefix_SetsUniqueFalse', () => {
    const content = new Map<string, string>();
    const data = new ItemData('ItemSword', content, TestPath);
    expect(data.unique).toBe(false);
  });

  it('ItemData_WithPrice_ParsesPrice', () => {
    const content = new Map<string, string>([
      ['price', '250'],
    ]);
    const data = new ItemData('ItemTest', content, TestPath);
    expect(data.price).toBe(250);
  });

  it('ItemData_WithInvalidPrice_DefaultsToZero', () => {
    const content = new Map<string, string>([
      ['price', 'expensive'],
    ]);
    const data = new ItemData('ItemTest', content, TestPath);
    expect(data.price).toBe(0);
  });

  it('ItemData_WithMinFame_ParsesMinFame', () => {
    const content = new Map<string, string>([
      ['minfame', 'noteworthy'],
    ]);
    const data = new ItemData('ItemTest', content, TestPath);
    expect(data.minFame).toBe(2);
  });

  it('ItemData_WithMaxFame_ParsesMaxFame', () => {
    const content = new Map<string, string>([
      ['maxfame', 'legendary'],
    ]);
    const data = new ItemData('ItemTest', content, TestPath);
    expect(data.maxFame).toBe(6);
  });

  it('ItemData_Fame_InsignificantReturns1', () => {
    expect(ItemData.fame('insignificant')).toBe(1);
  });

  it('ItemData_Fame_NoteworthyReturns2', () => {
    expect(ItemData.fame('noteworthy')).toBe(2);
  });

  it('ItemData_Fame_ImpressiveReturns3', () => {
    expect(ItemData.fame('impressive')).toBe(3);
  });

  it('ItemData_Fame_CelebratedReturns4', () => {
    expect(ItemData.fame('celebrated')).toBe(4);
  });

  it('ItemData_Fame_HeroicReturns5', () => {
    expect(ItemData.fame('heroic')).toBe(5);
  });

  it('ItemData_Fame_LegendaryReturns6', () => {
    expect(ItemData.fame('legendary')).toBe(6);
  });

  it('ItemData_Fame_UnknownReturns0', () => {
    expect(ItemData.fame('unknown')).toBe(0);
    expect(ItemData.fame('')).toBe(0);
    expect(ItemData.fame('random')).toBe(0);
  });

  it('ItemData_WithAllFields_ParsesAllFields', () => {
    const content = new Map<string, string>([
      ['price', '500'],
      ['minfame', 'impressive'],
      ['maxfame', 'heroic'],
    ]);
    const data = new ItemData('ItemUniqueMagicSword', content, TestPath);
    expect(data.unique).toBe(true);
    expect(data.price).toBe(500);
    expect(data.minFame).toBe(3);
    expect(data.maxFame).toBe(5);
  });

  it('ItemData_TypeField_IsItem', () => {
    expect(ItemData.type).toBe('Item');
  });

  // ActivationData Tests

  it('ActivationData_MinimalDictionary_SetsDefaults', () => {
    const content = new Map<string, string>();
    const data = new ActivationData('MonsterActivationTest', content, TestPath);
    expect(data.ability.key).toBe('-');
    expect(data.minionActions.fullKey).toBe(StringKey.NULL.fullKey);
    expect(data.masterActions.fullKey).toBe(StringKey.NULL.fullKey);
    expect(data.moveButton.fullKey).toBe(StringKey.NULL.fullKey);
    expect(data.move.fullKey).toBe(StringKey.NULL.fullKey);
    expect(data.masterFirst).toBe(false);
    expect(data.minionFirst).toBe(false);
  });

  it('ActivationData_WithAbility_ParsesAbility', () => {
    const content = new Map<string, string>([
      ['ability', '{val:ABILITY_TEXT}'],
    ]);
    const data = new ActivationData('MonsterActivationTest', content, TestPath);
    expect(data.ability.fullKey).toBe('{val:ABILITY_TEXT}');
  });

  it('ActivationData_WithMinion_ParsesMinionActions', () => {
    const content = new Map<string, string>([
      ['minion', '{val:MINION_ACTION}'],
    ]);
    const data = new ActivationData('MonsterActivationTest', content, TestPath);
    expect(data.minionActions.fullKey).toBe('{val:MINION_ACTION}');
  });

  it('ActivationData_WithMaster_ParsesMasterActions', () => {
    const content = new Map<string, string>([
      ['master', '{val:MASTER_ACTION}'],
    ]);
    const data = new ActivationData('MonsterActivationTest', content, TestPath);
    expect(data.masterActions.fullKey).toBe('{val:MASTER_ACTION}');
  });

  it('ActivationData_WithMoveButton_ParsesMoveButton', () => {
    const content = new Map<string, string>([
      ['movebutton', '{val:MOVE_BUTTON}'],
    ]);
    const data = new ActivationData('MonsterActivationTest', content, TestPath);
    expect(data.moveButton.fullKey).toBe('{val:MOVE_BUTTON}');
  });

  it('ActivationData_WithMove_ParsesMove', () => {
    const content = new Map<string, string>([
      ['move', '{val:MOVE_TEXT}'],
    ]);
    const data = new ActivationData('MonsterActivationTest', content, TestPath);
    expect(data.move.fullKey).toBe('{val:MOVE_TEXT}');
  });

  it('ActivationData_WithMasterFirstTrue_ParsesMasterFirst', () => {
    const content = new Map<string, string>([
      ['masterfirst', 'true'],
    ]);
    const data = new ActivationData('MonsterActivationTest', content, TestPath);
    expect(data.masterFirst).toBe(true);
  });

  it('ActivationData_WithMasterFirstFalse_ParsesMasterFirst', () => {
    const content = new Map<string, string>([
      ['masterfirst', 'false'],
    ]);
    const data = new ActivationData('MonsterActivationTest', content, TestPath);
    expect(data.masterFirst).toBe(false);
  });

  it('ActivationData_WithMinionFirstTrue_ParsesMinionFirst', () => {
    const content = new Map<string, string>([
      ['minionfirst', 'true'],
    ]);
    const data = new ActivationData('MonsterActivationTest', content, TestPath);
    expect(data.minionFirst).toBe(true);
  });

  it('ActivationData_WithInvalidBool_DefaultsToFalse', () => {
    const content = new Map<string, string>([
      ['masterfirst', 'yes'],
      ['minionfirst', '1'],
    ]);
    const data = new ActivationData('MonsterActivationTest', content, TestPath);
    expect(data.masterFirst).toBe(false);
    expect(data.minionFirst).toBe(false);
  });

  it('ActivationData_WithAllFields_ParsesAllFields', () => {
    const content = new Map<string, string>([
      ['ability', '{val:ABILITY}'],
      ['minion', '{val:MINION}'],
      ['master', '{val:MASTER}'],
      ['movebutton', '{val:BUTTON}'],
      ['move', '{val:MOVE}'],
      ['masterfirst', 'true'],
      ['minionfirst', 'false'],
    ]);
    const data = new ActivationData('MonsterActivationTest', content, TestPath);
    expect(data.ability.fullKey).toBe('{val:ABILITY}');
    expect(data.minionActions.fullKey).toBe('{val:MINION}');
    expect(data.masterActions.fullKey).toBe('{val:MASTER}');
    expect(data.moveButton.fullKey).toBe('{val:BUTTON}');
    expect(data.move.fullKey).toBe('{val:MOVE}');
    expect(data.masterFirst).toBe(true);
    expect(data.minionFirst).toBe(false);
  });

  it('ActivationData_DefaultConstructor_CreatesInstance', () => {
    const data = new ActivationData();
    // should not throw
    expect(data).not.toBeNullable();
  });

  it('ActivationData_TypeField_IsMonsterActivation', () => {
    expect(ActivationData.type).toBe('MonsterActivation');
  });

  // TokenData Tests

  it('TokenData_MinimalDictionary_SetsDefaults', () => {
    const content = new Map<string, string>();
    const data = new TokenData('TokenTest', content, TestPath);
    expect(data.x).toBe(0);
    expect(data.y).toBe(0);
    expect(data.height).toBe(0);
    expect(data.width).toBe(0);
    expect(data.pxPerSquare).toBe(0);
  });

  it('TokenData_WithXY_ParsesCoordinates', () => {
    const content = new Map<string, string>([
      ['x', '100'],
      ['y', '200'],
    ]);
    const data = new TokenData('TokenTest', content, TestPath);
    expect(data.x).toBe(100);
    expect(data.y).toBe(200);
  });

  it('TokenData_WithHeightWidth_ParsesDimensions', () => {
    const content = new Map<string, string>([
      ['height', '64'],
      ['width', '128'],
    ]);
    const data = new TokenData('TokenTest', content, TestPath);
    expect(data.height).toBe(64);
    expect(data.width).toBe(128);
  });

  it('TokenData_WithPps_ParsesPixelsPerSquare', () => {
    const content = new Map<string, string>([
      ['pps', '72.5'],
    ]);
    const data = new TokenData('TokenTest', content, TestPath);
    expect(data.pxPerSquare).toBeCloseTo(72.5, 3);
  });

  it('TokenData_WithInvalidCoordinates_DefaultsToZero', () => {
    const content = new Map<string, string>([
      ['x', 'invalid'],
      ['y', 'notanumber'],
    ]);
    const data = new TokenData('TokenTest', content, TestPath);
    expect(data.x).toBe(0);
    expect(data.y).toBe(0);
  });

  it('TokenData_WithNegativeCoordinates_ParsesNegativeValues', () => {
    const content = new Map<string, string>([
      ['x', '-50'],
      ['y', '-100'],
    ]);
    const data = new TokenData('TokenTest', content, TestPath);
    expect(data.x).toBe(-50);
    expect(data.y).toBe(-100);
  });

  it('TokenData_FullImage_ReturnsTrueWhenHeightZero', () => {
    const content = new Map<string, string>([
      ['height', '0'],
      ['width', '100'],
    ]);
    const data = new TokenData('TokenTest', content, TestPath);
    expect(data.fullImage()).toBe(true);
  });

  it('TokenData_FullImage_ReturnsTrueWhenWidthZero', () => {
    const content = new Map<string, string>([
      ['height', '100'],
      ['width', '0'],
    ]);
    const data = new TokenData('TokenTest', content, TestPath);
    expect(data.fullImage()).toBe(true);
  });

  it('TokenData_FullImage_ReturnsFalseWhenBothNonZero', () => {
    const content = new Map<string, string>([
      ['height', '100'],
      ['width', '100'],
    ]);
    const data = new TokenData('TokenTest', content, TestPath);
    expect(data.fullImage()).toBe(false);
  });

  it('TokenData_WithAllFields_ParsesAllFields', () => {
    const content = new Map<string, string>([
      ['x', '10'],
      ['y', '20'],
      ['height', '32'],
      ['width', '48'],
      ['pps', '96'],
    ]);
    const data = new TokenData('TokenTest', content, TestPath);
    expect(data.x).toBe(10);
    expect(data.y).toBe(20);
    expect(data.height).toBe(32);
    expect(data.width).toBe(48);
    expect(data.pxPerSquare).toBe(96);
  });

  it('TokenData_TypeField_IsToken', () => {
    expect(TokenData.type).toBe('Token');
  });

  // AttackData Tests

  it('AttackData_MinimalDictionary_SetsDefaults', () => {
    const content = new Map<string, string>();
    const data = new AttackData('AttackTest', content, TestPath);
    expect(data.text.fullKey).toBe(StringKey.NULL.fullKey);
    expect(data.target).toBe('');
    expect(data.attackType).toBe('');
  });

  it('AttackData_WithText_ParsesText', () => {
    const content = new Map<string, string>([
      ['text', '{val:ATTACK_TEXT}'],
    ]);
    const data = new AttackData('AttackTest', content, TestPath);
    expect(data.text.fullKey).toBe('{val:ATTACK_TEXT}');
  });

  it('AttackData_WithTarget_ParsesTarget', () => {
    const content = new Map<string, string>([
      ['target', 'human'],
    ]);
    const data = new AttackData('AttackTest', content, TestPath);
    expect(data.target).toBe('human');
  });

  it('AttackData_WithAttackType_ParsesAttackType', () => {
    const content = new Map<string, string>([
      ['attacktype', 'heavy'],
    ]);
    const data = new AttackData('AttackTest', content, TestPath);
    expect(data.attackType).toBe('heavy');
  });

  it('AttackData_WithAllFields_ParsesAllFields', () => {
    const content = new Map<string, string>([
      ['text', '{val:SLASH_ATTACK}'],
      ['target', 'spirit'],
      ['attacktype', 'unarmed'],
    ]);
    const data = new AttackData('AttackTest', content, TestPath);
    expect(data.text.fullKey).toBe('{val:SLASH_ATTACK}');
    expect(data.target).toBe('spirit');
    expect(data.attackType).toBe('unarmed');
  });

  it('AttackData_TypeField_IsAttack', () => {
    expect(AttackData.type).toBe('Attack');
  });

  // EvadeData Tests

  it('EvadeData_MinimalDictionary_SetsDefaults', () => {
    const content = new Map<string, string>();
    const data = new EvadeData('EvadeTest', content, TestPath);
    expect(data.text.fullKey).toBe(StringKey.NULL.fullKey);
    expect(data.monster).toBe('');
  });

  it('EvadeData_WithText_ParsesText', () => {
    const content = new Map<string, string>([
      ['text', '{val:EVADE_TEXT}'],
    ]);
    const data = new EvadeData('EvadeTest', content, TestPath);
    expect(data.text.fullKey).toBe('{val:EVADE_TEXT}');
  });

  it('EvadeData_WithMonster_ParsesMonster', () => {
    const content = new Map<string, string>([
      ['monster', 'Zombie'],
    ]);
    const data = new EvadeData('EvadeTest', content, TestPath);
    expect(data.monster).toBe('Zombie');
  });

  it('EvadeData_WithAllFields_ParsesAllFields', () => {
    const content = new Map<string, string>([
      ['text', '{val:DODGE}'],
      ['monster', 'Ghost'],
    ]);
    const data = new EvadeData('EvadeTest', content, TestPath);
    expect(data.text.fullKey).toBe('{val:DODGE}');
    expect(data.monster).toBe('Ghost');
  });

  it('EvadeData_TypeField_IsEvade', () => {
    expect(EvadeData.type).toBe('Evade');
  });

  // HorrorData Tests

  it('HorrorData_MinimalDictionary_SetsDefaults', () => {
    const content = new Map<string, string>();
    const data = new HorrorData('HorrorTest', content, TestPath);
    expect(data.text.fullKey).toBe(StringKey.NULL.fullKey);
    expect(data.monster).toBe('');
  });

  it('HorrorData_WithText_ParsesText', () => {
    const content = new Map<string, string>([
      ['text', '{val:HORROR_TEXT}'],
    ]);
    const data = new HorrorData('HorrorTest', content, TestPath);
    expect(data.text.fullKey).toBe('{val:HORROR_TEXT}');
  });

  it('HorrorData_WithMonster_ParsesMonster', () => {
    const content = new Map<string, string>([
      ['monster', 'DeepOne'],
    ]);
    const data = new HorrorData('HorrorTest', content, TestPath);
    expect(data.monster).toBe('DeepOne');
  });

  it('HorrorData_WithAllFields_ParsesAllFields', () => {
    const content = new Map<string, string>([
      ['text', '{val:SANITY_CHECK}'],
      ['monster', 'Shoggoth'],
    ]);
    const data = new HorrorData('HorrorTest', content, TestPath);
    expect(data.text.fullKey).toBe('{val:SANITY_CHECK}');
    expect(data.monster).toBe('Shoggoth');
  });

  it('HorrorData_TypeField_IsHorror', () => {
    expect(HorrorData.type).toBe('Horror');
  });

  // PuzzleData Tests

  it('PuzzleData_MinimalDictionary_CreatesInstance', () => {
    const content = new Map<string, string>();
    const sets = ['base'];
    const data = new PuzzleData('PuzzleTest', content, TestPath, sets);
    expect(data).not.toBeNullable();
    expect(data.sectionName).toBe('PuzzleTest');
  });

  it('PuzzleData_WithTraits_InheritsBaseClassParsing', () => {
    const content = new Map<string, string>([
      ['traits', 'slide image'],
    ]);
    const sets: string[] = [];
    const data = new PuzzleData('PuzzleTest', content, TestPath, sets);
    expect(data.traits.length).toBe(2);
    expect(data.traits[0]).toBe('slide');
    expect(data.traits[1]).toBe('image');
  });

  it('PuzzleData_TypeField_IsPuzzle', () => {
    expect(PuzzleData.type).toBe('Puzzle');
  });

  // ImageData Tests

  it('ImageData_MinimalDictionary_InheritsTokenDataDefaults', () => {
    const content = new Map<string, string>();
    const sets: string[] = [];
    const data = new ImageData('ImageTest', content, TestPath, sets);
    expect(data.x).toBe(0);
    expect(data.y).toBe(0);
    expect(data.height).toBe(0);
    expect(data.width).toBe(0);
    expect(data.pxPerSquare).toBe(0);
  });

  it('ImageData_WithTokenDataFields_ParsesCorrectly', () => {
    const content = new Map<string, string>([
      ['x', '50'],
      ['y', '75'],
      ['height', '128'],
      ['width', '256'],
      ['pps', '72'],
    ]);
    const sets: string[] = [];
    const data = new ImageData('ImageTest', content, TestPath, sets);
    expect(data.x).toBe(50);
    expect(data.y).toBe(75);
    expect(data.height).toBe(128);
    expect(data.width).toBe(256);
    expect(data.pxPerSquare).toBe(72);
  });

  it('ImageData_TypeField_IsImage', () => {
    expect(ImageData.type).toBe('Image');
  });

  // MonsterData Tests

  it('MonsterData_DefaultConstructor_CreatesInstance', () => {
    const data = new MonsterData();
    expect(data).not.toBeNullable();
  });

  it('MonsterData_MinimalDictionary_SetsDefaults', () => {
    const content = new Map<string, string>();
    const sets: string[] = [];
    const data = new MonsterData('MonsterTest', content, TestPath, sets);
    expect(data.info.key).toBe('-');
    expect(data.activations).not.toBeNullable();
    expect(data.activations.length).toBe(0);
    expect(data.healthBase).toBe(0);
    expect(data.healthPerHero).toBe(0);
    expect(data.horror).toBe(0);
    expect(data.awareness).toBe(0);
  });

  it('MonsterData_WithInfo_ParsesInfo', () => {
    const content = new Map<string, string>([
      ['info', '{val:MONSTER_INFO}'],
    ]);
    const sets: string[] = [];
    const data = new MonsterData('MonsterTest', content, TestPath, sets);
    expect(data.info.fullKey).toBe('{val:MONSTER_INFO}');
  });

  it('MonsterData_WithSingleActivation_ParsesActivation', () => {
    const content = new Map<string, string>([
      ['activation', 'MonsterActivationRoar'],
    ]);
    const sets: string[] = [];
    const data = new MonsterData('MonsterTest', content, TestPath, sets);
    expect(data.activations.length).toBe(1);
    expect(data.activations[0]).toBe('MonsterActivationRoar');
  });

  it('MonsterData_WithMultipleActivations_ParsesAllActivations', () => {
    const content = new Map<string, string>([
      ['activation', 'Roar Bite Claw'],
    ]);
    const sets: string[] = [];
    const data = new MonsterData('MonsterTest', content, TestPath, sets);
    expect(data.activations.length).toBe(3);
    expect(data.activations[0]).toBe('Roar');
    expect(data.activations[1]).toBe('Bite');
    expect(data.activations[2]).toBe('Claw');
  });

  it('MonsterData_WithHealth_ParsesHealthBase', () => {
    const content = new Map<string, string>([
      ['health', '10.5'],
    ]);
    const sets: string[] = [];
    const data = new MonsterData('MonsterTest', content, TestPath, sets);
    expect(data.healthBase).toBeCloseTo(10.5, 3);
  });

  it('MonsterData_WithHealthPerHero_ParsesHealthPerHero', () => {
    const content = new Map<string, string>([
      ['healthperhero', '2.5'],
    ]);
    const sets: string[] = [];
    const data = new MonsterData('MonsterTest', content, TestPath, sets);
    expect(data.healthPerHero).toBeCloseTo(2.5, 3);
  });

  it('MonsterData_WithHorror_ParsesHorror', () => {
    const content = new Map<string, string>([
      ['horror', '3'],
    ]);
    const sets: string[] = [];
    const data = new MonsterData('MonsterTest', content, TestPath, sets);
    expect(data.horror).toBe(3);
  });

  it('MonsterData_WithAwareness_ParsesAwareness', () => {
    const content = new Map<string, string>([
      ['awareness', '-2'],
    ]);
    const sets: string[] = [];
    const data = new MonsterData('MonsterTest', content, TestPath, sets);
    expect(data.awareness).toBe(-2);
  });

  it('MonsterData_WithInvalidNumericValues_DefaultsToZero', () => {
    const content = new Map<string, string>([
      ['health', 'invalid'],
      ['healthperhero', 'notanumber'],
      ['horror', 'scary'],
      ['awareness', 'high'],
    ]);
    const sets: string[] = [];
    const data = new MonsterData('MonsterTest', content, TestPath, sets);
    expect(data.healthBase).toBe(0);
    expect(data.healthPerHero).toBe(0);
    expect(data.horror).toBe(0);
    expect(data.awareness).toBe(0);
  });

  it('MonsterData_WithAllFields_ParsesAllFields', () => {
    const content = new Map<string, string>([
      ['info', '{val:MONSTER_DESC}'],
      ['activation', 'Attack1 Attack2'],
      ['health', '20'],
      ['healthperhero', '5'],
      ['horror', '4'],
      ['awareness', '-1'],
      ['traits', 'undead flying'],
    ]);
    const sets: string[] = [];
    const data = new MonsterData('MonsterTest', content, TestPath, sets);
    expect(data.info.fullKey).toBe('{val:MONSTER_DESC}');
    expect(data.activations.length).toBe(2);
    expect(data.healthBase).toBe(20);
    expect(data.healthPerHero).toBe(5);
    expect(data.horror).toBe(4);
    expect(data.awareness).toBe(-1);
    expect(data.traits.length).toBe(2);
  });

  it('MonsterData_TypeField_IsMonster', () => {
    expect(MonsterData.type).toBe('Monster');
  });

  // AudioData Tests

  it('AudioData_MinimalDictionary_SetsEmptyFile', () => {
    const content = new Map<string, string>();
    const sets: string[] = [];
    const data = new AudioData('AudioTest', content, TestPath, sets);
    expect(data.file).toBe('');
  });

  it('AudioData_WithFile_ParsesFilePath', () => {
    const content = new Map<string, string>([
      ['file', 'sounds/monster_roar.ogg'],
    ]);
    const sets: string[] = [];
    const data = new AudioData('AudioTest', content, TestPath, sets);
    // File path should be combined with the content path
    expect(
      data.file.endsWith('sounds/monster_roar.ogg') || (data.file.includes('sounds') && data.file.includes('monster_roar.ogg')),
    ).toBe(true);
  });

  it('AudioData_TypeField_IsAudio', () => {
    expect(AudioData.type).toBe('Audio');
  });

  // PackTypeData Tests

  it('PackTypeData_MinimalDictionary_CreatesInstance', () => {
    const content = new Map<string, string>();
    const data = new PackTypeData('PackTypeTest', content, TestPath);
    expect(data).not.toBeNullable();
    expect(data.sectionName).toBe('PackTypeTest');
  });

  it('PackTypeData_TypeField_IsPackType', () => {
    expect(PackTypeData.type).toBe('PackType');
  });

  // TileSideData Partial Tests (Avoid Game.Get() calls)

  it('TileSideData_WithTop_ParsesTopValue', () => {
    const content = new Map<string, string>([
      ['top', '15.5'],
    ]);
    // Note: This may fail if pxPerSquare requires Game.Get()
    // We use try-catch to handle the case where Game.Get() is called
    try {
      const data = new TileSideData('TileSideTest', content, TestPath);
      expect(data.top).toBeCloseTo(15.5, 3);
    } catch (e) {
      // Expected if Game.Get() is called during construction
      if (!(e instanceof TypeError)) throw e;
      // Assert.Pass: TileSideData constructor requires Game.Get() - skipping field validation
    }
  });

  it('TileSideData_WithLeft_ParsesLeftValue', () => {
    const content = new Map<string, string>([
      ['left', '20.0'],
    ]);
    try {
      const data = new TileSideData('TileSideTest', content, TestPath);
      expect(data.left).toBeCloseTo(20.0, 3);
    } catch (e) {
      if (!(e instanceof TypeError)) throw e;
      // Assert.Pass: TileSideData constructor requires Game.Get() - skipping field validation
    }
  });

  it('TileSideData_WithAspect_ParsesAspectValue', () => {
    const content = new Map<string, string>([
      ['aspect', '1.5'],
    ]);
    try {
      const data = new TileSideData('TileSideTest', content, TestPath);
      expect(data.aspect).toBeCloseTo(1.5, 3);
    } catch (e) {
      if (!(e instanceof TypeError)) throw e;
      // Assert.Pass: TileSideData constructor requires Game.Get() - skipping field validation
    }
  });

  it('TileSideData_WithReverse_ParsesReverseValue', () => {
    const content = new Map<string, string>([
      ['reverse', 'TileSideOther'],
    ]);
    try {
      const data = new TileSideData('TileSideTest', content, TestPath);
      expect(data.reverse).toBe('TileSideOther');
    } catch (e) {
      if (!(e instanceof TypeError)) throw e;
      // Assert.Pass: TileSideData constructor requires Game.Get() - skipping field validation
    }
  });

  it('TileSideData_TypeField_IsTileSide', () => {
    expect(TileSideData.type).toBe('TileSide');
  });
});
