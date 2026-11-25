// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/AdditionalCoverageTests.cs
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CommonStringKeys, ContentPack, LocalizationRead, ManifestManager, Quest, ValkyrieConstants, ValkyrieDebug } from '../src/index.ts';

/**
 * Unit tests for additional coverage on utility classes:
 * ValkyrieConstants, CommonStringKeys, ContentPack, ManifestManager, and related classes.
 */
describe('AdditionalCoverageTests', () => {
  beforeEach(() => {
    // Disable ValkyrieDebug to prevent Unity logging during tests
    ValkyrieDebug.enabled = false;

    // Initialize LocalizationRead dictionaries for StringKey tests
    LocalizationRead.dicts.set('val', null);
    LocalizationRead.dicts.set('qst', null);
    LocalizationRead.dicts.set('ffg', null);
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
    LocalizationRead.dicts.clear();
  });

  // ValkyrieConstants Tests

  it('ValkyrieConstants_TypeMom_HasCorrectValue', () => {
    expect(ValkyrieConstants.typeMom).toBe('MoM');
  });

  it('ValkyrieConstants_TypeDescent_HasCorrectValue', () => {
    expect(ValkyrieConstants.typeDescent).toBe('D2E');
  });

  it('ValkyrieConstants_DefaultLanguage_IsEnglish', () => {
    expect(ValkyrieConstants.DefaultLanguage).toBe('English');
  });

  it('ValkyrieConstants_CustomCategoryLabel_HasCorrectValue', () => {
    expect(ValkyrieConstants.customCategoryLabel).toBe('Custom');
  });

  it('ValkyrieConstants_CustomCategoryName_HasCorrectValue', () => {
    expect(ValkyrieConstants.customCategoryName).toBe('Custom');
  });

  it('ValkyrieConstants_ScenarioDownloadContainerExtension_HasCorrectValue', () => {
    expect(ValkyrieConstants.ScenarioDownloadContainerExtension).toBe('.valkyrie');
  });

  it('ValkyrieConstants_ContentPackDownloadContainerExtensionAllFileReference_HasCorrectValue', () => {
    expect(ValkyrieConstants.ContentPackDownloadContainerExtensionAllFileReference).toBe('*.valkyrie');
  });

  it('ValkyrieConstants_ContentPackDownloadContainerExtension_HasCorrectValue', () => {
    expect(ValkyrieConstants.ContentPackDownloadContainerExtension).toBe('.valkyrieContentPack');
  });

  it('ValkyrieConstants_ScenarioManifestPath_HasCorrectValue', () => {
    expect(ValkyrieConstants.ScenarioManifestPath).toBe('/manifest.ini');
  });

  it('ValkyrieConstants_ContentPackManifestPath_HasCorrectValue', () => {
    expect(ValkyrieConstants.ContentPackManifestPath).toBe('/manifest.ini');
  });

  it('ValkyrieConstants_QuestIniFilePath_HasCorrectValue', () => {
    expect(ValkyrieConstants.QuestIniFilePath).toBe('/quest.ini');
  });

  it('ValkyrieConstants_RemoteContentPackIniType_HasCorrectValue', () => {
    expect(ValkyrieConstants.RemoteContentPackIniType).toBe('RemoteContentPack');
  });

  it('ValkyrieConstants_ContentPackIniFile_HasCorrectValue', () => {
    expect(ValkyrieConstants.ContentPackIniFile).toBe('content_pack.ini');
  });

  it('ValkyrieConstants_Instance_ReturnsSingletonInstance', () => {
    // Act
    const instance1 = ValkyrieConstants.instance;
    const instance2 = ValkyrieConstants.instance;

    // Assert
    expect(instance1).not.toBeNullable();
    expect(instance1).toBe(instance2);
  });

  // CommonStringKeys Tests

  it('CommonStringKeys_BACK_HasCorrectDict', () => {
    expect(CommonStringKeys.BACK.dict).toBe('val');
    expect(CommonStringKeys.BACK.key).toBe('BACK');
  });

  it('CommonStringKeys_CLOSE_HasCorrectDict', () => {
    expect(CommonStringKeys.CLOSE.dict).toBe('val');
    expect(CommonStringKeys.CLOSE.key).toBe('CLOSE');
  });

  it('CommonStringKeys_EXIT_HasCorrectDict', () => {
    expect(CommonStringKeys.EXIT.dict).toBe('val');
    expect(CommonStringKeys.EXIT.key).toBe('EXIT');
  });

  it('CommonStringKeys_OK_HasCorrectDict', () => {
    expect(CommonStringKeys.OK.dict).toBe('val');
    expect(CommonStringKeys.OK.key).toBe('OK');
  });

  it('CommonStringKeys_CANCEL_HasCorrectDict', () => {
    expect(CommonStringKeys.CANCEL.dict).toBe('val');
    expect(CommonStringKeys.CANCEL.key).toBe('CANCEL');
  });

  it('CommonStringKeys_CONTINUE_HasCorrectDict', () => {
    expect(CommonStringKeys.CONTINUE.dict).toBe('val');
    expect(CommonStringKeys.CONTINUE.key).toBe('CONTINUE');
  });

  it('CommonStringKeys_PLUS_IsLiteralSymbol', () => {
    // PLUS has null dict and is a literal
    expect(CommonStringKeys.PLUS.dict).toBeNull();
    expect(CommonStringKeys.PLUS.key).toBe('+');
  });

  it('CommonStringKeys_MINUS_IsLiteralSymbol', () => {
    // MINUS has null dict and is a literal
    expect(CommonStringKeys.MINUS.dict).toBeNull();
    expect(CommonStringKeys.MINUS.key).toBe('-');
  });

  it('CommonStringKeys_HASH_IsLiteralSymbol', () => {
    // HASH has null dict and is a literal
    expect(CommonStringKeys.HASH.dict).toBeNull();
    expect(CommonStringKeys.HASH.key).toBe('#');
  });

  it('CommonStringKeys_TRUE_HasCorrectDict', () => {
    expect(CommonStringKeys.TRUE.dict).toBe('val');
    expect(CommonStringKeys.TRUE.key).toBe('TRUE');
  });

  it('CommonStringKeys_FALSE_HasCorrectDict', () => {
    expect(CommonStringKeys.FALSE.dict).toBe('val');
    expect(CommonStringKeys.FALSE.key).toBe('FALSE');
  });

  it('CommonStringKeys_QUEST_HasCorrectDict', () => {
    expect(CommonStringKeys.QUEST.dict).toBe('val');
    expect(CommonStringKeys.QUEST.key).toBe('QUEST');
  });

  it('CommonStringKeys_DELETE_HasCorrectDict', () => {
    expect(CommonStringKeys.DELETE.dict).toBe('val');
    expect(CommonStringKeys.DELETE.key).toBe('DELETE');
  });

  it('CommonStringKeys_LOG_HasCorrectDict', () => {
    expect(CommonStringKeys.LOG.dict).toBe('val');
    expect(CommonStringKeys.LOG.key).toBe('LOG');
  });

  // ContentPack Tests

  it('ContentPack_DefaultConstruction_AllFieldsAreNull', () => {
    // Arrange & Act
    const contentPack = new ContentPack();

    // Assert
    expect(contentPack.name).toBeNull();
    expect(contentPack.image).toBeNull();
    expect(contentPack.description).toBeNull();
    expect(contentPack.id).toBeNull();
    expect(contentPack.type).toBeNull();
    expect(contentPack.iniFiles).toBeNull();
    expect(contentPack.localizationFiles).toBeNull();
    expect(contentPack.clone).toBeNull();
  });

  it('ContentPack_SetName_StoresCorrectly', () => {
    const contentPack = new ContentPack();
    contentPack.name = 'Test Pack';
    expect(contentPack.name).toBe('Test Pack');
  });

  it('ContentPack_SetImage_StoresCorrectly', () => {
    const contentPack = new ContentPack();
    contentPack.image = 'pack_image.png';
    expect(contentPack.image).toBe('pack_image.png');
  });

  it('ContentPack_SetDescription_StoresCorrectly', () => {
    const contentPack = new ContentPack();
    contentPack.description = 'This is a test content pack';
    expect(contentPack.description).toBe('This is a test content pack');
  });

  it('ContentPack_SetId_StoresCorrectly', () => {
    const contentPack = new ContentPack();
    contentPack.id = 'test_pack_001';
    expect(contentPack.id).toBe('test_pack_001');
  });

  it('ContentPack_SetType_StoresCorrectly', () => {
    const contentPack = new ContentPack();
    contentPack.type = 'MoM';
    expect(contentPack.type).toBe('MoM');
  });

  it('ContentPack_SetIniFiles_StoresCorrectly', () => {
    // Arrange
    const contentPack = new ContentPack();
    const iniFiles = ['file1.ini', 'file2.ini', 'file3.ini'];

    // Act
    contentPack.iniFiles = iniFiles;

    // Assert
    expect(contentPack.iniFiles).not.toBeNullable();
    expect(contentPack.iniFiles.length).toBe(3);
    expect(contentPack.iniFiles[0]).toBe('file1.ini');
  });

  it('ContentPack_SetLocalizationFiles_StoresCorrectly', () => {
    // Arrange
    const contentPack = new ContentPack();
    const locFiles = new Map<string, string[]>([
      ['English', ['en_strings.txt']],
      ['German', ['de_strings.txt']],
    ]);

    // Act
    contentPack.localizationFiles = locFiles;

    // Assert
    expect(contentPack.localizationFiles).not.toBeNullable();
    expect(contentPack.localizationFiles.size).toBe(2);
    expect(contentPack.localizationFiles.has('English')).toBe(true);
    expect(contentPack.localizationFiles.has('German')).toBe(true);
  });

  it('ContentPack_SetClone_StoresCorrectly', () => {
    // Arrange
    const contentPack = new ContentPack();
    const cloneList = ['base_pack_1', 'base_pack_2'];

    // Act
    contentPack.clone = cloneList;

    // Assert
    expect(contentPack.clone).not.toBeNullable();
    expect(contentPack.clone.length).toBe(2);
    expect(contentPack.clone[0]).toBe('base_pack_1');
  });

  it('ContentPack_FullyPopulated_AllFieldsAccessible', () => {
    // Arrange & Act (a C# object initializer)
    const contentPack = Object.assign(new ContentPack(), {
      name: 'Full Pack',
      image: 'full.png',
      description: 'A fully populated pack',
      id: 'full_001',
      type: 'D2E',
      iniFiles: ['data.ini'],
      localizationFiles: new Map<string, string[]>([['English', ['en.txt']]]),
      clone: ['base'],
    });

    // Assert
    expect(contentPack.name).toBe('Full Pack');
    expect(contentPack.image).toBe('full.png');
    expect(contentPack.description).toBe('A fully populated pack');
    expect(contentPack.id).toBe('full_001');
    expect(contentPack.type).toBe('D2E');
    expect(contentPack.iniFiles.length).toBe(1);
    expect(contentPack.localizationFiles.size).toBe(1);
    expect(contentPack.clone.length).toBe(1);
  });

  // ManifestManager Tests

  it('ManifestManager_Constructor_SetsPath', () => {
    const manager = new ManifestManager('/test/path');
    expect(manager.path).toBe('/test/path');
  });

  it('ManifestManager_GetLocalQuestManifestIniData_NullPath_ThrowsException', () => {
    const manager = new ManifestManager(null);
    expect(() => manager.getLocalQuestManifestIniData()).toThrow(/^ArgumentNullException/);
  });

  it('ManifestManager_GetLocalQuestManifestIniData_EmptyPath_ThrowsException', () => {
    const manager = new ManifestManager('');
    expect(() => manager.getLocalQuestManifestIniData()).toThrow(/^ArgumentNullException/);
  });

  it('ManifestManager_GetLocalQuestManifestIniData_WhitespacePath_ThrowsException', () => {
    const manager = new ManifestManager('   ');
    expect(() => manager.getLocalQuestManifestIniData()).toThrow(/^ArgumentNullException/);
  });

  it('ManifestManager_GetLocalQuestManifestIniData_NonExistentPath_ReturnsEmptyIniData', () => {
    // Arrange
    const manager = new ManifestManager('/nonexistent/path/that/does/not/exist');

    // Act
    const result = manager.getLocalQuestManifestIniData();

    // Should return empty IniData when file doesn't exist
    expect(result).not.toBeNullable();
  });

  it('ManifestManager_GetLocalContentPackManifestIniData_NullPath_ThrowsException', () => {
    const manager = new ManifestManager(null);
    expect(() => manager.getLocalContentPackManifestIniData()).toThrow(/^ArgumentNullException/);
  });

  it('ManifestManager_GetLocalContentPackManifestIniData_EmptyPath_ThrowsException', () => {
    const manager = new ManifestManager('');
    expect(() => manager.getLocalContentPackManifestIniData()).toThrow(/^ArgumentNullException/);
  });

  it('ManifestManager_GetLocalContentPackManifestIniData_NonExistentPath_ReturnsEmptyIniData', () => {
    // Arrange
    const manager = new ManifestManager('/nonexistent/content/path');

    // Act
    const result = manager.getLocalContentPackManifestIniData();

    // Should return empty IniData when file doesn't exist
    expect(result).not.toBeNullable();
  });

  // Quest.InArray Static Method Tests

  it('Quest_InArray_ItemExists_ReturnsTrue', () => {
    const array = ['apple', 'banana', 'cherry'];
    const result = Quest.inArray(array, 'banana');
    expect(result).toBe(true);
  });

  it('Quest_InArray_ItemNotExists_ReturnsFalse', () => {
    const array = ['apple', 'banana', 'cherry'];
    const result = Quest.inArray(array, 'grape');
    expect(result).toBe(false);
  });

  it('Quest_InArray_EmptyArray_ReturnsFalse', () => {
    const array: string[] = [];
    const result = Quest.inArray(array, 'apple');
    expect(result).toBe(false);
  });

  it('Quest_InArray_FirstItem_ReturnsTrue', () => {
    const array = ['first', 'second', 'third'];
    const result = Quest.inArray(array, 'first');
    expect(result).toBe(true);
  });

  it('Quest_InArray_LastItem_ReturnsTrue', () => {
    const array = ['first', 'second', 'third'];
    const result = Quest.inArray(array, 'third');
    expect(result).toBe(true);
  });

  it('Quest_InArray_CaseSensitive_ReturnsFalseForDifferentCase', () => {
    const array = ['Apple', 'Banana', 'Cherry'];
    const result = Quest.inArray(array, 'apple');
    expect(result).toBe(false);
  });
});
