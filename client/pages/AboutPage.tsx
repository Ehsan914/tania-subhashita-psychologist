import { useRef } from 'react';
import { useSiteData } from '../context/SiteDataContext';
import { useReveal } from '../site/motion';
import { PageHead } from '../site/inner/PageHead';
import { AboutBio } from '../site/inner/AboutBio';
import { Credentials } from '../site/inner/Credentials';
import { CtaBand } from '../site/inner/CtaBand';
import { usePageMeta, useJsonLd } from '../hooks/usePageMeta';
import { pageGraph, personRef } from '../lib/schema';

// "Meet Tania Subhashita" → "Meet Tania <em>Subhashita.</em>", as the design sets it.
function emphasiseLastWord(text: string) {
  const words = text.trim().split(/\s+/);
  const last = words.pop() ?? '';
  const ending = /[.!?]$/.test(last) ? last : `${last}.`;
  return <>{words.join(' ')} <em>{ending}</em></>;
}

export default function AboutPage() {
  usePageMeta('About Tania Subhashita — Psychologist in Dhaka', "Tania Subhashita holds Honours and Master's degrees in Psychology and a Professional Master's in Clinical Social Work from the University of Dhaka.");
  useJsonLd('page', pageGraph('ProfilePage', '/about', 'About Tania Subhashita', [{ name: 'About', path: '/about' }], [], personRef));
  const { about } = useSiteData();
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef, [about]);

  return (
    <div ref={rootRef}>
      <PageHead
        eyebrow={about?.eyebrow || 'About'}
        title={emphasiseLastWord(about?.headline || 'Meet Tania Subhashita')}
        lede="Psychologist and clinical psycho-social counselor in Dhaka, helping people heal, grow and thrive."
      />
      <AboutBio about={about} />
      <Credentials credentials={about?.credentials ?? []} />
      <CtaBand
        title={<>Let&rsquo;s see if we&rsquo;re a <em>good fit.</em></>}
        lede="A free 20-minute conversation, in person or online, with no obligation to continue."
      />
    </div>
  );
}
