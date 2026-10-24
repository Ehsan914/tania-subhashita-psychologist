// The live "Your request" panel; a line glows briefly when its value changes.
import { useLayoutEffect, useRef } from 'react';
import type { BookingChoice } from './booking';

function SummaryLine({ term, value }: { term: string; value: string }) {
  const ref = useRef<HTMLElement>(null);
  const shown = useRef(value);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || shown.current === value) return;
    shown.current = value;
    // .flash sets the tint without a transition; removing it two frames later fades it out.
    el.classList.add('flash');
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => el.classList.remove('flash'));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      el.classList.remove('flash');
    };
  }, [value]);

  return <div><dt>{term}</dt><dd ref={ref}>{value}</dd></div>;
}

export const CHOICE_LINES: [keyof BookingChoice, string][] = [
  ['service', 'Therapy'],
  ['session', 'Session'],
  ['format', 'Where'],
  ['day', 'Day'],
  ['time', 'Time'],
];

export function BookingSummary({ choice, isFree }: { choice: BookingChoice; isFree: boolean }) {
  return (
    <aside className="summary" aria-live="polite" data-reveal="rise">
      <h2>Your request</h2>
      <dl>
        {CHOICE_LINES.map(([key, term]) => <SummaryLine key={key} term={term} value={choice[key]} />)}
      </dl>
      <p className="free" hidden={!isFree}>
        <strong>The first 20 minutes are free</strong>A chance to talk and see whether we're a good fit.
      </p>
    </aside>
  );
}
