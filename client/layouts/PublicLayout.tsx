import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteDataProvider, useSiteData } from '../context/SiteDataContext';
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

function PublicContent() {
  const { loading } = useSiteData();
  useBodyPage();

  if (loading) return <LoadingScreen />;

  return (
    <div className="site-app">
      <SiteHeader />
      <main>
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
