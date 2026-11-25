// DooM's help in English (RulesHelp.tsx): the app's own words, not FFG's, from the rules the doom-valkyrie skill
// gathers (DOOM: The Board Game as the DooM pack's missions play it in Valkyrie), with the app's buttons as Valkyrie
// names them in English. Not in Valkyrie.
import type { RulesHelpText } from '../rulesMoM/types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    'On your activation: if you were fragged, you respawn on the active teleporter of your choice, and you ready your class card. You take 1 main action and as many bonus actions as you like, in any order. When you finish, discard the cards you played, draw up to 3 and press «End Turn» on your portrait: the app activates a group of demons.',
  actions: [
    {
      title: 'Actions',
      entries: [
        {
          term: 'Play a card',
          text: 'It gives you as many movement points as its speed and, if it has an attack box, that attack. Resolve each card fully before playing another. Reaction cards are played outside your activation.',
        },
        { term: 'Sprint', text: 'As your main action, discard 1 card from your hand and gain 6 movement points.' },
        {
          term: 'Move',
          text: 'Each square costs 1 point, diagonals too. Difficult terrain costs 1 more, and entering a square with an enemy, 1 more again. You can move through marines, but you cannot end in an occupied square. Spend your points whenever you like, except in the middle of an attack; any left over are lost.',
        },
        {
          term: 'Open a door',
          text: 'When adjacent to it, for 1 movement point: press it in the app. It never closes again. Coloured doors need their keycard. In these missions demons do not open doors.',
        },
        {
          term: 'Pick up',
          text: 'Move through the square of a weapon, a Health Pack or a keycard and press its token. A weapon adds its cards to your deck, on top; a Health Pack recovers 5 damage.',
        },
        {
          term: 'Glory Kill',
          text: "Enter a staggered demon's square (2 points): it dies, you draw a Glory Kill card and recover 2 damage. Afterwards you can keep moving.",
        },
        {
          term: 'Teleporters',
          text: 'Entering an inactive one activates it. All active ones are linked: going from one to another costs 1 point. If you arrive from another one, or respawn, on one with a demon on it, the demon dies (telefrag).',
        },
      ],
    },
    {
      title: 'Remember',
      entries: [
        { term: 'Ammo', text: 'There is none: your hand is your magazine. You can only fire a weapon if you hold one of its cards.' },
        { term: 'Portals', text: 'When a marine sees a portal (line of sight), press its token: the app says which demons come out and where.' },
        { term: 'Stunned', text: 'Remove 1 die when attacking, reveal no defense and get no cover. It goes away after attacking or being attacked.' },
      ],
    },
    {
      title: 'In the app',
      entries: [
        { term: 'End Turn', text: "On each marine's portrait, at the end of their activation." },
        { term: 'KO', text: 'On the portrait of the marine who dies: it is a frag for the invader. When they respawn, the portrait\'s other button (Recover).' },
        { term: 'Defeated', text: "On the group's portrait when the last demon of that type dies. «Unique Defeated» for a boss." },
        { term: 'Information', text: "On a group's portrait: its clarifications. «Force Activate», to play with the physical initiative deck." },
        { term: 'Mission rules', text: 'The tokens off the map show the game mode, the objective and the mission rules when pressed.' },
      ],
    },
  ],
  rules: [
    {
      title: 'The round',
      entries: [
        { term: 'At the start', text: 'The app asks you to share out Argent Power among the demon types in play (usually 3, as evenly as possible) and, if you play with it, draws an effect from the threat deck for that round.' },
        { term: 'Valkyrie mode', text: 'A marine plays their activation and presses «End Turn»; the app then activates a random group of demons from those that have not acted. This goes on until all have acted.' },
        { term: 'Normal mode', text: 'With the physical initiative deck: when an invader card comes up, choose at random a group that has not acted and press its «Force Activate»; when the deck runs out, each marine presses «End Turn».' },
        { term: 'Threat deck', text: "These are one-round effects of these missions (more dice, more armor…), not the game's Threat cards." },
      ],
    },
    {
      title: 'The demons',
      entries: [
        { term: 'Activation', text: 'The app says how far each demon moves, whom it attacks and which ability it uses. They activate one by one, with one attack each unless the ability says otherwise.' },
        { term: 'Groups', text: 'Demons of the same type form a group and act together.' },
        { term: 'Argent', text: "It goes on each demon's card and is spent on its abilities, per figure. When the last one of a type dies, its Argent goes back to the supply." },
        { term: 'Defense', text: 'When defending, the demon reveals the top card of the event deck. Only its defense counts: its text is ignored.' },
        { term: 'Flying', text: "They ignore difficult terrain and the cost of enemies' squares, and cross impassable terrain." },
        { term: 'Large', text: 'In the app they take up one square: place the figure where it fits.' },
      ],
    },
    {
      title: 'Attacks',
      entries: [
        { term: 'Range', text: "The squares up to the defender, counting the defender's. The maximum is given by the attack box." },
        { term: 'Line of sight', text: "A straight line from a corner of your square to a corner of the defender's. Walls, closed doors and blocking terrain cut it; figures do not." },
        { term: 'Roll', text: 'Roll the dice in the box. The red die has faces of 0, 1, 1, 1, 2 and 2 damage; the black one, of 1, 1, 2, 2, 2 and 3.' },
        { term: 'Defense', text: 'The marine reveals the top card of their action deck; the demon, that of the event deck. Each shield cancels 1 damage and a dodge cancels it all. The special defense icon triggers the demon\'s, and toughness gives it 1 more shield.' },
        { term: 'Cover', text: "If any line from your corner to the defender's corners crosses a wall, difficult or blocking terrain or another figure, the defender may discard the defense they revealed and reveal another." },
      ],
    },
    {
      title: 'Stagger and Glory Kills',
      entries: [
        { text: "When a demon's damage reaches its stagger value, it is staggered and can be Glory Killed." },
        { text: 'Effects that lower the printed stagger value (like the Chainsaw) do not add up: the highest one applies.' },
        { text: 'Only demons can be Glory Killed. Marines heal with Glory Kills, Health Packs and some classes.' },
      ],
    },
    {
      title: 'Death, frags and respawn',
      entries: [
        { term: 'Death', text: 'A marine dies when their damage reaches their health (10): press «KO». Remove the figure, discard its damage, shuffle the hand and discard pile into the deck and draw 3. The marine keeps their weapons and Glory Kill cards.' },
        { term: 'Respawn', text: "At the start of their next activation they place their figure on the active teleporter of their choice; press the other button of their portrait (Recover)." },
        { term: 'Frags', text: 'Each death is a frag for the invader. The mission says how many it needs to win (usually 6); when it gets there, the app declares your defeat.' },
      ],
    },
    {
      title: 'Portals',
      entries: [
        { text: 'There are blue, yellow and red ones, from least to most dangerous.' },
        { text: "When a marine sees one, press its token: the app picks one of that colour's groups, says where to place it (on the portal or next to it) and sometimes gives Argent. The token is removed." },
        { text: 'If there is no room, the figures go to the nearest empty square.' },
      ],
    },
    {
      title: 'Map and terrain',
      entries: [
        { term: 'Walls', text: 'They cannot be crossed and they cut line of sight. A closed door is a wall.' },
        { term: 'Difficult terrain', text: 'Dotted blue border: costs 1 more point and gives cover.' },
        { term: 'Blocking terrain', text: 'Solid red border: cannot be entered, cuts line of sight and gives cover.' },
        { term: 'Impassable terrain', text: 'Dotted red border: cannot be entered, but does not cut line of sight.' },
        { term: 'Diagonals', text: 'You can move diagonally, but not between two squares that only touch at a corner, unless another square at that corner is adjacent to both.' },
      ],
    },
    {
      title: 'Marines and squads',
      entries: [
        { term: 'Starting deck', text: 'In almost every mission, UAC 1 to 4 and Combat Shotgun 1 to 3; draw 3.' },
        { term: 'Class', text: 'It gives an ability that usually exhausts, and it readies at the start of your activation.' },
        { term: 'Squads', text: 'With fewer than 4 marines: with 3, one takes «Taking Point»; with 2, both take «Combat Veteran»; with 1, «Solo Operative», which gives two activations per round: between them, press «Force Activate» on a group that has not acted.' },
      ],
    },
    {
      title: 'When something is unclear',
      entries: [
        { text: "The mission's rules prevail: press its rule tokens off the map." },
        { text: "The app does not track each demon's damage, stagger or Argent, nor the marines' cards: you track them with the physical tokens and cards." },
        { text: 'The «Log» keeps what the app has said, round by round.' },
      ],
    },
  ],
};
