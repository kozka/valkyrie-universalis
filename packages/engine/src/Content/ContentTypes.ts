// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/ContentTypes.cs
// Section data comes as Map<string, string>, as IniData gives it. PerilData lives in PerilData.ts,
// because it extends QuestData.Event and would otherwise make a circular class dependency.
import { Game } from '../Game.ts';
import { boolTryParse, dictGet, floatTryParse, intTryParse, split } from '../platform/CSharp.ts';
import { Random } from '../platform/Random.ts';
import { Path } from '../platform/SystemIO.ts';
import { ValkyrieConstants } from '../ValkyrieConstants.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { ContentData } from './ContentData.ts';
import type { IContent } from './IContent.ts';
import { StringKey } from './StringKey.ts';

// Super class for all content loaded from content packs
// Valkyrie: ContentTypes.cs GenericData
export class GenericData implements IContent {
  // name from section title or data
  name: StringKey = StringKey.NULL;
  // sets from which this belogs (expansions)
  sets: string[] = [];
  // section name
  sectionName = '';
  // List of traits
  traits: string[] = [];
  // Path to image
  image = '';
  // for sub classes to set type
  static type = '';
  // priority for duplicates
  priority = 0;

  get translationKey(): StringKey {
    return this.name;
  }

  /** GenericData() when called without arguments; the generic constructor gets common things. */
  // Valkyrie: ContentTypes.cs GenericData.GenericData
  constructor(name_ini?: string, content?: Map<string, string>, path?: string, type?: string, sets?: string[] | null) {
    if (content === undefined) return;
    this.sectionName = name_ini as string;
    this.sets = sets ?? [];

    // Has the name been specified?
    if (content.has('name')) {
      this.name = new StringKey(content.get('name')!);
    } else {
      // Some callers pass a section name that may not include the type prefix
      // (for example when creating a dummy TileSide from a file path). Guard
      // against calling Substring with an out-of-range start index.
      let displayName = name_ini ?? '';
      if (type && displayName.length > type.length && displayName.startsWith(type)) {
        displayName = displayName.substring(type.length);
      }
      this.name = new StringKey(null, displayName);
    }

    this.priority = 0;
    if (content.has('priority')) {
      this.priority = intTryParse(content.get('priority')).value;
    }

    if (content.has('traits')) {
      this.traits = split(content.get('traits')!, [' ']);
    } else {
      // No traits is a valid condition
      this.traits = [];
    }

    // If image specified it is relative to the path of the ini file
    // absolute paths are not supported
    // resolve optional images like image, image2, image3 and so on
    let count = 0;
    while (true) {
      const key = 'image' + (count > 0 ? String(count + 1) : '');
      if (!content.has(key)) {
        this.image = ''; // No image is a valid condition
        break;
      }
      const value = content.get(key)!;
      if (value.startsWith('{import}')) {
        this.image = Path.combine(ContentData.importPath(), value.substring(9));
      } else {
        this.image = Path.combine(path as string, value);
      }
      if (ContentData.resolveTextureFile(this.image) !== null) {
        break;
      }
      count++;
    }
  }

  // Does the component contain a trait?
  // Valkyrie: ContentTypes.cs GenericData.ContainsTrait
  containsTrait(trait: string): boolean {
    for (const s of this.traits) {
      if (trait === s) {
        return true;
      }
    }
    return false;
  }
}

// Valkyrie: ContentTypes.cs PackTypeData
export class PackTypeData extends GenericData {
  static override type = ValkyrieConstants.PackType;

  constructor(name: string, content: Map<string, string>, path: string, sets: string[] | null = null) {
    super(name, content, path, PackTypeData.type, sets);
  }
}

// Class for tile specific data
// Valkyrie: ContentTypes.cs TileSideData
export class TileSideData extends GenericData {
  top = 0;
  left = 0;
  pxPerSquare = 0;
  aspect = 0;
  reverse = '';
  static override type = 'TileSide';

