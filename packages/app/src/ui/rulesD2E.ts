// Not in Valkyrie: Descent's help (RulesHelp.tsx) in each of Valkyrie's languages, one file each in rulesD2E/, written
// for the app in its own words (not FFG's text) from the rules the descent-valkyrie skill gathers (Road to Legend, as
// Valkyrie plays it), naming the app's buttons as Valkyrie shows them in that language.
import { help as Chinese } from './rulesD2E/Chinese.ts';
import { help as Czech } from './rulesD2E/Czech.ts';
import { help as English } from './rulesD2E/English.ts';
import { help as French } from './rulesD2E/French.ts';
import { help as German } from './rulesD2E/German.ts';
import { help as Italian } from './rulesD2E/Italian.ts';
import { help as Japanese } from './rulesD2E/Japanese.ts';
import { help as Korean } from './rulesD2E/Korean.ts';
import { help as Polish } from './rulesD2E/Polish.ts';
import { help as Portuguese } from './rulesD2E/Portuguese.ts';
import { help as Russian } from './rulesD2E/Russian.ts';
import { help as Spanish } from './rulesD2E/Spanish.ts';
import { help as Ukrainian } from './rulesD2E/Ukrainian.ts';
import type { RulesHelpText } from './rulesMoM/types.ts';

const byLanguage: Record<string, RulesHelpText> = {
  Chinese,
  Czech,
  English,
  French,
  German,
  Italian,
  Japanese,
  Korean,
  Polish,
  Portuguese,
  Russian,
  Spanish,
  Ukrainian,
};

/** The help in this language (Valkyrie's language names), or in English for one the app does not know. */
export function rulesHelpD2E(language: string): RulesHelpText {
  return byLanguage[language] ?? English;
}
