// Any address the site does not have. The prerender writes this page as 404.html, which the
// host serves with a real 404 status, so search engines drop dead links instead of indexing them.
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '../site/motion';
import { PageHead } from '../site/inner/PageHead';
import { usePageMeta } from '../hooks/usePageMeta';

export default function NotFoundPage() {
  usePageMeta('Page not found — Tania Subhashita', 'This page could not be found.', { noindex: true });
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef);

  return (
    <div ref={rootRef}>
      <PageHead
        eyebrow="Page not found"
        title={<>This page isn’t <em>here.</em></>}
        lede="It may have moved, or the link may be mistyped. You can start from the therapies, read the Journal, or simply get in touch."
      />
      <section className="wrap" style={{ paddingBottom: 'var(--section)' }}>
        <p style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }} data-reveal="rise">
          <Link className="btn" to="/services">See the therapies <span className="arrow" aria-hidden="true">→</span></Link>
          <Link className="btn btn--ghost" to="/contact">Contact</Link>
        </p>
      </section>
    </div>
  );
}