  constructor(name: string, content: Map<string, string>, path: string, sets: string[] | null = null) {
    super(name, content, path, TileSideData.type, sets);
    // Get location of top left square in tile image, default 0
    if (content.has('top')) {
      this.top = floatTryParse(content.get('top')).value;
    }
    if (content.has('left')) {
      this.left = floatTryParse(content.get('left')).value;
    }

    // pixel per D2E square (inch) of image (not in Valkyrie: given the picture, for an import made on Android, see
    // MoMGameType.tilePixelPerSquare)
    if (content.has('pps')) {
      const pps = content.get('pps')!;
      if (pps.startsWith('*')) {
        this.pxPerSquare = floatTryParse(pps.substring(1)).value;
        this.pxPerSquare = Math.fround(this.pxPerSquare * Game.get().gameType.tilePixelPerSquare(this.image));
      } else {
        this.pxPerSquare = floatTryParse(pps).value;
      }
    } else {
      this.pxPerSquare = Game.get().gameType.tilePixelPerSquare(this.image);
    }

    // Some MoM tiles have crazy aspect
    if (content.has('aspect')) {
      this.aspect = floatTryParse(content.get('aspect')).value;
    }

    // Other side used for validating duplicate use
    if (content.has('reverse')) {
      this.reverse = content.get('reverse')!;
    }
  }
}

// Class for Hero specific data
// Valkyrie: ContentTypes.cs HeroData
export class HeroData extends GenericData {
  archetype = 'warrior';
  static override type = 'Hero';
  item = '';

  constructor(name: string, content: Map<string, string>, path: string, sets: string[] | null = null) {
    super(name, content, path, HeroData.type, sets);
    // Get archetype
    if (content.has('archetype')) {
      this.archetype = content.get('archetype')!;
    }
    // Get starting item
    if (content.has('item')) {
      this.item = content.get('item')!;
    }
  }
}

// Class for Class specific data
// Valkyrie: ContentTypes.cs ClassData
export class ClassData extends GenericData {
  archetype = 'warrior';
  hybridArchetype = '';
  static override type = 'Class';
  items: string[] = [];

  constructor(name: string, content: Map<string, string>, path: string, sets: string[] | null = null) {
    super(name, content, path, ClassData.type, sets);
    // Get archetype
    if (content.has('archetype')) {
      this.archetype = content.get('archetype')!;
    }
    // Get hybridArchetype
    if (content.has('hybridarchetype')) {
      this.hybridArchetype = content.get('hybridarchetype')!;
    }
    // Get starting item
    this.items = [];
    if (content.has('items')) {
      this.items.push(...split(content.get('items')!, [' '], undefined, true));
    }
  }
}

// Class for Class specific data
// Valkyrie: ContentTypes.cs SkillData
export class SkillData extends GenericData {
  static override type = 'Skill';
  xp = 0;

  constructor(name: string, content: Map<string, string>, path: string, sets: string[] | null = null) {
    super(name, content, path, SkillData.type, sets);
    // Get archetype
    if (content.has('xp')) {
      this.xp = intTryParse(content.get('xp')).value;
    }
  }
}

// Class for Item specific data
// Valkyrie: ContentTypes.cs ItemData
export class ItemData extends GenericData {
  static override type = 'Item';
  unique = false;
  price = 0;
  minFame = -1;
  maxFame = -1;

  constructor(name: string, content: Map<string, string>, path: string, sets: string[] | null = null) {
    super(name, content, path, ItemData.type, sets);
    if (name.indexOf('ItemUnique') === 0) {
      this.unique = true;
    }
    if (content.has('price')) {
      this.price = intTryParse(content.get('price')).value;
    }
    if (content.has('minfame')) {
      this.minFame = ItemData.fame(content.get('minfame')!);
    }
    if (content.has('maxfame')) {
      this.maxFame = ItemData.fame(content.get('maxfame')!);
    }
  }

  // Valkyrie: ContentTypes.cs ItemData.Fame
  static fame(name: string): number {
    if (name === 'insignificant') return 1;
    if (name === 'noteworthy') return 2;
    if (name === 'impressive') return 3;
    if (name === 'celebrated') return 4;
    if (name === 'heroic') return 5;
    if (name === 'legendary') return 6;
    return 0;
  }
}

// Class for Hero specific data
// Valkyrie: ContentTypes.cs MonsterData
export class MonsterData extends GenericData {
  info: StringKey = new StringKey(null, '-', false);
  imagePlace = '';
  static override type = 'Monster';
  activations: string[] = [];
  healthBase = 0;
  healthPerHero = 0;
  horror = 0;
  awareness = 0;

