// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/UI/Screens/ContentSelectScreen.cs
// The player's collection: the expansions and content packs they have, kept in config.ini as Valkyrie keeps them
// ([MoMPacks] or [D2EPacks], each with the language of its texts). Its logic follows Valkyrie; the drawing is the app's.
import {
  CommonStringKeys,
  Destroyer,
  Game,
  GameStateManager,
  PackTypeData,
  RemoteContentPackManager,
  StringKey,
  ValkyrieConstants,
  ValkyrieDebug,
  isNullOrWhiteSpace,
} from '@universalis/engine';
import { Picture } from '../ui/Picture.tsx';
import { run } from '../ui/run.ts';
import { show, update, useUI } from '../ui/store.ts';
import { val } from '../ui/text.ts';
import { openContentSelectDownload } from './ContentSelectDownloadScreen.tsx';
import './ContentSelectScreen.css';
import { plainText, RichText } from '../ui/RichText.tsx';

// Valkyrie: OptionsScreen.cs OptionsScreen.ENABLED_LANGS
const ENABLED_LANGS = 'English,Spanish,French,Italian,German,Portuguese,Polish,Russian,Chinese,Korean,Czech,Japanese,Ukrainian'.split(',');

// Create page
// Valkyrie: ContentSelectScreen.cs ContentSelectScreen.ContentSelectScreen
export function openContentSelect(): void {
  // Clean everything up
  Destroyer.destroy();
  const game = Game.get();

  if (game.cd.count(PackTypeData) > 1) {
    drawTypeList();
  } else {
    drawList('');
  }
}

// Valkyrie: ContentSelectScreen.cs ContentSelectScreen.DrawTypeList
function drawTypeList(): void {
  // Clean up
  Destroyer.dialog();
  show({ name: 'content-select', type: null });
}

// Draw the expansions on the screen, highlighting those that are enabled
// Valkyrie: ContentSelectScreen.cs ContentSelectScreen.DrawList
function drawList(type: string): void {
  // Clean up
  Destroyer.dialog();
  show({ name: 'content-select', type });
}

// Valkyrie: ContentSelectScreen.cs ContentSelectScreen.Quit
function quit(): void {
  GameStateManager.mainMenu();
}

// Valkyrie: ContentSelectScreen.cs ContentSelectScreen.ContentSelectDownload
function contentSelectDownload(): void {
  ValkyrieDebug.log('INFO: Accessing content select download screen');
  openContentSelectDownload();
}

// set a pack as selected by id
// Valkyrie: ContentSelectScreen.cs ContentSelectScreen.Select
function select(id: string): void {
  const game = Game.get();
  const packs = new Set(game.config.getPacks(game.gameType.typeName()));
  if (packs.has(id)) {
    // Base game content cannot be deselected
    if (game.gameType.baseContentPackId() === id) return;
    game.config.removePack(game.gameType.typeName(), id);
  } else {
    game.config.addPack(game.gameType.typeName(), id);
  }

  // Update
  update();
}

// Valkyrie: ContentSelectScreen.cs ContentSelectScreen.UpdateLanguage
function updateLanguage(id: string, value: string, type: string): void {
  const game = Game.get();
  // The default language item (Base) clears the pack's language
  game.config.addPack(game.gameType.typeName(), id, value === CommonStringKeys.BASE.key ? '' : value);
  drawList(type);
}

interface PackType {
  id: string;
  name: string;
  image: string;
}

/** The categories of packs: the content's PackType sections, then the community packs (DrawTypeList). */
function packTypes(): PackType[] {
  const game = Game.get();
  const typeIdCustom = RemoteContentPackManager.getCustomCategory();
  const types: PackType[] = [];
  // Note this is currently unordered
  for (const type of game.cd.values(PackTypeData)) {
    const typeId = type.sectionName.substring(ValkyrieConstants.PackType.length);

    //skip custom category if it was added for some reason
    if (typeId.toLowerCase() === typeIdCustom.toLowerCase()) continue;

    const typeName = type.name.toString();
    types.push({ id: typeId, name: isNullOrWhiteSpace(typeName) ? val('CONTENTPACK_CATEGORY_CUSTOM') : new StringKey(typeName).translate(), image: type.image });
  }
  // Valkyrie draws its own icon (sprites/CustomContentPackIcon) for the community packs
  types.push({ id: typeIdCustom, name: val('CONTENTPACK_CATEGORY_CUSTOM'), image: '' });
  return types;
}

