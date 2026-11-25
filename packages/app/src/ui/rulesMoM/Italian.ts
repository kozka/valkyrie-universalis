// Mansions' help in Italian (RulesHelp.tsx), translated by Claude from the English one (October 2026): corrections by
// native speakers are welcome. The app's own words, not FFG's; the app's buttons as Valkyrie names them in Italian. Not in Valkyrie.
import type { RulesHelpText } from './types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    "Nel tuo turno esegui fino a 2 azioni, nell'ordine che preferisci, e puoi ripeterne una (muoverti due volte vale fino a 4 spazi). Il gruppo decide chi gioca ogni turno.",
  actions: [
    {
      title: 'Azioni',
      entries: [
        {
          term: 'Muoversi',
          text: "Fino a 2 spazi, uno alla volta. Puoi dividere il movimento: muoviti di 1, esegui un'altra azione, poi muoviti dell'altro. Non puoi attraversare pareti, bordi tratteggiati o porte con un'Ostruzione o un segnalino Esplorazione.",
        },
        { term: 'Esplorare', text: "Premi un segnalino Esplorazione nel tuo spazio o sulla porta accanto a te. L'app dice cosa piazzare." },
        { term: 'Cercare', text: 'Premi un segnalino Ricerca nel tuo spazio.' },
        { term: 'Interagire', text: "Premi un segnalino Interazione o Persona nel tuo spazio e scegli un'opzione con l'icona dell'azione." },
        {
          term: 'Scambiare',
          text: 'Dai, raccogli o lascia tutti gli Oggetti e Incantesimi che vuoi con gli investigatori nel tuo spazio. Raccogliere qualcosa da terra costa anche questa azione. Gli Indizi non si possono scambiare.',
        },
        {
          term: 'Attaccare',
          text: "Scegli il mostro nell'elenco dei mostri, premi «Attacca» e il tipo di arma. In mischia o senza armi, nel tuo spazio; a distanza, fino a 3 spazi. Annota il Danno con + e −.",
        },
        { term: 'Componente', text: "Usa un effetto «Azione:» di una carta, o un oggetto dell'inventario (lo zaino o «Oggetti», in basso a sinistra)." },
        {
          term: 'Ostruzione',
          text: "Sposta l'Ostruzione del tuo spazio contro una porta o un Passaggio Segreto, o allontanala. Dall'altro lato della porta: prova di Forza; con 2 successi la sposti e passi.",
        },
        { term: 'Spegnere il Fuoco', text: 'Prova di Agilità: ogni successo scarta 1 Fuoco nel tuo spazio o in uno in cui entri in questo turno.' },
      ],
    },
    {
      title: 'Azioni rare (soprattutto con una carta Folle)',
      entries: [
        {
          term: 'Spingere',
          text: "Sposta di 1 spazio un mostro o un investigatore nel tuo spazio. Prova di Forza contro l'Aggressività del mostro, o contro il risultato + 1 dell'investigatore se resiste. Se riesci, puoi seguirlo.",
        },
        { term: 'Rubare', text: 'Scegliete Forza, Agilità o Osservazione e la tirate entrambi. Prendi 1 possedimento per ogni successo che ottieni in più rispetto all\'altro.' },
        {
          term: 'Appiccare il fuoco',
          text: "Con una Fonte di Luce, metti un Fuoco nel tuo spazio o in uno adiacente. Se non c'era ancora Fuoco, premi «Set» (la pergamena in basso) → «Incendia» perché l'app lo propaghi.",
        },
      ],
    },
    {
      title: 'Gratis (senza azione)',
      entries: [
        { text: "I segnalini Vista (l'occhio)." },
        { text: "Le opzioni dell'app senza l'icona dell'azione: premere un segnalino per leggerlo non ti impegna a nulla." },
        { text: 'Le abilità che non dicono «Azione:».' },
      ],
    },
    {
      title: 'Ricorda',
      entries: [
        {
          term: 'Evadere',
          text: "Nello spazio di un mostro, prima di qualsiasi azione che non sia Attaccare o Muoversi, e per uscirne: scegli il mostro con la Consapevolezza più alta (numero verde) e premi «Evadi». Se fallisci, di solito perdi l'azione.",
        },
        { term: 'Ferito', text: 'Puoi eseguire una sola azione di Movimento per round.' },
        { term: 'Fuoco', text: "Entrare in uno spazio con Fuoco, o eseguire o perdere un'azione al suo interno, infligge 1 Danno a faccia in giù." },
        { term: 'Oscurità', text: "Non puoi spendere Indizi, a meno che ci sia una Fonte di Luce o un Fuoco nel tuo spazio o in uno adiacente." },
      ],
    },
  ],
  rules: [
    {
      title: 'Prima di iniziare',
      entries: [
        { text: 'Mescola separatamente i mazzi Danno e Orrore e tienili a faccia in giù.' },
        { text: 'Ordina per nome, a faccia in su, gli Oggetti Comuni, gli Oggetti Unici, gli Incantesimi e le Condizioni.' },
        { text: "Dividi i segnalini per tipo. L'app dice quali tessere, segnalini e mostri piazzare, e quando." },
        { text: "Dividete i possedimenti iniziali come preferite; gli Indizi, come dice l'app. Leggete il prologo: può contenere indizi sulla storia." },
      ],
    },
    {
      title: 'Il round',
      entries: [
        { term: 'Fase degli Investigatori', text: "Ogni investigatore gioca un turno intero di fino a 2 azioni, nell'ordine che sceglie il gruppo. Quando tutti hanno finito, premete il pulsante ➤ in basso a destra." },
        { term: 'Fase dei Miti', text: 'In questo ordine:' },
        { term: '1. Fuoco', text: 'Se c\'è Fuoco, aggiungete 1 segnalino in totale (non uno per incendio) in uno spazio adiacente a uno con Fuoco.' },
        { term: '2. Eventi', text: "L'app mostra uno o più eventi dei Miti; risolveteli come scritto." },
        { term: '3. Mostri', text: "L'app attiva ogni mostro, uno dopo l'altro." },
        { term: '4. Orrore', text: "Ogni investigatore effettua una prova di Orrore contro il mostro con più Orrore entro la sua gittata, se ce n'è uno." },
        { text: "Premete ➤ e inizia un nuovo round. Il tempo scorre anche se non lo vedete: è l'app a decidere quando è tardi." },
      ],
    },
    {
      title: 'Prove',
      entries: [
        { term: 'Dadi', text: "Tanti quanto l'attributo, con i modificatori (almeno 1). Ogni dado ha 3 facce successo, 2 facce indagine (la lente d'ingrandimento) e 3 facce vuote." },
        { term: 'Risultato', text: 'Il numero di successi. «(Agilità −1; 2)» è una prova di Agilità con un dado in meno che richiede 2 successi.' },
        { term: 'Indizi', text: "Dopo il tiro, ogni Indizio che spendi trasforma 1 lente d'ingrandimento in un successo. Non è un nuovo tiro." },
        { term: 'Annullare', text: 'Se il testo dice «annullato da…», ogni successo previene 1 Danno o 1 Orrore.' },
        { term: 'Tirare dadi', text: 'Se il testo dice solo «tira X dadi», non è una prova: non si possono spendere Indizi.' },
        { text: "Tira solo l'investigatore attivo, a meno che un effetto dica diversamente." },
      ],
    },
    {
      title: 'Danno, Orrore, Ferito e Folle',
      entries: [
        { term: 'Carte', text: 'Subire Danno o Orrore significa pescare una carta dal mazzo corrispondente, a faccia in su a meno che non dica «a faccia in giù». Le carte a faccia in giù non fanno nulla: contano soltanto.' },
        { term: 'A faccia in su', text: '«Risolvi immediatamente» si applica quando la ricevi; «Tieni a faccia in su» ha effetto finché resta così. Se bisogna girare carte a faccia in giù, si scelgono a caso.' },
        { term: 'Ferito', text: 'Quando il tuo Danno totale raggiunge la tua Salute: diventi Ferito e scarti il Danno a faccia in giù. Puoi muoverti solo una volta per round.' },
        { term: 'Folle', text: 'Lo stesso con Orrore e Sanità Mentale. Leggi in segreto il retro della tua carta Folle: può cambiare il modo in cui vinci. Se richiede più investigatori di quanti siete, prendine un\'altra.' },
        { term: 'Eliminato', text: "Se, già Ferito o Folle, raggiungi di nuovo il limite: lascia i tuoi possedimenti e rimuovi la tua miniatura. Premete «Set» (la pergamena in basso) → «Investigatore Eliminato». Gli altri perdono alla fine della successiva Fase degli Investigatori, a meno che non abbiano finito." },
      ],
    },
    {
      title: 'Mostri',
      entries: [
        { term: 'Segnalino', text: "Consapevolezza (verde): quale evadi. Orrore (blu): contro quale effettui la prova di Orrore. Aggressività (rossa, sul retro): dadi contro le Ostruzioni e difficoltà per spingerlo. La Salute la tiene l'app." },
        { term: 'Attivazione', text: "Fate ciò che dice l'app. «Verso» significa che ogni passo lo avvicina; si ferma quando raggiunge il suo bersaglio. Se non c'è un bersaglio entro gittata, non si muove: premete il pulsante di nessun investigatore e l'app dà un altro ordine." },
        { term: 'Porte', text: 'Le attraversano liberamente a meno che non siano ostruite: allora tirano tanti dadi quanto la loro Aggressività e con 2 successi rompono l\'Ostruzione; altrimenti perdono il movimento (ma attaccano comunque se condividono lo spazio con qualcuno).' },
        { term: 'Prova di Orrore', text: "Solo nella sottofase di Orrore. Se più investigatori la effettuano contro lo stesso mostro, l'app la mostra una volta e ciascuno tira e applica la propria." },
        { term: 'Fuoco', text: 'Un mostro che inizia la sua attivazione nel Fuoco, o vi entra, subisce 1 Danno.' },
      ],
    },
    {
      title: 'La mappa e la gittata',
      entries: [
        { term: 'Spazi', text: 'Bordi continui (bianchi o gialli): si attraversano. Bordi tratteggiati: non si attraversano, ma la gittata passa. Pareti: niente le attraversa né le oltrepassa. Porte: si attraversano, ma la gittata non passa.' },
        { term: 'Gittata', text: 'Fino a 3 spazi, contando il tuo come 0. Può girare gli angoli: non esiste linea di vista. Non passa attraverso pareti, porte o Passaggi Segreti.' },
        { term: 'Adiacente', text: 'Gli effetti sugli spazi adiacenti (luce, propagazione del Fuoco) passano attraverso le porte, mai attraverso le pareti.' },
        { term: 'Passaggio Segreto', text: 'Tutti gli spazi con un Passaggio Segreto sono adiacenti tra loro per il movimento.' },
        { term: 'Nord', text: 'È sempre la parte alta dello schermo.' },
        { term: 'Interno ed esterno', text: 'Le stanze esterne hanno la targhetta del nome argentata con tentacoli rossi. Alcuni eventi le distinguono.' },
      ],
    },
    {
      title: 'Fuoco, Oscurità e Ostruzioni',
      entries: [
        { term: 'Fuoco', text: "Non possono mai esserci 2 Fuochi nello stesso spazio. Si propaga attraverso le porte, non le pareti; le Ostruzioni non lo fermano. Il Fuoco che spegni con la tua azione non ti infligge più Danno." },
        { term: 'Oscurità', text: 'Nel suo spazio non si spendono Indizi, né per le prove né per i rompicapo. Una Fonte di Luce o un Fuoco nel tuo spazio o in uno adiacente la annulla.' },
        { term: 'Ostruzione', text: 'Né investigatori né mostri passano attraverso una porta o un Passaggio ostruiti. Non impedisce ai mostri di comparire.' },
      ],
    },
    {
      title: 'Oggetti, Incantesimi e Condizioni',
      entries: [
        { term: 'Possedimenti', text: 'Oggetti Comuni, Oggetti Unici e Incantesimi. Indizi, Condizioni, Danno e Orrore non lo sono.' },
        { term: 'Oggetti', text: 'Puoi guardarne il retro quando vuoi. Quando un oggetto viene girato, il retro sostituisce il fronte.' },
        { term: 'Incantesimi', text: "Ricevi una copia a caso e non ne guardi mai il retro. Per lanciarlo lo giri, risolvi il retro e quasi sempre lo scarti e ottieni un'altra copia." },
        { term: 'Condizioni', text: 'A faccia in su e mai due copie. Stordito: solo 1 azione nel tuo turno. Confuso: non spendi Indizi. Immobilizzato: non puoi muoverti da solo. Concentrato: scartala per rendere successi tutte le tue lenti d\'ingrandimento.' },
        { term: 'Armi', text: 'Per attaccare con un tipo di arma devi averne una di quel tipo. Puoi sempre attaccare senza armi.' },
      ],
    },
    {
      title: 'Rompicapo',
      entries: [
        { term: 'Passi', text: "Tanti quanto il valore stampato dell'attributo che chiede l'app, più 1 per ogni Indizio che spendi (non nell'Oscurità). L'app non li conta: contateli voi." },
        { term: 'Chiudere', text: 'Quando finiscono i passi, premi «Chiudi»: i progressi restano e qualcuno può continuare più tardi con un\'altra azione. Potete consigliarvi a vicenda.' },
        { term: 'Mosaico', text: "Ricomponi l'immagine scambiando due tessere vicine per passo." },
        { term: 'Meccanismo', text: 'Fai scorrere i blocchi, uno per passo, finché il pezzo obiettivo non esce a destra.' },
        { term: 'Codice', text: 'Proponi un codice per passo. Un successo per ogni simbolo al suo posto; una lente d\'ingrandimento per ogni simbolo giusto al posto sbagliato.' },
        { term: 'Torre', text: 'Sposta il pezzo in cima a una colonna su un\'altra finché non sono tutti impilati, dal più grande al più piccolo.' },
      ],
    },
    {
      title: 'Espansioni',
      entries: [
        { term: 'Chiave', text: 'Un oggetto con un segnalino Chiave ottiene i tratti Chiave e Prova e non può essere scartato, ma può essere scambiato o rubato.' },
        { term: 'Tessere che si muovono o si sovrappongono', text: "Si muovono con tutto ciò che hanno sopra. Una sopra l'altra non copre mai uno spazio intero; ciò che è coperto smette di far parte del tabellone." },
        { term: 'Elisir', text: 'Si ottengono a caso; non guardarne il retro finché un effetto non li gira. A faccia in su sono possedimenti; a faccia in giù, no.' },
        { term: 'Potenziamenti', text: "+1 al valore stampato di un attributo, una volta per attributo. Non sono possedimenti." },
        { term: 'Contenimento', text: 'Un mostro nel suo spazio non deve essere evaso. Quando quel mostro si attiva, potete scartarlo perché non si muova.' },
        { term: 'Macerie', text: "Niente Cercare, Esplorare o Interagire. Prova di Forza: 1 segnalino per successo; un'Arma Pesante le rimuove tutte." },
        { term: 'Vegetazione', text: "Per uscire, prova di Osservazione con difficoltà pari al numero di segnalini; se fallisci, lascia un oggetto a caso. Un'Arma da Taglio la rimuove; anche il Fuoco." },
        { term: 'Acqua', text: 'Entrarci termina il tuo movimento (tranne i mostri acquatici, volanti o incorporei). Spegne il Fuoco.' },
        { term: 'Squarcio', text: 'Eseguire nel suo spazio un\'azione diversa dal movimento ti rende Perso nel Tempo e nello Spazio. Prova di Sapienza per chiuderli: 1 per successo.' },
      ],
    },
    {
      title: 'Quando qualcosa non è chiaro',
      entries: [
        { text: 'Se un effetto può riguardare più investigatori, o più effetti avvengono insieme, decide il gruppo. Se non vi mettete d\'accordo, decide un investigatore a caso.' },
        { text: 'Gli effetti su un investigatore eliminato si applicano per quanto possibile.' },
        { text: "Il Log (il libro o «Log», in basso) conserva tutto ciò che l'app ha detto, round per round." },
      ],
    },
  ],
};
