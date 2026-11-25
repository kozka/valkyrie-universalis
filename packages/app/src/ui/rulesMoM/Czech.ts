// Mansions' help in Czech (RulesHelp.tsx), translated by Claude from the English one (October 2026): corrections by
// native speakers are welcome. The app's own words, not FFG's; the app's buttons as Valkyrie names them in Czech. Not in Valkyrie.
import type { RulesHelpText } from './types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    'Ve svém tahu provedeš až 2 akce, v libovolném pořadí, a jednu můžeš zopakovat (dvojí pohyb je až 4 políčka). Kdo bude hrát který tah, rozhoduje skupina.',
  actions: [
    {
      title: 'Akce',
      entries: [
        {
          term: 'Pohyb',
          text: 'Až o 2 políčka, po jednom. Pohyb můžeš rozdělit: posuneš se o 1, provedeš jinou akci a pak se posuneš o druhé. Nelze přejít přes zdi, přerušované hranice ani dveře s Překážkou nebo žetonem Průzkumu.',
        },
        { term: 'Průzkum', text: 'Klepni na žeton Průzkumu na svém políčku nebo na dveřích vedle tebe. Aplikace řekne, co umístit.' },
        { term: 'Hledání', text: 'Klepni na žeton Hledání na svém políčku.' },
        { term: 'Interakce', text: 'Klepni na žeton Interakce nebo Osoby na svém políčku a vyber možnost s ikonou akce.' },
        {
          term: 'Výměna',
          text: 'Dej, seber nebo odlož libovolný počet Předmětů a Kouzel s vyšetřovateli na svém políčku. Sebrání něčeho z podlahy také stojí tuto akci. Stopy se vyměňovat nedají.',
        },
        {
          term: 'Útok',
          text: 'Vyber monstrum v seznamu monster, klepni na „Zaútočit“ a na typ zbraně. Zblízka nebo beze zbraně na svém políčku; na dálku až 3 políčka. Zranění zapisuj pomocí + a −.',
        },
        { term: 'Komponenta', text: 'Použij efekt „Akce:“ na kartě nebo předmět z inventáře (batoh nebo „věci“, vlevo dole).' },
        {
          term: 'Překážka',
          text: 'Přesuň Překážku na svém políčku ke dveřím nebo Tajné chodbě, nebo ji od nich odsuň. Z druhé strany dveří: test Síly; se 2 úspěchy ji odstrčíš a projdeš.',
        },
        { term: 'Hašení ohně', text: 'Test Obratnosti: každý úspěch odhodí 1 Oheň na tvém políčku nebo na políčku, na které v tomto tahu vstoupíš.' },
      ],
    },
    {
      title: 'Vzácné akce (hlavně s kartou Šílenství)',
      entries: [
        {
          term: 'Strčení',
          text: 'Posuň monstrum nebo vyšetřovatele na svém políčku o 1 políčko. Test Síly proti Agresivitě monstra, nebo proti výsledku vyšetřovatele + 1, pokud se brání. Když uspěješ, můžeš ho následovat.',
        },
        { term: 'Krádež', text: 'Zvolte Sílu, Obratnost nebo Postřeh a oba si ji otestujte. Za každý úspěch, který máš navíc oproti druhému, si vezmeš 1 jeho majetek.' },
        {
          term: 'Zapálení',
          text: 'Se Zdrojem světla umísti Oheň na své políčko nebo na sousední. Pokud tam ještě žádný Oheň nebyl, klepni na „Nastavit“ (svitek dole) → „Zapálit“, aby ho aplikace šířila.',
        },
      ],
    },
    {
      title: 'Zdarma (bez akce)',
      entries: [
        { text: 'Žetony Pohledu (oko).' },
        { text: 'Možnosti v aplikaci bez ikony akce: klepnutí na žeton, abys ho přečetl, tě k ničemu nezavazuje.' },
        { text: 'Schopnosti, které neříkají „Akce:“.' },
      ],
    },
    {
      title: 'Nezapomeň',
      entries: [
        {
          term: 'Úhyb',
          text: 'Na políčku s monstrem, před jakoukoli akcí kromě Útoku a Pohybu, a když z něj chceš odejít: vyber monstrum s nejvyšší Ostražitostí (zelené číslo) a klepni na „Úhyb“. Když neuspěješ, akci obvykle propadneš.',
        },
        { term: 'Zraněný', text: 'Za kolo můžeš provést jen jednu akci Pohybu.' },
        { term: 'Oheň', text: 'Vstup na políčko s Ohněm nebo provedení či propadnutí akce na něm způsobí 1 Zranění lícem dolů.' },
        { term: 'Tma', text: 'Nemůžeš utrácet Stopy, ledaže je na tvém políčku nebo na sousedním Zdroj světla nebo Oheň.' },
      ],
    },
  ],
  rules: [
    {
      title: 'Než začnete',
      entries: [
        { text: 'Zamíchejte zvlášť balíčky Zranění a Hrůzy a nechte je lícem dolů.' },
        { text: 'Seřaďte podle názvu, lícem nahoru, Obyčejné předměty, Unikátní předměty, Kouzla a Stavy.' },
        { text: 'Roztřiďte žetony podle druhu. Aplikace řekne, které dílce, žetony a monstra umístit a kdy.' },
        { text: 'Startovní majetek si rozdělte, jak chcete; Stopy podle pokynů aplikace. Přečtěte si prolog: může obsahovat stopy k příběhu.' },
      ],
    },
    {
      title: 'Kolo',
      entries: [
        { term: 'Fáze vyšetřovatelů', text: 'Každý vyšetřovatel odehraje celý tah až o 2 akcích, v pořadí, které zvolí skupina. Až budou všichni hotovi, klepněte na tlačítko ➤ vpravo dole.' },
        { term: 'Fáze mýtů', text: 'V tomto pořadí:' },
        { term: '1. Oheň', text: 'Pokud je někde Oheň, přidejte celkem 1 žeton (ne jeden za každý oheň) na políčko sousedící s políčkem s Ohněm.' },
        { term: '2. Události', text: 'Aplikace ukáže jednu nebo více událostí mýtů; vyhodnoťte je podle textu.' },
        { term: '3. Monstra', text: 'Aplikace aktivuje každé monstrum, jedno po druhém.' },
        { term: '4. Hrůza', text: 'Každý vyšetřovatel provede kontrolu hrůzy proti monstru s nejvyšší Hrůzou v jeho dosahu, pokud nějaké je.' },
        { text: 'Klepněte na ➤ a začne nové kolo. Čas běží, i když ho nevidíte: kdy je pozdě, rozhoduje aplikace.' },
      ],
    },
    {
      title: 'Testy',
      entries: [
        { term: 'Kostky', text: 'Tolik, kolik je hodnota vlastnosti, s modifikátory (nejméně 1). Každá kostka má 3 strany s úspěchem, 2 strany s vyšetřováním (lupa) a 3 prázdné.' },
        { term: 'Výsledek', text: 'Počet úspěchů. „(Obratnost −1; 2)“ je test Obratnosti s o jednu kostku méně, který potřebuje 2 úspěchy.' },
        { term: 'Stopy', text: 'Po hodu každá Stopa, kterou utratíš, promění 1 lupu v úspěch. Nejde o přehoz.' },
        { term: 'Negace', text: 'Pokud text říká „negováno…“, každý úspěch zabrání 1 Zranění nebo 1 Hrůze.' },
        { term: 'Hod kostkami', text: 'Pokud text říká jen „hoď X kostkami“, nejde o test: Stopy utratit nelze.' },
        { text: 'Hází jen aktivní vyšetřovatel, pokud efekt neříká jinak.' },
      ],
    },
    {
      title: 'Zranění, Hrůza, Zraněný a Šílený',
      entries: [
        { term: 'Karty', text: 'Utrpět Zranění nebo Hrůzu znamená líznout kartu z jejího balíčku, lícem nahoru, pokud není řečeno „lícem dolů“. Karty lícem dolů nic nedělají: jen se počítají.' },
        { term: 'Lícem nahoru', text: '„Vyhodnoť okamžitě“ platí ve chvíli, kdy ji dostaneš; „Ponech lícem nahoru“ účinkuje, dokud tak zůstane. Pokud se mají otočit karty lícem dolů, vybírají se náhodně.' },
        { term: 'Zraněný', text: 'Když tvé celkové Zranění dosáhne tvého Zdraví: staneš se Zraněným a odhodíš svá Zranění lícem dolů. Za kolo se můžeš pohnout jen jednou.' },
        { term: 'Šílený', text: 'Totéž s Hrůzou a Příčetností. Tajně si přečti rub své karty Šílenství: může změnit, jak vyhraješ. Pokud žádá víc vyšetřovatelů, než vás je, vezmi si jinou.' },
        { term: 'Eliminovaný', text: 'Pokud už jako Zraněný nebo Šílený znovu dosáhneš limitu: odlož svůj majetek a odstraň svou figurku. Klepněte na „Nastavit“ (svitek dole) → „Vyšetřovatel eliminován“. Ostatní prohrají na konci příští Fáze vyšetřovatelů, pokud do té doby neskončí.' },
      ],
    },
    {
      title: 'Monstra',
      entries: [
        { term: 'Žeton', text: 'Ostražitost (zelená): kterému se uhýbá. Hrůza (modrá): proti kterému se dělá kontrola hrůzy. Agresivita (červená, na rubu): kostky proti Překážkám a obtížnost strčení. Jeho Zdraví si hlídá aplikace.' },
        { term: 'Aktivace', text: 'Udělejte, co řekne aplikace. „Směrem k“ znamená, že ho každý krok přiblíží; zastaví se, když dosáhne cíle. Pokud v dosahu žádný cíl není, nehýbe se: klepněte na tlačítko, že tu nejsou vyšetřovatelé, a aplikace dá jiný pokyn.' },
        { term: 'Dveře', text: 'Procházejí jimi volně, pokud nejsou zatarasené: pak hodí tolika kostkami, kolik je jejich Agresivita, a se 2 úspěchy Překážku rozbijí; jinak přijdou o pohyb (ale i tak zaútočí, pokud s někým sdílejí políčko).' },
        { term: 'Kontrola hrůzy', text: 'Jen v kroku hrůzy. Pokud ji proti stejnému monstru dělá více vyšetřovatelů, aplikace ji ukáže jednou a každý si hodí a vyhodnotí svou.' },
        { term: 'Oheň', text: 'Monstrum, které začne aktivaci v Ohni nebo do něj vstoupí, utrpí 1 Zranění.' },
      ],
    },
    {
      title: 'Mapa a dosah',
      entries: [
        { term: 'Políčka', text: 'Plné hranice (bílé nebo žluté): přecházejí se. Přerušované hranice: nepřecházejí se, ale dosah jimi prochází. Zdi: nic je nepřejde ani jimi neprochází. Dveře: přecházejí se, ale dosah jimi neprochází.' },
        { term: 'Dosah', text: 'Až 3 políčka, tvé vlastní se počítá jako 0. Může zahýbat za roh: neexistuje přímá viditelnost. Neprochází zdmi, dveřmi ani Tajnými chodbami.' },
        { term: 'Sousední', text: 'Efekty na sousední políčka (světlo, šíření Ohně) procházejí dveřmi, nikdy zdmi.' },
        { term: 'Tajná chodba', text: 'Všechna políčka s Tajnou chodbou spolu pro pohyb sousedí.' },
        { term: 'Sever', text: 'Vždy horní okraj obrazovky.' },
        { term: 'Uvnitř a venku', text: 'Venkovní místnosti mají stříbrný štítek s názvem a červenými chapadly. Některé události je rozlišují.' },
      ],
    },
    {
      title: 'Oheň, Tma a Překážky',
      entries: [
        { term: 'Oheň', text: 'Na jednom políčku nikdy nemohou být 2. Šíří se dveřmi, ne zdmi; Překážky ho nezastaví. Oheň, který uhasíš svou akcí, tě už nezraňuje.' },
        { term: 'Tma', text: 'Na jejím políčku se neutrácejí Stopy, ani na testy, ani na hádanky. Zdroj světla nebo Oheň na tvém políčku nebo na sousedním ji ruší.' },
        { term: 'Překážka', text: 'Zatarasenými dveřmi ani Chodbou neprojdou vyšetřovatelé ani monstra. Nebrání to objevení monster.' },
      ],
    },
    {
      title: 'Předměty, Kouzla a Stavy',
      entries: [
        { term: 'Majetek', text: 'Obyčejné předměty, Unikátní předměty a Kouzla. Stopy, Stavy, Zranění a Hrůza majetkem nejsou.' },
        { term: 'Předměty', text: 'Jejich rub si můžeš prohlédnout, kdykoli chceš. Když se předmět otočí, jeho rub nahradí líc.' },
        { term: 'Kouzla', text: 'Dostaneš náhodnou kopii a nikdy se nedíváš na její rub. Při seslání ji otočíš, vyhodnotíš rub a téměř vždy ji odhodíš a získáš jinou kopii.' },
        { term: 'Stavy', text: 'Lícem nahoru a nikdy dvě kopie. Omráčený: v tahu jen 1 akce. Zmatený: neutrácíš Stopy. Spoutaný: nemůžeš se pohybovat sám. Soustředěný: odhoď ho a všechny tvé lupy budou úspěchy.' },
        { term: 'Zbraně', text: 'Abys mohl útočit nějakým typem zbraně, musíš jednu takovou nést. Beze zbraně útočit můžeš vždy.' },
      ],
    },
    {
      title: 'Hádanky',
      entries: [
        { term: 'Kroky', text: 'Tolik, kolik je tištěná hodnota vlastnosti, kterou aplikace požaduje, plus 1 za každou utracenou Stopu (ne ve Tmě). Aplikace je nepočítá: počítejte si je sami.' },
        { term: 'Zavřít', text: 'Když vám dojdou kroky, klepněte na „Zavřít“: postup se uloží a někdo může později pokračovat jinou akcí. Můžete si radit.' },
        { term: 'Posuvná', text: 'Složte obrázek tak, že za krok prohodíte dva sousední dílky.' },
        { term: 'Zámek', text: 'Posouvejte bloky, jeden za krok, dokud cílový dílek neodjede vpravo ven.' },
        { term: 'Kód', text: 'Za krok hádejte jeden kód. Úspěch za každý symbol na správném místě; lupa za každý správný symbol na špatném místě.' },
        { term: 'Věž', text: 'Přesouvejte horní dílek jednoho sloupce na jiný, dokud nebudou všechny na sobě, od největšího po nejmenší.' },
      ],
    },
    {
      title: 'Rozšíření',
      entries: [
        { term: 'Klíč', text: 'Předmět se žetonem Klíče získá vlastnosti Klíč a Důkaz a nelze ho odhodit, ale lze ho vyměnit nebo ukrást.' },
        { term: 'Pohyblivé a překrývající se dílce', text: 'Pohybují se se vším, co je na nich. Jeden přes druhý nikdy nezakryje celé políčko; co je zakryté, přestává být součástí hrací plochy.' },
        { term: 'Elixíry', text: 'Získávají se náhodně; nedívej se na rub, dokud je nějaký efekt neotočí. Lícem nahoru jsou majetek; lícem dolů ne.' },
        { term: 'Vylepšení', text: '+1 k tištěné hodnotě vlastnosti, jednou za každou vlastnost. Nejsou majetkem.' },
        { term: 'Poutání', text: 'Monstru na jeho políčku se není třeba uhýbat. Když se to monstrum aktivuje, můžete ho odhodit, aby se nepohnulo.' },
        { term: 'Sutiny', text: 'Žádné Hledání, Průzkum ani Interakce. Test Síly: 1 žeton za úspěch; Těžká zbraň je odstraní všechny.' },
        { term: 'Houští', text: 'Abys odešel, test Postřehu s obtížností rovnou počtu žetonů; když neuspěješ, odlož náhodný předmět. Sečná zbraň je odstraní; Oheň také.' },
        { term: 'Voda', text: 'Vstup do ní ukončí tvůj pohyb (kromě vodních, létajících a nehmotných monster). Uhasí Oheň.' },
        { term: 'Trhlina', text: 'Provedení jiné akce než pohybu na jejím políčku tě učiní Ztraceným v čase a prostoru. K jejich uzavření test Vědění: 1 za úspěch.' },
      ],
    },
    {
      title: 'Když něco není jasné',
      entries: [
        { text: 'Pokud by efekt mohl zasáhnout více vyšetřovatelů, nebo nastane více efektů najednou, rozhodne skupina. Pokud se neshodnete, rozhodne náhodný vyšetřovatel.' },
        { text: 'Efekty na eliminovaného vyšetřovatele se uplatní, nakolik je to možné.' },
        { text: 'Deník (kniha nebo „Deník“, dole) uchovává vše, co aplikace řekla, po kolech.' },
      ],
    },
  ],
};
