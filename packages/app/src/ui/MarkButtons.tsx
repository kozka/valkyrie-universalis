// The player's marks on a scenario (marks.ts) as the screens draw them: small badges on its card in the list, and
// buttons to set them in its details. Not ported from Valkyrie.
import { type Mark, MARKS, marksOf, ratingOf, setMark } from './marks.ts';
import { run } from './run.ts';
import { uni } from './text.ts';

const MARK_TEXT: Record<Mark, string> = { played: 'MARK_PLAYED', favorite: 'MARK_FAVORITE', pending: 'MARK_PENDING' };

/** The mark's icon: a tick, a star or a bookmark. */
export function MarkIcon({ mark }: { mark: Mark }) {
  return (
    <svg className="mark-icon" viewBox="0 0 24 24" aria-hidden="true">
      {mark === 'played' && <path d="M4.5 12.5l5 5 10-11" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />}
      {mark === 'favorite' && <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" fill="currentColor" />}
      {mark === 'pending' && <path d="M6.5 3h11a1 1 0 0 1 1 1v17l-6.5-4.5L5.5 21V4a1 1 0 0 1 1-1z" fill="currentColor" />}
    </svg>
  );
}

/** The player's own rating of a quest (EndGameScreen), as a small score. */
function MyRatingBadge({ identifier }: { identifier: string }) {
  const rating = ratingOf(identifier);
  if (rating === null) return null;
  return (
    <span className="mark-badge my-rating" title={uni('MY_RATING', rating.rating)}>
      {rating.rating}
    </span>
  );
}

/** The marks a quest has, as badges on its card, and the player's rating. */
export function MarkBadges({ identifier }: { identifier: string }) {
  const marks = marksOf(identifier);
  const rating = ratingOf(identifier);
  if (marks.size === 0 && rating === null) return null;
  const names = MARKS.filter((m) => marks.has(m));
  const label = [...names.map((m) => uni(MARK_TEXT[m])), ...(rating === null ? [] : [uni('MY_RATING', rating.rating)])].join(', ');
  return (
    <span className="mark-badges" role="img" aria-label={label}>
      {names.map((m) => (
        <span key={m} className={`mark-badge ${m}`} title={uni(MARK_TEXT[m])}>
          <MarkIcon mark={m} />
        </span>
      ))}
      <MyRatingBadge identifier={identifier} />
    </span>
  );
}

/** The buttons that set or take away each mark. */
export function MarkButtons({ identifier }: { identifier: string }) {
  const marks = marksOf(identifier);
  const rating = ratingOf(identifier);
  return (
    <div className="mark-buttons" role="group" aria-label={uni('MARKS')}>
      {MARKS.map((m) => (
        <button key={m} type="button" className={`button mark-button ${m}`} aria-pressed={marks.has(m)} onClick={() => run(() => setMark(identifier, m, !marks.has(m)))}>
          <MarkIcon mark={m} />
          {uni(MARK_TEXT[m])}
        </button>
      ))}
      {rating !== null && <span className="my-rating-note">{uni('MY_RATING', rating.rating)}</span>}
    </div>
  );
}
