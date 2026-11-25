// Not in Valkyrie (7 November 2026): an advanced option shows, small at the top, how long the round and the game have
// lasted, so that a group keeps its pace and sees whether a scenario lasts what it says. The game's time is Valkyrie's
// own (Quest.duration from earlier sessions plus this one, as its save writes it); the round's starts when #round changes.
import { useEffect, useRef, useState } from 'react';
import { Game } from '@universalis/engine';
import { uni } from '../ui/text.ts';

function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const two = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${two(m)}:${two(s % 60)}` : `${m}:${two(s % 60)}`;
}

export function GameTimer() {
  const [, tick] = useState(0);
  const round = useRef<{ number: number; since: number } | null>(null);
  useEffect(() => {
    const timer = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  const quest = Game.get().currentQuest;
  if (quest === null) return null;
  const number = quest.vars.getValue('#round');
  if (round.current === null || round.current.number !== number) round.current = { number, since: Date.now() };
  const previous = quest.duration > 0 ? quest.duration * 60 : 0;
  const total = previous + (Date.now() - quest.start_time.getTime()) / 1000;
  return (
    <p className="game-timer" aria-label={uni('GAME_TIMER')}>
      {number > 0 && (
        <span>
          {uni('TIMER_ROUND', number)} · {clock((Date.now() - round.current.since) / 1000)}
        </span>
      )}
      <span>{uni('TIMER_GAME', clock(total))}</span>
    </p>
  );
}
