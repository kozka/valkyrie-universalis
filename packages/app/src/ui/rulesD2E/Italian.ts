// Descent's help in Italian (RulesHelp.tsx), translated by Claude from the English one (October 2026): corrections by
// native speakers are welcome. The app's own words, not FFG's; the app's buttons as Valkyrie names them in Italian. Not in Valkyrie.
import type { RulesHelpText } from '../rulesMoM/types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    "All'inizio del tuo turno terminano gli effetti che durano «fino al tuo prossimo turno», risolvi quelli «all'inizio del tuo turno», ripristini le tue carte esaurite e puoi cambiare il tuo equipaggiamento. Poi esegui fino a 2 azioni, in qualsiasi ordine; puoi ripetere la stessa o saltarle. Quando hai finito, premi «Fine Turno» sul tuo ritratto: l'app attiva un gruppo di mostri.",
  actions: [
    {
      title: 'Azioni',
      entries: [
        {
          term: 'Muoversi',
          text: 'Ottieni tanti punti movimento quanta è la tua Velocità; ogni spazio costa 1, anche in diagonale. Puoi dividere il movimento per eseguire un\'altra azione nel mezzo. Puoi attraversare gli eroi, non i mostri, e non puoi terminare in uno spazio occupato.',
        },
        { term: 'Attaccare', text: "Con un'arma equipaggiata, o a mani nude (solo il dado blu, in mischia). Vedi «Attacchi» nel riepilogo delle regole." },
        { term: 'Usare un\'abilità', text: "Una carta classe con l'icona dell'azione, pagandone la fatica." },
        { term: 'Riposare', text: 'Alla fine del tuo turno recuperi tutta la tua fatica, anche se era la tua prima azione.' },
        { term: 'Cercare', text: "Un segnalino ricerca nel tuo spazio o adiacente: premilo nell'app e ti dirà cosa trovi." },
        {
          term: 'Aprire una porta',
          text: "Una porta adiacente: premila nell'app, leggi il suo testo e conferma. Di solito rivela nuove sezioni, segnalini e mostri. In Road to Legend le porte non si richiudono mai.",
        },
        {
          term: 'Rianimare un eroe',
          text: 'Un eroe fuori combattimento il cui segnalino è adiacente: tira 2 dadi rossi, recupera 1 danno per ogni cuore e 1 fatica per ogni impeto, e torna sulla mappa. Nel suo turno successivo gioca normalmente.',
        },
        { term: 'Azione speciale', text: "Ciò che carte, oggetti o la missione permettono con l'icona dell'azione: raccogliere un obiettivo, parlare con un abitante, tirare una leva…" },
      ],
    },
    {
      title: 'Se sei fuori combattimento',
      entries: [
        {
          term: 'Rialzarsi',
          text: "È l'unica cosa che puoi fare in quel turno: tira 2 dadi rossi, recupera 1 danno per ogni cuore e 1 fatica per ogni impeto, e piazza la tua miniatura dove si trovava il tuo segnalino. Poi il tuo turno termina. Premi comunque «Fine Turno».",
        },
      ],
    },
    {
      title: "Senza spendere un'azione",
      entries: [
        { text: "Esaminare qualsiasi segnalino o porta nell'app, anche se non sei accanto, prima di decidere." },
        { text: 'Subire 1 fatica per ogni punto movimento extra, senza superare la tua Resistenza.' },
        { text: "Scambiare oggetti con un eroe adiacente dopo un'azione di movimento. Le carte classe non si possono scambiare." },
        { text: 'Spendere un impeto avanzato in un attacco per recuperare 1 fatica.' },
        { text: 'Con esattamente 2 eroi, ognuno può effettuare un attacco normale gratuito per turno; se non lo fa, recupera 2 danni alla fine del suo turno.' },
      ],
    },
    {
      title: "Nell'app",
      entries: [
        { term: 'Fine Turno', text: 'Sul ritratto di ogni eroe, quando il suo turno termina, anche se è fuori combattimento. Se non lo si preme, il round non va avanti.' },
        { term: 'KO', text: "Sul ritratto dell'eroe messo fuori combattimento: il morale cala. Quando torna sulla mappa, l'altro pulsante del ritratto (Recupera)." },
        { term: 'Sconfitto', text: "Sul ritratto del gruppo di mostri quando cade l'ultimo. «Unico Sconfitto» se cade il mostro unico." },
        { term: 'Informazioni', text: "Sul ritratto di un gruppo: i suoi chiarimenti e l'ordine in cui spende gli impeti. «Attivazione forzata», se la missione lo richiede." },
        { term: 'Skills e Oggetti', text: "I pulsanti in basso: le abilità e l'esperienza di ogni eroe, e gli oggetti e l'oro del gruppo." },
      ],
    },
  ],
  rules: [
    {
      title: 'Il round',
      entries: [
        { text: "Il gruppo sceglie un eroe che non ha ancora giocato; questi svolge il suo turno e preme «Fine Turno». Poi l'app attiva un gruppo di mostri a caso tra quelli non ancora attivati. Si ripete così, eroe e gruppo." },
        { text: "Se una delle due parti esaurisce i turni, l'altra gioca di seguito quelli che le restano." },
        { term: 'Fine del round', text: "Quando tutti hanno giocato, si risolvono gli effetti di fine round indicati dalla missione (rinforzi, pericoli…) e inizia un nuovo round. L'app salva la partita all'inizio di ogni round." },
        { text: 'Le capacità «una volta per turno» degli eroi non si usano durante le attivazioni dei mostri.' },
      ],
    },
    {
      title: 'Attivazione dei mostri',
      entries: [
        { term: 'Finestra', text: "Un effetto speciale per questa attivazione e l'elenco delle azioni per i mostri maggiori («Maggiore», miniature rosse) e i minori («Minore», miniature beige), nell'ordine indicato." },
        { term: 'Ogni mostro', text: "Scorre l'elenco dall'alto in basso ed esegue la prima azione che può, finché non ne ha eseguite 2; se arriva in fondo, ricomincia dall'alto. Solo 1 attacco per attivazione, salvo capacità come Devastare." },
        { term: 'Si salta', text: "Ciò che non può fare o che non avrebbe effetto: muoversi dove già si trova, attaccare senza un bersaglio valido o senza linea di vista, un secondo attacco." },
        { term: 'Avvistare', text: 'Muoversi fino a trovarsi entro 3 spazi dal bersaglio e con linea di vista.' },
        { term: 'Ingaggiare', text: 'Muoversi fino a essere adiacente al bersaglio. Con Portata, si ferma entro 2 spazi con linea di vista.' },
        { term: 'Ritirarsi', text: "Spendere il movimento rimanente allontanandosi dal nemico più vicino." },
        { term: 'Parità', text: 'Tra più bersagli, il più vicino; se c\'è ancora parità, decidete voi.' },
        { text: 'Quando tutti quelli di un tipo hanno finito, premi «Maggiore Attivo» o «Minore Attivo».' },
      ],
    },
    {
      title: 'Movimento e terreno',
      entries: [
        { term: 'Diagonali', text: "Puoi muoverti in diagonale, ma non attraverso lo spigolo di un muro." },
        { term: 'Acqua', text: 'Entrarci costa 2 punti movimento.' },
        { term: 'Fossa', text: "Quando ci entri subisci 2 danni. Dentro non puoi spendere punti movimento: ne esci con un'azione verso uno spazio vuoto adiacente." },
        { term: 'Lava', text: 'Quando ci entri subisci 1 danno, e una miniatura che vi termina il suo turno viene sconfitta.' },
        { term: 'Ostacolo', text: 'Blocca il movimento e la linea di vista.' },
        { term: 'Mostri', text: "Non possono subire fatica per muoversi di più. Evitano fosse e lava, e usano l'acqua solo se per loro è più conveniente." },
        { term: 'Mostri grandi', text: 'Contano il movimento da uno dei loro spazi, come se fossero piccoli, e alla fine vengono piazzati in modo che uno dei loro spazi sia quello finale.' },
      ],
    },
    {
      title: 'Linea di vista, spazi e adiacenza',
      entries: [
        { term: 'Linea di vista', text: "Una linea retta da un angolo del tuo spazio a un angolo di quello del bersaglio. È bloccata da miniature, ostacoli, muri e porte; toccare solo un angolo non la blocca. Gli spazi adiacenti si vedono sempre." },
        { term: 'Contare gli spazi', text: 'Il percorso più breve, senza contare lo spazio di partenza. Miniature e terreno che non sia un ostacolo non contano; non si conta attraverso muri o porte chiuse.' },
        { term: 'Adiacenti', text: 'Spazi che condividono un lato o un angolo, a meno che un muro o una porta li separi.' },
      ],
    },
    {
      title: 'Attacchi',
      entries: [
        { term: 'Tiro', text: "L'attaccante tira il dado blu e i suoi dadi potere, e il difensore i suoi dadi difesa, tutti insieme. Una X sul dado blu è un attacco mancato." },
        { term: 'A distanza', text: 'La gittata totale sui dadi deve raggiungere il numero di spazi fino al bersaglio; contro uno adiacente serve almeno 1.' },
        { term: 'Impeti', text: "Ogni impeto si spende in una capacità di impeto diversa, ciascuna una volta per attacco." },
        { term: 'Danni', text: "I cuori ottenuti meno gli scudi del difensore. Infliggere 0 non è un attacco mancato. Una condizione data da un impeto si applica solo se l'attacco infligge almeno 1 danno." },
        { term: 'Esplosione', text: 'Colpisce anche ogni spazio adiacente al bersaglio. Contro più mostri, in Road to Legend il bersaglio subisce i danni completi e gli altri la metà, arrotondata per eccesso, prima degli scudi.' },
        { term: 'Perforare X', text: 'Ignora X scudi.' },
      ],
    },
    {
      title: 'Prove di attributo',
      entries: [
        { text: "Tira 1 dado grigio e 1 dado nero e conta gli scudi: se sono pari o inferiori all'attributo (Forza, Conoscenza, Volontà o Percezione), superi la prova." },
        { text: 'I mostri maggiori e minori falliscono sempre; i luogotenenti effettuano la prova con i propri attributi.' },
        { text: "L'app non tira dadi: il testo dice cosa succede se superi la prova e se la fallisci." },
      ],
    },
    {
      title: 'Danni, fatica, fuori combattimento e morale',
      entries: [
        { term: 'Salute', text: 'Quando i danni eguagliano o superano la Salute, la miniatura è sconfitta.' },
        { term: 'Fatica', text: 'La fatica che scegli di subire non supera mai la tua Resistenza. La fatica che un effetto ti impone, se non ci sta, la subisci come danni. I mostri subiscono danni invece della fatica.' },
        { term: 'Fuori combattimento', text: 'Subisci fatica fino alla tua Resistenza, sostituisci la tua miniatura con il tuo segnalino eroe, scarti le tue condizioni e, se era il tuo turno, questo termina. Premi «KO» sul tuo ritratto.' },
        { term: 'Morale', text: 'Inizia pari al numero di eroi e cala di 1 a ogni KO. Se è a 0 e cade un altro eroe, fuggite e perdete la missione.' },
      ],
    },
    {
      title: 'Condizioni',
      entries: [
        { text: "Non puoi averne due copie uguali. Le prove delle condizioni si effettuano all'inizio del turno. Quando sei messo fuori combattimento, le scarti tutte." },
        { term: 'Avvelenato', text: 'Prova di Forza: se la fallisci, subisci 1 danno e la mantieni.' },
        { term: 'Malato', text: 'Prova di Volontà: se la fallisci, subisci 1 fatica e la mantieni.' },
        { term: 'Immobilizzato', text: 'Non puoi eseguire azioni di movimento. Si scarta alla fine del tuo turno.' },
        { term: 'Stordito', text: "L'unica azione che puoi eseguire è scartarla; dopo, la tua altra azione normalmente." },
        { term: 'In fiamme', text: "Alla fine del tuo turno, tu e ogni miniatura amica adiacente subite 1 danno. Si rimuove con un'azione tua o di qualcuno adiacente." },
        { term: 'Maledetto', text: "Non puoi usare azioni di abilità. Si rimuove superando una prova di Conoscenza all'inizio del turno." },
        { term: 'Indebolito', text: '1 scudo in meno in difesa e 1 cuore in meno in attacco. Si rimuove quando Riposi.' },
        { term: 'Sanguinante', text: "Subisci 1 fatica per ogni azione diversa dallo scartarla." },
        { term: 'Condannato', text: 'Ogni volta che subisci danni, subisci 1 danno in più. Si rimuove spendendo un impeto.' },
        { term: 'Terrorizzato', text: 'Non puoi spendere impeti. Si rimuove alla fine del tuo turno se non vedi alcun nemico.' },
      ],
    },
    {
      title: 'Eroi, equipaggiamento e ricerca',
      entries: [
        { term: 'Valori', text: 'Velocità (movimento), Salute, Resistenza (fatica massima), Difesa, e gli attributi Forza, Conoscenza, Volontà e Percezione.' },
        { term: 'Impresa eroica', text: 'Una volta per missione; quando la usi, gira la tua scheda eroe.' },
        { term: 'Equipaggiamento', text: "Due mani (un'arma a due mani le occupa entrambe), un'armatura e altri due oggetti. Si può cambiare solo all'inizio del tuo turno." },
        { term: 'Esaurire', text: "Una carta usata si ruota di lato e non si può riusare finché non la ripristini all'inizio del tuo turno." },
        { term: 'Ricerca', text: "Le carte Ricerca si scartano quando la missione termina. L'oro appartiene a tutto il gruppo." },
      ],
    },
    {
      title: 'Obiettivo, vittoria e sconfitta',
      entries: [
        { text: "La missione indica l'obiettivo e può cambiarlo («Obiettivo aggiornato»). Vincete completandolo." },
        { text: 'Perdete a causa del morale o come dice la missione. Se perdete tempo, alla fine di alcuni round colpiscono pericoli sempre peggiori.' },
        { term: 'Quando termina', text: "Gli eroi recuperano tutti i danni e la fatica, girano la scheda eroe a faccia in su e scartano condizioni e carte Ricerca. Oro, esperienza, oggetti e fama si conservano." },
      ],
    },
    {
      title: 'Quando qualcosa non è chiaro',
      entries: [
        { text: 'Le carte prevalgono sulle regole generali, e le regole della missione su tutto il resto.' },
        { text: "Se un effetto consente più opzioni, decide il gruppo. L'app non controlla nessuna regola: le applicate voi." },
        { text: "L'app non sa dove sono le miniature, né i loro danni o le loro condizioni: se salvate a metà missione, annotateli. Il «Log» conserva ciò che l'app ha detto." },
      ],
    },
  ],
};
