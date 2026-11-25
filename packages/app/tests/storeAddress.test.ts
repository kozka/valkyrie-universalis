// Tests of the addresses the browser reads the store from (host/storeAddress.ts). Not ported from Valkyrie.
import { describe, expect, it } from 'vitest';
import { readableUrl } from '../src/host/storeAddress.ts';

describe('readableUrl', () => {
  it('keeps GitHub addresses as the store lists them', () => {
    const url = 'https://raw.githubusercontent.com/NPBruce/valkyrie-questdata/master/scenarios/MoM/ExoticMaterial/ExoticMaterial.valkyrie';
    expect(readableUrl(url)).toBe(url);
  });

  it('reads a GitLab raw file through the repository files API, which sends CORS headers', () => {
    expect(readableUrl('https://gitlab.com/scrubbless/strainonreality/-/raw/main/StrainOnReality.valkyrie')).toBe(
      'https://gitlab.com/api/v4/projects/scrubbless%2Fstrainonreality/repository/files/StrainOnReality.valkyrie/raw?ref=main',
    );
  });

  it('encodes the folders and spaces of a GitLab path once', () => {
    expect(readableUrl('https://gitlab.com/group/sub/project/-/raw/master/covers/my%20cover.png')).toBe(
      'https://gitlab.com/api/v4/projects/group%2Fsub%2Fproject/repository/files/covers%2Fmy%20cover.png/raw?ref=master',
    );
  });
});
