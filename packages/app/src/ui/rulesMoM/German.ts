// Mansions' help in German (RulesHelp.tsx), translated by Claude from the English one (October 2026): corrections by
// native speakers are welcome. The app's own words, not FFG's; the app's buttons as Valkyrie names them in German. Not in Valkyrie.
import type { RulesHelpText } from './types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    'In deinem Zug führst du bis zu 2 Aktionen in beliebiger Reihenfolge aus und darfst dieselbe wiederholen (zweimal Bewegen sind bis zu 4 Felder). Die Gruppe entscheidet, wer jeweils seinen Zug macht.',
  actions: [
    {
      title: 'Aktionen',
      entries: [
        {
          term: 'Bewegen',
          text: 'Bis zu 2 Felder, eines nach dem anderen. Du darfst die Bewegung aufteilen: 1 Feld bewegen, eine andere Aktion ausführen, dann das zweite. Wände, gestrichelte Ränder und Türen mit einem Hindernis oder einem Erkunden-Marker kannst du nicht überqueren.',
        },
        { term: 'Erkunden', text: 'Tippe auf einen Erkunden-Marker in deinem Feld oder an der Tür neben dir. Die App sagt, was du auslegen sollst.' },
        { term: 'Durchsuchen', text: 'Tippe auf einen Suche-Marker in deinem Feld.' },
        { term: 'Interagieren', text: 'Tippe auf einen Interaktions- oder Personenmarker in deinem Feld und wähle eine Option mit dem Aktionssymbol.' },
        {
          term: 'Tauschen',
          text: 'Gib, nimm oder lege beliebig viele Gegenstände und Zauber mit den Ermittlern in deinem Feld ab. Etwas vom Boden aufzuheben kostet ebenfalls diese Aktion. Hinweise können nicht getauscht werden.',
        },
        {
          term: 'Angreifen',
          text: 'Wähle das Monster in der Monsterliste, tippe auf »Angriff« und die Art der Waffe. Nahkampf oder waffenlos: in deinem Feld; Fernkampf: bis zu 3 Felder. Trage den Schaden mit + und − ein.',
        },
        { term: 'Komponente', text: 'Nutze einen »Aktion:«-Effekt einer Karte oder einen Gegenstand im Inventar (der Rucksack oder »Inv.«, unten links).' },
        {
          term: 'Hindernis',
          text: 'Schiebe das Hindernis in deinem Feld vor eine Tür oder einen Geheimgang oder davon weg. Von der anderen Seite der Tür: Stärkeprobe; mit 2 Erfolgen schiebst du es beiseite und gehst hindurch.',
        },
        { term: 'Feuer löschen', text: 'Geschicklichkeitsprobe: Jeder Erfolg legt 1 Feuer in deinem Feld oder in einem Feld ab, das du in diesem Zug betrittst.' },
      ],
    },
    {
      title: 'Seltene Aktionen (meist mit einer Wahnsinnig-Karte)',
      entries: [
        {
          term: 'Stoßen',
          text: 'Bewege ein Monster oder einen Ermittler in deinem Feld um 1 Feld. Stärkeprobe gegen die Aggression des Monsters oder, wenn sich der Ermittler wehrt, gegen dessen Ergebnis + 1. Bei Erfolg darfst du folgen.',
        },
        { term: 'Stehlen', text: 'Wählt Stärke, Geschicklichkeit oder Beobachtung, und ihr legt beide die Probe ab. Du nimmst 1 Besitz für jeden Erfolg, den du mehr hast als der andere.' },
        {
          term: 'Feuer legen',
          text: 'Lege mit einer Lichtquelle Feuer in dein Feld oder ein angrenzendes. Gab es noch kein Feuer, tippe auf »Setze« (die Schriftrolle unten) → »Feuer legen«, damit die App es ausbreitet.',
        },
      ],
    },
    {
      title: 'Frei (keine Aktion)',
      entries: [
        { text: 'Sichtmarker (das Auge).' },
        { text: 'Optionen der App ohne Aktionssymbol: Auf einen Marker zu tippen, um ihn zu lesen, verpflichtet dich zu nichts.' },
        { text: 'Fähigkeiten, auf denen nicht »Aktion:« steht.' },
      ],
    },
    {
      title: 'Denk daran',
      entries: [
        {
          term: 'Ausweichen',
          text: 'Im Feld eines Monsters, vor jeder Aktion außer Angreifen oder Bewegen, und um es zu verlassen: Wähle das Monster mit der höchsten Aufmerksamkeit (grüne Zahl) und tippe auf »Ausweichen«. Misslingt es, verfällt meist die Aktion.',
        },
        { term: 'Verwundet', text: 'Du kannst nur eine Bewegen-Aktion pro Runde ausführen.' },
        { term: 'Feuer', text: 'Ein Feld mit Feuer zu betreten oder darin eine Aktion auszuführen oder verfallen zu lassen, verursacht 1 verdeckten Schaden.' },
        { term: 'Dunkelheit', text: 'Du kannst keine Hinweise ausgeben, außer es gibt eine Lichtquelle oder Feuer in deinem Feld oder einem angrenzenden.' },
      ],
    },
  ],
  rules: [
    {
      title: 'Vor dem Spiel',
      entries: [
        { text: 'Mische den Schadens- und den Horrorstapel getrennt und lege sie verdeckt bereit.' },
        { text: 'Sortiere die gewöhnlichen Gegenstände, einzigartigen Gegenstände, Zauber und Zustände offen nach Namen.' },
        { text: 'Sortiere die Marker nach Art. Die App sagt, welche Spielplanteile, Marker und Monster ihr wann auslegt.' },
        { text: 'Verteilt den Startbesitz nach Belieben, die Hinweise so, wie die App es sagt. Lest den Prolog: Er kann Hinweise zur Geschichte enthalten.' },
      ],
    },
    {
      title: 'Die Runde',
      entries: [
        { term: 'Ermittlerphase', text: 'Jeder Ermittler macht einen ganzen Zug mit bis zu 2 Aktionen, in der Reihenfolge, die die Gruppe wählt. Wenn alle fertig sind, tippt auf die Schaltfläche ➤ unten rechts.' },
        { term: 'Mythosphase', text: 'In dieser Reihenfolge:' },
        { term: '1. Feuer', text: 'Gibt es Feuer, kommt insgesamt 1 Marker hinzu (nicht einer pro Feuer), in ein Feld, das an ein Feld mit Feuer angrenzt.' },
        { term: '2. Ereignisse', text: 'Die App zeigt ein oder mehrere Mythosereignisse; handelt sie ab, wie sie geschrieben sind.' },
        { term: '3. Monster', text: 'Die App aktiviert jedes Monster, eines nach dem anderen.' },
        { term: '4. Horror', text: 'Jeder Ermittler legt einen Horrortest gegen das Monster mit dem höchsten Horrorwert in seiner Reichweite ab, falls es eines gibt.' },
        { text: 'Tippt auf ➤, und eine neue Runde beginnt. Die Zeit läuft, auch wenn ihr sie nicht seht: Die App entscheidet, wann es spät ist.' },
      ],
    },
    {
      title: 'Proben',
      entries: [
        { term: 'Würfel', text: 'So viele wie der Attributswert, mit Modifikatoren (mindestens 1). Jeder Würfel hat 3 Erfolgsseiten, 2 Ermittlungsseiten (die Lupe) und 3 leere.' },
        { term: 'Ergebnis', text: 'Die Anzahl der Erfolge. »(Geschicklichkeit −1; 2)« ist eine Geschicklichkeitsprobe mit einem Würfel weniger, die 2 Erfolge braucht.' },
        { term: 'Hinweise', text: 'Nach dem Würfeln verwandelt jeder ausgegebene Hinweis 1 Lupe in einen Erfolg. Das ist kein Neuwurf.' },
        { term: 'Verhindern', text: 'Steht im Text »verhindert durch …«, verhindert jeder Erfolg 1 Schaden oder 1 Horror.' },
        { term: 'Würfeln', text: 'Steht im Text nur »wirf X Würfel«, ist das keine Probe: Es dürfen keine Hinweise ausgegeben werden.' },
        { text: 'Nur der aktive Ermittler würfelt, außer ein Effekt sagt etwas anderes.' },
      ],
    },
    {
      title: 'Schaden, Horror, Verwundet und Wahnsinnig',
      entries: [
        { term: 'Karten', text: 'Schaden oder Horror zu erleiden heißt, eine Karte von dessen Stapel zu ziehen, offen, außer es steht »verdeckt« da. Verdeckte Karten bewirken nichts: Sie zählen nur.' },
        { term: 'Offen', text: '»Sofort abhandeln« gilt, wenn du sie bekommst; »Offen liegen lassen« wirkt, solange sie offen bleibt. Müssen verdeckte Karten umgedreht werden, werden sie zufällig gewählt.' },
        { term: 'Verwundet', text: 'Wenn dein gesamter Schaden deine Gesundheit erreicht: Du wirst verwundet und wirfst deinen verdeckten Schaden ab. Du kannst dich nur einmal pro Runde bewegen.' },
        { term: 'Wahnsinnig', text: 'Dasselbe mit Horror und geistiger Gesundheit. Lies die Rückseite deiner Wahnsinnig-Karte geheim: Sie kann ändern, wie du gewinnst. Verlangt sie mehr Ermittler, als ihr seid, nimm eine andere.' },
        { term: 'Ausgeschieden', text: 'Erreichst du, schon verwundet oder wahnsinnig, das Limit erneut: Lege deinen Besitz ab und entferne deine Figur. Tippt auf »Setze« (die Schriftrolle unten) → »Ermittler ausgeschieden«. Die anderen verlieren am Ende der nächsten Ermittlerphase, wenn sie bis dahin nicht fertig sind.' },
      ],
    },
    {
      title: 'Monster',
      entries: [
        { term: 'Marker', text: 'Aufmerksamkeit (grün): wem man ausweicht. Horror (blau): gegen wen man den Horrortest ablegt. Aggression (rot, auf der Rückseite): Würfel gegen Hindernisse und Schwierigkeit, es zu stoßen. Die App führt seine Gesundheit.' },
        { term: 'Aktivierung', text: 'Tut, was die App sagt. »Auf … zu« heißt, jeder Schritt bringt es näher; es bleibt stehen, sobald es sein Ziel erreicht. Gibt es kein Ziel in Reichweite, bewegt es sich nicht: Tippt auf die Schaltfläche für keine Ermittler, und die App gibt einen anderen Befehl.' },
        { term: 'Türen', text: 'Monster gehen ungehindert hindurch, außer sie sind blockiert: Dann werfen sie so viele Würfel wie ihre Aggression und zerstören das Hindernis mit 2 Erfolgen; sonst verlieren sie ihre Bewegung (greifen aber trotzdem an, wenn sie ein Feld mit jemandem teilen).' },
        { term: 'Horrortest', text: 'Nur im Horrorschritt. Legen mehrere Ermittler ihn gegen dasselbe Monster ab, zeigt die App es einmal, und jeder würfelt und handelt seinen eigenen ab.' },
        { term: 'Feuer', text: 'Ein Monster, das seine Aktivierung in Feuer beginnt oder es betritt, erleidet 1 Schaden.' },
      ],
    },
    {
      title: 'Die Karte und die Reichweite',
      entries: [
        { term: 'Felder', text: 'Durchgezogene Ränder (weiß oder gelb): Du überquerst sie. Gestrichelte Ränder: Du kannst sie nicht überqueren, aber die Reichweite geht hindurch. Wände: Nichts überquert sie oder geht hindurch. Türen: Du überquerst sie, aber die Reichweite geht nicht hindurch.' },
        { term: 'Reichweite', text: 'Bis zu 3 Felder, dein eigenes zählt als 0. Sie kann um Ecken gehen: Es gibt keine Sichtlinie. Sie geht nicht durch Wände, Türen oder Geheimgänge.' },
        { term: 'Angrenzend', text: 'Effekte auf angrenzende Felder (Licht, Ausbreitung von Feuer) gehen durch Türen, nie durch Wände.' },
        { term: 'Geheimgang', text: 'Alle Felder mit einem Geheimgang grenzen für die Bewegung aneinander.' },
        { term: 'Norden', text: 'Immer der obere Rand des Bildschirms.' },
        { term: 'Innen und außen', text: 'Außenräume haben ein silbernes Namensschild mit roten Tentakeln. Manche Ereignisse unterscheiden sie.' },
      ],
    },
    {
      title: 'Feuer, Dunkelheit und Hindernisse',
      entries: [
        { term: 'Feuer', text: 'In einem Feld kann es nie 2 geben. Es breitet sich durch Türen aus, nicht durch Wände; Hindernisse halten es nicht auf. Feuer, das du mit deiner Aktion löschst, verursacht dir keinen Schaden mehr.' },
        { term: 'Dunkelheit', text: 'In ihrem Feld werden keine Hinweise ausgegeben, weder für Proben noch für Rätsel. Eine Lichtquelle oder ein Feuer in deinem Feld oder einem angrenzenden hebt sie auf.' },
        { term: 'Hindernis', text: 'Weder Ermittler noch Monster gehen durch eine blockierte Tür oder einen blockierten Gang. Es hindert Monster nicht daran, zu erscheinen.' },
      ],
    },
    {
      title: 'Gegenstände, Zauber und Zustände',
      entries: [
        { term: 'Besitz', text: 'Gewöhnliche Gegenstände, einzigartige Gegenstände und Zauber. Hinweise, Zustände, Schaden und Horror nicht.' },
        { term: 'Gegenstände', text: 'Du darfst dir ihre Rückseite jederzeit ansehen. Wird ein Gegenstand umgedreht, ersetzt seine Rückseite die Vorderseite.' },
        { term: 'Zauber', text: 'Du bekommst ein zufälliges Exemplar und siehst dir nie seine Rückseite an. Um ihn zu wirken, drehst du ihn um, handelst die Rückseite ab und wirfst ihn fast immer ab und erhältst ein anderes Exemplar.' },
        { term: 'Zustände', text: 'Offen und nie zwei Exemplare. Betäubt: nur 1 Aktion in deinem Zug. Benommen: Du gibst keine Hinweise aus. Gefesselt: Du kannst dich nicht aus eigener Kraft bewegen. Konzentriert: Wirf ihn ab, damit alle deine Lupen Erfolge werden.' },
        { term: 'Waffen', text: 'Um mit einer Waffenart anzugreifen, musst du eine Waffe dieser Art tragen. Waffenlos angreifen kannst du immer.' },
      ],
    },
    {
      title: 'Rätsel',
      entries: [
        { term: 'Schritte', text: 'So viele wie der aufgedruckte Wert des Attributs, das die App verlangt, plus 1 pro ausgegebenem Hinweis (nicht in Dunkelheit). Die App zählt sie nicht: Zählt sie selbst.' },
        { term: 'Schließen', text: 'Wenn die Schritte aufgebraucht sind, tippe auf »Schließen«: Der Fortschritt bleibt erhalten, und jemand kann später mit einer anderen Aktion weitermachen. Ihr dürft euch gegenseitig beraten.' },
        { term: 'Bilderrätsel', text: 'Setze das Bild wieder zusammen, indem du pro Schritt zwei benachbarte Teile vertauschst.' },
        { term: 'Schloss', text: 'Schiebe Blöcke, einen pro Schritt, bis das Zielteil rechts herauskommt.' },
        { term: 'Code', text: 'Rate pro Schritt einen Code. Ein Erfolg für jedes Symbol an seinem Platz; eine Lupe für jedes richtige Symbol am falschen Platz.' },
        { term: 'Turm', text: 'Versetze das oberste Teil einer Säule auf eine andere, bis alle gestapelt sind, vom größten zum kleinsten.' },
      ],
    },
    {
      title: 'Erweiterungen',
      entries: [
        { term: 'Schlüssel', text: 'Ein Gegenstand mit einem Schlüsselmarker erhält die Merkmale Schlüssel und Beweis und kann nicht abgeworfen, aber getauscht oder gestohlen werden.' },
        { term: 'Bewegliche und überlappende Spielplanteile', text: 'Sie bewegen sich mit allem, was darauf liegt. Eines auf einem anderen verdeckt nie ein ganzes Feld; was verdeckt ist, gehört nicht mehr zum Spielplan.' },
        { term: 'Elixiere', text: 'Werden zufällig erhalten; sieh dir die Rückseite nicht an, bis ein Effekt sie umdreht. Offen sind sie Besitz, verdeckt nicht.' },
        { term: 'Verbesserungen', text: '+1 auf den aufgedruckten Wert eines Attributs, einmal pro Attribut. Kein Besitz.' },
        { term: 'Fessel', text: 'Einem Monster in ihrem Feld muss nicht ausgewichen werden. Wenn dieses Monster aktiviert wird, dürft ihr sie abwerfen, damit es sich nicht bewegt.' },
        { term: 'Trümmer', text: 'Kein Durchsuchen, Erkunden oder Interagieren. Stärkeprobe: 1 Marker pro Erfolg; eine schwere Waffe räumt alle weg.' },
        { term: 'Gestrüpp', text: 'Um das Feld zu verlassen: Beobachtungsprobe mit einer Schwierigkeit gleich der Anzahl der Marker; misslingt sie, lege einen zufälligen Gegenstand ab. Eine Klingenwaffe räumt sie weg, Feuer ebenso.' },
        { term: 'Wasser', text: 'Es zu betreten beendet deine Bewegung (außer bei schwimmenden, fliegenden oder körperlosen Monstern). Es löscht Feuer.' },
        { term: 'Riss', text: 'Eine andere Aktion als Bewegen in seinem Feld auszuführen, macht dich Verloren in Zeit und Raum. Wissensprobe, um sie zu schließen: 1 pro Erfolg.' },
      ],
    },
    {
      title: 'Wenn etwas unklar ist',
      entries: [
        { text: 'Kann ein Effekt mehrere Ermittler betreffen oder treten mehrere gleichzeitig ein, entscheidet die Gruppe. Könnt ihr euch nicht einigen, entscheidet ein zufälliger Ermittler.' },
        { text: 'Effekte auf einen ausgeschiedenen Ermittler werden so weit wie möglich angewendet.' },
        { text: 'Das Log (das Buch oder »Log«, unten) bewahrt alles, was die App gesagt hat, nach Runden.' },
      ],
    },
  ],
};
