// Descent's help in Czech (RulesHelp.tsx), translated by Claude from the English one (October 2026): corrections by
// native speakers are welcome. The app's own words, not FFG's; the app's buttons as Valkyrie names them in Czech. Not in Valkyrie.
import type { RulesHelpText } from '../rulesMoM/types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    'Na začátku tvého tahu skončí efekty „do tvého příštího tahu“, vyhodnotíš efekty „na začátku tvého tahu“, obnovíš své vyčerpané karty a můžeš změnit vybavení. Pak provedeš až 2 akce, v libovolném pořadí; stejnou můžeš zopakovat nebo je vynechat. Až skončíš, klepni na „Konec kola“ na svém portrétu: aplikace aktivuje skupinu monster.',
  actions: [
    {
      title: 'Akce',
      entries: [
        {
          term: 'Pohyb',
          text: 'Získáš tolik bodů pohybu, kolik je tvá Rychlost; každé pole stojí 1, i úhlopříčně. Pohyb můžeš rozdělit a mezitím provést jinou akci. Můžeš procházet přes hrdiny, ne přes monstra, a nesmíš skončit na obsazeném poli.',
        },
        { term: 'Útok', text: 'Vybavenou zbraní, nebo beze zbraně (jen modrá kostka, na blízko). Viz „Útoky“ v přehledu pravidel.' },
        { term: 'Použití dovednosti', text: 'Karta povolání s ikonou akce, za zaplacení její únavy.' },
        { term: 'Odpočinek', text: 'Na konci svého tahu se zbavíš veškeré únavy, i když to byla tvá první akce.' },
        { term: 'Hledání', text: 'Žeton hledání na tvém poli nebo na sousedním: klepni na něj v aplikaci a ona ti řekne, co najdeš.' },
        {
          term: 'Otevření dveří',
          text: 'Sousední dveře: klepni na ně v aplikaci, přečti si text a potvrď. Obvykle odhalí nové dílce, žetony a monstra. V Road to Legend se dveře už nikdy nezavírají.',
        },
        {
          term: 'Oživení hrdiny',
          text: 'Vyřazený hrdina, jehož žeton sousedí s tebou: hoď 2 červenými kostkami, za každé srdce si vyléčí 1 zranění a za každý výboj 1 únavu, a vrátí se na mapu. Ve svém příštím tahu hraje normálně.',
        },
        { term: 'Zvláštní akce', text: 'Cokoli, co karty, předměty nebo výprava dovolují s ikonou akce: sebrat cíl, promluvit s vesničanem, zatáhnout za páku…' },
      ],
    },
    {
      title: 'Pokud jsi vyřazen',
      entries: [
        {
          term: 'Vstát',
          text: 'Je to jediné, co v tom tahu můžeš udělat: hoď 2 červenými kostkami, za každé srdce si vyléčíš 1 zranění a za každý výboj 1 únavu, a postav svou figurku tam, kde byl tvůj žeton. Pak tvůj tah končí. I tak klepni na „Konec kola“.',
        },
      ],
    },
    {
      title: 'Bez utracení akce',
      entries: [
        { text: 'Prohlédnout si v aplikaci jakýkoli žeton nebo dveře, i když u nich nestojíš, než se rozhodneš.' },
        { text: 'Utrpět 1 únavu za každý bod pohybu navíc, aniž překročíš svou Výdrž.' },
        { text: 'Vyměnit si předměty se sousedním hrdinou po akci Pohybu. Karty povolání se vyměňovat nedají.' },
        { text: 'Utratit výboj, který ti v útoku zbyl, a zbavit se 1 únavy.' },
        { text: 'S právě 2 hrdiny může každý provést za tah jeden normální útok zdarma; pokud ho neprovede, vyléčí si na konci svého tahu 2 zranění.' },
      ],
    },
    {
      title: 'V aplikaci',
      entries: [
        { term: 'Konec kola', text: 'Na portrétu každého hrdiny, když jeho tah skončí, i když je vyřazený. Dokud se na něj neklepne, kolo nepokračuje.' },
        { term: 'KO', text: 'Na portrétu hrdiny, který je vyřazen: klesne morálka. Až se vrátí na mapu, druhé tlačítko portrétu („Obnovit“).' },
        { term: 'Poražen', text: 'Na portrétu skupiny monster, když padne poslední z nich. „Unikátní poražen(a)“, pokud padne unikátní monstrum.' },
        { term: 'Informace', text: 'Na portrétu skupiny: její upřesnění a pořadí, v jakém utrácí výboje. „Vynutit aktivaci“, pokud to výprava žádá.' },
        { term: 'Talent a Věci', text: 'Tlačítka dole: dovednosti a zkušenosti každého hrdiny a předměty a zlato družiny.' },
      ],
    },
  ],
  rules: [
    {
      title: 'Kolo',
      entries: [
        { text: 'Družina zvolí hrdinu, který ještě nehrál; ten odehraje svůj tah a klepne na „Konec kola“. Aplikace pak aktivuje náhodnou skupinu monster z těch, které ještě nebyly aktivovány. Takto se to opakuje, hrdina a skupina.' },
        { text: 'Pokud jedné straně dojdou tahy, druhá odehraje zbývající tahy za sebou.' },
        { term: 'Konec kola', text: 'Až všichni odehrají, vyhodnotí se efekty konce kola, které výprava uvádí (posily, nebezpečí…), a začne nové kolo. Aplikace na začátku každého kola uloží hru.' },
        { text: 'Schopnosti hrdinů „jednou za tah“ se během aktivací monster nepoužívají.' },
      ],
    },
    {
      title: 'Aktivace monster',
      entries: [
        { term: 'Okno', text: 'Zvláštní efekt pro tuto aktivaci a seznam akcí pro vůdce („Lord“, červené figurky) a poskoky („Běžná“, béžové figurky), v pořadí, které ukazuje.' },
        { term: 'Každé monstrum', text: 'Prochází seznam shora dolů a provede první akci, kterou může, dokud neprovede 2; pokud dojde na konec, začne znovu odshora. Jen 1 útok za aktivaci, kromě schopností jako Zpustošení (Ravage).' },
        { term: 'Přeskočí se', text: 'Co nemůže udělat nebo by nemělo žádný účinek: pohyb tam, kde už je, útok bez platného cíle nebo bez přímé viditelnosti, druhý útok.' },
        { term: 'Zahlédnout', text: 'Pohybovat se, dokud není nejvýše 3 pole od cíle a s přímou viditelností.' },
        { term: 'Střetnout se', text: 'Pohybovat se, dokud nesousedí s cílem. S Dosahem (Reach) se zastaví nejvýše 2 pole od něj s přímou viditelností.' },
        { term: 'Ustoupit', text: 'Utratit zbývající pohyb vzdalováním se od nejbližšího nepřítele.' },
        { term: 'Shoda', text: 'Mezi cíli ten nejbližší; pokud je shoda i pak, rozhodnete vy.' },
        { text: 'Až skončí všechna monstra jednoho typu, klepněte na „Lord Aktivován“ nebo „Běžná Aktivován“.' },
      ],
    },
    {
      title: 'Pohyb a terén',
      entries: [
        { term: 'Úhlopříčky', text: 'Pohybovat se můžeš úhlopříčně, ale ne přes roh zdi.' },
        { term: 'Voda', text: 'Vstup stojí 2 body pohybu.' },
        { term: 'Jáma', text: 'Když vstoupíš, utrpíš 2 zranění. Uvnitř nemůžeš utrácet body pohybu: vylezeš akcí na sousední prázdné pole.' },
        { term: 'Láva', text: 'Když vstoupíš, utrpíš 1 zranění, a figurka, která v ní skončí svůj tah, je poražena.' },
        { term: 'Překážka', text: 'Blokuje pohyb i přímou viditelnost.' },
        { term: 'Monstra', text: 'Nemohou utrpět únavu, aby se pohnula dál. Vyhýbají se jámám a lávě a vodu použijí, jen když je to pro ně levnější.' },
        { term: 'Velká monstra', text: 'Počítají svůj pohyb z jednoho ze svých polí, jako by byla malá, a nakonec se umístí tak, aby jedno z jejich polí bylo to konečné.' },
      ],
    },
    {
      title: 'Přímá viditelnost, pole a sousedství',
      entries: [
        { term: 'Přímá viditelnost', text: 'Přímka z rohu tvého pole do rohu pole cíle. Blokují ji figurky, překážky, zdi a dveře; pouhý dotyk rohu ji neblokuje. Sousední pole na sebe vidí vždy.' },
        { term: 'Počítání polí', text: 'Nejkratší cesta, bez výchozího pole. Na figurkách a terénu, který není překážkou, nezáleží; nepočítá se skrz zdi ani zavřené dveře.' },
        { term: 'Sousední', text: 'Pole, která sdílejí stranu nebo roh, pokud je neodděluje zeď nebo dveře.' },
      ],
    },
    {
      title: 'Útoky',
      entries: [
        { term: 'Hod', text: 'Útočník hodí modrou kostkou a svými kostkami síly, obránce svými obrannými kostkami, vše najednou. X na modré kostce je minutí.' },
        { term: 'Na dálku', text: 'Součet dosahu na kostkách musí dosáhnout počtu polí k cíli; proti sousednímu potřebuješ alespoň 1.' },
        { term: 'Výboje', text: 'Každý výboj se utratí za jinou výbojovou schopnost, každou jednou za útok.' },
        { term: 'Zranění', text: 'Padlá srdce minus štíty obránce. Způsobit 0 není minutí. Stav z výboje se uplatní, jen pokud útok způsobí alespoň 1 zranění.' },
        { term: 'Výbuch', text: 'Zasáhne také každé pole sousedící s cílem. Proti více monstrům v Road to Legend utrpí cíl plné zranění a ostatní polovinu, zaokrouhleno nahoru, před odečtením štítů.' },
        { term: 'Průraz X', text: 'Ignoruje X štítů.' },
      ],
    },
    {
      title: 'Testy vlastností',
      entries: [
        { text: 'Hoď 1 šedou a 1 černou kostkou a spočítej štíty: pokud je jich stejně nebo méně, než je vlastnost (Síla, Vědění, Vůle nebo Postřeh), v testu uspěješ.' },
        { text: 'Vůdci a poskoci v testech vždy selžou; poručíci testují se svými vlastními vlastnostmi.' },
        { text: 'Aplikace kostkami nehází: text říká, co se stane, když uspěješ a když selžeš.' },
      ],
    },
    {
      title: 'Zranění, únava, vyřazení a morálka',
      entries: [
        { term: 'Zdraví', text: 'Když zranění dosáhne Zdraví nebo ho překročí, figurka je poražena.' },
        { term: 'Únava', text: 'Únava, kterou utrpíš dobrovolně, nikdy nepřekročí tvou Výdrž. Únavu, kterou ti vnutí efekt, utrpíš jako zranění, pokud se nevejde. Monstra místo únavy utrpí zranění.' },
        { term: 'Vyřazení', text: 'Utrpíš únavu až do své Výdrže, nahradíš figurku žetonem hrdiny, odhodíš své stavy a, pokud byl tvůj tah, skončí. Klepněte na „KO“ na tvém portrétu.' },
        { term: 'Morálka', text: 'Začíná na počtu hrdinů a s každým KO klesne o 1. Pokud je na 0 a padne další hrdina, uprchnete a výpravu prohrajete.' },
      ],
    },
    {
      title: 'Stavy',
      entries: [
        { text: 'Nemůžeš mít dvě kopie stejného stavu. Testy stavů se provádějí na začátku tahu. Když jsi vyřazen, odhodíš všechny.' },
        { term: 'Otrávený', text: 'Test Síly: když selžeš, utrpíš 1 zranění a stav si ponecháš.' },
        { term: 'Nemocný', text: 'Test Vůle: když selžeš, utrpíš 1 únavu a stav si ponecháš.' },
        { term: 'Znehybněný', text: 'Nemůžeš provádět akce Pohybu. Odhodí se na konci tvého tahu.' },
        { term: 'Omráčený', text: 'Jediná akce, kterou můžeš provést, je odhodit ho; potom provedeš druhou akci normálně.' },
        { term: 'Hořící', text: 'Na konci tvého tahu utrpíš ty a každá sousední spřátelená figurka 1 zranění. Odstraní se akcí tvou nebo někoho sousedního.' },
        { term: 'Prokletý', text: 'Nemůžeš používat akce dovedností. Odstraní se úspěšným testem Vědění na začátku tahu.' },
        { term: 'Oslabený', text: 'O 1 štít méně při obraně a o 1 srdce méně při útoku. Odstraní se Odpočinkem.' },
        { term: 'Krvácející', text: 'Utrpíš 1 únavu za každou akci, která není jeho odhozením.' },
        { term: 'Zatracený', text: 'Pokaždé, když utrpíš zranění, utrpíš o 1 zranění víc. Odstraní se utracením výboje.' },
        { term: 'Vyděšený', text: 'Nemůžeš utrácet výboje. Odstraní se na konci tvého tahu, pokud nevidíš žádného nepřítele.' },
      ],
    },
    {
      title: 'Hrdinové, vybavení a hledání',
      entries: [
        { term: 'Hodnoty', text: 'Rychlost (pohyb), Zdraví, Výdrž (maximální únava), Obrana a vlastnosti Síla, Vědění, Vůle a Postřeh.' },
        { term: 'Hrdinský čin', text: 'Jednou za výpravu; když ho použiješ, otoč kartu hrdiny.' },
        { term: 'Vybavení', text: 'Dvě ruce (obouruční zbraň zabere obě), jedna zbroj a dva další předměty. Měnit se dá jen na začátku tvého tahu.' },
        { term: 'Vyčerpání', text: 'Použitá karta se otočí bokem a nelze ji znovu použít, dokud ji na začátku svého tahu neobnovíš.' },
        { term: 'Hledání', text: 'Karty hledání se na konci výpravy odhodí. Zlato patří celé družině.' },
      ],
    },
    {
      title: 'Cíl, vítězství a porážka',
      entries: [
        { text: 'Výprava určuje cíl a může ho změnit („Cíl aktualizován“). Vyhrajete, když ho splníte.' },
        { text: 'Prohrajete kvůli morálce nebo podle pravidel výpravy. Když budete otálet, na konci některých kol udeří stále horší nebezpečí.' },
        { term: 'Po skončení', text: 'Hrdinové se zbaví veškerého zranění a únavy, otočí kartu hrdiny lícem nahoru a odhodí stavy a karty hledání. Zlato, zkušenosti, předměty a sláva zůstávají.' },
      ],
    },
    {
      title: 'Když něco není jasné',
      entries: [
        { text: 'Karty mají přednost před obecnými pravidly a pravidla výpravy přede vším ostatním.' },
        { text: 'Pokud efekt dovoluje více možností, rozhodne družina. Aplikace žádné pravidlo nekontroluje: uplatňujete je vy.' },
        { text: 'Aplikace neví, kde jsou figurky, jejich zranění ani stavy: pokud ukládáte uprostřed výpravy, zapište si je. „Deník“ uchovává vše, co aplikace řekla.' },
      ],
    },
  ],
};
