// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/CommonStringKeys.cs
import { StringKey } from './StringKey.ts';

const VAL = 'val';

// Valkyrie: CommonStringKeys.cs CommonStringKeys
export class CommonStringKeys {
  /**
   * StringKey with pattern {0}:
   */
  static readonly X_COLON = new StringKey(VAL, 'X_COLON');
  static readonly BACK = new StringKey(VAL, 'BACK');
  static readonly CLOSE = new StringKey(VAL, 'CLOSE');
  static readonly EXIT = new StringKey(VAL, 'EXIT');
  static readonly E = new StringKey(VAL, 'E');
  static readonly POSITION = new StringKey(VAL, 'POSITION');
  static readonly POSITION_SNAP = new StringKey(VAL, 'POSITION_SNAP');
  static readonly POSITION_FREE = new StringKey(VAL, 'POSITION_FREE');
  static readonly PLUS = new StringKey(null, '+', false);
  static readonly MINUS = new StringKey(null, '-', false);
  static readonly CONDITION = new StringKey(null, '?', false);
  static readonly HASH = new StringKey(null, '#', false);
  static readonly TAB = new StringKey(null, '➤', false);
  static readonly UP = new StringKey(null, '▲', false);
  static readonly DOWN = new StringKey(null, '▼', false);
  static readonly TOP = new StringKey(VAL, 'TOP');
  static readonly LEFT = new StringKey(VAL, 'LEFT');
  static readonly EVENT = new StringKey(VAL, 'EVENT');
  static readonly OK = new StringKey(VAL, 'OK');
  static readonly CANCEL = new StringKey(VAL, 'CANCEL');
  static readonly NONE = new StringKey(VAL, 'NONE');
  static readonly TRAITS = new StringKey(VAL, 'TRAITS');
  static readonly PLACEMENT = new StringKey(VAL, 'PLACEMENT');
  static readonly CONTINUE = new StringKey('val', 'CONTINUE');

  static readonly FINISHED = new StringKey(VAL, 'FINISHED');

  static readonly SKILL = new StringKey(VAL, 'SKILL');
  static readonly MOVES = new StringKey(VAL, 'MOVES');
  static readonly TOTAL_MOVES = new StringKey(VAL, 'TOTAL_MOVES');

  static readonly TRUE = new StringKey(VAL, 'TRUE');
  static readonly FALSE = new StringKey(VAL, 'FALSE');
  static readonly TESTS = new StringKey('val', 'TESTS');
  static readonly VAR = new StringKey('val', 'VAR');
  static readonly OP = new StringKey('val', 'OP');
  static readonly VALUE = new StringKey('val', 'VALUE');
  static readonly ASSIGN = new StringKey('val', 'ASSIGN');
  static readonly VAR_NAME = new StringKey('val', 'VAR_NAME');
  static readonly AND = new StringKey('val', 'AND');
  static readonly OR = new StringKey('val', 'OR');

  static readonly FILE = new StringKey(VAL, 'FILE');
  static readonly BASE = new StringKey(VAL, 'BASE');
  static readonly TYPE = new StringKey(VAL, 'TYPE');
  static readonly SOURCE = new StringKey(VAL, 'SOURCE');
  static readonly SELECT_ITEM = new StringKey(VAL, 'SELECT_ITEM');
  static readonly SELECT_VAR = new StringKey(VAL, 'SELECT', CommonStringKeys.VAR);
  static readonly SELECT_OP = new StringKey(VAL, 'SELECT', CommonStringKeys.OP);
  static readonly SELECT_FILE = new StringKey(VAL, 'SELECT', CommonStringKeys.FILE);
  static readonly CHOOSE_LANGUAGE = new StringKey(VAL, 'CHOOSE_LANG');

  static readonly QUEST = new StringKey(VAL, 'QUEST');
  static readonly TILE = new StringKey(VAL, 'TILE');
  static readonly DELETE = new StringKey(VAL, 'DELETE');
  static readonly RENAME = new StringKey(VAL, 'RENAME');
  static readonly UPDATE = new StringKey(VAL, 'UPDATE');
  static readonly COPY = new StringKey(VAL, 'COPY');
  static readonly CONFIRM = new StringKey(VAL, 'CONFIRM');
  static readonly NEW = new StringKey(VAL, 'NEW');
  static readonly DOOR = new StringKey(VAL, 'DOOR');
  static readonly TOKEN = new StringKey(VAL, 'TOKEN');
  static readonly UI = new StringKey(VAL, 'UI');
  static readonly MONSTER = new StringKey(VAL, 'MONSTER');
  static readonly SPAWN = new StringKey(VAL, 'SPAWN');
  static readonly MPLACE = new StringKey(VAL, 'MPLACE');
  static readonly PUZZLE = new StringKey(VAL, 'PUZZLE');
  static readonly ITEM = new StringKey(VAL, 'ITEM');
  static readonly QITEM = new StringKey(VAL, 'QITEM');
  static readonly STARTING_ITEM = new StringKey(VAL, 'STARTING_ITEM');
  static readonly UNIQUE_MONSTER = new StringKey(VAL, 'UNIQUE_MONSTER');
  static readonly CUSTOMMONSTER = new StringKey(VAL, 'CUSTOMMONSTER');
  static readonly ACTIVATION = new StringKey(VAL, 'ACTIVATION');
  static readonly NUMBER = new StringKey(VAL, 'NUMBER');
  static readonly TRIGGER = new StringKey(VAL, 'TRIGGER');

  static readonly LOG = new StringKey(VAL, 'LOG');
  static readonly SET = new StringKey(VAL, 'SET');
  static readonly RESET = new StringKey(VAL, 'RESET');
  static readonly LOADINGSCENARIOS = new StringKey(VAL, 'LOADINGSCENARIOS');
  static readonly LOADINGCONTENTPACKS = new StringKey(VAL, 'LOADINGCONTENTPACKS');
  static readonly REQUIRED = new StringKey(VAL, 'REQUIRED');

  static readonly SIZE = new StringKey(VAL, 'SIZE');
  static readonly DEFAULT = new StringKey(VAL, 'DEFAULT');
  static readonly SMALL = new StringKey(VAL, 'SMALL');
  static readonly MEDIUM = new StringKey(VAL, 'MEDIUM');
  static readonly HUGE = new StringKey(VAL, 'HUGE');
  static readonly MASSIVE = new StringKey(VAL, 'MASSIVE');
}
