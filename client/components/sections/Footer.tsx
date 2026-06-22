import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';

const FOOTER_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/services', label: 'Therapies' },
  { path: '/programs', label: 'Programs' },
  { path: '/blog', label: 'Blog' },
  { path: '/contact', label: 'Contact' },
];

export default function Footer() {
  const { siteSettings } = useSiteData();

  const siteName = siteSettings?.siteName || 'Tania Subhashita';
  const siteTagline = siteSettings?.siteTagline || 'Psychologist · Mental Health Expert';

  return (
    <footer className="bg-[#1C4751] text-[#FAF4E2]/80 border-t border-[#FAF4E2]/10 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-[#FAF4E2]/10">
          <div>
            <span className="font-serif-cormorant text-2xl tracking-wide text-[#FAF4E2] block leading-tight">
              {siteName.toUpperCase()}
            </span>
            <span className="text-[10px] tracking-[0.2em] font-bold text-[#E4B24C] block uppercase mt-1">
              {siteTagline}
            </span>
          </div>

          <div className="flex flex-col items-start md:items-end gap-6">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-wider">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="hover:text-[#E4B24C]"
                  id={`foot-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center gap-5 text-[#FAF4E2]/60">
              <a href={siteSettings?.facebookUrl || '#'} className="hover:text-[#E4B24C] transition-colors transform hover:scale-110" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href={siteSettings?.instagramUrl || '#'} className="hover:text-[#E4B24C] transition-colors transform hover:scale-110" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={siteSettings?.linkedinUrl || '#'} className="hover:text-[#E4B24C] transition-colors transform hover:scale-110" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-6 text-xs text-[#FAF4E2]/70 leading-relaxed max-w-none">
          <div className="space-y-2 md:max-w-md text-left">
            <p>
              © {new Date().getFullYear()} {siteName} · Clinical Psychologist &amp; Counselor, Dhaka. All rights reserved.
            </p>
            <p className="text-[11px] text-[#FAF4E2]/50 italic">
              Sessions are completely non-judgmental, structured securely, and governed under strict psychiatric confidentiality standards.
            </p>
          </div>
          
          <div className="space-y-1.5 md:text-right text-left">
            <p className="font-semibold text-red-400 uppercase tracking-widest text-[10px]">🚨 In Acute Medical Crisis?</p>
            <p className="text-[11px]">
              Call the Government Hotline at <strong className="text-white">999</strong>, or dial Suicide Prevention Kaan Pete Roi at <span className="text-white">09612-119911</span> (3:00 PM to 3:00 AM).
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
