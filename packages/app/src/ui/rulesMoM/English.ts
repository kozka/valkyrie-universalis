// Mansions' help in English (RulesHelp.tsx): the app's own words, not FFG's, from the rules the mansiones-valkyrie skill
// gathers, with the app's buttons as Valkyrie names them in English. Not in Valkyrie.
import type { RulesHelpText } from './types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    'On your turn you take up to 2 actions, in any order, and you may repeat one (moving twice is up to 4 spaces). The group decides who takes each turn.',
  actions: [
    {
      title: 'Actions',
      entries: [
        {
          term: 'Move',
          text: 'Up to 2 spaces, one at a time. You may split it: move 1, take another action, then move the other. You cannot cross walls, dashed borders, or doors with an Obstruction or an Explore token.',
        },
        { term: 'Explore', text: 'Press an Explore token in your space or on the door next to you. The app says what to place.' },
        { term: 'Search', text: 'Press a Search token in your space.' },
        { term: 'Interact', text: 'Press an Interact or Person token in your space and choose an option with the action icon.' },
        {
          term: 'Trade',
          text: 'Give, pick up or drop as many Items and Spells as you like with the investigators in your space. Picking something up from the floor also costs this action. Clues cannot be traded.',
        },
        {
          term: 'Attack',
          text: 'Choose the monster in the monster list, press «Attack» and the kind of weapon. Melee or unarmed, in your space; ranged, up to 3 spaces. Record the Damage with + and −.',
        },
        { term: 'Component', text: 'Use an «Action:» effect on a card, or an item in the inventory (the backpack or «Items», bottom left).' },
        {
          term: 'Obstruction',
          text: 'Move the Obstruction in your space against a door or Secret Passage, or away from it. From the other side of the door: Strength test; with 2 successes you push it aside and step through.',
        },
        { term: 'Put out fire', text: 'Agility test: each success discards 1 Fire in your space or in one you enter this turn.' },
      ],
    },
    {
      title: 'Rare actions (mostly with an Insane card)',
      entries: [
        {
          term: 'Push',
          text: 'Move a monster or investigator in your space 1 space. Strength test against the monster\'s Aggression, or against the investigator\'s result + 1 if they resist. If you succeed, you may follow.',
        },
        { term: 'Steal', text: 'Choose Strength, Agility or Observation and both of you test it. You take 1 possession for each success you get beyond theirs.' },
        {
          term: 'Set fire',
          text: 'With a Light Source, place Fire in your space or an adjacent one. If there was no Fire yet, press «Set» (the scroll at the bottom) → «Set Fire» so the app spreads it.',
        },
      ],
    },
    {
      title: 'Free (no action)',
      entries: [
        { text: 'Sight tokens (the eye).' },
        { text: 'App options without the action icon: pressing a token to read it commits you to nothing.' },
        { text: 'Abilities that do not say «Action:».' },
      ],
    },
    {
      title: 'Remember',
      entries: [
        {
          term: 'Evade',
          text: 'In a monster\'s space, before any action other than Attack or Move, and to leave it: choose the monster with the highest Awareness (green number) and press «Evade». If you fail, you usually forfeit the action.',
        },
        { term: 'Wounded', text: 'You can take only one Move action per round.' },
        { term: 'Fire', text: 'Entering a space with Fire, or taking or forfeiting an action in it, deals 1 facedown Damage.' },
        { term: 'Darkness', text: 'You cannot spend Clues, unless there is a Light Source or Fire in your space or an adjacent one.' },
      ],
    },
  ],
  rules: [
    {
      title: 'Before you start',
      entries: [
        { text: 'Shuffle the Damage and Horror decks separately and keep them facedown.' },
        { text: 'Sort the Common Items, Unique Items, Spells and Conditions by name, faceup.' },
        { text: 'Sort the tokens by kind. The app says which tiles, tokens and monsters to place, and when.' },
        { text: 'Share the starting possessions as you like; Clues, as the app says. Read the prologue: it may hold clues to the story.' },
      ],
    },
    {
      title: 'The round',
      entries: [
        { term: 'Investigation phase', text: 'Each investigator takes a whole turn of up to 2 actions, in the order the group chooses. When everyone is done, press the ➤ button at the bottom right.' },
        { term: 'Mythos phase', text: 'In this order:' },
        { term: '1. Fire', text: 'If there is Fire, add 1 token in total (not one per fire) to a space adjacent to one with Fire.' },
        { term: '2. Events', text: 'The app shows one or more Mythos events; resolve them as written.' },
        { term: '3. Monsters', text: 'The app activates each monster, one after another.' },
        { term: '4. Horror', text: 'Each investigator makes a horror check against the monster with the most Horror within their range, if any.' },
        { text: 'Press ➤ and a new round begins. Time runs even if you cannot see it: the app decides when it is late.' },
      ],
    },
    {
      title: 'Tests',
      entries: [
        { term: 'Dice', text: 'As many as the attribute, with modifiers (at least 1). Each die has 3 success faces, 2 investigation faces (the magnifying glass) and 3 blank ones.' },
        { term: 'Result', text: 'The number of successes. «(Agility −1; 2)» is an Agility test with one die fewer that needs 2 successes.' },
        { term: 'Clues', text: 'After rolling, each Clue you spend turns 1 magnifying glass into a success. It is not a reroll.' },
        { term: 'Negate', text: 'If the text says «negated by…», each success prevents 1 Damage or 1 Horror.' },
        { term: 'Rolling dice', text: 'If the text only says «roll X dice», it is not a test: Clues cannot be spent.' },
        { text: 'Only the active investigator rolls, unless an effect says otherwise.' },
      ],
    },
    {
      title: 'Damage, Horror, Wounded and Insane',
      entries: [
        { term: 'Cards', text: 'Suffering Damage or Horror means drawing a card from its deck, faceup unless it says «facedown». Facedown cards do nothing: they only count.' },
        { term: 'Faceup', text: '«Resolve immediately» applies when you get it; «Keep faceup» works while it stays so. If facedown cards must be flipped, they are chosen at random.' },
        { term: 'Wounded', text: 'When your total Damage reaches your Health: you become Wounded and discard your facedown Damage. You can move only once per round.' },
        { term: 'Insane', text: 'The same with Horror and Sanity. Read the back of your Insane card in secret: it may change how you win. If it asks for more investigators than you are, take another.' },
        { term: 'Eliminated', text: 'If, already Wounded or Insane, you reach the limit again: drop your possessions and remove your figure. Press «Set» (the scroll at the bottom) → «Investigator Eliminated». The others lose at the end of the next Investigation phase unless they are done.' },
      ],
    },
    {
      title: 'Monsters',
      entries: [
        { term: 'Token', text: 'Awareness (green): which one you evade. Horror (blue): which one you make a horror check against. Aggression (red, on the back): dice against Obstructions and difficulty to push it. The app keeps its Health.' },
        { term: 'Activation', text: 'Do what the app says. «Toward» means each step brings it closer; it stops when it reaches its target. If there is no target within range, it does not move: press the no-investigators button and the app gives another order.' },
        { term: 'Doors', text: 'They go through them freely unless obstructed: then they roll as many dice as their Aggression and break the Obstruction with 2 successes; otherwise they lose their movement (but still attack if they share a space with someone).' },
        { term: 'Horror check', text: 'Only in the horror step. If several investigators check against the same monster, the app shows it once and each rolls and applies their own.' },
        { term: 'Fire', text: 'A monster that starts its activation in Fire, or enters it, suffers 1 Damage.' },
      ],
    },
    {
      title: 'The map and range',
      entries: [
        { term: 'Spaces', text: 'Solid borders (white or yellow): you cross them. Dashed borders: you cannot cross them, but range goes through. Walls: nothing crosses or goes through them. Doors: you cross them, but range does not go through.' },
        { term: 'Range', text: 'Up to 3 spaces, your own counting as 0. It can turn corners: there is no line of sight. It does not go through walls, doors or Secret Passages.' },
        { term: 'Adjacent', text: 'Effects on adjacent spaces (light, Fire spreading) go through doors, never through walls.' },
        { term: 'Secret Passage', text: 'All spaces with a Secret Passage are adjacent to each other for moving.' },
        { term: 'North', text: 'Always the top of the screen.' },
        { term: 'Indoor and outdoor', text: 'Outdoor rooms have a silver name plate with red tentacles. Some events tell them apart.' },
      ],
    },
    {
      title: 'Fire, Darkness and Obstructions',
      entries: [
        { term: 'Fire', text: 'There can never be 2 in one space. It spreads through doors, not walls; Obstructions do not stop it. Fire you put out with your action no longer damages you.' },
        { term: 'Darkness', text: 'In its space no Clues are spent, neither for tests nor for puzzles. A Light Source or a Fire in your space or an adjacent one cancels it.' },
        { term: 'Obstruction', text: 'Neither investigators nor monsters go through an obstructed door or Passage. It does not stop monsters from appearing.' },
      ],
    },
    {
      title: 'Items, Spells and Conditions',
      entries: [
        { term: 'Possessions', text: 'Common Items, Unique Items and Spells. Clues, Conditions, Damage and Horror are not.' },
        { term: 'Items', text: 'You may look at their back whenever you like. When an item is flipped, its back replaces its front.' },
        { term: 'Spells', text: 'You get a random copy and never look at its back. To cast it you flip it, resolve the back and almost always discard it and gain another copy.' },
        { term: 'Conditions', text: 'Faceup and never two copies. Stunned: only 1 action on your turn. Dazed: you spend no Clues. Restrained: you cannot move on your own. Focused: discard it to make all your magnifying glasses successes.' },
        { term: 'Weapons', text: 'To attack with a kind of weapon you must carry one of that kind. You can always attack unarmed.' },
      ],
    },
    {
      title: 'Puzzles',
      entries: [
        { term: 'Steps', text: 'As many as the printed value of the attribute the app asks for, plus 1 per Clue you spend (not in Darkness). The app does not count them: count them yourselves.' },
        { term: 'Close', text: 'When the steps run out, press «Close»: progress is kept and someone can go on later with another action. You may advise each other.' },
        { term: 'Slide', text: 'Rebuild the picture by swapping two neighbouring pieces per step.' },
        { term: 'Lock', text: 'Slide blocks, one per step, until the target piece leaves on the right.' },
        { term: 'Code', text: 'Guess a code per step. A success for each symbol in its place; a magnifying glass for each right symbol in the wrong place.' },
        { term: 'Tower', text: 'Move the top piece of a column to another until all are stacked, largest to smallest.' },
      ],
    },
    {
      title: 'Expansions',
      entries: [
        { term: 'Key', text: 'An item with a Key token gains the Key and Evidence traits and cannot be discarded, but can be traded or stolen.' },
        { term: 'Moving and overlapping tiles', text: 'They move with everything on them. One on top of another never covers a whole space; what is covered stops being part of the board.' },
        { term: 'Elixirs', text: 'Gained at random; do not look at the back until an effect flips them. Faceup they are possessions; facedown, not.' },
        { term: 'Improvements', text: '+1 to the printed value of an attribute, once per attribute. Not possessions.' },
        { term: 'Restraint', text: 'A monster in its space need not be evaded. When that monster activates you may discard it so it does not move.' },
        { term: 'Rubble', text: 'No Search, Explore or Interact. Strength test: 1 token per success; a Heavy Weapon clears them all.' },
        { term: 'Overgrowth', text: 'To leave, Observation test with a difficulty equal to the number of tokens; if you fail, drop a random item. A Bladed Weapon clears them; so does Fire.' },
        { term: 'Water', text: 'Entering it ends your movement (except aquatic, flying or phasing monsters). It puts out Fire.' },
        { term: 'Rift', text: 'Taking an action other than moving in its space makes you Lost in Time and Space. Lore test to close them: 1 per success.' },
      ],
    },
    {
      title: 'When something is unclear',
      entries: [
        { text: 'If an effect could affect several investigators, or several happen at once, the group decides. If you cannot agree, a random investigator decides.' },
        { text: 'Effects on an eliminated investigator are applied as far as possible.' },
        { text: 'The Log (the book or «Log», at the bottom) keeps everything the app has said, by round.' },
      ],
    },
  ],
};
