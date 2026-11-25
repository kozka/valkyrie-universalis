// The editor's checks of one quest: what Valkyrie would do with each thing that is not right, from a crash to a
// suggestion. Not ported from Valkyrie, whose Validate button does nothing in 3.28: the checks come from the validators
// of the skills mansiones-valkyrie and descent-valkyrie (validar.py), written from Valkyrie's code, and each one says
// in a comment what Valkyrie does. They read the files as Valkyrie reads them (ScenarioFiles) and the quest as Valkyrie
// loads it (QuestData), and give codes with their values: the editor shows the text of each code in the player's
// language. A campaign's checks across its quests are in PackageChecks.ts.
import { ActivationData, AudioData, ClassData, HeroData, ImageData, ItemData, MonsterData, PuzzleData, TileSideData, TokenData } from '../../Content/ContentTypes.ts';
import type { DictionaryI18n } from '../../Content/DictionaryI18n.ts';
import { LocalizationRead } from '../../Content/LocalizationRead.ts';
import { QuestData } from '../../Content/QuestData.ts';
import { QuestFormat } from '../../Content/FormatVersions.ts';
import type { Game } from '../../Game.ts';
import { Quest } from '../../Quest/Quest.ts';
import { VarOperation } from '../../Quest/VarTests.ts';
import { Application } from '../../platform/Application.ts';
import { File, Path } from '../../platform/SystemIO.ts';
import { normalizePath } from '../../platform/VirtualFileSystem.ts';
import { Problems, type Problem } from './Problem.ts';
import { endsGame, QuestGraph } from './QuestGraph.ts';
import { componentType, EVENT_TYPES, type RawComponent, ScenarioFiles } from './ScenarioFiles.ts';

const LANGUAGES = ['English', 'Spanish', 'German', 'French', 'Italian', 'Polish', 'Portuguese', 'Russian', 'Chinese', 'Czech', 'Japanese', 'Korean', 'Ukrainian'];

// The keys each type reads (QuestData.cs); any other is ignored by Valkyrie and dropped by its editor on save
const QC_KEYS = ['xposition', 'yposition', 'comment', 'operations', 'vartests', 'conditions'];
const EVENT_KEYS = [...QC_KEYS, 'display', 'highlight', 'buttons', 'hero', 'quota', 'minhero', 'maxhero', 'add', 'remove', 'trigger', 'randomevents', 'mincam', 'maxcam', 'audio', 'music'];
const TYPE_KEYS: Record<string, readonly string[]> = {
  Event: EVENT_KEYS,
  Tile: [...QC_KEYS, 'side', 'rotation', 'customImage', 'top', 'left'],
  Door: [...EVENT_KEYS, 'rotation', 'color'],
  Token: [...EVENT_KEYS, 'type', 'rotation', 'tokensize', 'clickeffect', 'customImage'],
  UI: [...EVENT_KEYS, 'image', 'fadespeed', 'vunits', 'size', 'textsize', 'textaspect', 'textcolor', 'textbackgroundcolor', 'halign', 'valign', 'textAlignment', 'richText', 'border', 'clickeffect'],
  Spawn: [...EVENT_KEYS, 'monster', 'traits', 'traitpool', 'unique', 'activated', 'uniquehealth', 'uniquehealthhero'],
  MPlace: [...QC_KEYS, 'master', 'rotate', 'tokensize'],
  Puzzle: [...EVENT_KEYS, 'class', 'image', 'fadespeed', 'skill', 'puzzlelevel', 'puzzlealtlevel', 'puzzlesolution'],
  CustomMonster: [...QC_KEYS, 'base', 'traits', 'image', 'imageplace', 'activation', 'health', 'healthperhero', 'evadeevent', 'horrorevent', 'horror', 'awareness', 'attacks'],
  Activation: [...QC_KEYS, 'minionfirst', 'masterfirst'],
  QItem: [...QC_KEYS, 'itemname', 'starting', 'traits', 'traitpool', 'inspect'],
};
const EVENT_PATTERNS = [/^event\d+$/, /^event\d+Condition$/, /^event\d+ConditionAction$/, /^buttoncolor\d+$/, /^button\d+$/];
const KEY_FIXES: Record<string, string> = {
  tokenSize: 'tokensize',
  TokenSize: 'tokensize',
  customimage: 'customImage',
  CustomImage: 'customImage',
  textalignment: 'textAlignment',
  richtext: 'richText',
  RichText: 'richText',
  clickEffect: 'clickeffect',
  fadeSpeed: 'fadespeed',
  puzzleLevel: 'puzzlelevel',
  puzzleAltLevel: 'puzzlealtlevel',
  varTests: 'vartests',
  Operations: 'operations',
  Trigger: 'trigger',
  Display: 'display',
  Buttons: 'buttons',
  imagePlace: 'imageplace',
  evadeEvent: 'evadeevent',
  horrorEvent: 'horrorevent',
  healthPerHero: 'healthperhero',
  uniqueHealth: 'uniquehealth',
  uniqueHealthHero: 'uniquehealthhero',
  randomEvents: 'randomevents',
  minHero: 'minhero',
  maxHero: 'maxhero',
  xPosition: 'xposition',
  yPosition: 'yposition',
  Rotation: 'rotation',
  Type: 'type',
  Color: 'color',
  colour: 'color',
  Master: 'master',
  Rotate: 'rotate',
  minionFirst: 'minionfirst',
  masterFirst: 'masterfirst',
  Placement2: 'placement2',
};
const SPECIAL_REMOVE = new Set(['#monsters', '#boardcomponents', '#shop', '#uicomponents', '#doors', '#tiles', '#tokens', '#qitems']);
const MOM_TRIGGERS = new Set(['EventStart', 'StartRound', 'EndRound', 'EndInvestigatorTurn', 'Mythos', 'BeforeMonsterActivation', 'StartFinalRound', 'Eliminated', 'NoMorale']);
const D2E_TRIGGERS = new Set(['EventStart', 'StartRound', 'EndRound', 'NoMorale']);
const COLOR_NAMES = new Set([
  'black',
  'white',
  'red',
  'lime',
  'blue',
  'yellow',
  'aqua',
  'cyan',
  'magenta',
  'fuchsia',
  'silver',
  'gray',
  'grey',
  'maroon',
  'olive',
  'green',
  'purple',
  'teal',
  'navy',
  'transparent',
]);
const TOKEN_SIZES = new Set(['small', 'medium', 'huge', 'massive', 'Original']);
const ATTACK_TYPES = new Set(['heavy', 'bladed', 'firearm', 'spell', 'unarmed']);
const MONSTER_CATEGORIES = new Set(['humanoid', 'beast', 'spirit', 'fleshless', 'snakeperson', 'horror']);
const MOM_SYMBOLS = new Set(['will', 'strength', 'agility', 'lore', 'influence', 'observation', 'success', 'clue', 'action']);
const MOM_PACK_SYMBOLS = new Set(['MAD01', 'MAD06', 'MAD09', 'MAD20', 'MAD21', 'MAD22', 'MAD23', 'MAD25', 'MAD26', 'MAD27', 'MAD28']);
const D2E_WRITTEN = new Set([
  '$end',
  '$restock',
  '$perilMinor',
  '$perilMajor',
  '$perilDeadly',
  '$%morale',
  '$%xp',
  '$%gold',
  '$%sellratio',
  '$%fame',
  '$%famenoteworthy',
  '$%fameimpressive',
  '$%famecelebrated',
  '$%fameheroic',
  '$%famelegendary',
  '$@travelevent',
]);
const D2E_READ = new Set(['#round', '#heroes', '#monsters']);
const NUMBER = /^-?\d+(\.\d+)?$/;
/** Monsters of each kind in their box (the skill's expansiones.md §14): more spawns than figures need care. */
const FIGURES: Record<string, number> = {
  MonsterCultist: 6,
  MonsterDeepOne: 4,
  MonsterDeepOneHybrid: 4,
  MonsterGhost: 2,
  MonsterHuntingHorror: 2,
  MonsterRiot: 2,
  MonsterStarSpawn: 2,
  MonsterChildOfDagon: 1,
  MonsterPriestOfDagon: 1,
  MonsterZombie: 4,
  MonsterCthonian: 2,
  MonsterHoundOfTindalos: 2,
  MonsterManiac: 2,
  MonsterMiGo: 2,
  MonsterShoggoth: 2,
  MonsterWitch: 2,
  MonsterCultLeader: 2,
  MonsterByakhee: 2,
  MonsterCrawlingOne: 2,
  MonsterChildOfTheGoat: 2,
  MonsterDarkDruid: 2,
  MonsterDarkYoung: 1,
  MonsterGoatSpawn: 2,
  MonsterNightgaunt: 2,
  MonsterDunwichHorror: 1,
  MonsterWizard: 1,
  MonsterThrall: 4,
  MonsterSkeleton: 2,
  MonsterHiredGun: 2,
  MonsterLloigor: 1,
  MonsterStarVampire: 2,
  MonsterWraith: 2,
  MonsterWarlock: 2,
  MonsterDimensionalShambler: 2,
  MonsterHuntingDeepOne: 2,
  MonsterFormlessSpawn: 1,
  MonsterFeatheredSerpent: 2,
  MonsterTempleGuardian: 2,
  MonsterSerpentPerson: 3,
  MonsterAncientBasilisk: 1,
};

function isColor(value: string): boolean {
  const v = value.trim().replace(/^"+|"+$/g, '');
  return COLOR_NAMES.has(v.toLowerCase()) || /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(v);
}

const isTrue = (value: string | undefined) => (value ?? '').trim().toLowerCase() === 'true';
const words = (value: string | undefined) => (value ?? '').split(' ').filter((w) => w !== '');

/**
 * The lookups of a text as LocalizationRead.DictLookup finds them: "{dict:" for any dictionary loaded, then on to the
 * bracket that closes it. The key is all of it, or what comes before the first ':' outside brackets when it holds
 * brackets (DictQuery). A key of null is a lookup that is never closed, where DictLookup reads past the end and throws.
 */
export function lookups(text: string, dictionaries: readonly string[]): { dict: string; key: string | null }[] {
  const found: { dict: string; key: string | null }[] = [];
  const pattern = new RegExp('\\{(' + dictionaries.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + '):', 'g');
  for (const m of text.matchAll(pattern)) {
    // DictLookup takes every dictionary's name to have three letters, and looks for the end from the second character on
    const start = m.index + 5;
    const dict = text.substring(m.index + 1, m.index + 4);
    let level = 1;
    let end = start;
    while (level > 0 && end < text.length) {
      end++;
      if (text[end] === '{') level++;
      if (text[end] === '}') level--;
    }
    if (level > 0) {
      found.push({ dict, key: null });
      continue;
    }
    const input = text.substring(start, end);
    let key = input;
    if (input.includes('{')) {
      let depth = 0;
      for (let i = 0; i < input.length; i++) {
        if (input[i] === '{') depth++;
        if (input[i] === '}') depth--;
        if (input[i] === ':' && depth === 0) {
          key = input.substring(0, i);
          break;
        }
      }
    }
    found.push({ dict, key });
  }
  return found;
}

