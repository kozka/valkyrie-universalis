// Descent's help in Portuguese (RulesHelp.tsx), translated by Claude from the English one (October 2026): corrections by
// native speakers are welcome. The app's own words, not FFG's; the app's buttons as Valkyrie names them in Portuguese. Not in Valkyrie.
import type { RulesHelpText } from '../rulesMoM/types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    'Quando o seu turno começa, terminam os efeitos que duram «até o seu próximo turno», você resolve os de «no início do seu turno», renova as suas cartas exauridas e pode trocar o seu equipamento. Depois você realiza até 2 ações, em qualquer ordem; pode repetir a mesma ou não realizá-las. Ao terminar, toque em «Fim do Turno» no seu retrato: o app ativa um grupo de monstros.',
  actions: [
    {
      title: 'Ações',
      entries: [
        {
          term: 'Mover',
          text: 'Você ganha tantos pontos de movimento quanto a sua Velocidade; cada espaço custa 1, na diagonal também. Você pode dividi-lo para realizar outra ação no meio. Você pode atravessar heróis, não monstros, e não pode terminar em um espaço ocupado.',
        },
        { term: 'Atacar', text: 'Com uma arma equipada, ou desarmado (só o dado azul, corpo a corpo). Veja «Ataques» no resumo das regras.' },
        { term: 'Usar uma habilidade', text: 'Uma carta de classe com o ícone de ação, pagando a sua fadiga.' },
        { term: 'Descansar', text: 'No final do seu turno você recupera toda a sua fadiga, mesmo que tenha sido a sua primeira ação.' },
        { term: 'Procurar', text: 'Um marcador de Busca no seu espaço ou em um adjacente: toque nele no app e ele diz o que você encontra.' },
        {
          term: 'Abrir uma porta',
          text: 'Uma porta adjacente: toque nela no app, leia o texto e confirme. Normalmente revela novas peças de mapa, marcadores e monstros. Em Road to Legend as portas nunca voltam a ser fechadas.',
        },
        {
          term: 'Reanimar um herói',
          text: 'Um herói nocauteado cujo marcador esteja adjacente: role 2 dados vermelhos, ele recupera 1 de dano por coração e 1 de fadiga por ímpeto e volta ao mapa. No próximo turno dele, joga normalmente.',
        },
        { term: 'Ação especial', text: 'O que as cartas, os itens ou a aventura permitirem com o ícone de ação: pegar um objetivo, falar com um aldeão, puxar uma alavanca…' },
      ],
    },
    {
      title: 'Se você estiver nocauteado',
      entries: [
        {
          term: 'Levantar-se',
          text: 'É a única coisa que você pode fazer nesse turno: role 2 dados vermelhos, recupere 1 de dano por coração e 1 de fadiga por ímpeto e coloque a sua miniatura onde estava o seu marcador. Depois o seu turno termina. Toque em «Fim do Turno» mesmo assim.',
        },
      ],
    },
    {
      title: 'Sem gastar ação',
      entries: [
        { text: 'Examinar no app qualquer marcador ou porta, mesmo que você não esteja ao lado, antes de decidir.' },
        { text: 'Sofrer 1 de fadiga para cada ponto de movimento extra, sem passar do seu Vigor.' },
        { text: 'Trocar itens com um herói adjacente depois de uma ação de Mover. Cartas de classe não podem ser trocadas.' },
        { text: 'Gastar um ímpeto que sobrar em um ataque para recuperar 1 de fadiga.' },
        { text: 'Com exatamente 2 heróis, cada um pode fazer um ataque normal grátis por turno; se não fizer, recupera 2 de dano no final do seu turno.' },
      ],
    },
    {
      title: 'No app',
      entries: [
        { term: 'Fim do Turno', text: 'No retrato de cada herói, quando o turno dele termina, mesmo que esteja nocauteado. Se não for tocado, a rodada não avança.' },
        { term: 'KO', text: 'No retrato do herói que é nocauteado: a moral cai. Quando ele volta ao mapa, o outro botão do retrato (Recuperar).' },
        { term: 'Derrotado', text: 'No retrato do grupo de monstros quando o último cai. «Derrota Única» se cair o monstro único.' },
        { term: 'Informação', text: 'No retrato de um grupo: os seus esclarecimentos e a ordem em que ele gasta os ímpetos. «Ativação Forçada», se a aventura pedir.' },
        { term: 'Habilidades e Itens', text: 'Os botões embaixo: as habilidades e a experiência de cada herói, e os itens e o ouro do grupo.' },
      ],
    },
  ],
  rules: [
    {
      title: 'A rodada',
      entries: [
        { text: 'O grupo escolhe um herói que ainda não jogou; ele joga o seu turno e toca em «Fim do Turno». O app então ativa ao acaso um grupo de monstros entre os que ainda não foram ativados. Isso se repete, herói e grupo.' },
        { text: 'Se um lado ficar sem turnos, o outro joga os que lhe restam em seguida.' },
        { term: 'Fim da rodada', text: 'Quando todos jogaram, resolvem-se os efeitos de fim de rodada que a aventura indicar (reforços, perigos…) e começa uma nova rodada. O app salva a partida no início de cada rodada.' },
        { text: 'As habilidades «uma vez por turno» dos heróis não são usadas durante as ativações dos monstros.' },
      ],
    },
    {
      title: 'Ativação dos monstros',
      entries: [
        { term: 'Janela', text: 'Um efeito especial para esta ativação e a lista de ações dos mestres («Mestre», miniaturas vermelhas) e dos lacaios («Minion», miniaturas bege), na ordem em que ela mostra.' },
        { term: 'Cada monstro', text: 'Percorre a lista de cima para baixo e realiza a primeira ação que puder, até realizar 2; se chegar ao fim, recomeça do topo. Só 1 ataque por ativação, exceto com habilidades como Devastar (Ravage).' },
        { term: 'Ignorada', text: 'O que ele não pode fazer ou não teria efeito: mover-se para onde já está, atacar sem alvo válido ou sem linha de visão, um segundo ataque.' },
        { term: 'Avistar', text: 'Mover-se até ficar a 3 espaços ou menos do alvo e com linha de visão.' },
        { term: 'Confrontar', text: 'Mover-se até ficar adjacente ao alvo. Com Alcance (Reach), ele para a 2 espaços com linha de visão.' },
        { term: 'Recuar', text: 'Gastar o movimento que lhe resta afastando-se do inimigo mais próximo.' },
        { term: 'Empates', text: 'Entre alvos, o mais próximo; se o empate continuar, vocês decidem.' },
        { text: 'Quando todos de um tipo terminarem, toquem em «Mestre Ativado» ou «Minion Ativado».' },
      ],
    },
    {
      title: 'Movimento e terreno',
      entries: [
        { term: 'Diagonais', text: 'Você pode se mover na diagonal, mas não pela quina de uma parede.' },
        { term: 'Água', text: 'Entrar custa 2 pontos de movimento.' },
        { term: 'Fosso', text: 'Ao entrar você sofre 2 de dano. Dentro dele você não pode gastar pontos de movimento: você sai com uma ação para um espaço vazio adjacente.' },
        { term: 'Lava', text: 'Ao entrar você sofre 1 de dano, e uma miniatura que termina o seu turno nela é derrotada.' },
        { term: 'Obstáculo', text: 'Bloqueia o movimento e a linha de visão.' },
        { term: 'Monstros', text: 'Não podem sofrer fadiga para se mover mais. Evitam fossos e lava, e só usam a água se lhes sair mais barato.' },
        { term: 'Monstros grandes', text: 'Contam o movimento a partir de um dos seus espaços, como se fossem pequenos, e ao terminar são colocados de modo que um dos seus espaços seja o final.' },
      ],
    },
    {
      title: 'Linha de visão, espaços e adjacência',
      entries: [
        { term: 'Linha de visão', text: 'Uma linha reta de um canto do seu espaço até um canto do espaço do alvo. Ela é bloqueada por miniaturas, obstáculos, paredes e portas; só tocar um canto não a bloqueia. Espaços adjacentes sempre se veem.' },
        { term: 'Contar espaços', text: 'O caminho mais curto, sem contar o espaço de partida. Miniaturas e terreno que não seja obstáculo não importam; não se conta através de paredes nem de portas fechadas.' },
        { term: 'Adjacente', text: 'Espaços que compartilham um lado ou um canto, a menos que uma parede ou uma porta os separe.' },
      ],
    },
    {
      title: 'Ataques',
      entries: [
        { term: 'Rolagem', text: 'O atacante rola o dado azul e os seus dados de poder, e o defensor os seus dados de defesa, tudo ao mesmo tempo. Um X no dado azul é um erro.' },
        { term: 'À distância', text: 'O alcance total nos dados deve chegar ao número de espaços até o alvo; contra um adjacente é preciso pelo menos 1.' },
        { term: 'Ímpetos', text: 'Cada ímpeto é gasto em uma habilidade de ímpeto diferente, cada uma uma vez por ataque.' },
        { term: 'Dano', text: 'Os corações obtidos menos os escudos do defensor. Causar 0 não é um erro. Uma condição vinda de um ímpeto só se aplica se o ataque causar pelo menos 1 de dano.' },
        { term: 'Explosão', text: 'Afeta também todos os espaços adjacentes ao alvo. Contra vários monstros, em Road to Legend o alvo sofre o dano total e os outros a metade, arredondada para cima, antes dos escudos.' },
        { term: 'Perfurar X', text: 'Ignora X escudos.' },
      ],
    },
    {
      title: 'Testes de atributo',
      entries: [
        { text: 'Role 1 dado cinza e 1 dado preto e conte os escudos: se forem iguais ou menores que o atributo (Força, Conhecimento, Vontade ou Percepção), você passa no teste.' },
        { text: 'Monstros mestres e lacaios sempre falham; os tenentes fazem o teste com os seus próprios atributos.' },
        { text: 'O app não rola dados: o texto diz o que acontece se você passar e se falhar.' },
      ],
    },
    {
      title: 'Dano, fadiga, nocaute e moral',
      entries: [
        { term: 'Vida', text: 'Quando o dano iguala ou supera a Vida, a miniatura é derrotada.' },
        { term: 'Fadiga', text: 'A fadiga que você escolhe sofrer nunca passa do seu Vigor. A fadiga que um efeito obriga você a sofrer, se não couber, você sofre como dano. Os monstros sofrem dano em vez de fadiga.' },
        { term: 'Nocauteado', text: 'Você sofre fadiga até o seu Vigor, substitui a sua miniatura pelo seu marcador de herói, descarta as suas condições e, se era o seu turno, ele termina. Toquem em «KO» no seu retrato.' },
        { term: 'Moral', text: 'Começa igual ao número de heróis e cai 1 a cada KO. Se estiver em 0 e outro herói cair, vocês fogem e perdem a aventura.' },
      ],
    },
    {
      title: 'Condições',
      entries: [
        { text: 'Você não pode ter duas cópias da mesma. Os testes de condição são feitos no início do turno. Quando você é nocauteado, descarta todas.' },
        { term: 'Envenenado', text: 'Teste de Força: se falhar, você sofre 1 de dano e a mantém.' },
        { term: 'Doente', text: 'Teste de Vontade: se falhar, você sofre 1 de fadiga e a mantém.' },
        { term: 'Imobilizado', text: 'Você não pode realizar ações de Mover. É descartada no final do seu turno.' },
        { term: 'Atordoado', text: 'A única ação que você pode realizar é descartá-la; depois, a sua outra ação normalmente.' },
        { term: 'Em chamas', text: 'No final do seu turno, você e cada miniatura aliada adjacente sofrem 1 de dano. É removida com uma ação sua ou de alguém adjacente.' },
        { term: 'Amaldiçoado', text: 'Você não pode usar ações de habilidade. É removida passando em um teste de Conhecimento no início do turno.' },
        { term: 'Enfraquecido', text: '1 escudo a menos ao defender e 1 coração a menos ao atacar. É removida quando você Descansa.' },
        { term: 'Sangrando', text: 'Você sofre 1 de fadiga para cada ação que não seja descartá-la.' },
        { term: 'Condenado', text: 'Cada vez que você sofre dano, sofre 1 de dano a mais. É removida gastando um ímpeto.' },
        { term: 'Aterrorizado', text: 'Você não pode gastar ímpetos. É removida no final do seu turno se você não puder ver nenhum inimigo.' },
      ],
    },
    {
      title: 'Heróis, equipamento e busca',
      entries: [
        { term: 'Valores', text: 'Velocidade (movimento), Vida, Vigor (fadiga máxima), Defesa e os atributos Força, Conhecimento, Vontade e Percepção.' },
        { term: 'Façanha heroica', text: 'Uma vez por aventura; ao usá-la, vire a sua ficha de herói.' },
        { term: 'Equipamento', text: 'Duas mãos (uma arma de duas mãos ocupa as duas), uma armadura e dois outros itens. Só pode ser trocado no início do seu turno.' },
        { term: 'Exaurir', text: 'Uma carta usada é girada de lado e não pode ser usada de novo até que você a renove no início do seu turno.' },
        { term: 'Busca', text: 'As cartas de Busca são descartadas quando a aventura termina. O ouro pertence a todo o grupo.' },
      ],
    },
    {
      title: 'Objetivo, vitória e derrota',
      entries: [
        { text: 'A aventura dá o objetivo e pode mudá-lo («Objetivo atualizado»). Vocês vencem ao cumpri-lo.' },
        { text: 'Vocês perdem pela moral ou como a aventura disser. Se demorarem, no final de algumas rodadas surgem perigos cada vez piores.' },
        { term: 'Quando termina', text: 'Os heróis recuperam todo o dano e a fadiga, viram a ficha de herói para cima e descartam as condições e as cartas de Busca. O ouro, a experiência, os itens e a fama são mantidos.' },
      ],
    },
    {
      title: 'Quando algo não estiver claro',
      entries: [
        { text: 'As cartas têm precedência sobre as regras gerais, e as regras da aventura sobre todo o resto.' },
        { text: 'Se um efeito permitir várias opções, o grupo decide. O app não verifica nenhuma regra: vocês as aplicam.' },
        { text: 'O app não sabe onde estão as miniaturas, o dano nem as condições delas: se salvarem no meio da aventura, anotem. O «Log» guarda o que o app disse.' },
      ],
    },
  ],
};
