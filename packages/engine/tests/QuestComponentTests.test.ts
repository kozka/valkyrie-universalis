// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/QuestComponentTests.cs
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { QuestData, TextAlignment, ValkyrieDebug } from '../src/index.ts';

describe('QuestComponentTests', () => {
  beforeEach(() => {
    // Disable ValkyrieDebug to prevent Unity logging during tests
    ValkyrieDebug.enabled = false;
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
  });

  // QuestComponent Base Class Tests

  it('QuestComponent_ParsesXPosition', () => {
    const data = new Map<string, string>([['xposition', '5.5']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    expect(tile.location.x).toBeCloseTo(5.5, 3);
    expect(tile.locationSpecified).toBe(true);
  });

  it('QuestComponent_ParsesYPosition', () => {
    const data = new Map<string, string>([['yposition', '10.25'], ['side', 'TestSide']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    expect(tile.location.y).toBeCloseTo(10.25, 3);
    expect(tile.locationSpecified).toBe(true);
  });

  it('QuestComponent_ParsesBothPositions', () => {
    const data = new Map<string, string>([['xposition', '3.0'], ['yposition', '7.0'], ['side', 'TestSide']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    expect(tile.location.x).toBeCloseTo(3.0, 3);
    expect(tile.location.y).toBeCloseTo(7.0, 3);
    expect(tile.locationSpecified).toBe(true);
  });

  it('QuestComponent_DefaultPositionIsZero', () => {
    const data = new Map<string, string>([['side', 'TestSide']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    expect(tile.location.x).toBe(0);
    expect(tile.location.y).toBe(0);
  });

  it('QuestComponent_ParsesComment', () => {
    const data = new Map<string, string>([['comment', 'This is a test comment'], ['side', 'TestSide']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    expect(tile.comment).toBe('This is a test comment');
  });

  it('QuestComponent_ParsesOperations', () => {
    const data = new Map<string, string>([['operations', 'health,=,100 gold,+,50'], ['side', 'TestSide']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    expect(tile.operations).not.toBeNullable();
    expect(tile.operations.length).toBe(2);
    expect(tile.operations[0].var).toBe('health');
    expect(tile.operations[0].operation).toBe('=');
    expect(tile.operations[0].value).toBe('100');
  });

  it('QuestComponent_ParsesVarTests', () => {
    const data = new Map<string, string>([['vartests', 'VarOperation:health,>=,50 VarTestsLogicalOperator:AND VarOperation:gold,>,10'], ['side', 'TestSide']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    expect(tile.tests).not.toBeNullable();
    expect(tile.tests!.varTestsComponents.length).toBe(3);
  });

  it('QuestComponent_ParsesLegacyConditions', () => {
    // old format 'conditions' should be converted to vartests
    const data = new Map<string, string>([['conditions', 'health,>=,50 gold,>,10'], ['side', 'TestSide']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    expect(tile.tests).not.toBeNullable();
    // Should have 2 conditions with 1 AND operator between them = 3 components
    expect(tile.tests!.varTestsComponents.length).toBe(3);
  });

  it('QuestComponent_SetsSourcePath', () => {
    const data = new Map<string, string>([['side', 'TestSide']]);
    const tile = new QuestData.Tile('Tile1', data, 'custom_source.ini');
    expect(tile.source).toBe('custom_source.ini');
  });

  it('QuestComponent_SetsSectionName', () => {
    const data = new Map<string, string>([['side', 'TestSide']]);
    const tile = new QuestData.Tile('MyTile', data, 'test.ini');
    expect(tile.sectionName).toBe('MyTile');
  });

  it('QuestComponent_RemoveFromArray_RemovesElement', () => {
    const array = [ 'one', 'two', 'three', 'two' ];
    const result = QuestData.QuestComponent.removeFromArray(array, 'two');
    expect(result.length).toBe(2);
    expect(result[0]).toBe('one');
    expect(result[1]).toBe('three');
  });

  it('QuestComponent_RemoveFromArray_NoMatchReturnsOriginal', () => {
    const array = [ 'one', 'two', 'three' ];
    const result = QuestData.QuestComponent.removeFromArray(array, 'four');
    expect(result.length).toBe(3);
  });

  it('QuestComponent_GenKey_ReturnsCorrectFormat', () => {
    const data = new Map<string, string>([['side', 'TestSide']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    const key = tile.genKey('text');
    expect(key).toBe('Tile1.text');
  });

  // Tile Tests

  it('Tile_ParsesRotation', () => {
    const data = new Map<string, string>([['rotation', '90'], ['side', 'TestSide']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    expect(tile.rotation).toBe(90);
  });

  it('Tile_ParsesTileSideName', () => {
    const data = new Map<string, string>([['side', 'DungeonTile1A']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    expect(tile.tileSideName).toBe('DungeonTile1A');
  });

  it('Tile_DefaultRotationIsZero', () => {
    const data = new Map<string, string>([['side', 'TestSide']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    expect(tile.rotation).toBe(0);
  });

  it('Tile_SetsDynamicType', () => {
    const data = new Map<string, string>([['side', 'TestSide']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    expect(tile.typeDynamic).toBe('Tile');
  });

  it('Tile_LocationSpecifiedIsTrue', () => {
    const data = new Map<string, string>([['side', 'TestSide']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    expect(tile.locationSpecified).toBe(true);
  });

  it('Tile_ToStringContainsSide', () => {
    const data = new Map<string, string>([['side', 'TestSide']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    const result = tile.toString();
    expect(result.includes('side=TestSide')).toBe(true);
  });

  it('Tile_ToStringContainsRotationWhenNonZero', () => {
    const data = new Map<string, string>([['side', 'TestSide'], ['rotation', '180']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    const result = tile.toString();
    expect(result.includes('rotation=180')).toBe(true);
  });

  it('Tile_ToStringOmitsRotationWhenZero', () => {
    const data = new Map<string, string>([['side', 'TestSide']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    const result = tile.toString();
    expect(result.includes('rotation=')).toBe(false);
  });

  it('Tile_InvalidRotationDefaultsToZero', () => {
    const data = new Map<string, string>([['side', 'TestSide'], ['rotation', 'invalid']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    expect(tile.rotation).toBe(0);
  });

  it('Tile_ParsesCustomImage', () => {
    const data = new Map<string, string>([['customImage', 'path/to/image.png']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    expect(tile.customImage).toBe('path/to/image.png');
  });

  it('Tile_ParsesTop', () => {
    const data = new Map<string, string>([['top', '105.5']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    expect(tile.top).toBeCloseTo(105.5, 3);
  });

  it('Tile_ParsesLeft', () => {
    const data = new Map<string, string>([['left', '-50.2']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    expect(tile.left).toBeCloseTo(-50.2, 3);
  });

  it('Tile_ToStringContainsCustomImage', () => {
    const data = new Map<string, string>([['customImage', 'myimage.png']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    const result = tile.toString();
    expect(result.includes('customImage=myimage.png')).toBe(true);
  });

  it('Tile_ToStringContainsTopWhenCustomImageSet', () => {
    const data = new Map<string, string>([['customImage', 'myimage.png'], ['top', '10.5']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    const result = tile.toString();
    expect(result.includes('top=10.5')).toBe(true);
  });

  it('Tile_ToStringContainsLeftWhenCustomImageSet', () => {
    const data = new Map<string, string>([['customImage', 'myimage.png'], ['left', '-5.5']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    const result = tile.toString();
    expect(result.includes('left=-5.5')).toBe(true);
  });

  it('Tile_ToStringOmitsSideWhenSideEmpty', () => {
    const data = new Map<string, string>([['customImage', 'myimage.png']]);
    // Manually ensure tileSideName is empty as logic might default it if not present
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    tile.tileSideName = '';
    const result = tile.toString();
    expect(result.includes('side=')).toBe(false);
  });

  it('Tile_ToStringOmitsTopWhenZero', () => {
    const data = new Map<string, string>([['customImage', 'myimage.png']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    // top defaults to 0
    const result = tile.toString();
    expect(result.includes('top=')).toBe(false);
  });

  it('Tile_ToStringOmitsLeftWhenZero', () => {
    const data = new Map<string, string>([['customImage', 'myimage.png']]);
    const tile = new QuestData.Tile('Tile1', data, 'test.ini');
    // left defaults to 0
    const result = tile.toString();
    expect(result.includes('left=')).toBe(false);
  });

  // MPlace Tests

  it('MPlace_ParsesMaster', () => {
    const data = new Map<string, string>([['master', 'true']]);
    const mplace = new QuestData.MPlace('MPlace1', data, 'test.ini');
    expect(mplace.master).toBe(true);
  });

  it('MPlace_ParsesRotate', () => {
    const data = new Map<string, string>([['rotate', 'true']]);
    const mplace = new QuestData.MPlace('MPlace1', data, 'test.ini');
    expect(mplace.rotate).toBe(true);
  });

  it('MPlace_DefaultMasterIsFalse', () => {
    const data = new Map<string, string>();
    const mplace = new QuestData.MPlace('MPlace1', data, 'test.ini');
    expect(mplace.master).toBe(false);
  });

  it('MPlace_DefaultRotateIsFalse', () => {
    const data = new Map<string, string>();
    const mplace = new QuestData.MPlace('MPlace1', data, 'test.ini');
    expect(mplace.rotate).toBe(false);
  });

  it('MPlace_SetsDynamicType', () => {
    const data = new Map<string, string>();
    const mplace = new QuestData.MPlace('MPlace1', data, 'test.ini');
    expect(mplace.typeDynamic).toBe('MPlace');
  });

  it('MPlace_LocationSpecifiedIsTrue', () => {
    const data = new Map<string, string>();
    const mplace = new QuestData.MPlace('MPlace1', data, 'test.ini');
    expect(mplace.locationSpecified).toBe(true);
  });

  it('MPlace_ToStringContainsMasterWhenTrue', () => {
    const data = new Map<string, string>([['master', 'true']]);
    const mplace = new QuestData.MPlace('MPlace1', data, 'test.ini');
    const result = mplace.toString();
    expect(result.includes('master=true')).toBe(true);
  });

  it('MPlace_ToStringContainsRotateWhenTrue', () => {
    const data = new Map<string, string>([['rotate', 'true']]);
    const mplace = new QuestData.MPlace('MPlace1', data, 'test.ini');
    const result = mplace.toString();
    expect(result.includes('rotate=true')).toBe(true);
  });

  it('MPlace_ParsesTokenSize', () => {
    const data = new Map<string, string>([['tokensize', '2x2']]);
    const mplace = new QuestData.MPlace('MPlace1', data, 'test.ini');
    expect(mplace.tokenSize).toBe('2x2');
  });

  it('MPlace_ToStringContainsTokenSize', () => {
    const data = new Map<string, string>([['tokensize', '3x3']]);
    const mplace = new QuestData.MPlace('MPlace1', data, 'test.ini');
    const result = mplace.toString();
    expect(result.includes('tokensize=3x3')).toBe(true);
  });

  // QItem Tests

  it('QItem_ParsesItemName', () => {
    const data = new Map<string, string>([['itemname', 'Sword Shield']]);
    const qitem = new QuestData.QItem('QItem1', data, 'test.ini');
    expect(qitem.itemName.length).toBe(2);
    expect(qitem.itemName[0]).toBe('Sword');
    expect(qitem.itemName[1]).toBe('Shield');
  });

  it('QItem_ParsesStarting', () => {
    const data = new Map<string, string>([['starting', 'true']]);
    const qitem = new QuestData.QItem('QItem1', data, 'test.ini');
    expect(qitem.starting).toBe(true);
  });

  it('QItem_DefaultStartingWhenMissing', () => {
    // when 'starting' key is missing, defaults to true (deprecated format 3)
    const data = new Map<string, string>();
    const qitem = new QuestData.QItem('QItem1', data, 'test.ini');
    expect(qitem.starting).toBe(true);
  });

  it('QItem_ParsesTraits', () => {
    const data = new Map<string, string>([['traits', 'weapon melee blade']]);
    const qitem = new QuestData.QItem('QItem1', data, 'test.ini');
    expect(qitem.traits.length).toBe(3);
    expect(qitem.traits[0]).toBe('weapon');
    expect(qitem.traits[1]).toBe('melee');
    expect(qitem.traits[2]).toBe('blade');
  });

  it('QItem_ParsesTraitpool', () => {
    const data = new Map<string, string>([['traitpool', 'magic ranged']]);
    const qitem = new QuestData.QItem('QItem1', data, 'test.ini');
    expect(qitem.traitpool.length).toBe(2);
    expect(qitem.traitpool[0]).toBe('magic');
    expect(qitem.traitpool[1]).toBe('ranged');
  });

  it('QItem_ParsesInspect', () => {
    const data = new Map<string, string>([['inspect', 'EventInspect']]);
    const qitem = new QuestData.QItem('QItem1', data, 'test.ini');
    expect(qitem.inspect).toBe('EventInspect');
  });

  it('QItem_DefaultItemNameIsEmpty', () => {
    const data = new Map<string, string>();
    const qitem = new QuestData.QItem('QItem1', data, 'test.ini');
    expect(qitem.itemName.length).toBe(0);
  });

  it('QItem_DefaultTraitsIsEmpty', () => {
    const data = new Map<string, string>();
    const qitem = new QuestData.QItem('QItem1', data, 'test.ini');
    expect(qitem.traits.length).toBe(0);
  });

  it('QItem_SetsDynamicType', () => {
    const data = new Map<string, string>();
    const qitem = new QuestData.QItem('QItem1', data, 'test.ini');
    expect(qitem.typeDynamic).toBe('QItem');
  });

  it('QItem_ChangeReference_UpdatesInspect', () => {
    const data = new Map<string, string>([['inspect', 'OldEvent']]);
    const qitem = new QuestData.QItem('QItem1', data, 'test.ini');
    qitem.changeReference('OldEvent', 'NewEvent');
    expect(qitem.inspect).toBe('NewEvent');
  });

  it('QItem_ChangeReference_UpdatesItemName', () => {
    const data = new Map<string, string>([['itemname', 'OldItem NewItem']]);
    const qitem = new QuestData.QItem('QItem1', data, 'test.ini');
    qitem.changeReference('OldItem', 'RenamedItem');
    expect(qitem.itemName[0]).toBe('RenamedItem');
    expect(qitem.itemName[1]).toBe('NewItem');
  });

  it('QItem_ToStringContainsItemName', () => {
    const data = new Map<string, string>([['itemname', 'Sword']]);
    const qitem = new QuestData.QItem('QItem1', data, 'test.ini');
    const result = qitem.toString();
    expect(result.includes('itemname=Sword')).toBe(true);
  });

  // Activation Tests

  it('Activation_ParsesMinionFirst', () => {
    const data = new Map<string, string>([['minionfirst', 'true']]);
    const activation = new QuestData.Activation('Activation1', data, 'test.ini');
    expect(activation.minionFirst).toBe(true);
  });

  it('Activation_ParsesMasterFirst', () => {
    const data = new Map<string, string>([['masterfirst', 'true']]);
    const activation = new QuestData.Activation('Activation1', data, 'test.ini');
    expect(activation.masterFirst).toBe(true);
  });

  it('Activation_DefaultMinionFirstIsFalse', () => {
    const data = new Map<string, string>();
    const activation = new QuestData.Activation('Activation1', data, 'test.ini');
    expect(activation.minionFirst).toBe(false);
  });

  it('Activation_DefaultMasterFirstIsFalse', () => {
    const data = new Map<string, string>();
    const activation = new QuestData.Activation('Activation1', data, 'test.ini');
    expect(activation.masterFirst).toBe(false);
  });

  it('Activation_SetsDynamicType', () => {
    const data = new Map<string, string>();
    const activation = new QuestData.Activation('Activation1', data, 'test.ini');
    expect(activation.typeDynamic).toBe('Activation');
  });

  it('Activation_ToStringContainsMinionFirstWhenTrue', () => {
    const data = new Map<string, string>([['minionfirst', 'true']]);
    const activation = new QuestData.Activation('Activation1', data, 'test.ini');
    const result = activation.toString();
    expect(result.includes('minionfirst=True')).toBe(true);
  });

  it('Activation_GenKeyFormatsCorrectly', () => {
    const data = new Map<string, string>();
    const activation = new QuestData.Activation('ActivationTest', data, 'test.ini');
    expect(activation.ability_key).toBe('ActivationTest.ability');
    expect(activation.minion_key).toBe('ActivationTest.minion');
    expect(activation.master_key).toBe('ActivationTest.master');
    expect(activation.movebutton_key).toBe('ActivationTest.movebutton');
    expect(activation.move_key).toBe('ActivationTest.move');
  });

  // CustomMonster Tests

  it('CustomMonster_ParsesBaseMonster', () => {
    const data = new Map<string, string>([['base', 'Goblin']]);
    const monster = new QuestData.CustomMonster('CustomMonster1', data, 'test.ini');
    expect(monster.baseMonster).toBe('Goblin');
  });

  it('CustomMonster_ParsesTraits', () => {
    const data = new Map<string, string>([['traits', 'humanoid cursed']]);
    const monster = new QuestData.CustomMonster('CustomMonster1', data, 'test.ini');
    expect(monster.traits.length).toBe(2);
    expect(monster.traits[0]).toBe('humanoid');
    expect(monster.traits[1]).toBe('cursed');
  });

  it('CustomMonster_ParsesImagePath', () => {
    const data = new Map<string, string>([['image', 'monsters\\goblin.png']]);
    const monster = new QuestData.CustomMonster('CustomMonster1', data, 'test.ini');
    expect(monster.imagePath).toBe('monsters/goblin.png'); // backslash converted to forward slash
  });

  it('CustomMonster_ParsesImagePlace', () => {
    const data = new Map<string, string>([['imageplace', 'monsters/goblin_place.png']]);
    const monster = new QuestData.CustomMonster('CustomMonster1', data, 'test.ini');
    expect(monster.imagePlace).toBe('monsters/goblin_place.png');
  });

  it('CustomMonster_ParsesActivations', () => {
    const data = new Map<string, string>([['activation', 'GoblinAttack GoblinMove']]);
    const monster = new QuestData.CustomMonster('CustomMonster1', data, 'test.ini');
    expect(monster.activations.length).toBe(2);
    expect(monster.activations[0]).toBe('GoblinAttack');
    expect(monster.activations[1]).toBe('GoblinMove');
  });

  it('CustomMonster_ParsesHealth', () => {
    const data = new Map<string, string>([['health', '10']]);
    const monster = new QuestData.CustomMonster('CustomMonster1', data, 'test.ini');
    expect(monster.healthBase).toBeCloseTo(10, 3);
    expect(monster.healthDefined).toBe(true);
  });

  it('CustomMonster_ParsesHealthPerHero', () => {
    const data = new Map<string, string>([['healthperhero', '5.5']]);
    const monster = new QuestData.CustomMonster('CustomMonster1', data, 'test.ini');
    expect(monster.healthPerHero).toBeCloseTo(5.5, 3);
    expect(monster.healthDefined).toBe(true);
  });

  it('CustomMonster_ParsesEvadeEvent', () => {
    const data = new Map<string, string>([['evadeevent', 'EventEvade']]);
    const monster = new QuestData.CustomMonster('CustomMonster1', data, 'test.ini');
    expect(monster.evadeEvent).toBe('EventEvade');
  });

  it('CustomMonster_ParsesHorrorEvent', () => {
    const data = new Map<string, string>([['horrorevent', 'EventHorror']]);
    const monster = new QuestData.CustomMonster('CustomMonster1', data, 'test.ini');
    expect(monster.horrorEvent).toBe('EventHorror');
  });

  it('CustomMonster_ParsesHorror', () => {
    const data = new Map<string, string>([['horror', '3']]);
    const monster = new QuestData.CustomMonster('CustomMonster1', data, 'test.ini');
    expect(monster.horror).toBe(3);
    expect(monster.horrorDefined).toBe(true);
  });

  it('CustomMonster_ParsesAwareness', () => {
    const data = new Map<string, string>([['awareness', '2']]);
    const monster = new QuestData.CustomMonster('CustomMonster1', data, 'test.ini');
    expect(monster.awareness).toBe(2);
    expect(monster.awarenessDefined).toBe(true);
  });

  it('CustomMonster_ParsesAttacks', () => {
    const data = new Map<string, string>([['attacks', 'melee:2 ranged:1']]);
    const monster = new QuestData.CustomMonster('CustomMonster1', data, 'test.ini');
    expect(monster.investigatorAttacks.has('melee')).toBe(true);
    expect(monster.investigatorAttacks.has('ranged')).toBe(true);
    expect(monster.investigatorAttacks.get('melee')!.length).toBe(2);
    expect(monster.investigatorAttacks.get('ranged')!.length).toBe(1);
  });

  it('CustomMonster_DefaultHealthDefinedIsFalse', () => {
    const data = new Map<string, string>();
    const monster = new QuestData.CustomMonster('CustomMonster1', data, 'test.ini');
    expect(monster.healthDefined).toBe(false);
  });

  it('CustomMonster_DefaultHorrorDefinedIsFalse', () => {
    const data = new Map<string, string>();
    const monster = new QuestData.CustomMonster('CustomMonster1', data, 'test.ini');
    expect(monster.horrorDefined).toBe(false);
  });

  it('CustomMonster_DefaultAwarenessDefinedIsFalse', () => {
    const data = new Map<string, string>();
    const monster = new QuestData.CustomMonster('CustomMonster1', data, 'test.ini');
    expect(monster.awarenessDefined).toBe(false);
  });

  it('CustomMonster_SetsDynamicType', () => {
    const data = new Map<string, string>();
    const monster = new QuestData.CustomMonster('CustomMonster1', data, 'test.ini');
    expect(monster.typeDynamic).toBe('CustomMonster');
  });

  it('CustomMonster_ChangeReference_UpdatesActivations', () => {
    const data = new Map<string, string>([['activation', 'OldActivation NewActivation']]);
    const monster = new QuestData.CustomMonster('CustomMonster1', data, 'test.ini');
    monster.changeReference('OldActivation', 'RenamedActivation');
    expect(monster.activations[0]).toBe('RenamedActivation');
  });

  it('CustomMonster_ChangeReference_UpdatesEvadeEvent', () => {
    const data = new Map<string, string>([['evadeevent', 'OldEvent']]);
    const monster = new QuestData.CustomMonster('CustomMonster1', data, 'test.ini');
    monster.changeReference('OldEvent', 'NewEvent');
    expect(monster.evadeEvent).toBe('NewEvent');
  });

  it('CustomMonster_ChangeReference_UpdatesHorrorEvent', () => {
    const data = new Map<string, string>([['horrorevent', 'OldEvent']]);
    const monster = new QuestData.CustomMonster('CustomMonster1', data, 'test.ini');
    monster.changeReference('OldEvent', 'NewEvent');
    expect(monster.horrorEvent).toBe('NewEvent');
  });

  it('CustomMonster_GenKeyFormatsCorrectly', () => {
    const data = new Map<string, string>();
    const monster = new QuestData.CustomMonster('CustomMonsterTest', data, 'test.ini');
    expect(monster.monstername_key).toBe('CustomMonsterTest.monstername');
    expect(monster.info_key).toBe('CustomMonsterTest.info');
  });

  // Event Tests

  it('Event_ParsesDisplay', () => {
    const data = new Map<string, string>([['display', 'false']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    expect(evt.display).toBe(false);
  });

  it('Event_ParsesHighlight', () => {
    const data = new Map<string, string>([['highlight', 'true']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    expect(evt.highlight).toBe(true);
  });

  it('Event_ParsesButtonCount', () => {
    const data = new Map<string, string>([['buttons', '3'], ['event1', 'NextEvent1'], ['event2', 'NextEvent2'], ['event3', 'NextEvent3']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    expect(evt.buttons.length).toBe(3);
  });

  it('Event_DisplayEventGetsAtLeastOneButton', () => {
    // display is true by default, buttons=0 should still give 1 button
    const data = new Map<string, string>([['display', 'true'], ['buttons', '0']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    expect(evt.buttons.length).toBe(1);
  });

  it('Event_ParsesHeroListName', () => {
    const data = new Map<string, string>([['hero', 'HeroSelectEvent']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    expect(evt.heroListName).toBe('HeroSelectEvent');
  });

  it('Event_ParsesQuota', () => {
    const data = new Map<string, string>([['quota', '5']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    expect(evt.quota).toBe(5);
  });

  it('Event_ParsesQuotaVar', () => {
    // quota starting with non-digit is treated as variable
    const data = new Map<string, string>([['quota', 'myVar']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    expect(evt.quotaVar).toBe('myVar');
  });

  it('Event_ParsesMinHeroes', () => {
    const data = new Map<string, string>([['minhero', '2']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    expect(evt.minHeroes).toBe(2);
  });

  it('Event_ParsesMaxHeroes', () => {
    const data = new Map<string, string>([['maxhero', '4']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    expect(evt.maxHeroes).toBe(4);
  });

  it('Event_ParsesAddComponents', () => {
    const data = new Map<string, string>([['add', 'Component1 Component2 Component3']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    expect(evt.addComponents.length).toBe(3);
    expect(evt.addComponents[0]).toBe('Component1');
    expect(evt.addComponents[1]).toBe('Component2');
    expect(evt.addComponents[2]).toBe('Component3');
  });

  it('Event_ParsesRemoveComponents', () => {
    const data = new Map<string, string>([['remove', 'OldComponent1 OldComponent2']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    expect(evt.removeComponents.length).toBe(2);
    expect(evt.removeComponents[0]).toBe('OldComponent1');
    expect(evt.removeComponents[1]).toBe('OldComponent2');
  });

  it('Event_ParsesTrigger', () => {
    const data = new Map<string, string>([['trigger', 'RoundStart']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    expect(evt.trigger).toBe('RoundStart');
  });

  it('Event_ParsesRandomEvents', () => {
    const data = new Map<string, string>([['randomevents', 'true']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    expect(evt.randomEvents).toBe(true);
  });

  it('Event_ParsesMinCam', () => {
    const data = new Map<string, string>([['mincam', 'true']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    expect(evt.minCam).toBe(true);
    expect(evt.locationSpecified).toBe(false);
  });

  it('Event_ParsesMaxCam', () => {
    const data = new Map<string, string>([['maxcam', 'true']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    expect(evt.maxCam).toBe(true);
    expect(evt.locationSpecified).toBe(false);
  });

  it('Event_ParsesAudio', () => {
    const data = new Map<string, string>([['audio', 'sounds\\effect.ogg']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    expect(evt.audio).toBe('sounds/effect.ogg'); // backslash converted
  });

  it('Event_ParsesMusic', () => {
    const data = new Map<string, string>([['music', 'music\\track1.ogg music\\track2.ogg']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    expect(evt.music.length).toBe(2);
    expect(evt.music[0]).toBe('music/track1.ogg');
    expect(evt.music[1]).toBe('music/track2.ogg');
  });

  it('Event_DefaultDisplayIsTrue', () => {
    const data = new Map<string, string>();
    // display defaults to true unless specified
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    // Note: The code doesn't set display=true by default in constructor,
    // it only reads from data. So default bool is false unless 'display' key exists with 'true'
    // However, looking at code: display is not initialized to true, so default is false for the bool
    // But the code says "Displayed events must have a button" suggesting display might default to true conceptually
    // Let me check - in constructor: no default set for display, so it's false by default
    expect(evt.display).toBe(true);
  });

  it('Event_DefaultTriggerIsEmpty', () => {
    const data = new Map<string, string>();
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    expect(evt.trigger).toBe('');
  });

  it('Event_SetsDynamicType', () => {
    const data = new Map<string, string>();
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    expect(evt.typeDynamic).toBe('Event');
  });

  it('Event_ChangeReference_UpdatesHeroListName', () => {
    const data = new Map<string, string>([['hero', 'OldHeroEvent']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    evt.changeReference('OldHeroEvent', 'NewHeroEvent');
    expect(evt.heroListName).toBe('NewHeroEvent');
  });

  it('Event_ChangeReference_UpdatesAddComponents', () => {
    const data = new Map<string, string>([['add', 'OldComponent NewComponent']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    evt.changeReference('OldComponent', 'RenamedComponent');
    expect(evt.addComponents[0]).toBe('RenamedComponent');
  });

  it('Event_ChangeReference_UpdatesRemoveComponents', () => {
    const data = new Map<string, string>([['remove', 'OldComponent KeepComponent']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    evt.changeReference('OldComponent', 'RenamedComponent');
    expect(evt.removeComponents[0]).toBe('RenamedComponent');
  });

  it('Event_ChangeReference_UpdatesTriggerForDefeated', () => {
    const data = new Map<string, string>([['trigger', 'DefeatedOldMonster']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    evt.changeReference('OldMonster', 'NewMonster');
    expect(evt.trigger).toBe('DefeatedNewMonster');
  });

  it('Event_ChangeReference_UpdatesTriggerForDefeatedUnique', () => {
    const data = new Map<string, string>([['trigger', 'DefeatedUniqueOldMonster']]);
    const evt = new QuestData.Event('Event1', data, 'test.ini', 10);
    evt.changeReference('OldMonster', 'NewMonster');
    expect(evt.trigger).toBe('DefeatedUniqueNewMonster');
  });

  it('Event_GenKeyFormatsCorrectly', () => {
    const data = new Map<string, string>();
    const evt = new QuestData.Event('EventTest', data, 'test.ini', 10);
    expect(evt.text_key).toBe('EventTest.text');
  });

  // Puzzle Tests

  it('Puzzle_ParsesPuzzleClass', () => {
    const data = new Map<string, string>([['class', 'code']]);
    const puzzle = new QuestData.Puzzle('Puzzle1', data, 'test.ini');
    expect(puzzle.puzzleClass).toBe('code');
  });

  it('Puzzle_DefaultPuzzleClassIsSlide', () => {
    const data = new Map<string, string>();
    const puzzle = new QuestData.Puzzle('Puzzle1', data, 'test.ini');
    expect(puzzle.puzzleClass).toBe('slide');
  });

  it('Puzzle_ParsesImageType', () => {
    const data = new Map<string, string>([['image', 'puzzles\\custom.png']]);
    const puzzle = new QuestData.Puzzle('Puzzle1', data, 'test.ini');
    expect(puzzle.imageType).toBe('puzzles/custom.png');
  });

  it('Puzzle_ParsesSkill', () => {
    const data = new Map<string, string>([['skill', '{lore}']]);
    const puzzle = new QuestData.Puzzle('Puzzle1', data, 'test.ini');
    expect(puzzle.skill).toBe('{lore}');
  });

  it('Puzzle_DefaultSkillIsObservation', () => {
    const data = new Map<string, string>();
    const puzzle = new QuestData.Puzzle('Puzzle1', data, 'test.ini');
    expect(puzzle.skill).toBe('{observation}');
  });

  it('Puzzle_ParsesPuzzleLevel', () => {
    const data = new Map<string, string>([['puzzlelevel', '6']]);
    const puzzle = new QuestData.Puzzle('Puzzle1', data, 'test.ini');
    expect(puzzle.puzzleLevel).toBe(6);
  });

  it('Puzzle_DefaultPuzzleLevelIs4', () => {
    const data = new Map<string, string>();
    const puzzle = new QuestData.Puzzle('Puzzle1', data, 'test.ini');
    expect(puzzle.puzzleLevel).toBe(4);
  });

  it('Puzzle_ParsesPuzzleAltLevel', () => {
    const data = new Map<string, string>([['puzzlealtlevel', '5']]);
    const puzzle = new QuestData.Puzzle('Puzzle1', data, 'test.ini');
    expect(puzzle.puzzleAltLevel).toBe(5);
  });

  it('Puzzle_DefaultPuzzleAltLevelIs3', () => {
    const data = new Map<string, string>();
    const puzzle = new QuestData.Puzzle('Puzzle1', data, 'test.ini');
    expect(puzzle.puzzleAltLevel).toBe(3);
  });

  it('Puzzle_ParsesPuzzleSolution', () => {
    const data = new Map<string, string>([['puzzlesolution', '1234']]);
    const puzzle = new QuestData.Puzzle('Puzzle1', data, 'test.ini');
    expect(puzzle.puzzleSolution).toBe('1234');
  });

  it('Puzzle_SetsDynamicType', () => {
    const data = new Map<string, string>();
    const puzzle = new QuestData.Puzzle('Puzzle1', data, 'test.ini');
    expect(puzzle.typeDynamic).toBe('Puzzle');
  });

  it('Puzzle_ToStringContainsClassWhenNotSlide', () => {
    const data = new Map<string, string>([['class', 'code']]);
    const puzzle = new QuestData.Puzzle('Puzzle1', data, 'test.ini');
    const result = puzzle.toString();
    expect(result.includes('class=code')).toBe(true);
  });

  it('Puzzle_ToStringOmitsClassWhenSlide', () => {
    const data = new Map<string, string>();
    const puzzle = new QuestData.Puzzle('Puzzle1', data, 'test.ini');
    const result = puzzle.toString();
    expect(result.includes('class=')).toBe(false);
  });

  // Door Tests (extends Event)

  it('Door_ParsesRotation', () => {
    const data = new Map<string, string>([['rotation', '90']]);
    const door = new QuestData.Door('Door1', data, null, 'test.ini');
    expect(door.rotation).toBe(90);
  });

  it('Door_ParsesColor', () => {
    const data = new Map<string, string>([['color', '#FF0000']]);
    const door = new QuestData.Door('Door1', data, null, 'test.ini');
    expect(door.colourName).toBe('#FF0000');
  });

  it('Door_DefaultColorIsWhite', () => {
    const data = new Map<string, string>();
    const door = new QuestData.Door('Door1', data, null, 'test.ini');
    expect(door.colourName).toBe('white');
  });

  it('Door_DefaultRotationIsZero', () => {
    const data = new Map<string, string>();
    const door = new QuestData.Door('Door1', data, null, 'test.ini');
    expect(door.rotation).toBe(0);
  });

  it('Door_IsCancelable', () => {
    const data = new Map<string, string>();
    const door = new QuestData.Door('Door1', data, null, 'test.ini');
    expect(door.cancelable).toBe(true);
  });

  it('Door_SetsDynamicType', () => {
    const data = new Map<string, string>();
    const door = new QuestData.Door('Door1', data, null, 'test.ini');
    expect(door.typeDynamic).toBe('Door');
  });

  it('Door_LocationSpecifiedIsTrue', () => {
    const data = new Map<string, string>();
    const door = new QuestData.Door('Door1', data, null, 'test.ini');
    expect(door.locationSpecified).toBe(true);
  });

  it('Door_ToStringContainsColorWhenNotWhite', () => {
    const data = new Map<string, string>([['color', 'red']]);
    const door = new QuestData.Door('Door1', data, null, 'test.ini');
    const result = door.toString();
    expect(result.includes('color=red')).toBe(true);
  });

  it('Door_ToStringOmitsColorWhenWhite', () => {
    const data = new Map<string, string>();
    const door = new QuestData.Door('Door1', data, null, 'test.ini');
    const result = door.toString();
    expect(result.includes('color=')).toBe(false);
  });

  // Token Tests (extends Event)

  it('Token_ParsesTokenName', () => {
    const data = new Map<string, string>([['type', 'TokenSearch']]);
    const token = new QuestData.Token('Token1', data, null, 'test.ini');
    expect(token.tokenName).toBe('TokenSearch');
  });

  it('Token_ParsesRotation', () => {
    const data = new Map<string, string>([['rotation', '45']]);
    const token = new QuestData.Token('Token1', data, null, 'test.ini');
    expect(token.rotation).toBe(45);
  });

  it('Token_DefaultTokenNameIsEmpty', () => {
    const data = new Map<string, string>();
    const token = new QuestData.Token('Token1', data, null, 'test.ini');
    expect(token.tokenName).toBe('');
  });

  it('Token_DefaultRotationIsZero', () => {
    const data = new Map<string, string>();
    const token = new QuestData.Token('Token1', data, null, 'test.ini');
    expect(token.rotation).toBe(0);
  });

  it('Token_IsCancelable', () => {
    const data = new Map<string, string>();
    const token = new QuestData.Token('Token1', data, null, 'test.ini');
    expect(token.cancelable).toBe(true);
  });

  it('Token_TestsIsNull', () => {
    // Tokens don't have conditions, so tests should be null
    const data = new Map<string, string>();
    const token = new QuestData.Token('Token1', data, null, 'test.ini');
    expect(token.tests).toBeNull();
  });

  it('Token_SetsDynamicType', () => {
    const data = new Map<string, string>();
    const token = new QuestData.Token('Token1', data, null, 'test.ini');
    expect(token.typeDynamic).toBe('Token');
  });

  it('Token_LocationSpecifiedIsTrue', () => {
    const data = new Map<string, string>();
    const token = new QuestData.Token('Token1', data, null, 'test.ini');
    expect(token.locationSpecified).toBe(true);
  });

  it('Token_ToStringContainsType', () => {
    const data = new Map<string, string>([['type', 'TokenExplore']]);
    const token = new QuestData.Token('Token1', data, null, 'test.ini');
    const result = token.toString();
    expect(result.includes('type=TokenExplore')).toBe(true);
  });

  it('Token_ParsesTokenSize', () => {
    const data = new Map<string, string>([['tokensize', '2x2']]);
    const token = new QuestData.Token('Token1', data, null, 'test.ini');
    expect(token.tokenSize).toBe('2x2');
  });

  it('Token_ParsesCustomImage', () => {
    const data = new Map<string, string>([['customImage', 'tokens/mytoken.png']]);
    const token = new QuestData.Token('Token1', data, null, 'test.ini');
    expect(token.customImage).toBe('tokens/mytoken.png');
  });

  it('Token_ParsesClickEffect', () => {
    const data = new Map<string, string>([['clickeffect', 'false']]);
    const token = new QuestData.Token('Token1', data, null, 'test.ini');
    expect(token.enableClick).toBe(false);
  });

  it('Token_ToStringContainsTokenSize', () => {
    const data = new Map<string, string>([['tokensize', '4x4']]);
    const token = new QuestData.Token('Token1', data, null, 'test.ini');
    const result = token.toString();
    expect(result.includes('tokensize=4x4')).toBe(true);
  });

  it('Token_ToStringContainsCustomImage', () => {
    const data = new Map<string, string>([['customImage', 'token.png']]);
    const token = new QuestData.Token('Token1', data, null, 'test.ini');
    const result = token.toString();
    expect(result.includes('customImage=token.png')).toBe(true);
  });

  it('Token_ToStringContainsClickEffectWhenFalse', () => {
    const data = new Map<string, string>([['clickeffect', 'false']]);
    const token = new QuestData.Token('Token1', data, null, 'test.ini');
    const result = token.toString();
    expect(result.includes('clickeffect=false')).toBe(true);
  });

  // UI Tests (extends Event)

  it('UI_ParsesImageName', () => {
    const data = new Map<string, string>([['image', 'ui\\button.png']]);
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.imageName).toBe('ui/button.png'); // backslash converted
  });

  it('UI_ParsesVerticalUnits', () => {
    const data = new Map<string, string>([['vunits', 'true']]);
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.verticalUnits).toBe(true);
  });

  it('UI_ParsesSize', () => {
    const data = new Map<string, string>([['size', '2.5']]);
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.size).toBeCloseTo(2.5, 3);
  });

  it('UI_ParsesTextSize', () => {
    const data = new Map<string, string>([['textsize', '1.5']]);
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.textSize).toBeCloseTo(1.5, 3);
  });

  it('UI_ParsesTextColor', () => {
    const data = new Map<string, string>([['textcolor', 'red']]);
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.textColor).toBe('red');
  });

  it('UI_ParsesTextBackgroundColor', () => {
    const data = new Map<string, string>([['textbackgroundcolor', 'black']]);
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.textBackgroundColor).toBe('black');
  });

  it('UI_ParsesHAlignLeft', () => {
    const data = new Map<string, string>([['halign', 'left']]);
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.hAlign).toBe(-1);
  });

  it('UI_ParsesHAlignRight', () => {
    const data = new Map<string, string>([['halign', 'right']]);
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.hAlign).toBe(1);
  });

  it('UI_ParsesVAlignTop', () => {
    const data = new Map<string, string>([['valign', 'top']]);
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.vAlign).toBe(-1);
  });

  it('UI_ParsesVAlignBottom', () => {
    const data = new Map<string, string>([['valign', 'bottom']]);
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.vAlign).toBe(1);
  });

  it('UI_ParsesTextAlignment', () => {
    const data = new Map<string, string>([['textAlignment', 'TOP']]);
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.textAlignment).toBe(TextAlignment.TOP);
  });

  it('UI_ParsesRichText', () => {
    const data = new Map<string, string>([['richText', 'true']]);
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.richText).toBe(true);
  });

  it('UI_ParsesBorder', () => {
    const data = new Map<string, string>([['border', 'true']]);
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.border).toBe(true);
  });

  it('UI_ParsesTextAspect', () => {
    const data = new Map<string, string>([['textaspect', '0.75']]);
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.aspect).toBeCloseTo(0.75, 3);
  });

  it('UI_DefaultImageNameIsEmpty', () => {
    const data = new Map<string, string>();
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.imageName).toBe('');
  });

  it('UI_DefaultSizeIs1', () => {
    const data = new Map<string, string>();
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.size).toBeCloseTo(1, 3);
  });

  it('UI_DefaultTextColorIsWhite', () => {
    const data = new Map<string, string>();
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.textColor).toBe('white');
  });

  it('UI_DefaultTextBackgroundColorIsTransparent', () => {
    const data = new Map<string, string>();
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.textBackgroundColor).toBe('transparent');
  });

  it('UI_DefaultHAlignIs0', () => {
    const data = new Map<string, string>();
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.hAlign).toBe(0);
  });

  it('UI_DefaultVAlignIs0', () => {
    const data = new Map<string, string>();
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.vAlign).toBe(0);
  });

  it('UI_DefaultTextAlignmentIsCenter', () => {
    const data = new Map<string, string>();
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.textAlignment).toBe(TextAlignment.CENTER);
  });

  it('UI_SetsDynamicType', () => {
    const data = new Map<string, string>();
    const ui = new QuestData.UI('UI1', data, null, 'test.ini');
    expect(ui.typeDynamic).toBe('UI');
  });

  it('UI_GenKeyFormatsCorrectly', () => {
    const data = new Map<string, string>();
    const ui = new QuestData.UI('UITest', data, null, 'test.ini');
    expect(ui.uitext_key).toBe('UITest.uitext');
  });

  // Spawn Tests (extends Event)

  it('Spawn_ParsesMonsterTypes', () => {
    const data = new Map<string, string>([['monster', 'Goblin Zombie Dragon']]);
    const spawn = new QuestData.Spawn('Spawn1', data, null, 'test.ini');
    expect(spawn.mTypes.length).toBe(3);
    expect(spawn.mTypes[0]).toBe('Goblin');
    expect(spawn.mTypes[1]).toBe('Zombie');
    expect(spawn.mTypes[2]).toBe('Dragon');
  });

  it('Spawn_ParsesTraitsRequired', () => {
    const data = new Map<string, string>([['traits', 'undead humanoid']]);
    const spawn = new QuestData.Spawn('Spawn1', data, null, 'test.ini');
    expect(spawn.mTraitsRequired.length).toBe(2);
    expect(spawn.mTraitsRequired[0]).toBe('undead');
    expect(spawn.mTraitsRequired[1]).toBe('humanoid');
  });

  it('Spawn_ParsesTraitsPool', () => {
    const data = new Map<string, string>([['traitpool', 'flying large']]);
    const spawn = new QuestData.Spawn('Spawn1', data, null, 'test.ini');
    expect(spawn.mTraitsPool.length).toBe(2);
    expect(spawn.mTraitsPool[0]).toBe('flying');
    expect(spawn.mTraitsPool[1]).toBe('large');
  });

  it('Spawn_ParsesUnique', () => {
    const data = new Map<string, string>([['unique', 'true']]);
    const spawn = new QuestData.Spawn('Spawn1', data, null, 'test.ini');
    expect(spawn.unique).toBe(true);
  });

  it('Spawn_ParsesActivated', () => {
    const data = new Map<string, string>([['activated', 'true']]);
    const spawn = new QuestData.Spawn('Spawn1', data, null, 'test.ini');
    expect(spawn.activated).toBe(true);
  });

  it('Spawn_ParsesUniqueHealthBase', () => {
    const data = new Map<string, string>([['uniquehealth', '50']]);
    const spawn = new QuestData.Spawn('Spawn1', data, null, 'test.ini');
    expect(spawn.uniqueHealthBase).toBeCloseTo(50, 3);
  });

  it('Spawn_ParsesUniqueHealthHero', () => {
    const data = new Map<string, string>([['uniquehealthhero', '10']]);
    const spawn = new QuestData.Spawn('Spawn1', data, null, 'test.ini');
    expect(spawn.uniqueHealthHero).toBeCloseTo(10, 3);
  });

  it('Spawn_DefaultMonsterTypesIsEmpty', () => {
    const data = new Map<string, string>();
    const spawn = new QuestData.Spawn('Spawn1', data, null, 'test.ini');
    expect(spawn.mTypes.length).toBe(0);
  });

  it('Spawn_DefaultUniqueIsFalse', () => {
    const data = new Map<string, string>();
    const spawn = new QuestData.Spawn('Spawn1', data, null, 'test.ini');
    expect(spawn.unique).toBe(false);
  });

  it('Spawn_DefaultActivatedIsFalse', () => {
    const data = new Map<string, string>();
    const spawn = new QuestData.Spawn('Spawn1', data, null, 'test.ini');
    expect(spawn.activated).toBe(false);
  });

  it('Spawn_SetsDynamicType', () => {
    const data = new Map<string, string>();
    const spawn = new QuestData.Spawn('Spawn1', data, null, 'test.ini');
    expect(spawn.typeDynamic).toBe('Spawn');
  });

  it('Spawn_GenKeyFormatsCorrectly', () => {
    const data = new Map<string, string>();
    const spawn = new QuestData.Spawn('SpawnTest', data, null, 'test.ini');
    expect(spawn.uniquetitle_key).toBe('SpawnTest.uniquetitle');
    expect(spawn.uniquetext_key).toBe('SpawnTest.uniquetext');
  });

  it('Spawn_ChangeReference_UpdatesMonsterTypes', () => {
    const data = new Map<string, string>([['monster', 'OldMonster NewMonster']]);
    const spawn = new QuestData.Spawn('Spawn1', data, null, 'test.ini');
    // Note: only renames if oldName doesn't start with "Monster"
    spawn.changeReference('OldMonster', 'RenamedMonster');
    expect(spawn.mTypes[0]).toBe('RenamedMonster');
  });

});
