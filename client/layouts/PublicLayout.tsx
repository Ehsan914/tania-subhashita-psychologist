import { useEffect, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteDataProvider, useSiteData } from '../context/SiteDataContext';
import { useJsonLd } from '../hooks/usePageMeta';
import { siteGraph } from '../lib/schema';
import { CrisisHelp, SiteFooter, SiteHeader } from '../site/SiteChrome';
import '../styles/site.css';
import '../styles/home.css';
import '../styles/inner.css';
import '../styles/site-extras.css';

// The design's pages carry <body data-page="…">, and its CSS keys page-specific rules on it.
const PAGE_BY_SECTION: Record<string, string> = {
  '': 'home', about: 'about', services: 'therapies', programs: 'programs', blog: 'journal', contact: 'contact', book: 'book',
};

function useBodyPage() {
  const { pathname } = useLocation();
  const page = PAGE_BY_SECTION[pathname.split('/')[1] ?? ''];
  useEffect(() => {
    if (!page) return;
    document.body.dataset.page = page;
    return () => { delete document.body.dataset.page; };
  }, [page]);
}

function LoadingScreen() {
  return (
    <div className="site-loading" role="status" aria-label="Loading">
      <img src="/logo-pink.svg" alt="Tania Subhashita, Psychologist" />
      <span className="bar" aria-hidden="true" />
    </div>
  );
}

// A prerendered page arrives fully visible; an inline script in its <head> hides the
// [data-reveal] elements until the page's reveals have set their starting state, so
// nothing flashes in and then out. Layout effects run child-first, so by now they have.
function useReleaseReveals() {
  useLayoutEffect(() => {
    document.documentElement.classList.remove('reveal-pending');
  }, []);
}

function PublicContent() {
  const { loading, contact, general, home, about } = useSiteData();
  useBodyPage();
  useReleaseReveals();
  useJsonLd('site', loading ? null : siteGraph({ contact, general, home, about }));

  if (loading) return <LoadingScreen />;

  return (
    <div className="site-app">
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <SiteFooter />
      <CrisisHelp />
    </div>
  );
}

export default function PublicLayout() {
  return (
    <SiteDataProvider>
      <PublicContent />
    </SiteDataProvider>
  );
}
