// When the menus' own music and sounds play (audio/menuSchedule.ts). Not ported from Valkyrie.
import { describe, expect, it } from 'vitest';
import { MusicSchedule, Occasion, between, pickOther } from '../src/audio/menuSchedule.ts';

describe('MusicSchedule', () => {
  it('starts the first piece a while after the ambience, and only once', () => {
    const music = new MusicSchedule(1, { firstAfter: 5, gap: 35 }, 100);
    expect(music.due(100)).toBeNull();
    expect(music.due(104.9)).toBeNull();
    expect(music.due(105)).toBe(0);
    expect(music.due(106)).toBeNull();
  });

  it('leaves the ambience alone for the gap after a piece, then plays it again', () => {
    const music = new MusicSchedule(1, { firstAfter: 5, gap: 35 }, 0);
    expect(music.due(5)).toBe(0);
    music.ended(400);
    expect(music.due(434.9)).toBeNull();
    expect(music.due(435)).toBe(0);
  });

  it('goes through several pieces in order, around again, with the gap between them', () => {
    const music = new MusicSchedule(3, { firstAfter: 5, gap: 35 }, 0);
    const played: number[] = [];
    let now = 0;
    for (let i = 0; i < 4; i++) {
      now += 40;
      played.push(music.due(now)!);
      now += 200;
      music.ended(now);
      expect(music.due(now + 34)).toBeNull();
    }
    expect(played).toEqual([0, 1, 2, 0]);
  });

  it('plays nothing without pieces, and ignores an end with nothing playing', () => {
    const none = new MusicSchedule(0, { firstAfter: 0, gap: 0 }, 0);
    expect(none.due(10)).toBeNull();
    const music = new MusicSchedule(2, { firstAfter: 0, gap: 6 }, 0);
    music.ended(1);
    expect(music.due(1)).toBe(0);
  });
});

describe('Occasion', () => {
  it('happens after its first wait and then after each wait picked', () => {
    const waits = [0.5, 0, 1];
    const occasion = new Occasion([10, 20], 0, [2, 4], () => waits.shift()!);
    expect(occasion.due(2.9)).toBe(false);
    expect(occasion.due(3)).toBe(true);
    expect(occasion.due(12.9)).toBe(false);
    expect(occasion.due(13)).toBe(true);
    expect(occasion.due(32.9)).toBe(false);
    expect(occasion.due(33)).toBe(true);
  });
});

describe('pickOther', () => {
  it('never picks the last one again', () => {
    for (let last = 0; last < 4; last++) {
      for (let r = 0; r < 1; r += 0.05) expect(pickOther(4, last, () => r)).not.toBe(last);
    }
  });

  it('picks any of them the first time, and the only one when there is one', () => {
    expect(pickOther(3, -1, () => 0)).toBe(0);
    expect(pickOther(3, -1, () => 0.99)).toBe(2);
    expect(pickOther(1, 0)).toBe(0);
  });

  it('picks within a range', () => {
    expect(between([2, 6], () => 0.25)).toBe(3);
  });
});
