// DooM's help in German (RulesHelp.tsx), translated by Claude from the English one (October 2026): corrections by
// native speakers are welcome. The app's own words, not FFG's; the app's buttons as Valkyrie names them in German. Not in Valkyrie.
import type { RulesHelpText } from '../rulesMoM/types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    'Bei deiner Aktivierung: Wurdest du gefraggt, erscheinst du auf einem aktiven Teleporter deiner Wahl wieder, und du machst deine Klassenkarte spielbereit. Du führst 1 Hauptaktion und beliebig viele Bonusaktionen in beliebiger Reihenfolge aus. Wenn du fertig bist, wirf die gespielten Karten ab, ziehe auf 3 nach und tippe auf deinem Porträt auf »Letzter Zug«: Die App aktiviert eine Dämonengruppe.',
  actions: [
    {
      title: 'Aktionen',
      entries: [
        {
          term: 'Eine Karte spielen',
          text: 'Sie gibt dir so viele Bewegungspunkte wie ihre Geschwindigkeit und, wenn sie ein Angriffsfeld hat, diesen Angriff. Handle jede Karte vollständig ab, bevor du eine weitere spielst. Reaktionskarten werden außerhalb deiner Aktivierung gespielt.',
        },
        { term: 'Sprinten', text: 'Als Hauptaktion wirfst du 1 Karte aus deiner Hand ab und erhältst 6 Bewegungspunkte.' },
        {
          term: 'Bewegen',
          text: 'Jedes Feld kostet 1 Punkt, auch diagonal. Schwieriges Gelände kostet 1 mehr, und ein Feld mit einem Feind zu betreten nochmals 1 mehr. Du kannst dich durch Marines hindurchbewegen, deine Bewegung aber nicht auf einem besetzten Feld beenden. Gib deine Punkte aus, wann du willst, außer mitten in einem Angriff; übrige verfallen.',
        },
        {
          term: 'Eine Tür öffnen',
          text: 'Wenn du angrenzt, für 1 Bewegungspunkt: Tippe in der App darauf. Sie schließt sich nie wieder. Farbige Türen brauchen ihre Schlüsselkarte. In diesen Missionen öffnen Dämonen keine Türen.',
        },
        {
          term: 'Aufheben',
          text: 'Bewege dich durch das Feld einer Waffe, eines Medipacks oder einer Schlüsselkarte und tippe auf ihren Marker. Eine Waffe legt ihre Karten oben auf dein Deck; ein Medipack heilt 5 Schaden.',
        },
        {
          term: 'Glory Kill',
          text: 'Betritt das Feld eines taumelnden Dämons (2 Punkte): Er stirbt, du ziehst eine Glory-Kill-Karte und heilst 2 Schaden. Danach kannst du dich weiterbewegen.',
        },
        {
          term: 'Teleporter',
          text: 'Betrittst du einen inaktiven, wird er aktiviert. Alle aktiven sind miteinander verbunden: von einem zum anderen zu gelangen kostet 1 Punkt. Kommst du von einem anderen an, oder erscheinst du wieder, auf einem, auf dem ein Dämon steht, stirbt der Dämon (Telefrag).',
        },
      ],
    },
    {
      title: 'Denk daran',
      entries: [
        { term: 'Munition', text: 'Gibt es nicht: Deine Hand ist dein Magazin. Du kannst eine Waffe nur abfeuern, wenn du eine ihrer Karten hältst.' },
        { term: 'Portale', text: 'Wenn ein Marine ein Portal sieht (Sichtlinie), tippt auf seinen Marker: Die App sagt, welche Dämonen herauskommen und wo.' },
        { term: 'Betäubt', text: 'Entferne beim Angreifen 1 Würfel, decke keine Verteidigung auf und erhalte keine Deckung. Es endet, nachdem du angegriffen hast oder angegriffen wurdest.' },
      ],
    },
    {
      title: 'In der App',
      entries: [
        { term: 'Letzter Zug', text: 'Auf dem Porträt jedes Marines, am Ende seiner Aktivierung.' },
        { term: 'KO', text: 'Auf dem Porträt des Marines, der stirbt: Es ist ein Frag für den Invasor. Wenn er wieder erscheint, der andere Knopf des Porträts (»Erholen«).' },
        { term: 'Besiegt', text: 'Auf dem Porträt der Gruppe, wenn der letzte Dämon dieser Art stirbt. »Unique Besiegt« für einen Boss.' },
        { term: 'Information', text: 'Auf dem Porträt einer Gruppe: ihre Erläuterungen. »Erzwinge Aktivierung«, um mit dem physischen Initiativedeck zu spielen.' },
        { term: 'Missionsregeln', text: 'Die Marker außerhalb des Spielplans zeigen beim Antippen den Spielmodus, das Ziel und die Missionsregeln.' },
      ],
    },
  ],
  rules: [
    {
      title: 'Die Runde',
      entries: [
        { term: 'Zu Beginn', text: 'Die App fordert euch auf, die Argent-Energie auf die Dämonenarten im Spiel zu verteilen (meist 3, so gleichmäßig wie möglich), und zieht, wenn ihr damit spielt, einen Effekt aus dem Bedrohungsdeck für diese Runde.' },
        { term: 'Valkyrie-Modus', text: 'Ein Marine spielt seine Aktivierung und tippt auf »Letzter Zug«; die App aktiviert dann zufällig eine der Dämonengruppen, die noch nicht gehandelt haben. Das geht so weiter, bis alle gehandelt haben.' },
        { term: 'Normaler Modus', text: 'Mit dem physischen Initiativedeck: Kommt eine Invasorkarte, wählt zufällig eine Gruppe, die noch nicht gehandelt hat, und tippt auf ihr »Erzwinge Aktivierung«; ist das Deck aufgebraucht, tippt jeder Marine auf »Letzter Zug«.' },
        { term: 'Bedrohungsdeck', text: 'Das sind Effekte dieser Missionen für eine Runde (mehr Würfel, mehr Rüstung …), nicht die Bedrohungskarten des Spiels.' },
      ],
    },
    {
      title: 'Die Dämonen',
      entries: [
        { term: 'Aktivierung', text: 'Die App sagt, wie weit sich jeder Dämon bewegt, wen er angreift und welche Fähigkeit er einsetzt. Sie werden einzeln aktiviert, mit je einem Angriff, sofern die Fähigkeit nichts anderes sagt.' },
        { term: 'Gruppen', text: 'Dämonen derselben Art bilden eine Gruppe und handeln gemeinsam.' },
        { term: 'Argent', text: 'Sie kommt auf die Karte jedes Dämons und wird für seine Fähigkeiten ausgegeben, pro Figur. Stirbt der letzte einer Art, kehrt seine Argent-Energie in den Vorrat zurück.' },
        { term: 'Verteidigung', text: 'Beim Verteidigen deckt der Dämon die oberste Karte des Ereignisdecks auf. Nur ihre Verteidigung zählt: Ihr Text wird ignoriert.' },
        { term: 'Fliegend', text: 'Sie ignorieren schwieriges Gelände und die Kosten für Felder mit Feinden und überqueren unpassierbares Gelände.' },
        { term: 'Groß', text: 'In der App belegen sie ein Feld: Stellt die Figur dorthin, wo sie passt.' },
      ],
    },
    {
      title: 'Angriffe',
      entries: [
        { term: 'Reichweite', text: 'Die Felder bis zum Verteidiger, sein Feld mitgezählt. Das Maximum gibt das Angriffsfeld vor.' },
        { term: 'Sichtlinie', text: 'Eine gerade Linie von einer Ecke deines Feldes zu einer Ecke des Feldes des Verteidigers. Wände, geschlossene Türen und blockierendes Gelände unterbrechen sie; Figuren nicht.' },
        { term: 'Wurf', text: 'Wirf die Würfel im Angriffsfeld. Der rote Würfel hat Seiten mit 0, 1, 1, 1, 2 und 2 Schaden; der schwarze mit 1, 1, 2, 2, 2 und 3.' },
        { term: 'Verteidigung', text: 'Der Marine deckt die oberste Karte seines Aktionsdecks auf, der Dämon die des Ereignisdecks. Jeder Schild verhindert 1 Schaden, und Ausweichen verhindert allen. Das Symbol für Spezialverteidigung löst die des Dämons aus, und Zähigkeit gibt ihm 1 Schild mehr.' },
        { term: 'Deckung', text: 'Kreuzt eine beliebige Linie von deiner Ecke zu den Ecken des Verteidigers eine Wand, schwieriges oder blockierendes Gelände oder eine andere Figur, darf der Verteidiger die aufgedeckte Verteidigung abwerfen und eine andere aufdecken.' },
      ],
    },
    {
      title: 'Taumeln und Glory Kills',
      entries: [
        { text: 'Erreicht der Schaden eines Dämons seinen Taumelwert, taumelt er und kann per Glory Kill getötet werden.' },
        { text: 'Effekte, die den aufgedruckten Taumelwert senken (wie die Kettensäge), addieren sich nicht: Der höchste gilt.' },
        { text: 'Nur Dämonen können per Glory Kill getötet werden. Marines heilen sich durch Glory Kills, Medipacks und einige Klassen.' },
      ],
    },
    {
      title: 'Tod, Frags und Wiedererscheinen',
      entries: [
        { term: 'Tod', text: 'Ein Marine stirbt, wenn sein Schaden seine Lebenspunkte (10) erreicht: Tippt auf »KO«. Entfernt die Figur, legt ihren Schaden ab, mischt Hand und Ablagestapel ins Deck und zieht 3. Der Marine behält seine Waffen und Glory-Kill-Karten.' },
        { term: 'Wiedererscheinen', text: 'Zu Beginn seiner nächsten Aktivierung stellt er seine Figur auf einen aktiven Teleporter seiner Wahl; tippt auf den anderen Knopf seines Porträts (»Erholen«).' },
        { term: 'Frags', text: 'Jeder Tod ist ein Frag für den Invasor. Die Mission sagt, wie viele er zum Sieg braucht (meist 6); hat er sie erreicht, erklärt die App eure Niederlage.' },
      ],
    },
    {
      title: 'Portale',
      entries: [
        { text: 'Es gibt blaue, gelbe und rote, von weniger zu mehr gefährlich.' },
        { text: 'Wenn ein Marine eines sieht, tippt auf seinen Marker: Die App wählt eine der Gruppen dieser Farbe, sagt, wo sie hinkommt (auf das Portal oder daneben), und gibt manchmal Argent-Energie. Der Marker wird entfernt.' },
        { text: 'Ist kein Platz, kommen die Figuren auf das nächste leere Feld.' },
      ],
    },
    {
      title: 'Spielplan und Gelände',
      entries: [
        { term: 'Wände', text: 'Sie können nicht überquert werden und unterbrechen die Sichtlinie. Eine geschlossene Tür ist eine Wand.' },
        { term: 'Schwieriges Gelände', text: 'Gepunkteter blauer Rand: kostet 1 Punkt mehr und gibt Deckung.' },
        { term: 'Blockierendes Gelände', text: 'Durchgehender roter Rand: kann nicht betreten werden, unterbricht die Sichtlinie und gibt Deckung.' },
        { term: 'Unpassierbares Gelände', text: 'Gepunkteter roter Rand: kann nicht betreten werden, unterbricht die Sichtlinie aber nicht.' },
        { term: 'Diagonalen', text: 'Du darfst dich diagonal bewegen, aber nicht zwischen zwei Feldern, die sich nur an einer Ecke berühren, außer ein weiteres Feld an dieser Ecke grenzt an beide.' },
      ],
    },
    {
      title: 'Marines und Trupps',
      entries: [
        { term: 'Startdeck', text: 'In fast jeder Mission UAC 1 bis 4 und Kampfschrotflinte 1 bis 3; ziehe 3.' },
        { term: 'Klasse', text: 'Sie gibt eine Fähigkeit, die meist erschöpft wird, und wird zu Beginn deiner Aktivierung wieder spielbereit.' },
        { term: 'Trupps', text: 'Mit weniger als 4 Marines: Bei 3 nimmt einer »Taking Point«; bei 2 nehmen beide »Combat Veteran«; bei 1 »Solo Operative«, das zwei Aktivierungen pro Runde gibt: Tippt dazwischen bei einer Gruppe, die noch nicht gehandelt hat, auf »Erzwinge Aktivierung«.' },
      ],
    },
    {
      title: 'Wenn etwas unklar ist',
      entries: [
        { text: 'Die Regeln der Mission haben Vorrang: Tippt auf ihre Regelmarker außerhalb des Spielplans.' },
        { text: 'Die App verfolgt weder Schaden, Taumeln noch Argent-Energie jedes Dämons, noch die Karten der Marines: Das haltet ihr mit den physischen Markern und Karten fest.' },
        { text: 'Das »Log« bewahrt auf, was die App gesagt hat, Runde für Runde.' },
      ],
    },
  ],
};
