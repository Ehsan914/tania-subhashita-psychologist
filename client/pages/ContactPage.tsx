import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSiteData } from '../context/SiteDataContext';
import { useReveal } from '../site/motion';
import { useContactDetails } from '../site/SiteChrome';
import { PageHead } from '../site/inner/PageHead';
import { ContactChannels } from '../site/inner/ContactChannels';
import { ContactForm } from '../site/inner/ContactForm';
import { ContactSent } from '../site/inner/ContactSent';
import { usePageMeta } from '../hooks/usePageMeta';

type Sent = { name: string; fromForm: boolean } | null;

export default function ContactPage() {
  usePageMeta('Contact — Tania Subhashita, Psychologist', 'Call, WhatsApp, email or visit MIND CARE in New Eskaton, Dhaka. Online sessions via Zoom and Google Meet.');
  const { contact } = useSiteData();
  const { email, phone } = useContactDetails();
  const [searchParams] = useSearchParams();
  // ?state=sent shows the confirmation directly, as in the design demo.
  const [sent, setSent] = useState<Sent>(() => (searchParams.get('state') === 'sent' ? { name: '', fromForm: false } : null));
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
