// Descent's help in German (RulesHelp.tsx), translated by Claude from the English one (October 2026): corrections by
// native speakers are welcome. The app's own words, not FFG's; the app's buttons as Valkyrie names them in German. Not in Valkyrie.
import type { RulesHelpText } from '../rulesMoM/types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    'Zu Beginn deines Zuges enden Effekte, die »bis zu deinem nächsten Zug« gelten, du handelst die Effekte »zu Beginn deines Zuges« ab, machst deine erschöpften Karten wieder spielbereit und darfst deine Ausrüstung wechseln. Dann führst du bis zu 2 Aktionen in beliebiger Reihenfolge aus; du darfst dieselbe wiederholen oder darauf verzichten. Wenn du fertig bist, tippe auf deinem Porträt auf »Letzter Zug«: Die App aktiviert eine Monstergruppe.',
  actions: [
    {
      title: 'Aktionen',
      entries: [
        {
          term: 'Bewegen',
          text: 'Du erhältst so viele Bewegungspunkte wie deine Geschwindigkeit; jedes Feld kostet 1, auch diagonal. Du darfst die Bewegung aufteilen, um dazwischen eine andere Aktion auszuführen. Du kannst dich durch Helden hindurchbewegen, nicht durch Monster, und deine Bewegung nicht auf einem besetzten Feld beenden.',
        },
        { term: 'Angreifen', text: 'Mit einer ausgerüsteten Waffe oder waffenlos (nur der blaue Würfel, Nahkampf). Siehe »Angriffe« in der Regelübersicht.' },
        { term: 'Eine Fertigkeit einsetzen', text: 'Eine Klassenkarte mit dem Aktionssymbol, gegen Bezahlung ihrer Erschöpfung.' },
        { term: 'Ausruhen', text: 'Am Ende deines Zuges erholst du dich von deiner gesamten Erschöpfung, auch wenn es deine erste Aktion war.' },
        { term: 'Durchsuchen', text: 'Ein Suchmarker auf deinem Feld oder einem angrenzenden: Tippe in der App darauf und sie sagt dir, was du findest.' },
        {
          term: 'Eine Tür öffnen',
          text: 'Eine angrenzende Tür: Tippe in der App darauf, lies ihren Text und bestätige. Meist werden dadurch neue Spielplanteile, Marker und Monster aufgedeckt. In Road to Legend werden Türen nie wieder geschlossen.',
        },
        {
          term: 'Einen Helden wiederbeleben',
          text: 'Ein kampfunfähiger Held, dessen Marker angrenzt: Wirf 2 rote Würfel; er erholt sich von 1 Schaden pro Herz und 1 Erschöpfung pro Kraftschub und kehrt auf den Spielplan zurück. In seinem nächsten Zug spielt er normal.',
        },
        { term: 'Spezialaktion', text: 'Was Karten, Gegenstände oder das Szenario mit dem Aktionssymbol erlauben: ein Ziel aufheben, mit einem Dorfbewohner sprechen, einen Hebel umlegen …' },
      ],
    },
    {
      title: 'Wenn du kampfunfähig bist',
      entries: [
        {
          term: 'Aufstehen',
          text: 'Das ist das Einzige, was du in diesem Zug tun kannst: Wirf 2 rote Würfel, erhole dich von 1 Schaden pro Herz und 1 Erschöpfung pro Kraftschub und stelle deine Figur dorthin, wo dein Marker lag. Danach endet dein Zug. Tippe trotzdem auf »Letzter Zug«.',
        },
      ],
    },
    {
      title: 'Ohne eine Aktion zu verbrauchen',
      entries: [
        { text: 'Jeden Marker und jede Tür in der App ansehen, auch wenn du nicht daneben stehst, bevor du dich entscheidest.' },
        { text: 'Für jeden zusätzlichen Bewegungspunkt 1 Erschöpfung erleiden, ohne deine Ausdauer zu überschreiten.' },
        { text: 'Nach einer Bewegen-Aktion Gegenstände mit einem angrenzenden Helden tauschen. Klassenkarten können nicht getauscht werden.' },
        { text: 'Einen übrigen Kraftschub bei einem Angriff ausgeben, um dich von 1 Erschöpfung zu erholen.' },
        { text: 'Bei genau 2 Helden darf jeder pro Zug einen kostenlosen normalen Angriff durchführen; tut er das nicht, erholt er sich am Ende seines Zuges von 2 Schaden.' },
      ],
    },
    {
      title: 'In der App',
      entries: [
        { term: 'Letzter Zug', text: 'Auf dem Porträt jedes Helden, wenn sein Zug endet, auch wenn er kampfunfähig ist. Wird nicht darauf getippt, geht die Runde nicht weiter.' },
        { term: 'KO', text: 'Auf dem Porträt des Helden, der kampfunfähig wird: Die Moral sinkt. Wenn er auf den Spielplan zurückkehrt, der andere Knopf des Porträts (»Erholen«).' },
        { term: 'Besiegt', text: 'Auf dem Porträt der Monstergruppe, wenn das letzte Monster fällt. »Unique Besiegt«, wenn das einzigartige Monster fällt.' },
        { term: 'Information', text: 'Auf dem Porträt einer Gruppe: ihre Erläuterungen und die Reihenfolge, in der sie Kraftschübe ausgibt. »Erzwinge Aktivierung«, wenn das Szenario es verlangt.' },
        { term: 'Fähigkeiten und Inventar', text: 'Die Knöpfe unten: die Fertigkeiten und die Erfahrung jedes Helden sowie die Gegenstände und das Gold der Gruppe.' },
      ],
    },
  ],
  rules: [
    {
      title: 'Die Runde',
      entries: [
        { text: 'Die Gruppe wählt einen Helden, der noch nicht dran war; er macht seinen Zug und tippt auf »Letzter Zug«. Die App aktiviert dann zufällig eine der Monstergruppen, die noch nicht aktiviert wurden. Das wiederholt sich, Held und Gruppe im Wechsel.' },
        { text: 'Hat eine Seite keine Züge mehr, spielt die andere ihre restlichen nacheinander.' },
        { term: 'Ende der Runde', text: 'Wenn alle dran waren, werden die Rundenende-Effekte abgehandelt, die das Szenario nennt (Verstärkung, Gefahren …), und eine neue Runde beginnt. Die App speichert das Spiel zu Beginn jeder Runde.' },
        { text: 'Fähigkeiten der Helden mit »einmal pro Zug« werden während der Aktivierungen der Monster nicht eingesetzt.' },
      ],
    },
    {
      title: 'Aktivierung der Monster',
      entries: [
        { term: 'Fenster', text: 'Ein Sondereffekt für diese Aktivierung und die Liste der Aktionen für die Anführer (»Elite«, rote Figuren) und die Schergen (»Minion«, beige Figuren), in der angezeigten Reihenfolge.' },
        { term: 'Jedes Monster', text: 'Geht die Liste von oben nach unten durch und führt die erste Aktion aus, die es kann, bis es 2 ausgeführt hat; erreicht es das Ende, beginnt es wieder oben. Nur 1 Angriff pro Aktivierung, außer mit Fähigkeiten wie Verwüsten (Ravage).' },
        { term: 'Übersprungen', text: 'Was es nicht kann oder was keine Wirkung hätte: sich dorthin bewegen, wo es schon steht, angreifen ohne gültiges Ziel oder ohne Sichtlinie, ein zweiter Angriff.' },
        { term: 'Sichten', text: 'Bewegen, bis es höchstens 3 Felder vom Ziel entfernt ist und Sichtlinie hat.' },
        { term: 'Stellen', text: 'Bewegen, bis es an das Ziel angrenzt. Mit Reichweite (Reach) hält es höchstens 2 Felder entfernt mit Sichtlinie an.' },
        { term: 'Rückzug', text: 'Die restliche Bewegung nutzen, um sich vom nächsten Feind zu entfernen.' },
        { term: 'Gleichstand', text: 'Zwischen Zielen das nächstgelegene; herrscht weiter Gleichstand, entscheidet ihr.' },
        { text: 'Wenn alle Monster einer Art fertig sind, tippt auf »Elite Aktiviert« oder »Minion Aktiviert«.' },
      ],
    },
    {
      title: 'Bewegung und Gelände',
      entries: [
        { term: 'Diagonalen', text: 'Du darfst dich diagonal bewegen, aber nicht über die Ecke einer Wand.' },
        { term: 'Wasser', text: 'Das Betreten kostet 2 Bewegungspunkte.' },
        { term: 'Grube', text: 'Beim Betreten erleidest du 2 Schaden. Darin kannst du keine Bewegungspunkte ausgeben: Du verlässt sie mit einer Aktion auf ein angrenzendes leeres Feld.' },
        { term: 'Lava', text: 'Beim Betreten erleidest du 1 Schaden, und eine Figur, die ihren Zug darin beendet, ist besiegt.' },
        { term: 'Hindernis', text: 'Blockiert Bewegung und Sichtlinie.' },
        { term: 'Monster', text: 'Können keine Erschöpfung erleiden, um sich weiter zu bewegen. Sie meiden Gruben und Lava und nutzen Wasser nur, wenn es für sie günstiger ist.' },
        { term: 'Große Monster', text: 'Zählen ihre Bewegung von einem ihrer Felder aus, als wären sie klein, und werden am Ende so platziert, dass eines ihrer Felder das Zielfeld ist.' },
      ],
    },
    {
      title: 'Sichtlinie, Felder und angrenzend',
      entries: [
        { term: 'Sichtlinie', text: 'Eine gerade Linie von einer Ecke deines Feldes zu einer Ecke des Zielfeldes. Sie wird von Figuren, Hindernissen, Wänden und Türen blockiert; nur eine Ecke zu berühren blockiert sie nicht. Angrenzende Felder sehen sich immer.' },
        { term: 'Felder zählen', text: 'Der kürzeste Weg, ohne das Startfeld mitzuzählen. Figuren und Gelände, das kein Hindernis ist, spielen keine Rolle; durch Wände oder geschlossene Türen wird nicht gezählt.' },
        { term: 'Angrenzend', text: 'Felder, die eine Seite oder eine Ecke gemeinsam haben, außer eine Wand oder eine Tür trennt sie.' },
      ],
    },
    {
      title: 'Angriffe',
      entries: [
        { term: 'Wurf', text: 'Der Angreifer wirft den blauen Würfel und seine Kraftwürfel, der Verteidiger seine Verteidigungswürfel, alle gleichzeitig. Ein X auf dem blauen Würfel ist ein Fehlschlag.' },
        { term: 'Fernkampf', text: 'Die gesamte Reichweite auf den Würfeln muss die Anzahl der Felder bis zum Ziel erreichen; gegen ein angrenzendes Ziel brauchst du mindestens 1.' },
        { term: 'Kraftschübe', text: 'Jeder Kraftschub wird für eine andere Kraftschub-Fähigkeit ausgegeben, jede einmal pro Angriff.' },
        { term: 'Schaden', text: 'Die gewürfelten Herzen minus die Schilde des Verteidigers. 0 Schaden zu verursachen ist kein Fehlschlag. Ein Zustand aus einem Kraftschub wirkt nur, wenn der Angriff mindestens 1 Schaden verursacht.' },
        { term: 'Explosion', text: 'Betrifft auch jedes Feld, das an das Ziel angrenzt. Gegen mehrere Monster erleidet in Road to Legend das Ziel den vollen Schaden und die anderen die Hälfte, aufgerundet, vor Abzug der Schilde.' },
        { term: 'Durchschlag X', text: 'Ignoriert X Schilde.' },
      ],
    },
    {
      title: 'Attributsproben',
      entries: [
        { text: 'Wirf 1 grauen und 1 schwarzen Würfel und zähle die Schilde: Sind es gleich viele oder weniger als das Attribut (Stärke, Wissen, Willenskraft oder Wahrnehmung), hast du die Probe bestanden.' },
        { text: 'Anführer und Schergen scheitern immer; Leutnants legen die Probe mit ihren eigenen Attributen ab.' },
        { text: 'Die App würfelt nicht: Der Text sagt, was bei Bestehen und bei Scheitern geschieht.' },
      ],
    },
    {
      title: 'Schaden, Erschöpfung, kampfunfähig und Moral',
      entries: [
        { term: 'Lebenskraft', text: 'Wenn der Schaden die Lebenskraft erreicht oder übersteigt, ist die Figur besiegt.' },
        { term: 'Erschöpfung', text: 'Erschöpfung, die du freiwillig erleidest, überschreitet nie deine Ausdauer. Erschöpfung, die dir ein Effekt aufzwingt, erleidest du als Schaden, wenn sie nicht mehr passt. Monster erleiden Schaden statt Erschöpfung.' },
        { term: 'Kampfunfähig', text: 'Du erleidest Erschöpfung bis zu deiner Ausdauer, ersetzt deine Figur durch deinen Heldenmarker, legst deine Zustände ab und, falls du am Zug warst, endet dein Zug. Tippt auf deinem Porträt auf »KO«.' },
        { term: 'Moral', text: 'Beginnt in Höhe der Heldenanzahl und sinkt mit jedem KO um 1. Steht sie auf 0 und fällt ein weiterer Held, flieht ihr und verliert das Szenario.' },
      ],
    },
    {
      title: 'Zustände',
      entries: [
        { text: 'Du kannst denselben Zustand nicht zweimal haben. Proben für Zustände werden zu Beginn des Zuges abgelegt. Wirst du kampfunfähig, legst du alle ab.' },
        { term: 'Vergiftet', text: 'Stärkeprobe: Scheiterst du, erleidest du 1 Schaden und behältst den Zustand.' },
        { term: 'Krank', text: 'Willenskraftprobe: Scheiterst du, erleidest du 1 Erschöpfung und behältst den Zustand.' },
        { term: 'Bewegungsunfähig', text: 'Du kannst keine Bewegen-Aktionen ausführen. Wird am Ende deines Zuges abgelegt.' },
        { term: 'Betäubt', text: 'Die einzige Aktion, die du ausführen kannst, ist, ihn abzulegen; danach deine andere Aktion wie gewohnt.' },
        { term: 'Brennend', text: 'Am Ende deines Zuges erleidest du und jede angrenzende befreundete Figur 1 Schaden. Wird mit einer Aktion von dir oder von jemandem, der angrenzt, entfernt.' },
        { term: 'Verflucht', text: 'Du kannst keine Fertigkeitsaktionen einsetzen. Wird entfernt, wenn du zu Beginn des Zuges eine Wissensprobe bestehst.' },
        { term: 'Geschwächt', text: '1 Schild weniger beim Verteidigen und 1 Herz weniger beim Angreifen. Wird entfernt, wenn du dich ausruhst.' },
        { term: 'Blutend', text: 'Du erleidest 1 Erschöpfung für jede Aktion, die nicht dem Ablegen dient.' },
        { term: 'Verdammt', text: 'Jedes Mal, wenn du Schaden erleidest, erleidest du 1 Schaden mehr. Wird durch Ausgeben eines Kraftschubs entfernt.' },
        { term: 'Verängstigt', text: 'Du kannst keine Kraftschübe ausgeben. Wird am Ende deines Zuges entfernt, wenn du keinen Feind sehen kannst.' },
      ],
    },
    {
      title: 'Helden, Ausrüstung und Durchsuchen',
      entries: [
        { term: 'Werte', text: 'Geschwindigkeit (Bewegung), Lebenskraft, Ausdauer (maximale Erschöpfung), Verteidigung und die Attribute Stärke, Wissen, Willenskraft und Wahrnehmung.' },
        { term: 'Heldentat', text: 'Einmal pro Szenario; wenn du sie einsetzt, drehst du deinen Heldenbogen um.' },
        { term: 'Ausrüstung', text: 'Zwei Hände (eine Zweihandwaffe belegt beide), eine Rüstung und zwei weitere Gegenstände. Sie kann nur zu Beginn deines Zuges gewechselt werden.' },
        { term: 'Erschöpfen', text: 'Eine benutzte Karte wird quergedreht und kann erst wieder benutzt werden, wenn du sie zu Beginn deines Zuges spielbereit machst.' },
        { term: 'Durchsuchen', text: 'Suchkarten werden am Ende des Szenarios abgelegt. Das Gold gehört der ganzen Gruppe.' },
      ],
    },
    {
      title: 'Ziel, Sieg und Niederlage',
      entries: [
        { text: 'Das Szenario nennt das Ziel und kann es ändern (»Ziel aktualisiert«). Ihr gewinnt, wenn ihr es erfüllt.' },
        { text: 'Ihr verliert durch die Moral oder wie das Szenario es sagt. Trödelt ihr, schlagen am Ende mancher Runden immer schlimmere Gefahren zu.' },
        { term: 'Am Ende', text: 'Die Helden erholen sich von allem Schaden und aller Erschöpfung, drehen ihren Heldenbogen auf die Vorderseite und legen Zustände und Suchkarten ab. Gold, Erfahrung, Gegenstände und Ruhm bleiben erhalten.' },
      ],
    },
    {
      title: 'Wenn etwas unklar ist',
      entries: [
        { text: 'Karten haben Vorrang vor den allgemeinen Regeln, und die Szenarioregeln vor allem anderen.' },
        { text: 'Lässt ein Effekt mehrere Möglichkeiten zu, entscheidet die Gruppe. Die App prüft keine Regel: Ihr wendet sie an.' },
        { text: 'Die App weiß nicht, wo die Figuren stehen, welchen Schaden oder welche Zustände sie haben: Wenn ihr mitten im Szenario speichert, schreibt es auf. Das »Log« bewahrt auf, was die App gesagt hat.' },
      ],
    },
  ],
};
