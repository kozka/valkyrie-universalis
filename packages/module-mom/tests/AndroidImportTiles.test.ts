// Not ported from Valkyrie, which halves MoM's pixels per square on Android: the web halves them for the tiles of an
// import made on Android (PVR pictures, with half the pixels of the computer's), and keeps the desktop scale for every
// other picture, the scenarios' own included.
import { beforeEach, describe, expect, it } from 'vitest';
import { File, VirtualFileSystem, setFileSystem } from '@universalis/engine';
import { MoMGameType } from '../src/index.ts';

describe('MoMGameType.tilePixelPerSquare of a picture', () => {
  beforeEach(() => {
    setFileSystem(new VirtualFileSystem());
    File.writeAllText('/AppData/Valkyrie/MoM/import/img/Tile_Android.pvr', '');
    File.writeAllText('/AppData/Valkyrie/MoM/import/img/Tile_Computer.dds', '');
  });

  it('halves them for a tile of an import made on Android, as Valkyrie on Android', () => {
    expect(new MoMGameType().tilePixelPerSquare('/AppData/Valkyrie/MoM/import/img/Tile_Android')).toBe(Math.fround(512 / 3.5));
  });

  it('keeps the desktop scale for a tile of an import made on a computer, and for any other picture', () => {
    const gameType = new MoMGameType();
    expect(gameType.tilePixelPerSquare('/AppData/Valkyrie/MoM/import/img/Tile_Computer')).toBe(Math.fround(1024 / 3.5));
    expect(gameType.tilePixelPerSquare('/Scenario/custom_tile.png')).toBe(Math.fround(1024 / 3.5));
    expect(gameType.tilePixelPerSquare()).toBe(Math.fround(1024 / 3.5));
  });
});
