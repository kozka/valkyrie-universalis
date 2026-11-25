// The player's own marks on scenarios: played (set when a game reaches its end, or by hand), favourite and pending.
// They are kept in config.ini under [UniversalisMarks], next to Valkyrie's own sections, so the backup in Options
// carries them; each key is the game and the quest's identifier (its package's name, as the store lists it), so that
// the same scenario has its marks online and offline. The list's filter shows all, or only some (filterPlayed and
// filterMark under [Universalis]), only those for so many investigators (filterPlayers), and only those of some of the
// scenario guide's categories (filterCategories, guide/guide.ts). Not ported from Valkyrie.
import { Game } from '@universalis/engine';
import { CATEGORIES, guideOf, hasGuide, type GuideTag } from '../guide/guide.ts';
import { update } from './store.ts';

export type Mark = 'played' | 'favorite' | 'pending';
export const MARKS: readonly Mark[] = ['played', 'favorite', 'pending'];

const SECTION = 'UniversalisMarks';

/** What the list shows of the played ones: all, only the played, or only those not played yet. */
export const PLAYED_FILTERS = ['all', 'played', 'unplayed'] as const;
export type PlayedFilter = (typeof PLAYED_FILTERS)[number];
/** What the list shows of the marked ones: all, only the favourites, or only the pending. */
export const MARK_FILTERS = ['all', 'favorite', 'pending'] as const;
export type MarkFilter = (typeof MARK_FILTERS)[number];

function key(identifier: string): string {
  return `${Game.get().gameType.typeName()}/${identifier.toLowerCase()}`;
}

/** A quest's marks. */
export function marksOf(identifier: string): Set<Mark> {
  const value = Game.game?.config.data.get(SECTION, key(identifier)) ?? '';
  return new Set(value.split(' ').filter((m): m is Mark => (MARKS as readonly string[]).includes(m)));
}

function save(identifier: string, marks: Set<Mark>): void {
  const game = Game.get();
  const ordered = MARKS.filter((m) => marks.has(m));
  if (ordered.length === 0) game.config.data.remove(SECTION, key(identifier));
  else game.config.data.add(SECTION, key(identifier), ordered.join(' '));
  game.config.save();
}

export function setMark(identifier: string, mark: Mark, on: boolean): void {
  const marks = marksOf(identifier);
  if (on) marks.add(mark);
  else marks.delete(mark);
  save(identifier, marks);
  update();
}

/** The quest the player started from the list: a scenario may change to another quest on the way (TLE). */
export function rememberStarted(identifier: string): void {
  const game = Game.get();
  game.config.data.add('Universalis', 'playing', identifier.toLowerCase());
  game.config.save();
}

/** At the end of a game, the quest being played and the one started from the list are played. */
export function markFinished(identifier: string | undefined): void {
  const started = Game.get().config.data.get('Universalis', 'playing');
  for (const id of new Set([identifier ?? '', started])) {
    if (id === '' || marksOf(id).has('played')) continue;
    const marks = marksOf(id);
    marks.add('played');
    save(id, marks);
  }
}

function filter<T extends string>(name: string, choices: readonly T[]): T {
  const value = Game.game?.config.data.get('Universalis', name) ?? '';
  return choices.find((c) => c === value) ?? choices[0]!;
}

/** Not in Valkyrie: online, the store's list shown whole, or only what is downloaded, or only what is not (issue 1028). */
export const DOWNLOAD_FILTERS = ['all', 'downloaded', 'notDownloaded'] as const;
export type DownloadFilter = (typeof DOWNLOAD_FILTERS)[number];

export function downloadFilter(): DownloadFilter {
  return filter('filterDownloaded', DOWNLOAD_FILTERS);
}

export function setDownloadFilter(value: DownloadFilter): void {
  const game = Game.get();
  game.config.data.add('Universalis', 'filterDownloaded', value);
  game.config.save();
}

/** Whether the list's filter shows a quest of the store that is, or is not, downloaded. */
export function shownByDownload(downloaded: boolean): boolean {
  const chosen = downloadFilter();
  return chosen === 'all' || (chosen === 'downloaded') === downloaded;
}

