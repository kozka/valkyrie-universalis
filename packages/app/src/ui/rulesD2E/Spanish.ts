// Descent's help in Spanish (RulesHelp.tsx): the app's own words, not FFG's, from the rules the descent-valkyrie skill
// gathers (Road to Legend, as Valkyrie plays it), with the app's buttons as Valkyrie names them in Spanish. Not in
// Valkyrie.
import type { RulesHelpText } from '../rulesMoM/types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    'Al empezar tu turno se acaban los efectos «hasta tu siguiente turno», resuelves los de «al inicio de tu turno», refrescas tus cartas agotadas y puedes cambiar tu equipo. Después haces hasta 2 acciones, en cualquier orden; puedes repetir la misma o no hacerlas. Al acabar, pulsa «Fin del Turno» en tu retrato: la app activa un grupo de monstruos.',
  actions: [
    {
      title: 'Acciones',
      entries: [
        {
          term: 'Mover',
          text: 'Ganas tantos puntos de movimiento como tu Velocidad; cada casilla cuesta 1, también en diagonal. Puedes partirlo para hacer otra acción en medio. Atraviesas a los héroes, no a los monstruos, y no acabas en una casilla ocupada.',
        },
        { term: 'Atacar', text: 'Con un arma equipada, o sin arma (solo el dado azul, cuerpo a cuerpo). Mira «Ataques» en el resumen de reglas.' },
        { term: 'Usar una habilidad', text: 'Una carta de clase con el icono de acción, pagando su fatiga.' },
        { term: 'Descansar', text: 'Al final de tu turno recuperas toda tu fatiga, aunque fuera tu primera acción.' },
        { term: 'Buscar', text: 'Una ficha de Búsqueda en tu casilla o adyacente: púlsala en la app y te dirá qué encuentras.' },
        {
          term: 'Abrir una puerta',
          text: 'Una puerta adyacente: púlsala en la app, lee su texto y confirma. Suele revelar piezas, fichas y monstruos nuevos. En Road to Legend las puertas no se vuelven a cerrar.',
        },
        {
          term: 'Reanimar',
          text: 'A un héroe fuera de combate cuya ficha esté adyacente: tira 2 dados rojos, recupera 1 de daño por cada corazón y una fatiga por cada aumento, y vuelve al mapa. En su siguiente turno juega con normalidad.',
        },
        { term: 'Acción especial', text: 'Lo que permitan cartas, objetos o la aventura con el icono de acción: recoger un objetivo, hablar con un aldeano, accionar una palanca…' },
      ],
    },
    {
      title: 'Si estás fuera de combate',
      entries: [
        {
          term: 'Levantarse',
          text: 'Es lo único que puedes hacer en ese turno: tira 2 dados rojos, recupera 1 de daño por cada corazón y una fatiga por cada aumento, y pon tu figura donde estaba tu ficha. Después tu turno acaba. Pulsa «Fin del Turno» igualmente.',
        },
      ],
    },
    {
      title: 'Sin gastar acción',
      entries: [
        { text: 'Examinar en la app cualquier ficha o puerta, aunque no estés a su lado, antes de decidir.' },
        { text: 'Sufrir 1 fatiga por cada punto de movimiento extra, sin pasar de tu Aguante.' },
        { text: 'Intercambiar objetos con un héroe adyacente después de una acción de Mover. Las cartas de clase no se intercambian.' },
        { text: 'Gastar un aumento que te sobre en un ataque para recuperar 1 fatiga.' },
        { text: 'Con exactamente 2 héroes, cada uno puede hacer un ataque normal gratis por turno; si no lo hace, recupera 2 de daño al final de su turno.' },
      ],
    },
    {
      title: 'En la app',
      entries: [
        { term: 'Fin del Turno', text: 'En el retrato de cada héroe, al acabar su turno, también si está fuera de combate. Si no se pulsa, la ronda no avanza.' },
        { term: 'KO', text: 'En el retrato del héroe que queda fuera de combate: baja la moral. Cuando vuelve al mapa, el otro botón del retrato (Recuperar).' },
        { term: 'Derrotado', text: 'En el retrato del grupo de monstruos cuando cae el último. «Único Derrotado» si cae el monstruo único.' },
        { term: 'Información', text: 'En el retrato de un grupo: sus aclaraciones y en qué orden gasta los aumentos. «Forzar Activación», si la aventura lo pide.' },
        { term: 'Habilidades y Objetos', text: 'Los botones de abajo: las habilidades y la experiencia de cada héroe, y los objetos y el oro del grupo.' },
      ],
    },
  ],
  rules: [
    {
      title: 'La ronda',
      entries: [
        { text: 'El grupo elige un héroe que no haya jugado; juega su turno y pulsa «Fin del Turno». La app activa entonces un grupo de monstruos al azar de los que no se han activado. Se repite así, héroe y grupo.' },
        { text: 'Si un bando se queda sin turnos, el otro juega seguidos los que le quedan.' },
        { term: 'Final de la ronda', text: 'Cuando todos han jugado, se resuelven los efectos de final de ronda que diga la aventura (refuerzos, peligros…) y empieza otra. La app guarda la partida al empezar cada ronda.' },
        { text: 'Las habilidades «una vez por turno» de los héroes no se usan durante las activaciones de los monstruos.' },
      ],
    },
    {
      title: 'La activación de los monstruos',
      entries: [
        { term: 'Ventana', text: 'Un efecto especial para esta activación y la lista de acciones de los líderes («Maestro», figuras rojas) y de los esbirros («Esbirro», figuras beige), en el orden que diga.' },
        { term: 'Cada monstruo', text: 'Recorre la lista de arriba abajo y hace la primera acción que pueda, hasta hacer 2; si llega al final, vuelve a empezar. Solo 1 ataque por activación, salvo habilidades como Arrasar (Ravage).' },
        { term: 'Se salta', text: 'Lo que no puede hacer o no tendría efecto: moverse adonde ya está, atacar sin objetivo válido o sin línea de visión, un segundo ataque.' },
        { term: 'Divisar', text: 'Moverse hasta quedar a 3 casillas o menos del objetivo y con línea de visión.' },
        { term: 'Confrontar', text: 'Moverse hasta quedar adyacente al objetivo. Con Gran alcance (Reach), se detiene a 2 casillas con línea de visión.' },
        { term: 'Retirarse', text: 'Gastar el movimiento que le quede alejándose del enemigo más cercano.' },
        { term: 'Empates', text: 'Entre objetivos, el más cercano; si sigue el empate, decidís vosotros.' },
        { text: 'Al acabar los de un tipo, pulsad «Maestro Activado» o «Esbirro Activado».' },
      ],
    },
    {
      title: 'Movimiento y terreno',
      entries: [
        { term: 'Diagonales', text: 'Se mueve en diagonal, pero no por la esquina de una pared.' },
        { term: 'Agua', text: 'Entrar cuesta 2 puntos de movimiento.' },
        { term: 'Foso', text: 'Al entrar sufres 2 de daño. Dentro no gastas puntos de movimiento: sales con una acción a una casilla vacía adyacente.' },
        { term: 'Lava', text: 'Al entrar sufres 1 de daño, y quien acaba su turno dentro queda derrotado.' },
        { term: 'Obstáculo', text: 'Bloquea el movimiento y la línea de visión.' },
        { term: 'Monstruos', text: 'No pueden sufrir fatiga para moverse más. Evitan los fosos y la lava, y usan el agua solo si les sale más barato.' },
        { term: 'Monstruos grandes', text: 'Cuentan el movimiento desde una de sus casillas, como si fueran pequeños, y al acabar se colocan de forma que una de sus casillas sea la final.' },
      ],
    },
    {
      title: 'Línea de visión, casillas y adyacencia',
      entries: [
        { term: 'Línea de visión', text: 'Una recta de una esquina de tu casilla a una esquina de la del objetivo. La cortan las figuras, los obstáculos, las paredes y las puertas; tocar solo una esquina no la corta. Las casillas adyacentes siempre se ven.' },
        { term: 'Contar casillas', text: 'El camino más corto, sin contar la casilla de partida. Las figuras y el terreno que no es obstáculo no cuentan; no se cuenta a través de paredes ni puertas cerradas.' },
        { term: 'Adyacentes', text: 'Las casillas que comparten un lado o una esquina, salvo que las separe una pared o una puerta.' },
      ],
    },
    {
      title: 'Ataques',
      entries: [
        { term: 'Tirada', text: 'El atacante tira el dado azul y sus dados de potencia, y el defensor, los de defensa, todo a la vez. Una X en el dado azul es un fallo.' },
        { term: 'A distancia', text: 'La suma del alcance de los dados tiene que llegar a las casillas hasta el objetivo; contra uno adyacente hace falta al menos 1.' },
        { term: 'Aumentos', text: 'Cada aumento se gasta en una habilidad de aumento distinta, una vez cada una por ataque.' },
        { term: 'Daño', text: 'Los corazones sacados menos los escudos del defensor. Hacer 0 no es fallar. Un Estado de un aumento solo se aplica si el ataque hace al menos 1 de daño.' },
        { term: 'Explosión', text: 'Afecta también a todas las casillas adyacentes al objetivo. Contra varios monstruos, en Road to Legend el objetivo sufre todo el daño y los demás la mitad, redondeando hacia arriba, antes de los escudos.' },
        { term: 'Perforante X', text: 'Ignora X escudos.' },
      ],
    },
    {
      title: 'Pruebas de atributo',
      entries: [
        { text: 'Se tiran 1 dado gris y 1 negro y se cuentan los escudos: si son iguales o menos que el atributo (Fuerza, Conocimiento, Voluntad o Percepción), la prueba se supera.' },
        { text: 'Los monstruos líderes y esbirros fallan siempre; los lugartenientes tiran con sus atributos.' },
        { text: 'La app no tira dados: el texto dice qué pasa al superarla y al fallarla.' },
      ],
    },
    {
      title: 'Daño, fatiga, fuera de combate y moral',
      entries: [
        { term: 'Vida', text: 'Cuando el daño iguala o supera la Vida, la figura queda derrotada.' },
        { term: 'Fatiga', text: 'La que sufres por tu cuenta nunca pasa de tu Aguante. La que te obliga un efecto, si no cabe, la sufres como daño. Los monstruos sufren daño en vez de fatiga.' },
        { term: 'Fuera de combate', text: 'Sufres fatiga hasta tu Aguante, cambias tu figura por tu ficha de héroe, descartas tus Estados y, si era tu turno, se acaba. Pulsad «KO» en tu retrato.' },
        { term: 'Moral', text: 'Empieza igual al número de héroes y baja 1 con cada KO. Si está a 0 y cae otro héroe, huís y perdéis la aventura.' },
      ],
    },
    {
      title: 'Estados',
      entries: [
        { text: 'No se tienen dos copias del mismo. Las pruebas de los Estados se hacen al inicio del turno. Al quedar fuera de combate se descartan todos.' },
        { term: 'Envenenado', text: 'Prueba de Fuerza: si fallas, sufres 1 de daño y lo conservas.' },
        { term: 'Enfermo', text: 'Prueba de Voluntad: si fallas, sufres 1 fatiga y lo conservas.' },
        { term: 'Inmovilizado', text: 'No puedes hacer acciones de Mover. Se quita al final de tu turno.' },
        { term: 'Aturdido', text: 'La única acción que puedes hacer es descartarlo; después, la otra con normalidad.' },
        { term: 'En llamas', text: 'Al final de tu turno, tú y cada figura amiga adyacente sufrís 1 de daño. Se quita con una acción tuya o de alguien adyacente.' },
        { term: 'Maldito', text: 'No puedes usar acciones de habilidad. Se quita superando una prueba de Conocimiento al inicio del turno.' },
        { term: 'Debilitado', text: '1 escudo menos al defender y 1 corazón menos al atacar. Se quita al Descansar.' },
        { term: 'Sangrando', text: 'Sufres 1 fatiga por cada acción que no sea descartarlo.' },
        { term: 'Condenado', text: 'Cada vez que sufres daño, sufres 1 de daño más. Se quita gastando un aumento.' },
        { term: 'Aterrorizado', text: 'No puedes gastar aumentos. Se quita al final de tu turno si no ves a ningún enemigo.' },
      ],
    },
    {
      title: 'Héroes, equipo y búsqueda',
      entries: [
        { term: 'Valores', text: 'Velocidad (movimiento), Vida, Aguante (fatiga máxima), Defensa y los atributos Fuerza, Conocimiento, Voluntad y Percepción.' },
        { term: 'Proeza heroica', text: 'Una vez por aventura; al usarla, dale la vuelta a tu hoja.' },
        { term: 'Equipo', text: 'Dos manos (un arma a dos manos las ocupa), una armadura y dos objetos más. Solo se cambia al inicio de tu turno.' },
        { term: 'Agotar', text: 'Una carta usada se gira y no vuelve a servir hasta que la refrescas al inicio de tu turno.' },
        { term: 'Búsqueda', text: 'Las cartas de Búsqueda se descartan al acabar la aventura. El oro es de todo el grupo.' },
      ],
    },
    {
      title: 'Objetivo, victoria y derrota',
      entries: [
        { text: 'La aventura dice el objetivo y puede cambiarlo («Objetivo actualizado»). Se gana al cumplirlo.' },
        { text: 'Se pierde por moral o como diga la aventura. Si os entretenéis, al final de algunas rondas saltan peligros cada vez peores.' },
        { term: 'Al acabar', text: 'Los héroes recuperan todo el daño y la fatiga, ponen boca arriba su hoja y descartan Estados y cartas de Búsqueda. Se conservan el oro, la experiencia, los objetos y la fama.' },
      ],
    },
    {
      title: 'Cuando algo no está claro',
      entries: [
        { text: 'Las cartas mandan sobre las reglas generales, y las reglas de la aventura sobre todo lo demás.' },
        { text: 'Si un efecto admite varias opciones, decide el grupo. La app no comprueba ninguna regla: la aplicáis vosotros.' },
        { text: 'La app no sabe dónde están las figuras, su daño ni sus Estados: si guardáis a mitad de aventura, apuntadlo. El Historial («Log») guarda lo que ha dicho la app.' },
      ],
    },
  ],
};
