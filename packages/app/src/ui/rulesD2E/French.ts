// Descent's help in French (RulesHelp.tsx), translated by Claude from the English one (October 2026): corrections by
// native speakers are welcome. The app's own words, not FFG's; the app's buttons as Valkyrie names them in French. Not in Valkyrie.
import type { RulesHelpText } from '../rulesMoM/types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    "Au début de votre tour, les effets qui durent «jusqu'à votre prochain tour» prennent fin, vous résolvez ceux «au début de votre tour», vous restaurez vos cartes épuisées et vous pouvez changer d'équipement. Ensuite, vous effectuez jusqu'à 2 actions, dans l'ordre de votre choix ; vous pouvez répéter la même ou ne pas les faire. Quand vous avez fini, touchez «Fin du tour» sur votre portrait : l'app active un groupe de monstres.",
  actions: [
    {
      title: 'Actions',
      entries: [
        {
          term: 'Se déplacer',
          text: "Vous gagnez autant de points de mouvement que votre Vitesse ; chaque case coûte 1, en diagonale aussi. Vous pouvez le fractionner pour faire une autre action entre-temps. Vous pouvez traverser les héros, pas les monstres, et vous ne pouvez pas finir dans une case occupée.",
        },
        { term: 'Attaquer', text: "Avec une arme équipée, ou à mains nues (le dé bleu seul, au corps à corps). Voir «Attaques» dans le résumé des règles." },
        { term: 'Utiliser une compétence', text: "Une carte de classe avec l'icône d'action, en payant sa fatigue." },
        { term: 'Se reposer', text: "À la fin de votre tour, vous récupérez toute votre fatigue, même si c'était votre première action." },
        { term: 'Fouiller', text: "Un jeton Fouille dans votre case ou adjacent : touchez-le dans l'app et elle vous dit ce que vous trouvez." },
        {
          term: 'Ouvrir une porte',
          text: "Une porte adjacente : touchez-la dans l'app, lisez son texte et confirmez. Elle révèle généralement de nouvelles tuiles, de nouveaux jetons et de nouveaux monstres. Dans Road to Legend, les portes ne se referment jamais.",
        },
        {
          term: 'Ranimer un héros',
          text: "Un héros mis KO dont le jeton est adjacent : lancez 2 dés rouges, il récupère 1 dégât par cœur et 1 fatigue par afflux, et il revient sur la carte. À son prochain tour, il joue normalement.",
        },
        { term: 'Action spéciale', text: "Ce que permettent les cartes, les objets ou la quête avec l'icône d'action : ramasser un objectif, parler à un villageois, tirer un levier…" },
      ],
    },
    {
      title: 'Si vous êtes mis KO',
      entries: [
        {
          term: 'Se relever',
          text: "C'est la seule chose que vous pouvez faire ce tour-là : lancez 2 dés rouges, récupérez 1 dégât par cœur et 1 fatigue par afflux, et placez votre figurine là où était votre jeton. Puis votre tour se termine. Touchez quand même «Fin du tour».",
        },
      ],
    },
    {
      title: 'Sans dépenser d\'action',
      entries: [
        { text: "Examiner n'importe quel jeton ou porte dans l'app, même si vous n'êtes pas à côté, avant de décider." },
        { text: 'Subir 1 fatigue pour chaque point de mouvement supplémentaire, sans dépasser votre Endurance.' },
        { text: "Échanger des objets avec un héros adjacent après une action de déplacement. Les cartes de classe ne s'échangent pas." },
        { text: 'Dépenser un afflux restant lors d\'une attaque pour récupérer 1 fatigue.' },
        { text: "Avec exactement 2 héros, chacun peut faire une attaque normale gratuite par tour ; s'il ne la fait pas, il récupère 2 dégâts à la fin de son tour." },
      ],
    },
    {
      title: "Dans l'app",
      entries: [
        { term: 'Fin du tour', text: "Sur le portrait de chaque héros, à la fin de son tour, même s'il est mis KO. Si on ne la touche pas, la ronde n'avance pas." },
        { term: 'KO', text: "Sur le portrait du héros mis KO : le moral baisse. Quand il revient sur la carte, l'autre bouton du portrait (Récupérer)." },
        { term: 'Éliminé', text: "Sur le portrait du groupe de monstres quand le dernier tombe. «Unique Battu» si c'est le monstre unique qui tombe." },
        { term: 'Information', text: "Sur le portrait d'un groupe : ses précisions et l'ordre dans lequel il dépense ses afflux. «Forcer l'activation», si la quête le demande." },
        { term: 'Compétences et Objets', text: "Les boutons du bas : les compétences et l'expérience de chaque héros, et les objets et l'or du groupe." },
      ],
    },
  ],
  rules: [
    {
      title: 'La ronde',
      entries: [
        { text: "Le groupe choisit un héros qui n'a pas joué ; il fait son tour et touche «Fin du tour». L'app active alors un groupe de monstres au hasard parmi ceux qui ne l'ont pas encore été. On recommence, héros puis groupe." },
        { text: "Si un camp n'a plus de tours, l'autre joue les siens à la suite." },
        { term: 'Fin de la ronde', text: "Quand tout le monde a joué, on résout les effets de fin de ronde que nomme la quête (renforts, périls…) et une nouvelle ronde commence. L'app sauvegarde la partie au début de chaque ronde." },
        { text: "Les capacités «une fois par tour» des héros ne s'utilisent pas pendant les activations des monstres." },
      ],
    },
    {
      title: 'Activation des monstres',
      entries: [
        { term: 'Fenêtre', text: "Un effet spécial pour cette activation et la liste des actions des maîtres («Maître», figurines rouges) et des serviteurs («Serviteur», figurines beiges), dans l'ordre affiché." },
        { term: 'Chaque monstre', text: "Parcourt la liste de haut en bas et fait la première action possible, jusqu'à en avoir fait 2 ; s'il arrive au bout, il reprend en haut. 1 seule attaque par activation, sauf avec des capacités comme Ravage." },
        { term: 'Ignoré', text: "Ce qu'il ne peut pas faire ou qui n'aurait aucun effet : se déplacer là où il est déjà, attaquer sans cible valide ou sans ligne de vue, une deuxième attaque." },
        { term: 'Repérer', text: "Se déplacer jusqu'à être à 3 cases ou moins de la cible et avec une ligne de vue." },
        { term: 'Engager', text: "Se déplacer jusqu'à être adjacent à la cible. Avec Allonge, il s'arrête à 2 cases avec une ligne de vue." },
        { term: 'Battre en retraite', text: "Dépenser le mouvement qui lui reste en s'éloignant de l'ennemi le plus proche." },
        { term: 'Égalités', text: "Entre cibles, la plus proche ; en cas de nouvelle égalité, vous décidez." },
        { text: 'Quand tous ceux d\'un type ont fini, touchez «Maître Activé» ou «Serviteur Activé».' },
      ],
    },
    {
      title: 'Mouvement et terrain',
      entries: [
        { term: 'Diagonales', text: "Vous pouvez vous déplacer en diagonale, mais pas à travers l'angle d'un mur." },
        { term: 'Eau', text: 'Y entrer coûte 2 points de mouvement.' },
        { term: 'Fosse', text: "En y entrant, vous subissez 2 dégâts. À l'intérieur, vous ne pouvez pas dépenser de points de mouvement : vous en sortez avec une action vers une case vide adjacente." },
        { term: 'Lave', text: "En y entrant, vous subissez 1 dégât, et une figurine qui y termine son tour est vaincue." },
        { term: 'Obstacle', text: 'Bloque le mouvement et la ligne de vue.' },
        { term: 'Monstres', text: "Ils ne peuvent pas subir de fatigue pour se déplacer plus loin. Ils évitent les fosses et la lave, et n'empruntent l'eau que si cela leur coûte moins." },
        { term: 'Grands monstres', text: "Ils comptent leur mouvement depuis l'une de leurs cases, comme s'ils étaient petits, et à la fin on les place de sorte que l'une de leurs cases soit la case finale." },
      ],
    },
    {
      title: 'Ligne de vue, cases et adjacence',
      entries: [
        { term: 'Ligne de vue', text: "Une ligne droite d'un coin de votre case à un coin de celle de la cible. Elle est bloquée par les figurines, les obstacles, les murs et les portes ; toucher seulement un coin ne la bloque pas. Des cases adjacentes se voient toujours." },
        { term: 'Compter les cases', text: "Le chemin le plus court, sans compter la case de départ. Les figurines et le terrain qui n'est pas un obstacle ne comptent pas ; on ne compte pas à travers les murs ni les portes fermées." },
        { term: 'Adjacent', text: "Des cases qui partagent un côté ou un coin, sauf si un mur ou une porte les sépare." },
      ],
    },
    {
      title: 'Attaques',
      entries: [
        { term: 'Lancer', text: "L'attaquant lance le dé bleu et ses dés de puissance, et le défenseur ses dés de défense, tous en même temps. Un X sur le dé bleu est un échec." },
        { term: 'À distance', text: "La portée totale des dés doit atteindre le nombre de cases jusqu'à la cible ; contre une cible adjacente, il en faut au moins 1." },
        { term: 'Afflux', text: "Chaque afflux se dépense sur une capacité d'afflux différente, chacune une fois par attaque." },
        { term: 'Dégâts', text: "Les cœurs obtenus moins les boucliers du défenseur. Infliger 0 n'est pas un échec. Un état venant d'un afflux ne s'applique que si l'attaque inflige au moins 1 dégât." },
        { term: 'Explosion', text: "Touche aussi toutes les cases adjacentes à la cible. Contre plusieurs monstres, dans Road to Legend, la cible subit tous les dégâts et les autres la moitié, arrondie au supérieur, avant les boucliers." },
        { term: 'Perforation X', text: 'Ignore X boucliers.' },
      ],
    },
    {
      title: "Tests d'attribut",
      entries: [
        { text: "Lancez 1 dé gris et 1 dé noir et comptez les boucliers : s'ils sont inférieurs ou égaux à l'attribut (Force, Connaissance, Volonté ou Perception), vous réussissez le test." },
        { text: 'Les monstres maîtres et serviteurs échouent toujours ; les lieutenants testent avec leurs propres attributs.' },
        { text: "L'app ne lance pas de dés : le texte dit ce qui se passe si vous réussissez et si vous échouez." },
      ],
    },
    {
      title: 'Dégâts, fatigue, KO et moral',
      entries: [
        { term: 'Santé', text: 'Quand les dégâts égalent ou dépassent la Santé, la figurine est vaincue.' },
        { term: 'Fatigue', text: "La fatigue que vous choisissez de subir ne dépasse jamais votre Endurance. Celle qu'un effet vous impose, si elle ne tient pas, vous la subissez en dégâts. Les monstres subissent des dégâts au lieu de la fatigue." },
        { term: 'Mis KO', text: "Vous subissez de la fatigue jusqu'à votre Endurance, remplacez votre figurine par votre jeton de héros, défaussez vos états et, si c'était votre tour, il se termine. Touchez «KO» sur votre portrait." },
        { term: 'Moral', text: "Il commence égal au nombre de héros et baisse de 1 à chaque KO. S'il est à 0 et qu'un autre héros tombe, vous fuyez et perdez la quête." },
      ],
    },
    {
      title: 'États',
      entries: [
        { text: "Vous ne pouvez pas avoir deux exemplaires du même. Les tests d'état se font au début du tour. Quand vous êtes mis KO, vous les défaussez tous." },
        { term: 'Empoisonné', text: 'Test de Force : si vous échouez, vous subissez 1 dégât et le gardez.' },
        { term: 'Malade', text: 'Test de Volonté : si vous échouez, vous subissez 1 fatigue et le gardez.' },
        { term: 'Immobilisé', text: "Vous ne pouvez pas faire d'actions de déplacement. Défaussé à la fin de votre tour." },
        { term: 'Étourdi', text: "La seule action que vous pouvez faire est de le défausser ; ensuite, votre autre action normalement." },
        { term: 'En feu', text: "À la fin de votre tour, vous et chaque figurine alliée adjacente subissez 1 dégât. Retiré par une action de votre part ou de quelqu'un d'adjacent." },
        { term: 'Maudit', text: "Vous ne pouvez pas utiliser d'actions de compétence. Retiré en réussissant un test de Connaissance au début du tour." },
        { term: 'Affaibli', text: "1 bouclier de moins en défense et 1 cœur de moins en attaque. Retiré quand vous vous reposez." },
        { term: 'Saignement', text: "Vous subissez 1 fatigue pour chaque action autre que le défausser." },
        { term: 'Condamné', text: 'Chaque fois que vous subissez des dégâts, vous subissez 1 dégât de plus. Retiré en dépensant un afflux.' },
        { term: 'Terrifié', text: "Vous ne pouvez pas dépenser d'afflux. Retiré à la fin de votre tour si vous ne voyez aucun ennemi." },
      ],
    },
    {
      title: 'Héros, équipement et fouille',
      entries: [
        { term: 'Caractéristiques', text: 'Vitesse (mouvement), Santé, Endurance (fatigue maximale), Défense, et les attributs Force, Connaissance, Volonté et Perception.' },
        { term: 'Exploit héroïque', text: 'Une fois par quête ; quand vous l\'utilisez, retournez votre fiche de héros.' },
        { term: 'Équipement', text: "Deux mains (une arme à deux mains les occupe toutes les deux), une armure et deux autres objets. On ne peut le changer qu'au début de votre tour." },
        { term: 'Épuiser', text: "Une carte utilisée est tournée sur le côté et ne peut plus servir tant que vous ne la restaurez pas au début de votre tour." },
        { term: 'Fouille', text: "Les cartes Fouille sont défaussées à la fin de la quête. L'or appartient à tout le groupe." },
      ],
    },
    {
      title: 'Objectif, victoire et défaite',
      entries: [
        { text: "La quête donne l'objectif et peut le changer («Objectif mis à jour»). Vous gagnez en l'accomplissant." },
        { text: "Vous perdez par le moral ou comme le dit la quête. Si vous traînez, à la fin de certaines rondes, des périls de plus en plus graves frappent." },
        { term: 'À la fin', text: "Les héros récupèrent tous leurs dégâts et leur fatigue, remettent leur fiche de héros face visible, et défaussent leurs états et leurs cartes Fouille. L'or, l'expérience, les objets et la renommée sont conservés." },
      ],
    },
    {
      title: "Quand quelque chose n'est pas clair",
      entries: [
        { text: 'Les cartes priment sur les règles générales, et les règles de la quête sur tout le reste.' },
        { text: "Si un effet permet plusieurs options, le groupe décide. L'app ne vérifie aucune règle : c'est vous qui les appliquez." },
        { text: "L'app ne sait pas où sont les figurines, ni leurs dégâts ni leurs états : si vous sauvegardez en pleine quête, notez-les. Le «Journal» garde ce que l'app a dit." },
      ],
    },
  ],
};