  /** MonsterData() with no arguments exists for the quest version of this class to do nothing. */
  constructor(name?: string, content?: Map<string, string>, path?: string, sets?: string[] | null) {
    super(name, content, path, MonsterData.type, sets);
    if (content === undefined) return;
    // Get usage info
    if (content.has('info')) {
      this.info = new StringKey(content.get('info')!);
    }
    if (content.has('imageplace')) {
      const imageplace = content.get('imageplace')!;
      if (imageplace.indexOf('{import}') === 0) {
        this.imagePlace = ContentData.importPath() + imageplace.substring(8);
      } else {
        this.imagePlace = path + Path.DirectorySeparatorChar + imageplace;
      }
    } else {
      // No image is a valid condition
      this.imagePlace = this.image;
    }
    this.activations = [];
    if (content.has('activation')) {
      this.activations = content.get('activation')!.split(' ');
    }
    if (content.has('health')) {
      this.healthBase = floatTryParse(content.get('health')).value;
    }
    if (content.has('healthperhero')) {
      this.healthPerHero = floatTryParse(content.get('healthperhero')).value;
    }
    if (content.has('horror')) {
      this.horror = intTryParse(content.get('horror')).value;
    }
    if (content.has('awareness')) {
      this.awareness = intTryParse(content.get('awareness')).value;
    }
  }

  // Valkyrie: ContentTypes.cs MonsterData.GetAttackTypes
  getAttackTypes(): Iterable<string> {
    const toReturn = new Set<string>();
    for (const kv of Game.get().cd.values(AttackData)) {
      if (this.containsTrait(kv.target)) {
        toReturn.add(kv.attackType);
      }
    }
    return toReturn;
  }

  // Valkyrie: ContentTypes.cs MonsterData.GetRandomAttack
  getRandomAttack(type: string): StringKey {
    const validAttacks: AttackData[] = [];
    for (const ad of Game.get().cd.values(AttackData)) {
      if (ad.attackType === type) {
        if (this.traits.length === 0) {
          ValkyrieDebug.log('Monster with no traits, this should not happen');
          validAttacks.push(ad);
        } else if (this.traits.includes(ad.target)) {
          validAttacks.push(ad);
        }
      }
    }
    const index = Random.range(0, validAttacks.length);
    if (index >= validAttacks.length) throw new RangeError('ArgumentOutOfRangeException: no valid attack');
    return validAttacks[index]!.text;
  }
}

// Class for Activation specific data
// Valkyrie: ContentTypes.cs ActivationData
export class ActivationData extends GenericData {
  ability: StringKey = new StringKey(null, '-', false);
  minionActions: StringKey = StringKey.NULL;
  masterActions: StringKey = StringKey.NULL;
  moveButton: StringKey = StringKey.NULL;
  move: StringKey = StringKey.NULL;
  static override type = 'MonsterActivation';
  masterFirst = false;
  minionFirst = false;

  /** ActivationData() with no arguments does nothing, for the quest version. */
  constructor(name?: string, content?: Map<string, string>, path?: string, sets: string[] | null = null) {
    super(name, content, path, ActivationData.type, sets);
    if (content === undefined) return;
    // Get ability
    if (content.has('ability')) {
      this.ability = new StringKey(content.get('ability')!);
    }
    // Get minion activation info
    if (content.has('minion')) {
      this.minionActions = new StringKey(content.get('minion')!);
    }
    // Get master activation info
    if (content.has('master')) {
      this.masterActions = new StringKey(content.get('master')!);
    }
    if (content.has('movebutton')) {
      this.moveButton = new StringKey(content.get('movebutton')!);
    }
    if (content.has('move')) {
      this.move = new StringKey(content.get('move')!);
    }
    if (content.has('masterfirst')) {
      this.masterFirst = boolTryParse(content.get('masterfirst')).value;
    }
    if (content.has('minionfirst')) {
      this.minionFirst = boolTryParse(content.get('minionfirst')).value;
    }
  }
}

// Class for Token data
// Valkyrie: ContentTypes.cs TokenData
export class TokenData extends GenericData {
  x = 0;
  y = 0;
  height = 0;
  width = 0;
  // 0 means token is 1 square big
  pxPerSquare = 0;
  static override type = 'Token';

  /** TokenData(name, content, path, sets) or, with typeIn, the constructor ImageData uses. */
  constructor(name: string, content: Map<string, string>, path: string, setsOrType: string[] | string | null = null, sets: string[] | null = null) {
    const typeIn = typeof setsOrType === 'string' ? setsOrType : TokenData.type;
    super(name, content, path, typeIn, typeof setsOrType === 'string' ? sets : setsOrType);
    this.init(content);
  }

