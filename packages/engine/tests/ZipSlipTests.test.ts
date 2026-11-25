// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/ZipSlipTests.cs
// The malicious zip is built in memory with fflate instead of DotNetZip.
import { strToU8, zipSync } from 'fflate';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Directory, Extract_mode, File, Path, ValkyrieDebug, VirtualFileSystem, ZipManager, setFileSystem } from '../src/index.ts';

describe('ZipSlipTests', () => {
  let tempDir: string;
  let zipPath: string;
  let targetDir: string;

  beforeEach(() => {
    ValkyrieDebug.enabled = false;
    setFileSystem(new VirtualFileSystem());

    tempDir = Path.combine('/Temp/', 'ValkyrieZipSlipTests_' + crypto.randomUUID());
    Directory.createDirectory(tempDir);

    zipPath = Path.combine(tempDir, 'test.zip');
    targetDir = Path.combine(tempDir, 'extract');
    Directory.createDirectory(targetDir);

    // Create malicious zip: an entry that tries to write to the parent directory of targetDir
    File.writeAllBytes(zipPath, zipSync({ 'good.txt': strToU8('good'), '../evil.txt': strToU8('evil') }));
  });

  afterEach(() => {
    ValkyrieDebug.enabled = true;
  });

  it('ZipManager_ExtractFull_MitigatesZipSlip', () => {
    ZipManager.extract(targetDir, zipPath, Extract_mode.ZIPMANAGER_EXTRACT_FULL);

    expect(File.exists(Path.combine(targetDir, 'good.txt'))).toBe(true);
    expect(File.exists(Path.combine(tempDir, 'evil.txt'))).toBe(false);
  });
});