function TypeList() {
  return (
    <>
      <ul className="pack-types">
        {packTypes().map((type) => (
          <li key={type.id}>
            <button type="button" className="pack-type card" onClick={() => run(() => drawList(type.id))}>
              <span className="pack-picture">
                <Picture file={type.image} name={type.name} decorative />
              </span>
              <span className="pack-name">{type.name}</span>
            </button>
          </li>
        ))}
      </ul>
      <footer className="content-foot">
        <button type="button" className="button back" onClick={() => run(quit)}>
          {val('BACK')}
        </button>
        <button type="button" className="button" onClick={() => run(contentSelectDownload)}>
          {val('CONTENTPACK_DOWNLOAD')}
        </button>
      </footer>
    </>
  );
}

function PackList({ type }: { type: string }) {
  const game = Game.get();
  const typeName = game.gameType.typeName();
  // Fetch which packs are selected from the current config (items under [Packs])
  const selected = new Set(game.config.getPacks(typeName));
  const packLanguages = game.config.getPackLanguages(typeName);
  const baseContentPackId = game.gameType.baseContentPackId();
  const languages = [...ENABLED_LANGS].sort();
  // If the id is "" this is base content and can be ignored
  const packs = game.cd.allPacks.filter((cp) => cp.id!.length > 0 && cp.type === type);
  return (
    <>
      <ul className="packs">
        {packs.map((cp) => {
          const id = cp.id!;
          const isBaseContentPack = baseContentPackId === id;
          const chosen = isBaseContentPack || selected.has(id);
          const title = game.cd.getContentName(id);
          const name = plainText(title);
          const language = packLanguages.get(id) ?? '';
          return (
            <li key={id} className={chosen ? 'pack-row chosen' : 'pack-row'}>
              <button type="button" className="pack-choice card" aria-pressed={chosen} onClick={() => run(() => select(id))}>
                <span className="pack-picture">
                  <Picture file={cp.image ?? ''} name={name} decorative />
                </span>
                <span className="pack-name">
                  <RichText text={title} />
                </span>
                {isBaseContentPack ? (
                  <span className="pack-note required">({CommonStringKeys.REQUIRED.translate()})</span>
                ) : (
                  <span className="pack-note">({game.cd.getContentAcronym(id)})</span>
                )}
              </button>
              <label className="pack-language">
                <span className="visually-hidden">{`${CommonStringKeys.CHOOSE_LANGUAGE.translate()}: ${name}`}</span>
                {/* A pack that is not selected shows Base too; choosing any item, Base included, selects it (AddPack) */}
                <select
                  value={!selected.has(id) ? '' : isNullOrWhiteSpace(language) ? CommonStringKeys.BASE.key : language}
                  onChange={(e) => run(() => updateLanguage(id, e.target.value, type))}
                >
                  <option value="" hidden>
                    {CommonStringKeys.BASE.translate()}
                  </option>
                  <option value={CommonStringKeys.BASE.key}>{CommonStringKeys.BASE.translate()}</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </label>
            </li>
          );
        })}
      </ul>
      <footer className="content-foot">
        {/* Back to the categories, or to the menu when there is only one */}
        <button type="button" className="button back" onClick={() => run(() => (game.cd.count(PackTypeData) > 1 ? drawTypeList() : quit()))}>
          {val('BACK')}
        </button>
      </footer>
    </>
  );
}

export function ContentSelectScreen({ type }: { type: string | null }) {
  useUI((s) => s.revision);
  return (
    <main className="screen content-select">
      <header className="screen-head">
        <h1>{val('SELECT_EXPANSION')}</h1>
      </header>
      {type === null ? <TypeList /> : <PackList type={type} />}
    </main>
  );
}
