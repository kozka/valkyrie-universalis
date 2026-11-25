// How tough a monster that comes is (src/play/epicSpawn.ts): by health in Mansions, by traits in Descent, by name in DooM.
import { describe, expect, it } from 'vitest';
import { epicTier, type EpicMonster } from '../src/play/epicSpawn.ts';

const mom = (healthBase: number, healthPerHero: number, unique = false): EpicMonster => ({ game: 'MoM', sectionName: 'MonsterX', healthBase, healthPerHero, traits: [], unique });
const d2e = (sectionName: string, traits: string[], unique = false): EpicMonster => ({ game: 'D2E', sectionName, healthBase: 5, healthPerHero: 0, traits, unique });

describe('epicTier', () => {
  it('goes by health for two investigators in Mansions', () => {
    expect(epicTier(mom(2, 1))).toBe(0); // a cultist or a zombie
    expect(epicTier(mom(4, 2))).toBe(1); // a shoggoth, 8
    expect(epicTier(mom(6, 2))).toBe(2); // a dimensional shambler, 10
    expect(epicTier(mom(8, 4))).toBe(3); // a cult leader, 16
    expect(epicTier(mom(48, 1))).toBe(3); // the formless spawn
  });

  it('makes a unique monster one higher, up to 3', () => {
    expect(epicTier(mom(2, 1, true))).toBe(1);
    expect(epicTier(mom(8, 4, true))).toBe(3);
  });

  it('goes by traits in Descent', () => {
    expect(epicTier(d2e('MonsterGoblinArcher', ['small', 'cave']))).toBe(0);
    expect(epicTier(d2e('MonsterEttin', ['huge', 'cave']))).toBe(2);
    expect(epicTier(d2e('MonsterSplig', ['Lieutenant']))).toBe(3);
  });

  it("goes by name in DooM, a custom monster by the one it is made from", () => {
    expect(epicTier(d2e('MonsterImp', ['Doom']))).toBe(0);
    expect(epicTier(d2e('MonsterPinky', ['Doom']))).toBe(1);
    expect(epicTier(d2e('MonsterBaron_of_Hell', ['Doom']))).toBe(2);
    expect(epicTier({ ...d2e('CustomMonsterBoss', ['Doom']), derivedType: 'MonsterCyberDemon' })).toBe(3);
  });
});
