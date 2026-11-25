// What Igor says, and what the player can answer him, in Valkyrie's 13 languages: one file each in lines/ (English
// when a language has none). Each kind of line has several, picked at random, so that he does not sound the same every
// evening; a line may hold {0} for what it speaks of. Written by Claude for kozka (23 October 2026), in Spanish and
// English first, the rest translated from them, keeping his tone. Not in Valkyrie.
import type { GuideTag } from '../guide/guide.ts';
import type { QuestionId } from './recommend.ts';
import { Spanish } from './lines/Spanish.ts';
import { English } from './lines/English.ts';
import { French } from './lines/French.ts';
import { German } from './lines/German.ts';
import { Italian } from './lines/Italian.ts';
import { Portuguese } from './lines/Portuguese.ts';
import { Polish } from './lines/Polish.ts';
import { Czech } from './lines/Czech.ts';
import { Russian } from './lines/Russian.ts';
import { Ukrainian } from './lines/Ukrainian.ts';
import { Chinese } from './lines/Chinese.ts';
import { Japanese } from './lines/Japanese.ts';
import { Korean } from './lines/Korean.ts';

export interface IgorLines {
  /** His greeting, when the window opens. */
  greetings: string[];
  /** Added to the greeting around Halloween (from 20 October to 2 November). */
  halloween: string[];
  /** A word about nothing in particular, after the greeting. */
  smallTalk: string[];
  /** He asks what the player wishes. */
  offer: string[];
  /** The player's answers to the offer. */
  wantAdventure: string[];
  wantNews: string;
  wantNothing: string[];
  /** He announces news ({0}: the news' own words). */
  newsIntro: string[];
  newsMore: string;
  newsOther: string;
  /** No news to tell. */
  noNews: string[];
  /** Before the questions. */
  beforeQuestions: string[];
  questions: Record<QuestionId, { ask: string[]; options: Record<string, string> }>;
  /** What he says to an answer, by question and option ("players:3"), or to any ("any"). */
  acks: Record<string, string[]>;
  /** With the three adventures, with fewer, with none. */
  results: string[];
  resultsFew: string[];
  resultsNone: string[];
  /** The buttons under his adventures. */
  goThere: string;
  askAgain: string;
  thanks: string;
  /** When the player leaves. */
  farewell: string[];
  /** Words for why an adventure suits: its players, its length, its tags. */
  why: { players: string; minutes: string; tags: Partial<Record<GuideTag, string>> };
  close: string;
}

const LINES: Record<string, IgorLines> = { Spanish, English, French, German, Italian, Portuguese, Polish, Czech, Russian, Ukrainian, Chinese, Japanese, Korean };

/** Igor's lines in the player's language, or in English. */
export function igorLines(lang: string): IgorLines {
  return LINES[lang] ?? English;
}
