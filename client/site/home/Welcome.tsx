import { Link } from 'react-router-dom';
import type { WelcomeData } from '../../context/SiteDataContext';
import { sanitizeHtml } from '../../lib/sanitizeHtml';
import { SplitWords } from '../motion';
import { accentTail } from './accent';

const DEFAULT_PORTRAIT = '/images/warm-editorial-portrait-in-mauve-saree.png';
const FALLBACK_NAME = 'Tania Subhashita';
const FALLBACK_HEADING = 'You do not have to carry it on your own.';
const ACCENT_WORDS = 3;

function Html({ as: Tag, html }: { as: 'p' | 'span'; html: string }) {
  return <Tag dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}

export default function Welcome({ welcome }: { welcome: WelcomeData | null }) {
  const name = welcome?.credentialName || FALLBACK_NAME;
  const paragraphs = [welcome?.paragraph1, welcome?.paragraph2].filter((p): p is string => Boolean(p));

  return (
    <section className="section welcome">
      <div className="wrap grid">
        <figure data-reveal="mask">
          <img src={welcome?.portraitImageUrl || DEFAULT_PORTRAIT} alt={`${name}, psychologist`} loading="lazy" />
        </figure>
        <div>
          <p className="eyebrow" data-reveal="rise">{welcome?.scriptTitle || 'Welcome'}</p>
          <h2 className="h2" data-reveal="split">
            <SplitWords>{accentTail(welcome?.heading || FALLBACK_HEADING, ACCENT_WORDS)}</SplitWords>
          </h2>
          {paragraphs.length > 0 && (
            <div className="prose" data-reveal="rise">
              {paragraphs.map((p, i) => <Html key={i} as="p" html={p} />)}
            </div>
          )}
          <div className="sig" data-reveal="rise">
            <div>
              <strong>{name}</strong>
              {welcome?.credentialTitle && <Html as="span" html={welcome.credentialTitle} />}
            </div>
            <Link className="link" to="/about">More about me</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
