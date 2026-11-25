// Not in Valkyrie: when the menus' own sound plays (menuAmbience.ts), apart from the browser so that it runs in tests.
// A menu has an ambience that never stops, and over it a list of music: the first piece comes in a few seconds after
// the ambience, each one fades in, and after a piece ends only the ambience is heard for a while before the next.

/** A range to pick from, lowest and highest. */
export type Range = readonly [number, number];

/** A number in a range; `random` is Math.random or a test's. */
export function between([low, high]: Range, random: () => number = Math.random): number {
  return low + (high - low) * random();
}

/** One of `count` things other than the last one picked, so that nothing sounds twice in a row. */
export function pickOther(count: number, last: number, random: () => number = Math.random): number {
  if (count <= 1) return 0;
  if (last < 0 || last >= count) return Math.min(count - 1, Math.floor(random() * count));
  const pick = Math.min(count - 2, Math.floor(random() * (count - 1)));
  return pick >= last ? pick + 1 : pick;
}

/** The seconds a menu's music waits: before the first piece, and between the end of one and the start of the next. */
export interface MusicTiming {
  firstAfter: number;
  gap: number;
}

/** Which piece of a menu's list plays, and when: in order, around again after the last. */
export class MusicSchedule {
  private readonly count: number;
  private readonly timing: MusicTiming;
  private index = 0;
  private nextAt: number;
  private playing = false;

  /** `now`, in seconds of any clock that only goes forward, is when the ambience began. */
  constructor(count: number, timing: MusicTiming, now: number) {
    this.count = count;
    this.timing = timing;
    this.nextAt = now + timing.firstAfter;
  }

  /** The piece to start now, or null while one plays or the wait is not over. */
  due(now: number): number | null {
    if (this.count === 0 || this.playing || now < this.nextAt) return null;
    this.playing = true;
    return this.index;
  }

  /** The piece that played is over (or could not play): the next one waits its gap. */
  ended(now: number): void {
    if (!this.playing) return;
    this.playing = false;
    this.index = (this.index + 1) % this.count;
    this.nextAt = now + this.timing.gap;
  }
}

/** Something that happens now and then, each time after a wait picked from a range. */
export class Occasion {
  private readonly every: Range;
  private readonly random: () => number;
  private at: number;

  constructor(every: Range, now: number, first: Range = every, random: () => number = Math.random) {
    this.every = every;
    this.random = random;
    this.at = now + between(first, random);
  }

  /** Whether it happens now; if so, the next time is picked. */
  due(now: number): boolean {
    if (now < this.at) return false;
    this.at = now + between(this.every, this.random);
    return true;
  }
}
