// Mansions' help in Portuguese (RulesHelp.tsx), translated by Claude from the English one (October 2026): corrections by
// native speakers are welcome. The app's own words, not FFG's; the app's buttons as Valkyrie names them in Portuguese. Not in Valkyrie.
import type { RulesHelpText } from './types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    'No seu turno você realiza até 2 ações, na ordem que quiser, e pode repetir a mesma (mover-se duas vezes dá até 4 espaços). O grupo decide quem joga cada turno.',
  actions: [
    {
      title: 'Ações',
      entries: [
        {
          term: 'Mover',
          text: 'Até 2 espaços, um de cada vez. Você pode dividir o movimento: mover 1, realizar outra ação e mover o outro. Não é possível atravessar paredes, bordas tracejadas nem portas com uma Obstrução ou um marcador de Exploração.',
        },
        { term: 'Explorar', text: 'Toque em um marcador de Exploração do seu espaço ou da porta ao seu lado. O app diz o que colocar.' },
        { term: 'Procurar', text: 'Toque em um marcador de Busca do seu espaço.' },
        { term: 'Interagir', text: 'Toque em um marcador de Interação ou de Pessoa do seu espaço e escolha uma opção com o ícone de ação.' },
        {
          term: 'Trocar',
          text: 'Dê, pegue ou largue quantos Itens e Feitiços quiser com os investigadores do seu espaço. Pegar algo do chão também custa esta ação. Pistas não podem ser trocadas.',
        },
        {
          term: 'Atacar',
          text: 'Escolha o monstro na lista de monstros, toque em «Ataque» e no tipo de arma. Corpo a corpo ou desarmado, no seu espaço; à distância, até 3 espaços. Anote o Dano com + e −.',
        },
        { term: 'Componente', text: 'Use um efeito «Ação:» de uma carta, ou um item do inventário (a mochila ou «Itens», embaixo à esquerda).' },
        {
          term: 'Obstrução',
          text: 'Coloque a Obstrução do seu espaço contra uma porta ou Passagem Secreta, ou afaste-a dela. Do outro lado da porta: teste de Força; com 2 sucessos você a empurra para o lado e passa.',
        },
        { term: 'Apagar o fogo', text: 'Teste de Agilidade: cada sucesso descarta 1 Fogo do seu espaço ou de um em que você entrar neste turno.' },
      ],
    },
    {
      title: 'Ações raras (quase sempre com uma carta de Insano)',
      entries: [
        {
          term: 'Empurrar',
          text: 'Mova 1 espaço um monstro ou investigador do seu espaço. Teste de Força contra a Agressividade do monstro, ou contra o resultado + 1 do investigador, se ele resistir. Se conseguir, você pode segui-lo.',
        },
        { term: 'Roubar', text: 'Escolha Força, Agilidade ou Observação e os dois fazem o teste. Você pega 1 pertence para cada sucesso que obtiver além dos dele.' },
        {
          term: 'Tocar fogo',
          text: 'Com uma Fonte de Luz, coloque Fogo no seu espaço ou em um adjacente. Se ainda não havia Fogo, toque em «Setado» (o pergaminho embaixo) → «Tocar Fogo» para que o app o propague.',
        },
      ],
    },
    {
      title: 'Livres (sem gastar ação)',
      entries: [
        { text: 'Os marcadores de Visão (o do olho).' },
        { text: 'As opções do app sem o ícone de ação: tocar em um marcador para lê-lo não obriga você a nada.' },
        { text: 'As habilidades que não dizem «Ação:».' },
      ],
    },
    {
      title: 'Lembre-se',
      entries: [
        {
          term: 'Evadir',
          text: 'No espaço de um monstro, antes de qualquer ação que não seja Atacar ou Mover, e para sair dele: escolha o monstro com a maior Percepção (número verde) e toque em «Evasão». Se falhar, normalmente você perde a ação.',
        },
        { term: 'Ferido', text: 'Você só pode realizar uma ação de Mover por rodada.' },
        { term: 'Fogo', text: 'Entrar em um espaço com Fogo, ou realizar ou perder uma ação nele, causa 1 Dano virado para baixo.' },
        { term: 'Escuridão', text: 'Você não pode gastar Pistas, a menos que haja uma Fonte de Luz ou Fogo no seu espaço ou em um adjacente.' },
      ],
    },
  ],
  rules: [
    {
      title: 'Antes de começar',
      entries: [
        { text: 'Embaralhe separadamente os baralhos de Dano e de Horror e deixe-os virados para baixo.' },
        { text: 'Separe por nome, virados para cima, os Itens Comuns, os Itens Únicos, os Feitiços e as Condições.' },
        { text: 'Separe os marcadores por tipo. O app diz quais peças de mapa, marcadores e monstros colocar, e quando.' },
        { text: 'Dividam os pertences iniciais como quiserem; as Pistas, como o app disser. Leiam o prólogo: ele pode ter pistas da história.' },
      ],
    },
    {
      title: 'A rodada',
      entries: [
        { term: 'Fase de Investigação', text: 'Cada investigador joga um turno inteiro de até 2 ações, na ordem que o grupo escolher. Quando todos terminarem, toquem no botão ➤ embaixo à direita.' },
        { term: 'Fase do Mito', text: 'Nesta ordem:' },
        { term: '1. Fogo', text: 'Se houver Fogo, acrescente 1 marcador no total (não um por foco) em um espaço adjacente a outro com Fogo.' },
        { term: '2. Eventos', text: 'O app mostra um ou mais eventos de Mitos; resolvam-nos conforme o texto.' },
        { term: '3. Monstros', text: 'O app ativa cada monstro, um após o outro.' },
        { term: '4. Horror', text: 'Cada investigador faz um teste de horror contra o monstro com mais Horror dentro do seu alcance, se houver.' },
        { text: 'Toquem em ➤ e começa uma nova rodada. O tempo passa mesmo que vocês não o vejam: o app decide quando é tarde.' },
      ],
    },
    {
      title: 'Testes',
      entries: [
        { term: 'Dados', text: 'Tantos quanto o atributo, com os modificadores (no mínimo 1). Cada dado tem 3 faces de sucesso, 2 de investigação (a lupa) e 3 em branco.' },
        { term: 'Resultado', text: 'O número de sucessos. «(Agilidade −1; 2)» é um teste de Agilidade com um dado a menos que precisa de 2 sucessos.' },
        { term: 'Pistas', text: 'Depois de rolar, cada Pista que você gastar transforma 1 lupa em sucesso. Não é rolar de novo.' },
        { term: 'Anular', text: 'Se o texto disser «anulado por…», cada sucesso evita 1 Dano ou 1 Horror.' },
        { term: 'Rolar dados', text: 'Se o texto disser apenas «role X dados», não é um teste: não se podem gastar Pistas.' },
        { text: 'Só o investigador ativo rola, a menos que um efeito diga outra coisa.' },
      ],
    },
    {
      title: 'Dano, Horror, Ferido e Insano',
      entries: [
        { term: 'Cartas', text: 'Sofrer Dano ou Horror é comprar uma carta do seu baralho, virada para cima, a menos que diga «virada para baixo». As viradas para baixo não fazem nada: só contam.' },
        { term: 'Viradas para cima', text: '«Resolva imediatamente» se aplica ao recebê-la; «Mantenha virada para cima» tem efeito enquanto continuar assim. Se for preciso desvirar cartas viradas para baixo, elas são escolhidas ao acaso.' },
        { term: 'Ferido', text: 'Quando o seu Dano total chega à sua Vida: você fica Ferido e descarta o Dano virado para baixo. Você só pode se mover uma vez por rodada.' },
        { term: 'Insano', text: 'O mesmo com o Horror e a Sanidade. Leia em segredo o verso da sua carta de Insano: ela pode mudar como você vence. Se pedir mais investigadores do que vocês são, pegue outra.' },
        { term: 'Eliminado', text: 'Se, já Ferido ou Insano, você chegar ao limite outra vez: largue seus pertences e retire sua miniatura. Toquem em «Setado» (o pergaminho embaixo) → «Investigador Eliminado». Os demais perdem ao final da próxima Fase de Investigação, a menos que tenham terminado.' },
      ],
    },
    {
      title: 'Monstros',
      entries: [
        { term: 'Marcador', text: 'Percepção (verde): de qual se evade. Horror (azul): contra qual se faz o teste de horror. Agressividade (vermelho, no verso): dados contra Obstruções e dificuldade para empurrá-lo. O app controla a Vida dele.' },
        { term: 'Ativação', text: 'Façam o que o app disser. «Em direção a» significa que cada passo o aproxima; ele para ao chegar ao seu alvo. Se não houver alvo ao alcance, ele não se move: toquem no botão de que não há investigadores e o app dá outra ordem.' },
        { term: 'Portas', text: 'Eles as atravessam livremente, a menos que estejam obstruídas: então rolam tantos dados quanto a sua Agressividade e com 2 sucessos quebram a Obstrução; se não, perdem o movimento (mas ainda atacam se dividirem o espaço com alguém).' },
        { term: 'Teste de horror', text: 'Só no passo de horror. Se vários investigadores fizerem o teste contra o mesmo monstro, o app o mostra uma vez e cada um rola e aplica o seu.' },
        { term: 'Fogo', text: 'Um monstro que começa a sua ativação em Fogo, ou entra nele, sofre 1 Dano.' },
      ],
    },
    {
      title: 'O mapa e o alcance',
      entries: [
        { term: 'Espaços', text: 'Bordas contínuas (brancas ou amarelas): podem ser atravessadas. Bordas tracejadas: não podem ser atravessadas, mas o alcance passa por elas. Paredes: nada as atravessa nem passa por elas. Portas: podem ser atravessadas, mas o alcance não passa por elas.' },
        { term: 'Alcance', text: 'Até 3 espaços, contando o seu como 0. Pode virar esquinas: não há linha de visão. Não passa por paredes, portas nem Passagens Secretas.' },
        { term: 'Adjacente', text: 'Os efeitos sobre espaços adjacentes (luz, propagação do Fogo) passam por portas, nunca por paredes.' },
        { term: 'Passagem Secreta', text: 'Todos os espaços com Passagem Secreta são adjacentes entre si para o movimento.' },
        { term: 'Norte', text: 'É sempre a parte de cima da tela.' },
        { term: 'Interior e exterior', text: 'Os cômodos exteriores têm a placa do nome prateada com tentáculos vermelhos. Alguns eventos fazem diferença entre eles.' },
      ],
    },
    {
      title: 'Fogo, Escuridão e Obstruções',
      entries: [
        { term: 'Fogo', text: 'Nunca pode haver 2 no mesmo espaço. Ele se propaga por portas, não por paredes; as Obstruções não o detêm. O Fogo que você apagar com a sua ação já não causa Dano a você.' },
        { term: 'Escuridão', text: 'No seu espaço não se gastam Pistas, nem em testes nem em quebra-cabeças. Uma Fonte de Luz ou um Fogo no seu espaço ou em um adjacente a anula.' },
        { term: 'Obstrução', text: 'Nem investigadores nem monstros passam por uma porta ou Passagem obstruída. Ela não impede que monstros apareçam.' },
      ],
    },
    {
      title: 'Itens, Feitiços e Condições',
      entries: [
        { term: 'Pertences', text: 'Os Itens Comuns, os Itens Únicos e os Feitiços. Pistas, Condições, Dano e Horror não são.' },
        { term: 'Itens', text: 'Você pode olhar o verso deles quando quiser. Quando um item é virado, o verso substitui a frente.' },
        { term: 'Feitiços', text: 'Você recebe uma cópia ao acaso e nunca olha o verso dela. Para conjurá-lo, você o vira, resolve o verso e quase sempre o descarta e ganha outra cópia.' },
        { term: 'Condições', text: 'Viradas para cima e nunca duas cópias. Atordoado: só 1 ação no seu turno. Confuso: você não gasta Pistas. Contido: você não pode se mover por conta própria. Focado: descarte-a para que todas as suas lupas sejam sucessos.' },
        { term: 'Armas', text: 'Para atacar com um tipo de arma, você precisa ter uma desse tipo. Desarmado, sempre pode.' },
      ],
    },
    {
      title: 'Quebra-cabeças',
      entries: [
        { term: 'Passos', text: 'Tantos quanto o valor impresso do atributo que o app pedir, mais 1 por Pista que você gastar (não na Escuridão). O app não os conta: contem vocês mesmos.' },
        { term: 'Fechar', text: 'Quando os passos acabarem, toque em «Fechar»: o progresso é mantido e alguém pode continuar mais tarde com outra ação. Vocês podem se aconselhar.' },
        { term: 'Mosaico', text: 'Recomponha a imagem trocando duas peças vizinhas por passo.' },
        { term: 'Fechadura', text: 'Deslize blocos, um por passo, até a peça-alvo sair pela direita.' },
        { term: 'Código', text: 'Proponha um código por passo. Um sucesso para cada símbolo no lugar certo; uma lupa para cada símbolo certo no lugar errado.' },
        { term: 'Torre', text: 'Mova a peça de cima de uma coluna para outra até empilhar todas, da maior para a menor.' },
      ],
    },
    {
      title: 'Expansões',
      entries: [
        { term: 'Chave', text: 'Um item com um marcador de Chave ganha os traços Chave e Evidência e não pode ser descartado, mas pode ser trocado ou roubado.' },
        { term: 'Peças de mapa que se movem ou se sobrepõem', text: 'Movem-se com tudo o que estiver em cima delas. Uma sobre outra nunca cobre um espaço inteiro; o que fica coberto deixa de fazer parte do tabuleiro.' },
        { term: 'Elixires', text: 'São ganhos ao acaso; não olhe o verso até que um efeito os vire. Virados para cima são pertences; virados para baixo, não.' },
        { term: 'Melhorias', text: '+1 ao valor impresso de um atributo, uma vez por atributo. Não são pertences.' },
        { term: 'Contenção', text: 'Não é preciso evadir um monstro no espaço dela. Quando esse monstro for ativado, vocês podem descartá-la para que ele não se mova.' },
        { term: 'Escombros', text: 'Impedem Procurar, Explorar e Interagir. Teste de Força: 1 marcador por sucesso; uma Arma Pesada retira todos.' },
        { term: 'Vegetação', text: 'Para sair, teste de Observação com dificuldade igual ao número de marcadores; se falhar, largue um item ao acaso. Uma Arma Cortante os retira; o Fogo também.' },
        { term: 'Água', text: 'Entrar nela encerra o seu movimento (exceto monstros aquáticos, voadores ou incorpóreos). Ela apaga o Fogo.' },
        { term: 'Fenda', text: 'Realizar no seu espaço uma ação que não seja mover-se deixa você Perdido no Tempo e no Espaço. Teste de Conhecimento para fechá-las: 1 por sucesso.' },
      ],
    },
    {
      title: 'Quando algo não estiver claro',
      entries: [
        { text: 'Se um efeito puder afetar vários investigadores, ou vários acontecerem ao mesmo tempo, o grupo decide. Se vocês não chegarem a um acordo, um investigador ao acaso decide.' },
        { text: 'Os efeitos sobre um investigador eliminado são aplicados na medida do possível.' },
        { text: 'O Log (o livro ou «Log», embaixo) guarda tudo o que o app disse, por rodada.' },
      ],
    },
  ],
};
