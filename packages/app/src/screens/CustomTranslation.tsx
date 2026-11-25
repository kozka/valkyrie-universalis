// Not in Valkyrie (17 October 2026): the player's own translation of a scenario (host/customTranslation.ts), from its
// details. The window says what to bring, shows the translations kept for the scenario, and after loading a zip says
// what was found in it: how many of the scenario's texts it translates, the pictures and sounds it replaces, and
// whatever may stop it working, so that whoever made it can fix it.
import { useRef, useState } from 'react';
import { ContentData, File, Game, Path, ValkyrieConstants, type QuestData } from '@universalis/engine';
import {
  checkTranslation,
  removeTranslation,
  saveTranslation,
  savedTranslations,
  scenarioTextsFromFolder,
  scenarioTextsFromPackage,
  type ScenarioTexts,
  type TranslationCheck,
} from '../host/customTranslation.ts';
import type { Problem } from '../host/scenarioPackage.ts';
import { listingKeptFiles } from '../host/storage.ts';
import { selectLang } from './OptionsScreen.tsx';
import { LANGUAGE_CODES, languageCode, languageName } from '../ui/languages.ts';
import { run } from '../ui/run.ts';
import { update } from '../ui/store.ts';
import { uni, val } from '../ui/text.ts';

interface Loaded {
  file: string;
  check: TranslationCheck;
  replaced: boolean;
}

/** A language as Valkyrie names it, in the player's language as a sentence writes it (lower case in Spanish). */
function named(language: string): string {
  const code = languageCode(Game.get().currentLang);
  try {
    const name = new Intl.DisplayNames([code], { type: 'language' }).of(languageCode(language));
    if (name !== undefined && name !== '') return name;
  } catch {
    // A browser without Intl.DisplayNames
  }
  return languageName(language, Game.get().currentLang);
}

/** A problem's words, its languages named in the player's language. */
function problemText({ key, params }: Problem): string {
  return uni(key, ...params.map((p) => (p in LANGUAGE_CODES ? named(p) : p)));
}

/** The scenario's files and texts, from its package (read from storage first) or its folder. */
async function scenarioOf(quest: QuestData.Quest): Promise<ScenarioTexts> {
  const name = Path.getFileName(quest.path) ?? '';
  if (Path.getExtension(name) !== ValkyrieConstants.ScenarioDownloadContainerExtension) return scenarioTextsFromFolder(quest.path);
  const pkg = Path.combine(ContentData.downloadPath(), name);
  let texts: ScenarioTexts | null = null;
  await listingKeptFiles([pkg], () => {
    texts = scenarioTextsFromPackage(File.readAllBytes(pkg));
  });
  return texts ?? scenarioTextsFromFolder(quest.path);
}

export function CustomTranslationButton({ quest }: { quest: QuestData.Quest }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="button custom-translation" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        {uni('TRANSLATION_BUTTON')}
      </button>
      {open && <TranslationWindow quest={quest} close={() => setOpen(false)} />}
    </>
  );
}