/** What the checks of one quest look at. */
export interface QuestCheckInput {
  game: Game;
  files: ScenarioFiles;
  /** The quest as Valkyrie loads it: the editor's own, or one read for the checks; null when it cannot be loaded. */
  qd: QuestData | null;
  /** Why it cannot be loaded. */
  error?: string;
  /** The package's main folder, where a change of quest looks for its quest.ini; the quest's own by default. */
  root?: string;
}

/** The checks of one quest. */
export function checkQuest(input: QuestCheckInput): Problem[] {
  if (input.qd === null) {
    // Valkyrie stops loading it: only what reading the files found can be said
    const reason: Problem = { level: 'breaks', code: 'quest-cannot-load', where: '', params: { reason: input.error ?? '' } };
    return [...input.files.problems.list, reason];
  }
  const check = new QuestCheck({ ...input, qd: input.qd });
  check.run();
  return [...input.files.problems.list, ...check.problems.list];
}

/** What the checks of a whole package (PackageChecks) need from each of its quests. */
export interface QuestFacts {
  /** The quest.ini each change of quest goes to, as a path. */
  switches: string[];
  /** Descent: items drawn by traits only among items with a minimum fame. */
  fameItems: string[];
  /** Descent: events that set a fame threshold ($%famenoteworthy… $%famelegendary). */
  fameEvents: string[];
  /** Descent: an operation $restock,=,1, which draws the items again. */
  restocks: boolean;
}

/** What the checks of a whole package need from one quest that loads. */
export function questFacts(input: QuestCheckInput & { qd: QuestData }): QuestFacts {
  return new QuestCheck(input).facts();
}

class QuestCheck {
  readonly problems = new Problems();
  private readonly game: Game;
  private readonly files: ScenarioFiles;
  private readonly qd: QuestData;
  private readonly graph: QuestGraph;
  private readonly root: string;
  private readonly isRoot: boolean;
  private readonly mom: boolean;
  private readonly raw: ReadonlyMap<string, RawComponent>;
  private readonly declared: Set<string>;
  private format = 0;
  /** Components added by an event, with the events that add them. */
  private readonly added = new Map<string, string[]>();
  private readonly removed = new Map<string, string[]>();
  private readonly startEvents: string[] = [];
  /** Descent: the monster a spawn brings, when it names its monsters without traits (Quest.RuntimeMonsterSelection). */
  private readonly spawnMonster = new Map<string, string>();
  /** Spawns and the components that bring them in, for Descent's unreached crashes (latent). */
  private readonly reached: Set<string>;
  /** The official texts, from the import: without it, {ffg:…} keys cannot be checked. */
  private readonly ffg: DictionaryI18n | null;
  /** The dictionaries a text can look a key up in while playing: the scenario's, Valkyrie's, the import's and the packs'. */
  private readonly dictionaries = [...new Set(['ffg', 'val', 'qst', ...LocalizationRead.dicts.keys()])];

  constructor(input: QuestCheckInput & { qd: QuestData }) {
    this.game = input.game;
    this.files = input.files;
    this.qd = input.qd;
    this.root = input.root ?? input.files.folder;
    this.isRoot = Path.combine(this.root, '') === Path.combine(input.files.folder, '');
    this.mom = input.game.gameType.typeName() === 'MoM';
    this.raw = input.files.components;
    this.graph = new QuestGraph(input.qd.components, input.files.texts);
    this.reached = this.graph.reachable();
    this.declared = this.declaredPacks();
    const ffg = LocalizationRead.dicts.get('ffg') ?? null;
    this.ffg = ffg !== null && ffg.getLanguagesList().length > 0 ? ffg : null;
  }

  facts(): QuestFacts {
    const facts: QuestFacts = { switches: [], fameItems: [], fameEvents: [], restocks: false };
    // StartQuestEvent: the path is from the package's main folder
    for (const l of this.graph.links) if (l.kind === 'quest') facts.switches.push(normalizePath(Path.combine(this.root, l.to.replace(/^[/\\]+/, ''))));
    for (const [name, c] of this.qd.components) {
      for (const op of c.operations ?? []) {
        if (/^\$%fame(noteworthy|impressive|celebrated|heroic|legendary)$/.test(op.var) && op.operation === '=') facts.fameEvents.push(name);
        if (op.var === '$restock' && op.operation === '=' && op.value === '1') facts.restocks = true;
      }
      const raw = this.raw.get(name);
      if (this.mom || raw === undefined || raw.type !== 'QItem') continue;
      const traits = words(raw.data.get('traits'));
      const pool = words(raw.data.get('traitpool'));
      if (traits.length === 0 && pool.length === 0) continue;
      const candidates = this.itemCandidates(traits, pool, words(raw.data.get('itemname')));
      if (candidates.length > 0 && candidates.every((n) => this.game.cd.tryGet(ItemData, n)!.minFame !== -1)) facts.fameItems.push(name);
    }
    facts.fameEvents = [...new Set(facts.fameEvents)];
    return facts;
  }

  run(): void {
    this.checkQuestSection();
    for (const c of this.raw.values()) {
      if (c.type === null) continue;
      this.checkKeys(c);
      this.checkPositions(c);
      this.checkVariables(c);
      if (EVENT_TYPES.has(c.type)) this.checkEvent(c);
      switch (c.type) {
        case 'Tile':
          this.checkTile(c);
          break;
        case 'Token':
          this.checkToken(c);
          break;
        case 'Door':
          this.checkDoor(c);
          break;
        case 'UI':
          this.checkUI(c);
          break;
        case 'Spawn':
          this.checkSpawn(c);
          break;
        case 'MPlace':
          this.checkMPlace(c);
          break;
        case 'CustomMonster':
          this.checkCustomMonster(c);
          break;
        case 'Activation':
          this.checkActivation(c);
          break;
        case 'QItem':
          this.checkItem(c);
          break;
        case 'Puzzle':
          this.checkPuzzle(c);
          break;
      }
    }
    for (const [where, l] of this.latent) this.problems.wrong(l.code + '-unreached', where, { ...l.params, more: l.more }, l.key);
    this.checkBackslashes();
    this.checkStart();
    this.checkEndings();
    this.checkReach();
    this.checkUIStaying();
    this.checkVariableNames();
    this.checkTexts();
    this.checkTileSides();
    if (this.mom) {
      this.checkItemDraws();
      this.checkMythos();
      this.checkFigures();
    } else {
      this.checkShop();
      this.checkMorale();
      this.checkPlaces();
      this.checkJoinedGroups();
    }
  }

  // ---- helpers

  private text(key: string): string | null {
    return this.files.text(key);
  }

  /** The packs the quest asks for, with the ones they stand for (a conversion kit's clones, old ids). */
  private declaredPacks(): Set<string> {
    const declared = new Set([...words(this.files.quest.get('packs')), this.mom ? 'MoMBase' : 'D2EBase']);
    const aliases: Record<string, string[]> = { MoM1E: ['MoM1ET', 'MoM1EI', 'MoM1EM'], FA: ['FAT', 'FAI', 'FAM'], CotW: ['CotWT', 'CotWI', 'CotWM'] };
    for (const [old, now] of Object.entries(aliases)) if (declared.has(old)) for (const p of now) declared.add(p);
    for (const pack of this.game.cd.allPacks) {
      if (pack.id !== null && declared.has(pack.id)) for (const clone of pack.clone ?? []) declared.add(clone);
    }
    return declared;
  }

  /**
   * The pack to name for content that several packs have: one the quest tests (#pack), else one that is not a
   * conversion kit (they hold the first edition's content again), else the first.
   */
  private packOf(sets: readonly string[]): string {
    return sets.find((s) => this.graph.read.has('#' + s)) ?? sets.find((s) => !/^(CK|MoM1|FA[TIM]$|CotW[TIM]$)/.test(s)) ?? sets[0] ?? '';
  }

  private usedButUndeclared = new Map<string, Set<string>>();

  /** Content of a pack the quest does not ask for: a player without it misses that part (a missing tile stops Valkyrie). */
  private uses(sets: readonly string[], component: string, name: string): void {
    if (sets.length === 0 || sets.some((s) => this.declared.has(s))) return;
    const pack = this.packOf(sets);
    if (this.mom) {
      this.problems.wrong('pack-undeclared-content', component, { name, pack });
      return;
    }
    let list = this.usedButUndeclared.get(pack);
    if (list === undefined) this.usedButUndeclared.set(pack, (list = new Set()));
    list.add(component);
  }

  /** Crashes in components no game reaches (Descent's validator): the first of each, and how many more. */
  private readonly latent = new Map<string, { code: string; params: Problem['params']; key?: string; more: number }>();

  /** A crash that only matters if the game reaches the component: in Descent, latent otherwise. */
  private crash(code: string, where: string, params?: Problem['params'], key?: string): void {
    if (this.mom || this.reached.has(where)) {
      this.problems.breaks(code, where, params, key);
      return;
    }
    const known = this.latent.get(where);
    if (known !== undefined) known.more++;
    else this.latent.set(where, { code, params, key, more: 0 });
  }

  /** A picture or sound the quest names, as Valkyrie looks for it: by name in the packs, else a file of the quest. */
  private media(where: string, key: string, value: string, sound: boolean, fatal = false): void {
    const name = value
      .trim()
      .replace(/^"+|"+$/g, '')
      .replace(/\\/g, '/');
    if (sound && this.game.cd.tryGet(AudioData, name) !== undefined) return;
    if (!sound && (this.game.cd.tryGet(ImageData, name) !== undefined || this.game.cd.tryGet(PuzzleData, name) !== undefined)) return;
    if (/^(Audio|Image|Puzzle)[A-Z]/.test(name) && !name.includes('.')) {
      this.problems.wrong('media-not-in-packs', where, { name }, key);
      return;
    }
    // Quest.FindLocalisedMultimediaFile, as a player in each language finds it (in the editor it only looks in the folder)
    if (!File.exists(Path.combine(this.files.folder, name))) {
      const languages = LANGUAGES.filter((l) => File.exists(Quest.findLocalisedMultimediaFile(name, this.files.folder, l, null, false)));
      if (languages.length === 0) {
        if (fatal) this.problems.breaks('media-missing-fatal', where, { name }, key);
        else this.problems.wrong('media-missing', where, { name }, key);
        return;
      }
      // Only in the folders of some languages: a player in another one, with no fallback language there, misses it
      if (languages.length < LANGUAGES.length) this.problems.hint('media-some-languages', where, { name, languages: languages.join(' ') }, key);
    }
    const onDisk = this.files.fileOnDisk(name);
    if (onDisk.actual !== undefined) {
      this.problems.breaks('media-letter-case', where, { name, actual: onDisk.actual }, key);
      return;
    }
    if (name.includes(' ')) this.problems.hint('media-spaces', where, { name }, key);
    if (sound && !name.toLowerCase().endsWith('.ogg')) this.problems.breaks('media-sound-not-ogg', where, { name }, key);
    if (!sound && !/\.(png|jpe?g)$/i.test(name)) this.problems.wrong('media-picture-format', where, { name }, key);
  }

