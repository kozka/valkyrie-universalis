// DooM's help in French (RulesHelp.tsx), translated by Claude from the English one (October 2026): corrections by
// native speakers are welcome. The app's own words, not FFG's; the app's buttons as Valkyrie names them in French. Not in Valkyrie.
import type { RulesHelpText } from '../rulesMoM/types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    "Lors de votre activation : si vous avez été fraggé, vous réapparaissez sur le téléporteur actif de votre choix, et vous préparez votre carte de classe. Vous effectuez 1 action principale et autant d'actions bonus que vous voulez, dans l'ordre de votre choix. Quand vous avez fini, défaussez les cartes jouées, piochez jusqu'à 3 et touchez «Fin du tour» sur votre portrait : l'app active un groupe de démons.",
  actions: [
    {
      title: 'Actions',
      entries: [
        {
          term: 'Jouer une carte',
          text: "Elle vous donne autant de points de mouvement que sa vitesse et, si elle a un encadré d'attaque, cette attaque. Résolvez entièrement chaque carte avant d'en jouer une autre. Les cartes Réaction se jouent en dehors de votre activation.",
        },
        { term: 'Sprint', text: 'Comme action principale, défaussez 1 carte de votre main et gagnez 6 points de mouvement.' },
        {
          term: 'Se déplacer',
          text: "Chaque case coûte 1 point, en diagonale aussi. Le terrain difficile coûte 1 de plus, et entrer dans une case avec un ennemi, encore 1 de plus. Vous pouvez traverser les marines, mais vous ne pouvez pas finir dans une case occupée. Dépensez vos points quand vous voulez, sauf au milieu d'une attaque ; ceux qui restent sont perdus.",
        },
        {
          term: 'Ouvrir une porte',
          text: "Quand vous y êtes adjacent, pour 1 point de mouvement : touchez-la dans l'app. Elle ne se referme jamais. Les portes de couleur exigent leur carte d'accès. Dans ces missions, les démons n'ouvrent pas les portes.",
        },
        {
          term: 'Ramasser',
          text: "Passez par la case d'une arme, d'un kit de soin ou d'une carte d'accès et touchez son jeton. Une arme ajoute ses cartes à votre paquet, sur le dessus ; un kit de soin fait récupérer 5 dégâts.",
        },
        {
          term: 'Glory Kill',
          text: "Entrez dans la case d'un démon chancelant (2 points) : il meurt, vous piochez une carte Glory Kill et récupérez 2 dégâts. Ensuite, vous pouvez continuer à vous déplacer.",
        },
        {
          term: 'Téléporteurs',
          text: "Entrer dans un téléporteur inactif l'active. Tous les actifs sont reliés : passer de l'un à l'autre coûte 1 point. Si vous arrivez d'un autre, ou réapparaissez, sur un téléporteur où se trouve un démon, le démon meurt (télé-frag).",
        },
      ],
    },
    {
      title: 'Rappel',
      entries: [
        { term: 'Munitions', text: "Il n'y en a pas : votre main est votre chargeur. Vous ne pouvez tirer avec une arme que si vous avez l'une de ses cartes." },
        { term: 'Portails', text: "Quand un marine voit un portail (ligne de vue), touchez son jeton : l'app dit quels démons en sortent et où." },
        { term: 'Étourdi', text: "Retirez 1 dé en attaquant, ne révélez aucune défense et ne bénéficiez d'aucun couvert. Cela disparaît après avoir attaqué ou avoir été attaqué." },
      ],
    },
    {
      title: "Dans l'app",
      entries: [
        { term: 'Fin du tour', text: 'Sur le portrait de chaque marine, à la fin de son activation.' },
        { term: 'KO', text: "Sur le portrait du marine qui meurt : c'est un frag pour l'envahisseur. Quand il réapparaît, l'autre bouton du portrait (Récupérer)." },
        { term: 'Éliminé', text: "Sur le portrait du groupe quand le dernier démon de ce type meurt. «Unique Battu» pour un boss." },
        { term: 'Information', text: "Sur le portrait d'un groupe : ses précisions. «Forcer l'activation», pour jouer avec le paquet d'initiative physique." },
        { term: 'Règles de la mission', text: "Les jetons hors de la carte montrent le mode de jeu, l'objectif et les règles de la mission quand on les touche." },
      ],
    },
  ],
  rules: [
    {
      title: 'La ronde',
      entries: [
        { term: 'Au début', text: "L'app vous demande de répartir l'énergie Argent entre les types de démons en jeu (généralement 3, le plus équitablement possible) et, si vous jouez avec, pioche un effet du paquet de menace pour cette ronde." },
        { term: 'Mode Valkyrie', text: "Un marine joue son activation et touche «Fin du tour» ; l'app active alors un groupe de démons au hasard parmi ceux qui n'ont pas agi. On continue ainsi jusqu'à ce que tous aient agi." },
        { term: 'Mode normal', text: "Avec le paquet d'initiative physique : quand une carte de l'envahisseur sort, choisissez au hasard un groupe qui n'a pas agi et touchez son «Forcer l'activation» ; quand le paquet est épuisé, chaque marine touche «Fin du tour»." },
        { term: 'Paquet de menace', text: "Ce sont des effets d'une ronde propres à ces missions (plus de dés, plus d'armure…), pas les cartes Menace du jeu." },
      ],
    },
    {
      title: 'Les démons',
      entries: [
        { term: 'Activation', text: "L'app dit de combien se déplace chaque démon, qui il attaque et quelle capacité il utilise. Ils s'activent un par un, avec une attaque chacun sauf si la capacité dit autre chose." },
        { term: 'Groupes', text: 'Les démons du même type forment un groupe et agissent ensemble.' },
        { term: 'Argent', text: "Il se place sur la carte de chaque démon et se dépense pour ses capacités, par figurine. Quand le dernier d'un type meurt, son Argent retourne à la réserve." },
        { term: 'Défense', text: "En défense, le démon révèle la carte du dessus du paquet d'événements. Seule sa défense compte : son texte est ignoré." },
        { term: 'Volants', text: "Ils ignorent le terrain difficile et le coût des cases ennemies, et traversent le terrain infranchissable." },
        { term: 'Grands', text: "Dans l'app, ils occupent une case : placez la figurine là où elle tient." },
      ],
    },
    {
      title: 'Attaques',
      entries: [
        { term: 'Portée', text: "Les cases jusqu'au défenseur, en comptant la sienne. Le maximum est donné par l'encadré d'attaque." },
        { term: 'Ligne de vue', text: "Une ligne droite d'un coin de votre case à un coin de celle du défenseur. Les murs, les portes fermées et le terrain bloquant la coupent ; les figurines non." },
        { term: 'Lancer', text: "Lancez les dés de l'encadré. Le dé rouge a des faces de 0, 1, 1, 1, 2 et 2 dégâts ; le noir, de 1, 1, 2, 2, 2 et 3." },
        { term: 'Défense', text: "Le marine révèle la carte du dessus de son paquet d'actions ; le démon, celle du paquet d'événements. Chaque bouclier annule 1 dégât et une esquive les annule tous. L'icône de défense spéciale déclenche celle du démon, et la robustesse lui donne 1 bouclier de plus." },
        { term: 'Couvert', text: "Si une ligne quelconque de votre coin aux coins du défenseur traverse un mur, du terrain difficile ou bloquant ou une autre figurine, le défenseur peut défausser la défense révélée et en révéler une autre." },
      ],
    },
    {
      title: 'Chancellement et Glory Kills',
      entries: [
        { text: "Quand les dégâts d'un démon atteignent sa valeur de chancellement, il est chancelant et peut subir une Glory Kill." },
        { text: "Les effets qui réduisent la valeur de chancellement imprimée (comme la Tronçonneuse) ne se cumulent pas : on applique le plus élevé." },
        { text: "Seuls les démons peuvent subir une Glory Kill. Les marines se soignent avec les Glory Kills, les kits de soin et certaines classes." },
      ],
    },
    {
      title: 'Mort, frags et réapparition',
      entries: [
        { term: 'Mort', text: "Un marine meurt quand ses dégâts atteignent sa santé (10) : touchez «KO». Retirez la figurine, défaussez ses dégâts, mélangez sa main et sa défausse dans son paquet et piochez 3. Le marine garde ses armes et ses cartes Glory Kill." },
        { term: 'Réapparition', text: "Au début de sa prochaine activation, il place sa figurine sur le téléporteur actif de son choix ; touchez l'autre bouton de son portrait (Récupérer)." },
        { term: 'Frags', text: "Chaque mort est un frag pour l'envahisseur. La mission dit combien il lui en faut pour gagner (généralement 6) ; quand il y arrive, l'app déclare votre défaite." },
      ],
    },
    {
      title: 'Portails',
      entries: [
        { text: 'Il y en a des bleus, des jaunes et des rouges, du moins au plus dangereux.' },
        { text: "Quand un marine en voit un, touchez son jeton : l'app choisit l'un des groupes de cette couleur, dit où le placer (sur le portail ou à côté) et donne parfois de l'Argent. Le jeton est retiré." },
        { text: "S'il n'y a pas de place, les figurines vont dans la case vide la plus proche." },
      ],
    },
    {
      title: 'Carte et terrain',
      entries: [
        { term: 'Murs', text: "On ne peut pas les franchir et ils coupent la ligne de vue. Une porte fermée est un mur." },
        { term: 'Terrain difficile', text: 'Bordure bleue en pointillés : coûte 1 point de plus et donne un couvert.' },
        { term: 'Terrain bloquant', text: "Bordure rouge continue : on ne peut pas y entrer, il coupe la ligne de vue et donne un couvert." },
        { term: 'Terrain infranchissable', text: "Bordure rouge en pointillés : on ne peut pas y entrer, mais il ne coupe pas la ligne de vue." },
        { term: 'Diagonales', text: "Vous pouvez vous déplacer en diagonale, mais pas entre deux cases qui ne se touchent que par un coin, sauf si une autre case de ce coin est adjacente aux deux." },
      ],
    },
    {
      title: 'Marines et escouades',
      entries: [
        { term: 'Paquet de départ', text: 'Dans presque toutes les missions, UAC 1 à 4 et Fusil de combat 1 à 3 ; piochez 3.' },
        { term: 'Classe', text: "Elle donne une capacité qui s'épuise généralement, et elle se prépare au début de votre activation." },
        { term: 'Escouades', text: "Avec moins de 4 marines : à 3, l'un prend «Taking Point» ; à 2, les deux prennent «Combat Veteran» ; à 1, «Solo Operative», qui donne deux activations par ronde : entre les deux, touchez «Forcer l'activation» sur un groupe qui n'a pas agi." },
      ],
    },
    {
      title: "Quand quelque chose n'est pas clair",
      entries: [
        { text: 'Les règles de la mission priment : touchez ses jetons de règles hors de la carte.' },
        { text: "L'app ne suit ni les dégâts, ni le chancellement, ni l'Argent de chaque démon, ni les cartes des marines : vous les suivez avec les jetons et les cartes physiques." },
        { text: "Le «Journal» garde ce que l'app a dit, ronde après ronde." },
      ],
    },
  ],
};