function TranslationWindow({ quest, close }: { quest: QuestData.Quest; close: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [, redraw] = useState(0);
  const kept = savedTranslations(quest.identifier);
  const playing = Game.get().currentLang;
  // Not asked again once answered, for this zip
  const [answered, setAnswered] = useState(false);
  const switchTo = (language: string) =>
    run(() => {
      selectLang(language);
      setAnswered(true);
      redraw((n) => n + 1);
    });

  const load = async (file: globalThis.File) => {
    setReading(true);
    try {
      const zip = new Uint8Array(await file.arrayBuffer());
      const scenario = await scenarioOf(quest);
      const check = checkTranslation(zip, scenario, Game.get().currentLang);
      const replaced = check.errors.length === 0 && saveTranslation(quest.identifier, zip, file.name, check);
      setAnswered(false);
      setLoaded({ file: file.name, check, replaced });
    } catch (e) {
      setLoaded({ file: file.name, check: { language: null, translated: 0, total: 0, media: [], errors: [{ key: 'TRANSLATION_NOT_ZIP', params: [] }], warnings: [] }, replaced: false });
      console.warn(`Cannot read the translation ${file.name}: ${String(e)}`);
    } finally {
      setReading(false);
    }
  };

  const check = loaded?.check;
  const images = check?.media.filter((m) => m.kind === 'image' && m.replaces).length ?? 0;
  const sounds = check?.media.filter((m) => m.kind === 'sound' && m.replaces).length ?? 0;
  return (
    <div className="window-layer">
      <section className="window panel translation-window" role="dialog" aria-modal="true" aria-labelledby="translation-title">
        <h2 id="translation-title">{uni('TRANSLATION_TITLE')}</h2>
        <p className="translation-explain">{uni('TRANSLATION_EXPLAIN')}</p>

        {kept.length === 0 ? (
          <p className="translation-none">{uni('TRANSLATION_NONE')}</p>
        ) : (
          <ul className="translation-kept">
            {kept.map((t) => (
              <li key={t.language}>
                <span>{uni('TRANSLATION_SAVED_LINE', languageName(t.language, Game.get().currentLang), t.translated, t.total, t.images, t.sounds, t.file)}</span>
                {t.language !== playing && (
                  <button type="button" className="button" onClick={() => switchTo(t.language)}>
                    {uni('TRANSLATION_SWITCH', named(t.language))}
                  </button>
                )}
                <button
                  type="button"
                  className="button"
                  aria-label={uni('TRANSLATION_REMOVE_LANGUAGE', named(t.language))}
                  onClick={() =>
                    run(() => {
                      removeTranslation(quest.identifier, t.language);
                      setLoaded(null);
                      redraw((n) => n + 1);
                    })
                  }
                >
                  {uni('TRANSLATION_REMOVE')}
                </button>
              </li>
            ))}
          </ul>
        )}

        {reading && <p role="status">{uni('TRANSLATION_READING')}</p>}
        {loaded !== null && check !== undefined && (
          <div className="translation-report" role="status">
            <h3>{uni('TRANSLATION_REPORT_TITLE', loaded.file)}</h3>
            {check.errors.length > 0 ? (
              <>
                <p className="translation-failed">{uni('TRANSLATION_NOT_SAVED')}</p>
                <ul>
                  {check.errors.map((p, i) => (
                    <li key={i} className="translation-error">
                      {problemText(p)}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <ul>
                <li>{uni('TRANSLATION_TEXTS', check.translated, check.total)}</li>
                <li>{uni('TRANSLATION_IMAGES', images)}</li>
                <li>{uni('TRANSLATION_SOUNDS', sounds)}</li>
                {check.warnings
                  // Once the app is in the translation's language, that it was not is no longer news
                  .filter((p) => p.key !== 'TRANSLATION_OTHER_LANGUAGE' || check.language !== playing)
                  .map((p, i) => (
                    <li key={i} className="translation-warning">
                      {problemText(p)}
                    </li>
                  ))}
                {loaded.replaced && <li>{uni('TRANSLATION_REPLACED', named(check.language!))}</li>}
                <li className="translation-saved">{uni('TRANSLATION_SAVED', named(check.language!))}</li>
              </ul>
            )}
            {/* A translation into another language than the app's is used only in that language: offer it now */}
            {check.errors.length === 0 && check.language !== null && check.language !== playing && !answered && (
              <div className="translation-switch">
                <p>{uni('TRANSLATION_SWITCH_ASK', named(check.language))}</p>
                <div className="choices">
                  <button type="button" className="button primary" onClick={() => switchTo(check.language!)}>
                    {uni('TRANSLATION_SWITCH', named(check.language))}
                  </button>
                  <button type="button" className="button" onClick={() => setAnswered(true)}>
                    {uni('TRANSLATION_STAY', named(playing))}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="choices">
          <button type="button" className="button" disabled={reading} onClick={() => input.current?.click()}>
            {uni('TRANSLATION_LOAD')}
          </button>
          <button
            type="button"
            className="button primary"
            onClick={() => {
              close();
              update();
            }}
          >
            {val('CLOSE')}
          </button>
        </div>
        <input
          ref={input}
          className="visually-hidden"
          type="file"
          accept=".zip"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) void load(file);
          }}
        />
      </section>
    </div>
  );
}
