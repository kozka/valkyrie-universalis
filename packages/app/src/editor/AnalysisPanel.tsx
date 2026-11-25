// Not in Valkyrie (7 November 2026): the analysis of a Mansions scenario, in a tab of the panel below. It plays the
// scenario many times with made-up investigators (analysis/), for each number of investigators it allows, and shows how
// long it lasts against what it says, where the actions go (walking, looking at what gives nothing, waiting, fighting,
// carrying a key across the house), the new things met round by round, how it ends, and advice; a component it names
// is selected with a press. A guide for the author: a table plays otherwise.
import { useState } from 'react';
import { Game } from '@universalis/engine';
import { run } from '../ui/run.ts';
import { analyze, type Analysis, type HeroesFigures } from './analysis/analyze.ts';
import { KINDS, type Profile } from './analysis/simulate.ts';
import { useEditor } from './editorState.ts';
import { select } from './session.ts';
import { edi } from './text.ts';

const PROFILES: Profile[] = ['normal', 'curious', 'direct'];
const RUNS = [50, 100, 200];

/** The last analysis, kept while the editor is open, and the scenario it was made of. */
let kept: { folder: string; at: number; analysis: Analysis } | null = null;

const percent = (x: number) => `${Math.round(x * 100)} %`;

function Curve({ figures }: { figures: HeroesFigures }) {
  const most = Math.max(1, ...figures.curve);
  const width = 24;
  const height = 80;
  return (
    <svg className="editor-analysis-curve" viewBox={`0 0 ${figures.curve.length * width + 8} ${height + 22}`} role="img" aria-label={edi('ANALYSIS_CURVE', figures.heroes)}>
      {figures.curve.map((value, i) => {
        const h = Math.max(1, (value / most) * height);
        const dead = figures.deadRounds.includes(i + 1);
        return (
          <g key={i}>
            <rect x={4 + i * width} y={height - h} width={width - 6} height={h} className={dead ? 'dead' : undefined}>
              <title>{edi('ANALYSIS_CURVE_BAR', i + 1, value.toFixed(1))}</title>
            </rect>
            <text x={4 + i * width + (width - 6) / 2} y={height + 15} textAnchor="middle">
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** A mean as the sheet shows it: a dot for none, one decimal otherwise. */
const dot = (x: number) => (x < 0.05 ? '·' : x.toFixed(1));

/** The pacing sheet: one row a round, what the games still playing met, and who had nothing to do. */
function Pace({ figures }: { figures: HeroesFigures }) {
  return (
    <div className="editor-analysis-scroll">
      <table className="editor-analysis-table editor-analysis-pace">
        <thead>
          <tr>
            <th>{edi('ANALYSIS_PACE_ROUND')}</th>
            <th>{edi('ANALYSIS_PACE_PLAYING')}</th>
            {KINDS.map((k) => (
              <th key={k}>{edi('ANALYSIS_KIND_' + k.toUpperCase())}</th>
            ))}
            <th>{edi('ANALYSIS_PACE_NOTHING')}</th>
            <th>{edi('ANALYSIS_PACE_MONSTERS')}</th>
          </tr>
        </thead>
        <tbody>
          {figures.pace.map((row) => (
            <tr key={row.round} className={figures.deadRounds.includes(row.round) ? 'dead' : undefined}>
              <td>{row.round}</td>
              <td>{percent(row.playing)}</td>
              {KINDS.map((k) => (
                <td key={k}>{dot(row.kinds[k])}</td>
              ))}
              <td className={row.idleHeroes >= figures.heroes / 2 ? 'warn' : undefined}>{dot(row.idleHeroes)}</td>
              <td>{dot(row.monsters)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Endings({ figures }: { figures: HeroesFigures }) {
  const parts = figures.endEvents.slice(0, 3).map((e) => (
    <span key={e.name}>
      <button type="button" className="editor-link" onClick={() => run(() => select(e.name))}>
        {e.name}
      </button>{' '}
      {percent(e.runs / figures.runs)}
      {e.eliminated > 0 && <span className="quiet"> ({edi('ANALYSIS_ENDING_ELIMINATED')})</span>}
    </span>
  ));
  const other = (['eliminated', 'stuck', 'rounds', 'quest-change'] as const).filter((k) => figures.endings[k] > 0 && !(k === 'eliminated' && figures.endEvents.length > 0));
  return (
    <span className="editor-analysis-endings">
      {parts}
      {other.map((k) => (
        <span key={k} className="quiet">
          {edi('ANALYSIS_ENDING_' + k.toUpperCase().replace('-', '_'))} {percent(figures.endings[k] / figures.runs)}
        </span>
      ))}
    </span>
  );
}

export function AnalysisPanel({ folder }: { folder: string }) {
  useEditor((s) => s.revision);
  const [profile, setProfile] = useState<Profile>('normal');
  const [runs, setRuns] = useState(100);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, redraw] = useState(0);
  const [shown, setShown] = useState<number | null>(null);
  const game = Game.get();
  if (game.gameType.typeName() !== 'MoM') return <p className="editor-analysis-note">{edi('ANALYSIS_MOM_ONLY')}</p>;
  const mine = kept !== null && kept.folder === folder ? kept : null;
  const start = () => {
    setError(null);
    setProgress(0);
    void analyze(game.currentQuest!.qd, { profile, runs, progress: (done) => setProgress(done) })
      .then((analysis) => {
        kept = { folder, at: Date.now(), analysis };
        setShown(null);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => {
        setProgress(null);
        redraw((n) => n + 1);
      });
  };
  const figures = mine?.analysis.figures ?? [];
  const chosen = figures.find((f) => f.heroes === shown) ?? figures.at(Math.floor(figures.length / 2));
  return (
    <div className="editor-analysis">
      <div className="editor-analysis-tools">
        <button type="button" className="button primary" disabled={progress !== null} onClick={start}>
          {edi(mine === null ? 'ANALYSIS_RUN' : 'ANALYSIS_AGAIN')}
        </button>
        <label>
          {edi('ANALYSIS_PROFILE')}{' '}
          <select value={profile} onChange={(e) => setProfile(e.target.value as Profile)}>
            {PROFILES.map((p) => (
              <option key={p} value={p}>
                {edi('ANALYSIS_PROFILE_' + p.toUpperCase())}
              </option>
            ))}
          </select>
        </label>
        <label>
          {edi('ANALYSIS_RUNS')}{' '}
          <select value={runs} onChange={(e) => setRuns(Number(e.target.value))}>
            {RUNS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        {progress !== null && <progress value={progress} max={1} aria-label={edi('ANALYSIS_WORKING')} />}
        <span className="editor-analysis-note">{edi('ANALYSIS_NOTE')}</span>
      </div>
      {error !== null && <p className="editor-analysis-error">{error}</p>}
      {mine === null && progress === null && <p className="editor-analysis-note">{edi('ANALYSIS_EMPTY')}</p>}
      {mine !== null && (
        <>
          {mine.analysis.advice.length > 0 && (
            <section>
              <h3>{edi('ANALYSIS_ADVICE')}</h3>
              <ul className="editor-analysis-advice">
                {mine.analysis.advice.map((a, i) => (
                  <li key={i} className={a.level}>
                    {edi(a.key, ...a.params)}
                    {a.components.length > 0 && (
                      <span className="editor-analysis-components">
                        {a.components.slice(0, 12).map((c) => (
                          <button key={c} type="button" className="editor-link" onClick={() => run(() => select(c))}>
                            {c}
                          </button>
                        ))}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h3>{edi('ANALYSIS_FIGURES', mine.analysis.figures[0]?.runs ?? 0, edi('ANALYSIS_PROFILE_' + mine.analysis.profile.toUpperCase()))}</h3>
            <table className="editor-analysis-table">
              <thead>
                <tr>
                  <th>{edi('ANALYSIS_COL_HEROES')}</th>
                  <th>{edi('ANALYSIS_COL_MINUTES')}</th>
                  <th>{edi('ANALYSIS_COL_ROUNDS')}</th>
                  <th>{edi('ANALYSIS_COL_WALKING')}</th>
                  <th>{edi('ANALYSIS_COL_WASTED')}</th>
                  <th>{edi('ANALYSIS_COL_IDLE')}</th>
                  <th>{edi('ANALYSIS_COL_FIGHTING')}</th>
                  <th>{edi('ANALYSIS_COL_ENDS')}</th>
                </tr>
              </thead>
              <tbody>
                {figures.map((f) => (
                  <tr key={f.heroes} aria-selected={f === chosen} onClick={() => setShown(f.heroes)}>
                    <td>{f.heroes}</td>
                    <td>
                      {Math.round(f.estimate.likely)}{' '}
                      <span className="quiet">
                        ({Math.round(f.estimate.low)}–{Math.round(f.estimate.high)})
                      </span>
                    </td>
                    <td>{f.rounds}</td>
                    <td>{percent(f.walking)}</td>
                    <td>{percent(f.wasted)}</td>
                    <td>{percent(f.idle)}</td>
                    <td>{percent(f.fighting)}</td>
                    <td>
                      <Endings figures={f} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mine.analysis.declared.max > 0 && <p className="editor-analysis-note">{edi('ANALYSIS_DECLARED', mine.analysis.declared.min, mine.analysis.declared.max)}</p>}
            {chosen !== undefined && <p className="editor-analysis-note">{edi('ANALYSIS_ESTIMATE_NOTE', Math.round(chosen.minutes.median))}</p>}
          </section>
          {chosen !== undefined && chosen.curve.length > 0 && (
            <section>
              <h3>{edi('ANALYSIS_CURVE', chosen.heroes)}</h3>
              <Curve figures={chosen} />
              <p className="editor-analysis-note">{edi('ANALYSIS_CURVE_NOTE')}</p>
            </section>
          )}
          {chosen !== undefined && chosen.pace.length > 0 && (
            <section>
              <h3>{edi('ANALYSIS_PACE', chosen.heroes)}</h3>
              <p className="editor-analysis-note">{edi('ANALYSIS_BEATS', chosen.beats.mean.toFixed(1), chosen.beats.longest)}</p>
              <Pace figures={chosen} />
              <p className="editor-analysis-note">{edi('ANALYSIS_PACE_NOTE')}</p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
