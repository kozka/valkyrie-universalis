// Mansions' help in French (RulesHelp.tsx), translated by Claude from the English one (October 2026): corrections by
// native speakers are welcome. The app's own words, not FFG's; the app's buttons as Valkyrie names them in French. Not in Valkyrie.
import type { RulesHelpText } from './types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    "À votre tour, vous effectuez jusqu'à 2 actions, dans l'ordre de votre choix, et vous pouvez répéter la même (se déplacer deux fois, c'est jusqu'à 4 cases). Le groupe décide qui joue chaque tour.",
  actions: [
    {
      title: 'Actions',
      entries: [
        {
          term: 'Se déplacer',
          text: "Jusqu'à 2 cases, une à la fois. Vous pouvez le fractionner : vous déplacer de 1, faire une autre action, puis vous déplacer de l'autre. Impossible de franchir les murs, les bordures en pointillés ou les portes avec une Obstruction ou un jeton Exploration.",
        },
        { term: 'Explorer', text: "Touchez un jeton Exploration dans votre case ou sur la porte à côté de vous. L'app indique quoi placer." },
        { term: 'Fouiller', text: 'Touchez un jeton Recherche dans votre case.' },
        { term: 'Interagir', text: "Touchez un jeton Interaction ou Personnage dans votre case et choisissez une option avec l'icône d'action." },
        {
          term: 'Échanger',
          text: 'Donnez, ramassez ou lâchez autant d\'Objets et de Sorts que vous voulez avec les investigateurs de votre case. Ramasser quelque chose par terre coûte aussi cette action. Les Indices ne s\'échangent pas.',
        },
        {
          term: 'Attaquer',
          text: "Choisissez le monstre dans la liste des monstres, touchez «Attaquer» puis le type d'arme. Au corps à corps ou à mains nues, dans votre case ; à distance, jusqu'à 3 cases. Notez les Dégâts avec + et −.",
        },
        { term: 'Composant', text: "Utilisez un effet «Action :» d'une carte, ou un objet de l'inventaire (le sac à dos ou «Objets», en bas à gauche)." },
        {
          term: 'Obstruction',
          text: "Placez l'Obstruction de votre case contre une porte ou un Passage secret, ou écartez-la. De l'autre côté de la porte : test de Force ; avec 2 succès, vous la poussez et passez.",
        },
        { term: 'Éteindre le feu', text: "Test d'Agilité : chaque succès défausse 1 Feu de votre case ou d'une case où vous entrez ce tour-ci." },
      ],
    },
    {
      title: 'Actions rares (surtout avec une carte Folie)',
      entries: [
        {
          term: 'Pousser',
          text: "Déplacez de 1 case un monstre ou un investigateur de votre case. Test de Force contre l'Agressivité du monstre, ou contre le résultat + 1 de l'investigateur s'il résiste. Si vous réussissez, vous pouvez le suivre.",
        },
        { term: 'Voler', text: 'Choisissez Force, Agilité ou Observation et faites tous les deux le test. Vous prenez 1 possession par succès obtenu au-delà des siens.' },
        {
          term: 'Mettre le feu',
          text: "Avec une Source de lumière, placez un Feu dans votre case ou une case adjacente. S'il n'y avait pas encore de Feu, touchez «Action» (le parchemin en bas) → «Mettre le feu» pour que l'app le propage.",
        },
      ],
    },
    {
      title: 'Gratuit (sans action)',
      entries: [
        { text: "Les jetons Vue (l'œil)." },
        { text: "Les options de l'app sans l'icône d'action : toucher un jeton pour le lire ne vous engage à rien." },
        { text: 'Les capacités qui ne disent pas «Action :».' },
      ],
    },
    {
      title: 'À retenir',
      entries: [
        {
          term: 'Évasion',
          text: "Dans la case d'un monstre, avant toute action autre qu'Attaquer ou Se déplacer, et pour la quitter : choisissez le monstre à la plus haute Conscience (chiffre vert) et touchez «Évasion». En cas d'échec, vous perdez en général l'action.",
        },
        { term: 'Blessé', text: "Vous ne pouvez faire qu'une action Se déplacer par round." },
        { term: 'Feu', text: 'Entrer dans une case avec du Feu, ou y faire ou y perdre une action, inflige 1 Dégât face cachée.' },
        { term: 'Obscurité', text: "Vous ne pouvez pas dépenser d'Indices, sauf s'il y a une Source de lumière ou un Feu dans votre case ou une case adjacente." },
      ],
    },
  ],
  rules: [
    {
      title: 'Avant de commencer',
      entries: [
        { text: 'Mélangez séparément les paquets de Dégâts et d\'Horreur et gardez-les face cachée.' },
        { text: 'Triez par nom, face visible, les Objets communs, les Objets uniques, les Sorts et les États.' },
        { text: "Triez les jetons par type. L'app indique quelles tuiles, quels jetons et quels monstres placer, et quand." },
        { text: "Répartissez les possessions de départ comme vous voulez ; les Indices, comme l'indique l'app. Lisez le prologue : il peut contenir des indices sur l'histoire." },
      ],
    },
    {
      title: 'Le round',
      entries: [
        { term: "Phase d'Investigateur", text: "Chaque investigateur joue un tour entier de jusqu'à 2 actions, dans l'ordre choisi par le groupe. Quand tout le monde a fini, touchez le bouton ➤ en bas à droite." },
        { term: 'Phase du Mythe', text: 'Dans cet ordre :' },
        { term: '1. Feu', text: "S'il y a du Feu, ajoutez 1 jeton au total (pas un par foyer) dans une case adjacente à une case avec du Feu." },
        { term: '2. Événements', text: "L'app affiche un ou plusieurs événements du Mythe ; résolvez-les tels qu'ils sont écrits." },
        { term: '3. Monstres', text: "L'app active chaque monstre, l'un après l'autre." },
        { term: '4. Horreur', text: "Chaque investigateur fait un test d'horreur contre le monstre ayant le plus d'Horreur à sa portée, s'il y en a un." },
        { text: "Touchez ➤ et un nouveau round commence. Le temps passe même si vous ne le voyez pas : l'app décide quand il est tard." },
      ],
    },
    {
      title: 'Tests',
      entries: [
        { term: 'Dés', text: "Autant que l'attribut, avec les modificateurs (au moins 1). Chaque dé a 3 faces succès, 2 faces investigation (la loupe) et 3 faces vierges." },
        { term: 'Résultat', text: "Le nombre de succès. «(Agilité −1 ; 2)» est un test d'Agilité avec un dé de moins, qui demande 2 succès." },
        { term: 'Indices', text: "Après le lancer, chaque Indice dépensé transforme 1 loupe en succès. Ce n'est pas une relance." },
        { term: 'Annuler', text: 'Si le texte dit «annulé par…», chaque succès évite 1 Dégât ou 1 Horreur.' },
        { term: 'Lancer des dés', text: "Si le texte dit seulement «lancez X dés», ce n'est pas un test : on ne peut pas dépenser d'Indices." },
        { text: "Seul l'investigateur actif lance les dés, sauf si un effet dit le contraire." },
      ],
    },
    {
      title: 'Dégâts, Horreur, Blessé et Fou',
      entries: [
        { term: 'Cartes', text: "Subir des Dégâts ou de l'Horreur, c'est piocher une carte du paquet correspondant, face visible sauf si c'est écrit «face cachée». Les cartes face cachée ne font rien : elles comptent seulement." },
        { term: 'Face visible', text: "«Résoudre immédiatement» s'applique quand vous la recevez ; «Garder face visible» agit tant qu'elle le reste. S'il faut retourner des cartes face cachée, elles sont choisies au hasard." },
        { term: 'Blessé', text: 'Quand votre total de Dégâts atteint votre Santé : vous devenez Blessé et défaussez vos Dégâts face cachée. Vous ne pouvez vous déplacer qu\'une fois par round.' },
        { term: 'Fou', text: "Pareil avec l'Horreur et la Santé mentale. Lisez en secret le dos de votre carte Folie : elle peut changer votre façon de gagner. Si elle demande plus d'investigateurs que vous n'êtes, prenez-en une autre." },
        { term: 'Éliminé', text: "Si, déjà Blessé ou Fou, vous atteignez de nouveau la limite : lâchez vos possessions et retirez votre figurine. Touchez «Action» (le parchemin en bas) → «Investigateur éliminé». Les autres perdent à la fin de la Phase d'Investigateur suivante s'ils n'ont pas terminé." },
      ],
    },
    {
      title: 'Monstres',
      entries: [
        { term: 'Jeton', text: "Conscience (vert) : celui à qui l'on échappe. Horreur (bleu) : celui contre qui l'on fait le test d'horreur. Agressivité (rouge, au dos) : dés contre les Obstructions et difficulté pour le pousser. L'app tient le compte de sa Santé." },
        { term: 'Activation', text: "Faites ce que dit l'app. «Vers» signifie que chaque pas le rapproche ; il s'arrête en atteignant sa cible. S'il n'y a aucune cible à portée, il ne bouge pas : touchez le bouton «aucun investigateur» et l'app donne un autre ordre." },
        { term: 'Portes', text: "Ils les franchissent librement, sauf si elles sont obstruées : ils lancent alors autant de dés que leur Agressivité et brisent l'Obstruction avec 2 succès ; sinon, ils perdent leur déplacement (mais attaquent quand même s'ils partagent une case avec quelqu'un)." },
        { term: "Test d'horreur", text: "Seulement à l'étape d'horreur. Si plusieurs investigateurs font le test contre le même monstre, l'app l'affiche une seule fois et chacun lance et applique le sien." },
        { term: 'Feu', text: 'Un monstre qui commence son activation dans le Feu, ou y entre, subit 1 Dégât.' },
      ],
    },
    {
      title: 'Le plan et la portée',
      entries: [
        { term: 'Cases', text: "Bordures pleines (blanches ou jaunes) : on les franchit. Bordures en pointillés : on ne les franchit pas, mais la portée passe à travers. Murs : rien ne les franchit ni ne passe à travers. Portes : on les franchit, mais la portée n'y passe pas." },
        { term: 'Portée', text: "Jusqu'à 3 cases, la vôtre comptant pour 0. Elle peut tourner aux angles : il n'y a pas de ligne de vue. Elle ne traverse ni les murs, ni les portes, ni les Passages secrets." },
        { term: 'Adjacent', text: 'Les effets sur les cases adjacentes (lumière, propagation du Feu) passent par les portes, jamais par les murs.' },
        { term: 'Passage secret', text: 'Toutes les cases avec un Passage secret sont adjacentes entre elles pour les déplacements.' },
        { term: 'Nord', text: "Toujours le haut de l'écran." },
        { term: 'Intérieur et extérieur', text: 'Les pièces extérieures ont une plaque de nom argentée avec des tentacules rouges. Certains événements les distinguent.' },
      ],
    },
    {
      title: 'Feu, Obscurité et Obstructions',
      entries: [
        { term: 'Feu', text: "Il ne peut jamais y en avoir 2 dans la même case. Il se propage par les portes, pas par les murs ; les Obstructions ne l'arrêtent pas. Un Feu que vous éteignez avec votre action ne vous inflige plus de Dégâts." },
        { term: 'Obscurité', text: "Dans sa case, on ne dépense pas d'Indices, ni pour les tests ni pour les puzzles. Une Source de lumière ou un Feu dans votre case ou une case adjacente l'annule." },
        { term: 'Obstruction', text: "Ni les investigateurs ni les monstres ne passent par une porte ou un Passage obstrué. Elle n'empêche pas les monstres d'apparaître." },
      ],
    },
    {
      title: 'Objets, Sorts et États',
      entries: [
        { term: 'Possessions', text: "Les Objets communs, les Objets uniques et les Sorts. Les Indices, les États, les Dégâts et l'Horreur n'en sont pas." },
        { term: 'Objets', text: "Vous pouvez regarder leur dos quand vous voulez. Quand un objet est retourné, son dos remplace sa face." },
        { term: 'Sorts', text: "Vous en recevez un exemplaire au hasard et ne regardez jamais son dos. Pour le lancer, vous le retournez, résolvez le dos et, presque toujours, le défaussez et gagnez un autre exemplaire." },
        { term: 'États', text: "Face visible et jamais deux exemplaires. Étourdi : seulement 1 action à votre tour. Hébété : vous ne dépensez pas d'Indices. Entravé : vous ne pouvez pas vous déplacer par vous-même. Concentré : défaussez-le pour que toutes vos loupes deviennent des succès." },
        { term: 'Armes', text: "Pour attaquer avec un type d'arme, vous devez en porter une de ce type. Vous pouvez toujours attaquer à mains nues." },
      ],
    },
    {
      title: 'Puzzles',
      entries: [
        { term: 'Étapes', text: "Autant que la valeur imprimée de l'attribut demandé par l'app, plus 1 par Indice dépensé (pas dans l'Obscurité). L'app ne les compte pas : comptez-les vous-mêmes." },
        { term: 'Fermer', text: "Quand les étapes sont épuisées, touchez «Fermer» : la progression est conservée et quelqu'un peut continuer plus tard avec une autre action. Vous pouvez vous conseiller." },
        { term: 'Image', text: "Reconstituez l'image en échangeant deux pièces voisines par étape." },
        { term: 'Mécanisme', text: "Faites glisser des blocs, un par étape, jusqu'à ce que la pièce cible sorte par la droite." },
        { term: 'Code', text: "Proposez un code par étape. Un succès pour chaque symbole à sa place ; une loupe pour chaque bon symbole mal placé." },
        { term: 'Tour', text: "Déplacez la pièce du haut d'une colonne vers une autre jusqu'à toutes les empiler, de la plus grande à la plus petite." },
      ],
    },
    {
      title: 'Extensions',
      entries: [
        { term: 'Clé', text: "Un objet avec un jeton Clé gagne les traits Clé et Preuve et ne peut pas être défaussé, mais il peut être échangé ou volé." },
        { term: 'Tuiles qui bougent ou se superposent', text: "Elles se déplacent avec tout ce qu'elles portent. Une tuile posée sur une autre ne couvre jamais une case entière ; ce qui est couvert ne fait plus partie du plateau." },
        { term: 'Élixirs', text: "Gagnés au hasard ; ne regardez pas le dos avant qu'un effet ne les retourne. Face visible, ce sont des possessions ; face cachée, non." },
        { term: 'Améliorations', text: "+1 à la valeur imprimée d'un attribut, une fois par attribut. Ce ne sont pas des possessions." },
        { term: 'Entrave', text: "Il n'est pas nécessaire d'échapper à un monstre dans sa case. Quand ce monstre s'active, vous pouvez la défausser pour qu'il ne bouge pas." },
        { term: 'Décombres', text: "Pas de Fouiller, d'Explorer ni d'Interagir. Test de Force : 1 jeton par succès ; une Arme lourde les retire tous." },
        { term: 'Végétation', text: "Pour sortir, test d'Observation d'une difficulté égale au nombre de jetons ; en cas d'échec, lâchez un objet au hasard. Une Arme tranchante les retire ; le Feu aussi." },
        { term: 'Eau', text: "Y entrer met fin à votre déplacement (sauf pour les monstres aquatiques, volants ou intangibles). Elle éteint le Feu." },
        { term: 'Faille', text: "Faire une action autre que se déplacer dans sa case vous rend Perdu dans le temps et l'espace. Test de Savoir pour les refermer : 1 par succès." },
      ],
    },
    {
      title: "En cas de doute",
      entries: [
        { text: "Si un effet peut toucher plusieurs investigateurs, ou si plusieurs se produisent en même temps, le groupe décide. Si vous n'êtes pas d'accord, un investigateur au hasard décide." },
        { text: "Les effets sur un investigateur éliminé s'appliquent autant que possible." },
        { text: "Le Journal (le livre ou «Journal», en bas) garde tout ce qu'a dit l'app, par round." },
      ],
    },
  ],
};
