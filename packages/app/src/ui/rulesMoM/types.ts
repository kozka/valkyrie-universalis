// The shape of Mansions' help (RulesHelp.tsx), one file per language in this folder. Not in Valkyrie.

/** A line of the help: an optional term in bold, then its text. */
export interface RulesEntry {
  term?: string;
  text: string;
}

export interface RulesSection {
  title: string;
  entries: RulesEntry[];
}

export interface RulesHelpText {
  /** The first tab: what an investigator can do on their turn. */
  actionsIntro: string;
  actions: RulesSection[];
  /** The second tab: the rules, one folding section each. */
  rules: RulesSection[];
}
