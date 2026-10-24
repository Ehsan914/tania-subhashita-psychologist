// "How has this week felt?": tick statements, then the answers become bars that fill one
// by one, followed by a plain-language reading. Nothing is saved or sent.
// `?state=result&score=4#check` opens straight on a result (design review switch).
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { AssessmentResult, Statement } from '../../context/SiteDataContext';
import { SplitWords } from '../motion';

const URL_DEFAULT_SCORE = 4;

function scoreFromUrl(params: URLSearchParams, total: number): number | null {
  if (params.get('state') !== 'result') return null;
  const score = Number(params.get('score') ?? URL_DEFAULT_SCORE);
  return Math.min(total, Math.max(0, Number.isNaN(score) ? URL_DEFAULT_SCORE : Math.round(score)));
}

const tickedLabel = (n: number, total: number) => (n ? `${n} of ${total} ticked` : 'Nothing ticked yet');

interface StatementsProps {
  questions: Statement[];
  ticked: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onScore: () => void;
}

function Statements({ questions, ticked, onToggle, onScore }: StatementsProps) {
  return (
    <div>
      <ul className="statements">
        {questions.map((q, i) => (
          <li key={q._key}>
            <label className="row">
              <span className="tick">
                <input type="checkbox" name={`q${i}`} checked={ticked.has(q._key)} onChange={() => onToggle(q._key)} />
                <span className="box" />
                <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7" /></svg>
              </span>
              <span className="text">{q.text}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="foot">
        <span className="count" aria-live="polite">{tickedLabel(ticked.size, questions.length)}</span>
        <button className="btn" type="button" onClick={onScore}>
          See what this suggests <span className="arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

interface ResultProps {
  score: number;
  total: number;
  bands: AssessmentResult[]; // ordered by fromScore (SITE_QUERY)
  focusOnShow: boolean;
  onReset: () => void;
}

function Result({ score, total, bands, focusOnShow, onReset }: ResultProps) {
  const [lit, setLit] = useState(false);
  const bandRef = useRef<HTMLHeadingElement>(null);
  const band = bands.find((b) => score >= b.fromScore && score <= b.toScore);
  const isHighest = band !== undefined && band === bands.at(-1);

  // light the bars a frame after they render, so their staggered transition plays
  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setLit(true)); });
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner); };
  }, []);

  useEffect(() => {
    if (focusOnShow) bandRef.current?.focus({ preventScroll: true });
  }, [focusOnShow]);

  return (
    <div className="result">
      <div className="meter" role="img" aria-label={`${score} of ${total} statements ticked`} style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
        {Array.from({ length: total }, (_, i) => (
          <i key={i} className={lit && i < score ? 'on' : undefined} style={{ '--i': i } as CSSProperties} />
        ))}
      </div>
      <p className="meter-label">{score} of {total} sound like this week</p>
      {band && <h3 className="band" tabIndex={-1} ref={bandRef}>{band.headline}</h3>}
      {band?.message && <p className="message">{band.message}</p>}
      {isHighest && (
        <p className="crisis-line">
          If you are having thoughts of harming yourself, please call <a href="tel:999">999</a> or Kaan Pete Roi on{' '}
          <a className="nowrap" href="tel:09612119911">09612-119911</a> now.
        </p>
      )}
      <div className="actions">
        <Link className="btn" to="/book">Book a free consult <span className="arrow" aria-hidden="true">→</span></Link>
        <button className="link" type="button" onClick={onReset}>Start again</button>
      </div>
    </div>
  );
}

interface SelfCheckProps {
  questions: Statement[];
  bands: AssessmentResult[];
}

export default function SelfCheck({ questions, bands }: SelfCheckProps) {
  const [searchParams] = useSearchParams();
  const total = questions.length;
  const [score, setScore] = useState<number | null>(() => scoreFromUrl(searchParams, total));
  const [scoredByVisitor, setScoredByVisitor] = useState(false);
  const [ticked, setTicked] = useState<ReadonlySet<string>>(() => new Set());

  const toggle = (id: string) => setTicked((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
  const showScore = () => { setScore(ticked.size); setScoredByVisitor(true); };
  const reset = () => { setTicked(new Set()); setScore(null); };

  return (
    <section className="section check" id="check">
      <div className="wrap layout">
        <div>
          <p className="eyebrow" data-reveal="rise">A gentle self-check</p>
          <h2 className="h2" data-reveal="split" style={{ marginTop: 22 }}>
            <SplitWords>How has this <em>week</em> felt?</SplitWords>
          </h2>
          <p className="lede" data-reveal="rise">
            Tick anything that sounds like the last seven days. It isn't a diagnosis — just a way to notice how much
            you're carrying. Nothing you tick is saved or sent.
          </p>
        </div>
        <div className="panel" id="check-panel" data-reveal="rise">
          {score === null
            ? <Statements questions={questions} ticked={ticked} onToggle={toggle} onScore={showScore} />
            : <Result score={score} total={total} bands={bands} focusOnShow={scoredByVisitor} onReset={reset} />}
        </div>
      </div>
    </section>
  );
}
