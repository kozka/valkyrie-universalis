// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/UnitTests/Editor/RemoteContentPackTests.cs
import { describe, expect, it } from 'vitest';
import { RemoteContentPack } from '../src/Content/RemoteContentPack.ts';

describe('RemoteContentPackTests', () => {
  it('GetTitle_ReturnsUserLanguage_WhenAvailable', () => {
    const rcp = new RemoteContentPack('test', new Map());
    rcp.languages_name = new Map([
      ['English', 'Test Title'],
      ['German', 'Test Titel'],
    ]);

    expect(rcp.getTitle('German')).toBe('Test Titel');
  });

  it('GetTitle_ReturnsDefaultLanguage_WhenUserLanguageMissing', () => {
    const rcp = new RemoteContentPack('test', new Map());
    rcp.languages_name = new Map([['English', 'Test Title']]);

    expect(rcp.getTitle('German')).toBe('Test Title');
  });

  it('GetTitle_ReturnsFirstAvailable_WhenUserAndDefaultMissing', () => {
    const rcp = new RemoteContentPack('test', new Map());
    rcp.languages_name = new Map([['Spanish', 'Titulo de prueba']]);

    expect(rcp.getTitle('German')).toBe('Titulo de prueba');
  });

  it('GetTitle_ReturnsEmpty_WhenNoLanguages', () => {
    const rcp = new RemoteContentPack('test', new Map());
    rcp.languages_name = new Map();

    expect(rcp.getTitle('German')).toBe('');
  });

  it('GetDescription_ReturnsUserLanguage_WhenAvailable', () => {
    const rcp = new RemoteContentPack('test', new Map());
    rcp.languages_description = new Map([
      ['English', 'Description'],
      ['German', 'Beschreibung'],
    ]);

    expect(rcp.getDescription('German')).toBe('Beschreibung');
  });
});
