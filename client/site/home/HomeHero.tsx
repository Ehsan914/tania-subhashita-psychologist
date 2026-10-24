// Home hero: a full-bleed room with the headline on it. Scrolling pins the stage and
// walks into the room (design-demo/calm-elegant/site/assets/home.js, "hero").
import { useRef, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { ReactNode } from 'react';
import type { HomePage } from '../../context/SiteDataContext';
import { imageUrl } from '../../lib/sanity';
import { gsap, isMotionOff, ScrollTrigger, useGSAP } from '../motion';

const DEFAULT_PHOTO = '/images/room.jpg';
const DEFAULT_PHOTO_ALT = 'A quiet consulting room with linen curtains, a small wooden table, a chair and plants';
const FALLBACK = {
  titleLine1: 'A quiet room',
  titleLine2: 'to set it',
  titleLine3: 'down.',
  description: 'Compassionate, evidence-based therapy for anxiety, low mood, trauma and habits that have taken hold — in a calm room in New Eskaton, or online.',
  ctaPrimaryText: 'Book a free consult',
  ctaSecondaryText: 'What I help with',
};

// How long the pinned stage lasts, as a share of the viewport height.
const STAGE_END = { wide: '+=95%', narrow: '+=70%' };
const SCRUB_SMOOTHING = 0.6;
const PHOTO_WIDTH = 2000;

// The headline holds one block per row; italic (em) spans render as <em> by default.
const HEADLINE: PortableTextComponents = {
  block: { normal: ({ children }: { children?: ReactNode }) => <span className="l"><span>{children}</span></span> },
};

function FallbackHeadline() {
  return (
    <>
      <span className="l"><span>{FALLBACK.titleLine1}</span></span>
      <span className="l"><span>{FALLBACK.titleLine2} <em>{FALLBACK.titleLine3}</em></span></span>
    </>
  );
}

// Photo 1 → 1.24, headline 1 → 0.86, copy fades, the linen wash covers the room, then the
// photo goes. Scrubbed, so it reverses on the way back up. No pinning with motion off.
function useScrollStory(scope: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    const hero = scope.current;
    if (!hero || isMotionOff()) return;
    const q = gsap.utils.selector(hero);
    const mm = gsap.matchMedia();

    mm.add({ wide: '(min-width: 961px)', narrow: '(max-width: 960px)' }, (context) => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: context.conditions?.wide ? STAGE_END.wide : STAGE_END.narrow,
          pin: true,
          scrub: SCRUB_SMOOTHING,
          // the pin adds height above every later section, so measure it first
          refreshPriority: 1,
        },
      });
      tl.to(q('.photo'), { scale: 1.24, yPercent: -3 }, 0)
        .to(q('h1'), { scale: 0.86, y: () => -window.innerHeight * 0.04 }, 0)
        .to(q('.hero-fade'), { autoAlpha: 0, y: -24, duration: 0.35 }, 0.25)
        .to(q('.wash'), { opacity: 1, duration: 0.45 }, 0.55)
        .to(q('.photo'), { autoAlpha: 0, duration: 0.05 }, 0.95);
    });
    ScrollTrigger.refresh();

    return () => mm.revert();
  }, { scope });
}

export default function HomeHero({ home }: { home: HomePage | null }) {
  const ref = useRef<HTMLElement>(null);
  useScrollStory(ref);

  const photo = imageUrl(home?.heroImage, PHOTO_WIDTH);
  const headline = home?.heroHeadline;

  return (
    <section className="hero" aria-label="Introduction" ref={ref}>
      <div className="photo">
        {photo
          ? <img src={photo} alt={home?.heroImage?.alt ?? ''} />
          : <img src={DEFAULT_PHOTO} alt={DEFAULT_PHOTO_ALT} />}
      </div>
      <div className="shade" />
      <div className="wash" />
      <div className="copy wrap">
        <h1 className="display">
          {headline?.length ? <PortableText value={headline} components={HEADLINE} /> : <FallbackHeadline />}
        </h1>
        <div className="hero-fade">
          <p className="lede">{home?.heroIntro || FALLBACK.description}</p>
          <div className="actions">
            <Link className="btn" to="/book">
              {home?.heroPrimaryButton || FALLBACK.ctaPrimaryText} <span className="arrow" aria-hidden="true">→</span>
            </Link>
            <Link className="link" to="/services">{home?.heroSecondaryLink || FALLBACK.ctaSecondaryText}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
