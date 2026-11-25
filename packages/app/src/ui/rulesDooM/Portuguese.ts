// DooM's help in Portuguese (RulesHelp.tsx), translated by Claude from the English one (October 2026): corrections by
// native speakers are welcome. The app's own words, not FFG's; the app's buttons as Valkyrie names them in Portuguese. Not in Valkyrie.
import type { RulesHelpText } from '../rulesMoM/types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    'Na sua ativação: se você foi abatido (frag), você reaparece no teletransportador ativo que escolher, e prepara a sua carta de classe. Você realiza 1 ação principal e quantas ações bônus quiser, em qualquer ordem. Ao terminar, descarte as cartas que jogou, compre até ter 3 e toque em «Fim do Turno» no seu retrato: o app ativa um grupo de demônios.',
  actions: [
    {
      title: 'Ações',
      entries: [
        {
          term: 'Jogar uma carta',
          text: 'Ela dá tantos pontos de movimento quanto a sua velocidade e, se tiver um quadro de ataque, esse ataque. Resolva cada carta por completo antes de jogar outra. As cartas de reação são jogadas fora da sua ativação.',
        },
        { term: 'Correr', text: 'Como ação principal, descarte 1 carta da mão e ganhe 6 pontos de movimento.' },
        {
          term: 'Mover',
          text: 'Cada espaço custa 1 ponto, na diagonal também. Terreno difícil custa 1 a mais, e entrar em um espaço com um inimigo, mais 1. Você pode atravessar fuzileiros, mas não pode terminar em um espaço ocupado. Gaste os seus pontos quando quiser, exceto no meio de um ataque; os que sobrarem são perdidos.',
        },
        {
          term: 'Abrir uma porta',
          text: 'Adjacente a ela, por 1 ponto de movimento: toque nela no app. Ela nunca volta a fechar. Portas coloridas precisam do seu cartão de acesso. Nestas missões os demônios não abrem portas.',
        },
        {
          term: 'Pegar',
          text: 'Passe pelo espaço de uma arma, de um kit médico ou de um cartão de acesso e toque no seu marcador. Uma arma acrescenta as suas cartas ao seu baralho, por cima; um kit médico recupera 5 de dano.',
        },
        {
          term: 'Glory Kill',
          text: 'Entre no espaço de um demônio cambaleante (2 pontos): ele morre, você compra uma carta de Glory Kill e recupera 2 de dano. Depois você pode continuar se movendo.',
        },
        {
          term: 'Teletransportadores',
          text: 'Entrar em um inativo o ativa. Todos os ativos estão ligados: ir de um para outro custa 1 ponto. Se você chegar de outro, ou reaparecer, em um que tenha um demônio em cima, o demônio morre (telefrag).',
        },
      ],
    },
    {
      title: 'Lembre-se',
      entries: [
        { term: 'Munição', text: 'Não existe: a sua mão é o seu pente. Você só pode disparar uma arma se tiver uma das cartas dela.' },
        { term: 'Portais', text: 'Quando um fuzileiro vê um portal (linha de visão), toquem no seu marcador: o app diz quais demônios saem e onde.' },
        { term: 'Atordoado', text: 'Remova 1 dado ao atacar, não revele defesa e não receba cobertura. Some depois de atacar ou de ser atacado.' },
      ],
    },
    {
      title: 'No app',
      entries: [
        { term: 'Fim do Turno', text: 'No retrato de cada fuzileiro, ao final da sua ativação.' },
        { term: 'KO', text: 'No retrato do fuzileiro que morre: é um frag para o invasor. Quando ele reaparece, o outro botão do retrato (Recuperar).' },
        { term: 'Derrotado', text: 'No retrato do grupo quando morre o último demônio desse tipo. «Derrota Única» para um chefe.' },
        { term: 'Informação', text: 'No retrato de um grupo: os seus esclarecimentos. «Ativação Forçada», para jogar com o baralho de iniciativa físico.' },
        { term: 'Regras da missão', text: 'Os marcadores fora do mapa mostram o modo de jogo, o objetivo e as regras da missão quando tocados.' },
      ],
    },
  ],
  rules: [
    {
      title: 'A rodada',
      entries: [
        { term: 'No início', text: 'O app pede que vocês distribuam a energia Argent entre os tipos de demônio em jogo (normalmente 3, da forma mais igual possível) e, se vocês jogarem com ele, compra um efeito do baralho de ameaça para essa rodada.' },
        { term: 'Modo Valkyrie', text: 'Um fuzileiro joga a sua ativação e toca em «Fim do Turno»; o app então ativa ao acaso um grupo de demônios entre os que ainda não agiram. Assim até que todos tenham agido.' },
        { term: 'Modo normal', text: 'Com o baralho de iniciativa físico: quando sair uma carta do invasor, escolham ao acaso um grupo que não tenha agido e toquem na sua «Ativação Forçada»; quando o baralho acabar, cada fuzileiro toca em «Fim do Turno».' },
        { term: 'Baralho de ameaça', text: 'São efeitos de uma rodada destas missões (mais dados, mais armadura…), não as cartas de Ameaça do jogo.' },
      ],
    },
    {
      title: 'Os demônios',
      entries: [
        { term: 'Ativação', text: 'O app diz quanto cada demônio se move, quem ele ataca e que habilidade usa. Eles são ativados um a um, com um ataque cada, a menos que a habilidade diga outra coisa.' },
        { term: 'Grupos', text: 'Demônios do mesmo tipo formam um grupo e agem juntos.' },
        { term: 'Argent', text: 'Fica na carta de cada demônio e é gasta nas suas habilidades, por miniatura. Quando o último de um tipo morre, a sua Argent volta para a reserva.' },
        { term: 'Defesa', text: 'Ao defender, o demônio revela a carta do topo do baralho de eventos. Só a defesa dela conta: o texto é ignorado.' },
        { term: 'Voadores', text: 'Ignoram o terreno difícil e o custo dos espaços com inimigos, e atravessam terreno intransponível.' },
        { term: 'Grandes', text: 'No app ocupam um espaço: coloquem a miniatura onde couber.' },
      ],
    },
    {
      title: 'Ataques',
      entries: [
        { term: 'Alcance', text: 'Os espaços até o defensor, contando o do defensor. O máximo é dado pelo quadro de ataque.' },
        { term: 'Linha de visão', text: 'Uma linha reta de um canto do seu espaço até um canto do espaço do defensor. Paredes, portas fechadas e terreno bloqueador a cortam; miniaturas, não.' },
        { term: 'Rolagem', text: 'Role os dados do quadro. O dado vermelho tem faces de 0, 1, 1, 1, 2 e 2 de dano; o preto, de 1, 1, 2, 2, 2 e 3.' },
        { term: 'Defesa', text: 'O fuzileiro revela a carta do topo do seu baralho de ações; o demônio, a do baralho de eventos. Cada escudo anula 1 de dano e uma esquiva anula tudo. O ícone de defesa especial ativa a do demônio, e a resistência lhe dá 1 escudo a mais.' },
        { term: 'Cobertura', text: 'Se alguma linha do seu canto até os cantos do defensor cruzar uma parede, terreno difícil ou bloqueador ou outra miniatura, o defensor pode descartar a defesa que revelou e revelar outra.' },
      ],
    },
    {
      title: 'Cambaleio e Glory Kills',
      entries: [
        { text: 'Quando o dano de um demônio chega ao seu valor de cambaleio, ele fica cambaleante e pode sofrer um Glory Kill.' },
        { text: 'Os efeitos que reduzem o valor de cambaleio impresso (como a Motosserra) não se somam: vale o maior.' },
        { text: 'Só demônios podem sofrer Glory Kill. Os fuzileiros se curam com Glory Kills, kits médicos e algumas classes.' },
      ],
    },
    {
      title: 'Morte, frags e reaparecimento',
      entries: [
        { term: 'Morte', text: 'Um fuzileiro morre quando o seu dano chega à sua vida (10): toquem em «KO». Retire a miniatura, descarte o dano dela, embaralhe a mão e a pilha de descarte no baralho e compre 3. O fuzileiro mantém as suas armas e as suas cartas de Glory Kill.' },
        { term: 'Reaparecimento', text: 'No início da sua próxima ativação, ele coloca a sua miniatura no teletransportador ativo que escolher; toquem no outro botão do seu retrato (Recuperar).' },
        { term: 'Frags', text: 'Cada morte é um frag para o invasor. A missão diz quantos ele precisa para vencer (normalmente 6); quando ele chega lá, o app declara a derrota de vocês.' },
      ],
    },
    {
      title: 'Portais',
      entries: [
        { text: 'Há portais azuis, amarelos e vermelhos, do menos para o mais perigoso.' },
        { text: 'Quando um fuzileiro vê um, toquem no seu marcador: o app escolhe um dos grupos dessa cor, diz onde colocá-lo (no portal ou ao lado dele) e às vezes dá Argent. O marcador é retirado.' },
        { text: 'Se não houver espaço, as miniaturas vão para o espaço vazio mais próximo.' },
      ],
    },
    {
      title: 'Mapa e terreno',
      entries: [
        { term: 'Paredes', text: 'Não podem ser atravessadas e cortam a linha de visão. Uma porta fechada é uma parede.' },
        { term: 'Terreno difícil', text: 'Borda azul pontilhada: custa 1 ponto a mais e dá cobertura.' },
        { term: 'Terreno bloqueador', text: 'Borda vermelha contínua: não se pode entrar, corta a linha de visão e dá cobertura.' },
        { term: 'Terreno intransponível', text: 'Borda vermelha pontilhada: não se pode entrar, mas não corta a linha de visão.' },
        { term: 'Diagonais', text: 'Você pode se mover na diagonal, mas não entre dois espaços que só se tocam por um canto, a menos que outro espaço desse canto seja adjacente aos dois.' },
      ],
    },
    {
      title: 'Fuzileiros e esquadrões',
      entries: [
        { term: 'Baralho inicial', text: 'Em quase todas as missões, UAC 1 a 4 e Escopeta de Combate 1 a 3; compre 3.' },
        { term: 'Classe', text: 'Dá uma habilidade que normalmente é exaurida, e ela é preparada no início da sua ativação.' },
        { term: 'Esquadrões', text: 'Com menos de 4 fuzileiros: com 3, um pega «Taking Point»; com 2, os dois pegam «Combat Veteran»; com 1, «Solo Operative», que dá duas ativações por rodada: entre elas, toquem em «Ativação Forçada» em um grupo que não tenha agido.' },
      ],
    },
    {
      title: 'Quando algo não estiver claro',
      entries: [
        { text: 'As regras da missão prevalecem: toquem nos seus marcadores de regras fora do mapa.' },
        { text: 'O app não controla o dano, o cambaleio nem a Argent de cada demônio, nem as cartas dos fuzileiros: vocês os controlam com os marcadores e as cartas físicas.' },
        { text: 'O «Log» guarda o que o app disse, rodada a rodada.' },
      ],
    },
  ],
};
