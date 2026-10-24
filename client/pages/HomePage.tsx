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
import { usePageMeta, useJsonLd } from '../hooks/usePageMeta';
import { pageGraph } from '../lib/schema';

const TITLE = 'Psychologist in Dhaka & Online Counselling | Tania Subhashita';

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
  usePageMeta(TITLE, 'Confidential counselling with psychologist Tania Subhashita in New Eskaton, Dhaka, or online across Bangladesh, for anxiety, depression, trauma and addiction.');
  useJsonLd('page', pageGraph('WebPage', '/', TITLE, []));
  const rootRef = useRef<HTMLDivElement>(null);
  const { home, services, assessment, faqs } = useSiteData();
  const statements = assessment?.statements ?? [];

  useReveal(rootRef, [home, services, assessment, faqs]);
  useScrollToHash();

  return (
    <div ref={rootRef}>
      <HomeHero home={home} />
      <Welcome home={home} />
      {services.length > 0 && <Concerns services={services} />}
      <Approach home={home} />
      {home && home.stats.length > 0 && <Numbers stats={home.stats} />}
      {statements.length > 0 && <SelfCheck questions={statements} bands={assessment?.results ?? []} />}
      {home && home.testimonials.length > 0 && <Voices testimonials={home.testimonials} />}
      {home && home.galleryPhotos.length > 0 && <Moments images={home.galleryPhotos} />}
      {faqs.length > 0 && <Faq faqs={faqs} />}
      <Closing home={home} />
    </div>
  );
}
