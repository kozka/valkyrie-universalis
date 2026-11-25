// The app's own options, kept in config.ini under [Universalis], next to Valkyrie's [UserConfig]: the app's theme
// (themes/themes.ts: Universalis, the default, or a plain colour), the felt under the board in a game, how far the
// board leans, the size of the text and of the board's pieces, and the advanced switches (docs/peticiones.md). Not
// ported from Valkyrie.
import { Game, Quest } from '@universalis/engine';
import { setBoardKeepZoom, setBoardPieceScale, setBoardTilt } from '../board/Board.ts';
import { update } from './store.ts';

/** The colours the app and the felt can have. They are theme.css's --tone-… roles. */
export const TONES = ['black', 'green', 'red', 'blue'] as const;
export type Tone = (typeof TONES)[number];

/**
 * The app's themes, the default first: Universalis, with its pictures and kozka's new screens as they come (Mansions'
 * investigator selection, 17 October 2026); classic, the same pictures with the screens as they were, for whoever
 * prefers them or has trouble with the new ones; or a plain colour. Valkyrie's own look comes later.
 */
export const THEMES = ['universalis', 'classic', ...TONES] as const;
export type Theme = (typeof THEMES)[number];

/** The felts, the default first: pure black without grain, as Valkyrie's camera clears to black, or a colour. */
export const FELTS = ['pure', ...TONES] as const;
export type Felt = (typeof FELTS)[number];

/** How far the board leans, in degrees: as little as Valkyrie's camera, the default, or like a table seen from a chair. */
export const TILTS = { valkyrie: 10, table: 30 } as const;
export type Tilt = keyof typeof TILTS;

/** The size of the app's text, in percent of the browser's: every screen's sizes are in rem (Valkyrie issue #1222). */
export const TEXT_SIZES = { normal: 100, large: 115, larger: 130 } as const;
export type TextSize = keyof typeof TEXT_SIZES;

/** How big the items' pictures are in the windows: Valkyrie's small ones, or large with the name beside them. */
export const ITEM_SIZES = ['normal', 'large'] as const;
export type ItemSize = (typeof ITEM_SIZES)[number];

/** How big the board's pieces are drawn, tiles apart: as the scenario places them, or 30 % bigger. */
export const PIECE_SIZES = { normal: 1, large: 1.3 } as const;
export type PieceSize = keyof typeof PIECE_SIZES;

/**
 * The advanced switches, all off by default, so that a game plays as in Valkyrie: ask before the Mythos phase (#1173),
 * keep the zoom when the scenario moves the camera (#466), hide the pointer (#1663), read the events aloud as they show
 * (#390), remind of the horror checks after the monsters act (#683), draw a blank tile where one is missing (#1513),
 * translate a scenario that is not in the player's language (host/translator.ts). Two are on unless turned off: the soft
 * glow on a scenario's own buttons after a while without a press (`buttonHints`, board/QuestUILayer.tsx) and the
 * click of the menus' buttons (`clickSound`, audio/uiSounds.ts).
 */
export const SWITCHES = ['confirmPhase', 'keepZoom', 'hideCursor', 'autoRead', 'horrorReminder', 'blankTiles', 'autoTranslate', 'buttonHints', 'gameTimer', 'scenarioFaults', 'tvMode', 'clickSound', 'buttonsApart', 'epicSpawns'] as const;
export type Switch = (typeof SWITCHES)[number];

const SECTION = 'Universalis';

function setting(key: string): string {
  return Game.game?.config.data.get(SECTION, key) ?? '';
}

function save(key: string, value: string): void {
  const game = Game.get();
  game.config.data.add(SECTION, key, value);
  game.config.save();
}

function chosen<T extends string>(key: string, choices: readonly T[]): T {
  const value = setting(key);
  return choices.find((c) => c === value) ?? choices[0]!;
}

/** The app's theme. */
export function theme(): Theme {
  return chosen('theme', THEMES);
}

/** The felt under the board in a game. */
export function felt(): Felt {
  return chosen('felt', FELTS);
}

export function tilt(): Tilt {
  return chosen('boardTilt', Object.keys(TILTS) as Tilt[]);
}

export function textSize(): TextSize {
  return chosen('textSize', Object.keys(TEXT_SIZES) as TextSize[]);
}

export function pieceSize(): PieceSize {
  return chosen('pieceSize', Object.keys(PIECE_SIZES) as PieceSize[]);
}

/** Not in Valkyrie: who reads the events aloud (ui/speech.ts): the browser's voices, Gemini's (ui/geminiSpeech.ts),
 * Speechify's (ui/speechifySpeech.ts) or Deepgram's (ui/deepgramSpeech.ts), with the player's key, or nobody (no speaker on the cards). */
export const VOICE_ENGINES = ['browser', 'gemini', 'speechify', 'deepgram', 'off'] as const;
export type VoiceEngine = (typeof VOICE_ENGINES)[number];

export function voiceEngine(): VoiceEngine {
  return chosen('voiceEngine', VOICE_ENGINES);
}

export function setVoiceEngine(value: VoiceEngine): void {
  save('voiceEngine', value);
  update();
}

/** The browser's voice chosen by name, or '' for the best one the browser has for the language. */
export function browserVoice(): string {
  return setting('browserVoice');
}

export function setBrowserVoice(value: string): void {
  save('browserVoice', value);
  update();
}

/** Not in Valkyrie: how big the investigators are in their selection: as now, larger, or as big pictures. */
export const HERO_VIEWS = ['normal', 'large', 'larger'] as const;
export type HeroView = (typeof HERO_VIEWS)[number];

