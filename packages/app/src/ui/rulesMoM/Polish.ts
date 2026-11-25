// Mansions' help in Polish (RulesHelp.tsx), translated by Claude from the English one (October 2026): corrections by
// native speakers are welcome. The app's own words, not FFG's; the app's buttons as Valkyrie names them in Polish. Not in Valkyrie.
import type { RulesHelpText } from './types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    'W swojej turze wykonujesz do 2 akcji, w dowolnej kolejności, i możesz powtórzyć tę samą (dwa ruchy to do 4 pól). Grupa decyduje, kto rozgrywa kolejną turę.',
  actions: [
    {
      title: 'Akcje',
      entries: [
        {
          term: 'Ruch',
          text: 'Do 2 pól, po jednym. Możesz go podzielić: przesuń się o 1, wykonaj inną akcję, a potem przesuń się o drugie. Nie można przechodzić przez ściany, przerywane krawędzie ani drzwi z Przeszkodą lub żetonem Eksploracji.',
        },
        { term: 'Eksploracja', text: 'Naciśnij żeton Eksploracji na swoim polu lub na drzwiach obok ciebie. Aplikacja powie, co położyć.' },
        { term: 'Przeszukanie', text: 'Naciśnij żeton Przeszukania na swoim polu.' },
        { term: 'Interakcja', text: 'Naciśnij żeton Interakcji lub Postaci na swoim polu i wybierz opcję z ikoną akcji.' },
        {
          term: 'Wymiana',
          text: 'Oddaj, podnieś lub upuść dowolnie wiele Przedmiotów i Zaklęć z badaczami na twoim polu. Podniesienie czegoś z podłogi również kosztuje tę akcję. Wskazówek nie można wymieniać.',
        },
        {
          term: 'Atak',
          text: 'Wybierz potwora na liście potworów, naciśnij „Atak” i rodzaj broni. Wręcz lub bez broni: na twoim polu; dystansowo: do 3 pól. Zapisz Obrażenia przyciskami + i −.',
        },
        { term: 'Element gry', text: 'Użyj efektu „Akcja:” z karty albo przedmiotu z ekwipunku (plecak lub „Ekwipunek”, na dole po lewej).' },
        {
          term: 'Przeszkoda',
          text: 'Przesuń Przeszkodę ze swojego pola pod drzwi lub Tajne Przejście albo odsuń ją od nich. Z drugiej strony drzwi: test Siły; przy 2 sukcesach odsuwasz ją i przechodzisz.',
        },
        { term: 'Gaszenie ognia', text: 'Test Zręczności: każdy sukces odrzuca 1 Ogień z twojego pola lub z pola, na które wejdziesz w tej turze.' },
      ],
    },
    {
      title: 'Rzadkie akcje (głównie z kartą Obłędu)',
      entries: [
        {
          term: 'Popchnięcie',
          text: 'Przesuń potwora lub badacza z twojego pola o 1 pole. Test Siły przeciw Agresji potwora albo przeciw wynikowi badacza + 1, jeśli się opiera. Jeśli ci się uda, możesz za nim pójść.',
        },
        { term: 'Kradzież', text: 'Wybierz Siłę, Zręczność lub Obserwację i oboje wykonujecie test. Zabierasz 1 posiadaną rzecz za każdy sukces ponad jego wynik.' },
        {
          term: 'Podpalenie',
          text: 'Mając Źródło Światła, połóż Ogień na swoim polu lub na sąsiednim. Jeśli nie było jeszcze Ognia, naciśnij „Ust.” (zwój na dole) → „Podpalenie”, aby aplikacja go rozprzestrzeniała.',
        },
      ],
    },
    {
      title: 'Bez akcji',
      entries: [
        { text: 'Żetony Widoku (oko).' },
        { text: 'Opcje aplikacji bez ikony akcji: naciśnięcie żetonu, aby go przeczytać, do niczego cię nie zobowiązuje.' },
        { text: 'Zdolności, które nie mówią „Akcja:”.' },
      ],
    },
    {
      title: 'Pamiętaj',
      entries: [
        {
          term: 'Unik',
          text: 'Na polu potwora, przed każdą akcją inną niż Atak lub Ruch, oraz by z niego wyjść: wybierz potwora o najwyższej Świadomości (zielona liczba) i naciśnij „Unik”. Jeśli ci się nie uda, zwykle tracisz akcję.',
        },
        { term: 'Ranny', text: 'Możesz wykonać tylko jedną akcję Ruchu na rundę.' },
        { term: 'Ogień', text: 'Wejście na pole z Ogniem albo wykonanie lub utrata akcji na nim zadaje 1 Obrażenie zakryte.' },
        { term: 'Ciemność', text: 'Nie możesz wydawać Wskazówek, chyba że na twoim polu lub sąsiednim jest Źródło Światła albo Ogień.' },
      ],
    },
  ],
  rules: [
    {
      title: 'Przed rozpoczęciem',
      entries: [
        { text: 'Potasujcie osobno talie Obrażeń i Przerażenia i połóżcie je zakryte.' },
        { text: 'Posortujcie według nazw, odkryte, Przedmioty Zwykłe, Przedmioty Unikatowe, Zaklęcia i Stany.' },
        { text: 'Posortujcie żetony według rodzaju. Aplikacja mówi, które kafelki, żetony i potwory położyć i kiedy.' },
        { text: 'Początkowe rzeczy rozdzielcie, jak chcecie; Wskazówki tak, jak mówi aplikacja. Przeczytajcie prolog: może zawierać wskazówki do fabuły.' },
      ],
    },
    {
      title: 'Runda',
      entries: [
        { term: 'Faza Badaczy', text: 'Każdy badacz rozgrywa całą turę z maksymalnie 2 akcjami, w kolejności wybranej przez grupę. Gdy wszyscy skończą, naciśnijcie przycisk ➤ w prawym dolnym rogu.' },
        { term: 'Faza Mitów', text: 'W tej kolejności:' },
        { term: '1. Ogień', text: 'Jeśli jest Ogień, dodajcie łącznie 1 żeton (nie po jednym na każdy ogień) na pole sąsiadujące z polem z Ogniem.' },
        { term: '2. Wydarzenia', text: 'Aplikacja pokazuje jedno lub więcej wydarzeń Mitów; rozpatrzcie je zgodnie z treścią.' },
        { term: '3. Potwory', text: 'Aplikacja aktywuje każdego potwora, jednego po drugim.' },
        { term: '4. Przerażenie', text: 'Każdy badacz wykonuje test Przerażenia przeciw potworowi z najwyższą wartością Przerażenia w swoim zasięgu, jeśli taki jest.' },
        { text: 'Naciśnijcie ➤ i zaczyna się nowa runda. Czas płynie, nawet jeśli go nie widać: aplikacja decyduje, kiedy jest za późno.' },
      ],
    },
    {
      title: 'Testy',
      entries: [
        { term: 'Kości', text: 'Tyle, ile wynosi cecha, z modyfikatorami (co najmniej 1). Każda kość ma 3 ścianki sukcesu, 2 ścianki śledztwa (lupa) i 3 puste.' },
        { term: 'Wynik', text: 'Liczba sukcesów. „(Zręczność −1; 2)” to test Zręczności z jedną kością mniej, wymagający 2 sukcesów.' },
        { term: 'Wskazówki', text: 'Po rzucie każda wydana Wskazówka zamienia 1 lupę w sukces. To nie jest przerzut.' },
        { term: 'Zapobieganie', text: 'Jeśli tekst mówi „zapobiega…”, każdy sukces zapobiega 1 Obrażeniu lub 1 Przerażeniu.' },
        { term: 'Rzut kośćmi', text: 'Jeśli tekst mówi tylko „rzuć X kośćmi”, to nie jest test: nie można wydawać Wskazówek.' },
        { text: 'Rzuca tylko aktywny badacz, chyba że efekt mówi inaczej.' },
      ],
    },
    {
      title: 'Obrażenia, Przerażenie, Ranny i Obłąkany',
      entries: [
        { term: 'Karty', text: 'Otrzymanie Obrażenia lub Przerażenia to dobranie karty z jej talii, odkrytej, chyba że mówi się „zakrytej”. Zakryte karty nic nie robią: tylko się liczą.' },
        { term: 'Odkryte', text: '„Rozpatrz natychmiast” działa w chwili otrzymania; „Zachowaj odkrytą” działa, dopóki pozostaje odkryta. Jeśli trzeba odwrócić zakryte karty, wybiera się je losowo.' },
        { term: 'Ranny', text: 'Gdy łączne Obrażenia osiągną twoje Zdrowie: stajesz się Ranny i odrzucasz zakryte Obrażenia. Możesz poruszać się tylko raz na rundę.' },
        { term: 'Obłąkany', text: 'To samo z Przerażeniem i Poczytalnością. Przeczytaj w tajemnicy rewers swojej karty Obłędu: może zmienić warunek twojego zwycięstwa. Jeśli wymaga więcej badaczy, niż was jest, weź inną.' },
        { term: 'Wyeliminowany', text: 'Jeśli, będąc już Rannym lub Obłąkanym, znów osiągniesz limit: upuszczasz swoje rzeczy i zdejmujesz figurkę. Naciśnijcie „Ust.” (zwój na dole) → „Wyeliminowano badacza”. Pozostali przegrywają na koniec następnej Fazy Badaczy, chyba że już skończyli.' },
      ],
    },
    {
      title: 'Potwory',
      entries: [
        { term: 'Żeton', text: 'Świadomość (zielona): przed którym robicie unik. Przerażenie (niebieskie): przeciw któremu wykonujecie test Przerażenia. Agresja (czerwona, na rewersie): kości przeciw Przeszkodom i trudność popchnięcia go. Zdrowie liczy aplikacja.' },
        { term: 'Aktywacja', text: 'Róbcie, co mówi aplikacja. „W stronę” oznacza, że każdy krok przybliża go do celu; zatrzymuje się, gdy go osiągnie. Jeśli w zasięgu nie ma celu, nie rusza się: naciśnijcie przycisk braku badaczy, a aplikacja wyda inny rozkaz.' },
        { term: 'Drzwi', text: 'Przechodzą przez nie swobodnie, chyba że są zablokowane: wtedy rzucają tyloma kośćmi, ile wynosi ich Agresja, i przy 2 sukcesach niszczą Przeszkodę; w przeciwnym razie tracą ruch (ale nadal atakują, jeśli dzielą pole z kimś).' },
        { term: 'Test Przerażenia', text: 'Tylko w Etapie Przerażenia. Jeśli kilku badaczy wykonuje go przeciw temu samemu potworowi, aplikacja pokazuje go raz, a każdy rzuca i stosuje swój.' },
        { term: 'Ogień', text: 'Potwór, który zaczyna aktywację w Ogniu lub do niego wchodzi, otrzymuje 1 Obrażenie.' },
      ],
    },
    {
      title: 'Mapa i zasięg',
      entries: [
        { term: 'Pola', text: 'Ciągłe krawędzie (białe lub żółte): można je przekraczać. Przerywane krawędzie: nie można ich przekraczać, ale zasięg przez nie przechodzi. Ściany: nic ich nie przekracza ani przez nie nie przechodzi. Drzwi: można je przekraczać, ale zasięg przez nie nie przechodzi.' },
        { term: 'Zasięg', text: 'Do 3 pól, przy czym twoje liczy się jako 0. Może skręcać za rogi: nie ma linii wzroku. Nie przechodzi przez ściany, drzwi ani Tajne Przejścia.' },
        { term: 'Sąsiednie', text: 'Efekty dotyczące sąsiednich pól (światło, rozprzestrzenianie Ognia) przechodzą przez drzwi, nigdy przez ściany.' },
        { term: 'Tajne Przejście', text: 'Wszystkie pola z Tajnym Przejściem sąsiadują ze sobą w kwestii ruchu.' },
        { term: 'Północ', text: 'Zawsze góra ekranu.' },
        { term: 'Wewnątrz i na zewnątrz', text: 'Pomieszczenia na zewnątrz mają srebrną tabliczkę z nazwą i czerwonymi mackami. Niektóre wydarzenia je rozróżniają.' },
      ],
    },
    {
      title: 'Ogień, Ciemność i Przeszkody',
      entries: [
        { term: 'Ogień', text: 'Na jednym polu nigdy nie mogą być 2. Rozprzestrzenia się przez drzwi, nie przez ściany; Przeszkody go nie zatrzymują. Ogień ugaszony twoją akcją już ci nie zadaje Obrażeń.' },
        { term: 'Ciemność', text: 'Na jej polu nie wydaje się Wskazówek, ani do testów, ani do zagadek. Źródło Światła lub Ogień na twoim polu lub sąsiednim ją znosi.' },
        { term: 'Przeszkoda', text: 'Ani badacze, ani potwory nie przechodzą przez zablokowane drzwi lub Przejście. Nie przeszkadza w pojawianiu się potworów.' },
      ],
    },
    {
      title: 'Przedmioty, Zaklęcia i Stany',
      entries: [
        { term: 'Posiadane rzeczy', text: 'Przedmioty Zwykłe, Przedmioty Unikatowe i Zaklęcia. Wskazówki, Stany, Obrażenia i Przerażenie nimi nie są.' },
        { term: 'Przedmioty', text: 'Możesz oglądać ich rewers, kiedy chcesz. Gdy przedmiot zostanie odwrócony, jego rewers zastępuje awers.' },
        { term: 'Zaklęcia', text: 'Dostajesz losowy egzemplarz i nigdy nie oglądasz jego rewersu. Aby je rzucić, odwracasz je, rozpatrujesz rewers i prawie zawsze je odrzucasz i dostajesz inny egzemplarz.' },
        { term: 'Stany', text: 'Odkryte i nigdy w dwóch egzemplarzach. Ogłuszony: tylko 1 akcja w twojej turze. Oszołomiony: nie wydajesz Wskazówek. Unieruchomiony: nie możesz poruszać się sam. Skupiony: odrzuć go, aby wszystkie twoje lupy stały się sukcesami.' },
        { term: 'Broń', text: 'Aby zaatakować danym rodzajem broni, musisz mieć broń tego rodzaju. Bez broni możesz atakować zawsze.' },
      ],
    },
    {
      title: 'Zagadki',
      entries: [
        { term: 'Kroki', text: 'Tyle, ile wynosi wydrukowana wartość cechy, o którą prosi aplikacja, plus 1 za każdą wydaną Wskazówkę (nie w Ciemności). Aplikacja ich nie liczy: liczcie je sami.' },
        { term: 'Zamknij', text: 'Gdy kroki się skończą, naciśnij „Zamknij”: postęp zostaje zachowany i ktoś może kontynuować później inną akcją. Możecie sobie doradzać.' },
        { term: 'Przesuwanka', text: 'Odtwórz obrazek, zamieniając w każdym kroku dwa sąsiednie elementy.' },
        { term: 'Zamek', text: 'Przesuwaj bloki, jeden na krok, aż docelowy element wyjdzie z prawej strony.' },
        { term: 'Szyfr', text: 'W każdym kroku zgadnij jeden szyfr. Sukces za każdy symbol na swoim miejscu; lupa za każdy właściwy symbol na złym miejscu.' },
        { term: 'Wieża', text: 'Przenoś górny element z jednej kolumny na inną, aż wszystkie zostaną ułożone w stos, od największego do najmniejszego.' },
      ],
    },
    {
      title: 'Dodatki',
      entries: [
        { term: 'Klucz', text: 'Przedmiot z żetonem Klucza zyskuje cechy Klucz i Dowód i nie można go odrzucić, ale można go wymienić lub ukraść.' },
        { term: 'Przesuwane i nakładające się kafelki', text: 'Przesuwają się ze wszystkim, co na nich jest. Kafelek na innym nigdy nie zakrywa całego pola; to, co zakryte, przestaje być częścią planszy.' },
        { term: 'Eliksiry', text: 'Zdobywane losowo; nie oglądaj rewersu, dopóki efekt ich nie odwróci. Odkryte są posiadanymi rzeczami; zakryte nie.' },
        { term: 'Ulepszenia', text: '+1 do wydrukowanej wartości cechy, raz na cechę. Nie są posiadanymi rzeczami.' },
        { term: 'Pęta', text: 'Przed potworem na jej polu nie trzeba robić uniku. Gdy ten potwór się aktywuje, możecie ją odrzucić, aby się nie ruszył.' },
        { term: 'Gruz', text: 'Nie można Przeszukiwać, Eksplorować ani wchodzić w Interakcję. Test Siły: 1 żeton za sukces; Ciężka Broń usuwa wszystkie.' },
        { term: 'Zarośla', text: 'Aby wyjść, test Obserwacji o trudności równej liczbie żetonów; jeśli się nie uda, upuść losowy przedmiot. Broń Sieczna je usuwa; Ogień również.' },
        { term: 'Woda', text: 'Wejście na nią kończy twój ruch (z wyjątkiem potworów wodnych, latających lub przenikających). Gasi Ogień.' },
        { term: 'Szczelina', text: 'Wykonanie na jej polu akcji innej niż ruch sprawia, że stajesz się Zagubiony w Czasie i Przestrzeni. Test Wiedzy, aby je zamknąć: 1 za sukces.' },
      ],
    },
    {
      title: 'Gdy coś jest niejasne',
      entries: [
        { text: 'Jeśli efekt mógłby dotyczyć kilku badaczy albo kilka efektów zachodzi naraz, decyduje grupa. Jeśli nie możecie się porozumieć, decyduje losowy badacz.' },
        { text: 'Efekty dotyczące wyeliminowanego badacza stosuje się w miarę możliwości.' },
        { text: 'Dziennik (książka lub „Dziennik”, na dole) przechowuje wszystko, co powiedziała aplikacja, według rund.' },
      ],
    },
  ],
};
