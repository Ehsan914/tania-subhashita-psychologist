// Admin shell from the design (admin/assets/admin.js): grouped sidebar, top bar with a
// breadcrumb, mobile drawer navigation and the shared toast/pending-count context.
import { Fragment, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminProvider, useAdmin } from './ui/AdminContext';
import { Icon, type IconName } from './ui/icons';
import { initials } from './ui/format';
import '../styles/admin.css';

type NavItem = { to: string; label: string; icon: IconName; badge?: boolean; end?: boolean };
type NavGroup = { group: string; items: NavItem[] };

export const ADMIN_NAV: NavGroup[] = [
  { group: 'Overview', items: [{ to: '/admin', label: 'Dashboard', icon: 'dash', end: true }] },
  {
    group: 'Clients',
    items: [
      { to: '/admin/appointments', label: 'Appointments', icon: 'cal', badge: true },
      { to: '/admin/booking-settings', label: 'Booking settings', icon: 'clock' },
    ],
  },
  {
    group: 'Website',
    items: [
      { to: '/admin/home', label: 'Home page', icon: 'home' },
      { to: '/admin/about', label: 'About page', icon: 'user' },
      { to: '/admin/services', label: 'Services', icon: 'heart' },
      { to: '/admin/programs', label: 'Programs', icon: 'layers' },
      { to: '/admin/blog', label: 'Journal posts', icon: 'pen' },
      { to: '/admin/testimonials', label: 'Testimonials', icon: 'quote' },
      { to: '/admin/faq', label: 'FAQs', icon: 'help' },
      { to: '/admin/gallery', label: 'Gallery', icon: 'image' },
      { to: '/admin/statistics', label: 'Statistics', icon: 'chart' },
      { to: '/admin/assessment', label: 'Self-check', icon: 'check' },
      { to: '/admin/contact', label: 'Contact info', icon: 'phone' },
    ],
  },
  {
    group: 'Settings',
    items: [
      { to: '/admin/settings', label: 'Site settings', icon: 'gear' },
      { to: '/admin/account', label: 'Account', icon: 'key' },
    ],
  },
];

// Pages whose content uses the wider column.
const WIDE_PAGES = ['/admin/appointments'];

function currentPage(pathname: string) {
  for (const { group, items } of ADMIN_NAV) {
    const item = items.find((i) => i.to === pathname.replace(/\/$/, ''));
    if (item) return { group, label: item.label };
  }
  return null;
}

function Sidebar() {
  const { user, logout } = useAuth();
  const { pendingCount } = useAdmin();
  const name = user?.name || user?.email || '';

  return (
    <aside className="side" id="side" aria-label="Admin navigation">
      <NavLink className="brand" to="/admin" end>
        <img src="/logo-pink.svg" alt="Tania Subhashita" /><span>Admin</span>
      </NavLink>
      <nav>
        {ADMIN_NAV.map(({ group, items }) => (
          <Fragment key={group}>
            <p className="group">{group}</p>
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>
                <Icon name={item.icon} /><span>{item.label}</span>
                {item.badge && pendingCount > 0 && (
                  <span className="badge" aria-label={`${pendingCount} pending`}>{pendingCount}</span>
                )}
              </NavLink>
            ))}
          </Fragment>
        ))}
      </nav>
      <div className="me">
        <span className="avatar">{user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initials(name)}</span>
        <div className="who"><strong>{user?.name}</strong><small>{user?.email}</small></div>
        <button className="icon-btn" type="button" title="Sign out" aria-label="Sign out" onClick={logout}>
          <Icon name="out" />
        </button>
      </div>
    </aside>
  );
}

function Shell() {
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();
  const page = currentPage(pathname);

  useEffect(() => setNavOpen(false), [pathname]);
  // opening the menu on a narrow screen takes focus into it
  useEffect(() => {
    if (navOpen) document.querySelector<HTMLElement>('#side nav a')?.focus();
  }, [navOpen]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setNavOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={navOpen ? 'nav-open' : undefined}>
      <Sidebar />
      <div className="scrim" onClick={() => setNavOpen(false)} />
      <header className="top">
        <button
          className="icon-btn menu" type="button" aria-label="Open menu" aria-controls="side"
          aria-expanded={navOpen} onClick={() => setNavOpen((open) => !open)}
        >
          <Icon name="menu" />
        </button>
        <p className="crumb">
          {page && page.group !== 'Overview' && <>{page.group} / </>}
          <b>{page?.label ?? 'Admin'}</b>
        </p>
        <span className="spacer" />
        <a className="abtn ghost sm" href="/" target="_blank" rel="noopener noreferrer"><Icon name="ext" />View site</a>
      </header>
      <main className="main">
        <div className={WIDE_PAGES.includes(pathname) ? 'inner wide' : 'inner'}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <div className="admin-app">
      <AdminProvider>
        <Shell />
      </AdminProvider>
    </div>
  );
}