export function heroView(): HeroView {
  return chosen('heroView', HERO_VIEWS);
}

export function setHeroView(value: HeroView): void {
  save('heroView', value);
  update();
}

/** Not in Valkyrie: the OpenRouter model that translates (host/translator.ts): a free DeepSeek one unless chosen. */
export const DEFAULT_TRANSLATE_MODEL = 'deepseek/deepseek-chat-v3.1:free';

export function translateModel(): string {
  return setting('translateModel') || DEFAULT_TRANSLATE_MODEL;
}

export function setTranslateModel(value: string): void {
  save('translateModel', value.trim());
  update();
}

/** Not in Valkyrie (12 November 2026): the monsters' list down the right edge, as Valkyrie, or along the bottom, as the official app. */
export const MONSTER_PLACES = ['right', 'bottom'] as const;
export type MonsterPlace = (typeof MONSTER_PLACES)[number];

export function monsterPlace(): MonsterPlace {
  return chosen('monsterPlace', MONSTER_PLACES);
}

export function setMonsterPlace(value: MonsterPlace): void {
  save('monsterPlace', value);
  applyPreferences();
  update();
}

export function itemSize(): ItemSize {
  return chosen('itemSize', ITEM_SIZES);
}

export function setItemSize(value: ItemSize): void {
  save('itemSize', value);
  applyPreferences();
  update();
}

/** The switches that are on until the player turns them off. */
const ON_BY_DEFAULT: ReadonlySet<Switch> = new Set(['buttonHints', 'clickSound', 'epicSpawns']);

export function switchOn(name: Switch): boolean {
  const value = setting(name);
  return value === '' ? ON_BY_DEFAULT.has(name) : value === '1';
}

export function setTextSize(value: TextSize): void {
  save('textSize', value);
  applyPreferences();
  update();
}

export function setPieceSize(value: PieceSize): void {
  save('pieceSize', value);
  applyPreferences();
  update();
}

/**
 * The app's own volumes, from 0 to 1, 1 until set: a scenario's or a pack's own music (`customMusic`; Valkyrie's
 * `music` is left for the official import's) and the menus' sound (`menuSound`, audio/menuAmbience.ts).
 */
export type OwnVolume = 'customMusic' | 'menuSound';

export function ownVolume(name: OwnVolume): number {
  const value = setting(name);
  const volume = Number(value);
  return value === '' || Number.isNaN(volume) ? 1 : Math.min(1, Math.max(0, volume));
}

export function setOwnVolume(name: OwnVolume, value: number): void {
  save(name, String(value));
  update();
}

export function setSwitch(name: Switch, on: boolean): void {
  save(name, on ? '1' : '0');
  applyPreferences();
  update();
}

export function setTheme(value: Theme): void {
  save('theme', value);
  applyPreferences();
  update();
}

export function setFelt(value: Felt): void {
  save('felt', value);
  applyPreferences();
  update();
}

export function setTilt(value: Tilt): void {
  save('boardTilt', value);
  applyPreferences();
  update();
}

/**
 * Each time this changes, the theme goes back to the default once, whatever the player had chosen, so that everyone
 * sees the new look; after that the player's choice stands. 2026-10-12: Universalis (illustrated) becomes the default.
 */
const THEME_RESET = '2026-10-12';

/** Puts the default theme back once per THEME_RESET (see there). */
export function resetThemeOnce(): void {
  if (setting('themeReset') === THEME_RESET) return;
  const game = Game.get();
  game.config.data.add(SECTION, 'theme', THEMES[0]);
  game.config.data.add(SECTION, 'themeReset', THEME_RESET);
  game.config.save();
}

/**
 * Not in Valkyrie: Options' «restore the default options»: the app's own options go back to theirs (the theme, the
 * felt, the sizes, the advanced switches, the voice), and so do Valkyrie's volumes and camera lock. The language, the
 * player's marks, the translation key and what the app keeps (games, downloads) stay as they are.
 */
export function resetOptions(): void {
  const game = Game.get();
  const kept = new Map([['themeReset', setting('themeReset')]]);
  game.config.data.remove(SECTION);
  for (const [key, value] of kept) if (value !== '') game.config.data.add(SECTION, key, value);
  for (const key of ['music', 'effects', 'viewLock']) game.config.data.remove('UserConfig', key);
  game.config.save();
  applyPreferences();
  update();
}

/** Gives the page, and the browser's bars around it, the chosen theme, lays the chosen felt, leans the board, and sizes
 * the text and the pieces. */
export function applyPreferences(): void {
  const root = document.documentElement;
  root.dataset.theme = theme();
  root.dataset.felt = felt();
  // Not in Valkyrie: the television mode makes everything a fifth bigger, on top of the text size (theme.css, data-tv)
  const tv = switchOn('tvMode');
  const size = TEXT_SIZES[textSize()] * (tv ? 1.2 : 1);
  root.style.fontSize = size === 100 ? '' : `${size}%`;
  root.toggleAttribute('data-tv', tv);
  root.toggleAttribute('data-buttons-apart', switchOn('buttonsApart'));
  root.toggleAttribute('data-hide-cursor', switchOn('hideCursor'));
  root.dataset.itemSize = itemSize();
  root.dataset.monsterPlace = monsterPlace();
  Quest.Tile.blankMissingTiles = switchOn('blankTiles');
  const colour = getComputedStyle(root).getPropertyValue('--background').trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colour);
  setBoardTilt(TILTS[tilt()]);
  setBoardPieceScale(Math.max(PIECE_SIZES[pieceSize()], tv ? PIECE_SIZES.large : 0));
  setBoardKeepZoom(switchOn('keepZoom'));
}
