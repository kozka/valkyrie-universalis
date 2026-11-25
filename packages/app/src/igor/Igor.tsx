// Igor, the castle's butler (Halloween 2026): a portrait at the bottom right of Mansions' main menu that, pressed,
// talks with the player. He tells the news (news.json), and recommends three adventures after at most three
// questions (recommend.ts), from the scenario guide (guide/guide.ts) and leaving out what the player has played. His
// words are fixed lines picked at random (lines.ts): no AI yet. A trial, to be kept or not (kozka, 23 October 2026).
// Not in Valkyrie.
import { useEffect, useRef, useState } from 'react';
import { Game } from '@universalis/engine';
import butlerUrl from '../assets/igor/igor-butler.webp';
import buttonUrl from '../assets/igor/igor-button.webp';
import grinUrl from '../assets/igor/igor-grin.webp';
import smileUrl from '../assets/igor/igor-smile.webp';
import sternUrl from '../assets/igor/igor-stern.webp';
import { guideScenarios, guideText, hasGuide, type GuideScenario } from '../guide/guide.ts';
import { marksOf } from '../ui/marks.ts';
import { RemotePicture } from '../ui/Picture.tsx';
import { uni } from '../ui/text.ts';
import { igorLines, type IgorLines } from './lines.ts';
import newsFile from './news.json';
import { nextQuestion, OPTIONS, reasons, recommend, type Answers, type Player, type QuestionId } from './recommend.ts';
import './igor.css';

interface NewsItem {
  id: string;
  scenario?: string;
  from: string;
  until: string;
  text: Record<string, string>;
}

/** Today, as the news' dates are written. */
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** The news shown today, the newest first. */
function activeNews(): NewsItem[] {
  const now = today();
  return (newsFile.news as NewsItem[]).filter((n) => n.from <= now && now <= n.until).sort((a, b) => b.from.localeCompare(a.from));
}

/** The news the player has seen, kept in config.ini so that Igor does not greet with them twice. */
function seenNews(): Set<string> {
  return new Set((Game.game?.config.data.get('Universalis', 'igorSeen') ?? '').split(';').filter((id) => id !== ''));
}

function markSeen(id: string): void {
  const seen = seenNews();
  if (seen.has(id)) return;
  seen.add(id);
  const game = Game.get();
  game.config.data.add('Universalis', 'igorSeen', [...seen].join(';'));
  game.config.save();
}

/** Whether it is Halloween's season, when Igor says so. */
function halloween(): boolean {
  const d = new Date();
  return (d.getMonth() === 9 && d.getDate() >= 20) || (d.getMonth() === 10 && d.getDate() <= 2);
}

/** One of the lines, at random, never the one said just before when there is another. */
let lastSaid = '';
function pick(lines: readonly string[]): string {
  const choices = lines.length > 1 ? lines.filter((l) => l !== lastSaid) : lines;
  lastSaid = choices[Math.floor(Math.random() * choices.length)] ?? '';
  return lastSaid;
}

function player(): Player {
  const game = Game.get();
  return {
    played: (key) => marksOf(key).has('played'),
    packs: new Set(['MoMBase', ...game.config.getPacks(game.gameType.typeName())]),
    lang: game.currentLang,
  };
}

type Face = 'grin' | 'stern' | 'smile' | 'butler';
const FACES: Record<Face, string> = { grin: grinUrl, stern: sternUrl, smile: smileUrl, butler: butlerUrl };

/** A line of the conversation: Igor's or the player's. */
interface Said {
  who: 'igor' | 'you';
  text: string;
}

/** What Igor waits for now: the player's choice among these. */
type Step =
  | { kind: 'offer'; withNews: boolean; want: string; leave: string }
  | { kind: 'news'; item: NewsItem; leave: string }
  | { kind: 'ask'; question: QuestionId }
  | { kind: 'results'; picks: GuideScenario[] }
  | { kind: 'shown'; scenario: GuideScenario }
  | { kind: 'bye' };

