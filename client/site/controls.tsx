// Sliding-pill controls from the design: a segmented control and a chip filter that
// share one moving indicator (.thumb). Markup and classes match site.css.
import { Fragment, useId, useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';

// Moves the .thumb under the active item; `instant` skips the transition (first paint, resize).
function placeThumb(container: HTMLElement, active: HTMLElement | null, instant: boolean) {
  const thumb = container.querySelector<HTMLElement>(':scope > .thumb');
  if (!thumb || !active) return;
  if (instant) thumb.style.transition = 'none';
  thumb.style.width = `${active.offsetWidth}px`;
  thumb.style.height = `${active.offsetHeight}px`;
  thumb.style.top = '0px';
  thumb.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
  if (instant) requestAnimationFrame(() => { thumb.style.transition = ''; });
}

function useSlidingThumb(ref: RefObject<HTMLElement | null>, activeSelector: string, activeKey: string) {
  const firstPaint = useRef(true);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;
    const sync = (instant: boolean) => placeThumb(container, container.querySelector(activeSelector), instant);
    sync(firstPaint.current);
    firstPaint.current = false;
    const onResize = () => sync(true);
    window.addEventListener('resize', onResize);
    document.fonts?.ready.then(() => sync(true));
    return () => window.removeEventListener('resize', onResize);
  }, [ref, activeSelector, activeKey]);
}

export interface SegmentOption {
  value: string;
  label: ReactNode;
  sub?: ReactNode;
}

interface SegmentedProps {
  name: string;
  value: string;
  options: SegmentOption[];
  onChange: (value: string) => void;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export function Segmented({ name, value, options, onChange, className, ...aria }: SegmentedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useSlidingThumb(ref, 'input:checked + label', value);

  return (
    <div ref={ref} className={className ? `segmented ${className}` : 'segmented'} role="radiogroup" {...aria}>
      {options.map((option, i) => (
        <Fragment key={option.value}>
          <input
            type="radio" name={name} id={`${id}-${i}`} value={option.value}
            checked={option.value === value} onChange={() => onChange(option.value)}
          />
          <label htmlFor={`${id}-${i}`}>{option.label}{option.sub && <small>{option.sub}</small>}</label>
        </Fragment>
      ))}
      <span className="thumb" aria-hidden="true" />
    </div>
  );
}

interface ChipGroupProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}

export function ChipGroup({ options, value, onChange, label, className }: ChipGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  useSlidingThumb(ref, '.chip[aria-pressed="true"]', `${value}|${options.join('|')}`);

  return (
    <div ref={ref} className={className ? `chips ${className}` : 'chips'} role="group" aria-label={label}>
      <span className="thumb" aria-hidden="true" />
      {options.map((option) => (
        <button key={option} className="chip" type="button" aria-pressed={option === value} onClick={() => onChange(option)}>
          {option}
        </button>
      ))}
    </div>
  );
}
