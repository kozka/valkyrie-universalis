// Descent's help in Polish (RulesHelp.tsx), translated by Claude from the English one (October 2026): corrections by
// native speakers are welcome. The app's own words, not FFG's; the app's buttons as Valkyrie names them in Polish. Not in Valkyrie.
import type { RulesHelpText } from '../rulesMoM/types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    'Na początku twojej tury kończą się efekty trwające „do twojej następnej tury”, rozpatrujesz te „na początku twojej tury”, odświeżasz wyczerpane karty i możesz zmienić ekwipunek. Potem wykonujesz do 2 akcji, w dowolnej kolejności; możesz powtórzyć tę samą albo z nich zrezygnować. Gdy skończysz, naciśnij „Koniec Tury” na swoim portrecie: aplikacja aktywuje grupę potworów.',
  actions: [
    {
      title: 'Akcje',
      entries: [
        {
          term: 'Ruch',
          text: 'Otrzymujesz tyle punktów ruchu, ile wynosi twoja Szybkość; każde pole kosztuje 1, także po przekątnej. Możesz go podzielić, by w międzyczasie wykonać inną akcję. Możesz przechodzić przez bohaterów, ale nie przez potwory, i nie możesz zakończyć ruchu na zajętym polu.',
        },
        { term: 'Atak', text: 'Wyposażoną bronią albo gołymi rękami (tylko niebieska kość, walka wręcz). Zobacz „Ataki” w podsumowaniu zasad.' },
        { term: 'Użycie umiejętności', text: 'Karta klasy z symbolem akcji, po zapłaceniu jej kosztu w zmęczeniu.' },
        { term: 'Odpoczynek', text: 'Na koniec tury odzyskujesz całe zmęczenie, nawet jeśli była to twoja pierwsza akcja.' },
        { term: 'Przeszukanie', text: 'Żeton poszukiwań na twoim polu lub sąsiednim: naciśnij go w aplikacji, a powie ci, co znajdujesz.' },
        {
          term: 'Otwarcie drzwi',
          text: 'Sąsiednie drzwi: naciśnij je w aplikacji, przeczytaj tekst i potwierdź. Zwykle odsłaniają nowe elementy planszy, żetony i potwory. W Road to Legend drzwi nigdy nie są ponownie zamykane.',
        },
        {
          term: 'Ocucenie bohatera',
          text: 'Pokonany bohater, którego żeton sąsiaduje z tobą: rzuć 2 czerwonymi kośćmi, odzyskuje 1 ranę za każde serce i 1 zmęczenie za każdy zryw, i wraca na mapę. W swojej następnej turze gra normalnie.',
        },
        { term: 'Akcja specjalna', text: 'To, na co pozwalają karty, przedmioty lub przygoda z symbolem akcji: podniesienie celu, rozmowa z wieśniakiem, pociągnięcie dźwigni…' },
      ],
    },
    {
      title: 'Jeśli zostałeś pokonany',
      entries: [
        {
          term: 'Wstanie',
          text: 'To jedyne, co możesz zrobić w tej turze: rzuć 2 czerwonymi kośćmi, odzyskaj 1 ranę za każde serce i 1 zmęczenie za każdy zryw, i postaw figurkę tam, gdzie był twój żeton. Potem twoja tura się kończy. I tak naciśnij „Koniec Tury”.',
        },
      ],
    },
    {
      title: 'Bez wydawania akcji',
      entries: [
        { text: 'Obejrzyj w aplikacji dowolny żeton lub drzwi, nawet jeśli nie stoisz obok, zanim podejmiesz decyzję.' },
        { text: 'Otrzymaj 1 zmęczenie za każdy dodatkowy punkt ruchu, nie przekraczając swojej Wytrzymałości.' },
        { text: 'Wymień się przedmiotami z sąsiednim bohaterem po akcji Ruchu. Kart klasy nie można wymieniać.' },
        { text: 'Wydaj niewykorzystany zryw z ataku, by odzyskać 1 zmęczenie.' },
        { text: 'Przy dokładnie 2 bohaterach każdy może wykonać jeden darmowy zwykły atak na turę; jeśli tego nie zrobi, na koniec swojej tury odzyskuje 2 rany.' },
      ],
    },
    {
      title: 'W aplikacji',
      entries: [
        { term: 'Koniec Tury', text: 'Na portrecie każdego bohatera, gdy kończy się jego tura, nawet jeśli jest pokonany. Jeśli nie zostanie naciśnięty, runda nie posuwa się dalej.' },
        { term: 'KO', text: 'Na portrecie bohatera, który został pokonany: morale spada. Gdy wraca na mapę, drugi przycisk portretu („Wyzdrowieć”).' },
        { term: 'Pokonany', text: 'Na portrecie grupy potworów, gdy padnie ostatni z nich. „Unikatowy Pokonany”, jeśli padnie potwór unikatowy.' },
        { term: 'Informacja', text: 'Na portrecie grupy: jej wyjaśnienia i kolejność, w jakiej wydaje zrywy. „Wymuś Aktywację”, jeśli przygoda tego wymaga.' },
        { term: 'Umiejętności i Przedmioty', text: 'Przyciski na dole: umiejętności i doświadczenie każdego bohatera oraz przedmioty i złoto drużyny.' },
      ],
    },
  ],
  rules: [
    {
      title: 'Runda',
      entries: [
        { text: 'Drużyna wybiera bohatera, który jeszcze nie grał; rozgrywa on swoją turę i naciska „Koniec Tury”. Aplikacja aktywuje wtedy losową grupę potworów spośród tych, które jeszcze nie były aktywowane. Tak na zmianę: bohater i grupa.' },
        { text: 'Jeśli jednej stronie skończą się tury, druga rozgrywa swoje pozostałe pod rząd.' },
        { term: 'Koniec rundy', text: 'Gdy wszyscy zagrali, rozpatruje się efekty końca rundy wskazane przez przygodę (posiłki, zagrożenia…) i zaczyna się nowa runda. Aplikacja zapisuje grę na początku każdej rundy.' },
        { text: 'Zdolności bohaterów „raz na turę” nie są używane podczas aktywacji potworów.' },
      ],
    },
    {
      title: 'Aktywacja potworów',
      entries: [
        { term: 'Okno', text: 'Efekt specjalny tej aktywacji i lista akcji dla potworów elitarnych („Elitarny”, czerwone figurki) i sług („Sługa”, beżowe figurki), w pokazanej kolejności.' },
        { term: 'Każdy potwór', text: 'Przechodzi listę od góry do dołu i wykonuje pierwszą akcję, którą może, aż wykona 2; jeśli dojdzie do końca, zaczyna znowu od góry. Tylko 1 atak na aktywację, chyba że pozwalają na więcej zdolności takie jak Spustoszenie (Ravage).' },
        { term: 'Pomijane', text: 'To, czego nie może zrobić albo co nie dałoby efektu: ruch tam, gdzie już stoi, atak bez prawidłowego celu lub bez linii wzroku, drugi atak.' },
        { term: 'Wypatrzenie', text: 'Ruch, aż znajdzie się w odległości do 3 pól od celu i z linią wzroku.' },
        { term: 'Zwarcie', text: 'Ruch, aż znajdzie się na polu sąsiednim z celem. Z Zasięgiem (Reach) zatrzymuje się w odległości do 2 pól z linią wzroku.' },
        { term: 'Odwrót', text: 'Wydaje pozostały ruch na oddalanie się od najbliższego wroga.' },
        { term: 'Remisy', text: 'Między celami wybiera najbliższy; jeśli nadal jest remis, decydujecie wy.' },
        { text: 'Gdy skończą wszystkie potwory jednego rodzaju, naciśnijcie „Elitarny Aktywowano” lub „Sługa Aktywowano”.' },
      ],
    },
    {
      title: 'Ruch i teren',
      entries: [
        { term: 'Przekątne', text: 'Można poruszać się po przekątnej, ale nie przez narożnik ściany.' },
        { term: 'Woda', text: 'Wejście kosztuje 2 punkty ruchu.' },
        { term: 'Jama', text: 'Po wejściu otrzymujesz 2 rany. W środku nie możesz wydawać punktów ruchu: wychodzisz akcją na sąsiednie puste pole.' },
        { term: 'Lawa', text: 'Po wejściu otrzymujesz 1 ranę, a figurka, która kończy w niej turę, zostaje pokonana.' },
        { term: 'Przeszkoda', text: 'Blokuje ruch i linię wzroku.' },
        { term: 'Potwory', text: 'Nie mogą otrzymywać zmęczenia, by poruszyć się dalej. Omijają jamy i lawę, a przez wodę idą tylko wtedy, gdy to dla nich tańsze.' },
        { term: 'Duże potwory', text: 'Liczą ruch od jednego ze swoich pól, jakby były małe, a na koniec ustawia się je tak, by jedno z ich pól było polem docelowym.' },
      ],
    },
    {
      title: 'Linia wzroku, pola i sąsiedztwo',
      entries: [
        { term: 'Linia wzroku', text: 'Prosta linia od narożnika twojego pola do narożnika pola celu. Blokują ją figurki, przeszkody, ściany i drzwi; samo dotknięcie narożnika jej nie blokuje. Sąsiednie pola zawsze się widzą.' },
        { term: 'Liczenie pól', text: 'Najkrótsza droga, bez liczenia pola startowego. Figurki i teren, który nie jest przeszkodą, nie mają znaczenia; nie liczy się przez ściany ani zamknięte drzwi.' },
        { term: 'Sąsiednie', text: 'Pola, które mają wspólny bok lub narożnik, chyba że oddziela je ściana lub drzwi.' },
      ],
    },
    {
      title: 'Ataki',
      entries: [
        { term: 'Rzut', text: 'Atakujący rzuca niebieską kością i swoimi kośćmi mocy, a obrońca swoimi kośćmi obrony, wszystko naraz. X na niebieskiej kości oznacza chybienie.' },
        { term: 'Dystansowy', text: 'Suma zasięgu na kościach musi sięgać liczby pól do celu; przeciw sąsiedniemu potrzeba co najmniej 1.' },
        { term: 'Zrywy', text: 'Każdy zryw wydaje się na inną zdolność zrywu, każdą raz na atak.' },
        { term: 'Rany', text: 'Wyrzucone serca minus tarcze obrońcy. Zadanie 0 ran to nie chybienie. Stan ze zrywu działa tylko wtedy, gdy atak zada co najmniej 1 ranę.' },
        { term: 'Wybuch', text: 'Działa też na każde pole sąsiednie z celem. Przeciw kilku potworom w Road to Legend cel otrzymuje pełne rany, a pozostali połowę, zaokrągloną w górę, przed odjęciem tarcz.' },
        { term: 'Przebicie X', text: 'Ignoruje X tarcz.' },
      ],
    },
    {
      title: 'Testy cech',
      entries: [
        { text: 'Rzuć 1 szarą i 1 czarną kością i policz tarcze: jeśli jest ich tyle lub mniej niż wynosi cecha (Siła, Wiedza, Wola lub Spostrzegawczość), test jest zdany.' },
        { text: 'Potwory elitarne i słudzy zawsze oblewają test; porucznicy testują własnymi cechami.' },
        { text: 'Aplikacja nie rzuca kośćmi: tekst mówi, co się dzieje przy zdanym i przy oblanym teście.' },
      ],
    },
    {
      title: 'Rany, zmęczenie, pokonanie i morale',
      entries: [
        { term: 'Zdrowie', text: 'Gdy rany zrównają się ze Zdrowiem lub je przekroczą, figurka zostaje pokonana.' },
        { term: 'Zmęczenie', text: 'Zmęczenie, które otrzymujesz z własnego wyboru, nigdy nie przekracza twojej Wytrzymałości. Zmęczenie narzucone przez efekt, jeśli się nie mieści, otrzymujesz jako rany. Potwory zamiast zmęczenia otrzymują rany.' },
        { term: 'Pokonanie', text: 'Otrzymujesz zmęczenie do swojej Wytrzymałości, zastępujesz figurkę żetonem bohatera, odrzucasz swoje stany i, jeśli to była twoja tura, kończy się ona. Naciśnij „KO” na swoim portrecie.' },
        { term: 'Morale', text: 'Na początku równe liczbie bohaterów, spada o 1 z każdym KO. Jeśli wynosi 0 i padnie kolejny bohater, uciekacie i przegrywacie przygodę.' },
      ],
    },
    {
      title: 'Stany',
      entries: [
        { text: 'Nie można mieć dwóch kopii tego samego stanu. Testy stanów wykonuje się na początku tury. Gdy zostajesz pokonany, odrzucasz wszystkie.' },
        { term: 'Zatruty', text: 'Test Siły: jeśli go oblejesz, otrzymujesz 1 ranę i zachowujesz stan.' },
        { term: 'Chory', text: 'Test Woli: jeśli go oblejesz, otrzymujesz 1 zmęczenie i zachowujesz stan.' },
        { term: 'Unieruchomiony', text: 'Nie możesz wykonywać akcji Ruchu. Odrzucasz go na koniec swojej tury.' },
        { term: 'Ogłuszony', text: 'Jedyną akcją, jaką możesz wykonać, jest odrzucenie go; potem drugą akcję normalnie.' },
        { term: 'Płonący', text: 'Na koniec twojej tury ty i każda sąsiednia przyjazna figurka otrzymujecie 1 ranę. Usuwa się go akcją twoją lub kogoś sąsiedniego.' },
        { term: 'Przeklęty', text: 'Nie możesz używać akcji umiejętności. Usuwa się go, zdając test Wiedzy na początku tury.' },
        { term: 'Osłabiony', text: '1 tarcza mniej w obronie i 1 serce mniej w ataku. Usuwa się go Odpoczynkiem.' },
        { term: 'Krwawiący', text: 'Otrzymujesz 1 zmęczenie za każdą akcję inną niż odrzucenie go.' },
        { term: 'Skazany', text: 'Za każdym razem, gdy otrzymujesz rany, otrzymujesz 1 ranę więcej. Usuwa się go, wydając zryw.' },
        { term: 'Przerażony', text: 'Nie możesz wydawać zrywów. Usuwa się go na koniec twojej tury, jeśli nie widzisz żadnego wroga.' },
      ],
    },
    {
      title: 'Bohaterowie, ekwipunek i przeszukiwanie',
      entries: [
        { term: 'Wartości', text: 'Szybkość (ruch), Zdrowie, Wytrzymałość (maksymalne zmęczenie), Obrona oraz cechy Siła, Wiedza, Wola i Spostrzegawczość.' },
        { term: 'Bohaterski czyn', text: 'Raz na przygodę; gdy go użyjesz, odwróć kartę bohatera.' },
        { term: 'Ekwipunek', text: 'Dwie ręce (broń dwuręczna zajmuje obie), jedna zbroja i dwa inne przedmioty. Można go zmienić tylko na początku swojej tury.' },
        { term: 'Wyczerpanie', text: 'Użytą kartę obraca się bokiem i nie można jej znów użyć, dopóki nie odświeżysz jej na początku swojej tury.' },
        { term: 'Przeszukanie', text: 'Karty Poszukiwań odrzuca się po zakończeniu przygody. Złoto należy do całej drużyny.' },
      ],
    },
    {
      title: 'Cel, zwycięstwo i porażka',
      entries: [
        { text: 'Przygoda podaje cel i może go zmienić („Cel zaktualizowany”). Wygrywacie, wypełniając go.' },
        { text: 'Przegrywacie przez morale albo tak, jak mówi przygoda. Jeśli się ociągacie, na koniec niektórych rund uderzają coraz gorsze zagrożenia.' },
        { term: 'Po zakończeniu', text: 'Bohaterowie odzyskują wszystkie rany i zmęczenie, odwracają karty bohaterów awersem do góry oraz odrzucają stany i karty Poszukiwań. Złoto, doświadczenie, przedmioty i sława zostają.' },
      ],
    },
    {
      title: 'Gdy coś jest niejasne',
      entries: [
        { text: 'Karty mają pierwszeństwo przed zasadami ogólnymi, a zasady przygody przed wszystkim innym.' },
        { text: 'Jeśli efekt dopuszcza kilka możliwości, decyduje drużyna. Aplikacja nie sprawdza żadnej zasady: stosujecie je sami.' },
        { text: 'Aplikacja nie wie, gdzie są figurki, ile mają ran ani jakie mają stany: jeśli zapisujecie w połowie przygody, zanotujcie to. „Dziennik” przechowuje to, co powiedziała aplikacja.' },
      ],
    },
  ],
};
