// The fields of a tile, a token and a door beside the map, as Valkyrie's panels for them have them: a tile's side or
// picture of its own, a token's type, size, picture and click, a door's colour. What each does is the engine's
// (EditorComponentTile, EditorComponentToken, EditorComponentDoor); the place is the map's (a drag), and the
// parts of the event a token or a door keeps are EventPanel's. The picture heads it, with its type and turn beside it.
// Not ported from Valkyrie's panels, drawn with Unity.
import { useState, type ReactNode } from 'react';
import {
  CommonStringKeys,
  EditorComponent,
  EditorComponentDoor,
  EditorComponentMPlace,
  EditorComponentTile,
  EditorComponentToken,
  Game,
  MonsterData,
  QuestData,
  SelectionTraits,
  StringKey,
  TileSideData,
  TokenData,
  floatToString,
  type GenericData,
  type SelectionItem,
} from '@universalis/engine';
import { Picture } from '../ui/Picture.tsx';
import { run } from '../ui/run.ts';
import { val } from '../ui/text.ts';
import { Chooser, choicePicture } from './Chooser.tsx';
import { Swatch } from './Colours.tsx';
import { redrawOnBoard } from './EditorMap.tsx';
import { Field, Toggle, TypedText } from './fields.tsx';
import { change } from './session.ts';
import { edi } from './text.ts';

/** A change to the piece that Undo takes back, and the piece drawn again, as Valkyrie's panels do (Remove and Add). */
export function edit(component: QuestData.QuestComponent, action: () => void): void {
  run(() =>
    change(edi('EDITOR_EDIT_STEP', component.sectionName), () => {
      action();
      redrawOnBoard(component.sectionName);
    }),
  );
}

/** A window that is open: what it lists is taken when it opens, as Valkyrie's windows take it. */
interface Open {
  title: string;
  items: SelectionItem[];
  current: string;
  openOn: string | null;
  onPick: (key: string) => void;
}

/** The content a tile side, a token or a monster is, or null. */
function contentOf(key: string): GenericData | null {
  const cd = Game.get().cd;
  if (cd.containsKey(TileSideData, key)) return cd.get(TileSideData, key);
  if (cd.containsKey(TokenData, key)) return cd.get(TokenData, key);
  if (cd.containsKey(MonsterData, key)) return cd.get(MonsterData, key);
  return null;
}

/** A button showing what is chosen, by name and id, that opens the window to choose another. */
function Picked({ label, value, disabled = false, onOpen }: { label: string; value: string; disabled?: boolean; onOpen: () => void }) {
  const data = contentOf(value);
  return (
    <button type="button" className="editor-picked" aria-label={label} disabled={disabled} onClick={onOpen}>
      <span>{data === null ? (value.length === 0 ? val('NONE') : value) : data.name.translate()}</span>
      {data !== null && <code>{value}</code>}
    </button>
  );
}

/** The piece's picture, small, with what it is beside it. */
function Head({ picture, name, children }: { picture: string | null; name: string; children: ReactNode }) {
  const file = picture === null || picture.length === 0 ? null : choicePicture(picture);
  return (
    <div className="editor-piece-head">
      <span className="editor-piece-thumb">{file !== null && <Picture file={file} name={name} decorative />}</span>
      <div className="editor-piece-what">{children}</div>
    </div>
  );
}

/** The turns Valkyrie's panels give a piece: a door is across or along (EditorComponentDoor.Rotate), the others turn a quarter at a time. */
function Turn({ component }: { component: QuestData.Tile | QuestData.Token | QuestData.Door }) {
  const quarters = component instanceof QuestData.Door ? [0, 90] : [0, 90, 180, 270];
  return (
    <Field label={val('ROTATION')}>
      <select
        aria-label={val('ROTATION')}
        value={component.rotation}
        onChange={(e) =>
          run(() =>
            change(edi('EDITOR_ROTATE_STEP', component.sectionName), () => {
              component.rotation = Number(e.target.value);
              redrawOnBoard(component.sectionName);
            }),
          )
        }
      >
        {!quarters.includes(component.rotation) && <option value={component.rotation}>{component.rotation}°</option>}
        {quarters.map((r) => (
          <option key={r} value={r}>
            {r}°
          </option>
        ))}
      </select>
    </Field>
  );
}

