// Mansions' help in Spanish (RulesHelp.tsx): the app's own words, not FFG's, from the rules the mansiones-valkyrie skill
// gathers, with the app's buttons as Valkyrie names them in Spanish. Not in Valkyrie.
import type { RulesHelpText } from './types.ts';

export const help: RulesHelpText = {
  actionsIntro:
    'En tu turno haces hasta 2 acciones, en el orden que quieras, y puedes repetir la misma (moverte dos veces son hasta 4 espacios). El grupo decide quién juega cada turno.',
  actions: [
    {
      title: 'Acciones',
      entries: [
        {
          term: 'Moverse',
          text: 'Hasta 2 espacios, de uno en uno. Puedes partir el movimiento: mover 1, hacer otra acción y mover el otro. No se cruzan paredes, bordes discontinuos ni puertas con una Obstrucción o una ficha de Exploración.',
        },
        { term: 'Explorar', text: 'Pulsa una ficha de Exploración de tu espacio o de la puerta junto a la que estás. La app dice qué colocar.' },
        { term: 'Buscar', text: 'Pulsa una ficha de Búsqueda de tu espacio.' },
        { term: 'Interactuar', text: 'Pulsa una ficha de Interacción o de Personaje de tu espacio y elige una opción con el icono de acción.' },
        {
          term: 'Intercambiar',
          text: 'Da, recoge o suelta todos los Objetos y Hechizos que quieras con los investigadores de tu espacio. Recoger algo del suelo también cuesta esta acción. Las Pistas no se intercambian.',
        },
        {
          term: 'Atacar',
          text: 'Elige el monstruo en la lista de monstruos, pulsa «Atacar» y el tipo de arma. Cuerpo a cuerpo o sin arma, en tu espacio; a distancia, hasta 3 espacios. Apunta el Daño con + y −.',
        },
        { term: 'Componente', text: 'Usa un efecto «Acción:» de una carta, o un objeto del inventario (la mochila o «Objs.», abajo a la izquierda).' },
        {
          term: 'Obstrucción',
          text: 'Pon la Obstrucción de tu espacio contra una puerta o un Pasadizo secreto, o apártala. Desde el otro lado de la puerta: tirada de Fuerza; con 2 Éxitos la apartas y pasas.',
        },
        { term: 'Apagar el Fuego', text: 'Tirada de Agilidad: cada Éxito descarta 1 Fuego de tu espacio o de uno al que entres en este turno.' },
      ],
    },
    {
      title: 'Poco habituales (sobre todo con una carta de Loco)',
      entries: [
        {
          term: 'Empujar',
          text: 'Mueve 1 espacio a un monstruo o investigador de tu espacio. Tirada de Fuerza contra la Agresividad del monstruo, o contra el resultado + 1 del investigador si se resiste. Si lo consigues, puedes seguirle.',
        },
        { term: 'Robar', text: 'Elegís Fuerza, Agilidad u Observación y tiráis los dos. Te llevas 1 pertenencia por cada Éxito que saques de más.' },
        {
          term: 'Prender fuego',
          text: 'Con una Fuente de luz, pon Fuego en tu espacio o en uno adyacente. Si no había Fuego, pulsa «Set» (el pergamino de abajo) → «Prender fuego» para que la app lo propague.',
        },
      ],
    },
    {
      title: 'Sin gastar acción',
      entries: [
        { text: 'Las fichas de Vistazo (la del ojo).' },
        { text: 'Las opciones de la app que no llevan el icono de acción: pulsar una ficha para leerla no te obliga a nada.' },
        { text: 'Las capacidades que no dicen «Acción:».' },
      ],
    },
    {
      title: 'Recuerda',
      entries: [
        {
          term: 'Evasión',
          text: 'En el espacio de un monstruo, antes de cualquier acción que no sea Atacar o Moverte, y para salir de él: elige el monstruo de mayor Percepción (número verde) y pulsa «Esquivar». Si fallas, sueles renunciar a la acción.',
        },
        { term: 'Herido', text: 'Solo puedes hacer una acción de Movimiento por ronda.' },
        { term: 'Fuego', text: 'Entrar en un espacio con Fuego, o hacer o renunciar a una acción en él, causa 1 Daño boca abajo.' },
        { term: 'Oscuridad', text: 'No puedes gastar Pistas, salvo con una Fuente de luz o Fuego en tu espacio o en uno adyacente.' },
      ],
    },
  ],
  rules: [
    {
      title: 'Antes de empezar',
      entries: [
        { text: 'Baraja por separado los mazos de Daño y de Horror y déjalos boca abajo.' },
        { text: 'Ordena por nombre, boca arriba, los Objetos comunes, los Objetos únicos, los Hechizos y los Estados.' },
        { text: 'Separa las fichas por tipo. La app dice qué módulos, fichas y monstruos colocar y cuándo.' },
        { text: 'Las pertenencias iniciales se reparten como queráis; las Pistas, como diga la app. Leed el prólogo: puede tener pistas de la historia.' },
      ],
    },
    {
      title: 'La ronda',
      entries: [
        { term: 'Fase de los Investigadores', text: 'Cada investigador juega un turno entero de hasta 2 acciones, en el orden que decida el grupo. Al acabar todos, pulsad el botón ➤ de abajo a la derecha.' },
        { term: 'Fase de los Mitos', text: 'Por este orden:' },
        { term: '1. Fuego', text: 'Si hay Fuego, se añade 1 ficha en total (no una por foco) en un espacio adyacente a otro con Fuego.' },
        { term: '2. Eventos', text: 'La app muestra uno o más Eventos de los Mitos, que resolvéis según su texto.' },
        { term: '3. Monstruos', text: 'La app activa cada monstruo, uno tras otro.' },
        { term: '4. Horror', text: 'Cada investigador hace una tirada de Horror contra el monstruo con más Horror dentro de su alcance, si lo hay.' },
        { text: 'Pulsad ➤ y empieza una ronda nueva. El tiempo corre aunque no se vea: la app decide cuándo es tarde.' },
      ],
    },
    {
      title: 'Tiradas',
      entries: [
        { term: 'Dados', text: 'Tantos como el atributo, con los modificadores (mínimo 1). Cada dado tiene 3 caras de Éxito, 2 de Investigación (la lupa) y 3 vacías.' },
        { term: 'Resultado', text: 'El número de Éxitos. «(Agilidad −1; 2)» es una tirada de Agilidad con un dado menos que necesita 2 Éxitos.' },
        { term: 'Pistas', text: 'Después de tirar, cada Pista que gastes convierte 1 lupa en Éxito. No es repetir dados.' },
        { term: 'Anular', text: 'Si el texto dice «anulado por…», cada Éxito evita 1 Daño o 1 Horror.' },
        { term: 'Lanzar dados', text: 'Si el texto solo dice «lanza X dados», no es una tirada: no se pueden gastar Pistas.' },
        { text: 'Solo tira el investigador activo, salvo que un efecto diga otra cosa.' },
      ],
    },
    {
      title: 'Daño, Horror, Herido y Loco',
      entries: [
        { term: 'Cartas', text: 'Sufrir Daño u Horror es robar una carta de su mazo, boca arriba salvo que se diga «boca abajo». Las boca abajo no hacen nada: solo cuentan.' },
        { term: 'Boca arriba', text: '«Resolver inmediatamente» se aplica al recibirla; «Mantener boca arriba» tiene efecto mientras siga así. Si hay que girar cartas boca abajo, se eligen al azar.' },
        { term: 'Herido', text: 'Cuando el Daño total alcanza tu Vida: ganas Herido y descartas el Daño boca abajo. Solo puedes moverte una vez por ronda.' },
        { term: 'Loco', text: 'Lo mismo con el Horror y la Cordura. Lee en secreto el reverso de tu carta de Loco: puede cambiar cómo ganas. Si pide más investigadores de los que hay, toma otra.' },
        { term: 'Eliminado', text: 'Si, ya Herido o Loco, vuelves a alcanzar el límite: sueltas tus pertenencias y retiras tu figura. Pulsad «Set» (el pergamino de abajo) → «Investigador eliminado». Los demás pierden al final de la siguiente Fase de los Investigadores si no han terminado.' },
      ],
    },
    {
      title: 'Monstruos',
      entries: [
        { term: 'Ficha', text: 'Percepción (verde): a cuál se esquiva. Horror (azul): contra cuál se tira Horror. Agresividad (rojo, en el reverso): dados contra Obstrucciones y dificultad para empujarlo. La Vida la lleva la app.' },
        { term: 'Activación', text: 'Haced lo que diga la app. «Hacia» significa que cada paso le acerca; se para al llegar a su objetivo. Si no hay objetivo a su alcance, no se mueve: pulsad el botón de que no hay investigadores y la app da otra orden.' },
        { term: 'Puertas', text: 'Las cruzan como si nada, salvo que estén obstruidas: entonces lanzan tantos dados como su Agresividad y con 2 Éxitos rompen la Obstrucción; si no, pierden el movimiento (pero atacan si ya están con alguien).' },
        { term: 'Tirada de Horror', text: 'Solo en el paso de Horror. Si varios investigadores la hacen contra el mismo monstruo, la app la muestra una vez y cada uno tira y aplica la suya.' },
        { term: 'Fuego', text: 'Un monstruo que empieza su activación en Fuego, o entra en él, sufre 1 Daño.' },
      ],
    },
    {
      title: 'El mapa y el alcance',
      entries: [
        { term: 'Espacios', text: 'Bordes continuos (blancos o amarillos): se cruzan. Bordes discontinuos: no se cruzan, pero el alcance los atraviesa. Paredes: ni se cruzan ni las atraviesa nada. Puertas: se cruzan, pero el alcance no pasa por ellas.' },
        { term: 'Alcance', text: 'Hasta 3 espacios, contando el tuyo como 0. Puede doblar esquinas: no hay línea de visión. No atraviesa paredes, puertas ni Pasadizos secretos.' },
        { term: 'Adyacente', text: 'Los efectos sobre espacios adyacentes (luz, propagación del Fuego) pasan por puertas, nunca por paredes.' },
        { term: 'Pasadizo secreto', text: 'Todos los espacios con Pasadizo secreto son adyacentes entre sí para moverse.' },
        { term: 'Norte', text: 'Es siempre la parte de arriba de la pantalla.' },
        { term: 'Interior y exterior', text: 'Las habitaciones exteriores tienen la placa del nombre plateada con tentáculos rojos. Algunos eventos las distinguen.' },
      ],
    },
    {
      title: 'Fuego, Oscuridad y Obstrucciones',
      entries: [
        { term: 'Fuego', text: 'No puede haber 2 en el mismo espacio. Se propaga por puertas, no por paredes; las Obstrucciones no lo detienen. Si lo apagas con tu acción, ese Fuego ya no te hace Daño.' },
        { term: 'Oscuridad', text: 'En su espacio no se gastan Pistas, ni para tiradas ni para rompecabezas. Una Fuente de luz o un Fuego en tu espacio o en uno adyacente la anula.' },
        { term: 'Obstrucción', text: 'Ni investigadores ni monstruos pasan por una puerta o Pasadizo obstruido. No impide que aparezcan monstruos.' },
      ],
    },
    {
      title: 'Objetos, Hechizos y Estados',
      entries: [
        { term: 'Pertenencias', text: 'Son los Objetos comunes, los únicos y los Hechizos. Las Pistas, los Estados, el Daño y el Horror no lo son.' },
        { term: 'Objetos', text: 'Puedes mirar su reverso cuando quieras. Si un objeto está girado, su reverso sustituye al anverso.' },
        { term: 'Hechizos', text: 'Recibes una copia al azar y nunca miras su reverso. Al lanzarlo le das la vuelta, resuelves el reverso y casi siempre lo descartas y ganas otra copia.' },
        { term: 'Estados', text: 'Boca arriba y sin copias repetidas. Aturdido: solo 1 acción en tu turno. Desconcertado: no gastas Pistas. Retenido: no te mueves por tu cuenta. Concentrado: descártalo para que todas tus lupas sean Éxitos.' },
        { term: 'Armas', text: 'Para atacar con un tipo de arma tienes que llevar una de ese tipo. Sin arma siempre se puede.' },
      ],
    },
    {
      title: 'Rompecabezas',
      entries: [
        { term: 'Pasos', text: 'Tantos como el valor impreso del atributo que pide la app, más 1 por cada Pista que gastes (no en Oscuridad). La app no los cuenta: contadlos vosotros.' },
        { term: 'Cerrar', text: 'Si se acaban los pasos, pulsa «Cerrar»: el progreso se guarda y otro puede seguir más tarde con otra acción. Podéis aconsejaros.' },
        { term: 'Mosaico', text: 'Recompón la imagen cambiando dos piezas vecinas por paso.' },
        { term: 'Mecanismo', text: 'Desliza bloques, uno por paso, hasta sacar la pieza objetivo por la derecha.' },
        { term: 'Código', text: 'Propón un código por paso. Un Éxito por cada símbolo en su sitio; una lupa por cada símbolo bueno en otro sitio.' },
        { term: 'Torre', text: 'Mueve la pieza de arriba de una columna a otra hasta apilarlas todas, de mayor a menor.' },
      ],
    },
    {
      title: 'Expansiones',
      entries: [
        { term: 'Llave', text: 'Un objeto con una ficha de Llave gana los rasgos Llave y Prueba y no se puede descartar, pero sí intercambiar o robar.' },
        { term: 'Módulos que se mueven o se solapan', text: 'Se mueven con todo lo que llevan encima. Uno encima de otro nunca tapa un espacio entero; lo tapado deja de ser tablero.' },
        { term: 'Elixires', text: 'Se ganan al azar y no se mira el reverso hasta que un efecto los gire. Boca arriba son pertenencias; boca abajo, no.' },
        { term: 'Mejoras', text: '+1 al valor impreso de un atributo, una vez por atributo. No son pertenencias.' },
        { term: 'Contención', text: 'No hace falta esquivar a un monstruo en su espacio. Al activarse ese monstruo podéis descartarla para que no se mueva.' },
        { term: 'Escombros', text: 'Impiden Buscar, Explorar e Interactuar. Tirada de Fuerza: 1 ficha por Éxito; con un Arma pesada se quitan todas.' },
        { term: 'Maleza', text: 'Para salir, tirada de Observación con dificultad igual al número de fichas; si fallas, sueltas un objeto al azar. Un Arma de filo las quita; el Fuego también.' },
        { term: 'Agua', text: 'Al entrar pierdes el resto del movimiento (salvo monstruos acuáticos, voladores o incorpóreos). Apaga el Fuego.' },
        { term: 'Brecha dimensional', text: 'Hacer una acción que no sea moverte en su espacio te deja Perdido en el tiempo y el espacio. Tirada de Saber para cerrarlas: 1 por Éxito.' },
      ],
    },
    {
      title: 'Cuando algo no está claro',
      entries: [
        { text: 'Si un efecto puede afectar a varios investigadores, o varios ocurren a la vez, el grupo decide. Si no os ponéis de acuerdo, decide un investigador al azar.' },
        { text: 'Los efectos sobre un investigador eliminado se aplican en lo posible.' },
        { text: 'El Historial (el libro o «Log», abajo) guarda todo lo que ha dicho la app, por rondas.' },
      ],
    },
  ],
};
