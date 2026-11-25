// Not in Valkyrie (15 November 2026): a save that cannot be written keeps the reason (ZipManager.lastError), which
// SaveManager.lastSaveError gives the player; Valkyrie only logs it.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Directory, File, Path, ValkyrieDebug, VirtualFileSystem, ZipManager, setFileSystem } from '../src/index.ts';

describe('ZipManagerErrorTests', () => {
  let tempDir: string;

  beforeEach(() => {
    ValkyrieDebug.enabled = false;
    setFileSystem(new VirtualFileSystem());
    tempDir = '/Temp/ValkyrieZipManagerErrorTests';
    Directory.createDirectory(tempDir);
    File.writeAllText(Path.combine(tempDir, 'save.ini'), '[Quest]');
    File.writeAllBytes(Path.combine(tempDir, 'image.png'), new Uint8Array(0));
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
  });

  it('WriteZip_Fails_KeepsTheReason', () => {
    // The quest's folder is not there, so the save cannot copy it
    const written = ZipManager.writeZipAsync(tempDir, '/Temp/NoSuchQuest', Path.combine(tempDir, 'save1.vSave'), false);

    expect(written).toBe(false);
    expect(ZipManager.lastError).toContain('NoSuchQuest');
  });

  it('WriteZip_Succeeds_ForgetsTheLastReason', () => {
    ZipManager.writeZipAsync(tempDir, '/Temp/NoSuchQuest', Path.combine(tempDir, 'save1.vSave'), false);
    const quest = Path.combine(tempDir, 'quest');
    Directory.createDirectory(quest);
    File.writeAllText(Path.combine(quest, 'quest.ini'), '[Quest]');

    expect(ZipManager.writeZipAsync(tempDir, quest, Path.combine(tempDir, 'save1.vSave'), false)).toBe(true);
    expect(ZipManager.lastError).toBeNull();
  });
});
