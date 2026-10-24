// Header, mobile menu, footer and crisis panel shared by every public page
// (design-demo/calm-elegant/site/assets/site.js).
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSiteData, type RichText } from '../context/SiteDataContext';
import { useHydrated } from '../hooks/useHydrated';
import { InlineSpan } from './RichText';
import { setScrollLocked } from './smoothScroll';

const SCROLLED_AT = 40;
const COMPACT_CRISIS_AT = 200;

export const NAV = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Therapies' },
  { to: '/programs', label: 'Programs' },
  { to: '/blog', label: 'Journal' },
  { to: '/contact', label: 'Contact' },
];

export function useContactDetails() {
  const { contact, general } = useSiteData();
  const phone = contact?.phone ?? '';
  return {
    clinic: contact?.practiceName ?? '',
    address: contact?.address ?? '',
    phone,
    phoneHref: phone.replace(/[^\d+]/g, ''),
    email: contact?.email ?? '',
    hours: contact?.openingHours ?? '',
    facebook: general?.facebookUrl ?? '',
    linkedin: general?.linkedinUrl ?? '',
  };
}

// True once the page is scrolled past px. State flips only at the threshold, not on every scroll event.
function useScrolledPast(px: number) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > px);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [px]);
  return past;
}

// The design's layout assumes an 84px fixed header. While the announcement sits on top of it,
// its height (which grows as the text wraps) is published as --announce-h so the layout moves down by it.
function AnnouncementBar({ text, onDismiss }: { text: RichText; onDismiss: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => root.style.setProperty('--announce-h', `${el.offsetHeight}px`));
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--announce-h');
    };
  }, []);

  return (
    <div className="announce" ref={ref}>
      <InlineSpan value={text} />
      <button className="close" type="button" aria-label="Dismiss announcement" onClick={onDismiss}>×</button>
    </div>
  );
}

// The announcement from General settings, shown above the header until dismissed for the visit.
function Announcement() {
  const { general } = useSiteData();
  const [dismissed, setDismissed] = useState(false);
  const text = general?.announcement;
  if (dismissed || !general?.isAnnouncementVisible || !text?.length) return null;
  return <AnnouncementBar text={text} onDismiss={() => setDismissed(true)} />;
}

function NavLinks() {
  return NAV.map((n) => (
    <li key={n.to}><NavLink to={n.to} end={n.to === '/'}>{n.label}</NavLink></li>
  ));
}

export function SiteHeader() {
  const scrolled = useScrolledPast(SCROLLED_AT);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const contact = useContactDetails();

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    setScrollLocked(menuOpen);
    return () => {
      document.body.classList.remove('menu-open');
      setScrollLocked(false);
    };
  }, [menuOpen]);

  return (
    <>
      <header className={scrolled ? 'site-header is-scrolled' : 'site-header'}>
        <Announcement />
        <div className="wrap bar">
          <Link className="brand" to="/">
            <img src="/logo-pink.svg" alt="Tania Subhashita, Psychologist" width={414} height={73} />
          </Link>
          <nav aria-label="Main"><ul><NavLinks /></ul></nav>
          <Link className="book" to="/book">Book a free consult</Link>
          <button
            className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen((open) => !open)}
          >
            <span /><span />
          </button>
        </div>
      </header>
      <div className="mobile-menu" id="mobile-menu">
        <ul>
          <NavLinks />
          <li><NavLink to="/book">Book a free consult</NavLink></li>
        </ul>
        {contact.clinic && <p className="meta">{contact.clinic}, New Eskaton{contact.phone && ` · ${contact.phone}`}</p>}
      </div>
    </>
  );
}

export function SiteFooter() {
  const { general } = useSiteData();
  const contact = useContactDetails();
  // the year comes from the visitor's clock, not the build's, so it waits for hydration
  const hydrated = useHydrated();
  const [first, ...rest] = (general?.siteName || 'Tania Subhashita').split(' ');

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="top">
          <div>
            <p className="sign">{first} {rest.length > 0 && <em>{rest.join(' ')}</em>}</p>
            <p style={{ marginTop: 14 }}>Psychologist &amp; counsellor<br />Dhaka and online</p>
          </div>
          <div>
            <h2>Visit</h2>
            <address>{contact.clinic}<br />{contact.address}</address>
          </div>
          <div>
            <h2>Reach me</h2>
            <ul>
              {contact.phone && <li><a href={`tel:${contact.phoneHref}`}>{contact.phone}</a></li>}
              {contact.email && <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>}
              {contact.hours && <li>{contact.hours}</li>}
              <li>Online via Zoom or Google Meet</li>
              {(contact.facebook || contact.linkedin) && (
                <li>
                  {contact.facebook && <a href={contact.facebook} target="_blank" rel="noopener noreferrer">Facebook ↗</a>}
                  {contact.facebook && contact.linkedin && ' · '}
                  {contact.linkedin && <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>}
                </li>
              )}
            </ul>
          </div>
          <div>
            <h2>In a crisis</h2>
            <p className="crisis">
              Call <strong>999</strong>, or Kaan Pete Roi on{' '}
              <a href="tel:09612119911"><strong className="nowrap">09612-119911</strong></a> (3 pm – 3 am).
            </p>
          </div>
        </div>
        <div className="bottom">
          <p>© {hydrated && `${new Date().getFullYear()} `}Tania Subhashita · Psychologist &amp; counsellor, Dhaka</p>
          <p>
            {NAV.map((n, i) => (
              <span key={n.to}>{i > 0 && ' · '}<Link to={n.to}>{n.label}</Link></span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}

// Crisis helplines stay one tap away on every page.
export function CrisisHelp() {
  const compact = useScrolledPast(COMPACT_CRISIS_AT);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const classes = ['crisis-help', compact && 'is-compact', open && 'is-open'].filter(Boolean).join(' ');

  return (
    <div className={classes} ref={ref}>
      <div className="panel" id="crisis-panel" role="dialog" aria-label="Crisis helplines">
        <h3>If you're in danger right now</h3>
        <p>If you or someone close to you might act on thoughts of self-harm, please reach out now. Help is private and immediate.</p>
        <dl>
          <div><dt>Emergency services</dt><dd><a href="tel:999">999</a></dd></div>
          <div>
            <dt>Kaan Pete Roi<small>Suicide prevention · 3 pm – 3 am daily</small></dt>
            <dd><a href="tel:09612119911">09612-119911</a></dd>
          </div>
        </dl>
      </div>
      <button
        className="toggle" type="button" aria-expanded={open} aria-controls="crisis-panel"
        aria-label="Need help now? Crisis helplines" onClick={() => setOpen((o) => !o)}
      >
        <span className="dot" aria-hidden="true" />
        <span className="label"><span className="long">Need help now?</span><span className="short">Help now</span></span>
      </button>
    </div>
  );
}