/** A picture of its own: the file, the button to choose one, and Reset. */
function CustomImage({ component, onOpen, onReset }: { component: QuestData.Tile | QuestData.Token; onOpen: () => void; onReset: () => void }) {
  const label = val('CUSTOM_IMAGE');
  return (
    <Field label={label}>
      <span className="editor-inline">
        {component.customImage.length > 0 && <code className="editor-file">{component.customImage}</code>}
        <button type="button" className="button" aria-label={label} onClick={onOpen}>
          {edi('EDITOR_CHOOSE')}
        </button>
        {component.customImage.length > 0 && (
          <button type="button" className="button" onClick={onReset}>
            {CommonStringKeys.RESET.translate()}
          </button>
        )}
      </span>
    </Field>
  );
}

function TileFields({ tile, open }: { tile: QuestData.Tile; open: (o: Open) => void }) {
  const side = Game.get().cd.containsKey(TileSideData, tile.tileSideName) ? Game.get().cd.get(TileSideData, tile.tileSideName) : null;
  return (
    <>
      <Head picture={tile.customImage.length > 0 ? tile.customImage : tile.tileSideName} name={tile.tileSideName}>
        <Picked
          label={val('IMAGE')}
          value={tile.tileSideName}
          onOpen={() =>
            open({
              title: val('SELECT', CommonStringKeys.TILE),
              items: EditorComponentTile.tileSideChoices(),
              current: tile.tileSideName,
              openOn: side === null ? null : SelectionTraits.sourceOf(side),
              onPick: (key) => edit(tile, () => EditorComponentTile.selectTileSide(tile, key)),
            })
          }
        />
        <Turn component={tile} />
      </Head>
      <CustomImage
        component={tile}
        onOpen={() =>
          open({
            title: val('SELECT', new StringKey('val', 'CUSTOM_IMAGE')),
            items: EditorComponent.customImageChoices(),
            current: tile.customImage,
            openOn: null,
            onPick: (key) => edit(tile, () => EditorComponentTile.selectCustomImage(tile, key)),
          })
        }
        onReset={() => edit(tile, () => EditorComponentTile.clearCustomImage(tile))}
      />
      {tile.customImage.length > 0 && (
        <div className="editor-pair">
          <Field label={CommonStringKeys.TOP.translate()}>
            <TypedText label={CommonStringKeys.TOP.translate()} number={{ step: 0.5 }} value={floatToString(tile.top)} onDone={(text) => edit(tile, () => EditorComponentTile.setTop(tile, text))} />
          </Field>
          <Field label={CommonStringKeys.LEFT.translate()}>
            <TypedText label={CommonStringKeys.LEFT.translate()} number={{ step: 0.5 }} value={floatToString(tile.left)} onDone={(text) => edit(tile, () => EditorComponentTile.setLeft(tile, text))} />
          </Field>
        </div>
      )}
    </>
  );
}

/** How Valkyrie's token panel names a size: Original when it has none, a number as it is, the rest by its key. */
// Valkyrie: EditorComponentToken.cs EditorComponentToken.AddSubEventComponents (sizeKey)
function sizeLabel(size: string): string {
  if (size === '') return val('ORIGINAL');
  if (size.trim() !== '' && Number.isFinite(Number(size))) return size;
  return val(size.toUpperCase());
}