export function playedFilter(): PlayedFilter {
  return filter('filterPlayed', PLAYED_FILTERS);
}

export function markFilter(): MarkFilter {
  return filter('filterMark', MARK_FILTERS);
}

export function setPlayedFilter(value: PlayedFilter): void {
  const game = Game.get();
  game.config.data.add('Universalis', 'filterPlayed', value);
  game.config.save();
}

export function setMarkFilter(value: MarkFilter): void {
  const game = Game.get();
  game.config.data.add('Universalis', 'filterMark', value);
  game.config.save();
}

/** How many investigators play, when the list shows only the scenarios that take that many; null for all of them. */
export function playersFilter(): number | null {
  const value = Number(Game.game?.config.data.get('Universalis', 'filterPlayers') ?? '');
  return Number.isInteger(value) && value > 0 ? value : null;
}

export function setPlayersFilter(value: number | null): void {
  const game = Game.get();
  if (value === null) game.config.data.remove('Universalis', 'filterPlayers');
  else game.config.data.add('Universalis', 'filterPlayers', String(value));
  game.config.save();
}

/** Whether the list's filter shows a quest for this many investigators at least and at most. */
export function shownByPlayers(minHero: number, maxHero: number): boolean {
  const players = playersFilter();
  return players === null || (players >= minHero && players <= maxHero);
}

/** The guide's categories the list shows only (a scenario must have them all), none for all. */
export function categoriesFilter(): Set<GuideTag> {
  const saved = (Game.game?.config.data.get('Universalis', 'filterCategories') ?? '').split(';');
  return new Set(CATEGORIES.filter((c) => saved.includes(c)));
}

export function setCategoriesFilter(value: Set<GuideTag>): void {
  const game = Game.get();
  if (value.size === 0) game.config.data.remove('Universalis', 'filterCategories');
  else game.config.data.add('Universalis', 'filterCategories', CATEGORIES.filter((c) => value.has(c)).join(';'));
  game.config.save();
}

/**
 * Whether the list's filter shows a quest by the guide's categories: all of those chosen. Only Mansions has a guide; a
 * scenario the guide does not know (newer than it, or the player's own) is left out while categories are chosen.
 */
export function shownByCategories(identifier: string): boolean {
  const chosen = categoriesFilter();
  if (chosen.size === 0 || !hasGuide()) return true;
  const guide = guideOf(identifier);
  return guide !== null && [...chosen].every((c) => guide.tags.has(c));
}

/** Whether the list's filter shows a quest with these marks. */
export function shownByMarks(marks: Set<Mark>): boolean {
  const played = playedFilter();
  if (played === 'played' && !marks.has('played')) return false;
  if (played === 'unplayed' && marks.has('played')) return false;
  const mark = markFilter();
  return mark === 'all' || marks.has(mark);
}

/**
 * The player's own rating of a scenario (EndGameScreen): 1 to 10, whether they won, and whether it went to Valkyrie's
 * statistics. Kept under [UniversalisRatings] with the marks' keys. A scenario is sent once per device, so that playing
 * it again does not count twice in the store's figures.
 */
export interface MyRating {
  rating: number;
  victory: 'true' | 'false';
  sent: boolean;
}

const RATINGS = 'UniversalisRatings';

export function ratingOf(identifier: string): MyRating | null {
  const [rating, victory, sent] = (Game.game?.config.data.get(RATINGS, key(identifier)) ?? '').split(' ');
  const value = Number(rating);
  if (!Number.isInteger(value) || value < 1 || value > 10 || (victory !== 'true' && victory !== 'false')) return null;
  return { rating: value, victory, sent: sent === 'sent' };
}

export function saveRating(identifier: string, rating: MyRating): void {
  const game = Game.get();
  game.config.data.add(RATINGS, key(identifier), `${rating.rating} ${rating.victory} ${rating.sent ? 'sent' : 'kept'}`);
  game.config.save();
  update();
}
