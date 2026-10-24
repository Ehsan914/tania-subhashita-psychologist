// "Beyond the therapy room": one large photo at a time with arrows, thumbnails, swipe and
// auto-advance. Each photo is shown whole over a blurred copy of itself, so portrait and
// landscape shots both fill the stage. Works for any number of photos.
import {
  useEffect, useRef, useState,
  type Dispatch, type KeyboardEvent, type PointerEvent, type RefObject, type SetStateAction,
} from 'react';
import type { GalleryPhoto } from '../../context/SiteDataContext';
import { imageUrl } from '../../lib/sanity';
import { isMotionOff, SplitWords } from '../motion';

const AUTO_MS = 5000;
const SWIPE_MIN_PX = 40;
const ON_SCREEN_THRESHOLD = 0.4;
const STAGE_WIDTH = 1600;
const BACKDROP_WIDTH = 400;
const THUMB_WIDTH = 240;

// Auto-advance, paused on hover, on focus, while off screen, and with reduced motion.
function useAutoAdvance(
  slider: RefObject<HTMLDivElement | null>,
  bar: RefObject<HTMLElement | null>,
  current: number,
  count: number,
  setCurrent: Dispatch<SetStateAction<number>>,
) {
  const [motionOff] = useState(isMotionOff);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [away, setAway] = useState(true);
  const paused = motionOff || hovered || focused || away || count < 2;

  useEffect(() => {
    const el = slider.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setAway(!entry.isIntersecting), { threshold: ON_SCREEN_THRESHOLD });
    observer.observe(el);
    return () => observer.disconnect();
  }, [slider]);

  // restart the progress bar and the timer whenever the photo or the pause state changes
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetWidth;
    if (paused) return;
    el.style.animation = `slide-progress ${AUTO_MS}ms linear forwards`;
    const timer = window.setTimeout(() => setCurrent((c) => ((c % count) + 1) % count), AUTO_MS);
    return () => window.clearTimeout(timer);
  }, [bar, current, count, paused, setCurrent]);

  return { paused, setHovered, setFocused };
}

export default function Moments({ images }: { images: GalleryPhoto[] }) {
  const count = images.length;
  const [current, setCurrent] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<number | null>(null);

  const index = current % count;
  const show = (n: number) => setCurrent(((n % count) + count) % count);
  const { paused, setHovered, setFocused } = useAutoAdvance(sliderRef, barRef, index, count, setCurrent);

  // keep the active thumbnail visible by scrolling the strip only, never the page
  useEffect(() => {
    const strip = thumbsRef.current;
    const thumb = strip?.children[index] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    strip.scrollTo({ left: thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2, behavior: 'smooth' });
  }, [index]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
  };
  const onPointerDown = (e: PointerEvent) => { if (e.pointerType !== 'mouse') swipeStart.current = e.clientX; };
  const onPointerUp = (e: PointerEvent) => {
    if (swipeStart.current === null) return;
    const dx = e.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) > SWIPE_MIN_PX) show(index + (dx < 0 ? 1 : -1));
  };

  return (
    <section className="section moments">
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow" data-reveal="rise">Workshops &amp; conferences</p>
            <h2 className="h2" data-reveal="split" style={{ marginTop: 22 }}>
              <SplitWords>Beyond the <em>therapy room.</em></SplitWords>
            </h2>
          </div>
          <p className="lede" data-reveal="rise">
            Training, teaching and awareness work in Dhaka and beyond, all of which feeds back into the sessions.
          </p>
        </div>
        <div
          className={paused ? 'slider is-paused' : 'slider'} id="gallery" ref={sliderRef}
          role="region" aria-roledescription="carousel" aria-label="Workshops and conferences" tabIndex={0}
          data-reveal="rise"
          onKeyDown={onKeyDown}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false); }}
        >
          <div className="stage" id="g-stage" aria-live="polite" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
            {images.map((g, i) => (
              <figure key={g._key} className={i === index ? 'slide is-on' : 'slide'} aria-hidden={i !== index}>
                {/* the backdrop is blurred, so a small copy looks the same */}
                <img className="backdrop" src={imageUrl(g, BACKDROP_WIDTH)} alt="" aria-hidden="true" loading={i ? 'lazy' : undefined} />
                <img className="photo" src={imageUrl(g, STAGE_WIDTH)} alt={g.alt} loading={i ? 'lazy' : undefined} />
              </figure>
            ))}
          </div>
          <button className="nav prev" type="button" aria-label="Previous photo" onClick={() => show(index - 1)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button className="nav next" type="button" aria-label="Next photo" onClick={() => show(index + 1)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
          </button>
          <div className="progress" aria-hidden="true"><i ref={barRef} /></div>
        </div>
        <div className="slider-foot">
          <p className="caption" id="g-caption">{images[index].alt}</p>
          <p className="count" id="g-count" aria-hidden="true">{index + 1} / {count}</p>
        </div>
        <div className="thumbs" id="g-thumbs" role="tablist" aria-label="Choose a photo" ref={thumbsRef}>
          {images.map((g, i) => (
            <button
              key={g._key} type="button" role="tab" aria-selected={i === index}
              aria-label={`Photo ${i + 1}: ${g.alt}`} onClick={() => show(i)}
            >
              <img src={imageUrl(g, THUMB_WIDTH)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
