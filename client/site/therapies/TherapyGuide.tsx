// "Help me choose": first what feels closest (the areas), then the kind of help in that
// area. Tapping a row books it (design: therapies.js, choose()).
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import type { ProgramData, ServiceData } from '../../context/SiteDataContext';
import { isMotionOff } from '../motion';
import { AREA_COPY } from './therapyData';
import { TherapyRow } from './TherapyItems';

const ARROW_STEP: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

interface AreaPickerProps {
  areas: string[];
  value: string | null;
  onChoose: (area: string) => void;
}

// Arrow keys move between the choices, as in any radio group.
function AreaPicker({ areas, value, onChoose }: AreaPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = ARROW_STEP[e.key];
    if (!step || !ref.current) return;
    const buttons = [...ref.current.querySelectorAll<HTMLButtonElement>('.area')];
    const i = buttons.findIndex((b) => b === document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    buttons[(i + step + buttons.length) % buttons.length].focus();
  };

  return (
    <div className="areas" id="areas" role="radiogroup" aria-labelledby="step-1" ref={ref} onKeyDown={onKeyDown}>
      {areas.map((area) => {
        const copy = AREA_COPY.get(area);
        return (
          <button key={area} type="button" className="area" role="radio" aria-checked={area === value} onClick={() => onChoose(area)}>
            <span className="dot" aria-hidden="true" />
            <span className="txt"><strong>{copy?.feel ?? area}</strong><small>{copy?.line ?? ''}</small></span>
          </button>
        );
      })}
    </div>
  );
}

interface TherapyGuideProps {
  areas: string[];
  area: string | null;
  services: ServiceData[];
  programFor: Map<string, ProgramData>;
  targetSlug: string | null;
  onChoose: (area: string) => void;
}

export function TherapyGuide({ areas, area, services, programFor, targetSlug, onChoose }: TherapyGuideProps) {
  const step2Ref = useRef<HTMLHeadingElement>(null);
  // counts taps on an area, so choosing (even the same area again) brings step 2 into view
  const [chosen, setChosen] = useState(0);

  const choose = (next: string) => {
    onChoose(next);
    setChosen((n) => n + 1);
  };

  useEffect(() => {
    if (!chosen) return;
    step2Ref.current?.scrollIntoView({ behavior: isMotionOff() ? 'auto' : 'smooth', block: 'start' });
    step2Ref.current?.focus({ preventScroll: true });
  }, [chosen]);

  // arriving with #<slug>: bring that therapy's row to the middle of the screen
  useEffect(() => {
    if (!targetSlug) return;
    const frame = requestAnimationFrame(() => document.getElementById(targetSlug)?.scrollIntoView({ block: 'center' }));
    return () => cancelAnimationFrame(frame);
  }, [targetSlug]);

  const rows = area ? services.filter((s) => s.category === area) : [];

  return (
    <div className="guide" id="guide">
      <h2 className="calm-step" id="step-1"><span>1</span>What feels closest right now?</h2>
      <AreaPicker areas={areas} value={area} onChoose={choose} />
      <Link className="unsure" to="/book">
        <span><strong>I'm not sure</strong>That's completely fine. A free 20-minute conversation helps us find it together.</span>
        <span className="arrow" aria-hidden="true">→</span>
      </Link>

      {area && (
        <div className="pick" id="pick">
          <h2 className="calm-step" id="step-2" tabIndex={-1} ref={step2Ref}><span>2</span><em id="pick-title">Which of these sounds like you?</em></h2>
          <ul className="services" id="services" aria-labelledby="step-2">
            {rows.map((s, i) => (
              <TherapyRow key={s.slug} service={s} index={i} program={programFor.get(s.slug)} isTarget={s.slug === targetSlug} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
