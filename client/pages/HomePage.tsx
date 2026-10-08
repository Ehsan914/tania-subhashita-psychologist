// Home page (design-demo/calm-elegant/site/index.html + assets/home.js).
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteData } from '../context/SiteDataContext';
import { useReveal } from '../site/motion';
import HomeHero from '../site/home/HomeHero';
import Welcome from '../site/home/Welcome';
import Concerns from '../site/home/Concerns';
import Approach from '../site/home/Approach';
import Numbers from '../site/home/Numbers';
import SelfCheck from '../site/home/SelfCheck';
import Voices from '../site/home/Voices';
import Moments from '../site/home/Moments';
import Faq from '../site/home/Faq';
import Closing from '../site/home/Closing';
import { usePageMeta } from '../hooks/usePageMeta';

// Links such as /#check land on their section once the page (and the hero pin) is laid out.
function useScrollToHash() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
    });
    return () => cancelAnimationFrame(frame);
  }, [hash]);
}

export default function HomePage() {
  usePageMeta('Tania Subhashita — Psychologist in Dhaka & online', 'Compassionate, evidence-based therapy for anxiety, low mood, trauma and addictive habits with psychologist Tania Subhashita, in New Eskaton, Dhaka, and online.');
  const rootRef = useRef<HTMLDivElement>(null);
  const {
    hero, welcome, services, methodologyQuote, methodologySteps, statistics,
    assessmentQuestions, scoreBands, testimonials, gallery, faqs, cta,
  } = useSiteData();

  useReveal(rootRef, [
    hero, welcome, services, methodologyQuote, methodologySteps, statistics,
    assessmentQuestions, testimonials, gallery, faqs, cta,
  ]);
  useScrollToHash();

  return (
    <div ref={rootRef}>
      <HomeHero hero={hero} />
      <Welcome welcome={welcome} />
      {services.length > 0 && <Concerns services={services} />}
      <Approach quote={methodologyQuote} steps={methodologySteps} />
      {statistics.length > 0 && <Numbers statistics={statistics} />}
      {assessmentQuestions.length > 0 && <SelfCheck questions={assessmentQuestions} bands={scoreBands} />}
      {testimonials.length > 0 && <Voices testimonials={testimonials} />}
      {gallery.length > 0 && <Moments images={gallery} />}
      {faqs.length > 0 && <Faq faqs={faqs} />}
      <Closing cta={cta} />
    </div>
  );
}
