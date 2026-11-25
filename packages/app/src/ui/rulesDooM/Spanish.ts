// DooM's help in Spanish (RulesHelp.tsx): the app's own words, not FFG's, from the rules the doom-valkyrie skill
// gathers (DOOM: The Board Game as the DooM pack's missions play it in Valkyrie), with the app's buttons as Valkyrie
// names them in Spanish. Not in Valkyrie.
import type { RulesHelpText } from '../rulesMoM/types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    'En tu activación: si habías muerto, reapareces en el teletransportador activo que elijas, y enderezas tu carta de clase. Haces 1 acción principal y todas las adicionales que quieras, en el orden que quieras. Al acabar, descartas las cartas jugadas, robas hasta tener 3 y pulsas «Fin del Turno» en tu retrato: la app activa un grupo de demonios.',
  actions: [
    {
      title: 'Acciones',
      entries: [
        {
          term: 'Jugar una carta',
          text: 'Te da tantos puntos de movimiento como su velocidad y, si tiene recuadro de ataque, ese ataque. Cada carta se resuelve entera antes de jugar otra. Las de reacción se juegan fuera de tu activación.',
        },
        { term: 'Esprintar', text: 'Como acción principal, descartas 1 carta de la mano y ganas 6 puntos de movimiento.' },
        {
          term: 'Moverse',
          text: 'Cada casilla cuesta 1 punto, también en diagonal. El terreno difícil cuesta 1 más, y entrar en una casilla con un enemigo, otro más. Atraviesas a los marines, pero no acabas en una casilla ocupada. Gastas los puntos cuando quieras salvo en mitad de un ataque; los que sobran se pierden.',
        },
        {
          term: 'Abrir una puerta',
          text: 'Adyacente a ella, por 1 punto de movimiento: púlsala en la app. No se vuelve a cerrar. Las de color necesitan su tarjeta de acceso. En estas misiones los demonios no abren puertas.',
        },
        {
          term: 'Recoger',
          text: 'Pasa por la casilla de un arma, un botiquín o una tarjeta y pulsa su ficha. Un arma añade sus cartas a tu mazo, encima; un botiquín te cura 5 de daño.',
        },
        {
          term: 'Ejecución',
          text: 'Entra en la casilla de un demonio tambaleante (2 puntos): muere, robas una carta de Ejecución y te curas 2 de daño. Después puedes seguir moviéndote.',
        },
        {
          term: 'Teletransportadores',
          text: 'Al entrar en uno inactivo, se activa. Todos los activos están unidos: pasar de uno a otro cuesta 1 punto. Si llegas desde otro, o reapareces, en uno con un demonio encima, el demonio muere (telefrag).',
        },
      ],
    },
    {
      title: 'Recuerda',
      entries: [
        { term: 'Munición', text: 'No hay: tu mano es el cargador. Solo disparas un arma si tienes una de sus cartas.' },
        { term: 'Portales', text: 'Cuando un marine vea un portal (línea de visión), pulsad su ficha: la app dice qué demonios salen y dónde.' },
        { term: 'Aturdido', text: 'Quitas 1 dado al atacar, no revelas defensa y no tienes cobertura. Se va después de atacar o de ser atacado.' },
      ],
    },
    {
      title: 'En la app',
      entries: [
        { term: 'Fin del Turno', text: 'En el retrato de cada marine, al acabar su activación.' },
        { term: 'KO', text: 'En el retrato del marine que muere: es un frag para el invasor. Cuando reaparece, el otro botón del retrato (Recuperar).' },
        { term: 'Derrotado', text: 'En el retrato del grupo cuando muere el último demonio de ese tipo. «Único Derrotado» para un jefe.' },
        { term: 'Información', text: 'En el retrato de un grupo: sus aclaraciones. «Forzar Activación», para jugar con el mazo de iniciativa físico.' },
        { term: 'Reglas de la misión', text: 'Las fichas fuera del mapa muestran el modo de juego, el objetivo y las reglas de la misión al pulsarlas.' },
      ],
    },
  ],
  rules: [
    {
      title: 'La ronda',
      entries: [
        { term: 'Al empezar', text: 'La app pide repartir la energía Argent entre los tipos de demonio en juego (normalmente 3, lo más igual posible) y, si jugáis con él, roba un efecto del mazo de amenaza para esa ronda.' },
        { term: 'Modo Valkyrie', text: 'Un marine juega su activación y pulsa «Fin del Turno»; la app activa entonces un grupo de demonios al azar de los que no han actuado. Así hasta que todos han actuado.' },
        { term: 'Modo normal', text: 'Con el mazo de iniciativa físico: al salir una carta del invasor, elegís al azar un grupo que no haya actuado y pulsáis su «Forzar Activación»; al agotar el mazo, cada marine pulsa «Fin del Turno».' },
        { term: 'Mazo de amenaza', text: 'Son efectos de una ronda de estas misiones (más dados, más armadura…), no las cartas de Amenaza del juego.' },
      ],
    },
    {
      title: 'Los demonios',
      entries: [
        { term: 'Activación', text: 'La app dice cuánto se mueve cada demonio, a quién ataca y qué habilidad usa. Se activan uno a uno, con un ataque cada uno salvo que la habilidad diga otra cosa.' },
        { term: 'Grupos', text: 'Los demonios del mismo tipo forman un grupo y actúan juntos.' },
        { term: 'Argent', text: 'Se pone en la carta de cada demonio y se gasta en sus habilidades, por figura. Cuando muere el último de un tipo, su Argent vuelve a la reserva.' },
        { term: 'Defensa', text: 'Al defender, el demonio revela la primera carta del mazo de eventos. Solo cuenta su defensa: su texto se ignora.' },
        { term: 'Voladores', text: 'Ignoran el terreno difícil y el coste de las casillas enemigas, y cruzan el terreno infranqueable.' },
        { term: 'Grandes', text: 'En la app ocupan una casilla: poned la figura donde quepa.' },
      ],
    },
    {
      title: 'Ataques',
      entries: [
        { term: 'Alcance', text: 'Las casillas hasta el defensor, contando la suya. El máximo lo da el recuadro de ataque.' },
        { term: 'Línea de visión', text: 'Una recta de una esquina de tu casilla a una esquina de la del defensor. La cortan las paredes, las puertas cerradas y el terreno bloqueante; las figuras no.' },
        { term: 'Tirada', text: 'Se tiran los dados del recuadro. El rojo tiene caras de 0, 1, 1, 1, 2 y 2 de daño; el negro, de 1, 1, 2, 2, 2 y 3.' },
        { term: 'Defensa', text: 'El marine revela la primera carta de su mazo de acción; el demonio, la del mazo de eventos. Cada escudo anula 1 de daño y la esquiva lo anula todo. El símbolo de defensa especial activa la del demonio, y la dureza le da 1 escudo más.' },
        { term: 'Cobertura', text: 'Si alguna recta de tu esquina a las del defensor cruza una pared, terreno difícil o bloqueante u otra figura, puede descartar la defensa que reveló y revelar otra.' },
      ],
    },
    {
      title: 'Tambaleo y ejecuciones',
      entries: [
        { text: 'Cuando el daño de un demonio llega a su valor de tambaleo, queda tambaleante y se le puede ejecutar.' },
        { text: 'Los efectos que bajan el valor impreso de tambaleo (como la motosierra) no se suman: vale el mayor.' },
        { text: 'Solo se ejecuta a demonios. Los marines se curan con ejecuciones, botiquines y algunas clases.' },
      ],
    },
    {
      title: 'Muerte, frags y reaparición',
      entries: [
        { term: 'Muerte', text: 'Un marine muere cuando su daño llega a su vida (10): pulsad «KO». Quita la figura, descarta su daño, baraja su mano y su descarte con su mazo y roba 3. Conserva sus armas y sus cartas de Ejecución.' },
        { term: 'Reaparición', text: 'Al empezar su siguiente activación pone su figura en el teletransportador activo que elija; pulsad el otro botón de su retrato (Recuperar).' },
        { term: 'Frags', text: 'Cada muerte es un frag para el invasor. La misión dice cuántos le bastan para ganar (lo habitual, 6); al llegar, la app da la derrota.' },
      ],
    },
    {
      title: 'Portales',
      entries: [
        { text: 'Los hay azules, amarillos y rojos, de menos a más peligro.' },
        { text: 'Cuando un marine ve uno, pulsad su ficha: la app elige uno de los grupos de ese color, dice dónde colocarlo (en el portal o al lado) y a veces da Argent. La ficha se quita.' },
        { text: 'Si no queda sitio, las figuras van a la casilla libre más cercana.' },
      ],
    },
    {
      title: 'Mapa y terreno',
      entries: [
        { term: 'Paredes', text: 'No se cruzan y cortan la línea de visión. Una puerta cerrada es una pared.' },
        { term: 'Terreno difícil', text: 'Borde azul punteado: cuesta 1 punto más y da cobertura.' },
        { term: 'Terreno bloqueante', text: 'Borde rojo continuo: no se entra, corta la línea de visión y da cobertura.' },
        { term: 'Terreno infranqueable', text: 'Borde rojo punteado: no se entra, pero no corta la línea de visión.' },
        { term: 'Diagonales', text: 'Se mueve en diagonal, pero no entre dos casillas que solo se tocan por una esquina, salvo que otra casilla de esa esquina sea adyacente a las dos.' },
      ],
    },
    {
      title: 'Marines y pelotones',
      entries: [
        { term: 'Mazo inicial', text: 'En casi todas las misiones, UAC 1 a 4 y Escopeta de combate 1 a 3; se roban 3.' },
        { term: 'Clase', text: 'Da una habilidad que suele agotarse y se endereza al empezar tu activación.' },
        { term: 'Pelotones', text: 'Con menos de 4 marines: con 3, uno lleva «Taking Point»; con 2, los dos «Combat Veteran»; con 1, «Solo Operative», que da dos activaciones por ronda: entre ellas, pulsad «Forzar Activación» en un grupo que no haya actuado.' },
      ],
    },
    {
      title: 'Cuando algo no está claro',
      entries: [
        { text: 'Las reglas de la misión mandan: pulsad sus fichas de reglas fuera del mapa.' },
        { text: 'La app no lleva el daño, el tambaleo ni el Argent de cada demonio, ni las cartas de los marines: lo lleváis con las fichas y cartas físicas.' },
        { text: 'El Historial («Log») guarda lo que ha dicho la app, por turnos.' },
      ],
    },
  ],
};
