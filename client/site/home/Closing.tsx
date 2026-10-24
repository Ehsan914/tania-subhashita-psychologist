import { Link } from 'react-router-dom';
import type { HomePage } from '../../context/SiteDataContext';
import { SplitWords } from '../motion';
import { accentTail } from './accent';

const FALLBACK = {
  heading: "Wherever you are right now, you don't have to stay there.",
  subtitle: 'The next chapter can start with one unhurried conversation, with no pressure to continue.',
  buttonText: 'Book a free consult',
};
const ACCENT_WORDS = 2;

export default function Closing({ home }: { home: HomePage | null }) {
  const subtitle = home ? home.ctaText : FALLBACK.subtitle;
  return (
    <section className="closing">
      <div className="wrap">
        <h2 className="h1" data-reveal="split">
          <SplitWords>{accentTail(home?.ctaHeadline || FALLBACK.heading, ACCENT_WORDS)}</SplitWords>
        </h2>
        {subtitle && <p className="lede" data-reveal="rise">{subtitle}</p>}
        <Link className="btn" to="/book" data-reveal="rise">
          {home?.ctaButton || FALLBACK.buttonText} <span className="arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
