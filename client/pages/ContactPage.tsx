import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSiteData } from '../context/SiteDataContext';
import { useReveal } from '../site/motion';
import { useContactDetails } from '../site/SiteChrome';
import { PageHead } from '../site/inner/PageHead';
import { ContactChannels } from '../site/inner/ContactChannels';
import { ContactForm } from '../site/inner/ContactForm';
import { ContactSent } from '../site/inner/ContactSent';
import { usePageMeta, useJsonLd } from '../hooks/usePageMeta';
import { useHydrated } from '../hooks/useHydrated';
import { pageGraph } from '../lib/schema';

type Sent = { name: string; fromForm: boolean } | null;

export default function ContactPage() {
  usePageMeta('Contact — Psychologist in New Eskaton, Dhaka | Tania Subhashita', 'Call, WhatsApp, email or visit MIND CARE in New Eskaton, Dhaka. Online sessions via Zoom and Google Meet anywhere in Bangladesh.');
  useJsonLd('page', pageGraph('ContactPage', '/contact', 'Contact', [{ name: 'Contact', path: '/contact' }]));
  const { contact } = useSiteData();
  const { email, phone } = useContactDetails();
  const [searchParams] = useSearchParams();
  const [sentForm, setSent] = useState<Sent>(null);
  // ?state=sent shows the confirmation directly, as in the design demo; it applies after
  // hydration, since the prerendered page cannot know the query string.
  const hydrated = useHydrated();
  const sent = sentForm ?? (hydrated && searchParams.get('state') === 'sent' ? { name: '', fromForm: false } : null);
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef, [contact]);

  return (
    <div ref={rootRef}>
      <PageHead
        eyebrow="Contact"
        title={<>Reaching out is the <em>hardest step.</em></>}
        lede="You've already started. Ask a question, or arrange a first conversation in whichever way feels easiest."
      />
      <section className="wrap contact-grid" style={{ paddingBottom: 'var(--section)' }}>
        <ContactChannels city={contact?.city ?? ''} />
        {/* the form hands the question to the visitor's email app, so it needs an address to write to */}
        {(sent || email) && (
          <div className="form-card" data-reveal="rise">
            {sent
              ? <ContactSent name={sent.name} phone={phone} focusOnMount={sent.fromForm} />
              : <ContactForm to={email} onSent={(name) => setSent({ name, fromForm: true })} />}
          </div>
        )}
      </section>
    </div>
  );
}