  // ---- quest.ini

  private checkQuestSection(): void {
    const q = this.files.quest;
    const where = '[Quest]';
    const format = q.get('format') ?? '';
    // QuestData.Quest.Populate: a format outside 4..21 is not listed (an empty one reads as 0)
    if (format === '') {
      this.problems.breaks('format-missing', where, undefined, 'format');
    } else if (!/^-?\d+$/.test(format.trim())) {
      this.problems.breaks('format-not-number', where, { value: format }, 'format');
    } else {
      this.format = Number(format.trim());
      if (this.format > QuestFormat.CURRENT_VERSION || this.format < QuestData.Quest.minumumFormat) {
        this.problems.breaks('format-out-of-range', where, { value: this.format, min: QuestData.Quest.minumumFormat, max: QuestFormat.CURRENT_VERSION }, 'format');
      }
    }
    const type = q.get('type') ?? '';
    const gameType = this.game.gameType.typeName();
    if (type !== gameType) {
      // QuestLoader lists a quest of this game only; a campaign's other quests are reached by ChangeQuest, which does not check
      if (this.isRoot) this.problems.breaks('type-wrong', where, { value: type, game: gameType }, 'type');
      else this.problems.wrong('type-wrong-subquest', where, { value: type, game: gameType }, 'type');
    }
    const hidden = isTrue(q.get('hidden'));
    if (this.isRoot && hidden) this.problems.wrong('hidden', where, undefined, 'hidden');
    if (!this.isRoot && !hidden && !this.mom) this.problems.wrong('subquest-not-hidden', where, undefined, 'hidden');
    const language = this.files.defaultLanguage;
    if (!q.has('defaultlanguage')) this.problems.wrong('default-language-missing', where, undefined, 'defaultlanguage');
    else if (!LANGUAGES.includes(language)) this.problems.breaks('default-language-unknown', where, { value: language }, 'defaultlanguage');
    if (!this.files.texts.has(language)) this.problems.breaks('default-language-no-file', where, { value: language }, 'defaultlanguage');
    const known = new Set(this.game.cd.allPacks.map((p) => p.id));
    for (const pack of words(q.get('packs'))) {
      if (!known.has(pack) && !['MoM1E', 'FA', 'CotW'].includes(pack)) this.problems.wrong('pack-unknown', where, { pack }, 'packs');
      if (pack === (this.mom ? 'MoMBase' : 'D2EBase')) this.problems.hint('pack-base', where, { pack }, 'packs');
      if (this.mom && (pack === 'RN' || pack === 'SM')) this.problems.hint('pack-conversion-kit', where, { pack }, 'packs');
      if (!this.mom && this.game.cd.allPacks.some((p) => p.id === pack && (p.type ?? '').endsWith('Custom'))) this.problems.hint('pack-community', where, { pack }, 'packs');
    }
    if (!this.mom) {
      const min = Number(q.get('minhero') ?? '2');
      const max = Number(q.get('maxhero') ?? '4');
      if (!Number.isInteger(min) || !Number.isInteger(max)) {
        this.problems.breaks('heroes-not-number', where, undefined, 'minhero');
      } else {
        if (max > 4) this.problems.hint('heroes-max-d2e', where, { value: max }, 'maxhero');
        if (min > max) this.problems.breaks('heroes-min-over-max', where, { min, max }, 'minhero');
        if (min < 1) this.problems.hint('heroes-min-under-one', where, { value: min }, 'minhero');
      }
    }
    const difficulty = q.get('difficulty');
    if (difficulty !== undefined) {
      if (!NUMBER.test(difficulty.trim())) this.problems.wrong('difficulty-not-number', where, { value: difficulty }, 'difficulty');
      else if (Number(difficulty) < 0 || Number(difficulty) > 1) this.problems.wrong('difficulty-range', where, { value: difficulty }, 'difficulty');
    }
    if (!this.isRoot) return;
    if (!q.get('lengthmin') || !q.get('lengthmax')) this.problems.hint('length-missing', where, undefined, 'lengthmin');
    const image = q.get('image') ?? '';
    if (image !== '') {
      if (image.includes(' ')) this.problems.wrong('cover-spaces', where, { name: image }, 'image');
      if (!File.exists(Path.combine(this.files.folder, image))) this.problems.wrong('cover-missing', where, { name: image }, 'image');
    } else {
      this.problems.hint('cover-none', where, undefined, 'image');
    }
    const folder = Path.getFileName(this.files.folder);
    if (folder.startsWith('EditorScenario') || folder.startsWith('Scenario')) this.problems.wrong('folder-default-name', '', { folder });
    if (folder.includes(' ')) this.problems.breaks('folder-spaces', '', { folder });
    for (const key of ['quest.name', 'quest.description', 'quest.synopsys', 'quest.authors']) {
      if (this.text(key) === null) this.problems.add(key === 'quest.name' ? 'wrong' : 'hint', 'quest-text-missing', '', { key }, key);
    }
  }

  // ---- every component

  private checkKeys(c: RawComponent): void {
    const allowed = TYPE_KEYS[c.type!] ?? QC_KEYS;
    const patterns = [...(EVENT_TYPES.has(c.type!) ? EVENT_PATTERNS : []), ...(c.type === 'Spawn' ? [/^placement\d+$/] : [])];
    for (const key of c.data.keys()) {
      if (allowed.includes(key) || patterns.some((p) => p.test(key))) continue;
      // IniRead's keys are case-sensitive: a key in other letter case is ignored, and the editor drops it on saving
      const fix = KEY_FIXES[key] ?? allowed.find((k) => k.toLowerCase() === key.toLowerCase());
      if (fix !== undefined) this.problems.breaks('key-letter-case', c.name, { key, fix }, key);
      else if (/^event\d+condition(action)?$/i.test(key)) this.problems.breaks('key-condition-case', c.name, { key }, key);
      else this.problems.hint('key-unknown', c.name, { key, type: c.type! }, key);
    }
  }

