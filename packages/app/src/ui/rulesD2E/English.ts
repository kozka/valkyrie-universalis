// Descent's help in English (RulesHelp.tsx): the app's own words, not FFG's, from the rules the descent-valkyrie skill
// gathers (Road to Legend, as Valkyrie plays it), with the app's buttons as Valkyrie names them in English. Not in
// Valkyrie.
import type { RulesHelpText } from '../rulesMoM/types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    'When your turn starts, effects that last «until your next turn» end, you resolve those «at the start of your turn», refresh your exhausted cards and may change your equipment. Then you take up to 2 actions, in any order; you may repeat the same one or skip them. When you are done, press «End Turn» on your portrait: the app activates a monster group.',
  actions: [
    {
      title: 'Actions',
      entries: [
        {
          term: 'Move',
          text: 'You gain as many movement points as your Speed; each space costs 1, diagonals too. You can split it to take another action in between. You can move through heroes, not monsters, and you cannot end in an occupied space.',
        },
        { term: 'Attack', text: 'With an equipped weapon, or bare-handed (the blue die only, melee). See «Attacks» in the rules summary.' },
        { term: 'Use a skill', text: 'A class card with the action icon, paying its fatigue.' },
        { term: 'Rest', text: 'At the end of your turn you recover all your fatigue, even if it was your first action.' },
        { term: 'Search', text: 'A search token in your space or adjacent: press it in the app and it tells you what you find.' },
        {
          term: 'Open a door',
          text: 'An adjacent door: press it in the app, read its text and confirm. It usually reveals new tiles, tokens and monsters. In Road to Legend doors are never closed again.',
        },
        {
          term: 'Revive a hero',
          text: 'A knocked-out hero whose token is adjacent: roll 2 red dice, recover 1 damage per heart and 1 fatigue per surge, and they return to the map. On their next turn they play normally.',
        },
        { term: 'Special action', text: 'Whatever cards, items or the quest allow with the action icon: pick up an objective, talk to a villager, pull a lever…' },
      ],
    },
    {
      title: 'If you are knocked out',
      entries: [
        {
          term: 'Stand Up',
          text: 'It is the only thing you can do that turn: roll 2 red dice, recover 1 damage per heart and 1 fatigue per surge, and place your figure where your token was. Then your turn ends. Press «End Turn» anyway.',
        },
      ],
    },
    {
      title: 'Without spending an action',
      entries: [
        { text: 'Examine any token or door in the app, even if you are not next to it, before deciding.' },
        { text: 'Suffer 1 fatigue for each extra movement point, without going over your Stamina.' },
        { text: 'Trade items with an adjacent hero after a Move action. Class cards cannot be traded.' },
        { text: 'Spend a leftover surge in an attack to recover 1 fatigue.' },
        { text: 'With exactly 2 heroes, each can make one free normal attack per turn; if they do not, they recover 2 damage at the end of their turn.' },
      ],
    },
    {
      title: 'In the app',
      entries: [
        { term: 'End Turn', text: "On each hero's portrait, when their turn ends, even if they are knocked out. If it is not pressed, the round does not move on." },
        { term: 'KO', text: "On the portrait of the hero who is knocked out: morale drops. When they return to the map, the portrait's other button (Recover)." },
        { term: 'Defeated', text: "On the monster group's portrait when the last one falls. «Unique Defeated» if the unique monster falls." },
        { term: 'Information', text: "On a group's portrait: its clarifications and the order in which it spends surges. «Force Activate», if the quest asks for it." },
        { term: 'Skills and Items', text: "The buttons at the bottom: each hero's skills and experience, and the party's items and gold." },
      ],
    },
  ],
  rules: [
    {
      title: 'The round',
      entries: [
        { text: 'The party chooses a hero who has not played; they take their turn and press «End Turn». The app then activates a random monster group among those not yet activated. This repeats, hero and group.' },
        { text: 'If one side runs out of turns, the other plays its remaining ones in a row.' },
        { term: 'End of the round', text: 'When everyone has played, the end-of-round effects the quest names (reinforcements, perils…) are resolved and a new round begins. The app saves the game at the start of each round.' },
        { text: "Heroes' «once per turn» abilities are not used during the monsters' activations." },
      ],
    },
    {
      title: 'Monster activation',
      entries: [
        { term: 'Window', text: 'A special effect for this activation and the list of actions for the masters («Master», red figures) and the minions («Minion», beige figures), in the order it shows.' },
        { term: 'Each monster', text: 'Goes down the list from top to bottom and takes the first action it can, until it has taken 2; if it reaches the end, it starts again from the top. Only 1 attack per activation, except with abilities such as Ravage.' },
        { term: 'Skipped', text: 'What it cannot do or would have no effect: moving to where it already is, attacking without a valid target or without line of sight, a second attack.' },
        { term: 'Spot', text: 'Move until within 3 spaces of the target and with line of sight.' },
        { term: 'Engage', text: 'Move until adjacent to the target. With Reach, it stops within 2 spaces with line of sight.' },
        { term: 'Retreat', text: 'Spend its remaining movement moving away from the closest enemy.' },
        { term: 'Ties', text: 'Between targets, the closest one; if still tied, you decide.' },
        { text: 'When all of one type are done, press «Master Activated» or «Minion Activated».' },
      ],
    },
    {
      title: 'Movement and terrain',
      entries: [
        { term: 'Diagonals', text: 'You can move diagonally, but not across the corner of a wall.' },
        { term: 'Water', text: 'Entering costs 2 movement points.' },
        { term: 'Pit', text: 'When you enter you suffer 2 damage. Inside you cannot spend movement points: you leave with an action to an adjacent empty space.' },
        { term: 'Lava', text: 'When you enter you suffer 1 damage, and a figure that ends its turn in it is defeated.' },
        { term: 'Obstacle', text: 'Blocks movement and line of sight.' },
        { term: 'Monsters', text: 'Cannot suffer fatigue to move further. They avoid pits and lava, and use water only if it is cheaper for them.' },
        { term: 'Large monsters', text: 'Count their movement from one of their spaces, as if they were small, and when done they are placed so that one of their spaces is the final one.' },
      ],
    },
    {
      title: 'Line of sight, spaces and adjacency',
      entries: [
        { term: 'Line of sight', text: "A straight line from a corner of your space to a corner of the target's. It is blocked by figures, obstacles, walls and doors; only touching a corner does not block it. Adjacent spaces always see each other." },
        { term: 'Counting spaces', text: 'The shortest path, not counting the starting space. Figures and terrain that is not an obstacle do not matter; you do not count through walls or closed doors.' },
        { term: 'Adjacent', text: 'Spaces that share a side or a corner, unless a wall or a door separates them.' },
      ],
    },
    {
      title: 'Attacks',
      entries: [
        { term: 'Roll', text: "The attacker rolls the blue die and their power dice, and the defender their defense dice, all at once. An X on the blue die is a miss." },
        { term: 'Ranged', text: 'The total range on the dice must reach the number of spaces to the target; against an adjacent one you need at least 1.' },
        { term: 'Surges', text: 'Each surge is spent on a different surge ability, each one once per attack.' },
        { term: 'Damage', text: "The hearts rolled minus the defender's shields. Dealing 0 is not a miss. A condition from a surge only applies if the attack deals at least 1 damage." },
        { term: 'Blast', text: 'Also affects every space adjacent to the target. Against several monsters, in Road to Legend the target suffers full damage and the others half, rounded up, before shields.' },
        { term: 'Pierce X', text: 'Ignores X shields.' },
      ],
    },
    {
      title: 'Attribute tests',
      entries: [
        { text: 'Roll 1 gray die and 1 black die and count the shields: if they are equal to or less than the attribute (Might, Knowledge, Willpower or Awareness), you pass the test.' },
        { text: 'Master and minion monsters always fail; lieutenants test with their own attributes.' },
        { text: 'The app does not roll dice: the text says what happens if you pass and if you fail.' },
      ],
    },
    {
      title: 'Damage, fatigue, knocked out and morale',
      entries: [
        { term: 'Health', text: 'When damage equals or exceeds Health, the figure is defeated.' },
        { term: 'Fatigue', text: 'Fatigue you choose to suffer never goes over your Stamina. Fatigue an effect forces on you, if it does not fit, you suffer as damage. Monsters suffer damage instead of fatigue.' },
        { term: 'Knocked out', text: 'You suffer fatigue up to your Stamina, replace your figure with your hero token, discard your conditions and, if it was your turn, it ends. Press «KO» on your portrait.' },
        { term: 'Morale', text: 'Starts equal to the number of heroes and drops by 1 with each KO. If it is at 0 and another hero falls, you flee and lose the quest.' },
      ],
    },
    {
      title: 'Conditions',
      entries: [
        { text: 'You cannot have two copies of the same one. Condition tests are made at the start of the turn. When you are knocked out, you discard them all.' },
        { term: 'Poisoned', text: 'Might test: if you fail, you suffer 1 damage and keep it.' },
        { term: 'Diseased', text: 'Willpower test: if you fail, you suffer 1 fatigue and keep it.' },
        { term: 'Immobilized', text: 'You cannot take Move actions. Discarded at the end of your turn.' },
        { term: 'Stunned', text: 'The only action you can take is to discard it; after that, your other action as normal.' },
        { term: 'Burning', text: 'At the end of your turn, you and each adjacent friendly figure suffer 1 damage. Removed with an action by you or by someone adjacent.' },
        { term: 'Cursed', text: 'You cannot use skill actions. Removed by passing a Knowledge test at the start of the turn.' },
        { term: 'Weakened', text: '1 shield less when defending and 1 heart less when attacking. Removed when you Rest.' },
        { term: 'Bleeding', text: 'You suffer 1 fatigue for each action other than discarding it.' },
        { term: 'Doomed', text: 'Each time you suffer damage, you suffer 1 more damage. Removed by spending a surge.' },
        { term: 'Terrified', text: 'You cannot spend surges. Removed at the end of your turn if you cannot see any enemy.' },
      ],
    },
    {
      title: 'Heroes, equipment and searching',
      entries: [
        { term: 'Values', text: 'Speed (movement), Health, Stamina (maximum fatigue), Defense, and the attributes Might, Knowledge, Willpower and Awareness.' },
        { term: 'Heroic feat', text: 'Once per quest; when you use it, flip your hero sheet.' },
        { term: 'Equipment', text: 'Two hands (a two-handed weapon takes both), one armor and two other items. It can only be changed at the start of your turn.' },
        { term: 'Exhaust', text: 'A used card is turned sideways and cannot be used again until you refresh it at the start of your turn.' },
        { term: 'Search', text: 'Search cards are discarded when the quest ends. Gold belongs to the whole party.' },
      ],
    },
    {
      title: 'Objective, victory and defeat',
      entries: [
        { text: 'The quest gives the objective and may change it («Objective updated»). You win by completing it.' },
        { text: 'You lose through morale or as the quest says. If you dawdle, at the end of some rounds ever-worse perils strike.' },
        { term: 'When it ends', text: 'Heroes recover all damage and fatigue, turn their hero sheet face up, and discard conditions and Search cards. Gold, experience, items and fame are kept.' },
      ],
    },
    {
      title: 'When something is unclear',
      entries: [
        { text: 'Cards take precedence over the general rules, and the quest rules over everything else.' },
        { text: 'If an effect allows several options, the party decides. The app does not check any rule: you apply them.' },
        { text: 'The app does not know where the figures are, their damage or their conditions: if you save mid-quest, write them down. The «Log» keeps what the app has said.' },
      ],
    },
  ],
};
