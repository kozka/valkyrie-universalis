// Not in Valkyrie: DooM's help (RulesHelp.tsx) in each of Valkyrie's languages, one file each in rulesDooM/, written
// for the app in its own words (not FFG's text) from the rules the doom-valkyrie skill gathers (the DooM pack's
// missions), naming the app's buttons as Valkyrie shows them in that language.
import { help as Chinese } from './rulesDooM/Chinese.ts';
import { help as Czech } from './rulesDooM/Czech.ts';
import { help as English } from './rulesDooM/English.ts';
import { help as French } from './rulesDooM/French.ts';
import { help as German } from './rulesDooM/German.ts';
import { help as Italian } from './rulesDooM/Italian.ts';
import { help as Japanese } from './rulesDooM/Japanese.ts';
import { help as Korean } from './rulesDooM/Korean.ts';
import { help as Polish } from './rulesDooM/Polish.ts';
import { help as Portuguese } from './rulesDooM/Portuguese.ts';
import { help as Russian } from './rulesDooM/Russian.ts';
import { help as Spanish } from './rulesDooM/Spanish.ts';
import { help as Ukrainian } from './rulesDooM/Ukrainian.ts';
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
export function rulesHelpDooM(language: string): RulesHelpText {
  return byLanguage[language] ?? English;
}