function TokenFields({ token, open }: { token: QuestData.Token; open: (o: Open) => void }) {
  const cd = Game.get().cd;
  const type = cd.containsKey(TokenData, token.tokenName) ? cd.get(TokenData, token.tokenName) : cd.containsKey(MonsterData, token.tokenName) ? cd.get(MonsterData, token.tokenName) : null;
  const sizes = EditorComponentToken.sizeChoices();
  return (
    <>
      <Head picture={token.customImage.length > 0 ? token.customImage : token.tokenName} name={token.tokenName}>
        <Picked
          label={CommonStringKeys.TYPE.translate()}
          value={token.customImage.length > 0 ? '' : token.tokenName}
          disabled={token.customImage.length > 0}
          onOpen={() =>
            open({
              title: val('SELECT', CommonStringKeys.TOKEN),
              items: EditorComponentToken.typeChoices(),
              current: token.tokenName,
              openOn: type === null ? null : SelectionTraits.sourceOf(type),
              onPick: (key) => edit(token, () => EditorComponentToken.selectType(token, key)),
            })
          }
        />
        <div className="editor-pair">
          <Turn component={token} />
          <Field label={val('SIZE')}>
            <select aria-label={val('SIZE')} value={token.tokenSize} onChange={(e) => edit(token, () => EditorComponentToken.selectSize(token, e.target.value))}>
              {!sizes.includes(token.tokenSize) && <option value={token.tokenSize}>{sizeLabel(token.tokenSize)}</option>}
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {sizeLabel(size)}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Head>
      <CustomImage
        component={token}
        onOpen={() =>
          open({
            title: val('SELECT', new StringKey('val', 'CUSTOM_IMAGE')),
            items: EditorComponent.customImageChoices(),
            current: token.customImage,
            openOn: null,
            onPick: (key) => edit(token, () => EditorComponentToken.selectCustomImage(token, key)),
          })
        }
        onReset={() => edit(token, () => EditorComponentToken.clearCustomImage(token))}
      />
      <Field label={val('CLICK_BEHAVIOR')}>
        <select aria-label={val('CLICK_BEHAVIOR')} value={String(token.enableClick)} onChange={(e) => String(token.enableClick) !== e.target.value && edit(token, () => EditorComponentToken.toggleClickEffect(token))}>
          <option value="true">{val('CLICK_BLINK')}</option>
          <option value="false">{val('CLICK_STATIC')}</option>
        </select>
      </Field>
    </>
  );
}

function DoorFields({ door }: { door: QuestData.Door }) {
  return (
    <div className="editor-pair">
      <Turn component={door} />
      <Field label={val('COLOR')}>
        <Swatch label={val('COLOR')} value={door.colourName} any onPick={(c) => edit(door, () => EditorComponentDoor.selectColour(door, c))} />
      </Field>
    </div>
  );
}

/** A monster place (Descent): lying across or along, the master's or a minion's, and its size. */
function MPlaceFields({ place }: { place: QuestData.MPlace }) {
  const sizes = EditorComponentMPlace.sizeChoices();
  return (
    <>
      <div className="editor-pair">
        <Field label={val('ROTATION')}>
          <select aria-label={val('ROTATION')} value={String(place.rotate)} onChange={(e) => String(place.rotate) !== e.target.value && edit(place, () => EditorComponentMPlace.rotate(place))}>
            <option value="false">{val('RIGHT')}</option>
            <option value="true">{val('DOWN')}</option>
          </select>
        </Field>
        <Field label={val('SIZE')}>
          <select aria-label={val('SIZE')} value={place.tokenSize} onChange={(e) => edit(place, () => EditorComponentMPlace.selectSize(place, e.target.value))}>
            {!sizes.includes(place.tokenSize) && <option value={place.tokenSize}>{place.tokenSize}</option>}
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size === '' ? CommonStringKeys.DEFAULT.translate() : val(size.toUpperCase())}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Toggle label={val('MONSTER_MASTER')} on={place.master} onToggle={() => edit(place, () => EditorComponentMPlace.masterToggle(place))} />
    </>
  );
}

/** The fields of a tile, a token, a door or a monster place; nothing for the other types. */
export function PiecePanel({ component }: { component: QuestData.QuestComponent }) {
  const [opened, setOpened] = useState<Open | null>(null);
  let fields: ReactNode = null;
  if (component instanceof QuestData.Tile) fields = <TileFields tile={component} open={setOpened} />;
  else if (component instanceof QuestData.Token) fields = <TokenFields token={component} open={setOpened} />;
  else if (component instanceof QuestData.Door) fields = <DoorFields door={component} />;
  else if (component instanceof QuestData.MPlace) fields = <MPlaceFields place={component} />;
  if (fields === null) return null;
  return (
    // Its place, which the map sets, for the tests (the panel shows no numbers for it)
    <div className="editor-piece" data-x={floatToString(component.location.x)} data-y={floatToString(component.location.y)}>
      {fields}
      {opened !== null && (
        <Chooser
          title={opened.title}
          items={opened.items}
          current={opened.current}
          openOn={opened.openOn}
          excludeExpansions
          pictures
          onPick={(key) => {
            setOpened(null);
            opened.onPick(key);
          }}
          onClose={() => setOpened(null)}
        />
      )}
    </div>
  );
}
