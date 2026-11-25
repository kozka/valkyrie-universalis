// DooM's help in Italian (RulesHelp.tsx), translated by Claude from the English one (October 2026): corrections by
// native speakers are welcome. The app's own words, not FFG's; the app's buttons as Valkyrie names them in Italian. Not in Valkyrie.
import type { RulesHelpText } from '../rulesMoM/types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    "Nella tua attivazione: se sei stato fraggato, rinasci sul teletrasporto attivo che preferisci, e prepari la tua carta classe. Esegui 1 azione principale e tutte le azioni bonus che vuoi, in qualsiasi ordine. Quando hai finito, scarta le carte che hai giocato, pesca fino ad averne 3 e premi «Fine Turno» sul tuo ritratto: l'app attiva un gruppo di demoni.",
  actions: [
    {
      title: 'Azioni',
      entries: [
        {
          term: 'Giocare una carta',
          text: "Ti dà tanti punti movimento quanta è la sua velocità e, se ha un riquadro d'attacco, quell'attacco. Risolvi ogni carta completamente prima di giocarne un'altra. Le carte reazione si giocano fuori dalla tua attivazione.",
        },
        { term: 'Scatto', text: 'Come azione principale, scarta 1 carta dalla mano e ottieni 6 punti movimento.' },
        {
          term: 'Muoversi',
          text: "Ogni casella costa 1 punto, anche in diagonale. Il terreno difficile costa 1 in più, ed entrare in una casella con un nemico, 1 in più ancora. Puoi attraversare i marine, ma non puoi terminare in una casella occupata. Spendi i tuoi punti quando vuoi, tranne che nel mezzo di un attacco; quelli avanzati vanno persi.",
        },
        {
          term: 'Aprire una porta',
          text: "Quando le sei adiacente, per 1 punto movimento: premila nell'app. Non si richiude mai. Le porte colorate richiedono la loro tessera magnetica. In queste missioni i demoni non aprono le porte.",
        },
        {
          term: 'Raccogliere',
          text: "Passa per la casella di un'arma, di un Kit Medico o di una tessera magnetica e premi il suo segnalino. Un'arma aggiunge le sue carte al tuo mazzo, in cima; un Kit Medico recupera 5 danni.",
        },
        {
          term: 'Glory Kill',
          text: 'Entra nella casella di un demone vacillante (2 punti): muore, peschi una carta Glory Kill e recuperi 2 danni. Dopo puoi continuare a muoverti.',
        },
        {
          term: 'Teletrasporti',
          text: "Entrare in uno inattivo lo attiva. Tutti quelli attivi sono collegati: passare dall'uno all'altro costa 1 punto. Se arrivi da un altro, o rinasci, su uno con sopra un demone, il demone muore (telefrag).",
        },
      ],
    },
    {
      title: 'Ricorda',
      entries: [
        { term: 'Munizioni', text: "Non ce ne sono: la tua mano è il tuo caricatore. Puoi sparare con un'arma solo se hai in mano una delle sue carte." },
        { term: 'Portali', text: "Quando un marine vede un portale (linea di vista), premi il suo segnalino: l'app dice quali demoni escono e dove." },
        { term: 'Stordito', text: 'Togli 1 dado quando attacchi, non riveli difesa e non ottieni copertura. Se ne va dopo aver attaccato o essere stato attaccato.' },
      ],
    },
    {
      title: "Nell'app",
      entries: [
        { term: 'Fine Turno', text: 'Sul ritratto di ogni marine, alla fine della sua attivazione.' },
        { term: 'KO', text: "Sul ritratto del marine che muore: è un frag per l'invasore. Quando rinasce, l'altro pulsante del ritratto (Recupera)." },
        { term: 'Sconfitto', text: "Sul ritratto del gruppo quando muore l'ultimo demone di quel tipo. «Unico Sconfitto» per un boss." },
        { term: 'Informazioni', text: "Sul ritratto di un gruppo: i suoi chiarimenti. «Attivazione forzata», per giocare con il mazzo iniziativa fisico." },
        { term: 'Regole della missione', text: "I segnalini fuori dalla mappa, se premuti, mostrano la modalità di gioco, l'obiettivo e le regole della missione." },
      ],
    },
  ],
  rules: [
    {
      title: 'Il round',
      entries: [
        { term: "All'inizio", text: "L'app ti chiede di distribuire l'Energia Argent tra i tipi di demoni in gioco (di solito 3, nel modo più equo possibile) e, se ci giocate, pesca un effetto dal mazzo minaccia per quel round." },
        { term: 'Modalità Valkyrie', text: "Un marine gioca la sua attivazione e preme «Fine Turno»; poi l'app attiva un gruppo di demoni a caso tra quelli che non hanno agito. Si continua così finché tutti hanno agito." },
        { term: 'Modalità normale', text: "Con il mazzo iniziativa fisico: quando esce una carta dell'invasore, scegli a caso un gruppo che non ha agito e premi il suo «Attivazione forzata»; quando il mazzo finisce, ogni marine preme «Fine Turno»." },
        { term: 'Mazzo minaccia', text: 'Sono effetti di un round di queste missioni (più dadi, più armatura…), non le carte Minaccia del gioco.' },
      ],
    },
    {
      title: 'I demoni',
      entries: [
        { term: 'Attivazione', text: "L'app dice di quanto si muove ogni demone, chi attacca e quale capacità usa. Si attivano uno per uno, con un attacco ciascuno salvo che la capacità dica altrimenti." },
        { term: 'Gruppi', text: 'I demoni dello stesso tipo formano un gruppo e agiscono insieme.' },
        { term: 'Argent', text: "Va sulla carta di ogni demone e si spende nelle sue capacità, per miniatura. Quando muore l'ultimo di un tipo, il suo Argent torna nella riserva." },
        { term: 'Difesa', text: 'Quando difende, il demone rivela la prima carta del mazzo eventi. Conta solo la sua difesa: il suo testo si ignora.' },
        { term: 'Volanti', text: 'Ignorano il terreno difficile e il costo delle caselle dei nemici, e attraversano il terreno invalicabile.' },
        { term: 'Grandi', text: "Nell'app occupano una casella: piazza la miniatura dove ci sta." },
      ],
    },
    {
      title: 'Attacchi',
      entries: [
        { term: 'Gittata', text: "Le caselle fino al difensore, contando quella del difensore. Il massimo è indicato dal riquadro d'attacco." },
        { term: 'Linea di vista', text: 'Una linea retta da un angolo della tua casella a un angolo di quella del difensore. Muri, porte chiuse e terreno bloccante la interrompono; le miniature no.' },
        { term: 'Tiro', text: 'Tira i dadi del riquadro. Il dado rosso ha facce da 0, 1, 1, 1, 2 e 2 danni; quello nero, da 1, 1, 2, 2, 2 e 3.' },
        { term: 'Difesa', text: "Il marine rivela la prima carta del suo mazzo azioni; il demone, quella del mazzo eventi. Ogni scudo annulla 1 danno e una schivata li annulla tutti. L'icona di difesa speciale attiva quella del demone, e la robustezza gli dà 1 scudo in più." },
        { term: 'Copertura', text: 'Se una qualsiasi linea dal tuo angolo agli angoli del difensore attraversa un muro, terreno difficile o bloccante o un\'altra miniatura, il difensore può scartare la difesa che ha rivelato e rivelarne un\'altra.' },
      ],
    },
    {
      title: 'Vacillare e Glory Kill',
      entries: [
        { text: 'Quando i danni di un demone raggiungono il suo valore di vacillamento, è vacillante e può subire una Glory Kill.' },
        { text: 'Gli effetti che abbassano il valore di vacillamento stampato (come la Motosega) non si sommano: si applica il più alto.' },
        { text: 'Solo i demoni possono subire una Glory Kill. I marine si curano con le Glory Kill, i Kit Medici e alcune classi.' },
      ],
    },
    {
      title: 'Morte, frag e rinascita',
      entries: [
        { term: 'Morte', text: 'Un marine muore quando i suoi danni raggiungono la sua salute (10): premi «KO». Rimuovi la miniatura, scarta i suoi danni, mescola la mano e la pila degli scarti nel mazzo e pesca 3 carte. Il marine conserva le sue armi e le sue carte Glory Kill.' },
        { term: 'Rinascita', text: "All'inizio della sua attivazione successiva piazza la sua miniatura sul teletrasporto attivo che preferisce; premi l'altro pulsante del suo ritratto (Recupera)." },
        { term: 'Frag', text: "Ogni morte è un frag per l'invasore. La missione dice quanti gliene servono per vincere (di solito 6); quando ci arriva, l'app dichiara la vostra sconfitta." },
      ],
    },
    {
      title: 'Portali',
      entries: [
        { text: 'Ce ne sono di blu, gialli e rossi, dal meno al più pericoloso.' },
        { text: "Quando un marine ne vede uno, premi il suo segnalino: l'app sceglie uno dei gruppi di quel colore, dice dove piazzarlo (sul portale o accanto) e a volte dà Argent. Il segnalino viene rimosso." },
        { text: 'Se non c\'è spazio, le miniature vanno nella casella vuota più vicina.' },
      ],
    },
    {
      title: 'Mappa e terreno',
      entries: [
        { term: 'Muri', text: 'Non si possono attraversare e interrompono la linea di vista. Una porta chiusa è un muro.' },
        { term: 'Terreno difficile', text: 'Bordo blu tratteggiato: costa 1 punto in più e dà copertura.' },
        { term: 'Terreno bloccante', text: 'Bordo rosso continuo: non ci si può entrare, interrompe la linea di vista e dà copertura.' },
        { term: 'Terreno invalicabile', text: 'Bordo rosso tratteggiato: non ci si può entrare, ma non interrompe la linea di vista.' },
        { term: 'Diagonali', text: "Puoi muoverti in diagonale, ma non tra due caselle che si toccano solo per un angolo, a meno che un'altra casella su quell'angolo sia adiacente a entrambe." },
      ],
    },
    {
      title: 'Marine e squadre',
      entries: [
        { term: 'Mazzo iniziale', text: 'In quasi tutte le missioni, UAC da 1 a 4 e Fucile da Combattimento da 1 a 3; peschi 3 carte.' },
        { term: 'Classe', text: "Dà una capacità che di solito si esaurisce, e si prepara all'inizio della tua attivazione." },
        { term: 'Squadre', text: "Con meno di 4 marine: con 3, uno prende «Taking Point»; con 2, entrambi prendono «Combat Veteran»; con 1, «Solo Operative», che dà due attivazioni per round: tra l'una e l'altra, premi «Attivazione forzata» su un gruppo che non ha agito." },
      ],
    },
    {
      title: 'Quando qualcosa non è chiaro',
      entries: [
        { text: 'Prevalgono le regole della missione: premi i suoi segnalini delle regole fuori dalla mappa.' },
        { text: "L'app non tiene traccia dei danni, del vacillamento o dell'Argent di ogni demone, né delle carte dei marine: li gestite voi con i segnalini e le carte fisiche." },
        { text: "Il «Log» conserva ciò che l'app ha detto, round per round." },
      ],
    },
  ],
};
