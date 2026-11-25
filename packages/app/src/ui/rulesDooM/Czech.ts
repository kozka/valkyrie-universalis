// DooM's help in Czech (RulesHelp.tsx), translated by Claude from the English one (October 2026): corrections by
// native speakers are welcome. The app's own words, not FFG's; the app's buttons as Valkyrie names them in Czech. Not in Valkyrie.
import type { RulesHelpText } from '../rulesMoM/types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    'Při své aktivaci: pokud jsi byl zabit (frag), znovu se objevíš na aktivním teleportu podle své volby a připravíš svou kartu třídy. Provedeš 1 hlavní akci a libovolný počet bonusových akcí, v libovolném pořadí. Až skončíš, odhoď zahrané karty, dober si do 3 a klepni na „Konec kola“ na svém portrétu: aplikace aktivuje skupinu démonů.',
  actions: [
    {
      title: 'Akce',
      entries: [
        {
          term: 'Zahrání karty',
          text: 'Dá ti tolik bodů pohybu, kolik je její rychlost, a pokud má pole útoku, i ten útok. Každou kartu vyhodnoť celou, než zahraješ další. Reakční karty se hrají mimo tvou aktivaci.',
        },
        { term: 'Sprint', text: 'Jako hlavní akci odhoď 1 kartu z ruky a získej 6 bodů pohybu.' },
        {
          term: 'Pohyb',
          text: 'Každé pole stojí 1 bod, i úhlopříčně. Obtížný terén stojí o 1 víc a vstup na pole s nepřítelem ještě o 1 víc. Můžeš procházet přes mariňáky, ale nesmíš skončit na obsazeném poli. Body utrácej, kdy chceš, kromě doby uprostřed útoku; co zbude, propadá.',
        },
        {
          term: 'Otevření dveří',
          text: 'Když s nimi sousedíš, za 1 bod pohybu: klepni na ně v aplikaci. Už se nikdy nezavřou. Barevné dveře vyžadují svou přístupovou kartu. V těchto misích démoni dveře neotevírají.',
        },
        {
          term: 'Sebrání',
          text: 'Projdi polem se zbraní, lékárničkou nebo přístupovou kartou a klepni na její žeton. Zbraň přidá své karty do tvého balíčku, navrch; lékárnička vyléčí 5 zranění.',
        },
        {
          term: 'Poprava (Glory Kill)',
          text: 'Vstup na pole vrávorajícího démona (2 body): zemře, dobereš si kartu popravy a vyléčíš si 2 zranění. Potom se můžeš dál pohybovat.',
        },
        {
          term: 'Teleporty',
          text: 'Vstupem na neaktivní ho aktivuješ. Všechny aktivní jsou propojené: přesun z jednoho na druhý stojí 1 bod. Pokud přijdeš z jiného, nebo se znovu objevíš, na teleport, na kterém stojí démon, démon zemře (telefrag).',
        },
      ],
    },
    {
      title: 'Nezapomeň',
      entries: [
        { term: 'Munice', text: 'Žádná není: tvá ruka je tvůj zásobník. Ze zbraně můžeš střílet, jen když držíš některou z jejích karet.' },
        { term: 'Portály', text: 'Když mariňák uvidí portál (přímá viditelnost), klepněte na jeho žeton: aplikace řekne, kteří démoni vyjdou a kde.' },
        { term: 'Omráčený', text: 'Při útoku odeber 1 kostku, neodhaluješ obranu a nemáš kryt. Zmizí po útoku nebo po tom, co jsi napaden.' },
      ],
    },
    {
      title: 'V aplikaci',
      entries: [
        { term: 'Konec kola', text: 'Na portrétu každého mariňáka, na konci jeho aktivace.' },
        { term: 'KO', text: 'Na portrétu mariňáka, který zemře: je to frag pro útočníka. Až se znovu objeví, druhé tlačítko portrétu („Obnovit“).' },
        { term: 'Poražen', text: 'Na portrétu skupiny, když zemře poslední démon toho typu. „Unikátní poražen(a)“ pro bosse.' },
        { term: 'Informace', text: 'Na portrétu skupiny: její upřesnění. „Vynutit aktivaci“, pro hru s fyzickým balíčkem iniciativy.' },
        { term: 'Pravidla mise', text: 'Žetony mimo mapu po klepnutí ukážou herní režim, cíl a pravidla mise.' },
      ],
    },
  ],
  rules: [
    {
      title: 'Kolo',
      entries: [
        { term: 'Na začátku', text: 'Aplikace vás požádá, abyste rozdělili energii Argent mezi typy démonů ve hře (obvykle 3, co nejrovnoměrněji), a pokud s ním hrajete, vylosuje z balíčku hrozeb efekt pro toto kolo.' },
        { term: 'Režim Valkyrie', text: 'Mariňák odehraje svou aktivaci a klepne na „Konec kola“; aplikace pak aktivuje náhodnou skupinu démonů z těch, které ještě nejednaly. Tak to pokračuje, dokud nejednají všichni.' },
        { term: 'Normální režim', text: 'S fyzickým balíčkem iniciativy: když přijde karta útočníka, náhodně zvolte skupinu, která ještě nejednala, a klepněte na její „Vynutit aktivaci“; když balíček dojde, každý mariňák klepne na „Konec kola“.' },
        { term: 'Balíček hrozeb', text: 'Jsou to jednokolové efekty těchto misí (víc kostek, víc zbroje…), ne karty Hrozeb ze hry.' },
      ],
    },
    {
      title: 'Démoni',
      entries: [
        { term: 'Aktivace', text: 'Aplikace řekne, jak daleko se každý démon pohne, na koho zaútočí a jakou schopnost použije. Aktivují se jeden po druhém, každý s jedním útokem, pokud schopnost neříká jinak.' },
        { term: 'Skupiny', text: 'Démoni stejného typu tvoří skupinu a jednají společně.' },
        { term: 'Argent', text: 'Pokládá se na kartu každého démona a utrácí se za jeho schopnosti, za každou figurku. Když zemře poslední démon nějakého typu, jeho Argent se vrátí do zásoby.' },
        { term: 'Obrana', text: 'Při obraně démon odhalí vrchní kartu balíčku událostí. Počítá se jen její obrana: její text se ignoruje.' },
        { term: 'Létající', text: 'Ignorují obtížný terén a cenu polí s nepřáteli a přecházejí neprůchodný terén.' },
        { term: 'Velcí', text: 'V aplikaci zabírají jedno pole: postavte figurku tam, kam se vejde.' },
      ],
    },
    {
      title: 'Útoky',
      entries: [
        { term: 'Dostřel', text: 'Pole až k obránci, včetně pole obránce. Maximum udává pole útoku.' },
        { term: 'Přímá viditelnost', text: 'Přímka z rohu tvého pole do rohu pole obránce. Přerušují ji zdi, zavřené dveře a blokující terén; figurky ne.' },
        { term: 'Hod', text: 'Hoď kostkami z pole útoku. Červená kostka má strany s 0, 1, 1, 1, 2 a 2 zraněními; černá s 1, 1, 2, 2, 2 a 3.' },
        { term: 'Obrana', text: 'Mariňák odhalí vrchní kartu svého akčního balíčku; démon kartu balíčku událostí. Každý štít ruší 1 zranění a úhyb ruší všechna. Ikona zvláštní obrany spustí obranu démona a odolnost mu dá o 1 štít víc.' },
        { term: 'Kryt', text: 'Pokud kterákoli přímka z tvého rohu k rohům obránce protne zeď, obtížný nebo blokující terén nebo jinou figurku, obránce může odhodit obranu, kterou odhalil, a odhalit jinou.' },
      ],
    },
    {
      title: 'Vrávorání a popravy',
      entries: [
        { text: 'Když zranění démona dosáhne jeho hodnoty vrávorání, začne vrávorat a lze ho popravit.' },
        { text: 'Efekty, které snižují tištěnou hodnotu vrávorání (jako motorová pila), se nesčítají: platí ten nejvyšší.' },
        { text: 'Popravit lze jen démony. Mariňáci se léčí popravami, lékárničkami a některými třídami.' },
      ],
    },
    {
      title: 'Smrt, fragy a znovuobjevení',
      entries: [
        { term: 'Smrt', text: 'Mariňák zemře, když jeho zranění dosáhne jeho zdraví (10): klepněte na „KO“. Odeber figurku, odhoď její zranění, zamíchej ruku a odhazovací balíček do balíčku a dober si 3. Mariňák si ponechá své zbraně a karty popravy.' },
        { term: 'Znovuobjevení', text: 'Na začátku své příští aktivace postaví figurku na aktivní teleport podle své volby; klepněte na druhé tlačítko jeho portrétu („Obnovit“).' },
        { term: 'Fragy', text: 'Každá smrt je frag pro útočníka. Mise říká, kolik jich potřebuje k vítězství (obvykle 6); až jich dosáhne, aplikace vyhlásí vaši porážku.' },
      ],
    },
    {
      title: 'Portály',
      entries: [
        { text: 'Jsou modré, žluté a červené, od nejméně po nejvíce nebezpečné.' },
        { text: 'Když ho některý mariňák uvidí, klepněte na jeho žeton: aplikace vybere jednu ze skupin té barvy, řekne, kam ji umístit (na portál nebo vedle něj), a někdy dá Argent. Žeton se odstraní.' },
        { text: 'Pokud není místo, figurky jdou na nejbližší prázdné pole.' },
      ],
    },
    {
      title: 'Mapa a terén',
      entries: [
        { term: 'Zdi', text: 'Nelze je přejít a přerušují přímou viditelnost. Zavřené dveře jsou zeď.' },
        { term: 'Obtížný terén', text: 'Modrý tečkovaný okraj: stojí o 1 bod víc a poskytuje kryt.' },
        { term: 'Blokující terén', text: 'Červený plný okraj: nelze na něj vstoupit, přerušuje přímou viditelnost a poskytuje kryt.' },
        { term: 'Neprůchodný terén', text: 'Červený tečkovaný okraj: nelze na něj vstoupit, ale nepřerušuje přímou viditelnost.' },
        { term: 'Úhlopříčky', text: 'Pohybovat se můžeš úhlopříčně, ale ne mezi dvěma poli, která se dotýkají jen rohem, ledaže s oběma sousedí jiné pole u toho rohu.' },
      ],
    },
    {
      title: 'Mariňáci a jednotky',
      entries: [
        { term: 'Startovní balíček', text: 'Téměř v každé misi UAC 1 až 4 a Bojová brokovnice 1 až 3; doberte si 3.' },
        { term: 'Třída', text: 'Dává schopnost, která se obvykle vyčerpává, a připraví se na začátku tvé aktivace.' },
        { term: 'Jednotky', text: 'S méně než 4 mariňáky: se 3 si jeden vezme „Taking Point“; se 2 oba „Combat Veteran“; s 1 „Solo Operative“, který dává dvě aktivace za kolo: mezi nimi klepněte na „Vynutit aktivaci“ u skupiny, která ještě nejednala.' },
      ],
    },
    {
      title: 'Když něco není jasné',
      entries: [
        { text: 'Pravidla mise mají přednost: klepněte na její žetony pravidel mimo mapu.' },
        { text: 'Aplikace nesleduje zranění, vrávorání ani Argent jednotlivých démonů, ani karty mariňáků: sledujete je fyzickými žetony a kartami.' },
        { text: '„Deník“ uchovává vše, co aplikace řekla, kolo po kole.' },
      ],
    },
  ],
};
