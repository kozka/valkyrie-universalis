// Tests for the virtual file system that stands in for System.IO (not ported from Valkyrie).
import { strToU8, zipSync } from 'fflate';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  Directory,
  Extract_mode,
  File,
  Path,
  SearchOption,
  VirtualFileSystem,
  ZipManager,
  fileSystem,
  setFileSystem,
  type CaseMismatch,
  type FileSystemChange,
} from '../../src/index.ts';

describe('VirtualFileSystem', () => {
  beforeEach(() => {
    setFileSystem(new VirtualFileSystem());
  });

  it('looks files up ignoring letter case and reports the mismatch', () => {
    File.writeAllText('/Quest/Images/Cover.PNG', 'x');
    const mismatches: CaseMismatch[] = [];
    fileSystem().onCaseMismatch((m) => mismatches.push(m));
    expect(File.exists('/quest/images/cover.png')).toBe(true);
    expect(mismatches).toEqual([{ requested: '/quest/images/cover.png', actual: '/Quest/Images/Cover.PNG' }]);
  });

  it('accepts backslashes, doubled separators and dot segments', () => {
    File.writeAllText('/Temp/Valkyrie/Pack/eventsfixed.ini', '[EventStart]');
    expect(File.exists('/Temp/Valkyrie/Pack/Sub/Quest/../../eventsfixed.ini')).toBe(true);
    expect(File.exists('\\Temp\\Valkyrie\\Pack\\.\\eventsfixed.ini')).toBe(true);
    expect(File.exists('/Temp/Valkyrie/Pack/Sub/Quest/../..//eventsfixed.ini')).toBe(true);
  });

  it('reads text as StreamReader does: BOM removed, CR, LF and CRLF lines', () => {
    File.writeAllBytes('/a.txt', new Uint8Array([0xef, 0xbb, 0xbf, 0x61, 0x0d, 0x0a, 0x62, 0x0d, 0x63, 0x0a, 0x64, 0x0a]));
    expect(File.readAllText('/a.txt')).toBe('a\r\nb\rc\nd\n');
    expect(File.readAllLines('/a.txt')).toEqual(['a', 'b', 'c', 'd']);
  });

  it('keeps a second byte order mark, as .NET does', () => {
    File.writeAllBytes('/b.txt', new Uint8Array([0xef, 0xbb, 0xbf, 0xef, 0xbb, 0xbf, 0x61]));
    expect(File.readAllText('/b.txt')).toBe('﻿a');
  });

  it('decodes UTF-16 files marked with a BOM', () => {
    File.writeAllBytes('/c.txt', new Uint8Array([0xff, 0xfe, 0x61, 0x00, 0x0a, 0x00, 0x62, 0x00]));
    expect(File.readAllLines('/c.txt')).toEqual(['a', 'b']);
  });

  it('lists files depth first with wildcards, ignoring case', () => {
    File.writeAllText('/content/MoM/base/content_pack.ini', '');
    File.writeAllText('/content/MoM/btt/content_pack.ini', '');
    File.writeAllText('/content/MoM/base/tiles.ini', '');
    expect(Directory.getFiles('/content', 'CONTENT_PACK.INI', SearchOption.AllDirectories)).toEqual([
      '/content/MoM/base/content_pack.ini',
      '/content/MoM/btt/content_pack.ini',
    ]);
    expect(Directory.getFiles('/content/MoM/base', '*.ini')).toEqual(['/content/MoM/base/content_pack.ini', '/content/MoM/base/tiles.ini']);
  });

  it('answers for files of a virtual tree it cannot list', () => {
    fileSystem().mountVirtualTree('/AppData/Valkyrie/MoM/import', (relative) => relative.endsWith('.dds'));
    expect(File.exists('/AppData/Valkyrie/MoM/import/img/MAD20.dds')).toBe(true);
    expect(File.exists('/AppData/Valkyrie/MoM/import/img/MAD20')).toBe(false);
    expect(Directory.exists('/AppData/Valkyrie/MoM/import/img')).toBe(true);
  });

  it('reads the contents a virtual tree gives for a file', () => {
    fileSystem().mountVirtualTree(
      '/AppData/Valkyrie/MoM/import',
      (relative) => relative.endsWith('.dds'),
      (relative) => new TextEncoder().encode(relative),
    );
    expect(File.readAllText('/AppData/Valkyrie/MoM/import/img/MAD20.dds')).toBe('img/MAD20.dds');
    expect(File.readAllBytes('/AppData/Valkyrie/MoM/import/img/MAD20.dds').length).toBe('img/MAD20.dds'.length);
  });

  it('reports writes and deletions with the stored letter case', () => {
    const vfs = fileSystem() as VirtualFileSystem;
    File.writeAllText('/AppData/Valkyrie/Config.ini', 'a');
    const changes: FileSystemChange[] = [];
    vfs.onChange((c) => changes.push(c));
    File.writeAllText('/appdata/valkyrie/config.ini', 'b');
    File.writeAllText('/AppData/Valkyrie/Download/Quest.valkyrie', 'c');
    File.delete('/APPDATA/VALKYRIE/CONFIG.INI');
    Directory.delete('/appdata/valkyrie/download', true);
    expect(changes).toEqual([
      { kind: 'write', path: '/AppData/Valkyrie/Config.ini' },
      { kind: 'write', path: '/AppData/Valkyrie/Download/Quest.valkyrie' },
      { kind: 'delete-file', path: '/AppData/Valkyrie/Config.ini' },
      { kind: 'delete-directory', path: '/AppData/Valkyrie/Download' },
    ]);
  });

  it('mounts a zip and inflates an entry only when read', () => {
    File.writeAllBytes(
      '/Download/Quest.valkyrie',
      zipSync({ 'quest.ini': strToU8('[Quest]\nformat=21'), 'Sub\\quest.ini': strToU8('[Quest]') }),
    );
    ZipManager.extract('/Temp/Valkyrie/Quest.valkyrie', '/Download/Quest.valkyrie', Extract_mode.ZIPMANAGER_EXTRACT_FULL);
    expect(File.readAllLines('/Temp/Valkyrie/Quest.valkyrie/quest.ini')).toEqual(['[Quest]', 'format=21']);
    expect(File.exists(Path.combine('/Temp/Valkyrie/Quest.valkyrie', 'Sub', 'quest.ini'))).toBe(true);
  });

  it('extracts only quest.ini and localization files in the partial mode', () => {
    File.writeAllBytes(
      '/Download/Quest.valkyrie',
      zipSync({
        'quest.ini': strToU8('[Quest]\nimage=cover.png'),
        'Localization.English.txt': strToU8('.,English'),
        'cover.png': new Uint8Array([1]),
        'tiles.ini': strToU8('[Tile1]'),
      }),
    );
    ZipManager.extract('/Temp/Q', '/Download/Quest.valkyrie', Extract_mode.ZIPMANAGER_EXTRACT_INI_TXT_PIC);
    expect(Directory.getFiles('/Temp/Q')).toEqual(['/Temp/Q/cover.png', '/Temp/Q/Localization.English.txt', '/Temp/Q/quest.ini']);
    // Inflated at once, so that the archive need not stay in memory for them (the app reads it from storage to list it)
    for (const file of Directory.getFiles('/Temp/Q')) expect(fileSystem().fileSource(file)).toBeInstanceOf(Uint8Array);
    File.delete('/Download/Quest.valkyrie');
    expect(File.readAllText('/Temp/Q/quest.ini')).toBe('[Quest]\nimage=cover.png');
  });

  it('keeps a partial extraction inside its folder, as the full one (not in Valkyrie)', () => {
    File.writeAllBytes('/AppData/Valkyrie/MoM/Save/save1.vSave', strToU8('save'));
    File.writeAllBytes(
      '/Download/Evil.valkyrie',
      zipSync({
        'quest.ini': strToU8('[Quest]\nimage=../../AppData/Valkyrie/MoM/Save/save1.vSave'),
        '../../AppData/Valkyrie/MoM/Save/save1.vSave': strToU8('overwritten'),
        '../Other/quest.ini': strToU8('[Quest]'),
      }),
    );
    ZipManager.extract('/Temp/Q', '/Download/Evil.valkyrie', Extract_mode.ZIPMANAGER_EXTRACT_INI_TXT_PIC);
    expect(File.readAllText('/AppData/Valkyrie/MoM/Save/save1.vSave')).toBe('save');
    expect(File.exists('/Temp/Other/quest.ini')).toBe(false);
    expect(File.exists('/Temp/Q/quest.ini')).toBe(true);
  });
});
