// Compares the editor's checks (packages/engine/src/QuestEditor/checks) with the validators of the skills
// mansiones-valkyrie and descent-valkyrie (herramientas/*/scripts/validar.py), which they come from, on the main quest
// of every downloaded scenario. Each validator message is given the code of the check that says the same; the
// counts of each code are compared quest by quest. Not ported from Valkyrie.
//
//   node tools/battery/checks-compare.ts [--game MoM|D2E] [--filter text] [--code code] [--python py]
//
// Python 3 runs the validators (on Windows, --python "py -3"); their output is kept in tests/battery/checks-python/.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { Application, ContentData, Directory, ExtractManager, File, SearchOption, ValkyrieDebug } from '../../packages/engine/src/index.ts';
import { checkPackage } from '../../packages/engine/src/QuestEditor/checks/PackageChecks.ts';
import { checkQuest, readQuestForChecks } from '../../packages/engine/src/QuestEditor/checks/QuestChecks.ts';
import type { Problem } from '../../packages/engine/src/QuestEditor/checks/Problem.ts';
import { createEnvironment, type GameName } from './environment.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const downloads = join(root, 'referencias', 'descargas');
const cache = join(root, 'tests', 'battery', 'checks-python');

const { values: args } = parseArgs({
  options: {
    game: { type: 'string', multiple: true },
    filter: { type: 'string' },
    code: { type: 'string' },
    python: { type: 'string', default: process.platform === 'win32' ? 'py -3' : 'python3' },
    show: { type: 'string', default: '8' },
  },
});