  // Valkyrie: ContentTypes.cs TokenData.init (the Android-only x_android and y_android keys are not used on the web)
  init(content: Map<string, string>): void {
    if (content.has('x')) {
      this.x = intTryParse(content.get('x')).value;
    }

    if (content.has('y')) {
      this.y = intTryParse(content.get('y')).value;
    }

    // These are used to extract part of an image (atlas) for the token
    if (content.has('height')) {
      this.height = intTryParse(content.get('height')).value;
    }
    if (content.has('height')) {
      // Valkyrie checks "height" before reading "width", so a height without width throws
      this.width = intTryParse(dictGet(content, 'width')).value;
    }
    // pixel per D2E square (inch) of image
    if (content.has('pps')) {
      this.pxPerSquare = floatTryParse(content.get('pps')).value;
    }
  }

  // Valkyrie: ContentTypes.cs TokenData.FullImage
  fullImage(): boolean {
    if (this.height === 0) return true;
    if (this.width === 0) return true;
    return false;
  }
}

// Class for Investigator Attacks
// Valkyrie: ContentTypes.cs AttackData
export class AttackData extends GenericData {
  static override type = 'Attack';

  // Attack text
  text: StringKey = StringKey.NULL;
  // Target type (human, spirit...)
  target = '';
  // Attack type (heavy, unarmed)
  attackType = '';

  constructor(name: string, content: Map<string, string>, path: string, sets: string[] | null = null) {
    super(name, content, path, AttackData.type, sets);
    // Get attack text
    if (content.has('text')) {
      this.text = new StringKey(content.get('text')!);
    }

    // Get attack target
    if (content.has('target')) {
      this.target = content.get('target')!;
    }

    // Get attack type
    if (content.has('attacktype')) {
      this.attackType = content.get('attacktype')!;
    }
  }
}

// Class for Investigator Evades
// Valkyrie: ContentTypes.cs EvadeData
export class EvadeData extends GenericData {
  static override type = 'Evade';

  // Evade text
  text: StringKey = StringKey.NULL;
  monster = '';

  constructor(name: string, content: Map<string, string>, path: string, sets: string[] | null = null) {
    super(name, content, path, EvadeData.type, sets);
    // Get attack text
    if (content.has('text')) {
      this.text = new StringKey(content.get('text')!);
    }

    // Get attack target
    if (content.has('monster')) {
      this.monster = content.get('monster')!;
    }
  }
}

// Class for Horror Checks
// Valkyrie: ContentTypes.cs HorrorData
export class HorrorData extends GenericData {
  static override type = 'Horror';

  // Evade text
  text: StringKey = StringKey.NULL;
  monster = '';

  constructor(name: string, content: Map<string, string>, path: string, sets: string[] | null = null) {
    super(name, content, path, HorrorData.type, sets);
    // Get attack text
    if (content.has('text')) {
      this.text = new StringKey(content.get('text')!);
    }

    // Get attack target
    if (content.has('monster')) {
      this.monster = content.get('monster')!;
    }
  }
}

// Class for Puzzle images
// Valkyrie: ContentTypes.cs PuzzleData
export class PuzzleData extends GenericData {
  static override type = 'Puzzle';

  constructor(name: string, content: Map<string, string>, path: string, sets: string[] | null) {
    super(name, content, path, PuzzleData.type, sets);
  }
}

// Class for images
// Valkyrie: ContentTypes.cs ImageData
export class ImageData extends TokenData {
  static override type = 'Image';

  constructor(name: string, content: Map<string, string>, path: string, sets: string[] | null) {
    super(name, content, path, ImageData.type, sets);
  }
}

// Class for Audio
// Valkyrie: ContentTypes.cs AudioData
export class AudioData extends GenericData {
  static override type = 'Audio';
  file = '';

  constructor(name: string, content: Map<string, string>, path: string, sets: string[] | null) {
    super(name, content, path, AudioData.type, sets);
    if (content.has('file')) {
      const file = content.get('file')!;
      if (file.indexOf('{import}') === 0) {
        this.file = ContentData.importPath() + file.substring(8);
      } else {
        this.file = path + Path.DirectorySeparatorChar + file;
      }
    }
  }
}
