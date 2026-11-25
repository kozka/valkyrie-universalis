// Not in Valkyrie: the music the app brings for its menus, chosen by kozka, and who made each piece. A piece plays
// when its file is in assets/music/; one whose file is not there yet is left out, so the lists below can name pieces
// before their files arrive. What plays where, and when, is in menuSound.ts.
const FILES = import.meta.glob<string>('../assets/music/*.mp3', { eager: true, query: '?url', import: 'default' });

/** Who made a piece of music, and where to find them: shown small in the menus where it plays. */
export interface MusicCredit {
  author: string;
  channel?: string;
}

export interface Piece {
  /** Its file's name in assets/music/, without .mp3. */
  file: string;
  credit: MusicCredit;
  /** How loud it plays, 1 when not said: the louder recordings lower, so that a game's pieces sound alike. */
  level?: number;
}

const NAKARADA: MusicCredit = { author: 'Alexander Nakarada', channel: 'https://www.youtube.com/@anakarada' };
const RUN_RABBIT: MusicCredit = { author: 'Run Rabbit Productions', channel: 'https://www.youtube.com/@RunRabbitProductions' };

export const PIECES = {
  /** Descent: «A New Earth». */
  'descent-a-new-earth': { file: 'descent-a-new-earth', credit: { author: 'Sam McGrath' } },
  /** Descent: «Kingsfall», https://www.youtube.com/watch?v=LEtERiC0FVA */
  'descent-kingsfall': { file: 'descent-kingsfall', credit: NAKARADA, level: 0.6 },
  /** Descent: «Dungeons and Dragons», https://www.youtube.com/watch?v=_sEKXl5WlVU */
  'descent-dungeons-and-dragons': { file: 'descent-dungeons-and-dragons', credit: NAKARADA },
  /** Mansions: «Ghost Town», https://www.youtube.com/watch?v=aJEa1Yv6ZV0 */
  'mansions-ghost-town': { file: 'mansions-ghost-town', credit: RUN_RABBIT },
  /** Mansions: «The Carnival Tape», https://www.youtube.com/watch?v=0fQ1MIuyTi4 */
  'mansions-the-carnival-tape': { file: 'mansions-the-carnival-tape', credit: RUN_RABBIT, level: 0.65 },
  /** DooM: «Black Tooth». */
  'doom-menu': { file: 'doom-menu', credit: { author: 'Aim To Head Official (BLACK TOOTH)', channel: 'https://www.youtube.com/channel/UC1KJEk-EZMmDF9DJKMK5OCQ' }, level: 0.8 },
  /** DooM: «Torn Flesh», https://www.youtube.com/watch?v=58PCM-x7jlg */
  'doom-torn-flesh': { file: 'doom-torn-flesh', credit: { author: 'White Bat Audio', channel: 'https://www.youtube.com/@WhiteBatAudio' }, level: 0.8 },
} satisfies Record<string, Piece>;

export type PieceName = keyof typeof PIECES;

/** The address of a piece's file, or null while the app does not have it. */
export function pieceUrl(piece: Piece): string | null {
  return FILES[`../assets/music/${piece.file}.mp3`] ?? null;
}

/** Of these pieces, in their order, those whose files the app has. */
export function piecesHere(names: readonly PieceName[]): Piece[] {
  return names.map((name): Piece => PIECES[name]).filter((piece) => pieceUrl(piece) !== null);
}