/** An adventure Igor offers, with why it suits and the way to it. */
function Adventure({ scenario, answers, lines, lang, go }: { scenario: GuideScenario; answers: Answers; lines: IgorLines; lang: string; go: () => void }) {
  const { store } = scenario;
  const name = guideText(store.names, lang);
  const minutes = store.plays >= 10 && store.realLength ? store.realLength : (store.authorLength[1] ?? store.authorLength[0]);
  const why = [
    lines.why.players.replace('{0}', store.players[0] === store.players[1] ? String(store.players[0]) : `${store.players[0]}–${store.players[1]}`),
    ...(minutes ? [lines.why.minutes.replace('{0}', String(Math.round(minutes / 5) * 5))] : []),
    ...reasons(scenario, answers).flatMap((tag) => (lines.why.tags[tag] ? [lines.why.tags[tag]!] : [])),
  ];
  return (
    <article className="igor-adventure">
      <span className="igor-adventure-cover">
        {store.image !== '' && store.url !== '' && <RemotePicture url={store.url + store.image} name={name} decorative />}
      </span>
      <span className="igor-adventure-text">
        <span className="igor-adventure-name">
          {name}
          {scenario.tags.has('adult') && (
            <span className="adult-badge" role="img" aria-label={uni('ADULT_CONTENT')} title={uni('ADULT_CONTENT')}>
              +18
            </span>
          )}
        </span>
        <span className="igor-adventure-synopsis">{guideText(store.synopsis, lang)}</span>
        <span className="igor-adventure-why">{why.join(' · ')}</span>
        <button type="button" className="button primary igor-go" onClick={go}>
          {lines.goThere}
        </button>
      </span>
    </article>
  );
}

