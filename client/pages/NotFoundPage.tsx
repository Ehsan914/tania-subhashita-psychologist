// Any address the site does not have. The prerender writes this page as 404.html, which the
// host serves with a real 404 status, so search engines drop dead links instead of indexing them.
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

export default function NotFoundPage() {
  usePageMeta('Page not found — Tania Subhashita', 'This page could not be found.', { noindex: true });

  return (
    <article className="article" style={{ paddingBottom: 'var(--section)' }}>
      <header className="wrap page-head">
        <h1 className="h1">This page isn’t <em>here.</em></h1>
        <p className="lede" style={{ marginTop: 22 }}>
          It may have moved, or the link may be mistyped. You can start from the therapies, read the Journal, or simply get in touch.
        </p>
        <p style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 32 }}>
          <Link className="btn" to="/services">See the therapies <span className="arrow" aria-hidden="true">→</span></Link>
          <Link className="btn btn--ghost" to="/contact">Contact</Link>
        </p>
      </header>
    </article>
  );
}
