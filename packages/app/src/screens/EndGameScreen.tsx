// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/UI/Screens/EndGameScreen.cs
// The end of a quest: whether the players won, how they rate the scenario and a comment, sent to Valkyrie's statistics
// (StatsManager), or back to the menu. Not in Valkyrie: a scenario is sent once per device (ui/marks.ts ratingOf), the
// rating is kept on the device to show next to the played mark, and the menu waits for the form to go out.
import { useEffect, useState } from 'react';
import { Game, GameStateManager, ImageData, Path, ValkyrieConstants, ValkyrieDebug } from '@universalis/engine';
import { markFinished, ratingOf, saveRating } from '../ui/marks.ts';
import { Picture } from '../ui/Picture.tsx';
import { run } from '../ui/run.ts';
import { uni, val } from '../ui/text.ts';
import { RichText } from '../ui/RichText.tsx';

const IMG_BG_MOM = 'ImageGreenBG';
const IMG_BG_DESCENT = 'ImageDarkBackground';

/** The scenario's identifier, as the list and the statistics name it: its package, whatever quest it changed to. */
function scenarioIdentifier(): string {
  const name = Path.getFileName(Game.get().currentQuest?.originalPath ?? '');
  const extension = ValkyrieConstants.ScenarioDownloadContainerExtension;
  return (name.toLowerCase().endsWith(extension) ? name.substring(0, name.length - extension.length) : name).toLowerCase();
}

/** Valkyrie's texts keep \n as two characters. */
function lines(text: string): string {
  return text.split('\\n').join('\n');
}

// Valkyrie: EndGameScreen.cs EndGameScreen.EndGameScreen
export function EndGameWindow() {
  const game = Game.get();
  const background = game.gameType.typeName() === 'MoM' ? IMG_BG_MOM : IMG_BG_DESCENT;
  const image = game.cd.tryGet(ImageData, background)?.image ?? '';
  const name = game.currentQuest?.qd.quest.name.translate() ?? '';
  const identifier = game.currentQuest?.qd.quest.identifier;
  const scenario = scenarioIdentifier();
  const [previous] = useState(() => ratingOf(scenario));
  const [game_won, setGameWon] = useState<string>(previous?.victory ?? 'not set');
  const [selected_rating, setSelectedRating] = useState(previous?.rating ?? 0);
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  // Not in Valkyrie: the scenario is marked as played (ui/marks.ts)
  useEffect(() => markFinished(identifier), [identifier]);

  /** Not in Valkyrie: what the players chose stays on the device, sent or not. */
  const keep = (sent: boolean) => {
    if (selected_rating === 0 || (game_won !== 'true' && game_won !== 'false')) return;
    saveRating(scenario, { rating: selected_rating, victory: game_won, sent: sent || previous?.sent === true });
  };

  const menu = () => {
    keep(false);
    GameStateManager.mainMenu();
  };

  // Send data to Google forms
  // Valkyrie: EndGameScreen.cs EndGameScreen.SendStats
  const sendStats = () => {
    ValkyrieDebug.log('INFO: Go back to main menu and provide feedback');

    if (game_won === 'not set' || selected_rating === 0) {
      setError(val('STATS_MISSING_INFO'));
      return;
    }

    Game.get().stats.prepareStats(game_won, selected_rating, comments);
    setSending(true);
    setError('');
    Game.get().stats.publishData((failed) => {
      setSending(false);
      if (failed) {
        keep(false);
        setError(uni('RATING_NOT_SENT'));
        return;
      }
      keep(true);
      run(() => GameStateManager.mainMenu());
    });
  };

  return (
    <div className="end-window" role="dialog" aria-modal="true" aria-labelledby="end-title">
      {image !== '' && <Picture file={image} name="" className="end-background" decorative />}
      <section className="panel end-card">
        <h2 id="end-title">{uni('END_TITLE')}</h2>
        {name !== '' && (
          <p className="end-quest">
            <RichText text={name} />
          </p>
        )}
        {previous?.sent === true ? (
          <p className="end-sent">{uni('RATING_ALREADY_SENT', previous.rating)}</p>
        ) : (
          <>
            <p className="end-welcome">{val('STATS_WELCOME')}</p>
            <div className="end-question">
              <span className="end-ask">{val('STATS_ASK_VICTORY')}</span>
              <div className="end-choices" role="group" aria-label={val('STATS_ASK_VICTORY')}>
                <button type="button" className="button end-choice" aria-pressed={game_won === 'true'} onClick={() => setGameWon('true')}>
                  {val('STATS_ASK_VICTORY_YES')}
                </button>
                <button type="button" className="button end-choice" aria-pressed={game_won === 'false'} onClick={() => setGameWon('false')}>
                  {val('STATS_ASK_VICTORY_NO')}
                </button>
              </div>
            </div>
            <div className="end-question">
              <span className="end-ask">{lines(val('STATS_ASK_RATING'))}</span>
              <div className="end-choices end-rating" role="group" aria-label={lines(val('STATS_ASK_RATING'))}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((r) => (
                  <button key={r} type="button" className="button end-choice" aria-pressed={selected_rating === r} onClick={() => setSelectedRating(r)}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <label className="end-question">
              <span className="end-ask">{val('STATS_ASK_COMMENTS')}</span>
              <textarea className="end-comments" rows={4} value={comments} onChange={(e) => setComments(e.target.value)} />
            </label>
          </>
        )}
        <div className="end-actions">
          <button type="button" className="button" onClick={() => run(menu)}>
            {val('STATS_MENU_BUTTON')}
          </button>
          {previous?.sent !== true && (
            <button type="button" className="button primary" disabled={sending} onClick={() => run(sendStats)}>
              {val('STATS_SEND_BUTTON')}
            </button>
          )}
        </div>
        {error !== '' && (
          <p className="end-error" role="alert">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
