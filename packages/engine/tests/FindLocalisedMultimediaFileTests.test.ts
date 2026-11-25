// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/FindLocalisedMultimediaFileTests.cs
// The temporary folder lives in a fresh virtual file system for each test.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { File, Path, Quest, ValkyrieDebug, VirtualFileSystem, setFileSystem } from '../src/index.ts';

describe('FindLocalisedMultimediaFileTests', () => {
  let _tempDir: string;

  beforeEach(() => {
    ValkyrieDebug.enabled = false;
    setFileSystem(new VirtualFileSystem());
    _tempDir = Path.combine('/Temp/', 'ValkyrieTestQuest_' + crypto.randomUUID().replace(/-/g, ''));
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
  });

  // --- Helpers ---

  function createFile(relativePath: string): void {
    File.writeAllText(Path.combine(_tempDir, relativePath), '');
  }

  function call(name: string, currentLang: string, fallbackLang: string | null, editMode = false): string {
    return Quest.findLocalisedMultimediaFile(name, _tempDir, currentLang, fallbackLang, editMode);
  }

  // --- Tests ---

  it('Returns_CurrentLanguagePath_WhenFileExistsThere', () => {
    createFile(Path.combine('German', 'Tile.png'));
    expect(call('Tile.png', 'German', 'English')).toBe(Path.combine(_tempDir, 'German', 'Tile.png'));
  });

  it('Returns_FallbackLanguagePath_WhenCurrentLangMissingButFallbackExists', () => {
    // only English version exists, current lang is German with English fallback
    createFile(Path.combine('English', 'Tile.png'));
    expect(call('Tile.png', 'German', 'English')).toBe(Path.combine(_tempDir, 'English', 'Tile.png'));
  });

  it('Returns_RootPath_WhenNoLanguageSubfolderFileExists', () => {
    // only root file exists
    createFile('Tile.png');
    expect(call('Tile.png', 'German', 'English')).toBe(Path.combine(_tempDir, 'Tile.png'));
  });

  it('Returns_RootPath_WhenNoFilesExistAtAll', () => {
    // returns the composed root path even if the file doesn't exist
    expect(call('Missing.png', 'German', 'English')).toBe(Path.combine(_tempDir, 'Missing.png'));
  });

  it('Returns_RootPath_WhenEditModeIsTrue_EvenIfLanguageFileExists', () => {
    // language file exists, but edit mode bypasses language lookup
    createFile(Path.combine('German', 'Tile.png'));
    expect(call('Tile.png', 'German', 'English', true)).toBe(Path.combine(_tempDir, 'Tile.png'));
  });

  it('CurrentLanguage_TakesPriority_OverFallbackLanguage', () => {
    // both lang files exist
    createFile(Path.combine('German', 'Tile.png'));
    createFile(Path.combine('English', 'Tile.png'));
    // current lang wins
    expect(call('Tile.png', 'German', 'English')).toBe(Path.combine(_tempDir, 'German', 'Tile.png'));
  });

  it('Returns_RootPath_WhenFallbackLangIsEmpty', () => {
    // English folder exists but fallback is empty
    createFile(Path.combine('English', 'Tile.png'));
    // no fallback check, goes to root
    expect(call('Tile.png', 'German', '')).toBe(Path.combine(_tempDir, 'Tile.png'));
  });

  it('Returns_RootPath_WhenFallbackLangEqualsCurrentLang', () => {
    // only the fallback folder exists but fallback == current
    createFile(Path.combine('German', 'Tile.png'));
    // Here current = French to avoid the currentLang hit, and fallback = French too
    // both steps skipped, returns root
    expect(call('Tile.png', 'French', 'French')).toBe(Path.combine(_tempDir, 'Tile.png'));
  });

  it('Returns_FallbackLanguagePath_WhenFallbackLangIsNull', () => {
    // only English folder exists
    createFile(Path.combine('English', 'Tile.png'));
    // null treated as empty, no fallback lookup
    expect(call('Tile.png', 'German', null)).toBe(Path.combine(_tempDir, 'Tile.png'));
  });

  it('Supports_RelativeSubfolderInName', () => {
    // image is in an images/ subdirectory within the language folder
    createFile(Path.combine('German', 'images', 'BgTile.png'));
    // name uses platform separator as produced by the ini parsing on this OS
    const name = Path.combine('images', 'BgTile.png');
    expect(call(name, 'German', 'English')).toBe(Path.combine(_tempDir, 'German', 'images', 'BgTile.png'));
  });

  it('Supports_LanguageFolderInsideSubfolder', () => {
    // image is in a subfolder and localized version is inside that subfolder (e.g. image/German/map.png)
    createFile(Path.combine('image', 'map.png'));
    createFile(Path.combine('image', 'German', 'map.png'));
    const name = Path.combine('image', 'map.png');
    // localized inside subfolder should be preferred over root
    expect(call(name, 'German', 'English')).toBe(Path.combine(_tempDir, 'image', 'German', 'map.png'));
  });

  it('Fallback_LanguageFolderInsideSubfolder_IsUsed_WhenCurrentMissing', () => {
    // only fallback localized version exists inside the subfolder
    createFile(Path.combine('image', 'English', 'map.png'));
    const name = Path.combine('image', 'map.png');
    // fallback inside subfolder should be returned
    expect(call(name, 'German', 'English')).toBe(Path.combine(_tempDir, 'image', 'English', 'map.png'));
  });

  it('EditMode_Ignores_LanguageFolderInsideSubfolder', () => {
    // localized version exists inside the subfolder but edit mode should bypass it
    createFile(Path.combine('image', 'German', 'map.png'));
    createFile(Path.combine('image', 'map.png'));
    const name = Path.combine('image', 'map.png');
    // edit mode returns root path
    expect(call(name, 'German', 'English', true)).toBe(Path.combine(_tempDir, 'image', 'map.png'));
  });
});