/** The validators' messages (Spanish) and the code of the check that says the same. Map checks are left out. */
const MESSAGES: [string, RegExp][] = [
  ['ini-space-line', /línea con solo espacios/],
  ['ini-section-empty-name', /sección vacía ignorada/],
  ['ini-section-repeated', /sección duplicada/],
  ['ini-data-outside', /dato fuera de sección/],
  ['ini-key-repeated', /clave duplicada '/],
  ['text-key-repeated', /clave repetida '/],
  ['text-line-no-comma', /línea sin coma ignorada/],
  ['text-file-unclosed', /bloque sin cerrar/],
  ['text-file-header', /la primera línea debe ser/],
  ['text-line-endings-mixed', /mezcla de finales/],
  ['quest-section-missing', /no tiene sección \[Quest\]/],
  ['file-letter-case', /\[Quest(Data|Text)\] cita '.*' pero el fichero se llama/],
  ['data-file-missing', /\[QuestData\] cita '.*' pero el fichero no existe/],
  ['text-file-missing', /\[QuestText\] cita '.*' pero el fichero no existe/],
  ['component-twice', /componente duplicado/],
  ['section-unknown', /con prefijo desconocido/],
  ['format-missing', /falta 'format='/],
  ['format-out-of-range', /fuera del rango admitido/],
  ['format-not-number', /^format='.*' no es un número/],
  ['type-wrong-subquest', /las aventuras de una campaña de Descent llevan/],
  ['type-wrong', /^type='.*': debe ser/],
  ['subquest-not-hidden', /subaventura sin hidden=True/],
  ['hidden', /hidden=True/],
  ['default-language-missing', /falta defaultlanguage/],
  ['default-language-unknown', /no es un idioma de Valkyrie/],
  ['default-language-no-file', /no hay fichero de localización con/],
  ['pack-unknown', /^pack '.*' desconocido/],
  ['pack-base', /no hace falta declarar/],
  ['pack-conversion-kit', /del kit de conversión/],
  ['pack-community', /pide el pack de la comunidad/],
  ['heroes-max-d2e', /admite como mucho 4 héroes/],
  ['heroes-min-over-max', /mayor que maxhero/],
  ['heroes-min-under-one', /minhero<1/],
  ['heroes-not-number', /minhero\/maxhero deben ser enteros/],
  ['difficulty-range', /debe estar entre 0 y 1/],
  ['difficulty-not-number', /^difficulty='.*' no es un número/],
  ['length-missing', /pon lengthmin\/lengthmax/],
  ['cover-spaces', /^image='.*' con espacios/],
  ['cover-missing', /la imagen de portada '.*' no existe/],
  ['cover-none', /sin imagen de portada/],
  ['folder-default-name', /la carpeta se llama/],
  ['folder-spaces', /el nombre de carpeta '.*' tiene espacios/],
  ['quest-text-missing', /^falta 'quest\.[a-z_]+' en la localización/],
  ['key-letter-case', /mal escrita: Valkyrie solo entiende|con mayúsculas incorrectas/],
  ['key-condition-case', /se escribe 'eventNCondition'/],
  ['key-unknown', /desconocida para [A-Za-z]+: Valkyrie la ignora/],
  ['position-comma', /usa coma decimal/],
  ['position-not-number', /^[xy]position='.*' no es un número/],
  ['position-not-on-square', /las casillas tienen coordenadas enteras/],
  ['rotation-not-right-angle', /^rotation=-?\d+: /],
  ['rotation-not-integer', /^rotation='.*' debe ser un entero/],
  ['operation-parts', /operación\/condición mal formada/],
  ['operation-extra-parts', /con más de 3 partes/],
  ['operation-operator', /^operador '.*' no válido en operations/],
  ['operation-read-only', /es de solo lectura/],
  ['test-comparison', /^comparador '.*' no válido/],
  ['test-no-operator', /dos condiciones seguidas sin VarTestsLogicalOperator/],
  ['test-operator-unknown', /operador lógico '/],
  ['test-parenthesis-unknown', /paréntesis '.*' no válido/],
  ['test-item-unknown', /no reconocido \((debe ser )?VarOperation/],
  ['test-parentheses-unpaired', /paréntesis desparejados/],
  ['conditions-ignored', /tiene 'conditions' y 'vartests'/],
  ['conditions-old', /usa 'conditions' \(formato antiguo\)/],
  ['token-tests-ignored', /las fichas IGNORAN vartests/],
  ['buttons-not-integer', /^buttons='.*' no es un entero/],
  ['silent-no-button', /pero sin buttons=1/],
  ['event-beyond-buttons', /se ignora porque buttons=/],
  ['quest-change-missing', /apunta al subescenario|la ruta es relativa a la carpeta del quest\.ini PRINCIPAL/],
  ['event-not-event', /\(no un evento\): se ignora/],
  ['event-missing', /^event\d+ apunta a '.*', que no existe/],
  ['event-list-first', /solo se ejecuta(rá)? el PRIMERO habilitado/],
  ['random-one-event', /randomevents=true con un solo evento/],
  ['condition-action-unknown', /ConditionAction='.*': usa disable, hide o none/],
  ['condition-action-alone', /ConditionAction sin event\d+Condition/],
  ['button-color', /^buttoncolor\d+='.*' no es un color válido/],
  ['silent-several-buttons', /evento silencioso con \d+ botones y sin condiciones/],
  ['event-no-text', /evento visible sin texto/],
  ['button-label-in-ini', /definido en el \.ini: el editor lo pierde/],
  ['button-no-label', /falta el texto del botón \d+/],
  ['puzzle-no-button', /texto del botón del puzle/],
  ['add-missing', /^add=.*: el componente no existe/],
  ['add-spawn', /los Spawn no se añaden con add/],
  ['add-not-board', /no se puede añadir/],
  ['add-several-items', /se entregan todos, pero la ventana no enseña/],
  ['add-opens-shop', /ABRE LA TIENDA/],
  ['remove-special-unknown', /especial desconocido/],
  ['remove-special-format', /necesita format≥20/],
  ['remove-missing', /^remove=.*: no existe ese componente/],
  ['add-remove-item', /^entrega y quita/],
  ['add-remove-same', /^añade y quita/],
  ['trigger-mom-only', /es de Mansiones: en Descent no se dispara nunca/],
  ['trigger-defeated-unique-mom', /'DefeatedUnique…' no se dispara en MoM/],
  ['trigger-defeated-unknown', /no es un tipo de monstruo, CustomMonster ni Spawn/],
  ['var-trigger-not-set-d2e', /ninguna operación de este escenario pone/],
  ['trigger-defeated-joined', /también trae .*se junta con ese grupo/],
  ['trigger-unknown', /desconocido: este evento nunca se disparará solo/],
  ['media-not-in-packs', /no está en el catálogo de Valkyrie/],
  ['media-letter-case', /existe como '.*': falla en Linux|el fichero existe con otras mayúsculas/],
  ['media-missing-fatal', /no existe en la carpeta del escenario → Valkyrie se cierra/],
  ['media-some-languages', /solo está en las carpetas de idioma/],
  ['media-missing', /no existe en la carpeta del escenario|no es un nombre de (audio|imagen) de Valkyrie ni un fichero del escenario/],
  ['media-spaces', /tiene espacios en el nombre/],
  ['media-sound-format', /Valkyrie solo reproduce \.ogg|un \.mp3 puede no sonar/],
  ['media-picture-format', /usa PNG o JPG/],
  ['music-spaces', /music= es una lista separada por espacios/],
  ['hero-event-missing', /^hero=.*: ese evento no existe/],
  ['quota-over-ten', /el selector llega a 10 por intento/],
  ['quota-no-second-button', /quota sin event2/],
  ['tile-no-side', /loseta sin 'side' ni 'customImage'/],
  ['tile-side-unknown', /^side=.* no existe en Valkyrie/],
  ['pack-undeclared-content', /es de la expansión .*, que no está en packs=/],
  ['tile-custom-image-format', /customImage en losetas necesita format=21/],
  ['token-no-type', /ficha sin type/],
  ['token-type-unknown', /^type=.* no existe \(se dibujará como TokenSearch/],
  ['token-size', /^tokensize='.*' no válido/],
  ['token-format', /tokensize\/customImage\/clickeffect en fichas necesitan format=21/],
  ['custom-image-backslash', /customImage='.*' usa barras invertidas|customImage(='.*')? con '\\'|image(place)? con '\\'/],
  ['door-color', /^color='.*' no es #RRGGBB/],
  ['ui-empty', /UI sin imagen ni texto/],
  ['ui-color', /^text(background)?color='.*' no es un color válido/],
  ['ui-halign', /^halign='/],
  ['ui-valign', /^valign='/],
  ['ui-text-alignment', /^textAlignment='/],
  ['spawn-no-monster', /Spawn sin monster ni traits/],
  ['spawn-monster-unknown', /^monster=.*: tipo desconocido/],
  ['spawn-no-declared-monster', /ningún monstruo de '.*' está en los packs declarados/],
  ['spawn-spawn-missing', /^monster=.*: ese Spawn no existe/],
  ['spawn-monster-none', /ninguno existe → el evento falla a medias/],
  ['spawn-traits-none', /ningún monstruo de los packs declarados tiene esos rasgos/],
  ['placement-over-four', /en Descent hay como mucho 4 héroes/],
  ['placement-missing', /ese MPlace no existe/],
  ['placement-not-mplace', /no es un MPlace/],
  ['placement-masters', /casillas de jefe \(master=true\)/],
  ['spawn-no-position', /tiene placementN pero no xposition/],
  ['spawn-silent', /^display=false: el grupo entra en juego/],
  ['spawn-placement-heroes', /^sin placement\d+: con \d+ héroes/],
  ['spawn-no-place', /Spawn sin posición ni placements/],
  ['unique-no-text', /unique=true sin '\.uniquetext'/],
  ['unique-title-unused', /titula al único «Maestro/],
  ['unique-no-title', /muestra la clave sin traducir como título/],
  ['spawn-health-not-number', /^uniquehealth(hero)?='.*' no es un número/],
  ['mplace-bool', /^(master|rotate)='.*' debe ser true o false/],
  ['monster-base-unknown', /^base=.*:? no es un monstruo de Valkyrie/],
  ['monster-no-category', /sin base ni rasgo de categoría/],
  ['monster-no-traits', /sin base ni traits: no tiene tamaño/],
  ['monster-no-activation', /sin base ni activation/],
  ['activation-event-missing', /^activation=Event.*: ese evento no existe/],
  ['activation-event-mixed', /activation mezcla un evento/],
  ['activation-none-valid', /no existe ninguna \(ni \[ActivationX\]|ninguna activación válida/],
  ['activation-missing', /^activation: no existen|^activation=.*: no existe Activation/],
  ['activation-all-tested', /todas sus \[Activation…\] tienen vartests/],
  ['activation-event-d2e', /no existe la forma «evento» de Mansiones/],
  ['activation-with-prefix', /se escribe sin el prefijo/],
  ['monster-event-missing', /^(evade|horror)event=.*: ese evento no existe/],
  ['attack-type', /^attacks: tipo '/],
  ['attack-format', /^attacks: '.*' \(formato/],
  ['attack-no-text', /^falta el texto '.*\.Attack_/],
  ['monster-no-name', /^falta '.*\.monstername'|sin '\.monstername' ni base/],
  ['monster-health-not-number', /^health(perhero)?='.*' no es un número/],
  ['monster-image-missing', /no existe: al colocar o mostrar el monstruo/],
  ['monster-key-mom-only', /es de Mansiones; en Descent no se usa/],
  ['activation-empty', /sin textos '\.master' ni '\.minion'/],
  ['activation-no-ability', /sin '\.ability'/],
  ['activation-ability-hero', /en '\.ability' es un HÉROE/],
  ['activation-both-first', /masterfirst y minionfirst a la vez/],
  ['item-starting-item', /StartingItem es el nombre antiguo/],
  ['item-no-starting', /sin 'starting='/],
  ['item-unknown', /^itemname=.*: objeto desconocido/],
  ['item-pack-undeclared', /es de la expansión .*, no declarada en packs=|es del pack .*, que no está en packs=/],
  ['item-nothing', /QItem sin itemname ni (traits|rasgos)/],
  ['item-inspect-missing', /^inspect=.*: ese evento no existe/],
  ['item-tests-not-starting', /vartests en un QItem solo sirve/],
  ['item-none-exists', /^itemname=.*: ningún objeto existe/],
  ['item-traits-none', /ningún objeto de los packs declarados tiene esos rasgos/],
  ['puzzle-class', /^class=('.*'|\w+): (debe ser|usa) slide/],
  ['puzzle-level-not-integer', /puzzlelevel\/puzzlealtlevel deben ser enteros/],
  ['puzzle-image-none', /puzle image sin image=/],
  ['puzzle-image-grid', /está pensada para \d+x\d+/],
  ['puzzle-solution-length', /^puzzlesolution tiene/],
  ['puzzle-solution-value', /^puzzlesolution: '/],
  ['puzzle-code-image', /en un código, image solo puede ser/],
  ['puzzle-skill', /^skill='.*' no es un icono/],
  ['puzzle-no-event', /puzle sin event1/],
  ['puzzle-image-missing-d2e', /puzle de imagen sin imagen en el escenario/],
  ['puzzle-slide-one', /class=slide con puzzlelevel=1/],
  ['start-none', /ningún evento (tiene|con) trigger=EventStart/],
  ['start-several', /eventos con trigger=EventStart/],
  ['end-no-eliminated', /ningún evento con trigger=Eliminated/],
  ['end-none', /ningún evento pone \$end,=,1/],
  ['end-no-time-limit', /no hay derrota por tiempo/],
  ['never-added', /nunca se añade al tablero/],
  ['never-run', /nunca se ejecuta: ningún disparador/],
  ['item-never-given', /no se entrega nunca/],
  ['unreached-events', /evento\(s\) que ningún disparador, botón ni ficha alcanza/],
  ['ui-stays', /se añade pero nunca se quita|esta UI se añade y ningún evento la quita/],
  ['var-trigger-none', /se pone a 1 pero ningún evento tiene trigger=Var/],
  ['var-trigger-not-set', /^trigger=Var.* pero ninguna operación modifica/],
  ['var-builtin-unknown', /no es una variable de Valkyrie conocida/],
  ['var-mythos-unfinished', /no uses 'mythosUnfinished'/],
  ['var-letter-case', /variables que solo difieren en mayúsculas/],
  ['var-never-set', /se comprueba .*pero (nunca se modifica|ninguna operación la cambia)/],
  ['var-builtin-unknown-d2e', /no es una variable de Valkyrie en Descent \(vale siempre 0\)/],
  ['var-campaign-own', /variable \$% propia/],
  ['var-dollar-unknown', /empieza por \$ pero no es una variable de Valkyrie en Descent/],
  ['var-eliminated-d2e', /#eliminated solo lo cambia el menú de Mansiones/],
  ['var-one-char', /de un solo carácter/],
  ['mythos-none', /no se activa ninguna variable \$mythos/],
  ['mythos-no-intensity', /solo hay variables de lugar \$mythos/],
  ['item-twice', /^da el mismo objeto/],
  ['item-drawn-before', /^puede sortear/],
  ['monster-figures', /apariciones de .* y la caja trae/],
  ['tile-both-sides', /las dos caras de la misma/],
  ['tile-side-twice', /se usa \d+ veces|aparece \d+ veces: en la caja solo hay una pieza/],
  ['text-long', /es muy largo/],
  ['text-component-missing', /\{c:.*\} no es un componente/],
  ['text-mark-unclosed', /que no se cierra \(falta su/],
  ['text-key-missing', /\{qst:.*\} no existe/],
  ['text-random-hero-button', /\{rnd:hero\} no se sustituye en botones/],
  ['text-symbol-d2e', /es un símbolo de Descent, no de MoM/],
  ['text-symbol-mad24', /\{MAD24\} no existe en Valkyrie/],
  ['text-mark-unknown', /marca \{.*\} desconocida/],
  ['text-symbol-mom', /es un símbolo de Mansiones; en Descent se verá tal cual/],
  ['text-ffg-unknown', /\{ffg:.*\} (no aparece en los content packs|no está entre las claves)/],
  ['texts-orphans', /claves de componentes que no existen/],
  ['texts-missing-language', /faltan \d+ textos respecto a/],
  ['shop-never-closed', /abre una tienda pero ningún evento hace remove=#shop/],
  ['mplace-unused', /MPlace que ningún Spawn usa/],
  ['pack-undeclared-tested', /sin declararlo en packs=; como comprueba/],
  ['pack-undeclared', /no está en packs= del escenario/],
  ['morale-no-defeat', /ningún evento con trigger=NoMorale/],
  ['morale-repeats', /el evento de NoMorale no termina la partida/],
  ['package-not-reached', /ninguna aventura del paquete salta a este quest\.ini/],
  ['package-english', /tras un cambio de aventura Valkyrie carga el idioma del jugador|sin traducir al inglés/],
  ['package-fame', /umbrales de fama|sortea los objetos al cargar la aventura/],
];

/** Python's codes that the TypeScript checks do not have. */
const NOT_PORTED = new Set<string>();
/** Checked only against the official import's texts, which the battery does not have. */
const NEEDS_IMPORT = new Set(['text-ffg-unknown']);
/** Descent's validator checks these with the map, which the comparison leaves out (--sin-mapa). */
const MAP_ONLY_D2E = new Set(['tile-side-twice', 'tile-both-sides']);
/** Differences looked at one by one, and why they stay; those of the validators were mended in the skills (24 October 2026). */
const EXPLAINED: Record<string, string> = {
  'spawn-placement-heroes': 'ours says no more of a spawn with no monster, which already breaks',
};

/** Codes of the TypeScript checks that are named differently by level (crashes that nothing reaches). */
const SAME_AS: Record<string, string> = {
  'monster-no-activation-unused': 'monster-no-activation',
  'activation-none-valid-unused': 'activation-none-valid',
  'custom-image-backslash-tile': 'custom-image-backslash',
  'media-sound-not-ogg': 'media-sound-format',
  'ui-stays-quest-change': 'ui-stays',
  'start-several': 'start-several',
  'package-english-missing': 'package-english',
  'package-fame-load': 'package-fame',
};

function pythonCode(said: string): string {
  // A text quoted in a message may hold line breaks
  const message = said.replace(/\n/g, ' ');
  for (const [code, re] of MESSAGES) {
    // Descent's validator says of a crash in a component nothing reaches: "Hoy no ocurre"
    if (re.test(message)) return /Hoy no ocurre: nada alcanza este componente/.test(message) ? code + '-unreached' : code;
  }
  return '?' + message.substring(0, 50);
}

function ourCode(problem: Problem): string {
  return SAME_AS[problem.code] ?? problem.code;
}

function filesWithExtension(folder: string, extension: string): string[] {
  if (!existsSync(folder)) return [];
  return readdirSync(folder).filter((f) => f.toLowerCase().endsWith(extension.toLowerCase())).sort().map((f) => join(folder, f));
}

/** The validator's findings for a package, from the cache or by running it on the package unpacked to a folder. */
function pythonFindings(game: GameName, id: string, files: Map<string, Uint8Array>): { nivel: string; donde: string; mensaje: string }[] {
  const out = join(cache, `${game}-${id}.json`);
  if (!existsSync(out)) {
    const folder = join(cache, 'unpacked', game, id);
    rmSync(folder, { recursive: true, force: true });
    for (const [path, bytes] of files) {
      mkdirSync(dirname(join(folder, path)), { recursive: true });
      writeFileSync(join(folder, path), bytes);
    }
    const skill = game === 'MoM' ? 'mansiones-valkyrie' : 'descent-valkyrie';
    const [command, ...pre] = args.python!.split(' ');
    const run = spawnSync(command!, [...pre, join(root, 'herramientas', skill, 'scripts', 'validar.py'), folder, '--json', '--sin-mapa'], {
      encoding: 'utf8',
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1', PYTHONIOENCODING: 'utf-8' },
      maxBuffer: 64 * 1024 * 1024,
    });
    mkdirSync(cache, { recursive: true });
    writeFileSync(out, run.stdout || '[]');
    rmSync(folder, { recursive: true, force: true });
  }
  const all = JSON.parse(readFileSync(out, 'utf8')) as { nivel: string; donde: string; mensaje: string }[];
  // The main quest and the package: a campaign's other quests are named "<folder>: " first
  return all.filter((x) => !/^[^ ]+: /.test(x.donde) || pythonCode(x.mensaje).startsWith('package-'));
}

interface Tally {
  ours: number;
  theirs: number;
  quests: string[];
  /** With --code: what each side says, in the quests where they differ. */
  detail: string[];
}

function main(): number {
  const games = (args.game ?? ['MoM', 'D2E']) as GameName[];
  const tally = new Map<string, Tally>();
  const level = new Map<string, Map<string, number>>();
  let quests = 0;
  for (const game of games) {
    const env = createEnvironment(game, join(root, 'packages', 'engine', 'data'), filesWithExtension(join(downloads, game, 'packs'), '.valkyrieContentPack'));
    for (const file of filesWithExtension(join(downloads, game, 'escenarios'), '.valkyrie')) {
      const id = basename(file, '.valkyrie');
      if (args.filter && !id.toLowerCase().includes(args.filter.toLowerCase())) continue;
      const download = ContentData.downloadPath() + '/' + basename(file);
      env.vfs.writeFile(download, () => readFileSync(file), statSync(file).size);
      const extracted = ExtractManager.extractSinglePackageFull(download);
      const questFiles = Directory.getFiles(extracted, 'quest.ini', SearchOption.AllDirectories).sort((a, b) => a.length - b.length);
      const main = questFiles[0]!;
      const mainDir = main.substring(0, main.length - '/quest.ini'.length);
      const files = new Map<string, Uint8Array>();
      for (const f of Directory.getFiles(mainDir, '*', SearchOption.AllDirectories)) files.set(f.substring(mainDir.length + 1), File.readAllBytes(f));

      Application.fatalErrors.length = 0;
      const stopLog = ValkyrieDebug.onLog(() => {});
      let ours: Problem[] = [];
      try {
        const { files: scenario, qd } = readQuestForChecks(main);
        ours = checkQuest({ game: env.game, files: scenario, qd });
        // One quest at a time: a package can hold hundreds, with large texts
        const each = function* () {
          for (const q of questFiles) yield { game: env.game, ...readQuestForChecks(q), root: mainDir };
        };
        ours.push(...checkPackage(env.game, each()));
      } catch (e) {
        console.log(`  ${game}/${id}: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        stopLog();
      }
      const theirs = pythonFindings(game, id, files);
      quests++;
      const count = new Map<string, [number, number]>();
      const said = new Map<string, string[]>();
      const say = (code: string, line: string) => {
        if (args.code !== code) return;
        const list = said.get(code) ?? [];
        list.push(line);
        said.set(code, list);
      };
      for (const p of ours) {
        const code = ourCode(p);
        if (game === 'D2E' && MAP_ONLY_D2E.has(code)) continue;
        const c = count.get(code) ?? [0, 0];
        c[0]++;
        count.set(code, c);
        const levels = level.get(code) ?? new Map<string, number>();
        levels.set('ours ' + p.level, (levels.get('ours ' + p.level) ?? 0) + 1);
        level.set(code, levels);
        say(code, `ours   ${p.where} ${p.key ?? ''} ${JSON.stringify(p.params ?? {})}`);
      }
      for (const x of theirs) {
        const code = pythonCode(x.mensaje);
        const c = count.get(code) ?? [0, 0];
        c[1]++;
        count.set(code, c);
        const levels = level.get(code) ?? new Map<string, number>();
        levels.set('theirs ' + x.nivel, (levels.get('theirs ' + x.nivel) ?? 0) + 1);
        level.set(code, levels);
        say(code, `theirs ${x.donde}: ${x.mensaje.substring(0, 140)}`);
      }
      for (const [code, [o, t]] of count) {
        const entry = tally.get(code) ?? { ours: 0, theirs: 0, quests: [], detail: [] };
        entry.ours += o;
        entry.theirs += t;
        if (o !== t) {
          entry.quests.push(`${game}/${id} ${o}/${t}`);
          for (const line of said.get(code) ?? []) entry.detail.push(`${game}/${id}: ${line}`);
        }
        tally.set(code, entry);
      }
      env.vfs.deleteDirectory(extracted);
      env.vfs.deleteFile(download);
    }
  }
  const show = Number(args.show);
  let same = 0;
  let differ = 0;
  let explained = 0;
  const lines: string[] = [];
  for (const [code, t] of [...tally].sort((a, b) => b[1].quests.length - a[1].quests.length || a[0].localeCompare(b[0]))) {
    if (args.code && code !== args.code) continue;
    const levels = [...(level.get(code) ?? [])].map(([k, n]) => `${k} ${n}`).join(', ');
    if (t.quests.length === 0) {
      same++;
      lines.push(`  =  ${code}: ${t.ours} (${levels})`);
      continue;
    }
    differ++;
    if (EXPLAINED[code] !== undefined || NOT_PORTED.has(code) || NEEDS_IMPORT.has(code)) explained++;
    const note = NOT_PORTED.has(code) ? ' (not ported yet)' : NEEDS_IMPORT.has(code) ? ' (needs the official import)' : EXPLAINED[code] !== undefined ? ` (explained: ${EXPLAINED[code]})` : '';
    lines.push(`  ≠  ${code}${note}: ours ${t.ours}, theirs ${t.theirs}, in ${t.quests.length} quests (${levels})`);
    for (const q of t.quests.slice(0, show)) lines.push(`       ${q}`);
    for (const d of t.detail.slice(0, show * 10)) lines.push(`         ${d}`);
  }
  console.log(`Checks compared with the skills' validators on ${quests} main quests: ${same} codes the same, ${differ} different (${explained} of them explained, ${differ - explained} to look at)`);
  console.log(lines.join('\n'));
  return 0;
}

process.exitCode = main();
