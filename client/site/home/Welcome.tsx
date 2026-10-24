import { Link } from 'react-router-dom';
import type { HomePage } from '../../context/SiteDataContext';
import { imageUrl } from '../../lib/sanity';
import { InlineSpan, InlineText } from '../RichText';
import { SplitWords } from '../motion';
import { accentTail } from './accent';

const DEFAULT_PORTRAIT = '/images/warm-editorial-portrait-in-mauve-saree.png';
const FALLBACK_NAME = 'Tania Subhashita';
const FALLBACK_HEADING = 'You do not have to carry it on your own.';
const ACCENT_WORDS = 3;
const PORTRAIT_WIDTH = 1000;

export default function Welcome({ home }: { home: HomePage | null }) {
  const name = home?.welcomeSignatureName || FALLBACK_NAME;
  const body = home?.welcomeBody;
  const detail = home?.welcomeSignatureDetail;

  return (
    <section className="section welcome">
      <div className="wrap grid">
        <figure data-reveal="mask">
          <img
            src={imageUrl(home?.welcomeImage, PORTRAIT_WIDTH) ?? DEFAULT_PORTRAIT}
            alt={home?.welcomeImage?.alt || `${name}, psychologist`} loading="lazy"
          />
        </figure>
        <div>
          <p className="eyebrow" data-reveal="rise">{home?.welcomeEyebrow || 'Welcome'}</p>
          <h2 className="h2" data-reveal="split">
            <SplitWords>{accentTail(home?.welcomeHeadline || FALLBACK_HEADING, ACCENT_WORDS)}</SplitWords>
          </h2>
          {body && body.length > 0 && (
            <div className="prose" data-reveal="rise"><InlineText value={body} /></div>
          )}
          <div className="sig" data-reveal="rise">
            <div>
              <strong>{name}</strong>
              {detail && detail.length > 0 && <InlineSpan value={detail} />}
            </div>
            <Link className="link" to="/about">More about me</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
