// DooM's help in Polish (RulesHelp.tsx), translated by Claude from the English one (October 2026): corrections by
// native speakers are welcome. The app's own words, not FFG's; the app's buttons as Valkyrie names them in Polish. Not in Valkyrie.
import type { RulesHelpText } from '../rulesMoM/types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    'W twojej aktywacji: jeśli zginąłeś, odradzasz się na wybranym aktywnym teleporterze, i przygotowujesz swoją kartę klasy. Wykonujesz 1 akcję główną i dowolnie wiele akcji dodatkowych, w dowolnej kolejności. Gdy skończysz, odrzuć zagrane karty, dobierz do 3 i naciśnij „Koniec Tury” na swoim portrecie: aplikacja aktywuje grupę demonów.',
  actions: [
    {
      title: 'Akcje',
      entries: [
        {
          term: 'Zagranie karty',
          text: 'Daje ci tyle punktów ruchu, ile wynosi jej szybkość, a jeśli ma pole ataku, także ten atak. Rozpatrz każdą kartę w całości, zanim zagrasz kolejną. Karty reakcji zagrywa się poza twoją aktywacją.',
        },
        { term: 'Sprint', text: 'Jako akcję główną odrzuć 1 kartę z ręki i otrzymaj 6 punktów ruchu.' },
        {
          term: 'Ruch',
          text: 'Każde pole kosztuje 1 punkt, także po przekątnej. Trudny teren kosztuje 1 więcej, a wejście na pole z wrogiem jeszcze 1 więcej. Możesz przechodzić przez innych żołnierzy, ale nie możesz zakończyć ruchu na zajętym polu. Wydawaj punkty, kiedy chcesz, z wyjątkiem środka ataku; niewykorzystane przepadają.',
        },
        {
          term: 'Otwarcie drzwi',
          text: 'Gdy z nimi sąsiadujesz, za 1 punkt ruchu: naciśnij je w aplikacji. Nigdy się już nie zamykają. Kolorowe drzwi wymagają swojej karty dostępu. W tych misjach demony nie otwierają drzwi.',
        },
        {
          term: 'Podniesienie',
          text: 'Przejdź przez pole z bronią, apteczką lub kartą dostępu i naciśnij jej żeton. Broń dodaje swoje karty do twojej talii, na wierzch; apteczka leczy 5 ran.',
        },
        {
          term: 'Egzekucja (Glory Kill)',
          text: 'Wejdź na pole zachwianego demona (2 punkty): ginie, dobierasz kartę Egzekucji i leczysz 2 rany. Potem możesz dalej się poruszać.',
        },
        {
          term: 'Teleportery',
          text: 'Wejście na nieaktywny go aktywuje. Wszystkie aktywne są połączone: przejście z jednego na drugi kosztuje 1 punkt. Jeśli przybywasz z innego albo odradzasz się na takim, na którym stoi demon, demon ginie (telefrag).',
        },
      ],
    },
    {
      title: 'Pamiętaj',
      entries: [
        { term: 'Amunicja', text: 'Nie ma jej: twoja ręka to twój magazynek. Możesz strzelać z broni tylko wtedy, gdy masz w ręce jedną z jej kart.' },
        { term: 'Portale', text: 'Gdy żołnierz zobaczy portal (linia wzroku), naciśnijcie jego żeton: aplikacja powie, jakie demony wychodzą i gdzie.' },
        { term: 'Ogłuszony', text: 'Odejmij 1 kość przy ataku, nie odsłaniasz obrony i nie masz osłony. Znika po ataku lub po byciu zaatakowanym.' },
      ],
    },
    {
      title: 'W aplikacji',
      entries: [
        { term: 'Koniec Tury', text: 'Na portrecie każdego żołnierza, na koniec jego aktywacji.' },
        { term: 'KO', text: 'Na portrecie żołnierza, który ginie: to frag dla najeźdźcy. Gdy się odradza, drugi przycisk portretu („Wyzdrowieć”).' },
        { term: 'Pokonany', text: 'Na portrecie grupy, gdy ginie ostatni demon tego rodzaju. „Unikatowy Pokonany” dla bossa.' },
        { term: 'Informacja', text: 'Na portrecie grupy: jej wyjaśnienia. „Wymuś Aktywację”, by grać z fizyczną talią inicjatywy.' },
        { term: 'Zasady misji', text: 'Żetony poza mapą po naciśnięciu pokazują tryb gry, cel i zasady misji.' },
      ],
    },
  ],
  rules: [
    {
      title: 'Runda',
      entries: [
        { term: 'Na początku', text: 'Aplikacja prosi o rozdzielenie Mocy Argent między rodzaje demonów w grze (zwykle 3, jak najrówniej) i, jeśli z niej gracie, dobiera efekt z talii zagrożenia na tę rundę.' },
        { term: 'Tryb Valkyrie', text: 'Żołnierz rozgrywa swoją aktywację i naciska „Koniec Tury”; aplikacja aktywuje wtedy losową grupę demonów spośród tych, które jeszcze nie działały. Tak aż wszyscy zadziałają.' },
        { term: 'Tryb normalny', text: 'Z fizyczną talią inicjatywy: gdy wyjdzie karta najeźdźcy, wybierzcie losowo grupę, która jeszcze nie działała, i naciśnijcie jej „Wymuś Aktywację”; gdy talia się skończy, każdy żołnierz naciska „Koniec Tury”.' },
        { term: 'Talia zagrożenia', text: 'To jednorundowe efekty tych misji (więcej kości, więcej pancerza…), a nie karty Zagrożenia z gry.' },
      ],
    },
    {
      title: 'Demony',
      entries: [
        { term: 'Aktywacja', text: 'Aplikacja mówi, jak daleko porusza się każdy demon, kogo atakuje i jakiej zdolności używa. Aktywują się po kolei, każdy z jednym atakiem, chyba że zdolność mówi inaczej.' },
        { term: 'Grupy', text: 'Demony tego samego rodzaju tworzą grupę i działają razem.' },
        { term: 'Argent', text: 'Kładzie się go na karcie każdego demona i wydaje na jego zdolności, za każdą figurkę. Gdy ginie ostatni demon danego rodzaju, jego Argent wraca do puli.' },
        { term: 'Obrona', text: 'W obronie demon odsłania wierzchnią kartę talii wydarzeń. Liczy się tylko jej obrona: tekst się pomija.' },
        { term: 'Latające', text: 'Ignorują trudny teren i koszt pól z wrogami oraz przekraczają teren nie do przejścia.' },
        { term: 'Duże', text: 'W aplikacji zajmują jedno pole: postawcie figurkę tam, gdzie się zmieści.' },
      ],
    },
    {
      title: 'Ataki',
      entries: [
        { term: 'Zasięg', text: 'Pola do obrońcy, licząc pole obrońcy. Maksimum podaje pole ataku.' },
        { term: 'Linia wzroku', text: 'Prosta linia od narożnika twojego pola do narożnika pola obrońcy. Przecinają ją ściany, zamknięte drzwi i teren blokujący; figurki nie.' },
        { term: 'Rzut', text: 'Rzuć kośćmi z pola ataku. Czerwona kość ma ścianki z 0, 1, 1, 1, 2 i 2 ranami; czarna z 1, 1, 2, 2, 2 i 3.' },
        { term: 'Obrona', text: 'Żołnierz odsłania wierzchnią kartę swojej talii akcji; demon, wierzchnią kartę talii wydarzeń. Każda tarcza anuluje 1 ranę, a unik anuluje wszystkie. Symbol obrony specjalnej uruchamia obronę demona, a twardość daje mu 1 tarczę więcej.' },
        { term: 'Osłona', text: 'Jeśli którakolwiek linia od twojego narożnika do narożników obrońcy przecina ścianę, trudny lub blokujący teren albo inną figurkę, obrońca może odrzucić odsłoniętą obronę i odsłonić kolejną.' },
      ],
    },
    {
      title: 'Zachwianie i egzekucje',
      entries: [
        { text: 'Gdy rany demona osiągną jego wartość zachwiania, zostaje zachwiany i można na nim wykonać egzekucję.' },
        { text: 'Efekty obniżające wydrukowaną wartość zachwiania (jak piła łańcuchowa) nie sumują się: obowiązuje najsilniejszy.' },
        { text: 'Egzekucję można wykonać tylko na demonach. Żołnierze leczą się egzekucjami, apteczkami i dzięki niektórym klasom.' },
      ],
    },
    {
      title: 'Śmierć, fragi i odrodzenie',
      entries: [
        { term: 'Śmierć', text: 'Żołnierz ginie, gdy jego rany osiągną jego zdrowie (10): naciśnijcie „KO”. Zdejmij figurkę, odrzuć jej rany, wtasuj rękę i stos kart odrzuconych do talii i dobierz 3. Żołnierz zachowuje swoją broń i karty Egzekucji.' },
        { term: 'Odrodzenie', text: 'Na początku swojej następnej aktywacji stawia figurkę na wybranym aktywnym teleporterze; naciśnijcie drugi przycisk jego portretu („Wyzdrowieć”).' },
        { term: 'Fragi', text: 'Każda śmierć to frag dla najeźdźcy. Misja mówi, ilu potrzebuje do zwycięstwa (zwykle 6); gdy je zdobędzie, aplikacja ogłasza waszą porażkę.' },
      ],
    },
    {
      title: 'Portale',
      entries: [
        { text: 'Są niebieskie, żółte i czerwone, od najmniej do najbardziej niebezpiecznych.' },
        { text: 'Gdy żołnierz zobaczy portal, naciśnijcie jego żeton: aplikacja wybiera jedną z grup tego koloru, mówi, gdzie ją postawić (na portalu lub obok), a czasem daje Argent. Żeton się usuwa.' },
        { text: 'Jeśli nie ma miejsca, figurki trafiają na najbliższe puste pole.' },
      ],
    },
    {
      title: 'Mapa i teren',
      entries: [
        { term: 'Ściany', text: 'Nie można ich przekroczyć i przecinają linię wzroku. Zamknięte drzwi są ścianą.' },
        { term: 'Trudny teren', text: 'Niebieska kropkowana obwódka: kosztuje 1 punkt więcej i daje osłonę.' },
        { term: 'Teren blokujący', text: 'Ciągła czerwona obwódka: nie można na niego wejść, przecina linię wzroku i daje osłonę.' },
        { term: 'Teren nie do przejścia', text: 'Czerwona kropkowana obwódka: nie można na niego wejść, ale nie przecina linii wzroku.' },
        { term: 'Przekątne', text: 'Można poruszać się po przekątnej, ale nie między dwoma polami, które stykają się tylko narożnikiem, chyba że inne pole przy tym narożniku sąsiaduje z oboma.' },
      ],
    },
    {
      title: 'Żołnierze i oddziały',
      entries: [
        { term: 'Talia początkowa', text: 'W prawie każdej misji UAC od 1 do 4 i Strzelba bojowa od 1 do 3; dobierz 3.' },
        { term: 'Klasa', text: 'Daje zdolność, która zwykle się wyczerpuje, a przygotowuje się na początku twojej aktywacji.' },
        { term: 'Oddziały', text: 'Przy mniej niż 4 żołnierzach: przy 3 jeden bierze „Taking Point”; przy 2 obaj biorą „Combat Veteran”; przy 1 „Solo Operative”, która daje dwie aktywacje na rundę: między nimi naciśnijcie „Wymuś Aktywację” na grupie, która jeszcze nie działała.' },
      ],
    },
    {
      title: 'Gdy coś jest niejasne',
      entries: [
        { text: 'Zasady misji mają pierwszeństwo: naciśnijcie jej żetony zasad poza mapą.' },
        { text: 'Aplikacja nie śledzi ran, zachwiania ani Argentu każdego demona, ani kart żołnierzy: śledzicie je fizycznymi żetonami i kartami.' },
        { text: '„Dziennik” przechowuje to, co powiedziała aplikacja, runda po rundzie.' },
      ],
    },
  ],
};
