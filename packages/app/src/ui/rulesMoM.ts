// Not in Valkyrie: Mansions' help (RulesHelp.tsx) in each of Valkyrie's languages, one file each in rulesMoM/. Written
// for the app in its own words (not FFG's text) from the rules the mansiones-valkyrie skill gathers, naming the app's
// buttons as Valkyrie shows them in that language.
import { help as Chinese } from './rulesMoM/Chinese.ts';
import { help as Czech } from './rulesMoM/Czech.ts';
import { help as English } from './rulesMoM/English.ts';
import { help as French } from './rulesMoM/French.ts';
import { help as German } from './rulesMoM/German.ts';
import { help as Italian } from './rulesMoM/Italian.ts';
import { help as Japanese } from './rulesMoM/Japanese.ts';
import { help as Korean } from './rulesMoM/Korean.ts';
import { help as Polish } from './rulesMoM/Polish.ts';
import { help as Portuguese } from './rulesMoM/Portuguese.ts';
import { help as Russian } from './rulesMoM/Russian.ts';
import { help as Spanish } from './rulesMoM/Spanish.ts';
import { help as Ukrainian } from './rulesMoM/Ukrainian.ts';
import type { RulesHelpText } from './rulesMoM/types.ts';

export type { RulesEntry, RulesHelpText, RulesSection } from './rulesMoM/types.ts';

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
export function rulesHelpMoM(language: string): RulesHelpText {
  return byLanguage[language] ?? English;
}