  private checkPositions(c: RawComponent): void {
    for (const key of ['xposition', 'yposition']) {
      const value = c.data.get(key);
      if (value === undefined) continue;
      // float.Parse with the invariant culture: a decimal comma or a word reads as 0
      if (value.includes(',')) this.problems.breaks('position-comma', c.name, { value }, key);
      else if (!/^\s*[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?\s*$/.test(value)) this.problems.breaks('position-not-number', c.name, { value }, key);
      else if (!this.mom && ['Token', 'Door', 'MPlace', 'Spawn'].includes(c.type!) && Math.abs(Number(value) - Math.round(Number(value))) > 1e-6) {
        this.problems.hint('position-not-on-square', c.name, { value }, key);
      }
    }
    const rotation = c.data.get('rotation');
    if (rotation !== undefined && ['Tile', 'Token', 'Door'].includes(c.type!)) {
      if (!/^\s*[-+]?\d+\s*$/.test(rotation)) this.problems.breaks('rotation-not-integer', c.name, { value: rotation }, 'rotation');
      else if ((c.type === 'Tile' || (!this.mom && c.type === 'Door')) && Number(rotation) % 90 !== 0) {
        this.problems.wrong('rotation-not-right-angle', c.name, { value: rotation }, 'rotation');
      }
    }
  }

  /** operations, vartests, eventNCondition and the old conditions: how VarOperation and VarTests read them. */
  private checkVariables(c: RawComponent): void {
    for (const op of words(c.data.get('operations'))) this.checkOperation(c.name, 'operations', op, true);
    for (const [key, value] of c.data) {
      if (key !== 'vartests' && !/^event\d+Condition$/.test(key)) continue;
      let depth = 0;
      let previous: string | null = null;
      for (const item of words(value)) {
        const colon = item.indexOf(':');
        const kind = colon === -1 ? item : item.substring(0, colon);
        const data = colon === -1 ? '' : item.substring(colon + 1);
        if (kind === 'VarOperation') {
          this.checkOperation(c.name, key, data, false);
          if (previous === 'VarOperation') this.problems.wrong('test-no-operator', c.name, undefined, key);
        } else if (kind === 'VarTestsLogicalOperator') {
          if (data !== 'AND' && data !== 'OR') this.problems.breaks('test-operator-unknown', c.name, { value: data }, key);
        } else if (kind === 'VarTestsParenthesis') {
          if (data === '(') depth++;
          else if (data === ')') depth--;
          else this.problems.breaks('test-parenthesis-unknown', c.name, { value: data }, key);
        } else {
          this.problems.breaks('test-item-unknown', c.name, { value: item }, key);
        }
        if (kind !== 'VarTestsParenthesis') previous = kind;
      }
      if (depth !== 0) this.problems.breaks('test-parentheses-unpaired', c.name, undefined, key);
    }
    if (c.data.has('conditions')) {
      if (c.data.has('vartests')) this.problems.wrong('conditions-ignored', c.name, undefined, 'conditions');
      else {
        this.problems.hint('conditions-old', c.name, undefined, 'conditions');
        for (const op of words(c.data.get('conditions'))) this.checkOperation(c.name, 'conditions', op, false);
      }
    }
    // Quest.Token: a token can always be pressed, whatever its vartests
    if (c.type === 'Token' && (c.data.get('vartests') ?? '') !== '') this.problems.wrong('token-tests-ignored', c.name, undefined, 'vartests');
  }

  private checkOperation(where: string, key: string, text: string, writing: boolean): void {
    // VarOperation splits on ',' leaving out empty parts and reads the first three: fewer throw while loading
    const parts = text.split(',').filter((p) => p !== '');
    if (parts.length < 3) {
      this.problems.breaks('operation-parts', where, { value: text }, key);
      return;
    }
    if (parts.length > 3) this.problems.wrong('operation-extra-parts', where, { value: text }, key);
    const [variable, op] = parts as [string, string, string];
    if (writing) {
      if (!['=', '+', '-', '*', '/', '%'].includes(op)) this.problems.breaks('operation-operator', where, { value: text, op }, key);
      if (variable.startsWith('#')) this.problems.wrong('operation-read-only', where, { value: text, variable }, key);
    } else if (!['==', '!=', '>=', '<=', '>', '<'].includes(op)) {
      this.problems.breaks('test-comparison', where, { value: text, op }, key);
    }
  }

  // ---- events (Event, Door, Token, UI, Spawn, Puzzle)

  private checkEvent(c: RawComponent): void {
    const event = this.qd.components.get(c.name);
    const display = (c.data.get('display') ?? 'true').toLowerCase() !== 'false';
    const buttonsValue = c.data.get('buttons');
    if (buttonsValue !== undefined && !/^\s*[-+]?\d+\s*$/.test(buttonsValue)) this.problems.breaks('buttons-not-integer', c.name, { value: buttonsValue }, 'buttons');
    // Event: buttons= buttons (a shown event has at least one); eventN beyond them are never read
    const buttons = event instanceof QuestData.Event ? event.buttons.length : 0;
    const eventKeys = [...c.data.keys()]
      .map((k) => /^event(\d+)$/.exec(k))
      .filter((m) => m !== null)
      .map((m) => Number(m[1]))
      .sort((a, b) => a - b);
    for (const i of eventKeys) {
      const targets = words(c.data.get('event' + i));
      if (i > buttons || i < 1) {
        if (targets.length === 0) continue;
        if (!display && buttons === 0 && i === 1) this.problems.wrong('silent-no-button', c.name, { targets: targets.join(' ') }, 'event1');
        else this.problems.wrong('event-beyond-buttons', c.name, { key: 'event' + i, buttons }, 'event' + i);
        continue;
      }
      for (const target of targets) {
        if (target.toLowerCase().endsWith('quest.ini')) {
          // StartQuestEvent: the path is relative to the main quest's folder
          if (!File.exists(Path.combine(this.root, target.replace(/^[/\\]+/, '')))) this.problems.wrong('quest-change-missing', c.name, { target }, 'event' + i);
          continue;
        }
        const to = this.raw.get(target);
        if (to === undefined) this.problems.wrong('event-missing', c.name, { target }, 'event' + i);
        else if (to.type === null || !EVENT_TYPES.has(to.type)) this.problems.wrong('event-not-event', c.name, { target, type: to.type ?? '' }, 'event' + i);
      }
      // A list starts the first event whose tests pass (or one at random); several without tests on the first is a slip
      const random = isTrue(c.data.get('randomevents'));
      const branching = targets.slice(0, -1).every((t) => !this.raw.has(t) || (this.raw.get(t)!.data.get('vartests') ?? '') !== '');
      // A step of a chain: the first goes on to the last itself, so whichever runs, the chain goes on (try this, then that)
      const last = targets[targets.length - 1]!;
      const chained = targets.slice(0, -1).every((t) => (this.raw.get(t)?.data.get('event1') ?? '').split(/\s+/).includes(last));
      if (targets.length > 1 && !random && !branching && !chained) this.problems.hint('event-list-first', c.name, { key: 'event' + i, count: targets.length }, 'event' + i);
      if (this.mom && targets.length === 1 && random) this.problems.hint('random-one-event', c.name, { key: 'event' + i }, 'randomevents');
      const condition = c.data.get(`event${i}Condition`);
      const action = c.data.get(`event${i}ConditionAction`);
      if (action !== undefined && action !== '' && !['none', 'disable', 'hide'].includes(action.toLowerCase())) {
        this.problems.breaks('condition-action-unknown', c.name, { value: action }, `event${i}ConditionAction`);
      }
      if (action && !condition) this.problems.hint('condition-action-alone', c.name, { key: `event${i}ConditionAction` }, `event${i}ConditionAction`);
      const color = c.data.get(`buttoncolor${i}`);
      if (color && !isColor(color)) this.problems.add(this.mom ? 'breaks' : 'wrong', 'button-color', c.name, { value: color }, `buttoncolor${i}`);
    }
    if (!display && buttons > 1 && ![...Array(buttons).keys()].some((i) => c.data.has(`event${i + 1}Condition`))) {
      this.problems.wrong('silent-several-buttons', c.name, { buttons }, 'buttons');
    }
    // Texts: a shown event without text, buttons without a label (the key is shown)
    if (display && c.type !== 'Puzzle') {
      if (this.text(c.name + '.text') === null && (c.type === 'Event' || c.type === 'Spawn')) this.problems.hint('event-no-text', c.name, undefined, c.name + '.text');
      for (let i = 1; i <= buttons; i++) {
        if (this.mom && c.data.has('button' + i)) {
          this.problems.hint('button-label-in-ini', c.name, { key: 'button' + i }, 'button' + i);
          continue;
        }
        const hasEvents = words(c.data.get('event' + i)).length > 0;
        if (this.text(`${c.name}.button${i}`) === null && (!['Token', 'UI', 'Door'].includes(c.type!) || hasEvents)) {
          this.problems.wrong('button-no-label', c.name, { button: i }, `${c.name}.button${i}`);
        }
      }
    }
    if (this.mom && c.type === 'Puzzle' && this.text(c.name + '.button1') === null) this.problems.hint('puzzle-no-button', c.name, undefined, c.name + '.button1');
    this.checkAddRemove(c);
    this.checkTrigger(c);
    const audio = c.data.get('audio') ?? '';
    if (audio !== '') this.media(c.name, 'audio', audio, true);
    const music = c.data.get('music') ?? '';
    // music= is a list split on spaces: a file name with spaces is cut in pieces
    if (this.mom && /\.ogg\b/.test(music) && words(music).some((p) => !p.toLowerCase().endsWith('.ogg') && !p.startsWith('Audio'))) {
      this.problems.wrong('music-spaces', c.name, undefined, 'music');
    }
    for (const m of words(music)) this.media(c.name, 'music', m, true);
    const hero = c.data.get('hero');
    if (hero && !this.raw.has(hero)) this.problems.wrong('hero-event-missing', c.name, { target: hero }, 'hero');
    const quota = c.data.get('quota');
    if (this.mom && quota) {
      if (/^\d/.test(quota)) {
        if (Number(/^\d+/.exec(quota)![0]) > 10) this.problems.hint('quota-over-ten', c.name, { value: quota }, 'quota');
        if (buttons < 2) this.problems.hint('quota-no-second-button', c.name, undefined, 'quota');
      }
    }
  }

  private checkAddRemove(c: RawComponent): void {
    let items = 0;
    const add = words(c.data.get('add'));
    for (const name of add) {
      const target = this.raw.get(name);
      // Quest.Add of a name that is not a component is fatal
      if (target === undefined) {
        this.crash('add-missing', c.name, { target: name }, 'add');
        continue;
      }
      let list = this.added.get(name);
      if (list === undefined) this.added.set(name, (list = []));
      list.push(c.name);
      if (target.type === 'Spawn') this.problems.wrong('add-spawn', c.name, { target: name }, 'add');
      else if (['Event', 'Puzzle', 'CustomMonster', 'MPlace', 'Activation'].includes(target.type ?? '')) {
        this.problems.wrong('add-not-board', c.name, { target: name, type: target.type! }, 'add');
      } else if (target.type === 'QItem') items++;
    }
    // MoM: several items in one event are all given, but no item card is shown; in Descent they open the shop
    if (this.mom && items > 1) this.problems.wrong('add-several-items', c.name, { count: items }, 'add');
    if (!this.mom && items > 1) this.problems.hint('add-opens-shop', c.name, { count: items }, 'add');
    const remove = words(c.data.get('remove'));
    for (const name of remove) {
      let list = this.removed.get(name);
      if (list === undefined) this.removed.set(name, (list = []));
      list.push(c.name);
      if (name.startsWith('#')) {
        if (!SPECIAL_REMOVE.has(name)) this.problems.wrong('remove-special-unknown', c.name, { target: name }, 'remove');
        else if (['#uicomponents', '#doors', '#tiles', '#tokens', '#qitems'].includes(name) && this.format > 0 && this.format < 20) {
          this.problems.wrong('remove-special-format', c.name, { target: name }, 'remove');
        }
        continue;
      }
      if (!this.raw.has(name)) this.problems.hint('remove-missing', c.name, { target: name }, 'remove');
    }
    // Quest.Add runs before Quest.Remove: what an event adds and removes ends off the board
    const both = [...new Set(add)].filter((n) => remove.includes(n) && n !== c.name && !n.startsWith('#'));
    const items2 = both.filter((n) => this.raw.get(n)?.type === 'QItem');
    const others = both.filter((n) => !items2.includes(n));
    if (this.mom && items2.length > 0) this.problems.hint('add-remove-item', c.name, { targets: items2.join(' ') }, 'remove');
    if (others.length > 0) this.problems.wrong('add-remove-same', c.name, { targets: others.join(' ') }, 'remove');
  }

  private checkTrigger(c: RawComponent): void {
    const trigger = c.data.get('trigger') ?? '';
    if (trigger === '') return;
    if (trigger === 'EventStart') this.startEvents.push(c.name);
    if ((this.mom ? MOM_TRIGGERS : D2E_TRIGGERS).has(trigger) || /^EndRound\d+$/.test(trigger)) return;
    if (!this.mom && MOM_TRIGGERS.has(trigger)) {
      this.problems.wrong('trigger-mom-only', c.name, { trigger }, 'trigger');
      return;
    }
    if (trigger.startsWith('Defeated')) {
      if (this.mom && trigger.startsWith('DefeatedUnique')) {
        this.problems.wrong('trigger-defeated-unique-mom', c.name, { trigger }, 'trigger');
        return;
      }
      const name = trigger.startsWith('DefeatedUnique') ? trigger.substring(14) : trigger.substring(8);
      if (this.game.cd.tryGet(MonsterData, name) === undefined && !this.raw.has(name)) {
        this.problems.wrong('trigger-defeated-unknown', c.name, { trigger, name }, 'trigger');
      }
      return;
    }
    if (trigger.startsWith('Var')) return;
    this.problems.wrong('trigger-unknown', c.name, { trigger }, 'trigger');
  }

  // ---- by type

  private checkTile(c: RawComponent): void {
    const side = c.data.get('side') ?? '';
    const custom = c.data.get('customImage') ?? '';
    // Quest.Tile: a tile with neither, or with a TileSide Valkyrie does not have, stops Valkyrie when it is placed
    if (side === '' && custom === '') {
      this.crash('tile-no-side', c.name);
    } else if (side !== '') {
      const data = this.game.cd.tryGet(TileSideData, side) ?? (this.mom ? undefined : this.game.cd.tryGet(TileSideData, 'TileSide' + side));
      if (data === undefined) this.crash('tile-side-unknown', c.name, { side }, 'side');
      else this.uses(data.sets, c.name, side);
    }
    if (custom !== '') {
      this.media(c.name, 'customImage', custom, false, true);
      if (this.mom && this.format > 0 && this.format < 21) this.problems.wrong('tile-custom-image-format', c.name, undefined, 'customImage');
    }
  }

  private checkToken(c: RawComponent): void {
    const type = c.data.get('type') ?? '';
    const custom = c.data.get('customImage') ?? '';
    // Quest.Token: an unknown type is drawn as TokenSearch (and logged)
    if (type === '' && custom === '') this.problems.wrong('token-no-type', c.name, undefined, 'type');
    else if (type !== '' && this.game.cd.tryGet(TokenData, type) === undefined && this.game.cd.tryGet(MonsterData, type) === undefined && (this.mom || custom === '')) {
      this.problems.wrong('token-type-unknown', c.name, { value: type }, 'type');
    } else if (type !== '') {
      const data = this.game.cd.tryGet(TokenData, type);
      if (data !== undefined) this.uses(data.sets, c.name, type);
    }
    const size = c.data.get('tokensize') ?? '';
    if (size !== '' && !TOKEN_SIZES.has(size) && !NUMBER.test(size)) this.problems.breaks('token-size', c.name, { value: size }, 'tokensize');
    if (this.mom && (size !== '' || custom !== '' || c.data.has('clickeffect')) && this.format > 0 && this.format < 21) {
      this.problems.wrong('token-format', c.name, undefined, 'tokensize');
    }
    if (custom !== '') this.media(c.name, 'customImage', custom, false);
  }

  private checkDoor(c: RawComponent): void {
    const color = c.data.get('color') ?? '';
    // Door: an unknown colour is logged and the door stays white
    if (!this.mom && color !== '' && !isColor(color)) this.problems.wrong('door-color', c.name, { value: color }, 'color');
  }

  private checkUI(c: RawComponent): void {
    const image = c.data.get('image') ?? '';
    if (image !== '') this.media(c.name, 'image', image, false);
    if (image === '' && this.text(c.name + '.uitext') === null) this.problems.hint('ui-empty', c.name);
    if (!this.mom) return;
    for (const key of ['textcolor', 'textbackgroundcolor']) {
      const value = c.data.get(key);
      if (value && !isColor(value)) this.problems.breaks('ui-color', c.name, { value }, key);
    }
    const halign = c.data.get('halign');
    if (halign && halign !== 'left' && halign !== 'right') this.problems.wrong('ui-halign', c.name, { value: halign }, 'halign');
    const valign = c.data.get('valign');
    if (valign && valign !== 'top' && valign !== 'bottom') this.problems.wrong('ui-valign', c.name, { value: valign }, 'valign');
    const align = c.data.get('textAlignment');
    if (align && !['TOP', 'CENTER', 'BOTTOM'].includes(align.toUpperCase())) this.problems.wrong('ui-text-alignment', c.name, { value: align }, 'textAlignment');
  }

  private checkSpawn(c: RawComponent): void {
    const monsters = words(c.data.get('monster'));
    const traits = [...words(c.data.get('traits')), ...words(c.data.get('traitpool'))];
    if (monsters.length === 0 && traits.length === 0) {
      this.crash('spawn-no-monster', c.name, undefined, 'monster');
      return;
    }
    if (this.mom) {
      const packs: string[][] = [];
      for (const m of monsters) {
        const full = /^(Monster|CustomMonster|Spawn)/.test(m) ? m : 'Monster' + m;
        const data = this.game.cd.tryGet(MonsterData, full);
        if (data !== undefined) packs.push(data.sets);
        else if (this.raw.has(full)) packs.push(['MoMBase']);
        else this.problems.wrong('spawn-monster-unknown', c.name, { value: m }, 'monster');
      }
      // Quest.Spawn: the first monster whose pack the player has; with none of them, no monster comes
      if (monsters.length > 0 && traits.length === 0 && packs.length > 0 && !packs.some((sets) => sets.some((s) => this.declared.has(s)))) {
        this.problems.wrong('spawn-no-declared-monster', c.name, { value: c.data.get('monster')! }, 'monster');
      }
      return;
    }
    // Descent: the first monster the player has; a spawn names a monster type, a custom monster or another spawn
    let chosen: string | null = null;
    if (monsters.length > 0 && traits.length === 0) {
      let found = false;
      for (const m of monsters) {
        if (m.startsWith('Spawn')) {
          if (!this.raw.has(m)) this.problems.wrong('spawn-spawn-missing', c.name, { value: m }, 'monster');
          found = true;
          break;
        }
        const full = this.raw.has(m) ? m : m.startsWith('Monster') ? m : 'Monster' + m;
        if (this.raw.has(full)) {
          chosen = full;
          found = true;
          break;
        }
        const data = this.game.cd.tryGet(MonsterData, full);
        if (data === undefined) continue;
        const has = data.sets.some((s) => this.declared.has(s));
        if (!has && m === monsters.at(-1)) this.uses(data.sets, c.name, full);
        else if (!has) continue;
        chosen = full;
        found = true;
        break;
      }
      if (!found) this.crash('spawn-monster-none', c.name, { value: monsters.join(' ') }, 'monster');
    }
    if (chosen !== null) this.spawnMonster.set(c.name, chosen);
    const placements = [...c.data.keys()]
      .map((k) => /^placement(\d+)$/.exec(k))
      .filter((m) => m !== null)
      .map((m) => Number(m[1]));
    for (const i of placements) {
      if (i > 4) this.problems.hint('placement-over-four', c.name, { key: 'placement' + i }, 'placement' + i);
      let masters = 0;
      for (const place of words(c.data.get('placement' + i))) {
        const p = this.raw.get(place);
        // Quest.Spawn (D2E): placing the group at a place that is not an MPlace is fatal
        if (p === undefined) this.crash('placement-missing', c.name, { key: 'placement' + i, target: place }, 'placement' + i);
        else if (p.type !== 'MPlace') this.crash('placement-not-mplace', c.name, { key: 'placement' + i, target: place }, 'placement' + i);
        else if (isTrue(p.data.get('master'))) masters++;
      }
      if (masters > 1) this.problems.hint('placement-masters', c.name, { key: 'placement' + i, count: masters }, 'placement' + i);
    }
    const positioned = c.data.has('xposition') || c.data.has('yposition');
    const silent = (c.data.get('display') ?? 'true').toLowerCase() === 'false';
    if (placements.length > 0 && this.reached.has(c.name) && !positioned) this.problems.wrong('spawn-no-position', c.name);
    else if (placements.length > 0 && this.reached.has(c.name) && silent) this.problems.wrong('spawn-silent', c.name);
    if (placements.length === 0 && !c.data.get('xposition') && !silent) this.problems.hint('spawn-no-place', c.name);
    // TokenBoard.AddMonster: with no placement for the number of heroes, Valkyrie marks the group's area instead of
    // each square (a lieutenant's picture goes on the spawn's spot)
    if (placements.length > 0 && !silent && (chosen === null || !this.monsterTraits(chosen).includes('lieutenant'))) {
      for (let heroes = this.qd.quest.minHero; heroes <= this.qd.quest.maxHero; heroes++) {
        if (words(c.data.get('placement' + heroes)).length === 0) this.problems.hint('spawn-placement-heroes', c.name, { heroes }, 'placement' + heroes);
      }
    }
    if (isTrue(c.data.get('unique'))) {
      const text = this.text(c.name + '.uniquetext');
      const title = this.text(c.name + '.uniquetitle');
      if (text === null) this.problems.hint('unique-no-text', c.name, undefined, c.name + '.uniquetext');
      // EventManager.GetUniqueTitle titles a unique monster "Master <monster>" whatever its uniquetitle
      if (title !== null) this.problems.hint('unique-title-unused', c.name, undefined, c.name + '.uniquetitle');
      else if (text !== null) this.problems.wrong('unique-no-title', c.name, undefined, c.name + '.uniquetitle');
    }
    for (const key of ['uniquehealth', 'uniquehealthhero']) {
      const value = c.data.get(key);
      if (value !== undefined && !NUMBER.test(value.trim())) this.problems.wrong('spawn-health-not-number', c.name, { key, value }, key);
    }
  }

  /** The traits of a monster: a custom monster's own, else its base's (QuestMonster). */
  private monsterTraits(name: string): string[] {
    const custom = this.qd.components.get(name);
    if (custom instanceof QuestData.CustomMonster) {
      return custom.traits.length > 0 ? custom.traits : (this.game.cd.tryGet(MonsterData, custom.baseMonster)?.traits ?? []);
    }
    return this.game.cd.tryGet(MonsterData, name)?.traits ?? [];
  }

  private checkMPlace(c: RawComponent): void {
    for (const key of ['master', 'rotate']) {
      const value = c.data.get(key);
      if (value !== undefined && !['true', 'false'].includes(value.trim().toLowerCase())) this.problems.wrong('mplace-bool', c.name, { key, value }, key);
    }
    const size = c.data.get('tokensize') ?? '';
    if (size !== '' && !TOKEN_SIZES.has(size) && !NUMBER.test(size)) this.problems.wrong('token-size', c.name, { value: size }, 'tokensize');
  }

  private checkCustomMonster(c: RawComponent): void {
    const base = c.data.get('base') ?? '';
    const activations = words(c.data.get('activation'));
    const used = this.ofType('Spawn').some((s) => words(this.raw.get(s)!.data.get('monster')).includes(c.name));
    const baseData = base === '' ? undefined : this.game.cd.tryGet(MonsterData, base);
    if (base !== '' && baseData === undefined) {
      if (this.mom) this.problems.wrong('monster-base-unknown', c.name, { value: base }, 'base');
      else this.crash('monster-base-unknown', c.name, { value: base }, 'base');
    } else if (baseData !== undefined && !this.mom) {
      this.uses(baseData.sets, c.name, base);
    }
    if (this.mom) {
      const traits = words(c.data.get('traits'));
      if (base === '' && !traits.some((t) => MONSTER_CATEGORIES.has(t))) this.problems.wrong('monster-no-category', c.name);
    } else if (base === '' && !c.data.get('traits')) {
      this.problems.hint('monster-no-traits', c.name);
    }
    // RoundController.ActivateMonster: no activation found (in the quest as Activation<name>, or MonsterActivation<name>) stops Valkyrie
    if (base === '' && activations.length === 0) {
      if (this.mom) this.problems.add(used ? 'breaks' : 'wrong', used ? 'monster-no-activation' : 'monster-no-activation-unused', c.name);
      else this.crash('monster-no-activation', c.name);
    }
    if (activations.length > 0) {
      const own = (a: string) => this.raw.get('Activation' + a)?.type === 'Activation';
      const official = (a: string) => this.game.cd.tryGet(ActivationData, 'MonsterActivation' + a) !== undefined;
      if (this.mom && activations.length === 1 && activations[0]!.startsWith('Event')) {
        // RoundControllerMoM: a lone event is the activation
        if (!this.raw.has(activations[0]!)) this.problems.breaks('activation-event-missing', c.name, { target: activations[0]! }, 'activation');
      } else {
        if (this.mom && activations.some((a) => a.startsWith('Event'))) this.problems.wrong('activation-event-mixed', c.name, undefined, 'activation');
        const missing: string[] = [];
        let valid = 0;
        for (const a of activations) {
          if (!this.mom && a.startsWith('Event')) {
            this.crash('activation-event-d2e', c.name, { value: a }, 'activation');
            continue;
          }
          if (own(a) || official(a)) valid++;
          else if (!this.mom && a.startsWith('Activation') && this.raw.has(a)) this.problems.wrong('activation-with-prefix', c.name, { value: a }, 'activation');
          else missing.push(a);
        }
        if (valid === 0) {
          if (this.mom) this.problems.add(used ? 'breaks' : 'wrong', used ? 'activation-none-valid' : 'activation-none-valid-unused', c.name, { value: activations.join(' ') }, 'activation');
          else if (missing.length > 0 || activations.length > 0) this.crash('activation-none-valid', c.name, { value: activations.join(' ') }, 'activation');
        } else if (missing.length > 0) {
          this.problems.wrong('activation-missing', c.name, { value: missing.join(' ') }, 'activation');
        }
        const ownOnes = activations.filter(own);
        if (this.mom && ownOnes.length > 0 && !activations.some(official) && ownOnes.every((a) => (this.raw.get('Activation' + a)!.data.get('vartests') ?? '') !== '')) {
          this.problems.hint('activation-all-tested', c.name, undefined, 'activation');
        }
      }
    }
    if (this.mom) {
      for (const key of ['evadeevent', 'horrorevent']) {
        const value = c.data.get(key);
        if (value && !this.raw.has(value)) this.problems.wrong('monster-event-missing', c.name, { key, target: value }, key);
      }
      for (const entry of words(c.data.get('attacks'))) {
        const colon = entry.indexOf(':');
        const type = colon === -1 ? entry : entry.substring(0, colon);
        const count = colon === -1 ? '1' : entry.substring(colon + 1) || '1';
        if (!ATTACK_TYPES.has(type)) this.problems.wrong('attack-type', c.name, { value: type }, 'attacks');
        if (!/^\d+$/.test(count)) {
          this.problems.breaks('attack-format', c.name, { value: entry }, 'attacks');
          continue;
        }
        for (let i = 1; i <= Number(count); i++) {
          if (this.text(`${c.name}.Attack_${type}_${i}`) === null) this.problems.wrong('attack-no-text', c.name, { key: `${c.name}.Attack_${type}_${i}` }, `${c.name}.Attack_${type}_${i}`);
        }
      }
      if (this.text(c.name + '.monstername') === null && base === '') this.problems.wrong('monster-no-name', c.name, undefined, c.name + '.monstername');
      for (const key of ['image', 'imageplace']) {
        const value = c.data.get(key);
        if (value) this.media(c.name, key, value, false);
      }
      return;
    }
    for (const key of ['health', 'healthperhero']) {
      const value = c.data.get(key);
      if (value !== undefined && !NUMBER.test(value.trim())) this.problems.wrong('monster-health-not-number', c.name, { key, value }, key);
    }
    for (const key of ['image', 'imageplace']) {
      const value = c.data.get(key);
      if (!value) continue;
      if (value.includes('\\')) this.problems.wrong('custom-image-backslash', c.name, { value }, key);
      // QuestMonster reads them straight from the quest folder: a missing one stops Valkyrie when the monster is shown
      if (!File.exists(Path.combine(this.files.folder, value.replace(/\\/g, '/')))) this.crash('monster-image-missing', c.name, { key, name: value }, key);
    }
    if (this.text(c.name + '.monstername') === null && base === '') this.problems.wrong('monster-no-name', c.name, undefined, c.name + '.monstername');
    for (const key of ['evadeevent', 'horrorevent', 'horror', 'awareness', 'attacks']) {
      if (c.data.has(key)) this.problems.hint('monster-key-mom-only', c.name, { key }, key);
    }
  }

  private checkActivation(c: RawComponent): void {
    if (this.mom) return;
    const ability = this.text(c.name + '.ability');
    if (this.text(c.name + '.master') === null && this.text(c.name + '.minion') === null) this.problems.wrong('activation-empty', c.name);
    if (ability === null) this.problems.hint('activation-no-ability', c.name, undefined, c.name + '.ability');
    else if (ability.includes('{0}')) this.problems.hint('activation-ability-hero', c.name, undefined, c.name + '.ability');
    if (isTrue(c.data.get('masterfirst')) && isTrue(c.data.get('minionfirst'))) this.problems.hint('activation-both-first', c.name);
  }

  private checkItem(c: RawComponent): void {
    if (c.name.startsWith('StartingItem')) this.problems.hint('item-starting-item', c.name);
    // QItem: without starting= it is given at the start
    if (!c.data.has('starting')) this.problems.add(this.mom ? 'wrong' : 'hint', 'item-no-starting', c.name, undefined, 'starting');
    const names = words(c.data.get('itemname'));
    const traits = words(c.data.get('traits'));
    const pool = words(c.data.get('traitpool'));
    if (names.length === 0 && traits.length === 0 && pool.length === 0) {
      this.problems.wrong('item-nothing', c.name);
    } else if (this.mom) {
      for (const n of names) {
        const data = this.game.cd.tryGet(ItemData, n);
        if (data === undefined && !this.raw.has(n)) this.problems.wrong('item-unknown', c.name, { value: n }, 'itemname');
        else if (data !== undefined && !data.sets.some((s) => this.declared.has(s)) && traits.length === 0 && pool.length === 0) {
          this.problems.hint('item-pack-undeclared', c.name, { value: n, pack: this.packOf(data.sets) }, 'itemname');
        }
      }
    } else if (names.length > 0 && traits.length === 0 && pool.length === 0) {
      if (!names.some((n) => this.game.cd.tryGet(ItemData, n) !== undefined || this.raw.has(n))) this.problems.breaks('item-none-exists', c.name, { value: names.join(' ') }, 'itemname');
      for (const n of names) {
        const data = this.game.cd.tryGet(ItemData, n);
        if (data !== undefined && !data.sets.some((s) => this.declared.has(s))) this.problems.hint('item-pack-undeclared', c.name, { value: n, pack: this.packOf(data.sets) }, 'itemname');
      }
    } else {
      const candidates = this.itemCandidates(traits, pool, names);
      if (candidates.length === 0) this.problems.wrong('item-traits-none', c.name, { traits: [...traits, ...pool].join(' ') }, 'traits');
    }
    const inspect = c.data.get('inspect');
    if (inspect && !this.raw.has(inspect)) this.problems.wrong('item-inspect-missing', c.name, { target: inspect }, 'inspect');
    if (this.mom && (c.data.get('vartests') ?? '') !== '' && !isTrue(c.data.get('starting') ?? 'True')) this.problems.hint('item-tests-not-starting', c.name, undefined, 'vartests');
  }

  /** Items of the declared packs a draw by traits can give (Quest.AttemptItemMatch). */
  private itemCandidates(traits: readonly string[], pool: readonly string[], excluded: readonly string[]): string[] {
    const found: string[] = [];
    for (const [name, data] of this.game.cd.getAll(ItemData)) {
      if (excluded.includes(name) || !data.sets.some((s) => this.declared.has(s))) continue;
      if (!traits.every((t) => data.traits.includes(t))) continue;
      if (pool.length > 0 && !pool.some((t) => data.traits.includes(t))) continue;
      found.push(name);
    }
    return found;
  }

  private checkPuzzle(c: RawComponent): void {
    const cls = c.data.get('class') ?? 'slide';
    // Quest.Puzzle: another class opens nothing
    if (!['slide', 'image', 'code', 'tower'].includes(cls)) this.problems.add(this.mom ? 'breaks' : 'wrong', 'puzzle-class', c.name, { value: cls }, 'class');
    const levelText = c.data.get('puzzlelevel') ?? '4';
    const altText = c.data.get('puzzlealtlevel') ?? '3';
    const level = /^\d+$/.test(levelText.trim()) ? Number(levelText) : null;
    const alt = /^\d+$/.test(altText.trim()) ? Number(altText) : null;
    if (this.mom && (level === null || alt === null)) this.problems.breaks('puzzle-level-not-integer', c.name, undefined, 'puzzlelevel');
    if (cls === 'image') {
      const image = c.data.get('image') ?? '';
      if (this.mom) {
        const data = image === '' ? undefined : this.game.cd.tryGet(PuzzleData, image);
        if (image === '') this.problems.breaks('puzzle-image-none', c.name, undefined, 'image');
        else if (data === undefined) this.media(c.name, 'image', image, false);
        else {
          // The pack's pictures are cut for a grid their name says (artRitualRunes_3x3)
          const grid = /(\d)x(\d)/.exec(data.image);
          if (grid !== null && level !== null && alt !== null && `${level}x${alt}` !== `${grid[1]}x${grid[2]}`) {
            this.problems.hint('puzzle-image-grid', c.name, { image, grid: `${grid[1]}x${grid[2]}`, used: `${level}x${alt}` }, 'puzzlelevel');
          }
        }
      } else if (image === '' || !File.exists(Path.combine(this.files.folder, image))) {
        this.crash('puzzle-image-missing-d2e', c.name, undefined, 'image');
      }
    }
    if (this.mom && cls === 'code') {
      const solution = words(c.data.get('puzzlesolution'));
      if (solution.length > 0 && level !== null && alt !== null) {
        if (solution.length !== level) this.problems.wrong('puzzle-solution-length', c.name, { count: solution.length, level }, 'puzzlesolution');
        for (const v of solution) if (!/^\d+$/.test(v) || Number(v) < 1 || Number(v) > alt) this.problems.wrong('puzzle-solution-value', c.name, { value: v, max: alt }, 'puzzlesolution');
      }
      const image = c.data.get('image') ?? '';
      if (image !== '' && image !== 'symbol' && image !== 'element') this.problems.wrong('puzzle-code-image', c.name, { value: image }, 'image');
    }
    if (!this.mom && cls === 'slide' && levelText.trim() === '1') this.crash('puzzle-slide-one', c.name, undefined, 'puzzlelevel');
    if (this.mom) {
      const skill = c.data.get('skill') ?? '{observation}';
      if (!MOM_SYMBOLS.has(skill.replace(/^\{+|\}+$/g, ''))) this.problems.hint('puzzle-skill', c.name, { value: skill }, 'skill');
      if (words(c.data.get('event1')).length === 0) this.problems.hint('puzzle-no-event', c.name, undefined, 'event1');
    }
  }

  // ---- the whole quest

  private ofType(...types: string[]): string[] {
    return this.files.ofType(...types);
  }

  /**
   * customImage is not normalized for tiles and tokens (QuestData.cs): a '\\' only works on Windows. Elsewhere a tile's
   * picture is not found and Valkyrie stops when an event adds it; a token shows the search token instead.
   */
  private checkBackslashes(): void {
    for (const n of this.ofType('Tile', 'Token')) {
      const value = this.raw.get(n)!.data.get('customImage') ?? '';
      if (!value.includes('\\')) continue;
      const tile = this.raw.get(n)!.type === 'Tile';
      if (this.mom && tile && this.added.has(n)) this.problems.breaks('custom-image-backslash-tile', n, { value }, 'customImage');
      else this.problems.wrong(tile ? 'custom-image-backslash-tile' : 'custom-image-backslash', n, { value }, 'customImage');
    }
  }

  private checkStart(): void {
    const starts = this.startEvents;
    const rounds = this.ofType(...EVENT_TYPES).filter((n) => this.raw.get(n)!.data.get('trigger') === 'StartRound');
    if (starts.length === 0 && (this.mom || rounds.length === 0)) this.problems.add(this.mom ? 'breaks' : 'wrong', 'start-none', '');
    if (starts.length > 1) this.problems.wrong('start-several', '', { events: starts.join(' ') });
  }

  private checkEndings(): void {
    if (!this.mom) return;
    if (![...this.raw.values()].some((c) => c.data.get('trigger') === 'Eliminated')) this.problems.wrong('end-no-eliminated', '');
    const endings = this.graph.endings();
    if (endings.length === 0) {
      this.problems.wrong('end-none', '');
      return;
    }
    const timed = endings.filter((n) => /^(EndRound\d*|StartRound|BeforeMonsterActivation|Mythos|EndInvestigatorTurn)$/.test(this.raw.get(n)?.data.get('trigger') ?? ''));
    if (timed.length === 0) this.problems.hint('end-no-time-limit', '');
  }

  private checkReach(): void {
    const reached = this.reached;
    if (this.mom) {
      for (const c of this.raw.values()) {
        if (c.type === null || reached.has(c.name)) continue;
        if (['Tile', 'Token', 'UI', 'Door'].includes(c.type) && !this.added.has(c.name)) this.problems.wrong('never-added', c.name);
        else if (['Event', 'Spawn', 'Puzzle'].includes(c.type)) this.problems.wrong('never-run', c.name);
        else if (c.type === 'QItem' && !this.added.has(c.name)) this.problems.hint('item-never-given', c.name);
      }
      return;
    }
    const unreached = this.ofType('Event', 'Spawn', 'Puzzle').filter((n) => !reached.has(n));
    if (unreached.length > 0) this.problems.hint('unreached-events', '', { count: unreached.length, events: unreached.slice(0, 12).join(' ') });
  }

  /** A UI element left on the board blocks the phase (MoM) or the heroes' window (Descent): Quest.UIItemsPresent. */
  private checkUIStaying(): void {
    const removesAll = this.removed.has('#uicomponents') || this.removed.has('#boardcomponents');
    if (removesAll) return;
    if (!this.mom && this.ofType('Tile').length === 0) return;
    const changesQuest = this.graph.links.some((l) => l.kind === 'quest');
    for (const ui of this.ofType('UI')) {
      const adders = this.added.get(ui);
      if (adders === undefined || this.removed.has(ui)) continue;
      if (!this.mom && !this.reached.has(ui)) continue;
      // An end screen stays on purpose: the event that adds it, or an element added with it, ends the game
      const final = adders.some((e) => this.leadsToEndOrQuest(e) || words(this.raw.get(e)?.data.get('add')).some((u) => componentType(u) === 'UI' && this.leadsToEndOrQuest(u)));
      if (final || (!this.mom && this.leadsToEndOrQuest(ui))) continue;
      if (!this.mom && changesQuest) this.problems.hint('ui-stays-quest-change', ui);
      else this.problems.wrong('ui-stays', ui);
    }
  }

  private leadsToEndOrQuest(name: string): boolean {
    if (this.graph.leadsToEnd(name)) return true;
    if (this.mom) return false;
    return this.graph.links.some((l) => l.from === name && l.kind === 'quest');
  }

  private checkVariableNames(): void {
    const written = this.graph.written;
    const read = this.graph.read;
    const all = new Set([...written.keys(), ...read.keys()]);
    if (this.mom) {
      // Var triggers: @name set to 1 starts the events with trigger=Varname
      const varTriggers = new Set(
        this.ofType(...EVENT_TYPES)
          .map((n) => this.raw.get(n)!.data.get('trigger') ?? '')
          .filter((t) => t.startsWith('Var'))
          .map((t) => t.substring(3)),
      );
      for (const v of written.keys()) {
        if (v.startsWith('@') && !varTriggers.has(v.substring(1))) this.problems.wrong('var-trigger-none', '', { variable: v });
        if (v.startsWith('$@') && !varTriggers.has('$' + v.substring(2))) this.problems.wrong('var-trigger-none', '', { variable: v });
      }
      for (const t of varTriggers) if (!t.startsWith('$') && !written.has('@' + t)) this.problems.wrong('var-trigger-not-set', '', { trigger: 'Var' + t });
      const builtIn = new Set([
        '#round',
        '#heroes',
        '#monsters',
        '#eliminated',
        '#eliminatedprev',
        '#eliminatedcomplete',
        '#MoM1E',
        '#FA',
        '#CotW',
        ...this.game.cd.allPacks.map((p) => '#' + p.id),
        ...this.chosenVariables(),
      ]);
      for (const v of all) {
        if (v.startsWith('#') && !v.startsWith('#rand') && !builtIn.has(v)) this.problems.wrong('var-builtin-unknown', '', { variable: v });
        if (v === 'mythosUnfinished') this.problems.wrong('var-mythos-unfinished', '', { variable: v });
      }
    } else {
      const chosen = new Set(this.chosenVariables());
      for (const v of all) {
        if (v.startsWith('#') && !D2E_READ.has(v) && !v.startsWith('#rand') && !this.game.cd.allPacks.some((p) => '#' + p.id === v) && !chosen.has(v) && v !== '#eliminated' && !written.has(v)) {
          this.problems.hint('var-builtin-unknown-d2e', '', { variable: v });
        }
        if (v.startsWith('$') && !D2E_WRITTEN.has(v)) {
          if (v.startsWith('$%')) this.problems.hint('var-campaign-own', '', { variable: v });
          else this.problems.wrong('var-dollar-unknown', '', { variable: v });
        }
      }
      if (read.has('#eliminated')) this.problems.wrong('var-eliminated-d2e', '');
    }
    // Names that only differ in letter case are different variables
    const byLower = new Map<string, string[]>();
    for (const v of all) {
      const list = byLower.get(v.toLowerCase()) ?? [];
      list.push(v);
      byLower.set(v.toLowerCase(), list);
    }
    if (this.mom) for (const list of byLower.values()) if (list.length > 1) this.problems.wrong('var-letter-case', '', { variables: list.sort().join(' ') });
    for (const v of read.keys()) {
      if (v.startsWith('#') || v.startsWith('$') || v.startsWith('%') || NUMBER.test(v) || written.has(v)) continue;
      this.problems.hint('var-never-set', '', { variable: v, where: read.get(v)![0]!.component });
    }
    // VarManager.TrimQuest, on a change of quest, reads the first two letters of every variable an operation or a test
    // used (GetOpValue adds them), and throws on a shorter name; Descent, where campaigns are common, hints it anyway
    const switches = this.graph.links.some((l) => l.kind === 'quest');
    const used = new Set([...written.keys(), ...[...read].filter(([, uses]) => uses.some((u) => u.how === 'test' || u.how === 'button')).map(([v]) => v)]);
    for (const v of used) {
      if (v.length >= 2) continue;
      if (switches) this.problems.breaks('var-one-char', '', { variable: v });
      else if (!this.mom) this.problems.hint('var-one-char', '', { variable: v });
    }
  }

  /** Variables Valkyrie sets when heroes are chosen: #<hero>, and in Descent #<class> too. */
  private chosenVariables(): string[] {
    const names = [...this.game.cd.getAll(HeroData)].map(([name]) => '#' + name);
    if (!this.mom) names.push(...[...this.game.cd.getAll(ClassData)].map(([name]) => '#' + name));
    return names;
  }

  /** Marks in the texts: symbols of the other game, components and texts that are not there. */
  private checkTexts(): void {
    const names = this.raw;
    const parameters = new Set<string>();
    for (const entries of this.files.texts.values()) for (const v of entries.values()) for (const m of v.matchAll(/:\{([A-Za-z0-9_]+)\}:/g)) parameters.add(m[1]!);
    for (const [language, entries] of this.files.texts) {
      for (const [key, value] of entries) {
        const where = 'texts ' + language;
        if (this.mom && key.endsWith('.text') && (value.length > 900 || value.split('\n').length - 1 > 14)) this.problems.wrong('text-long', where, { key, length: value.length }, key);
        for (const m of value.matchAll(/\{c:(((?!\{)[\s\S])*?)\}/g)) {
          // EventManager.ReplaceComponentText leaves the mark as it is, also when a line break splits it (its '.' stops there)
          if (!names.has(m[1]!)) this.problems.wrong('text-component-missing', where, { key, name: m[1]! }, key);
        }
        for (const lookup of lookups(value, this.dictionaries)) {
          // LocalizationRead.DictLookup reads past the end of a lookup that is not closed, and throws
          if (lookup.key === null) this.problems.breaks('text-mark-unclosed', where, { key, dict: lookup.dict }, key);
          else if (lookup.dict === 'qst' && this.files.text(lookup.key, language) === null) this.problems.add(this.mom ? 'hint' : 'wrong', 'text-key-missing', where, { key, name: lookup.key }, key);
          else if (lookup.dict === 'ffg' && this.ffg !== null && !this.ffg.keyExists(lookup.key)) this.problems.hint('text-ffg-unknown', where, { key, name: lookup.key }, key);
        }
        if (this.mom && value.includes('{rnd:hero}') && /\.button[123]$/.test(key)) this.problems.hint('text-random-hero-button', where, { key }, key);
        for (const m of value.matchAll(/\{([A-Za-z0-9_]+)\}/g)) {
          const mark = m[1]!;
          if (this.mom) {
            if (MOM_SYMBOLS.has(mark) || MOM_PACK_SYMBOLS.has(mark) || mark === 'type' || parameters.has(mark)) continue;
            if (mark === '0' && (key.startsWith('Activation') || key.startsWith('CustomMonster'))) continue;
            if (['heart', 'fatigue', 'might', 'knowledge', 'awareness', 'shield', 'surge'].includes(mark)) this.problems.wrong('text-symbol-d2e', where, { key, mark }, key);
            else if (mark === 'MAD24') this.problems.wrong('text-symbol-mad24', where, { key }, key);
            else this.problems.hint('text-mark-unknown', where, { key, mark }, key);
          } else if (['strength', 'agility', 'lore', 'influence', 'observation', 'success', 'clue'].includes(mark)) {
            this.problems.wrong('text-symbol-mom', where, { key, mark }, key);
          }
        }
      }
      // Texts of components that are not there, and languages with texts missing
      if (this.mom) {
        const orphans = [...entries.keys()].filter((k) => k.includes('.') && !k.startsWith('quest.') && !names.has(k.substring(0, k.indexOf('.'))));
        if (orphans.length > 0) this.problems.hint('texts-orphans', 'texts ' + language, { count: orphans.length, example: orphans[0]! });
      }
    }
    if (!this.mom) return;
    const base = this.files.texts.get(this.files.defaultLanguage);
    if (base === undefined) return;
    for (const [language, entries] of this.files.texts) {
      if (language === this.files.defaultLanguage) continue;
      const missing = [...base.keys()].filter((k) => !entries.has(k) && !base.get(k)!.startsWith('{qst:'));
      if (missing.length > 0) this.problems.hint('texts-missing-language', 'texts ' + language, { count: missing.length, language: this.files.defaultLanguage });
    }
  }

  // ---- Mansions only

  /** Quest.AttemptItemMatch: items drawn at the start, in the files' order; a named item is not checked for duplicates. */
  private checkItemDraws(): void {
    const items = this.ofType('QItem');
    const named = new Map<string, string>();
    for (const n of items) {
      const c = this.raw.get(n)!;
      if (words(c.data.get('traits')).length > 0 || words(c.data.get('traitpool')).length > 0) continue;
      const first = words(c.data.get('itemname')).find((x) => this.game.cd.tryGet(ItemData, x) !== undefined);
      if (first === undefined) continue;
      if (named.has(first)) this.problems.wrong('item-twice', n, { item: first, other: named.get(first)! }, 'itemname');
      else named.set(first, n);
    }
    items.forEach((n, i) => {
      const c = this.raw.get(n)!;
      const traits = words(c.data.get('traits'));
      const pool = words(c.data.get('traitpool'));
      if (traits.length === 0 && pool.length === 0) return;
      const excluded = words(c.data.get('itemname'));
      const candidates = this.itemCandidates(traits, pool, excluded);
      for (const [item, by] of named) {
        if (items.indexOf(by) < i || excluded.includes(item)) continue;
        const data = this.game.cd.tryGet(ItemData, item);
        if (data === undefined || !traits.every((t) => data.traits.includes(t)) || (pool.length > 0 && !pool.some((t) => data.traits.includes(t)))) continue;
        const chance = candidates.includes(item) && candidates.length > 0 ? 1 / candidates.length : 0;
        this.problems.add(chance >= 0.2 ? 'wrong' : 'hint', 'item-drawn-before', n, { item, other: by, percent: Math.round(chance * 100) }, 'traits');
      }
    });
  }

  private checkMythos(): void {
    const written = [...this.graph.written.keys()];
    if (!written.some((v) => v.startsWith('$mythos'))) this.problems.hint('mythos-none', '');
    else if (!written.some((v) => ['$mythosMinor', '$mythosMajor', '$mythosDeadly', '$mythosHelp', '$mythosFlavor'].includes(v))) this.problems.wrong('mythos-no-intensity', '');
  }

  private checkFigures(): void {
    const count = new Map<string, number>();
    for (const n of this.ofType('Spawn')) {
      const c = this.raw.get(n)!;
      if (c.data.get('traits') || c.data.get('traitpool')) continue;
      let m = words(c.data.get('monster'))[0] ?? '';
      if (m.startsWith('CustomMonster') && this.raw.has(m)) m = this.raw.get(m)!.data.get('base') ?? '';
      else if (m !== '' && !m.startsWith('Monster') && !m.startsWith('Spawn')) m = 'Monster' + m;
      if (FIGURES[m] !== undefined) count.set(m, (count.get(m) ?? 0) + 1);
    }
    for (const [m, n] of count) if (n > FIGURES[m]!) this.problems.hint('monster-figures', '', { monster: m, count: n, figures: FIGURES[m]! });
  }

  private checkTileSides(): void {
    const sides = new Map<string, string[]>();
    for (const n of this.ofType('Tile')) {
      let side = this.raw.get(n)!.data.get('side') ?? '';
      if (side === '') continue;
      if (!this.mom && this.game.cd.tryGet(TileSideData, side) === undefined) side = 'TileSide' + side;
      sides.set(side, [...(sides.get(side) ?? []), n]);
    }
    for (const [side, tiles] of sides) {
      const data = this.game.cd.tryGet(TileSideData, side);
      // Descent's boxes bring several of each connector (end caps, extensions…) and DooM's several of some pieces: only a numbered piece is unique
      if (!this.mom && (data === undefined || !/^\d+[AB]$/.test(data.name.key) || data.sets.includes('DooM'))) continue;
      const reverse = data?.reverse ?? '';
      // One piece of cardboard: both faces can only be used if they are never on the board at once
      if (reverse !== '' && sides.has(reverse) && side < reverse) this.problems.hint('tile-both-sides', '', { side, reverse });
      if (tiles.length > 1) this.problems.hint('tile-side-twice', '', { side, tiles: tiles.join(' ') });
    }
  }

  // ---- Descent only

  private checkShop(): void {
    const shops = this.ofType(...EVENT_TYPES).filter((n) => words(this.raw.get(n)!.data.get('add')).filter((a) => this.raw.get(a)?.type === 'QItem').length > 1);
    // ShopInterface closes only with remove=#shop
    if (shops.length > 0 && !this.removed.has('#shop')) this.problems.wrong('shop-never-closed', '');
  }

  /**
   * EventManager.TriggerEvent: a spawn of a monster whose group is on the board joins that group (MonstersGrouped),
   * which keeps its first spawn's name, so a defeat trigger named after the later spawn does not run. Which comes first
   * is taken from the order the scenario reads in (QuestGraph.readingOrder).
   */
  private checkJoinedGroups(): void {
    const { reached, loose } = this.graph.readingOrder();
    const order = new Map([...reached, ...loose].map((name, i) => [name, i]));
    const at = (name: string) => order.get(name) ?? Number.MAX_SAFE_INTEGER;
    for (const n of this.ofType(...EVENT_TYPES)) {
      const trigger = this.raw.get(n)!.data.get('trigger') ?? '';
      const prefix = trigger.startsWith('DefeatedUnique') ? 'DefeatedUnique' : trigger.startsWith('Defeated') ? 'Defeated' : null;
      if (prefix === null) continue;
      const spawn = trigger.substring(prefix.length);
      const monster = this.spawnMonster.get(spawn);
      if (monster === undefined) continue;
      const before = [...this.spawnMonster].filter(([s, m]) => s !== spawn && m === monster && at(s) < at(spawn)).sort(([a], [b]) => at(a) - at(b));
      if (before.length > 0) this.problems.hint('trigger-defeated-joined', n, { trigger, spawn: before[0]![0], monster }, 'trigger');
    }
  }

  private checkMorale(): void {
    const noMorale = this.ofType(...EVENT_TYPES).filter((n) => this.raw.get(n)!.data.get('trigger') === 'NoMorale');
    const changesQuest = this.graph.links.some((l) => l.kind === 'quest');
    if (noMorale.length === 0 && this.isRoot && !changesQuest) this.problems.wrong('morale-no-defeat', '');
    for (const e of noMorale) {
      // NoMorale fires again after every event while the morale stays below 0
      const c = this.qd.components.get(e);
      const tested = new Set((c?.tests?.varTestsComponents ?? []).filter((t) => t instanceof VarOperation).map((t) => (t as VarOperation).var));
      const guarded = (c?.operations ?? []).some((op) => tested.has(op.var));
      if (!guarded && !this.moraleWayOut(e, new Set())) this.problems.wrong('morale-repeats', e);
    }
  }

  private moraleWayOut(name: string, seen: Set<string>): boolean {
    if (seen.has(name)) return false;
    seen.add(name);
    const c = this.qd.components.get(name);
    if (c === undefined) return false;
    if (endsGame(c) || (c.operations ?? []).some((op) => op.var === '$%morale' && (op.operation === '=' || op.operation === '+'))) return true;
    for (const link of this.graph.outgoing.get(name) ?? []) {
      if (link.kind === 'quest') return true;
      if (link.kind === 'button' && this.moraleWayOut(link.to, seen)) return true;
    }
    return false;
  }

  private checkPlaces(): void {
    const used = new Set<string>();
    for (const n of this.ofType('Spawn')) {
      for (const [k, v] of this.raw.get(n)!.data) if (/^placement\d+$/.test(k)) for (const p of words(v)) used.add(p);
    }
    for (const n of this.ofType('MPlace')) if (!used.has(n)) this.problems.hint('mplace-unused', n);
    for (const [pack, comps] of this.usedButUndeclared) {
      const tested = [...this.graph.read.keys()].includes('#' + pack);
      this.problems.add(tested ? 'hint' : 'wrong', tested ? 'pack-undeclared-tested' : 'pack-undeclared', '', { pack, components: [...comps].slice(0, 6).join(' ') }, 'packs');
    }
  }
}

/**
 * Reads a quest's files and loads it as Valkyrie does (which sets the scenario dictionary), for the checks. When
 * Valkyrie cannot load it (an exception, or a fatal error), qd is null and `error` says why.
 */
export function readQuestForChecks(questIni: string): { files: ScenarioFiles; qd: QuestData | null; error?: string } {
  const files = ScenarioFiles.read(questIni);
  const fatal = Application.fatalErrors.length;
  // QuestData.LoadQuestData puts the quest's texts in the dictionary 'qst', which the quest being played or edited uses
  const qst = LocalizationRead.selectDictionary('qst');
  try {
    const qd = new QuestData(questIni);
    if (Application.fatalErrors.length > fatal) return { files, qd: null, error: Application.fatalErrors.at(-1)!.message };
    return { files, qd };
  } catch (e) {
    return { files, qd: null, error: e instanceof Error ? e.message : String(e) };
  } finally {
    Application.fatalErrors.length = fatal;
    LocalizationRead.removeDictionary('qst');
    if (qst !== null) LocalizationRead.addDictionary('qst', qst);
  }
}
