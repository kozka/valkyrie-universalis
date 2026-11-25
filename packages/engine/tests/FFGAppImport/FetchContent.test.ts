// Tests of whether an official import is needed (FFGImport.NeedImport and FetchContent's version checks), written from
// the C#, which has no NUnit tests. Not ported from Valkyrie.
import { beforeEach, describe, expect, it } from 'vitest';
import { FetchContent, FFGImport, File, VirtualFileSystem, setFileSystem } from '../../src/index.ts';

const APP_DATA = '/AppData/Valkyrie/';

function writeImportLog(type: string, lines: string[]): void {
  File.writeAllText(`${APP_DATA}${type}/import/import.ini`, lines.join('\r\n'));
}

describe('FFGImport.needImport', () => {
  beforeEach(() => {
    setFileSystem(new VirtualFileSystem());
  });

  it('needs an import when there is no import log', () => {
    expect(new FFGImport('MoM', APP_DATA).needImport()).toBe(true);
  });

  it('takes an import of this version of Valkyrie from a recent enough app', () => {
    writeImportLog('MoM', ['[Import]', 'Valkyrie=2', 'FFG=2.0.3']);
    expect(new FFGImport('MoM', APP_DATA).needImport()).toBe(false);
  });

  it('needs the import again after another version of Valkyrie made it', () => {
    writeImportLog('MoM', ['[Import]', 'Valkyrie=1', 'FFG=2.0.3']);
    expect(new FFGImport('MoM', APP_DATA).needImport()).toBe(true);
    writeImportLog('MoM', ['[Import]', 'FFG=2.0.3']);
    expect(new FFGImport('MoM', APP_DATA).needImport()).toBe(true);
  });

  it('needs the import again from an app older than the one each game requires', () => {
    writeImportLog('MoM', ['[Import]', 'Valkyrie=2', 'FFG=1.4.9']);
    expect(new FFGImport('MoM', APP_DATA).needImport()).toBe(true);
    // Descent's Road to Legend must be 1.5.2 or newer
    writeImportLog('D2E', ['[Import]', 'Valkyrie=2', 'FFG=1.5.1']);
    expect(new FFGImport('D2E', APP_DATA).needImport()).toBe(true);
    writeImportLog('D2E', ['[Import]', 'Valkyrie=2', 'FFG=1.5.2']);
    expect(new FFGImport('D2E', APP_DATA).needImport()).toBe(false);
  });

  it('needs the import when the log does not name the app version', () => {
    writeImportLog('MoM', ['[Import]', 'Valkyrie=2']);
    expect(new FFGImport('MoM', APP_DATA).needImport()).toBe(true);
  });

  it('keeps the import in the game folder of the user data', () => {
    expect(new FFGImport('D2E', APP_DATA).path).toBe('/AppData/Valkyrie/D2E/import');
  });
});

describe('FetchContent version checks', () => {
  it('counts a version with as many parts as newer or equal by their numbers', () => {
    expect(FetchContent.versionNewerOrEqual('1.5.0', '1.5.0')).toBe(true);
    expect(FetchContent.versionNewerOrEqual('1.5.0', '1.10.0')).toBe(true);
    expect(FetchContent.versionNewerOrEqual('1.5.0', '1.4.12')).toBe(false);
  });

  it('counts any version with another number of parts as newer', () => {
    expect(FetchContent.versionNewer('1.5.0', '1.0')).toBe(true);
    expect(FetchContent.versionNewer('1.5.0', '0.9.9.9')).toBe(true);
  });

  it('counts a part without digits as newer, and an empty version as not newer', () => {
    expect(FetchContent.versionNewer('1.5.0', '1.x.0')).toBe(true);
    expect(FetchContent.versionNewer('1.5.0', '')).toBe(false);
    expect(FetchContent.versionNewer('', '1.5.0')).toBe(true);
  });
});
