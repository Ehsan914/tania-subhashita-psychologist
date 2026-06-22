import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X, Menu } from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/services', label: 'Therapies' },
  { path: '/programs', label: 'Programs' },
  { path: '/blog', label: 'Blog' },
  { path: '/contact', label: 'Contact' },
];

const MOBILE_NAV_LABELS: Record<string, string> = {
  '/': 'Home',
  '/about': 'About Subhashita',
  '/services': '26 Healing Therapies',
  '/programs': 'Coping Programs',
  '/blog': 'Read Articles',
  '/contact': 'Contact Office',
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const { siteSettings } = useSiteData();

  const navigateTo = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header id="header" className="sticky top-0 z-40 bg-[#FAF4E2]/90 backdrop-blur-md border-b border-[#1C4751]/10 px-4 py-3 sm:py-4 transition duration-350">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Logo Brand */}
        <Link 
          to="/" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-left group focus:outline-none"
          id="logo-brand-btn"
        >
          <span className="font-serif-cormorant text-[clamp(1.125rem,3vw,1.5rem)] font-medium tracking-wide text-[#1C4751] group-hover:text-[#4F8E99] transition duration-300 block leading-tight">
            {(siteSettings?.siteName || 'TANIA SUBHASHITA').toUpperCase()}
          </span>
          <span className="text-[clamp(0.45rem,1.5vw,0.6rem)] tracking-[0.24em] font-bold text-[#5C6A6C] block uppercase mt-0.5">
            {siteSettings?.siteTagline || 'Psychologist · Mental Health Expert'}
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-xs uppercase tracking-widest font-semibold transition-all relative py-1 ${currentPath === link.path ? 'text-[#1C4751] font-bold border-b-2 border-[#E4B24C]' : 'text-[#5C6A6C] hover:text-[#1C4751]'}`}
              id={`nav-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Booking Button (Primary CTA) */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/book"
            className="bg-[#E4B24C] hover:bg-[#FAF4E2] hover:text-[#C9923A] border-2 border-[#E4B24C] text-[#3A2C0A] text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded transition duration-200 shadow-sm"
            id="header-cta-book"
          >
            Book Now
          </Link>
        </div>

        {/* Toggle Mobile Menu */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden text-[#1C4751] p-1 cursor-pointer focus:outline-none"
          aria-label="Toggle menu"
          id="mobile-menu-toggle"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Panel */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#FAF4E2] border-b border-[#1C4751]/12 py-6 px-6 flex flex-col gap-4 animate-fade-in shadow-lg">
          {NAV_LINKS.map((link) => (
            <button 
              key={link.path}
              onClick={() => navigateTo(link.path)} 
              className={`text-sm text-left uppercase tracking-widest font-semibold py-2 ${currentPath === link.path ? 'text-[#1C4751] border-l-2 border-[#E4B24C] pl-2 font-bold' : 'text-[#5C6A6C]'}`}
              id={`mobile-nav-${link.label.toLowerCase()}`}
            >
              {MOBILE_NAV_LABELS[link.path] || link.label}
            </button>
          ))}
          <button
            onClick={() => navigateTo('/book')}
            className="bg-[#1C4751] text-[#FAF4E2] text-xs font-bold uppercase tracking-widest py-3 px-5 rounded text-center block mt-3"
            id="mobile-cta-book"
          >
            Book an Appointment
          </button>
        </div>
      )}
    </header>
  );
}