function IgorDialog({ close, go }: { close: () => void; go: (key: string) => void }) {
  const lang = Game.get().currentLang;
  const lines = igorLines(lang);
  const all = useRef(guideScenarios()).current;
  const news = activeNews();
  // The player's words for the offer, picked once for the step, so that the buttons do not change as they are drawn
  const offer = (withNews: boolean): Step => ({ kind: 'offer', withNews, want: pick(lines.wantAdventure), leave: pick(lines.wantNothing) });
  // The greeting, made once as the window opens (not in an effect, which React runs twice in development): his
  // welcome, a word on the season and on nothing, then the news not seen yet, or his offer
  const [opening] = useState(() => {
    const words = [pick(lines.greetings), ...(halloween() ? [pick(lines.halloween)] : []), pick(lines.smallTalk)];
    const fresh = news.find((n) => !seenNews().has(n.id));
    if (fresh !== undefined) {
      return {
        said: [...words, pick(lines.newsIntro).replace('{0}', guideText(fresh.text, lang))],
        step: { kind: 'news', item: fresh, leave: pick(lines.wantNothing) } as Step,
        face: 'butler' as Face,
      };
    }
    return { said: [...words, pick(lines.offer)], step: offer(news.length > 0), face: 'grin' as Face };
  });
  const [said, setSaid] = useState<Said[]>(() => opening.said.map((text) => ({ who: 'igor' as const, text })));
  const [step, setStep] = useState<Step>(opening.step);
  const [answers, setAnswers] = useState<Answers>({});
  const [face, setFace] = useState<Face>(opening.face);
  const log = useRef<HTMLDivElement>(null);

  const say = (...texts: string[]) => setSaid((now) => [...now, ...texts.map((text) => ({ who: 'igor' as const, text }))]);
  // The conversations are short: an answer clears what was said, and Igor's reply is all that shows (kozka, 23
  // October 2026). The player's words stay on their button
  const reply = (_text: string) => setSaid([]);

  // A new reply starts at the top
  useEffect(() => {
    log.current?.scrollTo({ top: 0 });
  }, [step]);

  const ask = (given: Answers) => {
    const question = nextQuestion(all, given, player());
    if (question === null) {
      const picks = recommend(all, given, player());
      say(pick(picks.length === 0 ? lines.resultsNone : picks.length < 3 ? lines.resultsFew : lines.results));
      setFace('smile');
      setStep({ kind: 'results', picks });
      return;
    }
    say(pick(lines.questions[question].ask));
    setFace('stern');
    setStep({ kind: 'ask', question });
  };

  const startQuestions = (text: string) => {
    reply(text);
    setAnswers({});
    say(pick(lines.beforeQuestions));
    ask({});
  };

  const answer = (question: QuestionId, option: string) => {
    reply(lines.questions[question].options[option]!);
    const ack = lines.acks[`${question}:${option}`];
    say(pick(ack !== undefined && Math.random() < 0.7 ? ack : lines.acks.any!));
    const given = { ...answers, [question]: option };
    setAnswers(given);
    ask(given);
  };

  const showNews = (item: NewsItem) => {
    markSeen(item.id);
    const scenario = item.scenario === undefined ? null : guideScenarios().find((s) => s.key === item.scenario) ?? null;
    if (scenario === null) {
      say(pick(lines.offer));
      setStep(offer(false));
      return;
    }
    setFace('smile');
    setStep({ kind: 'shown', scenario });
  };

  const goodbye = (text: string) => {
    reply(text);
    say(pick(lines.farewell));
    setFace('grin');
    setStep({ kind: 'bye' });
  };

  const choices: { text: string; act: () => void }[] = [];
  if (step.kind === 'offer') {
    const want = step.want;
    choices.push({ text: want, act: () => startQuestions(want) });
    if (step.withNews) {
      choices.push({
        text: lines.wantNews,
        act: () => {
          reply(lines.wantNews);
          const item = news[0]!;
          say(guideText(item.text, lang));
          showNews(item);
        },
      });
    }
  } else if (step.kind === 'news') {
    choices.push({ text: lines.newsMore, act: () => (reply(lines.newsMore), showNews(step.item)) });
    choices.push({ text: lines.newsOther, act: () => (markSeen(step.item.id), startQuestions(lines.newsOther)) });
  } else if (step.kind === 'ask') {
    for (const option of OPTIONS[step.question]) {
      choices.push({ text: lines.questions[step.question].options[option]!, act: () => answer(step.question, option) });
    }
  } else if (step.kind === 'results' || step.kind === 'shown') {
    choices.push({ text: lines.askAgain, act: () => startQuestions(lines.askAgain) });
  }
  if (step.kind !== 'bye' && step.kind !== 'ask') {
    const leave = step.kind === 'results' || step.kind === 'shown' ? lines.thanks : step.leave;
    choices.push({ text: leave, act: () => goodbye(leave) });
  }

  return (
    <div className="igor-layer" onKeyDown={(e) => e.key === 'Escape' && close()} onClick={(e) => e.target === e.currentTarget && close()}>
      <section className="igor-window" role="dialog" aria-modal="true" aria-labelledby="igor-title">
        <figure className="igor-portrait" aria-hidden="true">
          <img key={face} src={FACES[face]} alt="" draggable={false} />
        </figure>
        <div className="igor-talk">
          <h2 id="igor-title">Igor</h2>
          <div className="igor-log" ref={log} aria-live="polite">
            {said.map((line, i) => (
              <p key={i} className={`igor-line ${line.who}`}>
                {line.text}
              </p>
            ))}
            {step.kind === 'results' &&
              step.picks.map((s) => <Adventure key={s.key} scenario={s} answers={answers} lines={lines} lang={lang} go={() => go(s.key)} />)}
            {step.kind === 'shown' && <Adventure scenario={step.scenario} answers={{}} lines={lines} lang={lang} go={() => go(step.scenario.key)} />}
          </div>
          <div className="igor-choices">
            {choices.map((c) => (
              <button key={c.text} type="button" className="igor-choice" onClick={c.act}>
                {c.text}
              </button>
            ))}
            {step.kind === 'bye' && (
              <button type="button" className="igor-choice" autoFocus onClick={close}>
                {lines.close}
              </button>
            )}
          </div>
        </div>
        <button type="button" className="igor-close" aria-label={lines.close} onClick={close}>
          ×
        </button>
      </section>
    </div>
  );
}

/**
 * Igor's portrait at the bottom right, which opens his window; only where there is a guide (Mansions). go: what the
 * menu does to take the player to an adventure (the list, which then opens it).
 */
export function IgorButton({ go }: { go: (key: string) => void }) {
  const [open, setOpen] = useState(false);
  if (!hasGuide()) return null;
  const waiting = activeNews().some((n) => !seenNews().has(n.id));
  return (
    <>
      <button type="button" className="igor-button" data-news={waiting ? '' : undefined} aria-label={uni('IGOR_OPEN')} title={uni('IGOR_OPEN')} onClick={() => setOpen(true)}>
        <img src={buttonUrl} alt="" draggable={false} />
        <span className="igor-button-name">Igor</span>
      </button>
      {open && (
        <IgorDialog
          close={() => setOpen(false)}
          go={(key) => {
            setOpen(false);
            go(key);
          }}
        />
      )}
    </>
  );
}
